/**
 * Theme configuration for the Regional Object Counting game.
 *
 * HOW TO ADD A NEW THEME:
 * 1. Add a new entry to the `COUNTING_THEMES` array.
 * 2. Add translation keys to en.json and as.json for the backgroundName, targetName, and distractorNames.
 * 3. Update the `id` to be unique.
 *
 * Visuals currently use emojis as placeholders. When real assets are available,
 * replace the `icon` fields with import paths to SVG/PNG files.
 */

import { TranslationKey } from '@/lib/i18n';

export interface CountingTheme {
  id: string;
  backgroundNameKey: TranslationKey;
  targetNameKey: TranslationKey;
  targetIcon: string;
  distractorNameKeys: TranslationKey[];
  distractorIcons: string[];
  backgroundColor: string;
}

export const COUNTING_THEMES: CountingTheme[] = [
  {
    id: 'bihu_harvest',
    backgroundNameKey: 'game.counting.theme.bihu',
    targetNameKey: 'game.counting.item.paddy',
    targetIcon: '🌾', // Placeholder for Paddy Sheaves
    distractorNameKeys: ['game.counting.item.basket'],
    distractorIcons: ['🧺'], // Placeholder for Bamboo Baskets
    backgroundColor: '#fef3c7', // Warm harvest yellow
  },
  {
    id: 'tea_garden',
    backgroundNameKey: 'game.counting.theme.tea',
    targetNameKey: 'game.counting.item.tea_leaf',
    targetIcon: '🍃', // Placeholder for Tea Leaves
    distractorNameKeys: ['game.counting.item.betel_nut'],
    distractorIcons: ['🌰'], // Placeholder for Betel Nuts (closest emoji)
    backgroundColor: '#dcfce7', // Soft green
  },
  {
    id: 'wangala',
    backgroundNameKey: 'game.counting.theme.wangala',
    targetNameKey: 'game.counting.item.feather',
    targetIcon: '🪶', // Placeholder for Hornbill Feathers
    distractorNameKeys: ['game.counting.item.shawl'],
    distractorIcons: ['🧣'], // Placeholder for Gamosa/Shawl motifs
    backgroundColor: '#fee2e2', // Soft red/festive
  },
];
