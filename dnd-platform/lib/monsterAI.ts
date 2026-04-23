import { callClaude } from './groq'
import { resolveAttack } from './combatEngine'
import type { Combatant, Monster, ActionResult } from '@/types/combat'

export async function getMonsterAction(
  monster: Monster,
  monsterCombatant: Combatant,
  encounter: { turn_order: Combatant[]; round: number },
  campaignSetting: string
): Promise<{ action: string; result: ActionResult }> {

  const alivePlayers = encounter.turn_order.filter(
    c => c.type === 'player' && c.hp > 0
  )

  if (alivePlayers.length === 0) {
    return {
      action: 'no_targets',
      result: { success: false, description: 'No targets available.', events: [] }
    }
  }

  // Pick lowest HP player as primary target (monsters are tactical)
  const primaryTarget = alivePlayers.reduce((lowest, c) =>
    c.hp < lowest.hp ? c : lowest
  )

  // Use Claude to decide action for interesting monsters
  // For basic monsters, just attack
  if (!monster.special_abilities || monster.special_abilities.length === 0) {
    const attack = monster.attacks[0]
    const result = resolveAttack(
      monsterCombatant,
      primaryTarget,
      attack.bonus,
      attack.damage
    )
    return { action: 'attack', result }
  }

  // Ask Claude for tactical decision on monsters with special abilities
  try {
    const prompt = `You are controlling ${monster.name} in D&D 5e combat (round ${encounter.round}).

Monster HP: ${monsterCombatant.hp}/${monsterCombatant.max_hp}
Monster AC: ${monsterCombatant.ac}
Special abilities: ${monster.special_abilities.map(a => `${a.name}: ${a.description}`).join('; ')}
Available attacks: ${monster.attacks.map(a => `${a.name} (+${a.bonus} to hit, ${a.damage} damage)`).join(', ')}

Enemies:
${alivePlayers.map(p => `- ${p.name}: HP ${p.hp}/${p.max_hp}, AC ${p.ac}, Conditions: ${p.conditions.join(', ') || 'none'}`).join('\n')}

Decide the most tactically interesting action. Respond with JSON only:
{ "attack_name": "attack to use", "target": "target name", "reasoning": "brief reason" }`

    const response = await callClaude({
      system: 'You are a D&D 5e monster controller. Respond only with valid JSON.',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 200
    })

    const decision = JSON.parse(response.content)
    const chosenAttack = monster.attacks.find(
      a => a.name.toLowerCase() === decision.attack_name?.toLowerCase()
    ) || monster.attacks[0]

    const target = alivePlayers.find(
      p => p.name.toLowerCase() === decision.target?.toLowerCase()
    ) || primaryTarget

    const result = resolveAttack(
      monsterCombatant,
      target,
      chosenAttack.bonus,
      chosenAttack.damage
    )

    return { action: 'attack', result }

  } catch {
    // Fall back to basic attack if Claude fails
    const attack = monster.attacks[0]
    const result = resolveAttack(monsterCombatant, primaryTarget, attack.bonus, attack.damage)
    return { action: 'attack', result }
  }
}