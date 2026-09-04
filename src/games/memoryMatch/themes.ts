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
        imagePath: '/assests/photos for sarothi/regional places/tea garden.jpeg',
      },
      {
        id: 'kaziranga',
        nameKey: 'game.memory.item.kaziranga',
        icon: '🦏',
        imagePath: '/assests/photos for sarothi/regional places/Kaziranga.jpg',
      },
      {
        id: 'loktak',
        nameKey: 'game.memory.item.loktak',
        icon: '🏞️',
        imagePath: '/assests/photos for sarothi/regional places/Loktak.jpg',
      },
      {
        id: 'root_bridge',
        nameKey: 'game.memory.item.root_bridge',
        icon: '🌉',
        imagePath: '/assests/photos for sarothi/regional places/root bridge.jpeg',
      },
      {
        id: 'dzukou',
        nameKey: 'game.memory.item.dzukou',
        icon: '🏔️',
        imagePath: '/assests/photos for sarothi/regional places/dzukou.jpeg',
      },
      {
        id: 'brahmaputra',
        nameKey: 'game.memory.item.brahmaputra',
        icon: '🌊',
        imagePath: '/assests/photos for sarothi/regional places/Brahmaputra.jpg',
      },
      {
        id: 'hill_terrace',
        nameKey: 'game.memory.item.hill_terrace',
        icon: '🌾',
        imagePath: '/assests/photos for sarothi/regional places/hill terrace.jpg',
      },
      {
        id: 'bamboo_grove',
        nameKey: 'game.memory.item.bamboo_grove',
        icon: '🎋',
        imagePath: '/assests/photos for sarothi/regional places/bamboo grove.jpeg',
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
        imagePath: '/assests/photos for sarothi/regional birds/Hornbill.jpg',
      },
      {
        id: 'wood_duck',
        nameKey: 'game.memory.item.wood_duck',
        icon: '🦆',
        imagePath: '/assests/photos for sarothi/regional birds/wood duck.jpeg',
      },
      {
        id: 'florican',
        nameKey: 'game.memory.item.florican',
        icon: '🐦',
        imagePath: '/assests/photos for sarothi/regional birds/Florican.jpeg',
      },
      {
        id: 'pheasant',
        nameKey: 'game.memory.item.pheasant',
        icon: '🦚',
        imagePath: '/assests/photos for sarothi/regional birds/pheasant.jpeg',
      },
      {
        id: 'tragopan',
        nameKey: 'game.memory.item.tragopan',
        icon: '🦜',
        imagePath: '/assests/photos for sarothi/regional birds/Tragopan.jpeg',
      },
      {
        id: 'parrotbill',
        nameKey: 'game.memory.item.parrotbill',
        icon: '🐥',
        imagePath: '/assests/photos for sarothi/regional birds/Parrotbill.jpeg',
      },
      {
        id: 'bush_quail',
        nameKey: 'game.memory.item.bush_quail',
        icon: '🪺',
        imagePath: '/assests/photos for sarothi/regional birds/Bush Quail.jpeg',
      },
      {
        id: 'spotted_dove',
        nameKey: 'game.memory.item.spotted_dove',
        icon: '🕊️',
        imagePath: '/assests/photos for sarothi/regional birds/Spotted dove.jpg',
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
        imagePath: '/assests/photos for sarothi/regional food/Momo.jpg',
      },
      {
        id: 'khar',
        nameKey: 'game.memory.item.khar',
        icon: '🥣',
        imagePath: '/assests/photos for sarothi/regional food/Khar.jpg',
      },
      {
        id: 'bamboo_shoot',
        nameKey: 'game.memory.item.bamboo_shoot',
        icon: '🎍',
        imagePath: '/assests/photos for sarothi/regional food/Bamboo Shoot.jpeg',
      },
      {
        id: 'pitha',
        nameKey: 'game.memory.item.pitha',
        icon: '🍘',
        imagePath: '/assests/photos for sarothi/regional food/Pitha.jpg',
      },
      {
        id: 'assam_tea',
        nameKey: 'game.memory.item.assam_tea',
        icon: '🍃',
        imagePath: '/assests/photos for sarothi/regional food/Assam Tea.jpeg',
      },
      {
        id: 'black_rice',
        nameKey: 'game.memory.item.black_rice',
        icon: '🍚',
        imagePath: '/assests/photos for sarothi/regional food/Black rice.jpeg',
      },
      {
        id: 'fish_tenga',
        nameKey: 'game.memory.item.fish_tenga',
        icon: '🐟',
        imagePath: '/assests/photos for sarothi/regional food/Fish Tenga.jpeg',
      },
      {
        id: 'jolpan',
        nameKey: 'game.memory.item.jolpan',
        icon: '🥛',
        imagePath: '/assests/photos for sarothi/regional food/Jolpan.jpeg',
      },
    ],
  },
];
