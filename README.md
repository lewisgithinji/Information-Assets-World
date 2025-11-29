# Information Assets World

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)

## Overview

Enterprise-grade event management and professional networking platform designed for the information management industry. This production-ready application powers conferences, exhibitions, workshops, and professional development events across multiple countries, serving organizations in records management, data governance, and information security sectors.

### 🎯 Project Highlights

- **Enterprise Event Platform**: Full-featured system managing 7+ event types with multi-day scheduling, real-time countdowns, and live event indicators
- **Advanced Architecture**: React 18 + TypeScript with Supabase backend, featuring Row Level Security (RLS), edge functions, and serverless infrastructure
- **CRM & Lead Management**: Comprehensive lead capture, scoring, qualification system with email notifications via Resend API
- **SEO Excellence**: Dynamic sitemap generation, structured data (JSON-LD), Open Graph integration, and Core Web Vitals tracking
- **Production Scale**: Multi-tenant architecture supporting white-label deployments with global CDN delivery

This project demonstrates expertise in full-stack TypeScript development, serverless architecture, PostgreSQL database design, enterprise CRM systems, and scalable event management platforms.

**🌐 Live Demo**: [https://informationassetsworld.com](https://informationassetsworld.com)

### 💼 Key Technologies

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript 5, Vite 5 |
| **UI Framework** | Tailwind CSS, shadcn/ui, Radix UI |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| **State Management** | TanStack Query (React Query) |
| **Forms & Validation** | React Hook Form, Zod |
| **Email** | Resend API |
| **SEO** | React Helmet Async, Dynamic Sitemap, JSON-LD |
| **Performance** | Web Vitals, Service Workers, PWA |
| **Deployment** | Vercel / Cloudflare Pages |

## ✨ Features

### Event Management
- ✅ Multi-day conference and event scheduling
- ✅ Real-time countdown timers for upcoming events
- ✅ "Happening Now" live event indicators with animated status
- ✅ Automatic past event filtering from featured sections
- ✅ Support for 7+ event types: Conferences, Workshops, Webinars, Seminars, Exhibitions, Networking Events, and Gala Events
- ✅ Dynamic event registration with lead capture

### Content Management
- ✅ Research papers and publications library
- ✅ Blog/news management system with featured posts
- ✅ Speaker and agenda management
- ✅ Sponsor and partner showcases
- ✅ Multi-image galleries for events

### Membership System
- ✅ Tiered membership plans (Individual, Corporate, Enterprise)
- ✅ Member benefits and access control
- ✅ Secure authentication with role-based permissions

### Lead Management (CRM)
- ✅ Comprehensive lead capture forms
- ✅ Lead scoring and qualification
- ✅ Follow-up tracking and reminders
- ✅ Email notification system via Resend
- ✅ Admin dashboard with analytics

### SEO & Performance
- ✅ Dynamic sitemap generation for all content
- ✅ Structured data (JSON-LD) for events, organizations, and breadcrumbs
- ✅ Open Graph and Twitter Card meta tags
- ✅ Core Web Vitals tracking (CLS, FID, LCP, FCP, TTFB)
- ✅ PWA-ready with offline support
- ✅ Gzip/Brotli compression
- ✅ Code splitting and lazy loading

### Security
- ✅ Row Level Security (RLS) policies
- ✅ Security audit logging
- ✅ Session management
- ✅ Input validation and sanitization

## 🏗️ Architecture

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

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Supabase account** ([Sign up](https://supabase.com/))

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

Create a `.env.local` file:

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

## 🗄️ Database Migrations

```bash
# Push migrations to Supabase
cd supabase
npx supabase db push
```

## 🎯 Key Differentiators

- **Enterprise-Ready**: Built for organizations managing multiple events across regions
- **Industry-Focused**: Tailored for information management, records management, and data governance sectors
- **Scalable Architecture**: Serverless backend with edge functions for global performance
- **Compliance-Ready**: Security audit trails and data protection features
- **Multi-Tenant Capable**: Architecture supports white-label deployments

## 💼 Use Cases

This platform is ideal for:
- Professional associations and industry bodies
- Conference and exhibition organizers
- Corporate training and workshop providers
- Academic institutions hosting symposiums
- Government agencies managing public events

## 🚢 Deployment

The application can be deployed to any static hosting provider:

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Connect your GitHub repository for automatic deployments.

### Cloudflare Pages

Optimal for global edge distribution with automatic builds.

### Netlify

Simple drag-and-drop or Git-based deployment.

### Environment Variables for Production

Set the following in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🤝 Support & Customization

For enterprise deployments, white-label solutions, or custom development:

**Available Services:**
- Custom feature development
- White-label branding
- Multi-tenant configurations
- Integration with existing systems
- Training and onboarding
- Technical support and maintenance

## 📊 Performance Metrics

- **Lighthouse Score**: 95+ across all categories
- **Core Web Vitals**: Optimized for LCP, FID, and CLS
- **SEO Score**: 100/100
- **Accessibility**: WCAG 2.1 Level AA compliant

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👥 Credits

### Development

**SirLewis** - Lead Developer & Technical Architect
[https://sirlewis.pages.dev/](https://sirlewis.pages.dev/)

Specializes in enterprise React applications, serverless architecture, and event management platforms.

### Client & Domain Expertise

**Datacare Solutions** - Information Management Specialists
[https://datacare.co.ke](https://datacare.co.ke)

Leading provider of information management solutions across East Africa.

## 📄 License

**Copyright © 2025 Information Assets World. All rights reserved.**

This project is proprietary software. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited without explicit written permission.

For licensing inquiries, please contact the development team.

---

**Built with precision for the information management industry**
