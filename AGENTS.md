# 项目约定

目录和能力以 platform.json 为准；派生客户端以 project.json 为准。管理端与前台端口沿用现有配置及自动递增机制。

- 业务 Java 位于 system.store.functionModule，复用现有响应、分页、权限和组件。
- 写操作校验当前用户数据范围；审批等状态动作不能被普通编辑绕过。
- 生成先预览，已有模块不覆盖；SQL 不自动在现有数据库执行，不自动删旧表。
- 项目入口 project.mjs 的 build/verify/dev 可独立执行；生成/派生等共享工具在 jx-build-backend-module Skill。使用前读取其 references/shared-project-toolkit.md；不要重新复制 tools、通用指南和示例到每个项目。
- 类型、编译、打包、数据库执行及真实运行验收分别记录；普通验证不运行旧数据库生成器测试。
- platform.json 中 integrated 表示尚未可独立裁剪，不声明已隔离。部署配置和项目事实保留在本项目。

- 参与此平台开发的AI先读取已安装的 jx-build-backend-module/SKILL.md，再读 references/agent-routing-and-tools.md 按任务选规则/工具；功能变更交付时按 references/feature-change-maintenance.md 同步受影响项。无法访问Skill时明确缺失，不假称已加载或通过门禁。

- Attachment、DatabaseBackup、DeepSeek、FrontAccess、LoginSecurity、Registration、SensitiveWord、SmsVerification基础模块当前在baseModule；其他业务仍按functionModule约定。工具需识别实际布局，不将这些基础模块搬回旧位置。权限只读发现与菜单生成分开，发现基础接口不意味着新增菜单或授权。
