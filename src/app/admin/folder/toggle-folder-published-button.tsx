"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleFolderPublished } from "./actions";

export default function ToggleFolderPublishedButton({
  folderId,
  isPublished,
}: {
  folderId: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);

    const result = await toggleFolderPublished(
      folderId,
      !isPublished
    );

    if (!result.success) {
      alert(result.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className="block w-full px-4 py-2 text-left text-sm hover:bg-[#f3efe8] disabled:opacity-50"
    >
      {loading
        ? "Updating..."
        : isPublished
          ? "Unpublish"
          : "Publish"}
    </button>
  );
}