"use client"

import { useState, useEffect } from "react"
import { mockAbstractWallet, type MockWalletData } from "@/lib/mock-abstract-wallet"

export function useMockWallet() {
  const [walletData, setWalletData] = useState<MockWalletData>({
    address: null,
    balance: null,
    chainId: null,
    isConnected: false,
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Subscribe to wallet changes
    const unsubscribe = mockAbstractWallet.subscribe((data) => {
      setWalletData(data)
    })

    // Get initial wallet data
    setWalletData(mockAbstractWallet.getWalletData())

    return unsubscribe
  }, [])

  const connect = async () => {
    setIsConnecting(true)
    setError(null)

    const result = await mockAbstractWallet.connect()

    if (result.success) {
      setError(null)
    } else {
      setError(result.error || "Connection failed")
    }

    setIsConnecting(false)
    return result
  }

  const disconnect = async () => {
    await mockAbstractWallet.disconnect()
    setError(null)
  }

  const refreshBalance = async () => {
    await mockAbstractWallet.refreshBalance()
  }

  return {
    walletData,
    isConnecting,
    error,
    connect,
    disconnect,
    refreshBalance,
  }
}
