export interface RaceDefinition {
  name: string
  abilityBonuses: Partial<Record<string, number>>
  speed: number
  traits: string[]
  languages: string[]
  subraces?: Record<string, { abilityBonuses: Partial<Record<string, number>>; traits: string[] }>
}

export const RACES: Record<string, RaceDefinition> = {
  Human: {
    name: 'Human',
    abilityBonuses: { str:1, dex:1, con:1, int:1, wis:1, cha:1 },
    speed: 30,
    traits: ['Extra Language', 'Extra Skill'],
    languages: ['Common', 'one extra'],
  },
  Elf: {
    name: 'Elf',
    abilityBonuses: { dex: 2 },
    speed: 30,
    traits: ['Darkvision', 'Keen Senses', 'Fey Ancestry', 'Trance'],
    languages: ['Common', 'Elvish'],
    subraces: {
      'High Elf': { abilityBonuses: { int: 1 }, traits: ['Elf Weapon Training', 'Cantrip', 'Extra Language'] },
      'Wood Elf': { abilityBonuses: { wis: 1 }, traits: ['Elf Weapon Training', 'Fleet of Foot', 'Mask of the Wild'] },
    }
  },
  Dwarf: {
    name: 'Dwarf',
    abilityBonuses: { con: 2 },
    speed: 25,
    traits: ['Darkvision', 'Dwarven Resilience', 'Dwarven Combat Training', 'Stonecunning'],
    languages: ['Common', 'Dwarvish'],
    subraces: {
      'Hill Dwarf': { abilityBonuses: { wis: 1 }, traits: ['Dwarven Toughness'] },
      'Mountain Dwarf': { abilityBonuses: { str: 2 }, traits: ['Dwarven Armor Training'] },
    }
  },
  Halfling: {
    name: 'Halfling',
    abilityBonuses: { dex: 2 },
    speed: 25,
    traits: ['Lucky', 'Brave', 'Halfling Nimbleness'],
    languages: ['Common', 'Halfling'],
    subraces: {
      'Lightfoot': { abilityBonuses: { cha: 1 }, traits: ['Naturally Stealthy'] },
      'Stout': { abilityBonuses: { con: 1 }, traits: ['Stout Resilience'] },
    }
  },
  Gnome: {
    name: 'Gnome',
    abilityBonuses: { int: 2 },
    speed: 25,
    traits: ['Darkvision', 'Gnome Cunning'],
    languages: ['Common', 'Gnomish'],
    subraces: {
      'Forest Gnome': { abilityBonuses: { dex: 1 }, traits: ['Natural Illusionist', 'Speak with Small Beasts'] },
      'Rock Gnome': { abilityBonuses: { con: 1 }, traits: ["Artificer's Lore", 'Tinker'] },
    }
  },
  'Half-Orc': {
    name: 'Half-Orc',
    abilityBonuses: { str: 2, con: 1 },
    speed: 30,
    traits: ['Darkvision', 'Menacing', 'Relentless Endurance', 'Savage Attacks'],
    languages: ['Common', 'Orc'],
  },
  Tiefling: {
    name: 'Tiefling',
    abilityBonuses: { int: 1, cha: 2 },
    speed: 30,
    traits: ['Darkvision', 'Hellish Resistance', 'Infernal Legacy'],
    languages: ['Common', 'Infernal'],
  },
  Dragonborn: {
    name: 'Dragonborn',
    abilityBonuses: { str: 2, cha: 1 },
    speed: 30,
    traits: ['Draconic Ancestry', 'Breath Weapon', 'Damage Resistance'],
    languages: ['Common', 'Draconic'],
  },
}