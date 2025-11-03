# Register Interest Form - Improvements Implementation Plan

## Current State Analysis

### 1. Current Registration Flow
- **URL**: `/register-interest?event={eventId}` (optional event parameter)
- **Field**: `training_interest` (text field storing generic training type)
- **Problem**: Form stores "training interest" as text (e.g., "Records Management") instead of actual event registration
- **Data Model**: `leads.training_interest` is TEXT, not linked to `events` table

### 2. Current Country System
- **Table**: `countries_config`
- **Current State**: Likely has only 4-8 East African countries
- **Problem**: Limited to regional countries, not global

### 3. Current Lead Status Workflow
- **Status Flow**:
  - `new` → `contacted`
  - `contacted` → `doc_sent`, `negotiating`, or `lost`
  - `doc_sent` → `negotiating`, `quote_sent`, or `lost`
  - `negotiating` → `quote_sent`, `doc_sent`, or `lost`
  - `quote_sent` → `negotiating`, `confirmed`, or `lost`
  - `confirmed` → **FINAL STATE** (no further transitions)
  - `lost` → **FINAL STATE** (no further transitions)

- **What happens when status changes to "confirmed"**:
  1. Lead status updates to `confirmed`
  2. Activity log entry created: "Status changed from {old} to confirmed"
  3. **NO automated actions** (no emails, no event registration, no enrollment)
  4. Lead remains in dashboard with green "Confirmed" badge
  5. **Cannot change status further** (confirmed is final)

### 4. Current Message Field
- **Field**: `message` (required, 10-1000 characters)
- **Label**: "Tell us about your training needs *"
- **Type**: Free-text textarea
- **Problem**: Users have to write what they want, no structured options

---

## Proposed Changes

### Change 1: Event-Based Registration Instead of Training Interest

#### Goal
Replace generic "training interest" with actual event selection, so users register for specific events (with dates, location, fees) instead of just expressing general interest.

#### Database Changes

**Option A: Add event_id to leads table (Recommended)**
```sql
-- Add event_id column to leads table
ALTER TABLE public.leads
ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;

-- Keep training_interest for backward compatibility
-- Will be null if event_id is set
ALTER TABLE public.leads
ALTER COLUMN training_interest DROP NOT NULL;

-- Add index
CREATE INDEX idx_leads_event_id ON public.leads(event_id);

-- Add check constraint (must have either event_id or training_interest)
ALTER TABLE public.leads
ADD CONSTRAINT leads_event_or_training_check
CHECK (
  (event_id IS NOT NULL AND training_interest IS NULL) OR
  (event_id IS NULL AND training_interest IS NOT NULL)
);
```

**Option B: Create separate event_registrations table (More complex)**
```sql
-- Create new table for event registrations
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  attendance_confirmed BOOLEAN DEFAULT false,
  payment_status TEXT CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  payment_amount DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, event_id)
);
```

**Recommendation**: Use Option A initially, migrate to Option B if needed later.

#### Frontend Changes

**1. Update LeadForm.tsx**
- Replace "Training Interest" dropdown with "Event" dropdown
- Fetch from `events` table instead of `training_types` table
- Filter to show only upcoming events (status='published', start_date >= today)
- Display: event title, date, location in dropdown

```typescript
// New hook
const { data: upcomingEvents } = useQuery({
  queryKey: ['upcoming-events'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, start_date, end_date, location, category')
      .eq('status', 'published')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data;
  },
});

// In form
<Label htmlFor="event">Select Event *</Label>
<Select onValueChange={(value) => setValue("event_id", value)}>
  <SelectTrigger>
    <SelectValue placeholder="Select an event to register for" />
  </SelectTrigger>
  <SelectContent>
    {upcomingEvents?.map((event) => (
      <SelectItem key={event.id} value={event.id}>
        <div>
          <div className="font-semibold">{event.title}</div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(event.start_date), 'MMM dd, yyyy')} • {event.location}
          </div>
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**2. Update leadValidation.ts**
```typescript
export const leadFormSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(10).max(20),
  organization: z.string().min(2).max(200),
  country: z.string().min(1),
  event_id: z.string().uuid("Please select an event"), // Changed from training_interest
  source: z.string().optional(),
  message: z.string().min(10).max(1000),
});
```

**3. Update submit-lead Edge Function**
```typescript
const leadSchema = z.object({
  // ... other fields
  event_id: z.string().uuid(),
  // Remove training_interest validation
});

// When inserting lead
const { data: lead, error: insertError } = await supabase
  .from("leads")
  .insert([{
    // ... other fields
    event_id: validatedData.event_id,
    training_interest: null, // Set to null when event_id is provided
    status: "new",
  }])
  .select()
  .single();
```

**4. Update Admin Dashboard Views**
- Show event title instead of training_interest in lead list
- Display event date, location in lead detail
- Add "Event Details" card showing full event info
- Filter leads by event in analytics

#### Migration Strategy

**Phase 1: Additive Changes (Non-breaking)**
1. Add `event_id` column to `leads` table (nullable)
2. Make `training_interest` nullable
3. Update form to support both old and new flow
4. Deploy - old leads still work, new leads use events

**Phase 2: Data Migration (Optional)**
```sql
-- Try to match existing training_interest text to events
UPDATE public.leads
SET event_id = (
  SELECT e.id
  FROM public.events e
  WHERE e.title ILIKE '%' || leads.training_interest || '%'
  OR e.description ILIKE '%' || leads.training_interest || '%'
  LIMIT 1
)
WHERE event_id IS NULL
  AND training_interest IS NOT NULL;
```

**Phase 3: Cleanup (Future)**
- Remove `training_types` table if no longer used
- Update all queries to use `event_id`

---

### Change 2: Replace Message Field with Inquiry Type Dropdown

#### Goal
Replace free-text "Tell us about your training needs" with structured dropdown options for better lead qualification and automated routing.

#### Proposed Inquiry Type Options

**Option 1: Simple 2-Choice (Recommended for MVP)**
```typescript
const INQUIRY_TYPES = [
  {
    value: 'send_writeup',
    label: 'Send me the Event Writeup/Invitation',
    description: 'Receive detailed event information via email',
    followUpAction: 'Send event brochure and invitation',
    priority: 'medium',
  },
  {
    value: 'contact_discuss',
    label: 'Contact Me to Discuss the Event',
    description: 'Speak with our team about the event',
    followUpAction: 'Schedule call to discuss event details',
    priority: 'high',
  },
];
```

**Option 2: Expanded 5-Choice (Better for Sales)**
```typescript
const INQUIRY_TYPES = [
  {
    value: 'send_writeup',
    label: 'Send me the Event Writeup/Invitation',
    description: 'I want to review the event details first',
    followUpAction: 'Send event brochure',
    priority: 'medium',
    autoEmail: true, // Automatically send brochure
  },
  {
    value: 'contact_discuss',
    label: 'Contact Me to Discuss the Event',
    description: 'I have questions about the event',
    followUpAction: 'Call within 24 hours',
    priority: 'high',
    autoEmail: false,
  },
  {
    value: 'group_registration',
    label: 'Interested in Group Registration',
    description: 'I want to register multiple people',
    followUpAction: 'Discuss group pricing and arrangements',
    priority: 'high',
    autoEmail: false,
  },
  {
    value: 'corporate_training',
    label: 'Request Corporate Training',
    description: 'I want customized training for my organization',
    followUpAction: 'Schedule needs assessment meeting',
    priority: 'high',
    autoEmail: false,
  },
  {
    value: 'just_browsing',
    label: 'Just Browsing/Staying Updated',
    description: 'Add me to your mailing list',
    followUpAction: 'Add to newsletter list',
    priority: 'low',
    autoEmail: true, // Send welcome email with event calendar
  },
];
```

**Option 3: Smart Hybrid (Dropdown + Optional Notes)**
```typescript
// Primary dropdown + optional additional notes field
const INQUIRY_TYPES = [
  {
    value: 'send_writeup',
    label: 'Send Event Details',
    icon: '📧',
  },
  {
    value: 'contact_discuss',
    label: 'Discuss with Team',
    icon: '📞',
  },
  {
    value: 'register_now',
    label: 'Ready to Register',
    icon: '✅',
  },
  {
    value: 'group_booking',
    label: 'Group Registration (3+)',
    icon: '👥',
  },
  {
    value: 'custom_training',
    label: 'Custom Corporate Training',
    icon: '🏢',
  },
];

// Plus optional field:
"Additional Details (Optional)" - textarea, 0-500 characters
```

#### Database Changes

```sql
-- Add inquiry_type column to leads table
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

-- Make message field optional (for additional notes)
ALTER TABLE public.leads
ALTER COLUMN message DROP NOT NULL;

-- Add index for filtering
CREATE INDEX idx_leads_inquiry_type ON public.leads(inquiry_type);

-- Add comment
COMMENT ON COLUMN public.leads.inquiry_type IS 'Type of inquiry: what the lead wants us to do';
COMMENT ON COLUMN public.leads.message IS 'Optional additional details or notes from the lead';
```

#### Frontend Changes

**1. Update LeadForm.tsx**
```typescript
// Add to form schema
const leadFormSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  organization: z.string().min(2).max(200),
  country: z.string().min(1),
  event_id: z.string().uuid(),
  inquiry_type: z.enum([
    'send_writeup',
    'contact_discuss',
    'group_registration',
    'corporate_training',
    'register_now',
    'just_browsing',
  ]),
  source: z.string().optional(),
  message: z.string().max(500).optional(), // Now optional, shorter
});

// In the form component
<div className="space-y-2">
  <Label htmlFor="inquiry_type">What would you like us to do? *</Label>
  <Select
    onValueChange={(value) => setValue("inquiry_type", value)}
    defaultValue="contact_discuss"
  >
    <SelectTrigger>
      <SelectValue placeholder="Select your preference" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="send_writeup">
        <div className="flex items-center gap-2">
          <span>📧</span>
          <div>
            <div className="font-semibold">Send me the Event Writeup/Invitation</div>
            <div className="text-xs text-muted-foreground">
              Receive detailed event information via email
            </div>
          </div>
        </div>
      </SelectItem>

      <SelectItem value="contact_discuss">
        <div className="flex items-center gap-2">
          <span>📞</span>
          <div>
            <div className="font-semibold">Contact Me to Discuss the Event</div>
            <div className="text-xs text-muted-foreground">
              Speak with our team about the event
            </div>
          </div>
        </div>
      </SelectItem>

      <SelectItem value="group_registration">
        <div className="flex items-center gap-2">
          <span>👥</span>
          <div>
            <div className="font-semibold">Group Registration (3+ People)</div>
            <div className="text-xs text-muted-foreground">
              Register multiple people from your organization
            </div>
          </div>
        </div>
      </SelectItem>

      <SelectItem value="corporate_training">
        <div className="flex items-center gap-2">
          <span>🏢</span>
          <div>
            <div className="font-semibold">Request Custom Corporate Training</div>
            <div className="text-xs text-muted-foreground">
              Tailored training for your organization
            </div>
          </div>
        </div>
      </SelectItem>

      <SelectItem value="register_now">
        <div className="flex items-center gap-2">
          <span>✅</span>
          <div>
            <div className="font-semibold">Ready to Register Now</div>
            <div className="text-xs text-muted-foreground">
              I'm ready to proceed with registration
            </div>
          </div>
        </div>
      </SelectItem>

      <SelectItem value="just_browsing">
        <div className="flex items-center gap-2">
          <span>📰</span>
          <div>
            <div className="font-semibold">Just Browsing/Stay Updated</div>
            <div className="text-xs text-muted-foreground">
              Add me to your event updates list
            </div>
          </div>
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
  {errors.inquiry_type && (
    <p className="text-sm text-destructive">{errors.inquiry_type.message}</p>
  )}
</div>

{/* Optional additional notes */}
<div className="space-y-2">
  <Label htmlFor="message">Additional Details (Optional)</Label>
  <Textarea
    id="message"
    {...register("message")}
    placeholder="Any specific questions or requirements? (optional)"
    rows={3}
    maxLength={500}
  />
  <p className="text-xs text-muted-foreground">
    {watch("message")?.length || 0}/500 characters
  </p>
  {errors.message && (
    <p className="text-sm text-destructive">{errors.message.message}</p>
  )}
</div>
```

**2. Update submit-lead Edge Function**
```typescript
const leadSchema = z.object({
  // ... other fields
  inquiry_type: z.enum([
    'send_writeup',
    'contact_discuss',
    'group_registration',
    'corporate_training',
    'register_now',
    'just_browsing',
  ]),
  message: z.string().max(500).optional(),
});

// After creating lead, trigger automated actions based on inquiry_type
if (validatedData.inquiry_type === 'send_writeup') {
  // Automatically send event brochure
  await supabase.functions.invoke('send-event-brochure', {
    body: {
      leadId: lead.id,
      eventId: validatedData.event_id,
      email: validatedData.email,
    },
  });
}

// Set appropriate priority based on inquiry_type
const priorityMap = {
  send_writeup: 'medium',
  contact_discuss: 'high',
  group_registration: 'high',
  corporate_training: 'high',
  register_now: 'high',
  just_browsing: 'low',
};

await supabase
  .from('leads')
  .update({ priority: priorityMap[validatedData.inquiry_type] })
  .eq('id', lead.id);
```

**3. Update Admin Dashboard**

Display inquiry type with icons in lead table:
```typescript
// In LeadTableView.tsx - add new column
<TableHead>Inquiry Type</TableHead>

// In table body
<TableCell>
  <InquiryTypeBadge inquiryType={lead.inquiry_type} />
</TableCell>

// Create InquiryTypeBadge component
const INQUIRY_TYPE_CONFIG = {
  send_writeup: {
    label: 'Send Writeup',
    icon: '📧',
    color: 'bg-blue-100 text-blue-800',
  },
  contact_discuss: {
    label: 'Discuss Event',
    icon: '📞',
    color: 'bg-green-100 text-green-800',
  },
  group_registration: {
    label: 'Group Booking',
    icon: '👥',
    color: 'bg-purple-100 text-purple-800',
  },
  corporate_training: {
    label: 'Corporate Training',
    icon: '🏢',
    color: 'bg-orange-100 text-orange-800',
  },
  register_now: {
    label: 'Ready to Register',
    icon: '✅',
    color: 'bg-emerald-100 text-emerald-800',
  },
  just_browsing: {
    label: 'Browsing',
    icon: '📰',
    color: 'bg-gray-100 text-gray-800',
  },
};
```

**4. Add Filter by Inquiry Type**
```typescript
// In LeadFilters.tsx
<div className="space-y-2">
  <Label>Inquiry Type</Label>
  <Select
    value={filters.inquiryType}
    onValueChange={(value) =>
      onFiltersChange({ ...filters, inquiryType: value })
    }
  >
    <SelectTrigger>
      <SelectValue placeholder="All inquiry types" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="">All Types</SelectItem>
      <SelectItem value="send_writeup">📧 Send Writeup</SelectItem>
      <SelectItem value="contact_discuss">📞 Discuss Event</SelectItem>
      <SelectItem value="group_registration">👥 Group Booking</SelectItem>
      <SelectItem value="corporate_training">🏢 Corporate Training</SelectItem>
      <SelectItem value="register_now">✅ Ready to Register</SelectItem>
      <SelectItem value="just_browsing">📰 Browsing</SelectItem>
    </SelectContent>
  </Select>
</div>
```

#### Automated Actions Based on Inquiry Type

**Create automation rules:**

```typescript
// utils/inquiryTypeAutomations.ts
export const INQUIRY_TYPE_AUTOMATIONS = {
  send_writeup: {
    autoEmail: true,
    emailTemplate: 'event-brochure',
    priority: 'medium',
    nextAction: 'Follow up in 3 days if no response',
    followUpDays: 3,
  },
  contact_discuss: {
    autoEmail: true,
    emailTemplate: 'contact-confirmation',
    priority: 'high',
    nextAction: 'Call within 24 hours to discuss event',
    followUpDays: 1,
  },
  group_registration: {
    autoEmail: true,
    emailTemplate: 'group-booking-info',
    priority: 'high',
    nextAction: 'Call to discuss group pricing and requirements',
    followUpDays: 1,
  },
  corporate_training: {
    autoEmail: true,
    emailTemplate: 'corporate-training-intro',
    priority: 'high',
    nextAction: 'Schedule needs assessment meeting',
    followUpDays: 1,
  },
  register_now: {
    autoEmail: true,
    emailTemplate: 'registration-next-steps',
    priority: 'high',
    nextAction: 'Send registration form and payment details',
    followUpDays: 0, // Immediate
  },
  just_browsing: {
    autoEmail: true,
    emailTemplate: 'welcome-newsletter',
    priority: 'low',
    nextAction: 'Add to monthly newsletter list',
    followUpDays: 30,
  },
};
```

#### Benefits

1. **Better Lead Qualification**: Know exactly what each lead wants
2. **Automated Routing**: High-priority inquiries (discuss, group, corporate) flagged immediately
3. **Faster Response**: Auto-send brochures for "send writeup" requests
4. **Better Analytics**: Track which inquiry types convert best
5. **Improved UX**: Users don't have to write - just select what they want
6. **Reduced Admin Work**: Clear next actions for each inquiry type

---

### Change 3: Global Countries Expansion

#### Current State
```sql
-- Check current countries
SELECT COUNT(*) FROM countries_config WHERE is_active = true;
-- Likely returns 4-8 countries
```

#### Solution: Add All Countries

**Option A: Insert All 195 Countries**
```sql
-- Disable existing countries
UPDATE countries_config SET is_active = false;

-- Insert all countries (abbreviated sample - full list needed)
INSERT INTO countries_config (name, code, phone_code, is_active, display_order) VALUES
-- Africa
('South Africa', 'ZA', '+27', true, 1),
('Nigeria', 'NG', '+234', true, 2),
('Egypt', 'EG', '+20', true, 3),
('Kenya', 'KE', '+254', true, 4),
('Morocco', 'MA', '+212', true, 5),
-- Europe
('United Kingdom', 'GB', '+44', true, 50),
('France', 'FR', '+33', true, 51),
('Germany', 'DE', '+49', true, 52),
('Italy', 'IT', '+39', true, 53),
-- North America
('United States', 'US', '+1', true, 100),
('Canada', 'CA', '+1', true, 101),
('Mexico', 'MX', '+52', true, 102),
-- Asia
('China', 'CN', '+86', true, 150),
('India', 'IN', '+91', true, 151),
('Japan', 'JP', '+81', true, 152),
-- ... (full list of 195 countries)

-- Prioritize East African countries
UPDATE countries_config
SET display_order = display_order - 1000
WHERE code IN ('KE', 'UG', 'TZ', 'RW', 'BI', 'SS', 'ET', 'SO');
```

**Option B: Use External API**
- Integrate with REST Countries API (https://restcountries.com/)
- Cache results locally
- Fallback to database if API fails

**Option C: Add phone_code column**
```sql
-- Add phone code for better phone number handling
ALTER TABLE countries_config
ADD COLUMN phone_code TEXT;

-- Update existing records
UPDATE countries_config SET phone_code = '+254' WHERE code = 'KE';
UPDATE countries_config SET phone_code = '+256' WHERE code = 'UG';
-- ... etc
```

#### Frontend Changes

**Update useCountries hook to support search**
```typescript
export const useCountries = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['countries', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('countries_config')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
  });
};
```

**Update Country Selector in Form**
```typescript
// Add searchable combobox instead of simple select
<Command>
  <CommandInput placeholder="Search country..." />
  <CommandEmpty>No country found.</CommandEmpty>
  <CommandGroup>
    {countries?.map((country) => (
      <CommandItem
        key={country.id}
        value={country.name}
        onSelect={() => setValue("country", country.name)}
      >
        <span className="mr-2">{country.flag_emoji}</span>
        {country.name}
      </CommandItem>
    ))}
  </CommandGroup>
</Command>
```

#### Implementation Files

I'll need to create:
1. `ADD_ALL_COUNTRIES.sql` - Full list of 195 countries
2. Update `LeadForm.tsx` with searchable country selector

---

### Change 3: Status Change to "Confirmed" - What Happens?

#### Current Behavior

When admin changes lead status to "confirmed":

1. **Database Update**:
   ```sql
   UPDATE leads
   SET
     status = 'confirmed',
     updated_at = NOW()
   WHERE id = '{lead_id}';
   ```

2. **Activity Log Entry**:
   ```sql
   INSERT INTO activities (lead_id, activity_type, summary, details)
   VALUES (
     '{lead_id}',
     'status_change',
     'Status changed to Confirmed',
     'Status changed from {old_status} to confirmed by {admin_name}'
   );
   ```

3. **UI Changes**:
   - Status badge turns green with "Confirmed" label
   - No more status transition buttons shown (final state)
   - Lead stats update: `totalConfirmed` count increases

4. **What DOES NOT Happen** (but probably should):
   - ❌ No confirmation email sent to client
   - ❌ No event registration created
   - ❌ No payment tracking initiated
   - ❌ No calendar invite sent
   - ❌ No admin notification
   - ❌ No automatic follow-up scheduled

#### Recommended Enhancements

**Option 1: Add Confirmation Workflow (Recommended)**

When status changes to "confirmed", trigger:

1. **Send Confirmation Email to Client**
   ```typescript
   // In useLeadMutations.ts - updateLeadStatus mutation
   if (newStatus === 'confirmed') {
     // Send confirmation email
     await supabase.functions.invoke('send-event-confirmation', {
       body: {
         leadId: lead.id,
         eventId: lead.event_id,
         clientEmail: lead.email,
         clientName: lead.full_name,
       },
     });
   }
   ```

2. **Create Event Registration Record**
   ```sql
   -- If using event_registrations table
   INSERT INTO event_registrations (lead_id, event_id, registration_date, payment_status)
   VALUES ('{lead_id}', '{event_id}', NOW(), 'pending');
   ```

3. **Schedule Pre-Event Follow-up**
   ```sql
   -- Auto-schedule reminder 1 week before event
   UPDATE leads
   SET
     next_action = 'Send event reminder and joining instructions',
     next_action_date = (
       SELECT start_date - INTERVAL '7 days'
       FROM events
       WHERE id = leads.event_id
     )
   WHERE id = '{lead_id}';
   ```

4. **Send Admin Notification**
   ```typescript
   // Notify sales team
   await supabase.functions.invoke('send-admin-notification', {
     body: {
       type: 'lead_confirmed',
       leadId: lead.id,
       message: `${lead.full_name} confirmed for ${event.title}`,
     },
   });
   ```

**Option 2: Add "Attended" Status (Post-Event)**

Extend status workflow:
```typescript
export const STATUS_FLOW: Record<string, string[]> = {
  // ... existing statuses
  confirmed: ['attended', 'no_show'], // Allow post-event tracking
  attended: [], // Final success state
  no_show: [], // Final state
};
```

---

## Implementation Checklist

### Phase 1: Event-Based Registration + Inquiry Type (Priority 1)

- [ ] **Database Schema**
  - [ ] Add `event_id` column to `leads` table
  - [ ] Add `inquiry_type` column to `leads` table
  - [ ] Make `training_interest` nullable
  - [ ] Make `message` optional (nullable)
  - [ ] Add foreign key constraint for event_id
  - [ ] Add indexes on `event_id` and `inquiry_type`
  - [ ] Test with sample data

- [ ] **Backend (Edge Function)**
  - [ ] Update `submit-lead` function schema validation
  - [ ] Add `event_id` and `inquiry_type` to request body
  - [ ] Update database insert to use both new fields
  - [ ] Add automation logic for inquiry types
  - [ ] Auto-set priority based on inquiry type
  - [ ] Update confirmation email to include event details
  - [ ] Test edge function with Postman/cURL

- [ ] **Frontend (Form)**
  - [ ] Create `useUpcomingEvents` hook
  - [ ] Replace training types dropdown with events dropdown
  - [ ] Add inquiry type dropdown with 6 options
  - [ ] Make message field optional (max 500 chars)
  - [ ] Update form validation schema
  - [ ] Update form UI to show event details in dropdown
  - [ ] Add icons and descriptions to inquiry type options
  - [ ] Handle case when no upcoming events exist
  - [ ] Test form submission with all inquiry types

- [ ] **Frontend (Admin Dashboard)**
  - [ ] Create `InquiryTypeBadge` component
  - [ ] Update `LeadTableView` to show event title and inquiry type
  - [ ] Update `LeadInfoCard` to display event details and inquiry type
  - [ ] Add "Event Details" card to lead detail page
  - [ ] Add inquiry type column to leads table
  - [ ] Update filters to allow filtering by event and inquiry type
  - [ ] Update analytics to group by event and inquiry type
  - [ ] Test all lead views

- [ ] **Migration & Testing**
  - [ ] Run database migration on staging
  - [ ] Test old leads still display correctly
  - [ ] Test new lead submissions with events
  - [ ] Verify emails contain event information
  - [ ] Check analytics show correct event data

### Phase 2: Global Countries (Priority 2)

- [ ] **Data Preparation**
  - [ ] Create SQL file with all 195 countries
  - [ ] Include country codes, phone codes
  - [ ] Set appropriate display_order (prioritize East Africa)
  - [ ] Add flag emojis (optional)

- [ ] **Database**
  - [ ] Add `phone_code` column to `countries_config`
  - [ ] Run SQL to insert all countries
  - [ ] Verify data integrity
  - [ ] Test queries with large dataset

- [ ] **Frontend**
  - [ ] Replace simple Select with searchable Combobox
  - [ ] Add search functionality
  - [ ] Implement virtual scrolling for performance
  - [ ] Test search with various inputs
  - [ ] Verify phone number integration

- [ ] **Testing**
  - [ ] Test form loads quickly with all countries
  - [ ] Test search finds countries correctly
  - [ ] Test submission with various countries
  - [ ] Verify existing leads still work

### Phase 3: Enhanced Confirmation Workflow (Priority 3)

- [ ] **Email Templates**
  - [ ] Create `send-event-confirmation` edge function
  - [ ] Design confirmation email template
  - [ ] Include event details, calendar invite
  - [ ] Add QR code or registration link
  - [ ] Test email delivery

- [ ] **Automated Actions**
  - [ ] Add post-confirmation logic to `updateLeadStatus`
  - [ ] Schedule automatic follow-up
  - [ ] Send admin notification
  - [ ] Create event registration record
  - [ ] Test all automated actions

- [ ] **UI Enhancements**
  - [ ] Show confirmation timestamp in lead detail
  - [ ] Add "Resend Confirmation" button
  - [ ] Display event registration status
  - [ ] Add payment tracking fields
  - [ ] Test UI with confirmed leads

- [ ] **Post-Event Tracking**
  - [ ] Add "attended" and "no_show" statuses
  - [ ] Create attendance tracking UI
  - [ ] Add post-event follow-up automation
  - [ ] Generate attendance reports
  - [ ] Test complete workflow

---

## Database Migration Scripts

### Script 1: Add Event ID to Leads
```sql
-- File: add_event_id_to_leads.sql

-- Step 1: Add event_id column (nullable for now)
ALTER TABLE public.leads
ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;

-- Step 2: Make training_interest nullable
ALTER TABLE public.leads
ALTER COLUMN training_interest DROP NOT NULL;

-- Step 3: Add index for performance
CREATE INDEX idx_leads_event_id ON public.leads(event_id);

-- Step 4: Add comment
COMMENT ON COLUMN public.leads.event_id IS 'Reference to the specific event the lead is registering for. Replaces generic training_interest for event-specific registrations.';

-- Step 5: Verify changes
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'leads'
  AND column_name IN ('event_id', 'training_interest');
```

### Script 2: Add Global Countries
```sql
-- File: add_global_countries.sql
-- This will insert all 195 countries
-- See separate file: GLOBAL_COUNTRIES_SEED_DATA.sql
```

---

## Testing Plan

### Manual Testing

1. **Event Registration Flow**
   - [ ] Open `/register-interest`
   - [ ] Verify events dropdown shows upcoming events only
   - [ ] Select an event
   - [ ] Complete and submit form
   - [ ] Verify lead created with correct `event_id`
   - [ ] Check confirmation email includes event details

2. **Country Selection**
   - [ ] Open form country dropdown
   - [ ] Search for "United"
   - [ ] Verify finds United States, United Kingdom, etc.
   - [ ] Select country
   - [ ] Verify submission works

3. **Admin Status Change**
   - [ ] Open lead detail as admin
   - [ ] Change status through workflow to "confirmed"
   - [ ] Verify automated actions trigger
   - [ ] Check client receives confirmation email
   - [ ] Verify follow-up scheduled

### Automated Testing

```typescript
// test/register-form.spec.ts
describe('Event Registration', () => {
  it('should load upcoming events in dropdown', async () => {
    // Test implementation
  });

  it('should submit lead with event_id', async () => {
    // Test implementation
  });

  it('should handle no upcoming events gracefully', async () => {
    // Test implementation
  });
});
```

---

## Rollback Plan

If issues occur:

1. **Database Rollback**
   ```sql
   -- Remove event_id column
   ALTER TABLE public.leads DROP COLUMN event_id;

   -- Make training_interest required again
   ALTER TABLE public.leads ALTER COLUMN training_interest SET NOT NULL;
   ```

2. **Code Rollback**
   - Revert frontend to use training_types
   - Revert backend to accept training_interest
   - Deploy previous version

3. **Data Recovery**
   - Restore from backup if needed
   - Re-enable training_types table

---

## Timeline Estimate

- **Phase 1 (Event Registration + Inquiry Type)**: 3-4 days
  - Database changes: 3 hours
  - Backend updates: 6 hours (includes inquiry type automation)
  - Frontend form updates: 10 hours
  - Admin dashboard updates: 6 hours
  - Testing & debugging: 5 hours

- **Phase 2 (Global Countries)**: 1 day
  - Data preparation: 2 hours
  - Database updates: 1 hour
  - Frontend updates: 3 hours
  - Testing: 2 hours

- **Phase 3 (Confirmation Workflow)**: 2 days
  - Email template: 3 hours
  - Automated actions: 5 hours
  - UI enhancements: 4 hours
  - Testing: 4 hours

**Total**: 6-7 days of development

---

## Questions to Resolve

1. **Inquiry Type Options**: Which option do you prefer?
   - **Option 1**: Simple 2-choice (Send Writeup, Contact to Discuss)
   - **Option 2**: Expanded 5-choice (+ Group Registration, Corporate Training, Just Browsing)
   - **Option 3 (Recommended)**: 6-choice with "Ready to Register" option

2. **Message Field**: Keep it as optional additional notes, or remove completely?
   - **Recommendation**: Keep as optional (some users may have specific questions)

3. **Event Registration**: Should leads register for ONE event at a time, or allow multiple events?
   - **Recommendation**: One event per lead submission for now. If user wants multiple events, they submit multiple times.

4. **Training Types**: Keep `training_types` table or remove it?
   - **Recommendation**: Keep it for now (backward compatibility), deprecate later.

5. **Confirmation Workflow**: What specific actions should happen when status = confirmed?
   - **Needs Decision**: Email template content, payment tracking, calendar invites

6. **Countries**: Include phone codes in form, or just country name?
   - **Recommendation**: Include phone codes to help with phone validation

7. **Pre-selection**: Should event ID in URL still pre-select the event?
   - **Recommendation**: Yes, keep this functionality

8. **Automated Emails**: Which inquiry types should trigger automatic emails?
   - **Recommendation**: All of them (different email for each type)

---

## Success Metrics

After implementation, track:

1. **User Registration**: % of users who complete event registration vs. abandon
2. **Event Conversion**: % of leads that convert to confirmed per event
3. **Country Distribution**: Where leads are coming from globally
4. **Admin Efficiency**: Time to move lead from new → confirmed
5. **Email Performance**: Open rate of confirmation emails

---

## Next Steps

**Ready to proceed?** Please confirm:

1. ✅ Option A for event registration (add event_id to leads table)?
2. ✅ Add all 195 countries to database?
3. ✅ Implement basic confirmation workflow (send email on status = confirmed)?
4. ✅ Priority order: Event Registration → Countries → Confirmation Workflow?

Once confirmed, I'll start implementing!
