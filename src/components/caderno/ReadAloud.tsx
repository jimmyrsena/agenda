import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Pause, Play, SkipForward, X } from "lucide-react";

interface Props {
  content: string;
  onClose: () => void;
}

export function ReadAloud({ content, onClose }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [voice, setVoice] = useState('');
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  const voices = typeof window !== 'undefined' ? window.speechSynthesis?.getVoices().filter(v => v.lang.startsWith('pt')) : [];

  const speak = useCallback(() => {
    if (!plainText) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(plainText);
    utter.lang = 'pt-BR';
    utter.rate = rate;
    if (voice) {
      const found = window.speechSynthesis.getVoices().find(v => v.name === voice);
      if (found) utter.voice = found;
    }
    utter.onend = () => { setSpeaking(false); setPaused(false); };
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
    setPaused(false);
  }, [plainText, rate, voice]);

  const togglePause = () => {
    if (paused) { window.speechSynthesis.resume(); setPaused(false); }
    else { window.speechSynthesis.pause(); setPaused(true); }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">Leitura em Voz Alta</span>
          </div>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClose}><X className="h-3 w-3" /></Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {!speaking ? (
              <Button size="sm" className="h-7 text-[10px] gap-1" onClick={speak}>
                <Play className="h-3 w-3" /> Ler Documento
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={togglePause}>
                  {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                  {paused ? 'Continuar' : 'Pausar'}
                </Button>
                <Button size="sm" variant="destructive" className="h-7 text-[10px] gap-1" onClick={stop}>
                  <VolumeX className="h-3 w-3" /> Parar
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-muted-foreground w-16">Velocidade:</span>
            <Slider value={[rate]} onValueChange={([v]) => setRate(v)} min={0.5} max={2} step={0.25} className="flex-1" />
            <span className="w-8 text-center">{rate}×</span>
          </div>

          {voices.length > 0 && (
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-muted-foreground w-16">Voz:</span>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger className="h-6 text-[10px] flex-1"><SelectValue placeholder="Padrão" /></SelectTrigger>
                <SelectContent>
                  {voices.map(v => <SelectItem key={v.name} value={v.name} className="text-[10px]">{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <p className="text-[9px] text-muted-foreground">{plainText.split(/\s+/).length} palavras no documento</p>
        </div>
      </CardContent>
    </Card>
  );
}
