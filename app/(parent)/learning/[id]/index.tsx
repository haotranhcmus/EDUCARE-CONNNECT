import {
  useRecentSessions,
  useStudentInfo,
  useStudentStats,
  useUpcomingSessions,
} from "@/src/hooks/useParentStudents";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, Card, ProgressBar } from "react-native-paper";

export default function StudentOverviewTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: student,
    isLoading: studentLoading,
    refetch: refetchStudent,
  } = useStudentInfo(id || "");
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useStudentStats(id || "");
  const { data: upcomingSessions = [], refetch: refetchUpcoming } =
    useUpcomingSessions(id || "");
  const { data: recentSessions = [], refetch: refetchRecent } =
    useRecentSessions(id || "", 5);

  const isLoading = studentLoading || statsLoading;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchStudent(),
      refetchStats(),
      refetchUpcoming(),
      refetchRecent(),
    ]);
    setRefreshing(false);
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${dayName}, ${day}/${month}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6750A4" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Không tìm thấy thông tin học sinh</Text>
      </View>
    );
  }

  const fullName = `${student.first_name} ${student.last_name}`;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Student Info Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.studentHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color="#fff" />
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {student.first_name} {student.last_name}
              </Text>
              <View style={styles.metaRow}>
                <Ionicons
                  name={student.gender === "male" ? "male" : "female"}
                  size={16}
                  color="#666"
                />
                <Text style={styles.metaText}>
                  {student.gender === "male" ? "Nam" : "Nữ"} •{" "}
                  {calculateAge(student.date_of_birth)} tuổi
                </Text>
              </View>
              <Text style={styles.birthDate}>
                Ngày sinh:{" "}
                {new Date(student.date_of_birth).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          </View>

          {stats && (
            <>
              <View style={styles.divider} />
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>
                    Tiến độ học tập tổng quan
                  </Text>
                  <Text style={styles.progressPercent}>
                    {stats.progressPercent}%
                  </Text>
                </View>
                <ProgressBar
                  progress={stats.progressPercent / 100}
                  color="#4CAF50"
                  style={styles.progressBar}
                />
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Quick Stats */}
      {stats && (
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIcon, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
              </View>
              <Text style={styles.statNumber}>{stats.completedSessions}</Text>
              <Text style={styles.statLabel}>Buổi hoàn thành</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIcon, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="calendar" size={28} color="#2196F3" />
              </View>
              <Text style={styles.statNumber}>{stats.upcomingSessions}</Text>
              <Text style={styles.statLabel}>Buổi sắp tới</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIcon, { backgroundColor: "#FFF3E0" }]}>
                <Ionicons name="bar-chart" size={28} color="#FF9800" />
              </View>
              <Text style={styles.statNumber}>{stats.totalSessions}</Text>
              <Text style={styles.statLabel}>Tổng số buổi</Text>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>📅 Buổi học sắp tới</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Xem tất cả →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sessionList}>
              {upcomingSessions.slice(0, 3).map((session) => (
                <View key={session.id} style={styles.sessionItem}>
                  <View style={styles.sessionIcon}>
                    <Ionicons name="time" size={20} color="#2196F3" />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionDate}>
                      {formatDate(session.session_date)}
                    </Text>
                    <Text style={styles.sessionTime}>
                      {session.start_time} - {session.end_time}
                    </Text>
                  </View>
                  <View style={styles.sessionBadge}>
                    <Text style={styles.sessionBadgeText}>Sắp tới</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Recent Activities */}
      {recentSessions.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>🎯 Hoạt động gần đây</Text>
            </View>

            <View style={styles.sessionList}>
              {recentSessions.map((session) => (
                <View key={session.id} style={styles.sessionItem}>
                  <View style={[styles.sessionIcon, styles.completedIcon]}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#4CAF50"
                    />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionDate}>
                      {formatDate(session.session_date)}
                    </Text>
                    <Text style={styles.sessionTime}>
                      {session.start_time} - {session.end_time}
                    </Text>
                  </View>
                  <View style={[styles.sessionBadge, styles.completedBadge]}>
                    <Text style={styles.completedBadgeText}>Hoàn thành</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>⚡ Thao tác nhanh</Text>

          <View style={styles.actionList}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push(`/(parent)/children/${id}/sessions` as any)
              }
            >
              <Ionicons name="calendar" size={22} color="#6750A4" />
              <Text style={styles.actionText}>Xem tất cả buổi học</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push(`/(parent)/children/${id}/logs` as any)
              }
            >
              <Ionicons name="document-text" size={22} color="#6750A4" />
              <Text style={styles.actionText}>Xem nhật ký buổi học</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push(`/(parent)/children/${id}/evaluations` as any)
              }
            >
              <Ionicons name="star" size={22} color="#6750A4" />
              <Text style={styles.actionText}>Xem đánh giá của giáo viên</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push(`/(parent)/children/${id}/goals` as any)
              }
            >
              <Ionicons name="trophy" size={22} color="#6750A4" />
              <Text style={styles.actionText}>Xem mục tiêu phát triển</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push(`/(parent)/children/${id}/info` as any)
              }
            >
              <Ionicons name="information-circle" size={22} color="#6750A4" />
              <Text style={styles.actionText}>Xem thông tin & quyền</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: "#999",
  },
  card: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    elevation: 2,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6750A4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 15,
    color: "#666",
  },
  birthDate: {
    fontSize: 14,
    color: "#999",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 16,
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4CAF50",
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    elevation: 2,
  },
  statCardContent: {
    alignItems: "center",
    paddingVertical: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  seeAllText: {
    fontSize: 14,
    color: "#6750A4",
    fontWeight: "500",
  },
  sessionList: {
    gap: 12,
  },
  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  sessionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  completedIcon: {
    backgroundColor: "#E8F5E9",
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 13,
    color: "#666",
  },
  sessionBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2196F3",
  },
  completedBadge: {
    backgroundColor: "#E8F5E9",
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4CAF50",
  },
  actionList: {
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
});
