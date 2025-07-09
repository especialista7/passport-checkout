import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Permitir acesso público aos webhooks
  if (request.nextUrl.pathname.startsWith("/api/webhooks/")) {
    return NextResponse.next()
  }

  // Permitir acesso público às páginas de teste em desenvolvimento
  if (process.env.NODE_ENV === "development") {
    if (request.nextUrl.pathname.startsWith("/test-") || request.nextUrl.pathname.startsWith("/debug-")) {
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/webhooks (webhooks should be public)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)",
  ],
}
