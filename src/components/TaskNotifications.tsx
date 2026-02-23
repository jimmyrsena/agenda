import { useEffect, useCallback, useRef } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { KanbanTask } from "@/types/study";
import { toast } from "sonner";
import { AlertTriangle, Clock } from "lucide-react";

function getLocalDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function TaskNotifications() {
  const [tasks] = useLocalStorage<KanbanTask[]>('kanban-tasks', []);
  const notifiedRef = useRef(false);

  const playAlert = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 440;
      gain.gain.value = 0.15;
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 520;
        gain2.gain.value = 0.15;
        osc2.start();
        osc2.stop(ctx.currentTime + 0.2);
        setTimeout(() => ctx.close(), 300);
      }, 250);
    } catch {}
  }, []);

  useEffect(() => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;

    const todayStr = getLocalDateStr(new Date());

    const overdue = tasks.filter(t => t.dueDate && t.dueDate < todayStr && t.column !== 'done');
    const dueToday = tasks.filter(t => t.dueDate === todayStr && t.column !== 'done');

    // Tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalDateStr(tomorrow);
    const dueTomorrow = tasks.filter(t => t.dueDate === tomorrowStr && t.column !== 'done');

    const delay = 1500; // slight delay so page loads first

    if (overdue.length > 0) {
      setTimeout(() => {
        playAlert();
        toast.error(`${overdue.length} tarefa(s) atrasada(s)!`, {
          description: overdue.slice(0, 2).map(t => t.title).join(', '),
          icon: <AlertTriangle className="h-4 w-4" />,
          duration: 8000,
        });
      }, delay);
    }

    if (dueToday.length > 0) {
      setTimeout(() => {
        toast.warning(`${dueToday.length} tarefa(s) para hoje`, {
          description: dueToday.slice(0, 2).map(t => t.title).join(', '),
          icon: <Clock className="h-4 w-4" />,
          duration: 6000,
        });
      }, delay + 500);
    }

    if (dueTomorrow.length > 0) {
      setTimeout(() => {
        toast.info(`${dueTomorrow.length} tarefa(s) para amanhã`, {
          description: dueTomorrow.slice(0, 2).map(t => t.title).join(', '),
          duration: 5000,
        });
      }, delay + 1000);
    }
  }, [tasks, playAlert]);

  return null;
}
