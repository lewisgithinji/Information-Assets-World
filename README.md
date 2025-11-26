# Information Assets World

A comprehensive event management and professional networking platform designed for the information management industry. This enterprise-grade solution powers conferences, exhibitions, workshops, and professional development events across multiple countries.

## Live Demo

**Production URL**: [informationassetsworld.com](https://informationassetsworld.com)

## Features

### Event Management
- Multi-day conference and event scheduling
- Real-time countdown timers for upcoming events
- "Happening Now" live event indicators with animated status
- Automatic past event filtering from featured sections
- Support for 7+ event types: Conferences, Workshops, Webinars, Seminars, Exhibitions, Networking Events, and Gala Events
- Dynamic event registration with lead capture

### Content Management
- Research papers and publications library
- Blog/news management system with featured posts
- Speaker and agenda management
- Sponsor and partner showcases
- Multi-image galleries for events

### Membership System
- Tiered membership plans (Individual, Corporate, Enterprise)
- Member benefits and access control
- Secure authentication with role-based permissions

### Lead Management (CRM)
- Comprehensive lead capture forms
- Lead scoring and qualification
- Follow-up tracking and reminders
- Email notification system via Resend
- Admin dashboard with analytics

### SEO & Performance
- Dynamic sitemap generation for all content
- Structured data (JSON-LD) for events, organizations, and breadcrumbs
- Open Graph and Twitter Card meta tags
- Core Web Vitals tracking (CLS, FID, LCP, FCP, TTFB)
- PWA-ready with offline support
- Gzip/Brotli compression
- Code splitting and lazy loading

### Security
- Row Level Security (RLS) policies
- Security audit logging
- Session management
- Input validation and sanitization

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| **State Management** | TanStack Query (React Query) |
| **Forms** | React Hook Form, Zod validation |
| **Email** | Resend API |
| **SEO** | React Helmet Async, Dynamic Sitemap |
| **Performance** | Web Vitals, Service Workers |
| **Deployment** | Vercel / Cloudflare Pages |

## Architecture

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui primitives
│   ├── admin/          # Admin panel components
│   ├── blog/           # Blog-related components
│   └── leads/          # Lead management components
├── hooks/              # Custom React hooks
├── pages/              # Route pages
│   └── admin/          # Admin dashboard pages
├── integrations/       # Third-party integrations
│   └── supabase/       # Supabase client & types
├── utils/              # Utility functions
└── assets/             # Static assets

supabase/
├── migrations/         # Database schema migrations
└── functions/          # Edge Functions (Deno)
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/lewisgithinji/don-iaw.git

# Navigate to project directory
cd don-iaw

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build for Production

```bash
# Generate sitemap and build
npm run build

# Preview production build
npm run preview
```

## Database Migrations

```bash
# Push migrations to Supabase
cd supabase
npx supabase db push
```

## Key Differentiators

- **Enterprise-Ready**: Built for organizations managing multiple events across regions
- **Industry-Focused**: Tailored for information management, records management, and data governance sectors
- **Scalable Architecture**: Serverless backend with edge functions for global performance
- **Compliance-Ready**: Security audit trails and data protection features
- **Multi-Tenant Capable**: Architecture supports white-label deployments

## Use Cases

This platform is ideal for:
- Professional associations and industry bodies
- Conference and exhibition organizers
- Corporate training and workshop providers
- Academic institutions hosting symposiums
- Government agencies managing public events

## Screenshots

*Contact for demo access and screenshots*

## Deployment

The application can be deployed to any static hosting provider:

- **Vercel**: Connect your GitHub repository for automatic deployments
- **Cloudflare Pages**: Optimal for global edge distribution
- **Netlify**: Simple drag-and-drop or Git-based deployment

## Support & Customization

For enterprise deployments, white-label solutions, or custom development:

**Contact the development team for:**
- Custom feature development
- White-label branding
- Multi-tenant configurations
- Integration with existing systems
- Training and onboarding

## Credits

### Development

**SirLewis** - Lead Developer & Architect
[https://sirlewis.pages.dev/](https://sirlewis.pages.dev/)

### Client & Domain Expertise

**Datacare Solutions** - Information Management Specialists
[https://datacare.co.ke](https://datacare.co.ke)

---

## License

This project is proprietary software. All rights reserved.

For licensing inquiries, please contact the development team.

---

*Built with precision for the information management industry*
