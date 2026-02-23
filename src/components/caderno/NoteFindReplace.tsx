import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, Search, Replace, ChevronDown, ChevronUp, CaseSensitive } from "lucide-react";

interface Props {
  content: string;
  onReplace: (newContent: string) => void;
  open: boolean;
  onClose: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export function NoteFindReplace({ content, onReplace, open, onClose, textareaRef }: Props) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(0);
  const findRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => findRef.current?.focus(), 100);
    }
  }, [open]);

  const getMatches = useCallback(() => {
    if (!findText) return [];
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const pattern = useRegex ? findText : findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(pattern, flags);
      const matches: { index: number; length: number }[] = [];
      let match;
      while ((match = regex.exec(content)) !== null) {
        matches.push({ index: match.index, length: match[0].length });
        if (match.index === regex.lastIndex) regex.lastIndex++;
      }
      return matches;
    } catch {
      return [];
    }
  }, [findText, content, caseSensitive, useRegex]);

  const matches = getMatches();
  const totalMatches = matches.length;

  const goToMatch = useCallback((index: number) => {
    if (matches.length === 0 || !textareaRef.current) return;
    const wrapped = ((index % matches.length) + matches.length) % matches.length;
    setCurrentMatch(wrapped);
    const match = matches[wrapped];
    const ta = textareaRef.current;
    ta.focus();
    ta.setSelectionRange(match.index, match.index + match.length);
    // Scroll into view
    const linesBefore = content.slice(0, match.index).split('\n').length;
    const lineHeight = 28;
    ta.scrollTop = Math.max(0, (linesBefore - 5) * lineHeight);
  }, [matches, content, textareaRef]);

  const replaceOne = useCallback(() => {
    if (matches.length === 0) return;
    const match = matches[currentMatch];
    const newContent = content.slice(0, match.index) + replaceText + content.slice(match.index + match.length);
    onReplace(newContent);
  }, [matches, currentMatch, content, replaceText, onReplace]);

  const replaceAll = useCallback(() => {
    if (!findText) return;
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const pattern = useRegex ? findText : findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(pattern, flags);
      const newContent = content.replace(regex, replaceText);
      onReplace(newContent);
    } catch { /* ignore */ }
  }, [findText, replaceText, content, caseSensitive, useRegex, onReplace]);

  if (!open) return null;

  return (
    <div className="border rounded-lg bg-card p-3 shadow-lg space-y-2 animate-in slide-in-from-top-2">
      {/* Find row */}
      <div className="flex items-center gap-2">
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <Input
          ref={findRef}
          value={findText}
          onChange={e => { setFindText(e.target.value); setCurrentMatch(0); }}
          placeholder="Localizar..."
          className="h-8 text-xs flex-1"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              goToMatch(e.shiftKey ? currentMatch - 1 : currentMatch + 1);
            }
            if (e.key === 'Escape') onClose();
          }}
        />
        {findText && (
          <Badge variant="outline" className="text-[9px] shrink-0">
            {totalMatches > 0 ? `${currentMatch + 1}/${totalMatches}` : '0 resultados'}
          </Badge>
        )}
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => goToMatch(currentMatch - 1)} disabled={totalMatches === 0}>
          <ChevronUp className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => goToMatch(currentMatch + 1)} disabled={totalMatches === 0}>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setCaseSensitive(!caseSensitive)} title="Diferenciar maiúsculas">
          <CaseSensitive className={`h-3.5 w-3.5 ${caseSensitive ? 'text-primary' : ''}`} />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Replace row */}
      <div className="flex items-center gap-2">
        <Replace className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <Input
          value={replaceText}
          onChange={e => setReplaceText(e.target.value)}
          placeholder="Substituir por..."
          className="h-8 text-xs flex-1"
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); replaceOne(); }
            if (e.key === 'Escape') onClose();
          }}
        />
        <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={replaceOne} disabled={totalMatches === 0}>
          Substituir
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={replaceAll} disabled={totalMatches === 0}>
          Substituir Tudo
        </Button>
      </div>

      {/* Options */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Switch checked={useRegex} onCheckedChange={setUseRegex} className="scale-75" />
          Regex
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Switch checked={caseSensitive} onCheckedChange={setCaseSensitive} className="scale-75" />
          Maiúsculas/Minúsculas
        </label>
      </div>
    </div>
  );
}
