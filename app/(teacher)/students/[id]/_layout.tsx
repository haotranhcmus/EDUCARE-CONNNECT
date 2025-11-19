import { Stack } from "expo-router";

export default function StudentIdLayout() {
  return (
    <Stack
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
        name="details"
        options={{
          title: "Chi tiết học sinh",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "Chỉnh sửa học sinh",
          presentation: "modal",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="parents"
        options={{
          title: "Quản lý phụ huynh",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="parent-permissions"
        options={{
          title: "Quyền truy cập",
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
