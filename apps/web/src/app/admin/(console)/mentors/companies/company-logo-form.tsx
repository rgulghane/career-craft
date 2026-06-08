"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { COMPANY_LOGO_UPLOAD, isAllowedCompanyLogoMime } from "@career-craft/shared";

type Banner = { tone: "ok" | "error"; text: string } | null;

const FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none disabled:opacity-60";

function isValidUrl(url: string): boolean {
  return /^https?:\/\/\S+/i.test(url.trim());
}

export function CompanyLogoForm() {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function onPickFile(file: File) {
    if (!isAllowedCompanyLogoMime(file.type)) {
      setBanner({ tone: "error", text: "Unsupported file type. Use PNG, JPG, WEBP, GIF, or SVG." });
      return;
    }
    if (file.size > COMPANY_LOGO_UPLOAD.maxBytes) {
      setBanner({ tone: "error", text: "Logo must be 512 KB or smaller." });
      return;
    }

    setUploading(true);
    setBanner(null);
    try {
      const data = new FormData();
      data.append("file", file);
      const r = await fetch("/api/admin/company-logos/upload", { method: "POST", body: data });
      const body = (await r.json()) as { url?: string; error?: string };
      if (!r.ok || !body.url) {
        setBanner({ tone: "error", text: body.error ?? "Upload failed." });
        return;
      }
      setLogoUrl(body.url);
    } catch {
      setBanner({ tone: "error", text: "Network error during upload." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function onSave() {
    const name = company.trim();
    const url = logoUrl.trim();
    if (!name) {
      setBanner({ tone: "error", text: "Enter the company name." });
      return;
    }
    if (!isValidUrl(url)) {
      setBanner({ tone: "error", text: "Upload an icon or paste a valid icon URL." });
      return;
    }

    setSaving(true);
    setBanner(null);
    try {
      const r = await fetch("/api/admin/company-logos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: name, logoUrl: url }),
      });
      const body = (await r.json()) as { companyLogo?: { company: string }; error?: string };
      if (!r.ok || !body.companyLogo) {
        setBanner({ tone: "error", text: body.error ?? "Could not save the company." });
        return;
      }
      setBanner({ tone: "ok", text: `Saved “${body.companyLogo.company}”.` });
      setCompany("");
      setLogoUrl("");
      router.refresh();
    } catch {
      setBanner({ tone: "error", text: "Network error while saving." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Add a company icon to the shared library. Existing companies (matched by name) are updated
        with the new icon.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-slate-400">Company name</span>
          <input
            type="text"
            className={FIELD_CLASS}
            value={company}
            placeholder="Acme Corp"
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>

        <div className="block text-sm">
          <span className="text-slate-400">Icon</span>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept={COMPANY_LOGO_UPLOAD.accept}
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
              disabled={uploading || saving}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Upload icon"}
            </button>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-9 w-9 rounded bg-white object-contain p-1" />
            ) : null}
          </div>
        </div>
      </div>

      <input
        type="url"
        className={FIELD_CLASS}
        value={logoUrl}
        placeholder="…or paste an icon URL: https://…/icon.svg"
        onChange={(e) => setLogoUrl(e.target.value)}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={saving || uploading}
          onClick={() => void onSave()}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save company"}
        </button>
        <span className="text-xs text-slate-500">PNG, JPG, WEBP, GIF or SVG · max 512 KB</span>
      </div>

      {banner ? (
        <p className={banner.tone === "ok" ? "text-sm text-emerald-400" : "text-sm text-rose-400"}>
          {banner.text}
        </p>
      ) : null}
    </div>
  );
}
