import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.venacorseguros.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/crm', '/crm/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
