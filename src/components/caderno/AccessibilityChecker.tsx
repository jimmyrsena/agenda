import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accessibility, CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";

interface Issue {
  type: 'error' | 'warning' | 'info';
  message: string;
  fix?: string;
}

interface Props {
  content: string;
  title: string;
  onClose: () => void;
}

export function AccessibilityChecker({ content, title, onClose }: Props) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [checked, setChecked] = useState(false);

  const runCheck = useCallback(() => {
    const found: Issue[] = [];
    const plainText = content.replace(/<[^>]*>/g, '').trim();

    // Check for title
    if (!title.trim()) found.push({ type: 'error', message: 'Documento sem título', fix: 'Adicione um título ao documento.' });

    // Check for headings
    if (!content.includes('<h1') && !content.includes('<h2')) {
      found.push({ type: 'warning', message: 'Sem títulos/subtítulos', fix: 'Adicione cabeçalhos (H1, H2) para estruturar o conteúdo.' });
    }

    // Check heading hierarchy
    const headingMatches = content.match(/<h(\d)/g) || [];
    const levels = headingMatches.map(h => parseInt(h.replace('<h', '')));
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] - levels[i - 1] > 1) {
        found.push({ type: 'warning', message: `Hierarquia de títulos saltou de H${levels[i - 1]} para H${levels[i]}`, fix: 'Não pule níveis de cabeçalho.' });
        break;
      }
    }

    // Check for images without alt text
    const imgMatches = content.match(/<img[^>]*>/g) || [];
    const noAlt = imgMatches.filter(img => !img.includes('alt=') || img.includes('alt=""'));
    if (noAlt.length > 0) found.push({ type: 'error', message: `${noAlt.length} imagem(ns) sem texto alternativo`, fix: 'Adicione descrição alt a todas as imagens.' });

    // Check for very long paragraphs
    const paragraphs = plainText.split(/\n\n+/);
    const longParas = paragraphs.filter(p => p.split(/\s+/).length > 150);
    if (longParas.length > 0) found.push({ type: 'warning', message: `${longParas.length} parágrafo(s) muito longo(s) (>150 palavras)`, fix: 'Divida parágrafos longos para melhor leitura.' });

    // Check for contrast (text color on colored backgrounds)
    if (content.includes('color: #fff') || content.includes('color: white')) {
      found.push({ type: 'warning', message: 'Possível baixo contraste: texto branco detectado', fix: 'Verifique se o texto tem contraste suficiente com o fundo.' });
    }

    // Check for link text
    const linkMatches = content.match(/<a[^>]*>([^<]*)<\/a>/g) || [];
    const badLinks = linkMatches.filter(l => />(clique aqui|aqui|link)</.test(l.toLowerCase()));
    if (badLinks.length > 0) found.push({ type: 'warning', message: 'Links genéricos como "clique aqui" encontrados', fix: 'Use textos descritivos para links.' });

    // Check for lists
    if (plainText.split(/\s+/).length > 200 && !content.includes('<ul') && !content.includes('<ol') && !content.includes('<li')) {
      found.push({ type: 'info', message: 'Documento longo sem listas', fix: 'Considere usar listas para melhorar a legibilidade.' });
    }

    // Check for tables without headers
    if (content.includes('<table') && !content.includes('<th')) {
      found.push({ type: 'warning', message: 'Tabela sem cabeçalhos', fix: 'Adicione cabeçalhos à tabela para leitores de tela.' });
    }

    // Check document length
    if (plainText.length < 50 && plainText.length > 0) {
      found.push({ type: 'info', message: 'Documento muito curto', fix: 'O conteúdo pode precisar de mais detalhes.' });
    }

    if (found.length === 0) found.push({ type: 'info', message: 'Nenhum problema de acessibilidade encontrado! ✨' });

    setIssues(found);
    setChecked(true);
  }, [content, title]);

  const iconFor = (type: Issue['type']) => {
    if (type === 'error') return <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />;
    if (type === 'warning') return <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />;
    return <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />;
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Accessibility className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">Verificador de Acessibilidade</span>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={runCheck}>
              <Accessibility className="h-3 w-3" /> {checked ? 'Reverificar' : 'Verificar'}
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClose}><X className="h-3 w-3" /></Button>
          </div>
        </div>

        {checked && (
          <ScrollArea className="max-h-[200px]">
            <div className="space-y-1.5">
              {issues.map((issue, i) => (
                <div key={i} className={`flex gap-2 p-1.5 rounded text-[10px] ${
                  issue.type === 'error' ? 'bg-destructive/5 border border-destructive/10' :
                  issue.type === 'warning' ? 'bg-yellow-500/5 border border-yellow-500/10' :
                  'bg-green-500/5 border border-green-500/10'}`}>
                  {iconFor(issue.type)}
                  <div>
                    <p className="font-medium">{issue.message}</p>
                    {issue.fix && <p className="text-[9px] text-muted-foreground mt-0.5">{issue.fix}</p>}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {!checked && <p className="text-[9px] text-muted-foreground">Clique em "Verificar" para analisar a acessibilidade do documento.</p>}
      </CardContent>
    </Card>
  );
}
