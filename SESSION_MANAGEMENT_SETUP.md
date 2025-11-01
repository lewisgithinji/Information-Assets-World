# Session Management Setup Guide

## Overview
The Session Management system has been successfully built! However, we need to create the `user_sessions` table in your Supabase database before it will work.

## Quick Setup (5 minutes)

### Step 1: Create the Database Table

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `gppohyyuggnfecfabcyz`

2. **Open SQL Editor**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"** button

3. **Run the Migration**
   - Open the file: `CREATE_USER_SESSIONS_TABLE.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **"Run"** button (or press Ctrl+Enter)

4. **Verify Success**
   - You should see a success message
   - The verification queries at the bottom will show:
     - `table_exists: true`
     - List of RLS policies
     - List of indexes

### Step 2: Test the Feature

1. **Refresh Your App**
   - Hard refresh your browser (Ctrl+Shift+R)
   - Navigate to: Security Center → Sessions tab

2. **What You Should See**
   - 4 beautiful gradient statistics cards
   - Empty sessions table (no sessions yet)
   - "No active sessions" message

3. **Create Test Sessions**
   - To populate the sessions table, you need to:
     - Log in from different devices/browsers
     - Each login will create a new session
   - OR manually insert test data (see below)

### Step 3: Insert Test Data (Optional)

If you want to see the Session Management UI with sample data immediately:

```sql
-- Insert a test session for the current user
INSERT INTO public.user_sessions (
  user_id,
  device_info,
  ip_address,
  location,
  created_at,
  last_activity,
  expires_at,
  is_active
) VALUES (
  auth.uid(), -- Your current user ID
  '{"browser": "Chrome", "os": "Windows 11", "device": "Desktop"}'::jsonb,
  '192.168.1.100',
  '{"city": "Nairobi", "country": "Kenya", "timezone": "Africa/Nairobi"}'::jsonb,
  now(),
  now(),
  now() + interval '7 days',
  true
);

-- Insert another test session (mobile)
INSERT INTO public.user_sessions (
  user_id,
  device_info,
  ip_address,
  location,
  created_at,
  last_activity,
  expires_at,
  is_active
) VALUES (
  auth.uid(),
  '{"browser": "Safari", "os": "iOS 17", "device": "iPhone 15"}'::jsonb,
  '192.168.1.101',
  '{"city": "Mombasa", "country": "Kenya", "timezone": "Africa/Nairobi"}'::jsonb,
  now() - interval '2 hours',
  now() - interval '15 minutes',
  now() + interval '7 days',
  true
);
```

Run this in the SQL Editor, then refresh the Sessions tab in your app.

## Features Available After Setup

### 1. Session Statistics
- **Active Sessions** - Total number of active sessions (blue card)
- **Active Users** - Unique users with active sessions (purple card)
- **Avg Sessions/User** - Average sessions per user with progress bar (green card)
- **Suspicious Sessions** - Sessions flagged as suspicious (red card)

### 2. Session Table
View all active sessions with:
- Device icon (Desktop/Mobile/Tablet)
- User information (email, name, role)
- Device details (browser, OS, device type)
- Location (city, country)
- IP address
- Last activity (time ago)
- Status badge (Active/Suspicious)

### 3. Session Actions (Admin Only)
- **Terminate Session** - End a specific session
- **Terminate All User Sessions** - Log out user from all devices

### 4. Security Features
- **Suspicious Session Detection**:
  - Multiple locations (>2 countries)
  - Too many sessions (>5 active)
  - Rapid session creation (>3 in 1 hour)
- **Auto-refresh** - Updates every 30 seconds
- **Audit logging** - All actions are logged

## Integrating with Login/Logout

To automatically create sessions on login, add this to your login handler:

```typescript
import { createSession } from '@/utils/sessionManagement';

// After successful login
await createSession(
  user.id,
  {
    browser: navigator.userAgent.match(/Chrome|Firefox|Safari|Edge/)?.[0] || 'Unknown',
    os: navigator.platform || 'Unknown',
    device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
  },
  ipAddress, // You can get this from a service like ipapi.co
  {
    city: 'Nairobi', // From IP geolocation service
    country: 'Kenya',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
);
```

## Troubleshooting

### Error: "user_sessions table does not exist"
- Run the `CREATE_USER_SESSIONS_TABLE.sql` file in Supabase SQL Editor

### Error: "permission denied"
- Make sure you're logged in as an admin user
- Check that RLS policies were created correctly

### Sessions not appearing
- Make sure you've created test data OR logged in from different devices
- Check the browser console for errors
- Verify the table exists: `SELECT * FROM user_sessions;`

### Suspicious sessions not detected
- Suspicious detection requires:
  - Sessions from different countries, OR
  - More than 5 active sessions, OR
  - More than 3 sessions created in last hour

## Database Schema

The `user_sessions` table structure:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users(id) |
| device_info | JSONB | Browser, OS, device type |
| ip_address | TEXT | IP address of session |
| location | JSONB | City, country, timezone |
| created_at | TIMESTAMPTZ | When session was created |
| last_activity | TIMESTAMPTZ | Last activity timestamp |
| expires_at | TIMESTAMPTZ | When session expires |
| is_active | BOOLEAN | Whether session is active |

## What's Next?

After setting up the database:

1. ✅ Session Management is fully functional
2. ✅ Statistics cards will show real data
3. ✅ Admins can terminate sessions
4. ✅ Suspicious sessions are automatically detected
5. ✅ Auto-refresh keeps data current

## Files Created

- `src/utils/sessionManagement.ts` - Session utility functions
- `src/components/admin/SessionManagementTable.tsx` - UI component
- `src/pages/admin/AdminSecurity.tsx` - Updated with Sessions tab
- `supabase/migrations/20251101000003_create_user_sessions_table.sql` - Migration file
- `CREATE_USER_SESSIONS_TABLE.sql` - Manual setup SQL file
- `SESSION_MANAGEMENT_SETUP.md` - This guide

## Support

If you encounter any issues:
1. Check browser console for error messages
2. Verify the table exists in Supabase Dashboard → Table Editor
3. Check RLS policies in Supabase Dashboard → Authentication → Policies
4. Ensure you're logged in as an admin user

---

**Ready to go!** Just run the SQL file and start managing sessions! 🚀
