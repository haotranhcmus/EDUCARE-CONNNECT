import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/src/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { vi } from "date-fns/locale";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Card,
  Chip,
  Icon,
  ProgressBar,
  Surface,
  Text,
} from "react-native-paper";

const DOMAINS = [
  {
    key: "Communication",
    label: "Giao tiếp",
    icon: "message-text",
    color: "#2196F3",
  },
  {
    key: "Social Skills",
    label: "Kỹ năng xã hội",
    icon: "account-group",
    color: "#4CAF50",
  },
  { key: "Academic", label: "Học thuật", icon: "book-open", color: "#FF9800" },
  { key: "Life Skills", label: "Kỹ năng sống", icon: "home", color: "#9C27B0" },
  { key: "Sensory", label: "Cảm giác", icon: "hand-wave", color: "#00BCD4" },
  { key: "Behavior", label: "Hành vi", icon: "emoticon", color: "#F44336" },
];

const GOAL_TYPES = [
  { key: "knowledge", label: "Kiến thức", icon: "brain", color: "#2196F3" },
  { key: "skill", label: "Kỹ năng", icon: "tools", color: "#4CAF50" },
  {
    key: "behavior",
    label: "Hành vi",
    icon: "emoticon-happy",
    color: "#FF9800",
  },
];

export default function GoalAchievementScreen() {
  const { user } = useAuthStore();
  const [startDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  const { data, isLoading } = useQuery({
    queryKey: ["goal-achievement", user?.id, startDate, endDate],
    queryFn: async () => {
      // Get all goal evaluations in period
      const { data: evaluations, error } = await supabase
        .from("goal_evaluations")
        .select(
          `
          achievement_level,
          status,
          session_log:session_logs!inner (
            session:sessions!inner (
              session_date,
              student:students!inner (
                profile_id
              ),
              session_contents!inner (
                domain,
                session_content_goals!inner (
                  goal_type,
                  is_primary
                )
              )
            )
          )
        `
        )
        .eq("session_log.session.student.profile_id", user?.id || "")
        .gte("session_log.session.session_date", startDate)
        .lte("session_log.session.session_date", endDate);

      if (error) throw error;

      // Calculate stats by domain
      const domainStats: any = {};
      const typeStats: any = {};
      let totalGoals = 0;
      let totalAchievement = 0;

      evaluations?.forEach((evaluation: any) => {
        const content = evaluation.session_log?.session?.session_contents?.[0];
        if (!content) return;

        const domain = content.domain;
        const goal = content.session_content_goals?.[0];
        const goalType = goal?.goal_type || "skill";
        const achievement = evaluation.achievement_level || 0;

        totalGoals++;
        totalAchievement += achievement;

        // By domain
        if (!domainStats[domain]) {
          domainStats[domain] = { total: 0, achievement: 0, count: 0 };
        }
        domainStats[domain].count++;
        domainStats[domain].achievement += achievement;

        // By goal type
        if (!typeStats[goalType]) {
          typeStats[goalType] = { total: 0, achievement: 0, count: 0 };
        }
        typeStats[goalType].count++;
        typeStats[goalType].achievement += achievement;
      });

      return {
        totalGoals,
        avgAchievement:
          totalGoals > 0 ? Math.round(totalAchievement / totalGoals) : 0,
        domainStats,
        typeStats,
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Surface style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Phân tích Đạt Mục tiêu
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Chi tiết achievement rate theo lĩnh vực và loại mục tiêu
          </Text>
        </Surface>

        {/* Period */}
        <View style={styles.period}>
          <Icon source="calendar-range" size={20} color="#666" />
          <Text variant="bodyMedium" style={{ color: "#666", marginLeft: 8 }}>
            {format(new Date(startDate), "dd/MM/yyyy", { locale: vi })} -{" "}
            {format(new Date(endDate), "dd/MM/yyyy", { locale: vi })}
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Card style={styles.summaryCard}>
            <Card.Content style={styles.summaryContent}>
              <Icon source="target" size={48} color="#4CAF50" />
              <Text variant="displaySmall" style={styles.summaryNumber}>
                {data?.avgAchievement || 0}%
              </Text>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Tỷ lệ đạt mục tiêu trung bình
              </Text>
              <Text variant="bodySmall" style={{ color: "#999", marginTop: 4 }}>
                Từ {data?.totalGoals || 0} mục tiêu
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* By Domain */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Theo Lĩnh vực
          </Text>

          {DOMAINS.map((domain) => {
            const stats = data?.domainStats?.[domain.key];
            const avgRate = stats
              ? Math.round(stats.achievement / stats.count)
              : 0;

            return (
              <Card key={domain.key} style={styles.domainCard}>
                <Card.Content>
                  <View style={styles.domainHeader}>
                    <View style={styles.domainInfo}>
                      <Icon
                        source={domain.icon}
                        size={24}
                        color={domain.color}
                      />
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text variant="titleMedium">{domain.label}</Text>
                        <Text variant="bodySmall" style={{ color: "#666" }}>
                          {stats?.count || 0} mục tiêu
                        </Text>
                      </View>
                    </View>
                    <Chip
                      mode="flat"
                      style={{ backgroundColor: `${domain.color}20` }}
                      textStyle={{
                        color: domain.color,
                        fontWeight: "bold",
                      }}
                    >
                      {avgRate}%
                    </Chip>
                  </View>

                  <ProgressBar
                    progress={avgRate / 100}
                    color={domain.color}
                    style={styles.progressBar}
                  />
                </Card.Content>
              </Card>
            );
          })}
        </View>

        {/* By Goal Type */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Theo Loại Mục tiêu
          </Text>

          <View style={styles.typeGrid}>
            {GOAL_TYPES.map((type) => {
              const stats = data?.typeStats?.[type.key];
              const avgRate = stats
                ? Math.round(stats.achievement / stats.count)
                : 0;

              return (
                <Card key={type.key} style={styles.typeCard}>
                  <Card.Content style={styles.typeContent}>
                    <Icon source={type.icon} size={32} color={type.color} />
                    <Text
                      variant="headlineSmall"
                      style={{
                        fontWeight: "bold",
                        marginTop: 8,
                        color: type.color,
                      }}
                    >
                      {avgRate}%
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={{ fontWeight: "600", marginTop: 4 }}
                    >
                      {type.label}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={{ color: "#666", marginTop: 2 }}
                    >
                      {stats?.count || 0} mục tiêu
                    </Text>
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
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
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    elevation: 2,
  },
  headerTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#666",
  },
  period: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  summary: {
    padding: 16,
  },
  summaryCard: {
    elevation: 4,
  },
  summaryContent: {
    alignItems: "center",
    paddingVertical: 24,
  },
  summaryNumber: {
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 8,
  },
  summaryLabel: {
    color: "#666",
    marginTop: 4,
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 12,
  },
  domainCard: {
    marginBottom: 12,
  },
  domainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  domainInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeCard: {
    width: "48%",
  },
  typeContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
});
