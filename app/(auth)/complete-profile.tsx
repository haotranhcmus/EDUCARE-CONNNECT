import { supabase } from "@/lib/supabase/client";
import { useParentProfile, useUpdateProfile } from "@/src/hooks/useProfile";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Button, Text, TextInput } from "react-native-paper";

export default function CompleteProfileScreen() {
  const { data: profile, isLoading } = useParentProfile();
  const updateProfile = useUpdateProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [address, setAddress] = useState("");
  const [activating, setActivating] = useState(false);

  // Initialize state when profile loads
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
      setOccupation(profile.occupation || "");
      setAddress(profile.address || "");
    }
  }, [profile]);

  const handleComplete = async () => {
    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập họ và tên.");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập số điện thoại.");
      return;
    }

    // Validate phone format (simple Vietnamese phone number validation)
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(phone.trim().replace(/\s/g, ""))) {
      Alert.alert(
        "Số điện thoại không hợp lệ",
        "Vui lòng nhập số điện thoại hợp lệ (10 số, bắt đầu bằng 0)."
      );
      return;
    }

    try {
      setActivating(true);

      // 1. Update profile
      await updateProfile.mutateAsync({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        occupation: occupation.trim() || undefined,
        address: address.trim() || undefined,
      });

      // 2. Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !user.email) {
        throw new Error("User not found");
      }

      // 3. Activate student_parents relationship
      const { data: activatedData, error: activateError } = await supabase
        .from("student_parents")
        .update({
          parent_id: user.id,
          status: "active",
          activated_at: new Date().toISOString(),
        })
        .eq("parent_email", user.email)
        .eq("status", "invited")
        .select();

      if (activateError) {
        throw activateError;
      }

      setActivating(false);

      Alert.alert(
        "Kích hoạt thành công! 🎉",
        "Tài khoản của bạn đã được kích hoạt. Chào mừng bạn đến với EduCare Connect!",
        [
          {
            text: "Bắt đầu",
            onPress: () => router.replace("/(parent)" as any),
          },
        ]
      );
    } catch (error) {
      setActivating(false);
      Alert.alert(
        "Lỗi",
        "Không thể hoàn tất đăng ký. Vui lòng thử lại hoặc liên hệ giáo viên."
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6750A4" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="person-circle" size={64} color="#6750A4" />
          <Text style={styles.headerTitle}>Hoàn tất hồ sơ</Text>
          <Text style={styles.headerSubtitle}>
            Vui lòng cung cấp một số thông tin cơ bản để hoàn tất việc đăng ký
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân *</Text>

          <TextInput
            label="Họ *"
            value={lastName}
            onChangeText={setLastName}
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#6750A4"
            placeholder="Nhập họ của bạn"
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Tên *"
            value={firstName}
            onChangeText={setFirstName}
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#6750A4"
            placeholder="Nhập tên của bạn"
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Số điện thoại *"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#6750A4"
            placeholder="Nhập số điện thoại (10 số)"
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
          />

          <Text style={styles.sectionTitle}>Thông tin bổ sung (tùy chọn)</Text>

          <TextInput
            label="Nghề nghiệp"
            value={occupation}
            onChangeText={setOccupation}
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#6750A4"
            placeholder="Nhập nghề nghiệp"
            left={<TextInput.Icon icon="briefcase" />}
          />

          <TextInput
            label="Địa chỉ"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#6750A4"
            placeholder="Nhập địa chỉ"
            multiline
            numberOfLines={2}
            left={<TextInput.Icon icon="home" />}
          />

          {/* Info message */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#2196F3" />
            <Text style={styles.infoText}>
              Thông tin này sẽ giúp giáo viên liên lạc với bạn khi cần thiết.
              Sau khi hoàn tất, tài khoản của bạn sẽ được kích hoạt và bạn có
              thể xem thông tin học sinh.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleComplete}
            loading={updateProfile.isPending || activating}
            disabled={updateProfile.isPending || activating}
            style={styles.completeButton}
            buttonColor="#6750A4"
            icon="check-circle"
          >
            {activating
              ? "Đang kích hoạt tài khoản..."
              : "Hoàn tất & Kích hoạt"}
          </Button>
        </View>

        {/* Requirements */}
        <View style={styles.requirements}>
          <Text style={styles.requirementsTitle}>Thông tin bắt buộc:</Text>
          <View style={styles.requirementItem}>
            <Ionicons
              name={firstName.trim() ? "checkmark-circle" : "close-circle"}
              size={16}
              color={firstName.trim() ? "#4CAF50" : "#999"}
            />
            <Text
              style={[
                styles.requirementText,
                firstName.trim() && styles.requirementMet,
              ]}
            >
              Tên
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons
              name={lastName.trim() ? "checkmark-circle" : "close-circle"}
              size={16}
              color={lastName.trim() ? "#4CAF50" : "#999"}
            />
            <Text
              style={[
                styles.requirementText,
                lastName.trim() && styles.requirementMet,
              ]}
            >
              Họ
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons
              name={phone.trim() ? "checkmark-circle" : "close-circle"}
              size={16}
              color={phone.trim() ? "#4CAF50" : "#999"}
            />
            <Text
              style={[
                styles.requirementText,
                phone.trim() && styles.requirementMet,
              ]}
            >
              Số điện thoại
            </Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
  actions: {
    padding: 16,
  },
  completeButton: {
    paddingVertical: 8,
  },
  requirements: {
    marginHorizontal: 16,
    marginBottom: 32,
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
});
