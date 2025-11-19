import { Student } from "@/src/types";
import { format } from "date-fns";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Card, Chip, IconButton, Text } from "react-native-paper";

interface StudentCardProps {
  student: Student;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onEdit,
  onDelete,
}) => {
  const getStatusColor = (status: Student["status"]) => {
    switch (status) {
      case "active":
        return "#4caf50";
      case "paused":
        return "#ff9800";
      case "archived":
        return "#9e9e9e";
      default:
        return "#757575";
    }
  };

  const getStatusLabel = (status: Student["status"]) => {
    switch (status) {
      case "active":
        return "Đang học";
      case "paused":
        return "Tạm dừng";
      case "archived":
        return "Lưu trữ";
      default:
        return status;
    }
  };

  const getGenderLabel = (gender: Student["gender"]) => {
    switch (gender) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "other":
        return "Khác";
      default:
        return "";
    }
  };

  const handlePress = () => {
    router.push(`/students/${student.id}/details`);
  };

  return (
    <Card style={styles.card} onPress={handlePress}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {student.avatar_url ? (
              <Avatar.Image size={50} source={{ uri: student.avatar_url }} />
            ) : (
              <Avatar.Text
                size={50}
                label={student.first_name[0] + student.last_name[0]}
                style={[
                  styles.avatar,
                  {
                    backgroundColor: getStatusColor(student.status || "active"),
                  },
                ]}
              />
            )}
          </View>
          <View style={styles.info}>
            <Text variant="titleMedium" style={styles.name}>
              {student.last_name} {student.first_name}
            </Text>
            <Text variant="bodySmall" style={styles.dateOfBirth}>
              {getGenderLabel(student.gender as Student["gender"])} •{" "}
              {format(new Date(student.date_of_birth), "dd/MM/yyyy")}
            </Text>
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
          <View style={styles.actions}>
            {onEdit && (
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => onEdit(student)}
              />
            )}
            {onDelete && (
              <IconButton
                icon="delete"
                size={20}
                onPress={() => onDelete(student)}
              />
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Chip
            mode="outlined"
            style={[
              { borderColor: getStatusColor(student.status || "active") },
            ]}
            textStyle={{
              color: getStatusColor(student.status || "active"),
              fontSize: 12,
            }}
          >
            {getStatusLabel(student.status || "active")}
          </Chip>
          {student.notes && (
            <Chip mode="outlined" textStyle={{ fontSize: 12 }}>
              📝 Ghi chú
            </Chip>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    marginHorizontal: 16,
    elevation: 2,
  },
  cardContent: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {},
  info: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    marginBottom: 4,
  },
  dateOfBirth: {
    color: "#666",
    marginBottom: 2,
  },
  diagnosis: {
    color: "#999",
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
    alignItems: "center",
  },
});
