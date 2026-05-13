import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        }
      }
    }
  )

  let user = null
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch (error) {
    return res
  }

  const protectedPaths = ['/dashboard', '/campaign', '/create-campaign']
  const isProtected = protectedPaths.some(p => req.nextUrl.pathname.startsWith(p))

  if (!user && isProtected) {
    const redirectResponse = NextResponse.redirect(new URL('/login', req.url))
    res.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  if (user && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', req.url))
    res.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/campaign/:path*', '/create-campaign/:path*']
}
