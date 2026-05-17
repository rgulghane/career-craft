"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { messages } from "@career-craft/shared";

export function CreateReadonlyAdminForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const r = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      const body = (await r.json()) as { error?: string };
      if (!r.ok) {
        setMessage(body.error ?? "Failed");
        return;
      }
      setFullName("");
      setEmail("");
      setPassword("");
      setMessage(messages.admin.teamMemberCreated);
      router.refresh();
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-white/10 bg-white/5 p-6"
    >
      <h2 className="text-lg font-semibold text-white">{messages.admin.createTeamMemberCta}</h2>
      <p className="mt-1 text-sm text-slate-400">{messages.admin.teamSubtitle}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="text-slate-400">Full name</span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-400">Email</span>
          <input
            required
            type="email"
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-400">Password</span>
          <input
            required
            type="password"
            minLength={8}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
      >
        {loading ? "Creating…" : messages.admin.createTeamMemberCta}
      </button>
      {message ? <p className="mt-3 text-sm text-slate-400">{message}</p> : null}
    </form>
  );
}
