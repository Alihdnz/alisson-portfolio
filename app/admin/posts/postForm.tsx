"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PostFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  contentMd: string;
  coverImageUrl?: string | null;
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

export function PostForm(props: {
  mode: "create" | "edit";
  postId?: string;
  initialValues?: Partial<PostFormValues>;
}) {
  const router = useRouter();

  const initial: PostFormValues = useMemo(
    () => ({
      title: props.initialValues?.title ?? "",
      slug: props.initialValues?.slug ?? "",
      excerpt: props.initialValues?.excerpt ?? "",
      contentMd: props.initialValues?.contentMd ?? "",
      coverImageUrl: props.initialValues?.coverImageUrl ?? "",
      published: props.initialValues?.published ?? false,
    }),
    [props.initialValues]
  );

  const [values, setValues] = useState<PostFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onAutoSlug = () => setValues((v) => ({ ...v, slug: slugify(v.title) }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      contentMd: values.contentMd,
      coverImageUrl: values.coverImageUrl?.toString().trim() || null,
      published: values.published,
    };

    try {
      const url =
        props.mode === "create"
          ? "/api/admin/posts"
          : `/api/admin/posts/${props.postId}`;

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

      router.push("/admin/posts");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.mode === "create" ? "New post" : "Edit post"}</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-3">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
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
              required
            />

            <p className="text-xs text-muted-foreground">
              URL: <span className="font-mono">/blog/{values.slug || "slug"}</span>
            </p>
          </div>

          <div className="grid gap-3">
            <label className="text-sm font-medium">Excerpt</label>
            <Textarea
              value={values.excerpt}
              onChange={(e) => setValues((v) => ({ ...v, excerpt: e.target.value }))}
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
              className="min-h-[240px]"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/posts")}
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
