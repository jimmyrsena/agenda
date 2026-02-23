import { useMemo } from "react";
import { AgendaEvent } from "@/types/study";
import { EVENT_TYPES } from "./AgendaEventForm";
import { ENEM_AREAS, EnemArea } from "@/types/study";

interface Props {
  events: AgendaEvent[];
}

export default function AgendaWeekStats({ events }: Props) {
  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    const byArea: Record<string, number> = {};
    let totalMinutes = 0;

    events.forEach(ev => {
      const [sH, sM] = ev.startTime.split(':').map(Number);
      const [eH, eM] = ev.endTime.split(':').map(Number);
      const dur = (eH - sH) * 60 + ((eM || 0) - (sM || 0));
      totalMinutes += dur;

      byType[ev.type] = (byType[ev.type] || 0) + dur;
      if (ev.area) byArea[ev.area] = (byArea[ev.area] || 0) + dur;
    });

    return { byType, byArea, totalMinutes, totalEvents: events.length, completed: events.filter(e => e.completed).length };
  }, [events]);

  const hours = Math.round(stats.totalMinutes / 60 * 10) / 10;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Total planejado</span>
        <span className="font-bold">{hours}h</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Eventos</span>
        <span className="font-bold">{stats.totalEvents}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Concluídos</span>
        <span className="font-bold text-ms-green">{stats.completed}/{stats.totalEvents}</span>
      </div>

      {/* Progress bar */}
      {stats.totalEvents > 0 && (
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-ms-green rounded-full transition-all"
            style={{ width: `${(stats.completed / stats.totalEvents) * 100}%` }}
          />
        </div>
      )}

      {/* By type */}
      {Object.keys(stats.byType).length > 0 && (
        <div className="space-y-1 pt-1">
          <p className="text-[10px] text-muted-foreground uppercase font-medium">Por tipo</p>
          {Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).map(([type, mins]) => (
            <div key={type} className="flex items-center gap-1.5 text-[11px]">
              <div className={`w-2 h-2 rounded-full ${EVENT_TYPES[type as keyof typeof EVENT_TYPES]?.dot || 'bg-primary'}`} />
              <span className="flex-1">{EVENT_TYPES[type as keyof typeof EVENT_TYPES]?.label || type}</span>
              <span className="text-muted-foreground">{Math.round(mins / 60 * 10) / 10}h</span>
            </div>
          ))}
        </div>
      )}

      {/* By area */}
      {Object.keys(stats.byArea).length > 0 && (
        <div className="space-y-1 pt-1">
          <p className="text-[10px] text-muted-foreground uppercase font-medium">Por matéria</p>
          {Object.entries(stats.byArea).sort((a, b) => b[1] - a[1]).map(([area, mins]) => (
            <div key={area} className="flex items-center justify-between text-[11px]">
              <span>{ENEM_AREAS[area as EnemArea]?.label || area}</span>
              <span className="text-muted-foreground">{Math.round(mins / 60 * 10) / 10}h</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
