import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Settings2, Type, Palette } from "lucide-react";

export interface DocTheme {
  id: string;
  name: string;
  font: string;
  fontClass: string;
  lineHeight: string;
  bgClass: string;
}

export const DOC_THEMES: DocTheme[] = [
  { id: 'default', name: 'Padrão', font: 'Inter', fontClass: 'font-sans', lineHeight: '1.75', bgClass: 'bg-card' },
  { id: 'academic', name: 'Acadêmico', font: 'Georgia', fontClass: 'font-serif', lineHeight: '2', bgClass: 'bg-card' },
  { id: 'minimal', name: 'Minimalista', font: 'System UI', fontClass: 'font-sans', lineHeight: '1.6', bgClass: 'bg-card' },
  { id: 'mono', name: 'Terminal', font: 'Fira Code', fontClass: 'font-mono', lineHeight: '1.5', bgClass: 'bg-card' },
  { id: 'warm', name: 'Aconchegante', font: 'Georgia', fontClass: 'font-serif', lineHeight: '1.8', bgClass: 'bg-amber-50 dark:bg-amber-950/20' },
  { id: 'focus', name: 'Foco Total', font: 'Inter', fontClass: 'font-sans', lineHeight: '2', bgClass: 'bg-card' },
];

export const COVER_COLORS = [
  'from-primary to-accent',
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-violet-500',
  'from-teal-500 to-green-500',
  'from-rose-500 to-orange-500',
  'from-amber-500 to-yellow-500',
  'from-gray-500 to-slate-500',
];

export const NOTE_ICONS = [
  '📝', '📚', '📖', '📓', '📒', '📕', '📗', '📘', '📙', '📔',
  '✏️', '🖊️', '🖋️', '✍️', '📎', '📌', '🔖', '🏷️',
  '🧪', '🔬', '🧬', '🔭', '⚗️', '🧮', '📐', '📏',
  '🌍', '🌎', '🌏', '🗺️', '🏛️', '⚖️', '🎭', '🎨',
  '💻', '🖥️', '⌨️', '🤖', '🧠', '💡', '🎯', '🏆',
  '📊', '📈', '📉', '🗂️', '📋', '📅', '⏰', '🔑',
  '❤️', '⭐', '🔥', '✨', '💎', '🎓', '🏅', '🚀',
];

interface Props {
  theme: string;
  onThemeChange: (id: string) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  noteIcon: string;
  onIconChange: (icon: string) => void;
  coverColor: string;
  onCoverChange: (color: string) => void;
}

export function NoteDocSettings({
  theme, onThemeChange, zoom, onZoomChange,
  noteIcon, onIconChange, coverColor, onCoverChange,
}: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1 px-2">
          <Settings2 className="h-3 w-3" /> Documento
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-4" align="end">
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Tema do Documento</Label>
          <Select value={theme} onValueChange={onThemeChange}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DOC_THEMES.map(t => (
                <SelectItem key={t.id} value={t.id} className="text-xs">
                  <span className={t.fontClass}>{t.name}</span> — {t.font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold">Zoom: {zoom}%</Label>
          <Slider
            value={[zoom]}
            onValueChange={([v]) => onZoomChange(v)}
            min={50}
            max={200}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>50%</span><span>100%</span><span>200%</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold">Ícone da Nota</Label>
          <div className="grid grid-cols-8 gap-1">
            {NOTE_ICONS.map(icon => (
              <button
                key={icon}
                className={`w-7 h-7 rounded text-base flex items-center justify-center hover:bg-accent transition-colors ${noteIcon === icon ? 'bg-accent ring-1 ring-primary' : ''}`}
                onClick={() => onIconChange(icon)}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold">Cor da Capa</Label>
          <div className="grid grid-cols-5 gap-1.5">
            <button
              className={`h-6 rounded border-2 border-dashed border-muted-foreground/30 text-[8px] text-muted-foreground ${!coverColor ? 'ring-2 ring-primary' : ''}`}
              onClick={() => onCoverChange('')}
            >
              Sem
            </button>
            {COVER_COLORS.map(c => (
              <button
                key={c}
                className={`h-6 rounded bg-gradient-to-r ${c} ${coverColor === c ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                onClick={() => onCoverChange(c)}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
