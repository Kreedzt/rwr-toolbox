# Research: Weapons Directory Scanner（武器目录扫描）

**Feature**: 001-weapons-directory-scanner  
**Date**: 2026-01-15  
**Status**: Updated（补充了“解析无值”的已验证结论与纠偏决策）

---

## 已验证事实：为什么当前 Rust 解析会“没有值”

`.weapon` 文件的关键字段主要写在 **attribute** 上，而不是子节点文本。

例如（来自 `docs-ai/rwr/ak47.weapon`）：

- 根节点 attribute：`<weapon file="base_primary.weapon" key="ak47.weapon">`
- `tag` attribute：`<tag name="assault" />`
- `specification` attribute：`<specification retrigger_time="0.123" magazine_size="30" name="AK47" ... />`
- `stance` attribute（模板里）：`<stance state_key="running" accuracy="0.3" />`
- `projectile/result` attribute：`<result class="hit" kill_probability="0.55" ... />`

因此，Rust 侧若用 `quick_xml::de::from_str` + `serde`，必须用 attribute 映射（例如 `#[serde(rename = "@key")]`），否则字段会落到 `None/0/""`。

---

## Decision 1：Rust XML 解析库

**Decision**：继续使用 `quick-xml`（0.37）+ `serde`

**Rationale**：
- 当前工程已引入 `quick-xml`，且在 hotkeys 功能中已使用（降低引入新技术风险）
- 性能与维护性满足需求（100–200 文件、<3s）

**Alternatives considered**：
- `roxmltree`：DOM 遍历可控但实现量更大（MVP 不需要）

---

## Decision 2：XML 映射策略（修复“解析无值”的关键）

**Decision**：对 `.weapon` 的反序列化结构体统一按 attribute 建模，并对 stance 使用 `<stance state_key="..." accuracy="..."/>` 的形态解析。

**Rationale**：
- 与真实 `.weapon` 样本结构一致（已验证）
- 让“解析无值”变成结构性问题一次性修复，而非在业务逻辑里到处做 fallback

**Implementation Notes（示意）**：

```rust
#[derive(Deserialize)]
struct RawWeapon {
  #[serde(rename = "@key", default)]
  key: Option<String>,
  #[serde(rename = "@file", default)]
  template_file: Option<String>,
  #[serde(rename = "tag", default)]
  tags: Vec<RawTag>,
  #[serde(rename = "specification", default)]
  specification: RawSpecification,
  #[serde(rename = "stance", default)]
  stances: Vec<RawStance>,
  // ...
}

#[derive(Deserialize, Default, Clone)]
struct RawTag {
  #[serde(rename = "@name", default)]
  name: Option<String>,
}

#[derive(Deserialize, Default)]
struct RawSpecification {
  #[serde(rename = "@retrigger_time", default)]
  retrigger_time: Option<f64>,
  #[serde(rename = "@magazine_size", default)]
  magazine_size: Option<f64>,
  #[serde(rename = "@name", default)]
  name: Option<String>,
  // ...
}

#[derive(Deserialize)]
struct RawStance {
  #[serde(rename = "@state_key")]
  state_key: String,
  #[serde(rename = "@accuracy")]
  accuracy: f64,
}
```

---

## Decision 3：Template 继承解析策略

**Decision**：递归 DFS + cycle detection（`HashSet<PathBuf>`）+ 最大深度 `MAX_TEMPLATE_DEPTH=10`。

**Rationale**：
- `.weapon` 的 `file="base_primary.weapon"` 属于典型浅层模板继承
- 需要硬性防环与深度限制，避免坏数据卡死

---

## Decision 4：武器文件发现（packages 扫描）

**Decision**：使用 `walkdir` 扫描 `packages/**` 并过滤扩展名 `.weapon`。

**Rationale**：
- IPC 调用/前端 glob 都不合适；Rust 侧一次性扫描最稳

---

## Decision 5：列显隐设置持久化

**Decision**：使用 `SettingsService` 统一持久化（桌面端优先 Tauri Store 的 `settings.json`，web fallback localStorage）。

**Rationale**：
- 工程现状已在 Servers/Players 等功能上引入统一 settings 持久化口径
- 该设置属于“跨会话偏好”，符合 store 的使用边界

---

## Decision 6：前端状态管理（Angular v20）

**Decision**：Service 内部状态使用 Signals（单一真源），RxJS 仅用于异步流程。

**Rationale**：
- 与守则 Principle IX 一致
- 避免 BehaviorSubject 成为状态容器导致双系统

---

## Decision 7：错误回报与用户可见性

**Decision**：
- Rust Tauri command：`Result<T, String>`（顶层失败直接返回 Err）
- 扫描中的“单文件解析错误”：收集到 `WeaponScanResult.errors` 并继续扫描（符合 FR-005）

---

## Decision 8：800×600 下高级筛选 UI

**Decision**：DaisyUI `collapse` + 内容区 `max-height` + `overflow-y-auto`，避免占用过多垂直空间。

---

## Summary of Technical Choices

| 项目 | 选择 | 关键收益 |
|---|---|---|
| XML 解析 | quick-xml + serde | 现有栈一致、性能足够 |
| 关键修复点 | attribute 映射（`@key/@file/...`）+ stance 节点解析 | 解决“解析无值”的根因 |
| Template 继承 | DFS + cycle detection + depth limit | 简单、可控、抗坏数据 |
| 扫描 | walkdir | 跨平台、实现简单 |
| 前端状态 | Signals（RxJS 管异步） | 符合守则、维护成本低 |
| 持久化 | SettingsService → Tauri Store 优先 | 统一口径、跨会话一致 |

---

## Open Questions

无（已用仓库内 `.weapon` 样本验证了字段结构；剩余工作是按本决策修复实现与补齐 UI/过滤功能）。 
