# Sponsor Type Differentiation Feature

## Overview
Added the ability to differentiate between **Sponsors**, **Partners**, and **Clients** in the sponsors system.

## Changes Made

### 1. Database Migration
**File:** `supabase/migrations/20251119000002_add_sponsor_type.sql`

- Added `type` column to `sponsors` table
- Possible values: `'sponsor'`, `'partner'`, `'client'`
- Default value: `'sponsor'`
- Created index on `type` column for faster filtering
- Added CHECK constraint to ensure only valid types

```sql
ALTER TABLE public.sponsors
ADD COLUMN type TEXT DEFAULT 'sponsor' CHECK (type IN ('sponsor', 'partner', 'client'));
```

### 2. TypeScript Types
**File:** `src/hooks/useSponsors.ts`

- Added `SponsorType` type: `'sponsor' | 'partner' | 'client'`
- Updated `Sponsor` interface to include `type: SponsorType`
- Updated `useSponsors` hook to accept optional `type` parameter for filtering

```typescript
export type SponsorType = 'sponsor' | 'partner' | 'client';

export const useSponsors = (type?: SponsorType) => {
  // Filters by type if provided
};
```

### 3. Admin Form Updates
**File:** `src/pages/admin/AdminSponsorForm.tsx`

- Added `type` field to form schema
- Added Type dropdown selector with 3 options:
  - Sponsor
  - Partner
  - Client
- Updated form submission to include type
- Updated edit mode to load existing type value

### 4. Admin List Page Updates
**File:** `src/pages/admin/AdminSponsors.tsx`

**UI Changes:**
- Page title: "Manage Sponsors" → "Manage Organizations"
- Subtitle: "Create and manage event sponsors" → "Manage sponsors, partners, and clients"
- Button: "Add New Sponsor" → "Add New Organization"

**Filtering:**
- Added Type filter dropdown alongside Tier filter
- Options: All Types, Sponsors, Partners, Clients

**Display:**
- Shows both Tier and Type badges on each card
- Type badges color-coded:
  - **Sponsor** = Purple
  - **Partner** = Blue
  - **Client** = Green

### 5. Homepage Integration
**File:** `src/pages/Index.tsx`

- Section title: "Building Strategic Partnerships" → "Trusted By Leading Organizations"
- Updated subtitle to mention "industry leaders, sponsors, and clients"
- Displays all types of organizations (no filtering on homepage)

## How to Apply

### Step 1: Run the Migration
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/gppohyyuggnfecfabcyz/editor
2. Click "SQL Editor" → "New query"
3. Copy contents of `supabase/migrations/20251119000002_add_sponsor_type.sql`
4. Run the query

### Step 2: Update Existing Records (Optional)
All existing sponsors will default to type='sponsor'. To update specific ones:

```sql
-- Update specific organizations to be partners
UPDATE public.sponsors
SET type = 'partner'
WHERE name IN ('Organization Name 1', 'Organization Name 2');

-- Update specific organizations to be clients
UPDATE public.sponsors
SET type = 'client'
WHERE name IN ('Client Name 1', 'Client Name 2');
```

## Usage

### Admin Panel
1. Navigate to `/admin/sponsors`
2. Click "Add New Organization"
3. Fill in:
   - Name
   - Tier (Bronze/Silver/Gold/Platinum)
   - **Type (Sponsor/Partner/Client)** ← NEW
   - Logo URL
   - Website URL

### Filtering
- Filter by Type: Shows only selected type
- Filter by Tier: Shows only selected tier
- Both filters: Shows organizations matching both criteria

### Homepage Display
All organization types appear in the "Trusted By Leading Organizations" section, displayed as logo grid with grayscale hover effect.

## Benefits

1. **Clearer Organization** - Differentiate between different relationship types
2. **Better Filtering** - Easily find specific organization types
3. **Flexible Display** - Can show all together or filter by type
4. **Future-Proof** - Easy to add new types if needed
5. **Visual Distinction** - Color-coded badges make type instantly recognizable

## Color Coding Reference

### Tiers
- Platinum: Gray
- Gold: Yellow
- Silver: Slate
- Bronze: Orange

### Types
- Sponsor: Purple
- Partner: Blue
- Client: Green

## Future Enhancements (Optional)

- Separate homepage sections for each type
- Stats showing count by type
- Relationship status (active/inactive)
- Contract expiration dates
- Custom fields per type
