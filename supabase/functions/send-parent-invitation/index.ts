// Supabase Edge Function: Send Parent Invitation Email
// Deploy: supabase functions deploy send-parent-invitation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const APP_URL = Deno.env.get("APP_URL") || "https://educare-connect.app";
const APP_SCHEME = Deno.env.get("APP_SCHEME") || "educare"; // For Expo development

interface InvitationPayload {
  link_id: string;
}

serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Get request body
    const { link_id } = (await req.json()) as InvitationPayload;

    console.log("📧 Received request for link_id:", link_id);

    if (!link_id) {
      console.error("❌ Missing link_id in request");
      return new Response(JSON.stringify({ error: "link_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate environment variables
    if (!RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Environment variables OK");

    // Create Supabase client with service role (bypass RLS)
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    console.log("🔍 Querying parent link...");

    // Get parent link details (simplified query first to debug)
    const { data: link, error: linkError } = await supabase
      .from("student_parents")
      .select("*")
      .eq("id", link_id)
      .single();

    if (linkError || !link) {
      console.error("❌ Parent link not found:", linkError);
      console.error("   Link ID searched:", link_id);
      return new Response(
        JSON.stringify({
          error: "Parent link not found",
          details: linkError?.message,
          link_id: link_id,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Found parent link:", link.id);
    console.log("   Email:", link.parent_email);
    console.log("   Student ID:", link.student_id);
    console.log("   Invited by:", link.invited_by);

    // Get student details separately
    const { data: student } = await supabase
      .from("students")
      .select("id, first_name, last_name")
      .eq("id", link.student_id)
      .single();

    // Get teacher details separately
    const { data: teacher } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", link.invited_by)
      .single();

    if (!student || !teacher) {
      console.error("❌ Missing student or teacher data");
      return new Response(
        JSON.stringify({ error: "Incomplete invitation data" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Student:", student.first_name, student.last_name);
    console.log("✅ Teacher:", teacher.first_name, teacher.last_name);

    // Prepare email content
    const studentName = `${student.first_name} ${student.last_name}`;
    const teacherName = `${teacher.first_name} ${teacher.last_name}`;
    const relationshipLabel = getRelationshipLabel(
      link.relationship,
      link.relationship_note
    );

    // Generate invitation URL - support both production and Expo development
    // Production: https://educare-connect.app/parent/accept-invitation?token=xxx
    // Development: educare://parent/accept-invitation?token=xxx
    const invitationUrl = `${APP_URL}/parent/accept-invitation?token=${link.id}`;
    const devInvitationUrl = `${APP_SCHEME}://parent/accept-invitation?token=${link.id}`;

    console.log("📤 Sending email to:", link.parent_email);
    console.log("🔗 Production URL:", invitationUrl);
    console.log("🔗 Development URL:", devInvitationUrl);

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "EduCare Connect <onboarding@resend.dev>",
        to: [link.parent_email],
        subject: `Lời mời kết nối với học sinh ${studentName}`,
        html: generateEmailHTML({
          studentName,
          teacherName,
          teacherEmail: teacher.email,
          relationshipLabel,
          invitationUrl,
          devInvitationUrl,
        }),
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error("❌ Resend API error:", error);
      console.error("   Status:", emailResponse.status);
      console.error("   StatusText:", emailResponse.statusText);

      // Parse error for better message
      let errorMessage = "Failed to send email";
      try {
        const errorData = JSON.parse(error);
        if (
          errorData.statusCode === 403 &&
          errorData.message?.includes("testing emails")
        ) {
          errorMessage =
            "⚠️ Resend đang ở chế độ testing. Chỉ có thể gửi email đến địa chỉ email đã đăng ký Resend. Để gửi đến email bất kỳ, hãy verify domain tại resend.com/domains";
        } else {
          errorMessage = errorData.message || errorMessage;
        }
      } catch (e) {
        // If can't parse, use original error
        errorMessage = error;
      }

      return new Response(
        JSON.stringify({
          error: errorMessage,
          details: error,
          status: emailResponse.status,
        }),
        {
          status: emailResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const emailData = await emailResponse.json();
    console.log("✅ Email sent successfully! Email ID:", emailData.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Invitation email sent successfully",
        email_id: emailData.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

function getRelationshipLabel(relationship: string, note?: string): string {
  const labels: { [key: string]: string } = {
    mother: "Mẹ",
    father: "Bố",
    guardian: "Người giám hộ",
    other: note || "Người thân",
  };
  return labels[relationship] || relationship;
}

function generateEmailHTML(data: {
  studentName: string;
  teacherName: string;
  teacherEmail: string;
  relationshipLabel: string;
  invitationUrl: string;
  devInvitationUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lời mời kết nối - EduCare Connect</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 24px;
    }
    .logo h1 {
      color: #6750A4;
      margin: 0;
      font-size: 28px;
    }
    .content {
      margin: 24px 0;
    }
    .highlight {
      background-color: #E8DEF8;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #6750A4;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      margin: 16px 0;
      font-weight: 600;
      text-align: center;
    }
    .button:hover {
      background-color: #5a3f8f;
    }
    .info-box {
      background-color: #E3F2FD;
      padding: 16px;
      border-left: 4px solid #2196F3;
      margin: 16px 0;
      border-radius: 4px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
      font-size: 14px;
      color: #666;
    }
    .contact {
      margin-top: 16px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>🎓 EduCare Connect</h1>
    </div>

    <div class="content">
      <h2>Lời mời kết nối với học sinh</h2>
      
      <p>Xin chào,</p>
      
      <p>Giáo viên <strong>${data.teacherName}</strong> đã mời bạn kết nối với học sinh <strong>${data.studentName}</strong> trên EduCare Connect.</p>
      
      <div class="highlight">
        <p style="margin: 0;"><strong>Thông tin:</strong></p>
        <ul style="margin: 8px 0;">
          <li><strong>Học sinh:</strong> ${data.studentName}</li>
          <li><strong>Quan hệ:</strong> ${data.relationshipLabel}</li>
          <li><strong>Giáo viên:</strong> ${data.teacherName}</li>
        </ul>
      </div>

      <p><strong>EduCare Connect</strong> là ứng dụng quản lý học sinh dành cho trẻ tự kỷ, giúp phụ huynh:</p>
      <ul>
        <li>📅 Theo dõi lịch trình các buổi học</li>
        <li>📊 Xem báo cáo tiến độ học tập</li>
        <li>🎯 Theo dõi đánh giá mục tiêu</li>
        <li>📸 Xem ảnh và video trong buổi học</li>
        <li>💬 Nhắn tin trực tiếp với giáo viên</li>
        <li>🔔 Nhận thông báo tức thời</li>
      </ul>

      <div style="text-align: center;">
        <a href="${data.invitationUrl}" class="button">
          Chấp nhận lời mời (Web/Production)
        </a>
        <br><br>
        <a href="${data.devInvitationUrl}" class="button" style="background-color: #2196F3;">
          Mở trong Expo Go (Development)
        </a>
      </div>

      <div class="info-box">
        <p style="margin: 0;"><strong>ℹ️ Lưu ý:</strong></p>
        <ul style="margin: 8px 0; padding-left: 20px;">
          <li>Bạn cần tạo tài khoản (hoặc đăng nhập nếu đã có) để chấp nhận lời mời</li>
          <li>Giáo viên sẽ quản lý quyền truy cập thông tin mà bạn có thể xem</li>
          <li>Link này chỉ sử dụng một lần</li>
          <li><strong>Khi test:</strong> Click nút xanh "Mở trong Expo Go" nếu đang dùng Expo</li>
        </ul>
      </div>

      <div class="contact">
        <p><strong>Cần hỗ trợ?</strong></p>
        <p>Liên hệ với giáo viên: <a href="mailto:${data.teacherEmail}">${data.teacherEmail}</a></p>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0;">Email này được gửi tự động từ EduCare Connect.</p>
      <p style="margin: 4px 0;">Nếu bạn không yêu cầu email này, vui lòng bỏ qua.</p>
      <p style="margin: 4px 0; color: #999;">© 2025 EduCare Connect. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
