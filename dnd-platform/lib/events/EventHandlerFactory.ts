// EventHandlerFactory (Simple Factory / Registry):
// Maps GameEventType -> EventHandler. Adding a new event type = registering one new handler.
// The dispatch method (formerly applyEvents) is ~5 lines instead of 90.

import type { GameEventType, GameEvent } from '@/lib/gameEvents'
import type { EventHandler, EventContext } from './EventHandler'
import { DamageHandler }  from './handlers/DamageHandler'
import { HealHandler }    from './handlers/HealHandler'
import { XpHandler }      from './handlers/XpHandler'
import { LootHandler }    from './handlers/LootHandler'
import { PayHandler }     from './handlers/PayHandler'
import { NpcHandler }     from './handlers/NpcHandler'
import { QuestHandler }   from './handlers/QuestHandler'

class EventHandlerFactoryClass {
  private registry = new Map<string, EventHandler>()

  constructor() {
    this.register('damage',    new DamageHandler())
    this.register('heal',      new HealHandler())
    this.register('xp',        new XpHandler())
    this.register('loot',      new LootHandler())
    this.register('pay',       new PayHandler())
    this.register('new_npc',   new NpcHandler())
    this.register('new_quest', new QuestHandler())
  }

  /** Register a handler for a given event type (OCP: extend without modifying) */
  register(type: string, handler: EventHandler) {
    this.registry.set(type, handler)
  }

  /** Dispatch all events to their registered handlers */
  async dispatch(events: GameEvent[], context: EventContext) {
    for (const event of events) {
      const handler = this.registry.get(event.type)
      if (!handler) continue
      try {
        await handler.handle(event.data, context)
      } catch (err) {
        console.error(`EventHandlerFactory: failed to handle '${event.type}':`, err)
      }
    }
  }
}

// Singleton — one registry per server process
export const EventHandlerFactory = new EventHandlerFactoryClass()
