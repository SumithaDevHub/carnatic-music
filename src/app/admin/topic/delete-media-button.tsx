"use client";

import { useState } from "react";
import { deleteTopicMedia } from "./media-actions";

type Props = {
  mediaId: string;
  topicId: string;
};

export default function DeleteMediaButton({
  mediaId,
  topicId,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to remove this resource?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    const result = await deleteTopicMedia(
      mediaId,
      topicId
    );

    if (!result.success) {
      alert(result.error ?? "Could not remove resource.");
      setLoading(false);
      return;
    }

    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      {loading ? "Removing..." : "Remove"}
    </button>
  );
}