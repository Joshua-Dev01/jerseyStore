"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Search, Download, Mail, Medal, Award, Crown, Gem } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { saveCustomerNote } from "./Customersaction";

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: string;
  total: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
};

type Note = {
  customer_id: string;
  note: string;
  updated_at: string;
};

// Adjustable spend thresholds (in Naira) used to derive a loyalty tier —
// there's no stored "tier" field, this is computed live from real spend.
const TIER_THRESHOLDS = [
  {
    name: "Platinum",
    icon: <Gem size={18} className="text-cyan-400" />,
    min: 300_000,
    color: "#06B6D4",
    style:
      "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border border-cyan-400/40",
  },
  {
    name: "Gold",
    icon: <Crown size={18} className="text-white" />,
    min: 150_000,
    color: "#F59E0B",
    style:
      "bg-gradient-to-r from-yellow-400 to-amber-500 text-white border border-yellow-300/40",
  },
  {
    name: "Silver",
    icon: <Award size={18} className="text-gray-500" />,
    min: 50_000,
    color: "#9CA3AF",
    style:
      "bg-gradient-to-r from-gray-300 to-gray-500 text-white border border-gray-300/40",
  },
  {
    name: "Bronze",
    icon: <Medal size={18} className="text-orange-700" />,
    min: 0,
    color: "#B45309",
    style:
      "bg-gradient-to-r from-orange-300 to-orange-500 text-white border border-orange-300/40",
  },
];

function deriveTier(spend: number) {
  return (
    TIER_THRESHOLDS.find((t) => spend >= t.min) ??
    TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1]
  );
}

function relativeTime(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 Day Ago";
  if (days < 30) return `${days} Days Ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} Month${months > 1 ? "s" : ""} Ago`;
  const years = Math.floor(months / 12);
  return `${years} Year${years > 1 ? "s" : ""} Ago`;
}

function memberSince(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const PAGE_SIZE = 10;

export default function CustomersClient({
  orders,
  notes,
}: {
  orders: Order[];
  notes: Note[];
}) {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "wishlist">("orders");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState(false);

  const notesByCustomer = useMemo(() => {
    const map = new Map<string, Note>();
    notes.forEach((n) => map.set(n.customer_id, n));
    return map;
  }, [notes]);

  const customers = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        phone: string;
        orders: Order[];
        lifetimeSpend: number;
        firstOrder: string;
        lastOrder: string;
      }
    >();

    orders.forEach((o) => {
      const existing = map.get(o.user_id);
      if (!existing) {
        map.set(o.user_id, {
          id: o.user_id,
          name: o.full_name,
          email: o.email,
          phone: o.phone,
          orders: [o],
          lifetimeSpend: Number(o.total),
          firstOrder: o.created_at,
          lastOrder: o.created_at,
        });
      } else {
        existing.orders.push(o);
        existing.lifetimeSpend += Number(o.total);
        if (o.created_at < existing.firstOrder)
          existing.firstOrder = o.created_at;
        if (o.created_at > existing.lastOrder)
          existing.lastOrder = o.created_at;
        // Keep the most recent contact details
        if (o.created_at >= existing.lastOrder) {
          existing.name = o.full_name;
          existing.email = o.email;
          existing.phone = o.phone;
        }
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => b.lifetimeSpend - a.lifetimeSpend,
    );
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      const tier = deriveTier(c.lifetimeSpend).name;
      const matchesTier = tierFilter === "all" || tier === tierFilter;
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.orders.some((o) => o.id.toLowerCase().includes(q));
      return matchesTier && matchesSearch;
    });
  }, [customers, search, tierFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const selected = customers.find((c) => c.id === selectedId) ?? null;

  function selectCustomer(id: string) {
    setSelectedId(id);
    setActiveTab("orders");
    if (!(id in noteDrafts)) {
      setNoteDrafts((prev) => ({
        ...prev,
        [id]: notesByCustomer.get(id)?.note ?? "",
      }));
    }
  }

  async function handleSaveNote() {
    if (!selected) return;
    setSavingNote(true);
    const result = await saveCustomerNote(
      selected.id,
      noteDrafts[selected.id] ?? "",
    );
    setSavingNote(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Note saved");
  }

  function handleExport() {
    if (filtered.length === 0) {
      toast.error("No customers to export");
      return;
    }
    const header = [
      "Name",
      "Email",
      "Phone",
      "Orders",
      "Lifetime Spend",
      "Tier",
      "Member Since",
      "Last Order",
    ];
    const rows = filtered.map((c) => [
      c.name,
      c.email,
      c.phone,
      c.orders.length,
      c.lifetimeSpend,
      deriveTier(c.lifetimeSpend).name,
      memberSince(c.firstOrder),
      new Date(c.lastOrder).toLocaleDateString("en-NG"),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(
      `Exported ${filtered.length} customer${filtered.length > 1 ? "s" : ""}`,
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Customer Relations
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your customers, ranked by lifetime spend.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-black transition-colors"
        >
          <Download size={15} />
          Export Customer Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: search + table */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
                placeholder="Search by name, email, or order"
                className="w-full bg-white border border-gray-200 rounded-md pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-700 transition-colors"
              />
            </div>
            <select
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-200 bg-white rounded-md px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-700 transition-colors"
            >
              <option value="all">All Tiers</option>
              {TIER_THRESHOLDS.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left bg-gray-50">
                    {[
                      "Member",
                      "Email",
                      "Orders",
                      "Lifetime Spend",
                      "Tier",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((c) => {
                    const tier = deriveTier(c.lifetimeSpend);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => selectCustomer(c.id)}
                        className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer ${
                          selectedId === c.id ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center shrink-0">
                              {initials(c.name)}
                            </div>
                            <span className="font-semibold text-gray-900">
                              {c.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{c.email}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {c.orders.length}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                          {formatNaira(c.lifetimeSpend)}
                        </td>
                        <td className="px-4 py-3">
                          <div
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-full shadow ${tier.style}`}
                          >
                            {tier.icon}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {pageItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-16 text-center text-gray-400"
                      >
                        No customers found
                        {search ? ` matching "${search}"` : ""}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
              <p>
                Showing{" "}
                {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length} customers
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (n) => (
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
                  className="px-2 py-1 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: customer detail panel */}
        <div>
          {!selected ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-sm text-gray-400">
              Select a customer to view their profile.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Profile card */}
              <div className="bg-gray-900 text-white rounded-lg p-5 relative overflow-hidden">
                <span
                  className={`absolute top-5 right-5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    deriveTier(selected.lifetimeSpend).style
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {deriveTier(selected.lifetimeSpend).icon}
                    <span>{deriveTier(selected.lifetimeSpend).name}</span>
                  </div>
                </span>
                <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold mb-4">
                  {initials(selected.name)}
                </div>
                <h3 className="text-xl font-black">{selected.name}</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Member Since {memberSince(selected.firstOrder)}
                </p>
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">
                      Total Spend
                    </p>
                    <p className="font-bold">
                      {formatNaira(selected.lifetimeSpend)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">
                      Last Order
                    </p>
                    <p className="font-bold">
                      {relativeTime(selected.lastOrder)}
                    </p>
                  </div>
                </div>
                <a
                  href={`mailto:${selected.email}`}
                  className="mt-4 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-md py-2 text-xs font-semibold"
                >
                  <Mail size={13} />
                  {selected.email}
                </a>
              </div>

              {/* Avg order value — extra real metric */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Avg. Order Value
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {formatNaira(selected.lifetimeSpend / selected.orders.length)}
                </span>
              </div>

              {/* Tabs */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex border-b border-gray-100">
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                      activeTab === "orders"
                        ? "text-gray-900 border-b-2 border-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    Orders
                  </button>
                  <button
                    onClick={() => setActiveTab("wishlist")}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                      activeTab === "wishlist"
                        ? "text-gray-900 border-b-2 border-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    Wishlist
                  </button>
                </div>

                {activeTab === "orders" ? (
                  <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {selected.orders
                      .slice()
                      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
                      .map((o) => (
                        <div key={o.id} className="flex items-center gap-3 p-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-md shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              {o.order_items[0]?.product_name ?? "Order"}
                              {o.order_items.length > 1
                                ? ` +${o.order_items.length - 1} more`
                                : ""}
                            </p>
                            <p className="text-xs text-gray-400">
                              Order #JS-{o.id.slice(0, 5).toUpperCase()} ·{" "}
                              {formatNaira(o.total)}
                            </p>
                            <p className="text-[10px] font-bold uppercase text-gray-500">
                              {o.status}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-gray-400">
                    Wishlist tracking isn&apos;t built yet — this tab is a
                    placeholder for a future feature.
                  </div>
                )}

                <Link
                  href={`/admin/orders?q=${encodeURIComponent(selected.email)}`}
                  className="block text-center py-2.5 text-xs font-bold uppercase tracking-widest text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  View All Activity
                </Link>
              </div>

              {/* Internal notes — real, persisted */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Internal Notes
                </p>
                <textarea
                  value={noteDrafts[selected.id] ?? ""}
                  onChange={(e) =>
                    setNoteDrafts((prev) => ({
                      ...prev,
                      [selected.id]: e.target.value,
                    }))
                  }
                  placeholder="Add a private note about this customer..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-md p-2.5 text-sm outline-none focus:border-blue-700 transition-colors resize-none"
                />
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="mt-2 text-xs font-bold text-blue-700 hover:underline disabled:opacity-50"
                >
                  {savingNote ? "Saving..." : "Save Note →"}
                </button>
                {notesByCustomer.get(selected.id) && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Last saved{" "}
                    {new Date(
                      notesByCustomer.get(selected.id)!.updated_at,
                    ).toLocaleString("en-NG")}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
