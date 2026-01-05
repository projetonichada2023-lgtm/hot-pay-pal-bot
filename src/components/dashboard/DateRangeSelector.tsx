import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeSelectorProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const presetRanges = [
  { label: 'Hoje', days: 1 },
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
];

export const DateRangeSelector = ({ dateRange, onDateRangeChange }: DateRangeSelectorProps) => {
  const [activePreset, setActivePreset] = useState<number | null>(1);

  const handlePresetClick = (days: number) => {
    const to = new Date();
    const from = days === 1 ? to : subDays(to, days - 1);
    onDateRangeChange({ from, to });
    setActivePreset(days);
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    if (range.from) {
      onDateRangeChange({
        from: range.from,
        to: range.to || range.from,
      });
      setActivePreset(null);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex gap-1.5 p-1 rounded-xl bg-muted/50 border border-border/50">
        {presetRanges.map((preset, index) => (
          <motion.div
            key={preset.days}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.05 }}
          >
            <Button
              variant={activePreset === preset.days ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'text-xs sm:text-sm h-8 px-3 rounded-lg transition-all',
                activePreset === preset.days ? 'shadow-sm' : 'hover:bg-background/50'
              )}
              onClick={() => handlePresetClick(preset.days)}
            >
              {preset.label}
            </Button>
          </motion.div>
        ))}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs sm:text-sm h-8 px-3 rounded-lg border-border/50 hover:border-border hover:bg-muted/50"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden xs:inline font-medium">
              {format(dateRange.from, 'dd/MM')} - {format(dateRange.to, 'dd/MM/yy')}
            </span>
            <span className="xs:hidden">Período</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range) => handleDateRangeChange(range || {})}
            disabled={(date) => date > new Date()}
            numberOfMonths={1}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
