import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.venancorseguros.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Regra geral — todos os crawlers tradicionais
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/crm', '/crm/*', '/api/*'],
      },

      // OpenAI — ChatGPT Search e AI Overviews
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/crm', '/crm/*', '/api/*'],
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: ['/crm', '/crm/*', '/api/*'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/crm', '/crm/*', '/api/*'],
      },

      // Anthropic — Claude
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/crm', '/crm/*', '/api/*'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/crm', '/crm/*', '/api/*'],
      },

      // Perplexity AI
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/crm', '/crm/*', '/api/*'],
      },

      // Google — Gemini / AI Overviews (usa Googlebot padrão + este)
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/crm', '/crm/*', '/api/*'],
      },

      // Microsoft — Bing Copilot
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/crm', '/crm/*', '/api/*'],
      },

      // Cohere AI
      {
        userAgent: 'cohere-ai',
        allow: '/',
        disallow: ['/crm', '/crm/*', '/api/*'],
      },

      // ByteDance / TikTok AI
      {
        userAgent: 'Bytespider',
        allow: '/',
        disallow: ['/crm', '/crm/*', '/api/*'],
      },

      // Meta AI (Llama)
      {
        userAgent: 'FacebookBot',
        allow: '/',
        disallow: ['/crm', '/crm/*', '/api/*'],
      },

      // Apple Applebot
      {
        userAgent: 'Applebot',
        allow: '/',
        disallow: ['/crm', '/crm/*', '/api/*'],
      },

      // CCBot — Common Crawl (usado para training, NÃO para search — bloqueado)
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}

