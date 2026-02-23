import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Volume2, VolumeX, X, Clock, Music } from "lucide-react";

interface Props {
  content: string;
  onChange: (content: string) => void;
  title: string;
  wordCount: number;
  onExit: () => void;
}

const AMBIENT_SOUNDS = [
  { id: 'none', label: 'Silêncio', icon: '🔇' },
  { id: 'rain', label: 'Chuva', icon: '🌧️' },
  { id: 'fire', label: 'Lareira', icon: '🔥' },
  { id: 'waves', label: 'Ondas', icon: '🌊' },
  { id: 'forest', label: 'Floresta', icon: '🌲' },
  { id: 'cafe', label: 'Cafeteria', icon: '☕' },
];

export function NoteZenMode({ content, onChange, title, wordCount, onExit }: Props) {
  const [sound, setSound] = useState('none');
  const [showUI, setShowUI] = useState(true);
  const [sessionWords, setSessionWords] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const initialWords = useRef(wordCount);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  // Track session time
  useEffect(() => {
    const interval = setInterval(() => setSessionTime(p => p + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Track words written in session
  useEffect(() => {
    setSessionWords(Math.max(0, wordCount - initialWords.current));
  }, [wordCount]);

  // Auto-hide UI
  useEffect(() => {
    const resetHide = () => {
      setShowUI(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setShowUI(false), 4000);
    };
    window.addEventListener('mousemove', resetHide);
    resetHide();
    return () => {
      window.removeEventListener('mousemove', resetHide);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  // Escape to exit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onExit]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top bar - fades */}
      <div className={`flex items-center justify-between px-6 py-3 transition-opacity duration-500 ${showUI ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatTime(sessionTime)}</span>
          <span>•</span>
          <span>+{sessionWords} palavras</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Sound selector */}
          <div className="flex items-center gap-1">
            <Music className="h-3 w-3 text-muted-foreground" />
            {AMBIENT_SOUNDS.map(s => (
              <button key={s.id} onClick={() => setSound(s.id)}
                className={`text-sm px-1 rounded transition-all ${sound === s.id ? 'bg-primary/20 scale-110' : 'opacity-50 hover:opacity-100'}`}
                title={s.label}>
                {s.icon}
              </button>
            ))}
          </div>
          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={onExit}>
            <X className="h-3 w-3" /> Sair
          </Button>
        </div>
      </div>

      {/* Writing area */}
      <div className="flex-1 flex items-start justify-center overflow-y-auto px-4 pt-8 pb-20">
        <div className="w-full max-w-[680px]">
          <h1 className={`text-2xl font-serif font-bold mb-6 text-center transition-opacity duration-500 ${showUI ? 'opacity-60' : 'opacity-20'}`}>
            {title || 'Sem título'}
          </h1>
          <Textarea
            value={content}
            onChange={e => onChange(e.target.value)}
            className="min-h-[60vh] border-0 shadow-none focus-visible:ring-0 resize-none text-base font-serif leading-[2] bg-transparent"
            placeholder="Apenas escreva..."
            autoFocus
          />
        </div>
      </div>

      {/* Bottom stats - fades */}
      <div className={`text-center py-2 text-[10px] text-muted-foreground transition-opacity duration-500 ${showUI ? 'opacity-60' : 'opacity-0'}`}>
        {wordCount} palavras • Pressione Esc para sair
      </div>
    </div>
  );
}
