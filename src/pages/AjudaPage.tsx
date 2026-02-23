import { useState, useMemo, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const GuidedTour = lazy(() => import("@/components/GuidedTour"));
import {
  HelpCircle, LayoutDashboard, KanbanSquare, CalendarDays, GraduationCap,
  Timer, CalendarRange, FileQuestion, CreditCard, Target, BookOpen,
  Languages, FileText, Settings, BarChart3, Lightbulb, Keyboard, Sparkles, Brain, Search, PlayCircle, School, Mic, Zap, Pin, MessageCircle
} from "lucide-react";

const MODULES = [
  {
    icon: LayoutDashboard, title: "Dashboard", color: "text-blue-500",
    desc: "Painel inicial com visão geral de tarefas, eventos, idiomas e atalhos rápidos.",
    steps: [
      "Ao abrir o sistema, você verá o Dashboard automaticamente.",
      "Ele mostra tarefas pendentes, eventos de hoje/amanhã, horas estudadas e flashcards dominados.",
      "Veja seus idiomas em estudo com contagem de tópicos por língua.",
      "Receba alertas de tarefas atrasadas e em andamento.",
      "Use os atalhos rápidos para navegar para qualquer módulo.",
      "Acompanhe gráficos de progresso de estudo na seção dedicada.",
    ],
  },
  {
    icon: KanbanSquare, title: "Planner (Kanban)", color: "text-indigo-500",
    desc: "Organize suas tarefas de estudo em colunas arrastáveis com prioridades.",
    steps: [
      "Clique em '+ Tarefa' para criar uma nova tarefa.",
      "Defina título, descrição, matéria, prioridade e prazo.",
      "Arraste tarefas entre colunas: A Fazer → Em Progresso → Concluído.",
      "Use filtros por matéria e prioridade para organizar.",
      "Adicione subtarefas, labels coloridas e estimativas de tempo.",
      "Use Ctrl+K para abrir a paleta de comandos rápidos.",
    ],
  },
  {
    icon: CalendarDays, title: "Agenda", color: "text-cyan-500",
    desc: "Calendário para agendar compromissos e sessões de estudo.",
    steps: [
      "Clique em um dia para adicionar um evento.",
      "Defina título, horário, tipo (aula, revisão, simulado, descanso).",
      "Alterne entre visualização Dia, Semana e Mês.",
      "Eventos aparecem com cores diferentes por tipo.",
      "No mobile, use a lista simplificada para melhor navegação.",
    ],
  },
  {
    icon: GraduationCap, title: "Mentor (IA)", color: "text-purple-500",
    desc: "Orientador pessoal de estudos com IA — 9 modos especializados e ações integradas.",
    steps: [
      "Digite sua dúvida ou pergunta no chat.",
      "O Mentor responde em tempo real com explicações detalhadas.",
      "Escolha entre 9 modos: Livre, Aula, Socrático, Redação ENEM, Debate, Revisão, Exercícios, Entrevista e Brainstorm.",
      "Use Templates de Prompt (⚡) para perguntas pré-formatadas como 'Explique simples' ou 'Me dê 5 questões'.",
      "O Mentor cria Flashcards, Tarefas e Pomodoros diretamente pelo chat — clique nos botões de ação.",
      "Selecione texto do Mentor para responder citando (quote-reply).",
      "Fixe mensagens importantes com o ícone 📌.",
      "Avalie respostas com 'Foi útil?' para melhorar a qualidade.",
      "Exporte a conversa para o Caderno com o botão 📖 no header.",
      "Use a busca (🔍) para encontrar mensagens antigas.",
      "Ative o Modo Foco para expandir o chat em tela cheia.",
      "Veja estatísticas da sessão (📊) com contagem de perguntas e humor detectado.",
      "Escolha diferentes personas (Descolado, Formal, etc.) nas Configurações.",
      "Ative a voz para ouvir as respostas — com destaque palavra por palavra.",
      "O Mentor analisa seu sentimento (ansiedade, motivação) e adapta o tom automaticamente.",
    ],
  },
  {
    icon: Timer, title: "Pomodoro", color: "text-red-500",
    desc: "Temporizador para sessões de estudo focadas com registro automático.",
    steps: [
      "Selecione a matéria antes de iniciar.",
      "Clique em 'Iniciar' para começar (25 min foco + 5 min pausa).",
      "A cada 4 sessões, você ganha um intervalo longo de 15 min.",
      "As sessões são registradas automaticamente nos relatórios.",
      "Personalize os tempos nas Configurações.",
    ],
  },
  {
    icon: CalendarRange, title: "Plano Semanal", color: "text-teal-500",
    desc: "Monte sua grade semanal de estudos com horários fixos.",
    steps: [
      "Defina quais matérias estudar em cada dia da semana.",
      "Adicione horários específicos para cada sessão.",
      "Visualize sua semana completa de uma vez.",
    ],
  },
  {
    icon: FileQuestion, title: "Simulados", color: "text-orange-500",
    desc: "Simulados ENEM gerados por IA com análise de desempenho por área.",
    steps: [
      "Escolha a área de conhecimento (Linguagens, Humanas, etc.).",
      "Selecione a quantidade de questões (5 a 20).",
      "Responda as questões no formato ENEM com tempo controlado.",
      "Veja seu desempenho detalhado ao final com explicações.",
      "Acompanhe sua evolução por área nos Relatórios.",
    ],
  },
  {
    icon: CreditCard, title: "Flashcards", color: "text-pink-500",
    desc: "Crie cartões de memorização com repetição espaçada.",
    steps: [
      "Crie cards com pergunta na frente e resposta no verso.",
      "Organize por área do ENEM (Linguagens, Humanas, etc.).",
      "Pratique virando os cards e avaliando seu conhecimento.",
      "Cards marcados como 'Dominados' saem da revisão ativa.",
      "O Mentor pode criar flashcards automaticamente durante o chat!",
    ],
  },
  {
    icon: Target, title: "Metas", color: "text-green-500",
    desc: "Defina e acompanhe metas de estudo com progresso visual.",
    steps: [
      "Crie metas com título, valor alvo e unidade de medida.",
      "Atualize o progresso manualmente conforme avança.",
      "Acompanhe a porcentagem e barra de progresso de cada meta.",
    ],
  },
  {
    icon: BookOpen, title: "Caderno", color: "text-yellow-600",
    desc: "Editor de documentos completo estilo Word com ribbon, formatação avançada e exportação.",
    steps: [
      "Clique em 'Nova Nota' para começar ou abra um documento existente.",
      "Use a ribbon com abas: Início, Inserir, Desenhar, Design, Layout, Referências, Revisão, Exibir e Ajuda.",
      "Formate texto com negrito, itálico, sublinhado, cores, fontes e alinhamento.",
      "Insira imagens, tabelas, equações LaTeX, formas e caixas de texto.",
      "Use Ctrl+F para localizar e substituir texto no documento.",
      "Exporte como PDF, DOCX, HTML ou TXT pelo menu Arquivo.",
      "Acesse informações do projeto em Arquivo > Sobre ou no botão 'Sobre' na ribbon.",
      "Atalhos do Caderno: Ctrl+S (salvar), Ctrl+Z (desfazer), Ctrl+B (negrito), Ctrl+I (itálico).",
    ],
  },
  {
    icon: Languages, title: "Sala de Idiomas", color: "text-violet-500",
    desc: "Cursos completos de idiomas com lições, exercícios e prova oral.",
    steps: [
      "Escolha o idioma: Inglês, Espanhol, Alemão, Italiano, Mandarim ou Português.",
      "Selecione um nível: Básico, Intermediário, Avançado ou Fluência.",
      "Cada módulo tem: Lição, Exercícios, Conversação, Texto e Prova Oral.",
      "Use o Professor Virtual para ouvir o conteúdo no idioma nativo.",
      "Módulos de 'Vida no Exterior' ensinam habilidades práticas.",
    ],
  },
  {
    icon: Languages, title: "Tradução de Textos", color: "text-sky-500",
    desc: "Traduza textos ou PDFs entre 6 idiomas com IA.",
    steps: [
      "Selecione idioma de origem e destino.",
      "Digite o texto ou faça upload de PDF (até 50 páginas).",
      "Clique em 'Traduzir' para obter a tradução via IA.",
      "Copie o resultado ou limpe para recomeçar.",
      "Idiomas: Português, Inglês, Espanhol, Alemão, Italiano e Mandarim.",
    ],
  },
  {
    icon: School, title: "Salas de Conhecimento", color: "text-emerald-500",
    desc: "Ambientes de estudo com aulas completas geradas pelo Mentor IA e progressão por tópico.",
    steps: [
      "Navegue por: Concursos, Ensino Médio, Fundamental, Tendências 2025/2026.",
      "Clique em uma sala para ver os tópicos disponíveis.",
      "O Mentor gera aulas completas com teoria, exemplos e exercícios.",
      "Use o botão de áudio para ouvir o conteúdo narrado.",
      "Crie suas próprias salas personalizadas com ícones de emoji.",
      "Apenas salas criadas por você podem ser excluídas — as do sistema são protegidas.",
      "Marque tópicos como concluídos para acompanhar seu progresso na sala.",
    ],
  },
  {
    icon: BarChart3, title: "Relatórios", color: "text-blue-600",
    desc: "Dashboard analítico com gráficos, radar de desempenho e impressão profissional.",
    steps: [
      "Visualize métricas de horas, tarefas, flashcards e simulados.",
      "Use as abas: Visão Geral, Tempo, Simulados, Tarefas e Imprimir.",
      "O Radar de Desempenho mostra seu perfil por área do ENEM.",
      "Imprima relatórios individuais ou o Relatório Completo profissional.",
      "Os relatórios incluem badges de status, prioridades coloridas e análise detalhada.",
    ],
  },
  {
    icon: FileText, title: "Backup e Segurança", color: "text-amber-500",
    desc: "Backup automático e manual para proteger seus dados.",
    steps: [
      "O backup automático é salvo ao inserir ou alterar dados.",
      "Vá em Configurações > Dados > Backup Completo para salvar manualmente.",
      "O botão 'Sair' no menu lateral força um backup antes de fechar.",
      "Restaure backups a qualquer momento em Configurações > Dados > Restaurar.",
    ],
  },
];

const FAQ = [
  { q: "Como salvar meus dados?", a: "Os dados são salvos automaticamente no navegador. Para backup manual, vá em Configurações > Dados > Fazer Backup. O botão 'Sair' também salva automaticamente." },
  { q: "Posso usar em outro dispositivo?", a: "Use o Backup/Restaurar nas Configurações para transferir dados entre dispositivos." },
  { q: "O Mentor precisa de internet?", a: "Sim, o Mentor usa IA que requer conexão com a internet." },
  { q: "Posso imprimir meus dados?", a: "Sim! Acesse Relatórios > aba Imprimir para gerar relatórios profissionais de qualquer módulo." },
  { q: "Como o Mentor memoriza informações?", a: "Use [MEMORIZAR] antes de uma frase no chat. Ex: '[MEMORIZAR] Tenho prova de matemática dia 15'." },
  { q: "Como mudar a persona do Mentor?", a: "Vá em Configurações > Mentor > Personalidade. Escolha entre 6 opções: Formal, Descolado, Feminino, Masculino, Robô ou Jovem." },
  { q: "O que são os modos do Mentor?", a: "São 9 especializações: Livre (conversa aberta), Aula (teoria passo a passo), Socrático (só perguntas), Redação (correção ENEM C1-C5), Debate (contra-argumentação), Revisão (quiz espaçado), Exercícios (resolução guiada), Entrevista (simulação) e Brainstorm (ideias para redação)." },
  { q: "Como o Mentor cria flashcards e tarefas?", a: "Durante a conversa, o Mentor sugere ações com botões clicáveis. Clique em 'Criar Flashcard' ou 'Criar Tarefa' para adicionar diretamente ao sistema." },
  { q: "Perdi meus dados, o que fazer?", a: "Se fez backup, vá em Configurações > Dados > Restaurar Backup e selecione o arquivo .json." },
  { q: "Como funciona a avaliação de respostas do Mentor?", a: "Após cada resposta, aparece 'Foi útil? Sim/Não'. Isso ajuda o sistema a entender suas preferências e melhorar as respostas futuras." },
  { q: "Como exportar conversa para o Caderno?", a: "No chat do Mentor, clique no ícone de livro (📖) no header. A conversa inteira será salva como uma nota formatada no seu Caderno." },
  { q: "Como funciona o Radar de Desempenho?", a: "Em Relatórios > Simulados, o radar mostra sua taxa de acerto em cada área do ENEM (Linguagens, Humanas, Natureza, Matemática, Redação) em formato visual." },
  { q: "O que faz o botão 'Sair'?", a: "Baixa automaticamente um backup completo antes de fechar, garantindo que nenhuma informação seja perdida." },
];

const SHORTCUTS = [
  { keys: "Enter", desc: "Enviar mensagem no chat do Mentor" },
  { keys: "Shift + Enter", desc: "Quebrar linha no chat" },
  { keys: "Ctrl + K", desc: "Abrir paleta de comandos no Planner" },
  { keys: "Esc", desc: "Fechar diálogos e modais" },
];

const TIPS = [
  { icon: "🎯", title: "Estude em blocos", desc: "Use o Pomodoro para sessões de 25 min com pausas. Isso mantém o foco e evita fadiga mental." },
  { icon: "🧠", title: "Revisão espaçada", desc: "Use o modo Revisão do Mentor e flashcards para revisar tópicos em intervalos crescentes." },
  { icon: "✍️", title: "Pratique redação", desc: "Use o modo Redação do Mentor para receber correção detalhada por competências do ENEM (C1 a C5)." },
  { icon: "📊", title: "Acompanhe o progresso", desc: "Verifique os Relatórios semanalmente para identificar áreas fracas e ajustar seus estudos." },
  { icon: "💬", title: "Pergunte ao Mentor", desc: "Não tenha vergonha de perguntar! O Mentor adapta a explicação ao seu nível de compreensão." },
  { icon: "📌", title: "Fixe explicações", desc: "No chat do Mentor, fixe mensagens importantes para acessá-las rapidamente depois." },
];

export default function AjudaPage() {
  const [search, setSearch] = useState("");
  const [showTour, setShowTour] = useState(false);
  const normalizedSearch = search.toLowerCase().trim();

  const filteredModules = useMemo(() => normalizedSearch ? MODULES.filter(m => m.title.toLowerCase().includes(normalizedSearch) || m.desc.toLowerCase().includes(normalizedSearch) || m.steps.some(s => s.toLowerCase().includes(normalizedSearch))) : MODULES, [normalizedSearch]);
  const filteredFAQ = useMemo(() => normalizedSearch ? FAQ.filter(f => f.q.toLowerCase().includes(normalizedSearch) || f.a.toLowerCase().includes(normalizedSearch)) : FAQ, [normalizedSearch]);
  const filteredShortcuts = useMemo(() => normalizedSearch ? SHORTCUTS.filter(s => s.keys.toLowerCase().includes(normalizedSearch) || s.desc.toLowerCase().includes(normalizedSearch)) : SHORTCUTS, [normalizedSearch]);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {showTour && <Suspense fallback={null}><GuidedTour onClose={() => setShowTour(false)} /></Suspense>}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Central de Ajuda
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Aprenda a usar todas as ferramentas do sistema</p>
        </div>
        <Button onClick={() => setShowTour(true)} className="gap-2 w-full sm:w-auto">
          <PlayCircle className="h-4 w-4" /> Sala de Aula Interativa
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Localizar módulo, pergunta ou atalho..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Tips */}
      {!normalizedSearch && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {TIPS.map(tip => (
            <Card key={tip.title} className="border-0 shadow-sm">
              <CardContent className="p-3 sm:p-4 flex items-start gap-3">
                <span className="text-xl shrink-0">{tip.icon}</span>
                <div>
                  <p className="text-xs font-semibold">{tip.title}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{tip.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No results */}
      {normalizedSearch && filteredModules.length === 0 && filteredFAQ.length === 0 && filteredShortcuts.length === 0 && (
        <Card><CardContent className="p-6 text-center">
          <Search className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum resultado para "<strong>{search}</strong>"</p>
        </CardContent></Card>
      )}

      {/* Modules */}
      {filteredModules.length > 0 && (
        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Guia dos Módulos
            {normalizedSearch && <Badge variant="secondary" className="text-[10px]">{filteredModules.length}</Badge>}
          </h2>
          <Accordion type="multiple" className="space-y-2">
            {filteredModules.map(mod => (
              <AccordionItem key={mod.title} value={mod.title} className="border rounded-lg px-3 sm:px-4">
                <AccordionTrigger className="hover:no-underline py-2.5 sm:py-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <mod.icon className={`h-4 w-4 shrink-0 ${mod.color}`} />
                    <div className="text-left">
                      <p className="text-xs sm:text-sm font-medium">{mod.title}</p>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground font-normal line-clamp-1">{mod.desc}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="space-y-2 ml-5 sm:ml-7">
                    {mod.steps.map((step, i) => (
                      <li key={i} className="text-[11px] sm:text-xs text-muted-foreground flex items-start gap-2">
                        <Badge variant="secondary" className="text-[9px] h-4 w-4 flex items-center justify-center shrink-0 p-0 rounded-full">{i + 1}</Badge>
                        {step}
                      </li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* FAQ */}
      {filteredFAQ.length > 0 && (
        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-3">
            Perguntas Frequentes
            {normalizedSearch && <Badge variant="secondary" className="text-[10px] ml-2">{filteredFAQ.length}</Badge>}
          </h2>
          <Accordion type="multiple" className="space-y-2">
            {filteredFAQ.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border rounded-lg px-3 sm:px-4">
                <AccordionTrigger className="text-xs sm:text-sm hover:no-underline py-2.5 sm:py-3">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-[11px] sm:text-xs text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* Shortcuts */}
      {filteredShortcuts.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-primary" /> Atalhos do Teclado
          </CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredShortcuts.map(s => (
                <div key={s.keys} className="flex items-center gap-3">
                  <kbd className="px-2 py-1 text-[10px] sm:text-[11px] font-mono bg-accent rounded border text-foreground">{s.keys}</kbd>
                  <span className="text-[11px] sm:text-xs text-muted-foreground">{s.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technology stack */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Tecnologias Utilizadas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { name: "React 18", desc: "Biblioteca de interface" },
              { name: "TypeScript", desc: "Tipagem estática" },
              { name: "Vite", desc: "Build e bundler" },
              { name: "Tailwind CSS", desc: "Estilização utilitária" },
              { name: "TipTap v3", desc: "Editor de texto rico" },
              { name: "Supabase", desc: "Backend e banco de dados" },
              { name: "Shadcn/ui", desc: "Componentes de UI" },
              { name: "Recharts", desc: "Gráficos e visualizações" },
              { name: "React Router", desc: "Navegação SPA" },
              { name: "Framer Motion", desc: "Animações" },
              { name: "Lucide Icons", desc: "Ícones vetoriais" },
              { name: "Web Speech API", desc: "Voz e reconhecimento" },
            ].map(t => (
              <div key={t.name} className="bg-muted/50 rounded-lg p-2.5">
                <p className="text-[11px] font-semibold">{t.name}</p>
                <p className="text-[9px] text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-[10px] text-muted-foreground text-center pb-4">
        Projeto desenvolvido por <strong>Jimmy Veiga</strong> — © 2025
      </p>
    </div>
  );
}
