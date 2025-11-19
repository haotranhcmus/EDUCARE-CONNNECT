import { supabase } from "@/lib/supabase/client";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, HelperText, Text, TextInput } from "react-native-paper";

export default function ChangePasswordFirstLoginScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChangePassword = async () => {
    try {
      setSubmitting(true);
      setError("");

      // Validation
      if (!firstName.trim() || !lastName.trim()) {
        setError("Vui lòng nhập họ và tên");
        setSubmitting(false);
        return;
      }

      if (!phone.trim()) {
        setError("Vui lòng nhập số điện thoại");
        setSubmitting(false);
        return;
      }

      // Validate phone format
      const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
      if (!phoneRegex.test(phone.trim().replace(/\s/g, ""))) {
        setError("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)");
        setSubmitting(false);
        return;
      }

      if (!newPassword || newPassword.length < 8) {
        setError("Mật khẩu phải có ít nhất 8 ký tự");
        setSubmitting(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("Mật khẩu xác nhận không khớp");
        setSubmitting(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
        data: {
          first_login: false,
        },
      });

      if (updateError) {
        setError("Không thể đổi mật khẩu. Vui lòng thử lại.");
        setSubmitting(false);
        return;
      }

      // Update profile with basic info
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone: phone.trim(),
          })
          .eq("id", user.id);

        if (profileError) {
          setError("Không thể cập nhật thông tin. Vui lòng thử lại.");
          setSubmitting(false);
          return;
        }

        // Update student_parents status to "active" if parent
        if (user.user_metadata?.role === "parent" && user.email) {
          const { error: activateError } = await supabase
            .from("student_parents")
            .update({
              parent_id: user.id,
              status: "active",
              activated_at: new Date().toISOString(),
            })
            .eq("parent_email", user.email)
            .eq("status", "invited");

          if (activateError) {
            // Silent fail - not critical
          }
        }
      }

      // Redirect to app based on role
      const role = user?.user_metadata?.role;
      if (role === "parent") {
        router.replace("/(parent)/" as any);
      } else if (role === "teacher") {
        router.replace("/(teacher)/" as any);
      } else {
        router.replace("/" as any);
      }
    } catch (err: any) {
      setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Ionicons
              name="shield-checkmark-outline"
              size={64}
              color="#2563eb"
            />
            <Text style={styles.title}>Kích hoạt tài khoản</Text>
            <Text style={styles.subtitle}>
              Chào mừng bạn đến với EduCare Connect! Vui lòng hoàn tất thông tin
              cá nhân và tạo mật khẩu mới để kích hoạt tài khoản.
            </Text>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              {/* Personal Info Section */}
              <Text style={styles.sectionTitle}>Thông tin cá nhân *</Text>

              <TextInput
                mode="outlined"
                label="Họ *"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
              />

              <TextInput
                mode="outlined"
                label="Tên *"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
              />

              <TextInput
                mode="outlined"
                label="Số điện thoại *"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                style={styles.input}
                left={<TextInput.Icon icon="phone" />}
                placeholder="Ví dụ: 0912345678"
              />

              {/* Password Section */}
              <Text style={styles.sectionTitle}>Mật khẩu mới *</Text>

              <TextInput
                mode="outlined"
                label="Mật khẩu mới"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={styles.input}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              <TextInput
                mode="outlined"
                label="Xác nhận mật khẩu"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                style={styles.input}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
              />

              {error ? (
                <HelperText type="error" visible={true}>
                  {error}
                </HelperText>
              ) : null}

              <View style={styles.requirements}>
                <Text style={styles.requirementsTitle}>Yêu cầu:</Text>
                <View style={styles.requirement}>
                  <Ionicons
                    name={
                      firstName.trim() && lastName.trim()
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={20}
                    color={
                      firstName.trim() && lastName.trim()
                        ? "#22c55e"
                        : "#6b7280"
                    }
                  />
                  <Text style={styles.requirementText}>Họ và tên</Text>
                </View>
                <View style={styles.requirement}>
                  <Ionicons
                    name={
                      phone.trim() &&
                      /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(
                        phone.trim().replace(/\s/g, "")
                      )
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={20}
                    color={
                      phone.trim() &&
                      /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(
                        phone.trim().replace(/\s/g, "")
                      )
                        ? "#22c55e"
                        : "#6b7280"
                    }
                  />
                  <Text style={styles.requirementText}>
                    Số điện thoại (10 số)
                  </Text>
                </View>
                <View style={styles.requirement}>
                  <Ionicons
                    name={
                      newPassword.length >= 8
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={20}
                    color={newPassword.length >= 8 ? "#22c55e" : "#6b7280"}
                  />
                  <Text style={styles.requirementText}>
                    Mật khẩu ít nhất 8 ký tự
                  </Text>
                </View>
                <View style={styles.requirement}>
                  <Ionicons
                    name={
                      newPassword === confirmPassword && newPassword
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={20}
                    color={
                      newPassword === confirmPassword && newPassword
                        ? "#22c55e"
                        : "#6b7280"
                    }
                  />
                  <Text style={styles.requirementText}>
                    Mật khẩu xác nhận khớp
                  </Text>
                </View>
              </View>

              <Button
                mode="contained"
                onPress={handleChangePassword}
                loading={submitting}
                disabled={
                  submitting ||
                  !firstName.trim() ||
                  !lastName.trim() ||
                  !phone.trim() ||
                  !newPassword ||
                  newPassword.length < 8 ||
                  newPassword !== confirmPassword
                }
                style={styles.button}
              >
                Kích hoạt tài khoản
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#2563eb"
            />
            <Text style={styles.infoText}>
              Sau khi kích hoạt thành công, bạn sẽ được chuyển vào ứng dụng ngay
              lập tức. Sử dụng email và mật khẩu mới để đăng nhập lần sau.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
    marginTop: 8,
  },
  input: {
    marginBottom: 12,
  },
  requirements: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  requirementText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6b7280",
  },
  button: {
    marginTop: 8,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 8,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#1e40af",
    lineHeight: 20,
  },
});
