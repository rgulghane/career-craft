"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  COMPANY_LOGO_UPLOAD,
  MENTOR_PHOTO_UPLOAD,
  isAllowedCompanyLogoMime,
  isAllowedMentorPhotoMime,
} from "@career-craft/shared";
import { resolveCompanyLogoUrls } from "@/components/landing/company-logo-slugs";
import { LogoImage } from "@/components/landing/logo-image";
import { MentorSpotlightCard } from "@/components/landing/mentor-spotlight-card";

type CompanyLogoOption = { company: string; logoUrl: string };

const ADD_NEW_COMPANY = "__add_new_company__";

export type MentorEditState = {
  name: string;
  designation: string;
  company: string;
  previouslyAt: string[];
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companyLogos, setCompanyLogos] = useState<CompanyLogoOption[]>([]);
  const [addCompanyTarget, setAddCompanyTarget] = useState<"current" | "previous" | null>(null);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyLogoUrl, setNewCompanyLogoUrl] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const r = await fetch("/api/admin/company-logos");
        const body = (await r.json()) as { companyLogos?: CompanyLogoOption[] };
        if (active && r.ok && body.companyLogos) {
          setCompanyLogos(body.companyLogos);
        }
      } catch {
        // Non-fatal — the admin can still type a company via "Add new".
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const selectedLogoUrl =
    companyLogos.find((c) => c.company.toLowerCase() === form.company.trim().toLowerCase())
      ?.logoUrl ?? null;

  const pendingChanges = dirty || serverUnpublished;

  const canCreateMentor =
    form.name.trim() !== "" &&
    form.designation.trim() !== "" &&
    form.company.trim() !== "" &&
    isPreviewablePhoto(form.photo);

  function update<K extends keyof MentorEditState>(key: K, value: MentorEditState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  async function onPickFile(file: File) {
    if (!isAllowedMentorPhotoMime(file.type)) {
      setBanner({ tone: "error", text: "Unsupported file type. Use PNG, JPG, WEBP, or GIF." });
      return;
    }
    if (file.size > MENTOR_PHOTO_UPLOAD.maxBytes) {
      setBanner({ tone: "error", text: "Image must be 1 MB or smaller." });
      return;
    }

    setUploading(true);
    setBanner(null);
    try {
      const data = new FormData();
      data.append("file", file);
      const r = await fetch("/api/admin/mentors/upload", { method: "POST", body: data });
      const body = (await r.json()) as { url?: string; error?: string };
      if (!r.ok || !body.url) {
        setBanner({ tone: "error", text: body.error ?? "Upload failed." });
        return;
      }
      update("photo", body.url);
      setBanner({ tone: "ok", text: "Image uploaded. Remember to publish with ‘Live the changes’." });
    } catch {
      setBanner({ tone: "error", text: "Network error during upload." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function openAddCompany(target: "current" | "previous") {
    setAddCompanyTarget(target);
    setNewCompanyName("");
    setNewCompanyLogoUrl("");
  }

  function onSelectCompany(value: string) {
    if (value === ADD_NEW_COMPANY) {
      openAddCompany("current");
      return;
    }
    setAddCompanyTarget(null);
    update("company", value);
  }

  function addPreviousCompany(value: string) {
    if (value === ADD_NEW_COMPANY) {
      openAddCompany("previous");
      return;
    }
    const name = value.trim();
    if (!name) {
      return;
    }
    if (form.previouslyAt.some((c) => c.toLowerCase() === name.toLowerCase())) {
      return;
    }
    if (form.previouslyAt.length >= 12) {
      return;
    }
    update("previouslyAt", [...form.previouslyAt, name]);
  }

  function removePreviousCompany(index: number) {
    update(
      "previouslyAt",
      form.previouslyAt.filter((_, i) => i !== index),
    );
  }

  async function onPickCompanyLogo(file: File) {
    if (!isAllowedCompanyLogoMime(file.type)) {
      setBanner({ tone: "error", text: "Unsupported file type. Use PNG, JPG, WEBP, GIF, or SVG." });
      return;
    }
    if (file.size > COMPANY_LOGO_UPLOAD.maxBytes) {
      setBanner({ tone: "error", text: "Logo must be 512 KB or smaller." });
      return;
    }

    setLogoUploading(true);
    setBanner(null);
    try {
      const data = new FormData();
      data.append("file", file);
      const r = await fetch("/api/admin/company-logos/upload", { method: "POST", body: data });
      const body = (await r.json()) as { url?: string; error?: string };
      if (!r.ok || !body.url) {
        setBanner({ tone: "error", text: body.error ?? "Logo upload failed." });
        return;
      }
      setNewCompanyLogoUrl(body.url);
    } catch {
      setBanner({ tone: "error", text: "Network error during logo upload." });
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  }

  async function saveNewCompany() {
    const company = newCompanyName.trim();
    const logoUrl = newCompanyLogoUrl.trim();
    if (!company) {
      setBanner({ tone: "error", text: "Enter the company name." });
      return;
    }
    if (!isPreviewablePhoto(logoUrl)) {
      setBanner({ tone: "error", text: "Upload an icon or paste a valid icon URL for the company." });
      return;
    }

    setSavingCompany(true);
    setBanner(null);
    try {
      const r = await fetch("/api/admin/company-logos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, logoUrl }),
      });
      const body = (await r.json()) as { companyLogo?: CompanyLogoOption; error?: string };
      if (!r.ok || !body.companyLogo) {
        setBanner({ tone: "error", text: body.error ?? "Could not save the company." });
        return;
      }
      const saved = body.companyLogo;
      setCompanyLogos((prev) => {
        const without = prev.filter(
          (c) => c.company.toLowerCase() !== saved.company.toLowerCase(),
        );
        return [...without, saved].sort((a, b) => a.company.localeCompare(b.company));
      });
      if (addCompanyTarget === "previous") {
        if (!form.previouslyAt.some((c) => c.toLowerCase() === saved.company.toLowerCase())) {
          update("previouslyAt", [...form.previouslyAt, saved.company]);
        }
      } else {
        update("company", saved.company);
      }
      setAddCompanyTarget(null);
      setNewCompanyName("");
      setNewCompanyLogoUrl("");
      setBanner({ tone: "ok", text: `Added “${saved.company}”. It’s now selectable for any mentor.` });
    } catch {
      setBanner({ tone: "error", text: "Network error while saving the company." });
    } finally {
      setSavingCompany(false);
    }
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
    companyLogoUrl:
      selectedLogoUrl ?? (addCompanyTarget === "current" ? newCompanyLogoUrl || null : null),
    previouslyAt: form.previouslyAt.map((name) => ({
      name,
      logoUrl:
        companyLogos.find((c) => c.company.toLowerCase() === name.trim().toLowerCase())?.logoUrl ??
        null,
    })),
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
            <MentorSpotlightCard mentor={previewData} priority />
            {!isPreviewablePhoto(form.photo) ? (
              <p className="mt-4 text-center text-xs text-slate-500">
                Showing a default profile image — add a photo URL to preview the real one.
              </p>
            ) : null}
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
            required
          />
          <Field
            label="Designation"
            value={form.designation}
            onChange={(v) => update("designation", v)}
            placeholder="Sr. Staff Data Scientist"
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <CompanySelect
              value={form.company}
              options={companyLogos}
              adding={addCompanyTarget === "current"}
              selectedLogoUrl={selectedLogoUrl}
              onSelect={onSelectCompany}
            />
            <PreviouslyAtSelect
              values={form.previouslyAt}
              options={companyLogos}
              onAdd={addPreviousCompany}
              onRemove={removePreviousCompany}
            />
          </div>

          {addCompanyTarget ? (
            <div className="space-y-3 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-amber-300">
                  {addCompanyTarget === "previous" ? "New ‘previously at’ company" : "New company"}
                </span>
                <button
                  type="button"
                  onClick={() => setAddCompanyTarget(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <Field
                label="Company name"
                value={newCompanyName}
                onChange={setNewCompanyName}
                placeholder="Acme Corp"
              />
              <div className="space-y-2">
                <span className="text-sm text-slate-400">Company icon</span>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept={COMPANY_LOGO_UPLOAD.accept}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        void onPickCompanyLogo(file);
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={logoUploading || savingCompany}
                    onClick={() => logoInputRef.current?.click()}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
                  >
                    {logoUploading ? "Uploading…" : "Upload icon"}
                  </button>
                  {newCompanyLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={newCompanyLogoUrl}
                      alt=""
                      className="h-8 w-8 rounded bg-white object-contain p-1"
                    />
                  ) : null}
                  <span className="text-xs text-slate-500">PNG, JPG, WEBP, GIF or SVG · max 512 KB</span>
                </div>
                <input
                  type="url"
                  className={FIELD_CLASS}
                  value={newCompanyLogoUrl}
                  placeholder="…or paste an icon URL: https://…/icon.svg"
                  onChange={(e) => setNewCompanyLogoUrl(e.target.value)}
                />
              </div>
              <button
                type="button"
                disabled={savingCompany || logoUploading}
                onClick={() => void saveNewCompany()}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60"
              >
                {savingCompany ? "Saving…" : "Save company"}
              </button>
            </div>
          ) : null}
          <Field
            label="LinkedIn URL (optional)"
            value={form.linkedInUrl}
            onChange={(v) => update("linkedInUrl", v)}
            placeholder="https://www.linkedin.com/in/…"
            type="url"
          />
          <div className="space-y-2">
            <span className="text-sm text-slate-400">
              Photo
              <RequiredMark />
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept={MENTOR_PHOTO_UPLOAD.accept}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void onPickFile(file);
                  }
                }}
              />
              <button
                type="button"
                disabled={uploading || busy}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
              >
                {uploading ? "Uploading…" : "Upload image"}
              </button>
              <span className="text-xs text-slate-500">PNG, JPG, WEBP or GIF · max 1 MB</span>
            </div>
            <input
              type="url"
              className={FIELD_CLASS}
              value={form.photo}
              placeholder="…or paste an image URL: https://…/photo.jpg"
              onChange={(e) => update("photo", e.target.value)}
            />
          </div>
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
                disabled={busy || !canCreateMentor}
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

function PreviouslyAtSelect({
  values,
  options,
  onAdd,
  onRemove,
}: {
  values: string[];
  options: CompanyLogoOption[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}) {
  const logoFor = (company: string): string | null =>
    options.find((o) => o.company.toLowerCase() === company.trim().toLowerCase())?.logoUrl ?? null;

  // Hide companies already chosen as "previously at".
  const available = options.filter(
    (o) => !values.some((v) => v.toLowerCase() === o.company.toLowerCase()),
  );

  return (
    <label className="block text-sm">
      <span className="text-slate-400">Previously at (optional)</span>
      {values.length > 0 ? (
        <div className="mb-2 mt-1 flex flex-wrap gap-2">
          {values.map((value, index) => {
            const logoUrl = logoFor(value);
            return (
              <span
                key={`${value}-${index}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-xs text-white"
              >
                <LogoImage
                  sources={resolveCompanyLogoUrls(value, logoUrl)}
                  alt=""
                  className="h-4 w-4 rounded-sm bg-white object-contain p-0.5"
                  fallback={
                    <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-white/20 text-[0.5rem] font-bold uppercase text-slate-300">
                      {value.slice(0, 2)}
                    </span>
                  }
                />
                {value}
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-slate-400 transition hover:text-rose-300"
                  aria-label={`Remove ${value}`}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      ) : null}
      <select
        className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white [color-scheme:dark] focus:border-amber-400 focus:outline-none disabled:opacity-60"
        value=""
        onChange={(e) => {
          if (e.target.value) {
            onAdd(e.target.value);
          }
        }}
      >
        <option value="" disabled className="bg-slate-900 text-white">
          Add a company…
        </option>
        {available.map((o) => (
          <option key={o.company} value={o.company} className="bg-slate-900 text-white">
            {o.company}
          </option>
        ))}
        <option value={ADD_NEW_COMPANY} className="bg-slate-900 text-amber-300">
          + Add new company…
        </option>
      </select>
    </label>
  );
}

function CompanySelect({
  value,
  options,
  adding,
  selectedLogoUrl,
  onSelect,
}: {
  value: string;
  options: CompanyLogoOption[];
  adding: boolean;
  selectedLogoUrl: string | null;
  onSelect: (value: string) => void;
}) {
  const trimmed = value.trim();
  const hasCurrent =
    trimmed !== "" &&
    options.some((o) => o.company.toLowerCase() === trimmed.toLowerCase());
  const selectValue = adding ? ADD_NEW_COMPANY : hasCurrent ? trimmed : "";

  return (
    <label className="block text-sm">
      <span className="text-slate-400">
        Company
        <RequiredMark />
      </span>
      <div className="mt-1 flex items-center gap-2">
        {trimmed && !adding ? (
          <LogoImage
            sources={resolveCompanyLogoUrls(trimmed, selectedLogoUrl)}
            alt=""
            className="h-9 w-9 shrink-0 rounded bg-white object-contain p-1"
            fallback={
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-white/10 text-xs font-bold uppercase text-slate-400">
                {trimmed.slice(0, 2)}
              </span>
            }
          />
        ) : null}
        <select
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white [color-scheme:dark] focus:border-amber-400 focus:outline-none disabled:opacity-60"
          value={selectValue}
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value="" disabled className="bg-slate-900 text-white">
            Select a company…
          </option>
          {!hasCurrent && trimmed !== "" && !adding ? (
            <option value={trimmed} className="bg-slate-900 text-white">
              {trimmed}
            </option>
          ) : null}
          {options.map((o) => (
            <option key={o.company} value={o.company} className="bg-slate-900 text-white">
              {o.company}
            </option>
          ))}
          <option value={ADD_NEW_COMPANY} className="bg-slate-900 text-amber-300">
            + Add new company…
          </option>
        </select>
      </div>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="text-slate-400">
        {label}
        {required ? <RequiredMark /> : null}
      </span>
      <input
        type={type}
        className={FIELD_CLASS}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        aria-required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

/** Small red asterisk marking a mandatory field. */
function RequiredMark() {
  return (
    <span className="ml-0.5 text-rose-400" title="Required" aria-hidden>
      *
    </span>
  );
}
