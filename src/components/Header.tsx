import React from 'react';
import { Plus, BookOpen, Square, Disc } from 'lucide-react';
import { ProcessState } from '../types';

interface HeaderProps {
  onAddGame: () => void;
  onOpenGuide: () => void;
  runningState: ProcessState;
  runningGameTitle?: string;
  onStopGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAddGame,
  onOpenGuide,
  runningState,
  runningGameTitle,
  onStopGame,
}) => {
  return (
    <header className="h-16 px-6 glass-panel border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-rose-500/50 shadow-md shadow-rose-950/50 flex flex-col items-center justify-center bg-slate-900 group">
          <div className="w-full h-1/2 bg-gradient-to-b from-rose-500 to-rose-600" />
          <div className="w-full h-1/2 bg-slate-100" />
          <div className="absolute w-full h-0.5 bg-slate-950 top-1/2 -translate-y-1/2" />
          <div className="absolute w-2.5 h-2.5 rounded-full bg-slate-100 border-2 border-slate-950 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            Oak <span className="text-rose-500 font-extrabold">Launcher</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
            Native macOS RPGXP Player
          </p>
        </div>
      </div>

      {/* Center status if running */}
      {runningState.is_running && (
        <div className="flex items-center space-x-3 bg-emerald-950/60 border border-emerald-500/40 rounded-full px-4 py-1.5 animate-pulse">
          <Disc className="w-4 h-4 text-emerald-400 animate-spin" />
          <span className="text-xs font-semibold text-emerald-300">
            Playing: {runningGameTitle || 'Game'} (PID: {runningState.pid})
          </span>
          <button
            onClick={onStopGame}
            className="flex items-center gap-1 text-[11px] font-bold text-rose-300 hover:text-white bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 px-2 py-0.5 rounded-full transition-colors"
          >
            <Square className="w-3 h-3 fill-rose-300" /> Stop
          </button>
        </div>
      )}

      {/* Right Actions */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenGuide}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 transition-all shadow-sm"
          title="Setup guide for Pokémon Reborn"
        >
          <BookOpen className="w-3.5 h-3.5 text-rose-400" />
          <span>Reborn Guide</span>
        </button>

        <button
          onClick={onAddGame}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-md shadow-rose-950/40 transition-all transform active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Game</span>
        </button>
      </div>
    </header>
  );
};
