import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FileText, Printer, KanbanSquare, Target, BookOpen, CreditCard,
  CalendarDays, Clock, BarChart3, PieChart as PieChartIcon,
  Brain, CheckCircle2, AlertTriangle, Flame, Award, ArrowRight,
  GraduationCap, Timer, TrendingUp, Users, Zap
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line } from "recharts";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { StudySession, KanbanTask, AgendaEvent, Flashcard, ENEM_AREAS, EnemArea } from "@/types/study";
import { subDays, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useGamification } from "@/hooks/useGamification";

// ---------- helpers ----------
function getLocalData(key: string) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function getLocalDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const AREA_COLORS: Record<EnemArea, string> = {
  linguagens: "#3b82f6", humanas: "#f97316", natureza: "#22c55e", matematica: "#a855f7", redacao: "#ef4444",
};

// ---------- print ----------
function printReport(title: string, content: string) {
  const win = window.open("", "_blank");
  if (!win) { toast.error("Permita pop-ups para imprimir"); return; }
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:'Segoe UI',system-ui,sans-serif;max-width:900px;margin:0 auto;padding:40px 20px;color:#1a1a2e;line-height:1.6}
  h1{color:#3b82f6;border-bottom:3px solid #3b82f6;padding-bottom:10px;font-size:24px;display:flex;align-items:center;gap:10px}
  h2{color:#6366f1;margin-top:24px;font-size:17px;border-left:4px solid #6366f1;padding-left:10px}
  h3{color:#333;font-size:14px;margin-top:16px}
  table{border-collapse:collapse;width:100%;margin:12px 0;font-size:13px}
  th,td{border:1px solid #e2e8f0;padding:10px 14px;text-align:left}
  th{background:#f1f5f9;font-weight:600;color:#334155}
  tr:nth-child(even){background:#fafbfc}
  tr:hover{background:#f0f4ff}
  .empty{color:#94a3b8;font-style:italic;padding:20px;text-align:center}
  .badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;background:#e2e8f0;margin-right:4px}
  .badge.alta{background:#fee2e2;color:#dc2626}
  .badge.media{background:#fef3c7;color:#d97706}
  .badge.baixa{background:#d1fae5;color:#059669}
  .badge.done{background:#d1fae5;color:#059669}
  .badge.doing{background:#dbeafe;color:#2563eb}
  .badge.todo{background:#f1f5f9;color:#64748b}
  .stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin:20px 0}
  .stat-box{border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center;background:#fafbfc}
  .stat-box .val{font-size:28px;font-weight:700;color:#3b82f6}
  .stat-box .lbl{font-size:11px;color:#64748b;margin-top:4px}
  .stat-box .sub{font-size:10px;color:#94a3b8}
  .progress-bar{height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;margin:4px 0}
  .progress-bar .fill{height:100%;border-radius:4px}
  .section{page-break-inside:avoid;margin-bottom:24px}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px}
  .footer{margin-top:40px;padding-top:16px;border-top:2px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center}
  .watermark{font-size:9px;color:#cbd5e1;text-align:right;margin-top:8px}
  @media print{body{padding:15px;font-size:12px} .stat-grid{grid-template-columns:repeat(4,1fr)} .two-col{grid-template-columns:1fr 1fr}}
  @media (max-width:600px){.stat-grid{grid-template-columns:repeat(2,1fr)} .two-col{grid-template-columns:1fr}}
</style></head><body>
<h1>📋 ${title}</h1>
<p style="font-size:12px;color:#64748b;">Gerado em ${new Date().toLocaleString("pt-BR")} • Relatório Profissional</p>
${content}
<div class="footer">
  <p>Sistema de Estudos de Johan Sena • Desenvolvido por <strong>Jimmy Sena</strong></p>
  <p style="font-size:9px">Este relatório foi gerado automaticamente com base nos dados registrados no sistema.</p>
</div>
</body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 300);
}

function buildFullReport(
  sessions: StudySession[], tasks: KanbanTask[], events: AgendaEvent[], flashcards: Flashcard[],
  simResults: any, streak: number, totalXP: number, level: number
) {
  const totalHours = Math.round(sessions.reduce((a, s) => a + s.duration, 0) / 60 * 10) / 10;
  const pending = tasks.filter(t => t.column !== 'done').length;
  const done = tasks.filter(t => t.column === 'done').length;
  const mastered = flashcards.filter(f => f.status === 'mastered').length;
  const todayStr = getLocalDateStr(new Date());
  const avgDaily = sessions.length > 0 ? (totalHours / Math.max([...new Set(sessions.map(s => s.date))].length, 1)).toFixed(1) : '0';

  let html = `<div class="stat-grid">
    <div class="stat-box"><div class="val">${totalHours}h</div><div class="lbl">Horas Estudadas</div><div class="sub">${avgDaily}h/dia em média</div></div>
    <div class="stat-box"><div class="val">${sessions.length}</div><div class="lbl">Sessões</div><div class="sub">${streak} dia(s) seguidos</div></div>
    <div class="stat-box"><div class="val">${done}/${done + pending}</div><div class="lbl">Tarefas Concluídas</div><div class="sub">${tasks.length > 0 ? Math.round(done / tasks.length * 100) : 0}% de conclusão</div></div>
    <div class="stat-box"><div class="val">${mastered}/${flashcards.length}</div><div class="lbl">Cards Dominados</div><div class="sub">${flashcards.length > 0 ? Math.round(mastered / flashcards.length * 100) : 0}% de domínio</div></div>
    <div class="stat-box"><div class="val">${totalXP}</div><div class="lbl">XP Total</div><div class="sub">Nível ${level}</div></div>
    <div class="stat-box"><div class="val">${simResults.totalQuestions > 0 ? Math.round(simResults.totalCorrect / simResults.totalQuestions * 100) : 0}%</div><div class="lbl">Acerto Simulados</div><div class="sub">${simResults.totalCorrect}/${simResults.totalQuestions} questões</div></div>
  </div>`;

  // Time by area
  const areaMap: Record<string, number> = {};
  sessions.forEach(s => { areaMap[s.area] = (areaMap[s.area] || 0) + s.duration; });
  if (Object.keys(areaMap).length) {
    html += `<div class="section"><h2>⏱️ Tempo por Área do ENEM</h2><table><tr><th>Área</th><th>Horas</th><th>Sessões</th><th>% do Total</th></tr>`;
    const totalMin = Object.values(areaMap).reduce((a, b) => a + b, 0);
    html += Object.entries(areaMap).sort((a, b) => b[1] - a[1]).map(([a, m]) =>
      `<tr><td><strong>${ENEM_AREAS[a as EnemArea]?.label || a}</strong></td><td>${(m / 60).toFixed(1)}h</td><td>${sessions.filter(s => s.area === a).length}</td><td>${Math.round(m / totalMin * 100)}%</td></tr>`
    ).join("");
    html += `</table></div>`;
  }

  // Tasks
  if (tasks.length) {
    const byPriority = { alta: tasks.filter(t => t.priority === 'alta' && t.column !== 'done').length, media: tasks.filter(t => t.priority === 'media' && t.column !== 'done').length, baixa: tasks.filter(t => t.priority === 'baixa' && t.column !== 'done').length };
    html += `<div class="section"><h2>📋 Planner (${tasks.length} tarefas)</h2>`;
    html += `<div class="stat-grid"><div class="stat-box"><div class="val" style="color:#dc2626">${byPriority.alta}</div><div class="lbl">Alta Prioridade</div></div><div class="stat-box"><div class="val" style="color:#d97706">${byPriority.media}</div><div class="lbl">Média</div></div><div class="stat-box"><div class="val" style="color:#059669">${byPriority.baixa}</div><div class="lbl">Baixa</div></div></div>`;
    html += `<table><tr><th>Tarefa</th><th>Status</th><th>Prioridade</th><th>Prazo</th></tr>`;
    html += tasks.slice(0, 30).map(t => `<tr><td>${t.title}</td><td><span class="badge ${t.column}">${t.column === 'done' ? '✅ Concluído' : t.column === 'doing' ? '🔄 Em Progresso' : '📋 A Fazer'}</span></td><td><span class="badge ${t.priority}">${t.priority}</span></td><td>${t.dueDate || "—"}</td></tr>`).join("");
    html += `</table></div>`;
  }

  // Simulados
  if (simResults.raw.length > 0) {
    html += `<div class="section"><h2>📝 Desempenho em Simulados</h2><table><tr><th>Área</th><th>Questões</th><th>Acertos</th><th>Taxa</th><th>Status</th></tr>`;
    html += Object.entries(simResults.byArea).map(([area, data]: [string, any]) => {
      const pct = Math.round(data.correct / data.total * 100);
      const status = pct >= 70 ? '🟢 Bom' : pct >= 50 ? '🟡 Regular' : '🔴 Atenção';
      return `<tr><td><strong>${ENEM_AREAS[area as EnemArea]?.label || area}</strong></td><td>${data.total}</td><td>${data.correct}</td><td>${pct}%</td><td>${status}</td></tr>`;
    }).join("");
    html += `</table></div>`;
  }

  // Flashcards
  if (flashcards.length) {
    const byStatus = { new: 0, reviewing: 0, mastered: 0 };
    flashcards.forEach(f => { byStatus[f.status] = (byStatus[f.status] || 0) + 1; });
    html += `<div class="section"><h2>🃏 Flashcards (${flashcards.length} cards)</h2><table><tr><th>Status</th><th>Quantidade</th><th>%</th></tr>`;
    html += `<tr><td>📗 Novos</td><td>${byStatus.new}</td><td>${Math.round(byStatus.new / flashcards.length * 100)}%</td></tr>`;
    html += `<tr><td>📙 Revisando</td><td>${byStatus.reviewing}</td><td>${Math.round(byStatus.reviewing / flashcards.length * 100)}%</td></tr>`;
    html += `<tr><td>📘 Dominados</td><td>${byStatus.mastered}</td><td>${Math.round(byStatus.mastered / flashcards.length * 100)}%</td></tr></table></div>`;
  }

  // Events
  const futureEvents = events.filter(e => e.date >= todayStr).slice(0, 20);
  if (futureEvents.length) {
    html += `<div class="section"><h2>📅 Próximos Eventos</h2><table><tr><th>Evento</th><th>Data</th><th>Horário</th><th>Tipo</th></tr>`;
    html += futureEvents.map(e => `<tr><td>${e.title}</td><td>${e.date}</td><td>${e.startTime || "—"}</td><td>${e.type || "—"}</td></tr>`).join("");
    html += `</table></div>`;
  }

  // Notes
  const notes = getLocalData("study-notes") as Array<{ title: string; content: string; area?: string; updatedAt?: string }>;
  if (notes.length) {
    html += `<div class="section"><h2>📔 Caderno (${notes.length} anotações)</h2><table><tr><th>Título</th><th>Área</th><th>Atualizado</th></tr>`;
    html += notes.slice(0, 20).map(n => `<tr><td>${n.title}</td><td>${n.area || '—'}</td><td>${n.updatedAt ? new Date(n.updatedAt).toLocaleDateString('pt-BR') : "—"}</td></tr>`).join("");
    html += `</table></div>`;
  }

  return html;
}

// ---------- Empty state ----------
function EmptyState({ icon: Icon, message, actionLabel, onAction }: { icon: React.ElementType; message: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-10 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-xs text-muted-foreground text-center max-w-[200px]">{message}</p>
      {actionLabel && onAction && (
        <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7" onClick={onAction}>
          {actionLabel} <ArrowRight className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// ---------- component ----------
export default function RelatoriosPage() {
  const navigate = useNavigate();
  const [sessions] = useLocalStorage<StudySession[]>('study-sessions', []);
  const [tasks] = useLocalStorage<KanbanTask[]>('kanban-tasks', []);
  const [events] = useLocalStorage<AgendaEvent[]>('agenda-events', []);
  const [flashcards] = useLocalStorage<Flashcard[]>('flashcards', []);
  const { stats } = useGamification();

  const today = new Date();

  const totalHours = useMemo(() => Math.round(sessions.reduce((a, s) => a + s.duration, 0) / 60 * 10) / 10, [sessions]);
  const totalSessions = sessions.length;
  const tasksDone = tasks.filter(t => t.column === 'done').length;
  const tasksPending = tasks.filter(t => t.column !== 'done').length;
  const mastered = flashcards.filter(f => f.status === 'mastered').length;
  const reviewing = flashcards.filter(f => f.status === 'reviewing').length;

  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 365; i++) {
      const d = getLocalDateStr(subDays(today, i));
      if (sessions.some(s => s.date === d)) count++;
      else break;
    }
    return count;
  }, [sessions]);

  const weekData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const result = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const dateStr = getLocalDateStr(d);
      const mins = sessions.filter(s => s.date === dateStr).reduce((a, s) => a + s.duration, 0);
      result.push({ name: i <= 6 ? days[d.getDay()] : `${d.getDate()}/${d.getMonth() + 1}`, horas: Math.round(mins / 60 * 10) / 10 });
    }
    return result;
  }, [sessions]);

  const areaData = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach(s => { map[s.area] = (map[s.area] || 0) + s.duration; });
    return Object.entries(map).map(([area, min]) => ({
      name: ENEM_AREAS[area as EnemArea]?.label || area,
      value: Math.round(min / 60 * 10) / 10,
      color: AREA_COLORS[area as EnemArea] || "#888",
    }));
  }, [sessions]);

  const taskData = useMemo(() => [
    { name: "A fazer", value: tasks.filter(t => t.column === 'todo').length, color: "hsl(var(--muted-foreground))" },
    { name: "Em progresso", value: tasks.filter(t => t.column === 'doing').length, color: "hsl(var(--primary))" },
    { name: "Concluído", value: tasksDone, color: "hsl(142, 71%, 45%)" },
  ].filter(d => d.value > 0), [tasks, tasksDone]);

  const fcData = useMemo(() => [
    { name: "Novos", value: flashcards.filter(f => f.status === 'new').length, color: "hsl(var(--muted-foreground))" },
    { name: "Revisando", value: reviewing, color: "#f97316" },
    { name: "Dominados", value: mastered, color: "#22c55e" },
  ].filter(d => d.value > 0), [flashcards, reviewing, mastered]);

  const avgHoursPerDay = useMemo(() => {
    if (!sessions.length) return 0;
    const dates = [...new Set(sessions.map(s => s.date))];
    return Math.round(totalHours / dates.length * 10) / 10;
  }, [sessions, totalHours]);

  const simResults = useMemo(() => {
    const raw = getLocalData("simulado-results") as Array<{ area: string; total: number; correct: number; date?: string }>;
    const byArea: Record<string, { total: number; correct: number }> = {};
    raw.forEach(r => {
      if (!byArea[r.area]) byArea[r.area] = { total: 0, correct: 0 };
      byArea[r.area].total += r.total; byArea[r.area].correct += r.correct;
    });
    return { raw, byArea, totalQuestions: raw.reduce((a, r) => a + r.total, 0), totalCorrect: raw.reduce((a, r) => a + r.correct, 0) };
  }, []);

  // Radar chart data for simulados
  const radarData = useMemo(() => {
    return Object.entries(ENEM_AREAS).map(([key, val]) => {
      const data = simResults.byArea[key];
      return { subject: val.label, score: data ? Math.round(data.correct / data.total * 100) : 0, fullMark: 100 };
    });
  }, [simResults]);

  const hasData = totalSessions > 0 || tasks.length > 0 || flashcards.length > 0 || simResults.raw.length > 0;
  const taskCompletionPct = tasks.length ? Math.round(tasksDone / tasks.length * 100) : 0;
  const fcMasteryPct = flashcards.length ? Math.round(mastered / flashcards.length * 100) : 0;
  const simAccuracyPct = simResults.totalQuestions ? Math.round(simResults.totalCorrect / simResults.totalQuestions * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent-foreground p-4 sm:p-6 text-primary-foreground shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" /> Relatórios & Análises
            </h1>
            <p className="text-xs sm:text-sm opacity-80 mt-1">
              {hasData
                ? `${totalHours}h em ${totalSessions} sessões • ${streak > 0 ? `🔥 ${streak} dias` : "Comece hoje!"} • Nível ${stats.level}`
                : "Comece a estudar para ver suas estatísticas"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {[
          { label: "Horas", value: `${totalHours}h`, sub: `${avgHoursPerDay}h/dia`, icon: Clock, color: "text-primary" },
          { label: "Tarefas", value: `${tasksDone}/${tasksDone + tasksPending}`, sub: `${taskCompletionPct}%`, icon: CheckCircle2, color: "text-[hsl(142,71%,45%)]" },
          { label: "Flashcards", value: `${mastered}/${flashcards.length}`, sub: `${fcMasteryPct}%`, icon: Brain, color: "text-[hsl(var(--ms-purple))]" },
          { label: "Simulados", value: simResults.totalQuestions > 0 ? `${simAccuracyPct}%` : "—", sub: `${simResults.totalCorrect}/${simResults.totalQuestions}`, icon: GraduationCap, color: "text-[hsl(var(--ms-orange))]" },
          { label: "XP Total", value: `${stats.totalXP}`, sub: `Nível ${stats.level}`, icon: Zap, color: "text-primary" },
          { label: "Streak", value: `${streak}`, sub: "dias", icon: Flame, color: "text-[hsl(var(--ms-orange))]" },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
              <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 mt-0.5 shrink-0 ${s.color}`} />
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-bold leading-tight">{s.value}</p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground">{s.label}</p>
                <p className="text-[9px] text-muted-foreground/70">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress bars */}
      {hasData && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: "Tarefas concluídas", pct: taskCompletionPct, color: "bg-[hsl(142,71%,45%)]" },
              { label: "Cards dominados", pct: fcMasteryPct, color: "bg-[hsl(var(--ms-purple))]" },
              { label: "Acerto simulados", pct: simAccuracyPct, color: "bg-[hsl(var(--ms-orange))]" },
            ].map(bar => (
              <div key={bar.label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{bar.label}</span>
                  <span className="font-semibold">{bar.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-accent overflow-hidden">
                  <div className={`h-full rounded-full ${bar.color} transition-all duration-500`} style={{ width: `${bar.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="visao" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto sm:h-9 gap-1">
          <TabsTrigger value="visao" className="text-[10px] sm:text-xs gap-1"><PieChartIcon className="h-3 w-3" /> <span className="hidden sm:inline">Visão</span> Geral</TabsTrigger>
          <TabsTrigger value="tempo" className="text-[10px] sm:text-xs gap-1"><BarChart3 className="h-3 w-3" /> Tempo</TabsTrigger>
          <TabsTrigger value="simulados" className="text-[10px] sm:text-xs gap-1"><GraduationCap className="h-3 w-3" /> Simulados</TabsTrigger>
          <TabsTrigger value="tarefas" className="text-[10px] sm:text-xs gap-1 hidden sm:flex"><KanbanSquare className="h-3 w-3" /> Tarefas</TabsTrigger>
          <TabsTrigger value="imprimir" className="text-[10px] sm:text-xs gap-1"><Printer className="h-3 w-3" /> Imprimir</TabsTrigger>
        </TabsList>

        {/* Visao Geral */}
        <TabsContent value="visao" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-semibold mb-3 flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-primary" /> Distribuição por Matéria
                </h3>
                {areaData.length === 0 ? (
                  <EmptyState icon={Timer} message="Registre sessões no Pomodoro para ver a distribuição." actionLabel="Ir ao Pomodoro" onAction={() => navigate("/pomodoro")} />
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <ResponsiveContainer width="100%" height={160} className="sm:w-1/2">
                      <PieChart><Pie data={areaData} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={35} strokeWidth={2}>
                        {areaData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie><Tooltip formatter={(v: number) => [`${v}h`, ""]} contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none' }} /></PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 w-full sm:flex-1">
                      {areaData.map(a => (
                        <div key={a.name} className="flex items-center gap-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: a.color }} />
                          <span className="text-muted-foreground flex-1 truncate">{a.name}</span>
                          <span className="font-semibold">{a.value}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-semibold mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-[hsl(var(--ms-purple))]" /> Flashcards
                </h3>
                {flashcards.length === 0 ? (
                  <EmptyState icon={CreditCard} message="Crie flashcards para acompanhar sua memorização." actionLabel="Criar Flashcards" onAction={() => navigate("/flashcards")} />
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <ResponsiveContainer width="100%" height={160} className="sm:w-1/2">
                      <PieChart><Pie data={fcData} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={35} strokeWidth={2}>
                        {fcData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie><Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none' }} /></PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 w-full sm:flex-1">
                      {fcData.map(d => (
                        <div key={d.name} className="flex items-center gap-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                          <span className="text-muted-foreground flex-1">{d.name}</span>
                          <span className="font-semibold">{d.value}</span>
                        </div>
                      ))}
                      <div className="pt-1 border-t text-xs">
                        <span className="text-muted-foreground">Domínio: </span>
                        <span className="font-bold text-[hsl(142,71%,45%)]">{fcMasteryPct}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tempo */}
        <TabsContent value="tempo" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Horas de Estudo (14 dias)
              </h3>
              {sessions.length === 0 ? (
                <EmptyState icon={Timer} message="Use o Pomodoro para registrar sessões!" actionLabel="Ir ao Pomodoro" onAction={() => navigate("/pomodoro")} />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={weekData}>
                    <defs><linearGradient id="colorHoras" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                    </linearGradient></defs>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip formatter={(v: number) => [`${v}h`, "Horas"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none' }} />
                    <Area type="monotone" dataKey="horas" stroke="hsl(221, 83%, 53%)" fill="url(#colorHoras)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulados */}
        <TabsContent value="simulados" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-semibold mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[hsl(var(--ms-orange))]" /> Radar de Desempenho
                </h3>
                {simResults.raw.length === 0 ? (
                  <EmptyState icon={GraduationCap} message="Faça simulados para ver o radar." actionLabel="Ir aos Simulados" onAction={() => navigate("/simulados")} />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <Radar name="Acerto" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" /> Desempenho por Área
                </h3>
                {simResults.raw.length === 0 ? (
                  <EmptyState icon={FileText} message="Seus resultados aparecerão aqui." />
                ) : (
                  <div className="space-y-3 pt-1">
                    {Object.entries(simResults.byArea).map(([area, data]: [string, any]) => {
                      const pct = Math.round(data.correct / data.total * 100);
                      return (
                        <div key={area} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: AREA_COLORS[area as EnemArea] || "#888" }} />
                              {ENEM_AREAS[area as EnemArea]?.label || area}
                            </span>
                            <span className="font-semibold">{pct}% <span className="text-muted-foreground font-normal">({data.correct}/{data.total})</span></span>
                          </div>
                          <div className="h-2 rounded-full bg-accent overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: AREA_COLORS[area as EnemArea] || "#888" }} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t flex justify-between text-xs">
                      <span className="text-muted-foreground">Média geral</span>
                      <span className={`font-bold ${simAccuracyPct >= 70 ? "text-[hsl(142,71%,45%)]" : simAccuracyPct >= 50 ? "text-[hsl(var(--ms-orange))]" : "text-destructive"}`}>{simAccuracyPct}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tarefas */}
        <TabsContent value="tarefas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-semibold mb-3 flex items-center gap-2">
                  <KanbanSquare className="h-4 w-4 text-primary" /> Status das Tarefas
                </h3>
                {tasks.length === 0 ? (
                  <EmptyState icon={KanbanSquare} message="Organize tarefas no Planner." actionLabel="Ir ao Planner" onAction={() => navigate("/kanban")} />
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <ResponsiveContainer width="100%" height={160} className="sm:w-1/2">
                      <PieChart><Pie data={taskData} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={35} strokeWidth={2}>
                        {taskData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie><Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none' }} /></PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 w-full sm:flex-1">
                      {taskData.map(d => (
                        <div key={d.name} className="flex items-center gap-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                          <span className="text-muted-foreground flex-1">{d.name}</span>
                          <span className="font-semibold">{d.value}</span>
                        </div>
                      ))}
                      <div className="pt-1 border-t text-xs">
                        <span className="text-muted-foreground">Conclusão: </span>
                        <span className="font-bold text-[hsl(142,71%,45%)]">{taskCompletionPct}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[hsl(var(--ms-orange))]" /> Prioridade
                </h3>
                {tasks.length === 0 ? (
                  <EmptyState icon={Target} message="Adicione tarefas com prioridades." />
                ) : (
                  <div className="space-y-3 pt-2">
                    {(['alta', 'media', 'baixa'] as const).map(p => {
                      const count = tasks.filter(t => t.priority === p && t.column !== 'done').length;
                      const total = tasks.filter(t => t.column !== 'done').length || 1;
                      const colors = { alta: 'bg-destructive', media: 'bg-[hsl(var(--ms-orange))]', baixa: 'bg-[hsl(142,71%,45%)]' };
                      const labels = { alta: '🔴 Alta', media: '🟡 Média', baixa: '🟢 Baixa' };
                      return (
                        <div key={p} className="space-y-1">
                          <div className="flex justify-between text-xs"><span>{labels[p]}</span><span className="font-semibold">{count}</span></div>
                          <div className="h-2 rounded-full bg-accent overflow-hidden">
                            <div className={`h-full rounded-full ${colors[p]} transition-all`} style={{ width: `${(count / total) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Imprimir */}
        <TabsContent value="imprimir" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {[
              { id: "planner", icon: KanbanSquare, title: "Planner", desc: "Tarefas por status e prioridade", gradient: "from-primary to-primary/70",
                print: () => {
                  const html = tasks.length
                    ? `<table><tr><th>Tarefa</th><th>Status</th><th>Prioridade</th><th>Prazo</th></tr>${tasks.map(t =>
                        `<tr><td>${t.title}</td><td><span class="badge ${t.column}">${t.column === 'done' ? '✅ Concluído' : t.column === 'doing' ? '🔄 Em Progresso' : '📋 A Fazer'}</span></td><td><span class="badge ${t.priority}">${t.priority}</span></td><td>${t.dueDate || "—"}</td></tr>`
                      ).join("")}</table>`
                    : '<p class="empty">Nenhuma tarefa.</p>';
                  printReport("Planner de Estudos", html);
                }},
              { id: "simulados", icon: GraduationCap, title: "Simulados", desc: "Desempenho por área ENEM", gradient: "from-[hsl(var(--ms-orange))] to-destructive",
                print: () => {
                  if (simResults.raw.length === 0) { printReport("Simulados", '<p class="empty">Nenhum simulado realizado.</p>'); return; }
                  let html = `<div class="stat-grid"><div class="stat-box"><div class="val">${simResults.raw.length}</div><div class="lbl">Simulados</div></div><div class="stat-box"><div class="val">${simAccuracyPct}%</div><div class="lbl">Taxa de Acerto</div></div></div>`;
                  html += `<table><tr><th>Área</th><th>Questões</th><th>Acertos</th><th>Taxa</th><th>Status</th></tr>`;
                  html += Object.entries(simResults.byArea).map(([area, data]: [string, any]) => {
                    const pct = Math.round(data.correct / data.total * 100);
                    return `<tr><td><strong>${ENEM_AREAS[area as EnemArea]?.label || area}</strong></td><td>${data.total}</td><td>${data.correct}</td><td>${pct}%</td><td>${pct >= 70 ? '🟢' : pct >= 50 ? '🟡' : '🔴'}</td></tr>`;
                  }).join("");
                  html += `</table>`;
                  printReport("Desempenho em Simulados ENEM", html);
                }},
              { id: "metas", icon: Target, title: "Metas", desc: "Progresso das metas", gradient: "from-[hsl(142,71%,45%)] to-[hsl(var(--ms-teal))]",
                print: () => {
                  const metas = getLocalData("study-goals") as Array<{ title: string; current: number; target: number; unit?: string }>;
                  const html = metas.length
                    ? `<table><tr><th>Meta</th><th>Progresso</th><th>Alvo</th><th>%</th></tr>${metas.map(m =>
                        `<tr><td>${m.title}</td><td>${m.current} ${m.unit || ""}</td><td>${m.target} ${m.unit || ""}</td><td>${Math.round((m.current / m.target) * 100)}%</td></tr>`
                      ).join("")}</table>`
                    : '<p class="empty">Nenhuma meta.</p>';
                  printReport("Metas de Estudo", html);
                }},
              { id: "flashcards", icon: CreditCard, title: "Flashcards", desc: "Cards e status", gradient: "from-[hsl(var(--ms-purple))] to-primary",
                print: () => {
                  const cards = getLocalData("flashcards") as Array<{ question?: string; front?: string; answer?: string; back?: string; area?: string; status?: string }>;
                  const html = cards.length
                    ? `<table><tr><th>Pergunta</th><th>Resposta</th><th>Área</th><th>Status</th></tr>${cards.map(c => `<tr><td>${c.question || c.front || ''}</td><td>${c.answer || c.back || ''}</td><td>${c.area || '—'}</td><td>${c.status || '—'}</td></tr>`).join("")}</table>`
                    : '<p class="empty">Nenhum flashcard.</p>';
                  printReport("Flashcards", html);
                }},
              { id: "caderno", icon: BookOpen, title: "Caderno", desc: "Anotações e resumos", gradient: "from-[hsl(var(--ms-orange))] to-destructive",
                print: () => {
                  const notes = getLocalData("study-notes") as Array<{ title: string; content: string; area?: string; updatedAt?: string }>;
                  const html = notes.length
                    ? notes.map(n => `<h2>${n.title}</h2><p style="font-size:11px;color:#64748b;">${n.area || ''} • ${n.updatedAt ? new Date(n.updatedAt).toLocaleDateString('pt-BR') : ""}</p><p>${n.content.replace(/\n/g, '<br>')}</p>`).join("<hr/>")
                    : '<p class="empty">Nenhuma anotação.</p>';
                  printReport("Caderno de Anotações", html);
                }},
              { id: "completo", icon: FileText, title: "📊 Relatório Completo", desc: "Todas as seções — profissional", gradient: "from-primary to-[hsl(var(--ms-purple))]",
                print: () => printReport("Relatório Completo de Estudos", buildFullReport(sessions, tasks, events, flashcards, simResults, streak, stats.totalXP, stats.level)) },
            ].map(r => (
              <Card key={r.id} className={`border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group ${r.id === "completo" ? "sm:col-span-2 bg-accent/50" : ""}`} onClick={r.print}>
                <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${r.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform shrink-0`}>
                    <r.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold">{r.title}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground">{r.desc}</p>
                  </div>
                  <Printer className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-[10px] text-muted-foreground text-center pt-2 border-t">
        Relatórios gerados a partir dos dados locais • Desenvolvido por <strong>Jimmy Sena</strong>
      </p>
    </div>
  );
}
