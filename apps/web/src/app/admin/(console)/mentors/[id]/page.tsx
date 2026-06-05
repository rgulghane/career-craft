import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/server/auth-guards";
import { getMentor } from "@/server/services/admin/mentors";
import { MentorEditor } from "../mentor-editor";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function EditMentorPage({ params }: Params) {
  await requireAdminPage();
  const { id } = await params;
  const mentor = await getMentor(id);
  if (!mentor) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/mentors" className="text-sm text-amber-400 hover:underline">
        ← Mentors
      </Link>
      <h1 className="text-3xl font-bold text-white">{mentor.draft.name || "Edit mentor"}</h1>
      <MentorEditor
        mode="edit"
        mentorId={mentor.id}
        initial={{
          name: mentor.draft.name,
          designation: mentor.draft.designation,
          company: mentor.draft.company,
          previouslyAt: mentor.draft.previouslyAt,
          linkedInUrl: mentor.draft.linkedInUrl,
          photo: mentor.draft.photo,
          order: mentor.order,
        }}
        isPublished={mentor.isPublished}
        hasUnpublishedChanges={mentor.hasUnpublishedChanges}
        hasLive={mentor.live !== null}
      />
    </div>
  );
}
