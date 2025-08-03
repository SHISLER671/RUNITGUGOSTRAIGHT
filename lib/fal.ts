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

  async generateBattlePOV(
    characterName: string,
    opponentName: string,
    perspective: "charging" | "collision",
  ): Promise<string | null> {
    const prompts = {
      charging: `Epic first-person POV of ${characterName} charging at full speed toward ${opponentName} in a Mortal Kombat style arena, dynamic action shot, intense battle scene, cinematic lighting, high energy collision course`,
      collision: `Explosive first-person POV of ${characterName} colliding with ${opponentName} in mid-impact, massive collision, sparks flying, dramatic battle arena, Mortal Kombat style, epic clash moment`,
    }

    return this.generateImage({
      prompt: prompts[perspective],
      num_inference_steps: 6,
    })
  }

  async generateFatalityImage(winnerName: string, loserName: string): Promise<string | null> {
    const prompt = `Epic Mortal Kombat FATALITY scene: ${winnerName} stands victorious over defeated ${loserName}, dramatic victory pose, cinematic lighting, battle arena background, epic finishing move aftermath, heroic triumph, detailed digital art`

    console.log("Generating FATALITY image for:", winnerName, "vs", loserName)

    return this.generateImage({
      prompt,
      num_inference_steps: 8,
    })
  }
}

export const falImageService = new FalImageService()
