import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopicContentEditor from "../topic-content-editor";
import MediaUpload from "../media-upload";
import MediaList from "../media-list";
type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminTopicPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  // Check login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Check admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  // Get topic
  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .select(`
      id,
      name,
      is_published,
      folder_id,
      folders (
        id,
        name
      )
    `)
    .eq("id", id)
    .single();

  if (topicError || !topic) {
    return (
      <main className="min-h-screen bg-[#faf9f6] px-6 py-12 text-[#2c2925]">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold">
            Topic not found
          </h1>

          <Link
            href="/admin"
            className="mt-4 inline-block text-sm text-[#8a6f47]"
          >
            ← Back to Admin Library
          </Link>
        </div>
      </main>
    );
  }

  // Get content
  const { data: content, error: contentError } = await supabase
    .from("topic_content")
    .select("body, points_to_remember")
    .eq("topic_id", id)
    .single();

  if (contentError || !content) {
    return (
      <main className="min-h-screen bg-[#faf9f6] px-6 py-12 text-[#2c2925]">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold">
            Topic content not found
          </h1>

          <p className="mt-2 text-sm text-[#777168]">
            This topic does not have a content record.
          </p>
        </div>
      </main>
    );
  }

  const parentFolder = Array.isArray(topic.folders)
    ? topic.folders[0]
    : topic.folders;

  return (
    <main className="min-h-screen bg-[#faf9f6] px-6 py-10 text-[#2c2925]">
      <div className="mx-auto max-w-5xl">

        {/* Breadcrumb */}
        <div className="text-sm text-[#777168]">
          <Link
            href="/admin"
            className="hover:text-[#2c2925]"
          >
            Admin Library
          </Link>

          <span className="mx-2">/</span>

          {parentFolder && (
            <>
              <Link
                href={`/admin/folder/${parentFolder.id}`}
                className="hover:text-[#2c2925]"
              >
                {parentFolder.name}
              </Link>

              <span className="mx-2">/</span>
            </>
          )}

          <span>{topic.name}</span>
        </div>

        {/* Header */}
        <div className="mt-6 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold">
              {topic.name}
            </h1>

            <p className="mt-2 text-sm text-[#777168]">
              Topic Editor
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              topic.is_published
                ? "bg-green-100 text-green-700"
                : "bg-[#f3efe8] text-[#777168]"
            }`}
          >
            {topic.is_published ? "Published" : "Unpublished"}
          </span>
        </div>

        {/* Editor */}
        <TopicContentEditor
        topicId={id}
        initialContent={
            (content.body as Record<string, unknown>) ?? {
            type: "doc",
            content: [],
            }
        }
        initialPoints={
            Array.isArray(content.points_to_remember)
            ? content.points_to_remember
            : []
        }
        />

        <section className="mt-10">
  <h2 className="mb-3 text-lg font-semibold">
    Resources
  </h2>

  <div className="space-y-4">
    <MediaUpload
      topicId={id}
      mediaType="audio"
      label="Audio"
      accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a"
    />

    <MediaUpload
      topicId={id}
      mediaType="image"
      label="Images"
      accept="image/jpeg,image/png,image/webp"
    />

    <MediaUpload
      topicId={id}
      mediaType="pdf"
      label="PDF"
      accept="application/pdf"
    />
  </div>

  <MediaList topicId={id} />
</section>

      </div>
    </main>
  );
}