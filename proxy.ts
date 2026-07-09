import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Next.js 16+ proxy router function
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // Detecta se o usuário está acessando pelo subdomínio crm
  // Funciona para crm.venacorseguros.com, crm.venacorsaude.com.br e crm.localhost em dev
  const isCrmSubdomain = hostname.startsWith('crm.');
  const isCrmPath = url.pathname.startsWith('/crm');

  if (isCrmSubdomain && !isCrmPath) {
    url.pathname = `/crm${url.pathname}`;
  }

  // Verifica proteção da página principal do crm
  if (url.pathname.startsWith('/crm') && url.pathname !== '/crm/login' && !url.pathname.startsWith('/crm/api')) {
    const sessionToken = request.cookies.get('better-auth.session_token') || 
                         request.cookies.get('__secure-better-auth.session_token');

    if (!sessionToken) {
      // Se estiver no subdomínio crm, redireciona para a raiz de login (/login que reescreve para /crm/login)
      // Se não, redireciona para /crm/login
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = isCrmSubdomain ? '/login' : '/crm/login';
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isCrmSubdomain && !isCrmPath) {
    return NextResponse.rewrite(url);
  }
}

// Garante que o Next.js processe o proxy em todas as páginas, 
// ignorando arquivos estáticos, imagens e APIs para não perder desempenho
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.svg$|.*\\.webp$|.*\\.jpg$|.*\\.jpeg$).*)',
  ],
}
