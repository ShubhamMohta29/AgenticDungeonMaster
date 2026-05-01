// Concrete Strategy: Groq/LLaMA implementation of the AIProvider interface.
// If we ever swap providers, only this file changes — no route code touches it.

import Groq from 'groq-sdk'
import type { AIProvider, AIRequest, AIResponse } from './AIProvider'

const HIGH_CAP_MODEL = 'llama-3.3-70b-versatile'
const FAST_MODEL     = 'llama-3.1-8b-instant'

function buildGroqMessages(req: AIRequest) {
  return [
    { role: 'system' as const, content: req.system },
    ...req.messages.map(m => ({ role: m.role, content: m.content }))
  ]
}

export class GroqProvider implements AIProvider {
  private client: Groq

  constructor() {
    this.client = new Groq({ apiKey: process.env.GROQ_API_KEY! })
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model: HIGH_CAP_MODEL,
      max_tokens: request.maxTokens ?? 1000,
      messages: buildGroqMessages(request)
    })
    return {
      content: response.choices[0]?.message?.content ?? '',
      inputTokens:  response.usage?.prompt_tokens     ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0
    }
  }

  async completeFast(request: AIRequest): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model: FAST_MODEL,
      max_tokens: request.maxTokens ?? 500,
      messages: buildGroqMessages(request)
    })
    return {
      content: response.choices[0]?.message?.content ?? '',
      inputTokens:  response.usage?.prompt_tokens     ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0
    }
  }
}
