"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Flame, Shield, Zap, RotateCcw, Star, Crown, Target } from "lucide-react"

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  requirement: number
  current: number
  unlocked: boolean
  rarity: "common" | "rare" | "epic" | "legendary"
  reward: string
}

interface AchievementsPanelProps {
  totalBurned: number
  burnHistory: Array<{
    type: string
    cost: number
    timestamp: number
    opponent: string
  }>
  onAchievementUnlocked: (achievement: Achievement) => void
}

export default function AchievementsPanel({ totalBurned, burnHistory, onAchievementUnlocked }: AchievementsPanelProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])

  // Define all achievements
  const achievementDefinitions: Omit<Achievement, "current" | "unlocked">[] = [
    {
      id: "first-burn",
      name: "First Flame",
      description: "Burn $GUGO for the first time",
      icon: <Flame className="h-5 w-5 text-orange-600" />,
      requirement: 1,
      rarity: "common",
      reward: "+100 $GUGO bonus",
    },
    {
      id: "burn-1000",
      name: "Pyromaniac",
      description: "Burn 1,000 total $GUGO",
      icon: <Flame className="h-5 w-5 text-orange-600" />,
      requirement: 1000,
      rarity: "rare",
      reward: "+500 $GUGO bonus",
    },
    {
      id: "burn-5000",
      name: "Inferno Master",
      description: "Burn 5,000 total $GUGO",
      icon: <Flame className="h-5 w-5 text-orange-600" />,
      requirement: 5000,
      rarity: "epic",
      reward: "+1,000 $GUGO bonus",
    },
    {
      id: "burn-10000",
      name: "Phoenix Lord",
      description: "Burn 10,000 total $GUGO",
      icon: <Crown className="h-5 w-5 text-yellow-400" />,
      requirement: 10000,
      rarity: "legendary",
      reward: "+2,500 $GUGO bonus",
    },
    {
      id: "shield-master",
      name: "Shield Wall",
      description: "Use Battle Shield 10 times",
      icon: <Shield className="h-5 w-5 text-cyan-600" />,
      requirement: 10,
      rarity: "rare",
      reward: "Shield cost -20%",
    },
    {
      id: "power-surge-adept",
      name: "Lightning Rod",
      description: "Use Power Surge 5 times",
      icon: <Zap className="h-5 w-5 text-amber-300" />,
      requirement: 5,
      rarity: "epic",
      reward: "Power Surge cost -15%",
    },
    {
      id: "extra-life-veteran",
      name: "Nine Lives",
      description: "Use Extra Life 3 times",
      icon: <RotateCcw className="h-5 w-5 text-lime-500" />,
      requirement: 3,
      rarity: "epic",
      reward: "Extra Life cost -25%",
    },
    {
      id: "odds-specialist",
      name: "Probability Hacker",
      description: "Use Odds Boost 20 times",
      icon: <Target className="h-5 w-5 text-violet-500" />,
      requirement: 20,
      rarity: "rare",
      reward: "Odds Boost effectiveness +10%",
    },
    {
      id: "big-spender",
      name: "High Roller",
      description: "Burn 1,000+ $GUGO in a single use",
      icon: <Star className="h-5 w-5 text-red-600" />,
      requirement: 1000,
      rarity: "epic",
      reward: "All burns cost -10%",
    },
    {
      id: "burn-streak",
      name: "Burning Streak",
      description: "Use burns in 5 consecutive battles",
      icon: <Flame className="h-5 w-5 text-orange-600" />,
      requirement: 5,
      rarity: "rare",
      reward: "Burn cooldowns -25%",
    },
  ]

  // Calculate current progress for each achievement
  useEffect(() => {
    const updatedAchievements = achievementDefinitions.map((def) => {
      let current = 0

      switch (def.id) {
        case "first-burn":
        case "burn-1000":
        case "burn-5000":
        case "burn-10000":
          current = totalBurned
          break
        case "shield-master":
          current = burnHistory.filter((b) => b.type === "shield").length
          break
        case "power-surge-adept":
          current = burnHistory.filter((b) => b.type === "power-surge").length
          break
        case "extra-life-veteran":
          current = burnHistory.filter((b) => b.type === "extra-life").length
          break
        case "odds-specialist":
          current = burnHistory.filter((b) => b.type === "odds-boost").length
          break
        case "big-spender":
          current = Math.max(...burnHistory.map((b) => b.cost), 0)
          break
        case "burn-streak":
          // Calculate consecutive battles with burns (simplified)
          current = Math.min(burnHistory.length, 5)
          break
      }

      const wasUnlocked = achievements.find((a) => a.id === def.id)?.unlocked || false
      const isNowUnlocked = current >= def.requirement

      // Trigger achievement unlock callback
      if (!wasUnlocked && isNowUnlocked) {
        const newAchievement = { ...def, current, unlocked: true }
        setTimeout(() => onAchievementUnlocked(newAchievement), 100)
      }

      return {
        ...def,
        current: Math.min(current, def.requirement),
        unlocked: current >= def.requirement,
      }
    })

    setAchievements(updatedAchievements)
  }, [totalBurned, burnHistory])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "from-gray-400 to-gray-600"
      case "rare":
        return "from-blue-400 to-cyan-500"
      case "epic":
        return "from-purple-400 to-pink-500"
      case "legendary":
        return "from-yellow-400 to-orange-500"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-500/60"
      case "rare":
        return "border-blue-500/60"
      case "epic":
        return "border-purple-500/60"
      case "legendary":
        return "border-yellow-500/60"
      default:
        return "border-gray-500/60"
    }
  }

  const getRarityShadow = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "shadow-gray-500/20"
      case "rare":
        return "shadow-blue-500/30"
      case "epic":
        return "shadow-purple-500/30"
      case "legendary":
        return "shadow-yellow-500/40"
      default:
        return "shadow-gray-500/20"
    }
  }

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "shadow-gray-500/20"
      case "rare":
        return "shadow-blue-400/40"
      case "epic":
        return "shadow-purple-400/40"
      case "legendary":
        return "shadow-yellow-400/50"
      default:
        return "shadow-gray-500/20"
    }
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalCount = achievements.length

  return (
    <Card className="bg-black/70 backdrop-blur-sm border-2 border-purple-500/60 shadow-2xl shadow-purple-500/30 relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-yellow-500/5 animate-pulse"></div>

      <CardHeader className="text-center pb-4 relative z-10">
        <CardTitle className="text-2xl text-white flex items-center justify-center gap-3 font-orbitron font-black text-gritty">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/50">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          BURN ACHIEVEMENTS
        </CardTitle>
        <div className="flex items-center justify-center gap-3 text-base mt-2">
          <span className="text-white/90 font-rajdhani font-bold">
            🏆 {unlockedCount}/{totalCount} Unlocked
          </span>
          <div className="w-32 relative">
            <Progress
              value={(unlockedCount / totalCount) * 100}
              className="h-3 bg-gray-800/60 border border-yellow-500/30 shadow-lg shadow-yellow-500/20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-80 overflow-y-auto relative z-10">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-102 relative overflow-hidden ${
              achievement.unlocked
                ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)} ${getRarityBorder(achievement.rarity)} shadow-xl ${getRarityShadow(achievement.rarity)} hover:shadow-2xl hover:${getRarityGlow(achievement.rarity)}`
                : "bg-gray-800/60 border-gray-600/50 hover:bg-gray-700/60 hover:border-gray-500/70 shadow-lg hover:shadow-xl"
            }`}
          >
            {/* Animated shine effect for unlocked achievements */}
            {achievement.unlocked && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
            )}

            <div className="flex items-start gap-4 relative z-10">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  achievement.unlocked
                    ? `bg-white/20 shadow-xl ${getRarityGlow(achievement.rarity)} scale-110`
                    : "bg-gray-700/60 shadow-lg hover:bg-gray-600/70"
                }`}
              >
                <div
                  className={`transition-all duration-300 ${
                    achievement.unlocked ? "text-white scale-125" : "text-gray-400"
                  }`}
                >
                  {achievement.icon}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3
                    className={`text-base font-black truncate transition-all duration-300 ${
                      achievement.unlocked ? "text-white text-shadow-lg" : "text-white/80"
                    }`}
                  >
                    {achievement.name}
                  </h3>
                  <Badge
                    className={`text-xs font-bold px-2 py-1 shadow-lg transition-all duration-300 ${
                      achievement.unlocked
                        ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white border border-white/30`
                        : "bg-gray-700/80 text-gray-300 border border-gray-600/50"
                    }`}
                  >
                    ✨ {achievement.rarity.toUpperCase()}
                  </Badge>
                </div>

                <p
                  className={`text-sm mb-3 transition-all duration-300 ${
                    achievement.unlocked ? "text-white/90" : "text-white/60"
                  }`}
                >
                  {achievement.description}
                </p>

                {!achievement.unlocked && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60 font-medium">Progress</span>
                      <span className="text-white/80 font-bold">
                        {achievement.current.toLocaleString()}/{achievement.requirement.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={(achievement.current / achievement.requirement) * 100}
                        className="h-2 bg-gray-700/60 border border-gray-600/50 shadow-inner"
                      />
                      {/* Animated progress glow */}
                      <div
                        className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500 shadow-lg shadow-blue-400/30"
                        style={{ width: `${(achievement.current / achievement.requirement) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {achievement.unlocked && (
                  <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg border border-white/20 shadow-inner">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/50">
                      <Star className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm text-yellow-300 font-bold">🎁 {achievement.reward}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {achievements.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="h-16 w-16 mx-auto text-gray-500 mb-3" />
            <p className="text-gray-400 font-rajdhani font-medium">Start burning $GUGO to unlock achievements!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
