import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = { params: { slug: string } };

export default async function BlogDetailPage({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });

  if (!post || !post.published) return notFound();

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl">{post.title}</CardTitle>

          {post.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardHeader>

        <CardContent className="prose prose-neutral max-w-none">
          <ReactMarkdown>{post.contentMd}</ReactMarkdown>
        </CardContent>
      </Card>
    </main>
  );
}
