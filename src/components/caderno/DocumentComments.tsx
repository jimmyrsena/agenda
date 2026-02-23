import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, MessageSquare, Reply, Trash2, Check } from "lucide-react";

export interface DocComment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  resolved: boolean;
  replies: { id: string; text: string; author: string; createdAt: string }[];
  selectedText?: string;
}

interface Props {
  comments: DocComment[];
  onAdd: (comment: Omit<DocComment, 'id' | 'createdAt' | 'resolved' | 'replies'>) => void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  onReply: (id: string, text: string) => void;
  onClose: () => void;
}

export function DocumentComments({ comments, onAdd, onResolve, onDelete, onReply, onClose }: Props) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showResolved, setShowResolved] = useState(false);

  const activeComments = comments.filter(c => showResolved || !c.resolved);

  return (
    <div className="w-64 bg-card border-l flex flex-col h-full shrink-0 animate-in slide-in-from-right-4 duration-200">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h3 className="text-xs font-semibold flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" /> Comentários ({comments.filter(c => !c.resolved).length})
        </h3>
        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={onClose}><X className="h-3 w-3" /></Button>
      </div>

      <div className="p-2 border-b">
        <div className="flex gap-1">
          <Input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Adicionar comentário..."
            className="h-7 text-xs flex-1" onKeyDown={e => {
              if (e.key === 'Enter' && newComment.trim()) {
                onAdd({ text: newComment.trim(), author: 'Você', selectedText: '' });
                setNewComment('');
              }
            }} />
          <Button size="sm" className="h-7 text-[10px] px-2" disabled={!newComment.trim()} onClick={() => {
            onAdd({ text: newComment.trim(), author: 'Você', selectedText: '' });
            setNewComment('');
          }}>+</Button>
        </div>
        <label className="flex items-center gap-1 mt-1 text-[9px] text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={showResolved} onChange={() => setShowResolved(p => !p)} className="w-2.5 h-2.5" />
          Mostrar resolvidos
        </label>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeComments.length === 0 && (
          <p className="text-[10px] text-muted-foreground text-center py-8">Nenhum comentário</p>
        )}
        {activeComments.map(c => (
          <div key={c.id} className={`border-b p-2 ${c.resolved ? 'opacity-50' : ''}`}>
            {c.selectedText && (
              <div className="text-[9px] bg-primary/10 text-primary rounded px-1.5 py-0.5 mb-1 italic truncate">
                "{c.selectedText}"
              </div>
            )}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium">{c.author}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex gap-0.5">
                <button onClick={() => onResolve(c.id)} className="h-4 w-4 rounded hover:bg-accent flex items-center justify-center" title="Resolver">
                  <Check className="h-2.5 w-2.5 text-green-500" />
                </button>
                <button onClick={() => onDelete(c.id)} className="h-4 w-4 rounded hover:bg-accent flex items-center justify-center" title="Excluir">
                  <Trash2 className="h-2.5 w-2.5 text-destructive" />
                </button>
              </div>
            </div>
            <p className="text-[10px] mt-1">{c.text}</p>

            {/* Replies */}
            {c.replies.map(r => (
              <div key={r.id} className="ml-3 mt-1.5 pl-2 border-l-2 border-border">
                <p className="text-[9px] font-medium">{r.author}</p>
                <p className="text-[9px]">{r.text}</p>
              </div>
            ))}

            {replyingTo === c.id ? (
              <div className="mt-1.5 flex gap-1">
                <Input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Responder..."
                  className="h-6 text-[9px] flex-1" autoFocus onKeyDown={e => {
                    if (e.key === 'Enter' && replyText.trim()) {
                      onReply(c.id, replyText.trim());
                      setReplyText(''); setReplyingTo(null);
                    }
                    if (e.key === 'Escape') setReplyingTo(null);
                  }} />
              </div>
            ) : (
              <button className="text-[9px] text-primary mt-1 flex items-center gap-0.5 hover:underline" onClick={() => setReplyingTo(c.id)}>
                <Reply className="h-2.5 w-2.5" /> Responder
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
