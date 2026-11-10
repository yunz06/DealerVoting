"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser,isOpen } from "@/lib/access";
export async function castVote(formData:FormData){
 const user=await requireUser();
 const pollId=String(formData.get("pollId")||"");
 const optionId=String(formData.get("optionId")||"");
 if(!pollId||!optionId)redirect("/polls");
 const poll=await db.poll.findUnique({where:{id:pollId},select:{id:true,status:true,startAt:true,endAt:true}});
 if(!poll||!isOpen(poll))redirect('/polls/'+pollId+'?error=1');
 const option=await db.pollOption.findFirst({where:{id:optionId,pollId},select:{id:true}});
 if(!option)redirect('/polls/'+pollId+'?error=1');
 try{await db.vote.create({data:{pollId,userId:user.id,optionId}});}catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==="P2002")redirect('/polls/'+pollId);throw e;}
 revalidatePath("/");revalidatePath("/polls");revalidatePath('/polls/'+pollId);redirect('/polls/'+pollId);
}
