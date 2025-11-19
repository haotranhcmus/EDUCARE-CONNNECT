import { useBehaviorGroups } from "@/src/hooks/useBehaviors";
import type { BehaviorGroup } from "@/src/services/behavior.service";
import { behaviorService } from "@/src/services/behavior.service";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, Chip, Icon, Text } from "react-native-paper";

export default function BehaviorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Safe string converter - ensures we only render valid strings
  const safeString = (value: any, fallback: string = ""): string => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean")
      return String(value);
    // For objects/arrays, don't try to stringify
    return fallback;
  };

  // Fetch behavior detail
  const {
    data: behavior,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["behavior", id],
    queryFn: async () => {
      if (!id) return null;
      const behaviors = await behaviorService.getBehaviors();
      return behaviors.find((b) => b.id === id) || null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { data: groups } = useBehaviorGroups();

  const group = useMemo(() => {
    if (!behavior || !groups) return null;
    return groups.find(
      (g: BehaviorGroup) => g.id === behavior.behavior_group_id
    );
  }, [behavior, groups]);

  // Show loading state
  if (isLoading || !behavior) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6750A4" />
          <Text style={{ marginTop: 12 }}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  // Early return if behavior is still null after loading
  if (!behavior) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon source="emoticon-sad-outline" size={64} color="#ccc" />
          <Text
            variant="headlineSmall"
            style={{ marginTop: 16, color: "#666" }}
          >
            Không tìm thấy hành vi
          </Text>
        </View>
      </View>
    );
  }

  // Parse JSON fields safely - handle nested objects properly
  const parseJsonField = (field: any): string[] => {
    if (!field) return [];

    if (Array.isArray(field)) {
      return field
        .map((item) => {
          if (typeof item === "string") return item;
          if (typeof item === "number" || typeof item === "boolean")
            return String(item);
          if (typeof item === "object" && item !== null) {
            // Extract title and content
            if (item.title && item.content) {
              return `${safeString(item.title)}: ${safeString(item.content)}`;
            }
            if (item.content) return safeString(item.content);
            if (item.title) return safeString(item.title);
            if (item.text) return safeString(item.text);
            return null;
          }
          return null;
        })
        .filter((item): item is string => item !== null && item.trim() !== "");
    }

    if (typeof field === "string") return [field];
    if (typeof field === "number" || typeof field === "boolean")
      return [String(field)];

    if (typeof field === "object" && field !== null) {
      // Single object case
      const content = safeString(field.content);
      const title = safeString(field.title);
      const text = safeString(field.text);

      if (content) return [content];
      if (title) return [title];
      if (text) return [text];
    }

    return [];
  };

  const explanationItems = parseJsonField(behavior.explanation);
  const solutionItems = parseJsonField(behavior.solutions);
  const preventionItems = parseJsonField(behavior.prevention_strategies);

  // Safe keywords extraction
  const keywordsVn = Array.isArray(behavior.keywords_vn)
    ? behavior.keywords_vn
        .map((k) => safeString(k))
        .filter((k) => k.trim() !== "")
    : [];
  const keywordsEn = Array.isArray(behavior.keywords_en)
    ? behavior.keywords_en
        .map((k) => safeString(k))
        .filter((k) => k.trim() !== "")
    : [];

  // Sanitize icon
  const iconName = safeString(behavior.icon, "shape-outline");

  // Pre-sanitize all text values to prevent rendering issues
  const nameVn = safeString(behavior.name_vn, "Hành vi");
  const nameEn = safeString(behavior.name_en);
  const behaviorCode = safeString(behavior.behavior_code);
  const ageMin = safeString(behavior.age_range_min, "0");
  const ageMax = safeString(behavior.age_range_max, "18+");
  const usageCount = safeString(behavior.usage_count, "0");
  const manifestationVn = safeString(behavior.manifestation_vn);
  const manifestationEn = safeString(behavior.manifestation_en);
  const groupName = safeString(group?.name_vn);
  const groupIcon = safeString(group?.icon) || undefined;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: nameVn || "Chi tiết hành vi",
        }}
      />
      <ScrollView style={styles.scrollView}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Icon source={iconName} size={48} color="#6750A4" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="headlineSmall" style={styles.title}>
                  {nameVn}
                </Text>
                {nameEn && (
                  <Text variant="titleMedium" style={styles.titleEn}>
                    {nameEn}
                  </Text>
                )}
                {behaviorCode && (
                  <Text variant="bodySmall" style={styles.code}>
                    Mã: {behaviorCode}
                  </Text>
                )}
              </View>
            </View>

            {/* Group Badge */}
            {groupName && (
              <Chip mode="outlined" icon={groupIcon} style={styles.groupChip}>
                <Text>{groupName}</Text>
              </Chip>
            )}

            {/* Age Range */}
            {(behavior.age_range_min || behavior.age_range_max) && (
              <View style={styles.ageRange}>
                <Icon source="calendar-range" size={16} color="#666" />
                <Text
                  variant="bodyMedium"
                  style={{ marginLeft: 8, color: "#666" }}
                >
                  Độ tuổi: {ageMin} - {ageMax} tuổi
                </Text>
              </View>
            )}

            {/* Usage Count */}
            {behavior.usage_count && behavior.usage_count > 0 && (
              <View style={styles.usageInfo}>
                <Icon source="chart-line" size={16} color="#666" />
                <Text
                  variant="bodyMedium"
                  style={{ marginLeft: 8, color: "#666" }}
                >
                  Đã ghi nhận {usageCount} lần
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Manifestation */}
        {(behavior.manifestation_vn || behavior.manifestation_en) && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Icon source="eye-outline" size={24} color="#6750A4" />
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Biểu hiện
                </Text>
              </View>
              {manifestationVn && (
                <Text variant="bodyMedium" style={styles.sectionContent}>
                  {manifestationVn}
                </Text>
              )}
              {manifestationEn && (
                <Text variant="bodySmall" style={styles.sectionContentEn}>
                  {manifestationEn}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Explanation */}
        {explanationItems.length > 0 && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Icon source="lightbulb-outline" size={24} color="#6750A4" />
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Giải thích
                </Text>
              </View>
              {explanationItems.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text variant="bodyMedium">• {item}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Solutions */}
        {solutionItems.length > 0 && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Icon source="lightbulb-on-outline" size={24} color="#4CAF50" />
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Giải pháp can thiệp
                </Text>
              </View>
              {solutionItems.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text variant="bodyMedium">• {item}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Prevention Strategies */}
        {preventionItems.length > 0 && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Icon source="shield-check-outline" size={24} color="#FF9800" />
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Chiến lược phòng ngừa
                </Text>
              </View>
              {preventionItems.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text variant="bodyMedium">• {item}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Keywords */}
        {(keywordsVn.length > 0 || keywordsEn.length > 0) && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Icon source="tag-multiple-outline" size={24} color="#6750A4" />
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Từ khóa liên quan
                </Text>
              </View>
              <View style={styles.keywordsContainer}>
                {keywordsVn.map((keyword, index) => (
                  <Chip
                    key={`vn-${index}`}
                    mode="outlined"
                    compact
                    style={styles.keywordChip}
                  >
                    <Text>{keyword}</Text>
                  </Chip>
                ))}
                {keywordsEn.map((keyword, index) => (
                  <Chip
                    key={`en-${index}`}
                    mode="outlined"
                    compact
                    style={styles.keywordChip}
                  >
                    <Text>{keyword}</Text>
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        <View style={{ height: 80 }} />
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 12,
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E8DEF8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  title: {
    fontWeight: "600",
    color: "#1C1B1F",
  },
  titleEn: {
    color: "#49454F",
    fontStyle: "italic",
    marginTop: 4,
  },
  code: {
    color: "#999",
    marginTop: 4,
  },
  groupChip: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ageRange: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  usageInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  sectionCard: {
    marginHorizontal: 12,
    marginTop: 8,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    marginLeft: 12,
    fontWeight: "600",
    color: "#1C1B1F",
  },
  sectionContent: {
    lineHeight: 22,
    color: "#49454F",
  },
  sectionContentEn: {
    lineHeight: 20,
    color: "#999",
    fontStyle: "italic",
    marginTop: 8,
  },
  listItem: {
    marginBottom: 8,
  },
  keywordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  keywordChip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    backgroundColor: "#6750A4",
  },
});
