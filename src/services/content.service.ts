import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

// Types from database
type ContentLibrary = Database["public"]["Tables"]["content_library"]["Row"];
type ContentLibraryInsert =
  Database["public"]["Tables"]["content_library"]["Insert"];
type ContentLibraryUpdate =
  Database["public"]["Tables"]["content_library"]["Update"];

// Domain type for filtering
export type ContentDomain =
  | "cognitive"
  | "motor"
  | "language"
  | "social"
  | "self_care";

// Query filters
export interface ContentFilters {
  domain?: ContentDomain;
  difficulty_level?: "beginner" | "intermediate" | "advanced";
  search?: string;
  is_public?: boolean;
  is_template?: boolean;
  min_age?: number;
  max_age?: number;
  tags?: string[];
}

// Transformed content for UI (matches mock structure)
export interface ContentItem {
  id: string;
  title: string;
  category: string;
  age_range: string;
  description: string;
  domain: string;
  goals: string[];
  difficulty_level?: string;
  materials_needed?: string;
  estimated_duration?: number;
  tags?: string[];
}

class ContentService {
  /**
   * Get all public content library items
   */
  async getContentLibrary(filters?: ContentFilters): Promise<ContentLibrary[]> {
    let query = supabase
      .from("content_library")
      .select("*")
      .is("deleted_at", null)
      .order("title", { ascending: true });

    // Apply filters
    if (filters?.domain) {
      query = query.eq("domain", filters.domain);
    }

    if (filters?.difficulty_level) {
      query = query.eq("difficulty_level", filters.difficulty_level);
    }

    if (filters?.is_public !== undefined) {
      query = query.eq("is_public", filters.is_public);
    }

    if (filters?.is_template !== undefined) {
      query = query.eq("is_template", filters.is_template);
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    if (filters?.min_age) {
      query = query.gte("target_age_max", filters.min_age);
    }

    if (filters?.max_age) {
      query = query.lte("target_age_min", filters.max_age);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get content library items transformed for UI
   * Matches the structure of CONTENT_LIBRARY mock data
   */
  async getContentForUI(filters?: ContentFilters): Promise<ContentItem[]> {
    const contents = await this.getContentLibrary(filters);

    return contents.map((content) => ({
      id: content.id,
      title: content.title,
      category: this.extractCategory(content.tags as any),
      age_range: this.formatAgeRange(
        content.target_age_min,
        content.target_age_max
      ),
      description: content.description || "",
      domain: content.domain,
      goals: this.extractGoals(content.default_goals as any),
      difficulty_level: content.difficulty_level || undefined,
      materials_needed: content.materials_needed || undefined,
      estimated_duration: content.estimated_duration || undefined,
      tags: this.extractTags(content.tags as any),
    }));
  }

  /**
   * Get a single content item by ID
   */
  async getContentById(id: string): Promise<ContentLibrary | null> {
    const { data, error } = await supabase
      .from("content_library")
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
   * Create a new content library item
   */
  async createContent(data: ContentLibraryInsert): Promise<ContentLibrary> {
    const { data: content, error } = await supabase
      .from("content_library")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return content;
  }

  /**
   * Update a content library item
   */
  async updateContent(
    id: string,
    data: ContentLibraryUpdate
  ): Promise<ContentLibrary> {
    const { data: content, error } = await supabase
      .from("content_library")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return content;
  }

  /**
   * Soft delete a content library item
   */
  async deleteContent(id: string): Promise<void> {
    const { error } = await supabase
      .from("content_library")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Increment usage count when content is used
   */
  async incrementUsageCount(id: string): Promise<void> {
    const { error } = await supabase.rpc("increment_content_usage", {
      content_id: id,
    });

    // If RPC doesn't exist, fall back to manual increment
    if (error && error.code === "42883") {
      const content = await this.getContentById(id);
      if (content) {
        await this.updateContent(id, {
          usage_count: (content.usage_count || 0) + 1,
          last_used_at: new Date().toISOString(),
        });
      }
    } else if (error) {
      throw error;
    }
  }

  // Helper methods for data transformation

  private extractGoals(defaultGoals: any): string[] {
    if (!defaultGoals) return [];
    if (Array.isArray(defaultGoals)) return defaultGoals;
    try {
      const parsed =
        typeof defaultGoals === "string"
          ? JSON.parse(defaultGoals)
          : defaultGoals;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private extractTags(tags: any): string[] {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    try {
      const parsed = typeof tags === "string" ? JSON.parse(tags) : tags;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private extractCategory(tags: any): string {
    const tagArray = this.extractTags(tags);
    return tagArray.length > 0 ? tagArray[0] : "General";
  }

  private formatAgeRange(
    minMonths?: number | null,
    maxMonths?: number | null
  ): string {
    if (!minMonths && !maxMonths) return "Tùy chỉnh";

    const minYears = minMonths ? Math.floor(minMonths / 12) : 0;
    const maxYears = maxMonths ? Math.floor(maxMonths / 12) : 0;

    if (minYears === maxYears) {
      return `${minYears} tuổi`;
    } else if (minMonths && maxMonths) {
      return `${minYears}-${maxYears} tuổi`;
    } else if (minMonths) {
      return `Từ ${minYears} tuổi`;
    } else {
      return `Đến ${maxYears} tuổi`;
    }
  }
}

// Export singleton instance
export const contentService = new ContentService();
