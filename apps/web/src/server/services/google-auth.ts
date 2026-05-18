import "server-only";

import { ObjectId } from "mongodb";
import { serverConfig } from "@/lib/config";
import "../db/load-env";
import { type AuthSignupProfile, isPortalAdminUserType, messages } from "@career-craft/shared";
import { mapUser } from "../db/helpers";
import { usersCollection } from "../db/mongo-client";
import { signToken } from "../auth-tokens";
import type { AuthResult } from "./auth";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export function isGoogleAuthConfigured(): boolean {
  return Boolean(serverConfig.google.clientId && serverConfig.google.clientSecret);
}

export function googleRedirectUri(): string {
  return `${serverConfig.appOrigin}/api/auth/google/callback`;
}

export function buildGoogleAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: serverConfig.google.clientId,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
    access_type: "online",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

interface GoogleUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
}

export class GoogleAuthError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "GoogleAuthError";
  }
}

async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Google userinfo failed: ${res.status}`);
  }
  return (await res.json()) as GoogleUserInfo;
}

export async function exchangeGoogleCode(code: string): Promise<GoogleUserInfo> {
  const body = new URLSearchParams({
    code,
    client_id: serverConfig.google.clientId,
    client_secret: serverConfig.google.clientSecret,
    redirect_uri: googleRedirectUri(),
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!tokenRes.ok) {
    throw new Error(`Google token exchange failed: ${tokenRes.status}`);
  }

  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  if (!tokenJson.access_token) {
    throw new Error("Google token response missing access_token");
  }

  return fetchGoogleUserInfo(tokenJson.access_token);
}

function assertVerifiedGoogleEmail(profile: GoogleUserInfo): string {
  if (!profile.email || !profile.email_verified) {
    throw new Error("Google account must have a verified email");
  }
  return profile.email.trim().toLowerCase();
}

function finishAuth(doc: Parameters<typeof mapUser>[0]): AuthResult {
  const user = mapUser(doc);
  if (isPortalAdminUserType(user.userType)) {
    throw new Error(messages.admin.useAdminPortal);
  }
  return {
    token: signToken(user.id, user.email, user.userType ?? "student"),
    user: { id: user.id, email: user.email, fullName: user.fullName },
  };
}

/** Sign in with Google — existing accounts only. */
export async function loginWithGoogle(profile: GoogleUserInfo): Promise<AuthResult> {
  const email = assertVerifiedGoogleEmail(profile);
  const googleId = profile.sub;

  const users = await usersCollection();
  const byGoogle = await users.findOne({ googleId });
  const byEmail = byGoogle ? null : await users.findOne({ email });

  const doc = byGoogle ?? byEmail;
  if (!doc) {
    throw new GoogleAuthError("not_registered", messages.auth.googleNotRegistered);
  }

  const now = new Date();
  if (!doc.googleId) {
    await users.updateOne({ _id: doc._id }, { $set: { googleId, updatedAt: now } });
    return finishAuth({ ...doc, googleId, updatedAt: now });
  }

  return finishAuth(doc);
}

/** Register or sign in with Google — creates account when new. */
export async function registerWithGoogle(
  profile: GoogleUserInfo,
  signupProfile: AuthSignupProfile,
): Promise<AuthResult> {
  const email = assertVerifiedGoogleEmail(profile);
  const fullName = signupProfile.fullName.trim().slice(0, 120);
  const phone = signupProfile.phone;
  const collegeName = signupProfile.collegeName ?? null;
  const googleId = profile.sub;

  const users = await usersCollection();
  const byGoogle = await users.findOne({ googleId });
  const byEmail = byGoogle ? null : await users.findOne({ email });

  const now = new Date();
  let doc = byGoogle ?? byEmail;

  if (doc) {
    const $set: Record<string, unknown> = { updatedAt: now };
    if (!doc.googleId) {
      $set.googleId = googleId;
    }
    if (!doc.fullName) {
      $set.fullName = fullName;
    }
    if (!doc.phone) {
      $set.phone = phone;
    }
    if (!doc.collegeName && collegeName) {
      $set.collegeName = collegeName;
    }
    if (Object.keys($set).length > 1) {
      await users.updateOne({ _id: doc._id }, { $set });
      doc = { ...doc, ...$set, updatedAt: now };
    }
  } else {
    doc = {
      _id: new ObjectId(),
      email,
      fullName,
      phone,
      collegeName,
      googleId,
      userType: "student",
      referralCode: null,
      createdAt: now,
      updatedAt: now,
    };
    await users.insertOne(doc);
  }

  return finishAuth(doc);
}
