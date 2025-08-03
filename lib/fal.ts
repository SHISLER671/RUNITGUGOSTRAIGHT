export interface ImageGenerationOptions {
  prompt: string
  width?: number
  height?: number
  num_images?: number
  guidance_scale?: number
  num_inference_steps?: number
  seed?: number
}

const FAL_API_KEY = "9cbca6f9-4c0f-412d-9e79-9554f27978f2:87b5a59b503f24f58fc77b31f70cfe68"

export class FalImageService {
  private async makeRequest(payload: any): Promise<any> {
    try {
      console.log("Making Fal.ai request with payload:", payload)

      const response = await fetch("https://fal.run/fal-ai/flux/schnell", {
        method: "POST",
        headers: {
          Authorization: `Key ${FAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("Fal.ai response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Fal.ai API error:", response.status, errorText)
        throw new Error(`Fal.ai API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Fal.ai result:", result)
      return result
    } catch (error) {
      console.error("Fal.ai request error:", error)
      throw error
    }
  }

  async generateImage(options: ImageGenerationOptions): Promise<string | null> {
    try {
      const payload = {
        prompt: options.prompt,
        image_size: "landscape_4_3",
        num_inference_steps: options.num_inference_steps || 4,
        seed: options.seed || Math.floor(Math.random() * 1000000),
        enable_safety_checker: true,
      }

      console.log("Generating image with options:", options)
      const result = await this.makeRequest(payload)

      if (result?.images?.[0]?.url) {
        console.log("Successfully generated image:", result.images[0].url)
        return result.images[0].url
      }

      console.log("No image URL in result:", result)
      return null
    } catch (error) {
      console.error("Fal.ai image generation error:", error)
      return null
    }
  }

  // NEW: Analyze character image to create better prompts
  private analyzeCharacterAppearance(character: any): string {
    const name = character.name.toLowerCase()
    const collection = character.collection?.toLowerCase() || ""

    // Enhanced character analysis based on name and collection
    let appearance = ""

    // Collection-based analysis
    if (collection.includes("punk") || collection.includes("cryptopunk")) {
      appearance = "pixelated 8-bit style character with distinctive punk features, retro digital art style"
    } else if (collection.includes("ape") || collection.includes("bayc") || collection.includes("bored")) {
      appearance = "cartoon ape character with expressive features, colorful fur, anthropomorphic design"
    } else if (collection.includes("bear") || collection.includes("bearish")) {
      appearance = "cartoon bear character with round features, friendly expression, colorful design"
    } else if (collection.includes("cat") || collection.includes("cool cats")) {
      appearance = "cartoon cat character with large eyes, colorful fur, cute anthropomorphic design"
    } else if (collection.includes("doodle") || collection.includes("doodles")) {
      appearance = "hand-drawn doodle style character with simple lines, colorful, whimsical design"
    } else if (collection.includes("azuki")) {
      appearance = "anime-style character with large eyes, detailed clothing, Japanese aesthetic"
    } else if (collection.includes("clone") || collection.includes("clonex")) {
      appearance = "futuristic humanoid character with sleek design, sci-fi elements, modern aesthetic"
    } else if (collection.includes("world") || collection.includes("otherdeeds")) {
      appearance = "fantasy landscape or mystical creature, otherworldly design"
    }

    // Name-based analysis for more specific details
    if (name.includes("zombie") || name.includes("undead")) {
      appearance += ", decaying skin, glowing eyes, horror aesthetic, undead features"
    } else if (name.includes("robot") || name.includes("mech") || name.includes("cyber")) {
      appearance += ", metallic body, glowing circuits, futuristic robot design, mechanical parts"
    } else if (name.includes("alien") || name.includes("space")) {
      appearance += ", extraterrestrial features, unusual skin color, otherworldly appearance"
    } else if (name.includes("pirate") || name.includes("captain")) {
      appearance += ", pirate hat, eye patch, nautical clothing, seafaring aesthetic"
    } else if (name.includes("ninja") || name.includes("samurai")) {
      appearance += ", traditional Japanese warrior outfit, mask or hood, martial arts pose"
    } else if (name.includes("wizard") || name.includes("mage")) {
      appearance += ", magical robes, staff or wand, mystical aura, fantasy elements"
    } else if (name.includes("king") || name.includes("queen") || name.includes("royal")) {
      appearance += ", crown, royal robes, regal posture, noble appearance"
    } else if (name.includes("demon") || name.includes("devil")) {
      appearance += ", horns, red skin, menacing expression, dark supernatural features"
    } else if (name.includes("angel") || name.includes("holy")) {
      appearance += ", wings, halo, bright clothing, divine appearance"
    } else if (name.includes("fire") || name.includes("flame")) {
      appearance += ", fiery elements, glowing red/orange colors, heat distortion effects"
    } else if (name.includes("ice") || name.includes("frost")) {
      appearance += ", icy blue colors, crystalline features, cold mist effects"
    } else if (name.includes("gold") || name.includes("golden")) {
      appearance += ", golden metallic skin or clothing, shimmering effects, luxury appearance"
    }

    // If we couldn't determine much, use generic but descriptive terms
    if (!appearance) {
      appearance = "unique character with distinctive features, colorful design, detailed artwork"
    }

    return appearance
  }

  async generateBattlePOV(
    character: any,
    opponent: any,
    perspective: "charging" | "collision",
  ): Promise<string | null> {
    // Analyze both characters for better prompts
    const characterAppearance = this.analyzeCharacterAppearance(character)
    const opponentAppearance = this.analyzeCharacterAppearance(opponent)

    const prompts = {
      charging: `Epic first-person POV battle scene: ${characterAppearance} charging at full speed toward ${opponentAppearance} in a Mortal Kombat style arena, dynamic action shot, intense battle scene, cinematic lighting, high energy collision course, detailed character features, fighting game aesthetic`,
      collision: `Explosive first-person POV battle scene: ${characterAppearance} colliding with ${opponentAppearance} in mid-impact, massive collision, sparks flying, dramatic battle arena, Mortal Kombat style, epic clash moment, detailed character features, intense action, fighting game aesthetic`,
    }

    console.log(`🎨 Generating ${perspective} POV with enhanced prompt:`, prompts[perspective])

    return this.generateImage({
      prompt: prompts[perspective],
      num_inference_steps: 6,
    })
  }

  async generateFatalityImage(character: any, opponent: any, winner: "player" | "opponent"): Promise<string | null> {
    const winnerChar = winner === "player" ? character : opponent
    const loserChar = winner === "player" ? opponent : character

    const winnerAppearance = this.analyzeCharacterAppearance(winnerChar)
    const loserAppearance = this.analyzeCharacterAppearance(loserChar)

    // SIMPLIFIED prompt to avoid API issues
    const prompt = `Epic victory scene: ${winnerAppearance} stands triumphant over ${loserAppearance}, dramatic pose, cinematic lighting, battle arena, heroic victory, detailed characters, fighting game style`

    console.log("🎯 Generating FATALITY image with simplified prompt:", prompt)

    try {
      // Try with reduced inference steps for faster/more reliable generation
      const result = await this.generateImage({
        prompt,
        num_inference_steps: 4, // Reduced from 8 to 4
      })

      if (result) {
        return result
      }

      // If that fails, try an even simpler prompt
      console.log("🎯 First attempt failed, trying simpler prompt...")
      const simplePrompt = `Victory scene: winner character defeats opponent in battle arena, dramatic lighting, fighting game style`

      return await this.generateImage({
        prompt: simplePrompt,
        num_inference_steps: 4,
      })
    } catch (error) {
      console.error("🎯 Fatality generation failed:", error)
      return null
    }
  }
}

export const falImageService = new FalImageService()
