import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Search, Star, BarChart3, BookOpen, Tag, Copy, Archive } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Flashcard, FlashcardDeck, EnemArea, ENEM_AREAS, isDueForReview } from "@/types/study";
import { ExportPDF } from "@/components/ExportPDF";
import { FlashcardStats } from "@/components/flashcards/FlashcardStats";
import { FlashcardReviewMode } from "@/components/flashcards/FlashcardReviewMode";
import { FlashcardAIGenerate } from "@/components/flashcards/FlashcardAIGenerate";
import { FlashcardDeckManager } from "@/components/flashcards/FlashcardDeckManager";
import { toast } from "sonner";

export default function FlashcardsPage() {
  const [cards, setCards] = useLocalStorage<Flashcard[]>('flashcards', []);
  const [decks, setDecks] = useLocalStorage<FlashcardDeck[]>('flashcard-decks', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [filterArea, setFilterArea] = useState<string>('all');
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('cards');
  const [showArchived, setShowArchived] = useState(false);
  const [newCard, setNewCard] = useState({ question: '', answer: '', area: 'linguagens' as EnemArea, subject: '', hint: '', deckId: '' as string, tags: '' });

  const addCard = () => {
    if (!newCard.question.trim() || !newCard.answer.trim()) return;
    const card: Flashcard = {
      ...newCard,
      id: crypto.randomUUID(),
      status: 'new',
      createdAt: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 0,
      reviewCount: 0,
      reviews: [],
      tags: newCard.tags ? newCard.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      deckId: newCard.deckId || undefined,
    };
    setCards(prev => [...prev, card]);
    setNewCard({ question: '', answer: '', area: 'linguagens', subject: '', hint: '', deckId: '', tags: '' });
    setDialogOpen(false);
    toast.success("Flashcard criado!");
  };

  const updateCard = useCallback((updated: Flashcard) => {
    setCards(prev => prev.map(c => c.id === updated.id ? updated : c));
  }, [setCards]);

  const updateEditingCard = () => {
    if (!editingCard) return;
    setCards(prev => prev.map(c => c.id === editingCard.id ? editingCard : c));
    setEditingCard(null);
    toast.success("Flashcard atualizado!");
  };

  const deleteCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    toast.success("Flashcard excluído");
  };

  const duplicateCard = (card: Flashcard) => {
    const dup: Flashcard = { ...card, id: crypto.randomUUID(), status: 'new', createdAt: new Date().toISOString(), reviews: [], reviewCount: 0 };
    setCards(prev => [...prev, dup]);
    toast.success("Flashcard duplicado!");
  };

  const toggleFavorite = (id: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, favorite: !c.favorite } : c));
  };

  const toggleArchive = (id: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, archived: !c.archived } : c));
  };

  const addGeneratedCards = useCallback((newCards: Flashcard[]) => {
    setCards(prev => [...prev, ...newCards]);
  }, [setCards]);

  // Filtering
  const filtered = useMemo(() => {
    return cards.filter(c => {
      if (!showArchived && c.archived) return false;
      if (filterArea !== 'all' && c.area !== filterArea) return false;
      if (selectedDeck !== null && c.deckId !== selectedDeck) return false;
      if (search) {
        const s = search.toLowerCase();
        return c.question.toLowerCase().includes(s) || c.answer.toLowerCase().includes(s) || c.subject?.toLowerCase().includes(s) || (c.tags || []).some(t => t.toLowerCase().includes(s));
      }
      return true;
    });
  }, [cards, filterArea, selectedDeck, search, showArchived]);

  const reviewCards = useMemo(() => cards.filter(c => !c.archived && isDueForReview(c)), [cards]);

  const cardCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    cards.forEach(c => {
      if (c.deckId) counts[c.deckId] = (counts[c.deckId] || 0) + 1;
    });
    return counts;
  }, [cards]);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">🃏 Flashcards</h2>
          <p className="text-xs text-muted-foreground">{cards.length} cards • {reviewCards.length} para revisar hoje</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <ExportPDF title="Flashcards" getContent={() => {
            return `<h1>🃏 Flashcards</h1><table><tr><th>#</th><th>Matéria</th><th>Pergunta</th><th>Resposta</th><th>Status</th></tr>` +
              cards.map((c, i) => `<tr><td>${i + 1}</td><td>${ENEM_AREAS[c.area].label}</td><td>${c.question}</td><td>${c.answer}</td><td>${c.status === 'mastered' ? '✓ Dominado' : c.status === 'reviewing' ? '🔄 Revisando' : '🆕 Novo'}</td></tr>`).join('') +
              `</table>`;
          }} />
          <FlashcardAIGenerate onGenerate={addGeneratedCards} />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Novo</span> Card</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Flashcard</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Pergunta</Label><Textarea value={newCard.question} onChange={e => setNewCard(p => ({ ...p, question: e.target.value }))} /></div>
                <div><Label>Resposta</Label><Textarea value={newCard.answer} onChange={e => setNewCard(p => ({ ...p, answer: e.target.value }))} /></div>
                <div><Label>Dica (opcional)</Label><Input value={newCard.hint} onChange={e => setNewCard(p => ({ ...p, hint: e.target.value }))} placeholder="Uma dica para ajudar a lembrar..." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Área</Label>
                    <Select value={newCard.area} onValueChange={v => setNewCard(p => ({ ...p, area: v as EnemArea }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(ENEM_AREAS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Assunto</Label><Input value={newCard.subject} onChange={e => setNewCard(p => ({ ...p, subject: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Deck</Label>
                    <Select value={newCard.deckId || 'none'} onValueChange={v => setNewCard(p => ({ ...p, deckId: v === 'none' ? '' : v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {decks.map(d => <SelectItem key={d.id} value={d.id}>{d.icon} {d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Tags</Label><Input value={newCard.tags} onChange={e => setNewCard(p => ({ ...p, tags: e.target.value }))} placeholder="tag1, tag2..." /></div>
                </div>
                <Button onClick={addCard} className="w-full">Criar Card</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Decks */}
      <FlashcardDeckManager
        decks={decks}
        selectedDeck={selectedDeck}
        onSelect={setSelectedDeck}
        onAdd={d => setDecks(prev => [...prev, d])}
        onDelete={id => { setDecks(prev => prev.filter(d => d.id !== id)); if (selectedDeck === id) setSelectedDeck(null); }}
        cardCounts={cardCounts}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="cards" className="gap-1 text-xs"><BookOpen className="h-3 w-3" />Cards</TabsTrigger>
          <TabsTrigger value="review" className="gap-1 text-xs">
            🔄 Revisar
            {reviewCards.length > 0 && <Badge variant="destructive" className="text-[9px] h-4 px-1 ml-1">{reviewCards.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1 text-xs"><BarChart3 className="h-3 w-3" />Estatísticas</TabsTrigger>
        </TabsList>

        {/* Cards Tab */}
        <TabsContent value="cards" className="space-y-3 mt-3">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar flashcards..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <div className="flex gap-2">
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger className="w-full sm:w-32 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(ENEM_AREAS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" variant="ghost" className="h-9 text-xs" onClick={() => setShowArchived(!showArchived)}>
                <Archive className="h-3.5 w-3.5 mr-1" />{showArchived ? 'Ocultar' : 'Arquivados'}
              </Button>
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filtered.map(card => (
              <Card key={card.id} className={`hover:shadow-md transition-shadow group ${card.archived ? 'opacity-60' : ''} ${card.favorite ? 'ring-1 ring-ms-orange/30' : ''}`}>
                <CardContent className="p-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <Badge className={`text-[9px] shrink-0 ${ENEM_AREAS[card.area].color} text-white border-0`}>{ENEM_AREAS[card.area].label}</Badge>
                      <Badge variant={card.status === 'mastered' ? 'default' : 'secondary'} className="text-[9px] shrink-0">
                        {card.status === 'mastered' ? '✓' : card.status === 'reviewing' ? '🔄' : '🆕'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleFavorite(card.id)} className={`p-0.5 ${card.favorite ? 'text-ms-orange' : 'text-muted-foreground hover:text-ms-orange'}`}>
                        <Star className="h-3 w-3" fill={card.favorite ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={() => duplicateCard(card)} className="text-muted-foreground hover:text-primary p-0.5"><Copy className="h-3 w-3" /></button>
                      <button onClick={() => setEditingCard({ ...card })} className="text-muted-foreground hover:text-primary p-0.5"><Pencil className="h-3 w-3" /></button>
                      <button onClick={() => toggleArchive(card.id)} className="text-muted-foreground hover:text-ms-purple p-0.5"><Archive className="h-3 w-3" /></button>
                      <button onClick={() => deleteCard(card.id)} className="text-muted-foreground hover:text-destructive p-0.5"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{card.question}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{card.answer}</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {card.subject && <span className="text-[9px] text-muted-foreground">📚 {card.subject}</span>}
                    {(card.tags || []).map(t => (
                      <Badge key={t} variant="outline" className="text-[8px] h-4 px-1"><Tag className="h-2 w-2 mr-0.5" />{t}</Badge>
                    ))}
                    {card.interval && card.interval > 0 && (
                      <span className="text-[9px] text-muted-foreground ml-auto">⏱️ {card.interval}d</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center py-12 gap-3">
                <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  {search || filterArea !== 'all' ? 'Nenhum card encontrado' : 'Nenhum flashcard ainda. Crie seu primeiro!'}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review" className="mt-3">
          <FlashcardReviewMode cards={reviewCards} onUpdate={updateCard} />
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="mt-3">
          <FlashcardStats cards={cards} />
        </TabsContent>
      </Tabs>

      {/* Edit dialog */}
      <Dialog open={!!editingCard} onOpenChange={open => !open && setEditingCard(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Flashcard</DialogTitle></DialogHeader>
          {editingCard && (
            <div className="space-y-3">
              <div><Label>Pergunta</Label><Textarea value={editingCard.question} onChange={e => setEditingCard(p => p ? { ...p, question: e.target.value } : p)} /></div>
              <div><Label>Resposta</Label><Textarea value={editingCard.answer} onChange={e => setEditingCard(p => p ? { ...p, answer: e.target.value } : p)} /></div>
              <div><Label>Dica</Label><Input value={editingCard.hint || ''} onChange={e => setEditingCard(p => p ? { ...p, hint: e.target.value } : p)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Área</Label>
                  <Select value={editingCard.area} onValueChange={v => setEditingCard(p => p ? { ...p, area: v as EnemArea } : p)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(ENEM_AREAS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Assunto</Label><Input value={editingCard.subject} onChange={e => setEditingCard(p => p ? { ...p, subject: e.target.value } : p)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Deck</Label>
                  <Select value={editingCard.deckId || 'none'} onValueChange={v => setEditingCard(p => p ? { ...p, deckId: v === 'none' ? undefined : v } : p)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {decks.map(d => <SelectItem key={d.id} value={d.id}>{d.icon} {d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Tags</Label><Input value={(editingCard.tags || []).join(', ')} onChange={e => setEditingCard(p => p ? { ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) } : p)} /></div>
              </div>
              <Button onClick={updateEditingCard} className="w-full">Salvar Alterações</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
