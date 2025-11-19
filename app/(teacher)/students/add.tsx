import { StudentForm } from "@/src/components/students/StudentForm";
import { useCreateStudent } from "@/src/hooks/useStudents";
import { useAuthStore } from "@/src/stores/authStore";
import { StudentInsert } from "@/src/types";
import { uploadStudentAvatar } from "@/src/utils/uploadImage";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

export default function AddStudentScreen() {
  const { user } = useAuthStore();
  const { mutateAsync: createStudent, isPending } = useCreateStudent();
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (data: any) => {
    if (!user) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
      return;
    }

    try {
      let avatarUrl = data.avatar_url;

      // Upload avatar if selected
      if (avatarUrl && avatarUrl.startsWith("file://")) {
        setUploading(true);
        const tempId = `temp-${Date.now()}`;
        avatarUrl = await uploadStudentAvatar(avatarUrl, tempId);
      }

      const studentData: StudentInsert = {
        ...data,
        profile_id: user.id,
        avatar_url: avatarUrl,
      };

      await createStudent(studentData);
      Alert.alert("Thành công", "Đã thêm học sinh mới", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể thêm học sinh");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StudentForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isPending || uploading}
        isEditing={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
