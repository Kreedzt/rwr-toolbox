# Feature Specification: 多目录扫描支持 (Multiple Directory Scan Support)

**Feature Branch**: `001-multi-directory-support`
**Created**: 2026-01-15
**Status**: Draft
**Input**: User description: "需求新增, 思考我们现有结构是只能设置一个游戏目录, 实际上我们创意工坊的目录与游戏本体目录不同级. 我们思考在设置中允许用户添加多个扫描目录, 我们检测到目录内有 media 子目录就视为验证通过. 然后左侧路由菜单压缩, 简化为只有"数据", 点击直接展示我们现在的本地数据页面内容, 其他路由菜单可以移除"

## Clarifications

### Session 2026-01-15

- Q: Should we remove the original single game path setting from settings UI since scan directories replace it? → A: Yes, remove the original gamePath setting entirely (migration: existing single path should be converted to first scan directory)
- Q: Should the left sidebar navigation only show "数据" (Data) menu item without sub-menus? → A: Yes, simplify to single "数据" menu item, remove local_data/extract/workshop sub-menu items
- Q: Should the /data route directly render weapons/items tabs instead of redirecting to /data/local? → A: Yes, render weapons/items tabs directly at /data route for streamlined UX
- Q: Do you want to restore the Dashboard, Servers, and Players menu items to the sidebar alongside the new Data menu item? → A: Option [A] - Restore original menu items (Dashboard, Servers, Players) to the sidebar alongside Data.
- Q: How should we handle the "Source" column and filter in the Data pages? → A: Option [A] - Completely remove source labeling and filtering from the Data pages.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 多目录管理 (Multiple Directory Management) (Priority: P1)

用户可以添加多个游戏/创意工坊目录到系统中。每个目录都会被单独扫描以获取游戏数据（武器、物品等）。用户可以从设置页面添加、查看和删除已配置的目录。

**Why this priority**: 这是核心功能，解决了当前只能设置一个目录的限制。创意工坊目录与游戏本体目录不同级，需要支持多个独立的扫描源。完成此功能后，用户可以同时扫描游戏本体和多个创意工坊模组的数据。

**Independent Test**: 可通过以下方式独立测试：在设置页面添加多个包含 `media` 子目录的路径，验证每个路径都被正确保存和显示，可以删除不需要的路径。

**Acceptance Scenarios**:

1. **Given** 用户在设置页面，**When** 用户点击"添加目录"按钮并选择一个包含 `media` 子目录的有效路径，**Then** 该路径被添加到目录列表并显示在UI上
2. **Given** 用户已添加多个目录，**When** 用户查看目录列表，**Then** 所有已添加的目录都显示在列表中，每个目录显示路径和状态
3. **Given** 用户已添加多个目录，**When** 用户点击某个目录的"删除"按钮，**Then** 该目录从列表中移除，且不再被扫描
4. **Given** 用户试图添加一个不包含 `media` 子目录的路径，**When** 用户选择该路径，**Then** 系统显示验证错误，路径不会被添加
5. **Given** 用户已删除所有目录，**When** 用户访问数据页面，**Then** 系统显示提示信息要求用户先配置至少一个扫描目录

---

### User Story 2 - 目录验证 (Directory Validation) (Priority: P2)

系统自动验证用户添加的目录是否为有效的游戏或创意工坊目录。验证标准是目录中是否存在 `media` 子目录。只有通过验证的目录才会被添加到扫描列表中。

**Why this priority**: 目录验证确保用户不会添加无效的路径，避免扫描失败或错误数据。这是用户体验的重要保障，但优先级低于核心的多目录管理功能。

**Independent Test**: 可通过以下方式独立测试：尝试添加各种目录（包含/不包含 `media` 子目录），验证只有包含 `media` 的目录才能成功添加。

**Acceptance Scenarios**:

1. **Given** 用户选择一个包含 `media` 子目录的路径，**When** 用户确认添加，**Then** 目录通过验证并被添加到列表
2. **Given** 用户选择一个不包含 `media` 子目录的路径，**When** 用户确认添加，**Then** 系统显示"目录无效"错误消息，解释需要包含 `media` 子目录
3. **Given** 用户选择一个不存在的路径，**When** 用户确认添加，**Then** 系统显示"路径不存在"错误消息
4. **Given** 用户选择一个没有读取权限的路径，**When** 用户确认添加，**Then** 系统显示"无访问权限"错误消息
5. **Given** 用户尝试添加一个已存在的路径，**When** 用户确认添加，**Then** 系统显示"目录已存在"提示

---

### User Story 3 - 导航菜单优化 (Navigation Menu Optimization) (Priority: P3)

左侧导航菜单被优化，包含核心功能。点击"数据"菜单项直接显示本地数据页面内容（即当前的 weapons/items 表格页面）。保留原有的主要菜单项（Dashboard、Servers、Players），并将它们与新的"数据"项并列显示。移除一些次要或冗余的子菜单项。

**Why this priority**: 这是UI优化，提供了更好的导航平衡。用户既能访问新的合并数据视图，也能使用原有的核心功能。

**Independent Test**: 可通过以下方式独立测试：启动应用后验证左侧导航显示 Dashboard、Servers、Players、数据 和 设置。

**Acceptance Scenarios**:

1. **Given** 用户启动应用，**When** 用户查看左侧导航栏，**Then** 显示 Dashboard、Servers、Players、数据 和 设置
2. **Given** 用户点击"数据"菜单项，**Then** 页面显示本地数据内容（Weapons/Items 标签页）
3. **Given** 原有其他核心功能，**When** 用户通过导航访问，**Then** 仍能正常进入对应页面

---

### Edge Cases

- 当用户添加的目录路径包含特殊字符或非常长的路径名时，UI应正确显示（截断或换行）
- 当用户添加的目录在外部被删除或移动时，系统应检测并标记为"无效"状态
- 当所有目录都被删除时，数据页面应显示友好的提示信息
- 当用户添加大量目录（如10个以上）时，目录列表应支持滚动或分页显示
- 当扫描过程中某个目录变得不可访问时，应记录错误但不影响其他目录的扫描

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统必须支持用户添加多个扫描目录（不限制数量上限）
- **FR-002**: 系统必须验证每个目录是否包含 `media` 子目录作为有效性检查
- **FR-003**: 系统必须在设置页面提供目录管理界面，包括添加、查看、删除目录的功能
- **FR-004**: 系统必须持久化保存用户配置的所有目录路径
- **FR-005**: 系统必须扫描所有已配置目录并将合并后的结果显示在数据页面
- **FR-006**: 系统在数据页面不显示数据的来源目录（根据用户反馈，移除来源列和过滤）
- **FR-007**: 系统必须在目录验证失败时显示具体的错误原因（路径不存在、无权限、缺少media子目录等）
- **FR-008**: 系统必须防止重复添加相同的目录路径
- **FR-009**: 系统必须在左侧导航栏包含 Dashboard、Servers、Players 和 "数据" 菜单项
- **FR-010**: 系统必须在点击"数据"菜单项时直接显示本地数据页面内容
- **FR-011**: 系统必须确保恢复的菜单项功能正常工作
- **FR-012**: 系统必须在没有配置任何目录时显示提示信息引导用户配置

### Key Entities

- **扫描目录 (Scan Directory)**: 用户配置的文件系统路径，包含游戏或创意工坊数据
  - `路径`: 目录的完整文件系统路径
  - `状态`: 验证状态（有效/无效/待验证）
  - `类型`: 目录类型（游戏本体/创意工坊/其他，可选）
  - `添加时间`: 用户添加该目录的时间戳
  - `最后扫描时间`: 上次成功扫描该目录的时间

- **扫描结果数据 (Scan Result Data)**: 从目录中扫描得到的游戏数据
  - `数据项`: 武器、物品等游戏实体
  - `来源目录`: 数据所属的扫描目录路径
  - `扫描时间`: 数据扫描的时间戳

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户可以在 2 分钟内完成添加 3 个扫描目录的操作
- **SC-002**: 目录验证在 1 秒内完成并返回结果
- **SC-003**: 支持至少 10 个扫描目录同时配置
- **SC-004**: 左侧导航栏显示核心菜单项（Dashboard, Servers, Players, 数据, 设置）
- **SC-005**: 用户添加目录的成功率达到 90% 以上（对于包含 media 子目录的有效目录）
- **SC-006**: 目录列表显示加载时间小于 500 毫秒
- **SC-007**: 数据页面能够正确显示来自多个目录的合并数据
- **SC-008**: 系统能够正确处理和合并来自不同目录的武器/物品数据

### User Experience Goals

- **SC-009**: 95% 的首次用户能够在无帮助的情况下成功添加第一个扫描目录
- **SC-010**: 目录验证错误消息清晰易懂，用户能够理解并采取正确行动
- **SC-011**: 简化后的导航减少用户认知负担，用户能更快找到数据页面

## Assumptions

- 用户具有基本的文件系统导航能力（能够使用文件选择对话框）
- 游戏和创意工坊目录遵循标准的目录结构（包含 media 子目录）
- 用户知道他们想要扫描哪些目录
- 系统对目录路径的长度没有硬性限制（使用现代文件系统的路径长度限制）
- 目录权限问题由操作系统层面处理，系统只负责检测和提示
- 现有的数据扫描功能（weapons/items）可以无缝扩展支持多目录扫描
- 移除的导航菜单项对应的功能可能在未来通过其他方式访问，或在需求明确时重新设计

## Out of Scope

以下内容不在本功能范围内：

- 目录的自动发现或智能推荐功能
- 目录扫描的增量更新或实时监听（仍需手动触发扫描）
- 创意工坊模组的安装、启用/禁用功能
- 目录冲突检测（如同一文件在不同目录中的版本差异处理）
- 高级目录管理功能（如目录分组、排序、批量导入导出等）
- 移除的导航菜单项功能的重新设计或重新入口方式
- 跨平台的目录路径处理差异（如 Windows vs Linux 路径格式）

## Dependencies

- 依赖于现有的设置服务 (SettingsService) 来持久化目录配置
- 依赖于现有的扫描功能 (scan_items, scan_weapons) 来扫描多个目录
- 依赖于现有的数据展示组件 (WeaponsComponent, ItemsComponent) 来显示合并后的数据
- 依赖于现有的路由配置 (app.routes.ts) 来修改导航结构
