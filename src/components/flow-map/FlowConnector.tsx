import { NODE_WIDTH, NODE_HEIGHT, GAP_X, GAP_Y, OFFSET_X, OFFSET_Y } from './FlowNode';

interface FlowConnectorProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label?: string;
  dashed?: boolean;
}

export const FlowConnector = ({ from, to, label, dashed }: FlowConnectorProps) => {
  // Calculate pixel positions
  const fromX = OFFSET_X + from.x * GAP_X + NODE_WIDTH;
  const fromY = OFFSET_Y + from.y * GAP_Y + NODE_HEIGHT / 2;
  const toX = OFFSET_X + to.x * GAP_X;
  const toY = OFFSET_Y + to.y * GAP_Y + NODE_HEIGHT / 2;

  // Create path
  let path: string;
  
  if (from.y === to.y) {
    // Horizontal line
    path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
  } else if (from.x === to.x) {
    // Vertical line (same column, different row)
    const midY = (fromY + toY) / 2;
    path = `M ${fromX - NODE_WIDTH/2} ${fromY + NODE_HEIGHT/2} 
            L ${fromX - NODE_WIDTH/2} ${midY}
            L ${toX - NODE_WIDTH/2} ${midY}
            L ${toX - NODE_WIDTH/2} ${toY - NODE_HEIGHT/2}`;
  } else {
    // Curved path for diagonal connections
    const controlX = (fromX + toX) / 2;
    path = `M ${fromX} ${fromY} 
            C ${controlX} ${fromY}, ${controlX} ${toY}, ${toX} ${toY}`;
  }

  // Calculate label position
  const labelX = (fromX + toX) / 2;
  const labelY = (fromY + toY) / 2 - 8;

  return (
    <g>
      {/* Main path */}
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeDasharray={dashed ? "6 4" : undefined}
        className="text-muted-foreground/40"
        markerEnd="url(#arrowhead)"
      />
      
      {/* Arrow marker */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="currentColor"
            className="text-muted-foreground/40"
          />
        </marker>
      </defs>

      {/* Label */}
      {label && (
        <g>
          <rect
            x={labelX - 30}
            y={labelY - 8}
            width={60}
            height={16}
            rx={4}
            fill="hsl(var(--background))"
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
          <text
            x={labelX}
            y={labelY + 4}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
};
