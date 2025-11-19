import { useStudentInfo } from "@/src/hooks/useParentStudents";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function StudentDetailStackLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: student, isLoading } = useStudentInfo(id || "");

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color="#6750A4" />
      </View>
    );
  }

  const title = student
    ? `${student.first_name} ${student.last_name}`
    : "Chi tiết học sinh";

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#6750A4",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "700",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: title,
          headerTitle: title,
        }}
      />
      <Stack.Screen
        name="sessions"
        options={{
          title: "Lịch sử buổi học",
          headerTitle: "Lịch sử buổi học",
        }}
      />
      <Stack.Screen
        name="logs"
        options={{
          title: "Nhật ký buổi học",
          headerTitle: "Nhật ký buổi học",
        }}
      />
      <Stack.Screen
        name="evaluations"
        options={{
          title: "Đánh giá của giáo viên",
          headerTitle: "Đánh giá của giáo viên",
        }}
      />
      <Stack.Screen
        name="goals"
        options={{
          title: "Mục tiêu & Phát triển",
          headerTitle: "Mục tiêu & Phát triển",
        }}
      />
      <Stack.Screen
        name="info"
        options={{
          title: "Thông tin & Quyền",
          headerTitle: "Thông tin & Quyền",
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
