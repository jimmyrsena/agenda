import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Wand2, GraduationCap, Smile, Minimize2, X, Check } from "lucide-react";
import { toast } from "sonner";

const TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-tools`;

interface Props {
  selectedText: string;
  onReplace: (newText: string) => void;
  onClose: () => void;
}

const REWRITE_STYLES = [
  { id: 'formal', label: 'Formal', icon: GraduationCap, desc: 'Tom acadêmico profissional' },
  { id: 'informal', label: 'Informal', icon: Smile, desc: 'Tom casual e acessível' },
  { id: 'concise', label: 'Conciso', icon: Minimize2, desc: 'Mais curto e direto' },
  { id: 'creative', label: 'Criativo', icon: Wand2, desc: 'Mais expressivo e envolvente' },
];

export function ParagraphRewrite({ selectedText, onReplace, onClose }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const rewrite = useCallback(async (style: string) => {
    if (!selectedText.trim()) { toast.error('Selecione um texto primeiro'); return; }
    setLoading(style);
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
          data: { action: `rewrite-${style}`, title: 'Reescrita', content: selectedText.slice(0, 2000), area: 'linguagens' },
        }),
      });

      if (!resp.ok) throw new Error('Erro ao reescrever');
      const data = await resp.json();
      setResult(data.result || '');
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(null);
  }, [selectedText]);

  return (
    <Card className="border-primary/20">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Wand2 className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">Reescrever Parágrafo</span>
          </div>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClose}><X className="h-3 w-3" /></Button>
        </div>

        {selectedText ? (
          <>
            <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">"{selectedText.slice(0, 100)}..."</p>
            <div className="flex gap-1 flex-wrap mb-2">
              {REWRITE_STYLES.map(s => (
                <Button key={s.id} size="sm" variant="outline" className="h-6 text-[9px] gap-0.5"
                  onClick={() => rewrite(s.id)} disabled={!!loading} title={s.desc}>
                  {loading === s.id ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <s.icon className="h-2.5 w-2.5" />}
                  {s.label}
                </Button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-[10px] text-muted-foreground">Selecione um texto no editor para reescrever.</p>
        )}

        {result && (
          <div className="border-t pt-2 mt-2">
            <p className="text-xs whitespace-pre-wrap mb-2">{result}</p>
            <div className="flex gap-1">
              <Button size="sm" variant="default" className="h-6 text-[10px] gap-1"
                onClick={() => { onReplace(result); toast.success('Texto substituído!'); onClose(); }}>
                <Check className="h-3 w-3" /> Substituir
              </Button>
              <Button size="sm" variant="ghost" className="h-6 text-[10px]"
                onClick={() => { navigator.clipboard.writeText(result); toast.success('Copiado!'); }}>
                📋 Copiar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
