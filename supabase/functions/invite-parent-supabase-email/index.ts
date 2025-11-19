// ============================================================================
// EDGE FUNCTION: Invite Parent với Supabase Email Template
// ============================================================================
// Flow:
// 1. Tạo hoặc update user với password = email
// 2. Gửi invite email qua Supabase (sử dụng email template của Supabase)
// 3. Email template sẽ chứa link confirm + thông tin password
// 4. User click link → auto login → force change password

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  link_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY"
    )!;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get request body
    const { link_id } = (await req.json()) as InviteRequest;

    console.log("=".repeat(80));
    console.log("🚀 INVITE PARENT - START");
    console.log("Link ID received:", link_id);
    console.log("Timestamp:", new Date().toISOString());
    console.log("=".repeat(80));

    if (!link_id) {
      console.error("❌ Missing link_id in request");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing link_id",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ========================================================================
    // Step 1: Get student_parent link info
    // ========================================================================
    console.log("Step 1: Fetching student_parents link...");
    const { data: linkData, error: linkError } = await supabaseAdmin
      .from("student_parents")
      .select(
        `
        id,
        parent_email,
        status,
        student_id,
        students (
          id,
          first_name,
          last_name,
          profile_id
        )
      `
      )
      .eq("id", link_id)
      .single();

    console.log("Query result:", { linkData, linkError });

    if (linkError || !linkData) {
      console.error("Error fetching link:", linkError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Student-parent link not found",
          details: linkError?.message || "No data returned",
          link_id: link_id,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const parentEmail = linkData.parent_email;
    const student = linkData.students as any;

    console.log("Parent email:", parentEmail);
    console.log("Student data:", student);

    if (!parentEmail) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Parent email not found in link",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 2: Get teacher info from student's profile_id
    let teacherProfile = null;
    if (student?.profile_id) {
      console.log("Step 2: Fetching teacher profile...");
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("id", student.profile_id)
        .single();

      if (!profileError && profileData) {
        teacherProfile = profileData;
        console.log("Teacher profile:", teacherProfile);
      } else {
        console.error("Error fetching teacher profile:", profileError);
      }
    }

    // Password will be the email address
    const temporaryPassword = parentEmail;

    // ========================================================================
    // Step 2: Check if user already exists
    // ========================================================================
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === parentEmail
    );

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      console.log("User already exists, updating...");
      userId = existingUser.id;

      // Update existing user - set password and metadata
      const { data: updatedUser, error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: temporaryPassword,
          email_confirm: true,
          user_metadata: {
            role: "parent",
            first_login: true,
            temporary_password: temporaryPassword,
            invited_at: new Date().toISOString(),
          },
        });

      if (updateError) {
        console.error("Error updating user:", updateError);
        throw updateError;
      }

      console.log("User updated successfully");
    } else {
      console.log("Creating new user...");
      isNewUser = true;

      // Create new user with password and confirmed email
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: parentEmail,
          password: temporaryPassword,
          email_confirm: true, // Skip email verification
          user_metadata: {
            role: "parent",
            first_login: true,
            temporary_password: temporaryPassword,
            invited_at: new Date().toISOString(),
          },
        });

      if (createError) {
        console.error("Error creating user:", createError);

        // If user exists (maybe soft-deleted), try to find and update instead
        if (
          createError.message?.includes("already been registered") ||
          createError.message?.includes("email_exists")
        ) {
          console.log(
            "⚠️ User email exists (possibly soft-deleted). Trying to find user..."
          );

          // Try to get user by email using a workaround
          const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1000,
          });

          const existingUserByEmail = allUsers?.users?.find(
            (u) => u.email?.toLowerCase() === parentEmail.toLowerCase()
          );

          if (existingUserByEmail) {
            console.log("Found existing user, will update instead of create");
            userId = existingUserByEmail.id;
            isNewUser = false;

            // Update the existing user
            const { error: updateError } =
              await supabaseAdmin.auth.admin.updateUserById(userId, {
                password: temporaryPassword,
                email_confirm: true,
                user_metadata: {
                  role: "parent",
                  first_login: true,
                  temporary_password: temporaryPassword,
                  invited_at: new Date().toISOString(),
                },
              });

            if (updateError) {
              console.error("Error updating found user:", updateError);
              throw updateError;
            }

            console.log("✅ Updated existing user successfully");
          } else {
            console.error(
              "❌ Cannot create user and cannot find existing user"
            );
            throw new Error(
              `Email ${parentEmail} appears to exist but cannot be found. Please contact support or use a different email.`
            );
          }
        } else {
          throw createError;
        }
      } else {
        if (!newUser.user) {
          throw new Error("Failed to create user");
        }

        userId = newUser.user.id;
        console.log("User created successfully:", userId);
      }
    }

    // ========================================================================
    // Step 3: Update or create profile
    // ========================================================================
    console.log("Step 3: Upserting profile...");

    // Extract name from email or use defaults
    const emailUsername = parentEmail.split("@")[0];
    const firstName = emailUsername.split(".")[0] || "Parent";
    const lastName = emailUsername.split(".")[1] || emailUsername;

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email: parentEmail,
        role: "parent",
        first_name: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        last_name: lastName.charAt(0).toUpperCase() + lastName.slice(1),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    );

    if (profileError) {
      console.error("Error upserting profile:", profileError);
      throw profileError;
    }

    console.log("Profile upserted successfully:", { firstName, lastName });

    // ========================================================================
    // Step 4: Update student_parents link
    // ========================================================================
    console.log("Step 4: Updating student_parents link...");
    const { error: updateLinkError } = await supabaseAdmin
      .from("student_parents")
      .update({
        parent_id: userId,
        status: "invited", // Valid values: 'invited', 'active', 'revoked'
        updated_at: new Date().toISOString(),
      })
      .eq("id", link_id);

    if (updateLinkError) {
      console.error("Error updating student_parents link:", updateLinkError);
      throw updateLinkError;
    }

    console.log("student_parents link updated successfully");

    // ========================================================================
    // Step 5: SKIP EMAIL - Just return credentials for teacher to share
    // ========================================================================
    // Note: Email sending via Supabase inviteUserByEmail has limitations:
    // - Cannot send to existing users (even if soft-deleted)
    // - Requires SMTP configuration
    // - Template customization limited
    //
    // SOLUTION: Teacher will share credentials manually via SMS/Zalo/WhatsApp

    console.log("=".repeat(80));
    console.log("✅ User account ready!");
    console.log("Email:", parentEmail);
    console.log("Password:", temporaryPassword);
    console.log("📱 Teacher should share these credentials via SMS/Zalo");
    console.log("=".repeat(80));

    // ========================================================================
    // Step 6: Return success response
    // ========================================================================
    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Parent account ready. Share credentials with parent via SMS/Zalo.",
        parent_email: parentEmail,
        user_id: userId,
        temporary_password: temporaryPassword,
        email_sent: false, // We don't send email - teacher shares manually
        is_new_user: isNewUser,
        note: "Email not sent. Teacher should share login credentials via SMS/Zalo/WhatsApp.",
        credentials: {
          email: parentEmail,
          password: temporaryPassword,
          instruction:
            "Login to EduCare Connect app with these credentials, then change password on first login.",
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in invite-parent-supabase-email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
