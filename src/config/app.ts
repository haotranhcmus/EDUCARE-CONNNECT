/**
 * App Configuration
 * Centralized app-wide configuration
 */

export const AppConfig = {
  name: "Educare Connect",
  version: "1.0.0",
  description: "Ứng dụng quản lý giáo dục đặc biệt",

  // Features
  features: {
    emailVerification: false, // Set to true in production
    twoFactorAuth: false,
    offlineMode: false,
    analytics: false,
  },

  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },

  // Pagination
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },

  // File Upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedVideoTypes: ["video/mp4", "video/quicktime"],
    allowedAudioTypes: ["audio/mpeg", "audio/wav"],
  },

  // Session
  session: {
    defaultDuration: 60, // minutes
    reminderBeforeMinutes: 15,
  },

  // Validation
  validation: {
    minPasswordLength: 8,
    phoneNumberPattern: /^[0-9]{10,11}$/,
    emailPattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  },
} as const;

export default AppConfig;
