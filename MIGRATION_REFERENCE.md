# Database Migration Reference

This document provides an overview of all database migrations in chronological order with descriptive names.

## Migration List

### September 11, 2025 - Initial Schema Setup

**1. `20250911135106_initial_schema_tables.sql`**
- Creates initial database schema
- Tables: profiles, speakers, sponsors, events, papers, offices
- Basic RLS policies
- Core trigger functions

**2. `20250911140433_add_training_types.sql`**
- Adds training_types table
- Used for categorizing training programs

**3. `20250911140458_add_offices_location.sql`**
- Adds location fields to offices table
- Geographic data for office locations

**4. `20250911145022_add_event_categories_types.sql`**
- Creates event_categories table
- Creates event_types table
- Allows dynamic event classification

**5. `20250911163057_add_event_fees.sql`**
- Creates event_fees table
- Supports multiple pricing tiers per event

---

### September 12, 2025 - Lead Management System

**6. `20250912081042_add_lead_submissions.sql`**
- Creates lead_submissions table
- Tracks form submissions

**7. `20250912084927_create_activities_table.sql`**
- Creates activities table
- Track interactions with leads (calls, emails, meetings)

**8. `20250912085013_add_activity_metadata.sql`**
- Adds metadata field to activities
- Stores additional activity details (JSON)

**9. `20250912090421_enhance_papers_table.sql`**
- Enhances papers table structure
- Adds status, category, tags fields

**10. `20250912095732_add_papers_rls_policies.sql`**
- Adds Row Level Security policies for papers
- Public can view published papers
- Admins/editors can manage all papers

**11. `20250912100034_add_leads_priority_notes.sql`**
- Adds priority and notes fields to leads
- Better lead qualification

**12. `20250912101114_add_leads_reference_number.sql`**
- Adds reference_number field to leads
- Format: RIMEA/INQ/MMYYYY/XXX

**13. `20250912101135_add_leads_training_interest.sql`**
- Adds training_interest field to leads
- Tracks specific training programs of interest

---

### October 1-2, 2025 - Storage & Event Features

**14. `20251001090453_create_event_images_storage.sql`**
- Creates event-images storage bucket
- 5MB limit, supports JPEG, PNG, WebP
- Public read access, admin/editor upload

**15. `20251002103320_add_agenda_items_table.sql`**
- Creates agenda_items table
- Manages event schedules and sessions

---

### October 23, 2025 - User Roles & Lead Enhancements

**16. `20251023182922_create_user_roles_system.sql`**
- Creates app_role enum (admin, editor, user)
- Creates user_roles table
- Implements has_role() security function
- Comprehensive RLS policies for all tables

**17. `20251023183123_create_leads_table.sql`**
- Major refactor of leads table
- Adds full name, email, phone, status workflow
- Status: new → contacted → doc_sent → negotiating → quote_sent → confirmed → lost

**18. `20251023185100_add_leads_country_organization.sql`**
- Adds country and organization fields
- Better lead profiling

**19. `20251023185540_add_leads_status_enum.sql`**
- Creates lead_status enum type
- Ensures valid status values

**20. `20251023192917_fix_leads_rls_policies.sql`**
- Updates RLS policies for leads table
- Proper admin/editor permissions

**21. `20251023201944_create_notifications_table.sql`**
- Creates notifications table
- In-app notification system
- Types: lead_assigned, lead_updated, follow_up_due, etc.

---

### October 31 - November 1, 2025 - Security Features

**22. `20251031000001_create_security_audit_tables.sql`**
- Creates audit_logs table
- Creates login_attempts table
- Creates user_security_settings table
- Comprehensive security tracking

**23. `20251031000002_fix_security_settings_rls.sql`**
- Fixes RLS policies for security tables
- Ensures proper access control

**24. `20251101000003_create_user_sessions_tracking.sql`**
- Creates user_sessions table
- Tracks user login sessions
- IP address, device, location tracking

---

### November 3, 2025 - Event Registration & Global Features

**25. `20251103000001_fix_session_rls_policies.sql`**
- Fixes RLS policies for user_sessions table
- Proper security for session data

**26. `20251103000002_add_event_id_and_inquiry_type.sql`**
- Adds event_id foreign key to leads table
- Adds inquiry_type field with options:
  - send_writeup
  - contact_discuss
  - group_registration
  - corporate_training
  - register_now
  - just_browsing

**27. `20251103000003_add_global_countries.sql`**
- Creates countries_config table
- 195 countries pre-populated
- Replaces hardcoded country list
- Supports country management via admin panel

---

### November 19, 2025 - Blog/News System

**28. `20251119000001_create_blog_system.sql`**
- Creates blog_posts table
- Creates blog_categories table
- Creates blog-images storage bucket
- RLS policies for blog content
- Helper functions: generate_blog_slug(), increment_blog_view_count()
- Seeds 5 default categories:
  - Company News
  - Industry Insights
  - Event Updates
  - Best Practices
  - Case Studies

---

## Migration Application Status

### Applied to Database ✅
Migrations 1-27 are applied and running in production.

### Pending Application ⏳
Migration 28 (blog system) needs to be applied manually via Supabase Dashboard.

---

## How to Apply Migrations

### For New Migrations
1. Create migration file in `supabase/migrations/`
2. Name format: `YYYYMMDDHHMMSS_descriptive_name.sql`
3. Apply via Supabase Dashboard → SQL Editor
4. Copy and paste migration SQL
5. Click "Run" to execute

### For Existing Database
All migrations 1-27 are already applied.
Only migration 28 (blog system) needs manual application.

---

## Migration Naming Convention

Format: `YYYYMMDDHHMMSS_descriptive_name.sql`

Examples:
- ✅ `20251119000001_create_blog_system.sql` - Good: Clear, descriptive
- ❌ `20251119000001_a4f3b2c1-9876-5432-1098-abcdef123456.sql` - Bad: UUID not descriptive

---

## Key Database Objects Created

### Tables (28 total)
- profiles, user_roles, user_sessions
- events, event_categories, event_types, event_fees, agenda_items
- speakers, sponsors, offices
- papers
- leads, lead_submissions, activities
- training_types
- countries_config
- notifications
- audit_logs, login_attempts, user_security_settings
- blog_posts, blog_categories

### Enums
- app_role (admin, editor, user)
- lead_status (new, contacted, doc_sent, negotiating, quote_sent, confirmed, lost)

### Functions
- update_updated_at_column() - Auto-update timestamps
- handle_new_user() - Create profile on signup
- has_role(user_id, role) - Check user permissions (SECURITY DEFINER)
- generate_blog_slug(title) - Create URL-friendly slugs
- increment_blog_view_count(post_id) - Track post views

### Storage Buckets
- event-images (5MB, public read, admin/editor write)
- blog-images (5MB, public read, admin/editor write)
- avatars (referenced but not in migrations)

---

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:
- Public read for published content
- Authenticated users for draft content
- Admin/editor permissions for create/update
- Admin-only for delete operations

### Audit Trail
- audit_logs table tracks all significant actions
- login_attempts table for security monitoring
- user_sessions for session management

### Role Hierarchy
```
admin > editor > user

admin: Full access (create, read, update, delete)
editor: Create, read, update (no delete)
user: Read published content only
```

---

## Reference

For more details on a specific migration, open the file in `supabase/migrations/`

Last updated: 2025-11-19
