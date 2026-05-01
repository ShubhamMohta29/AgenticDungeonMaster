// campaignStore: owns campaign data, characters, and messages.
// Components that don't need combat state or UI state won't re-render when those change (ISP).

import { create } from 'zustand'
import type { Campaign } from '@/types/campaign'
import type { Character } from '@/types/character'
import type { Message } from '@/types/message'

interface CampaignState {
  campaign: Campaign | null
  characters: Character[]
  myCharacter: Character | null
  messages: Message[]

  setCampaign: (campaign: Campaign) => void
  setCharacters: (characters: Character[]) => void
  setMyCharacter: (character: Character) => void
  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  updateCharacter: (characterId: string, updates: Partial<Character>) => void
}

export const useCampaignStore = create<CampaignState>((set) => ({
  campaign:    null,
  characters:  [],
  myCharacter: null,
  messages:    [],

  setCampaign:    (campaign)    => set({ campaign }),
  setCharacters:  (characters)  => set({ characters }),
  setMyCharacter: (character)   => set({ myCharacter: character }),
  addMessage:     (message)     => set((s) => ({ messages: [...s.messages, message] })),
  setMessages:    (messages)    => set({ messages }),
  updateCharacter: (characterId, updates) => set((s) => ({
    characters:  s.characters.map(c  => c.id === characterId ? { ...c, ...updates } : c),
    myCharacter: s.myCharacter?.id === characterId ? { ...s.myCharacter, ...updates } : s.myCharacter
  }))
}))
