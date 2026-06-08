import Link from "next/link";
import { requireAdminPage } from "@/server/auth-guards";
import { AdminCard } from "@/components/admin/admin-card";
import { listMentors } from "@/server/services/admin/mentors";
import { DeleteMentorButton } from "./delete-mentor-button";
import { SeedMentorsButton } from "./seed-mentors-button";

export const dynamic = "force-dynamic";

function StatusPill({
  isPublished,
  hasUnpublishedChanges,
}: {
  isPublished: boolean;
  hasUnpublishedChanges: boolean;
}) {
  if (!isPublished) {
    return (
      <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-300">
        Draft
      </span>
    );
  }
  if (hasUnpublishedChanges) {
    return (
      <span className="rounded-full bg-sky-500/15 px-2.5 py-1 text-xs font-medium text-sky-300">
        Live · edits pending
      </span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
      Live
    </span>
  );
}

export default async function AdminMentorsPage() {
  await requireAdminPage();
  const mentors = await listMentors();
  const liveCount = mentors.filter((m) => m.isPublished).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Mentors</h1>
          <p className="mt-2 text-sm text-slate-400">
            {mentors.length} total · {liveCount} live on the site
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/mentors/companies"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Mentor companies
          </Link>
          <Link
            href="/admin/mentors/new"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
          >
            Add mentor
          </Link>
        </div>
      </div>

      {mentors.length === 0 ? (
        <AdminCard>
          <p className="text-sm text-slate-400">No mentors yet.</p>
          <div className="mt-4 space-y-4">
            <p className="text-sm text-slate-500">
              Import the mentors currently shown on the landing page to manage them here, or add one
              from scratch.
            </p>
            <SeedMentorsButton />
          </div>
        </AdminCard>
      ) : (
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4">Order</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Company</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mentors.map((m) => (
                  <tr key={m.id} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-mono text-xs text-slate-400">{m.order}</td>
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/mentors/${m.id}`}
                        className="font-medium text-amber-400 hover:underline"
                      >
                        {m.draft.name}
                      </Link>
                      <span className="block text-xs text-slate-500">{m.draft.designation}</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-300">{m.draft.company}</td>
                    <td className="py-3 pr-4">
                      <StatusPill
                        isPublished={m.isPublished}
                        hasUnpublishedChanges={m.hasUnpublishedChanges}
                      />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/admin/mentors/${m.id}`}
                          className="text-xs font-medium text-slate-300 hover:text-white"
                        >
                          Edit
                        </Link>
                        <DeleteMentorButton mentorId={m.id} name={m.draft.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </div>
  );
}
