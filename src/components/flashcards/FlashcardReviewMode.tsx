import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Flashcard, calculateNextReview, ENEM_AREAS } from "@/types/study";
import { RotateCcw, Check, X, Keyboard, Shuffle, Maximize2, Minimize2, Lightbulb, Timer } from "lucide-react";
import { toast } from "sonner";

interface Props {
  cards: Flashcard[];
  onUpdate: (card: Flashcard) => void;
}

export function FlashcardReviewMode({ cards, onUpdate }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });

  // Shuffle cards
  const reviewCards = useMemo(() => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [cards]);

  const currentCard = reviewCards[currentIndex];
  const progress = reviewCards.length > 0 ? ((currentIndex + 1) / reviewCards.length) * 100 : 0;

  // Reset timer on card change
  useEffect(() => {
    setStartTime(Date.now());
    setShowHint(false);
  }, [currentIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f); }
      if (e.key === 'ArrowRight' && flipped) markCard(5);
      if (e.key === 'ArrowLeft' && flipped) markCard(2);
      if (e.key === 'ArrowDown' && flipped) markCard(3);
      if (e.key === 'h') setShowHint(true);
      if (e.key === 'f') setFullscreen(f => !f);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flipped, currentIndex]);

  const markCard = useCallback((quality: number) => {
    if (!currentCard) return;
    const responseTimeMs = Date.now() - startTime;
    const { interval, easeFactor, nextReview } = calculateNextReview(currentCard, quality);
    const correct = quality >= 3;

    const updatedCard: Flashcard = {
      ...currentCard,
      status: quality >= 4 ? 'mastered' : 'reviewing',
      interval,
      easeFactor,
      nextReview,
      reviewCount: (currentCard.reviewCount ?? 0) + 1,
      reviews: [...(currentCard.reviews || []), { date: new Date().toISOString(), correct, responseTimeMs }],
    };

    onUpdate(updatedCard);
    setSessionStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1),
    }));

    setFlipped(false);
    setUserAnswer('');
    setShowResult(false);
    if (currentIndex < reviewCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      toast.success(`Sessão completa! ✅ ${sessionStats.correct + (correct ? 1 : 0)} acertos, ❌ ${sessionStats.wrong + (correct ? 0 : 1)} erros`);
    }
  }, [currentCard, currentIndex, reviewCards.length, onUpdate, startTime, sessionStats]);

  const checkQuizAnswer = () => {
    if (!currentCard || !userAnswer.trim()) return;
    const similarity = calculateSimilarity(userAnswer.toLowerCase().trim(), currentCard.answer.toLowerCase().trim());
    setShowResult(true);
    setFlipped(true);
    if (similarity >= 0.6) {
      toast.success(`${Math.round(similarity * 100)}% de similaridade! ✅`);
    } else {
      toast.error(`${Math.round(similarity * 100)}% de similaridade`);
    }
  };

  if (reviewCards.length === 0) {
    return (
      <Card><CardContent className="p-8 text-center text-muted-foreground">
        <p className="text-lg mb-2">🎉 Nenhum card para revisar!</p>
        <p className="text-sm">Todos os cards estão em dia.</p>
      </CardContent></Card>
    );
  }

  if (currentIndex >= reviewCards.length) {
    return (
      <Card><CardContent className="p-8 text-center space-y-3">
        <p className="text-2xl">🎯 Sessão Completa!</p>
        <div className="flex justify-center gap-6">
          <div><p className="text-2xl font-bold text-ms-green">{sessionStats.correct}</p><p className="text-xs text-muted-foreground">Acertos</p></div>
          <div><p className="text-2xl font-bold text-ms-red">{sessionStats.wrong}</p><p className="text-xs text-muted-foreground">Erros</p></div>
          <div><p className="text-2xl font-bold">{sessionStats.correct + sessionStats.wrong > 0 ? Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.wrong)) * 100) : 0}%</p><p className="text-xs text-muted-foreground">Taxa</p></div>
        </div>
        <Button onClick={() => { setCurrentIndex(0); setSessionStats({ correct: 0, wrong: 0 }); }}>
          <RotateCcw className="h-4 w-4 mr-1" /> Revisar Novamente
        </Button>
      </CardContent></Card>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${fullscreen ? 'fixed inset-0 z-50 bg-background p-4 justify-center' : ''}`}>
      {/* Top bar */}
      <div className="w-full max-w-lg flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{currentIndex + 1} / {reviewCards.length}</p>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px] gap-1">
            <span className="text-ms-green">✓{sessionStats.correct}</span>
            <span className="text-ms-red">✗{sessionStats.wrong}</span>
          </Badge>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setQuizMode(!quizMode)} title="Modo Quiz">
            <Keyboard className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setFullscreen(!fullscreen)} title="Tela Cheia">
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      <Progress value={progress} className="w-full max-w-lg h-1.5" />

      {/* Card with 3D flip */}
      <div
        onClick={() => !quizMode && setFlipped(!flipped)}
        className="w-full max-w-lg cursor-pointer"
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <Card className="min-h-[220px] sm:min-h-[260px] flex items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
            <CardContent className="p-6 sm:p-8 text-center w-full">
              <Badge className={`text-[10px] ${ENEM_AREAS[currentCard.area].color} text-white border-0 mb-3`}>
                {ENEM_AREAS[currentCard.area].label}
              </Badge>
              <p className="text-xs text-muted-foreground mb-2">PERGUNTA</p>
              <p className="text-base sm:text-lg font-medium">{currentCard.question}</p>
              {currentCard.hint && showHint && (
                <p className="text-xs text-ms-orange mt-3 italic">💡 {currentCard.hint}</p>
              )}
              {currentCard.hint && !showHint && (
                <Button size="sm" variant="ghost" className="mt-3 text-xs" onClick={(e) => { e.stopPropagation(); setShowHint(true); }}>
                  <Lightbulb className="h-3 w-3 mr-1" /> Dica
                </Button>
              )}
              {!quizMode && <p className="text-[10px] text-muted-foreground mt-4">Espaço para virar • ← revisar • → dominado</p>}
            </CardContent>
          </Card>

          {/* Back */}
          <Card
            className="min-h-[220px] sm:min-h-[260px] flex items-center justify-center absolute inset-0"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <CardContent className="p-6 sm:p-8 text-center w-full">
              <p className="text-xs text-ms-green mb-2">RESPOSTA</p>
              <p className="text-base sm:text-lg">{currentCard.answer}</p>
              {currentCard.subject && <p className="text-[10px] text-muted-foreground mt-3">📚 {currentCard.subject}</p>}
              {currentCard.interval && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  <Timer className="h-3 w-3 inline mr-1" />
                  Intervalo atual: {currentCard.interval}d
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quiz input */}
      {quizMode && !flipped && (
        <div className="w-full max-w-lg flex gap-2">
          <Input
            placeholder="Digite sua resposta..."
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkQuizAnswer()}
            className="flex-1"
            autoFocus
          />
          <Button onClick={checkQuizAnswer} disabled={!userAnswer.trim()}>Verificar</Button>
        </div>
      )}

      {/* Action buttons */}
      {flipped && (
        <div className="flex gap-2 flex-wrap justify-center">
          <Button variant="destructive" size="sm" onClick={() => markCard(1)}>
            <X className="h-4 w-4 mr-1" /> Errei
          </Button>
          <Button variant="outline" size="sm" onClick={() => markCard(3)}>
            <RotateCcw className="h-4 w-4 mr-1" /> Difícil
          </Button>
          <Button variant="secondary" size="sm" onClick={() => markCard(4)}>
            <Check className="h-4 w-4 mr-1" /> Bom
          </Button>
          <Button size="sm" onClick={() => markCard(5)}>
            🚀 Fácil
          </Button>
        </div>
      )}

      {/* Keyboard shortcuts legend */}
      <p className="text-[10px] text-muted-foreground text-center">
        ⌨️ Espaço: virar • ←: errei • ↓: difícil • →: dominado • H: dica • F: tela cheia
      </p>
    </div>
  );
}

function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;

  const costs: number[] = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) { costs[j] = j; continue; }
      if (j > 0) {
        let newValue = costs[j - 1];
        if (longer[i - 1] !== shorter[j - 1]) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }
  return (longer.length - costs[shorter.length]) / longer.length;
}
