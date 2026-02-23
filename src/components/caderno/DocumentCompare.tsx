import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitCompare, X } from "lucide-react";

interface DocOption {
  id: string;
  title: string;
  content: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  currentContent: string;
  currentTitle: string;
  documents: DocOption[];
}

function diffLines(a: string, b: string): { type: 'same' | 'add' | 'remove'; text: string }[] {
  const linesA = a.split('\n');
  const linesB = b.split('\n');
  const result: { type: 'same' | 'add' | 'remove'; text: string }[] = [];
  const max = Math.max(linesA.length, linesB.length);

  for (let i = 0; i < max; i++) {
    const lineA = linesA[i] ?? '';
    const lineB = linesB[i] ?? '';
    if (lineA === lineB) {
      result.push({ type: 'same', text: lineA });
    } else {
      if (lineA) result.push({ type: 'remove', text: lineA });
      if (lineB) result.push({ type: 'add', text: lineB });
    }
  }
  return result;
}

export function DocumentCompare({ open, onClose, currentContent, currentTitle, documents }: Props) {
  const [compareId, setCompareId] = useState('');

  const compareDoc = documents.find(d => d.id === compareId);

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();

  const diff = useMemo(() => {
    if (!compareDoc) return [];
    return diffLines(stripHtml(currentContent), stripHtml(compareDoc.content));
  }, [currentContent, compareDoc]);

  const stats = useMemo(() => {
    const added = diff.filter(d => d.type === 'add').length;
    const removed = diff.filter(d => d.type === 'remove').length;
    return { added, removed };
  }, [diff]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <GitCompare className="h-4 w-4" /> Comparar Documentos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Documento atual:</span>
            <span className="text-xs font-medium">{currentTitle || 'Sem título'}</span>
            <span className="text-[10px] text-muted-foreground ml-4">Comparar com:</span>
            <Select value={compareId} onValueChange={setCompareId}>
              <SelectTrigger className="h-7 text-[10px] w-48"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {documents.map(d => (
                  <SelectItem key={d.id} value={d.id} className="text-[10px]">{d.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {compareDoc && (
            <>
              <div className="flex gap-3 text-[10px]">
                <span className="text-green-600">+{stats.added} linhas adicionadas</span>
                <span className="text-destructive">−{stats.removed} linhas removidas</span>
              </div>

              <ScrollArea className="h-[400px] border rounded-md">
                <div className="p-3 font-mono text-[10px] space-y-0.5">
                  {diff.map((line, i) => (
                    <div key={i} className={`px-2 py-0.5 rounded-sm ${
                      line.type === 'add' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                      line.type === 'remove' ? 'bg-destructive/10 text-destructive line-through' :
                      'text-muted-foreground'
                    }`}>
                      <span className="select-none mr-2 text-muted-foreground/50">
                        {line.type === 'add' ? '+' : line.type === 'remove' ? '−' : ' '}
                      </span>
                      {line.text || ' '}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}

          {!compareDoc && documents.length === 0 && (
            <p className="text-xs text-muted-foreground py-4 text-center">Nenhum outro documento salvo para comparar.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
