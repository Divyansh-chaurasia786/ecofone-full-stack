import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.ecofone.co.in';
  
  const routes = [
    '',
    '/about',
    '/services',
    '/franchise',
    '/contact',
    '/sell',
    '/buy',
    '/blog',
    '/stores',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/blog' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/franchise' || route === '/sell' ? 0.9 : 0.8,
  }));
}
