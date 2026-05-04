import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-24 sm:py-32">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          3D Print Quote Portal
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Upload your 3D models, get instant pricing, and manage your print jobs all in one place. Fast, reliable, and hassle-free.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="rounded-lg bg-zinc-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-zinc-300 px-8 py-3 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Get a Quote
          </Link>
        </div>
      </div>
    </div>
  );
}
