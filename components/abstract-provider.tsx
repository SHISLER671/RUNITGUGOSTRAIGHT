"use client"

import type { ReactNode } from "react"
import { AbstractWalletProvider } from "@abstract-foundation/agw-react"

interface AbstractProviderProps {
  children: ReactNode
}

export default function AbstractProvider({ children }: AbstractProviderProps) {
  // Minimal config based on Abstract docs
  const config = {
    testnet: true,
    appName: "Run It GUGO Straight",
  }

  try {
    return <AbstractWalletProvider config={config}>{children}</AbstractWalletProvider>
  } catch (error) {
    console.error("Abstract provider error:", error)
    // Fallback to children without provider
    return <>{children}</>
  }
}
