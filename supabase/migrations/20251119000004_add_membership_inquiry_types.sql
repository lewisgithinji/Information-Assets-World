-- Migration: Add membership inquiry types to leads table
-- Date: 2025-11-19
-- Purpose: Enable membership signup inquiries through existing lead system

-- Step 1: Drop existing CHECK constraint
ALTER TABLE public.leads
DROP CONSTRAINT IF EXISTS leads_inquiry_type_check;

-- Step 2: Add new CHECK constraint with membership types
ALTER TABLE public.leads
ADD CONSTRAINT leads_inquiry_type_check
CHECK (inquiry_type IN (
  'send_writeup',
  'contact_discuss',
  'group_registration',
  'corporate_training',
  'register_now',
  'just_browsing',
  'membership_individual',
  'membership_professional',
  'membership_corporate'
));

-- Step 3: Update comment
COMMENT ON COLUMN public.leads.inquiry_type IS 'Type of inquiry: send_writeup, contact_discuss, group_registration, corporate_training, register_now, just_browsing, membership_individual, membership_professional, or membership_corporate';

-- Step 4: Verify the changes
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Added 3 new membership inquiry types: membership_individual, membership_professional, membership_corporate';
END $$;
