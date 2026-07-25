# Portable Agent Stack

[English](README.md)

一套可嵌入任意 Git 项目的跨 Agent 工程栈，让 Codex、Devin 以及支持 Agent Skills 的其他工具复用同一套任务流程、项目记忆、知识沉淀和质量门禁。

它不是又一个接管全部流程的框架，而是明确划分职责：

```text
Git 仓库
├── Trellis              任务、规范与项目记忆
├── CodeGraph            代码关系、调用链与影响分析
├── Agent Skills         工程方法与专项验证
├── Headroom             可选的上下文压缩和本地个人偏好
└── 构建/测试工具         最终正确性
```

仓库内置三个原创、跨平台 Skill：

- `browser-acceptance`
- `security-audit`
- `release-doc-sync`

没有 gstack 也能独立运行；`full` profile 可以允许它们在宿主支持时委托给对应的 gstack 深度能力。

## 核心特点

- **跨平台复用：** 项目状态进入 Git，而不是只存在某个会话或本地记忆库。
- **默认安全：** `init` 只写项目文件；安装全局工具必须单独运行命令并显式传入 `--yes`。
- **按需启用：** 通过 profile 控制治理复杂度。
- **更新不覆盖定制：** 已修改的受管文件会被保留，新版本写入 `.pas-new`。
- **开放标准：** Skill 使用通用 `SKILL.md` 格式，详细清单放在 `references/`，减少激活后的上下文负担。
- **不复制第三方源码：** Trellis、CodeGraph、Headroom、Matt Pocock skills 和 gstack 保持独立许可证与更新周期。

## 环境要求

- Git
- Node.js 18+

可选上游工具还可能需要 npm、Python、`uv` 以及对应 Agent CLI。

## 安装

### 方式 A — 从 GitHub 克隆（无需全局安装）

```bash
git clone https://github.com/Zim9729/portable-agent-stack.git ~/.local/share/portable-agent-stack
```

然后通过 node 运行：

```bash
cd /path/to/your-project
node ~/.local/share/portable-agent-stack/bin/pas.mjs init --profile standard --agents codex,devin
```

或使用平台对应的安装脚本：

```bash
# Linux / macOS
~/.local/share/portable-agent-stack/install.sh --profile standard --agents codex,devin

# Windows PowerShell
powershell -ExecutionPolicy Bypass -File "$HOME/.local/share/portable-agent-stack/install.ps1" --profile standard --agents codex,devin
```

### 方式 B — 从 npm 安装

```bash
npm install -g portable-agent-stack
```

全局安装后，`pas` 命令可在任意目录使用：

```bash
cd /path/to/your-project
pas init --profile standard --agents codex,devin
```

也可以用 `npx` 免全局安装直接运行：

```bash
cd /path/to/your-project
npx portable-agent-stack init --profile standard --agents codex,devin
```

### 第一步 — 初始化项目文件

`init` 只写项目内文件（`.agent-stack/`、`.agents/skills/`、`AGENTS.md` 等），**不会**安装任何全局软件。

```bash
pas init --profile standard --agents codex,devin
```

| 选项 | 说明 | 默认值 |
|---|---|---|
| `--profile <name>` | `minimal` / `standard` / `web` / `full` | `standard` |
| `--agents <list>` | 逗号分隔的 Agent 名称 | `codex,devin` |
| `--target <path>` | 目标 Git 仓库路径 | 当前目录 |
| `--force` | 覆盖冲突的受管文件 | 关闭 |
| `--dry-run` | 只打印变更，不实际写入 | 关闭 |

### 第二步 — 安装上游依赖（可选）

安装并配置可选上游工具：

```bash
pas tools install --yes --agents codex,devin --with-matt
```

`--yes` 是必须的，表示你确认要执行全局安装。执行前请阅读 [THIRD_PARTY.md](THIRD_PARTY.md)，尤其是 Trellis 的 AGPL-3.0 许可证。

#### 安装的工具

| 工具 | 职责 | 安装方式 | 前置条件 |
|---|---|---|---|
| [Trellis](https://github.com/mindfold-ai/Trellis) | 任务流程、规范与项目记忆 | `npm install -g @mindfoldhq/trellis@latest` + `trellis init` | npm |
| [CodeGraph](https://github.com/colbymchenry/codegraph) | 代码关系、调用链与影响分析 | `npm install -g @colbymchenry/codegraph` + `codegraph install` + `codegraph init` | npm |
| [Headroom](https://github.com/headroomlabs-ai/headroom) | 上下文与工具输出压缩 | `uv tool install --python 3.13 "headroom-ai[all]"` | [uv](https://docs.astral.sh/uv/)（Python） |
| [Matt Pocock skills](https://github.com/mattpocock/skills) | 工程方法与可复用技能 | `npx skills@latest add mattpocock/skills` | npx（随 npm 自带） |

#### 前置条件

- **Git** 和 **Node.js 18+** 是 `pas` 本身的必需条件。
- **npm** 用于安装 Trellis 和 CodeGraph（随 Node.js 自带）。
- **[uv](https://docs.astral.sh/uv/)** 用于安装 Headroom，需单独安装：
  ```bash
  # Linux / macOS
  curl -LsSf https://astral.sh/uv/install.sh | sh

  # Windows PowerShell
  powershell -ExecutionPolicy Bypass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```
  如果未安装 `uv`，Headroom 会被跳过并给出警告，其他工具仍正常安装。
- **npx** 用于安装 Matt Pocock skills（随 npm 自带）。需添加 `--with-matt` 参数启用。

#### 选项

| 选项 | 说明 |
|---|---|
| `--yes` | 必须的确认参数，表示同意执行全局安装 |
| `--agents <list>` | 逗号分隔的 Agent 名称（默认：`codex,devin`） |
| `--with-matt` | 额外安装 Matt Pocock skills |
| `--skip <list>` | 跳过指定工具：`trellis,codegraph,headroom,matt` |
| `--user <name>` | Trellis init 使用的 Git 用户名（默认：`git config user.name`） |
| `--dry-run` | 只打印命令，不实际执行 |

#### 示例

```bash
# 安装全部依赖
pas tools install --yes --agents codex,devin --with-matt

# 跳过 Headroom 和 Matt skills
pas tools install --yes --agents codex,devin --skip headroom,matt

# 预览将执行的安装操作
pas tools install --yes --agents codex,devin --with-matt --dry-run
```

#### 验证安装

```bash
pas doctor
```

加 `--strict` 可将缺失的可选工具也标记为失败：

```bash
pas doctor --strict
```

## Profile

| Profile | 补充 Skills | 适用场景 |
|---|---|---|
| `minimal` | 无 | 已有成熟流程，只需要共享契约和记忆骨架 |
| `standard` | 安全审计、发布文档同步 | 通用后端、服务、库和 CLI 项目 |
| `web` | 浏览器验收、安全审计、发布文档同步 | Web 产品和用户界面项目 |
| `full` | 三个全部启用、丰富证据、可选 gstack 委托 | 成熟的多 Agent 交付流程 |

默认是 `standard`。详见 [docs/profiles.md](docs/profiles.md)。

## CLI

```text
pas init          安装项目内文件
pas update        安全更新受管文件
pas doctor        检查项目配置
pas tools install 显式安装和配置可选上游工具
pas profiles      列出 profile
pas version       显示版本
```

常用示例：

```bash
pas init --profile web --agents codex,devin
pas update --profile full --prune
pas doctor
pas doctor --strict
```

## 会写入项目的文件

```text
.agent-stack/
├── config.yml
├── config.example.yml
└── manifest.json
.agents/skills/
├── browser-acceptance/      # 按 profile 安装
├── security-audit/          # 按 profile 安装
└── release-doc-sync/        # 按 profile 安装
AGENTS.md                    # 只管理标记区块，保留原内容
CONTEXT.md                   # 不存在时才创建
docs/adr/README.md           # 不存在时才创建
docs/agents/STACK.md
.gitignore                   # 只管理标记区块，保留原内容
```

## 推荐组合

每一层只设一个责任所有者：

| 层级 | 推荐工具 |
|---|---|
| 任务流程和仓库记忆 | Trellis |
| 代码图和影响分析 | CodeGraph |
| 工程方法 | 精选 Matt Pocock skills |
| 上下文压缩 | Headroom |
| 深度 QA、安全、文档后端 | 可选 gstack |

建议使用的 Matt skills：`domain-modeling`、`research`、`prototype`、`tdd`、`diagnosing-bugs`、`codebase-design`、`improve-codebase-architecture`、`code-review`、`resolving-merge-conflicts`。Trellis 已经管理任务生命周期时，不要再启用第二套默认任务流程。

## 日常流程

1. 恢复当前 Trellis 任务，只读取相关 Spec、领域词汇和 ADR。
2. 结构性代码问题优先使用 CodeGraph。
3. 只激活当前步骤所需的最小 Skill。
4. 运行构建、类型检查、lint、测试和确定性扫描器。
5. 按变更类型执行补充门禁：
   - 用户可见 Web 变更：浏览器验收
   - 安全敏感变更：安全审计
   - 公共 API、CLI、配置或发布变更：文档同步
6. 将证据存入任务，并只把稳定知识提升为长期记忆。

详见 [docs/architecture.md](docs/architecture.md) 和 [docs/integrations.md](docs/integrations.md)。

## 更新

先更新本仓库，再更新目标项目：

```bash
git -C ~/.local/share/portable-agent-stack pull
cd /path/to/project
node ~/.local/share/portable-agent-stack/bin/pas.mjs update
```

若受管文件已经被项目定制，更新器会保留原文件，并在旁边生成 `FILE.pas-new` 供人工合并。

## 开发与发布

```bash
npm run check
npm run pack:check
```

贡献说明见 [CONTRIBUTING.md](CONTRIBUTING.md)，上传 GitHub 前的准备见 [docs/publishing.md](docs/publishing.md)。

## 许可证

本仓库采用 MIT。第三方集成采用各自许可证，详见 [THIRD_PARTY.md](THIRD_PARTY.md)。
