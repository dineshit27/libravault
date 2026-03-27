import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  color?: 'white' | 'yellow' | 'blue' | 'coral' | 'green' | 'black';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const bgColors: Record<string, string> = {
  white: 'bg-[var(--bg-card)] text-[var(--text-primary)]',
  yellow: 'bg-[var(--accent-primary)] text-[var(--text-primary)]',
  blue: 'bg-[var(--accent-tertiary)] text-[var(--bg-card)]',
  coral: 'bg-[var(--accent-secondary)] text-[var(--bg-card)]',
  green: 'bg-[var(--success)] text-[var(--text-primary)]',
  black: 'bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]',
};

const paddings: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

export default function Card({
  children,
  className = '',
  hoverable = true,
  color = 'white',
  padding = 'md',
  onClick,
}: CardProps) {
  const Component = hoverable ? motion.div : 'div';
  const motionProps = hoverable
    ? {
        whileHover: { x: -2, y: -2 },
        whileTap: onClick ? { x: 4, y: 4 } : undefined,
      }
    : {};

  return (
    <Component
      {...motionProps}
      onClick={onClick}
      className={`
        border-3 border-[var(--border-color)] shadow-brutal
        ${hoverable ? 'transition-shadow duration-150 hover:shadow-brutal-hover active:shadow-brutal-active' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${bgColors[color]}
        ${paddings[padding]}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}
