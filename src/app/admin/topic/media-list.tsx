import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import DeleteMediaButton from "./delete-media-button";

type Props = {
  topicId: string;
};

export default async function MediaList({
  topicId,
}: Props) {
  const supabase = await createClient();

  const { data: media } = await supabase
    .from("topic_media")
    .select(`
      id,
      media_type,
      file_path,
      file_name,
      caption,
      allow_download,
      order_index
    `)
    .eq("topic_id", topicId)
    .order("order_index");

  if (!media || media.length === 0) {
    return (
      <p className="mt-4 text-sm text-[#777168]">
        No resources uploaded yet.
      </p>
    );
  }

  const adminSupabase = createAdminClient();

  const mediaWithUrls = await Promise.all(
    media.map(async (item) => {
      const bucket =
        item.media_type === "audio"
          ? "audio"
          : item.media_type === "image"
            ? "images"
            : "pdfs";

      const { data } = await adminSupabase.storage
        .from(bucket)
        .createSignedUrl(item.file_path, 60 * 60);

      return {
        ...item,
        url: data?.signedUrl ?? null,
      };
    })
  );

  return (
    <div className="mt-5 space-y-4">
      {mediaWithUrls.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-[#e7e1d8] bg-white p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#2c2925]">
                {item.file_name}
              </p>

              <p className="mt-1 text-xs uppercase tracking-wide text-[#999188]">
                {item.media_type}
              </p>
            </div>

            <DeleteMediaButton
              mediaId={item.id}
              topicId={topicId}
            />
          </div>

          {item.url && item.media_type === "audio" && (
            <audio
              controls
              className="mt-4 w-full"
              src={item.url}
            />
          )}

          {item.url && item.media_type === "image" && (
            <img
              src={item.url}
              alt={item.file_name}
              className="mt-4 max-h-80 rounded-lg object-contain"
            />
          )}

          {item.url && item.media_type === "pdf" && (
            <iframe
              src={item.url}
              title={item.file_name}
              className="mt-4 h-[500px] w-full rounded-lg border"
            />
          )}
        </div>
      ))}
    </div>
  );
}