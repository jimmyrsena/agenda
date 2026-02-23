import { useState, useCallback, useRef } from "react";

const DEFAULT_LEFT_MARGIN_CM = 3;
const DEFAULT_RIGHT_MARGIN_CM = 2;

export interface RulerMargins {
  leftMarginCm: number;
  rightMarginCm: number;
  firstLineIndentCm: number;
  hangingIndentCm: number;
}

interface HorizontalRulerProps {
  margins: RulerMargins;
  onMarginsChange: (m: RulerMargins) => void;
  paperWidthPx: number;
  totalCm?: number;
}

// ===== HORIZONTAL RULER (Word-style) =====
export function HorizontalRuler({ margins, onMarginsChange, paperWidthPx, totalCm = 21 }: HorizontalRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<'leftMargin' | 'rightMargin' | 'firstLine' | 'hanging' | null>(null);

  const pxPerCm = paperWidthPx / totalCm;
  const contentCm = totalCm - margins.leftMarginCm - margins.rightMarginCm;

  const handleMouseDown = useCallback((marker: typeof dragging.current, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = marker;

    const onMove = (ev: MouseEvent) => {
      if (!rulerRef.current || !dragging.current) return;
      const rect = rulerRef.current.getBoundingClientRect();
      const relX = ev.clientX - rect.left;
      const cm = Math.round(((relX / rect.width) * totalCm) * 4) / 4;

      const m = { ...margins };
      switch (dragging.current) {
        case 'leftMargin':
          m.leftMarginCm = Math.max(0.5, Math.min(cm, totalCm - m.rightMarginCm - 2));
          break;
        case 'rightMargin':
          m.rightMarginCm = Math.max(0.5, Math.min(totalCm - cm, totalCm - m.leftMarginCm - 2));
          break;
        case 'firstLine':
          m.firstLineIndentCm = Math.max(0, Math.min(cm - m.leftMarginCm, 8));
          break;
        case 'hanging':
          m.hangingIndentCm = Math.max(0, Math.min(cm - m.leftMarginCm, 8));
          break;
      }
      onMarginsChange(m);
    };

    const onUp = () => {
      dragging.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [margins, onMarginsChange, totalCm]);

  const cmToPct = (cm: number) => (cm / totalCm) * 100;
  const leftPct = cmToPct(margins.leftMarginCm);
  const rightPct = cmToPct(margins.rightMarginCm);

  // Build tick marks — numbers relative to left margin (Word-style: 0 at left margin)
  const ticks: React.ReactNode[] = [];
  for (let i = 0; i <= totalCm; i++) {
    const pct = cmToPct(i);
    const isInLeftMargin = i < margins.leftMarginCm;
    const isInRightMargin = i > (totalCm - margins.rightMarginCm);
    const isMargin = isInLeftMargin || isInRightMargin;

    // Number relative to margins
    let label: number | null = null;
    if (!isMargin) {
      const rel = Math.round(i - margins.leftMarginCm);
      if (rel >= 0 && rel <= Math.round(contentCm)) label = rel;
    }

    // Full cm tick
    ticks.push(
      <div key={`cm${i}`} className="absolute" style={{ left: `${pct}%`, top: 0, bottom: 0 }}>
        <div className={`w-px ${isMargin ? 'bg-foreground/10' : 'bg-foreground/30'}`} style={{ height: 10 }} />
        {label !== null && label > 0 && (
          <span className="absolute text-[8px] leading-none select-none text-muted-foreground/70 -translate-x-1/2" style={{ top: 11 }}>
            {label}
          </span>
        )}
      </div>
    );

    // Half-cm tick
    if (i < totalCm) {
      ticks.push(
        <div key={`h${i}`} className="absolute" style={{ left: `${cmToPct(i + 0.5)}%`, top: 0 }}>
          <div className={`w-px ${isMargin ? 'bg-foreground/8' : 'bg-foreground/20'}`} style={{ height: 6 }} />
        </div>
      );
    }
  }

  const firstLinePos = cmToPct(margins.leftMarginCm + margins.firstLineIndentCm);
  const hangingPos = cmToPct(margins.leftMarginCm + margins.hangingIndentCm);
  const leftMarginPos = cmToPct(margins.leftMarginCm);
  const rightMarginPos = cmToPct(totalCm - margins.rightMarginCm);

  return (
    <div ref={rulerRef} className="relative select-none h-6 bg-card border-b border-border/50" style={{ width: paperWidthPx }}>
      {/* Left margin area (darker) */}
      <div className="absolute top-0 bottom-0 left-0 bg-muted/70" style={{ width: `${leftPct}%` }} />
      {/* Right margin area (darker) */}
      <div className="absolute top-0 bottom-0 right-0 bg-muted/70" style={{ width: `${rightPct}%` }} />

      {/* Ticks */}
      {ticks}

      {/* First Line Indent ▼ */}
      <div className="absolute z-10 cursor-ew-resize group" style={{ left: `${firstLinePos}%`, top: 1 }}
        onMouseDown={(e) => handleMouseDown('firstLine', e)} title="Recuo da primeira linha">
        <svg width="10" height="6" viewBox="0 0 10 6" className="-translate-x-[5px]">
          <polygon points="5,6 0,0 10,0" fill="hsl(var(--foreground))" opacity="0.55" />
        </svg>
      </div>

      {/* Hanging Indent ▲ */}
      <div className="absolute z-10 cursor-ew-resize group" style={{ left: `${hangingPos}%`, bottom: 5 }}
        onMouseDown={(e) => handleMouseDown('hanging', e)} title="Recuo deslocado">
        <svg width="10" height="6" viewBox="0 0 10 6" className="-translate-x-[5px]">
          <polygon points="5,0 0,6 10,6" fill="hsl(var(--foreground))" opacity="0.55" />
        </svg>
      </div>

      {/* Left Margin rectangle handle */}
      <div className="absolute z-10 cursor-ew-resize" style={{ left: `${leftMarginPos}%`, bottom: 0 }}
        onMouseDown={(e) => handleMouseDown('leftMargin', e)} title={`Margem esquerda: ${margins.leftMarginCm.toFixed(1)}cm`}>
        <div className="w-[10px] h-[4px] -translate-x-[5px] rounded-b-sm" style={{ background: 'hsl(var(--foreground) / 0.45)' }} />
      </div>

      {/* Right Margin ▲ handle */}
      <div className="absolute z-10 cursor-ew-resize" style={{ left: `${rightMarginPos}%`, bottom: 5 }}
        onMouseDown={(e) => handleMouseDown('rightMargin', e)} title={`Margem direita: ${margins.rightMarginCm.toFixed(1)}cm`}>
        <svg width="10" height="6" viewBox="0 0 10 6" className="-translate-x-[5px]">
          <polygon points="5,0 0,6 10,6" fill="hsl(var(--foreground))" opacity="0.55" />
        </svg>
      </div>
    </div>
  );
}

// ===== VERTICAL RULER (Word-style) =====
interface VerticalRulerProps {
  heightPx: number;
  topMarginCm: number;
  bottomMarginCm: number;
  onTopMarginChange?: (cm: number) => void;
  onBottomMarginChange?: (cm: number) => void;
  totalCm?: number;
}

export function VerticalRuler({ heightPx, topMarginCm, bottomMarginCm, onTopMarginChange, onBottomMarginChange, totalCm = 29.7 }: VerticalRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<'top' | 'bottom' | null>(null);

  const cmToPct = (cm: number) => (cm / totalCm) * 100;
  const contentCm = totalCm - topMarginCm - bottomMarginCm;

  const handleMouseDown = useCallback((marker: 'top' | 'bottom', e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = marker;

    const onMove = (ev: MouseEvent) => {
      if (!rulerRef.current || !dragging.current) return;
      const rect = rulerRef.current.getBoundingClientRect();
      const relY = ev.clientY - rect.top;
      const cm = Math.round(((relY / rect.height) * totalCm) * 4) / 4;

      if (dragging.current === 'top') {
        onTopMarginChange?.(Math.max(0.5, Math.min(cm, totalCm - bottomMarginCm - 5)));
      } else {
        const fromBottom = totalCm - cm;
        onBottomMarginChange?.(Math.max(0.5, Math.min(fromBottom, totalCm - topMarginCm - 5)));
      }
    };

    const onUp = () => {
      dragging.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [topMarginCm, bottomMarginCm, onTopMarginChange, onBottomMarginChange, totalCm]);

  const topPct = cmToPct(topMarginCm);
  const bottomPct = cmToPct(bottomMarginCm);

  // Build tick marks — numbers relative to top margin
  const ticks: React.ReactNode[] = [];
  for (let i = 0; i <= Math.floor(totalCm); i++) {
    const pct = cmToPct(i);
    const isInTopMargin = i < topMarginCm;
    const isInBottomMargin = i > (totalCm - bottomMarginCm);
    const isMargin = isInTopMargin || isInBottomMargin;

    let label: number | null = null;
    if (!isMargin) {
      const rel = Math.round(i - topMarginCm);
      if (rel >= 0 && rel <= Math.round(contentCm)) label = rel;
    }

    // Full cm tick
    ticks.push(
      <div key={`v${i}`} className="absolute left-0 right-0" style={{ top: `${pct}%` }}>
        <div className={`h-px ml-auto ${isMargin ? 'bg-foreground/10' : 'bg-foreground/30'}`} style={{ width: 10 }} />
        {label !== null && label > 0 && (
          <span className="absolute text-[7px] leading-none select-none text-muted-foreground/70 -translate-y-1/2"
            style={{ right: 12, top: 0 }}>
            {label}
          </span>
        )}
      </div>
    );

    // Half-cm tick
    if (i < totalCm) {
      ticks.push(
        <div key={`vh${i}`} className="absolute left-0 right-0" style={{ top: `${cmToPct(i + 0.5)}%` }}>
          <div className={`h-px ml-auto ${isMargin ? 'bg-foreground/8' : 'bg-foreground/20'}`} style={{ width: 6 }} />
        </div>
      );
    }
  }

  return (
    <div ref={rulerRef} className="w-5 bg-card border-r border-border/50 relative select-none shrink-0"
      style={{ height: heightPx }}>
      {/* Top margin shading */}
      <div className="absolute top-0 left-0 right-0 bg-muted/70" style={{ height: `${topPct}%` }} />
      {/* Bottom margin shading */}
      <div className="absolute bottom-0 left-0 right-0 bg-muted/70" style={{ height: `${bottomPct}%` }} />

      {ticks}

      {/* Top margin drag handle */}
      <div className="absolute left-0 right-0 z-10 cursor-ns-resize" style={{ top: `${topPct}%` }}
        onMouseDown={(e) => handleMouseDown('top', e)} title={`Margem superior: ${topMarginCm.toFixed(1)}cm`}>
        <div className="h-[3px] w-full" style={{ background: 'hsl(var(--foreground) / 0.25)' }} />
      </div>

      {/* Bottom margin drag handle */}
      <div className="absolute left-0 right-0 z-10 cursor-ns-resize" style={{ top: `${100 - bottomPct}%` }}
        onMouseDown={(e) => handleMouseDown('bottom', e)} title={`Margem inferior: ${bottomMarginCm.toFixed(1)}cm`}>
        <div className="h-[3px] w-full" style={{ background: 'hsl(var(--foreground) / 0.25)' }} />
      </div>
    </div>
  );
}

export const DEFAULT_MARGINS: RulerMargins = {
  leftMarginCm: DEFAULT_LEFT_MARGIN_CM,
  rightMarginCm: DEFAULT_RIGHT_MARGIN_CM,
  firstLineIndentCm: 0,
  hangingIndentCm: 0,
};
