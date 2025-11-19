import { useUpdatePassword } from "@/src/hooks/useProfile";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function ChangePasswordScreen() {
  const updatePassword = useUpdatePassword();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = () => {
    // Validation
    if (!newPassword.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập mật khẩu mới.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        "Mật khẩu không hợp lệ",
        "Mật khẩu mới phải có ít nhất 6 ký tự."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Mật khẩu không khớp",
        "Mật khẩu mới và xác nhận mật khẩu không giống nhau."
      );
      return;
    }

    updatePassword.mutate(newPassword, {
      onSuccess: () => {
        Alert.alert(
          "Thành công",
          "Đã đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(auth)/login" as any),
            },
          ]
        );
      },
      onError: (error: any) => {

        // Handle specific error messages
        let errorMessage = "Không thể đổi mật khẩu. Vui lòng thử lại.";

        if (error?.message?.includes("Invalid login credentials")) {
          errorMessage = "Mật khẩu hiện tại không đúng.";
        } else if (
          error?.message?.includes("New password should be different")
        ) {
          errorMessage = "Mật khẩu mới phải khác mật khẩu hiện tại.";
        }

        Alert.alert("Lỗi", errorMessage);
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={48} color="#6750A4" />
          <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
          <Text style={styles.headerSubtitle}>
            Vui lòng nhập mật khẩu mới để thay đổi
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            label="Mật khẩu mới *"
            value={newPassword}
            onChangeText={setNewPassword}
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#6750A4"
            secureTextEntry={!showNew}
            right={
              <TextInput.Icon
                icon={showNew ? "eye-off" : "eye"}
                onPress={() => setShowNew(!showNew)}
              />
            }
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
          />

          <TextInput
            label="Xác nhận mật khẩu mới *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#6750A4"
            secureTextEntry={!showConfirm}
            right={
              <TextInput.Icon
                icon={showConfirm ? "eye-off" : "eye"}
                onPress={() => setShowConfirm(!showConfirm)}
              />
            }
            placeholder="Nhập lại mật khẩu mới"
          />

          {/* Password Requirements */}
          <View style={styles.requirements}>
            <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
            <View style={styles.requirementItem}>
              <Ionicons
                name={
                  newPassword.length >= 6 ? "checkmark-circle" : "close-circle"
                }
                size={16}
                color={newPassword.length >= 6 ? "#4CAF50" : "#999"}
              />
              <Text
                style={[
                  styles.requirementText,
                  newPassword.length >= 6 && styles.requirementMet,
                ]}
              >
                Tối thiểu 6 ký tự
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons
                name={
                  newPassword &&
                  confirmPassword &&
                  newPassword === confirmPassword
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={16}
                color={
                  newPassword &&
                  confirmPassword &&
                  newPassword === confirmPassword
                    ? "#4CAF50"
                    : "#999"
                }
              />
              <Text
                style={[
                  styles.requirementText,
                  newPassword &&
                    confirmPassword &&
                    newPassword === confirmPassword &&
                    styles.requirementMet,
                ]}
              >
                Mật khẩu xác nhận khớp
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleChangePassword}
            loading={updatePassword.isPending}
            disabled={updatePassword.isPending}
            style={styles.saveButton}
            buttonColor="#6750A4"
          >
            Đổi mật khẩu
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.back()}
            disabled={updatePassword.isPending}
            style={styles.cancelButton}
          >
            Hủy
          </Button>
        </View>

        {/* Warning */}
        <View style={styles.warning}>
          <Ionicons name="warning" size={20} color="#FF9800" />
          <Text style={styles.warningText}>
            Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại bằng mật khẩu mới.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  divider: {
    height: 16,
  },
  requirements: {
    marginTop: 8,
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
    color: "#999",
  },
  requirementMet: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  saveButton: {
    paddingVertical: 8,
  },
  cancelButton: {
    paddingVertical: 8,
  },
  warning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 32,
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
});
