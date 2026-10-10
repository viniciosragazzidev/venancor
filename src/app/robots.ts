import { MetadataRoute } from "next";

const BASE_URL = "https://www.venancorseguros.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Regra geral — todos os crawlers tradicionais
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/crm", "/crm/*", "/api/*", "/painel", "/painel/*", "/login", "/c/*"],
      },

      // OpenAI — ChatGPT Search e AI Overviews
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/crm", "/crm/*", "/api/*", "/painel", "/painel/*", "/login", "/c/*"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: ["/crm", "/crm/*", "/api/*", "/painel", "/painel/*", "/login", "/c/*"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/crm", "/crm/*", "/api/*", "/painel", "/painel/*", "/login", "/c/*"],
      },

      // Anthropic — Claude
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/crm", "/crm/*", "/api/*", "/painel", "/painel/*", "/login", "/c/*"],
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: ["/crm", "/crm/*", "/api/*", "/painel", "/painel/*", "/login", "/c/*"],
      },

      // Perplexity AI
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/crm", "/crm/*", "/api/*", "/painel", "/painel/*", "/login", "/c/*"],
      },

      // Google — Gemini / AI Overviews (usa Googlebot padrão + este)
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/crm", "/crm/*", "/api/*", "/painel", "/painel/*", "/login", "/c/*"],
      },

      // Microsoft — Bing Copilot
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/crm", "/crm/*", "/api/*", "/painel", "/painel/*", "/login", "/c/*"],
      },

      // Cohere AI
      {
        userAgent: "cohere-ai",
        allow: "/",
        disallow: ["/crm", "/crm/*", "/api/*", "/painel", "/painel/*", "/login", "/c/*"],
      },

      // ByteDance / TikTok AI
      {
        userAgent: "Bytespider",
        allow: "/",
        disallow: ["/crm", "/crm/*", "/api/*", "/painel", "/painel/*", "/login", "/c/*"],
      },

      // Meta AI (Llama)
      {
        userAgent: "FacebookBot",
        allow: "/",
        disallow: ["/crm", "/crm/*", "/api/*", "/painel", "/painel/*", "/login", "/c/*"],
      },

      // Apple Applebot
      {
        userAgent: "Applebot",
        allow: "/",
        disallow: ["/crm", "/crm/*", "/api/*", "/painel", "/painel/*", "/login", "/c/*"],
      },

      // CCBot — Common Crawl (usado para training, NÃO para search — bloqueado)
      {
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
