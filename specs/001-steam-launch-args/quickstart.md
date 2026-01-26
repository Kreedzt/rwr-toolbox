# Phase 1 Design: Quickstart (Dev & QA)

**Feature**: `001-steam-launch-args`
**Target**: Running with Rifles (Steam AppID 270150)

## Local Dev

- 安装依赖：`pnpm install`
- 启动 Web 开发：`pnpm start`
- 启动桌面端：`pnpm tauri dev`

> 本特性需要桌面端来触发 Steam 启动与剪贴板能力。

## Manual QA Checklist

### 1) 参数勾选与显示

- 操作：进入 Settings → Steam 启动区域，勾选/取消勾选 `skip_nat_server_usage`。
- 预期：
    - 勾选时显示的参数字符串包含 `skip_nat_server_usage`
    - 取消勾选时参数字符串为空（或显示 `-`）

### 2) 一键复制（仅参数字符串）

- 操作：点击“复制参数”。
- 预期：
    - 剪贴板内容只包含参数字符串（例如 `skip_nat_server_usage`）
    - 不包含启动命令/链接等其他文本
    - 未勾选时复制为空字符串

### 3) 一键启动（尽力带参）

- 前置：Steam 已安装；Running with Rifles 已安装。
- 操作：点击“启动游戏”。
- 预期：
    - 工具触发 Steam 启动游戏
    - 工具不提示“参数是否实际生效”（不做诊断）

### 4) 失败提示（Steam 不可用 / 游戏不可用）

- 场景 A：未安装 Steam / 系统无法调用 Steam

    - 操作：点击“启动游戏”
    - 预期：显示“Steam 不可用”错误提示

- 场景 B：Steam 已安装，但游戏未安装
    - 操作：点击“启动游戏”
    - 预期：显示“游戏不可用（未安装）”错误提示

## Notes

- 本特性不修改 Steam 的 per-game Launch Options 持久配置。
- “游戏不可用”判断为 best-effort，主要基于是否检测到已安装。
