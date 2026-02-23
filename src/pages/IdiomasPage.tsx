import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import {
  BookOpen, GraduationCap, Mic, PenTool, FileText, Loader2,
  ChevronRight, CheckCircle2, Star, Volume2, Eye, Pause, Play,
  ArrowLeft, RotateCcw, FastForward,
  Globe, MessageCircle, MapPin, Plane, Home, Heart, ShoppingCart, Briefcase,
  Phone, AlertCircle, Utensils, Building2, Sparkles, Target, TrendingUp,
  Clock, Award, Flame, Zap, BookMarked, Languages, MicOff, Square, Send
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ExportPDF } from "@/components/ExportPDF";
import { LanguageDiagnostic } from "@/components/LanguageDiagnostic";
import {
  generateOfflineLesson, generateOfflineExercise, generateOfflineConversation,
  generateOfflineText, generateOfflineOral, evaluateTextOffline, evaluateSpeechOffline
} from "@/data/offlineLessons";
import { MandarinAlphabetSection } from "@/components/MandarinAlphabetSection";
import { LanguageAlphabetSection } from "@/components/LanguageAlphabetSection";

import heroImg from "@/assets/idiomas-hero.jpg";
import englishImg from "@/assets/lang-english.jpg";
import spanishImg from "@/assets/lang-spanish.jpg";
import germanImg from "@/assets/lang-german.jpg";
import portugueseImg from "@/assets/lang-portuguese.jpg";
import italianImg from "@/assets/lang-italian.jpg";
import mandarinImg from "@/assets/lang-mandarin.jpg";

// ==================== CONSTANTS ====================
const FUNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/language-classroom`;
const AUTH_HEADER = { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` };

const LANGUAGES = [
  { id: "english", name: "English", flag: "EN", desc: "Iniciante ao Avançado", img: englishImg, speechLang: "en-US", color: "from-blue-500 to-indigo-600", accent: "bg-blue-500", lightBg: "bg-blue-50 dark:bg-blue-950/30", countries: "EUA, Reino Unido, Austrália, Canadá" },
  { id: "spanish", name: "Español", flag: "ES", desc: "Iniciante ao Avançado", img: spanishImg, speechLang: "es-ES", color: "from-orange-500 to-red-600", accent: "bg-orange-500", lightBg: "bg-orange-50 dark:bg-orange-950/30", countries: "Espanha, México, Argentina, Colômbia" },
  { id: "german", name: "Deutsch", flag: "DE", desc: "Iniciante ao Avançado", img: germanImg, speechLang: "de-DE", color: "from-yellow-500 to-amber-600", accent: "bg-yellow-500", lightBg: "bg-yellow-50 dark:bg-yellow-950/30", countries: "Alemanha, Áustria, Suíça" },
  { id: "italian", name: "Italiano", flag: "IT", desc: "Iniciante ao Avançado", img: italianImg, speechLang: "it-IT", color: "from-emerald-500 to-green-700", accent: "bg-emerald-500", lightBg: "bg-emerald-50 dark:bg-emerald-950/30", countries: "Itália, Suíça, San Marino" },
  { id: "mandarin", name: "中文 Mandarim", flag: "ZH", desc: "Iniciante ao Avançado", img: mandarinImg, speechLang: "zh-CN", color: "from-red-500 to-rose-700", accent: "bg-red-500", lightBg: "bg-red-50 dark:bg-red-950/30", countries: "China, Taiwan, Singapura" },
  { id: "portuguese", name: "Português BR", flag: "BR", desc: "Iniciante ao Avançado", img: portugueseImg, speechLang: "pt-BR", color: "from-green-500 to-emerald-600", accent: "bg-green-500", lightBg: "bg-green-50 dark:bg-green-950/30", countries: "Brasil, Portugal" },
];

// Module icons removed - using numeric indexes instead

const REAL_LIFE_ICONS: Record<string, React.ElementType> = {
  "Alugando um Apartamento": Home, "No Supermercado": ShoppingCart, "No Hospital/Médico": AlertCircle,
  "Entrevista de Emprego": Briefcase, "No Restaurante": Utensils, "No Banco/Correios": Building2,
  "Ligação Telefônica Formal": Phone, "Renting an Apartment": Home, "At the Supermarket": ShoppingCart,
  "At the Hospital": AlertCircle, "Job Interview": Briefcase, "At a Restaurant": Utensils,
  "At the Bank/Post Office": Building2, "Formal Phone Call": Phone,
  "Alquilar un Piso": Home, "En el Supermercado": ShoppingCart, "En el Hospital": AlertCircle,
  "Entrevista de Trabajo": Briefcase, "En el Restaurante": Utensils, "En el Banco": Building2,
  "Wohnung mieten": Home, "Im Supermarkt": ShoppingCart, "Beim Arzt": AlertCircle,
  "Vorstellungsgespräch": Briefcase, "Im Restaurant": Utensils, "Bei der Bank": Building2,
  "Affittare un Appartamento": Home, "Al Supermercato": ShoppingCart, "Dal Medico": AlertCircle,
  "Colloquio di Lavoro": Briefcase, "Al Ristorante": Utensils, "In Banca": Building2,
};

// ==================== TYPES ====================
interface LessonData { title: string; explanation: string; vocabulary: { term: string; translation: string; example: string }[]; culturalNote: string; practicePrompt: string; }
interface ExerciseData { title: string; questions: { id: number; type: string; question: string; options?: string[]; correctAnswer: string; explanation: string }[]; }
interface OralData { title: string; readingPassage: string; pronunciationTips: string[]; conversationPrompts: string[]; vocabularyFocus: { word: string; phonetic: string; tip: string }[]; }
interface TextData { title: string; text: string; glossary: { word: string; meaning: string }[]; comprehensionQuestions: { question: string; answer: string }[]; }
interface EvalData { score: number; feedback: string; corrections: any[]; tips: string[]; encouragement: string; }
interface SpeechEvalData { score: number; transcription: string; feedback: string; corrections: { original: string; corrected: string; explanation: string }[]; pronunciation_tips: string[]; vocabulary_suggestions: string[]; encouragement: string; fluency_level: string; next_challenge: string; }
interface ConversationData { title: string; scenario: string; dialogue: { speaker: string; line: string; translation: string }[]; keyPhrases: { phrase: string; meaning: string; usage: string }[]; practiceTask: string; }
interface LanguageProgress { [langId: string]: { [moduleId: string]: { completed: boolean; score: number; } } }

// ==================== CLEAN TEXT FOR SPEECH ====================
function cleanTextForSpeech(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/[#*`_\[\]]/g, "");
  // Strip emojis but preserve CJK characters and compatibility forms (FE30-FE4F)
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2702}-\u{27B0}]/gu, "");
  cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
  return cleaned;
}

// Preload voices — Chrome loads them asynchronously
let voicesLoaded = false;
function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis?.getVoices() || [];
    if (voices.length > 0) { voicesLoaded = true; resolve(voices); return; }
    if (voicesLoaded) { resolve(voices); return; }
    const onVoicesChanged = () => {
      voicesLoaded = true;
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
    // Fallback timeout
    setTimeout(() => { voicesLoaded = true; resolve(window.speechSynthesis?.getVoices() || []); }, 2000);
  });
}
// Trigger voice loading early
if (window.speechSynthesis) window.speechSynthesis.getVoices();

// ==================== SPEECH SYNTHESIS WITH HIGHLIGHTING ====================
let currentVolume = 0.8;
let currentHighlightCallback: ((index: number) => void) | null = null;
let currentEndCallback: (() => void) | null = null;

function splitSentences(text: string): string[] {
  const cleaned = cleanTextForSpeech(text);
  // Split on sentence-ending punctuation (including CJK: 。！？；：) followed by space or end
  const sentences = cleaned.split(/(?<=[.!?:;。！？；：])\s*/).filter(s => s.trim().length > 0);
  return sentences.length > 0 ? sentences : [cleaned];
}

async function speakWithHighlight(
  text: string,
  langCode: string,
  onHighlight?: (sentenceIndex: number) => void,
  onEnd?: () => void
) {
  if (!window.speechSynthesis) { toast.error("Seu navegador não suporta síntese de voz"); return; }
  window.speechSynthesis.cancel();

  const sentences = splitSentences(text);
  let currentIndex = 0;

  currentHighlightCallback = onHighlight || null;
  currentEndCallback = onEnd || null;

  // Ensure voices are loaded before speaking (critical for Chrome + CJK languages)
  const voices = await ensureVoicesLoaded();
  const langPrefix = langCode.split("-")[0];
  const isCJK = ["zh", "ja", "ko"].includes(langPrefix);

  // Pre-select the best voice once
  const exactMatches = voices.filter(v => v.lang === langCode);
  const prefixMatches = voices.filter(v => v.lang.startsWith(langPrefix) && !exactMatches.includes(v));

  const findPremium = (list: SpeechSynthesisVoice[]) => list.find(v =>
    v.name.toLowerCase().includes("premium") ||
    v.name.toLowerCase().includes("neural") ||
    v.name.toLowerCase().includes("enhanced") ||
    v.name.toLowerCase().includes("natural") ||
    v.name.toLowerCase().includes("google") ||
    v.name.toLowerCase().includes("microsoft")
  );

  const selectedVoice =
    findPremium(exactMatches) ||
    exactMatches[0] ||
    findPremium(prefixMatches) ||
    prefixMatches[0];

  const speakNext = () => {
    if (currentIndex >= sentences.length) {
      currentHighlightCallback = null;
      currentEndCallback = null;
      onEnd?.();
      return;
    }

    onHighlight?.(currentIndex);

    const utterance = new SpeechSynthesisUtterance(sentences[currentIndex]);
    utterance.lang = langCode;
    // CJK languages need slower rate for clarity (tones matter in Chinese)
    utterance.rate = isCJK ? 0.75 : 0.85;
    utterance.pitch = 1;
    utterance.volume = currentVolume;

    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onend = () => {
      currentIndex++;
      speakNext();
    };

    utterance.onerror = (e) => {
      const errorType = (e as any)?.error || "";
      // On interrupted/canceled, stop completely — do NOT continue to next sentence
      if (errorType === "interrupted" || errorType === "canceled") {
        return;
      }
      console.warn("Speech error on sentence:", sentences[currentIndex], e);
      currentIndex++;
      speakNext();
    };

    window.speechSynthesis.speak(utterance);
  };

  speakNext();
}

function speak(text: string, langCode: string, onEnd?: () => void) {
  speakWithHighlight(text, langCode, undefined, onEnd);
}

function stopSpeaking() {
  window.speechSynthesis.cancel();
  currentHighlightCallback = null;
  currentEndCallback = null;
}

function SpeakButton({ text, langCode, size = "sm", label }: { text: string; langCode: string; size?: "sm" | "icon"; label?: string }) {
  const [playing, setPlaying] = useState(false);

  // Sync with global speech state
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaying(window.speechSynthesis?.speaking || false);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.speechSynthesis?.speaking) {
      stopSpeaking();
      setPlaying(false);
    } else {
      speak(text, langCode, () => setPlaying(false));
      setPlaying(true);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost" size={size === "icon" ? "icon" : "sm"}
          onClick={handleClick}
          className={size === "icon" ? "h-7 w-7 hover:bg-primary/10" : "h-7 gap-1 px-2 hover:bg-primary/10"}
          aria-label={playing ? "Parar áudio" : `Ouvir: ${text.substring(0, 50)}`}
        >
          {playing ? <Square className="h-3 w-3 text-destructive" /> : <Volume2 className={size === "icon" ? "h-3.5 w-3.5 text-primary" : "h-3 w-3 text-primary"} />}
          {label && <span className="text-[10px]">{playing ? "Parar" : label}</span>}
        </Button>
      </TooltipTrigger>
      <TooltipContent><p>Ouvir pronúncia</p></TooltipContent>
    </Tooltip>
  );
}

// ==================== CURRICULUM: Iniciante / Intermediário / Avançado ====================
const CURRICULUM: Record<string, { levels: { id: string; name: string; modules: { id: string; title: string; topics: string[] }[] }[] }> = {
  english: { levels: [
    { id: "iniciante", name: "Beginner (A1-A2)", modules: [
      { id: "foundations", title: "Foundations & Phonics", topics: ["The English Alphabet & Phonetic Sounds (IPA basics)", "Vowel sounds: short vs long vowels", "Consonant clusters & silent letters", "Greetings: Hello, Hi, Hey — formal vs informal", "Introducing yourself: My name is... / I'm from...", "Numbers 1-1000, ordinals & phone numbers", "Days, months, seasons & dates"] },
      { id: "survival", title: "Survival English", topics: ["Essential phrases for getting around", "Asking for help: Excuse me, Can you help me?", "At the airport & immigration", "Using public transportation", "Emergency vocabulary: police, hospital, fire", "Reading signs, menus & basic documents", "Money, prices & making purchases"] },
      { id: "grammar1", title: "Core Grammar I", topics: ["Subject pronouns & verb 'to be'", "Articles: a, an, the — when to use each", "Present Simple: affirmative, negative, questions", "Adverbs of frequency: always, usually, sometimes, never", "There is / There are + prepositions of place", "Demonstratives: this, that, these, those", "Possessives: my, your, his, her, its, our, their"] },
      { id: "daily-life", title: "Daily Life & Routines", topics: ["Daily routine verbs & time expressions", "Telling the time: o'clock, half past, quarter to", "Family members & relationships", "Describing people: appearance & personality", "Home & household vocabulary", "Weather expressions & small talk", "Hobbies & free time activities"] },
      { id: "grammar2", title: "Core Grammar II", topics: ["Present Continuous: actions happening now", "Present Simple vs Present Continuous", "Countable & Uncountable nouns: much/many, some/any", "Imperative mood: instructions & directions", "Past Simple: regular verbs (-ed pronunciation)", "Past Simple: irregular verbs (go-went, see-saw)", "Past Simple vs Past Continuous"] },
      { id: "practical1", title: "Real-World Communication", topics: ["Ordering food at a restaurant", "Shopping: sizes, colors, trying on clothes", "Making appointments: doctor, dentist, salon", "Asking for and giving directions", "Describing symptoms to a doctor", "Filling out simple forms", "Writing a short personal email"] },
      { id: "listening1", title: "Listening & Pronunciation Lab", topics: ["Minimal pairs: ship/sheep, bat/bet, cat/cut", "Word stress patterns in English", "Sentence stress & rhythm", "Linking sounds: connected speech", "Listening to short dialogues & answering questions", "Understanding native speaker speed (slow to natural)", "Shadowing technique practice"] },
    ]},
    { id: "intermediario", name: "Intermediate (B1-B2)", modules: [
      { id: "grammar3", title: "Grammar Expansion", topics: ["Present Perfect: experience, result, duration (for/since)", "Present Perfect vs Past Simple: the key difference", "Present Perfect Continuous: ongoing situations", "Future forms: will vs going to vs Present Continuous", "First & Second Conditionals", "Relative Clauses: who, which, that, where", "Passive Voice: present & past"] },
      { id: "vocabulary-builder", title: "Academic Vocabulary Builder", topics: ["Word formation: prefixes & suffixes (un-, re-, -tion, -ment)", "Collocations: make vs do, take vs get", "Phrasal verbs: essential 50 for daily life", "Synonyms & antonyms for richer expression", "Context clues: guessing meaning from context", "Academic Word List (AWL) — most frequent 100 words", "Register: formal vs informal vocabulary"] },
      { id: "reading-writing", title: "Reading & Writing Skills", topics: ["Skimming & scanning techniques", "Identifying main idea vs supporting details", "Paragraph structure: topic sentence, body, conclusion", "Writing emails: formal, semi-formal, informal", "Essay structure: introduction, body paragraphs, conclusion", "Linking words & cohesive devices (however, moreover, therefore)", "Summarizing & paraphrasing techniques"] },
      { id: "speaking", title: "Fluency & Conversation", topics: ["Expressing opinions: I think, I believe, In my opinion", "Agreeing & disagreeing politely", "Describing experiences & telling stories (narrative tenses)", "Giving advice: should, ought to, had better, why don't you", "Making comparisons: comparative, superlative, as...as", "Discussing pros & cons of an issue", "Role-plays: real-world scenarios"] },
      { id: "listening2", title: "Advanced Listening & Media", topics: ["Understanding news broadcasts (CNN, BBC)", "Listening to podcasts & TED Talks", "Note-taking strategies while listening", "Understanding different English accents (American, British, Australian)", "Intonation patterns: questions, lists, emphasis", "Idiomatic expressions in context", "Dictation exercises for accuracy"] },
      { id: "grammar4", title: "Grammar Mastery", topics: ["Third Conditional & Mixed Conditionals", "Reported Speech: statements, questions, commands", "Modal verbs for deduction: must, might, can't, could", "Wish & If only for regrets and desires", "Gerunds vs Infinitives: complete guide", "Used to, be used to, get used to", "Causative: have/get something done"] },
      { id: "business-intro", title: "Introduction to Business English", topics: ["Professional email writing", "Telephone English & conference calls", "Making and responding to requests", "Describing charts, graphs & trends", "Meeting language: agenda, minutes, action items", "Networking & small talk at events", "Company descriptions & job responsibilities"] },
    ]},
    { id: "avancado", name: "Advanced (C1-C2)", modules: [
      { id: "advanced-grammar", title: "Advanced Grammar & Style", topics: ["Cleft sentences: It is... that/who", "Inversion for emphasis: Never have I..., Rarely does...", "Subjunctive mood: suggest that he go...", "Participle clauses: Having finished, she left", "Advanced passive: It is said that..., He is believed to...", "Ellipsis & substitution in discourse", "Nominalization: transforming verbs into noun phrases"] },
      { id: "academic-english", title: "Academic English & Research", topics: ["Critical reading: analyzing arguments & bias", "Academic writing: thesis statements & evidence", "APA/MLA citation basics", "Hedging language: tend to, it appears, arguably", "Writing literature reviews & abstracts", "Presenting research findings", "Peer review & constructive feedback"] },
      { id: "toefl-ielts", title: "TOEFL & IELTS Preparation", topics: ["TOEFL Reading: strategies for long academic passages", "TOEFL Listening: lecture comprehension & note-taking", "TOEFL Speaking: integrated & independent tasks", "TOEFL Writing: integrated essay & academic discussion", "IELTS Writing Task 1: describing data & processes", "IELTS Writing Task 2: argument & discussion essays", "IELTS Speaking: fluency, coherence & pronunciation scoring"] },
      { id: "professional", title: "Professional & Executive English", topics: ["Delivering persuasive presentations", "Negotiation tactics & language", "Cross-cultural communication in the workplace", "Writing reports, proposals & executive summaries", "Leading meetings & facilitating discussions", "Job interviews: behavioral questions (STAR method)", "Public speaking: structure, rhetoric & body language"] },
      { id: "idioms-culture", title: "Idioms, Slang & American Culture", topics: ["100 most common American idioms & their origins", "Phrasal verbs in context: advanced usage", "Slang vs Standard English: when to use each", "Cultural references: sports, holidays, traditions", "Humor & sarcasm in English", "Regional dialects: Southern, New York, Midwest", "Pop culture vocabulary: movies, music, social media"] },
      { id: "debate-critical", title: "Debate & Critical Thinking", topics: ["Structuring an argument: claim, evidence, warrant", "Logical fallacies: how to identify & avoid them", "Debating current events & social issues", "Persuasive writing techniques", "Evaluating sources: credibility & reliability", "Constructing counterarguments", "Formal debate format & practice"] },
      { id: "living-abroad", title: "Living in the USA", topics: ["Renting an Apartment: lease terms, deposits, utilities", "At the Supermarket: brands, sales, loyalty programs", "Healthcare: insurance, doctor visits, prescriptions", "Job Interview: resume, cover letter, follow-up", "At a Restaurant: tipping culture, dietary requests", "Banking: checking/savings accounts, credit scores", "DMV, Social Security & government services"] },
    ]},
  ]},
  spanish: { levels: [
    { id: "iniciante", name: "Principiante (A1-A2)", modules: [
      { id: "fonetica-es", title: "Fonética y Pronunciación", topics: ["El alfabeto español y sonidos únicos (ñ, rr, ll)", "Vocales abiertas y cerradas", "Diferencias de pronunciación España vs Latinoamérica", "Saludos formales e informales: Hola, Buenos días, ¿Qué tal?", "Presentarse: Me llamo..., Soy de..., Tengo... años", "Números 1-1000, ordinales y teléfonos", "Días, meses, estaciones y fechas"] },
      { id: "supervivencia-es", title: "Español de Supervivencia", topics: ["Frases esenciales para viajeros", "Pedir ayuda: Perdone, ¿Puede ayudarme?", "En el aeropuerto y la aduana", "Transporte público: metro, autobús, taxi", "Emergencias: policía, hospital, bomberos", "Leer carteles, menús y documentos básicos", "Dinero, precios y hacer compras"] },
      { id: "gramatica1-es", title: "Gramática Esencial I", topics: ["Pronombres personales y verbo SER vs ESTAR", "Artículos: el/la/los/las, un/una/unos/unas", "Presente de indicativo: verbos regulares (-ar, -er, -ir)", "Verbos irregulares esenciales: ir, tener, hacer, poder, querer", "Hay / Está / Están + preposiciones de lugar", "Adjetivos: género, número y concordancia", "Posesivos: mi, tu, su, nuestro, vuestro"] },
      { id: "vida-diaria-es", title: "Vida Cotidiana", topics: ["Rutina diaria: verbos reflexivos (levantarse, ducharse)", "Decir la hora: en punto, y media, y cuarto, menos cuarto", "La familia y relaciones personales", "Describir personas: aspecto físico y personalidad", "La casa y vocabulario doméstico", "El clima y conversación casual", "Pasatiempos y tiempo libre"] },
      { id: "gramatica2-es", title: "Gramática Esencial II", topics: ["Gustar y verbos similares (encantar, molestar, interesar)", "Contraste: Muy vs Mucho, Bien vs Bueno", "Pretérito indefinido: verbos regulares", "Pretérito indefinido: verbos irregulares (fui, hice, dije, puse)", "Pretérito imperfecto: descripción y hábitos en el pasado", "Contraste indefinido vs imperfecto", "Imperativo afirmativo y negativo"] },
      { id: "practica1-es", title: "Comunicación Real", topics: ["Pedir comida en un restaurante", "Ir de compras: tallas, colores, probarse ropa", "Hacer citas: médico, dentista, peluquería", "Pedir y dar direcciones en la ciudad", "Describir síntomas al médico", "Rellenar formularios simples", "Escribir un email personal corto"] },
      { id: "escucha1-es", title: "Laboratorio de Escucha y Pronunciación", topics: ["Diferencias: b/v, s/z/c, j/g, r/rr", "Acentuación y entonación española", "Enlace de palabras en el habla rápida", "Escuchar diálogos cortos y responder preguntas", "Comprensión de hablantes nativos (velocidad natural)", "Técnica de shadowing con audios", "Variantes regionales: España, México, Argentina"] },
    ]},
    { id: "intermediario", name: "Intermedio (B1-B2)", modules: [
      { id: "gramatica3-es", title: "Expansión Gramatical", topics: ["Pretérito pluscuamperfecto: acciones anteriores al pasado", "Futuro simple vs Ir a + infinitivo", "Condicional simple: hipótesis y cortesía", "Presente de subjuntivo: formación y usos básicos", "Subjuntivo con verbos de deseo, emoción y duda", "Oraciones relativas: que, quien, donde, cuyo", "Voz pasiva: ser + participio vs se pasivo"] },
      { id: "vocabulario-es", title: "Vocabulario Académico y Profesional", topics: ["Formación de palabras: prefijos y sufijos en español", "Colocaciones: hacer/tomar/dar/poner + sustantivo", "Verbos con preposición: depender de, consistir en", "Sinónimos y antónimos para expresión rica", "Vocabulario de la lista académica en español", "Registro: formal vs informal vs coloquial", "Falsos amigos español-portugués"] },
      { id: "lectoescritura-es", title: "Comprensión Lectora y Escritura", topics: ["Técnicas de lectura rápida y detallada", "Identificar idea principal vs detalles de apoyo", "Estructura del párrafo: oración temática y desarrollo", "Escribir emails: formal, semiformal, informal", "Estructura del ensayo: introducción, desarrollo, conclusión", "Conectores: sin embargo, además, por lo tanto, no obstante", "Resumen y paráfrasis en español"] },
      { id: "conversacion-es", title: "Fluidez y Conversación", topics: ["Expresar opiniones: Creo que, Me parece que, En mi opinión", "Acuerdo y desacuerdo cortés", "Narrar experiencias: tiempos narrativos combinados", "Dar consejos: deberías, te recomiendo, ¿por qué no...?", "Comparaciones: más/menos que, tan...como, el/la más...", "Discutir pros y contras de un tema", "Role-plays: situaciones cotidianas y profesionales"] },
      { id: "subjuntivo-avanzado-es", title: "Subjuntivo en Profundidad", topics: ["Subjuntivo vs Indicativo: regla completa", "Subjuntivo con expresiones impersonales", "Oraciones temporales: cuando + subjuntivo (futuro)", "Aunque + indicativo vs subjuntivo", "Imperfecto de subjuntivo: formación y usos", "Condicionales irreales: Si tuviera... haría...", "Subjuntivo en oraciones concesivas y finales"] },
      { id: "medios-es", title: "Medios y Escucha Avanzada", topics: ["Comprender noticias en español (RTVE, CNN en Español)", "Escuchar podcasts y conferencias TED en español", "Estrategias de toma de apuntes mientras se escucha", "Variantes del español: mexicano, argentino, colombiano, caribeño", "Expresiones idiomáticas en contexto real", "Dictados para precisión auditiva", "Modismos y jerga juvenil hispana"] },
      { id: "negocios-es", title: "Español de Negocios", topics: ["Emails profesionales en español", "Llamadas telefónicas y videoconferencias", "Hacer y responder solicitudes formales", "Describir gráficos, datos y tendencias", "Vocabulario de reuniones: orden del día, actas, acuerdos", "Networking y conversación en eventos", "Descripción de empresas y puestos de trabajo"] },
    ]},
    { id: "avancado", name: "Avanzado (C1-C2)", modules: [
      { id: "gramatica-avanzada-es", title: "Gramática y Estilo Avanzados", topics: ["Oraciones concesivas y adversativas complejas", "Perífrasis verbales: ir + gerundio, llevar + gerundio, acabar de", "Estilo indirecto complejo con cambios de tiempo", "Voz pasiva avanzada y construcciones impersonales", "Usos avanzados de SE (6 funciones)", "Conectores del discurso formal", "Nominalización y registro académico"] },
      { id: "dele-prep", title: "Preparación DELE B2/C1/C2", topics: ["DELE Comprensión lectora: textos largos y académicos", "DELE Comprensión auditiva: conferencias y debates", "DELE Expresión escrita: carta formal, ensayo, informe", "DELE Expresión oral: monólogo y conversación guiada", "DELE Estrategias de examen y gestión del tiempo", "DELE Criterios de evaluación y cómo maximizar puntos", "Simulacros de examen DELE completos"] },
      { id: "cultura-hispana", title: "Cultura y Civilización Hispana", topics: ["Literatura: Cervantes, García Márquez, Borges, Neruda", "Cine hispanoamericano: Almodóvar, Cuarón, del Toro", "Historia: Conquista, Independencias, España moderna", "Variedades del español en el mundo (20+ países)", "Humor, sarcasmo y expresiones culturales", "Música: flamenco, reggaetón, cumbia, tango", "Gastronomía regional: tapas, tacos, asado, ceviche"] },
      { id: "profesional-es", title: "Español Profesional y Ejecutivo", topics: ["Presentaciones persuasivas en español", "Negociación y mediación intercultural", "Comunicación intercultural en el trabajo", "Redacción de informes, propuestas y resúmenes ejecutivos", "Liderar reuniones y moderar discusiones", "Entrevistas de trabajo: método STAR en español", "Oratoria: estructura, retórica y lenguaje corporal"] },
      { id: "debate-es", title: "Debate y Pensamiento Crítico", topics: ["Estructurar un argumento: tesis, evidencia, justificación", "Falacias lógicas: identificarlas y evitarlas", "Debatir temas de actualidad hispanoamericana", "Técnicas de escritura persuasiva", "Evaluar fuentes: credibilidad y fiabilidad", "Construir contraargumentos sólidos", "Formato de debate formal y práctica"] },
      { id: "living-abroad-es", title: "Vivir en España/Latinoamérica", topics: ["Alquilar un piso: contrato, fianza, gastos", "En el supermercado: marcas, ofertas, productos locales", "Sanidad: seguridad social, médico de cabecera, urgencias", "Entrevista de trabajo: CV europeo, carta de motivación", "En el restaurante: menú del día, propinas, costumbres", "Banca: cuenta corriente, tarjetas, transferencias", "Trámites: NIE, empadronamiento, seguridad social"] },
    ]},
  ]},
  german: { levels: [
    { id: "iniciante", name: "Anfänger (A1-A2)", modules: [
      { id: "phonetik-de", title: "Phonetik & Aussprache", topics: ["Das deutsche Alphabet und besondere Laute (ä, ö, ü, ß)", "Vokale: kurz vs lang (Bett/Beet, offen/Ofen)", "Konsonantenverbindungen: sch, ch (ich/ach), pf, sp, st", "Begrüßungen: Hallo, Guten Tag, Guten Morgen — formal vs informell", "Sich vorstellen: Ich heiße..., Ich komme aus..., Ich bin... Jahre alt", "Zahlen 1-1000, Ordnungszahlen und Telefonnummern", "Tage, Monate, Jahreszeiten und Datumsangaben"] },
      { id: "ueberleben-de", title: "Überlebens-Deutsch", topics: ["Wichtige Redewendungen für den Alltag", "Um Hilfe bitten: Entschuldigung, Können Sie mir helfen?", "Am Flughafen und bei der Einreise", "Öffentliche Verkehrsmittel: U-Bahn, Bus, Straßenbahn", "Notfälle: Polizei, Krankenhaus, Feuerwehr", "Schilder, Speisekarten und einfache Dokumente lesen", "Geld, Preise und Einkaufen"] },
      { id: "grammatik1-de", title: "Kerngrammatik I", topics: ["Personalpronomen und Verben: sein, haben, werden", "Bestimmte/Unbestimmte Artikel: der/die/das, ein/eine", "Präsens: regelmäßige und unregelmäßige Verben", "Trennbare und untrennbare Verben", "Negation: nicht vs kein (Unterschied und Regeln)", "W-Fragen: Wer, Was, Wo, Wann, Warum, Wie", "Possessivartikel: mein, dein, sein, ihr, unser"] },
      { id: "alltag-de", title: "Alltag & Routinen", topics: ["Tagesablauf: Verben und Zeitausdrücke", "Uhrzeiten: offiziell und umgangssprachlich", "Familie und Beziehungen", "Personen beschreiben: Aussehen und Charakter", "Wohnung und Haushaltsvokabular", "Wetter und Smalltalk", "Hobbys und Freizeit"] },
      { id: "grammatik2-de", title: "Kerngrammatik II", topics: ["Der Akkusativ: Artikel, Pronomen und Verben", "Der Dativ: Artikel, Pronomen und Verben mit Dativ", "Wechselpräpositionen: in, an, auf, über, unter, vor, hinter, neben, zwischen", "Perfekt mit haben: regelmäßige Verben", "Perfekt mit sein: Bewegungs- und Zustandsverben", "Partizip II: regelmäßig und unregelmäßig", "Präteritum von sein, haben und Modalverben"] },
      { id: "praxis1-de", title: "Reale Kommunikation", topics: ["Im Restaurant bestellen", "Einkaufen: Größen, Farben, Kleidung anprobieren", "Termine machen: Arzt, Zahnarzt, Friseur", "Nach dem Weg fragen und Wegbeschreibung geben", "Symptome beim Arzt beschreiben", "Einfache Formulare ausfüllen", "Eine kurze persönliche E-Mail schreiben"] },
      { id: "hoeren1-de", title: "Hör- und Aussprachelabor", topics: ["Minimale Paare: Bett/Beet, Höhle/Hölle, fühlen/füllen", "Wortbetonung im Deutschen", "Satzmelodie und Rhythmus", "Laute verbinden: Verschmelzung im gesprochenen Deutsch", "Kurze Dialoge hören und Fragen beantworten", "Muttersprachler verstehen (langsam bis natürlich)", "Shadowing-Technik üben"] },
    ]},
    { id: "intermediario", name: "Mittelstufe (B1-B2)", modules: [
      { id: "grammatik3-de", title: "Grammatikerweiterung", topics: ["Nebensätze: weil/da, dass, wenn/als, ob", "Relativsätze: der/die/das + Relativpronomen", "Konjunktiv II: Wünsche, irreale Bedingungen, Höflichkeit", "Passiv: Vorgangspassiv und Zustandspassiv", "Genitiv: Artikel, Präpositionen (wegen, trotz, während)", "Adjektivdeklination: alle drei Typen komplett", "Indirekte Rede: Konjunktiv I"] },
      { id: "wortschatz-de", title: "Akademischer Wortschatzaufbau", topics: ["Wortbildung: Komposita, Vorsilben und Nachsilben", "Nomen-Verb-Verbindungen: eine Entscheidung treffen, Bescheid geben", "Funktionsverbgefüge: in Betracht ziehen, zur Verfügung stellen", "Synonyme und Antonyme für reicheren Ausdruck", "Kontexthinweise: Bedeutung aus dem Kontext erschließen", "Akademischer Wortschatz: die 100 wichtigsten Wörter", "Register: formell vs informell vs umgangssprachlich"] },
      { id: "lesen-schreiben-de", title: "Lesen & Schreiben", topics: ["Lesestrategien: global, selektiv und detailliert", "Hauptgedanke vs Nebendetails erkennen", "Absatzstruktur: Einleitung, Hauptteil, Schluss", "E-Mails schreiben: formell, halbformell, informell", "Grafikbeschreibung: Diagramme, Tabellen, Statistiken", "Konnektoren: jedoch, außerdem, deshalb, trotzdem, einerseits", "Zusammenfassung und Paraphrase auf Deutsch"] },
      { id: "sprechen-de", title: "Flüssigkeit & Konversation", topics: ["Meinungen ausdrücken: Ich denke, Meiner Meinung nach", "Zustimmen und widersprechen: höfliche Formulierungen", "Erfahrungen erzählen: narrative Tempora kombinieren", "Ratschläge geben: solltest, an deiner Stelle würde ich", "Vergleiche: Komparativ, Superlativ, so...wie, je...desto", "Pro und Kontra diskutieren", "Rollenspiele: reale Situationen und Berufsszenarien"] },
      { id: "hoeren2-de", title: "Hörverstehen & Medien", topics: ["Nachrichten verstehen (Tagesschau, DW)", "Podcasts und Vorträge auf Deutsch hören", "Notizstrategien beim Hören", "Dialekte und Akzente: Bayerisch, Schwäbisch, Schweizerdeutsch, Österreichisch", "Intonationsmuster: Fragen, Aufzählungen, Betonung", "Idiomatische Ausdrücke im Kontext", "Diktate zur Genauigkeit"] },
      { id: "grammatik4-de", title: "Grammatikvertiefung", topics: ["Plusquamperfekt: Vorzeitigkeit in der Vergangenheit", "Futur I und II: Pläne, Vermutungen, Versprechen", "Modalverben: subjektiver Gebrauch (Er muss krank sein)", "Partizipialattribute: Der gestern angekommene Brief", "Nominalisierung: Verben und Adjektive als Nomen", "Konnektoren und Adverbien des Diskurses", "Modalpartikeln: doch, mal, ja, eben, halt, eigentlich"] },
      { id: "beruf-de", title: "Berufs- und Geschäftsdeutsch", topics: ["Professionelle E-Mails und Geschäftsbriefe", "Telefongespräche und Videokonferenzen", "Anfragen stellen und beantworten", "Grafiken, Daten und Trends beschreiben", "Meetingsprache: Tagesordnung, Protokoll, Maßnahmen", "Networking und Smalltalk auf Veranstaltungen", "Bewerbung: Lebenslauf und Anschreiben"] },
    ]},
    { id: "avancado", name: "Fortgeschritten (C1-C2)", modules: [
      { id: "grammatik-adv-de", title: "Fortgeschrittene Grammatik & Stil", topics: ["Partizipialattribute in komplexen Sätzen", "Nominalisierung: Verben in Substantive verwandeln", "Funktionsverbgefüge: formeller Schreibstil", "Konjunktiv I: indirekte Rede in Nachrichten und Berichten", "Konnektoren des gehobenen Registers: nichtsdestotrotz, infolgedessen", "Satzklammer und komplexe Satzstrukturen", "Stilmittel: Ironie, Metapher, Euphemismus im Deutschen"] },
      { id: "goethe-testdaf", title: "Goethe-Zertifikat & TestDaF Vorbereitung", topics: ["TestDaF Leseverstehen: akademische Texte und Strategien", "TestDaF Hörverstehen: Vorlesungen und Seminardiskussionen", "TestDaF Schriftlicher Ausdruck: Erörterung und Stellungnahme", "TestDaF Mündlicher Ausdruck: 7 Aufgabentypen", "Goethe B2/C1: Prüfungsformate und Bewertungskriterien", "Zeitmanagement und Prüfungsstrategien", "Komplette Prüfungssimulationen"] },
      { id: "kultur-de", title: "Deutsche Kultur & Gesellschaft", topics: ["Literatur: Goethe, Schiller, Kafka, Brecht, Hesse", "Kino: Fassbinder, Wenders, neue deutsche Filme", "Geschichte: Weimarer Republik, NS-Zeit, Wiedervereinigung", "DACH-Länder: Deutschland, Österreich, Schweiz — Unterschiede", "Humor und Satire auf Deutsch", "Musik: Klassik, Schlager, Deutschrap, Techno", "Traditionen: Oktoberfest, Karneval, Weihnachtsmärkte"] },
      { id: "professionell-de", title: "Professionelles & Executives Deutsch", topics: ["Überzeugende Präsentationen auf Deutsch halten", "Verhandlungstaktiken und Fachsprache", "Interkulturelle Kommunikation am Arbeitsplatz", "Berichte, Vorschläge und Zusammenfassungen schreiben", "Meetings leiten und Diskussionen moderieren", "Vorstellungsgespräch: Verhaltens- und Situationsfragen", "Rhetorik und Redekunst auf Deutsch"] },
      { id: "debatte-de", title: "Debatte & Kritisches Denken", topics: ["Argumente strukturieren: These, Beleg, Begründung", "Logische Fehlschlüsse erkennen und vermeiden", "Aktuelle Themen der deutschsprachigen Welt debattieren", "Überzeugende Schreibtechniken", "Quellen bewerten: Glaubwürdigkeit und Zuverlässigkeit", "Gegenargumente konstruieren", "Formales Debattenformat und Übung"] },
      { id: "leben-de", title: "Leben in Deutschland/Österreich/Schweiz", topics: ["Wohnung mieten: Mietvertrag, Kaution, Nebenkosten, Schufa", "Im Supermarkt: Marken, Pfand, Bio-Produkte", "Gesundheit: Krankenversicherung, Hausarzt, Rezepte", "Vorstellungsgespräch: Lebenslauf, Anschreiben, Nachfassen", "Im Restaurant: Trinkgeld, Bestellkultur, regionale Küche", "Bank: Girokonto, EC-Karte, IBAN-Überweisung", "Behörden: Anmeldung, Aufenthaltstitel, Bürgeramt"] },
    ]},
  ]},
  italian: { levels: [
    { id: "iniciante", name: "Principiante (A1-A2)", modules: [
      { id: "fonetica-it", title: "Fonetica e Pronuncia", topics: ["L'alfabeto italiano e suoni speciali (gn, gl, sc, chi/che, ghi/ghe)", "Vocali aperte e chiuse (e/o in diverse regioni)", "Consonanti doppie: la differenza tra pala e palla", "Saluti: Ciao, Buongiorno, Buonasera — formale vs informale", "Presentarsi: Mi chiamo..., Sono di..., Ho... anni", "Numeri 1-1000, ordinali e numeri di telefono", "Giorni, mesi, stagioni e date"] },
      { id: "sopravvivenza-it", title: "Italiano di Sopravvivenza", topics: ["Frasi essenziali per viaggiare", "Chiedere aiuto: Scusi, Mi può aiutare?", "All'aeroporto e alla dogana", "Trasporto pubblico: metro, autobus, treno", "Emergenze: polizia, ospedale, vigili del fuoco", "Leggere cartelli, menu e documenti semplici", "Soldi, prezzi e fare acquisti"] },
      { id: "grammatica1-it", title: "Grammatica Essenziale I", topics: ["Pronomi personali e verbi: essere vs stare vs avere", "Articoli determinativi e indeterminativi (il/lo/la/l'/i/gli/le)", "Presente indicativo: verbi regolari (-are, -ere, -ire, -isc)", "Verbi irregolari essenziali: andare, fare, dare, stare, dire, venire", "C'è / Ci sono + preposizioni articolate (al, del, nel, sul)", "Aggettivi: genere, numero e concordanza", "Possessivi: mio, tuo, suo, nostro, vostro, loro (con e senza articolo)"] },
      { id: "vita-it", title: "Vita Quotidiana", topics: ["Routine giornaliera: verbi riflessivi (alzarsi, lavarsi)", "Dire l'ora: in punto, e mezza, e un quarto, meno un quarto", "Famiglia e relazioni personali", "Descrivere persone: aspetto fisico e personalità", "La casa e vocabolario domestico", "Il tempo atmosferico e conversazione casuale", "Passatempi e tempo libero"] },
      { id: "grammatica2-it", title: "Grammatica Essenziale II", topics: ["Piacere e verbi simili (interessare, servire, bastare, mancare)", "Molto vs Tanto, Bene vs Buono", "Passato prossimo: con avere e con essere", "Participi passati irregolari (fatto, detto, scritto, visto)", "Imperfetto: descrizione e abitudini nel passato", "Contrasto passato prossimo vs imperfetto", "Imperativo formale e informale"] },
      { id: "pratica1-it", title: "Comunicazione Reale", topics: ["Ordinare al ristorante e al bar", "Fare shopping: taglie, colori, provare vestiti", "Fissare appuntamenti: medico, dentista, parrucchiere", "Chiedere e dare indicazioni stradali", "Descrivere sintomi al medico", "Compilare moduli semplici", "Scrivere un'email personale breve"] },
      { id: "ascolto1-it", title: "Laboratorio di Ascolto e Pronuncia", topics: ["Coppie minime: pala/palla, casa/cassa, pena/penna", "Accento tonico e intonazione italiana", "Elisione e troncamento", "Ascoltare brevi dialoghi e rispondere a domande", "Capire i madrelingua (velocità naturale)", "Tecnica di shadowing", "Differenze regionali: Nord vs Centro vs Sud"] },
    ]},
    { id: "intermediario", name: "Intermedio (B1-B2)", modules: [
      { id: "grammatica3-it", title: "Espansione Grammaticale", topics: ["Congiuntivo presente: formazione e usi base (credo che, penso che)", "Congiuntivo vs Indicativo: regola completa", "Condizionale: semplice e composto", "Periodo ipotetico: 1°, 2° e 3° tipo", "Pronomi combinati: me lo, glielo, ce ne", "Ci e Ne: tutti gli usi", "Forma passiva e si impersonale/passivante"] },
      { id: "vocabolario-it", title: "Vocabolario Accademico e Professionale", topics: ["Formazione delle parole: prefissi e suffissi in italiano", "Collocazioni: fare/prendere/dare/mettere + sostantivo", "Verbi con preposizione: dipendere da, consistere in", "Sinonimi e contrari per espressione ricca", "Registro: formale vs informale vs colloquiale", "Falsi amici italiano-portoghese", "Espressioni idiomatiche di uso quotidiano"] },
      { id: "lettura-scrittura-it", title: "Comprensione e Produzione Scritta", topics: ["Strategie di lettura: globale, selettiva e dettagliata", "Identificare idea principale vs dettagli di supporto", "Struttura del paragrafo: frase tematica e sviluppo", "Scrivere email: formale, semiformale, informale", "Struttura del tema: introduzione, svolgimento, conclusione", "Connettivi: tuttavia, inoltre, pertanto, nonostante", "Riassunto e parafrasi in italiano"] },
      { id: "conversazione-it", title: "Fluidità e Conversazione", topics: ["Esprimere opinioni: Secondo me, A mio parere, Ritengo che", "Accordo e disaccordo: modi cortesi", "Raccontare esperienze: tempi narrativi combinati", "Dare consigli: dovresti, ti consiglio di, perché non...?", "Confronti: più/meno di, tanto...quanto, il/la più...", "Discutere pro e contro di un tema", "Role-play: situazioni quotidiane e professionali"] },
      { id: "congiuntivo-avanzato-it", title: "Congiuntivo in Profondità", topics: ["Congiuntivo imperfetto e trapassato", "Concordanza dei tempi nel congiuntivo", "Congiuntivo in frasi relative e concessive", "Magari + congiuntivo", "Sebbene/Nonostante/Benché + congiuntivo", "Come se + congiuntivo imperfetto", "Il congiuntivo nella lingua parlata moderna"] },
      { id: "ascolto2-it", title: "Ascolto Avanzato e Media", topics: ["Capire notiziari italiani (RAI, Sky TG24)", "Ascoltare podcast e conferenze in italiano", "Strategie di appunti durante l'ascolto", "Accenti regionali: romano, milanese, napoletano, siciliano", "Intonazione: domande, elenchi, enfasi", "Modi di dire in contesto reale", "Dettati per precisione"] },
      { id: "lavoro-it", title: "Italiano Professionale", topics: ["Email professionali in italiano", "Telefonate e videoconferenze", "Fare e rispondere a richieste formali", "Descrivere grafici, dati e tendenze", "Lessico delle riunioni: ordine del giorno, verbale, delibere", "Networking e conversazione agli eventi", "CV e lettera di presentazione all'italiana"] },
    ]},
    { id: "avancado", name: "Avanzato (C1-C2)", modules: [
      { id: "grammatica-avanzata-it2", title: "Grammatica e Stile Avanzati", topics: ["Periodo ipotetico misto e dell'irrealtà", "Discorso indiretto complesso con cambiamenti di tempo", "Forma passiva avanzata e costruzioni impersonali", "Usi avanzati del SI (6 funzioni)", "Connettivi del discorso formale: ciononostante, in virtù di", "Nominalizzazione e registro accademico", "Stilistica: ironia, metafora, eufemismo in italiano"] },
      { id: "cils-prep", title: "Preparazione CILS B2/C1/C2", topics: ["CILS Comprensione della lettura: testi accademici e letterari", "CILS Comprensione dell'ascolto: conferenze e dibattiti", "CILS Produzione scritta: lettera formale, tema, relazione", "CILS Produzione orale: monologo e conversazione guidata", "CILS Strategie d'esame e gestione del tempo", "CILS Criteri di valutazione e come massimizzare il punteggio", "Simulazioni d'esame CILS complete"] },
      { id: "cultura-italiana", title: "Cultura e Civiltà Italiana", topics: ["Letteratura: Dante, Petrarca, Boccaccio, Leopardi, Pirandello, Calvino", "Cinema: Fellini, De Sica, Sorrentino, cinema neorealista", "Storia: Rinascimento, Unificazione, Resistenza, Repubblica", "Arte e Architettura: Michelangelo, Leonardo, Barocco", "Musica: opera lirica, cantautori, musica contemporanea", "Gastronomia: cucina regionale, vino, cultura del cibo", "Made in Italy: moda, design, automotive"] },
      { id: "professionale-it", title: "Italiano Professionale ed Executive", topics: ["Presentazioni persuasive in italiano", "Tattiche di negoziazione e linguaggio", "Comunicazione interculturale sul lavoro", "Scrivere relazioni, proposte e riassunti esecutivi", "Condurre riunioni e moderare discussioni", "Colloqui di lavoro: metodo STAR in italiano", "Oratoria: struttura, retorica e linguaggio del corpo"] },
      { id: "dibattito-it", title: "Dibattito e Pensiero Critico", topics: ["Strutturare un argomento: tesi, prove, giustificazione", "Fallacie logiche: identificarle ed evitarle", "Dibattere temi di attualità italiana", "Tecniche di scrittura persuasiva", "Valutare le fonti: credibilità e affidabilità", "Costruire controargomentazioni solide", "Formato di dibattito formale e pratica"] },
      { id: "vivere-it", title: "Vivere in Italia", topics: ["Affittare un appartamento: contratto, caparra, spese condominiali", "Al supermercato: marche, offerte, prodotti locali e DOP", "Sanità: SSN, medico di base, pronto soccorso, ricette", "Colloquio di lavoro: CV europass, lettera motivazionale", "Al ristorante: coperto, servizio, ordine dei piatti", "Banca: conto corrente, bancomat, bonifico", "Burocrazia: permesso di soggiorno, codice fiscale, anagrafe"] },
    ]},
  ]},
  mandarin: { levels: [
    { id: "iniciante", name: "入门 Iniciante (HSK 1-2)", modules: [
      { id: "pinyin-pro", title: "拼音 Pinyin & Fonética Profissional", topics: ["Os 4 tons + tom neutro: regras e exceções", "21 Iniciais (consoantes): grupos aspirados vs não-aspirados", "38 Finais (vogais): simples, compostas e nasais", "Combinações de Pinyin e regras de ortografia", "Regras de mudança de tom (3º tom + 3º tom, 不, 一)", "Pares mínimos: mā/má/mǎ/mà, bāo/páo/māo/dāo", "Saudações: 你好, 您好, 早上好, 晚上好, 再见"] },
      { id: "hanzi-sistema", title: "汉字 Sistema de Escrita", topics: ["8 traços fundamentais e ordem dos traços", "30 radicais mais comuns e seus significados", "Números: 一 a 万 (1-10000) e caracteres financeiros", "50 caracteres essenciais do dia a dia", "Caracteres simplificados vs tradicionais", "Componentes fonéticos: como adivinhar a pronúncia", "Ferramentas digitais: teclado Pinyin e reconhecimento de escrita"] },
      { id: "hsk1-vida", title: "日常 HSK 1 — Vida Diária", topics: ["Apresentações: 我叫..., 我是..., 我来自...", "Família: 爸爸, 妈妈, 哥哥, 姐姐 (termos familiares completos)", "Profissões e local de trabalho", "Cores, objetos e classificadores básicos (个, 本, 杯)", "Horas e datas: sistema chinês (年月日, 星期)", "Comida chinesa básica: pratos, ingredientes, sabores", "No restaurante: 点菜, 买单, pedidos e expressões"] },
      { id: "hsk2-gramatica", title: "语法 HSK 2 — Gramática Básica", topics: ["Ordem SVO e estrutura da frase chinesa", "Partícula 了: ação completada vs mudança de estado", "Partícula 过: experiência passada", "Partícula 着: ação em progresso", "Comparações com 比 e 没有", "Classificadores (量词): 个, 本, 杯, 件, 条, 只, 张", "Perguntas: 吗, 呢, 还是, 怎么, 为什么"] },
      { id: "comunicacao-zh", title: "交际 Comunicação Prática", topics: ["Fazer compras e pechinchar: 多少钱, 太贵了, 便宜一点", "No transporte: táxi, metrô, trem, avião", "Pedir direções: 在哪儿, 怎么走, 左转右转", "No hotel: check-in, check-out, necessidades", "Emergências: 帮忙, 医院, 警察", "Usar o telefone: ligar, receber, WeChat", "Clima e conversação casual"] },
      { id: "escuta1-zh", title: "听力 Laboratório de Escuta", topics: ["Discriminação dos 4 tons em contexto", "Pares mínimos em frases completas", "Entender números, preços e horários", "Diálogos curtos: perguntas e respostas", "Velocidade natural vs velocidade de estudo", "Técnica de shadowing com áudios em mandarim", "Canções chinesas simples para prática de tons"] },
    ]},
    { id: "intermediario", name: "中级 Intermediário (HSK 3-4)", modules: [
      { id: "hsk3-gramatica", title: "语法 HSK 3 — Gramática Intermediária", topics: ["Complementos de resultado: 看完, 听懂, 做好, 写错", "Complementos de direção: 上来, 下去, 进去, 出来", "Frases condicionais: 如果...就..., 要是...的话", "Voz passiva: 被 construção (被老师批评了)", "Construção 把: mudança de objeto (把书放在桌子上)", "Expressões de comparação avançadas: 越来越, 跟...一样", "Conectivos: 虽然...但是, 不但...而且, 因为...所以"] },
      { id: "hanzi-inter-pro", title: "汉字 Caracteres Intermediários", topics: ["500 caracteres mais frequentes e suas combinações", "Formação de palavras compostas: padrões comuns", "Componentes semânticos e fonéticos avançados", "Leitura de textos curtos: notícias simples, histórias", "Escrita: mensagens, emails, posts em redes sociais", "Uso do dicionário chinês (busca por radical e pinyin)", "Caligrafia básica: estilos 楷书 e 行书"] },
      { id: "hsk4-avancado", title: "语法 HSK 4 — Gramática Avançada", topics: ["Complementos de grau: 得 (他说得很好)", "Frases com 是...的 (ênfase)", "Verbos auxiliares: 能/会/可以 diferenças", "Construções com 让/叫/使 (causativas)", "Expressões de tempo complexas: 以前/以后/的时候/一...就", "Discurso indireto em chinês", "Partículas modais: 吧, 呢, 啊, 嘛 (nuances)"] },
      { id: "cultura-zh-pro", title: "文化 Cultura Chinesa", topics: ["Festival da Primavera 春节: tradições, comida, costumes", "Festival do Meio-Outono 中秋节 e Festival do Barco-Dragão 端午节", "Filosofia: Confúcio 孔子, Laozi 老子, conceitos-chave", "Culinária: 八大菜系 (8 cozinhas regionais)", "Artes: caligrafia, pintura, ópera de Pequim", "Etiqueta social: guanxi 关系, mianzi 面子, keqi 客气", "China moderna: tecnologia, sociedade, tendências"] },
      { id: "negocios-zh", title: "商务 Chinês para Negócios", topics: ["Vocabulário empresarial: reunião, contrato, relatório", "Email formal em chinês: estrutura e expressões", "Apresentações profissionais em mandarim", "Negociação: vocabulário e estratégias culturais", "Cultura corporativa chinesa: hierarquia e relações", "WeChat profissional e comunicação digital", "Comércio internacional: importação/exportação"] },
      { id: "escuta2-zh", title: "听力 Escuta Avançada e Mídia", topics: ["Entender noticiários chineses (CCTV, 新闻联播)", "Assistir dramas e filmes chineses com legendas", "Podcasts em mandarim: temas do cotidiano", "Música chinesa: pop (C-pop), rap, cantores famosos", "Compreender sotaques regionais: Beijing, Shanghai, Sichuan", "Ditados para precisão auditiva", "Técnicas de compreensão oral para HSK"] },
    ]},
    { id: "avancado", name: "高级 Avançado (HSK 5-6)", modules: [
      { id: "gramatica-adv-zh", title: "高级语法 Gramática Avançada", topics: ["成语 Chéngyǔ (expressões idiomáticas de 4 caracteres): 50 mais usados", "Estruturas complexas: 之所以...是因为, 与其...不如", "Conectivos formais: 然而, 尽管, 鉴于, 何况", "Estilo literário vs coloquial: registros do chinês", "Retórica em chinês: paralelismo, antítese, metáfora", "Humor e trocadilhos em chinês (谐音)", "Abreviações e linguagem da internet (网络语言)"] },
      { id: "hsk56-prep", title: "HSK 5-6 Preparação", topics: ["HSK 5 Leitura: textos longos e questões de compreensão", "HSK 5 Escuta: conversas e palestras acadêmicas", "HSK 5 Escrita: resumo de texto ouvido (80 caracteres)", "HSK 6 Leitura: textos acadêmicos e literários", "HSK 6 Escuta: entrevistas, debates e reportagens", "HSK 6 Escrita: resumo de 1000 caracteres a partir de texto lido", "Estratégias de exame HSK e simulados completos"] },
      { id: "literatura-zh-pro", title: "文学 Literatura e Cultura Avançada", topics: ["Poesia clássica 唐诗: Li Bai 李白, Du Fu 杜甫", "Filosofia: Dào Dé Jīng 道德经, Analectos 论语", "Literatura moderna: Lu Xun 鲁迅, Mo Yan 莫言", "Cinema chinês: Zhang Yimou, Wong Kar-wai", "Notícias e mídia: análise de artigos de opinião", "Debates sobre temas da sociedade chinesa", "Provérbios 谚语 e sabedoria popular"] },
      { id: "profissional-zh", title: "职业 Chinês Profissional e Executivo", topics: ["Apresentações persuasivas em mandarim", "Negociação avançada com táticas culturais chinesas", "Comunicação intercultural: Oriente vs Ocidente", "Redação de relatórios e propostas em chinês", "Liderar reuniões em mandarim", "Entrevista de emprego em chinês: perguntas e respostas", "Oratória e discurso público em mandarim"] },
      { id: "viver-china", title: "在中国生活 Viver na China", topics: ["Alugar apartamento: contrato, zhōngjiè 中介, depósito", "No supermercado: marcas, apps de entrega (美团, 饿了么)", "Saúde: hospital, consulta, receita, medicina tradicional", "Entrevista de emprego: currículo em chinês, carta de apresentação", "No restaurante: etiqueta, divisão da conta, apps (大众点评)", "Banco: conta, Alipay 支付宝, WeChat Pay 微信支付", "Burocracia: visto, registro, permissão de trabalho"] },
    ]},
  ]},
  portuguese: { levels: [
    { id: "iniciante", name: "Fundamental (Ensino Básico)", modules: [
      { id: "fonetica-pt", title: "Fonética e Ortografia", topics: ["Novo acordo ortográfico: todas as mudanças", "Acentuação gráfica: regras de oxítonas, paroxítonas, proparoxítonas", "Uso do hífen: regras atualizadas", "Homônimos e parônimos: sessão/seção/cessão, mal/mau", "Emprego de letras: s/ss/ç, x/ch, g/j, z/s", "Os porquês: por que, porque, por quê, porquê", "Crase: todas as regras e exceções"] },
      { id: "morfologia-pro", title: "Morfologia Completa", topics: ["Substantivo: classificação, gênero, número e grau", "Adjetivo: classificação, flexão e locução adjetiva", "Artigo: definido vs indefinido — usos e omissões", "Verbo: conjugações regulares (1ª, 2ª, 3ª)", "Verbo: tempos do indicativo completos", "Pronomes: pessoais, possessivos, demonstrativos, relativos, indefinidos", "Advérbios, preposições, conjunções e interjeições"] },
      { id: "interpretacao-pro", title: "Interpretação de Texto", topics: ["Gêneros textuais: identificação e características", "Tipologia textual: narração, descrição, dissertação, injunção", "Inferência e pressuposição: ler nas entrelinhas", "Intertextualidade: citação, paródia, paráfrase", "Figuras de linguagem: metáfora, metonímia, ironia, antítese", "Coerência e coesão textual: elementos de ligação", "Funções da linguagem: Jakobson (6 funções)"] },
      { id: "producao-fund-pro", title: "Produção Textual Básica", topics: ["Narração: elementos e estrutura narrativa", "Descrição: objetiva vs subjetiva, retrato vs paisagem", "Carta pessoal e bilhete: estrutura e linguagem", "Parágrafo: tópico frasal, desenvolvimento e conclusão", "Conectivos simples: e, mas, porém, pois, porque, então", "Revisão de textos: checklist de erros comuns", "Pontuação básica: vírgula, ponto, dois-pontos, travessão"] },
    ]},
    { id: "intermediario", name: "Intermediário (Ensino Médio / ENEM)", modules: [
      { id: "sintaxe-pro", title: "Sintaxe Completa", topics: ["Análise sintática: sujeito, predicado, complementos", "Período composto por coordenação: tipos e classificação", "Período composto por subordinação: substantivas, adjetivas, adverbiais", "Concordância verbal: regras gerais e casos especiais", "Concordância nominal: regras e armadilhas", "Regência verbal e nominal: verbos e nomes que exigem preposição", "Colocação pronominal: próclise, mesóclise, ênclise"] },
      { id: "redacao-enem-pro", title: "Redação ENEM — Preparação Completa", topics: ["Dissertação argumentativa: estrutura modelo ENEM", "Competência 1: domínio da norma culta (nota máxima)", "Competência 2: compreensão da proposta e repertório", "Competência 3: seleção e organização dos argumentos", "Competência 4: coesão textual (conectivos argumentativos)", "Competência 5: proposta de intervenção (agente, ação, meio, detalhamento, finalidade)", "Análise de redações nota 1000 e temas recorrentes"] },
      { id: "literatura-br-pro", title: "Literatura Brasileira", topics: ["Quinhentismo e Barroco: Anchieta, Gregório de Matos, Vieira", "Arcadismo: Cláudio Manuel da Costa, Tomás Antônio Gonzaga", "Romantismo: Álvares de Azevedo, Castro Alves, José de Alencar", "Realismo e Naturalismo: Machado de Assis, Aluísio Azevedo", "Pré-Modernismo: Euclides da Cunha, Lima Barreto, Monteiro Lobato", "Modernismo: Semana de 22, Oswald, Mário, Drummond, Clarice", "Literatura Contemporânea: Guimarães Rosa, Caio Fernando Abreu"] },
      { id: "literatura-pt-pro", title: "Literatura Portuguesa", topics: ["Trovadorismo: cantigas de amor, amigo e escárnio", "Classicismo: Camões — Os Lusíadas e sonetos", "Romantismo português: Garrett, Herculano, Camilo", "Realismo português: Eça de Queirós — O Primo Basílio, Os Maias", "Modernismo: Fernando Pessoa — ortônimo e heterônimos", "José Saramago: Ensaio sobre a Cegueira, Memorial do Convento", "Literatura africana de língua portuguesa: Mia Couto, Pepetela"] },
      { id: "linguistica-pt", title: "Linguística e Variação", topics: ["Variação linguística: diatópica, diastrática, diafásica, diacrônica", "Norma culta vs norma popular: preconceito linguístico", "Funções da linguagem em contexto (ENEM)", "Gêneros digitais: meme, tweet, podcast, vlog", "Semiótica: imagem, texto e multimodalidade", "Análise do discurso: implícito, pressuposto, subentendido", "Figuras de linguagem avançadas em questões ENEM"] },
    ]},
    { id: "avancado", name: "Avançado (Vestibular / Concursos)", modules: [
      { id: "estilistica-pro", title: "Estilística e Semântica Avançada", topics: ["Todas as figuras de linguagem: classificação completa", "Funções da linguagem: aplicações em questões", "Variação linguística: análise crítica e social", "Polissemia, ambiguidade e duplo sentido", "Denotação e conotação: análise em textos literários", "Análise do discurso: ideologia e argumentação", "Intertextualidade e interdiscursividade"] },
      { id: "textual-pro", title: "Produção Textual para Concursos", topics: ["Artigo de opinião: estrutura e argumentação", "Crônica: narrativa do cotidiano com reflexão", "Resenha crítica: análise e avaliação", "Editorial e carta aberta: texto persuasivo formal", "Resumo acadêmico e fichamento", "Paráfrase e citação: normas ABNT", "Redação de concursos: CESPE, FCC, FGV — particularidades"] },
      { id: "gramatica-avancada-pt", title: "Gramática para Concursos", topics: ["Vozes verbais: ativa, passiva e reflexiva — conversão", "Orações reduzidas: de gerúndio, infinitivo e particípio", "Discurso direto, indireto e indireto livre", "Paralelismo sintático e semântico", "Pontuação avançada: todos os casos da vírgula", "Questões de gramática estilo CESPE/FCC/FGV", "Armadilhas gramaticais mais cobradas em provas"] },
      { id: "celpe-bras", title: "Preparação CELPE-Bras", topics: ["Estrutura do exame CELPE-Bras: oral e escrita", "Parte oral: entrevista e interação face a face", "Parte escrita: 4 tarefas integradas (áudio + vídeo + texto)", "Gêneros textuais cobrados: carta, email, artigo, relato", "Estratégias de escrita para cada tarefa", "Critérios de avaliação e como maximizar a nota", "Simulados completos CELPE-Bras"] },
    ]},
  ]},
};

// ==================== SAVED STATE ====================
interface SavedLessonState {
  lang: string; level: string; moduleId: string; topic: string; tab: string;
  lessonData?: LessonData | null; exerciseData?: ExerciseData | null;
  oralData?: OralData | null; textData?: TextData | null;
  answers?: Record<number, string>;
}

// ==================== SPEECH RECOGNITION HOOK ====================
function useSpeechRecognition(langCode: string) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(() => {
    // Stop any previous instance
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = langCode;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let fullTranscript = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          fullTranscript += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(fullTranscript);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        toast.error(`Erro no reconhecimento: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    setTranscript("");
    setInterimTranscript("");
    recognition.start();
    setIsListening(true);
  }, [langCode]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript };
}

// ==================== COMPONENT ====================
export default function IdiomasPage() {
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<{ id: string; title: string; topics: string[] } | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("lesson");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useLocalStorage<LanguageProgress>("language-progress", {});
  const [professorMode, setProfessorMode] = useLocalStorage<boolean>("professor-virtual-mode", false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [highlightedSentence, setHighlightedSentence] = useState<number>(-1);
  
  const [savedState, setSavedState] = useLocalStorage<SavedLessonState | null>("language-saved-lesson", null);

  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null);
  const [oralData, setOralData] = useState<OralData | null>(null);
  const [textData, setTextData] = useState<TextData | null>(null);
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [evalData, setEvalData] = useState<EvalData | null>(null);
  const [speechEvalData, setSpeechEvalData] = useState<SpeechEvalData | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [userText, setUserText] = useState("");
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [speechDialogOpen, setSpeechDialogOpen] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  const currentLangSpeech = LANGUAGES.find(l => l.id === selectedLang)?.speechLang || "pt-BR";
  const speechRecognition = useSpeechRecognition(currentLangSpeech);

  // Conversation practice state
  const [convPracticeMode, setConvPracticeMode] = useState(false);
  const [convMessages, setConvMessages] = useState<{ role: "mentor" | "user"; text: string; translation?: string }[]>([]);

  // Save lesson state
  useEffect(() => {
    if (selectedLang && selectedLevel && selectedModule && selectedTopic) {
      setSavedState({ lang: selectedLang, level: selectedLevel, moduleId: selectedModule.id, topic: selectedTopic, tab: activeTab, lessonData, exerciseData, oralData, textData, answers });
    }
  }, [selectedLang, selectedLevel, selectedModule, selectedTopic, activeTab, lessonData, exerciseData, oralData, textData, answers]);

  const resumeLesson = useCallback(() => {
    if (!savedState) return;
    setSelectedLang(savedState.lang);
    setSelectedLevel(savedState.level);
    const level = CURRICULUM[savedState.lang]?.levels.find(l => l.id === savedState.level);
    const mod = level?.modules.find(m => m.id === savedState.moduleId);
    if (mod) setSelectedModule(mod);
    setSelectedTopic(savedState.topic);
    setActiveTab(savedState.tab);
    if (savedState.lessonData) setLessonData(savedState.lessonData);
    if (savedState.exerciseData) setExerciseData(savedState.exerciseData);
    if (savedState.oralData) setOralData(savedState.oralData);
    if (savedState.textData) setTextData(savedState.textData);
    if (savedState.answers) setAnswers(savedState.answers);
  }, [savedState]);

  const restartLesson = useCallback(() => {
    setLessonData(null); setExerciseData(null); setOralData(null); setTextData(null); setEvalData(null); setConversationData(null);
    setAnswers({}); setShowResults(false); setUserText(""); setTextAnswers({}); setActiveTab("lesson"); setSpeechEvalData(null);
    setConvPracticeMode(false); setConvMessages([]);
    setSavedState(null);
    toast.success("Lição reiniciada!");
  }, []);

  // Auto-read — only when inside a topic/classroom
  useEffect(() => {
    if (!professorMode || !lessonData || !selectedTopic) return;
    const text = `${lessonData.title}. ${lessonData.explanation.replace(/[#*`]/g, '')}`;
    setIsSpeaking(true);
    setHighlightedSentence(0);
    speakWithHighlight(text, currentLangSpeech === "pt-BR" ? "pt-BR" : currentLangSpeech,
      (idx) => setHighlightedSentence(idx),
      () => { setIsSpeaking(false); setHighlightedSentence(-1); }
    );
  }, [lessonData, professorMode, selectedTopic]);

  useEffect(() => {
    if (!professorMode || !textData || !selectedTopic) return;
    setIsSpeaking(true);
    setHighlightedSentence(0);
    speakWithHighlight(`${textData.title}. ${textData.text}`, currentLangSpeech,
      (idx) => setHighlightedSentence(idx),
      () => { setIsSpeaking(false); setHighlightedSentence(-1); }
    );
  }, [textData, professorMode, selectedTopic]);

  // Stop speaking when leaving a classroom or switching tabs
  useEffect(() => {
    if (!selectedTopic) { stopSpeaking(); setIsSpeaking(false); setHighlightedSentence(-1); }
  }, [selectedTopic]);

  // Stop audio immediately when switching between tabs (Lição, Exercícios, Conversação, etc.)
  useEffect(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setHighlightedSentence(-1);
  }, [activeTab]);

  // Stop ALL audio and speech recognition when component unmounts (navigating away from page)
  useEffect(() => {
    return () => {
      stopSpeaking();
      speechRecognition.stopListening();
    };
  }, []);

  // Stop audio when user switches browser tab or minimizes window
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        stopSpeaking();
        setIsSpeaking(false);
        setHighlightedSentence(-1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Stop audio when going back to language list or showing diagnostic
  useEffect(() => {
    if (!selectedLang || showDiagnostic) {
      stopSpeaking();
      setIsSpeaking(false);
      setHighlightedSentence(-1);
    }
  }, [selectedLang, showDiagnostic]);


  const toggleProfessorSpeech = () => {
    if (isSpeaking) { stopSpeaking(); setIsSpeaking(false); setHighlightedSentence(-1); }
    else {
      let text = "";
      if (lessonData) text = `${lessonData.title}. ${lessonData.explanation.replace(/[#*`]/g, '')}`;
      else if (textData) text = `${textData.title}. ${textData.text}`;
      else if (exerciseData) text = exerciseData.questions.map(q => `Questão ${q.id}: ${q.question}`).join('. ');
      else if (oralData) text = `${oralData.title}. ${oralData.readingPassage}`;
      if (text) {
        setIsSpeaking(true);
        setHighlightedSentence(0);
        speakWithHighlight(text, currentLangSpeech === "pt-BR" ? "pt-BR" : currentLangSpeech,
          (idx) => setHighlightedSentence(idx),
          () => { setIsSpeaking(false); setHighlightedSentence(-1); }
        );
      }
    }
  };

  const getOfflineFallback = useCallback((action: string) => {
    if (!selectedLang || !selectedTopic || !selectedLevel) return null;
    switch (action) {
      case "lesson": return generateOfflineLesson(selectedLang, selectedTopic, selectedLevel);
      case "exercise": return generateOfflineExercise(selectedLang, selectedTopic, selectedLevel);
      case "conversation": return generateOfflineConversation(selectedLang, selectedTopic);
      case "text": return generateOfflineText(selectedLang, selectedTopic);
      case "oral-assessment": return generateOfflineOral(selectedLang, selectedTopic);
      default: return null;
    }
  }, [selectedLang, selectedLevel, selectedTopic]);

  const fetchContent = useCallback(async (action: string, _extra: Record<string, any> = {}) => {
    if (!selectedLang || !selectedLevel || !selectedTopic) return;
    setLoading(true);
    try {
      const content = getOfflineFallback(action);
      if (content) return content;
      toast.error("Conteúdo não disponível para este tópico.");
      return null;
    } finally { setLoading(false); }
  }, [selectedLang, selectedLevel, selectedTopic, getOfflineFallback]);

  const loadLesson = async () => { const d = await fetchContent("lesson"); if (d) setLessonData(d as any); };
  const loadExercise = async () => { setShowResults(false); setAnswers({}); const d = await fetchContent("exercise"); if (d) setExerciseData(d as any); };
  const loadOral = async () => { const d = await fetchContent("oral-assessment"); if (d) setOralData(d as any); };
  const loadText = async () => { setTextAnswers({}); const d = await fetchContent("text"); if (d) setTextData(d as any); };
  const loadConversation = async () => { const d = await fetchContent("conversation"); if (d) setConversationData(d as any); setConvPracticeMode(false); setConvMessages([]); };

  // Normalize text for comparison: strip diacritics but keep CJK, Cyrillic, and all unicode letters
  const normalizeText = (t: string) => t.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}\s]/gu, "");

  const submitExercise = () => {
    if (!exerciseData) return;
    setShowResults(true);
    const correct = exerciseData.questions.filter(q => {
      const userAns = normalizeText(answers[q.id] || "");
      const correctAns = normalizeText(q.correctAnswer || "");
      if (!userAns) return false;
      // For multiple choice, exact letter match
      if (q.options && q.options.length > 0) return (answers[q.id] || "").trim().toLowerCase() === (q.correctAnswer || "").trim().toLowerCase();
      // For text answers, check 90%+ similarity (word-based for spaced languages, char-based for CJK)
      if (!correctAns) return false;
      const words1 = userAns.split(/\s+/).filter(Boolean);
      const words2 = correctAns.split(/\s+/).filter(Boolean);
      // If both have very few "words" (e.g. Chinese with no spaces), use character-level comparison
      if (words2.length <= 1 && correctAns.length > 1) {
        const chars1 = [...userAns.replace(/\s/g, "")];
        const chars2 = [...correctAns.replace(/\s/g, "")];
        let charMatches = 0;
        const used = new Set<number>();
        chars2.forEach(c => {
          const idx = chars1.findIndex((ch, i) => ch === c && !used.has(i));
          if (idx !== -1) { charMatches++; used.add(idx); }
        });
        return charMatches / Math.max(chars1.length, chars2.length) >= 0.9;
      }
      let matches = 0;
      words2.forEach(w => { if (words1.includes(w)) matches++; });
      const similarity = matches / Math.max(words1.length, words2.length);
      return similarity >= 0.9;
    }).length;
    const score = Math.round((correct / exerciseData.questions.length) * 100);
    if (selectedLang && selectedModule) {
      setProgress(prev => ({ ...prev, [selectedLang]: { ...prev[selectedLang], [selectedModule.id]: { completed: score >= 60, score } } }));
    }
    toast(score >= 60 ? `Parabéns! ${score}% de acerto!` : `${score}% — Continue praticando!`);
  };

  const submitTextAnswer = async () => {
    if (!textData?.comprehensionQuestions?.length) return;
    const answeredQuestions = textData.comprehensionQuestions.map((q, i) => ({
      question: q.question,
      expectedAnswer: q.answer,
      studentAnswer: textAnswers[i] || "",
    })).filter(a => a.studentAnswer.trim());
    if (answeredQuestions.length === 0) { toast.error("Responda pelo menos uma pergunta."); return; }
    const offlineEval = evaluateTextOffline(answeredQuestions);
    setEvalData(offlineEval);
    setDialogOpen(true);
  };

  // ==================== SPEECH EVALUATION ====================
  const evaluateSpeech = async (spokenText: string, _context?: string) => {
    if (!spokenText.trim() || !selectedLang || !selectedLevel) return;
    setLoading(true);
    try {
      const offlineEval = evaluateSpeechOffline(spokenText, selectedLang, selectedLevel);
      setSpeechEvalData(offlineEval);
      setSpeechDialogOpen(true);

      if (convPracticeMode && offlineEval.next_challenge) {
        setConvMessages(prev => [
          ...prev,
          { role: "user", text: spokenText },
          { role: "mentor", text: offlineEval.next_challenge, translation: offlineEval.feedback },
        ]);
        speak(offlineEval.next_challenge, currentLangSpeech);
      }
    } finally { setLoading(false); }
  };

  const handleSendSpeech = () => {
    const text = speechRecognition.transcript.trim();
    if (!text) { toast.error("Nenhuma fala detectada. Tente novamente."); return; }
    speechRecognition.stopListening();
    evaluateSpeech(text);
    speechRecognition.resetTranscript();
  };

  const startConversationPractice = () => {
    setConvPracticeMode(true);
    setConvMessages([]);
    if (conversationData?.dialogue?.[0]) {
      const firstLine = conversationData.dialogue[0];
      setConvMessages([{ role: "mentor", text: firstLine.line, translation: firstLine.translation }]);
      speak(firstLine.line, currentLangSpeech);
    }
  };

  const openTopic = (topic: string) => {
    setSelectedTopic(topic);
    setLessonData(null); setExerciseData(null); setOralData(null); setTextData(null); setEvalData(null); setConversationData(null);
    setSpeechEvalData(null); setConvPracticeMode(false); setConvMessages([]);
    setTextAnswers({});
    setActiveTab("lesson");
  };

  const langProgress = (langId: string) => {
    const p = progress[langId] || {};
    const curriculum = CURRICULUM[langId];
    if (!curriculum) return 0;
    const totalModules = curriculum.levels.reduce((sum, l) => sum + l.modules.length, 0);
    const completedModules = Object.values(p).filter(m => m.completed).length;
    return totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  };

  const totalTopicsStudied = Object.values(progress).reduce((sum, lang) => sum + Object.keys(lang).length, 0);

  // Handler to select language - always run diagnostic
  const handleSelectLang = useCallback((langId: string) => {
    setSelectedLang(langId);
    setShowDiagnostic(true);
  }, []);

  const handleDiagnosticReady = useCallback(() => {
    setShowDiagnostic(false);
  }, []);

  const handleDiagnosticBack = useCallback(() => {
    setShowDiagnostic(false);
    setSelectedLang(null);
  }, []);

  // ==================== DIAGNOSTIC SCREEN ====================
  if (selectedLang && showDiagnostic) {
    const diagLang = LANGUAGES.find(l => l.id === selectedLang)!;
    return (
      <LanguageDiagnostic
        langId={diagLang.id}
        langName={diagLang.name}
        langFlag={diagLang.flag}
        speechLang={diagLang.speechLang}
        color={diagLang.color}
        onReady={handleDiagnosticReady}
        onBack={handleDiagnosticBack}
      />
    );
  }

  // ==================== LANGUAGE SELECTION SCREEN ====================
  if (!selectedLang) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-8" role="main" aria-label="Sala de Aula de Idiomas">
        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          <AspectRatio ratio={21/9}>
            <img src={heroImg} alt="Sala de Aula de Idiomas" className="object-cover w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex items-center">
              <div className="p-6 md:p-10 text-white max-w-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Languages className="h-5 w-5" />
                  </div>
                  <Badge className="bg-white/20 backdrop-blur text-white border-0 text-xs">Curso Completo</Badge>
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                  Sala de Aula de Idiomas
                </h1>
                <p className="text-sm md:text-base mt-2 opacity-90 leading-relaxed">
                  Aprenda idiomas do zero à fluência com conversação real por voz, lições interativas e cultura local.
                </p>
                <div className="flex gap-4 mt-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs bg-white/10 backdrop-blur rounded-lg px-3 py-1.5">
                    <BookMarked className="h-3.5 w-3.5" /> 6 Idiomas
                  </div>
                  <div className="flex items-center gap-1.5 text-xs bg-white/10 backdrop-blur rounded-lg px-3 py-1.5">
                    <Mic className="h-3.5 w-3.5" /> Conversação por Voz
                  </div>
                  <div className="flex items-center gap-1.5 text-xs bg-white/10 backdrop-blur rounded-lg px-3 py-1.5">
                    <Plane className="h-3.5 w-3.5" /> Vida no Exterior
                  </div>
                </div>
              </div>
            </div>
          </AspectRatio>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Flame, label: "Módulos estudados", value: totalTopicsStudied, color: "text-orange-500" },
            { icon: Award, label: "Idiomas disponíveis", value: "6", color: "text-blue-500" },
            { icon: Mic, label: "Conversação real", value: "Voz IA", color: "text-green-500" },
            { icon: Zap, label: "Exercícios por IA", value: "∞", color: "text-purple-500" },
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-accent flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Professor Virtual + Resume */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl mentor-gradient flex items-center justify-center shadow">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Professor Virtual</p>
                  <p className="text-[10px] text-muted-foreground">Lê todo conteúdo em voz alta</p>
                </div>
              </div>
              <Switch checked={professorMode} onCheckedChange={setProfessorMode} />
            </CardContent>
          </Card>

          {savedState && (
            <Card className="border-0 shadow-sm border-l-4 border-l-primary">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FastForward className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Continuar de onde parou</p>
                    <p className="text-[10px] text-muted-foreground">
                      {LANGUAGES.find(l => l.id === savedState.lang)?.flag} {savedState.topic}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={resumeLesson} className="gap-1"><Play className="h-3 w-3" /> Continuar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setSavedState(null)}><RotateCcw className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Language cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LANGUAGES.map(lang => {
            const prog = langProgress(lang.id);
            return (
              <Card
                key={lang.id}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-md group overflow-hidden hover:-translate-y-1"
                onClick={() => handleSelectLang(lang.id)}
                role="button" tabIndex={0} aria-label={`Curso de ${lang.name}`}
                onKeyDown={e => e.key === "Enter" && handleSelectLang(lang.id)}
              >
                <div className="relative h-32 overflow-hidden">
                  <img src={lang.img} alt={lang.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${lang.color} opacity-60`} />
                  <div className="absolute bottom-3 left-4">
                    <p className="text-2xl font-black text-white drop-shadow-lg">{lang.flag} {lang.name}</p>
                    <p className="text-[11px] text-white/80 mt-0.5">{lang.countries}</p>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs text-muted-foreground">{lang.desc}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">3 Níveis</Badge>
                    <Badge variant="outline" className="text-[10px] gap-1"><Mic className="h-2.5 w-2.5" /> Voz IA</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-semibold">{prog}%</span>
                    </div>
                    <Progress value={prog} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <BookOpen className="h-3 w-3" />
                      <span>{CURRICULUM[lang.id]?.levels.reduce((s, l) => s + l.modules.length, 0)} módulos</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> O que você vai aprender
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: BookOpen, title: "Lições Completas", desc: "Gramática, vocabulário e cultura" },
                { icon: Mic, title: "Conversação Real", desc: "Fale e o mentor avalia sua fluência" },
                { icon: PenTool, title: "Exercícios por IA", desc: "Questões ilimitadas personalizadas" },
                { icon: MessageCircle, title: "Diálogos Práticos", desc: "Situações reais do dia a dia" },
                { icon: MapPin, title: "Vida no Exterior", desc: "Alugar casa, médico, burocracia" },
                { icon: Globe, title: "Cultura Local", desc: "Costumes e etiqueta de cada país" },
                { icon: GraduationCap, title: "3 Níveis", desc: "Iniciante, Intermediário, Avançado" },
                { icon: TrendingUp, title: "6 Idiomas", desc: "EN, ES, DE, IT, ZH, PT-BR" },
              ].map((f, i) => (
                <div key={i} className="text-center space-y-2 p-3 rounded-xl hover:bg-accent/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs font-semibold">{f.title}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const langInfo = LANGUAGES.find(l => l.id === selectedLang)!;
  const curriculum = CURRICULUM[selectedLang];

  // ==================== MODULE COURSE VIEW (step-by-step) ====================
  if (selectedModule && !selectedTopic) {
    const currentLevel = curriculum?.levels.find(l => l.id === selectedLevel);
    return (
      <div className="space-y-4 max-w-4xl mx-auto pb-8" role="main" aria-label={`Curso: ${selectedModule.title}`}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setSelectedModule(null); setSelectedLevel(null); stopSpeaking(); }}>
              <ArrowLeft className="h-4 w-4 mr-1" /> {langInfo.name}
            </Button>
          </div>
          <Badge variant={professorMode ? "default" : "secondary"} className="gap-1 cursor-pointer" onClick={() => setProfessorMode(!professorMode)}>
            <Eye className="h-3 w-3" /> Professor {professorMode ? "ON" : "OFF"}
          </Badge>
        </div>

        {/* Course Hero */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className={`p-6 bg-gradient-to-r ${langInfo.color} text-white`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-white/20 text-white border-0 text-[10px]">{currentLevel?.name}</Badge>
                  <Badge className="bg-white/20 text-white border-0 text-[10px]">{selectedModule.topics.length} aulas</Badge>
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold">{selectedModule.title}</h1>
                <p className="text-sm opacity-90 mt-1">
                  Curso completo e interativo — cada aula é explicada de forma simples e prática
                </p>
              </div>
            </div>
            {/* Module progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="opacity-80">Progresso do módulo</span>
                <span className="font-bold">{progress[selectedLang]?.[selectedModule.id]?.score || 0}%</span>
              </div>
              <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress[selectedLang]?.[selectedModule.id]?.score || 0}%` }} />
              </div>
            </div>
          </div>
        </Card>

        {/* What you'll learn */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> O que você vai aprender neste módulo
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {selectedModule.topics.map((topic, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step-by-step lessons */}
        <div className="space-y-0">
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2 px-1">
            <BookOpen className="h-4 w-4 text-primary" /> Roteiro de Aulas
          </h2>
          {selectedModule.topics.map((topic, idx) => {
            const IconComp = REAL_LIFE_ICONS[topic];
            const isFirst = idx === 0;
            const isLast = idx === selectedModule.topics.length - 1;
            return (
              <div key={topic} className="flex gap-3">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-sm border-2 transition-all cursor-pointer hover:scale-110 bg-gradient-to-br ${langInfo.color} text-white border-transparent`}
                    onClick={() => openTopic(topic)}
                  >
                    {IconComp ? <IconComp className="h-4 w-4" /> : idx + 1}
                  </div>
                  {!isLast && <div className="w-0.5 flex-1 bg-border min-h-[24px]" />}
                </div>
                {/* Content */}
                <div className={`flex-1 ${!isLast ? 'pb-4' : 'pb-0'}`}>
                  <Card
                    className="border-0 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group/step"
                    onClick={() => openTopic(topic)}
                  >
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-medium">Aula {idx + 1}</span>
                          {isFirst && <Badge className="text-[9px] h-4 bg-primary/10 text-primary border-0">Comece aqui</Badge>}
                        </div>
                        <p className="text-sm font-semibold mt-0.5 group-hover/step:text-primary transition-colors truncate">{topic}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Lição completa com exemplos práticos e exercícios
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover/step:text-primary transition-colors shrink-0" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick start button */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 text-center">
            <Button size="lg" className={`bg-gradient-to-r ${langInfo.color} hover:opacity-90 gap-2 shadow-lg`} onClick={() => openTopic(selectedModule.topics[0])}>
              <Sparkles className="h-4 w-4" /> Começar Aula 1: {selectedModule.topics[0]}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== LEVEL/MODULE SELECTION ====================
  if (!selectedTopic) {
    return (
      <div className="space-y-4 max-w-6xl mx-auto pb-8" role="main" aria-label={`Curso de ${langInfo.name}`}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => { setSelectedLang(null); setSelectedLevel(null); setSelectedModule(null); stopSpeaking(); }}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Idiomas
            </Button>
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${langInfo.color} flex items-center justify-center shadow`}>
                <span className="text-lg">{langInfo.flag}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">{langInfo.name}</h1>
                <p className="text-[10px] text-muted-foreground">{langInfo.countries}</p>
              </div>
            </div>
          </div>
          <Badge variant={professorMode ? "default" : "secondary"} className="gap-1 cursor-pointer" onClick={() => setProfessorMode(!professorMode)}>
            <Eye className="h-3 w-3" /> Professor {professorMode ? "ON" : "OFF"}
          </Badge>
        </div>

        {/* Progress */}
        <Card className={`border-0 shadow-sm ${langInfo.lightBg}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Seu Progresso</span>
              </div>
              <span className="text-sm font-bold text-primary">{langProgress(selectedLang)}%</span>
            </div>
            <Progress value={langProgress(selectedLang)} className="h-2.5" />
          </CardContent>
        </Card>

        {/* Levels and modules */}
        {curriculum?.levels.map(level => (
          <Card key={level.id} className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b border-border bg-accent/30">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  {level.name}
                  <Badge variant="outline" className="text-[10px]">{level.modules.length} módulos</Badge>
                </h3>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {level.modules.map(mod => {
                  const modProgress = progress[selectedLang]?.[mod.id];
                  const icon = null;
                  return (
                    <div
                      key={mod.id}
                      className={`p-4 rounded-xl border hover:border-primary/50 hover:shadow-lg cursor-pointer transition-all duration-200 group/mod bg-card hover:-translate-y-0.5 ${modProgress?.completed ? 'border-green-200 dark:border-green-800' : ''}`}
                      onClick={() => { setSelectedLevel(level.id); setSelectedModule(mod); }}
                      role="button" tabIndex={0}
                      onKeyDown={e => e.key === "Enter" && (setSelectedLevel(level.id), setSelectedModule(mod))}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {modProgress?.completed && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                            <span className="text-sm font-semibold truncate group-hover/mod:text-primary transition-colors">{mod.title}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{mod.topics.length} aulas</p>
                          {modProgress ? (
                            <div className="flex items-center gap-1.5 mt-2">
                              <Progress value={modProgress.score} className="h-1.5 flex-1" />
                              <div className="flex items-center gap-0.5">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className="text-[10px] font-medium">{modProgress.score}%</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                              <Sparkles className="h-3 w-3" /> Começar
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/mod:text-primary transition-colors shrink-0 mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ==================== TOPIC CONTENT VIEW ====================
  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-8" role="main" aria-label={`Estudando: ${selectedTopic}`}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedTopic(null); stopSpeaking(); setIsSpeaking(false); speechRecognition.stopListening(); }}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {selectedModule?.title || langInfo.name}
          </Button>
          <Badge className={`bg-gradient-to-r ${langInfo.color} text-white border-0`}>{selectedTopic}</Badge>
          {/* Topic navigation */}
          {selectedModule && selectedModule.topics.length > 1 && (() => {
            const currentIdx = selectedModule.topics.indexOf(selectedTopic!);
            const prevTopic = currentIdx > 0 ? selectedModule.topics[currentIdx - 1] : null;
            const nextTopic = currentIdx < selectedModule.topics.length - 1 ? selectedModule.topics[currentIdx + 1] : null;
            return (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">Aula {currentIdx + 1}/{selectedModule.topics.length}</span>
                {prevTopic && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openTopic(prevTopic)} title={prevTopic}>
                    <ArrowLeft className="h-3 w-3" />
                  </Button>
                )}
                {nextTopic && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openTopic(nextTopic)} title={nextTopic}>
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })()}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={professorMode ? "default" : "secondary"} className="gap-1 cursor-pointer text-[10px]" onClick={() => setProfessorMode(!professorMode)}>
            <Eye className="h-3 w-3" /> Professor {professorMode ? "ON" : "OFF"}
          </Badge>
          {professorMode && (
            <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={toggleProfessorSpeech}>
              {isSpeaking ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {isSpeaking ? "Pausar" : "Ler"}
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="lesson" className="gap-1 text-xs"><BookOpen className="h-3.5 w-3.5" />Lição</TabsTrigger>
          <TabsTrigger value="exercise" className="gap-1 text-xs"><PenTool className="h-3.5 w-3.5" />Exercícios</TabsTrigger>
          <TabsTrigger value="conversation" className="gap-1 text-xs"><MessageCircle className="h-3.5 w-3.5" />Conversação</TabsTrigger>
          <TabsTrigger value="text" className="gap-1 text-xs"><FileText className="h-3.5 w-3.5" />Texto</TabsTrigger>
          <TabsTrigger value="oral" className="gap-1 text-xs"><Mic className="h-3.5 w-3.5" />Prova Oral</TabsTrigger>
          <TabsTrigger value="alphabet" className="gap-1 text-xs">
            <Languages className="h-3.5 w-3.5" />
            {selectedLang === "mandarin" ? "拼音 Pinyin" : selectedLang === "spanish" ? "Alfabeto" : "Alfabeto"}
          </TabsTrigger>
        </TabsList>

        {/* ========== ALPHABET TAB (All languages) ========== */}
        <TabsContent value="alphabet" className="space-y-4 mt-4">
          {selectedLang === "mandarin" ? (
            <MandarinAlphabetSection langCode={currentLangSpeech} />
          ) : (
            <LanguageAlphabetSection langId={selectedLang!} langCode={currentLangSpeech} />
          )}
        </TabsContent>

        {/* ========== LESSON TAB ========== */}
        <TabsContent value="lesson" className="space-y-3 mt-4">
          {!lessonData ? (
            <Card className="border-0 shadow-sm"><CardContent className="p-10 text-center space-y-4">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${langInfo.color} flex items-center justify-center mx-auto shadow-lg`}>
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Iniciar Lição</h3>
                <p className="text-sm text-muted-foreground mt-1">Lição completa e interativa sobre <strong>{selectedTopic}</strong></p>
              </div>
              <Button onClick={loadLesson} disabled={loading} size="lg" className={`bg-gradient-to-r ${langInfo.color} hover:opacity-90`}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Preparando...</> : <>Iniciar Lição</>}
              </Button>
            </CardContent></Card>
          ) : (
            <Card className="border-0 shadow-sm"><CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${langInfo.color} flex items-center justify-center`}>
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  {lessonData.title}
                </h2>
                <div className="flex items-center gap-2">
                  <ExportPDF title={`${langInfo.name} - ${selectedTopic}`} getContent={() => {
                    let html = `<h1>${langInfo.name} - ${lessonData.title}</h1>`;
                    html += `<p style="color:#64748b;margin-bottom:16px;">Nível: ${selectedLevel} | Módulo: ${selectedModule?.title || ''} | Tópico: ${selectedTopic}</p>`;
                    // Convert markdown to structured HTML
                    const fmt = (t: string) => t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`(.+?)`/g, '<code style="background:#f1f5f9;padding:1px 4px;border-radius:3px;font-size:12px;">$1</code>');
                    const lines = lessonData.explanation.split('\n');
                    lines.forEach(line => {
                      const trimmed = line.trim();
                      if (!trimmed) return;
                      const clean = trimmed.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2702}-\u{27B0}]/gu, '').trim();
                      if (!clean) return;
                      if (clean.startsWith('### ')) html += `<h3>${fmt(clean.slice(4))}</h3>`;
                      else if (clean.startsWith('## ')) html += `<h2>${fmt(clean.slice(3))}</h2>`;
                      else if (clean.startsWith('# ')) html += `<h1>${fmt(clean.slice(2))}</h1>`;
                      else if (clean.startsWith('- ') || clean.startsWith('* ')) html += `<li>${fmt(clean.slice(2))}</li>`;
                      else if (/^\d+\.\s/.test(clean)) html += `<li>${fmt(clean.replace(/^\d+\.\s/, ''))}</li>`;
                      else if (clean.startsWith('> ')) html += `<blockquote style="border-left:3px solid #3b82f6;padding-left:12px;color:#475569;margin:8px 0;">${fmt(clean.slice(2))}</blockquote>`;
                      else html += `<p>${fmt(clean)}</p>`;
                    });
                    if (lessonData.vocabulary?.length) {
                      html += `<h2>Vocabulário</h2><table><tr><th>Termo</th><th>Tradução</th><th>Exemplo</th></tr>`;
                      lessonData.vocabulary.forEach(v => html += `<tr><td><strong>${v.term}</strong></td><td>${v.translation}</td><td><em>${v.example || ''}</em></td></tr>`);
                      html += `</table>`;
                    }
                    if (lessonData.culturalNote) html += `<h2>Nota Cultural</h2><div class="card"><p>${lessonData.culturalNote}</p></div>`;
                    if (lessonData.practicePrompt) html += `<h2>Sugestão de Prática</h2><div class="card"><p>${lessonData.practicePrompt}</p></div>`;
                    return html;
                  }} />
                  <SpeakButton text={`${lessonData.title}. ${lessonData.explanation.replace(/[#*`]/g, '')}`} langCode={currentLangSpeech} label="Ouvir" />
                </div>
              </div>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{lessonData.explanation}</ReactMarkdown>
              </div>
              {lessonData.vocabulary?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    Vocabulário <Badge variant="outline" className="text-[10px]">{lessonData.vocabulary.length} palavras</Badge>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {lessonData.vocabulary.map((v, i) => (
                      <div key={i} className="p-3 rounded-xl bg-accent/40 text-xs flex items-start gap-2 border border-border/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <strong className="text-sm">{v.term}</strong>
                            <span className="text-muted-foreground">— {v.translation}</span>
                          </div>
                          {v.example && <p className="text-muted-foreground italic mt-1 text-[11px]">"{v.example}"</p>}
                        </div>
                        <SpeakButton text={`${v.term}. ${v.example || ''}`} langCode={currentLangSpeech} size="icon" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {lessonData.culturalNote && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm flex items-start gap-3">
                  <Globe className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary">Nota Cultural</strong>
                    <p className="mt-1 text-muted-foreground">{lessonData.culturalNote}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={loadLesson} disabled={loading} className="flex-1 gap-1">
                  <RotateCcw className="h-3.5 w-3.5" /> Nova Lição
                </Button>
                <Button onClick={() => setActiveTab("exercise")} className="flex-1 gap-1">
                  <PenTool className="h-3.5 w-3.5" /> Exercícios
                </Button>
              </div>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ========== EXERCISE TAB ========== */}
        <TabsContent value="exercise" className="space-y-3 mt-4">
          {!exerciseData ? (
            <Card className="border-0 shadow-sm"><CardContent className="p-10 text-center space-y-4">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${langInfo.color} flex items-center justify-center mx-auto shadow-lg`}>
                <PenTool className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-bold text-lg">Exercícios Interativos</h3>
              <p className="text-sm text-muted-foreground">5 questões por IA sobre <strong>{selectedTopic}</strong></p>
              <Button onClick={loadExercise} disabled={loading} size="lg" className={`bg-gradient-to-r ${langInfo.color} hover:opacity-90`}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Gerando...</> : <>Gerar Exercícios</>}
              </Button>
            </CardContent></Card>
          ) : (
            <Card className="border-0 shadow-sm"><CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <PenTool className="h-5 w-5 text-primary" /> {exerciseData.title}
              </h2>
              {exerciseData.questions.map(q => (
                <div key={q.id} className={`p-4 rounded-xl border transition-all ${showResults ? (answers[q.id] === q.correctAnswer ? 'border-green-300 bg-green-50/50 dark:bg-green-950/20' : 'border-red-300 bg-red-50/50 dark:bg-red-950/20') : 'bg-card'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${showResults ? (answers[q.id] === q.correctAnswer ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300') : 'bg-primary/10 text-primary'}`}>
                      {showResults ? (answers[q.id] === q.correctAnswer ? '✓' : '✗') : q.id}
                    </div>
                    <p className="text-sm font-medium flex-1">{q.question}</p>
                    <SpeakButton text={q.question} langCode={currentLangSpeech} size="icon" />
                  </div>
                  {q.options ? (
                    <div className="space-y-2 ml-9">
                      {q.options.map(opt => {
                        const letter = opt.charAt(0);
                        const isSelected = answers[q.id] === letter;
                        const isCorrect = letter === q.correctAnswer;
                        return (
                          <button
                            key={opt}
                            onClick={() => !showResults && setAnswers(p => ({ ...p, [q.id]: letter }))}
                            className={`w-full text-left p-3 rounded-xl text-sm transition-all ${isSelected ? 'bg-primary/10 border-2 border-primary' : 'hover:bg-accent/50 border-2 border-transparent'} ${showResults && isCorrect ? 'bg-green-100 dark:bg-green-900/30 border-green-400' : ''} ${showResults && isSelected && !isCorrect ? 'bg-red-100 dark:bg-red-900/30 border-red-400' : ''}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="ml-9">
                      <Textarea placeholder="Sua resposta..." value={answers[q.id] || ""} onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))} disabled={showResults} rows={2} />
                    </div>
                  )}
                  {showResults && (
                    <div className="ml-9 space-y-1">
                      <p className="text-xs text-muted-foreground bg-accent/30 p-3 rounded-lg">{q.explanation}</p>
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 p-2 rounded-lg">
                        Resposta correta: {q.options ? q.options.find(o => o.startsWith(q.correctAnswer)) || q.correctAnswer : q.correctAnswer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {!showResults ? (
                <Button onClick={submitExercise} className={`w-full bg-gradient-to-r ${langInfo.color} hover:opacity-90`} size="lg">
                  Verificar Respostas
                </Button>
              ) : (
                <Button onClick={loadExercise} variant="outline" className="w-full gap-2">
                  <RotateCcw className="h-4 w-4" /> Gerar Novos Exercícios
                </Button>
              )}
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ========== CONVERSATION TAB (WITH VOICE) ========== */}
        <TabsContent value="conversation" className="space-y-3 mt-4">
          {!conversationData ? (
            <Card className="border-0 shadow-sm"><CardContent className="p-10 text-center space-y-4">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${langInfo.color} flex items-center justify-center mx-auto shadow-lg`}>
                <MessageCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-bold text-lg">Conversação Real</h3>
              <p className="text-sm text-muted-foreground">
                Pratique com diálogos reais e depois <strong>converse por voz</strong> com o mentor
              </p>
              <div className="flex flex-wrap gap-2 justify-center text-[10px] text-muted-foreground">
                <Badge variant="outline" className="gap-1"><MessageCircle className="h-2.5 w-2.5" /> Diálogo completo</Badge>
                <Badge variant="outline" className="gap-1"><Mic className="h-2.5 w-2.5" /> Conversação por voz</Badge>
                <Badge variant="outline" className="gap-1"><Target className="h-2.5 w-2.5" /> Avaliação de fluência</Badge>
              </div>
              <Button onClick={loadConversation} disabled={loading} size="lg" className={`bg-gradient-to-r ${langInfo.color} hover:opacity-90`}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Gerando...</> : <>Gerar Conversação</>}
              </Button>
            </CardContent></Card>
          ) : (
            <Card className="border-0 shadow-sm"><CardContent className="p-6 space-y-5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" /> {conversationData.title}
              </h2>

              {/* Scenario */}
              {conversationData.scenario && (
                <div className="p-4 rounded-xl bg-accent/30 text-sm border border-border/50">
                  <p className="font-semibold text-xs text-muted-foreground mb-1">Cenário</p>
                  <p>{conversationData.scenario}</p>
                </div>
              )}

              {/* Dialogue */}
              {!convPracticeMode && (
                <>
                  <div className="space-y-3">
                    {conversationData.dialogue?.map((d, i) => (
                      <div key={i} className={`flex gap-3 ${d.speaker === "A" || i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${d.speaker === "A" || i % 2 === 0 ? 'bg-primary text-primary-foreground' : 'bg-accent text-foreground'}`}>
                          {d.speaker || (i % 2 === 0 ? "A" : "B")}
                        </div>
                        <div className={`flex-1 max-w-[80%] ${d.speaker === "A" || i % 2 === 0 ? '' : 'text-right'}`}>
                          <div className={`p-3 rounded-2xl text-sm ${d.speaker === "A" || i % 2 === 0 ? 'bg-primary/10 rounded-tl-none' : 'bg-accent rounded-tr-none'}`}>
                            <div className="flex items-center gap-2 justify-between">
                              <p className="font-medium">{d.line}</p>
                              <SpeakButton text={d.line} langCode={currentLangSpeech} size="icon" />
                            </div>
                            {d.translation && <p className="text-[11px] text-muted-foreground mt-1 italic">({d.translation})</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Key Phrases */}
                  {conversationData.keyPhrases?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-3">Frases Essenciais</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {conversationData.keyPhrases.map((kp, i) => (
                          <div key={i} className="p-3 rounded-xl bg-accent/30 border border-border/50 text-xs">
                            <div className="flex items-center justify-between">
                              <strong className="text-sm">{kp.phrase}</strong>
                              <SpeakButton text={kp.phrase} langCode={currentLangSpeech} size="icon" />
                            </div>
                            <p className="text-muted-foreground mt-0.5">{kp.meaning}</p>
                            {kp.usage && <p className="text-muted-foreground italic mt-0.5">{kp.usage}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* VOICE PRACTICE MODE */}
              {convPracticeMode && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
                    <p className="text-sm font-semibold text-primary flex items-center justify-center gap-2">
                      <Mic className="h-4 w-4" /> Modo Conversação por Voz
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">O mentor fala e você responde usando o microfone</p>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="h-64 rounded-xl border p-4">
                    <div className="space-y-3">
                      {convMessages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${msg.role === "mentor" ? "bg-primary text-primary-foreground" : "bg-accent"}`}>
                            {msg.role === "mentor" ? "M" : "U"}
                          </div>
                          <div className={`max-w-[80%] ${msg.role === "user" ? "text-right" : ""}`}>
                            <div className={`p-3 rounded-2xl text-sm ${msg.role === "mentor" ? "bg-primary/10 rounded-tl-none" : "bg-accent rounded-tr-none"}`}>
                              <div className="flex items-center gap-2 justify-between">
                                <p className="font-medium">{msg.text}</p>
                                {msg.role === "mentor" && <SpeakButton text={msg.text} langCode={currentLangSpeech} size="icon" />}
                              </div>
                              {msg.translation && <p className="text-[11px] text-muted-foreground mt-1 italic">({msg.translation})</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Voice Input */}
                  <div className="flex items-center gap-3 p-3 rounded-xl border bg-card">
                    {speechRecognition.isListening ? (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-semibold text-red-500">Ouvindo...</span>
                          </div>
                          <p className="text-sm min-h-[2rem]">
                            {speechRecognition.transcript}
                            <span className="text-muted-foreground italic">{speechRecognition.interimTranscript}</span>
                          </p>
                        </div>
                        <Button variant="destructive" size="icon" className="h-10 w-10 rounded-full" onClick={speechRecognition.stopListening}>
                          <Square className="h-4 w-4" />
                        </Button>
                        <Button size="icon" className="h-10 w-10 rounded-full" onClick={handleSendSpeech} disabled={!speechRecognition.transcript.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground flex-1">Pressione o microfone para falar em {langInfo.name}</p>
                        <Button size="icon" className={`h-12 w-12 rounded-full bg-gradient-to-r ${langInfo.color} hover:opacity-90 shadow-lg`} onClick={speechRecognition.startListening} disabled={loading}>
                          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!convPracticeMode ? (
                  <Button onClick={startConversationPractice} size="lg" className={`flex-1 bg-gradient-to-r ${langInfo.color} hover:opacity-90 gap-2`}>
                    <Mic className="h-4 w-4" /> Praticar por Voz
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setConvPracticeMode(false)} className="flex-1 gap-2">
                    <ArrowLeft className="h-4 w-4" /> Ver Diálogo
                  </Button>
                )}
                <Button onClick={loadConversation} variant="outline" disabled={loading} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Novo
                </Button>
              </div>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ========== TEXT TAB ========== */}
        <TabsContent value="text" className="space-y-3 mt-4">
          {!textData ? (
            <Card className="border-0 shadow-sm"><CardContent className="p-10 text-center space-y-4">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${langInfo.color} flex items-center justify-center mx-auto shadow-lg`}>
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-bold text-lg">Leitura & Interpretação</h3>
              <p className="text-sm text-muted-foreground">Texto com glossário e perguntas de compreensão</p>
              <Button onClick={loadText} disabled={loading} size="lg" className={`bg-gradient-to-r ${langInfo.color} hover:opacity-90`}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Gerando...</> : <>Carregar Texto</>}
              </Button>
            </CardContent></Card>
          ) : (
            <Card className="border-0 shadow-sm"><CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> {textData.title}
                </h2>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => {
                    if (isSpeaking) { stopSpeaking(); setIsSpeaking(false); setHighlightedSentence(-1); }
                    else {
                      setIsSpeaking(true);
                      setHighlightedSentence(0);
                      speakWithHighlight(textData.text, currentLangSpeech,
                        (idx) => setHighlightedSentence(idx),
                        () => { setIsSpeaking(false); setHighlightedSentence(-1); }
                      );
                    }
                  }}
                  className="h-7 gap-1 px-2 hover:bg-primary/10"
                >
                  {isSpeaking ? <Pause className="h-3 w-3 text-primary" /> : <Volume2 className="h-3 w-3 text-primary" />}
                  <span className="text-[10px]">{isSpeaking ? "Pausar" : "Ouvir"}</span>
                </Button>
              </div>
              <div className="p-5 bg-accent/20 rounded-xl text-sm leading-relaxed whitespace-pre-wrap border border-border/50">
                {splitSentences(textData.text).map((sentence, idx) => (
                  <span
                    key={idx}
                    className={`transition-all duration-300 ${
                      highlightedSentence === idx
                        ? "bg-primary/20 text-primary font-medium rounded px-1 py-0.5"
                        : highlightedSentence >= 0 && highlightedSentence !== idx
                          ? "opacity-50"
                          : ""
                    }`}
                  >
                    {sentence}{idx < splitSentences(textData.text).length - 1 ? " " : ""}
                  </span>
                ))}
              </div>
              {textData.glossary?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Glossário</h3>
                  <div className="flex flex-wrap gap-2">
                    {textData.glossary.map((g, i) => (
                      <Badge key={i} variant="outline" className="text-xs gap-1 cursor-pointer py-1.5 hover:bg-primary/10" onClick={() => speak(g.word, currentLangSpeech)}>
                        <Volume2 className="h-2.5 w-2.5" /> <strong>{g.word}</strong>: {g.meaning}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {textData.comprehensionQuestions?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-3">Perguntas de Compreensão</h3>
                  {textData.comprehensionQuestions.map((q, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium flex-1">{i + 1}. {q.question}</p>
                        <SpeakButton text={q.question} langCode={currentLangSpeech} size="icon" />
                      </div>
                      <Textarea placeholder="Sua resposta..." className="mt-2" rows={2} value={textAnswers[i] || ""} onChange={e => setTextAnswers(prev => ({ ...prev, [i]: e.target.value }))} />
                    </div>
                  ))}
                  <Button onClick={submitTextAnswer} disabled={loading} className={`w-full bg-gradient-to-r ${langInfo.color} hover:opacity-90`}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Enviar para Avaliação
                  </Button>
                </div>
              )}
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ========== ORAL TAB (WITH VOICE RECOGNITION) ========== */}
        <TabsContent value="oral" className="space-y-3 mt-4">
          {!oralData ? (
            <Card className="border-0 shadow-sm"><CardContent className="p-10 text-center space-y-4">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${langInfo.color} flex items-center justify-center mx-auto shadow-lg`}>
                <Mic className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-bold text-lg">Avaliação Oral</h3>
              <p className="text-sm text-muted-foreground">Leia em voz alta e o mentor avalia sua pronúncia</p>
              <Button onClick={loadOral} disabled={loading} size="lg" className={`bg-gradient-to-r ${langInfo.color} hover:opacity-90`}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Gerando...</> : <>Gerar Avaliação Oral</>}
              </Button>
            </CardContent></Card>
          ) : (
            <Card className="border-0 shadow-sm"><CardContent className="p-6 space-y-5">
              <h2 className="text-lg font-bold flex items-center gap-2"><Mic className="h-5 w-5 text-primary" />{oralData.title}</h2>

              {/* Reading passage with sentence highlighting */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">Texto para Leitura</h3>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => {
                      if (isSpeaking) { stopSpeaking(); setIsSpeaking(false); setHighlightedSentence(-1); }
                      else {
                        setIsSpeaking(true);
                        setHighlightedSentence(0);
                        speakWithHighlight(oralData.readingPassage, currentLangSpeech,
                          (idx) => setHighlightedSentence(idx),
                          () => { setIsSpeaking(false); setHighlightedSentence(-1); }
                        );
                      }
                    }}
                    className="h-7 gap-1 px-2 hover:bg-primary/10"
                  >
                    {isSpeaking ? <Pause className="h-3 w-3 text-primary" /> : <Volume2 className="h-3 w-3 text-primary" />}
                    <span className="text-[10px]">{isSpeaking ? "Pausar" : "Ouvir modelo"}</span>
                  </Button>
                </div>
                <div className="p-5 bg-accent/20 rounded-xl text-sm leading-relaxed border border-border/50">
                  {splitSentences(oralData.readingPassage).map((sentence, idx) => (
                    <span
                      key={idx}
                      className={`transition-all duration-300 ${
                        highlightedSentence === idx
                          ? "bg-primary/20 text-primary font-medium rounded px-1 py-0.5"
                          : highlightedSentence >= 0 && highlightedSentence !== idx
                            ? "opacity-50"
                            : ""
                      }`}
                    >
                      {sentence}{idx < splitSentences(oralData.readingPassage).length - 1 ? " " : ""}
                    </span>
                  ))}
                </div>
              </div>

              {/* Voice Recording for Oral */}
              <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Mic className="h-4 w-4 text-primary" /> Grave sua leitura
                </h3>
                <p className="text-[11px] text-muted-foreground">Leia o texto acima em voz alta. O mentor vai avaliar sua pronúncia e fluência.</p>

                {speechRecognition.isListening ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-semibold text-red-500">Gravando...</span>
                    </div>
                    <div className="p-3 bg-card rounded-lg text-sm min-h-[3rem]">
                      {speechRecognition.transcript}
                      <span className="text-muted-foreground italic">{speechRecognition.interimTranscript}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="destructive" onClick={speechRecognition.stopListening} className="gap-1">
                        <Square className="h-3 w-3" /> Parar
                      </Button>
                      <Button onClick={handleSendSpeech} disabled={!speechRecognition.transcript.trim() || loading} className="gap-1">
                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />} Avaliar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={speechRecognition.startListening} size="lg" className={`w-full bg-gradient-to-r ${langInfo.color} hover:opacity-90 gap-2`}>
                    <Mic className="h-5 w-5" /> Começar a Gravar
                  </Button>
                )}
              </div>

              {/* Pronunciation tips */}
              {oralData.pronunciationTips?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Dicas de Pronúncia</h3>
                  <ul className="space-y-2">{oralData.pronunciationTips.map((t, i) => (
                    <li key={i} className="text-sm flex items-start gap-2 p-2 rounded-lg bg-accent/20">
                      <span className="text-primary font-bold">•</span>{t}
                    </li>
                  ))}</ul>
                </div>
              )}

              {/* Vocabulary focus */}
              {oralData.vocabularyFocus?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Foco no Vocabulário</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {oralData.vocabularyFocus.map((v, i) => (
                      <div key={i} className="p-3 rounded-xl bg-accent/30 text-xs flex items-center gap-2 border border-border/50">
                        <div className="flex-1">
                          <strong className="text-sm">{v.word}</strong> <span className="text-muted-foreground">[{v.phonetic}]</span>
                          <br /><span className="text-muted-foreground">{v.tip}</span>
                        </div>
                        <SpeakButton text={v.word} langCode={currentLangSpeech} size="icon" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation prompts with voice */}
              {oralData.conversationPrompts?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Responda por Voz</h3>
                  <div className="space-y-2">
                    {oralData.conversationPrompts.map((p, i) => (
                      <div key={i} className="p-3 rounded-xl border text-sm bg-card">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium flex-1">{i + 1}. {p}</p>
                          <SpeakButton text={p} langCode={currentLangSpeech} size="icon" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent></Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Evaluation dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Resultado da Avaliação</DialogTitle></DialogHeader>
          {evalData && (
            <div className="space-y-4">
              <div className="text-center p-4">
                <p className={`text-5xl font-black ${evalData.score >= 80 ? 'text-green-500' : evalData.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>{evalData.score}%</p>
                <Progress value={evalData.score} className="h-3 mt-3" />
              </div>
              <p className="text-sm">{evalData.feedback}</p>
              {evalData.corrections?.length > 0 && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Correções:</p>
                  <ul className="text-xs space-y-1">{evalData.corrections.map((c: any, i: number) => <li key={i}>• {typeof c === 'string' ? c : c.explanation}</li>)}</ul>
                </div>
              )}
              {evalData.tips?.length > 0 && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">Dicas:</p>
                  <ul className="text-xs space-y-1">{evalData.tips.map((t, i) => <li key={i}>💡 {t}</li>)}</ul>
                </div>
              )}
              {evalData.encouragement && <p className="text-sm text-center font-medium text-primary">{evalData.encouragement}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Speech Evaluation dialog */}
      <Dialog open={speechDialogOpen} onOpenChange={setSpeechDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Mic className="h-5 w-5 text-primary" /> Avaliação da sua Fala</DialogTitle></DialogHeader>
          {speechEvalData && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                <div className="text-center p-4">
                  <p className={`text-5xl font-black ${speechEvalData.score >= 80 ? 'text-green-500' : speechEvalData.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>{speechEvalData.score}%</p>
                  <Progress value={speechEvalData.score} className="h-3 mt-3" />
                  <Badge className="mt-2" variant="outline">{speechEvalData.fluency_level}</Badge>
                </div>

                {/* What you said */}
                <div className="p-3 rounded-xl bg-accent/30">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">O que você disse:</p>
                  <p className="text-sm italic">"{speechEvalData.transcription}"</p>
                </div>

                <p className="text-sm">{speechEvalData.feedback}</p>

                {/* Corrections */}
                {speechEvalData.corrections?.length > 0 && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Correções:</p>
                    {speechEvalData.corrections.map((c, i) => (
                      <div key={i} className="mb-2 text-xs">
                        <p><span className="line-through text-red-400">{c.original}</span> → <strong className="text-green-600">{c.corrected}</strong></p>
                        <p className="text-muted-foreground">{c.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pronunciation tips */}
                {speechEvalData.pronunciation_tips?.length > 0 && (
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20">
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">Dicas de Pronúncia:</p>
                    <ul className="text-xs space-y-1">{speechEvalData.pronunciation_tips.map((t, i) => <li key={i}>- {t}</li>)}</ul>
                  </div>
                )}

                {/* Next challenge */}
                {speechEvalData.next_challenge && (
                  <div className="p-3 rounded-xl border border-primary/20 bg-primary/5">
                    <p className="text-xs font-semibold text-primary mb-1">Próximo desafio:</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{speechEvalData.next_challenge}</p>
                      <SpeakButton text={speechEvalData.next_challenge} langCode={currentLangSpeech} size="icon" />
                    </div>
                  </div>
                )}

                {speechEvalData.encouragement && <p className="text-sm text-center font-medium text-primary">{speechEvalData.encouragement}</p>}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
