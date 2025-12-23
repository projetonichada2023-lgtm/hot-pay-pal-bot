import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
}

export function AnimatedCounter({ 
  value, 
  prefix = "", 
  suffix = "", 
  duration = 2,
  delay = 0 
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      
      const startTime = Date.now() + delay * 1000;
      const endTime = startTime + duration * 1000;
      
      const updateCount = () => {
        const now = Date.now();
        
        if (now < startTime) {
          requestAnimationFrame(updateCount);
          return;
        }
        
        if (now >= endTime) {
          setCount(value);
          return;
        }
        
        const progress = (now - startTime) / (duration * 1000);
        // Easing function - ease out cubic
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(easedProgress * value);
        
        setCount(currentValue);
        requestAnimationFrame(updateCount);
      };
      
      requestAnimationFrame(updateCount);
    }
  }, [isInView, value, duration, delay, hasAnimated]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 10,
        delay: delay 
      }}
      className="tabular-nums"
    >
      {prefix}{value >= 1000000 ? formatNumber(count) : count}{suffix}
    </motion.span>
  );
}
