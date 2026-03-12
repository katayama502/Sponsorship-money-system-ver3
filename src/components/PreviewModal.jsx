import React from 'react';
import { X } from 'lucide-react';

export default function PreviewModal({ previewModal, setPreviewModal }) {
  if (!previewModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 lg:p-8"
      onClick={() => setPreviewModal(null)}
    >
      <div
        className={`bg-slate-900 rounded-3xl overflow-hidden shadow-2xl w-full max-w-5xl flex flex-col ${previewModal.type === 'pdf' ? 'h-[90vh]' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className={`text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${previewModal.type === 'youtube' ? 'bg-red-600' : 'bg-orange-600'}`}>
              {previewModal.type === 'youtube' ? 'YouTube' : 'プレビュー'}
            </span>
            <h3 className="text-white font-bold text-base truncate max-w-lg">{previewModal.title}</h3>
          </div>
          <button
            onClick={() => setPreviewModal(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors"
          >
            <X size={14} /> 閉じる
          </button>
        </div>

        {previewModal.type === 'youtube' ? (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={previewModal.embedUrl}
              title={previewModal.title}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="w-full flex-1 relative bg-white">
            <iframe
              src={previewModal.embedUrl}
              title={previewModal.title}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
}
