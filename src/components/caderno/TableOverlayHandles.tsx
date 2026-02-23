import { useState, useEffect, useRef, useCallback } from 'react';
import type { Editor } from '@tiptap/core';
import { Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement>;
}

interface CellRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TableOverlayHandles({ editor, containerRef }: Props) {
  const [tableEl, setTableEl] = useState<HTMLTableElement | null>(null);
  const [tablePos, setTablePos] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [colEdges, setColEdges] = useState<number[]>([]);
  const [rowEdges, setRowEdges] = useState<number[]>([]);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [dragging, setDragging] = useState<{ type: 'col' | 'row'; index: number; start: number; original: number[] } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'col' | 'row'; index: number } | null>(null);

  // Detect table under cursor or selection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const findTable = () => {
      if (editor.isActive('table')) {
        const { $from } = editor.state.selection;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type.name === 'table') {
            const domNode = editor.view.nodeDOM($from.before(d));
            if (domNode) {
              const table = domNode instanceof HTMLTableElement
                ? domNode
                : (domNode as HTMLElement).querySelector?.('table');
              if (table) { setTableEl(table); return; }
            }
          }
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (dragging) return;
      const target = e.target as HTMLElement;
      const table = target.closest('table');
      if (table && container.contains(table)) {
        setTableEl(table);
      } else if (!editor.isActive('table')) {
        setTableEl(null);
        setContextMenu(null);
      }
    };

    editor.on('selectionUpdate', findTable);
    container.addEventListener('mousemove', onMouseMove);
    return () => {
      editor.off('selectionUpdate', findTable);
      container.removeEventListener('mousemove', onMouseMove);
    };
  }, [editor, containerRef, dragging]);

  // Compute edges
  useEffect(() => {
    if (!tableEl || !containerRef.current) {
      setTablePos(null);
      setColEdges([]);
      setRowEdges([]);
      return;
    }

    const compute = () => {
      const cRect = containerRef.current!.getBoundingClientRect();
      const tRect = tableEl.getBoundingClientRect();
      setTablePos({
        top: tRect.top - cRect.top,
        left: tRect.left - cRect.left,
        width: tRect.width,
        height: tRect.height,
      });

      // Column edges from first row cells
      const firstRow = tableEl.querySelector('tr');
      if (firstRow) {
        const cells = Array.from(firstRow.children) as HTMLElement[];
        const edges: number[] = [];
        cells.forEach((cell) => {
          const r = cell.getBoundingClientRect();
          edges.push(r.right - cRect.left);
        });
        setColEdges(edges);
      }

      // Row edges from rows
      const rows = Array.from(tableEl.querySelectorAll('tr')) as HTMLElement[];
      const rEdges: number[] = [];
      rows.forEach((row) => {
        const r = row.getBoundingClientRect();
        rEdges.push(r.bottom - cRect.top);
      });
      setRowEdges(rEdges);
    };

    compute();
    const obs = new ResizeObserver(compute);
    obs.observe(tableEl);
    window.addEventListener('scroll', compute, true);
    return () => { obs.disconnect(); window.removeEventListener('scroll', compute, true); };
  }, [tableEl, containerRef]);

  // Column drag resize
  const startColDrag = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!tableEl) return;

    const firstRow = tableEl.querySelector('tr');
    if (!firstRow) return;
    const cells = Array.from(firstRow.children) as HTMLElement[];
    const originalWidths = cells.map(c => c.getBoundingClientRect().width);

    setDragging({ type: 'col', index, start: e.clientX, original: originalWidths });

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - e.clientX;
      const newW = Math.max(30, originalWidths[index] + dx);
      // Apply to all cells in this column
      const allRows = tableEl.querySelectorAll('tr');
      allRows.forEach(row => {
        const cell = row.children[index] as HTMLElement;
        if (cell) cell.style.width = `${newW}px`;
      });
    };

    const onUp = () => {
      setDragging(null);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [tableEl]);

  // Row drag resize
  const startRowDrag = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!tableEl) return;

    const rows = Array.from(tableEl.querySelectorAll('tr')) as HTMLElement[];
    const originalHeights = rows.map(r => r.getBoundingClientRect().height);

    setDragging({ type: 'row', index, start: e.clientY, original: originalHeights });

    const onMove = (ev: MouseEvent) => {
      const dy = ev.clientY - e.clientY;
      const newH = Math.max(24, originalHeights[index] + dy);
      rows[index].style.height = `${newH}px`;
    };

    const onUp = () => {
      setDragging(null);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [tableEl]);

  // Context actions
  const focusTableCell = useCallback((row: number, col: number) => {
    if (!tableEl || !editor) return;
    const cell = tableEl.querySelectorAll('tr')[row]?.children[col] as HTMLElement;
    if (cell) {
      const pos = editor.view.posAtDOM(cell, 0);
      editor.chain().focus().setTextSelection(pos).run();
    }
  }, [tableEl, editor]);

  const addColBefore = useCallback((idx: number) => {
    focusTableCell(0, idx);
    setTimeout(() => editor.chain().focus().addColumnBefore().run(), 10);
    setContextMenu(null);
  }, [editor, focusTableCell]);

  const addColAfter = useCallback((idx: number) => {
    focusTableCell(0, idx);
    setTimeout(() => editor.chain().focus().addColumnAfter().run(), 10);
    setContextMenu(null);
  }, [editor, focusTableCell]);

  const deleteCol = useCallback((idx: number) => {
    focusTableCell(0, idx);
    setTimeout(() => editor.chain().focus().deleteColumn().run(), 10);
    setContextMenu(null);
  }, [editor, focusTableCell]);

  const addRowBefore = useCallback((idx: number) => {
    focusTableCell(idx, 0);
    setTimeout(() => editor.chain().focus().addRowBefore().run(), 10);
    setContextMenu(null);
  }, [editor, focusTableCell]);

  const addRowAfter = useCallback((idx: number) => {
    focusTableCell(idx, 0);
    setTimeout(() => editor.chain().focus().addRowAfter().run(), 10);
    setContextMenu(null);
  }, [editor, focusTableCell]);

  const deleteRow = useCallback((idx: number) => {
    focusTableCell(idx, 0);
    setTimeout(() => editor.chain().focus().deleteRow().run(), 10);
    setContextMenu(null);
  }, [editor, focusTableCell]);

  const deleteTable = useCallback(() => {
    editor.chain().focus().deleteTable().run();
    setTableEl(null);
    setContextMenu(null);
  }, [editor]);

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [contextMenu]);

  if (!tablePos || !tableEl) return null;

  const HANDLE_SIZE = 6;
  const HEADER_SIZE = 16;

  return (
    <>
      {/* Column header indicators (top of table) */}
      {colEdges.map((edge, i) => {
        const left = i === 0 ? tablePos.left : colEdges[i - 1];
        const width = edge - left;
        return (
          <div
            key={`col-header-${i}`}
            className="absolute z-10 cursor-pointer transition-colors flex items-center justify-center"
            style={{
              top: tablePos.top - HEADER_SIZE - 2,
              left,
              width,
              height: HEADER_SIZE,
              backgroundColor: hoveredCol === i ? 'hsl(var(--primary) / 0.15)' : 'transparent',
              borderRadius: '2px 2px 0 0',
            }}
            onMouseEnter={() => setHoveredCol(i)}
            onMouseLeave={() => setHoveredCol(null)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setContextMenu({ x: left, y: tablePos.top - HEADER_SIZE - 4, type: 'col', index: i });
            }}
          >
            {hoveredCol === i && (
              <div className="w-1 rounded-full bg-primary" style={{ height: HEADER_SIZE - 4 }} />
            )}
          </div>
        );
      })}

      {/* Row header indicators (left of table) */}
      {rowEdges.map((edge, i) => {
        const top = i === 0 ? tablePos.top : rowEdges[i - 1];
        const height = edge - top;
        return (
          <div
            key={`row-header-${i}`}
            className="absolute z-10 cursor-pointer transition-colors flex items-center justify-center"
            style={{
              top,
              left: tablePos.left - HEADER_SIZE - 2,
              width: HEADER_SIZE,
              height,
              backgroundColor: hoveredRow === i ? 'hsl(var(--primary) / 0.15)' : 'transparent',
              borderRadius: '2px 0 0 2px',
            }}
            onMouseEnter={() => setHoveredRow(i)}
            onMouseLeave={() => setHoveredRow(null)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setContextMenu({ x: tablePos.left - HEADER_SIZE - 4, y: top, type: 'row', index: i });
            }}
          >
            {hoveredRow === i && (
              <div className="h-1 rounded-full bg-primary" style={{ width: HEADER_SIZE - 4 }} />
            )}
          </div>
        );
      })}

      {/* Column resize handles (vertical blue lines between columns) */}
      {colEdges.map((edge, i) => (
        <div
          key={`col-handle-${i}`}
          className="absolute z-20 group"
          style={{
            top: tablePos.top,
            left: edge - HANDLE_SIZE / 2,
            width: HANDLE_SIZE,
            height: tablePos.height,
            cursor: 'col-resize',
          }}
          onMouseDown={(e) => startColDrag(i, e)}
        >
          <div
            className="w-[2px] h-full mx-auto transition-colors group-hover:bg-primary bg-transparent"
          />
        </div>
      ))}

      {/* Row resize handles (horizontal blue lines between rows) */}
      {rowEdges.map((edge, i) => (
        <div
          key={`row-handle-${i}`}
          className="absolute z-20 group"
          style={{
            top: edge - HANDLE_SIZE / 2,
            left: tablePos.left,
            width: tablePos.width,
            height: HANDLE_SIZE,
            cursor: 'row-resize',
          }}
          onMouseDown={(e) => startRowDrag(i, e)}
        >
          <div
            className="h-[2px] w-full my-auto transition-colors group-hover:bg-primary bg-transparent"
          />
        </div>
      ))}

      {/* Quick add column button (right edge) */}
      <button
        title="Adicionar coluna"
        className="absolute z-20 flex items-center justify-center w-5 h-5 rounded-full bg-primary/80 text-primary-foreground shadow cursor-pointer hover:bg-primary transition-colors opacity-0 hover:opacity-100"
        style={{
          top: tablePos.top + tablePos.height / 2 - 10,
          left: tablePos.left + tablePos.width + 4,
        }}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().addColumnAfter().run();
        }}
      >
        <Plus className="h-3 w-3" />
      </button>

      {/* Quick add row button (bottom edge) */}
      <button
        title="Adicionar linha"
        className="absolute z-20 flex items-center justify-center w-5 h-5 rounded-full bg-primary/80 text-primary-foreground shadow cursor-pointer hover:bg-primary transition-colors opacity-0 hover:opacity-100"
        style={{
          top: tablePos.top + tablePos.height + 4,
          left: tablePos.left + tablePos.width / 2 - 10,
        }}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().addRowAfter().run();
        }}
      >
        <Plus className="h-3 w-3" />
      </button>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="absolute z-50 bg-popover border rounded-lg shadow-lg py-1 min-w-[160px] text-sm"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'col' ? (
            <>
              <button className="w-full text-left px-3 py-1.5 hover:bg-accent flex items-center gap-2" onClick={() => addColBefore(contextMenu.index)}>
                <Plus className="h-3.5 w-3.5" /> Inserir coluna antes
              </button>
              <button className="w-full text-left px-3 py-1.5 hover:bg-accent flex items-center gap-2" onClick={() => addColAfter(contextMenu.index)}>
                <Plus className="h-3.5 w-3.5" /> Inserir coluna depois
              </button>
              <div className="h-px bg-border my-1" />
              <button className="w-full text-left px-3 py-1.5 hover:bg-accent flex items-center gap-2 text-destructive" onClick={() => deleteCol(contextMenu.index)}>
                <Trash2 className="h-3.5 w-3.5" /> Excluir coluna
              </button>
            </>
          ) : (
            <>
              <button className="w-full text-left px-3 py-1.5 hover:bg-accent flex items-center gap-2" onClick={() => addRowBefore(contextMenu.index)}>
                <ArrowUp className="h-3.5 w-3.5" /> Inserir linha acima
              </button>
              <button className="w-full text-left px-3 py-1.5 hover:bg-accent flex items-center gap-2" onClick={() => addRowAfter(contextMenu.index)}>
                <ArrowDown className="h-3.5 w-3.5" /> Inserir linha abaixo
              </button>
              <div className="h-px bg-border my-1" />
              <button className="w-full text-left px-3 py-1.5 hover:bg-accent flex items-center gap-2 text-destructive" onClick={() => deleteRow(contextMenu.index)}>
                <Trash2 className="h-3.5 w-3.5" /> Excluir linha
              </button>
            </>
          )}
          <div className="h-px bg-border my-1" />
          <button className="w-full text-left px-3 py-1.5 hover:bg-accent flex items-center gap-2 text-destructive" onClick={deleteTable}>
            <Trash2 className="h-3.5 w-3.5" /> Excluir tabela
          </button>
        </div>
      )}
    </>
  );
}
