"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MATERIALS = ["PLA", "ABS", "PETG", "TPU", "Resin", "Nylon", "Other"];
const COLORS = ["White", "Black", "Gray", "Red", "Blue", "Green", "Yellow", "Orange", "Other"];
const DELIVERY_METHODS = ["Pickup", "Standard Shipping", "Express Shipping"];

export default function RequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    project_title: "",
    description: "",
    material: "",
    color: "",
    quantity: "1",
    deadline: "",
    delivery_method: "",
    phone: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.project_title.trim()) errors.project_title = "Project title is required";
    if (!form.description.trim()) errors.description = "Description is required";
    if (parseInt(form.quantity) <= 0) errors.quantity = "Quantity must be greater than 0";
    if (!form.delivery_method) errors.delivery_method = "Delivery method is required";
    if (!form.phone.trim()) errors.phone = "Phone number is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validate()) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: parseInt(form.quantity),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to submit request");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-2xl items-center justify-center px-4 py-24">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-4 py-12 sm:py-24">
      <h1 className="text-2xl font-bold">Request a Quote</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Fill out the form below and we will get back to you with a quote.
      </p>

      {error && (
        <div className="mt-6 w-full rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 w-full rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
          Quote request submitted successfully! Redirecting to dashboard...
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 w-full space-y-5">
        <div>
          <label htmlFor="project_title" className="mb-1.5 block text-sm font-medium">
            Project Title <span className="text-red-500">*</span>
          </label>
          <input
            id="project_title"
            name="project_title"
            type="text"
            required
            value={form.project_title}
            onChange={handleChange}
            className={`w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:ring-1 ${
              fieldErrors.project_title
                ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
            }`}
            placeholder="e.g. Custom Enclosure Box"
          />
          {fieldErrors.project_title && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.project_title}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={form.description}
            onChange={handleChange}
            className={`w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:ring-1 ${
              fieldErrors.description
                ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
            }`}
            placeholder="Describe your project requirements..."
          />
          {fieldErrors.description && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.description}</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="material" className="mb-1.5 block text-sm font-medium">
              Material
            </label>
            <select
              id="material"
              name="material"
              value={form.material}
              onChange={handleChange}
              className="w-full rounded-md border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
            >
              <option value="">Select material</option>
              {MATERIALS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="color" className="mb-1.5 block text-sm font-medium">
              Color
            </label>
            <select
              id="color"
              name="color"
              value={form.color}
              onChange={handleChange}
              className="w-full rounded-md border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
            >
              <option value="">Select color</option>
              {COLORS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              required
              value={form.quantity}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:ring-1 ${
                fieldErrors.quantity
                  ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                  : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
              }`}
            />
            {fieldErrors.quantity && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.quantity}</p>
            )}
          </div>

          <div>
            <label htmlFor="deadline" className="mb-1.5 block text-sm font-medium">
              Deadline
            </label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
              className="w-full rounded-md border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
            />
          </div>
        </div>

        <div>
          <label htmlFor="delivery_method" className="mb-1.5 block text-sm font-medium">
            Delivery Method <span className="text-red-500">*</span>
          </label>
          <select
            id="delivery_method"
            name="delivery_method"
            required
            value={form.delivery_method}
            onChange={handleChange}
            className={`w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:ring-1 ${
              fieldErrors.delivery_method
                ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
            }`}
          >
            <option value="">Select delivery method</option>
            {DELIVERY_METHODS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {fieldErrors.delivery_method && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.delivery_method}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            value={form.phone}
            onChange={handleChange}
            className={`w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:ring-1 ${
              fieldErrors.phone
                ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
            }`}
            placeholder="+1 (555) 000-0000"
          />
          {fieldErrors.phone && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
          <Link
            href="/dashboard"
            className="flex items-center justify-center rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
