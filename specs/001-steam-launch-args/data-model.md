# Phase 1 Design: Data Model

**Feature**: `specs/001-steam-launch-args/spec.md`
**Research**: `specs/001-steam-launch-args/research.md`

本文件描述本特性的核心数据对象、字段、校验规则与状态流转，用于指导实现与测试。

## Entities

### `TargetSteamGame`

- **Meaning**: 预置目标 Steam 游戏（固定，不可选择）。
- **Fields**:
    - `appId`: number = `270150`
    - `name`: string = `Running with Rifles`

### `ManagedLaunchParameter`

- **Meaning**: 工具可管理（启用/禁用）的单个启动参数。
- **Fields**:
    - `id`: string = `skip_nat_server_usage`
    - `token`: string = `skip_nat_server_usage`
    - `enabled`: boolean（工具内设置的期望状态）

### `LaunchPayload`

- **Meaning**: 由当前启用的 token 集合拼接出的“参数字符串”。
- **Fields**:
    - `argsText`: string（例：`skip_nat_server_usage`；为空字符串表示无参数）

### `LaunchAttemptState`

- **Meaning**: 一次启动/复制动作的 UI 状态。
- **Fields**:
    - `isLaunching`: boolean
    - `lastErrorKey`: string | null（i18n key）

### `GameAvailability`

- **Meaning**: 后端对“游戏是否可用”的 best-effort 结果。
- **Fields**:
    - `available`: boolean
    - `reasonKey`: string | null（不可用原因 i18n key）

## Validation Rules

- `token` 必须是单 token（不包含换行）。
- `argsText` 拼接规则：
    - `enabled=true` → `argsText` 包含 `skip_nat_server_usage`
    - `enabled=false` → `argsText` 为空字符串
    - 不允许重复 token

## State Model

- 点击“启动游戏”时：
    - 进入 `isLaunching=true`
    - 成功/失败后回到 `isLaunching=false`
    - 失败时写入 `lastErrorKey`，成功时清空 `lastErrorKey`

## Persistence

- 工具侧需要持久化：`enabled`（用户勾选状态）。
- `lastErrorKey` 与 `available` 不持久化（随会话变化）。
