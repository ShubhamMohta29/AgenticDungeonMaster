import type { EventHandler, EventContext } from '../EventHandler'

export class NpcHandler implements EventHandler {
  async handle(data: Record<string, string>, { campaignId, db }: EventContext) {
    await db.from('npcs').insert({
      campaign_id: campaignId,
      name: data.name,
      description: data.description,
      disposition: data.disposition || 'unknown'
    })
  }
}
