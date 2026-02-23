import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send, Mic, MicOff, Pin, Search, X, XCircle, Zap,
  GraduationCap, BarChart3, BookOpen, Brain, Target,
  PenTool, Swords, RotateCcw, Lightbulb, MessageCircle,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { KanbanTask, ChatMessage, Flashcard, EnemArea, MentorMode, MENTOR_MODES, StudentContext, Note } from "@/types/study";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useGamification } from "@/hooks/useGamification";

import { MentorHeader } from "./mentor/MentorHeader";
import { MentorMessageBubble } from "./mentor/MentorMessageBubble";
import { MentorStats } from "./mentor/MentorStats";
import {
  MentorConfig, DEFAULT_CONFIG, VOICE_PERSONAS, PROMPT_TEMPLATES,
  TYPING_INDICATORS, MODE_SUGGESTIONS,
} from "./mentor/MentorTypes";
import {
  getReminders, extractMemories, extractSentiment, cleanTags,
  compressMessages, exportAsNote,
} from "./mentor/MentorUtils";
import { generateOfflineResponse, generateFallbackResponse, type WebSearchResult } from "./mentor/MentorOfflineFallback";

const WEB_SEARCH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/web-search`;

const MODE_ICONS: Record<string, React.ReactNode> = {
  livre: <MessageCircle className="h-3.5 w-3.5" />,
  aula: <BookOpen className="h-3.5 w-3.5" />,
  socratico: <Brain className="h-3.5 w-3.5" />,
  redacao: <PenTool className="h-3.5 w-3.5" />,
  debate: <Swords className="h-3.5 w-3.5" />,
  revisao: <RotateCcw className="h-3.5 w-3.5" />,
  exercicios: <Target className="h-3.5 w-3.5" />,
  entrevista: <Mic className="h-3.5 w-3.5" />,
  brainstorm: <Lightbulb className="h-3.5 w-3.5" />,
};

interface MentorChatProps { embedded?: boolean; onMessagesRef?: (setter: (msgs: ChatMessage[]) => void) => void; }

export const MentorChat = React.forwardRef<HTMLDivElement, MentorChatProps>(function MentorChat({ embedded = false, onMessagesRef }, ref) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useLocalStorage<KanbanTask[]>('kanban-tasks', []);
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('mentor-messages', []);
  const [memories, setMemories] = useLocalStorage<string[]>('mentor-memories', []);
  const [config] = useLocalStorage<MentorConfig>('mentor-config', DEFAULT_CONFIG);
  const [mentorPersona] = useLocalStorage<string>('mentor-persona', 'descolado');
  const [mentorSpeed] = useLocalStorage<string>('mentor-speed', '1');
  const [pdfKnowledge] = useLocalStorage<any[]>('pdf-knowledge', []);
  const [flashcards, setFlashcards] = useLocalStorage<Flashcard[]>('flashcards', []);
  const [studyNotes, setStudyNotes] = useLocalStorage<Note[]>('study-notes', []);
  const [simuladoResults] = useLocalStorage<any[]>('simulado-results', []);
  const [studySessions] = useLocalStorage<any[]>('study-sessions', []);
  const [goals] = useLocalStorage<any[]>('study-goals', []);
  const [responseRatings, setResponseRatings] = useLocalStorage<Record<number, string>>('mentor-ratings', {});
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useLocalStorage<string>('mentor-greeted-date', '');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useLocalStorage<MentorMode>('mentor-mode', 'livre');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [quotedText, setQuotedText] = useState<string | null>(null);
  const [typingIndicator, setTypingIndicator] = useState('');

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useLocalStorage<boolean>('mentor-voice-enabled', true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState<number | null>(null);
  const [highlightWord, setHighlightWord] = useState<number>(-1);
  const [isPaused, setIsPaused] = useState(false);
  const recognitionRef = useRef<any>(null);
  const sendMessageRef = useRef<(text: string) => void>(() => {});

  const [micOk, setMicOk] = useState<boolean | null>(null);
  const [isSavingChat, setIsSavingChat] = useState(false);

  const { stats, currentLevel, addXP, unlockedAchievements } = useGamification();

  useEffect(() => { onMessagesRef?.(setMessages); }, [onMessagesRef, setMessages]);
  useEffect(() => { return () => { window.speechSynthesis?.cancel(); }; }, []);

  const persona = VOICE_PERSONAS.find(p => p.id === mentorPersona) || VOICE_PERSONAS.find(p => p.id === config.voicePersona) || VOICE_PERSONAS[0];
  const personaRef = useRef(persona);
  const configRef = useRef(config);
  useEffect(() => { personaRef.current = persona; configRef.current = config; }, [persona, config]);

  // Auto-detect and configure microphone + audio devices
  const [audioDevices, setAudioDevices] = useState<{ inputs: MediaDeviceInfo[]; outputs: MediaDeviceInfo[] }>({ inputs: [], outputs: [] });

  useEffect(() => {
    const detectDevices = async () => {
      try {
        // Request permission first to get device labels
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        setMicOk(true);

        // Enumerate all devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices.filter(d => d.kind === 'audioinput');
        const outputs = devices.filter(d => d.kind === 'audiooutput');
        setAudioDevices({ inputs, outputs });

        if (inputs.length === 0) {
          setMicOk(false);
          toast.error('Nenhum microfone detectado. Conecte um microfone e recarregue a página.');
        } else {
          console.log(`[Mentor] ${inputs.length} microfone(s) detectado(s): ${inputs.map(d => d.label || 'Sem nome').join(', ')}`);
          console.log(`[Mentor] ${outputs.length} saída(s) de áudio: ${outputs.map(d => d.label || 'Sem nome').join(', ')}`);
        }
      } catch (err: any) {
        setMicOk(false);
        if (err.name === 'NotAllowedError') {
          console.warn('[Mentor] Permissão de microfone negada pelo usuário');
        } else if (err.name === 'NotFoundError') {
          console.warn('[Mentor] Nenhum dispositivo de áudio encontrado');
          toast.error('Nenhum microfone encontrado no computador.');
        } else {
          console.error('[Mentor] Erro ao detectar áudio:', err);
        }
      }
    };

    detectDevices();

    // Listen for device changes (plug/unplug)
    const handleDeviceChange = () => {
      detectDevices();
      toast.info('Dispositivo de áudio alterado — reconfigurando...');
    };
    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);
    return () => navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
  }, []);

  // Speech recognition with auto-configured mic
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const recognition = new SR();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const results = event.results;
        const lastResult = results[results.length - 1];
        const transcript = Array.from(results).map((r: any) => r[0].transcript).join('');
        setInput(transcript);
        if (lastResult?.isFinal) {
          setIsListening(false);
          if (transcript.trim()) setTimeout(() => sendMessageRef.current(transcript.trim()), 300);
        }
      };
      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'no-speech') {
          toast.info('Não detectei nenhuma fala. Tente novamente.');
        } else if (event.error === 'audio-capture') {
          toast.error('Erro ao capturar áudio. Verifique seu microfone.');
          setMicOk(false);
        } else if (event.error === 'not-allowed') {
          toast.error('Permissão de microfone negada. Habilite nas configurações do navegador.');
          setMicOk(false);
        }
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = useCallback(async () => {
    if (!recognitionRef.current) { toast.error('Seu navegador não suporta reconhecimento de voz'); return; }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); return; }

    // Request mic permission directly from user gesture (critical for browser security)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      stream.getTracks().forEach(t => t.stop());
      setMicOk(true);
    } catch (err: any) {
      setMicOk(false);
      if (err.name === 'NotAllowedError') {
        toast.error('Permissão de microfone negada. Habilite nas configurações do navegador.');
      } else {
        toast.error('Erro ao acessar microfone. Verifique se está conectado.');
      }
      return;
    }

    window.speechSynthesis?.cancel(); setIsSpeaking(false); setSpeakingMsgIdx(null); setHighlightWord(-1);
    try {
      recognitionRef.current.start(); setIsListening(true);
    } catch (e: any) {
      console.error('[Mentor] Erro ao iniciar reconhecimento:', e);
      toast.error('Erro ao iniciar microfone. Tente novamente.');
    }
  }, [isListening]);

  // TTS
  const prepareTTSText = useCallback((text: string): string => {
    let c = text;
    c = c.replace(/\[MEMORIZAR:.*?\]/g, '').replace(/\[AÇÃO:\w+:[^\]]+\]/g, '').replace(/\[SENTIMENTO:\s*\w+\]/g, '');
    c = c.replace(/^#{1,6}\s+/gm, '').replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1').replace(/`([^`]+)`/g, '$1');
    c = c.replace(/```[\s\S]*?```/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[\[\]]/g, '');
    c = c.replace(/^[-•*]\s+/gm, '. ').replace(/^\d+\.\s+/gm, '. ');
    c = c.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2702}-\u{27B0}]/gu, '');
    c = c.replace(/\n{2,}/g, '. ').replace(/\n/g, ', ').replace(/[.,]{2,}/g, '.').replace(/([.!?,:;])([A-Za-zÀ-ÿ])/g, '$1 $2').replace(/\s{2,}/g, ' ');
    c = c.replace(/\bJohan\b/gi, 'Joran');
    return c.trim();
  }, []);

  const detectLanguage = useCallback((text: string): string => {
    const patterns: { code: string; words: RegExp }[] = [
      { code: 'en-US', words: /\b(the|is|are|was|were|have|has|been|will|would|could|should|this|that|with|from|they)\b/gi },
      { code: 'es-ES', words: /\b(está|están|tiene|tienen|puede|pero|también|porque|cuando|donde|cómo)\b/gi },
      { code: 'de-DE', words: /\b(ist|sind|hat|haben|kann|können|wird|werden|aber|auch|weil)\b/gi },
      { code: 'it-IT', words: /\b(è|sono|ha|hanno|può|possono|questo|questa|ma|anche|perché)\b/gi },
      { code: 'zh-CN', words: /[\u4e00-\u9fff\u3400-\u4dbf]/g },
      { code: 'pt-BR', words: /\b(não|sim|também|porque|quando|onde|como|está|são|tem|pode|isso|mas)\b/gi },
    ];
    let best = 'pt-BR'; let bestScore = 0;
    for (const p of patterns) { const m = text.match(p.words); const s = m ? m.length : 0; if (s > bestScore) { bestScore = s; best = p.code; } }
    return best;
  }, []);

  const speakText = useCallback((text: string, msgIdx?: number) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(true); setSpeakingMsgIdx(msgIdx ?? null); setHighlightWord(-1);
    const cleaned = prepareTTSText(text);
    const lang = detectLanguage(cleaned);
    const utterance = new SpeechSynthesisUtterance(cleaned);
    const p = personaRef.current;
    const speed = parseFloat(mentorSpeed) || 1;
    utterance.lang = lang; utterance.rate = speed * p.rate; utterance.pitch = p.pitch; utterance.volume = 0.8;
    const voices = window.speechSynthesis.getVoices();
    const langVoices = voices.filter(v => v.lang.startsWith(lang.split('-')[0]));
    if (langVoices.length > 0) {
      const exact = langVoices.filter(v => v.lang === lang);
      const pool = exact.length > 0 ? exact : langVoices;
      utterance.voice = pool.find(v => /natural|premium|enhanced|neural/i.test(v.name)) || pool[0];
    }
    let wordCount = 0;
    utterance.onboundary = (e) => { if (e.name === 'word') { setHighlightWord(wordCount); wordCount++; } };
    utterance.onend = () => { setIsSpeaking(false); setSpeakingMsgIdx(null); setHighlightWord(-1); setIsPaused(false); };
    utterance.onerror = () => { setIsSpeaking(false); setSpeakingMsgIdx(null); setHighlightWord(-1); setIsPaused(false); };
    window.speechSynthesis.speak(utterance);
  }, [detectLanguage, prepareTTSText, mentorSpeed]);

  const stopSpeaking = useCallback(() => { window.speechSynthesis?.cancel(); setIsSpeaking(false); setSpeakingMsgIdx(null); setHighlightWord(-1); }, []);
  const togglePause = useCallback(() => {
    if (!window.speechSynthesis) return;
    if (window.speechSynthesis.paused) { window.speechSynthesis.resume(); setIsPaused(false); }
    else if (window.speechSynthesis.speaking) { window.speechSynthesis.pause(); setIsPaused(true); }
  }, []);

  const saveConversation = useCallback(async () => {
    if (messages.length <= 1) { toast.info('Nenhuma conversa para salvar.'); return; }
    setIsSavingChat(true);
    try {
      const title = messages.find(m => m.role === 'user')?.content.slice(0, 80) || 'Conversa';
      const { error } = await supabase.from('mentor_conversations').insert({ user_name: config.userName || 'Usuário', messages: messages as any, title });
      if (error) throw error;
      toast.success('Conversa salva!');
    } catch (e: any) { toast.error(`Erro: ${e.message}`); }
    setIsSavingChat(false);
  }, [messages, config.userName]);

  const handleExportToNotes = useCallback(() => {
    if (messages.length <= 1) { toast.info('Nenhuma conversa para exportar.'); return; }
    const note = exportAsNote(messages, config.userName);
    setStudyNotes(prev => [...prev, note]);
    toast.success('Conversa exportada para o Caderno! 📔');
  }, [messages, config.userName, setStudyNotes]);

  // Build student context
  const buildStudentContext = useCallback((): StudentContext => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.column !== 'done');
    const pendingTasks = tasks.filter(t => t.column !== 'done' && !t.archived);
    const areaScores: Record<string, { total: number; correct: number }> = {};
    (simuladoResults || []).forEach((r: any) => {
      const area = r.area || 'geral';
      if (!areaScores[area]) areaScores[area] = { total: 0, correct: 0 };
      areaScores[area].total += r.total || 0; areaScores[area].correct += r.correct || 0;
    });
    const weakAreas = Object.entries(areaScores).filter(([, s]) => s.total > 0 && (s.correct / s.total) < 0.5).map(([a]) => a);
    const strongAreas = Object.entries(areaScores).filter(([, s]) => s.total > 0 && (s.correct / s.total) >= 0.7).map(([a]) => a);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const recentAreas = [...new Set((studySessions || []).filter((s: any) => new Date(s.date) >= weekAgo).map((s: any) => s.area))];
    const goalsProgress = (goals || []).map((g: any) => ({ title: g.title || 'Meta', progress: g.target > 0 ? Math.round((g.current / g.target) * 100) : 0 }));
    return {
      studyStreak: stats.studyStreak, totalXP: stats.totalXP, level: stats.level,
      levelTitle: currentLevel.title, pomodorosDone: stats.pomodorosDone,
      flashcardsTotal: flashcards.length, flashcardsMastered: flashcards.filter(f => f.status === 'mastered').length,
      simuladosDone: stats.simuladosDone, simuladoAvgScore: simuladoResults.length > 0
        ? Math.round(simuladoResults.reduce((sum: number, r: any) => sum + ((r.correct || 0) / Math.max(r.total || 1, 1)) * 100, 0) / simuladoResults.length) : undefined,
      weakAreas, strongAreas, notesCount: studyNotes.length, tasksOverdue: overdueTasks.length,
      tasksPending: pendingTasks.length, recentStudyAreas: recentAreas as string[], neglectedAreas: [],
      goalsProgress, achievements: unlockedAchievements.map(a => a.title),
    };
  }, [tasks, simuladoResults, studySessions, goals, stats, currentLevel, flashcards, studyNotes, unlockedAchievements]);

  const buildGreeting = useCallback(() => {
    const reminders = getReminders(tasks);
    const name = config.userName || 'Johan';
    const modeLabel = MENTOR_MODES[mode]?.label || 'Livre';
    return `Olá ${name}! Sou seu **Mentor**, estou aqui para te orientar nos estudos e na vida.\n\n**Modo atual:** ${MENTOR_MODES[mode]?.icon} ${modeLabel}\n\n**Seus lembretes de hoje:**\n\n${reminders.join('\n\n')}\n\n${memories.length > 0 ? `Lembro de ${memories.length} coisa(s) sobre você! ` : ''}Como posso te ajudar agora?`;
  }, [tasks, config.userName, memories.length, mode]);

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (hasGreeted !== todayStr) {
      setMessages([{ role: 'assistant', content: buildGreeting(), timestamp: new Date().toISOString() }]);
      setHasGreeted(todayStr);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  // Typing indicator animation
  useEffect(() => {
    if (!isLoading) { setTypingIndicator(''); return; }
    const indicators = TYPING_INDICATORS[mode] || TYPING_INDICATORS.livre;
    let idx = 0;
    setTypingIndicator(indicators[0]);
    const interval = setInterval(() => { idx = (idx + 1) % indicators.length; setTypingIndicator(indicators[idx]); }, 2500);
    return () => clearInterval(interval);
  }, [isLoading, mode]);

  // Actions
  const handleAction = useCallback((action: { type: string; params: string[] }) => {
    switch (action.type) {
      case 'FLASHCARD': {
        const [q, a, area] = action.params;
        if (q && a) {
          setFlashcards(prev => [...prev, { id: crypto.randomUUID(), question: q, answer: a, area: (area as EnemArea) || 'linguagens', subject: '', status: 'new', createdAt: new Date().toISOString() }]);
          toast.success('Flashcard criado! 🃏'); addXP('flashcard_mastered', q.slice(0, 30));
        } break;
      }
      case 'TAREFA': {
        const [title, desc, area, priority] = action.params;
        if (title) {
          setTasks(prev => [...prev, { id: crypto.randomUUID(), title, description: desc || '', area: (area as EnemArea) || 'linguagens', priority: (priority as any) || 'media', dueDate: '', column: 'todo', createdAt: new Date().toISOString() }]);
          toast.success('Tarefa criada! 📋');
        } break;
      }
      case 'POMODORO': { navigate(`/pomodoro${action.params[0] ? `?area=${action.params[0]}` : ''}`); toast.success('Iniciando Pomodoro! 🍅'); break; }
      case 'META': { toast.success('Meta sugerida! 🎯'); navigate('/metas'); break; }
    }
  }, [setFlashcards, setTasks, navigate, addXP]);

  const toggleReaction = useCallback((idx: number, emoji: string) => {
    setMessages(prev => prev.map((m, i) => {
      if (i !== idx) return m;
      const reactions = { ...(m.reactions || {}) };
      reactions[emoji] = (reactions[emoji] || 0) > 0 ? 0 : 1;
      if (reactions[emoji] === 0) delete reactions[emoji];
      return { ...m, reactions };
    }));
  }, [setMessages]);

  const togglePin = useCallback((idx: number) => {
    setMessages(prev => prev.map((m, i) => i === idx ? { ...m, pinned: !m.pinned } : m));
  }, [setMessages]);

  const copyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(cleanTags(content)); toast.success('Copiado!');
  }, []);

  const rateResponse = useCallback((idx: number, rating: 'helpful' | 'unhelpful') => {
    setResponseRatings(prev => ({ ...prev, [idx]: rating }));
    if (rating === 'helpful') addXP('topic_complete', 'Feedback positivo');
  }, [setResponseRatings, addXP]);

  // Send message with context compression
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    stopSpeaking();
    const fullContent = quotedText ? `> ${quotedText}\n\n${text.trim()}` : text.trim();
    const userMsg: ChatMessage = { role: 'user', content: fullContent, timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput(''); setQuotedText(null); setShowTemplates(false); setIsLoading(true);
    addXP('topic_complete', 'Pergunta ao Mentor');

    let assistantSoFar = '';
    const pdfContext = pdfKnowledge.length > 0
      ? `\n\nMATERIAIS DE ESTUDO:\n${pdfKnowledge.map((k: any) => `📚 "${k.title}" - ${k.summary}`).join('\n')}` : '';

    try {
      const studentContext = buildStudentContext();

      // Generate local response first
      let localReply = generateOfflineResponse(
        text.trim(), mode, studentContext, tasks, flashcards, studyNotes, config.userName || 'Estudante'
      );

      // If local system can't answer, search the web (free, no tokens)
      if (localReply === '__NEEDS_WEB_SEARCH__') {
        try {
          const searchResp = await fetch(WEB_SEARCH_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ query: text.trim() }),
          });

          if (searchResp.ok) {
            const searchData = await searchResp.json();
            if (searchData.success && searchData.results?.length > 0) {
              localReply = generateOfflineResponse(
                text.trim(), mode, studentContext, tasks, flashcards, studyNotes,
                config.userName || 'Estudante', searchData.results as WebSearchResult[]
              );
            }
          }
        } catch { /* silent */ }

        // If still no answer, use fallback
        if (localReply === '__NEEDS_WEB_SEARCH__') {
          localReply = generateFallbackResponse(text.trim(), config.userName || 'Estudante');
        }
      }

      // Brief typing delay for natural feel
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 600));

      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: localReply } : m);
        return [...prev, { role: 'assistant', content: localReply, timestamp: new Date().toISOString() }];
      });

      const newMemories = extractMemories(localReply);
      if (newMemories.length > 0) setMemories(prev => [...new Set([...prev, ...newMemories])]);
      const sentiment = extractSentiment(localReply);
      const cleaned = cleanTags(localReply);
      setMessages(prev => prev.map((m, i) => i === prev.length - 1 && m.role === 'assistant' ? { ...m, content: cleaned, sentiment } : m));

      if (voiceEnabled && cleaned) speakText(cleaned, messages.length + 1);
    } catch (e: any) {
      const fallback = `Desculpe, ${config.userName || 'estudante'}, tive um problema ao processar sua mensagem. Tente novamente! 😊`;
      setMessages(prev => [...prev, { role: 'assistant', content: fallback, timestamp: new Date().toISOString() }]);
    }
    setIsLoading(false);
  };

  useEffect(() => { sendMessageRef.current = sendMessage; });

  const clearChat = () => {
    stopSpeaking();
    const greeting = buildGreeting();
    setMessages([{ role: 'assistant', content: greeting, timestamp: new Date().toISOString() }]);
    if (voiceEnabled) setTimeout(() => speakText(greeting, 0), 300);
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return messages.map((m, i) => ({ msg: m, idx: i })).filter(({ msg }) => msg.content.toLowerCase().includes(q));
  }, [messages, searchQuery]);

  const handleTextSelect = useCallback(() => {
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length > 2) setQuotedText(sel);
  }, []);

  const pinnedMsgs = useMemo(() => messages.filter(m => m.pinned), [messages]);
  const suggestions = MODE_SUGGESTIONS[mode] || MODE_SUGGESTIONS.livre;

  return (
    <div ref={ref} className={`flex flex-col ${embedded ? 'h-full' : 'h-[500px]'}`}>
      <MentorHeader
        mode={mode} config={config} memoriesCount={memories.length}
        isSpeaking={isSpeaking} isPaused={isPaused} voiceEnabled={voiceEnabled}
        showSearch={showSearch} focusMode={focusMode} isSavingChat={isSavingChat}
        onToggleModeSelector={() => setShowModeSelector(!showModeSelector)}
        onTogglePause={togglePause} onStopSpeaking={stopSpeaking}
        onToggleVoice={() => { setVoiceEnabled(!voiceEnabled); stopSpeaking(); }}
        onToggleSearch={() => setShowSearch(!showSearch)}
        onToggleFocus={() => setFocusMode(!focusMode)}
        onSaveConversation={saveConversation}
        onClearChat={clearChat}
        onExportToNotes={handleExportToNotes}
      />

      {/* Mode selector */}
      {showModeSelector && (
        <div className="bg-card border-b px-3 py-2 grid grid-cols-3 gap-1.5 animate-in slide-in-from-top-2">
          {(Object.entries(MENTOR_MODES) as [MentorMode, any][]).map(([key, val]) => (
            <button key={key} onClick={() => { setMode(key); setShowModeSelector(false); toast.success(`Modo ${val.label} ativado!`); }}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] transition-colors ${mode === key ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent'}`}>
              <span>{val.icon}</span>
              <div className="text-left min-w-0">
                <p className="font-medium">{val.label}</p>
                <p className="text-[9px] text-muted-foreground truncate">{val.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      {showSearch && (
        <div className="bg-card border-b px-3 py-2 flex items-center gap-2 animate-in slide-in-from-top-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar nas mensagens..." className="h-7 text-xs" autoFocus />
          {searchResults.length > 0 && <Badge variant="secondary" className="text-[10px] shrink-0">{searchResults.length}</Badge>}
          <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Stats panel */}
      <MentorStats messages={messages} show={showStats} onClose={() => setShowStats(false)} />

      {/* Pinned */}
      {pinnedMsgs.length > 0 && !showSearch && !showStats && (
        <div className="bg-accent/30 border-b px-3 py-1.5 flex items-center gap-2 overflow-x-auto">
          <Pin className="h-3 w-3 text-primary shrink-0" />
          <span className="text-[10px] text-muted-foreground shrink-0">Fixadas ({pinnedMsgs.length}):</span>
          {pinnedMsgs.slice(0, 3).map((m, i) => (
            <span key={i} className="text-[10px] truncate max-w-[120px] bg-card px-1.5 py-0.5 rounded">
              {cleanTags(m.content).slice(0, 40)}...
            </span>
          ))}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-auto p-3 sm:p-4 space-y-3 scrollbar-thin bg-background" onMouseUp={handleTextSelect}>
        {messages.map((msg, i) => {
          if (showSearch && searchQuery && !msg.content.toLowerCase().includes(searchQuery.toLowerCase())) {
            return <div key={i} className="opacity-20"><MentorMessageBubble msg={msg} idx={i} isSpeaking={isSpeaking} speakingMsgIdx={speakingMsgIdx}
              highlightWord={highlightWord} onSpeakText={speakText} onStopSpeaking={stopSpeaking}
              onToggleReaction={toggleReaction} onTogglePin={togglePin} onCopyMessage={copyMessage}
              onHandleAction={handleAction} onRateResponse={rateResponse} /></div>;
          }
          return <MentorMessageBubble key={i} msg={msg} idx={i} isSpeaking={isSpeaking} speakingMsgIdx={speakingMsgIdx}
            highlightWord={highlightWord} onSpeakText={speakText} onStopSpeaking={stopSpeaking}
            onToggleReaction={toggleReaction} onTogglePin={togglePin} onCopyMessage={copyMessage}
            onHandleAction={handleAction} onRateResponse={rateResponse} />;
        })}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full mentor-gradient flex items-center justify-center shrink-0 shadow-sm">
              <GraduationCap className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="bg-card border rounded-2xl rounded-bl-md px-3 py-2.5 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-muted-foreground text-xs animate-pulse">{typingIndicator}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {suggestions.map(s => (
            <button key={s} onClick={() => sendMessage(s)} className="text-[11px] px-2.5 py-1.5 rounded-full border bg-card hover:bg-accent transition-colors shadow-sm">{s}</button>
          ))}
        </div>
      )}

      {/* Templates */}
      {showTemplates && (
        <div className="px-3 pb-2 flex flex-wrap gap-1 animate-in slide-in-from-bottom-2">
          {PROMPT_TEMPLATES.map(t => (
            <button key={t.label} onClick={() => { setInput(t.prompt); setShowTemplates(false); }}
              className="text-[10px] px-2 py-1 rounded-full border bg-accent/50 hover:bg-accent transition-colors flex items-center gap-1">
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Quote bar */}
      {quotedText && (
        <div className="mx-2.5 mt-1 flex items-start gap-2 bg-accent/60 border-l-3 border-primary rounded-lg px-3 py-2 text-xs">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-primary mb-0.5">Respondendo a:</p>
            <p className="text-muted-foreground line-clamp-2 italic">{quotedText}</p>
          </div>
          <button onClick={() => setQuotedText(null)} className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"><XCircle className="h-4 w-4" /></button>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-2.5 sm:p-3 flex gap-2 shrink-0 bg-card rounded-b-xl">
        <Button onClick={toggleListening} size="icon" variant={isListening ? "destructive" : "outline"}
          className={`h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl ${isListening ? 'animate-pulse' : ''}`}
          title={isListening ? "Parar de ouvir" : "Falar"}>
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>

        <Button onClick={() => setShowTemplates(!showTemplates)} size="icon" variant="outline"
          className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl" title="Templates">
          <Zap className="h-4 w-4" />
        </Button>

        <Button onClick={() => setShowStats(!showStats)} size="icon" variant="outline"
          className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl hidden sm:flex" title="Estatísticas">
          <BarChart3 className="h-4 w-4" />
        </Button>

        <Input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder={quotedText ? "Pergunte sobre o trecho..." : isListening ? "Ouvindo..." : `Pergunte ao Mentor (${MENTOR_MODES[mode]?.label})...`}
          disabled={isLoading} className="text-sm h-9 sm:h-10 rounded-xl" />
        <Button onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()} size="icon" className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

export default MentorChat;
