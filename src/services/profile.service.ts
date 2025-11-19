import { supabase } from "@/lib/supabase/client";
import type {
  ParentProfile,
  UpdateProfileData,
  UploadAvatarResult,
} from "@/src/types/profile";
import * as FileSystem from "expo-file-system";

/**
 * Profile Service for Parent App
 */
class ProfileService {
  /**
   * Get current parent profile
   */
  async getParentProfile(): Promise<ParentProfile> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .eq("role", "parent")
      .single();

    if (error) throw new Error(error.message);
    return data as ParentProfile;
  }

  /**
   * Update parent profile
   */
  async updateParentProfile(
    updates: UpdateProfileData
  ): Promise<ParentProfile> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as ParentProfile;
  }

  /**
   * Upload avatar to Supabase Storage
   */
  async uploadAvatar(
    fileUri: string,
    fileName: string
  ): Promise<UploadAvatarResult> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    try {
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: "base64" as any,
      });

      // Convert base64 to blob
      const response = await fetch(`data:image/jpeg;base64,${base64}`);
      const blob = await response.blob();

      // Determine content type
      const fileExt = fileName.split(".").pop()?.toLowerCase();
      const contentType = fileExt === "png" ? "image/png" : "image/jpeg";

      // Upload to storage
      const filePath = `${user.id}/${Date.now()}_${fileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, {
          contentType,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update profile with new avatar URL
      await this.updateParentProfile({ avatar_url: publicUrl });

      return {
        url: publicUrl,
        path: filePath,
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to upload avatar");
    }
  }

  /**
   * Delete avatar from storage
   */
  async deleteAvatar(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Get current profile to find avatar path
    const profile = await this.getParentProfile();
    if (!profile.avatar_url) return;

    // Extract path from URL
    const urlParts = profile.avatar_url.split("/avatars/");
    if (urlParts.length < 2) return;
    const filePath = urlParts[1];

    // Delete from storage
    const { error } = await supabase.storage.from("avatars").remove([filePath]);

    if (error) throw error;

    // Update profile to remove avatar URL
    await this.updateParentProfile({ avatar_url: undefined });
  }
}

export const profileService = new ProfileService();
