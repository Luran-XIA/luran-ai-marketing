# Luran Xia · AI 营销工作台

[打开网页](https://luran-xia.github.io/luran-ai-marketing/)

个人作品项目：以产品事实、受众、渠道和目标组成 Brief，用三套任务 Prompt 完成文案分析、差异化改写、活动策划。支持编辑、复制和下载 Markdown。

## 使用

1. 选任务，填写资料；可以先用虚构咖啡示例。
2. 无密钥时生成 Prompt，不会调用模型或产生 API 费用。
3. 真实生成：在 API 设置填入自己的阿里云百炼北京地域 Key，可选业务空间 ID，然后点击生成。

页面公开，**不提供共享密钥**。输入的密钥仅在当前页面内存中保留，不写入仓库、浏览器持久存储或本站服务器。生成时，浏览器通过 HTTPS 直接将密钥和所填资料发送至阿里云接口；刷新后需重填。适合个人自用，不用将自己的 Key 分享给访问者。本站无 OpenAI 依赖、登录或后端。

## 开通与费用

前往 [百炼 API Key 开通指南](https://help.aliyun.com/zh/model-studio/get-api-key/)，开通模型服务并创建北京地域 Key。新业务空间可填写其 ID；不填使用旧版 DashScope 兼容接口。不同空间的浏览器跨域支持需实际验证。

默认 qwen-flash。按2026-10-10北京价格，输入不超过128K时，每百万输入token ¥0.15、输出token ¥1.5；一次2000输入+1000输出约¥0.0018，不含其他计费项。以[官方价格](https://help.aliyun.com/zh/model-studio/qwen-flash)为准。建议在百炼设预算和额度停止规则。

## 开发与发布

源码：App.tsx、marketing.ts、styles.css、main.tsx、source.html。index.html 是生成的独立网页，已内嵌全部运行脚本与样式。

需要 Node.js 22.13+。安装依赖后：

```sh
npm install
npm run check
npm run build
```

提交新 index.html 到 main。GitHub Settings → Pages → Deploy from a branch → main / root；网页由 GitHub Pages 托管，无需服务器或后端密钥。修改源码后必须重新构建 index.html。

## 验证与边界

构建、类型检查、三类 Prompt 和任务切换需通过。已检查旧版北京接口的 CORS 预检响应允许 POST 与 authorization/content-type，不需要付费调用。未提供真实 Key，尚未完成真实模型调用验证。无密钥时显示的内容明确标记为 Prompt 预览。

工具不会联网检索市场或读取社交平台数据。案例为虚构资料；AI输出需人工审核。项目不声称已经实施营销活动、提升转化或获得真实业务效果。
