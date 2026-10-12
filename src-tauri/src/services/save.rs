use crate::models::{GameEntry, SaveBackup};
use chrono::Utc;
use std::fs;
use std::path::{Path, PathBuf};

pub fn get_app_data_dir() -> PathBuf {
    if let Some(mut dir) = dirs::data_dir() {
        dir.push("OakLauncher");
        dir
    } else {
        PathBuf::from("./oak_launcher_data")
    }
}

pub fn get_backup_dir(game_id: &str) -> PathBuf {
    let mut dir = get_app_data_dir();
    dir.push("backups");
    dir.push(game_id);
    dir
}

pub fn get_default_game_save_dir(game: &GameEntry) -> PathBuf {
    if let Some(custom) = &game.config.custom_save_dir {
        if !custom.trim().is_empty() {
            return PathBuf::from(custom);
        }
    }

    // Default 1: ~/Library/Application Support/<GameTitle>
    if let Some(mut app_support) = dirs::data_dir() {
        app_support.push(&game.title);
        if app_support.exists() {
            return app_support;
        }
    }

    // Default 2: inside game folder itself
    let game_path = PathBuf::from(&game.folder_path);
    if game_path.join("Game.rxdata").exists() {
        return game_path;
    }

    // If neither exists yet, default to ~/Library/Application Support/<GameTitle>
    if let Some(mut app_support) = dirs::data_dir() {
        app_support.push(&game.title);
        app_support
    } else {
        game_path
    }
}

pub fn find_active_save_file(game: &GameEntry) -> Option<PathBuf> {
    let save_dir = get_default_game_save_dir(game);
    let candidates = [
        save_dir.join("Game.rxdata"),
        save_dir.join("Save.rxdata"),
        save_dir.join("save.rxdata"),
    ];

    for candidate in candidates {
        if candidate.exists() && candidate.is_file() {
            return Some(candidate);
        }
    }

    // Fallback: check game folder directly
    let game_folder = Path::new(&game.folder_path);
    let in_folder_candidates = [
        game_folder.join("Game.rxdata"),
        game_folder.join("Save.rxdata"),
    ];
    for candidate in in_folder_candidates {
        if candidate.exists() && candidate.is_file() {
            return Some(candidate);
        }
    }

    None
}

pub fn create_pre_launch_backup(game: &GameEntry) -> std::io::Result<Option<SaveBackup>> {
    let active_save = match find_active_save_file(game) {
        Some(path) => path,
        None => return Ok(None),
    };

    let backup_dir = get_backup_dir(&game.id);
    fs::create_dir_all(&backup_dir)?;

    let now = Utc::now();
    let timestamp = now.timestamp();
    let filename = active_save
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Game.rxdata");

    let backup_filename = format!("{}_{}", now.format("%Y%m%d_%H%M%S"), filename);
    let backup_path = backup_dir.join(&backup_filename);

    fs::copy(&active_save, &backup_path)?;
    let metadata = fs::metadata(&backup_path)?;

    Ok(Some(SaveBackup {
        id: uuid::Uuid::new_v4().to_string(),
        game_id: game.id.clone(),
        filename: backup_filename,
        filepath: backup_path.to_string_lossy().to_string(),
        timestamp,
        size_bytes: metadata.len(),
        label: Some("Pre-launch automatic backup".to_string()),
    }))
}

pub fn list_backups(game_id: &str) -> std::io::Result<Vec<SaveBackup>> {
    let backup_dir = get_backup_dir(game_id);
    if !backup_dir.exists() {
        return Ok(Vec::new());
    }

    let mut backups = Vec::new();
    for entry in fs::read_dir(backup_dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_file() && path.extension().map_or(false, |ext| ext == "rxdata" || ext == "rubysave") {
            let metadata = fs::metadata(&path)?;
            let filename = path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_string();

            let timestamp = metadata
                .modified()
                .ok()
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_secs() as i64)
                .unwrap_or_else(|| Utc::now().timestamp());

            backups.push(SaveBackup {
                id: filename.clone(),
                game_id: game_id.to_string(),
                filename,
                filepath: path.to_string_lossy().to_string(),
                timestamp,
                size_bytes: metadata.len(),
                label: None,
            });
        }
    }

    backups.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
    Ok(backups)
}

pub fn restore_backup(game: &GameEntry, backup_filepath: &str) -> std::io::Result<bool> {
    let backup_path = Path::new(backup_filepath);
    if !backup_path.exists() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "Backup file does not exist",
        ));
    }

    let save_dir = get_default_game_save_dir(game);
    fs::create_dir_all(&save_dir)?;

    let target_save_file = save_dir.join("Game.rxdata");

    // Create a safety backup of existing save file before overwriting
    if target_save_file.exists() {
        let safety_name = format!("pre_restore_safety_{}.rxdata", Utc::now().format("%Y%m%d_%H%M%S"));
        let safety_path = get_backup_dir(&game.id).join(safety_name);
        let _ = fs::copy(&target_save_file, safety_path);
    }

    fs::copy(backup_path, target_save_file)?;
    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::GameConfig;

    #[test]
    fn test_save_detection_and_backup() {
        let temp_dir = tempfile::tempdir().unwrap();
        let game_dir = temp_dir.path().join("TestGame");
        fs::create_dir_all(&game_dir).unwrap();

        let save_file = game_dir.join("Game.rxdata");
        fs::write(&save_file, b"DUMMY_SAVE_DATA_PKMN").unwrap();

        let game = GameEntry {
            id: "unit-test-game".to_string(),
            title: "Unit Test Game".to_string(),
            folder_path: game_dir.to_string_lossy().to_string(),
            exec_name: None,
            custom_script: None,
            banner_url: None,
            icon_url: None,
            last_played: None,
            play_time_seconds: 0,
            config: GameConfig {
                custom_save_dir: Some(game_dir.to_string_lossy().to_string()),
                ..GameConfig::default()
            },
            created_at: 1000,
        };

        let found = find_active_save_file(&game);
        assert!(found.is_some());
        assert_eq!(found.unwrap(), save_file);
    }
}
