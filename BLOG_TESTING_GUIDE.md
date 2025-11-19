# Blog System Testing Guide

## 🚀 Server Status
✅ **Development server is running at:** http://localhost:8080

---

## 📋 Test Checklist

### 1. Public Blog Pages

#### Test Blog Listing Page
1. **Navigate to:** http://localhost:8080/blog
2. **Check:**
   - ✅ Hero section displays "News & Insights"
   - ✅ Search bar is visible
   - ✅ Category dropdown shows 5 categories
   - ✅ Grid layout is responsive
   - ✅ "No articles found" message (if no posts yet)

#### Test Search & Filters
1. **On /blog page:**
   - Try searching (if posts exist)
   - Select different categories from dropdown
   - Click "Clear Filters" button
   - Verify filter count badge updates

#### Test Individual Post Page
1. **Navigate to:** http://localhost:8080/blog/test-slug (will 404 until you create a post)
2. **After creating a post:**
   - Click any blog card from listing
   - Verify featured image displays
   - Check content renders properly
   - Test share button
   - Click tags to filter
   - View related posts section

---

### 2. Admin Blog Management

#### Access Admin Dashboard
1. **Login as admin:**
   - Go to: http://localhost:8080/auth
   - Sign in with admin credentials

2. **Navigate to:** http://localhost:8080/admin/blog
3. **Check:**
   - ✅ Stats cards show (Total Posts, Published, Drafts, Total Views)
   - ✅ "New Blog Post" button visible
   - ✅ Search and filter dropdowns work
   - ✅ Empty state shows if no posts

#### Create Your First Blog Post
1. **Click "New Blog Post"** or go to: http://localhost:8080/admin/blog/new

2. **Fill in the form:**

   **Post Details:**
   - **Title:** "Welcome to Information Assets World Blog"
   - **Click "Generate"** for slug (or enter custom slug)
   - **Excerpt:** "Stay updated with the latest insights in information security and compliance. We're excited to share industry news, best practices, and expert analysis."
   - **Content:** Use the rich text editor:
     ```
     Welcome to our new blog!

     We're excited to launch this platform to share:

     - Industry insights and trends
     - Best practices in information security
     - Event highlights and updates
     - Expert analysis and case studies

     Stay tuned for regular updates!
     ```

   **Featured Image:**
   - Click image uploader
   - Upload any image (or skip for now)

   **Publish Settings (Sidebar):**
   - **Status:** Select "Published"
   - **Publish Date:** Leave empty (uses today)
   - **Featured Post:** Toggle ON

   **Category:**
   - Select "Company News"

   **Tags:**
   - Enter: "welcome, announcement, blog launch"

3. **Click "Create Post"**

4. **Verify:**
   - ✅ Redirected to /admin/blog
   - ✅ Success toast notification
   - ✅ New post appears in list
   - ✅ Stats updated (Total: 1, Published: 1)

#### Test Rich Text Editor
1. **Create another post** with rich formatting:
   - Bold text
   - Italic text
   - Heading 2
   - Heading 3
   - Bullet list
   - Numbered list
   - Block quote
   - Link (highlight text, click link icon, enter URL)
   - Image (click image icon, enter image URL)

2. **Verify:**
   - ✅ Toolbar buttons work
   - ✅ Formatting appears in editor
   - ✅ Preview shows formatted content

#### Test Edit Post
1. **From /admin/blog:**
   - Click "Edit" on any post
   - Modify title or content
   - Click "Update Post"
   - Verify changes saved

#### Test Post Status Workflow
1. **Create post as Draft:**
   - Status: "Draft"
   - Save post
   - Verify it doesn't appear on public /blog page

2. **Publish the draft:**
   - Edit post
   - Change status to "Published"
   - Update post
   - Verify it now appears on /blog page

3. **Archive a post:**
   - Edit post
   - Change status to "Archived"
   - Update post
   - Verify it disappears from public /blog page

#### Test Delete Post
1. **From /admin/blog:**
   - Click "Delete" button
   - Confirm in dialog
   - Verify post removed
   - Check stats updated

---

### 3. Navigation Testing

#### Main Navigation
1. **Check navigation bar:**
   - ✅ "Blog" link visible between "Research Papers" and "About"
   - Click "Blog" link
   - Verify navigates to /blog

#### Breadcrumbs & Back Navigation
1. **On blog post page:**
   - Click "Back to Blog" button
   - Verify returns to listing

2. **On admin form:**
   - Click "Back to Blog Posts"
   - Verify returns to admin dashboard

---

### 4. Features Testing

#### Category Filtering
1. **On /blog page:**
   - Select "Company News" from dropdown
   - Verify only Company News posts show
   - Select "All Categories"
   - Verify all posts show again

#### Tag Filtering
1. **On /blog page:**
   - Click any tag badge on a post card
   - Verify URL shows ?tag=tagname
   - Verify only posts with that tag show
   - Click tag badge again or clear filters

#### Search Functionality
1. **On /blog page:**
   - Type search term in search box
   - Verify posts filter in real-time
   - Clear search
   - Verify all posts return

#### View Counter
1. **View a blog post:**
   - Note the view count
   - Refresh page
   - View count should increment by 1

#### Featured Posts
1. **Mark post as featured:**
   - Edit any post
   - Toggle "Featured Post" ON
   - Update post
   - Verify ⭐ "Featured" badge shows in admin list

#### Related Posts
1. **Create multiple posts** in same category
2. **View any post**
3. **Scroll to "Related Articles"** section
4. **Verify:**
   - Shows up to 3 posts from same category
   - Excludes current post
   - Shows newest first

#### Social Sharing
1. **On blog post page:**
   - Click "Share" button
   - On mobile: Native share dialog appears
   - On desktop: Link copied to clipboard notification

---

### 5. Responsive Design Testing

#### Desktop (1920x1080)
- ✅ 3-column grid on /blog
- ✅ Full sidebar on admin form
- ✅ All toolbar buttons visible

#### Tablet (768px)
- ✅ 2-column grid on /blog
- ✅ Filters stack vertically
- ✅ Sidebar moves below content on admin form

#### Mobile (375px)
- ✅ 1-column grid on /blog
- ✅ Hamburger menu for navigation
- ✅ Touch-friendly buttons
- ✅ Editor toolbar wraps

---

### 6. Security Testing

#### As Public User (Not Logged In)
1. **Try to access:**
   - http://localhost:8080/admin/blog
   - **Expected:** Redirected to /auth

2. **On /blog page:**
   - **Expected:** Only see published posts
   - **Expected:** No drafts or archived posts visible

#### As Editor
1. **Login as editor**
2. **Navigate to /admin/blog**
   - **Expected:** Can create, edit posts
   - **Expected:** Can publish posts
   - **Expected:** Cannot delete posts (admin only)

#### As Admin
1. **Login as admin**
2. **Navigate to /admin/blog**
   - **Expected:** Full access (create, edit, delete, publish)

---

### 7. Edge Cases Testing

#### Empty States
1. **No posts created:**
   - /blog shows "No articles found"
   - /admin/blog shows "Create your first blog post"

2. **No results from search:**
   - Search for non-existent term
   - Shows "No articles found matching your criteria"

#### Invalid URLs
1. **Navigate to:**
   - http://localhost:8080/blog/non-existent-slug
   - **Expected:** "Article Not Found" message with "Back to Blog" button

#### Form Validation
1. **On admin form:**
   - Try submitting empty form
   - **Expected:** Required field errors
   - Try title without slug
   - **Expected:** Slug required error

#### Long Content
1. **Create post with:**
   - Very long title (100+ characters)
   - Very long excerpt (500+ characters)
   - Very long content (5000+ words)
   - 20+ tags
2. **Verify:**
   - Card shows truncated excerpt (line-clamp-3)
   - Title wraps properly
   - Content scrollable

---

### 8. Performance Testing

#### Load Time
1. **Clear browser cache**
2. **Navigate to /blog**
3. **Check:**
   - Page loads in < 2 seconds
   - Images lazy load
   - No layout shift

#### Caching
1. **Visit /blog page**
2. **Navigate away**
3. **Return to /blog**
4. **Verify:**
   - Instant load (React Query cache)
   - No spinner shown

---

## 🐛 Common Issues & Solutions

### Issue: "Blog" link not in navigation
**Solution:** Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: No posts showing on /blog
**Solution:**
1. Check you created posts with status="published"
2. Check published_date is not in future

### Issue: Rich text editor not loading
**Solution:**
1. Check browser console for errors
2. Verify TipTap packages installed: `npm list @tiptap/react`

### Issue: Images not uploading
**Solution:**
1. Verify `blog-images` bucket exists in Supabase Storage
2. Check storage policies are applied
3. Verify file size < 5MB

### Issue: Can't access /admin/blog
**Solution:**
1. Verify logged in as admin or editor
2. Check user_roles table has correct role assigned

### Issue: Slug already exists error
**Solution:**
1. Click "Generate" button again
2. Or manually modify slug to be unique

---

## ✅ Success Criteria

Your blog system is working correctly if:

- ✅ Can create blog posts with rich text
- ✅ Posts appear on /blog page
- ✅ Individual posts are viewable
- ✅ Search and filters work
- ✅ Image upload works
- ✅ Admin can manage all posts
- ✅ Public can only view published posts
- ✅ Navigation includes "Blog" link
- ✅ Responsive on all devices
- ✅ No console errors

---

## 📊 Test Data Template

Use this to create sample posts quickly:

### Post 1: Company News
```
Title: Information Assets World Launches New Training Platform
Slug: new-training-platform-launch
Excerpt: We're excited to announce the launch of our comprehensive online training platform, making information security education more accessible than ever.
Category: Company News
Tags: announcement, platform, training
Status: Published
Featured: Yes
```

### Post 2: Industry Insights
```
Title: Top 5 Cybersecurity Trends to Watch in 2025
Slug: cybersecurity-trends-2025
Excerpt: As we move into 2025, the cybersecurity landscape continues to evolve. Here are the five most important trends that security professionals need to be aware of.
Category: Industry Insights
Tags: cybersecurity, trends, 2025
Status: Published
Featured: No
```

### Post 3: Best Practices
```
Title: How to Implement Zero Trust Security in Your Organization
Slug: implement-zero-trust-security
Excerpt: Zero Trust security is no longer optional. Learn how to implement this critical security framework in your organization with our step-by-step guide.
Category: Best Practices
Tags: zero-trust, security, implementation
Status: Published
Featured: Yes
```

---

## 🎯 Next Steps After Testing

Once testing is complete:

1. **Create 5-10 real blog posts** with actual content
2. **Add featured posts to homepage** (optional enhancement)
3. **Set up regular posting schedule**
4. **Train content team** on using the admin panel
5. **Monitor analytics** (view counts, popular posts)
6. **Gather feedback** from users

---

**Happy Testing!** 🚀

Report any issues you find and I'll help fix them immediately.
