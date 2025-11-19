import { useStudentInfo } from "@/src/hooks/useParentStudents";
import { useMyPermissions } from "@/src/hooks/useParents";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ActivityIndicator, Card } from "react-native-paper";

export default function StudentInfoTab() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: student,
    isLoading: studentLoading,
    refetch: refetchStudent,
  } = useStudentInfo(studentId || "");
  const {
    data: permissions,
    isLoading: permissionsLoading,
    refetch: refetchPermissions,
  } = useMyPermissions(studentId || "");

  const isLoading = studentLoading || permissionsLoading;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStudent(), refetchPermissions()]);
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

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Thông tin & Quyền",
            headerStyle: { backgroundColor: "#6750A4" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "700" },
          }}
        />
        <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6750A4" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
      </>
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

  const permissionItems = [
    { key: "can_view_sessions", label: "Xem buổi học", icon: "calendar" },
    {
      key: "can_view_session_logs",
      label: "Xem nhật ký",
      icon: "document-text",
    },
    { key: "can_view_goal_evaluations", label: "Xem đánh giá", icon: "trophy" },
    {
      key: "can_view_behavior_incidents",
      label: "Xem hành vi",
      icon: "warning",
    },
    { key: "can_view_media", label: "Xem ảnh/video", icon: "images" },
    { key: "can_message_teacher", label: "Nhắn tin", icon: "chatbubbles" },
    {
      key: "can_receive_notifications",
      label: "Nhận thông báo",
      icon: "notifications",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Basic Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>📋 Thông tin cơ bản</Text>

          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Họ và tên:</Text>
              <Text style={styles.infoValue}>
                {student.first_name} {student.last_name}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name={student.gender === "male" ? "male" : "female"}
                size={20}
                color="#666"
              />
              <Text style={styles.infoLabel}>Giới tính:</Text>
              <Text style={styles.infoValue}>
                {student.gender === "male" ? "Nam" : "Nữ"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Ngày sinh:</Text>
              <Text style={styles.infoValue}>
                {new Date(student.date_of_birth).toLocaleDateString("vi-VN")}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Tuổi:</Text>
              <Text style={styles.infoValue}>
                {calculateAge(student.date_of_birth)} tuổi
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Permissions */}
      {permissions && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>🔐 Quyền truy cập của bạn</Text>
            <Text style={styles.cardSubtitle}>
              Các tính năng bạn có thể sử dụng
            </Text>

            <View style={styles.permissionList}>
              {permissionItems.map((item) => {
                const hasPermission =
                  permissions[item.key as keyof typeof permissions];
                return (
                  <View key={item.key} style={styles.permissionItem}>
                    <Ionicons
                      name={item.icon as any}
                      size={18}
                      color={hasPermission ? "#4CAF50" : "#999"}
                    />
                    <Text
                      style={[
                        styles.permissionLabel,
                        !hasPermission && styles.permissionLabelDisabled,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Ionicons
                      name={hasPermission ? "checkmark-circle" : "close-circle"}
                      size={18}
                      color={hasPermission ? "#4CAF50" : "#999"}
                    />
                  </View>
                );
              })}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Note */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.noteRow}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#6750A4"
            />
            <Text style={styles.noteText}>
              Nếu cần thay đổi quyền truy cập hoặc cập nhật thông tin học sinh,
              vui lòng liên hệ với giáo viên hoặc ban quản trị nhà trường.
            </Text>
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
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999",
  },
  card: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    marginTop: -12,
  },
  infoList: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: "#666",
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  permissionList: {
    gap: 8,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  permissionLabel: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  permissionLabelDisabled: {
    color: "#999",
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: "#EDE7F6",
  },
  noteRow: {
    flexDirection: "row",
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: "#5B21B6",
    lineHeight: 20,
  },
});
