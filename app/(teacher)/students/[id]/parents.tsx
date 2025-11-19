import {
  useInviteParent,
  useParentLinks,
  useReactivateLink,
  useRevokeAccess,
} from "@/src/hooks/useParents";
import type { ParentLinkWithProfile } from "@/src/services/parent.service";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  FAB,
  Icon,
  IconButton,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";

export default function StudentParentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: parentLinks = [], isLoading, refetch } = useParentLinks(id);
  const inviteParent = useInviteParent();
  const revokeAccess = useRevokeAccess();
  const reactivateLink = useReactivateLink();

  // Invite dialog state
  const [inviteDialogVisible, setInviteDialogVisible] = useState(false);
  const [credentialsDialogVisible, setCredentialsDialogVisible] =
    useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [relationship, setRelationship] = useState<
    "mother" | "father" | "guardian" | "other"
  >("mother");
  const [relationshipNote, setRelationshipNote] = useState("");

  const handleInvite = async () => {
    if (!parentEmail.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email phụ huynh");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parentEmail)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }

    try {
      const result = await inviteParent.mutateAsync({
        student_id: id,
        parent_email: parentEmail.trim().toLowerCase(),
        relationship,
        relationship_note: relationshipNote.trim() || undefined,
      });

      const email = parentEmail.trim().toLowerCase();

      // Show credentials dialog
      setSelectedEmail(email);
      setInviteDialogVisible(false);
      setCredentialsDialogVisible(true);

      setParentEmail("");
      setRelationshipNote("");
      setRelationship("mother");
      refetch();
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể mời phụ huynh");
    }
  };

  const handleRevoke = async (linkId: string, parentName: string) => {
    Alert.alert(
      "Thu hồi quyền truy cập",
      `Bạn có chắc chắn muốn thu hồi quyền truy cập của ${parentName}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Thu hồi",
          style: "destructive",
          onPress: async () => {
            try {
              await revokeAccess.mutateAsync({
                linkId,
                reason: "Thu hồi bởi giáo viên",
              });
              Alert.alert("Thành công", "Đã thu hồi quyền truy cập");
              refetch();
            } catch (error: any) {
              Alert.alert("Lỗi", error.message);
            }
          },
        },
      ]
    );
  };

  const handleReactivate = async (linkId: string) => {
    try {
      await reactivateLink.mutateAsync(linkId);
      Alert.alert("Thành công", "Đã kích hoạt lại quyền truy cập");
      refetch();
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    }
  };

  const handleEditPermissions = (link: ParentLinkWithProfile) => {
    router.push(`/students/${id}/parent-permissions?linkId=${link.id}`);
  };

  const handleShowCredentials = (email: string) => {
    setSelectedEmail(email);
    setCredentialsDialogVisible(true);
  };

  const getRelationshipLabel = (rel: string) => {
    switch (rel) {
      case "mother":
        return "Mẹ";
      case "father":
        return "Bố";
      case "guardian":
        return "Người giám hộ";
      case "other":
        return "Khác";
      default:
        return rel;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#4caf50";
      case "invited":
        return "#ff9800";
      case "revoked":
        return "#f44336";
      default:
        return "#9e9e9e";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "invited":
        return "Đã mời";
      case "revoked":
        return "Đã thu hồi";
      default:
        return status;
    }
  };

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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Icon source="account-multiple" size={32} color="#6750A4" />
                <Text variant="headlineMedium" style={styles.summaryNumber}>
                  {parentLinks.length}
                </Text>
                <Text variant="bodySmall" style={styles.summaryLabel}>
                  Phụ huynh
                </Text>
              </View>
              <Divider style={styles.verticalDivider} />
              <View style={styles.summaryItem}>
                <Icon source="check-circle" size={32} color="#4caf50" />
                <Text variant="headlineMedium" style={styles.summaryNumber}>
                  {parentLinks.filter((l) => l.status === "active").length}
                </Text>
                <Text variant="bodySmall" style={styles.summaryLabel}>
                  Đang hoạt động
                </Text>
              </View>
              <Divider style={styles.verticalDivider} />
              <View style={styles.summaryItem}>
                <Icon source="clock-outline" size={32} color="#ff9800" />
                <Text variant="headlineMedium" style={styles.summaryNumber}>
                  {parentLinks.filter((l) => l.status === "invited").length}
                </Text>
                <Text variant="bodySmall" style={styles.summaryLabel}>
                  Chờ chấp nhận
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Parent Links List */}
        {parentLinks.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon source="account-off" size={64} color="#9e9e9e" />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Chưa có phụ huynh nào
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Nhấn nút + bên dưới để mời phụ huynh
              </Text>
            </Card.Content>
          </Card>
        ) : (
          parentLinks.map((link) => (
            <Card
              key={link.id}
              style={styles.parentCard}
              onPress={() =>
                link.parent_email && handleShowCredentials(link.parent_email)
              }
            >
              <Card.Content>
                <View style={styles.parentHeader}>
                  <View style={styles.parentInfo}>
                    <Avatar.Text
                      size={48}
                      label={
                        link.parent_profile
                          ? `${link.parent_profile.first_name[0]}${link.parent_profile.last_name[0]}`
                          : "?"
                      }
                      style={{ backgroundColor: "#6750A4" }}
                    />
                    <View style={styles.parentDetails}>
                      <Text variant="titleMedium" style={styles.parentName}>
                        {link.parent_profile
                          ? `${link.parent_profile.first_name} ${link.parent_profile.last_name}`
                          : link.parent_email}
                      </Text>
                      <Text variant="bodySmall" style={styles.parentEmail}>
                        {link.parent_email}
                      </Text>
                      <View style={styles.chipContainer}>
                        <Chip
                          icon="account-heart"
                          style={[
                            styles.relationshipChip,
                            { backgroundColor: "#E8DEF8" },
                          ]}
                          textStyle={{ fontSize: 12, lineHeight: 16 }}
                        >
                          {getRelationshipLabel(link.relationship)}
                          {link.relationship_note
                            ? ` (${link.relationship_note})`
                            : ""}
                        </Chip>
                        <Chip
                          style={[
                            styles.statusChip,
                            {
                              backgroundColor: getStatusColor(link.status!),
                            },
                          ]}
                          textStyle={{
                            color: "#fff",
                            fontSize: 12,
                            lineHeight: 16,
                          }}
                        >
                          {getStatusLabel(link.status!)}
                        </Chip>
                      </View>
                    </View>
                  </View>

                  <IconButton
                    icon="pencil"
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEditPermissions(link);
                    }}
                  />
                </View>

                <Divider style={styles.divider} />

                {/* Permissions Summary */}
                <View style={styles.permissionsContainer}>
                  <Text variant="labelLarge" style={styles.permissionsTitle}>
                    Quyền truy cập:
                  </Text>
                  <View style={styles.permissionsGrid}>
                    {Object.entries(link.permissions || {}).map(
                      ([key, value]) => (
                        <Chip
                          key={key}
                          icon={value ? "check" : "close"}
                          style={[
                            styles.permissionChip,
                            {
                              backgroundColor: value ? "#C8E6C9" : "#FFCDD2",
                            },
                          ]}
                          textStyle={{ fontSize: 11, lineHeight: 16 }}
                        >
                          {getPermissionLabel(key)}
                        </Chip>
                      )
                    )}
                  </View>
                </View>

                {/* Timestamps */}
                <View style={styles.timestampContainer}>
                  <Text variant="bodySmall" style={styles.timestamp}>
                    Mời lúc:{" "}
                    {link.invited_at
                      ? format(new Date(link.invited_at), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })
                      : "N/A"}
                  </Text>
                  {link.activated_at && (
                    <Text variant="bodySmall" style={styles.timestamp}>
                      Kích hoạt:{" "}
                      {format(new Date(link.activated_at), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })}
                    </Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Invite FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setInviteDialogVisible(true)}
        label="Mời phụ huynh"
        color="#fff"
      />

      {/* Invite Dialog */}
      <Portal>
        <Dialog
          visible={inviteDialogVisible}
          onDismiss={() => setInviteDialogVisible(false)}
        >
          <Dialog.Title>Mời phụ huynh</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Email phụ huynh *"
              value={parentEmail}
              onChangeText={setParentEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text variant="labelLarge" style={styles.fieldLabel}>
              Quan hệ *
            </Text>
            <View style={styles.relationshipButtons}>
              {["mother", "father", "guardian", "other"].map((rel) => (
                <Chip
                  key={rel}
                  selected={relationship === rel}
                  onPress={() =>
                    setRelationship(
                      rel as "mother" | "father" | "guardian" | "other"
                    )
                  }
                  style={styles.relationshipButton}
                >
                  {getRelationshipLabel(rel)}
                </Chip>
              ))}
            </View>

            {relationship === "other" && (
              <TextInput
                label="Ghi chú quan hệ"
                value={relationshipNote}
                onChangeText={setRelationshipNote}
                mode="outlined"
                style={styles.input}
                placeholder="VD: Ông nội, Bà ngoại..."
              />
            )}

            <Text variant="bodySmall" style={styles.helpText}>
              💡{" "}
              <Text style={{ fontWeight: "bold" }}>Cách thức hoạt động:</Text>
              {"\n"}• Email mời sẽ được gửi tự động đến phụ huynh
              {"\n"}• Phụ huynh nhận email, click link để kích hoạt tài khoản
              {"\n"}• Phụ huynh tạo mật khẩu của riêng họ
              {"\n"}• Sau khi kích hoạt, phụ huynh có thể đăng nhập vào app
              {"\n"}• Link kích hoạt có hiệu lực trong 24 giờ
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setInviteDialogVisible(false)}>Hủy</Button>
            <Button
              onPress={handleInvite}
              loading={inviteParent.isPending}
              disabled={inviteParent.isPending}
            >
              Gửi lời mời
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Credentials Dialog */}
        <Dialog
          visible={credentialsDialogVisible}
          onDismiss={() => setCredentialsDialogVisible(false)}
        >
          <Dialog.Title>🔐 Thông tin tài khoản</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.credentialsIntro}>
              Tài khoản phụ huynh đã được tạo:
            </Text>

            <View style={styles.credentialBox}>
              <View style={styles.credentialRow}>
                <Icon source="email" size={20} color="#6750A4" />
                <Text variant="labelMedium" style={styles.credentialLabel}>
                  Email:
                </Text>
              </View>
              <Text variant="titleMedium" style={styles.credentialValue}>
                {selectedEmail}
              </Text>
            </View>

            <View style={styles.credentialBox}>
              <View style={styles.credentialRow}>
                <Icon source="lock" size={20} color="#6750A4" />
                <Text variant="labelMedium" style={styles.credentialLabel}>
                  Mật khẩu tạm:
                </Text>
              </View>
              <Text variant="titleMedium" style={styles.credentialValue}>
                {selectedEmail}
              </Text>
            </View>

            <View style={styles.instructionBox}>
              <Icon source="information" size={20} color="#0288D1" />
              <View style={{ flex: 1 }}>
                <Text variant="bodySmall" style={styles.instructionText}>
                  📱 Gửi thông tin trên cho phụ huynh qua SMS/Zalo
                </Text>
                <Text variant="bodySmall" style={styles.instructionText}>
                  ⚠️ Phụ huynh phải đổi mật khẩu ngay lần đầu đăng nhập
                </Text>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                // TODO: Implement clipboard
              }}
            >
              Copy email
            </Button>
            <Button onPress={() => setCredentialsDialogVisible(false)}>
              Đóng
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

function getPermissionLabel(key: string): string {
  const labels: { [key: string]: string } = {
    can_view_sessions: "Xem buổi học",
    can_view_session_logs: "Xem nhật ký",
    can_view_goal_evaluations: "Xem đánh giá",
    can_view_behavior_incidents: "Xem hành vi",
    can_view_media: "Xem ảnh/video",
    can_message_teacher: "Nhắn tin",
    can_receive_notifications: "Nhận thông báo",
  };
  return labels[key] || key;
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
  summaryCard: {
    margin: 16,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryNumber: {
    marginTop: 8,
    fontWeight: "bold",
  },
  summaryLabel: {
    color: "#666",
    marginTop: 4,
  },
  verticalDivider: {
    width: 1,
    height: "100%",
  },
  emptyCard: {
    margin: 16,
  },
  emptyContent: {
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    fontWeight: "600",
  },
  emptyText: {
    marginTop: 8,
    textAlign: "center",
    color: "#666",
  },
  parentCard: {
    margin: 16,
    marginTop: 8,
  },
  parentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  parentInfo: {
    flex: 1,
    flexDirection: "row",
  },
  parentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  parentName: {
    fontWeight: "600",
  },
  parentEmail: {
    color: "#666",
    marginTop: 2,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  relationshipChip: {
    minHeight: 28,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusChip: {
    minHeight: 28,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  divider: {
    marginVertical: 12,
  },
  permissionsContainer: {
    marginTop: 8,
  },
  permissionsTitle: {
    marginBottom: 8,
    color: "#666",
  },
  permissionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  permissionChip: {
    minHeight: 26,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timestampContainer: {
    marginTop: 12,
    gap: 4,
  },
  timestamp: {
    color: "#999",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#6750A4",
  },
  input: {
    marginBottom: 16,
  },
  fieldLabel: {
    marginBottom: 8,
    color: "#666",
  },
  relationshipButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  relationshipButton: {
    marginRight: 0,
  },
  helpText: {
    color: "#666",
    fontStyle: "italic",
    marginTop: 8,
  },
  credentialsIntro: {
    marginBottom: 16,
    color: "#666",
  },
  credentialBox: {
    backgroundColor: "#F3E5F5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#6750A4",
  },
  credentialRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  credentialLabel: {
    color: "#666",
    fontWeight: "600",
  },
  credentialValue: {
    color: "#6750A4",
    fontWeight: "700",
    fontSize: 16,
  },
  instructionBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    gap: 8,
  },
  instructionText: {
    color: "#01579B",
    lineHeight: 20,
    marginBottom: 4,
  },
});
