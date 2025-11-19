import { useStudentGoalProgress } from "@/src/hooks/useParentStudents";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ActivityIndicator, Card, ProgressBar } from "react-native-paper";

export default function StudentGoalsTab() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: goalProgress,
    isLoading,
    refetch,
  } = useStudentGoalProgress(studentId || "");

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getDomainInfo = (domain: string) => {
    const domainMap: Record<
      string,
      { label: string; icon: any; color: string }
    > = {
      cognitive: { label: "Nhận thức", icon: "bulb", color: "#6750A4" },
      motor: { label: "Vận động", icon: "fitness", color: "#2196F3" },
      language: { label: "Ngôn ngữ", icon: "chatbubbles", color: "#4CAF50" },
      social: { label: "Xã hội", icon: "people", color: "#FF9800" },
      self_care: { label: "Tự chăm sóc", icon: "hand-left", color: "#E91E63" },
    };
    return domainMap[domain] || domainMap.cognitive;
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Mục tiêu & Phát triển",
            headerStyle: { backgroundColor: "#6750A4" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "700" },
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6750A4" />
          <Text style={styles.loadingText}>Đang tải mục tiêu...</Text>
        </View>
      </>
    );
  }

  if (!goalProgress) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Mục tiêu & Phát triển",
            headerStyle: { backgroundColor: "#6750A4" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "700" },
          }}
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có mục tiêu nào</Text>
        </View>
      </>
    );
  }

  const domains = Object.entries(goalProgress);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Mục tiêu & Phát triển",
          headerStyle: { backgroundColor: "#6750A4" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" },
        }}
      />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tiến độ theo lĩnh vực</Text>
          <Text style={styles.headerSubtitle}>
            Theo dõi sự phát triển của bé qua từng mục tiêu
          </Text>
        </View>

        <View style={styles.listContainer}>
          {domains.map(([domainKey, progress]) => {
            const domainInfo = getDomainInfo(domainKey);
            return (
              <Card key={domainKey} style={styles.domainCard}>
                <Card.Content>
                  <View style={styles.domainHeader}>
                    <View
                      style={[
                        styles.domainIcon,
                        { backgroundColor: domainInfo.color + "20" },
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
                      <Text style={styles.domainStats}>
                        {progress.achievedGoals}/{progress.totalGoals} mục tiêu
                        đạt được
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.domainPercent,
                        { color: domainInfo.color },
                      ]}
                    >
                      {progress.progressPercent}%
                    </Text>
                  </View>

                  <View style={styles.progressSection}>
                    <ProgressBar
                      progress={progress.progressPercent / 100}
                      color={domainInfo.color}
                      style={styles.progressBar}
                    />
                  </View>

                  <View style={styles.goalBreakdown}>
                    <View style={styles.breakdownItem}>
                      <View
                        style={[
                          styles.breakdownDot,
                          { backgroundColor: "#4CAF50" },
                        ]}
                      />
                      <Text style={styles.breakdownText}>
                        Đạt: {progress.achievedGoals}
                      </Text>
                    </View>
                    <View style={styles.breakdownItem}>
                      <View
                        style={[
                          styles.breakdownDot,
                          { backgroundColor: "#FF9800" },
                        ]}
                      />
                      <Text style={styles.breakdownText}>
                        Một phần: {progress.partiallyAchievedGoals}
                      </Text>
                    </View>
                    <View style={styles.breakdownItem}>
                      <View
                        style={[
                          styles.breakdownDot,
                          { backgroundColor: "#F44336" },
                        ]}
                      />
                      <Text style={styles.breakdownText}>
                        Chưa đạt: {progress.notAchievedGoals}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </View>

        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#6750A4"
              />
              <Text style={styles.infoText}>
                Mục tiêu được cập nhật định kỳ bởi giáo viên sau mỗi buổi học
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </>
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
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  domainCard: {
    marginBottom: 16,
    backgroundColor: "#fff",
    elevation: 2,
  },
  domainHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  domainIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  domainInfo: {
    flex: 1,
  },
  domainName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  domainStats: {
    fontSize: 13,
    color: "#666",
  },
  domainPercent: {
    fontSize: 24,
    fontWeight: "700",
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
  goalBreakdown: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownText: {
    fontSize: 12,
    color: "#666",
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: "#EDE7F6",
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#5B21B6",
    lineHeight: 20,
  },
});
