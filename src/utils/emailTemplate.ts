import { WeeklyReport, UserSettings } from "../types";
import { getCourseAccent } from "./colorUtils";

export function generateReportHtml(report: WeeklyReport, settings: UserSettings): string {
  const overallRate = report.totalTargetHours > 0 
    ? Math.round((report.totalHours / report.totalTargetHours) * 100) 
    : 0;

  const coursesRows = report.coursesSnapshot.map(course => {
    const rate = Math.round((course.hoursCompleted / course.targetHours) * 100);
    const isCompleted = course.hoursCompleted >= course.targetHours;
    const accent = getCourseAccent(course.color);
    const badgeColor = isCompleted ? "#10b981" : rate >= 60 ? accent.hex : "#f59e0b";
    const statusText = isCompleted ? "GOAL REACHED (100%)" : `${rate}% COMPLETED`;

    return `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <span style="display: inline-block; padding: 2px 6px; font-size: 11px; font-weight: 700; font-family: monospace; border-radius: 4px; background-color: rgba(${accent.rgb}, 0.15); color: ${accent.hex}; border: 1px solid rgba(${accent.rgb}, 0.3); margin-right: 6px;">${course.code}</span>
          <strong style="color: #1e293b; font-size: 15px;">${course.name}</strong>
          ${course.instructor ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">Instructor: ${course.instructor}</div>` : ''}
          ${course.notes ? `<div style="font-size: 12px; color: #475569; margin-top: 4px; font-style: italic; background: #f8fafc; padding: 4px 8px; border-radius: 4px;">"${course.notes}"</div>` : ''}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <span style="font-weight: 700; color: #0f172a; font-size: 15px;">${course.hoursCompleted}</span>
          <span style="color: #64748b; font-size: 13px;"> / ${course.targetHours}h</span>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; background-color: ${badgeColor}15; color: ${badgeColor}; border: 1px solid ${badgeColor}30;">
            ${statusText}
          </span>
        </td>
      </tr>
    `;
  }).join("");

  const aiSummaryBlock = report.aiSummary?.executiveSummary ? `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #4f46e5; border-radius: 8px; padding: 18px 20px; margin: 24px 0;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #4f46e5;">Academic Advisor Analysis</span>
        ${report.aiSummary.grade ? `<span style="font-size: 13px; font-weight: 800; background: #4f46e5; color: #ffffff; padding: 2px 10px; border-radius: 6px;">Grade: ${report.aiSummary.grade}</span>` : ''}
      </div>
      <p style="margin: 0 0 12px 0; color: #334155; font-size: 14px; line-height: 1.6;">
        ${report.aiSummary.executiveSummary}
      </p>
      ${report.aiSummary.strengths && report.aiSummary.strengths.length > 0 ? `
        <div style="margin-top: 12px;">
          <strong style="font-size: 12px; color: #0f172a;">Key Strengths:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 20px; color: #475569; font-size: 13px; line-height: 1.5;">
            ${report.aiSummary.strengths.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${report.aiSummary.actionablePlan && report.aiSummary.actionablePlan.length > 0 ? `
        <div style="margin-top: 12px;">
          <strong style="font-size: 12px; color: #0f172a;">Upcoming Week Focus:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 20px; color: #475569; font-size: 13px; line-height: 1.5;">
            ${report.aiSummary.actionablePlan.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>University Weekly Study Report - ${report.weekLabel}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" style="max-width: 650px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px 28px; color: #ffffff;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 6px; font-weight: 600;">
          ${settings.universityName || "University"} • ${settings.termName || "Academic Term"}
        </div>
        <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
          Weekly Course Progress Report
        </h1>
        <div style="font-size: 14px; color: #cbd5e1;">
          ${report.weekLabel} • Student: <strong style="color: #ffffff;">${settings.studentName}</strong>
        </div>
      </td>
    </tr>

    <!-- Stats Highlight Box -->
    <tr>
      <td style="padding: 24px 28px 12px 28px;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; width: 33%; text-align: center;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Hours Logged</div>
              <div style="font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 4px;">${report.totalHours} <span style="font-size: 14px; font-weight: 500; color: #64748b;">/ ${report.totalTargetHours}h</span></div>
            </td>
            <td style="width: 10px;"></td>
            <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; width: 33%; text-align: center;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Completion Rate</div>
              <div style="font-size: 24px; font-weight: 800; color: ${overallRate >= 80 ? '#10b981' : '#4f46e5'}; margin-top: 4px;">${overallRate}%</div>
            </td>
            <td style="width: 10px;"></td>
            <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; width: 33%; text-align: center;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Courses On Track</div>
              <div style="font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 4px;">
                ${report.coursesSnapshot.filter(c => c.hoursCompleted >= c.targetHours).length} <span style="font-size: 14px; font-weight: 500; color: #64748b;">/ ${report.coursesSnapshot.length}</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- AI Advisor Summary -->
    <tr>
      <td style="padding: 0 28px;">
        ${aiSummaryBlock}
      </td>
    </tr>

    <!-- Subject Table -->
    <tr>
      <td style="padding: 12px 28px 24px 28px;">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a;">
          Subject Breakdown & Weekly Study Targets
        </h3>
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0;">Course</th>
              <th style="padding: 10px 16px; text-align: center; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0;">Hours</th>
              <th style="padding: 10px 16px; text-align: right; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${coursesRows}
          </tbody>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center; color: #64748b; font-size: 12px;">
        <div>Automatically generated and archived by your University Course Weekly Progress Tracker.</div>
        <div style="margin-top: 4px; color: #94a3b8;">Cycle resets automatically every Monday at 12:00 AM. Next cycle is ready to log.</div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function generatePlainTextSummary(report: WeeklyReport, settings: UserSettings): string {
  const overallRate = report.totalTargetHours > 0 
    ? Math.round((report.totalHours / report.totalTargetHours) * 100) 
    : 0;

  let text = `======================================================\n`;
  text += `UNIVERSITY WEEKLY COURSE PROGRESS REPORT\n`;
  text += `${settings.universityName} • ${settings.termName}\n`;
  text += `Student: ${settings.studentName} (${settings.studentEmail})\n`;
  text += `Week: ${report.weekLabel}\n`;
  text += `======================================================\n\n`;

  text += `OVERALL SUMMARY:\n`;
  text += `• Total Hours Completed: ${report.totalHours} / ${report.totalTargetHours} hrs (${overallRate}% target)\n`;
  text += `• Courses Fully Meeting Target: ${report.coursesSnapshot.filter(c => c.hoursCompleted >= c.targetHours).length} / ${report.coursesSnapshot.length}\n\n`;

  if (report.aiSummary?.executiveSummary) {
    text += `ACADEMIC ADVISOR INSIGHTS:\n`;
    text += `"${report.aiSummary.executiveSummary}"\n`;
    if (report.aiSummary.grade) text += `Overall Grade: ${report.aiSummary.grade}\n`;
    if (report.aiSummary.strengths?.length) {
      text += `Key Strengths:\n` + report.aiSummary.strengths.map(s => ` - ${s}`).join("\n") + "\n";
    }
    if (report.aiSummary.actionablePlan?.length) {
      text += `Action Plan for Next Week:\n` + report.aiSummary.actionablePlan.map(p => ` - ${p}`).join("\n") + "\n";
    }
    text += `\n`;
  }

  text += `COURSE BREAKDOWN:\n`;
  report.coursesSnapshot.forEach(c => {
    const rate = Math.round((c.hoursCompleted / c.targetHours) * 100);
    text += `• [${c.code}] ${c.name}: ${c.hoursCompleted}/${c.targetHours}h (${rate}%)\n`;
    if (c.instructor) text += `  Instructor: ${c.instructor}\n`;
    if (c.notes) text += `  Notes: ${c.notes}\n`;
  });

  text += `\n======================================================\n`;
  text += `Generated automatically. Sliders reset weekly on Monday 12:00 AM.\n`;

  return text;
}

export function createMailtoUrl(report: WeeklyReport, settings: UserSettings): string {
  const subject = encodeURIComponent(`Weekly Course Study Progress Report: ${report.weekLabel} - ${settings.studentName}`);
  const body = encodeURIComponent(generatePlainTextSummary(report, settings));
  return `mailto:${settings.studentEmail}?subject=${subject}&body=${body}`;
}

export function createGmailComposeUrl(report: WeeklyReport, settings: UserSettings): string {
  const to = encodeURIComponent(settings.studentEmail);
  const subject = encodeURIComponent(`Weekly Course Study Progress Report: ${report.weekLabel} - ${settings.studentName}`);
  const body = encodeURIComponent(generatePlainTextSummary(report, settings));
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
}

export function createOutlookComposeUrl(report: WeeklyReport, settings: UserSettings): string {
  const to = encodeURIComponent(settings.studentEmail);
  const subject = encodeURIComponent(`Weekly Course Study Progress Report: ${report.weekLabel} - ${settings.studentName}`);
  const body = encodeURIComponent(generatePlainTextSummary(report, settings));
  return `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${subject}&body=${body}`;
}
