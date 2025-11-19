import { useStudentSessions } from "@/src/hooks/useParentStudents";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator, Card } from "react-native-paper";

export default function StudentLogsScreen() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();

  const { data: sessions = [], isLoading } = useStudentSessions(
    studentId || ""
  );

  // Filter only completed sessions with logs
  const completedSessionsWithLogs = sessions.filter(
    (session: any) => session.status === "completed" && session.session_log
  );

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const days = [
      "Chủ nhật",
      "Thứ hai",
      "Thứ ba",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
      "Thứ bảy",
    ];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
  };

  const getMoodLabel = (mood?: string): string => {
    const labels: { [key: string]: string } = {
      very_difficult: "Rất khó khăn",
      difficult: "Khó khăn",
      normal: "Bình thường",
      good: "Tốt",
      very_good: "Rất tốt",
    };
    return mood ? labels[mood] || mood : "Chưa ghi nhận";
  };

  const getMoodColor = (mood?: string): string => {
    const colors: { [key: string]: string } = {
      very_difficult: "#D32F2F",
      difficult: "#F57C00",
      normal: "#FFA726",
      good: "#66BB6A",
      very_good: "#4CAF50",
    };
    return mood ? colors[mood] || "#999" : "#999";
  };

  const renderStars = (level?: number) => {
    if (!level) return null;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= level ? "star" : "star-outline"}
          size={16}
          color={i <= level ? "#FFA726" : "#E0E0E0"}
        />
      );
    }
    return <View style={styles.stars}>{stars}</View>;
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Nhật ký buổi học",
            headerStyle: { backgroundColor: "#6750A4" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "700" },
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6750A4" />
          <Text style={styles.loadingText}>Đang tải nhật ký...</Text>
        </View>
      </>
    );
  }

  if (completedSessionsWithLogs.length === 0) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Nhật ký buổi học",
            headerStyle: { backgroundColor: "#6750A4" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "700" },
          }}
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có nhật ký buổi học nào</Text>
          <Text style={styles.emptySubtext}>
            Nhật ký sẽ được cập nhật sau mỗi buổi học
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Nhật ký buổi học",
          headerStyle: { backgroundColor: "#6750A4" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" },
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {completedSessionsWithLogs.map((session: any) => (
            <Card key={session.id} style={styles.card}>
              <Card.Content>
                {/* Date and Time */}
                <View style={styles.header}>
                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar" size={20} color="#6750A4" />
                    <Text style={styles.date}>
                      {formatDate(session.session_date)}
                    </Text>
                  </View>
                  <View style={styles.timeContainer}>
                    <Ionicons name="time" size={18} color="#666" />
                    <Text style={styles.time}>
                      {session.start_time} - {session.end_time}
                    </Text>
                  </View>
                </View>

                {/* Session Type */}
                <View style={styles.typeContainer}>
                  <Text style={styles.typeLabel}>Loại buổi học:</Text>
                  <Text style={styles.typeValue}>
                    {session.time_slot === "morning"
                      ? "Buổi sáng"
                      : session.time_slot === "afternoon"
                      ? "Buổi chiều"
                      : "Buổi tối"}
                  </Text>
                </View>

                <View style={styles.divider} />

                {/* Mood */}
                {session.session_log?.mood && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Tâm trạng:</Text>
                    <View
                      style={[
                        styles.moodBadge,
                        {
                          backgroundColor:
                            getMoodColor(session.session_log.mood) + "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.moodText,
                          { color: getMoodColor(session.session_log.mood) },
                        ]}
                      >
                        {getMoodLabel(session.session_log.mood)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Cooperation Level */}
                {session.session_log?.cooperation_level && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Mức độ hợp tác:</Text>
                    {renderStars(session.session_log.cooperation_level)}
                  </View>
                )}

                {/* Focus Level */}
                {session.session_log?.focus_level && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Mức độ tập trung:</Text>
                    {renderStars(session.session_log.focus_level)}
                  </View>
                )}

                {/* Energy Level */}
                {session.session_log?.energy_level && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Năng lượng:</Text>
                    {renderStars(session.session_log.energy_level)}
                  </View>
                )}

                {/* Independence Level */}
                {session.session_log?.independence_level && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Độc lập:</Text>
                    {renderStars(session.session_log.independence_level)}
                  </View>
                )}

                {/* Attitude Summary */}
                {session.session_log?.attitude_summary && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Tóm tắt thái độ</Text>
                      <Text style={styles.sectionText}>
                        {session.session_log.attitude_summary}
                      </Text>
                    </View>
                  </>
                )}

                {/* Progress Notes */}
                {session.session_log?.progress_notes && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ghi chú tiến độ</Text>
                    <Text style={styles.sectionText}>
                      {session.session_log.progress_notes}
                    </Text>
                  </View>
                )}

                {/* Challenges Faced */}
                {session.session_log?.challenges_faced && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thách thức gặp phải</Text>
                    <Text style={styles.sectionText}>
                      {session.session_log.challenges_faced}
                    </Text>
                  </View>
                )}

                {/* Recommendations */}
                {session.session_log?.recommendations && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Đề xuất</Text>
                    <Text style={styles.sectionText}>
                      {session.session_log.recommendations}
                    </Text>
                  </View>
                )}

                {/* Teacher Notes */}
                {session.session_log?.teacher_notes_text && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      Ghi chú của giáo viên
                    </Text>
                    <Text style={styles.sectionText}>
                      {session.session_log.teacher_notes_text}
                    </Text>
                  </View>
                )}

                {/* Overall Rating */}
                {session.session_log?.overall_rating && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingLabel}>Đánh giá chung:</Text>
                      {renderStars(session.session_log.overall_rating)}
                    </View>
                  </>
                )}
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
    </>
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
    fontWeight: "600",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#bbb",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    marginBottom: 16,
    elevation: 2,
  },
  header: {
    gap: 8,
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  date: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  time: {
    fontSize: 14,
    color: "#666",
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeLabel: {
    fontSize: 13,
    color: "#666",
  },
  typeValue: {
    fontSize: 13,
    color: "#6750A4",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  moodBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodText: {
    fontSize: 13,
    fontWeight: "600",
  },
  stars: {
    flexDirection: "row",
    gap: 4,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
});
