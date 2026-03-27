import type { HTMLAttributes, ReactNode } from 'react';

type BadgeVariant = 'yellow' | 'coral' | 'blue' | 'green' | 'black' | 'white';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  color?: string; // Custom hex color
}

const variantStyles: Record<BadgeVariant, string> = {
  yellow: 'bg-[var(--accent-primary)] text-[var(--text-primary)]',
  coral: 'bg-[var(--accent-secondary)] text-[var(--bg-card)]',
  blue: 'bg-[var(--accent-tertiary)] text-[var(--bg-card)]',
  green: 'bg-[var(--success)] text-[var(--text-primary)]',
  black: 'bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]',
  white: 'bg-[var(--bg-card)] text-[var(--text-primary)]',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export default function Badge({ children, variant = 'yellow', size = 'sm', className = '', color, ...rest }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-heading font-bold uppercase tracking-wider
        border-2 border-[var(--border-color)] shadow-brutal-sm
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      style={color ? { backgroundColor: color } : undefined}
      {...rest}
    >
      {children}
    </span>
  );
}
