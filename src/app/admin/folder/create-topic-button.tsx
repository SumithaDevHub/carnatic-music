"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTopic } from "./actions";

type Props = {
  folderId: string;
};

export default function CreateTopicButton({
  folderId,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setLoading(true);
    setError("");

    const result = await createTopic(folderId, name);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    setName("");
    setOpen(false);
    setLoading(false);

    router.push(`/admin/topic/${result.topicId}`);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError("");
        }}
        className="rounded-lg bg-[#2c2925] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#454039]"
      >
        + New Topic
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-[#2c2925]">
              Create Topic
            </h2>

            <p className="mt-2 text-sm text-[#777168]">
              Enter the name of the new topic.
            </p>

            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Introduction to Ragas"
              className="mt-5 w-full rounded-lg border border-[#d8d1c7] bg-white px-3 py-3 text-sm text-[#2c2925] outline-none placeholder:text-[#aaa39a] focus:border-[#8a6f47]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  handleCreate();
                }
              }}
            />

            {error && (
              <p className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setName("");
                  setError("");
                }}
                className="rounded-lg px-4 py-2 text-sm text-[#6f6961] hover:bg-[#f3efe8]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!name.trim() || loading}
                onClick={handleCreate}
                className="rounded-lg bg-[#2c2925] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Creating..." : "Create Topic"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}