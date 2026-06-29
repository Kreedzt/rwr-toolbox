use serde::Serialize;
use std::path::PathBuf;
use tauri_plugin_opener::OpenerExt;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase", tag = "kind")]
pub enum RevealGameLogResult {
    Revealed,
    OpenedFolder,
    NotFound { expected_path: String },
    Failed { message: String },
}

#[tauri::command]
pub fn reveal_rwr_game_log(app: tauri::AppHandle) -> RevealGameLogResult {
    let base = match dirs::data_dir() {
        Some(b) => b,
        None => {
            return RevealGameLogResult::NotFound {
                expected_path: String::new(),
            }
        }
    };
    let folder: PathBuf = base.join("Running with rifles");
    let log: PathBuf = folder.join("rwr_game.log");

    if log.exists() {
        return match app.opener().reveal_item_in_dir(&log) {
            Ok(_) => RevealGameLogResult::Revealed,
            Err(e) => RevealGameLogResult::Failed {
                message: e.to_string(),
            },
        };
    }
    if folder.exists() {
        return match app.opener().open_path(folder.to_string_lossy().to_string(), None::<String>) {
            Ok(_) => RevealGameLogResult::OpenedFolder,
            Err(e) => RevealGameLogResult::Failed {
                message: e.to_string(),
            },
        };
    }
    RevealGameLogResult::NotFound {
        expected_path: folder.to_string_lossy().to_string(),
    }
}
