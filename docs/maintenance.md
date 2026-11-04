# 项目维护与验收边界

目录按platform.json，客户端按project.json（存在时）及各自package.json；服务地址按实际运行日志确认。日常build/verify/dev由project.mjs独立执行，共享生成/派生/release工具由Skill提供。权限、数据库、AI/短信、备份及文件目录均核对当前进程配置，不输出实际凭据。

## 安装和菜单

模块SQL保留在后端对应模块的db目录。当前源码存在安装文件不等于目标库已经执行；依赖已有表的增量不能用于空库，初始化不能用来升级已有库。旧阶段记录不再作为正式库“已安装”或“尚未安装”的依据。

注册按[注册说明](registration-guide.md)，前台权限在baseModule/FrontAccessModule/db/install.sql，字典论坛分类在ForumModule/db/forum-category-permissions.sql，导出权限在ExportModule/db/permissions.sql。通用服务在CommonSupportModule/db，菜单、配置、公告和通知发送在PlatformModule/db；各目录脚本目的不同，执行前需单独核对。不要批量执行整个db目录。后台入口层级可能已调整，以当前菜单树和授权为准。

## 验收重新核对清单

这些是从历史记录保留的核对项，不表示当前一定有缺陷或全部尚未完成；本次未重新运行：

- 登录错误限制、管理员解除及实际日志：使用专用测试账号，不锁定真实用户。
- 列表搜索/切页、末页删除回退、失败重试、表单取消、防重复提交及刷新失败提示。
- 游客与登录身份切换、角色授予和撤销后的导航/直链/API，旧响应不能覆盖新会话。
- 有效AI配置下的真实模型回复，以及项目显式启用短信后的供应商回执；受控SDK测试不代替外部服务验收。
- 若交付App或小程序，分别核对依赖、类型/构建、真机目标和实际流程，不能由Web结果推断。
- 部署包、当前运行进程与源码是否同一版本；未打包的开发修复不能记入旧JAR。

工具套件存在历史失败基线，参考Skill共享工具说明；仅在相关任务核对最新日志与原因，不把旧次数当当前状态，也不顺带屏蔽失败。

## 已有敏感词模块的核对入口

基础模块已迁入baseModule：Attachment、DatabaseBackup、DeepSeek、FrontAccess、LoginSecurity、Registration、SensitiveWord、SmsVerification。编写新业务仍使用functionModule；根配置和生成工具按实际目录读取，不能依旧说明把基础模块挪回去。

用户此前说明敏感词过滤已与论坛、评论关联；本次只确认SensitiveWordModule及其SQL文件存在，没有运行过滤或数据库检查。后续涉及内容发布/审核先核对该模块的实际调用、词库权限、过滤和失败策略，避免重复开发。不能将用户补充或源码目录存在记为功能验收通过。

## 文档维护方式

项目保留本地安装、配置和操作事实；可复用开发规则在Skill更新原参考，新增能力按其feature-change-maintenance检查影响面。过期路线图和阶段日志不要重新堆回docs，也不自动删除业务数据、上传、回收目录或备份。历史证据被清理后只保留明确限制，不继续链接不存在的日志或照搬PASS结论。

模块搬迁后的工具验收与本次启动/数据库状态分别记录。没有node_modules时不能声称前端类型检查通过；只读权限库存不写库，旧菜单生成默认受显式开关保护，不作为普通回归运行。
