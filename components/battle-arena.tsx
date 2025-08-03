"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Zap, Trophy, Skull, Coins, Flame, RotateCcw, Clock } from "lucide-react"
import { falImageService } from "@/lib/fal"

interface Character {
  id: string
  name: string
  image: string
  winRate?: number
  rank?: number
}

interface BattleArenaProps {
  character: Character
  opponent: Character
  betAmount: number
  userBalance: number
  burnType?: string | null
  onBattleComplete: (winner: "player" | "opponent", newBalance: number) => void
  onRunItAgain?: () => void
  onBackToSelect?: () => void
}

export default function BattleArena({
  character,
  opponent,
  betAmount,
  userBalance,
  burnType,
  onBattleComplete,
  onRunItAgain,
  onBackToSelect,
}: BattleArenaProps) {
  const [battlePhase, setBattlePhase] = useState("ready") // ready, countdown, charging, collision, fatality
  const [winner, setWinner] = useState<"player" | "opponent" | null>(null)
  const [contenderImage, setContenderImage] = useState("")
  const [challengerImage, setChallengerImage] = useState("")
  const [fatalityImage, setFatalityImage] = useState("")
  const [countdown, setCountdown] = useState(3)
  const [battleCommentary, setBattleCommentary] = useState("")
  const [playerPosition, setPlayerPosition] = useState(10)
  const [opponentPosition, setOpponentPosition] = useState(90)
  const [collisionIntensity, setCollisionIntensity] = useState(0)
  const [screenShake, setScreenShake] = useState(false)
  const [showingPOV, setShowingPOV] = useState(false)
  const [currentPOV, setCurrentPOV] = useState<"contender" | "challenger" | null>(null)
  const [imageGenerating, setImageGenerating] = useState(false)
  const [fatalityGenerating, setFatalityGenerating] = useState(false)
  const [generationTimer, setGenerationTimer] = useState(0)

  const startBattle = async () => {
    setBattlePhase("countdown")

    // 3-2-1 Countdown
    for (let i = 3; i >= 1; i--) {
      setCountdown(i)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // PHASE 1: CONTENDER POV GENERATION (10 seconds max)
    setBattlePhase("charging")
    setBattleCommentary("🎨 GENERATING YOUR FIGHTER'S POV...")
    console.log("🥊 PHASE 1: Starting contender POV generation...")

    // Generate contender POV
    await generateContenderPOV()

    // Wait a moment for state to update, then check
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Show contender POV for 30 seconds
    console.log("🥊 Checking contender image:", contenderImage)
    setBattleCommentary("📸 YOUR FIGHTER'S VIEW!")
    setShowingPOV(true)
    setCurrentPOV("contender")
    await new Promise((resolve) => setTimeout(resolve, 15000)) // 20 seconds display
    setShowingPOV(false)
    setCurrentPOV(null)

    setBattleCommentary("FIGHTERS ARE CHARGING!")

    // Charging animation (faster)
    for (let i = 0; i <= 100; i += 2) {
      setPlayerPosition(10 + i * 0.35)
      setOpponentPosition(90 - i * 0.35)

      if (i === 50) setBattleCommentary("FULL SPEED AHEAD!")
      if (i === 80) setBattleCommentary("COLLISION IMMINENT!")

      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    // PHASE 2: CHALLENGER POV GENERATION (10 seconds max)
    setBattlePhase("collision")
    setBattleCommentary("🎨 GENERATING CHALLENGER'S POV...")
    setScreenShake(true)
    console.log("⚔️ PHASE 2: Starting challenger POV generation...")

    // Generate challenger POV
    await generateChallengerPOV()

    // Wait a moment for state to update, then check
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Show challenger POV for 30 seconds
    console.log("⚔️ Checking challenger image:", challengerImage)
    setBattleCommentary("📸 CHALLENGER'S VIEW!")
    setShowingPOV(true)
    setCurrentPOV("challenger")
    await new Promise((resolve) => setTimeout(resolve, 15000)) // 20 seconds display
    setShowingPOV(false)
    setCurrentPOV(null)

    setBattleCommentary("💥 FINAL IMPACT! 💥")

    // Collision intensity animation
    for (let i = 0; i <= 100; i += 10) {
      setCollisionIntensity(i)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    setScreenShake(false)

    // Determine winner with burn effects
    const opponentWinRate = opponent.winRate || 0.5
    const randomValue = Math.random()

    // Apply burn effects
    let battleWinner: "player" | "opponent" = randomValue > opponentWinRate ? "player" : "opponent"

    // Handle special burn effects
    if (burnType === "shield" && battleWinner === "opponent" && betAmount > 0) {
      if (Math.random() < 0.5) {
        battleWinner = "player"
        setBattleCommentary("🛡️ SHIELD ACTIVATED! Loss avoided!")
      }
    } else if (burnType === "extra-life" && battleWinner === "opponent") {
      const secondChance = Math.random() > opponentWinRate
      if (secondChance) {
        battleWinner = "player"
        setBattleCommentary("❤️ EXTRA LIFE! Second chance victory!")
      }
    }

    setWinner(battleWinner)

    // PHASE 3: FATALITY GENERATION (10 seconds max)
    setBattlePhase("fatality")
    setBattleCommentary("🎯 GENERATING EPIC FATALITY SCENE...")
    console.log("🎯 PHASE 3: Starting fatality generation...")

    // Generate fatality image
    await generateFatalityImage(battleWinner)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait for state update

    setBattleCommentary(battleWinner === "player" ? "🏆 FATALITY! YOU WIN!" : "💀 FATALITY! YOU LOSE!")

    // Calculate new balance
    // let newBalance = userBalance
    // if (betAmount > 0) {
    //   if (battleWinner === "player") {
    //     const opponentRank = opponent.rank || 5
    //     const getMultiplier = (rank) => {
    //       if (rank <= 2) return 1.2
    //       if (rank <= 4) return 1.8
    //       if (rank <= 6) return 2.5
    //       if (rank <= 8) return 3.5
    //       return 5.0
    //     }
    //     const multiplier = getMultiplier(opponentRank)
    //     newBalance = userBalance + Math.floor(betAmount * multiplier) - betAmount
    //   } else {
    //     newBalance = userBalance - betAmount
    //   }
    // }

    // onBattleComplete(battleWinner, newBalance)
  }

  const generateContenderPOV = async () => {
    try {
      setImageGenerating(true)
      console.log("🥊 Starting contender POV generation...")

      const imageUrl = await falImageService.generateBattlePOV(character.name, opponent.name, "charging")
      console.log("🥊 Contender POV result:", imageUrl)

      if (imageUrl) {
        setContenderImage(imageUrl)
        console.log("🥊 Contender image set successfully:", imageUrl)
      } else {
        console.log("🥊 No contender image URL returned, using fallback")
        const contenderQuery = `epic battle scene from ${character.name} perspective charging toward ${opponent.name}, dynamic first person view, intense action`
        setContenderImage(`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(contenderQuery)}`)
      }
    } catch (error) {
      console.error("🥊 Error generating contender POV:", error)
      const contenderQuery = `epic battle scene from ${character.name} perspective charging toward ${opponent.name}, dynamic first person view, intense action`
      setContenderImage(`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(contenderQuery)}`)
    } finally {
      setImageGenerating(false)
    }
  }

  const generateChallengerPOV = async () => {
    try {
      setImageGenerating(true)
      console.log("⚔️ Starting challenger POV generation...")

      const imageUrl = await falImageService.generateBattlePOV(opponent.name, character.name, "collision")
      console.log("⚔️ Challenger POV result:", imageUrl)

      if (imageUrl) {
        setChallengerImage(imageUrl)
        console.log("⚔️ Challenger image set successfully:", imageUrl)
      } else {
        console.log("⚔️ No challenger image URL returned, using fallback")
        const challengerQuery = `epic battle scene from ${opponent.name} perspective during collision with ${character.name}, dynamic first person view, intense impact`
        setChallengerImage(`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(challengerQuery)}`)
      }
    } catch (error) {
      console.error("⚔️ Error generating challenger POV:", error)
      const challengerQuery = `epic battle scene from ${opponent.name} perspective during collision with ${character.name}, dynamic first person view, intense impact`
      setChallengerImage(`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(challengerQuery)}`)
    } finally {
      setImageGenerating(false)
    }
  }

  const generateFatalityImage = async (winner: "player" | "opponent") => {
    try {
      setFatalityGenerating(true)
      console.log("🎯 STARTING FATALITY IMAGE GENERATION...")

      const winnerName = winner === "player" ? character.name : opponent.name
      const loserName = winner === "player" ? opponent.name : character.name

      console.log(`🎯 Generating FATALITY: ${winnerName} defeats ${loserName}`)

      const imageUrl = await falImageService.generateFatalityImage(winnerName, loserName)
      console.log("🎯 FATALITY IMAGE RESULT:", imageUrl)

      if (imageUrl) {
        setFatalityImage(imageUrl)
        console.log("🎯 FATALITY IMAGE SET SUCCESSFULLY:", imageUrl)
      } else {
        console.log("🎯 No fatality image URL returned, using fallback")
        const fatalityQuery = `MORTAL KOMBAT FATALITY: ${winnerName} defeats ${loserName} in epic finishing move, dramatic victory pose, cinematic lighting`
        setFatalityImage(`/placeholder.svg?height=500&width=500&query=${encodeURIComponent(fatalityQuery)}`)
      }
    } catch (error) {
      console.error("🎯 Error generating fatality image:", error)
      const winnerName = winner === "player" ? character.name : opponent.name
      const loserName = winner === "player" ? opponent.name : character.name
      const fatalityQuery = `MORTAL KOMBAT FATALITY: ${winnerName} defeats ${loserName} in epic finishing move, dramatic victory pose, cinematic lighting`
      setFatalityImage(`/placeholder.svg?height=500&width=500&query=${encodeURIComponent(fatalityQuery)}`)
    } finally {
      setFatalityGenerating(false)
    }
  }

  const resetBattle = () => {
    setBattlePhase("ready")
    setWinner(null)
    setContenderImage("")
    setChallengerImage("")
    setFatalityImage("")
    setCountdown(3)
    setBattleCommentary("")
    setPlayerPosition(10)
    setOpponentPosition(90)
    setCollisionIntensity(0)
    setScreenShake(false)
    setShowingPOV(false)
    setCurrentPOV(null)
    setImageGenerating(false)
    setFatalityGenerating(false)
    setGenerationTimer(0)
  }

  return (
    <div className="space-y-4">
      {battlePhase === "ready" && (
        <Card className="bg-black/60 border-purple-500/50 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-500">
              
              READY TO RUN IT?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-purple-900/30 rounded-sm">
              <div className="text-center">
                <img
                  src={character.image || "/placeholder.svg"}
                  alt={character.name}
                  className="w-16 h-16 rounded-lg mx-auto mb-2 border-2 border-green-400"
                />
                <p className="text-sm text-white font-semibold">{character.name}</p>
                <p className="text-xs text-green-400">CONTENDER</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 animate-pulse">VS</div>
                <p className="text-xs text-white/60 mt-1">HEAD-TO-HEAD</p>
              </div>
              <div className="text-center">
                <img
                  src={opponent.image || "/placeholder.svg"}
                  alt={opponent.name}
                  className="w-16 h-16 rounded-lg mx-auto mb-2 border-2 border-red-400"
                />
                <p className="text-sm text-white font-semibold">{opponent.name}</p>
                <p className="text-xs text-red-400">CHALLENGER</p>
              </div>
            </div>

            {betAmount > 0 && (
              <div className="p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-sm">
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <Coins className="h-4 w-4" />
                  <span className="font-semibold">{betAmount.toLocaleString()} $GUGO at stake!</span>
                </div>
              </div>
            )}

            {burnType && (
              <div className="p-3 bg-orange-900/30 border border-orange-500/30 rounded-sm">
                <div className="flex items-center justify-center gap-2 text-orange-400">
                  <Flame className="h-4 w-4" />
                  <span className="font-semibold">{burnType.replace("-", " ").toUpperCase()} ACTIVE!</span>
                </div>
              </div>
            )}

            <Button
              onClick={startBattle}
              className="w-full h-16 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 font-black text-xl shadow-2xl transform hover:scale-105 transition-all text-lime-500 rounded-3xl"
            >
              
              RUN IT STRAIGHT! 💥
            </Button>

            <div className="text-center space-y-2">
              <p className="text-yellow-400 text-sm">🎨 3 AI Generated Images Per Battle:             </p>
              <p className="text-yellow-300 text-xs">Contender POV → Challenger POV → Epic Fatality Scene</p>
            </div>
          </CardContent>
        </Card>
      )}

      {battlePhase === "countdown" && (
        <Card className="bg-black/60 border-red-500/50 shadow-2xl">
          <CardContent className="text-center py-12">
            <div className="space-y-6">
              <h2 className="text-2xl text-white font-bold">GET READY!</h2>
              <div className="text-8xl font-black text-red-400 animate-pulse">{countdown}</div>
              <p className="text-white/80">Epic AI battle starting...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {(battlePhase === "charging" || battlePhase === "collision") && (
        <Card className={`bg-black/60 border-orange-500/50 shadow-2xl ${screenShake ? "animate-bounce" : ""}`}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-orange-400 animate-pulse">{battleCommentary}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Generation Timer */}
            {(imageGenerating || generationTimer > 0) && (
              <div className="p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
                <div className="flex items-center justify-center gap-3 text-yellow-400">
                  <Clock className="h-5 w-5 animate-spin" />
                  <span className="font-bold">AI Generation: {generationTimer}s / 45s</span>
                </div>
                <div className="w-full bg-gray-800/60 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(generationTimer / 45) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* POV Image Overlay - FULL SCREEN TAKEOVER */}
            {showingPOV && (
              <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
                <div className="text-center space-y-6 max-w-4xl mx-auto p-6">
                  {currentPOV === "contender" && (
                    <>
                      <div className="space-y-4">
                        <h2 className="text-5xl font-black text-green-400 font-orbitron animate-pulse">
                          🥊 YOUR FIGHTER'S POV!
                        </h2>
                        <img
                          src={contenderImage || "/placeholder.svg"}
                          alt="Contender POV"
                          className="w-full max-w-4xl mx-auto rounded-2xl border-4 border-green-500 shadow-2xl shadow-green-500/50 transform hover:scale-105 transition-all"
                          onError={(e) => {
                            console.error("Contender image failed to load:", contenderImage)
                            e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                          }}
                          onLoad={() => console.log("🥊 Contender image loaded successfully!")}
                        />
                        <div className="p-6 bg-gradient-to-r from-green-900/70 to-emerald-900/70 rounded-xl border-2 border-green-500/70">
                          <p className="text-green-300 font-bold text-2xl">🎨 AI-Generated by Fal.ai</p>
                          <p className="text-green-200 text-xl mt-2">Charging toward {opponent.name}!</p>
                          <p className="text-green-100 text-lg mt-2">Displaying for 20 seconds...</p>
                        </div>
                      </div>
                    </>
                  )}
                  {currentPOV === "challenger" && (
                    <>
                      <div className="space-y-4">
                        <h2 className="text-5xl font-black text-red-400 font-orbitron animate-pulse">
                          ⚔️ CHALLENGER'S POV!
                        </h2>
                        <img
                          src={challengerImage || "/placeholder.svg"}
                          alt="Challenger POV"
                          className="w-full max-w-4xl mx-auto rounded-2xl border-4 border-red-500 shadow-2xl shadow-red-500/50 transform hover:scale-105 transition-all"
                          onError={(e) => {
                            console.error("Challenger image failed to load:", challengerImage)
                            e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                          }}
                          onLoad={() => console.log("⚔️ Challenger image loaded successfully!")}
                        />
                        <div className="p-6 bg-gradient-to-r from-red-900/70 to-rose-900/70 rounded-xl border-2 border-red-500/70">
                          <p className="text-red-300 font-bold text-2xl">🎨 AI-Generated by Fal.ai</p>
                          <p className="text-red-200 text-xl mt-2">Mid-collision with {character.name}!</p>
                          <p className="text-red-100 text-lg mt-2">Displaying for 20 seconds...</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Battle Arena */}
            <div className="relative h-32 bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-red-900/30 rounded-lg border-2 border-white/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>

              <div
                className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-100"
                style={{ left: `${playerPosition}%` }}
              >
                <img
                  src={character.image || "/placeholder.svg"}
                  alt={character.name}
                  className="w-12 h-12 rounded-lg border-2 border-green-400 shadow-lg shadow-green-400/50"
                />
                <div className="text-xs text-green-400 text-center font-bold mt-1">YOU</div>
              </div>

              <div
                className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-100"
                style={{ left: `${opponentPosition}%` }}
              >
                <img
                  src={opponent.image || "/placeholder.svg"}
                  alt={opponent.name}
                  className="w-12 h-12 rounded-lg border-2 border-red-400 shadow-lg shadow-red-400/50"
                />
                <div className="text-xs text-red-400 text-center font-bold mt-1">ENEMY</div>
              </div>

              {battlePhase === "collision" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl animate-spin">💥</div>
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-lg"></div>
                </div>
              )}

              {battlePhase === "charging" && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 via-transparent to-red-400 animate-pulse"></div>
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-ping"></div>
                </div>
              )}
            </div>

            {battlePhase === "collision" && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">COLLISION INTENSITY</span>
                  <span className="text-orange-400 font-bold">{collisionIntensity}%</span>
                </div>
                <Progress value={collisionIntensity} className="h-3 bg-black/50" />
              </div>
            )}

            <div className="text-center p-3 bg-black/30 rounded-lg border border-white/20">
              <p className="text-white font-bold text-lg">{battleCommentary}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {battlePhase === "fatality" && (
        <div className="space-y-4">
          {/* MASSIVE FATALITY CARD - THE MAIN EVENT! */}
          <Card className="bg-black/80 border-4 border-yellow-500/80 shadow-2xl shadow-yellow-500/50 relative overflow-hidden">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 animate-pulse"></div>

            <CardHeader className="text-center pb-6 relative z-10">
              <CardTitle className="text-4xl font-black font-orbitron">
                {winner === "player" ? (
                  <div className="text-green-400 space-y-3">
                    <Trophy className="h-16 w-16 mx-auto animate-bounce" />
                    <div className="text-6xl font-black text-gritty bg-gradient-to-r from-green-400 via-yellow-400 to-green-400 bg-clip-text text-transparent animate-pulse">
                      FATALITY!
                    </div>
                    <div className="text-3xl text-white text-gritty">YOU WIN!</div>
                  </div>
                ) : (
                  <div className="text-red-400 space-y-3">
                    <Skull className="h-16 w-16 mx-auto animate-bounce" />
                    <div className="text-6xl font-black text-gritty bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                      FATALITY!
                    </div>
                    <div className="text-3xl text-white text-gritty">YOU LOSE!</div>
                  </div>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
              {/* Generation Timer for Fatality */}
              {(fatalityGenerating || generationTimer > 0) && (
                <div className="p-6 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center justify-center gap-3 text-yellow-400 mb-3">
                    <Clock className="h-6 w-6 animate-spin" />
                    <span className="font-bold text-xl">Fatality Generation: {generationTimer}s / 45s</span>
                  </div>
                  <div className="w-full bg-gray-800/60 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all duration-1000"
                      style={{ width: `${(generationTimer / 45) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* EPIC FATALITY IMAGE SECTION */}
              <div className="text-center space-y-6">
                {fatalityImage ? (
                  <div className="space-y-6">
                    <img
                      src={fatalityImage || "/placeholder.svg"}
                      alt="Epic Fatality Scene"
                      className="w-full max-w-4xl mx-auto rounded-2xl border-4 border-yellow-500 shadow-2xl shadow-yellow-500/50 transform hover:scale-105 transition-all duration-300"
                      onError={(e) => {
                        console.error("Fatality image failed to load:", fatalityImage)
                        e.currentTarget.src = "/placeholder.svg?height=500&width=500"
                      }}
                      onLoad={() => console.log("🎯 Fatality image displayed successfully!")}
                    />
                    <div className="p-6 bg-gradient-to-r from-yellow-900/70 to-orange-900/70 rounded-2xl border-2 border-yellow-500/70 shadow-xl">
                      <p className="text-yellow-400 font-black text-3xl mb-3">🎯 EPIC FATALITY CAPTURED!</p>
                      <p className="text-yellow-300 text-xl mb-2">🎨 AI-Generated by Fal.ai</p>
                      <p className="text-yellow-200 text-lg">
                        {winner === "player"
                          ? `${character.name} delivers the finishing blow!`
                          : `${opponent.name} claims victory!`}
                      </p>
                    </div>

                    {/* RUN IT AGAIN BUTTON - DIRECTLY UNDER FATALITY */}
                    <Button
                      onClick={() => onRunItAgain && onRunItAgain()}
                      className="w-full h-20 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 hover:from-red-700 hover:via-orange-600 hover:to-yellow-600 font-black text-2xl font-orbitron tracking-wide shadow-2xl transform hover:scale-105 transition-all duration-200 text-gritty border-4 border-white/20 hover:border-white/40"
                    >
                      <RotateCcw className="h-8 w-8 mr-4" />
                      RUN IT AGAIN! 🔥
                    </Button>
                    <Button
                      onClick={() => onBackToSelect && onBackToSelect()}
                      variant="outline"
                      className="w-full h-12 mt-3 border-gray-500 text-gray-300 hover:bg-gray-700 font-rajdhani font-bold bg-transparent"
                    >
                      ← Back to Character Select
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 py-8">
                    <div className="text-6xl">💥</div>
                    <p className="text-white font-bold text-xl">Epic battle concluded!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
