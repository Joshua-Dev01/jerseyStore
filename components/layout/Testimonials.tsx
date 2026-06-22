const reviews = [
  {
    id: 1,
    name: 'Chiamaka O.',
    location: 'Lagos, Nigeria',
    review: 'The quality is unmatched. My Man United jersey arrived exactly as pictured, true to size and the stitching is top notch. This is the only store I trust for authentic jerseys.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Tunde A.',
    location: 'Abuja, Nigeria',
    review: 'Ordered the Nigeria home kit for the World Cup and it did not disappoint. Fast delivery and the fabric feels premium, just like the original.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Ngozi E.',
    location: 'Port Harcourt, Nigeria',
    review: 'I bought jerseys for my whole squad before our match day. Every size was accurate and the prints have not faded after multiple washes.',
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="bg-gray-50 py-20 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase text-gray-400 mb-2">
            What They Say
          </p>
          <h2 className="text-3xl font-black uppercase tracking-wide text-gray-900">
            Customer Reviews
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map(({ id, name, location, review, rating }) => (
            <div key={id} className="bg-white p-8 border border-gray-100">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: rating }).map((_, i) => (
                  <span key={i} className="text-yellow-300 text-sm">★</span>
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-6 italic">
                {review}
              </p>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-gray-900">
                  {name}
                </p>
                <p className="text-xs text-gray-400 tracking-wide">{location}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}