import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Note, ENEM_AREAS } from "@/types/study";
import { Search, X, FileText, Clock, Star, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onClose: () => void;
  notes: Note[];
  onEditNote: (note: Note) => void;
  onNewNote: () => void;
}

export function NoteCommandPalette({ open, onClose, notes, onEditNote, onNewNote }: Props) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = useMemo(() => {
    if (!query.trim()) {
      // Show recent + favorites
      const favs = notes.filter(n => n.favorite).slice(0, 3);
      const recent = notes.filter(n => !n.favorite).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
      return [...favs, ...recent];
    }
    const q = query.toLowerCase();
    return notes.filter(n =>
      n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.folder?.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [notes, query]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(p => Math.min(p + 1, results.length)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(p => Math.max(p - 1, 0)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex === results.length) { onNewNote(); onClose(); }
      else if (results[selectedIndex]) { onEditNote(results[selectedIndex]); onClose(); }
    }
  }, [open, results, selectedIndex, onClose, onEditNote, onNewNote]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => { if (open) setQuery(''); }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <Card className="relative w-full max-w-lg mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <CardContent className="p-0">
          <div className="flex items-center gap-2 p-3 border-b">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar notas, comandos..."
              className="border-0 shadow-none h-8 focus-visible:ring-0 px-0"
              autoFocus
            />
            <Badge variant="outline" className="text-[9px] shrink-0">Esc</Badge>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1.5">
            {results.length === 0 && query && (
              <p className="text-xs text-muted-foreground text-center py-6">Nenhuma nota encontrada</p>
            )}
            {results.map((note, i) => (
              <button
                key={note.id}
                onClick={() => { onEditNote(note); onClose(); }}
                className={`w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors ${i === selectedIndex ? 'bg-accent' : 'hover:bg-muted/50'}`}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {note.favorite && <Star className="h-2.5 w-2.5 text-ms-orange" fill="currentColor" />}
                    <p className="text-sm font-medium truncate">{note.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge className={`text-[8px] ${ENEM_AREAS[note.area].color} text-white border-0 h-3.5 px-1`}>{ENEM_AREAS[note.area].label}</Badge>
                    {note.folder && <span className="text-[9px] text-muted-foreground">📁 {note.folder}</span>}
                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="h-2 w-2" />{format(new Date(note.updatedAt), 'dd/MM')}
                    </span>
                  </div>
                </div>
                {i === selectedIndex && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
              </button>
            ))}
            {/* New note option */}
            <button
              onClick={() => { onNewNote(); onClose(); }}
              className={`w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors ${selectedIndex === results.length ? 'bg-accent' : 'hover:bg-muted/50'}`}
              onMouseEnter={() => setSelectedIndex(results.length)}
            >
              <span className="text-sm">➕</span>
              <p className="text-sm text-primary font-medium">Criar nova nota{query ? `: "${query}"` : ''}</p>
            </button>
          </div>
          <div className="border-t px-3 py-1.5 flex items-center gap-3">
            <span className="text-[9px] text-muted-foreground">↑↓ navegar</span>
            <span className="text-[9px] text-muted-foreground">↵ abrir</span>
            <span className="text-[9px] text-muted-foreground">esc fechar</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
