pub mod models;
pub mod services;

use models::{GameEntry, GameScanResult, ProcessState, SaveBackup};
use services::launcher::{self, LauncherState};
use services::library;
use services::save;
use std::process::Command;
use std::sync::Arc;
use tauri::{AppHandle, State};

pub struct AppState {
    pub launcher: Arc<LauncherState>,
}

#[tauri::command]
fn get_games() -> Vec<GameEntry> {
    library::load_library()
}

#[tauri::command]
fn scan_folder(path: String) -> GameScanResult {
    library::scan_game_folder(&path)
}

#[tauri::command]
fn import_game(path: String, title: Option<String>) -> Result<GameEntry, String> {
    let entry = library::create_game_entry_from_scan(&path, title);
    library::add_or_update_game(entry.clone()).map_err(|e| e.to_string())?;
    Ok(entry)
}

#[tauri::command]
fn update_game(game: GameEntry) -> Result<Vec<GameEntry>, String> {
    library::add_or_update_game(game).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_game(game_id: String) -> Result<Vec<GameEntry>, String> {
    library::remove_game(&game_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn launch_game(
    app: AppHandle,
    state: State<AppState>,
    game_id: String,
) -> Result<ProcessState, String> {
    launcher::launch_game(&app, &state.launcher, &game_id)
}

#[tauri::command]
fn stop_game(app: AppHandle, state: State<AppState>) -> Result<bool, String> {
    launcher::stop_game(&app, &state.launcher)
}

#[tauri::command]
fn get_running_status(state: State<AppState>) -> ProcessState {
    launcher::get_running_status(&state.launcher)
}

#[tauri::command]
fn list_backups(game_id: String) -> Result<Vec<SaveBackup>, String> {
    save::list_backups(&game_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn restore_backup(game_id: String, backup_path: String) -> Result<bool, String> {
    let games = library::load_library();
    let game = games
        .into_iter()
        .find(|g| g.id == game_id)
        .ok_or_else(|| "Game not found".to_string())?;

    save::restore_backup(&game, &backup_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn trigger_manual_backup(game_id: String) -> Result<Option<SaveBackup>, String> {
    let games = library::load_library();
    let game = games
        .into_iter()
        .find(|g| g.id == game_id)
        .ok_or_else(|| "Game not found".to_string())?;

    save::create_pre_launch_backup(&game).map_err(|e| e.to_string())
}

#[tauri::command]
fn reveal_in_finder(path: String) -> Result<(), String> {
    let p = std::path::Path::new(&path);
    let mut cmd = Command::new("open");
    if p.is_file() {
        cmd.arg("-R").arg(&path);
    } else {
        cmd.arg(&path);
    }

    cmd.spawn().map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let launcher_state = Arc::new(LauncherState::new());
    let app_state = AppState {
        launcher: launcher_state,
    };

    tauri::Builder::default()
        .manage(app_state)
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            get_games,
            scan_folder,
            import_game,
            update_game,
            delete_game,
            launch_game,
            stop_game,
            get_running_status,
            list_backups,
            restore_backup,
            trigger_manual_backup,
            reveal_in_finder
        ])
        .run(tauri::generate_context!())
        .expect("error while running oak-launcher application");
}
