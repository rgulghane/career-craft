import { messages } from "@career-craft/shared";
import { requireFullAdminPage } from "@/server/auth-guards";
import { listPortalAdmins } from "@/server/services/admin/team";
import { CreateReadonlyAdminForm } from "./create-readonly-admin-form";
import { RevokeReadonlyButton } from "./revoke-readonly-button";

export default async function AdminTeamPage() {
  await requireFullAdminPage();
  const admins = await listPortalAdmins();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin team</h1>
        <p className="mt-2 text-sm text-slate-400">{messages.admin.teamPageIntro}</p>
      </div>

      <CreateReadonlyAdminForm />

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">Portal accounts</h2>
        <table className="mt-4 min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-white/5">
                <td className="py-3 pr-4 text-white">{a.fullName}</td>
                <td className="py-3 pr-4 font-mono text-xs text-slate-300">{a.email}</td>
                <td className="py-3 pr-4">
                  <span className={a.userType === "admin" ? "text-amber-400" : "text-slate-400"}>
                    {a.userType === "admin" ? messages.admin.roleAdministrator : messages.admin.roleViewer}
                  </span>
                </td>
                <td className="py-3">
                  {a.userType === "admin-readonly" ? (
                    <RevokeReadonlyButton adminId={a.id} email={a.email} />
                  ) : (
                    <span className="text-xs text-slate-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
