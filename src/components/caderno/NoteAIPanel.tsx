import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Sparkles, HelpCircle, Minimize2, BookOpen, Lightbulb,
  MessageSquare, Send, Brain, Zap, FileText, AlertTriangle,
  CheckCircle, GraduationCap, Languages, Wand2
} from "lucide-react";
import { Note } from "@/types/study";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-tools`;

interface Props {
  note: Note | null;
  onInsertContent: (text: string) => void;
  onGenerateFlashcards?: (cards: { question: string; answer: string; area: string; subject: string }[]) => void;
}

type AIAction = 'summarize' | 'questions' | 'explain' | 'expand' | 'simplify' | 'formalize' | 'correct' | 'gaps' | 'exercises' | 'redacao' | 'translate';

const ACTIONS: { id: AIAction; label: string; icon: any; desc: string; category: 'transform' | 'generate' | 'review' }[] = [
  { id: 'summarize', label: 'Resumo TL;DR', icon: Minimize2, desc: '3 níveis de resumo', category: 'transform' },
  { id: 'simplify', label: 'Simplificar', icon: Sparkles, desc: 'Reescrever mais simples', category: 'transform' },
  { id: 'expand', label: 'Expandir', icon: BookOpen, desc: 'Aprofundar conteúdo', category: 'transform' },
  { id: 'explain', label: 'ELI5', icon: Lightbulb, desc: 'Explique como se eu tivesse 5 anos', category: 'transform' },
  { id: 'formalize', label: 'Formalizar', icon: GraduationCap, desc: 'Tom acadêmico', category: 'transform' },
  { id: 'translate', label: 'Traduzir EN', icon: Languages, desc: 'Traduzir para inglês', category: 'transform' },
  { id: 'questions', label: 'Quiz ENEM', icon: HelpCircle, desc: '5 questões estilo ENEM', category: 'generate' },
  { id: 'exercises', label: 'Exercícios', icon: FileText, desc: 'Lista de exercícios', category: 'generate' },
  { id: 'redacao', label: 'Redação', icon: Wand2, desc: 'Rascunho de redação ENEM', category: 'generate' },
  { id: 'correct', label: 'Correção', icon: CheckCircle, desc: 'Correção gramatical', category: 'review' },
  { id: 'gaps', label: 'Lacunas', icon: AlertTriangle, desc: 'Detectar o que falta', category: 'review' },
];

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export function NoteAIPanel({ note, onInsertContent, onGenerateFlashcards }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [tab, setTab] = useState('actions');

  const callAI = useCallback(async (action: AIAction) => {
    if (!note) { toast.error('Selecione uma nota primeiro'); return; }
    if (!note.content.trim()) { toast.error('A nota está vazia'); return; }

    setLoading(action);
    setResult(null);
    setActiveAction(action);

    try {
      const resp = await fetch(TOOLS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'note-ai-action',
          data: { action, title: note.title, content: note.content.slice(0, 6000), area: note.area },
        }),
      });

      if (resp.status === 429) { toast.error('Muitas requisições. Aguarde.'); setLoading(null); return; }
      if (resp.status === 402) { toast.error('Créditos de IA esgotados.'); setLoading(null); return; }
      if (!resp.ok) throw new Error('Erro ao processar com IA');
      const data = await resp.json();
      setResult(data.result || 'Sem resultado');

      // Auto-generate flashcards if quiz action
      if (action === 'questions' && onGenerateFlashcards && data.result) {
        toast.info('💡 Use "Gerar Flashcards em Massa" para converter em cards!');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(null);
  }, [note, onGenerateFlashcards]);

  const generateBulkFlashcards = useCallback(async () => {
    if (!note) { toast.error('Selecione uma nota'); return; }
    setLoading('flashcards');
    try {
      const resp = await fetch(TOOLS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'generate-flashcards',
          data: { topic: note.title, area: note.area, count: 10, sourceText: note.content.slice(0, 4000) },
        }),
      });

      if (!resp.ok) throw new Error('Erro ao gerar flashcards');
      const data = await resp.json();
      if (data.flashcards && onGenerateFlashcards) {
        onGenerateFlashcards(data.flashcards);
        toast.success(`${data.flashcards.length} flashcards gerados! 🃏`);
      }
    } catch (e: any) { toast.error(e.message); }
    setLoading(null);
  }, [note, onGenerateFlashcards]);

  const sendChat = useCallback(async () => {
    if (!chatInput.trim() || !note) return;
    const userMsg: ChatMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const resp = await fetch(TOOLS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'note-ai-action',
          data: {
            action: 'chat',
            title: note.title,
            content: note.content.slice(0, 4000),
            area: note.area,
            chatQuestion: chatInput,
            chatHistory: chatMessages.slice(-6),
          },
        }),
      });

      if (!resp.ok) throw new Error('Erro no chat');
      const data = await resp.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.result || 'Sem resposta' }]);
    } catch (e: any) {
      toast.error(e.message);
    }
    setChatLoading(false);
  }, [chatInput, note, chatMessages]);

  return (
    <div className="space-y-2">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold">IA do Caderno</span>
          <TabsList className="h-7 ml-auto">
            <TabsTrigger value="actions" className="text-[10px] h-5 px-2">
              <Zap className="h-3 w-3 mr-0.5" />Ações
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-[10px] h-5 px-2">
              <MessageSquare className="h-3 w-3 mr-0.5" />Chat
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="actions" className="mt-2 space-y-2">
          {/* Transform actions */}
          <div>
            <p className="text-[9px] text-muted-foreground font-medium mb-1">TRANSFORMAR</p>
            <div className="flex items-center gap-1 flex-wrap">
              {ACTIONS.filter(a => a.category === 'transform').map(a => (
                <Button key={a.id} size="sm" variant="outline" className="h-6 text-[9px] gap-0.5 px-1.5"
                  onClick={() => callAI(a.id)} disabled={!!loading || !note} title={a.desc}>
                  {loading === a.id ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <a.icon className="h-2.5 w-2.5" />}
                  {a.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Generate actions */}
          <div>
            <p className="text-[9px] text-muted-foreground font-medium mb-1">GERAR</p>
            <div className="flex items-center gap-1 flex-wrap">
              {ACTIONS.filter(a => a.category === 'generate').map(a => (
                <Button key={a.id} size="sm" variant="outline" className="h-6 text-[9px] gap-0.5 px-1.5"
                  onClick={() => callAI(a.id)} disabled={!!loading || !note} title={a.desc}>
                  {loading === a.id ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <a.icon className="h-2.5 w-2.5" />}
                  {a.label}
                </Button>
              ))}
              <Button size="sm" variant="outline" className="h-6 text-[9px] gap-0.5 px-1.5 border-primary/30 text-primary"
                onClick={generateBulkFlashcards} disabled={!!loading || !note} title="Gerar 10 flashcards da nota">
                {loading === 'flashcards' ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Brain className="h-2.5 w-2.5" />}
                Flashcards em Massa
              </Button>
            </div>
          </div>

          {/* Review actions */}
          <div>
            <p className="text-[9px] text-muted-foreground font-medium mb-1">REVISAR</p>
            <div className="flex items-center gap-1 flex-wrap">
              {ACTIONS.filter(a => a.category === 'review').map(a => (
                <Button key={a.id} size="sm" variant="outline" className="h-6 text-[9px] gap-0.5 px-1.5"
                  onClick={() => callAI(a.id)} disabled={!!loading || !note} title={a.desc}>
                  {loading === a.id ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <a.icon className="h-2.5 w-2.5" />}
                  {a.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Result display */}
          {result && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[9px]">🤖 {ACTIONS.find(a => a.id === activeAction)?.label || 'IA'}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-5 text-[9px] px-1.5" onClick={() => onInsertContent('\n\n---\n\n' + result)}>
                      📝 Inserir
                    </Button>
                    <Button size="sm" variant="ghost" className="h-5 text-[9px] px-1.5" onClick={() => { navigator.clipboard.writeText(result); toast.success('Copiado!'); }}>
                      📋 Copiar
                    </Button>
                    <Button size="sm" variant="ghost" className="h-5 text-[9px] px-1.5" onClick={() => setResult(null)}>✕</Button>
                  </div>
                </div>
                <ScrollArea className="max-h-[200px]">
                  <div className="prose prose-sm max-w-none dark:prose-invert text-xs">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="chat" className="mt-2 space-y-2">
          {/* Chat messages */}
          <ScrollArea className="h-[180px] border rounded-md p-2">
            {chatMessages.length === 0 && (
              <p className="text-[10px] text-muted-foreground text-center py-8">
                Pergunte algo sobre a nota aberta.<br />Ex: "O que esta nota diz sobre mitocôndrias?"
              </p>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block max-w-[85%] rounded-lg px-2.5 py-1.5 text-xs ${
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert text-xs">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Pensando...
              </div>
            )}
          </ScrollArea>
          <div className="flex gap-1">
            <Input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Pergunte sobre esta nota..."
              className="h-7 text-xs"
              onKeyDown={e => { if (e.key === 'Enter') sendChat(); }}
              disabled={chatLoading || !note}
            />
            <Button size="icon" className="h-7 w-7 shrink-0" onClick={sendChat} disabled={chatLoading || !chatInput.trim() || !note}>
              <Send className="h-3 w-3" />
            </Button>
          </div>
          {chatMessages.length > 0 && (
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-5 text-[9px]"
                onClick={() => {
                  const allChat = chatMessages.map(m => `**${m.role === 'user' ? 'Você' : 'IA'}:** ${m.content}`).join('\n\n');
                  onInsertContent('\n\n---\n\n## 💬 Chat da IA\n\n' + allChat);
                  toast.success('Chat inserido na nota!');
                }}>
                📝 Salvar chat na nota
              </Button>
              <Button size="sm" variant="ghost" className="h-5 text-[9px]" onClick={() => setChatMessages([])}>
                🗑️ Limpar
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
