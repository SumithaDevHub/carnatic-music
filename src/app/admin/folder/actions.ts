"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function renameFolder(
  folderId: string,
  newName: string
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
      error: "You are not authorized to perform this action.",
    };
  }

  const trimmedName = newName.trim();

  if (!trimmedName) {
    return {
      success: false,
      error: "Folder name cannot be empty.",
    };
  }

  const { error } = await supabase
    .from("folders")
    .update({
      name: trimmedName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", folderId);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/folder/${folderId}`);

  return {
    success: true,
  };
}

export async function createSubfolder(
  parentId: string,
  name: string
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
      error: "You are not authorized to perform this action.",
    };
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      success: false,
      error: "Folder name cannot be empty.",
    };
  }

  // Find the next position inside this folder
  const { data: existingFolders } = await supabase
    .from("folders")
    .select("order_index")
    .eq("parent_id", parentId)
    .order("order_index", {
      ascending: false,
    })
    .limit(1);

  const nextOrderIndex =
    existingFolders && existingFolders.length > 0
      ? existingFolders[0].order_index + 1
      : 0;

  const { error } = await supabase
    .from("folders")
    .insert({
      name: trimmedName,
      parent_id: parentId,
      order_index: nextOrderIndex,
      is_published: false,
    });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/folder/${parentId}`);

  return {
    success: true,
  };
}

export async function deleteFolder(folderId: string) {
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
      error: "You are not authorized to perform this action.",
    };
  }

  // Check for child folders
  const { count: childFolderCount, error: childFolderError } =
    await supabase
      .from("folders")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("parent_id", folderId);

  if (childFolderError) {
    return {
      success: false,
      error: childFolderError.message,
    };
  }

  if ((childFolderCount ?? 0) > 0) {
    return {
      success: false,
      error:
        "This folder cannot be deleted because it contains subfolders.",
    };
  }

  // Check for topics
  const { count: topicCount, error: topicError } =
    await supabase
      .from("topics")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("folder_id", folderId);

  if (topicError) {
    return {
      success: false,
      error: topicError.message,
    };
  }

  if ((topicCount ?? 0) > 0) {
    return {
      success: false,
      error:
        "This folder cannot be deleted because it contains topics.",
    };
  }

  // Delete the empty folder
  const { error: deleteError } = await supabase
    .from("folders")
    .delete()
    .eq("id", folderId);

  if (deleteError) {
    return {
      success: false,
      error: deleteError.message,
    };
  }

  revalidatePath("/admin");

  return {
    success: true,
  };
}

export async function toggleFolderPublished(
  folderId: string,
  isPublished: boolean
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
      error: "You are not authorized to perform this action.",
    };
  }

  const { error } = await supabase
    .from("folders")
    .update({
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", folderId);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/folder/${folderId}`);
  revalidatePath("/browse");

  return {
    success: true,
  };
}

export async function moveFolder(
  folderId: string,
  newParentId: string | null
) {
  const supabase = await createClient();

  // 1. Check whether the user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  // 2. Check whether the user is an admin
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

  // 3. Get the folder being moved
  const { data: folder, error: folderError } = await supabase
    .from("folders")
    .select("id, parent_id")
    .eq("id", folderId)
    .single();

  if (folderError || !folder) {
    return {
      success: false,
      error: "Folder not found.",
    };
  }

  // 4. Don't allow moving a folder into itself
  if (newParentId === folderId) {
    return {
      success: false,
      error: "A folder cannot be moved inside itself.",
    };
  }

  // 5. If destination is Root, no descendant check is needed
  if (newParentId !== null) {
    // Make sure destination exists
    const { data: destination, error: destinationError } =
      await supabase
        .from("folders")
        .select("id, parent_id")
        .eq("id", newParentId)
        .single();

    if (destinationError || !destination) {
      return {
        success: false,
        error: "Destination folder not found.",
      };
    }

    // 6. Walk up from destination to make sure
    //    it isn't inside the folder being moved.
    let currentParentId: string | null = destination.id;

    while (currentParentId !== null) {
      if (currentParentId === folderId) {
        return {
          success: false,
          error:
            "A folder cannot be moved inside one of its own subfolders.",
        };
      }

      const { data: parentFolder, error: parentError } =
        await supabase
          .from("folders")
          .select("parent_id")
          .eq("id", currentParentId)
          .single();

      if (parentError) {
        return {
          success: false,
          error: "Could not validate the destination folder.",
        };
      }

      currentParentId = parentFolder?.parent_id ?? null;
    }
  }

  // 7. Change the parent
  const { error: updateError } = await supabase
    .from("folders")
    .update({
      parent_id: newParentId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", folderId);

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    };
  }

  // 8. Refresh relevant admin pages
  revalidatePath("/admin");
  revalidatePath(`/admin/folder/${folderId}`);

  if (folder.parent_id) {
    revalidatePath(`/admin/folder/${folder.parent_id}`);
  }

  if (newParentId) {
    revalidatePath(`/admin/folder/${newParentId}`);
  }

  return {
    success: true,
  };
}

export async function createTopic(
  folderId: string,
  name: string
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

  // 3. Validate name
  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      success: false,
      error: "Topic name cannot be empty.",
    };
  }

  // 4. Make sure the folder exists
  const { data: folder, error: folderError } = await supabase
    .from("folders")
    .select("id")
    .eq("id", folderId)
    .single();

  if (folderError || !folder) {
    return {
      success: false,
      error: "Folder not found.",
    };
  }

  // 5. Check for duplicate topic name in this folder
  const { data: existingTopic } = await supabase
    .from("topics")
    .select("id")
    .eq("folder_id", folderId)
    .ilike("name", trimmedName)
    .maybeSingle();

  if (existingTopic) {
    return {
      success: false,
      error: "A topic with this name already exists in this folder.",
    };
  }

  // 6. Find the next order index
  const { data: lastTopic } = await supabase
    .from("topics")
    .select("order_index")
    .eq("folder_id", folderId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrderIndex =
    lastTopic?.order_index !== undefined
      ? lastTopic.order_index + 1
      : 0;

  // 7. Create topic
  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .insert({
      folder_id: folderId,
      name: trimmedName,
      order_index: nextOrderIndex,
      is_published: false,
    })
    .select("id")
    .single();

  if (topicError || !topic) {
    return {
      success: false,
      error: topicError?.message ?? "Could not create topic.",
    };
  }

  // 8. Create empty content record
  const { error: contentError } = await supabase
    .from("topic_content")
    .insert({
      topic_id: topic.id,
      body: {
        type: "doc",
        content: [],
      },
      points_to_remember: [],
      created_by: user.id,
      updated_by: user.id,
    });

  if (contentError) {
    // Remove the topic if content creation failed
    await supabase
      .from("topics")
      .delete()
      .eq("id", topic.id);

    return {
      success: false,
      error: "Topic was not created successfully.",
    };
  }

  // 9. Refresh folder page
  revalidatePath(`/admin/folder/${folderId}`);

  return {
    success: true,
    topicId: topic.id,
  };
}

export async function renameTopic(
  topicId: string,
  newName: string
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

  const trimmedName = newName.trim();

  if (!trimmedName) {
    return {
      success: false,
      error: "Topic name cannot be empty.",
    };
  }

  const { data: topic } = await supabase
    .from("topics")
    .select("id, folder_id")
    .eq("id", topicId)
    .single();

  if (!topic) {
    return {
      success: false,
      error: "Topic not found.",
    };
  }

  const { data: existingTopic } = await supabase
    .from("topics")
    .select("id")
    .eq("folder_id", topic.folder_id)
    .neq("id", topicId)
    .ilike("name", trimmedName)
    .maybeSingle();

  if (existingTopic) {
    return {
      success: false,
      error: "A topic with this name already exists in this folder.",
    };
  }

  const { error } = await supabase
    .from("topics")
    .update({
      name: trimmedName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", topicId);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath(`/admin/folder/${topic.folder_id}`);
  revalidatePath(`/admin/topic/${topicId}`);
  revalidatePath(`/topic/${topicId}`);

  return {
    success: true,
  };
}


export async function toggleTopicPublished(
  topicId: string,
  isPublished: boolean
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

  const { data: topic } = await supabase
    .from("topics")
    .select("id, folder_id")
    .eq("id", topicId)
    .single();

  if (!topic) {
    return {
      success: false,
      error: "Topic not found.",
    };
  }

  const { error } = await supabase
    .from("topics")
    .update({
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", topicId);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath(`/admin/folder/${topic.folder_id}`);
  revalidatePath(`/admin/topic/${topicId}`);
  revalidatePath(`/topic/${topicId}`);

  return {
    success: true,
  };
}


export async function moveTopic(
  topicId: string,
  newFolderId: string
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

  const { data: topic } = await supabase
    .from("topics")
    .select("id, name, folder_id")
    .eq("id", topicId)
    .single();

  if (!topic) {
    return {
      success: false,
      error: "Topic not found.",
    };
  }

  const { data: destinationFolder } = await supabase
    .from("folders")
    .select("id")
    .eq("id", newFolderId)
    .single();

  if (!destinationFolder) {
    return {
      success: false,
      error: "Destination folder not found.",
    };
  }

  if (topic.folder_id === newFolderId) {
    return {
      success: false,
      error: "Topic is already in this folder.",
    };
  }

  const { data: existingTopic } = await supabase
    .from("topics")
    .select("id")
    .eq("folder_id", newFolderId)
    .ilike("name", topic.name)
    .maybeSingle();

  if (existingTopic) {
    return {
      success: false,
      error: "A topic with this name already exists in the destination folder.",
    };
  }

  const { data: lastTopic } = await supabase
    .from("topics")
    .select("order_index")
    .eq("folder_id", newFolderId)
    .order("order_index", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  const nextOrderIndex =
    lastTopic?.order_index !== undefined
      ? lastTopic.order_index + 1
      : 0;

  const { error } = await supabase
    .from("topics")
    .update({
      folder_id: newFolderId,
      order_index: nextOrderIndex,
      updated_at: new Date().toISOString(),
    })
    .eq("id", topicId);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath(`/admin/folder/${topic.folder_id}`);
  revalidatePath(`/admin/folder/${newFolderId}`);
  revalidatePath(`/admin/topic/${topicId}`);
  revalidatePath(`/topic/${topicId}`);

  return {
    success: true,
  };
}


export async function deleteTopic(topicId: string) {
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
    .select("id, folder_id")
    .eq("id", topicId)
    .single();

  if (!topic) {
    return {
      success: false,
      error: "Topic not found.",
    };
  }

  // Get media records before deleting their database metadata
  const { data: media, error: mediaFetchError } = await supabase
    .from("topic_media")
    .select("media_type, file_path")
    .eq("topic_id", topicId);

  if (mediaFetchError) {
    return {
      success: false,
      error: mediaFetchError.message,
    };
  }

  // Delete actual files from Supabase Storage
  for (const item of media ?? []) {
    const bucket =
      item.media_type === "audio"
        ? "audio"
        : item.media_type === "image"
          ? "images"
          : "pdfs";

    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([item.file_path]);

    if (storageError) {
      return {
        success: false,
        error: `Could not delete media file: ${storageError.message}`,
      };
    }
  }

  // Delete content
  const { error: contentError } = await supabase
    .from("topic_content")
    .delete()
    .eq("topic_id", topicId);

  if (contentError) {
    return {
      success: false,
      error: contentError.message,
    };
  }

  // Delete media metadata
  const { error: mediaError } = await supabase
    .from("topic_media")
    .delete()
    .eq("topic_id", topicId);

  if (mediaError) {
    return {
      success: false,
      error: mediaError.message,
    };
  }

  // Delete topic
  const { error: topicError } = await supabase
    .from("topics")
    .delete()
    .eq("id", topicId);

  if (topicError) {
    return {
      success: false,
      error: topicError.message,
    };
  }

  revalidatePath(`/admin/folder/${topic.folder_id}`);
  revalidatePath("/admin");

  return {
    success: true,
  };
}