/**
 * NavCard — large, accessible navigation card for the Home screen.
 *
 * Designed for elderly users: very large tap target, icon + label + subtitle,
 * high contrast, visible hover/focus states, ARIA role="link".
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NavCard.module.css';

interface NavCardProps {
  /** Navigation destination path */
  to: string;
  /** Large emoji or icon character */
  icon: string;
  /** Primary label (translated) */
  label: string;
  /** Secondary description line (translated) */
  subtitle: string;
  /** Background accent color token e.g. var(--card-play-bg) */
  colorVar: string;
  /** ARIA label for screen readers */
  ariaLabel: string;
  /** Unique ID for browser testing / automation */
  id: string;
}

export function NavCard({
  to,
  icon,
  label,
  subtitle,
  colorVar,
  ariaLabel,
  id,
}: NavCardProps) {
  const navigate = useNavigate();

  const handleClick = () => navigate(to);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(to);
    }
  };

  return (
    <div
      id={id}
      className={styles.card}
      style={{ '--card-accent': colorVar } as React.CSSProperties}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      aria-label={ariaLabel}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.label}>{label}</span>
      <span className={styles.subtitle}>{subtitle}</span>
    </div>
  );
}
