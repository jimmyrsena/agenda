import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus, Trash2, Copy, CalendarDays, Clock, CheckCircle2, ChevronLeft, ChevronRight,
  Search, Download, Filter, LayoutTemplate, Bell, BellOff, Timer, BarChart3, List
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AgendaEvent, EnemArea, ENEM_AREAS } from "@/types/study";
import { format, addDays, startOfWeek, endOfWeek, isWithinInterval, isSameDay, parseISO, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import AgendaEventForm, { EVENT_TYPES } from "@/components/agenda/AgendaEventForm";
import AgendaWeekGrid from "@/components/agenda/AgendaWeekGrid";
import AgendaDayGrid from "@/components/agenda/AgendaDayGrid";
import AgendaMonthGrid from "@/components/agenda/AgendaMonthGrid";
import AgendaMobileList from "@/components/agenda/AgendaMobileList";
import AgendaWeekStats from "@/components/agenda/AgendaWeekStats";
import { findConflicts, requestNotificationPermission, scheduleEventNotification, DEFAULT_TEMPLATES, RoutineTemplate } from "@/components/agenda/agendaUtils";

type ViewMode = 'day' | 'week' | 'month' | 'list';

export default function AgendaPage() {
  const [events, setEvents] = useLocalStorage<AgendaEvent[]>('agenda-events', []);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? 'list' : 'week');
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set(Object.keys(EVENT_TYPES)));
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('agenda-notifications', false);
  const [newEvent, setNewEvent] = useState<Partial<AgendaEvent & { repeat?: string }>>({
    title: '', type: 'aula', startTime: '08:00', endTime: '09:00', description: '', repeat: 'none',
  });
  const notifTimeouts = useRef<number[]>([]);
  const navigate = useNavigate();

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const applyFilters = useCallback((list: AgendaEvent[]) => {
    let filtered = list.filter(e => typeFilters.has(e.type));
    if (searchQuery) filtered = filtered.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return filtered;
  }, [typeFilters, searchQuery]);

  const weekEvents = useMemo(() => {
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return applyFilters(events.filter(e => isWithinInterval(parseISO(e.date), { start: weekStart, end })));
  }, [events, weekStart, selectedDate, applyFilters]);

  const dayEvents = useMemo(() => {
    return applyFilters(events.filter(e => e.date === dateStr)).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events, dateStr, applyFilters]);

  const datesWithEvents = useMemo(() => events.map(e => new Date(e.date + 'T12:00:00')), [events]);
  const completedCount = useMemo(() => events.filter(e => e.completed).length, [events]);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayCount = useMemo(() => events.filter(e => e.date === todayStr).length, [events, todayStr]);

  // Conflict detection for forms
  const newEventConflicts = useMemo(() => findConflicts(newEvent, events, dateStr), [newEvent, events, dateStr]);
  const editEventConflicts = useMemo(() =>
    editingEvent ? findConflicts(editingEvent, events, editingEvent.date, editingEvent.id) : [],
    [editingEvent, events]
  );

  // Browser notifications
  useEffect(() => {
    notifTimeouts.current.forEach(clearTimeout);
    notifTimeouts.current = [];
    if (!notificationsEnabled) return;

    const todayEvents = events.filter(e => e.date === todayStr && !e.completed);
    todayEvents.forEach(ev => {
      const id = scheduleEventNotification(ev, 15);
      if (id) notifTimeouts.current.push(id as unknown as number);
    });
    return () => notifTimeouts.current.forEach(clearTimeout);
  }, [events, notificationsEnabled, todayStr]);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        toast.success("Notificações ativadas! Você será lembrado 15min antes.");
      } else {
        toast.error("Permissão de notificação negada pelo navegador.");
      }
    } else {
      setNotificationsEnabled(false);
      toast.info("Notificações desativadas.");
    }
  };

  const openNewEvent = useCallback((date: string, time: string) => {
    const endHour = Math.min(parseInt(time.split(':')[0]) + 1, 22);
    setNewEvent({ title: '', type: 'aula', startTime: time, endTime: `${String(endHour).padStart(2, '0')}:00`, description: '', repeat: 'none' });
    setSelectedDate(parseISO(date));
    setDialogOpen(true);
  }, []);

  const addEvent = () => {
    if (!newEvent.title?.trim()) { toast.error("Título é obrigatório"); return; }
    const d = format(selectedDate, 'yyyy-MM-dd');
    const dates: string[] = [d];
    if (newEvent.repeat === 'daily') for (let i = 1; i <= 6; i++) dates.push(format(addDays(selectedDate, i), 'yyyy-MM-dd'));
    if (newEvent.repeat === 'weekly') for (let i = 1; i <= 3; i++) dates.push(format(addDays(selectedDate, i * 7), 'yyyy-MM-dd'));
    const newEvents = dates.map(dd => ({
      id: crypto.randomUUID(), title: newEvent.title!, date: dd,
      startTime: newEvent.startTime || '08:00', endTime: newEvent.endTime || '09:00',
      type: (newEvent.type as AgendaEvent['type']) || 'aula',
      area: newEvent.area as EnemArea | undefined, description: newEvent.description, completed: false,
    }));
    setEvents(prev => [...prev, ...newEvents]);
    setNewEvent({ title: '', type: 'aula', startTime: '08:00', endTime: '09:00', description: '', repeat: 'none' });
    setDialogOpen(false);
    toast.success(dates.length > 1 ? `${dates.length} eventos criados!` : 'Evento criado!');
  };

  const updateEvent = () => {
    if (!editingEvent) return;
    setEvents(prev => prev.map(e => e.id === editingEvent.id ? editingEvent : e));
    setEditingEvent(null);
    toast.success("Evento atualizado!");
  };

  const duplicateEvent = (ev: AgendaEvent) => {
    const nextDay = format(addDays(parseISO(ev.date), 1), 'yyyy-MM-dd');
    setEvents(prev => [...prev, { ...ev, id: crypto.randomUUID(), date: nextDay, completed: false }]);
    toast.success('Evento duplicado para o dia seguinte');
  };

  const toggleCompleted = (id: string) => setEvents(prev => prev.map(e => e.id === id ? { ...e, completed: !e.completed } : e));

  const deleteEvent = (id: string) => {
    const deleted = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    setEditingEvent(null);
    if (deleted) {
      toast.success("Evento excluído", {
        action: {
          label: "Desfazer",
          onClick: () => {
            setEvents(prev => [...prev, deleted]);
            toast.info("Evento restaurado!");
          },
        },
      });
    }
  };

  const navigateDate = (dir: number) => {
    setSelectedDate(prev => {
      if (viewMode === 'month') return addMonths(prev, dir);
      if (viewMode === 'week') return addDays(prev, dir * 7);
      return addDays(prev, dir);
    });
  };

  const toggleTypeFilter = (type: string) => {
    setTypeFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  };

  const exportAgenda = () => {
    const rows = events.map(e => `${e.date},${e.startTime},${e.endTime},"${e.title}",${EVENT_TYPES[e.type]?.label || e.type},${e.completed ? 'Sim' : 'Não'}`);
    const csv = `Data,Início,Fim,Título,Tipo,Concluído\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `agenda-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Agenda exportada!");
  };

  const applyTemplate = (tpl: RoutineTemplate) => {
    const newEvents = tpl.events.map(te => ({
      id: crypto.randomUUID(),
      title: te.title,
      date: format(addDays(weekStart, te.dayOffset), 'yyyy-MM-dd'),
      startTime: te.startTime,
      endTime: te.endTime,
      type: te.type,
      completed: false,
    }));
    setEvents(prev => [...prev, ...newEvents]);
    setTemplateDialogOpen(false);
    toast.success(`Template "${tpl.name}" aplicado com ${newEvents.length} eventos!`);
  };

  const startPomodoro = (ev: AgendaEvent) => {
    setEditingEvent(null);
    navigate('/pomodoro');
    toast.info(`Iniciando Pomodoro para "${ev.title}"`);
  };

  const headerLabel = useMemo(() => {
    if (viewMode === 'month') return format(selectedDate, "MMMM yyyy", { locale: ptBR });
    if (viewMode === 'day' || viewMode === 'list') return format(selectedDate, "EEE, dd MMM", { locale: ptBR });
    return `${format(weekStart, "dd/MM")} — ${format(addDays(weekStart, 6), "dd/MM")}`;
  }, [viewMode, selectedDate, weekStart]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Agenda de Estudos
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button size="sm" variant="outline" onClick={toggleNotifications} className="gap-1.5" title={notificationsEnabled ? "Desativar lembretes" : "Ativar lembretes"}>
            {notificationsEnabled ? <Bell className="h-3.5 w-3.5 text-ms-green" /> : <BellOff className="h-3.5 w-3.5" />}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setTemplateDialogOpen(true)} className="gap-1.5">
            <LayoutTemplate className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Templates</span>
          </Button>
          <Button size="sm" variant="outline" onClick={exportAgenda} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button size="sm" onClick={() => { setNewEvent({ title: '', type: 'aula', startTime: '08:00', endTime: '09:00', description: '', repeat: 'none' }); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" />Novo
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">{todayCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Hoje</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-ms-purple">{weekEvents.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Semana</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-ms-green">{completedCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Concluídos</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* Sidebar */}
        <div className="space-y-3 hidden lg:block">
          <Card><CardContent className="p-3">
            <Calendar
              mode="single" selected={selectedDate} onSelect={d => d && setSelectedDate(d)} locale={ptBR}
              modifiers={{ hasEvent: datesWithEvents }} modifiersClassNames={{ hasEvent: 'bg-primary/20 font-bold' }}
              className="pointer-events-auto"
            />
          </CardContent></Card>

          {/* Upcoming */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Próximos hoje
              </p>
              {dayEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">Sem eventos</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
                  {dayEvents.slice(0, 5).map(ev => (
                    <div key={ev.id} className={`flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer hover:bg-accent/50 transition-colors text-xs ${ev.completed ? 'opacity-50' : ''}`} onClick={() => setEditingEvent({ ...ev })}>
                      <div className={`w-1.5 h-6 rounded-full shrink-0 ${EVENT_TYPES[ev.type]?.dot || 'bg-primary'}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium truncate ${ev.completed ? 'line-through' : ''}`}>{ev.title}</p>
                        <p className="text-muted-foreground">{ev.startTime}–{ev.endTime}</p>
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 5 && <p className="text-[10px] text-muted-foreground text-center">+{dayEvents.length - 5} mais</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly stats */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                <BarChart3 className="h-3 w-3" /> Estatísticas da semana
              </p>
              <AgendaWeekStats events={weekEvents} />
            </CardContent>
          </Card>
        </div>

        {/* Main grid */}
        <Card><CardContent className="p-3 sm:p-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-semibold text-sm whitespace-nowrap capitalize">{headerLabel}</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setSelectedDate(new Date())}>Hoje</Button>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="relative hidden sm:block">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Buscar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-8 pl-7 w-32 sm:w-40 text-xs" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Filter className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.entries(EVENT_TYPES).map(([k, v]) => (
                    <DropdownMenuCheckboxItem key={k} checked={typeFilters.has(k)} onCheckedChange={() => toggleTypeFilter(k)}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${v.dot}`} />
                        {v.label}
                      </span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex bg-secondary rounded-lg">
                {([
                  { key: 'day' as ViewMode, label: 'Dia' },
                  { key: 'week' as ViewMode, label: 'Sem' },
                  { key: 'month' as ViewMode, label: 'Mês' },
                  { key: 'list' as ViewMode, label: 'Lista' },
                ]).map(v => (
                  <button
                    key={v.key}
                    onClick={() => setViewMode(v.key)}
                    className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs rounded-lg transition-colors ${viewMode === v.key ? 'bg-primary text-primary-foreground' : ''}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile search */}
          <div className="sm:hidden mb-3">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Buscar eventos..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-8 pl-7 text-xs" />
            </div>
          </div>

          {viewMode === 'week' && (
            <AgendaWeekGrid weekDays={weekDays} events={weekEvents} onSlotClick={openNewEvent} onEventClick={ev => setEditingEvent({ ...ev })} />
          )}
          {viewMode === 'day' && (
            <AgendaDayGrid events={dayEvents} dateStr={dateStr} onSlotClick={openNewEvent} onEventClick={ev => setEditingEvent({ ...ev })} />
          )}
          {viewMode === 'month' && (
            <AgendaMonthGrid
              selectedDate={selectedDate}
              events={applyFilters(events)}
              onDayClick={d => { setSelectedDate(d); setViewMode('day'); }}
              onEventClick={ev => setEditingEvent({ ...ev })}
            />
          )}
          {viewMode === 'list' && (
            <AgendaMobileList events={dayEvents} onEventClick={ev => setEditingEvent({ ...ev })} onToggleComplete={toggleCompleted} />
          )}
        </CardContent></Card>
      </div>

      {/* New event dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Evento — {format(selectedDate, "dd/MM/yyyy")}</DialogTitle></DialogHeader>
          <AgendaEventForm event={newEvent} setEvent={setNewEvent} onSubmit={addEvent} label="Criar Evento" showRepeat conflicts={newEventConflicts} />
        </DialogContent>
      </Dialog>

      {/* Edit event dialog */}
      <Dialog open={!!editingEvent} onOpenChange={open => !open && setEditingEvent(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Evento</DialogTitle></DialogHeader>
          {editingEvent && (
            <div className="space-y-3">
              <AgendaEventForm event={editingEvent} setEvent={setEditingEvent} onSubmit={updateEvent} label="Salvar Alterações" conflicts={editEventConflicts} />
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => startPomodoro(editingEvent)}>
                  <Timer className="h-4 w-4 mr-1" />Pomodoro
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { toggleCompleted(editingEvent.id); setEditingEvent(prev => prev ? { ...prev, completed: !prev.completed } : prev); }}>
                  <CheckCircle2 className="h-4 w-4 mr-1" />{editingEvent.completed ? 'Desmarcar' : 'Concluir'}
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { duplicateEvent(editingEvent); setEditingEvent(null); }}>
                  <Copy className="h-4 w-4 mr-1" />Duplicar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteEvent(editingEvent.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Templates dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>📋 Templates de Rotina</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">Aplique um template para preencher a semana atual com eventos pré-definidos.</p>
          <div className="space-y-3 mt-2">
            {DEFAULT_TEMPLATES.map(tpl => (
              <Card key={tpl.id} className="cursor-pointer hover:shadow-md transition-shadow border-border/50" onClick={() => applyTemplate(tpl)}>
                <CardContent className="p-4">
                  <p className="font-semibold text-sm">{tpl.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tpl.events.length} eventos · {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].filter((_, i) => tpl.events.some(e => e.dayOffset === i)).join(', ')}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {tpl.events.slice(0, 5).map((e, i) => (
                      <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded text-white ${EVENT_TYPES[e.type]?.color || 'bg-primary'}`}>{e.title}</span>
                    ))}
                    {tpl.events.length > 5 && <span className="text-[9px] text-muted-foreground">+{tpl.events.length - 5}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
