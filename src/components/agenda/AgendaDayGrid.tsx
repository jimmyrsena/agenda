import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AgendaEvent, EnemArea, ENEM_AREAS } from "@/types/study";
import { EVENT_TYPES } from "./AgendaEventForm";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);

interface Props {
  events: AgendaEvent[];
  dateStr: string;
  onSlotClick: (date: string, time: string) => void;
  onEventClick: (ev: AgendaEvent) => void;
}

function EventTooltipContent({ ev }: { ev: AgendaEvent }) {
  const typeInfo = EVENT_TYPES[ev.type];
  return (
    <div className="space-y-1 max-w-[200px]">
      <p className="font-semibold text-xs">{ev.title}</p>
      <p className="text-[10px] text-muted-foreground">{ev.startTime}–{ev.endTime} · {typeInfo?.label}</p>
      {ev.area && <p className="text-[10px]">{ENEM_AREAS[ev.area as EnemArea]?.label}</p>}
      {ev.description && <p className="text-[10px] text-muted-foreground italic">{ev.description}</p>}
      {ev.completed && <p className="text-[10px] text-ms-green font-medium">✓ Concluído</p>}
    </div>
  );
}

export default function AgendaDayGrid({ events, dateStr, onSlotClick, onEventClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nowPos, setNowPos] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      if (h >= 6 && h <= 22) setNowPos(((h - 6) * 60 + m) * (48 / 60));
      else setNowPos(null);
    };
    update();
    const iv = setInterval(update, 60000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (nowPos !== null && scrollRef.current) {
      const el = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (el) el.scrollTop = Math.max(0, nowPos - 100);
    }
  }, []);

  const isToday = dateStr === new Date().toISOString().slice(0, 10);

  return (
    <TooltipProvider delayDuration={300}>
      <ScrollArea className="h-[600px]" ref={scrollRef}>
        <div className="relative">
          {HOURS.map(hour => {
            const timeStr = `${String(hour).padStart(2, '0')}:00`;
            const hourEvents = events.filter(e => parseInt(e.startTime.split(':')[0]) === hour);
            return (
              <div key={hour} className="grid grid-cols-[50px_1fr] min-h-[48px] border-b border-dashed border-border/50">
                <div className="text-[10px] text-muted-foreground text-right pr-2 pt-1">{timeStr}</div>
                <div className="relative hover:bg-accent/30 cursor-pointer transition-colors p-0.5" onClick={() => onSlotClick(dateStr, timeStr)}>
                  {hourEvents.map(ev => (
                    <Tooltip key={ev.id}>
                      <TooltipTrigger asChild>
                        <div
                          className={`rounded-md px-2.5 py-1.5 text-xs text-white mb-0.5 cursor-pointer ${EVENT_TYPES[ev.type]?.color || 'bg-primary'} ${ev.completed ? 'opacity-40 line-through' : ''} hover:ring-2 hover:ring-ring shadow-sm transition-shadow`}
                          onClick={e => { e.stopPropagation(); onEventClick(ev); }}
                        >
                          <p className="font-semibold truncate">{ev.title} · {ev.startTime}–{ev.endTime}</p>
                          {ev.area && <p className="text-[10px] opacity-80 truncate">{ENEM_AREAS[ev.area as EnemArea]?.label}</p>}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="z-50">
                        <EventTooltipContent ev={ev} />
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            );
          })}
          {isToday && nowPos !== null && (
            <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${nowPos}px` }}>
              <div className="flex items-center">
                <div className="w-[50px] flex justify-end pr-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                </div>
                <div className="flex-1 h-[2px] bg-destructive/70" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}
