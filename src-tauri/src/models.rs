use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControllerBindings {
    pub a: String,
    pub b: String,
    pub c: String,
    pub x: String,
    pub y: String,
    pub z: String,
    pub l: String,
    pub r: String,
    pub up: String,
    pub down: String,
    pub left: String,
    pub right: String,
}

impl Default for ControllerBindings {
    fn default() -> Self {
        Self {
            a: "C,RETURN".to_string(),
            b: "X,ESCAPE".to_string(),
            c: "Z,SPACE".to_string(),
            x: "A".to_string(),
            y: "S".to_string(),
            z: "D".to_string(),
            l: "Q,PAGEUP".to_string(),
            r: "W,PAGEDOWN".to_string(),
            up: "UP".to_string(),
            down: "DOWN".to_string(),
            left: "LEFT".to_string(),
            right: "RIGHT".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameConfig {
    pub smooth_scaling: bool,
    pub integer_scaling: bool,
    pub vsync: bool,
    pub fullscreen: bool,
    pub fixed_aspect_ratio: bool,
    pub sub_image_fix: bool,
    pub window_scale: f32,
    pub se_volume: u32,
    pub bgm_volume: u32,
    pub custom_save_dir: Option<String>,
    pub bindings: ControllerBindings,
}

impl Default for GameConfig {
    fn default() -> Self {
        Self {
            smooth_scaling: false,
            integer_scaling: true,
            vsync: true,
            fullscreen: false,
            fixed_aspect_ratio: true,
            sub_image_fix: true,
            window_scale: 1.0,
            se_volume: 100,
            bgm_volume: 100,
            custom_save_dir: None,
            bindings: ControllerBindings::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameEntry {
    pub id: String,
    pub title: String,
    pub folder_path: String,
    pub exec_name: Option<String>,
    pub custom_script: Option<String>,
    pub banner_url: Option<String>,
    pub icon_url: Option<String>,
    pub last_played: Option<i64>,
    pub play_time_seconds: u64,
    pub config: GameConfig,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SaveBackup {
    pub id: String,
    pub game_id: String,
    pub filename: String,
    pub filepath: String,
    pub timestamp: i64,
    pub size_bytes: u64,
    pub label: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameScanResult {
    pub title: String,
    pub is_valid: bool,
    pub has_scripts: bool,
    pub has_graphics: bool,
    pub has_audio: bool,
    pub detected_rpg_version: u32,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessState {
    pub game_id: String,
    pub is_running: bool,
    pub pid: Option<u32>,
    pub started_at: Option<i64>,
}
