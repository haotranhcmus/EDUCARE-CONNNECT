import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

// Types from database
type StudentParent = Database["public"]["Tables"]["student_parents"]["Row"];
type StudentParentInsert =
  Database["public"]["Tables"]["student_parents"]["Insert"];
type StudentParentUpdate =
  Database["public"]["Tables"]["student_parents"]["Update"];
type ParentMessage = Database["public"]["Tables"]["parent_messages"]["Row"];
type ParentMessageInsert =
  Database["public"]["Tables"]["parent_messages"]["Insert"];

// Parent permissions type
export interface ParentPermissions {
  can_view_sessions: boolean;
  can_view_session_logs: boolean;
  can_view_goal_evaluations: boolean;
  can_view_behavior_incidents: boolean;
  can_view_media: boolean;
  can_message_teacher: boolean;
  can_receive_notifications: boolean;
}

// Default permissions for new invitations
export const DEFAULT_PARENT_PERMISSIONS: ParentPermissions = {
  can_view_sessions: true,
  can_view_session_logs: true,
  can_view_goal_evaluations: true,
  can_view_behavior_incidents: false, // Sensitive - default to false
  can_view_media: true,
  can_message_teacher: true,
  can_receive_notifications: true,
};

// Extended types with relations
export interface ParentLinkWithProfile extends StudentParent {
  parent_profile?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
    phone?: string;
  };
  student?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface MessageWithProfiles extends ParentMessage {
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  recipient?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  student?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

// Request types
export interface InviteParentRequest {
  student_id: string;
  parent_email: string;
  relationship: "mother" | "father" | "guardian" | "other";
  relationship_note?: string;
  permissions?: Partial<ParentPermissions>;
}

export interface UpdatePermissionsRequest {
  link_id: string;
  permissions: Partial<ParentPermissions>;
}

export interface SendMessageRequest {
  student_id: string;
  recipient_id: string;
  subject?: string;
  message: string;
  reply_to_message_id?: string;
}

class ParentService {
  /**
   * Invite a parent to link with a student
   * Only teachers can invite parents for their students
   */
  async inviteParent(request: InviteParentRequest): Promise<StudentParent> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Bạn cần đăng nhập để mời phụ huynh");
    }

    // Verify teacher owns this student
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, profile_id")
      .eq("id", request.student_id)
      .eq("profile_id", user.id)
      .single();

    if (studentError || !student) {
      throw new Error("Không tìm thấy học sinh hoặc bạn không có quyền");
    }

    // Check if email already invited for this student (exclude soft-deleted)
    const { data: existing } = await supabase
      .from("student_parents")
      .select("id, status, deleted_at")
      .eq("student_id", request.student_id)
      .eq("parent_email", request.parent_email)
      .is("deleted_at", null)
      .maybeSingle();

    if (existing) {
      if (existing.status === "active") {
        throw new Error("Email này đã được liên kết với học sinh");
      } else if (existing.status === "invited") {
        throw new Error("Email này đã được mời trước đó");
      }
    }

    // Check if there's a soft-deleted record we can restore
    const { data: deletedRecord } = await supabase
      .from("student_parents")
      .select("id")
      .eq("student_id", request.student_id)
      .eq("parent_email", request.parent_email)
      .not("deleted_at", "is", null)
      .maybeSingle();

    let linkData;

    if (deletedRecord) {
      // Restore the soft-deleted record instead of creating new

      const permissions = {
        ...DEFAULT_PARENT_PERMISSIONS,
        ...request.permissions,
      };

      const { data, error } = await supabase
        .from("student_parents")
        .update({
          relationship: request.relationship,
          relationship_note: request.relationship_note,
          status: "invited",
          permissions: permissions as any,
          invited_by: user.id,
          invited_at: new Date().toISOString(),
          deleted_at: null, // Restore by clearing deleted_at
          revoked_at: null,
          revoked_by: null,
          revoked_reason: null,
        })
        .eq("id", deletedRecord.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      linkData = data;
    } else {
      // Create new invitation link
      const permissions = {
        ...DEFAULT_PARENT_PERMISSIONS,
        ...request.permissions,
      };

      const { data, error } = await supabase
        .from("student_parents")
        .insert({
          student_id: request.student_id,
          parent_email: request.parent_email,
          relationship: request.relationship,
          relationship_note: request.relationship_note,
          status: "invited",
          permissions: permissions as any,
          invited_by: user.id,
          invited_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      linkData = data;
    }

    // Call Edge Function to create/update parent account
    try {
      const result = await this.sendInvitationEmail(linkData.id);

      // Return data with credentials for UI to display
      if (result?.credentials) {
        return {
          ...linkData,
          credentials: result.credentials,
        };
      }

      return linkData;
    } catch (emailError) {
      throw new Error(
        `Không thể tạo tài khoản phụ huynh: ${
          emailError instanceof Error ? emailError.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Send parent invitation via Edge Function (Supabase Email)
   * NOTE: This will fail if Edge Function is not deployed
   */
  private async sendInvitationEmail(linkId: string): Promise<any> {
    try {
      const response = await supabase.functions.invoke(
        "invite-parent-supabase-email",
        {
          body: { link_id: linkId },
        }
      );

      if (response.error) {
        // Try to parse error body if available
        let errorDetails = null;
        if (response.error.context?._bodyBlob) {
          try {
            const errorBody = await (response.error.context as any).text?.();
            if (errorBody) {
              try {
                errorDetails = JSON.parse(errorBody);
              } catch {
                errorDetails = { message: errorBody };
              }
            }
          } catch (parseError) {
            // Ignore parse errors
          }
        }

        // Check for rate limit (429)
        if (
          response.error.context?.status === 429 ||
          errorDetails?.error?.toLowerCase().includes("rate limit") ||
          errorDetails?.message?.toLowerCase().includes("rate limit")
        ) {
          throw new Error(
            "⏰ Supabase đã giới hạn tạm thời. Vui lòng thử lại sau 1 giờ."
          );
        }

        // Check if it's "already activated" error
        if (
          errorDetails?.error?.includes("already activated") ||
          errorDetails?.message?.includes("already activated") ||
          response.data?.error?.includes("already activated") ||
          response.data?.message?.includes("already activated")
        ) {
          throw new Error(
            "Phụ huynh này đã kích hoạt tài khoản. Không thể gửi lại lời mời."
          );
        }

        // Check if invitation was created successfully despite email error
        if (response.data?.success) {
          return response.data; // Return data even if email failed
        }

        // If we have parsed error details, use that
        if (errorDetails?.error || errorDetails?.message) {
          throw new Error(
            errorDetails.error || errorDetails.message || "Edge Function error"
          );
        }

        // If response.data has error details, use that
        if (response.data?.error || response.data?.message) {
          throw new Error(
            response.data.error ||
              response.data.message ||
              response.error.message
          );
        }

        // Generic error with status code
        throw new Error(
          `Edge Function failed with status ${
            response.error.context?.status || "unknown"
          }: ${response.error.message}`
        );
      }

      return response.data; // Return the data with credentials
    } catch (error: any) {
      // Re-throw to be handled by inviteParent
      throw new Error(
        `Không thể gửi email: ${error.message || "Unknown error"}`
      );
    }
  }

  /**
   * Get all parent links for a student
   */
  async getParentLinks(studentId: string): Promise<ParentLinkWithProfile[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Bạn cần đăng nhập");
    }

    // Verify teacher owns this student
    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("id", studentId)
      .eq("profile_id", user.id)
      .single();

    if (!student) {
      throw new Error("Không tìm thấy học sinh");
    }

    const { data, error } = await supabase
      .from("student_parents")
      .select(
        `
        *,
        parent_profile:profiles!student_parents_parent_id_fkey(
          id,
          first_name,
          last_name,
          email,
          avatar_url,
          phone
        ),
        student:students(
          id,
          first_name,
          last_name
        )
      `
      )
      .eq("student_id", studentId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data as ParentLinkWithProfile[];
  }

  /**
   * Update permissions for a parent link
   */
  async updatePermissions(
    request: UpdatePermissionsRequest
  ): Promise<StudentParent> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Bạn cần đăng nhập");
    }

    // Get the link and verify ownership
    const { data: link, error: linkError } = await supabase
      .from("student_parents")
      .select("*, students!inner(profile_id)")
      .eq("id", request.link_id)
      .single();

    if (linkError || !link) {
      throw new Error("Không tìm thấy liên kết");
    }

    // @ts-ignore - Check teacher owns student
    if (link.students.profile_id !== user.id) {
      throw new Error("Bạn không có quyền cập nhật");
    }

    // Merge permissions
    const currentPermissions = (link.permissions as ParentPermissions) || {};
    const updatedPermissions = {
      ...currentPermissions,
      ...request.permissions,
    };

    const { data, error } = await supabase
      .from("student_parents")
      .update({
        permissions: updatedPermissions as any,
        updated_at: new Date().toISOString(),
      })
      .eq("id", request.link_id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Revoke a parent's access
   */
  async revokeAccess(linkId: string, reason?: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Bạn cần đăng nhập");
    }

    // Get the link and verify ownership
    const { data: link, error: linkError } = await supabase
      .from("student_parents")
      .select("*, students!inner(profile_id)")
      .eq("id", linkId)
      .single();

    if (linkError || !link) {
      throw new Error("Không tìm thấy liên kết");
    }

    // @ts-ignore - Check teacher owns student
    if (link.students.profile_id !== user.id) {
      throw new Error("Bạn không có quyền thu hồi");
    }

    const { error } = await supabase
      .from("student_parents")
      .update({
        status: "revoked",
        revoked_at: new Date().toISOString(),
        revoked_by: user.id,
        revoke_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", linkId);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Reactivate a revoked parent link
   */
  async reactivateLink(linkId: string): Promise<StudentParent> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Bạn cần đăng nhập");
    }

    const { data, error } = await supabase
      .from("student_parents")
      .update({
        status: "active",
        revoked_at: null,
        revoked_by: null,
        revoke_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", linkId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Send a message to a parent
   */
  async sendMessage(request: SendMessageRequest): Promise<ParentMessage> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Bạn cần đăng nhập để gửi tin nhắn");
    }

    const { data, error } = await supabase
      .from("parent_messages")
      .insert({
        student_id: request.student_id,
        sender_id: user.id,
        recipient_id: request.recipient_id,
        subject: request.subject,
        message: request.message,
        parent_thread_id: request.reply_to_message_id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Get messages for a student (conversation with parents)
   */
  async getMessages(studentId: string): Promise<MessageWithProfiles[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Bạn cần đăng nhập");
    }

    const { data, error } = await supabase
      .from("parent_messages")
      .select(
        `
        *,
        sender:profiles!parent_messages_sender_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        ),
        recipient:profiles!parent_messages_recipient_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        ),
        student:students(
          id,
          first_name,
          last_name
        )
      `
      )
      .eq("student_id", studentId)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data as MessageWithProfiles[];
  }

  /**
   * Mark a message as read
   */
  async markMessageAsRead(messageId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Bạn cần đăng nhập");
    }

    const { error } = await supabase
      .from("parent_messages")
      .update({
        is_read: true,
      })
      .eq("id", messageId)
      .eq("recipient_id", user.id); // Only recipient can mark as read

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return 0;
    }

    const { count, error } = await supabase
      .from("parent_messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false);

    if (error) {
      return 0;
    }

    return count || 0;
  }

  /**
   * Delete a parent link (soft delete)
   */
  async deleteLink(linkId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Bạn cần đăng nhập");
    }

    const { error } = await supabase
      .from("student_parents")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", linkId);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get parent's own permissions for a student
   * Used by parent to check what they can view
   */
  async getMyPermissions(studentId: string): Promise<ParentPermissions | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Bạn cần đăng nhập");
    }

    const { data, error } = await supabase
      .from("student_parents")
      .select("permissions")
      .eq("student_id", studentId)
      .eq("parent_id", user.id)
      .eq("status", "active")
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return data.permissions as ParentPermissions;
  }

  /**
   * Get all students that parent has access to with their permissions
   */
  async getMyStudents(): Promise<
    Array<{
      student: any;
      permissions: ParentPermissions;
      relationship: string;
      link_id: string;
    }>
  > {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Bạn cần đăng nhập");
    }

    const { data, error } = await supabase
      .from("student_parents")
      .select(
        `
        id,
        permissions,
        relationship,
        relationship_note,
        student:students!inner(
          id,
          first_name,
          last_name,
          avatar_url,
          date_of_birth,
          gender
        )
      `
      )
      .eq("parent_id", user.id)
      .eq("status", "active")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // Filter out any entries where student is null
    const result =
      data
        ?.filter((link) => {
          const isValid = link.student != null;
          if (!isValid) {
          }
          return isValid;
        })
        .map((link) => ({
          student: link.student,
          permissions: link.permissions as ParentPermissions,
          relationship: link.relationship,
          link_id: link.id,
        })) || [];

    return result;
  }
}

export const parentService = new ParentService();
