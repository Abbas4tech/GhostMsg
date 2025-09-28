import { NextResponse, NextMiddleware } from "next/server";
import { getToken } from "next-auth/jwt";
export { default } from "next-auth/middleware";

const publicPaths = ["/sign-in", "/sign-up", "/verify"];

export const middleware: NextMiddleware = async (request) => {
  const token = await getToken({
    req: request,
    secret: process.env.NEXT_AUTH_SECRET,
  });
  const url = request.nextUrl;

  const isPublicPath = publicPaths.some(
    (path) => path === url.pathname || url.pathname.startsWith(path)
  );

  if (url.pathname === "/" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (url.pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/", "/sign-in", "/sign-up", "/dashboard/:path*", "/verify/:path*"],
};
