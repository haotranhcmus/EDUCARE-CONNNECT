import { authService } from "@/src/services/auth.service";
import { Colors } from "@/src/theme/colors";
import { TeacherSignUpData } from "@/src/types";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TeacherRegisterScreen() {
  const params = useLocalSearchParams<{ role: string }>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    phone: "",
    school: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "Vui lòng nhập tên";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Vui lòng nhập họ";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data: TeacherSignUpData = {
        role: "teacher",
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || undefined,
        school: formData.school || undefined,
      };


      await authService.signUp(data);


      Alert.alert(
        "Đăng ký thành công",
        "Tài khoản giáo viên đã được tạo. Vui lòng kiểm tra email để xác thực.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login"),
          },
        ]
      );
    } catch (error: any) {

      Alert.alert(
        "Lỗi",
        error.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.background.primary }}
    >
      <Stack.Screen
        options={{
          title: "Đăng ký Giáo viên",
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: "#fff",
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text variant="headlineMedium" style={styles.title}>
                Đăng ký tài khoản Giáo viên
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Điền thông tin để tạo tài khoản giáo viên
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label="Tên *"
                  value={formData.first_name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, first_name: text })
                  }
                  error={!!errors.first_name}
                  left={<TextInput.Icon icon="account" />}
                />
                <HelperText type="error" visible={!!errors.first_name}>
                  {errors.first_name}
                </HelperText>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label="Họ *"
                  value={formData.last_name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, last_name: text })
                  }
                  error={!!errors.last_name}
                  left={<TextInput.Icon icon="account" />}
                />
                <HelperText type="error" visible={!!errors.last_name}>
                  {errors.last_name}
                </HelperText>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label="Email *"
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  error={!!errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email" />}
                />
                <HelperText type="error" visible={!!errors.email}>
                  {errors.email}
                </HelperText>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label="Số điện thoại"
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone: text })
                  }
                  keyboardType="phone-pad"
                  left={<TextInput.Icon icon="phone" />}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label="Trường/Cơ sở"
                  value={formData.school}
                  onChangeText={(text) =>
                    setFormData({ ...formData, school: text })
                  }
                  left={<TextInput.Icon icon="school" />}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label="Mật khẩu *"
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
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
                  {errors.password}
                </HelperText>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label="Xác nhận mật khẩu *"
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    setFormData({ ...formData, confirmPassword: text })
                  }
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
                  {errors.confirmPassword}
                </HelperText>
              </View>

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
              >
                Đăng ký
              </Button>

              <Button
                mode="text"
                onPress={() => router.back()}
                disabled={loading}
                style={styles.backButton}
              >
                Quay lại
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: Colors.text.secondary,
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
  backButton: {
    marginTop: 8,
  },
});
