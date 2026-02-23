import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onTranscript: (text: string) => void;
}

export function SpeechToText({ onTranscript }: Props) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Seu navegador não suporta reconhecimento de voz');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t + ' ';
        } else {
          interimTranscript += t;
        }
      }
      if (finalTranscript) {
        onTranscript(finalTranscript);
        setTranscript(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        toast.error('Erro no reconhecimento: ' + event.error);
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    toast.success('🎤 Ditado ativo — fale agora!');
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  return (
    <Button
      size="sm"
      variant={listening ? "destructive" : "outline"}
      className="h-7 text-[10px] gap-1"
      onClick={listening ? stopListening : startListening}
      title={listening ? 'Parar ditado' : 'Iniciar ditado por voz'}
    >
      {listening ? (
        <>
          <Square className="h-3 w-3" />
          <span className="animate-pulse">Gravando...</span>
        </>
      ) : (
        <>
          <Mic className="h-3 w-3" />
          Ditado
        </>
      )}
    </Button>
  );
}
