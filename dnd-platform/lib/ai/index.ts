// Factory: returns the configured AIProvider singleton.
// Callers import `getAIProvider()` — they never know it's Groq unless they look here.

import { GroqProvider } from './GroqProvider'
import type { AIProvider } from './AIProvider'

let instance: AIProvider | null = null

export function getAIProvider(): AIProvider {
  if (!instance) instance = new GroqProvider()
  return instance
}
