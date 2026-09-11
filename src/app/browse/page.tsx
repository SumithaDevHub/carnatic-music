import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function BrowsePage() {
  const supabase = await createClient();

  const { data: folders, error } = await supabase
    .from("folders")
    .select("id, name, order_index")
    .is("parent_id", null)
    .eq("is_published", true)
    .order("name", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-semibold">
            Unable to load library
          </h1>

          <p className="mt-4 text-red-600">
            {error.message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] px-6 py-12 text-[#2c2925]">
      <div className="mx-auto max-w-5xl">

        <Link
          href="/"
          className="text-sm text-[#8a6f47] hover:underline"
        >
          ← Home
        </Link>

        <div className="mt-12">
          <p className="text-sm uppercase tracking-[0.3em] text-[#8a6f47]">
            Library
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            Explore the Library
          </h1>

          <p className="mt-4 text-[#6f6961]">
            Choose a section to begin learning.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {folders.map((folder) => (
            <Link
              key={folder.id}
              href={`/folder/${folder.id}`}
              className="group rounded-2xl border border-[#e7e1d8] bg-white p-7 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-3xl">📁</div>

              <h2 className="mt-5 text-xl font-semibold">
                {folder.name}
              </h2>

              <p className="mt-2 text-sm text-[#777168]">
                Explore this section
              </p>

              <span className="mt-6 inline-block text-sm text-[#8a6f47]">
                Open →
              </span>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}