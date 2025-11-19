import { supabase } from "@/lib/supabase/client";
import * as ImagePicker from "expo-image-picker";

export interface ImagePickerResult {
  uri: string;
  type: string;
  name: string;
}

/**
 * Request camera/gallery permissions
 */
export async function requestImagePermissions() {
  const { status: cameraStatus } =
    await ImagePicker.requestCameraPermissionsAsync();
  const { status: galleryStatus } =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  return {
    camera: cameraStatus === "granted",
    gallery: galleryStatus === "granted",
  };
}

/**
 * Pick an image from gallery
 */
export async function pickImageFromGallery(): Promise<ImagePickerResult | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: asset.type || "image",
      name: asset.fileName || `image-${Date.now()}.jpg`,
    };
  } catch (error) {
    throw new Error("Không thể chọn ảnh");
  }
}

/**
 * Take a photo with camera
 */
export async function takePhoto(): Promise<ImagePickerResult | null> {
  try {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: asset.type || "image",
      name: asset.fileName || `photo-${Date.now()}.jpg`,
    };
  } catch (error) {
    throw new Error("Không thể chụp ảnh");
  }
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadToSupabase(
  imageUri: string,
  bucket: "avatars" | "media",
  path: string
): Promise<string> {
  try {
    // Fetch the image as blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Convert blob to ArrayBuffer
    const arrayBuffer = await new Response(blob).arrayBuffer();

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, arrayBuffer, {
        contentType: blob.type || "image/jpeg",
        upsert: true,
      });

    if (error) {
      throw new Error("Không thể tải ảnh lên");
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    throw error;
  }
}

/**
 * Upload student avatar
 */
export async function uploadStudentAvatar(
  imageUri: string,
  studentId: string
): Promise<string> {
  const fileName = `${studentId}-${Date.now()}.jpg`;
  const path = `students/${fileName}`;
  return uploadToSupabase(imageUri, "avatars", path);
}

/**
 * Upload teacher avatar
 */
export async function uploadTeacherAvatar(
  imageUri: string,
  teacherId: string
): Promise<string> {
  const fileName = `${teacherId}-${Date.now()}.jpg`;
  const path = `teachers/${fileName}`;
  return uploadToSupabase(imageUri, "avatars", path);
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteFromSupabase(
  bucket: "avatars" | "media",
  path: string
): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw new Error("Không thể xóa ảnh");
    }
  } catch (error) {
    throw error;
  }
}
