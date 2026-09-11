"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveMediaMetadata } from "./media-actions";

type Props = {
  topicId: string;
  mediaType: "audio" | "image" | "pdf";
  label: string;
  accept: string;
  multiple?: boolean;
};

const MAX_SIZES = {
  audio: 20 * 1024 * 1024,
  image: 5 * 1024 * 1024,
  pdf: 20 * 1024 * 1024,
};

export default function MediaUpload({
  topicId,
  mediaType,
  label,
  accept,
  multiple = true,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    const supabase = createClient();

    let uploadedCount = 0;

    for (const file of files) {
      if (file.size > MAX_SIZES[mediaType]) {
        setError(
          `${file.name} is too large. Maximum size is ${
            mediaType === "image" ? "5 MB" : "20 MB"
          }.`
        );
        continue;
      }

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "";

      const uniqueName = `${crypto.randomUUID()}.${extension}`;

      const filePath = `${topicId}/${uniqueName}`;

      const bucket =
        mediaType === "audio"
          ? "audio"
          : mediaType === "image"
            ? "images"
            : "pdfs";

      // Upload directly from browser to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        setError(
          `Could not upload ${file.name}: ${uploadError.message}`
        );
        continue;
      }

      // Save metadata in database
      const result = await saveMediaMetadata({
        topicId,
        mediaType,
        filePath,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });

      if (!result.success) {
        // Remove Storage file if DB insert failed
        await supabase.storage
          .from(bucket)
          .remove([filePath]);

        setError(
          `Could not save ${file.name}: ${
            result.error ?? "Unknown error"
          }`
        );

        continue;
      }

      uploadedCount++;
    }

    if (uploadedCount > 0) {
      setMessage(
        `${uploadedCount} ${
          uploadedCount === 1 ? "file" : "files"
        } uploaded successfully.`
      );
    }

    setLoading(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    // Refresh server components
    window.location.reload();
  }

  return (
    <div className="rounded-xl border border-[#e7e1d8] bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[#2c2925]">
            {label}
          </h3>

          <p className="mt-1 text-xs text-[#999188]">
            {mediaType === "audio" &&
              "MP3, WAV or M4A · Maximum 20 MB"}

            {mediaType === "image" &&
              "JPG, PNG or WEBP · Maximum 5 MB"}

            {mediaType === "pdf" &&
              "PDF · Maximum 20 MB"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="rounded-lg bg-[#2c2925] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#454039] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />

      {message && (
        <p className="mt-3 text-sm text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}