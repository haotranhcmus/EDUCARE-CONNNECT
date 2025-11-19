import { useSignIn } from "@/src/hooks/useAuth";
import { SignInFormData, signInSchema } from "@/src/utils/validation";
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
import {
  Button,
  HelperText,
  Icon,
  Modal,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailNotVerifiedModal, setShowEmailNotVerifiedModal] =
    useState(false);
  const [showLoginErrorModal, setShowLoginErrorModal] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const { mutate: signIn, isPending, error } = useSignIn();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignInFormData) => {
    signIn(data, {
      onSuccess: (result) => {
        // Check if this is first login (need to change password)
        const needsPasswordChange =
          result.user?.user_metadata?.first_login === true;

        if (needsPasswordChange) {
          router.replace("/(auth)/change-password-first-login");
          return;
        }

        // Regular login - redirect based on role
        router.replace("/(teacher)");
      },
      onError: (error: any) => {
        // Check if error is EMAIL_NOT_VERIFIED
        // Check both exact message and if message contains "not confirmed"
        const isEmailNotVerified =
          error.message === "EMAIL_NOT_VERIFIED" ||
          error.message?.toLowerCase().includes("email not confirmed") ||
          error.message?.toLowerCase().includes("email_not_confirmed");

        if (isEmailNotVerified) {
          setUnverifiedEmail(error.email || data.email);
          setShowEmailNotVerifiedModal(true);
        } else {
          // Show login error modal for other errors
          let errorMsg = "Email hoặc mật khẩu không chính xác";

          if (
            error.message?.toLowerCase().includes("invalid login credentials")
          ) {
            errorMsg = "Email hoặc mật khẩu không chính xác";
          } else if (
            error.message?.toLowerCase().includes("email") &&
            error.message?.toLowerCase().includes("password")
          ) {
            errorMsg = "Email hoặc mật khẩu không chính xác";
          } else if (error.message) {
            errorMsg = error.message;
          }

          setLoginErrorMessage(errorMsg);
          setShowLoginErrorModal(true);
        }
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
              Educare Connect
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Đăng nhập vào tài khoản của bạn
            </Text>
          </View>

          {/* Error Message */}
          {error &&
            error.message !== "EMAIL_NOT_VERIFIED" &&
            !error.message?.toLowerCase().includes("email not confirmed") &&
            !error.message?.toLowerCase().includes("email_not_confirmed") &&
            !showLoginErrorModal && (
              <HelperText
                type="error"
                visible={!!error}
                style={styles.errorMessage}
              >
                {error.message || "Đăng nhập thất bại. Vui lòng thử lại."}
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
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    textContentType="emailAddress"
                    left={<TextInput.Icon icon="email" />}
                  />
                  <HelperText type="error" visible={!!errors.email}>
                    {errors.email?.message}
                  </HelperText>
                </View>
              )}
            />

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    mode="outlined"
                    label="Mật khẩu"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.password}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    textContentType="password"
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

            {/* Forgot Password Link */}
            <Link href="/(auth)/forgot-password" asChild>
              <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
            </Link>

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={isPending}
              disabled={isPending}
              style={styles.submitButton}
            >
              Đăng nhập
            </Button>
          </View>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <Text variant="bodyMedium">Chưa có tài khoản? </Text>
            <Link href={"/role-selection" as any} asChild>
              <Text variant="bodyMedium" style={styles.signUpLink}>
                Đăng ký ngay
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>

      {/* Email Not Verified Modal */}
      <Portal>
        <Modal
          visible={showEmailNotVerifiedModal}
          onDismiss={() => setShowEmailNotVerifiedModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            {/* Icon */}
            {/* <View style={styles.modalIconContainer}>
              <Icon source="email-alert" size={64} color="#F59E0B" />
            </View> */}

            {/* Title */}
            <Text variant="titleLarge" style={styles.modalTitle}>
              Email chưa được xác nhận
            </Text>

            {/* Message */}
            <Text variant="bodyLarge" style={styles.modalMessage}>
              Tài khoản của bạn chưa được kích hoạt. Vui lòng kiểm tra email{" "}
              <Text style={styles.emailText}>{unverifiedEmail}</Text> và nhấn
              vào link xác nhận để hoàn tất đăng ký.
            </Text>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text variant="bodyMedium" style={styles.instructionsTitle}>
                📧 Hướng dẫn:
              </Text>
              <Text variant="bodyMedium" style={styles.instructionText}>
                1. Mở hộp thư đến của email {unverifiedEmail}
              </Text>
              <Text variant="bodyMedium" style={styles.instructionText}>
                2. Tìm email từ Educare Connect (kiểm tra cả thư mục Spam)
              </Text>
              <Text variant="bodyMedium" style={styles.instructionText}>
                3. Nhấn vào link "Xác nhận email" trong email
              </Text>
              <Text variant="bodyMedium" style={styles.instructionText}>
                4. Quay lại và đăng nhập
              </Text>
            </View>

            {/* Note */}
            <View style={styles.noteContainer}>
              <Icon source="information" size={20} color="#6366F1" />
              <Text variant="bodySmall" style={styles.noteText}>
                Không nhận được email? Vui lòng kiểm tra thư mục Spam hoặc liên
                hệ hỗ trợ.
              </Text>
            </View>

            {/* Close Button */}
            <Button
              mode="contained"
              onPress={() => setShowEmailNotVerifiedModal(false)}
              style={styles.modalButton}
            >
              Đã hiểu
            </Button>
          </View>
        </Modal>

        {/* Login Error Modal */}
        <Modal
          visible={showLoginErrorModal}
          onDismiss={() => setShowLoginErrorModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            {/* Icon */}
            <View style={styles.errorIconContainer}>
              <Icon source="alert-circle" size={64} color="#EF4444" />
            </View>

            {/* Title */}
            <Text variant="titleLarge" style={styles.errorModalTitle}>
              Đăng nhập thất bại
            </Text>

            {/* Message */}
            <Text variant="bodyLarge" style={styles.modalMessage}>
              {loginErrorMessage}
            </Text>

            {/* Instructions */}
            <View style={styles.errorInstructionsContainer}>
              <Text variant="bodyMedium" style={styles.instructionsTitle}>
                💡 Vui lòng kiểm tra:
              </Text>
              <View style={styles.checkListItem}>
                <Icon source="check" size={20} color="#6366F1" />
                <Text variant="bodyMedium" style={styles.checkListText}>
                  Email được nhập đúng định dạng
                </Text>
              </View>
              <View style={styles.checkListItem}>
                <Icon source="check" size={20} color="#6366F1" />
                <Text variant="bodyMedium" style={styles.checkListText}>
                  Mật khẩu không có lỗi chính tả
                </Text>
              </View>
              <View style={styles.checkListItem}>
                <Icon source="check" size={20} color="#6366F1" />
                <Text variant="bodyMedium" style={styles.checkListText}>
                  Tài khoản đã được tạo và kích hoạt
                </Text>
              </View>
            </View>

            {/* Suggestions */}
            <View style={styles.suggestionContainer}>
              <Icon source="lightbulb-on" size={20} color="#F59E0B" />
              <Text variant="bodySmall" style={styles.suggestionText}>
                Nếu bạn là <Text style={styles.boldText}>phụ huynh</Text>, tài
                khoản cần được giáo viên tạo. Nếu quên mật khẩu, nhấn "Quên mật
                khẩu?" ở màn hình đăng nhập.
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.modalButtonContainer}>
              <Button
                mode="outlined"
                onPress={() => setShowLoginErrorModal(false)}
                style={styles.modalButtonOutlined}
              >
                Thử lại
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
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
    marginBottom: 8,
  },
  forgotPassword: {
    color: "#6366F1",
    textAlign: "right",
    marginTop: 8,
    marginBottom: 24,
  },
  submitButton: {
    paddingVertical: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpLink: {
    color: "#6366F1",
    fontWeight: "bold",
  },
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 16,
    padding: 24,
    maxHeight: "80%",
  },
  modalContent: {
    alignItems: "center",
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 40,
    textAlign: "center",
  },
  modalMessage: {
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  emailText: {
    fontWeight: "bold",
    color: "#6366F1",
  },
  instructionsContainer: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    marginBottom: 16,
  },
  instructionsTitle: {
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  instructionText: {
    color: "#4B5563",
    marginBottom: 8,
    lineHeight: 20,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EEF2FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: "100%",
  },
  noteText: {
    flex: 1,
    color: "#4338CA",
    marginLeft: 8,
    lineHeight: 18,
  },
  modalButton: {
    paddingVertical: 6,
    minWidth: 120,
    marginBottom: 20,
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorModalTitle: {
    fontWeight: "bold",
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 16,
  },
  errorInstructionsContainer: {
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  checkListItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  checkListText: {
    flex: 1,
    color: "#4B5563",
    lineHeight: 20,
  },
  suggestionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: "100%",
    gap: 8,
  },
  suggestionText: {
    flex: 1,
    color: "#92400E",
    lineHeight: 18,
  },
  boldText: {
    fontWeight: "bold",
    color: "#78350F",
  },
  modalButtonContainer: {
    width: "100%",
    gap: 12,
  },
  modalButtonOutlined: {
    paddingVertical: 6,
  },
});
