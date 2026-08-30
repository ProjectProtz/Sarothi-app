/**
 * Question templates for the Regional Finger Math game.
 *
 * Placeholders:
 * {n} - The first number
 * {m} - The second number
 */

import { TranslationKey } from '@/lib/i18n';

export type Operation = 'add' | 'subtract';

export interface MathTemplate {
  id: string;
  templateKey: TranslationKey;
  operation: Operation;
}

export const MATH_TEMPLATES: MathTemplate[] = [
  {
    id: 'oranges_add',
    templateKey: 'game.math.template.oranges_add',
    operation: 'add',
  },
  {
    id: 'oranges_sub',
    templateKey: 'game.math.template.oranges_sub',
    operation: 'subtract',
  },
  {
    id: 'tea_add',
    templateKey: 'game.math.template.tea_add',
    operation: 'add',
  },
  {
    id: 'tea_sub',
    templateKey: 'game.math.template.tea_sub',
    operation: 'subtract',
  },
  {
    id: 'pitha_add',
    templateKey: 'game.math.template.pitha_add',
    operation: 'add',
  }
];
