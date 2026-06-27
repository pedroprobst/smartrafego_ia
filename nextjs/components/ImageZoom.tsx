'use client';

import React, { useState, useRef, MouseEvent, WheelEvent, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Move, Image as ImageIcon } from 'lucide-react';

interface ImageZoomProps {
  originalUrl: string;
  processedUrl: string;
}

export default function ImageZoom({ originalUrl, processedUrl }: ImageZoomProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  
  // Track viewport container dimensions to limit panning boundaries
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomStep = 0.15;
    const newScale = e.deltaY < 0 
      ? Math.min(scale + zoomStep, 6) 
      : Math.max(scale - zoomStep, 1);
    
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
    setScale(newScale);
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || scale <= 1) return;
    
    let newX = e.clientX - dragStart.current.x;
    let newY = e.clientY - dragStart.current.y;
    
    // Bounds checking based on container size and scale factor
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const limitX = (containerWidth * (scale - 1)) / 2;
      const limitY = (containerHeight * (scale - 1)) / 2;
      
      newX = Math.max(-limitX, Math.min(limitX, newX));
      newY = Math.max(-limitY, Math.min(limitY, newY));
    }
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomButton = (direction: 'in' | 'out') => {
    const step = 0.5;
    const nextScale = direction === 'in' 
      ? Math.min(scale + step, 6) 
      : Math.max(scale - step, 1);
      
    if (nextScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
    setScale(nextScale);
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Zoom Control Bar */}
      <div className="flex justify-between items-center bg-card/60 backdrop-blur-md p-3 border border-border rounded-xl">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Move className="w-4 h-4" />
          <span>Arraste para navegar na imagem ({scale.toFixed(1)}x)</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleZoomButton('out')}
            disabled={scale <= 1}
            className="p-1.5 bg-card hover:bg-card-hover border border-border disabled:opacity-50 text-foreground rounded-lg transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetZoom}
            disabled={scale === 1 && position.x === 0 && position.y === 0}
            className="p-1.5 bg-card hover:bg-card-hover border border-border disabled:opacity-50 text-foreground rounded-lg transition"
            title="Resetar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoomButton('in')}
            disabled={scale >= 6}
            className="p-1.5 bg-card hover:bg-card-hover border border-border disabled:opacity-50 text-foreground rounded-lg transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Images Viewport Wrapper */}
      <div 
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden select-none bg-zinc-950 p-4 border border-border rounded-2xl relative ${
          scale > 1 ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        {/* Left Side: Original Image */}
        <div className="relative rounded-lg overflow-hidden border border-border bg-zinc-900 aspect-video flex items-center justify-center">
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-black/70 backdrop-blur-md border border-zinc-700/50 rounded-md text-[10px] uppercase font-semibold text-zinc-300">
            Original
          </div>
          <img
            src={originalUrl}
            alt="Original"
            className="w-full h-full object-contain pointer-events-none transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
            }}
          />
        </div>

        {/* Right Side: Processed Image */}
        <div className="relative rounded-lg overflow-hidden border border-border bg-zinc-900 aspect-video flex items-center justify-center">
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-primary/80 backdrop-blur-md border border-primary/20 rounded-md text-[10px] uppercase font-semibold text-white">
            Processada (YOLOv11)
          </div>
          <img
            src={processedUrl}
            alt="YOLOv11 Processed"
            className="w-full h-full object-contain pointer-events-none transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
            }}
          />
        </div>
      </div>
    </div>
  );
}
