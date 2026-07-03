import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Download,
  Plus,
} from "lucide-react";

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  const { data: products } = await supabase.from("products").select("*");

  const { data: customers } = await supabase.from("profiles").select("*");

  const totalRevenue =
    orders?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;
  const totalOrders = orders?.length ?? 0;
  const totalCustomers = customers?.length ?? 0;
  const activeProducts =
    products?.filter((p) => p.status === "available").length ?? 0;

  const recentOrders = orders?.slice(0, 5) ?? [];

  const lowStock =
    products
      ?.filter((p) => (p.stock_count ?? 0) <= 8 && (p.stock_count ?? 0) > 0)
      .sort((a, b) => (a.stock_count ?? 0) - (b.stock_count ?? 0))
      .slice(0, 3) ?? [];

  const topSelling =
    products
      ?.sort((a, b) => (b.stock_count ?? 0) - (a.stock_count ?? 0))
      .slice(0, 4) ?? [];

  const statusColor: Record<string, string> = {
    paid: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-orange-100 text-orange-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-8 bg-neutral-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide text-gray-900">
            Admin Overview
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time store performance and logistics tracking.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-gray-200 px-4 py-2 text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors rounded">
            <Download size={14} />
            Export
          </button>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors rounded"
          >
            <Plus size={14} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Revenue",
            value: formatNaira(totalRevenue),
            icon: DollarSign,
            change: "+12%",
            positive: true,
            color: "text-green-900",
          },
          {
            label: "Total Orders",
            value: totalOrders.toLocaleString(),
            icon: ShoppingCart,
            change: "+5.4%",
            positive: true,
            color: "text-blue-600",
          },
          {
            label: "Customers",
            value: totalCustomers.toLocaleString(),
            icon: Users,
            change: "-1.2%",
            positive: false,
            color: "text-red-500",
          },
          {
            label: "Active Products",
            value: activeProducts.toString(),
            icon: Package,
            change: "STABLE",
            positive: true,
            color: "text-gray-500",
          },
        ].map(({ label, value, icon: Icon, change, positive, color }) => (
          <div
            key={label}
            className="bg-white border border-gray-200 rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-gray-400">
                {label}
              </p>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                  positive
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {change}
              </span>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
            {/* Mini bar chart placeholder */}
            <div className="flex items-end gap-0.5 mt-3 h-8">
              {[40, 65, 45, 70, 55, 80, 60].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${positive ? "bg-green-600" : "bg-red-600"}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">
              Monthly Revenue Growth
            </h3>
            <button className="flex items-center gap-1 text-xs text-blue-600 border border-gray-200 px-3 py-1.5 rounded">
              Last 12 Months ▾
            </button>
          </div>
          {/* Chart placeholder */}
          <div className="relative h-40">
            <div className="absolute inset-0 flex items-end gap-2 px-2">
              {[30, 55, 40, 70, 50, 85, 65, 90, 75, 95, 80, 100].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full bg-blue-100 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-2">
            {[
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ].map((m) => (
              <span key={m} className="text-xs text-gray-400">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">
              Low Stock Alerts
            </h3>
          </div>

          <div className="space-y-3">
            {lowStock.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                All products well stocked
              </p>
            ) : (
              lowStock.map((product) => {
                const img = product.images?.[0];
                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 border-l-2 border-red-400 pl-3 py-1"
                  >
                    {img && (
                      <div className="relative w-10 h-10 bg-gray-100 rounded overflow-hidden shrink-0">
                        <Image
                          src={img}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {product.club_name || product.name}
                      </p>
                      <p className="text-xs text-red-500 font-bold">
                        ONLY {product.stock_count} UNITS LEFT
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Link
            href="/admin/products"
            className="block text-center mt-4 border border-red-500 text-red-500 py-2 text-xs uppercase tracking-widest hover:bg-red-50 transition-colors rounded"
          >
            Restock All Now
          </Link>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">
              Recent Orders
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View All →
            </Link>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Order ID", "Customer", "Date", "Amount", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-xs uppercase tracking-widest text-gray-400 pb-3 pr-4 font-medium"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-sm text-gray-400 py-8"
                  >
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <p className="text-xs font-bold text-gray-900">
                        #JS-{order.id.slice(0, 4).toUpperCase()}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-xs text-gray-700">{order.full_name}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-NG",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-xs font-bold text-gray-900">
                        {formatNaira(order.total)}
                      </p>
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded font-bold uppercase ${statusColor[order.status] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Top Selling Jerseys */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">
            Top Selling Jerseys
          </h3>

          <div className="space-y-3">
            {topSelling.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                No products yet
              </p>
            ) : (
              topSelling.map((product, i) => {
                const img = product.images?.[0];
                const title = [
                  product.club_name,
                  product.season,
                  product.kit_type,
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div key={product.id} className="flex items-center gap-3">
                    {img ? (
                      <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden shrink-0">
                        <Image
                          src={img}
                          alt={title || product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {title || product.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {product.stock_count ?? 0} in stock
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-900">
                        {formatNaira(product.price)}
                      </p>
                      <p className="text-xs text-green-500 font-bold">
                        +{(i + 1) * 5}%
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 border-t border-gray-200 pt-6 flex items-center justify-between">
        <p className="text-xs text-gray-400 uppercase tracking-widest">
          © 2026 Jersey Store. All Rights Reserved.
        </p>
        <div className="flex gap-6">
          <Link
            href="/privacy"
            className="text-xs text-gray-400 hover:text-black transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-xs text-gray-400 hover:text-black transition-colors"
          >
            Terms of Service
          </Link>
          <span className="text-xs text-gray-400">System Status</span>
        </div>
      </div>
    </div>
  );
}
