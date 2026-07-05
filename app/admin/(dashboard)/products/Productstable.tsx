"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Trash2,
  Download,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Pencil,
  AlertTriangle,
  X,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { deleteProducts } from "./Productsaction";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  club_name?: string | null;
  nation_slug?: string | null;
  stock_count?: number | null;
  status?: string | null;
  images?: string[] | null;
};

const PAGE_SIZE = 10;

const statusStyles: Record<string, string> = {
  available: "bg-green-50 text-green-700",
  sold_out: "bg-red-50 text-red-600",
  coming_soon: "bg-amber-50 text-amber-700",
};

function statusLabel(status?: string | null) {
  if (!status) return "Available";
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function stockLevel(count: number) {
  if (count <= 0) return { label: "Critical", color: "text-red-500", bar: "bg-red-500" };
  if (count < 20) return { label: "Low", color: "text-amber-500", bar: "bg-amber-500" };
  if (count < 60) return { label: "Medium", color: "text-blue-500", bar: "bg-blue-500" };
  return { label: "High", color: "text-green-500", bar: "bg-green-500" };
}

// Derived, human-readable SKU since the products table has no sku column.
// Format: first 3 letters of club/name + slug suffix, e.g. CHL-HM-24
function deriveSku(product: Product) {
  const base = (product.club_name ?? product.name).slice(0, 3).toUpperCase();
  const suffix = product.slug.split("-").slice(-2).join("-").toUpperCase();
  return `${base}-${suffix}`;
}

export default function ProductsTable({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string[] | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.club_name ?? "").toLowerCase().includes(q) ||
        deriveSku(p).toLowerCase().includes(q);
      const matchesStatus =
        !statusFilter.length || statusFilter.includes(p.status ?? "available");
      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const allOnPageSelected =
    pageItems.length > 0 && pageItems.every((p) => selected.has(p.id));

  function toggleSelectAll() {
    const next = new Set(selected);
    if (allOnPageSelected) {
      pageItems.forEach((p) => next.delete(p.id));
    } else {
      pageItems.forEach((p) => next.add(p.id));
    }
    setSelected(next);
  }

  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function handleDelete(ids: string[]) {
    if (ids.length === 0) return;
    setDeleteTarget(ids);
  }

  async function confirmDelete() {
    const ids = deleteTarget;
    if (!ids || ids.length === 0) return;

    setDeleting(true);
    const result = await deleteProducts(ids);
    setDeleting(false);
    setOpenMenu(null);
    setDeleteTarget(null);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`Deleted ${ids.length} product${ids.length > 1 ? "s" : ""}`);
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }

  function handleExport() {
    const rows = selected.size
      ? filtered.filter((p) => selected.has(p.id))
      : filtered;

    if (rows.length === 0) {
      toast.error("No products to export");
      return;
    }

    const header = ["Name", "SKU", "Club", "Price", "Stock", "Status"];
    const csvRows = rows.map((p) => [
      p.name,
      deriveSku(p),
      p.club_name ?? "",
      p.price,
      p.stock_count ?? 0,
      statusLabel(p.status),
    ]);

    const csv = [header, ...csvRows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-export.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${rows.length} product${rows.length > 1 ? "s" : ""}`);
  }

  function toggleStatusFilter(status: string) {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
    setPage(1);
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Manage Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Update, track, and manage your premium jersey stock level.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center justify-center gap-2 bg-blue-950 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-blue-800 transition-colors shrink-0"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search jerseys, clubs, or SKUs..."
            className="w-full bg-white border border-gray-200 rounded-md pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-700 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDelete(Array.from(selected))}
            disabled={selected.size === 0 || deleting}
            className="flex items-center gap-2 border border-gray-200 bg-white px-3.5 py-2.5 rounded-md text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600"
          >
            <Trash2 size={15} />
            Delete{selected.size > 0 ? ` (${selected.size})` : ""}
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-gray-200 bg-white px-3.5 py-2.5 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download size={15} />
            Export
          </button>

          <div className="relative">
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className="relative flex items-center justify-center border border-gray-200 bg-white w-10 h-10 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Filter"
            >
              <SlidersHorizontal size={15} />
              {statusFilter.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-blue-700 text-white text-[10px] font-bold">
                  {statusFilter.length}
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg p-3 z-20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Status
                  </p>
                  {statusFilter.length > 0 && (
                    <button
                      onClick={() => {
                        setStatusFilter([]);
                        setPage(1);
                      }}
                      className="text-xs font-medium text-blue-700 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {["available", "sold_out", "coming_soon"].map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={statusFilter.includes(status)}
                        onChange={() => toggleStatusFilter(status)}
                        className="accent-blue-700"
                      />
                      {statusLabel(status)}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {statusFilter.length > 0 && (
        <div className="flex items-center gap-2 mb-4 -mt-2">
          <span className="text-xs text-gray-400">Filtering by:</span>
          {statusFilter.map((status) => (
            <span
              key={status}
              className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full"
            >
              {statusLabel(status)}
              <button
                onClick={() => toggleStatusFilter(status)}
                aria-label={`Remove ${statusLabel(status)} filter`}
                className="hover:text-blue-900"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAll}
                    className="accent-blue-700"
                  />
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                  Product
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                  Club
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                  Price
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                  Stock Level
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((product) => {
                const count = product.stock_count ?? 0;
                const level = stockLevel(count);
                const barWidth = Math.min(100, (count / 150) * 100);
                const image =
                  product.images?.[0] ??
                  "https://images.unsplash.com/photo-1551958219-acbc630e2914?w=100&q=80";

                return (
                  <tr
                    key={product.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="accent-blue-700"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-md overflow-hidden bg-gray-100 shrink-0">
                          <Image
                            src={image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            SKU: {deriveSku(product)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-blue-700 font-medium">
                      {product.club_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">
                      {formatNaira(product.price)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-700">{count} units</span>
                        <span className={`text-xs font-semibold ${level.color}`}>
                          {level.label}
                        </span>
                      </div>
                      <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${level.bar} rounded-full transition-all`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          statusStyles[product.status ?? "available"] ??
                          statusStyles.available
                        }`}
                      >
                        {statusLabel(product.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === product.id ? null : product.id)
                        }
                        className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors"
                        aria-label="More actions"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenu === product.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenu(null)}
                          />
                          <div className="absolute right-4 top-10 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Pencil size={14} />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete([product.id])}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}

              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                    No products found{search ? ` matching "${search}"` : ""}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
          <p>
            Showing{" "}
            {filtered.length === 0
              ? 0
              : (currentPage - 1) * PAGE_SIZE + 1}
            -{Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length} products
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (n) =>
                  n === 1 ||
                  n === totalPages ||
                  Math.abs(n - currentPage) <= 1,
              )
              .reduce<number[]>((acc, n) => {
                if (acc.length && n - acc[acc.length - 1] > 1) acc.push(-1);
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === -1 ? (
                  <span key={`gap-${i}`} className="px-1 text-gray-300">
                    …
                  </span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                      n === currentPage
                        ? "bg-blue-900 text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {n}
                  </button>
                ),
              )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={22} className="text-red-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-900">
                  Delete {deleteTarget.length > 1
                    ? `${deleteTarget.length} products`
                    : "product"}
                  ?
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  This action can&apos;t be undone. This will permanently
                  delete{" "}
                  {deleteTarget.length > 1
                    ? "these products"
                    : "this product"}{" "}
                  from your store.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-md text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}