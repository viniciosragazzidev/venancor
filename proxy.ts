import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_ONLY_ROUTES = ['/crm/planos', '/crm/corretores']

async function getSession(request: NextRequest) {
  const origin = request.nextUrl.origin
  const cookies = request.headers.get('cookie') || ''
  try {
    const res = await fetch(`${origin}/api/auth/get-session`, {
      headers: { cookie: cookies },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  const isCrmSubdomain = hostname.startsWith('crm.');
  const isCrmPath = url.pathname.startsWith('/crm');

  if (isCrmSubdomain && !isCrmPath) {
    url.pathname = `/crm${url.pathname}`;
  }

  if (url.pathname.startsWith('/crm') && url.pathname !== '/crm/login' && !url.pathname.startsWith('/crm/api')) {
    const sessionData = await getSession(request)

    if (!sessionData?.user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = isCrmSubdomain ? '/login' : '/crm/login'
      return NextResponse.redirect(redirectUrl)
    }

    const isAdminRoute = ADMIN_ONLY_ROUTES.some((route) =>
      url.pathname.startsWith(route)
    )

    if (isAdminRoute && sessionData.user.role !== 'ADMIN') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/crm/resume'
      return NextResponse.redirect(redirectUrl)
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
