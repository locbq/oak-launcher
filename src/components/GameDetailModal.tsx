import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Square,
  FolderOpen,
  Trash2,
  Save,
  Gamepad2,
  Settings2,
  Info,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
} from 'lucide-react';
import { GameEntry, ProcessState, SaveBackup } from '../types';
import {
  listBackups,
  restoreBackup,
  triggerManualBackup,
  revealInFinder,
  updateGame,
} from '../api';

interface GameDetailModalProps {
  game: GameEntry;
  isRunning: boolean;
  runningState: ProcessState;
  onClose: () => void;
  onLaunch: (game: GameEntry) => void;
  onStop: () => void;
  onDelete: (gameId: string) => void;
  onGameUpdated: (game: GameEntry) => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  isRunning,
  runningState,
  onClose,
  onLaunch,
  onStop,
  onDelete,
  onGameUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'saves' | 'controls' | 'info'>('settings');
  const [config, setConfig] = useState(game.config);
  const [backups, setBackups] = useState<SaveBackup[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadBackups();
  }, [game.id]);

  const loadBackups = async () => {
    setLoadingBackups(true);
    try {
      const data = await listBackups(game.id);
      setBackups(data);
    } catch (e) {
      console.error('Failed to load backups:', e);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleConfigSave = async () => {
    const updatedGame = { ...game, config };
    try {
      await updateGame(updatedGame);
      onGameUpdated(updatedGame);
      setSaveSuccessMsg('Configuration saved successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 2500);
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  };

  const handleManualBackup = async () => {
    try {
      const backup = await triggerManualBackup(game.id);
      if (backup) {
        await loadBackups();
        setSaveSuccessMsg('Save snapshot created!');
        setTimeout(() => setSaveSuccessMsg(''), 2500);
      }
    } catch (e) {
      console.error('Failed to create manual backup:', e);
    }
  };

  const handleRestore = async (backup: SaveBackup) => {
    try {
      await restoreBackup(game.id, backup.filepath);
      setRestoreConfirmId(null);
      setSaveSuccessMsg(`Restored save from ${new Date(backup.timestamp * 1000).toLocaleString()}`);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (e) {
      console.error('Failed to restore backup:', e);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] glass-modal rounded-2xl flex flex-col shadow-2xl overflow-hidden border border-slate-700/60">
        {/* Hero header banner */}
        <div className="relative h-48 w-full bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border-b border-slate-800 flex items-end p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-5 z-10">
            <div className="w-20 h-20 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center shadow-lg overflow-hidden">
              {game.banner_url ? (
                <img src={game.banner_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Gamepad2 className="w-10 h-10 text-rose-500" />
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black text-white tracking-tight">{game.title}</h2>
                {isRunning && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    Running (PID: {runningState.pid})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                {game.folder_path}
              </p>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isRunning ? (
              <button
                onClick={onStop}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-600 shadow-md shadow-rose-950/40 transition-all"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop Game</span>
              </button>
            ) : (
              <button
                onClick={() => onLaunch(game)}
                className="flex items-center space-x-2 px-6 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-lg shadow-rose-950/50 transition-all transform hover:scale-[1.02] active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Launch Game</span>
              </button>
            )}

            <button
              onClick={() => revealInFinder(game.folder_path)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Show in Finder</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {saveSuccessMsg && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" /> {saveSuccessMsg}
              </span>
            )}

            {confirmDelete ? (
              <div className="flex items-center space-x-2 bg-rose-950/80 border border-rose-800 rounded-xl px-3 py-1.5">
                <span className="text-[11px] text-rose-300 font-medium">Remove from library?</span>
                <button
                  onClick={() => onDelete(game.id)}
                  className="text-[11px] font-bold text-white bg-rose-600 px-2 py-0.5 rounded hover:bg-rose-500"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
                title="Remove game from library"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <div className="px-6 flex border-b border-slate-800 bg-slate-900/40 text-xs font-medium">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 className="w-4 h-4" /> Engine Settings
          </button>
          <button
            onClick={() => setActiveTab('saves')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'saves'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" /> Save Backups
            {backups.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {backups.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('controls')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'controls'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4" /> Controls & Remap
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'info'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" /> Game Info
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: ENGINE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Graphics Box */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    Display & Graphics
                  </h4>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-medium text-slate-200">Start in Fullscreen</span>
                      <p className="text-[11px] text-slate-500">Toggle fullscreen automatically on game launch</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.fullscreen}
                      onChange={(e) => setConfig({ ...config, fullscreen: e.target.checked })}
                      className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-medium text-slate-200">Integer Scaling</span>
                      <p className="text-[11px] text-slate-500">Preserves crisp 1x/2x pixel art without distortion</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.integer_scaling}
                      onChange={(e) => setConfig({ ...config, integer_scaling: e.target.checked })}
                      className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-medium text-slate-200">Smooth Interpolation</span>
                      <p className="text-[11px] text-slate-500">Enable bilinear filtering instead of nearest-neighbor</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.smooth_scaling}
                      onChange={(e) => setConfig({ ...config, smooth_scaling: e.target.checked })}
                      className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-medium text-slate-200">Vertical Sync (VSync)</span>
                      <p className="text-[11px] text-slate-500">Synchronize framerate to macOS display refresh</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.vsync}
                      onChange={(e) => setConfig({ ...config, vsync: e.target.checked })}
                      className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-medium text-slate-200">Sub-Image Texture Fix</span>
                      <p className="text-[11px] text-slate-500">Recommended for Pokémon Essentials fonts and tiles</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.sub_image_fix}
                      onChange={(e) => setConfig({ ...config, sub_image_fix: e.target.checked })}
                      className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                    />
                  </label>
                </div>

                {/* Audio & Sound Box */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      Audio Levels
                    </h4>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                        <span>Sound Effects (SE)</span>
                        <span>{config.se_volume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={config.se_volume}
                        onChange={(e) => setConfig({ ...config, se_volume: Number(e.target.value) })}
                        className="w-full accent-rose-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                        <span>Background Music (BGM)</span>
                        <span>{config.bgm_volume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={config.bgm_volume}
                        onChange={(e) => setConfig({ ...config, bgm_volume: Number(e.target.value) })}
                        className="w-full accent-rose-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Custom Save Directory */}
                  <div className="pt-4 border-t border-slate-800">
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Custom Save Folder (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Default (~/Library/Application Support/...)"
                      value={config.custom_save_dir || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          custom_save_dir: e.target.value.trim() ? e.target.value : null,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Save Settings CTA */}
              <div className="flex justify-end">
                <button
                  onClick={handleConfigSave}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-md shadow-rose-950/40"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Engine Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SAVE BACKUPS */}
          {activeTab === 'saves' && (
            <div className="space-y-6">
              {/* Top save banner */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Automated Save Protection Active</h4>
                    <p className="text-[11px] text-slate-400">
                      Oak Launcher automatically creates timestamped snapshots before each game launch.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleManualBackup}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Backup Now</span>
                  </button>
                  <button
                    onClick={() => {
                      const saveDir = config.custom_save_dir || game.folder_path;
                      revealInFinder(saveDir);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Open Save Folder</span>
                  </button>
                </div>
              </div>

              {/* Backups List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Save Snapshots History ({backups.length})
                </h4>

                {loadingBackups ? (
                  <p className="text-xs text-slate-500 py-4">Loading backup history...</p>
                ) : backups.length > 0 ? (
                  <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 bg-slate-900/40">
                    {backups.map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <History className="w-4 h-4 text-slate-500" />
                          <div>
                            <span className="text-xs font-semibold text-slate-200 block">
                              {new Date(b.timestamp * 1000).toLocaleString(undefined, {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {b.filename} • {formatFileSize(b.size_bytes)}
                            </span>
                          </div>
                        </div>

                        <div>
                          {restoreConfirmId === b.id ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                                <AlertTriangle className="w-3 h-3" /> Overwrite current save?
                              </span>
                              <button
                                onClick={() => handleRestore(b)}
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-rose-600 rounded hover:bg-rose-500"
                              >
                                Restore
                              </button>
                              <button
                                onClick={() => setRestoreConfirmId(null)}
                                className="px-2 py-1 text-[11px] text-slate-400 hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRestoreConfirmId(b.id)}
                              className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                            >
                              <RotateCcw className="w-3 h-3 text-rose-400" />
                              <span>Restore</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                    No backups created yet. Oak Launcher will create one automatically when you launch the game!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CONTROLS REMAPPING */}
          {activeTab === 'controls' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Keyboard & Gamepad Remapping</h4>
                    <p className="text-[11px] text-slate-400">
                      Standard Xbox, PlayStation, and Switch Pro controllers are auto-mapped via SDL2.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setConfig({
                        ...config,
                        bindings: {
                          a: 'C,RETURN',
                          b: 'X,ESCAPE',
                          c: 'Z,SPACE',
                          x: 'A',
                          y: 'S',
                          z: 'D',
                          l: 'Q,PAGEUP',
                          r: 'W,PAGEDOWN',
                          up: 'UP',
                          down: 'DOWN',
                          left: 'LEFT',
                          right: 'RIGHT',
                        },
                      });
                    }}
                    className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset to Defaults
                  </button>
                </div>

                {/* Key remapping grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'Action / Confirm (A)', key: 'a' as const, desc: 'Interact, Talk, Select' },
                    { label: 'Cancel / Run (B)', key: 'b' as const, desc: 'Cancel, Running Shoes' },
                    { label: 'Menu / Ready (C)', key: 'c' as const, desc: 'Open Poké-Menu' },
                    { label: 'Registered Item (X)', key: 'x' as const, desc: 'Bicycle, Fishing Rod' },
                    { label: 'Shortcut 2 (Y)', key: 'y' as const, desc: 'Essentials hotkey' },
                    { label: 'Shortcut 3 (Z)', key: 'z' as const, desc: 'Essentials hotkey' },
                    { label: 'Previous / PageUp (L)', key: 'l' as const, desc: 'Bag / Box page left' },
                    { label: 'Next / PageDown (R)', key: 'r' as const, desc: 'Bag / Box page right' },
                    { label: 'D-Pad Up', key: 'up' as const, desc: 'Move character up' },
                    { label: 'D-Pad Down', key: 'down' as const, desc: 'Move character down' },
                    { label: 'D-Pad Left', key: 'left' as const, desc: 'Move character left' },
                    { label: 'D-Pad Right', key: 'right' as const, desc: 'Move character right' },
                  ].map((binding) => (
                    <div
                      key={binding.key}
                      className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-200 block">{binding.label}</span>
                        <span className="text-[10px] text-slate-500">{binding.desc}</span>
                      </div>
                      <input
                        type="text"
                        value={config.bindings[binding.key]}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            bindings: {
                              ...config.bindings,
                              [binding.key]: e.target.value.toUpperCase(),
                            },
                          })
                        }
                        className="w-28 text-center bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-[11px] text-rose-400 font-bold focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleConfigSave}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-md shadow-rose-950/40"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Controls</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: GAME INFO */}
          {activeTab === 'info' && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider">Engine Specifications</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Runtime Engine</span>
                  <span className="font-mono text-slate-200">mkxp-z (Metal ANGLE / arm64)</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Total Play Time</span>
                  <span className="font-mono text-slate-200">
                    {Math.floor(game.play_time_seconds / 3600)} hours{' '}
                    {Math.floor((game.play_time_seconds % 3600) / 60)} minutes
                  </span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Date Imported</span>
                  <span className="font-mono text-slate-200">
                    {new Date(game.created_at * (game.created_at < 10000000000 ? 1000 : 1)).toLocaleDateString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">In-Game Shortcuts</span>
                  <span className="font-mono text-slate-200">F12: Soft Reset • F2: Toggle FPS</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
