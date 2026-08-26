export interface Course {
  id: string;
  name: string;
  code: string;
  instructor?: string;
  hoursCompleted: number; // 0 to targetHours (default 12)
  targetHours: number; // 12 hours
  color: string; // Tailwind color theme identifier
  category?: string;
  notes?: string;
  backgroundImage?: string; // URL or base64 data image
  backgroundDim?: number; // 0 to 90 opacity overlay (default ~60%)
  lastUpdated?: string;
}

export interface AISummary {
  executiveSummary?: string;
  grade?: string;
  highlightSubject?: string;
  attentionSubject?: string;
  strengths?: string[];
  actionablePlan?: string[];
  encouragementQuote?: string;
  aiGenerated?: boolean;
}

export interface WeeklyReport {
  id: string;
  weekId: string; // e.g. "2026-W34"
  weekStartDate: string;
  weekEndDate: string;
  weekLabel: string;
  archivedAt: string;
  totalHours: number;
  totalTargetHours: number;
  completionPercentage: number;
  coursesSnapshot: Course[];
  emailSentTo?: string;
  emailSentAt?: string;
  deliveryId?: string;
  aiSummary?: AISummary;
}

export interface UserSettings {
  studentName: string;
  studentEmail: string;
  universityName: string;
  termName: string;
  autoResetMonday: boolean;
  autoEmailReport: boolean;
  defaultSubjectTarget: number;
  lastResetWeekId: string;
  fontFamily?: string;
  backgroundStyle?: string;
  customBackgroundUrl?: string;
  backgroundDim?: number;
  backgroundBlur?: number;
}

export interface EmailLog {
  id: string;
  timestamp: string;
  recipient: string;
  subject: string;
  weekLabel: string;
  status: "delivered" | "pending" | "failed";
  deliveryId: string;
}
