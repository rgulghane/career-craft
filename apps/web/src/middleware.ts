import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAMES } from "@career-craft/shared";
import { absolutePublicUrl } from "@/lib/app-origin";

const ADMIN_PUBLIC_PATHS = ["/admin/login"];
const ADMIN_AUTH_API_PREFIX = "/api/admin/auth/";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isPublicAdminPage = ADMIN_PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isPublicAdminApi = pathname.startsWith(ADMIN_AUTH_API_PREFIX);

  const requestHeaders = new Headers(request.headers);
  if (isAdminPage || isAdminApi) {
    requestHeaders.set("x-cc-admin-route", "1");
  }

  const token = request.cookies.get(COOKIE_NAMES.authToken)?.value;

  if (isAdminPage && !isPublicAdminPage && !token) {
    const login = new URL(absolutePublicUrl("/admin/login", request.nextUrl.origin));
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (isAdminApi && !isPublicAdminApi && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
