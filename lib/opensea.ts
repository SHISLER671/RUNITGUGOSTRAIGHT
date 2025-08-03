interface OpenSeaNFT {
  identifier: string
  collection: string
  contract: string
  token_standard: string
  name: string
  description: string
  image_url: string
  display_image_url: string
  display_animation_url: string
  metadata_url: string
  opensea_url: string
  updated_at: string
  is_disabled: boolean
  is_nsfw: boolean
}

interface OpenSeaCollection {
  collection: string
  name: string
  description: string
  image_url: string
  banner_image_url: string
  owner: string
  safelist_status: string
  category: string
  is_disabled: boolean
  is_nsfw: boolean
  trait_offers_enabled: boolean
  collection_offers_enabled: boolean
  opensea_url: string
  project_url: string
  wiki_url: string
  discord_url: string
  telegram_url: string
  twitter_username: string
  instagram_username: string
  contracts: Array<{
    address: string
    chain: string
  }>
}

interface OpenSeaResponse {
  nfts: OpenSeaNFT[]
  next: string | null
}

const OPENSEA_API_KEY = "3ca6d453e5b8427d8e2953be751fa75b"
const OPENSEA_BASE_URL = "https://api.opensea.io/api/v2"

export class OpenSeaService {
  private apiKey: string

  constructor() {
    this.apiKey = OPENSEA_API_KEY
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(`${OPENSEA_BASE_URL}${endpoint}`)

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
      headers: {
        "X-API-KEY": this.apiKey,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`OpenSea API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getNFTsByOwner(ownerAddress: string, limit = 50, chain = "abstract"): Promise<OpenSeaNFT[]> {
    try {
      const response: OpenSeaResponse = await this.makeRequest(`/chain/${chain}/account/${ownerAddress}/nfts`, {
        limit: limit.toString(),
      })

      return response.nfts.filter((nft) => !nft.is_disabled && !nft.is_nsfw && nft.image_url && nft.name)
    } catch (error) {
      console.error("Error fetching NFTs:", error)
      // Fallback to ethereum if abstract fails
      if (chain === "abstract") {
        console.log("Falling back to ethereum chain...")
        return this.getNFTsByOwner(ownerAddress, limit, "ethereum")
      }
      return []
    }
  }

  async getCollectionsByOwner(ownerAddress: string): Promise<string[]> {
    try {
      const nfts = await this.getNFTsByOwner(ownerAddress, 200)
      const collections = [...new Set(nfts.map((nft) => nft.collection))]
      return collections
    } catch (error) {
      console.error("Error fetching collections:", error)
      return []
    }
  }

  async getCollectionInfo(collectionSlug: string): Promise<OpenSeaCollection | null> {
    try {
      const response = await this.makeRequest(`/collections/${collectionSlug}`)
      return response
    } catch (error) {
      console.error("Error fetching collection info:", error)
      return null
    }
  }

  // Get NFTs from specific collections
  async getNFTsFromCollections(ownerAddress: string, collectionSlugs: string[]): Promise<OpenSeaNFT[]> {
    try {
      const allNFTs = await this.getNFTsByOwner(ownerAddress, 200)

      if (collectionSlugs.length === 0) {
        return allNFTs
      }

      return allNFTs.filter((nft) => collectionSlugs.includes(nft.collection))
    } catch (error) {
      console.error("Error fetching NFTs from collections:", error)
      return []
    }
  }

  // Convert OpenSea NFT to our Character interface
  convertToCharacter(nft: OpenSeaNFT): {
    id: string
    name: string
    image: string
    collection?: string
    rarity?: string
    type: "nft"
    contract?: string
    tokenId?: string
    openseaUrl?: string
  } {
    return {
      id: `${nft.contract}-${nft.identifier}`,
      name: nft.name || `#${nft.identifier}`,
      image: nft.display_image_url || nft.image_url || "/placeholder.svg?height=200&width=200",
      collection: nft.collection,
      rarity: this.determineRarity(nft),
      type: "nft",
      contract: nft.contract,
      tokenId: nft.identifier,
      openseaUrl: nft.opensea_url,
    }
  }

  private determineRarity(nft: OpenSeaNFT): string {
    // Simple rarity determination based on collection and token ID
    // You can enhance this with actual trait rarity data
    const tokenId = Number.parseInt(nft.identifier)

    if (tokenId <= 100) return "Legendary"
    if (tokenId <= 1000) return "Epic"
    if (tokenId <= 5000) return "Rare"
    return "Common"
  }
}

export const openSeaService = new OpenSeaService()
