import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Note } from "@/types/study";

interface Props {
  notes: Note[];
  writingLog: { date: string; words: number }[];
  totalXP: number;
}

interface WriterBadge {
  id: string;
  icon: string;
  title: string;
  desc: string;
  condition: (stats: WriterStats) => boolean;
}

interface WriterStats {
  totalNotes: number;
  totalWords: number;
  streak: number;
  longestNote: number;
  areas: number;
  favorites: number;
}

const WRITER_LEVEL = [
  { level: 1, words: 0, title: '✏️ Novato' },
  { level: 2, words: 500, title: '📝 Aprendiz' },
  { level: 3, words: 1500, title: '📖 Escritor' },
  { level: 4, words: 3000, title: '📚 Autor' },
  { level: 5, words: 5000, title: '🎓 Mestre' },
  { level: 6, words: 8000, title: '🏆 Legendário' },
  { level: 7, words: 12000, title: '💎 Enciclopédia' },
];

const WRITER_BADGES: WriterBadge[] = [
  { id: 'first_note', icon: '📝', title: 'Primeiro Rascunho', desc: 'Criar primeira nota', condition: s => s.totalNotes >= 1 },
  { id: 'notes_10', icon: '📚', title: 'Colecionador', desc: '10 notas criadas', condition: s => s.totalNotes >= 10 },
  { id: 'notes_50', icon: '📖', title: 'Biblioteca', desc: '50 notas criadas', condition: s => s.totalNotes >= 50 },
  { id: 'words_1000', icon: '✍️', title: 'Mil Palavras', desc: '1.000 palavras escritas', condition: s => s.totalWords >= 1000 },
  { id: 'words_5000', icon: '📜', title: 'Maratonista', desc: '5.000 palavras escritas', condition: s => s.totalWords >= 5000 },
  { id: 'words_10000', icon: '🏅', title: 'Romancista', desc: '10.000 palavras escritas', condition: s => s.totalWords >= 10000 },
  { id: 'streak_3', icon: '🔥', title: 'Em Chamas', desc: '3 dias seguidos escrevendo', condition: s => s.streak >= 3 },
  { id: 'streak_7', icon: '⚡', title: 'Imbatível', desc: '7 dias seguidos', condition: s => s.streak >= 7 },
  { id: 'all_areas', icon: '🌍', title: 'Polímata', desc: 'Notas em todas as 5 áreas', condition: s => s.areas >= 5 },
  { id: 'long_note', icon: '📃', title: 'Dissertador', desc: 'Uma nota com 500+ palavras', condition: s => s.longestNote >= 500 },
  { id: 'favorites_5', icon: '⭐', title: 'Curador', desc: '5 notas favoritas', condition: s => s.favorites >= 5 },
];

export function NoteGamification({ notes, writingLog, totalXP }: Props) {
  const stats = useMemo<WriterStats>(() => {
    const totalWords = notes.reduce((a, n) => a + n.content.split(/\s+/).filter(Boolean).length, 0);
    const areas = new Set(notes.map(n => n.area)).size;
    const longestNote = Math.max(0, ...notes.map(n => n.content.split(/\s+/).filter(Boolean).length));
    const favorites = notes.filter(n => n.favorite).length;

    // Calculate streak
    const now = new Date();
    const days = new Set(writingLog.filter(w => w.words > 0).map(w => w.date));
    const sortedDays = [...days].sort().reverse();
    const today = now.toISOString().slice(0, 10);
    let streak = 0;
    if (sortedDays[0] === today || sortedDays[0] === getYesterday()) {
      streak = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        const prev = new Date(sortedDays[i - 1]);
        const curr = new Date(sortedDays[i]);
        const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
        if (Math.round(diff) === 1) streak++;
        else break;
      }
    }

    return { totalNotes: notes.length, totalWords, streak, longestNote, areas, favorites };
  }, [notes, writingLog]);

  const currentLevel = [...WRITER_LEVEL].reverse().find(l => stats.totalWords >= l.words) || WRITER_LEVEL[0];
  const nextLevel = WRITER_LEVEL.find(l => l.words > stats.totalWords);
  const progress = nextLevel ? ((stats.totalWords - currentLevel.words) / (nextLevel.words - currentLevel.words)) * 100 : 100;

  const unlockedBadges = WRITER_BADGES.filter(b => b.condition(stats));
  const lockedBadges = WRITER_BADGES.filter(b => !b.condition(stats));

  return (
    <div className="space-y-3">
      {/* Writer level */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-bold">{currentLevel.title}</p>
              <p className="text-[10px] text-muted-foreground">Nível {currentLevel.level} de Escrita</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{stats.totalWords.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">palavras</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          {nextLevel && (
            <p className="text-[9px] text-muted-foreground mt-1">
              {nextLevel.words - stats.totalWords} palavras para {nextLevel.title}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Notas', value: stats.totalNotes, icon: '📝' },
          { label: 'Streak', value: `${stats.streak}🔥`, icon: '' },
          { label: 'Áreas', value: `${stats.areas}/5`, icon: '' },
          { label: 'Conquistas', value: `${unlockedBadges.length}/${WRITER_BADGES.length}`, icon: '' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-2 text-center">
              <p className="text-base font-bold">{s.icon}{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Badges */}
      <Card>
        <CardContent className="p-3">
          <p className="text-xs font-semibold mb-2">🏆 Conquistas de Escrita</p>
          <div className="grid grid-cols-2 gap-1.5">
            {unlockedBadges.map(b => (
              <div key={b.id} className="flex items-center gap-2 p-1.5 rounded-md bg-primary/5 border border-primary/20">
                <span className="text-lg">{b.icon}</span>
                <div>
                  <p className="text-[10px] font-medium">{b.title}</p>
                  <p className="text-[8px] text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
            {lockedBadges.map(b => (
              <div key={b.id} className="flex items-center gap-2 p-1.5 rounded-md bg-muted/50 opacity-40">
                <span className="text-lg grayscale">🔒</span>
                <div>
                  <p className="text-[10px] font-medium">{b.title}</p>
                  <p className="text-[8px] text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Annual heatmap */}
      <Card>
        <CardContent className="p-3">
          <p className="text-xs font-semibold mb-2">📅 Heatmap Anual</p>
          <div className="flex gap-[2px] flex-wrap">
            {Array.from({ length: 90 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (89 - i));
              const key = d.toISOString().slice(0, 10);
              const entry = writingLog.find(w => w.date === key);
              const words = entry?.words || 0;
              const intensity = words === 0 ? 0 : words < 50 ? 1 : words < 150 ? 2 : words < 300 ? 3 : 4;
              const colors = ['bg-muted', 'bg-primary/20', 'bg-primary/40', 'bg-primary/70', 'bg-primary'];
              return (
                <div key={key} className={`w-[10px] h-[10px] rounded-[1px] ${colors[intensity]}`}
                  title={`${key}: ${words} palavras`} />
              );
            })}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[8px] text-muted-foreground">Menos</span>
            {['bg-muted', 'bg-primary/20', 'bg-primary/40', 'bg-primary/70', 'bg-primary'].map(c => (
              <div key={c} className={`w-[8px] h-[8px] rounded-[1px] ${c}`} />
            ))}
            <span className="text-[8px] text-muted-foreground">Mais</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
