"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Flame, Zap, Shield, RotateCcw, TrendingUp } from "lucide-react"

interface Character {
  id: string
  name: string
  image: string
  winRate?: number
  rank?: number
  difficulty?: string
}

interface BurnMechanismProps {
  character: Character
  opponent: Character
  userBalance: number
  burnCooldowns: { [key: string]: number }
  onBurnApplied: (burnType: string, amount: number, newWinRate: number) => void
}

export default function BurnMechanism({
  character,
  opponent,
  userBalance,
  burnCooldowns,
  onBurnApplied,
}: BurnMechanismProps) {
  const [selectedBurn, setSelectedBurn] = useState<string | null>(null)
  const [burnAmount, setBurnAmount] = useState(100)
  const [cooldownTimers, setCooldownTimers] = useState<{ [key: string]: number }>({})

  // Update cooldown timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const newTimers = {}

      Object.keys(burnCooldowns).forEach((burnType) => {
        const cooldownEnd = burnCooldowns[burnType]
        if (cooldownEnd > now) {
          newTimers[burnType] = Math.ceil((cooldownEnd - now) / 1000)
        }
      })

      setCooldownTimers(newTimers)
    }, 1000)

    return () => clearInterval(interval)
  }, [burnCooldowns])

  const opponentWinRate = opponent.winRate || 0.5
  const opponentRank = opponent.rank || 5

  // Burn options with different costs and effects
  const burnOptions = [
    {
      id: "odds-boost",
      name: "Odds Boost",
      icon: <TrendingUp className="h-5 w-5 text-lime-600" />,
      description: "Reduce opponent's win rate",
      baseCost: 200,
      maxReduction: 0.15,
      color: "from-green-400 to-green-600",
      cooldown: 30, // seconds
      effect: (amount: number) => {
        const reduction = Math.min((amount / 1000) * 0.15, 0.15)
        return Math.max(opponentWinRate - reduction, 0.1)
      },
    },
    {
      id: "shield",
      name: "Battle Shield",
      icon: <Shield className="h-5 w-5 text-cyan-700" />,
      description: "50% chance to avoid loss",
      baseCost: 300,
      color: "from-blue-400 to-blue-600",
      cooldown: 45,
      effect: () => opponentWinRate,
    },
    {
      id: "extra-life",
      name: "Extra Life",
      icon: <RotateCcw className="h-5 w-5 text-purple-600" />,
      description: "Get a second chance if you lose",
      baseCost: 500,
      color: "from-purple-400 to-purple-600",
      cooldown: 60,
      effect: () => opponentWinRate,
    },
    {
      id: "power-surge",
      name: "Power Surge",
      icon: <Zap className="h-5 w-5 text-amber-400" />,
      description: "Massive win rate boost vs strong opponents",
      baseCost: 800,
      maxReduction: 0.25,
      color: "from-yellow-400 to-orange-500",
      cooldown: 90,
      effect: (amount: number) => {
        const reduction = Math.min((amount / 1500) * 0.25, 0.25)
        return Math.max(opponentWinRate - reduction, 0.05)
      },
    },
  ]

  const selectedOption = burnOptions.find((option) => option.id === selectedBurn)

  const calculateCost = (option: any, amount: number) => {
    // Higher rank opponents cost more to burn against
    const rankMultiplier = 1 + opponentRank * 0.2
    return Math.floor(option.baseCost * rankMultiplier * (amount / 100))
  }

  const calculateNewWinRate = (option: any, amount: number) => {
    if (option.effect) {
      return option.effect(amount)
    }
    return opponentWinRate
  }

  const handleBurnAmountChange = (value: number[]) => {
    setBurnAmount(value[0])
  }

  const applyBurn = () => {
    if (!selectedOption) return

    const cost = calculateCost(selectedOption, burnAmount)
    const newWinRate = calculateNewWinRate(selectedOption, burnAmount)

    onBurnApplied(selectedBurn!, cost, newWinRate)
  }

  const canAfford = selectedOption ? calculateCost(selectedOption, burnAmount) <= userBalance : false
  const isOnCooldown = selectedOption ? cooldownTimers[selectedOption.id] > 0 : false

  return (
    <Card className="bg-black/70 backdrop-blur-sm border-2 border-orange-500/60 shadow-2xl shadow-orange-500/30 relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 animate-pulse"></div>

      <CardHeader className="text-center pb-4 relative z-10">
        <CardTitle className="text-2xl text-white flex items-center justify-center gap-3 font-orbitron font-black text-gritty">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/50">
            <Flame className="h-5 w-5 text-white" />
          </div>
          BURN $GUGO FOR POWER
        </CardTitle>
        <p className="text-orange-300/90 text-base font-rajdhani font-medium text-gritty">
          🔥 Sacrifice tokens for battle advantages
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Burn Options */}
        <div className="grid grid-cols-2 gap-3">
          {burnOptions.map((option) => {
            const cost = calculateCost(option, burnAmount)
            const newWinRate = calculateNewWinRate(option, burnAmount)
            const improvement = ((opponentWinRate - newWinRate) * 100).toFixed(1)
            const isOnCooldown = cooldownTimers[option.id] > 0
            const cooldownTime = cooldownTimers[option.id] || 0

            return (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  isOnCooldown
                    ? "bg-gray-900/80 border-2 border-red-500/70 opacity-60 shadow-lg shadow-red-500/20"
                    : selectedBurn === option.id
                      ? `bg-gradient-to-br ${option.color} border-2 border-white/80 shadow-2xl shadow-current/50 scale-105`
                      : `bg-gray-800/60 border-2 border-gray-600/50 hover:bg-gradient-to-br hover:${option.color} hover:border-white/60 hover:shadow-xl hover:shadow-current/30`
                }`}
                onClick={() => !isOnCooldown && setSelectedBurn(option.id)}
              >
                <CardContent className="p-4 text-center relative overflow-hidden">
                  {/* Animated background effect for selected option */}
                  {selectedBurn === option.id && !isOnCooldown && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                  )}

                  <div
                    className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center transition-all duration-300 ${
                      isOnCooldown
                        ? "bg-red-700/60 shadow-lg shadow-red-500/30"
                        : selectedBurn === option.id
                          ? "bg-white/30 shadow-xl shadow-white/50 scale-110"
                          : "bg-gray-700/60 group-hover:bg-white/20 group-hover:shadow-lg"
                    }`}
                  >
                    <div
                      className={`transition-all duration-300 ${
                        selectedBurn === option.id ? "text-white scale-125" : "text-gray-300"
                      }`}
                    >
                      {option.icon}
                    </div>
                  </div>

                  <h3
                    className={`text-base font-black mb-2 transition-all duration-300 ${
                      isOnCooldown
                        ? "text-red-400"
                        : selectedBurn === option.id
                          ? "text-white text-shadow-lg"
                          : "text-white/90"
                    }`}
                  >
                    {option.name}
                  </h3>

                  <p
                    className={`text-sm mb-3 transition-all duration-300 ${
                      isOnCooldown ? "text-red-300/70" : selectedBurn === option.id ? "text-white/90" : "text-white/70"
                    }`}
                  >
                    {option.description}
                  </p>

                  {isOnCooldown ? (
                    <div className="space-y-2">
                      <Badge className="text-sm bg-red-600/90 text-white font-bold px-3 py-1 shadow-lg">
                        🔥 COOLDOWN: {cooldownTime}s
                      </Badge>
                      <div className="w-full bg-gray-700/60 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-1000 shadow-lg shadow-red-500/50"
                          style={{ width: `${((option.cooldown - cooldownTime) / option.cooldown) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Badge
                        className={`text-sm font-bold px-3 py-2 shadow-lg transition-all duration-300 ${
                          selectedBurn === option.id
                            ? "bg-white/20 text-white border border-white/30"
                            : "bg-black/40 text-orange-300 border border-orange-500/30"
                        }`}
                      >
                        💰 {cost.toLocaleString()} $GUGO
                      </Badge>

                      {(option.id === "odds-boost" || option.id === "power-surge") && (
                        <div
                          className={`text-sm font-bold transition-all duration-300 text-yellow-200 ${
                            selectedBurn === option.id ? "text-green-300 text-shadow-md" : "text-green-400"
                          }`}
                        >
                          ⚡ -{improvement}% enemy win rate
                        </div>
                      )}

                      {option.id === "shield" && (
                        <div
                          className={`text-sm font-bold transition-all duration-300 ${
                            selectedBurn === option.id ? "text-blue-300 text-shadow-md" : "text-blue-400"
                          }`}
                        >
                          🛡️ 50% loss protection
                        </div>
                      )}

                      {option.id === "extra-life" && (
                        <div
                          className={`text-sm font-bold transition-all duration-300 ${
                            selectedBurn === option.id ? "text-purple-300 text-shadow-md" : "text-purple-400"
                          }`}
                        >
                          ❤️ Second chance
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Burn Amount Slider */}
        {selectedOption && (
          <div className="space-y-3 p-4 bg-gray-900/50 rounded-xl border border-orange-500/30">
            <div className="flex justify-between items-center">
              <span className="text-white/80 text-sm font-medium">Burn Intensity</span>
              <div className="flex items-center gap-2">
                <span className="text-orange-400 font-bold">{burnAmount}%</span>
              </div>
            </div>

            <Slider
              value={[burnAmount]}
              onValueChange={handleBurnAmountChange}
              max={100}
              min={10}
              step={10}
              className="w-full"
            />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Cost:</span>
                <span className="text-orange-400 font-bold">
                  {calculateCost(selectedOption, burnAmount).toLocaleString()} $GUGO
                </span>
              </div>

              {(selectedOption.id === "odds-boost" || selectedOption.id === "power-surge") && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">New Enemy Win Rate:</span>
                  <span className="text-green-400 font-bold">
                    {(calculateNewWinRate(selectedOption, burnAmount) * 100).toFixed(1)}%
                  </span>
                </div>
              )}

              {selectedOption.id === "shield" && (
                <div className="text-center">
                  <span className="text-blue-400 text-sm font-bold">🛡️ 50% chance to avoid bet loss</span>
                </div>
              )}

              {selectedOption.id === "extra-life" && (
                <div className="text-center">
                  <span className="text-purple-400 text-sm font-bold">❤️ Second chance if you lose</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Apply Burn Button */}
        {selectedOption && (
          <Button
            onClick={applyBurn}
            disabled={!canAfford || isOnCooldown}
            className={`w-full h-14 bg-gradient-to-r ${selectedOption.color} hover:opacity-90 disabled:opacity-50 font-black text-lg text-white shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20 hover:border-white/40 relative overflow-hidden`}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>

            <div className="relative z-10 flex items-center justify-center gap-2">
              <Flame className="h-6 w-6" />
              {isOnCooldown
                ? `🔥 COOLDOWN: ${cooldownTimers[selectedOption.id]}s`
                : `🔥 BURN ${calculateCost(selectedOption, burnAmount).toLocaleString()} $GUGO`}
            </div>
          </Button>
        )}

        <div className="text-center">
          <p className="text-white/60 text-xs">
            {selectedOption && !canAfford ? "Insufficient $GUGO to burn" : "Choose a burn option to gain advantages"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
