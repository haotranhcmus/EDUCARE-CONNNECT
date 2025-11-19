import { useResetPassword } from "@/src/hooks/useAuth";
import {
  ResetPasswordFormData,
  resetPasswordSchema,
} from "@/src/utils/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";

export default function ForgotPasswordScreen() {
  const [emailSent, setEmailSent] = useState(false);
  const { mutate: resetPassword, isPending, error } = useResetPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPassword(data.email, {
      onSuccess: () => {
        setEmailSent(true);
      },
    });
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successContainer}>
            <Text variant="displaySmall" style={styles.successTitle}>
              ✉️
            </Text>
            <Text variant="headlineSmall" style={styles.successHeadline}>
              Kiểm tra email của bạn
            </Text>
            <Text variant="bodyLarge" style={styles.successMessage}>
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.
            </Text>
            <Button
              mode="contained"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              Quay lại đăng nhập
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            Quên mật khẩu?
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <HelperText
            type="error"
            visible={!!error}
            style={styles.errorMessage}
          >
            {error.message || "Có lỗi xảy ra. Vui lòng thử lại."}
          </HelperText>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label="Email"
                  placeholder="your.email@example.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  left={<TextInput.Icon icon="email" />}
                />
                <HelperText type="error" visible={!!errors.email}>
                  {errors.email?.message}
                </HelperText>
              </View>
            )}
          />

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            disabled={isPending}
            style={styles.submitButton}
          >
            Gửi hướng dẫn
          </Button>
        </View>

        {/* Back Link */}
        <View style={styles.footer}>
          <Text variant="bodyMedium">Nhớ mật khẩu? </Text>
          <Link href="/" asChild>
            <Text variant="bodyMedium" style={styles.backLink}>
              Quay lại đăng nhập
            </Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    color: "#6366F1",
    marginBottom: 8,
  },
  subtitle: {
    color: "#64748B",
    textAlign: "center",
  },
  errorMessage: {
    marginBottom: 16,
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  submitButton: {
    paddingVertical: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  backLink: {
    color: "#6366F1",
    fontWeight: "bold",
  },
  successContainer: {
    alignItems: "center",
  },
  successTitle: {
    fontSize: 64,
    marginBottom: 16,
  },
  successHeadline: {
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 16,
    textAlign: "center",
  },
  successMessage: {
    color: "#64748B",
    textAlign: "center",
    marginBottom: 32,
  },
  backButton: {
    paddingVertical: 6,
    minWidth: 200,
  },
});
