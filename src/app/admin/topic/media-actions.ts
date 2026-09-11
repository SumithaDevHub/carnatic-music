"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveMediaMetadata({
  topicId,
  mediaType,
  filePath,
  fileName,
  mimeType,
  fileSize,
}: {
  topicId: string;
  mediaType: "audio" | "image" | "pdf";
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return {
      success: false,
      error: "You are not authorized.",
    };
  }

  const { data: topic } = await supabase
    .from("topics")
    .select("id")
    .eq("id", topicId)
    .single();

  if (!topic) {
    return {
      success: false,
      error: "Topic not found.",
    };
  }

  const { data: existingMedia } = await supabase
    .from("topic_media")
    .select("order_index")
    .eq("topic_id", topicId)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextOrder =
    existingMedia && existingMedia.length > 0
      ? existingMedia[0].order_index + 1
      : 0;

  const { data, error } = await supabase
    .from("topic_media")
    .insert({
      topic_id: topicId,
      media_type: mediaType,
      file_path: filePath,
      file_name: fileName,
      mime_type: mimeType,
      file_size: fileSize,
      order_index: nextOrder,
      allow_download: false,
      uploaded_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath(`/admin/topic/${topicId}`);
  revalidatePath(`/topic/${topicId}`);

  return {
    success: true,
    mediaId: data.id,
  };
}


export async function deleteTopicMedia(
  mediaId: string,
  topicId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return {
      success: false,
      error: "You are not authorized.",
    };
  }

  const { data: media } = await supabase
    .from("topic_media")
    .select(`
      id,
      media_type,
      file_path
    `)
    .eq("id", mediaId)
    .eq("topic_id", topicId)
    .single();

  if (!media) {
    return {
      success: false,
      error: "Media not found.",
    };
  }

  const bucket =
    media.media_type === "audio"
      ? "audio"
      : media.media_type === "image"
        ? "images"
        : "pdfs";

  const { error: storageError } = await supabase.storage
    .from(bucket)
    .remove([media.file_path]);

  if (storageError) {
    return {
      success: false,
      error: storageError.message,
    };
  }

  const { error: dbError } = await supabase
    .from("topic_media")
    .delete()
    .eq("id", mediaId)
    .eq("topic_id", topicId);

  if (dbError) {
    return {
      success: false,
      error: dbError.message,
    };
  }

  revalidatePath(`/admin/topic/${topicId}`);
  revalidatePath(`/topic/${topicId}`);

  return {
    success: true,
  };
}