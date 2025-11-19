import { useReportsDashboard } from "@/src/hooks/useReports";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { vi } from "date-fns/locale";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Card,
  Chip,
  Icon,
  IconButton,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";

type PeriodPreset = "week" | "month" | "quarter" | "custom";

export default function ReportsDashboardScreen() {
  const theme = useTheme();
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("week");
  const [startDate, setStartDate] = useState(
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")
  );

  const { data, isLoading } = useReportsDashboard(startDate, endDate);

  const handlePeriodChange = (preset: PeriodPreset) => {
    setPeriodPreset(preset);
    const today = new Date();

    switch (preset) {
      case "week":
        setStartDate(
          format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd")
        );
        setEndDate(format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"));
        break;
      case "month":
        setStartDate(format(startOfMonth(today), "yyyy-MM-dd"));
        setEndDate(format(endOfMonth(today), "yyyy-MM-dd"));
        break;
      case "quarter":
        // Q4 2024: Oct 1 - Dec 31
        const quarter = Math.floor(today.getMonth() / 3);
        const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
        const quarterEnd = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        setStartDate(format(quarterStart, "yyyy-MM-dd"));
        setEndDate(format(quarterEnd, "yyyy-MM-dd"));
        break;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải dữ liệu báo cáo...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Period Selector */}
      <Surface style={styles.periodSelector}>
        <Text variant="titleSmall" style={styles.periodLabel}>
          Khoảng thời gian
        </Text>
        <View style={styles.periodChips}>
          <Chip
            selected={periodPreset === "week"}
            onPress={() => handlePeriodChange("week")}
            style={styles.chip}
          >
            Tuần
          </Chip>
          <Chip
            selected={periodPreset === "month"}
            onPress={() => handlePeriodChange("month")}
            style={styles.chip}
          >
            Tháng
          </Chip>
          <Chip
            selected={periodPreset === "quarter"}
            onPress={() => handlePeriodChange("quarter")}
            style={styles.chip}
          >
            Quý
          </Chip>
        </View>
        <Text variant="bodySmall" style={styles.periodDates}>
          {format(new Date(startDate), "dd/MM/yyyy", { locale: vi })} -{" "}
          {format(new Date(endDate), "dd/MM/yyyy", { locale: vi })}
        </Text>
      </Surface>

      {/* Summary Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <View style={styles.statIcon}>
              <Icon source="target" size={28} color="#4CAF50" />
            </View>
            <Text variant="headlineMedium" style={styles.statNumber}>
              {data?.summary.goalAchievementRate || 0}%
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Mục tiêu đạt
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <View style={styles.statIcon}>
              <Icon source="book-open-variant" size={28} color="#2196F3" />
            </View>
            <Text variant="headlineMedium" style={styles.statNumber}>
              {data?.summary.completedSessions || 0}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Buổi học
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <View style={styles.statIcon}>
              <Icon source="alert-circle" size={28} color="#FF9800" />
            </View>
            <Text variant="headlineMedium" style={styles.statNumber}>
              {data?.summary.behaviorIncidents || 0}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Hành vi
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Average Rating */}
      <Card style={styles.ratingCard}>
        <Card.Content>
          <View style={styles.ratingContent}>
            <View>
              <Text variant="labelMedium" style={{ color: "#666" }}>
                Đánh giá trung bình
              </Text>
              <View style={styles.ratingStars}>
                <Text variant="headlineSmall" style={{ fontWeight: "bold" }}>
                  {data?.summary.averageSessionRating?.toFixed(1) || "0.0"}
                </Text>
                <Icon source="star" size={24} color="#FFD700" />
              </View>
            </View>
            <Text variant="bodySmall" style={{ color: "#999" }}>
              Dựa trên {data?.summary.completedSessions || 0} buổi học
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Report Categories */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Các loại báo cáo
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/reports/student-progress" as any)}
        >
          <Card style={styles.reportCard}>
            <Card.Content style={styles.reportContent}>
              <View style={styles.reportIcon}>
                <Icon source="chart-line" size={32} color="#2196F3" />
              </View>
              <View style={styles.reportText}>
                <Text variant="titleMedium">Tiến độ Học sinh</Text>
                <Text variant="bodySmall" style={{ color: "#666" }}>
                  Xem chi tiết tiến độ từng học sinh
                </Text>
              </View>
              <IconButton icon="chevron-right" size={24} />
            </Card.Content>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/reports/goal-achievement" as any)}
        >
          <Card style={styles.reportCard}>
            <Card.Content style={styles.reportContent}>
              <View style={styles.reportIcon}>
                <Icon source="target" size={32} color="#4CAF50" />
              </View>
              <View style={styles.reportText}>
                <Text variant="titleMedium">Đạt Mục tiêu</Text>
                <Text variant="bodySmall" style={{ color: "#666" }}>
                  Phân tích achievement rate theo domain
                </Text>
              </View>
              <IconButton icon="chevron-right" size={24} />
            </Card.Content>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/reports/behavior-analysis" as any)}
        >
          <Card style={styles.reportCard}>
            <Card.Content style={styles.reportContent}>
              <View style={styles.reportIcon}>
                <Icon source="emoticon-outline" size={32} color="#FF9800" />
              </View>
              <View style={styles.reportText}>
                <Text variant="titleMedium">Phân tích Hành vi</Text>
                <Text variant="bodySmall" style={{ color: "#666" }}>
                  Xu hướng hành vi theo thời gian
                </Text>
              </View>
              <IconButton icon="chevron-right" size={24} />
            </Card.Content>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/reports/session-effectiveness" as any)}
        >
          <Card style={styles.reportCard}>
            <Card.Content style={styles.reportContent}>
              <View style={styles.reportIcon}>
                <Icon source="check-circle" size={32} color="#9C27B0" />
              </View>
              <View style={styles.reportText}>
                <Text variant="titleMedium">Hiệu quả Buổi học</Text>
                <Text variant="bodySmall" style={{ color: "#666" }}>
                  Đánh giá chất lượng session logs
                </Text>
              </View>
              <IconButton icon="chevron-right" size={24} />
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </View>

      {/* Top Performers */}
      {data?.topPerformers && data.topPerformers.length > 0 && (
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            🏆 Top Performers
          </Text>
          {data.topPerformers.slice(0, 3).map((student, index) => (
            <Card key={student.studentId} style={styles.performerCard}>
              <Card.Content style={styles.performerContent}>
                <View style={styles.performerRank}>
                  <Text
                    variant="headlineSmall"
                    style={{
                      color:
                        index === 0
                          ? "#FFD700"
                          : index === 1
                          ? "#C0C0C0"
                          : "#CD7F32",
                      fontWeight: "bold",
                    }}
                  >
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.performerInfo}>
                  <Text variant="titleSmall">{student.studentName}</Text>
                  <Text variant="bodySmall" style={{ color: "#666" }}>
                    {student.completedSessions} buổi học hoàn thành
                  </Text>
                </View>
                <View style={styles.performerRate}>
                  <Text
                    variant="titleLarge"
                    style={{ color: "#4CAF50", fontWeight: "bold" }}
                  >
                    {student.achievementRate}%
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}
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
  periodSelector: {
    padding: 16,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  periodLabel: {
    marginBottom: 8,
    color: "#666",
  },
  periodChips: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flex: 1,
  },
  periodDates: {
    color: "#999",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 8,
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: "center",
    paddingVertical: 16,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontWeight: "bold",
    marginTop: 4,
  },
  statLabel: {
    color: "#666",
    marginTop: 4,
  },
  ratingCard: {
    margin: 16,
    marginTop: 0,
  },
  ratingContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingStars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  reportCard: {
    marginBottom: 12,
  },
  reportContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reportText: {
    flex: 1,
  },
  performerCard: {
    marginBottom: 8,
  },
  performerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  performerRank: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  performerInfo: {
    flex: 1,
  },
  performerRate: {
    alignItems: "flex-end",
  },
});
