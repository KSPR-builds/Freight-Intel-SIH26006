import { NextResponse, type NextRequest } from "next/server";

// Routes that standard users are forbidden from viewing
const FORBIDDEN_USER_ROUTES = [
  "/dashboard",
  "/forecast",
  "/chartering",
  "/procurement",
  "/insights",
  "/ports-routes",
  "/admin"
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get("freightiq_role")?.value;

  // If user role is "user" or not "admin", and trying to access restricted admin/forecast routes
  if (roleCookie === "user") {
    const isForbidden = FORBIDDEN_USER_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isForbidden) {
      const url = request.nextUrl.clone();
      url.pathname = "/my-assignments";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard",
    "/forecast/:path*",
    "/forecast",
    "/chartering/:path*",
    "/chartering",
    "/procurement/:path*",
    "/procurement",
    "/insights/:path*",
    "/insights",
    "/ports-routes/:path*",
    "/ports-routes",
    "/admin/:path*",
    "/admin",
  ],
};
