import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostForm } from "../../postForm";
import { DeletePostButton } from "./delete-button";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <main className="p-6">
        <p>Forbidden</p>
      </main>
    );
  }

  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) {
    return (
      <main className="p-6">
        <p>Post not found.</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl space-y-3">
      <div className="flex justify-end">
        <DeletePostButton id={post.id} />
      </div>

      <PostForm
        mode="edit"
        postId={post.id}
        initialValues={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          contentMd: post.contentMd,
          coverImageUrl: post.coverImageUrl ?? "",
          published: post.published,
        }}
      />
    </main>
  );
}
