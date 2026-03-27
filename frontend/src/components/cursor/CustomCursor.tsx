import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

interface TrailDot {
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [isHoveringLink, setIsHoveringLink] = useState(false);
  const [isHoveringText, setIsHoveringText] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isWindowActive, setIsWindowActive] = useState(true);
  const [cursorColor, setCursorColor] = useState('#FFE500');
  const [cursorBorderColor, setCursorBorderColor] = useState('#0A0A0A');
  const [trails, setTrails] = useState<TrailDot[]>(
    Array(6).fill(null).map(() => ({ x: 0, y: 0, opacity: 0, scale: 0 }))
  );
  const mousePos = useRef({ x: 0, y: 0 });
  const trailPositions = useRef<{ x: number; y: number }[]>(
    Array(6).fill(null).map(() => ({ x: 0, y: 0 }))
  );

  const springX = useSpring(0, { stiffness: 150, damping: 20 });
  const springY = useSpring(0, { stiffness: 150, damping: 20 });

  useEffect(() => {
    const styles = getComputedStyle(document.body);
    const color = styles.getPropertyValue('--cursor-color').trim();
    const border = styles.getPropertyValue('--border-color').trim();
    setCursorColor(color || '#FFE500');
    setCursorBorderColor(border || '#0A0A0A');
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
    springX.set(e.clientX);
    springY.set(e.clientY);

    // Magnetic effect on buttons
    const elements = document.querySelectorAll('button, a, [data-magnetic]');
    elements.forEach((el) => {
      const rect = (el as HTMLElement).getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dist = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      );
      if (dist < 80) {
        const pull = (80 - dist) / 80;
        springX.set(e.clientX + (centerX - e.clientX) * pull * 0.3);
        springY.set(e.clientY + (centerY - e.clientY) * pull * 0.3);
      }
    });

    // Detect hover targets
    const target = e.target as HTMLElement;
    const isLink = target.closest('a, button, [role="button"], input[type="submit"], select, [data-clickable]');
    const isText = target.closest('p, span, h1, h2, h3, h4, h5, h6, label, li, td, th, blockquote');
    setIsHoveringLink(!!isLink);
    setIsHoveringText(!!isText && !isLink);
  }, [springX, springY]);

  const handleMouseDown = useCallback(() => setIsClicking(true), []);
  const handleMouseUp = useCallback(() => setIsClicking(false), []);
  const handleMouseEnter = useCallback(() => setIsWindowActive(true), []);
  const handleMouseLeave = useCallback(() => setIsWindowActive(false), []);

  // Trail animation loop
  useEffect(() => {
    let animFrame: number;
    const animate = () => {
      const positions = trailPositions.current;
      for (let i = positions.length - 1; i > 0; i--) {
        positions[i].x += (positions[i - 1].x - positions[i].x) * 0.3;
        positions[i].y += (positions[i - 1].y - positions[i].y) * 0.3;
      }
      positions[0].x += (mousePos.current.x - positions[0].x) * 0.4;
      positions[0].y += (mousePos.current.y - positions[0].y) * 0.4;

      setTrails(
        positions.map((pos, i) => ({
          x: pos.x,
          y: pos.y,
          opacity: 0.6 - i * 0.1,
          scale: 1 - i * 0.12,
        }))
      );
      animFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animFrame);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleMouseEnter, handleMouseLeave]);

  // Hide on touch devices
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  if (isTouchDevice) return null;

  return (
    <>
      {/* Trail dots */}
      {trails.map((trail, i) => (
        <div
          key={i}
          className="fixed pointer-events-none z-[9998]"
          style={{
            left: trail.x - 3,
            top: trail.y - 3,
            width: 6 * trail.scale,
            height: 6 * trail.scale,
            borderRadius: '50%',
            background: isHoveringLink ? cursorColor : '#FFFFFF',
            opacity: isWindowActive ? trail.opacity : 0,
            border: `1px solid ${cursorBorderColor}`,
            transition: 'none',
          }}
        />
      ))}

      {/* Main cursor */}
      <motion.div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999]"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{ opacity: isWindowActive ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          animate={{
            scale: isClicking ? 0.86 : 1,
            rotate: 0,
            backgroundColor: isHoveringLink ? cursorBorderColor : 'color-mix(in srgb, var(--cursor-color) 22%, transparent)',
            borderWidth: '3px',
            width: isHoveringLink ? 44 : 30,
            height: isHoveringLink ? 44 : 30,
            borderRadius: '999px',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          style={{
            border: `3px solid ${isHoveringLink ? cursorColor : cursorBorderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isHoveringLink
              ? `0 0 0 2px ${cursorBorderColor}, 0 0 0 6px color-mix(in srgb, var(--cursor-color) 35%, transparent)`
              : '0 0 0 2px #FFFFFF',
          }}
        >
          {/* Center dot - hidden when hovering link or text */}
          <motion.div
            ref={dotRef}
            animate={{
              opacity: isHoveringLink || isHoveringText ? 0 : 1,
              scale: isClicking ? 0.5 : 1,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isHoveringLink ? cursorColor : cursorBorderColor,
            }}
          />
        </motion.div>

        <motion.div
          animate={{
            scale: isHoveringLink ? 1.16 : 1,
            opacity: isHoveringText ? 0.15 : 0.5,
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 24 }}
          style={{
            position: 'absolute',
            inset: -12,
            border: `2px solid ${isHoveringLink ? cursorColor : cursorBorderColor}`,
            borderRadius: '50%',
          }}
        />
      </motion.div>
    </>
  );
}
