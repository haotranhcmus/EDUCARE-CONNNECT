import { Session } from "@/src/types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Chip, Icon, Text } from "react-native-paper";

interface SessionCardProps {
  session: Session;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const getStatusColor = (status: Session["status"]) => {
    switch (status) {
      case "completed":
        return "#4caf50";
      case "scheduled":
        return "#2196f3";
      case "cancelled":
        return "#f44336";
      default:
        return "#757575";
    }
  };

  const getStatusLabel = (status: Session["status"]) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "scheduled":
        return "Đã lên lịch";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getTimeSlotLabel = (timeSlot: Session["time_slot"]) => {
    switch (timeSlot) {
      case "morning":
        return "Sáng";
      case "afternoon":
        return "Chiều";
      case "evening":
        return "Tối";
      default:
        return "";
    }
  };

  const handlePress = () => {
    // Always navigate to session details
    router.push(`/sessions/${session.id}/details`);
  };

  return (
    <Card style={styles.card} onPress={handlePress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.dateContainer}>
            <Icon source="calendar" size={20} color="#666" />
            <Text variant="bodyMedium" style={styles.dateText}>
              {format(new Date(session.session_date), "dd/MM/yyyy", {
                locale: vi,
              })}
            </Text>
          </View>
          <View style={styles.chipWrapper}>
            <Chip
              mode="outlined"
              compact
              style={{
                borderColor: getStatusColor(session.status || "scheduled"),
              }}
              textStyle={{
                color: getStatusColor(session.status || "scheduled"),
                fontSize: 11,
              }}
            >
              {getStatusLabel(session.status || "scheduled")}
            </Chip>
          </View>
        </View>

        {(() => {
          const hasTimeSlot =
            session.time_slot &&
            session.time_slot.trim() &&
            getTimeSlotLabel(session.time_slot);
          const hasLocation = session.location && session.location.trim();
          const hasDuration =
            session.duration_minutes && session.duration_minutes > 0;

          if (!hasTimeSlot && !hasLocation && !hasDuration) return null;

          return (
            <View style={styles.details}>
              {hasTimeSlot && (
                <View style={styles.detailRow}>
                  <Icon source="clock-outline" size={16} color="#999" />
                  <Text variant="bodySmall" style={styles.detailText}>
                    {getTimeSlotLabel(session.time_slot)}
                  </Text>
                </View>
              )}
              {hasLocation && (
                <View style={styles.detailRow}>
                  <Icon source="map-marker" size={16} color="#999" />
                  <Text variant="bodySmall" style={styles.detailText}>
                    {session.location}
                  </Text>
                </View>
              )}
              {hasDuration && (
                <View style={styles.detailRow}>
                  <Icon source="timer-outline" size={16} color="#999" />
                  <Text variant="bodySmall" style={styles.detailText}>
                    {session.duration_minutes} phút
                  </Text>
                </View>
              )}
            </View>
          );
        })()}

        {session.notes && (
          <Text variant="bodySmall" style={styles.notes} numberOfLines={2}>
            {session.notes}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontWeight: "600",
  },
  chipWrapper: {
    flexShrink: 1,
    alignItems: "flex-end",
  },
  statusChip: {
    height: 28,
  },
  details: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    color: "#666",
  },
  notes: {
    marginTop: 8,
    color: "#999",
    fontStyle: "italic",
  },
});
