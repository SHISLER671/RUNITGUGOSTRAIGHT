"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, ImageIcon, Loader2 } from "lucide-react"
import { openSeaService } from "@/lib/opensea"
import WalletInput from "./wallet-input"

interface Character {
  id: string
  name: string
  image: string
  collection?: string
  rarity?: string
  type: "nft" | "upload"
}

interface CharacterSelectProps {
  onSelect: (character: Character) => void
}

export default function CharacterSelect({ onSelect }: CharacterSelectProps) {
  const [nftCharacters, setNftCharacters] = useState<Character[]>([])
  const [selectedCollection, setSelectedCollection] = useState("all")
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [collections, setCollections] = useState([{ id: "all", name: "All Collections" }])
  const [error, setError] = useState<string | null>(null)

  // Load NFTs from OpenSea
  const loadNFTs = async (address: string) => {
    setLoading(true)
    setError(null)

    try {
      // Try Abstract chain first
      console.log("🔗 Loading NFTs from Abstract blockchain...")
      let openSeaNFTs = await openSeaService.getNFTsByOwner(address, 100, "abstract")

      // If no NFTs found on Abstract, try Ethereum
      if (openSeaNFTs.length === 0) {
        console.log("🔗 No NFTs on Abstract, trying Ethereum...")
        openSeaNFTs = await openSeaService.getNFTsByOwner(address, 100, "ethereum")
      }

      if (openSeaNFTs.length === 0) {
        setError("No NFTs found for this wallet address on Abstract or Ethereum")
        setNftCharacters([])
        return
      }

      // Convert to our character format
      const characters = openSeaNFTs.map((nft) => openSeaService.convertToCharacter(nft))
      setNftCharacters(characters)

      // Extract unique collections
      const uniqueCollections = [...new Set(characters.map((char) => char.collection).filter(Boolean))]
      const collectionOptions = [
        { id: "all", name: "All Collections" },
        ...uniqueCollections.map((collection) => ({
          id: collection!.toLowerCase().replace(/\s+/g, "-"),
          name: collection!,
        })),
      ]
      setCollections(collectionOptions)
    } catch (error) {
      console.error("Error loading NFTs:", error)
      setError("Failed to load NFTs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleWalletSubmit = (address: string) => {
    setWalletAddress(address)
    loadNFTs(address)
  }

  // Mock NFT collections
  // const collections = [
  //   { id: "all", name: "All Collections" },
  //   { id: "bearish-bears", name: "Bearish Bears" },
  //   { id: "gugo-warriors", name: "GUGO Warriors" },
  //   { id: "abstract-fighters", name: "Abstract Fighters" },
  //   { id: "crypto-punks", name: "Crypto Punks" },
  // ]

  // Mock NFT data
  // useEffect(() => {
  //   const mockNFTs: Character[] = [
  //     {
  //       id: "1",
  //       name: "Bearish Bear #1337",
  //       image: "/placeholder.svg?height=200&width=200",
  //       collection: "Bearish Bears",
  //       rarity: "Legendary",
  //       type: "nft",
  //     },
  //     {
  //       id: "2",
  //       name: "GUGO Warrior #420",
  //       image: "/placeholder.svg?height=200&width=200",
  //       collection: "GUGO Warriors",
  //       rarity: "Epic",
  //       type: "nft",
  //     },
  //     {
  //       id: "3",
  //       name: "Abstract Fighter #69",
  //       image: "/placeholder.svg?height=200&width=200",
  //       collection: "Abstract Fighters",
  //       rarity: "Rare",
  //       type: "nft",
  //     },
  //     {
  //       id: "4",
  //       name: "Crypto Punk #8888",
  //       image: "/placeholder.svg?height=200&width=200",
  //       collection: "Crypto Punks",
  //       rarity: "Common",
  //       type: "nft",
  //     },
  //   ]

  //   setTimeout(() => {
  //     setNftCharacters(mockNFTs)
  //     setLoading(false)
  //   }, 1000)
  // }, [])

  const filteredNFTs =
    selectedCollection === "all"
      ? nftCharacters
      : nftCharacters.filter((nft) => nft.collection === collections.find((c) => c.id === selectedCollection)?.name)

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "from-yellow-400 to-orange-500"
      case "Epic":
        return "from-red-500 to-pink-500"
      case "Rare":
        return "from-blue-400 to-cyan-500"
      default:
        return "from-gray-400 to-gray-500"
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          setUploadedImage(event.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const selectUploadedCharacter = () => {
    if (uploadedImage) {
      const character: Character = {
        id: "uploaded",
        name: "Custom Fighter",
        image: uploadedImage,
        type: "upload",
      }
      onSelect(character)
    }
  }

  if (!walletAddress) {
    return (
      <div className="space-y-6">
        <WalletInput onWalletSubmit={handleWalletSubmit} loading={loading} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/80 backdrop-blur-sm border-2 border-gray-700/50 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl text-white flex items-center justify-center gap-3 font-orbitron font-black text-gritty">
            Choose Your Runner!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="nfts" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 rounded-lg p-1 border border-gray-600/50">
              <TabsTrigger
                value="nfts"
                className="data-[state=active]:bg-gray-700/80 data-[state=active]:text-white text-gray-400 rounded-md font-rajdhani font-bold"
              >
                Your NFTs
              </TabsTrigger>
              <TabsTrigger
                value="upload"
                className="data-[state=active]:bg-gray-700/80 data-[state=active]:text-white text-gray-400 rounded-md font-rajdhani font-bold"
              >
                Upload Image
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nfts" className="space-y-4 mt-4">
              {/* Collection Filter */}
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white font-rajdhani font-medium">
                  <SelectValue placeholder="Select collection" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800/90 border-gray-600/50">
                  {collections.map((collection) => (
                    <SelectItem
                      key={collection.id}
                      value={collection.id}
                      className="text-white hover:bg-gray-700/50 font-rajdhani"
                    >
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* NFT Grid */}
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto text-green-400 mb-3" />
                  <p className="text-gray-300 font-rajdhani font-medium">Loading your NFTs from OpenSea...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-400 mb-3">⚠️</div>
                  <p className="text-red-400 font-rajdhani font-medium mb-4">{error}</p>
                  <Button
                    onClick={() => setWalletAddress(null)}
                    variant="outline"
                    className="border-gray-500 text-gray-300 hover:bg-gray-700"
                  >
                    Try Different Wallet
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredNFTs.map((character) => (
                    <Card
                      key={character.id}
                      className="bg-gray-800/50 border-2 border-gray-600/50 cursor-pointer hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-400/20"
                      onClick={() => onSelect(character)}
                    >
                      <CardContent className="p-4">
                        <div className="relative">
                          <img
                            src={character.image || "/placeholder.svg"}
                            alt={character.name}
                            className="w-full h-28 object-cover rounded-lg mb-3 border border-gray-600/50"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                            }}
                          />
                        </div>
                        <h3 className="text-base font-bold text-white truncate font-rajdhani">{character.name}</h3>
                        <p className="text-sm text-gray-400 truncate font-rajdhani">{character.collection}</p>

                        <Button
                          className="w-full mt-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-black text-base font-orbitron tracking-wide text-gritty"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelect(character)
                          }}
                        >
                          RUN IT! 🎯
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!loading && filteredNFTs.length === 0 && (
                <div className="text-center py-8">
                  <ImageIcon className="h-16 w-16 mx-auto text-gray-500 mb-3" />
                  <p className="text-gray-400 font-rajdhani font-medium">No NFTs found in this collection</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-4">
              {uploadedImage ? (
                <div className="space-y-4 p-8 border-2 border-dashed border-green-400/50 rounded-xl bg-green-400/5">
                  <img
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Uploaded character"
                    className="w-36 h-36 object-cover rounded-xl mx-auto border-2 border-gray-600/50"
                  />
                  <div className="space-y-3 text-center">
                    <p className="text-white font-rajdhani font-bold text-lg">Custom Fighter Ready!</p>
                    <Button
                      onClick={selectUploadedCharacter}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-black font-orbitron tracking-wide"
                    >
                      Select This Fighter
                    </Button>
                    <Button
                      onClick={() => setUploadedImage(null)}
                      variant="outline"
                      className="ml-2 border-gray-500 text-gray-300 hover:bg-gray-700"
                    >
                      Choose Different Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive
                      ? "border-green-400 bg-green-400/10 toxic-glow"
                      : "border-gray-600/50 hover:border-gray-500/70"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-4">
                    <Upload className="h-16 w-16 mx-auto text-gray-500" />
                    <div>
                      <p className="text-white font-rajdhani font-bold text-lg mb-2">Drop your image here</p>
                      <p className="text-gray-400 text-base font-rajdhani">or click to browse</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
