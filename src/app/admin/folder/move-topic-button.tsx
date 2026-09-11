"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { moveTopic } from "./actions";

type FolderOption = {
  id: string;
  name: string;
  parent_id: string | null;
};

type Props = {
  topicId: string;
  topicName: string;
  folders: FolderOption[];
};

export default function MoveTopicButton({
  topicId,
  topicName,
  folders,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleMove() {
    setLoading(true);
    setError("");

    const result = await moveTopic(topicId, destination);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    setOpen(false);
    setLoading(false);
    setDestination("");

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
        className="block w-full px-4 py-2 text-left text-sm text-[#2c2925] hover:bg-[#f3efe8]"
      >
        Move
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-[#2c2925]">
              Move Topic
            </h2>

            <p className="mt-2 text-sm text-[#777168]">
              Move <strong>{topicName}</strong> to:
            </p>

            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-5 w-full rounded-lg border border-[#d8d1c7] bg-white px-3 py-3 text-sm text-[#2c2925] outline-none focus:border-[#8a6f47]"
            >
              <option value="">Select destination</option>

              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>

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
                  setError("");
                }}
                className="rounded-lg px-4 py-2 text-sm text-[#6f6961] hover:bg-[#f3efe8]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!destination || loading}
                onClick={handleMove}
                className="rounded-lg bg-[#2c2925] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Moving..." : "Move"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}