import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 flex flex-col">
      <AdminHeader />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

