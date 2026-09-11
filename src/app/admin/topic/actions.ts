"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveTopicContent(
  topicId: string,
  body: Record<string, unknown>,
  pointsToRemember: string[]
) {
  const supabase = await createClient();

  // Check login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  // Check admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return {
      success: false,
      error: "You are not authorized to perform this action.",
    };
  }

  // Make sure the topic exists
  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .select("id")
    .eq("id", topicId)
    .single();

  if (topicError || !topic) {
    return {
      success: false,
      error: "Topic not found.",
    };
  }

  // Update content
  const { error } = await supabase
    .from("topic_content")
    .update({
      body,
      points_to_remember: pointsToRemember,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("topic_id", topicId);

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
  };
}

export async function uploadTopicMedia(
  topicId: string,
  file: File,
  mediaType: "audio" | "image" | "pdf"
) {
  const supabase = await createClient();

  // 1. Check login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  // 2. Check admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return {
      success: false,
      error: "You are not authorized to perform this action.",
    };
  }

  // 3. Make sure topic exists
  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .select("id")
    .eq("id", topicId)
    .single();

  if (topicError || !topic) {
    return {
      success: false,
      error: "Topic not found.",
    };
  }

  // 4. Validate file
  if (!file || file.size === 0) {
    return {
      success: false,
      error: "Please select a file.",
    };
  }

  const allowedTypes = {
    audio: [
      "audio/mpeg",
      "audio/wav",
      "audio/x-wav",
      "audio/mp4",
      "audio/x-m4a",
    ],
    image: [
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
    pdf: [
      "application/pdf",
    ],
  };

  const maxSizes = {
    audio: 20 * 1024 * 1024,
    image: 5 * 1024 * 1024,
    pdf: 20 * 1024 * 1024,
  };

  if (!allowedTypes[mediaType].includes(file.type)) {
    return {
      success: false,
      error: `Invalid ${mediaType} file type.`,
    };
  }

  if (file.size > maxSizes[mediaType]) {
    return {
      success: false,
      error: `File is too large. Maximum size for ${mediaType} is ${
        maxSizes[mediaType] / (1024 * 1024)
      } MB.`,
    };
  }

  // 5. Get file extension
  const originalName = file.name;

  const extension =
    originalName.split(".").pop()?.toLowerCase() ?? "";

  // 6. Generate unique storage path
  const uniqueName = `${crypto.randomUUID()}.${extension}`;

  const filePath = `${topicId}/${uniqueName}`;

  // 7. Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from(mediaType === "image" ? "images" : mediaType === "pdf" ? "pdfs" : "audio")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return {
      success: false,
      error: uploadError.message,
    };
  }

  const bucket =
    mediaType === "image"
      ? "images"
      : mediaType === "pdf"
        ? "pdfs"
        : "audio";

  // 8. Get next order index
  const { data: lastMedia } = await supabase
    .from("topic_media")
    .select("order_index")
    .eq("topic_id", topicId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrderIndex =
    lastMedia?.order_index !== undefined
      ? lastMedia.order_index + 1
      : 0;

  // 9. Create database record
  const { data: media, error: mediaError } = await supabase
    .from("topic_media")
    .insert({
      topic_id: topicId,
      media_type: mediaType,
      file_path: filePath,
      file_name: originalName,
      mime_type: file.type,
      file_size: file.size,
      order_index: nextOrderIndex,
      allow_download: false,
      uploaded_by: user.id,
    })
    .select("id")
    .single();

  // 10. Clean up Storage if DB insert failed
  if (mediaError || !media) {
    await supabase.storage
      .from(bucket)
      .remove([filePath]);

    return {
      success: false,
      error:
        mediaError?.message ??
        "Could not save media information.",
    };
  }

  revalidatePath(`/admin/topic/${topicId}`);
  revalidatePath(`/topic/${topicId}`);

  return {
    success: true,
    mediaId: media.id,
  };
}