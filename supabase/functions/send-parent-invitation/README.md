# Supabase Edge Function: Send Parent Invitation

## Purpose

Gửi email mời phụ huynh kết nối với học sinh qua Resend API.

## Setup

### 1. Cài đặt Supabase CLI

```bash
npm install -g supabase
```

### 2. Link với Supabase project

```bash
supabase link --project-ref <YOUR_PROJECT_REF>
```

### 3. Set environment variables

```bash
# Via Supabase Dashboard: Settings → Edge Functions → Secrets
# Hoặc via CLI:
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
supabase secrets set APP_URL=https://your-app-url.com
```

### 4. Deploy function

```bash
supabase functions deploy send-parent-invitation
```

## Environment Variables

- `RESEND_API_KEY` - API key từ Resend (https://resend.com)
- `SUPABASE_URL` - Tự động inject bởi Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Tự động inject bởi Supabase
- `APP_URL` - URL của app (để tạo invitation link)

## API Usage

### Request

```typescript
POST https://<project-ref>.supabase.co/functions/v1/send-parent-invitation

Headers:
  Authorization: Bearer <SUPABASE_ANON_KEY>
  Content-Type: application/json

Body:
{
  "link_id": "uuid-of-student-parent-link"
}
```

### Response

**Success (200)**

```json
{
  "success": true,
  "message": "Invitation email sent successfully",
  "email_id": "resend-email-id"
}
```

**Error (400/404/500)**

```json
{
  "error": "Error message"
}
```

## Integration với App

### Update ParentService

Thêm method call Edge Function:

```typescript
// src/services/parent.service.ts

async sendInvitationEmail(linkId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke(
    'send-parent-invitation',
    {
      body: { link_id: linkId }
    }
  );

  if (error) {
    console.error('Failed to send invitation email:', error);
    throw new Error('Không thể gửi email mời');
  }
}
```

### Update inviteParent method

```typescript
async inviteParent(request: InviteParentRequest): Promise<StudentParent> {
  // ... existing code ...

  // Send invitation email
  try {
    await this.sendInvitationEmail(data.id);
  } catch (emailError) {
    console.warn('Email sending failed, but invitation created:', emailError);
    // Don't throw - invitation is created even if email fails
  }

  return data;
}
```

## Resend Setup

### 1. Tạo tài khoản

1. Vào https://resend.com
2. Đăng ký tài khoản miễn phí
3. Free tier: 100 emails/day, 3,000 emails/month

### 2. Verify domain (Production)

1. Dashboard → Domains → Add Domain
2. Thêm DNS records vào domain của bạn
3. Đợi verify (5-10 phút)

### 3. Get API Key

1. Dashboard → API Keys → Create API Key
2. Copy key và set vào Supabase secrets

### 4. Test với sandbox (Development)

- Dùng `onboarding@resend.dev` để test
- Email chỉ gửi đến email bạn verify
- Không cần domain riêng

## Testing

### 1. Test local

```bash
# Start Supabase local
supabase start

# Serve function locally
supabase functions serve send-parent-invitation --env-file .env.local

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-parent-invitation' \
  --header 'Authorization: Bearer eyJh...' \
  --header 'Content-Type: application/json' \
  --data '{"link_id":"..."}'
```

### 2. Test trên Supabase

```bash
# Via CLI
supabase functions invoke send-parent-invitation \
  --body '{"link_id":"uuid-here"}'

# Via Dashboard
# Functions → send-parent-invitation → Invoke
```

## Monitoring

### Logs

```bash
# Real-time logs
supabase functions logs send-parent-invitation --follow

# Recent logs
supabase functions logs send-parent-invitation --limit 100
```

### Metrics

- Dashboard → Edge Functions → send-parent-invitation
- Xem invocations, errors, execution time

## Email Template Customization

File HTML template ở trong `generateEmailHTML()`. Có thể customize:

- Branding (logo, colors)
- Content (thêm info, hướng dẫn)
- Styles (CSS inline)

## Security

- ✅ Function dùng Service Role Key (bypass RLS) để đọc data
- ✅ CORS headers configured
- ✅ Input validation (check link_id exists)
- ✅ Email chỉ gửi đến parent_email trong DB (không trust user input)
- ⚠️ Link invitation có thể dùng nhiều lần - cần implement token expiry nếu cần

## Troubleshooting

### "Failed to send email"

- Check RESEND_API_KEY đúng chưa
- Check domain verified (production)
- Check email quota (free tier)

### "Parent link not found"

- Check link_id đúng format UUID
- Check link tồn tại trong DB
- Check RLS policies không block service role

### Function timeout

- Default timeout: 60s
- Có thể tăng trong Dashboard → Edge Functions → Settings

## Next Steps

- [ ] Implement invitation token expiry
- [ ] Add email templates cho các use cases khác
- [ ] Implement email tracking (opened, clicked)
- [ ] Add retry logic nếu Resend fails
- [ ] Support multiple languages
