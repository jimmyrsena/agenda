import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RulerMargins } from "./WordRulers";
import { PAPER_SIZES, getPaperDimensions } from "./paperSizes";

interface Props {
  open: boolean;
  onClose: () => void;
  margins: RulerMargins;
  topMargin: number;
  bottomMargin: number;
  onMarginsChange: (m: RulerMargins) => void;
  onTopMarginChange: (v: number) => void;
  onBottomMarginChange: (v: number) => void;
  orientation: 'portrait' | 'landscape';
  onOrientationChange: (v: 'portrait' | 'landscape') => void;
  paperSize: string;
  onPaperSizeChange: (v: string) => void;
  watermark: string;
  onWatermarkChange: (v: string) => void;
  pageColor: string;
  onPageColorChange: (v: string) => void;
  lineSpacing: number;
  onLineSpacingChange: (v: number) => void;
  columns: number;
  onColumnsChange: (v: number) => void;
}

// Use shared PAPER_SIZES from paperSizes.ts

const MARGIN_PRESETS = [
  { name: 'Normal', top: 2.5, bottom: 2, left: 3, right: 2 },
  { name: 'Estreita', top: 1.27, bottom: 1.27, left: 1.27, right: 1.27 },
  { name: 'Moderada', top: 2.54, bottom: 2.54, left: 1.91, right: 1.91 },
  { name: 'Larga', top: 2.54, bottom: 2.54, left: 5.08, right: 5.08 },
  { name: 'Espelhada', top: 2.54, bottom: 2.54, left: 3.18, right: 2.54 },
  { name: 'ABNT', top: 3, bottom: 2, left: 3, right: 2 },
];

const PAGE_COLORS = [
  { name: 'Branco', value: '' },
  { name: 'Creme', value: '#fef9ef' },
  { name: 'Cinza Claro', value: '#f5f5f5' },
  { name: 'Azul Claro', value: '#f0f7ff' },
  { name: 'Verde Claro', value: '#f0fdf4' },
  { name: 'Rosa Claro', value: '#fdf2f8' },
  { name: 'Sépia', value: '#f5f0e1' },
  { name: 'Escuro', value: '#1a1a2e' },
];

const WATERMARKS = ['', 'RASCUNHO', 'CONFIDENCIAL', 'NÃO COPIAR', 'URGENTE', 'AMOSTRA', 'PRELIMINAR'];

export function PageSetupDialog({
  open, onClose, margins, topMargin, bottomMargin,
  onMarginsChange, onTopMarginChange, onBottomMarginChange,
  orientation, onOrientationChange, paperSize, onPaperSizeChange,
  watermark, onWatermarkChange, pageColor, onPageColorChange,
  lineSpacing, onLineSpacingChange, columns, onColumnsChange,
}: Props) {
  const [tab, setTab] = useState<'margins' | 'paper' | 'layout'>('margins');
  const dims = getPaperDimensions(paperSize, orientation);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="text-sm">Configurar Página</DialogTitle></DialogHeader>

        {/* Tabs */}
        <div className="flex border-b mb-3">
          {(['margins', 'paper', 'layout'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-1.5 text-xs font-medium ${tab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
              {t === 'margins' ? 'Margens' : t === 'paper' ? 'Papel' : 'Layout'}
            </button>
          ))}
        </div>

        {tab === 'margins' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground">Superior (cm)</label>
                <Input type="number" step="0.25" min="0" value={topMargin} onChange={e => onTopMarginChange(Number(e.target.value))} className="h-7 text-xs mt-0.5" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Inferior (cm)</label>
                <Input type="number" step="0.25" min="0" value={bottomMargin} onChange={e => onBottomMarginChange(Number(e.target.value))} className="h-7 text-xs mt-0.5" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Esquerda (cm)</label>
                <Input type="number" step="0.25" min="0" value={margins.leftMarginCm} onChange={e => onMarginsChange({ ...margins, leftMarginCm: Number(e.target.value) })} className="h-7 text-xs mt-0.5" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Direita (cm)</label>
                <Input type="number" step="0.25" min="0" value={margins.rightMarginCm} onChange={e => onMarginsChange({ ...margins, rightMarginCm: Number(e.target.value) })} className="h-7 text-xs mt-0.5" />
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-1.5">Predefinições</p>
              <div className="grid grid-cols-3 gap-1">
                {MARGIN_PRESETS.map(p => (
                  <Button key={p.name} size="sm" variant="outline" className="h-7 text-[10px]"
                    onClick={() => {
                      onMarginsChange({ ...margins, leftMarginCm: p.left, rightMarginCm: p.right });
                      onTopMarginChange(p.top);
                      onBottomMarginChange(p.bottom);
                    }}>
                    {p.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'paper' && (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-muted-foreground">Tamanho do Papel</label>
              <Select value={paperSize} onValueChange={onPaperSizeChange}>
                <SelectTrigger className="h-7 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAPER_SIZES.map(s => <SelectItem key={s.id} value={s.id} className="text-xs">{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-[9px] text-muted-foreground mt-1">
                Dimensões: {dims.widthCm.toFixed(1)} × {dims.heightCm.toFixed(1)} cm ({dims.widthPx} × {dims.heightPx} px)
              </p>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Orientação</label>
              <div className="flex gap-2 mt-1">
                <Button size="sm" variant={orientation === 'portrait' ? 'default' : 'outline'} className="h-12 w-10 flex-col gap-0.5"
                  onClick={() => onOrientationChange('portrait')}>
                  <div className="w-4 h-6 border-2 border-current rounded-[2px]" />
                  <span className="text-[8px]">Retrato</span>
                </Button>
                <Button size="sm" variant={orientation === 'landscape' ? 'default' : 'outline'} className="h-12 w-12 flex-col gap-0.5"
                  onClick={() => onOrientationChange('landscape')}>
                  <div className="w-6 h-4 border-2 border-current rounded-[2px]" />
                  <span className="text-[8px]">Paisagem</span>
                </Button>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Cor da Página</label>
              <div className="flex gap-1 mt-1 flex-wrap">
                {PAGE_COLORS.map(c => (
                  <button key={c.name}
                    className={`w-7 h-7 rounded border ${pageColor === c.value ? 'ring-2 ring-primary' : 'border-border/50'}`}
                    style={{ backgroundColor: c.value || '#ffffff' }}
                    title={c.name}
                    onClick={() => onPageColorChange(c.value)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'layout' && (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-muted-foreground">Espaçamento entre Linhas</label>
              <div className="flex gap-1 mt-1">
                {[1, 1.15, 1.5, 2, 2.5, 3].map(v => (
                  <Button key={v} size="sm" variant={lineSpacing === v ? 'default' : 'outline'} className="h-7 text-[10px] px-2"
                    onClick={() => onLineSpacingChange(v)}>
                    {v.toFixed(v % 1 ? 2 : 0)}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Colunas</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3].map(c => (
                  <Button key={c} size="sm" variant={columns === c ? 'default' : 'outline'} className="h-10 w-14 flex-col gap-0.5"
                    onClick={() => onColumnsChange(c)}>
                    <div className="flex gap-0.5">
                      {Array.from({ length: c }, (_, i) => (
                        <div key={i} className="w-2 h-5 border border-current rounded-[1px]" />
                      ))}
                    </div>
                    <span className="text-[8px]">{c === 1 ? 'Uma' : c === 2 ? 'Duas' : 'Três'}</span>
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Marca d'Água</label>
              <Select value={watermark} onValueChange={onWatermarkChange}>
                <SelectTrigger className="h-7 text-xs mt-0.5"><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                <SelectContent>
                  {WATERMARKS.map(w => <SelectItem key={w || 'none'} value={w || 'none'} className="text-xs">{w || 'Nenhuma'}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
