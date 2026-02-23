import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AgendaEvent, EnemArea, ENEM_AREAS } from "@/types/study";
import { AlertTriangle } from "lucide-react";

export const EVENT_TYPES: Record<string, { label: string; color: string; dot: string }> = {
  aula: { label: 'Aula', color: 'bg-primary', dot: 'bg-primary' },
  revisao: { label: 'Revisão', color: 'bg-ms-orange', dot: 'bg-ms-orange' },
  simulado: { label: 'Simulado', color: 'bg-ms-purple', dot: 'bg-ms-purple' },
  descanso: { label: 'Descanso', color: 'bg-ms-green', dot: 'bg-ms-green' },
  prova: { label: 'Prova', color: 'bg-destructive', dot: 'bg-destructive' },
  tarefa: { label: 'Tarefa', color: 'bg-ms-teal', dot: 'bg-ms-teal' },
};

interface EventFormProps {
  event: Partial<AgendaEvent & { repeat?: string }>;
  setEvent: (e: any) => void;
  onSubmit: () => void;
  label: string;
  showRepeat?: boolean;
  conflicts?: AgendaEvent[];
}

export default function AgendaEventForm({ event, setEvent, onSubmit, label, showRepeat = false, conflicts = [] }: EventFormProps) {
  return (
    <div className="space-y-3">
      {/* Conflict warning */}
      {conflicts.length > 0 && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-destructive">Conflito de horário!</p>
            {conflicts.map(c => (
              <p key={c.id} className="text-muted-foreground">
                "{c.title}" — {c.startTime}–{c.endTime}
              </p>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label>Título</Label>
        <Input value={event.title || ''} onChange={e => setEvent({ ...event, title: e.target.value })} placeholder="Ex: Estudar Física" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tipo</Label>
          <Select value={event.type || 'aula'} onValueChange={v => setEvent({ ...event, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(EVENT_TYPES).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${v.dot}`} />
                    {v.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Matéria</Label>
          <Select value={event.area || ''} onValueChange={v => setEvent({ ...event, area: (v || undefined) as EnemArea | undefined })}>
            <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
            <SelectContent>{Object.entries(ENEM_AREAS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Início</Label><Input type="time" value={event.startTime || '08:00'} onChange={e => setEvent({ ...event, startTime: e.target.value })} /></div>
        <div><Label>Fim</Label><Input type="time" value={event.endTime || '09:00'} onChange={e => setEvent({ ...event, endTime: e.target.value })} /></div>
      </div>
      {showRepeat && (
        <div>
          <Label>Repetir</Label>
          <Select value={event.repeat || 'none'} onValueChange={v => setEvent({ ...event, repeat: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Não repetir</SelectItem>
              <SelectItem value="daily">Diariamente (7 dias)</SelectItem>
              <SelectItem value="weekly">Semanalmente (4 semanas)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label>Anotações</Label>
        <Textarea value={event.description || ''} onChange={e => setEvent({ ...event, description: e.target.value })} placeholder="Opcional" rows={2} />
      </div>
      <Button onClick={onSubmit} className="w-full">{label}</Button>
    </div>
  );
}
