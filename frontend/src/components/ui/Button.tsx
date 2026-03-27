import { forwardRef, type ReactNode, useRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'onDrag' | 'ref'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] border-[var(--border-color)]',
  secondary: 'bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] border-[var(--border-color)]',
  danger: 'bg-[var(--error)] text-white border-[var(--border-color)]',
  success: 'bg-[var(--success)] text-[var(--text-primary)] border-[var(--border-color)]',
  outline: 'bg-transparent text-[var(--text-primary)] border-[var(--border-color)]',
  ghost: 'bg-transparent text-[var(--text-primary)] border-transparent shadow-none hover:bg-[var(--bg-secondary)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-4 text-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, iconRight, isLoading, fullWidth, children, className = '', disabled, onClick, ...props }, ref) => {
    const rippleRef = useRef<HTMLSpanElement>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Ripple effect
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ x: -2, y: -2 }}
        whileTap={{ x: 4, y: 4 }}
        className={`
          btn-ripple inline-flex items-center justify-center gap-2
          font-heading font-bold uppercase tracking-wide
          border-3 border-[var(--border-color)]
          shadow-brutal transition-shadow duration-150
          hover:shadow-brutal-hover active:shadow-brutal-active
          disabled:opacity-50 disabled:pointer-events-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
            {iconRight && <span className="shrink-0">{iconRight}</span>}
          </>
        )}
        <span ref={rippleRef} />
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
