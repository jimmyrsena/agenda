import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, Indent, Outdent,
  Heading1, Code, Quote, Link, Image, Minus, Table,
  Undo2, Redo2, Scissors, Copy, ClipboardPaste,
  Highlighter, Type, Eraser,
  ChevronDown, FileText, LayoutGrid,
  Search, SpellCheck, BookOpen,
  Sigma, Hash, Paperclip,
  AlertTriangle, CheckCircle, XCircle, Pin, Info,
  ArrowDownToLine, ArrowUpToLine,
  Pilcrow, CornerDownLeft, SquareCode,
  Maximize2, Minimize2, Plus, X, Paintbrush,
  Eye, EyeOff, MousePointer, Columns, Replace,
  MessageSquare, PanelLeft, BarChart3, Settings2,
  Droplets, RotateCw, FileUp, Printer,
  Pen, Palette, Ruler, Grid3X3, ZoomIn, ZoomOut,
  FileDown, FilePlus, Bookmark, BookMarked, ListTree,
  Languages, CaseSensitive, CaseUpper, CaseLower,
  Baseline, WrapText, AlignVerticalSpaceAround,
  PencilLine, PenTool, Circle, Square, Triangle, Diamond, Hexagon,
  SeparatorHorizontal, LayoutDashboard, GalleryVerticalEnd,
  Rows3, Rows4, SlidersHorizontal, Focus, Fullscreen,
  History, Wand2, Sparkles,
  Volume2, Accessibility, ShieldCheck, GitCompare, Camera,
  MonitorSmartphone, Hash as HashIcon, Mic,
} from "lucide-react";
import { NoteTag } from "@/types/study";
import type { Editor } from "@tiptap/core";
import { PAPER_SIZES } from "./paperSizes";

interface Props {
  editor: Editor | null;
  onFocusMode: () => void;
  wordCount: number;
  charCount: number;
  noteTags?: NoteTag[];
  selectedTags?: string[];
  onToggleTag?: (id: string) => void;
  onAddTag?: (tag: NoteTag) => void;
  onDeleteTag?: (id: string) => void;
  showRuler?: boolean;
  onToggleRuler?: () => void;
  onFindReplace?: () => void;
  onImageInsert?: () => void;
  onShowComments?: () => void;
  onShowNavPane?: () => void;
  onShowWordStats?: () => void;
  onShowPageSetup?: () => void;
  onShowEquation?: () => void;
  onShowShapes?: () => void;
  onShowTextBox?: () => void;
  onInsertResizableImage?: (src: string) => void;
  showNavPane?: boolean;
  showComments?: boolean;
  lineSpacing?: number;
  onLineSpacingChange?: (v: number) => void;
  columns?: number;
  onColumnsChange?: (v: number) => void;
  watermark?: string;
  onWatermarkChange?: (v: string) => void;
  orientation?: 'portrait' | 'landscape';
  onOrientationChange?: (v: 'portrait' | 'landscape') => void;
  paperSize?: string;
  onPaperSizeChange?: (v: string) => void;
  commentCount?: number;
  zoom?: number;
  onZoomChange?: (v: number) => void;
  pageColor?: string;
  onPageColorChange?: (v: string) => void;
  onShowABNT?: () => void;
  onShowPDFExport?: () => void;
  onShowVersionHistory?: () => void;
  // NEW props
  onShowReadAloud?: () => void;
  onShowTranslate?: () => void;
  onShowAccessibility?: () => void;
  onShowCompare?: () => void;
  onScreenCapture?: () => void;
  lineNumbers?: boolean;
  onToggleLineNumbers?: () => void;
  trackChanges?: boolean;
  onToggleTrackChanges?: () => void;
  formatBrushActive?: boolean;
  onFormatBrush?: () => void;
  drawingActive?: boolean;
  onToggleDrawing?: () => void;
  onClearDrawing?: () => void;
  drawTool?: string;
  onDrawToolChange?: (tool: string) => void;
  drawColor?: string;
  onDrawColorChange?: (color: string) => void;
  drawWidth?: number;
  onDrawWidthChange?: (width: number) => void;
  hyphenation?: boolean;
  onHyphenationChange?: (v: boolean) => void;
  paragraphIndentLeft?: number;
  onParagraphIndentLeftChange?: (v: number) => void;
  paragraphIndentRight?: number;
  onParagraphIndentRightChange?: (v: number) => void;
  spacingBefore?: number;
  onSpacingBeforeChange?: (v: number) => void;
  spacingAfter?: number;
  onSpacingAfterChange?: (v: number) => void;
  pageBorder?: string;
  onPageBorderChange?: (v: string) => void;
  onFileAttach?: (file: File) => void;
  onShowAbout?: () => void;
}

type RibbonTab = 'arquivo' | 'home' | 'insert' | 'desenhar' | 'design' | 'layout' | 'referencias' | 'revisao' | 'exibir' | 'ajuda';

const FONT_FAMILIES = [
  'Inter', 'Arial', 'Calibri', 'Cambria', 'Comic Sans MS', 'Courier New',
  'Georgia', 'Helvetica', 'Impact', 'Lucida Console', 'Palatino',
  'Segoe UI', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
];

const FONT_SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '36', '48', '72'];

const TEXT_COLORS = [
  { name: 'Preto', hex: '#000000' }, { name: 'Vermelho Escuro', hex: '#c00000' },
  { name: 'Vermelho', hex: '#ff0000' }, { name: 'Laranja', hex: '#ffc000' },
  { name: 'Amarelo', hex: '#ffff00' }, { name: 'Verde Claro', hex: '#92d050' },
  { name: 'Verde', hex: '#00b050' }, { name: 'Azul Claro', hex: '#00b0f0' },
  { name: 'Azul', hex: '#0070c0' }, { name: 'Azul Escuro', hex: '#002060' },
  { name: 'Roxo', hex: '#7030a0' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Amarelo', hex: '#ffff00' }, { name: 'Verde', hex: '#00ff00' },
  { name: 'Ciano', hex: '#00ffff' }, { name: 'Rosa', hex: '#ff00ff' },
  { name: 'Azul', hex: '#93c5fd' }, { name: 'Vermelho', hex: '#fca5a5' },
  { name: 'Cinza', hex: '#c0c0c0' },
];

const SPECIAL_CHARS = [
  '→','←','↑','↓','⇒','⇔','≠','≤','≥','±','×','÷','∞','√','∑','∫',
  'π','Δ','α','β','γ','θ','λ','μ','σ','φ','ω','°','©','®','™','€','£','¥',
];

const CALLOUTS = [
  { icon: '💡', label: 'Dica', content: '<blockquote><p>💡 <strong>Dica:</strong> </p></blockquote>' },
  { icon: '⚠️', label: 'Atenção', content: '<blockquote><p>⚠️ <strong>Atenção:</strong> </p></blockquote>' },
  { icon: '✅', label: 'Importante', content: '<blockquote><p>✅ <strong>Importante:</strong> </p></blockquote>' },
  { icon: '❌', label: 'Erro Comum', content: '<blockquote><p>❌ <strong>Erro Comum:</strong> </p></blockquote>' },
  { icon: '📌', label: 'Lembrar', content: '<blockquote><p>📌 <strong>Lembrar:</strong> </p></blockquote>' },
  { icon: '🔑', label: 'Conceito-chave', content: '<blockquote><p>🔑 <strong>Conceito-chave:</strong> </p></blockquote>' },
];

const WATERMARKS = ['', 'RASCUNHO', 'CONFIDENCIAL', 'NÃO COPIAR', 'URGENTE', 'AMOSTRA', 'PRELIMINAR'];

const LINE_SPACINGS = [
  { label: '1.0', value: 1 }, { label: '1.15', value: 1.15 }, { label: '1.5', value: 1.5 },
  { label: '2.0', value: 2 }, { label: '2.5', value: 2.5 }, { label: '3.0', value: 3 },
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

const MARGIN_PRESETS = [
  { name: 'Normal', top: 2.5, bottom: 2, left: 3, right: 2 },
  { name: 'Estreita', top: 1.27, bottom: 1.27, left: 1.27, right: 1.27 },
  { name: 'ABNT', top: 3, bottom: 2, left: 3, right: 2 },
  { name: 'Larga', top: 2.54, bottom: 2.54, left: 5.08, right: 5.08 },
];

const DRAWING_TOOLS = [
  { icon: PencilLine, label: 'Lápis', desc: 'Traço livre à mão' },
  { icon: Pen, label: 'Caneta', desc: 'Traço suave' },
  { icon: Highlighter, label: 'Marca-texto', desc: 'Realce semitransparente' },
  { icon: Eraser, label: 'Borracha', desc: 'Apagar traços' },
];

const DRAWING_COLORS = ['#000000', '#c00000', '#ff0000', '#0070c0', '#00b050', '#7030a0', '#ffc000'];
const STROKE_WIDTHS = [1, 2, 4, 8];

const SMARTART_TYPES = [
  { label: 'Lista', icon: '📋', html: '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>' },
  { label: 'Processo', icon: '➡️', html: '<p>Etapa 1 → Etapa 2 → Etapa 3 → Resultado</p>' },
  { label: 'Ciclo', icon: '🔄', html: '<p>Fase A → Fase B → Fase C → Fase D → (volta para Fase A)</p>' },
  { label: 'Hierarquia', icon: '🏛️', html: '<h3>Nível 1</h3><p style="margin-left: 20px">├─ Nível 2A</p><p style="margin-left: 40px">│  ├─ Nível 3A</p><p style="margin-left: 40px">│  └─ Nível 3B</p><p style="margin-left: 20px">└─ Nível 2B</p>' },
  { label: 'Relação', icon: '🔗', html: '<p><strong>Conceito A</strong> ⟷ <strong>Conceito B</strong></p><p>↕</p><p><strong>Conceito C</strong> ⟷ <strong>Conceito D</strong></p>' },
  { label: 'Pirâmide', icon: '🔺', html: '<p style="text-align:center">▲ Topo</p><p style="text-align:center">◆ Meio</p><p style="text-align:center">████ Base ████</p>' },
];

function Tb({ icon: Icon, label, onClick, active, disabled, className, children }: {
  icon?: any; label: string; onClick: () => void; active?: boolean; disabled?: boolean; className?: string; children?: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={`inline-flex items-center justify-center h-6 w-6 rounded-[3px] text-foreground/80 transition-colors
            ${active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60'}
            ${disabled ? 'opacity-40 pointer-events-none' : ''}
            ${className || ''}`}
          onClick={onClick} disabled={disabled}>
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-[10px]">{label}</TooltipContent>
    </Tooltip>
  );
}

function RGroup({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      <div className="flex items-start gap-px flex-1 py-0.5">{children}</div>
      <div className="text-[9px] text-muted-foreground text-center border-t border-border/40 pt-px pb-0.5 leading-none">{label}</div>
    </div>
  );
}

function Sep() { return <div className="w-px self-stretch bg-border/60 mx-1" />; }

function BigBtn({ icon: Icon, label, onClick, active, badge, disabled }: { icon: any; label: string; onClick: () => void; active?: boolean; badge?: number; disabled?: boolean }) {
  return (
    <button className={`flex flex-col items-center justify-center h-[42px] w-14 rounded-[3px] gap-0.5 relative
      ${active ? 'bg-accent' : 'hover:bg-accent/60'} ${disabled ? 'opacity-40 pointer-events-none' : ''}`} onClick={onClick} disabled={disabled}>
      <Icon className="h-5 w-5 text-foreground/80" />
      <span className="text-[8px] text-foreground/70">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center">{badge}</span>
      )}
    </button>
  );
}

function TableGridSelector({ onSelect }: { onSelect: (rows: number, cols: number) => void }) {
  const [hover, setHover] = useState({ r: 0, c: 0 });
  return (
    <div className="p-2" onPointerDown={(e) => e.stopPropagation()}>
      <p className="text-[10px] text-muted-foreground mb-1">{hover.r > 0 ? `${hover.r} × ${hover.c}` : 'Selecione tamanho'}</p>
      <div className="grid grid-cols-8 gap-[2px]">
        {Array.from({ length: 64 }, (_, i) => {
          const r = Math.floor(i / 8) + 1;
          const c = (i % 8) + 1;
          return (
            <button key={i}
              className={`w-4 h-3.5 border rounded-sm transition-colors ${r <= hover.r && c <= hover.c ? 'bg-primary/30 border-primary/50' : 'border-border/50 hover:border-primary/30'}`}
              onMouseEnter={() => setHover({ r, c })}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(r, c); }} />
          );
        })}
      </div>
      <div className="border-t mt-2 pt-1.5">
        <button className="w-full text-left text-xs text-muted-foreground hover:text-foreground px-1 py-1 rounded hover:bg-accent/60 transition-colors"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(3, 3); }}>
          📊 Inserir Tabela 3×3
        </button>
        <button className="w-full text-left text-xs text-muted-foreground hover:text-foreground px-1 py-1 rounded hover:bg-accent/60 transition-colors"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(5, 5); }}>
          📊 Inserir Tabela 5×5
        </button>
      </div>
    </div>
  );
}

export function WordRibbon({
  editor, onFocusMode, wordCount, charCount,
  noteTags = [], selectedTags = [], onToggleTag, onAddTag, onDeleteTag,
  showRuler = true, onToggleRuler, onFindReplace,
  onShowComments, onShowNavPane, onShowWordStats, onShowPageSetup,
  onShowEquation, onShowShapes, onShowTextBox, onInsertResizableImage,
  showNavPane, showComments, lineSpacing = 1.5, onLineSpacingChange,
  columns = 1, onColumnsChange, watermark = '', onWatermarkChange,
  orientation = 'portrait', onOrientationChange, paperSize = 'a4', onPaperSizeChange,
  commentCount = 0, zoom = 100, onZoomChange, pageColor = '', onPageColorChange,
  onShowABNT, onShowPDFExport, onShowVersionHistory,
  onShowReadAloud, onShowTranslate, onShowAccessibility,
  onShowCompare, onScreenCapture,
  lineNumbers, onToggleLineNumbers, trackChanges, onToggleTrackChanges,
  formatBrushActive, onFormatBrush,
  drawingActive, onToggleDrawing, onClearDrawing,
  drawTool = '', onDrawToolChange, drawColor = '#000000', onDrawColorChange, drawWidth = 2, onDrawWidthChange,
  hyphenation, onHyphenationChange,
  paragraphIndentLeft = 0, onParagraphIndentLeftChange,
  paragraphIndentRight = 0, onParagraphIndentRightChange,
  spacingBefore = 0, onSpacingBeforeChange,
  spacingAfter = 8, onSpacingAfterChange,
  pageBorder, onPageBorderChange,
  onFileAttach,
  onShowAbout,
}: Props) {
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  const [fontSize, setFontSize] = useState('12');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [tableDropdownOpen, setTableDropdownOpen] = useState(false);
  const [showGridlines, setShowGridlines] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const TAG_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-orange-500'];
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

  if (!editor) return null;

  const tabs: { id: RibbonTab; label: string }[] = [
    { id: 'home', label: 'Página Inicial' },
    { id: 'insert', label: 'Inserir' },
    { id: 'desenhar', label: 'Desenhar' },
    { id: 'design', label: 'Design' },
    { id: 'layout', label: 'Layout' },
    { id: 'referencias', label: 'Referências' },
    { id: 'revisao', label: 'Revisão' },
    { id: 'exibir', label: 'Exibir' },
    { id: 'ajuda', label: 'Ajuda' },
  ];

  const changeFontSize = (size: string) => {
    setFontSize(size);
    if (editor?.view) editor.view.dom.style.fontSize = `${size}pt`;
  };

  const changeFontFamily = (family: string) => {
    setFontFamily(family);
    editor.chain().focus().setFontFamily(family).run();
  };

  const selectAll = () => editor.chain().focus().selectAll().run();

  return (
    <div className="border-t border-b bg-card overflow-hidden select-none">
      {/* TAB BAR */}
      <div className="flex items-center bg-muted/40 border-b overflow-x-auto scrollbar-none">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 text-[11px] font-medium whitespace-nowrap transition-colors relative shrink-0
              ${activeTab === tab.id ? 'text-primary bg-card border-b-2 border-primary -mb-px' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}`}>
            {tab.label}
          </button>
        ))}
        <button onClick={() => onShowAbout?.()} className="px-3 py-1 text-[11px] font-medium whitespace-nowrap transition-colors shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/60">
          Sobre
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-1 px-2 shrink-0">
          <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 px-2" onClick={() => onFindReplace?.()}>
            <Search className="h-3 w-3" /> Localizar
          </Button>
          <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 px-2" onClick={() => onFindReplace?.()}>
            <Replace className="h-3 w-3" /> Substituir
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 px-2" onClick={onFocusMode}>
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* RIBBON CONTENT */}
      <div className="flex items-stretch px-1 min-h-[66px] overflow-x-auto scrollbar-thin bg-card">

        {/* ==================== PÁGINA INICIAL ==================== */}
        {activeTab === 'home' && (
          <>
            <RGroup label="Área de Transferência">
              <div className="flex flex-col gap-px">
                <div className="flex items-center gap-px">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex flex-col items-center justify-center h-[42px] w-11 rounded-[3px] hover:bg-accent/60 text-foreground/80 gap-0.5">
                        <ClipboardPaste className="h-5 w-5" />
                        <span className="text-[8px] leading-none flex items-center gap-0.5">Colar <ChevronDown className="h-2 w-2" /></span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => navigator.clipboard.readText().then(t => editor.chain().focus().insertContent(t).run())} className="text-xs">Colar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigator.clipboard.readText().then(t => editor.chain().focus().insertContent(t).run())} className="text-xs">Colar Somente Texto</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-px">
                  <Tb icon={Scissors} label="Recortar (Ctrl+X)" onClick={() => document.execCommand('cut')} />
                  <Tb icon={Copy} label="Copiar (Ctrl+C)" onClick={() => document.execCommand('copy')} />
                  <Tb icon={Paintbrush} label="Pincel de Formatação" onClick={() => onFormatBrush?.()} active={formatBrushActive} />
                </div>
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Fonte">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-0.5">
                  <Select value={fontFamily} onValueChange={changeFontFamily}>
                    <SelectTrigger className="h-[22px] w-[120px] text-[10px] border-border/50 rounded-[3px] px-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>{FONT_FAMILIES.map(f => <SelectItem key={f} value={f} className="text-xs" style={{ fontFamily: f }}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={fontSize} onValueChange={changeFontSize}>
                    <SelectTrigger className="h-[22px] w-[48px] text-[10px] border-border/50 rounded-[3px] px-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>{FONT_SIZES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <Tb label="Aumentar Fonte" onClick={() => { const idx = FONT_SIZES.indexOf(fontSize); if (idx < FONT_SIZES.length - 1) changeFontSize(FONT_SIZES[idx + 1]); }}>
                    <span className="text-[9px] font-bold">A↑</span>
                  </Tb>
                  <Tb label="Diminuir Fonte" onClick={() => { const idx = FONT_SIZES.indexOf(fontSize); if (idx > 0) changeFontSize(FONT_SIZES[idx - 1]); }}>
                    <span className="text-[9px] font-bold">A↓</span>
                  </Tb>
                  <Tb icon={Eraser} label="Limpar Formatação" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} />
                </div>
                <div className="flex items-center gap-px">
                  <Tb icon={Bold} label="Negrito (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} />
                  <Tb icon={Italic} label="Itálico (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} />
                  <Tb icon={Underline} label="Sublinhado (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} />
                  <Tb icon={Strikethrough} label="Tachado" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} />
                  <Tb icon={Subscript} label="Subscrito" onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} />
                  <Tb icon={Superscript} label="Sobrescrito" onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} />
                  <div className="w-px h-4 bg-border/40 mx-0.5" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex items-center justify-center h-6 w-7 rounded-[3px] hover:bg-accent/60">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold leading-none">A</span>
                          <div className="w-4 h-[3px] rounded-sm" style={{ backgroundColor: '#c00000' }} />
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-44">
                      <DropdownMenuLabel className="text-[10px]">Cor da Fonte</DropdownMenuLabel>
                      <div className="grid grid-cols-6 gap-0.5 p-1">
                        {TEXT_COLORS.map(c => (
                          <button key={c.name} className="w-6 h-6 rounded-sm border border-border/30 hover:ring-2 ring-ring"
                            style={{ backgroundColor: c.hex }} title={c.name}
                            onClick={() => editor.chain().focus().setColor(c.hex).run()} />
                        ))}
                      </div>
                      <DropdownMenuItem onClick={() => editor.chain().focus().unsetColor().run()} className="text-xs mt-1">Remover cor</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex items-center justify-center h-6 w-7 rounded-[3px] hover:bg-accent/60">
                        <div className="flex flex-col items-center">
                          <Highlighter className="h-3 w-3" />
                          <div className="w-4 h-[3px] rounded-sm" style={{ backgroundColor: '#ffff00' }} />
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40">
                      <DropdownMenuLabel className="text-[10px]">Cor de Realce</DropdownMenuLabel>
                      <div className="grid grid-cols-4 gap-0.5 p-1">
                        {HIGHLIGHT_COLORS.map(c => (
                          <button key={c.name} className="w-7 h-6 rounded-sm border border-border/30 hover:ring-2 ring-ring"
                            style={{ backgroundColor: c.hex }} title={c.name}
                            onClick={() => editor.chain().focus().toggleHighlight({ color: c.hex }).run()} />
                        ))}
                      </div>
                      <DropdownMenuItem onClick={() => editor.chain().focus().unsetHighlight().run()} className="text-xs mt-1">Remover realce</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Parágrafo">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-px">
                  <Tb icon={List} label="Marcadores" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} />
                  <Tb icon={ListOrdered} label="Numeração" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} />
                  <Tb icon={CheckSquare} label="Lista de Tarefas" onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} />
                  <div className="w-px h-4 bg-border/40 mx-0.5" />
                  <Tb icon={Outdent} label="Diminuir Recuo" onClick={() => editor.chain().focus().liftListItem('listItem').run()} />
                  <Tb icon={Indent} label="Aumentar Recuo" onClick={() => editor.chain().focus().sinkListItem('listItem').run()} />
                  <Tb icon={Minus} label="Linha Horizontal" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
                </div>
                <div className="flex items-center gap-px">
                  <Tb icon={AlignLeft} label="Alinhar à Esquerda" onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} />
                  <Tb icon={AlignCenter} label="Centralizar" onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} />
                  <Tb icon={AlignRight} label="Alinhar à Direita" onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} />
                  <Tb icon={AlignJustify} label="Justificar" onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} />
                  <div className="w-px h-4 bg-border/40 mx-0.5" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex items-center justify-center h-6 px-1 rounded-[3px] hover:bg-accent/60 text-[9px] gap-0.5">
                        <ArrowDownToLine className="h-3 w-3" /> {lineSpacing}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel className="text-[10px]">Espaçamento entre Linhas</DropdownMenuLabel>
                      {LINE_SPACINGS.map(s => (
                        <DropdownMenuItem key={s.value} onClick={() => onLineSpacingChange?.(s.value)}
                          className={`text-xs ${lineSpacing === s.value ? 'bg-accent' : ''}`}>{s.label}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Tb icon={Quote} label="Citação" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} />
                </div>
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Estilos" className="min-w-[200px]">
              <div className="flex items-center gap-1 px-1">
                {[
                  { name: 'Normal', level: 0, font: 'text-sm' },
                  { name: 'Título 1', level: 1, font: 'text-lg font-bold' },
                  { name: 'Título 2', level: 2, font: 'text-base font-semibold' },
                  { name: 'Título 3', level: 3, font: 'text-sm font-medium' },
                  { name: 'Subtítulo', level: 4, font: 'text-sm text-muted-foreground' },
                ].map(style => (
                  <button key={style.name}
                    onClick={() => style.level === 0
                      ? editor.chain().focus().setParagraph().run()
                      : editor.chain().focus().toggleHeading({ level: style.level as 1|2|3|4 }).run()}
                    className={`flex items-center justify-center px-2 py-1 border rounded-[3px] min-w-[55px] h-[42px] transition-colors
                      ${(style.level === 0 && !editor.isActive('heading')) || editor.isActive('heading', { level: style.level })
                        ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50 hover:bg-accent/30'}`}>
                    <span className={`${style.font} leading-tight text-center whitespace-nowrap`}>{style.name}</span>
                  </button>
                ))}
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Editando">
              <div className="flex flex-col gap-0.5">
                <div className="flex gap-px">
                  <Tb icon={Undo2} label="Desfazer (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} />
                  <Tb icon={Redo2} label="Refazer (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />
                </div>
                <div className="flex gap-px">
                  <Tb icon={Code} label="Código Inline" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} />
                  <Tb icon={Link} label="Inserir Link" onClick={() => {
                    const url = window.prompt('URL:');
                    if (url) editor.chain().focus().setLink({ href: url }).run();
                  }} active={editor.isActive('link')} />
                  <Tb icon={MousePointer} label="Selecionar Tudo" onClick={selectAll} />
                </div>
              </div>
            </RGroup>
          </>
        )}

        {/* ==================== INSERIR ==================== */}
        {activeTab === 'insert' && (
          <>
            <RGroup label="Tabelas">
              <DropdownMenu open={tableDropdownOpen} onOpenChange={setTableDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex flex-col items-center justify-center h-[42px] w-12 rounded-[3px] hover:bg-accent/60 gap-0.5">
                    <Table className="h-5 w-5 text-foreground/80" />
                    <span className="text-[8px] text-foreground/70 flex items-center gap-0.5">Tabela <ChevronDown className="h-2 w-2" /></span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
                  <TableGridSelector onSelect={(rows, cols) => {
                    setTableDropdownOpen(false);
                    requestAnimationFrame(() => {
                      editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
                    });
                  }} />
                </DropdownMenuContent>
              </DropdownMenu>
            </RGroup>
            <Sep />
            <RGroup label="Ilustrações">
              <div className="flex items-center gap-1">
                <BigBtn icon={Image} label="Imagem" onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file'; input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => onInsertResizableImage?.(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }} />
                <BigBtn icon={Link} label="Img URL" onClick={() => {
                  const url = window.prompt('URL da imagem:');
                  if (url) onInsertResizableImage?.(url);
                }} />
                <BigBtn icon={Camera} label="Captura" onClick={() => onScreenCapture?.()} />
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Formas e Texto">
              <div className="flex items-center gap-1">
                <BigBtn icon={LayoutGrid} label="Formas" onClick={() => onShowShapes?.()} />
                <BigBtn icon={Type} label="Caixa Texto" onClick={() => onShowTextBox?.()} />
              </div>
            </RGroup>
            <Sep />
            <RGroup label="SmartArt / Gráficos">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex flex-col items-center justify-center h-[42px] w-14 rounded-[3px] hover:bg-accent/60 gap-0.5">
                    <LayoutDashboard className="h-5 w-5 text-foreground/80" />
                    <span className="text-[8px] text-foreground/70 flex items-center gap-0.5">SmartArt <ChevronDown className="h-2 w-2" /></span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel className="text-[10px]">Diagramas SmartArt</DropdownMenuLabel>
                  {SMARTART_TYPES.map(s => (
                    <DropdownMenuItem key={s.label} onClick={() => editor.chain().focus().insertContent(s.html).run()} className="text-xs gap-2">
                      <span>{s.icon}</span> {s.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </RGroup>
            <Sep />
            <RGroup label="Equações e Símbolos">
              <div className="flex items-center gap-1">
                <BigBtn icon={Sigma} label="Equação" onClick={() => onShowEquation?.()} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-center justify-center h-[42px] w-12 rounded-[3px] hover:bg-accent/60 gap-0.5">
                      <Hash className="h-5 w-5 text-foreground/80" />
                      <span className="text-[8px] text-foreground/70 flex items-center gap-0.5">Σ Ω <ChevronDown className="h-2 w-2" /></span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64">
                    <DropdownMenuLabel className="text-[10px]">Caracteres Especiais</DropdownMenuLabel>
                    <div className="grid grid-cols-8 gap-0.5 p-1">
                      {SPECIAL_CHARS.map(c => (
                        <button key={c} className="w-7 h-7 rounded hover:bg-accent text-sm font-mono flex items-center justify-center"
                          onClick={() => editor.chain().focus().insertContent(c).run()}>{c}</button>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Links e Mídia">
              <div className="flex items-center gap-1">
                <BigBtn icon={Link} label="Link" onClick={() => { const url = window.prompt('URL:'); if (url) editor.chain().focus().setLink({ href: url }).run(); }} />
                <BigBtn icon={Paperclip} label="Anexo" onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      if (onFileAttach) onFileAttach(file);
                      else toast.success(`Arquivo "${file.name}" anexado!`);
                    }
                  };
                  input.click();
                }} />
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Comentários">
              <BigBtn icon={MessageSquare} label="Comentar" onClick={() => onShowComments?.()} badge={commentCount} active={showComments} />
            </RGroup>
            <Sep />
            <RGroup label="Quebras">
              <div className="flex flex-col gap-0.5">
                <Tb icon={SeparatorHorizontal} label="Quebra de Página" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
                <Tb icon={CornerDownLeft} label="Quebra de Linha" onClick={() => editor.chain().focus().setHardBreak().run()} />
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Código e Callouts">
              <div className="flex items-center gap-1">
                <div className="flex flex-col gap-0.5">
                  <Tb icon={Code} label="Código Inline" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} />
                  <Tb icon={SquareCode} label="Bloco de Código" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-center justify-center h-[42px] w-14 rounded-[3px] hover:bg-accent/60 gap-0.5">
                      <AlertTriangle className="h-5 w-5 text-foreground/80" />
                      <span className="text-[8px] text-foreground/70 flex items-center gap-0.5">Callout <ChevronDown className="h-2 w-2" /></span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {CALLOUTS.map(c => (
                      <DropdownMenuItem key={c.label} onClick={() => editor.chain().focus().insertContent(c.content).run()} className="text-xs gap-2">
                        <span>{c.icon}</span> {c.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </RGroup>
          </>
        )}

        {/* ==================== DESENHAR ==================== */}
        {activeTab === 'desenhar' && (
          <>
            <RGroup label="Ferramentas de Desenho">
              <div className="flex items-center gap-1">
                {DRAWING_TOOLS.map(t => (
                  <Tooltip key={t.label}>
                    <TooltipTrigger asChild>
                      <button className={`flex flex-col items-center justify-center h-[42px] w-12 rounded-[3px] gap-0.5
                        ${drawTool === t.label ? 'bg-accent ring-1 ring-primary' : 'hover:bg-accent/60'}`}
                        onClick={() => {
                          const newTool = drawTool === t.label ? '' : t.label;
                          onDrawToolChange?.(newTool);
                          if (newTool && !drawingActive) onToggleDrawing?.();
                          if (!newTool && drawingActive) onToggleDrawing?.();
                        }}>
                        <t.icon className="h-5 w-5 text-foreground/80" />
                        <span className="text-[8px] text-foreground/70">{t.label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="text-[10px]">{t.desc}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Cor do Traço">
              <div className="flex items-center gap-0.5 px-1">
                {DRAWING_COLORS.map(c => (
                  <button key={c}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${drawColor === c ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-border/50 hover:border-primary/50'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => onDrawColorChange?.(c)} />
                ))}
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Espessura">
              <div className="flex items-center gap-1 px-1">
                {STROKE_WIDTHS.map(w => (
                  <button key={w}
                    className={`flex items-center justify-center h-[42px] w-8 rounded-[3px] ${drawWidth === w ? 'bg-accent' : 'hover:bg-accent/60'}`}
                    onClick={() => onDrawWidthChange?.(w)}>
                    <div className="rounded-full bg-foreground/70" style={{ width: w * 3, height: w * 3 }} />
                  </button>
                ))}
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Formas Rápidas">
              <div className="flex items-center gap-1">
                <BigBtn icon={Circle} label="Círculo" onClick={() => onShowShapes?.()} />
                <BigBtn icon={Square} label="Quadrado" onClick={() => onShowShapes?.()} />
                <BigBtn icon={Triangle} label="Triângulo" onClick={() => onShowShapes?.()} />
                <BigBtn icon={Diamond} label="Losango" onClick={() => onShowShapes?.()} />
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Tela">
              <div className="flex flex-col gap-0.5">
                <Tb icon={Eraser} label="Limpar Tela de Desenho" onClick={() => onClearDrawing?.()} />
                <Tb icon={MousePointer} label="Selecionar Objetos" onClick={() => { onDrawToolChange?.(''); if (drawingActive) onToggleDrawing?.(); }} active={!drawTool} />
              </div>
            </RGroup>
          </>
        )}

        {/* ==================== DESIGN ==================== */}
        {activeTab === 'design' && (
          <>
            <RGroup label="Temas do Documento">
              <div className="flex items-center gap-1 px-1">
                {[
                  { name: 'Padrão', bg: 'bg-card', border: 'border-border', color: '', font: 'Inter' },
                  { name: 'Acadêmico', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200', color: '#fef9ef', font: 'Georgia' },
                  { name: 'Terminal', bg: 'bg-zinc-900', border: 'border-zinc-700', color: '#1a1a2e', font: 'Fira Code' },
                  { name: 'Minimalista', bg: 'bg-stone-50 dark:bg-stone-950/20', border: 'border-stone-200', color: '#f5f5f5', font: 'System UI' },
                  { name: 'Elegante', bg: 'bg-slate-50 dark:bg-slate-900', border: 'border-slate-300', color: '#f0f7ff', font: 'Palatino' },
                ].map(t => (
                  <button key={t.name}
                    onClick={() => {
                      onPageColorChange?.(t.color);
                      editor.chain().focus().setFontFamily(t.font).run();
                      toast.success(`Tema "${t.name}" aplicado`);
                    }}
                    className={`flex flex-col items-center justify-center w-14 h-[42px] rounded border hover:ring-1 ring-primary gap-0.5 ${t.bg} ${t.border} ${pageColor === t.color ? 'ring-2 ring-primary' : ''}`}>
                    <span className="text-[8px] text-foreground/70">{t.name}</span>
                  </button>
                ))}
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Cor da Página">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex flex-col items-center justify-center h-[42px] w-14 rounded-[3px] hover:bg-accent/60 gap-0.5">
                    <Palette className="h-5 w-5 text-foreground/80" />
                    <span className="text-[8px] text-foreground/70">Cor Fundo</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuLabel className="text-[10px]">Cor da Página</DropdownMenuLabel>
                  <div className="flex gap-1 p-1 flex-wrap">
                    {PAGE_COLORS.map(c => (
                      <button key={c.name}
                        className={`w-7 h-7 rounded border ${pageColor === c.value ? 'ring-2 ring-primary' : 'border-border/50'}`}
                        style={{ backgroundColor: c.value || '#ffffff' }}
                        title={c.name}
                        onClick={() => onPageColorChange?.(c.value)} />
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </RGroup>
            <Sep />
            <RGroup label="Marca d'Água">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex flex-col items-center justify-center h-[42px] w-14 rounded-[3px] hover:bg-accent/60 gap-0.5">
                    <Droplets className="h-5 w-5 text-foreground/80" />
                    <span className="text-[8px] text-foreground/70">{watermark || 'Nenhuma'}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel className="text-[10px]">Marca d'Água</DropdownMenuLabel>
                  {WATERMARKS.map(w => (
                    <DropdownMenuItem key={w || 'none'} onClick={() => onWatermarkChange?.(w || 'none')}
                      className={`text-xs ${watermark === w ? 'bg-accent' : ''}`}>{w || 'Nenhuma'}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </RGroup>
            <Sep />
            <RGroup label="Bordas da Página">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex flex-col items-center justify-center h-[42px] w-14 rounded-[3px] hover:bg-accent/60 gap-0.5">
                    <Grid3X3 className="h-5 w-5 text-foreground/80" />
                    <span className="text-[8px] text-foreground/70">Bordas</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel className="text-[10px]">Borda da Página</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onPageBorderChange?.('')} className={`text-xs ${!pageBorder ? 'bg-accent' : ''}`}>Nenhuma</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPageBorderChange?.('1px solid currentColor')} className={`text-xs ${pageBorder === '1px solid currentColor' ? 'bg-accent' : ''}`}>Simples</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPageBorderChange?.('2px solid currentColor')} className={`text-xs ${pageBorder === '2px solid currentColor' ? 'bg-accent' : ''}`}>Grossa</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPageBorderChange?.('2px double currentColor')} className={`text-xs ${pageBorder === '2px double currentColor' ? 'bg-accent' : ''}`}>Dupla</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPageBorderChange?.('2px dashed currentColor')} className={`text-xs ${pageBorder === '2px dashed currentColor' ? 'bg-accent' : ''}`}>Tracejada</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPageBorderChange?.('2px dotted currentColor')} className={`text-xs ${pageBorder === '2px dotted currentColor' ? 'bg-accent' : ''}`}>Pontilhada</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </RGroup>
            <Sep />
            <RGroup label="Plano de Fundo">
              <BigBtn icon={Settings2} label="Configurar" onClick={() => onShowPageSetup?.()} />
            </RGroup>
          </>
        )}

        {/* ==================== LAYOUT ==================== */}
        {activeTab === 'layout' && (
          <>
            <RGroup label="Configurar Página">
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-center justify-center h-[42px] w-14 rounded-[3px] hover:bg-accent/60 gap-0.5">
                      <Ruler className="h-5 w-5 text-foreground/80" />
                      <span className="text-[8px] text-foreground/70 flex items-center gap-0.5">Margens <ChevronDown className="h-2 w-2" /></span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel className="text-[10px]">Predefinições de Margem</DropdownMenuLabel>
                    {MARGIN_PRESETS.map(p => (
                      <DropdownMenuItem key={p.name} className="text-xs" onClick={() => onShowPageSetup?.()}>
                        <span className="font-medium">{p.name}</span>
                        <span className="text-muted-foreground ml-auto text-[10px]">{p.top}/{p.bottom}/{p.left}/{p.right}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onShowPageSetup?.()} className="text-xs">Margens Personalizadas...</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-center justify-center h-[42px] w-14 rounded-[3px] hover:bg-accent/60 gap-0.5">
                      <RotateCw className="h-5 w-5 text-foreground/80" />
                      <span className="text-[8px] text-foreground/70 flex items-center gap-0.5">Orientação <ChevronDown className="h-2 w-2" /></span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onOrientationChange?.('portrait')} className={`text-xs gap-2 ${orientation === 'portrait' ? 'bg-accent' : ''}`}>
                      <div className="w-4 h-5 border-2 border-current rounded-[2px]" /> Retrato
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onOrientationChange?.('landscape')} className={`text-xs gap-2 ${orientation === 'landscape' ? 'bg-accent' : ''}`}>
                      <div className="w-5 h-4 border-2 border-current rounded-[2px]" /> Paisagem
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-center justify-center h-[42px] w-14 rounded-[3px] hover:bg-accent/60 gap-0.5">
                      <FileText className="h-5 w-5 text-foreground/80" />
                      <span className="text-[8px] text-foreground/70 flex items-center gap-0.5">Tamanho <ChevronDown className="h-2 w-2" /></span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel className="text-[10px]">Tamanho do Papel</DropdownMenuLabel>
                    {PAPER_SIZES.map(s => (
                      <DropdownMenuItem key={s.id} onClick={() => onPaperSizeChange?.(s.id)}
                        className={`text-xs ${paperSize === s.id ? 'bg-accent' : ''}`}>
                        {s.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-center justify-center h-[42px] w-14 rounded-[3px] hover:bg-accent/60 gap-0.5">
                      <Columns className="h-5 w-5 text-foreground/80" />
                      <span className="text-[8px] text-foreground/70 flex items-center gap-0.5">Colunas <ChevronDown className="h-2 w-2" /></span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel className="text-[10px]">Colunas</DropdownMenuLabel>
                    {[1, 2, 3].map(c => (
                      <DropdownMenuItem key={c} onClick={() => onColumnsChange?.(c)}
                        className={`text-xs gap-2 ${columns === c ? 'bg-accent' : ''}`}>
                        <div className="flex gap-0.5">{Array.from({ length: c }, (_, i) => <div key={i} className="w-1.5 h-4 border border-current rounded-[1px]" />)}</div>
                        {c === 1 ? 'Uma' : c === 2 ? 'Duas' : 'Três'}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Tabela">
              <BigBtn icon={Grid3X3} label="Grades" onClick={() => {
                const next = !showGridlines;
                setShowGridlines(next);
                const el = document.querySelector('.caderno-paginated-paper');
                if (el) {
                  if (next) el.classList.remove('tiptap-no-gridlines');
                  else el.classList.add('tiptap-no-gridlines');
                }
              }} active={showGridlines} />
            </RGroup>
            <RGroup label="">
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-center justify-center h-[42px] w-14 rounded-[3px] hover:bg-accent/60 gap-0.5">
                      <SeparatorHorizontal className="h-5 w-5 text-foreground/80" />
                      <span className="text-[8px] text-foreground/70 flex items-center gap-0.5">Quebras <ChevronDown className="h-2 w-2" /></span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel className="text-[10px]">Tipos de Quebra</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setHorizontalRule().run()} className="text-xs">Quebra de Página</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setHardBreak().run()} className="text-xs">Quebra de Linha</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().insertContent('<hr><h2>Nova Seção</h2>').run()} className="text-xs">Quebra de Seção</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-center justify-center h-[42px] w-14 rounded-[3px] hover:bg-accent/60 gap-0.5">
                      <Rows3 className="h-5 w-5 text-foreground/80" />
                      <span className="text-[8px] text-foreground/70 flex items-center gap-0.5">Nº Linha <ChevronDown className="h-2 w-2" /></span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onToggleLineNumbers?.()} className={`text-xs ${lineNumbers ? 'bg-accent' : ''}`}>
                      {lineNumbers ? 'Desativar Numeração' : 'Ativar Numeração'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-center justify-center h-[42px] w-14 rounded-[3px] hover:bg-accent/60 gap-0.5">
                      <WrapText className="h-5 w-5 text-foreground/80" />
                      <span className="text-[8px] text-foreground/70 flex items-center gap-0.5">Hifenização <ChevronDown className="h-2 w-2" /></span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel className="text-[10px]">Hifenização</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => { onHyphenationChange?.(true); toast.success('Hifenização automática ativada'); }} className={`text-xs ${hyphenation ? 'bg-accent' : ''}`}>Automática</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { onHyphenationChange?.(false); toast.success('Hifenização desativada'); }} className={`text-xs ${!hyphenation ? 'bg-accent' : ''}`}>Nenhuma</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Recuar">
              <div className="flex flex-col gap-0.5 px-1">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-muted-foreground w-16">À Esquerda:</span>
                  <Input type="number" step="0.5" min="0" value={paragraphIndentLeft} className="h-5 w-16 text-[10px] px-1"
                    onChange={e => onParagraphIndentLeftChange?.(Number(e.target.value))} />
                  <span className="text-[9px] text-muted-foreground">cm</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-muted-foreground w-16">À Direita:</span>
                  <Input type="number" step="0.5" min="0" value={paragraphIndentRight} className="h-5 w-16 text-[10px] px-1"
                    onChange={e => onParagraphIndentRightChange?.(Number(e.target.value))} />
                  <span className="text-[9px] text-muted-foreground">cm</span>
                </div>
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Espaçamento">
              <div className="flex flex-col gap-0.5 px-1">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-muted-foreground w-10">Antes:</span>
                  <Input type="number" step="1" min="0" value={spacingBefore} className="h-5 w-14 text-[10px] px-1"
                    onChange={e => onSpacingBeforeChange?.(Number(e.target.value))} />
                  <span className="text-[9px] text-muted-foreground">pt</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-muted-foreground w-10">Depois:</span>
                  <Input type="number" step="1" min="0" value={spacingAfter} className="h-5 w-14 text-[10px] px-1"
                    onChange={e => onSpacingAfterChange?.(Number(e.target.value))} />
                  <span className="text-[9px] text-muted-foreground">pt</span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex flex-col items-center justify-center h-[42px] w-10 rounded-[3px] hover:bg-accent/60 gap-0.5">
                    <AlignVerticalSpaceAround className="h-4 w-4 text-foreground/80" />
                    <span className="text-[7px] text-foreground/70">{lineSpacing}×</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel className="text-[10px]">Espaçamento entre Linhas</DropdownMenuLabel>
                  {LINE_SPACINGS.map(s => (
                    <DropdownMenuItem key={s.value} onClick={() => onLineSpacingChange?.(s.value)}
                      className={`text-xs ${lineSpacing === s.value ? 'bg-accent' : ''}`}>{s.label}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </RGroup>
          </>
        )}

        {/* ==================== REFERÊNCIAS ==================== */}
        {activeTab === 'referencias' && (
          <>
            <RGroup label="Sumário">
              <BigBtn icon={ListTree} label="Sumário" onClick={() => {
                const headings = editor.getJSON().content?.filter((n: any) => n.type === 'heading') || [];
                let tocHtml = '<h2>Sumário</h2>';
                headings.forEach((h: any) => {
                  const text = h.content?.map((c: any) => c.text).join('') || '';
                  const level = h.attrs?.level || 1;
                  const indent = (level - 1) * 20;
                  tocHtml += `<p style="margin-left: ${indent}px">${text}</p>`;
                });
                editor.chain().focus().insertContent(tocHtml).run();
                toast.success('Sumário inserido!');
              }} />
            </RGroup>
            <Sep />
            <RGroup label="Notas de Rodapé">
              <div className="flex items-center gap-1">
                <BigBtn icon={ArrowDownToLine} label="Nota Rodapé" onClick={() => {
                  const noteNum = (editor.getText().match(/\[\d+\]/g)?.length || 0) + 1;
                  const noteText = window.prompt(`Texto da nota de rodapé [${noteNum}]:`);
                  if (noteText) {
                    editor.chain().focus().insertContent(`<sup>[${noteNum}]</sup>`).run();
                    const currentHtml = editor.getHTML();
                    const hasFootnotes = currentHtml.includes('Notas de Rodapé');
                    const section = hasFootnotes ? '' : '<hr><p><strong>Notas de Rodapé</strong></p>';
                    editor.commands.setContent(currentHtml + `${section}<p><sup>[${noteNum}]</sup> ${noteText}</p>`);
                    toast.success('Nota de rodapé inserida!');
                  }
                }} />
                <BigBtn icon={ArrowUpToLine} label="Nota Final" onClick={() => {
                  const noteNum = (editor.getText().match(/\[\d+\]/g)?.length || 0) + 1;
                  const noteText = window.prompt(`Texto da nota final [${noteNum}]:`);
                  if (noteText) {
                    editor.chain().focus().insertContent(`<sup>[${noteNum}]</sup>`).run();
                    const currentHtml = editor.getHTML();
                    const hasEndnotes = currentHtml.includes('Notas Finais');
                    const section = hasEndnotes ? '' : '<hr><p><strong>Notas Finais</strong></p>';
                    editor.commands.setContent(currentHtml + `${section}<p><sup>[${noteNum}]</sup> ${noteText}</p>`);
                    toast.success('Nota final inserida!');
                  }
                }} />
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Citações ABNT">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex flex-col items-center justify-center h-[42px] w-16 rounded-[3px] hover:bg-accent/60 gap-0.5">
                    <Quote className="h-5 w-5 text-foreground/80" />
                    <span className="text-[8px] text-foreground/70 flex items-center gap-0.5">Citação <ChevronDown className="h-2 w-2" /></span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72">
                  <DropdownMenuLabel className="text-[10px]">Tipos de Citação ABNT</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => editor.chain().focus().insertContent('(SOBRENOME, ano, p. XX)').run()} className="text-xs">
                    Indireta — (AUTOR, ano)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().insertContent('"Citação direta curta" (SOBRENOME, ano, p. XX).').run()} className="text-xs">
                    Direta Curta — "entre aspas"
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().insertContent('<blockquote><p>"Texto da citação direta longa com mais de três linhas, formatada com recuo de 4cm, fonte menor e sem aspas." (SOBRENOME, ano, p. XX).</p></blockquote>').run()} className="text-xs">
                    Direta Longa — bloco recuado
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => editor.chain().focus().insertContent('<p><em>apud</em> SOBRENOME (ano, p. XX)</p>').run()} className="text-xs">
                    Citação Apud — fonte secundária
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </RGroup>
            <Sep />
            <RGroup label="Referências">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex flex-col items-center justify-center h-[42px] w-16 rounded-[3px] hover:bg-accent/60 gap-0.5">
                    <BookMarked className="h-5 w-5 text-foreground/80" />
                    <span className="text-[8px] text-foreground/70 flex items-center gap-0.5">Referência <ChevronDown className="h-2 w-2" /></span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80">
                  <DropdownMenuLabel className="text-[10px]">Inserir Referência ABNT</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => editor.chain().focus().insertContent('<p>SOBRENOME, Nome. <strong>Título da obra</strong>. Edição. Local: Editora, Ano.</p>').run()} className="text-xs">
                    📕 Livro
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().insertContent('<p>SOBRENOME, Nome. Título do artigo. <strong>Nome da Revista</strong>, v. X, n. X, p. XX-XX, Ano.</p>').run()} className="text-xs">
                    📄 Artigo de Periódico
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().insertContent('<p>SOBRENOME, Nome. <strong>Título do trabalho</strong>. Ano. Dissertação (Mestrado) – Instituição, Cidade, Ano.</p>').run()} className="text-xs">
                    🎓 Tese/Dissertação
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().insertContent('<p>SOBRENOME, Nome. Título da página. <strong>Nome do site</strong>, Ano. Disponível em: &lt;URL&gt;. Acesso em: DD mês. Ano.</p>').run()} className="text-xs">
                    🌐 Site/Internet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </RGroup>
            <Sep />
            <RGroup label="Legendas e Índice">
              <div className="flex items-center gap-1">
                <BigBtn icon={Bookmark} label="Legenda" onClick={() => {
                  editor.chain().focus().insertContent('<p><em>Figura X — Descrição da figura</em></p>').run();
                }} />
                <BigBtn icon={FileText} label="Índice Fig." onClick={() => {
                  editor.chain().focus().insertContent('<h3>Lista de Figuras</h3><p><em>Figura 1 — ..................... p. X</em></p>').run();
                }} />
                <BigBtn icon={ListOrdered} label="Índ. Remissivo" onClick={() => {
                  const doc = editor.getJSON();
                  const terms = new Set<string>();
                  const extractTerms = (nodes: any[]) => {
                    for (const node of nodes) {
                      if (node.type === 'heading' && node.content) {
                        const text = node.content.map((c: any) => c.text || '').join('');
                        if (text.trim()) terms.add(text.trim());
                      }
                      if (node.marks?.some((m: any) => m.type === 'bold') && node.text) {
                        terms.add(node.text.trim());
                      }
                      if (node.content) extractTerms(node.content);
                    }
                  };
                  if (doc.content) extractTerms(doc.content);
                  if (terms.size === 0) { toast.info('Adicione títulos ou texto em negrito para gerar o índice automaticamente.'); return; }
                  const sorted = Array.from(terms).sort((a, b) => a.localeCompare(b, 'pt'));
                  let indexHtml = '<h3>Índice Remissivo</h3>';
                  sorted.forEach(t => { indexHtml += `<p>${t} ........................ p. __</p>`; });
                  editor.chain().focus().insertContent(indexHtml).run();
                  toast.success(`Índice remissivo gerado com ${terms.size} termos!`);
                }} />
              </div>
            </RGroup>
            <Sep />
            <RGroup label="ABNT">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex flex-col items-center justify-center h-[42px] w-12 rounded-[3px] hover:bg-accent/60 gap-0.5">
                    <Info className="h-5 w-5 text-foreground/80" />
                    <span className="text-[8px] text-foreground/70">ABNT</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72">
                  <div className="p-2.5 text-[10px] text-muted-foreground space-y-1.5">
                    <p className="font-semibold text-foreground text-xs mb-2">📋 Guia Rápido ABNT NBR 14724</p>
                    <p><strong>Fonte:</strong> Times New Roman ou Arial, 12pt</p>
                    <p><strong>Espaçamento:</strong> 1,5 entre linhas</p>
                    <p><strong>Margens:</strong> Sup/Esq 3cm, Inf/Dir 2cm</p>
                    <p><strong>Parágrafo:</strong> Recuo 1,25cm na primeira linha</p>
                    <p><strong>Citação longa:</strong> Recuo 4cm, fonte 10pt, espaçamento simples</p>
                    <p><strong>Paginação:</strong> Números arábicos a partir da introdução</p>
                    <DropdownMenuSeparator />
                    <p className="text-primary text-[9px]">Dica: Use aba Revisão → ABNT para aplicar rapidamente.</p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </RGroup>
          </>
        )}

        {/* ==================== REVISÃO ==================== */}
        {activeTab === 'revisao' && (
          <>
            <RGroup label="Ferramentas">
              <div className="flex items-center gap-1">
                <BigBtn icon={Languages} label="Traduzir" onClick={() => onShowTranslate?.()} />
                <BigBtn icon={Volume2} label="Ler em Voz Alta" onClick={() => onShowReadAloud?.()} />
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Formatação">
              <div className="flex items-center gap-1">
                <BigBtn icon={BookOpen} label="ABNT" onClick={() => onShowABNT?.()} />
                <BigBtn icon={FileDown} label="Exportar PDF" onClick={() => onShowPDFExport?.()} />
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Controle de Alterações">
              <div className="flex items-center gap-1">
                <BigBtn icon={Eye} label="Rastrear" onClick={() => onToggleTrackChanges?.()} active={trackChanges} />
                <BigBtn icon={GitCompare} label="Comparar" onClick={() => onShowCompare?.()} />
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Localizar">
              <div className="flex items-center gap-1">
                <BigBtn icon={Search} label="Localizar" onClick={() => onFindReplace?.()} />
                <BigBtn icon={Replace} label="Substituir" onClick={() => onFindReplace?.()} />
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Texto">
              <div className="flex items-center gap-1">
                <BigBtn icon={Highlighter} label="Realçar" onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffff00' }).run()} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-center justify-center h-[42px] w-14 rounded-[3px] hover:bg-accent/60 gap-0.5">
                      <CaseUpper className="h-5 w-5 text-foreground/80" />
                      <span className="text-[8px] text-foreground/70 flex items-center gap-0.5">Maiúsc. <ChevronDown className="h-2 w-2" /></span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel className="text-[10px]">Transformar Texto</DropdownMenuLabel>
                    <DropdownMenuItem className="text-xs" onClick={() => {
                      const { from, to } = editor.state.selection;
                      const text = editor.state.doc.textBetween(from, to);
                      if (text) editor.chain().focus().insertContentAt({ from, to }, text.toUpperCase()).run();
                    }}>MAIÚSCULAS</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs" onClick={() => {
                      const { from, to } = editor.state.selection;
                      const text = editor.state.doc.textBetween(from, to);
                      if (text) editor.chain().focus().insertContentAt({ from, to }, text.toLowerCase()).run();
                    }}>minúsculas</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs" onClick={() => {
                      const { from, to } = editor.state.selection;
                      const text = editor.state.doc.textBetween(from, to);
                      if (text) {
                        const capitalized = text.replace(/\b\w/g, l => l.toUpperCase());
                        editor.chain().focus().insertContentAt({ from, to }, capitalized).run();
                      }
                    }}>Cada Palavra Maiúscula</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Comentários">
              <div className="flex items-center gap-1">
                <BigBtn icon={MessageSquare} label="Comentar" onClick={() => onShowComments?.()} badge={commentCount} active={showComments} />
                <BigBtn icon={CheckCircle} label="Resolver" onClick={() => onShowComments?.()} />
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Contagem">
              <div className="flex flex-col gap-0.5 px-2 text-[10px] text-muted-foreground cursor-pointer" onClick={() => onShowWordStats?.()}>
                <span className="font-medium text-foreground">{wordCount} palavras</span>
                <span>{charCount} chars</span>
                <span className="text-primary hover:underline">Estatísticas →</span>
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Tags da Nota">
              <div className="flex flex-col gap-0.5 max-w-[300px]">
                <div className="flex items-center gap-0.5 flex-wrap">
                  {noteTags.map(tag => (
                    <Badge key={tag.id} variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className={`text-[8px] cursor-pointer h-5 gap-0.5 ${selectedTags.includes(tag.id) ? `${tag.color} text-white border-0` : ''}`}
                      onClick={() => onToggleTag?.(tag.id)}>
                      {tag.name}
                      <button className="ml-0.5 hover:text-destructive" onClick={e => { e.stopPropagation(); onDeleteTag?.(tag.id); }}>
                        <X className="h-2 w-2" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-0.5">
                  <Input value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="Nova tag..."
                    className="h-5 w-16 text-[9px] px-1" onKeyDown={e => {
                      if (e.key === 'Enter' && newTagName.trim()) {
                        onAddTag?.({ id: crypto.randomUUID(), name: newTagName.trim(), color: newTagColor });
                        setNewTagName('');
                      }
                    }} />
                  {TAG_COLORS.slice(0, 4).map(c => (
                    <button key={c} className={`w-3 h-3 rounded-full ${c} ${newTagColor === c ? 'ring-1 ring-ring ring-offset-1' : ''}`}
                      onClick={() => setNewTagColor(c)} />
                  ))}
                  <Tb icon={Plus} label="Adicionar Tag" onClick={() => {
                    if (newTagName.trim()) { onAddTag?.({ id: crypto.randomUUID(), name: newTagName.trim(), color: newTagColor }); setNewTagName(''); }
                  }} />
                </div>
              </div>
            </RGroup>
          </>
        )}

        {/* ==================== EXIBIR ==================== */}
        {activeTab === 'exibir' && (
          <>
            <RGroup label="Modos de Exibição">
              <div className="flex items-center gap-1">
                <BigBtn icon={FileText} label="Layout" onClick={() => {}} active />
                <BigBtn icon={Maximize2} label="Foco" onClick={onFocusMode} />
                <BigBtn icon={Fullscreen} label="Tela Cheia" onClick={() => {
                  if (document.fullscreenElement) document.exitFullscreen();
                  else document.documentElement.requestFullscreen();
                }} />
              </div>
            </RGroup>
            <Sep />
            <Sep />
            <RGroup label="Acessibilidade">
              <div className="flex items-center gap-1">
                <BigBtn icon={Volume2} label="Ler em Voz Alta" onClick={() => onShowReadAloud?.()} />
                <BigBtn icon={Accessibility} label="Verificar" onClick={() => onShowAccessibility?.()} />
                <BigBtn icon={Languages} label="Traduzir" onClick={() => onShowTranslate?.()} />
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Histórico">
              <BigBtn icon={History} label="Versões" onClick={() => onShowVersionHistory?.()} />
            </RGroup>
            <Sep />
            <RGroup label="Painéis">
              <div className="flex items-center gap-1">
                <BigBtn icon={PanelLeft} label="Navegação" onClick={() => onShowNavPane?.()} active={showNavPane} />
                <BigBtn icon={MessageSquare} label="Comentários" onClick={() => onShowComments?.()} active={showComments} badge={commentCount} />
                <BigBtn icon={BarChart3} label="Estatísticas" onClick={() => onShowWordStats?.()} />
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Mostrar/Ocultar">
              <div className="flex flex-col gap-0.5 px-1">
                <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
                  <input type="checkbox" checked={showRuler} onChange={() => onToggleRuler?.()} className="w-3 h-3 rounded" />
                  Régua
                </label>
                <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
                  <input type="checkbox" checked={!!lineNumbers} onChange={() => onToggleLineNumbers?.()} className="w-3 h-3 rounded" />
                  Nº Linhas
                </label>
                <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
                  <input type="checkbox" checked={!!watermark} onChange={() => onWatermarkChange?.(watermark ? 'none' : 'RASCUNHO')} className="w-3 h-3 rounded" />
                  Marca d'Água
                </label>
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Zoom">
              <div className="flex items-center gap-1">
                <Tb icon={ZoomOut} label="Diminuir Zoom" onClick={() => onZoomChange?.(Math.max(50, (zoom || 100) - 10))} />
                <span className="text-[10px] text-foreground/70 w-8 text-center">{zoom}%</span>
                <Tb icon={ZoomIn} label="Aumentar Zoom" onClick={() => onZoomChange?.(Math.min(200, (zoom || 100) + 10))} />
                <div className="w-px h-4 bg-border/40 mx-0.5" />
                <button className="text-[9px] text-foreground/70 hover:text-foreground px-1" onClick={() => onZoomChange?.(100)}>100%</button>
                <button className="text-[9px] text-foreground/70 hover:text-foreground px-1" onClick={() => onZoomChange?.(75)}>75%</button>
                <button className="text-[9px] text-foreground/70 hover:text-foreground px-1" onClick={() => onZoomChange?.(150)}>150%</button>
              </div>
            </RGroup>
          </>
        )}

        {/* ==================== AJUDA ==================== */}
        {activeTab === 'ajuda' && (
          <>
            <RGroup label="Arquivo">
              <div className="grid grid-cols-1 gap-y-[3px] px-2 min-w-[130px]">
                {[
                  ['Novo', 'Ctrl+N'],
                  ['Salvar', 'Ctrl+S'],
                  ['Salvar Como', 'Ctrl+⇧+S'],
                  ['Imprimir', 'Ctrl+P'],
                ].map(([l, k]) => (
                  <div key={l} className="flex items-center justify-between gap-3 text-[10px]">
                    <span className="text-muted-foreground">{l}</span>
                    <kbd className="font-mono text-[9px] bg-muted border border-border px-1.5 py-[1px] rounded shadow-[0_1px_0_hsl(var(--border))]">{k}</kbd>
                  </div>
                ))}
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Edição">
              <div className="grid grid-cols-1 gap-y-[3px] px-2 min-w-[130px]">
                {[
                  ['Desfazer', 'Ctrl+Z'],
                  ['Refazer', 'Ctrl+Y'],
                  ['Buscar', 'Ctrl+F'],
                  ['Paleta', 'Ctrl+K'],
                ].map(([l, k]) => (
                  <div key={l} className="flex items-center justify-between gap-3 text-[10px]">
                    <span className="text-muted-foreground">{l}</span>
                    <kbd className="font-mono text-[9px] bg-muted border border-border px-1.5 py-[1px] rounded shadow-[0_1px_0_hsl(var(--border))]">{k}</kbd>
                  </div>
                ))}
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Formatação">
              <div className="grid grid-cols-1 gap-y-[3px] px-2 min-w-[120px]">
                {[
                  ['Negrito', 'Ctrl+B'],
                  ['Itálico', 'Ctrl+I'],
                  ['Sublinhado', 'Ctrl+U'],
                ].map(([l, k]) => (
                  <div key={l} className="flex items-center justify-between gap-3 text-[10px]">
                    <span className="text-muted-foreground">{l}</span>
                    <kbd className="font-mono text-[9px] bg-muted border border-border px-1.5 py-[1px] rounded shadow-[0_1px_0_hsl(var(--border))]">{k}</kbd>
                  </div>
                ))}
              </div>
            </RGroup>
            <Sep />
            <RGroup label="Exportar">
              <div className="grid grid-cols-1 gap-y-[3px] px-2 min-w-[140px]">
                {[
                  ['Exportar PDF', 'Ctrl+⇧+E'],
                ].map(([l, k]) => (
                  <div key={l} className="flex items-center justify-between gap-3 text-[10px]">
                    <span className="text-muted-foreground">{l}</span>
                    <kbd className="font-mono text-[9px] bg-muted border border-border px-1.5 py-[1px] rounded shadow-[0_1px_0_hsl(var(--border))]">{k}</kbd>
                  </div>
                ))}
              </div>
            </RGroup>
          </>
        )}
      </div>
    </div>
  );
}
