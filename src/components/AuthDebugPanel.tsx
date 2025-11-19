import { useSignOut } from "@/src/hooks/useAuth";
import { useAuthStore } from "@/src/stores/authStore";
import React from "react";
import { StyleSheet } from "react-native";
import { Avatar, Button, Card, Text } from "react-native-paper";

export default function AuthDebugPanel() {
  const { user, profile, session, isAuthenticated } = useAuthStore();
  const { mutate: signOut, isPending } = useSignOut();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card style={styles.container}>
      <Card.Title
        title="Auth Status (Debug)"
        subtitle={isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated"}
        left={(props) => <Avatar.Icon {...props} icon="account" />}
      />
      <Card.Content>
        <Text variant="labelLarge">User ID:</Text>
        <Text variant="bodyMedium" style={styles.value}>
          {user?.id || "N/A"}
        </Text>

        <Text variant="labelLarge" style={styles.label}>
          Email:
        </Text>
        <Text variant="bodyMedium" style={styles.value}>
          {user?.email || "N/A"}
        </Text>

        <Text variant="labelLarge" style={styles.label}>
          Profile:
        </Text>
        <Text variant="bodyMedium" style={styles.value}>
          {profile
            ? `${profile.first_name} ${profile.last_name} (${profile.role})`
            : "Loading..."}
        </Text>

        <Text variant="labelLarge" style={styles.label}>
          Session Expires:
        </Text>
        <Text variant="bodyMedium" style={styles.value}>
          {session?.expires_at
            ? new Date(session.expires_at * 1000).toLocaleString()
            : "N/A"}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => signOut()} loading={isPending} mode="outlined">
          Sign Out
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  label: {
    marginTop: 12,
  },
  value: {
    marginTop: 4,
    color: "#64748B",
  },
});
