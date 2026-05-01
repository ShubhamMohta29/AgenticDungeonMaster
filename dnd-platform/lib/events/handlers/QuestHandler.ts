import type { EventHandler, EventContext } from '../EventHandler'

export class QuestHandler implements EventHandler {
  async handle(data: Record<string, string>, { campaignId, db }: EventContext) {
    await db.from('quests').insert({
      campaign_id: campaignId,
      title: data.title,
      description: data.description,
      xp_reward: parseInt(data.xp_reward || '0'),
      status: 'active',
      objectives: []
    })
  }
}
