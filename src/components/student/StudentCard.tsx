import type { Database } from "@/lib/supabase/database.types";
import { Colors, Spacing } from "@/src/theme/colors";
import { differenceInYears } from "date-fns";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Card, Chip, IconButton, Text } from "react-native-paper";

type Student = Database["public"]["Tables"]["students"]["Row"];

interface StudentCardProps {
  student: Student;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function StudentCard({
  student,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
}: StudentCardProps) {
  const age = student.date_of_birth
    ? differenceInYears(new Date(), new Date(student.date_of_birth))
    : null;

  const getStatusColor = () => {
    if (student.status === "active") return Colors.success;
    if (student.status === "paused") return Colors.warning;
    return Colors.gray[500];
  };

  const statusColor = getStatusColor();

  const statusLabel =
    student.status === "active"
      ? "Đang học"
      : student.status === "paused"
      ? "Tạm dừng"
      : "Lưu trữ";

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {student.avatar_url ? (
              <Avatar.Image size={56} source={{ uri: student.avatar_url }} />
            ) : (
              <Avatar.Text
                size={56}
                label={`${student.first_name[0]}${student.last_name[0]}`}
                style={{ backgroundColor: Colors.primary }}
              />
            )}
          </View>

          <View style={styles.info}>
            <Text variant="titleMedium" style={styles.name}>
              {student.last_name} {student.first_name}
              {student.nickname && (
                <Text variant="bodyMedium" style={styles.nickname}>
                  {" "}
                  ({student.nickname})
                </Text>
              )}
            </Text>

            <View style={styles.metadata}>
              {age !== null && age !== undefined && (
                <Text variant="bodySmall" style={styles.metaText}>
                  {age + " tuổi"}
                </Text>
              )}
              {student.gender && (
                <>
                  <Text variant="bodySmall" style={styles.separator}>
                    •
                  </Text>
                  <Text variant="bodySmall" style={styles.metaText}>
                    {student.gender === "male"
                      ? "Nam"
                      : student.gender === "female"
                      ? "Nữ"
                      : "Khác"}
                  </Text>
                </>
              )}
            </View>

            {student.diagnosis && (
              <Text
                variant="bodySmall"
                style={styles.diagnosis}
                numberOfLines={1}
              >
                {student.diagnosis}
              </Text>
            )}
          </View>

          {showActions && (
            <View style={styles.actions}>
              {onEdit && (
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={onEdit}
                  iconColor={Colors.primary}
                />
              )}
              {onDelete && (
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={onDelete}
                  iconColor={Colors.error}
                />
              )}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Chip
            mode="flat"
            textStyle={{ fontSize: 12 }}
            style={[styles.statusChip, { backgroundColor: statusColor + "20" }]}
          >
            <Text style={{ color: statusColor, fontSize: 12 }}>
              {statusLabel}
            </Text>
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    elevation: 2,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
  },
  avatarContainer: {
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: "600" as const,
    marginBottom: Spacing.xs,
  },
  nickname: {
    color: Colors.text.secondary,
    fontWeight: "400" as const,
  },
  metadata: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: Spacing.xs,
  },
  metaText: {
    color: Colors.text.secondary,
  },
  separator: {
    marginHorizontal: Spacing.xs,
    color: Colors.text.secondary,
  },
  diagnosis: {
    color: Colors.text.secondary,
    fontStyle: "italic" as const,
  },
  actions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  footer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  statusChip: {
    height: 28,
  },
  parentInfo: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: Spacing.xs,
  },
  parentLabel: {
    color: Colors.text.secondary,
  },
});
