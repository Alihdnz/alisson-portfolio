import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "../../ProjectForm";
import { DeleteProjectButton } from "./delete-button";

type Props = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;

  if (!id) {
    return (
      <main className="p-6">
        <p>Invalid project id.</p>
      </main>
    );
  }

  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <main className="p-6">
        <p>Forbidden</p>
      </main>
    );
  }

  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) {
    return (
      <main className="p-6">
        <p>Project not found.</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl space-y-3">
      <div className="flex justify-end">
        <DeleteProjectButton id={project.id} />
      </div>

      <ProjectForm
        mode="edit"
        projectId={project.id}
        initialValues={{
          title: project.title,
          slug: project.slug,
          summary: project.summary,
          contentMd: project.contentMd,
          coverImageUrl: project.coverImageUrl ?? "",
          tagsCsv: (project.tags ?? []).join(", "),
          published: project.published,
        }}
      />
    </main>
  );
}
