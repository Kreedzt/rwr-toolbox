# Tauri Commands Contract（后端 IPC 协议）

**Feature**: 001-weapons-directory-scanner
**Backend**: Rust (Tauri 2.x)

---

## Command: `scan_weapons`

Scan game directory for weapon files and parse all weapons.

### Signature

```rust
#[tauri::command]
pub async fn scan_weapons(game_path: String) -> Result<WeaponScanResult, String>
```

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `game_path` | string | Yes | 游戏资源路径：既可传 `.../media`（内部会自动拼接 `packages`），也可直接传 `.../media/packages`（或 Windows 对应路径） |

### Return Value

**Success**: `WeaponScanResult`
```json
{
  "weapons": [
    {
      "key": "m14ebr.weapon",
      "name": "M14ebr - assault",
      "classTag": "assault",
      "magazineSize": 15.0,
      "killProbability": 0.8,
      "retriggerTime": 0.2,
      // ... other fields
    }
  ],
  "errors": [
    {
      "file": "packages/vanilla/weapons/bad.weapon",
      "error": "Malformed XML: missing closing tag",
      "severity": "error"
    }
  ],
  "duplicateKeys": ["m14ebr.weapon"],
  "scanTime": 1250
}
```

**Error**: `string` - Error message describing what went wrong

### Behavior

1. 校验 `game_path` 存在
2. 归一化 `packages_dir`：
   - 若 `game_path` 末尾是 `packages` → 直接使用
   - 否则 → `game_path.join("packages")`
3. 扫描 `packages_dir/**`，过滤扩展名为 `.weapon` 的文件
4. 对每个文件：
   - quick-xml + serde 解析（重点：以 **attribute** 映射为主）
   - 若存在 `@file` 模板引用 → 递归解析并合并属性（有环检测/深度限制）
   - 提取字段，构造 `Weapon`
   - 单文件错误写入 `errors` 并继续
5. 统计重复 key（`duplicateKeys`）
6. 返回 `WeaponScanResult`（包含 `scanTime`）

### Errors

| Error | Description |
|-------|-------------|
| "Path does not exist: ..." | 路径不存在 |
| "packages directory not found. Expected: ..." | 找不到 `packages` 目录 |
| "Circular reference detected: ..." | 模板继承出现环 |
| "Template depth exceeded limit (>10)" | 模板继承链过深 |

> 备注：当未发现任何 `.weapon` 文件时，当前实现会返回 `weapons=[]` 的 **成功结果**（而不是 Err）。

---

## Command: `validate_game_path`

Validate that a path contains valid RWR game data.

### Signature

```rust
#[tauri::command]
pub async fn validate_game_path(path: String) -> Result<ValidationResult, String>
```

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | Absolute path to validate |

### Return Value

**Success**: `ValidationResult`
```json
{
  "valid": true,
  "weaponsPath": "/full/path/to/packages",
  "packageCount": 3
}
```

**Error**: `string` - Validation error message

### Behavior

1. Check if path exists
2. Check if `packages` subdirectory exists
3. Count packages found
4. Return validation result

---

## Internal Functions（不暴露给前端，仅用于实现说明）

### `resolve_template`

```rust
fn resolve_template(
    base_path: &Path,
    template_file: &str,
    visited: &mut HashSet<PathBuf>,
) -> Result<RawWeapon, anyhow::Error>
```

Recursively resolve template inheritance with cycle detection.

### `parse_weapon_file`

```rust
fn parse_weapon_file(weapon_path: &Path, base_path: &Path) -> Result<Weapon, anyhow::Error>
```

解析单个 `.weapon` 文件并返回合并后的 `Weapon`。

### `discover_weapons`

```rust
fn discover_weapons(base_path: &Path) -> Vec<PathBuf>
```

Find all `.weapon` files using walkdir.

### `merge_attributes`

```rust
fn merge_attributes(parent: Weapon, child: Weapon) -> Weapon
```

Merge parent template attributes into child weapon (child overrides parent).
