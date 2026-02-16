"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteProjectButton({ id }: { id: string }) {
  const router = useRouter();

  const onDelete = async () => {
    const ok = window.confirm("Delete this project? This cannot be undone.");
    if (!ok) return;

    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Failed to delete");
      return;
    }

    router.push("/admin/projects");
    router.refresh();
  };

  return (
    <Button variant="destructive" onClick={onDelete}>
      Delete
    </Button>
  );
}
