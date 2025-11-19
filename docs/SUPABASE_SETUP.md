# Supabase Setup Guide for EduCare Connect

## 1. Deep Link Configuration

### Setup Redirect URLs in Supabase Dashboard

1. Go to **Authentication > URL Configuration**
2. Add these URLs to **Redirect URLs**:

   ```
   educareconnect://auth/confirmed
   educareconnect://auth/reset-password
   educareconnect://auth/email-changed
   educareconnect://auth/invite-accepted
   educareconnect://auth
   ```

3. Set **Site URL** to:
   ```
   https://trongchuonghcmus.github.io/educare-auth-pages/
   ```

## 2. Email Templates

### Configure Email Templates in Supabase Dashboard

Go to **Authentication > Email Templates** and update:

#### Confirm Signup Template

```html
<h2>Xác nhận đăng ký</h2>
<p>Nhấn vào link dưới đây để xác nhận tài khoản:</p>
<p><a href="{{ .ConfirmationURL }}">Xác nhận email</a></p>
<p>Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
```

#### Reset Password Template

```html
<h2>Đặt lại mật khẩu</h2>
<p>Nhấn vào link dưới đây để đặt lại mật khẩu:</p>
<p><a href="{{ .ConfirmationURL }}">Đặt lại mật khẩu</a></p>
<p>Link này sẽ hết hạn sau 1 giờ.</p>
```

#### Invite User Template

```html
<h2>Lời mời tham gia EduCare Connect</h2>
<p>Bạn được mời tham gia EduCare Connect với vai trò phụ huynh.</p>
<p>Nhấn vào link dưới đây để kích hoạt tài khoản:</p>
<p><a href="{{ .ConfirmationURL }}">Kích hoạt tài khoản</a></p>
```

## 3. Row Level Security (RLS)

### Enable RLS for all tables

Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_incidents ENABLE ROW LEVEL SECURITY;
```

### Apply RLS Policies

Run the following migration files in order:

1. **Students & Student-Parents RLS**:

   ```bash
   # Run: docs/migrations/production-rls-students.sql
   ```

2. **Goal Evaluations RLS**:
   ```bash
   # Run: docs/migrations/production-rls-goal-evaluations.sql
   ```

## 4. Storage Configuration

### Create Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Create these buckets:

   - **avatars** (Public)

     - Max file size: 5 MB
     - Allowed MIME types: image/jpeg, image/png, image/webp

   - **session-media** (Public)
     - Max file size: 10 MB
     - Allowed MIME types: image/_, video/_

### Storage Policies

#### Avatars Bucket Policies

```sql
-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public to view avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

#### Session Media Policies

```sql
-- Teachers can upload session media for their sessions
CREATE POLICY "Teachers can upload session media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'session-media' AND
  EXISTS (
    SELECT 1 FROM sessions
    WHERE id::text = (storage.foldername(name))[1]
    AND created_by = auth.uid()
  )
);

-- Anyone can view session media
CREATE POLICY "Anyone can view session media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'session-media');
```

## 5. Database Functions

### Helper Functions for RLS

```sql
-- Function to check if user is a teacher
CREATE OR REPLACE FUNCTION is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is a parent of a student
CREATE OR REPLACE FUNCTION is_parent_of_student(student_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM student_parents
    WHERE student_parents.student_id = $1
    AND student_parents.parent_id = auth.uid()
    AND student_parents.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 6. Environment Variables

Make sure you have these in your app:

```typescript
// src/config/env.ts or .env
export const SUPABASE_URL = "https://your-project.supabase.co";
export const SUPABASE_ANON_KEY = "your-anon-key";
```

Get these from: **Settings > API** in Supabase Dashboard

## 7. Testing Configuration

### Test Deep Links on Android

```bash
# Test email confirmation
adb shell am start -W -a android.intent.action.VIEW \
  -d "educareconnect://auth/confirmed?access_token=xxx&refresh_token=yyy"

# Test password reset
adb shell am start -W -a android.intent.action.VIEW \
  -d "educareconnect://auth/reset-password?access_token=xxx&refresh_token=yyy"
```

### Test Email Flow

1. Register a new user
2. Check email for confirmation link
3. Click link → should redirect to app
4. Verify user is logged in

### Test RLS

1. Login as teacher
2. Create a student
3. Logout
4. Login as different teacher
5. Verify cannot see first teacher's students

## 8. Production Checklist

Before going live, verify:

- [ ] RLS enabled on ALL tables
- [ ] RLS policies tested with different user roles
- [ ] Redirect URLs configured correctly
- [ ] Email templates updated with proper branding
- [ ] Storage buckets created with correct permissions
- [ ] Storage policies allow only authorized access
- [ ] Database functions created
- [ ] Environment variables set in production
- [ ] Deep links tested on physical devices
- [ ] Email confirmation flow works end-to-end
- [ ] Password reset flow works
- [ ] Parent invitation flow works

## 9. Monitoring & Maintenance

### Enable Database Logs

Go to **Settings > Database** and enable:

- Query performance insights
- Connection pooling (if needed)

### Set up Alerts

Consider setting up alerts for:

- Failed login attempts
- RLS policy violations
- Storage quota limits
- Database connection limits

### Backup Strategy

Supabase provides daily backups, but consider:

- Enabling Point-in-Time Recovery (PITR) for production
- Regular manual backups before major updates
- Testing restore procedures

## Troubleshooting

### Deep Links Not Working

1. Check app.json has correct `scheme: "educareconnect"`
2. Verify redirect URLs in Supabase exactly match
3. Test with simple URL first: `educareconnect://`
4. Check Android intent filters are correct

### RLS Blocking Queries

1. Check user is authenticated: `auth.uid()` returns value
2. Verify user role in profiles table
3. Test query in Supabase SQL editor with user context
4. Check policy conditions match your data

### Email Not Sending

1. Check SMTP settings in Supabase
2. Verify email templates are saved
3. Check spam folder
4. Test with different email providers
5. Check Supabase logs for email errors

### Storage Upload Failing

1. Verify bucket exists and is public/private as needed
2. Check file size limits
3. Verify MIME type is allowed
4. Check storage policies allow upload
5. Verify user has proper permissions

## Support

For issues:

- Check Supabase documentation: https://supabase.com/docs
- Review Supabase logs in Dashboard
- Check app logs for specific errors
- Test with Supabase CLI for local debugging
