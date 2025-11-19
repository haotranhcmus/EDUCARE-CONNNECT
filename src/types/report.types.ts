import { Database } from "./database.types";

// Database types
export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type ReportInsert = Database["public"]["Tables"]["reports"]["Insert"];
export type ReportUpdate = Database["public"]["Tables"]["reports"]["Update"];

// Extended types
export interface ReportWithStudent extends Report {
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    nickname?: string | null;
  } | null;
}

// Form data types
export interface CreateReportData {
  format: "pdf" | "excel";
  report_type: "individual" | "summary";
  student_id?: string;
  date_from: string; // ISO date string
  date_to: string; // ISO date string
}

export interface ReportFilters {
  status?: "pending" | "completed" | "failed";
  report_type?: "individual" | "summary";
  student_id?: string;
}

// Status display
export const REPORT_STATUS_LABELS: Record<
  "pending" | "completed" | "failed",
  string
> = {
  pending: "Đang xử lý",
  completed: "Hoàn thành",
  failed: "Thất bại",
};

export const REPORT_TYPE_LABELS: Record<"individual" | "summary", string> = {
  individual: "Báo cáo cá nhân",
  summary: "Báo cáo tổng hợp",
};

export const REPORT_FORMAT_LABELS: Record<"pdf" | "excel", string> = {
  pdf: "PDF",
  excel: "Excel",
};
