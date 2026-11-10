import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser,isOpen } from "@/lib/access";
export const dynamic="force-dynamic";
export default async function Polls(){const user=await requireUser();const polls=await db.poll.findMany({orderBy:{createdAt:"desc"},include:{votes:{where:{userId:user.id},select:{id:true}}}});return <><p className="eyebrow">DEALERS / BALLOTS</p><h1 className="heading my-6 text-6xl">All polls</h1><div className="grid gap-4 md:grid-cols-2">{polls.map(p=><Link key={p.id} href={'/polls/'+p.id} className="panel p-7 hover:border-zinc-400"><p className="eyebrow">{isOpen(p)?"OPEN":"CLOSED"} / {p.votes.length?"VOTED":"NOT VOTED"}</p><h2 className="heading my-5 text-3xl">{p.title}</h2><p className="text-sm text-zinc-400">{p.description}</p><p className="eyebrow mt-8">VIEW BALLOT ↗</p></Link>)}{!polls.length&&<p className="text-zinc-400">Chưa có cuộc vote.</p>}</div></>}
