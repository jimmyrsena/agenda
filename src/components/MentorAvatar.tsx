import { useState, useEffect, useRef, useCallback } from "react";
import { GraduationCap, X, Maximize2, Minimize2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { KanbanTask } from "@/types/study";
import { MentorChat } from "@/components/MentorChat";

export function MentorAvatar() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [tasks] = useLocalStorage<KanbanTask[]>('kanban-tasks', []);
  const [pulse, setPulse] = useState(false);

  // Drag state
  const [pos, setPos] = useLocalStorage<{ x: number; y: number }>('mentor-pos', { x: -1, y: -1 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const getDefaultPos = useCallback(() => ({
    x: window.innerWidth - 72,
    y: window.innerHeight - 72,
  }), []);

  useEffect(() => {
    if (pos.x === -1 && pos.y === -1) setPos(getDefaultPos());
  }, []);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.column !== 'done');
    if (overdue.length > 0) setPulse(true);
  }, [tasks]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (open) return;
    setDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [open, pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const newX = Math.max(0, Math.min(window.innerWidth - 56, e.clientX - dragOffset.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 56, e.clientY - dragOffset.current.y));
    setPos({ x: newX, y: newY });
  }, [dragging]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    const dx = Math.abs(e.clientX - (pos.x + dragOffset.current.x));
    const dy = Math.abs(e.clientY - (pos.y + dragOffset.current.y));
    if (dx < 5 && dy < 5) {
      setOpen(true);
      setPulse(false);
    }
  }, [dragging, pos]);

  const actualPos = pos.x === -1 ? getDefaultPos() : pos;
  const panelW = expanded ? 560 : 400;
  const panelH = expanded ? 650 : 540;
  const panelX = Math.min(actualPos.x, window.innerWidth - panelW - 8);
  const panelY = Math.max(8, actualPos.y - panelH - 8);

  return (
    <>
      {!open && (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ left: actualPos.x, top: actualPos.y, touchAction: 'none' }}
          className={`fixed z-50 w-14 h-14 rounded-2xl mentor-gradient shadow-lg hover:shadow-xl transition-all flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${pulse ? 'animate-bounce' : ''}`}
          title="Mentor — Arraste para mover"
        >
          <GraduationCap className="h-7 w-7 text-white pointer-events-none" />
          {pulse && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full border-2 border-background animate-pulse" />
          )}
        </div>
      )}

      {open && (
        <div
          style={{
            left: Math.max(8, panelX),
            top: Math.max(8, panelY),
            width: panelW,
            height: panelH,
            maxWidth: 'calc(100vw - 1rem)',
            maxHeight: 'calc(100vh - 1rem)',
          }}
          className="fixed z-50 flex flex-col rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Extra controls overlaid on MentorChat header */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
            <button onClick={() => setExpanded(!expanded)} className="text-white/70 hover:text-white transition-opacity">
              {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-opacity">
              <X className="h-5 w-5" />
            </button>
          </div>
          <MentorChat />
        </div>
      )}
    </>
  );
}