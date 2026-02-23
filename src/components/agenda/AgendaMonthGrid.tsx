import { useMemo } from "react";
import { AgendaEvent } from "@/types/study";
import { EVENT_TYPES } from "./AgendaEventForm";
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  selectedDate: Date;
  events: AgendaEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (ev: AgendaEvent) => void;
}

export default function AgendaMonthGrid({ selectedDate, events, onDayClick, onEventClick }: Props) {
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(selectedDate), { weekStartsOn: 1 });
    const end = endOfMonth(selectedDate);
    const endWeek = startOfWeek(addDays(end, 7), { weekStartsOn: 1 });
    const days: Date[] = [];
    let d = start;
    while (d < endWeek) {
      days.push(d);
      d = addDays(d, 1);
    }
    return days;
  }, [selectedDate]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, AgendaEvent[]>();
    events.forEach(e => {
      const list = map.get(e.date) || [];
      list.push(e);
      map.set(e.date, list);
    });
    return map;
  }, [events]);

  const today = new Date();

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground uppercase py-1">{d}</div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px bg-border/50 rounded-lg overflow-hidden">
        {calendarDays.map(day => {
          const dStr = format(day, 'yyyy-MM-dd');
          const dayEvts = eventsByDate.get(dStr) || [];
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isToday = isSameDay(day, today);

          return (
            <div
              key={dStr}
              className={`min-h-[80px] sm:min-h-[100px] bg-card p-1 cursor-pointer hover:bg-accent/30 transition-colors ${!isCurrentMonth ? 'opacity-40' : ''}`}
              onClick={() => onDayClick(day)}
            >
              <p className={`text-xs font-medium mb-0.5 ${isToday ? 'text-primary-foreground bg-primary rounded-full w-5 h-5 flex items-center justify-center' : 'text-foreground'}`}>
                {format(day, 'd')}
              </p>
              <div className="space-y-0.5">
                {dayEvts.slice(0, 3).map(ev => (
                  <div
                    key={ev.id}
                    className={`text-[9px] sm:text-[10px] px-1 py-0.5 rounded truncate text-white cursor-pointer ${EVENT_TYPES[ev.type]?.color || 'bg-primary'} ${ev.completed ? 'opacity-40' : ''}`}
                    onClick={e => { e.stopPropagation(); onEventClick(ev); }}
                    title={`${ev.title} · ${ev.startTime}–${ev.endTime}`}
                  >
                    {ev.title}
                  </div>
                ))}
                {dayEvts.length > 3 && (
                  <p className="text-[9px] text-muted-foreground text-center">+{dayEvts.length - 3}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
