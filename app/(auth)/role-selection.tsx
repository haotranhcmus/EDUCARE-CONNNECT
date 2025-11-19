import { Colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RoleSelectionScreen() {
  const handleSelectRole = (role: "teacher" | "parent") => {
    if (role === "teacher") {
      router.push("/register-teacher" as any);
    } else {
      router.push("/register-parent" as any);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.background.primary }}
    >
      <Stack.Screen
        options={{
          title: "Chọn vai trò",
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: "#fff",
        }}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        style={{ backgroundColor: Colors.background.primary }}
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Bạn là ai?
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Chọn vai trò của bạn để tiếp tục đăng ký
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <Card
            style={styles.card}
            onPress={() => handleSelectRole("teacher")}
            mode="elevated"
          >
            <Card.Content style={styles.cardContent}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: Colors.primary + "20" },
                ]}
              >
                <Ionicons name="school" size={48} color={Colors.primary} />
              </View>
              <Text variant="headlineSmall" style={styles.cardTitle}>
                Giáo viên
              </Text>
              <Text variant="bodyMedium" style={styles.cardDescription}>
                Tôi là giáo viên giáo dục đặc biệt, muốn quản lý học sinh và
                theo dõi tiến độ học tập
              </Text>
              <View style={styles.features}>
                <FeatureItem text="Quản lý học sinh" />
                <FeatureItem text="Tạo và theo dõi phiên học" />
                <FeatureItem text="Ghi nhận hành vi" />
                <FeatureItem text="Tạo báo cáo tiến độ" />
              </View>
            </Card.Content>
          </Card>

          <Card
            style={styles.card}
            onPress={() => handleSelectRole("parent")}
            mode="elevated"
          >
            <Card.Content style={styles.cardContent}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: Colors.success + "20" },
                ]}
              >
                <Ionicons name="people" size={48} color={Colors.success} />
              </View>
              <Text variant="headlineSmall" style={styles.cardTitle}>
                Phụ huynh
              </Text>
              <Text variant="bodyMedium" style={styles.cardDescription}>
                Tôi là phụ huynh, muốn theo dõi tiến độ học tập và phát triển
                của con
              </Text>
              <View style={styles.features}>
                <FeatureItem text="Xem thông tin con em" />
                <FeatureItem text="Theo dõi phiên học" />
                <FeatureItem text="Xem báo cáo tiến độ" />
                <FeatureItem text="Giao tiếp với giáo viên" />
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
      <Text variant="bodySmall" style={styles.featureText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.text.secondary,
    textAlign: "center",
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
  },
  cardContent: {
    padding: 16,
    alignItems: "center",
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    color: Colors.text.primary,
  },
  cardDescription: {
    textAlign: "center",
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  features: {
    width: "100%",
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    color: Colors.text.secondary,
    flex: 1,
  },
});
