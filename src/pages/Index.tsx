import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProgressCharts } from "@/components/ProgressCharts";
import {
  KanbanSquare, CalendarDays, GraduationCap, Target, BookOpen, TrendingUp,
  Clock, AlertTriangle, Timer, FileText, Star,
  Languages, CreditCard, ArrowRight, CheckCircle2, Flame, Zap, Trophy, Sparkles,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useUserName } from "@/hooks/useUserName";
import { useGamification, getTodayChallenges } from "@/hooks/useGamification";

import { KanbanTask, StudySession, AgendaEvent, Flashcard } from "@/types/study";
import { Link } from "react-router-dom";
import { format, isBefore, isToday, isTomorrow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// ==================== HELPERS ====================
function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const MOTIVATIONAL_QUOTES = [
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
  "Não existe elevador para o sucesso. Você precisa subir as escadas.",
  "A educação é a arma mais poderosa que você pode usar para mudar o mundo.",
  "Acredite em si mesmo e tudo será possível.",
  "O único lugar onde o sucesso vem antes do trabalho é no dicionário.",
  "Cada dia é uma nova chance de aprender algo novo.",
  "Disciplina é a ponte entre metas e realizações.",
  "A persistência é o caminho do êxito. — Charles Chaplin",
  "Estudar é polir a pedra preciosa da mente.",
  "O conhecimento é a única coisa que ninguém pode tirar de você.",
];

const LANGUAGE_META: Record<string, { name: string; flag: string; color: string }> = {
  english: { name: "English", flag: "EN", color: "from-blue-500 to-indigo-600" },
  spanish: { name: "Español", flag: "ES", color: "from-orange-500 to-red-600" },
  german: { name: "Deutsch", flag: "DE", color: "from-yellow-500 to-amber-600" },
  italian: { name: "Italiano", flag: "IT", color: "from-emerald-500 to-green-700" },
  mandarin: { name: "Mandarim", flag: "ZH", color: "from-red-500 to-rose-700" },
  portuguese: { name: "Português", flag: "BR", color: "from-green-500 to-emerald-600" },
};

const shortcuts = [
  { title: "Planner", icon: KanbanSquare, to: "/kanban", desc: "Tarefas", gradient: "from-primary to-primary/80" },
  { title: "Agenda", icon: CalendarDays, to: "/agenda", desc: "Eventos", gradient: "from-ms-orange to-ms-orange/80" },
  { title: "Pomodoro", icon: Timer, to: "/pomodoro", desc: "Foco", gradient: "from-ms-red to-ms-orange" },
  { title: "Simulados", icon: FileText, to: "/simulados", desc: "Questões", gradient: "from-ms-teal to-ms-green" },
  { title: "Mentor", icon: GraduationCap, to: "/tutor", desc: "Orientação", gradient: "from-ms-purple to-primary" },
  { title: "Flashcards", icon: CreditCard, to: "/flashcards", desc: "Revisar", gradient: "from-ms-green to-ms-teal" },
  { title: "Metas", icon: Target, to: "/metas", desc: "Progresso", gradient: "from-ms-red to-ms-orange" },
  { title: "Caderno", icon: BookOpen, to: "/caderno", desc: "Anotar", gradient: "from-ms-blue to-ms-purple" },
];

// ==================== COMPONENT ====================
export default function Dashboard() {
  const userName = useUserName();
  const [tasks] = useLocalStorage<KanbanTask[]>('kanban-tasks', []);
  const [sessions] = useLocalStorage<StudySession[]>('study-sessions', []);
  const [events] = useLocalStorage<AgendaEvent[]>('agenda-events', []);
  const [flashcards] = useLocalStorage<Flashcard[]>('flashcards', []);
  const [langProgress] = useLocalStorage<Record<string, Record<string, any>>>("language-progress", {});

  const { stats, currentLevel, nextLevel, xpProgress, unlockedAchievements, todayXP, todayActivity } = useGamification();
  const dailyChallenges = useMemo(() => getTodayChallenges(), []);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const pendingTasks = tasks.filter(t => t.column !== 'done');
  const overdueTasks = pendingTasks.filter(t => t.dueDate && isBefore(new Date(t.dueDate), today) && t.dueDate < todayStr);
  const inProgressTasks = tasks.filter(t => t.column === 'doing');
  const notStartedTasks = tasks.filter(t => t.column === 'todo');

  const todayEvents = events.filter(e => e.date === todayStr);
  const totalHours = Math.round(sessions.reduce((a, s) => a + s.duration, 0) / 60 * 10) / 10;
  const masteredCards = flashcards.filter(f => f.status === 'mastered').length;
  const totalFlashcards = flashcards.length;

  const quote = MOTIVATIONAL_QUOTES[new Date().getDate() % MOTIVATIONAL_QUOTES.length];

  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => {
        try {
          const d = parseISO(e.date);
          return isToday(d) || isTomorrow(d);
        } catch { return false; }
      })
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
      .slice(0, 5);
  }, [events]);

  const langSummary = useMemo(() => {
    return Object.entries(langProgress)
      .filter(([_, topics]) => Object.keys(topics).length > 0)
      .map(([langId, topics]) => ({
        langId,
        meta: LANGUAGE_META[langId],
        topicsStudied: Object.keys(topics).length,
      }))
      .sort((a, b) => b.topicsStudied - a.topicsStudied);
  }, [langProgress]);

  // Challenge progress
  const challengeProgress = useMemo(() => {
    return dailyChallenges.map(c => {
      let current = 0;
      if (c.type === 'pomodoro') current = todayActivity.pomodoros;
      else if (c.type === 'flashcard') current = todayActivity.flashcards;
      else if (c.type === 'simulado') current = todayActivity.simulados;
      else if (c.type === 'study') current = todayActivity.studyMinutes;
      return { ...c, current, done: current >= c.target };
    });
  }, [dailyChallenges, todayActivity]);

  const mainStats = [
    { label: "Tarefas Pendentes", value: pendingTasks.length, icon: KanbanSquare, color: "text-primary", bgColor: "bg-primary/10" },
    { label: "Eventos Hoje", value: todayEvents.length, icon: CalendarDays, color: "text-ms-orange", bgColor: "bg-ms-orange/10" },
    { label: "Horas Estudadas", value: `${totalHours}h`, icon: Clock, color: "text-ms-green", bgColor: "bg-ms-green/10" },
    { label: "Cards Dominados", value: `${masteredCards}/${totalFlashcards}`, icon: TrendingUp, color: "text-ms-purple", bgColor: "bg-ms-purple/10" },
  ];

  const eventTypeIcons: Record<string, { icon: React.ElementType; color: string }> = {
    aula: { icon: BookOpen, color: "text-primary" },
    revisao: { icon: TrendingUp, color: "text-ms-green" },
    simulado: { icon: FileText, color: "text-ms-orange" },
    prova: { icon: Star, color: "text-ms-red" },
    tarefa: { icon: KanbanSquare, color: "text-ms-purple" },
    descanso: { icon: Clock, color: "text-muted-foreground" },
  };

  // Recent achievements (last 5)
  const recentAchievements = unlockedAchievements.slice(-5).reverse();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl mentor-gradient p-6 md:p-8 text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-white/60 text-sm font-medium">{format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">{getGreeting()}, {userName}!</h2>
            <p className="text-white/70 mt-2 text-sm max-w-lg italic">"{quote}"</p>
          </div>
          {/* XP & Level Badge */}
          <div className="flex flex-col items-end gap-2 min-w-[180px]">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-300" />
              <span className="text-lg font-bold">{stats.studyStreak} dias</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full transition-all" style={{ width: `${Math.min(xpProgress, 100)}%` }} />
            </div>
            <div className="flex items-center justify-between w-full text-xs text-white/70">
              <span>Nv.{stats.level} {currentLevel.title}</span>
              <span>{stats.totalXP} XP {nextLevel ? `/ ${nextLevel.xp}` : '(MAX)'}</span>
            </div>
            {todayXP > 0 && (
              <Badge className="bg-white/20 text-white border-0 text-[10px]">
                <Zap className="h-3 w-3 mr-1" /> +{todayXP} XP hoje
              </Badge>
            )}
          </div>
        </div>
        <div className="absolute right-4 bottom-4 opacity-[0.06]">
          <GraduationCap className="h-40 w-40" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {mainStats.map(s => (
          <Card key={s.label} className="border-0 shadow-sm hover:shadow-md transition-all group">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.bgColor} transition-transform group-hover:scale-110`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight">{s.value}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily Challenges */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" /> Desafios do Dia
            </h3>
            <Badge variant="outline" className="text-[10px]">
              {challengeProgress.filter(c => c.done).length}/{challengeProgress.length} completos
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {challengeProgress.map(c => (
              <div key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border ${c.done ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-card border-border'} transition-all`}>
                <span className="text-xl">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium flex items-center gap-1.5">
                    {c.title}
                    {c.done && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{c.description}</p>
                  <div className="mt-1.5">
                    <Progress value={Math.min((c.current / c.target) * 100, 100)} className="h-1.5" />
                    <p className="text-[9px] text-muted-foreground mt-0.5">{Math.min(c.current, c.target)}/{c.target} · +{c.xpReward} XP</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {(overdueTasks.length > 0 || inProgressTasks.length > 0) && (
        <Card className="border-destructive/20 bg-destructive/5 border-0 shadow-sm">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Lembretes
            </p>
            {overdueTasks.length > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                {overdueTasks.length} tarefa(s) atrasada(s): {overdueTasks.slice(0, 3).map(t => t.title).join(', ')}
              </p>
            )}
            {inProgressTasks.length > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ms-orange shrink-0" />
                {inProgressTasks.length} tarefa(s) em andamento
              </p>
            )}
            {notStartedTasks.length > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                {notStartedTasks.length} tarefa(s) não iniciada(s)
              </p>
            )}
            <Link to="/kanban" className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1">
              Ver no Planner <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Three-column: Events + Language + Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Upcoming Events */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-ms-orange" /> Próximos Eventos
              </h3>
              <Link to="/agenda" className="text-[10px] text-primary hover:underline font-medium">Ver todos</Link>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">Nenhum evento próximo.</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map(ev => {
                  const evDate = parseISO(ev.date);
                  const { icon: EvIcon, color: evColor } = eventTypeIcons[ev.type] || eventTypeIcons.tarefa;
                  return (
                    <div key={ev.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <EvIcon className={`h-4 w-4 ${evColor} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{ev.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {isToday(evDate) ? "Hoje" : "Amanhã"} · {ev.startTime}–{ev.endTime}
                        </p>
                      </div>
                      {ev.completed && <CheckCircle2 className="h-3.5 w-3.5 text-ms-green shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Language Progress */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Languages className="h-4 w-4 text-primary" /> Idiomas
              </h3>
              <Link to="/idiomas" className="text-[10px] text-primary hover:underline font-medium">Ver todos</Link>
            </div>
            {langSummary.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground">Nenhum idioma iniciado.</p>
                <Link to="/idiomas" className="text-xs text-primary hover:underline font-medium mt-1 inline-block">Comece agora</Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {langSummary.map(l => (
                  <Link key={l.langId} to="/idiomas" className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${l.meta?.color || "from-muted to-muted"} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                      {l.meta?.flag || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{l.meta?.name || l.langId}</p>
                      <p className="text-[10px] text-muted-foreground">{l.topicsStudied} tópico(s)</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" /> Conquistas
              </h3>
              <Badge variant="outline" className="text-[10px]">{unlockedAchievements.length} desbloqueadas</Badge>
            </div>
            {recentAchievements.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">Complete atividades para desbloquear conquistas! 🏆</p>
            ) : (
              <div className="space-y-2">
                {recentAchievements.map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                    <span className="text-lg">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-ms-green" /> Progresso de Estudos
        </h3>
        <ProgressCharts />
      </div>

      {/* Quick access */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Acesso Rápido</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {shortcuts.map(s => (
            <Link key={s.to} to={s.to}>
              <Card className="border-0 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group">
                <CardContent className="p-3 flex flex-col items-center gap-2 text-center">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    <s.icon className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{s.title}</p>
                    <p className="text-[9px] text-muted-foreground">{s.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="text-center text-[11px] text-muted-foreground pt-4 border-t">
        <p>Desenvolvido por <strong>Jimmy Sena</strong> para {userName}</p>
      </div>
    </div>
  );
}
