"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import CharacterSelect from "@/components/character-select"
import BettingPanel from "@/components/betting-panel"
import BattleArena from "@/components/battle-arena"
import WalletConnect from "@/components/wallet-connect"
import BurnMechanism from "@/components/burn-mechanism"
import AchievementsPanel from "@/components/achievements-panel"

export default function RunItStraightGame() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [opponent, setOpponent] = useState(null)
  const [betAmount, setBetAmount] = useState(0)
  const [gamePhase, setGamePhase] = useState("connect") // connect, select, bet, battle, result
  const [userBalance, setUserBalance] = useState(1000) // Mock $GUGO balance
  const [burnApplied, setBurnApplied] = useState(false)
  const [burnType, setBurnType] = useState<string | null>(null)
  const [modifiedOpponent, setModifiedOpponent] = useState(null)
  const [burnCost, setBurnCost] = useState(0)
  const [burnCooldowns, setBurnCooldowns] = useState({
    "odds-boost": 0,
    shield: 0,
    "extra-life": 0,
    "power-surge": 0,
  })
  const [achievements, setAchievements] = useState([])
  const [totalBurned, setTotalBurned] = useState(0)
  const [burnHistory, setBurnHistory] = useState([])
  const [showAchievements, setShowAchievements] = useState(false)
  const [newAchievement, setNewAchievement] = useState(null)

  const handleWalletConnect = (address: string) => {
    console.log("🔗 Wallet connected with address:", address)
    setIsWalletConnected(true)
    setGamePhase("select")
  }

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character)

    // Your COMPLETE challenger roster with proper win rates (ascending order)
    const challengers = [
      {
        id: 1,
        name: "Zombie2",
        image: "/challengers/zombie2.png",
        winRate: 0.25, // Lowest chance to win
        difficulty: "Easy",
        rank: 1,
      },
      {
        id: 2,
        name: "Zombie",
        image: "/challengers/zombie.png",
        winRate: 0.35,
        difficulty: "Easy",
        rank: 2,
      },
      {
        id: 3,
        name: "Vampire",
        image: "/challengers/vampire.png",
        winRate: 0.45,
        difficulty: "Medium",
        rank: 3,
      },
      {
        id: 4,
        name: "Sub-Zero",
        image: "/challengers/subzero.png",
        winRate: 0.55,
        difficulty: "Medium",
        rank: 4,
      },
      {
        id: 5,
        name: "Caveman",
        image: "/challengers/caveman.png",
        winRate: 0.65,
        difficulty: "Hard",
        rank: 5,
      },
      {
        id: 6,
        name: "Squatch",
        image: "/challengers/squatch.png",
        winRate: 0.72,
        difficulty: "Hard",
        rank: 6,
      },
      {
        id: 7,
        name: "Fighter #1",
        image: "/challengers/fighter1.png",
        winRate: 0.78,
        difficulty: "Extreme",
        rank: 7,
      },
      {
        id: 8,
        name: "Raiden",
        image: "/challengers/raiden.png",
        winRate: 0.85,
        difficulty: "Extreme",
        rank: 8,
      },
      {
        id: 9,
        name: "Game",
        image: "/challengers/game.png", // THE FINAL BOSS!
        winRate: 0.92, // Highest chance to win - LEGENDARY!
        difficulty: "Legendary",
        rank: 9,
      },
    ]

    const randomOpponent = challengers[Math.floor(Math.random() * challengers.length)]
    setOpponent(randomOpponent)
    setGamePhase("bet")
  }

  const handleBetPlaced = (amount) => {
    setBetAmount(amount)
    setGamePhase("battle")
  }

  const handleAchievementUnlocked = (achievement) => {
    setNewAchievement(achievement)
    // Auto-hide after 3 seconds
    setTimeout(() => setNewAchievement(null), 3000)
  }

  const handleBurnApplied = (burnType: string, cost: number, newWinRate: number) => {
    setBurnApplied(true)
    setBurnType(burnType)
    setBurnCost(cost)
    setUserBalance((prev) => prev - cost)
    setTotalBurned((prev) => prev + cost)

    // Add to burn history
    const burnRecord = {
      type: burnType,
      cost,
      timestamp: Date.now(),
      opponent: opponent.name,
    }
    setBurnHistory((prev) => [...prev, burnRecord])

    // Set cooldown (in seconds)
    const cooldownTimes = {
      "odds-boost": 30,
      shield: 45,
      "extra-life": 60,
      "power-surge": 90,
    }

    setBurnCooldowns((prev) => ({
      ...prev,
      [burnType]: Date.now() + cooldownTimes[burnType] * 1000,
    }))

    // Create modified opponent with new win rate
    const modifiedOpp = {
      ...opponent,
      winRate: newWinRate,
    }
    setModifiedOpponent(modifiedOpp)
  }

  const handleBattleComplete = (winner, newBalance) => {
    setUserBalance(newBalance)
    setGamePhase("result")
  }

  const resetGame = () => {
    setSelectedCharacter(null)
    setOpponent(null)
    setBetAmount(0)
    setBurnApplied(false)
    setBurnType(null)
    setModifiedOpponent(null)
    setBurnCost(0)
    setGamePhase("select")
    // Don't reset cooldowns and achievements - they persist across games
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Gritty Header */}
      <div className="backdrop-blur-sm bg-black/40 border-b border-gray-700/50"></div>

      {/* Main Content */}
      <div className="p-4 max-w-md mx-auto pb-20">
        {gamePhase === "connect" && <WalletConnect onConnect={handleWalletConnect} />}
        {gamePhase === "select" && <CharacterSelect onSelect={handleCharacterSelect} />}
        {gamePhase === "bet" && selectedCharacter && opponent && (
          <div className="space-y-4">
            <BettingPanel
              character={selectedCharacter}
              opponent={opponent}
              userBalance={userBalance}
              onBetPlaced={handleBetPlaced}
            />

            {!burnApplied && (
              <>
                <BurnMechanism
                  character={selectedCharacter}
                  opponent={opponent}
                  userBalance={userBalance}
                  burnCooldowns={burnCooldowns}
                  onBurnApplied={handleBurnApplied}
                />

                <AchievementsPanel
                  totalBurned={totalBurned}
                  burnHistory={burnHistory}
                  onAchievementUnlocked={handleAchievementUnlocked}
                />
              </>
            )}

            {burnApplied && (
              <Card className="bg-green-900/30 border-green-500/50">
                <CardContent className="p-4 text-center">
                  <p className="text-green-400 font-bold">🔥 {burnType?.replace("-", " ").toUpperCase()} ACTIVATED!</p>
                  <p className="text-white/80 text-sm">Burned {burnCost.toLocaleString()} $GUGO for battle advantage</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        {gamePhase === "battle" && (
          <BattleArena
            character={selectedCharacter}
            opponent={modifiedOpponent || opponent}
            betAmount={betAmount}
            userBalance={userBalance}
            burnType={burnType}
            onBattleComplete={handleBattleComplete}
            onRunItAgain={() => setGamePhase("bet")}
            onBackToSelect={() => {
              setSelectedCharacter(null)
              setOpponent(null)
              setBetAmount(0)
              setBurnApplied(false)
              setBurnType(null)
              setModifiedOpponent(null)
              setBurnCost(0)
              setGamePhase("select")
            }}
          />
        )}
      </div>
      {newAchievement && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 border-2 border-yellow-300 shadow-2xl shadow-yellow-500/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-white" />
                <div>
                  <p className="text-white font-black text-lg">ACHIEVEMENT UNLOCKED!</p>
                  <p className="text-white/90 font-bold">{newAchievement.name}</p>
                  <p className="text-white/80 text-sm">{newAchievement.reward}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
