import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("doto_session")?.value;

  const isProtectedPath =
    pathname === "/" ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/learning") ||
    pathname.startsWith("/readings") ||
    pathname.startsWith("/todos") ||
    pathname.startsWith("/analytics");

  // Redirect to /login only if user has no session cookie at all on protected pages
  if (isProtectedPath && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Update Supabase session cookies if present
  try {
    return await updateSession(request);
  } catch {
    return NextResponse.next();
  }
}

export default proxy;

export const config = {
  matcher: [
    "/",
    "/projects/:path*",
    "/learning/:path*",
    "/readings/:path*",
    "/todos/:path*",
    "/analytics/:path*",
  ],
};

