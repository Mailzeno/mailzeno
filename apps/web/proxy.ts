import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

// UI routes that require session auth
const protectedRoutes = ["/dashboard"]

// Auth pages
const authRoutes = ["/login", "/signup", "/reset-password"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get("host") || ""

  // Restrict api.mailzeno.dev
  if (host.startsWith("api.mailzeno.dev")) {
    // Allow only /v1 routes
    if (pathname.startsWith("/v1")) {
      return NextResponse.next()
    }

    // Block everything else on API subdomain
    return NextResponse.json(
      {
        name: "MailZeno API",
        version: "v1",
        status: "ok",
        message: "Use /v1/* endpoints",
        docs: "https://mailzeno.dev/docs",
      },
      { status: 404 }
    )
  }

  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          response.cookies.set({ name, value: "", ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthenticated = !!user

  // Protect dashboard routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Auth pages → redirect if already logged in
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon\\.svg|apple-icon\\.png).*)",
  ],
}