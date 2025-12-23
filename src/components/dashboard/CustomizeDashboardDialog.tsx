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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings2, GripVertical, RotateCcw, BarChart3, LayoutGrid } from 'lucide-react';
import { MetricConfig, WidgetConfig } from '@/hooks/useDashboardPreferences';
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
  widgets: WidgetConfig[];
  onToggleMetric: (id: string) => void;
  onReorderMetrics: (metrics: MetricConfig[]) => void;
  onToggleWidget: (id: string) => void;
  onReorderWidgets: (widgets: WidgetConfig[]) => void;
  onReset: () => void;
}

interface SortableItemProps {
  item: { id: string; label: string; visible: boolean };
  onToggle: (id: string) => void;
}

const SortableItem = ({ item, onToggle }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

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
      <span className="flex-1 text-sm font-medium">{item.label}</span>
      <Switch
        checked={item.visible}
        onCheckedChange={() => onToggle(item.id)}
      />
    </div>
  );
};

export const CustomizeDashboardDialog = ({
  metrics,
  widgets,
  onToggleMetric,
  onReorderMetrics,
  onToggleWidget,
  onReorderWidgets,
  onReset,
}: CustomizeDashboardDialogProps) => {
  const [open, setOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleMetricsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = metrics.findIndex((m) => m.id === active.id);
      const newIndex = metrics.findIndex((m) => m.id === over.id);
      onReorderMetrics(arrayMove(metrics, oldIndex, newIndex));
    }
  };

  const handleWidgetsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      onReorderWidgets(arrayMove(widgets, oldIndex, newIndex));
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
            Escolha quais elementos exibir e arraste para reordenar.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="metrics" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="widgets" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Widgets
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="metrics" className="mt-4">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleMetricsDragEnd}
              >
                <SortableContext
                  items={metrics.map((m) => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {metrics.map((metric) => (
                    <SortableItem
                      key={metric.id}
                      item={metric}
                      onToggle={onToggleMetric}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </TabsContent>
          
          <TabsContent value="widgets" className="mt-4">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleWidgetsDragEnd}
              >
                <SortableContext
                  items={widgets.map((w) => w.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {widgets.map((widget) => (
                    <SortableItem
                      key={widget.id}
                      item={widget}
                      onToggle={onToggleWidget}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </TabsContent>
        </Tabs>

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
