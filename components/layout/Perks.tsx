export default function Perks() {
  const perks = [
    { title: 'Free Shipping', sub: 'On orders over $50' },
    { title: '30-Day Returns', sub: 'No questions asked' },
    { title: 'Premium Quality', sub: 'Crafted to last' },
    { title: 'Secure Payment', sub: '100% protected' },
  ]

  return (
    <section className="bg-black text-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {perks.map(({ title, sub }) => (
          <div key={title} className="text-center">
            <p className="text-sm font-bold tracking-widest uppercase mb-1">
              {title}
            </p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>
    </section>
  )
}