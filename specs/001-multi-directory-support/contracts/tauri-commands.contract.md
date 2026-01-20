# Tauri Commands Contract

**Feature**: 001-multi-directory-support
**Component**: Backend (Rust + Tauri)
**Language**: Rust (Edition 2021)

## Overview

This contract defines the Rust backend commands for directory validation and file system operations.

---

## New Command: validate_directory

**Purpose**: Validate a directory path for game data scanning

**Signature**:
```rust
#[tauri::command]
pub fn validate_directory(path: String) -> ValidationResult
```

**Input**:
```rust
pub struct ValidateDirectoryArgs {
    pub path: String,  // Absolute file system path
}
```

**Output**:
```rust
#[derive(Serialize, Deserialize)]
pub struct ValidationResult {
    pub valid: bool,
    pub error_code: Option<DirectoryErrorCode>,
    pub message: String,
    pub details: Option<ValidationDetails>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DirectoryErrorCode {
    PathNotFound,
    NotADirectory,
    AccessDenied,
    MissingMediaSubdirectory,
    DuplicateDirectory,  // Note: This check may be done in frontend
}

#[derive(Serialize, Deserialize)]
pub struct ValidationDetails {
    pub path_exists: bool,
    pub is_directory: bool,
    pub is_readable: bool,
    pub has_media_subdirectory: bool,
}
```

---

## Validation Logic

```rust
use std::path::Path;

pub fn validate_directory(path: String) -> ValidationResult {
    let path_obj = Path::new(&path);

    // Check 1: Path exists
    if !path_obj.exists() {
        return ValidationResult {
            valid: false,
            error_code: Some(DirectoryErrorCode::PathNotFound),
            message: "The specified path does not exist".to_string(),
            details: Some(ValidationDetails {
                path_exists: false,
                is_directory: false,
                is_readable: false,
                has_media_subdirectory: false,
            }),
        };
    }

    // Check 2: Is a directory
    if !path_obj.is_dir() {
        return ValidationResult {
            valid: false,
            error_code: Some(DirectoryErrorCode::NotADirectory),
            message: "The path is not a directory".to_string(),
            details: Some(ValidationDetails {
                path_exists: true,
                is_directory: false,
                is_readable: false,
                has_media_subdirectory: false,
            }),
        };
    }

    // Check 3: Is readable
    let is_readable = path_obj.readable();
    if !is_readable {
        return ValidationResult {
            valid: false,
            error_code: Some(DirectoryErrorCode::AccessDenied),
            message: "Access to the directory is denied".to_string(),
            details: Some(ValidationDetails {
                path_exists: true,
                is_directory: true,
                is_readable: false,
                has_media_subdirectory: false,
            }),
        };
    }

    // Check 4: Has media subdirectory
    let media_path = path_obj.join("media");
    if !media_path.exists() || !media_path.is_dir() {
        return ValidationResult {
            valid: false,
            error_code: Some(DirectoryErrorCode::MissingMediaSubdirectory),
            message: "Directory must contain a 'media' subdirectory".to_string(),
            details: Some(ValidationDetails {
                path_exists: true,
                is_directory: true,
                is_readable: true,
                has_media_subdirectory: false,
            }),
        };
    }

    // All checks passed
    ValidationResult {
        valid: true,
        error_code: None,
        message: "Directory is valid".to_string(),
        details: Some(ValidationDetails {
            path_exists: true,
            is_directory: true,
            is_readable: true,
            has_media_subdirectory: true,
        }),
    }
}
```

---

## Modified Commands: scan_weapons, scan_items

**Purpose**: Extend existing scan commands to accept optional directory parameter

### scan_weapons (Modified)

**Old Signature**:
```rust
#[tauri::command]
pub fn scan_weapons() -> Result<Vec<Weapon>, String>
```

**New Signature**:
```rust
#[tauri::command]
pub fn scan_weapons(directory: Option<String>) -> Result<Vec<Weapon>, String>
```

**Behavior**:
- If `directory` is `None`: Use global `game_path` from settings (backward compatible)
- If `directory` is `Some(path)`: Scan weapons from the specified directory only

**Implementation**:
```rust
#[tauri::command]
pub fn scan_weapons(directory: Option<String>) -> Result<Vec<Weapon>, String> {
    let scan_path = if let Some(dir) = directory {
        dir
    } else {
        // Fallback to global game_path for backward compatibility
        get_game_path()?  // Read from settings
    };

    let media_path = Path::new(&scan_path).join("media");

    if !media_path.exists() {
        return Err("Media directory not found".to_string());
    }

    // Existing weapon scanning logic...
    let weapons = parse_weapon_files(&media_path)?;
    Ok(weapons)
}
```

### scan_items (Modified)

**Old Signature**:
```rust
#[tauri::command]
pub fn scan_items() -> Result<Vec<Item>, String>
```

**New Signature**:
```rust
#[tauri::command]
pub fn scan_items(directory: Option<String>) -> Result<Vec<Item>, String>
```

**Behavior**: Same pattern as `scan_weapons`

---

## Module Structure

**New File**: `src-tauri/src/directories.rs`

```rust
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct ValidationResult {
    pub valid: bool,
    #[serde(rename = "errorCode")]
    pub error_code: Option<DirectoryErrorCode>,
    pub message: String,
    pub details: Option<ValidationDetails>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DirectoryErrorCode {
    PathNotFound,
    NotADirectory,
    AccessDenied,
    MissingMediaSubdirectory,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ValidationDetails {
    pub path_exists: bool,
    pub is_directory: bool,
    pub is_readable: bool,
    #[serde(rename = "hasMediaSubdirectory")]
    pub has_media_subdirectory: bool,
}

#[tauri::command]
pub fn validate_directory(path: String) -> ValidationResult {
    // Implementation from above
}

// Helper function to check if path is readable
fn is_readable(path: &Path) -> bool {
    // Platform-specific read permission check
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        match path.metadata() {
            Ok(meta) => {
                let permissions = meta.permissions();
                permissions.mode() & 0o444 != 0  // Read bits
            }
            Err(_) => false,
        }
    }

    #[cfg(windows)]
    {
        // Windows: try to read directory
        path.readable().unwrap_or(false)
    }
}
```

---

## Command Registration

**File**: `src-tauri/src/lib.rs`

**Update**:
```rust
mod directories;  // NEW module import

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // ... existing plugins ...
        .invoke_handler(tauri::generate_handler![
            // ... existing commands ...
            // Existing scan commands (modified)
            scan_weapons,
            scan_items,
            // NEW command
            validate_directory,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## Dependencies

**Cargo.toml** (ensure these are present):

```toml
[dependencies]
# Existing dependencies
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# For directory validation (likely already present)
walkdir = "2"  # For recursive directory traversal

# No new dependencies required
```

---

## Error Handling

All errors are returned as `String` for simplicity:

```rust
// In Tauri commands
pub fn validate_directory(path: String) -> ValidationResult {
    // No unwrap/expect - always return structured result
    ValidationResult { /* ... */ }
}

// For commands returning Result
pub fn scan_weapons(directory: Option<String>) -> Result<Vec<Weapon>, String> {
    if some_error {
        return Err("Descriptive error message".to_string());
    }
    Ok(weapons)
}
```

---

## Platform Considerations

### Path Separators

- Windows: `\` or `/` (Rust's `Path` handles both)
- Unix: `/`
- Use `Path::join()` for cross-platform path construction

### Path Length Limits

- Windows: MAX_PATH = 260 characters (extended paths support longer)
- Unix: Typically PATH_MAX = 4096
- Consider using `std::path::PathBuf` for long paths

### Permissions

- Unix: Check `r-x` bits on directory
- Windows: Check ACLs (simplified with `Path::readable()`)

---

## Testing

### Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_nonexistent_path() {
        let result = validate_directory("/nonexistent/path".to_string());
        assert!(!result.valid);
        assert_eq!(result.error_code, Some(DirectoryErrorCode::PathNotFound));
    }

    #[test]
    fn test_validate_missing_media_subdirectory() {
        let result = validate_directory("/tmp".to_string());
        assert!(!result.valid);
        assert_eq!(result.error_code, Some(DirectoryErrorCode::MissingMediaSubdirectory));
    }

    // More tests...
}
```

### Integration Tests

Test with actual directory structure:
```
test_data/
├── valid_game/
│   └── media/
├── invalid_no_media/
└── not_a_directory.txt
```

---

## Performance Considerations

- `validate_directory`: Should complete in < 100ms for local paths
- File system calls are synchronous (acceptable for validation)
- Consider async operations if scanning network paths (future enhancement)

---

## Security Considerations

1. **Path Traversal**: Validate input path doesn't escape intended scope
   ```rust
   // Only scan user-provided directories, not system paths
   if path.starts_with("/etc") || path.starts_with("C:\\Windows") {
       return ValidationResult { valid: false, /* ... */ };
   }
   ```

2. **Symbolic Links**: Be aware of symlink attacks
   ```rust
   // Option: Follow or don't follow symlinks
   // walkdir has follow_links(true/false) option
   ```

3. **Resource Limits**: Limit scan depth/file count to prevent DoS
   ```rust
   // In scan commands
   const MAX_SCAN_DEPTH: usize = 10;
   const MAX_FILES: usize = 100_000;
   ```

---

## Backward Compatibility

The modified `scan_weapons` and `scan_items` commands maintain backward compatibility:

```rust
// Old call (still works)
invoke('scan_weapons')

// New call (specific directory)
invoke('scan_weapons', { directory: '/path/to/game' })
```

Frontend can gradually migrate to directory-specific scanning.
