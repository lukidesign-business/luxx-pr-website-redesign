import type { Metadata, Viewport } from 'next'
import { Inter_Tight } from 'next/font/google'
import './globals.css'
import LayoutWrapper from '@/components/layout-wrapper'

const inter = Inter_Tight({ subsets: ['latin'], variable: '--font-sans', weight: ['300', '400', '500', '600', '700', '800', '900'] })

export const metadata: Metadata = {
  title: 'LuxxPR - Professional Web Design & Development',
  description: 'LuxxPR creates stunning, high-converting websites that help brands and creators monetize their audiences at scale. Professional web design tailored to your business needs.',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#050d14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-[#050d14]">
      <body className={`${inter.variable} font-sans`}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}
