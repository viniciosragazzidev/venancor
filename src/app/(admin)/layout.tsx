import { AdminHeader } from "@/components/admin/admin-header";
import { Brand } from "@/components/admin/brand";
import { SidebarNav } from "@/components/admin/sidebar-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <div className="flex">
        <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r bg-sidebar lg:flex">
          <div className="flex h-14 shrink-0 items-center border-b px-4">
            <Brand />
          </div>
          <SidebarNav className="flex-1 overflow-y-auto py-3" />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
