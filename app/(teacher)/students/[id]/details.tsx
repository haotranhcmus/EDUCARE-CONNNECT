import { SessionCard } from "@/src/components/sessions/SessionCard";
import { useStudent, useStudentSessions } from "@/src/hooks/useStudents";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  Icon,
  IconButton,
  List,
  Surface,
  Text,
} from "react-native-paper";

export default function StudentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: student, isLoading } = useStudent(id);
  const { data: sessions = [], isLoading: isLoadingSessions } =
    useStudentSessions(id, 5);

  const handleEdit = () => {
    router.push(`/students/${id}/edit`);
  };

  const handleBack = () => {
    router.back();
  };

  const handleViewAllSessions = () => {
    // TODO: Navigate to all sessions for this student
    router.push(`/sessions?studentId=${id}`);
  };

  // Calculate statistics
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(
    (s) => s.status === "completed"
  ).length;
  const pendingSessions = sessions.filter(
    (s) => s.status === "scheduled"
  ).length;
  const completionRate =
    totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Không tìm thấy học sinh</Text>
        </View>
      </View>
    );
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active":
        return "#4caf50";
      case "paused":
        return "#ff9800";
      case "archived":
        return "#9e9e9e";
      default:
        return "#757575";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "active":
        return "Đang học";
      case "paused":
        return "Tạm dừng";
      case "archived":
        return "Lưu trữ";
      default:
        return "Không xác định";
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "other":
        return "Khác";
      default:
        return "";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header Card */}
        <Surface style={styles.headerCard} elevation={2}>
          <View style={styles.avatarContainer}>
            {student.avatar_url ? (
              <Avatar.Image size={80} source={{ uri: student.avatar_url }} />
            ) : (
              <Avatar.Text
                size={80}
                label={student.first_name[0] + student.last_name[0]}
                style={{
                  backgroundColor: getStatusColor(student.status),
                }}
              />
            )}
          </View>
          <Text variant="headlineSmall" style={styles.name}>
            {student.last_name} {student.first_name}
          </Text>
          {student.nickname && (
            <Text variant="bodyMedium" style={styles.nickname}>
              "{student.nickname}"
            </Text>
          )}
          <Chip
            mode="flat"
            style={[
              styles.statusChip,
              { backgroundColor: getStatusColor(student.status) },
            ]}
            textStyle={{ color: "#fff" }}
          >
            {getStatusLabel(student.status)}
          </Chip>
        </Surface>

        {/* Thống kê buổi học */}
        <Card style={styles.card}>
          <Card.Title
            title="Thống kê buổi học"
            right={(props) => (
              <IconButton
                {...props}
                icon="chart-bar"
                onPress={handleViewAllSessions}
              />
            )}
          />
          <Card.Content>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={styles.statValue}>
                  {totalSessions}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Tổng số buổi
                </Text>
              </View>
              <Divider style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text
                  variant="headlineMedium"
                  style={[styles.statValue, { color: "#4caf50" }]}
                >
                  {completedSessions}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Hoàn thành
                </Text>
              </View>
              <Divider style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text
                  variant="headlineMedium"
                  style={[styles.statValue, { color: "#2196f3" }]}
                >
                  {pendingSessions}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Đã lên lịch
                </Text>
              </View>
            </View>
            <Divider style={{ marginVertical: 12 }} />
            <View style={styles.progressContainer}>
              <Text variant="bodyMedium">Tỷ lệ hoàn thành</Text>
              <Text
                variant="titleLarge"
                style={[styles.progressValue, { color: "#4caf50" }]}
              >
                {completionRate}%
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Quản lý phụ huynh */}
        <Card style={styles.card}>
          <Card.Title
            title="Quản lý phụ huynh"
            left={(props) => <Icon {...props} source="account-multiple" />}
          />
          <Card.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
              Mời phụ huynh và quản lý quyền truy cập thông tin học sinh
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              icon="account-plus"
              onPress={() =>
                router.push(`/(teacher)/students/${id}/parents` as any)
              }
              style={{ flex: 1 }}
            >
              Quản lý phụ huynh
            </Button>
          </Card.Actions>
        </Card>

        {/* Buổi học gần đây */}
        <Card style={styles.card}>
          <Card.Title
            title="Buổi học gần đây"
            right={(props) =>
              sessions.length > 0 ? (
                <Button
                  mode="text"
                  onPress={handleViewAllSessions}
                  compact
                  style={{ marginRight: 8 }}
                >
                  Xem tất cả
                </Button>
              ) : null
            }
          />
          <Card.Content>
            {isLoadingSessions ? (
              <View style={styles.sessionLoadingContainer}>
                <ActivityIndicator size="small" />
                <Text style={{ marginTop: 8 }}>Đang tải buổi học...</Text>
              </View>
            ) : sessions.length > 0 ? (
              sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))
            ) : (
              <View style={styles.emptySessionsContainer}>
                <Icon source="calendar-blank" size={48} color="#ccc" />
                <Text variant="bodyMedium" style={styles.emptyText}>
                  Chưa có buổi học nào
                </Text>
                <Button
                  mode="outlined"
                  icon="plus"
                  onPress={() =>
                    router.push(`/sessions/create?studentId=${id}`)
                  }
                  style={{ marginTop: 12 }}
                >
                  Tạo buổi học mới
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Thông tin cơ bản */}
        <Card style={styles.card}>
          <Card.Title title="Thông tin cơ bản" />
          <Card.Content>
            <List.Item
              title="Giới tính"
              description={getGenderLabel(student.gender)}
              left={(props) => (
                <List.Icon {...props} icon="gender-male-female" />
              )}
            />
            <Divider />
            <List.Item
              title="Ngày sinh"
              description={format(
                new Date(student.date_of_birth),
                "dd/MM/yyyy",
                {
                  locale: vi,
                }
              )}
              left={(props) => <List.Icon {...props} icon="calendar" />}
            />
            <Divider />
            {student.diagnosis && (
              <>
                <List.Item
                  title="Chẩn đoán"
                  description={student.diagnosis}
                  left={(props) => <List.Icon {...props} icon="medical-bag" />}
                />
                <Divider />
              </>
            )}
            {student.notes && (
              <List.Item
                title="Ghi chú"
                description={student.notes}
                left={(props) => <List.Icon {...props} icon="note-text" />}
              />
            )}
          </Card.Content>
        </Card>

        {/* Thông tin hệ thống */}
        <Card style={styles.card}>
          <Card.Title title="Thông tin hệ thống" />
          <Card.Content>
            <List.Item
              title="Ngày tạo"
              description={
                student.created_at
                  ? format(new Date(student.created_at), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })
                  : "Không có"
              }
              left={(props) => <List.Icon {...props} icon="clock-outline" />}
            />
            <Divider />
            <List.Item
              title="Cập nhật lần cuối"
              description={
                student.updated_at
                  ? format(new Date(student.updated_at), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })
                  : "Không có"
              }
              left={(props) => (
                <List.Icon {...props} icon="clock-check-outline" />
              )}
            />
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
  },
  headerCard: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  name: {
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  nickname: {
    fontStyle: "italic",
    color: "#666",
    marginBottom: 12,
  },
  statusChip: {
    marginTop: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    color: "#666",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressValue: {
    fontWeight: "700",
  },
  sessionLoadingContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptySessionsContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    marginTop: 12,
    textAlign: "center",
  },
  bottomSpacer: {
    height: 24,
  },
});
