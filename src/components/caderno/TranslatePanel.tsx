import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Languages, X, Copy, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

const TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-text`;

const LANGUAGES = [
  { id: 'english', label: 'Inglês' },
  { id: 'spanish', label: 'Espanhol' },
  { id: 'french', label: 'Francês' },
  { id: 'german', label: 'Alemão' },
  { id: 'italian', label: 'Italiano' },
  { id: 'portuguese', label: 'Português' },
  { id: 'mandarin', label: 'Mandarim' },
  { id: 'japanese', label: 'Japonês' },
  { id: 'korean', label: 'Coreano' },
];

interface Props {
  selectedText: string;
  onInsert: (text: string) => void;
  onClose: () => void;
}

export function TranslatePanel({ selectedText, onInsert, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [targetLang, setTargetLang] = useState('english');
  const [result, setResult] = useState('');

  const translate = useCallback(async () => {
    if (!selectedText.trim()) { toast.error('Selecione texto para traduzir'); return; }
    setLoading(true);
    try {
      const resp = await fetch(TOOLS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          text: selectedText.slice(0, 3000),
          sourceLang: 'portuguese',
          targetLang,
        }),
      });
      if (!resp.ok) throw new Error('Erro na tradução');
      const data = await resp.json();
      setResult(data.translation || data.translatedText || data.result || '');
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(false);
  }, [selectedText, targetLang]);

  return (
    <Card className="border-primary/20">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Languages className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">Tradução</span>
          </div>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClose}><X className="h-3 w-3" /></Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Português</span>
            <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger className="h-6 text-[10px] w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.filter(l => l.id !== 'portuguese').map(l => (
                  <SelectItem key={l.id} value={l.id} className="text-[10px]">{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="h-6 text-[10px] gap-1" onClick={translate} disabled={loading || !selectedText}>
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
              Traduzir
            </Button>
          </div>

          {!selectedText && <p className="text-[9px] text-muted-foreground">Selecione texto no documento para traduzir.</p>}

          {selectedText && (
            <div className="text-[10px] p-1.5 bg-muted rounded text-muted-foreground line-clamp-2">{selectedText}</div>
          )}

          {result && (
            <ScrollArea className="max-h-[120px]">
              <div className="p-2 bg-primary/5 rounded border border-primary/10 text-xs">{result}</div>
              <div className="flex gap-1 mt-1">
                <Button size="sm" variant="outline" className="h-5 text-[9px] gap-1" onClick={() => { navigator.clipboard.writeText(result); toast.success('Copiado!'); }}>
                  <Copy className="h-2.5 w-2.5" /> Copiar
                </Button>
                <Button size="sm" variant="outline" className="h-5 text-[9px] gap-1 text-primary" onClick={() => { onInsert(result); toast.success('Inserido no documento!'); }}>
                  Inserir no Doc
                </Button>
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
