# ChopChat 高保真 V1

基于 `Chopchat_UI.pen` 中的 1440×900 高保真画框实现，并完整保留低保真 V1 的路由、状态与核心交互。

## 技术栈

- React + TypeScript + Vite
- React Router
- CSS Variables 设计令牌
- 无外部图片依赖的品牌图形与数据可视化资源

## 本地运行

```bash
npm install
npm run dev
```

生产构建与类型检查：

```bash
npm run build
npm run typecheck
```

## 实现范围

- Linear Dark 视觉系统，默认暗色主题，并保留明暗切换。
- ChopChat 四瓣品牌标识、品牌文字与 REITs Knowledge Agent 标签。
- AI 新对话、会话页、定时任务、PPT 助手、PPT 编辑器、我的技能、客户后台。
- 账户与套餐、确认/支付订单、绑定手机端、新建任务、技能详情、PPT 导入/新建/模板管理、自定义作图等弹窗。
- 桌面端与移动端响应式布局。
