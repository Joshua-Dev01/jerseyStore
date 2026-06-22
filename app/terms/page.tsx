export default function TermsPage() {
  return (
    <div className="pt-32 pb-20 max-w-3xl mx-auto px-6">
      <h1 className="text-4xl font-black uppercase tracking-widest text-gray-900 mb-10 text-center">
        Terms of Use
      </h1>

      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
        <p>By using Jersey Store, you agree to the following terms.</p>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">Orders</h3>
          <p>All orders are subject to availability. We reserve the right to cancel any order due to stock issues or pricing errors.</p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">Pricing</h3>
          <p>Prices are listed in USD and may change without notice. Taxes and shipping fees are calculated at checkout.</p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">Intellectual Property</h3>
          <p>All content on this site, including logos and product descriptions, is the property of Jersey Store and may not be reproduced without permission.</p>
        </div>
      </div>
    </div>
  )
}