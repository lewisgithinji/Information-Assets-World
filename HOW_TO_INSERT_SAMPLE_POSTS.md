# How to Insert Sample Blog Posts

## Quick Steps:

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/gppohyyuggnfecfabcyz/editor

2. **Navigate to SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy the SQL:**
   - Open the file: `INSERT_SAMPLE_BLOG_POSTS.sql`
   - Copy all the contents (Ctrl+A, Ctrl+C)

4. **Paste and Run:**
   - Paste into the SQL Editor
   - Click the "Run" button (or press Ctrl+Enter)

5. **Verify:**
   - You should see a success message
   - The query at the bottom will show all 6 posts inserted

6. **Refresh Your Blog:**
   - Go to: http://localhost:8080/blog
   - You should now see 6 blog posts!

---

## What Gets Created:

### 6 Sample Blog Posts:

1. **Welcome to Information Assets World Blog** ⭐ Featured
   - Category: Company News
   - 127 views
   - Tags: welcome, announcement, blog-launch

2. **Top 5 Cybersecurity Trends to Watch in 2025** ⭐ Featured
   - Category: Industry Insights
   - 243 views
   - Tags: cybersecurity, trends, 2025, ai, zero-trust

3. **How to Implement Zero Trust Security in Your Organization**
   - Category: Best Practices
   - 189 views
   - Tags: zero-trust, security, implementation, best-practices, guide

4. **Highlights from Our Recent ISO 27001 Training in Nairobi**
   - Category: Event Updates
   - 156 views
   - Tags: iso-27001, training, nairobi, event, highlights

5. **Case Study: How ABC Corporation Achieved ISO 27001 Certification** ⭐ Featured
   - Category: Case Studies
   - 312 views
   - Tags: case-study, iso-27001, certification, success-story

6. **Understanding the New EU Cyber Resilience Act**
   - Category: Industry Insights
   - 198 views
   - Tags: cyber-resilience-act, eu-regulation, compliance, product-security

---

## Features Demonstrated:

✅ **Rich HTML Content** - Posts include headings, lists, quotes, bold text
✅ **Categories** - Each post has a category
✅ **Tags** - Multiple tags per post
✅ **Featured Posts** - 3 posts marked as featured
✅ **View Counts** - Realistic view numbers
✅ **Published Dates** - Spread over last 10 days

---

## Testing After Insert:

### On Public Blog (`/blog`):
- ✅ See all 6 posts in grid
- ✅ Search for "ISO" or "Security"
- ✅ Filter by category
- ✅ Click tags to filter
- ✅ View individual posts

### On Admin Dashboard (`/admin/blog`):
- ✅ See all 6 posts
- ✅ Stats show: 6 Total, 6 Published, 0 Drafts
- ✅ Total views: 1,225
- ✅ Edit any post
- ✅ Filter and search

### Featured Posts:
3 posts marked as featured (⭐):
- Welcome post
- Cybersecurity Trends 2025
- ABC Corporation Case Study

---

## Cleanup Later:

When you're ready to delete sample posts:

```sql
-- Delete all sample blog posts
DELETE FROM public.blog_posts
WHERE slug IN (
  'welcome-to-information-assets-world-blog',
  'cybersecurity-trends-2025',
  'implement-zero-trust-security',
  'iso-27001-training-nairobi-highlights',
  'abc-corporation-iso-27001-case-study',
  'eu-cyber-resilience-act-explained'
);
```

Or delete them one by one from the admin panel using the Delete button.

---

## Troubleshooting:

**If you get an error about category_id:**
- The sample posts reference categories by slug
- Make sure the blog migration was applied successfully
- Categories should exist: company-news, industry-insights, event-updates, best-practices, case-studies

**If posts don't appear on /blog:**
- Check all posts have `status = 'published'`
- Check `published_date` is not in the future
- Clear browser cache and refresh

---

**Ready to Test!** 🚀

After running this SQL, your blog will be fully populated with realistic sample content for testing all features.
