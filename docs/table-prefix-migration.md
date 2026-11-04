# 基础表前缀迁移

映射清单随共享Skill保存于scripts/project-toolkit/data/foundation-table-renames.json，不再放项目resources，也不参与后端启动。工具按自身位置读取，不依赖当前工作目录。

仅将该清单列出的14张通用基础表从c_改为a_；公告、点赞、收藏、评论、帖子、反馈、通知、通知发送8张业务表保持原名，现有其他a_表不动。只RENAME，不重建表或改业务字段/数据。

新安装直接使用更新后的初始化及模块SQL。旧数据库必须先完成改名，不能先导入新安装SQL以免出现同内容新旧两张表。Java实体/原生SQL/测试/派生能力工具同步引用新表名。文件目录和HTTP API不变。

开发环境需MySQL客户端；通过MYSQL_BIN_DIR、MYSQL_HOST、MYSQL_PORT、MYSQL_USER、MYSQL_PWD配置连接。先运行只读预览：

```sh
node project.mjs rename-foundation-tables --database springboot
node project.mjs rename-foundation-tables --database springboot --execute --backup-dir <独立备份目录>
```

执行前核对目标库并停止业务写入。工具在新旧表同在或两者都缺失时拒绝；无待迁移表时不执行SQL。执行时先保存全库一致性备份，再用一条RENAME TABLE迁移剩余表，并比较逐表行数及CHECKSUM TABLE EXTENDED结果；同时生成forward.sql与reverse.sql。出现冲突不覆盖、不合并、不删除任一表。成功后重启后端加载新代码。反向SQL仅用于受控回退，必须与旧代码配套，勿在新增写入后盲目恢复备份。

本次任务验收及迁移备份位于系统临时目录codex-table-prefix-20261015，最终结果以任务报告为准；本文件不意味着任一目标库已经执行。
