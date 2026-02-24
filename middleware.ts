import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isOnDiscuss = req.nextUrl.pathname.startsWith('/discuss')
  const isOnApi = req.nextUrl.pathname.startsWith('/api')
  const isOnAuthApi = req.nextUrl.pathname.startsWith('/api/auth')

  if (isOnDashboard || isOnDiscuss) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/sign-in', req.nextUrl))
    }
  }

  if (isOnApi && !isOnAuthApi) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (isLoggedIn && (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/discuss/:path*', '/api/:path*', '/sign-in', '/sign-up'],
}
