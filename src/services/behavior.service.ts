import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

export type BehaviorLibrary =
  Database["public"]["Tables"]["behavior_library"]["Row"];
export type BehaviorGroup =
  Database["public"]["Tables"]["behavior_groups"]["Row"];

/**
 * Get all behavior groups
 */
export async function getBehaviorGroups(): Promise<BehaviorGroup[]> {
  const { data, error } = await supabase
    .from("behavior_groups")
    .select("*")
    .eq("is_active", true)
    .order("order_index")
    .order("name_vn");

  if (error) {
    throw new Error(error.message || "Không thể tải danh sách nhóm hành vi");
  }

  return data || [];
}

/**
 * Get all behaviors from library
 */
export async function getBehaviors(): Promise<BehaviorLibrary[]> {
  const { data, error } = await supabase
    .from("behavior_library")
    .select("*")
    .eq("is_active", true)
    .order("usage_count", { ascending: false, nullsFirst: false })
    .order("name_vn");

  if (error) {
    throw new Error(error.message || "Không thể tải thư viện hành vi");
  }

  return data || [];
}

/**
 * Search behaviors (Vietnamese + English)
 */
export async function searchBehaviors(
  query: string
): Promise<BehaviorLibrary[]> {
  const { data, error } = await supabase
    .from("behavior_library")
    .select("*")
    .eq("is_active", true)
    .or(
      `name_vn.ilike.%${query}%,name_en.ilike.%${query}%,manifestation_vn.ilike.%${query}%,manifestation_en.ilike.%${query}%`
    )
    .order("usage_count", { ascending: false, nullsFirst: false })
    .order("name_vn");

  if (error) {
    throw new Error(error.message || "Không thể tìm kiếm");
  }

  return data || [];
}

export const behaviorService = {
  getBehaviorGroups,
  getBehaviors,
  searchBehaviors,
};
