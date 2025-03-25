import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const isPublicPath =
    path === "/login" ||
    path === "/signup" ||
    path === "/" ||
    path === "/about" ||
    path === "/features";

  // Auth-only paths that should redirect to dashboard if logged in
  const isAuthPath = path === "/login" || path === "/signup";

  // Skip middleware for auth-related API routes
  if (path.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (isAuthPath && token) {
    // If user is authenticated and tries to access login/signup,
    // redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicPath && !token) {
    // If user is not authenticated and tries to access protected path,
    // redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
