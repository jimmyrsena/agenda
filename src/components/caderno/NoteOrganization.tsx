import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Note, ENEM_AREAS } from "@/types/study";
import { FolderTree, Hash, Link2, Layers, Star, TrendingUp, Search } from "lucide-react";
import { format } from "date-fns";

interface Props {
  notes: Note[];
  onEditNote: (note: Note) => void;
  onMoveToFolder: (noteId: string, folder: string) => void;
}

interface NoteLink {
  from: string;
  to: string;
  label: string;
}

export function NoteOrganization({ notes, onEditNote, onMoveToFolder }: Props) {
  const [tab, setTab] = useState<'folders' | 'links' | 'collections'>('folders');
  const [folderInput, setFolderInput] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [linkSearch, setLinkSearch] = useState('');

  // Detect [[wikilinks]] in content
  const links = useMemo<NoteLink[]>(() => {
    const result: NoteLink[] = [];
    notes.forEach(note => {
      const matches = note.content.match(/\[\[([^\]]+)\]\]/g);
      if (matches) {
        matches.forEach(m => {
          const linked = m.slice(2, -2);
          const target = notes.find(n => n.title.toLowerCase() === linked.toLowerCase());
          if (target) {
            result.push({ from: note.id, to: target.id, label: linked });
          }
        });
      }
    });
    return result;
  }, [notes]);

  // Folder tree
  const folderTree = useMemo(() => {
    const tree: Record<string, Note[]> = { '(Sem pasta)': [] };
    notes.forEach(n => {
      const folder = n.folder || '(Sem pasta)';
      if (!tree[folder]) tree[folder] = [];
      tree[folder].push(n);
    });
    return tree;
  }, [notes]);

  // Collections (auto-grouped by area + recent edits)
  const collections = useMemo(() => {
    const byArea: Record<string, Note[]> = {};
    notes.forEach(n => {
      if (!byArea[n.area]) byArea[n.area] = [];
      byArea[n.area].push(n);
    });
    return byArea;
  }, [notes]);

  // Backlinks for a note
  const getBacklinks = (noteId: string) => links.filter(l => l.to === noteId);
  const getForwardlinks = (noteId: string) => links.filter(l => l.from === noteId);

  // Smart favorites (notes not reviewed in 7+ days)
  const smartFavorites = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return notes
      .filter(n => new Date(n.updatedAt) < sevenDaysAgo && n.content.length > 100)
      .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
      .slice(0, 8);
  }, [notes]);

  return (
    <div className="space-y-3">
      {/* Tab buttons */}
      <div className="flex gap-1 flex-wrap">
        {[
          { id: 'folders' as const, icon: FolderTree, label: 'Pastas' },
          { id: 'links' as const, icon: Link2, label: `Links (${links.length})` },
          { id: 'collections' as const, icon: Layers, label: 'Coleções' },
        ].map(t => (
          <Button key={t.id} size="sm" variant={tab === t.id ? 'default' : 'outline'} className="h-7 text-[10px] gap-1"
            onClick={() => setTab(t.id)}>
            <t.icon className="h-3 w-3" />{t.label}
          </Button>
        ))}
      </div>

      {/* Smart favorites */}
      {smartFavorites.length > 0 && (
        <Card className="border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-1 mb-2">
              <TrendingUp className="h-3 w-3 text-primary" />
              <p className="text-[10px] font-semibold">Revisão Inteligente</p>
              <Badge variant="outline" className="text-[8px] ml-auto">Spaced Repetition</Badge>
            </div>
            <div className="flex gap-1 flex-wrap">
              {smartFavorites.map(n => (
                <Button key={n.id} size="sm" variant="ghost" className="h-6 text-[9px] gap-0.5 px-1.5"
                  onClick={() => onEditNote(n)}>
                  📝 {n.title.slice(0, 20)}{n.title.length > 20 ? '...' : ''}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Folders */}
      {tab === 'folders' && (
        <div className="space-y-2">
          {Object.entries(folderTree).sort(([a], [b]) => a.localeCompare(b)).map(([folder, folderNotes]) => (
            <Card key={folder} className="overflow-hidden">
              <button className="w-full flex items-center gap-2 p-2.5 hover:bg-muted/50 text-left"
                onClick={() => setSelectedFolder(selectedFolder === folder ? null : folder)}>
                <FolderTree className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-xs font-medium flex-1">{folder}</span>
                <Badge variant="outline" className="text-[9px]">{folderNotes.length}</Badge>
              </button>
              {selectedFolder === folder && (
                <div className="border-t px-2 pb-2 space-y-0.5">
                  {folderNotes.map(n => (
                    <button key={n.id} className="w-full flex items-center gap-1.5 p-1.5 rounded hover:bg-muted/50 text-left"
                      onClick={() => onEditNote(n)}>
                      <Badge className={`text-[7px] ${ENEM_AREAS[n.area].color} text-white border-0 h-3.5 px-1`}>
                        {ENEM_AREAS[n.area].label.slice(0, 3)}
                      </Badge>
                      <span className="text-xs truncate flex-1">{n.title}</span>
                      <span className="text-[9px] text-muted-foreground">{format(new Date(n.updatedAt), 'dd/MM')}</span>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Links / Graph */}
      {tab === 'links' && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input value={linkSearch} onChange={e => setLinkSearch(e.target.value)}
              placeholder="Buscar nota para ver links..." className="h-7 text-xs pl-7" />
          </div>
          <p className="text-[9px] text-muted-foreground">Use <code className="bg-muted px-1 rounded">[[nome da nota]]</code> no conteúdo para criar links</p>

          {notes.filter(n => !linkSearch || n.title.toLowerCase().includes(linkSearch.toLowerCase())).slice(0, 15).map(note => {
            const back = getBacklinks(note.id);
            const forward = getForwardlinks(note.id);
            if (back.length === 0 && forward.length === 0 && linkSearch) return null;
            return (
              <Card key={note.id} className="overflow-hidden">
                <button className="w-full flex items-center gap-2 p-2 hover:bg-muted/50 text-left" onClick={() => onEditNote(note)}>
                  <span className="text-xs font-medium flex-1 truncate">{note.title}</span>
                  {forward.length > 0 && <Badge variant="outline" className="text-[8px]">→ {forward.length}</Badge>}
                  {back.length > 0 && <Badge variant="outline" className="text-[8px]">← {back.length}</Badge>}
                </button>
                {(back.length > 0 || forward.length > 0) && (
                  <div className="border-t px-2 py-1.5 space-y-0.5">
                    {forward.map((l, i) => {
                      const target = notes.find(n => n.id === l.to);
                      return target ? (
                        <button key={`f-${i}`} className="flex items-center gap-1 text-[10px] text-primary hover:underline" onClick={() => onEditNote(target)}>
                          → {target.title}
                        </button>
                      ) : null;
                    })}
                    {back.map((l, i) => {
                      const source = notes.find(n => n.id === l.from);
                      return source ? (
                        <button key={`b-${i}`} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:underline" onClick={() => onEditNote(source)}>
                          ← {source.title}
                        </button>
                      ) : null;
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Collections by area */}
      {tab === 'collections' && (
        <div className="space-y-2">
          {Object.entries(collections).map(([area, areaNotes]) => (
            <Card key={area} className="overflow-hidden">
              <div className="flex items-center gap-2 p-2.5">
                <Badge className={`text-[9px] ${ENEM_AREAS[area as keyof typeof ENEM_AREAS]?.color || 'bg-muted'} text-white border-0`}>
                  {ENEM_AREAS[area as keyof typeof ENEM_AREAS]?.label || area}
                </Badge>
                <span className="text-xs font-medium flex-1">{areaNotes.length} nota(s)</span>
                <span className="text-[9px] text-muted-foreground">
                  {areaNotes.reduce((a, n) => a + n.content.split(/\s+/).filter(Boolean).length, 0).toLocaleString()}w
                </span>
              </div>
              <div className="border-t px-2 pb-2 space-y-0.5 max-h-[150px] overflow-y-auto">
                {areaNotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(n => (
                  <button key={n.id} className="w-full flex items-center gap-1.5 p-1.5 rounded hover:bg-muted/50 text-left"
                    onClick={() => onEditNote(n)}>
                    {n.favorite && <Star className="h-2.5 w-2.5 text-[hsl(var(--ms-orange))]" fill="currentColor" />}
                    <span className="text-xs truncate flex-1">{n.title}</span>
                    <span className="text-[9px] text-muted-foreground">{n.content.split(/\s+/).filter(Boolean).length}w</span>
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
