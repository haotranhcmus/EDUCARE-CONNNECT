import { env } from "@/src/config/env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";
import { Database } from "./database.types";

// Platform-specific storage configuration
const getStorage = () => {
  // For web, check if we're in a browser environment
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      // Use AsyncStorage for web (it will use localStorage internally)
      return AsyncStorage;
    }
    // During SSR, return undefined to use in-memory storage
    return undefined;
  }
  // For native platforms, always use AsyncStorage
  return AsyncStorage;
};

export const supabase = createClient<Database>(
  env.supabase.url,
  env.supabase.anonKey,
  {
    auth: {
      storage: getStorage(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
