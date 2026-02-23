import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { Flashcard, EnemArea, ENEM_AREAS } from "@/types/study";
import { toast } from "sonner";

interface Props {
  onGenerate: (cards: Flashcard[]) => void;
}

export function FlashcardAIGenerate({ onGenerate }: Props) {
  const [open, setOpen] = useState(false);
  const [area, setArea] = useState<EnemArea>('linguagens');
  const [bulkText, setBulkText] = useState('');

  const importBulk = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n').filter(l => l.trim());
    const cards: Flashcard[] = [];

    for (const line of lines) {
      const separators = [' | ', ' ; ', '\t', ' — '];
      let parts: string[] = [];
      for (const sep of separators) {
        if (line.includes(sep)) {
          parts = line.split(sep).map(s => s.trim());
          break;
        }
      }
      if (parts.length >= 2) {
        cards.push({
          id: crypto.randomUUID(),
          question: parts[0],
          answer: parts.slice(1).join(' '),
          area,
          subject: '',
          status: 'new',
          createdAt: new Date().toISOString(),
          easeFactor: 2.5,
          interval: 0,
          reviewCount: 0,
          reviews: [],
        });
      }
    }

    if (cards.length === 0) {
      toast.error('Nenhum card encontrado. Use formato: pergunta | resposta');
      return;
    }

    onGenerate(cards);
    toast.success(`${cards.length} flashcards importados!`);
    setBulkText('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Upload className="h-3.5 w-3.5" /> Importar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Importar Flashcards</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Área</Label>
            <Select value={area} onValueChange={v => setArea(v as EnemArea)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(ENEM_AREAS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Lista de Flashcards</Label>
            <Textarea
              placeholder={"Pergunta | Resposta\nO que é mitose? | Divisão celular que gera duas células idênticas\nCapital da França? | Paris"}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              className="min-h-[150px] text-xs font-mono"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Separadores aceitos: | ; — ou Tab. Uma linha por card.
            </p>
          </div>
          <Button onClick={importBulk} disabled={!bulkText.trim()} className="w-full">
            <Upload className="h-4 w-4 mr-1" /> Importar Cards
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
