import { useSessions } from "@/src/hooks/useSessions";
import { useStudents } from "@/src/hooks/useStudents";
import { useAuthStore } from "@/src/stores/authStore";
import { format } from "date-fns";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useRef } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Avatar,
  Card,
  Divider,
  IconButton,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";

export default function HomeScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const { profile, isAuthenticated } = useAuthStore();
  const theme = useTheme();
  const { data: students } = useStudents();
  const { data: sessionsData } = useSessions({});

  // Scroll to top when tab is focused
  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, [])
  );

  const sessions = sessionsData || [];
  const activeStudents = students?.filter((s) => s.status === "active") || [];
  const todaySessions = sessions.filter(
    (s: any) => s.session_date === format(new Date(), "yyyy-MM-dd")
  );
  const upcomingSessions = sessions.filter(
    (s: any) =>
      new Date(s.session_date) > new Date() &&
      s.session_date !== format(new Date(), "yyyy-MM-dd")
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const getInitials = () => {
    if (!profile) return "";
    const first = profile.first_name?.charAt(0) || "";
    const last = profile.last_name?.charAt(0) || "";
    return `${first}${last}`.toUpperCase();
  };

  if (!isAuthenticated || !profile) {
    return (
      <View style={styles.container}>
        <Text>Vui lòng đăng nhập</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Profile */}
      <Surface
        style={[styles.header, { backgroundColor: theme.colors.primary }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.greetingSection}>
            <Text variant="titleSmall" style={styles.greeting}>
              {getGreeting()}
            </Text>
            <Text variant="headlineSmall" style={styles.userName}>
              {profile.first_name} {profile.last_name}
            </Text>
            <Text variant="bodyMedium" style={styles.role}>
              {profile.role === "teacher" ? "Giáo viên" : "Phụ huynh"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(teacher)/profile" as any)}
          >
            {profile.avatar_url ? (
              <Avatar.Image size={60} source={{ uri: profile.avatar_url }} />
            ) : (
              <Avatar.Text size={60} label={getInitials()} />
            )}
          </TouchableOpacity>
        </View>
      </Surface>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton
              icon="account-group"
              size={28}
              iconColor={theme.colors.primary}
            />
            <Text variant="headlineMedium" style={styles.statNumber}>
              {activeStudents.length}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Học sinh
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton
              icon="calendar-today"
              size={28}
              iconColor={theme.colors.secondary}
            />
            <Text variant="headlineMedium" style={styles.statNumber}>
              {todaySessions.length}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Hôm nay
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton
              icon="calendar-clock"
              size={28}
              iconColor={theme.colors.tertiary}
            />
            <Text variant="headlineMedium" style={styles.statNumber}>
              {upcomingSessions.length}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Đã lên lịch
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Thao tác nhanh
        </Text>
        <View style={styles.actionsGrid}>
          <Card
            style={styles.actionCard}
            onPress={() => router.push("/students")}
          >
            <Card.Content style={styles.actionContent}>
              <IconButton
                icon="account-plus"
                size={32}
                iconColor={theme.colors.primary}
              />
              <Text variant="bodyMedium" style={styles.actionText}>
                Thêm học sinh
              </Text>
            </Card.Content>
          </Card>

          <Card
            style={styles.actionCard}
            onPress={() => router.push("/sessions/create" as any)}
          >
            <Card.Content style={styles.actionContent}>
              <IconButton
                icon="calendar-plus"
                size={32}
                iconColor={theme.colors.secondary}
              />
              <Text variant="bodyMedium" style={styles.actionText}>
                Tạo buổi học
              </Text>
            </Card.Content>
          </Card>

          <Card
            style={styles.actionCard}
            onPress={() => router.push("/behaviors")}
          >
            <Card.Content style={styles.actionContent}>
              <IconButton
                icon="book-open-variant"
                size={32}
                iconColor={theme.colors.tertiary}
              />
              <Text variant="bodyMedium" style={styles.actionText}>
                Hành vi
              </Text>
            </Card.Content>
          </Card>

          <Card
            style={styles.actionCard}
            onPress={() => router.push("/(teacher)/reports" as any)}
          >
            <Card.Content style={styles.actionContent}>
              <IconButton icon="chart-bar" size={32} iconColor="#FF9800" />
              <Text variant="bodyMedium" style={styles.actionText}>
                Báo cáo
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Today's Sessions */}
      {todaySessions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Buổi học hôm nay
            </Text>
            <TouchableOpacity onPress={() => router.push("/sessions")}>
              <Text style={{ color: theme.colors.primary }}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {todaySessions.slice(0, 3).map((session: any) => (
            <Card
              key={session.id}
              style={styles.sessionCard}
              onPress={() =>
                router.push(`/sessions/${session.id}/details` as any)
              }
            >
              <Card.Content>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionTime}>
                    <IconButton icon="clock-outline" size={20} />
                    <Text variant="bodyMedium">
                      {session.start_time.slice(0, 5)} -{" "}
                      {session.end_time.slice(0, 5)}
                    </Text>
                  </View>
                  <Surface
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          session.status === "completed"
                            ? theme.colors.surfaceVariant
                            : session.status === "cancelled"
                            ? "#FFEBEE"
                            : theme.colors.primaryContainer,
                      },
                    ]}
                  >
                    <Text
                      variant="labelSmall"
                      style={{
                        color:
                          session.status === "cancelled"
                            ? "#C62828"
                            : undefined,
                        width: 80,
                        textAlign: "center",
                      }}
                    >
                      {session.status === "completed"
                        ? "Hoàn thành"
                        : session.status === "cancelled"
                        ? "Đã hủy"
                        : "Đã lên lịch"}
                    </Text>
                  </Surface>
                </View>
                <Text variant="bodySmall" style={styles.sessionLocation}>
                  {session.location || "Chưa có địa điểm"}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      {/* Recent Students */}
      {activeStudents.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Học sinh của tôi
            </Text>
            <TouchableOpacity onPress={() => router.push("/students")}>
              <Text style={{ color: theme.colors.primary }}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {activeStudents.slice(0, 4).map((student, index) => (
            <React.Fragment key={student.id}>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/students/${student.id}/details` as any)
                }
              >
                <View style={styles.studentItem}>
                  {student.avatar_url ? (
                    <Avatar.Image
                      size={48}
                      source={{ uri: student.avatar_url }}
                    />
                  ) : (
                    <Avatar.Text
                      size={48}
                      label={`${student.first_name.charAt(
                        0
                      )}${student.last_name.charAt(0)}`}
                    />
                  )}
                  <View style={styles.studentInfo}>
                    <Text variant="bodyLarge">
                      {student.first_name} {student.last_name}
                    </Text>
                    <Text variant="bodySmall" style={{ color: "#666" }}>
                      {student.diagnosis || "Chưa có chẩn đoán"}
                    </Text>
                  </View>
                  <IconButton icon="chevron-right" size={20} />
                </View>
              </TouchableOpacity>
              {index < activeStudents.slice(0, 4).length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>
      )}

      {/* Empty State */}
      {activeStudents.length === 0 && (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <IconButton icon="account-group-outline" size={64} />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              Chưa có học sinh
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Bắt đầu bằng cách thêm học sinh đầu tiên
            </Text>
            <Card
              style={styles.addButton}
              onPress={() => router.push("/students/add")}
            >
              <Card.Content style={styles.addButtonContent}>
                <IconButton icon="plus" size={24} iconColor="#fff" />
                <Text style={styles.addButtonText}>Thêm học sinh</Text>
              </Card.Content>
            </Card>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    color: "#E0E7FF",
    marginBottom: 4,
  },
  userName: {
    color: "#fff",
    fontWeight: "bold",
  },
  role: {
    color: "#E0E7FF",
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: "center",
    paddingVertical: 12,
  },
  statNumber: {
    fontWeight: "bold",
    marginTop: 4,
  },
  statLabel: {
    color: "#666",
    marginTop: 4,
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: "600",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "48%",
  },
  actionContent: {
    alignItems: "center",
    paddingVertical: 12,
  },
  actionText: {
    marginTop: 4,
    textAlign: "center",
  },
  sessionCard: {
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sessionTime: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionLocation: {
    color: "#666",
    marginLeft: 36,
  },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  studentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  emptyCard: {
    margin: 16,
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: "#6366F1",
  },
  addButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
});
