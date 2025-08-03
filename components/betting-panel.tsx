"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Coins, Flame, Skull } from "lucide-react"

interface Character {
  id: string
  name: string
  image: string
  collection?: string
  rarity?: string
  winRate?: number
  difficulty?: string
  rank?: number
}

interface BettingPanelProps {
  character: Character
  opponent: Character
  userBalance: number
  onBetPlaced: (amount: number) => void
}

export default function BettingPanel({ character, opponent, userBalance, onBetPlaced }: BettingPanelProps) {
  const [betAmount, setBetAmount] = useState(100)

  const opponentWinRate = opponent.winRate || 0.5
  const opponentRank = opponent.rank || 5

  // Dynamic multiplier based on opponent strength
  const getMultiplier = (rank, winRate) => {
    if (rank <= 2) return 1.2 // Easy opponents, low payout
    if (rank <= 4) return 1.8 // Medium opponents
    if (rank <= 6) return 2.5 // Hard opponents
    if (rank <= 8) return 3.5 // Extreme opponents
    return 5.0 // Legendary opponents, high risk/reward
  }

  const multiplier = getMultiplier(opponentRank, opponentWinRate)
  const potentialWin = Math.floor(betAmount * multiplier)

  const handleBetAmountChange = (value: number[]) => {
    setBetAmount(value[0])
  }

  const handleRunItStraight = () => {
    onBetPlaced(betAmount)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "from-green-400 to-green-600"
      case "Medium":
        return "from-yellow-400 to-orange-500"
      case "Hard":
        return "from-red-400 to-red-600"
      case "Extreme":
        return "from-purple-400 to-purple-600"
      case "Legendary":
        return "from-yellow-300 to-yellow-500"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  const getRiskLevel = (winRate: number) => {
    if (winRate >= 0.85) return { text: "LEGENDARY RISK", color: "text-yellow-400", icon: "👑" }
    if (winRate >= 0.75) return { text: "EXTREME RISK", color: "text-purple-400", icon: "⚡" }
    if (winRate >= 0.6) return { text: "HIGH RISK", color: "text-red-400", icon: "🔥" }
    if (winRate >= 0.45) return { text: "MEDIUM RISK", color: "text-orange-400", icon: "⚠️" }
    return { text: "LOW RISK", color: "text-green-400", icon: "✅" }
  }

  const risk = getRiskLevel(opponentWinRate)

  return (
    <div className="space-y-4">
      {/* GUGO Branding Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src="/branding/gugo-runner.png" alt="GUGO Runner" className="w-12 h-12" />
          <h2 className="text-2xl font-black bg-gradient-to-r from-green-400 to-orange-400 bg-clip-text text-transparent font-orbitron">
            GUGO BATTLE ARENA
          </h2>
        </div>
      </div>

      {/* OPPONENT REVEALED */}
      <Card className="bg-black/60 backdrop-blur-sm border-red-500/50 shadow-2xl shadow-red-500/20">
        <CardHeader className="text-center pb-3">
          <CardTitle className="text-xl text-white flex items-center justify-center gap-2">
            <Skull className="h-6 w-6 text-red-400" />
            YOUR OPPONENT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-3">
            <div className="relative">
              <img
                src={opponent.image || "/placeholder.svg"}
                alt={opponent.name}
                className="w-24 h-24 rounded-xl mx-auto border-3 border-red-400/70 shadow-lg shadow-red-400/30"
              />
              <Badge
                className={`absolute -top-2 -right-2 bg-gradient-to-r ${getDifficultyColor(opponent.difficulty || "Medium")} text-white text-sm px-3 py-1 font-bold`}
              >
                {opponent.difficulty}
              </Badge>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-1">{opponent.name}</h3>
              <div className={`text-sm font-bold ${risk.color} flex items-center justify-center gap-1`}>
                <span>{risk.icon}</span>
                <span>{risk.text}</span>
              </div>
              <p className="text-white/60 text-sm mt-1">{Math.floor(opponentWinRate * 100)}% win rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BETTING INTERFACE */}
      <Card className="bg-black/60 backdrop-blur-sm border-green-500/50 shadow-2xl gugo-glow">
        <CardHeader className="text-center pb-3">
          <CardTitle className="text-lg text-white flex items-center justify-center gap-2">
            <Coins className="h-5 w-5 text-green-400" />
            PLACE YOUR $GUGO BET
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bet Amount Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/80 text-sm font-medium">Wager Amount</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">{betAmount.toLocaleString()}</span>
                <span className="text-green-400 text-sm font-medium">$GUGO</span>
              </div>
            </div>

            <Slider
              value={[betAmount]}
              onValueChange={handleBetAmountChange}
              max={userBalance}
              min={50}
              step={50}
              className="w-full"
            />

            <div className="flex justify-between text-xs text-white/50">
              <span>50 min</span>
              <span>{userBalance.toLocaleString()} max</span>
            </div>
          </div>

          {/* Payout Preview */}
          <div className="p-4 bg-gradient-to-r from-green-900/30 to-orange-900/30 rounded-xl border border-green-400/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 text-sm">Multiplier</span>
              <span className="text-orange-400 font-bold text-lg">{multiplier}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80 text-sm">Potential Win</span>
              <div className="flex items-center gap-1">
                <span className="text-green-400 font-bold text-lg">{potentialWin.toLocaleString()}</span>
                <span className="text-green-400 text-sm">$GUGO</span>
              </div>
            </div>
          </div>

          {/* RUN IT STRAIGHT BUTTON */}
          <Button
            onClick={handleRunItStraight}
            disabled={betAmount > userBalance}
            className="w-full h-16 bg-gradient-to-r from-green-500 via-orange-500 to-amber-600 hover:from-green-600 hover:via-orange-600 hover:to-amber-700 disabled:opacity-50 font-black text-xl shadow-2xl gugo-glow transform hover:scale-105 transition-all duration-200"
          >
            <Flame className="h-6 w-6 mr-3" />
            RUN IT STRAIGHT! 💥
          </Button>

          {/* PLAY FOR FUN BUTTON */}
          <Button
            onClick={() => onBetPlaced(0)}
            className="w-full h-12 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            🎮 PLAY FOR FUN (No Bet)
          </Button>

          <div className="text-center">
            <p className="text-white/60 text-xs">
              {betAmount > userBalance ? "Insufficient balance" : "Ready to collide head-to-head or play for fun!"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
