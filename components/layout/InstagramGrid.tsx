// import Image from 'next/image'
// import { FaInstagram } from 'react-icons/fa'

// const posts = [
//   { id: 1, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80' },
//   { id: 2, image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80' },
//   { id: 3, image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&q=80' },
//   { id: 4, image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80' },
//   { id: 5, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
//   { id: 6, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80' },
//   { id: 7, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80' },
//   { id: 8, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80' },
// ]

// export default function InstagramGrid() {
//   return (
//     <section className="py-20 px-6">
//       <div className="max-w-7xl mx-auto">

//         {/* Header */}
//         <div className="text-center mb-10">
//           <h2 className="text-2xl font-black uppercase tracking-widest text-gray-900 mb-2">
//             In The Wild
//           </h2>
//           <a
//             href="https://instagram.com"
//             target="_blank"
//             rel="noreferrer"
//             className="text-xs text-blue-500 tracking-widest hover:text-blue-700 transition-colors"
//           >
//             Follow us @clothbrandbjfggv vmbjvfnm vnbg
//           </a>
//         </div>

//         {/* Grid — 4 columns, 2 rows */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
//           {posts.map(({ id, image }) => (
//             <a
//               key={id}
//               href="https://instagram.com"
//               target="_blank"
//               rel="noreferrer"
//               className="relative h-52 overflow-hidden group"
//             >
//               {/* Grayscale by default, color on hover */}
//               <Image
//                 src={image}
//                 alt={`Instagram post ${id}`}
//                 fill
//                 className="object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
//               />

//               {/* Instagram icon on hover */}
//               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
//                 <FaInstagram
//                   size={22}
//                   className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg"
//                 />
//               </div>
//             </a>
//           ))}
//         </div>

//       </div>
//     </section>
//   )
// }