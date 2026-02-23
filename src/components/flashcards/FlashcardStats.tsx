import { Card, CardContent } from "@/components/ui/card";
import { Flashcard, isDueForReview } from "@/types/study";
import { Progress } from "@/components/ui/progress";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Props {
  cards: Flashcard[];
}

export function FlashcardStats({ cards }: Props) {
  const stats = useMemo(() => {
    const total = cards.length;
    const newCards = cards.filter(c => c.status === 'new').length;
    const reviewing = cards.filter(c => c.status === 'reviewing').length;
    const mastered = cards.filter(c => c.status === 'mastered').length;
    const dueNow = cards.filter(isDueForReview).length;
    const favorites = cards.filter(c => c.favorite).length;

    // Reviews history (last 7 days)
    const now = new Date();
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const reviewsByDay = last7.map(day => {
      let correct = 0, wrong = 0;
      cards.forEach(c => {
        (c.reviews || []).forEach(r => {
          if (r.date.slice(0, 10) === day) {
            if (r.correct) correct++;
            else wrong++;
          }
        });
      });
      return { day: day.slice(5), correct, wrong };
    });

    const retentionRate = total > 0 ? Math.round((mastered / total) * 100) : 0;

    return { total, newCards, reviewing, mastered, dueNow, favorites, reviewsByDay, retentionRate };
  }, [cards]);

  const pieData = [
    { name: 'Novos', value: stats.newCards, color: 'hsl(var(--primary))' },
    { name: 'Revisando', value: stats.reviewing, color: 'hsl(var(--ms-orange))' },
    { name: 'Dominados', value: stats.mastered, color: 'hsl(var(--ms-green))' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-3">
      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: 'Total', value: stats.total, cls: '' },
          { label: 'Novos', value: stats.newCards, cls: 'text-primary' },
          { label: 'Revisando', value: stats.reviewing, cls: 'text-ms-orange' },
          { label: 'Dominados', value: stats.mastered, cls: 'text-ms-green' },
          { label: 'Para Hoje', value: stats.dueNow, cls: 'text-ms-red' },
          { label: 'Favoritos', value: stats.favorites, cls: 'text-ms-purple' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-2.5 text-center">
              <p className={`text-xl font-bold ${s.cls}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Retention + Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs font-medium mb-2">Taxa de Retenção</p>
            <div className="flex items-center gap-3">
              <Progress value={stats.retentionRate} className="flex-1 h-3" />
              <span className="text-lg font-bold text-ms-green">{stats.retentionRate}%</span>
            </div>
            {stats.total > 0 && pieData.length > 0 && (
              <div className="h-[120px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={2}>
                      {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [`${v} cards`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <p className="text-xs font-medium mb-2">Revisões (7 dias)</p>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.reviewsByDay}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={20} />
                  <Tooltip />
                  <Bar dataKey="correct" name="Acertos" fill="hsl(var(--ms-green))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="wrong" name="Erros" fill="hsl(var(--ms-red))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
