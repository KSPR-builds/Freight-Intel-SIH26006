import { NextResponse, type NextRequest } from "next/server";

// Routes that standard users are redirected away from
const REDIRECT_USER_ROUTES = [
  "/admin",
  "/dashboard",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get("freightiq_role")?.value;

  // If role is explicitly "user", redirect forbidden or admin-oriented routes to /my-assignments
  if (roleCookie === "user") {
    const isRedirectTarget = REDIRECT_USER_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isRedirectTarget) {
      const url = request.nextUrl.clone();
      url.pathname = "/my-assignments";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/dashboard/:path*",
    "/dashboard",
  ],
};
