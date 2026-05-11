import { supabaseAdmin } from './supabaseServer'

const XP_THRESHOLDS = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
]

function getLevelFromXP(xp: number): number {
  let level = 1
  for (let i = 1; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) level = i + 1
    else break
  }
  return Math.min(level, 20)
}

function getProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2
}

function getHitDieForClass(className: string): number {
  const dice: Record<string, number> = {
    'barbarian': 12,
    'fighter': 10, 'paladin': 10, 'ranger': 10,
    'bard': 8, 'cleric': 8, 'druid': 8, 'monk': 8, 'rogue': 8, 'warlock': 8,
    'sorcerer': 6, 'wizard': 6
  }
  return dice[className.toLowerCase()] || 8
}

function calculateHpIncrease(c: any, levelsGained: number): number {
  const conScore = c.ability_scores?.con || 10
  const conMod = Math.floor((conScore - 10) / 2)
  const hitDie = getHitDieForClass(c.class || '')
  const avgRoll = Math.floor(hitDie / 2) + 1
  return levelsGained * Math.max(1, avgRoll + conMod)
}

export async function applyEvents(
  events: any[],
  campaignId: string,
  initialCharacters: any[]
) {
  // Local cache to track changes across multiple events in the same batch
  const characterMap = new Map<string, any>()
  initialCharacters.forEach(c => characterMap.set(c.id, JSON.parse(JSON.stringify(c))))

  // Proactively check for level-ups on all characters in this batch
  for (const target of characterMap.values()) {
    const correctLevel = getLevelFromXP(target.xp || 0)
    if (correctLevel > target.level) {
      const levelsGained = correctLevel - target.level
      console.log(`Syncing level for ${target.name}: ${target.level} -> ${correctLevel}`)
      
      const hpIncrease = calculateHpIncrease(target, levelsGained)
      target.level = correctLevel
      target.proficiency_bonus = getProficiencyBonus(correctLevel)
      target.max_hp = (target.max_hp || 10) + hpIncrease
      target.hp = (target.hp || 0) + hpIncrease // Add to current too

      await supabaseAdmin.from('characters').update({ 
        level: target.level,
        proficiency_bonus: target.proficiency_bonus,
        max_hp: target.max_hp,
        hp: target.hp
      }).eq('id', target.id)
    }
  }

  for (const event of events) {
    try {
      const targetName = event.data?.target?.toLowerCase()
      const target = Array.from(characterMap.values()).find(
        c => c.name.toLowerCase() === targetName
      )

      if (event.type === 'damage' && target) {
        const amount = parseInt(event.data.amount || '0', 10)
        const remaining = amount - (target.temp_hp || 0)
        target.hp = remaining > 0 ? Math.max(0, (target.hp || 0) - remaining) : target.hp
        target.temp_hp = remaining > 0 ? 0 : (target.temp_hp || 0) - amount
        await supabaseAdmin
          .from('characters')
          .update({ hp: target.hp, temp_hp: target.temp_hp })
          .eq('id', target.id)
      } 
      else if (event.type === 'heal' && target) {
        const amount = parseInt(event.data.amount || '0', 10)
        target.hp = Math.min(target.max_hp || 10, (target.hp || 0) + amount)
        await supabaseAdmin.from('characters').update({ hp: target.hp }).eq('id', target.id)
      }
      else if (event.type === 'xp') {
        const amount = parseInt(event.data.amount || '0', 10)
        for (const c of characterMap.values()) {
          const oldXp = c.xp || 0
          c.xp = oldXp + amount
          
          const newLevel = getLevelFromXP(c.xp)
          if (newLevel > c.level) {
            const levelsGained = newLevel - c.level
            console.log(`Character ${c.name} leveled up from ${c.level} to ${newLevel}!`)
            
            const hpIncrease = calculateHpIncrease(c, levelsGained)
            c.level = newLevel
            c.proficiency_bonus = getProficiencyBonus(newLevel)
            c.max_hp = (c.max_hp || 10) + hpIncrease
            c.hp = (c.hp || 0) + hpIncrease

            await supabaseAdmin.from('characters').update({ 
              xp: c.xp, 
              level: c.level,
              proficiency_bonus: c.proficiency_bonus,
              max_hp: c.max_hp,
              hp: c.hp
            }).eq('id', c.id)
          } else {
            await supabaseAdmin.from('characters').update({ xp: c.xp }).eq('id', c.id)
          }
        }
      }
      else if (event.type === 'condition_add' && target) {
        const condition = event.data.condition
        if (condition && !target.conditions.includes(condition)) {
          target.conditions = [...(target.conditions || []), condition]
          await supabaseAdmin.from('characters').update({ conditions: target.conditions }).eq('id', target.id)
        }
      }
      else if (event.type === 'condition_remove' && target) {
        const condition = event.data.condition
        target.conditions = (target.conditions || []).filter((c: string) => c !== condition)
        await supabaseAdmin.from('characters').update({ conditions: target.conditions }).eq('id', target.id)
      }
      else if (event.type === 'inventory_add' && target) {
        const item = event.data.item
        const qty = parseInt(event.data.quantity || '1', 10)
        const inventory = target.inventory || []
        const existing = inventory.find((i: any) => i.name === item)
        if (existing) {
          existing.quantity += qty
        } else {
          inventory.push({ name: item, quantity: qty, equipped: false, attuned: false, weight: 0, value: 0 })
        }
        target.inventory = inventory
        await supabaseAdmin.from('characters').update({ inventory: target.inventory }).eq('id', target.id)
      }
      else if (event.type === 'feature_add' && target) {
        const name = event.data.name
        const desc = event.data.description
        const features = target.features || []
        if (name && !features.find((f: any) => f.name === name)) {
          features.push({ name, description: desc })
          target.features = features
          await supabaseAdmin.from('characters').update({ features: target.features }).eq('id', target.id)
        }
      }
      else if (event.type === 'skill_update' && target) {
        const skill = event.data.skill?.toLowerCase().replace(/ /g, '_')
        const val = event.data.value === 'true'
        if (skill) {
          target.skills = { ...(target.skills || {}), [skill]: val }
          await supabaseAdmin.from('characters').update({ skills: target.skills }).eq('id', target.id)
        }
      }
      else if (event.type === 'ability_update' && target) {
        const ability = event.data.ability?.toLowerCase()
        const val = parseInt(event.data.value || '10', 10)
        if (ability && target.ability_scores && target.ability_scores[ability] !== undefined) {
          target.ability_scores[ability] = val
          await supabaseAdmin.from('characters').update({ ability_scores: target.ability_scores }).eq('id', target.id)
        }
      }
      else if (event.type === 'rest' && target) {
        const isLong = event.data.rest_type === 'long'
        target.hp = target.max_hp
        if (isLong) {
          target.temp_hp = 0
          if (target.spells && target.spells.slot_max) {
             target.spells.slots = JSON.parse(JSON.stringify(target.spells.slot_max))
          }
        }
        await supabaseAdmin.from('characters').update({ 
          hp: target.hp, 
          temp_hp: target.temp_hp,
          spells: target.spells
        }).eq('id', target.id)
      }
      else if (event.type === 'new_npc') {
        await supabaseAdmin.from('npcs').insert({
          campaign_id: campaignId,
          name: event.data.name,
          description: event.data.description,
          disposition: event.data.disposition || 'unknown'
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
