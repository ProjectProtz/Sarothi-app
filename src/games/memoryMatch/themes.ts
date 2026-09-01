/**
 * Theme configuration for the Regional Memory Match game.
 *
 * Following the same structural pattern as `src/games/counting/themes.ts`.
 *
 * HOW TO ADD REAL IMAGES IN THE FUTURE:
 * 1. Place your image asset (PNG, SVG, JPG, etc.) into `public/assets/memory/` or `src/assets/`.
 * 2. Set the `imagePath` property of the target item to the relative asset path (e.g., `/assets/memory/tea_garden.jpg`).
 * 3. The card render logic in `index.tsx` checks `item.imagePath` first. If present, it renders an `<img>` tag;
 *    otherwise, it falls back to `item.icon` (placeholder emoji/symbol).
 *    No code modifications in components are required to swap assets.
 *
 * HOW TO ADD A NEW THEME:
 * 1. Append a new object to the `MEMORY_MATCH_THEMES` array below.
 * 2. Define at least 8 unique items in the `items` array.
 * 3. Add corresponding translation keys to both `src/lib/i18n/locales/en.json` and `src/lib/i18n/locales/as.json`.
 */

import { TranslationKey } from '@/lib/i18n';

export interface MemoryMatchItem {
  id: string;
  nameKey: TranslationKey;
  icon: string; // Placeholder emoji or symbol
  imagePath?: string; // Optional path for real photographic/illustration asset
}

export interface MemoryMatchTheme {
  id: string;
  themeNameKey: TranslationKey;
  backgroundColor: string;
  cardBackIcon: string;
  items: MemoryMatchItem[];
}

export const MEMORY_MATCH_THEMES: MemoryMatchTheme[] = [
  {
    id: 'ner_landscapes',
    themeNameKey: 'game.memory.theme.landscapes',
    backgroundColor: '#ecfdf5', // Soft serene green
    cardBackIcon: '🏞️',
    items: [
      {
        id: 'tea_garden',
        nameKey: 'game.memory.item.tea_garden',
        icon: '🍵',
        imagePath: undefined, // E.g., '/assets/memory/tea_garden.jpg'
      },
      {
        id: 'kaziranga',
        nameKey: 'game.memory.item.kaziranga',
        icon: '🦏',
        imagePath: undefined, // E.g., '/assets/memory/kaziranga.jpg'
      },
      {
        id: 'loktak',
        nameKey: 'game.memory.item.loktak',
        icon: '🏞️',
        imagePath: undefined, // E.g., '/assets/memory/loktak.jpg'
      },
      {
        id: 'root_bridge',
        nameKey: 'game.memory.item.root_bridge',
        icon: '🌉',
        imagePath: undefined, // E.g., '/assets/memory/root_bridge.jpg'
      },
      {
        id: 'dzukou',
        nameKey: 'game.memory.item.dzukou',
        icon: '🏔️',
        imagePath: undefined, // E.g., '/assets/memory/dzukou.jpg'
      },
      {
        id: 'brahmaputra',
        nameKey: 'game.memory.item.brahmaputra',
        icon: '🌊',
        imagePath: undefined, // E.g., '/assets/memory/brahmaputra.jpg'
      },
      {
        id: 'hill_terrace',
        nameKey: 'game.memory.item.hill_terrace',
        icon: '🌾',
        imagePath: undefined, // E.g., '/assets/memory/hill_terrace.jpg'
      },
      {
        id: 'bamboo_grove',
        nameKey: 'game.memory.item.bamboo_grove',
        icon: '🎋',
        imagePath: undefined, // E.g., '/assets/memory/bamboo_grove.jpg'
      },
    ],
  },
  {
    id: 'regional_birds',
    themeNameKey: 'game.memory.theme.birds',
    backgroundColor: '#f0f9ff', // Soft sky blue
    cardBackIcon: '🪶',
    items: [
      {
        id: 'hornbill',
        nameKey: 'game.memory.item.hornbill',
        icon: '🦅',
        imagePath: undefined, // E.g., '/assets/memory/hornbill.jpg'
      },
      {
        id: 'wood_duck',
        nameKey: 'game.memory.item.wood_duck',
        icon: '🦆',
        imagePath: undefined, // E.g., '/assets/memory/wood_duck.jpg'
      },
      {
        id: 'florican',
        nameKey: 'game.memory.item.florican',
        icon: '🐦',
        imagePath: undefined, // E.g., '/assets/memory/florican.jpg'
      },
      {
        id: 'pheasant',
        nameKey: 'game.memory.item.pheasant',
        icon: '🦚',
        imagePath: undefined, // E.g., '/assets/memory/pheasant.jpg'
      },
      {
        id: 'tragopan',
        nameKey: 'game.memory.item.tragopan',
        icon: '🦜',
        imagePath: undefined, // E.g., '/assets/memory/tragopan.jpg'
      },
      {
        id: 'parrotbill',
        nameKey: 'game.memory.item.parrotbill',
        icon: '🐥',
        imagePath: undefined, // E.g., '/assets/memory/parrotbill.jpg'
      },
      {
        id: 'bush_quail',
        nameKey: 'game.memory.item.bush_quail',
        icon: '🪺',
        imagePath: undefined, // E.g., '/assets/memory/bush_quail.jpg'
      },
      {
        id: 'spotted_dove',
        nameKey: 'game.memory.item.spotted_dove',
        icon: '🕊️',
        imagePath: undefined, // E.g., '/assets/memory/spotted_dove.jpg'
      },
    ],
  },
  {
    id: 'regional_food',
    themeNameKey: 'game.memory.theme.food',
    backgroundColor: '#fff7ed', // Warm festive amber
    cardBackIcon: '🍲',
    items: [
      {
        id: 'momo',
        nameKey: 'game.memory.item.momo',
        icon: '🥟',
        imagePath: undefined, // E.g., '/assets/memory/momo.jpg'
      },
      {
        id: 'khar',
        nameKey: 'game.memory.item.khar',
        icon: '🥣',
        imagePath: undefined, // E.g., '/assets/memory/khar.jpg'
      },
      {
        id: 'bamboo_shoot',
        nameKey: 'game.memory.item.bamboo_shoot',
        icon: '🎍',
        imagePath: undefined, // E.g., '/assets/memory/bamboo_shoot.jpg'
      },
      {
        id: 'pitha',
        nameKey: 'game.memory.item.pitha',
        icon: '🍘',
        imagePath: undefined, // E.g., '/assets/memory/pitha.jpg'
      },
      {
        id: 'assam_tea',
        nameKey: 'game.memory.item.assam_tea',
        icon: '🍃',
        imagePath: undefined, // E.g., '/assets/memory/assam_tea.jpg'
      },
      {
        id: 'black_rice',
        nameKey: 'game.memory.item.black_rice',
        icon: '🍚',
        imagePath: undefined, // E.g., '/assets/memory/black_rice.jpg'
      },
      {
        id: 'fish_tenga',
        nameKey: 'game.memory.item.fish_tenga',
        icon: '🐟',
        imagePath: undefined, // E.g., '/assets/memory/fish_tenga.jpg'
      },
      {
        id: 'jolpan',
        nameKey: 'game.memory.item.jolpan',
        icon: '🥛',
        imagePath: undefined, // E.g., '/assets/memory/jolpan.jpg'
      },
    ],
  },
];
