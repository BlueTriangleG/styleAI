/**
 * Authentication middleware for API routes
 * Extracts and verifies JWT token, returns user information
 */

import { NextRequest } from "next/server";
import * as jose from "jose";
import { getUserById } from "../models/user";

/**
 * Get current user from JWT token in request
 * @param request - Next.js request object
 * @returns User object if authenticated, null otherwise
 */
export async function getCurrentUser(request: NextRequest) {
  try {
    // Get token from Authorization header or cookies
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("auth_token")?.value;

    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    if (!token) {
      return null;
    }

    // Verify JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jose.jwtVerify(token, secret);

    if (!payload.userId) {
      return null;
    }

    // Get user from database
    const user = await getUserById(payload.userId as number);
    return user;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

/**
 * Require authentication middleware
 * Throws error if user is not authenticated
 */
export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
