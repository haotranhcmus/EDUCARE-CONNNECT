import { router, Stack } from "expo-router";
import { IconButton } from "react-native-paper";

export default function SessionIdLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
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
          title: "Chi tiết phiên học",
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              iconColor="#fff"
              size={24}
              onPress={() => {
                // Always navigate to sessions index tab
                router.replace("/(teacher)/sessions");
              }}
            />
          ),
        }}
      />
      <Stack.Screen
        name="log"
        options={{
          title: "Ghi nhận buổi học",
        }}
      />
      <Stack.Screen
        name="log-details"
        options={{
          title: "Chi tiết ghi nhận",
        }}
      />
    </Stack>
  );
}
