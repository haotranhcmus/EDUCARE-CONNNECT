import { Stack } from "expo-router";

export default function ReportsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#6750A4",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Báo cáo & Phân tích",
        }}
      />
      <Stack.Screen
        name="student-progress"
        options={{
          title: "Tiến độ Học sinh",
        }}
      />
      <Stack.Screen
        name="goal-achievement"
        options={{
          title: "Đạt Mục tiêu",
        }}
      />
      <Stack.Screen
        name="behavior-analysis"
        options={{
          title: "Phân tích Hành vi",
        }}
      />
      <Stack.Screen
        name="session-effectiveness"
        options={{
          title: "Hiệu quả Buổi học",
        }}
      />
    </Stack>
  );
}
