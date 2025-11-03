-- Migration: Add event_id and inquiry_type to leads table
-- Date: 2025-11-03
-- Purpose: Enable event-specific registration and structured inquiry types

-- Step 1: Add event_id column (nullable initially for existing data)
ALTER TABLE public.leads
ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;

-- Step 2: Add inquiry_type column with CHECK constraint
ALTER TABLE public.leads
ADD COLUMN inquiry_type TEXT NOT NULL DEFAULT 'contact_discuss'
CHECK (inquiry_type IN (
  'send_writeup',
  'contact_discuss',
  'group_registration',
  'corporate_training',
  'register_now',
  'just_browsing'
));

-- Step 3: Make training_interest nullable (for backward compatibility)
ALTER TABLE public.leads
ALTER COLUMN training_interest DROP NOT NULL;

-- Step 4: Make message field optional
ALTER TABLE public.leads
ALTER COLUMN message DROP NOT NULL;

-- Step 5: Add indexes for performance
CREATE INDEX idx_leads_event_id ON public.leads(event_id);
CREATE INDEX idx_leads_inquiry_type ON public.leads(inquiry_type);

-- Step 6: Add comments for documentation
COMMENT ON COLUMN public.leads.event_id IS 'Reference to the specific event the lead is registering for. Replaces generic training_interest for event-specific registrations.';
COMMENT ON COLUMN public.leads.inquiry_type IS 'Type of inquiry indicating what action the lead wants: send_writeup, contact_discuss, group_registration, corporate_training, register_now, or just_browsing';
COMMENT ON COLUMN public.leads.training_interest IS 'Legacy field - now optional. Replaced by event_id for event-specific registrations.';
COMMENT ON COLUMN public.leads.message IS 'Optional additional details or notes from the lead (max 500 characters recommended)';

-- Step 7: Verify the changes
DO $$
BEGIN
  -- Check if columns were added successfully
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'event_id'
  ) THEN
    RAISE EXCEPTION 'Failed to add event_id column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'inquiry_type'
  ) THEN
    RAISE EXCEPTION 'Failed to add inquiry_type column';
  END IF;

  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Added event_id column with foreign key to events table';
  RAISE NOTICE 'Added inquiry_type column with 6 options';
  RAISE NOTICE 'Made training_interest and message nullable';
  RAISE NOTICE 'Created indexes for performance';
END $$;
