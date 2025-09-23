"use client"

import type React from "react"
import { Header } from "@/components/header"
import { Suspense } from "react"
import { usePathname } from "next/navigation"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const hideHeader = pathname === "/login" || pathname === "/signup"

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {!hideHeader && <Header />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </Suspense>
  )
}
