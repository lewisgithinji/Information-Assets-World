import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'event';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  schema?: Record<string, any>;
}

const SEO = ({
  title = 'Information Assets World - Global Conference & Research Network',
  description = 'Join the world\'s leading network for information asset management, records management, and data governance professionals. Access conferences, research papers, and expert insights.',
  keywords = 'information assets, records management, data governance, compliance, digital transformation, conference, research papers',
  image = '/lovable-uploads/7edae356-b2d1-4e7d-96ba-9dcadd8a7061.png',
  url = 'https://informationassetsworld.com',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Information Assets World',
  schema,
}: SEOProps) => {
  const siteTitle = 'Information Assets World';
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;
  const fullUrl = url.startsWith('http') ? url : `https://informationassetsworld.com${url}`;
  const fullImage = image.startsWith('http') ? image : `https://informationassetsworld.com${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
