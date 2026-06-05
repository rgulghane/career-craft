import Link from "next/link";
import { requireAdminPage } from "@/server/auth-guards";
import { MentorEditor } from "../mentor-editor";

export const dynamic = "force-dynamic";

export default async function NewMentorPage() {
  await requireAdminPage();

  return (
    <div className="space-y-6">
      <Link href="/admin/mentors" className="text-sm text-amber-400 hover:underline">
        ← Mentors
      </Link>
      <h1 className="text-3xl font-bold text-white">Add mentor</h1>
      <MentorEditor
        mode="create"
        initial={{
          name: "",
          designation: "",
          company: "",
          previouslyAt: "",
          linkedInUrl: "",
          photo: "",
          order: 0,
        }}
      />
    </div>
  );
}
