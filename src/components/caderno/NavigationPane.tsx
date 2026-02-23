import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, FileText, Bookmark, ChevronRight, ChevronDown } from "lucide-react";

interface Props {
  content: string;
  onClose: () => void;
  onScrollToHeading?: (text: string) => void;
  pageCount: number;
  bookmarks?: { id: string; name: string; position: number }[];
}

type NavTab = 'headings' | 'pages' | 'search' | 'bookmarks';

export function NavigationPane({ content, onClose, onScrollToHeading, pageCount, bookmarks = [] }: Props) {
  const [tab, setTab] = useState<NavTab>('headings');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({});

  const headings = useMemo(() => {
    const matches = content.match(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi) || [];
    return matches.map((h, i) => {
      const level = parseInt(h.charAt(2));
      const text = h.replace(/<[^>]*>/g, '');
      return { id: i, level, text };
    });
  }, [content]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const plainText = content.replace(/<[^>]*>/g, '');
    const results: { text: string; position: number }[] = [];
    const query = searchQuery.toLowerCase();
    let pos = 0;
    while (pos < plainText.length) {
      const idx = plainText.toLowerCase().indexOf(query, pos);
      if (idx === -1) break;
      const start = Math.max(0, idx - 30);
      const end = Math.min(plainText.length, idx + query.length + 30);
      results.push({
        text: (start > 0 ? '...' : '') + plainText.slice(start, end) + (end < plainText.length ? '...' : ''),
        position: idx,
      });
      pos = idx + 1;
    }
    return results;
  }, [content, searchQuery]);

  const tabs: { id: NavTab; label: string; icon: typeof FileText }[] = [
    { id: 'headings', label: 'Títulos', icon: FileText },
    { id: 'pages', label: 'Páginas', icon: FileText },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'bookmarks', label: 'Marcadores', icon: Bookmark },
  ];

  return (
    <div className="w-56 bg-card border-r flex flex-col h-full shrink-0 animate-in slide-in-from-left-4 duration-200">
      <div className="flex items-center justify-between px-2 py-1.5 border-b">
        <h3 className="text-[10px] font-semibold">Navegação</h3>
        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={onClose}><X className="h-3 w-3" /></Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-1 text-[9px] font-medium transition-colors ${tab === t.id ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {/* Headings */}
        {tab === 'headings' && (
          <div className="space-y-0.5">
            {headings.length === 0 && <p className="text-[10px] text-muted-foreground py-4 text-center">Nenhum título encontrado</p>}
            {headings.map(h => (
              <button key={h.id}
                onClick={() => onScrollToHeading?.(h.text)}
                className={`block w-full text-left py-0.5 px-1 rounded text-[10px] hover:bg-accent truncate transition-colors
                  ${h.level === 1 ? 'font-bold' : h.level === 2 ? 'pl-3 font-semibold' : h.level === 3 ? 'pl-5 font-medium' : 'pl-7 text-muted-foreground'}`}>
                {h.text}
              </button>
            ))}
          </div>
        )}

        {/* Pages */}
        {tab === 'pages' && (
          <div className="grid grid-cols-2 gap-1">
            {Array.from({ length: pageCount }, (_, i) => (
              <div key={i} className="aspect-[3/4] border rounded bg-card shadow-sm flex items-center justify-center text-[10px] text-muted-foreground hover:ring-1 ring-primary cursor-pointer">
                Pág {i + 1}
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        {tab === 'search' && (
          <div className="space-y-2">
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar no documento..."
              className="h-7 text-xs" autoFocus />
            {searchResults.length > 0 && (
              <p className="text-[9px] text-muted-foreground">{searchResults.length} resultado(s)</p>
            )}
            {searchResults.map((r, i) => (
              <div key={i} className="text-[10px] py-1 px-1 rounded hover:bg-accent cursor-pointer border-b border-border/30">
                {r.text}
              </div>
            ))}
          </div>
        )}

        {/* Bookmarks */}
        {tab === 'bookmarks' && (
          <div className="space-y-1">
            {bookmarks.length === 0 && <p className="text-[10px] text-muted-foreground py-4 text-center">Nenhum marcador</p>}
            {bookmarks.map(b => (
              <div key={b.id} className="flex items-center gap-1 text-[10px] py-0.5 px-1 hover:bg-accent rounded cursor-pointer">
                <Bookmark className="h-3 w-3 text-primary" />
                {b.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
