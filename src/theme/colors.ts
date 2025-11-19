/**
 * Theme Configuration
 * Centralized color palette and design tokens
 */

export const Colors = {
  // Primary Colors
  primary: "#6366F1", // Indigo
  primaryDark: "#4F46E5",
  primaryLight: "#818CF8",

  // Status Colors
  success: "#10B981", // Green
  warning: "#F59E0B", // Amber
  error: "#EF4444", // Red
  info: "#3B82F6", // Blue

  // Neutral Colors
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },

  // Semantic Colors
  text: {
    primary: "#1E293B",
    secondary: "#64748B",
    tertiary: "#94A3B8",
    inverse: "#FFFFFF",
  },

  background: {
    primary: "#FFFFFF",
    secondary: "#F8FAFC",
    tertiary: "#F1F5F9",
  },

  surface: "#FFFFFF",

  border: {
    light: "#E2E8F0",
    default: "#CBD5E1",
    dark: "#94A3B8",
  },

  // Behavior Group Colors (from database)
  behaviors: {
    defiant: "#EF4444", // Red
    aggressive: "#F59E0B", // Orange
    sensory: "#8B5CF6", // Purple
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const Typography = {
  fontFamily: {
    regular: "System",
    medium: "System",
    bold: "System",
    mono: "SpaceMono",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;
