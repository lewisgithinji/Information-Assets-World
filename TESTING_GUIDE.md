# Testing Guide: Event Registration Implementation

## Pre-Testing Checklist

Before testing the form, ensure these steps are complete:

### ✅ Step 1: Database Changes Applied
Run the SQL in Supabase SQL Editor (you've selected it - copy and run it now):
- URL: https://supabase.com/dashboard/project/gppohyyuggnfecfabcyz/editor
- Paste the SQL from `APPLY_EVENT_REGISTRATION_CHANGES.sql`
- Click "Run"
- Verify you see 4 columns in the results (event_id, inquiry_type, training_interest, message)

### ✅ Step 2: Edge Function Deployed
```bash
cd "F:\Projects\Information-Assets-World"
npx supabase functions deploy submit-lead
```

### ✅ Step 3: Frontend Running
```bash
npm run dev
```

---

## Testing Plan

### Test 1: Database Schema Verification

**Run this in Supabase SQL Editor:**
```sql
-- Check columns were added
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'leads'
  AND column_name IN ('event_id', 'inquiry_type', 'training_interest', 'message')
ORDER BY column_name;
```

**Expected Results:**
```
event_id          | uuid | YES | NULL
inquiry_type      | text | NO  | 'contact_discuss'::text
message           | text | YES | NULL
training_interest | text | YES | NULL
```

**✅ PASS if:** All 4 columns show with correct nullable settings
**❌ FAIL if:** Any column is missing or has wrong nullable setting

---

### Test 2: Events Available

**Run this in Supabase SQL Editor:**
```sql
-- Check for upcoming published events
SELECT
  id,
  title,
  start_date,
  end_date,
  location,
  status
FROM events
WHERE status = 'published'
  AND start_date >= CURRENT_DATE
ORDER BY start_date
LIMIT 10;
```

**Expected Results:** At least 1 event with future date

**If NO EVENTS exist, create a sample:**
```sql
INSERT INTO events (
  title,
  description,
  start_date,
  end_date,
  location,
  status,
  event_type,
  category
) VALUES (
  'Records Management Professional Training 2025',
  'Comprehensive professional training in records management, information governance, and compliance.',
  '2025-12-15',
  '2025-12-17',
  'Nairobi, Kenya',
  'published',
  'training',
  'Professional Development'
);
```

**✅ PASS if:** Query returns at least 1 event
**❌ FAIL if:** No events found (run INSERT above)

---

### Test 3: Form Loads Correctly

**Manual Test:**
1. Navigate to: `http://localhost:5173/register-interest`
2. Wait for form to load

**Verify:**
- [ ] Form displays without errors
- [ ] All fields are visible
- [ ] Phone input shows country selector
- [ ] No console errors (open DevTools > Console)

**✅ PASS if:** Form loads cleanly
**❌ FAIL if:** Console shows errors or fields missing

---

### Test 4: Events Dropdown Populates

**Manual Test:**
1. On the form, click the "Select Event *" dropdown

**Verify:**
- [ ] Dropdown opens
- [ ] Events are listed with:
  - Event title (bold)
  - Date and location (smaller text)
- [ ] Can select an event
- [ ] Selected event shows in field

**✅ PASS if:** Events load and can be selected
**❌ FAIL if:** Dropdown shows "No upcoming events available" or "Loading events..." indefinitely

**Debug if FAIL:**
- Check browser Network tab for API calls to `/events`
- Check console for errors
- Verify events exist in database (Test 2)

---

### Test 5: Inquiry Type Dropdown Works

**Manual Test:**
1. Click "What would you like us to do? *" dropdown

**Verify all 6 options display:**
- [ ] 📧 Send me the Event Writeup/Invitation
- [ ] 📞 Contact Me to Discuss the Event
- [ ] ✅ Ready to Register Now
- [ ] 👥 Group Registration (3+ People)
- [ ] 🏢 Request Custom Corporate Training
- [ ] 📰 Just Browsing/Stay Updated

**Verify each option:**
- [ ] Has emoji icon
- [ ] Has title (bold)
- [ ] Has description (smaller text)
- [ ] Can be selected

**✅ PASS if:** All 6 options show and are selectable
**❌ FAIL if:** Options missing or not clickable

---

### Test 6: Message Field is Optional

**Manual Test:**
1. Fill out form completely EXCEPT message field
2. Leave message field empty
3. Try to submit

**Verify:**
- [ ] Form allows submission without message
- [ ] No validation error for empty message

**Then test with message:**
1. Type exactly 501 characters in message field
2. Try to submit

**Verify:**
- [ ] Shows error: "Message must be less than 500 characters"
- [ ] Character counter shows "501/500 characters"

**✅ PASS if:** Empty message allowed, 501 chars rejected
**❌ FAIL if:** Empty message triggers required error

---

### Test 7: Form Submission - "Send Writeup"

**Manual Test:**
1. Fill out form completely:
   - Full Name: Test User 1
   - Email: test1@example.com
   - Phone: +254712345678
   - Organization: Test Organization
   - Country: Kenya
   - Event: [Select any event]
   - Inquiry Type: **📧 Send me the Event Writeup/Invitation**
   - Message: Leave empty
2. Complete CAPTCHA (or it should bypass with TEST_BYPASS)
3. Click "Submit Inquiry"

**Verify:**
- [ ] Loading spinner shows
- [ ] Success toast appears
- [ ] Reference number displayed
- [ ] Success page shows
- [ ] Auto-redirect starts (5 seconds)

**Then verify in database:**
```sql
SELECT
  id,
  full_name,
  email,
  event_id,
  inquiry_type,
  priority,
  status,
  message,
  created_at
FROM leads
WHERE email = 'test1@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- full_name: "Test User 1"
- inquiry_type: "send_writeup"
- priority: "medium"
- status: "new"
- message: NULL
- event_id: [UUID of selected event]

**✅ PASS if:** Lead created with correct data
**❌ FAIL if:** Error on submission or wrong data saved

---

### Test 8: Form Submission - "Contact to Discuss" (High Priority)

**Manual Test:**
1. Fill out form:
   - Full Name: Test User 2
   - Email: test2@example.com
   - Inquiry Type: **📞 Contact Me to Discuss the Event**
   - Message: "I have specific questions about group discounts"
2. Submit

**Verify in database:**
```sql
SELECT inquiry_type, priority, message
FROM leads
WHERE email = 'test2@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- inquiry_type: "contact_discuss"
- priority: "high"
- message: "I have specific questions about group discounts"

**✅ PASS if:** Priority is HIGH and message is saved
**❌ FAIL if:** Priority is wrong or message lost

---

### Test 9: Form Submission - "Ready to Register" (Hottest Lead)

**Manual Test:**
1. Fill out form:
   - Email: test3@example.com
   - Inquiry Type: **✅ Ready to Register Now**
2. Submit

**Verify in database:**
```sql
SELECT inquiry_type, priority
FROM leads
WHERE email = 'test3@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- inquiry_type: "register_now"
- priority: "high"

**✅ PASS if:** Priority is HIGH
**❌ FAIL if:** Priority is not high

---

### Test 10: Form Submission - "Just Browsing" (Low Priority)

**Manual Test:**
1. Fill out form:
   - Email: test4@example.com
   - Inquiry Type: **📰 Just Browsing/Stay Updated**
2. Submit

**Verify in database:**
```sql
SELECT inquiry_type, priority
FROM leads
WHERE email = 'test4@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- inquiry_type: "just_browsing"
- priority: "low"

**✅ PASS if:** Priority is LOW
**❌ FAIL if:** Priority is not low

---

### Test 11: Activity Log Created

**Verify activity was logged:**
```sql
SELECT
  a.activity_type,
  a.summary,
  a.details,
  l.email
FROM activities a
JOIN leads l ON a.lead_id = l.id
WHERE l.email IN ('test1@example.com', 'test2@example.com')
ORDER BY a.created_at DESC;
```

**Expected:**
- activity_type: "note"
- summary: "Lead Created via Website Form"
- details should mention:
  - "Event ID: [uuid]"
  - "Inquiry Type: Send Event Writeup" (or other type)
  - "Priority: medium" (or other priority)

**✅ PASS if:** Activity logs created with event and inquiry info
**❌ FAIL if:** No activities or missing event/inquiry data

---

### Test 12: Event Pre-selection from URL

**Manual Test:**
1. Get an event ID from database:
```sql
SELECT id, title FROM events WHERE status = 'published' LIMIT 1;
```

2. Navigate to: `http://localhost:5173/register-interest?event=[PASTE_EVENT_ID_HERE]`

**Verify:**
- [ ] Form loads
- [ ] Event dropdown is pre-selected with the correct event
- [ ] Can still change to different event if desired

**✅ PASS if:** Event pre-selected correctly
**❌ FAIL if:** Event not pre-selected or wrong event

---

### Test 13: Duplicate Email Detection

**Manual Test:**
1. Try to submit form with email that already exists (e.g., test1@example.com)
2. Type email and click outside the email field (onBlur)

**Verify:**
- [ ] Warning message appears showing:
  - Reference number of existing lead
  - Date of previous submission
  - Current status
- [ ] Cannot submit form (blocked)

**✅ PASS if:** Duplicate detected and blocked
**❌ FAIL if:** Can submit duplicate email

---

### Test 14: Validation Errors

**Manual Test - Test each validation:**

1. **Name validation:**
   - Enter "A" → Should error "Name must be at least 2 characters"
   - Enter "123" → Should error "Name contains invalid characters"

2. **Email validation:**
   - Enter "notanemail" → Should error "Invalid email address"

3. **Phone validation:**
   - Enter "123" → Should error "Phone number is too short"

4. **Organization:**
   - Enter "A" → Should error "Organization name is required"

5. **Event:**
   - Leave empty → Should error "Please select an event"

6. **Inquiry Type:**
   - Leave empty → Should error "Please select what you'd like us to do"

**✅ PASS if:** All validations work correctly
**❌ FAIL if:** Any validation fails or allows invalid data

---

### Test 15: Old Leads Still Work

**If you have old leads in database:**
```sql
-- Check if old leads display correctly
SELECT
  id,
  full_name,
  email,
  training_interest,
  event_id,
  inquiry_type
FROM leads
WHERE created_at < '2025-11-03'
LIMIT 5;
```

**Verify:**
- Old leads have training_interest populated
- Old leads have event_id = NULL
- Old leads have inquiry_type = 'contact_discuss' (default)

**✅ PASS if:** Old leads still exist and have defaults
**❌ FAIL if:** Old leads broken or missing

---

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Database Schema | ⬜ | |
| 2. Events Available | ⬜ | |
| 3. Form Loads | ⬜ | |
| 4. Events Dropdown | ⬜ | |
| 5. Inquiry Type Dropdown | ⬜ | |
| 6. Message Optional | ⬜ | |
| 7. Send Writeup Submission | ⬜ | |
| 8. Contact Discuss Submission | ⬜ | |
| 9. Ready to Register Submission | ⬜ | |
| 10. Just Browsing Submission | ⬜ | |
| 11. Activity Log | ⬜ | |
| 12. Event Pre-selection | ⬜ | |
| 13. Duplicate Detection | ⬜ | |
| 14. Validation Errors | ⬜ | |
| 15. Old Leads Compatibility | ⬜ | |

Mark each test: ✅ PASS, ❌ FAIL, ⚠️ PARTIAL

---

## Common Issues & Quick Fixes

### Issue: "No upcoming events available"
```sql
-- Quick fix: Create a test event
INSERT INTO events (title, description, start_date, end_date, location, status, event_type)
VALUES ('Test Event', 'Test Description', '2025-12-31', '2025-12-31', 'Test Location', 'published', 'training');
```

### Issue: Form submission fails with "Invalid input data"
- Check browser console for detailed validation errors
- Verify all required fields are filled
- Check that event_id is a valid UUID

### Issue: "CAPTCHA verification failed"
- Should auto-bypass with "TEST_BYPASS" in development
- Check that captchaToken is being sent in request

### Issue: Can't see new lead in database
```sql
-- Check if lead was created
SELECT * FROM leads ORDER BY created_at DESC LIMIT 5;
```

---

## Next Steps After Testing

Once all tests pass:

1. **Deploy to Production:**
   ```bash
   git add .
   git commit -m "feat: implement event registration and inquiry types"
   git push
   ```

2. **Update Admin Dashboard** to show event titles and inquiry type badges

3. **Phase 2: Global Countries** expansion

4. **Phase 3: Confirmation Workflow** with automated emails

---

**Need help with any failed tests?** Share the test number and error message!
