import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ slug: string }> };

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) {
    return (
      <main className="p-6 max-w-3xl mx-auto space-y-2">
        <h1 className="text-xl font-semibold">Invalid project slug.</h1>
      </main>
    );
  }

  const project = await prisma.project.findUnique({
    where: { slug },
  });

  if (!project) {
    return (
      <main className="p-6 max-w-3xl mx-auto space-y-2">
        <h1 className="text-xl font-semibold">Project not found.</h1>
        <p className="text-sm text-muted-foreground">
          Slug: <span className="font-mono">{slug}</span>
        </p>
      </main>
    );
  }

  if (!project.published) {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") return notFound();
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl">{project.title}</CardTitle>

          {project.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardHeader>

        <CardContent className="prose prose-neutral max-w-none">
          <ReactMarkdown>{project.contentMd}</ReactMarkdown>
        </CardContent>
      </Card>
    </main>
  );
}
