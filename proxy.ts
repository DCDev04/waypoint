import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// Routes that don't require a session
const PUBLIC_ROUTES = ["/login", "/register", "/api/auth", "/"]

// Routes only admins can access
const ADMIN_ROUTES = ["/admin"]

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  if (isPublic) return NextResponse.next()

  // 2. Get session from Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  // 3. No session → redirect to login
  if (!session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 4. Proxy-level role check: protect /admin from non-admins
  // NOTE: This is a convenience redirect only.
  // Real enforcement happens in the layout and data layer.
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route))

  if (isAdminRoute && session.user.role !== "ADMIN") {
    // We can't easily query the DB here — that's fine.
    // We store role in a cookie during sign-in (see Step 4).
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match everything EXCEPT static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
}
