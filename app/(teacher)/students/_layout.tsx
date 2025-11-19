import { Stack } from "expo-router";

export default function StudentsLayout() {
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
        name="index"
        options={{
          title: "Học sinh",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Thêm học sinh mới",
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
