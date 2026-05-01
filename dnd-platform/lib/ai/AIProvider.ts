// Strategy interface — all AI providers must implement this contract.
// Routes depend on this abstraction, never on a specific SDK (DIP + OCP).

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIRequest {
  system: string
  messages: AIMessage[]
  maxTokens?: number
}

export interface AIResponse {
  content: string
  inputTokens: number
  outputTokens: number
}

/** Strategy: contracts for an AI text-completion provider */
export interface AIProvider {
  /** High-capacity model for DM narration */
  complete(request: AIRequest): Promise<AIResponse>
  /** Lighter-weight model for summaries, co-pilot hints */
  completeFast(request: AIRequest): Promise<AIResponse>
}
