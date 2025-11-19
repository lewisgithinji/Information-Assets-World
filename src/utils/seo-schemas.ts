// JSON-LD Schema Generators for SEO

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Information Assets World",
  "url": "https://informationassetsworld.com",
  "logo": "https://informationassetsworld.com/lovable-uploads/7edae356-b2d1-4e7d-96ba-9dcadd8a7061.png",
  "description": "Global network for information asset management, records management, and data governance professionals",
  "sameAs": [
    // Add social media profiles when available
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "info@informationassetsworld.com"
  }
};

export const generateEventSchema = (event: {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location?: string;
  price?: number;
  image_url?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  "name": event.title,
  "description": event.description,
  "startDate": event.start_date,
  "endDate": event.end_date || event.start_date,
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
  "location": event.location ? {
    "@type": "Place",
    "name": event.location,
  } : {
    "@type": "VirtualLocation",
    "url": "https://informationassetsworld.com"
  },
  "image": event.image_url || "https://informationassetsworld.com/lovable-uploads/7edae356-b2d1-4e7d-96ba-9dcadd8a7061.png",
  "organizer": {
    "@type": "Organization",
    "name": "Information Assets World",
    "url": "https://informationassetsworld.com"
  },
  "offers": event.price ? {
    "@type": "Offer",
    "price": event.price,
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": `https://informationassetsworld.com/events/${event.id}`
  } : undefined
});

export const generateArticleSchema = (article: {
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  modifiedAt?: string;
  image?: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "image": article.image || "https://informationassetsworld.com/lovable-uploads/7edae356-b2d1-4e7d-96ba-9dcadd8a7061.png",
  "author": {
    "@type": "Person",
    "name": article.author
  },
  "publisher": {
    "@type": "Organization",
    "name": "Information Assets World",
    "logo": {
      "@type": "ImageObject",
      "url": "https://informationassetsworld.com/lovable-uploads/7edae356-b2d1-4e7d-96ba-9dcadd8a7061.png"
    }
  },
  "datePublished": article.publishedAt,
  "dateModified": article.modifiedAt || article.publishedAt,
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": article.url
  }
});

export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const generateWebsiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Information Assets World",
  "url": "https://informationassetsworld.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://informationassetsworld.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};
