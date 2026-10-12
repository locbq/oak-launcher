use crate::models::ProcessState;
use crate::services::config::{generate_mkxp_config, write_mkxp_config_file};
use crate::services::library::{add_or_update_game, load_library};
use crate::services::save::{create_pre_launch_backup, get_default_game_save_dir};
use chrono::Utc;
use std::path::PathBuf;
use std::process::{Child, Command};
use std::sync::{Arc, Mutex};
use tauri::Emitter;

pub struct LauncherState {
    pub current_process: Mutex<Option<RunningInstance>>,
}

pub struct RunningInstance {
    pub game_id: String,
    pub child: Child,
    pub started_at: i64,
}

impl LauncherState {
    pub fn new() -> Self {
        Self {
            current_process: Mutex::new(None),
        }
    }
}

pub fn find_mkxp_binary() -> Result<(PathBuf, PathBuf), String> {
    // Returns (binary_path, runtime_working_dir)
    let candidates = [
        ("runtime/mkxp-z/mkxp-z.aarch64", "runtime/mkxp-z"),
        ("src-tauri/binaries/mkxp-z-aarch64-apple-darwin", "runtime/mkxp-z"),
        ("../runtime/mkxp-z/mkxp-z.aarch64", "../runtime/mkxp-z"),
        ("../src-tauri/binaries/mkxp-z-aarch64-apple-darwin", "../runtime/mkxp-z"),
    ];

    for (bin_rel, dir_rel) in candidates {
        let bin_path = PathBuf::from(bin_rel);
        if bin_path.exists() {
            let dir_path = PathBuf::from(dir_rel);
            let canonical_bin = bin_path.canonicalize().unwrap_or(bin_path);
            let canonical_dir = dir_path.canonicalize().unwrap_or(dir_path);
            return Ok((canonical_bin, canonical_dir));
        }
    }

    // Check executable directory or bundle resources
    if let Ok(exe_dir) = std::env::current_exe() {
        if let Some(parent) = exe_dir.parent() {
            let bundled_bin = parent.join("mkxp-z-aarch64-apple-darwin");
            if bundled_bin.exists() {
                return Ok((bundled_bin, parent.to_path_buf()));
            }
        }
    }

    Err("Could not locate native mkxp-z executable. Please run scripts/fetch-runtime.sh".to_string())
}

pub fn launch_game<R: tauri::Runtime>(
    app_handle: &tauri::AppHandle<R>,
    state: &Arc<LauncherState>,
    game_id: &str,
) -> Result<ProcessState, String> {
    let mut current_lock = state.current_process.lock().map_err(|e| e.to_string())?;

    // Check if a process is already running
    if let Some(ref mut instance) = *current_lock {
        match instance.child.try_wait() {
            Ok(Some(_)) => {
                // Previously running process has finished
                *current_lock = None;
            }
            Ok(None) => {
                return Err(format!("A game is already running (game_id: {})", instance.game_id));
            }
            Err(e) => {
                return Err(format!("Error checking running process: {}", e));
            }
        }
    }

    // Load game from library
    let games = load_library();
    let mut game = games
        .into_iter()
        .find(|g| g.id == game_id)
        .ok_or_else(|| format!("Game not found with id: {}", game_id))?;

    let game_path = PathBuf::from(&game.folder_path);
    if !game_path.exists() {
        return Err(format!("Game folder does not exist: {}", game.folder_path));
    }

    // Step 1: Perform automatic save backup before launch
    let _ = create_pre_launch_backup(&game);

    // Step 2: Locate mkxp-z binary and runtime directory
    let (mkxp_bin, runtime_dir) = find_mkxp_binary()?;

    // Step 3: Generate mkxp.json inside the runtime directory (or game directory)
    let save_dir = get_default_game_save_dir(&game);
    let mkxp_config = generate_mkxp_config(&game, Some(&save_dir.to_string_lossy()), &runtime_dir);
    
    // Write mkxp.json to runtime directory where mkxp-z will read it
    let mkxp_json_path = runtime_dir.join("mkxp.json");
    write_mkxp_config_file(&mkxp_config, &mkxp_json_path)
        .map_err(|e| format!("Failed to write mkxp.json: {}", e))?;

    // Also write a copy to the game folder for convenience
    let game_mkxp_json = game_path.join("mkxp.json");
    let _ = write_mkxp_config_file(&mkxp_config, &game_mkxp_json);

    // Sync Game.ini to runtime directory
    let game_ini = game_path.join("Game.ini");
    let runtime_ini = runtime_dir.join("Game.ini");
    if game_ini.exists() {
        let _ = std::fs::copy(&game_ini, &runtime_ini);
    } else {
        let ascii_title: String = game.title.chars().filter(|c| c.is_ascii()).collect();
        let title = if ascii_title.is_empty() { "Pokemon Game" } else { &ascii_title };
        let default_ini = format!(
            "[Game]\r\nLibrary=RGSS104E.dll\r\nScripts=Data\\Scripts.rxdata\r\nTitle={}\r\nRTP1=\r\nRTP2=\r\nRTP3=\r\n",
            title
        );
        let _ = std::fs::write(&runtime_ini, default_ini);
    }

    // Step 4: Spawn mkxp-z process
    let mut cmd = Command::new(&mkxp_bin);
    cmd.current_dir(&runtime_dir);
    cmd.env("MKXPZ_SELECT_PATH", &game.folder_path);

    let child = cmd
        .spawn()
        .map_err(|e| format!("Failed to spawn mkxp-z: {}", e))?;

    let pid = child.id();
    let started_at = Utc::now().timestamp();

    // Update game last_played timestamp
    game.last_played = Some(started_at);
    let _ = add_or_update_game(game);

    *current_lock = Some(RunningInstance {
        game_id: game_id.to_string(),
        child,
        started_at,
    });

    let process_state = ProcessState {
        game_id: game_id.to_string(),
        is_running: true,
        pid: Some(pid),
        started_at: Some(started_at),
    };

    let _ = app_handle.emit("game-status-changed", &process_state);

    // Spawn monitor thread to wait for game exit and record playtime
    let monitor_state = Arc::clone(state);
    let monitor_game_id = game_id.to_string();
    let monitor_app = app_handle.clone();

    std::thread::spawn(move || {
        loop {
            std::thread::sleep(std::time::Duration::from_millis(500));
            let mut lock = match monitor_state.current_process.lock() {
                Ok(l) => l,
                Err(_) => break,
            };

            if let Some(ref mut inst) = *lock {
                if inst.game_id == monitor_game_id {
                    match inst.child.try_wait() {
                        Ok(Some(_status)) => {
                            let duration = (Utc::now().timestamp() - inst.started_at).max(0) as u64;
                            let games = load_library();
                            if let Some(mut g) = games.into_iter().find(|x| x.id == monitor_game_id) {
                                g.play_time_seconds += duration;
                                let _ = add_or_update_game(g);
                            }

                            *lock = None;

                            let exit_state = ProcessState {
                                game_id: monitor_game_id.clone(),
                                is_running: false,
                                pid: None,
                                started_at: None,
                            };
                            let _ = monitor_app.emit("game-status-changed", &exit_state);
                            break;
                        }
                        Ok(None) => {} // Still running
                        Err(_) => {
                            *lock = None;
                            break;
                        }
                    }
                } else {
                    break;
                }
            } else {
                break;
            }
        }
    });

    Ok(process_state)
}

pub fn stop_game<R: tauri::Runtime>(
    app_handle: &tauri::AppHandle<R>,
    state: &Arc<LauncherState>,
) -> Result<bool, String> {
    let mut current_lock = state.current_process.lock().map_err(|e| e.to_string())?;
    if let Some(mut inst) = current_lock.take() {
        let _ = inst.child.kill();
        let exit_state = ProcessState {
            game_id: inst.game_id,
            is_running: false,
            pid: None,
            started_at: None,
        };
        let _ = app_handle.emit("game-status-changed", &exit_state);
        Ok(true)
    } else {
        Ok(false)
    }
}

pub fn get_running_status(state: &Arc<LauncherState>) -> ProcessState {
    if let Ok(mut lock) = state.current_process.lock() {
        if let Some(ref mut inst) = *lock {
            match inst.child.try_wait() {
                Ok(None) => {
                    return ProcessState {
                        game_id: inst.game_id.clone(),
                        is_running: true,
                        pid: Some(inst.child.id()),
                        started_at: Some(inst.started_at),
                    };
                }
                _ => {
                    *lock = None;
                }
            }
        }
    }

    ProcessState {
        game_id: String::new(),
        is_running: false,
        pid: None,
        started_at: None,
    }
}
