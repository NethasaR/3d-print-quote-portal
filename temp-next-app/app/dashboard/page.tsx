import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardTabs from "./components/DashboardTabs";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: requests } = await supabase
    .from("quote_requests")
    .select("id, project_title, status, quantity, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex max-w-6xl flex-col px-4 py-24">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        Welcome, <span className="font-medium text-zinc-900 dark:text-zinc-100">{profile?.full_name || user.email}</span>
      </p>
      <div className="mt-6 rounded-md border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Your Profile</h2>
        <div className="mt-4 space-y-2 text-sm">
          <p><span className="font-medium">Email:</span> {user.email}</p>
          <p><span className="font-medium">Role:</span> {profile?.role || "customer"}</p>
          <p><span className="font-medium">Member since:</span> {new Date(profile?.created_at || user.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-bold">Quote Requests</h2>
        <Link
          href="/request"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          New Request
        </Link>
      </div>

      <DashboardTabs requests={requests} />
    </div>
  );
}
