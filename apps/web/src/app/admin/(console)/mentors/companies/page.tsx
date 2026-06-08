import Link from "next/link";
import { requireAdminPage } from "@/server/auth-guards";
import { AdminCard } from "@/components/admin/admin-card";
import { listCompanyLogos } from "@/server/services/admin/company-logos";
import { CompanyLogoForm } from "./company-logo-form";
import { DeleteCompanyLogoButton } from "./delete-company-logo-button";

export const dynamic = "force-dynamic";

export default async function MentorCompaniesPage() {
  await requireAdminPage();
  const companyLogos = await listCompanyLogos();

  return (
    <div className="space-y-6">
      <Link href="/admin/mentors" className="text-sm text-amber-400 hover:underline">
        ← Mentors
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-white">Mentor companies</h1>
        <p className="mt-2 text-sm text-slate-400">
          {companyLogos.length} {companyLogos.length === 1 ? "company" : "companies"} · icons used on
          mentor cards across the site
        </p>
      </div>

      <AdminCard title="Add or update a company">
        <CompanyLogoForm />
      </AdminCard>

      <AdminCard>
        {companyLogos.length === 0 ? (
          <p className="text-sm text-slate-400">No company icons yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4">Icon</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companyLogos.map((logo) => (
                  <tr key={logo.id} className="border-b border-white/5">
                    <td className="py-3 pr-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logo.logoUrl}
                        alt={logo.company}
                        className="h-9 w-9 rounded bg-white object-contain p-1"
                        loading="lazy"
                        decoding="async"
                      />
                    </td>
                    <td className="py-3 pr-4 font-medium text-slate-200">{logo.company}</td>
                    <td className="py-3">
                      <DeleteCompanyLogoButton id={logo.id} company={logo.company} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
