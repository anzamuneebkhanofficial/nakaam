export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nakaam.pk';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/account/',
          '/checkout/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
