import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminProjectsPage() {
  const session = await getServerSession(authOptions);

  // middleware já protege, mas mantém correto no server
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <main className="p-6">
        <p>Forbidden</p>
      </main>
    );
  }

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Button asChild>
          <Link href="/admin/projects/new">New project</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No projects yet. Create your first one.
            </p>
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{p.title}</div>
                      {p.published ? (
                        <Badge>Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-mono">/{p.slug}</span>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {p.summary}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {p.slug ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/projects/${p.slug}`} target="_blank">
                          View
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        View
                      </Button>
                    )}

                    <Button asChild size="sm">
                      <Link href={`/admin/projects/${p.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
