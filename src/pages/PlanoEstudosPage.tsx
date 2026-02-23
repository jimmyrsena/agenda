import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays, Trash2, Clock, Lightbulb, Plus, Pencil } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { KanbanTask, StudySession, WeeklyGoal, ENEM_AREAS, EnemArea } from "@/types/study";
import { toast } from "sonner";



interface StudyBlock {
  time: string;
  area: EnemArea;
  subject: string;
  activity: string;
  priority: string;
}

interface DayPlan {
  day: string;
  blocks: StudyBlock[];
}

interface WeekPlan {
  plan: DayPlan[];
  tips: string[];
}

const DAYS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

export default function PlanoEstudosPage() {
  const [tasks] = useLocalStorage<KanbanTask[]>('kanban-tasks', []);
  const [sessions] = useLocalStorage<StudySession[]>('study-sessions', []);
  const [goals] = useLocalStorage<WeeklyGoal[]>('weekly-goals', []);
  const [savedPlan, setSavedPlan] = useLocalStorage<WeekPlan | null>('weekly-study-plan', null);
  
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<{ dayIdx: number; blockIdx: number; block: StudyBlock } | null>(null);
  const [newBlock, setNewBlock] = useState<Partial<StudyBlock>>({ time: '08:00', area: 'matematica', subject: '', activity: '', priority: 'media' });


  const deletePlan = () => { setSavedPlan(null); toast.success('Plano excluído'); };

  const deleteBlock = (dayIdx: number, blockIdx: number) => {
    if (!savedPlan) return;
    const newPlan = { ...savedPlan, plan: savedPlan.plan.map((d, i) => i === dayIdx ? { ...d, blocks: d.blocks.filter((_, j) => j !== blockIdx) } : d) };
    newPlan.plan = newPlan.plan.filter(d => d.blocks.length > 0);
    setSavedPlan(newPlan.plan.length > 0 ? newPlan : null);
  };

  const addManualBlock = () => {
    if (!newBlock.subject?.trim() || !editingDay) return;
    const block: StudyBlock = {
      time: newBlock.time || '08:00', area: (newBlock.area as EnemArea) || 'matematica',
      subject: newBlock.subject!, activity: newBlock.activity || 'Estudo', priority: newBlock.priority || 'media',
    };
    if (savedPlan) {
      const dayExists = savedPlan.plan.find(d => d.day === editingDay);
      if (dayExists) {
        setSavedPlan({ ...savedPlan, plan: savedPlan.plan.map(d => d.day === editingDay ? { ...d, blocks: [...d.blocks, block].sort((a, b) => a.time.localeCompare(b.time)) } : d) });
      } else {
        setSavedPlan({ ...savedPlan, plan: [...savedPlan.plan, { day: editingDay, blocks: [block] }] });
      }
    } else {
      setSavedPlan({ plan: [{ day: editingDay, blocks: [block] }], tips: [] });
    }
    setNewBlock({ time: '08:00', area: 'matematica', subject: '', activity: '', priority: 'media' });
    setManualDialogOpen(false);
    toast.success('Bloco adicionado!');
  };

  const saveEditBlock = () => {
    if (!editingBlock || !savedPlan) return;
    const updated = { ...savedPlan, plan: savedPlan.plan.map((d, di) => di === editingBlock.dayIdx ? {
      ...d, blocks: d.blocks.map((b, bi) => bi === editingBlock.blockIdx ? editingBlock.block : b).sort((a, b) => a.time.localeCompare(b.time))
    } : d) };
    setSavedPlan(updated);
    setEditingBlock(null);
    toast.success('Bloco atualizado!');
  };

  const priorityColor = (p: string) => {
    if (p === 'alta') return 'text-destructive';
    if (p === 'media') return 'text-ms-orange';
    return 'text-muted-foreground';
  };

  const BlockForm = ({ block, setBlock, onSubmit, label }: { block: Partial<StudyBlock>; setBlock: (b: Partial<StudyBlock>) => void; onSubmit: () => void; label: string }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Horário</Label><Input type="time" value={block.time} onChange={e => setBlock({ ...block, time: e.target.value })} /></div>
        <div><Label>Prioridade</Label>
          <Select value={block.priority} onValueChange={v => setBlock({ ...block, priority: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alta">🔴 Alta</SelectItem>
              <SelectItem value="media">🟡 Média</SelectItem>
              <SelectItem value="baixa">🟢 Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Área</Label>
        <Select value={block.area} onValueChange={v => setBlock({ ...block, area: v as EnemArea })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{Object.entries(ENEM_AREAS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label>Assunto</Label><Input value={block.subject} onChange={e => setBlock({ ...block, subject: e.target.value })} placeholder="Ex: Cinemática" /></div>
      <div><Label>Atividade</Label><Input value={block.activity} onChange={e => setBlock({ ...block, activity: e.target.value })} placeholder="Ex: Resolver exercícios" /></div>
      <Button onClick={onSubmit} className="w-full">{label}</Button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarDays className="h-6 w-6 text-primary" />Plano de Estudos Semanal</h1>
          <p className="text-sm text-muted-foreground">Gerado pelo Mentor ou criado manualmente</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => { setEditingDay(DAYS[0]); setManualDialogOpen(true); }}><Plus className="h-4 w-4 mr-1" />Adicionar Bloco</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Adicionar Bloco Manual</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Dia</Label>
                  <Select value={editingDay || DAYS[0]} onValueChange={setEditingDay}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <BlockForm block={newBlock} setBlock={setNewBlock} onSubmit={addManualBlock} label="Adicionar" />
              </div>
            </DialogContent>
          </Dialog>
          {savedPlan && (
            <Button variant="outline" size="sm" onClick={deletePlan} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4 mr-1" />Excluir Plano</Button>
          )}
        </div>
      </div>

      {!savedPlan && (
        <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center space-y-3">
          <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Clique em "Adicionar Bloco" para criar seu cronograma</p>
        </CardContent></Card>
      )}

      {savedPlan && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPlan.plan.map((day, dayIdx) => (
              <Card key={day.day} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-sm">{day.day}</h3>
                  <div className="space-y-2.5">
                    {day.blocks.map((block, i) => (
                      <div key={i} className="flex gap-2.5 text-xs group">
                        <div className="text-muted-foreground shrink-0 w-20 flex items-center gap-1"><Clock className="h-3 w-3" />{block.time}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Badge className={`text-[9px] px-1.5 py-0 ${ENEM_AREAS[block.area]?.color || 'bg-primary'} text-white border-0`}>{ENEM_AREAS[block.area]?.label || block.area}</Badge>
                            <span className={`text-[9px] font-medium ${priorityColor(block.priority)}`}>{block.priority === 'alta' ? '🔴' : block.priority === 'media' ? '🟡' : '🟢'}</span>
                          </div>
                          <p className="font-medium">{block.subject}</p>
                          <p className="text-muted-foreground">{block.activity}</p>
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                          <button onClick={() => setEditingBlock({ dayIdx, blockIdx: i, block: { ...block } })} className="text-muted-foreground hover:text-primary"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => deleteBlock(dayIdx, i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {savedPlan.tips && savedPlan.tips.length > 0 && (
            <Card className="border-0 shadow-sm bg-accent/30"><CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Lightbulb className="h-4 w-4 text-ms-orange" />Dicas do Mentor</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                {savedPlan.tips.map((tip, i) => <li key={i} className="flex items-start gap-1.5"><span className="text-primary mt-0.5">💡</span>{tip}</li>)}
              </ul>
            </CardContent></Card>
          )}
        </>
      )}

      {/* Edit block dialog */}
      <Dialog open={!!editingBlock} onOpenChange={open => !open && setEditingBlock(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Bloco</DialogTitle></DialogHeader>
          {editingBlock && (
            <BlockForm
              block={editingBlock.block}
              setBlock={b => setEditingBlock(prev => prev ? { ...prev, block: b as StudyBlock } : prev)}
              onSubmit={saveEditBlock}
              label="Salvar Alterações"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
