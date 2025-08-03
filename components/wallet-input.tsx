"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Search, AlertCircle } from "lucide-react"

interface WalletInputProps {
  onWalletSubmit: (address: string) => void
  loading?: boolean
}

export default function WalletInput({ onWalletSubmit, loading = false }: WalletInputProps) {
  const [walletAddress, setWalletAddress] = useState("")
  const [error, setError] = useState("")

  const validateAddress = (address: string): boolean => {
    // Basic Ethereum address validation
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
    return ethAddressRegex.test(address)
  }

  const handleSubmit = () => {
    setError("")

    if (!walletAddress.trim()) {
      setError("Please enter a wallet address")
      return
    }

    if (!validateAddress(walletAddress.trim())) {
      setError("Please enter a valid Ethereum address")
      return
    }

    onWalletSubmit(walletAddress.trim())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <Card className="bg-gray-900/80 backdrop-blur-sm border-2 border-gray-700/50 shadow-2xl">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl text-white flex items-center justify-center gap-3 font-orbitron font-black text-gritty">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/50">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          ENTER WALLET ADDRESS
        </CardTitle>
        <p className="text-gray-300/90 text-base font-rajdhani font-medium text-gritty">
          🔍 Enter your Ethereum wallet address to load your NFTs
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="0x1234567890abcdef1234567890abcdef12345678"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 font-mono text-sm h-12"
            disabled={loading}
          />

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !walletAddress.trim()}
          className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-black text-lg font-orbitron tracking-wide shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Loading NFTs...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              LOAD MY NFTs
            </div>
          )}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-gray-400 text-xs">💡 Example: 0x1234567890abcdef1234567890abcdef12345678</p>
          <p className="text-gray-500 text-xs">We'll fetch all your NFTs from OpenSea</p>
        </div>
      </CardContent>
    </Card>
  )
}
