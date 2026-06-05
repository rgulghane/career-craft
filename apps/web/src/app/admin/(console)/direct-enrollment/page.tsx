import { messages } from "@career-craft/shared";
import { AdminCard } from "@/components/admin/admin-card";
import { DirectEnrollmentTool } from "./direct-enrollment-tool";

export const dynamic = "force-dynamic";

export default function AdminDirectEnrollmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">{messages.admin.directEnrollTitle}</h1>
        <p className="mt-2 text-sm text-slate-400">{messages.admin.directEnrollSubtitle}</p>
      </div>
      <AdminCard>
        <DirectEnrollmentTool />
      </AdminCard>
    </div>
  );
}
