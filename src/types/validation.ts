import { z } from "zod";

// ========================================
// AUTH VALIDATION SCHEMAS
// ========================================

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email là bắt buộc")
    .email("Email không hợp lệ")
    .toLowerCase(),
  password: z.string().min(1, "Mật khẩu là bắt buộc"),
});

export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email là bắt buộc")
      .email("Email không hợp lệ")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
      .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
      .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 số"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
    firstName: z
      .string()
      .min(1, "Tên là bắt buộc")
      .max(100, "Tên không được quá 100 ký tự"),
    lastName: z
      .string()
      .min(1, "Họ là bắt buộc")
      .max(100, "Họ không được quá 100 ký tự"),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, "Số điện thoại phải có 10 chữ số")
      .optional()
      .or(z.literal("")),
    school: z
      .string()
      .max(255, "Tên trường không được quá 255 ký tự")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email là bắt buộc")
    .email("Email không hợp lệ")
    .toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
      .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
      .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 số"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

// ========================================
// STUDENT VALIDATION SCHEMAS
// ========================================

export const studentSchema = z.object({
  firstName: z
    .string()
    .min(1, "Tên là bắt buộc")
    .max(100, "Tên không được quá 100 ký tự")
    .trim(),
  lastName: z
    .string()
    .min(1, "Họ là bắt buộc")
    .max(100, "Họ không được quá 100 ký tự")
    .trim(),
  nickname: z
    .string()
    .max(50, "Biệt danh không được quá 50 ký tự")
    .trim()
    .optional()
    .or(z.literal("")),
  dateOfBirth: z.date({
    required_error: "Ngày sinh là bắt buộc",
    invalid_type_error: "Ngày sinh không hợp lệ",
  }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Giới tính là bắt buộc",
    invalid_type_error: "Giới tính không hợp lệ",
  }),
  status: z.enum(["active", "paused", "archived"]).optional().default("active"),
  diagnosis: z
    .string()
    .max(500, "Chẩn đoán không được quá 500 ký tự")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(2000, "Ghi chú không được quá 2000 ký tự")
    .optional()
    .or(z.literal("")),
  parentName: z
    .string()
    .max(255, "Tên phụ huynh không được quá 255 ký tự")
    .optional()
    .or(z.literal("")),
  parentPhone: z
    .string()
    .regex(/^[0-9]{10}$/, "Số điện thoại phải có 10 chữ số")
    .optional()
    .or(z.literal("")),
});

export const updateStudentSchema = studentSchema.partial();

// ========================================
// TYPE EXPORTS
// ========================================

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
