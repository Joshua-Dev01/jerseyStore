import { createClient } from '@/lib/supabase/server'
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react'
import Link from 'next/link'

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: orders } = await supabase.from('orders').select('*')
  const { data: products } = await supabase.from('products').select('*')

  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0
  const totalOrders = orders?.length ?? 0
  const activeProducts = products?.filter((p) => p.status === 'available' || p.in_stock).length ?? 0
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const recentOrders = orders
    ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5) ?? []

  const lowStock = products?.filter((p) => (p.stock_count ?? 0) < 5 && (p.stock_count ?? 0) > 0) ?? []

  const stats = [
    { label: 'Total Revenue', value: formatNaira(totalRevenue), icon: DollarSign, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'bg-green-100 text-green-600' },
    { label: 'Active Products', value: activeProducts, icon: Package, color: 'bg-purple-100 text-purple-600' },
    { label: 'Avg Order Value', value: formatNaira(avgOrderValue), icon: TrendingUp, color: 'bg-amber-100 text-amber-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-widest text-gray-900 mb-8">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline">View All</Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.full_name}</p>
                    <p className="text-xs text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatNaira(order.total)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'paid' ? 'bg-green-100 text-green-600' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Low Stock Alerts</h3>
            <Link href="/admin/products" className="text-xs text-blue-600 hover:underline">Manage</Link>
          </div>

          {lowStock.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">All products well stocked</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    {product.stock_count} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex gap-3">
        <Link
          href="/admin/products/new"
          className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors rounded-md"
        >
          + Add Product
        </Link>
        <Link
          href="/admin/orders"
          className="border border-gray-200 px-6 py-3 text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors rounded-md"
        >
          View Orders
        </Link>
      </div>

    </div>
  )
}