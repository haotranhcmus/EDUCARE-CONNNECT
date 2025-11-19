import {
  useCancelSession,
  useDeleteSession,
  useRemoveContentFromSession,
  useSession,
  useSessionContents,
  useSessionLog,
  useUpdateContentGoals,
  useUpdateSession,
} from "@/src/hooks/useSessions";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  FAB,
  Icon,
  IconButton,
  List,
  Modal,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [editingGoals, setEditingGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedSessionDate, setEditedSessionDate] = useState(new Date());
  const [editedStartTime, setEditedStartTime] = useState("");
  const [editedEndTime, setEditedEndTime] = useState("");
  const [editedLocation, setEditedLocation] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expandedContentId, setExpandedContentId] = useState<string | null>(
    null
  );

  const { data: session, isLoading } = useSession(id || "");
  const { data: sessionLog } = useSessionLog(id || "");
  const { data: contents, isLoading: contentsLoading } = useSessionContents(
    id || ""
  );

  const deleteSession = useDeleteSession();
  const cancelSession = useCancelSession();
  const removeContent = useRemoveContentFromSession();
  const updateSession = useUpdateSession();
  const updateContentGoals = useUpdateContentGoals();

  const handleEdit = () => {
    if (!session) return;

    if (session.status === "completed") {
      Alert.alert(
        "Không thể chỉnh sửa",
        "Buổi học đã hoàn thành, không thể chỉnh sửa"
      );
      return;
    }

    // Initialize form with current values
    setEditedSessionDate(new Date(session.session_date));
    setEditedStartTime(session.start_time);
    setEditedEndTime(session.end_time);
    setEditedLocation(session.location || "");
    setEditedNotes(session.notes || "");
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateSession.mutateAsync({
        id: id || "",
        data: {
          session_date: format(editedSessionDate, "yyyy-MM-dd"),
          start_time: editedStartTime,
          end_time: editedEndTime,
          location: editedLocation || undefined,
          notes: editedNotes || undefined,
        },
      });
      setShowEditModal(false);
      Alert.alert("Thành công", "Đã cập nhật thông tin buổi học");
    } catch (error) {
      Alert.alert(
        "Lỗi",
        error instanceof Error ? error.message : "Không thể cập nhật"
      );
    }
  };

  const handleLog = () => {
    // If session is completed or already has a log, go to details view
    if (session?.status === "completed" || sessionLog) {
      router.push(`/sessions/${id}/log-details`);
    } else {
      // Otherwise go to create/edit log
      router.push(`/sessions/${id}/log`);
    }
  };

  const handleAddContent = () => {
    if (session?.status === "completed") {
      Alert.alert(
        "Không thể chỉnh sửa",
        "Buổi học đã hoàn thành, không thể thêm nội dung mới"
      );
      return;
    }
    router.push(`/sessions/${id}/add-content`);
  };

  const handleEditContent = (content: any) => {
    if (session?.status === "completed") {
      Alert.alert(
        "Không thể chỉnh sửa",
        "Buổi học đã hoàn thành, không thể chỉnh sửa nội dung"
      );
      return;
    }
    setEditingContentId(content.id);
    // Get goals from content
    const goals = content.goals?.map((g: any) => g.description || "") || [];
    setEditingGoals(goals);
  };

  const handleCancelEdit = () => {
    setEditingContentId(null);
    setEditingGoals([]);
    setNewGoal("");
  };

  const handleSaveContent = async () => {
    if (!editingContentId) return;

    try {
      await updateContentGoals.mutateAsync({
        contentId: editingContentId,
        goals: editingGoals,
        sessionId: id || "",
      });
      Alert.alert("Thành công", "Đã cập nhật mục tiêu");
      handleCancelEdit();
    } catch (error) {
      Alert.alert(
        "Lỗi",
        error instanceof Error ? error.message : "Không thể cập nhật"
      );
    }
  };

  const handleRemoveGoal = (index: number) => {
    setEditingGoals(editingGoals.filter((_, i) => i !== index));
  };

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setEditingGoals([...editingGoals, newGoal.trim()]);
      setNewGoal("");
    }
  };

  const handleRemoveContent = (contentId: string) => {
    if (session?.status === "completed") {
      Alert.alert(
        "Không thể chỉnh sửa",
        "Buổi học đã hoàn thành, không thể xóa nội dung"
      );
      return;
    }
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa nội dung này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await removeContent.mutateAsync({
              contentId,
              sessionId: id || "",
            });
            Alert.alert("Thành công", "Đã xóa nội dung");
          } catch (error) {
            Alert.alert(
              "Lỗi",
              error instanceof Error ? error.message : "Không thể xóa nội dung"
            );
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa buổi học này? Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSession.mutateAsync(id || "");
              // Navigate to sessions tab
              router.replace("/(teacher)/sessions");
            } catch (error) {
              Alert.alert(
                "Lỗi",
                error instanceof Error
                  ? error.message
                  : "Không thể xóa buổi học"
              );
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    try {
      await cancelSession.mutateAsync({
        id: id || "",
        reason: cancelReason || "Không có lý do",
      });
      setShowCancelModal(false);
      setCancelReason("");
      Alert.alert("Thành công", "Đã hủy buổi học");
    } catch (error) {
      Alert.alert(
        "Lỗi",
        error instanceof Error ? error.message : "Không thể hủy buổi học"
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#4caf50";
      case "cancelled":
        return "#f44336";
      default:
        return "#2196f3";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "scheduled":
        return "Đã lên lịch";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Đã lên lịch";
    }
  };

  const getTimeSlotLabel = (timeSlot: string) => {
    switch (timeSlot) {
      case "morning":
        return "Sáng";
      case "afternoon":
        return "Chiều";
      case "evening":
        return "Tối";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Đang tải...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.emptyContainer}>
        <Icon source="alert-circle-outline" size={64} color="#ccc" />
        <Text variant="headlineSmall" style={{ marginTop: 16, color: "#666" }}>
          Không tìm thấy buổi học
        </Text>
      </View>
    );
  }

  const studentName = [
    session.student?.last_name || "",
    session.student?.first_name || "",
  ]
    .join(" ")
    .trim();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Card with Student Info */}
        <Card style={styles.card}>
          <Card.Title
            title={studentName || "Học sinh"}
            subtitle={session.student?.nickname}
            left={(props) => <Icon source="account" {...props} />}
          />
          <Card.Content>
            {/* Additional Student Info */}
            {session.student?.gender && (
              <List.Item
                title="Giới tính"
                description={
                  session.student.gender === "male"
                    ? "Nam"
                    : session.student.gender === "female"
                    ? "Nữ"
                    : "Khác"
                }
                left={(props) => (
                  <List.Icon {...props} icon="gender-male-female" />
                )}
              />
            )}
            {session.student?.date_of_birth && (
              <List.Item
                title="Ngày sinh"
                right={() => (
                  <Text
                    variant="bodyLarge"
                    style={{ alignSelf: "center", color: "#666" }}
                  >
                    {format(
                      new Date(session.student.date_of_birth),
                      "dd/MM/yyyy"
                    )}
                  </Text>
                )}
                left={(props) => <List.Icon {...props} icon="cake-variant" />}
              />
            )}
            {session.student?.diagnosis && (
              <List.Item
                title="Chẩn đoán"
                description={session.student.diagnosis}
                left={(props) => <List.Icon {...props} icon="medical-bag" />}
              />
            )}
          </Card.Content>
        </Card>

        {/* Session Info Card */}
        <Card style={styles.card}>
          <Card.Title title="Thông tin buổi học" />
          <Card.Content>
            <View style={styles.statusRow}>
              <View style={styles.chipWrapper}>
                <Chip
                  mode="flat"
                  compact
                  style={{
                    backgroundColor: getStatusColor(
                      session.status || "scheduled"
                    ),
                  }}
                  textStyle={{ color: "#fff" }}
                >
                  {getStatusLabel(session.status || "scheduled")}
                </Chip>
              </View>
            </View>
            <Divider style={{ marginTop: 12, marginBottom: 4 }} />
            <List.Item
              title="Ngày học"
              description={format(
                new Date(session.session_date),
                "EEEE, dd/MM/yyyy",
                {
                  locale: vi,
                }
              )}
              left={(props) => <List.Icon {...props} icon="calendar" />}
            />
            <Divider />
            <List.Item
              title="Giờ học"
              description={`${session.start_time} - ${session.end_time}`}
              left={(props) => <List.Icon {...props} icon="clock-outline" />}
            />
            <Divider />
            <List.Item
              title="Khung giờ"
              description={getTimeSlotLabel(session.time_slot)}
              left={(props) => <List.Icon {...props} icon="weather-sunset" />}
            />
            {session.location && (
              <>
                <Divider />
                <List.Item
                  title="Địa điểm"
                  description={session.location}
                  left={(props) => <List.Icon {...props} icon="map-marker" />}
                />
              </>
            )}
            {session.duration_minutes && (
              <>
                <Divider />
                <List.Item
                  title="Thời lượng"
                  description={`${session.duration_minutes} phút`}
                  left={(props) => (
                    <List.Icon {...props} icon="timer-outline" />
                  )}
                />
              </>
            )}
            {session.notes && (
              <>
                <Divider />
                <List.Item
                  title="Ghi chú"
                  description={session.notes}
                  left={(props) => (
                    <List.Icon {...props} icon="note-text-outline" />
                  )}
                />
              </>
            )}
          </Card.Content>
          <Card.Actions>
            <Button
              mode="outlined"
              icon="pencil"
              onPress={handleEdit}
              style={{ flex: 1 }}
            >
              Chỉnh sửa
            </Button>
            <Button
              mode="outlined"
              icon="cancel"
              onPress={handleCancel}
              disabled={session.status === "cancelled"}
              style={{ flex: 1 }}
              textColor="#FF9800"
            >
              Hủy
            </Button>
            <Button
              mode="outlined"
              icon="delete"
              onPress={handleDelete}
              style={{ flex: 1 }}
              textColor="#F44336"
            >
              Xóa
            </Button>
          </Card.Actions>
        </Card>

        {/* Session Contents Card */}
        <Card style={styles.card}>
          <Card.Title
            title={`Nội dung buổi học (${contents?.length || 0})`}
            right={(props) =>
              session?.status !== "completed" ? (
                <Button
                  {...props}
                  mode="text"
                  icon="plus"
                  onPress={handleAddContent}
                >
                  Thêm
                </Button>
              ) : null
            }
          />
          <Card.Content>
            {contentsLoading ? (
              <View style={styles.contentLoading}>
                <ActivityIndicator size="small" />
              </View>
            ) : contents && contents.length > 0 ? (
              contents.map((content, index) => (
                <React.Fragment key={content.id}>
                  {index > 0 && <Divider style={{ marginVertical: 8 }} />}

                  {editingContentId === content.id ? (
                    /* Edit Mode */
                    <View style={styles.contentEditMode}>
                      <View style={styles.contentEditHeader}>
                        <View style={{ flex: 1 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <View style={styles.contentOrder}>
                              <Text
                                variant="labelLarge"
                                style={{ color: "#fff", fontWeight: "600" }}
                              >
                                {index + 1}
                              </Text>
                            </View>
                            <Text
                              variant="titleMedium"
                              style={{ marginLeft: 12, fontWeight: "600" }}
                            >
                              {content.title}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 8,
                            marginLeft: 8,
                          }}
                        >
                          <Button
                            mode="contained"
                            onPress={handleSaveContent}
                            compact
                            style={{ backgroundColor: "#4CAF50" }}
                          >
                            Lưu
                          </Button>
                          <Button
                            mode="outlined"
                            onPress={handleCancelEdit}
                            compact
                            textColor="#666"
                          >
                            Hủy
                          </Button>
                        </View>
                      </View>

                      {content.description && (
                        <Text
                          variant="bodySmall"
                          style={{
                            color: "#666",
                            marginTop: 8,
                            lineHeight: 18,
                          }}
                        >
                          {content.description}
                        </Text>
                      )}

                      <Text
                        variant="labelMedium"
                        style={{
                          marginTop: 16,
                          marginBottom: 8,
                          color: "#6750A4",
                          fontWeight: "600",
                        }}
                      >
                        Mục tiêu ({editingGoals.length})
                      </Text>

                      {editingGoals.map((goal, idx) => (
                        <View key={idx} style={styles.goalEditItem}>
                          <Text
                            variant="bodyMedium"
                            style={{ flex: 1, color: "#333" }}
                          >
                            • {goal}
                          </Text>
                          <IconButton
                            icon="close-circle"
                            size={18}
                            iconColor="#F44336"
                            onPress={() => handleRemoveGoal(idx)}
                            style={{ margin: 0 }}
                          />
                        </View>
                      ))}

                      <View
                        style={{ flexDirection: "row", gap: 8, marginTop: 8 }}
                      >
                        <TextInput
                          placeholder="Nhập mục tiêu mới..."
                          value={newGoal}
                          onChangeText={setNewGoal}
                          mode="outlined"
                          style={{ flex: 1 }}
                          dense
                          onSubmitEditing={handleAddGoal}
                          outlineColor="#E0E0E0"
                          activeOutlineColor="#6750A4"
                        />
                        <Button
                          mode="contained"
                          onPress={handleAddGoal}
                          style={{
                            alignSelf: "flex-end",
                            backgroundColor: "#6750A4",
                          }}
                          compact
                        >
                          Thêm
                        </Button>
                      </View>
                    </View>
                  ) : (
                    /* View Mode */
                    <View style={styles.contentViewMode}>
                      <View style={styles.contentViewHeader}>
                        <View style={styles.contentOrder}>
                          <Text
                            variant="labelLarge"
                            style={{ color: "#fff", fontWeight: "600" }}
                          >
                            {index + 1}
                          </Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text
                            variant="titleMedium"
                            style={{ fontWeight: "600", color: "#1a1a1a" }}
                          >
                            {content.title}
                          </Text>
                          {content.description && (
                            <Text
                              variant="bodySmall"
                              style={{
                                color: "#666",
                                marginTop: 4,
                                lineHeight: 18,
                              }}
                            >
                              {content.description}
                            </Text>
                          )}
                        </View>
                        {session?.status !== "completed" && (
                          <View style={{ flexDirection: "row" }}>
                            <IconButton
                              icon="pencil"
                              size={20}
                              iconColor="#2196F3"
                              onPress={() => handleEditContent(content)}
                              style={{ margin: 0 }}
                            />
                            <IconButton
                              icon="delete"
                              size={20}
                              iconColor="#F44336"
                              onPress={() => handleRemoveContent(content.id)}
                              style={{ margin: 0 }}
                            />
                          </View>
                        )}
                      </View>

                      {content.goals && content.goals.length > 0 && (
                        <View style={{ marginTop: 12, marginLeft: 44 }}>
                          <Text
                            variant="labelMedium"
                            style={{
                              color: "#6750A4",
                              marginBottom: 4,
                              fontWeight: "600",
                            }}
                          >
                            Mục tiêu ({content.goals.length})
                          </Text>
                          {content.goals.map((goal: any, idx: number) => (
                            <Text
                              key={idx}
                              variant="bodyMedium"
                              style={{
                                marginTop: 4,
                                color: "#333",
                                lineHeight: 20,
                              }}
                            >
                              • {goal.description}
                            </Text>
                          ))}
                        </View>
                      )}

                      {/* Expand Button & Details */}
                      <View style={{ marginLeft: 44, marginTop: 8 }}>
                        <Button
                          mode="text"
                          icon={
                            expandedContentId === content.id
                              ? "chevron-up"
                              : "chevron-down"
                          }
                          onPress={() =>
                            setExpandedContentId(
                              expandedContentId === content.id
                                ? null
                                : content.id
                            )
                          }
                          compact
                          textColor="#6750A4"
                        >
                          {expandedContentId === content.id
                            ? "Thu gọn"
                            : "Xem chi tiết"}
                        </Button>

                        {expandedContentId === content.id && (
                          <View style={styles.expandedDetails}>
                            {/* Get data from content_library or user_custom_content */}
                            {(() => {
                              const libraryDetails = content.content_library;
                              const customDetails = content.user_custom_content;
                              const details = libraryDetails || customDetails;
                              if (!details) return null;

                              return (
                                <>
                                  {/* Domain */}
                                  {content.domain && (
                                    <View style={styles.detailRow}>
                                      <Icon
                                        source="domain"
                                        size={16}
                                        color="#666"
                                      />
                                      <Text
                                        variant="bodySmall"
                                        style={styles.detailLabel}
                                      >
                                        Lĩnh vực:
                                      </Text>
                                      <View style={styles.chipWrapper}>
                                        <Chip
                                          mode="outlined"
                                          compact
                                          textStyle={{ fontSize: 12 }}
                                        >
                                          {content.domain === "cognitive"
                                            ? "Nhận thức"
                                            : content.domain === "motor"
                                            ? "Vận động"
                                            : content.domain === "language"
                                            ? "Ngôn ngữ"
                                            : content.domain === "social"
                                            ? "Xã hội"
                                            : content.domain === "self_care"
                                            ? "Tự phục vụ"
                                            : content.domain}
                                        </Chip>
                                      </View>
                                    </View>
                                  )}

                                  {/* Age Range - only for content_library */}
                                  {libraryDetails &&
                                    (libraryDetails.target_age_min ||
                                      libraryDetails.target_age_max) && (
                                      <View style={styles.detailRow}>
                                        <Icon
                                          source="account-child"
                                          size={16}
                                          color="#666"
                                        />
                                        <Text
                                          variant="bodySmall"
                                          style={styles.detailLabel}
                                        >
                                          Độ tuổi:
                                        </Text>
                                        <Text
                                          variant="bodySmall"
                                          style={{ color: "#333" }}
                                        >
                                          {libraryDetails.target_age_min || 0} -{" "}
                                          {libraryDetails.target_age_max || 18}{" "}
                                          tuổi
                                        </Text>
                                      </View>
                                    )}

                                  {/* Difficulty Level - only for content_library */}
                                  {libraryDetails &&
                                    libraryDetails.difficulty_level && (
                                      <View style={styles.detailRow}>
                                        <Icon
                                          source="signal"
                                          size={16}
                                          color="#666"
                                        />
                                        <Text
                                          variant="bodySmall"
                                          style={styles.detailLabel}
                                        >
                                          Độ khó:
                                        </Text>
                                        <View style={styles.chipWrapper}>
                                          <Chip
                                            mode="outlined"
                                            compact
                                            textStyle={{ fontSize: 12 }}
                                            style={{
                                              backgroundColor:
                                                libraryDetails.difficulty_level ===
                                                "beginner"
                                                  ? "#E8F5E9"
                                                  : libraryDetails.difficulty_level ===
                                                    "intermediate"
                                                  ? "#FFF3E0"
                                                  : "#FFEBEE",
                                            }}
                                          >
                                            {libraryDetails.difficulty_level ===
                                            "beginner"
                                              ? "Cơ bản"
                                              : libraryDetails.difficulty_level ===
                                                "intermediate"
                                              ? "Trung bình"
                                              : libraryDetails.difficulty_level ===
                                                "advanced"
                                              ? "Nâng cao"
                                              : libraryDetails.difficulty_level}
                                          </Chip>
                                        </View>
                                      </View>
                                    )}

                                  {/* Duration */}
                                  {details.estimated_duration && (
                                    <View style={styles.detailRow}>
                                      <Icon
                                        source="clock-outline"
                                        size={16}
                                        color="#666"
                                      />
                                      <Text
                                        variant="bodySmall"
                                        style={styles.detailLabel}
                                      >
                                        Thời lượng:
                                      </Text>
                                      <Text
                                        variant="bodySmall"
                                        style={{ color: "#333" }}
                                      >
                                        {details.estimated_duration} phút
                                      </Text>
                                    </View>
                                  )}

                                  {/* Materials */}
                                  {details.materials_needed && (
                                    <View style={styles.detailSection}>
                                      <View
                                        style={{
                                          flexDirection: "row",
                                          alignItems: "center",
                                          marginBottom: 4,
                                        }}
                                      >
                                        <Icon
                                          source="package-variant"
                                          size={16}
                                          color="#666"
                                        />
                                        <Text
                                          variant="labelSmall"
                                          style={[
                                            styles.detailLabel,
                                            { fontWeight: "600" },
                                          ]}
                                        >
                                          Vật liệu cần thiết:
                                        </Text>
                                      </View>
                                      {(Array.isArray(details.materials_needed)
                                        ? details.materials_needed
                                        : details.materials_needed
                                            .replace(/\\n/g, "\n") // Replace \\n with actual newline
                                            .split("\n")
                                      ).map((line: string, i: number) => (
                                        <Text
                                          key={i}
                                          variant="bodySmall"
                                          style={{
                                            color: "#555",
                                            lineHeight: 20,
                                          }}
                                        >
                                          {line}
                                        </Text>
                                      ))}
                                    </View>
                                  )}

                                  {/* Instructions */}
                                  {details.instructions && (
                                    <View style={styles.detailSection}>
                                      <View
                                        style={{
                                          flexDirection: "row",
                                          alignItems: "center",
                                          marginBottom: 4,
                                        }}
                                      >
                                        <Icon
                                          source="format-list-numbered"
                                          size={16}
                                          color="#666"
                                        />
                                        <Text
                                          variant="labelSmall"
                                          style={[
                                            styles.detailLabel,
                                            { fontWeight: "600" },
                                          ]}
                                        >
                                          Hướng dẫn:
                                        </Text>
                                      </View>
                                      {(Array.isArray(details.instructions)
                                        ? details.instructions
                                        : details.instructions
                                            .replace(/\\n/g, "\n") // Replace \\n with actual newline
                                            .split("\n")
                                      ).map((line: string, i: number) => (
                                        <Text
                                          key={i}
                                          variant="bodySmall"
                                          style={{
                                            color: "#555",
                                            lineHeight: 20,
                                          }}
                                        >
                                          {line}
                                        </Text>
                                      ))}
                                    </View>
                                  )}

                                  {/* Tips */}
                                  {details.tips && (
                                    <View style={styles.detailSection}>
                                      <View
                                        style={{
                                          flexDirection: "row",
                                          alignItems: "center",
                                          marginBottom: 4,
                                        }}
                                      >
                                        <Icon
                                          source="lightbulb-outline"
                                          size={16}
                                          color="#666"
                                        />
                                        <Text
                                          variant="labelSmall"
                                          style={[
                                            styles.detailLabel,
                                            { fontWeight: "600" },
                                          ]}
                                        >
                                          Gợi ý:
                                        </Text>
                                      </View>
                                      {(Array.isArray(details.tips)
                                        ? details.tips
                                        : details.tips
                                            .replace(/\\n/g, "\n") // Replace \\n with actual newline
                                            .split("\n")
                                      ).map((line: string, i: number) => (
                                        <Text
                                          key={i}
                                          variant="bodySmall"
                                          style={{
                                            color: "#555",
                                            lineHeight: 20,
                                          }}
                                        >
                                          {line}
                                        </Text>
                                      ))}
                                    </View>
                                  )}

                                  {/* Description */}
                                  {details.description && (
                                    <View style={styles.detailSection}>
                                      <View
                                        style={{
                                          flexDirection: "row",
                                          alignItems: "center",
                                          marginBottom: 4,
                                        }}
                                      >
                                        <Icon
                                          source="text"
                                          size={16}
                                          color="#666"
                                        />
                                        <Text
                                          variant="labelSmall"
                                          style={[
                                            styles.detailLabel,
                                            { fontWeight: "600" },
                                          ]}
                                        >
                                          Mô tả:
                                        </Text>
                                      </View>
                                      {details.description
                                        .split("\n")
                                        .map((line: string, i: number) => (
                                          <Text
                                            key={i}
                                            variant="bodySmall"
                                            style={{
                                              color: "#555",
                                              lineHeight: 20,
                                            }}
                                          >
                                            {line}
                                          </Text>
                                        ))}
                                    </View>
                                  )}
                                </>
                              );
                            })()}
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </React.Fragment>
              ))
            ) : (
              <View style={styles.emptyContent}>
                <Icon source="folder-open-outline" size={48} color="#ccc" />
                <Text style={{ marginTop: 8, color: "#999" }}>
                  Chưa có nội dung nào
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Session Log Status */}
        {sessionLog ? (
          <Card style={styles.card}>
            <Card.Title
              title="Ghi nhận buổi học"
              left={(props) => (
                <Icon source="check-circle" {...props} color="green" />
              )}
            />
            <Card.Content>
              <Text variant="bodyMedium">
                Buổi học đã được ghi nhận vào{" "}
                {sessionLog.created_at
                  ? format(
                      new Date(sessionLog.created_at),
                      "dd/MM/yyyy HH:mm",
                      {
                        locale: vi,
                      }
                    )
                  : ""}
              </Text>
              <Button
                mode="outlined"
                style={{ marginTop: 12 }}
                onPress={handleLog}
              >
                Xem chi tiết
              </Button>
            </Card.Content>
          </Card>
        ) : (
          session.status !== "cancelled" && (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.emptyLog}>
                  <Icon
                    source="clipboard-text-outline"
                    size={48}
                    color="#ccc"
                  />
                  <Text
                    variant="bodyMedium"
                    style={{ marginTop: 8, color: "#666" }}
                  >
                    Chưa ghi nhận buổi học này
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )
        )}
      </ScrollView>

      {/* FAB for Session Logging */}
      {session.status !== "cancelled" && !sessionLog && (
        <FAB
          icon="pencil"
          label="Ghi nhận buổi học"
          style={styles.fab}
          onPress={handleLog}
          color="#fff"
        />
      )}

      {/* Cancel Session Modal */}
      <Portal>
        <Modal
          visible={showCancelModal}
          onDismiss={() => {
            setShowCancelModal(false);
            setCancelReason("");
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <Text variant="titleLarge" style={{ marginBottom: 16 }}>
            Hủy buổi học
          </Text>
          <Text
            variant="bodyMedium"
            style={{ marginBottom: 16, color: "#666" }}
          >
            Vui lòng nhập lý do hủy:
          </Text>
          <TextInput
            mode="outlined"
            value={cancelReason}
            onChangeText={setCancelReason}
            placeholder="Nhập lý do hủy buổi học..."
            multiline
            numberOfLines={3}
            style={{ marginBottom: 24 }}
          />
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              justifyContent: "flex-end",
            }}
          >
            <Button
              mode="outlined"
              onPress={() => {
                setShowCancelModal(false);
                setCancelReason("");
              }}
            >
              Đóng
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirmCancel}
              loading={cancelSession.isPending}
              disabled={cancelSession.isPending}
              buttonColor="#FF9800"
            >
              Xác nhận hủy
            </Button>
          </View>
        </Modal>

        {/* Edit Session Modal */}
        <Modal
          visible={showEditModal}
          onDismiss={() => setShowEditModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView style={{ maxHeight: 500 }}>
            <Text variant="titleLarge" style={{ marginBottom: 16 }}>
              Chỉnh sửa buổi học
            </Text>

            {/* Session Date */}
            <Text variant="labelMedium" style={{ marginBottom: 8 }}>
              Ngày học
            </Text>
            <Button
              mode="outlined"
              icon="calendar"
              onPress={() => setShowDatePicker(true)}
              style={{ marginBottom: 16 }}
            >
              {format(editedSessionDate, "dd/MM/yyyy", { locale: vi })}
            </Button>

            {showDatePicker && (
              <DateTimePicker
                value={editedSessionDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setEditedSessionDate(selectedDate);
                  }
                }}
              />
            )}

            {/* Start Time */}
            <TextInput
              mode="outlined"
              label="Giờ bắt đầu (HH:mm)"
              value={editedStartTime}
              onChangeText={setEditedStartTime}
              placeholder="09:00"
              style={{ marginBottom: 12 }}
            />

            {/* End Time */}
            <TextInput
              mode="outlined"
              label="Giờ kết thúc (HH:mm)"
              value={editedEndTime}
              onChangeText={setEditedEndTime}
              placeholder="10:00"
              style={{ marginBottom: 12 }}
            />

            {/* Location */}
            <TextInput
              mode="outlined"
              label="Địa điểm"
              value={editedLocation}
              onChangeText={setEditedLocation}
              placeholder="Nhập địa điểm..."
              style={{ marginBottom: 12 }}
            />

            {/* Notes */}
            <TextInput
              mode="outlined"
              label="Ghi chú"
              value={editedNotes}
              onChangeText={setEditedNotes}
              placeholder="Nhập ghi chú..."
              multiline
              numberOfLines={3}
              style={{ marginBottom: 24 }}
            />

            <View
              style={{
                flexDirection: "row",
                gap: 12,
                justifyContent: "flex-end",
              }}
            >
              <Button mode="outlined" onPress={() => setShowEditModal(false)}>
                Hủy
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveEdit}
                loading={updateSession.isPending}
                disabled={updateSession.isPending}
                buttonColor="#6750A4"
              >
                Lưu
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  card: {
    margin: 12,
    marginBottom: 8,
    elevation: 2,
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  contentLoading: {
    padding: 16,
    alignItems: "center",
  },
  emptyContent: {
    padding: 32,
    alignItems: "center",
  },
  contentOrder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6750A4",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyLog: {
    padding: 24,
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#6750A4",
    color: "#fff",
  },
  contentEditMode: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#6750A4",
  },
  contentEditHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contentViewMode: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  contentViewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  goalEditItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    marginTop: 4,
    paddingHorizontal: 8,
    backgroundColor: "white",
    borderRadius: 6,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 24,
    margin: 20,
    borderRadius: 12,
  },
  expandedDetails: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#6750A4",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  detailLabel: {
    color: "#666",
    marginLeft: 4,
    marginRight: 6,
  },
  detailSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  chipWrapper: {
    flexShrink: 1,
    alignItems: "flex-start",
  },
});
