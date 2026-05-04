import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
    </div>
  );
}
