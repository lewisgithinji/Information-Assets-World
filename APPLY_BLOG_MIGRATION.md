# How to Apply Blog Migration

Since the Supabase CLI requires database password authentication, please apply the migration manually through the Supabase Dashboard.

## Steps:

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/gppohyyuggnfecfabcyz/editor

2. **Open SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy Migration SQL:**
   - Open this file: `supabase/migrations/20251119000001_create_blog_system.sql`
   - Copy the entire contents

4. **Execute Migration:**
   - Paste the SQL into the SQL Editor
   - Click "Run" button
   - Wait for confirmation message

5. **Verify Tables Created:**
   - Go to "Table Editor" in left sidebar
   - You should see new tables:
     - `blog_posts`
     - `blog_categories`
   - Check "Storage" section for new bucket:
     - `blog-images`

## What This Migration Creates:

### Tables:
- ✅ `blog_posts` - Main blog posts table
- ✅ `blog_categories` - Blog categories

### Features:
- ✅ RLS policies (same security as papers)
- ✅ Storage bucket for blog images
- ✅ Automatic timestamps
- ✅ Full-text search index
- ✅ Helper functions (slug generation, view counter)
- ✅ 5 default categories seeded

### Default Categories Created:
1. Company News
2. Industry Insights
3. Event Updates
4. Best Practices
5. Case Studies

## After Applying:

Once you've run the migration in the Dashboard, let me know and we'll continue building the frontend components!

## Troubleshooting:

If you get any errors:
1. Check if `update_updated_at_column()` function exists (it should from previous migrations)
2. Check if `has_role()` function exists (it should from user role system)
3. If either is missing, let me know and I'll provide those functions

## Alternative: Run Individual Sections

If the full migration fails, you can run it in sections:
1. First run sections 1-3 (tables and triggers)
2. Then run section 4 (storage bucket)
3. Then run sections 5-6 (RLS policies)
4. Then run section 7 (storage policies)
5. Finally run sections 8-9 (seed data and functions)
