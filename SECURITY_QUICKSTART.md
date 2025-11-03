# Security Center - Quick Start Guide

## 🚀 Quick Deployment (5 Minutes)

Follow these steps to activate the new security features:

### Step 1: Apply Database Migration (2 minutes)

**Using Supabase Dashboard:**
1. Go to https://app.supabase.com/project/gppohyyuggnfecfabcyz
2. Click "SQL Editor" in left sidebar
3. Click "New Query"
4. Open file: `supabase/migrations/20251031000001_create_security_tables.sql`
5. Copy ALL contents and paste into SQL Editor
6. Click "Run" button
7. Wait for "Success" message

**Verify Success:**
- Go to "Table Editor"
- You should see 6 new tables:
  - `login_attempts`
  - `audit_logs`
  - `user_sessions`
  - `password_reset_tokens`
  - `user_security_settings`
  - `security_events`

---

### Step 2: Test the Features (3 minutes)

**Test Account Lockout:**
1. Open your app in browser
2. Go to login page
3. Try logging in with WRONG password 5 times
4. On 3rd attempt, you should see: "2 attempts remaining before account lockout"
5. On 5th attempt, you should see: "Account locked until [time]"
6. Account is now locked for 30 minutes!

**Test Audit Logging:**
1. Login successfully with correct credentials
2. Open Supabase Dashboard → Table Editor → `audit_logs`
3. You should see a new row with action = "auth.login.success"
4. Sign out
5. Check `audit_logs` again → new row with action = "auth.logout"

**Test Login Tracking:**
1. Check Table Editor → `login_attempts`
2. You should see rows for each login attempt
3. Each row shows: email, success status, IP address, timestamp

---

### Step 3: Unlock Your Test Account (if locked)

If you locked yourself out during testing:

**Option A: Wait 30 Minutes**
- System will auto-unlock

**Option B: Manual Unlock via SQL**
1. Go to SQL Editor in Supabase
2. Find your user_id:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'your@email.com';
   ```
3. Copy the user_id
4. Run unlock query:
   ```sql
   UPDATE user_security_settings
   SET account_locked = false,
       locked_until = NULL,
       failed_login_count = 0
   WHERE user_id = 'PASTE_YOUR_USER_ID_HERE';
   ```
5. Try logging in again - should work!

---

## 📊 View Security Data

### See All Login Attempts:
```sql
SELECT
  email,
  success,
  failure_reason,
  ip_address,
  timestamp
FROM login_attempts
ORDER BY timestamp DESC
LIMIT 50;
```

### See Audit Logs:
```sql
SELECT
  a.action,
  a.resource_type,
  a.timestamp,
  u.email as actor_email
FROM audit_logs a
LEFT JOIN auth.users u ON u.id = a.actor_id
ORDER BY a.timestamp DESC
LIMIT 50;
```

### Check Locked Accounts:
```sql
SELECT
  u.email,
  s.account_locked,
  s.locked_until,
  s.locked_reason,
  s.failed_login_count
FROM user_security_settings s
JOIN auth.users u ON u.id = s.user_id
WHERE s.account_locked = true;
```

### See Failed Login Statistics:
```sql
SELECT
  COUNT(*) as total_failed_attempts,
  COUNT(DISTINCT email) as unique_users,
  COUNT(DISTINCT ip_address) as unique_ips
FROM login_attempts
WHERE success = false
  AND timestamp > NOW() - INTERVAL '24 hours';
```

---

## 🔧 Common Tasks

### Unlock a User Account:
```sql
UPDATE user_security_settings
SET account_locked = false,
    locked_until = NULL,
    failed_login_count = 0,
    locked_reason = NULL
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

### Lock a User Account (Admin):
```sql
UPDATE user_security_settings
SET account_locked = true,
    locked_until = NULL,  -- NULL = permanent lock
    locked_reason = 'Suspicious activity detected'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

### View User's Login History:
```sql
SELECT
  success,
  failure_reason,
  ip_address,
  timestamp
FROM login_attempts
WHERE email = 'user@example.com'
ORDER BY timestamp DESC
LIMIT 20;
```

### Clear Old Login Attempts (cleanup):
```sql
DELETE FROM login_attempts
WHERE timestamp < NOW() - INTERVAL '90 days';
```

---

## ⚙️ Configuration

### Change Lockout Settings:

Edit `src/types/security.ts`:
```typescript
export const SECURITY_CONSTANTS = {
  MAX_LOGIN_ATTEMPTS: 5,        // Change to 3 for stricter
  LOCKOUT_DURATION_MINUTES: 30, // Change to 60 for 1 hour
  // ...
};
```

Then rebuild your app:
```bash
npm run build
```

---

## 🎯 What's Working Now

✅ **Login Tracking**
- Every login attempt is recorded
- Shows email, IP, success/failure
- Tracks timestamps

✅ **Account Lockout**
- Automatic after 5 failed attempts
- 30-minute lockout duration
- Shows remaining attempts
- Auto-unlocks after timeout

✅ **Audit Logging**
- All logins logged
- All logouts logged
- Ready for admin actions (when UI is built)

✅ **Security Monitoring**
- Failed login statistics
- Locked account tracking
- Login history per user

---

## 🚧 Not Yet Implemented

❌ Password Reset Flow (coming in next update)
❌ User Management UI (coming in next update)
❌ Session Timeout (coming in next update)
❌ Activity Log Viewer UI (Phase 2)
❌ 2FA Support (Phase 3)

---

## 📱 User Experience

### What Users See:

**Normal Login:**
- "Welcome back! You have been signed in successfully."

**Failed Login (1st-2nd attempt):**
- "Sign in failed. Invalid login credentials."

**Failed Login (3rd-4th attempt):**
- "Sign in failed. Invalid login credentials. 2 attempt(s) remaining before account lockout."

**Account Locked:**
- "Account Locked. Account is locked until 10/31/2025 2:30 PM. Too many failed login attempts."

**Attempting Login While Locked:**
- "Account Locked. Account is locked until 10/31/2025 2:30 PM. Too many failed login attempts."

---

## 🆘 Support

### If Login Tracking Isn't Working:

1. **Check browser console for errors**
   - Press F12
   - Go to Console tab
   - Look for red errors

2. **Check Supabase logs**
   - Go to Supabase Dashboard
   - Click "Logs" → "Database"
   - Look for errors

3. **Verify migration applied**
   - Go to Table Editor
   - Check if tables exist

4. **Check RLS policies**
   - Go to SQL Editor
   - Run: `SELECT * FROM login_attempts LIMIT 1;`
   - Should see data or "no rows"
   - If error = RLS issue

### If Account Is Stuck Locked:

Use the manual unlock SQL query above, or contact support.

---

## 📈 Metrics Dashboard (Coming Soon)

In next update, you'll see:
- Failed logins (last 24h)
- Active locked accounts
- Security events by severity
- Login success rate
- Most common failure reasons
- Geogra phic distribution of logins

---

## ✅ Success Checklist

After deployment, verify:
- [ ] 6 new tables created in Supabase
- [ ] Can login with correct password
- [ ] Failed login increments counter
- [ ] Account locks after 5 failures
- [ ] Shows "attempts remaining" warning
- [ ] Audit log captures login/logout
- [ ] login_attempts table has records
- [ ] Manual unlock query works

---

**Last Updated:** October 31, 2025
**Version:** Phase 1 - Foundation
**Status:** 60% Complete (6/10 features)
