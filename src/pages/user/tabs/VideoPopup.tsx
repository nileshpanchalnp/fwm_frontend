// src/components/VideoPopup.tsx
import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, Maximize2, Minimize2, X, Shield } from 'lucide-react';

interface VideoPopupProps {
  youtubeId: string;
  title: string;
  onClose: () => void;
}

export function normalizeAudioUrl(url: string): string {
  if (!url) return '';
  if (url.includes('/preview')) return url;
  const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
  return url;
}

export function toDriveEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('/preview')) return url;
  const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  return url;
}

const VideoPopup: React.FC<VideoPopupProps> = ({ youtubeId, title, onClose }) => {
  const [pos, setPos] = useState({ x: Math.max(0, window.innerWidth / 2 - 300), y: Math.max(0, window.innerHeight / 2 - 200) });
  const [size, setSize] = useState({ w: 560, h: 360 });
  const [maximized, setMaximized] = useState(false);
  const dragging = useRef(false);
  const resizing = useRef(false);
  const offset = useRef({ dx: 0, dy: 0 });
  const resizeStart = useRef({ mx: 0, my: 0, w: 0, h: 0 });

  const onDragMouseDown = (e: React.MouseEvent) => {
    if (maximized) return;
    dragging.current = true;
    offset.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    e.preventDefault();
  };

  const onResizeMouseDown = (e: React.MouseEvent) => {
    if (maximized) return;
    resizing.current = true;
    resizeStart.current = { mx: e.clientX, my: e.clientY, w: size.w, h: size.h };
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (dragging.current) {
        setPos({
          x: Math.max(0, Math.min(window.innerWidth - size.w, e.clientX - offset.current.dx)),
          y: Math.max(0, Math.min(window.innerHeight - 120, e.clientY - offset.current.dy)),
        });
      }
      if (resizing.current) {
        const dw = e.clientX - resizeStart.current.mx;
        const dh = e.clientY - resizeStart.current.my;
        setSize({
          w: Math.max(320, resizeStart.current.w + dw),
          h: Math.max(200, resizeStart.current.h + dh),
        });
      }
    };
    const up = () => { dragging.current = false; resizing.current = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [size.w]);

  const snaps = [
    { label: 'TL', x: 20, y: 20 },
    { label: 'TR', x: window.innerWidth - size.w - 20, y: 20 },
    { label: 'C', x: window.innerWidth / 2 - size.w / 2, y: window.innerHeight / 2 - size.h / 2 },
    { label: 'BL', x: 20, y: window.innerHeight - size.h - 20 },
    { label: 'BR', x: window.innerWidth - size.w - 20, y: window.innerHeight - size.h - 20 },
  ];

  const boxStyle = maximized
    ? { position: 'fixed' as const, inset: 0, zIndex: 9999, borderRadius: 0, width: '100vw', height: '100vh' }
    : { position: 'fixed' as const, left: pos.x, top: pos.y, width: size.w, height: size.h + 88, zIndex: 9999 };

  return (
    <div
      style={boxStyle}
      className={`bg-gray-900 shadow-2xl flex flex-col overflow-hidden ${!maximized ? 'rounded-2xl border border-gray-700' : ''}`}
    >
      <div
        className="flex items-center justify-between px-3 py-2 bg-gray-800 cursor-move flex-shrink-0 select-none"
        onMouseDown={onDragMouseDown}
      >
        <div className="flex items-center gap-1.5">
          <GripVertical className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-gray-300 text-xs font-semibold truncate max-w-[200px]">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {!maximized && snaps.map(s => (
            <button key={s.label} title={`Snap ${s.label}`}
              onClick={() => setPos({ x: Math.max(0, s.x), y: Math.max(0, s.y) })}
              className="w-5 h-5 rounded text-gray-500 hover:text-white hover:bg-gray-700 flex items-center justify-center text-[9px] font-bold">
              {s.label}
            </button>
          ))}
          <button onClick={() => setMaximized(m => !m)}
            className="w-6 h-6 rounded text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center">
            {maximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onClose}
            className="w-6 h-6 rounded text-gray-400 hover:text-red-400 hover:bg-gray-700 flex items-center justify-center">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-black" onContextMenu={e => e.preventDefault()}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          className="w-full h-full"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        />
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-gray-500" />
          <span className="text-[10px] text-gray-500">Protected · No download · Drag bar to move</span>
        </div>
        {!maximized && (
          <div
            className="w-5 h-5 flex items-end justify-end cursor-se-resize opacity-40 hover:opacity-100"
            onMouseDown={onResizeMouseDown}
          >
            <svg viewBox="0 0 10 10" className="w-3 h-3 text-gray-400 fill-current">
              <path d="M10 0L10 10L0 10Z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPopup;