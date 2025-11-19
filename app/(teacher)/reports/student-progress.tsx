import { useStudents } from "@/src/hooks/useStudents";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  Divider,
  Icon,
  ProgressBar,
  Searchbar,
  Surface,
  Text,
} from "react-native-paper";

export default function StudentProgressScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "active" | "paused" | "archived" | undefined
  >("active");

  const { data: students, isLoading } = useStudents({
    status: selectedStatus,
    search: searchQuery,
  });

  const getProgressColor = (completedSessions: number) => {
    if (completedSessions >= 20) return "#4CAF50";
    if (completedSessions >= 10) return "#FF9800";
    return "#9E9E9E";
  };

  const getProgressLevel = (completedSessions: number) => {
    if (completedSessions >= 20) return "Xuất sắc";
    if (completedSessions >= 10) return "Tốt";
    if (completedSessions >= 5) return "Trung bình";
    return "Mới bắt đầu";
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Surface style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Báo cáo Tiến độ Học sinh
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Xem chi tiết tiến độ và thành tích của từng học sinh
          </Text>
        </Surface>

        {/* Filters */}
        <View style={styles.filters}>
          <Searchbar
            placeholder="Tìm kiếm học sinh..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />

          <View style={styles.statusChips}>
            <Chip
              selected={selectedStatus === "active"}
              onPress={() => setSelectedStatus("active")}
              style={styles.chip}
            >
              Đang học
            </Chip>
            <Chip
              selected={selectedStatus === "paused"}
              onPress={() => setSelectedStatus("paused")}
              style={styles.chip}
            >
              Tạm dừng
            </Chip>
            <Chip
              selected={selectedStatus === undefined}
              onPress={() => setSelectedStatus(undefined)}
              style={styles.chip}
            >
              Tất cả
            </Chip>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Tổng quan tiến độ ({students?.length || 0} học sinh)
          </Text>

          {isLoading ? (
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: 16, color: "#666" }}>
                Đang tải dữ liệu...
              </Text>
            </View>
          ) : students && students.length > 0 ? (
            students.map((student: any) => (
              <Card key={student.id} style={styles.studentCard}>
                <Card.Content>
                  {/* Student Header */}
                  <View style={styles.studentHeader}>
                    <View style={styles.studentInfo}>
                      <Text variant="titleMedium" style={styles.studentName}>
                        {student.first_name} {student.last_name}
                      </Text>
                      {student.nickname && (
                        <Text variant="bodySmall" style={styles.nickname}>
                          "{student.nickname}"
                        </Text>
                      )}
                    </View>
                    <Chip
                      mode="outlined"
                      style={{
                        borderColor: getProgressColor(
                          student.completed_sessions || 0
                        ),
                      }}
                      textStyle={{
                        color: getProgressColor(
                          student.completed_sessions || 0
                        ),
                        fontWeight: "600",
                      }}
                    >
                      {getProgressLevel(student.completed_sessions || 0)}
                    </Chip>
                  </View>

                  <Divider style={{ marginVertical: 12 }} />

                  {/* Stats Grid */}
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Icon
                        source="book-open-variant"
                        size={20}
                        color="#2196F3"
                      />
                      <Text variant="bodySmall" style={styles.statLabel}>
                        Tổng buổi học
                      </Text>
                      <Text variant="titleLarge" style={styles.statValue}>
                        {student.total_sessions || 0}
                      </Text>
                    </View>

                    <View style={styles.statItem}>
                      <Icon source="check-circle" size={20} color="#4CAF50" />
                      <Text variant="bodySmall" style={styles.statLabel}>
                        Hoàn thành
                      </Text>
                      <Text variant="titleLarge" style={styles.statValue}>
                        {student.completed_sessions || 0}
                      </Text>
                    </View>

                    <View style={styles.statItem}>
                      <Icon source="percent" size={20} color="#FF9800" />
                      <Text variant="bodySmall" style={styles.statLabel}>
                        Tỷ lệ
                      </Text>
                      <Text variant="titleLarge" style={styles.statValue}>
                        {student.total_sessions > 0
                          ? Math.round(
                              (student.completed_sessions /
                                student.total_sessions) *
                                100
                            )
                          : 0}
                        %
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text variant="bodySmall" style={{ color: "#666" }}>
                        Tiến độ học tập
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={{
                          color: getProgressColor(
                            student.completed_sessions || 0
                          ),
                          fontWeight: "600",
                        }}
                      >
                        {student.completed_sessions || 0} buổi
                      </Text>
                    </View>
                    <ProgressBar
                      progress={
                        student.total_sessions > 0
                          ? student.completed_sessions / student.total_sessions
                          : 0
                      }
                      color={getProgressColor(student.completed_sessions || 0)}
                      style={styles.progressBar}
                    />
                  </View>

                  {/* Last Session */}
                  {student.last_session_date && (
                    <View style={styles.lastSession}>
                      <Icon source="calendar-clock" size={16} color="#666" />
                      <Text
                        variant="bodySmall"
                        style={{ color: "#666", marginLeft: 8 }}
                      >
                        Buổi học gần nhất:{" "}
                        {format(
                          new Date(student.last_session_date),
                          "dd/MM/yyyy",
                          { locale: vi }
                        )}
                      </Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Icon source="account-search" size={64} color="#ccc" />
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  Không tìm thấy học sinh
                </Text>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  {searchQuery
                    ? "Thử tìm kiếm với từ khóa khác"
                    : "Chưa có học sinh nào trong danh sách"}
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
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
  loadingContent: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    padding: 16,
    elevation: 2,
  },
  headerTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#666",
  },
  filters: {
    padding: 16,
    backgroundColor: "#fff",
  },
  searchbar: {
    elevation: 0,
    backgroundColor: "#f5f5f5",
    marginBottom: 12,
  },
  statusChips: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 12,
  },
  studentCard: {
    marginBottom: 12,
  },
  studentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontWeight: "600",
  },
  nickname: {
    color: "#666",
    fontStyle: "italic",
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  statLabel: {
    color: "#666",
    marginTop: 4,
    marginBottom: 2,
    textAlign: "center",
  },
  statValue: {
    fontWeight: "bold",
  },
  progressSection: {
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  lastSession: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  emptyCard: {
    marginTop: 32,
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
  },
});
