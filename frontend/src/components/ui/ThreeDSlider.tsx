import { forwardRef, useCallback, useEffect, useRef, type CSSProperties } from 'react';

export interface SliderItemData {
  title: string;
  num: string;
  imageUrl: string;
  data?: unknown;
}

interface ThreeDSliderProps {
  items: SliderItemData[];
  speedWheel?: number;
  speedDrag?: number;
  containerStyle?: CSSProperties;
  className?: string;
  onItemClick?: (item: SliderItemData, index: number) => void;
}

interface SliderItemProps {
  item: SliderItemData;
  onClick: () => void;
}

const SliderItem = forwardRef<HTMLDivElement, SliderItemProps>(({ item, onClick }, ref) => {
  return (
    <div
      ref={ref}
      className="absolute top-1/2 left-1/2 cursor-pointer select-none rounded-xl shadow-2xl bg-black transform-origin-[0%_100%] pointer-events-auto w-[var(--width)] h-[var(--height)] -mt-[calc(var(--height)/2)] -ml-[calc(var(--width)/2)] overflow-hidden will-change-transform"
      style={{
        '--width': 'clamp(145px, 22vw, 260px)',
        '--height': 'clamp(210px, 31vw, 360px)',
        transition: 'none',
        display: 'block',
      } as CSSProperties & { [key: string]: string }}
      onClick={onClick}
    >
      <div className="slider-item-content absolute inset-0 z-10 transition-opacity duration-300 ease-out will-change-opacity" style={{ opacity: 1 }}>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/35 via-transparent via-50% to-black/65" />

        <div className="absolute z-20 text-white bottom-5 left-5 right-4 text-[clamp(18px,2.4vw,28px)] leading-tight font-heading font-bold uppercase drop-shadow-md">
          {item.title}
        </div>

        <div className="absolute z-20 text-white top-3 left-5 text-[clamp(18px,8vw,72px)] font-heading font-bold leading-none">
          {item.num}
        </div>

        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover pointer-events-none"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
});

SliderItem.displayName = 'SliderItem';

export default function ThreeDSlider({
  items,
  speedWheel = 0.05,
  speedDrag = -0.15,
  containerStyle = {},
  className = '',
  onItemClick,
}: ThreeDSliderProps) {
  const progressRef = useRef(50);
  const targetProgressRef = useRef(50);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cacheRef = useRef<Record<number, { transform: string; zIndex: string; opacity: string }>>({});

  const numItems = items.length;

  const update = useCallback(() => {
    if (!itemRefs.current.length || numItems === 0) return;

    progressRef.current += (targetProgressRef.current - progressRef.current) * 0.1;

    const progress = progressRef.current;
    const clamped = Math.max(0, Math.min(progress, 100));
    const activeFloat = (clamped / 100) * (numItems - 1);

    itemRefs.current.forEach((el, index) => {
      if (!el) return;

      const denominator = numItems > 1 ? numItems - 1 : 1;
      const ratio = (index - activeFloat) / denominator;

      const tx = ratio * 360;
      const ty = ratio * 80;
      const rot = ratio * 36;

      const dist = Math.abs(index - activeFloat);
      const z = numItems - dist;
      const opacity = (z / numItems) * 3 - 2;

      const newTransform = `translate3d(${tx}%, ${ty}%, 0) rotate(${rot}deg)`;
      const newZIndex = Math.round(z * 10).toString();
      const newOpacity = Math.max(0, Math.min(1, opacity)).toString();

      if (!cacheRef.current[index]) {
        cacheRef.current[index] = { transform: '', zIndex: '', opacity: '' };
      }
      const cache = cacheRef.current[index];

      if (cache.transform !== newTransform) {
        el.style.transform = newTransform;
        cache.transform = newTransform;
      }
      if (cache.zIndex !== newZIndex) {
        el.style.zIndex = newZIndex;
        cache.zIndex = newZIndex;
      }

      const inner = el.querySelector('.slider-item-content') as HTMLElement | null;
      if (inner && cache.opacity !== newOpacity) {
        inner.style.opacity = newOpacity;
        cache.opacity = newOpacity;
      }
    });
  }, [numItems]);

  useEffect(() => {
    let active = true;

    const loop = () => {
      if (!active) return;
      update();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [update]);

  useEffect(() => {
    targetProgressRef.current = 50;
    progressRef.current = 50;
    cacheRef.current = {};
    itemRefs.current = [];
  }, [items]);

  const getClientX = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) return e.touches[0]?.clientX;
    return e.clientX;
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    const wheelProgress = e.deltaY * speedWheel;
    const current = targetProgressRef.current;
    const next = current + wheelProgress;

    if ((next < 0 && e.deltaY < 0) || (next > 100 && e.deltaY > 0)) return;

    e.preventDefault();
    targetProgressRef.current = Math.max(0, Math.min(100, next));
  }, [speedWheel]);

  const handleMouseDown = useCallback((e: MouseEvent | TouchEvent) => {
    isDownRef.current = true;
    const x = getClientX(e);
    if (x !== undefined) startXRef.current = x;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDownRef.current) return;

    const x = getClientX(e);
    if (x === undefined) return;

    const diff = (x - startXRef.current) * speedDrag;
    const current = targetProgressRef.current;
    targetProgressRef.current = Math.max(0, Math.min(100, current + diff));
    startXRef.current = x;
  }, [speedDrag]);

  const handleMouseUp = useCallback(() => {
    isDownRef.current = false;
  }, []);

  const handleClick = useCallback((item: SliderItemData, index: number) => {
    const denominator = numItems > 1 ? numItems - 1 : 1;
    targetProgressRef.current = (index / denominator) * 100;
    onItemClick?.(item, index);
  }, [numItems, onItemClick]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wheelOptions: AddEventListenerOptions = { passive: false };
    container.addEventListener('wheel', handleWheel, wheelOptions);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('touchstart', handleMouseDown as EventListener, { passive: true });

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove as EventListener, { passive: true });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('touchstart', handleMouseDown as EventListener);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove as EventListener);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-brutal-white border-3 border-brutal-black shadow-brutal ${className}`}
      style={containerStyle}
    >
      <div className="relative z-10 h-[520px] md:h-[600px] overflow-hidden pointer-events-none w-full">
        {items.map((item, index) => (
          <SliderItem
            key={`slider-item-${index}`}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            item={item}
            onClick={() => handleClick(item, index)}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-[90px] w-[10px] h-full border border-y-0 border-white/15" />
      </div>
    </div>
  );
}
