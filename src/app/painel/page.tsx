import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" description="Acompanhe suas vendas e as ordens recentes." />
    </div>
  );
}
