import { CharacterPack, CharacterEvolutionStage } from '../types';
import { CHARACTER_SVG_FALLBACKS } from './characterSvgs';

export const PRECANNED_AVATARS = [
  'Cat',
  'Dog',
  'Rabbit',
  'Bird',
  'Rocket',
  'Star',
  'Crown',
  'Car',
  'Gamepad2',
  'Smile',
  'Heart',
  'Zap'
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
        min_level: 3,
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
        min_level: 4,
        emoji: '👑🦄🌌',
        color_theme: 'from-fuchsia-600 via-indigo-600 to-pink-500',
        animation_class: 'animate-bounce hover:skew-y-3 duration-500',
        image_url: '/characters/unicorn/stage-4.png'
      }
    ]
  },
  {
    id: 'robot',
    name: 'Sparky the Robo-Pup',
    description: 'A high-speed cybernetic puppy programmed for healthy habit development.',
    pack_name: 'Cyber Pack',
    stages: [
      {
        stage_number: 1,
        name: 'Memory Core Pod',
        description: 'A shiny metal capsule holding Sparky\'s core processors. Feed it tasks to activate!',
        min_points: 0,
        min_level: 1,
        emoji: '🖲️🔋',
        color_theme: 'from-cyan-400 to-blue-500',
        animation_class: 'animate-pulse',
        image_url: '/characters/robot/stage-1.png'
      },
      {
        stage_number: 2,
        name: 'Cyber-Puppy v1.0',
        description: 'A metal-bodied pup with digital LED eyes and a wagging copper tail!',
        min_points: 50,
        min_level: 2,
        emoji: '🤖🐶',
        color_theme: 'from-cyan-500 via-teal-400 to-blue-600',
        animation_class: 'animate-bounce',
        image_url: '/characters/robot/stage-2.png'
      },
      {
        stage_number: 3,
        name: 'Mecha-Scout',
        description: 'A playful teen robot pup with antenna ears and sparking tail. Ready for any mission!',
        min_points: 150,
        min_level: 3,
        emoji: '🤖⚡',
        color_theme: 'from-cyan-500 via-blue-500 to-indigo-600',
        animation_class: 'animate-bounce hover:scale-105 duration-300',
        image_url: '/characters/robot/stage-3.png'
      },
      {
        stage_number: 4,
        name: 'Mecha-Guardian Alpha',
        description: 'Armed with helpful tools and protective forcefields, powered entirely by child responsibility.',
        min_points: 300,
        min_level: 4,
        emoji: '🦁🤖⚡',
        color_theme: 'from-blue-600 via-cyan-600 to-violet-700',
        animation_class: 'animate-pulse hover:rotate-6 duration-300',
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
        min_level: 3,
        emoji: '🦖✨',
        color_theme: 'from-emerald-500 via-green-500 to-teal-500',
        animation_class: 'animate-bounce hover:scale-105 duration-300'
      },
      {
        stage_number: 4,
        name: 'Stegosaurus Overlord',
        description: 'A giant, gentle dinosaur sporting glowing rainbow-colored tail plates!',
        min_points: 300,
        min_level: 4,
        emoji: '🦕👑🌿',
        color_theme: 'from-green-600 via-emerald-600 to-teal-700',
        animation_class: 'animate-pulse'
      }
    ]
  },
  {
    id: 'dragon',
    name: 'Ember the Fire Dragon',
    description: 'A spirited little dragon who loves hot chocolate and organizing toys.',
    pack_name: 'Fantasy Pack',
    stages: [
      {
        stage_number: 1,
        name: 'Molten Lava Egg',
        description: 'A burning warm egg with crackling magma details. Keep doing chores to cool it down!',
        min_points: 0,
        min_level: 1,
        emoji: '🌋🥚',
        color_theme: 'from-orange-400 to-red-500',
        animation_class: 'animate-pulse'
      },
      {
        stage_number: 2,
        name: 'Flame Hatchling',
        description: 'A cute red dragon with tiny wings. Can blow tiny heart-shaped smoke rings!',
        min_points: 50,
        min_level: 2,
        emoji: '🐲🔥',
        color_theme: 'from-orange-500 via-red-500 to-amber-400',
        animation_class: 'animate-bounce'
      },
      {
        stage_number: 3,
        name: 'Fire Scout',
        description: 'A teenage dragon with growing wings and a fiery spirit. Ready for any challenge!',
        min_points: 150,
        min_level: 3,
        emoji: '🐲⚡',
        color_theme: 'from-red-500 via-orange-500 to-amber-400',
        animation_class: 'animate-bounce hover:scale-105 duration-300'
      },
      {
        stage_number: 4,
        name: 'Inferno Emperor',
        description: 'A magnificent dragon that breathes rainbow sparks and floats with majestic wings!',
        min_points: 300,
        min_level: 4,
        emoji: '🐉👑🔥',
        color_theme: 'from-red-600 via-orange-600 to-rose-700',
        animation_class: 'animate-pulse'
      }
    ]
  },
  {
    id: 'cat',
    name: 'Pippin the Magic Cat',
    description: 'A sophisticated feline familiar who masters the magical arts of reading and creativity.',
    pack_name: 'Sorcery Pack',
    stages: [
      {
        stage_number: 1,
        name: 'Mystic Spore Pod',
        description: 'A magical glowing blue bulb that hums with soft wizarding tunes.',
        min_points: 0,
        min_level: 1,
        emoji: '🔮🌱',
        color_theme: 'from-blue-400 via-indigo-400 to-purple-400',
        animation_class: 'animate-pulse'
      },
      {
        stage_number: 2,
        name: 'Spellcaster Kitten',
        description: 'A tiny black kitten sporting an adorable oversized floppy wizard hat.',
        min_points: 50,
        min_level: 2,
        emoji: '🧙‍♀️🐈‍⬛',
        color_theme: 'from-indigo-500 via-purple-500 to-pink-400',
        animation_class: 'animate-bounce'
      },
      {
        stage_number: 3,
        name: 'Shadow Sorcerer',
        description: 'A teenage cat with a magical wand and growing powers. Casting spells of good behavior!',
        min_points: 150,
        min_level: 3,
        emoji: '🧙‍♂️🐈‍⬛',
        color_theme: 'from-indigo-500 via-purple-600 to-violet-500',
        animation_class: 'animate-bounce hover:scale-105 duration-300'
      },
      {
        stage_number: 4,
        name: 'Archmage Familiar',
        description: 'Surrounded by floating magical scrolls, holding a glowing star-tipped wand.',
        min_points: 300,
        min_level: 4,
        emoji: '🌌🧙‍♂️🐈‍⬛',
        color_theme: 'from-purple-600 via-indigo-700 to-blue-600',
        animation_class: 'animate-pulse'
      }
    ]
  },
  {
    id: 'bunny',
    name: 'Nebula the Space Bunny',
    description: 'An adventurous rabbit from the moon who is eager to complete rocket missions.',
    pack_name: 'Galaxy Pack',
    stages: [
      {
        stage_number: 1,
        name: 'Astro Pod',
        description: 'A retro-futuristic cryogenic capsule protecting the lunar passenger.',
        min_points: 0,
        min_level: 1,
        emoji: '🛸🪐',
        color_theme: 'from-violet-400 to-fuchsia-500',
        animation_class: 'animate-pulse'
      },
      {
        stage_number: 2,
        name: 'Rocket Hopper',
        description: 'A hyper-active bunny wearing a mini space helmet and jetpack ears!',
        min_points: 50,
        min_level: 2,
        emoji: '🐰🚀',
        color_theme: 'from-fuchsia-500 via-pink-500 to-violet-500',
        animation_class: 'animate-bounce'
      },
      {
        stage_number: 3,
        name: 'Star Hopper',
        description: 'A teenage space bunny with sparkle-tipped ears and cosmic energy. Hopping between stars!',
        min_points: 150,
        min_level: 3,
        emoji: '🐰⭐',
        color_theme: 'from-fuchsia-500 via-violet-500 to-purple-500',
        animation_class: 'animate-bounce hover:scale-105 duration-300'
      },
      {
        stage_number: 4,
        name: 'Galaxy Vanguard',
        description: 'Riding a mini cosmic speeder, charting new chore systems across the universe.',
        min_points: 300,
        min_level: 4,
        emoji: '🐰🌟🛰️',
        color_theme: 'from-violet-600 via-indigo-600 to-fuchsia-700',
        animation_class: 'animate-pulse'
      }
    ]
  }
];

/**
 * Get the character's current evolution stage based on their level.
 * Falls back to the first stage if no match is found.
 */
export function getCharacterStage(characterId: string, level: number): CharacterEvolutionStage {
  const character = CHARACTER_PACKS.find(c => c.id === characterId) || CHARACTER_PACKS[0];
  const sortedStages = [...character.stages].sort((a, b) => b.min_level - a.min_level);
  const stage = sortedStages.find(stage => level >= stage.min_level) || character.stages[0];

  // If stage doesn't have an image_url, check SVG fallbacks
  if (!stage.image_url) {
    const svgFallback = CHARACTER_SVG_FALLBACKS[characterId]?.[stage.stage_number];
    if (svgFallback) {
      return { ...stage, image_url: svgFallback };
    }
  }

  return stage;
}
