# Automated Email System - Deployment Guide

**Quick Start**: Get your automated emails running in 15 minutes!

---

## Prerequisites

- ✅ Supabase account and project
- ✅ Supabase CLI installed (`npm install -g supabase`)
- ✅ Phase 1 database migrations applied (event_id, inquiry_type columns)

---

## Step 1: Set Up Resend Account (5 minutes)

### 1.1 Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Click "Sign Up" (free account)
3. Verify your email address
4. Complete onboarding

### 1.2 Add Domain (Optional - Production)

**For Testing**:
- Use Resend's test domain: `onboarding@resend.dev`
- Emails will be sent but may go to spam
- Good for development

**For Production**:
1. In Resend Dashboard → "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `informationassets.com`)
4. Add DNS records (TXT, MX, CNAME):
   ```
   Type: TXT
   Name: _resend
   Value: [provided by Resend]

   Type: MX
   Name: @
   Priority: 10
   Value: [provided by Resend]
   ```
5. Wait for verification (5-30 minutes)
6. Domain status changes to "Verified" ✅

### 1.3 Generate API Key

1. In Resend Dashboard → "API Keys"
2. Click "Create API Key"
3. Name: `Information Assets - Production`
4. Permission: **Sending access**
5. Click "Create"
6. **COPY THE API KEY** (you won't see it again!)
   - Format: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Step 2: Configure Supabase (3 minutes)

### 2.1 Add Resend API Key to Supabase Secrets

**Option A: Using Supabase CLI** (Recommended)

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref gppohyyuggnfecfabcyz

# Set the secret
npx supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here
```

**Option B: Using Supabase Dashboard**

1. Go to: https://supabase.com/dashboard/project/gppohyyuggnfecfabcyz/settings/functions
2. Click "Edge Functions" → "Secrets"
3. Click "New Secret"
4. Name: `RESEND_API_KEY`
5. Value: `re_your_actual_api_key_here`
6. Click "Save"

### 2.2 Verify Secret is Set

```bash
npx supabase secrets list

# Should output:
# NAME              VALUE_PREVIEW
# RESEND_API_KEY    re_xxxxx...
```

---

## Step 3: Deploy Edge Functions (5 minutes)

### 3.1 Deploy send-confirmation-email Function

```bash
cd "F:\Projects\Information-Assets-World"

# Deploy the new email function
npx supabase functions deploy send-confirmation-email
```

**Expected Output**:
```
Deploying function send-confirmation-email...
Function send-confirmation-email deployed successfully!
URL: https://gppohyyuggnfecfabcyz.supabase.co/functions/v1/send-confirmation-email
```

### 3.2 Redeploy submit-lead Function

```bash
# Redeploy with email integration
npx supabase functions deploy submit-lead
```

**Expected Output**:
```
Deploying function submit-lead...
Function submit-lead deployed successfully!
URL: https://gppohyyuggnfecfabcyz.supabase.co/functions/v1/submit-lead
```

---

## Step 4: Test Email System (2 minutes)

### 4.1 Test via Form Submission

1. Open your app: http://localhost:8080/register-interest
2. Fill in form with **your real email** (to receive test email)
3. Select an event
4. Choose inquiry type: "Send me the Event Writeup"
5. Submit form
6. **Check your email inbox** within 30 seconds

**What to expect**:
- ✅ Form submission success message
- ✅ Email arrives in inbox (or spam folder)
- ✅ Email has event details
- ✅ Professional HTML formatting
- ✅ Reference number included

### 4.2 Test via Edge Function Direct Call

```bash
# Get a test lead ID from your database
# Replace with actual lead UUID

curl -X POST \
  'https://gppohyyuggnfecfabcyz.supabase.co/functions/v1/send-confirmation-email' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "leadId": "PUT_REAL_LEAD_UUID_HERE",
    "includeCalendarInvite": true
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "messageId": "re_abc123xyz",
  "inquiryType": "send_writeup",
  "calendarIncluded": false
}
```

### 4.3 Check Supabase Function Logs

```bash
# View logs for send-confirmation-email
npx supabase functions logs send-confirmation-email --limit 50

# View logs for submit-lead
npx supabase functions logs submit-lead --limit 50
```

**What to look for**:
- ✅ `Sending confirmation email for lead: [UUID]`
- ✅ `Email sent successfully: [messageId]`
- ❌ NO errors about API keys
- ❌ NO 500 errors

---

## Step 5: Test All Inquiry Types (10 minutes)

Submit a test lead for each inquiry type to verify all 6 email templates work:

### Test Checklist

| Inquiry Type | Email Received? | Correct Template? | Calendar Invite? |
|--------------|-----------------|-------------------|------------------|
| 📧 Send Writeup | ⬜ | ⬜ | N/A |
| 📞 Contact Discuss | ⬜ | ⬜ | N/A |
| ✅ Register Now | ⬜ | ⬜ | ⬜ |
| 👥 Group Registration | ⬜ | ⬜ | ⬜ |
| 🏢 Corporate Training | ⬜ | ⬜ | N/A |
| 📰 Just Browsing | ⬜ | ⬜ | N/A |

**For each test**:
1. Submit form with different inquiry type
2. Check email inbox
3. Verify correct subject line
4. Verify email content matches template
5. For "Register Now" and "Group Registration":
   - Download .ics attachment
   - Import to calendar (Google, Outlook, or Apple)
   - Verify event appears with correct details

---

## Troubleshooting

### Email Not Arriving

**Check 1: Spam Folder**
- Gmail: Check "Promotions" and "Spam" folders
- Outlook: Check "Junk" folder

**Check 2: Resend Dashboard**
1. Go to Resend Dashboard → "Emails"
2. Find your test email
3. Status should be "Delivered" ✅
4. If "Bounced" ❌ or "Spam" ⚠️, check recipient email

**Check 3: Function Logs**
```bash
npx supabase functions logs send-confirmation-email --limit 10
```

Look for errors:
- `Email service not configured` → API key not set
- `Failed to send email` → Resend API error
- `Lead not found` → Invalid lead ID

**Check 4: API Key**
```bash
# Verify secret exists
npx supabase secrets list | grep RESEND

# If missing, set it again
npx supabase secrets set RESEND_API_KEY=re_your_key_here
```

### Calendar Invite Not Working

**Check 1: Inquiry Type**
- Calendar invites only for: `register_now`, `group_registration`
- Other types won't have attachments

**Check 2: .ics File**
1. Download attachment from email
2. Open in text editor
3. Should start with: `BEGIN:VCALENDAR`
4. Should end with: `END:VCALENDAR`

**Check 3: Import to Calendar**
- **Google Calendar**: Drag .ics file to calendar
- **Outlook**: File → Import → Calendar (.ics)
- **Apple Calendar**: Double-click .ics file

### Function Deploy Errors

**Error: Not logged in**
```bash
npx supabase login
```

**Error: Project not linked**
```bash
npx supabase link --project-ref gppohyyuggnfecfabcyz
```

**Error: Permission denied**
- Make sure you have Owner/Admin role in Supabase project

### Resend API Errors

**Error: `Invalid API key`**
- Regenerate API key in Resend Dashboard
- Update Supabase secret with new key

**Error: `Domain not verified`**
- Use test domain for development: `onboarding@resend.dev`
- For production: Verify your domain in Resend

**Error: `Rate limit exceeded`**
- Free tier: 100 emails/day, 3,000/month
- Upgrade to paid plan if needed

---

## Monitoring & Maintenance

### Daily Checks

**Resend Dashboard** (https://resend.com/dashboard):
- Check delivery rate (should be >95%)
- Monitor bounce rate (should be <5%)
- Review spam complaints

**Supabase Dashboard**:
```sql
-- Emails sent today
SELECT COUNT(*) FROM activities
WHERE activity_type = 'email'
  AND created_at >= CURRENT_DATE;

-- Recent email errors (check function logs)
SELECT * FROM activities
WHERE activity_type = 'email'
  AND details LIKE '%error%'
ORDER BY created_at DESC
LIMIT 10;
```

### Weekly Checks

**Email Performance**:
```sql
-- Emails sent by inquiry type (last 7 days)
SELECT
  l.inquiry_type,
  COUNT(*) as emails_sent,
  COUNT(DISTINCT l.id) as unique_leads
FROM activities a
JOIN leads l ON a.lead_id = l.id
WHERE a.activity_type = 'email'
  AND a.created_at >= NOW() - INTERVAL '7 days'
GROUP BY l.inquiry_type
ORDER BY emails_sent DESC;
```

**Resend Limits**:
- Check you're under 3,000 emails/month (free tier)
- Check you're under 100 emails/day
- Upgrade if approaching limits

### Monthly Tasks

1. **Review Email Templates**:
   - Are CTAs converting?
   - Are follow-up timings appropriate?
   - Any customer feedback on emails?

2. **Update Branding** (if needed):
   - Update logo or colors in templates
   - Redeploy functions

3. **Domain Health**:
   - Check DNS records still valid
   - Monitor SPF/DKIM status in Resend

---

## Production Checklist

Before going live to customers:

### Email Configuration
- [ ] Resend account created
- [ ] Domain verified in Resend
- [ ] API key generated and stored securely
- [ ] SPF/DKIM records configured
- [ ] Test emails delivered to inbox (not spam)

### Edge Functions
- [ ] `send-confirmation-email` deployed
- [ ] `submit-lead` deployed with email integration
- [ ] Secrets configured (`RESEND_API_KEY`)
- [ ] Function logs show no errors

### Testing
- [ ] All 6 inquiry types tested
- [ ] Emails received for each type
- [ ] Calendar invites work for `register_now` and `group_registration`
- [ ] Email formatting looks good on mobile
- [ ] No spam folder issues

### Monitoring
- [ ] Resend dashboard access configured
- [ ] Email delivery monitoring set up
- [ ] Activity logging working
- [ ] Error alerting configured (optional)

### Documentation
- [ ] Team knows how to check Resend dashboard
- [ ] Team knows how to view function logs
- [ ] Team knows how to handle email bounces
- [ ] Emergency contacts documented

---

## Quick Reference

### Important URLs

**Resend Dashboard**: https://resend.com/dashboard
**Supabase Project**: https://supabase.com/dashboard/project/gppohyyuggnfecfabcyz
**Edge Functions**: https://supabase.com/dashboard/project/gppohyyuggnfecfabcyz/functions

### Common Commands

```bash
# Deploy email function
npx supabase functions deploy send-confirmation-email

# View logs
npx supabase functions logs send-confirmation-email --limit 50

# Test email function
curl -X POST 'https://gppohyyuggnfecfabcyz.supabase.co/functions/v1/send-confirmation-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"leadId": "UUID_HERE", "includeCalendarInvite": true}'

# Check secrets
npx supabase secrets list

# Set secret
npx supabase secrets set RESEND_API_KEY=re_your_key_here
```

### Email Template Files

- **Templates**: `supabase/functions/_shared/email-templates.ts`
- **Email Service**: `supabase/functions/_shared/email-service.ts`
- **Calendar**: `supabase/functions/_shared/calendar-generator.ts`
- **Function**: `supabase/functions/send-confirmation-email/index.ts`
- **Integration**: `supabase/functions/submit-lead/index.ts`

---

## Support

**Resend Support**:
- Docs: https://resend.com/docs
- Status: https://status.resend.com
- Support: support@resend.com

**Supabase Support**:
- Docs: https://supabase.com/docs/guides/functions
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase

---

## Cost Summary

**Free Tier** (Perfect for Information Assets):
- 3,000 emails/month
- 100 emails/day
- All features included
- **Cost: $0/month** ✅

**Estimated Usage**:
- 100-500 leads/month
- 1 email per lead
- Well under free tier limits

**When to Upgrade**:
- If exceeding 3,000 emails/month
- If need higher daily limit
- Paid plans start at $20/month (50,000 emails)

---

**Ready to go live?** Follow the steps above and your automated email system will be running in 15 minutes! 🚀
