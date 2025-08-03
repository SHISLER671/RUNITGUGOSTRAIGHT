"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Zap, Shield, Coins, AlertCircle, CheckCircle, RefreshCw, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { useMockWallet } from "@/hooks/use-mock-wallet"
import { ABSTRACT_TESTNET } from "@/lib/abstract-config"

interface WalletConnectProps {
  onConnect: (address: string) => void
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const { walletData, isConnecting, error, connect, disconnect, refreshBalance } = useMockWallet()
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected" | "error">(
    "disconnected",
  )

  // Update connection status based on wallet data
  useEffect(() => {
    if (isConnecting) {
      setConnectionStatus("connecting")
    } else if (walletData.isConnected && walletData.address) {
      setConnectionStatus("connected")
      onConnect(walletData.address)
    } else if (error) {
      setConnectionStatus("error")
    } else {
      setConnectionStatus("disconnected")
    }
  }, [walletData.isConnected, walletData.address, isConnecting, error, onConnect])

  const handleConnect = async () => {
    console.log("🔗 Initiating Mock Abstract wallet connection...")
    await connect()
  }

  const handleDisconnect = async () => {
    await disconnect()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const openExplorer = () => {
    if (walletData.address) {
      window.open(`${ABSTRACT_TESTNET.explorerUrl}/address/${walletData.address}`, "_blank")
    }
  }

  // Connected state
  if (connectionStatus === "connected" && walletData.address) {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-900/80 backdrop-blur-sm border-2 border-green-500/70 shadow-2xl gugo-glow">
          <CardHeader className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src="/branding/gugo-runner.png" alt="GUGO Runner" className="w-16 h-16" />
              <img src="/branding/bearish-logo.png" alt="BEARISH" className="w-20 h-8" />
            </div>
            <CardTitle className="text-2xl text-white font-orbitron font-bold text-gritty flex items-center justify-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-400" />
              ABSTRACT WALLET CONNECTED
            </CardTitle>
            <div className="text-sm text-green-300 bg-green-900/30 rounded-lg px-3 py-1 inline-block">
              🧪 Demo Mode - Mock Wallet Data
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Real Wallet Data Display */}
            <div className="p-4 bg-green-900/30 rounded-xl border border-green-500/50">
              <div className="text-center space-y-3">
                <p className="text-green-400 font-bold text-lg">🔗 Live Wallet Data</p>

                {/* Address */}
                <div className="space-y-2">
                  <p className="text-white/70 text-sm">Wallet Address</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-white font-mono text-sm">{formatAddress(walletData.address)}</p>
                    <Button
                      onClick={openExplorer}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Balance */}
                <div className="space-y-2">
                  <p className="text-white/70 text-sm">ETH Balance</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-green-400 font-bold text-lg">{walletData.balance || "0.0000"} ETH</p>
                    <Button
                      onClick={refreshBalance}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Network Info */}
                <div className="space-y-2">
                  <p className="text-white/70 text-sm">Network</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-green-300 text-sm font-medium">{ABSTRACT_TESTNET.name}</p>
                    <span className="text-green-400 text-xs">
                      (Chain ID: {walletData.chainId || ABSTRACT_TESTNET.chainId})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-orange-500/30 gugo-orange-glow">
                <Zap className="h-6 w-6 text-orange-400" />
                <div>
                  <p className="text-white text-base font-rajdhani font-bold text-gritty">Lightning Fast</p>
                  <p className="text-gray-400 text-sm font-rajdhani text-gritty">Abstract L2 speed</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-amber-600/30 bearish-glow">
                <Shield className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="text-white text-base font-rajdhani font-bold text-gritty">Secure Battles</p>
                  <p className="text-gray-400 text-sm font-rajdhani text-gritty">Blockchain verified</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-green-500/30 gugo-glow">
                <Coins className="h-6 w-6 text-green-400" />
                <div>
                  <p className="text-white text-base font-rajdhani font-bold text-gritty">Earn $GUGO Tokens</p>
                  <p className="text-gray-400 text-sm font-rajdhani text-gritty">Win battles, earn rewards</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="w-full h-12 border-gray-500 text-gray-300 hover:bg-gray-700 font-rajdhani font-bold bg-transparent"
            >
              Disconnect Wallet
            </Button>

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-400 font-rajdhani font-medium text-gritty">
                <span>• Demo mode</span>
                <span>• Mock data</span>
                <span>• Testnet ready</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Disconnected state
  return (
    <div className="space-y-6">
      {/* Hero Section with Branding */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          {/* Brand Logos */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <img src="/branding/gugo-runner.png" alt="GUGO Runner" className="w-20 h-20 animate-bounce" />
            <div className="text-4xl font-black text-orange-400">×</div>
            <img src="/branding/bearish-logo.png" alt="BEARISH" className="w-24 h-10" />
          </div>

          <h1 className="text-5xl font-black bg-gradient-to-r from-green-400 via-orange-400 to-amber-600 bg-clip-text text-transparent font-orbitron tracking-wider text-neon">
            RUN IT GUGO STRAIGHT!
          </h1>
          <p className="text-gray-300 text-xl font-rajdhani font-medium text-gritty">
            Head-to-head collision battles on Abstract
          </p>

          {/* Partnership Badge */}
          <div className="inline-block p-3 bg-gradient-to-r from-green-900/30 to-amber-900/30 rounded-xl border border-green-500/30">
            <p className="text-green-400 font-bold text-sm">🤝 GUGO × BEARISH Partnership</p>
          </div>
        </div>
      </div>

      {/* Connect Card */}
      <Card className="bg-gray-900/80 backdrop-blur-sm border-2 border-gray-700/50 shadow-2xl">
        <CardHeader className="text-center space-y-3">
          
          <p className="text-gray-400 text-base font-rajdhani">Connect your Abstract Global Wallet to RUN IT GUGO STRAIGHT       </p>
          
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Network Info */}
          

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-900/30 rounded-xl border border-red-500/30">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="space-y-4">
            

            
          </div>

          {/* Connect Button */}
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full h-16 bg-gradient-to-r from-green-500 via-orange-500 to-amber-600 hover:from-green-600 hover:via-orange-600 hover:to-amber-700 text-white font-black text-xl font-orbitron tracking-wide shadow-2xl gugo-glow transition-all duration-200 hover:scale-105 text-gritty disabled:opacity-50 disabled:transform-none border-slate-300"
          >
            {isConnecting ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                CONNECTING TO ABSTRACT...
              </div>
            ) : (
              <div className="flex items-center gap-3 italic">
                <Wallet className="h-7 w-7" />
                CONNECT ABSTRACT WALLET
              </div>
            )}
          </Button>

          {/* Info */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400 font-rajdhani font-medium text-gritty">
              
              <span>• Mock balance</span>
              <span>• Test connection</span>
            </div>
            <p className="text-gray-500 text-xs">{""}       </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
