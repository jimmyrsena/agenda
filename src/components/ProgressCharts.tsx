import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { StudySession, ENEM_AREAS, EnemArea } from "@/types/study";

const AREA_COLORS: Record<EnemArea, string> = {
  linguagens: "#3b82f6",
  humanas: "#f97316",
  natureza: "#22c55e",
  matematica: "#a855f7",
  redacao: "#ef4444",
};

function getLocalDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function ProgressCharts() {
  const [sessions] = useLocalStorage<StudySession[]>('study-sessions', []);

  const weekData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateStr(d);
      const daySessions = sessions.filter(s => s.date === dateStr);
      const totalMin = daySessions.reduce((a, s) => a + s.duration, 0);
      result.push({ name: days[d.getDay()], horas: Math.round(totalMin / 60 * 10) / 10 });
    }
    return result;
  }, [sessions]);

  const areaData = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach(s => {
      map[s.area] = (map[s.area] || 0) + s.duration;
    });
    return Object.entries(map).map(([area, min]) => ({
      name: ENEM_AREAS[area as EnemArea]?.label || area,
      value: Math.round(min / 60 * 10) / 10,
      color: AREA_COLORS[area as EnemArea] || "#888",
    }));
  }, [sessions]);

  const totalHours = Math.round(sessions.reduce((a, s) => a + s.duration, 0) / 60 * 10) / 10;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Weekly bar chart */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-3">Horas por Dia (última semana)</h3>
          {sessions.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Nenhuma sessão registrada. Use o Pomodoro para começar!</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weekData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip formatter={(v: number) => [`${v}h`, "Horas"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="horas" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Area pie chart */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-3">Distribuição por Matéria</h3>
          {areaData.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Sem dados ainda</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={areaData} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={35} strokeWidth={2}>
                    {areaData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}h`, ""]} contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1">
                {areaData.map(a => (
                  <div key={a.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
                    <span className="text-muted-foreground flex-1">{a.name}</span>
                    <span className="font-medium">{a.value}h</span>
                  </div>
                ))}
                <div className="pt-1 border-t text-xs font-semibold">Total: {totalHours}h</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
