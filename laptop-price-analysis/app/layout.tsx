import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Laptop Price Analysis',
  description: 'Analyze laptop prices using machine learning',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
