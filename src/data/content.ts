// Content management data structures for Information Assets World
// This simulates a CMS backend with static data

export interface Event {
  id: string;
  title: string;
  slug: string;
  type: 'conference' | 'exhibition' | 'gala' | 'vendor' | 'joint';
  city: string;
  country: string;
  venue: string;
  startDate: string;
  endDate: string;
  theme: string;
  sector: string;
  description: string;
  speakers: Speaker[];
  agenda: AgendaItem[];
  sponsors: Sponsor[];
  heroUrl: string;
  gallery: string[];
  published: boolean;
  featured?: boolean;
}

export interface Speaker {
  name: string;
  organization: string;
  title: string;
  photoUrl?: string;
  bio?: string;
}

export interface AgendaItem {
  time: string;
  title: string;
  speaker?: string;
  description?: string;
}

export interface Sponsor {
  name: string;
  logoUrl: string;
  link: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
}

export interface Paper {
  id: string;
  title: string;
  slug: string;
  authors: string[];
  abstract: string;
  pdfUrl: string;
  keywords: string[];
  conferenceRef?: string;
  peerReviewStatus: 'submitted' | 'under_review' | 'accepted' | 'rejected';
  publishedDate: string;
  published: boolean;
  downloadCount?: number;
}

export interface Office {
  region: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  address: string;
  lat?: number;
  lng?: number;
  isHeadquarters?: boolean;
}

// Sample Data
export const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Global Information Assets Summit 2024',
    slug: 'global-information-assets-summit-2024',
    type: 'conference',
    city: 'Nairobi',
    country: 'Kenya',
    venue: 'Kenyatta International Convention Centre',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    theme: 'Digital Transformation in Data Governance',
    sector: 'Information Management',
    description: 'The premier global event bringing together information professionals, data governance experts, and technology leaders to explore the future of information assets management.',
    speakers: [
      {
        name: 'Dr. Simon Gichuki',
        organization: 'Information Assets World',
        title: 'Founder & CEO',
        bio: 'Renowned expert in information management and data governance with over 20 years of experience.'
      },
      {
        name: 'Sarah Mitchell',
        organization: 'DataCorp International',
        title: 'Chief Data Officer',
        bio: 'Leading data strategist with expertise in enterprise data governance frameworks.'
      },
    ],
    agenda: [
      {
        time: '09:00 - 09:30',
        title: 'Opening Keynote: The Future of Information Assets',
        speaker: 'Dr. Simon Gichuki',
        description: 'Setting the stage for digital transformation in data governance.'
      },
      {
        time: '09:30 - 10:30',
        title: 'Panel: Enterprise Data Strategy',
        description: 'Industry leaders discuss modern data governance approaches.'
      },
    ],
    sponsors: [
      {
        name: 'Microsoft',
        logoUrl: '/logos/microsoft.png',
        link: 'https://microsoft.com',
        tier: 'platinum'
      },
    ],
    heroUrl: '/events/summit-2024.jpg',
    gallery: ['/gallery/summit1.jpg', '/gallery/summit2.jpg'],
    published: true,
    featured: true,
  },
  {
    id: '2',
    title: 'Information Security & Privacy Conference',
    slug: 'information-security-privacy-conference-2024',
    type: 'conference',
    city: 'Bangkok',
    country: 'Thailand',
    venue: 'Queen Sirikit National Convention Center',
    startDate: '2024-05-20',
    endDate: '2024-05-22',
    theme: 'Securing Information Assets in the Digital Age',
    sector: 'Cybersecurity',
    description: 'Focus on protecting information assets through advanced security frameworks and privacy protection mechanisms.',
    speakers: [
      {
        name: 'Dr. Amanda Chen',
        organization: 'CyberSec Asia',
        title: 'Security Research Director'
      },
    ],
    agenda: [],
    sponsors: [],
    heroUrl: '/events/security-conf.jpg',
    gallery: [],
    published: true,
    featured: true,
  },
  {
    id: '3',
    title: 'Annual Information Assets Gala',
    slug: 'annual-information-assets-gala-2024',
    type: 'gala',
    city: 'Brussels',
    country: 'Belgium',
    venue: 'Royal Palace of Brussels',
    startDate: '2024-11-15',
    endDate: '2024-11-15',
    theme: 'Celebrating Excellence in Information Management',
    sector: 'Awards & Recognition',
    description: 'An elegant evening celebrating outstanding achievements in information assets management and recognizing industry leaders.',
    speakers: [],
    agenda: [],
    sponsors: [],
    heroUrl: '/events/gala-2024.jpg',
    gallery: [],
    published: true,
    featured: true,
  },
];

export const samplePapers: Paper[] = [
  {
    id: '1',
    title: 'Blockchain Integration in Enterprise Data Governance',
    slug: 'blockchain-integration-enterprise-data-governance',
    authors: ['Dr. Robert Kim', 'Prof. Lisa Wang', 'James Anderson'],
    abstract: 'This paper explores the potential of blockchain technology in enhancing enterprise data governance frameworks. We analyze implementation strategies, security benefits, and operational challenges in real-world scenarios.',
    pdfUrl: '/papers/blockchain-data-governance.pdf',
    keywords: ['blockchain', 'data governance', 'enterprise', 'security', 'distributed systems'],
    conferenceRef: 'global-information-assets-summit-2024',
    peerReviewStatus: 'accepted',
    publishedDate: '2024-02-15',
    published: true,
    downloadCount: 342,
  },
  {
    id: '2',
    title: 'AI-Powered Data Quality Management Systems',
    slug: 'ai-powered-data-quality-management-systems',
    authors: ['Dr. Maria Rodriguez', 'Alex Thompson'],
    abstract: 'An investigation into artificial intelligence applications for automated data quality assessment and improvement in large-scale information systems.',
    pdfUrl: '/papers/ai-data-quality.pdf',
    keywords: ['artificial intelligence', 'data quality', 'automation', 'machine learning'],
    peerReviewStatus: 'accepted',
    publishedDate: '2024-01-30',
    published: true,
    downloadCount: 198,
  },
  {
    id: '3',
    title: 'Privacy-Preserving Analytics in Information Assets',
    slug: 'privacy-preserving-analytics-information-assets',
    authors: ['Dr. Samuel Lee', 'Emma Wilson', 'Prof. David Brown'],
    abstract: 'A comprehensive study on implementing privacy-preserving techniques in data analytics while maintaining the utility of information assets for business intelligence.',
    pdfUrl: '/papers/privacy-analytics.pdf',
    keywords: ['privacy', 'analytics', 'differential privacy', 'data protection'],
    conferenceRef: 'information-security-privacy-conference-2024',
    peerReviewStatus: 'under_review',
    publishedDate: '2024-03-10',
    published: true,
    downloadCount: 156,
  },
];

export const globalOffices: Office[] = [
  {
    region: 'Africa',
    city: 'Nairobi',
    country: 'Kenya',
    email: 'africa@informationassetsworld.com',
    phone: '+254 700 000 000',
    address: 'Westlands Business District, Nairobi, Kenya',
    lat: -1.2921,
    lng: 36.8219,
    isHeadquarters: true,
  },
  {
    region: 'Africa',
    city: 'Lusaka',
    country: 'Zambia',
    email: 'zambia@informationassetsworld.com',
    phone: '+260 977 000 000',
    address: 'Cairo Road, Lusaka, Zambia',
    lat: -15.3875,
    lng: 28.3228,
  },
  {
    region: 'Asia',
    city: 'Bangkok',
    country: 'Thailand',
    email: 'asia@informationassetsworld.com',
    phone: '+66 2 000 0000',
    address: 'Sukhumvit Road, Bangkok, Thailand',
    lat: 13.7563,
    lng: 100.5018,
  },
  {
    region: 'Europe',
    city: 'Brussels',
    country: 'Belgium',
    email: 'europe@informationassetsworld.com',
    phone: '+32 2 000 0000',
    address: 'European Quarter, Brussels, Belgium',
    lat: 50.8476,
    lng: 4.3572,
  },
  {
    region: 'North America',
    city: 'Columbus',
    country: 'United States',
    email: 'americas@informationassetsworld.com',
    phone: '+1 614 000 0000',
    address: 'Downtown Columbus, Ohio, USA',
    lat: 39.9612,
    lng: -82.9988,
  },
  {
    region: 'South America',
    city: 'Santiago',
    country: 'Chile',
    email: 'southamerica@informationassetsworld.com',
    phone: '+56 2 0000 0000',
    address: 'Las Condes, Santiago, Chile',
    lat: -33.4489,
    lng: -70.6693,
  },
  {
    region: 'Oceania',
    city: 'Brisbane',
    country: 'Australia',
    email: 'oceania@informationassetsworld.com',
    phone: '+61 7 0000 0000',
    address: 'Brisbane CBD, Queensland, Australia',
    lat: -27.4705,
    lng: 153.0260,
  },
];