import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TourStep } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingTourProps {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const OnboardingTour = ({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: OnboardingTourProps) => {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      const target = document.querySelector(step.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });

        // Calculate tooltip position based on step.position
        const padding = 16;
        const tooltipWidth = 320;
        const tooltipHeight = 200;

        let top = 0;
        let left = 0;

        switch (step.position) {
          case 'right':
            top = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
            left = rect.left + window.scrollX + rect.width + padding;
            break;
          case 'left':
            top = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
            left = rect.left + window.scrollX - tooltipWidth - padding;
            break;
          case 'bottom':
            top = rect.top + window.scrollY + rect.height + padding;
            left = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
            break;
          case 'top':
            top = rect.top + window.scrollY - tooltipHeight - padding;
            left = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
            break;
        }

        // Ensure tooltip stays within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left < padding) left = padding;
        if (left + tooltipWidth > viewportWidth - padding) {
          left = viewportWidth - tooltipWidth - padding;
        }
        if (top < padding) top = padding;
        if (top + tooltipHeight > viewportHeight + window.scrollY - padding) {
          top = viewportHeight + window.scrollY - tooltipHeight - padding;
        }

        setTooltipPosition({ top, left });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [step]);

  if (!targetRect) return null;

  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999]"
      >
        {/* Overlay with spotlight */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Spotlight border */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute pointer-events-none"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        >
          <div className="w-full h-full rounded-xl border-2 border-primary shadow-[0_0_20px_rgba(var(--primary),0.5)] animate-pulse" />
        </motion.div>

        {/* Tooltip */}
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute z-[10000] w-80 pointer-events-auto"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground">
                  Passo {currentStep + 1} de {totalSteps}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onSkip}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.content}
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 pb-3">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    i === currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between p-4 pt-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-muted-foreground"
              >
                Pular tour
              </Button>
              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button variant="outline" size="sm" onClick={onPrev}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                )}
                <Button size="sm" onClick={onNext}>
                  {isLastStep ? 'Concluir' : 'Próximo'}
                  {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
