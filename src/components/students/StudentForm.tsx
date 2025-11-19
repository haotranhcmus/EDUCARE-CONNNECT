import { StudentInsert, StudentUpdate } from "@/src/types";
import {
  pickImageFromGallery,
  requestImagePermissions,
  takePhoto,
} from "@/src/utils/uploadImage";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Divider,
  HelperText,
  IconButton,
  SegmentedButtons,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { z } from "zod";

// Validation schema
const studentSchema = z.object({
  first_name: z.string().min(1, "Vui lòng nhập tên"),
  last_name: z.string().min(1, "Vui lòng nhập họ"),
  nickname: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
  date_of_birth: z.date().optional(),
  diagnosis: z.string().optional(),
  status: z.enum(["active", "paused", "archived"]),
  notes: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  initialData?: Partial<StudentFormData>;
  onSubmit: (data: StudentInsert | StudentUpdate) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  isEditing?: boolean; // Flag để biết đang tạo mới hay sửa
}

export const StudentForm: React.FC<StudentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false, // Default là tạo mới
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [dateText, setDateText] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false); // Track focus state

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      nickname: initialData?.nickname || "",
      gender: initialData?.gender || "male",
      date_of_birth: initialData?.date_of_birth || undefined,
      diagnosis: initialData?.diagnosis || "",
      status: initialData?.status || "active",
      notes: initialData?.notes || "",
    },
  });

  // Initialize dateText from initialData
  React.useEffect(() => {
    if (initialData?.date_of_birth) {
      setDateText(format(initialData.date_of_birth, "dd/MM/yyyy"));
    }
  }, [initialData]);

  const handleFormSubmit = (data: StudentFormData) => {
    const submitData = {
      ...data,
      date_of_birth: data.date_of_birth
        ? format(data.date_of_birth, "yyyy-MM-dd")
        : undefined,
      avatar_url: avatarUri,
    };
    onSubmit(submitData as any);
  };

  const handlePickImage = async (source: "gallery" | "camera") => {
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
        setAvatarUri(result.uri);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể chọn ảnh");
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUri(null);
  };

  const showImagePicker = () => {
    Alert.alert(
      "Chọn ảnh đại diện",
      "Bạn muốn chụp ảnh mới hay chọn từ thư viện?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Chụp ảnh",
          onPress: () => handlePickImage("camera"),
        },
        {
          text: "Thư viện",
          onPress: () => handlePickImage("gallery"),
        },
      ]
    );
  };

  const validateDateFormat = (text: string): boolean => {
    // Check if it matches dd/MM/yyyy pattern
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    return datePattern.test(text);
  };

  const parseDateFromText = (text: string): Date | null => {
    if (!validateDateFormat(text)) {
      return null;
    }

    const parts = text.split("/");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31) return null;
    if (month < 0 || month > 11) return null;
    if (year < 1900 || year > new Date().getFullYear()) return null;

    const date = new Date(year, month, day);

    // Validate the date is real (e.g., not Feb 30)
    if (
      date.getDate() !== day ||
      date.getMonth() !== month ||
      date.getFullYear() !== year
    ) {
      return null;
    }

    return date;
  };

  const handleDateTextChange = (
    text: string,
    onChange: (date: Date) => void
  ) => {
    setDateText(text);

    // Clear error while typing
    if (isFocused) {
      setDateError(null);
    }
  };

  const handleDateBlur = (onChange: (date: Date) => void) => {
    setIsFocused(false);

    // Validate when user leaves the field
    if (!dateText || dateText.length === 0) {
      setDateError("Vui lòng nhập ngày sinh");
      return;
    }

    if (!validateDateFormat(dateText)) {
      setDateError("Sai định dạng! Nhập theo: dd/MM/yyyy (VD: 15/03/2020)");
      return;
    }

    const parsed = parseDateFromText(dateText);
    if (!parsed) {
      setDateError("Ngày không hợp lệ! Kiểm tra lại ngày/tháng/năm");
      return;
    }

    // Valid date - update form value
    onChange(parsed);
    setDateError(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Ảnh đại diện
          </Text>

          <View style={styles.avatarContainer}>
            <Pressable onPress={showImagePicker}>
              {avatarUri ? (
                <View style={styles.avatarWrapper}>
                  <Image source={{ uri: avatarUri }} style={styles.avatar} />
                  <IconButton
                    icon="close-circle"
                    size={24}
                    iconColor="#fff"
                    style={styles.removeButton}
                    onPress={handleRemoveAvatar}
                  />
                </View>
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <IconButton icon="camera" size={32} iconColor="#999" />
                  <Text style={styles.placeholderText}>Thêm ảnh</Text>
                </View>
              )}
            </Pressable>

            <Button
              mode="outlined"
              icon="camera"
              onPress={showImagePicker}
              style={styles.uploadButton}
            >
              {avatarUri ? "Đổi ảnh" : "Chọn ảnh"}
            </Button>
          </View>
        </Surface>

        <Divider style={styles.divider} />

        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Thông tin cơ bản
          </Text>

          <Controller
            control={control}
            name="last_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  label="Họ *"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.last_name}
                  style={styles.input}
                />
                <HelperText type="error" visible={!!errors.last_name}>
                  {errors.last_name?.message}
                </HelperText>
              </>
            )}
          />

          <Controller
            control={control}
            name="first_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  label="Tên *"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.first_name}
                  style={styles.input}
                />
                <HelperText type="error" visible={!!errors.first_name}>
                  {errors.first_name?.message}
                </HelperText>
              </>
            )}
          />

          <Controller
            control={control}
            name="nickname"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Biệt danh"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={styles.input}
              />
            )}
          />

          <Text variant="labelMedium" style={styles.label}>
            Giới tính *
          </Text>
          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <SegmentedButtons
                value={value}
                onValueChange={onChange}
                buttons={[
                  { value: "male", label: "Nam" },
                  { value: "female", label: "Nữ" },
                  { value: "other", label: "Khác" },
                ]}
                style={styles.input}
              />
            )}
          />

          <Controller
            control={control}
            name="date_of_birth"
            render={({ field: { onChange, value } }) => {
              // Update dateText when value changes from date picker
              React.useEffect(() => {
                if (value && !dateText) {
                  setDateText(format(value, "dd/MM/yyyy"));
                }
              }, [value]);

              return (
                <>
                  <TextInput
                    label="Ngày sinh *"
                    mode="outlined"
                    value={
                      dateText || (value ? format(value, "dd/MM/yyyy") : "")
                    }
                    onChangeText={(text) =>
                      handleDateTextChange(text, onChange)
                    }
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => handleDateBlur(onChange)}
                    placeholder="dd/MM/yyyy"
                    keyboardType="numbers-and-punctuation"
                    error={!!errors.date_of_birth || !!dateError}
                    right={
                      <TextInput.Icon
                        icon="calendar"
                        onPress={() => setShowDatePicker(true)}
                      />
                    }
                    style={styles.input}
                  />
                  {!dateError && !errors.date_of_birth && (
                    <HelperText type="info" visible={true}>
                      Nhập theo định dạng: dd/MM/yyyy (VD: 15/03/2020)
                    </HelperText>
                  )}
                  {dateError && (
                    <HelperText type="error" visible={true}>
                      {dateError}
                    </HelperText>
                  )}
                  {errors.date_of_birth && !dateError && (
                    <HelperText type="error" visible={!!errors.date_of_birth}>
                      {errors.date_of_birth?.message}
                    </HelperText>
                  )}
                  {showDatePicker && (
                    <DateTimePicker
                      value={value || new Date()}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(Platform.OS === "ios");
                        if (selectedDate) {
                          onChange(selectedDate);
                          setDateText(format(selectedDate, "dd/MM/yyyy"));
                          setDateError(null);
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  )}
                </>
              );
            }}
          />

          <Controller
            control={control}
            name="diagnosis"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Chẩn đoán"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={2}
                style={styles.input}
                returnKeyType="done"
                blurOnSubmit={true}
              />
            )}
          />

          {/* Chỉ hiển thị trạng thái khi đang sửa */}
          {isEditing && (
            <>
              <Text variant="labelMedium" style={styles.label}>
                Trạng thái *
              </Text>
              <Controller
                control={control}
                name="status"
                render={({ field: { onChange, value } }) => (
                  <SegmentedButtons
                    value={value}
                    onValueChange={onChange}
                    buttons={[
                      { value: "active", label: "Đang học" },
                      { value: "paused", label: "Tạm dừng" },
                      { value: "archived", label: "Lưu trữ" },
                    ]}
                    style={styles.input}
                  />
                )}
              />
            </>
          )}
        </Surface>

        <Divider style={styles.divider} />

        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Ghi chú
          </Text>

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Ghi chú"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={4}
                style={styles.input}
              />
            )}
          />
        </Surface>

        <View style={styles.actions}>
          {onCancel && (
            <Button
              mode="outlined"
              onPress={onCancel}
              disabled={isLoading}
              style={styles.button}
            >
              Hủy
            </Button>
          )}
          <Button
            mode="contained"
            onPress={handleSubmit(handleFormSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          >
            {initialData ? "Cập nhật" : "Thêm học sinh"}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    margin: 16,
    marginBottom: 0,
    borderRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: "600",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#f44336",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  uploadButton: {
    marginTop: 8,
  },
  input: {
    marginBottom: 8,
  },
  label: {
    marginBottom: 8,
    marginTop: 8,
  },
  divider: {
    marginVertical: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
