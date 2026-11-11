"use server";

// Server Actions: client components (like the login page) can import and
// await these directly, but the code only ever runs on the server.
// Note: a "use server" file may only export async functions.

import { cookies } from "next/headers";
import { createRemoteJWKSet, jwtVerify } from "jose";
import {
  SESSION_COOKIE,
  SEVEN_DAYS,
  ONE_DAY,
  createSessionToken,
  verifySessionToken,
} from "@/lib/session-token";

// Google's public keys for Firebase ID tokens. jose caches them for us.
// This replaces firebase-admin, which only verified the token and crashed
// on Vercel (its jwks-rsa dependency require()s the ESM-only jose).
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

async function verifyFirebaseIdToken(idToken) {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) throw new Error("Firebase project id is not configured.");

  const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
    algorithms: ["RS256"],
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  if (typeof payload.sub !== "string" || !payload.sub) {
    throw new Error("Token has no subject.");
  }

  return { uid: payload.sub, authTime: Number(payload.auth_time) };
}

// WRITE the user's id into the session cookie.
// The login page passes the Firebase ID token; the server verifies it and
// stores the verified uid. A client can never choose which id is written.
export async function createSession(idToken, remember = true) {
  try {
    if (typeof idToken !== "string" || !idToken) {
      return { ok: false, message: "Missing ID token." };
    }

    const decoded = await verifyFirebaseIdToken(idToken);

    // Only accept a token from a sign-in that just happened.
    if (Date.now() / 1000 - decoded.authTime > 5 * 60) {
      return { ok: false, message: "Please sign in again." };
    }

    const keep = remember !== false;
    const seconds = keep ? SEVEN_DAYS : ONE_DAY;
    const token = await createSessionToken(decoded.uid, seconds);
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // No maxAge = cleared when the browser closes.
      ...(keep ? { maxAge: seconds } : {}),
    });

    return { ok: true, userId: decoded.uid };
  } catch (error) {
    console.error("Session creation failed:", error);
    return { ok: false, message: "Unable to create session." };
  }
}

// READ the session. Returns { userId } or null.
export async function getSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

// READ just the user id. Returns the id string or null.
export async function getUserId() {
  const session = await getSession();
  return session?.userId ?? null;
}



// Remove the session cookie (logout).
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}