use crate::models::{ControllerBindings, GameEntry};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MkxpAudio {
    pub volume: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MkxpJsonConfig {
    #[serde(rename = "gameFolder")]
    pub game_folder: String,

    #[serde(rename = "rgssVersion")]
    pub rgss_version: u32,

    #[serde(rename = "windowTitle")]
    pub window_title: String,

    #[serde(rename = "smoothScaling")]
    pub smooth_scaling: u32,

    #[serde(rename = "integerScalingActive")]
    pub integer_scaling_active: bool,

    #[serde(rename = "integerScalingLastMile")]
    pub integer_scaling_last_mile: bool,

    pub vsync: bool,
    pub fullscreen: bool,

    #[serde(rename = "fixedAspectRatio")]
    pub fixed_aspect_ratio: bool,

    #[serde(rename = "subImageFix")]
    pub sub_image_fix: bool,

    #[serde(rename = "pathCache")]
    pub path_cache: bool,

    #[serde(rename = "allowSymlinks")]
    pub allow_symlinks: bool,

    #[serde(rename = "enableReset")]
    pub enable_reset: bool,

    #[serde(rename = "enableSettings")]
    pub enable_settings: bool,

    #[serde(rename = "customSaveDir", skip_serializing_if = "Option::is_none")]
    pub custom_save_dir: Option<String>,

    #[serde(rename = "preloadScript")]
    pub preload_script: Vec<String>,

    #[serde(rename = "SE")]
    pub se: MkxpAudio,

    #[serde(rename = "BGM")]
    pub bgm: MkxpAudio,

    pub binding: MkxpBinding,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MkxpBinding {
    pub a: Vec<String>,
    pub b: Vec<String>,
    pub c: Vec<String>,
    pub x: Vec<String>,
    pub y: Vec<String>,
    pub z: Vec<String>,
    pub l: Vec<String>,
    pub r: Vec<String>,
    pub up: Vec<String>,
    pub down: Vec<String>,
    pub left: Vec<String>,
    pub right: Vec<String>,
}

fn split_binding(s: &str) -> Vec<String> {
    s.split(',')
        .map(|item| item.trim().to_string())
        .filter(|item| !item.is_empty())
        .collect()
}

impl From<&ControllerBindings> for MkxpBinding {
    fn from(bindings: &ControllerBindings) -> Self {
        Self {
            a: split_binding(&bindings.a),
            b: split_binding(&bindings.b),
            c: split_binding(&bindings.c),
            x: split_binding(&bindings.x),
            y: split_binding(&bindings.y),
            z: split_binding(&bindings.z),
            l: split_binding(&bindings.l),
            r: split_binding(&bindings.r),
            up: split_binding(&bindings.up),
            down: split_binding(&bindings.down),
            left: split_binding(&bindings.left),
            right: split_binding(&bindings.right),
        }
    }
}

pub fn generate_mkxp_config(
    game: &GameEntry,
    target_save_dir: Option<&str>,
    runtime_dir: &Path,
) -> MkxpJsonConfig {
    let save_dir = target_save_dir
        .map(String::from)
        .or_else(|| game.config.custom_save_dir.clone());

    // Locate preload scripts if available in runtime directory
    let mut preload_script = Vec::new();
    let candidates = [
        "scripts/preload/ruby_classic_wrap.rb",
        "scripts/preload/mkxp_wrap.rb",
        "scripts/preload/win32_wrap.rb",
    ];
    for rel in candidates {
        let abs = runtime_dir.join(rel);
        if abs.exists() {
            preload_script.push(abs.to_string_lossy().to_string());
        }
    }

    MkxpJsonConfig {
        game_folder: game.folder_path.clone(),
        rgss_version: 1,
        window_title: game.title.clone(),
        smooth_scaling: if game.config.smooth_scaling { 1 } else { 0 },
        integer_scaling_active: game.config.integer_scaling,
        integer_scaling_last_mile: true,
        vsync: game.config.vsync,
        fullscreen: game.config.fullscreen,
        fixed_aspect_ratio: game.config.fixed_aspect_ratio,
        sub_image_fix: game.config.sub_image_fix,
        path_cache: false,
        allow_symlinks: true,
        enable_reset: true,
        enable_settings: true,
        custom_save_dir: save_dir,
        preload_script,
        se: MkxpAudio {
            volume: game.config.se_volume,
        },
        bgm: MkxpAudio {
            volume: game.config.bgm_volume,
        },
        binding: MkxpBinding::from(&game.config.bindings),
    }
}

pub fn write_mkxp_config_file(config: &MkxpJsonConfig, destination_path: &Path) -> std::io::Result<()> {
    let json = serde_json::to_string_pretty(config)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
    fs::write(destination_path, json)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::GameConfig;

    #[test]
    fn test_split_binding() {
        let res = split_binding("C, RETURN ,  Z ");
        assert_eq!(res, vec!["C", "RETURN", "Z"]);
    }

    #[test]
    fn test_generate_config_json() {
        let game = GameEntry {
            id: "test-game".to_string(),
            title: "Test Pokemon Game".to_string(),
            folder_path: "/tmp/game".to_string(),
            exec_name: None,
            custom_script: None,
            banner_url: None,
            icon_url: None,
            last_played: None,
            play_time_seconds: 0,
            config: GameConfig::default(),
            created_at: 1000,
        };

        let temp = tempfile::tempdir().unwrap();
        let mkxp = generate_mkxp_config(&game, Some("/tmp/saves"), temp.path());
        let json = serde_json::to_string(&mkxp).unwrap();
        assert!(json.contains("Test Pokemon Game"));
        assert!(json.contains("/tmp/saves"));
        assert!(json.contains("rgssVersion"));
    }
}
