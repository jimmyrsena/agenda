import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Note, Flashcard, EnemArea } from "@/types/study";
import { toast } from "sonner";

const TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-tools`;

interface Props {
  notes: Note[];
}

export function AutoSummarize({ notes }: Props) {
  const [, setFlashcards] = useLocalStorage<Flashcard[]>('flashcards', []);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async () => {
    if (notes.length === 0) {
      toast.error('Nenhuma nota para resumir');
      return;
    }
    setIsGenerating(true);
    try {
      const resp = await fetch(TOOLS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'summarize-notes',
          data: { notes: notes.slice(0, 10).map(n => ({ title: n.title, content: n.content, area: n.area })) },
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Erro ao resumir');
      }

      const data = await resp.json();
      const newCards: Flashcard[] = (data.flashcards || []).map((fc: any) => ({
        id: crypto.randomUUID(),
        question: fc.question,
        answer: fc.answer,
        area: fc.area as EnemArea,
        subject: fc.subject || '',
        status: 'new' as const,
        createdAt: new Date().toISOString(),
      }));

      setFlashcards(prev => [...prev, ...newCards]);
      toast.success(`${newCards.length} flashcards criados a partir das notas! 🎉`);
    } catch (e: any) {
      toast.error(e.message || 'Erro ao gerar flashcards');
    }
    setIsGenerating(false);
  };

  return (
    <Button size="sm" variant="outline" onClick={generate} disabled={isGenerating || notes.length === 0} className="gap-1.5">
      {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      {isGenerating ? 'Gerando...' : 'Gerar Flashcards'}
    </Button>
  );
}
