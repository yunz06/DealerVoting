import { requireAdmin } from "@/lib/access";
import { db } from "@/lib/db";
export const dynamic="force-dynamic";
export default async function Audit(){await requireAdmin();const logs=await db.auditLog.findMany({take:200,orderBy:{createdAt:"desc"},include:{user:{select:{username:true}}}});return <><p className="eyebrow">ADMIN / SECURITY</p><h1 className="heading my-6 text-6xl">Audit logs</h1><div className="table-wrap"><table><thead><tr><th>Time</th><th>Admin</th><th>Action</th><th>Target</th></tr></thead><tbody>{logs.map(l=><tr key={l.id}><td>{l.createdAt.toLocaleString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh"})}</td><td>{l.user.username}</td><td>{l.action}</td><td>{l.targetId||"—"}</td></tr>)}</tbody></table></div></>}
