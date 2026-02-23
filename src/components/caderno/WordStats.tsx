import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  content: string;
}

export function WordStats({ open, onClose, content }: Props) {
  const text = useMemo(() => content.replace(/<[^>]*>/g, ' '), [content]);
  const plainText = useMemo(() => content.replace(/<[^>]*>/g, ''), [content]);

  const stats = useMemo(() => {
    const words = text.split(/\s+/).filter(Boolean);
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = content.split(/<\/p>|<br\s*\/?>/).filter(p => p.replace(/<[^>]*>/g, '').trim().length > 0);
    const syllables = words.reduce((acc, w) => acc + countSyllables(w), 0);
    const avgWordsPerSentence = sentences.length ? words.length / sentences.length : 0;
    const avgSyllablesPerWord = words.length ? syllables / words.length : 0;

    // Flesch Reading Ease (adapted for Portuguese)
    const fleschScore = Math.max(0, Math.min(100,
      206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
    ));

    let readingLevel = 'Muito Difícil';
    if (fleschScore >= 90) readingLevel = 'Muito Fácil';
    else if (fleschScore >= 80) readingLevel = 'Fácil';
    else if (fleschScore >= 70) readingLevel = 'Razoavelmente Fácil';
    else if (fleschScore >= 60) readingLevel = 'Padrão';
    else if (fleschScore >= 50) readingLevel = 'Razoavelmente Difícil';
    else if (fleschScore >= 30) readingLevel = 'Difícil';

    return {
      words: words.length,
      characters: plainText.length,
      charactersNoSpaces: plainText.replace(/\s/g, '').length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      syllables,
      pages: Math.max(1, Math.ceil(words.length / 250)),
      readingTime: Math.max(1, Math.ceil(words.length / 200)),
      speakingTime: Math.max(1, Math.ceil(words.length / 130)),
      avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
      avgSyllablesPerWord: avgSyllablesPerWord.toFixed(1),
      fleschScore: fleschScore.toFixed(0),
      readingLevel,
      uniqueWords: new Set(words.map(w => w.toLowerCase())).size,
      longestWord: words.reduce((a, b) => a.length > b.length ? a : b, ''),
    };
  }, [text, plainText, content]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="text-sm">Estatísticas do Documento</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs">
          <StatRow label="Palavras" value={stats.words.toLocaleString()} />
          <StatRow label="Caracteres" value={stats.characters.toLocaleString()} />
          <StatRow label="Sem espaços" value={stats.charactersNoSpaces.toLocaleString()} />
          <StatRow label="Frases" value={stats.sentences.toLocaleString()} />
          <StatRow label="Parágrafos" value={stats.paragraphs.toLocaleString()} />
          <StatRow label="Sílabas" value={stats.syllables.toLocaleString()} />
          <StatRow label="Páginas" value={stats.pages.toString()} />
          <StatRow label="Palavras únicas" value={stats.uniqueWords.toLocaleString()} />
          <div className="col-span-2 border-t pt-2 mt-1" />
          <StatRow label="Tempo de leitura" value={`~${stats.readingTime} min`} />
          <StatRow label="Tempo de fala" value={`~${stats.speakingTime} min`} />
          <StatRow label="Méd. palavras/frase" value={stats.avgWordsPerSentence} />
          <StatRow label="Méd. sílabas/palavra" value={stats.avgSyllablesPerWord} />
          <div className="col-span-2 border-t pt-2 mt-1" />
          <StatRow label="Índice Flesch" value={stats.fleschScore} />
          <StatRow label="Nível" value={stats.readingLevel} />
          <StatRow label="Palavra mais longa" value={stats.longestWord} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </>
  );
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-záàâãéèêíïóôõúüç]/g, '');
  if (word.length <= 2) return 1;
  const vowels = word.match(/[aeiouáàâãéèêíïóôõúü]+/g);
  return vowels ? vowels.length : 1;
}
