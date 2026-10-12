import React from 'react';
import { X, ExternalLink, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';

interface RebornGuideModalProps {
  onClose: () => void;
  onImportNow: () => void;
}

export const RebornGuideModal: React.FC<RebornGuideModalProps> = ({
  onClose,
  onImportNow,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[85vh] glass-modal rounded-2xl flex flex-col shadow-2xl overflow-hidden border border-slate-700/60 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-900/60 to-slate-900 border border-rose-500/30 flex items-center justify-center text-rose-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Pokémon Reborn Setup Guide</h3>
              <p className="text-xs text-slate-400">Step-by-step instructions for native macOS gameplay</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-5 text-xs text-slate-300 pr-1">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-rose-950 border border-rose-800 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Download Pokémon Reborn</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Visit the official Reborn community website and download the game assets archive:
            </p>
            <a
              href="https://www.rebornevo.com/pr/index.html/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 underline pt-1"
            >
              <span>Visit Reborn Evolved Official Downloads</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-rose-950 border border-rose-800 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Extract the Game Folder</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Unpack the downloaded zip archive anywhere on your Mac (e.g. into{' '}
              <code className="text-slate-200 bg-slate-950 px-1.5 py-0.5 rounded font-mono">~/Games/Pokemon Reborn</code>{' '}
              or your <code className="text-slate-200 bg-slate-950 px-1.5 py-0.5 rounded font-mono">Applications</code> folder).
              Verify that the folder contains <code className="text-slate-200 bg-slate-950 px-1.5 py-0.5 rounded font-mono">Data/</code>, <code className="text-slate-200 bg-slate-950 px-1.5 py-0.5 rounded font-mono">Graphics/</code>, and <code className="text-slate-200 bg-slate-950 px-1.5 py-0.5 rounded font-mono">Audio/</code>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-rose-950 border border-rose-800 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Import & Launch with Oak Launcher</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Click <strong>"Add Game"</strong> in Oak Launcher, browse to your extracted Reborn folder, and hit <strong>Import</strong>. Oak Launcher will synthesize the native Metal ANGLE configuration and launch the game directly!
            </p>
          </div>

          {/* Compatibility Note */}
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3 text-[11px] text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Zero Wine / Rosetta required:</strong> Oak Launcher runs games using a native Apple Silicon arm64 C++ runtime with full hardware acceleration, low memory consumption, and automated save snapshots.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onImportNow();
            }}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-md shadow-rose-950/40 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Import Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
