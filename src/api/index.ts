import { GameEntry, GameScanResult, ProcessState, SaveBackup } from '../types';

let tauriInvoke: (<T>(cmd: string, args?: Record<string, unknown>) => Promise<T>) | null = null;
let tauriListen: (<T>(event: string, handler: (event: { payload: T }) => void) => Promise<() => void>) | null = null;

// Dynamically load Tauri APIs if running within Tauri desktop container
try {
  // @ts-ignore
  if (window.__TAURI_INTERNALS__ || window.__TAURI__) {
    import('@tauri-apps/api/core').then((mod) => {
      tauriInvoke = mod.invoke;
    });
    import('@tauri-apps/api/event').then((mod) => {
      tauriListen = mod.listen;
    });
  }
} catch (e) {
  console.info('Oak Launcher running in web preview mode:', e);
}

// In-memory fallback mock database for browser development & preview
const mockGames: GameEntry[] = [
  {
    id: 'demo-reborn',
    title: 'Pokémon Reborn (Sample)',
    folder_path: '/Applications/Pokemon Reborn',
    exec_name: 'Pokemon Reborn',
    banner_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png',
    play_time_seconds: 7200,
    last_played: Date.now() - 3600000,
    created_at: Date.now() - 86400000,
    config: {
      smooth_scaling: false,
      integer_scaling: true,
      vsync: true,
      fullscreen: false,
      fixed_aspect_ratio: true,
      sub_image_fix: true,
      window_scale: 1.0,
      se_volume: 90,
      bgm_volume: 80,
      custom_save_dir: null,
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
    },
  },
];

let mockRunningState: ProcessState = {
  game_id: '',
  is_running: false,
};

export async function getGames(): Promise<GameEntry[]> {
  if (tauriInvoke) {
    return tauriInvoke<GameEntry[]>('get_games');
  }
  return [...mockGames];
}

export async function scanFolder(path: string): Promise<GameScanResult> {
  if (tauriInvoke) {
    return tauriInvoke<GameScanResult>('scan_folder', { path });
  }
  return {
    title: path.split('/').pop() || 'Pokémon Game',
    is_valid: true,
    has_scripts: true,
    has_graphics: true,
    has_audio: true,
    detected_rpg_version: 1,
    message: 'Valid Pokémon RPGXP game folder structure detected.',
  };
}

export async function importGame(path: string, title?: string): Promise<GameEntry> {
  if (tauriInvoke) {
    return tauriInvoke<GameEntry>('import_game', { path, title });
  }
  const newGame: GameEntry = {
    id: 'game-' + Date.now(),
    title: title || path.split('/').pop() || 'New Game',
    folder_path: path,
    play_time_seconds: 0,
    created_at: Date.now(),
    config: {
      smooth_scaling: false,
      integer_scaling: true,
      vsync: true,
      fullscreen: false,
      fixed_aspect_ratio: true,
      sub_image_fix: true,
      window_scale: 1.0,
      se_volume: 100,
      bgm_volume: 100,
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
    },
  };
  mockGames.push(newGame);
  return newGame;
}

export async function updateGame(game: GameEntry): Promise<GameEntry[]> {
  if (tauriInvoke) {
    return tauriInvoke<GameEntry[]>('update_game', { game });
  }
  const idx = mockGames.findIndex((g) => g.id === game.id);
  if (idx !== -1) mockGames[idx] = game;
  return [...mockGames];
}

export async function deleteGame(gameId: string): Promise<GameEntry[]> {
  if (tauriInvoke) {
    return tauriInvoke<GameEntry[]>('delete_game', { gameId });
  }
  const idx = mockGames.findIndex((g) => g.id === gameId);
  if (idx !== -1) mockGames.splice(idx, 1);
  return [...mockGames];
}

export async function launchGame(gameId: string): Promise<ProcessState> {
  if (tauriInvoke) {
    return tauriInvoke<ProcessState>('launch_game', { gameId });
  }
  mockRunningState = {
    game_id: gameId,
    is_running: true,
    pid: 12345,
    started_at: Date.now(),
  };
  return { ...mockRunningState };
}

export async function stopGame(): Promise<boolean> {
  if (tauriInvoke) {
    return tauriInvoke<boolean>('stop_game');
  }
  mockRunningState = {
    game_id: '',
    is_running: false,
  };
  return true;
}

export async function getRunningStatus(): Promise<ProcessState> {
  if (tauriInvoke) {
    return tauriInvoke<ProcessState>('get_running_status');
  }
  return { ...mockRunningState };
}

export async function listBackups(gameId: string): Promise<SaveBackup[]> {
  if (tauriInvoke) {
    return tauriInvoke<SaveBackup[]>('list_backups', { gameId });
  }
  return [
    {
      id: 'backup-1',
      game_id: gameId,
      filename: '20261012_084500_Game.rxdata',
      filepath: '/Users/test/Library/Application Support/OakLauncher/backups/demo/Game.rxdata',
      timestamp: Math.floor(Date.now() / 1000) - 3600,
      size_bytes: 42180,
      label: 'Pre-launch automatic backup',
    },
  ];
}

export async function restoreBackup(gameId: string, backupPath: string): Promise<boolean> {
  if (tauriInvoke) {
    return tauriInvoke<boolean>('restore_backup', { gameId, backupPath });
  }
  return true;
}

export async function triggerManualBackup(gameId: string): Promise<SaveBackup | null> {
  if (tauriInvoke) {
    return tauriInvoke<SaveBackup | null>('trigger_manual_backup', { gameId });
  }
  return {
    id: 'backup-manual-' + Date.now(),
    game_id: gameId,
    filename: `manual_${Date.now()}_Game.rxdata`,
    filepath: `/Users/test/Library/Application Support/OakLauncher/backups/${gameId}/manual.rxdata`,
    timestamp: Math.floor(Date.now() / 1000),
    size_bytes: 42180,
    label: 'Manual user backup',
  };
}

export async function revealInFinder(path: string): Promise<void> {
  if (tauriInvoke) {
    await tauriInvoke('reveal_in_finder', { path });
  } else {
    alert(`Reveal in Finder: ${path}`);
  }
}

export function subscribeToStatus(callback: (state: ProcessState) => void): () => void {
  let unlisten: (() => void) | null = null;
  if (tauriListen) {
    tauriListen<ProcessState>('game-status-changed', (event) => {
      callback(event.payload);
    }).then((fn) => {
      unlisten = fn;
    });
  }
  return () => {
    if (unlisten) unlisten();
  };
}
