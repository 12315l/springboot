# 构建、部署与回退

## 项目独立构建

`npm run build` 无需 Skill，输出后端 target JAR（包含客户端资源），使用现有数据库及其对应配置运行。它不生成空库初始化文件。`npm run verify` 也可独立执行。下面的完整发布包由共享 Skill 工具生成。

## 发布包

运行 `npm run verify`、`npm run test:tools` 后执行 `npm run release`。客户端默认为 admin、front，可用 `-- --clients admin,front` 指定。app 需先安装依赖，仅生成 H5 包。

工具依次执行类型检查、前端构建、后端打包和 JAR 页面清单检查；全部成功才发布新版本。失败保留日志并恢复原打包资源，已发布目录不被覆盖。不要同时执行多个构建。

发布包中的 `manifest.json` 记录 JAR 的 SHA256；`runtimeVerified`、`sqlExecuted` 初始为 false，因为构建不会启动服务或执行 SQL。

## 独立数据库

创建空的 MySQL 测试数据库，执行发布包 `sql/bootstrap/001-initial.sql`。该文件不删库、不删表，包含基础字典、权限、角色和一个管理员；排除旧业务记录、用户资料和登录 Token。管理员密码来自 `BOOTSTRAP_ADMIN_PASSWORD`（至少 12 字符），未设置时随机生成并写入发布包 `initial-account.txt`。妥善保存该文件，不上传仓库。

初始化文件仅用于空库，重复执行可能触发唯一键冲突。现有数据库应审查模块增量 SQL 并先备份。`sql/<模块>/` 可能包含原项目的历史删表脚本，不能整目录批量执行。

## Windows 启动

进入发布包目录，使用 JDK 17：

```powershell
$env:DB_URL = 'jdbc:mysql://localhost:3306/student_demo?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai'
$env:DB_USERNAME = 'student_demo'
$env:DB_PASSWORD = '<实际数据库密码>'
$env:JWT_KEY = '<每个项目独立的随机密钥>'
$env:PLATFORM_PROJECT_ROOT = 'D:/student-demo/data'
./start.ps1
```

Linux 使用同名环境变量，执行 `sh start.sh`。后端端口固定为 8000。数据目录需具有写入权限。发布配置关闭 API 文档。

访问 `/vue/admin/index.html`、`/vue/front/index.html`，检查 `/health` 返回 HTTP 200 和 UP。健康检查访问权限表，数据库失联或初始化缺失返回 503。然后验收登录、菜单、生成模块新增/修改/删除、权限拒绝和数据范围。前端与后端同源，无须重新写服务地址。

## Docker

在 deploy 目录复制 `.env.example` 为 `.env`，设置实际密钥、数据库密码以及发布包绝对路径 `RELEASE_DIR`，执行 `docker compose up -d --build`。MySQL 和上传数据使用持久卷。MySQL 官方入口只在数据卷为空时执行初始化 SQL；已有卷需要明确的增量迁移。

## 回退

停止当前实例，使用前一版本目录的启动脚本或将 `RELEASE_DIR` 指向前一版本重新部署。历史本地验收基线已清理，源码回退需使用独立保存的备份或版本控制记录。数据库和上传数据不会随 JAR 自动回退；涉及结构变化时，使用经过验证的逆向迁移或数据库备份。
