import { Stack } from "expo-router";

export default function SessionsLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
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
          title: "Lịch phiên học",
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Thêm buổi học",
          presentation: "modal",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
