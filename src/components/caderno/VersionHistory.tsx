import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { History, RotateCcw, Eye, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export interface VersionSnapshot {
  id: string;
  timestamp: string;
  title: string;
  content: string;
  wordCount: number;
  label?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  versions: VersionSnapshot[];
  currentContent: string;
  onRestore: (content: string) => void;
}

export function VersionHistory({ open, onClose, versions, currentContent, onRestore }: Props) {
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  const diffSummary = (v: VersionSnapshot) => {
    const currentWords = currentContent.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
    const diff = v.wordCount - currentWords;
    if (diff > 0) return `+${diff} palavras`;
    if (diff < 0) return `${diff} palavras`;
    return 'Sem alteração';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4" /> Histórico de Versões
          </DialogTitle>
        </DialogHeader>

        {versions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            Nenhuma versão salva ainda. Versões são criadas automaticamente ao salvar.
          </p>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-2">
              {versions.map((v, i) => (
                <div key={v.id} className={`border rounded-lg p-3 transition-colors ${previewIdx === i ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">{format(new Date(v.timestamp), 'dd/MM/yyyy HH:mm')}</span>
                      {v.label && <Badge variant="outline" className="text-[8px] h-4">{v.label}</Badge>}
                      {i === 0 && <Badge className="text-[8px] h-4 bg-primary">Mais recente</Badge>}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{v.wordCount} palavras</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">{diffSummary(v)}</p>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1"
                      onClick={() => setPreviewIdx(previewIdx === i ? null : i)}>
                      <Eye className="h-3 w-3" /> {previewIdx === i ? 'Ocultar' : 'Pré-visualizar'}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 text-primary"
                      onClick={() => { onRestore(v.content); toast.success('Versão restaurada!'); onClose(); }}>
                      <RotateCcw className="h-3 w-3" /> Restaurar
                    </Button>
                  </div>
                  {previewIdx === i && (
                    <div className="mt-2 border-t pt-2">
                      <div className="prose prose-sm max-w-none dark:prose-invert text-[10px] max-h-[200px] overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: v.content }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
