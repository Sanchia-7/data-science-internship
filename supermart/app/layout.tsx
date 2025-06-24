import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Supermart Analytics Dashboard',
  description: 'Created By Bryan Sohan John',
 
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
