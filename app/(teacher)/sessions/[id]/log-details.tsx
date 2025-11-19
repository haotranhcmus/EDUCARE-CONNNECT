import {
  useSession,
  useSessionContents,
  useSessionLog,
} from "@/src/hooks/useSessions";
import { useAuthStore } from "@/src/stores/authStore";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  Icon,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// Mood options
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

export default function SessionLogDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuthStore();
  const { data: session, isLoading: sessionLoading } = useSession(id || "");
  const { data: sessionLog, isLoading: logLoading } = useSessionLog(id || "");
  const { data: contents, isLoading: contentsLoading } = useSessionContents(
    id || ""
  );

  const getMoodOption = (value: string) => {
    return MOOD_OPTIONS.find((m) => m.value === value) || MOOD_OPTIONS[2];
  };

  const getSupportLevelOption = (value: string) => {
    return SUPPORT_LEVELS.find((s) => s.value === value) || SUPPORT_LEVELS[2];
  };

  if (sessionLoading || logLoading || contentsLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={["top", "bottom"]}>
        <ActivityIndicator size="large" color="#6750A4" />
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.emptyContainer} edges={["top", "bottom"]}>
        <Icon source="alert-circle-outline" size={64} color="#ccc" />
        <Text variant="headlineSmall" style={{ marginTop: 16, color: "#666" }}>
          Không tìm thấy buổi học
        </Text>
      </SafeAreaView>
    );
  }

  if (!sessionLog) {
    return (
      <SafeAreaView style={styles.emptyContainer} edges={["top", "bottom"]}>
        <Icon source="clipboard-text-outline" size={64} color="#ccc" />
        <Text variant="headlineSmall" style={{ marginTop: 16, color: "#666" }}>
          Chưa có ghi nhận cho buổi học này
        </Text>
        <Button
          mode="contained"
          style={{ marginTop: 24 }}
          onPress={() => router.back()}
        >
          Quay lại
        </Button>
      </SafeAreaView>
    );
  }

  const moodOption = getMoodOption(sessionLog.mood || "normal");
  const goalEvaluations = (sessionLog as any).goal_evaluations || [];
  const behaviorIncidents = (sessionLog as any).behavior_incidents || [];

  return (
    <>
      <Stack.Screen
        options={{
          title: "Chi tiết ghi nhận",
          headerRight: () => (
            <Button
              mode="text"
              onPress={() => router.push(`/sessions/${id}/log`)}
              icon="pencil"
            >
              Sửa
            </Button>
          ),
        }}
      />
      <View style={styles.safeArea}>
        <ScrollView style={styles.container}>
          {/* Session Info Header */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.infoRow}>
                <Icon source="account" size={20} color="#666" />
                <Text variant="bodyMedium" style={{ marginLeft: 8, flex: 1 }}>
                  {session.student?.last_name} {session.student?.first_name}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon source="calendar" size={20} color="#666" />
                <Text variant="bodyMedium" style={{ marginLeft: 8, flex: 1 }}>
                  {format(new Date(session.session_date), "dd/MM/yyyy", {
                    locale: vi,
                  })}{" "}
                  • {session.start_time} - {session.end_time}
                </Text>
              </View>
              {session.status === "completed" && (
                <Chip
                  icon="check-circle"
                  mode="flat"
                  style={{
                    backgroundColor: "#E8F5E9",
                    marginTop: 8,
                    alignSelf: "flex-start",
                  }}
                  textStyle={{ color: "#2E7D32" }}
                >
                  Đã hoàn thành
                </Chip>
              )}
            </Card.Content>
          </Card>

          {/* Mood & Energy */}
          <Card style={styles.card}>
            <Card.Title
              title="Tâm trạng & Năng lượng"
              left={(props) => <Icon source="emoticon" {...props} />}
            />
            <Card.Content>
              <View style={styles.readOnlyRow}>
                <Text variant="labelMedium" style={{ color: "#666" }}>
                  Tâm trạng:
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Icon
                    source={moodOption.icon}
                    size={20}
                    color={moodOption.color}
                  />
                  <Text
                    variant="bodyMedium"
                    style={{ marginLeft: 4, color: moodOption.color }}
                  >
                    {moodOption.label}
                  </Text>
                </View>
              </View>

              <Divider style={{ marginVertical: 12 }} />

              <View style={styles.levelRow}>
                <Text variant="labelMedium" style={{ color: "#666", flex: 1 }}>
                  Năng lượng
                </Text>
                <Text variant="titleMedium" style={{ color: "#6750A4" }}>
                  {sessionLog.energy_level}/5
                </Text>
              </View>

              <View style={styles.levelRow}>
                <Text variant="labelMedium" style={{ color: "#666", flex: 1 }}>
                  Hợp tác
                </Text>
                <Text variant="titleMedium" style={{ color: "#6750A4" }}>
                  {sessionLog.cooperation_level}/5
                </Text>
              </View>

              <View style={styles.levelRow}>
                <Text variant="labelMedium" style={{ color: "#666", flex: 1 }}>
                  Tập trung
                </Text>
                <Text variant="titleMedium" style={{ color: "#6750A4" }}>
                  {sessionLog.focus_level}/5
                </Text>
              </View>

              <View style={styles.levelRow}>
                <Text variant="labelMedium" style={{ color: "#666", flex: 1 }}>
                  Độc lập
                </Text>
                <Text variant="titleMedium" style={{ color: "#6750A4" }}>
                  {sessionLog.independence_level}/5
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Overall Rating */}
          <Card style={styles.card}>
            <Card.Title
              title="Đánh giá chung"
              left={(props) => <Icon source="star" {...props} />}
            />
            <Card.Content>
              <View style={styles.ratingContainer}>
                <Text variant="displaySmall" style={{ color: "#6750A4" }}>
                  {sessionLog.overall_rating}
                </Text>
                <Text variant="bodyLarge" style={{ color: "#666" }}>
                  /5
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Session Contents & Goal Evaluations */}
          {contents && contents.length > 0 && (
            <Card style={styles.card} elevation={3}>
              <Card.Title
                title="Nội dung & Đánh giá buổi học"
                titleStyle={{ fontSize: 18, fontWeight: "700" }}
                subtitle={`${contents.length} hoạt động - ${goalEvaluations.length} mục tiêu đã đánh giá`}
                subtitleStyle={{ color: "#666", fontSize: 13 }}
                left={(props) => (
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: "#E8F5E9" },
                    ]}
                  >
                    <Icon
                      source="clipboard-list"
                      {...props}
                      color="#4CAF50"
                      size={24}
                    />
                  </View>
                )}
              />
              <Divider style={{ backgroundColor: "#F0F0F0" }} />
              <Card.Content style={{ paddingTop: 16 }}>
                {contents.map((content, contentIndex) => {
                  const contentGoals = goalEvaluations.filter((ev: any) =>
                    content.goals?.some((g: any) => g.id === ev.content_goal_id)
                  );

                  return (
                    <View key={content.id} style={styles.contentEvaluation}>
                      {contentIndex > 0 && (
                        <Divider
                          style={{
                            marginVertical: 20,
                            backgroundColor: "#E0E0E0",
                            height: 2,
                          }}
                        />
                      )}

                      {/* Content Title & Info */}
                      <View style={styles.contentHeaderCard}>
                        <View style={styles.contentTitleRow}>
                          <Icon
                            source="book-open-variant"
                            size={24}
                            color="#6750A4"
                          />
                          <Text
                            variant="titleLarge"
                            style={{
                              fontWeight: "700",
                              marginLeft: 8,
                              flex: 1,
                              color: "#1a1a1a",
                            }}
                          >
                            {contentIndex + 1}. {content.title}
                          </Text>
                        </View>

                        {/* Domain Badge */}
                        <View style={{ marginTop: 8, marginLeft: 32 }}>
                          <Chip
                            compact
                            mode="flat"
                            icon="label"
                            style={{
                              backgroundColor: "#E8DEF8",
                              alignSelf: "flex-start",
                            }}
                            textStyle={{
                              color: "#6750A4",
                              fontSize: 12,
                              fontWeight: "600",
                            }}
                          >
                            {content.domain}
                          </Chip>
                        </View>

                        {/* Content Description */}
                        {content.description && (
                          <View style={styles.contentInfoSection}>
                            <View style={styles.infoLabelRow}>
                              <Icon
                                source="text-box-outline"
                                size={18}
                                color="#666"
                              />
                              <Text
                                variant="labelMedium"
                                style={{
                                  marginLeft: 6,
                                  color: "#666",
                                  fontWeight: "700",
                                }}
                              >
                                Mô tả
                              </Text>
                            </View>
                            <Text
                              variant="bodyMedium"
                              style={{
                                color: "#333",
                                lineHeight: 20,
                                marginTop: 4,
                              }}
                            >
                              {content.description}
                            </Text>
                          </View>
                        )}

                        {/* Materials Needed */}
                        {content.materials_needed && (
                          <View style={styles.contentInfoSection}>
                            <View style={styles.infoLabelRow}>
                              <Icon
                                source="package-variant"
                                size={18}
                                color="#FF9800"
                              />
                              <Text
                                variant="labelMedium"
                                style={{
                                  marginLeft: 6,
                                  color: "#FF9800",
                                  fontWeight: "700",
                                }}
                              >
                                Vật liệu cần thiết
                              </Text>
                            </View>
                            <Text
                              variant="bodyMedium"
                              style={{
                                color: "#333",
                                lineHeight: 20,
                                marginTop: 4,
                              }}
                            >
                              {content.materials_needed}
                            </Text>
                          </View>
                        )}

                        {/* Duration */}
                        {content.estimated_duration && (
                          <View style={{ marginTop: 8, marginLeft: 32 }}>
                            <Chip
                              compact
                              mode="outlined"
                              icon="clock-outline"
                              style={{ alignSelf: "flex-start" }}
                              textStyle={{ fontSize: 12, color: "#666" }}
                            >
                              {content.estimated_duration} phút
                            </Chip>
                          </View>
                        )}

                        {/* Instructions */}
                        {content.instructions && (
                          <View style={styles.contentInfoSection}>
                            <View style={styles.infoLabelRow}>
                              <Icon
                                source="format-list-numbered"
                                size={18}
                                color="#2196F3"
                              />
                              <Text
                                variant="labelMedium"
                                style={{
                                  marginLeft: 6,
                                  color: "#2196F3",
                                  fontWeight: "700",
                                }}
                              >
                                Hướng dẫn thực hiện
                              </Text>
                            </View>
                            <Text
                              variant="bodyMedium"
                              style={{
                                color: "#333",
                                lineHeight: 20,
                                marginTop: 4,
                              }}
                            >
                              {content.instructions}
                            </Text>
                          </View>
                        )}

                        {/* Tips */}
                        {content.tips && (
                          <View
                            style={[
                              styles.contentInfoSection,
                              {
                                backgroundColor: "#FFF8E1",
                                borderLeftWidth: 3,
                                borderLeftColor: "#FFC107",
                                borderRadius: 8,
                                padding: 12,
                              },
                            ]}
                          >
                            <View style={styles.infoLabelRow}>
                              <Icon
                                source="lightbulb-on"
                                size={18}
                                color="#F57C00"
                              />
                              <Text
                                variant="labelMedium"
                                style={{
                                  marginLeft: 6,
                                  color: "#F57C00",
                                  fontWeight: "700",
                                }}
                              >
                                Gợi ý
                              </Text>
                            </View>
                            <Text
                              variant="bodyMedium"
                              style={{
                                color: "#333",
                                lineHeight: 20,
                                marginTop: 4,
                                fontStyle: "italic",
                              }}
                            >
                              {content.tips}
                            </Text>
                          </View>
                        )}

                        {/* Content Notes */}
                        {content.notes && (
                          <View style={styles.contentInfoSection}>
                            <View style={styles.infoLabelRow}>
                              <Icon
                                source="note-text"
                                size={18}
                                color="#9C27B0"
                              />
                              <Text
                                variant="labelMedium"
                                style={{
                                  marginLeft: 6,
                                  color: "#9C27B0",
                                  fontWeight: "700",
                                }}
                              >
                                Ghi chú
                              </Text>
                            </View>
                            <Text
                              variant="bodyMedium"
                              style={{
                                color: "#333",
                                lineHeight: 20,
                                marginTop: 4,
                              }}
                            >
                              {content.notes}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Goals Evaluations for this Content */}
                      {content.goals && content.goals.length > 0 && (
                        <View style={{ marginTop: 16 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: 12,
                              marginLeft: 32,
                            }}
                          >
                            <Icon source="target" size={20} color="#4CAF50" />
                            <Text
                              variant="titleMedium"
                              style={{
                                marginLeft: 8,
                                fontWeight: "700",
                                color: "#4CAF50",
                              }}
                            >
                              Mục tiêu & Đánh giá ({content.goals.length})
                            </Text>
                          </View>

                          {/* Goals List */}
                          {content.goals.map((goal: any, goalIndex: number) => {
                            const evaluation = goalEvaluations?.find(
                              (ev: any) => ev.content_goal_id === goal.id
                            );

                            // Even if no evaluation, still show the goal
                            const supportOption = evaluation
                              ? getSupportLevelOption(evaluation.support_level)
                              : null;

                            // Determine achievement status and color
                            const achievementLevel = evaluation
                              ? Math.round(evaluation.achievement_level || 0)
                              : 0;
                            let statusColor = "#F44336";
                            let statusBg = "#FFEBEE";
                            let statusText = "Chưa đánh giá";
                            let statusIcon = "help-circle";

                            if (evaluation) {
                              statusText = "Chưa đạt";
                              statusIcon = "close-circle";

                              if (achievementLevel >= 80) {
                                statusColor = "#4CAF50";
                                statusBg = "#E8F5E9";
                                statusText = "Đạt tốt";
                                statusIcon = "check-circle";
                              } else if (achievementLevel >= 50) {
                                statusColor = "#FF9800";
                                statusBg = "#FFF3E0";
                                statusText = "Đạt một phần";
                                statusIcon = "minus-circle";
                              }
                            }

                            return (
                              <View key={goal.id} style={styles.goalEvaluation}>
                                {/* Goal Description */}
                                <View style={styles.goalDescriptionRow}>
                                  <Text
                                    variant="bodyMedium"
                                    style={{
                                      fontWeight: "600",
                                      color: "#333",
                                      flex: 1,
                                    }}
                                  >
                                    {String.fromCharCode(97 + goalIndex)}.{" "}
                                    {goal.description}
                                  </Text>
                                  {goal.is_primary && (
                                    <Chip
                                      compact
                                      mode="flat"
                                      icon="star"
                                      style={{
                                        backgroundColor: "#6750A4",
                                        height: 24,
                                      }}
                                      textStyle={{
                                        color: "#fff",
                                        fontSize: 11,
                                        fontWeight: "700",
                                      }}
                                    >
                                      Mục tiêu chính
                                    </Chip>
                                  )}
                                </View>

                                {/* Goal Type */}
                                <View
                                  style={{ marginTop: 6, marginBottom: 12 }}
                                >
                                  <Chip
                                    compact
                                    mode="outlined"
                                    icon={
                                      goal.goal_type === "knowledge"
                                        ? "book"
                                        : goal.goal_type === "skill"
                                        ? "tools"
                                        : "account-heart"
                                    }
                                    style={{ alignSelf: "flex-start" }}
                                    textStyle={{ fontSize: 11, color: "#666" }}
                                  >
                                    {goal.goal_type === "knowledge"
                                      ? "Kiến thức"
                                      : goal.goal_type === "skill"
                                      ? "Kỹ năng"
                                      : "Hành vi"}
                                  </Chip>
                                </View>

                                {evaluation ? (
                                  <>
                                    {/* Evaluation Metrics */}
                                    <View style={styles.evaluationMetrics}>
                                      {/* Achievement Level */}
                                      <View
                                        style={[
                                          styles.metricCard,
                                          {
                                            backgroundColor: statusBg,
                                            borderLeftColor: statusColor,
                                          },
                                        ]}
                                      >
                                        <View style={styles.metricHeader}>
                                          <Icon
                                            source={statusIcon}
                                            size={20}
                                            color={statusColor}
                                          />
                                          <Text
                                            variant="labelMedium"
                                            style={{
                                              marginLeft: 6,
                                              color: "#666",
                                            }}
                                          >
                                            Mức độ đạt được
                                          </Text>
                                        </View>
                                        <View
                                          style={{
                                            flexDirection: "row",
                                            alignItems: "baseline",
                                            marginTop: 8,
                                          }}
                                        >
                                          <Text
                                            variant="displaySmall"
                                            style={{
                                              color: statusColor,
                                              fontWeight: "700",
                                            }}
                                          >
                                            {achievementLevel}
                                          </Text>
                                          <Text
                                            variant="titleMedium"
                                            style={{
                                              color: statusColor,
                                              marginLeft: 2,
                                            }}
                                          >
                                            %
                                          </Text>
                                        </View>
                                        <Chip
                                          compact
                                          mode="flat"
                                          style={{
                                            backgroundColor: statusColor,
                                            marginTop: 8,
                                            alignSelf: "flex-start",
                                          }}
                                          textStyle={{
                                            color: "#fff",
                                            fontSize: 11,
                                            fontWeight: "700",
                                          }}
                                        >
                                          {statusText}
                                        </Chip>
                                      </View>

                                      {/* Support Level */}
                                      {supportOption && (
                                        <View
                                          style={[
                                            styles.metricCard,
                                            {
                                              backgroundColor:
                                                supportOption.color + "15",
                                              borderLeftColor:
                                                supportOption.color,
                                            },
                                          ]}
                                        >
                                          <View style={styles.metricHeader}>
                                            <Icon
                                              source="hand-heart"
                                              size={20}
                                              color={supportOption.color}
                                            />
                                            <Text
                                              variant="labelMedium"
                                              style={{
                                                marginLeft: 6,
                                                color: "#666",
                                              }}
                                            >
                                              Mức độ hỗ trợ
                                            </Text>
                                          </View>
                                          <View style={{ marginTop: 12 }}>
                                            <Chip
                                              mode="flat"
                                              icon="account-supervisor"
                                              style={{
                                                backgroundColor:
                                                  supportOption.color,
                                                alignSelf: "flex-start",
                                              }}
                                              textStyle={{
                                                color: "#fff",
                                                fontSize: 13,
                                                fontWeight: "700",
                                              }}
                                            >
                                              {supportOption.label}
                                            </Chip>
                                          </View>
                                        </View>
                                      )}
                                    </View>

                                    {/* Status Badge */}
                                    {evaluation.status && (
                                      <View style={{ marginTop: 12 }}>
                                        <Chip
                                          compact
                                          mode="flat"
                                          icon="information"
                                          style={{
                                            backgroundColor: "#E3F2FD",
                                            alignSelf: "flex-start",
                                          }}
                                          textStyle={{
                                            color: "#1976D2",
                                            fontSize: 12,
                                          }}
                                        >
                                          Trạng thái:{" "}
                                          {evaluation.status === "achieved"
                                            ? "Đã đạt"
                                            : evaluation.status ===
                                              "partially_achieved"
                                            ? "Đạt một phần"
                                            : evaluation.status ===
                                              "not_achieved"
                                            ? "Chưa đạt"
                                            : "Không áp dụng"}
                                        </Chip>
                                      </View>
                                    )}

                                    {/* Notes */}
                                    {evaluation.notes && (
                                      <View style={styles.notesSection}>
                                        <View
                                          style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            marginBottom: 6,
                                          }}
                                        >
                                          <Icon
                                            source="note-text"
                                            size={18}
                                            color="#F57C00"
                                          />
                                          <Text
                                            variant="labelMedium"
                                            style={{
                                              marginLeft: 6,
                                              color: "#F57C00",
                                              fontWeight: "700",
                                            }}
                                          >
                                            Ghi chú đánh giá
                                          </Text>
                                        </View>
                                        <Text
                                          variant="bodyMedium"
                                          style={{
                                            color: "#333",
                                            lineHeight: 20,
                                            fontStyle: "italic",
                                          }}
                                        >
                                          "{evaluation.notes}"
                                        </Text>
                                      </View>
                                    )}
                                  </>
                                ) : (
                                  <View
                                    style={[
                                      styles.notesSection,
                                      {
                                        backgroundColor: "#F5F5F5",
                                        borderLeftColor: "#999",
                                      },
                                    ]}
                                  >
                                    <Text
                                      variant="bodyMedium"
                                      style={{
                                        color: "#666",
                                        fontStyle: "italic",
                                      }}
                                    >
                                      Chưa có đánh giá cho mục tiêu này
                                    </Text>
                                  </View>
                                )}
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })}
              </Card.Content>
            </Card>
          )}

          {/* Progress Notes */}
          {sessionLog.progress_notes && (
            <Card style={styles.card}>
              <Card.Title
                title="Ghi chú tiến độ"
                left={(props) => <Icon source="note-text" {...props} />}
              />
              <Card.Content>
                <Text variant="bodyMedium" style={{ lineHeight: 22 }}>
                  {sessionLog.progress_notes}
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Challenges Faced */}
          {sessionLog.challenges_faced && (
            <Card style={styles.card}>
              <Card.Title
                title="Khó khăn gặp phải"
                left={(props) => (
                  <Icon source="alert-circle-outline" {...props} />
                )}
              />
              <Card.Content>
                <Text variant="bodyMedium" style={{ lineHeight: 22 }}>
                  {sessionLog.challenges_faced}
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Recommendations */}
          {sessionLog.recommendations && (
            <Card style={styles.card}>
              <Card.Title
                title="Đề xuất / Kế hoạch buổi sau"
                left={(props) => <Icon source="lightbulb-outline" {...props} />}
              />
              <Card.Content>
                <Text variant="bodyMedium" style={{ lineHeight: 22 }}>
                  {sessionLog.recommendations}
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Attitude Summary */}
          {sessionLog.attitude_summary && (
            <Card style={styles.card}>
              <Card.Title
                title="Tổng kết thái độ"
                left={(props) => <Icon source="account-heart" {...props} />}
              />
              <Card.Content>
                <Text variant="bodyMedium" style={{ lineHeight: 22 }}>
                  {sessionLog.attitude_summary}
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Behavior Incidents */}
          {behaviorIncidents && behaviorIncidents.length > 0 && (
            <Card style={styles.card}>
              <Card.Title
                title="Hành vi ghi nhận"
                subtitle={`${behaviorIncidents.length} hành vi`}
                left={(props) => <Icon source="alert-circle" {...props} />}
              />
              <Card.Content>
                {behaviorIncidents.map((incident: any, index: number) => (
                  <Card key={incident.id || index} style={styles.incidentCard}>
                    <Card.Content>
                      {/* Header with chips */}
                      <View style={styles.incidentHeader}>
                        <Chip
                          compact
                          mode="flat"
                          style={{
                            backgroundColor: "#FF9800",
                          }}
                          textStyle={{ color: "#fff", fontSize: 10 }}
                        >
                          #{incident.incident_number || index + 1}
                        </Chip>
                        {incident.behavior_library_id && (
                          <Chip
                            compact
                            mode="flat"
                            icon="book-open-variant"
                            style={{ backgroundColor: "#E8DEF8" }}
                            textStyle={{ color: "#6750A4", fontSize: 10 }}
                          >
                            Từ thư viện
                          </Chip>
                        )}
                      </View>

                      {/* Behavior Description */}
                      <Text
                        variant="titleMedium"
                        style={{
                          fontWeight: "600",
                          marginTop: 8,
                          marginBottom: 4,
                          color: "#333",
                        }}
                      >
                        {incident.behavior_description}
                      </Text>

                      {/* Occurred Time */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <Icon source="clock-outline" size={16} color="#666" />
                        <Text
                          variant="bodySmall"
                          style={{ marginLeft: 4, color: "#666" }}
                        >
                          {incident.occurred_at || "Không rõ thời gian"}
                        </Text>
                      </View>

                      {/* ABC Details */}
                      {(incident.antecedent ||
                        incident.consequence ||
                        incident.intervention_used) && (
                        <View style={styles.abcContainer}>
                          {/* Antecedent */}
                          {incident.antecedent && (
                            <View style={styles.abcItem}>
                              <View style={styles.abcLabel}>
                                <Icon
                                  source="arrow-left-circle"
                                  size={16}
                                  color="#2196F3"
                                />
                                <Text
                                  variant="labelMedium"
                                  style={{
                                    marginLeft: 4,
                                    color: "#2196F3",
                                    fontWeight: "600",
                                  }}
                                >
                                  Nguyên nhân (A)
                                </Text>
                              </View>
                              <Text
                                variant="bodyMedium"
                                style={{
                                  marginTop: 4,
                                  color: "#333",
                                  lineHeight: 20,
                                }}
                              >
                                {incident.antecedent}
                              </Text>
                            </View>
                          )}

                          {/* Consequence */}
                          {incident.consequence && (
                            <View style={styles.abcItem}>
                              <View style={styles.abcLabel}>
                                <Icon
                                  source="arrow-right-circle"
                                  size={16}
                                  color="#FF9800"
                                />
                                <Text
                                  variant="labelMedium"
                                  style={{
                                    marginLeft: 4,
                                    color: "#FF9800",
                                    fontWeight: "600",
                                  }}
                                >
                                  Hậu quả (C)
                                </Text>
                              </View>
                              <Text
                                variant="bodyMedium"
                                style={{
                                  marginTop: 4,
                                  color: "#333",
                                  lineHeight: 20,
                                }}
                              >
                                {incident.consequence}
                              </Text>
                            </View>
                          )}

                          {/* Intervention */}
                          {incident.intervention_used && (
                            <View style={styles.abcItem}>
                              <View style={styles.abcLabel}>
                                <Icon
                                  source="hand-heart"
                                  size={16}
                                  color="#4CAF50"
                                />
                                <Text
                                  variant="labelMedium"
                                  style={{
                                    marginLeft: 4,
                                    color: "#4CAF50",
                                    fontWeight: "600",
                                  }}
                                >
                                  Can thiệp
                                </Text>
                              </View>
                              <Text
                                variant="bodyMedium"
                                style={{
                                  marginTop: 4,
                                  color: "#333",
                                  lineHeight: 20,
                                }}
                              >
                                {incident.intervention_used}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

                      {/* Intensity Level */}
                      {incident.intensity_level && (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 8,
                          }}
                        >
                          <Text
                            variant="labelSmall"
                            style={{ color: "#666", marginRight: 8 }}
                          >
                            Mức độ:
                          </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 4,
                            }}
                          >
                            {[1, 2, 3, 4, 5].map((level) => (
                              <Icon
                                key={level}
                                source={
                                  level <= incident.intensity_level
                                    ? "circle"
                                    : "circle-outline"
                                }
                                size={16}
                                color={
                                  level <= incident.intensity_level
                                    ? "#F44336"
                                    : "#E0E0E0"
                                }
                              />
                            ))}
                          </View>
                        </View>
                      )}
                    </Card.Content>
                  </Card>
                ))}
              </Card.Content>
            </Card>
          )}

          {/* Teacher Notes */}
          {sessionLog.teacher_notes_text && (
            <Card style={styles.card}>
              <Card.Title
                title="Ghi chú của giáo viên"
                left={(props) => <Icon source="text-box" {...props} />}
              />
              <Card.Content>
                <Text variant="bodyMedium" style={{ lineHeight: 22 }}>
                  {sessionLog.teacher_notes_text}
                </Text>
              </Card.Content>
            </Card>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
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
    backgroundColor: "#fff",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  readOnlyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    paddingVertical: 16,
  },
  contentEvaluation: {
    marginBottom: 16,
  },
  goalEvaluation: {
    backgroundColor: "#FAFAFA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#6750A4",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  expandedContent: {
    marginTop: 4,
  },
  notesSection: {
    marginTop: 12,
    padding: 14,
    backgroundColor: "#FFF8E1",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FFA726",
  },
  incidentCard: {
    marginBottom: 12,
    backgroundColor: "#FFF8E1",
    elevation: 1,
  },
  incidentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  abcContainer: {
    marginTop: 8,
    gap: 12,
  },
  abcItem: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#E0E0E0",
  },
  abcLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3EDF7",
    justifyContent: "center",
    alignItems: "center",
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  goalDescriptionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  evaluationMetrics: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  contentHeaderCard: {
    backgroundColor: "#FAFAFA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#6750A4",
  },
  contentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  contentInfoSection: {
    marginTop: 12,
    marginLeft: 32,
  },
  infoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
});
