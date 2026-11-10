import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/access";
import { toggleMember } from "@/actions/admin";
export const dynamic="force-dynamic";
export default async function Members(){const admin=await requireAdmin();const members=await db.user.findMany({orderBy:{createdAt:"desc"},select:{id:true,username:true,displayName:true,role:true,active:true}});return <><div className="mb-8 flex items-end justify-between"><div><p className="eyebrow">ADMIN / ACCESS CONTROL</p><h1 className="heading mt-4 text-6xl">Members</h1></div><Link href="/admin/members/new" className="btn btn-primary">ADD MEMBER +</Link></div><div className="table-wrap"><table><thead><tr><th>Member</th><th>Username</th><th>Role</th><th>Status</th><th>Action</th></tr></thead><tbody>{members.map(m=><tr key={m.id}><td>{m.displayName}</td><td>{m.username}</td><td>{m.role}</td><td>{m.active?"ACTIVE":"DISABLED"}</td><td>{m.role==="MEMBER"&&m.id!==admin.id&&<form action={toggleMember}><input type="hidden" name="id" value={m.id}/><button className="underline">{m.active?"DISABLE":"ENABLE"}</button></form>}</td></tr>)}</tbody></table></div></>}
