import { z } from "zod";

/**
 * Sign Up Validation Schema
 */
export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    first_name: z
      .string()
      .min(1, "First name is required")
      .max(100, "First name is too long"),
    last_name: z
      .string()
      .min(1, "Last name is required")
      .max(100, "Last name is too long"),
    phone: z
      .string()
      .regex(/^[0-9]{10,11}$/, "Invalid phone number")
      .optional()
      .or(z.literal("")),
    school: z.string().max(255, "School name is too long").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

/**
 * Sign In Validation Schema
 */
export const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInFormData = z.infer<typeof signInSchema>;

/**
 * Reset Password Validation Schema
 */
export const resetPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Update Password Validation Schema
 */
export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

/**
 * Update Profile Validation Schema
 */
export const updateProfileSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name is too long"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name is too long"),
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  school: z.string().max(255, "School name is too long").optional(),
  timezone: z.string().optional(),
  language: z.enum(["vi", "en"]).optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

/**
 * Create Session Validation Schema
 */
export const createSessionSchema = z.object({
  student_id: z.string().uuid("Vui lòng chọn học sinh"),
  session_date: z.date({
    required_error: "Ngày học là bắt buộc",
  }),
  time_slot: z.enum(["morning", "afternoon", "evening"], {
    required_error: "Vui lòng chọn buổi học",
  }),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Giờ bắt đầu không hợp lệ"),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Giờ kết thúc không hợp lệ"),
  location: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => {
    const [startHour, startMin] = data.start_time.split(":").map(Number);
    const [endHour, endMin] = data.end_time.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  },
  {
    message: "Giờ kết thúc phải sau giờ bắt đầu",
    path: ["end_time"],
  }
);

export type CreateSessionFormData = z.infer<typeof createSessionSchema>;

/**
 * Bulk Create Sessions Schema
 */
export const bulkCreateSessionsSchema = z.object({
  student_id: z.string().uuid("Vui lòng chọn học sinh"),
  dates: z.array(z.date()).min(1, "Vui lòng chọn ít nhất một ngày"),
  time_slot: z.enum(["morning", "afternoon", "evening"]),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  location: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
});

export type BulkCreateSessionsFormData = z.infer<typeof bulkCreateSessionsSchema>;

/**
 * Session Log Schema
 */
export const sessionLogSchema = z.object({
  session_id: z.string().uuid(),
  actual_start_time: z.string().optional(),
  actual_end_time: z.string().optional(),
  mood: z.enum(["very_difficult", "difficult", "normal", "good", "very_good"]).optional(),
  energy_level: z.number().int().min(1).max(5).optional(),
  cooperation_level: z.number().int().min(1).max(5).optional(),
  focus_level: z.number().int().min(1).max(5).optional(),
  independence_level: z.number().int().min(1).max(5).optional(),
  attitude_summary: z.string().max(500).optional(),
  progress_notes: z.string().max(2000).optional(),
  challenges_faced: z.string().max(2000).optional(),
  recommendations: z.string().max(2000).optional(),
  teacher_notes_text: z.string().max(2000).optional(),
  overall_rating: z.number().int().min(1).max(5).optional(),
});

export type SessionLogFormData = z.infer<typeof sessionLogSchema>;

/**
 * Behavior Incident Schema
 */
export const behaviorIncidentSchema = z.object({
  session_log_id: z.string().uuid(),
  behavior_library_id: z.string().uuid().optional(),
  incident_number: z.number().int().min(1),
  antecedent: z.string().max(500).optional(),
  behavior_description: z.string().min(1, "Mô tả hành vi là bắt buộc").max(1000),
  consequence: z.string().max(500).optional(),
  duration_minutes: z.number().int().min(0).optional(),
  intensity_level: z.number().int().min(1).max(5).optional(),
  frequency_count: z.number().int().min(0).optional(),
  intervention_used: z.string().max(500).optional(),
  intervention_effective: z.boolean().optional(),
  environmental_factors: z.string().max(500).optional(),
  occurred_at: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  notes: z.string().max(500).optional(),
  requires_followup: z.boolean().default(false),
});

export type BehaviorIncidentFormData = z.infer<typeof behaviorIncidentSchema>;

/**
 * Goal Evaluation Schema
 */
export const goalEvaluationSchema = z.object({
  session_log_id: z.string().uuid(),
  content_goal_id: z.string().uuid(),
  status: z.enum(["achieved", "partially_achieved", "not_achieved", "not_applicable"]),
  achievement_level: z.number().int().min(0).max(100).optional(),
  support_level: z.enum([
    "independent",
    "minimal_prompt",
    "moderate_prompt",
    "substantial_prompt",
    "full_assistance",
  ]).optional(),
  notes: z.string().max(500).optional(),
});

export type GoalEvaluationFormData = z.infer<typeof goalEvaluationSchema>;

