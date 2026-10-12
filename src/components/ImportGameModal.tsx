import React, { useState } from 'react';
import { X, FolderOpen, CheckCircle2, AlertCircle, Sparkles, Gamepad2, FileCode, HelpCircle } from 'lucide-react';
import { GameScanResult } from '../types';
import { scanFolder, importGame } from '../api';

interface ImportGameModalProps {
  onClose: () => void;
  onImportSuccess: () => void;
}

export const ImportGameModal: React.FC<ImportGameModalProps> = ({
  onClose,
  onImportSuccess,
}) => {
  const [folderPath, setFolderPath] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [scanResult, setScanResult] = useState<GameScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleBrowseFolder = async () => {
    try {
      // @ts-ignore
      if (window.__TAURI_INTERNALS__ || window.__TAURI__) {
        const { open } = await import('@tauri-apps/plugin-dialog');
        const selected = await open({
          directory: true,
          multiple: false,
          title: 'Select Game Folder',
        });
        if (selected && typeof selected === 'string') {
          setFolderPath(selected);
          runScan(selected);
        }
      } else {
        const dummyPath = '/Applications/Pokemon Infinite Fusion';
        setFolderPath(dummyPath);
        runScan(dummyPath);
      }
    } catch (e: any) {
      console.error('Error opening dialog:', e);
    }
  };

  const handleBrowseFile = async () => {
    try {
      // @ts-ignore
      if (window.__TAURI_INTERNALS__ || window.__TAURI__) {
        const { open } = await import('@tauri-apps/plugin-dialog');
        const selected = await open({
          directory: false,
          multiple: false,
          title: 'Select Game Executable (Game.exe or InfiniteFusion.exe)',
          filters: [
            {
              name: 'Game Executable or Script',
              extensions: ['exe', 'ini', 'rxdata'],
            },
          ],
        });
        if (selected && typeof selected === 'string') {
          setFolderPath(selected);
          runScan(selected);
        }
      } else {
        const dummyPath = '/Applications/Pokemon Infinite Fusion/InfiniteFusion.exe';
        setFolderPath(dummyPath);
        runScan(dummyPath);
      }
    } catch (e: any) {
      console.error('Error opening file dialog:', e);
    }
  };

  const runScan = async (path: string) => {
    if (!path.trim()) return;
    setIsScanning(true);
    setErrorMsg('');
    try {
      const res = await scanFolder(path.trim());
      setScanResult(res);
      if (res.title && !customTitle) {
        setCustomTitle(res.title);
      }
    } catch (e: any) {
      setErrorMsg(e.toString());
    } finally {
      setIsScanning(false);
    }
  };

  const handleImport = async () => {
    if (!folderPath.trim()) return;
    setIsImporting(true);
    setErrorMsg('');
    try {
      await importGame(folderPath.trim(), customTitle.trim() || undefined);
      onImportSuccess();
      onClose();
    } catch (e: any) {
      setErrorMsg(e.toString());
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-modal rounded-2xl flex flex-col shadow-2xl overflow-hidden border border-slate-700/60 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-900/60 to-slate-900 border border-rose-500/30 flex items-center justify-center text-rose-500">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Import Fan Game</h3>
              <p className="text-xs text-slate-400">Select any local RPGXP game directory or .exe file</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Path selection */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Game Path (Folder or .exe)
              </label>
              <span className="text-[10px] text-slate-500">e.g. Game.exe / InfiniteFusion.exe</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="/path/to/game or .../InfiniteFusion.exe"
                value={folderPath}
                onChange={(e) => {
                  setFolderPath(e.target.value);
                  if (e.target.value.length > 5) runScan(e.target.value);
                }}
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
              />
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handleBrowseFolder}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  title="Browse for the entire game directory"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Folder</span>
                </button>
                <button
                  type="button"
                  onClick={handleBrowseFile}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  title="Select Game.exe or InfiniteFusion.exe directly"
                >
                  <FileCode className="w-3.5 h-3.5 text-rose-400" />
                  <span>Select .exe</span>
                </button>
              </div>
            </div>
          </div>

          {/* Infinite Fusion / .exe explanation callout */}
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-400">
            <HelpCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-300 font-semibold block mb-0.5">
                Have a game like Pokémon Infinite Fusion with an .exe?
              </span>
              <span>
                You can select either the game folder or <code className="text-slate-200 bg-slate-950 px-1 rounded font-mono">InfiniteFusion.exe</code> directly. Oak Launcher detects the surrounding RPGXP assets and launches them natively on macOS without Wine!
              </span>
            </div>
          </div>

          {/* Validation Feedback */}
          {isScanning && (
            <p className="text-xs text-slate-400 animate-pulse">Scanning game assets...</p>
          )}

          {scanResult && (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                {scanResult.is_valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                )}
                <span className="font-semibold text-slate-200">{scanResult.message}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${scanResult.has_scripts ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span>Scripts.rxdata</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${scanResult.has_graphics ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span>Graphics/</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${scanResult.has_audio ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span>Audio/</span>
                </div>
              </div>
            </div>
          )}

          {/* Title input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Game Title (Display Name)
            </label>
            <input
              type="text"
              placeholder="e.g. Pokémon Infinite Fusion"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!folderPath.trim() || isImporting}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-950/40 transition-all transform active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isImporting ? 'Importing...' : 'Add to Library'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
