import confetti from 'canvas-confetti';

type ConfettiType = 'success' | 'celebration' | 'payment' | 'subtle';

interface ConfettiOptions {
  type?: ConfettiType;
  duration?: number;
}

export function useConfetti() {
  const fire = (options: ConfettiOptions = {}) => {
    const { type = 'success', duration = 3000 } = options;

    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    switch (type) {
      case 'celebration':
        // Big celebration with multiple bursts
        const end = Date.now() + duration;
        const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
        
        (function frame() {
          confetti({
            ...defaults,
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors,
          });
          confetti({
            ...defaults,
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors,
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        })();
        break;

      case 'payment':
        // Green money-themed confetti
        confetti({
          ...defaults,
          particleCount: 100,
          spread: 70,
          colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#ffffff'],
          shapes: ['circle', 'square'],
        });
        
        setTimeout(() => {
          confetti({
            ...defaults,
            particleCount: 50,
            spread: 100,
            colors: ['#10b981', '#34d399', '#059669'],
            origin: { y: 0.6 },
          });
        }, 250);
        break;

      case 'subtle':
        // Subtle celebration for smaller wins
        confetti({
          ...defaults,
          particleCount: 30,
          spread: 50,
          startVelocity: 20,
          decay: 0.95,
          colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
        });
        break;

      case 'success':
      default:
        // Standard success confetti
        confetti({
          ...defaults,
          particleCount: 80,
          spread: 60,
          colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
        });
        
        setTimeout(() => {
          confetti({
            ...defaults,
            particleCount: 40,
            spread: 80,
            origin: { y: 0.65 },
            colors: ['#10b981', '#3b82f6', '#8b5cf6'],
          });
        }, 150);
        break;
    }
  };

  const fireFromElement = (element: HTMLElement, options: ConfettiOptions = {}) => {
    const rect = element.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { x, y },
      colors: ['#10b981', '#3b82f6', '#8b5cf6'],
      zIndex: 9999,
    });
  };

  return { fire, fireFromElement };
}
