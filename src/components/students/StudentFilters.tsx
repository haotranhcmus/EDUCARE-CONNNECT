import { StudentStatus } from "@/src/types";
import React, { useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Divider, Icon, Surface, Text } from "react-native-paper";

export interface StudentFiltersState {
  status?: StudentStatus;
  sortBy: "name" | "recent" | "oldest";
}

interface StudentFiltersProps {
  filters: StudentFiltersState;
  onFiltersChange: (filters: StudentFiltersState) => void;
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const handleStatusChange = (status?: StudentStatus) => {
    onFiltersChange({ ...filters, status });
    setStatusMenuVisible(false);
  };

  const handleSortChange = (sortBy: StudentFiltersState["sortBy"]) => {
    onFiltersChange({ ...filters, sortBy });
    setSortMenuVisible(false);
  };

  const getStatusLabel = (status?: StudentStatus) => {
    if (!status) return "Tất cả";
    switch (status) {
      case "active":
        return "Đang học";
      case "paused":
        return "Tạm dừng";
      case "archived":
        return "Lưu trữ";
      default:
        return "Tất cả";
    }
  };

  const getSortLabel = (sortBy: StudentFiltersState["sortBy"]) => {
    switch (sortBy) {
      case "name":
        return "Tên A-Z";
      case "recent":
        return "Mới nhất";
      case "oldest":
        return "Cũ nhất";
      default:
        return "Sắp xếp";
    }
  };

  return (
    <View style={styles.container}>
      {/* Status Filter Button */}
      <TouchableOpacity
        onPress={() => setStatusMenuVisible(true)}
        style={styles.filterButton}
      >
        <Surface
          style={[
            styles.buttonSurface,
            filters.status && styles.buttonSurfaceActive,
          ]}
          elevation={0}
        >
          <Text
            style={[
              styles.buttonText,
              filters.status && styles.buttonTextActive,
            ]}
          >
            {getStatusLabel(filters.status)}
          </Text>
          <Icon
            source="chevron-down"
            size={16}
            color={filters.status ? "#fff" : "#666"}
          />
        </Surface>
      </TouchableOpacity>

      {/* Sort Filter Button */}
      <TouchableOpacity
        onPress={() => setSortMenuVisible(true)}
        style={styles.filterButton}
      >
        <Surface style={styles.buttonSurface} elevation={0}>
          <Icon source="sort" size={16} color="#666" />
          <Text style={styles.buttonText}>{getSortLabel(filters.sortBy)}</Text>
          <Icon source="chevron-down" size={16} color="#666" />
        </Surface>
      </TouchableOpacity>

      {/* Clear Filters */}
      {filters.status && (
        <Button
          mode="text"
          onPress={() => handleStatusChange(undefined)}
          compact
          style={styles.clearButton}
        >
          Xóa bộ lọc
        </Button>
      )}

      {/* Status Menu Modal */}
      <Modal
        visible={statusMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setStatusMenuVisible(false)}
        >
          <Surface style={styles.menuSurface} elevation={4}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleStatusChange(undefined)}
            >
              <Text style={styles.menuItemText}>Tất cả</Text>
              {!filters.status && (
                <Icon source="check" size={20} color="#6366F1" />
              )}
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleStatusChange("active")}
            >
              <Text style={styles.menuItemText}>Đang học</Text>
              {filters.status === "active" && (
                <Icon source="check" size={20} color="#6366F1" />
              )}
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleStatusChange("paused")}
            >
              <Text style={styles.menuItemText}>Tạm dừng</Text>
              {filters.status === "paused" && (
                <Icon source="check" size={20} color="#6366F1" />
              )}
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleStatusChange("archived")}
            >
              <Text style={styles.menuItemText}>Lưu trữ</Text>
              {filters.status === "archived" && (
                <Icon source="check" size={20} color="#6366F1" />
              )}
            </TouchableOpacity>
          </Surface>
        </TouchableOpacity>
      </Modal>

      {/* Sort Menu Modal */}
      <Modal
        visible={sortMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortMenuVisible(false)}
        >
          <Surface style={styles.menuSurface} elevation={4}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleSortChange("name")}
            >
              <Text style={styles.menuItemText}>Tên A-Z</Text>
              {filters.sortBy === "name" && (
                <Icon source="check" size={20} color="#6366F1" />
              )}
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleSortChange("recent")}
            >
              <Text style={styles.menuItemText}>Mới nhất</Text>
              {filters.sortBy === "recent" && (
                <Icon source="check" size={20} color="#6366F1" />
              )}
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleSortChange("oldest")}
            >
              <Text style={styles.menuItemText}>Cũ nhất</Text>
              {filters.sortBy === "oldest" && (
                <Icon source="check" size={20} color="#6366F1" />
              )}
            </TouchableOpacity>
          </Surface>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexWrap: "wrap",
    backgroundColor: "#fff",
  },
  filterButton: {
    borderRadius: 20,
  },
  buttonSurface: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
    gap: 6,
  },
  buttonSurfaceActive: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  buttonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  buttonTextActive: {
    color: "#fff",
  },
  clearButton: {
    marginLeft: "auto",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuSurface: {
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 200,
    maxWidth: 300,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
});
