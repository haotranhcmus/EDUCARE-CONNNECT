import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

// Types from database
type UserCustomContent =
  Database["public"]["Tables"]["user_custom_content"]["Row"];
type UserCustomContentInsert =
  Database["public"]["Tables"]["user_custom_content"]["Insert"];
type UserCustomContentUpdate =
  Database["public"]["Tables"]["user_custom_content"]["Update"];

// Query filters
export interface CustomContentFilters {
  domain?: string;
  is_favorite?: boolean;
  search?: string;
}

class UserCustomContentService {
  /**
   * Get user's custom content
   */
  async getMyCustomContent(
    profileId: string,
    filters?: CustomContentFilters
  ): Promise<UserCustomContent[]> {
    let query = supabase
      .from("user_custom_content")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null)
      .order("last_used_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (filters?.domain) {
      query = query.eq("domain", filters.domain);
    }

    if (filters?.is_favorite !== undefined) {
      query = query.eq("is_favorite", filters.is_favorite);
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Get single custom content by ID
   */
  async getCustomContentById(id: string): Promise<UserCustomContent | null> {
    const { data, error } = await supabase
      .from("user_custom_content")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data;
  }

  /**
   * Create new custom content
   */
  async createCustomContent(
    data: Omit<UserCustomContentInsert, "id" | "created_at" | "updated_at">
  ): Promise<UserCustomContent> {
    const { data: created, error } = await supabase
      .from("user_custom_content")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return created;
  }

  /**
   * Update custom content
   */
  async updateCustomContent(
    id: string,
    updates: UserCustomContentUpdate
  ): Promise<UserCustomContent> {
    const { data, error } = await supabase
      .from("user_custom_content")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Soft delete custom content
   */
  async deleteCustomContent(id: string): Promise<void> {
    const { error } = await supabase
      .from("user_custom_content")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const { error } = await supabase
      .from("user_custom_content")
      .update({ is_favorite: isFavorite })
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Increment usage count
   */
  async incrementUsage(id: string): Promise<void> {
    const { error } = await supabase.rpc("increment_custom_content_usage", {
      content_id: id,
    });

    if (error) throw error;
  }

  /**
   * Duplicate custom content
   */
  async duplicateContent(
    id: string,
    profileId: string
  ): Promise<UserCustomContent> {
    const original = await this.getCustomContentById(id);
    if (!original) throw new Error("Content not found");

    const duplicate: Omit<
      UserCustomContentInsert,
      "id" | "created_at" | "updated_at"
    > = {
      profile_id: profileId,
      title: `${original.title} (Copy)`,
      domain: original.domain,
      description: original.description,
      materials_needed: original.materials_needed,
      estimated_duration: original.estimated_duration,
      instructions: original.instructions,
      tips: original.tips,
      default_goals: original.default_goals,
      tags: original.tags,
      is_favorite: false,
      usage_count: 0,
    };

    return this.createCustomContent(duplicate);
  }
}

export const userCustomContentService = new UserCustomContentService();
export type { UserCustomContent, UserCustomContentInsert };
