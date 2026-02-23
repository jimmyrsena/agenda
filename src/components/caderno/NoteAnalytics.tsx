import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Note, ENEM_AREAS, EnemArea } from "@/types/study";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Props {
  notes: Note[];
  writingLog: { date: string; words: number }[];
  dailyGoal: number;
}

export function NoteAnalytics({ notes, writingLog, dailyGoal }: Props) {
  const stats = useMemo(() => {
    const totalWords = notes.reduce((a, n) => a + n.content.split(/\s+/).filter(Boolean).length, 0);
    const totalNotes = notes.length;
    const favorites = notes.filter(n => n.favorite).length;

    // Words by area
    const byArea: Record<string, number> = {};
    const notesByArea: Record<string, number> = {};
    notes.forEach(n => {
      const words = n.content.split(/\s+/).filter(Boolean).length;
      byArea[n.area] = (byArea[n.area] || 0) + words;
      notesByArea[n.area] = (notesByArea[n.area] || 0) + 1;
    });

    const areaData = Object.entries(ENEM_AREAS).map(([key, val]) => ({
      area: val.label,
      words: byArea[key] || 0,
      notes: notesByArea[key] || 0,
    }));

    // Last 7 days writing
    const now = new Date();
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const dailyData = last7.map(day => {
      const entry = writingLog.find(w => w.date === day);
      return { day: day.slice(5), words: entry?.words || 0, goal: dailyGoal };
    });

    // Today's progress
    const today = now.toISOString().slice(0, 10);
    const todayWords = writingLog.find(w => w.date === today)?.words || 0;
    const todayProgress = dailyGoal > 0 ? Math.min(100, Math.round((todayWords / dailyGoal) * 100)) : 0;

    // Streak
    let streak = 0;
    for (let i = last7.length - 1; i >= 0; i--) {
      const entry = writingLog.find(w => w.date === last7[i]);
      if (entry && entry.words > 0) streak++;
      else break;
    }

    // Heatmap (last 30 days)
    const heatmap = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      const entry = writingLog.find(w => w.date === key);
      return { date: key, words: entry?.words || 0, day: d.getDate() };
    });

    const pieData = Object.entries(ENEM_AREAS)
      .filter(([k]) => (notesByArea[k] || 0) > 0)
      .map(([k, v]) => ({
        name: v.label,
        value: notesByArea[k] || 0,
        color: `hsl(var(--enem-${k}))`,
      }));

    return { totalWords, totalNotes, favorites, areaData, dailyData, todayWords, todayProgress, streak, heatmap, pieData };
  }, [notes, writingLog, dailyGoal]);

  return (
    <div className="space-y-3">
      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Total de Notas', value: stats.totalNotes, icon: '📝' },
          { label: 'Palavras Totais', value: stats.totalWords.toLocaleString(), icon: '📖' },
          { label: 'Streak de Escrita', value: `${stats.streak}d 🔥`, icon: '' },
          { label: 'Favoritas', value: stats.favorites, icon: '⭐' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-2.5 text-center">
              <p className="text-xl font-bold">{s.icon}{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's goal */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium">Meta Diária de Escrita</p>
            <span className="text-sm font-bold">{stats.todayWords}/{dailyGoal} palavras</span>
          </div>
          <Progress value={stats.todayProgress} className="h-2.5" />
          <p className="text-[10px] text-muted-foreground mt-1">
            {stats.todayProgress >= 100 ? '🎉 Meta atingida!' : `Faltam ${Math.max(0, dailyGoal - stats.todayWords)} palavras`}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Writing activity */}
        <Card>
          <CardContent className="p-3">
            <p className="text-xs font-medium mb-2">Atividade de Escrita (7 dias)</p>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dailyData}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={30} />
                  <Tooltip formatter={(v: number) => [`${v} palavras`]} />
                  <Bar dataKey="words" name="Palavras" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Notes by area */}
        <Card>
          <CardContent className="p-3">
            <p className="text-xs font-medium mb-2">Notas por Área</p>
            {stats.pieData.length > 0 ? (
              <div className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" paddingAngle={2}>
                      {stats.pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [`${v} notas`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">Sem dados ainda</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <CardContent className="p-3">
          <p className="text-xs font-medium mb-2">Heatmap de Escrita (30 dias)</p>
          <div className="flex gap-[3px] flex-wrap">
            {stats.heatmap.map(day => {
              const intensity = day.words === 0 ? 0 : day.words < 50 ? 1 : day.words < 150 ? 2 : day.words < 300 ? 3 : 4;
              const colors = ['bg-muted', 'bg-primary/20', 'bg-primary/40', 'bg-primary/70', 'bg-primary'];
              return (
                <div
                  key={day.date}
                  className={`w-[14px] h-[14px] rounded-[2px] ${colors[intensity]}`}
                  title={`${day.date}: ${day.words} palavras`}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-[9px] text-muted-foreground">Menos</span>
            {['bg-muted', 'bg-primary/20', 'bg-primary/40', 'bg-primary/70', 'bg-primary'].map(c => (
              <div key={c} className={`w-[10px] h-[10px] rounded-[2px] ${c}`} />
            ))}
            <span className="text-[9px] text-muted-foreground">Mais</span>
          </div>
        </CardContent>
      </Card>

      {/* Area breakdown */}
      <Card>
        <CardContent className="p-3">
          <p className="text-xs font-medium mb-2">Cobertura por Área</p>
          <div className="space-y-2">
            {stats.areaData.map(a => (
              <div key={a.area} className="flex items-center gap-2">
                <span className="text-xs w-20 truncate">{a.area}</span>
                <Progress value={stats.totalWords > 0 ? (a.words / stats.totalWords) * 100 : 0} className="flex-1 h-2" />
                <span className="text-[10px] text-muted-foreground w-16 text-right">{a.words}w / {a.notes}n</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
