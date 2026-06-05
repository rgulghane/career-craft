"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MentorSpotlightCard } from "@/components/landing/mentor-spotlight-card";

export type MentorEditState = {
  name: string;
  designation: string;
  company: string;
  previouslyAt: string;
  linkedInUrl: string;
  photo: string;
  order: number;
};

type Banner = { tone: "ok" | "error" | "info"; text: string } | null;

const FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none disabled:opacity-60";

function isPreviewablePhoto(url: string): boolean {
  return /^https?:\/\/\S+/i.test(url.trim());
}

export function MentorEditor({
  mode,
  mentorId,
  initial,
  isPublished: initialIsPublished = false,
  hasUnpublishedChanges: initialHasUnpublished = false,
  hasLive: initialHasLive = false,
}: {
  mode: "create" | "edit";
  mentorId?: string;
  initial: MentorEditState;
  isPublished?: boolean;
  hasUnpublishedChanges?: boolean;
  hasLive?: boolean;
}) {
  const router = useRouter();

  const [form, setForm] = useState<MentorEditState>(initial);
  const [dirty, setDirty] = useState(false);
  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [serverUnpublished, setServerUnpublished] = useState(initialHasUnpublished);
  const [hasLive, setHasLive] = useState(initialHasLive);
  const [banner, setBanner] = useState<Banner>(null);
  const [busy, setBusy] = useState(false);

  const pendingChanges = dirty || serverUnpublished;

  function update<K extends keyof MentorEditState>(key: K, value: MentorEditState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function payload() {
    return {
      name: form.name,
      designation: form.designation,
      company: form.company,
      previouslyAt: form.previouslyAt,
      linkedInUrl: form.linkedInUrl,
      photo: form.photo,
      order: form.order,
    };
  }

  function clientValidate(): string | null {
    if (!form.name.trim()) return "Name is required.";
    if (!form.designation.trim()) return "Designation is required.";
    if (!form.company.trim()) return "Company is required.";
    if (!form.photo.trim()) return "A photo URL is required.";
    if (!isPreviewablePhoto(form.photo)) return "Photo must be a valid http(s) URL.";
    return null;
  }

  async function create() {
    const r = await fetch("/api/admin/mentors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload()),
    });
    const body = (await r.json()) as { mentor?: { id: string }; error?: string };
    if (!r.ok || !body.mentor) {
      setBanner({ tone: "error", text: body.error ?? "Could not create mentor." });
      return;
    }
    setBanner({ tone: "ok", text: "Mentor created. Review the preview, then take it live." });
    router.push(`/admin/mentors/${body.mentor.id}`);
    router.refresh();
  }

  async function saveDraft() {
    const r = await fetch(`/api/admin/mentors/${mentorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload()),
    });
    const body = (await r.json()) as { error?: string };
    if (!r.ok) {
      setBanner({ tone: "error", text: body.error ?? "Save failed." });
      return;
    }
    setDirty(false);
    setServerUnpublished(true);
    setBanner({
      tone: "info",
      text: "Draft saved. These edits are not on the site yet — click ‘Live the changes’ to publish.",
    });
    router.refresh();
  }

  async function goLive() {
    const r = await fetch(`/api/admin/mentors/${mentorId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload()),
    });
    const body = (await r.json()) as { error?: string };
    if (!r.ok) {
      setBanner({ tone: "error", text: body.error ?? "Could not publish." });
      return;
    }
    setDirty(false);
    setServerUnpublished(false);
    setIsPublished(true);
    setHasLive(true);
    setBanner({ tone: "ok", text: "Changes are now live on the application." });
    router.refresh();
  }

  async function toggleVisibility() {
    const next = !isPublished;
    const r = await fetch(`/api/admin/mentors/${mentorId}/visibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: next }),
    });
    const body = (await r.json()) as { error?: string };
    if (!r.ok) {
      setBanner({ tone: "error", text: body.error ?? "Could not update visibility." });
      return;
    }
    setIsPublished(next);
    setBanner({
      tone: "info",
      text: next ? "Mentor is now shown on the site." : "Mentor is now hidden from the site.",
    });
    router.refresh();
  }

  async function run(action: () => Promise<void>) {
    const validation = clientValidate();
    if (validation) {
      setBanner({ tone: "error", text: validation });
      return;
    }
    setBusy(true);
    setBanner(null);
    try {
      await action();
    } catch {
      setBanner({ tone: "error", text: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  const previewData = {
    name: form.name || "Mentor name",
    designation: form.designation || "Designation",
    company: form.company || "Company",
    previouslyAt: form.previouslyAt || undefined,
    linkedInUrl: form.linkedInUrl || "#",
    photo: form.photo,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      {/* LEFT — live preview */}
      <div className="lg:sticky lg:top-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Live preview</h2>
            <StatusBadge isPublished={isPublished} pendingChanges={pendingChanges} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Exactly how this mentor card renders on the landing page.
          </p>

          <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            {isPreviewablePhoto(form.photo) ? (
              <MentorSpotlightCard mentor={previewData} priority />
            ) : (
              <div className="flex min-h-[20rem] items-center justify-center rounded-2xl border border-dashed border-white/20 text-center text-sm text-slate-400">
                Add a valid photo URL to preview the mentor card.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT — editing wrapper */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">
          {mode === "create" ? "New mentor" : "Edit mentor"}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          The preview on the left updates as you type.
        </p>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void run(mode === "create" ? create : goLive);
          }}
        >
          <Field
            label="Full name"
            value={form.name}
            onChange={(v) => update("name", v)}
            placeholder="Eshan Tiwari"
          />
          <Field
            label="Designation"
            value={form.designation}
            onChange={(v) => update("designation", v)}
            placeholder="Sr. Staff Data Scientist"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Company"
              value={form.company}
              onChange={(v) => update("company", v)}
              placeholder="Meta"
            />
            <Field
              label="Previously at (optional)"
              value={form.previouslyAt}
              onChange={(v) => update("previouslyAt", v)}
              placeholder="Facebook"
            />
          </div>
          <Field
            label="LinkedIn URL (optional)"
            value={form.linkedInUrl}
            onChange={(v) => update("linkedInUrl", v)}
            placeholder="https://www.linkedin.com/in/…"
            type="url"
          />
          <Field
            label="Photo URL"
            value={form.photo}
            onChange={(v) => update("photo", v)}
            placeholder="https://…/photo.jpg"
            type="url"
          />
          <label className="block text-sm">
            <span className="text-slate-400">Display order</span>
            <input
              type="number"
              min={0}
              className={`${FIELD_CLASS} sm:max-w-[10rem]`}
              value={form.order}
              onChange={(e) => update("order", Number(e.target.value) || 0)}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {mode === "create" ? (
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60"
              >
                {busy ? "Creating…" : "Create mentor"}
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  {busy ? "Working…" : "Live the changes"}
                </button>
                <button
                  type="button"
                  disabled={busy || !dirty}
                  onClick={() => void run(saveDraft)}
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                >
                  Save draft
                </button>
                {hasLive ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void run(toggleVisibility)}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-60"
                  >
                    {isPublished ? "Hide from site" : "Show on site"}
                  </button>
                ) : null}
              </>
            )}
          </div>

          {banner ? (
            <p
              className={
                banner.tone === "ok"
                  ? "text-sm text-emerald-400"
                  : banner.tone === "error"
                    ? "text-sm text-rose-400"
                    : "text-sm text-amber-300"
              }
            >
              {banner.text}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}

function StatusBadge({
  isPublished,
  pendingChanges,
}: {
  isPublished: boolean;
  pendingChanges: boolean;
}) {
  if (!isPublished) {
    return (
      <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-300">
        Not on site yet
      </span>
    );
  }
  if (pendingChanges) {
    return (
      <span className="rounded-full bg-sky-500/15 px-2.5 py-1 text-xs font-medium text-sky-300">
        Live · unpublished edits
      </span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
      Live · up to date
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-slate-400">{label}</span>
      <input
        type={type}
        className={FIELD_CLASS}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
