import { supabase } from "../../lib/supabase/client";
import {
  CreateReportData,
  ReportFilters,
  ReportWithStudent,
} from "../types/report.types";

class ReportService {
  /**
   * Get all reports with optional filters
   */
  async getReports(filters?: ReportFilters): Promise<ReportWithStudent[]> {
    let query = supabase
      .from("reports")
      .select(
        `
        *,
        student:students!reports_student_id_fkey (
          id,
          first_name,
          last_name,
          nickname
        )
      `
      )
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.report_type) {
      query = query.eq("report_type", filters.report_type);
    }

    if (filters?.student_id) {
      query = query.eq("student_id", filters.student_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get single report by ID
   */
  async getReport(id: string): Promise<ReportWithStudent> {
    const { data, error } = await supabase
      .from("reports")
      .select(
        `
        *,
        student:students!reports_student_id_fkey (
          id,
          first_name,
          last_name,
          nickname
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new report request
   */
  async createReport(data: CreateReportData): Promise<ReportWithStudent> {
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) throw new Error("User not authenticated");

    const { data: report, error } = await supabase
      .from("reports")
      .insert({
        profile_id: profile.user.id,
        format: data.format,
        report_type: data.report_type,
        student_id: data.student_id || null,
        date_from: data.date_from,
        date_to: data.date_to,
        status: "pending",
      })
      .select(
        `
        *,
        student:students!reports_student_id_fkey (
          id,
          first_name,
          last_name,
          nickname
        )
      `
      )
      .single();

    if (error) throw error;
    return report;
  }

  /**
   * Delete a report
   */
  async deleteReport(id: string): Promise<void> {
    const { error } = await supabase.from("reports").delete().eq("id", id);

    if (error) throw error;
  }

  /**
   * Download report file
   */
  async downloadReport(fileUrl: string): Promise<string> {
    // If it's already a full URL, return it
    if (fileUrl.startsWith("http")) {
      return fileUrl;
    }

    // Otherwise, get a signed URL from storage
    const { data, error } = await supabase.storage
      .from("reports")
      .createSignedUrl(fileUrl, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  }
}

export const reportService = new ReportService();
