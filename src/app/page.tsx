import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#2c2925]">

      {/* Hero */}
      <section className="relative flex min-h-[78vh] items-center justify-center overflow-hidden px-6">
        
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute left-10 top-20 hidden text-6xl text-[#e7e1d8] sm:block">
          ♪
        </div>

        <div className="pointer-events-none absolute bottom-20 right-10 hidden text-7xl text-[#e7e1d8] sm:block">
          ♫
        </div>

        <div className="relative mx-auto max-w-4xl text-center">

          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-[#d8cbb8] bg-[#f3efe8] text-3xl text-[#8a6f47] shadow-sm">
            ♪
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[#8a6f47]">
            Carnatic Music
          </p>

          <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-7xl">
            Learning Portal
          </h1>

          <div className="mx-auto mt-7 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-[#c9b89d]" />
            <span className="text-sm text-[#8a6f47]">
              A Digital Library of Notes &amp; Learnings
            </span>
            <span className="h-px w-12 bg-[#c9b89d]" />
          </div>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#6f6961] sm:text-xl">
            A place to learn, listen, practice, and explore
            the beauty of Carnatic music.
          </p>

          <Link
            href="/browse"
            className="mt-10 inline-flex items-center rounded-full bg-[#2c2925] px-8 py-4 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#454039] hover:shadow-md"
          >
            Explore the Library
            <span className="ml-3 text-lg">→</span>
          </Link>

          <p className="mt-5 text-xs text-[#aaa39a]">
            Learn at your own pace
          </p>
        </div>
      </section>

      {/* Our Note */}
      <section className="border-y border-[#e7e1d8] bg-[#f3efe8] px-6 py-20">
        <div className="mx-auto max-w-3xl">

          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8a6f47]">
              A Note from Us
            </p>

            <div className="mx-auto mt-7 h-px w-16 bg-[#b59a70]" />
          </div>

          <div className="mt-10 space-y-7 text-sm leading-7 text-[#6f6961] sm:text-base">

            <p>
              This portal is a digital version of the notes and learnings
              that have been a part of our musical journey.
            </p>

            <p>
              We are deeply grateful to our parents for introducing us to
              Carnatic music and for every evening they spent dropping us
              off and picking us up from our classes. We are equally grateful
              to our mentor,{" "}
              <span className="font-medium text-[#2c2925]">
                Mrs. Vidya Rani Ma'am
              </span>
              , our Carnatic Music Teacher, for guiding us through this
              beautiful journey.
            </p>

            <p>
              We are siblings, Kishore and Sumitha. What began as a
              co-curricular activity became something much more meaningful
              to us. On our way to and from classes, we would sing our
              lessons and sometimes rehearse them in our own little tunes.
            </p>

            <p>
              Over the years, music has taught us to appreciate the art in
              everything we see, hear, breathe, and feel. This portal is a
              small attempt to preserve those notes and learnings in a
              digital space, and to keep that journey close to us.
            </p>

          </div>

          <div className="mt-10 text-center text-2xl text-[#8a6f47]">
            ♪
          </div>

        </div>
      </section>


      {/* Footer */}
      <footer className="px-6 py-10 text-center">

        <p className="text-sm font-medium text-[#5f5952]">
          Carnatic Music Learning Portal
        </p>

        <p className="mt-3 text-xs text-[#aaa39a]">
          Designed &amp; developed by{" "}
          <span className="text-[#777168]">
            Kishore Sundararajan
          </span>{" "}
          and{" "}
          <span className="text-[#777168]">
            Sumitha Sundararajan
          </span>
        </p>

        <p className="mt-2 text-xs text-[#aaa39a]">
          Built with curiosity, learning, and a love for music.
        </p>

        <div className="mt-5">
          <Link
            href="/admin/login"
            className="text-xs text-[#aaa39a] transition hover:text-[#5f5952]"
          >
            Admin Login
          </Link>
        </div>

      </footer>

    </main>
  );
}