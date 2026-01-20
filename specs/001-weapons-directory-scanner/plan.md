# Implementation Plan: Weapons Directory Scanner

**Branch**: `001-weapons-directory-scanner` | **Date**: 2026-01-15 | **Spec**: `specs/001-weapons-directory-scanner/spec.md`  
**Input**: `specs/001-weapons-directory-scanner/spec.md`（本地游戏数据目录扫描 / 资源文件预览 的核心前置）

## Summary

- **目标（P1）**：扫描游戏目录 `packages/*/weapons/*.weapon`，解析武器 XML（含 template 继承），并在前端以表格呈现关键字段（key/name/class/magazine_size/kill_probability/retrigger_time）。
- **当前阻塞问题**：Rust 侧“解析出来没有值”主要源于 `.weapon` 文件 **关键字段是 XML attribute**（例如 `<weapon key="...">`、`<specification retrigger_time="...">`），但当前反序列化结构体多数按 **element** 映射，导致大量 `None/0/""`。
- **交付形态**：通过 Tauri command（`validate_game_path`、`scan_weapons`）把 `WeaponScanResult` 返给 Angular；前端用 Signals 做状态、表格渲染/搜索/过滤/列显隐持久化。

## Technical Context

**Language/Version**: TypeScript 5.8.3（Angular 20.3.15）+ Rust（edition 2021；Tauri 2.x）

**Primary Dependencies**:
- 前端：Transloco 8.2.0、TailwindCSS 4.1.x、DaisyUI 5.5.x
- Rust：tauri 2、quick-xml 0.37（serde）、walkdir 2.5、anyhow 1.0、dirs 5.0、serde/serde_json

**Storage**:
- 设置持久化：Tauri Store（`settings.json`）优先，web fallback localStorage（由 `SettingsService` 统一抽象）
- 扫描结果缓存：内存（Rust 侧可选缓存模板解析结果；前端过滤/搜索只做内存计算）

**Testing**:
- Rust：`cargo test`
- 前端：Karma/Jasmine（已有工程配置）

**Target Platform**: Tauri 桌面端（macOS/Windows/Linux），最低可用分辨率 800×600

**Project Type**: 单仓库桌面应用（`src/` Angular + `src-tauri/` Rust）

**Performance Goals**:
- 扫描 100–200 个 `.weapon`：< 3s（SC-001）
- 前端 filter/search 更新：< 500ms（SC-003）

**Constraints**:
- 800×600 下无横向滚动/裁剪（表格需隐藏次要列、容器可滚动）
- 所有可见文本必须 i18n（Transloco；禁止硬编码）
- Angular v20 现代语法强制：`@if/@for`、`signal()/computed()`，Service 内 **Signal 管状态 / RxJS 管异步**
- 扫描与解析为只读：不写入游戏目录（数据安全原则不触发备份/回滚流程）

**Scale/Scope**:
- 本期聚焦：本地武器扫描 + 表格展示 + 基础搜索/过滤/列显隐
- 后续迭代：资源预览、workshop 内容解析、详情视图增强等

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **文档驱动**：已按守则阅读 `docs-ai/STATUS.md` → `UI.md` → `PLAN.APPENDIX.md` → `PROGRESS.md`，本计划将以这些口径为准。
- **桌面优先 / 800×600**：表格与筛选面板必须在 800×600 下可用；高级筛选使用可折叠面板并限制高度滚动。
- **i18n 强制**：所有按钮/提示/列名/错误都必须用 Transloco key。
- **架构一致性**：Rust 通过 Tauri command 暴露功能；前端 Service 层以 Signals 为单一真源。
- **简约至上**：MVP 不做流式进度条；仅提供 loading 状态与扫描结果摘要。

结论：通过（无需要 justify 的违例项）。

## Project Structure

### Documentation (this feature)

```text
specs/001-weapons-directory-scanner/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── tauri-commands.md
│   └── weapon-api.md
└── tasks.md
```

### Source Code (repository root)

```text
src-tauri/
└── src/
    ├── lib.rs                 # 注册 Tauri commands
    └── weapons.rs             # 扫描 + XML 解析（需修复 attribute 映射）

src/
└── app/
    ├── core/services/
    │   └── settings.service.ts
    ├── shared/models/
    │   └── weapons.models.ts
    └── features/data/
        ├── data-layout/...
        ├── local/...
        └── weapons/
            ├── services/weapon.service.ts
            ├── weapon-columns.ts
            ├── weapons.component.ts
            ├── weapons.component.html
            └── weapons.component.scss
```

**Structure Decision**: 单仓库桌面应用（Angular 前端 + Tauri Rust 后端），功能以“前端 feature + Rust module + Tauri command”配套落地。

## Complexity Tracking

无（本特性不引入新的工程边界/复杂抽象；核心风险集中在 XML attribute 映射与 template 合并规则）。 
