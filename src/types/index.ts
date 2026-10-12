export interface ControllerBindings {
  a: string;
  b: string;
  c: string;
  x: string;
  y: string;
  z: string;
  l: string;
  r: string;
  up: string;
  down: string;
  left: string;
  right: string;
}

export interface GameConfig {
  smooth_scaling: boolean;
  integer_scaling: boolean;
  vsync: boolean;
  fullscreen: boolean;
  fixed_aspect_ratio: boolean;
  sub_image_fix: boolean;
  window_scale: number;
  se_volume: number;
  bgm_volume: number;
  custom_save_dir?: string | null;
  bindings: ControllerBindings;
}

export interface GameEntry {
  id: string;
  title: string;
  folder_path: string;
  exec_name?: string | null;
  custom_script?: string | null;
  banner_url?: string | null;
  icon_url?: string | null;
  last_played?: number | null;
  play_time_seconds: number;
  config: GameConfig;
  created_at: number;
}

export interface SaveBackup {
  id: string;
  game_id: string;
  filename: string;
  filepath: string;
  timestamp: number;
  size_bytes: number;
  label?: string | null;
}

export interface GameScanResult {
  title: string;
  is_valid: boolean;
  has_scripts: boolean;
  has_graphics: boolean;
  has_audio: boolean;
  detected_rpg_version: number;
  message: string;
}

export interface ProcessState {
  game_id: string;
  is_running: boolean;
  pid?: number | null;
  started_at?: number | null;
}
