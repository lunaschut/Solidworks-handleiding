import React, { useRef, useState, useEffect } from 'react';
import { Pen, Circle, Square, Minus, Eraser, RotateCcw, Check, Sparkles } from 'lucide-react';

interface SketchPadProps {
  onSaveSketch: (dataUrl: string) => void;
  onCancel: () => void;
}

type Tool = 'pen' | 'line' | 'rect' | 'circle' | 'centerline' | 'eraser';

export const SketchPad: React.FC<SketchPadProps> = ({ onSaveSketch, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [strokeWidth, setStrokeWidth] = useState<number>(2.5);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-res canvas scale
    canvas.width = 640;
    canvas.height = 480;

    // Draw graph paper grid
    drawGrid(ctx, canvas.width, canvas.height);
  }, []);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#e2e8f0';

    const step = 20;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    setIsDrawing(true);
    setStartPos(pos);

    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getPos(e);

    if (tool === 'pen') {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([]);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#fafafa';
      ctx.lineWidth = strokeWidth * 4;
      ctx.lineCap = 'round';
      ctx.setLineDash([]);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
    } else if (snapshot) {
      ctx.putImageData(snapshot, 0, 0);

      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';

      if (tool === 'line') {
        ctx.strokeStyle = '#1e293b';
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
      } else if (tool === 'centerline') {
        ctx.strokeStyle = '#0284c7';
        ctx.setLineDash([8, 3, 2, 3]);
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
      } else if (tool === 'rect') {
        ctx.strokeStyle = '#1e293b';
        ctx.setLineDash([]);
        ctx.strokeRect(
          startPos.x,
          startPos.y,
          currentPos.x - startPos.x,
          currentPos.y - startPos.y
        );
      } else if (tool === 'circle') {
        ctx.strokeStyle = '#1e293b';
        ctx.setLineDash([]);
        const radius = Math.sqrt(
          Math.pow(currentPos.x - startPos.x, 2) + Math.pow(currentPos.y - startPos.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setStartPos(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawGrid(ctx, canvas.width, canvas.height);
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveSketch(dataUrl);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-500" />
            Handmatig Schetsen in de Browser
          </h3>
          <p className="text-xs text-slate-500">
            Teken hier een technisch concept (contouren, aanzichten, gaten, hartlijnen)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearCanvas}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Wissen
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            Gebruik Deze Schets
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
        <span className="text-xs font-medium text-slate-500 mr-1">Vorm / Tool:</span>
        <button
          onClick={() => setTool('pen')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
            tool === 'pen' ? 'bg-white text-red-700 shadow-xs border border-red-200' : 'text-slate-600 hover:bg-white/60'
          }`}
          title="Vrije hand pen"
        >
          <Pen className="w-3.5 h-3.5" /> Vrije Lijn
        </button>
        <button
          onClick={() => setTool('line')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
            tool === 'line' ? 'bg-white text-red-700 shadow-xs border border-red-200' : 'text-slate-600 hover:bg-white/60'
          }`}
          title="Rechte lijn"
        >
          <Minus className="w-3.5 h-3.5" /> Rechte Lijn
        </button>
        <button
          onClick={() => setTool('centerline')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
            tool === 'centerline' ? 'bg-white text-blue-700 shadow-xs border border-blue-200' : 'text-slate-600 hover:bg-white/60'
          }`}
          title="Hartlijn / Streep-puntlijn"
        >
          <span className="text-blue-600 font-mono text-xs">--•--</span> Hartlijn
        </button>
        <button
          onClick={() => setTool('circle')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
            tool === 'circle' ? 'bg-white text-red-700 shadow-xs border border-red-200' : 'text-slate-600 hover:bg-white/60'
          }`}
          title="Cirkel / Gat"
        >
          <Circle className="w-3.5 h-3.5" /> Cirkel / Gat
        </button>
        <button
          onClick={() => setTool('rect')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
            tool === 'rect' ? 'bg-white text-red-700 shadow-xs border border-red-200' : 'text-slate-600 hover:bg-white/60'
          }`}
          title="Rechthoek"
        >
          <Square className="w-3.5 h-3.5" /> Rechthoek
        </button>
        <button
          onClick={() => setTool('eraser')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
            tool === 'eraser' ? 'bg-white text-amber-700 shadow-xs border border-amber-200' : 'text-slate-600 hover:bg-white/60'
          }`}
          title="Gum"
        >
          <Eraser className="w-3.5 h-3.5" /> Gum
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

        <span className="text-xs font-medium text-slate-500 mr-1 hidden sm:inline">Dikte:</span>
        <div className="flex items-center gap-1">
          {[1.5, 3, 5].map((w) => (
            <button
              key={w}
              onClick={() => setStrokeWidth(w)}
              className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium ${
                strokeWidth === w ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              {w === 1.5 ? 'S' : w === 3 ? 'M' : 'L'}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex justify-center bg-slate-100 p-2 rounded-xl border border-slate-200 overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair shadow-sm rounded-lg max-w-full h-auto bg-white"
          style={{ maxHeight: '420px', touchAction: 'none' }}
        />
      </div>
    </div>
  );
};
