use crate::models::{GameConfig, GameEntry, GameScanResult};
use crate::services::save::get_app_data_dir;
use chrono::Utc;
use std::fs;
use std::path::{Path, PathBuf};

fn get_library_file_path() -> PathBuf {
    get_app_data_dir().join("library.json")
}

pub fn load_library() -> Vec<GameEntry> {
    let path = get_library_file_path();
    if !path.exists() {
        return Vec::new();
    }

    match fs::read_to_string(&path) {
        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
        Err(_) => Vec::new(),
    }
}

pub fn save_library(games: &[GameEntry]) -> std::io::Result<()> {
    let app_dir = get_app_data_dir();
    fs::create_dir_all(&app_dir)?;

    let path = get_library_file_path();
    let json = serde_json::to_string_pretty(games)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
    fs::write(path, json)
}

pub fn add_or_update_game(game: GameEntry) -> std::io::Result<Vec<GameEntry>> {
    let mut games = load_library();
    if let Some(pos) = games.iter().position(|g| g.id == game.id) {
        games[pos] = game;
    } else {
        games.push(game);
    }
    save_library(&games)?;
    Ok(games)
}

pub fn remove_game(game_id: &str) -> std::io::Result<Vec<GameEntry>> {
    let mut games = load_library();
    games.retain(|g| g.id != game_id);
    save_library(&games)?;
    Ok(games)
}

pub fn scan_game_folder(folder_path_str: &str) -> GameScanResult {
    let folder = Path::new(folder_path_str);
    if !folder.exists() || !folder.is_dir() {
        return GameScanResult {
            title: "Invalid Path".to_string(),
            is_valid: false,
            has_scripts: false,
            has_graphics: false,
            has_audio: false,
            detected_rpg_version: 0,
            message: "Specified folder does not exist or is not a directory.".to_string(),
        };
    }

    let mut detected_title = folder
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Pokemon Fangame")
        .to_string();

    // Check Game.ini for game title
    let ini_path = folder.join("Game.ini");
    if ini_path.exists() {
        if let Ok(content) = fs::read_to_string(&ini_path) {
            for line in content.lines() {
                let line = line.trim();
                if line.starts_with("Title=") || line.starts_with("Title =") {
                    if let Some(t) = line.split('=').nth(1) {
                        let title = t.trim();
                        if !title.is_empty() {
                            detected_title = title.to_string();
                        }
                    }
                }
            }
        }
    }

    let data_folder = folder.join("Data");
    let has_scripts = data_folder.join("Scripts.rxdata").exists()
        || folder.join("Scripts.rxdata").exists()
        || data_folder.join("Scripts.rvdata2").exists();

    let has_graphics = folder.join("Graphics").exists();
    let has_audio = folder.join("Audio").exists();

    let is_valid = has_scripts || (has_graphics && has_audio);

    let message = if is_valid {
        "Compatible Pokémon RPG Maker XP game directory detected.".to_string()
    } else {
        "Warning: Could not find Scripts.rxdata or Data/ folder. Game may require configuration.".to_string()
    };

    GameScanResult {
        title: detected_title,
        is_valid,
        has_scripts,
        has_graphics,
        has_audio,
        detected_rpg_version: 1,
        message,
    }
}

pub fn create_game_entry_from_scan(folder_path: &str, title_override: Option<String>) -> GameEntry {
    let scan = scan_game_folder(folder_path);
    let title = title_override.unwrap_or(scan.title);
    let now = Utc::now().timestamp();

    GameEntry {
        id: uuid::Uuid::new_v4().to_string(),
        title,
        folder_path: folder_path.to_string(),
        exec_name: None,
        custom_script: None,
        banner_url: None,
        icon_url: None,
        last_played: None,
        play_time_seconds: 0,
        config: GameConfig::default(),
        created_at: now,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scan_game_folder_valid() {
        let temp = tempfile::tempdir().unwrap();
        let game_dir = temp.path().join("PokemonTest");
        fs::create_dir_all(&game_dir).unwrap();
        fs::create_dir_all(game_dir.join("Data")).unwrap();
        fs::create_dir_all(game_dir.join("Graphics")).unwrap();
        fs::create_dir_all(game_dir.join("Audio")).unwrap();
        fs::write(game_dir.join("Data").join("Scripts.rxdata"), b"").unwrap();
        fs::write(game_dir.join("Game.ini"), "[Game]\nTitle=Pokemon Amber\n").unwrap();

        let scan = scan_game_folder(game_dir.to_str().unwrap());
        assert!(scan.is_valid);
        assert_eq!(scan.title, "Pokemon Amber");
        assert!(scan.has_scripts);
        assert!(scan.has_graphics);
        assert!(scan.has_audio);
    }
}
