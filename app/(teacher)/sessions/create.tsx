import { useContentForUI } from "@/src/hooks/useContent";
import {
  useCreateCustomContent,
  useMyCustomContent,
} from "@/src/hooks/useCustomContent";
import {
  useAddContentToSession,
  useCreateSession,
} from "@/src/hooks/useSessions";
import { useStudents } from "@/src/hooks/useStudents";
import { useAuthStore } from "@/src/stores/authStore";
import { CreateSessionData } from "@/src/types/session.types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { format } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  HelperText,
  IconButton,
  Modal,
  Portal,
  Searchbar,
  Text,
  TextInput,
} from "react-native-paper";

// Domain labels
const DOMAIN_LABELS: { [key: string]: string } = {
  cognitive: "Nhận thức",
  motor: "Vận động",
  language: "Ngôn ngữ",
  social: "Kỹ năng xã hội",
  self_care: "Tự phục vụ",
};

interface ContentWithGoals {
  id: string;
  title: string;
  domain: string;
  description?: string;
  goals: string[];
  isCustom?: boolean; // Flag to identify custom content
}

export default function CreateSessionScreen() {
  const { date: initialDate, studentId: initialStudentId } =
    useLocalSearchParams<{
      date?: string;
      studentId?: string;
    }>();

  const { user } = useAuthStore();
  const { data: students, isLoading: loadingStudents } = useStudents();

  // Fetch public content library
  const { data: contentLibraryData, isLoading: loadingContent } =
    useContentForUI({
      is_public: true,
      is_template: true,
    });

  // Fetch user's custom content
  const { data: customContentData, isLoading: loadingCustomContent } =
    useMyCustomContent();

  const createSession = useCreateSession();
  const addContent = useAddContentToSession();
  const createCustomContent = useCreateCustomContent();

  // Form state
  const [studentId, setStudentId] = useState(initialStudentId || "");
  const [sessionDate, setSessionDate] = useState(
    initialDate ? new Date(initialDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Content state
  const [selectedContents, setSelectedContents] = useState<
    Map<string, ContentWithGoals>
  >(new Map());
  const [showContentBrowser, setShowContentBrowser] = useState(false);
  const [showManualContent, setShowManualContent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Manual content state
  const [manualTitle, setManualTitle] = useState("");
  const [manualDomain, setManualDomain] = useState("cognitive");
  const [manualDescription, setManualDescription] = useState("");
  const [manualGoals, setManualGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState("");

  // Edit content state
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [editingGoals, setEditingGoals] = useState<string[]>([]);
  const [editNewGoal, setEditNewGoal] = useState("");

  // Convert content library data (public templates)
  const contentLibrary: ContentWithGoals[] = useMemo(() => {
    if (!contentLibraryData) return [];
    return contentLibraryData.map((item) => ({
      id: item.id,
      title: item.title,
      domain: item.domain,
      description: item.description || "",
      goals: Array.isArray(item.goals)
        ? item.goals.map((g: any) =>
            typeof g === "string" ? g : g?.description || ""
          )
        : [],
      isCustom: false,
    }));
  }, [contentLibraryData]);

  // Convert custom content data
  const customContentLibrary: ContentWithGoals[] = useMemo(() => {
    if (!customContentData) return [];
    return customContentData.map((item) => ({
      id: item.id,
      title: item.title,
      domain: item.domain,
      description: item.description || "",
      goals: Array.isArray(item.default_goals)
        ? item.default_goals.map((g: any) =>
            typeof g === "string" ? g : String(g)
          )
        : [],
      isCustom: true,
    }));
  }, [customContentData]);

  // Merge both public and custom content
  const allContent = useMemo(() => {
    return [...customContentLibrary, ...contentLibrary];
  }, [customContentLibrary, contentLibrary]);

  // Filtered content (search in both public and custom)
  const filteredContent = useMemo(() => {
    if (!searchQuery) return allContent;
    const query = searchQuery.toLowerCase();
    return allContent.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
    );
  }, [allContent, searchQuery]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!studentId) {
      newErrors.studentId = "Vui lòng chọn học sinh";
    }
    if (!startTime) {
      newErrors.startTime = "Vui lòng nhập giờ bắt đầu";
    }
    if (!endTime) {
      newErrors.endTime = "Vui lòng nhập giờ kết thúc";
    }
    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = "Giờ kết thúc phải sau giờ bắt đầu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddManualContent = async () => {
    if (!manualTitle || !manualDomain) {
      Alert.alert("Lỗi", "Vui lòng nhập tên nội dung và chọn lĩnh vực");
      return;
    }

    if (!user) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
      return;
    }

    try {
      // Save to database for reuse
      const saved = await createCustomContent.mutateAsync({
        profile_id: user.id,
        title: manualTitle,
        domain: manualDomain,
        description: manualDescription || null,
        default_goals: manualGoals,
        materials_needed: null,
        estimated_duration: null,
        instructions: null,
        tips: null,
        tags: null,
        is_favorite: false,
      });

      // Add to selected contents with real ID
      const newContent: ContentWithGoals = {
        id: saved.id,
        title: saved.title,
        domain: saved.domain,
        description: saved.description || "",
        goals: Array.isArray(saved.default_goals)
          ? saved.default_goals.map((g: any) =>
              typeof g === "string" ? g : String(g)
            )
          : [],
        isCustom: true,
      };

      setSelectedContents(
        new Map(selectedContents.set(newContent.id, newContent))
      );

      // Reset form
      setManualTitle("");
      setManualDomain("cognitive");
      setManualDescription("");
      setManualGoals([]);
      setShowManualContent(false);

      // Show success message
      Alert.alert(
        "Đã lưu!",
        "Nội dung đã được lưu vào thư viện của bạn để sử dụng lại sau này."
      );
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lưu nội dung. Vui lòng thử lại.");
    }
  };

  const handleToggleContent = (content: ContentWithGoals) => {
    const newMap = new Map(selectedContents);
    if (newMap.has(content.id)) {
      newMap.delete(content.id);
    } else {
      newMap.set(content.id, content);
    }
    setSelectedContents(newMap);
  };

  const handleRemoveContent = (id: string) => {
    const newMap = new Map(selectedContents);
    newMap.delete(id);
    setSelectedContents(newMap);
    // If removing the content being edited, reset edit state
    if (editingContentId === id) {
      setEditingContentId(null);
      setEditingGoals([]);
      setEditNewGoal("");
    }
  };

  const handleEditContent = (content: ContentWithGoals) => {
    setEditingContentId(content.id);
    setEditingGoals([...content.goals]);
    setEditNewGoal("");
  };

  const handleCancelEdit = () => {
    setEditingContentId(null);
    setEditingGoals([]);
    setEditNewGoal("");
  };

  const handleSaveEdit = () => {
    if (!editingContentId) return;

    const content = selectedContents.get(editingContentId);
    if (!content) return;

    // Update the content with new goals
    const updatedContent = {
      ...content,
      goals: editingGoals,
    };

    const newMap = new Map(selectedContents);
    newMap.set(editingContentId, updatedContent);
    setSelectedContents(newMap);

    // Reset edit state
    setEditingContentId(null);
    setEditingGoals([]);
    setEditNewGoal("");
  };

  const handleRemoveGoalFromEdit = (index: number) => {
    setEditingGoals(editingGoals.filter((_, i) => i !== index));
  };

  const handleAddGoalToEdit = () => {
    if (!editNewGoal.trim()) return;
    setEditingGoals([...editingGoals, editNewGoal.trim()]);
    setEditNewGoal("");
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!user) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
      return;
    }

    const data: CreateSessionData = {
      student_id: studentId,
      session_date: format(sessionDate, "yyyy-MM-dd"),
      start_time: startTime,
      end_time: endTime,
      created_by: user.id,
      location: location || undefined,
      notes: notes || undefined,
    };

    try {
      const newSession = await createSession.mutateAsync(data);

      // Add contents if any
      if (selectedContents.size > 0 && newSession?.id) {
        let orderIndex = 1;
        for (const content of selectedContents.values()) {
          await addContent.mutateAsync({
            session_id: newSession.id,
            content_library_id: content.isCustom ? null : content.id,
            user_custom_content_id: content.isCustom ? content.id : null,
            domain: content.domain,
            title: content.title,
            description: content.description,
            order_index: orderIndex++,
            goals: content.goals.map((goal, idx) => ({
              description: goal,
              goal_type: "skill" as const,
              is_primary: idx === 0,
              order_index: idx + 1,
            })),
          });
        }
      }

      Alert.alert(
        "Thành công",
        selectedContents.size > 0
          ? `Đã tạo buổi học với ${selectedContents.size} nội dung`
          : "Đã tạo buổi học mới",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/sessions/${newSession.id}/details`),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Lỗi",
        error instanceof Error ? error.message : "Không thể tạo buổi học"
      );
    }
  };

  if (loadingStudents) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Đang tải danh sách học sinh...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Title title="Thông tin buổi học" />
          <Card.Content>
            {/* Student Picker */}
            <View style={styles.field}>
              <Text variant="labelLarge" style={styles.label}>
                Học sinh *
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={studentId}
                  onValueChange={(value) => setStudentId(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Chọn học sinh" value="" />
                  {students?.map((student) => (
                    <Picker.Item
                      key={student.id}
                      label={`${student.last_name} ${student.first_name}${
                        student.nickname ? ` (${student.nickname})` : ""
                      }`}
                      value={student.id}
                    />
                  ))}
                </Picker>
              </View>
              {errors.studentId && (
                <HelperText type="error" visible>
                  {errors.studentId}
                </HelperText>
              )}
            </View>

            {/* Session Date */}
            <View style={styles.field}>
              <Text variant="labelLarge" style={styles.label}>
                Ngày học *
              </Text>
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                icon="calendar"
                style={styles.dateButton}
              >
                {format(sessionDate, "dd/MM/yyyy")}
              </Button>
              {showDatePicker && (
                <DateTimePicker
                  value={sessionDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (selectedDate) {
                      setSessionDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>

            {/* Time Range */}
            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <TextInput
                  label="Giờ bắt đầu *"
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="09:00"
                  mode="outlined"
                  error={!!errors.startTime}
                />
                {errors.startTime && (
                  <HelperText type="error" visible>
                    {errors.startTime}
                  </HelperText>
                )}
              </View>
              <View style={styles.timeField}>
                <TextInput
                  label="Giờ kết thúc *"
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="10:00"
                  mode="outlined"
                  error={!!errors.endTime}
                />
                {errors.endTime && (
                  <HelperText type="error" visible>
                    {errors.endTime}
                  </HelperText>
                )}
              </View>
            </View>

            {/* Location */}
            <View style={styles.field}>
              <TextInput
                label="Địa điểm"
                value={location}
                onChangeText={setLocation}
                mode="outlined"
                placeholder="Ví dụ: Phòng học số 1"
              />
            </View>

            {/* Notes */}
            <View style={styles.field}>
              <TextInput
                label="Ghi chú"
                value={notes}
                onChangeText={setNotes}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="Ghi chú về buổi học..."
              />
            </View>
          </Card.Content>
        </Card>

        {/* Selected Contents */}
        <Card style={styles.card}>
          <Card.Title
            title={`Nội dung buổi học (${selectedContents.size})`}
            right={(props) => (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button
                  {...props}
                  mode="text"
                  icon="library"
                  onPress={() => setShowContentBrowser(true)}
                  compact
                >
                  Thư viện
                </Button>
                <Button
                  {...props}
                  mode="text"
                  icon="pencil-plus"
                  onPress={() => setShowManualContent(true)}
                  compact
                >
                  Tạo mới
                </Button>
              </View>
            )}
          />
          <Card.Content>
            {selectedContents.size === 0 ? (
              <View style={styles.emptyContent}>
                <IconButton
                  icon="book-open-variant"
                  size={48}
                  iconColor="#E0E0E0"
                  style={{ margin: 0 }}
                />
                <Text
                  variant="bodyLarge"
                  style={{ color: "#999", marginTop: 8, fontWeight: "500" }}
                >
                  Chưa có nội dung nào
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: "#999", marginTop: 4 }}
                >
                  Nhấn "Thư viện" hoặc "Tạo mới" để thêm bài học
                </Text>
              </View>
            ) : (
              Array.from(selectedContents.values()).map((content, index) => {
                const isEditing = editingContentId === content.id;

                return (
                  <View key={content.id}>
                    {index > 0 && <Divider style={{ marginVertical: 8 }} />}

                    {isEditing ? (
                      /* Edit Mode */
                      <View style={styles.contentEditMode}>
                        <View style={styles.contentEditHeader}>
                          <View style={{ flex: 1 }}>
                            <Chip
                              mode="flat"
                              compact
                              style={{ backgroundColor: "#E8DEF8" }}
                              textStyle={{
                                color: "#6750A4",
                                fontWeight: "600",
                              }}
                            >
                              {DOMAIN_LABELS[content.domain] || content.domain}
                            </Chip>
                            <Text
                              variant="titleMedium"
                              style={{ marginTop: 8, fontWeight: "600" }}
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
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 8,
                              marginLeft: 8,
                            }}
                          >
                            <Button
                              mode="outlined"
                              onPress={handleCancelEdit}
                              compact
                              textColor="#666"
                            >
                              Hủy
                            </Button>
                            <Button
                              mode="contained"
                              onPress={handleSaveEdit}
                              compact
                              style={{ backgroundColor: "#4CAF50" }}
                            >
                              Lưu
                            </Button>
                          </View>
                        </View>

                        {/* Goals in edit mode */}
                        <View style={{ marginTop: 12 }}>
                          <Text
                            variant="labelMedium"
                            style={{ color: "#6750A4", fontWeight: "600" }}
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
                                onPress={() => handleRemoveGoalFromEdit(idx)}
                                style={{ margin: 0 }}
                              />
                            </View>
                          ))}
                          {/* Add new goal */}
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 8,
                              marginTop: 8,
                              alignItems: "center",
                            }}
                          >
                            <TextInput
                              placeholder="Nhập mục tiêu mới..."
                              value={editNewGoal}
                              onChangeText={setEditNewGoal}
                              mode="outlined"
                              dense
                              style={{ flex: 1 }}
                              onSubmitEditing={handleAddGoalToEdit}
                              outlineColor="#E0E0E0"
                              activeOutlineColor="#6750A4"
                            />
                            <Button
                              mode="contained"
                              onPress={handleAddGoalToEdit}
                              compact
                              style={{ backgroundColor: "#6750A4" }}
                            >
                              Thêm
                            </Button>
                          </View>
                        </View>
                      </View>
                    ) : (
                      /* View Mode */
                      <View style={styles.contentItem}>
                        <View style={styles.contentHeader}>
                          <Chip
                            mode="flat"
                            compact
                            style={{ backgroundColor: "#E8DEF8" }}
                            textStyle={{ color: "#6750A4", fontWeight: "600" }}
                          >
                            {DOMAIN_LABELS[content.domain] || content.domain}
                          </Chip>
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
                        </View>
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
                        {content.goals.length > 0 && (
                          <View style={{ marginTop: 8 }}>
                            <Text
                              variant="labelMedium"
                              style={{ color: "#6750A4", fontWeight: "600" }}
                            >
                              Mục tiêu ({content.goals.length})
                            </Text>
                            {content.goals.map((goal, idx) => (
                              <Text
                                key={idx}
                                variant="bodyMedium"
                                style={{
                                  marginTop: 4,
                                  color: "#333",
                                  lineHeight: 20,
                                }}
                              >
                                • {goal}
                              </Text>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={[styles.button, { borderColor: "#999" }]}
            textColor="#666"
          >
            Hủy
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={createSession.isPending}
            disabled={createSession.isPending}
            style={[styles.button, { backgroundColor: "#6750A4" }]}
            icon="check"
          >
            Tạo buổi học
          </Button>
        </View>
      </ScrollView>

      {/* Content Browser Modal */}
      <Portal>
        <Modal
          visible={showContentBrowser}
          onDismiss={() => setShowContentBrowser(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
            Chọn từ thư viện
          </Text>
          <Searchbar
            placeholder="Tìm kiếm nội dung..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: 16 }}
          />
          {loadingContent ? (
            <ActivityIndicator style={{ margin: 32 }} />
          ) : (
            <FlatList
              data={filteredContent}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.contentListItem}
                  onPress={() => handleToggleContent(item)}
                >
                  <Checkbox
                    status={
                      selectedContents.has(item.id) ? "checked" : "unchecked"
                    }
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text variant="titleSmall">{item.title}</Text>
                    <Text variant="bodySmall" style={{ color: "#666" }}>
                      {DOMAIN_LABELS[item.domain]} • {item.goals.length} mục
                      tiêu
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text
                  style={{ textAlign: "center", color: "#999", margin: 32 }}
                >
                  Không tìm thấy nội dung nào
                </Text>
              }
              style={{ maxHeight: 400 }}
            />
          )}
          <Button
            mode="contained"
            onPress={() => setShowContentBrowser(false)}
            style={{ marginTop: 16 }}
          >
            Xong
          </Button>
        </Modal>

        {/* Manual Content Modal */}
        <Modal
          visible={showManualContent}
          onDismiss={() => setShowManualContent(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
            Tạo nội dung mới
          </Text>
          <ScrollView style={{ maxHeight: 500 }}>
            <TextInput
              label="Tên nội dung *"
              value={manualTitle}
              onChangeText={setManualTitle}
              mode="outlined"
              style={{ marginBottom: 12 }}
            />
            <Text variant="labelMedium" style={{ marginBottom: 8 }}>
              Lĩnh vực *
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={manualDomain}
                onValueChange={setManualDomain}
                style={styles.picker}
              >
                {Object.entries(DOMAIN_LABELS).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
            </View>
            <TextInput
              label="Mô tả"
              value={manualDescription}
              onChangeText={setManualDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={{ marginTop: 12, marginBottom: 12 }}
            />
            <Text variant="labelMedium" style={{ marginBottom: 8 }}>
              Mục tiêu ({manualGoals.length})
            </Text>
            {manualGoals.map((goal, idx) => (
              <View key={idx} style={styles.goalItem}>
                <Text variant="bodyMedium" style={{ flex: 1 }}>
                  • {goal}
                </Text>
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() =>
                    setManualGoals(manualGoals.filter((_, i) => i !== idx))
                  }
                />
              </View>
            ))}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
              <TextInput
                label="Thêm mục tiêu"
                value={newGoal}
                onChangeText={setNewGoal}
                mode="outlined"
                style={{ flex: 1 }}
                onSubmitEditing={() => {
                  if (newGoal.trim()) {
                    setManualGoals([...manualGoals, newGoal.trim()]);
                    setNewGoal("");
                  }
                }}
              />
              <Button
                mode="contained-tonal"
                onPress={() => {
                  if (newGoal.trim()) {
                    setManualGoals([...manualGoals, newGoal.trim()]);
                    setNewGoal("");
                  }
                }}
                style={{ alignSelf: "flex-end" }}
              >
                Thêm
              </Button>
            </View>
          </ScrollView>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            <Button
              mode="outlined"
              onPress={() => setShowManualContent(false)}
              style={{ flex: 1 }}
            >
              Hủy
            </Button>
            <Button
              mode="contained"
              onPress={handleAddManualContent}
              style={{ flex: 1 }}
            >
              Thêm
            </Button>
          </View>
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
  card: {
    margin: 16,
    elevation: 2,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  dateButton: {
    justifyContent: "flex-start",
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  timeField: {
    flex: 1,
  },
  emptyContent: {
    padding: 24,
    alignItems: "center",
  },
  contentItem: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  contentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingTop: 0,
  },
  button: {
    flex: 1,
  },
  modal: {
    backgroundColor: "white",
    padding: 24,
    margin: 20,
    borderRadius: 12,
    maxHeight: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  contentListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
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
});
