import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import RenameFolderButton from "@/app/admin/folder/rename-folder-button";
import CreateSubfolderButton from "@/app/admin/folder/create-subfolder-button";
import DeleteFolderButton from "@/app/admin/folder/delete-folder-button";
import ToggleFolderPublishedButton from "@/app/admin/folder/toggle-folder-published-button";
import MoveFolderButton from "@/app/admin/folder/move-folder-button";

import CreateTopicButton from "@/app/admin/folder/create-topic-button";
import RenameTopicButton from "@/app/admin/folder/rename-topic-button";
import DeleteTopicButton from "@/app/admin/folder/delete-topic-button";
import ToggleTopicPublishedButton from "@/app/admin/folder/toggle-topic-published-button";
import MoveTopicButton from "@/app/admin/folder/move-topic-button";

type AdminFolderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminFolderPage({
  params,
}: AdminFolderPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Check admin permission
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  // Get current folder
  const { data: folder, error: folderError } = await supabase
    .from("folders")
    .select("id, name, parent_id, is_published")
    .eq("id", id)
    .single();

  if (folderError || !folder) {
    notFound();
  }

  // Get child folders
  const { data: childFolders, error: childFoldersError } =
    await supabase
      .from("folders")
      .select(
        "id, name, order_index, is_published"
      )
      .eq("parent_id", id)
      .order("name", { ascending: true });

  const { data: allFolders, error: allFoldersError } = await supabase
  .from("folders")
  .select("id, name, parent_id")
  .order("name", { ascending: true });

  // Get topics
  const { data: topics, error: topicsError } =
    await supabase
      .from("topics")
      .select(
        "id, name, order_index, is_published"
      )
      .eq("folder_id", id)
      .order("name", { ascending: true });

  if (childFoldersError || topicsError) {
    return (
      <main className="min-h-screen bg-[#faf9f6] px-6 py-12 text-[#2c2925]">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold">
            Unable to load folder
          </h1>

          <p className="mt-4 text-red-600">
            Something went wrong while loading this folder.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] px-6 py-12 text-[#2c2925]">
      <div className="mx-auto max-w-6xl">

        {/* Breadcrumb */}
        <div className="text-sm text-[#777168]">
          <Link
            href="/admin"
            className="hover:underline"
          >
            Admin Library
          </Link>

          <span className="mx-2">/</span>

          <span>{folder.name}</span>
        </div>

        {/* Header */}
        <header className="mt-8 flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#8a6f47]">
              Administration
            </p>

            <h1 className="mt-3 text-4xl font-semibold">
              {folder.name}
            </h1>

            <p className="mt-3 text-[#777168]">
              {folder.is_published
                ? "Published folder"
                : "Unpublished folder"}
            </p>
          </div>

          <div className="flex gap-3">
            <CreateSubfolderButton parentId={folder.id} />
            <CreateTopicButton folderId={folder.id} />                 
          </div>
        </header>

        {/* Folders */}
        {childFolders && childFolders.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-semibold">
              Folders
            </h2>

            <div className="mt-5 space-y-3">
              {childFolders.map((childFolder) => (
                <div
                  key={childFolder.id}
                  className="flex items-center justify-between rounded-xl border border-[#e7e1d8] bg-white px-6 py-5"
                >
                  <Link
                    href={`/admin/folder/${childFolder.id}`}
                    className="flex items-center gap-4"
                  >
                    <span className="text-3xl">
                      📁
                    </span>

                    <div>
                      <h3 className="font-medium">
                        {childFolder.name}
                      </h3>

                      <p className="mt-1 text-xs text-[#777168]">
                        {childFolder.is_published
                          ? "Published"
                          : "Unpublished"}
                      </p>
                    </div>
                  </Link>

                  <div className="relative">
  <details>
    <summary className="cursor-pointer list-none rounded-lg px-3 py-2 text-xl text-[#777168] hover:bg-[#f3efe8]">
      ⋮
    </summary>

    <div className="absolute right-0 top-12 z-10 w-40 rounded-lg border border-[#e7e1d8] bg-white py-1 shadow-lg">
      <RenameFolderButton
        folderId={childFolder.id}
        currentName={childFolder.name}
      />

      <DeleteFolderButton
        folderId={childFolder.id}
        folderName={childFolder.name}
        />

      <ToggleFolderPublishedButton
        folderId={childFolder.id}
        isPublished={childFolder.is_published}
        />

      <MoveFolderButton
        folderId={childFolder.id}
        folderName={childFolder.name}
        folders={allFolders ?? []}
      />
        
    </div>
  </details>
</div>
                </div>
              ))}
            </div>
          </section>
        )}

{/* Topics */}
{topics && topics.length > 0 && (
  <section className="mt-12">
    <h2 className="text-lg font-semibold">
      Topics
    </h2>

    <div className="mt-5 space-y-3">
      {topics.map((topic) => (
        <div
          key={topic.id}
          className="flex items-center justify-between rounded-xl border border-[#e7e1d8] bg-white px-6 py-5"
        >
          <Link
            href={`/admin/topic/${topic.id}`}
            className="flex items-center gap-4"
          >
            <span className="text-3xl">
              📄
            </span>

            <div>
              <h3 className="font-medium">
                {topic.name}
              </h3>

              <p className="mt-1 text-xs text-[#777168]">
                {topic.is_published
                  ? "Published"
                  : "Unpublished"}
              </p>
            </div>
          </Link>

          <div className="relative">
            <details>
              <summary className="cursor-pointer list-none rounded-lg px-3 py-2 text-xl text-[#777168] hover:bg-[#f3efe8]">
                ⋮
              </summary>

              <div className="absolute right-0 top-12 z-10 w-48 rounded-lg border border-[#e7e1d8] bg-white py-1 shadow-lg">

                <RenameTopicButton
                  topicId={topic.id}
                  currentName={topic.name}
                />

                <ToggleTopicPublishedButton
                  topicId={topic.id}
                  isPublished={topic.is_published}
                />

                <MoveTopicButton
                  topicId={topic.id}
                  topicName={topic.name}
                  folders={allFolders ?? []}
                />

                <DeleteTopicButton
                  topicId={topic.id}
                  topicName={topic.name}
                />

              </div>
            </details>
          </div>
        </div>
      ))}
    </div>
  </section>
)}

        {/* Empty state */}
        {childFolders?.length === 0 &&
          topics?.length === 0 && (
            <div className="mt-12 rounded-2xl border border-dashed border-[#d8d0c5] bg-white p-12 text-center">
              <div className="text-4xl">
                📂
              </div>

              <h2 className="mt-4 text-lg font-semibold">
                This folder is empty
              </h2>

              <p className="mt-2 text-sm text-[#777168]">
                Create a folder or topic to get started.
              </p>
            </div>
          )}

      </div>
    </main>
  );
}