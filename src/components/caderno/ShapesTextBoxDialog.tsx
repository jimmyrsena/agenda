import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const SHAPES = [
  { name: 'Retângulo', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect x="2" y="2" width="96" height="56" rx="4" fill="FILL" stroke="STROKE" stroke-width="2"/></svg>' },
  { name: 'Retângulo Arredondado', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect x="2" y="2" width="96" height="56" rx="14" fill="FILL" stroke="STROKE" stroke-width="2"/></svg>' },
  { name: 'Círculo', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="38" fill="FILL" stroke="STROKE" stroke-width="2"/></svg>' },
  { name: 'Elipse', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><ellipse cx="50" cy="30" rx="48" ry="28" fill="FILL" stroke="STROKE" stroke-width="2"/></svg>' },
  { name: 'Triângulo', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 87"><polygon points="50,2 98,85 2,85" fill="FILL" stroke="STROKE" stroke-width="2"/></svg>' },
  { name: 'Losango', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><polygon points="40,2 78,40 40,78 2,40" fill="FILL" stroke="STROKE" stroke-width="2"/></svg>' },
  { name: 'Pentágono', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 95"><polygon points="50,2 97,35 78,90 22,90 3,35" fill="FILL" stroke="STROKE" stroke-width="2"/></svg>' },
  { name: 'Hexágono', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 87"><polygon points="50,2 97,24 97,63 50,85 3,63 3,24" fill="FILL" stroke="STROKE" stroke-width="2"/></svg>' },
  { name: 'Estrela', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 95"><polygon points="50,2 61,35 97,35 68,57 79,90 50,70 21,90 32,57 3,35 39,35" fill="FILL" stroke="STROKE" stroke-width="2"/></svg>' },
  { name: 'Seta Direita', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><polygon points="0,15 65,15 65,0 100,30 65,60 65,45 0,45" fill="FILL" stroke="STROKE" stroke-width="2"/></svg>' },
  { name: 'Seta Esquerda', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><polygon points="100,15 35,15 35,0 0,30 35,60 35,45 100,45" fill="FILL" stroke="STROKE" stroke-width="2"/></svg>' },
  { name: 'Coração', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 90"><path d="M50,85 C25,65 0,45 0,25 C0,10 12,0 25,0 C35,0 45,8 50,15 C55,8 65,0 75,0 C88,0 100,10 100,25 C100,45 75,65 50,85Z" fill="FILL" stroke="STROKE" stroke-width="2"/></svg>' },
];

const SHAPE_COLORS = [
  { name: 'Transparente', fill: 'none', stroke: '#333333' },
  { name: 'Azul', fill: '#dbeafe', stroke: '#3b82f6' },
  { name: 'Verde', fill: '#dcfce7', stroke: '#22c55e' },
  { name: 'Vermelho', fill: '#fee2e2', stroke: '#ef4444' },
  { name: 'Amarelo', fill: '#fef9c3', stroke: '#eab308' },
  { name: 'Roxo', fill: '#f3e8ff', stroke: '#a855f7' },
  { name: 'Cinza', fill: '#f3f4f6', stroke: '#6b7280' },
];

// Use same colors for display
const SHAPE_COLORS_DISPLAY = SHAPE_COLORS.map(c => ({
  ...c,
  fill: c.fill === 'none' ? 'transparent' : c.fill,
}));

interface Props {
  open: boolean;
  onClose: () => void;
  onInsertShape: (src: string, width: number) => void;
  onInsertTextBox: (text: string) => void;
  mode: 'shapes' | 'textbox';
}

export function ShapesTextBoxDialog({ open, onClose, onInsertShape, onInsertTextBox, mode }: Props) {
  const [selectedColorIdx, setSelectedColorIdx] = useState(1);
  const [textBoxText, setTextBoxText] = useState('Texto aqui...');
  const [shapeSize, setShapeSize] = useState(120);

  const insertShape = (shape: typeof SHAPES[0]) => {
    const color = SHAPE_COLORS[selectedColorIdx];
    let svg = shape.svg.replace(/FILL/g, color.fill).replace(/STROKE/g, color.stroke);
    const dataUri = `data:image/svg+xml;base64,${btoa(svg)}`;
    onInsertShape(dataUri, shapeSize);
    onClose();
  };

  const insertTextBox = () => {
    onInsertTextBox(textBoxText);
    onClose();
  };

  // Preview SVG for shape grid
  const previewSvg = (shape: typeof SHAPES[0]) => {
    const color = SHAPE_COLORS_DISPLAY[selectedColorIdx];
    return shape.svg.replace(/FILL/g, color.fill === 'transparent' ? 'none' : color.fill).replace(/STROKE/g, color.stroke);
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm">
            {mode === 'shapes' ? '🔷 Inserir Forma' : '📦 Inserir Caixa de Texto'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'shapes' && (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Cor:</p>
              <div className="flex gap-1.5">
                {SHAPE_COLORS_DISPLAY.map((c, i) => (
                  <button key={c.name}
                    className={`w-7 h-7 rounded-md border-2 transition-all ${selectedColorIdx === i ? 'ring-2 ring-primary ring-offset-1' : 'hover:ring-1 ring-ring'}`}
                    style={{ backgroundColor: c.fill, borderColor: c.stroke }}
                    onClick={() => setSelectedColorIdx(i)} title={c.name} />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">Tamanho:</p>
              <input type="range" min={60} max={300} value={shapeSize} onChange={e => setShapeSize(Number(e.target.value))}
                className="flex-1 h-1 accent-primary" />
              <span className="text-xs text-muted-foreground w-10">{shapeSize}px</span>
            </div>

            <ScrollArea className="h-[240px]">
              <div className="grid grid-cols-4 gap-2">
                {SHAPES.map(shape => (
                  <button key={shape.name}
                    className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-accent hover:border-primary/30 transition-colors gap-1"
                    onClick={() => insertShape(shape)}>
                    <div className="w-10 h-10 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: previewSvg(shape) }} />
                    <span className="text-[9px] text-muted-foreground">{shape.name}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {mode === 'textbox' && (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Texto:</p>
              <Input value={textBoxText} onChange={e => setTextBoxText(e.target.value)}
                placeholder="Digite o texto da caixa..." className="text-sm" />
            </div>

            <div className="p-3 bg-muted rounded-md">
              <p className="text-[10px] text-muted-foreground mb-1">Preview:</p>
              <div className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground bg-card p-3 rounded">
                <p className="text-sm">{textBoxText}</p>
              </div>
            </div>

            <Button onClick={insertTextBox} className="w-full" size="sm">Inserir Caixa de Texto</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
