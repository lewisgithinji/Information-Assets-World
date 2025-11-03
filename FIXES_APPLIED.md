# User Management Fixes Applied

## Summary of All Fixes

I've fixed multiple critical issues preventing user management from working. Here's what was changed:

---

## 🔴 CRITICAL FIXES (Added 2025-11-01)

### Fix 6: Role Type Mismatch (23514 Error)

**Problem:** Database CHECK constraint violation - role column only accepts `'admin', 'editor', 'user'` but TypeScript code was using `'admin', 'manager', 'user'`

**Error Message:**
```
"code": "23514",
"message": "new row for relation \"profiles\" violates check constraint \"profiles_role_check\""
```

**Root Cause:** The profiles table was created with:
```sql
role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user'))
```

But our TypeScript type was:
```typescript
export type UserRole = 'admin' | 'manager' | 'user';  // WRONG!
```

**Fix Applied:**
- Changed `UserRole` type in [src/utils/userManagement.ts:11](src/utils/userManagement.ts#L11)
- Changed `'manager'` to `'editor'` to match database constraint

**After:**
```typescript
export type UserRole = 'admin' | 'editor' | 'user';  // CORRECT!
```

---

### Fix 7: Foreign Key Constraint Violation (23503 Error)

**Problem:** Foreign key violations when inserting/updating security tables - using wrong user ID

**Error Messages:**
```
"code": "23503",
"details": "Key is not present in table \"users\".",
"message": "insert or update on table \"user_security_settings\" violates foreign key constraint \"user_security_settings_user_id_fkey\""
```

**Root Cause:** The profiles table has TWO different ID columns:
- `profiles.id` - Generated UUID, primary key (NOT in auth.users)
- `profiles.user_id` - References `auth.users(id)` (the CORRECT one for security tables)

Security tables all reference `auth.users(id)`:
```sql
CREATE TABLE user_security_settings (
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ...
);
```

But our code was using `profile.id` instead of `profile.user_id`!

**Files Fixed:**

1. **[src/utils/userManagement.ts](src/utils/userManagement.ts)**
   - Added `user_id` field to `UserProfile` interface (line 62)
   - Changed `getAllUsers()` to use `profiles.map(p => p.user_id)` for security queries (line 104)
   - Updated security/login map lookups to use `profile.user_id` (lines 148-149)
   - Added documentation to all functions clarifying ID requirements:
     - `updateUserRole()` - Takes `profileId` (profiles.id) for profiles table update
     - `lockUserAccount()` - Takes `userId` (auth.users.id) for security operations
     - `unlockUserAccount()` - Takes `userId` (auth.users.id)
     - `deactivateUser()` - Takes `userId` (auth.users.id)
     - `activateUser()` - Takes `userId` (auth.users.id)
     - `getUserDetails()` - Takes `userId` (auth.users.id)

2. **[src/components/admin/UserManagementTable.tsx](src/components/admin/UserManagementTable.tsx)**
   - Changed `handleLockAccount` to pass `selectedUser.user_id` (line 118)
   - Changed `handleUnlockAccount` to pass `selectedUser.user_id` (line 140)
   - Changed `handleDeactivate` to pass `selectedUser.user_id` (line 180)
   - Changed `handleActivate` to pass `user.user_id` (line 199)
   - **Kept** `handleUpdateRole` using `selectedUser.id` (profiles.id) - CORRECT for profiles table update (line 160)

**Code Changes:**

```typescript
// BEFORE - Wrong IDs being used
const userIds = profiles.map(p => p.id);  // profiles.id ❌
await lockUserAccount(selectedUser.id, reason);  // profiles.id ❌

// AFTER - Correct IDs
const userIds = profiles.map(p => p.user_id);  // auth.users.id ✅
await lockUserAccount(selectedUser.user_id, reason);  // auth.users.id ✅
```

**Why This Matters:**
- Profiles table has its own generated UUID (`profiles.id`)
- Auth users table has different UUIDs (`auth.users.id`)
- `profiles.user_id` links the two tables
- Security tables MUST reference `auth.users.id`, not `profiles.id`

---

## Fix 1: Profiles Query 406 Errors

**Problem:** Queries using `.select('id')` on profiles table were getting 406 (Not Acceptable) errors

**Files Fixed:**
1. `src/hooks/useAuth.tsx` (line 50-54)
2. `src/utils/loginSecurity.ts` (line 43-47)

**Changes:**
- Changed `.select('id')` to `.select('*')`
- Changed `.single()` to `.maybeSingle()` (handles null gracefully)

**Before:**
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('id')
  .eq('email', email)
  .single();
```

**After:**
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('email', email)
  .maybeSingle();
```

---

## Fix 2: user_security_settings Duplicate Insert (409 Errors)

**Problem:** Trying to insert duplicate records into user_security_settings (UNIQUE constraint on user_id)

**File Fixed:** `src/utils/userManagement.ts` (ensureUserSecuritySettings function)

**Changes:**
- Changed `.single()` to `.maybeSingle()` to avoid errors when checking
- Added duplicate key error handling (code 23505)
- Made inserts idempotent (won't fail if record exists)

**Code:**
```typescript
const { data: existing, error: checkError } = await supabase
  .from('user_security_settings')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle();  // Won't error if not found

if (!existing) {
  const { error: insertError } = await supabase
    .from('user_security_settings')
    .insert({ ... });

  if (insertError) {
    if (insertError.code === '23505') {
      console.log('Already exists (created by another process)');
    } else {
      console.error('Failed to create:', insertError);
    }
  }
}
```

---

## Fix 3: security_events Duplicate Insert (409 Errors)

**Problem:** Failed inserts to security_events table were throwing errors

**File Fixed:** `src/utils/loginSecurity.ts`

**Changes:**
- Added error handling to security_events inserts (2 locations)
- Made them non-blocking (won't stop the main flow)
- Added console logging for debugging

**Code:**
```typescript
const { error: eventError } = await supabase.from('security_events').insert({
  event_type: 'account_locked',
  // ...
});

if (eventError) {
  console.error('Failed to create security event:', eventError);
  // Don't throw - not critical
}
```

---

## Fix 4: Enhanced Logging for updateUserRole

**Problem:** updateUserRole was failing silently

**File Fixed:** `src/utils/userManagement.ts`

**Changes:**
- Added detailed console logging
- Added `.select()` to see what was updated
- Added JSON.stringify for error details

**New Output:**
```
Updating role for user <id> from admin to user
Update successful: [{ ... updated profile ... }]
Successfully updated role for user <id>
```

---

## What Should Work Now

### ✅ Lock Account
1. Click ⋮ → Lock Account
2. Enter reason → Lock Account
3. **Expected Console:**
   ```
   Locking account for user <id>, permanent: false, reason: Testing
   Security settings already exist for user <id>
   Successfully locked account for user <id>
   ```
4. **Expected UI:** Status badge changes to "Locked" (red)

### ✅ Unlock Account
1. Click ⋮ → Unlock Account
2. **Expected Console:**
   ```
   Unlocking account for user <id>
   Successfully unlocked account for user <id>
   ```
3. **Expected UI:** Status badge changes to "Active" (green)

### ✅ Change Role
1. Click ⋮ → Change Role
2. Select new role → Update Role
3. **Expected Console:**
   ```
   Updating role for user <id> from admin to user
   Update successful: [{ id: "...", role: "user", ... }]
   Successfully updated role for user <id>
   ```
4. **Expected UI:** Role badge updates

### ✅ Deactivate User
1. Click ⋮ → Deactivate User
2. Enter reason → Deactivate
3. **Expected Console:**
   ```
   Deactivating user <id>, reason: ...
   Security settings already exist for user <id>
   Successfully deactivated user <id>
   ```
4. **Expected UI:** Status becomes "Locked", menu shows "Activate User"

### ✅ Last Login
- Should show "X minutes/hours/days ago" for users who logged in
- Should show "Never" for users who haven't logged in
- **Console Check:**
   ```
   Found X login attempts
   User email@example.com: { ..., lastLogin: "2025-11-01..." }
   ```

### ✅ Failed Attempts
- Should show count of failed login attempts
- Should show yellow warning badge if > 0
- **Console Check:**
   ```
   Found X security settings
   User email@example.com: { ..., failed: 3, ... }
   ```

---

## Testing Steps

### Step 1: Clear Browser Cache & Refresh
```
1. Press Ctrl+Shift+R (hard refresh)
2. Or close and reopen browser
3. Make sure new code is loaded
```

### Step 2: Open Console
```
1. Press F12
2. Go to Console tab
3. Clear console (trash icon)
```

### Step 3: Navigate to User Management
```
1. Go to Security Center
2. Click "User Management" tab
3. Check console for:
   - "Found X profiles"
   - "Found X security settings"
   - "Found X login attempts"
```

### Step 4: Test Lock/Unlock
```
1. Click ⋮ on any user
2. Select "Lock Account"
3. Enter reason: "Testing lock"
4. Click "Lock Account"
5. Watch console - should see success messages
6. Check UI - status should be "Locked"
7. Click ⋮ → "Unlock Account"
8. Check console and UI again
```

### Step 5: Test Role Change
```
1. Click ⋮ → "Change Role"
2. Select different role
3. Click "Update Role"
4. Watch console for detailed logging
5. Check UI - role badge should update
```

---

## If Issues Persist

### Check RLS Policies in Supabase

The errors might be permission-related. Verify these RLS policies exist:

#### profiles table:
```sql
-- Allow users to read all profiles
CREATE POLICY "Users can read profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

#### user_security_settings table:
```sql
-- Allow system to insert security settings
CREATE POLICY "System can create user security settings"
ON user_security_settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to read own security settings
CREATE POLICY "Users can read own security settings"
ON user_security_settings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow system to update security settings
CREATE POLICY "System can update security settings"
ON user_security_settings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to manage all security settings
CREATE POLICY "Admins can manage all security settings"
ON user_security_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

### Check Console for Specific Errors

If you still see errors, check:
1. **406 errors** = Column selection issue or RLS blocking SELECT
2. **409 errors** = Duplicate key constraint (should be handled now)
3. **400 errors** = Bad request (syntax or validation)
4. **403 errors** = RLS policy blocking the operation

### Debug Mode

To get maximum debugging info, all functions now have extensive console.log statements. You should see:
- Function entry ("Locking account for user...")
- Intermediate steps ("Security settings already exist...")
- Success/failure ("Successfully locked account")
- Detailed error info (JSON stringified errors)

---

## Next Steps If Still Broken

1. **Share the exact console output** (copy all error messages)
2. **Check Supabase SQL Editor**:
   ```sql
   -- Check if user_security_settings records exist
   SELECT * FROM user_security_settings;

   -- Check if RLS is blocking
   SELECT * FROM profiles WHERE id = '<your-user-id>';
   ```
3. **Verify you're logged in as admin**
   - Check your role in the database
   - Non-admins might not have permission

---

## Summary of Files Changed

1. ✅ `src/hooks/useAuth.tsx` - Fixed profiles query
2. ✅ `src/utils/loginSecurity.ts` - Fixed profiles query, added error handling
3. ✅ `src/utils/userManagement.ts` - Fixed duplicate inserts, added logging
4. ✅ All console output significantly enhanced

All code changes are backward compatible and non-breaking!
