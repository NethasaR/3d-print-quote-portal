"use client";

import { useState } from "react";
import AdminPanel from "./AdminPanel";

interface Request {
  id: string;
  project_title: string;
  status: string;
  quantity: number;
  created_at: string;
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
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    Approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    Completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  };
  const color = colors[status] || "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}

export default function DashboardTabs({ requests, isAdmin }: { requests: Request[] | null; isAdmin: boolean }) {
  const [activeTab, setActiveTab] = useState<"my" | "admin">("my");

  return (
    <>
      <div className="mt-10 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("my")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "my"
              ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          My Requests
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "admin"
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            All Requests (Admin)
          </button>
        )}
      </div>

      {activeTab === "my" && (
        <div className="mt-6">
          {!requests || requests.length === 0 ? (
            <div className="rounded-md border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
              <p className="text-zinc-500">No requests yet</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
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
      )}

      {isAdmin && activeTab === "admin" && <AdminPanel />}
    </>
  );
}
