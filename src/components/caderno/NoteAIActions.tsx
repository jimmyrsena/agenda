import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, HelpCircle, Minimize2, BookOpen, Lightbulb } from "lucide-react";
import { Note } from "@/types/study";
import { toast } from "sonner";

const TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-tools`;

interface Props {
  note: Note | null;
  onInsertContent: (text: string) => void;
}

type AIAction = 'summarize' | 'questions' | 'explain' | 'expand' | 'simplify';

const ACTIONS: { id: AIAction; label: string; icon: any; desc: string }[] = [
  { id: 'summarize', label: 'Resumir', icon: Minimize2, desc: 'Resumo em 3 níveis' },
  { id: 'questions', label: 'Quiz', icon: HelpCircle, desc: 'Perguntas de revisão' },
  { id: 'explain', label: 'Explicar', icon: Lightbulb, desc: 'Explicar como se eu tivesse 5 anos' },
  { id: 'expand', label: 'Expandir', icon: BookOpen, desc: 'Aprofundar o conteúdo' },
  { id: 'simplify', label: 'Simplificar', icon: Sparkles, desc: 'Reescrever mais simples' },
];

export function NoteAIActions({ note, onInsertContent }: Props) {
  const [loading, setLoading] = useState<AIAction | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const runAction = async (action: AIAction) => {
    if (!note) { toast.error('Selecione uma nota primeiro'); return; }
    if (!note.content.trim()) { toast.error('A nota está vazia'); return; }

    setLoading(action);
    setResult(null);

    try {
      const resp = await fetch(TOOLS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'note-ai-action',
          data: { action, title: note.title, content: note.content.slice(0, 4000), area: note.area },
        }),
      });

      if (!resp.ok) throw new Error('Erro ao processar com IA');
      const data = await resp.json();
      setResult(data.result || 'Sem resultado');
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 flex-wrap">
        <Sparkles className="h-3.5 w-3.5 text-ms-purple mr-1" />
        {ACTIONS.map(a => (
          <Button
            key={a.id}
            size="sm"
            variant="outline"
            className="h-7 text-[10px] gap-1"
            onClick={() => runAction(a.id)}
            disabled={!!loading || !note}
            title={a.desc}
          >
            {loading === a.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <a.icon className="h-3 w-3" />}
            {a.label}
          </Button>
        ))}
      </div>

      {result && (
        <Card className="border-ms-purple/20 bg-ms-purple/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium text-ms-purple">🤖 Resultado da IA</span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => onInsertContent('\n\n---\n\n' + result)}>
                  📝 Inserir na nota
                </Button>
                <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => { navigator.clipboard.writeText(result); toast.success('Copiado!'); }}>
                  📋 Copiar
                </Button>
                <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setResult(null)}>✕</Button>
              </div>
            </div>
            <p className="text-xs whitespace-pre-wrap">{result}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
