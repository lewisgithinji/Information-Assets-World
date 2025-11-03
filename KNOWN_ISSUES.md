# Known Issues

## Issue: Activities Table 400 Error

**Date Reported**: November 3, 2025
**Status**: ⚠️ Non-Critical
**Impact**: Follow-up scheduling may fail to log activities

### Error Details
```
gppohyyuggnfecfabcyz.supabase.co/rest/v1/activities?select=*:1
Failed to load resource: the server responded with a status of 400 ()
ScheduleFollowUpDialog.tsx:61 Error scheduling follow-up: Object
```

### Where It Occurs
- **Component**: [ScheduleFollowUpDialog.tsx](src/components/leads/ScheduleFollowUpDialog.tsx:61)
- **Hook**: [useActivityMutations.ts](src/hooks/useActivityMutations.ts)
- **Trigger**: When admin schedules a follow-up and checks "Log as activity in timeline"

### Root Cause
Likely an RLS (Row Level Security) policy issue with the `activities` table. The query is attempting `SELECT *` which may be blocked by current policies.

### Possible Causes
1. **RLS Policy Too Restrictive**: Activities table policies may not allow certain users to insert activities
2. **Missing logged_by Column**: The `logged_by` field might be NULL and violating a constraint
3. **Recent RLS Policy Changes**: The session RLS policy fix (migration 20251103000001) may have affected activities table

### Workaround
Follow-ups can still be scheduled - they just won't be logged as activities in the timeline. The next action and date are still saved to the lead.

### How to Fix

#### Option 1: Check RLS Policies
```sql
-- Check current policies on activities table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'activities';

-- Expected policy for INSERT:
-- Should allow authenticated users to insert activities for leads they can access
```

#### Option 2: Verify Column Constraints
```sql
-- Check activities table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'activities'
ORDER BY ordinal_position;

-- Ensure logged_by is nullable or has a default
```

#### Option 3: Test Activity Creation Manually
```sql
-- Try to insert an activity as the current user
INSERT INTO activities (
  lead_id,
  activity_type,
  summary,
  details,
  logged_by
) VALUES (
  '[EXISTING_LEAD_ID]',
  'follow_up_scheduled',
  'Test activity',
  'Testing activity creation',
  auth.uid()
);
```

### Recommended Fix
```sql
-- Grant INSERT permission to authenticated users
CREATE POLICY "authenticated_can_create_activities"
ON activities FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id = activities.lead_id
  )
);

-- Grant SELECT permission to authenticated users
CREATE POLICY "authenticated_can_view_activities"
ON activities FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM leads
    WHERE leads.id = activities.lead_id
  )
);
```

### Priority
🟡 **Medium** - Does not block main functionality but affects activity logging

### Related Files
- [src/hooks/useActivityMutations.ts](src/hooks/useActivityMutations.ts)
- [src/hooks/useLeadActivities.ts](src/hooks/useLeadActivities.ts)
- [src/components/leads/ScheduleFollowUpDialog.tsx](src/components/leads/ScheduleFollowUpDialog.tsx)
- [supabase/migrations/20251103000001_fix_session_rls_policies.sql](supabase/migrations/20251103000001_fix_session_rls_policies.sql)

---

## Other Known Issues

(None reported yet)

---

## How to Report Issues

If you encounter any issues:

1. **Check browser console** for error messages
2. **Note the exact steps** to reproduce
3. **Check Supabase logs** at https://supabase.com/dashboard/project/gppohyyuggnfecfabcyz/logs
4. **Document the error** with:
   - Error message
   - Component/file where it occurs
   - Steps to reproduce
   - Expected vs actual behavior
