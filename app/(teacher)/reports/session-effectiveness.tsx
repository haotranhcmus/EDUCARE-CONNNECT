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

const METRICS = [
  {
    key: "energy_level",
    label: "Năng lượng",
    icon: "lightning-bolt",
    color: "#FF9800",
  },
  {
    key: "cooperation_level",
    label: "Hợp tác",
    icon: "handshake",
    color: "#4CAF50",
  },
  { key: "focus_level", label: "Tập trung", icon: "target", color: "#2196F3" },
  {
    key: "independence_level",
    label: "Tự lập",
    icon: "account-star",
    color: "#9C27B0",
  },
];

export default function SessionEffectivenessScreen() {
  const { user } = useAuthStore();
  const [startDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  const { data, isLoading } = useQuery({
    queryKey: ["session-effectiveness", user?.id, startDate, endDate],
    queryFn: async () => {
      // Get all session logs in period
      const { data: logs, error } = await supabase
        .from("session_logs")
        .select(
          `
          id,
          mood,
          energy_level,
          cooperation_level,
          focus_level,
          independence_level,
          overall_rating,
          session:sessions!inner (
            session_date,
            student:students!inner (
              profile_id,
              first_name,
              last_name
            )
          )
        `
        )
        .eq("session.student.profile_id", user?.id || "")
        .gte("session.session_date", startDate)
        .lte("session.session_date", endDate);

      if (error) throw error;

      // Calculate stats
      const totalSessions = logs?.length || 0;
      let totalRating = 0;
      const ratingDistribution: any = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      const moodDistribution: any = {};
      const metricAverages: any = {
        energy_level: 0,
        cooperation_level: 0,
        focus_level: 0,
        independence_level: 0,
      };

      logs?.forEach((log: any) => {
        // Overall rating
        if (log.overall_rating) {
          totalRating += log.overall_rating;
          ratingDistribution[log.overall_rating]++;
        }

        // Mood
        if (log.mood) {
          if (!moodDistribution[log.mood]) {
            moodDistribution[log.mood] = 0;
          }
          moodDistribution[log.mood]++;
        }

        // Metrics
        METRICS.forEach((metric) => {
          if (log[metric.key]) {
            metricAverages[metric.key] += log[metric.key];
          }
        });
      });

      const avgRating =
        totalSessions > 0 ? (totalRating / totalSessions).toFixed(1) : "0.0";

      // Calculate metric averages
      METRICS.forEach((metric) => {
        metricAverages[metric.key] =
          totalSessions > 0
            ? (metricAverages[metric.key] / totalSessions).toFixed(1)
            : "0.0";
      });

      return {
        totalSessions,
        avgRating: parseFloat(avgRating),
        ratingDistribution,
        moodDistribution,
        metricAverages,
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
            Hiệu quả Buổi học
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Đánh giá chất lượng và hiệu quả các buổi học
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

        {/* Average Rating */}
        <View style={styles.summary}>
          <Card style={styles.summaryCard}>
            <Card.Content style={styles.summaryContent}>
              <Icon source="star" size={48} color="#FFD700" />
              <Text variant="displaySmall" style={styles.summaryNumber}>
                {data?.avgRating || 0}
              </Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    source={
                      star <= Math.round(data?.avgRating || 0)
                        ? "star"
                        : "star-outline"
                    }
                    size={24}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Đánh giá trung bình
              </Text>
              <Text variant="bodySmall" style={{ color: "#999", marginTop: 4 }}>
                Từ {data?.totalSessions || 0} buổi học
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Rating Distribution */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Phân bố đánh giá
          </Text>

          {[5, 4, 3, 2, 1].map((rating) => {
            const count = data?.ratingDistribution?.[rating] || 0;
            const percentage =
              (data?.totalSessions || 0) > 0
                ? Math.round((count / (data?.totalSessions || 1)) * 100)
                : 0;

            return (
              <Card key={rating} style={styles.ratingCard}>
                <Card.Content>
                  <View style={styles.ratingRow}>
                    <View style={styles.ratingInfo}>
                      <Icon source="star" size={20} color="#FFD700" />
                      <Text variant="titleSmall" style={{ marginLeft: 8 }}>
                        {rating} sao
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 16 }}>
                      <ProgressBar
                        progress={percentage / 100}
                        color="#FFD700"
                        style={styles.progressBar}
                      />
                    </View>
                    <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
                      {count} ({percentage}%)
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </View>

        {/* Mood Distribution */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Tâm trạng học sinh
          </Text>

          <View style={styles.moodGrid}>
            {MOOD_OPTIONS.map((mood) => {
              const count = data?.moodDistribution?.[mood.value] || 0;
              const percentage =
                (data?.totalSessions || 0) > 0
                  ? Math.round((count / (data?.totalSessions || 1)) * 100)
                  : 0;

              return (
                <Card key={mood.value} style={styles.moodCard}>
                  <Card.Content style={styles.moodContent}>
                    <Icon source={mood.icon} size={32} color={mood.color} />
                    <Text
                      variant="titleMedium"
                      style={{ fontWeight: "bold", marginTop: 8 }}
                    >
                      {count}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={{ color: "#666", marginTop: 2 }}
                    >
                      {mood.label}
                    </Text>
                    <Chip
                      mode="flat"
                      style={{
                        marginTop: 8,
                        backgroundColor: `${mood.color}20`,
                      }}
                      textStyle={{ color: mood.color, fontWeight: "600" }}
                    >
                      {percentage}%
                    </Chip>
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        </View>

        {/* Metric Averages */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Các chỉ số trung bình
          </Text>

          {METRICS.map((metric) => {
            const average = parseFloat(
              data?.metricAverages?.[metric.key] || "0"
            );
            const percentage = (average / 5) * 100;

            return (
              <Card key={metric.key} style={styles.metricCard}>
                <Card.Content>
                  <View style={styles.metricHeader}>
                    <View style={styles.metricInfo}>
                      <Icon
                        source={metric.icon}
                        size={24}
                        color={metric.color}
                      />
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text variant="titleMedium">{metric.label}</Text>
                        <Text variant="bodySmall" style={{ color: "#666" }}>
                          Trung bình: {average}/5
                        </Text>
                      </View>
                    </View>
                    <Chip
                      mode="flat"
                      style={{ backgroundColor: `${metric.color}20` }}
                      textStyle={{ color: metric.color, fontWeight: "bold" }}
                    >
                      {average}
                    </Chip>
                  </View>
                  <ProgressBar
                    progress={percentage / 100}
                    color={metric.color}
                    style={styles.progressBar}
                  />
                </Card.Content>
              </Card>
            );
          })}
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
    color: "#FFD700",
    marginTop: 8,
  },
  stars: {
    flexDirection: "row",
    gap: 4,
    marginTop: 8,
  },
  summaryLabel: {
    color: "#666",
    marginTop: 12,
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 12,
  },
  ratingCard: {
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingInfo: {
    flexDirection: "row",
    alignItems: "center",
    width: 80,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  moodCard: {
    width: "48%",
  },
  moodContent: {
    alignItems: "center",
    paddingVertical: 16,
  },
  metricCard: {
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  metricInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
});
