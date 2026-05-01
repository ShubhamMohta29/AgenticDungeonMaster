import type { EventHandler, EventContext } from '../EventHandler'

export class XpHandler implements EventHandler {
  async handle(data: Record<string, string>, { characters, db }: EventContext) {
    const amount = parseInt(data.amount || '0')
    await Promise.all(
      characters.map(c => db.from('characters').update({ xp: c.xp + amount }).eq('id', c.id))
    )
  }
}
