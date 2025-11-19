// Student related types for Parent app

export interface Student {
  id: string;
  profile_id: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  date_of_birth: string;
  gender: "male" | "female" | "other";
  avatar_url?: string;
  status: "active" | "paused" | "archived";
  diagnosis?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentStats {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  cancelledSessions: number;
  avgRating: number | null;
  progressPercent: number;
  lastSessionDate: string | null;
  domains: {
    cognitive: number;
    motor: number;
    language: number;
    social: number;
    self_care: number;
  };
}

export interface Session {
  id: string;
  student_id: string;
  session_date: string;
  time_slot: "morning" | "afternoon" | "evening";
  start_time: string;
  end_time: string;
  duration_minutes: number;
  location?: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled";
  has_evaluation: boolean;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionWithLog extends Session {
  session_log?: SessionLog;
}

export interface SessionLog {
  id: string;
  session_id: string;
  logged_at: string;
  actual_start_time?: string;
  actual_end_time?: string;
  mood?: "very_difficult" | "difficult" | "normal" | "good" | "very_good";
  energy_level?: number; // 1-5
  cooperation_level?: number; // 1-5
  focus_level?: number; // 1-5
  independence_level?: number; // 1-5
  attitude_summary?: string;
  progress_notes?: string;
  challenges_faced?: string;
  recommendations?: string;
  teacher_notes_text?: string;
  overall_rating?: number; // 1-5
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionContent {
  id: string;
  session_id: string;
  title: string;
  domain: "cognitive" | "motor" | "language" | "social" | "self_care";
  description?: string;
  materials_needed?: string;
  estimated_duration?: number;
  instructions?: string;
  tips?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface SessionContentGoal {
  id: string;
  session_content_id: string;
  description: string;
  goal_type: "knowledge" | "skill" | "behavior";
  is_primary: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface GoalEvaluation {
  id: string;
  session_log_id: string;
  content_goal_id: string;
  status: "achieved" | "partially_achieved" | "not_achieved" | "not_applicable";
  achievement_level?: number; // 0-100
  support_level?:
    | "independent"
    | "minimal_prompt"
    | "moderate_prompt"
    | "substantial_prompt"
    | "full_assistance";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionDetailData {
  session: Session;
  session_log?: SessionLog;
  contents: (SessionContent & {
    goals: (SessionContentGoal & {
      evaluation?: GoalEvaluation;
    })[];
  })[];
  media: MediaAttachment[];
  behavior_incidents?: BehaviorIncident[];
}

export interface MediaAttachment {
  id: string;
  session_log_id: string;
  media_type: "image" | "video" | "audio";
  url: string;
  thumbnail_url?: string;
  filename: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  duration?: number;
  caption?: string;
  created_at: string;
}

export interface BehaviorIncident {
  id: string;
  session_log_id: string;
  incident_number: number;
  behavior_description: string;
  antecedent?: string;
  consequence?: string;
  duration_minutes?: number;
  intensity_level?: number; // 1-5
  frequency_count?: number;
  intervention_used?: string;
  intervention_effective?: boolean;
  environmental_factors?: string;
  occurred_at: string;
  notes?: string;
  requires_followup: boolean;
  created_at: string;
}

export interface SessionFilters {
  status?: "upcoming" | "completed" | "cancelled" | "all";
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface GoalProgress {
  domain: "cognitive" | "motor" | "language" | "social" | "self_care";
  totalGoals: number;
  achievedGoals: number;
  partiallyAchievedGoals: number;
  notAchievedGoals: number;
  progressPercent: number;
  recentEvaluations: (GoalEvaluation & {
    goal: SessionContentGoal;
    session_date: string;
  })[];
}

export interface DomainProgress {
  cognitive: GoalProgress;
  motor: GoalProgress;
  language: GoalProgress;
  social: GoalProgress;
  self_care: GoalProgress;
}
