import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    Completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  };
  const color = colors[status] || "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}

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

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Quote Requests</h2>
          <Link
            href="/request"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            New Request
          </Link>
        </div>

        {!requests || requests.length === 0 ? (
          <div className="mt-6 rounded-md border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="text-zinc-500">No requests yet</p>
            <Link href="/request" className="mt-2 inline-block text-sm text-zinc-900 underline dark:text-zinc-100">
              Submit your first quote request
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{req.project_title}</h3>
                  <StatusBadge status={req.status} />
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-zinc-500">
                  <span>Qty: {req.quantity}</span>
                  <span>{formatDate(req.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
