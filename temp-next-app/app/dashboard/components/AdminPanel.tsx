"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface QuoteRequest {
  id: string;
  project_title: string;
  status: string;
  quantity: number;
  quote_amount: number | null;
  created_at: string;
  user_id: string;
}

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
    Approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
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

export default function AdminPanel() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, { status: string; quote_amount: string }>>({});

  useEffect(() => {
    async function fetchAll() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quote_requests")
        .select("id, project_title, status, quantity, quote_amount, created_at, user_id")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching admin quote requests:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      console.log("Fetched admin quote requests:", data);
      setRequests(data || []);
      const initials: Record<string, { status: string; quote_amount: string }> = {};
      for (const req of data || []) {
        initials[req.id] = {
          status: req.status,
          quote_amount: req.quote_amount != null ? String(req.quote_amount) : "",
        };
      }
      setLocalValues(initials);
      setLoading(false);
    }
    fetchAll();
  }, []);

  async function handleUpdate(id: string) {
    setSaving(id);
    const vals = localValues[id];
    const body: Record<string, unknown> = { status: vals.status };
    if (vals.quote_amount !== "") {
      body.quote_amount = parseFloat(vals.quote_amount);
    }

    const res = await fetch(`/api/quote-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const json = await res.json();
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...json.data } : r))
      );
    }
    setSaving(null);
  }

  function setLocal(id: string, field: "status" | "quote_amount", value: string) {
    setLocalValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading all requests...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">Error: {error}</p>;
  }

  if (requests.length === 0) {
    return <p className="text-sm text-zinc-500">No quote requests found.</p>;
  }

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-500">Project</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Qty</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Quote Amount</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Date</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {requests.map((req) => (
              <tr key={req.id} className="align-top">
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                  {req.project_title}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={localValues[req.id]?.status || req.status}
                    onChange={(e) => setLocal(req.id, "status", e.target.value)}
                    className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {req.quantity}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={localValues[req.id]?.quote_amount ?? ""}
                    onChange={(e) => setLocal(req.id, "quote_amount", e.target.value)}
                    placeholder="0.00"
                    className="w-24 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {formatDate(req.created_at)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleUpdate(req.id)}
                    disabled={saving === req.id}
                    className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                  >
                    {saving === req.id ? "Saving..." : "Save"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
