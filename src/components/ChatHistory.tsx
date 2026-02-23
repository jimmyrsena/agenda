import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  History, MessageSquare, Trash2, Clock, ChevronLeft, ChevronRight,
  Search, Loader2, Pencil, Check, X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/types/study";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface SavedConversation {
  id: string;
  user_name: string;
  title: string | null;
  messages: ChatMessage[];
  created_at: string;
}

interface ChatHistoryProps {
  onLoadConversation: (messages: ChatMessage[]) => void;
  onClearMemories?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function ChatHistory({ onLoadConversation, onClearMemories, isCollapsed, onToggleCollapse }: ChatHistoryProps) {
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("mentor_conversations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
    } else {
      setConversations((data || []).map((c: any) => ({
        ...c,
        messages: (c.messages || []) as ChatMessage[],
      })));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase.from("mentor_conversations").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir conversa");
    } else {
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeId === id) setActiveId(null);
      onClearMemories?.();
      toast.success("Conversa excluída");
    }
  };

  const handleLoad = (conv: SavedConversation) => {
    setActiveId(conv.id);
    onLoadConversation(conv.messages);
    toast.success("Conversa carregada!");
  };

  const startEditing = (conv: SavedConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title || "");
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditTitle("");
  };

  const saveTitle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const trimmed = editTitle.trim();
    if (!trimmed) return;
    const { error } = await supabase.from("mentor_conversations").update({ title: trimmed }).eq("id", id);
    if (error) {
      toast.error("Erro ao salvar título");
    } else {
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: trimmed } : c));
      toast.success("Título atualizado");
    }
    setEditingId(null);
    setEditTitle("");
  };

  const filtered = search.trim()
    ? conversations.filter(c =>
        (c.title || "").toLowerCase().includes(search.toLowerCase()) ||
        c.messages.some(m => m.content.toLowerCase().includes(search.toLowerCase()))
      )
    : conversations;

  // Group by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: { label: string; items: SavedConversation[] }[] = [];
  const todayItems = filtered.filter(c => new Date(c.created_at) >= today);
  const yesterdayItems = filtered.filter(c => { const d = new Date(c.created_at); return d >= yesterday && d < today; });
  const weekItems = filtered.filter(c => { const d = new Date(c.created_at); return d >= weekAgo && d < yesterday; });
  const olderItems = filtered.filter(c => new Date(c.created_at) < weekAgo);

  if (todayItems.length) groups.push({ label: "Hoje", items: todayItems });
  if (yesterdayItems.length) groups.push({ label: "Ontem", items: yesterdayItems });
  if (weekItems.length) groups.push({ label: "Últimos 7 dias", items: weekItems });
  if (olderItems.length) groups.push({ label: "Mais antigas", items: olderItems });

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center py-3 gap-2 border-r bg-card h-full">
        <Button variant="ghost" size="icon" onClick={onToggleCollapse} title="Expandir histórico" className="mb-2">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <History className="h-4 w-4 text-primary" />
        </div>
        {conversations.length > 0 && (
          <Badge variant="secondary" className="text-[10px] px-1.5">{conversations.length}</Badge>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r bg-card w-[260px] shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b">
        <History className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-semibold flex-1">Histórico</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleCollapse} title="Recolher">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar conversas..."
            className="h-8 text-xs pl-8"
          />
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              {search ? "Nenhuma conversa encontrada" : "Nenhuma conversa salva ainda"}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              {!search && "Use o botão 💾 no chat para salvar"}
            </p>
          </div>
        ) : (
          <div className="px-2 pb-3 space-y-3">
            {groups.map(group => (
              <div key={group.label}>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => editingId !== conv.id && handleLoad(conv)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors group flex items-start gap-2 ${
                        activeId === conv.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent"
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-60" />
                      <div className="flex-1 min-w-0">
                        {editingId === conv.id ? (
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <Input
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              className="h-6 text-xs px-1.5"
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveTitle(conv.id, e as any);
                                if (e.key === 'Escape') { setEditingId(null); setEditTitle(""); }
                              }}
                            />
                            <button onClick={(e) => saveTitle(conv.id, e)} className="p-0.5 hover:text-primary">
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={cancelEditing} className="p-0.5 hover:text-destructive">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="truncate font-medium leading-tight">
                              {conv.title || "Conversa sem título"}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {formatDistanceToNow(new Date(conv.created_at), { addSuffix: true, locale: ptBR })}
                            </p>
                          </>
                        )}
                      </div>
                      {editingId !== conv.id && (
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-60 transition-opacity">
                          <button
                            onClick={(e) => startEditing(conv, e)}
                            className="p-0.5 hover:!opacity-100 hover:text-primary"
                            title="Editar título"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(conv.id, e)}
                            className="p-0.5 hover:!opacity-100 hover:text-destructive"
                            title="Excluir conversa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="px-3 py-2 border-t">
        <Button variant="ghost" size="sm" className="w-full text-xs gap-1.5 h-8" onClick={fetchConversations}>
          <Loader2 className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
    </div>
  );
}
