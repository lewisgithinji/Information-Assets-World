# Notifications 400 Error - RLS Policy Fix

## The Problem

Getting a **400 error** when trying to mark notifications as read:
```
Failed to load resource: the server responded with a status of 400 ()
Error marking notification as read: Object
```

## Root Cause

The issue is likely with **Row Level Security (RLS) policies** on the `notifications` table. The policies might not allow users to UPDATE their own notifications.

## The Fix

### Step 1: Run the RLS Fix SQL

I've created a SQL file that will fix the RLS policies: **`FIX_NOTIFICATIONS_RLS.sql`**

**How to run it:**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/gppohyyuggnfecfabcyz
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Open `FIX_NOTIFICATIONS_RLS.sql` and copy all the content
5. Paste it into the SQL Editor
6. Click **"Run"** button

### Step 2: Check the Console for Details

I've enhanced the error logging. Now when you click a notification, check the browser console (F12) for detailed information:

**You'll see:**
```
Attempting to mark notification as read: <notification-id>
Current user: <your-user-id>
```

**If it fails, you'll see:**
```
Error marking notification as read: {
  error: {...},
  message: "...",
  details: "...",
  hint: "...",
  code: "..."
}
```

This will tell us exactly what's wrong!

### Step 3: Test Again

1. **Hard refresh** your browser: `Ctrl + Shift + R`
2. Click the notification bell
3. Try clicking on a notification
4. Check the console for the detailed logs

---

## What the SQL Does

The `FIX_NOTIFICATIONS_RLS.sql` script:

### 1. Enables RLS
```sql
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
```

### 2. Creates User Policies

**View own notifications:**
```sql
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

**Update own notifications (mark as read):**
```sql
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**Delete own notifications:**
```sql
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

**Insert notifications:**
```sql
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

### 3. Creates Admin Policies

**Admins can view all:**
```sql
CREATE POLICY "Admins can view all notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

**Admins can update any:**
```sql
CREATE POLICY "Admins can update all notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

---

## Alternative: Quick Test in SQL Editor

If you want to test manually before running the full script:

```sql
-- 1. Check your user ID
SELECT auth.uid();

-- 2. Check current notifications
SELECT id, user_id, is_read, title
FROM public.notifications
WHERE user_id = auth.uid()
LIMIT 5;

-- 3. Try to update one manually
UPDATE public.notifications
SET is_read = true, read_at = now()
WHERE user_id = auth.uid()
AND id = (
  SELECT id FROM public.notifications
  WHERE user_id = auth.uid()
  AND is_read = false
  LIMIT 1
);

-- 4. Check if it worked
SELECT id, is_read, read_at
FROM public.notifications
WHERE user_id = auth.uid()
LIMIT 5;
```

**If this manual update works**, the RLS policies are fine and the issue is elsewhere.

**If this manual update fails**, you definitely need to run the RLS fix!

---

## Enhanced Error Logging

I've added detailed logging to `useNotifications.ts`:

### Before clicking a notification:
```
Attempting to mark notification as read: 72dcc2a1-39a0-4100-b9c7-43f969c5135f
Current user: abc123-def456-...
```

### If successful:
```
Successfully marked as read: [{id: "...", is_read: true, ...}]
```

### If it fails:
```
Error marking notification as read: {
  error: PostgrestError {...},
  message: "Permission denied or RLS policy violation",
  details: "...",
  hint: "Check RLS policies for UPDATE on notifications table",
  code: "42501"
}
```

**Common error codes:**
- `42501` - Insufficient privileges (RLS blocking)
- `23503` - Foreign key violation
- `23505` - Unique constraint violation
- `PGRST116` - No rows returned (notification not found)

---

## After Running the Fix

### Expected Behavior:

1. **Click notification** → Immediately marks as read
2. **Blue dot disappears**
3. **Text becomes normal weight**
4. **Background fades**
5. **Console shows**: `Successfully marked as read: [...]`

### If Still Not Working:

Share the console output from these logs:
1. `Attempting to mark notification as read: ...`
2. `Current user: ...`
3. `Error marking notification as read: {...}`

This will help diagnose if it's:
- RLS policy issue
- Permission issue
- Data mismatch issue
- Something else

---

## Summary

1. ✅ Run **`FIX_NOTIFICATIONS_RLS.sql`** in Supabase SQL Editor
2. ✅ Hard refresh browser
3. ✅ Try clicking a notification
4. ✅ Check console for detailed logs
5. ✅ Share console output if still failing

**The enhanced logging will tell us exactly what's wrong!**
