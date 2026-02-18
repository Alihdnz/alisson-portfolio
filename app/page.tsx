export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { prisma } from "@/lib/prisma";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

function SectionTitle(props: { title: string; href: string; cta: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{props.title}</h2>
      </div>
      <Button asChild variant="ghost">
        <Link href={props.href}>{props.cta}</Link>
      </Button>
    </div>
  );
}

function PostCard(props: { title: string; excerpt: string; slug: string; tags?: string[] }) {
  return (
    <Link href={`/blog/${props.slug}`} className="block h-full">
      <Card className="h-full transition hover:shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">{props.title}</CardTitle>
          {props.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {props.tags.slice(0, 4).map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">{props.excerpt}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function ProjectCard(props: { title: string; summary: string; slug: string; tags?: string[] }) {
  return (
    <Link href={`/projects/${props.slug}`} className="block h-full">
      <Card className="h-full transition hover:shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">{props.title}</CardTitle>
          {props.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {props.tags.slice(0, 4).map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">{props.summary}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function HomePage() {
  const [latestPosts, latestProjects, latestProject] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.project.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.project.findFirst({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      {/* HERO */}
      <section className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Portfolio • Projects • Writing
        </p>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Alisson Amorim
        </h1>

        <p className="max-w-2xl text-base text-muted-foreground">
          Front-End Developer focused on performance, UI quality, and product-minded engineering.
          Angular/.NET in production, Next.js/React in projects, data-driven dashboards with Prisma/Postgres.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild>
            <Link href="/projects">View projects</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/blog">Read posts</Link>
          </Button>
        </div>
      </section>

      <Separator />

      {/* LATEST POSTS */}
      <section className="space-y-4">
        <SectionTitle title="Latest posts" href="/blog" cta="See all" />

        {latestPosts.length <= 2 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {latestPosts.map((p) => (
              <PostCard
                key={p.id}
                title={p.title}
                excerpt={p.excerpt}
                slug={p.slug}
                tags={[]}
              />
            ))}
          </div>
        ) : (
          <div className="relative">
            <Carousel opts={{ align: "start" }}>
              <CarouselContent>
                {latestPosts.map((p) => (
                  <CarouselItem key={p.id} className="sm:basis-1/2 lg:basis-1/3">
                    <PostCard
                      title={p.title}
                      excerpt={p.excerpt}
                      slug={p.slug}
                      tags={[]}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        )}
      </section>

      {/* FEATURED PROJECTS */}
      <section className="space-y-4">
        <SectionTitle title="Projects" href="/projects" cta="See all" />

        {latestProjects.length <= 2 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {latestProjects.map((p) => (
              <ProjectCard
                key={p.id}
                title={p.title}
                summary={p.summary}
                slug={p.slug}
                tags={p.tags ?? []}
              />
            ))}
          </div>
        ) : (
          <div className="relative">
            <Carousel opts={{ align: "start" }}>
              <CarouselContent>
                {latestProjects.map((p) => (
                  <CarouselItem key={p.id} className="sm:basis-1/2 lg:basis-1/3">
                    <ProjectCard
                      title={p.title}
                      summary={p.summary}
                      slug={p.slug}
                      tags={p.tags ?? []}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        )}
      </section>

      {/* LATEST PROJECT FEATURE */}
      {latestProject ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Latest project</h2>

          <Link href={`/projects/${latestProject.slug}`}>
            <Card className="transition hover:shadow-sm">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl">{latestProject.title}</CardTitle>
                {latestProject.tags?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {latestProject.tags.slice(0, 6).map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{latestProject.summary}</p>
              </CardContent>
            </Card>
          </Link>
        </section>
      ) : null}

      <Separator />

      {/* FOOTER */}
      <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Alisson Amorim
        </p>
        <div className="flex gap-4 text-sm">
          <a className="underline underline-offset-4" href="https://github.com/Alihdnz" target="_blank">
            GitHub
          </a>
          <a className="underline underline-offset-4" href="https://linkedin.com/in/alissondiniz" target="_blank">
            LinkedIn
          </a>
          <a className="underline underline-offset-4" href="mailto:alissondinizleo@gmail.com">
            Email
          </a>
        </div>
      </footer>
    </main>
  );
}
