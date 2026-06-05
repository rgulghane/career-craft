import "server-only";

import { ObjectId } from "mongodb";
import type {
  AdminCreateMentorBody,
  AdminUpdateMentorBody,
  MentorContentInput,
} from "@career-craft/shared";
import { LANDING } from "@career-craft/shared";
import "../../db/load-env";
import { mapMentor, toDbId } from "../../db/helpers";
import { mentorsCollection } from "../../db/mongo-client";
import type { Mentor, MentorContent } from "../../db/types";
import { AdminServiceError } from "./errors";

/** Public-facing shape consumed by the landing mentor carousel. */
export interface PublishedMentor {
  name: string;
  designation: string;
  company: string;
  previouslyAt?: string;
  linkedInUrl: string;
  photo: string;
}

function normalizeContent(input: MentorContentInput): MentorContent {
  return {
    name: input.name.trim(),
    designation: input.designation.trim(),
    company: input.company.trim(),
    previouslyAt: (input.previouslyAt ?? "").trim(),
    linkedInUrl: (input.linkedInUrl ?? "").trim(),
    photo: input.photo.trim(),
  };
}

async function nextOrder(): Promise<number> {
  const mentors = await mentorsCollection();
  const last = await mentors.find({}).sort({ order: -1 }).limit(1).next();
  return last ? (last.order ?? 0) + 1 : 0;
}

export async function listMentors(): Promise<Mentor[]> {
  const mentors = await mentorsCollection();
  const docs = await mentors.find({}).sort({ order: 1, createdAt: 1 }).toArray();
  return docs.map(mapMentor);
}

export async function getMentor(id: string): Promise<Mentor | null> {
  const mentors = await mentorsCollection();
  const doc = await mentors.findOne({ _id: toDbId(id) });
  return doc ? mapMentor(doc) : null;
}

export async function createMentor(body: AdminCreateMentorBody): Promise<Mentor> {
  const mentors = await mentorsCollection();
  const now = new Date();
  const content = normalizeContent(body);
  const order = body.order ?? (await nextOrder());

  const _id = new ObjectId();
  await mentors.insertOne({
    _id,
    order,
    draft: content,
    live: null,
    isPublished: false,
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
  });

  const doc = await mentors.findOne({ _id });
  if (!doc) {
    throw new AdminServiceError(500, "Failed to load mentor after create");
  }
  return mapMentor(doc);
}

/** Persist edits to the draft only — does not change what is live on the site. */
export async function updateMentorDraft(
  id: string,
  body: AdminUpdateMentorBody,
): Promise<Mentor> {
  const mentors = await mentorsCollection();
  const doc = await mentors.findOne({ _id: toDbId(id) });
  if (!doc) {
    throw new AdminServiceError(404, "Mentor not found");
  }

  const $set: Record<string, unknown> = {
    draft: normalizeContent(body),
    updatedAt: new Date(),
  };
  if (body.order !== undefined) {
    $set.order = body.order;
  }

  await mentors.updateOne({ _id: toDbId(id) }, { $set });
  const updated = await mentors.findOne({ _id: toDbId(id) });
  if (!updated) {
    throw new AdminServiceError(500, "Update failed");
  }
  return mapMentor(updated);
}

/**
 * "Live the changes" — copies the (optionally updated) draft into the live
 * content and marks the mentor published so it appears on the landing page.
 */
export async function publishMentor(
  id: string,
  body?: AdminUpdateMentorBody,
): Promise<Mentor> {
  const mentors = await mentorsCollection();
  const doc = await mentors.findOne({ _id: toDbId(id) });
  if (!doc) {
    throw new AdminServiceError(404, "Mentor not found");
  }

  const now = new Date();
  const draft = body ? normalizeContent(body) : doc.draft;
  const $set: Record<string, unknown> = {
    draft,
    live: draft,
    isPublished: true,
    updatedAt: now,
    publishedAt: now,
  };
  if (body?.order !== undefined) {
    $set.order = body.order;
  }

  await mentors.updateOne({ _id: toDbId(id) }, { $set });
  const updated = await mentors.findOne({ _id: toDbId(id) });
  if (!updated) {
    throw new AdminServiceError(500, "Publish failed");
  }
  return mapMentor(updated);
}

/** Toggle whether a mentor is shown on the public site (without losing content). */
export async function setMentorVisibility(id: string, isPublished: boolean): Promise<Mentor> {
  const mentors = await mentorsCollection();
  const doc = await mentors.findOne({ _id: toDbId(id) });
  if (!doc) {
    throw new AdminServiceError(404, "Mentor not found");
  }
  if (isPublished && !doc.live) {
    throw new AdminServiceError(
      400,
      "Use ‘Live the changes’ to publish this mentor for the first time.",
    );
  }

  await mentors.updateOne(
    { _id: toDbId(id) },
    { $set: { isPublished, updatedAt: new Date() } },
  );
  const updated = await mentors.findOne({ _id: toDbId(id) });
  if (!updated) {
    throw new AdminServiceError(500, "Update failed");
  }
  return mapMentor(updated);
}

export async function deleteMentor(id: string): Promise<void> {
  const mentors = await mentorsCollection();
  const result = await mentors.deleteOne({ _id: toDbId(id) });
  if (result.deletedCount !== 1) {
    throw new AdminServiceError(404, "Mentor not found");
  }
}

/** Mentors rendered on the public landing page (live + published, ordered). */
export async function listPublishedMentors(): Promise<PublishedMentor[]> {
  const mentors = await mentorsCollection();
  const docs = await mentors
    .find({ isPublished: true, live: { $ne: null } })
    .sort({ order: 1, createdAt: 1 })
    .toArray();

  return docs
    .filter((doc) => doc.live)
    .map((doc) => {
      const c = doc.live as MentorContent;
      return {
        name: c.name,
        designation: c.designation,
        company: c.company,
        previouslyAt: c.previouslyAt || undefined,
        linkedInUrl: c.linkedInUrl || "#",
        photo: c.photo,
      };
    });
}

/**
 * Seed the collection from the static landing mentors (one-time bootstrap).
 * Seeded mentors are published immediately so the site looks unchanged.
 */
export async function seedMentorsFromLanding(): Promise<number> {
  const mentors = await mentorsCollection();
  const existing = await mentors.countDocuments({});
  if (existing > 0) {
    throw new AdminServiceError(409, "Mentors already exist — seeding is only for an empty list.");
  }

  const now = new Date();
  const docs = LANDING.mentors.map((m, index) => {
    const content: MentorContent = {
      name: m.name,
      designation: m.designation,
      company: m.company,
      previouslyAt: m.previouslyAt ?? "",
      linkedInUrl: m.linkedInUrl ?? "",
      photo: m.photo,
    };
    return {
      _id: new ObjectId(),
      order: index,
      draft: content,
      live: content,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    };
  });

  if (docs.length === 0) {
    return 0;
  }
  await mentors.insertMany(docs);
  return docs.length;
}
