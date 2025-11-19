import { StudentForm } from "@/src/components/students/StudentForm";
import { useStudent, useUpdateStudent } from "@/src/hooks/useStudents";
import { StudentUpdate } from "@/src/types";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { Appbar, Text } from "react-native-paper";

export default function EditStudentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: student, isLoading } = useStudent(id);
  const { mutateAsync: updateStudent, isPending } = useUpdateStudent();

  const handleSubmit = async (data: any) => {
    if (!id) return;

    try {
      const updateData: StudentUpdate = {
        ...data,
      };
      await updateStudent({ id, data: updateData });
      Alert.alert("Thành công", "Đã cập nhật thông tin học sinh", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật học sinh");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleCancel} />
          <Appbar.Content title="Chỉnh sửa học sinh" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleCancel} />
          <Appbar.Content title="Chỉnh sửa học sinh" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <Text>Không tìm thấy học sinh</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleCancel} />
        <Appbar.Content title="Chỉnh sửa học sinh" />
      </Appbar.Header>

      <StudentForm
        initialData={{
          first_name: student.first_name,
          last_name: student.last_name,
          nickname: student.nickname || undefined,
          gender: student.gender as any,
          date_of_birth: new Date(student.date_of_birth),
          diagnosis: student.diagnosis || undefined,
          status: (student.status as any) || "active",
          notes: student.notes || undefined,
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isPending}
        isEditing={true}
      />
    </View>
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
  },
  loadingText: {
    marginTop: 16,
  },
});
