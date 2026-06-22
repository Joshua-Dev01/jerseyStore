const faqs = [
  {
    q: 'Are these jerseys authentic?',
    a: 'Yes, all jerseys sold on Jersey Store are sourced from official manufacturers and licensed suppliers. Every product description specifies the edition and quality.',
  },
  {
    q: 'What sizes are available?',
    a: 'Most jerseys come in sizes S, M, L, XL, and XXL. Check the size guide on each product page for exact measurements before ordering.',
  },
  {
    q: 'Can I get a jersey personalized with a name and number?',
    a: 'Personalization is available on select jerseys. Look for the "Customize" option on the product page, or contact our support team for a custom order.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Standard delivery takes 5-7 business days. Express delivery (2-3 days) is available at checkout for an additional fee.',
  },
  {
    q: 'What is your return policy?',
    a: 'We accept returns within 30 days of delivery for unworn items with tags attached. See our Returns page for full details.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Yes, we ship worldwide. International shipping rates and delivery times are calculated at checkout based on your location.',
  },
]

export default function FAQPage() {
  return (
    <div className="pt-32 pb-20 max-w-3xl mx-auto px-6">
      <h1 className="text-4xl font-black uppercase tracking-widest text-gray-900 mb-10 text-center">
        Frequently Asked Questions
      </h1>

      <div className="space-y-8">
        {faqs.map(({ q, a }, i) => (
          <div key={i} className="border-b border-gray-200 pb-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
              {q}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {a}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}