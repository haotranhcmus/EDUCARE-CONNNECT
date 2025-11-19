import {
  useDeleteLink,
  useParentLinks,
  useUpdatePermissions,
} from "@/src/hooks/useParents";
import type { ParentPermissions } from "@/src/services/parent.service";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Divider,
  Icon,
  List,
  Switch,
  Text,
} from "react-native-paper";

export default function ParentPermissionsScreen() {
  const { id, linkId } = useLocalSearchParams<{
    id: string;
    linkId: string;
  }>();
  const { data: parentLinks = [], isLoading } = useParentLinks(id);
  const updatePermissions = useUpdatePermissions();
  const deleteLink = useDeleteLink();

  const [permissions, setPermissions] = useState<ParentPermissions>({
    can_view_sessions: true,
    can_view_session_logs: true,
    can_view_goal_evaluations: true,
    can_view_behavior_incidents: false,
    can_view_media: true,
    can_message_teacher: true,
    can_receive_notifications: true,
  });

  const link = parentLinks.find((l: any) => l.id === linkId);

  useEffect(() => {
    if (link?.permissions) {
      setPermissions(link.permissions as any);
    }
  }, [link]);

  const handleSave = async () => {
    try {
      await updatePermissions.mutateAsync({
        link_id: linkId,
        permissions,
      });
      Alert.alert("Thành công", "Đã cập nhật quyền truy cập", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật quyền");
    }
  };

  const togglePermission = (key: keyof ParentPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDelete = () => {
    Alert.alert(
      "⚠️ Xóa phụ huynh",
      `Bạn có chắc chắn muốn xóa ${parentName}?\n\n` +
        `Thao tác này sẽ:\n` +
        `• Xóa liên kết với học sinh\n` +
        `• Xóa tài khoản phụ huynh khỏi hệ thống\n` +
        `• Không thể hoàn tác`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLink.mutateAsync(linkId);
              Alert.alert("Thành công", "Đã xóa phụ huynh", [
                {
                  text: "OK",
                  onPress: () => {
                    router.back();
                  },
                },
              ]);
            } catch (error: any) {
              Alert.alert("Lỗi", error.message || "Không thể xóa phụ huynh");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Quyền truy cập" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (!link) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Quyền truy cập" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <Text>Không tìm thấy liên kết</Text>
        </View>
      </View>
    );
  }

  const parentName = link.parent_profile
    ? `${link.parent_profile.first_name} ${link.parent_profile.last_name}`
    : (link as any).parent_email;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Quyền truy cập" />
        <Appbar.Action
          icon="content-save"
          onPress={handleSave}
          disabled={updatePermissions.isPending}
        />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Parent Info Card */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.label}>
              Phụ huynh
            </Text>
            <Text variant="titleMedium" style={styles.parentName}>
              {parentName}
            </Text>
            <Text variant="bodySmall" style={styles.parentEmail}>
              {(link as any).parent_email}
            </Text>
          </Card.Content>
        </Card>

        {/* Help Text */}
        <Card style={styles.helpCard}>
          <Card.Content>
            <View style={styles.helpContent}>
              <Icon source="information" size={24} color="#1976D2" />
              <Text variant="bodySmall" style={styles.helpText}>
                Tùy chỉnh quyền truy cập cho phụ huynh. Phụ huynh chỉ có thể xem
                thông tin mà bạn cho phép.
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Permissions */}
        <Card style={styles.permissionsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Quyền xem thông tin học tập
            </Text>

            <List.Item
              title="Xem buổi học"
              description="Cho phép xem danh sách và chi tiết các buổi học"
              left={(props) => <List.Icon {...props} icon="calendar" />}
              right={() => (
                <Switch
                  value={permissions.can_view_sessions}
                  onValueChange={() => togglePermission("can_view_sessions")}
                />
              )}
              titleNumberOfLines={2}
              descriptionNumberOfLines={3}
              style={styles.listItem}
            />
            <Divider />

            <List.Item
              title="Xem nhật ký buổi học"
              description="Cho phép xem ghi chú, đánh giá trong từng buổi học"
              left={(props) => <List.Icon {...props} icon="notebook" />}
              right={() => (
                <Switch
                  value={permissions.can_view_session_logs}
                  onValueChange={() =>
                    togglePermission("can_view_session_logs")
                  }
                />
              )}
              disabled={!permissions.can_view_sessions}
              titleNumberOfLines={2}
              descriptionNumberOfLines={3}
              style={styles.listItem}
            />
            <Divider />

            <List.Item
              title="Xem đánh giá mục tiêu"
              description="Cho phép xem kết quả đánh giá các mục tiêu học tập"
              left={(props) => <List.Icon {...props} icon="chart-line" />}
              right={() => (
                <Switch
                  value={permissions.can_view_goal_evaluations}
                  onValueChange={() =>
                    togglePermission("can_view_goal_evaluations")
                  }
                />
              )}
              disabled={!permissions.can_view_session_logs}
              titleNumberOfLines={2}
              descriptionNumberOfLines={3}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        <Card style={styles.permissionsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Quyền xem thông tin nhạy cảm
            </Text>

            <List.Item
              title="Xem hành vi thách thức"
              description="Cho phép xem chi tiết các sự cố hành vi (thông tin nhạy cảm)"
              left={(props) => (
                <List.Icon {...props} icon="alert-circle" color="#f44336" />
              )}
              right={() => (
                <Switch
                  value={permissions.can_view_behavior_incidents}
                  onValueChange={() =>
                    togglePermission("can_view_behavior_incidents")
                  }
                />
              )}
              titleNumberOfLines={2}
              descriptionNumberOfLines={3}
              style={styles.listItem}
            />

            <View style={styles.warningBox}>
              <Icon source="shield-alert" size={20} color="#f44336" />
              <Text variant="bodySmall" style={styles.warningText}>
                Thông tin hành vi thách thức là nhạy cảm. Chỉ chia sẻ khi cần
                thiết và phụ huynh đã sẵn sàng.
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.permissionsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Quyền khác
            </Text>

            <List.Item
              title="Xem ảnh và video"
              description="Cho phép xem ảnh, video trong các buổi học"
              left={(props) => <List.Icon {...props} icon="image-multiple" />}
              right={() => (
                <Switch
                  value={permissions.can_view_media}
                  onValueChange={() => togglePermission("can_view_media")}
                />
              )}
              titleNumberOfLines={2}
              descriptionNumberOfLines={3}
              style={styles.listItem}
            />
            <Divider />

            <List.Item
              title="Nhắn tin với giáo viên"
              description="Cho phép gửi tin nhắn trực tiếp đến bạn"
              left={(props) => <List.Icon {...props} icon="message-text" />}
              right={() => (
                <Switch
                  value={permissions.can_message_teacher}
                  onValueChange={() => togglePermission("can_message_teacher")}
                />
              )}
              titleNumberOfLines={2}
              descriptionNumberOfLines={3}
              style={styles.listItem}
            />
            <Divider />

            <List.Item
              title="Nhận thông báo"
              description="Cho phép nhận thông báo về các hoạt động của học sinh"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={permissions.can_receive_notifications}
                  onValueChange={() =>
                    togglePermission("can_receive_notifications")
                  }
                />
              )}
              titleNumberOfLines={2}
              descriptionNumberOfLines={3}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={updatePermissions.isPending}
            disabled={updatePermissions.isPending}
            style={styles.saveButton}
          >
            Lưu thay đổi
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            disabled={updatePermissions.isPending}
            style={styles.cancelButton}
          >
            Hủy
          </Button>
        </View>

        {/* Delete Section */}
        <Card style={styles.dangerCard}>
          <Card.Content>
            <View style={styles.dangerHeader}>
              <Icon source="alert-circle" size={24} color="#d32f2f" />
              <Text variant="titleMedium" style={styles.dangerTitle}>
                Vùng nguy hiểm
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.dangerText}>
              Xóa phụ huynh sẽ xóa liên kết với học sinh và tài khoản phụ huynh
              khỏi hệ thống. Thao tác này không thể hoàn tác.
            </Text>
            <Button
              mode="contained"
              onPress={handleDelete}
              loading={deleteLink.isPending}
              disabled={deleteLink.isPending || updatePermissions.isPending}
              style={styles.deleteButton}
              buttonColor="#d32f2f"
              icon="delete"
            >
              Xóa phụ huynh
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    margin: 16,
    marginBottom: 8,
  },
  label: {
    color: "#666",
    marginBottom: 4,
  },
  parentName: {
    fontWeight: "600",
    marginBottom: 4,
  },
  parentEmail: {
    color: "#666",
  },
  helpCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 8,
    backgroundColor: "#E3F2FD",
  },
  helpContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  helpText: {
    flex: 1,
    color: "#1565C0",
  },
  permissionsCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },
  listItem: {
    paddingVertical: 12,
    minHeight: 72,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    flex: 1,
    color: "#C62828",
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  saveButton: {
    backgroundColor: "#6750A4",
  },
  cancelButton: {
    borderColor: "#6750A4",
  },
  dangerCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    backgroundColor: "#FFEBEE",
    borderColor: "#d32f2f",
    borderWidth: 1,
  },
  dangerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  dangerTitle: {
    color: "#d32f2f",
    fontWeight: "600",
  },
  dangerText: {
    color: "#666",
    marginBottom: 16,
  },
  deleteButton: {
    marginTop: 8,
  },
});
