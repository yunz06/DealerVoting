"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAdmin, requireOwner } from "@/lib/access";
export async function createPoll(formData:FormData){const admin=await requireAdmin();const parsed=z.object({title:z.string().trim().min(3).max(180),description:z.string().max(5000),options:z.string()}).safeParse({title:formData.get("title"),description:formData.get("description")||"",options:formData.get("options")});if(!parsed.success)redirect("/admin/polls/new?error=1");const options=parsed.data.options.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(options.length<2||options.length>20||options.some(x=>x.length>240))redirect("/admin/polls/new?error=1");const poll=await db.poll.create({data:{title:parsed.data.title,description:parsed.data.description,createdById:admin.id,options:{create:options.map((text,position)=>({text,position}))}}});await db.auditLog.create({data:{userId:admin.id,action:"CREATE_POLL",targetId:poll.id}});revalidatePath("/admin");revalidatePath("/");redirect("/admin");}
export async function closePoll(formData:FormData){const admin=await requireAdmin();const id=String(formData.get("id")||"");await db.poll.update({where:{id},data:{status:"CLOSED"}});await db.auditLog.create({data:{userId:admin.id,action:"CLOSE_POLL",targetId:id}});revalidatePath("/admin");revalidatePath("/polls");redirect("/admin");}
export async function createMember(formData:FormData){const admin=await requireAdmin();const parsed=z.object({username:z.string().trim().min(3).max(80).regex(/^[a-zA-Z0-9_.-]+$/),displayName:z.string().trim().min(1).max(120),password:z.string().min(12).max(128)}).safeParse({username:formData.get("username"),displayName:formData.get("displayName"),password:formData.get("password")});if(!parsed.success)redirect("/admin/members/new?error=1");const existing=await db.user.findUnique({where:{username:parsed.data.username}});if(existing)redirect("/admin/members/new?error=exists");const member=await db.user.create({data:{username:parsed.data.username,displayName:parsed.data.displayName,passwordHash:await bcrypt.hash(parsed.data.password,12),role:"MEMBER"}});await db.auditLog.create({data:{userId:admin.id,action:"CREATE_MEMBER",targetId:member.id}});revalidatePath("/admin/members");redirect("/admin/members");}
export async function toggleMember(formData:FormData){const admin=await requireAdmin();const id=String(formData.get("id")||"");if(id===admin.id)redirect("/admin/members");const target=await db.user.findUnique({where:{id}});if(!target||target.role!=="MEMBER")redirect("/admin/members");await db.user.update({where:{id},data:{active:!target.active}});await db.auditLog.create({data:{userId:admin.id,action:"TOGGLE_MEMBER",targetId:id}});revalidatePath("/admin/members");redirect("/admin/members");}


export async function createAdmin(formData: FormData) {
  const owner = await requireOwner();
  const parsed = z.object({
    username: z.string().trim().min(3).max(80).regex(/^[a-zA-Z0-9_.-]+$/),
    displayName: z.string().trim().min(1).max(120),
    password: z.string().min(12).max(128),
  }).safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/owner/admins/new?error=1");
  const existing = await db.user.findUnique({ where: { username: parsed.data.username } });
  if (existing) redirect("/owner/admins/new?error=exists");

  const admin = await db.user.create({
    data: {
      username: parsed.data.username,
      displayName: parsed.data.displayName,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      role: "ADMIN",
      active: true,
    },
  });
  await db.auditLog.create({ data: { userId: owner.id, action: "CREATE_ADMIN", targetId: admin.id } });
  revalidatePath("/owner/admins");
  redirect("/owner/admins");
}

export async function toggleAdmin(formData: FormData) {
  const owner = await requireOwner();
  const id = String(formData.get("id") || "");
  if (!id || id === owner.id) redirect("/owner/admins");
  const target = await db.user.findUnique({ where: { id } });
  if (!target || target.role !== "ADMIN") redirect("/owner/admins");

  await db.user.update({ where: { id }, data: { active: !target.active } });
  await db.auditLog.create({
    data: { userId: owner.id, action: target.active ? "DISABLE_ADMIN" : "ENABLE_ADMIN", targetId: target.id },
  });
  revalidatePath("/owner/admins");
  redirect("/owner/admins");
}
