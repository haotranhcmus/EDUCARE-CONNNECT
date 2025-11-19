import { useStudentGoalProgress } from "@/src/hooks/useParentStudents";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, ProgressBar, Text } from "react-native-paper";

export default function StudentEvaluationsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: goalProgress,
    isLoading,
    refetch,
  } = useStudentGoalProgress(id || "");

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getDomainInfo = (domain: string) => {
    const domainMap: Record<
      string,
      { label: string; icon: any; color: string; description: string }
    > = {
      cognitive: {
        label: "Nhận thức",
        icon: "bulb",
        color: "#6750A4",
        description: "Khả năng tư duy, giải quyết vấn đề, ghi nhớ",
      },
      motor: {
        label: "Vận động",
        icon: "fitness",
        color: "#2196F3",
        description: "Kỹ năng vận động thô và vận động tinh",
      },
      language: {
        label: "Ngôn ngữ",
        icon: "chatbubbles",
        color: "#4CAF50",
        description: "Khả năng giao tiếp, hiểu và sử dụng ngôn ngữ",
      },
      social: {
        label: "Xã hội",
        icon: "people",
        color: "#FF9800",
        description: "Kỹ năng tương tác, hợp tác với người khác",
      },
      self_care: {
        label: "Tự chăm sóc",
        icon: "hand-left",
        color: "#E91E63",
        description: "Khả năng tự phục vụ bản thân",
      },
    };
    return domainMap[domain] || domainMap.cognitive;
  };

  const getAchievementLabel = (status: string): string => {
    switch (status) {
      case "achieved":
        return "Đạt được";
      case "partial":
        return "Đang phát triển";
      case "not_achieved":
        return "Chưa đạt";
      default:
        return status;
    }
  };

  const getAchievementColor = (status: string): string => {
    switch (status) {
      case "achieved":
        return "#4CAF50";
      case "partial":
        return "#FF9800";
      case "not_achieved":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const getAchievementIcon = (status: string): any => {
    switch (status) {
      case "achieved":
        return "checkmark-circle";
      case "partial":
        return "time";
      case "not_achieved":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6750A4" />
        <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
      </View>
    );
  }

  if (!goalProgress) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="trophy-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
        <Text style={styles.emptySubtext}>
          Đánh giá sẽ được cập nhật định kỳ bởi giáo viên
        </Text>
      </View>
    );
  }

  const domains = Object.entries(goalProgress);
  const totalGoals = domains.reduce(
    (sum, [_, progress]) =>
      sum +
      (progress.achieved || 0) +
      (progress.partial || 0) +
      (progress.not_achieved || 0),
    0
  );
  const achievedGoals = domains.reduce(
    (sum, [_, progress]) => sum + (progress.achieved || 0),
    0
  );
  const overallProgress = totalGoals > 0 ? achievedGoals / totalGoals : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Overall Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.summaryHeader}>
            <Ionicons name="analytics" size={32} color="#6750A4" />
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle}>Tổng quan đánh giá</Text>
              <Text style={styles.summarySubtitle}>
                {achievedGoals}/{totalGoals} mục tiêu đã đạt được
              </Text>
            </View>
          </View>
          <ProgressBar
            progress={overallProgress}
            color="#6750A4"
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            {Math.round(overallProgress * 100)}% hoàn thành
          </Text>
        </Card.Content>
      </Card>

      {/* Domain Breakdown */}
      <View style={styles.sectionHeader}>
        <Ionicons name="grid" size={24} color="#6750A4" />
        <Text style={styles.sectionTitle}>Đánh giá theo lĩnh vực</Text>
      </View>

      <View style={styles.listContainer}>
        {domains.map(([domainKey, progress]) => {
          const domainInfo = getDomainInfo(domainKey);
          const total =
            (progress.achieved || 0) +
            (progress.partial || 0) +
            (progress.not_achieved || 0);
          const achieved = progress.achieved || 0;
          const domainProgress = total > 0 ? achieved / total : 0;

          return (
            <Card key={domainKey} style={styles.domainCard}>
              <Card.Content>
                {/* Domain Header */}
                <View style={styles.domainHeader}>
                  <View
                    style={[
                      styles.domainIcon,
                      { backgroundColor: `${domainInfo.color}20` },
                    ]}
                  >
                    <Ionicons
                      name={domainInfo.icon}
                      size={28}
                      color={domainInfo.color}
                    />
                  </View>
                  <View style={styles.domainInfo}>
                    <Text style={styles.domainName}>{domainInfo.label}</Text>
                    <Text style={styles.domainDescription}>
                      {domainInfo.description}
                    </Text>
                  </View>
                </View>

                {/* Progress */}
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Tiến độ</Text>
                    <Text style={styles.progressPercentage}>
                      {Math.round(domainProgress * 100)}%
                    </Text>
                  </View>
                  <ProgressBar
                    progress={domainProgress}
                    color={domainInfo.color}
                    style={styles.domainProgressBar}
                  />
                </View>

                {/* Goals Breakdown */}
                <View style={styles.goalsBreakdown}>
                  <View style={styles.goalsStat}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#4CAF50"
                    />
                    <Text style={styles.goalsStatLabel}>Đạt được</Text>
                    <Text style={[styles.goalsStatValue, { color: "#4CAF50" }]}>
                      {progress.achieved || 0}
                    </Text>
                  </View>
                  <View style={styles.goalsStat}>
                    <Ionicons name="time" size={20} color="#FF9800" />
                    <Text style={styles.goalsStatLabel}>Đang phát triển</Text>
                    <Text style={[styles.goalsStatValue, { color: "#FF9800" }]}>
                      {progress.partial || 0}
                    </Text>
                  </View>
                  <View style={styles.goalsStat}>
                    <Ionicons name="close-circle" size={20} color="#F44336" />
                    <Text style={styles.goalsStatLabel}>Chưa đạt</Text>
                    <Text style={[styles.goalsStatValue, { color: "#F44336" }]}>
                      {progress.not_achieved || 0}
                    </Text>
                  </View>
                </View>

                {/* Goals List */}
                {progress.goals && progress.goals.length > 0 && (
                  <View style={styles.goalsList}>
                    <Text style={styles.goalsListTitle}>
                      Chi tiết mục tiêu:
                    </Text>
                    {progress.goals
                      .slice(0, 3)
                      .map((goal: any, index: number) => (
                        <View key={index} style={styles.goalItem}>
                          <Ionicons
                            name={getAchievementIcon(goal.achievement_status)}
                            size={18}
                            color={getAchievementColor(goal.achievement_status)}
                          />
                          <Text style={styles.goalText} numberOfLines={2}>
                            {goal.goal_description || "Không có mô tả"}
                          </Text>
                          <View
                            style={[
                              styles.achievementBadge,
                              {
                                backgroundColor: `${getAchievementColor(
                                  goal.achievement_status
                                )}20`,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.achievementText,
                                {
                                  color: getAchievementColor(
                                    goal.achievement_status
                                  ),
                                },
                              ]}
                            >
                              {getAchievementLabel(goal.achievement_status)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    {progress.goals.length > 3 && (
                      <Text style={styles.moreGoalsText}>
                        +{progress.goals.length - 3} mục tiêu khác
                      </Text>
                    )}
                  </View>
                )}
              </Card.Content>
            </Card>
          );
        })}
      </View>

      {/* Info Card */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.infoRow}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#6750A4"
            />
            <Text style={styles.infoText}>
              Đánh giá được cập nhật định kỳ bởi giáo viên sau mỗi buổi học. Phụ
              huynh có thể theo dõi sự phát triển của bé qua từng mục tiêu.
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
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  summaryCard: {
    margin: 16,
    backgroundColor: "#fff",
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  summarySubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
  },
  progressText: {
    fontSize: 14,
    color: "#6750A4",
    fontWeight: "600",
    marginTop: 8,
    textAlign: "right",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  domainCard: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  domainHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  domainIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  domainInfo: {
    flex: 1,
  },
  domainName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  domainDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    lineHeight: 18,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  domainProgressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
  },
  goalsBreakdown: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginBottom: 16,
  },
  goalsStat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  goalsStatLabel: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
  goalsStatValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  goalsList: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  goalsListTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  goalText: {
    flex: 1,
    fontSize: 14,
    color: "#1a1a1a",
    lineHeight: 20,
  },
  achievementBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  achievementText: {
    fontSize: 11,
    fontWeight: "600",
  },
  moreGoalsText: {
    fontSize: 13,
    color: "#6750A4",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 4,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: "#E8F5E9",
    elevation: 0,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1a1a1a",
    lineHeight: 20,
  },
});
