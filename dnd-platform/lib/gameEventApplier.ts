import { supabaseAdmin } from './supabaseServer'

cotype EventCharacter = {
  id: string
  name: string
  hp: number
  max_hp: number
  temp_hp: number
  xp: number
}

type GameEventRecord = {
  type: string
  data: Record<string, string>
}

export async function applyEvents(
  events: GameEventRecord[],
  campaignId: string,
  characters: EventCharacter[]
) {
  for (const event of events) {
    try {
      if (event.type === 'damage') {
        const target = characters.find(
          c => c.name.toLowerCase() === event.data.target?.toLowerCase()
        )
        if (target) {
          const damage = parseInt(event.data.amount || '0', 10)
          const remaining = damage - target.temp_hp
          const newHp = remaining > 0 ? Math.max(0, target.hp - remaining) : target.hp
          const newTempHp = remaining > 0 ? 0 : target.temp_hp - damage
          await supabaseAdmin
            .from('characters')
            .update({ hp: newHp, temp_hp: newTempHp })
            .eq('id', target.id)
        }
      } else if (event.type === 'heal') {
        const target = characters.find(
          c => c.name.toLowerCase() === event.data.target?.toLowerCase()
        )
        if (target) {
          const newHp = Math.min(target.max_hp, target.hp + parseInt(event.data.amount || '0', 10))
          await supabaseAdmin.from('characters').update({ hp: newHp }).eq('id', target.id)
        }
      } else if (event.type === 'xp') {
        const amount = parseInt(event.data.amount || '0', 10)
        await Promise.all(characters.map(c =>
          supabaseAdmin.from('characters').update({ xp: c.xp + amount }).eq('id', c.id)
        ))
      } else if (event.type === 'new_npc') {
 event.data.disposition || 'unknown'
        })
      } else if (event.type === 'new_quest') {
        await supabaseAdmin.from('quests').insert({
          campaign_id: campaignId,
          title: event.data.title,
          description: event.data.description,
          xp_reward: parseInt(event.data.xp_reward || '0', 10),
          status: 'active',
          objectives: []
        })
      } else if (event.type === 'scene_update' && event.data.description) {
        await supabaseAdmin
          .from('campaigns')
          .update({ current_scene: event.data.description })
          .eq('id', campaignId)
      }
    } catch (err) {
      console.error(`Failed to apply event ${event.type}:`, err)
    }
  }
}
