import { cn } from '@/lib/utils';
import { Check, AlertCircle, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FlowStep {
  id: string;
  label: string;
  icon: string;
  description: string;
  position: { x: number; y: number };
  category: string;
  optional?: boolean;
}

interface FlowNodeProps {
  step: FlowStep;
  status: 'configured' | 'inactive' | 'empty';
  isSelected: boolean;
  categoryColor: string;
  messageCount: number;
  onClick: () => void;
}

const NODE_WIDTH = 140;
const NODE_HEIGHT = 100;
const GAP_X = 160;
const GAP_Y = 140;
const OFFSET_X = 40;
const OFFSET_Y = 60;

export const FlowNode = ({
  step,
  status,
  isSelected,
  categoryColor,
  messageCount,
  onClick,
}: FlowNodeProps) => {
  const x = OFFSET_X + step.position.x * GAP_X;
  const y = OFFSET_Y + step.position.y * GAP_Y;

  const statusConfig = {
    configured: {
      ring: 'ring-emerald-500/50',
      indicator: 'bg-emerald-500',
      icon: <Check className="w-3 h-3 text-white" />,
    },
    inactive: {
      ring: 'ring-amber-500/50',
      indicator: 'bg-amber-500',
      icon: <AlertCircle className="w-3 h-3 text-white" />,
    },
    empty: {
      ring: 'ring-muted-foreground/30',
      indicator: 'bg-muted-foreground/30',
      icon: <Plus className="w-3 h-3 text-muted-foreground" />,
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "absolute cursor-pointer transition-all duration-200",
        "hover:scale-105 hover:z-10",
        isSelected && "scale-105 z-10"
      )}
      style={{
        left: x,
        top: y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      }}
      onClick={onClick}
    >
      <div
        className={cn(
          "relative w-full h-full rounded-xl border-2 p-3",
          "bg-gradient-to-br backdrop-blur-sm",
          categoryColor,
          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          !isSelected && `ring-1 ${config.ring}`
        )}
      >
        {/* Status indicator */}
        <div className={cn(
          "absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center",
          config.indicator
        )}>
          {config.icon}
        </div>

        {/* Optional badge */}
        {step.optional && (
          <Badge 
            variant="outline" 
            className="absolute -top-2 left-2 text-[10px] px-1.5 py-0 bg-background/80"
          >
            Opcional
          </Badge>
        )}

        {/* Content */}
        <div className="flex flex-col h-full">
          <div className="text-2xl mb-1">{step.icon}</div>
          <div className="font-medium text-sm leading-tight">{step.label}</div>
          <div className="text-[10px] text-muted-foreground mt-auto line-clamp-2">
            {step.description}
          </div>
        </div>

        {/* Message count */}
        {messageCount > 0 && (
          <div className="absolute -bottom-2 right-2">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {messageCount} msg
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

// Export constants for connector calculations
export { NODE_WIDTH, NODE_HEIGHT, GAP_X, GAP_Y, OFFSET_X, OFFSET_Y };
