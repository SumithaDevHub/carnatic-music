"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { renameFolder } from "./actions";

export default function RenameFolderButton({
  folderId,
  currentName,
}: {
  folderId: string;
  currentName: string;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRename() {
    setError("");
    setLoading(true);

    const result = await renameFolder(folderId, name);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);

    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setName(currentName);
          setError("");
          setOpen(true);
        }}
        className="block w-full px-4 py-2 text-left text-sm hover:bg-[#f3efe8]"
      >
        Rename
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <h2 className="text-xl font-semibold text-[#2c2925]">
              Rename Folder
            </h2>

            <p className="mt-2 text-sm text-[#777168]">
              Enter a new name for this folder.
            </p>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              className="mt-5 w-full rounded-lg border border-[#ddd6cc] bg-white px-4 py-3 text-[#2c2925] outline-none focus:border-[#8a6f47]"
              autoFocus
            />

            {error && (
              <p className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-[#ddd6cc] px-4 py-2.5 text-sm font-medium text-[#2c2925] hover:bg-[#f3efe8]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRename}
                disabled={loading}
                className="rounded-lg bg-[#2c2925] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#454039] disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}