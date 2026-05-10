import Groq from 'groq-sdk'
import type { AIRequest, AIResponse } from './aiTypes'

export type { AIMessage, AIRequest, AIResponse } from './aiTypes'

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY!
})

async function callGroqModel(model: string, defaultTokens: number, req: AIRequest): Promise<AIResponse> {
  const response = await client.chat.completions.create({
    model,
    max_tokens: req.maxTokens || defaultTokens,
    messages: [
      { role: 'system', content: req.system },
      ...req.messages.map(m => ({ role: m.role, content: m.content }))
    ]
  })

  const content = response.choices[0]?.message?.content || ''

  return {
    content,
    inputTokens: response.usage?.prompt_tokens || 0,
    outputTokens: response.usage?.completion_tokens || 0
  }
}

export const callGroq     = (req: AIRequest) => callGroqModel('llama-3.3-70b-versatile', 1000, req)
export const callGroqFast = (req: AIRequest) => callGroqModel('llama-3.1-8b-instant', 500, req)