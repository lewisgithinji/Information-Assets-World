# Register Interest Form - How It Works

## Overview
The Register Interest Form allows potential trainees to inquire about training programs. It's a multi-layered system with validation, security, and automation.

---

## User Flow

### 1. **Form Access**
- **URL**: `/register-interest` or `/register-interest?event={eventId}`
- If an `event` parameter is provided, the form pre-selects that training type
- Example: `/register-interest?event=abc-123` will pre-select the training with ID `abc-123`

### 2. **Form Fields**
Users must fill out the following fields:

#### Required Fields:
- **Full Name**: 2-100 characters, letters, spaces, hyphens, and apostrophes only
- **Email Address**: Valid email format
- **Phone Number**: 10-20 digits with international format support
- **Organization**: 2-200 characters
- **Country**: Selected from dropdown (loaded from `countries_config` table)
- **Training Interest**: Selected from dropdown (loaded from `training_types` table)
- **Message**: 10-1000 characters describing training needs

#### Optional Fields:
- **How did you hear about us?**: Default is "Website"

#### Hidden Security Fields:
- **Honeypot fields** (`website`, `company_name`): Hidden from users, if filled by bots, submission is rejected
- **CAPTCHA Token**: Cloudflare Turnstile verification (currently bypassed for testing)

### 3. **Real-time Validation**

#### Email Duplicate Check:
- When user leaves the email field (onBlur), the system checks for duplicates
- If email already exists in the database, shows a warning with:
  - Reference number of existing submission
  - Date of previous submission
  - Status of previous inquiry
- User can still see the warning but cannot submit (duplicate submissions are blocked)

#### Form Validation:
- Uses **Zod** schema validation on the frontend
- All fields validated before submission
- Error messages shown under each invalid field

### 4. **Submission Process**

When user clicks "Submit Inquiry", the following happens:

#### Frontend (LeadForm.tsx):
1. **Form validation** - Checks all required fields
2. **Duplicate check** - Final check for duplicate email
3. **Calls Edge Function** - Sends data to `submit-lead` Supabase function

#### Backend (submit-lead/index.ts):
1. **CORS handling** - Allows cross-origin requests
2. **Honeypot check** - Rejects if honeypot fields are filled
3. **Input validation** - Re-validates all data with Zod schema
4. **CAPTCHA verification** - Verifies Cloudflare Turnstile token (bypassed if "TEST_BYPASS")
5. **Rate limiting** - Checks if IP has submitted more than 3 times in last hour
6. **Generate verification token** - Creates unique token for email verification
7. **Insert lead** - Saves to `leads` table with:
   - All form data
   - Status: "new"
   - Verified: false
   - Reference number (auto-generated)
   - Verification token
8. **Log IP submission** - Records to `lead_submissions` table for rate limiting
9. **Log activity** - Creates activity record in `activities` table
10. **Send confirmation email** - Calls `send-lead-confirmation` function with:
    - User's name and email
    - Training interest
    - Reference number
    - Verification URL

### 5. **Success Response**

After successful submission, user sees:
- ✅ Success message with reference number
- Contact information (phone numbers and email)
- List of what happens next:
  - Team will contact within 24 hours
  - Discussion about training programs
  - Customized solutions
  - Pricing and payment options
- Auto-redirect to homepage after 5 seconds

---

## Database Schema

### Tables Used:

#### 1. `leads` table
Stores all lead submissions:
```sql
- id (UUID)
- reference_number (auto-generated, e.g., "REF-2024-001")
- full_name
- email
- phone
- organization
- country
- training_interest
- source (how they heard about us)
- message
- status (new, contacted, qualified, etc.)
- verified (boolean)
- verification_token (UUID)
- verification_sent_at
- created_at
- updated_at
```

#### 2. `training_types` table
Available training programs:
```sql
- id (UUID)
- name (e.g., "Records Management")
- description
- is_active (boolean)
- display_order (for sorting)
```

#### 3. `countries_config` table
Available countries:
```sql
- id (UUID)
- name (e.g., "Kenya")
- code (e.g., "KE")
- is_active (boolean)
- display_order (for sorting)
```

#### 4. `lead_submissions` table
Tracks submissions by IP for rate limiting:
```sql
- id (UUID)
- ip_address
- lead_id (FK to leads)
- submitted_at (timestamp)
```

#### 5. `activities` table
Tracks all activities related to leads:
```sql
- id (UUID)
- lead_id (FK to leads)
- activity_type (e.g., "note", "call", "email")
- summary
- details
- created_at
```

---

## Security Features

### 1. **Honeypot Protection**
- Hidden fields that humans won't see but bots will fill
- If filled, submission is immediately rejected

### 2. **CAPTCHA Verification**
- Cloudflare Turnstile (better than reCAPTCHA)
- Currently bypassed for testing with "TEST_BYPASS" token
- In production, will verify each submission

### 3. **Rate Limiting**
- Maximum 3 submissions per IP address per hour
- Prevents spam and abuse
- Returns 429 (Too Many Requests) if exceeded

### 4. **Input Sanitization**
- All inputs validated with Zod schema
- Regex patterns for name, phone, email
- Length limits on all fields
- Prevents SQL injection and XSS attacks

### 5. **Duplicate Detection**
- Checks for existing email before submission
- Warns user if already submitted
- Blocks duplicate submissions

---

## Email Verification Flow

After submission, user receives an email with:
1. Thank you message
2. Reference number
3. Verification link: `/verify-email?token={verificationToken}`
4. Contact information

When user clicks verification link:
- Token is validated
- `verified` field in `leads` table is set to `true`
- Confirmation message shown

---

## Admin View

Admins can see all leads in the Admin Dashboard:
- View all submissions
- Filter by status, date, training interest
- See verification status
- Add notes and activities
- Schedule follow-ups
- Update lead status

---

## Common Issues & Solutions

### Issue 1: Country/Training Type Dropdowns Empty
**Cause**: `training_types` or `countries_config` tables are empty or all records have `is_active = false`

**Solution**:
1. Check Supabase database
2. Ensure tables have records with `is_active = true`
3. Verify RLS policies allow public SELECT access

### Issue 2: Form Submission Fails
**Possible Causes**:
- Rate limit exceeded (3 submissions per hour per IP)
- CAPTCHA verification failed
- Database insert error
- Network/Edge function error

**Debug Steps**:
1. Check browser console for errors
2. Check Supabase Edge Function logs
3. Verify `submit-lead` function is deployed
4. Check database permissions and RLS policies

### Issue 3: Email Not Received
**Possible Causes**:
- `send-lead-confirmation` function not deployed
- Email service not configured
- Email in spam folder

**Debug Steps**:
1. Check Edge Function logs for `send-lead-confirmation`
2. Verify email service configuration
3. Check user's spam folder

### Issue 4: Duplicate Detection Not Working
**Cause**: Database query failing or RLS policy blocking SELECT

**Solution**:
1. Check `checkDuplicateLead` function in `src/utils/leadDeduplicate.ts`
2. Verify RLS policy on `leads` table allows SELECT by email
3. Check browser console for errors

### Issue 5: Pre-selection from Event Page Not Working
**Cause**: `initialEventId` not matching any training type ID

**Solution**:
1. Verify event ID in URL parameter matches a training_types.id
2. Check that training type has `is_active = true`
3. Verify the event page is passing the correct event ID

---

## Testing Checklist

- [ ] Form loads without errors
- [ ] Country dropdown populates
- [ ] Training type dropdown populates
- [ ] Pre-selection works when coming from event page
- [ ] All validation messages show correctly
- [ ] Duplicate email detection works
- [ ] Phone number input accepts international format
- [ ] CAPTCHA loads (or bypass works in testing)
- [ ] Form submits successfully
- [ ] Success message shows with reference number
- [ ] Confirmation email is sent
- [ ] Lead appears in admin dashboard
- [ ] Activity log is created
- [ ] Rate limiting works (try 4 submissions in 1 hour)
- [ ] Honeypot blocks bots
- [ ] Auto-redirect works after 5 seconds

---

## Configuration

### Environment Variables:
```env
VITE_TURNSTILE_SITE_KEY=your-cloudflare-turnstile-site-key
TURNSTILE_SECRET_KEY=your-cloudflare-turnstile-secret-key (Edge Function)
```

### Supabase Edge Functions:
1. `submit-lead` - Main form submission handler
2. `send-lead-confirmation` - Email confirmation sender

### Database Tables Required:
1. `leads` - Main storage
2. `training_types` - Training options
3. `countries_config` - Country options
4. `lead_submissions` - Rate limiting
5. `activities` - Activity tracking

---

## Next Steps for Production

1. **Enable CAPTCHA**: Remove "TEST_BYPASS" and use real Cloudflare Turnstile
2. **Configure Email Service**: Set up proper email delivery (Resend, SendGrid, etc.)
3. **Add Admin Notifications**: Email admin when new lead submitted
4. **Enhanced Analytics**: Track conversion rates, popular training types
5. **A/B Testing**: Test different form layouts
6. **Multi-language Support**: Add translations for international users
