-- ============================================================================
-- IMPLEMENTATION TESTING QUERIES
-- Run these in Supabase SQL Editor to verify the implementation
-- ============================================================================

-- TEST 1: Verify Database Schema Changes
-- Expected: 4 rows showing event_id, inquiry_type, training_interest, message
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'leads'
  AND column_name IN ('event_id', 'inquiry_type', 'training_interest', 'message')
ORDER BY column_name;

-- TEST 2: Check for Published Events
-- Expected: At least 1 event with future start_date
SELECT
  id,
  title,
  start_date,
  end_date,
  location,
  status,
  event_type
FROM events
WHERE status = 'published'
  AND start_date >= CURRENT_DATE
ORDER BY start_date
LIMIT 10;

-- TEST 3: Count Active Events
-- Expected: Number >= 1
SELECT COUNT(*) as active_events_count
FROM events
WHERE status = 'published'
  AND start_date >= CURRENT_DATE;

-- TEST 4: Check Existing Leads (if any)
-- Expected: Old leads should have inquiry_type = 'contact_discuss' (default)
SELECT
  id,
  full_name,
  email,
  event_id,
  inquiry_type,
  training_interest,
  message,
  priority,
  created_at
FROM leads
ORDER BY created_at DESC
LIMIT 5;

-- TEST 5: Verify Indexes Were Created
-- Expected: 2 rows showing idx_leads_event_id and idx_leads_inquiry_type
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'leads'
  AND indexname IN ('idx_leads_event_id', 'idx_leads_inquiry_type');
