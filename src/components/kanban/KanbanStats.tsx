import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { KanbanTask, ENEM_AREAS } from "@/types/study";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, LineChart, Line, CartesianGrid, AreaChart, Area
} from "recharts";
import { TrendingUp, Flame, AlertTriangle, Clock, CheckCircle2, Target } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  alta: 'hsl(0, 84%, 60%)',
  media: 'hsl(25, 95%, 53%)',
  baixa: 'hsl(142, 71%, 45%)',
};

const AREA_COLORS: Record<string, string> = {
  linguagens: 'hsl(221, 83%, 53%)',
  humanas: 'hsl(25, 95%, 53%)',
  natureza: 'hsl(142, 71%, 45%)',
  matematica: 'hsl(262, 83%, 58%)',
  redacao: 'hsl(0, 84%, 60%)',
};

interface Props {
  tasks: KanbanTask[];
}

export default function KanbanStats({ tasks }: Props) {
  const stats = useMemo(() => {
    const total = tasks.filter(t => !t.archived).length;
    const done = tasks.filter(t => t.column === 'done' && !t.archived).length;
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date(new Date().toDateString()) && t.column !== 'done' && !t.archived).length;
    const subtasksTotal = tasks.reduce((a, t) => a + (t.subtasks?.length || 0), 0);
    const subtasksDone = tasks.reduce((a, t) => a + (t.subtasks?.filter(s => s.completed).length || 0), 0);
    const totalEstimated = tasks.reduce((a, t) => a + (t.estimatedMinutes || 0), 0);
    const totalTracked = tasks.reduce((a, t) => a + (t.trackedMinutes || 0), 0);

    const byArea = Object.entries(ENEM_AREAS).map(([k, v]) => ({
      name: v.label,
      total: tasks.filter(t => t.area === k && !t.archived).length,
      done: tasks.filter(t => t.area === k && t.column === 'done' && !t.archived).length,
      fill: AREA_COLORS[k] || '#888',
    })).filter(x => x.total > 0);

    const byPriority = [
      { name: 'Urgente', value: tasks.filter(t => t.priority === 'alta' && !t.archived).length, fill: PRIORITY_COLORS.alta },
      { name: 'Importante', value: tasks.filter(t => t.priority === 'media' && !t.archived).length, fill: PRIORITY_COLORS.media },
      { name: 'Normal', value: tasks.filter(t => t.priority === 'baixa' && !t.archived).length, fill: PRIORITY_COLORS.baixa },
    ].filter(x => x.value > 0);

    // Velocity: tasks completed per day (last 14 days)
    const last14 = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const ds = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const completedThat = tasks.filter(t => t.completedAt?.startsWith(ds)).length;
      return { date: label, tarefas: completedThat };
    });

    // Streak: consecutive days with at least 1 completed task
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      if (tasks.some(t => t.completedAt?.startsWith(ds))) streak++;
      else break;
    }

    // Burndown: remaining tasks over last 14 days
    const burndown = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const ds = d.toISOString().split('T')[0];
      const completedBefore = tasks.filter(t => t.completedAt && t.completedAt <= ds + 'T23:59:59').length;
      return { date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), restantes: total - completedBefore };
    });

    return { total, done, overdue, subtasksTotal, subtasksDone, totalEstimated, totalTracked, byArea, byPriority, last14, streak, burndown };
  }, [tasks]);

  if (tasks.length === 0) return null;

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-fade-in">
      {/* Summary cards */}
      {[
        { label: 'Total', value: stats.total, icon: Target, color: 'text-primary' },
        { label: 'Concluídas', value: `${stats.done} (${completionRate}%)`, icon: CheckCircle2, color: 'text-ms-green' },
        { label: 'Atrasadas', value: stats.overdue, icon: AlertTriangle, color: stats.overdue > 0 ? 'text-destructive' : 'text-muted-foreground' },
        { label: 'Subtarefas', value: `${stats.subtasksDone}/${stats.subtasksTotal}`, icon: CheckCircle2, color: 'text-ms-purple' },
        { label: 'Tempo', value: `${stats.totalTracked}/${stats.totalEstimated}m`, icon: Clock, color: 'text-ms-teal' },
        { label: 'Streak', value: `${stats.streak}d`, icon: Flame, color: stats.streak > 0 ? 'text-ms-orange' : 'text-muted-foreground' },
      ].map(item => (
        <Card key={item.label} className="border-0 shadow-sm glass-card">
          <CardContent className="p-3 text-center">
            <item.icon className={`h-4 w-4 mx-auto mb-1 ${item.color}`} />
            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase">{item.label}</p>
          </CardContent>
        </Card>
      ))}

      {/* Velocity chart */}
      <Card className="border-0 shadow-sm col-span-2 sm:col-span-3 lg:col-span-3 glass-card">
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold text-muted-foreground uppercase">Velocity (14 dias)</p>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={stats.last14} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={2} />
              <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Area type="monotone" dataKey="tarefas" stroke="hsl(221, 83%, 53%)" fill="url(#velGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Burndown */}
      <Card className="border-0 shadow-sm col-span-2 sm:col-span-3 lg:col-span-3 glass-card">
        <CardContent className="p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Burndown (14 dias)</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={stats.burndown} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={2} />
              <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Line type="monotone" dataKey="restantes" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* By area */}
      {stats.byArea.length > 0 && (
        <Card className="border-0 shadow-sm col-span-2 sm:col-span-3 lg:col-span-3 glass-card">
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Por matéria</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={stats.byArea} layout="vertical" margin={{ left: 0, right: 8 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="done" stackId="a" fill="hsl(142, 71%, 45%)" radius={[0, 0, 0, 0]} name="Feitas" />
                <Bar dataKey="total" stackId="a" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} name="Pendentes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* By priority */}
      {stats.byPriority.length > 0 && (
        <Card className="border-0 shadow-sm col-span-2 sm:col-span-3 lg:col-span-3 glass-card">
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Por prioridade</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={80} height={80}>
                <PieChart>
                  <Pie data={stats.byPriority} dataKey="value" cx="50%" cy="50%" innerRadius={20} outerRadius={35} paddingAngle={3}>
                    {stats.byPriority.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1">
                {stats.byPriority.map(p => (
                  <div key={p.name} className="flex items-center gap-1.5 text-[11px]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
                    <span>{p.name}: {p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
