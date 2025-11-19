import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/src/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { vi } from "date-fns/locale";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Chip, Icon, Surface, Text } from "react-native-paper";

const SEVERITY_LEVELS = [
  { value: 1, label: "Rất nhẹ", color: "#4CAF50" },
  { value: 2, label: "Nhẹ", color: "#8BC34A" },
  { value: 3, label: "Trung bình", color: "#FF9800" },
  { value: 4, label: "Nặng", color: "#FF5722" },
  { value: 5, label: "Rất nặng", color: "#F44336" },
];

export default function BehaviorAnalysisScreen() {
  const { user } = useAuthStore();
  const [startDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  const { data, isLoading } = useQuery({
    queryKey: ["behavior-analysis", user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      // First, get all sessions in the date range for this teacher
      const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select("id")
        .eq("created_by", user.id)
        .gte("session_date", startDate)
        .lte("session_date", endDate)
        .eq("status", "completed");

      if (sessionsError) throw sessionsError;
      if (!sessions || sessions.length === 0) {
        return {
          totalIncidents: 0,
          avgDuration: 0,
          interventionSuccessRate: 0,
          requiresFollowupCount: 0,
          severityCount: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          topBehaviors: [],
          studentIncidents: {},
          recentIncidents: [],
        };
      }

      // Get session logs for these sessions
      const sessionIds = sessions.map((s) => s.id);
      const { data: sessionLogs } = await supabase
        .from("session_logs")
        .select("id, session_id")
        .in("session_id", sessionIds);

      if (!sessionLogs || sessionLogs.length === 0) {
        return {
          totalIncidents: 0,
          avgDuration: 0,
          interventionSuccessRate: 0,
          requiresFollowupCount: 0,
          severityCount: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          topBehaviors: [],
          studentIncidents: {},
          recentIncidents: [],
        };
      }

      // Get behavior incidents for these session logs
      const sessionLogIds = sessionLogs.map((sl) => sl.id);
      const { data: incidents, error } = await supabase
        .from("behavior_incidents")
        .select(
          `
          id,
          occurred_at,
          intensity_level,
          duration_minutes,
          intervention_effective,
          requires_followup,
          behavior_description,
          antecedent,
          consequence,
          intervention_used,
          session_log_id,
          behavior_library:behavior_library (
            name_vn,
            behavior_group:behavior_groups (
              name_vn
            )
          )
        `
        )
        .in("session_log_id", sessionLogIds)
        .order("occurred_at", { ascending: false });

      if (error) throw error;

      // Calculate stats
      const totalIncidents = incidents?.length || 0;
      let totalDuration = 0;
      let interventionSuccessCount = 0;
      let requiresFollowupCount = 0;
      const severityCount: any = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      const behaviorTypes: any = {};

      incidents?.forEach((incident: any) => {
        // Duration
        if (incident.duration_minutes) {
          totalDuration += incident.duration_minutes;
        }

        // Intervention effectiveness
        if (incident.intervention_effective === true) {
          interventionSuccessCount++;
        }

        // Requires followup
        if (incident.requires_followup) {
          requiresFollowupCount++;
        }

        // Severity
        if (incident.intensity_level) {
          severityCount[incident.intensity_level]++;
        }

        // Behavior types
        const behaviorName =
          incident.behavior_library?.name_vn ||
          incident.behavior_description?.substring(0, 30) ||
          "Không xác định";
        if (!behaviorTypes[behaviorName]) {
          behaviorTypes[behaviorName] = 0;
        }
        behaviorTypes[behaviorName]++;
      });

      const avgDuration =
        totalIncidents > 0 ? Math.round(totalDuration / totalIncidents) : 0;
      const interventionSuccessRate =
        totalIncidents > 0
          ? Math.round((interventionSuccessCount / totalIncidents) * 100)
          : 0;

      // Top behaviors
      const topBehaviors = Object.entries(behaviorTypes)
        .map(([name, count]) => ({ name, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5);

      return {
        totalIncidents,
        avgDuration,
        interventionSuccessRate,
        requiresFollowupCount,
        severityCount,
        topBehaviors,
        recentIncidents: incidents?.slice(0, 10) || [],
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
            Phân tích Hành vi
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Xu hướng hành vi, can thiệp và hiệu quả
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

        {/* Summary Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Icon source="alert-circle" size={32} color="#FF9800" />
              <Text variant="headlineMedium" style={styles.statNumber}>
                {data?.totalIncidents || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Sự cố hành vi
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Icon source="clock-outline" size={32} color="#2196F3" />
              <Text variant="headlineMedium" style={styles.statNumber}>
                {data?.avgDuration || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Phút trung bình
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Icon source="check-circle" size={32} color="#4CAF50" />
              <Text variant="headlineMedium" style={styles.statNumber}>
                {data?.interventionSuccessRate || 0}%
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Can thiệp hiệu quả
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Icon source="flag" size={32} color="#F44336" />
              <Text variant="headlineMedium" style={styles.statNumber}>
                {data?.requiresFollowupCount || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Cần theo dõi
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Severity Distribution */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Phân bố mức độ nghiêm trọng
          </Text>

          {SEVERITY_LEVELS.map((level) => {
            const count = data?.severityCount?.[level.value] || 0;
            const percentage =
              (data?.totalIncidents || 0) > 0
                ? Math.round((count / (data?.totalIncidents || 1)) * 100)
                : 0;

            return (
              <Card key={level.value} style={styles.severityCard}>
                <Card.Content>
                  <View style={styles.severityRow}>
                    <View style={styles.severityInfo}>
                      <View
                        style={[
                          styles.severityDot,
                          { backgroundColor: level.color },
                        ]}
                      />
                      <Text variant="titleSmall">{level.label}</Text>
                    </View>
                    <View style={styles.severityStats}>
                      <Text
                        variant="titleMedium"
                        style={{ fontWeight: "bold", color: level.color }}
                      >
                        {count}
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={{ color: "#666", marginLeft: 8 }}
                      >
                        ({percentage}%)
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </View>

        {/* Top Behaviors */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Hành vi phổ biến nhất
          </Text>

          {data?.topBehaviors && data.topBehaviors.length > 0 ? (
            data.topBehaviors.map((behavior: any, index: number) => (
              <Card key={index} style={styles.behaviorCard}>
                <Card.Content>
                  <View style={styles.behaviorRow}>
                    <View style={styles.behaviorRank}>
                      <Text
                        variant="titleLarge"
                        style={{ fontWeight: "bold", color: "#6750A4" }}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.behaviorInfo}>
                      <Text variant="titleMedium">{behavior.name}</Text>
                      <Text variant="bodySmall" style={{ color: "#666" }}>
                        {behavior.count} lần xảy ra
                      </Text>
                    </View>
                    <Chip mode="flat" style={{ backgroundColor: "#E8DEF8" }}>
                      {Math.round(
                        (behavior.count / (data?.totalIncidents || 1)) * 100
                      )}
                      %
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card>
              <Card.Content
                style={{ alignItems: "center", paddingVertical: 24 }}
              >
                <Icon source="information-outline" size={48} color="#ccc" />
                <Text style={{ marginTop: 12, color: "#666" }}>
                  Chưa có dữ liệu hành vi
                </Text>
              </Card.Content>
            </Card>
          )}
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: "48%",
  },
  statContent: {
    alignItems: "center",
    paddingVertical: 16,
  },
  statNumber: {
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 12,
  },
  severityCard: {
    marginBottom: 8,
  },
  severityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  severityInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  severityStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  behaviorCard: {
    marginBottom: 8,
  },
  behaviorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  behaviorRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  behaviorInfo: {
    flex: 1,
  },
});
