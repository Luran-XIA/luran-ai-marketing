import { useState } from "react";
import { buildPrompt, buildUserPrompt, systemPrompt, tasks, type Brief, type TaskId } from "./marketing";
const empty: Brief = { product: "", audience: "", goal: "", platform: "小红书", tone: "自然、有说服力", content: "" };
const example: Brief = { product: "虚构品牌「轻野」挂耳咖啡，10袋/盒，39元。已知卖点：中度烘焙、独立包装、无需咖啡机。无销量、检测或用户评价资料。", audience: "预算有限、希望工作日方便喝咖啡的年轻上班族", goal: "新品试饮，引导查看商品详情", platform: "小红书", tone: "自然、有说服力", content: "全网第一的提神神器！每天一杯，工作效率翻倍。限时39元，千万别错过！" };
export default function Home() {
  const [task, setTask] = useState<TaskId>("analyze");
  const [brief, setBrief] = useState<Brief>(empty);
  const [planNotes, setPlanNotes] = useState("");
  const [settings, setSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [model, setModel] = useState("qwen-flash");
  const [result, setResult] = useState("");
  const [resultType, setResultType] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [usage, setUsage] = useState("");
  const update = (key: keyof Brief, value: string) => setBrief({ ...brief, [key]: value });
  const activeBrief = { ...brief, content: task === "plan" ? planNotes : brief.content };
  function preview() { setResult(buildPrompt(task, activeBrief)); setResultType("Prompt预览 · 未调用模型"); setUsage(""); setNotice(""); }
  async function generate() {
    if (!brief.product.trim()) { setNotice("先填写产品或服务资料。"); return; }
    if (task !== "plan" && !brief.content.trim()) { setNotice("先粘贴要分析或改写的原文。"); return; }
    if (!apiKey.trim()) { preview(); setNotice("已生成Prompt，可复制到Qwen网页版。点击「API设置」可接入真实生成。"); return; }
    setBusy(true); setNotice("");
    try {
      const space = workspace.trim();
      if (space && !/^[a-zA-Z0-9-]{1,100}$/.test(space)) throw new Error("业务空间ID格式不正确。");
      const endpoint = space
        ? `https://${space}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions`
        : "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
      const started = performance.now();
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
        credentials: "omit",
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({model, messages: [{role: "system", content: systemPrompt}, {role: "user", content: buildUserPrompt(task, activeBrief)}], enable_thinking: false, max_tokens: 2200, temperature: 0.7}),
      });
      const data = await response.json() as {choices?: {message?: {content?: string}}[]; usage?: {prompt_tokens?: number; completion_tokens?: number}};
      if (!response.ok) {
        const messages: Record<number,string> = {401: "密钥无效或与地域不匹配，请检查百炼API Key。",403: "无访问权限，请检查模型权限及业务空间。",429: "请求受限或额度不足，请在百炼控制台检查。"};
        throw new Error(messages[response.status] || `Qwen返回错误（${response.status}），请检查模型与账号状态。`);
      }
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) throw new Error("模型没有返回文本，请稍后重试。");
      setResult(content); setResultType(`${tasks[task].title} · ${model}`);
      setUsage(`输入 ${data.usage?.prompt_tokens ?? "—"} / 输出 ${data.usage?.completion_tokens ?? "—"} token · ${((performance.now() - started) / 1000).toFixed(1)} 秒`);
    } catch (error) { setNotice(error instanceof TypeError ? "连接失败：请检查网络，或该业务空间是否允许浏览器跨域调用。可先复制Prompt使用。" : error instanceof DOMException && error.name === "TimeoutError" ? "请求超过60秒，请稍后重试。" : error instanceof Error ? error.message : "连接失败，请检查网络。"); }
    finally { setBusy(false); }
  }
  async function copy() { try { await navigator.clipboard.writeText(result); setNotice("已复制。"); } catch { setNotice("浏览器未允许复制，请在结果区选中文字后复制。"); } }
  function download() { const url = URL.createObjectURL(new Blob([`# ${resultType}\n\n${result}\n`], { type: "text/markdown;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = `luran-${task}.md`; a.click(); URL.revokeObjectURL(url); }
  return <main>
    <header className="topbar"><a href="./" className="brand"><span className="brand-icon">L</span><span>LURAN XIA<small>AI MARKETING</small></span></a><div className="header-actions"><span className="private-tag">个人营销工具</span><button className="button secondary" onClick={() => setSettings(!settings)} aria-expanded={settings}>API设置 ↗</button></div></header>
    <section className="intro"><div><p className="eyebrow">A LITTLE HELP FOR YOUR NEXT BIG IDEA</p><h1>让营销想法，更快成为初稿<span>。</span></h1><p className="subtitle">分析一段文案，换一种表达，或从零规划一场活动。</p></div><div className="intro-note"><span className={apiKey.trim() ? "dot connected" : "dot"}/>{apiKey.trim() ? "已填入密钥 · 可调用Qwen" : "无需密钥也可生成Prompt"}</div></section>
    {settings && <section className="settings" aria-label="API设置"><div className="settings-heading"><div><h2>连接你的 Qwen API</h2><p>使用你自己的密钥，资料与密钥由浏览器直接发送到阿里云 Qwen。仅保留在页面内存，刷新后清除。</p></div><button className="text-button" onClick={() => setSettings(false)}>收起 ×</button></div><div className="settings-grid"><label>API Key<input type="password" autoComplete="off" spellCheck={false} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="粘贴你的百炼API Key" maxLength={512}/></label><label>模型<select value={model} onChange={e => setModel(e.target.value)}><option value="qwen-flash">Qwen Flash · 默认</option><option value="qwen3.7-flash">Qwen 3.7 Flash · 新模型候选</option><option value="qwen-plus">Qwen Plus · 质量对比</option></select></label><label>北京业务空间ID（新项目建议填）<input value={workspace} onChange={e => setWorkspace(e.target.value)} placeholder="从百炼业务空间复制ID" maxLength={100} spellCheck={false}/></label></div><div className="settings-footer"><p>仅支持北京地域。未填ID时使用旧版兼容地址。密钥与空间需匹配。<a href="https://help.aliyun.com/zh/model-studio/get-api-key/" target="_blank" rel="noreferrer">开通指南 ↗</a></p><button className="text-button" onClick={() => { setApiKey(""); setNotice("已清除页面中的密钥。"); }}>清除密钥</button></div></section>}
    <section className="task-tabs" aria-label="选择营销任务">{(Object.keys(tasks) as TaskId[]).map((id, i) => <button key={id} className={`task-tab ${task === id ? "active" : ""}`} onClick={() => setTask(id)} aria-pressed={task === id} disabled={busy}><span className="task-number">0{i + 1}</span><div><strong>{tasks[id].title}</strong><p>{tasks[id].description}</p></div><span className="task-arrow">↗</span></button>)}</section>
    <div className="workspace"><section className="panel input-panel"><div className="panel-heading"><div><span className="section-index">01 / BRIEF</span><h2>先说说你的需求</h2></div><button className="text-button" disabled={busy} onClick={() => { setBrief(example); setNotice("已填入虚构咖啡案例，可修改后使用。"); }}>填入示例 ↗</button></div><div className="form-fields">
      <label>产品 / 服务资料 <span className="required">必填</span><textarea value={brief.product} onChange={e => update("product", e.target.value)} placeholder="是什么产品？售价、真实卖点、品牌限制是什么？" rows={3} maxLength={2500}/></label>
      <div className="two-columns"><label>目标受众<input value={brief.audience} onChange={e => update("audience", e.target.value)} placeholder="例如：初入职场的上班族" maxLength={400}/></label><label>营销目标<input value={brief.goal} onChange={e => update("goal", e.target.value)} placeholder="例如：引导领取试用装" maxLength={400}/></label></div>
      <div className="two-columns"><label>发布渠道<select value={brief.platform} onChange={e => update("platform", e.target.value)}>{["小红书", "抖音短视频", "微信公众号", "电商详情页", "通用"].map(v => <option key={v}>{v}</option>)}</select></label><label>表达风格<select value={brief.tone} onChange={e => update("tone", e.target.value)}>{["自然、有说服力", "简洁、专业", "轻松、有趣", "克制、有质感"].map(v => <option key={v}>{v}</option>)}</select></label></div>
      <label>{task === "plan" ? "补充要求" : "原始文案"} <span className="required">{task === "plan" ? "选填" : "必填"}</span><textarea value={task === "plan" ? planNotes : brief.content} onChange={e => task === "plan" ? setPlanNotes(e.target.value) : update("content", e.target.value)} placeholder={task === "plan" ? "预算、周期、可用资源……不知道的可以留空。" : "粘贴一段你想分析或改写的文案……"} rows={5} maxLength={6000}/></label></div>
      <div className="generate-row"><button className="button primary" onClick={generate} disabled={busy}>{busy ? "正在生成…" : apiKey.trim() ? `生成${tasks[task].title}结果` : "生成任务Prompt"}<span>→</span></button><button className="text-button" disabled={busy} onClick={preview}>预览Prompt</button></div><p className="input-note">仅依据你提供的资料，不会自动检索市场或读取平台数据。</p></section>
      <section className="panel output-panel" aria-busy={busy}><div className="panel-heading"><div><span className="section-index">02 / OUTPUT</span><h2>你的工作初稿</h2></div><span className="output-tag">{busy ? "生成中" : result ? "可编辑使用" : "准备就绪"}</span></div>
      {result ? <><div className="result-meta">{resultType}</div><textarea className="result-text" aria-label="结果内容，可编辑" value={result} onChange={e => setResult(e.target.value)} spellCheck={false}/><div className="result-actions"><button className="button secondary" onClick={copy}>复制结果</button><button className="text-button" onClick={download}>下载Markdown ↓</button></div></> : <div className="empty-output"><div className="paper-stack"><span/><span/><span>✦</span></div><h3>好内容，从一份清楚的Brief开始。</h3><p>填写左侧资料，选择一个任务。<br/>结果会出现在这里，你可以继续编辑和复制。</p><div className="output-preview"><span>{tasks[task].output}</span><span>清楚的结构</span><span>可执行的建议</span></div></div>}
      <p className="usage">{usage || "AI结果需人工审核；不代表实际市场表现或合规结论。"}</p></section></div>
    {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="关闭提示">×</button></div>}
    <footer><span>Built by Luran Xia <span className="footer-dot">·</span> AI营销项目 · GitHub Pages</span><span>把重复工作交给工具，把判断留给自己。</span></footer>
  </main>;
}
