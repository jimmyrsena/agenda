import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, X, Tag } from "lucide-react";
import { NoteTag } from "@/types/study";

const TAG_COLORS = [
  'bg-primary', 'bg-ms-green', 'bg-ms-orange', 'bg-ms-purple', 'bg-ms-teal', 'bg-ms-red',
  'bg-enem-linguagens', 'bg-enem-humanas', 'bg-enem-natureza', 'bg-enem-matematica',
];

interface Props {
  tags: NoteTag[];
  selectedTags: string[];
  onToggleTag: (tagId: string) => void;
  onAddTag: (tag: NoteTag) => void;
  onDeleteTag: (tagId: string) => void;
}

export function NoteTagManager({ tags, selectedTags, onToggleTag, onAddTag, onDeleteTag }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(TAG_COLORS[0]);

  const createTag = () => {
    if (!name.trim()) return;
    onAddTag({ id: crypto.randomUUID(), name: name.trim(), color });
    setName('');
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tags.map(tag => (
        <div key={tag.id} className="relative group">
          <Badge
            variant={selectedTags.includes(tag.id) ? "default" : "outline"}
            className={`text-[10px] cursor-pointer ${selectedTags.includes(tag.id) ? `${tag.color} text-white border-0` : ''}`}
            onClick={() => onToggleTag(tag.id)}
          >
            <Tag className="h-2.5 w-2.5 mr-0.5" />{tag.name}
          </Badge>
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteTag(tag.id); }}
            className="absolute -top-1 -right-1 hidden group-hover:flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
          >
            <X className="h-2 w-2" />
          </button>
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-0.5 px-1.5">
            <Plus className="h-2.5 w-2.5" /> Tag
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="text-sm">Nova Tag</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Nome</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Importante" className="h-8 text-sm" /></div>
            <div>
              <Label className="text-xs">Cor</Label>
              <div className="flex gap-1.5 mt-1">
                {TAG_COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full ${c} ${color === c ? 'ring-2 ring-offset-1 ring-primary' : ''}`} />
                ))}
              </div>
            </div>
            <Button onClick={createTag} size="sm" className="w-full" disabled={!name.trim()}>Criar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
