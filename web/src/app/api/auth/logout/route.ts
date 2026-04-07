import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, clearAuthCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", clearAuthCookieOptions());
  return response;
}
