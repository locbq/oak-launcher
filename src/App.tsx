import React, { useState, useEffect } from 'react';
import { GameEntry, ProcessState } from './types';
import {
  getGames,
  launchGame,
  stopGame,
  getRunningStatus,
  subscribeToStatus,
  deleteGame,
} from './api';
import { Header } from './components/Header';
import { GameLibrary } from './components/GameLibrary';
import { GameDetailModal } from './components/GameDetailModal';
import { ImportGameModal } from './components/ImportGameModal';
import { RebornGuideModal } from './components/RebornGuideModal';

export const App: React.FC = () => {
  const [games, setGames] = useState<GameEntry[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameEntry | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showRebornGuide, setShowRebornGuide] = useState(false);
  const [runningState, setRunningState] = useState<ProcessState>({
    game_id: '',
    is_running: false,
  });
  const [launchError, setLaunchError] = useState<string | null>(null);

  useEffect(() => {
    loadGames();

    // Check initial running status
    getRunningStatus().then(setRunningState).catch(console.error);

    // Subscribe to runtime events
    const unsubscribe = subscribeToStatus((newState) => {
      setRunningState(newState);
      if (!newState.is_running) {
        // Refresh games list to update play times
        loadGames();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadGames = async () => {
    try {
      const data = await getGames();
      setGames(data);
    } catch (e) {
      console.error('Failed to load games:', e);
    }
  };

  const handleLaunch = async (game: GameEntry) => {
    setLaunchError(null);
    try {
      const res = await launchGame(game.id);
      setRunningState(res);
    } catch (e: any) {
      setLaunchError(e.toString());
      setTimeout(() => setLaunchError(null), 5000);
    }
  };

  const handleStop = async () => {
    try {
      await stopGame();
      setRunningState({ game_id: '', is_running: false });
    } catch (e) {
      console.error('Failed to stop game:', e);
    }
  };

  const handleDelete = async (gameId: string) => {
    try {
      const updated = await deleteGame(gameId);
      setGames(updated);
      setSelectedGame(null);
    } catch (e) {
      console.error('Failed to delete game:', e);
    }
  };

  const handleGameUpdated = (updatedGame: GameEntry) => {
    setGames((prev) => prev.map((g) => (g.id === updatedGame.id ? updatedGame : g)));
    setSelectedGame(updatedGame);
  };

  const runningGame = games.find((g) => g.id === runningState.game_id);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 select-none overflow-hidden text-slate-100">
      {/* Top Header */}
      <Header
        onAddGame={() => setShowImportModal(true)}
        onOpenGuide={() => setShowRebornGuide(true)}
        runningState={runningState}
        runningGameTitle={runningGame?.title}
        onStopGame={handleStop}
      />

      {/* Global Error Banner */}
      {launchError && (
        <div className="bg-rose-950/90 border-b border-rose-800 text-rose-200 px-6 py-2.5 text-xs font-semibold flex items-center justify-between animate-fadeIn z-10">
          <span>Error launching game: {launchError}</span>
          <button
            onClick={() => setLaunchError(null)}
            className="text-rose-400 hover:text-white text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Library Grid */}
      <main className="flex-1 flex overflow-hidden">
        <GameLibrary
          games={games}
          runningState={runningState}
          onSelectGame={(game) => setSelectedGame(game)}
          onLaunchGame={handleLaunch}
          onAddGame={() => setShowImportModal(true)}
          onOpenGuide={() => setShowRebornGuide(true)}
        />
      </main>

      {/* Modals */}
      {selectedGame && (
        <GameDetailModal
          game={selectedGame}
          isRunning={runningState.is_running && runningState.game_id === selectedGame.id}
          runningState={runningState}
          onClose={() => setSelectedGame(null)}
          onLaunch={handleLaunch}
          onStop={handleStop}
          onDelete={handleDelete}
          onGameUpdated={handleGameUpdated}
        />
      )}

      {showImportModal && (
        <ImportGameModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={loadGames}
        />
      )}

      {showRebornGuide && (
        <RebornGuideModal
          onClose={() => setShowRebornGuide(false)}
          onImportNow={() => setShowImportModal(true)}
        />
      )}
    </div>
  );
};

export default App;
