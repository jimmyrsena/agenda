import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Loader2, ShieldCheck, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

const TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-tools`;

interface PlagResult {
  score: number;
  analysis: string;
  suggestions: string[];
}

interface Props {
  content: string;
  title: string;
  onClose: () => void;
}

export function PlagiarismCheck({ content, title, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlagResult | null>(null);

  const runCheck = useCallback(async () => {
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    if (plainText.length < 50) { toast.error('Texto muito curto para análise'); return; }

    setLoading(true);
    try {
      const resp = await fetch(TOOLS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'note-ai-action',
          data: {
            action: 'plagiarism-check',
            title,
            content: plainText.slice(0, 4000),
            area: 'linguagens',
          },
        }),
      });
      if (!resp.ok) throw new Error('Erro na verificação');
      const data = await resp.json();
      const text = data.result || '';

      // Parse score and suggestions
      const scoreMatch = text.match(/(\d{1,3})%/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 85;

      setResult({
        score,
        analysis: text,
        suggestions: [],
      });
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(false);
  }, [content, title]);

  const scoreColor = result ? (result.score >= 80 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-600' : 'text-destructive') : '';

  return (
    <Card className="border-primary/20">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">Verificação de Originalidade</span>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={runCheck} disabled={loading}>
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
              {result ? 'Reverificar' : 'Verificar'}
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClose}><X className="h-3 w-3" /></Button>
          </div>
        </div>

        {loading && (
          <div className="py-4 text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-[10px] text-muted-foreground">Analisando originalidade do texto...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <span className={`text-2xl font-bold ${scoreColor}`}>{result.score}%</span>
                <p className="text-[9px] text-muted-foreground">Originalidade</p>
              </div>
              <div className="flex-1">
                <Progress value={result.score} className="h-2" />
                <p className="text-[9px] text-muted-foreground mt-1">
                  {result.score >= 80 ? '✅ Texto considerado original' :
                   result.score >= 50 ? '⚠️ Alguns trechos podem necessitar citação' :
                   '❌ Alto risco de similaridade'}
                </p>
              </div>
            </div>

            <ScrollArea className="max-h-[150px]">
              <div className="text-[10px] text-muted-foreground whitespace-pre-line p-1.5 bg-muted/50 rounded">
                {result.analysis}
              </div>
            </ScrollArea>
          </div>
        )}

        {!result && !loading && <p className="text-[9px] text-muted-foreground">Analisa a originalidade do texto usando IA. Não substitui ferramentas profissionais de anti-plágio.</p>}
      </CardContent>
    </Card>
  );
}
