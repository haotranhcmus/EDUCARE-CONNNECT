// ============================================================================
// SESSION TYPES
// ============================================================================

export interface Session {
  id: string;
  student_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  time_slot: string; // 'morning' | 'afternoon' | 'evening'
  location: string | null;
  notes: string | null;
  status: string | null; // 'scheduled' | 'completed' | 'cancelled'
  cancellation_reason: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SessionWithDetails extends Session {
  student: {
    id: string;
    first_name: string;
    last_name: string;
    nickname: string | null;
    date_of_birth: string;
  } | null;
  content_count?: number;
  has_log?: boolean;
  session_log?: SessionLog | null;
  session_contents?: SessionContent[];
}

export interface CreateSessionData {
  student_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  created_by: string; // Required - auth.uid()
  time_slot?: "morning" | "afternoon" | "evening"; // Optional - auto-calculated from start_time
  location?: string;
  notes?: string;
}

export interface UpdateSessionData {
  session_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  notes?: string;
  status?: "scheduled" | "completed" | "cancelled";
}

export interface SessionFilters {
  student_id?: string;
  status?: "scheduled" | "completed" | "cancelled" | "upcoming" | "all";
  from_date?: string;
  to_date?: string;
  has_log?: boolean;
}

// ============================================================================
// SESSION CONTENT TYPES
// ============================================================================

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

export interface SessionContentGoalData {
  session_content_id: string;
  description: string;
  goal_type: "knowledge" | "skill" | "behavior";
  is_primary?: boolean;
  order_index: number;
}

export interface SessionContent {
  id: string;
  session_id: string;
  content_library_id: string | null;
  user_custom_content_id?: string | null;
  domain: string;
  title: string;
  order_index: number;
  description?: string | null;
  instructions?: string | null;
  materials_needed?: string | null;
  tips?: string | null;
  estimated_duration?: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  goals?: SessionContentGoal[]; // Mục tiêu của bài học (eager loaded)
  // Joined relations from Supabase queries
  content_library?: {
    domain: string;
    description: string | null;
    target_age_min: number | null;
    target_age_max: number | null;
    difficulty_level: string | null;
    materials_needed: string[] | string | null; // JSONB array or legacy string
    estimated_duration: number | null;
    instructions: string[] | string | null; // JSONB array or legacy string
    tips: string[] | string | null; // JSONB array or legacy string
    default_goals: any | null;
  } | null;
  user_custom_content?: {
    domain: string;
    description: string | null;
    materials_needed: string[] | string | null; // JSONB array or legacy string
    estimated_duration: number | null;
    instructions: string[] | string | null; // JSONB array or legacy string
    tips: string[] | string | null; // JSONB array or legacy string
    default_goals: any | null;
  } | null;
}

export interface SessionContentData {
  session_id: string;
  content_library_id?: string | null;
  user_custom_content_id?: string | null;
  domain: string;
  title: string;
  order_index: number;
  description?: string;
  instructions?: string;
  materials_needed?: string;
  tips?: string;
  estimated_duration?: number;
  notes?: string;
  goals?: Array<{
    description: string;
    goal_type: "knowledge" | "skill" | "behavior";
    is_primary?: boolean;
    order_index: number;
  }>; // Mục tiêu khi tạo mới
}

// ============================================================================
// SESSION LOG TYPES
// ============================================================================

export interface SessionLog {
  id: string;
  session_id: string;
  actual_start_time: string | null;
  actual_end_time: string | null;
  mood: string | null; // From database
  energy_level: number | null; // 1-5
  cooperation_level: number | null; // 1-5
  focus_level: number | null; // From database
  independence_level: number | null; // From database
  overall_rating: number | null; // From database
  progress_notes: string | null;
  challenges_faced: string | null; // From database (renamed from challenges)
  attitude_summary: string | null; // From database
  recommendations: string | null; // From database
  created_by: string;
  created_at: string | null;
  updated_at: string | null;
  logged_at: string | null;
  completed_at: string | null;
  teacher_notes_text: string | null;
}

export interface SessionLogWithDetails extends SessionLog {
  behavior_incidents?: BehaviorIncident[];
  session_media?: SessionMedia[];
  goal_evaluations?: GoalEvaluation[];
}

export interface SessionLogData {
  session_id: string;
  actual_start_time: string;
  actual_end_time?: string;
  mood?: string; // 'very_difficult' | 'difficult' | 'normal' | 'good' | 'very_good'
  energy_level?: number; // 1-5
  cooperation_level?: number; // 1-5
  focus_level?: number; // 1-5
  independence_level?: number; // 1-5
  progress_notes?: string;
  challenges_faced?: string; // Renamed from challenges
  recommendations?: string; // Renamed from next_session_plan
  attitude_summary?: string;
  teacher_notes_text?: string;
  overall_rating?: number; // 1-5
  created_by: string;
}

// ============================================================================
// BEHAVIOR INCIDENT TYPES
// ============================================================================

export interface BehaviorIncident {
  id: string;
  session_log_id: string;
  occurred_at: string; // From database (renamed from incident_time)
  incident_number: number; // From database
  behavior_description: string; // From database (renamed from description)
  antecedent: string | null; // ABC data
  consequence: string | null; // ABC data
  intervention_used: string | null;
  intensity_level: number | null; // From database (1-5, renamed from effectiveness)
  intervention_effective: boolean | null; // From database
  duration_minutes: number | null; // From database
  recorded_by: string; // From database
  created_at: string | null;
  updated_at: string | null;
}

export interface BehaviorIncidentData {
  session_log_id: string;
  occurred_at: string;
  incident_number: number;
  behavior_description: string;
  recorded_by: string; // Required
  antecedent?: string;
  consequence?: string;
  intervention_used?: string;
  intensity_level?: number;
  intervention_effective?: boolean;
  duration_minutes?: number;
  behavior_library_id?: string;
  environmental_factors?: string;
  frequency_count?: number;
  notes?: string;
  requires_followup?: boolean;
}

// ============================================================================
// GOAL EVALUATION TYPES
// ============================================================================

export interface GoalEvaluation {
  id: string;
  session_log_id: string; // From database
  content_goal_id: string; // From database (renamed from session_content_id)
  status: string; // From database - required
  achievement_level: number | null; // 0-100 or 1-5
  support_level: string | null; // From database
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface GoalEvaluationData {
  session_log_id: string;
  content_goal_id: string;
  status: string; // Required
  achievement_level?: number;
  support_level?: string;
  notes?: string;
}

// ============================================================================
// SESSION MEDIA TYPES
// ============================================================================

export interface SessionMedia {
  id: string;
  session_log_id: string;
  media_type: string; // "photo" | "video" but allow any string from DB
  url: string;
  caption: string | null;
  uploaded_by: string;
  created_at: string | null;
  updated_at: string | null;
}
