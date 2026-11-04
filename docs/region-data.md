# 地区数据：以 @vant/area-data 为主

## 来源与同步

前台front/src/components/Cascader/index.vue继续使用已安装的@vant/area-data/useCascaderAreaData。后端使用从同一函数导出的JSON快照，不导入地区表，不需要数据库迁移，不依赖运行时访问npm或网络。

在项目根目录执行：

```sh
node project.mjs sync-region-data
node project.mjs sync-region-data --check
```

生成base-framework-main/src/main/resources/regions/vant-area-data.json及原依赖MIT许可证VANT-LICENSE.txt。快照记录来源、版本、数据SHA-256、编码、名称、父编码、层级和完整名称；内容顺序确定，没有生成时间造成的无效差异。当前来源为@vant/area-data 2.0.0，共3880条。--check只读比较，资源与当前依赖不一致时非零退出。依赖升级后重新同步、检查、编译并重启后端；生产Java运行不需要Node.js。检查命令须在开发/构建环境运行，不声称已自动接入所有构建入口。

## 服务端行为

RegionCatalog启动加载资源并检查编码唯一性、上下级和完整名称，建立只读索引。AddressService新增地址和修改地区时查该索引，拒绝不存在/层级混搭/分隔格式错误的编码，由服务端生成地区名称，不信任客户端area。为兼容既有1/2/3级通用选择器，接受从省开始的合法路径前缀；收货地址前台保持三级选择。

现有/diZhi/free/tree沿用code/name/children响应结构，数据同样来自快照，不再读a_area_table。前台仍直接使用依赖，没有更换页面组件或地区选项。普通中国直辖市全称按依赖层级原样拼接，例如天津市天津市南开区。

历史记录查询原样显示；修改时未传code或code与原记录相同，服务端保留原area，允许修改电话/门牌，不因历史编码退役而阻断。不允许客户端用area覆盖历史地区；改变code时重新验证。

## 验证与启用

依赖变更后同步并--check，运行RegionCatalog/地址Service相关定向测试和编译，再在目标环境验收三级选择与保存、非法编码拒绝、旧地址修改策略。是否需要重启后端按当前资源/进程版本判断；无需SQL。旧阶段记录不作为当前验收证据，按实际任务分别记录。

## 旧地区表移除

用户已授权删除springboot.a_area_table及相关代码。专用AreaDao/AreaMapper.xml、AreaInfo表映射、地区异步缓存初始化、初始化SQL地区段及bootstrap地区种子已移除；通用生成器改为调用RegionCatalog，不再生成地区DAO依赖。AreaInfo/AreaTree仍是地区树接口的响应模型，保留。测试夹具同步去除旧DAO依赖。当前源码不依赖旧表；任何新目标库是否存在或已删除该表必须单独核对，不把历史删除记录视为本次执行。
