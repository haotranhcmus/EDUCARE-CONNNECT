import { useContentForUI } from "@/src/hooks/useContent";
import {
  useAddContentToSession,
  useRemoveContentFromSession,
  useSession,
  useSessionContents,
  useUpdateContentOrder,
} from "@/src/hooks/useSessions";
import { Colors, Spacing } from "@/src/theme/colors";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";

// Domain mapping helper
const DOMAIN_LABELS: { [key: string]: string } = {
  cognitive: "Nhận thức",
  motor: "Vận động",
  language: "Ngôn ngữ",
  social: "Kỹ năng xã hội",
  self_care: "Tự phục vụ",
};

// FALLBACK Mock content library - used if Supabase fetch fails
const MOCK_CONTENT_LIBRARY = [
  {
    id: "1",
    title: "Nhận biết màu sắc",
    category: "Colors",
    age_range: "2-4 tuổi",
    description: "Học nhận biết và phân biệt các màu cơ bản",
    domain: "cognitive",
    goals: [
      "Nhận biết 3 màu cơ bản",
      "Phân biệt đỏ và xanh",
      "Chỉ đúng màu theo yêu cầu",
    ],
  },
  {
    id: "2",
    title: "Đếm số 1-10",
    category: "Numbers",
    age_range: "3-5 tuổi",
    description: "Học đếm từ 1 đến 10 và nhận biết số",
    domain: "cognitive",
    goals: ["Đếm đúng từ 1-5", "Đếm đúng từ 1-10", "Nhận biết số 1-5"],
  },
  {
    id: "3",
    title: "Động vật",
    category: "Animals",
    age_range: "2-5 tuổi",
    description: "Nhận biết tên và đặc điểm động vật",
    domain: "language",
    goals: [
      "Nhận biết 3 con vật",
      "Bắt chước tiếng động vật",
      "Chỉ đúng con vật theo tên",
    ],
  },
  {
    id: "4",
    title: "Hình dạng cơ bản",
    category: "Shapes",
    age_range: "2-4 tuổi",
    description: "Học các hình dạng: tròn, vuông, tam giác",
    domain: "cognitive",
    goals: [
      "Nhận biết hình tròn và vuông",
      "Nhận biết 3 hình cơ bản",
      "Phân loại hình dạng",
    ],
  },
  {
    id: "5",
    title: "Kỹ năng chào hỏi",
    category: "Social Skills",
    age_range: "2-6 tuổi",
    description: "Thực hành chào hỏi và giao tiếp xã hội",
    domain: "social",
    goals: ["Chào hỏi khi gặp", "Nói cảm ơn", "Giao tiếp bằng mắt"],
  },
];

type Content = {
  id: string;
  title: string;
  category: string;
  age_range: string;
  description: string;
  domain: string;
  goals: string[];
};

export default function AddContentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: session, isLoading } = useSession(id || "");
  const { data: existingContents, isLoading: contentsLoading } =
    useSessionContents(id || "");
  const addContent = useAddContentToSession();
  const removeContent = useRemoveContentFromSession();
  const updateOrder = useUpdateContentOrder();

  // Fetch content from Supabase with fallback to mock data
  const {
    data: supabaseContent,
    isLoading: isLoadingContent,
    error: contentError,
  } = useContentForUI({ is_public: true, is_template: true });

  // Use Supabase data if available, otherwise fallback to mock
  const baseContentLibrary = useMemo(() => {
    return supabaseContent && supabaseContent.length > 0
      ? supabaseContent
      : MOCK_CONTENT_LIBRARY;
  }, [supabaseContent, contentError]);

  // Mutable content library (can be extended with custom content)
  const [contentLibrary, setContentLibrary] = useState<Content[]>([]);

  // Initialize content library from base data
  useEffect(() => {
    setContentLibrary(baseContentLibrary);
  }, [baseContentLibrary]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContents, setSelectedContents] = useState<Content[]>([]);
  const [contentGoals, setContentGoals] = useState<{
    [key: string]: string[];
  }>({});

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [currentContentId, setCurrentContentId] = useState<string | null>(null);

  // New content form
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newAgeRange, setNewAgeRange] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDomain, setNewDomain] = useState("");

  // New goal form
  const [newGoal, setNewGoal] = useState("");

  // Load existing contents and pre-select them
  useEffect(() => {
    if (
      existingContents &&
      existingContents.length > 0 &&
      contentLibrary.length > 0
    ) {
      const preSelectedContents: Content[] = [];
      const preSelectedGoals: { [key: string]: string[] } = {};

      existingContents.forEach((existingContent) => {
        // Try to find matching content in library by title
        const matchingContent = contentLibrary.find(
          (c: Content) => c.title === existingContent.title
        );

        if (matchingContent) {
          // If found in library, pre-select it
          preSelectedContents.push(matchingContent);

          // Pre-select goals
          if (existingContent.goals && existingContent.goals.length > 0) {
            preSelectedGoals[matchingContent.id] = existingContent.goals.map(
              (g) => g.description
            );
          }
        } else {
          // If not in library, it's a custom content - add it to library
          const customGoals =
            existingContent.goals?.map((g) => g.description) || [];
          const customContent: Content = {
            id: `custom-${existingContent.id}`,
            title: existingContent.title,
            category: "Custom",
            age_range: "Tùy chỉnh",
            description: existingContent.description || "",
            domain: existingContent.domain,
            goals: customGoals,
          };

          setContentLibrary((prev) => [...prev, customContent]);
          preSelectedContents.push(customContent);
          preSelectedGoals[customContent.id] = customGoals;
        }
      });

      setSelectedContents(preSelectedContents);
      setContentGoals(preSelectedGoals);
    }
  }, [existingContents, contentLibrary]);

  const filteredContent = contentLibrary.filter((content: Content) =>
    content.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleContent = (content: Content) => {
    setSelectedContents((prev) => {
      const exists = prev.find((c) => c.id === content.id);
      if (exists) {
        // Removing content - also remove its goals
        setContentGoals((prevGoals) => {
          const newGoals = { ...prevGoals };
          delete newGoals[content.id];
          return newGoals;
        });
        return prev.filter((c) => c.id !== content.id);
      } else {
        // Adding content - auto-select all available goals
        if (content.goals && content.goals.length > 0) {
          setContentGoals((prevGoals) => ({
            ...prevGoals,
            [content.id]: [...content.goals],
          }));
        }
        return [...prev, content];
      }
    });
  };

  const handleSetGoal = (contentId: string, goal: string) => {
    setContentGoals((prev) => {
      const existingGoals = prev[contentId] || [];
      const hasGoal = existingGoals.includes(goal);

      if (hasGoal) {
        // Remove goal
        return {
          ...prev,
          [contentId]: existingGoals.filter((g) => g !== goal),
        };
      } else {
        // Add goal
        return {
          ...prev,
          [contentId]: [...existingGoals, goal],
        };
      }
    });
  };

  const handleMoveUp = (contentId: string) => {
    setSelectedContents((prev) => {
      const index = prev.findIndex((c) => c.id === contentId);
      if (index <= 0) return prev;

      const newList = [...prev];
      [newList[index - 1], newList[index]] = [
        newList[index],
        newList[index - 1],
      ];
      return newList;
    });
  };

  const handleMoveDown = (contentId: string) => {
    setSelectedContents((prev) => {
      const index = prev.findIndex((c) => c.id === contentId);
      if (index < 0 || index >= prev.length - 1) return prev;

      const newList = [...prev];
      [newList[index], newList[index + 1]] = [
        newList[index + 1],
        newList[index],
      ];
      return newList;
    });
  };

  const handleCreateContent = () => {
    if (!newTitle.trim() || !newDomain.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên bài học và lĩnh vực");
      return;
    }

    const newContent: Content = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      category: newCategory || "Custom",
      age_range: newAgeRange || "Tùy chỉnh",
      description: newDescription,
      domain: newDomain,
      goals: [],
    };

    setContentLibrary((prev) => [...prev, newContent]);
    setSelectedContents((prev) => [...prev, newContent]);

    // Reset form
    setNewTitle("");
    setNewCategory("");
    setNewAgeRange("");
    setNewDescription("");
    setNewDomain("");
    setShowCreateModal(false);

    Alert.alert("Thành công", "Đã tạo bài học mới");
  };

  const handleOpenGoalsModal = (contentId: string) => {
    setCurrentContentId(contentId);
    setShowGoalsModal(true);
  };

  const handleSelectGoal = (goal: string) => {
    if (currentContentId) {
      handleSetGoal(currentContentId, goal);
    }
  };

  const handleAddNewGoal = () => {
    if (!newGoal.trim() || !currentContentId) {
      Alert.alert("Lỗi", "Vui lòng nhập mục tiêu");
      return;
    }

    setContentLibrary((prev) =>
      prev.map((content) =>
        content.id === currentContentId
          ? { ...content, goals: [...content.goals, newGoal] }
          : content
      )
    );
    handleSetGoal(currentContentId, newGoal);
    setNewGoal("");
    setShowAddGoalModal(false);

    Alert.alert("Thành công", "Đã thêm mục tiêu mới");
  };

  const handleCloseGoalsModal = () => {
    setShowGoalsModal(false);
    setCurrentContentId(null);
  };

  const handleSaveToSession = async () => {
    if (selectedContents.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất một nội dung");
      return;
    }

    // Check if all selected contents have goals
    const missingGoals = selectedContents.filter(
      (content) =>
        !contentGoals[content.id] || contentGoals[content.id].length === 0
    );

    if (missingGoals.length > 0) {
      Alert.alert(
        "Cảnh báo",
        `Có ${missingGoals.length} bài học chưa có mục tiêu. Bạn có muốn tiếp tục?`,
        [
          { text: "Hủy", style: "cancel" },
          { text: "Tiếp tục", onPress: () => saveContents() },
        ]
      );
    } else {
      saveContents();
    }
  };

  const saveContents = async () => {
    try {
      const existingMap = new Map(
        existingContents?.map((c) => [
          c.title,
          {
            id: c.id,
            goals: c.goals?.map((g) => g.description).sort() || [],
            order: c.order_index,
          },
        ]) || []
      );

      const selectedMap = new Map(
        selectedContents.map((c, idx) => [
          c.title,
          {
            content: c,
            goals: (contentGoals[c.id] || []).sort(),
            order: idx + 1,
          },
        ])
      );

      const toRemove: string[] = [];
      const toAdd: Array<{ content: Content; goals: string[]; order: number }> =
        [];
      const toUpdate: Array<{ id: string; newOrder: number }> = [];

      existingContents?.forEach((ec) => {
        if (!selectedMap.has(ec.title)) {
          toRemove.push(ec.id);
        }
      });

      selectedContents.forEach((sc, idx) => {
        const existing = existingMap.get(sc.title);
        const selected = selectedMap.get(sc.title)!;

        if (!existing) {
          toAdd.push(selected);
        } else {
          const goalsChanged =
            JSON.stringify(existing.goals) !== JSON.stringify(selected.goals);

          if (goalsChanged) {
            toRemove.push(existing.id);
            toAdd.push(selected);
          } else if (existing.order !== selected.order) {
            toUpdate.push({ id: existing.id, newOrder: selected.order });
          }
        }
      });

      if (toRemove.length > 0) {
        for (const contentId of toRemove) {
          await removeContent.mutateAsync({
            contentId,
            sessionId: id || "",
          });
        }
      }

      if (toAdd.length > 0) {
        for (const { content, goals, order } of toAdd) {
          const payload = {
            session_id: id || "",
            content_library_id: null,
            domain: content.domain,
            title: content.title,
            order_index: order,
            description: content.description,
            notes: goals.join("; "),
            goals: goals.map((goal, idx) => ({
              description: goal,
              goal_type: "skill" as const,
              is_primary: idx === 0,
              order_index: idx + 1,
            })),
          };

          await addContent.mutateAsync(payload);
        }
      }

      if (toUpdate.length > 0) {
        await updateOrder.mutateAsync({
          sessionId: id || "",
          updates: toUpdate.map(({ id, newOrder }) => ({
            id,
            order_index: newOrder,
          })),
        });
      }

      const totalChanges = toRemove.length + toAdd.length + toUpdate.length;
      const message =
        totalChanges === 0
          ? "Không có thay đổi"
          : `Đã cập nhật ${totalChanges} nội dung`;

      Alert.alert("Thành công", message, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        "Lỗi",
        error instanceof Error ? error.message : "Không thể lưu nội dung"
      );
    }
  };

  if (isLoading || contentsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không tìm thấy buổi học</Text>
      </View>
    );
  }

  const availableGoals = useMemo(() => {
    if (!currentContentId) return [];
    const content = contentLibrary.find((c) => c.id === currentContentId);
    return content?.goals || [];
  }, [currentContentId, contentLibrary]);

  return (
    <>
      <Stack.Screen options={{ title: "Thêm nội dung" }} />

      <View style={styles.safeArea}>
        <View style={styles.container}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm bài học..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.text.tertiary}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.addButtonText}>+ Thêm bài học</Text>
            </TouchableOpacity>
          </View>

          {/* Selected Contents */}
          {selectedContents.length > 0 && (
            <View style={styles.selectedSection}>
              <Text style={styles.selectedTitle}>
                Đã chọn ({selectedContents.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedContents.map((content, index) => (
                  <View key={content.id} style={styles.selectedChip}>
                    <View style={styles.orderBadge}>
                      <Text style={styles.orderText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.selectedChipText}>{content.title}</Text>
                    <TouchableOpacity
                      onPress={() => handleToggleContent(content)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Content List */}
          <FlatList
            data={filteredContent}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedContents.some((c) => c.id === item.id);
              const selectedIndex = selectedContents.findIndex(
                (c) => c.id === item.id
              );

              return (
                <View style={styles.contentCard}>
                  <View style={styles.contentHeader}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => handleToggleContent(item)}
                    >
                      {isSelected && <View style={styles.checkboxChecked} />}
                    </TouchableOpacity>
                    <View style={styles.contentInfo}>
                      <Text style={styles.contentTitle}>{item.title}</Text>
                      <Text style={styles.contentMeta}>
                        {item.category} · {item.age_range} ·{" "}
                        {DOMAIN_LABELS[item.domain] || item.domain}
                      </Text>
                      <Text style={styles.contentDescription}>
                        {item.description}
                      </Text>
                    </View>
                  </View>

                  {isSelected && (
                    <View style={styles.selectedContentDetails}>
                      <View style={styles.orderControls}>
                        <Text style={styles.orderLabel}>
                          Thứ tự: {selectedIndex + 1}
                        </Text>
                        <View style={styles.orderButtons}>
                          <TouchableOpacity
                            style={[
                              styles.orderButton,
                              selectedIndex === 0 && styles.orderButtonDisabled,
                            ]}
                            onPress={() => handleMoveUp(item.id)}
                            disabled={selectedIndex === 0}
                          >
                            <Text
                              style={[
                                styles.orderButtonText,
                                selectedIndex === 0 &&
                                  styles.orderButtonTextDisabled,
                              ]}
                            >
                              ↑
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.orderButton,
                              selectedIndex === selectedContents.length - 1 &&
                                styles.orderButtonDisabled,
                            ]}
                            onPress={() => handleMoveDown(item.id)}
                            disabled={
                              selectedIndex === selectedContents.length - 1
                            }
                          >
                            <Text
                              style={[
                                styles.orderButtonText,
                                selectedIndex === selectedContents.length - 1 &&
                                  styles.orderButtonTextDisabled,
                              ]}
                            >
                              ↓
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.goalSection}>
                        <View style={styles.goalHeader}>
                          <Text style={styles.goalLabel}>
                            Mục tiêu ({contentGoals[item.id]?.length || 0}):
                          </Text>
                          <TouchableOpacity
                            style={styles.addGoalChip}
                            onPress={() => handleOpenGoalsModal(item.id)}
                          >
                            <Text style={styles.addGoalChipText}>
                              + Thêm mục tiêu
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {contentGoals[item.id]?.length > 0 ? (
                          <View style={styles.goalsListContainer}>
                            {contentGoals[item.id].map((goal, idx) => (
                              <View key={idx} style={styles.goalChip}>
                                <Text style={styles.goalChipNumber}>
                                  {idx + 1}.
                                </Text>
                                <Text style={styles.goalChipText}>{goal}</Text>
                                <TouchableOpacity
                                  onPress={() => handleSetGoal(item.id, goal)}
                                  style={styles.removeGoalButton}
                                >
                                  <Text style={styles.removeGoalButtonText}>
                                    ×
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <Text style={styles.emptyGoalsHint}>
                            Chưa có mục tiêu. Nhấn "Thêm mục tiêu" để chọn.
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            }}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>Không tìm thấy bài học</Text>
                <TouchableOpacity
                  style={styles.createFirstButton}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Text style={styles.createFirstButtonText}>
                    + Tạo bài học đầu tiên
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />

          {/* Save Button */}
          {selectedContents.length > 0 && (
            <View style={styles.saveButtonContainer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveToSession}
                disabled={
                  addContent.isPending ||
                  removeContent.isPending ||
                  updateOrder.isPending
                }
              >
                {addContent.isPending ||
                removeContent.isPending ||
                updateOrder.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    Lưu ({selectedContents.length} bài học)
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Create Content Modal */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tạo bài học mới</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={styles.inputLabel}>Tên bài học *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nhập tên bài học"
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholderTextColor={Colors.text.tertiary}
                />

                <Text style={styles.inputLabel}>Lĩnh vực *</Text>
                <View style={styles.domainButtons}>
                  {Object.entries(DOMAIN_LABELS).map(([key, label]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.domainButton,
                        newDomain === key && styles.domainButtonSelected,
                      ]}
                      onPress={() => setNewDomain(key)}
                    >
                      <Text
                        style={[
                          styles.domainButtonText,
                          newDomain === key && styles.domainButtonTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Danh mục</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="VD: Colors, Numbers, Social Skills"
                  value={newCategory}
                  onChangeText={setNewCategory}
                  placeholderTextColor={Colors.text.tertiary}
                />

                <Text style={styles.inputLabel}>Độ tuổi</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="VD: 2-4 tuổi"
                  value={newAgeRange}
                  onChangeText={setNewAgeRange}
                  placeholderTextColor={Colors.text.tertiary}
                />

                <Text style={styles.inputLabel}>Mô tả</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  placeholder="Mô tả chi tiết về bài học"
                  value={newDescription}
                  onChangeText={setNewDescription}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={Colors.text.tertiary}
                />
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleCreateContent}
                >
                  <Text style={styles.modalSaveButtonText}>Tạo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Goals Selection Modal */}
        <Modal
          visible={showGoalsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseGoalsModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn mục tiêu</Text>
                <TouchableOpacity onPress={handleCloseGoalsModal}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.goalsModalHeader}>
                  <Text style={styles.sectionLabel}>
                    Chọn mục tiêu (có thể chọn nhiều):
                  </Text>
                  <TouchableOpacity
                    style={styles.addNewGoalButton}
                    onPress={() => setShowAddGoalModal(true)}
                  >
                    <Text style={styles.addNewGoalButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                {availableGoals.length > 0 ? (
                  <>
                    {availableGoals.map((goal: string, index: number) => {
                      const isSelected =
                        currentContentId &&
                        contentGoals[currentContentId]?.includes(goal);
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.goalOption,
                            isSelected && styles.goalOptionSelected,
                          ]}
                          onPress={() => handleSelectGoal(goal)}
                        >
                          <View style={styles.goalCheckbox}>
                            {isSelected && (
                              <View style={styles.goalCheckboxChecked} />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.goalOptionText,
                              isSelected && styles.goalOptionTextSelected,
                            ]}
                          >
                            {goal}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </>
                ) : (
                  <Text style={styles.emptyGoalsText}>
                    Chưa có mục tiêu nào. Nhấn nút "+" để tạo mục tiêu mới.
                  </Text>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleCloseGoalsModal}
                >
                  <Text style={styles.modalSaveButtonText}>
                    Lưu các mục tiêu
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add New Goal Modal */}
        <Modal
          visible={showAddGoalModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowAddGoalModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.smallModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Thêm mục tiêu mới</Text>
                <TouchableOpacity onPress={() => setShowAddGoalModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>Mục tiêu:</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  placeholder="Nhập mục tiêu mới..."
                  value={newGoal}
                  onChangeText={setNewGoal}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor={Colors.text.tertiary}
                  autoFocus
                />
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowAddGoalModal(false);
                    setNewGoal("");
                  }}
                >
                  <Text style={styles.modalCancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleAddNewGoal}
                >
                  <Text style={styles.modalSaveButtonText}>Thêm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
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
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  searchContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  selectedSection: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.sm,
  },
  orderBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.xs,
  },
  orderText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  selectedChipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginRight: Spacing.xs,
  },
  removeButton: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  contentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: Spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  contentMeta: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  contentDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  selectedContentDetails: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.default,
  },
  orderControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  orderLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  orderButtons: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  orderButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background.primary,
  },
  orderButtonDisabled: {
    borderColor: Colors.border.default,
    opacity: 0.4,
  },
  orderButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  orderButtonTextDisabled: {
    color: Colors.text.tertiary,
  },
  goalSection: {
    marginTop: Spacing.sm,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  addGoalChip: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  addGoalChipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  goalsListContainer: {
    gap: Spacing.xs,
  },
  goalChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: 8,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  goalChipNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
    minWidth: 20,
  },
  goalChipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text.primary,
  },
  removeGoalButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.error,
    justifyContent: "center",
    alignItems: "center",
  },
  removeGoalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 16,
  },
  emptyGoalsHint: {
    fontSize: 13,
    color: Colors.text.tertiary,
    fontStyle: "italic",
    marginTop: Spacing.xs,
  },
  emptyList: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  emptyListText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  createFirstButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border.default,
  },
  saveButton: {
    backgroundColor: Colors.success,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  smallModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    maxWidth: "90%",
    width: "100%",
    alignSelf: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  modalClose: {
    fontSize: 24,
    color: Colors.text.secondary,
    fontWeight: "600",
  },
  modalBody: {
    padding: Spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
    marginBottom: Spacing.sm,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalFooter: {
    flexDirection: "row",
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.default,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  modalCancelButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  modalSaveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  domainButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  domainButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border.default,
    backgroundColor: Colors.background.primary,
  },
  domainButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  domainButtonText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  domainButtonTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  goalsModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  addNewGoalButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  addNewGoalButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 24,
  },
  goalOption: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background.primary,
    gap: Spacing.sm,
  },
  goalOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  goalCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  goalCheckboxChecked: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  goalOptionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
  },
  goalOptionTextSelected: {
    fontWeight: "600",
    color: Colors.primary,
  },
  emptyGoalsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    padding: Spacing.lg,
    fontStyle: "italic",
  },
});
