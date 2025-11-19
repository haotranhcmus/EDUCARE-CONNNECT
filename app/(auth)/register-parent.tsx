import { Colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, Text } from "react-native-paper";

export default function ParentRegisterScreen() {
  const openGuide = () => {
    Linking.openURL(
      "https://github.com/yourusername/educare-connect/wiki/Teacher-Guide-Send-Parent-Invitation"
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Đăng ký Phụ huynh",
          headerStyle: {
            backgroundColor: Colors.success,
          },
          headerTintColor: "#fff",
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <View style={styles.illustrationContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail" size={64} color="#6750A4" />
            </View>
          </View>

          <View style={styles.messageContainer}>
            <Text variant="headlineMedium" style={styles.title}>
              Không thể tự đăng ký
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Tài khoản phụ huynh cần được giáo viên tạo và gửi thông tin đăng
              nhập
            </Text>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="person" size={24} color="#6750A4" />
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Dành cho Phụ huynh
                </Text>
              </View>

              <View style={styles.stepContainer}>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Liên hệ với giáo viên của con bạn
                  </Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Yêu cầu giáo viên tạo tài khoản cho bạn
                  </Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Nhận thông tin đăng nhập (email và mật khẩu tạm) từ giáo
                    viên qua SMS/Zalo
                  </Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Đăng nhập và tạo mật khẩu mới của riêng bạn
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="school" size={24} color="#6750A4" />
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Dành cho Giáo viên
                </Text>
              </View>

              <View style={styles.stepContainer}>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Vào mục <Text style={styles.bold}>Học sinh</Text> trong app
                  </Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Chọn học sinh cần kết nối với phụ huynh
                  </Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Nhấn tab <Text style={styles.bold}>Phụ huynh</Text>
                  </Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Nhấn <Text style={styles.bold}>+ Mời phụ huynh</Text> và
                    điền email phụ huynh
                  </Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>5</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Hệ thống tạo tài khoản và hiển thị thông tin đăng nhập
                  </Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>6</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Gửi thông tin đăng nhập cho phụ huynh qua SMS/Zalo
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.guideButton} onPress={openGuide}>
                <Ionicons name="book-outline" size={20} color="#6750A4" />
                <Text style={styles.guideButtonText}>
                  Xem hướng dẫn chi tiết
                </Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>

          <Card style={[styles.card, styles.infoCard]}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle" size={24} color="#0288D1" />
                <Text
                  variant="titleMedium"
                  style={[styles.cardTitle, { color: "#0288D1" }]}
                >
                  Tại sao không cho tự đăng ký?
                </Text>
              </View>

              <View style={styles.infoContent}>
                <View style={styles.infoItem}>
                  <Ionicons name="shield-checkmark" size={20} color="#0288D1" />
                  <Text style={styles.infoText}>
                    <Text style={styles.bold}>Bảo mật:</Text> Đảm bảo chỉ phụ
                    huynh thật sự được giáo viên xác nhận mới có tài khoản
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="link" size={20} color="#0288D1" />
                  <Text style={styles.infoText}>
                    <Text style={styles.bold}>Liên kết đúng:</Text> Giáo viên
                    kiểm soát mối quan hệ phụ huynh-học sinh
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="lock-closed" size={20} color="#0288D1" />
                  <Text style={styles.infoText}>
                    <Text style={styles.bold}>Quyền riêng tư:</Text> Bảo vệ
                    thông tin nhạy cảm của học sinh khỏi truy cập trái phép
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Button
            mode="outlined"
            onPress={() => router.replace("/(auth)/login")}
            style={styles.backButton}
            icon="arrow-left"
          >
            Quay lại đăng nhập
          </Button>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
  },
  illustrationContainer: {
    alignItems: "center",
    marginVertical: 32,
  },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#E8DEF8",
    justifyContent: "center",
    alignItems: "center",
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  card: {
    marginBottom: 16,
    backgroundColor: "#fff",
    elevation: 2,
  },
  infoCard: {
    backgroundColor: "#E3F2FD",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 12,
    fontWeight: "600",
    color: "#6750A4",
  },
  stepContainer: {
    gap: 12,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6750A4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text.primary,
  },
  bold: {
    fontWeight: "600",
    color: "#6750A4",
  },
  guideButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    padding: 12,
    backgroundColor: "#E8DEF8",
    borderRadius: 8,
  },
  guideButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#6750A4",
  },
  infoContent: {
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#01579B",
    marginLeft: 12,
  },
  backButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});
