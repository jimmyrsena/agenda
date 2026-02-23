import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Volume2, Square, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { LANGUAGE_ALPHABET_DATA, type LanguageAlphabetData } from "@/data/languageAlphabets";

function SpeakBtn({ text, langCode, size = "icon" }: { text: string; langCode: string; size?: "icon" | "sm" }) {
  const [playing, setPlaying] = useState(false);

  const handleClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel();
      setPlaying(false);
    } else {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = langCode;
      u.rate = 0.75;
      u.onend = () => setPlaying(false);
      u.onerror = (ev) => {
        const err = (ev as any)?.error || "";
        if (err === "interrupted" || err === "canceled") return;
        setPlaying(false);
      };
      window.speechSynthesis.speak(u);
      setPlaying(true);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size={size === "icon" ? "icon" : "sm"} className={size === "icon" ? "h-7 w-7 hover:bg-primary/10 shrink-0" : "h-7 gap-1 px-2 hover:bg-primary/10"} onClick={handleClick}
          aria-label={playing ? "Parar" : `Ouvir: ${text.substring(0, 30)}`}>
          {playing ? <Square className="h-3 w-3 text-destructive" /> : <Volume2 className="h-3.5 w-3.5 text-primary" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent><p>{playing ? "Parar" : "Ouvir"}</p></TooltipContent>
    </Tooltip>
  );
}

function speakText(text: string, langCode: string) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = langCode;
  u.rate = 0.75;
  window.speechSynthesis.speak(u);
}

export function LanguageAlphabetSection({ langId, langCode }: { langId: string; langCode: string }) {
  const data = LANGUAGE_ALPHABET_DATA[langId];
  const [subTab, setSubTab] = useState("alphabet");
  const [expandedLetter, setExpandedLetter] = useState<string | null>(null);

  if (!data) return null;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">Aa</span>
          </div>
          <div>
            <h2 className="text-lg font-bold">{data.alphabetTitle}</h2>
            <p className="text-xs text-muted-foreground">{data.alphabetDescription}</p>
          </div>
        </div>

        <Tabs value={subTab} onValueChange={setSubTab}>
          <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="alphabet" className="text-[10px] px-2 py-1">🔤 Alfabeto</TabsTrigger>
            <TabsTrigger value="sounds" className="text-[10px] px-2 py-1">🔊 Sons Especiais</TabsTrigger>
            <TabsTrigger value="phrases" className="text-[10px] px-2 py-1">💬 Frases Essenciais</TabsTrigger>
            <TabsTrigger value="grammar" className="text-[10px] px-2 py-1">📐 Gramática Básica</TabsTrigger>
            <TabsTrigger value="facts" className="text-[10px] px-2 py-1">💡 Curiosidades</TabsTrigger>
          </TabsList>

          {/* ALPHABET */}
          <TabsContent value="alphabet" className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground mb-2">Clique em qualquer letra para ouvir a pronúncia e ver exemplos detalhados.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {data.alphabet.map(l => (
                <div key={l.letter} className="rounded-xl border bg-card overflow-hidden">
                  <button className="w-full p-2 text-center hover:bg-accent/30 transition-colors"
                    onClick={() => {
                      setExpandedLetter(expandedLetter === l.letter ? null : l.letter);
                      speakText(l.examples[0]?.word || l.letter, langCode);
                    }}>
                    <span className="text-2xl font-bold block text-primary">{l.letter}</span>
                    <span className="text-[10px] font-mono block text-muted-foreground">{l.name}</span>
                    <Badge variant="outline" className="text-[8px] font-mono mt-0.5">{l.ipa}</Badge>
                  </button>
                  {expandedLetter === l.letter && (
                    <div className="px-2 pb-2 pt-1 border-t bg-accent/20 text-left space-y-1.5">
                      <p className="text-[10px] text-muted-foreground">{l.pronunciation}</p>
                      <div className="flex flex-wrap gap-1">
                        {l.examples.map((ex, i) => (
                          <button key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-card border hover:bg-accent/50 transition text-[10px]"
                            onClick={(e) => { e.stopPropagation(); speakText(ex.word, langCode); }}>
                            <span className="font-bold">{ex.word}</span>
                            <span className="text-muted-foreground">= {ex.meaning}</span>
                          </button>
                        ))}
                      </div>
                      {l.tip && <p className="text-[9px] text-primary flex items-start gap-1"><Lightbulb className="h-3 w-3 shrink-0 mt-0.5" />{l.tip}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* SPECIAL SOUNDS */}
          <TabsContent value="sounds" className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground mb-2">Sons únicos e difíceis do {data.langName}. Clique nos exemplos para ouvir!</p>
            {data.specialSounds.map((s, idx) => (
              <div key={idx} className="p-3 rounded-xl border bg-card hover:bg-accent/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 text-center shrink-0">
                    <span className="text-lg font-bold font-mono text-primary block">{s.sound}</span>
                    <Badge variant="outline" className="text-[8px] font-mono">{s.ipa}</Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {s.examples.map((ex, i) => (
                        <button key={i} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-accent/50 hover:bg-accent transition text-[10px]"
                          onClick={() => speakText(ex.word, langCode)}>
                          <span className="font-bold">{ex.word}</span>
                          <span className="text-muted-foreground">= {ex.meaning}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-primary mt-1 flex items-start gap-1"><Lightbulb className="h-3 w-3 shrink-0 mt-0.5" />{s.tip}</p>
                  </div>
                  <SpeakBtn text={s.examples.map(e => e.word).join('. ')} langCode={langCode} />
                </div>
              </div>
            ))}
          </TabsContent>

          {/* ESSENTIAL PHRASES */}
          <TabsContent value="phrases" className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground mb-2">As 10 frases mais essenciais. Clique para ouvir a pronúncia correta!</p>
            {data.essentialPhrases.map((p, idx) => (
              <button key={idx} className="w-full text-left p-3 rounded-xl border bg-card hover:bg-accent/20 transition-colors"
                onClick={() => speakText(p.phrase, langCode)}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{p.phrase}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">[{p.pronunciation}]</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.meaning}</p>
                    <Badge variant="secondary" className="text-[8px] mt-1">{p.context}</Badge>
                  </div>
                  <Volume2 className="h-4 w-4 text-primary shrink-0" />
                </div>
              </button>
            ))}
          </TabsContent>

          {/* GRAMMAR BASICS */}
          <TabsContent value="grammar" className="mt-3 space-y-3">
            <p className="text-xs text-muted-foreground mb-2">Conceitos gramaticais fundamentais do {data.langName}.</p>
            {data.grammarBasics.map((g, idx) => (
              <div key={idx} className="p-3 rounded-xl border bg-card">
                <h3 className="text-sm font-bold text-primary mb-1">{g.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">{g.explanation}</p>
                <div className="space-y-1.5">
                  {g.examples.map((ex, i) => (
                    <button key={i} className="w-full text-left px-3 py-2 rounded-lg bg-accent/40 hover:bg-accent transition text-xs flex items-center gap-2"
                      onClick={() => speakText(ex.original, langCode)}>
                      <Volume2 className="h-3 w-3 text-primary shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold">{ex.original}</p>
                        <p className="text-muted-foreground">{ex.translation}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* FUN FACTS */}
          <TabsContent value="facts" className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground mb-2">Curiosidades sobre o {data.langName}!</p>
            {data.funFacts.map((f, idx) => (
              <div key={idx} className="p-3 rounded-xl border bg-primary/5 border-primary/10 flex items-start gap-2">
                <span className="text-lg">💡</span>
                <p className="text-xs text-foreground">{f}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
