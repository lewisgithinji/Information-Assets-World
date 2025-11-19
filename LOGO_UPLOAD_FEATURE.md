# Logo Upload & Auto-Scroll Feature

## Overview
Enhanced the organization management system with logo upload functionality, automatic image resizing, and an auto-scrolling logo carousel on the homepage.

## Features Implemented

### 1. Logo Upload with Automatic Resizing
**File:** `src/pages/admin/AdminSponsorForm.tsx`

**Features:**
- ✅ **Dual input methods**: Upload file OR enter URL
- ✅ **Automatic image resizing**: All logos resized to max 400x200px while maintaining aspect ratio
- ✅ **File validation**: Type checking (images only) and size limit (5MB max)
- ✅ **Live preview**: See logo before saving
- ✅ **Tab interface**: Clean UI with tabs for "Upload Image" vs "Enter URL"
- ✅ **One-click remove**: Easy logo removal with X button

**Technical Details:**
```typescript
// Automatic resizing using HTML5 Canvas
const resizeImage = (file: File): Promise<Blob> => {
  // Resizes to max 400x200px
  // Maintains aspect ratio
  // Outputs as PNG with 90% quality
};
```

**Upload Process:**
1. User selects image file
2. Image is resized client-side (max 400x200px)
3. Uploaded to Supabase Storage (`sponsor-logos` bucket)
4. Public URL generated and saved to database
5. Live preview updated

### 2. Auto-Scrolling Logo Carousel
**File:** `src/pages/Index.tsx`

**Features:**
- ✅ **Infinite scroll**: Seamless loop with duplicated logos
- ✅ **Smooth animation**: 30-second scroll cycle
- ✅ **Hover to pause**: Animation pauses on hover (removed for smooth experience)
- ✅ **Responsive**: Works on all screen sizes
- ✅ **Grayscale effect**: Logos in grayscale, color on hover

**CSS Animation:**
```css
@keyframes scroll-logos {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-scroll-logos {
  animation: scroll-logos 30s linear infinite;
}
```

### 3. Supabase Storage Bucket
**Migration:** `20251119000003_create_sponsor_logos_bucket.sql`

**Bucket:** `sponsor-logos`
- Public read access
- Authenticated users can upload/update/delete
- Stores all organization logos

**Policies:**
- ✅ Public SELECT (anyone can view logos)
- ✅ Authenticated INSERT (logged-in users can upload)
- ✅ Authenticated UPDATE (logged-in users can modify)
- ✅ Authenticated DELETE (logged-in users can remove)

## How to Use

### Admin Panel - Upload Logo

1. **Navigate to:** `/admin/sponsors`
2. **Click:** "Add New Organization" or "Edit" existing
3. **Upload Method 1 - File Upload:**
   - Click "Upload Image" tab
   - Click "Choose Logo File"
   - Select image (PNG, JPG, GIF, SVG)
   - Image automatically resized and uploaded
   - Preview appears below

4. **Upload Method 2 - URL:**
   - Click "Enter URL" tab
   - Paste image URL
   - Preview appears below

5. **Remove Logo:**
   - Click X button on preview card

### Homepage - View Logos

1. **Navigate to:** http://localhost:8080
2. **Scroll to:** "Trusted By Leading Organizations" section
3. **Watch:** Logos scroll automatically from right to left
4. **Hover:** Over any logo to see it in color

## File Changes

### Modified Files

1. **`src/pages/admin/AdminSponsorForm.tsx`**
   - Added logo upload functionality
   - Added image resizing logic
   - Added tabs UI for Upload vs URL
   - Added live preview
   - Added file validation

2. **`src/pages/Index.tsx`**
   - Changed grid layout to horizontal scroll
   - Added duplicate logos for seamless loop
   - Added scroll animation classes
   - Fixed flexbox layout for proper scrolling

3. **`src/index.css`**
   - Added `@keyframes scroll-logos` animation
   - Added `.animate-scroll-logos` utility class
   - Added pause-on-hover support (optional)

### New Files

1. **`supabase/migrations/20251119000003_create_sponsor_logos_bucket.sql`**
   - Creates `sponsor-logos` storage bucket
   - Sets up RLS policies
   - Enables public access for viewing

2. **`LOGO_UPLOAD_FEATURE.md`** (this file)
   - Documentation

## Technical Specifications

### Image Resize Logic
- **Max Width:** 400px
- **Max Height:** 200px
- **Aspect Ratio:** Maintained
- **Format:** PNG
- **Quality:** 90%
- **Method:** HTML5 Canvas API

### Animation Timing
- **Duration:** 30 seconds per full scroll
- **Easing:** Linear (constant speed)
- **Loop:** Infinite
- **Pause:** On hover (optional, can be enabled)

### Logo Display
- **Default:** Grayscale filter
- **Hover:** Full color
- **Size:** 192px width × 96px height (w-48 h-24)
- **Spacing:** 32px gap between logos

## Database Migration

### Apply the Storage Bucket Migration

```bash
# In Supabase SQL Editor
Run: supabase/migrations/20251119000003_create_sponsor_logos_bucket.sql
```

This creates the `sponsor-logos` bucket with proper policies.

## Browser Compatibility

✅ Chrome/Edge (Latest)
✅ Firefox (Latest)
✅ Safari (Latest)
✅ Mobile browsers

**Requirements:**
- HTML5 Canvas support (for resizing)
- CSS animations support
- Modern JavaScript (ES6+)

## Optimizations

1. **Client-side resizing**: Reduces upload size and server load
2. **Automatic format conversion**: All images saved as PNG for consistency
3. **Lazy loading**: Images load as needed
4. **GPU acceleration**: CSS transforms use GPU for smooth animation
5. **Infinite loop**: Seamless with duplicated array

## Future Enhancements (Optional)

- [ ] Drag & drop upload
- [ ] Crop tool before upload
- [ ] Multiple logo sizes (thumbnail, full)
- [ ] Logo CDN integration
- [ ] Batch upload support
- [ ] Logo analytics (view tracking)
- [ ] Animation speed control in admin
- [ ] Vertical scroll option
- [ ] Pause/play button for users

## Troubleshooting

### Logo not uploading
- Check file size < 5MB
- Verify file type is image
- Check Supabase storage bucket exists
- Verify authentication token valid

### Logos not scrolling
- Check CSS animation loaded
- Verify at least 2 logos exist
- Clear browser cache
- Check for JavaScript errors

### Preview not showing
- Verify URL is accessible
- Check CORS settings
- Try different image format
- Check browser console for errors

---

**All features are now ready to use!** The system supports both file uploads with automatic resizing and URL input, plus a beautiful auto-scrolling logo carousel on the homepage.
