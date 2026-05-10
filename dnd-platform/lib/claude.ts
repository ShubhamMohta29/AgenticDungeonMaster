import Anthropic from '@anthropic-ai/sdk'
import type { AIRequest, AIResponse } from './aiTypes'

export type { AIMessage, AIRequest, AIResponse } from './aiTypes'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export async function callClaude(req: AIRequest): Promise<AIResponse> {
  const maxRetries = 3

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await client.messages.create({
        model: req.model || 'claude-sonnet-4-20250514',
        max_tokens: req.maxTokens || 1000,
        system: req.system,
        messages: req.messages
      })

      const content = response.content
        .filter(block => block.type === 'text')
        .map(block => (block as { type: 'text'; text: string }).text)
        .join('')

      return {
        content,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      }
    } catch (error: unknown) {
      const isOverloaded =
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        (error as { status: number }).status === 529

      if (isOverloaded && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      throw error
    }
  }

  throw new Error('Claude API failed after maximum retries')
}

export async function callClaudeHaiku(req: AIRequest): Promise<AIResponse> {
  return callClaude({
    ...req,
    model: 'claude-haiku-4-5-20251001',
    maxTokens: req.maxTokens || 500
  })
}