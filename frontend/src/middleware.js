import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token");


  if (token) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
}

// 👇 sirf homepage pe chale
export const config = {
  matcher: ["/"],
};
