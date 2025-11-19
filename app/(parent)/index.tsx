import { useMyStudents } from "@/src/hooks/useParents";
import {
  useRecentSessions,
  useStudentGoalProgress,
  useStudentStats,
  useUpcomingSessions,
} from "@/src/hooks/useParentStudents";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, Card, ProgressBar } from "react-native-paper";

export default function ParentDashboard() {
  const { data: students = [], isLoading: studentsLoading } = useMyStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [showStudentPicker, setShowStudentPicker] = useState(false);

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
  const { data: stats, isLoading: statsLoading } = useStudentStats(
    studentId || ""
  );
  const { data: upcomingSessions = [], isLoading: upcomingLoading } =
    useUpcomingSessions(studentId || "");
  const { data: recentSessions = [], isLoading: recentLoading } =
    useRecentSessions(studentId || "", 3);
  const { data: goalProgress, isLoading: goalLoading } = useStudentGoalProgress(
    studentId || ""
  );

  const isLoading =
    studentsLoading ||
    statsLoading ||
    upcomingLoading ||
    recentLoading ||
    goalLoading;

  if (studentsLoading) {
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
        <Ionicons name="people-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Chưa có thông tin học sinh</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Student Selector Card */}
        <TouchableOpacity
          style={styles.studentSelectorCard}
          onPress={() => setShowStudentPicker(true)}
        >
          <View style={styles.studentSelectorContent}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={60} color="#6750A4" />
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {selectedStudent.first_name} {selectedStudent.last_name}
              </Text>
              <Text style={styles.studentMeta}>
                {selectedStudent.gender === "male" ? "Nam" : "Nữ"} •{" "}
                {calculateAge(selectedStudent.date_of_birth)} tuổi
              </Text>
            </View>
            <View style={styles.selectorButton}>
              <Ionicons name="chevron-down" size={24} color="#6750A4" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Student Picker Modal */}
        <Modal
          visible={showStudentPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowStudentPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn con</Text>
                <TouchableOpacity onPress={() => setShowStudentPicker(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.studentList}>
                {students.map((studentLink) => (
                  <TouchableOpacity
                    key={studentLink.student.id}
                    style={[
                      styles.studentItem,
                      studentLink.student.id === selectedStudentId &&
                        styles.studentItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedStudentId(studentLink.student.id);
                      setShowStudentPicker(false);
                    }}
                  >
                    <Ionicons name="person-circle" size={50} color="#6750A4" />
                    <View style={styles.studentItemInfo}>
                      <Text style={styles.studentItemName}>
                        {studentLink.student.first_name}{" "}
                        {studentLink.student.last_name}
                      </Text>
                      <Text style={styles.studentItemMeta}>
                        {studentLink.student.gender === "male" ? "Nam" : "Nữ"} •{" "}
                        {calculateAge(studentLink.student.date_of_birth)} tuổi
                      </Text>
                    </View>
                    {studentLink.student.id === selectedStudentId && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#6750A4"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Progress Card */}
        <Card style={styles.headerCard}>
          <Card.Content>
            {stats && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Tiến độ học tập</Text>
                <ProgressBar
                  progress={stats.progressPercent / 100}
                  color="#4CAF50"
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {stats.progressPercent}%
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
              <Text style={styles.statNumber}>
                {stats?.completedSessions || 0}
              </Text>
              <Text style={styles.statLabel}>Buổi học hoàn thành</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Ionicons name="calendar" size={32} color="#2196F3" />
              <Text style={styles.statNumber}>
                {stats?.upcomingSessions || 0}
              </Text>
              <Text style={styles.statLabel}>Buổi học sắp tới</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Ionicons name="bar-chart" size={32} color="#FF9800" />
              <Text style={styles.statNumber}>{stats?.totalSessions || 0}</Text>
              <Text style={styles.statLabel}>Tổng buổi học</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Domain Progress */}
        {goalProgress && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>📊 Tiến độ theo lĩnh vực</Text>

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
                  "chatbubbles",
                  goalProgress.language
                )}
                {renderDomainProgress("Xã hội", "people", goalProgress.social)}
                {renderDomainProgress(
                  "Tự chăm sóc",
                  "hand-left",
                  goalProgress.self_care
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>📅 Buổi học sắp tới</Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      `/(parent)/learning/${studentId}/sessions` as any
                    )
                  }
                >
                  <Text style={styles.seeAllText}>Xem tất cả →</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sessionList}>
                {upcomingSessions.slice(0, 3).map((session) => (
                  <TouchableOpacity
                    key={session.id}
                    style={styles.sessionItem}
                    onPress={() =>
                      router.push(
                        `/(parent)/learning/${studentId}/sessions` as any
                      )
                    }
                  >
                    <View style={styles.sessionIcon}>
                      <Ionicons name="time" size={24} color="#2196F3" />
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionDate}>
                        {formatDate(session.session_date)}
                      </Text>
                      <Text style={styles.sessionTime}>
                        {session.start_time} - {session.end_time}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>
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
                <Text style={styles.cardTitle}>🎯 Hoạt động gần đây</Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/(parent)/learning/${studentId}/logs` as any)
                  }
                >
                  <Text style={styles.seeAllText}>Xem tất cả →</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sessionList}>
                {recentSessions.map((session) => (
                  <TouchableOpacity
                    key={session.id}
                    style={styles.sessionItem}
                    onPress={() =>
                      router.push(`/(parent)/learning/${studentId}/logs` as any)
                    }
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
                      <Text style={styles.sessionNote} numberOfLines={1}>
                        Buổi học hoàn thành
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

// Helper functions
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

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
  if (!progress) return null;

  return (
    <View style={styles.domainItem}>
      <View style={styles.domainHeader}>
        <Ionicons name={icon} size={20} color="#6750A4" />
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
  headerCard: {
    backgroundColor: "#fff",
    marginBottom: 16,
    elevation: 2,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  studentMeta: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
  progressText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
    marginTop: 4,
    textAlign: "right",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    elevation: 2,
  },
  statCardContent: {
    alignItems: "center",
    paddingVertical: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    marginBottom: 16,
    elevation: 2,
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
    fontSize: 15,
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
    fontSize: 13,
    color: "#666",
    minWidth: 40,
    textAlign: "right",
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
  },
  // Student selector styles
  studentSelectorCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  studentSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectorButton: {
    marginLeft: 12,
  },
  className: {
    fontSize: 13,
    color: "#6750A4",
    fontWeight: "500",
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  studentList: {
    padding: 16,
  },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#F5F5F5",
  },
  studentItemSelected: {
    backgroundColor: "#E8DEF8",
    borderWidth: 2,
    borderColor: "#6750A4",
  },
  studentItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  studentItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  studentItemMeta: {
    fontSize: 13,
    color: "#666",
  },
  studentItemClass: {
    fontSize: 12,
    color: "#6750A4",
    fontWeight: "500",
    marginTop: 2,
  },
});
