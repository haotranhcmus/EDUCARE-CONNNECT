import { useSignUp } from "@/src/hooks/useAuth";
import { SignUpFormData, signUpSchema } from "@/src/utils/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mutate: signUp, isPending, error } = useSignUp();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
      phone: "",
      school: "",
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    signUp(data, {
      onSuccess: () => {
        router.replace("/(teacher)");
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text variant="displaySmall" style={styles.title}>
              Tạo tài khoản
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Bắt đầu quản lý học sinh của bạn
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <HelperText
              type="error"
              visible={!!error}
              style={styles.errorMessage}
            >
              {error.message || "Đăng ký thất bại. Vui lòng thử lại."}
            </HelperText>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* First Name */}
            <Controller
              control={control}
              name="first_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    mode="outlined"
                    label="Tên *"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.first_name}
                    left={<TextInput.Icon icon="account" />}
                  />
                  <HelperText type="error" visible={!!errors.first_name}>
                    {errors.first_name?.message}
                  </HelperText>
                </View>
              )}
            />

            {/* Last Name */}
            <Controller
              control={control}
              name="last_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    mode="outlined"
                    label="Họ *"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.last_name}
                    left={<TextInput.Icon icon="account" />}
                  />
                  <HelperText type="error" visible={!!errors.last_name}>
                    {errors.last_name?.message}
                  </HelperText>
                </View>
              )}
            />

            {/* Email */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    mode="outlined"
                    label="Email *"
                    placeholder="your.email@example.com"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    left={<TextInput.Icon icon="email" />}
                  />
                  <HelperText type="error" visible={!!errors.email}>
                    {errors.email?.message}
                  </HelperText>
                </View>
              )}
            />

            {/* Phone */}
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    mode="outlined"
                    label="Số điện thoại"
                    placeholder="0912345678"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.phone}
                    keyboardType="phone-pad"
                    left={<TextInput.Icon icon="phone" />}
                  />
                  <HelperText type="error" visible={!!errors.phone}>
                    {errors.phone?.message}
                  </HelperText>
                </View>
              )}
            />

            {/* School */}
            <Controller
              control={control}
              name="school"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    mode="outlined"
                    label="Trường/Cơ sở"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.school}
                    left={<TextInput.Icon icon="school" />}
                  />
                  <HelperText type="error" visible={!!errors.school}>
                    {errors.school?.message}
                  </HelperText>
                </View>
              )}
            />

            {/* Password */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    mode="outlined"
                    label="Mật khẩu *"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.password}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? "eye-off" : "eye"}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                  />
                  <HelperText type="error" visible={!!errors.password}>
                    {errors.password?.message}
                  </HelperText>
                </View>
              )}
            />

            {/* Confirm Password */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    mode="outlined"
                    label="Xác nhận mật khẩu *"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.confirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    left={<TextInput.Icon icon="lock-check" />}
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? "eye-off" : "eye"}
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      />
                    }
                  />
                  <HelperText type="error" visible={!!errors.confirmPassword}>
                    {errors.confirmPassword?.message}
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
              Đăng ký
            </Button>
          </View>

          {/* Sign In Link */}
          <View style={styles.footer}>
            <Text variant="bodyMedium">Đã có tài khoản? </Text>
            <Link href="/(auth)/login" asChild>
              <Text variant="bodyMedium" style={styles.signInLink}>
                Đăng nhập
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
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
    marginBottom: 8,
  },
  submitButton: {
    paddingVertical: 6,
    marginTop: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInLink: {
    color: "#6366F1",
    fontWeight: "bold",
  },
});
