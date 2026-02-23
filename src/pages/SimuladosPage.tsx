import { useState, useMemo, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText, CheckCircle2, XCircle, RotateCcw, Trophy, BarChart3,
  BookOpen, PenTool, Clock, ChevronRight, Lightbulb, Target, Printer,
  Sparkles, Upload, Loader2, FileUp, Brain, X, GraduationCap, TrendingUp
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useUserName } from "@/hooks/useUserName";
import { EnemArea, ENEM_AREAS } from "@/types/study";
import { QUESTIONS, type Question } from "@/data/questionBank";
import { OFFLINE_QUESTIONS, getQuestionsForArea } from "@/data/offlineQuestionBank";
import { toast } from "sonner";



interface SimuladoResult {
  id: string;
  date: string;
  area: EnemArea | 'misto';
  total: number;
  correct: number;
  answers: { qId: string; selected: number; correct: number }[];
}

interface PdfKnowledge {
  id: string;
  fileName: string;
  title: string;
  summary: string;
  keyTopics: string[];
  keyFacts: string[];
  examples: string[];
  connections: string;
  rawText: string;
  uploadedAt: string;
  classroom?: {
    subject: string;
    level: string;
    modules: { id: string; title: string; topics: string[]; keyContent: string }[];
    studyGuide: string;
    practiceQuestions: string[];
  };
}

const DIFFICULTY_LABELS = { facil: '🟢 Fácil', medio: '🟡 Médio', dificil: '🔴 Difícil' };
const FALLBACK_AREA = { label: 'Geral', color: 'bg-muted-foreground' };
const getArea = (area: string) => ENEM_AREAS[area as EnemArea] ?? FALLBACK_AREA;

type AreaOption = { value: string; label: string; icon: typeof BookOpen; gradient: string; aiOnly?: boolean };

const SIMULADO_CATEGORIES = [
  {
    id: 'enem',
    label: '🎯 ENEM',
    description: 'Áreas do ENEM com banco de questões',
    areas: [
      { value: 'misto', label: 'Simulado Misto (Todas)', icon: Target, gradient: 'from-primary to-ms-purple' },
      { value: 'linguagens', label: 'Linguagens', icon: BookOpen, gradient: 'from-enem-linguagens to-primary' },
      { value: 'humanas', label: 'Ciências Humanas', icon: BookOpen, gradient: 'from-enem-humanas to-ms-orange' },
      { value: 'natureza', label: 'Ciências da Natureza', icon: BookOpen, gradient: 'from-enem-natureza to-ms-teal' },
      { value: 'matematica', label: 'Matemática', icon: BookOpen, gradient: 'from-enem-matematica to-ms-purple' },
      { value: 'redacao', label: 'Redação', icon: PenTool, gradient: 'from-enem-redacao to-ms-orange' },
    ] as AreaOption[],
  },
  {
    id: 'fundamental',
    label: '📗 Ensino Fundamental',
    description: 'Matérias do Ensino Fundamental',
    areas: [
      { value: 'ef-portugues', label: 'Português', icon: BookOpen, gradient: 'from-enem-linguagens to-primary', aiOnly: true },
      { value: 'ef-matematica', label: 'Matemática', icon: BookOpen, gradient: 'from-enem-matematica to-ms-purple', aiOnly: true },
      { value: 'ef-ciencias', label: 'Ciências', icon: BookOpen, gradient: 'from-enem-natureza to-ms-teal', aiOnly: true },
      { value: 'ef-historia', label: 'História', icon: BookOpen, gradient: 'from-enem-humanas to-ms-orange', aiOnly: true },
      { value: 'ef-geografia', label: 'Geografia', icon: BookOpen, gradient: 'from-ms-teal to-enem-humanas', aiOnly: true },
      { value: 'ef-ingles', label: 'Inglês', icon: BookOpen, gradient: 'from-primary to-ms-teal', aiOnly: true },
    ] as AreaOption[],
  },
  {
    id: 'medio',
    label: '📘 Ensino Médio',
    description: 'Matérias do Ensino Médio',
    areas: [
      { value: 'em-portugues', label: 'Língua Portuguesa', icon: BookOpen, gradient: 'from-enem-linguagens to-primary', aiOnly: true },
      { value: 'em-literatura', label: 'Literatura', icon: BookOpen, gradient: 'from-enem-redacao to-ms-orange', aiOnly: true },
      { value: 'em-matematica', label: 'Matemática', icon: BookOpen, gradient: 'from-enem-matematica to-ms-purple', aiOnly: true },
      { value: 'em-fisica', label: 'Física', icon: BookOpen, gradient: 'from-ms-purple to-enem-matematica', aiOnly: true },
      { value: 'em-quimica', label: 'Química', icon: BookOpen, gradient: 'from-enem-natureza to-ms-teal', aiOnly: true },
      { value: 'em-biologia', label: 'Biologia', icon: BookOpen, gradient: 'from-ms-teal to-enem-natureza', aiOnly: true },
      { value: 'em-historia', label: 'História', icon: BookOpen, gradient: 'from-enem-humanas to-ms-orange', aiOnly: true },
      { value: 'em-geografia', label: 'Geografia', icon: BookOpen, gradient: 'from-ms-teal to-enem-humanas', aiOnly: true },
      { value: 'em-filosofia', label: 'Filosofia', icon: BookOpen, gradient: 'from-ms-purple to-primary', aiOnly: true },
      { value: 'em-sociologia', label: 'Sociologia', icon: BookOpen, gradient: 'from-enem-humanas to-primary', aiOnly: true },
    ] as AreaOption[],
  },
  {
    id: 'concursos',
    label: '🏛️ Concursos',
    description: 'Disciplinas para concursos públicos',
    areas: [
      { value: 'conc-portugues', label: 'Língua Portuguesa', icon: BookOpen, gradient: 'from-enem-linguagens to-primary', aiOnly: true },
      { value: 'conc-rlm', label: 'Raciocínio Lógico', icon: BookOpen, gradient: 'from-enem-matematica to-ms-purple', aiOnly: true },
      { value: 'conc-informatica', label: 'Informática', icon: BookOpen, gradient: 'from-ms-teal to-primary', aiOnly: true },
      { value: 'conc-constitucional', label: 'Dir. Constitucional', icon: BookOpen, gradient: 'from-enem-humanas to-ms-orange', aiOnly: true },
      { value: 'conc-administrativo', label: 'Dir. Administrativo', icon: BookOpen, gradient: 'from-ms-orange to-enem-humanas', aiOnly: true },
      { value: 'conc-etica', label: 'Ética no Serv. Público', icon: BookOpen, gradient: 'from-ms-purple to-primary', aiOnly: true },
      { value: 'conc-afo', label: 'AFO', icon: BookOpen, gradient: 'from-enem-matematica to-ms-teal', aiOnly: true },
      { value: 'conc-civil', label: 'Direito Civil', icon: BookOpen, gradient: 'from-enem-humanas to-ms-purple', aiOnly: true },
      { value: 'conc-penal', label: 'Direito Penal', icon: BookOpen, gradient: 'from-enem-redacao to-ms-orange', aiOnly: true },
      { value: 'conc-contabilidade', label: 'Contabilidade', icon: BookOpen, gradient: 'from-ms-teal to-enem-matematica', aiOnly: true },
      { value: 'conc-auditoria', label: 'Auditoria', icon: BookOpen, gradient: 'from-ms-purple to-ms-teal', aiOnly: true },
      { value: 'conc-ti', label: 'Tecnologia da Informação', icon: BookOpen, gradient: 'from-primary to-ms-teal', aiOnly: true },
    ] as AreaOption[],
  },
  {
    id: 'tendencias',
    label: '🚀 Tendências 2025/26',
    description: 'Temas contemporâneos',
    areas: [
      { value: 'tend-lgpd', label: 'LGPD', icon: BookOpen, gradient: 'from-ms-purple to-primary', aiOnly: true },
      { value: 'tend-politicas', label: 'Políticas Públicas', icon: BookOpen, gradient: 'from-enem-humanas to-ms-orange', aiOnly: true },
      { value: 'tend-realidade', label: 'Realidade Brasileira', icon: BookOpen, gradient: 'from-ms-teal to-enem-humanas', aiOnly: true },
      { value: 'tend-ingles', label: 'Inglês Instrumental', icon: BookOpen, gradient: 'from-primary to-ms-teal', aiOnly: true },
    ] as AreaOption[],
  },
];

// Flat list for lookup
const ALL_AREA_OPTIONS = SIMULADO_CATEGORIES.flatMap(c => c.areas);

// Map area values to descriptive topic names for AI generation
const AREA_TOPIC_MAP: Record<string, string> = {
  'ef-portugues': 'Português do Ensino Fundamental: gramática básica, ortografia, interpretação de texto, classes de palavras',
  'ef-matematica': 'Matemática do Ensino Fundamental: frações, decimais, equações simples, geometria básica, proporção',
  'ef-ciencias': 'Ciências do Ensino Fundamental: corpo humano, ecologia, estados da matéria, energia, sistema solar',
  'ef-historia': 'História do Ensino Fundamental: civilizações antigas, Brasil colonial, independência do Brasil',
  'ef-geografia': 'Geografia do Ensino Fundamental: cartografia, biomas brasileiros, relevo, hidrografia, população',
  'ef-ingles': 'Inglês básico do Ensino Fundamental: vocabulário, tempos verbais simples, interpretação',
  'em-portugues': 'Língua Portuguesa do Ensino Médio: gramática avançada, sintaxe, morfologia, semântica, redação',
  'em-literatura': 'Literatura Brasileira e Portuguesa: escolas literárias, autores canônicos, análise de obras',
  'em-matematica': 'Matemática do Ensino Médio: funções, trigonometria, geometria analítica, combinatória, estatística',
  'em-fisica': 'Física: cinemática, dinâmica, termodinâmica, óptica, eletricidade, magnetismo, física moderna',
  'em-quimica': 'Química: atomística, ligações, estequiometria, soluções, termoquímica, orgânica, eletroquímica',
  'em-biologia': 'Biologia: citologia, genética, ecologia, evolução, fisiologia humana, botânica, zoologia',
  'em-historia': 'História: história geral e do Brasil, antiguidade à contemporaneidade, guerras, revoluções',
  'em-geografia': 'Geografia: geopolítica, urbanização, globalização, meio ambiente, clima, questão agrária',
  'em-filosofia': 'Filosofia: antiga, medieval, moderna, contemporânea, ética, política, epistemologia',
  'em-sociologia': 'Sociologia: clássica, estratificação, movimentos sociais, cultura, cidadania, trabalho',
  'conc-portugues': 'Língua Portuguesa para concursos: gramática, interpretação, redação oficial, padrão ofício',
  'conc-rlm': 'Raciocínio Lógico-Matemático: proposições, tabelas-verdade, conjuntos, probabilidade, contagem',
  'conc-informatica': 'Noções de Informática: Windows, Linux, Suite Office, segurança da informação, redes',
  'conc-constitucional': 'Direito Constitucional: direitos fundamentais, organização do Estado, princípios constitucionais',
  'conc-administrativo': 'Direito Administrativo: regime jurídico, licitações Lei 14.133/2021, improbidade, atos administrativos',
  'conc-etica': 'Ética no Serviço Público: Decreto 1.171/94, código de ética, deveres e proibições',
  'conc-afo': 'Administração Financeira e Orçamentária: PPA, LDO, LOA, ciclo orçamentário, despesa pública',
  'conc-civil': 'Direito Civil: pessoas, obrigações, contratos, responsabilidade civil, prescrição e decadência',
  'conc-penal': 'Direito Penal: princípios, teoria do crime, penas, crimes contra a administração pública',
  'conc-contabilidade': 'Contabilidade Geral e Pública: balanço patrimonial, DRE, MCASP, demonstrações contábeis',
  'conc-auditoria': 'Auditoria: normas, procedimentos, tipos de auditoria, controle interno e externo',
  'conc-ti': 'Tecnologia da Informação: engenharia de software, banco de dados, redes, segurança, governança COBIT/ITIL',
  'tend-lgpd': 'LGPD - Lei Geral de Proteção de Dados: princípios, bases legais, direitos do titular, ANPD, sanções',
  'tend-politicas': 'Políticas Públicas: ciclo de políticas, implementação, avaliação, orçamento participativo',
  'tend-realidade': 'Realidade Brasileira: questões sociais, ambientais, econômicas contemporâneas, reforma tributária EC 132/2023',
  'tend-ingles': 'Inglês Instrumental: leitura e interpretação técnica, vocabulário especializado, cognatos',
};

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  
  for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item: any) => item.str).join(' ');
    pages.push(text);
  }
  
  return pages.join('\n\n');
}

export default function SimuladosPage() {
  const userName = useUserName();
  const [results, setResults] = useLocalStorage<SimuladoResult[]>('simulado-results', []);
  const [pdfKnowledge, setPdfKnowledge] = useLocalStorage<PdfKnowledge[]>('pdf-knowledge', []);
  const [activeTab, setActiveTab] = useState('iniciar');
  const [activeCategory, setActiveCategory] = useState('enem');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Config state
  const [selectedArea, setSelectedArea] = useState<string>('misto');
  const [questionCount, setQuestionCount] = useState(10);

  // Simulado state
  const [inProgress, setInProgress] = useState(false);
  const [simQuestions, setSimQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  // Question bank browsing
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const selectedAreaOpt = ALL_AREA_OPTIONS.find(a => a.value === selectedArea);
  const isAiOnly = selectedAreaOpt?.aiOnly === true;

  // Count available questions for the selected area (including offline bank)
  const availableCount = useMemo(() => {
    if (selectedArea === 'misto') return QUESTIONS.length + OFFLINE_QUESTIONS.length;
    const enem = QUESTIONS.filter(q => q.area === selectedArea).length;
    const offline = OFFLINE_QUESTIONS.filter(q => q.area === selectedArea).length;
    if (enem > 0) return enem;
    if (offline > 0) return offline + QUESTIONS.length; // complement from ENEM bank
    return QUESTIONS.length; // full ENEM bank as final fallback
  }, [selectedArea]);

  const filteredQuestions = useMemo(() =>
    QUESTIONS.filter(q =>
      (filterArea === 'all' || q.area === filterArea) &&
      (filterDifficulty === 'all' || q.difficulty === filterDifficulty)
    ), [filterArea, filterDifficulty]);

  // Start simulado — uses offline bank for aiOnly areas, ENEM bank for ENEM areas
  const startSimuladoFromBank = () => {
    localStorage.setItem("simulado-offline-mode", "true");

    let pool: Array<Question | typeof OFFLINE_QUESTIONS[0]>;

    if (selectedArea === 'misto') {
      // Mix ENEM + all offline questions
      pool = [...QUESTIONS, ...OFFLINE_QUESTIONS].sort(() => Math.random() - 0.5);
    } else {
      const enemPool = QUESTIONS.filter(q => q.area === selectedArea);
      if (enemPool.length > 0) {
        pool = [...enemPool].sort(() => Math.random() - 0.5);
      } else {
        // aiOnly area — use offline bank + ENEM complement
        pool = getQuestionsForArea(selectedArea, questionCount, QUESTIONS);
      }
    }

    const count = Math.min(questionCount, pool.length);
    const shuffled = pool.slice(0, count) as Question[];
    setSimQuestions(shuffled);
    setAnswers({});
    setCurrentQ(0);
    setShowResult(false);
    setInProgress(true);
    setActiveTab('simulado');
  };


  const removePdfKnowledge = (id: string) => {
    setPdfKnowledge(prev => prev.filter(k => k.id !== id));
    toast.success('Material removido');
  };

  const selectAnswer = (qId: string, idx: number) => {
    setAnswers(prev => ({ ...prev, [qId]: idx }));
  };

  const finishSimulado = () => {
    const correct = simQuestions.filter(q => answers[q.id] === q.correctIndex).length;
    const result: SimuladoResult = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      area: simQuestions.length > 0 && simQuestions.every(q => q.area === simQuestions[0].area) ? simQuestions[0].area : 'misto',
      total: simQuestions.length,
      correct,
      answers: simQuestions.map(q => ({ qId: q.id, selected: answers[q.id] ?? -1, correct: q.correctIndex })),
    };
    setResults(prev => [result, ...prev]);
    setShowResult(true);
  };

  const totalAnswered = Object.keys(answers).length;
  const currentQuestion = simQuestions[currentQ];

  // Stats
  const totalSimulados = results.length;
  const avgScore = results.length > 0 ? Math.round(results.reduce((a, r) => a + (r.correct / r.total) * 100, 0) / results.length) : 0;
  const bestScore = results.length > 0 ? Math.round(Math.max(...results.map(r => (r.correct / r.total) * 100))) : 0;

  // ── Print helpers ──
  const printQuestions = useCallback(() => {
    const areaLabel = selectedArea === 'misto' ? 'Misto' : ENEM_AREAS[selectedArea as EnemArea]?.label ?? selectedArea;
    const qs = simQuestions.length > 0 ? simQuestions : (() => {
      const pool = selectedArea === 'misto' ? [...QUESTIONS] : QUESTIONS.filter(q => q.area === selectedArea);
      return pool.sort(() => Math.random() - 0.5).slice(0, Math.min(questionCount, pool.length));
    })();

    const html = `<h1>Simulado – ${areaLabel}</h1><p style="color:#64748b;font-size:13px;">${qs.length} questões • Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>` +
      qs.map((q, i) => {
        const area = getArea(q.area);
        return `<div class="card"><p><strong>Questão ${i + 1}</strong> <span class="badge ${q.area}">${area.label}</span> <span style="font-size:11px;color:#64748b;">${q.subject} • ${DIFFICULTY_LABELS[q.difficulty] ?? q.difficulty}</span></p>
        <p>${q.question}</p>
        ${q.options.map((o, j) => `<p style="margin:4px 0;">  <strong>${String.fromCharCode(65 + j)})</strong> ${o}</p>`).join('')}
        </div>`;
      }).join('');

    openPrintWindow('Simulado – Questões', html, userName);
  }, [simQuestions, selectedArea, questionCount]);

  const printGabarito = useCallback(() => {
    if (simQuestions.length === 0) return;
    const areaLabel = simQuestions.every(q => q.area === simQuestions[0].area) ? getArea(simQuestions[0].area).label : 'Misto';
    const correct = simQuestions.filter(q => answers[q.id] === q.correctIndex).length;

    const html = `<h1>Gabarito – ${areaLabel}</h1>
      <p style="color:#64748b;font-size:13px;">${simQuestions.length} questões • ${correct}/${simQuestions.length} acertos (${Math.round(correct / simQuestions.length * 100)}%) • ${new Date().toLocaleDateString('pt-BR')}</p>
      <table><thead><tr><th>#</th><th>Área</th><th>Disciplina</th><th>Sua Resposta</th><th>Correta</th><th>Resultado</th></tr></thead><tbody>` +
      simQuestions.map((q, i) => {
        const ua = answers[q.id];
        const isOk = ua === q.correctIndex;
        return `<tr><td>${i + 1}</td><td><span class="badge ${q.area}">${getArea(q.area).label}</span></td><td>${q.subject}</td>
          <td>${ua !== undefined ? String.fromCharCode(65 + ua) : '—'}</td>
          <td><strong>${String.fromCharCode(65 + q.correctIndex)}</strong></td>
          <td style="color:${isOk ? '#22c55e' : '#ef4444'};font-weight:600;">${isOk ? '✓ Acerto' : '✗ Erro'}</td></tr>`;
      }).join('') +
      `</tbody></table>
      <h2>Correção Detalhada</h2>` +
      simQuestions.map((q, i) => {
        const ua = answers[q.id];
        const isOk = ua === q.correctIndex;
        return `<div class="card" style="border-left:4px solid ${isOk ? '#22c55e' : '#ef4444'}">
          <p><strong>Questão ${i + 1}</strong> – ${isOk ? '✓ Acerto' : '✗ Erro'}</p>
          <p>${q.question}</p>
          ${q.options.map((o, j) => {
            const style = j === q.correctIndex ? 'color:#22c55e;font-weight:600;' : (j === ua && !isOk ? 'color:#ef4444;text-decoration:line-through;' : 'color:#64748b;');
            return `<p style="margin:3px 0;${style}"><strong>${String.fromCharCode(65 + j)})</strong> ${o}${j === q.correctIndex ? ' ✓' : ''}${j === ua && !isOk ? ' ✗' : ''}</p>`;
          }).join('')}
          <p style="background:#f1f5f9;padding:8px;border-radius:6px;font-size:13px;margin-top:8px;"><strong>💡 Explicação:</strong> ${q.explanation}</p>
        </div>`;
      }).join('');

    openPrintWindow('Gabarito Comentado', html, userName);
  }, [simQuestions, answers]);

  

  const isOfflineMode = localStorage.getItem("simulado-offline-mode") === "true";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />Simulados & Banco de Questões
        </h1>
        <p className="text-sm text-muted-foreground">Configure, resolva e imprima simulados com gabarito comentado</p>
        <Badge variant="outline" className="gap-1 mt-1 border-primary/40 text-primary">
            ✅ Modo 100% Offline — Banco de questões local ativo
          </Badge>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3">
        <div className="grid grid-cols-3 gap-3 flex-1">
          <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalSimulados}</p>
            <p className="text-[11px] text-muted-foreground">Simulados Realizados</p>
          </CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-ms-green">{avgScore}%</p>
            <p className="text-[11px] text-muted-foreground">Média de Acertos</p>
          </CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-ms-purple">{bestScore}%</p>
            <p className="text-[11px] text-muted-foreground">Melhor Resultado</p>
          </CardContent></Card>
        </div>
        {totalSimulados > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0" title="Zerar estatísticas">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Zerar Estatísticas</AlertDialogTitle>
                <AlertDialogDescription>
                  Deseja zerar todas as estatísticas e o histórico de simulados? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => { setResults([]); toast.success('Estatísticas zeradas com sucesso!'); }}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-5 h-auto sm:h-10 gap-1">
          <TabsTrigger value="iniciar">🎯 Configurar</TabsTrigger>
          <TabsTrigger value="questoes">📚 Questões</TabsTrigger>
          <TabsTrigger value="simulado" disabled={!inProgress && !showResult}>📝 Simulado</TabsTrigger>
          <TabsTrigger value="materiais">📄 Materiais</TabsTrigger>
          <TabsTrigger value="historico">📊 Histórico</TabsTrigger>
        </TabsList>

        {/* ── CONFIGURAR ── */}
        <TabsContent value="iniciar" className="space-y-5 mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-semibold text-lg">Configure seu Simulado</h3>

              {/* Category tabs */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Nível / Categoria</label>
                <div className="flex gap-2 flex-wrap">
                  {SIMULADO_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setActiveCategory(cat.id); setSelectedArea(cat.areas[0].value); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        activeCategory === cat.id
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {SIMULADO_CATEGORIES.find(c => c.id === activeCategory)?.description}
                </p>
              </div>

              {/* Area selection within category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Área do conhecimento</label>
              {isAiOnly && (
                  <p className="text-[10px] text-primary bg-primary/5 border border-primary/20 rounded-lg px-2.5 py-1.5">
                    📚 Banco local disponível — questões reais desta categoria + complemento do banco ENEM. 100% offline e gratuito.
                  </p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {(SIMULADO_CATEGORIES.find(c => c.id === activeCategory)?.areas || []).map(opt => {
                    const Icon = opt.icon;
                    const isSelected = selectedArea === opt.value;
                    const localCount = opt.value === 'misto' ? QUESTIONS.length : QUESTIONS.filter(q => q.area === opt.value).length;
                    const bankCount = opt.aiOnly ? QUESTIONS.length : localCount;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedArea(opt.value)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/40 hover:bg-accent/30'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${opt.gradient} flex items-center justify-center mb-1.5`}>
                          <Icon className="h-3.5 w-3.5 text-white" />
                        </div>
                        <p className="text-xs font-medium leading-tight">{opt.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {(() => {
                            const offlineCount = OFFLINE_QUESTIONS.filter(q => q.area === opt.value).length;
                            if (opt.value === 'misto') return `${QUESTIONS.length + OFFLINE_QUESTIONS.length} questões`;
                            if (offlineCount > 0) return `${offlineCount}+ questões`;
                            return `${opt.aiOnly ? QUESTIONS.length : (QUESTIONS.filter(q => q.area === opt.value).length || QUESTIONS.length)} questões`;
                          })()}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question count */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Quantidade de questões</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={availableCount}
                      value={questionCount}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        const max = availableCount;
                        if (!isNaN(v)) setQuestionCount(Math.max(1, Math.min(v, max)));
                      }}
                      className="w-20 h-9 rounded-md border border-input bg-background px-3 text-sm text-center font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <span className="text-xs text-muted-foreground">de {availableCount}</span>
                  </div>
                </div>
                <Slider
                  value={[questionCount]}
                  onValueChange={([v]) => setQuestionCount(v)}
                  min={1}
                  max={Math.max(1, availableCount)}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>1 questão</span>
                  <span>{`${availableCount} questões (máx.)`}</span>
                </div>
              </div>


              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="lg" onClick={startSimuladoFromBank} className="gap-2 flex-1 min-w-[180px]">
                  <Target className="h-4 w-4" /> Iniciar Simulado
                </Button>
                <Button size="lg" variant="outline" onClick={printQuestions} className="gap-2">
                  <Printer className="h-4 w-4" /> Imprimir Questões
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-accent/30">
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2"><Lightbulb className="h-4 w-4 text-ms-orange" />Dicas</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>Banco de questões:</strong> Selecione a área e inicie o simulado com as questões do banco</li>
                <li>• <strong>Simulado misto:</strong> Mistura questões de todas as áreas</li>
                <li>• <strong>Imprimir:</strong> Imprima questões para praticar no papel</li>
                <li>• A IA gera no máximo 30 questões por vez para manter a qualidade</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── BANCO DE QUESTÕES ── */}
        <TabsContent value="questoes" className="space-y-4 mt-4">
          <div className="flex gap-2 flex-wrap">
            <Select value={filterArea} onValueChange={setFilterArea}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Área" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as áreas</SelectItem>
                {Object.entries(ENEM_AREAS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Dificuldade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="facil">🟢 Fácil</SelectItem>
                <SelectItem value="medio">🟡 Médio</SelectItem>
                <SelectItem value="dificil">🔴 Difícil</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="self-center">{filteredQuestions.length} questões</Badge>
          </div>

          <div className="space-y-3">
            {filteredQuestions.map((q) => (
              <Card key={q.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${getArea(q.area).color} text-white border-0 text-[10px]`}>{getArea(q.area).label}</Badge>
                    <Badge variant="outline" className="text-[10px]">{q.subject}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{DIFFICULTY_LABELS[q.difficulty]}</Badge>
                  </div>
                  <p className="text-sm font-medium">{q.question}</p>
                  <div className="space-y-1.5 mt-2">
                    {q.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedQuestion(q); setShowAnswer(true); }}
                        className={`w-full text-left text-xs p-2.5 rounded-lg border transition-colors ${
                          showAnswer && selectedQuestion?.id === q.id
                            ? i === q.correctIndex ? 'bg-ms-green/10 border-ms-green font-medium' : 'border-border text-muted-foreground'
                            : 'border-border hover:border-primary hover:bg-accent/50'
                        }`}
                      >
                        <span className="font-semibold mr-2">{String.fromCharCode(65 + i)})</span>{opt}
                        {showAnswer && selectedQuestion?.id === q.id && i === q.correctIndex && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-ms-green inline ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                  {showAnswer && selectedQuestion?.id === q.id && (
                    <div className="bg-accent/40 p-3 rounded-lg mt-2">
                      <p className="text-xs font-semibold text-primary mb-1">💡 Explicação</p>
                      <p className="text-xs text-muted-foreground">{q.explanation}</p>
                    </div>
                  )}
                  {!(showAnswer && selectedQuestion?.id === q.id) && (
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setSelectedQuestion(q); setShowAnswer(true); }}>
                      Ver resposta e explicação
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── SIMULADO EM ANDAMENTO ── */}
        <TabsContent value="simulado" className="space-y-4 mt-4">
          {showResult ? (
            <div className="space-y-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center space-y-3">
                  <Trophy className="h-12 w-12 mx-auto text-ms-orange" />
                  <h3 className="text-xl font-bold">Simulado Finalizado!</h3>
                  <div className="flex justify-center gap-6">
                    <div>
                      <p className="text-3xl font-bold text-ms-green">{simQuestions.filter(q => answers[q.id] === q.correctIndex).length}</p>
                      <p className="text-xs text-muted-foreground">Acertos</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-destructive">{simQuestions.filter(q => answers[q.id] !== q.correctIndex).length}</p>
                      <p className="text-xs text-muted-foreground">Erros</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-primary">{Math.round((simQuestions.filter(q => answers[q.id] === q.correctIndex).length / simQuestions.length) * 100)}%</p>
                      <p className="text-xs text-muted-foreground">Aproveitamento</p>
                    </div>
                  </div>
                  <Progress value={(simQuestions.filter(q => answers[q.id] === q.correctIndex).length / simQuestions.length) * 100} className="h-3" />
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    <Button variant="outline" onClick={() => { setInProgress(false); setShowResult(false); setActiveTab('iniciar'); }}>
                      <RotateCcw className="h-4 w-4 mr-1" />Novo Simulado
                    </Button>
                    <Button variant="outline" onClick={printGabarito}>
                      <Printer className="h-4 w-4 mr-1" />Imprimir Gabarito
                    </Button>
                    <Button variant="outline" onClick={printQuestions}>
                      <Printer className="h-4 w-4 mr-1" />Imprimir Questões
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <h3 className="font-semibold text-sm">📋 Correção Detalhada</h3>
              <div className="space-y-3">
                {simQuestions.map((q, idx) => {
                  const userAnswer = answers[q.id];
                  const isCorrect = userAnswer === q.correctIndex;
                  return (
                    <Card key={q.id} className={`border-0 shadow-sm ${isCorrect ? 'ring-1 ring-ms-green/30' : 'ring-1 ring-destructive/30'}`}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          {isCorrect ? <CheckCircle2 className="h-5 w-5 text-ms-green shrink-0" /> : <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                          <span className="text-xs font-semibold">Questão {idx + 1}</span>
                          <Badge className={`${getArea(q.area).color} text-white border-0 text-[10px]`}>{getArea(q.area).label}</Badge>
                          <Badge variant="outline" className="text-[10px]">{q.subject}</Badge>
                        </div>
                        <p className="text-sm font-medium">{q.question}</p>
                        <div className="space-y-1">
                          {q.options.map((opt, i) => (
                            <div key={i} className={`text-xs p-2 rounded-lg flex items-center gap-2 ${
                              i === q.correctIndex ? 'bg-ms-green/10 border border-ms-green/30 font-medium' :
                              i === userAnswer && !isCorrect ? 'bg-destructive/10 border border-destructive/30 line-through' :
                              'text-muted-foreground'
                            }`}>
                              <span className="font-semibold">{String.fromCharCode(65 + i)})</span>
                              {opt}
                              {i === q.correctIndex && <CheckCircle2 className="h-3.5 w-3.5 text-ms-green ml-auto shrink-0" />}
                              {i === userAnswer && !isCorrect && <XCircle className="h-3.5 w-3.5 text-destructive ml-auto shrink-0" />}
                            </div>
                          ))}
                        </div>
                        <div className="bg-accent/40 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-primary mb-1">💡 Explicação</p>
                          <p className="text-xs text-muted-foreground">{q.explanation}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : inProgress && currentQuestion ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Questão {currentQ + 1} de {simQuestions.length}</Badge>
                  <Badge className={`${getArea(currentQuestion.area).color} text-white border-0 text-[10px]`}>{getArea(currentQuestion.area).label}</Badge>
                  <Badge variant="outline" className="text-[10px]">{currentQuestion.subject}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">{totalAnswered}/{simQuestions.length} respondidas</span>
              </div>
              <Progress value={(currentQ + 1) / simQuestions.length * 100} className="h-2" />

              <Card className="border-0 shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <p className="font-medium">{currentQuestion.question}</p>
                  <div className="space-y-2">
                    {currentQuestion.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => selectAnswer(currentQuestion.id, i)}
                        className={`w-full text-left p-3 rounded-lg border transition-all text-sm flex items-center gap-3 ${
                          answers[currentQuestion.id] === i
                            ? 'border-primary bg-primary/5 font-medium ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50 hover:bg-accent/30'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          answers[currentQuestion.id] === i ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground'
                        }`}>{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" disabled={currentQ === 0} onClick={() => setCurrentQ(p => p - 1)}>← Anterior</Button>
                <div className="flex gap-2">
                  {currentQ < simQuestions.length - 1 ? (
                    <Button onClick={() => setCurrentQ(p => p + 1)}>Próxima →</Button>
                  ) : (
                    <Button onClick={finishSimulado} disabled={totalAnswered < simQuestions.length} className="bg-ms-green hover:bg-ms-green/90">
                      <Trophy className="h-4 w-4 mr-1" />Finalizar
                    </Button>
                  )}
                </div>
              </div>

              {/* Question navigator */}
              <div className="flex gap-1.5 flex-wrap justify-center">
                {simQuestions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQ(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      i === currentQ ? 'bg-primary text-primary-foreground' :
                      answers[q.id] !== undefined ? 'bg-ms-green/20 text-ms-green border border-ms-green/30' :
                      'bg-accent text-muted-foreground'
                    }`}
                  >{i + 1}</button>
                ))}
              </div>
            </div>
          ) : (
            <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center text-muted-foreground">
              Selecione um simulado na aba "Configurar" para começar
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ── MATERIAIS (PDF Knowledge) ── */}
        <TabsContent value="materiais" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">📄 Materiais enviados ao Mentor</h3>
            <Badge variant="secondary">{pdfKnowledge.length} material(is)</Badge>
          </div>

          {pdfKnowledge.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center text-muted-foreground space-y-3">
                <Brain className="h-10 w-10 mx-auto text-muted-foreground/50" />
                <p>Nenhum material enviado ainda</p>
                <p className="text-xs">Envie PDFs na aba "Configurar" para que o Mentor aprenda sobre seus materiais de estudo</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pdfKnowledge.map(k => (
                <Card key={k.id} className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-ms-orange shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{k.title}</p>
                          <p className="text-[10px] text-muted-foreground">{k.fileName} • {new Date(k.uploadedAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removePdfKnowledge(k.id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {k.summary && <p className="text-xs text-muted-foreground bg-accent/40 p-2.5 rounded-lg">{k.summary}</p>}
                    {k.keyTopics.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {k.keyTopics.map((t, i) => <Badge key={i} variant="outline" className="text-[10px]">{t}</Badge>)}
                      </div>
                    )}
                    {k.keyFacts && k.keyFacts.length > 0 && (
                      <div className="bg-accent/20 p-2.5 rounded-lg space-y-1">
                        <p className="text-[10px] font-semibold text-primary">📌 Fatos-chave</p>
                        <ul className="text-[10px] text-muted-foreground space-y-0.5 list-disc list-inside">
                          {k.keyFacts.slice(0, 5).map((f, i) => <li key={i}>{f}</li>)}
                          {k.keyFacts.length > 5 && <li className="text-primary">+{k.keyFacts.length - 5} mais...</li>}
                        </ul>
                      </div>
                    )}
                    {k.classroom && (
                      <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          <span className="text-xs font-semibold text-primary">Sala de Aula: {k.classroom.subject}</span>
                          <Badge variant="secondary" className="text-[10px]">{k.classroom.level}</Badge>
                        </div>
                        <div className="space-y-1">
                          {k.classroom.modules.map((m, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <BookOpen className="h-3 w-3 shrink-0" />
                              <span className="font-medium">{m.title}</span>
                              <span className="text-muted-foreground/60">— {m.topics.slice(0, 3).join(', ')}</span>
                            </div>
                          ))}
                        </div>
                        {k.classroom.studyGuide && (
                          <p className="text-[10px] text-muted-foreground italic">📖 {k.classroom.studyGuide}</p>
                        )}
                      </div>
                    )}
                    {k.connections && <p className="text-[10px] text-muted-foreground italic">🔗 {k.connections}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── HISTÓRICO ── */}
        <TabsContent value="historico" className="space-y-4 mt-4">
          {results.length === 0 ? (
            <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center text-muted-foreground">
              <BarChart3 className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
              Nenhum simulado realizado ainda
            </CardContent></Card>
          ) : (
            <>
              {/* Evolution chart */}
              {results.length >= 2 && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Evolução de Desempenho
                    </h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[...results].reverse().map((r, i) => ({
                          name: `#${i + 1}`,
                          score: Math.round((r.correct / r.total) * 100),
                          date: new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                          <Tooltip formatter={(v: number) => [`${v}%`, 'Acerto']} />
                          <Line type="monotone" dataKey="score" className="stroke-primary" strokeWidth={2} dot={{ r: 4, className: "fill-primary" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Per-area breakdown */}
              {(() => {
                const areaStats: Record<string, { total: number; correct: number; count: number }> = {};
                results.forEach(r => {
                  const key = r.area;
                  if (!areaStats[key]) areaStats[key] = { total: 0, correct: 0, count: 0 };
                  areaStats[key].total += r.total;
                  areaStats[key].correct += r.correct;
                  areaStats[key].count += 1;
                });
                const entries = Object.entries(areaStats);
                return entries.length > 1 ? (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold mb-3">📊 Desempenho por Área</h3>
                      <div className="space-y-2">
                        {entries.map(([area, s]) => {
                          const pct = Math.round((s.correct / s.total) * 100);
                          return (
                            <div key={area} className="flex items-center gap-3">
                              <span className="text-xs font-medium w-28 truncate">
                                {area === 'misto' ? 'Misto' : ENEM_AREAS[area as EnemArea]?.label || area}
                              </span>
                              <Progress value={pct} className="flex-1 h-2" />
                              <span className={`text-xs font-bold w-10 text-right ${pct >= 70 ? 'text-ms-green' : pct >= 50 ? 'text-ms-orange' : 'text-destructive'}`}>{pct}%</span>
                              <span className="text-[10px] text-muted-foreground w-16">{s.count} sim.</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })()}

              {/* Results list */}
              <div className="space-y-3">
                {results.map(r => (
                  <Card key={r.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            (r.correct / r.total) >= 0.7 ? 'bg-ms-green/10' : (r.correct / r.total) >= 0.5 ? 'bg-ms-orange/10' : 'bg-destructive/10'
                          }`}>
                            <span className={`text-lg font-bold ${
                              (r.correct / r.total) >= 0.7 ? 'text-ms-green' : (r.correct / r.total) >= 0.5 ? 'text-ms-orange' : 'text-destructive'
                            }`}>{Math.round((r.correct / r.total) * 100)}%</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {r.area === 'misto' ? 'Simulado Misto' : ENEM_AREAS[r.area as EnemArea]?.label || r.area}
                            </p>
                            <p className="text-xs text-muted-foreground">{r.correct}/{r.total} acertos • {new Date(r.date).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <Progress value={(r.correct / r.total) * 100} className="w-24 h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Print window helper ──
function openPrintWindow(title: string, bodyHtml: string, footerName?: string) {
  const win = window.open('', '_blank');
  if (!win) {
    toast.error('Popup bloqueada pelo navegador. Permita popups para este site.');
    return;
  }
  const name = footerName || 'Estudante';
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1a1a2e; line-height: 1.6; }
  h1 { color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
  h2 { color: #6366f1; margin-top: 24px; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-size: 13px; }
  th { background: #f1f5f9; font-weight: 600; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; color: white; margin-right: 4px; }
  .linguagens { background: #3b82f6; } .humanas { background: #f97316; }
  .natureza { background: #22c55e; } .matematica { background: #a855f7; }
  .redacao { background: #ef4444; } .misto { background: #6366f1; }
  .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin: 8px 0; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  @media print { body { padding: 20px; } }
</style></head><body>${bodyHtml}
<div class="footer">Sistema de Estudos de ${name} • ${new Date().toLocaleDateString('pt-BR')}</div>
</body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 300);
}
