import { supabase } from "../../lib/supabase/client";
import {
  BehaviorIncidentData,
  CreateSessionData,
  GoalEvaluationData,
  Session,
  SessionContent,
  SessionContentData,
  SessionFilters,
  SessionLogData,
  SessionLogWithDetails,
  SessionWithDetails,
  UpdateSessionData,
} from "../types/session.types";
import { getCurrentTimeString } from "../utils/time";
import { calculateTimeSlot } from "../utils/timeSlot";

class SessionService {
  // ============================================================================
  // SESSION CRUD
  // ============================================================================

  /**
   * Get sessions with optional filters
   */
  async getSessions(filters?: SessionFilters): Promise<SessionWithDetails[]> {
    let query = supabase
      .from("sessions")
      .select(
        `
        *,
        student:students!sessions_student_id_fkey (
          id,
          first_name,
          last_name,
          nickname,
          date_of_birth
        ),
        session_contents (
          id
        ),
        session_logs (
          id
        )
      `
      )
      .is("deleted_at", null) // Filter out soft-deleted sessions
      .order("session_date", { ascending: false })
      .order("start_time", { ascending: true });

    if (filters?.student_id) {
      query = query.eq("student_id", filters.student_id);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.from_date) {
      query = query.gte("session_date", filters.from_date);
    }

    if (filters?.to_date) {
      query = query.lte("session_date", filters.to_date);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Add computed fields
    return (data || []).map((session: any) => ({
      ...session,
      content_count: session.session_contents?.length || 0,
      has_log: session.session_logs?.length > 0,
    }));
  }

  /**
   * Get single session by ID with full details
   */
  async getSession(id: string): Promise<SessionWithDetails> {
    const { data, error } = await supabase
      .from("sessions")
      .select(
        `
        *,
        student:students!sessions_student_id_fkey (
          id,
          first_name,
          last_name,
          nickname,
          date_of_birth
        ),
        session_contents (
          *
        ),
        session_logs (
          *
        )
      `
      )
      .eq("id", id)
      .is("deleted_at", null) // Filter out soft-deleted sessions
      .single();

    if (error) throw error;

    return {
      ...data,
      content_count: data.session_contents?.length || 0,
      has_log: !!data.session_logs,
      session_log: data.session_logs || null,
    } as SessionWithDetails;
  }

  /**
   * Get sessions for calendar view (date range)
   */
  async getCalendarSessions(
    startDate: string,
    endDate: string,
    studentId?: string
  ): Promise<SessionWithDetails[]> {
    let query = supabase
      .from("sessions")
      .select(
        `
        *,
        student:students!sessions_student_id_fkey (
          id,
          first_name,
          last_name,
          nickname,
          date_of_birth
        ),
        session_contents (
          id
        ),
        session_logs (
          id
        )
      `
      )
      .is("deleted_at", null) // Filter out soft-deleted sessions
      .gte("session_date", startDate)
      .lte("session_date", endDate)
      .order("session_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((session: any) => ({
      ...session,
      content_count: session.session_contents?.length || 0,
      has_log: session.session_logs?.length > 0,
    }));
  }

  /**
   * Create a new session
   */
  async createSession(data: CreateSessionData): Promise<Session> {
    const { data: session, error } = await supabase
      .from("sessions")
      .insert({
        student_id: data.student_id,
        session_date: data.session_date,
        start_time: data.start_time,
        end_time: data.end_time,
        location: data.location || null,
        notes: data.notes || null,
        status: "scheduled",
        created_by: data.created_by,
        time_slot: data.time_slot || calculateTimeSlot(data.start_time),
      })
      .select()
      .single();

    if (error) throw error;
    return session as Session;
  }

  /**
   * Update an existing session
   */
  async updateSession(id: string, data: UpdateSessionData): Promise<Session> {
    const { data: session, error } = await supabase
      .from("sessions")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return session as Session;
  }

  /**
   * Cancel a session
   */
  async cancelSession(id: string, reason: string): Promise<Session> {
    const { data: session, error } = await supabase
      .from("sessions")
      .update({
        status: "cancelled",
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return session as Session;
  }

  /**
   * Delete a session
   */
  /**
   * Delete a session (soft delete using RPC function)
   */
  async deleteSession(id: string): Promise<void> {
    try {
      // Use RPC function that bypasses RLS with SECURITY DEFINER
      const { data, error } = await supabase.rpc("soft_delete_session" as any, {
        session_id: id,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  // ============================================================================
  // SESSION CONTENT
  // ============================================================================

  /**
   * Add content to a session (với hỗ trợ multiple goals)
   */
  async addContentToSession(data: SessionContentData): Promise<SessionContent> {
    // Get max order_index for this session to avoid duplicates
    const { data: existingContents } = await supabase
      .from("session_contents")
      .select("order_index")
      .eq("session_id", data.session_id)
      .order("order_index", { ascending: false })
      .limit(1);

    const nextOrderIndex =
      data.order_index ||
      (existingContents && existingContents.length > 0
        ? existingContents[0].order_index + 1
        : 1);

    // Insert session content
    const { data: content, error: contentError } = await supabase
      .from("session_contents")
      .insert({
        session_id: data.session_id,
        content_library_id: data.content_library_id || null,
        user_custom_content_id: data.user_custom_content_id || null,
        title: data.title,
        domain: data.domain,
        description: data.description || null,
        materials_needed: data.materials_needed || null,
        estimated_duration: data.estimated_duration || null,
        instructions: data.instructions || null,
        tips: data.tips || null,
        order_index: nextOrderIndex,
        notes: data.notes || null,
      })
      .select()
      .single();

    if (contentError) throw contentError;
    if (!content) throw new Error("Failed to create session content");

    // Insert goals if provided
    if (data.goals && data.goals.length > 0) {
      const goalsToInsert = data.goals.map((goal) => ({
        session_content_id: content.id,
        description: goal.description,
        goal_type: goal.goal_type,
        is_primary: goal.is_primary || false,
        order_index: goal.order_index,
      }));

      const { error: goalsError } = await supabase
        .from("session_content_goals")
        .insert(goalsToInsert);

      if (goalsError) {
        // Rollback: delete the content if goals failed
        await supabase.from("session_contents").delete().eq("id", content.id);
        throw goalsError;
      }
    }

    return content as SessionContent;
  }

  /**
   * Update content order in a session
   */
  async updateContentOrder(
    sessionId: string,
    updates: Array<{ id: string; order_index: number }>
  ): Promise<void> {
    // Execute updates in parallel
    const promises = updates.map(({ id, order_index }) =>
      supabase
        .from("session_contents")
        .update({ order_index })
        .eq("id", id)
        .eq("session_id", sessionId)
    );

    const results = await Promise.all(promises);

    const errors = results.filter((r: any) => r.error).map((r: any) => r.error);
    if (errors.length > 0) throw errors[0];
  }

  /**
   * Remove content from a session
   */
  async removeContentFromSession(contentId: string): Promise<void> {
    // Delete goals first (cascade)
    await supabase
      .from("session_content_goals")
      .delete()
      .eq("session_content_id", contentId);

    const { error } = await supabase
      .from("session_contents")
      .delete()
      .eq("id", contentId);

    if (error) throw error;
  }

  /**
   * Update content goals for a session content
   */
  async updateContentGoals(contentId: string, goals: string[]): Promise<void> {
    // Delete existing goals
    const { error: deleteError } = await supabase
      .from("session_content_goals")
      .delete()
      .eq("session_content_id", contentId);

    if (deleteError) {
      throw deleteError;
    }

    // Insert new goals
    if (goals.length > 0) {
      const goalsToInsert = goals.map((goalDescription, index) => ({
        session_content_id: contentId,
        description: goalDescription,
        goal_type: "knowledge", // Valid values: 'knowledge', 'skill', 'behavior'
        is_primary: index === 0, // First goal is primary
        order_index: index,
      }));

      const { error: goalsError } = await supabase
        .from("session_content_goals")
        .insert(goalsToInsert);

      if (goalsError) {
        throw goalsError;
      }
    }
  }

  /**
   * Get session contents with goals
   */
  async getSessionContents(sessionId: string): Promise<SessionContent[]> {
    const { data: contents, error: contentsError } = await supabase
      .from("session_contents")
      .select(
        `
        *,
        content_library:content_library_id (
          domain,
          description,
          target_age_min,
          target_age_max,
          difficulty_level,
          materials_needed,
          estimated_duration,
          instructions,
          tips,
          default_goals
        ),
        user_custom_content:user_custom_content_id (
          domain,
          description,
          materials_needed,
          estimated_duration,
          instructions,
          tips,
          default_goals
        )
      `
      )
      .eq("session_id", sessionId)
      .order("order_index", { ascending: true });

    if (contentsError) throw contentsError;
    if (!contents) return [];

    // Fetch goals for each content
    const contentsWithGoals = await Promise.all(
      contents.map(async (content) => {
        const { data: goals } = await supabase
          .from("session_content_goals")
          .select("*")
          .eq("session_content_id", content.id)
          .order("order_index", { ascending: true });

        return {
          ...content,
          goals: goals || [],
        } as SessionContent;
      })
    );

    return contentsWithGoals;
  }

  // ============================================================================
  // SESSION LOGGING
  // ============================================================================

  /**
   * Start a session (create session log)
   */
  async startSession(sessionId: string, createdBy: string): Promise<void> {
    const { error } = await supabase.from("session_logs").insert({
      session_id: sessionId,
      actual_start_time: getCurrentTimeString(),
      created_by: createdBy,
    });

    if (error) throw error;
  }

  /**
   * Update session log during the session
   */
  async updateSessionLog(
    sessionId: string,
    data: Partial<SessionLogData>
  ): Promise<void> {
    const { error } = await supabase
      .from("session_logs")
      .update(data)
      .eq("session_id", sessionId);

    if (error) throw error;
  }

  /**
   * Complete a session
   */
  async completeSession(sessionId: string): Promise<void> {
    // Update session log with end time
    const { error: logError } = await supabase
      .from("session_logs")
      .update({
        actual_end_time: getCurrentTimeString(),
        completed_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId);

    if (logError) throw logError;

    // Update session status to completed
    const { error: sessionError } = await supabase
      .from("sessions")
      .update({ status: "completed", has_evaluation: true })
      .eq("id", sessionId);

    if (sessionError) throw sessionError;
  }

  /**
   * Get session log by session ID
   */
  async getSessionLog(
    sessionId: string
  ): Promise<SessionLogWithDetails | null> {
    // First, get the session log
    const { data: sessionLogData, error: logError } = await supabase
      .from("session_logs")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (logError) throw logError;
    if (!sessionLogData) return null;

    // Then get related data separately
    const [behaviorResult, mediaResult, evaluationResult] = await Promise.all([
      // Get behavior incidents
      supabase
        .from("behavior_incidents")
        .select(
          `
          *,
          behavior_library:behavior_library_id (
            name_vn,
            name_en,
            icon
          )
        `
        )
        .eq("session_log_id", sessionLogData.id),

      // Get session media
      supabase
        .from("session_media")
        .select("*")
        .eq("session_log_id", sessionLogData.id),

      // Get goal evaluations
      supabase
        .from("goal_evaluations")
        .select("*")
        .eq("session_log_id", sessionLogData.id),
    ]);

    if (behaviorResult.error) {
      throw behaviorResult.error;
    }
    if (mediaResult.error) {
      throw mediaResult.error;
    }
    if (evaluationResult.error) {
      throw evaluationResult.error;
    }

    // Combine all data
    const data: SessionLogWithDetails = {
      ...sessionLogData,
      behavior_incidents: behaviorResult.data || [],
      session_media: mediaResult.data || [],
      goal_evaluations: evaluationResult.data || [],
    };

    return data;
  }

  /**
   * Delete a session log (soft delete or hard delete)
   */
  async deleteSessionLog(sessionId: string): Promise<void> {
    // First, delete related data
    const { data: sessionLog } = await supabase
      .from("session_logs")
      .select("id")
      .eq("session_id", sessionId)
      .single();

    if (sessionLog) {
      // Delete goal evaluations
      await supabase
        .from("goal_evaluations")
        .delete()
        .eq("session_log_id", sessionLog.id);

      // Delete behavior incidents
      await supabase
        .from("behavior_incidents")
        .delete()
        .eq("session_log_id", sessionLog.id);

      // Delete media attachments
      await supabase
        .from("session_media")
        .delete()
        .eq("session_log_id", sessionLog.id);

      // Finally, delete the session log
      const { error } = await supabase
        .from("session_logs")
        .delete()
        .eq("session_id", sessionId);

      if (error) throw error;

      // Update session to remove evaluation flag
      await supabase
        .from("sessions")
        .update({ has_evaluation: false, status: "scheduled" })
        .eq("id", sessionId);
    }
  }

  /**
   * Reset session log to allow re-evaluation
   */
  async resetSessionLog(sessionId: string): Promise<void> {
    await this.deleteSessionLog(sessionId);
  }

  // ============================================================================
  // BEHAVIOR INCIDENTS
  // ============================================================================

  /**
   * Add a behavior incident to session log
   */
  async addBehaviorIncident(data: BehaviorIncidentData): Promise<void> {
    const { error } = await supabase.from("behavior_incidents").insert({
      session_log_id: data.session_log_id,
      incident_number: data.incident_number,
      occurred_at: data.occurred_at,
      behavior_description: data.behavior_description,
      recorded_by: data.recorded_by,
      antecedent: data.antecedent || null,
      consequence: data.consequence || null,
      intervention_used: data.intervention_used || null,
      intensity_level: data.intensity_level || null,
      intervention_effective: data.intervention_effective || null,
      duration_minutes: data.duration_minutes || null,
      behavior_library_id: data.behavior_library_id || null,
      environmental_factors: data.environmental_factors || null,
      frequency_count: data.frequency_count || null,
      notes: data.notes || null,
      requires_followup: data.requires_followup || false,
    });

    if (error) throw error;
  }

  /**
   * Update a behavior incident
   */
  async updateBehaviorIncident(
    id: string,
    data: Partial<BehaviorIncidentData>
  ): Promise<void> {
    const { error } = await supabase
      .from("behavior_incidents")
      .update(data)
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Delete a behavior incident
   */
  async deleteBehaviorIncident(id: string): Promise<void> {
    const { error } = await supabase
      .from("behavior_incidents")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  // ============================================================================
  // GOAL EVALUATIONS
  // ============================================================================

  /**
   * Add a goal evaluation to session content
   */
  async addGoalEvaluation(data: GoalEvaluationData): Promise<void> {
    const { error } = await supabase.from("goal_evaluations").insert({
      session_log_id: data.session_log_id,
      content_goal_id: data.content_goal_id,
      status: data.status,
      achievement_level: data.achievement_level || null,
      support_level: data.support_level || null,
      notes: data.notes || null,
    });

    if (error) throw error;
  }

  /**
   * Update a goal evaluation
   */
  async updateGoalEvaluation(
    id: string,
    data: Partial<GoalEvaluationData>
  ): Promise<void> {
    const { error } = await supabase
      .from("goal_evaluations")
      .update(data)
      .eq("id", id);

    if (error) throw error;
  }

  // ============================================================================
  // MEDIA UPLOAD
  // ============================================================================

  /**
   * Upload media to session log
   */
  async uploadMedia(
    sessionLogId: string,
    file: File,
    uploadedBy: string
  ): Promise<void> {
    // Upload file to Supabase Storage
    const fileName = `${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("session-media")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("session-media").getPublicUrl(fileName);

    // Create media record
    const mediaType = file.type.startsWith("video") ? "video" : "photo";

    const { error: insertError } = await supabase.from("session_media").insert({
      session_log_id: sessionLogId,
      media_type: mediaType,
      url: publicUrl,
      uploaded_by: uploadedBy,
    });

    if (insertError) throw insertError;
  }

  /**
   * Delete media from session log
   */
  async deleteMedia(id: string, url: string): Promise<void> {
    // Extract filename from URL
    const fileName = url.split("/").pop();

    if (fileName) {
      // Delete from storage
      await supabase.storage.from("session-media").remove([fileName]);
    }

    // Delete record
    const { error } = await supabase
      .from("session_media")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}

export const sessionService = new SessionService();
