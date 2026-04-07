import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";
export const AUTH_COOKIE_NAME = "handcrafted_haven_session";

export type UserRole = "user" | "seller";

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  bio?: string;
  story?: string;
}

export interface AuthSession {
  token: string;
  user: SessionUser;
}

type CookieStoreLike = {
  get(name: string): { value: string } | undefined;
};

function normalizeRole(value: unknown): UserRole {
  return value === "seller" ? "seller" : "user";
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      role: normalizeRole(payload.role),
    };
  } catch {
    return null;
  }
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function clearAuthCookieOptions() {
  return {
    ...getAuthCookieOptions(),
    maxAge: 0,
  };
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return request.cookies.get(AUTH_COOKIE_NAME)?.value || null;
}

async function getSessionFromToken(token: string | null): Promise<AuthSession | null> {
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  await dbConnect();

  const user = await User.findById(decoded.userId)
    .select("email name role bio story")
    .lean<{
      _id: { toString(): string };
      email?: string;
      name?: string;
      role?: UserRole;
      bio?: string;
      story?: string;
    } | null>();

  if (!user) {
    return null;
  }

  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email || decoded.email,
      name: user.name || "User",
      role: normalizeRole(user.role),
      bio: typeof user.bio === "string" ? user.bio : "",
      story: typeof user.story === "string" ? user.story : "",
    },
  };
}

export async function getRequestSession(
  request: NextRequest,
): Promise<AuthSession | null> {
  return getSessionFromToken(getTokenFromRequest(request));
}

export async function getServerSessionFromCookies(
  cookieStore?: CookieStoreLike,
): Promise<AuthSession | null> {
  const store = cookieStore ?? (await cookies());
  return getSessionFromToken(store.get(AUTH_COOKIE_NAME)?.value || null);
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
