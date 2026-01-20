# 数据模型：Weapons Directory Scanner（武器目录扫描）

**Feature**: 001-weapons-directory-scanner  
**Date**: 2026-01-15  

---

## Entity：Weapon

**描述**：从单个 RWR `.weapon` XML 文件（含模板继承合并后）得到的一条武器记录。

### 字段

| 字段 | 类型 | 可空 | 描述 | 主要来源（XML） |
|---|---|---:|---|---|
| `key` | string | 是 | 武器唯一标识（建议保留 `.weapon` 扩展名） | `<weapon @key="ak47.weapon">`；缺失时 fallback 到文件名 |
| `name` | string | 否 | 展示名 | `<specification @name="AK47">` |
| `classTag` | string | 否 | 分类标签 | `<tag @name="assault" />`（优先）；缺失时可降级为其它可用字段 |
| `magazineSize` | number | 否 | 弹匣容量 | `<specification @magazine_size="30">` |
| `killProbability` | number | 否 | 伤害/击杀概率（0–1） | `<projectile><result @kill_probability="0.55" /></projectile>` |
| `retriggerTime` | number | 否 | 射速间隔（秒） | `<specification @retrigger_time="0.123">` |
| `projectileSpeed` | number | 是 | 弹速 | `<specification @projectile_speed="100.0">` |
| `encumbrance` | number | 是 | 负重/重量 | `<inventory @encumbrance="10.0" />` |
| `price` | number | 是 | 价格 | `<inventory @price="2.0" />` |
| `suppressed` | boolean | 否 | 是否消音 | `<specification @suppressed="0/1">`（或 `<weapon @suppressed="...">` 的兼容分支） |
| `canRespawnWith` | boolean | 否 | 是否可复活携带 |（如存在对应字段则读取；否则按默认值） |
| `inStock` | boolean | 否 | 是否商店可买 |（如存在对应字段则读取；否则按默认值） |
| `chainVariants` | string[] | 否 | 武器链（不同模式/变体） | `<weapon><nextInChain>...</nextInChain></weapon>`（如实际为 attribute/element，需按样本校准） |
| `stanceAccuracies` | StanceAccuracy[] | 否 | 姿态命中率列表 | `<stance @state_key="running" @accuracy="0.3" />`（通常在模板里出现） |
| `sourceFile` | string | 否 | 实际文件路径（用于排错/溯源） | 文件系统路径 |
| `packageName` | string | 否 | 包名（vanilla / workshop / mod） | 从路径 `packages/<package>/...` 推导 |

### 关系

- Weapon **包含多个** `StanceAccuracy`
- Weapon **可链接多个** `chainVariants`（以 key 引用其它 Weapon）

### 校验规则（MVP）

- `key` 在同一次扫描结果中应唯一（FR-006）；重复 key 需要汇报给用户
- `killProbability` 约束在 \([0, 1]\)（非硬失败：异常值可记录 warning）
- `retriggerTime > 0`、`magazineSize > 0`（缺失可为 0，但应视为“信息不完整”）

---

## Entity：StanceAccuracy

**描述**：某个姿态下的命中率。

| 字段 | 类型 | 描述 |
|---|---|---|
| `stance` | string | 姿态枚举值（`running/walking/crouch_moving/standing/crouching/prone/prone_moving/over_wall`） |
| `accuracy` | number | 命中率（0–1） |

---

## Entity：ScanError

**描述**：扫描过程中某个文件的解析/读取错误（不会中断全局扫描）。

| 字段 | 类型 | 描述 |
|---|---|---|
| `file` | string | 出错文件路径 |
| `error` | string | 错误信息 |
| `severity` | `'error' \| 'warning'` | 严重性 |

---

## Entity：WeaponScanResult

| 字段 | 类型 | 描述 |
|---|---|---|
| `weapons` | `Weapon[]` | 扫描出来的武器列表 |
| `errors` | `ScanError[]` | 过程中累积的错误/告警 |
| `duplicateKeys` | `string[]` | 重复 key 列表 |
| `scanTime` | number | 扫描耗时（ms） |

---

## Entity：ColumnVisibility（列显隐）

**描述**：用户对表格列显示的偏好设置（FR-004a），应通过 `SettingsService` 持久化（桌面端 Tauri Store 优先）。

| 字段 | 类型 | 描述 |
|---|---|---|
| `columnId` | string | 列 ID（`key/name/classTag/magazineSize/killProbability/retriggerTime/...`） |
| `visible` | boolean | 是否可见 |
| `order` | number? | 可选：显示顺序（后续扩展） |

---

## 数据流（高层）

```
Game Directory（packages/*/weapons/*.weapon）
  └─ Rust（weapons.rs）
      1) WalkDir 发现文件
      2) quick-xml + serde（按 attribute）解析
      3) resolve_template 合并模板
      4) 提取字段 + 重复 key 检测 + 错误收集
  └─ Tauri IPC（scan_weapons / validate_game_path）
      └─ Angular WeaponService（Signals：weapons/loading/error/filters）
          └─ WeaponsComponent（表格渲染 + 搜索/过滤 + 列显隐）
```
