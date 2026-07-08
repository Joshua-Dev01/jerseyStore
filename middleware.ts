import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_PATH = '/ms-panel2x3'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  const isAdminLogin = path === `${ADMIN_PATH}/login`

  // ✅ Protect admin routes — check login AND is_admin
  if (path.startsWith(ADMIN_PATH) && !isAdminLogin) {
    if (!user) {
      return NextResponse.redirect(new URL(`${ADMIN_PATH}/login`, request.url))
    }

    // Check is_admin in profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      // Logged in but NOT admin — kick them out
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect customer routes
  const protectedRoutes = ['/account', '/checkout', '/orders', '/wishlist']
  const isProtected = protectedRoutes.some(route => path.startsWith(route))

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect logged-in users away from login/signup
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route => path.startsWith(route))

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}