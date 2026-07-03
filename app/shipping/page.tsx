export default function ShippingPage() {
  return (
    <div className="pt-32 pb-20 max-w-3xl mx-auto px-6">
      <h1 className="text-4xl font-black uppercase tracking-widest text-gray-900 mb-10 text-center">
        Shipping Information
      </h1>

      <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
            Standard Shipping
          </h3>
          <p>Free on all orders over ₦50,000. Delivery takes 5-7 business days. Orders under ₦50,000 incur a flat ₦2,000 shipping fee.</p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
            Express Shipping
          </h3>
          <p>Available at checkout for $9.99. Delivery takes 2-3 business days.</p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
            International Shipping
          </h3>
          <p>We ship to most countries worldwide. Rates and delivery estimates are calculated at checkout based on your destination.</p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
            Order Tracking
          </h3>
          <p>Once your order ships, you&apos;ll receive a tracking number via email. You can also track your order from your account dashboard under &quot;My Orders&quot;.</p>
        </div>
      </div>
    </div>
  )
}