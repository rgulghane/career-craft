"use client";

import { useState } from "react";
import { messages } from "@career-craft/shared";
import { absolutePublicUrl } from "@/lib/app-origin";
import { theme } from "@/lib/theme";

export function AdminLoginForm({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "same-origin",
      });
      if (!r.ok) {
        const body = (await r.json()) as { error?: string };
        setError(body.error ?? messages.errors.generic);
        return;
      }
      window.location.assign(absolutePublicUrl(redirectTo, window.location.origin));
    } catch {
      setError(messages.errors.network);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={`${theme.card} max-w-md border-slate-800 bg-slate-900`}>
      <p className={theme.eyebrow}>Admin portal</p>
      <h1 className={`mt-2 ${theme.title}`}>{messages.admin.signInHeading}</h1>
      <label className="mt-6 block">
        <span className={theme.label}>{messages.auth.emailLabel}</span>
        <input
          className={theme.input}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="mt-4 block">
        <span className={theme.label}>{messages.auth.passwordLabel}</span>
        <input
          className={theme.input}
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error ? <p className={`mt-4 ${theme.error}`}>{error}</p> : null}
      <button type="submit" disabled={loading} className={`mt-6 w-full ${theme.btnPrimary}`}>
        {loading ? "…" : messages.admin.signInCta}
      </button>
    </form>
  );
}
