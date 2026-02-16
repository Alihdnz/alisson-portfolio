"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ProjectFormValues = {
  title: string;
  slug: string;
  summary: string;
  contentMd: string;
  coverImageUrl?: string | null;
  tagsCsv: string; // "tag1, tag2"
  published: boolean;
};

function toTags(csv: string): string[] {
  return csv
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function ProjectForm(props: {
  mode: "create" | "edit";
  initialValues?: Partial<ProjectFormValues>;
  projectId?: string;
}) {
  const router = useRouter();

  const initial: ProjectFormValues = useMemo(
    () => ({
      title: props.initialValues?.title ?? "",
      slug: props.initialValues?.slug ?? "",
      summary: props.initialValues?.summary ?? "",
      contentMd: props.initialValues?.contentMd ?? "",
      coverImageUrl: props.initialValues?.coverImageUrl ?? "",
      tagsCsv: props.initialValues?.tagsCsv ?? "",
      published: props.initialValues?.published ?? false,
    }),
    [props.initialValues]
  );

  const [values, setValues] = useState<ProjectFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tagsPreview = useMemo(() => toTags(values.tagsCsv), [values.tagsCsv]);

  const onAutoSlug = () => {
    setValues((v) => ({ ...v, slug: slugify(v.title) }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: values.title,
      slug: values.slug,
      summary: values.summary,
      contentMd: values.contentMd,
      coverImageUrl: values.coverImageUrl?.toString().trim() || null,
      tags: toTags(values.tagsCsv),
      published: values.published,
    };

    try {
      const url =
        props.mode === "create"
          ? "/api/admin/projects"
          : `/api/admin/projects/${props.projectId}`;

      const method = props.mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Request failed: ${res.status}`);
      }

      router.push("/admin/projects");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {props.mode === "create" ? "New project" : "Edit project"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-3">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
              placeholder="Ecom Insight"
              required
            />
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium">Slug</label>
              <Button type="button" variant="outline" size="sm" onClick={onAutoSlug}>
                Auto-generate
              </Button>
            </div>

            <Input
              value={values.slug}
              onChange={(e) => setValues((v) => ({ ...v, slug: e.target.value }))}
              placeholder="ecom-insight"
              required
            />

            <p className="text-xs text-muted-foreground">
              Used in URL: <span className="font-mono">/projects/{values.slug || "slug"}</span>
            </p>
          </div>

          <div className="grid gap-3">
            <label className="text-sm font-medium">Summary</label>
            <Textarea
              value={values.summary}
              onChange={(e) => setValues((v) => ({ ...v, summary: e.target.value }))}
              placeholder="Short description shown in the projects list."
              required
            />
          </div>

          <div className="grid gap-3">
            <label className="text-sm font-medium">Cover image URL (optional)</label>
            <Input
              value={values.coverImageUrl ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, coverImageUrl: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>

          <div className="grid gap-3">
            <label className="text-sm font-medium">Tags (comma separated)</label>
            <Input
              value={values.tagsCsv}
              onChange={(e) => setValues((v) => ({ ...v, tagsCsv: e.target.value }))}
              placeholder="nextjs, prisma, postgres, auth"
            />

            {tagsPreview.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tagsPreview.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              id="published"
              type="checkbox"
              checked={values.published}
              onChange={(e) => setValues((v) => ({ ...v, published: e.target.checked }))}
              className="h-4 w-4"
            />
            <label htmlFor="published" className="text-sm">
              Published
            </label>
          </div>

          <div className="grid gap-3">
            <label className="text-sm font-medium">Content (Markdown)</label>
            <Textarea
              value={values.contentMd}
              onChange={(e) => setValues((v) => ({ ...v, contentMd: e.target.value }))}
              placeholder={"## What it solves\n\nWrite your project story here..."}
              className="min-h-[240px]"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/projects")}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
