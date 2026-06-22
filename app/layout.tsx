import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: { default: 'Cloth Brand', template: '%s | Cloth Brand' },
  description: 'Clean cuts, premium fabrics, timeless style.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}