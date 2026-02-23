import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, XCircle, Loader2, Volume2, Mic, Wifi, ArrowLeft,
  RefreshCw, AlertTriangle, Sparkles
} from "lucide-react";

const FUNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/language-classroom`;
const AUTH_HEADER = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
};

interface DiagnosticResult {
  id: string;
  label: string;
  status: "pending" | "running" | "success" | "warning" | "error";
  detail?: string;
}

interface Props {
  langId: string;
  langName: string;
  langFlag: string;
  speechLang: string;
  color: string;
  onReady: () => void;
  onBack: () => void;
}

export function LanguageDiagnostic({ langId, langName, langFlag, speechLang, color, onReady, onBack }: Props) {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [allPassed, setAllPassed] = useState(false);

  const updateResult = useCallback((id: string, update: Partial<DiagnosticResult>) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, ...update } : r));
  }, []);

  const runDiagnostics = useCallback(async () => {
    setRunning(true);
    setDone(false);
    setAllPassed(false);

    const initial: DiagnosticResult[] = [
      { id: "tts-support", label: "Suporte a síntese de voz (TTS)", status: "pending" },
      { id: "tts-voices", label: `Vozes disponíveis para ${langName}`, status: "pending" },
      { id: "tts-playback", label: "Teste de reprodução de áudio", status: "pending" },
      { id: "sr-support", label: "Suporte a reconhecimento de voz", status: "pending" },
      { id: "api-connection", label: "Conexão com servidor de aulas", status: "pending" },
    ];
    setResults(initial);

    // 1. TTS Support
    await delay(300);
    updateResult("tts-support", { status: "running" });
    await delay(500);
    if (!window.speechSynthesis) {
      updateResult("tts-support", { status: "error", detail: "Navegador não suporta síntese de voz. Use Chrome ou Edge." });
    } else {
      updateResult("tts-support", { status: "success", detail: "Web Speech API disponível" });
    }

    // 2. TTS Voices for language
    await delay(300);
    updateResult("tts-voices", { status: "running" });

    let voices: SpeechSynthesisVoice[] = [];
    if (window.speechSynthesis) {
      voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Wait for voices to load
        await new Promise<void>((resolve) => {
          const handler = () => {
            voices = window.speechSynthesis.getVoices();
            window.speechSynthesis.removeEventListener("voiceschanged", handler);
            resolve();
          };
          window.speechSynthesis.addEventListener("voiceschanged", handler);
          setTimeout(() => resolve(), 3000);
        });
        voices = window.speechSynthesis.getVoices();
      }

      const langPrefix = speechLang.split("-")[0];
      const matches = voices.filter(v => v.lang === speechLang || v.lang.startsWith(langPrefix));

      if (matches.length > 0) {
        const premiumVoice = matches.find(v =>
          v.name.toLowerCase().includes("premium") ||
          v.name.toLowerCase().includes("neural") ||
          v.name.toLowerCase().includes("google") ||
          v.name.toLowerCase().includes("microsoft")
        );
        updateResult("tts-voices", {
          status: "success",
          detail: `${matches.length} voz(es) encontrada(s)${premiumVoice ? ` — usando: ${premiumVoice.name}` : ` — usando: ${matches[0].name}`}`,
        });
      } else {
        updateResult("tts-voices", {
          status: "warning",
          detail: `Nenhuma voz nativa encontrada para ${speechLang}. O navegador usará uma voz genérica.`,
        });
      }
    } else {
      updateResult("tts-voices", { status: "error", detail: "TTS não disponível" });
    }

    // 3. TTS Playback test
    await delay(300);
    updateResult("tts-playback", { status: "running" });

    if (window.speechSynthesis) {
      try {
        // Use a real greeting to fully unlock audio context in the browser
        const greetings: Record<string, string> = {
          "en-US": "Hello", "es-ES": "Hola", "de-DE": "Hallo",
          "it-IT": "Ciao", "zh-CN": "你好", "pt-BR": "Olá",
        };
        const greeting = greetings[speechLang] || "OK";

        await new Promise<void>((resolve, reject) => {
          const utterance = new SpeechSynthesisUtterance(greeting);
          utterance.lang = speechLang;
          utterance.volume = 0.3; // Audible but soft — ensures browser fully unlocks audio
          utterance.rate = 1;

          const langPrefix = speechLang.split("-")[0];
          const matchingVoices = voices.filter(v => v.lang === speechLang || v.lang.startsWith(langPrefix));
          if (matchingVoices[0]) utterance.voice = matchingVoices[0];

          utterance.onend = () => resolve();
          utterance.onerror = (e) => reject(e);
          setTimeout(() => resolve(), 5000);

          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        });
        updateResult("tts-playback", { status: "success", detail: `Áudio reproduzido: "${greeting}" — Pronto para uso` });
      } catch {
        updateResult("tts-playback", { status: "warning", detail: "Teste de reprodução falhou, mas pode funcionar em interação manual" });
      }
    } else {
      updateResult("tts-playback", { status: "error", detail: "TTS não disponível" });
    }

    // 4. Speech Recognition
    await delay(300);
    updateResult("sr-support", { status: "running" });
    await delay(500);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      updateResult("sr-support", { status: "success", detail: "Reconhecimento de voz disponível para conversação" });
    } else {
      updateResult("sr-support", { status: "warning", detail: "Não disponível neste navegador. Use Chrome ou Edge para conversação por voz." });
    }

    // 5. API Connection
    await delay(300);
    updateResult("api-connection", { status: "running" });

    try {
      const resp = await fetch(FUNC_URL, {
        method: "POST",
        headers: AUTH_HEADER,
        body: JSON.stringify({ action: "get-curriculum", language: langId }),
      });
      if (resp.ok) {
        updateResult("api-connection", { status: "success", detail: "Servidor respondendo normalmente" });
      } else {
        updateResult("api-connection", { status: "error", detail: `Servidor retornou erro ${resp.status}. Tente novamente.` });
      }
    } catch (e: any) {
      updateResult("api-connection", { status: "error", detail: "Sem conexão com o servidor. Verifique sua internet." });
    }

    setRunning(false);
    setDone(true);
  }, [langId, langName, speechLang, updateResult]);

  // Check if all critical tests passed
  useEffect(() => {
    if (!done) return;
    const hasError = results.some(r => r.status === "error");
    setAllPassed(!hasError);
  }, [done, results]);

  // Auto-run on mount
  useEffect(() => {
    runDiagnostics();
  }, [runDiagnostics]);

  const progressValue = done ? 100 : results.filter(r => r.status !== "pending" && r.status !== "running").length / results.length * 100;
  const errors = results.filter(r => r.status === "error").length;
  const warnings = results.filter(r => r.status === "warning").length;

  const statusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "pending": return <div className="w-5 h-5 rounded-full bg-muted" />;
      case "running": return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case "success": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error": return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden">
        <div className={`bg-gradient-to-r ${color} p-6 text-white`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Diagnóstico do Sistema</h2>
              <p className="text-sm opacity-90">{langFlag} Curso de {langName}</p>
            </div>
          </div>
          <p className="text-xs opacity-80 mt-3">
            Verificando se todos os recursos estão disponíveis para iniciar seus estudos...
          </p>
          <Progress value={progressValue} className="h-2 mt-4 bg-white/20" />
        </div>

        <CardContent className="p-5 space-y-3">
          {results.map(r => (
            <div key={r.id} className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
              r.status === "error" ? "bg-destructive/5 border border-destructive/20" :
              r.status === "warning" ? "bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800" :
              r.status === "success" ? "bg-green-50/50 dark:bg-green-950/10" :
              "bg-muted/30"
            }`}>
              <div className="shrink-0 mt-0.5">{statusIcon(r.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {r.id === "tts-support" || r.id === "tts-voices" || r.id === "tts-playback" ? (
                    <Volume2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  ) : r.id === "sr-support" ? (
                    <Mic className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <Wifi className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <p className="text-sm font-medium">{r.label}</p>
                </div>
                {r.detail && (
                  <p className={`text-xs mt-1 ${
                    r.status === "error" ? "text-destructive" :
                    r.status === "warning" ? "text-yellow-600 dark:text-yellow-400" :
                    "text-muted-foreground"
                  }`}>
                    {r.detail}
                  </p>
                )}
              </div>
            </div>
          ))}

          {done && (
            <div className={`p-4 rounded-xl text-center space-y-3 mt-2 ${
              allPassed ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800" :
              "bg-destructive/5 border border-destructive/20"
            }`}>
              {allPassed ? (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <p className="font-semibold text-green-700 dark:text-green-300">
                      Sistema pronto! {warnings > 0 ? `(${warnings} aviso${warnings > 1 ? 's' : ''})` : "Todos os testes passaram."}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Todos os recursos essenciais estão funcionando. Você pode iniciar seus estudos.
                  </p>
                  <Button onClick={onReady} size="lg" className={`bg-gradient-to-r ${color} hover:opacity-90 gap-2 shadow-lg`}>
                    <Sparkles className="h-4 w-4" /> Iniciar Curso de {langName}
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <p className="font-semibold text-destructive">
                      {errors} problema{errors > 1 ? 's' : ''} encontrado{errors > 1 ? 's' : ''}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Corrija os problemas acima ou tente novamente. Alguns recursos podem não funcionar corretamente.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={runDiagnostics} className="gap-1.5">
                      <RefreshCw className="h-4 w-4" /> Testar Novamente
                    </Button>
                    <Button onClick={onReady} variant="secondary" className="gap-1.5">
                      Continuar mesmo assim
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">Requisitos Recomendados</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Volume2 className="h-4 w-4 text-primary shrink-0" />
              <span>Alto-falantes ou fones de ouvido para ouvir as lições</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Mic className="h-4 w-4 text-primary shrink-0" />
              <span>Microfone para conversação por voz (Chrome/Edge)</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Wifi className="h-4 w-4 text-primary shrink-0" />
              <span>Conexão com a internet para gerar conteúdo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
