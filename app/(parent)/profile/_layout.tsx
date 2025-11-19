import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#6750A4",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        headerBackTitle: "Quay lại",
        contentStyle: { backgroundColor: "#f5f5f5" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Cá nhân",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "Cập nhật thông tin",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          title: "Đổi mật khẩu",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
