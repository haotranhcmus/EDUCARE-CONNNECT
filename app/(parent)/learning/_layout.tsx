import { Stack } from "expo-router";

export default function LearningLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#f5f5f5" },
        headerStyle: {
          backgroundColor: "#6750A4",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        headerBackTitle: "Quay lại",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Học tập",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Chi tiết",
        }}
      />
      <Stack.Screen name="sessions" />
      <Stack.Screen name="logs" />
      <Stack.Screen name="evaluations" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="info" />
    </Stack>
  );
}
