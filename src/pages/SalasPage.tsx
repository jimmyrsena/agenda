import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Trash2, Pencil, GraduationCap, BookOpen, Search,
  ArrowLeft, Volume2, Square, ChevronRight, Sparkles, CheckCircle2, Circle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useUserName } from "@/hooks/useUserName";
import { useGamification } from "@/hooks/useGamification";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ExportPDF } from "@/components/ExportPDF";



interface KnowledgeRoom {
  id: string;
  title: string;
  description: string | null;
  area: string;
  icon: string;
  cover_color: string;
  topics: string[];
  content: any;
  created_at: string;
  created_by: string;
}

const AREA_OPTIONS = [
  { value: "nucleo", label: "Núcleo Comum" },
  { value: "conc-medio", label: "Concurso - Nível Médio" },
  { value: "superior", label: "Concurso - Nível Superior" },
  { value: "tendencias", label: "Tendências 2025/2026" },
  { value: "medio", label: "Ensino Médio" },
  { value: "fundamental", label: "Ensino Fundamental" },
  { value: "direito", label: "Direito" },
  { value: "exatas", label: "Exatas" },
  { value: "linguagens", label: "Linguagens" },
  { value: "tecnologia", label: "Tecnologia" },
  { value: "humanas", label: "Humanas" },
  { value: "saude", label: "Saúde" },
  { value: "especifico", label: "Específico" },
  { value: "geral", label: "Geral" },
];

const CATEGORIA_TABS = [
  { value: "todos", label: "Todas" },
  { value: "fundamental", label: "Ensino Fundamental", areas: ["fundamental"] },
  { value: "medio", label: "Ensino Médio", areas: ["medio"] },
  { value: "concursos", label: "Concursos", areas: ["nucleo", "conc-medio", "superior", "direito", "exatas", "linguagens", "tecnologia", "humanas", "saude"] },
  { value: "tendencias", label: "Tendências 2025/2026", areas: ["tendencias"] },
  { value: "especificos", label: "Específicos", areas: ["especifico", "geral"] },
];

const ICON_OPTIONS = ["📚", "📖", "📝", "🧠", "⚖️", "💻", "🔬", "🧮", "🌍", "📊", "🎯", "💡", "🏛️", "🔢", "📐", "🧪", "🩺", "🎓", "📜", "🛡️"];

const COLOR_OPTIONS = [
  "from-blue-600 to-indigo-700",
  "from-emerald-600 to-teal-700",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-slate-600 to-gray-700",
  "from-red-500 to-rose-600",
];

export default function SalasPage() {
  const userName = useUserName();
  const { markTopicComplete, isTopicComplete, getRoomProgress } = useGamification();
  const [rooms, setRooms] = useState<KnowledgeRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const [selectedRoom, setSelectedRoom] = useState<KnowledgeRoom | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // CRUD dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<KnowledgeRoom | null>(null);
  const [form, setForm] = useState({ title: "", description: "", area: "geral", icon: "📚", cover_color: COLOR_OPTIONS[0], topics: "" });

  // AI generation state


  // Teaching state
  const [teachContent, setTeachContent] = useState("");
  const [teachLoading, setTeachLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mentorPersona] = useLocalStorage<string>('mentor-persona', 'descolado');
  

  // Stop speech on unmount
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  const fetchRooms = useCallback(async () => {
    const { data } = await supabase.from("knowledge_rooms").select("*").order("created_at", { ascending: false });
    if (data) setRooms(data as any);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const openCreate = () => {
    setEditingRoom(null);
    setForm({ title: "", description: "", area: "geral", icon: "A", cover_color: COLOR_OPTIONS[0], topics: "" });
    setDialogOpen(true);
  };

  const openEdit = (room: KnowledgeRoom) => {
    setEditingRoom(room);
    setForm({
      title: room.title,
      description: room.description || "",
      area: room.area,
      icon: room.icon,
      cover_color: room.cover_color,
      topics: (room.topics || []).join(", "),
    });
    setDialogOpen(true);
  };




  const saveRoom = async () => {
    const topicsArr = form.topics.split(",").map(t => t.trim()).filter(Boolean);
    const payload = { title: form.title, description: form.description, area: form.area, icon: form.icon, cover_color: form.cover_color, topics: topicsArr };

    if (editingRoom) {
      await supabase.from("knowledge_rooms").update(payload).eq("id", editingRoom.id);
    } else {
      await supabase.from("knowledge_rooms").insert({ ...payload, created_by: userName || 'Usuário' });
    }
    setDialogOpen(false);
    fetchRooms();
  };

  const deleteRoom = async (id: string) => {
    await supabase.from("knowledge_rooms").delete().eq("id", id);
    if (selectedRoom?.id === id) { setSelectedRoom(null); setSelectedTopic(null); }
    fetchRooms();
  };

  // Local teach topic (offline)
  const teachTopic = (room: KnowledgeRoom, topic: string) => {
    setSelectedTopic(topic);
    setTeachContent("");
    setTeachLoading(true);
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);

    // Simulate a brief loading then render local content
    setTimeout(() => {
      const content = generateLocalLesson(room, topic, userName || 'Estudante');
      setTeachContent(content);
      setTeachLoading(false);
    }, 300);
  };

  const generateLocalLesson = (room: KnowledgeRoom, topic: string, name: string): string => {
    return `# ${topic}

## 📚 Conceito

**${topic}** é um tema fundamental na área de **${room.title}**.
${room.description ? `\n> ${room.description}\n` : ''}

Este tópico abrange conceitos essenciais que são frequentemente cobrados em provas e concursos.

## 🎯 Pontos Principais

1. **Definição**: ${topic} refere-se ao estudo e compreensão dos princípios fundamentais desta área
2. **Importância**: Tema recorrente em provas do ENEM, concursos públicos e vestibulares
3. **Aplicação prática**: Utilizado em diversos contextos acadêmicos e profissionais

## 💡 Dicas de Estudo

- Faça resumos com suas próprias palavras
- Crie flashcards para memorização ativa
- Resolva exercícios práticos regularmente
- Relacione o conteúdo com situações do dia a dia

## 📝 Exercícios Sugeridos

1. Explique com suas palavras o que é **${topic}**
2. Liste 3 exemplos práticos de aplicação
3. Compare com temas relacionados da mesma área
4. Elabore um mapa mental conectando os conceitos

## 📌 Resumo

${name}, para dominar **${topic}**, foque nos conceitos fundamentais e pratique com exercícios. Use o Pomodoro para sessões focadas de estudo!

---
*📖 Conteúdo gerado localmente — Sala: ${room.title}*`;
  };

  const cleanTextForSpeech = (text: string) => {
    let cleaned = text;
    cleaned = cleaned.replace(/[#*`_\[\]]/g, "");
    cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2702}-\u{27B0}]/gu, "");
    cleaned = cleaned.replace(/\bJohan\b/gi, "Joran");
    cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
    return cleaned;
  };

  const speakContent = () => {
    if (!window.speechSynthesis || !teachContent) return;
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const cleaned = cleanTextForSpeech(teachContent);
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = "pt-BR";
    utterance.rate = 0.9;
    utterance.volume = 0.8;
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith("pt"));
    if (ptVoice) utterance.voice = ptVoice;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const filtered = useMemo(() => {
    let result = rooms.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.area.toLowerCase().includes(search.toLowerCase()));
    if (activeTab !== "todos") {
      const tab = CATEGORIA_TABS.find(t => t.value === activeTab);
      if (tab?.areas) result = result.filter(r => tab.areas.includes(r.area));
    }
    return result;
  }, [rooms, search, activeTab]);

  const roomProgress = selectedRoom ? getRoomProgress(selectedRoom.id, selectedRoom.topics?.length || 0) : null;

  // ── Inside a room view ──
  if (selectedRoom) {
    return (
      <div className="h-[calc(100vh-7rem)] flex flex-col">
        {/* Room header */}
        <div className={`bg-gradient-to-r ${selectedRoom.cover_color} text-white p-6 rounded-xl mb-4 shadow-lg`}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => { setSelectedRoom(null); setSelectedTopic(null); setTeachContent(""); window.speechSynthesis?.cancel(); setIsSpeaking(false); }}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-4xl">{selectedRoom.icon}</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold">{selectedRoom.title}</h1>
              <p className="text-sm opacity-80">{selectedRoom.description}</p>
              {roomProgress && (
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={roomProgress.percent} className="h-2 flex-1 bg-white/20 [&>div]:bg-white" />
                  <span className="text-xs font-medium whitespace-nowrap">{roomProgress.done}/{roomProgress.total} ({roomProgress.percent}%)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0 overflow-hidden">
          {/* Topics list */}
          <div className="space-y-2 overflow-auto scrollbar-thin pr-1">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5 mb-3">
              <BookOpen className="h-4 w-4" /> Tópicos ({selectedRoom.topics?.length || 0})
            </h3>
            {(selectedRoom.topics || []).map((topic, i) => {
              const completed = isTopicComplete(selectedRoom.id, topic);
              return (
                <button
                  key={i}
                  onClick={() => teachTopic(selectedRoom, topic)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-2 text-sm group hover:shadow-md ${selectedTopic === topic ? "bg-primary text-primary-foreground border-primary shadow-md" : completed ? "bg-accent/60 border-primary/20" : "bg-card hover:bg-accent"}`}
                >
                  {completed
                    ? <CheckCircle2 className={`h-4 w-4 shrink-0 ${selectedTopic === topic ? "text-primary-foreground" : "text-primary"}`} />
                    : <Circle className={`h-4 w-4 shrink-0 ${selectedTopic === topic ? "text-primary-foreground" : "text-muted-foreground/40"}`} />
                  }
                  <span className="flex-1">{topic}</span>
                  {selectedTopic === topic && teachLoading && <span className="animate-pulse text-xs">...</span>}
                </button>
              );
            })}
          </div>

          {/* Content area */}
          <div className="lg:col-span-2 flex flex-col min-h-0 overflow-hidden">
            {selectedTopic ? (
              <Card className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 p-4 border-b bg-card">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold flex-1">{selectedTopic}</h3>
                  {teachContent && !teachLoading && selectedRoom && selectedTopic && !isTopicComplete(selectedRoom.id, selectedTopic) && (
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => {
                      const xp = markTopicComplete(selectedRoom.id, selectedTopic, selectedRoom.topics?.length || 0);
                      if (xp > 0) toast.success(`Tópico concluído! +${xp} XP`);
                    }}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
                    </Button>
                  )}
                  {selectedRoom && selectedTopic && isTopicComplete(selectedRoom.id, selectedTopic) && (
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Concluído
                    </Badge>
                  )}
                  {teachContent && (
                    <>
                      <ExportPDF title={`${selectedRoom.title} - ${selectedTopic}`} getContent={() => {
                        const md = teachContent || '';
                        let html = `<h1>${selectedRoom.title}</h1><h2>${selectedTopic}</h2>`;
                        // Convert markdown to structured HTML
                        const cleanLatex = (t: string) => t.replace(/\$\\mathbb\{([A-Z])\}\$/g, '$1').replace(/\$\\([a-zA-Z]+)\{([^}]*)\}\$/g, '$2').replace(/\$([^$]+)\$/g, '$1').replace(/\\mathbb\{([A-Z])\}/g, '$1').replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/\\sqrt\{([^}]*)\}/g, 'raiz de $1').replace(/\\\\/g, '');
                        const fmt = (t: string) => cleanLatex(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`(.+?)`/g, '<code style="background:#f1f5f9;padding:1px 4px;border-radius:3px;font-size:12px;">$1</code>');
                        const lines = md.split('\n');
                        lines.forEach(line => {
                          const trimmed = line.trim();
                          if (!trimmed) return;
                          if (trimmed.startsWith('### ')) html += `<h3>${fmt(trimmed.slice(4))}</h3>`;
                          else if (trimmed.startsWith('## ')) html += `<h2>${fmt(trimmed.slice(3))}</h2>`;
                          else if (trimmed.startsWith('# ')) html += `<h1>${fmt(trimmed.slice(2))}</h1>`;
                          else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) html += `<li>${fmt(trimmed.slice(2))}</li>`;
                          else if (/^\d+\.\s/.test(trimmed)) html += `<li>${fmt(trimmed.replace(/^\d+\.\s/, ''))}</li>`;
                          else if (trimmed.startsWith('> ')) html += `<blockquote style="border-left:3px solid #3b82f6;padding-left:12px;color:#475569;margin:8px 0;">${fmt(trimmed.slice(2))}</blockquote>`;
                          else html += `<p>${fmt(trimmed)}</p>`;
                        });
                        return html;
                      }} />
                      <Button variant="ghost" size="icon" onClick={speakContent} title={isSpeaking ? "Parar leitura" : "Ler conteúdo"} className="shrink-0">
                          {isSpeaking ? <Square className="h-4 w-4 fill-destructive text-destructive" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                    </>
                  )}
                </div>
                <div className="flex-1 overflow-auto p-4 sm:p-6 scrollbar-thin">
                  {teachLoading && !teachContent ? (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Sparkles className="h-5 w-5 animate-pulse text-primary" />
                      <span className="animate-pulse">O Mentor está preparando a aula...</span>
                    </div>
                  ) : teachContent ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert
                      [&>h1]:text-xl [&>h1]:font-bold [&>h1]:text-primary [&>h1]:border-b-2 [&>h1]:border-primary/30 [&>h1]:pb-2 [&>h1]:mb-4
                      [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:text-primary/90 [&>h2]:border-l-[3px] [&>h2]:border-primary [&>h2]:pl-3 [&>h2]:mt-6 [&>h2]:mb-2
                      [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mt-4 [&>h3]:mb-1.5
                      [&>p]:my-1.5 [&>p]:leading-relaxed
                      [&>ul]:my-2 [&>ul]:space-y-1 [&>ol]:my-2 [&>ol]:space-y-1
                      [&>blockquote]:border-l-[3px] [&>blockquote]:border-primary/50 [&>blockquote]:bg-primary/5 [&>blockquote]:rounded-r-lg [&>blockquote]:px-4 [&>blockquote]:py-2 [&>blockquote]:my-3
                      [&_table]:border-collapse [&_table]:w-full [&_table]:my-3 [&_table]:text-sm
                      [&_th]:bg-muted [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold
                      [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-1.5
                      [&_tr:nth-child(even)_td]:bg-muted/30
                      [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:text-pink-600 [&_code]:dark:text-pink-400
                      [&_strong]:text-foreground [&_strong]:font-semibold
                    ">
                      <ReactMarkdown>{teachContent
                        .replace(/\$\\mathbb\{([A-Z])\}\$/g, '$1')
                        .replace(/\$\\([a-zA-Z]+)\{([^}]*)\}\$/g, '$2')
                        .replace(/\$([^$]+)\$/g, '$1')
                        .replace(/\\mathbb\{([A-Z])\}/g, '$1')
                        .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
                        .replace(/\\sqrt\{([^}]*)\}/g, 'raiz de $1')
                        .replace(/\\\\/g, '')
                      }</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center mt-12">Selecione um tópico para começar a aprender</p>
                  )}
                </div>
              </Card>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-3">
                  <BookOpen className="h-12 w-12 mx-auto opacity-30" />
                  <p className="text-lg font-medium">Escolha um tópico</p>
                  <p className="text-sm">Selecione um tópico à esquerda para o Mentor ensinar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Room list view ──
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            Salas de Conhecimento
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Ambientes de estudo com o Mentor • Crie, edite e aprenda sobre qualquer tema</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar sala..." className="pl-9 h-9 w-full sm:w-56" />
          </div>
          <Button onClick={openCreate} size="sm" className="gap-1.5 shrink-0">
            <Plus className="h-4 w-4" /> Nova Sala
          </Button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIA_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.value ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-accent"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Room grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Nenhuma sala encontrada</p>
          <p className="text-sm">Crie sua primeira sala de conhecimento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(room => (
            <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group border-0" onClick={() => setSelectedRoom(room)}>
              <div className={`bg-gradient-to-br ${room.cover_color} p-5 text-white relative`}>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); openEdit(room); }} className="bg-white/20 hover:bg-white/30 rounded-lg p-1.5">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {room.created_by === userName && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button onClick={e => e.stopPropagation()} className="bg-white/20 hover:bg-red-500/60 rounded-lg p-1.5">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={e => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Apagar sala "{room.title}"?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita. Todo o conteúdo da sala será removido.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteRoom(room.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Apagar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <span className="text-3xl">{room.icon}</span>
                <h3 className="font-bold text-lg mt-2">{room.title}</h3>
                <p className="text-xs opacity-80 line-clamp-2 mt-1">{room.description}</p>
              </div>
              <CardContent className="p-3">
                {(() => {
                  const prog = getRoomProgress(room.id, room.topics?.length || 0);
                  return prog.total > 0 ? (
                    <div className="flex items-center gap-2 mb-2">
                      <Progress value={prog.percent} className="h-1.5 flex-1" />
                      <span className="text-[10px] text-muted-foreground font-medium">{prog.percent}%</span>
                    </div>
                  ) : null;
                })()}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px]">{room.area}</Badge>
                  <span className="text-[10px] text-muted-foreground">{room.topics?.length || 0} tópicos</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(room.topics || []).slice(0, 3).map((t, i) => (
                    <span key={i} className="text-[10px] bg-accent px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                  {(room.topics?.length || 0) > 3 && <span className="text-[10px] text-muted-foreground">+{room.topics.length - 3}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <span className="text-2xl">{form.icon}</span>
              {editingRoom ? "Editar Sala" : "Nova Sala de Conhecimento"}
            </DialogTitle>
          </DialogHeader>

          {/* Preview card */}
          <div className={`bg-gradient-to-br ${form.cover_color} p-4 rounded-xl text-white`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{form.icon}</span>
              <div className="min-w-0">
                <p className="font-bold text-lg truncate">{form.title || "Título da sala"}</p>
                <p className="text-xs opacity-80 line-clamp-1">{form.description || "Descrição..."}</p>
              </div>
              <Badge className="ml-auto bg-white/20 text-white border-0 text-[10px] shrink-0">
                {AREA_OPTIONS.find(a => a.value === form.area)?.label || form.area}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Título *</label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Direito Penal" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Descrição</label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Sobre o que esta sala ensina..." rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Área / Categoria</label>
                <Select value={form.area} onValueChange={v => setForm(f => ({ ...f, area: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AREA_OPTIONS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Ícone</label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border bg-accent/30">
                  {ICON_OPTIONS.map(ic => (
                    <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))} className={`text-xl p-1.5 rounded-lg transition-all ${form.icon === ic ? "bg-primary text-primary-foreground shadow-md scale-110" : "hover:bg-accent"}`}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Cor do card</label>
                <div className="flex flex-wrap gap-2 p-2 rounded-lg border bg-accent/30">
                  {COLOR_OPTIONS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, cover_color: c }))} className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c} transition-all ${form.cover_color === c ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-md" : "hover:scale-105"}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Topics full width */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tópicos (separados por vírgula)</label>
            <Textarea value={form.topics} onChange={e => setForm(f => ({ ...f, topics: e.target.value }))} placeholder="Ex: Crimes contra a pessoa, Crimes contra o patrimônio, Dosimetria da pena" rows={4} className="resize-none" />
            {form.topics.trim() && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.topics.split(",").map(t => t.trim()).filter(Boolean).map((t, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">{t}</Badge>
                ))}
              </div>
            )}
          </div>

          <Button onClick={saveRoom} disabled={!form.title.trim()} className="w-full" size="lg">
            {editingRoom ? "Salvar Alterações" : "Criar Sala"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
