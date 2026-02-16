import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
function slugify(input: string) {
    return input
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if(!session?.user || session.user.role !== "ADMIN"){
        return NextResponse.json({error: "forbidden"}, { status: 403});
    }

    const projects = await prisma.project.findMany({
        orderBy: {createdAt: "desc"},
    });

    return NextResponse.json({ projects });
}

export async function POST(req: Request){
    const session = await getServerSession(authOptions);
    if(!session?.user || session.user.role !== "ADMIN"){
        return NextResponse.json({ error: "forbidden"}, {status: 403});
    }

    const body = (await req.json()) as {
        title: string;
        slug: string;
        summary: string;
        contentMd: string;
        coverImageUrl?: string | null;
        tags?: string[];
        published?: boolean;
    };


    const slugInput = (body.slug ?? "").trim();
    const slug = slugify(slugInput || (body.title ?? ""));

    if(!body.title || !slug || !body.summary || !body.contentMd){
        return NextResponse.json({error: "missing_fiels"}, { status: 400});
    }

    const created = await prisma.project.create({
        data:{
            title: body.title.trim(),
            slug,
            summary: body.summary.trim(),
            contentMd: body.contentMd,
            coverImageUrl: body.coverImageUrl?.trim() || null,
            tags: body.tags ?? [],
            published: body.published ?? false,
        },
    });

    return NextResponse.json({project: created}, { status: 201});
}
