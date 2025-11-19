import { useStudentSessions } from "@/src/hooks/useParentStudents";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, Chip, Text } from "react-native-paper";

type FilterType = "all" | "upcoming" | "completed";

export default function StudentSessionsTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [filter, setFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: sessions = [],
    isLoading,
    refetch,
  } = useStudentSessions(id || "", {
    status: filter,
    limit: 50,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string): string => {
    return timeString.substring(0, 5); // HH:MM
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "#4CAF50";
      case "scheduled":
      case "upcoming":
        return "#2196F3";
      case "cancelled":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "scheduled":
      case "upcoming":
        return "Đã lên lịch";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string): any => {
    switch (status) {
      case "completed":
        return "checkmark-circle";
      case "scheduled":
      case "upcoming":
        return "calendar";
      case "cancelled":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={14}
            color="#FFC107"
          />
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6750A4" />
          <Text style={styles.loadingText}>Đang tải danh sách buổi học...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <Chip
          selected={filter === "all"}
          onPress={() => setFilter("all")}
          style={[
            styles.filterChip,
            filter === "all" && styles.filterChipActive,
          ]}
          textStyle={
            filter === "all" ? styles.filterTextActive : styles.filterText
          }
        >
          Tất cả
        </Chip>
        <Chip
          selected={filter === "upcoming"}
          onPress={() => setFilter("upcoming")}
          style={[
            styles.filterChip,
            filter === "upcoming" && styles.filterChipActive,
          ]}
          textStyle={
            filter === "upcoming" ? styles.filterTextActive : styles.filterText
          }
        >
          Đã lên lịch
        </Chip>
        <Chip
          selected={filter === "completed"}
          onPress={() => setFilter("completed")}
          style={[
            styles.filterChip,
            filter === "completed" && styles.filterChipActive,
          ]}
          textStyle={
            filter === "completed" ? styles.filterTextActive : styles.filterText
          }
        >
          Hoàn thành
        </Chip>
      </View>

      {/* Sessions List */}
      <View style={styles.listContainer}>
        {sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>Chưa có buổi học</Text>
            <Text style={styles.emptySubtitle}>
              {filter === "all"
                ? "Danh sách buổi học sẽ hiển thị tại đây"
                : filter === "upcoming"
                ? "Không có buổi học đã lên lịch"
                : "Chưa có buổi học hoàn thành"}
            </Text>
          </View>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} style={styles.sessionCard}>
              <Card.Content>
                {/* Session Header */}
                <View style={styles.sessionHeader}>
                  <View
                    style={[
                      styles.statusIcon,
                      {
                        backgroundColor: `${getStatusColor(session.status)}20`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={getStatusIcon(session.status)}
                      size={24}
                      color={getStatusColor(session.status)}
                    />
                  </View>
                  <View style={styles.sessionHeaderText}>
                    <Text style={styles.sessionDate}>
                      {formatDate(session.session_date)}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(session.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getStatusLabel(session.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Session Details */}
                <View style={styles.sessionDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {formatTime(session.start_time)} -{" "}
                      {formatTime(session.end_time)}
                    </Text>
                  </View>

                  {session.status === "completed" &&
                    session.session_log?.completed_at && (
                      <View style={styles.detailRow}>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={16}
                          color="#666"
                        />
                        <Text style={styles.detailText}>
                          Hoàn thành lúc:{" "}
                          {new Date(
                            session.session_log.completed_at
                          ).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                    )}

                  {session.session_log?.cooperation_level && (
                    <View style={styles.detailRow}>
                      <Ionicons name="happy-outline" size={16} color="#666" />
                      <Text style={styles.detailText}>Mức độ hợp tác:</Text>
                      {renderStars(session.session_log.cooperation_level)}
                    </View>
                  )}
                </View>

                {/* Session Note */}
                {session.notes && (
                  <View style={styles.noteContainer}>
                    <Text style={styles.noteLabel}>📝 Ghi chú:</Text>
                    <Text style={styles.noteText}>{session.notes}</Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </View>

      {/* Footer */}
      {sessions.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tổng số: {sessions.length} buổi học
          </Text>
        </View>
      )}
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
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterChip: {
    backgroundColor: "#f5f5f5",
  },
  filterChipActive: {
    backgroundColor: "#E8DEF8",
  },
  filterText: {
    color: "#666",
    fontSize: 13,
  },
  filterTextActive: {
    color: "#6750A4",
    fontWeight: "600",
    fontSize: 13,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  sessionCard: {
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  sessionHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  sessionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
    marginLeft: 4,
  },
  noteContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FFF9E6",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#FFC107",
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
});
