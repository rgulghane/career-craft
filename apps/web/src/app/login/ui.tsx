"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { messages } from "@career-craft/shared/content";
import { theme } from "@/lib/theme";

type Mode = "login" | "register";

type SessionUser = {
  email: string;
  fullName: string;
};

export function AuthCard({
  mode,
  heading,
  redirectTo = "/dashboard",
  sessionUser = null,
}: {
  mode: Mode;
  heading: string;
  redirectTo?: string;
  sessionUser?: SessionUser | null;
}) {
  const router = useRouter();
  const emailLocked = sessionUser !== null;
  const [email, setEmail] = useState(sessionUser?.email ?? "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(sessionUser?.fullName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (emailLocked && mode === "register") {
      router.push(redirectTo);
      router.refresh();
      return;
    }

    setLoading(true);
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login" ? { email, password } : { email, password, fullName };
      const r = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const bodyJson = (await r.json()) as { error?: string };
        setError(bodyJson.error ?? messages.errors.generic);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError(messages.errors.network);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={theme.card}>
      <p className={theme.eyebrow}>{mode === "login" ? "Welcome back" : "Join Cohort 4"}</p>
      <h1 className={`mt-2 ${theme.title}`}>{heading}</h1>
      <p className={`mt-3 ${theme.body}`}>
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link className={theme.link} href="/register">
              {messages.nav.register}
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link className={theme.link} href="/login">
              {messages.nav.signIn}
            </Link>
          </>
        )}
      </p>
      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        {mode === "register" ? (
          <label className="block">
            <span className={theme.label}>{messages.auth.fullNameLabel}</span>
            <input
              className={emailLocked ? theme.inputDisabled : theme.input}
              autoComplete="name"
              value={fullName}
              onChange={(ev) => {
                setFullName(ev.target.value);
              }}
              disabled={emailLocked}
              required={!emailLocked}
            />
          </label>
        ) : null}
        <label className="block">
          <span className={theme.label}>{messages.auth.emailLabel}</span>
          <input
            className={emailLocked ? theme.inputDisabled : theme.input}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => {
              setEmail(ev.target.value);
            }}
            disabled={emailLocked}
            readOnly={emailLocked}
            required
          />
        </label>
        {emailLocked && mode === "register" ? null : (
          <label className="block">
            <span className={theme.label}>{messages.auth.passwordLabel}</span>
            <input
              className={theme.input}
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(ev) => {
                setPassword(ev.target.value);
              }}
              minLength={8}
              required
            />
          </label>
        )}
        {error ? <p className={theme.error}>{error}</p> : null}
        <button className={`w-full ${theme.btnPrimary}`} type="submit" disabled={loading}>
          {loading
            ? "Please wait…"
            : emailLocked && mode === "register"
              ? messages.auth.continueEnrollCta
              : mode === "login"
                ? messages.auth.signInCta
                : messages.auth.registerCta}
        </button>
      </form>
    </div>
  );
}
