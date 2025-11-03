# Register Interest Form - Troubleshooting Guide

## Quick Diagnostic Steps

Run these queries in your Supabase SQL Editor to diagnose issues:

### 1. Check Training Types
```sql
-- Are there any active training types?
SELECT id, name, is_active, display_order
FROM training_types
ORDER BY display_order;

-- If empty or all inactive, add some:
INSERT INTO training_types (name, description, is_active, display_order) VALUES
  ('Records Management Training', 'Professional records management certification', true, 1),
  ('Data Protection & Privacy', 'GDPR and data protection compliance', true, 2),
  ('Information Governance', 'Strategic information governance', true, 3);
```

### 2. Check Countries
```sql
-- Are there any active countries?
SELECT id, name, code, is_active, display_order
FROM countries_config
ORDER BY display_order;

-- If empty or all inactive, add East African countries:
INSERT INTO countries_config (name, code, is_active, display_order) VALUES
  ('Kenya', 'KE', true, 1),
  ('Uganda', 'UG', true, 2),
  ('Tanzania', 'TZ', true, 3),
  ('Rwanda', 'RW', true, 4),
  ('Burundi', 'BI', true, 5),
  ('South Sudan', 'SS', true, 6),
  ('Ethiopia', 'ET', true, 7),
  ('Somalia', 'SO', true, 8);
```

### 3. Check RLS Policies
```sql
-- Check if leads table has proper RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'leads'
  AND schemaname = 'public';

-- Check if training_types and countries_config are publicly readable
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('training_types', 'countries_config')
  AND schemaname = 'public';
```

### 4. Check Recent Submissions
```sql
-- See if any leads are being created
SELECT
  id,
  reference_number,
  full_name,
  email,
  training_interest,
  status,
  verified,
  created_at
FROM leads
ORDER BY created_at DESC
LIMIT 10;
```

### 5. Check Edge Function Logs
```sql
-- Check if submissions are being logged
SELECT
  ip_address,
  lead_id,
  submitted_at
FROM lead_submissions
ORDER BY submitted_at DESC
LIMIT 10;
```

---

## Common Issues & Fixes

### Issue 1: "Training Interest" Dropdown is Empty

**Symptoms:**
- Dropdown shows "Select your training interest" but no options
- Or shows "Loading training types..." indefinitely

**Root Causes:**
1. `training_types` table is empty
2. All training types have `is_active = false`
3. RLS policy blocking SELECT access

**Fix:**
```sql
-- Step 1: Check what's in the table
SELECT * FROM training_types;

-- Step 2: If empty, add training types
INSERT INTO training_types (name, description, is_active, display_order) VALUES
  ('Records Management', 'Records management training', true, 1),
  ('Information Governance', 'Information governance training', true, 2),
  ('Data Protection', 'Data protection and privacy training', true, 3),
  ('Archive Management', 'Archive and preservation training', true, 4);

-- Step 3: If RLS is blocking, add policy
DROP POLICY IF EXISTS "Anyone can view active training types" ON training_types;
CREATE POLICY "Anyone can view active training types"
ON training_types FOR SELECT
USING (is_active = true);

-- Step 4: Grant SELECT to anon users
GRANT SELECT ON training_types TO anon;
GRANT SELECT ON training_types TO authenticated;
```

---

### Issue 2: "Country" Dropdown is Empty

**Symptoms:**
- Dropdown shows "Select a country" but no options
- Or shows "Loading countries..." indefinitely

**Root Causes:**
1. `countries_config` table is empty
2. All countries have `is_active = false`
3. RLS policy blocking SELECT access

**Fix:**
```sql
-- Step 1: Check what's in the table
SELECT * FROM countries_config;

-- Step 2: If empty, add countries (East African focus)
INSERT INTO countries_config (name, code, is_active, display_order) VALUES
  ('Kenya', 'KE', true, 1),
  ('Uganda', 'UG', true, 2),
  ('Tanzania', 'TZ', true, 3),
  ('Rwanda', 'RW', true, 4),
  ('Burundi', 'BI', true, 5),
  ('Ethiopia', 'ET', true, 6),
  ('South Sudan', 'SS', true, 7),
  ('Somalia', 'SO', true, 8),
  ('Democratic Republic of Congo', 'CD', true, 9);

-- Step 3: If RLS is blocking, add policy
DROP POLICY IF EXISTS "Anyone can view active countries" ON countries_config;
CREATE POLICY "Anyone can view active countries"
ON countries_config FOR SELECT
USING (is_active = true);

-- Step 4: Grant SELECT to anon users
GRANT SELECT ON countries_config TO anon;
GRANT SELECT ON countries_config TO authenticated;
```

---

### Issue 3: Form Submission Fails with "CAPTCHA verification failed"

**Symptoms:**
- User fills form correctly
- Clicks submit
- Gets error: "CAPTCHA verification failed"

**Root Causes:**
1. Cloudflare Turnstile not loading
2. Invalid CAPTCHA token
3. CAPTCHA bypass not working in development

**Fix:**

**For Development (Temporary):**
The form should already be allowing "TEST_BYPASS" - check the code:

In [LeadForm.tsx:167](src/components/leads/LeadForm.tsx#L167):
```typescript
captchaToken: captchaToken || "TEST_BYPASS", // Allow testing without CAPTCHA
```

In [submit-lead/index.ts:61](supabase/functions/submit-lead/index.ts#L61):
```typescript
if (validatedData.captchaToken !== "TEST_BYPASS") {
  // Verify CAPTCHA
}
```

**For Production:**
1. Get Cloudflare Turnstile keys from https://dash.cloudflare.com/
2. Add to `.env`:
   ```env
   VITE_TURNSTILE_SITE_KEY=your-site-key
   ```
3. Add to Supabase Edge Function secrets:
   ```bash
   npx supabase secrets set TURNSTILE_SECRET_KEY=your-secret-key
   ```

---

### Issue 4: "Too many submissions" Error

**Symptoms:**
- User gets error: "Too many submissions. Please try again later."
- Only happens after submitting 3+ times

**Root Cause:**
- Rate limiting working as designed (max 3 submissions per IP per hour)

**Fix (for testing only):**
```sql
-- Clear rate limit for specific IP (replace XXX.XXX.XXX.XXX with actual IP)
DELETE FROM lead_submissions
WHERE ip_address = 'XXX.XXX.XXX.XXX';

-- Or clear all rate limits (CAUTION: Only for testing!)
DELETE FROM lead_submissions
WHERE submitted_at < NOW() - INTERVAL '1 hour';
```

**For Production:**
- Rate limiting is working correctly
- User should wait 1 hour before submitting again
- Or use different network/IP address

---

### Issue 5: Duplicate Email Warning Not Showing

**Symptoms:**
- User enters email that already exists
- No warning appears
- Can still submit (and gets blocked later)

**Root Causes:**
1. RLS policy preventing SELECT by email
2. Network error during check
3. Console errors

**Fix:**
```sql
-- Check if policy allows SELECT by email
SELECT * FROM pg_policies
WHERE tablename = 'leads'
AND cmd = 'SELECT';

-- Add policy to allow checking duplicates
DROP POLICY IF EXISTS "Anyone can check lead by email" ON leads;
CREATE POLICY "Anyone can check lead by email"
ON leads FOR SELECT
TO anon, authenticated
USING (true); -- Allow reading any lead for duplicate check

GRANT SELECT ON leads TO anon;
GRANT SELECT ON leads TO authenticated;
```

**Note:** This allows anyone to query leads table. For better security, consider creating a custom database function:

```sql
CREATE OR REPLACE FUNCTION check_lead_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM leads
    WHERE LOWER(email) = LOWER(email_to_check)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION check_lead_email_exists TO anon, authenticated;
```

Then update [leadDeduplicate.ts](src/utils/leadDeduplicate.ts) to use this function.

---

### Issue 6: Phone Number Not Accepting Input

**Symptoms:**
- Phone input field doesn't accept typing
- Or shows errors for valid phone numbers
- Or doesn't pre-fill country code

**Root Causes:**
1. `react-phone-number-input` library not installed
2. CSS not imported
3. Default country not set

**Fix:**
```bash
# Install the library
npm install react-phone-number-input

# Verify imports in PhoneInput.tsx
```

In [PhoneInput.tsx](src/components/leads/PhoneInput.tsx):
```typescript
import PhoneInputWithCountry from 'react-phone-number-input';
import 'react-phone-number-input/style.css'; // Important!
```

**If still not working:**
- Check browser console for errors
- Verify phone validation regex in [leadValidation.ts](src/utils/leadValidation.ts)
- Try different phone format: +254770694598

---

### Issue 7: Form Submits But No Success Message

**Symptoms:**
- Form appears to submit
- Loading spinner shows
- Nothing happens (no success, no error)

**Root Causes:**
1. Edge function returning error but not handled
2. Network timeout
3. Response parsing error

**Debug Steps:**
1. Open browser DevTools > Network tab
2. Submit form
3. Find request to `submit-lead` function
4. Check response status and body

**Common Responses:**

**400 Bad Request:**
```json
{
  "error": "Invalid input data",
  "details": [...]
}
```
Fix: Check form validation matches backend schema

**429 Too Many Requests:**
```json
{
  "error": "Too many submissions. Please try again later."
}
```
Fix: Wait 1 hour or clear rate limit (see Issue 4)

**500 Internal Server Error:**
```json
{
  "error": "Database error message..."
}
```
Fix: Check Supabase Edge Function logs

---

### Issue 8: Email Verification Not Working

**Symptoms:**
- User receives confirmation email
- Clicks verification link
- Nothing happens or error shown

**Root Causes:**
1. Verification route not set up
2. Token expired or invalid
3. Database update failing

**Check if verification route exists:**
```typescript
// Should exist in App.tsx or router config
<Route path="/verify-email" element={<VerifyEmail />} />
```

**Check verification tokens:**
```sql
-- See recent verification tokens
SELECT
  id,
  reference_number,
  email,
  verified,
  verification_token,
  verification_sent_at,
  created_at
FROM leads
WHERE verification_sent_at IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

**Manual verification (if needed):**
```sql
-- Manually verify a lead by email
UPDATE leads
SET verified = true
WHERE email = 'user@example.com';
```

---

### Issue 9: Admin Not Receiving Notification Emails

**Symptoms:**
- Lead submits successfully
- User receives confirmation
- Admin doesn't get notified

**Root Cause:**
- Admin notification not implemented in `submit-lead` function

**Fix:**
Add this to [submit-lead/index.ts](supabase/functions/submit-lead/index.ts) after user confirmation email:

```typescript
// Send admin notification
try {
  await supabase.functions.invoke("send-admin-notification", {
    body: {
      leadId: lead.id,
      referenceNumber: lead.reference_number,
      fullName: validatedData.full_name,
      email: validatedData.email,
      phone: validatedData.phone,
      organization: validatedData.organization,
      trainingInterest: validatedData.training_interest,
      message: validatedData.message,
    },
  });
} catch (error) {
  console.error("Failed to send admin notification:", error);
  // Don't throw - submission was successful
}
```

---

### Issue 10: Pre-selection from Event Page Not Working

**Symptoms:**
- User clicks "Register Interest" on event page
- Form loads but training interest is not pre-selected
- URL has `?event=xxx` parameter

**Root Causes:**
1. Event ID doesn't match any training type
2. Training type is inactive
3. useEffect not triggering

**Debug:**
1. Check URL parameter: Should be `/register-interest?event={training_type_id}`
2. Check console: Should see event ID being set

**Fix:**
```sql
-- Find training type IDs
SELECT id, name FROM training_types WHERE is_active = true;

-- Copy the correct ID and use in URL
-- Example: /register-interest?event=abc-123-def-456
```

**Verify code in [RegisterInterest.tsx](src/pages/RegisterInterest.tsx):**
```typescript
const eventId = searchParams.get('event'); // Gets ID from URL
// ...
<LeadForm onSuccess={handleSuccess} initialEventId={eventId || undefined} />
```

---

## Testing Checklist

Use this checklist to verify everything works:

### Form Display:
- [ ] Form loads without console errors
- [ ] All fields are visible
- [ ] Phone input shows country selector
- [ ] CAPTCHA widget loads
- [ ] Required field markers (*) are shown

### Dropdowns:
- [ ] Country dropdown shows list of countries
- [ ] Training interest dropdown shows list of training types
- [ ] "How did you hear about us?" dropdown works
- [ ] Dropdowns are searchable/scrollable

### Validation:
- [ ] Name field rejects numbers/special chars
- [ ] Email field shows error for invalid format
- [ ] Phone field accepts international format
- [ ] Message field requires 10+ characters
- [ ] Empty required fields show error messages

### Duplicate Detection:
- [ ] Entering existing email shows warning
- [ ] Warning includes reference number and date
- [ ] Cannot submit with duplicate email

### Submission:
- [ ] Submit button is disabled while submitting
- [ ] Loading spinner shows during submission
- [ ] Success message appears after submission
- [ ] Reference number is displayed
- [ ] Auto-redirect works after 5 seconds

### Email:
- [ ] Confirmation email received within 1 minute
- [ ] Email contains reference number
- [ ] Email contains verification link
- [ ] Verification link works

### Admin View:
- [ ] New lead appears in admin dashboard
- [ ] Activity log shows "Lead Created"
- [ ] All form data is saved correctly
- [ ] Status is set to "new"

### Rate Limiting:
- [ ] Can submit 3 times within 1 hour
- [ ] 4th submission within 1 hour is blocked
- [ ] Error message is user-friendly

### Pre-selection:
- [ ] Coming from event page pre-selects training
- [ ] Can still change training selection
- [ ] Works with direct URL: `/register-interest?event={id}`

---

## Emergency Fixes

If form is completely broken and users need to register:

### Option 1: Disable RLS Temporarily (NOT RECOMMENDED FOR PRODUCTION)
```sql
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE training_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE countries_config DISABLE ROW LEVEL SECURITY;
```

**Remember to re-enable after fixing!**

### Option 2: Create Manual Lead Entry Form in Admin
Add a button in admin panel to manually create leads when form is down.

### Option 3: Use Alternative Contact Methods
- Phone: +254 770 694 598, +254 721 490 862
- Email: info@informationassetsworld.com
- Manually create leads from these inquiries

---

## Getting Help

If issues persist:

1. **Check Supabase Dashboard:**
   - Edge Function logs
   - Database logs
   - API logs

2. **Check Browser Console:**
   - JavaScript errors
   - Network errors
   - API responses

3. **Enable Debug Mode:**
   Add to form:
   ```typescript
   console.log('Form data:', data);
   console.log('Validation errors:', errors);
   console.log('CAPTCHA token:', captchaToken);
   ```

4. **Test with cURL:**
   ```bash
   curl -X POST https://gppohyyuggnfecfabcyz.supabase.co/functions/v1/submit-lead \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -d '{
       "full_name": "Test User",
       "email": "test@example.com",
       "phone": "+254700000000",
       "organization": "Test Org",
       "country": "Kenya",
       "training_interest": "Records Management",
       "source": "Website",
       "message": "This is a test submission",
       "captchaToken": "TEST_BYPASS"
     }'
   ```
