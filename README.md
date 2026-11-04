# 低代码项目底座

Spring Boot 3 / Java 17、Vue 管理端及前台、uni-app 移动端。目录与能力配置见 platform.json；开发端口保持原配置。

## 日常开发与部署

安装 Node.js 20+、JDK 17、Maven、MySQL，在 admin、front 分别执行 npm ci。移动端按 app/package.json 安装依赖。

```sh
npm run doctor
npm run verify
npm run dev
npm run build
```

project.mjs 是项目自带的轻量入口。以上命令无需安装 Skill：verify 执行客户端类型检查和后端基础测试；build 检查类型、构建客户端并打入后端 target 的 JAR；dev 启动开发进程。verify/dev 可追加 -- --clients admin,front 或 app；完整构建必须包含当前项目全部客户端。-- --plan 只显示执行计划。普通根项目默认 admin、front；派生项目以 project.json.clients 为准。

构建不会初始化数据库，也不等于完成业务验收。部署说明和实际配置保留在 [docs/deployment.md](docs/deployment.md)、deploy/。即使没有入口脚本，也可在各客户端运行自身 package.json 脚本，在后端执行 Maven。

## 共享开发工具

生成、派生、完整发布包、地区同步及工具测试放入 jx-build-backend-module Skill，不随每个项目复制。入口默认查找用户目录下的该 Skill；也可设置 JX_PLATFORM_TOOLKIT 指向共享 project-toolkit 目录或 tools/platform.mjs，不固定机器路径。

```sh
npm run generate -- --spec specs/examples/equipment.json
npm run derive -- --name student-demo --output projects/student-demo --clients admin,front
npm run test:tools
npm run release
npm run sync:regions -- --check
```

示例 specs/examples/* 从 Skill 读取；自己的业务规格可保留在本项目 specs/，优先使用项目文件。生成和派生默认只预览，审查后追加 --apply。已有目标拒绝覆盖。SQL 不自动执行。派生不复制依赖、产物、上传文件和本机凭证；生成后的项目保留独立构建入口。

release 需要共享工具，生成 release/<版本>/ 完整发布包，包含启动配置、空库初始化 SQL、管理员初始账号和摘要清单。build 只生成后端 target JAR。实际部署文件仍由项目维护。

共享规范、生成器指南和示例统一在 Skill 的 references/shared-project-toolkit.md、scripts/project-toolkit/guides/、specs/examples/。本项目 docs/ 保留业务及部署事实。开发工具测试包含历史兼容测试；部分旧测试需单独维护，不能将其结果等同于业务验收。

项目操作文档统一见 [docs/README.md](docs/README.md)。通用接入指南已合并到Skill，旧阶段报告不再放在活动docs目录。
