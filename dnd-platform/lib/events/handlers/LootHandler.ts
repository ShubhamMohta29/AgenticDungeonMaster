import type { EventHandler, EventContext } from '../EventHandler'

type InventoryItem = { name: string; quantity: number; weight: number; value: number; equipped: boolean; attuned: boolean }

export class LootHandler implements EventHandler {
  async handle(data: Record<string, string>, { characters, db }: EventContext) {
    const target = characters.find(c => c.name.toLowerCase() === data.target?.toLowerCase()) as typeof characters[0] & { inventory?: InventoryItem[] }
    if (!target) return
    const itemName = data.item
    const qty = parseInt(data.quantity || '1')
    const inventory: InventoryItem[] = [...((target.inventory as InventoryItem[]) || [])]
    const existing = inventory.find(i => i.name === itemName)
    if (existing) {
      existing.quantity += qty
    } else {
      inventory.push({ name: itemName, quantity: qty, weight: 0, value: 0, equipped: false, attuned: false })
    }
    await db.from('characters').update({ inventory }).eq('id', target.id)
  }
}
