import type { Monster } from '@/types/combat'

export const MONSTERS: Record<string, Monster> = {
  Goblin: {
    name: 'Goblin', cr: 0.25, hp: 7, max_hp: 7, ac: 15, speed: 30,
    ability_scores: { str:8, dex:14, con:10, int:10, wis:8, cha:8 },
    attacks: [{ name: 'Scimitar', bonus: 4, damage: '1d6+2', damage_type: 'slashing' },
              { name: 'Shortbow', bonus: 4, damage: '1d6+2', damage_type: 'piercing', reach: 80 }],
    xp: 50
  },
  Hobgoblin: {
    name: 'Hobgoblin', cr: 0.5, hp: 11, max_hp: 11, ac: 18, speed: 30,
    ability_scores: { str:13, dex:12, con:12, int:10, wis:10, cha:9 },
    attacks: [{ name: 'Longsword', bonus: 3, damage: '1d8+1', damage_type: 'slashing' },
              { name: 'Longbow', bonus: 3, damage: '1d8+1', damage_type: 'piercing', reach: 150 }],
    xp: 100
  },
  Orc: {
    name: 'Orc', cr: 0.5, hp: 15, max_hp: 15, ac: 13, speed: 30,
    ability_scores: { str:16, dex:12, con:16, int:7, wis:11, cha:10 },
    attacks: [{ name: 'Greataxe', bonus: 5, damage: '1d12+3', damage_type: 'slashing' },
              { name: 'Javelin', bonus: 5, damage: '1d6+3', damage_type: 'piercing', reach: 30 }],
    special_abilities: [{ name: 'Aggressive', description: 'Can move up to speed toward enemy as bonus action.' }],
    xp: 100
  },
  Skeleton: {
    name: 'Skeleton', cr: 0.25, hp: 13, max_hp: 13, ac: 13, speed: 30,
    ability_scores: { str:10, dex:14, con:15, int:6, wis:8, cha:5 },
    attacks: [{ name: 'Shortsword', bonus: 4, damage: '1d6+2', damage_type: 'piercing' },
              { name: 'Shortbow', bonus: 4, damage: '1d6+2', damage_type: 'piercing', reach: 80 }],
    damage_immunities: ['poison'],
    xp: 50
  },
  Zombie: {
    name: 'Zombie', cr: 0.25, hp: 22, max_hp: 22, ac: 8, speed: 20,
    ability_scores: { str:13, dex:6, con:16, int:3, wis:6, cha:5 },
    attacks: [{ name: 'Slam', bonus: 3, damage: '1d6+1', damage_type: 'bludgeoning' }],
    special_abilities: [{ name: 'Undead Fortitude', description: 'If damage reduces to 0 HP, make CON save DC 5+damage. On success, drop to 1 HP instead.' }],
    damage_immunities: ['poison'],
    xp: 50
  },
  Wolf: {
    name: 'Wolf', cr: 0.25, hp: 11, max_hp: 11, ac: 13, speed: 40,
    ability_scores: { str:12, dex:15, con:12, int:3, wis:12, cha:6 },
    attacks: [{ name: 'Bite', bonus: 4, damage: '2d4+2', damage_type: 'piercing' }],
    special_abilities: [{ name: 'Pack Tactics', description: 'Advantage on attacks if ally is adjacent to target.' }],
    xp: 50
  },
  Bandit: {
    name: 'Bandit', cr: 0.125, hp: 11, max_hp: 11, ac: 12, speed: 30,
    ability_scores: { str:11, dex:12, con:12, int:10, wis:10, cha:10 },
    attacks: [{ name: 'Scimitar', bonus: 3, damage: '1d6+1', damage_type: 'slashing' },
              { name: 'Light Crossbow', bonus: 3, damage: '1d8+1', damage_type: 'piercing', reach: 80 }],
    xp: 25
  },
  Troll: {
    name: 'Troll', cr: 5, hp: 84, max_hp: 84, ac: 15, speed: 30,
    ability_scores: { str:18, dex:13, con:20, int:7, wis:9, cha:7 },
    attacks: [{ name: 'Bite', bonus: 7, damage: '1d6+4', damage_type: 'piercing' },
              { name: 'Claw', bonus: 7, damage: '2d6+4', damage_type: 'slashing' }],
    special_abilities: [
      { name: 'Regeneration', description: 'Regains 10 HP at start of turn unless it took acid or fire damage.' },
      { name: 'Keen Smell', description: 'Advantage on Perception checks using smell.' }
    ],
    xp: 1800
  },
  'Dragon (Young Red)': {
    name: 'Young Red Dragon', cr: 10, hp: 178, max_hp: 178, ac: 18, speed: 40,
    ability_scores: { str:23, dex:10, con:21, int:14, wis:11, cha:19 },
    attacks: [
      { name: 'Bite', bonus: 10, damage: '2d10+6', damage_type: 'piercing' },
      { name: 'Claw', bonus: 10, damage: '2d6+6', damage_type: 'slashing' },
      { name: 'Fire Breath', bonus: 0, damage: '16d6', damage_type: 'fire', description: 'DC 21 DEX save for half' }
    ],
    damage_immunities: ['fire'],
    xp: 5900
  }
}

export function getMonster(name: string): Monster | null {
  const monster = MONSTERS[name]
  if (!monster) return null
  return {
    ...monster,
    hp: monster.max_hp
  }
}

export function getMonstersByCR(min: number, max: number): Monster[] {
  return Object.values(MONSTERS).filter(m => m.cr >= min && m.cr <= max)
}

export function calculateEncounterXP(monsters: Monster[]): number {
  return monsters.reduce((total, m) => total + m.xp, 0)
}