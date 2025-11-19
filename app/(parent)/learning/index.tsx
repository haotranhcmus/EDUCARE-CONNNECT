import { useMyStudents } from "@/src/hooks/useParents";
import {
  useRecentSessions,
  useStudentGoalProgress,
  useUpcomingSessions,
} from "@/src/hooks/useParentStudents";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, Card, ProgressBar } from "react-native-paper";

export default function LearningTab() {
  const { data: students = [], isLoading: studentsLoading } = useMyStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  // Get selected student or first student
  const selectedLink =
    students.find((link) => link.student.id === selectedStudentId) ||
    students[0];
  const selectedStudent = selectedLink?.student;
  const studentId = selectedStudent?.id;

  // Update selectedStudentId when students load
  if (!selectedStudentId && students.length > 0) {
    setSelectedStudentId(students[0].student.id);
  }

  // Fetch student data based on selected student
  const { data: upcomingSessions = [], isLoading: upcomingLoading } =
    useUpcomingSessions(studentId || "");
  const { data: recentSessions = [], isLoading: recentLoading } =
    useRecentSessions(studentId || "", 5);
  const { data: goalProgress, isLoading: goalLoading } = useStudentGoalProgress(
    studentId || ""
  );

  const isLoading =
    studentsLoading || upcomingLoading || recentLoading || goalLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6750A4" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (!selectedStudent) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="school-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Chưa có thông tin học sinh</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Student Selector */}
        {students.length > 1 && (
          <Card style={styles.selectorCard}>
            <Card.Content>
              <Text style={styles.selectorLabel}>Đang xem thông tin của:</Text>
              <View style={styles.selectorButtons}>
                {students.map((studentLink) => (
                  <TouchableOpacity
                    key={studentLink.student.id}
                    style={[
                      styles.selectorButton,
                      studentLink.student.id === selectedStudentId &&
                        styles.selectorButtonActive,
                    ]}
                    onPress={() => setSelectedStudentId(studentLink.student.id)}
                  >
                    <Text
                      style={[
                        styles.selectorButtonText,
                        studentLink.student.id === selectedStudentId &&
                          styles.selectorButtonTextActive,
                      ]}
                    >
                      {studentLink.student.first_name}{" "}
                      {studentLink.student.last_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Notification Card - Similar to "Điểm danh" in the image */}
        {upcomingSessions.length > 0 && (
          <Card style={styles.notificationCard}>
            <Card.Content style={styles.notificationContent}>
              <View style={styles.notificationIconContainer}>
                <Ionicons name="calendar" size={24} color="#6750A4" />
              </View>
              <View style={styles.notificationTextContainer}>
                <Text style={styles.notificationTitle}>Buổi học sắp tới</Text>
                <Text style={styles.notificationMessage}>
                  Bạn có {upcomingSessions.length} buổi học trong 7 ngày tới
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(parent)/learning/sessions" as any,
                    params: { studentId },
                  })
                }
              >
                <Ionicons name="chevron-forward" size={24} color="#6750A4" />
              </TouchableOpacity>
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions - 4 buttons in 2 rows x 2 columns */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Thao tác nhanh</Text>
            <View style={styles.actionGrid}>
              {/* Row 1 */}
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() =>
                  router.push({
                    pathname: "/(parent)/learning/evaluations" as any,
                    params: { studentId },
                  })
                }
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#FFF3E0" }]}
                >
                  <Ionicons name="clipboard" size={32} color="#FF9800" />
                </View>
                <Text style={styles.actionText}>Nhận xét</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                onPress={() =>
                  router.push({
                    pathname: "/(parent)/learning/logs" as any,
                    params: { studentId },
                  })
                }
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#F3E5F5" }]}
                >
                  <Ionicons name="document-text" size={32} color="#9C27B0" />
                </View>
                <Text style={styles.actionText}>Nhật ký</Text>
              </TouchableOpacity>

              {/* Row 2 */}
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() =>
                  router.push({
                    pathname: "/(parent)/learning/goals" as any,
                    params: { studentId },
                  })
                }
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#E8F5E9" }]}
                >
                  <Ionicons name="trophy" size={32} color="#4CAF50" />
                </View>
                <Text style={styles.actionText}>Mục tiêu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                onPress={() =>
                  router.push({
                    pathname: "/(parent)/learning/sessions" as any,
                    params: { studentId },
                  })
                }
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#E0F2F1" }]}
                >
                  <Ionicons name="calendar" size={32} color="#009688" />
                </View>
                <Text style={styles.actionText}>Thời khóa biểu</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Buổi học sắp tới</Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/(parent)/learning/sessions" as any,
                      params: { studentId },
                    })
                  }
                >
                  <Text style={styles.seeAllText}>Xem tất cả</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sessionList}>
                {upcomingSessions.slice(0, 3).map((session: any) => (
                  <View key={session.id} style={styles.sessionItem}>
                    <View style={styles.sessionIcon}>
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color="#2196F3"
                      />
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionDate}>
                        {formatDate(session.session_date)}
                      </Text>
                      <Text style={styles.sessionTime}>
                        {session.start_time} - {session.end_time}
                      </Text>
                      {session.notes && (
                        <Text style={styles.sessionNote} numberOfLines={1}>
                          {session.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Buổi học gần đây</Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/(parent)/learning/sessions" as any,
                      params: { studentId },
                    })
                  }
                >
                  <Text style={styles.seeAllText}>Xem tất cả</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sessionList}>
                {recentSessions.map((session: any) => (
                  <View
                    key={session.id}
                    style={[styles.sessionItem, styles.completedSession]}
                  >
                    <View style={[styles.sessionIcon, styles.completedIcon]}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
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
                      {session.notes && (
                        <Text style={styles.sessionNote} numberOfLines={1}>
                          {session.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Goal Progress Overview */}
        {goalProgress && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Tiến độ mục tiêu</Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/(parent)/learning/goals" as any,
                      params: { studentId },
                    })
                  }
                >
                  <Text style={styles.seeAllText}>Chi tiết</Text>
                </TouchableOpacity>
              </View>

              {/* Domain Progress */}
              <View style={styles.domainList}>
                {renderDomainProgress(
                  "Nhận thức",
                  "bulb",
                  goalProgress.cognitive
                )}
                {renderDomainProgress(
                  "Vận động",
                  "fitness",
                  goalProgress.motor
                )}
                {renderDomainProgress(
                  "Ngôn ngữ",
                  "chatbox-ellipses",
                  goalProgress.language
                )}
                {renderDomainProgress("Xã hội", "people", goalProgress.social)}
                {renderDomainProgress(
                  "Tự phục vụ",
                  "hand-left",
                  goalProgress.self_care
                )}
              </View>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

// Helper functions
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${dayName}, ${day}/${month}`;
}

function renderDomainProgress(
  label: string,
  icon: any,
  progress?: {
    totalGoals: number;
    achievedGoals: number;
    progressPercent: number;
  }
) {
  if (!progress || progress.totalGoals === 0) return null;

  return (
    <View style={styles.domainItem}>
      <View style={styles.domainHeader}>
        <Ionicons name={icon} size={18} color="#6750A4" />
        <Text style={styles.domainLabel}>{label}</Text>
      </View>
      <View style={styles.domainProgress}>
        <ProgressBar
          progress={progress.progressPercent / 100}
          color="#6750A4"
          style={styles.domainBar}
        />
        <Text style={styles.domainText}>
          {progress.achievedGoals}/{progress.totalGoals}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
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
  selectorCard: {
    backgroundColor: "#fff",
    marginBottom: 16,
    elevation: 2,
  },
  selectorLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  selectorButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectorButtonActive: {
    backgroundColor: "#E8DEF8",
    borderColor: "#6750A4",
  },
  selectorButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  selectorButtonTextActive: {
    color: "#6750A4",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    marginBottom: 16,
    elevation: 2,
  },
  notificationCard: {
    backgroundColor: "#E8DEF8",
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 13,
    color: "#666",
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
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: "#6750A4",
    fontWeight: "500",
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionItem: {
    width: "48%",
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 16,
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
  completedSession: {
    backgroundColor: "#F1F8F4",
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  sessionNote: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  progressOverview: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  progressLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: "#6750A4",
    fontWeight: "600",
  },
  domainList: {
    gap: 16,
  },
  domainItem: {
    gap: 8,
  },
  domainHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  domainLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  domainProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  domainBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
  },
  domainText: {
    fontSize: 12,
    color: "#666",
    minWidth: 40,
    textAlign: "right",
  },
});
