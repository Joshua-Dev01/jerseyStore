import { requireAdmin } from "@/lib/admin/admin";
import AdminSidebar from "./siderbar/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar email={user.email ?? "Admin"} />
      <main className="flex-1 min-h-screen min-w-0">{children}</main>
    </div>
  );
}