"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MATERIALS = ["PLA", "ABS", "PETG", "TPU", "Resin", "Nylon", "Other"];
const COLORS = ["White", "Black", "Gray", "Red", "Blue", "Green", "Yellow", "Orange", "Other"];
const DELIVERY_METHODS = ["Pickup", "Standard Shipping", "Express Shipping"];
const ALLOWED_TYPES = [".stl", ".obj", ".3mf", ".png", ".jpg", ".pdf"];
const MAX_SIZE_MB = 25;

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
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFileError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    const ext = "." + selected.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(ext)) {
      setFileError(`File type ${ext} not allowed. Allowed: ${ALLOWED_TYPES.join(", ")}`);
      setFile(null);
      return;
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File too large. Max ${MAX_SIZE_MB}MB`);
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
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

  const uploadFile = async (supabase: ReturnType<typeof createClient>): Promise<string | null> => {
    if (!file) return null;
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase
      .storage
      .from("quote-files")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase
      .storage
      .from("quote-files")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFileError(null);

    if (!validate()) return;

    setSubmitting(true);
    setUploading(true);

    try {
      const supabase = createClient();
      const fileUrl = await uploadFile(supabase);
      setUploading(false);

      const res = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: parseInt(form.quantity),
          file_url: fileUrl,
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
    } catch (err: any) {
      setUploading(false);
      if (err.message?.includes("storage")) {
        setFileError("Failed to upload file. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
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

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Upload File <span className="text-red-500">*</span>
          </label>
          <input
            ref={fileInputRef}
            id="file"
            name="file"
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />
          {!file ? (
            <button
              type="button"
              onClick={handleUploadAreaClick}
              className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition ${
                fileError
                  ? "border-red-400 bg-red-50/50 hover:bg-red-50 dark:border-red-500 dark:bg-red-950/30"
                  : "border-zinc-300 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 dark:hover:border-zinc-500"
              }`}
            >
              <svg className="h-8 w-8 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3" />
              </svg>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Click to upload your 3D model or reference file
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {ALLOWED_TYPES.join(", ")} | Max: {MAX_SIZE_MB}MB
              </span>
            </button>
          ) : (
            <div className="relative rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-4 dark:border-zinc-600 dark:bg-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zinc-200 dark:bg-zinc-700">
                  <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{file.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)}MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setFile(null); setFileError(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="shrink-0 rounded-md p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition dark:hover:text-red-400 dark:hover:bg-red-950/30"
                  title="Remove file"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                onClick={handleUploadAreaClick}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Change file
              </button>
            </div>
          )}
          {fileError && (
            <p className="mt-2 text-xs text-red-500">{fileError}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="flex-1 rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {uploading ? "Uploading file..." : submitting ? "Submitting..." : "Submit Request"}
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
