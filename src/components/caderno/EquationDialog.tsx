import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Use only plain text / unicode that TipTap can handle natively
const COMMON_EQUATIONS = [
  { label: 'Fração', symbol: 'a/b', text: 'ᵃ⁄ᵦ' },
  { label: 'Raiz Quadrada', symbol: '√x', text: '√x' },
  { label: 'Potência', symbol: 'x²', text: 'x²' },
  { label: 'Índice', symbol: 'xₙ', text: 'xₙ' },
  { label: 'Somatório', symbol: 'Σ', text: '∑' },
  { label: 'Integral', symbol: '∫', text: '∫' },
  { label: 'Limite', symbol: 'lim', text: 'lim x→∞' },
  { label: 'Infinito', symbol: '∞', text: '∞' },
  { label: 'Pi', symbol: 'π', text: 'π' },
  { label: 'Delta', symbol: 'Δ', text: 'Δ' },
  { label: 'Diferente', symbol: '≠', text: '≠' },
  { label: 'Menor ou Igual', symbol: '≤', text: '≤' },
  { label: 'Maior ou Igual', symbol: '≥', text: '≥' },
  { label: 'Aproximado', symbol: '≈', text: '≈' },
  { label: 'Pertence', symbol: '∈', text: '∈' },
  { label: 'Não Pertence', symbol: '∉', text: '∉' },
  { label: 'Subconjunto', symbol: '⊂', text: '⊂' },
  { label: 'União', symbol: '∪', text: '∪' },
  { label: 'Interseção', symbol: '∩', text: '∩' },
  { label: 'Para Todo', symbol: '∀', text: '∀' },
  { label: 'Existe', symbol: '∃', text: '∃' },
  { label: 'Portanto', symbol: '∴', text: '∴' },
  { label: 'Seta Direita', symbol: '→', text: '→' },
  { label: 'Seta Dupla', symbol: '⇔', text: '⇔' },
  { label: 'Mais ou Menos', symbol: '±', text: '±' },
  { label: 'Vezes', symbol: '×', text: '×' },
  { label: 'Dividir', symbol: '÷', text: '÷' },
  { label: 'Graus', symbol: '°', text: '°' },
];

const FORMULA_TEMPLATES = [
  { label: 'Bhaskara', formula: 'x = (-b ± √(b²-4ac)) / 2a', text: 'x = (−b ± √(b² − 4ac)) / 2a' },
  { label: 'Pitágoras', formula: 'a² + b² = c²', text: 'a² + b² = c²' },
  { label: 'Área do Círculo', formula: 'A = πr²', text: 'A = πr²' },
  { label: 'Velocidade Média', formula: 'v = Δs/Δt', text: 'v = Δs / Δt' },
  { label: 'Lei de Newton (2ª)', formula: 'F = m·a', text: 'F = m · a' },
  { label: 'Energia Cinética', formula: 'Ec = mv²/2', text: 'Eₖ = mv² / 2' },
  { label: 'Função Quadrática', formula: 'f(x) = ax² + bx + c', text: 'f(x) = ax² + bx + c' },
  { label: 'Logaritmo', formula: 'log_a(b) = c', text: 'logₐ(b) = c' },
  { label: 'Seno/Cosseno', formula: 'sin²θ + cos²θ = 1', text: 'sin²θ + cos²θ = 1' },
  { label: 'Distância', formula: 'd = √((x₂-x₁)² + (y₂-y₁)²)', text: 'd = √((x₂−x₁)² + (y₂−y₁)²)' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
}

export function EquationDialog({ open, onClose, onInsert }: Props) {
  const [customEq, setCustomEq] = useState('');
  const [tab, setTab] = useState<'symbols' | 'formulas' | 'custom'>('symbols');

  const insert = (text: string) => {
    onInsert(text);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <span>∑</span> Inserir Equação
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-1 mb-2">
          {[
            { id: 'symbols' as const, label: 'Símbolos' },
            { id: 'formulas' as const, label: 'Fórmulas' },
            { id: 'custom' as const, label: 'Personalizado' },
          ].map(t => (
            <Button key={t.id} size="sm" variant={tab === t.id ? 'default' : 'outline'}
              className="h-7 text-xs" onClick={() => setTab(t.id)}>{t.label}</Button>
          ))}
        </div>

        {tab === 'symbols' && (
          <ScrollArea className="h-[280px]">
            <div className="grid grid-cols-4 gap-1.5">
              {COMMON_EQUATIONS.map(eq => (
                <button key={eq.label}
                  className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-accent hover:border-primary/30 transition-colors gap-1"
                  onClick={() => insert(eq.text)}>
                  <span className="text-lg font-mono">{eq.symbol}</span>
                  <span className="text-[9px] text-muted-foreground">{eq.label}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        {tab === 'formulas' && (
          <ScrollArea className="h-[280px]">
            <div className="space-y-1.5">
              {FORMULA_TEMPLATES.map(f => (
                <button key={f.label}
                  className="w-full flex items-center justify-between p-2.5 border rounded-md hover:bg-accent hover:border-primary/30 transition-colors text-left"
                  onClick={() => insert(f.text)}>
                  <div>
                    <p className="text-xs font-medium">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{f.formula}</p>
                  </div>
                  <span className="text-lg">→</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        {tab === 'custom' && (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Digite sua equação (suporta Unicode matemático):</p>
              <Input value={customEq} onChange={e => setCustomEq(e.target.value)}
                placeholder="Ex: f(x) = 2x² + 3x - 5" className="font-mono text-sm" />
            </div>
            {customEq && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-[10px] text-muted-foreground mb-1">Preview:</p>
                <p className="text-lg font-mono text-center">{customEq}</p>
              </div>
            )}
            <Button size="sm" onClick={() => { if (customEq.trim()) insert(customEq); }}
              disabled={!customEq.trim()} className="w-full">
              Inserir Equação
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
