import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShieldCheck, Loader2, CheckCircle, AlertTriangle, XCircle,
  Wrench, ArrowRight, Sparkles, Database, RefreshCw, Trash2,
  FileWarning, History, TrendingUp, Zap, ChevronDown, ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ─── Types ───
interface RepairAction {
  id: string;
  category: "keys" | "structure" | "stale" | "orphan" | "config" | "integrity";
  label: string;
  detail: string;
  severity: "info" | "fixed" | "warning" | "error";
  before?: string;
  after?: string;
}

interface SweepRecord {
  ts: string;
  fixed: number;
  warnings: number;
  score: number;
}

const CATEGORY_LABELS: Record<RepairAction["category"], string> = {
  keys: "Chaves de Dados",
  structure: "Estrutura de Dados",
  stale: "Dados Obsoletos",
  orphan: "Dados Órfãos",
  config: "Configurações",
  integrity: "Integridade",
};

const CATEGORY_ICONS: Record<RepairAction["category"], typeof Database> = {
  keys: Database,
  structure: FileWarning,
  stale: Trash2,
  orphan: Trash2,
  config: Wrench,
  integrity: ShieldCheck,
};

// ─── Known key mapping (old → correct) ───
const KEY_MIGRATIONS: [string, string][] = [
  ["notebook-entries", "study-notes"],
  ["simulado-stats", "simulado-results"],
  ["flashcard-decks", "flashcards"],
  ["study-goals", "weekly-goals"],
];

// ─── Known system keys with expected types ───
const KNOWN_KEYS: Record<string, { type: "array" | "object" | "string" | "boolean"; default: string }> = {
  "kanban-tasks":        { type: "array",   default: "[]" },
  "study-sessions":      { type: "array",   default: "[]" },
  "study-notes":         { type: "array",   default: "[]" },
  "flashcards":          { type: "array",   default: "[]" },
  "agenda-events":       { type: "array",   default: "[]" },
  "weekly-goals":        { type: "array",   default: "[]" },
  "simulado-results":    { type: "array",   default: "[]" },
  "pdf-knowledge":       { type: "array",   default: "[]" },
  "mentor-memories":     { type: "array",   default: "[]" },
  "mentor-config":       { type: "object",  default: '{"userName":"Estudante","voiceSpeed":1,"voicePersona":"formal"}' },
  "language-progress":   { type: "object",  default: "{}" },
  "mentor-persona":      { type: "string",  default: '"descolado"' },
  "mentor-voice-enabled":{ type: "boolean", default: "true" },
  "mentor-speed":        { type: "string",  default: '"1"' },
  "dark-mode":           { type: "boolean", default: "false" },
  "notifications-enabled":{ type: "boolean", default: "true" },
  "auto-save":           { type: "boolean", default: "true" },
  "pomodoro-work":       { type: "string",  default: '"25"' },
  "pomodoro-break":      { type: "string",  default: '"5"' },
};

// ─── Known prefixes for orphan detection ───
const KNOWN_PREFIXES = [
  "kanban", "study", "flashcard", "mentor", "pomodoro", "language",
  "gamification", "dark-mode", "notifications", "auto-save", "professor",
  "backup", "last-backup", "translation", "simulado", "plano-estudos",
  "weekly", "system-last", "maintenance", "pdf-knowledge", "agenda",
  "last-view", "sb-", "chat-history", "hasGreeted",
];

const STALE_KEYS = [
  "provas-enem", "enem-provas", "enem-gabaritos", "provas-data",
  "enem-results-2024", "enem-results-2025",
];

// ─── AI service health check ───
async function checkAIService(fnName: string, body: object): Promise<{ ok: boolean; status: number }> {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fnName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify(body),
      }
    );
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

const SWEEP_PHASES = [
  { pct: 10,  label: "🔍 Migrando chaves antigas..." },
  { pct: 25,  label: "🏗️ Validando estruturas de dados..." },
  { pct: 40,  label: "🗑️ Limpando módulos removidos..." },
  { pct: 55,  label: "⚙️ Verificando configurações..." },
  { pct: 65,  label: "🤖 Verificando serviços de IA..." },
  { pct: 78,  label: "🔗 Removendo duplicatas..." },
  { pct: 90,  label: "🕵️ Detectando chaves órfãs..." },
  { pct: 97,  label: "📊 Calculando saúde do storage..." },
];

// ─── Sweep Engine (async to allow AI service checks) ───
async function runFullSweep(): Promise<RepairAction[]> {
  const actions: RepairAction[] = [];

  // 1. KEY MIGRATION
  for (const [oldKey, newKey] of KEY_MIGRATIONS) {
    const oldVal = localStorage.getItem(oldKey);
    const newVal = localStorage.getItem(newKey);
    if (oldVal && !newVal) {
      localStorage.setItem(newKey, oldVal);
      localStorage.removeItem(oldKey);
      actions.push({ id: `migrate-${oldKey}`, category: "keys", label: `Chave migrada: ${oldKey}`, detail: `Dados movidos de "${oldKey}" → "${newKey}"`, severity: "fixed", before: oldKey, after: newKey });
    } else if (oldVal && newVal) {
      try {
        const oldParsed = JSON.parse(oldVal);
        const newParsed = JSON.parse(newVal);
        if (Array.isArray(oldParsed) && Array.isArray(newParsed)) {
          const existingIds = new Set(newParsed.map((x: any) => x.id).filter(Boolean));
          const unique = oldParsed.filter((x: any) => !x.id || !existingIds.has(x.id));
          if (unique.length > 0) {
            localStorage.setItem(newKey, JSON.stringify([...newParsed, ...unique]));
            actions.push({ id: `merge-${oldKey}`, category: "keys", label: `Dados mesclados: ${oldKey}`, detail: `${unique.length} itens únicos mesclados para "${newKey}"`, severity: "fixed" });
          }
        }
      } catch { /* ignore */ }
      localStorage.removeItem(oldKey);
      actions.push({ id: `remove-old-${oldKey}`, category: "keys", label: `Chave antiga removida: ${oldKey}`, detail: `Chave obsoleta "${oldKey}" limpa`, severity: "fixed" });
    }
  }

  // 2. STRUCTURE VALIDATION
  for (const [key, meta] of Object.entries(KNOWN_KEYS)) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (meta.type === "array" && !Array.isArray(parsed)) {
        localStorage.setItem(key, meta.default);
        actions.push({ id: `struct-${key}`, category: "structure", label: `Tipo corrigido: ${key}`, detail: `Esperado: array, encontrado: ${typeof parsed}. Restaurado ao padrão.`, severity: "fixed" });
      } else if (meta.type === "object" && (typeof parsed !== "object" || Array.isArray(parsed))) {
        localStorage.setItem(key, meta.default);
        actions.push({ id: `struct-${key}`, category: "structure", label: `Tipo corrigido: ${key}`, detail: `Esperado: objeto, encontrado: ${Array.isArray(parsed) ? "array" : typeof parsed}. Restaurado ao padrão.`, severity: "fixed" });
      }
    } catch {
      localStorage.setItem(key, meta.default);
      actions.push({ id: `corrupt-${key}`, category: "structure", label: `JSON corrompido: ${key}`, detail: `Dados corrompidos restaurados ao padrão.`, severity: "fixed" });
    }
  }

  // 3. STALE DATA CLEANUP
  for (const staleKey of STALE_KEYS) {
    if (localStorage.getItem(staleKey)) {
      localStorage.removeItem(staleKey);
      actions.push({ id: `stale-${staleKey}`, category: "stale", label: `Removido: ${staleKey}`, detail: `Dados do módulo removido limpos.`, severity: "fixed" });
    }
  }

  // 4. CONFIG CONSISTENCY
  try {
    const mc = JSON.parse(localStorage.getItem("mentor-config") || "{}");
    let fixed = false;
    if (!mc.userName || typeof mc.userName !== "string") { mc.userName = "Estudante"; fixed = true; }
    if (!mc.voiceSpeed || typeof mc.voiceSpeed !== "number") { mc.voiceSpeed = 1; fixed = true; }
    if (!mc.voicePersona || typeof mc.voicePersona !== "string") { mc.voicePersona = "formal"; fixed = true; }
    if (fixed) {
      localStorage.setItem("mentor-config", JSON.stringify(mc));
      actions.push({ id: "config-mentor", category: "config", label: "Configuração do Mentor reparada", detail: "Campos ausentes restaurados (userName, voiceSpeed, voicePersona).", severity: "fixed" });
    }
  } catch { /* handled by structure validation */ }

  const pomWork = localStorage.getItem("pomodoro-work");
  if (pomWork) {
    try {
      const val = parseInt(JSON.parse(pomWork), 10);
      if (isNaN(val) || val < 1 || val > 120) {
        localStorage.setItem("pomodoro-work", '"25"');
        actions.push({ id: "config-pom-work", category: "config", label: "Pomodoro foco corrigido", detail: `Valor inválido substituído por 25 min.`, severity: "fixed" });
      }
    } catch { localStorage.setItem("pomodoro-work", '"25"'); }
  }
  const pomBreak = localStorage.getItem("pomodoro-break");
  if (pomBreak) {
    try {
      const val = parseInt(JSON.parse(pomBreak), 10);
      if (isNaN(val) || val < 1 || val > 60) {
        localStorage.setItem("pomodoro-break", '"5"');
        actions.push({ id: "config-pom-break", category: "config", label: "Pomodoro intervalo corrigido", detail: `Valor inválido substituído por 5 min.`, severity: "fixed" });
      }
    } catch { localStorage.setItem("pomodoro-break", '"5"'); }
  }

  // 5. DEEP INTEGRITY (duplicates)
  const arrayKeys = ["kanban-tasks", "study-sessions", "study-notes", "flashcards", "agenda-events", "weekly-goals", "simulado-results", "pdf-knowledge"];
  for (const key of arrayKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) continue;
      const seen = new Set<string>();
      const deduped: any[] = [];
      let dupeCount = 0;
      for (const item of arr) {
        const id = item?.id;
        if (id && seen.has(id)) { dupeCount++; continue; }
        if (id) seen.add(id);
        deduped.push(item);
      }
      if (dupeCount > 0) {
        localStorage.setItem(key, JSON.stringify(deduped));
        actions.push({ id: `dedup-${key}`, category: "integrity", label: `Duplicatas removidas: ${key}`, detail: `${dupeCount} entradas duplicadas eliminadas.`, severity: "fixed" });
      }
    } catch { /* skip */ }
  }

  // 5b. AI SERVICES CHECK — detect 402/offline and auto-correct flags
  const aiChecks: Array<{
    fn: string; body: object;
    offlineKey: string; label: string;
  }> = [
    { fn: "enem-simulado", body: { type: "custom-topics", topics: "ping", questionCount: 1, area: "misto" }, offlineKey: "simulado-offline-mode", label: "IA de Simulados (enem-simulado)" },
    { fn: "enem-tutor", body: { messages: [{ role: "user", content: "ping" }], memories: [], voicePersona: "formal", userName: "test" }, offlineKey: "mentor-offline-mode", label: "IA do Mentor (enem-tutor)" },
  ];

  for (const { fn, body, offlineKey, label } of aiChecks) {
    const alreadyOffline = localStorage.getItem(offlineKey) === "true";
    try {
      const ai = await checkAIService(fn, body);
      if (ai.ok) {
        // Service recovered — clear offline flag
        if (alreadyOffline) localStorage.removeItem(offlineKey);
        actions.push({ id: `ai-${fn}`, category: "config", label: `${label} — Online`, detail: `Serviço de IA respondendo normalmente.`, severity: "info" });
      } else if (ai.status === 402 || ai.status === 429 || ai.status === 0) {
        // 402 = quota exhausted — activate offline mode and report
        if (!alreadyOffline) {
          localStorage.setItem(offlineKey, "true");
          actions.push({ id: `ai-${fn}`, category: "config", label: `${label} — Modo offline ativado`, detail: `IA indisponível (erro ${ai.status}). Modo offline ativado automaticamente. O sistema usará banco local. Execute nova varredura para confirmar.`, severity: "fixed" });
        } else {
          // Already offline from a previous scan — show green (corrected)
          actions.push({ id: `ai-${fn}`, category: "config", label: `${label} — Modo offline ativo ✓`, detail: `IA indisponível (erro ${ai.status}), mas o modo offline já estava configurado. Sistema funcionando normalmente com banco local.`, severity: "info" });
        }
      } else {
        actions.push({ id: `ai-${fn}`, category: "config", label: `${label} — Erro inesperado`, detail: `Erro ${ai.status}. Verifique os logs da função.`, severity: "warning" });
      }
    } catch {
      // Network error — treat as offline
      if (!alreadyOffline) {
        localStorage.setItem(offlineKey, "true");
        actions.push({ id: `ai-${fn}`, category: "config", label: `${label} — Sem conexão`, detail: `Sem acesso ao servidor. Modo offline ativado.`, severity: "fixed" });
      } else {
        actions.push({ id: `ai-${fn}`, category: "config", label: `${label} — Modo offline ativo ✓`, detail: `Sem conexão com o servidor, mas modo offline já configurado. Sistema funcionando normalmente.`, severity: "info" });
      }
    }
  }

  // 6. ORPHAN KEYS — auto-remove
  const orphanKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (KNOWN_PREFIXES.some(p => k.startsWith(p))) continue;
    if (Object.keys(KNOWN_KEYS).includes(k)) continue;
    orphanKeys.push(k);
  }
  if (orphanKeys.length > 0) {
    // Auto-remove orphans this sweep
    orphanKeys.forEach(k => localStorage.removeItem(k));
    actions.push({
      id: "orphans-removed",
      category: "orphan",
      label: `${orphanKeys.length} chave(s) órfã(s) removida(s)`,
      detail: `Removidas: ${orphanKeys.slice(0, 6).join(", ")}${orphanKeys.length > 6 ? ` (+${orphanKeys.length - 6} mais)` : ""}`,
      severity: "fixed",
    });
  }

  // 7. STORAGE HEALTH
  let totalBytes = 0;
  let largestKey = "";
  let largestSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k) {
      const size = (localStorage.getItem(k) || "").length * 2;
      totalBytes += size;
      if (size > largestSize) { largestSize = size; largestKey = k; }
    }
  }
  const usagePct = Math.round((totalBytes / (5 * 1024 * 1024)) * 100);
  const totalKeys = localStorage.length;
  actions.push({
    id: "storage-health",
    category: "integrity",
    label: "Saúde do armazenamento",
    detail: `${(totalBytes / 1024 / 1024).toFixed(2)}MB de ~5MB (${usagePct}%) • ${totalKeys} chaves • Maior: "${largestKey}" (${(largestSize / 1024).toFixed(0)}KB)`,
    severity: usagePct > 80 ? "warning" : "info",
  });

  if (actions.filter(a => a.severity === "fixed").length === 0 && actions.filter(a => a.severity === "warning").length === 0) {
    actions.unshift({ id: "all-clean", category: "integrity", label: "Sistema íntegro", detail: "Nenhum problema encontrado. Todas as chaves, estruturas e configurações estão corretas.", severity: "info" });
  }

  return actions;
}

function computeScore(actions: RepairAction[]): number {
  const errors = actions.filter(a => a.severity === "error").length;
  const warnings = actions.filter(a => a.severity === "warning").length;
  const deductions = errors * 15 + warnings * 8;
  return Math.max(0, 100 - deductions);
}

function scoreColor(score: number) {
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function scoreLabel(score: number) {
  if (score >= 95) return "Excelente";
  if (score >= 80) return "Bom";
  if (score >= 60) return "Regular";
  return "Crítico";
}

// ─── Component ───
export default function SystemSweep() {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState("");
  const [progress, setProgress] = useState(0);
  const [actions, setActions] = useState<RepairAction[] | null>(null);
  const [lastSweep, setLastSweep] = useLocalStorage("maintenance-last-sweep", "");
  const [sweepHistory, setSweepHistory] = useLocalStorage<SweepRecord[]>("sweep-history", []);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["structure", "config", "keys"]));

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const runSweep = useCallback(async () => {
    setIsRunning(true);
    setActions(null);
    setProgress(0);
    setPhase(SWEEP_PHASES[0].label);

    for (const p of SWEEP_PHASES) {
      setProgress(p.pct);
      setPhase(p.label);
      await new Promise(r => setTimeout(r, 380));
    }

    const result = await runFullSweep();
    const score = computeScore(result);
    setProgress(100);
    setPhase("✅ Concluído!");
    await new Promise(r => setTimeout(r, 300));

    setActions(result);
    const ts = new Date().toLocaleString("pt-BR");
    setLastSweep(ts);

    const fixed = result.filter(a => a.severity === "fixed").length;
    const warnings = result.filter(a => a.severity === "warning").length;

    setSweepHistory(prev => [{ ts, fixed, warnings, score }, ...prev.slice(0, 4)]);
    setIsRunning(false);

    if (fixed === 0 && warnings === 0) toast.success(`Sistema 100% saudável! Score: ${score}/100 ✨`);
    else if (warnings === 0) toast.success(`${fixed} problema(s) corrigido(s). Score: ${score}/100 🔧`);
    else toast.warning(`${fixed} corrigido(s), ${warnings} aviso(s). Score: ${score}/100`);
  }, [setLastSweep, setSweepHistory]);

  const fixed = actions?.filter(a => a.severity === "fixed").length ?? 0;
  const warnings = actions?.filter(a => a.severity === "warning").length ?? 0;
  const infos = actions?.filter(a => a.severity === "info").length ?? 0;
  const score = actions ? computeScore(actions) : null;

  const severityIcon = (s: RepairAction["severity"]) => {
    switch (s) {
      case "info":    return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "fixed":   return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":   return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const severityBg = (s: RepairAction["severity"]) => {
    switch (s) {
      case "info":    return "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20";
      case "fixed":   return "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20";
      case "warning": return "border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20";
      case "error":   return "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20";
    }
  };

  const grouped = actions ? Object.entries(
    actions.reduce((acc, a) => {
      (acc[a.category] = acc[a.category] || []).push(a);
      return acc;
    }, {} as Record<string, RepairAction[]>)
  ) : [];

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Varredura Completa e Correção Automática
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              7 fases de análise e correção automática — migração, estrutura, configurações, integridade e storage.
            </CardDescription>
          </div>
          {score !== null && (
            <div className="text-center shrink-0">
              <p className={`text-3xl font-black ${scoreColor(score)}`}>{score}</p>
              <p className="text-[10px] text-muted-foreground">{scoreLabel(score)}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-0.5">
            {lastSweep && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3" /> Última varredura: <span className="font-medium">{lastSweep}</span>
              </p>
            )}
            {sweepHistory.length > 1 && (
              <button
                onClick={() => setShowHistory(v => !v)}
                className="text-[10px] text-primary flex items-center gap-1 hover:underline"
              >
                <History className="h-3 w-3" /> {showHistory ? "Ocultar" : "Ver"} histórico ({sweepHistory.length} varreduras)
              </button>
            )}
          </div>
          <Button onClick={runSweep} disabled={isRunning} size="lg" className="gap-2 shadow-md">
            {isRunning ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Varrendo...</>
            ) : (
              <><ShieldCheck className="h-4 w-4" /> {actions ? "Nova Varredura" : "Executar Varredura"}</>
            )}
          </Button>
        </div>

        {/* Sweep History */}
        {showHistory && sweepHistory.length > 0 && (
          <div className="rounded-xl border border-border bg-accent/20 p-3 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" /> Últimas Varreduras
            </p>
            <div className="space-y-1.5">
              {sweepHistory.map((rec, i) => (
                <div key={i} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-background border border-border">
                  <span className="text-muted-foreground">{rec.ts}</span>
                  <div className="flex items-center gap-3">
                    {rec.fixed > 0 && <span className="text-green-600 font-medium">{rec.fixed} corrigidos</span>}
                    {rec.warnings > 0 && <span className="text-yellow-600 font-medium">{rec.warnings} avisos</span>}
                    <span className={`font-black ${scoreColor(rec.score)}`}>{rec.score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-medium animate-pulse">{phase}</span>
              <span className="font-bold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="grid grid-cols-7 gap-1">
              {SWEEP_PHASES.map((p, i) => (
                <div key={i} className={`h-1 rounded-full transition-colors ${progress >= p.pct ? "bg-primary" : "bg-border"}`} />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {actions && !isRunning && (
          <>
            {/* Summary */}
            <div className={`p-4 rounded-xl border-2 ${
              warnings > 0 ? "border-yellow-300 dark:border-yellow-700 bg-yellow-50/30 dark:bg-yellow-950/10" :
              fixed > 0    ? "border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-950/10" :
                             "border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-950/10"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {warnings > 0
                  ? <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  : <Sparkles className="h-6 w-6 text-green-500" />
                }
                <div className="flex-1">
                  <h3 className="font-bold text-sm">
                    {warnings > 0 ? "Varredura com avisos — revisar abaixo" :
                     fixed > 0   ? "Varredura concluída — problemas corrigidos!" :
                     "Sistema 100% saudável!"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {actions.length} verificações • {lastSweep}
                  </p>
                </div>
                {score !== null && (
                  <div className="text-right">
                    <p className={`text-2xl font-black ${scoreColor(score)}`}>{score}</p>
                    <p className="text-[9px] text-muted-foreground">/ 100</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 rounded-lg bg-green-100/60 dark:bg-green-900/20">
                  <p className="text-xl font-black text-green-600">{fixed}</p>
                  <p className="text-[9px] text-muted-foreground">Corrigidos</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-yellow-100/60 dark:bg-yellow-900/20">
                  <p className="text-xl font-black text-yellow-600">{warnings}</p>
                  <p className="text-[9px] text-muted-foreground">Avisos</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-blue-100/60 dark:bg-blue-900/20">
                  <p className="text-xl font-black text-blue-600">{infos}</p>
                  <p className="text-[9px] text-muted-foreground">Info</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-accent/60">
                  <p className="text-xl font-black">{actions.length}</p>
                  <p className="text-[9px] text-muted-foreground">Total</p>
                </div>
              </div>
            </div>

            {/* Score bar */}
            {score !== null && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Score de Saúde</span>
                  <span className={`font-bold ${scoreColor(score)}`}>{score}% — {scoreLabel(score)}</span>
                </div>
                <Progress value={score} className="h-2.5" />
              </div>
            )}

            {/* Grouped results with collapse */}
            <ScrollArea className="max-h-[480px]">
              <div className="space-y-3 pr-2">
                {grouped.map(([category, items]) => {
                  const CatIcon = CATEGORY_ICONS[category as RepairAction["category"]] || Database;
                  const isExpanded = expandedCategories.has(category);
                  const hasIssues = items.some(a => a.severity === "warning" || a.severity === "error");
                  return (
                    <div key={category} className="rounded-xl border border-border overflow-hidden">
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2.5 bg-accent/30 hover:bg-accent/50 transition-colors text-left"
                        onClick={() => toggleCategory(category)}
                      >
                        <CatIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-xs font-semibold flex-1">
                          {CATEGORY_LABELS[category as RepairAction["category"]] || category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[9px] h-4">{items.length}</Badge>
                          {hasIssues && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="p-2 space-y-1.5">
                          {items.map(action => (
                            <div key={action.id} className={`p-3 rounded-lg border ${severityBg(action.severity)}`}>
                              <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 shrink-0">{severityIcon(action.severity)}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-semibold">{action.label}</span>
                                    {action.severity === "fixed" && (
                                      <Badge variant="outline" className="text-[9px] h-4 border-green-400 text-green-600">✓ Corrigido</Badge>
                                    )}
                                    {action.severity === "info" && (
                                      <Badge variant="outline" className="text-[9px] h-4 border-blue-400 text-blue-600">Info</Badge>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">{action.detail}</p>
                                  {action.before && action.after && (
                                    <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                                      <code className="px-1 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 line-through">{action.before}</code>
                                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                      <code className="px-1 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-600">{action.after}</code>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </>
        )}

        {/* Pre-run info */}
        {!actions && !isRunning && (
          <div className="rounded-xl bg-accent/40 border border-border p-4 space-y-3">
            <p className="text-xs font-semibold flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> 7 fases de análise automática:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5"><RefreshCw className="h-3 w-3 text-primary" /> Migração de chaves antigas</div>
              <div className="flex items-center gap-1.5"><Database className="h-3 w-3 text-primary" /> Validação de tipo e estrutura</div>
              <div className="flex items-center gap-1.5"><Trash2 className="h-3 w-3 text-primary" /> Limpeza de módulos removidos</div>
              <div className="flex items-center gap-1.5"><Wrench className="h-3 w-3 text-primary" /> Configurações do Mentor e Pomodoro</div>
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-primary" /> Remoção de duplicatas por ID</div>
              <div className="flex items-center gap-1.5"><FileWarning className="h-3 w-3 text-primary" /> Remoção automática de órfãos</div>
              <div className="flex items-center gap-1.5"><TrendingUp className="h-3 w-3 text-primary" /> Score de saúde do sistema</div>
              <div className="flex items-center gap-1.5"><History className="h-3 w-3 text-primary" /> Histórico das últimas 5 varreduras</div>
            </div>
            {sweepHistory.length > 0 && (
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border">
                <span className="text-muted-foreground">Última pontuação:</span>
                <span className={`font-black ${scoreColor(sweepHistory[0].score)}`}>
                  {sweepHistory[0].score}/100 — {scoreLabel(sweepHistory[0].score)}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
