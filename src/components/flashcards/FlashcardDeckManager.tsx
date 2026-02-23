import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FolderOpen, Plus, Trash2 } from "lucide-react";
import { FlashcardDeck } from "@/types/study";
import { toast } from "sonner";

const DECK_COLORS = [
  'bg-primary', 'bg-ms-green', 'bg-ms-orange', 'bg-ms-purple', 'bg-ms-teal', 'bg-ms-red',
];
const DECK_ICONS = ['📚', '🧪', '🔢', '🌍', '✍️', '🎯', '💡', '🏛️', '🔬', '📖'];

interface Props {
  decks: FlashcardDeck[];
  selectedDeck: string | null;
  onSelect: (deckId: string | null) => void;
  onAdd: (deck: FlashcardDeck) => void;
  onDelete: (deckId: string) => void;
  cardCounts: Record<string, number>;
}

export function FlashcardDeckManager({ decks, selectedDeck, onSelect, onAdd, onDelete, cardCounts }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(DECK_COLORS[0]);
  const [icon, setIcon] = useState(DECK_ICONS[0]);

  const createDeck = () => {
    if (!name.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
      icon,
      createdAt: new Date().toISOString(),
    });
    setName('');
    setOpen(false);
    toast.success('Deck criado!');
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Button size="sm" variant={selectedDeck === null ? "default" : "outline"} className="h-7 text-xs" onClick={() => onSelect(null)}>
        Todos ({Object.values(cardCounts).reduce((a, b) => a + b, 0) || 0})
      </Button>

      {decks.map(deck => (
        <div key={deck.id} className="relative group">
          <Button
            size="sm"
            variant={selectedDeck === deck.id ? "default" : "outline"}
            className="h-7 text-xs gap-1"
            onClick={() => onSelect(selectedDeck === deck.id ? null : deck.id)}
          >
            {deck.icon} {deck.name}
            <Badge variant="secondary" className="text-[9px] ml-0.5 h-4 px-1">{cardCounts[deck.id] || 0}</Badge>
          </Button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(deck.id); }}
            className="absolute -top-1 -right-1 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[8px]"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </button>
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
            <Plus className="h-3 w-3" /> Deck
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Novo Deck</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Biologia Celular" />
            </div>
            <div>
              <Label>Ícone</Label>
              <div className="flex gap-1 flex-wrap mt-1">
                {DECK_ICONS.map(ic => (
                  <button key={ic} onClick={() => setIcon(ic)}
                    className={`w-8 h-8 rounded-md text-lg flex items-center justify-center border ${icon === ic ? 'border-primary ring-1 ring-primary' : 'border-border'}`}
                  >{ic}</button>
                ))}
              </div>
            </div>
            <div>
              <Label>Cor</Label>
              <div className="flex gap-1.5 mt-1">
                {DECK_COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full ${c} ${color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                  />
                ))}
              </div>
            </div>
            <Button onClick={createDeck} className="w-full" disabled={!name.trim()}>Criar Deck</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
