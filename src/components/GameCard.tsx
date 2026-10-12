import React from 'react';
import { Play, Settings, Clock, Sparkles } from 'lucide-react';
import { GameEntry } from '../types';

interface GameCardProps {
  game: GameEntry;
  isRunning: boolean;
  onSelect: (game: GameEntry) => void;
  onLaunch: (game: GameEntry) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isRunning,
  onSelect,
  onLaunch,
}) => {
  const formatPlayTime = (seconds: number) => {
    if (!seconds) return 'Not played yet';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours === 0) return `${minutes}m played`;
    return `${hours}h ${minutes}m played`;
  };

  const formatLastPlayed = (timestamp?: number | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp * (timestamp < 10000000000 ? 1000 : 1));
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={() => onSelect(game)}
      className="group relative bg-slate-900/70 border border-slate-800 hover:border-rose-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/20 hover:-translate-y-1 cursor-pointer flex flex-col"
    >
      {/* Banner / Poster */}
      <div className="relative h-44 w-full bg-gradient-to-br from-slate-800 via-slate-900 to-rose-950/40 overflow-hidden flex items-center justify-center">
        {game.banner_url ? (
          <img
            src={game.banner_url}
            alt={game.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-600 group-hover:text-rose-400/80 transition-colors">
            <Sparkles className="w-12 h-12 stroke-[1.2] mb-1" />
            <span className="text-[11px] font-medium tracking-wider uppercase text-slate-500">
              RPGXP Fangame
            </span>
          </div>
        )}

        {/* Running badge */}
        {isRunning && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
            Active
          </div>
        )}

        {/* Quick Launch overlay on hover */}
        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLaunch(game);
            }}
            className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/60 transform hover:scale-110 active:scale-95 transition-all"
            title="Launch Game"
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(game);
            }}
            className="w-10 h-10 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 flex items-center justify-center border border-slate-600 shadow-lg transform hover:scale-105 active:scale-95 transition-all"
            title="Game Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info footer */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-100 group-hover:text-rose-300 transition-colors line-clamp-1">
            {game.title}
          </h3>
          <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5" title={game.folder_path}>
            {game.folder_path.replace(/^\/Users\/[^/]+/, '~')}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{formatPlayTime(game.play_time_seconds)}</span>
          </div>
          <div>
            <span className="text-slate-500">Played:</span> {formatLastPlayed(game.last_played)}
          </div>
        </div>
      </div>
    </div>
  );
};
