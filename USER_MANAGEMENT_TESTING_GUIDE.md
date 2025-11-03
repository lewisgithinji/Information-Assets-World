# User Management Testing Guide

This guide will help you test all user management features systematically.

## Pre-Testing Setup

1. **Open Browser Console** (F12)
   - Go to the Console tab
   - Keep it open to see debug logs

2. **Navigate to Security Center**
   - Go to your app
   - Click on Security Center in the admin menu
   - Click on the "User Management" tab

## Test 1: View Users List

**Expected Behavior:**
- You should see a table with all users
- Each user should show:
  - Name and email
  - Role badge (Admin/Manager/User)
  - Status badge (Active/Locked)
  - Last login time
  - Failed attempts count
  - Actions menu (three dots)

**Console Output to Check:**
```
Found X profiles
Found X security settings
Found X login attempts
User email@example.com: { locked: false, failed: 0, lastLogin: "timestamp or null" }
```

**What to verify:**
- [ ] All users are displayed
- [ ] Role badges show correct roles
- [ ] Status badges show correct status
- [ ] Last login shows "X minutes/hours/days ago" or "Never"
- [ ] Failed attempts shows a number or 0

---

## Test 2: Lock Account

**Steps:**
1. Click the three dots menu on any user
2. Select "Lock Account"
3. Enter a reason: "Testing account lock"
4. Optionally check "Permanent lock"
5. Click "Lock Account"

**Expected Console Output:**
```
Locking account for user <user-id>, permanent: false, reason: Testing account lock
Creating security settings for user <user-id> (if doesn't exist)
Successfully created security settings for user <user-id>
Successfully locked account for user <user-id>
```

**Expected UI Changes:**
- [ ] User's status badge changes from "Active" (green) to "Locked" (red)
- [ ] Toast notification: "Account Locked"
- [ ] User table refreshes automatically

**Verify in Activity Log:**
- [ ] Go to "Activity Log" tab
- [ ] Should see "Account locked: Testing account lock" entry

---

## Test 3: Unlock Account

**Steps:**
1. Click the three dots menu on the locked user
2. Select "Unlock Account"
3. Confirm the action

**Expected Console Output:**
```
Unlocking account for user <user-id>
Successfully unlocked account for user <user-id>
```

**Expected UI Changes:**
- [ ] User's status badge changes from "Locked" (red) to "Active" (green)
- [ ] Toast notification: "Account Unlocked"
- [ ] User table refreshes

**Verify in Activity Log:**
- [ ] Should see "Account unlocked" entry

---

## Test 4: Change User Role

**Steps:**
1. Click the three dots menu on any user
2. Select "Change Role"
3. Select a different role from dropdown
4. Click "Update Role"

**Expected Console Output:**
```
(Should see successful role update in audit logs)
```

**Expected UI Changes:**
- [ ] User's role badge updates to new role
- [ ] Badge color changes (Admin=default, Manager=secondary, User=outline)
- [ ] Toast notification: "Role Updated"

**Verify in Activity Log:**
- [ ] Should see "Role changed from X to Y" entry

---

## Test 5: Deactivate User

**Steps:**
1. Click the three dots menu on any user
2. Select "Deactivate User"
3. Enter a reason: "No longer with company"
4. Click "Deactivate User"

**Expected Console Output:**
```
Deactivating user <user-id>, reason: No longer with company
Creating security settings for user <user-id> (if doesn't exist)
Successfully deactivated user <user-id>
```

**Expected UI Changes:**
- [ ] User's status badge shows "Locked" (red)
- [ ] Toast notification: "User Deactivated"
- [ ] User table refreshes

**Verify Deactivation:**
- [ ] Click three dots on the deactivated user
- [ ] Should see "Activate User" option instead of "Deactivate User"

**Verify in Activity Log:**
- [ ] Should see "Account locked: No longer with company" entry

---

## Test 6: Activate User

**Steps:**
1. Click the three dots menu on a deactivated user
2. Select "Activate User"

**Expected Console Output:**
```
Activating user <user-id>
Successfully activated user <user-id>
```

**Expected UI Changes:**
- [ ] User's status badge changes to "Active" (green)
- [ ] Toast notification: "User Activated"
- [ ] Menu now shows "Deactivate User" again

**Verify in Activity Log:**
- [ ] Should see "Account unlocked" entry

---

## Test 7: Last Login Display

**Steps:**
1. Log out of your current account
2. Log in with a different user account (or the same one)
3. Log out again
4. Log in as admin
5. Go to Security Center → User Management

**Expected Behavior:**
- [ ] User you just logged in with should show "a few seconds ago" or "X minutes ago"
- [ ] Users who never logged in should show "Never"

**Console Output:**
```
Found X login attempts
User email@example.com: { locked: false, failed: 0, lastLogin: "2025-11-01T..." }
```

---

## Test 8: Failed Login Attempts

**Steps:**
1. Note your test user's email
2. Log out
3. Try to log in with **wrong password** 3 times
4. Log in as admin
5. Go to Security Center → User Management

**Expected Behavior:**
- [ ] The test user should show "3" failed attempts with yellow warning badge
- [ ] Try 2 more wrong passwords (total 5)
- [ ] Account should be automatically locked
- [ ] Status badge should show "Locked" (red)

**Console Output:**
```
User email@example.com: { locked: true, failed: 5, lastLogin: "..." }
```

**Verify in Activity Log:**
- [ ] Should see multiple "Failed login attempt" entries
- [ ] Should see "Account locked: Too many failed login attempts"

---

## Test 9: Refresh Functionality

**Steps:**
1. Click the "Refresh" button in the top right

**Expected Behavior:**
- [ ] Table shows loading spinner briefly
- [ ] Data refreshes with latest information
- [ ] Console shows new fetch logs

---

## Common Issues and Solutions

### Issue: Status doesn't update after locking
**Solution:**
- Check console for errors
- Look for "Creating security settings" message
- May need to refresh page manually
- Check RLS policies in Supabase

### Issue: Last login shows "Never" for all users
**Solution:**
- Verify users have actually logged in
- Check console: "Found X login attempts"
- If 0, check `login_attempts` table in database
- Verify RLS policy allows reading login attempts

### Issue: Failed attempts always shows 0
**Solution:**
- Make actual failed login attempts
- Check console for "Found X security settings"
- If 0, security settings records may not exist
- Try locking/unlocking an account to create the record

### Issue: Deactivate doesn't work
**Solution:**
- Check console for error messages
- Verify `ensureUserSecuritySettings` is creating records
- Check RLS policies allow INSERT on `user_security_settings`

---

## Database Verification

If features still don't work, check directly in Supabase:

1. **user_security_settings table**
   ```sql
   SELECT user_id, account_locked, locked_reason, failed_login_count
   FROM user_security_settings;
   ```
   - Should have a record for each user
   - Locked users should have `account_locked = true`

2. **login_attempts table**
   ```sql
   SELECT user_id, email, success, timestamp
   FROM login_attempts
   ORDER BY timestamp DESC
   LIMIT 20;
   ```
   - Should show recent login attempts
   - Check `success` column (true/false)

3. **audit_logs table**
   ```sql
   SELECT action, resource_type, metadata, timestamp
   FROM audit_logs
   ORDER BY timestamp DESC
   LIMIT 20;
   ```
   - Should show all user management actions
   - Look for `account.locked`, `account.unlocked`, `user.role.updated`, etc.

---

## Success Criteria

All tests pass if:
- [x] User list displays correctly with all information
- [x] Lock/unlock works and updates UI immediately
- [x] Role changes work and show in UI
- [x] Deactivate/activate works correctly
- [x] Last login displays accurate times
- [x] Failed attempts counter shows correct numbers
- [x] All actions appear in Activity Log
- [x] Console shows successful operation logs
- [x] No errors in browser console
