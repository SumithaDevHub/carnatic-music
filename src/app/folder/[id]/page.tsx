import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type FolderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function FolderPage({
  params,
}: FolderPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // Get the current folder
  const { data: folder, error: folderError } = await supabase
    .from("folders")
    .select("id, name, parent_id")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (folderError || !folder) {
    notFound();
  }

  // Get child folders
  const { data: childFolders, error: childFoldersError } =
    await supabase
      .from("folders")
      .select("id, name, order_index")
      .eq("parent_id", id)
      .eq("is_published", true)
      .order("name", { ascending: true });

  // Get topics directly inside this folder
  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("id, name, order_index")
    .eq("folder_id", id)
    .eq("is_published", true)
    .order("name", { ascending: true });

  if (childFoldersError || topicsError) {
    return (
      <main className="min-h-screen bg-[#faf9f6] px-6 py-12 text-[#2c2925]">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-semibold">
            Unable to load this folder
          </h1>

          <p className="mt-4 text-red-600">
            Something went wrong while loading the contents.
          </p>
        </div>
      </main>
    );
  }

  const hasContent =
    (childFolders?.length ?? 0) > 0 ||
    (topics?.length ?? 0) > 0;

  return (
    <main className="min-h-screen bg-[#faf9f6] px-6 py-12 text-[#2c2925]">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <Link
          href={folder.parent_id ? `/folder/${folder.parent_id}` : "/browse"}
          className="text-sm text-[#8a6f47] hover:underline"
        >
          ← Back
        </Link>

        {/* Header */}
        <div className="mt-10">
          <p className="text-sm uppercase tracking-[0.3em] text-[#8a6f47]">
            Library
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            {folder.name}
          </h1>
        </div>

        {/* Child folders */}
        {childFolders && childFolders.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold">
              Folders
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {childFolders.map((childFolder) => (
                <Link
                  key={childFolder.id}
                  href={`/folder/${childFolder.id}`}
                  className="group rounded-2xl border border-[#e7e1d8] bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="text-3xl">📁</div>

                  <h3 className="mt-4 text-lg font-semibold">
                    {childFolder.name}
                  </h3>

                  <p className="mt-2 text-sm text-[#777168]">
                    Open folder
                  </p>
                </Link>
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
                <Link
                  key={topic.id}
                  href={`/topic/${topic.id}`}
                  className="flex items-center justify-between rounded-xl border border-[#e7e1d8] bg-white px-6 py-5 transition hover:shadow-md"
                >
                  <div>
                    <h3 className="font-medium">
                      {topic.name}
                    </h3>

                    <p className="mt-1 text-sm text-[#777168]">
                      Open topic
                    </p>
                  </div>

                  <span className="text-[#8a6f47]">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!hasContent && (
          <div className="mt-12 rounded-2xl border border-dashed border-[#d8d0c5] bg-white/50 p-12 text-center">
            <div className="text-4xl">📂</div>

            <h2 className="mt-4 text-lg font-semibold">
              This folder is empty
            </h2>

            <p className="mt-2 text-sm text-[#777168]">
              There is no published content here yet.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}