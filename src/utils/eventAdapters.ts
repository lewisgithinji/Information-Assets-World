// Event adapters to handle both DatabaseEvent and Event types
import { DatabaseEvent } from '@/hooks/useEvents';
import { Event } from '@/data/content';

// Unified event interface for display purposes
export interface UnifiedEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  theme: string;
  event_type?: string;
  category?: string;
  industry_sector?: string;
  tags?: string[];
  status: string;
  image_url?: string;
  featured?: boolean;
  // Legacy Event properties for compatibility
  slug?: string;
  type?: string;
  city?: string;
  country?: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
  sector?: string;
  speakers?: any[];
  agenda?: any[];
  sponsors?: any[];
  heroUrl?: string;
  gallery?: string[];
  published?: boolean;
}

export const adaptDatabaseEvent = (event: DatabaseEvent): UnifiedEvent => ({
  id: event.id,
  title: event.title,
  description: event.description,
  location: event.location,
  start_date: event.start_date,
  end_date: event.end_date,
  theme: event.theme,
  event_type: (event as any).event_type,
  category: (event as any).category,
  industry_sector: (event as any).industry_sector,
  tags: (event as any).tags,
  status: event.status,
  image_url: event.image_url,
  featured: false, // Database events don't have featured flag by default
  // Map to legacy format for compatibility
  slug: event.title.toLowerCase().replace(/\s+/g, '-'),
  type: (event as any).event_type || 'conference',
  city: event.location.split(',')[0]?.trim() || '',
  country: event.location.split(',').slice(-1)[0]?.trim() || '',
  venue: event.location,
  startDate: event.start_date,
  endDate: event.end_date,
  sector: (event as any).industry_sector || 'General',
  speakers: [],
  agenda: [],
  sponsors: [],
  heroUrl: event.image_url || '',
  gallery: [],
  published: event.status === 'published',
});

export const adaptSampleEvent = (event: Event): UnifiedEvent => ({
  id: event.id,
  title: event.title,
  description: event.description,
  location: `${event.city}, ${event.country}`,
  start_date: event.startDate,
  end_date: event.endDate,
  theme: event.theme,
  event_type: event.type,
  category: event.sector,
  industry_sector: event.sector,
  tags: [],
  status: event.published ? 'published' : 'draft',
  image_url: event.heroUrl,
  featured: event.featured,
  // Keep original Event properties
  slug: event.slug,
  type: event.type,
  city: event.city,
  country: event.country,
  venue: event.venue,
  startDate: event.startDate,
  endDate: event.endDate,
  sector: event.sector,
  speakers: event.speakers,
  agenda: event.agenda,
  sponsors: event.sponsors,
  heroUrl: event.heroUrl,
  gallery: event.gallery,
  published: event.published,
});

export const adaptEvents = (databaseEvents?: DatabaseEvent[], sampleEvents?: Event[]): UnifiedEvent[] => {
  const adapted: UnifiedEvent[] = [];
  
  if (databaseEvents && databaseEvents.length > 0) {
    adapted.push(...databaseEvents.map(adaptDatabaseEvent));
  }
  
  if (sampleEvents && (!databaseEvents || databaseEvents.length === 0)) {
    adapted.push(...sampleEvents.map(adaptSampleEvent));
  }
  
  return adapted;
};
