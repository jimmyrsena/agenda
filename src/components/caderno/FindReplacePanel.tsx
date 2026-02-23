import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ChevronDown, ChevronUp, Replace, ReplaceAll } from "lucide-react";
import type { Editor } from "@tiptap/core";

interface Props {
  editor: Editor | null;
  onClose: () => void;
}

export function FindReplacePanel({ editor, onClose }: Props) {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [matches, setMatches] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [showReplace, setShowReplace] = useState(false);

  const search = useCallback(() => {
    if (!editor || !findText) { setMatches(0); return; }
    const text = editor.getText();
    let flags = 'g';
    if (!matchCase) flags += 'i';
    try {
      let pattern = useRegex ? findText : findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (wholeWord) pattern = `\\b${pattern}\\b`;
      const regex = new RegExp(pattern, flags);
      const found = text.match(regex);
      setMatches(found?.length || 0);
      setCurrentMatch(found && found.length > 0 ? 1 : 0);
    } catch { setMatches(0); }
  }, [editor, findText, matchCase, wholeWord, useRegex]);

  useEffect(() => { search(); }, [findText, matchCase, wholeWord, useRegex, search]);

  const doReplace = useCallback(() => {
    if (!editor || !findText) return;
    const html = editor.getHTML();
    let flags = matchCase ? '' : 'i';
    let pattern = useRegex ? findText : findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (wholeWord) pattern = `\\b${pattern}\\b`;
    const regex = new RegExp(pattern, flags);
    const newHtml = html.replace(regex, replaceText);
    editor.commands.setContent(newHtml);
    search();
  }, [editor, findText, replaceText, matchCase, wholeWord, useRegex, search]);

  const doReplaceAll = useCallback(() => {
    if (!editor || !findText) return;
    const html = editor.getHTML();
    let flags = 'g';
    if (!matchCase) flags += 'i';
    let pattern = useRegex ? findText : findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (wholeWord) pattern = `\\b${pattern}\\b`;
    const regex = new RegExp(pattern, flags);
    const newHtml = html.replace(regex, replaceText);
    editor.commands.setContent(newHtml);
    search();
  }, [editor, findText, replaceText, matchCase, wholeWord, useRegex, search]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') { e.preventDefault(); setShowReplace(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="bg-card border-b px-3 py-2 flex flex-col gap-1.5 shrink-0 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0" onClick={() => setShowReplace(p => !p)}>
          <ChevronDown className={`h-3 w-3 transition-transform ${showReplace ? 'rotate-180' : ''}`} />
        </Button>
        <Input value={findText} onChange={e => setFindText(e.target.value)} placeholder="Localizar..." className="h-7 text-xs flex-1 max-w-[300px]" autoFocus />
        <div className="flex items-center gap-1">
          <button onClick={() => setMatchCase(p => !p)} className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${matchCase ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`} title="Diferenciar maiúsculas">Aa</button>
          <button onClick={() => setWholeWord(p => !p)} className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${wholeWord ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`} title="Palavra inteira">ab</button>
          <button onClick={() => setUseRegex(p => !p)} className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${useRegex ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`} title="Expressão regular">.*</button>
        </div>
        <span className="text-[10px] text-muted-foreground min-w-[60px]">
          {findText ? `${currentMatch} de ${matches}` : 'Nenhum'}
        </span>
        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={onClose}><X className="h-3 w-3" /></Button>
      </div>
      {showReplace && (
        <div className="flex items-center gap-2 pl-7">
          <Input value={replaceText} onChange={e => setReplaceText(e.target.value)} placeholder="Substituir por..." className="h-7 text-xs flex-1 max-w-[300px]" />
          <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={doReplace} disabled={!matches}>
            <Replace className="h-3 w-3" /> Substituir
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={doReplaceAll} disabled={!matches}>
            Substituir Tudo ({matches})
          </Button>
        </div>
      )}
    </div>
  );
}
