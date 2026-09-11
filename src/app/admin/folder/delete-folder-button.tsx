"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteFolder } from "./actions";

export default function DeleteFolderButton({
  folderId,
  folderName,
}: {
  folderId: string;
  folderName: string;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setError("");
    setLoading(true);

    const result = await deleteFolder(folderId);

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
          setError("");
          setOpen(true);
        }}
        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-[#fdf2f2]"
      >
        Delete
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <h2 className="text-xl font-semibold text-[#2c2925]">
              Delete Folder?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#777168]">
              Are you sure you want to delete{" "}
              <span className="font-medium text-[#2c2925]">
                "{folderName}"
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-red-600">
              Only empty folders can be deleted.
            </p>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
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
                onClick={handleDelete}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}