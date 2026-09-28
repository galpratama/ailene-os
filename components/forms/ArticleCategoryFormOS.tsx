"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import Label from "@/components/labels/Label";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import SheetOS from "@/components/modals/SheetOS";
import type { ArticleCategoryData, ArticleCategoryStatus } from "@/apis/articles";
import {
  createArticleCategory,
  deleteArticleCategory,
  updateArticleCategory,
} from "@/lib/actions";
import { isSuccessStatus } from "@/lib/status_code";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { showErrorToast } from "@/lib/toast";

const statusOptions: AppSelectOption[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

interface ArticleCategoryFormOSProps {
  categories: ArticleCategoryData[];
  isOpen: boolean;
  onClose: () => void;
}

// Lists every category with inline create/edit; the list itself comes from the page's server fetch.
export default function ArticleCategoryFormOS({
  categories,
  isOpen,
  onClose,
}: ArticleCategoryFormOSProps) {
  const router = useRouter();

  // null = creating a new category, a number = editing that one.
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<ArticleCategoryStatus>("active");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<ArticleCategoryData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function reset() {
    setEditingId(null);
    setName("");
    setSlug("");
    setStatus("active");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function startEdit(category: ArticleCategoryData) {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setStatus(category.status);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return showErrorToast("Name is required.");

    setIsSubmitting(true);
    const payload = { name: name.trim(), slug: slug.trim() || null, status };
    const result =
      editingId === null
        ? await createArticleCategory(payload)
        : await updateArticleCategory({ ...payload, id: editingId });
    setIsSubmitting(false);

    if (!isSuccessStatus(result.status)) {
      return showErrorToast(result.message ?? "Failed to save the category.");
    }
    reset();
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    const result = await deleteArticleCategory(deleting.id);
    setIsDeleting(false);
    setDeleting(null);

    if (!isSuccessStatus(result.status)) {
      return showErrorToast(result.message ?? "Failed to delete the category.");
    }
    if (editingId === deleting.id) reset();
    router.refresh();
  }

  return (
    <SheetOS
      title="Article categories"
      description="Group articles by topic. Inactive categories are hidden from the public site."
      isOpen={isOpen}
      onClose={handleClose}
    >
      <div className="flex flex-1 flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-xl border border-gray-300 p-4 dark:border-zinc-700"
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
              {editingId === null ? "New category" : "Edit category"}
            </p>
            <AppInput
              inputId="article-category-name"
              label="Name"
              required
              characterLength={255}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI for Business"
            />
            <AppInput
              inputId="article-category-slug"
              label="Slug"
              characterLength={255}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Generated from the name if empty"
            />
            <AppSelect
              selectId="article-category-status"
              label="Status"
              required
              placeholder="Select status"
              value={status}
              onChange={(v) => setStatus(v as ArticleCategoryStatus)}
              options={statusOptions}
            />
            <div className="flex gap-2">
              {editingId !== null && (
                <AppButton type="button" variant="outline" size="sm" onClick={reset}>
                  Cancel edit
                </AppButton>
              )}
              <AppButton type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  editingId === null && <Plus size={13} />
                )}
                {editingId === null ? "Add category" : "Save category"}
              </AppButton>
            </div>
          </form>

          <div className="overflow-hidden rounded-xl border border-gray-300 dark:border-zinc-700">
            {categories.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400 dark:text-zinc-500">
                No categories yet.
              </p>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 last:border-0 dark:border-zinc-800"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
                      {category.name}
                    </p>
                    <p className="truncate text-xs text-gray-400">/{category.slug}</p>
                  </div>
                  <Label variant={category.status === "active" ? "hijau" : "gray"}>
                    {category.status === "active" ? "Active" : "Inactive"}
                  </Label>
                  <AppButton
                    variant="ghost"
                    size="iconSm"
                    title="Edit category"
                    onClick={() => startEdit(category)}
                  >
                    <Pencil size={13} />
                  </AppButton>
                  <AppButton
                    variant="ghost"
                    size="iconSm"
                    title="Delete category"
                    onClick={() => setDeleting(category)}
                  >
                    <Trash2 size={13} />
                  </AppButton>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AlertConfirmationOS
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete category?"
        message={`"${deleting?.name ?? ""}" will be removed. A category that still has articles cannot be deleted — set it inactive instead.`}
        confirmLabel="Delete"
        destructive
        isPending={isDeleting}
      />
    </SheetOS>
  );
}
