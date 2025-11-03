# How to Check if Resend is Configured Correctly

There are several ways to verify your Resend configuration. Choose the method that works best for you:

---

## Method 1: Quick Test Function (Recommended) ⚡

I've created a test function that checks everything for you.

### Step 1: Deploy the test function

```bash
cd "F:\Projects\Information-Assets-World"
npx supabase functions deploy test-resend
```

### Step 2: Run the test

```bash
curl https://gppohyyuggnfecfabcyz.supabase.co/functions/v1/test-resend
```

### Step 3: Check the results

**✅ SUCCESS** (everything configured correctly):
```json
{
  "overall": "PASS",
  "checks": [
    {
      "name": "Environment Variable",
      "status": "PASS",
      "message": "API key found: re_xxxxx..."
    },
    {
      "name": "Resend API Connection",
      "status": "PASS",
      "message": "Successfully connected to Resend API"
    }
  ],
  "summary": {
    "total": 3,
    "passed": 3,
    "failed": 0,
    "warnings": 0
  },
  "recommendations": [
    "✅ Resend is configured correctly!",
    "Next step: Test sending an actual email"
  ]
}
```

**❌ FAIL** (API key not set):
```json
{
  "overall": "FAIL",
  "checks": [
    {
      "name": "Environment Variable",
      "status": "FAIL",
      "message": "RESEND_API_KEY not found in environment variables",
      "solution": "Run: npx supabase secrets set RESEND_API_KEY=re_your_key_here"
    }
  ],
  "recommendations": [
    "❌ Environment Variable: Run: npx supabase secrets set RESEND_API_KEY=re_your_key_here"
  ]
}
```

**❌ FAIL** (Invalid API key):
```json
{
  "overall": "FAIL",
  "checks": [
    {
      "name": "Resend API Connection",
      "status": "FAIL",
      "message": "Invalid API key - authentication failed",
      "solution": "Regenerate API key in Resend dashboard and update Supabase secret"
    }
  ]
}
```

---

## Method 2: Check Supabase Secrets 🔐

### Check if API key exists

```bash
npx supabase secrets list
```

**Expected output** (configured):
```
NAME              VALUE_PREVIEW
RESEND_API_KEY    re_xxxxx...
```

**Output** (not configured):
```
NAME              VALUE_PREVIEW
(empty - no secrets found)
```

### Set the API key (if missing)

```bash
npx supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here
```

---

## Method 3: Check Resend Dashboard 📊

### Step 1: Log into Resend

Go to: [resend.com/dashboard](https://resend.com/dashboard)

### Step 2: Check API Keys

1. Click "API Keys" in sidebar
2. Verify you have at least one key
3. Key should have "Sending access" permission

**What to look for**:
- ✅ At least one API key exists
- ✅ Key has "Sending access" permission
- ✅ Key is not revoked or expired

### Step 3: Check Domain (Production only)

1. Click "Domains" in sidebar
2. Check domain status

**For Development**:
- Use test domain: `onboarding@resend.dev`
- No domain verification needed

**For Production**:
- Domain status should be "Verified" ✅
- DNS records (SPF, DKIM) configured

---

## Method 4: Test via Supabase Function Logs 📝

### Step 1: Submit a test lead

1. Go to: http://localhost:8080/register-interest
2. Fill out form with **your real email**
3. Submit

### Step 2: Check function logs

```bash
# Check send-confirmation-email logs
npx supabase functions logs send-confirmation-email --limit 20

# Check submit-lead logs
npx supabase functions logs submit-lead --limit 20
```

### Step 3: Look for these messages

**✅ SUCCESS** (Resend configured):
```
Sending confirmation email for lead: abc-123-xyz
Email sent successfully: re_msgid_123456
Confirmation email sent successfully: { success: true, messageId: "re_msgid_123456" }
```

**❌ FAIL** (API key not set):
```
EMAIL WOULD BE SENT (Development Mode)
To: user@example.com
Subject: Event Details: ...
```

**❌ FAIL** (Invalid API key):
```
Resend API error: { message: "Invalid API key" }
Failed to send email: Invalid API key
```

---

## Method 5: Send a Real Test Email 📧

### Step 1: Get a test lead ID

```sql
-- Run in Supabase SQL Editor
SELECT id, email, inquiry_type, reference_number
FROM leads
WHERE event_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

Copy a lead UUID from the results.

### Step 2: Test send-confirmation-email function

```bash
curl -X POST \
  'https://gppohyyuggnfecfabcyz.supabase.co/functions/v1/send-confirmation-email' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "leadId": "PASTE_LEAD_UUID_HERE",
    "includeCalendarInvite": true
  }'
```

Replace:
- `YOUR_SUPABASE_ANON_KEY` with your anon key from `.env`
- `PASTE_LEAD_UUID_HERE` with the UUID from step 1

### Step 3: Check the response

**✅ SUCCESS**:
```json
{
  "success": true,
  "messageId": "re_abc123xyz",
  "inquiryType": "send_writeup",
  "calendarIncluded": false
}
```

**❌ FAIL**:
```json
{
  "success": false,
  "error": "Email service not configured"
}
```

### Step 4: Check your email

- Email should arrive within 30 seconds
- Check spam folder if not in inbox
- Verify email formatting looks correct

---

## Method 6: Check via Resend Dashboard Activity 📈

### Step 1: Send a test email (Method 5 above)

### Step 2: Check Resend Dashboard

1. Go to: [resend.com/emails](https://resend.com/emails)
2. Look for your test email in the list

### Step 3: Check email status

**Statuses**:
- ✅ **Delivered**: Email sent successfully
- 📨 **Sent**: Email in transit
- ⚠️ **Bounced**: Invalid recipient email
- 🚫 **Spam**: Marked as spam
- ❌ **Failed**: Error sending

### Step 4: View email details

Click on the email to see:
- Delivery time
- Recipient
- Subject line
- HTML preview
- Events timeline

---

## Common Issues & Solutions

### Issue 1: "RESEND_API_KEY not found"

**Solution**:
```bash
# Set the secret
npx supabase secrets set RESEND_API_KEY=re_your_key_here

# Verify it's set
npx supabase secrets list

# Redeploy functions
npx supabase functions deploy send-confirmation-email
npx supabase functions deploy submit-lead
```

### Issue 2: "Invalid API key"

**Solution**:
1. Go to [resend.com/api-keys](https://resend.com/api-keys)
2. Delete old key
3. Create new key with "Sending access"
4. Copy the new key
5. Update Supabase secret:
   ```bash
   npx supabase secrets set RESEND_API_KEY=re_new_key_here
   ```

### Issue 3: Emails going to spam

**For Development**:
- This is normal with test domains
- Recipients can mark as "Not Spam"

**For Production**:
1. Verify your domain in Resend
2. Configure DNS records (SPF, DKIM)
3. Add DMARC record (optional but recommended)
4. Test with [mail-tester.com](https://www.mail-tester.com)

### Issue 4: "Development Mode" emails

**What it means**:
- RESEND_API_KEY is not set
- Emails logged to console instead of sent

**Solution**:
```bash
# Set the API key
npx supabase secrets set RESEND_API_KEY=re_your_key

# Redeploy
npx supabase functions deploy send-confirmation-email
```

### Issue 5: Rate limit exceeded

**Free Tier Limits**:
- 100 emails/day
- 3,000 emails/month

**Check usage**:
1. Go to Resend Dashboard
2. Check "Usage" section
3. Upgrade if needed ($20/month for 50,000 emails)

---

## Quick Troubleshooting Checklist

Run through this checklist if emails aren't working:

### 1. Environment
- [ ] Logged into Supabase: `npx supabase login`
- [ ] Project linked: `npx supabase link --project-ref gppohyyuggnfecfabcyz`

### 2. API Key
- [ ] API key exists in Resend dashboard
- [ ] API key has "Sending access" permission
- [ ] API key copied correctly (starts with `re_`)
- [ ] API key set in Supabase: `npx supabase secrets list`

### 3. Functions
- [ ] send-confirmation-email deployed
- [ ] submit-lead deployed
- [ ] No deployment errors in output

### 4. Testing
- [ ] Test function returns success: `curl .../test-resend`
- [ ] Test email sent successfully
- [ ] Email received (check spam folder)

### 5. Logs
- [ ] No errors in function logs
- [ ] See "Email sent successfully" in logs
- [ ] Activity logged in database

---

## Expected Output Summary

### ✅ Everything Working

**Supabase Secrets**:
```
NAME              VALUE_PREVIEW
RESEND_API_KEY    re_xxxxx...
```

**Function Logs**:
```
Sending confirmation email for lead: abc-123
Email sent successfully: re_msgid_123
```

**Test Function Response**:
```json
{ "overall": "PASS" }
```

**Email Inbox**:
- Email arrives within 30 seconds
- Professional HTML formatting
- Event details displayed correctly
- Reference number included

### ❌ Not Configured

**Supabase Secrets**:
```
(empty)
```

**Function Logs**:
```
EMAIL WOULD BE SENT (Development Mode)
```

**Test Function Response**:
```json
{ "overall": "FAIL" }
```

**Email Inbox**:
- No email received

---

## Next Steps After Configuration

Once Resend is confirmed working:

1. **Test all inquiry types**:
   - Submit form with each of the 6 types
   - Verify correct email template sent

2. **Test calendar invites**:
   - Submit with "Register Now"
   - Download .ics attachment
   - Import to calendar

3. **Monitor delivery**:
   - Check Resend dashboard daily
   - Monitor bounce rate (<5%)
   - Monitor delivery rate (>95%)

4. **Production setup** (when ready):
   - Verify domain in Resend
   - Configure DNS records
   - Update email sender address
   - Test spam scoring

---

## Need Help?

If you're still having issues after trying these methods:

1. **Run the test function** (Method 1) - tells you exactly what's wrong
2. **Check function logs** (Method 4) - see the actual error messages
3. **Test with real email** (Method 5) - verify end-to-end

**Contact Support**:
- Resend: support@resend.com
- Supabase Discord: https://discord.supabase.com

---

**Ready to test?** Start with **Method 1** (test function) - it's the fastest way to check everything at once! 🚀
