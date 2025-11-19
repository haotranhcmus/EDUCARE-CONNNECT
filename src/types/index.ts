export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Re-export database types
export type { Database } from "@/lib/supabase/database.types";

// Import DB types
import type { Database } from "@/lib/supabase/database.types";

// ============================================
// DATABASE TYPES (from schema)
// ============================================

// Profile types (unified teacher/parent)
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// Student types
export type Student = Database["public"]["Tables"]["students"]["Row"];
export type StudentInsert = Database["public"]["Tables"]["students"]["Insert"];
export type StudentUpdate = Database["public"]["Tables"]["students"]["Update"];

// Session types
export type Session = Database["public"]["Tables"]["sessions"]["Row"];
export type SessionInsert = Database["public"]["Tables"]["sessions"]["Insert"];
export type SessionUpdate = Database["public"]["Tables"]["sessions"]["Update"];

// Session Content types
export type SessionContent =
  Database["public"]["Tables"]["session_contents"]["Row"];
export type SessionContentInsert =
  Database["public"]["Tables"]["session_contents"]["Insert"];
export type SessionContentUpdate =
  Database["public"]["Tables"]["session_contents"]["Update"];

// Session Content Goals
export type SessionContentGoal =
  Database["public"]["Tables"]["session_content_goals"]["Row"];
export type SessionContentGoalInsert =
  Database["public"]["Tables"]["session_content_goals"]["Insert"];
export type SessionContentGoalUpdate =
  Database["public"]["Tables"]["session_content_goals"]["Update"];

// Session Log types
export type SessionLog = Database["public"]["Tables"]["session_logs"]["Row"];
export type SessionLogInsert =
  Database["public"]["Tables"]["session_logs"]["Insert"];
export type SessionLogUpdate =
  Database["public"]["Tables"]["session_logs"]["Update"];

// Goal Evaluation types
export type GoalEvaluation =
  Database["public"]["Tables"]["goal_evaluations"]["Row"];
export type GoalEvaluationInsert =
  Database["public"]["Tables"]["goal_evaluations"]["Insert"];
export type GoalEvaluationUpdate =
  Database["public"]["Tables"]["goal_evaluations"]["Update"];

// Behavior types
export type BehaviorGroup =
  Database["public"]["Tables"]["behavior_groups"]["Row"];
export type BehaviorLibrary =
  Database["public"]["Tables"]["behavior_library"]["Row"];
export type BehaviorIncident =
  Database["public"]["Tables"]["behavior_incidents"]["Row"];
export type BehaviorIncidentInsert =
  Database["public"]["Tables"]["behavior_incidents"]["Insert"];
export type BehaviorIncidentUpdate =
  Database["public"]["Tables"]["behavior_incidents"]["Update"];

// Content Library types
export type ContentLibrary =
  Database["public"]["Tables"]["content_library"]["Row"];
export type ContentLibraryInsert =
  Database["public"]["Tables"]["content_library"]["Insert"];
export type ContentLibraryUpdate =
  Database["public"]["Tables"]["content_library"]["Update"];

// Media Attachment types
export type MediaAttachment =
  Database["public"]["Tables"]["media_attachments"]["Row"];
export type MediaAttachmentInsert =
  Database["public"]["Tables"]["media_attachments"]["Insert"];
export type MediaAttachmentUpdate =
  Database["public"]["Tables"]["media_attachments"]["Update"];

// Report types
export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type ReportInsert = Database["public"]["Tables"]["reports"]["Insert"];
export type ReportUpdate = Database["public"]["Tables"]["reports"]["Update"];

// AI Processing types
export type AIProcessing = Database["public"]["Tables"]["ai_processing"]["Row"];
export type AIProcessingInsert =
  Database["public"]["Tables"]["ai_processing"]["Insert"];
export type AIProcessingUpdate =
  Database["public"]["Tables"]["ai_processing"]["Update"];

// Backup types
export type Backup = Database["public"]["Tables"]["backups"]["Row"];
export type BackupInsert = Database["public"]["Tables"]["backups"]["Insert"];
export type BackupUpdate = Database["public"]["Tables"]["backups"]["Update"];

// ============================================
// ENUM TYPES (from schema)
// ============================================

export type UserRole = "teacher" | "parent";
export type StudentStatus = "active" | "paused" | "archived";
export type StudentGender = "male" | "female" | "other";
export type SessionStatus = "scheduled" | "completed" | "cancelled";
export type SessionTimeSlot = "morning" | "afternoon" | "evening";
export type SessionCreationMethod = "manual" | "ai";
export type ContentDomain =
  | "cognitive"
  | "motor"
  | "language"
  | "social"
  | "self_care";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type GoalType = "knowledge" | "skill" | "behavior";
export type EvaluationStatus =
  | "achieved"
  | "partially_achieved"
  | "not_achieved"
  | "not_applicable";
export type SupportLevel =
  | "independent"
  | "minimal_prompt"
  | "moderate_prompt"
  | "substantial_prompt"
  | "full_assistance";
export type MoodLevel =
  | "very_difficult"
  | "difficult"
  | "normal"
  | "good"
  | "very_good";
export type MediaType = "image" | "video" | "audio";
export type FileType = "pdf" | "docx" | "txt" | "image";
export type ProcessingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";
export type BackupType = "manual" | "auto";
export type ReportFormat = "pdf" | "excel";
export type ReportType = "individual" | "summary";

// ============================================
// AUTH TYPES
// ============================================

export interface BaseSignUpData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface TeacherSignUpData extends BaseSignUpData {
  role: "teacher";
  school?: string;
}

export interface ParentSignUpData extends BaseSignUpData {
  role: "parent";
  occupation?: string;
  relationship_to_student?: string;
  emergency_contact?: string;
  address?: string;
}

export type SignUpData = TeacherSignUpData | ParentSignUpData;

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
}
