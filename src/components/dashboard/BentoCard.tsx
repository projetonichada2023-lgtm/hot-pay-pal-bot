import { useState, useRef, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type BentoSize = 'small' | 'medium' | 'large' | 'wide' | 'tall' | 'hero';

interface BentoCardProps {
  size?: BentoSize;
  children: ReactNode;
  gradient?: string;
  className?: string;
  glowColor?: string;
  delay?: number;
}

const sizeClasses: Record<BentoSize, string> = {
  small: 'col-span-1 row-span-1',
  medium: 'col-span-1 row-span-1 md:col-span-2',
  large: 'col-span-1 row-span-1 md:col-span-2 lg:col-span-3',
  wide: 'col-span-1 row-span-1 md:col-span-2 lg:col-span-4',
  tall: 'col-span-1 row-span-2',
  hero: 'col-span-1 row-span-1 md:col-span-2 lg:col-span-3 lg:row-span-2',
};

export const BentoCard = ({
  size = 'small',
  children,
  gradient,
  className,
  glowColor = 'primary',
  delay = 0,
}: BentoCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [shinePosition, setShinePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 15;
    const rotateY = -(x - centerX) / 15;

    setRotate({ x: rotateX, y: rotateY });
    setShinePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovering(false);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'bento-card group relative overflow-hidden rounded-2xl',
        sizeClasses[size],
        className
      )}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: delay * 0.1,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        transform: isHovering
          ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(10px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
        transition: isHovering
          ? 'transform 0.1s ease-out'
          : 'transform 0.4s cubic-bezier(0.03, 0.98, 0.52, 0.99)',
      }}
    >
      {/* Background gradient */}
      {gradient && (
        <div
          className={cn(
            'absolute inset-0 opacity-60 pointer-events-none transition-opacity duration-300',
            `bg-gradient-to-br ${gradient}`,
            isHovering && 'opacity-80'
          )}
        />
      )}

      {/* Glow border effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none',
          isHovering && 'opacity-100'
        )}
        style={{
          background: `radial-gradient(circle at ${shinePosition.x}% ${shinePosition.y}%, hsl(var(--${glowColor}) / 0.3), transparent 50%)`,
        }}
      />

      {/* Shine effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none',
          isHovering && 'opacity-100'
        )}
        style={{
          background: `radial-gradient(circle at ${shinePosition.x}% ${shinePosition.y}%, hsl(0 0% 100% / 0.15), transparent 40%)`,
        }}
      />

      {/* Gradient border */}
      <div className="absolute inset-0 rounded-2xl p-px pointer-events-none">
        <div
          className={cn(
            'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300',
            isHovering && 'opacity-100'
          )}
          style={{
            background: `linear-gradient(135deg, hsl(var(--${glowColor}) / 0.4), transparent 50%, hsl(var(--${glowColor}) / 0.2))`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '1px',
          }}
        />
      </div>

      {/* Card background */}
      <div className="absolute inset-0 bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 transition-all duration-300 group-hover:border-border/70 group-hover:bg-card" />

      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};
