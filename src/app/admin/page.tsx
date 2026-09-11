import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLibraryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  const { data: folders, error } = await supabase
    .from("folders")
    .select("id, name, order_index, is_published")
    .is("parent_id", null)
    .order("name", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen bg-[#faf9f6] px-6 py-12 text-[#2c2925]">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-semibold">
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
      <div className="mx-auto max-w-6xl">

        <header className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#8a6f47]">
              Administration
            </p>

            <h1 className="mt-3 text-4xl font-semibold">
              Learning Library
            </h1>

            <p className="mt-3 text-[#777168]">
              Manage your Carnatic learning content.
            </p>
          </div>

          <Link
            href="/"
            className="text-sm text-[#8a6f47] hover:underline"
          >
            View Portal →
          </Link>
        </header>

        <section className="mt-12">

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Library
            </h2>

            <button
              type="button"
              className="rounded-lg bg-[#2c2925] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#454039]"
            >
              + New Folder
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {folders && folders.length > 0 ? (
              folders.map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center justify-between rounded-xl border border-[#e7e1d8] bg-white px-6 py-5"
                >
                  <Link
                    href={`/admin/folder/${folder.id}`}
                    className="flex items-center gap-4"
                  >
                    <span className="text-3xl">
                      📁
                    </span>

                    <div>
                      <h3 className="font-medium">
                        {folder.name}
                      </h3>

                      <p className="mt-1 text-xs text-[#777168]">
                        {folder.is_published
                          ? "Published"
                          : "Unpublished"}
                      </p>
                    </div>
                  </Link>

                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-lg text-[#777168] hover:bg-[#f3efe8]"
                  >
                    ⋮
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d8d0c5] bg-white p-12 text-center">
                <div className="text-4xl">
                  📂
                </div>

                <h2 className="mt-4 text-lg font-semibold">
                  No folders yet
                </h2>

                <p className="mt-2 text-sm text-[#777168]">
                  Create your first folder to get started.
                </p>
              </div>
            )}
          </div>

        </section>

        <footer className="mt-16 border-t border-[#e7e1d8] pt-6">
          <Link
            href="/admin/analytics"
            className="text-sm text-[#8a6f47] hover:underline"
          >
            View Analytics →
          </Link>
        </footer>

      </div>
    </main>
  );
}