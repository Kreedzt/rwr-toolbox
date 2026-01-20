# Frontend Contract（前端协议/接口约定）

**Feature**: 001-weapons-directory-scanner  
**Frontend**: Angular 20.3.15 / TypeScript 5.8.3  
**强制约束**：Signals 管状态、RxJS 管异步；模板使用 `@if/@for`；组件输入输出使用 `input()/output()`；所有文本 i18n（Transloco）。

---

## Service：`WeaponService`

**职责**：管理武器扫描结果、搜索/筛选状态、列显隐状态，并通过 Tauri commands 调用 Rust。

**位置**：`src/app/features/data/weapons/services/weapon.service.ts`

### 公开状态（Signals）

- `weapons`: `ReadonlySignal<Weapon[]>`（原始扫描结果）
- `filteredWeapons`: `ReadonlySignal<Weapon[]>`（搜索/筛选后的结果）
- `loading`: `ReadonlySignal<boolean>`
- `error`: `ReadonlySignal<string | null>`
- `visibleColumns`: `ReadonlySignal<ColumnVisibility[]>`（持久化到 `SettingsService`）

### 关键行为（方法）

- `scanWeapons(gamePath: string): Promise<void>`：调用 `scan_weapons`，写入 `weapons`、清空/更新 `error`
- `setSearchTerm(term: string): void`
- `setAdvancedFilters(filters: AdvancedFilters): void`
- `setColumnVisibility(cols: ColumnVisibility[]): Promise<void>`：写入 settings 并更新 signal

---

## Component：`WeaponsComponent`

**职责**：渲染武器表格 + 搜索/高级筛选面板 + 列显隐菜单 + 扫描/刷新按钮。

**位置**：`src/app/features/data/weapons/weapons.component.ts`

**要点**：
- 只消费 `WeaponService` 的 readonly signals
- 模板控制流：`@if/@for`
- 800×600：表格区域可滚动，次要列可隐藏

---

## Component：`WeaponFiltersComponent`（高级筛选面板）

**职责**：维护筛选表单 UI，并向上抛出 `filtersChange`。

**输入/输出（Angular v20）**：
- `filters = input<AdvancedFilters>({})`
- `filtersChange = output<AdvancedFilters>()`

> 注意：禁止 `@Input/@Output` 旧写法。

---

## Types（关键类型）

### `AdvancedFilters`

```ts
export interface AdvancedFilters {
  // Range filters
  damage?: { min: number; max: number };
  fireRate?: { min: number; max: number };
  magazineSize?: { min: number; max: number };
  encumbrance?: { min: number; max: number };
  price?: { min: number; max: number };

  // Stance accuracy ranges
  stanceAccuracies?: Record<string, { min: number; max: number }>;

  // Exact match
  classTag?: string;
  suppressed?: boolean;
  canRespawnWith?: boolean;
}
```

### `ColumnVisibility`

```ts
export interface ColumnVisibility {
  columnId: string;
  visible: boolean;
  order?: number;
}
```

---

## i18n（约定）

新增/维护键建议集中在：
- `weapons.*`：表格/筛选/错误/按钮
- `settings.*`：游戏目录路径配置文案

所有 placeholder / tooltip / toast 文案都必须走 Transloco key（禁止硬编码）。 
