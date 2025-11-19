import { StudentCard } from "@/src/components/students/StudentCard";
import {
  StudentFilters,
  StudentFiltersState,
} from "@/src/components/students/StudentFilters";
import { useDeleteStudent, useStudents } from "@/src/hooks/useStudents";
import { Student } from "@/src/types";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  FAB,
  Modal,
  Portal,
  Searchbar,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";

import { supabase } from "@/lib/supabase/client";

export default function StudentsScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<StudentFiltersState>({
    status: undefined,
    sortBy: "name",
  });

  // Map sortBy from UI to API
  const getSortByValue = (sortBy: StudentFiltersState["sortBy"]) => {
    switch (sortBy) {
      case "name":
        return "first_name";
      case "recent":
        return "created_at";
      case "oldest":
        return "date_of_birth";
      default:
        return "first_name";
    }
  };

  const {
    data: students = [],
    isLoading,
    isRefetching,
    refetch,
  } = useStudents({
    status: filters.status,
    search: searchQuery,
    sortBy: getSortByValue(filters.sortBy),
  });

  const { mutateAsync: deleteStudent, isPending: isDeletingStudent } =
    useDeleteStudent();

  const handleAddStudent = () => {
    router.push("/students/add");
  };

  const handleEditStudent = (student: Student) => {
    router.push(`/students/${student.id}/edit`);
  };

  const handleDeleteStudent = (student: Student) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa học sinh ${student.last_name} ${student.first_name}?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteStudent(student.id);
            } catch (error: any) {
              Alert.alert("Lỗi", error.message || "Không thể xóa học sinh");
            }
          },
        },
      ]
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    const handleLogout = async () => {
      Alert.alert(
        "Xác nhận đăng xuất",
        "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?",
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Đăng xuất",
            style: "destructive",
            onPress: async () => {
              await supabase.auth.signOut();
              router.replace("/(auth)/login");
            },
          },
        ]
      );
    };

    const isFiltered = searchQuery || filters.status;

    return (
      <View style={styles.emptyContainer}>
        {/* Placeholder Image */}
        <Button onPress={handleLogout}>Log out</Button>
        <Image
          source={require("@/assets/images/student-placeholder.png")}
          style={styles.placeholderImage}
          resizeMode="contain"
        />

        {/* Empty State Content */}
        <View style={styles.emptyContent}>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            {isFiltered ? "Không tìm thấy học sinh" : "Chưa có học sinh"}
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {isFiltered
              ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm học sinh phù hợp"
              : "Bắt đầu bằng cách thêm học sinh đầu tiên của bạn. Nhấn vào nút bên dưới để bắt đầu!"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <Surface
        style={[styles.header, { backgroundColor: theme.colors.primary }]}
      >
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Học sinh
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Quản lý danh sách học sinh của bạn
        </Text>
      </Surface>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm học sinh..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {/* Filters */}
      <StudentFilters filters={filters} onFiltersChange={setFilters} />

      {/* Student List */}
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StudentCard
            student={item}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
          />
        )}
        contentContainerStyle={
          students?.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      />

      {/* Add Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddStudent}
        label="Thêm học sinh"
        color="#fff"
      />

      {/* Loading Modal */}
      <Portal>
        <Modal
          visible={isDeletingStudent}
          dismissable={false}
          contentContainerStyle={styles.modalContainer}
        >
          <ActivityIndicator size="large" />
          <Text style={styles.modalText}>Đang xóa học sinh...</Text>
        </Modal>
      </Portal>
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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  searchbar: {
    elevation: 0,
    backgroundColor: "#f5f5f5",
  },
  list: {
    paddingBottom: 100,
    paddingTop: 8,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#fff",
  },
  placeholderImage: {
    width: 240,
    height: 240,
    marginBottom: 24,
    opacity: 0.8,
  },
  emptyContent: {
    alignItems: "center",
    maxWidth: 400,
  },
  emptyTitle: {
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "600",
    color: "#1F2937",
  },
  emptyText: {
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#6366F1",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 24,
    margin: 32,
    borderRadius: 8,
    alignItems: "center",
  },
  modalText: {
    marginTop: 16,
  },
});
