import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as {
    title: string;
    slug: string;
    excerpt: string;
    contentMd: string;
    coverImageUrl?: string | null;
    tags?: string[];
    published?: boolean;
  };

  if (!body.title || !body.slug || !body.excerpt || !body.contentMd) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const created = await prisma.post.create({
    data: {
      title: body.title.trim(),
      slug: body.slug.trim().toLowerCase(),
      excerpt: body.excerpt.trim(),
      contentMd: body.contentMd,
      coverImageUrl: body.coverImageUrl?.trim() || null,
      tags: body.tags ?? [],
      published: !!body.published,
    },
  });

  return NextResponse.json({ post: created }, { status: 201 });
}