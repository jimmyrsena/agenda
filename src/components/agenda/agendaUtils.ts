import { AgendaEvent } from "@/types/study";

/** Check if two time ranges overlap */
function timesOverlap(s1: string, e1: string, s2: string, e2: string) {
  return s1 < e2 && s2 < e1;
}

/** Find events that conflict with a given event on the same date */
export function findConflicts(
  event: Partial<AgendaEvent>,
  allEvents: AgendaEvent[],
  date: string,
  excludeId?: string
): AgendaEvent[] {
  if (!event.startTime || !event.endTime) return [];
  return allEvents.filter(e =>
    e.date === date &&
    e.id !== excludeId &&
    timesOverlap(event.startTime!, event.endTime!, e.startTime, e.endTime)
  );
}

/** Request browser notification permission */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

/** Schedule a notification for an event */
export function scheduleEventNotification(event: AgendaEvent, minutesBefore = 15) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return null;
  
  const [h, m] = event.startTime.split(':').map(Number);
  const eventDate = new Date(event.date + 'T00:00:00');
  eventDate.setHours(h, m, 0, 0);
  
  const notifyAt = new Date(eventDate.getTime() - minutesBefore * 60 * 1000);
  const now = new Date();
  const delay = notifyAt.getTime() - now.getTime();
  
  if (delay <= 0) return null;
  
  return setTimeout(() => {
    new Notification(`📚 ${event.title} em ${minutesBefore}min`, {
      body: `${event.startTime}–${event.endTime}`,
      icon: '/favicon.png',
    });
  }, delay);
}

/** Build routine templates */
export interface RoutineTemplate {
  id: string;
  name: string;
  events: Array<{
    title: string;
    type: AgendaEvent['type'];
    startTime: string;
    endTime: string;
    dayOffset: number; // 0=Mon, 1=Tue, etc.
  }>;
}

export const DEFAULT_TEMPLATES: RoutineTemplate[] = [
  {
    id: 'enem-intensivo',
    name: '🎯 ENEM Intensivo',
    events: [
      { title: 'Linguagens', type: 'aula', startTime: '08:00', endTime: '10:00', dayOffset: 0 },
      { title: 'Matemática', type: 'aula', startTime: '10:30', endTime: '12:30', dayOffset: 0 },
      { title: 'Humanas', type: 'aula', startTime: '08:00', endTime: '10:00', dayOffset: 1 },
      { title: 'Natureza', type: 'aula', startTime: '10:30', endTime: '12:30', dayOffset: 1 },
      { title: 'Redação', type: 'aula', startTime: '08:00', endTime: '10:00', dayOffset: 2 },
      { title: 'Revisão Geral', type: 'revisao', startTime: '10:30', endTime: '12:00', dayOffset: 2 },
      { title: 'Linguagens', type: 'aula', startTime: '08:00', endTime: '10:00', dayOffset: 3 },
      { title: 'Matemática', type: 'aula', startTime: '10:30', endTime: '12:30', dayOffset: 3 },
      { title: 'Simulado', type: 'simulado', startTime: '08:00', endTime: '12:00', dayOffset: 4 },
      { title: 'Descanso', type: 'descanso', startTime: '08:00', endTime: '12:00', dayOffset: 5 },
    ],
  },
  {
    id: 'equilibrado',
    name: '⚖️ Equilibrado',
    events: [
      { title: 'Estudo manhã', type: 'aula', startTime: '09:00', endTime: '11:00', dayOffset: 0 },
      { title: 'Estudo manhã', type: 'aula', startTime: '09:00', endTime: '11:00', dayOffset: 1 },
      { title: 'Estudo manhã', type: 'aula', startTime: '09:00', endTime: '11:00', dayOffset: 2 },
      { title: 'Estudo manhã', type: 'aula', startTime: '09:00', endTime: '11:00', dayOffset: 3 },
      { title: 'Revisão', type: 'revisao', startTime: '09:00', endTime: '11:00', dayOffset: 4 },
      { title: 'Descanso', type: 'descanso', startTime: '09:00', endTime: '12:00', dayOffset: 5 },
      { title: 'Descanso', type: 'descanso', startTime: '09:00', endTime: '12:00', dayOffset: 6 },
    ],
  },
  {
    id: 'noturno',
    name: '🌙 Noturno',
    events: [
      { title: 'Estudo noite', type: 'aula', startTime: '19:00', endTime: '21:00', dayOffset: 0 },
      { title: 'Estudo noite', type: 'aula', startTime: '19:00', endTime: '21:00', dayOffset: 1 },
      { title: 'Estudo noite', type: 'aula', startTime: '19:00', endTime: '21:00', dayOffset: 2 },
      { title: 'Estudo noite', type: 'aula', startTime: '19:00', endTime: '21:00', dayOffset: 3 },
      { title: 'Revisão', type: 'revisao', startTime: '19:00', endTime: '21:00', dayOffset: 4 },
    ],
  },
];
