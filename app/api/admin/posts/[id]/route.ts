import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  return !!session?.user && session.user.role === "ADMIN";
}

export async function GET(_req: Request, { params }: Params) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({ post });
}

export async function PATCH(req: Request, {params}: Params){
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const body = (await req.json()) as Partial<{
    title: string;
    slug: string;
    excerpt: string;
    contentMd: string;
    coverImageUrl: string | null;
    published: boolean;
  }>;

  const updated = await prisma.post.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title.trim() } : {}),
      ...(body.slug !== undefined ? { slug: body.slug.trim().toLowerCase() } : {}),
      ...(body.excerpt !== undefined ? { excerpt: body.excerpt.trim() } : {}),
      ...(body.contentMd !== undefined ? { contentMd: body.contentMd } : {}),
      ...(body.coverImageUrl !== undefined
        ? { coverImageUrl: body.coverImageUrl?.trim() || null }
        : {}),
      ...(body.published !== undefined ? { published: body.published } : {}),
    },
  });

  return NextResponse.json({ post: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
