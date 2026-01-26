# Phase 0 Research: Steam Game Launch With Parameters

**Feature**: `specs/001-steam-launch-args/spec.md`
**Target Game**: Running with Rifles (Steam AppID 270150)

## Context Change

最初设想为“修改 Steam 启动项（Launch Options）持久配置”。但 Steam 官方没有公开 API 供程序直接修改该配置，因此本特性改为：

- 通过 Steam 启动游戏并尽力携带参数
- 提供参数字符串复制作为兜底
- 不修改 Steam Launch Options 持久配置

## Decisions

### Decision: 直接启动的触发方式

- **Chosen**: 通过系统层面触发 Steam 启动请求（由后端发起，使用 opener 打开一个 Steam 启动请求）。
- **Rationale**:
    - 跨平台一致；无需依赖 Steam 的未公开接口。
    - 与“总是启动（尽力带参），不额外提示参数是否生效”的产品口径一致。

### Decision: 复制内容

- **Chosen**: 仅复制参数字符串（例如 `skip_nat_server_usage`），不包含启动命令/链接。
- **Rationale**:
    - 复制内容更稳定，避免不同平台的 Steam 启动方式差异导致误导。
    - 满足“用户自行粘贴到 Steam 启动参数 / 终端 / 快捷方式”的需求。

### Decision: 游戏可用性判断（Q4）

- **Chosen**: 后端做“尽力判断”，若无法判定则以“可用”处理并继续尝试启动；仅在明确不可用时提示“游戏不可用”。
- **Rationale**:
    - 没有官方 API 时，可靠判断库拥有/安装状态很困难。
    - 通过检查本机 Steam 安装目录下是否存在对应 `appmanifest_270150.acf` 可以覆盖“已安装”场景；覆盖不到的情况不阻塞启动。

## Alternatives Considered

- **A: 修改 `localconfig.vdf`/Launch Options**

    - 违反新约束（不修改 Steam Launch Options 持久配置），且易被 Steam 覆盖。

- **B: 使用 Steam Web API**

    - 不满足“动态修改启动参数”的目标；也可能依赖网络与授权。

- **C: 只做复制，不做直接启动**
    - 虽然简单，但缺少“一键启动”的主体验（US1）。

## Risks

- 不同平台/环境下 Steam 启动请求的可用性差异，需要用清晰错误提示兜底。
- “游戏不可用”的判定只能做到 best-effort，不能保证 100% 准确。
