import { supabase } from "@/lib/supabase/client";
import { useBehaviors } from "@/src/hooks/useBehaviors";
import {
  useAddBehaviorIncident,
  useAddGoalEvaluation,
  useCompleteSession,
  useSession,
  useSessionContents,
  useSessionLog,
  useStartSession,
  useUpdateGoalEvaluation,
  useUpdateSessionLog,
} from "@/src/hooks/useSessions";
import { useAuthStore } from "@/src/stores/authStore";
import { getCurrentTimeString } from "@/src/utils/time";
import Slider from "@react-native-community/slider";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  Icon,
  IconButton,
  List,
  Modal,
  Portal,
  Searchbar,
  Text,
  TextInput,
} from "react-native-paper";

// Mood options with icons and colors
const MOOD_OPTIONS = [
  {
    value: "very_difficult",
    label: "Rất khó khăn",
    icon: "emoticon-sad",
    color: "#F44336",
  },
  {
    value: "difficult",
    label: "Khó khăn",
    icon: "emoticon-neutral",
    color: "#FF9800",
  },
  { value: "normal", label: "Bình thường", icon: "emoticon", color: "#9E9E9E" },
  { value: "good", label: "Tốt", icon: "emoticon-happy", color: "#4CAF50" },
  {
    value: "very_good",
    label: "Rất tốt",
    icon: "emoticon-excited",
    color: "#2196F3",
  },
];

const SUPPORT_LEVELS = [
  { value: "independent", label: "Độc lập", color: "#4CAF50" },
  { value: "minimal_prompt", label: "Nhắc nhẹ", color: "#8BC34A" },
  { value: "moderate_prompt", label: "Nhắc vừa", color: "#FFC107" },
  { value: "substantial_prompt", label: "Nhiều hỗ trợ", color: "#FF9800" },
  { value: "full_assistance", label: "Hỗ trợ toàn phần", color: "#F44336" },
];

// Memoized Level Button Component
const LevelButton = React.memo(
  ({
    level,
    currentLevel,
    onPress,
    iconName = "circle",
    activeColor = "#6750A4",
    isStar = false,
  }: {
    level: number;
    currentLevel: number;
    onPress: (level: number) => void;
    iconName?: string;
    activeColor?: string;
    isStar?: boolean;
  }) => {
    const isActive = level <= currentLevel;
    const icon = isActive
      ? isStar
        ? "star"
        : iconName
      : isStar
      ? "star-outline"
      : `${iconName}-outline`;

    return (
      <View style={styles.levelButtonWrapper}>
        <IconButton
          icon={icon}
          size={isStar ? 32 : 28}
          iconColor={isActive ? activeColor : "#E0E0E0"}
          onPress={() => onPress(level)}
          style={[
            styles.levelButton,
            isActive &&
              (isStar
                ? styles.levelButtonActiveStar
                : styles.levelButtonActive),
          ]}
        />
      </View>
    );
  }
);

// Memoized Incident Card Component
const IncidentCard = React.memo(
  ({
    incident,
    index,
    onEdit,
    onDelete,
  }: {
    incident: any;
    index: number;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
  }) => {
    return (
      <Card style={styles.incidentCard} elevation={3}>
        <Card.Content style={{ padding: 16 }}>
          <View style={styles.incidentCardContent}>
            <View style={{ flex: 1 }}>
              <View style={styles.incidentHeaderTags}>
                <Chip
                  compact
                  mode="flat"
                  style={styles.incidentNumberChip}
                  textStyle={styles.incidentNumberText}
                  icon="numeric"
                >
                  #{index + 1}
                </Chip>
                {incident.behavior_name && (
                  <Chip
                    compact
                    mode="flat"
                    icon="book-open-variant"
                    style={styles.incidentLibraryChip}
                    textStyle={styles.incidentLibraryText}
                  >
                    Từ thư viện
                  </Chip>
                )}
              </View>
              <Text variant="titleMedium" style={styles.incidentDescription}>
                {incident.behavior_description}
              </Text>
              <View style={styles.incidentTimeContainer}>
                <Icon source="clock-outline" size={16} color="#666" />
                <Text variant="bodySmall" style={styles.incidentTime}>
                  {incident.occurred_at}
                </Text>
              </View>
              {(incident.antecedent ||
                incident.consequence ||
                incident.intervention_used) && (
                <View style={styles.incidentDetailsContainer}>
                  {incident.antecedent && (
                    <View style={styles.incidentDetail}>
                      <View style={styles.incidentDetailHeader}>
                        <Icon source="lightbulb-on" size={18} color="#FFA726" />
                        <Text style={styles.incidentDetailLabel}>
                          Nguyên nhân
                        </Text>
                      </View>
                      <Text style={styles.incidentDetailText}>
                        {incident.antecedent}
                      </Text>
                    </View>
                  )}
                  {incident.consequence && (
                    <View style={styles.incidentDetail}>
                      <View style={styles.incidentDetailHeader}>
                        <Icon
                          source="format-list-bulleted"
                          size={18}
                          color="#66BB6A"
                        />
                        <Text style={styles.incidentDetailLabel}>Hậu quả</Text>
                      </View>
                      <Text style={styles.incidentDetailText}>
                        {incident.consequence}
                      </Text>
                    </View>
                  )}
                  {incident.intervention_used && (
                    <View style={styles.incidentDetail}>
                      <View style={styles.incidentDetailHeader}>
                        <Icon source="wrench" size={18} color="#42A5F5" />
                        <Text style={styles.incidentDetailLabel}>
                          Can thiệp
                        </Text>
                      </View>
                      <Text style={styles.incidentDetailText}>
                        {incident.intervention_used}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            <View style={styles.incidentActions}>
              <IconButton
                icon="pencil"
                size={22}
                iconColor="#6750A4"
                onPress={() => onEdit(index)}
                style={styles.incidentActionButton}
                containerColor="#F3EDF7"
              />
              <IconButton
                icon="delete"
                size={22}
                iconColor="#F44336"
                onPress={() => onDelete(index)}
                style={styles.incidentActionButton}
                containerColor="#FFEBEE"
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  }
);

export default function SessionLoggingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data: session, isLoading: sessionLoading } = useSession(id || "");
  const { data: sessionLog, isLoading: logLoading } = useSessionLog(id || "");
  const { data: contents, isLoading: contentsLoading } = useSessionContents(
    id || ""
  );

  const startSession = useStartSession();
  const updateLog = useUpdateSessionLog();
  const completeSession = useCompleteSession();
  const addIncident = useAddBehaviorIncident();
  const addGoalEvaluation = useAddGoalEvaluation();
  const updateGoalEvaluation = useUpdateGoalEvaluation();

  // Form state
  const [mood, setMood] = useState<string>("normal");
  const [energyLevel, setEnergyLevel] = useState(3);
  const [cooperationLevel, setCooperationLevel] = useState(3);
  const [focusLevel, setFocusLevel] = useState(3);
  const [independenceLevel, setIndependenceLevel] = useState(3);
  const [progressNotes, setProgressNotes] = useState("");
  const [challengesFaced, setChallengesFaced] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [attitudeSummary, setAttitudeSummary] = useState("");
  const [teacherNotes, setTeacherNotes] = useState("");
  const [overallRating, setOverallRating] = useState(3);

  // Goal evaluations state
  const [goalEvaluations, setGoalEvaluations] = useState<
    Record<
      string,
      {
        achievement_level: number;
        support_level: string;
        notes: string;
        evaluation_id?: string;
      }
    >
  >({});

  // Expand/collapse state for goal evaluations - Default expand all
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());

  // Initialize expanded goals when contents are loaded
  useEffect(() => {
    if (contents) {
      const allGoalIds = new Set<string>();
      contents.forEach((content) => {
        content.goals?.forEach((goal) => {
          allGoalIds.add(goal.id);
        });
      });
      setExpandedGoals(allGoalIds);
    }
  }, [contents]);

  // Behavior incident form
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentDesc, setIncidentDesc] = useState("");
  const [antecedent, setAntecedent] = useState("");
  const [consequence, setConsequence] = useState("");
  const [intervention, setIntervention] = useState("");
  const [selectedBehaviorId, setSelectedBehaviorId] = useState<string | null>(
    null
  );
  const [showBehaviorPicker, setShowBehaviorPicker] = useState(false);
  const [editingIncidentIndex, setEditingIncidentIndex] = useState<
    number | null
  >(null);
  const [behaviorSearchQuery, setBehaviorSearchQuery] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Local incidents state - only save to DB when completing session
  const [localIncidents, setLocalIncidents] = useState<
    Array<{
      behavior_library_id?: string;
      behavior_name?: string;
      behavior_description: string;
      antecedent?: string;
      consequence?: string;
      intervention_used?: string;
      occurred_at: string;
    }>
  >([]);

  // Helper to animate layout changes smoothly - DISABLED for performance
  const animateLayout = () => {
    // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const handleInputFocus = () => {
    // animateLayout();
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    // animateLayout();
    setIsInputFocused(false);
  };

  // Fetch behaviors from library

  // Fetch behaviors from library
  const { data: behaviors, isLoading: behaviorsLoading } = useBehaviors();

  // Filter behaviors based on search query
  const filteredBehaviors = useMemo(() => {
    if (!behaviors) return [];
    if (!behaviorSearchQuery.trim()) return behaviors;

    const query = behaviorSearchQuery.toLowerCase();
    return behaviors.filter(
      (b) =>
        b.name_vn.toLowerCase().includes(query) ||
        b.name_en?.toLowerCase().includes(query) ||
        b.manifestation_vn?.toLowerCase().includes(query)
    );
  }, [behaviors, behaviorSearchQuery]);

  // Load existing session log data
  useEffect(() => {
    if (sessionLog) {
      if (sessionLog.mood) setMood(sessionLog.mood);
      if (
        sessionLog.energy_level !== null &&
        sessionLog.energy_level !== undefined
      ) {
        setEnergyLevel(sessionLog.energy_level);
      }
      if (
        sessionLog.cooperation_level !== null &&
        sessionLog.cooperation_level !== undefined
      ) {
        setCooperationLevel(sessionLog.cooperation_level);
      }
      if (
        sessionLog.focus_level !== null &&
        sessionLog.focus_level !== undefined
      ) {
        setFocusLevel(sessionLog.focus_level);
      }
      if (
        sessionLog.independence_level !== null &&
        sessionLog.independence_level !== undefined
      ) {
        setIndependenceLevel(sessionLog.independence_level);
      }
      if (sessionLog.progress_notes)
        setProgressNotes(sessionLog.progress_notes);
      if (sessionLog.challenges_faced)
        setChallengesFaced(sessionLog.challenges_faced);
      if (sessionLog.recommendations)
        setRecommendations(sessionLog.recommendations);
      if (sessionLog.attitude_summary)
        setAttitudeSummary(sessionLog.attitude_summary);
      if (sessionLog.teacher_notes_text)
        setTeacherNotes(sessionLog.teacher_notes_text);
      if (
        sessionLog.overall_rating !== null &&
        sessionLog.overall_rating !== undefined
      ) {
        setOverallRating(sessionLog.overall_rating);
      }

      // Load behavior incidents
      const existingIncidents = (sessionLog as any).behavior_incidents || [];
      if (existingIncidents.length > 0) {
        const mappedIncidents = existingIncidents.map((incident: any) => ({
          behavior_library_id: incident.behavior_library_id || undefined,
          behavior_name: incident.behavior_library?.name_vn,
          behavior_description: incident.behavior_description,
          antecedent: incident.antecedent || undefined,
          consequence: incident.consequence || undefined,
          intervention_used: incident.intervention_used || undefined,
          occurred_at: incident.occurred_at,
        }));
        setLocalIncidents(mappedIncidents);
      }
    }
  }, [sessionLog]);

  // Initialize goal evaluations
  useEffect(() => {
    if (sessionLog && contents) {
      const initialEvaluations: typeof goalEvaluations = {};
      const existingEvaluations = (sessionLog as any).goal_evaluations || [];

      contents.forEach((content) => {
        content.goals?.forEach((goal) => {
          const existing = existingEvaluations.find(
            (ev: any) => ev.content_goal_id === goal.id
          );

          if (existing) {
            initialEvaluations[goal.id] = {
              achievement_level: existing.achievement_level || 50,
              support_level: existing.support_level || "moderate_prompt",
              notes: existing.notes || "",
              evaluation_id: existing.id,
            };
          } else {
            initialEvaluations[goal.id] = {
              achievement_level: 50,
              support_level: "moderate_prompt",
              notes: "",
            };
          }
        });
      });

      setGoalEvaluations(initialEvaluations);
    }
  }, [sessionLog, contents]);

  const handleSaveGoalEvaluations = async () => {
    if (!sessionLog?.id) return;

    const promises = Object.entries(goalEvaluations).map(
      async ([goalId, evaluation]) => {
        const status = getStatusFromAchievementLevel(
          evaluation.achievement_level
        );

        const evaluationData = {
          session_log_id: sessionLog.id,
          content_goal_id: goalId,
          status,
          achievement_level: evaluation.achievement_level,
          support_level: evaluation.support_level,
          notes: evaluation.notes || undefined,
        };

        if (evaluation.evaluation_id) {
          return updateGoalEvaluation.mutateAsync({
            id: evaluation.evaluation_id,
            data: evaluationData,
          });
        } else {
          return addGoalEvaluation.mutateAsync(evaluationData);
        }
      }
    );

    await Promise.all(promises);
  };

  const getStatusFromAchievementLevel = (level: number): string => {
    if (level >= 80) return "achieved";
    if (level >= 50) return "partially_achieved";
    if (level >= 1) return "not_achieved";
    return "not_applicable";
  };

  const updateGoalEvaluationLocal = (
    goalId: string,
    field: "achievement_level" | "support_level" | "notes",
    value: number | string
  ) => {
    setGoalEvaluations((prev) => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value,
      },
    }));
  };

  const toggleGoalExpand = (goalId: string) => {
    setExpandedGoals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  const handleDeleteGoalEvaluation = (goalId: string) => {
    if (session?.status === "completed") {
      Alert.alert(
        "Không thể chỉnh sửa",
        "Buổi học đã hoàn thành, không thể xóa đánh giá"
      );
      return;
    }

    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc muốn xóa đánh giá này? Dữ liệu sẽ được đặt về mặc định.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            setGoalEvaluations((prev) => {
              const newEvals = { ...prev };
              // Reset to default values instead of deleting
              newEvals[goalId] = {
                achievement_level: 50,
                support_level: "moderate_prompt",
                notes: "",
                evaluation_id: prev[goalId]?.evaluation_id,
              };
              return newEvals;
            });
            Alert.alert("Thành công", "Đã đặt lại đánh giá về mặc định");
          },
        },
      ]
    );
  };

  const handleAddIncident = async () => {
    if (!incidentDesc.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mô tả hành vi");
      return;
    }

    const selectedBehavior = behaviors?.find(
      (b) => b.id === selectedBehaviorId
    );

    const newIncident = {
      behavior_library_id: selectedBehaviorId || undefined,
      behavior_name: selectedBehavior?.name_vn,
      behavior_description: incidentDesc,
      antecedent: antecedent || undefined,
      consequence: consequence || undefined,
      intervention_used: intervention || undefined,
      occurred_at: getCurrentTimeString(),
    };

    if (editingIncidentIndex !== null) {
      // Update existing incident
      setLocalIncidents((prev) => {
        const updated = [...prev];
        updated[editingIncidentIndex] = newIncident;
        return updated;
      });
      Alert.alert("Thành công", "Đã cập nhật hành vi");
    } else {
      // Add new incident
      setLocalIncidents((prev) => [...prev, newIncident]);
      Alert.alert("Thành công", "Đã thêm hành vi vào danh sách");
    }

    // Reset form
    setIncidentDesc("");
    setAntecedent("");
    setConsequence("");
    setIntervention("");
    setSelectedBehaviorId(null);
    setEditingIncidentIndex(null);
    setShowIncidentModal(false);
  };

  const handleEditIncident = (index: number) => {
    const incident = localIncidents[index];
    setIncidentDesc(incident.behavior_description);
    setAntecedent(incident.antecedent || "");
    setConsequence(incident.consequence || "");
    setIntervention(incident.intervention_used || "");
    setSelectedBehaviorId(incident.behavior_library_id || null);
    setEditingIncidentIndex(index);
    setShowIncidentModal(true);
  };

  const handleDeleteIncident = (index: number) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc muốn xóa hành vi này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          setLocalIncidents((prev) => prev.filter((_, i) => i !== index));
          Alert.alert("Thành công", "Đã xóa hành vi");
        },
      },
    ]);
  };

  const handleCancelLog = () => {
    Alert.alert(
      "Hủy ghi nhận",
      "Bạn có chắc muốn hủy? Các thay đổi chưa lưu sẽ bị mất.",
      [
        { text: "Tiếp tục chỉnh sửa", style: "cancel" },
        {
          text: "Hủy bỏ",
          style: "destructive",
          onPress: () => {
            router.back();
          },
        },
      ]
    );
  };

  const handleCompleteSession = () => {
    const isCompleted = session?.status === "completed";
    const title = isCompleted ? "Lưu thay đổi" : "Hoàn thành buổi học";
    const message = isCompleted
      ? "Bạn có chắc muốn lưu các thay đổi?"
      : "Bạn có chắc muốn hoàn thành buổi học? Dữ liệu sẽ được lưu lại.";
    const buttonText = isCompleted ? "Lưu" : "Hoàn thành";

    Alert.alert(title, message, [
      { text: "Hủy", style: "cancel" },
      {
        text: buttonText,
        onPress: async () => {
          try {
            if (!user?.id) {
              Alert.alert("Lỗi", "Bạn cần đăng nhập để thực hiện thao tác này");
              return;
            }

            // If session log doesn't exist, create it first
            if (!sessionLog) {
              await startSession.mutateAsync({
                sessionId: id || "",
                createdBy: user.id,
              });
              // Wait a bit for the mutation to complete and refetch
              await new Promise((resolve) => setTimeout(resolve, 500));
            }

            // Update log with all the data
            await updateLog.mutateAsync({
              sessionId: id || "",
              data: {
                mood,
                energy_level: energyLevel,
                cooperation_level: cooperationLevel,
                focus_level: focusLevel,
                independence_level: independenceLevel,
                progress_notes: progressNotes,
                challenges_faced: challengesFaced,
                recommendations,
                attitude_summary: attitudeSummary,
                teacher_notes_text: teacherNotes,
                overall_rating: overallRating,
              },
            });

            // Refetch session log to get the ID BEFORE saving evaluations
            const { data: sessionLogForEvaluations, error: refreshError } =
              await supabase
                .from("session_logs")
                .select("id")
                .eq("session_id", id || "")
                .single();

            if (refreshError || !sessionLogForEvaluations?.id) {
              throw new Error("Failed to get session log ID");
            }

            // Save goal evaluations with refreshed session_log_id
            if (Object.keys(goalEvaluations).length > 0) {
              const evaluationPromises = Object.entries(goalEvaluations).map(
                async ([goalId, evaluation]) => {
                  const status = getStatusFromAchievementLevel(
                    evaluation.achievement_level
                  );

                  const evaluationData = {
                    session_log_id: sessionLogForEvaluations.id,
                    content_goal_id: goalId,
                    status,
                    achievement_level: evaluation.achievement_level,
                    support_level: evaluation.support_level,
                    notes: evaluation.notes || undefined,
                  };

                  try {
                    if (evaluation.evaluation_id) {
                      const result = await updateGoalEvaluation.mutateAsync({
                        id: evaluation.evaluation_id,
                        data: evaluationData,
                      });
                      return result;
                    } else {
                      const result = await addGoalEvaluation.mutateAsync(
                        evaluationData
                      );
                      return result;
                    }
                  } catch (error) {
                    throw error;
                  }
                }
              );

              await Promise.all(evaluationPromises);
            }

            // Save behavior incidents
            const { data: refreshedLog } = await supabase
              .from("session_logs")
              .select("id")
              .eq("session_id", id || "")
              .single();

            if (refreshedLog?.id) {
              // Delete all existing incidents first to avoid duplicates
              await supabase
                .from("behavior_incidents")
                .delete()
                .eq("session_log_id", refreshedLog.id);

              // Save all current incidents to database
              if (localIncidents.length > 0) {
                const incidentPromises = localIncidents.map((incident, index) =>
                  addIncident.mutateAsync({
                    session_log_id: refreshedLog.id,
                    behavior_library_id: incident.behavior_library_id,
                    occurred_at: incident.occurred_at,
                    incident_number: index + 1,
                    behavior_description: incident.behavior_description,
                    antecedent: incident.antecedent,
                    consequence: incident.consequence,
                    intervention_used: incident.intervention_used,
                    intensity_level: 3,
                    recorded_by: user.id,
                  })
                );
                await Promise.all(incidentPromises);
              }
            }

            // Complete the session only if not already completed
            if (!isCompleted) {
              await completeSession.mutateAsync(id || "");
            }

            const successMessage = isCompleted
              ? "Đã lưu thay đổi"
              : "Đã hoàn thành buổi học";

            Alert.alert("Thành công", successMessage, [
              { text: "OK", onPress: () => router.back() },
            ]);
          } catch (error) {
            Alert.alert(
              "Lỗi",
              error instanceof Error ? error.message : "Không thể hoàn thành"
            );
          }
        },
      },
    ]);
  };

  if (sessionLoading || logLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6750A4" />
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

  const isCompleted = session.status === "completed";

  // Memoize selected mood option
  const selectedMoodOption = useMemo(
    () => MOOD_OPTIONS.find((m) => m.value === mood),
    [mood]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Ghi nhận buổi học",
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            removeClippedSubviews={Platform.OS === "android"}
            showsVerticalScrollIndicator={true}
          >
            {/* Mood Section */}
            <Card style={styles.card} elevation={4}>
              <Card.Title
                title="Tâm trạng chung"
                titleStyle={styles.cardTitle}
                left={(props) => (
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: "#FFF3E0" },
                    ]}
                  >
                    <Icon
                      source="emoticon-happy-outline"
                      {...props}
                      color="#FF9800"
                      size={26}
                    />
                  </View>
                )}
                right={(props) => (
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>
                      {selectedMoodOption?.label || "Chưa chọn"}
                    </Text>
                  </View>
                )}
              />
              <Divider style={{ backgroundColor: "#F0F0F0" }} />
              <Card.Content
                style={{
                  paddingTop: 20,
                  paddingHorizontal: 20,
                  paddingBottom: 20,
                }}
              >
                <View style={styles.moodContainer}>
                  {MOOD_OPTIONS.map((option) => (
                    <Chip
                      key={option.value}
                      selected={mood === option.value}
                      onPress={() => setMood(option.value)}
                      icon={option.icon}
                      style={[
                        styles.moodChip,
                        mood === option.value && {
                          backgroundColor: option.color,
                          borderWidth: 0,
                        },
                      ]}
                      textStyle={[
                        styles.moodChipText,
                        mood === option.value && {
                          color: "#fff",
                          fontWeight: "700",
                        },
                      ]}
                      showSelectedCheck={false}
                      mode={mood === option.value ? "flat" : "outlined"}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </View>
              </Card.Content>
            </Card>

            {/* Metrics Section */}
            <Card style={styles.card} elevation={4}>
              <Card.Title
                title="Các chỉ số đánh giá"
                titleStyle={styles.cardTitle}
                subtitle="Đánh giá 5 yếu tố quan trọng"
                subtitleStyle={{ color: "#666", fontSize: 12, marginTop: 2 }}
                left={(props) => (
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: "#E8F5E9" },
                    ]}
                  >
                    <Icon
                      source="chart-line"
                      {...props}
                      color="#4CAF50"
                      size={26}
                    />
                  </View>
                )}
              />
              <Divider style={{ backgroundColor: "#F0F0F0" }} />
              <Card.Content
                style={{
                  paddingTop: 20,
                  paddingHorizontal: 20,
                  paddingBottom: 12,
                }}
              >
                {/* Energy Level */}
                <View style={styles.metricSection}>
                  <View style={styles.metricHeader}>
                    <View style={styles.metricLabelContainer}>
                      <Text style={styles.metricIcon}>⚡</Text>
                      <Text variant="titleMedium" style={styles.metricLabel}>
                        Năng lượng
                      </Text>
                    </View>
                    <Chip
                      mode="flat"
                      style={styles.metricChip}
                      textStyle={styles.metricChipText}
                    >
                      {energyLevel}/5
                    </Chip>
                  </View>
                  <View style={styles.levelButtons}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <LevelButton
                        key={level}
                        level={level}
                        currentLevel={energyLevel}
                        onPress={setEnergyLevel}
                      />
                    ))}
                  </View>
                </View>

                <Divider style={styles.metricDivider} />

                {/* Cooperation Level */}
                <View style={styles.metricSection}>
                  <View style={styles.metricHeader}>
                    <View style={styles.metricLabelContainer}>
                      <Text style={styles.metricIcon}>🤝</Text>
                      <Text variant="titleMedium" style={styles.metricLabel}>
                        Hợp tác
                      </Text>
                    </View>
                    <Chip
                      mode="flat"
                      style={styles.metricChip}
                      textStyle={styles.metricChipText}
                    >
                      {cooperationLevel}/5
                    </Chip>
                  </View>
                  <View style={styles.levelButtons}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <LevelButton
                        key={level}
                        level={level}
                        currentLevel={cooperationLevel}
                        onPress={setCooperationLevel}
                      />
                    ))}
                  </View>
                </View>

                <Divider style={styles.metricDivider} />

                {/* Focus Level */}
                <View style={styles.metricSection}>
                  <View style={styles.metricHeader}>
                    <View style={styles.metricLabelContainer}>
                      <Text style={styles.metricIcon}>🎯</Text>
                      <Text variant="titleMedium" style={styles.metricLabel}>
                        Tập trung
                      </Text>
                    </View>
                    <Chip
                      mode="flat"
                      style={styles.metricChip}
                      textStyle={styles.metricChipText}
                    >
                      {focusLevel}/5
                    </Chip>
                  </View>
                  <View style={styles.levelButtons}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <LevelButton
                        key={level}
                        level={level}
                        currentLevel={focusLevel}
                        onPress={setFocusLevel}
                      />
                    ))}
                  </View>
                </View>

                <Divider style={styles.metricDivider} />

                {/* Independence Level */}
                <View style={styles.metricSection}>
                  <View style={styles.metricHeader}>
                    <View style={styles.metricLabelContainer}>
                      <Text style={styles.metricIcon}>🌟</Text>
                      <Text variant="titleMedium" style={styles.metricLabel}>
                        Tự lập
                      </Text>
                    </View>
                    <Chip
                      mode="flat"
                      style={styles.metricChip}
                      textStyle={styles.metricChipText}
                    >
                      {independenceLevel}/5
                    </Chip>
                  </View>
                  <View style={styles.levelButtons}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <LevelButton
                        key={level}
                        level={level}
                        currentLevel={independenceLevel}
                        onPress={setIndependenceLevel}
                      />
                    ))}
                  </View>
                </View>

                <Divider style={styles.metricDivider} />

                {/* Overall Rating */}
                <View style={styles.metricSection}>
                  <View style={styles.metricHeader}>
                    <View style={styles.metricLabelContainer}>
                      <Text style={styles.metricIcon}>⭐</Text>
                      <Text variant="titleMedium" style={styles.metricLabel}>
                        Đánh giá chung
                      </Text>
                    </View>
                    <Chip
                      mode="flat"
                      style={styles.metricChip}
                      textStyle={styles.metricChipText}
                    >
                      {overallRating}/5
                    </Chip>
                  </View>
                  <View style={styles.levelButtons}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <LevelButton
                        key={level}
                        level={level}
                        currentLevel={overallRating}
                        onPress={setOverallRating}
                        isStar
                        activeColor="#FFB300"
                      />
                    ))}
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Goal Evaluations */}
            {contents && contents.length > 0 && (
              <Card style={styles.card}>
                <Card.Title
                  title="Đánh giá mục tiêu"
                  left={(props) => <Icon source="target" {...props} />}
                />
                <Card.Content>
                  {contents.map((content, contentIndex) => (
                    <View key={content.id} style={styles.contentEvaluation}>
                      {contentIndex > 0 && (
                        <Divider style={{ marginBottom: 16 }} />
                      )}
                      <Text
                        variant="titleMedium"
                        style={{ fontWeight: "600", marginBottom: 12 }}
                      >
                        {contentIndex + 1}. {content.title}
                      </Text>
                      {content.goals && content.goals.length > 0 ? (
                        content.goals.map((goal, goalIndex) => {
                          const isExpanded = expandedGoals.has(goal.id);
                          const evaluation = goalEvaluations[goal.id];
                          const isCompleted = session?.status === "completed";

                          return (
                            <View key={goal.id} style={styles.goalEvaluation}>
                              {/* Goal Header - Always Visible */}
                              <View style={styles.goalHeader}>
                                <View style={{ flex: 1 }}>
                                  <Text
                                    variant="bodyMedium"
                                    style={styles.goalDescription}
                                  >
                                    {String.fromCharCode(97 + goalIndex)}.{" "}
                                    {goal.description}
                                  </Text>
                                </View>
                                <View style={{ flexDirection: "row", gap: 4 }}>
                                  {!isCompleted && isExpanded && (
                                    <>
                                      <IconButton
                                        icon="delete-outline"
                                        size={20}
                                        iconColor="#F44336"
                                        onPress={() =>
                                          handleDeleteGoalEvaluation(goal.id)
                                        }
                                        style={{ margin: 0 }}
                                      />
                                    </>
                                  )}
                                  <IconButton
                                    icon={
                                      isExpanded ? "chevron-up" : "chevron-down"
                                    }
                                    size={20}
                                    iconColor="#666"
                                    onPress={() => toggleGoalExpand(goal.id)}
                                    style={{ margin: 0 }}
                                  />
                                </View>
                                {goal.is_primary && (
                                  <Chip
                                    compact
                                    mode="flat"
                                    style={{
                                      backgroundColor: "#6750A4",
                                      marginLeft: 8,
                                    }}
                                    textStyle={{ color: "#fff", fontSize: 10 }}
                                  >
                                    Chính
                                  </Chip>
                                )}
                              </View>

                              {/* Expanded Content */}
                              {isExpanded && (
                                <>
                                  {/* Achievement Level Slider */}
                                  <View style={styles.sliderContainer}>
                                    <View style={styles.sliderHeader}>
                                      <Text
                                        variant="labelMedium"
                                        style={{ color: "#666" }}
                                      >
                                        Mức độ đạt được
                                      </Text>
                                      <Text
                                        variant="titleMedium"
                                        style={{
                                          color: "#6750A4",
                                          fontWeight: "700",
                                        }}
                                      >
                                        {Math.round(
                                          goalEvaluations[goal.id]
                                            ?.achievement_level || 50
                                        )}
                                        %
                                      </Text>
                                    </View>
                                    <Slider
                                      style={styles.slider}
                                      minimumValue={0}
                                      maximumValue={100}
                                      step={5}
                                      value={
                                        goalEvaluations[goal.id]
                                          ?.achievement_level || 50
                                      }
                                      onValueChange={(value: number) =>
                                        updateGoalEvaluationLocal(
                                          goal.id,
                                          "achievement_level",
                                          value
                                        )
                                      }
                                      minimumTrackTintColor="#6750A4"
                                      maximumTrackTintColor="#E0E0E0"
                                      thumbTintColor="#6750A4"
                                      disabled={isCompleted}
                                    />
                                    <View style={styles.sliderLabels}>
                                      <Text
                                        variant="bodySmall"
                                        style={{ color: "#999" }}
                                      >
                                        0%
                                      </Text>
                                      <Text
                                        variant="bodySmall"
                                        style={{ color: "#999" }}
                                      >
                                        50%
                                      </Text>
                                      <Text
                                        variant="bodySmall"
                                        style={{ color: "#999" }}
                                      >
                                        100%
                                      </Text>
                                    </View>
                                  </View>

                                  {/* Support Level */}
                                  <View style={{ marginTop: 12 }}>
                                    <Text
                                      variant="labelMedium"
                                      style={{ color: "#666", marginBottom: 8 }}
                                    >
                                      Mức độ hỗ trợ cần thiết
                                    </Text>
                                    <View style={styles.supportButtons}>
                                      {SUPPORT_LEVELS.map((option) => (
                                        <Chip
                                          key={option.value}
                                          selected={
                                            goalEvaluations[goal.id]
                                              ?.support_level === option.value
                                          }
                                          onPress={() =>
                                            !isCompleted &&
                                            updateGoalEvaluationLocal(
                                              goal.id,
                                              "support_level",
                                              option.value
                                            )
                                          }
                                          style={[
                                            styles.supportChip,
                                            goalEvaluations[goal.id]
                                              ?.support_level ===
                                              option.value && {
                                              backgroundColor: option.color,
                                            },
                                          ]}
                                          textStyle={[
                                            styles.supportChipText,
                                            goalEvaluations[goal.id]
                                              ?.support_level ===
                                              option.value && {
                                              color: "#fff",
                                              fontWeight: "600",
                                            },
                                          ]}
                                          showSelectedCheck={false}
                                          disabled={isCompleted}
                                        >
                                          {option.label}
                                        </Chip>
                                      ))}
                                    </View>
                                  </View>

                                  {/* Goal Notes */}
                                  <TextInput
                                    mode="outlined"
                                    multiline
                                    numberOfLines={2}
                                    placeholder="Ghi chú cho mục tiêu này..."
                                    value={
                                      goalEvaluations[goal.id]?.notes || ""
                                    }
                                    onChangeText={(text) =>
                                      updateGoalEvaluationLocal(
                                        goal.id,
                                        "notes",
                                        text
                                      )
                                    }
                                    style={{ marginTop: 12 }}
                                    outlineColor="#E0E0E0"
                                    activeOutlineColor="#6750A4"
                                    disabled={isCompleted}
                                    editable={!isCompleted}
                                    returnKeyType="done"
                                    blurOnSubmit={true}
                                  />
                                </>
                              )}
                            </View>
                          );
                        })
                      ) : (
                        <Text style={{ color: "#999", fontStyle: "italic" }}>
                          Nội dung này chưa có mục tiêu
                        </Text>
                      )}
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}

            {/* Notes Section */}
            <Card style={styles.card}>
              <Card.Title
                title="Ghi chú chi tiết"
                left={(props) => <Icon source="note-text" {...props} />}
              />
              <Card.Content>
                <TextInput
                  mode="outlined"
                  label="Tiến trình"
                  multiline
                  numberOfLines={3}
                  value={progressNotes}
                  onChangeText={setProgressNotes}
                  placeholder="Ghi nhận tiến trình của học sinh..."
                  style={{ marginBottom: 12 }}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#6750A4"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                <TextInput
                  mode="outlined"
                  label="Thách thức gặp phải"
                  multiline
                  numberOfLines={3}
                  value={challengesFaced}
                  onChangeText={setChallengesFaced}
                  placeholder="Những khó khăn, thách thức..."
                  style={{ marginBottom: 12 }}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#6750A4"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                <TextInput
                  mode="outlined"
                  label="Đề xuất"
                  multiline
                  numberOfLines={3}
                  value={recommendations}
                  onChangeText={setRecommendations}
                  placeholder="Đề xuất cho buổi học tiếp theo..."
                  style={{ marginBottom: 12 }}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#6750A4"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                <TextInput
                  mode="outlined"
                  label="Thái độ tổng quan"
                  multiline
                  numberOfLines={3}
                  value={attitudeSummary}
                  onChangeText={setAttitudeSummary}
                  placeholder="Đánh giá thái độ học tập..."
                  style={{ marginBottom: 12 }}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#6750A4"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                <TextInput
                  mode="outlined"
                  label="Ghi chú giáo viên"
                  multiline
                  numberOfLines={3}
                  value={teacherNotes}
                  onChangeText={setTeacherNotes}
                  placeholder="Ghi chú khác từ giáo viên..."
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#6750A4"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </Card.Content>
            </Card>

            {/* Behavior Incidents List */}
            {localIncidents.length > 0 && (
              <Card style={styles.card} elevation={4}>
                <Card.Title
                  title="Hành vi đã ghi nhận"
                  titleStyle={styles.cardTitle}
                  subtitle={`Đã ghi nhận ${localIncidents.length} hành vi trong buổi học này`}
                  subtitleStyle={{
                    color: "#FF6F00",
                    fontSize: 12,
                    marginTop: 2,
                    fontWeight: "600",
                  }}
                  left={(props) => (
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: "#FFF3E0" },
                      ]}
                    >
                      <Icon
                        source="alert-circle"
                        {...props}
                        color="#FF9800"
                        size={26}
                      />
                    </View>
                  )}
                  right={(props) => (
                    <View
                      style={[styles.cardBadge, { backgroundColor: "#FFE0B2" }]}
                    >
                      <Icon source="alert-decagram" size={16} color="#FF6F00" />
                      <Text
                        style={[
                          styles.cardBadgeText,
                          { color: "#FF6F00", marginLeft: 4 },
                        ]}
                      >
                        {localIncidents.length}
                      </Text>
                    </View>
                  )}
                />
                <Divider style={{ backgroundColor: "#F0F0F0" }} />
                <Card.Content
                  style={{
                    paddingTop: 20,
                    paddingHorizontal: 16,
                    paddingBottom: 16,
                  }}
                >
                  {localIncidents.map((incident, index) => (
                    <IncidentCard
                      key={index}
                      incident={incident}
                      index={index}
                      onEdit={handleEditIncident}
                      onDelete={handleDeleteIncident}
                    />
                  ))}
                </Card.Content>
              </Card>
            )}

            {/* Bottom Spacing */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={handleCancelLog}
              loading={updateLog.isPending || completeSession.isPending}
              disabled={updateLog.isPending || completeSession.isPending}
              icon="cancel"
              style={{ flex: 1, backgroundColor: "#76747aff" }}
            >
              Hủy
            </Button>
            <Button
              mode="outlined"
              onPress={() => setShowIncidentModal(true)}
              icon="alert-circle"
              style={{ flex: 1, borderColor: "#FF9800" }}
              textColor="#FF9800"
              disabled={updateLog.isPending || completeSession.isPending}
            >
              Hành vi
            </Button>

            <Button
              mode="contained"
              onPress={handleCompleteSession}
              loading={completeSession.isPending}
              disabled={completeSession.isPending || updateLog.isPending}
              icon={isCompleted ? "content-save" : "check-circle"}
              style={{
                flex: 1,
                backgroundColor: isCompleted ? "#6750A4" : "#4CAF50",
              }}
            >
              {isCompleted ? "Lưu" : "Hoàn thành"}
            </Button>
          </View>

          {/* Behavior Incident Modal */}
          <Portal>
            <Modal
              visible={showIncidentModal}
              onDismiss={() => {
                setShowIncidentModal(false);
                setIncidentDesc("");
                setAntecedent("");
                setConsequence("");
                setIntervention("");
                setSelectedBehaviorId(null);
                setEditingIncidentIndex(null);
              }}
              contentContainerStyle={styles.modal}
            >
              <Text
                variant="headlineSmall"
                style={{ marginBottom: 16, fontWeight: "600" }}
              >
                {editingIncidentIndex !== null
                  ? "Sửa hành vi"
                  : "Ghi nhận hành vi"}
              </Text>

              {/* Behavior Selector - Outside ScrollView */}
              <View style={{ marginBottom: 12 }}>
                <Text
                  variant="labelMedium"
                  style={{ marginBottom: 8, color: "#666" }}
                >
                  Hành vi
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowBehaviorPicker(true)}
                  icon="chevron-down"
                  contentStyle={{ justifyContent: "space-between" }}
                  style={{ marginBottom: 8 }}
                >
                  {selectedBehaviorId
                    ? behaviors?.find((b) => b.id === selectedBehaviorId)
                        ?.name_vn || "Chọn hành vi"
                    : incidentDesc
                    ? "Không có trong thư viện"
                    : "Chọn hành vi từ thư viện"}
                </Button>
                {selectedBehaviorId && (
                  <Chip
                    icon="book-open-variant"
                    mode="flat"
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor: "#E8DEF8",
                    }}
                    textStyle={{ color: "#6750A4", fontSize: 12 }}
                  >
                    Từ thư viện
                  </Chip>
                )}
                {!selectedBehaviorId && incidentDesc && (
                  <Chip
                    icon="pencil"
                    mode="flat"
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor: "#F5F5F5",
                    }}
                    textStyle={{ color: "#666", fontSize: 12 }}
                  >
                    Tự nhập
                  </Chip>
                )}
              </View>

              <ScrollView
                ref={scrollViewRef}
                style={{ height: 350 }}
                contentContainerStyle={{ paddingBottom: 150 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                <TextInput
                  mode="outlined"
                  label="Mô tả hành vi *"
                  multiline
                  numberOfLines={3}
                  value={incidentDesc}
                  onChangeText={setIncidentDesc}
                  placeholder="Mô tả chi tiết hành vi quan sát được..."
                  style={{ marginBottom: 12 }}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#6750A4"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onBlur={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                    }, 100);
                  }}
                />
                <TextInput
                  mode="outlined"
                  label="Nguyên nhân (Antecedent)"
                  multiline
                  numberOfLines={2}
                  value={antecedent}
                  onChangeText={setAntecedent}
                  placeholder="Điều gì xảy ra trước hành vi?"
                  style={{ marginBottom: 12 }}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#6750A4"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({
                        y: 50,
                        animated: true,
                      });
                    }, 300);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                    }, 100);
                  }}
                />
                <TextInput
                  mode="outlined"
                  label="Hậu quả (Consequence)"
                  multiline
                  numberOfLines={2}
                  value={consequence}
                  onChangeText={setConsequence}
                  placeholder="Điều gì xảy ra sau hành vi?"
                  style={{ marginBottom: 12 }}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#6750A4"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({
                        y: 120,
                        animated: true,
                      });
                    }, 300);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                    }, 100);
                  }}
                />
                <TextInput
                  mode="outlined"
                  label="Can thiệp (Intervention)"
                  multiline
                  numberOfLines={2}
                  value={intervention}
                  onChangeText={setIntervention}
                  placeholder="Cách xử lý/can thiệp đã áp dụng..."
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#6750A4"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 300);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                    }, 100);
                  }}
                />
              </ScrollView>

              <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowIncidentModal(false);
                    setIncidentDesc("");
                    setAntecedent("");
                    setConsequence("");
                    setIntervention("");
                    setSelectedBehaviorId(null);
                    setEditingIncidentIndex(null);
                  }}
                  style={{ flex: 1 }}
                >
                  Hủy
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddIncident}
                  disabled={!incidentDesc.trim()}
                  style={{ flex: 1, backgroundColor: "#6750A4" }}
                >
                  {editingIncidentIndex !== null ? "Cập nhật" : "Thêm"}
                </Button>
              </View>
            </Modal>

            {/* Behavior Picker Modal */}
            <Modal
              visible={showBehaviorPicker}
              onDismiss={() => {
                setShowBehaviorPicker(false);
                setBehaviorSearchQuery("");
              }}
              contentContainerStyle={styles.modal}
            >
              <Text
                variant="headlineSmall"
                style={{ marginBottom: 16, fontWeight: "600" }}
              >
                Chọn hành vi
              </Text>

              {/* Search Bar */}
              <Searchbar
                placeholder="Tìm kiếm hành vi..."
                onChangeText={setBehaviorSearchQuery}
                value={behaviorSearchQuery}
                style={{ marginBottom: 12 }}
                elevation={1}
              />

              <ScrollView style={{ height: 400 }} nestedScrollEnabled={true}>
                {behaviorsLoading ? (
                  <View style={{ padding: 32, alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#6750A4" />
                    <Text style={{ marginTop: 12, color: "#666" }}>
                      Đang tải...
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* Option: Không có trong thư viện */}
                    <List.Item
                      title="Không có trong thư viện"
                      description="Nhập mô tả hành vi tự do"
                      left={(props) => (
                        <List.Icon {...props} icon="pencil" color="#666" />
                      )}
                      right={(props) =>
                        selectedBehaviorId === null && incidentDesc ? (
                          <List.Icon
                            {...props}
                            icon="check-circle"
                            color="#6750A4"
                          />
                        ) : null
                      }
                      onPress={() => {
                        setSelectedBehaviorId(null);
                        setIncidentDesc("");
                        setShowBehaviorPicker(false);
                        setBehaviorSearchQuery("");
                      }}
                      style={{
                        backgroundColor:
                          selectedBehaviorId === null && incidentDesc
                            ? "#E8DEF8"
                            : "#F5F5F5",
                        marginBottom: 8,
                        borderRadius: 8,
                      }}
                    />

                    <Divider style={{ marginVertical: 8 }} />

                    {/* Behavior List */}
                    {filteredBehaviors && filteredBehaviors.length > 0 ? (
                      filteredBehaviors.map((behavior) => (
                        <List.Item
                          key={behavior.id}
                          title={behavior.name_vn}
                          description={
                            behavior.manifestation_vn?.substring(0, 80) + "..."
                          }
                          left={(props) => (
                            <List.Icon
                              {...props}
                              icon={behavior.icon || "alert-circle"}
                            />
                          )}
                          right={(props) =>
                            selectedBehaviorId === behavior.id ? (
                              <List.Icon
                                {...props}
                                icon="check-circle"
                                color="#6750A4"
                              />
                            ) : null
                          }
                          onPress={() => {
                            setSelectedBehaviorId(behavior.id);
                            setIncidentDesc(behavior.name_vn);
                            setShowBehaviorPicker(false);
                            setBehaviorSearchQuery("");
                          }}
                          style={{
                            backgroundColor:
                              selectedBehaviorId === behavior.id
                                ? "#E8DEF8"
                                : "transparent",
                          }}
                        />
                      ))
                    ) : behaviorSearchQuery ? (
                      <View style={{ padding: 32, alignItems: "center" }}>
                        <Icon source="magnify-close" size={48} color="#ccc" />
                        <Text
                          style={{
                            marginTop: 12,
                            color: "#999",
                            textAlign: "center",
                          }}
                        >
                          Không tìm thấy hành vi "{behaviorSearchQuery}"
                        </Text>
                        <Text
                          style={{
                            marginTop: 8,
                            color: "#666",
                            textAlign: "center",
                            fontSize: 12,
                          }}
                        >
                          💡 Bạn có thể chọn "Không có trong thư viện" ở trên
                        </Text>
                      </View>
                    ) : (
                      <View style={{ padding: 32, alignItems: "center" }}>
                        <Icon
                          source="alert-circle-outline"
                          size={48}
                          color="#ccc"
                        />
                        <Text style={{ marginTop: 12, color: "#999" }}>
                          Không có dữ liệu hành vi
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </ScrollView>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowBehaviorPicker(false);
                  setBehaviorSearchQuery("");
                }}
                style={{ marginTop: 16 }}
              >
                Đóng
              </Button>
            </Modal>
          </Portal>
        </View>
      </KeyboardAvoidingView>
    </>
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
    backgroundColor: "#f5f5f5",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#f5f5f5",
  },
  startCard: {
    margin: 16,
    elevation: 3,
  },
  card: {
    margin: 12,
    marginBottom: 8,
    elevation: 2,
    borderRadius: 16,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: 0.15,
  },
  cardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8DEF8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  cardBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6750A4",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3EDF7",
    justifyContent: "center",
    alignItems: "center",
  },
  moodContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  moodChip: {
    marginBottom: 4,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    paddingHorizontal: 4,
  },
  moodChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  metricSection: {
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    marginHorizontal: -4,
  },
  metricDivider: {
    marginVertical: 16,
    backgroundColor: "#E0E0E0",
    height: 1,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  metricLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metricIcon: {
    fontSize: 26,
  },
  metricLabel: {
    fontWeight: "700",
    color: "#1a1a1a",
    fontSize: 16,
  },
  metricChip: {
    backgroundColor: "#6750A4",
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metricChipText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 20,
  },
  levelButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 4,
    gap: 8,
  },
  levelButtonWrapper: {
    flex: 1,
    alignItems: "center",
  },
  levelButton: {
    margin: 0,
  },
  levelButtonActive: {
    backgroundColor: "#E8DEF8",
  },
  levelButtonActiveStar: {
    backgroundColor: "#FFF8E1",
  },
  contentEvaluation: {
    marginBottom: 16,
  },
  goalEvaluation: {
    marginBottom: 20,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#E8DEF8",
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  goalDescription: {
    flex: 1,
    marginRight: 8,
    color: "#333",
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  supportButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  supportChip: {
    marginBottom: 4,
  },
  supportChipText: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    elevation: 4,
  },
  incidentCard: {
    marginBottom: 16,
    backgroundColor: "#FFFBF5",
    borderRadius: 16,
    borderLeftWidth: 5,
    borderLeftColor: "#FF9800",
    overflow: "hidden",
  },
  incidentCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  incidentHeaderTags: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  incidentNumberChip: {
    backgroundColor: "#FF9800",
    minHeight: 28,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  incidentNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  incidentLibraryChip: {
    backgroundColor: "#E8DEF8",
    minHeight: 28,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  incidentLibraryText: {
    color: "#6750A4",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16,
  },
  incidentDescription: {
    fontWeight: "700",
    marginBottom: 8,
    color: "#1a1a1a",
    lineHeight: 24,
    fontSize: 16,
  },
  incidentTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  incidentTime: {
    color: "#666",
    fontSize: 13,
    fontWeight: "600",
  },
  incidentDetailsContainer: {
    marginTop: 12,
    gap: 12,
  },
  incidentDetail: {
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#FFB74D",
  },
  incidentDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  incidentDetailLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#444",
  },
  incidentDetailText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    paddingLeft: 24,
  },
  incidentActions: {
    flexDirection: "column",
    gap: 8,
    marginLeft: 12,
  },
  incidentActionButton: {
    margin: 0,
    borderRadius: 12,
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
});
