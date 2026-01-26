# Implementation Plan: Steam Game Launch With Parameters

**Branch**: `001-steam-launch-args` | **Date**: 2026-01-26 | **Spec**: `specs/001-steam-launch-args/spec.md`

## Summary

本特性为 Running with Rifles（Steam AppID 270150）提供“带参数启动”与“复制参数字符串”能力：

- 设置页提供 `skip_nat_server_usage` 勾选开关
- 点击“启动游戏”：尽力通过 Steam 启动游戏并携带当前参数字符串
- 点击“复制”：仅复制参数字符串（不包含启动命令/链接）
- 约束：不修改 Steam 的 Launch Options 持久配置；不判断参数是否实际生效；当 Steam 不可用或游戏不可用时显示失败提示

## Technical Context

**Language/Version**: TypeScript 5.8.3 + Rust (edition 2021)  
**Primary Dependencies**: Angular 20.3.x, Tauri 2.x, @jsverse/transloco, Tailwind CSS 4.x + DaisyUI 5.x, lucide-angular  
**Storage**: Tauri plugin-store (`settings.json`)  
**Testing**: `ng test` (Karma/Jasmine) + `cargo test` (Rust)  
**Target Platform**: Windows / macOS / Linux desktop  
**Project Type**: Single desktop app (Angular frontend + Tauri backend)

**Constraints**:

- UI 文案必须 i18n
- 不写入 Steam 配置文件（尤其是 Launch Options）
- 启动失败必须给出错误提示；但不对“参数是否生效”做诊断/提示

## Constitution Check

- Desktop-First UI: 800×600 可用；设置项放在现有 Settings 信息密度风格内
- i18n: 所有用户可见文案使用 Transloco key（中英双语）
- Theme: 使用 DaisyUI/Tailwind，颜色走 DaisyUI 变量
- Signals: 新增服务状态用 Angular Signals
- Icons: 如需图标使用 lucide-angular 且先注册到 `src/app/shared/icons/index.ts`

## Project Structure

### Documentation (this feature)

```text
specs/001-steam-launch-args/
├── plan.md
├── spec.md
├── tasks.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── steam-launch-options.openapi.yaml
```

### Source Code (expected changes)

```text
src/app/shared/models/common.models.ts
src/app/core/services/settings.service.ts
src/app/features/settings/settings.component.{ts,html}
src/app/features/settings/services/steam-launch.constants.ts
src/app/features/settings/services/steam-launch.service.ts

src-tauri/src/steam_launch.rs
src-tauri/src/lib.rs
src-tauri/capabilities/default.json
```

## Implementation Notes

- 前端：Settings 页新增一个卡片/区域，包含开关 + 启动按钮 + 复制按钮 + 错误提示区。
- 前端：复制使用现有 clipboard plugin（`@tauri-apps/plugin-clipboard-manager`）
- 后端：提供 Tauri command：
    - `steam_check_rwr_available`：尽力判断游戏是否可用（用于 Q4 的“游戏不可用”失败提示）
    - `steam_launch_rwr`：构造 Steam 启动请求并触发系统打开（通过 opener）

## Complexity Tracking

无（不需要复杂度豁免）。
