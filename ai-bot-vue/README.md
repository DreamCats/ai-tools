# template

prompt

```markdown
目前这个网页有个功能：
聊天机器人（模仿微信界面，高模仿程度）
我对布局上有要求：
小而美、毛玻璃特效、过度动画、注意细节；
聊天机器人输入框上方有一行菜单栏：新对话、历史对话，下方也有一行菜单栏，最左侧有一个导入图片、文件的功能；菜单栏功能要求全是图标；
我对架构代码有要求：
整体使用基于 js 的 vue 框架
代码 ddd 架构
样式 ddd 架构
布局 ddd 架构
每增加功能、布局、样式、都需要高内聚、低耦合；
我对底层 api 有要求：
存储相关，采用插件：
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

聊天机器人 api，遵守 openai 协议；

README.md 背景介绍
```
