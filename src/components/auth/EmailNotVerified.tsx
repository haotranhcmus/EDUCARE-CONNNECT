import { supabase } from "@/lib/supabase/client";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface EmailNotVerifiedProps {
  email: string;
  onResendSuccess?: () => void;
  onClose?: () => void;
}

export function EmailNotVerified({
  email,
  onResendSuccess,
  onClose,
}: EmailNotVerifiedProps) {
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResendEmail = async () => {
    if (cooldown > 0) {
      Alert.alert(
        "Vui lòng đợi",
        `Bạn có thể gửi lại email sau ${cooldown} giây.`
      );
      return;
    }

    setIsResending(true);

    try {
      // Resend confirmation email
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) throw error;

      Alert.alert(
        "Email đã được gửi",
        "Chúng tôi đã gửi lại email xác nhận. Vui lòng kiểm tra hộp thư của bạn (kể cả thư mục Spam).",
        [{ text: "OK" }]
      );

      // Start cooldown (60 seconds)
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      onResendSuccess?.();
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.message || "Không thể gửi lại email. Vui lòng thử lại sau."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>📧</Text>
      </View>

      <Text style={styles.title}>Email chưa được xác nhận</Text>

      <Text style={styles.message}>Chúng tôi đã gửi email xác nhận đến:</Text>

      <View style={styles.emailContainer}>
        <Text style={styles.email}>{email}</Text>
      </View>

      <Text style={styles.instruction}>
        Vui lòng kiểm tra hộp thư và nhấn vào link xác nhận để hoàn tất đăng ký.
      </Text>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Mẹo:</Text>
        <Text style={styles.tipsText}>
          • Kiểm tra cả thư mục Spam/Junk{"\n"}• Thêm chúng tôi vào danh bạ để
          tránh lọc spam{"\n"}• Email có thể mất vài phút để đến
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.resendButton,
          (isResending || cooldown > 0) && styles.resendButtonDisabled,
        ]}
        onPress={handleResendEmail}
        disabled={isResending || cooldown > 0}
      >
        {isResending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.resendButtonText}>
            {cooldown > 0
              ? `Gửi lại sau ${cooldown}s`
              : "📨 Gửi lại email xác nhận"}
          </Text>
        )}
      </TouchableOpacity>

      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Đóng</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.note}>
        Sau khi xác nhận email, bạn có thể đăng nhập vào ứng dụng.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 16,
    maxWidth: 440,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2d3748",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: "#4a5568",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 22,
  },
  emailContainer: {
    backgroundColor: "#f7fafc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  email: {
    fontSize: 15,
    fontWeight: "600",
    color: "#667eea",
    textAlign: "center",
  },
  instruction: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  tipsContainer: {
    backgroundColor: "#fffbeb",
    borderLeftWidth: 4,
    borderLeftColor: "#fbbf24",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: "#92400e",
    lineHeight: 20,
  },
  resendButton: {
    backgroundColor: "#667eea",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  resendButtonDisabled: {
    backgroundColor: "#cbd5e0",
    shadowOpacity: 0.1,
  },
  resendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  closeButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#f7fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  closeButtonText: {
    color: "#4a5568",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  note: {
    fontSize: 12,
    color: "#a0aec0",
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
  },
});
