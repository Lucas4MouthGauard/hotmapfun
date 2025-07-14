import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/components/WalletProvider'
import { HydrationErrorBoundary } from '@/components/HydrationErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '热词排行',
  description: '社区共创的热词排行平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <HydrationErrorBoundary>
          <WalletProvider>
            {children}
          </WalletProvider>
        </HydrationErrorBoundary>
      </body>
    </html>
  )
} 