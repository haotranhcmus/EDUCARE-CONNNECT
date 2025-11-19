import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/src/stores/authStore";
import {
  pickImageFromGallery,
  requestImagePermissions,
  takePhoto,
  uploadTeacherAvatar,
} from "@/src/utils/uploadImage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Avatar,
  Button,
  Card,
  Divider,
  IconButton,
  List,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";

export default function ProfileScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const { profile, user, setProfile } = useAuthStore();
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);

  // Scroll to top when tab is focused
  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/(auth)/login" as any);
        },
      },
    ]);
  };

  const handleChangeAvatar = async (source: "gallery" | "camera") => {
    if (!user) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
      return;
    }

    try {
      const permissions = await requestImagePermissions();
      if (source === "camera" && !permissions.camera) {
        Alert.alert("Lỗi", "Cần quyền truy cập camera");
        return;
      }
      if (source === "gallery" && !permissions.gallery) {
        Alert.alert("Lỗi", "Cần quyền truy cập thư viện ảnh");
        return;
      }

      const result =
        source === "gallery" ? await pickImageFromGallery() : await takePhoto();

      if (result) {
        setUploading(true);
        const avatarUrl = await uploadTeacherAvatar(result.uri, user.id);

        // Update profile in database
        const { error } = await supabase
          .from("profiles")
          .update({ avatar_url: avatarUrl })
          .eq("id", user.id);

        if (error) throw error;

        // Update local state
        if (profile) {
          setProfile({ ...profile, avatar_url: avatarUrl });
        }

        Alert.alert("Thành công", "Đã cập nhật ảnh đại diện");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật ảnh đại diện");
    } finally {
      setUploading(false);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      "Đổi ảnh đại diện",
      "Bạn muốn chụp ảnh mới hay chọn từ thư viện?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Chụp ảnh",
          onPress: () => handleChangeAvatar("camera"),
        },
        {
          text: "Thư viện",
          onPress: () => handleChangeAvatar("gallery"),
        },
      ]
    );
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  const getInitials = () => {
    const first = profile.first_name?.charAt(0) || "";
    const last = profile.last_name?.charAt(0) || "";
    return `${first}${last}`.toUpperCase();
  };

  const getRoleName = () => {
    return profile.role === "teacher" ? "Giáo viên" : "Phụ huynh";
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Card */}
      <Surface
        style={[styles.header, { backgroundColor: theme.colors.primary }]}
      >
        <Pressable
          style={styles.avatarSection}
          onPress={showImagePicker}
          disabled={uploading}
        >
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <Avatar.Text size={100} label={getInitials()} />
          )}

          <IconButton
            icon="camera"
            size={24}
            iconColor="#fff"
            style={styles.cameraButton}
            onPress={showImagePicker}
            disabled={uploading}
          />
        </Pressable>

        <Text variant="headlineMedium" style={styles.name}>
          {profile.first_name} {profile.last_name}
        </Text>
        <Text variant="bodyLarge" style={styles.role}>
          {getRoleName()}
        </Text>
      </Surface>

      {/* Profile Information */}
      <Card style={styles.card}>
        <Card.Title title="Thông tin cá nhân" />
        <Card.Content>
          <List.Item
            title="Email"
            description={profile.email}
            left={(props) => <List.Icon {...props} icon="email" />}
          />
          <Divider />
          <List.Item
            title="Số điện thoại"
            description={profile.phone || "Chưa cập nhật"}
            left={(props) => <List.Icon {...props} icon="phone" />}
          />
          {profile.role === "teacher" && profile.school && (
            <>
              <Divider />
              <List.Item
                title="Trường"
                description={profile.school}
                left={(props) => <List.Icon {...props} icon="school" />}
              />
            </>
          )}
          {profile.role === "parent" && (
            <>
              {(profile as any).occupation && (
                <>
                  <Divider />
                  <List.Item
                    title="Nghề nghiệp"
                    description={(profile as any).occupation}
                    left={(props) => <List.Icon {...props} icon="briefcase" />}
                  />
                </>
              )}
              {(profile as any).address && (
                <>
                  <Divider />
                  <List.Item
                    title="Địa chỉ"
                    description={(profile as any).address}
                    left={(props) => <List.Icon {...props} icon="map-marker" />}
                  />
                </>
              )}
            </>
          )}
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={styles.card}>
        <Card.Title title="Cài đặt" />
        <Card.Content>
          <List.Item
            title="Ngôn ngữ"
            description={
              (profile as any).language === "vi" ? "Tiếng Việt" : "English"
            }
            left={(props) => <List.Icon {...props} icon="translate" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // TODO: Implement language settings
              Alert.alert("Thông báo", "Tính năng đang phát triển");
            }}
          />
          <Divider />
          <List.Item
            title="Múi giờ"
            description={(profile as any).timezone || "Asia/Ho_Chi_Minh"}
            left={(props) => <List.Icon {...props} icon="clock-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // TODO: Implement timezone settings
              Alert.alert("Thông báo", "Tính năng đang phát triển");
            }}
          />
        </Card.Content>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          icon="pencil"
          onPress={() =>
            Alert.alert(
              "Thông báo",
              "Tính năng chỉnh sửa hồ sơ đang phát triển"
            )
          }
          style={styles.actionButton}
        >
          Chỉnh sửa hồ sơ
        </Button>

        <Button
          mode="contained"
          icon="logout"
          onPress={handleLogout}
          style={styles.actionButton}
          buttonColor={theme.colors.error}
        >
          Đăng xuất
        </Button>
      </View>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.footerText}>
          Phiên bản 1.0.0
        </Text>
        <Text variant="bodySmall" style={styles.footerText}>
          © 2024 Educare Connect
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
  },
  avatarSection: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
  },
  cameraButton: {
    position: "absolute",
    bottom: -8,
    right: -8,
    backgroundColor: "#6366F1",
  },
  name: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  role: {
    color: "#E0E7FF",
    textAlign: "center",
    marginTop: 4,
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  footer: {
    alignItems: "center",
    padding: 24,
    paddingBottom: 40,
  },
  footerText: {
    color: "#999",
    marginBottom: 4,
  },
});
