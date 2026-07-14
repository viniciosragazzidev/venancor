import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Venancor Corretora — Planos de Saúde na Baixada Fluminense';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * OG Image dinâmica — gerada pelo Next.js no edge runtime.
 * Exibida ao compartilhar no WhatsApp, LinkedIn, Facebook, Twitter e
 * usada como preview nos resultados do Google e Bing.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Círculos decorativos */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'rgba(167, 139, 250, 0.1)',
          }}
        />

        {/* Grid de pontos */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Conteúdo principal */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 72px',
            height: '100%',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Header — Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.3)',
                border: '1px solid rgba(167, 139, 250, 0.4)',
                borderRadius: '100px',
                padding: '8px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#4ade80',
                }}
              />
              <span style={{ color: '#c7d2fe', fontSize: '16px', fontWeight: 600 }}>
                Corretora Autorizada ANS
              </span>
            </div>
          </div>

          {/* Título principal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontSize: '72px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.1,
                letterSpacing: '-2px',
              }}
            >
              Planos de Saúde
            </div>
            <div
              style={{
                fontSize: '72px',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-2px',
                background: 'linear-gradient(90deg, #818cf8, #c084fc)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              até 35% OFF
            </div>
            <div
              style={{
                fontSize: '26px',
                color: '#94a3b8',
                fontWeight: 400,
                marginTop: '8px',
              }}
            >
              Amil · SulAmérica · Assim · Leve Saúde · Amep — Baixada Fluminense
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Marca */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '-0.5px',
                }}
              >
                Venancor Corretora
              </span>
              <span style={{ fontSize: '16px', color: '#64748b' }}>
                venancorseguros.com
              </span>
            </div>

            {/* Stats pills */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700 }}>120+</span>
                <span style={{ color: '#64748b', fontSize: '13px' }}>Credenciados</span>
              </div>
              <div
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700 }}>100%</span>
                <span style={{ color: '#64748b', fontSize: '13px' }}>Digital</span>
              </div>
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#818cf8', fontSize: '24px', fontWeight: 700 }}>Grátis</span>
                <span style={{ color: '#64748b', fontSize: '13px' }}>Consultoria</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
