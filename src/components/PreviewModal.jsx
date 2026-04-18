import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { isAllowedEmbedUrl } from '../utils/materialUtils';

export default function PreviewModal({ previewModal, setPreviewModal }) {
  if (!previewModal) return null;

  const isYoutube = previewModal.type === 'youtube';
  const isSafe = isAllowedEmbedUrl(previewModal.embedUrl);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 lg:p-8"
      onClick={() => setPreviewModal(null)}
    >
      <div
        className={`bg-slate-900 rounded-3xl overflow-hidden shadow-2xl w-full max-w-5xl flex flex-col ${!isYoutube ? 'h-[90vh]' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className={`text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${isYoutube ? 'bg-red-600' : 'bg-orange-600'}`}>
              {isYoutube ? 'YouTube' : 'プレビュー'}
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

        {!isSafe ? (
          <div className="flex flex-col items-center justify-center flex-1 p-12 text-center gap-4">
            <AlertTriangle size={48} className="text-amber-500" />
            <p className="text-white font-black text-lg">このコンテンツは表示できません</p>
            <p className="text-slate-400 text-sm font-medium">許可されていないURLからのコンテンツです</p>
            <a
              href={previewModal.embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 bg-orange-600 text-white font-black px-6 py-3 rounded-xl text-sm hover:bg-orange-700 transition-colors"
            >
              外部リンクで開く →
            </a>
          </div>
        ) : isYoutube ? (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={previewModal.embedUrl}
              title={previewModal.title}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
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
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
}
