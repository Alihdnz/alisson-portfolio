import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PostForm } from "../PostForm";

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <main className="p-6">
        <p>Forbidden</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl">
      <PostForm mode="create" />
    </main>
  );
}
