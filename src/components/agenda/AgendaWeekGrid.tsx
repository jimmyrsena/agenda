import { useMemo, useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AgendaEvent } from "@/types/study";
import { EVENT_TYPES } from "./AgendaEventForm";
import { ENEM_AREAS, EnemArea } from "@/types/study";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);

interface Props {
  weekDays: Date[];
  events: AgendaEvent[];
  onSlotClick: (date: string, time: string) => void;
  onEventClick: (ev: AgendaEvent) => void;
}

function getEventPosition(ev: AgendaEvent) {
  const [sH, sM] = ev.startTime.split(':').map(Number);
  const [eH, eM] = ev.endTime.split(':').map(Number);
  const top = ((sH - 6) * 60 + (sM || 0)) * (48 / 60);
  const height = Math.max(((eH - sH) * 60 + ((eM || 0) - (sM || 0))) * (48 / 60), 24);
  return { top, height };
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

export default function AgendaWeekGrid({ weekDays, events, onSlotClick, onEventClick }: Props) {
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

  const showNowLine = useMemo(() => weekDays.some(d => isSameDay(d, new Date())), [weekDays]);

  return (
    <TooltipProvider delayDuration={300}>
      <ScrollArea className="h-[600px]" ref={scrollRef}>
        <div className="min-w-[560px] sm:min-w-[700px]">
          {/* Header */}
          <div className="grid grid-cols-[50px_repeat(7,1fr)] border-b sticky top-0 bg-card z-10">
            <div />
            {weekDays.map(day => {
              const isToday = isSameDay(day, new Date());
              return (
                <div key={day.toISOString()} className={`text-center py-2 border-l ${isToday ? 'bg-primary/5' : ''}`}>
                  <p className="text-[10px] text-muted-foreground uppercase">{format(day, 'EEE', { locale: ptBR })}</p>
                  <p className={`text-sm font-bold ${isToday ? 'text-primary' : ''}`}>{format(day, 'dd')}</p>
                </div>
              );
            })}
          </div>
          {/* Grid */}
          <div className="relative">
            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-[50px_repeat(7,1fr)] h-12 border-b border-dashed border-border/50">
                <div className="text-[10px] text-muted-foreground text-right pr-2 pt-0.5">{String(hour).padStart(2, '0')}:00</div>
                {weekDays.map(day => {
                  const dStr = format(day, 'yyyy-MM-dd');
                  return (
                    <div
                      key={dStr + hour}
                      className="border-l hover:bg-accent/30 cursor-pointer transition-colors"
                      onClick={() => onSlotClick(dStr, `${String(hour).padStart(2, '0')}:00`)}
                    />
                  );
                })}
              </div>
            ))}
            {/* Current time indicator */}
            {showNowLine && nowPos !== null && (
              <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${nowPos}px` }}>
                <div className="flex items-center">
                  <div className="w-[50px] flex justify-end pr-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                  </div>
                  <div className="flex-1 h-[2px] bg-destructive/70" />
                </div>
              </div>
            )}
            {/* Events with tooltip */}
            {weekDays.map((day, dayIdx) => {
              const dStr = format(day, 'yyyy-MM-dd');
              const evts = events.filter(e => e.date === dStr);
              return evts.map(ev => {
                const { top, height } = getEventPosition(ev);
                return (
                  <Tooltip key={ev.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={`absolute rounded-md px-1.5 py-0.5 text-[10px] text-white cursor-pointer overflow-hidden ${EVENT_TYPES[ev.type]?.color || 'bg-primary'} ${ev.completed ? 'opacity-40 line-through' : ''} hover:ring-2 hover:ring-ring shadow-sm transition-shadow`}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          left: `calc(50px + ${dayIdx} * ((100% - 50px) / 7) + 2px)`,
                          width: `calc((100% - 50px) / 7 - 4px)`,
                        }}
                        onClick={e => { e.stopPropagation(); onEventClick(ev); }}
                      >
                        <p className="font-semibold truncate">{ev.title}</p>
                        <p className="truncate opacity-80">{ev.startTime}–{ev.endTime}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="z-50">
                      <EventTooltipContent ev={ev} />
                    </TooltipContent>
                  </Tooltip>
                );
              });
            })}
          </div>
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}
