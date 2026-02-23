import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Plus, Clock } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { StudySession, WeeklyGoal, EnemArea, ENEM_AREAS } from "@/types/study";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MetasPage() {
  const [sessions, setSessions] = useLocalStorage<StudySession[]>('study-sessions', []);
  const [goals, setGoals] = useLocalStorage<WeeklyGoal[]>('weekly-goals', []);
  const [sessionDialog, setSessionDialog] = useState(false);
  const [goalDialog, setGoalDialog] = useState(false);
  const [newSession, setNewSession] = useState({ area: 'linguagens' as EnemArea, duration: 30, date: format(new Date(), 'yyyy-MM-dd') });
  const [newGoal, setNewGoal] = useState({ area: 'linguagens' as EnemArea, targetHours: 5 });

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekSessions = sessions.filter(s => {
    const d = new Date(s.date);
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  });

  const addSession = () => {
    const session: StudySession = { ...newSession, id: crypto.randomUUID() };
    setSessions(prev => [...prev, session]);
    setSessionDialog(false);
  };

  const addGoal = () => {
    const existing = goals.find(g => g.area === newGoal.area);
    if (existing) {
      setGoals(prev => prev.map(g => g.area === newGoal.area ? { ...g, targetHours: newGoal.targetHours } : g));
    } else {
      setGoals(prev => [...prev, { ...newGoal, id: crypto.randomUUID(), weekStart: format(weekStart, 'yyyy-MM-dd') }]);
    }
    setGoalDialog(false);
  };

  const getHoursByArea = (area: EnemArea) => Math.round(weekSessions.filter(s => s.area === area).reduce((a, s) => a + s.duration, 0) / 60 * 10) / 10;
  const totalWeekHours = Math.round(weekSessions.reduce((a, s) => a + s.duration, 0) / 60 * 10) / 10;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Metas e Progresso</h2>
        <div className="flex gap-2">
          <Dialog open={sessionDialog} onOpenChange={setSessionDialog}>
            <DialogTrigger asChild><Button size="sm"><Clock className="h-4 w-4 mr-1" />Registrar Sessão</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registrar Sessão de Estudo</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Matéria</Label>
                  <Select value={newSession.area} onValueChange={v => setNewSession(p => ({ ...p, area: v as EnemArea }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(ENEM_AREAS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Duração (minutos)</Label><Input type="number" value={newSession.duration} onChange={e => setNewSession(p => ({ ...p, duration: parseInt(e.target.value) || 0 }))} /></div>
                <div><Label>Data</Label><Input type="date" value={newSession.date} onChange={e => setNewSession(p => ({ ...p, date: e.target.value }))} /></div>
                <Button onClick={addSession} className="w-full">Registrar</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={goalDialog} onOpenChange={setGoalDialog}>
            <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />Definir Meta</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Meta Semanal</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Matéria</Label>
                  <Select value={newGoal.area} onValueChange={v => setNewGoal(p => ({ ...p, area: v as EnemArea }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(ENEM_AREAS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Horas por Semana</Label><Input type="number" value={newGoal.targetHours} onChange={e => setNewGoal(p => ({ ...p, targetHours: parseInt(e.target.value) || 0 }))} /></div>
                <Button onClick={addGoal} className="w-full">Salvar Meta</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Esta Semana — {totalWeekHours}h estudadas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(ENEM_AREAS).map(([key, area]) => {
            const hours = getHoursByArea(key as EnemArea);
            const goal = goals.find(g => g.area === key);
            const target = goal?.targetHours || 0;
            const pct = target > 0 ? Math.min((hours / target) * 100, 100) : 0;
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{area.label}</span>
                  <span className="text-muted-foreground">{hours}h {target > 0 ? `/ ${target}h` : ''}</span>
                </div>
                <Progress value={target > 0 ? pct : (hours > 0 ? 100 : 0)} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Sessões Recentes</CardTitle></CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma sessão registrada</p>
          ) : (
            <div className="space-y-2">
              {sessions.slice(-10).reverse().map(s => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded border text-sm">
                  <div className={`w-2 h-2 rounded-full ${ENEM_AREAS[s.area].color}`} />
                  <span className="font-medium">{ENEM_AREAS[s.area].label}</span>
                  <span className="text-muted-foreground">{s.duration} min</span>
                  <span className="text-muted-foreground ml-auto text-xs">{s.date}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
