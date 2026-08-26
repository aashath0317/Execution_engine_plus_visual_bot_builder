import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://fydblock.com';
const PUBLIC_DIR = path.resolve(__dirname, '../public');

// Static routes from App.jsx
const STATIC_ROUTES = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/company', changefreq: 'monthly', priority: 0.8 },
    { url: '/spot-grid', changefreq: 'weekly', priority: 0.9 },
    { url: '/pricing', changefreq: 'monthly', priority: 0.8 },
    { url: '/contact', changefreq: 'monthly', priority: 0.7 },
    { url: '/academy', changefreq: 'weekly', priority: 0.8 },
    { url: '/faq', changefreq: 'monthly', priority: 0.7 },
    { url: '/exchanges', changefreq: 'monthly', priority: 0.7 },
    { url: '/blog', changefreq: 'daily', priority: 0.8 },
    { url: '/terms_and_conditions', changefreq: 'yearly', priority: 0.3 },
    { url: '/privacy_policy', changefreq: 'yearly', priority: 0.3 },
    { url: '/refund_policy', changefreq: 'yearly', priority: 0.3 },
    { url: '/recurring_payment_policy', changefreq: 'yearly', priority: 0.3 },
];

// Initial blogs from blogApi.js (simulated)
const INITIAL_BLOGS = [
    { id: 1, created_at: '2026-01-05T10:00:00Z' },
    { id: 2, created_at: '2026-01-03T14:30:00Z' },
    { id: 3, created_at: '2025-12-28T09:15:00Z' },
    { id: 4, created_at: '2026-01-07T11:00:00Z' },
];

const generateXML = (urls) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${DOMAIN}${u.url}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;
};

const generateIndexXML = (sitemaps) => {
    const now = new Date().toISOString();
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(s => `  <sitemap>
    <loc>${DOMAIN}/${s}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
};

async function generate() {
    console.log('Generating sitemaps...');

    // 1. Generate sitemap_pages.xml
    const pagesXml = generateXML(STATIC_ROUTES);
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap_pages.xml'), pagesXml);
    console.log('✓ sitemap_pages.xml generated');

    // 2. Generate sitemap_blogs.xml
    const blogRoutes = INITIAL_BLOGS.map(blog => ({
        url: `/blog/${blog.id}`,
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: blog.created_at.split('T')[0]
    }));
    const blogsXml = generateXML(blogRoutes);
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap_blogs.xml'), blogsXml);
    console.log('✓ sitemap_blogs.xml generated');

    // 3. Generate sitemap_index.xml
    const indexXml = generateIndexXML(['sitemap_pages.xml', 'sitemap_blogs.xml']);
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap_index.xml'), indexXml);
    console.log('✓ sitemap_index.xml generated');

    console.log('Done!');
}

generate().catch(err => {
    console.error('Error generating sitemaps:', err);
    process.exit(1);
});
