import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

function slugify(input: string) {
    return input
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

async function ensureAdmin(){
    const session = await getServerSession(authOptions);
    return !!session?.user && session.user.role === "ADMIN";
}

export async function GET(_req: Request, { params }: Params ){
    if(!(await ensureAdmin())){
        return NextResponse.json({ erros: "forbidden"}, { status: 403});
    }

    const { id } = await params;

    if (!id) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

    const project = await prisma.project.findUnique({where: {id}});

    if(!project) return NextResponse.json({ error: "not_found"}, {status: 404});


    return NextResponse.json({ project});

}

export async function PATCH(req: Request, {params}: Params){
    if(!(await ensureAdmin())){
        return NextResponse.json({ error: "forbidden"}, {status: 403});
    }

     const { id } = await params;
     if (!id) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

     const body = (await req.json()) as Partial <{
        title: string;
        slug: string;
        summary: string;
        contentMd: string;
        coverImageUrl?: string | null;
        tags?: string[];
        published?: boolean;
    }>;

    
  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title.trim() } : {}),
      ...(body.slug !== undefined ? { slug: slugify(body.slug) } : {}),
      ...(body.summary !== undefined ? { summary: body.summary.trim() } : {}),
      ...(body.contentMd !== undefined ? { contentMd: body.contentMd } : {}),
      ...(body.coverImageUrl !== undefined ? { coverImageUrl: body.coverImageUrl?.trim() || null } : {}),
      ...(body.tags !== undefined ? { tags: body.tags } : {}),
      ...(body.published !== undefined ? { published: body.published } : {}),
    },
  });

  return NextResponse.json({project: updated});
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
