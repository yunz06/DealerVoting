import Link from "next/link";
import { requireOwner } from "@/lib/access";
import { createAdmin } from "@/actions/admin";

export default async function NewAdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireOwner();
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow">OWNER CONTROL / NEW ACCOUNT</p>
      <h1 className="heading mt-4 text-6xl">Create admin</h1>
      <p className="mt-3 text-sm text-zinc-400">Tạo tài khoản quản trị viên. Admin có thể quản lý cuộc vote, Member và xem kết quả theo quyền hệ thống.</p>
      {params.error === "exists" && <p className="mt-5 border border-rose-900 bg-rose-950/30 p-3 text-sm text-rose-200">Username đã tồn tại.</p>}
      {params.error === "1" && <p className="mt-5 border border-rose-900 bg-rose-950/30 p-3 text-sm text-rose-200">Thông tin chưa hợp lệ. Username tối thiểu 3 ký tự, mật khẩu tối thiểu 12 ký tự.</p>}
      <form action={createAdmin} className="panel mt-8 grid gap-5 p-6">
        <label className="grid gap-2 text-xs uppercase tracking-widest text-zinc-300">Display name
          <input className="input" name="displayName" maxLength={120} required placeholder="Tên hiển thị Admin" />
        </label>
        <label className="grid gap-2 text-xs uppercase tracking-widest text-zinc-300">Username
          <input className="input" name="username" minLength={3} maxLength={80} pattern="[A-Za-z0-9_.-]+" required placeholder="admin.username" />
        </label>
        <label className="grid gap-2 text-xs uppercase tracking-widest text-zinc-300">Temporary password
          <input className="input" name="password" type="password" minLength={12} maxLength={128} required placeholder="At least 12 characters" />
        </label>
        <p className="text-xs leading-6 text-zinc-500">Cấp mật khẩu ban đầu qua kênh riêng. Không gửi mật khẩu qua nhóm chat công khai.</p>
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary">CREATE ADMIN ↗</button>
          <Link className="btn btn-outline" href="/owner/admins">CANCEL</Link>
        </div>
      </form>
    </div>
  );
}
