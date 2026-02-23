import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";
import type { RulerMargins } from "./WordRulers";

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (config: {
    margins: RulerMargins;
    topMargin: number;
    bottomMargin: number;
    lineSpacing: number;
    fontFamily: string;
    fontSize: string;
    firstLineIndent: number;
  }) => void;
}

const ABNT_CONFIG = {
  margins: { leftMarginCm: 3, rightMarginCm: 2, firstLineIndentCm: 1.25, hangingIndentCm: 0 },
  topMargin: 3,
  bottomMargin: 2,
  lineSpacing: 1.5,
  fontFamily: 'Times New Roman',
  fontSize: '12',
  firstLineIndent: 1.25,
};

const ABNT_RULES = [
  { rule: 'Fonte', value: 'Times New Roman ou Arial, 12pt' },
  { rule: 'Espaçamento', value: '1,5 entre linhas' },
  { rule: 'Margem Superior', value: '3 cm' },
  { rule: 'Margem Inferior', value: '2 cm' },
  { rule: 'Margem Esquerda', value: '3 cm' },
  { rule: 'Margem Direita', value: '2 cm' },
  { rule: 'Recuo 1ª linha', value: '1,25 cm' },
  { rule: 'Alinhamento', value: 'Justificado' },
  { rule: 'Paginação', value: 'Números arábicos, canto superior direito' },
];

export function ABNTFormatter({ open, onClose, onApply }: Props) {
  const apply = () => {
    onApply(ABNT_CONFIG);
    toast.success('Formatação ABNT aplicada! 📋');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Formatação ABNT NBR 14724
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Aplique automaticamente todas as normas ABNT ao seu documento com um clique.
          </p>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <tbody>
                {ABNT_RULES.map(r => (
                  <tr key={r.rule} className="border-b last:border-0">
                    <td className="px-3 py-1.5 font-medium bg-muted/30">{r.rule}</td>
                    <td className="px-3 py-1.5">{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={apply} className="w-full h-8 text-xs gap-2">
            <CheckCircle className="h-3.5 w-3.5" /> Aplicar Formatação ABNT
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
