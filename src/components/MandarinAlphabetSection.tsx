import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Volume2, Square, ChevronDown, ChevronUp } from "lucide-react";
import {
  TONES, INITIALS, FINALS, RADICALS, NUMBERS, ESSENTIAL_CHARACTERS, TONE_RULES, CLASSIFIERS,
} from "@/data/mandarinAlphabet";

function SpeakBtn({ text, langCode }: { text: string; langCode: string }) {
  const [playing, setPlaying] = useState(false);

  const handleClick = () => {
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel();
      setPlaying(false);
    } else {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = langCode;
      u.rate = 0.7;
      u.onend = () => setPlaying(false);
      u.onerror = (e) => {
        const err = (e as any)?.error || "";
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
        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10 shrink-0" onClick={handleClick}
          aria-label={playing ? "Parar" : `Ouvir: ${text.substring(0, 30)}`}>
          {playing ? <Square className="h-3 w-3 text-destructive" /> : <Volume2 className="h-3.5 w-3.5 text-primary" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent><p>{playing ? "Parar" : "Ouvir"}</p></TooltipContent>
    </Tooltip>
  );
}

export function MandarinAlphabetSection({ langCode }: { langCode: string }) {
  const [subTab, setSubTab] = useState("tones");
  const [expandedRadical, setExpandedRadical] = useState<string | null>(null);
  const [expandedChar, setExpandedChar] = useState<string | null>(null);
  const [charPage, setCharPage] = useState(0);
  const CHARS_PER_PAGE = 20;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center">
            <span className="text-white text-sm font-bold">拼</span>
          </div>
          <div>
            <h2 className="text-lg font-bold">Alfabeto Pinyin & Caracteres</h2>
            <p className="text-xs text-muted-foreground">Toque em qualquer elemento para ouvir a pronúncia</p>
          </div>
        </div>

        <Tabs value={subTab} onValueChange={setSubTab}>
          <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="tones" className="text-[10px] px-2 py-1">🎵 Tons</TabsTrigger>
            <TabsTrigger value="initials" className="text-[10px] px-2 py-1">声母 Iniciais</TabsTrigger>
            <TabsTrigger value="finals" className="text-[10px] px-2 py-1">韵母 Finais</TabsTrigger>
            <TabsTrigger value="radicals" className="text-[10px] px-2 py-1">部首 Radicais</TabsTrigger>
            <TabsTrigger value="numbers" className="text-[10px] px-2 py-1">数字 Números</TabsTrigger>
            <TabsTrigger value="characters" className="text-[10px] px-2 py-1">汉字 Caracteres</TabsTrigger>
            <TabsTrigger value="classifiers" className="text-[10px] px-2 py-1">量词 Classificadores</TabsTrigger>
            <TabsTrigger value="tone-rules" className="text-[10px] px-2 py-1">变调 Regras de Tom</TabsTrigger>
          </TabsList>

          {/* TONES */}
          <TabsContent value="tones" className="mt-3 space-y-3">
            <p className="text-xs text-muted-foreground">O Mandarim tem <strong>4 tons + 1 neutro</strong>. O mesmo som com tons diferentes tem significados completamente diferentes!</p>
            {TONES.map(t => (
              <div key={t.number} className="p-3 rounded-xl border bg-card hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                    t.number === 1 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                    t.number === 2 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    t.number === 3 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                    t.number === 4 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {t.symbol}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-[10px]">{t.example.char}</Badge>
                      <span className="text-xs font-mono">{t.example.pinyin}</span>
                      <span className="text-xs text-muted-foreground">= {t.example.meaning}</span>
                    </div>
                    <p className="text-[10px] text-primary mt-1">💡 {t.tip}</p>
                  </div>
                  <SpeakBtn text={t.example.char} langCode={langCode} />
                </div>
              </div>
            ))}
            {/* Tone comparison */}
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs font-semibold text-primary mb-2">🎯 Compare os 4 tons — clique em cada um:</p>
              <div className="grid grid-cols-4 gap-2">
                {TONES.slice(0, 4).map(t => (
                  <button key={t.number} className="p-2 rounded-lg border bg-card hover:bg-accent/50 transition-all text-center group"
                    onClick={() => {
                      const u = new SpeechSynthesisUtterance(t.example.char);
                      u.lang = langCode; u.rate = 0.6;
                      window.speechSynthesis.cancel();
                      window.speechSynthesis.speak(u);
                    }}>
                    <span className="text-2xl block">{t.example.char}</span>
                    <span className="text-[10px] font-mono block">{t.example.pinyin}</span>
                    <span className="text-[9px] text-muted-foreground block">{t.example.meaning}</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* INITIALS */}
          <TabsContent value="initials" className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">As <strong>21 iniciais</strong> (声母 shēngmǔ) são as consoantes que iniciam uma sílaba em Pinyin.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INITIALS.map(ini => (
                <div key={ini.pinyin} className="p-2.5 rounded-xl border bg-card hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-mono text-primary w-8 text-center">{ini.pinyin}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px] font-mono">{ini.ipa}</Badge>
                        <span className="text-[10px] text-muted-foreground truncate">{ini.description}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {ini.examples.map((ex, i) => (
                          <button key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-accent/50 hover:bg-accent transition text-[10px]"
                            onClick={() => {
                              const u = new SpeechSynthesisUtterance(ex.char);
                              u.lang = langCode; u.rate = 0.6;
                              window.speechSynthesis.cancel();
                              window.speechSynthesis.speak(u);
                            }}>
                            <span className="font-bold">{ex.char}</span>
                            <span className="font-mono text-muted-foreground">{ex.pinyin}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[9px] text-primary mt-0.5">💡 {ini.tip}</p>
                    </div>
                    <SpeakBtn text={ini.examples[0]?.char || ini.pinyin} langCode={langCode} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* FINALS */}
          <TabsContent value="finals" className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">As <strong>finais</strong> (韵母 yùnmǔ) são as vogais e combinações vocálicas que terminam a sílaba.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FINALS.map(fin => (
                <div key={fin.pinyin} className="p-2 rounded-xl border bg-card hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-mono text-primary w-10 text-center">{fin.pinyin}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px] font-mono">{fin.ipa}</Badge>
                        <span className="text-[10px] text-muted-foreground truncate">{fin.description}</span>
                      </div>
                      {fin.examples.map((ex, i) => (
                        <button key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-accent/50 hover:bg-accent transition text-[10px] mt-1"
                          onClick={() => {
                            const u = new SpeechSynthesisUtterance(ex.char);
                            u.lang = langCode; u.rate = 0.6;
                            window.speechSynthesis.cancel();
                            window.speechSynthesis.speak(u);
                          }}>
                          <span className="font-bold">{ex.char}</span>
                          <span className="font-mono text-muted-foreground">{ex.pinyin}</span>
                          <span className="text-muted-foreground">= {ex.meaning}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* RADICALS */}
          <TabsContent value="radicals" className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">Os <strong>radicais</strong> (部首 bùshǒu) são os componentes básicos que formam os caracteres chineses. Conhecê-los ajuda a entender e memorizar novos caracteres.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {RADICALS.map(rad => (
                <div key={rad.radical} className="rounded-xl border bg-card overflow-hidden">
                  <button className="w-full p-2.5 flex items-center gap-2 hover:bg-accent/30 transition-colors text-left"
                    onClick={() => setExpandedRadical(expandedRadical === rad.radical ? null : rad.radical)}>
                    <span className="text-xl font-bold text-primary w-10 text-center">{rad.radical.split("/")[0]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold">{rad.meaning}</span>
                        <Badge variant="outline" className="text-[9px] font-mono">{rad.pinyin}</Badge>
                        <Badge variant="secondary" className="text-[9px]">{rad.strokes} traços</Badge>
                      </div>
                    </div>
                    <SpeakBtn text={rad.radical.split("/")[0]} langCode={langCode} />
                    {expandedRadical === rad.radical ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  {expandedRadical === rad.radical && (
                    <div className="px-3 pb-3 pt-1 border-t bg-accent/20">
                      <p className="text-[10px] text-muted-foreground mb-1.5">Caracteres com este radical:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {rad.examples.map((ex, i) => (
                          <button key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-card border hover:bg-accent/50 transition text-xs"
                            onClick={() => {
                              const u = new SpeechSynthesisUtterance(ex.char);
                              u.lang = langCode; u.rate = 0.6;
                              window.speechSynthesis.cancel();
                              window.speechSynthesis.speak(u);
                            }}>
                            <span className="text-base font-bold">{ex.char}</span>
                            <span className="font-mono text-muted-foreground">{ex.pinyin}</span>
                            <span className="text-muted-foreground">= {ex.meaning}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* NUMBERS */}
          <TabsContent value="numbers" className="mt-3 space-y-3">
            <p className="text-xs text-muted-foreground">Os números chineses (数字 shùzì). Clique para ouvir!</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {NUMBERS.map(n => (
                <button key={n.number} className="p-3 rounded-xl border bg-card hover:bg-accent/40 transition-all text-center group"
                  onClick={() => {
                    const u = new SpeechSynthesisUtterance(n.char);
                    u.lang = langCode; u.rate = 0.6;
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(u);
                  }}>
                  <span className="text-3xl font-bold block text-primary group-hover:scale-110 transition-transform">{n.char}</span>
                  <span className="text-xs font-mono block mt-1">{n.pinyin}</span>
                  <span className="text-[10px] text-muted-foreground block">{n.number}</span>
                  {n.financial && <span className="text-[9px] text-muted-foreground block mt-0.5">Financeiro: {n.financial}</span>}
                </button>
              ))}
            </div>
          </TabsContent>

          {/* ESSENTIAL CHARACTERS */}
          <TabsContent value="characters" className="mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Os <strong>50 caracteres mais essenciais</strong> do dia a dia. Clique para expandir e ouvir.</p>
              <Badge variant="secondary" className="text-[10px]">{ESSENTIAL_CHARACTERS.length} caracteres</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {ESSENTIAL_CHARACTERS.slice(charPage * CHARS_PER_PAGE, (charPage + 1) * CHARS_PER_PAGE).map(ch => (
                <div key={ch.char} className="rounded-xl border bg-card overflow-hidden">
                  <button className="w-full p-2 text-center hover:bg-accent/30 transition-colors"
                    onClick={() => setExpandedChar(expandedChar === ch.char ? null : ch.char)}>
                    <span className="text-2xl font-bold block text-primary">{ch.char}</span>
                    <span className="text-xs font-mono block">{ch.pinyin}</span>
                    <span className="text-[10px] text-muted-foreground block">{ch.meaning}</span>
                  </button>
                  {expandedChar === ch.char && (
                    <div className="px-2 pb-2 pt-1 border-t bg-accent/20 text-left space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px]">部首 {ch.radical}</Badge>
                        <Badge variant="outline" className="text-[9px]">{ch.strokes} traços</Badge>
                      </div>
                      <button className="w-full text-left p-1.5 rounded bg-card border hover:bg-accent/50 transition text-[10px]"
                        onClick={() => {
                          const u = new SpeechSynthesisUtterance(ch.example);
                          u.lang = langCode; u.rate = 0.6;
                          window.speechSynthesis.cancel();
                          window.speechSynthesis.speak(u);
                        }}>
                        <p className="font-bold">{ch.example}</p>
                        <p className="font-mono text-muted-foreground">{ch.examplePinyin}</p>
                        <p className="text-muted-foreground">{ch.exampleMeaning}</p>
                      </button>
                      <SpeakBtn text={ch.char} langCode={langCode} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: Math.ceil(ESSENTIAL_CHARACTERS.length / CHARS_PER_PAGE) }, (_, i) => (
                <Button key={i} size="sm" variant={charPage === i ? "default" : "outline"} className="h-7 w-7 p-0 text-xs"
                  onClick={() => { setCharPage(i); setExpandedChar(null); }}>
                  {i + 1}
                </Button>
              ))}
            </div>
          </TabsContent>

          {/* CLASSIFIERS */}
          <TabsContent value="classifiers" className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">Os <strong>classificadores</strong> (量词 liàngcí) são palavras obrigatórias entre número e substantivo em chinês. Como dizer "um COPO de água" — em chinês TUDO precisa de classificador.</p>
            {CLASSIFIERS.map(cl => (
              <div key={cl.char} className="p-3 rounded-xl border bg-card hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3">
                  <button className="text-2xl font-bold text-primary w-10 text-center shrink-0"
                    onClick={() => {
                      const u = new SpeechSynthesisUtterance(cl.char);
                      u.lang = langCode; u.rate = 0.6;
                      window.speechSynthesis.cancel();
                      window.speechSynthesis.speak(u);
                    }}>
                    {cl.char}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-semibold">{cl.pinyin}</span>
                      <span className="text-[10px] text-muted-foreground">— {cl.usage}</span>
                    </div>
                    <div className="mt-1.5 space-y-1">
                      {cl.examples.map((ex, i) => (
                        <button key={i} className="block w-full text-left px-2 py-1 rounded bg-accent/40 hover:bg-accent transition text-[10px]"
                          onClick={() => {
                            const chineseOnly = ex.split("(")[0].trim();
                            const u = new SpeechSynthesisUtterance(chineseOnly);
                            u.lang = langCode; u.rate = 0.6;
                            window.speechSynthesis.cancel();
                            window.speechSynthesis.speak(u);
                          }}>
                          {ex}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* TONE CHANGE RULES */}
          <TabsContent value="tone-rules" className="mt-3 space-y-3">
            <p className="text-xs text-muted-foreground">Em Mandarim, certos tons mudam quando aparecem juntos. Essas regras são essenciais para soar natural!</p>
            {TONE_RULES.map((tr, i) => (
              <div key={i} className="p-3 rounded-xl border bg-card">
                <p className="text-sm font-bold text-primary">{tr.rule}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button className="px-3 py-1.5 rounded-lg bg-accent/50 hover:bg-accent transition text-sm font-bold"
                    onClick={() => {
                      const chineseOnly = tr.example.split("→")[0].trim();
                      const u = new SpeechSynthesisUtterance(chineseOnly);
                      u.lang = langCode; u.rate = 0.6;
                      window.speechSynthesis.cancel();
                      window.speechSynthesis.speak(u);
                    }}>
                    {tr.example}
                  </button>
                  <span className="text-xs font-mono text-muted-foreground">{tr.pinyin}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{tr.explanation}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
