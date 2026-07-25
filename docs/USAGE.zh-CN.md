# Portable Agent Stack 实际使用指南

## 1. 整体架构

这套方案的核心原则是：

```text
Trellis 管任务与项目记忆
CodeGraph 管代码事实
Matt Skills 管工程方法
自定义 Skills 管专项验收
Headroom 管上下文压缩
Git 管跨 Agent 共享
测试、Lint、编译器管最终正确性
```

建议的项目结构：

```text
project/
├── AGENTS.md
├── CONTEXT.md
├── .agent-stack/
│   ├── config.yml
│   └── manifest.json
├── .agents/
│   └── skills/
│       ├── security-audit/
│       ├── release-doc-sync/
│       ├── browser-acceptance/      # web/full profile
│       └── Matt Skills...
├── .trellis/
│   ├── spec/
│   ├── tasks/
│   └── workspace/
├── .codegraph/
├── docs/
│   ├── adr/
│   └── agents/
└── source-code/
```

其中：

* `.trellis/` 是项目任务、规范和过程记忆。
* `.codegraph/` 是可重建的代码关系索引。
* `.agents/skills/` 是 Codex、Devin 和其他兼容 Agent 共享的能力。
* `CONTEXT.md` 保存领域术语。
* `docs/adr/` 保存重要架构决策。
* `AGENTS.md` 保存所有 Agent 必须遵守的项目规则。

---

# 2. 每个工具的职责

## Portable Agent Stack

Portable Agent Stack，简称 PAS，是安装和集成层。

它负责：

* 初始化项目目录；
* 安装不同 profile；
* 放入共享 Skills；
* 管理 `AGENTS.md` 受管区块；
* 检查 Trellis、CodeGraph、Headroom 是否存在；
* 提供统一的项目模板。

它不负责：

* 决定具体功能怎么实现；
* 保存代码调用关系；
* 替代测试和编译器；
* 自动保证所有第三方工具都成功连接。

常用命令：

```powershell
pas version
pas profiles
pas init --profile standard --agents codex,devin
pas doctor
pas doctor --strict
```

---

## Trellis

Trellis 是唯一的任务和项目状态管理层。

它负责：

* 记录任务目标；
* 保存验收标准；
* 保存技术计划；
* 记录当前进度；
* 记录失败尝试；
* 保存验证证据；
* 支持 Codex 与 Devin 接力；
* 将稳定经验提升为项目规范。

适合保存：

```text
为什么要做
要做到什么程度
当前做到哪里
哪些测试已经通过
还剩什么风险
下一步是什么
```

不适合保存：

* 自动生成的完整调用图；
* 大量原始测试日志；
* 用户个人跨项目偏好；
* 可由工具重新生成的缓存。

推荐的信息分层：

| 信息类型      | 保存位置                  |
| --------- | --------------------- |
| 项目长期规则    | `.trellis/spec/`      |
| 当前任务状态    | `.trellis/tasks/`     |
| 临时调查和失败尝试 | `.trellis/workspace/` |
| 验收和测试证据   | 当前任务的 evidence 目录     |
| 领域词汇      | `CONTEXT.md`          |
| 架构决策      | `docs/adr/`           |

---

## CodeGraph

CodeGraph 是代码事实层。

它负责回答：

* 这个函数在哪里？
* 谁调用了它？
* 它又调用了谁？
* 一个请求如何从入口到达数据库？
* 修改某个接口会影响哪些模块？
* 哪些测试可能受到影响？
* 某个模块的上下游依赖是什么？

典型命令：

```powershell
codegraph init
codegraph status
codegraph explore "Describe the main entry points"
codegraph impact AuthService.Validate
```

在 Agent 中推荐这样提问：

```text
使用 CodeGraph 分析当前需求涉及的入口、调用链、
依赖关系和修改影响。不要先进行全仓库 grep。
```

CodeGraph 不负责：

* 任务状态；
* 需求澄清；
* 安全重命名；
* 测试正确性；
* 项目长期记忆。

`.codegraph/` 通常属于可重建缓存，可以不提交 Git。

---

## Matt Pocock Skills

Matt Skills 是工程方法层。

最终推荐使用：

```text
setup-matt-pocock-skills
grill-with-docs
prototype
diagnosing-bugs
research
tdd
domain-modeling
codebase-design
improve-codebase-architecture
code-review
resolving-merge-conflicts
```

### `setup-matt-pocock-skills`

每个项目首次使用时运行一次。

作用：

* 确认项目文档位置；
* 确认领域文档；
* 配置其他 Matt Skills 的共享约定。

在本架构中要明确：

```text
Trellis 是任务、规格和进度的唯一所有者。
Matt Skills 只负责工程方法。
```

### `grill-with-docs`

适用于：

* 需求描述模糊；
* 业务术语不统一；
* 对目标和边界理解不一致；
* 需要深入追问需求。

输出应进入：

* Trellis 当前任务；
* `CONTEXT.md`；
* 必要时进入 ADR。

### `prototype`

适用于：

* 技术方案不确定；
* UI 或 API 形态需要快速验证；
* 不确定某个第三方库是否可行；
* 需要一次性实验。

原型应被视为验证工具，而不是直接当成生产实现。

### `diagnosing-bugs`

适用于所有未知根因的问题：

```text
复现
→ 缩小问题
→ 提出假设
→ 加入观察手段
→ 验证假设
→ 修复
→ 添加回归测试
```

不要在未复现问题前直接开始随机修改。

### `research`

适用于：

* 查询官方文档；
* 调研技术选型；
* 比较第三方方案；
* 分析标准、协议和框架能力。

稳定研究结果应写入 `docs/`，并保留来源。

### `tdd`

适用于：

* 新功能；
* Bug 修复；
* 可通过自动测试描述的行为变化。

基本流程：

```text
写失败测试
→ 确认测试因正确原因失败
→ 编写最小实现
→ 测试通过
→ 重构
```

### `domain-modeling`

适用于：

* 出现新的业务概念；
* 领域术语混乱；
* 不同模块对同一个概念命名不一致；
* 需要明确聚合、实体、值对象或领域边界。

它主要维护：

```text
CONTEXT.md
docs/adr/
```

不要把临时实现细节写进 `CONTEXT.md`。

### `codebase-design`

适用于：

* 新模块设计；
* API 边界设计；
* 重构模块接口；
* 消除过度耦合；
* 提高模块内部能力、缩小公开接口。

### `improve-codebase-architecture`

适用于：

* 项目模块过碎；
* 大量浅层包装；
* 依赖关系混乱；
* 同一概念分散在多个位置；
* 需要可视化当前架构问题。

CodeGraph 提供真实代码关系，Matt Skill 负责提出设计改进。

### `code-review`

在实现完成后运行。

它需要分别检查：

1. 是否符合项目规范；
2. 是否真正满足当前 Trellis 任务；
3. 是否存在不必要复杂度；
4. 是否遗漏测试和错误路径；
5. 是否出现新的耦合或架构退化。

### `resolving-merge-conflicts`

适用于 Codex 和 Devin 并行工作后出现冲突。

不要简单选择 ours 或 theirs，而要：

* 理解两边修改目的；
* 保留两边仍然有效的行为；
* 重新运行测试；
* 更新 Trellis 任务状态。

---

## 自定义 Skills

## `browser-acceptance`

用于真实浏览器验收。

适合：

* Web 页面；
* 登录；
* 表单；
* 上传；
* 导航；
* 权限流程；
* 端到端用户路径。

它负责：

* 按 Trellis 验收标准执行；
* 操作真实浏览器；
* 收集截图；
* 检查 Console 错误；
* 检查失败网络请求；
* 输出 PASS、FAIL、BLOCKED 或 PARTIAL；
* 将证据写回 Trellis。

它默认不应修改产品代码。

使用示例：

```text
使用 browser-acceptance 验证当前 Trellis 任务。

测试：
1. 管理员可以创建用户；
2. 普通用户不能访问管理页；
3. 提交失败时显示明确错误。

不要修改产品代码。
将截图和报告保存到当前任务 evidence。
```

---

## `security-audit`

用于安全相关变更。

适合：

* 登录和权限；
* 支付；
* 外部输入；
* 文件上传；
* API；
* 数据库迁移；
* 新依赖；
* CI/CD；
* Secrets；
* MCP、Agent 和 LLM 功能。

它负责：

* 使用 CodeGraph 确定入口、信任边界和敏感操作；
* 检查认证和授权；
* 检查注入和输入验证；
* 检查数据泄露；
* 检查依赖和供应链；
* 检查 Prompt Injection 和工具权限；
* 输出严重程度、置信度和证据；
* 给出发布是否应阻止的建议。

使用示例：

```text
使用 security-audit 的 feature 和 ai-mcp 模式检查当前任务。

重点检查：
- 工具调用权限；
- Prompt Injection；
- 敏感数据泄露；
- 用户输入到命令执行的路径；
- 多租户数据隔离。

High 或 Critical 问题阻止发布。
```

---

## `release-doc-sync`

用于发布前文档同步。

适合：

* 新增 API；
* 新增 CLI 参数；
* 修改配置；
* 修改环境变量；
* 改变用户行为；
* 增加安装步骤；
* 增加迁移步骤；
* 正式版本发布。

它负责：

* 比较当前分支与基线分支；
* 找出变化的公共表面；
* 更新 README、CHANGELOG 和正式文档；
* 验证文档中的命令和路径；
* 记录仍未覆盖的文档债务。

默认不得修改：

```text
.trellis/
CONTEXT.md
docs/adr/
```

这些内容分别属于 Trellis 和 `domain-modeling`。

使用示例：

```text
使用 release-doc-sync 的 check 模式检查当前分支。

重点检查：
- README；
- CHANGELOG；
- API 文档；
- 配置参数；
- 环境变量；
- 安装和迁移说明。

不要修改 Trellis、CONTEXT.md 或 ADR。
```

---

## Headroom

Headroom 是上下文压缩层。

它适合处理：

* 测试日志；
* 构建日志；
* 大型 JSON；
* 浏览器输出；
* 数据库结果；
* 重复工具输出；
* 长时间会话。

它不应该保存唯一的：

* 任务状态；
* 架构决策；
* 产品需求；
* 项目规则。

这些内容必须进入 Git。

Codex 推荐通过：

```powershell
headroom wrap codex --code-memory none
```

使用 `--code-memory none` 是因为代码理解已经由 CodeGraph 负责。

Headroom MCP 适合：

* 手动压缩长输出；
* 恢复原始内容；
* 查看压缩统计。

重要原则：

```text
Headroom 可以压缩日志，
但不能删除失败测试名、错误堆栈、文件位置和安全证据。
```

---

# 3. 新项目初始化

## 第一步：进入项目

```powershell
cd "E:\path\to\project"
git init
```

## 第二步：初始化 PAS

普通项目：

```powershell
pas init --profile standard --agents codex,devin
```

Web 项目：

```powershell
pas init --profile web --agents codex,devin
```

完整治理项目：

```powershell
pas init --profile full --agents codex,devin
```

## 第三步：安装第三方工具

```powershell
pas tools install `
  --yes `
  --agents codex,devin `
  --with-matt
```

如果已安装 Trellis 或 Matt Skills，可以跳过：

```powershell
pas tools install `
  --yes `
  --agents codex,devin `
  --skip trellis,matt
```

## 第四步：建立代码索引

```powershell
codegraph init
codegraph status
```

## 第五步：检查安装

```powershell
pas doctor --strict
```

再检查：

```powershell
Get-Command pas,trellis,codegraph,headroom
```

---

# 4. 日常开始工作

每次开始前：

```powershell
git pull
codegraph status
```

Codex 使用：

```powershell
headroom wrap codex --code-memory none
```

进入 Agent 后，建议使用下面的启动提示：

```text
读取 AGENTS.md。

启动或恢复 Trellis 当前任务。
依次读取：
1. 当前任务；
2. 相关项目规范；
3. CONTEXT.md 中相关术语；
4. 相关 ADR。

除非必要，不要一次性加载整个 .trellis 目录。
涉及代码关系时优先使用 CodeGraph。
```

---

# 5. 现实项目中的功能开发流程

假设需要实现：

```text
为 AIops 平台增加告警规则静默功能。
```

## 第一步：建立 Trellis 任务

任务内容应包括：

```text
目标：
允许用户在指定时间范围内静默某条告警规则。

验收标准：
- 用户可以设置静默开始和结束时间；
- 静默期间不发送通知；
- 告警事件仍然保存；
- 静默结束后自动恢复通知；
- 不允许结束时间早于开始时间。

非目标：
- 不支持复杂重复日历；
- 不修改现有告警匹配逻辑。
```

## 第二步：澄清领域概念

使用：

```text
grill-with-docs
domain-modeling
```

需要明确：

* 静默的是规则还是告警实例？
* 静默期间事件是否入库？
* 谁有权限创建静默？
* 静默到期如何恢复？
* 时间使用什么时区？

稳定结论进入：

```text
CONTEXT.md
docs/adr/
```

## 第三步：使用 CodeGraph 探索

```text
使用 CodeGraph 查找：
- 告警规则入口；
- 通知发送路径；
- 告警事件持久化路径；
- 权限检查位置；
- 与时间调度相关的模块；
- 修改通知路径可能影响的测试。
```

## 第四步：设计

复杂功能使用：

```text
codebase-design
```

存在技术不确定性时使用：

```text
prototype
```

例如先验证：

* 数据库是否支持当前时间查询；
* 调度器是否需要新增任务；
* 是否能在通知层做静默判断。

## 第五步：TDD 实现

```text
使用 tdd 按垂直切片实现静默功能。

第一片：
创建静默记录并验证时间范围。

第二片：
通知发送前检查静默状态。

第三片：
静默结束后恢复通知。
```

## 第六步：Review

```text
使用 code-review 检查：
- 是否满足 Trellis 验收标准；
- 是否绕过了权限；
- 是否影响事件持久化；
- 是否引入时区问题；
- 是否有遗漏测试。
```

## 第七步：专项检查

因为涉及权限和通知：

```text
security-audit
```

如果有 Web 页面：

```text
browser-acceptance
```

## 第八步：文档同步

如果增加公开 API 或配置：

```text
release-doc-sync
```

## 第九步：完成任务

更新 Trellis：

* 完成内容；
* 测试命令；
* 验收结果；
* 安全结果；
* 未解决风险；
* 文档变化；
* 最终 commit。

---

# 6. Bug 修复流程

假设问题是：

```text
告警高峰期部分通知重复发送。
```

不要直接修改。

## 正确流程

### 建立 Trellis Bug 任务

记录：

* 发生时间；
* 影响范围；
* 已知日志；
* 当前假设；
* 修复完成条件。

### 使用 CodeGraph

```text
使用 CodeGraph 追踪：
事件接收
→ 规则匹配
→ 通知任务创建
→ 队列消费
→ 外部通知发送
```

### 使用 `diagnosing-bugs`

```text
使用 diagnosing-bugs：
1. 构造可重复测试；
2. 确认重复发生在哪一层；
3. 为消息 ID 和重试次数增加观察；
4. 验证是否是并发、重试或幂等问题；
5. 修复后加入回归测试。
```

### 使用 `tdd`

修复前先让回归测试失败。

### 使用 `code-review`

确认修复没有：

* 丢失正常重试；
* 隐藏真正发送失败；
* 引入全局锁；
* 降低吞吐量。

---

# 7. 架构重构流程

假设需要拆分一个过大的 `AlertService`。

## 第一步：CodeGraph

```text
分析 AlertService 的：
- 所有调用者；
- 所有被调用模块；
- 公共方法；
- 数据库依赖；
- 消息队列依赖；
- 受影响测试。
```

## 第二步：架构分析

运行：

```text
improve-codebase-architecture
```

确认：

* 哪些职责可以形成深模块；
* 哪些方法只是浅包装；
* 哪些边界是领域边界；
* 哪些接口应保持稳定。

## 第三步：设计

使用：

```text
codebase-design
domain-modeling
```

## 第四步：渐进迁移

每个切片都：

```text
测试
→ 修改
→ 测试
→ CodeGraph 检查影响
→ Review
```

不要一次性重写整个模块。

---

# 8. Codex 与 Devin 接力

## Codex 适合

* 本地快速探索；
* 高交互设计；
* 小步精细修改；
* 本地调试；
* Review 和重构。

## Devin 适合

* 长时间执行；
* 独立实现明确任务；
* 批量修改；
* 跑完整测试；
* 创建 PR；
* 云端环境任务。

## 交接前必须做

```powershell
git status
git add .
git commit -m "wip: implement alert silencing core"
git push
```

更新 Trellis 当前任务：

```text
已完成：
- 数据模型；
- 创建静默 API；
- 时间范围校验。

验证：
- 单元测试通过；
- API 集成测试通过。

剩余：
- 通知路径检查；
- Web 页面；
- 浏览器验收。

风险：
- 时区行为尚未在夏令时场景验证。

下一步：
使用 CodeGraph 追踪 NotificationDispatcher，
加入静默状态检查。
```

另一个 Agent 开始时：

```text
读取当前 Trellis 任务和最近提交。
使用 CodeGraph 验证剩余调用路径。
从任务中的"下一步"继续，不要重新规划已经完成的部分。
```

不要依赖 Codex 或 Devin 的聊天记录完成交接。

---

# 9. 发布流程

建议顺序：

```text
Trellis 验收标准确认
→ 单元测试
→ 集成测试
→ Lint / Typecheck / Build
→ Matt code-review
→ browser-acceptance（Web）
→ security-audit（风险任务）
→ release-doc-sync
→ 提交和 PR
→ 部署
→ 生产短期验证
→ Trellis 关闭任务
```

发布前 Agent 提示：

```text
准备发布当前任务。

请按顺序：
1. 检查 Trellis 验收条件；
2. 运行构建、Lint、类型检查和测试；
3. 使用 code-review；
4. 按风险运行 security-audit；
5. Web 项目运行 browser-acceptance；
6. 使用 release-doc-sync；
7. 将所有证据写入当前 Trellis 任务；
8. 不要在缺少新鲜验证证据时宣称完成。
```

---

# 10. 什么内容应该沉淀为知识

任务结束时，将发现分类。

## 写入 Trellis task

* 本次实现内容；
* 测试结果；
* 当前风险；
* 未完成事项；
* 验收结果。

## 写入 Trellis workspace

* 调试过程；
* 失败假设；
* 临时发现；
* 尚未稳定的推断。

## 写入 `.trellis/spec/`

* 所有后续任务都应遵守的稳定规则；
* 项目统一工程标准；
* 稳定的业务约束。

## 写入 `CONTEXT.md`

* 领域术语；
* 术语的精确定义；
* 术语之间关系；
* 禁止混用的概念。

## 写入 ADR

只有符合以下条件时创建：

* 决策难以轻易逆转；
* 存在真实取舍；
* 后续开发者可能不理解原因；
* 未来可能有人想重新讨论。

## 写入 Headroom

* 个人通用偏好；
* 跨项目工作习惯；
* 经常重复的纠正；
* 与特定项目无关的经验。

---

# 11. 推荐的 Agent 使用规则

在 `AGENTS.md` 中保持以下原则：

```text
1. Trellis 是任务、规格、进度和交接的唯一所有者。
2. CodeGraph 是代码关系和修改影响的首选事实来源。
3. Matt Skills 只提供工程方法，不创建第二套任务系统。
4. Headroom 只压缩上下文，不保存唯一的项目知识。
5. browser-acceptance 默认只验证，不修改产品代码。
6. security-audit 的 High 和 Critical finding 必须明确处理。
7. release-doc-sync 不得随意修改 Trellis、CONTEXT.md 和 ADR。
8. 所有"完成"声明必须附带最新测试或验证证据。
9. 危险 Git、数据库和生产操作必须先获得明确批准。
10. 跨 Agent 交接必须通过 Git 和 Trellis，而不是聊天记录。
```

---

# 12. 常用命令速查

## PAS

```powershell
pas version
pas profiles
pas init --profile standard --agents codex,devin
pas doctor
pas doctor --strict
```

## Trellis

```powershell
trellis --version
```

具体任务操作优先通过 Agent 中的 Trellis Skills 完成。

## CodeGraph

```powershell
codegraph --version
codegraph init
codegraph status
codegraph explore "Describe the architecture"
codegraph impact SomeService.Method
```

## Headroom

```powershell
headroom --version
headroom wrap codex --code-memory none
headroom mcp serve
```

## Codex MCP

```powershell
codex mcp list
```

## Devin MCP

```powershell
devin mcp list
devin mcp get codegraph
devin mcp get headroom
```

---

# 13. 最小日常流程

对于普通任务，实际只需要记住：

```text
1. Trellis 创建或恢复任务
2. CodeGraph 查代码范围和影响
3. 选择一个 Matt Skill
4. 实现并运行测试
5. code-review
6. 按需运行专项 Skill
7. 更新 Trellis 和 Git
```

任务类型与方法对应关系：

| 任务     | 首选 Skill                        |
| ------ | ------------------------------- |
| 需求不清   | `grill-with-docs`               |
| 新领域概念  | `domain-modeling`               |
| 技术不确定  | `prototype`                     |
| 外部资料调查 | `research`                      |
| 新功能    | `tdd`                           |
| 未知 Bug | `diagnosing-bugs`               |
| 模块设计   | `codebase-design`               |
| 架构问题   | `improve-codebase-architecture` |
| 完成前检查  | `code-review`                   |
| 合并冲突   | `resolving-merge-conflicts`     |
| Web 验收 | `browser-acceptance`            |
| 安全变更   | `security-audit`                |
| 发布文档   | `release-doc-sync`              |

最终不要把所有工具每次都运行一遍。

正确方式是：

```text
Trellis 始终使用
CodeGraph 在需要理解代码时使用
Matt Skills 按任务类型选择
自定义 Skills 按风险和发布阶段选择
Headroom 在输出过长时使用
```

这份说明也可以进一步拆成 `QUICKSTART.md` 和 `docs/workflows/` 下的场景手册。
