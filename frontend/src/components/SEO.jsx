/**
 * Advanced SEO Component for Lit Investor Blog
 * Uses react-helmet-async for meta tag management
 * 
 * @version 3.0.0
 */

import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({
  // Basic Meta
  title,
  description,
  keywords = [],
  
  // URLs & Images
  image,
  imageAlt,
  url,
  canonical,
  
  // Content Type
  type = 'website',
  
  // Article Specific
  article = null,
  
  // Social Media
  twitter = {},
  facebook = {},
  
  // Advanced
  noindex = false,
  nofollow = false,
  language = 'en',
  alternateLanguages = [],
  
  // Schema.org Structured Data
  schema = null,
  breadcrumbs = [],
  
  // Author & Organization
  author = null,
  organization = null,
}) => {
  const location = useLocation();
  const siteUrl = import.meta.env.VITE_APP_URL || 'https://litinvestor.com';
  
  // Construct full URL
  const fullUrl = url || canonical || `${siteUrl}${location.pathname}`;
  const fullImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : `${siteUrl}/og-default.jpg`;
  
  // Default values
  const siteName = 'Lit Investor Blog';
  const defaultDescription = 'Expert insights on finance, investments, and personal wealth management';
  const defaultKeywords = ['finance', 'investing', 'wealth management', 'financial advice'];
  
  const finalTitle = title ? `${title} | ${siteName}` : siteName;
  const finalDescription = description || defaultDescription;
  const finalKeywords = [...new Set([...keywords, ...defaultKeywords])].join(', ');
  
  // Twitter defaults
  const twitterCard = twitter.card || 'summary_large_image';
  const twitterSite = twitter.site || '@litinvestorblog';
  const twitterCreator = twitter.creator || author?.twitter || '@litinvestorblog';
  
  // Robots meta
  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
    'max-image-preview:large',
    'max-snippet:-1',
    'max-video-preview:-1'
  ].join(', ');

  // Generate schemas
  const generateArticleSchema = () => {
    if (type !== 'article' || !article) return null;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: finalDescription,
      image: {
        '@type': 'ImageObject',
        url: fullImage,
        width: 1200,
        height: 630,
      },
      datePublished: article.publishedTime,
      dateModified: article.modifiedTime || article.publishedTime,
      author: author ? {
        '@type': 'Person',
        name: author.name,
        url: author.url,
        ...(author.sameAs && { sameAs: author.sameAs })
      } : {
        '@type': 'Person',
        name: 'Lit Investor Team'
      },
      publisher: organization || {
        '@type': 'Organization',
        name: siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': fullUrl,
      },
      ...(article.section && { articleSection: article.section }),
      ...(article.tags && { keywords: article.tags.join(', ') }),
    };
  };

  const generateOrganizationSchema = () => {
    if (type !== 'website' && type !== 'homepage') return null;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
      description: finalDescription,
      sameAs: [
        'https://twitter.com/litinvestorblog',
        'https://www.facebook.com/litinvestorblog',
        'https://www.linkedin.com/company/litinvestorblog',
      ],
    };
  };

  const generateBreadcrumbSchema = () => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url.startsWith('http') ? crumb.url : `${siteUrl}${crumb.url}`,
      })),
    };
  };

  const generateWebSiteSchema = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
      description: finalDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };
  };

  const getAllSchemas = () => {
    const schemas = [];
    
    if (schema) {
      schemas.push(schema);
    } else {
      const articleSchema = generateArticleSchema();
      const orgSchema = generateOrganizationSchema();
      const websiteSchema = type === 'website' || type === 'homepage' ? generateWebSiteSchema() : null;
      
      if (articleSchema) schemas.push(articleSchema);
      if (orgSchema) schemas.push(orgSchema);
      if (websiteSchema) schemas.push(websiteSchema);
    }
    
    const breadcrumbSchema = generateBreadcrumbSchema();
    if (breadcrumbSchema) schemas.push(breadcrumbSchema);
    
    return schemas;
  };

  const allSchemas = getAllSchemas();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={language} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical || fullUrl} />
      
      {/* Alternate Languages */}
      {alternateLanguages.map((alt) => (
        <link key={alt.lang} rel="alternate" hrefLang={alt.lang} href={alt.url} />
      ))}
      
      {/* Robots */}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={language === 'en' ? 'en_US' : language} />
      
      {/* Open Graph - Article Specific */}
      {type === 'article' && article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {author && <meta property="article:author" content={author.url || author.name} />}
          {article.section && <meta property="article:section" content={article.section} />}
          {article.tags && article.tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Facebook App ID */}
      {facebook.appId && <meta property="fb:app_id" content={facebook.appId} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:creator" content={twitterCreator} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={fullImage} />
      {imageAlt && <meta name="twitter:image:alt" content={imageAlt} />}
      
      {/* Additional Meta Tags */}
      <meta name="author" content={author?.name || siteName} />
      <meta name="theme-color" content="#667eea" />
      
      {/* JSON-LD Structured Data */}
      {allSchemas.map((schemaObj, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schemaObj)}
        </script>
      ))}
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
    </Helmet>
  );
};

export default SEO;
