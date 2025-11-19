import { useBehaviorGroups, useBehaviors } from "@/src/hooks/useBehaviors";
import type {
  BehaviorGroup,
  BehaviorLibrary,
} from "@/src/services/behavior.service";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  Icon,
  Searchbar,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";

export default function BehaviorsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState("all"); // all, most-used

  const {
    data: groups,
    isLoading: groupsLoading,
    refetch: refetchGroups,
  } = useBehaviorGroups();
  const {
    data: behaviors,
    isLoading: behaviorsLoading,
    refetch: refetchBehaviors,
    isRefetching,
  } = useBehaviors();

  // Refresh both groups and behaviors
  const handleRefresh = async () => {
    await Promise.all([refetchGroups(), refetchBehaviors()]);
  };

  // Filter behaviors locally - no API calls
  const filteredBehaviors = useMemo(() => {
    if (!behaviors) return [];

    let result = behaviors;

    // Filter by search query (local search)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((b: BehaviorLibrary) => {
        const nameVn = String(b.name_vn || "").toLowerCase();
        const nameEn = String(b.name_en || "").toLowerCase();
        const manifestationVn = String(b.manifestation_vn || "").toLowerCase();
        const manifestationEn = String(b.manifestation_en || "").toLowerCase();

        return (
          nameVn.includes(query) ||
          nameEn.includes(query) ||
          manifestationVn.includes(query) ||
          manifestationEn.includes(query)
        );
      });
    }

    // Filter by group
    if (selectedGroup) {
      result = result.filter(
        (b: BehaviorLibrary) => b.behavior_group_id === selectedGroup
      );
    }

    // Filter by view mode
    if (viewMode === "most-used") {
      result = [...result].sort(
        (a: BehaviorLibrary, b: BehaviorLibrary) =>
          (b.usage_count || 0) - (a.usage_count || 0)
      );
    }

    return result;
  }, [behaviors, searchQuery, selectedGroup, viewMode]);

  if (groupsLoading || behaviorsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6750A4" />
        <Text style={{ marginTop: 12 }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <Surface
        style={[styles.header, { backgroundColor: theme.colors.primary }]}
      >
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Thư viện hành vi
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Khám phá và tìm kiếm các hành vi điển hình
        </Text>
      </Surface>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm hành vi"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#6750A4"
        />
      </View>

      {/* Behavior Groups Filter */}
      {groups && groups.length > 0 && (
        <View style={styles.groupsContainer}>
          <Text variant="labelLarge" style={styles.groupsLabel}>
            Nhóm hành vi
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              { id: null, name_vn: "Tất cả", name_en: "All" } as any,
              ...groups,
            ]}
            keyExtractor={(item) => item.id || "all"}
            renderItem={({ item }) => (
              <Chip
                selected={selectedGroup === item.id}
                onPress={() => setSelectedGroup(item.id)}
                style={[
                  styles.groupChip,
                  selectedGroup === item.id && {
                    backgroundColor: "#6750A4",
                  },
                ]}
                textStyle={[
                  styles.groupChipText,
                  selectedGroup === item.id && {
                    color: "#fff",
                    fontWeight: "600",
                  },
                ]}
                showSelectedCheck={false}
              >
                {String(item.name_vn || "Nhóm")}
              </Chip>
            )}
            contentContainerStyle={{ paddingHorizontal: 12 }}
          />
        </View>
      )}

      {/* Behaviors List */}
      <FlatList
        data={filteredBehaviors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // Defensive check - skip invalid items
          if (!item || typeof item !== "object") {
            return null;
          }

          const group = groups?.find(
            (g: BehaviorGroup) => g.id === item.behavior_group_id
          );

          // Sanitize icon - only use if it's a valid icon name (not emoji)
          const iconName =
            item.icon &&
            typeof item.icon === "string" &&
            !/[\u{1F000}-\u{1F9FF}]/u.test(item.icon)
              ? item.icon
              : "shape-outline";

          // Safely extract text values
          const nameVn =
            typeof item.name_vn === "string"
              ? item.name_vn
              : item.name_vn
              ? String(item.name_vn)
              : "Không có tên";
          const nameEn =
            typeof item.name_en === "string"
              ? item.name_en
              : item.name_en
              ? String(item.name_en)
              : "";
          const manifestation =
            typeof item.manifestation_vn === "string"
              ? item.manifestation_vn
              : item.manifestation_vn
              ? String(item.manifestation_vn)
              : "";
          const usageCount =
            typeof item.usage_count === "number"
              ? item.usage_count
              : item.usage_count
              ? Number(item.usage_count)
              : 0;

          return (
            <Card
              style={styles.behaviorCard}
              onPress={() => router.push(`/behaviors/${item.id}`)}
            >
              <Card.Content>
                <View style={styles.behaviorHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.titleRow}>
                      <Icon source={iconName} size={20} color="#6750A4" />
                      <Text variant="titleMedium" style={styles.behaviorName}>
                        {nameVn}
                      </Text>
                    </View>
                    {nameEn && (
                      <Text variant="bodySmall" style={styles.behaviorNameEn}>
                        {nameEn}
                      </Text>
                    )}
                    {manifestation && (
                      <Text
                        variant="bodyMedium"
                        style={styles.behaviorDescription}
                        numberOfLines={2}
                      >
                        {manifestation}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Group Badge */}
                {group && group.name_vn && (
                  <Chip
                    mode="outlined"
                    compact
                    style={styles.groupBadge}
                    textStyle={{ fontSize: 11 }}
                    icon={
                      group.icon &&
                      typeof group.icon === "string" &&
                      !/[\u{1F000}-\u{1F9FF}]/u.test(group.icon)
                        ? group.icon
                        : undefined
                    }
                  >
                    {typeof group.name_vn === "string"
                      ? group.name_vn
                      : String(group.name_vn)}
                  </Chip>
                )}

                {/* Usage Count */}
                {usageCount > 0 && (
                  <View style={styles.usageInfo}>
                    <Icon source="chart-line" size={14} color="#999" />
                    <Text
                      variant="bodySmall"
                      style={{ color: "#999", marginLeft: 4 }}
                    >
                      Đã dùng {usageCount} lần
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon source="emoticon-sad-outline" size={64} color="#ccc" />
            <Text
              variant="headlineSmall"
              style={{ marginTop: 16, color: "#666" }}
            >
              Không tìm thấy hành vi nào
            </Text>
            {searchQuery && (
              <Text
                variant="bodyMedium"
                style={{ marginTop: 8, color: "#999" }}
              >
                Thử tìm kiếm với từ khóa khác
              </Text>
            )}
          </View>
        }
        contentContainerStyle={
          filteredBehaviors.length === 0 ? { flex: 1 } : { paddingBottom: 16 }
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={["#6750A4"]}
            tintColor="#6750A4"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#E0E7FF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    padding: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: "#f5f5f5",
  },
  segmentContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  segmentedButtons: {
    backgroundColor: "#fff",
  },
  groupsContainer: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    marginBottom: 8,
    elevation: 1,
  },
  groupsLabel: {
    paddingHorizontal: 12,
    marginBottom: 8,
    color: "#666",
    fontWeight: "600",
  },
  groupChip: {
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  groupChipText: {
    fontSize: 13,
    lineHeight: 18,
  },
  behaviorCard: {
    marginHorizontal: 12,
    marginTop: 8,
    elevation: 1,
  },
  behaviorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  behaviorName: {
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  behaviorNameEn: {
    color: "#999",
    fontSize: 12,
    fontStyle: "italic",
    marginLeft: 28,
    marginTop: 2,
  },
  behaviorDescription: {
    color: "#666",
    lineHeight: 20,
    marginTop: 4,
  },
  groupBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    marginRight: 8,
    borderColor: "#E0E0E0",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  usageInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
});
