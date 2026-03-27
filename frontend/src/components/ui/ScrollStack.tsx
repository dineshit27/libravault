import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useRef,
} from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollStackProps {
  children: ReactNode;
  className?: string;
}

interface ScrollStackItemProps {
  children: ReactNode;
  className?: string;
  index?: number;
  total?: number;
}

export default function ScrollStack({ children, className = '' }: ScrollStackProps) {
  const items = Children.toArray(children);

  return (
    <div className={`relative ${className}`}>
      {items.map((child, index) => {
        if (!isValidElement(child)) return child;
        return cloneElement(child as ReactElement<ScrollStackItemProps>, {
          index,
          total: items.length,
        });
      })}
    </div>
  );
}

export function ScrollStackItem({ children, className = '', index = 0, total = 1 }: ScrollStackItemProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 80%', 'end 30%'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.93]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -18]);

  return (
    <motion.div
      ref={ref}
      className={`sticky top-24 mb-6 ${className}`}
      style={{
        scale,
        opacity,
        y,
        zIndex: total - index,
      }}
    >
      {children}
    </motion.div>
  );
}

