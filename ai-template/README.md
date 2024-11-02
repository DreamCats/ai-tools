# template

## 文件介绍

- `plugin.json` 插件配置文件
- `dist` 插件打包后的文件夹
- `src` 插件源码文件夹

src/preload.ts 插件预加载文件

dist/index.html 插件主页面

dist/styles/index.css 插件主样式

## api

- 存储：

utools.dbStorage.setItem(key, value)

key：键名(同时为文档 ID）

键值(任意类型)

键值对存储，如果键名存在，则更新其对应的值

utools.dbStorage.getItem(key)

key String：键名(同时为文档 ID)

返回 Any：获取键名对应的值

utools.dbStorage.getItem('pai') // 返回 3.1415926

utools.dbStorage.removeItem(key)

key String：键名(同时为文档 ID)

删除键值对(删除文档)

utools.dbStorage.removeItem('pai')

- 机器人 api，使用 openai 协议，注意 openai 的可复用性、可扩展性。

## 架构

框架：注意

- 代码分层用 ddd 架构解耦、扩展性、复用性；
- 样式、组件化、可复用性；
