import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for the admin route
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    // Since we can't access localStorage in middleware, we'll let the client handle the redirect
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
} 