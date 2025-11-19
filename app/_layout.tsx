import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";

import { supabase } from "@/lib/supabase/client";
import { useColorScheme } from "@/src/components/useColorScheme";
import { queryClient } from "@/src/lib/queryClient";
import { useAuthStore } from "@/src/stores/authStore";
// import "@/src/utils/logger"; // Disable console in production - COMMENTED FOR DEBUG

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(auth)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../src/assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const { initialize, isLoading: authLoading } = useAuthStore();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Initialize auth on app start
  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (loaded && !authLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, authLoading]);

  if (!loaded || authLoading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <RootLayoutNav />
      </PaperProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const { isAuthenticated, profile } = useAuthStore();

  // Auto navigation based on auth state
  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace("/(auth)/login" as any);
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect based on role
      if (profile?.role === "parent") {
        router.replace("/(parent)" as any);
      } else if (profile?.role === "teacher") {
        router.replace("/(teacher)" as any);
      }
    }
  }, [isAuthenticated, segments, profile]);

  // Listen to auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const { setUser, setSession, setProfile, initialize } =
        useAuthStore.getState();

      if (event === "SIGNED_IN" && session) {
        setUser(session.user);
        setSession(session);

        // Check if first login (force change password)
        if (session.user.user_metadata?.first_login === true) {
          router.replace("/(auth)/change-password-first-login" as any);
          return;
        }

        // Fetch profile
        await initialize();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setSession(null);
        setProfile(null);
      } else if (event === "TOKEN_REFRESHED" && session) {
        setSession(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(teacher)" />
        <Stack.Screen name="(parent)" />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}
