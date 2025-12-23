import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings2, GripVertical, RotateCcw } from 'lucide-react';
import { MetricConfig } from '@/hooks/useDashboardPreferences';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CustomizeDashboardDialogProps {
  metrics: MetricConfig[];
  onToggle: (id: string) => void;
  onReorder: (metrics: MetricConfig[]) => void;
  onReset: () => void;
}

interface SortableMetricItemProps {
  metric: MetricConfig;
  onToggle: (id: string) => void;
}

const SortableMetricItem = ({ metric, onToggle }: SortableMetricItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: metric.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="flex-1 text-sm font-medium">{metric.label}</span>
      <Switch
        checked={metric.visible}
        onCheckedChange={() => onToggle(metric.id)}
      />
    </div>
  );
};

export const CustomizeDashboardDialog = ({
  metrics,
  onToggle,
  onReorder,
  onReset,
}: CustomizeDashboardDialogProps) => {
  const [open, setOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = metrics.findIndex((m) => m.id === active.id);
      const newIndex = metrics.findIndex((m) => m.id === over.id);
      onReorder(arrayMove(metrics, oldIndex, newIndex));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="w-4 h-4" />
          <span className="hidden sm:inline">Personalizar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar Dashboard</DialogTitle>
          <DialogDescription>
            Escolha quais métricas exibir e arraste para reordenar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={metrics.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              {metrics.map((metric) => (
                <SortableMetricItem
                  key={metric.id}
                  metric={metric}
                  onToggle={onToggle}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Restaurar padrão
          </Button>
          <Button size="sm" onClick={() => setOpen(false)}>
            Concluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
