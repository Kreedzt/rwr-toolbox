# Feature Specification: Steam Game Launch With Parameters

**Feature Branch**: `001-steam-launch-args`  
**Created**: 2026-01-26  
**Status**: Draft (updated)  
**Input**: User description: "我们现在需要针对游戏启动项参数做一个配置支持..." + "Steam 官方并无公开 API 允许程序动态修改启动参数, 需求变为支持直接启动游戏(带参数, 使用 steam 命令启动游戏带参数), 或者提供启动参数拼接结果的复制"

## Clarifications

### Session 2026-01-26

- Q: 本期要提供“直接启动”还是“复制拼接结果”？ → A: 两者都支持（直接启动 + 一键复制兜底）
- Q: “复制拼接结果”复制什么内容？ → A: 仅复制参数字符串（不包含启动命令/链接）
- Q: 无法确认参数会生效时怎么办？ → A: 总是启动（尽力带参），不额外提示
- Q: 游戏不在库/未安装时怎么办？ → A: 启动失败并提示“游戏不可用”（仍可用复制参数）
- Q: 新增参数支持范围如何组织？ → A: 支持两类：布尔参数（checkbox 多选）+ 带值参数（key=value 输入项）
- Q: 带值参数 key=value 支持范围？ → A: 支持任意 key=value（自由输入多项）
- Q: 初始版本支持范围是否全量？ → A: 初始版本全量支持（布尔参数清单 + key=value 示例清单），无需分批上线
- Q: 是否需要考虑隐藏参数的可拓展性？ → A: 需要；在官方清单之外，提供自定义参数能力（自定义 token 列表 + 任意 key=value）

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Launch Game With Optional Parameters (Priority: P1)

作为用户，我希望在工具里配置一组启动参数（包含布尔参数勾选 + 带值参数 key=value），然后点击“启动游戏”，让 Running with Rifles（Steam AppID 270150）通过 Steam 启动，并尽力携带对应参数。

**Why this priority**: 这是主流程，直接满足“带参数启动游戏”的目标。

**Independent Test**: 勾选/取消勾选后点击启动，验证用于启动的参数集合包含或不包含该 token，并能触发 Steam 启动游戏。

**Acceptance Scenarios**:

1. **Given** Steam 可用且 Running with Rifles（AppID 270150）在库中，**When** 我勾选 `skip_nat_server_usage` 并点击启动，**Then** 系统触发 Steam 启动该游戏且启动参数包含 `skip_nat_server_usage`。
2. **Given** Steam 可用且 Running with Rifles（AppID 270150）在库中，**When** 我同时勾选多个布尔参数（例如 `debugmode` + `verbose`）并点击启动，**Then** 启动参数字符串包含这些 token。
3. **Given** Steam 可用且 Running with Rifles（AppID 270150）在库中，**When** 我配置带值参数（例如 `map=media/packages/vanilla/maps/map3`）并点击启动，**Then** 启动参数字符串包含该 `key=value` 项。
4. **Given** Steam 可用且 Running with Rifles（AppID 270150）在库中，**When** 我取消勾选并点击启动，**Then** 系统触发 Steam 启动该游戏且启动参数不包含 `skip_nat_server_usage`。

---

### User Story 2 - Copy Parameter String (Priority: P2)

作为用户，我希望可以一键复制“当前配置对应的参数字符串”（包含布尔 token 与 key=value 项），以便我自行粘贴到终端、Steam 启动参数、快捷方式或其他地方使用。

**Why this priority**: 复制是低风险兜底能力，可覆盖“直接启动受限/失败/不符合预期”的场景。

**Independent Test**: 在任意勾选状态下点击复制，验证剪贴板内容仅包含参数字符串，且与当前设置一致。

**Acceptance Scenarios**:

1. **Given** 我已勾选 `skip_nat_server_usage`，**When** 我点击复制，**Then** 剪贴板内容为参数字符串且包含 `skip_nat_server_usage`。
2. **Given** 我配置了带值参数（例如 `map=media/packages/vanilla/maps/map3`），**When** 我点击复制，**Then** 剪贴板内容包含对应的 `key=value` 项。
3. **Given** 我未启用任何布尔参数且未配置任何带值参数，**When** 我点击复制，**Then** 剪贴板内容为空字符串（或仅包含空白可忽略）。

---

### User Story 3 - Basic Failure Handling (Priority: P3)

作为用户，当 Steam 不可用、游戏不可用（不在库/未安装）或启动操作无法触发时，我希望看到基本的失败提示（不需要诊断“参数是否实际生效”），避免我以为工具已经启动成功。

**Why this priority**: 该功能依赖外部环境；至少要区分“启动请求已触发”与“启动请求无法触发”。

**Independent Test**: 构造 Steam 不可用/游戏缺失/系统阻止调用等情况，验证提示存在且不导致重复/异常状态。

**Acceptance Scenarios**:

1. **Given** Steam 不可用或无法被系统调用，**When** 我点击启动，**Then** 我看到清晰的失败提示。
2. **Given** Running with Rifles（AppID 270150）不在库中或不可用，**When** 我点击启动，**Then** 我看到“游戏不可用”的失败提示；**And** 我仍然可以使用“复制参数字符串”完成后续手动操作。

---

### Edge Cases

- Steam 未安装或无法访问。
- Running with Rifles（AppID 270150）不在 Steam 库中。
- 系统环境限制导致无法从应用触发 Steam 启动（例如权限/策略限制）。
- 用户快速重复点击启动/复制。
- 带值参数的 value 包含空格/特殊字符时的拼接与可用性。
- 用户输入同一 key 多次（应以最后一次输入为准）。
- 用户只输入了 `server_address` 未输入 `server_port`（仍应允许启动，但参数字符串需保持用户输入的可预期性）。
- 用户输入了空 key、包含空格的 key、或包含换行的 value（应拒绝该项或在拼接时忽略，并保持其余参数可用）。

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 系统 MUST 支持两类启动参数配置（初始版本全量支持下列清单）：
    - 布尔参数：以 checkbox 多选方式启用/禁用，包含 `skip_nat_server_usage`, `debugmode`, `no_simulation`, `no_ai`, `metagame_debugmode`, `verbose`, `opengl`, `flip`, `big_water`。
    - 带值参数：以 key=value 的输入项配置，支持任意 key=value（自由输入多项），并内置示例/快捷项覆盖 `map=...`, `package=...`, `server_address=...`, `server_port=...`。
- **FR-002**: 系统 MUST 提供“启动游戏”操作，用于通过 Steam 启动 Running with Rifles（AppID 270150），并携带当前勾选所对应的参数集合。
- **FR-003**: 系统 MUST 提供“一键复制”操作，将当前勾选状态对应的“参数字符串”复制到剪贴板；复制内容 MUST NOT 包含启动命令/链接等其他文本。
- **FR-004**: 系统 MUST 保证参数拼接行为一致：
    - 布尔参数启用时包含对应 token，禁用时不包含
    - 带值参数以 `key=value` 形式输出（支持多个 key）
    - 拼接结果不应出现重复 token；带值参数同一 key 只保留一个值（以用户最后输入为准）
    - `key` 不能为空且不得包含空白字符；`value` 不得包含换行
- **FR-005**: 系统 MUST 将目标游戏固定为 Running with Rifles（Steam AppID 270150），用户不可选择其他游戏。
- **FR-006**: 系统 MUST 尽力触发 Steam 启动并携带参数；若启动请求无法触发或目标游戏不可用，系统 MUST 给出失败提示。
- **FR-007**: 系统 MUST NOT 修改 Steam 中的“游戏启动项（Launch Options）”持久配置（不写入 Steam 配置文件，不覆盖用户设置）。

### Key Entities _(include if feature involves data)_

- **Steam Game**: Running with Rifles（Steam AppID 270150）。
- **Launch Parameter Toggle**: `skip_nat_server_usage` 的启用状态（用户设置）。
- **Launch Payload**: 当前启用的 token 集合拼接出的“参数字符串”（仅参数，不含启动命令/链接）。

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 用户从打开设置页到点击启动游戏，完成配置并触发启动的操作时间 ≤ 30 秒。
- **SC-002**: “复制参数字符串”在 1 秒内完成，并且复制内容与当前勾选状态一致（抽测一致率 100%）。
- **SC-003**: 应用不会向用户声明或暗示“参数已实际生效”（仅保证发起启动请求）。
- **SC-004**: 功能上线后不产生因“覆盖/修改 Steam 启动项持久配置”导致的用户设置丢失问题（QA/回归为 0）。

## Assumptions

- 用户已安装 Steam，并在库中拥有 Running with Rifles（AppID 270150）。
- 应用在部分环境下可能无法直接触发 Steam 启动，因此提供复制作为兜底。
- 本期仅支持单一参数 `skip_nat_server_usage`，但设计允许未来扩展更多参数。

## Out of Scope

- 修改 Steam 的 per-game Launch Options 持久配置。
- 读取/解析 Steam 配置文件以同步 Steam 内已有的 Launch Options。
- 支持非 Steam 启动器。
