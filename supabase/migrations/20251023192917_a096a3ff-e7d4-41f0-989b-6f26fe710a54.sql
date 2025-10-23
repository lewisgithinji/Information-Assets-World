-- Add foreign key constraint for activities.lead_id -> leads.id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'activities_lead_id_fkey'
  ) THEN
    ALTER TABLE activities
    ADD CONSTRAINT activities_lead_id_fkey 
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activities_logged_by ON activities(logged_by);
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Update RLS policy to allow editors to update activities
DROP POLICY IF EXISTS "Editors can update activities" ON activities;
CREATE POLICY "Editors can update activities"
ON activities FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  logged_by = auth.uid()
);