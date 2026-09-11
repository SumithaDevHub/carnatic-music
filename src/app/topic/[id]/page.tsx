import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ReactNode } from "react";

type TopicPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type TiptapMark = {
  type?: string;
};

type TiptapNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: TiptapMark[];
  content?: TiptapNode[];
};

function renderInlineContent(nodes?: TiptapNode[]): ReactNode {
  if (!nodes) return null;

  return nodes.map((node, index) => {
    let element: ReactNode = node.text ?? "";

    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === "bold") {
          element = <strong>{element}</strong>;
        }

        if (mark.type === "italic") {
          element = <em>{element}</em>;
        }
      }
    }

    return <span key={index}>{element}</span>;
  });
}

function renderBlock(block: TiptapNode, index: number): ReactNode {
  // Paragraph
  if (block.type === "paragraph") {
    return (
      <p key={index}>
        {renderInlineContent(block.content)}
      </p>
    );
  }

  // Heading
  if (block.type === "heading") {
    return (
      <h2
        key={index}
        className="pt-4 text-2xl font-semibold text-[#2c2925]"
      >
        {renderInlineContent(block.content)}
      </h2>
    );
  }

  // Bullet / ordered lists
  if (
    block.type === "bulletList" ||
    block.type === "orderedList"
  ) {
    const ListTag =
      block.type === "orderedList" ? "ol" : "ul";

    return (
      <ListTag
        key={index}
        className={
          block.type === "orderedList"
            ? "list-decimal space-y-2 pl-6"
            : "list-disc space-y-2 pl-6"
        }
      >
        {block.content?.map((item, itemIndex) => (
          <li key={itemIndex}>
            {item.content?.map(
              (child, childIndex) => {
                if (child.type === "paragraph") {
                  return (
                    <span key={childIndex}>
                      {renderInlineContent(child.content)}
                    </span>
                  );
                }

                if (
                  child.type === "bulletList" ||
                  child.type === "orderedList"
                ) {
                  return renderBlock(
                    child,
                    childIndex
                  );
                }

                return null;
              }
            )}
          </li>
        ))}
      </ListTag>
    );
  }

  return null;
}

export default async function TopicPage({
  params,
}: TopicPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // Get published topic
  const { data: topic, error: topicError } =
    await supabase
      .from("topics")
      .select(`
        id,
        name,
        folder_id,
        folders (
          id,
          name,
          parent_id
        )
      `)
      .eq("id", id)
      .eq("is_published", true)
      .single();

  if (topicError || !topic) {
    notFound();
  }

  // Get topic content
  const { data: content } = await supabase
    .from("topic_content")
    .select("body, points_to_remember")
    .eq("topic_id", id)
    .single();

  // Get media metadata
  const { data: media } = await supabase
    .from("topic_media")
    .select(`
      id,
      media_type,
      file_path,
      file_name,
      caption,
      order_index,
      allow_download
    `)
    .eq("topic_id", id)
    .order("order_index");

  /*
   * Storage buckets are private.
   * Create temporary signed URLs on the server.
   */
  const adminSupabase = createAdminClient();

  const mediaWithUrls = await Promise.all(
    (media ?? []).map(async (item) => {
      const bucket =
        item.media_type === "audio"
          ? "audio"
          : item.media_type === "image"
            ? "images"
            : "pdfs";

      const { data } =
        await adminSupabase.storage
          .from(bucket)
          .createSignedUrl(
            item.file_path,
            60 * 60
          );

      return {
        ...item,
        url: data?.signedUrl ?? null,
      };
    })
  );

  const folder = Array.isArray(topic.folders)
    ? topic.folders[0]
    : topic.folders;

  const body = content?.body as
    | TiptapNode
    | null
    | undefined;

  return (
    <main className="min-h-screen bg-[#faf9f6] px-6 py-12 text-[#2c2925]">
      <div className="mx-auto max-w-6xl">

        {/* Breadcrumb */}
        <div className="text-sm text-[#777168]">
          <Link
            href="/browse"
            className="hover:underline"
          >
            Library
          </Link>

          <span className="mx-2">/</span>

          {folder && (
            <>
              <Link
                href={`/folder/${folder.id}`}
                className="hover:underline"
              >
                {folder.name}
              </Link>

              <span className="mx-2">/</span>
            </>
          )}

          <span>{topic.name}</span>
        </div>

        {/* Topic title */}
        <header className="mt-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#8a6f47]">
            Topic
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            {topic.name}
          </h1>
        </header>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">

          {/* Main content */}
          <article className="rounded-2xl border border-[#e7e1d8] bg-white p-8">
            <h2 className="text-xl font-semibold">
              Learning Material
            </h2>

            {!content && (
              <p className="mt-6 text-[#777168]">
                Content has not been added yet.
              </p>
            )}

            {content && (
              <div className="mt-6">

                {body &&
                  Array.isArray(body.content) && (
                    <div className="space-y-4 text-[15px] leading-7 text-[#4f4a44]">
                      {body.content.map(
                        (block, index) =>
                          renderBlock(
                            block,
                            index
                          )
                      )}
                    </div>
                  )}

              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">

            {/* Points to Remember */}
            <section className="rounded-2xl border border-[#e7e1d8] bg-white p-6">
              <h2 className="font-semibold">
                Points to Remember
              </h2>

              {Array.isArray(
                content?.points_to_remember
              ) &&
              content.points_to_remember.length > 0 ? (
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5f5952]">
                  {content.points_to_remember.map(
                    (
                      point: string,
                      index: number
                    ) => (
                      <li
                        key={index}
                        className="flex gap-3"
                      >
                        <span className="text-[#8a6f47]">
                          •
                        </span>

                        <span>{point}</span>
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-[#777168]">
                  No points added yet.
                </p>
              )}
            </section>

            {/* Resources */}
            <section className="rounded-2xl border border-[#e7e1d8] bg-white p-6">
              <h2 className="font-semibold">
                Resources
              </h2>

              {mediaWithUrls.length > 0 ? (
                <div className="mt-4 space-y-5">

                  {mediaWithUrls.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-[#e7e1d8] p-4"
                    >
                      <p className="text-sm font-medium">
                        {item.file_name}
                      </p>

                      {item.caption && (
                        <p className="mt-1 text-xs text-[#777168]">
                          {item.caption}
                        </p>
                      )}

                      {/* Audio */}
                      {item.media_type ===
                        "audio" &&
                        item.url && (
                          <audio
                            controls
                            className="mt-4 w-full"
                            src={item.url}
                          />
                        )}

                      {/* Image */}
                      {item.media_type ===
                        "image" &&
                        item.url && (
                          <img
                            src={item.url}
                            alt={
                              item.caption ??
                              item.file_name
                            }
                            className="mt-4 w-full rounded-lg object-contain"
                          />
                        )}

                      {/* PDF */}
                      {item.media_type ===
                        "pdf" &&
                        item.url && (
                          <iframe
                            src={item.url}
                            title={item.file_name}
                            className="mt-4 h-[500px] w-full rounded-lg border"
                          />
                        )}

                      {/* Download */}
                      {item.allow_download &&
                        item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-block text-sm text-[#8a6f47] hover:underline"
                          >
                            Open / Download
                          </a>
                        )}
                    </div>
                  ))}

                </div>
              ) : (
                <p className="mt-4 text-sm text-[#777168]">
                  No resources added yet.
                </p>
              )}
            </section>

          </aside>
        </div>
      </div>
    </main>
  );
}