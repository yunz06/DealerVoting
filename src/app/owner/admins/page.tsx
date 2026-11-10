import Link from "next/link";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/access";
import { toggleAdmin } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminAccountsPage() {
  await requireOwner();
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "desc" },
    select: { id: true, username: true, displayName: true, active: true, createdAt: true },
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">OWNER CONTROL / ACCESS MANAGEMENT</p>
          <h1 className="heading mt-4 text-6xl">Admin accounts</h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Chỉ Owner được tạo và vô hiệu hóa tài khoản Admin. Admin không thể quản lý Admin khác hoặc thay đổi quyền Owner.
          </p>
        </div>
        <Link className="btn btn-primary" href="/owner/admins/new">CREATE ADMIN +</Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="panel p-5"><p className="eyebrow">TOTAL ADMINS</p><strong className="heading mt-3 block text-4xl">{admins.length}</strong></div>
        <div className="panel p-5"><p className="eyebrow">ACTIVE</p><strong className="heading mt-3 block text-4xl">{admins.filter(a => a.active).length}</strong></div>
        <div className="panel p-5"><p className="eyebrow">DISABLED</p><strong className="heading mt-3 block text-4xl">{admins.filter(a => !a.active).length}</strong></div>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Administrator</th><th>Username</th><th>Created</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td><strong>{admin.displayName}</strong><div className="mt-1 text-[10px] tracking-widest text-zinc-500">ADMINISTRATOR</div></td>
                <td>{admin.username}</td>
                <td>{admin.createdAt.toLocaleDateString("vi-VN")}</td>
                <td><span className={admin.active ? "text-emerald-300" : "text-rose-300"}>{admin.active ? "ACTIVE" : "DISABLED"}</span></td>
                <td>
                  <form action={toggleAdmin}>
                    <input type="hidden" name="id" value={admin.id} />
                    <button className="text-xs uppercase tracking-widest text-zinc-300 underline underline-offset-4">
                      {admin.active ? "Disable account" : "Enable account"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!admins.length && <tr><td colSpan={5} className="py-10 text-center text-zinc-500">Chưa có Admin phụ. Hãy tạo tài khoản đầu tiên.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mt-6 border border-amber-900/60 bg-amber-950/20 p-4 text-xs leading-6 text-amber-100/80">
        <strong className="block tracking-widest">SECURITY NOTE</strong>
        Vô hiệu hóa tài khoản sẽ chặn các lần đăng nhập tiếp theo. Lịch sử hoạt động và phiếu vote được giữ nguyên.
      </div>
    </div>
  );
}
