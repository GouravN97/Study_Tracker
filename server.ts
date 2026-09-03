import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import JSZip from "jszip";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Initialize Gemini SDK with User-Agent header for telemetry
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Data file directory and path for persistent local file storage
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "study-tracker-data.json");
const ARCHIVES_DIR = path.join(DATA_DIR, "archives");

// Ensure data & archives folders exist
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ARCHIVES_DIR)) {
    fs.mkdirSync(ARCHIVES_DIR, { recursive: true });
  }
} catch (err) {
  console.error("Failed to create data/archives directory:", err);
}

// Server date helpers for weekly calculation
function getServerMondayOfCurrentWeek(d: Date = new Date()): Date {
  const date = new Date(d.getTime());
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getServerPreviousMondayMidnight(d: Date = new Date()): Date {
  const currentMonday = getServerMondayOfCurrentWeek(d);
  const prevMonday = new Date(currentMonday.getTime());
  prevMonday.setDate(prevMonday.getDate() - 7);
  prevMonday.setHours(0, 0, 0, 0);
  return prevMonday;
}

function getServerWeekId(d: Date = new Date()): string {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function getServerWeekRangeLabel(d: Date = new Date()): string {
  const monday = getServerMondayOfCurrentWeek(d);
  const sunday = new Date(monday.getTime());
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const startMonth = monday.toLocaleString("en-US", { month: "short" });
  const endMonth = sunday.toLocaleString("en-US", { month: "short" });
  const startDay = monday.getDate();
  const endDay = sunday.getDate();
  const year = sunday.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}

// Server-side Automatic Weekly Rollover & Archiving Engine
function performServerWeeklyRollover(force: boolean = false): boolean {
  try {
    if (!fs.existsSync(DATA_FILE)) return false;

    const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
    if (!fileContent.trim()) return false;

    const data = JSON.parse(fileContent);
    const settings = data.settings || {};
    const courses = Array.isArray(data.courses) ? data.courses : [];
    const currentWeekId = getServerWeekId(new Date());
    const lastResetWeekId = settings.lastResetWeekId;

    // If auto-reset is explicitly disabled and not forced, skip
    if (settings.autoResetMonday === false && !force) {
      return false;
    }

    // Check if we have entered a new week or if forced
    const isNewWeek = lastResetWeekId && lastResetWeekId !== currentWeekId;
    if (!isNewWeek && !force) {
      // If lastResetWeekId is not set yet, initialize it
      if (!lastResetWeekId) {
        data.settings = { ...settings, lastResetWeekId: currentWeekId };
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
      }
      return false;
    }

    const archiveWeekId = lastResetWeekId || getServerWeekId(getServerPreviousMondayMidnight());
    const archiveWeekLabel = getServerWeekRangeLabel(getServerPreviousMondayMidnight());

    console.log(`[AutoReset] Detected week rollover from ${archiveWeekId} to current week ${currentWeekId}. Archiving previous week data...`);

    // Calculate metrics for previous week
    const totalHours = courses.reduce((sum: number, c: any) => sum + (Number(c.hoursCompleted) || 0), 0);
    const totalTargetHours = courses.reduce((sum: number, c: any) => sum + (Number(c.targetHours) || 0), 0);
    const completionPercentage = totalTargetHours > 0 ? Math.round((totalHours / totalTargetHours) * 100) : 0;

    const archiveReport = {
      id: `report-${archiveWeekId}-${Date.now()}`,
      weekId: archiveWeekId,
      weekStartDate: getServerPreviousMondayMidnight().toISOString(),
      weekEndDate: new Date(getServerPreviousMondayMidnight().getTime() + 6 * 86400000 + 86399000).toISOString(),
      weekLabel: archiveWeekLabel,
      archivedAt: new Date().toISOString(),
      totalHours,
      totalTargetHours,
      completionPercentage,
      coursesSnapshot: JSON.parse(JSON.stringify(courses)),
      emailSentTo: settings.studentEmail || "",
      emailSentAt: new Date().toISOString(),
      archivedBy: force ? "manual_trigger" : "automatic_monday_rollover",
    };

    // 1. Save standalone JSON archive file to data/archives/week-[ID].json
    const archiveFilePath = path.join(ARCHIVES_DIR, `week-${archiveWeekId}.json`);
    fs.writeFileSync(archiveFilePath, JSON.stringify(archiveReport, null, 2), "utf-8");
    console.log(`[AutoReset] Created weekly archive file at: ${archiveFilePath}`);

    // 2. Prepend to weeklyReports array in primary study tracker data
    const existingReports = Array.isArray(data.weeklyReports) ? data.weeklyReports : [];
    const updatedReports = [archiveReport, ...existingReports.filter((r: any) => r.weekId !== archiveWeekId)];

    // 3. Reset active course hours and notes for the fresh week
    const resetCourses = courses.map((c: any) => ({
      ...c,
      hoursCompleted: 0,
      notes: "",
      lastUpdated: new Date().toISOString(),
    }));

    // 4. Update data state and lastResetWeekId
    data.courses = resetCourses;
    data.weeklyReports = updatedReports;
    data.settings = {
      ...settings,
      lastResetWeekId: currentWeekId,
    };
    data.lastSaved = new Date().toISOString();
    data.lastRolloverAt = new Date().toISOString();

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    console.log(`[AutoReset] Successfully reset all course hours to 0h and saved new active state for week ${currentWeekId}.`);
    return true;
  } catch (err) {
    console.error("[AutoReset] Error during weekly rollover:", err);
    return false;
  }
}

// Run initial rollover check on server start
performServerWeeklyRollover(false);

// Background check every 15 seconds for seamless Monday 12 AM rollover
setInterval(() => {
  performServerWeeklyRollover(false);
}, 15000);

// Get stored local user study data (performs rollover check first)
app.get("/api/data", (req, res) => {
  try {
    // Check if week boundary passed
    performServerWeeklyRollover(false);

    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(fileData);
      return res.json({
        exists: true,
        data: parsed,
        filePath: "data/study-tracker-data.json",
      });
    }
    return res.json({
      exists: false,
      data: null,
      filePath: "data/study-tracker-data.json",
    });
  } catch (err: any) {
    console.error("Error reading local data file:", err);
    return res.status(500).json({ error: "Failed to read local study data", message: err?.message });
  }
});

// Save user study data to local file
app.post("/api/data", (req, res) => {
  try {
    const { courses, weeklyReports, settings } = req.body || {};
    if (!courses && !settings && !weeklyReports) {
      return res.status(400).json({ error: "No data provided to save" });
    }

    // Read existing file if partial payload
    let existingData: any = {};
    if (fs.existsSync(DATA_FILE)) {
      try {
        existingData = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      } catch (e) {
        existingData = {};
      }
    }

    const payloadToSave = {
      courses: courses !== undefined ? courses : (existingData.courses || []),
      weeklyReports: weeklyReports !== undefined ? weeklyReports : (existingData.weeklyReports || []),
      settings: settings !== undefined ? settings : (existingData.settings || {}),
      lastSaved: new Date().toISOString(),
      version: "1.0",
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(payloadToSave, null, 2), "utf-8");
    console.log(`[Storage] Saved study tracker data to ${DATA_FILE} at ${payloadToSave.lastSaved}`);

    return res.json({
      success: true,
      savedAt: payloadToSave.lastSaved,
      filePath: "data/study-tracker-data.json",
    });
  } catch (err: any) {
    console.error("Error saving local data file:", err);
    return res.status(500).json({ error: "Failed to save local study data", message: err?.message });
  }
});

// Archive Week endpoint (stores in data/archives/ & updates data file)
app.post("/api/archive-week", (req, res) => {
  try {
    const { report, courses, weeklyReports, settings } = req.body || {};
    if (!report || !report.weekId) {
      return res.status(400).json({ error: "Missing report or weekId to archive" });
    }

    // Write individual archive file in data/archives/
    const archiveFilePath = path.join(ARCHIVES_DIR, `week-${report.weekId}.json`);
    fs.writeFileSync(archiveFilePath, JSON.stringify(report, null, 2), "utf-8");
    console.log(`[Storage] Saved individual weekly archive file: ${archiveFilePath}`);

    // Update main study-tracker-data.json
    let existingData: any = {};
    if (fs.existsSync(DATA_FILE)) {
      try {
        existingData = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      } catch (e) {
        existingData = {};
      }
    }

    const mergedReports = weeklyReports || [report, ...(existingData.weeklyReports || []).filter((r: any) => r.weekId !== report.weekId)];
    const mergedCourses = courses || existingData.courses || [];
    const mergedSettings = settings ? { ...(existingData.settings || {}), ...settings } : existingData.settings || {};

    const updatedData = {
      courses: mergedCourses,
      weeklyReports: mergedReports,
      settings: mergedSettings,
      lastSaved: new Date().toISOString(),
      version: "1.0",
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(updatedData, null, 2), "utf-8");

    return res.json({
      success: true,
      archiveFile: `data/archives/week-${report.weekId}.json`,
      savedAt: updatedData.lastSaved,
    });
  } catch (err: any) {
    console.error("Error archiving week:", err);
    return res.status(500).json({ error: "Failed to archive week", message: err?.message });
  }
});

// Trigger full weekly reset on demand
app.post("/api/trigger-reset", (req, res) => {
  try {
    const success = performServerWeeklyRollover(true);
    if (fs.existsSync(DATA_FILE)) {
      const current = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      return res.json({ success: true, data: current, message: "Weekly rollover executed and previous week archived to local folder." });
    }
    return res.json({ success: true, message: "Weekly reset executed." });
  } catch (err: any) {
    console.error("Error triggering reset:", err);
    return res.status(500).json({ error: "Failed to trigger reset", message: err?.message });
  }
});

// List all files in data/archives/
app.get("/api/archives", (req, res) => {
  try {
    if (!fs.existsSync(ARCHIVES_DIR)) {
      return res.json({ archives: [] });
    }

    const files = fs.readdirSync(ARCHIVES_DIR).filter(f => f.endsWith(".json"));
    const archives = files.map(file => {
      try {
        const fullPath = path.join(ARCHIVES_DIR, file);
        const stats = fs.statSync(fullPath);
        const content = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
        return {
          fileName: file,
          filePath: `data/archives/${file}`,
          weekId: content.weekId || file.replace("week-", "").replace(".json", ""),
          weekLabel: content.weekLabel || "",
          archivedAt: content.archivedAt || stats.mtime.toISOString(),
          totalHours: content.totalHours || 0,
          totalTargetHours: content.totalTargetHours || 0,
          completionPercentage: content.completionPercentage || 0,
          coursesCount: Array.isArray(content.coursesSnapshot) ? content.coursesSnapshot.length : 0,
          sizeBytes: stats.size,
        };
      } catch (e) {
        return {
          fileName: file,
          filePath: `data/archives/${file}`,
          error: "Failed to parse archive",
        };
      }
    });

    return res.json({ archives });
  } catch (err: any) {
    console.error("Error listing archives:", err);
    return res.status(500).json({ error: "Failed to list archives", message: err?.message });
  }
});

// Download a specific archived week JSON file
app.get("/api/archives/:fileName", (req, res) => {
  try {
    let requestedName = req.params.fileName;
    if (!requestedName.endsWith(".json")) {
      requestedName = `week-${requestedName}.json`;
    }

    const filePath = path.join(ARCHIVES_DIR, requestedName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archive file not found" });
    }

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${requestedName}"`);
    return res.sendFile(filePath);
  } catch (err: any) {
    console.error("Error downloading archive:", err);
    return res.status(500).json({ error: "Failed to retrieve archive" });
  }
});

// Direct backup download of study tracker JSON file
app.get("/api/download-backup", (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const dateStr = new Date().toISOString().split("T")[0];
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="Study_Tracker_Backup_${dateStr}.json"`);
      return res.sendFile(DATA_FILE);
    }

    // If file doesn't exist yet, generate from default
    const dateStr = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="Study_Tracker_Backup_${dateStr}.json"`);
    return res.json({
      courses: [],
      weeklyReports: [],
      settings: {},
      lastSaved: new Date().toISOString(),
      version: "1.0",
    });
  } catch (err: any) {
    console.error("Error downloading backup:", err);
    res.status(500).json({ error: "Failed to download backup", message: err?.message });
  }
});

// Import backup file
app.post("/api/import-backup", (req, res) => {
  try {
    const { courses, weeklyReports, settings } = req.body || {};
    if (!Array.isArray(courses) && !settings) {
      return res.status(400).json({ error: "Invalid backup format. Must contain courses or settings." });
    }

    const payloadToSave = {
      courses: courses || [],
      weeklyReports: weeklyReports || [],
      settings: settings || {},
      lastSaved: new Date().toISOString(),
      importedAt: new Date().toISOString(),
      version: "1.0",
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(payloadToSave, null, 2), "utf-8");

    return res.json({
      success: true,
      data: payloadToSave,
      message: "Study data successfully imported and saved to local disk.",
    });
  } catch (err: any) {
    console.error("Error importing backup:", err);
    return res.status(500).json({ error: "Failed to import study data", message: err?.message });
  }
});

// Reset data file back to empty state if requested
app.post("/api/reset-data", (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
    return res.json({ success: true, message: "Local data file cleared." });
  } catch (err: any) {
    console.error("Error resetting local data:", err);
    return res.status(500).json({ error: "Failed to reset local data" });
  }
});

// Helper to generate a reliable, structured academic study summary fallback
const generateDeterministicSummary = (
  courses: any[] = [],
  totalHours: number = 0,
  targetHours: number = 0,
  studentName: string = "Student",
  weekLabel: string = "This Week"
) => {
  const completionRate = targetHours > 0 ? Math.round((totalHours / targetHours) * 100) : 0;
  
  let grade = "B";
  let tone = "Solid work on your academic goals.";
  if (completionRate >= 100) {
    grade = "A+";
    tone = "Exceptional performance! You achieved 100% of your weekly study quota across all enrolled subjects.";
  } else if (completionRate >= 85) {
    grade = "A";
    tone = "Outstanding weekly momentum! You successfully met high-priority targets with stellar focus.";
  } else if (completionRate >= 70) {
    grade = "B+";
    tone = "Strong study output this week, with good foundation across your core courses.";
  } else if (completionRate >= 50) {
    grade = "B";
    tone = "Moderate study engagement this week. A balanced schedule next week will help close the gap.";
  } else {
    grade = "C+";
    tone = "Study output was below target this cycle. Resetting your schedule will help build daily consistency.";
  }

  const sortedCourses = [...courses].sort((a, b) => (b.hoursCompleted || 0) - (a.hoursCompleted || 0));
  const topCourse = sortedCourses[0];
  const lowestCourse = sortedCourses[sortedCourses.length - 1];

  const highlightSubject = topCourse 
    ? `${topCourse.name} (${topCourse.hoursCompleted}h / ${topCourse.targetHours || 12}h logged)`
    : "General University Study";

  const attentionSubject = (lowestCourse && (lowestCourse.hoursCompleted || 0) < (lowestCourse.targetHours || 12) * 0.7)
    ? `${lowestCourse.name} (logged ${lowestCourse.hoursCompleted}h of ${lowestCourse.targetHours || 12}h goal)`
    : "All courses in healthy standing";

  const strengths = [
    `Logged ${totalHours} total study hours towards your ${targetHours}h weekly academic commitment (${completionRate}% target rate).`,
    topCourse ? `Maintained high dedication in ${topCourse.name} with consistent active study blocks.` : "Maintained active study habit records across the semester.",
    "Actively recorded and structured weekly revision cycles before the Monday reset point."
  ];

  const actionablePlan = [
    `Dedicate 2 focused morning or evening focus blocks of 90 minutes to ${lowestCourse ? lowestCourse.name : "upcoming course lectures"}.`,
    "Review and summarize class notes within 24 hours of each lecture for maximum retention.",
    "Utilize active recall and practice problem sets rather than passive reading to accelerate mastery."
  ];

  const quotes = [
    "Consistency is the DNA of academic mastery.",
    "Small daily improvements over time lead to stunning semester results.",
    "Focus on progress, not perfection — every study hour compounds.",
    "Discipline is choosing between what you want now and what you want most."
  ];

  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  return {
    executiveSummary: `During ${weekLabel}, ${studentName} completed ${totalHours} hours across ${courses.length} courses out of the ${targetHours}h overall target (${completionRate}% attainment). ${tone}`,
    grade,
    highlightSubject,
    attentionSubject,
    strengths,
    actionablePlan,
    encouragementQuote: quote,
  };
};

// Endpoint to generate AI academic weekly summary and study advice
app.post("/api/generate-summary", async (req, res) => {
  const { weekLabel, totalHours, targetHours, courses, userEmail, studentName } = req.body || {};

  const fallbackData = generateDeterministicSummary(
    courses || [],
    Number(totalHours) || 0,
    Number(targetHours) || 0,
    studentName || "Student",
    weekLabel || "This Week"
  );

  const ai = getGeminiClient();
  
  if (!ai) {
    return res.json({
      ...fallbackData,
      aiGenerated: false,
      generatedAt: new Date().toISOString(),
    });
  }

  const courseListText = (courses || [])
    .map(
      (c: any) =>
        `- ${c.name} (${c.code || "Course"}): ${c.hoursCompleted} hrs completed out of ${c.targetHours || 12} hrs total target. Notes: ${c.notes || "None"}`
    )
    .join("\n");

  const prompt = `You are an encouraging, highly analytical university academic advisor.
A student (${studentName || "University Student"}) has completed a weekly study tracking cycle for ${weekLabel || "this week"}.
Here is their logged study data (each course target is normally 12 hours/week):

Total Hours Logged: ${totalHours} / ${targetHours} hours
Course Details:
${courseListText}

Please generate an inspiring, actionable academic weekly progress evaluation. Return your response in JSON format matching this schema:
{
  "executiveSummary": "A concise, motivating 2-3 sentence overview of their weekly academic output, consistency, and overall completion rate.",
  "grade": "Academic Effort Grade (e.g. A+, A, A-, B+, B, C, etc.)",
  "highlightSubject": "The course they excelled most in this week with specific praise",
  "attentionSubject": "The course requiring the most focus or recovery next week (or 'None' if all are 100%)",
  "strengths": ["Key positive study habits or notable accomplishments this week (2-3 bullet points)"],
  "actionablePlan": ["3 concrete, high-impact tactical recommendations for the upcoming week based on their numbers"],
  "encouragementQuote": "A brief uplifting quote or motto tailored for student academic stamina."
}`;

  // Resilient model fallback list
  const candidateModels = ["gemini-3.7-flash", "gemini-flash-latest"];
  let lastError: any = null;

  for (const modelName of candidateModels) {
    // Retry transient 503/429 errors up to 2 attempts per model with backoff
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 800 * attempt));
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "You are a university academic performance advisor providing concise, helpful, constructive weekly study analysis.",
          },
        });

        const text = response.text || "{}";
        let parsedData;
        try {
          parsedData = JSON.parse(text);
        } catch {
          parsedData = fallbackData;
        }

        return res.json({
          ...fallbackData,
          ...parsedData,
          aiGenerated: true,
          modelUsed: modelName,
          generatedAt: new Date().toISOString(),
        });
      } catch (err: any) {
        lastError = err;
        const isTransient = err?.status === 503 || err?.status === 429 || err?.message?.includes("503") || err?.message?.includes("demand");
        if (isTransient && attempt === 0) {
          continue; // retry this model once after brief backoff
        }
        break; // proceed to next candidate model
      }
    }
  }

  // If Gemini models are experiencing temporary high-demand (503 / 429), return the deterministic evaluation gracefully
  return res.json({
    ...fallbackData,
    aiGenerated: false,
    generatedAt: new Date().toISOString(),
  });
});

// Endpoint to check SMTP configuration status
app.get("/api/check-smtp", (req, res) => {
  const user = process.env.SMTP_USER || "";
  const host = process.env.SMTP_HOST || (user.includes("@gmail.com") ? "smtp.gmail.com" : "");
  const pass = process.env.SMTP_PASS || "";
  const isConfigured = Boolean(host && user && pass);
  res.json({
    configured: isConfigured,
    host: host ? host.replace(/^(.{2}).*(.{2})$/, "$1***$2") : "",
    user: user ? user.replace(/(.{2})(.*)(@.*)/, "$1***$3") : "",
  });
});

// Endpoint to dispatch email report via real SMTP or fallback
app.post("/api/send-email-report", async (req, res) => {
  try {
    const { toEmail, subject, htmlContent, textContent, weekLabel, smtpConfig } = req.body;

    if (!toEmail) {
      return res.status(400).json({ error: "Recipient email is required" });
    }

    // Check for SMTP configuration from body or environment
    const smtpUser = smtpConfig?.user || process.env.SMTP_USER || "";
    let smtpHost = smtpConfig?.host || process.env.SMTP_HOST || "";
    if (!smtpHost && smtpUser.includes("@gmail.com")) {
      smtpHost = "smtp.gmail.com";
    }
    const smtpPort = Number(smtpConfig?.port || process.env.SMTP_PORT || 587);
    const smtpPass = (smtpConfig?.pass || process.env.SMTP_PASS || "").trim();
    const smtpSecure = smtpConfig?.secure ?? (process.env.SMTP_SECURE === "true" || smtpPort === 465);
    const smtpFrom = smtpConfig?.from || process.env.SMTP_FROM || smtpUser || `"University Course Tracker" <no-reply@studytracker.local>`;

    const deliveryId = "REP-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    const sentAt = new Date().toISOString();

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const info = await transporter.sendMail({
          from: smtpFrom,
          to: toEmail,
          subject: subject || `University Weekly Course Progress Report - ${weekLabel}`,
          text: textContent,
          html: htmlContent,
        });

        console.log(`[Email Dispatch] Real SMTP email delivered to ${toEmail}. Message ID: ${info.messageId}`);

        return res.json({
          success: true,
          method: "smtp",
          messageId: info.messageId,
          deliveryId,
          sentAt,
          recipient: toEmail,
          subject: subject || `University Weekly Course Progress Report - ${weekLabel}`,
          message: `Report sent to ${toEmail} via SMTP server (${smtpHost})!`,
        });
      } catch (smtpErr: any) {
        console.error("[Email Dispatch] SMTP send error:", smtpErr);
        return res.status(500).json({
          success: false,
          error: `SMTP Error: ${smtpErr?.message || "Failed to authenticate with SMTP server"}`,
          details: "Please verify your SMTP server host, username, and password or use 1-Click Gmail dispatch.",
        });
      }
    }

    // If SMTP is not yet configured, return informative response guiding the user to Gmail / mailto or SMTP setup
    return res.status(200).json({
      success: false,
      isSmtpConfigured: false,
      method: "unconfigured",
      deliveryId,
      sentAt,
      recipient: toEmail,
      subject: subject || `University Weekly Course Progress Report - ${weekLabel}`,
      message: `Direct SMTP server is not yet configured in .env or Settings. Use 1-Click "Send via Gmail" or "Mail Client" to send instantly from your browser, or provide SMTP credentials in Settings.`,
    });
  } catch (err: any) {
    console.error("Error sending email report:", err);
    res.status(500).json({ error: "Failed to process email dispatch", message: err?.message });
  }
});

// Endpoint to download the entire project zip directly for offline running & .exe building
app.get("/api/export-project-zip", async (req, res) => {
  try {
    const zip = new JSZip();
    const rootDir = process.cwd();

    const ignoredDirs = new Set(["node_modules", ".git", "dist", ".cache", ".tmp"]);
    const ignoredFiles = new Set(["bun.lock"]);

    function addDirectoryToZip(dirPath: string, zipFolder: JSZip) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (ignoredDirs.has(entry.name) || ignoredFiles.has(entry.name)) {
          continue;
        }
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          const subFolder = zipFolder.folder(entry.name);
          if (subFolder) {
            addDirectoryToZip(fullPath, subFolder);
          }
        } else if (entry.isFile()) {
          try {
            const fileData = fs.readFileSync(fullPath);
            zipFolder.file(entry.name, fileData);
          } catch (e) {
            console.error(`Failed to read file ${fullPath}`, e);
          }
        }
      }
    }

    addDirectoryToZip(rootDir, zip);

    // Add build-exe.bat to the zip root
    zip.file(
      "1-Build-Windows-EXE.bat",
      `@echo off
title Building University Study Tracker Windows .EXE
echo ========================================================================
echo UNIVERSITY COURSE STUDY TRACKER - WINDOWS .EXE GENERATOR
echo ========================================================================
echo.
echo Step 1: Installing app dependencies and Electron...
call npm install
call npm install --save-dev electron electron-builder
echo.
echo Step 2: Building offline web assets with relative paths...
call npm run build
echo.
echo Step 3: Packaging standalone Windows .EXE...
call npx electron-builder --win portable
echo.
echo ========================================================================
echo SUCCESS! Your standalone .exe is ready in the "dist-electron" folder.
echo You can run "dist-electron\\University Study Tracker 1.0.0.exe" directly on any Windows PC!
echo ========================================================================
pause
`
    );

    // Add 1-Click-Run-Local.bat
    zip.file(
      "2-Run-Offline-Local.bat",
      `@echo off
title Running University Course Study Tracker Locally
echo Starting local offline study tracker...
call npm install
call npm run dev
pause
`
    );

    // Add README-WINDOWS-EXE.txt
    zip.file(
      "README-WINDOWS-EXE.txt",
      `========================================================================
UNIVERSITY COURSE WEEKLY PROGRESS TRACKER - WINDOWS DESKTOP APP GUIDE
========================================================================

HOW TO BUILD YOUR STANDALONE WINDOWS .EXE:
------------------------------------------
1. Double-click "1-Build-Windows-EXE.bat".
2. It will automatically build and package the application into a portable Windows .EXE.
3. Open the "dist" folder and run "University Study Tracker.exe".

HOW TO RUN LOCALLY WITHOUT PACKAGING:
--------------------------------------
1. Double-click "2-Run-Offline-Local.bat".
2. Open http://localhost:3000 in your browser.
`
    );

    const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="University_Course_Tracker_Complete_Source.zip"');
    res.send(buffer);
  } catch (err: any) {
    console.error("Error exporting zip:", err);
    res.status(500).json({ error: "Failed to create project ZIP", message: err?.message });
  }
});

// Direct Windows 1-Click Desktop Launcher (.bat)
app.get("/api/download-launcher", (req, res) => {
  const host = req.get("host") || "localhost:3000";
  const protocol = req.protocol || "https";
  const appUrl = `${protocol}://${host}`;

  const batContent = `@echo off
:: ========================================================================
:: University Course Weekly Study Tracker - Desktop App Launcher
:: ========================================================================
title University Course Study Tracker
echo Launching University Course Study Tracker in native desktop window...

:: Try launching in Edge App Mode (Clean dedicated window with no browser tabs/URL bar)
where msedge >nul 2>nul
if %errorlevel%==0 (
    start msedge.exe --app="${appUrl}"
    exit /b
)

:: Try launching in Chrome App Mode
where chrome >nul 2>nul
if %errorlevel%==0 (
    start chrome.exe --app="${appUrl}"
    exit /b
)

:: Fallback to default browser
start "" "${appUrl}"
exit /b
`;

  res.setHeader("Content-Type", "application/x-bat");
  res.setHeader("Content-Disposition", 'attachment; filename="Launch-University-Study-Tracker.bat"');
  res.send(batContent);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ["**/data/**", "**/data/study-tracker-data.json", "**/node_modules/**", "**/.git/**"],
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`University Tracker server running on http://localhost:${PORT}`);
  });
}

startServer();
