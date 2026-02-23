import { useLocalStorage } from './useLocalStorage';
import { useMemo, useCallback } from 'react';

export interface XPEvent {
  id: string;
  type: 'topic_complete' | 'simulado_done' | 'simulado_perfect' | 'flashcard_mastered' | 'pomodoro_done' | 'streak_bonus' | 'room_complete' | 'note_created' | 'daily_login' | 'challenge_done';
  xp: number;
  label: string;
  date: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: GamificationStats) => boolean;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'pomodoro' | 'flashcard' | 'simulado' | 'study';
  target: number;
  xpReward: number;
}

export interface GamificationStats {
  totalXP: number;
  level: number;
  topicsCompleted: number;
  simuladosDone: number;
  perfectSimulados: number;
  flashcardsMastered: number;
  pomodorosDone: number;
  studyStreak: number;
  roomsCompleted: number;
  notesCreated: number;
  dailyLogins: number;
  challengesDone: number;
}

const XP_VALUES = {
  topic_complete: 25,
  simulado_done: 50,
  simulado_perfect: 100,
  flashcard_mastered: 10,
  pomodoro_done: 15,
  streak_bonus: 30,
  room_complete: 200,
  note_created: 15,
  daily_login: 10,
  challenge_done: 75,
};

const LEVELS = [
  { level: 1, xp: 0, title: "Iniciante" },
  { level: 2, xp: 100, title: "Estudante" },
  { level: 3, xp: 300, title: "Dedicado" },
  { level: 4, xp: 600, title: "Focado" },
  { level: 5, xp: 1000, title: "Avançado" },
  { level: 6, xp: 1500, title: "Expert" },
  { level: 7, xp: 2200, title: "Mestre" },
  { level: 8, xp: 3000, title: "Sábio" },
  { level: 9, xp: 4000, title: "Lenda" },
  { level: 10, xp: 5500, title: "Gênio" },
  { level: 11, xp: 7500, title: "Iluminado" },
  { level: 12, xp: 10000, title: "Transcendente" },
  { level: 13, xp: 13000, title: "Oráculo" },
  { level: 14, xp: 17000, title: "Imortal" },
  { level: 15, xp: 22000, title: "Divino" },
];

const ALL_ACHIEVEMENTS: Achievement[] = [
  // Tópicos
  { id: 'first_topic', title: 'Primeiro Passo', description: 'Complete seu primeiro tópico', icon: '🎯', condition: s => s.topicsCompleted >= 1 },
  { id: 'topics_10', title: 'Estudioso', description: 'Complete 10 tópicos', icon: '📖', condition: s => s.topicsCompleted >= 10 },
  { id: 'topics_50', title: 'Devorador de Livros', description: 'Complete 50 tópicos', icon: '📚', condition: s => s.topicsCompleted >= 50 },
  { id: 'topics_100', title: 'Enciclopédia Viva', description: 'Complete 100 tópicos', icon: '🌟', condition: s => s.topicsCompleted >= 100 },
  // Simulados
  { id: 'first_simulado', title: 'Simuladeiro', description: 'Complete seu primeiro simulado', icon: '✍️', condition: s => s.simuladosDone >= 1 },
  { id: 'simulados_10', title: 'Veterano', description: 'Complete 10 simulados', icon: '🏅', condition: s => s.simuladosDone >= 10 },
  { id: 'simulados_25', title: 'Treinador', description: 'Complete 25 simulados', icon: '🎖️', condition: s => s.simuladosDone >= 25 },
  { id: 'perfect_score', title: 'Nota Máxima', description: 'Tire 100% em um simulado', icon: '💯', condition: s => s.perfectSimulados >= 1 },
  { id: 'perfect_5', title: 'Perfeição', description: '5 simulados com 100%', icon: '🏆', condition: s => s.perfectSimulados >= 5 },
  // Flashcards
  { id: 'flash_25', title: 'Memória Viva', description: 'Domine 25 flashcards', icon: '🧠', condition: s => s.flashcardsMastered >= 25 },
  { id: 'flash_100', title: 'Mestre da Memória', description: 'Domine 100 flashcards', icon: '🃏', condition: s => s.flashcardsMastered >= 100 },
  { id: 'flash_250', title: 'Elefante', description: 'Domine 250 flashcards', icon: '🐘', condition: s => s.flashcardsMastered >= 250 },
  // Pomodoro
  { id: 'pomodoro_10', title: 'Focado', description: 'Complete 10 pomodoros', icon: '🍅', condition: s => s.pomodorosDone >= 10 },
  { id: 'pomodoro_50', title: 'Concentrado', description: 'Complete 50 pomodoros', icon: '🔥', condition: s => s.pomodorosDone >= 50 },
  { id: 'pomodoro_100', title: 'Zen Master', description: 'Complete 100 pomodoros', icon: '🧘', condition: s => s.pomodorosDone >= 100 },
  // Streak
  { id: 'streak_3', title: 'Consistente', description: '3 dias seguidos de estudo', icon: '🔥', condition: s => s.studyStreak >= 3 },
  { id: 'streak_7', title: 'Imbatível', description: '7 dias seguidos de estudo', icon: '⚡', condition: s => s.studyStreak >= 7 },
  { id: 'streak_14', title: 'Inabalável', description: '14 dias seguidos', icon: '💪', condition: s => s.studyStreak >= 14 },
  { id: 'streak_30', title: 'Máquina', description: '30 dias seguidos!', icon: '🤖', condition: s => s.studyStreak >= 30 },
  // Salas
  { id: 'room_complete', title: 'Sala Dominada', description: 'Complete uma sala', icon: '🏆', condition: s => s.roomsCompleted >= 1 },
  { id: 'rooms_5', title: 'Explorador', description: 'Complete 5 salas', icon: '🗺️', condition: s => s.roomsCompleted >= 5 },
  // Level
  { id: 'level_5', title: 'Nível Avançado', description: 'Alcance o nível 5', icon: '⭐', condition: s => s.level >= 5 },
  { id: 'level_10', title: 'Gênio', description: 'Alcance o nível 10', icon: '👑', condition: s => s.level >= 10 },
  { id: 'level_15', title: 'Divindade', description: 'Alcance o nível 15', icon: '✨', condition: s => s.level >= 15 },
  // XP
  { id: 'xp_1000', title: 'Milhar de XP', description: 'Acumule 1000 XP', icon: '💎', condition: s => s.totalXP >= 1000 },
  { id: 'xp_5000', title: '5K Club', description: 'Acumule 5000 XP', icon: '💰', condition: s => s.totalXP >= 5000 },
  { id: 'xp_10000', title: '10K Legend', description: 'Acumule 10000 XP', icon: '🌈', condition: s => s.totalXP >= 10000 },
  // Notes
  { id: 'notes_10', title: 'Anotador', description: 'Crie 10 notas', icon: '📝', condition: s => s.notesCreated >= 10 },
  { id: 'notes_50', title: 'Escritor', description: 'Crie 50 notas', icon: '✏️', condition: s => s.notesCreated >= 50 },
  // Challenges
  { id: 'challenge_1', title: 'Desafiado', description: 'Complete 1 desafio diário', icon: '🎲', condition: s => s.challengesDone >= 1 },
  { id: 'challenge_10', title: 'Competitivo', description: 'Complete 10 desafios', icon: '🏁', condition: s => s.challengesDone >= 10 },
];

// Daily challenges pool
const DAILY_CHALLENGES: DailyChallenge[] = [
  { id: 'dc-pomo-3', title: '3 Pomodoros', description: 'Complete 3 sessões de Pomodoro hoje', icon: '🍅', type: 'pomodoro', target: 3, xpReward: 75 },
  { id: 'dc-pomo-5', title: '5 Pomodoros', description: 'Complete 5 sessões de Pomodoro hoje', icon: '🔥', type: 'pomodoro', target: 5, xpReward: 120 },
  { id: 'dc-flash-10', title: 'Revisar 10 cards', description: 'Revise 10 flashcards hoje', icon: '🃏', type: 'flashcard', target: 10, xpReward: 60 },
  { id: 'dc-flash-20', title: 'Maratona de Cards', description: 'Revise 20 flashcards hoje', icon: '🧠', type: 'flashcard', target: 20, xpReward: 100 },
  { id: 'dc-sim-1', title: 'Simulado do Dia', description: 'Complete 1 simulado hoje', icon: '📝', type: 'simulado', target: 1, xpReward: 80 },
  { id: 'dc-sim-2', title: 'Duplo Simulado', description: 'Complete 2 simulados hoje', icon: '✍️', type: 'simulado', target: 2, xpReward: 130 },
  { id: 'dc-study-60', title: '1 Hora de Foco', description: 'Estude pelo menos 60 minutos hoje', icon: '⏰', type: 'study', target: 60, xpReward: 90 },
  { id: 'dc-study-120', title: 'Maratona 2h', description: 'Estude pelo menos 2 horas hoje', icon: '🏃', type: 'study', target: 120, xpReward: 150 },
];

export function getTodayChallenges(): DailyChallenge[] {
  // Deterministic based on date — pick 2-3 challenges per day
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const shuffled = [...DAILY_CHALLENGES].sort((a, b) => {
    const ha = ((seed * 31 + a.id.charCodeAt(3)) % 997);
    const hb = ((seed * 31 + b.id.charCodeAt(3)) % 997);
    return ha - hb;
  });
  return shuffled.slice(0, 3);
}

export function useGamification() {
  const [xpEvents, setXpEvents] = useLocalStorage<XPEvent[]>('gamification-xp', []);
  const [completedTopics, setCompletedTopics] = useLocalStorage<Record<string, string[]>>('room-completed-topics', {});

  const stats = useMemo<GamificationStats>(() => {
    const totalXP = xpEvents.reduce((sum, e) => sum + e.xp, 0);
    const level = [...LEVELS].reverse().find(l => totalXP >= l.xp)?.level || 1;
    return {
      totalXP,
      level,
      topicsCompleted: xpEvents.filter(e => e.type === 'topic_complete').length,
      simuladosDone: xpEvents.filter(e => e.type === 'simulado_done').length,
      perfectSimulados: xpEvents.filter(e => e.type === 'simulado_perfect').length,
      flashcardsMastered: xpEvents.filter(e => e.type === 'flashcard_mastered').length,
      pomodorosDone: xpEvents.filter(e => e.type === 'pomodoro_done').length,
      studyStreak: calculateStreak(xpEvents),
      roomsCompleted: xpEvents.filter(e => e.type === 'room_complete').length,
      notesCreated: xpEvents.filter(e => e.type === 'note_created').length,
      dailyLogins: new Set(xpEvents.map(e => e.date.slice(0, 10))).size,
      challengesDone: xpEvents.filter(e => e.type === 'challenge_done').length,
    };
  }, [xpEvents]);

  const currentLevel = LEVELS.find(l => l.level === stats.level) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === stats.level + 1);
  const xpProgress = nextLevel ? ((stats.totalXP - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100 : 100;

  const unlockedAchievements = useMemo(() =>
    ALL_ACHIEVEMENTS.filter(a => a.condition(stats)), [stats]);

  const addXP = useCallback((type: XPEvent['type'], label: string) => {
    const event: XPEvent = {
      id: crypto.randomUUID(),
      type,
      xp: XP_VALUES[type],
      label,
      date: new Date().toISOString(),
    };
    setXpEvents(prev => [event, ...prev]);
    return event.xp;
  }, [setXpEvents]);

  const markTopicComplete = useCallback((roomId: string, topic: string, totalTopics: number) => {
    setCompletedTopics(prev => {
      const current = prev[roomId] || [];
      if (current.includes(topic)) return prev;
      const updated = [...current, topic];
      return { ...prev, [roomId]: updated };
    });

    const current = completedTopics[roomId] || [];
    if (current.includes(topic)) return 0;

    let xp = addXP('topic_complete', topic);

    const updatedCount = current.length + 1;
    if (updatedCount >= totalTopics && totalTopics > 0) {
      xp += addXP('room_complete', `Sala completa!`);
    }
    return xp;
  }, [addXP, completedTopics, setCompletedTopics]);

  const isTopicComplete = useCallback((roomId: string, topic: string) => {
    return (completedTopics[roomId] || []).includes(topic);
  }, [completedTopics]);

  const getRoomProgress = useCallback((roomId: string, totalTopics: number) => {
    const done = (completedTopics[roomId] || []).length;
    return { done, total: totalTopics, percent: totalTopics > 0 ? Math.round((done / totalTopics) * 100) : 0 };
  }, [completedTopics]);

  // Today's XP
  const todayXP = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return xpEvents.filter(e => e.date.slice(0, 10) === today).reduce((sum, e) => sum + e.xp, 0);
  }, [xpEvents]);

  // Today's activity counts for challenges
  const todayActivity = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayEvents = xpEvents.filter(e => e.date.slice(0, 10) === today);
    return {
      pomodoros: todayEvents.filter(e => e.type === 'pomodoro_done').length,
      flashcards: todayEvents.filter(e => e.type === 'flashcard_mastered').length,
      simulados: todayEvents.filter(e => e.type === 'simulado_done').length,
      studyMinutes: todayEvents.filter(e => e.type === 'pomodoro_done').length * 25,
    };
  }, [xpEvents]);

  return {
    stats,
    currentLevel,
    nextLevel,
    xpProgress,
    unlockedAchievements,
    allAchievements: ALL_ACHIEVEMENTS,
    addXP,
    markTopicComplete,
    isTopicComplete,
    getRoomProgress,
    xpEvents,
    completedTopics,
    todayXP,
    todayActivity,
  };
}

function calculateStreak(events: XPEvent[]): number {
  if (events.length === 0) return 0;
  const days = new Set(events.map(e => e.date.slice(0, 10)));
  const sortedDays = [...days].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  if (sortedDays[0] !== today) return 0;
  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (Math.round(diff) === 1) streak++;
    else break;
  }
  return streak;
}
