import type { EventHandler, EventContext } from '../EventHandler'

export class DamageHandler implements EventHandler {
  async handle(data: Record<string, string>, { characters, db }: EventContext) {
    const target = characters.find(c => c.name.toLowerCase() === data.target?.toLowerCase())
    if (!target) return
    const newHp = Math.max(0, target.hp - parseInt(data.amount || '0'))
    await db.from('characters').update({ hp: newHp }).eq('id', target.id)
  }
}
