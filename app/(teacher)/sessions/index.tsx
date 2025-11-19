import { SessionCard } from "@/src/components/sessions/SessionCard";
import { useCalendarSessions } from "@/src/hooks/useSessions";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { vi } from "date-fns/locale";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import {
  ActivityIndicator,
  Button,
  Chip,
  FAB,
  Icon,
  Modal,
  Portal,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";

interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    selected?: boolean;
    selectedColor?: string;
    dots?: Array<{ key: string; color: string }>;
  };
}

export default function SessionsCalendarScreen() {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [filterStudent, setFilterStudent] = useState<string | undefined>(
    undefined
  );
  const [showBulkCreate, setShowBulkCreate] = useState(false);

  const monthStart = format(startOfMonth(selectedMonth), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(selectedMonth), "yyyy-MM-dd");

  const { data: sessions, isLoading } = useCalendarSessions(
    monthStart,
    monthEnd,
    filterStudent
  );

  const markedDates: MarkedDates = useMemo(() => {
    if (!sessions) return {};

    const marked: MarkedDates = {};

    sessions.forEach((session: any) => {
      const dateStr = session.session_date;

      if (!marked[dateStr]) {
        marked[dateStr] = {
          marked: true,
          dots: [],
        };
      }

      const dotColor =
        session.status === "completed"
          ? "#4caf50"
          : session.status === "cancelled"
          ? "#f44336"
          : "#2196f3";

      marked[dateStr].dots?.push({
        key: session.id,
        color: dotColor,
      });
    });

    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = "#6750A4";
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: "#6750A4",
      };
    }

    return marked;
  }, [sessions, selectedDate]);

  const sessionsForDate = useMemo(() => {
    if (!sessions) return [];
    return sessions.filter((s: any) => s.session_date === selectedDate);
  }, [sessions, selectedDate]);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const handleMonthChange = (month: DateData) => {
    setSelectedMonth(new Date(month.year, month.month - 1, 1));
  };

  const handleCreateSession = () => {
    router.push({
      pathname: "/sessions/create",
      params: { date: selectedDate },
    });
  };

  const handleBulkCreate = () => {
    setShowBulkCreate(true);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Custom Header */}
        <Surface
          style={[styles.header, { backgroundColor: theme.colors.primary }]}
        >
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Lịch buổi học
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Quản lý và theo dõi các buổi học
          </Text>
        </Surface>

        <Calendar
          current={format(selectedMonth, "yyyy-MM-dd")}
          onDayPress={handleDayPress}
          onMonthChange={handleMonthChange}
          markedDates={markedDates}
          markingType="multi-dot"
          theme={{
            backgroundColor: "#ffffff",
            calendarBackground: "#ffffff",
            textSectionTitleColor: "#666",
            selectedDayBackgroundColor: "#6750A4",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#6750A4",
            dayTextColor: "#000",
            textDisabledColor: "#d9d9d9",
            dotColor: "#6750A4",
            selectedDotColor: "#ffffff",
            arrowColor: "#6750A4",
            monthTextColor: "#000",
            indicatorColor: "#6750A4",
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 12,
          }}
          style={styles.calendar}
        />

        <View style={styles.sessionsContainer}>
          <View style={styles.dateHeader}>
            <Text variant="titleMedium" style={styles.dateHeaderText}>
              {format(new Date(selectedDate), "EEEE, dd MMMM yyyy", {
                locale: vi,
              })}
            </Text>
            <Chip mode="outlined" compact>
              {sessionsForDate.length} buổi học
            </Chip>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: 12 }}>Đang tải lịch học...</Text>
            </View>
          ) : sessionsForDate.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon source="calendar-blank" size={64} color="#ccc" />
              <Text variant="bodyLarge" style={styles.emptyText}>
                Không có buổi học nào
              </Text>
              <Text variant="bodySmall" style={styles.emptySubtext}>
                Nhấn nút + để thêm buổi học mới
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.sessionsList}
              showsVerticalScrollIndicator={false}
            >
              {sessionsForDate.map((session: any) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </ScrollView>
          )}
        </View>

        <Portal>
          <Modal
            visible={showBulkCreate}
            onDismiss={() => setShowBulkCreate(false)}
            contentContainerStyle={styles.modal}
          >
            <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
              Tạo nhiều buổi học
            </Text>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Chức năng đang được phát triển...
            </Text>
            <Button mode="contained" onPress={() => setShowBulkCreate(false)}>
              Đóng
            </Button>
          </Modal>
        </Portal>
      </ScrollView>

      {/* Add Session Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateSession}
        label="Thêm buổi học"
        color="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
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
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2,
  },
  sessionsContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  dateHeaderText: {
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    color: "#666",
  },
  emptySubtext: {
    marginTop: 8,
    color: "#999",
  },
  sessionsList: {
    flex: 1,
    padding: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#6366F1",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  modal: {
    backgroundColor: "white",
    padding: 24,
    margin: 20,
    borderRadius: 12,
  },
});
