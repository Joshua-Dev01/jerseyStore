export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-20 max-w-3xl mx-auto px-6">
      <h1 className="text-4xl font-black uppercase tracking-widest text-gray-900 mb-10 text-center">
        Privacy Policy
      </h1>

      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
        <p>Jersey Store respects your privacy. This policy explains what information we collect and how we use it.</p>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">Information We Collect</h3>
          <p>We collect your name, email, shipping address, and payment details when you place an order, and your email when you subscribe to our newsletter.</p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">How We Use Your Data</h3>
          <p>Your information is used solely to process orders, provide customer support, and send updates if you&apos;ve opted in. We never sell your data to third parties.</p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">Data Security</h3>
          <p>All payment information is processed securely and encrypted. We do not store full card details on our servers.</p>
        </div>
      </div>
    </div>
  )
}