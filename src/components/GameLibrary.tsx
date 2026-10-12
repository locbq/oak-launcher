import React, { useState } from 'react';
import { Search, SlidersHorizontal, Gamepad2, Plus, Sparkles } from 'lucide-react';
import { GameEntry, ProcessState } from '../types';
import { GameCard } from './GameCard';

interface GameLibraryProps {
  games: GameEntry[];
  runningState: ProcessState;
  onSelectGame: (game: GameEntry) => void;
  onLaunchGame: (game: GameEntry) => void;
  onAddGame: () => void;
  onOpenGuide: () => void;
}

export const GameLibrary: React.FC<GameLibraryProps> = ({
  games,
  runningState,
  onSelectGame,
  onLaunchGame,
  onAddGame,
  onOpenGuide,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'time'>('recent');

  const filteredGames = games
    .filter((g) => g.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'time') {
        return b.play_time_seconds - a.play_time_seconds;
      }
      // default: recent
      return (b.last_played || 0) - (a.last_played || 0);
    });

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      {/* Top filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Library
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-rose-400 border border-slate-700">
              {games.length} {games.length === 1 ? 'Game' : 'Games'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Native Apple Silicon & Intel RPGXP Player
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="recent" className="bg-slate-900">Recently Played</option>
              <option value="title" className="bg-slate-900">Alphabetical</option>
              <option value="time" className="bg-slate-900">Most Played</option>
            </select>
          </div>
        </div>
      </div>

      {/* Game Grid or Empty State */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isRunning={runningState.is_running && runningState.game_id === game.id}
              onSelect={onSelectGame}
              onLaunch={onLaunchGame}
            />
          ))}
        </div>
      ) : games.length === 0 ? (
        /* Empty Library State */
        <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-950/60 to-slate-900 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4 shadow-inner">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Your Library is Empty</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Import an existing Pokémon RPG Maker XP game directory from your Mac, or check out our guide to install Pokémon Reborn natively.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={onAddGame}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-lg shadow-rose-950/40"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Import Game Folder</span>
            </button>
            <button
              onClick={onOpenGuide}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/60 transition-all"
            >
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>Reborn Quickstart</span>
            </button>
          </div>
        </div>
      ) : (
        /* No Search Matches */
        <div className="py-20 text-center">
          <p className="text-slate-400 text-sm">No games matching "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-2 text-xs text-rose-400 hover:underline"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
};
