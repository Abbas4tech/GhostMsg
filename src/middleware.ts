import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
export { default } from "next-auth/middleware";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXT_AUTH_SECRET,
  });
  const url = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ["/sign-in", "/sign-up", "/verify"];
  const isPublicPath = publicPaths.some((path) =>
    url.pathname.startsWith(path)
  );

  // Handle root path separately
  if (url.pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      // Allow access to the root path without redirecting to sign-in
      return NextResponse.next();
    }
  }

  // Redirect authenticated users away from public pages
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect dashboard routes
  if (url.pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/sign-in", "/sign-up", "/dashboard/:path*", "/verify/:path*"],
};
