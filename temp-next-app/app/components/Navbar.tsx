import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          3D Print Quote Portal
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            Home
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                Dashboard
              </Link>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {user.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
