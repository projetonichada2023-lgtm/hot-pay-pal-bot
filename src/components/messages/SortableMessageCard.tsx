import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BotMessage, MessageButton } from '@/hooks/useBotMessages';
import { MessageCard } from './MessageCard';
import { GripVertical } from 'lucide-react';

interface SortableMessageCardProps {
  message: BotMessage;
  index: number;
  totalCount: number;
  onUpdate: (id: string, updates: Partial<BotMessage>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMediaUpload: (file: File) => Promise<string | null>;
  isPending: boolean;
  allowDelete: boolean;
}

export const SortableMessageCard = ({
  message,
  index,
  totalCount,
  onUpdate,
  onDelete,
  onMediaUpload,
  isPending,
  allowDelete,
}: SortableMessageCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: message.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      {/* Drag handle - positioned absolutely to left */}
      {totalCount > 1 && (
        <div 
          {...attributes} 
          {...listeners}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 cursor-grab active:cursor-grabbing opacity-0 group-hover/sortable:opacity-100 transition-opacity hidden sm:flex"
        >
          <div className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}

      <MessageCard
        message={message}
        index={index}
        totalCount={totalCount}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onMoveUp={() => {}} // Will be handled by drag-and-drop
        onMoveDown={() => {}} // Will be handled by drag-and-drop
        onMediaUpload={onMediaUpload}
        isPending={isPending}
        allowDelete={allowDelete}
        showOrder={totalCount > 1}
      />
    </div>
  );
};
