import { useRef, useState, useEffect, useCallback } from 'react';

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  tool: string;
}

interface Props {
  tool: string;
  color: string;
  strokeWidth: number;
  clearSignal: number;
}

export function DrawingCanvas({ tool, color, strokeWidth, clearSignal }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const getCtx = () => canvasRef.current?.getContext('2d');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const resize = () => {
      canvas.width = parent.scrollWidth;
      canvas.height = parent.scrollHeight;
      redraw();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setStrokes([]);
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [clearSignal]);

  const redraw = useCallback(() => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokes) drawStroke(ctx, stroke);
    if (currentStroke) drawStroke(ctx, currentStroke);
  }, [strokes, currentStroke]);

  useEffect(() => { redraw(); }, [redraw]);

  function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.points.length < 2) return;
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.tool === 'Borracha') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = stroke.width * 4;
    } else if (stroke.tool === 'Marca-texto') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = stroke.color + '50';
      ctx.lineWidth = stroke.width * 6;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
    }

    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      if (stroke.tool === 'Caneta') {
        const prev = stroke.points[i - 1];
        const curr = stroke.points[i];
        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
      } else {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
    }
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }

  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tool) return;
    setIsDrawing(true);
    const pos = getPos(e);
    setCurrentStroke({ points: [pos], color, width: strokeWidth, tool });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentStroke) return;
    const pos = getPos(e);
    setCurrentStroke(prev => prev ? { ...prev, points: [...prev.points, pos] } : null);
  };

  const handleMouseUp = () => {
    if (currentStroke && currentStroke.points.length > 1) {
      setStrokes(prev => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
    setIsDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20"
      style={{ cursor: tool ? 'crosshair' : 'default', pointerEvents: tool ? 'auto' : 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}
