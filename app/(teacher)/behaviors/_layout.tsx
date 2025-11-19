import { Stack } from "expo-router";

export default function BehaviorsLayout() {
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
          headerShown: false,
          title: "Thư viện hành vi",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "Chi tiết hành vi", // Will be set dynamically from the screen
        }}
      />
    </Stack>
  );
}
