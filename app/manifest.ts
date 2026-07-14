import { MetadataRoute } from 'next';

/**
 * PWA Web App Manifest — /manifest.webmanifest
 * Sinaliza para crawlers e browsers que o site é um app confiável e bem estruturado.
 * Também habilita "Adicionar à tela inicial" em mobile.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Venancor Corretora de Seguros',
    short_name: 'Venancor',
    description: 'Compare e contrate planos de saúde com até 35% de desconto via CNPJ/MEI. Consultoria gratuita na Baixada Fluminense.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#3b2dff',
    orientation: 'portrait',
    lang: 'pt-BR',
    categories: ['insurance', 'health', 'finance'],
    icons: [
      {
        src: '/icon-logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/sc1.png',
        sizes: '1280x720',
        type: 'image/png',
      },
    ],
  };
}
