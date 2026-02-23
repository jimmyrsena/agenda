import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, SpellCheck, CheckCircle, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-tools`;

interface SpellError {
  original: string;
  suggestion: string;
  explanation: string;
}

interface Props {
  content: string;
  title: string;
  onReplace: (original: string, replacement: string) => void;
  onClose: () => void;
}

export function SpellCheckPanel({ content, title, onReplace, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<SpellError[]>([]);
  const [checked, setChecked] = useState(false);

  const runCheck = useCallback(async () => {
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    if (!plainText) { toast.error('Documento vazio'); return; }

    setLoading(true);
    setErrors([]);
    try {
      const resp = await fetch(TOOLS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'note-ai-action',
          data: { action: 'spellcheck', title, content: plainText.slice(0, 4000), area: 'linguagens' },
        }),
      });

      if (!resp.ok) throw new Error('Erro na verificação');
      const data = await resp.json();
      
      // Parse the result to extract corrections
      const result = data.result || '';
      const parsed: SpellError[] = [];
      const regex = /"([^"]+)"\s*→\s*"([^"]+)"\s*\(([^)]+)\)/g;
      let match;
      while ((match = regex.exec(result)) !== null) {
        parsed.push({ original: match[1], suggestion: match[2], explanation: match[3] });
      }
      
      setErrors(parsed);
      setChecked(true);
      if (parsed.length === 0) toast.success('Nenhum erro encontrado! ✨');
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(false);
  }, [content, title]);

  return (
    <Card className="border-primary/20">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <SpellCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">Verificação Ortográfica</span>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={runCheck} disabled={loading}>
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <SpellCheck className="h-3 w-3" />}
              {checked ? 'Reverificar' : 'Verificar'}
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClose}><X className="h-3 w-3" /></Button>
          </div>
        </div>

        {checked && errors.length === 0 && (
          <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Nenhum erro encontrado!
          </div>
        )}

        {errors.length > 0 && (
          <ScrollArea className="max-h-[200px]">
            <div className="space-y-1.5">
              {errors.map((err, i) => (
                <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-destructive/5 border border-destructive/10">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="line-through text-destructive">{err.original}</span>
                      <ArrowRight className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                      <span className="font-medium text-green-600 dark:text-green-400">{err.suggestion}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground">{err.explanation}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-5 text-[9px] shrink-0 text-primary"
                    onClick={() => { onReplace(err.original, err.suggestion); setErrors(prev => prev.filter((_, idx) => idx !== i)); }}>
                    Corrigir
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full h-6 text-[10px] mt-1"
                onClick={() => { errors.forEach(e => onReplace(e.original, e.suggestion)); setErrors([]); toast.success('Todas as correções aplicadas!'); }}>
                Corrigir Tudo ({errors.length})
              </Button>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
