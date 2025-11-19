/**
 * Environment Configuration
 * Loads environment variables with validation
 */

import Constants from "expo-constants";

// Get from process.env (development) or app.json extra (production)
const getEnvVar = (key: string, fallbackKey?: string): string => {
  // Try process.env first (development with .env file)
  const processEnvValue = process.env[key];
  if (processEnvValue) return processEnvValue;

  // Try Constants.expoConfig.extra (production build)
  if (fallbackKey && Constants.expoConfig?.extra?.[fallbackKey]) {
    return Constants.expoConfig.extra[fallbackKey];
  }

  return "";
};

const supabaseUrl = getEnvVar("EXPO_PUBLIC_SUPABASE_URL", "supabaseUrl");
const supabaseAnonKey = getEnvVar(
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  "supabaseAnonKey"
);

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing required environment variables:\n` +
      `SUPABASE_URL: ${supabaseUrl ? "✓" : "✗"}\n` +
      `SUPABASE_ANON_KEY: ${supabaseAnonKey ? "✓" : "✗"}\n` +
      "Please check your .env file or app.json extra config."
  );
}

export const env = {
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  },
  isDevelopment: process.env.NODE_ENV === "development" || __DEV__,
  isProduction: process.env.NODE_ENV === "production" && !__DEV__,
} as const;

export default env;
