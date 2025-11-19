import { supabase } from "@/lib/supabase/client";
import { useParentProfile } from "@/src/hooks/useProfile";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";

export default function ProfileScreen() {
  const { data: profile, isLoading } = useParentProfile();

  const handleLogout = () => {
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
          onPress: () => {
            supabase.auth.signOut().then(() => {
              router.replace("/(auth)/login" as any);
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6750A4" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </View>
    );
  }

  const fullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
      "Phụ huynh"
    : "Phụ huynh";

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => router.push("/(parent)/profile/edit" as any)}
          >
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person" size={48} color="#6750A4" />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>
            {profile?.email || "email@example.com"}
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Thông tin tài khoản</Text>
              <TouchableOpacity
                onPress={() => router.push("/(parent)/profile/edit" as any)}
              >
                <Ionicons name="create-outline" size={20} color="#6750A4" />
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Họ:</Text>
              <Text style={styles.infoValue}>
                {profile?.last_name || "Chưa cập nhật"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Tên:</Text>
              <Text style={styles.infoValue}>
                {profile?.first_name || "Chưa cập nhật"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>
                {profile?.email || "Chưa cập nhật"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Điện thoại:</Text>
              <Text style={styles.infoValue}>
                {profile?.phone || "Chưa cập nhật"}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Cài đặt</Text>

            <Button
              mode="outlined"
              icon="pencil"
              onPress={() => router.push("/(parent)/profile/edit" as any)}
              style={styles.actionButton}
            >
              Cập nhật thông tin
            </Button>

            <Button
              mode="outlined"
              icon="key-outline"
              onPress={() =>
                router.push("/(parent)/profile/change-password" as any)
              }
              style={styles.actionButton}
            >
              Đổi mật khẩu
            </Button>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#d32f2f"
        >
          Đăng xuất
        </Button>
      </View>
    </ScrollView>
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
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  content: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#E8DEF8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6750A4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginLeft: 12,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: "#1a1a1a",
    flex: 1,
  },
  actionButton: {
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
  },
});
