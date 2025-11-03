# Session Creation Troubleshooting Guide

## Issue
Session creation is failing with a 400 error despite running UPDATE_USER_SESSIONS_TABLE.sql multiple times.

## What I Just Fixed

### Fix #1: Removed Manual `created_at`
**Problem**: The code was manually setting `created_at` during insert, which might conflict with database defaults.

**Changed in `src/utils/sessionManagement.ts`**:
```typescript
// BEFORE (potentially problematic):
.insert({
  user_id: userId,
  device_info: deviceInfo,
  ip_address: ipAddress || null,
  location: location || null,
  created_at: new Date().toISOString(),  // ← This might be the issue
  last_activity: new Date().toISOString(),
  expires_at: expiresAt.toISOString(),
  is_active: true,
})

// AFTER (let database handle created_at):
.insert({
  user_id: userId,
  device_info: deviceInfo,
  ip_address: ipAddress || null,
  location: location || null,
  // created_at removed - database will auto-generate it
  last_activity: new Date().toISOString(),
  expires_at: expiresAt.toISOString(),
  is_active: true,
})
```

## Testing Steps

### Step 1: Clear Browser Cache
The old code might be cached. Do a hard refresh:
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### Step 2: Check if Fix Worked
1. Log out of your application
2. Log back in
3. Open browser console (F12)
4. Look for:
   - ✅ `Session created: <session-id>` ← Success!
   - ❌ `Error creating session:` ← Still failing

### Step 3: If Still Failing - Run Diagnostics

#### Option A: Run CHECK_USER_SESSIONS_SCHEMA.sql
This will show you exactly what columns exist:
```sql
-- In Supabase SQL Editor, run:
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_sessions'
ORDER BY ordinal_position;
```

**Expected columns:**
- `id` (uuid)
- `user_id` (uuid)
- `device_info` (jsonb)
- `ip_address` (text)
- `location` (jsonb)
- `created_at` (timestamp with time zone)
- `last_activity` (timestamp with time zone)
- `expires_at` (timestamp with time zone)
- `is_active` (boolean)

#### Option B: Run DIAGNOSE_SESSION_INSERT.sql
This comprehensive diagnostic will:
1. Show table structure
2. Check existing data
3. Verify RLS policies
4. Test a manual insert
5. Check constraints and triggers

### Step 4: Common Issues and Solutions

#### Issue 1: Column doesn't exist
**Symptom**: Error mentions "column X does not exist"

**Solution**: The UPDATE script didn't run properly. Try this alternative:
```sql
-- Drop and recreate the table (WARNING: This deletes all session data)
DROP TABLE IF EXISTS public.user_sessions;

CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  location JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Then run the entire UPDATE_USER_SESSIONS_TABLE.sql again
```

#### Issue 2: RLS Policy Blocking Insert
**Symptom**: 400 error but columns exist

**Solution**: Check if you're authenticated:
```sql
-- In Supabase SQL Editor
SELECT auth.uid(); -- Should return your user ID, not null
```

If null, the RLS policy is blocking because you're not authenticated.

**Quick fix**: Temporarily disable RLS for testing:
```sql
ALTER TABLE public.user_sessions DISABLE ROW LEVEL SECURITY;
```

**Remember to re-enable it after testing:**
```sql
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
```

#### Issue 3: Wrong user_id format
**Symptom**: Foreign key violation

**Solution**: Verify the user_id being passed is a valid UUID from auth.users:
```sql
-- Check if your user exists
SELECT id, email FROM auth.users WHERE id = '<your-user-id>';
```

#### Issue 4: JSONB Format Error
**Symptom**: Invalid input syntax for type json/jsonb

**Solution**: Already handled in the code - we're passing objects, not strings. But if this happens, check that:
```typescript
// deviceInfo should be:
{ browser: "Chrome", os: "Windows 11", device: "Desktop" }

// NOT:
'{"browser": "Chrome", "os": "Windows 11", "device": "Desktop"}'
```

## What to Share for Further Help

If still not working after trying above, please share:

1. **Output from CHECK_USER_SESSIONS_SCHEMA.sql**
   - Shows actual table structure

2. **Browser Console Errors**
   - Full error message from `console.error('Error creating session:', error)`

3. **Supabase Dashboard Logs**
   - Go to: Database → Logs
   - Filter by: user_sessions
   - Copy any error messages

4. **RLS Policy Check**
   ```sql
   SELECT policyname, cmd, permissive
   FROM pg_policies
   WHERE tablename = 'user_sessions';
   ```

5. **Manual Insert Test Result**
   - Run DIAGNOSE_SESSION_INSERT.sql
   - Uncomment the test block
   - Share success/error message

## Next Steps After Fix

Once sessions are creating successfully:

1. ✅ Navigate to Security Center → Sessions tab
2. ✅ You should see:
   - Active Sessions: 1
   - Active Users: 1
   - Your current session in the table
3. ✅ Test multiple logins from different browsers
4. ✅ Test session termination
5. ✅ Test logout (terminates all sessions)

## Expected Behavior

### On Login:
```
Console Output:
✅ Login successful, logging activity... { userId: '...', email: '...' }
✅ Creating session for user <user-id>
✅ Session created: <session-id>
✅ Successfully created session <session-id> for user <user-id>
✅ Login activity logged successfully
```

### On Logout:
```
Console Output:
✅ Terminating all sessions for user <user-id>, reason: User logged out
✅ Successfully terminated X sessions for user <user-id>
✅ All sessions terminated for user: <user-id>
```

### In Security Center → Sessions:
```
┌─────────────────────────────────────────────┐
│ Active Sessions: 1        🔵 Currently online
│ Active Users: 1           🟢 Unique logins
│ Avg Sessions/User: 1.0    📊 [▓▓▓░░] 20%
│ Suspicious: 0             🟢 All clear
└─────────────────────────────────────────────┘

Session Table:
┌────────────────┬───────────────────────────────────┬──────────┬─────────────┐
│ User           │ Device & Location                 │ Status   │ Last Active │
├────────────────┼───────────────────────────────────┼──────────┼─────────────┤
│ admin@test.com │ 🖥️ Chrome on Windows 11 (Desktop)│ 🟢 Active│ just now   │
│ Admin          │ 🌍 Africa/Nairobi                 │          │             │
└────────────────┴───────────────────────────────────┴──────────┴─────────────┘
```

---

**Current Status**: Code has been updated to not manually set `created_at`. Try logging in again after a hard refresh!
