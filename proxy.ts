import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Next.js 16+ proxy router function
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // Detecta se o usuário está acessando pelo subdomínio crm
  // Funciona para crm.venacorseguros.com, crm.venacorsaude.com.br e crm.localhost em dev
  if (hostname.startsWith('crm.')) {
    // Evita loops caso a URL interna processada já tenha o prefixo /crm
    if (!url.pathname.startsWith('/crm')) {
      // Reescreve a rota adicionando /crm no início, preservando o resto (ex: /dashboard)
      url.pathname = `/crm${url.pathname}`
      return NextResponse.rewrite(url)
    }
  }
}

// Garante que o Next.js processe o proxy em todas as páginas, 
// ignorando arquivos estáticos, imagens e APIs para não perder desempenho
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$).*)',
  ],
}
