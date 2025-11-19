import { useStudentSessions } from "@/src/hooks/useParentStudents";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Card } from "react-native-paper";

export default function SessionsScreen() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const { data: sessions = [], isLoading } = useStudentSessions(
    studentId || ""
  );

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6750A4" />
      </View>
    );
  }

  const groupedSessions = sessions.reduce((acc: any, session: any) => {
    const date = new Date(session.session_date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {});

  return (
    <>
      <Stack.Screen
        options={{
          title: "Lịch sử buổi học",
          headerStyle: { backgroundColor: "#6750A4" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" },
        }}
      />
      <ScrollView style={styles.container}>
        {Object.keys(groupedSessions).length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có buổi học nào</Text>
          </View>
        ) : (
          Object.keys(groupedSessions).map((month) => (
            <View key={month} style={styles.monthSection}>
              <Text style={styles.monthTitle}>{month}</Text>
              {groupedSessions[month].map((session: any) => (
                <Card key={session.id} style={styles.card}>
                  <Card.Content>
                    <View style={styles.sessionHeader}>
                      <View style={styles.sessionInfo}>
                        <Text style={styles.sessionDate}>
                          {new Date(session.session_date).toLocaleDateString(
                            "vi-VN",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "numeric",
                            }
                          )}
                        </Text>
                        <Text style={styles.sessionTime}>
                          {session.start_time} - {session.end_time}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              session.status === "completed"
                                ? "#4CAF50"
                                : session.status === "scheduled"
                                ? "#2196F3"
                                : "#FF9800",
                          },
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {session.status === "completed"
                            ? "Hoàn thành"
                            : session.status === "scheduled"
                            ? "Đã lên lịch"
                            : "Đã hủy"}
                        </Text>
                      </View>
                    </View>
                    {session.notes && (
                      <Text style={styles.notes}>{session.notes}</Text>
                    )}
                  </Card.Content>
                </Card>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999",
  },
  monthSection: {
    marginBottom: 24,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6750A4",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#fff",
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textTransform: "capitalize",
  },
  sessionTime: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  notes: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
