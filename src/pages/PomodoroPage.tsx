import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Coffee, Brain, CheckCircle2, Volume2, VolumeX, TreePine, Waves, Wind, Flame } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useGamification } from "@/hooks/useGamification";
import { StudySession, EnemArea, ENEM_AREAS } from "@/types/study";
import { toast } from "sonner";

type PomodoroPhase = "focus" | "break" | "longBreak";

export default function PomodoroPage() {
  const [sessions, setSessions] = useLocalStorage<StudySession[]>('study-sessions', []);
  const [pomodoroWork] = useLocalStorage("pomodoro-work", "25");
  const [pomodoroBreak] = useLocalStorage("pomodoro-break", "5");
  const { addXP, stats } = useGamification();

  const workMinutes = Math.max(1, parseInt(pomodoroWork, 10) || 25);
  const breakMinutes = Math.max(1, parseInt(pomodoroBreak, 10) || 5);
  const longBreakMinutes = Math.max(1, breakMinutes * 3);

  const PHASE_CONFIG: Record<PomodoroPhase, { label: string; minutes: number; icon: typeof Brain }> = {
    focus: { label: "Foco", minutes: workMinutes, icon: Brain },
    break: { label: "Pausa", minutes: breakMinutes, icon: Coffee },
    longBreak: { label: "Pausa Longa", minutes: longBreakMinutes, icon: Coffee },
  };
  const [phase, setPhase] = useState<PomodoroPhase>("focus");
  const [secondsLeft, setSecondsLeft] = useState(PHASE_CONFIG.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [selectedArea, setSelectedArea] = useState<EnemArea>("linguagens");
  const [ambientSound, setAmbientSound] = useLocalStorage<string>('pomodoro-ambient', 'none');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ambientRef = useRef<OscillatorNode | null>(null);
  const ambientCtxRef = useRef<AudioContext | null>(null);

  // Create beep sound
  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioRef.current = null; // we'll use Web Audio API instead
    return () => { ctx.close(); };
  }, []);

  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      setTimeout(() => ctx.close(), 600);
    } catch {}
  }, []);

  const resetTimer = useCallback((newPhase: PomodoroPhase) => {
    setPhase(newPhase);
    setSecondsLeft(PHASE_CONFIG[newPhase].minutes * 60);
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const getLocalDateStr = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const onPhaseComplete = useCallback(() => {
    playBeep();
    if (phase === "focus") {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      const session: StudySession = {
        id: crypto.randomUUID(),
        area: selectedArea,
        duration: PHASE_CONFIG.focus.minutes,
        date: getLocalDateStr(new Date()),
        notes: `Pomodoro #${newCount}`,
      };
      setSessions(prev => [...prev, session]);
      addXP('pomodoro_done', `Pomodoro ${ENEM_AREAS[selectedArea].label}`);
      toast.success(`Pomodoro #${newCount} concluído! 🎉 +15 XP`, { description: `${PHASE_CONFIG.focus.minutes} min de ${ENEM_AREAS[selectedArea].label}` });
      const nextPhase = newCount % 4 === 0 ? "longBreak" : "break";
      resetTimer(nextPhase);
    } else {
      toast.info("Pausa finalizada! Hora de focar 💪");
      resetTimer("focus");
    }
  }, [phase, completedPomodoros, selectedArea, playBeep, resetTimer, setSessions, addXP]);

  // Ambient sound generator (white noise variations)
  const startAmbientSound = useCallback((type: string) => {
    stopAmbientSound();
    if (type === 'none') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ambientCtxRef.current = ctx;
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Different noise colors
      if (type === 'rain') {
        // Brown noise (rain-like)
        let last = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (last + (0.02 * white)) / 1.02;
          last = data[i];
          data[i] *= 3.5;
        }
      } else if (type === 'wind') {
        // Pink noise (wind-like)
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179; b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520; b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522; b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
      } else if (type === 'fire') {
        // Crackling fire (random pops in brown noise)
        let last = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (last + (0.02 * white)) / 1.02;
          last = data[i];
          data[i] *= 3;
          if (Math.random() < 0.001) data[i] += (Math.random() - 0.5) * 0.3;
        }
      } else {
        // White noise (forest)
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0.08;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } catch (e) {
      console.warn('Ambient sound not available:', e);
    }
  }, []);

  const stopAmbientSound = useCallback(() => {
    if (ambientCtxRef.current) {
      ambientCtxRef.current.close().catch(() => {});
      ambientCtxRef.current = null;
    }
  }, []);

  // Start/stop ambient when running changes
  useEffect(() => {
    if (running && ambientSound !== 'none' && soundEnabled) startAmbientSound(ambientSound);
    else stopAmbientSound();
    return () => stopAmbientSound();
  }, [running, ambientSound, soundEnabled]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          setTimeout(onPhaseComplete, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, onPhaseComplete]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const total = PHASE_CONFIG[phase].minutes * 60;
  const progress = ((total - secondsLeft) / total) * 100;
  const PhaseIcon = PHASE_CONFIG[phase].icon;

  const todaySessions = sessions.filter(s => s.date === getLocalDateStr(new Date()));
  const todayMinutes = todaySessions.reduce((a, s) => a + s.duration, 0);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Timer Pomodoro</h1>
        <p className="text-sm text-muted-foreground">Sessões de foco com pausas programadas</p>
      </div>

      {/* Timer Card */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className={`p-2 text-center text-xs font-medium text-primary-foreground ${phase === "focus" ? "mentor-gradient" : "bg-ms-green"}`}>
          <PhaseIcon className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
          {PHASE_CONFIG[phase].label}
        </div>
        <CardContent className="p-8 flex flex-col items-center gap-6">
          {/* Circular progress */}
          <div className="relative w-52 h-52">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={phase === "focus" ? "hsl(var(--primary))" : "hsl(var(--ms-green))"}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold tabular-nums tracking-tight">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
              <span className="text-xs text-muted-foreground mt-1">{PHASE_CONFIG[phase].label}</span>
            </div>
          </div>

          {/* Area selector */}
          {phase === "focus" && !running && (
            <Select value={selectedArea} onValueChange={v => setSelectedArea(v as EnemArea)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ENEM_AREAS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
           )}

          {/* Ambient sounds */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-[10px] text-muted-foreground">Sons ambiente:</span>
            {[
              { id: 'none', label: 'Nenhum', icon: VolumeX },
              { id: 'rain', label: 'Chuva', icon: Waves },
              { id: 'wind', label: 'Vento', icon: Wind },
              { id: 'forest', label: 'Floresta', icon: TreePine },
              { id: 'fire', label: 'Lareira', icon: Flame },
            ].map(s => (
              <Button
                key={s.id}
                size="sm"
                variant={ambientSound === s.id ? "default" : "outline"}
                className="h-7 text-[10px] gap-1 px-2"
                onClick={() => setAmbientSound(s.id)}
              >
                <s.icon className="h-3 w-3" /> {s.label}
              </Button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              variant={running ? "secondary" : "default"}
              onClick={() => setRunning(!running)}
              className="gap-2 min-w-[140px]"
            >
              {running ? <><Pause className="h-4 w-4" /> Pausar</> : <><Play className="h-4 w-4" /> {secondsLeft < total ? "Continuar" : "Iniciar"}</>}
            </Button>
            <Button size="lg" variant="outline" onClick={() => resetTimer(phase)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setSoundEnabled(!soundEnabled)} className="h-10 w-10">
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{completedPomodoros}</p>
            <p className="text-[11px] text-muted-foreground">Pomodoros Hoje</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-ms-green">{todayMinutes}min</p>
            <p className="text-[11px] text-muted-foreground">Tempo Total</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4].map(i => (
                <CheckCircle2 key={i} className={`h-5 w-5 ${i <= (completedPomodoros % 4 || (completedPomodoros > 0 ? 4 : 0)) ? 'text-primary' : 'text-muted'}`} />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Ciclo (4 = pausa longa)</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's sessions */}
      {todaySessions.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-2">Sessões de Hoje</h3>
            <div className="space-y-1.5">
              {todaySessions.slice(-5).reverse().map(s => (
                <div key={s.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{ENEM_AREAS[s.area].label}</span>
                  <span className="font-medium">{s.duration} min</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
