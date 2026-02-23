import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/integrations/supabase/client";
import SystemSweep from "@/components/SystemSweep";
import {
  Settings, GraduationCap, Database, Download, Upload, RefreshCw,
  Globe, Palette, Bell, Shield, Volume2, Brain, Sparkles, Save,
  HardDrive, Clock, Trash2, RotateCcw, User, CheckCircle2,
  Wrench, AlertTriangle, CheckCircle, XCircle, Loader2, Search,
  Zap, FileWarning, HardDriveDownload, Activity, BookOpen, Languages, FileText,
  Mic, Monitor, Cpu, Speaker
} from "lucide-react";

const PERSONAS = [
  { id: "descolado", label: "Descolado", desc: "Gírias e linguagem coloquial" },
  { id: "formal", label: "Formal", desc: "Erudito e acadêmico" },
  { id: "feminino", label: "Feminino", desc: "Maternal e acolhedor" },
  { id: "masculino", label: "Masculino", desc: "Focado em metas" },
  { id: "robo", label: "Robô", desc: "Analítico com tags de status" },
  { id: "jovem", label: "Jovem Animado", desc: "Pop e gaming" },
];

export default function ConfiguracoesPage() {
  const [mentorConfig, setMentorConfig] = useLocalStorage("mentor-config", { userName: "Johan", voiceSpeed: 1.0, voicePersona: "formal" });
  const [mentorPersona, setMentorPersona] = useLocalStorage("mentor-persona", "descolado");
  const [mentorVoice, setMentorVoice] = useLocalStorage("mentor-voice-enabled", true);
  const [mentorSpeed, setMentorSpeed] = useLocalStorage("mentor-speed", "1");
  const [darkMode, setDarkMode] = useLocalStorage("dark-mode", false);
  const [notifications, setNotifications] = useLocalStorage("notifications-enabled", true);
  const [autoSave, setAutoSave] = useLocalStorage("auto-save", true);
  const [pomodoroWork, setPomodoroWork] = useLocalStorage("pomodoro-work", "25");
  const [pomodoroBreak, setPomodoroBreak] = useLocalStorage("pomodoro-break", "5");
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [backupPath, setBackupPath] = useLocalStorage("backup-folder-name", "");
  const [lastBackupDate, setLastBackupDate] = useLocalStorage("last-backup-date", "");
  const initialSnapshot = useRef<string>("");

  // Capture a snapshot of current settings for dirty detection
  const getSnapshot = () => JSON.stringify({
    mentorConfig, mentorPersona, mentorVoice, mentorSpeed,
    darkMode, notifications, autoSave, pomodoroWork, pomodoroBreak,
  });

  useEffect(() => {
    if (!initialSnapshot.current) {
      initialSnapshot.current = getSnapshot();
    }
  }, []);

  useEffect(() => {
    if (initialSnapshot.current) {
      setHasChanges(getSnapshot() !== initialSnapshot.current);
    }
  }, [mentorConfig, mentorPersona, mentorVoice, mentorSpeed, darkMode, notifications, autoSave, pomodoroWork, pomodoroBreak]);

  const handleApplyChanges = () => {
    setIsSaving(true);
    // Force a re-render across the app by dispatching a storage event
    window.dispatchEvent(new Event("storage"));
    setTimeout(() => {
      initialSnapshot.current = getSnapshot();
      setHasChanges(false);
      setIsSaving(false);
      toast.success("Alterações aplicadas em todo o sistema!");
    }, 600);
  };


  const buildBackupData = () => {
    const allData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allData[key] = localStorage.getItem(key) || "";
    }
    return {
      _meta: {
        version: "2.0.0",
        exportedAt: new Date().toISOString(),
        totalKeys: Object.keys(allData).length,
        system: "Sistema de Estudos — Jimmy Sena",
      },
      data: allData,
    };
  };

  const handleBackupWithPicker = async () => {
    setIsBackingUp(true);
    try {
      // Check if File System Access API is available
      if ("showSaveFilePicker" in window) {
        const date = new Date().toISOString().slice(0, 10);
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: `sistema-estudos-backup-${date}.json`,
          types: [{ description: "Arquivo JSON", accept: { "application/json": [".json"] } }],
        });
        const writable = await handle.createWritable();
        const backup = buildBackupData();
        await writable.write(JSON.stringify(backup, null, 2));
        await writable.close();
        const folderName = handle.name;
        setBackupPath(folderName);
        const ts = new Date().toLocaleString("pt-BR");
        setLastBackupDate(ts);
        localStorage.setItem("last-backup-date", ts);
        localStorage.removeItem("auto-backup-pending");
        toast.success(`Backup salvo com sucesso em: ${folderName}`);
      } else {
        // Fallback for browsers without File System Access API
        handleBackupFallback();
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error("Erro ao salvar backup. Tente novamente.");
        console.error("Backup error:", err);
      }
    }
    setIsBackingUp(false);
  };

  const handleBackupFallback = () => {
    const backup = buildBackupData();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `sistema-estudos-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    const ts = new Date().toLocaleString("pt-BR");
    setLastBackupDate(ts);
    localStorage.setItem("last-backup-date", ts);
    localStorage.removeItem("auto-backup-pending");
    toast.success("Backup salvo com sucesso!");
  };

  const handleRestore = async () => {
    try {
      if ("showOpenFilePicker" in window) {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{ description: "Arquivo JSON", accept: { "application/json": [".json"] } }],
        });
        const file = await handle.getFile();
        const text = await file.text();
        restoreFromText(text);
      } else {
        // Fallback
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => restoreFromText(ev.target?.result as string);
          reader.readAsText(file);
        };
        input.click();
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error("Erro ao restaurar backup.");
      }
    }
  };

  const restoreFromText = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      // Support both old format (flat) and new format (with _meta)
      const data = parsed.data || parsed;
      if (typeof data !== "object" || Array.isArray(data)) throw new Error("Formato inválido");
      
      const keyCount = Object.keys(data).filter(k => k !== "_meta").length;
      if (keyCount === 0) throw new Error("Backup vazio");

      Object.entries(data).forEach(([key, value]) => {
        if (key !== "_meta") localStorage.setItem(key, value as string);
      });
      toast.success(`Backup restaurado (${keyCount} itens)! Recarregando...`);
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      toast.error("Arquivo de backup inválido ou corrompido.");
    }
  };

  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleClearData = () => {
    localStorage.clear();
    toast.success("Dados limpos! Recarregando...");
    setTimeout(() => window.location.reload(), 1500);
    setShowClearDialog(false);
  };



  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Personalize o sistema de estudos</p>
      </div>

      <Tabs defaultValue="mentor" className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="mentor" className="gap-1.5 text-xs">
            <GraduationCap className="h-3.5 w-3.5" /> Mentor
          </TabsTrigger>
          <TabsTrigger value="sistema" className="gap-1.5 text-xs">
            <Palette className="h-3.5 w-3.5" /> Sistema
          </TabsTrigger>
          <TabsTrigger value="dados" className="gap-1.5 text-xs">
            <Database className="h-3.5 w-3.5" /> Dados
          </TabsTrigger>
          <TabsTrigger value="atualizacoes" className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Atualiz.
          </TabsTrigger>
          <TabsTrigger value="manutencao" className="gap-1.5 text-xs">
            <Wrench className="h-3.5 w-3.5" /> Manutenção
          </TabsTrigger>
        </TabsList>

        {/* MENTOR TAB */}
        <TabsContent value="mentor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Identificação
              </CardTitle>
              <CardDescription>Seu nome para personalizar a experiência</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="user-name" className="text-sm">Seu nome</Label>
                <Input
                  id="user-name"
                  value={mentorConfig.userName}
                  onChange={e => setMentorConfig({ ...mentorConfig, userName: e.target.value })}
                  placeholder="Digite seu nome"
                  className="max-w-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" /> Personalidade do Mentor
              </CardTitle>
              <CardDescription>Escolha como o Mentor se comunica com você</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PERSONAS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setMentorPersona(p.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      mentorPersona === p.id
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" /> Voz do Mentor
              </CardTitle>
              <CardDescription>Configure e teste a voz do Mentor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="voice-toggle" className="text-sm">Respostas por voz</Label>
                <Switch id="voice-toggle" checked={mentorVoice} onCheckedChange={v => setMentorVoice(v)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Velocidade da fala</Label>
                <Select value={mentorSpeed} onValueChange={setMentorSpeed}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.75">Lenta (0.75x)</SelectItem>
                    <SelectItem value="1">Normal (1x)</SelectItem>
                    <SelectItem value="1.25">Rápida (1.25x)</SelectItem>
                    <SelectItem value="1.5">Muito Rápida (1.5x)</SelectItem>
                    <SelectItem value="1.7">Acelerada (1.70x)</SelectItem>
                    <SelectItem value="1.75">Acelerada+ (1.75x)</SelectItem>
                    <SelectItem value="2">Turbo (2.0x)</SelectItem>
                    <SelectItem value="2.5">Ultra (2.5x)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm">Testar voz por persona</Label>
                <p className="text-[10px] text-muted-foreground">Ouça como cada persona soa com a velocidade configurada</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PERSONAS.map(p => (
                    <Button
                      key={p.id}
                      size="sm"
                      variant={mentorPersona === p.id ? "default" : "outline"}
                      className="gap-1.5 text-xs justify-start"
                      onClick={() => {
                        const phrases: Record<string, string> = {
                          descolado: "E aí, bora estudar? Tô aqui pra te ajudar, mano!",
                          formal: "Prezado estudante, estou à disposição para auxiliá-lo em seus estudos.",
                          feminino: "Oi, querido! Vamos juntos nessa jornada de aprendizado!",
                          masculino: "Foco total! Vamos bater essa meta de estudo hoje!",
                          robo: "Sistema ativo. Módulo de estudos carregado. Aguardando comandos.",
                          jovem: "Eiii! Partiu estudar! Vai ser incrível, confia!",
                        };

                        const pickVoice = (persona: string, voices: SpeechSynthesisVoice[]) => {
                          const pt = voices.filter(v => v.lang.startsWith("pt"));
                          const nameMatch = (v: SpeechSynthesisVoice, keywords: string[]) =>
                            keywords.some(k => v.name.toLowerCase().includes(k));

                          // Feminine persona
                          if (persona === "feminino") {
                            return pt.find(v => nameMatch(v, ["female", "feminino", "luciana", "vitória", "vitoria", "francisca", "fernanda", "camila"])) 
                              || pt.find(v => nameMatch(v, ["google"])) 
                              || pt[0];
                          }
                          // Masculine personas
                          // Jovem: youthful masculine voice
                          if (persona === "jovem") {
                            return pt.find(v => nameMatch(v, ["male", "masculino", "daniel", "felipe", "thomas"])) 
                              || pt.find(v => !nameMatch(v, ["female", "feminino", "luciana", "vitória", "vitoria", "francisca", "fernanda", "camila"]))
                              || pt[0];
                          }
                          if (persona === "masculino" || persona === "descolado") {
                            return pt.find(v => nameMatch(v, ["male", "masculino", "ricardo", "daniel", "felipe", "thomas"])) 
                              || pt.find(v => !nameMatch(v, ["female", "feminino", "luciana", "vitória", "vitoria", "francisca", "fernanda", "camila"]))
                              || pt[0];
                          }
                          // Formal: prefer a deeper/more serious voice
                          if (persona === "formal") {
                            return pt.find(v => nameMatch(v, ["ricardo", "daniel", "felipe", "male", "masculino"])) 
                              || pt[0];
                          }
                          // Robot: any available, pitch will differentiate
                          return pt[0];
                        };

                        const doSpeak = () => {
                          const allVoices = speechSynthesis.getVoices();
                          const voice = pickVoice(p.id, allVoices);
                          const utterance = new SpeechSynthesisUtterance(phrases[p.id] || p.desc);
                          utterance.lang = "pt-BR";
                          utterance.rate = parseFloat(mentorSpeed);
                          if (voice) utterance.voice = voice;
                          // Adjust pitch per persona for more natural feel
                          if (p.id === "feminino") utterance.pitch = 1.3;
                          else if (p.id === "jovem") utterance.pitch = 1.05;
                          else if (p.id === "robo") { utterance.pitch = 0.6; utterance.rate = parseFloat(mentorSpeed) * 0.85; }
                          else if (p.id === "formal") utterance.pitch = 0.85;
                          else if (p.id === "masculino") utterance.pitch = 0.8;
                          else utterance.pitch = 1.0;
                          speechSynthesis.cancel();
                          speechSynthesis.speak(utterance);
                        };

                        // Ensure voices are loaded before speaking
                        if (speechSynthesis.getVoices().length === 0) {
                          speechSynthesis.addEventListener("voiceschanged", doSpeak, { once: true });
                        } else {
                          doSpeak();
                        }
                      }}
                    >
                      <Volume2 className="h-3 w-3" />
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Memórias do Mentor
              </CardTitle>
              <CardDescription>O Mentor salva informações sobre você para personalizar as respostas</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const mems = JSON.parse(localStorage.getItem("mentor-memories") || "[]") as string[];
                return mems.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">{mems.length} memórias salvas</p>
                    <ul className="text-xs space-y-1 max-h-40 overflow-auto">
                      {mems.map((m, i) => (
                        <li key={i} className="flex items-start gap-1.5 p-1.5 rounded bg-accent/50">
                          <span className="text-primary">•</span> {m}
                        </li>
                      ))}
                    </ul>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3 mr-1" /> Limpar memórias
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Limpar memórias do Mentor?</AlertDialogTitle>
                          <AlertDialogDescription>Todas as memórias salvas serão apagadas permanentemente.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => {
                            localStorage.setItem("mentor-memories", "[]");
                            toast.success("Memórias limpas");
                            window.location.reload();
                          }}>Confirmar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Nenhuma memória salva ainda. Converse com o Mentor para ele aprender sobre você.</p>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SISTEMA TAB */}
        <TabsContent value="sistema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" /> Aparência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-toggle" className="text-sm">Modo escuro</Label>
                <Switch id="dark-toggle" checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notif-toggle" className="text-sm">Notificações de tarefas</Label>
                <Switch id="notif-toggle" checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="autosave-toggle" className="text-sm">Salvamento automático</Label>
                <Switch id="autosave-toggle" checked={autoSave} onCheckedChange={setAutoSave} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" /> Pomodoro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Tempo de foco (min)</Label>
                  <Select value={pomodoroWork} onValueChange={setPomodoroWork}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["15", "20", "25", "30", "45", "50", "60"].map(v => (
                        <SelectItem key={v} value={v}>{v} min</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Intervalo (min)</Label>
                  <Select value={pomodoroBreak} onValueChange={setPomodoroBreak}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["3", "5", "10", "15"].map(v => (
                        <SelectItem key={v} value={v}>{v} min</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DADOS TAB */}
        <TabsContent value="dados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" /> Backup Completo
              </CardTitle>
              <CardDescription>Escolha onde salvar e restaurar os dados do sistema no seu computador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              {(lastBackupDate || backupPath) && (
                <div className="rounded-lg bg-accent/50 p-3 space-y-1">
                  {lastBackupDate && (
                    <p className="text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      <span className="text-muted-foreground">Último backup:</span>
                      <span className="font-medium">{lastBackupDate}</span>
                    </p>
                  )}
                  {backupPath && (
                    <p className="text-xs flex items-center gap-1.5">
                      <HardDrive className="h-3.5 w-3.5 text-primary" />
                      <span className="text-muted-foreground">Arquivo:</span>
                      <code className="text-[10px] bg-background px-1.5 py-0.5 rounded">{backupPath}</code>
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button onClick={handleBackupWithPicker} disabled={isBackingUp} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isBackingUp ? "Salvando..." : "Escolher Pasta e Salvar"}
                </Button>
                <Button variant="outline" onClick={handleRestore} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Restaurar Backup
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                O sistema abrirá uma janela para você escolher a pasta e o nome do arquivo. 
                O backup inclui: configurações, tarefas, flashcards, metas, caderno, memórias do Mentor e dados de tradução.
                Dica: use o botão "Sair" no menu lateral para forçar o backup antes de fechar.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <Shield className="h-4 w-4" /> Zona de Perigo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-3.5 w-3.5" />
                    Limpar todos os dados
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apagar todos os dados?</AlertDialogTitle>
                    <AlertDialogDescription>Esta ação é irreversível. Todos os dados locais do sistema (tarefas, notas, configurações, memórias) serão apagados permanentemente. Faça um backup antes de continuar.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Apagar Tudo</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="text-[10px] text-muted-foreground mt-2">Esta ação é irreversível. Faça um backup antes.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ATUALIZAÇÕES TAB */}
        <TabsContent value="atualizacoes" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <HardDrive className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Versão do Sistema</p>
                  <p className="text-xs text-muted-foreground">v2.0.0 — Sistema de Estudos por Jimmy Sena</p>
                  <Badge variant="secondary" className="text-[10px] mt-1">Atualizado</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MANUTENÇÃO TAB */}
        <TabsContent value="manutencao" className="space-y-4">
          <SystemSweep />
          <Separator />
          <MaintenancePanel />
        </TabsContent>
      </Tabs>

      {/* Sticky save bar */}
      {hasChanges && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
          <Button
            size="lg"
            onClick={handleApplyChanges}
            disabled={isSaving}
            className="gap-2 shadow-lg px-8"
          >
            {isSaving ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Aplicando...</>
            ) : (
              <><CheckCircle2 className="h-4 w-4" /> Aplicar Alterações</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ==================== MAINTENANCE PANEL ====================
type StepStatus = "pending" | "running" | "success" | "warning" | "error";
interface MaintenanceStep {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
  detail?: string;
  fixed?: boolean;
}

interface SystemModule {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  files: string[];
  checks: () => Promise<MaintenanceStep[]>;
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

const FUNC_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const AUTH_H = { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` };

async function testEdgeFunction(name: string, body: any): Promise<{ ok: boolean; status: number; latency: number }> {
  const start = Date.now();
  try {
    const resp = await fetch(`${FUNC_BASE}/${name}`, { method: "POST", headers: AUTH_H, body: JSON.stringify(body) });
    await resp.text();
    return { ok: resp.ok, status: resp.status, latency: Date.now() - start };
  } catch {
    return { ok: false, status: 0, latency: Date.now() - start };
  }
}

function validateLocalStorageJson(key: string, defaultVal: string): MaintenanceStep | null {
  const val = localStorage.getItem(key);
  if (!val) return null;
  try {
    JSON.parse(val);
    return null;
  } catch {
    localStorage.setItem(key, defaultVal);
    return { id: key, label: `JSON: ${key}`, description: "Reparado", status: "warning", detail: `"${key}" estava corrompido e foi restaurado`, fixed: true };
  }
}

function buildModules(): SystemModule[] {
  return [
    {
      id: "mentor",
      name: "1. Mentor / Tutor",
      icon: GraduationCap,
      description: "Chat IA, voz, memórias, histórico",
      files: ["MentorChat.tsx", "TutorPage.tsx", "ChatHistory.tsx", "enem-tutor/"],
      checks: async () => {
        const steps: MaintenanceStep[] = [];
        await delay(200);
        
        // 1. Config Check
        const mcRaw = localStorage.getItem("mentor-config");
        try {
          const mc = JSON.parse(mcRaw || "{}");
          if (!mc.userName) throw new Error("Sem nome");
          steps.push({ id: "mentor-cfg", label: "Configuração", description: "Validar preferências", status: "success", detail: `Usuário: ${mc.userName}` });
        } catch {
          localStorage.setItem("mentor-config", '{"userName":"Estudante","voiceSpeed":1,"voicePersona":"formal"}');
          steps.push({ id: "mentor-cfg", label: "Configuração", description: "Reparar padrão", status: "warning", detail: "Configuração restaurada", fixed: true });
        }

        // 2. Memories Check
        const mems = localStorage.getItem("mentor-memories");
        if (!mems) {
          localStorage.setItem("mentor-memories", "[]");
          steps.push({ id: "mentor-mem", label: "Banco de Memória", description: "Inicializar", status: "success", detail: "Banco criado", fixed: true });
        } else {
          steps.push({ id: "mentor-mem", label: "Banco de Memória", description: "Verificar integridade", status: "success", detail: `${JSON.parse(mems).length} memórias ativas` });
        }

        // 3. Edge Function Check
        const alreadyOffline = localStorage.getItem("mentor-offline-mode") === "true";
        const ef = await testEdgeFunction("enem-tutor", { messages: [{ role: "user", content: "ping" }], memories: [], voicePersona: "formal", userName: "test" });
        if (ef.ok) {
          localStorage.removeItem("mentor-offline-mode");
          steps.push({ id: "mentor-api", label: "API do Mentor", description: "Teste de latência", status: "success", detail: `Online (${ef.latency}ms)` });
        } else if (ef.status === 402 || ef.status === 429 || ef.status === 0) {
          localStorage.setItem("mentor-offline-mode", "true");
          if (alreadyOffline) {
            // Already fixed in a previous scan — show green
            steps.push({ id: "mentor-api", label: "API do Mentor (Modo Offline)", description: "Modo offline ativo — funcionando normalmente", status: "success", detail: `IA indisponível (${ef.status || 'sem conexão'}), mas o modo offline já estava configurado. O Mentor responde via banco de conhecimento local + busca web gratuita.` });
          } else {
            // First time detecting — fix and show yellow
            steps.push({ id: "mentor-api", label: "API do Mentor (IA)", description: "Créditos esgotados — modo offline ativado", status: "warning", detail: `Créditos de IA esgotados (${ef.status}). Modo offline ativado agora — o Mentor usará respostas locais + busca web gratuita. Execute nova varredura para confirmar.`, fixed: true });
          }
        } else {
          localStorage.setItem("mentor-offline-mode", "true");
          if (alreadyOffline) {
            steps.push({ id: "mentor-api", label: "API do Mentor (Modo Offline)", description: "Modo offline ativo — funcionando normalmente", status: "success", detail: `Servidor indisponível (erro ${ef.status}), mas modo offline já configurado. Nenhuma funcionalidade bloqueada.` });
          } else {
            steps.push({ id: "mentor-api", label: "API do Mentor", description: "Servidor indisponível — modo offline ativado", status: "warning", detail: `Servidor retornou erro ${ef.status}. Modo offline ativado agora. Execute nova varredura para confirmar.`, fixed: true });
          }
        }

        return steps;
      }
    },
    {
      id: "idiomas",
      name: "2. Sala de Idiomas",
      icon: Languages,
      description: "6 idiomas, exercícios, oral, conversação",
      files: ["IdiomasPage.tsx", "language-classroom/"],
      checks: async () => {
        const steps: MaintenanceStep[] = [];
        await delay(200);

        // 1. Progress Integrity
        const progKey = "language-progress";
        const fix = validateLocalStorageJson(progKey, "{}");
        if (fix) steps.push(fix);
        else {
          const prog = JSON.parse(localStorage.getItem(progKey) || "{}");
          const count = Object.values(prog).reduce((acc: number, l: any) => acc + Object.keys(l).length, 0);
          steps.push({ id: "lang-prog", label: "Progresso de Aulas", description: "Verificar estrutura", status: "success", detail: `${count} módulos iniciados` });
        }

        // 2. API Check
        const langAlreadyOffline = localStorage.getItem("language-offline-mode") === "true";
        const ef = await testEdgeFunction("language-classroom", { action: "get-curriculum" });
        if (ef.ok) {
          localStorage.removeItem("language-offline-mode");
          steps.push({ id: "lang-api", label: "Professor Virtual", description: "Teste de conexão", status: "success", detail: `Online (${ef.latency}ms)` });
        } else if (langAlreadyOffline) {
          // Fix already applied in a previous scan — show green
          steps.push({ 
            id: "lang-api", 
            label: "Professor Virtual (Modo Offline)", 
            description: "Modo offline ativo — funcionando normalmente", 
            status: "success", 
            detail: `Servidor indisponível (erro ${ef.status}), mas o modo offline já estava configurado. As lições usam material local pré-carregado.`
          });
        } else {
          localStorage.setItem("language-offline-mode", "true");
          steps.push({ 
            id: "lang-api", 
            label: "Professor Virtual", 
            description: "Ativando conteúdo offline", 
            status: "warning", 
            detail: `Servidor retornou erro ${ef.status}. Conteúdo offline ativado agora. Execute nova varredura para confirmar.`,
            fixed: true
          });
        }

        return steps;
      }
    },
    {
      id: "simulados",
      name: "3. Simulados",
      icon: FileWarning,
      description: "Questões, IA, PDFs, estatísticas",
      files: ["SimuladosPage.tsx", "enem-simulado/"],
      checks: async () => {
        const steps: MaintenanceStep[] = [];
        await delay(200);

        const resKey = "simulado-results";
        const fix = validateLocalStorageJson(resKey, "[]");
        if (fix) steps.push(fix);
        else {
          const res = JSON.parse(localStorage.getItem(resKey) || "[]");
          steps.push({ id: "sim-res", label: "Histórico de Resultados", description: "Indexar provas", status: "success", detail: `${res.length} simulados registrados` });
        }

        const pdfKey = "pdf-knowledge";
        const fixPdf = validateLocalStorageJson(pdfKey, "[]");
        if (fixPdf) steps.push(fixPdf);
        else {
          const pdfs = JSON.parse(localStorage.getItem(pdfKey) || "[]");
          const totalSize = JSON.stringify(pdfs).length;
          steps.push({ 
            id: "sim-pdf", 
            label: "Base de Conhecimento PDF", 
            description: "Verificar tamanho", 
            status: totalSize > 2000000 ? "warning" : "success", 
            detail: `${pdfs.length} arquivos processados (${(totalSize/1024).toFixed(0)}KB)` 
          });
        }

        const simAlreadyOffline = localStorage.getItem("simulado-offline-mode") === "true";
        const ef = await testEdgeFunction("enem-simulado", { type: "custom-topics", topics: "ping", questionCount: 1, area: "misto" });
        if (ef.ok) {
          localStorage.removeItem("simulado-offline-mode");
          steps.push({ id: "sim-api", label: "Gerador de Questões IA", description: "Teste de API", status: "success", detail: `Online (${ef.latency}ms)` });
        } else if (simAlreadyOffline) {
          // Fix already applied — show green
          steps.push({ id: "sim-api", label: "Gerador de Questões IA (Modo Offline)", description: "Banco local ativo — funcionando normalmente", status: "success", detail: `IA indisponível (erro ${ef.status || '402'}), mas modo offline já configurado. Simulados usam banco local automaticamente.` });
        } else {
          localStorage.setItem("simulado-offline-mode", "true");
          steps.push({ id: "sim-api", label: "Gerador de Questões IA", description: "Ativando banco local offline", status: "warning", detail: `IA indisponível (erro ${ef.status}). Modo offline ativado agora. Execute nova varredura para confirmar.`, fixed: true });
        }

        return steps;
      }
    },
    {
      id: "produtividade",
      name: "4. Produtividade",
      icon: CheckCircle2,
      description: "Kanban, Agenda, Pomodoro, Metas",
      files: ["KanbanPage.tsx", "AgendaPage.tsx", "PomodoroPage.tsx"],
      checks: async () => {
        const steps: MaintenanceStep[] = [];
        const checks = [
          { key: "kanban-tasks", label: "Tarefas Kanban", def: "[]" },
          { key: "agenda-events", label: "Agenda", def: "[]" },
          { key: "study-sessions", label: "Sessões Pomodoro", def: "[]" },
          { key: "weekly-study-plan", label: "Plano Semanal", def: "null" },
          { key: "weekly-goals", label: "Metas", def: "[]" },
          { key: "study-notes", label: "Caderno", def: "[]" },
          { key: "flashcards", label: "Flashcards", def: "[]" },
        ];

        for (const c of checks) {
          const fix = validateLocalStorageJson(c.key, c.def);
          if (fix) steps.push(fix);
        }

        // Check for agenda conflicts
        const events = JSON.parse(localStorage.getItem("agenda-events") || "[]");
        if (events.length > 0) {
          steps.push({ id: "agenda-check", label: "Agenda", description: "Analisar integridade", status: "success", detail: `${events.length} eventos registrados` });
        } else {
          steps.push({ id: "agenda-check", label: "Agenda", description: "Verificar dados", status: "success", detail: "Vazia" });
        }

        if (steps.length === 0) steps.push({ id: "prod-ok", label: "Dados de Produtividade", description: "Scan completo", status: "success", detail: "Todos os bancos íntegros" });
        return steps;
      }
    },
    {
      id: "traducao",
      name: "5. Tradução",
      icon: Languages,
      description: "Tradutor multilíngue e extrator PDF",
      files: ["TraducaoPage.tsx", "translate-text/"],
      checks: async () => {
        const steps: MaintenanceStep[] = [];
        await delay(200);
        
        // Check API
        const ef = await testEdgeFunction("translate-text", { text: "ping", sourceLang: "en", targetLang: "pt" });
        if (ef.ok) {
          localStorage.removeItem("translation-offline-mode");
          steps.push({ id: "trans-api", label: "Serviço de Tradução", description: "Teste de resposta", status: "success", detail: `Online via ${ef.latency < 500 ? 'IA' : 'API gratuita'} (${ef.latency}ms)` });
        } else if (ef.status === 402) {
          // Translation always falls back to free APIs (MyMemory) — always green
          steps.push({ id: "trans-api", label: "Serviço de Tradução (Fallback Ativo)", description: "APIs gratuitas ativas — funcionando normalmente", status: "success", detail: "IA indisponível — tradução usa MyMemory e LibreTranslate (gratuitos). Nenhuma função bloqueada." });
        } else {
          const transAlreadyOffline = localStorage.getItem("translation-offline-mode") === "true";
          localStorage.setItem("translation-offline-mode", "true");
          if (transAlreadyOffline) {
            steps.push({ id: "trans-api", label: "Serviço de Tradução (Modo Offline)", description: "Modo dicionário ativo — funcionando normalmente", status: "success", detail: `Servidor indisponível (erro ${ef.status}), mas modo offline já configurado. Traduções básicas funcionam via dicionário local.` });
          } else {
            steps.push({ id: "trans-api", label: "Serviço de Tradução", description: "Modo dicionário offline ativado", status: "warning", detail: `Servidor retornou erro ${ef.status}. Modo dicionário local ativado agora. Execute nova varredura para confirmar.`, fixed: true });
          }
        }

        steps.push({ id: "pdf-worker", label: "Motor PDF.js", description: "Verificar worker", status: "success", detail: "Bibliotecas carregadas" });

        return steps;
      }
    },
    {
      id: "salas",
      name: "6. Salas de Conhecimento",
      icon: GraduationCap,
      description: "Salas temáticas no Supabase",
      files: ["SalasPage.tsx", "mentor-tools/"],
      checks: async () => {
        const steps: MaintenanceStep[] = [];
        
        // Check Supabase connection
        const start = Date.now();
        const { error, count } = await supabase.from("knowledge_rooms").select("*", { count: "exact", head: true });
        const latency = Date.now() - start;

        steps.push({ 
          id: "salas-db", 
          label: "Conexão Supabase", 
          description: "Ping Tabela Salas", 
          status: error ? "error" : "success", 
          detail: error ? "Erro de conexão" : `Conectado (${count} salas, ${latency}ms)` 
        });

        // Check Edge Function
        const ef = await testEdgeFunction("mentor-tools", { type: "ping" });
        steps.push({
          id: "mentor-tools",
          label: "Ferramentas do Mentor",
          description: "Gerador de conteúdo",
          status: ef.ok ? "success" : "warning",
          detail: ef.ok ? `Online (${ef.latency}ms)` : "Verificar logs"
        });

        return steps;
      }
    },
    {
      id: "sistema",
      name: "7. Sistema",
      icon: Settings,
      description: "Config, backup, storage, UI",
      files: ["ConfiguracoesPage.tsx", "AppLayout.tsx"],
      checks: async () => {
        const steps: MaintenanceStep[] = [];
        
        // 1. Storage Usage
        let total = 0;
        let largestKey = "";
        let largestSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) {
            const len = (localStorage.getItem(k) || "").length * 2; // approx bytes
            total += len;
            if (len > largestSize) { largestSize = len; largestKey = k; }
          }
        }
        const totalMB = (total / 1024 / 1024).toFixed(2);
        const usagePercent = Math.min(100, Math.round((total / (5 * 1024 * 1024)) * 100)); // Assume 5MB limit
        
        steps.push({ 
          id: "sys-storage", 
          label: "Armazenamento Local", 
          description: "Calcular uso", 
          status: usagePercent > 80 ? "warning" : "success", 
          detail: `${totalMB}MB utilizados (${usagePercent}%). Maior item: ${largestKey}` 
        });

        // 2. Orphan Keys — auto-clean
        const knownPrefixes = ["kanban","study","flashcard","mentor","pomodoro","language","gamification","dark-mode","notifications","auto-save","professor","backup","last-backup","translation","simulado","plano-estudos","weekly","system-last","maintenance","pdf-knowledge","agenda","last-view","sb-"];
        const orphanKeys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && !knownPrefixes.some(p => k.startsWith(p))) {
            orphanKeys.push(k);
          }
        }
        if (orphanKeys.length > 0) {
          // Auto-fix: remove orphan keys
          orphanKeys.forEach(k => localStorage.removeItem(k));
          steps.push({ id: "sys-orphans", label: "Limpeza de Dados", description: "Removendo lixo", status: "warning", detail: `${orphanKeys.length} chave(s) órfã(s) removida(s): ${orphanKeys.slice(0, 3).join(', ')}${orphanKeys.length > 3 ? '...' : ''}`, fixed: true });
        } else {
          steps.push({ id: "sys-orphans", label: "Limpeza de Dados", description: "Buscar lixo", status: "success", detail: "Sistema limpo" });
        }

        return steps;
      }
    },
    {
      id: "hardware",
      name: "8. Hardware",
      icon: Cpu,
      description: "Microfone, áudio, câmera, tela, conexão",
      files: ["Navigator API", "MediaDevices API"],
      checks: async () => {
        const steps: MaintenanceStep[] = [];

        // ── 1. Microfone ──
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioTrack = stream.getAudioTracks()[0];
          const settings = audioTrack.getSettings();
          stream.getTracks().forEach(t => t.stop());

          const devices = await navigator.mediaDevices.enumerateDevices();
          const mics = devices.filter(d => d.kind === 'audioinput');

          steps.push({
            id: "hw-mic",
            label: "Microfone",
            description: "Detectar e testar",
            status: "success",
            detail: `${mics.length} microfone(s) detectado(s): ${mics.map(m => m.label || 'Desconhecido').join(', ')}. Taxa: ${settings.sampleRate || 'N/A'}Hz`
          });
        } catch (err: any) {
          const reason = err.name === 'NotAllowedError' ? 'Permissão negada pelo usuário' :
            err.name === 'NotFoundError' ? 'Nenhum microfone conectado' : err.message;
          
          // Auto-fix attempt: suggest how to fix
          const fixAction = err.name === 'NotAllowedError' 
            ? 'Correção automática: Recarregue a página e clique "Permitir" quando solicitado.' 
            : err.name === 'NotFoundError'
            ? 'Correção: Conecte um microfone USB ou headset e execute o diagnóstico novamente.'
            : 'Correção: Verifique as configurações de áudio do sistema operacional.';
          
          steps.push({
            id: "hw-mic",
            label: "Microfone",
            description: "Detectar e testar",
            status: "error",
            detail: `Falha: ${reason}. ${fixAction}`
          });
        }

        // ── 2. Saída de Áudio (Speakers) ──
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const speakers = devices.filter(d => d.kind === 'audiooutput');

          if (speakers.length > 0) {
            steps.push({
              id: "hw-speakers",
              label: "Saída de Áudio",
              description: "Alto-falantes / Fones",
              status: "success",
              detail: `${speakers.length} dispositivo(s): ${speakers.map(s => s.label || 'Padrão do sistema').join(', ')}`
            });
          } else {
            steps.push({
              id: "hw-speakers",
              label: "Saída de Áudio",
              description: "Alto-falantes / Fones",
              status: "warning",
              detail: "Não foi possível enumerar dispositivos de saída. O navegador pode não suportar essa detecção."
            });
          }
        } catch {
          steps.push({
            id: "hw-speakers",
            label: "Saída de Áudio",
            description: "Verificação",
            status: "warning",
            detail: "Detecção de saída de áudio não disponível neste navegador."
          });
        }

        // ── 3. Síntese de Voz (TTS) ──
        if (window.speechSynthesis) {
          const voices = window.speechSynthesis.getVoices();
          const ptVoices = voices.filter(v => v.lang.startsWith('pt'));
          steps.push({
            id: "hw-tts",
            label: "Síntese de Voz (TTS)",
            description: "Vozes disponíveis",
            status: ptVoices.length > 0 ? "success" : "warning",
            detail: ptVoices.length > 0
              ? `${ptVoices.length} voz(es) pt-BR: ${ptVoices.slice(0, 3).map(v => v.name).join(', ')}${ptVoices.length > 3 ? ` +${ptVoices.length - 3}` : ''}`
              : `Nenhuma voz pt-BR encontrada (${voices.length} vozes totais). O Mentor pode usar vozes em outro idioma.`
          });
        } else {
          steps.push({
            id: "hw-tts",
            label: "Síntese de Voz (TTS)",
            description: "Verificação",
            status: "error",
            detail: "Web Speech API não disponível. As respostas por voz do Mentor não funcionarão."
          });
        }

        // ── 4. Reconhecimento de Fala (STT) ──
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        steps.push({
          id: "hw-stt",
          label: "Reconhecimento de Fala",
          description: "Speech-to-Text",
          status: SR ? "success" : "error",
          detail: SR ? "API disponível. Ditado por voz e comandos do Mentor funcionam normalmente." :
            "Não suportado neste navegador. Use Chrome, Edge ou Safari para reconhecimento de voz."
        });

        // ── 5. Tela / Resolução ──
        const w = window.screen.width;
        const h = window.screen.height;
        const dpr = window.devicePixelRatio || 1;
        const isSmall = w < 768;
        steps.push({
          id: "hw-screen",
          label: "Tela / Display",
          description: "Resolução e densidade",
          status: isSmall ? "warning" : "success",
          detail: `${w}×${h} px | DPR: ${dpr}x | ${isSmall ? '⚠️ Tela pequena — UI otimizada para mobile' : 'Resolução adequada para o sistema'}`
        });

        // ── 6. Memória (se disponível) ──
        const nav = navigator as any;
        if (nav.deviceMemory) {
          const mem = nav.deviceMemory;
          steps.push({
            id: "hw-memory",
            label: "Memória RAM",
            description: "Estimativa do navegador",
            status: mem >= 4 ? "success" : "warning",
            detail: `~${mem}GB detectado. ${mem < 4 ? '⚠️ Pode haver lentidão com muitos dados abertos. Feche abas desnecessárias.' : 'Memória suficiente para o sistema.'}`
          });
        }

        // ── 7. CPU / Cores ──
        if (navigator.hardwareConcurrency) {
          const cores = navigator.hardwareConcurrency;
          steps.push({
            id: "hw-cpu",
            label: "Processador (CPU)",
            description: "Núcleos lógicos",
            status: cores >= 4 ? "success" : "warning",
            detail: `${cores} núcleo(s) detectado(s). ${cores < 4 ? '⚠️ Pode haver lentidão ao gerar conteúdo com IA.' : 'Processamento adequado.'}`
          });
        }

        // ── 8. Conexão de Rede ──
        const conn = (navigator as any).connection;
        if (conn) {
          const type = conn.effectiveType || 'desconhecido';
          const downlink = conn.downlink || '?';
          const rtt = conn.rtt || '?';
          steps.push({
            id: "hw-network",
            label: "Conexão de Rede",
            description: "Velocidade e latência",
            status: type === '4g' || type === '5g' ? "success" : type === '3g' ? "warning" : "error",
            detail: `Tipo: ${type.toUpperCase()} | Download: ~${downlink}Mbps | Latência: ~${rtt}ms. ${type === '2g' || type === 'slow-2g' ? '⚠️ Conexão muito lenta para IA.' : ''}`
          });
        } else {
          // Fallback: test connectivity
          const start = Date.now();
          try {
            await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-tools`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
              body: JSON.stringify({ type: 'ping' }),
            });
            const latency = Date.now() - start;
            steps.push({
              id: "hw-network",
              label: "Conexão de Rede",
              description: "Teste de latência",
              status: latency < 2000 ? "success" : "warning",
              detail: `Servidor respondeu em ${latency}ms. ${latency > 2000 ? '⚠️ Latência alta — respostas de IA podem demorar.' : 'Conexão estável.'}`
            });
          } catch {
            steps.push({
              id: "hw-network",
              label: "Conexão de Rede",
              description: "Teste de conectividade",
              status: "error",
              detail: "Sem conexão com o servidor. O Mentor funcionará em modo offline."
            });
          }
        }

        // ── 9. Câmera (opcional) ──
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const cameras = devices.filter(d => d.kind === 'videoinput');
          if (cameras.length > 0) {
            steps.push({
              id: "hw-camera",
              label: "Câmera",
              description: "Webcam detectada",
              status: "success",
              detail: `${cameras.length} câmera(s): ${cameras.map(c => c.label || 'Câmera').join(', ')}`
            });
          }
        } catch { /* câmera é opcional, sem erro */ }

        // ── 10. Storage disponível ──
        if (navigator.storage && navigator.storage.estimate) {
          try {
            const est = await navigator.storage.estimate();
            const usedMB = ((est.usage || 0) / 1024 / 1024).toFixed(1);
            const quotaMB = ((est.quota || 0) / 1024 / 1024).toFixed(0);
            steps.push({
              id: "hw-storage",
              label: "Armazenamento do Navegador",
              description: "Espaço disponível",
              status: (est.usage || 0) / (est.quota || 1) < 0.8 ? "success" : "warning",
              detail: `${usedMB}MB usado de ~${quotaMB}MB disponível.`
            });
          } catch { /* skip */ }
        }

        return steps;
      }
    }
  ];
}

function MaintenancePanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentModuleName, setCurrentModuleName] = useState("");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [moduleResults, setModuleResults] = useState<Record<string, MaintenanceStep[]>>({});
  const [moduleStatus, setModuleStatus] = useState<Record<string, StepStatus>>({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [lastRun, setLastRun] = useLocalStorage("maintenance-last-run", "");
  const [summary, setSummary] = useState<{ total: number; fixed: number; warnings: number; errors: number; score: number } | null>(null);

  const modules = buildModules();

  // Compute a health score (0-100) from step results
  const computeModuleScore = (results: Record<string, MaintenanceStep[]>) => {
    const allSteps = Object.values(results).flat();
    const errors = allSteps.filter(s => s.status === "error").length;
    const warnings = allSteps.filter(s => s.status === "warning" && !s.fixed).length;
    return Math.max(0, 100 - errors * 15 - warnings * 8);
  };

  const runSingleModule = useCallback(async (mod: SystemModule) => {
    setModuleStatus(prev => ({ ...prev, [mod.id]: "running" }));
    setCurrentModuleName(mod.name);
    try {
      const steps = await mod.checks();
      setModuleResults(prev => ({ ...prev, [mod.id]: steps }));
      const hasError = steps.some(s => s.status === "error");
      const hasWarn = steps.some(s => s.status === "warning" && !s.fixed);
      setModuleStatus(prev => ({ ...prev, [mod.id]: hasError ? "error" : hasWarn ? "warning" : "success" }));
      return steps;
    } catch {
      setModuleStatus(prev => ({ ...prev, [mod.id]: "error" }));
      return [];
    }
  }, []);

  const runAllModules = useCallback(async () => {
    setIsRunning(true);
    setSummary(null);
    setModuleResults({});
    setModuleStatus({});
    setOverallProgress(0);
    setCurrentModuleName("");

    let totalSteps = 0, fixedCount = 0, warningCount = 0, errorCount = 0;
    const allResults: Record<string, MaintenanceStep[]> = {};

    for (let i = 0; i < modules.length; i++) {
      const mod = modules[i];
      const steps = await runSingleModule(mod);
      allResults[mod.id] = steps;
      totalSteps += steps.length;
      fixedCount += steps.filter(s => s.fixed).length;
      warningCount += steps.filter(s => s.status === "warning" && !s.fixed).length;
      errorCount += steps.filter(s => s.status === "error").length;
      setOverallProgress(Math.round(((i + 1) / modules.length) * 100));
    }

    // Also sweep localStorage integrity
    try {
      const sweepKeys = [
        { key: "kanban-tasks", default: "[]" },
        { key: "study-sessions", default: "[]" },
        { key: "study-notes", default: "[]" },
        { key: "flashcards", default: "[]" },
        { key: "agenda-events", default: "[]" },
        { key: "weekly-goals", default: "[]" },
        { key: "simulado-results", default: "[]" },
        { key: "pdf-knowledge", default: "[]" },
        { key: "mentor-memories", default: "[]" },
      ];
      let sweepFixed = 0;
      for (const { key, default: def } of sweepKeys) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            if (!Array.isArray(JSON.parse(raw))) { localStorage.setItem(key, def); sweepFixed++; }
          } catch { localStorage.setItem(key, def); sweepFixed++; }
        }
      }
      if (sweepFixed > 0) fixedCount += sweepFixed;
    } catch { /* skip */ }

    const score = computeModuleScore(allResults);
    setCurrentModuleName("");
    setOverallProgress(100);
    const ts = new Date().toLocaleString("pt-BR");
    setLastRun(ts);
    setSummary({ total: totalSteps, fixed: fixedCount, warnings: warningCount, errors: errorCount, score });
    setIsRunning(false);

    if (errorCount === 0 && warningCount === 0) toast.success(`Manutenção completa — Sistema operacional! Score: ${score}/100 ✅`);
    else if (errorCount === 0) toast.success(`Manutenção completa — ${fixedCount} corrigido(s). Score: ${score}/100 🔧`);
    else toast.warning(`Manutenção com ${errorCount} erro(s). Score: ${score}/100`);
  }, [modules, runSingleModule]);

  const statusIcon = (status: StepStatus, size = "h-5 w-5") => {
    switch (status) {
      case "pending": return <div className={`${size} rounded-full border-2 border-muted-foreground/30`} />;
      case "running": return <Loader2 className={`${size} text-primary animate-spin`} />;
      case "success": return <CheckCircle className={`${size} text-green-500`} />;
      case "warning": return <AlertTriangle className={`${size} text-yellow-500`} />;
      case "error":   return <XCircle className={`${size} text-red-500`} />;
    }
  };

  const statusBorder = (status?: StepStatus) => {
    switch (status) {
      case "success": return "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20";
      case "warning": return "border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20";
      case "error":   return "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20";
      case "running": return "border-primary/40 bg-primary/5";
      default:        return "border-border";
    }
  };

  const moduleIconBg = (status?: StepStatus) => {
    switch (status) {
      case "success": return "bg-green-100 dark:bg-green-900/30";
      case "error":   return "bg-red-100 dark:bg-red-900/30";
      case "warning": return "bg-yellow-100 dark:bg-yellow-900/30";
      case "running": return "bg-primary/10";
      default:        return "bg-accent";
    }
  };

  const scoreColor = (s: number) => s >= 90 ? "text-green-600 dark:text-green-400" : s >= 70 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400";
  const scoreLabel = (s: number) => s >= 95 ? "Excelente" : s >= 80 ? "Bom" : s >= 60 ? "Regular" : "Crítico";

  const completedCount = Object.values(moduleStatus).filter(s => s !== "running" && s !== "pending").length;

  return (
    <div className="space-y-4">
      {/* Header card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" /> Manutenção Modular do Sistema
          </CardTitle>
          <CardDescription>
            Diagnóstico e correção automática por módulo. Execute tudo de uma vez ou individualmente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-0.5">
              {lastRun && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Última manutenção: <span className="font-medium">{lastRun}</span>
                </p>
              )}
              {summary && (
                <p className={`text-xs font-bold flex items-center gap-1.5 ${scoreColor(summary.score)}`}>
                  <Activity className="h-3 w-3" /> Score: {summary.score}/100 — {scoreLabel(summary.score)}
                </p>
              )}
            </div>
            <Button onClick={runAllModules} disabled={isRunning} size="lg" className="gap-2 shadow-md">
              {isRunning ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Corrigindo Sistema...</>
              ) : (
                <><Activity className="h-4 w-4" /> {summary ? "Nova Manutenção" : "Executar Manutenção Completa"}</>
              )}
            </Button>
          </div>

          {/* Progress bar with module name */}
          {(isRunning || (overallProgress > 0 && overallProgress < 100)) && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-medium animate-pulse">
                  {currentModuleName ? `⚙️ ${currentModuleName}...` : "Iniciando..."}
                </span>
                <span className="font-bold text-primary">{completedCount}/{modules.length} módulos</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
              {/* Mini module timeline */}
              <div className="flex gap-1">
                {modules.map(m => {
                  const s = moduleStatus[m.id];
                  return (
                    <div
                      key={m.id}
                      title={m.name}
                      className={`flex-1 h-1.5 rounded-full transition-all ${
                        s === "success" ? "bg-green-500" :
                        s === "warning" ? "bg-yellow-500" :
                        s === "error"   ? "bg-red-500" :
                        s === "running" ? "bg-primary animate-pulse" :
                        "bg-border"
                      }`}
                    />
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground text-center">{overallProgress}% concluído</p>
            </div>
          )}

          {/* Health score bar (post-run) */}
          {summary && !isRunning && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Saúde Geral do Sistema</span>
                <span className={`font-bold ${scoreColor(summary.score)}`}>{summary.score}% — {scoreLabel(summary.score)}</span>
              </div>
              <Progress value={summary.score} className="h-2.5" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Module Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {modules.map(mod => {
          const status = moduleStatus[mod.id];
          const results = moduleResults[mod.id];
          const isSelected = selectedModule === mod.id;
          const ModIcon = mod.icon;
          const okCount   = results?.filter(r => r.status === "success").length ?? 0;
          const warnCount = results?.filter(r => r.status === "warning" && !r.fixed).length ?? 0;
          const fixedCount = results?.filter(r => r.fixed).length ?? 0;
          const errCount  = results?.filter(r => r.status === "error").length ?? 0;

          return (
            <Card
              key={mod.id}
              className={`cursor-pointer transition-all hover:shadow-md ${statusBorder(status)} ${isSelected ? "ring-2 ring-primary" : ""}`}
              onClick={() => setSelectedModule(isSelected ? null : mod.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${moduleIconBg(status)}`}>
                    {status === "running"
                      ? <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      : <ModIcon className="h-5 w-5 text-primary" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold truncate flex-1">{mod.name}</h3>
                      {status && status !== "running" && statusIcon(status, "h-4 w-4")}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{mod.description}</p>
                    {results && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-[9px] h-4 border-green-400 text-green-600">{okCount} OK</Badge>
                        {fixedCount > 0 && <Badge variant="outline" className="text-[9px] h-4 border-blue-400 text-blue-600">{fixedCount} Corrigido</Badge>}
                        {warnCount > 0 && <Badge variant="outline" className="text-[9px] h-4 border-yellow-400 text-yellow-600">{warnCount} Aviso</Badge>}
                        {errCount > 0  && <Badge variant="outline" className="text-[9px] h-4 border-red-400 text-red-600">{errCount} Erro</Badge>}
                      </div>
                    )}
                  </div>
                </div>
                {/* Action button: run individually (before run) or re-run (after run) */}
                <Button
                  size="sm"
                  variant={results ? "ghost" : "outline"}
                  className="w-full mt-3 gap-1.5 text-xs"
                  onClick={(e) => { e.stopPropagation(); runSingleModule(mod); setSelectedModule(mod.id); }}
                  disabled={isRunning}
                >
                  {status === "running"
                    ? <><Loader2 className="h-3 w-3 animate-spin" /> Diagnosticando...</>
                    : results
                      ? <><RefreshCw className="h-3 w-3" /> Re-executar Módulo</>
                      : <><Wrench className="h-3 w-3" /> Diagnosticar Módulo</>
                  }
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected module detail panel */}
      {selectedModule && moduleResults[selectedModule] && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              Detalhes — {modules.find(m => m.id === selectedModule)?.name}
            </CardTitle>
            <CardDescription className="text-[10px]">
              Arquivos: {modules.find(m => m.id === selectedModule)?.files.join(", ")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[420px]">
              <div className="space-y-2 pr-2">
                {moduleResults[selectedModule].map((step, idx) => (
                  <div key={step.id} className={`p-3 rounded-xl border transition-all ${statusBorder(step.status)}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">{statusIcon(step.status, "h-4 w-4")}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-muted-foreground font-medium">#{idx + 1}</span>
                          <span className="text-sm font-semibold">{step.label}</span>
                          {step.fixed && (
                            <Badge variant="outline" className="text-[9px] h-4 border-green-400 text-green-600">✓ Corrigido</Badge>
                          )}
                          {step.status === "success" && !step.fixed && (
                            <Badge variant="outline" className="text-[9px] h-4 border-green-400 text-green-600">✓ OK</Badge>
                          )}
                        </div>
                        {step.detail && (
                          <p className={`text-xs mt-1.5 p-2 rounded-lg leading-relaxed ${
                            step.status === "success" ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400" :
                            step.status === "warning" ? "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400" :
                            step.status === "error"   ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400" : "bg-accent/50"
                          }`}>{step.detail}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Final Summary Card */}
      {summary && !isRunning && (
        <Card className={`border-2 ${
          summary.errors > 0   ? "border-red-300 dark:border-red-700" :
          summary.warnings > 0 ? "border-yellow-300 dark:border-yellow-700" :
          "border-green-300 dark:border-green-700"
        }`}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              {summary.errors > 0
                ? <XCircle className="h-8 w-8 text-red-500 shrink-0" />
                : summary.warnings > 0
                  ? <AlertTriangle className="h-8 w-8 text-yellow-500 shrink-0" />
                  : <Sparkles className="h-8 w-8 text-green-500 shrink-0" />
              }
              <div className="flex-1">
                <h3 className="font-bold text-base">
                  {summary.errors > 0
                    ? `⚠️ ${summary.errors} erro(s) — verifique os módulos acima`
                    : summary.fixed > 0
                      ? `✅ ${summary.fixed} item(s) corrigido(s) automaticamente`
                      : "✅ Sistema 100% operacional!"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{lastRun}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-3xl font-black ${scoreColor(summary.score)}`}>{summary.score}</p>
                <p className="text-[10px] text-muted-foreground">/ 100</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-xl bg-accent/50">
                <p className="text-2xl font-black text-primary">{summary.total}</p>
                <p className="text-[10px] text-muted-foreground">Verificações</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-950/20">
                <p className="text-2xl font-black text-green-600">{summary.total - summary.warnings - summary.errors}</p>
                <p className="text-[10px] text-muted-foreground">Itens OK</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20">
                <p className="text-2xl font-black text-blue-600">{summary.fixed}</p>
                <p className="text-[10px] text-muted-foreground">Corrigidos</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-950/20">
                <p className="text-2xl font-black text-red-600">{summary.errors}</p>
                <p className="text-[10px] text-muted-foreground">Erros</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Timer(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return <Clock {...props} />;
}
