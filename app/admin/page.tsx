import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function AdminHomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <main className="p-6">
        <p>Forbidden</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <section className="space-y-2">
        <p className="text-sm text-muted-foreground">Admin</p>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage projects and posts.
        </p>
      </section>

      <Separator />

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="transition hover:shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create and publish portfolio projects.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/admin/projects">Open</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/projects/new">New</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="transition hover:shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Write articles and publish your journey.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/admin/posts">Open</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/posts/new">New</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
