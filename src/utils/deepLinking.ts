import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { Alert, Linking } from "react-native";
import { supabase } from "../../lib/supabase/client";

export function useDeepLinking() {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle incoming deep links
    const handleUrl = async (event: { url: string }) => {
      try {
        const url = new URL(event.url);

        // Parse URL: educareconnect://auth/confirmed?access_token=xxx&refresh_token=yyy
        // Or: educareconnect://auth?access_token=xxx&refresh_token=yyy&type=invite
        const pathSegments = url.pathname.split("/").filter(Boolean);
        const action =
          pathSegments[pathSegments.length - 1] ||
          url.searchParams.get("type") ||
          "auth";

        const access_token = url.searchParams.get("access_token");
        const refresh_token = url.searchParams.get("refresh_token");

        if (!access_token || !refresh_token) {
          Alert.alert(
            "Lỗi xác thực",
            "Link xác thực không hợp lệ hoặc đã hết hạn. Vui lòng thử lại."
          );
          return;
        }

        // Set session in Supabase
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          Alert.alert(
            "Lỗi xác thực",
            error.message || "Không thể xác thực. Vui lòng thử lại."
          );
          return;
        }

        // Show success message based on action
        const successMessage = getSuccessMessage(action);
        if (successMessage) {
          Alert.alert("Thành công", successMessage);
        }

        // Navigate based on action
        handleAuthAction(action, navigation);
      } catch (error) {
        Alert.alert("Lỗi", "Không thể xử lý link xác thực. Vui lòng thử lại.");
      }
    };

    // Subscribe to URL events
    const subscription = Linking.addEventListener("url", handleUrl);

    // Check for initial URL when app opens
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [navigation]);
}

function getSuccessMessage(action: string): string | null {
  switch (action) {
    case "confirmed":
      return "Email của bạn đã được xác nhận thành công!";
    case "reset-password":
      return "Vui lòng nhập mật khẩu mới của bạn.";
    case "email-changed":
      return "Email của bạn đã được thay đổi thành công!";
    case "invite-accepted":
    case "invite":
    case "auth":
      return "Chào mừng bạn đến với Educare Connect!";
    case "magiclink":
      return "Đăng nhập thành công!";
    default:
      return null;
  }
}

function handleAuthAction(action: string, navigation: any) {
  switch (action) {
    case "confirmed":
      // Email confirmed - go to home
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
      break;

    case "reset-password":
      // Navigate to password reset screen
      navigation.navigate("ResetPasswordScreen");
      break;

    case "email-changed":
      // Show success message and refresh profile
      navigation.navigate("Profile", { emailChanged: true });
      break;

    case "invite-accepted":
    case "invite":
    case "auth":
      // Navigate to home - user already set session
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
      break;

    case "magiclink":
      // Navigate to home
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
      break;

    default:
      // Default: just reload to trigger auth check
      break;
  }
}
