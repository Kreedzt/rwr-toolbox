# Tauri Command Contracts

**Feature**: 001-ui-optimizations
**Date**: 2026-01-16

---

## Overview

This document defines the Tauri commands exposed to the Angular frontend for persisting scan directories and scrolling mode preferences. Commands follow Tauri's Rust-based command pattern with JSON serialization.

---

## Command: get_scan_directories

**Purpose**: Retrieve the list of configured scan directories from persistent storage.

**Endpoint**: `get_scan_directories`

**Method**: Command invocation (via Tauri invoke API)

**Request**:
```json
{
  "command": "get_scan_directories",
  "payload": {}
}
```

**Response**:
```json
{
  "status": "success",
  "data": ["/path/to/dir1", "/path/to/dir2"]
}
```

**Response Schema**:
```typescript
type GetScanDirectoriesResponse = string[];
```

**Error Cases**:
- **STORE_ERROR**: Storage file is corrupted or inaccessible (HTTP 500 equivalent)
  - Error message: "Unable to read scan directories from storage"

---

## Command: save_scan_directories

**Purpose**: Save the list of configured scan directories to persistent storage.

**Endpoint**: `save_scan_directories`

**Method**: Command invocation (via Tauri invoke API)

**Request**:
```json
{
  "command": "save_scan_directories",
  "payload": {
    "directories": ["/path/to/dir1", "/path/to/dir2"]
  }
}
```

**Request Schema**:
```typescript
type SaveScanDirectoriesRequest = {
  directories: string[];
};
```

**Response**:
```json
{
  "status": "success",
  "data": null
}
```

**Response Schema**:
```typescript
type SaveScanDirectoriesResponse = null;
```

**Validation Rules**:
- `directories`: Must be an array of strings (array length 0-1000)
- Each path string: Must be non-empty string (max 4096 characters)

**Error Cases**:
- **INVALID_INPUT**: `directories` is not an array or contains non-string values
  - Error message: "Invalid directories format"
- **STORE_ERROR**: Storage write failed (HTTP 500 equivalent)
  - Error message: "Unable to save scan directories to storage"

---

## Command: get_scrolling_mode

**Purpose**: Retrieve the user's scrolling mode preference from persistent storage.

**Endpoint**: `get_scrolling_mode`

**Method**: Command invocation (via Tauri invoke API)

**Request**:
```json
{
  "command": "get_scrolling_mode",
  "payload": {}
}
```

**Response**:
```json
{
  "status": "success",
  "data": "table-only"
}
```

**Response Schema**:
```typescript
type ScrollingMode = 'table-only' | 'full-page';

type GetScrollingModeResponse = ScrollingMode | null;
```

**Behavior**:
- Returns `null` if no scrolling mode preference has been saved (first launch)
- Returns `"table-only"` or `"full-page"` if preference exists

**Error Cases**:
- **STORE_ERROR**: Storage file is corrupted or inaccessible (HTTP 500 equivalent)
  - Error message: "Unable to read scrolling mode from storage"

---

## Command: save_scrolling_mode

**Purpose**: Save the user's scrolling mode preference to persistent storage.

**Endpoint**: `save_scrolling_mode`

**Method**: Command invocation (via Tauri invoke API)

**Request**:
```json
{
  "command": "save_scrolling_mode",
  "payload": {
    "mode": "table-only"
  }
}
```

**Request Schema**:
```typescript
type ScrollingMode = 'table-only' | 'full-page';

type SaveScrollingModeRequest = {
  mode: ScrollingMode;
};
```

**Response**:
```json
{
  "status": "success",
  "data": null
}
```

**Response Schema**:
```typescript
type SaveScrollingModeResponse = null;
```

**Validation Rules**:
- `mode`: Must be exactly `"table-only"` or `"full-page"`

**Error Cases**:
- **INVALID_INPUT**: `mode` is not a valid scrolling mode value
  - Error message: "Invalid scrolling mode: must be 'table-only' or 'full-page'"
- **STORE_ERROR**: Storage write failed (HTTP 500 equivalent)
  - Error message: "Unable to save scrolling mode to storage"

---

## Command: validate_scan_directory

**Purpose**: Validate a directory path to check if it exists, is accessible, and is a valid directory.

**Endpoint**: `validate_scan_directory`

**Method**: Command invocation (via Tauri invoke API)

**Request**:
```json
{
  "command": "validate_scan_directory",
  "payload": {
    "path": "/path/to/directory"
  }
}
```

**Request Schema**:
```typescript
type ValidateScanDirectoryRequest = {
  path: string;
};
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "valid": true,
    "reason": null
  }
}
```

**Response Schema**:
```typescript
type DirectoryValidationResult = {
  valid: boolean;
  reason: 'invalid_path' | 'not_accessible' | 'not_directory' | null;
};

type ValidateScanDirectoryResponse = DirectoryValidationResult;
```

**Validation Rules**:
- `path`: Must be a non-empty string (max 4096 characters)

**Behavior**:
- Returns `valid: true` if path is an accessible directory
- Returns `valid: false` with reason if path is invalid:
  - `invalid_path`: Path is not a valid file system path
  - `not_accessible`: Path exists but application lacks read permissions
  - `not_directory`: Path exists but is a file, not a directory

**Error Cases**:
- **INVALID_INPUT**: `path` is empty or exceeds maximum length
  - Error message: "Invalid path provided"

---

## Rust Implementation Signatures

```rust
// src-tauri/src/lib.rs

use serde::{Deserialize, Serialize};
use tauri::State;
use tauri_plugin_store::Store;

#[derive(Serialize, Deserialize)]
pub struct ScanDirectoriesResponse {
    pub directories: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct SaveScanDirectoriesRequest {
    pub directories: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct ScrollingModeResponse {
    pub mode: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct SaveScrollingModeRequest {
    pub mode: String,
}

#[derive(Serialize, Deserialize)]
pub struct DirectoryValidationResult {
    pub valid: bool,
    pub reason: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct ValidateDirectoryRequest {
    pub path: String,
}

#[tauri::command]
async fn get_scan_directories(store: State<'_, Store>) -> Result<Vec<String>, String> {
    store
        .get("scan_directories")
        .ok_or_else(|| "Unable to read scan directories from storage".to_string())
}

#[tauri::command]
async fn save_scan_directories(
    directories: Vec<String>,
    store: State<'_, Store>,
) -> Result<(), String> {
    store.set("scan_directories", directories);
    Ok(())
}

#[tauri::command]
async fn get_scrolling_mode(store: State<'_, Store>) -> Result<Option<String>, String> {
    Ok(store.get("scrolling_mode"))
}

#[tauri::command]
async fn save_scrolling_mode(
    mode: String,
    store: State<'_, Store>,
) -> Result<(), String> {
    if mode != "table-only" && mode != "full-page" {
        return Err("Invalid scrolling mode: must be 'table-only' or 'full-page'".to_string());
    }
    store.set("scrolling_mode", mode);
    Ok(())
}

#[tauri::command]
async fn validate_scan_directory(path: String) -> Result<DirectoryValidationResult, String> {
    // Validation logic implementation
    // Check if path exists, is accessible, is a directory
    // Return appropriate result
    Ok(DirectoryValidationResult {
        valid: true,
        reason: None,
    })
}
```

---

## Angular Service Integration

```typescript
// src/app/features/settings/services/directory.service.ts

import { Injectable, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

@Injectable({ providedIn: 'root' })
export class DirectoryService {
  readonly directories = signal<string[]>([]);

  async loadDirectories(): Promise<void> {
    try {
      const dirs = await invoke<string[]>('get_scan_directories');
      this.directories.set(dirs);
    } catch (error) {
      console.error('Failed to load scan directories:', error);
      // Show user-facing error message via i18n key
    }
  }

  async saveDirectories(directories: string[]): Promise<void> {
    try {
      await invoke('save_scan_directories', { directories });
      this.directories.set(directories);
    } catch (error) {
      console.error('Failed to save scan directories:', error);
      throw error; // Re-throw for component error handling
    }
  }

  async validateDirectory(path: string): Promise<boolean> {
    try {
      const result = await invoke<{ valid: boolean; reason: string | null }>(
        'validate_scan_directory',
        { path }
      );
      return result.valid;
    } catch (error) {
      console.error('Failed to validate directory:', error);
      return false;
    }
  }
}

// src/app/features/shared/services/scrolling-mode.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

type ScrollingMode = 'table-only' | 'full-page';

@Injectable({ providedIn: 'root' })
export class ScrollingModeService {
  readonly mode = signal<ScrollingMode>('table-only');

  readonly isTableOnlyMode = computed(() => this.mode() === 'table-only');

  async loadMode(): Promise<void> {
    try {
      const saved = await invoke<ScrollingMode | null>('get_scrolling_mode');
      this.mode.set(saved || 'table-only');
    } catch (error) {
      console.error('Failed to load scrolling mode:', error);
      // Default to table-only on error
      this.mode.set('table-only');
    }
  }

  async setMode(mode: ScrollingMode): Promise<void> {
    try {
      await invoke('save_scrolling_mode', { mode });
      this.mode.set(mode);
    } catch (error) {
      console.error('Failed to save scrolling mode:', error);
      throw error;
    }
  }
}
```

---

## Error Handling Strategy

### Frontend (Angular)
- Wrap all `invoke()` calls in try-catch blocks
- Show user-friendly error messages using i18n keys
- Log technical errors to console for debugging
- Provide fallback values when appropriate (e.g., default scrolling mode)

### Backend (Rust)
- Return descriptive error messages as `Result<T, String>`
- Use specific error types for different failure modes
- Validate inputs before processing
- Ensure atomic operations where possible (save either succeeds completely or fails completely)

---

## Versioning

Current version: **v1.0.0**

Breaking changes require version bump and migration strategy:
- Minor version bump (v1.1.0): New commands or optional fields added
- Patch version bump (v1.0.1): Bug fixes, no API changes
- Major version bump (v2.0.0): Breaking changes to command signatures

---

## Testing

### Unit Tests (Rust)
- Test command validation logic
- Test error handling paths
- Test storage read/write operations

### Integration Tests (Rust)
- Test command invocation via Tauri test harness
- Test persistence across command sequences
- Test concurrent access to storage

### Integration Tests (Angular)
- Test service method invocation
- Test error handling and fallback behavior
- Test signal updates after command completion
