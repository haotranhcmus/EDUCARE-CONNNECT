import {
  useParentProfile,
  useUpdateProfile,
  useUploadAvatar,
} from "@/src/hooks/useProfile";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, Button, Text, TextInput } from "react-native-paper";

export default function EditProfileScreen() {
  const { data: profile, isLoading } = useParentProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Initialize state when profile loads
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
      setOccupation(profile.occupation || "");
      setEmergencyContact(profile.emergency_contact || "");
      setAddress(profile.address || "");
    }
  }, [profile]);

  const handlePickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập",
        "Cần quyền truy cập thư viện ảnh để chọn ảnh đại diện."
      );
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập họ và tên.");
      return;
    }

    try {
      let avatarUrl = profile?.avatar_url;

      // Upload avatar if changed
      if (avatarUri) {
        const fileName = `avatar_${Date.now()}.jpg`;
        const uploadResult = await uploadAvatar.mutateAsync({
          fileUri: avatarUri,
          fileName,
        });
        avatarUrl = uploadResult.url;
      }

      // Update profile
      await updateProfile.mutateAsync({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined,
        occupation: occupation.trim() || undefined,
        emergency_contact: emergencyContact.trim() || undefined,
        address: address.trim() || undefined,
        avatar_url: avatarUrl,
      });

      Alert.alert("Thành công", "Đã cập nhật thông tin cá nhân.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6750A4" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  const displayAvatarUri = avatarUri || profile?.avatar_url;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handlePickImage}
          >
            {displayAvatarUri ? (
              <Image
                source={{ uri: displayAvatarUri }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person" size={48} color="#6750A4" />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Nhấn để thay đổi ảnh đại diện</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

          <TextInput
            label="Họ *"
            value={lastName}
            onChangeText={setLastName}
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#6750A4"
            placeholder="Nhập họ"
          />

          <TextInput
            label="Tên *"
            value={firstName}
            onChangeText={setFirstName}
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#6750A4"
            placeholder="Nhập tên"
          />

          <TextInput
            label="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#6750A4"
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
          />

          <Text style={styles.sectionTitle}>Thông tin bổ sung</Text>

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
            label="Liên hệ khẩn cấp"
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#6750A4"
            placeholder="Số điện thoại liên hệ khẩn cấp"
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="alert-circle" />}
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
            numberOfLines={3}
            left={<TextInput.Icon icon="home" />}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={updateProfile.isPending || uploadAvatar.isPending}
            disabled={updateProfile.isPending || uploadAvatar.isPending}
            style={styles.saveButton}
            buttonColor="#6750A4"
          >
            Lưu thay đổi
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.back()}
            disabled={updateProfile.isPending || uploadAvatar.isPending}
            style={styles.cancelButton}
          >
            Hủy
          </Button>
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
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#E8DEF8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6750A4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarHint: {
    fontSize: 13,
    color: "#666",
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  actions: {
    padding: 16,
    gap: 12,
    marginBottom: 32,
  },
  saveButton: {
    paddingVertical: 8,
  },
  cancelButton: {
    paddingVertical: 8,
  },
});
