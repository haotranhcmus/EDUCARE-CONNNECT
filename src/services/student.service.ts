import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

// Types from database
type Student = Database["public"]["Tables"]["students"]["Row"];
type StudentInsert = Database["public"]["Tables"]["students"]["Insert"];
type StudentUpdate = Database["public"]["Tables"]["students"]["Update"];

// Query filters
export interface StudentFilters {
  status?: "active" | "paused" | "archived";
  search?: string;
  sortBy?: "created_at" | "first_name" | "date_of_birth";
  sortOrder?: "asc" | "desc";
}

// Service responses
export interface StudentWithStats extends Student {
  total_sessions?: number;
  completed_sessions?: number;
  last_session_date?: string;
}

class StudentService {
  /**
   * Get all students for the current teacher with statistics
   */
  async getStudents(filters?: StudentFilters): Promise<StudentWithStats[]> {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Bạn cần đăng nhập để xem danh sách học sinh");
    }

    let query = supabase
      .from("students")
      .select("*")
      .eq("profile_id", user.id) // Only get students created by this teacher
      .is("deleted_at", null);

    // Apply status filter
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    // Apply search filter (first_name, last_name, nickname)
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(
        `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},nickname.ilike.${searchTerm}`
      );
    }

    // Apply sorting
    const sortBy = filters?.sortBy || "created_at";
    const sortOrder = filters?.sortOrder || "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    const { data: students, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (!students || students.length === 0) {
      return [];
    }

    // Get session statistics for all students in one query
    const studentIds = students.map((s) => s.id);
    const { data: sessions } = await supabase
      .from("sessions")
      .select("id, student_id, status")
      .in("student_id", studentIds)
      .is("deleted_at", null);

    // Calculate statistics for each student
    const studentsWithStats: StudentWithStats[] = students.map((student) => {
      const studentSessions =
        sessions?.filter((s) => s.student_id === student.id) || [];

      const total_sessions = studentSessions.length;
      const completed_sessions = studentSessions.filter(
        (s) => s.status === "completed"
      ).length;

      return {
        ...student,
        total_sessions,
        completed_sessions,
      };
    });

    return studentsWithStats;
  }

  /**
   * Get student by ID with statistics
   */
  async getStudent(id: string): Promise<StudentWithStats | null> {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Bạn cần đăng nhập để xem thông tin học sinh");
    }

    // Get student basic info - only if created by current teacher
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .eq("profile_id", user.id) // Only get student created by this teacher
      .is("deleted_at", null)
      .maybeSingle();

    if (studentError) {
      throw new Error(studentError.message);
    }

    if (!student) {
      return null;
    }

    // Get session statistics
    const { data: sessionStats } = await supabase
      .from("sessions")
      .select("id, status, session_date")
      .eq("student_id", id)
      .is("deleted_at", null);

    const total_sessions = sessionStats?.length || 0;
    const completed_sessions =
      sessionStats?.filter((s) => s.status === "completed").length || 0;
    const last_session_date = sessionStats?.[0]?.session_date || undefined;

    return {
      ...student,
      total_sessions,
      completed_sessions,
      last_session_date,
    };
  }

  /**
   * Create a new student
   */
  async createStudent(data: StudentInsert): Promise<Student> {
    const { data: student, error } = await supabase
      .from("students")
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return student;
  }

  /**
   * Update student information
   */
  async updateStudent(id: string, data: StudentUpdate): Promise<Student> {
    const { data: student, error } = await supabase
      .from("students")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return student;
  }

  /**
   * Soft delete student
   */
  async deleteStudent(id: string): Promise<void> {
    const { error } = await supabase
      .from("students")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Upload student avatar to Supabase Storage
   */
  async uploadAvatar(
    studentId: string,
    file: {
      uri: string;
      type: string;
      name: string;
    }
  ): Promise<string> {
    try {
      // Create file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${studentId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Convert file to blob (for web) or use FormData (for native)
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("student-avatars")
        .upload(filePath, blob, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("student-avatars").getPublicUrl(filePath);

      // Update student avatar_url
      await this.updateStudent(studentId, { avatar_url: publicUrl });

      return publicUrl;
    } catch (error) {
      throw new Error("Failed to upload avatar");
    }
  }

  /**
   * Delete avatar from storage
   */
  async deleteAvatar(avatarUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const path = avatarUrl.split("/student-avatars/")[1];

      if (!path) {
        return;
      }

      const { error } = await supabase.storage
        .from("student-avatars")
        .remove([path]);

      if (error) {
      }
    } catch (error) {
    }
  }

  /**
   * Get student sessions
   */
  async getStudentSessions(studentId: string, limit = 10) {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("student_id", studentId)
      .is("deleted_at", null)
      .order("session_date", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
}

export const studentService = new StudentService();
