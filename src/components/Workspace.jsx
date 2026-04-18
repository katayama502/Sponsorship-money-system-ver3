import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function Workspace({ activeWorkspace, setActiveWorkspace, splitRatio, setSplitRatio, isDragging, setIsDragging }) {
  const [materialLoaded, setMaterialLoaded] = useState(false);
  const [scratchLoaded, setScratchLoaded] = useState(false);

  if (!activeWorkspace) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col text-left">
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-black tracking-widest">WORKSTATION</div>
          <h3 className="text-white font-bold text-lg truncate max-w-xl">{activeWorkspace.title}</h3>
        </div>
        <button
          onClick={() => setActiveWorkspace(null)}
          aria-label="ワークスペースを閉じる"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest"
        >
          <X size={16} /> とじる
        </button>
      </div>
      <div className="flex-1 flex overflow-hidden relative select-none">
        <div className="bg-white relative" style={{ width: `${splitRatio}%` }}>
          {!materialLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-slate-500 font-bold">よみこみちゅう...</p>
              </div>
            </div>
          )}
          {/* sandbox: allow scripts/forms/popups for external learning materials, but restrict navigation */}
          <iframe
            src={activeWorkspace.url}
            title="Materials"
            className={`w-full h-full ${isDragging ? 'pointer-events-none' : ''}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-presentation"
            onLoad={() => setMaterialLoaded(true)}
          />
        </div>

        {/* Resizer Handle */}
        <div
          className="w-4 bg-slate-800 hover:bg-orange-500 cursor-col-resize flex items-center justify-center shrink-0 transition-colors z-50"
          onMouseDown={() => setIsDragging(true)}
          aria-label="分割バーをドラッグしてサイズを変更"
        >
          <div className="w-1 h-8 bg-slate-600 rounded-full" />
        </div>

        <div className="bg-[#E9F1FC] relative flex-1">
          {!scratchLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#E9F1FC] z-10">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-slate-500 font-bold">Scratch をよみこみちゅう...</p>
              </div>
            </div>
          )}
          {/* Scratch editor: same-origin only, allow all needed APIs */}
          <iframe
            src="/scratch/editor.html"
            title="Scratch GUI"
            className={`w-full h-full ${isDragging ? 'pointer-events-none' : ''}`}
            frameBorder="0"
            allow="geolocation; microphone; camera; midi"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-downloads"
            onLoad={() => setScratchLoaded(true)}
          />
        </div>

        {/* Overlay to catch mouse events during drag */}
        {isDragging && <div className="absolute inset-0 z-[100] cursor-col-resize" />}
      </div>
    </div>
  );
}
