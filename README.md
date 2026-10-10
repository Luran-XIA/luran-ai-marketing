# Luran Xia · AI 营销工作台

在线使用：https://luran-xia.github.io/luran-ai-marketing/

打开即可使用，无需访客提供 API Key。12个功能覆盖甲方 Brief、定位、提案评估、复盘、案例分析，乙方创意提案、文案诊断、改写、活动策划、内容排期、客户沟通整理，以及连续聊天。每个功能使用后台内置指令。结果可编辑、复制、下载。

网页由 GitHub Pages 托管；config.json 仅包含公开的后台地址。后台为 Sites 托管的 Cloudflare Worker，模型为阿里云 Qwen Flash，密钥只放在后台秘密变量中。源码不含真实密钥。

全站共享每天100次、每分钟10次体验额度，UTC日界重置；也受阿里云账户额度限制。后台使用D1原子计数，失败调用计入次数。不会自动充值。页面不保存输入与对话；对话在刷新后清空。资料经后台转发至阿里云，不要提交敏感资料。

案例为虚构练习，工具不会自动读取链接。AI可能补写未提供的事实，使用前请核对；本项目不宣称真实营销成效。

构建：安装依赖后运行 `npm run build`，生成独立 index.html。页面源码 App.tsx；功能定义 marketing.ts；配套后台源码位于本地项目 ../api/。GitHub Pages 以 main 分支根目录发布。
