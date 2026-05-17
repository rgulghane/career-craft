import "server-only";

import { ObjectId } from "mongodb";
import { serverConfig } from "@/lib/config";
import "../db/load-env";
import { isPortalAdminUserType, messages } from "@career-craft/shared";
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

export async function signInWithGoogle(profile: GoogleUserInfo): Promise<AuthResult> {
  if (!profile.email || !profile.email_verified) {
    throw new Error("Google account must have a verified email");
  }

  const email = profile.email.trim().toLowerCase();
  const fullName = (profile.name?.trim() || email.split("@")[0] || "Student").slice(0, 120);
  const googleId = profile.sub;

  const users = await usersCollection();
  const byGoogle = await users.findOne({ googleId });
  const byEmail = byGoogle ? null : await users.findOne({ email });

  const now = new Date();
  let doc = byGoogle ?? byEmail;

  if (doc) {
    if (!doc.googleId) {
      await users.updateOne(
        { _id: doc._id },
        { $set: { googleId, updatedAt: now } },
      );
      doc = { ...doc, googleId, updatedAt: now };
    }
    if (!doc.fullName && fullName) {
      await users.updateOne({ _id: doc._id }, { $set: { fullName, updatedAt: now } });
      doc = { ...doc, fullName, updatedAt: now };
    }
  } else {
    doc = {
      _id: new ObjectId(),
      email,
      fullName,
      googleId,
      userType: "student",
      referralCode: null,
      createdAt: now,
      updatedAt: now,
    };
    await users.insertOne(doc);
  }

  const user = mapUser(doc);
  if (isPortalAdminUserType(user.userType)) {
    throw new Error(messages.admin.useAdminPortal);
  }
  return {
    token: signToken(user.id, user.email, user.userType ?? "student"),
    user: { id: user.id, email: user.email, fullName: user.fullName },
  };
}
