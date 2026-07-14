import { CharacterPack, CharacterEvolutionStage, ParentProfile } from '../types';
import { CHARACTER_SVG_FALLBACKS } from './characterSvgs';

export const PRECANNED_AVATARS = [
  '/avatars/avatar_1.png',
  '/avatars/avatar_2.png',
  '/avatars/avatar_3.png',
  '/avatars/avatar_4.png',
  '/avatars/avatar_5.png',
  '/avatars/avatar_6.png',
  '/avatars/avatar_7.png',
  '/avatars/avatar_8.png',
  '/avatars/avatar_9.png',
  '/avatars/avatar_10.png',
  '/avatars/avatar_11.png',
  '/avatars/avatar_12.png',
  '/avatars/avatar_13.png',
  '/avatars/avatar_14.png',
  '/avatars/avatar_15.png',
  '/avatars/avatar_16.png',
  '/avatars/avatar_17.png',
  '/avatars/avatar_18.png'
];

export const CHARACTER_PACKS: CharacterPack[] = [
  {
    id: 'unicorn',
    name: 'Starry the Cosmic Unicorn',
    description: 'A magical unicorn from the Starlight Galaxy who loves chores and starry sky gaze.',
    pack_name: 'Fantasy Pack',
    stages: [
      {
        stage_number: 1,
        name: 'Stardust Egg',
        description: 'A glowing celestial egg surrounded by floating dust. Keep completing tasks to hatch it!',
        min_points: 0,
        min_level: 1,
        emoji: '🥚✨',
        color_theme: 'from-pink-400 via-purple-400 to-indigo-500',
        animation_class: 'animate-pulse hover:rotate-12 duration-500',
        image_url: '/characters/unicorn/stage-1.png'
      },
      {
        stage_number: 2,
        name: 'Sparkle Hatchling',
        description: 'A baby unicorn that recently hatched! It is full of playful energy and loves to help around the house.',
        min_points: 50,
        min_level: 2,
        emoji: '🦄👶',
        color_theme: 'from-pink-500 via-purple-500 to-rose-400',
        animation_class: 'animate-bounce hover:scale-110 duration-500',
        image_url: '/characters/unicorn/stage-2.png'
      },
      {
        stage_number: 3,
        name: 'Starwave Teen',
        description: 'A playful teenage unicorn brimming with sparkle energy! Growing stronger with every good deed.',
        min_points: 150,
        min_level: 4,
        emoji: '🌟🦄',
        color_theme: 'from-pink-500 via-rose-400 to-fuchsia-500',
        animation_class: 'animate-bounce hover:scale-105 duration-500',
        image_url: '/characters/unicorn/stage-3.png'
      },
      {
        stage_number: 4,
        name: 'Celestial Alicorn',
        description: 'The supreme form of Starry, boasting grand wings of starfire. Supercharged by good behavior!',
        min_points: 300,
        min_level: 6,
        emoji: '👑🦄🌌',
        color_theme: 'from-fuchsia-600 via-indigo-600 to-pink-500',
        animation_class: 'animate-bounce hover:skew-y-3 duration-500',
        image_url: '/characters/unicorn/stage-4.png'
      }
    ]
  },

  {
    id: 'dino',
    name: 'Barnaby the Dino',
    description: 'A cheerful prehistoric vegetarian friendly dinosaur who loves cleaning.',
    pack_name: 'Prehistoric Pack',
    stages: [
      {
        stage_number: 1,
        name: 'Ancient Fossil Egg',
        description: 'A heavy, patterned stone egg resting on soft green ferns.',
        min_points: 0,
        min_level: 1,
        emoji: '🦖🥚',
        color_theme: 'from-emerald-400 to-teal-500',
        animation_class: 'animate-pulse'
      },
      {
        stage_number: 2,
        name: 'Baby Rex Hatchling',
        description: 'An adorable green toddler dinosaur wearing tiny sports shoes. Always hungry for tasks!',
        min_points: 50,
        min_level: 2,
        emoji: '🦖👶',
        color_theme: 'from-emerald-500 to-green-400',
        animation_class: 'animate-bounce'
      },
      {
        stage_number: 3,
        name: 'Dino Scout',
        description: 'A teenage dinosaur with growing spikes and a playful attitude. Loves adventure!',
        min_points: 150,
        min_level: 4,
        emoji: '🦖✨',
        color_theme: 'from-emerald-500 via-green-500 to-teal-500',
        animation_class: 'animate-bounce hover:scale-105 duration-300'
      },
      {
        stage_number: 4,
        name: 'Stegosaurus Overlord',
        description: 'A giant, gentle dinosaur sporting glowing rainbow-colored tail plates!',
        min_points: 300,
        min_level: 6,
        emoji: '🦕👑🌿',
        color_theme: 'from-green-600 via-emerald-600 to-teal-700',
        animation_class: 'animate-pulse'
      }
    ]
  },

];

/**
 * Get the character's current evolution stage based on their level.
 * Falls back to the first stage if no match is found.
 */
export function getCharacterStage(characterId: string, level: number, parentProfile?: ParentProfile | null): CharacterEvolutionStage {
  const character = CHARACTER_PACKS.find(c => c.id === characterId) || CHARACTER_PACKS[0];
  
  // Dynamically map stages to pot unlock levels if parentProfile is provided
  const stages = character.stages.map(stage => {
    let dynamicMinLevel = stage.min_level;
    if (parentProfile) {
      if (stage.stage_number === 1) dynamicMinLevel = 1;
      else if (stage.stage_number === 2) dynamicMinLevel = parentProfile.savings_pot_unlock_level ?? 2;
      else if (stage.stage_number === 3) dynamicMinLevel = parentProfile.food_pot_unlock_level ?? 4;
      else if (stage.stage_number === 4) dynamicMinLevel = parentProfile.gifting_pot_unlock_level ?? 6;
      else if (stage.stage_number === 5) dynamicMinLevel = parentProfile.gold_pot_maintenance_unlock_level ?? 8;
    }
    return { ...stage, min_level: dynamicMinLevel };
  });

  const sortedStages = [...stages].sort((a, b) => b.min_level - a.min_level);
  const stage = sortedStages.find(stage => level >= stage.min_level) || stages[0];

  // If stage doesn't have an image_url, check SVG fallbacks
  if (!stage.image_url) {
    const svgFallback = CHARACTER_SVG_FALLBACKS[characterId]?.[stage.stage_number];
    if (svgFallback) {
      return { ...stage, image_url: svgFallback };
    }
  }

  return stage;
}
