import Groq from 'groq-sdk'

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY!
})

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ClaudeRequest {
  system: string
  messages: ClaudeMessage[]
  maxTokens?: number
  model?: string
}

export interface ClaudeResponse {
  content: string
  inputTokens: number
  outputTokens: number
}

export async function callClaude(req: ClaudeRequest): Promise<ClaudeResponse> {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: req.maxTokens || 1000,
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

export async function callClaudeHaiku(req: ClaudeRequest): Promise<ClaudeResponse> {
  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    max_tokens: req.maxTokens || 500,
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