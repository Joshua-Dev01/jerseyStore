"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
// import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  Download,
  // Plus,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { updateOrderStatus } from "./Ordersaction";

type OrderItem = {
  id: string;
  product_id: string;
  product_name: string;
  size: string | null;
  kit_type: string | null;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  status: string;
  payment_reference: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  created_at: string;
  order_items: OrderItem[];
};

const PAGE_SIZE = 10;

const STATUS_TABS = [
  { label: "All Orders", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  paid: "bg-blue-50 text-blue-700",
  processing: "bg-orange-50 text-orange-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
};

function orderCode(order: Order) {
  return `JS-${order.id.slice(0, 5).toUpperCase()}`;
}

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [page, setPage] = useState(1);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [draftStatus, setDraftStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesTab = statusTab === "all" || o.status === statusTab;
      const matchesSearch =
        !q ||
        orderCode(o).toLowerCase().includes(q) ||
        o.full_name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.order_items.some((i) => i.product_name.toLowerCase().includes(q));
      return matchesTab && matchesSearch;
    });
  }, [orders, search, statusTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function openDrawer(order: Order) {
    setActiveOrder(order);
    setDraftStatus(order.status);
  }

  function closeDrawer() {
    setActiveOrder(null);
  }

  async function handleSaveStatus() {
    if (!activeOrder || draftStatus === activeOrder.status) {
      closeDrawer();
      return;
    }
    setSaving(true);
    const result = await updateOrderStatus(activeOrder.id, draftStatus);
    setSaving(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(
      `Order ${orderCode(activeOrder)} updated to ${statusLabel(draftStatus)}`,
    );
    setActiveOrder({ ...activeOrder, status: draftStatus });
  }

  function handlePrintInvoice() {
    window.print();
  }

  function handleExport() {
    if (filtered.length === 0) {
      toast.error("No orders to export");
      return;
    }
    const header = [
      "Order ID",
      "Customer",
      "Email",
      "Items",
      "Total",
      "Status",
      "Date",
    ];
    const rows = filtered.map((o) => [
      orderCode(o),
      o.full_name,
      o.email,
      o.order_items.reduce((s, i) => s + i.quantity, 0),
      o.total,
      statusLabel(o.status),
      new Date(o.created_at).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(
      `Exported ${filtered.length} order${filtered.length > 1 ? "s" : ""}`,
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Order Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Admin &gt; Orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-gray-200 bg-blue-950 px-3.5 py-2.5 rounded-md text-sm text-white hover:bg-gray-50 transition-colors"
          >
            <Download size={15} />
            Export to CSV
          </button>
          {/* <Link
            href="/admin/orders/new"
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-blue-800 transition-colors"
          >
            <Plus size={16} />
            Create New Order
          </Link> */}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 mb-4 mt-6 border border-gray-200 bg-gray-50 rounded-md p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusTab(tab.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wide transition-colors ${
              statusTab === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
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
          placeholder="Search by Order ID, Customer, or Item..."
          className="w-full bg-white border border-gray-200 rounded-md pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-700 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                {[
                  "Order ID",
                  "Customer",
                  "Items",
                  "Total",
                  "Status",
                  "Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500"
                  >
                    {h}
                  </th>
                ))}
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((order) => {
                const unitCount = order.order_items.reduce(
                  (s, i) => s + i.quantity,
                  0,
                );
                const itemSummary =
                  order.order_items.length === 1
                    ? order.order_items[0].product_name
                    : `${unitCount} item${unitCount === 1 ? "" : "s"}`;
                const initials = order.full_name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-bold text-gray-900">
                      #{orderCode(order)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <span className="text-gray-700">{order.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{itemSummary}</td>
                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                      {formatNaira(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          STATUS_STYLES[order.status] ??
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td
                      className="px-4 py-3 relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => openDrawer(order)}
                        className="text-blue-700 underline cursor-pointer hover:text-gray-700 p-1 rounded transition-colors"
                        aria-label="Open order details"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}

              {pageItems.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-16 text-center text-gray-400"
                  >
                    No orders found{search ? ` matching "${search}"` : ""}.
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
            {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length} orders
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
                  n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1,
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

      {/* Order details drawer */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />
          <div className="relative w-full max-w-md h-full bg-white shadow-xl overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-700 mb-1">
                  Order Details
                </p>
                <h2 className="text-lg font-black text-gray-900">
                  #{orderCode(activeOrder)} — {activeOrder.full_name}
                </h2>
              </div>
              <button
                onClick={closeDrawer}
                className="text-gray-400 cursor-pointer hover:text-gray-700 p-1"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-gray-200 rounded-md p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Status
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {statusLabel(activeOrder.status)}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-md p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Total
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {formatNaira(activeOrder.total)}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Items Ordered
                </p>
                <div className="space-y-3">
                  {activeOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-md shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.size ? `Size: ${item.size} | ` : ""}Qty:{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        {formatNaira(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 mt-3 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatNaira(activeOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span>
                      {activeOrder.shipping_fee === 0
                        ? "Free"
                        : formatNaira(activeOrder.shipping_fee)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatNaira(activeOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Customer + shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Customer Info
                  </p>
                  <p className="text-sm text-gray-900 font-semibold">
                    {activeOrder.full_name}
                  </p>
                  <p className="text-sm text-gray-500">{activeOrder.email}</p>
                  <p className="text-sm text-gray-500">{activeOrder.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Shipping Address
                  </p>
                  <p className="text-sm text-gray-700">{activeOrder.address}</p>
                  <p className="text-sm text-gray-700">
                    {activeOrder.city}, {activeOrder.state}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Timeline
                </p>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px] mt-0.5 shrink-0">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Order Placed
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(activeOrder.created_at).toLocaleString(
                        "en-NG",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Update status */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Update Order Status
                </p>
                <select
                  value={draftStatus}
                  onChange={(e) => setDraftStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-blue-700 transition-colors"
                >
                  {STATUS_TABS.filter((t) => t.value !== "all").map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-4">
                <button
                  onClick={handlePrintInvoice}
                  className="border border-gray-200 cursor-pointer rounded-md py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Print Invoice
                </button>
                <button
                  onClick={handleSaveStatus}
                  disabled={saving}
                  className="bg-gray-900 text-white cursor-pointer rounded-md py-2.5 text-sm font-semibold hover:bg-black transition-colors disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
