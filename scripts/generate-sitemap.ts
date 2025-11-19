import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

async function generateSitemap() {
  const entries: SitemapEntry[] = [];
  const baseUrl = 'https://informationassetsworld.com';

  // Static pages
  const staticPages = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/events', changefreq: 'weekly', priority: '0.9' },
    { loc: '/membership', changefreq: 'monthly', priority: '0.9' },
    { loc: '/papers', changefreq: 'weekly', priority: '0.8' },
    { loc: '/blog', changefreq: 'daily', priority: '0.8' },
    { loc: '/about', changefreq: 'monthly', priority: '0.7' },
    { loc: '/offices', changefreq: 'monthly', priority: '0.7' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.7' },
    { loc: '/register-interest', changefreq: 'monthly', priority: '0.8' },
    { loc: '/advertising', changefreq: 'monthly', priority: '0.6' },
    { loc: '/auth', changefreq: 'yearly', priority: '0.3' },
  ];

  entries.push(...staticPages.map(page => ({
    loc: `${baseUrl}${page.loc}`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: page.changefreq,
    priority: page.priority,
  })));

  // Fetch events
  const { data: events } = await supabase
    .from('events')
    .select('id, slug, updated_at')
    .order('updated_at', { ascending: false });

  if (events) {
    events.forEach(event => {
      entries.push({
        loc: `${baseUrl}/events/${event.slug || event.id}`,
        lastmod: event.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.8',
      });
    });
  }

  // Fetch papers
  const { data: papers } = await supabase
    .from('papers')
    .select('id, slug, updated_at')
    .order('updated_at', { ascending: false });

  if (papers) {
    papers.forEach(paper => {
      entries.push({
        loc: `${baseUrl}/papers/${paper.slug || paper.id}`,
        lastmod: paper.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.7',
      });
    });
  }

  // Fetch blog posts
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('id, slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (blogPosts) {
    blogPosts.forEach(post => {
      entries.push({
        loc: `${baseUrl}/blog/${post.slug || post.id}`,
        lastmod: post.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.7',
      });
    });
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${entries.map(entry => `  <url>
    <loc>${entry.loc}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  // Write to public directory
  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf-8');

  console.log(`✅ Sitemap generated successfully with ${entries.length} URLs`);
  console.log(`   - ${staticPages.length} static pages`);
  console.log(`   - ${events?.length || 0} events`);
  console.log(`   - ${papers?.length || 0} papers`);
  console.log(`   - ${blogPosts?.length || 0} blog posts`);
  console.log(`   Output: ${outputPath}`);
}

generateSitemap().catch(console.error);
