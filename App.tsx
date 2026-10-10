import {useEffect,useRef,useState} from "react";
import {buildUserPrompt,chatSystem,platforms,systemPrompt,tasks,tones,type Brief,type BusinessTask,type Perspective,type TaskId} from "./marketing";
const empty:Brief={product:"",audience:"",goal:"",platform:"小红书",tone:"自然、有说服力",content:""};
type Message={role:"user"|"assistant";content:string};
type Connection={apiBase:string;apiKey?:string;model:string;mode:"direct"|"proxy"};
const perspectives:Perspective[]=["甲方 / 品牌方","乙方 / 服务方","通用助手"];
const examples=[
  {title:"挂耳咖啡 · 产品上市",product:"虚构品牌「轻野」挂耳咖啡。定位：年轻上班族的便捷日常咖啡。10袋/盒，39元；中度烘焙、独立包装，无需咖啡机。无销量、检测或用户评价资料。",audience:"预算有限、办公室没有咖啡机的年轻上班族",goal:"新品试饮，引导查看详情",content:"文案：全网第一的提神神器！每天一杯，工作效率翻倍。限时39元，千万别错过！仅有这段文案，无投放数据、销量或测试报告。"},
  {title:"独立书店 · 到店活动",product:"虚构书店「慢页」。定位：社区读者的交流空间。周六举办免费读书交流会，20个座位，需提前预约。无活动效果数据。",audience:"附近希望结识读者的居民",goal:"增加活动预约",content:"书店在自有社群发布：周六下午一起读书，每人带一本喜欢的书，现场交流片段。附预约表，标注20个座位。活动前一天提醒已预约者。未提供阅读量、预约人数或到场率。"},
  {title:"健身体验 · 咨询转化",product:"虚构工作室「起点」。定位：帮助初次训练者熟悉器械。49元单次基础训练体验，需预约。无减重或健康效果承诺。",audience:"第一次接触健身的上班族",goal:"引导咨询体验课",content:"短视频展示教练演示基础动作，结尾：第一次训练不知道怎么开始？预约49元基础体验课，先熟悉器械。主页有预约说明，但缺课程时长和取消规则。没有转化或复购数据。"},
];
export default function Home(){
 const [perspective,setPerspective]=useState<Perspective>(perspectives[0]);
 const [task,setTask]=useState<TaskId>("brief");
 const [brief,setBrief]=useState<Brief>(empty);
 const [materials,setMaterials]=useState<Partial<Record<BusinessTask,string>>>({});
 const [outputs,setOutputs]=useState<Partial<Record<BusinessTask,{content:string;meta:string}>>>({});
 const [connection,setConnection]=useState<Connection|null>(null);
 const [settings,setSettings]=useState(false);
 const [keyDraft,setKeyDraft]=useState("");
 const [remember,setRemember]=useState(false);
 const [baseUrl,setBaseUrl]=useState("");
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 const [messages,setMessages]=useState<Message[]>([]);
 const [question,setQuestion]=useState("");
 const chatEnd=useRef<HTMLDivElement>(null);
 useEffect(()=>{fetch("./config.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(c=>{
  const u=new URL(c.baseUrl);if(u.protocol!=="https:"||!u.hostname.endsWith(".aliyuncs.com"))return;setBaseUrl(c.baseUrl.replace(/\/$/,""));
  if(typeof c.apiBase==="string"&&c.apiBase){const proxy=new URL(c.apiBase);if(proxy.protocol==="https:")setConnection({apiBase:proxy.origin,model:c.model||"qwen-flash",mode:"proxy"});}
  else {try{const stored=localStorage.getItem("luran-personal-qwen-key");if(stored)setConnection({apiBase:c.baseUrl.replace(/\/$/,""),apiKey:stored,model:c.model||"qwen-flash",mode:"direct"});}catch{}}
 }).catch(()=>{});},[]);
 function connect(){if(!keyDraft.trim()||!baseUrl){setNotice("请填写密钥并确认网络连接。");return;}try{if(remember)localStorage.setItem("luran-personal-qwen-key",keyDraft.trim());else localStorage.removeItem("luran-personal-qwen-key");}catch{setNotice("浏览器禁止保存，将仅在当前页面使用。");}setConnection({apiBase:baseUrl,apiKey:keyDraft.trim(),model:"qwen-flash",mode:"direct"});setKeyDraft("");setSettings(false);setNotice(remember?"已连接；密钥保存在此浏览器。":"已连接；密钥仅保存在当前页面。");}
 function disconnect(){try{localStorage.removeItem("luran-personal-qwen-key");}catch{}setConnection(null);setKeyDraft("");setNotice("已清除本机保存的密钥，请刷新恢复站点默认连接。");}

 useEffect(()=>{if(task==="chat")chatEnd.current?.scrollIntoView({block:"nearest"});},[messages,busy,task]);
 const meta=tasks[task];
 const content=task==="chat"?"":materials[task]||"";
 const result=task==="chat"?undefined:outputs[task];
 function changeTask(id:TaskId){setTask(id);setPerspective(tasks[id].perspective);setNotice("");}
 function changePerspective(p:Perspective){setPerspective(p);const first=(Object.keys(tasks) as TaskId[]).find(id=>tasks[id].perspective===p)!;setTask(first);setNotice("");}
 function update(k:keyof Brief,v:string){setBrief(b=>({...b,[k]:v}));}
 function loadExample(i=0,asCase=false){const item=examples[i];const id=asCase?"case":task;if(id==="chat")return;setBrief({...empty,product:item.product,audience:item.audience,goal:item.goal});setMaterials(m=>({...m,[id]:["case","analyze","rewrite"].includes(id)?item.content:id==="review"?"提案初稿：以‘办公室的一杯咖啡’为主题，发布3篇场景内容；交付3张图文封面和3篇正文。尚未提供排期、预算与验收标准。":id==="retro"?"活动已发布3篇内容。尚未提供曝光、点击、成交和成本数据。":id==="meeting"?"客户：先做3篇小红书内容，突出独立包装。具体上线日期还要内部确认。策划：建议先试办公室场景。客户：预算还没批，请先给初稿。":"预算与排期待确认；先提交一份可讨论的初稿。"}));if(asCase)changeTask("case");setNotice("已填入虚构练习资料，可编辑后生成。");}
 async function callModel(history:{role:string;content:string}[],payload:unknown){
  if(!connection)throw Error("AI体验服务尚未开通。站长可在页底「连接设置」配置个人连接。");
  const direct=connection.mode==="direct";
  const response=await fetch(direct?`${connection.apiBase}/chat/completions`:`${connection.apiBase}/api/generate`,{method:"POST",headers:direct?{"Content-Type":"application/json",Authorization:`Bearer ${connection.apiKey}`}:{"Content-Type":"application/json"},credentials:"omit",signal:AbortSignal.timeout(65000),body:JSON.stringify(direct?{model:connection.model,messages:history,enable_thinking:false,max_tokens:2600,temperature:0.2,stream:false}:payload)});
  if(!response.ok){const known:Record<number,string>={401:"AI服务认证失败，请联系站长。",403:"模型权限或免费额度受限，请联系站长。",429:"模型额度或调用频率受限，请稍后再试。"};let message=known[response.status]||`AI服务暂时不可用（${response.status}）。`;if(!direct){try{const error=await response.json();if(typeof error.error==="string")message=error.error;}catch{}}throw Error(message);}
  const data=await response.json();const text=direct?data.choices?.[0]?.message?.content:data.content;
  if(typeof text!=="string"||!text.trim())throw Error("模型未返回文本，请稍后再试。");
  return {content:text,meta:`${data.model||connection.model} · 输入 ${(direct?data.usage?.prompt_tokens:data.inputTokens)??"—"} / 输出 ${(direct?data.usage?.completion_tokens:data.outputTokens)??"—"} token${data.choices?.[0]?.finish_reason==="length"?" · 已达长度上限，可继续追问":""}`};
 }

 function showError(e:unknown){setNotice(e instanceof TypeError?"连接失败，请检查网络后重试。":e instanceof DOMException&&e.name==="TimeoutError"?"处理超时，请稍后重试。":e instanceof Error?e.message:"生成失败，请稍后重试。");}
 async function generate(){
  if(task==="chat"||busy)return;
  if(task!=="case"&&!brief.product.trim()){setNotice("请先填写产品定位和功能。");return;}
  if(meta.required&&!content.trim()){setNotice(`请先填写${meta.material}。`);return;}
  setBusy(true);setNotice("");const id=task;
  try{const answer=await callModel([{role:"system",content:systemPrompt},{role:"user",content:buildUserPrompt(id,{...brief,content})}],{task:id,brief:{...brief,content}});setOutputs(o=>({...o,[id]:answer}));}catch(e){showError(e);}finally{setBusy(false);}
 }
 async function send(){if(!question.trim()||busy)return;const text=question.trim();let recent=messages.slice(-8);while(recent.length&&recent.reduce((n,m)=>n+m.content.length,0)+text.length>18000)recent=recent.slice(2);const next:Message[]=[...recent,{role:"user",content:text}];setBusy(true);setNotice("");try{const answer=await callModel([{role:"system",content:chatSystem},...next],{task:"chat",messages:next});setMessages(m=>[...m,{role:"user",content:text},{role:"assistant",content:answer.content}]);setQuestion("");}catch(e){showError(e);}finally{setBusy(false);}}
 async function copy(text:string){try{await navigator.clipboard.writeText(text);setNotice("已复制。");}catch{setNotice("请选中文字后手动复制。");}}
 function download(text:string,title:string){const url=URL.createObjectURL(new Blob([`# ${title}\n\n${text}\n`],{type:"text/markdown;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=`Luran-${title}.md`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <main>
  <header className="topbar"><a className="brand" href="./"><span className="brand-icon">L</span><span>LURAN XIA<small>AI MARKETING</small></span></a><div className="header-actions"><span className="private-tag">个人营销工作台</span><a className="button secondary" href="https://github.com/Luran-XIA/luran-ai-marketing" target="_blank" rel="noreferrer">项目源码 ↗</a></div></header>
  <section className="intro"><div><p className="eyebrow">BRIEF · CREATE · REVIEW</p><h1>把需求说清，把想法落地<span>。</span></h1><p className="subtitle">从甲方需求到乙方交付，12 个常用工具，直接生成可继续修改的初稿。</p></div><div className="intro-note"><span className={connection?"dot connected":"dot"}/>{connection?"Qwen · 已连接":"AI服务准备中"}</div></section>
  <section className="toolbox" aria-label="营销工具箱"><div className="toolbox-heading"><div className="perspectives">{perspectives.map(p=><button key={p} aria-pressed={p===perspective} className={p===perspective?"selected":""} disabled={busy} onClick={()=>changePerspective(p)}>{p}</button>)}</div><span className="tool-count">{(Object.keys(tasks) as TaskId[]).filter(id=>tasks[id].perspective===perspective).length} 个工具</span></div><div className="task-tabs">{(Object.keys(tasks) as TaskId[]).filter(id=>tasks[id].perspective===perspective).map((id,i)=><button key={id} className={`task-tab ${task===id?"active":""}`} aria-pressed={task===id} onClick={()=>changeTask(id)} disabled={busy}><span className="task-number">{String(i+1).padStart(2,"0")}</span><div><strong>{tasks[id].title}</strong><p>{tasks[id].description}</p></div><span className="task-arrow">↗</span></button>)}</div></section>
  {task==="chat"?<section className="panel chat-panel" aria-busy={busy}><div className="panel-heading"><div><span className="section-index">GENERAL ASSISTANT</span><h2>想聊什么，直接问</h2></div><button className="text-button" disabled={busy||!messages.length} onClick={()=>{setMessages([]);setNotice("对话已清空。");}}>清空对话</button></div><div className="chat-messages" aria-live="polite">{!messages.length&&<div className="chat-welcome"><span>✦</span><h3>工作问题，或者一个新想法。</h3><p>可以整理材料、解释概念、协助写作，也可以接着上一轮继续问。</p><div className="suggestions">{["帮我区分营销目标与传播目标","一份好的营销 Brief 应该写什么？","帮我设计一个小规模文案测试"].map(q=><button key={q} onClick={()=>setQuestion(q)}>{q} ↗</button>)}</div></div>}{messages.map((m,i)=><article className={`chat-message ${m.role}`} key={i}><small>{m.role==="user"?"你":"Qwen"}</small><div>{m.content}</div>{m.role==="assistant"&&<button className="text-button" onClick={()=>void copy(m.content)}>复制回答</button>}</article>)}{busy&&<p className="thinking" role="status">Qwen 正在思考…</p>}<div ref={chatEnd}/></div><form className="chat-compose" onSubmit={e=>{e.preventDefault();void send();}}><textarea aria-label="聊天内容" placeholder="输入问题，支持连续追问……" value={question} onChange={e=>setQuestion(e.target.value)} maxLength={6000} rows={3}/><button className="button primary" disabled={busy||!question.trim()} type="submit">{busy?"正在回复…":"发送"}<span>↑</span></button></form><p className="input-note">刷新后清空对话；回答会参考最近 4 轮上下文。内容发送至阿里云 Qwen，请勿提交敏感资料。</p></section>:<>
  <div className="workspace"><section className="panel input-panel"><div className="panel-heading"><div><span className="section-index">{perspective} / INPUT</span><h2>{meta.title}</h2></div><button className="text-button" disabled={busy} onClick={()=>loadExample()}>填入示例 ↗</button></div><p className="panel-description">{meta.description}。填写已知信息，其余可以留给后续确认。</p><fieldset disabled={busy} className="form-fields"><label>{task==="case"?"希望借鉴的产品 / 服务":"产品定位与功能"} <span className="required">{task==="case"?"选填":"必填"}</span><textarea value={brief.product} onChange={e=>update("product",e.target.value)} placeholder="产品是什么？面向谁？有哪些功能、真实卖点、价格和限制？" rows={3} maxLength={2500}/></label><div className="two-columns"><label>目标受众<input value={brief.audience} onChange={e=>update("audience",e.target.value)} placeholder="想打动谁？" maxLength={400}/></label><label>营销目标<input value={brief.goal} onChange={e=>update("goal",e.target.value)} placeholder="希望对方采取什么行动？" maxLength={400}/></label></div><div className="two-columns"><label>主要渠道<select value={brief.platform} onChange={e=>update("platform",e.target.value)}>{platforms.map(p=><option key={p}>{p}</option>)}</select></label><label>表达风格<select value={brief.tone} onChange={e=>update("tone",e.target.value)}>{tones.map(t=><option key={t}>{t}</option>)}</select></label></div><label>{meta.material} <span className="required">{meta.required?"必填":"选填"}</span><textarea value={content} onChange={e=>setMaterials(m=>({...m,[task]:e.target.value}))} placeholder={meta.hint} rows={5} maxLength={6000}/></label></fieldset><div className="generate-row"><button className="button primary" onClick={()=>void generate()} disabled={busy}>{busy?"正在生成…":task==="case"?"分析案例":`生成${meta.title==="写营销 Brief"?"营销 Brief":meta.title.replace("写","")}`}<span>→</span></button></div><p className="input-note">资料会发送至阿里云 Qwen。案例与提案请粘贴原文，工具不会自动读取链接。</p></section>
  <section className="panel output-panel" aria-busy={busy}><div className="panel-heading"><div><span className="section-index">OUTPUT / 工作初稿</span><h2>{meta.output}</h2></div><span className="output-tag">{busy?"生成中":result?"可编辑":"等待生成"}</span></div>{result?<><textarea className="result-text" aria-label="AI生成结果，可编辑" value={result.content} onChange={e=>setOutputs(o=>({...o,[task]:{...result,content:e.target.value}}))} spellCheck={false}/><div className="result-actions"><button className="button secondary" onClick={()=>void copy(result.content)}>复制结果</button><button className="text-button" onClick={()=>download(result.content,meta.title)}>下载 Markdown ↓</button></div><p className="usage">{result.meta}</p></>:<div className="empty-output"><div className="paper-stack"><span/><span/><span>✦</span></div><h3>{busy?"正在整理你的资料…":"下一份初稿，从这里开始"}</h3><p>{busy?"Qwen 正在生成，请稍候。":"填入左侧资料，点击生成。"}<br/>缺失的预算、指标与事实，请核对确认。</p><div className="output-preview"><span>内置任务指令</span><span>保留事实边界</span><span>结果可编辑</span></div></div>}<p className="input-note">请核对产品事实、数字和承诺，AI 可能补出未提供的信息。方案与建议不代表真实营销效果。</p></section></div>
  <section className="case-library"><div className="panel-heading"><div><span className="section-index">PRACTICE CASES</span><h2>从一个案例开始拆解</h2></div><span className="private-tag">以下均为虚构练习案例</span></div><div className="case-grid">{examples.map((item,i)=><button className="case-card" key={item.title} disabled={busy} onClick={()=>loadExample(i,true)}><small>案例 0{i+1}</small><strong>{item.title}</strong><p>{item.goal}</p><span>填入案例分析 ↗</span></button>)}</div></section></>}
  {settings&&<section className="settings"><div className="settings-heading"><div><h2>个人连接设置</h2><p>仅为站长自用。密钥不会写入 GitHub 或发送至本站服务器；调用时直接发送给阿里云。</p></div><button className="text-button" onClick={()=>setSettings(false)}>收起</button></div><label>Qwen API Key<input type="password" autoComplete="off" value={keyDraft} onChange={e=>setKeyDraft(e.target.value)} placeholder="输入自己的北京地域密钥"/></label><label className="remember-key"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/>保存在此浏览器（仅限自己的设备）</label><div className="result-actions"><button className="button primary" onClick={connect} disabled={busy||!keyDraft.trim()}>连接 Qwen</button><button className="text-button" disabled={busy} onClick={disconnect}>清除本机密钥</button></div></section>}
  {notice&&<div className="notice" role="status"><span>{notice}</span><button aria-label="关闭提示" onClick={()=>setNotice("")}>×</button></div>}
  <footer><span>Built by Luran Xia <span className="footer-dot">·</span> AI 营销项目 · GitHub Pages</span><button className="text-button" disabled={busy} onClick={()=>setSettings(v=>!v)}>连接设置</button><span>把重复工作交给工具，把判断留给自己。</span></footer>
 </main>;
}
