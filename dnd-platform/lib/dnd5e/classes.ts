export interface ClassDefinition {
  name: string
  hitDie: number
  primaryAbility: string
  savingThrows: string[]
  armorProficiencies: string[]
  weaponProficiencies: string[]
  skillChoices: { count: number; options: string[] }
  isSpellcaster: boolean
  spellAbility?: string
  startingHp: number
  features: Record<number, string[]>
}

export const CLASSES: Record<string, ClassDefinition> = {
  Fighter: {
    name: 'Fighter', hitDie: 10, primaryAbility: 'str',
    savingThrows: ['str', 'con'],
    armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
    weaponProficiencies: ['simple', 'martial'],
    skillChoices: { count: 2, options: ['acrobatics','animal_handling','athletics','history','insight','intimidation','perception','survival'] },
    isSpellcaster: false,
    startingHp: 10,
    features: {
      1: ['Fighting Style', 'Second Wind'],
      2: ['Action Surge'],
      3: ['Martial Archetype'],
      4: ['Ability Score Improvement'],
      5: ['Extra Attack'],
    }
  },
  Wizard: {
    name: 'Wizard', hitDie: 6, primaryAbility: 'int',
    savingThrows: ['int', 'wis'],
    armorProficiencies: [],
    weaponProficiencies: ['daggers','darts','slings','quarterstaffs','light crossbows'],
    skillChoices: { count: 2, options: ['arcana','history','insight','investigation','medicine','religion'] },
    isSpellcaster: true, spellAbility: 'int',
    startingHp: 6,
    features: {
      1: ['Spellcasting', 'Arcane Recovery'],
      2: ['Arcane Tradition'],
      3: ['Arcane Tradition Feature'],
      4: ['Ability Score Improvement'],
      5: ['Arcane Tradition Feature'],
    }
  },
  Rogue: {
    name: 'Rogue', hitDie: 8, primaryAbility: 'dex',
    savingThrows: ['dex', 'int'],
    armorProficiencies: ['light'],
    weaponProficiencies: ['simple', 'hand crossbows', 'longswords', 'rapiers', 'shortswords'],
    skillChoices: { count: 4, options: ['acrobatics','athletics','deception','insight','intimidation','investigation','perception','performance','persuasion','sleight_of_hand','stealth'] },
    isSpellcaster: false,
    startingHp: 8,
    features: {
      1: ['Expertise', 'Sneak Attack', "Thieves' Cant"],
      2: ['Cunning Action'],
      3: ['Roguish Archetype'],
      4: ['Ability Score Improvement'],
      5: ['Uncanny Dodge'],
    }
  },
  Cleric: {
    name: 'Cleric', hitDie: 8, primaryAbility: 'wis',
    savingThrows: ['wis', 'cha'],
    armorProficiencies: ['light', 'medium', 'shields'],
    weaponProficiencies: ['simple'],
    skillChoices: { count: 2, options: ['history','insight','medicine','persuasion','religion'] },
    isSpellcaster: true, spellAbility: 'wis',
    startingHp: 8,
    features: {
      1: ['Spellcasting', 'Divine Domain'],
      2: ['Channel Divinity', 'Divine Domain Feature'],
      3: [],
      4: ['Ability Score Improvement'],
      5: ['Destroy Undead'],
    }
  },
  Ranger: {
    name: 'Ranger', hitDie: 10, primaryAbility: 'dex',
    savingThrows: ['str', 'dex'],
    armorProficiencies: ['light', 'medium', 'shields'],
    weaponProficiencies: ['simple', 'martial'],
    skillChoices: { count: 3, options: ['animal_handling','athletics','insight','investigation','nature','perception','stealth','survival'] },
    isSpellcaster: true, spellAbility: 'wis',
    startingHp: 10,
    features: {
      1: ['Favored Enemy', 'Natural Explorer'],
      2: ['Fighting Style', 'Spellcasting'],
      3: ['Ranger Archetype', 'Primeval Awareness'],
      4: ['Ability Score Improvement'],
      5: ['Extra Attack'],
    }
  },
  Paladin: {
    name: 'Paladin', hitDie: 10, primaryAbility: 'str',
    savingThrows: ['wis', 'cha'],
    armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
    weaponProficiencies: ['simple', 'martial'],
    skillChoices: { count: 2, options: ['athletics','insight','intimidation','medicine','persuasion','religion'] },
    isSpellcaster: true, spellAbility: 'cha',
    startingHp: 10,
    features: {
      1: ['Divine Sense', 'Lay on Hands'],
      2: ['Fighting Style', 'Spellcasting', 'Divine Smite'],
      3: ['Divine Health', 'Sacred Oath'],
      4: ['Ability Score Improvement'],
      5: ['Extra Attack'],
    }
  },
  Bard: {
    name: 'Bard', hitDie: 8, primaryAbility: 'cha',
    savingThrows: ['dex', 'cha'],
    armorProficiencies: ['light'],
    weaponProficiencies: ['simple', 'hand crossbows', 'longswords', 'rapiers', 'shortswords'],
    skillChoices: { count: 3, options: ['acrobatics','animal_handling','arcana','athletics','deception','history','insight','intimidation','investigation','medicine','nature','perception','performance','persuasion','religion','sleight_of_hand','stealth','survival'] },
    isSpellcaster: true, spellAbility: 'cha',
    startingHp: 8,
    features: {
      1: ['Spellcasting', 'Bardic Inspiration'],
      2: ['Jack of All Trades', 'Song of Rest'],
      3: ['Bard College', 'Expertise'],
      4: ['Ability Score Improvement'],
      5: ['Bardic Inspiration d8', 'Font of Inspiration'],
    }
  },
  Barbarian: {
    name: 'Barbarian', hitDie: 12, primaryAbility: 'str',
    savingThrows: ['str', 'con'],
    armorProficiencies: ['light', 'medium', 'shields'],
    weaponProficiencies: ['simple', 'martial'],
    skillChoices: { count: 2, options: ['animal_handling','athletics','intimidation','nature','perception','survival'] },
    isSpellcaster: false,
    startingHp: 12,
    features: {
      1: ['Rage', 'Unarmored Defense'],
      2: ['Reckless Attack', 'Danger Sense'],
      3: ['Primal Path'],
      4: ['Ability Score Improvement'],
      5: ['Extra Attack', 'Fast Movement'],
    }
  },
  Druid: {
    name: 'Druid', hitDie: 8, primaryAbility: 'wis',
    savingThrows: ['int', 'wis'],
    armorProficiencies: ['light', 'medium', 'shields'],
    weaponProficiencies: ['clubs','daggers','darts','javelins','maces','quarterstaffs','scimitars','sickles','slings','spears'],
    skillChoices: { count: 2, options: ['arcana','animal_handling','insight','medicine','nature','perception','religion','survival'] },
    isSpellcaster: true, spellAbility: 'wis',
    startingHp: 8,
    features: {
      1: ['Druidic', 'Spellcasting'],
      2: ['Wild Shape', 'Druid Circle'],
      3: [],
      4: ['Wild Shape Improvement', 'Ability Score Improvement'],
      5: [],
    }
  },
  Monk: {
    name: 'Monk', hitDie: 8, primaryAbility: 'dex',
    savingThrows: ['str', 'dex'],
    armorProficiencies: [],
    weaponProficiencies: ['simple', 'shortswords'],
    skillChoices: { count: 2, options: ['acrobatics','athletics','history','insight','religion','stealth'] },
    isSpellcaster: false,
    startingHp: 8,
    features: {
      1: ['Unarmored Defense', 'Martial Arts'],
      2: ['Ki', 'Unarmored Movement'],
      3: ['Monastic Tradition', 'Deflect Missiles'],
      4: ['Ability Score Improvement', 'Slow Fall'],
      5: ['Extra Attack', 'Stunning Strike'],
    }
  },
  Sorcerer: {
    name: 'Sorcerer', hitDie: 6, primaryAbility: 'cha',
    savingThrows: ['con', 'cha'],
    armorProficiencies: [],
    weaponProficiencies: ['daggers','darts','slings','quarterstaffs','light crossbows'],
    skillChoices: { count: 2, options: ['arcana','deception','insight','intimidation','persuasion','religion'] },
    isSpellcaster: true, spellAbility: 'cha',
    startingHp: 6,
    features: {
      1: ['Spellcasting', 'Sorcerous Origin'],
      2: ['Font of Magic'],
      3: ['Metamagic'],
      4: ['Ability Score Improvement'],
      5: [],
    }
  },
  Warlock: {
    name: 'Warlock', hitDie: 8, primaryAbility: 'cha',
    savingThrows: ['wis', 'cha'],
    armorProficiencies: ['light'],
    weaponProficiencies: ['simple'],
    skillChoices: { count: 2, options: ['arcana','deception','history','intimidation','investigation','nature','religion'] },
    isSpellcaster: true, spellAbility: 'cha',
    startingHp: 8,
    features: {
      1: ['Otherworldly Patron', 'Pact Magic'],
      2: ['Eldritch Invocations'],
      3: ['Pact Boon'],
      4: ['Ability Score Improvement'],
      5: [],
    }
  },
}