import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { winner, loser } = await request.json()

    // Generate a dramatic fatality description
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Create an epic Mortal Kombat style fatality description where ${winner} defeats ${loser} in a "Run It Straight" head-to-head collision battle. Make it dramatic and over-the-top but fun, not violent. Focus on the epic collision and victory pose.`,
      maxTokens: 200,
    })

    return Response.json({ description: text })
  } catch (error) {
    console.error("Error generating fatality:", error)
    return Response.json({ error: "Failed to generate fatality" }, { status: 500 })
  }
}
