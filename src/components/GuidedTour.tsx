import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard, KanbanSquare, CalendarDays, GraduationCap, Timer,
  CalendarRange, FileQuestion, CreditCard, Target, BookOpen, Languages,
  FileText, Settings, BarChart3, HelpCircle, Play, Pause, SkipForward,
  SkipBack, X, Volume2, VolumeX, Sparkles, ChevronRight, CheckCircle2,
  Lightbulb, ArrowLeft, ListChecks, Zap, type LucideIcon
} from "lucide-react";

/* ─── Slide data type ─── */
interface TourSlide {
  id: string;
  icon: LucideIcon;
  title: string;
  color: string;
  emoji: string;
  category: string;
  description: string;
  features: string[];
  tip: string;
  quiz?: { question: string; options: string[]; answer: number };
  narration: string;
}

/* ─── All module slides (excluding intro/outro which are generated dynamically) ─── */
const MODULE_SLIDES: TourSlide[] = [
  {
    id: "dashboard", icon: LayoutDashboard, title: "Dashboard",
    color: "from-blue-500 to-blue-700", emoji: "📊", category: "Organização",
    description: "O Dashboard é sua página inicial. Aqui você tem uma visão geral de tarefas pendentes, eventos, horas estudadas, idiomas em progresso e atalhos rápidos para todos os módulos.",
    features: ["Estatísticas: tarefas, eventos, horas e flashcards", "Próximos eventos de hoje e amanhã", "Progresso de idiomas em estudo", "Alertas de tarefas atrasadas", "Atalhos rápidos para todos os módulos", "Gráficos de progresso de estudo"],
    tip: "💡 Dica: Use o Dashboard como ponto de partida diário. Confira suas pendências logo ao abrir o sistema!",
    quiz: { question: "O que o Dashboard mostra ao abrir o sistema?", options: ["Apenas as metas", "Tarefas, eventos, horas e idiomas em estudo", "Somente o calendário", "Nada, é uma tela em branco"], answer: 1 },
    narration: "O Dashboard é o coração do sistema. Ao abrir o aplicativo, você verá estatísticas de tarefas, eventos de hoje e amanhã, horas estudadas e idiomas em progresso. É o ponto de partida ideal para navegar por qualquer módulo.",
  },
  {
    id: "kanban", icon: KanbanSquare, title: "Planner Kanban",
    color: "from-indigo-500 to-indigo-700", emoji: "📋", category: "Organização",
    description: "Organize suas tarefas de estudo em colunas arrastáveis no estilo Microsoft Planner. Crie, edite e mova tarefas entre as colunas para acompanhar seu progresso.",
    features: ["Colunas: A Fazer, Em Progresso, Concluído", "Arraste e solte para mover tarefas", "Etiquetas de prioridade coloridas", "Barra de progresso global"],
    tip: "💡 Dica: Comece cada semana movendo as tarefas mais importantes para 'Em Progresso'. Limite a 3 tarefas simultâneas!",
    quiz: { question: "Quantas colunas tem o Kanban?", options: ["2 colunas", "3 colunas", "5 colunas", "Depende do usuário"], answer: 1 },
    narration: "O Planner Kanban é inspirado no Microsoft Planner. Você organiza suas tarefas em três colunas: A Fazer, Em Progresso e Concluído. Basta arrastar as tarefas entre as colunas. Cada tarefa pode ter prioridade Urgente, Importante ou Normal.",
  },
  {
    id: "agenda", icon: CalendarDays, title: "Agenda",
    color: "from-cyan-500 to-cyan-700", emoji: "📅", category: "Organização",
    description: "Calendário avançado estilo Outlook com grade horária interativa. Agende compromissos, provas e sessões de estudo clicando diretamente no horário desejado.",
    features: ["Grade horária de 06:00 às 22:00", "Clique no horário para criar eventos", "Suporte a eventos recorrentes", "Busca rápida de eventos"],
    tip: "💡 Dica: Agende blocos fixos para cada matéria. A regularidade é mais eficaz que estudar tudo de uma vez!",
    quiz: { question: "Como criar um evento na Agenda?", options: ["Digitando no chat", "Clicando no horário desejado", "Enviando um e-mail", "Não é possível criar eventos"], answer: 1 },
    narration: "A Agenda funciona como o calendário do Outlook. Você tem uma grade horária interativa das 6 da manhã às 10 da noite. Para criar um evento, basta clicar no horário desejado.",
  },
  {
    id: "mentor", icon: GraduationCap, title: "Mentor (IA)",
    color: "from-purple-500 to-purple-700", emoji: "🤖", category: "Aprendizado",
    description: "Seu orientador pessoal com IA avançada. 9 modos especializados (Livre, Aula, Socrático, Redação ENEM, Debate, Revisão, Exercícios, Entrevista, Brainstorm), ações inline, voz com destaque palavra por palavra e exportação para o Caderno.",
    features: ["9 modos especializados de interação", "Cria flashcards, tarefas e pomodoros pelo chat", "Templates de prompt e quote-reply", "Memorização com [MEMORIZAR]", "6 personalidades diferentes", "Voz com destaque por palavra e detecção de sentimento", "Exportação para o Caderno e busca no histórico"],
    tip: "💡 Dica: Use [MEMORIZAR] antes de uma frase para o Mentor guardar informações. Experimente os 9 modos para diferentes tipos de estudo!",
    quiz: { question: "Quantos modos especializados o Mentor possui?", options: ["3 modos", "6 modos", "9 modos", "12 modos"], answer: 2 },
    narration: "O Mentor é seu professor particular com inteligência artificial. Ele possui 9 modos especializados: Livre, Aula, Socrático, Redação ENEM, Debate, Revisão, Exercícios, Entrevista e Brainstorm. Pode criar flashcards e tarefas diretamente no chat, e exportar conversas para o Caderno.",
  },
  {
    id: "pomodoro", icon: Timer, title: "Pomodoro",
    color: "from-red-500 to-red-700", emoji: "⏱️", category: "Produtividade",
    description: "Temporizador baseado na técnica Pomodoro para manter o foco nos estudos. Alterne entre períodos de foco intenso e pausas estratégicas.",
    features: ["25 minutos de foco + 5 de intervalo", "Intervalo longo a cada 4 sessões", "Tempos personalizáveis", "Contagem de sessões completadas"],
    tip: "💡 Dica: Durante os 25 minutos, desligue notificações do celular. O foco total é o segredo da técnica!",
    quiz: { question: "Qual é o tempo padrão de foco no Pomodoro?", options: ["10 minutos", "15 minutos", "25 minutos", "50 minutos"], answer: 2 },
    narration: "O Pomôdoro é uma técnica comprovada de produtividade. Você estuda por 25 minutos com foco total, depois faz uma pausa de 5 minutos. A cada 4 sessões, um intervalo mais longo.",
  },
  {
    id: "plano", icon: CalendarRange, title: "Plano Semanal",
    color: "from-teal-500 to-teal-700", emoji: "📆", category: "Organização",
    description: "Monte sua grade semanal de estudos definindo matérias e horários para cada dia. Mantenha uma rotina consistente e organizada.",
    features: ["Grade semanal completa", "Defina matérias por dia", "Horários específicos por sessão", "Edição completa dos blocos"],
    tip: "💡 Dica: Distribua matérias difíceis nos horários em que você tem mais energia. Varie as disciplinas para não cansar!",
    narration: "O Plano Semanal ajuda você a criar uma rotina de estudos organizada. Defina quais matérias estudar em cada dia da semana com horários específicos.",
  },
  {
    id: "simulados", icon: FileQuestion, title: "Simulados ENEM",
    color: "from-orange-500 to-orange-700", emoji: "📝", category: "Aprendizado",
    description: "Pratique com simulados gerados por IA no formato oficial do ENEM. Teste seus conhecimentos e acompanhe sua evolução.",
    features: ["Questões geradas por IA", "Todas as áreas do ENEM", "Estatísticas de desempenho", "Feedback detalhado por questão"],
    tip: "💡 Dica: Faça simulados regularmente para se acostumar com o ritmo da prova. Analise os erros para aprender com eles!",
    quiz: { question: "Quem gera as questões dos Simulados?", options: ["São questões antigas do ENEM", "São geradas por IA", "São criadas por professores", "São copiadas de livros"], answer: 1 },
    narration: "Os Simulados são gerados pela inteligência artificial no formato oficial do ENEM. Escolha a área de conhecimento, o número de questões e pratique!",
  },
  {
    id: "flashcards", icon: CreditCard, title: "Flashcards",
    color: "from-pink-500 to-pink-700", emoji: "🃏", category: "Aprendizado",
    description: "Crie cartões de estudo para memorização ativa com repetição espaçada. Uma das técnicas mais eficazes de aprendizado comprovadas pela ciência.",
    features: ["Crie baralhos por matéria", "Frente com pergunta, verso com resposta", "Sistema de repetição espaçada", "Edição completa dos cards"],
    tip: "💡 Dica: Crie flashcards logo após estudar um tema novo. A revisão ativa é 3x mais eficaz que reler anotações!",
    narration: "Os Flashcards são uma técnica comprovada de memorização. Crie baralhos para cada matéria, com perguntas na frente e respostas no verso.",
  },
  {
    id: "metas", icon: Target, title: "Metas de Estudo",
    color: "from-green-500 to-green-700", emoji: "🎯", category: "Produtividade",
    description: "Defina metas claras e acompanhe seu progresso ao longo do tempo. Mantenha-se motivado visualizando sua evolução.",
    features: ["Crie metas com valores alvo", "Acompanhe porcentagem de conclusão", "Atualize progresso em tempo real", "Diferentes unidades de medida"],
    tip: "💡 Dica: Defina metas SMART — Específicas, Mensuráveis, Atingíveis, Relevantes e Temporais!",
    narration: "As Metas ajudam você a manter o foco. Crie metas com título, valor alvo e unidade de medida. Acompanhe a porcentagem de conclusão em tempo real!",
  },
  {
    id: "caderno", icon: BookOpen, title: "Caderno de Documentos",
    color: "from-yellow-500 to-yellow-700", emoji: "📔", category: "Aprendizado",
    description: "Editor de documentos completo estilo Word com ribbon, formatação rica, inserção de imagens/tabelas/equações, exportação multi-formato e seção Sobre.",
    features: ["Ribbon com abas: Início, Inserir, Desenhar, Design, Layout, Referências, Revisão, Exibir, Ajuda", "Formatação avançada de texto", "Inserção de imagens, tabelas e equações LaTeX", "Exportação para PDF, DOCX, HTML, TXT", "Menu Arquivo com Sobre do projeto", "Atalhos de teclado na aba Ajuda"],
    tip: "💡 Dica: Use Ctrl+S para salvar e acesse Arquivo > Sobre para ver os créditos do projeto.",
    narration: "O Caderno é um editor de documentos completo inspirado no Microsoft Word. Possui ribbon com múltiplas abas, formatação avançada, inserção de tabelas e equações, e exportação para vários formatos.",
  },
  {
    id: "idiomas", icon: Languages, title: "Idiomas",
    color: "from-violet-500 to-violet-700", emoji: "🌍", category: "Idiomas",
    description: "Aprenda idiomas completos com lições, exercícios, conversação, textos e provas orais. Inclui módulos de preparação para morar no exterior.",
    features: ["Inglês, Espanhol, Alemão, Italiano, Mandarim", "4 níveis: Básico ao Fluência", "Professor Virtual com voz nativa", "Módulos Vida no Exterior"],
    tip: "💡 Dica: Pratique um pouco todos os dias ao invés de longas sessões espaçadas. 15 minutos diários são mais eficazes!",
    quiz: { question: "Quantos idiomas o sistema oferece?", options: ["3 idiomas", "4 idiomas", "5 idiomas", "6 idiomas"], answer: 2 },
    narration: "O módulo de Idiomas oferece cursos completos em Inglês, Espanhol, Alemão, Italiano e Mandarim. Cada curso tem 4 níveis, do Básico à Fluência.",
  },
  {
    id: "traducao", icon: Languages, title: "Tradução de Textos",
    color: "from-sky-500 to-sky-700", emoji: "🔄", category: "Idiomas",
    description: "Traduza textos digitados ou extraídos de PDFs entre 6 idiomas do sistema usando inteligência artificial.",
    features: ["6 idiomas suportados", "Extração de texto de PDFs", "Tradução por IA avançada", "Copie resultados facilmente"],
    tip: "💡 Dica: Envie PDFs de até 50 páginas! O sistema extrai o texto automaticamente para tradução.",
    narration: "A Tradução de Textos permite traduzir entre 6 idiomas. Você pode digitar o texto ou enviar um PDF e o sistema extrai o conteúdo automaticamente.",
  },
  {
    id: "salas", icon: GraduationCap, title: "Salas de Conhecimento",
    color: "from-emerald-500 to-emerald-700", emoji: "🏫", category: "Aprendizado",
    description: "Ambientes de estudo organizados por área com aulas completas geradas pelo Mentor. Progressão por tópico, salas personalizáveis e proteção de salas do sistema.",
    features: ["Categorias organizadas por área", "Aulas completas geradas por IA", "Crie salas personalizadas com emojis", "Áudio narrado pelo Mentor", "Rastreamento de progressão por tópico", "Salas do sistema protegidas contra exclusão"],
    tip: "💡 Dica: Crie salas personalizadas e marque tópicos como concluídos para acompanhar seu avanço!",
    narration: "As Salas de Conhecimento são ambientes de estudo organizados por área. Cada sala contém tópicos que o Mentor ensina com aulas completas. Você pode criar salas personalizadas e acompanhar seu progresso por tópico.",
  },
  {
    id: "relatorios", icon: BarChart3, title: "Relatórios",
    color: "from-slate-500 to-slate-700", emoji: "📈", category: "Produtividade",
    description: "Visualize e imprima relatórios detalhados de todos os módulos do sistema.",
    features: ["Relatórios de todos os módulos", "Impressão formatada", "Dados organizados", "Acompanhe sua evolução"],
    tip: "💡 Dica: Imprima relatórios mensais para visualizar sua evolução e ajustar suas estratégias de estudo!",
    narration: "Os Relatórios permitem que você visualize e imprima dados detalhados de todos os módulos do sistema.",
  },
  {
    id: "config", icon: Settings, title: "Configurações",
    color: "from-gray-500 to-gray-700", emoji: "⚙️", category: "Sistema",
    description: "Personalize o sistema, gerencie seus dados, configure o Mentor e faça backup completo.",
    features: ["Personalidade do Mentor", "Backup e restauração de dados", "Tempos do Pomodoro", "Gerenciamento completo"],
    tip: "💡 Dica: Sempre faça backup após inserir ou modificar dados importantes! Use o Backup Completo nas Configurações.",
    quiz: { question: "Onde você configura a personalidade do Mentor?", options: ["No chat do Mentor", "Nas Configurações", "No Dashboard", "Não é configurável"], answer: 1 },
    narration: "Nas Configurações, você personaliza todo o sistema. Mude a personalidade do Mentor, configure tempos do Pomôdoro, faça backup e restaure dados.",
  },
];

const CATEGORIES = ["Todos", "Organização", "Aprendizado", "Produtividade", "Idiomas", "Sistema"];

/* ─── Sub-views ─── */
type View = "menu" | "tour";

export default function GuidedTour({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<View>("menu");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [activeSlides, setActiveSlides] = useState<TourSlide[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ─── Speech ─── */
  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "pt-BR";
    utter.rate = 1.05;
    utter.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const brVoice = voices.find(v => v.lang.includes("pt-BR") || v.lang.includes("pt_BR"));
    if (brVoice) utter.voice = brVoice;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => {
      setIsSpeaking(false);
      if (isPlaying) {
        timerRef.current = setTimeout(() => goNextAuto(), 1500);
      }
    };
    window.speechSynthesis.speak(utter);
  }, [voiceEnabled, isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => () => stopSpeech(), []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Tour navigation ─── */
  const goNextAuto = () => {
    setCurrent(c => {
      if (c < activeSlides.length - 1) return c + 1;
      setIsPlaying(false);
      return c;
    });
  };

  const goNext = () => {
    if (current < activeSlides.length - 1) {
      stopSpeech(); setShowQuiz(false); setQuizAnswer(null);
      setCurrent(c => c + 1);
    }
  };
  const goPrev = () => {
    if (current > 0) {
      stopSpeech(); setShowQuiz(false); setQuizAnswer(null);
      setCurrent(c => c - 1);
    }
  };

  const togglePlay = () => {
    if (isPlaying) { stopSpeech(); setIsPlaying(false); }
    else { setIsPlaying(true); if (!isSpeaking && activeSlides.length > 0) speak(activeSlides[current].narration); }
  };
  const toggleVoice = () => { if (voiceEnabled) stopSpeech(); setVoiceEnabled(v => !v); };

  const handleClose = () => { stopSpeech(); setIsPlaying(false); onClose(); };
  const backToMenu = () => { stopSpeech(); setIsPlaying(false); setShowQuiz(false); setQuizAnswer(null); setView("menu"); setCurrent(0); };

  /* narrate on slide change */
  useEffect(() => {
    if (view === "tour" && activeSlides.length > 0) {
      setShowQuiz(false); setQuizAnswer(null);
      speak(activeSlides[current]?.narration || "");
      // mark module as completed
      const slide = activeSlides[current];
      if (slide) setCompletedModules(prev => new Set(prev).add(slide.id));
    }
    return () => stopSpeech();
  }, [current, view]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Start tour ─── */
  const startTour = (moduleIds: string[]) => {
    const slides = moduleIds.length === 0
      ? MODULE_SLIDES
      : MODULE_SLIDES.filter(s => moduleIds.includes(s.id));
    setActiveSlides(slides);
    setCurrent(0);
    setView("tour");
  };

  const toggleModule = (id: string) => {
    setSelectedModules(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  /* ─── Filtered modules for menu ─── */
  const filteredModules = categoryFilter === "Todos"
    ? MODULE_SLIDES
    : MODULE_SLIDES.filter(m => m.category === categoryFilter);

  /* ─── MENU VIEW ─── */
  if (view === "menu") {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl bg-card border-border overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
            <span className="text-sm font-semibold flex items-center gap-2">🎓 Sala de Aula Interativa</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClose}><X className="h-4 w-4" /></Button>
          </div>

          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold">Escolha o que aprender</h2>
              <p className="text-xs text-muted-foreground">Selecione módulos específicos ou aprenda sobre todo o sistema</p>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {CATEGORIES.map(cat => (
                <Badge
                  key={cat}
                  variant={categoryFilter === cat ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>

            {/* Module grid */}
            <ScrollArea className="h-[320px] pr-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredModules.map(mod => {
                  const selected = selectedModules.includes(mod.id);
                  const completed = completedModules.has(mod.id);
                  const Icon = mod.icon;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      className={`relative p-3 rounded-lg border text-left transition-all duration-200 hover:shadow-md ${
                        selected
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {completed && (
                        <CheckCircle2 className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-green-500" />
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{mod.emoji}</span>
                        <Icon className={`h-3.5 w-3.5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <p className="text-xs font-medium leading-tight">{mod.title}</p>
                      <Badge variant="secondary" className="text-[9px] mt-1">{mod.category}</Badge>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="flex-1 gap-2" variant="outline" onClick={() => startTour([])}>
                <ListChecks className="h-4 w-4" /> Tour Completo ({MODULE_SLIDES.length} módulos)
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={() => startTour(selectedModules)}
                disabled={selectedModules.length === 0}
              >
                <Zap className="h-4 w-4" />
                Aprender Selecionados ({selectedModules.length})
              </Button>
            </div>

            {/* Quick single module */}
            <p className="text-[10px] text-muted-foreground text-center">
              Ou clique duas vezes em um módulo para aprender apenas ele
            </p>
          </div>
        </Card>
      </div>
    );
  }

  /* ─── TOUR VIEW ─── */
  if (activeSlides.length === 0) return null;
  const slide = activeSlides[current];
  const total = activeSlides.length;
  const progress = ((current + 1) / total) * 100;
  const isLast = current === total - 1;
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card border-border overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={backToMenu} title="Voltar ao menu">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground font-medium">
              🎓 {current + 1} de {total} {activeSlides.length < MODULE_SLIDES.length ? `(${activeSlides.length} selecionados)` : "(tour completo)"}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClose}><X className="h-4 w-4" /></Button>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />

        {/* Slide */}
        <ScrollArea className="h-[420px]">
          <div className="p-6 space-y-4">
            {/* Title banner */}
            <div className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${slide.color} text-white`}>
              <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center text-3xl shrink-0">{slide.emoji}</div>
              <div>
                <h2 className="text-xl font-bold">{slide.title}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className="bg-white/20 text-white text-[10px] border-0">{slide.category}</Badge>
                  <span className="text-white/70 text-[10px]">Módulo {current + 1} de {total}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">{slide.description}</p>

            {/* Features */}
            <div className="grid gap-1.5">
              {slide.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {/* Tip box */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/50 border border-accent">
              <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">{slide.tip}</p>
            </div>

            {/* Quiz section */}
            {slide.quiz && (
              <div className="space-y-2">
                {!showQuiz ? (
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setShowQuiz(true)}>
                    <Sparkles className="h-3.5 w-3.5" /> Testar seu conhecimento
                  </Button>
                ) : (
                  <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                    <p className="text-sm font-medium">🧠 {slide.quiz.question}</p>
                    <div className="grid gap-1.5">
                      {slide.quiz.options.map((opt, i) => {
                        const isCorrect = i === slide.quiz!.answer;
                        const isSelected = quizAnswer === i;
                        let style = "border-border hover:border-primary/50";
                        if (quizAnswer !== null) {
                          if (isCorrect) style = "border-green-500 bg-green-500/10";
                          else if (isSelected) style = "border-red-500 bg-red-500/10";
                        }
                        return (
                          <button
                            key={i}
                            disabled={quizAnswer !== null}
                            onClick={() => setQuizAnswer(i)}
                            className={`text-left text-xs p-2 rounded-md border transition-all ${style}`}
                          >
                            <span className="font-medium mr-1">{String.fromCharCode(65 + i)})</span> {opt}
                            {quizAnswer !== null && isCorrect && " ✅"}
                            {quizAnswer !== null && isSelected && !isCorrect && " ❌"}
                          </button>
                        );
                      })}
                    </div>
                    {quizAnswer !== null && (
                      <p className={`text-xs font-medium ${quizAnswer === slide.quiz.answer ? "text-green-600" : "text-red-500"}`}>
                        {quizAnswer === slide.quiz.answer ? "🎉 Correto! Excelente!" : `Resposta correta: ${String.fromCharCode(65 + slide.quiz.answer)})`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Speaking indicator */}
            {isSpeaking && (
              <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
                <Volume2 className="h-3.5 w-3.5" /> Narrando...
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleVoice}>
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goPrev} disabled={current === 0}>
              <SkipBack className="h-3.5 w-3.5 mr-1" /> Anterior
            </Button>
            {isLast ? (
              <Button size="sm" onClick={() => { stopSpeech(); speak("Você concluiu o tour. Bons estudos!"); setTimeout(backToMenu, 3000); }}>
                Concluir ✅
              </Button>
            ) : (
              <Button size="sm" onClick={goNext}>
                Próximo <SkipForward className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
