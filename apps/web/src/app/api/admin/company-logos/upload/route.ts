import { NextResponse } from "next/server";
import { COMPANY_LOGO_UPLOAD, isAllowedCompanyLogoMime } from "@career-craft/shared";
import { withAdminApi } from "@/server/admin-api";
import {
  StorageNotConfiguredError,
  isStorageConfigured,
  uploadCompanyLogo,
} from "@/server/services/storage/azure-blob";

export const dynamic = "force-dynamic";
// Image processing needs the Node.js runtime (not edge).
export const runtime = "nodejs";

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export async function POST(req: Request) {
  return withAdminApi(async () => {
    if (!isStorageConfigured()) {
      return NextResponse.json(
        { error: "Image uploads are not configured on this server." },
        { status: 503 },
      );
    }

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "The file is empty." }, { status: 400 });
    }
    if (file.size > COMPANY_LOGO_UPLOAD.maxBytes) {
      return NextResponse.json(
        { error: "Logo must be 512 KB or smaller." },
        { status: 413 },
      );
    }
    if (!isAllowedCompanyLogoMime(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PNG, JPG, WEBP, GIF, or SVG." },
        { status: 415 },
      );
    }

    const extension = MIME_TO_EXTENSION[file.type] ?? "bin";
    const data = Buffer.from(await file.arrayBuffer());

    try {
      const uploaded = await uploadCompanyLogo({
        data,
        contentType: file.type,
        extension,
      });
      return NextResponse.json({ url: uploaded.url });
    } catch (err) {
      if (err instanceof StorageNotConfiguredError) {
        return NextResponse.json({ error: err.message }, { status: 503 });
      }
      console.error("[company-logos/upload] Failed to upload image", err);
      return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
    }
  });
}
