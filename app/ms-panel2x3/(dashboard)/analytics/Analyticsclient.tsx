"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Layers,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";

type OrderItem = {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  email: string;
  total: number;
  subtotal: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
};

type Product = {
  id: string;
  name: string;
  club_name: string | null;
  season: string | null;
  kit_type: string | null;
  price: number;
  images: string[] | null;
  stock_count: number | null;
};

function ChangeBadge({ value }: { value: number }) {
  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold ${
        positive ? "text-green-600" : "text-red-500"
      }`}
    >
      <Icon size={12} />
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

const RANGE_OPTIONS = [
  { label: "Last 30 Days", days: 30 },
  { label: "Last 3 Months", days: 90 },
  { label: "Last 6 Months", days: 180 },
  { label: "Last 12 Months", days: 365 },
  { label: "All Time", days: null as number | null },
];

const DONUT_COLORS = ["#1d4ed8", "#0f172a", "#60a5fa", "#93c5fd", "#cbd5e1"];

function inRange(dateStr: string, from: Date | null, to: Date) {
  const d = new Date(dateStr);
  if (from && d < from) return false;
  return d <= to;
}

function monthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short" });
}

export default function AnalyticsClient({
  orders,
  products,
}: {
  orders: Order[];
  products: Product[];
}) {
  const [rangeIdx, setRangeIdx] = useState(2); // default: Last 6 Months

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const paidOrders = useMemo(
    () => orders.filter((o) => o.status !== "cancelled"),
    [orders],
  );

  const { from, prevFrom, prevTo } = useMemo(() => {
    const days = RANGE_OPTIONS[rangeIdx].days;
    const now = new Date();
    if (days === null)
      return { from: null as Date | null, prevFrom: null, prevTo: null };
    const from = new Date(now);
    from.setDate(from.getDate() - days);
    const prevTo = new Date(from);
    const prevFrom = new Date(from);
    prevFrom.setDate(prevFrom.getDate() - days);
    return { from, prevFrom, prevTo };
  }, [rangeIdx]);

  const now = useMemo(() => new Date(), []);

  const current = useMemo(
    () => paidOrders.filter((o) => inRange(o.created_at, from, now)),
    [paidOrders, from, now],
  );

  const previous = useMemo(
    () =>
      prevFrom && prevTo
        ? paidOrders.filter((o) => inRange(o.created_at, prevFrom, prevTo))
        : [],
    [paidOrders, prevFrom, prevTo],
  );

  function pctChange(curr: number, prev: number) {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  }

  const totalRevenue = current.reduce((s, o) => s + Number(o.total), 0);
  const prevRevenue = previous.reduce((s, o) => s + Number(o.total), 0);
  const revenueChange = pctChange(totalRevenue, prevRevenue);

  const totalOrders = current.length;
  const prevOrders = previous.length;
  const ordersChange = pctChange(totalOrders, prevOrders);

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const prevAvgOrderValue = prevOrders > 0 ? prevRevenue / prevOrders : 0;
  const avgChange = pctChange(avgOrderValue, prevAvgOrderValue);

  const unitsSold = current.reduce(
    (s, o) => s + o.order_items.reduce((s2, i) => s2 + i.quantity, 0),
    0,
  );
  const prevUnitsSold = previous.reduce(
    (s, o) => s + o.order_items.reduce((s2, i) => s2 + i.quantity, 0),
    0,
  );
  const unitsChange = pctChange(unitsSold, prevUnitsSold);

  // Revenue by month — last 12 calendar months, independent of the range filter above
  const monthlyRevenue = useMemo(() => {
    const buckets = new Map<string, number>();
    const cursor = new Date();
    cursor.setDate(1);
    const keys: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      keys.push(key);
      buckets.set(key, 0);
    }
    paidOrders.forEach((o) => {
      const key = monthKey(o.created_at);
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + Number(o.total));
      }
    });
    return keys.map((key) => ({
      month: monthLabel(key),
      revenue: buckets.get(key) ?? 0,
    }));
  }, [paidOrders]);

  // Sales by club (units sold), from current range's order_items
  const salesByClub = useMemo(() => {
    const counts = new Map<string, number>();
    current.forEach((o) => {
      o.order_items.forEach((item) => {
        const club = productMap.get(item.product_id)?.club_name ?? "Other";
        counts.set(club, (counts.get(club) ?? 0) + item.quantity);
      });
    });
    const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, 4);
    const rest = entries.slice(4).reduce((s, [, v]) => s + v, 0);
    if (rest > 0) top.push(["Other", rest]);
    const total = top.reduce((s, [, v]) => s + v, 0);
    return {
      total,
      slices: top.map(([club, v]) => ({
        club,
        units: v,
        pct: total ? (v / total) * 100 : 0,
      })),
    };
  }, [current, productMap]);

  // Top performing jerseys — grouped by product, with growth vs previous period
  const topJerseys = useMemo(() => {
    function tally(list: Order[]) {
      const map = new Map<string, { revenue: number; units: number }>();
      list.forEach((o) => {
        o.order_items.forEach((item) => {
          const entry = map.get(item.product_id) ?? { revenue: 0, units: 0 };
          entry.revenue += item.price * item.quantity;
          entry.units += item.quantity;
          map.set(item.product_id, entry);
        });
      });
      return map;
    }
    const currMap = tally(current);
    const prevMap = tally(previous);

    return Array.from(currMap.entries())
      .map(([productId, stats]) => {
        const product = productMap.get(productId);
        const prevStats = prevMap.get(productId);
        const growth = prevStats
          ? pctChange(stats.revenue, prevStats.revenue)
          : stats.revenue > 0
            ? 100
            : 0;
        return {
          productId,
          name:
            product?.name ??
            [product?.club_name, product?.kit_type].filter(Boolean).join(" ") ??
            "Unknown product",
          image: product?.images?.[0] ?? null,
          revenue: stats.revenue,
          units: stats.units,
          growth,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [current, previous, productMap]);

  // Customer segments — by order count per email, within current range
  const segments = useMemo(() => {
    const perEmail = new Map<string, number>();
    current.forEach((o) => {
      perEmail.set(o.email, (perEmail.get(o.email) ?? 0) + 1);
    });
    const totalCustomers = perEmail.size;
    let newC = 0,
      returning = 0,
      loyal = 0;
    perEmail.forEach((count) => {
      if (count >= 5) loyal++;
      else if (count >= 2) returning++;
      else newC++;
    });
    const pct = (n: number) =>
      totalCustomers ? (n / totalCustomers) * 100 : 0;
    return {
      totalCustomers,
      newC,
      returning,
      loyal,
      newPct: pct(newC),
      returningPct: pct(returning),
      loyalPct: pct(loyal),
    };
  }, [current]);

  function handleDownloadReport() {
    const rangeLabel = RANGE_OPTIONS[rangeIdx].label;
    const lines: string[] = [];
    lines.push(`Analytics Report,${rangeLabel}`);
    lines.push("");
    lines.push("Metric,Value");
    lines.push(`Total Revenue,${totalRevenue}`);
    lines.push(`Total Orders,${totalOrders}`);
    lines.push(`Avg Order Value,${avgOrderValue.toFixed(2)}`);
    lines.push(`Units Sold,${unitsSold}`);
    lines.push("");
    lines.push("Top Performing Jerseys");
    lines.push("Product,Revenue,Units Sold,Growth %");
    topJerseys.forEach((j) => {
      lines.push(`"${j.name}",${j.revenue},${j.units},${j.growth.toFixed(1)}`);
    });
    lines.push("");
    lines.push("Sales By Club");
    lines.push("Club,Units,Percent");
    salesByClub.slices.forEach((s) => {
      lines.push(`"${s.club}",${s.units},${s.pct.toFixed(1)}`);
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${rangeLabel.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ChangeBadge moved to top-level to avoid creating components during render

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Analytics Overview
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Live performance tracking, computed from your real orders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={rangeIdx}
            onChange={(e) => setRangeIdx(Number(e.target.value))}
            className="border border-gray-200 bg-white rounded-md px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-700 transition-colors"
          >
            {RANGE_OPTIONS.map((opt, i) => (
              <option key={opt.label} value={i}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-blue-800 transition-colors"
          >
            <Download size={15} />
            Download Report
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            Total Revenue
          </p>
          <p className="text-2xl font-black text-gray-900 mb-1">
            {formatNaira(totalRevenue)}
          </p>
          <ChangeBadge value={revenueChange} />
          <span className="text-xs text-gray-400 ml-1">vs previous period</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            Total Orders
          </p>
          <p className="text-2xl font-black text-gray-900 mb-1">
            {totalOrders}
          </p>
          <ChangeBadge value={ordersChange} />
          <span className="text-xs text-gray-400 ml-1">vs previous period</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            Avg. Order Value
          </p>
          <p className="text-2xl font-black text-gray-900 mb-1">
            {formatNaira(avgOrderValue)}
          </p>
          <ChangeBadge value={avgChange} />
          <span className="text-xs text-gray-400 ml-1">vs previous period</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            Units Sold
          </p>
          <p className="text-2xl font-black text-gray-900 mb-1">{unitsSold}</p>
          <ChangeBadge value={unitsChange} />
          <span className="text-xs text-gray-400 ml-1">vs previous period</span>
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">
            Revenue By Month
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyRevenue}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1d4ed8" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `₦${(v / 1000).toFixed(0)}k` : `₦${v}`
                  }
                />
                <Tooltip
                  formatter={(value) => formatNaira(Number(value ?? 0))}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1d4ed8"
                  strokeWidth={2}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">
            Sales By Club
          </h3>
          {salesByClub.total === 0 ? (
            <p className="text-xs text-gray-400 text-center py-12">
              No sales in this period yet
            </p>
          ) : (
            <>
              <div className="relative h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesByClub.slices}
                      dataKey="units"
                      nameKey="club"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {salesByClub.slices.map((_, i) => (
                        <Cell
                          key={i}
                          fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} units`, name]}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-xl font-black text-gray-900">
                    {salesByClub.total}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">
                    Units
                  </p>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {salesByClub.slices.map((s, i) => (
                  <div
                    key={s.club}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2 text-gray-700">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            DONUT_COLORS[i % DONUT_COLORS.length],
                        }}
                      />
                      {s.club}
                    </span>
                    <span className="font-bold text-gray-900">
                      {s.pct.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">
              Top Performing Jerseys
            </h3>
          </div>

          {topJerseys.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">
              No sales in this period yet
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {topJerseys.map((j) => (
                <div key={j.productId} className="flex items-center gap-3 py-3">
                  <div className="relative w-11 h-11 bg-gray-100 rounded-md overflow-hidden shrink-0">
                    {j.image && (
                      <Image
                        src={j.image}
                        alt={j.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {j.name}
                    </p>
                    <p className="text-xs text-gray-400">{j.units} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-700">
                      {formatNaira(j.revenue)}
                    </p>
                  </div>
                  <ChangeBadge value={j.growth} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">
            Customer Segments
          </h3>

          {segments.totalCustomers === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">
              No customers in this period yet
            </p>
          ) : (
            <div className="space-y-4">
              {[
                {
                  label: "New Customers",
                  count: segments.newC,
                  pct: segments.newPct,
                  note: "First order in this period",
                  bar: "bg-gray-300",
                  icon: ShoppingCart,
                },
                {
                  label: "Returning Customers",
                  count: segments.returning,
                  pct: segments.returningPct,
                  note: "2-4 orders in this period",
                  bar: "bg-blue-700",
                  icon: Package,
                },
                {
                  label: "Loyal Customers",
                  count: segments.loyal,
                  pct: segments.loyalPct,
                  note: "5+ orders in this period",
                  bar: "bg-gray-900",
                  icon: Layers,
                },
              ].map((seg) => (
                <div key={seg.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-700">
                      {seg.label}
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {seg.pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full ${seg.bar} rounded-full transition-all`}
                      style={{ width: `${seg.pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    {seg.count} customer{seg.count === 1 ? "" : "s"} ·{" "}
                    {seg.note}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
