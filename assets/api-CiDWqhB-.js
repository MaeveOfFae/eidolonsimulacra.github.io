const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-Zea3yvYJ.js","assets/react-vendor-C34M-SVW.js"])))=>i.map(i=>d[i]);
import{r as Oa,w as Ca,a as Ia,b as x,_ as dn,c as pt,d as ln,i as sr}from"./index-DzYZ7I5W.js";import{D as ne}from"./storage-vendor-CKqr1NrK.js";var un=10;function pn(t){const e=t.toLowerCase();return e.startsWith("openrouter/")?"openrouter":e.startsWith("openai/")?"openai":e.startsWith("google/")?"google":e.startsWith("anthropic/")?"anthropic":e.startsWith("deepseek/")?"deepseek":e.startsWith("zai/")?"zai":e.startsWith("moonshot")?"moonshot":e.startsWith("ollama/")?"ollama":e.startsWith("gpt-")||e.startsWith("o1")?"openai":e.startsWith("gemini")?"google":e.startsWith("claude")?"anthropic":e.startsWith("llama")||e.startsWith("mistral")||e.startsWith("codellama")||e.startsWith("vicuna")||e.startsWith("qwen")||e.startsWith("phi")||e.startsWith("gemma")||e.startsWith("starcoder")||e.includes("ollama")?"ollama":"openrouter"}function Da(t){return t.replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[\u200B-\u200D\uFEFF]/g,"").trim().replace(/^['"]+|['"]+$/g,"")}function Na(t){return!t||/[^\x20-\x7E]/.test(t)||/\r|\n/.test(t)?!0:[/^window\.fetch:/i,/cannot convert value in record<bytestring/i,/^bearer\s+window\.fetch:/i].some(e=>e.test(t))}function La(t,e,n={}){const r={};n.contentType&&(r["Content-Type"]=n.contentType),n.accept&&(r.Accept=n.accept);const a=typeof e=="string"?Da(e):void 0;if(a){if(Na(a))throw new Error("Configured API key is invalid or corrupted. Re-enter it in Settings and try again.");switch(t){case"anthropic":r["x-api-key"]=a,r["anthropic-version"]="2023-06-01";break;case"google":r["x-goog-api-key"]=a;break;default:r.Authorization=`Bearer ${a}`;break}}return t==="openrouter"&&(r["HTTP-Referer"]=typeof window<"u"?window.location.origin:"https://eidolon-simulacra.app",r["X-OpenRouter-Title"]="Eidolon Simulacra"),r}var Pa={openai:["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo","o1-preview"],google:["gemini-2.0-flash-exp","gemini-2.0-flash-thinking-exp","gemini-1.5-pro","gemini-1.5-flash"],openrouter:["anthropic/claude-3.5-sonnet","anthropic/claude-3.5-haiku","google/gemini-pro-1.5","openai/gpt-4o-mini"],anthropic:["claude-3.5-sonnet","claude-3.5-haiku","claude-3-opus"],deepseek:["deepseek-chat","deepseek-coder"],zai:["glm-4","glm-4-flash"],moonshot:["moonshot-v1-8k","moonshot-v1-32k","moonshot-v1-128k"],ollama:["llama3.2","llama3.1","mistral","codellama","qwen2.5","phi3","gemma2"]};function $a(t){return(Pa[t]||[]).map(e=>({id:e,name:e,provider:t}))}async function Ma(t,e,n,r={}){const a=La(t,e,r.includeContentTypeHeader?{contentType:"application/json"}:void 0),s=await fetch(`${n}/models`,{method:"GET",headers:a});if(!s.ok){let d=`HTTP ${s.status}`;try{const l=await s.json();typeof l.error=="string"?d=l.error:l.error?.message&&(d=l.error.message)}catch{}throw new Error(d)}const i=((await s.json()).data||[]).filter(d=>!!d?.id).map(d=>({id:d.id,name:d.name||d.id,provider:t,context_length:d.context_length,supports_vision:d.architecture?.input_modalities?.includes("image")||!1,supports_tools:d.supported_parameters?.includes("tools")||!1}));return{provider:t,models:i,cached:!1}}var Fa=/<(think|thinking|reasoning|analysis)\b[^>]*>[\s\S]*?<\/\1>/gi,Ua=/<(think|thinking|reasoning|analysis)\b[^>]*>[\s\S]*$/i,Ba=/<\/?(think|thinking|reasoning|analysis)\b[^>]*>/gi,Wa=/<[^>\n]*$/;function In(t){if(t===null)return null;if(typeof t=="string"){const e=t.replace(/\s+/g," ").trim();return e?e.length>240?`${e.slice(0,237)}...`:e:null}return String(t)}function ja(t){return typeof t=="object"&&t!==null&&!Array.isArray(t)}function Vt(t,e,n,r=0){if(n.length>=60||r>4)return;if(Array.isArray(t)){if(t.length===0)return;const s=t.map(o=>o===null||typeof o=="boolean"||typeof o=="number"||typeof o=="string"?In(o):null).filter(o=>!!o);if(s.length===t.length){n.push(`- ${e}: ${s.slice(0,8).join(", ")}`),t.length>8&&n.push(`- ${e}: (${t.length-8} more values omitted)`);return}t.slice(0,3).forEach((o,i)=>{Vt(o,`${e}[${i}]`,n,r+1)}),t.length>3&&n.push(`- ${e}: (${t.length-3} more items omitted)`);return}if(ja(t)){const s=Object.entries(t);s.slice(0,15).forEach(([o,i])=>{const d=e?`${e}.${o}`:o;Vt(i,d,n,r+1)}),s.length>15&&n.length<60&&n.push(`- ${e||"root"}: (${s.length-15} more fields omitted)`);return}const a=In(t);a&&n.push(`- ${e}: ${a}`)}function Ga(t,e){const n=t.trim();if(!n)return"";const r=e.rawTextLineLimit,a=e.rawTextCharLimit;if(!r&&!a)return t;const s=n.split(/\r?\n/).map(l=>l.trimEnd()).filter(l=>l.trim().length>0),i=(typeof r=="number"?s.slice(0,r):s).join(`
`);return typeof a!="number"||i.length<=a&&(!r||s.length<=r)?i:`${i.slice(0,a).trimEnd()}
[truncated for context]`}function kt(t){const e=t.trim(),n=e.match(/^```[^\r\n]*\r?\n([\s\S]*?)\r?\n```$/);return n?n[1]?.trim()??"":e}function Ha(t){return t.replace(Fa,"").replace(Ua,"").replace(Ba,"").replace(Wa,"")}function fn(t,e,n,r={}){const a=t.endsWith(":")?t.slice(0,-1):t,s=n.trim();if(!s)return[t,"```","","```",""];if(s.startsWith("{")||s.startsWith("["))try{const i=JSON.parse(s),d=[];if(Vt(i,"",d),d.length>0)return[`${a} (structured JSON context):`,r.jsonInstruction||"Use the extracted fields below. Do not assume access to any external file.",...d,""]}catch{}const o=Ga(n,r);return[t,"```",o,"```",""]}function or(t,e,n){if(!t||Object.keys(n).length===0)return n;const r=t.assets.find(i=>i.name===e);if(!r||r.depends_on.length===0)return{};const a=new Map(t.assets.map(i=>[i.name,i])),s=new Set,o=i=>{s.has(i)||(s.add(i),a.get(i)?.depends_on.forEach(o))};return r.depends_on.forEach(o),Object.fromEntries(Object.entries(n).filter(([i])=>s.has(i)))}function Pc(t){const e=typeof t=="string"?t:"",n=e.trim(),r=n.length===0?0:n.split(/\s+/).length;return{characters:e.length,words:r,estimatedTokens:za(e)}}function za(t){const n=(typeof t=="string"?t:"").trim();return n?Math.max(1,Math.ceil(n.length/4)):0}function Ka(t){const e=t.preserve_format!==!1,n=Number.isFinite(t.target_reduction)?Math.min(Math.max(Math.round(t.target_reduction),5),80):25,r=["You optimize text for lower token usage without removing relevant information.","Your job is compression by shortening, tightening, deduplicating, and removing bloat only.","Do not delete relevant facts, requirements, constraints, names, relationships, instructions, or semantic content.","Do not summarize away meaning.","Do not add new information.",e?"Preserve the original structure and formatting style as closely as possible unless shorter phrasing requires minimal cleanup.":"You may lightly normalize formatting when it helps shorten the text.","Prefer shorter wording, denser sentences, fewer repeated qualifiers, and less throat-clearing language.","If a phrase can be made shorter without losing meaning, shorten it.","Return only the optimized text with no commentary, labels, bullets about what changed, or code fences."].join(" "),a=[`Target reduction: about ${n}% fewer tokens if achievable without losing relevant data.`,e?"Preserve formatting where practical.":"Formatting may be normalized if needed.","","Text to optimize:",t.text].join(`
`);return[{role:"system",content:r},{role:"user",content:a}]}var ft="creator_notes",mn="intro_page",Yt="V2/V3 Card";function Va(t){return t?typeof t=="string"?t===Yt:t.name===Yt||t.assets.some(e=>e.name===ft)?!0:(t.assets.some(e=>e.name===mn),!1):!1}function Ya(t){const e=typeof t=="string"?t.trim():"";return e?e===mn?ft:e:""}function hn(t,e){const n=typeof t=="string"?t.trim():"";return n?n===mn&&Va(e)?ft:n:""}function gn(t,e){const n=[],r=new Set;for(const a of t){const s=hn(a,e);!s||r.has(s)||(r.add(s),n.push(s))}return n}function He(t,e){const n={},r=new Map;for(const[a,s]of Object.entries(t)){const o=hn(a,e);if(!o)continue;const i=r.get(o);if(!i){n[o]=s,r.set(o,a);continue}const l=(n[o]??"").trim().length>0,c=s.trim().length>0;if(i!==o&&a===o){(c||!l)&&(n[o]=s),r.set(o,a);continue}!l&&c&&(n[o]=s,r.set(o,a))}return n}var Ee={name:Yt,version:"3.1",description:"Built-in character card template with 6 standard assets",is_official:!0,assets:[{name:"system_prompt",required:!1,depends_on:[],description:"System-level behavioral instructions",blueprint_file:"blueprints/system/system_prompt.md"},{name:"post_history",required:!1,depends_on:["system_prompt"],description:"Conversation context and relationship state",blueprint_file:"blueprints/system/post_history.md"},{name:"character_sheet",required:!0,depends_on:[],description:"Structured character data",blueprint_file:"blueprints/system/character_sheet.md"},{name:"intro_scene",required:!0,depends_on:["character_sheet"],description:"First interaction scenario",blueprint_file:"blueprints/system/intro_scene.md"},{name:ft,required:!0,depends_on:["character_sheet"],description:"Creator notes section",blueprint_file:"blueprints/system/creator_notes.md"},{name:"a1111",required:!0,depends_on:["character_sheet"],description:"Stable Diffusion image generation prompt",blueprint_file:"blueprints/system/a1111.md"}]};function Ja(t){const e=t.map(o=>o.name),n=[],r=new Set,a=new Set;function s(o){if(r.has(o)||a.has(o))return;a.add(o);const i=t.find(d=>d.name===o);if(i)for(const d of i.depends_on)s(d);r.add(o),n.push(o),a.delete(o)}for(const o of e)r.has(o)||s(o);return n}function ir(t){const e=t||Ee;return Ja(e.assets).map(r=>e.assets.find(a=>a.name===r)).filter(r=>r!==void 0)}function Xa(t){const e=[];t.name||e.push("Template name is required"),(!t.assets||t.assets.length===0)&&e.push("Template must have at least one asset");const n=new Map(t.assets.map(a=>[a.name,a]));function r(a,s){for(const o of a){if(o===s)return!0;const i=n.get(o);if(i&&r(i.depends_on,s))return!0}return!1}for(const a of t.assets)r(a.depends_on,a.name)&&e.push(`Circular dependency detected for asset: ${a.name}`);return{isValid:e.length===0,errors:e}}var xt=class extends Error{constructor(t){super(t),this.name="ParseError"}},qa=["system_prompt","post_history","character_sheet","intro_scene","creator_notes","a1111"];function Qa(t){const e=/```(?:[a-z]*\n)?(.*?)```/gs,n=t.match(e);return n?n.map(r=>r.trim()):[]}function Za(t,e){const n=Qa(t);if(n.length===0)throw new xt("No codeblocks found in output");let r=0,a;n[0].trim().startsWith("Adjustment Note:")&&(a=n[0].trim(),r=1);const s=n.slice(r);let o=[];e&&e.assets.length>0?o=e.assets.map(c=>c.name):o=[...qa];const i=o.length;if(s.length!==i){const c=s.slice(0,3).map((u,f)=>`  Block ${f}: ${u.substring(0,75)}${u.length>75?"...":""}`).join(`
`);let p=`Expected ${i} asset blocks, found ${s.length}. `;throw p+=`Template requires order: ${o.join(", ")}
`,p+=`Actual blocks found:
${c}`,s.length>3&&(p+=`
  ... and ${s.length-3} more blocks`),new xt(p)}const d={};for(let c=0;c<o.length;c++)d[o[c]]=s[c];const l=os(d);if(l&&Object.keys(l).length>0){const c=Object.entries(l).map(([p,u])=>`${p}: ${Array.from(new Set(u)).join(", ")}`).join("; ");throw new xt("Generated content failed validation checks: "+c)}return{assets:d,adjustmentNote:a}}function es(t){const e=t.match(/^name:\s*(.+)$/m);return e&&e[1].trim().replace(/^['"]|['"]$/g,"")||null}function cr(t,e=["character_sheet"]){const n=[],r=new Set;for(const a of e)a in t&&!r.has(a)&&(n.push(a),r.add(a));for(const a of Object.keys(t))r.has(a)||(n.push(a),r.add(a));for(const a of n){const s=es(t[a]||"");if(s)return s}return null}var ts=[["{PLACEHOLDER}",/\{PLACEHOLDER\}/g],["Generic {...} placeholder",/(?<!\{)\{(?!\{)[^{}\n]*[A-Za-z][^{}\n]*\}(?!\})/g],["Suno {TITLE}",/\{TITLE\}/g],["Suno other {..}",/\{GENRE\}|\{STYLE\}|\{MOOD\}|\{ENERGY\}|\{TEMPO\}|\{BPM\}|\{TEXTURE\}|\{Remaster Style\}/g],["A1111 slot ((...))",/\(\(\.\.\)\)/g],["A1111 any slot ((...something...)) left",/\(\([^)]*\.\.\.[^)]*\)/g],["Character sheet bracket placeholders",/\[[A-Za-z][^\]\n]*\]/g]],ns=[["Narrates {{user}} action/thought/consent",/\{\{user\}\}\s+(?:is|was|feels?|felt|thinks?|thought|decides?|decided|knows?|knows?|wants?|wanted|says?|said|nods?|smiles?|walks?|steps?|looks?|touches?|takes?|gives?|allows?|consents?|agrees?|gasps?|moans?)\b/gi],["Narrates {{user}} internal state",/\{\{user\}\}'s\s+(?:mind|thoughts?|feelings?|emotions?|desire|consent|decision|reaction|actions?)\b/gi]],rs=/(?:never|do not|don't|avoid|without)\s+(?:narrat(?:e|ing)|describ(?:e|ing)|assign(?:ing)?)\s*$/gi,dr="character_sheet.txt";function as(t,e){const n=[];for(const[r,a]of ts)r==="Character sheet bracket placeholders"&&e!==dr||a.test(t)&&n.push(r);return n}function ss(t){const e=[];for(const[n,r]of ns)for(const a of t.matchAll(r)){const s=t.substring(Math.max(0,a.index-48),a.index).trim();if(!rs.test(s)){e.push(n);break}}return e}function lr(t,e){const n=Ya(t);let r=`${n}.txt`;n==="creator_notes"&&(r="creator_notes.md"),n==="character_sheet"&&(r=dr);const a=as(e,r);return a.push(...ss(e)),a}function os(t){const e={};for(const[n,r]of Object.entries(t)){const a=lr(n,r);a.length>0&&(e[n]=a)}return Object.keys(e).length>0?e:null}function nt(t){return typeof t.archived_at=="string"&&t.archived_at.trim().length>0}function is(t,e,n=t,r=n){const a=n.reduce((s,o)=>{s.total_drafts+=1,nt(o)&&(s.archived_drafts+=1),o.favorite&&(s.favorites+=1);const i=o.genre||"unknown",d=o.mode||"unknown";return s.by_genre[i]=(s.by_genre[i]||0)+1,s.by_mode[d]=(s.by_mode[d]||0)+1,s},{total_drafts:0,archived_drafts:r.filter(s=>nt(s)).length,favorites:0,by_genre:{},by_mode:{}});return{drafts:t,total:e,stats:a}}function cs(t,e){let n=[...t];if(e?.include_archived||(e?.archived?n=n.filter(i=>nt(i)):n=n.filter(i=>!nt(i))),e?.search){const i=e.search.toLowerCase();n=n.filter(d=>[d.character_name,d.seed,d.genre,d.notes].filter(Boolean).some(l=>String(l).toLowerCase().includes(i)))}e?.genre&&(n=n.filter(i=>i.genre===e.genre)),e?.mode&&(n=n.filter(i=>i.mode===e.mode)),e?.favorite!==void 0&&(n=n.filter(i=>i.favorite===e.favorite)),e?.tags?.length&&(n=n.filter(i=>e.tags?.every(d=>i.tags?.includes(d))));const r=e?.sort_order==="asc"?1:-1,a=e?.sort_by??"modified";n.sort((i,d)=>{const l=a==="name"?i.character_name||i.seed||"":(a==="created"?i.created:i.modified)||"",c=a==="name"?d.character_name||d.seed||"":(a==="created"?d.created:d.modified)||"";return l.localeCompare(c)*r});const s=e?.offset??0,o=e?.limit;return o!==void 0?n=n.slice(s,s+o):s>0&&(n=n.slice(s)),n}function Dn(t,e={}){const n=[],r=e.resolveTemplate?.(t.metadata.template_name)||e.fallbackTemplate||Ee;return ir(r).filter(s=>s.required).forEach(s=>{t.assets[s.name]?.trim()||n.push(`- missing required asset ${s.name}`)}),Object.entries(t.assets).forEach(([s,o])=>{if(!o.trim()){n.push(`- ${s}: asset is empty`);return}const i=lr(s,o);i.length>0&&n.push(`- ${s}: ${Array.from(new Set(i)).join(", ")}`)}),n.length===0?n.push("OK: no obvious placeholder violations found in saved assets."):n.unshift("VALIDATION FAILED"),{path:t.metadata.review_id,output:n.join(`
`),errors:"",exit_code:n[0]==="VALIDATION FAILED"?1:0,success:n[0]!=="VALIDATION FAILED"}}function Nn(t){const e=`${t.metadata.character_name||""}
${t.metadata.seed}
${Object.values(t.assets).join(`
`)}`.toLowerCase().replace(/[^a-z0-9\s]+/g," ").split(/\s+/).filter(n=>n.length>3);return new Set(e)}function ds(t){return t>=.7?"high":t>=.45?"medium":"low"}function ls(t,e){const n=Nn(t),r=Nn(e),a=[...n].filter(p=>r.has(p)),s=[...n].filter(p=>!r.has(p)),o=[...r].filter(p=>!n.has(p)),i=new Set([...n,...r]).size||1,d=a.length/i,l=Math.min(1,(s.length+o.length)/Math.max(i,1)),c=Math.min(1,d+.15);return{character1_name:t.metadata.character_name||t.metadata.seed,character2_name:e.metadata.character_name||e.metadata.seed,overall_score:d,compatibility:ds(d),conflict_potential:l,synergy_potential:c,commonalities:a.slice(0,8),differences:[...s.slice(0,4),...o.slice(0,4)],relationship_suggestions:d>=.6?["Shared themes suggest an easy alliance arc.","Overlapping traits support collaborative scenes."]:["Use the contrast between their goals for tension.","Differences suggest rivalry or uneasy partnership."],meta_analysis:{archetype_match:d,narrative_compatibility:c,audience_appeal:Math.max(d,.35)}}}function us(t){const e=new Map;t.forEach(d=>{d.parent_drafts?.forEach(l=>{const c=e.get(l)??[];c.push(d.review_id),e.set(l,c)})});const n=new Map(t.map(d=>[d.review_id,d])),r=new Map,a=d=>{if(r.has(d))return r.get(d);const l=n.get(d);if(!l?.parent_drafts?.length)return r.set(d,0),0;const c=1+Math.max(...l.parent_drafts.map(p=>a(p)));return r.set(d,c),c},s=t.map(d=>{const l=d.parent_drafts??[],c=e.get(d.review_id)??[],p=a(d.review_id),u=l.map(m=>n.get(m)?.character_name||m),f=c.map(m=>n.get(m)?.character_name||m);return{id:d.review_id,review_id:d.review_id,draft_name:d.seed,character_name:d.character_name||d.seed,generation:p,is_root:l.length===0,is_leaf:c.length===0,offspring_type:d.offspring_type,mode:d.mode,model:d.model,created:d.created,parent_ids:l,child_ids:c,parent_names:u,child_names:f,sibling_names:l.flatMap(m=>(e.get(m)??[]).filter(h=>h!==d.review_id)).map(m=>n.get(m)?.character_name||m),num_ancestors:l.length,num_descendants:c.length}}),o=s.filter(d=>d.is_root).map(d=>d.id),i=s.reduce((d,l)=>Math.max(d,l.generation),0);return{nodes:s,roots:o,max_generation:i,stats:{total_characters:s.length,root_characters:s.filter(d=>d.is_root).length,leaf_characters:s.filter(d=>d.is_leaf).length,generations:i+1}}}var ae=new Uint8Array([137,80,78,71,13,10,26,10]),Z="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";function re(t){if(typeof TextDecoder<"u")return new TextDecoder("utf-8").decode(t);let e="";for(let n=0;n<t.length;n+=1)e+=String.fromCharCode(t[n]??0);return e}function Ze(t){if(typeof TextEncoder<"u")return new TextEncoder().encode(t);const e=new Uint8Array(t.length);for(let n=0;n<t.length;n+=1)e[n]=t.charCodeAt(n)&255;return e}function rt(t){const e=t.reduce((a,s)=>a+s.length,0),n=new Uint8Array(e);let r=0;for(const a of t)n.set(a,r),r+=a.length;return n}function ps(){const t=new Uint32Array(256);for(let e=0;e<256;e+=1){let n=e;for(let r=0;r<8;r+=1)n=(n&1)===1?3988292384^n>>>1:n>>>1;t[e]=n>>>0}return t}var fs=ps();function ms(t){let e=4294967295;for(let n=0;n<t.length;n+=1)e=fs[(e^t[n])&255]^e>>>8;return(e^4294967295)>>>0}function ur(t){let e="";for(let n=0;n<t.length;n+=3){const r=t[n],a=n+1<t.length?t[n+1]:0,s=n+2<t.length?t[n+2]:0,o=r<<16|a<<8|s;e+=Z[o>>18&63],e+=Z[o>>12&63],e+=n+1<t.length?Z[o>>6&63]:"=",e+=n+2<t.length?Z[o&63]:"="}return e}function Jt(t){try{const e=t.replace(/\s+/g,""),n=Math.ceil(e.length/4)*4,r=e.padEnd(n,"="),a=[];for(let s=0;s<r.length;s+=4){const o=r[s],i=r[s+1],d=r[s+2],l=r[s+3],c=Z.indexOf(o),p=Z.indexOf(i),u=d==="="?-1:Z.indexOf(d),f=l==="="?-1:Z.indexOf(l);if(c===-1||p===-1)return null;a.push(c<<2|p>>4),u!==-1&&a.push((p&15)<<4|u>>2),u!==-1&&f!==-1&&a.push((u&3)<<6|f)}return Uint8Array.from(a)}catch{return null}}function hs(t,e){const n=Ze(t);if(n.length!==4)throw new Error(`Invalid PNG chunk type: ${t}`);const r=new Uint8Array(12+e.length),a=new DataView(r.buffer);return a.setUint32(0,e.length),r.set(n,4),r.set(e,8),a.setUint32(8+e.length,ms(rt([n,e]))),r}function gs(t){if(!Ae(t))throw new Error("Invalid PNG signature");const e=new DataView(t.buffer,t.byteOffset,t.byteLength);let n=ae.length;for(;n+12<=t.length;){const r=e.getUint32(n);if(re(t.slice(n+4,n+8))==="IEND")return n;n+=12+r}throw new Error("PNG file is missing an IEND chunk")}function _s(t){if(!Ae(t))throw new Error("Invalid PNG signature");const e=new DataView(t.buffer,t.byteOffset,t.byteLength),n=[t.slice(0,ae.length)];let r=ae.length;for(;r+12<=t.length;){const a=e.getUint32(r),s=re(t.slice(r+4,r+8)),o=r+12+a,i=t.slice(r,o);let d=!0;if(s==="tEXt"){const l=t.slice(r+8,r+8+a),c=l.indexOf(0);c!==-1&&re(l.slice(0,c))==="chara"&&(d=!1)}if(d&&n.push(i),r=o,s==="IEND")break}return rt(n)}function Ae(t){if(t.length<ae.length)return!1;for(let e=0;e<ae.length;e+=1)if(t[e]!==ae[e])return!1;return!0}function ys(t){const e=new Uint8Array(t);if(!Ae(e))return null;const n=new DataView(t);let r=ae.length;for(;r+12<=e.length;){const a=n.getUint32(r),s=re(e.slice(r+4,r+8));if(s==="tEXt"){const o=e.slice(r+8,r+8+a),i=o.indexOf(0);if(i!==-1&&re(o.slice(0,i))==="chara"){const l=o.slice(i+1),c=Jt(re(l));return c?re(c):null}}if(r+=12+a,s==="IEND")break}return null}function bs(t){return`data:image/png;base64,${ur(t)}`}function pr(t){if(typeof t!="string")return null;const e=t.trim();if(!e)return null;const n=e.match(/^data:image\/png;base64,(.+)$/i);if(n?.[1]){const a=Jt(n[1]);return a&&Ae(a)?a:null}const r=Jt(e);return r&&Ae(r)?r:null}function ws(t,e){if(!Ae(t))throw new Error("Draft image must be a valid PNG file");const n=_s(t),r=ur(Ze(e)),a=hs("tEXt",rt([Ze("chara"),new Uint8Array([0]),Ze(r)])),s=gs(n);return rt([n.slice(0,s),a,n.slice(s)])}function A(t){return typeof t=="object"&&t!==null&&!Array.isArray(t)}var vs=["eidolon","eidolon_simulacra","eidolonsimulacra"];function v(t){if(typeof t!="string")return null;const e=t.trim();return e.length>0?e:null}function be(t){return Array.isArray(t)?t.filter(e=>typeof e=="string").map(e=>e.trim()).filter(e=>e.length>0):[]}function Rt(t){return typeof t=="number"&&Number.isFinite(t)?t:void 0}function q(t){return JSON.parse(JSON.stringify(t))}function Es(t,e){if(!t&&!e)return;const n={},r=t?q(t):void 0,a=e?q(e):void 0,s=a?.avatar??r?.avatar;s&&(n.avatar=s);const o=a?.creator??r?.creator;o&&(n.creator=o);const i=a?.character_version??r?.character_version;i&&(n.character_version=i);const d=a?.depth_prompt??r?.depth_prompt;d&&(n.depth_prompt=q(d));const l=r?.chub,c=a?.chub;return(l||c)&&(n.chub={...l?q(l):{},...c?q(c):{}}),Object.keys(n).length>0?n:void 0}function Ln(t){if(!A(t))return;const e={},n=v(t.avatar);n&&(e.avatar=n);const r=v(t.creator);r&&(e.creator=r);const a=v(t.character_version);if(a&&(e.character_version=a),A(t.depth_prompt)){const s=Rt(t.depth_prompt.depth),o=v(t.depth_prompt.prompt)??"";s!==void 0&&(e.depth_prompt={depth:s,prompt:o})}if(A(t.chub)){const s={},o=Rt(t.chub.id);o!==void 0&&(s.id=o),(t.chub.preset===null||typeof t.chub.preset=="string")&&(s.preset=t.chub.preset===null?null:t.chub.preset.trim()||null);const i=v(t.chub.full_path);i&&(s.full_path=i),(t.chub.custom_css===null||typeof t.chub.custom_css=="string")&&(s.custom_css=t.chub.custom_css===null?null:t.chub.custom_css.trim()||null);const d=v(t.chub.background_image);d&&(s.background_image=d),Array.isArray(t.chub.extensions)&&(s.extensions=q(t.chub.extensions)),t.chub.expressions!==void 0&&(s.expressions=q(t.chub.expressions)),A(t.chub.alt_expressions)&&(s.alt_expressions=q(t.chub.alt_expressions)),Array.isArray(t.chub.related_lorebooks)&&(s.related_lorebooks=t.chub.related_lorebooks.filter(l=>A(l)).map(l=>{const c={},p=Rt(l.id);p!==void 0&&(c.id=p),(l.book===null||typeof l.book=="string")&&(c.book=l.book===null?null:l.book);const u=v(l.path);u&&(c.path=u);const f=v(l.version);f&&(c.version=f);const m=v(l.commit_ref);return m&&(c.commit_ref=m),c}).filter(l=>Object.keys(l).length>0)),Object.keys(s).length>0&&(e.chub=s)}return Object.keys(e).length>0?e:void 0}function As(t){return A(t.data)?[t,t.data]:[t]}function Ss(t){const e=v(t.spec),n=v(t.spec_version)??v(t.specVersion);return e==="chara_card_v2"?!0:n?n==="2"||n==="2.0"||n==="3"||n==="3.0"||n.startsWith("2.")||n.startsWith("3."):!1}function _n(t){if(!A(t.extensions))return null;for(const e of vs)if(A(t.extensions[e]))return t.extensions[e];return null}function Ot(t){return Array.isArray(t.tags)||typeof t.creator=="string"||typeof t.creator_notes=="string"||typeof t.system_prompt=="string"||typeof t.post_history_instructions=="string"||Array.isArray(t.alternate_greetings)||_n(t)!==null}function Ts(t){const e=_n(t);return!e||!A(e.assets)?{}:Object.fromEntries(Object.entries(e.assets).filter(n=>typeof n[1]=="string"&&n[1].trim().length>0).map(([n,r])=>[n,r.trim()]))}function ks(t,e){const n=_n(t),r=n&&A(n.metadata)?n.metadata:null,a={},s=(l,...c)=>{for(const p of c){const u=v(p);if(u){a[l]=u;return}}};if(r){const l=Ln(r.card_metadata??r.cardMetadata);l&&(a.card_metadata=l),s("seed",r.seed),s("model",r.model),s("created",r.created,r.createdAt),s("modified",r.modified,r.updatedAt),s("genre",r.genre),s("notes",r.notes),s("character_name",r.character_name,r.characterName),s("template_name",r.template_name,r.templateName),s("custom_instructions",r.custom_instructions,r.customInstructions),s("offspring_type",r.offspring_type,r.offspringType),(r.mode==="SFW"||r.mode==="NSFW"||r.mode==="Platform-Safe"||r.mode==="Auto")&&(a.mode=r.mode),typeof r.favorite=="boolean"&&(a.favorite=r.favorite);const c=be(r.component_send_order??r.componentSendOrder);c.length>0&&(a.component_send_order=c);const p=be(r.tags);p.length>0&&(a.tags=p)}const o=Ln({avatar:t.avatar,creator:t.creator,character_version:t.character_version,depth_prompt:A(t.extensions)?t.extensions.depth_prompt:void 0,chub:A(t.extensions)?t.extensions.chub:void 0}),i=Es(a.card_metadata,o);i&&(a.card_metadata=i);const d=be(t.tags);if(d.length>0&&(a.tags=Array.from(new Set([...a.tags??[],...d]))),!a.notes){const l=v(t.creator_notes);l&&(a.notes=l)}return a.character_name=a.character_name??e,Object.keys(a).length>0?a:void 0}function xs(t){const e=v(t.description),n=v(t.personality),r=v(t.creator_notes);return e||n||r}function Rs(t){const e=v(t.mes_example),n=v(t.post_history_instructions),r=e?at(e):null,a=n?at(n):null;return r&&a&&a!==r?["Example Dialogue","",r,"","Post-History Instructions","",a].join(`
`):r??a}function Os(t){const e=v(t.first_mes);return e||(be(t.alternate_greetings)[0]??null)}function Pn(t){if(!A(t))return"unknown";const e=As(t),n=e.some(a=>Ot(a));for(const a of e)if(Ss(a))return Ot(a)||n?"chubai":"tavernai_v2";const r=A(t.data)?t.data:t;return typeof r.description=="string"&&typeof r.first_mes=="string"&&Ot(r)?"chubai":typeof r.name=="string"&&typeof r.description=="string"&&typeof r.first_mes=="string"?"tavernai_v1":"unknown"}var Cs={description:"character_sheet",personality:"system_prompt",first_mes:"intro_scene",mes_example:"post_history",scenario:"creator_notes"},$n=["character_book","lorebook","world_info"];function at(t,e){return t.replace(/^\{\{original\}\}\s*/i,"").replace(/^<START>\s*/i,"").trim()}function se(t){if(typeof t=="string")return t.trim()||null;if(typeof t=="number"||typeof t=="boolean")return String(t);if(t==null)return null;try{return JSON.stringify(t,null,2)}catch{return null}}function Mn(t,e){if(typeof t=="string"){const d=t.trim();return d?`## Entry ${e}

${d}`:null}if(!A(t)){const d=se(t);return d?`## Entry ${e}

${d}`:null}const n=typeof t.name=="string"&&t.name.trim()?t.name.trim():typeof t.comment=="string"&&t.comment.trim()?t.comment.trim():Array.isArray(t.keys)&&t.keys.length>0?t.keys.filter(d=>typeof d=="string"&&d.trim().length>0).join(", "):`Entry ${e}`,r=[],a=Array.isArray(t.keys)?t.keys.filter(d=>typeof d=="string"&&d.trim().length>0):[],s=Array.isArray(t.secondary_keys)?t.secondary_keys.filter(d=>typeof d=="string"&&d.trim().length>0):[];a.length>0&&r.push(`Keys: ${a.join(", ")}`),s.length>0&&r.push(`Secondary Keys: ${s.join(", ")}`),typeof t.comment=="string"&&t.comment.trim()&&t.comment.trim()!==n&&r.push(`Comment: ${t.comment.trim()}`),typeof t.insertion_order=="number"&&r.push(`Insertion Order: ${t.insertion_order}`),typeof t.enabled=="boolean"&&!t.enabled&&r.push("Enabled: false");const o=typeof t.content=="string"&&t.content.trim()?t.content.trim():typeof t.entry=="string"&&t.entry.trim()?t.entry.trim():typeof t.text=="string"&&t.text.trim()?t.text.trim():null,i=[`## ${n}`];if(r.length>0&&i.push(r.join(`
`)),o)i.push(o);else{const d=se(t);d&&i.push(d)}return i.join(`

`).trim()}function fr(t,e){if(typeof e=="string")return e.trim()||null;if(Array.isArray(e)){const s=e.map((o,i)=>Mn(o,i+1)).filter(o=>!!o);return s.length>0?s.join(`

`):null}if(!A(e))return se(e);const r=[typeof e.name=="string"&&e.name.trim()?`# ${e.name.trim()}`:`# ${t.replace(/_/g," ").replace(/\b\w/g,s=>s.toUpperCase())}`];typeof e.description=="string"&&e.description.trim()&&r.push(e.description.trim());const a=Array.isArray(e.entries)?e.entries:Array.isArray(e.world_info)?e.world_info:null;if(a){const s=a.map((o,i)=>Mn(o,i+1)).filter(o=>!!o);s.length>0&&r.push(s.join(`

`))}if(r.length===1){const s=se(e);s&&r.push(s)}return r.join(`

`).trim()||null}function yn(t){const e={},n=[],r=[];for(const a of $n)t[a]!==void 0&&t[a]!==null&&r.push({key:a,value:t[a]});if(A(t.extensions))for(const a of $n)t.extensions[a]!==void 0&&t.extensions[a]!==null&&r.push({key:`extensions.${a}`,value:t.extensions[a]});return r.forEach(({key:a,value:s},o)=>{const i=fr(a,s);if(!i)return;const d=o===0?"lorebook":`lorebook_${o+1}`;e[d]=i,n.push(a.split(".")[0])}),{assets:e,sourceKeys:[...new Set(n)]}}function mr(t){return A(t.data)?{...t.data}:t}function Is(t,e){const n=e.trim();if(!n)return;const r=t[n];if(r!==void 0)return r;const a=n.split(".").filter(Boolean);if(a.length===0)return;let s=t;for(const o of a){if(!A(s)||!(o in s))return;s=s[o]}return s}function Ds(t,e){const n=t.trim().toLowerCase();if(n==="character_book"||n==="lorebook"||n==="world_info")return fr(n,e);if(n==="mes_example"||n==="system_prompt"||n==="post_history_instructions"){const r=v(e);return r?at(r):null}if(n==="alternate_greetings"&&Array.isArray(e)){const r=be(e);return r.length>0?JSON.stringify(r,null,2):null}return se(e)}function Ns(t,e){switch(t.trim().toLowerCase()){case"description":return["character_sheet"];case"system_prompt":case"personality":return["system_prompt","personality"];case"first_mes":return["intro_scene"];case"mes_example":case"post_history_instructions":return["post_history"];case"scenario":case"creator_notes":return["creator_notes","intro_page"];case"avatar":return["avatar"];case"creator":return["creator"];case"character_version":return["character_version"];case"alternate_greetings":return["alternate_greetings"];case"character_book":case"lorebook":case"world_info":{const r=yn(e).assets;return Object.keys(r).length>0?Object.keys(r):["character_book"]}case"extensions.chub":return["chub_extension"];case"extensions.depth_prompt":return["depth_prompt"];default:return[]}}function hr(t,e,n){const r=n?.template?.assets??[];if(r.length===0)return t;const a={...t.assets},s=t.unmappedFields?{...t.unmappedFields}:void 0,o=new Set(r.map(d=>d.name)),i=new Set;for(const d of r){const l=(d.import_aliases??[]).map(c=>c.trim()).filter(c=>c.length>0);if(l.length!==0)for(const c of l){const p=Is(e,c),u=Ds(c,p);if(!u)continue;a[d.name]=u;const f=Ns(c,e);for(const m of f)m!==d.name&&!o.has(m)&&i.add(m);if(s){delete s[c];const m=c.split(".")[0];delete s[m]}break}}for(const d of i)delete a[d];return{...t,assets:a,unmappedFields:s&&Object.keys(s).length>0?s:void 0}}function et(t,e="tavernai_v1",n){if(!A(t))throw new Error("Invalid TavernAI card: expected JSON object");const r=mr(t),a={},s=yn(r),o=typeof r.name=="string"?r.name.trim():"Imported Character",i=ks(r,o),d=n?.template??i?.template_name??Ee.name,l=i?{...i,...i.component_send_order?{component_send_order:gn(i.component_send_order,d)}:{}}:void 0,c=He(Ts(r),d),p=hn("intro_page",d);if(!c.character_sheet){const g=xs(r);g&&(c.character_sheet=g)}if(!c.system_prompt){const g=v(r.system_prompt)?at(v(r.system_prompt)):v(r.personality);g&&(c.system_prompt=g)}const u=v(r.personality);if(u&&u!==c.system_prompt&&!c.personality&&(c.personality=u),!c.post_history){const g=Rs(r);g&&(c.post_history=g)}if(!c.intro_scene){const g=Os(r);g&&(c.intro_scene=g)}const f=v(r.creator_notes);if(f&&!c[p]&&(c[p]=f),!c[p]){const g=v(r.scenario);g&&(c[p]=g)}const m=v(r.avatar);m&&!c.avatar&&(c.avatar=m),m&&!c.card_image&&pr(m)&&(c.card_image=m);const h=v(r.creator);h&&!c.creator&&(c.creator=h);const y=v(r.character_version);if(y&&!c.character_version&&(c.character_version=y),r.character_book!==void 0&&!c.character_book){const g=se(r.character_book);g&&(c.character_book=g)}const w=A(r.extensions)?r.extensions:null;w&&A(w.chub)&&!c.chub_extension&&(c.chub_extension=JSON.stringify(w.chub,null,2)),w&&A(w.depth_prompt)&&!c.depth_prompt&&(c.depth_prompt=JSON.stringify(w.depth_prompt,null,2));const S=be(r.alternate_greetings);S.length>0&&!c.alternate_greetings&&(c.alternate_greetings=JSON.stringify(S,null,2));for(const[g,k]of Object.entries(s.assets))c[g]||(c[g]=k);const C=new Set([...Object.keys(Cs),...s.sourceKeys,"system_prompt","post_history_instructions","creator_notes","alternate_greetings","avatar","creator","character_version","tags","extensions"]),W=new Set(["name","spec","spec_version","specVersion","data"]);for(const[g,k]of Object.entries(r)){if(W.has(g)||C.has(g))continue;const ce=se(k);ce&&(a[g]=ce)}return hr({name:o,assets:c,sourceFormat:e,sourcePreset:e==="tavernai_v2"?"TavernAI / SillyTavern V2/V3":"TavernAI / SillyTavern",unmappedFields:Object.keys(a).length>0?a:void 0,metadata:l},r,n)}function Fn(t,e){return{...et(t,"tavernai_v2",e),sourceFormat:"chubai",sourcePreset:"Chub AI"}}function Un(t,e,n){if(!A(t))throw new Error("Invalid character data: expected JSON object");const r=mr(t),a=JSON.stringify(t,null,2),s=yn(r),o=typeof r.name=="string"&&r.name.trim()?r.name.trim():typeof r.character_name=="string"&&r.character_name.trim()?r.character_name.trim():e?.replace(/\.[^.]+$/,"")||"Imported Character";return hr({name:o,assets:{character_sheet:a,...s.assets},sourceFormat:"unknown",metadata:{character_name:o}},r,n)}function Oe(t,e){const r=t.match(/^name:\s*(.+)$/m)?.[1]?.trim()||e?.replace(/\.[^.]+$/,"")||"Imported Character";return{name:r,assets:{character_sheet:t},sourceFormat:"plain_text",metadata:{character_name:r}}}function Ls(t){try{const e=JSON.parse(t);return A(e)?e:null}catch{return null}}function Ps(t){try{return JSON.parse(t)}catch{return null}}function $s(t,e,n){if(t instanceof ArrayBuffer&&t.byteLength>0){const s=ys(t);if(s){const o=Ps(s);if(o&&A(o))try{const i=Pn(o),d=i==="chubai"?Fn(o,n):i!=="unknown"?et(o,i==="tavernai_v2"?"tavernai_v2":"tavernai_v1",n):Un(o,e,n),l={...d.assets};return l.card_image||(l.card_image=bs(new Uint8Array(t))),{...d,assets:l,sourceFormat:"png_card"}}catch{}return Oe(s,e)}return Oe(`[Binary PNG file: ${e||"unknown"} — no embedded character card found]`,e)}if(typeof t!="string")return Oe("[Unsupported data format]",e);const r=t.trim();if(!r)return Oe("[Empty file]",e);const a=Ls(r);if(a)try{switch(Pn(a)){case"tavernai_v1":return et(a,"tavernai_v1",n);case"tavernai_v2":return et(a,"tavernai_v2",n);case"chubai":return Fn(a,n);case"unknown":default:return Un(a,e,n)}}catch{}return Oe(r,e)}function $c(t){switch(t){case"tavernai_v1":return"TavernAI v1";case"tavernai_v2":return"TavernAI v2 / SillyTavern";case"chubai":return"Chub AI";case"png_card":return"PNG Character Card";case"plain_text":return"Plain Text";case"unknown":default:return"Unknown Format"}}function M(t){return typeof t=="object"&&t!==null}function gr(t){if(!(t!=="SFW"&&t!=="NSFW"&&t!=="Platform-Safe"&&t!=="Auto"))return t}function Xt(t){if(!Array.isArray(t))return;const e=t.filter(n=>typeof n=="string").map(n=>n.trim()).filter(n=>n.length>0);return e.length>0?e:void 0}function Ms(t,e){if(!Array.isArray(e))return;const n=[],r=new Set;for(const a of e){if(typeof a!="string")continue;const s=a.trim();if(!(!s||s===t||r.has(s))&&(r.add(s),n.push(s),n.length>=un))break}return n.length>0?n:void 0}function L(t){if(typeof t!="string")return;const e=t.trim();return e.length>0?e:void 0}function Bn(t){return Xt(t)}function Fs(t,e){return t?t.includes(e)?t:`${t}

${e}`:e}function Q(t){return JSON.parse(JSON.stringify(t))}function Ct(t){return typeof t=="number"&&Number.isFinite(t)?t:void 0}function It(t){return t===null?null:L(t)}function Se(t){if(!M(t))return;const e={},n=L(t.avatar);n&&(e.avatar=n);const r=L(t.creator);r&&(e.creator=r);const a=L(t.character_version);if(a&&(e.character_version=a),M(t.depth_prompt)){const s=Ct(t.depth_prompt.depth),o=L(t.depth_prompt.prompt)??"";s!==void 0&&(e.depth_prompt={depth:s,prompt:o})}if(M(t.chub)){const s={},o=Ct(t.chub.id);o!==void 0&&(s.id=o);const i=It(t.chub.preset);i!==void 0&&(s.preset=i);const d=L(t.chub.full_path);d&&(s.full_path=d);const l=It(t.chub.custom_css);l!==void 0&&(s.custom_css=l);const c=L(t.chub.background_image);if(c&&(s.background_image=c),Array.isArray(t.chub.extensions)&&(s.extensions=Q(t.chub.extensions)),t.chub.expressions!==void 0&&(s.expressions=Q(t.chub.expressions)),M(t.chub.alt_expressions)&&(s.alt_expressions=Q(t.chub.alt_expressions)),Array.isArray(t.chub.related_lorebooks)){const p=t.chub.related_lorebooks.filter(u=>M(u)).map(u=>{const f={},m=Ct(u.id);m!==void 0&&(f.id=m);const h=It(u.book);h!==void 0&&(f.book=h);const y=L(u.path);y&&(f.path=y);const w=L(u.version);w&&(f.version=w);const S=L(u.commit_ref);return S&&(f.commit_ref=S),f}).filter(u=>Object.keys(u).length>0);p.length>0&&(s.related_lorebooks=p)}Object.keys(s).length>0&&(e.chub=s)}return Object.keys(e).length>0?e:void 0}function _r(t,e){if(!t&&!e)return;const n={},r=t?Q(t):void 0,a=e?Q(e):void 0,s=a?.avatar??r?.avatar;s&&(n.avatar=s);const o=a?.creator??r?.creator;o&&(n.creator=o);const i=a?.character_version??r?.character_version;i&&(n.character_version=i);const d=a?.depth_prompt??r?.depth_prompt;d&&(n.depth_prompt=Q(d));const l=r?.chub,c=a?.chub;return(l||c)&&(n.chub={...l?Q(l):{},...c?Q(c):{}}),Object.keys(n).length>0?n:void 0}function Wn(t){return t.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"character"}function yr(){return`imported-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}function bn(t,e){const n=M(t)?t:{},r=typeof n.review_id=="string"?n.review_id:typeof n.reviewId=="string"?n.reviewId:"",a=r.trim().length>0?r:yr(),s=typeof n.seed=="string"?n.seed:"",o=s.trim().length>0?s:e,i={review_id:a,seed:o,favorite:!!n.favorite};i.mode=gr(n.mode),typeof n.model=="string"&&(i.model=n.model),typeof n.created=="string"?i.created=n.created:typeof n.createdAt=="string"&&(i.created=n.createdAt),typeof n.modified=="string"?i.modified=n.modified:typeof n.updatedAt=="string"&&(i.modified=n.updatedAt),Array.isArray(n.tags)&&(i.tags=n.tags.filter(f=>typeof f=="string")),typeof n.genre=="string"&&(i.genre=n.genre),typeof n.notes=="string"&&(i.notes=n.notes),typeof n.custom_instructions=="string"?i.custom_instructions=n.custom_instructions:typeof n.customInstructions=="string"&&(i.custom_instructions=n.customInstructions);const d=Xt(n.component_send_order)??Xt(n.componentSendOrder);d&&(i.component_send_order=d),typeof n.character_name=="string"?i.character_name=n.character_name:typeof n.characterName=="string"&&(i.character_name=n.characterName),typeof n.template_name=="string"?i.template_name=n.template_name:typeof n.templateName=="string"&&(i.template_name=n.templateName);const l=Array.isArray(n.parent_drafts)?n.parent_drafts:Array.isArray(n.parentDraftIds)?n.parentDraftIds:null;l&&(i.parent_drafts=l.filter(f=>typeof f=="string"));const c=Array.isArray(n.connected_drafts)?n.connected_drafts:Array.isArray(n.connectedDraftIds)?n.connectedDraftIds:null,p=Ms(a,c);p&&(i.connected_drafts=p),typeof n.offspring_type=="string"?i.offspring_type=n.offspring_type:typeof n.offspringType=="string"&&(i.offspring_type=n.offspringType);const u=Se(n.card_metadata??n.cardMetadata);return u&&(i.card_metadata=u),i}function ze(t,e="Imported draft"){if(!M(t)||!M(t.assets))return null;const n={};for(const[i,d]of Object.entries(t.assets))typeof d=="string"&&(n[i]=d);if(Object.keys(n).length===0)return null;const r=bn(M(t.metadata)?t.metadata:t,e),a=He(n,r.template_name),s=r.component_send_order?gn(r.component_send_order,r.template_name):void 0;s&&s.length>0?r.component_send_order=s:delete r.component_send_order;const o=typeof t.path=="string"&&t.path.trim().length>0?t.path:typeof t.reviewId=="string"&&t.reviewId.trim().length>0?t.reviewId:r.review_id;return{metadata:r,assets:a,path:o}}function Us(t){if(Array.isArray(t))return t.map(n=>ze(n)).filter(n=>n!==null);if(!M(t))return[];if(Array.isArray(t.drafts))return t.drafts.map(n=>ze(n)).filter(n=>n!==null);if(M(t.draft)){const n=ze(t.draft);return n?[n]:[]}const e=ze(t);return e?[e]:[]}function Bs(t){return Array.isArray(t)?t.length===0:M(t)&&Array.isArray(t.drafts)&&t.drafts.length===0}function Ws(t){return Array.isArray(t)?!0:M(t)?Array.isArray(t.drafts)||M(t.draft)||M(t.assets)||M(t.metadata)||typeof t.reviewId=="string"||typeof t.review_id=="string":!1}function js(t){return t.trim().toLowerCase().replace(/\s+/g,"_")}function Gs(t){const n=t.match(/^#\s+(.+)$/m)?.[1]?.trim()||"Imported draft",r=/^##\s+(.+)$/gm,a=[];let s;for(;(s=r.exec(t))!==null;)a.push({title:s[1].trim(),start:s.index,bodyStart:r.lastIndex});if(a.length===0)return[];const o={};let i;for(let l=0;l<a.length;l+=1){const c=a[l],p=a[l+1],f=t.slice(c.bodyStart,p?p.start:t.length).replace(/^\n+/,"").trimEnd().replace(/^\\##/gm,"##");if(!f)continue;if(c.title.trim().toLowerCase()==="metadata"){try{i=JSON.parse(f)}catch{}continue}const m=js(c.title);o[m]=f}if(Object.keys(o).length===0)return[];const d=bn(i,n);return[{path:d.review_id,metadata:d,assets:o}]}function Hs(t,e,n){const r=yr(),a=t.name.trim()||e?.replace(/\.[^.]+$/,"")||"Imported draft",s=e?`Imported from ${e}`:`Imported draft: ${a}`,o=t.sourcePreset||t.sourceFormat,i=Object.keys(t.unmappedFields||{}).length,d=i>0?`Imported from ${o}. Preserved ${i} unmapped field${i===1?"":"s"} in the upload preview.`:`Imported from ${o}.`,l=t.metadata??{},c={review_id:r,seed:L(l.seed)??s,favorite:l.favorite===!0,character_name:L(l.character_name)??a,template_name:L(l.template_name)??n?.name??Ee.name,notes:Fs(L(l.notes),d)},p=gr(l.mode);p&&(c.mode=p);const u=L(l.model);u&&(c.model=u);const f=L(l.created);f&&(c.created=f);const m=L(l.modified);m&&(c.modified=m);const h=Bn(l.tags);h&&(c.tags=h);const y=L(l.genre);y&&(c.genre=y);const w=L(l.custom_instructions);w&&(c.custom_instructions=w);const S=L(l.offspring_type);S&&(c.offspring_type=S);const C=Bn(l.component_send_order);C&&(c.component_send_order=C);const W=Se(l.card_metadata);return W&&(c.card_metadata=W),{path:r,metadata:c,assets:t.assets}}function zs(t,e,n){const r=$s(t,e,n);return Object.keys(r.assets).length===0?[]:[Hs(r,e,n?.template)]}function Ks(t,e,n){const r=t.trim();if(!r)throw new Error("Import file is empty");let a=[],s=!1,o=!1,i;try{i=JSON.parse(r),s=Ws(i),o=Bs(i),a=Us(i)}catch{a=Gs(t)}return a.length===0&&!o&&(a=zs(t,e,n)),{drafts:a,recognizedJsonPayload:s,explicitEmptyPayload:o}}function jn(t){return t.replace(/^##/gm,"\\##")}function R(t){if(typeof t!="string")return;const e=t.trim();return e.length>0?e:void 0}function Vs(t){const e=R(t);if(e)return e.startsWith("<START>")?e:`<START>
${e}`}function we(t){const e=R(t);if(e)try{const n=JSON.parse(e);if(n&&typeof n=="object"&&!Array.isArray(n))return n}catch{}}function Gn(t){const e=R(t);return e?e.startsWith("{{original}}")?e:`{{original}}
${e}`:""}function Ys(t){const e=R(t);if(!e)return[];try{const n=JSON.parse(e);if(Array.isArray(n))return n.filter(r=>typeof r=="string").map(r=>r.trim()).filter(r=>r.length>0)}catch{}return[e]}function Js(t){const e=He(t.assets,t.metadata.template_name);return Object.fromEntries(Object.entries(e).filter(([n,r])=>n!=="card_image"&&r.trim().length>0))}function Xs(t,e){const n=[R(t.assets.card_image),R(e?.avatar),R(t.assets.avatar)];for(const r of n){const a=pr(r);if(a)return a}return null}function qs(t,e){const n=r=>{const a=r.match(/^lorebook(?:_(\d+))?$/);return a?.[1]?Number(a[1]):1};return n(t)-n(e)}function Qs(t){const e=t.trim();if(!e)return{entries:[]};const n=e.split(`
`);let r,a=0;n[0]?.startsWith("# ")&&(r=n[0].slice(2).trim()||void 0,a=1);const s=n.slice(a).join(`
`).trim(),o=/^##\s+(.+)$/gm,i=[];let d;for(;(d=o.exec(s))!==null;)i.push({title:d[1].trim(),start:d.index,bodyStart:o.lastIndex});const l=i.length>0&&s.slice(0,i[0].start).trim()||void 0;if(i.length===0)return{bookName:r,description:l,entries:[{name:r||"Entry 1",keys:[],secondary_keys:[],content:s,enabled:!0,insertion_order:10,case_sensitive:!1,priority:10,id:1,comment:"",selective:!1,constant:!1,position:"",extensions:{},probability:100,selectiveLogic:0}]};const c=i.map((p,u)=>{const f=i[u+1],h=s.slice(p.bodyStart,f?f.start:s.length).trim().split(`
`),y=h.find(P=>P.startsWith("Keys: ")),w=h.find(P=>P.startsWith("Secondary Keys: ")),S=h.find(P=>P.startsWith("Comment: ")),W=h.filter(P=>!/^Keys: |^Secondary Keys: |^Comment: /i.test(P)).join(`
`).trim(),g=y?y.slice(6).split(",").map(P=>P.trim()).filter(Boolean):[],k=w?w.slice(16).split(",").map(P=>P.trim()).filter(Boolean):[],ce=S?S.slice(9).trim():"";return{name:p.title||`Entry ${u+1}`,keys:g,secondary_keys:k,content:W,enabled:!0,insertion_order:(u+1)*10,case_sensitive:!1,priority:10,id:u+1,comment:ce,selective:!1,constant:!1,position:"",extensions:{},probability:100,selectiveLogic:0}}).filter(p=>typeof p.content=="string"&&p.content.trim().length>0);return{bookName:r,description:l,entries:c}}function Zs(t,e){const n=R(t.assets.character_book);if(n){const i=we(n);if(i)return i}const r=Object.keys(t.assets).filter(i=>/^lorebook(?:_\d+)?$/i.test(i)).sort(qs);if(r.length===0)return;let a=`${e} lorebook`,s="";const o=[];return r.forEach(i=>{const d=Qs(t.assets[i]);d.bookName&&o.length===0&&(a=d.bookName),d.description&&!s&&(s=d.description),d.entries.forEach(l=>{o.push({...l,id:o.length+1,insertion_order:(o.length+1)*10})})}),{name:a,description:s,scan_depth:2,token_budget:512,recursive_scanning:!1,extensions:{},entries:o}}function Hn(t,e){const n=Se({avatar:t.assets.avatar,creator:t.assets.creator,character_version:t.assets.character_version,depth_prompt:we(t.assets.depth_prompt),chub:we(t.assets.chub_extension)}),r=_r(n,Se(t.metadata.card_metadata)),a=R(t.assets.card_image),s=Js(t),o=R(t.metadata.character_name)??cr(t.assets)??R(t.metadata.seed)??t.metadata.review_id,i=Ys(t.assets.alternate_greetings),d=Zs(t,o),l=r?.creator??R(t.assets.creator)??"Eidolon Simulacra",c=r?.character_version??R(t.assets.character_version)??R(t.metadata.modified)??R(t.metadata.created)??"1.0",p=r?.depth_prompt??we(t.assets.depth_prompt)??{depth:0,prompt:""},u=He(t.assets,t.metadata.template_name),f=d?[{id:-1,book:null,path:"embedded",version:c,commit_ref:c}]:[],m={id:r?.chub?.id??-1,preset:r?.chub?.preset??null,full_path:r?.chub?.full_path??`${Wn(l)}/${Wn(o)}`,custom_css:r?.chub?.custom_css??null,extensions:r?.chub?.extensions??[],expressions:r?.chub?.expressions??null,alt_expressions:r?.chub?.alt_expressions??{},background_image:r?.chub?.background_image??"",related_lorebooks:r?.chub?.related_lorebooks??f},h={format:"eidolon-simulacra/v1",exported_at:new Date().toISOString(),asset_order:Object.keys(s),assets:s};e&&(h.metadata=t.metadata);const y={name:o,description:R(t.assets.character_sheet)??"",personality:R(t.assets.personality)??"",scenario:R(t.assets.scenario)??"",first_mes:R(t.assets.intro_scene)??"",avatar:r?.avatar??a??R(t.assets.avatar)??"",mes_example:Vs(t.assets.mes_example)??"",creator_notes:R(u.creator_notes)??(e?R(t.metadata.notes)??"":""),system_prompt:Gn(t.assets.system_prompt),post_history_instructions:Gn(t.assets.post_history),alternate_greetings:i,tags:e?t.metadata.tags??[]:[],creator:l,character_version:c,extensions:{chub:m,depth_prompt:p,eidolon:h}};return d&&(y.character_book=d),{spec:"chara_card_v2",spec_version:"2.0",data:y}}function eo(t,e,n=!0){if(e==="text")return{content:Object.entries(t.assets).map(([a,s])=>`## ${a}

${jn(s)}`).join(`

`),contentType:"text/plain",extension:"txt"};if(e==="combined")return{content:[`# ${t.metadata.character_name||t.metadata.seed}`,n?`## Metadata

${JSON.stringify(t.metadata,null,2)}`:"",...Object.entries(t.assets).map(([a,s])=>`## ${a}

${jn(s)}`)].filter(Boolean).join(`

`),contentType:"text/markdown",extension:"md"};if(e==="png"){const r=Se({avatar:t.assets.avatar,creator:t.assets.creator,character_version:t.assets.character_version,depth_prompt:we(t.assets.depth_prompt),chub:we(t.assets.chub_extension)}),a=_r(r,Se(t.metadata.card_metadata)),s=Xs(t,a);if(!s)throw new Error("PNG export requires a draft card image. Attach or import a PNG image for this draft first.");return{content:ws(s,JSON.stringify(Hn(t,n))),contentType:"image/png",extension:"png"}}return{content:JSON.stringify(Hn(t,n),null,2),contentType:"application/json",extension:"json"}}function to(t){return JSON.stringify({version:"1.0",exportedAt:new Date().toISOString(),drafts:t},null,2)}var Te="eidolon-simulacra",qt="1.0";function V(t){return typeof t=="object"&&t!==null&&!Array.isArray(t)}function br(t){return V(t)?Object.fromEntries(Object.entries(t).filter(e=>typeof e[1]=="string")):{}}function zn(t){if(!Array.isArray(t))return;const e=t.filter(n=>V(n)?V(n.template)&&typeof n.template.name=="string"&&typeof n.template.version=="string"&&Array.isArray(n.template.assets)&&V(n.blueprint_contents):!1).map(n=>({template:n.template,blueprint_contents:br(n.blueprint_contents),template_root:typeof n.template_root=="string"?n.template_root:void 0}));return e.length>0?e:void 0}function no(t){if(!V(t))return{platform:"web",runtime:"browser"};const e=t.platform==="desktop"||t.platform==="mobile"||t.platform==="web"?t.platform:"web",n=t.runtime==="tauri"||t.runtime==="expo"||t.runtime==="browser"?t.runtime:e==="desktop"?"tauri":e==="mobile"?"expo":"browser";return{platform:e,runtime:n}}function Mc(t,e){return{app:Te,version:qt,exportedAt:new Date().toISOString(),source:e,payload:{drafts:Array.isArray(t.drafts)?t.drafts:[],...t.config?{config:t.config}:{},...t.api_keys?{api_keys:t.api_keys}:{},...t.templates?{templates:t.templates}:{},...t.blueprint_overrides?{blueprint_overrides:t.blueprint_overrides}:{}}}}function Fc(t){let e;try{e=JSON.parse(t)}catch{throw new Error("Invalid workspace bundle JSON")}if(!V(e))throw new Error("Invalid workspace bundle payload");if(e.app!==Te)throw new Error("Unsupported workspace bundle source");if(e.version!==qt)throw new Error(`Unsupported workspace bundle version: ${String(e.version??"unknown")}`);if(!V(e.payload))throw new Error("Workspace bundle is missing payload data");const n=e.payload;return{app:Te,version:qt,exportedAt:typeof e.exportedAt=="string"?e.exportedAt:new Date().toISOString(),source:no(e.source),payload:{drafts:Array.isArray(n.drafts)?n.drafts:[],...V(n.config)?{config:n.config}:{},...V(n.api_keys)?{api_keys:n.api_keys}:{},...zn(n.templates)?{templates:zn(n.templates)}:{},...V(n.blueprint_overrides)?{blueprint_overrides:br(n.blueprint_overrides)}:{}}}}var ro="eidolon-simulacra://pair";function wr(t){const e=ao(t.url),n=so(t.pairCode),r=typeof t.deviceId=="string"?t.deviceId.trim():"",a=typeof t.name=="string"?t.name.trim():"";if(!e||!n)throw new Error("Desktop companion pairing requires both a URL and pair code.");return{url:e,pairCode:n,...r?{deviceId:r}:{},...a?{name:a}:{}}}function ao(t){return t.trim().replace(/\/+$/,"")}function so(t){return t.trim().toUpperCase()}function Uc(t){const e=wr(t),n=new URLSearchParams({url:e.url,code:e.pairCode});return e.deviceId&&n.set("deviceId",e.deviceId),e.name&&n.set("name",e.name),`${ro}?${n.toString()}`}function Bc(t){return JSON.stringify(wr(t))}var Qt="1.0";function z(t){return typeof t=="object"&&t!==null&&!Array.isArray(t)}function wn(t){return z(t)?Object.fromEntries(Object.entries(t).filter(e=>typeof e[1]=="string")):{}}function oo(t){if(!Array.isArray(t))return;const e=t.filter(n=>z(n)?z(n.template)&&typeof n.template.name=="string"&&typeof n.template.version=="string"&&Array.isArray(n.template.assets)&&z(n.blueprint_contents):!1).map(n=>({template:n.template,blueprint_contents:wn(n.blueprint_contents),template_root:typeof n.template_root=="string"?n.template_root:void 0}));return e.length>0?e:void 0}function Ke(t,e){return{available:t>0,itemCount:t,publishedAtMs:t>0?e:null}}function io(t){if(!z(t))return;const e=typeof t.deviceId=="string"?t.deviceId.trim():"",n=typeof t.name=="string"?t.name.trim():"",r=t.platform==="desktop"||t.platform==="mobile"||t.platform==="web"?t.platform:void 0,a=t.runtime==="tauri"||t.runtime==="expo"||t.runtime==="browser"?t.runtime:void 0;if(!(!e||!n||!r||!a))return{deviceId:e,name:n,platform:r,runtime:a}}function co(t,e){const n=Date.now(),r=Array.isArray(t.drafts)?t.drafts:void 0,a=Array.isArray(t.templates)?t.templates:void 0,s=t.blueprints?wn(t.blueprints):void 0,o=t.config;return{app:Te,version:Qt,exportedAt:new Date(n).toISOString(),...e?{source:e}:{},manifest:{app:Te,version:Qt,domains:{drafts:Ke(r?.length??0,n),config:Ke(o?1:0,n),templates:Ke(a?.length??0,n),blueprints:Ke(Object.keys(s??{}).length,n)}},payload:{...r?{drafts:r}:{},...o?{config:o}:{},...a?{templates:a}:{},...s&&Object.keys(s).length>0?{blueprints:s}:{}}}}function Wc(t){let e;try{e=JSON.parse(t)}catch{throw new Error("Invalid desktop companion sync JSON")}if(!z(e))throw new Error("Invalid desktop companion sync payload");if(e.app!==Te)throw new Error("Unsupported desktop companion sync source");if(e.version!==Qt)throw new Error(`Unsupported desktop companion sync version: ${String(e.version??"unknown")}`);if(!z(e.payload))throw new Error("Desktop companion sync payload is missing domain data");const n=e.payload,r=Array.isArray(n.drafts)?n.drafts:void 0,a=z(n.config)?{...z(n.config.config)?{config:n.config.config}:{},...z(n.config.api_keys)?{api_keys:n.config.api_keys}:{}}:void 0,s=oo(n.templates),o=z(n.blueprints)?wn(n.blueprints):void 0,i=io(e.source),d=co({...r?{drafts:r}:{},...a&&(a.config||a.api_keys)?{config:a}:{},...s?{templates:s}:{},...o?{blueprints:o}:{}},i);return{...d,exportedAt:typeof e.exportedAt=="string"?e.exportedAt:d.exportedAt}}function lo(t){const n=t.replace(/\\/g,"/").split("/"),r=[];for(const a of n)if(!(!a||a===".")){if(a===".."){r.length>0&&r.pop();continue}r.push(a)}return r.join("/")}function Kn(t){return lo(t.replace(/^\/+/,""))}function vr(t,e){const n=Kn(e);return n.startsWith("blueprints/")||!t?n:Kn(`${t}/${n}`)}function uo(t){return t.startsWith("blueprints/system/")?"system":t.startsWith("blueprints/examples/")?"example":t.startsWith("blueprints/templates/")?"template":"core"}function de(t){return t.trim().replace(/^"|"$/g,"")}function Dt(t){const e=[],n=/"([^"]*)"/g;let r=n.exec(t);for(;r;)e.push(r[1]),r=n.exec(t);return e}function mt(t){return t.blueprint_file??`${t.name}.md`}function Vn(t,e={}){const n={name:t.name,version:t.version,description:t.description,assets:t.assets.map(r=>({...r,depends_on:[...r.depends_on??[]]})),is_official:e.isOfficial??!1};return e.isDefault!==void 0&&(n.is_default=e.isDefault),{template:n,blueprint_contents:{...t.blueprint_contents},...e.templateRoot===void 0?{}:{template_root:e.templateRoot}}}function po(t){return{...t,template:{...t.template,assets:t.template.assets.map(e=>({...e,depends_on:[...e.depends_on??[]]}))},blueprint_contents:{...t.blueprint_contents}}}function Er(t,e){const n=mt(e),r=n.split("/").pop()??n;return t[n]??t[r]??t[e.name]}function vn(t,e={}){const n=po(t),r={};return n.template.assets.forEach(a=>{const s=mt(a),o=Er(n.blueprint_contents,a);if(!o?.trim())return;const i=e.resolveBuiltinContent?.(s);typeof i=="string"&&i===o||(r[s]=o)}),Object.entries(n.blueprint_contents).forEach(([a,s])=>{if(!s?.trim()||r[a])return;const o=e.resolveBuiltinContent?.(a);typeof o=="string"&&o===s||(r[a]=s)}),n.blueprint_contents=r,n}function Yn(t,e={}){const n=vn(t,e);return n.template.assets.forEach(r=>{const a=mt(r),s=vr(n.template_root,a);if((n.blueprint_contents[a]??n.blueprint_contents[s])?.trim())return;const i=e.resolveBuiltinContent?.(s)??e.resolveBuiltinContent?.(a);i?.trim()&&(n.blueprint_contents[a]=i)}),n}function fo(t,e,n={}){const r=t.template.assets.find(i=>i.name===e);if(!r)return;const a=mt(r),s=vr(t.template_root,a),o=t.blueprint_contents[a]??t.blueprint_contents[s]??Er(t.blueprint_contents,r);return o?.trim()?o:n.resolveBuiltinContent?.(s)??n.resolveBuiltinContent?.(a)??void 0}function mo(t){return{core:t.filter(e=>e.category==="core"),system:t.filter(e=>e.category==="system"),templates:{local:t.filter(e=>e.category==="template")},examples:t.filter(e=>e.category==="example")}}function ho(t,e){return t.assets.filter(n=>!e(n.name)).map(n=>`Missing blueprint content for ${n.name}`)}function En(t,e){if(e)return t.find(n=>n.template.name===e)}function go(t,e={}){if(e.name)return En(t,e.name)?.template;if(e.fallbackToDefault)return t.find(n=>n.template.is_default)?.template??t[0]?.template}function _o(t){const n=t.replace(/\r\n?/g,`
`).split(`
`);let r=null,a=null,s="",o="1.0.0",i="";const d=[];let l=null;for(const p of n){const u=p.trim();if(!u||u.startsWith("#"))continue;if(u==="[template]"){r="template",a=null;continue}if(u==="[[assets]]"){l={name:"",required:!1,depends_on:[],description:""},d.push(l),r="assets",a=null;continue}if(a&&l){if(u==="]"){a=null;continue}const y=Dt(u);a==="depends_on"?l.depends_on.push(...y):l.import_aliases=[...l.import_aliases??[],...y];continue}const f=u.match(/^([A-Za-z0-9_]+)\s*=\s*(.+)$/);if(!f)continue;const[,m,h]=f;if(r==="template"){m==="name"?s=de(h):m==="version"?o=de(h):m==="description"&&(i=de(h));continue}if(!(r!=="assets"||!l))if(m==="name")l.name=de(h);else if(m==="required")l.required=h.trim()==="true";else if(m==="depends_on"){const y=h.trim();y==="["?a="depends_on":l.depends_on=Dt(y)}else if(m==="import_aliases"){const y=h.trim();y==="["?a="import_aliases":l.import_aliases=Dt(y)}else m==="description"?l.description=de(h):m==="blueprint_file"&&(l.blueprint_file=de(h))}const c=d.filter(p=>p.name.trim().length>0);return!s.trim()||c.length===0?null:{name:s,version:o,description:i,is_official:!0,assets:c}}class An{config;constructor(e){this.config={temperature:.7,maxTokens:4096,timeout:18e4,...e}}async performFetch(e,n){try{return await fetch(e,n)}catch(r){throw this.normalizeRequestError(r)}}async*generateStream(e,n){const r=await this.generate(e,n);yield{content:r.content,done:!0,finishReason:r.finishReason}}getProvider(){return this.config.provider}getModel(){return this.config.model}getApiKey(){return this.config.apiKey}mergeOptions(e){return{temperature:this.config.temperature,maxTokens:this.config.maxTokens,...e}}getFetchOptions(e){const n=new AbortController,r=setTimeout(()=>n.abort(),this.config.timeout);return e?.addEventListener("abort",()=>{clearTimeout(r)}),{signal:e?yo([e,n.signal]):n.signal}}normalizeRequestError(e){return e instanceof Error&&e.name==="AbortError"?new Error("The request timed out or was cancelled. Try again, reduce the request size, or choose a faster model/provider."):e instanceof Error&&/operation was aborted/i.test(e.message)?new Error("The request timed out or was cancelled. Try again, reduce the request size, or choose a faster model/provider."):e instanceof Error?e:new Error("Request failed")}}function yo(t){const e=new AbortController;for(const n of t){if(n.aborted){e.abort();break}n.addEventListener("abort",()=>e.abort(),{once:!0})}return e.signal}class bo extends An{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||this.getDefaultBaseUrl()}getDefaultBaseUrl(){switch(this.config.provider){case"openai":return"https://api.openai.com/v1";case"openrouter":return"https://openrouter.ai/api/v1";case"deepseek":return"https://api.deepseek.com";case"zai":return"https://open.bigmodel.cn/api/paas/v4";case"moonshot":return"https://api.moonshot.cn/v1";default:return"https://api.openai.com/v1"}}getHeaders(){return this.config.baseUrl&&this.config.proxyKey?{"Content-Type":"application/json",Authorization:`Bearer ${this.config.proxyKey}`}:this.config.provider==="ollama"?{"Content-Type":"application/json"}:ot(this.config.provider,this.config.apiKey,{contentType:"application/json"})}getStreamingHeaders(){return{...this.getHeaders(),Accept:"text/event-stream"}}isDisplayContentRecord(e){const n=typeof e.type=="string"?e.type:void 0;return n?n==="text"||n==="text_delta"||n==="output_text"||n==="output_text_delta":!0}extractTextValue(e){if(typeof e=="string")return e;if(Array.isArray(e))return e.map(n=>this.extractTextValue(n)).join("");if(e&&typeof e=="object"){const n=e;if(!this.isDisplayContentRecord(n))return"";if(typeof n.text=="string")return n.text;if(n.text&&typeof n.text=="object"){const r=n.text;if(typeof r.value=="string")return r.value}if(typeof n.value=="string")return n.value;if(Array.isArray(n.parts))return this.extractTextValue(n.parts);if(typeof n.output_text=="string")return n.output_text;if(Array.isArray(n.output_text))return this.extractTextValue(n.output_text);if(typeof n.content=="string")return n.content;if(Array.isArray(n.content))return this.extractTextValue(n.content);if(typeof n.output=="string")return n.output;if(Array.isArray(n.output))return this.extractTextValue(n.output)}return""}extractChoiceMessageContent(e,n){return this.extractTextValue(e?.message?.content??e?.message?.output_text??e?.message?.parts??e?.text??n?.output_text)}extractChoiceDeltaContent(e){return this.extractTextValue(e?.delta?.content??e?.delta?.output_text??e?.delta?.parts??e?.text)}buildNoContentError(e,n){const r=n?.error;if(typeof r=="string"&&r.trim())return r;if(r&&typeof r=="object"&&typeof r.message=="string"&&r.message.trim())return r.message;const a=e?.error;if(typeof a=="string"&&a.trim())return a;if(a&&typeof a=="object"&&typeof a.message=="string"&&a.message.trim())return a.message;const s=this.extractTextValue(e?.message?.refusal??e?.delta?.refusal);if(s.trim())return s.trim();if([...Array.isArray(e?.message?.tool_calls)?e.message.tool_calls:[],...Array.isArray(e?.delta?.tool_calls)?e.delta.tool_calls:[]].length>0)return"Model returned tool calls instead of displayable text. Choose a different model or provider for plain-text responses.";switch(e?.finish_reason){case"length":return"Model exhausted its output budget before producing visible text. Increase max tokens or choose a different model.";case"content_filter":return"Provider blocked the response with content filtering.";case"error":return"Provider returned an error before producing visible text.";default:return"Provider returned no displayable text. Try a different model or increase max tokens."}}isDirectBrowserOpenAIRequest(){if(typeof window>"u"||this.config.provider!=="openai")return!1;try{return new URL(this.baseUrl).hostname==="api.openai.com"}catch{return this.baseUrl.includes("api.openai.com")}}assertBrowserSupported(){if(this.isDirectBrowserOpenAIRequest())throw new Error("Direct OpenAI requests from the browser are blocked by CORS. Use OpenRouter, or configure a custom base URL that points to your own proxy or relay.")}formatMessages(e){return e.map(n=>({role:n.role,content:n.content}))}async generate(e,n){this.assertBrowserSupported();const r=this.mergeOptions(n),a=await this.performFetch(`${this.baseUrl}/chat/completions`,{...this.getFetchOptions(n?.signal),method:"POST",headers:this.getHeaders(),body:JSON.stringify({model:this.config.model,messages:this.formatMessages(e),temperature:r.temperature,max_tokens:r.maxTokens,top_p:r.topP,frequency_penalty:r.frequencyPenalty,presence_penalty:r.presencePenalty})});if(!a.ok){const d=await this.parseError(a);throw new Error(d)}const s=await a.json(),o=s.choices[0],i=this.extractChoiceMessageContent(o,s).trim();if(!i)throw new Error(this.buildNoContentError(o,s));return{content:i,finishReason:o.finish_reason,usage:s.usage?{promptTokens:s.usage.prompt_tokens,completionTokens:s.usage.completion_tokens,totalTokens:s.usage.total_tokens}:void 0}}async*generateStream(e,n){this.assertBrowserSupported();const r=this.mergeOptions(n),a=await this.performFetch(`${this.baseUrl}/chat/completions`,{...this.getFetchOptions(n?.signal),method:"POST",headers:this.getStreamingHeaders(),body:JSON.stringify({model:this.config.model,messages:this.formatMessages(e),temperature:r.temperature,max_tokens:r.maxTokens,top_p:r.topP,frequency_penalty:r.frequencyPenalty,presence_penalty:r.presencePenalty,stream:!0})});if(!a.ok){const d=await this.parseError(a);throw new Error(d)}const s=a.body?.getReader();if(!s)throw new Error("No response body");const o=new TextDecoder;let i="";try{for(;;){const{done:d,value:l}=await s.read();if(d)break;i+=o.decode(l,{stream:!0});const c=i.split(`
`);i=c.pop()||"";for(const p of c){const u=p.trim();if(!(!u||u==="data: [DONE]")&&u.startsWith("data: "))try{const f=u.slice(6),h=JSON.parse(f).choices[0];if(!h)continue;const y=this.extractChoiceDeltaContent(h);y&&(yield{content:y,done:!1}),h.finish_reason&&(yield{content:"",done:!0,finishReason:h.finish_reason})}catch{}}}}finally{s.releaseLock()}}async testConnection(){try{this.assertBrowserSupported()}catch(n){return{success:!1,error:n instanceof Error?n.message:"Unsupported browser provider configuration"}}const e=performance.now();try{const n=await this.performFetch(`${this.baseUrl}/models`,{...this.getFetchOptions(),method:"GET",headers:this.getHeaders()}),r=performance.now()-e;if(!n.ok)return{success:!1,latency_ms:r,error:await this.parseError(n)};try{return(await n.json()).data,{success:!0,latency_ms:r,model_info:{name:this.config.model,context_length:void 0}}}catch{return{success:!0,latency_ms:r}}}catch(n){return{success:!1,error:n instanceof Error?n.message:"Unknown error"}}}async parseError(e){try{return(await e.json()).error?.message||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}const wo={system:"user",user:"user",assistant:"model"};class vo extends An{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||"https://generativelanguage.googleapis.com/v1beta"}getHeaders(){return ot("google",this.config.apiKey,{contentType:"application/json"})}formatMessages(e){const n=[];let r="";for(const a of e)a.role==="system"?r=a.content:n.push({role:wo[a.role]||a.role,parts:[{text:a.content}]});return r&&n.length>0?n[0].parts[0].text=r+`

`+n[0].parts[0].text:r&&n.unshift({role:"user",parts:[{text:r}]}),n}extractCandidateText(e){return e?.content?.parts?e.content.parts.filter(n=>n.thought!==!0).map(n=>n.text||"").join(""):""}buildNoContentError(e,n){const r=e.promptFeedback?.blockReason?.trim(),a=e.promptFeedback?.blockReasonMessage?.trim();if(r)return a?`Gemini blocked the prompt (${r}): ${a}`:`Gemini blocked the prompt (${r}).`;switch(n?.finishReason){case"MAX_TOKENS":return"Gemini exhausted its output budget before producing visible text. Increase max tokens or choose a different model.";case"SAFETY":return"Gemini blocked the response with safety filters.";case"RECITATION":return"Gemini blocked the response because it appears too close to copyrighted material.";case"LANGUAGE":return"Gemini rejected the response because of an unsupported language.";case"UNEXPECTED_TOOL_CALL":case"TOO_MANY_TOOL_CALLS":case"MALFORMED_FUNCTION_CALL":return"Gemini returned tool or function-call output instead of plain text.";case"MALFORMED_RESPONSE":return"Gemini returned a malformed response.";default:return n?.finishMessage?.trim()?`Gemini returned no displayable text: ${n.finishMessage.trim()}`:"Gemini returned no displayable text. Try a different model or increase max tokens."}}async callEndpoint(e,n,r){const a=`${this.baseUrl}${e}`;return this.performFetch(a,{...this.getFetchOptions(r),method:"POST",headers:this.getHeaders(),body:JSON.stringify(n)})}async generate(e,n){const r=this.mergeOptions(n),a=`/models/${this.config.model}:generateContent`,s={contents:this.formatMessages(e),generationConfig:{temperature:r.temperature,maxOutputTokens:r.maxTokens,topP:r.topP}},o=await this.callEndpoint(a,s,n?.signal);if(!o.ok){const c=await this.parseError(o);throw new Error(c)}const i=await o.json(),d=i.candidates?.[0],l=this.extractCandidateText(d).trim();if(!l)throw new Error(this.buildNoContentError(i,d));return{content:l,finishReason:d?.finishReason,usage:i.usageMetadata?{promptTokens:i.usageMetadata.promptTokenCount||0,completionTokens:i.usageMetadata.candidatesTokenCount||0,totalTokens:i.usageMetadata.totalTokenCount||0}:void 0}}async*generateStream(e,n){const r=this.mergeOptions(n),a=`/models/${this.config.model}:streamGenerateContent`,s={contents:this.formatMessages(e),generationConfig:{temperature:r.temperature,maxOutputTokens:r.maxTokens,topP:r.topP}},o=await this.callEndpoint(a,s,n?.signal);if(!o.ok){const c=await this.parseError(o);throw new Error(c)}const i=o.body?.getReader();if(!i)throw new Error("No response body");const d=new TextDecoder;let l="";try{for(;;){const{done:c,value:p}=await i.read();if(c)break;l+=d.decode(p,{stream:!0});const u=l.split(`
`);l=u.pop()||"";for(const f of u){const m=f.trim();if(!(!m||!m.startsWith("data: ")))try{const h=m.slice(6),w=JSON.parse(h).candidates?.[0];if(!w)continue;const S=this.extractCandidateText(w);S&&(yield{content:S,done:!1}),w.finishReason&&(yield{content:"",done:!0,finishReason:w.finishReason})}catch{}}}}finally{i.releaseLock()}}async testConnection(){const e=performance.now();try{const n=`/models/${this.config.model}:generateContent`,r={contents:[{role:"user",parts:[{text:"test"}]}],generationConfig:{maxOutputTokens:1}},a=await this.callEndpoint(n,r),s=performance.now()-e;return a.ok?{success:!0,latency_ms:s,model_info:{name:this.config.model}}:{success:!1,latency_ms:s,error:await this.parseError(a)}}catch(n){return{success:!1,error:n instanceof Error?n.message:"Unknown error"}}}async parseError(e){try{const n=await e.json();return n.error?.message||n.error?.status||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}class Eo extends An{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||"https://api.anthropic.com"}getHeaders(){return ot("anthropic",this.config.apiKey,{contentType:"application/json"})}formatMessages(e){const n=[];for(const r of e)r.role!=="system"&&n.push({role:r.role==="assistant"?"assistant":"user",content:r.content});return n}getSystemPrompt(e){return e.find(r=>r.role==="system")?.content}extractResponseText(e){return e.filter(n=>n.type==="text"&&typeof n.text=="string").map(n=>n.text).join("")}async generate(e,n){const r=this.mergeOptions(n),a=this.getSystemPrompt(e),s=this.formatMessages(e),o={model:this.config.model,messages:s,max_tokens:r.maxTokens||4096,temperature:r.temperature};a&&(o.system=a),r.topP!==void 0&&(o.top_p=r.topP);const i=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(n?.signal),method:"POST",headers:this.getHeaders(),body:JSON.stringify(o)});if(!i.ok){const c=await this.parseError(i);throw new Error(c)}const d=await i.json(),l=this.extractResponseText(d.content);if(!l)throw new Error("No text content in response");return{content:l,finishReason:d.stop_reason||void 0,usage:{promptTokens:d.usage.input_tokens,completionTokens:d.usage.output_tokens,totalTokens:d.usage.input_tokens+d.usage.output_tokens}}}async*generateStream(e,n){const r=this.mergeOptions(n),a=this.getSystemPrompt(e),s=this.formatMessages(e),o={model:this.config.model,messages:s,max_tokens:r.maxTokens||4096,temperature:r.temperature,stream:!0};a&&(o.system=a),r.topP!==void 0&&(o.top_p=r.topP);const i=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(n?.signal),method:"POST",headers:ot("anthropic",this.config.apiKey,{contentType:"application/json",accept:"text/event-stream"}),body:JSON.stringify(o)});if(!i.ok){const p=await this.parseError(i);throw new Error(p)}const d=i.body?.getReader();if(!d)throw new Error("No response body");const l=new TextDecoder;let c="";try{for(;;){const{done:p,value:u}=await d.read();if(p)break;c+=l.decode(u,{stream:!0});const f=c.split(`
`);c=f.pop()||"";for(const m of f){const h=m.trim();if(!(!h||!h.startsWith("data: ")))try{const y=h.slice(6),w=JSON.parse(y);w.type==="content_block_delta"&&w.delta?.type==="text_delta"&&w.delta?.text&&(yield{content:w.delta.text,done:!1}),w.type==="message_delta"&&w.delta?.stop_reason&&(yield{content:"",done:!0,finishReason:w.delta.stop_reason}),w.type==="message_stop"&&(yield{content:"",done:!0})}catch{}}}}finally{d.releaseLock()}}async testConnection(){const e=performance.now();try{const n=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(),method:"POST",headers:this.getHeaders(),body:JSON.stringify({model:this.config.model,messages:[{role:"user",content:"Hi"}],max_tokens:1})}),r=performance.now()-e;return n.ok?{success:!0,latency_ms:r,model_info:{name:this.config.model}}:{success:!1,latency_ms:r,error:await this.parseError(n)}}catch(n){return{success:!1,error:n instanceof Error?n.message:"Unknown error"}}}async parseError(e){try{return(await e.json()).error?.message||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}const Ce="eidolon.web.config",Ve=["bpui.web.config"],le="eidolon.web.apiKeys",Ie=["bpui.web.apiKeys"],De="eidolon.web.apiKeys.persist",Ye=["bpui.web.apiKeys.persist"],Ar="eidolon:config-changed";let B={};const Ao={generator:"blueprints/system/generator.md",rpbotgenerator:"blueprints/system/generator.md",seed_generator:"blueprints/system/seed_generator.md",offspring_generator:"blueprints/system/offspring_generator.md",lorebook_generator:"blueprints/system/lorebook_generator.md",worldbook_generator:"blueprints/system/lorebook_generator.md",intro_scene:"blueprints/system/intro_scene.md"},So=[/^window\.fetch:/i,/cannot convert value in record<bytestring/i,/^bearer\s+window\.fetch:/i];function st(t){return t.replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[\u200B-\u200D\uFEFF]/g,"").trim().replace(/^['"]+|['"]+$/g,"")}function Sr(t){return!t||/[^\x20-\x7E]/.test(t)||/\r|\n/.test(t)?!0:So.some(e=>e.test(t))}function Nt(t){return Oa(t)}function ue(t,e,n){Ca(t,e,n)}function Je(t){Ia(t)}function pe(){typeof window>"u"||window.dispatchEvent(new Event(Ar))}function J(t){return Object.fromEntries(Object.entries(t).map(([e,n])=>[e,typeof n=="string"?st(n):n]).filter(([,e])=>typeof e=="string"&&!Sr(e)).filter(([,e])=>typeof e=="string"&&e.length>0))}function Jn(t){return t&&Object.fromEntries(Object.entries(t).map(([e,n])=>typeof n!="string"||n.length===0?[e,n]:[e,Ao[n]??n]))}let fe=!1;function Lt(){return{first_run_completed:!1,show_inline_tips:!0,completed_guides:[],dismissed_tips:[],completed_tours:[]}}class To{config;options;constructor(e={}){this.options={persistApiKeys:!1,...e},fe=this.loadPersistPreference(this.options.persistApiKeys||!1),this.config=this.loadConfig(),this.loadPersistedApiKeys()}mergeConfig(e){const n=this.getDefaultConfig();return{...n,...e,batch:{...n.batch,...e.batch??{}},help:e.help?{...n.help,...e.help}:n.help,feature_blueprints:{...n.feature_blueprints,...Jn(e.feature_blueprints)??{}}}}loadPersistPreference(e){try{const n=Nt([De,...Ye]);if(n&&n.sourceKey!==De&&ue(De,Ye,n.value),n?.value==="true")return!0;if(n?.value==="false")return!1}catch{}return e}savePersistPreference(e){try{ue(De,Ye,String(e))}catch(n){console.warn("Failed to save API key persistence preference:",n)}}loadConfig(){try{const e=Nt([Ce,...Ve]);if(e){const n=this.mergeConfig(JSON.parse(e.value));return e.sourceKey!==Ce&&ue(Ce,Ve,JSON.stringify(n)),n}}catch{}return this.getDefaultConfig()}saveConfig(){try{ue(Ce,Ve,JSON.stringify(this.config)),pe()}catch(e){console.warn("Failed to save config to device storage:",e)}}getDefaultConfig(){return{engine:"openai_compatible",engine_mode:"auto",model:"openrouter/openai/gpt-4o-mini",temperature:.7,max_tokens:4096,api_keys:{},batch:{max_concurrent:3,rate_limit_delay:1},help:Lt(),feature_blueprints:{orchestration:"blueprints/system/generator.md",seed_generation:"blueprints/system/seed_generator.md",offspring_generation:"blueprints/system/offspring_generator.md",worldbook_generation:"blueprints/system/lorebook_generator.md",intro_scene_generation:"blueprints/system/intro_scene.md"}}}getConfig(){return this.mergeConfig(this.config)}getHelpState(){return{...this.config.help??Lt(),completed_guides:[...this.config.help?.completed_guides??[]],dismissed_tips:[...this.config.help?.dismissed_tips??[]],completed_tours:[...this.config.help?.completed_tours??[]]}}getApiKeys(){return J(B)}getApiKey(e){const n=B[e];return typeof n=="string"?st(n):void 0}setApiKey(e,n){const r=st(n);r?B[e]=r:delete B[e],this.persistApiKeysIfNeeded(),pe()}setApiKeys(e){B={...J(B),...J(e)},this.persistApiKeysIfNeeded(),pe()}replaceApiKeys(e){B=J(e),this.persistApiKeysIfNeeded(),pe()}clearApiKey(e){delete B[e],this.persistApiKeysIfNeeded(),pe()}clearAllApiKeys(){B={},this.persistApiKeysIfNeeded(),pe()}loadPersistedApiKeys(){if(fe)try{const e=Nt([le,...Ie]);if(e){const n=J(JSON.parse(e.value));B=n,e.sourceKey!==le&&ue(le,Ie,JSON.stringify(n))}}catch{}}persistApiKeysIfNeeded(){if(fe)try{ue(le,Ie,JSON.stringify(J(B)))}catch(e){console.warn("Failed to persist API keys:",e)}}setPersistApiKeys(e){if(fe=e,this.savePersistPreference(e),e)this.persistApiKeysIfNeeded();else try{Je([le,...Ie])}catch{}}isPersistingApiKeys(){return fe}exportApiKeys(){return JSON.stringify(J(B),null,2)}importApiKeys(e){try{const n=JSON.parse(e);B=J(n),this.persistApiKeysIfNeeded()}catch{throw new Error("Invalid API keys JSON")}}updateConfig(e){this.config=this.mergeConfig({...this.config,...e,batch:{...this.config.batch,...e.batch??{}},help:{...this.getHelpState(),...e.help??{}},feature_blueprints:{...this.config.feature_blueprints??{},...Jn(e.feature_blueprints)??{}}}),this.saveConfig()}updateHelpState(e){this.updateConfig({help:{...this.getHelpState(),...e}})}resetHelpState(){this.updateConfig({help:Lt()})}resetConfig(){this.config=this.getDefaultConfig(),this.saveConfig()}exportConfig(){const e={config:this.config,version:"1.0",exportedAt:new Date().toISOString()};return JSON.stringify(e,null,2)}importConfig(e){try{const n=JSON.parse(e);n.config&&(this.config=this.mergeConfig(n.config),this.saveConfig())}catch{throw new Error("Invalid configuration JSON")}}clearAll(){this.config=this.getDefaultConfig(),B={},fe=!1;try{Je([Ce,...Ve]),Je([le,...Ie]),Je([De,...Ye])}catch{}}}const jc=Ar,I=new To;function ko(t,e,n){if(t==="ollama")return;if(typeof e=="string"&&e.trim().length>0)return e;const r=n?.[t];return typeof r=="string"&&r.trim().length>0?r:Object.values(n??{}).find(a=>typeof a=="string"&&a.trim().length>0)}function _e(t){const{model:e,apiKey:n,apiKeys:r,provider:a,baseUrl:s,proxyKey:o,temperature:i,maxTokens:d}=t,l=a??pn(e),c={provider:l,model:e,apiKey:ko(l,n,r),baseUrl:s,proxyKey:o,temperature:i,maxTokens:d};switch(l){case"google":return new vo(c);case"anthropic":return new Eo(c);case"openai":case"openrouter":case"deepseek":case"zai":case"moonshot":case"ollama":default:return new bo(c)}}function ot(t,e,n={}){const r={};n.contentType&&(r["Content-Type"]=n.contentType),n.accept&&(r.Accept=n.accept);const a=typeof e=="string"?st(e):void 0;if(a){if(Sr(a))throw new Error("Configured API key is invalid or corrupted. Re-enter it in Settings and try again.");switch(t){case"anthropic":r["x-api-key"]=a,r["anthropic-version"]="2023-06-01";break;case"google":r["x-goog-api-key"]=a;break;default:r.Authorization=`Bearer ${a}`;break}}return t==="openrouter"&&(r["HTTP-Referer"]=typeof window<"u"?window.location.origin:"https://eidolon-simulacra.app",r["X-OpenRouter-Title"]="Eidolon Simulacra"),r}function xo(t){switch(t){case"openai":return"https://api.openai.com/v1";case"google":return"https://generativelanguage.googleapis.com/v1beta";case"openrouter":return"https://openrouter.ai/api/v1";case"anthropic":return"https://api.anthropic.com";case"deepseek":return"https://api.deepseek.com";case"zai":return"https://open.bigmodel.cn/api/paas/v4";case"moonshot":return"https://api.moonshot.cn/v1";case"ollama":return"http://localhost:11434/v1";default:return"https://api.openai.com/v1"}}const Ro={openai:["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo","o1-preview"],google:["gemini-2.0-flash-exp","gemini-2.0-flash-thinking-exp","gemini-1.5-pro","gemini-1.5-flash"],openrouter:["anthropic/claude-3.5-sonnet","anthropic/claude-3.5-haiku","google/gemini-pro-1.5","openai/gpt-4o-mini"],anthropic:["claude-3.5-sonnet","claude-3.5-haiku","claude-3-opus"],deepseek:["deepseek-chat","deepseek-coder"],zai:["glm-4","glm-4-flash"],moonshot:["moonshot-v1-8k","moonshot-v1-32k","moonshot-v1-128k"],ollama:["llama3.2","llama3.1","mistral","codellama","qwen2.5","phi3","gemma2"]},Zt="eidolon-lore.db",Oo=`sqlite:${Zt}`,Co="eidolon-lore-sqlite-snapshot.json",Io="eidolon-simulacra-lore.json";let Pt=null,$t=null;function Do(){if(!x())throw new Error("Local lore persistence is only available in the self-contained desktop runtime.")}function ke(t){return`${t}-${Date.now()}-${Math.random().toString(36).slice(2,10)}`}function H(){return new Date().toISOString()}function Tr(t){if(!t)return{};try{const e=JSON.parse(t);return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}catch{return{}}}async function No(){return Pt||(Pt=dn(()=>import("./vendor-Zea3yvYJ.js").then(t=>t.b6),__vite__mapDeps([0,1]))),Pt}async function T(){return Do(),$t||($t=(async()=>(await No()).default.load(Oo))()),$t}async function j(t,e,n,r){const a=new Map;if(r.length===0)return a;const s=r.map((i,d)=>`$${d+1}`).join(", "),o=await t.select(`SELECT ${n} AS ownerId, tag, sort_order AS sortOrder FROM ${e} WHERE ${n} IN (${s}) ORDER BY ${n} ASC, sort_order ASC`,r);for(const i of o){const d=a.get(i.ownerId)??[];d.push(i.tag),a.set(i.ownerId,d)}return a}async function U(t,e,n,r,a){await t.execute(`DELETE FROM ${e} WHERE ${n} = $1`,[r]);for(const[s,o]of a.entries())await t.execute(`INSERT INTO ${e} (${n}, tag, sort_order) VALUES ($1, $2, $3)`,[r,o,s])}function Sn(t,e,n){return{id:t.id,userId:"local-desktop",name:t.name,description:t.description||void 0,genre:t.genre||void 0,setting:t.setting||void 0,notes:t.notes||void 0,tags:n??[],isPublic:!1,createdAt:t.createdAt,updatedAt:t.updatedAt,_count:e}}function ht(t){return{id:t.id,worldId:t.worldId,draftId:t.draftId||void 0,characterName:t.characterName,role:t.role||void 0,notes:t.notes||void 0,createdAt:t.createdAt,updatedAt:t.updatedAt}}function gt(t,e){return{id:t.id,worldId:t.worldId,name:t.name,description:t.description||void 0,role:t.role||void 0,notes:t.notes||void 0,tags:e??[],createdAt:t.createdAt,updatedAt:t.updatedAt}}function _t(t,e){return{id:t.id,worldId:t.worldId,name:t.name,description:t.description||void 0,category:t.category||void 0,notes:t.notes||void 0,tags:e??[],createdAt:t.createdAt,updatedAt:t.updatedAt}}function Tn(t,e=0,n){return{id:t.id,worldId:t.worldId,userId:"local-desktop",name:t.name,description:t.description||void 0,startDate:t.startDate||void 0,endDate:t.endDate||void 0,tags:n??[],createdAt:t.createdAt,updatedAt:t.updatedAt,_count:{events:e}}}function yt(t,e){return{id:t.id,timelineId:t.timelineId,title:t.title,description:t.description||void 0,eventDate:t.eventDate||void 0,sortOrder:t.sortOrder,tags:e??[],metadata:Tr(t.metadataJson),createdAt:t.createdAt,updatedAt:t.updatedAt}}async function Lo(t){const e=await T(),n=[],r=[];t?.search?.trim()&&(n.push("(name LIKE $1 OR description LIKE $1 OR notes LIKE $1)"),r.push(`%${t.search.trim()}%`)),t?.genre?.trim()&&(n.push(`genre = $${r.length+1}`),r.push(t.genre.trim()));const a=`
    SELECT
      worlds.id,
      worlds.name,
      worlds.description,
      worlds.genre,
      worlds.setting,
      worlds.notes,
      worlds.created_at AS createdAt,
      worlds.updated_at AS updatedAt,
      (SELECT COUNT(*) FROM world_characters WHERE world_id = worlds.id) AS characterCount,
      (SELECT COUNT(*) FROM timelines WHERE world_id = worlds.id) AS timelineCount,
      (SELECT COUNT(*) FROM world_factions WHERE world_id = worlds.id) AS factionCount,
      (SELECT COUNT(*) FROM world_locations WHERE world_id = worlds.id) AS locationCount
    FROM worlds
    ${n.length>0?`WHERE ${n.join(" AND ")}`:""}
    ORDER BY worlds.updated_at DESC
  `,s=await e.select(a,r),o=await j(e,"world_tags","world_id",s.map(i=>i.id));return{worlds:s.map(i=>Sn(i,{characters:Number(i.characterCount??0),timelines:Number(i.timelineCount??0),factions:Number(i.factionCount??0),locations:Number(i.locationCount??0)},o.get(i.id)))}}async function it(t){const e=await T(),r=(await e.select("SELECT id, name, description, genre, setting, notes, created_at AS createdAt, updated_at AS updatedAt FROM worlds WHERE id = $1 LIMIT 1",[t]))[0];if(!r)throw new Error("World not found");const[a,s,o,i]=await Promise.all([e.select("SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters WHERE world_id = $1 ORDER BY updated_at DESC",[t]),e.select("SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions WHERE world_id = $1 ORDER BY updated_at DESC",[t]),e.select("SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations WHERE world_id = $1 ORDER BY updated_at DESC",[t]),e.select("SELECT id, world_id AS worldId, name, description, start_date AS startDate, end_date AS endDate, created_at AS createdAt, updated_at AS updatedAt FROM timelines WHERE world_id = $1 ORDER BY updated_at DESC",[t])]),[d,l,c,p]=await Promise.all([j(e,"world_tags","world_id",[t]),j(e,"world_faction_tags","faction_id",s.map(f=>f.id)),j(e,"world_location_tags","location_id",o.map(f=>f.id)),j(e,"timeline_tags","timeline_id",i.map(f=>f.id))]),u=new Map;if(i.length>0){const f=i.map((h,y)=>`$${y+1}`).join(", ");(await e.select(`SELECT timeline_id AS timelineId, COUNT(*) AS eventCount FROM timeline_events WHERE timeline_id IN (${f}) GROUP BY timeline_id`,i.map(h=>h.id))).forEach(h=>u.set(h.timelineId,Number(h.eventCount??0)))}return{world:{...Sn(r,{characters:a.length,timelines:i.length,factions:s.length,locations:o.length},d.get(t)),characters:a.map(ht),factions:s.map(f=>gt(f,l.get(f.id))),locations:o.map(f=>_t(f,c.get(f.id))),timelines:i.map(f=>Tn(f,u.get(f.id)??0,p.get(f.id)))}}}async function Po(t){const e=await T(),n=ke("world"),r=H();return await e.execute("INSERT INTO worlds (id, name, description, genre, setting, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",[n,t.name.trim(),t.description?.trim()||null,t.genre?.trim()||null,t.setting?.trim()||null,t.notes?.trim()||null,r,r]),await U(e,"world_tags","world_id",n,t.tags??[]),it(n)}async function $o(t,e){const n=await it(t),r=typeof e.name=="string"?e.name.trim():n.world.name,a=typeof e.description=="string"?e.description.trim()||null:n.world.description??null,s=typeof e.genre=="string"?e.genre.trim()||null:n.world.genre??null,o=typeof e.setting=="string"?e.setting.trim()||null:n.world.setting??null,i=typeof e.notes=="string"?e.notes.trim()||null:n.world.notes??null,d=Array.isArray(e.tags)?e.tags.filter(c=>typeof c=="string"):n.world.tags,l=await T();return await l.execute("UPDATE worlds SET name = $1, description = $2, genre = $3, setting = $4, notes = $5, updated_at = $6 WHERE id = $7",[r,a,s,o,i,H(),t]),await U(l,"world_tags","world_id",t,d),it(t)}async function Mo(t){const e=await T(),n=await e.select("SELECT id FROM timelines WHERE world_id = $1",[t]);for(const r of n)await e.execute("DELETE FROM timeline_events WHERE timeline_id = $1",[r.id]);return await e.execute("DELETE FROM timelines WHERE world_id = $1",[t]),await e.execute("DELETE FROM world_characters WHERE world_id = $1",[t]),await e.execute("DELETE FROM world_faction_tags WHERE faction_id IN (SELECT id FROM world_factions WHERE world_id = $1)",[t]),await e.execute("DELETE FROM world_factions WHERE world_id = $1",[t]),await e.execute("DELETE FROM world_location_tags WHERE location_id IN (SELECT id FROM world_locations WHERE world_id = $1)",[t]),await e.execute("DELETE FROM world_locations WHERE world_id = $1",[t]),await e.execute("DELETE FROM world_tags WHERE world_id = $1",[t]),await e.execute("DELETE FROM worlds WHERE id = $1",[t]),{message:"World deleted"}}async function Fo(t,e){const n=await T(),r=ke("char"),a=H();await n.execute("INSERT INTO world_characters (id, world_id, draft_id, character_name, role, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",[r,t,e.draftId??null,e.characterName.trim(),e.role?.trim()||null,e.notes?.trim()||null,a,a]);const s=await n.select("SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters WHERE id = $1 LIMIT 1",[r]);return{character:ht(s[0])}}async function Uo(t,e,n){const r=await T(),s=(await r.select("SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters WHERE id = $1 AND world_id = $2 LIMIT 1",[e,t]))[0];if(!s)throw new Error("Character not found");const o=typeof n.characterName=="string"?n.characterName.trim():s.characterName,i=typeof n.role=="string"?n.role.trim()||null:s.role??null,d=typeof n.notes=="string"?n.notes.trim()||null:s.notes??null,l=typeof n.draftId=="string"?n.draftId.trim()||null:s.draftId??null;await r.execute("UPDATE world_characters SET draft_id = $1, character_name = $2, role = $3, notes = $4, updated_at = $5 WHERE id = $6 AND world_id = $7",[l,o,i,d,H(),e,t]);const c=await r.select("SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters WHERE id = $1 LIMIT 1",[e]);return{character:ht(c[0])}}async function Bo(t,e){return await(await T()).execute("DELETE FROM world_characters WHERE id = $1 AND world_id = $2",[e,t]),{message:"Character removed"}}async function Wo(t,e){const n=await T(),r=ke("faction"),a=H();await n.execute("INSERT INTO world_factions (id, world_id, name, description, role, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",[r,t,e.name.trim(),e.description?.trim()||null,e.role?.trim()||null,e.notes?.trim()||null,a,a]),await U(n,"world_faction_tags","faction_id",r,e.tags??[]);const s=await n.select("SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions WHERE id = $1 LIMIT 1",[r]);return{faction:gt(s[0],e.tags??[])}}async function jo(t,e,n){const r=await T(),s=(await r.select("SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions WHERE id = $1 AND world_id = $2 LIMIT 1",[e,t]))[0];if(!s)throw new Error("Faction not found");const o=typeof n.name=="string"?n.name.trim():s.name,i=typeof n.description=="string"?n.description.trim()||null:s.description??null,d=typeof n.role=="string"?n.role.trim()||null:s.role??null,l=typeof n.notes=="string"?n.notes.trim()||null:s.notes??null,c=Array.isArray(n.tags)?n.tags.filter(u=>typeof u=="string"):[];await r.execute("UPDATE world_factions SET name = $1, description = $2, role = $3, notes = $4, updated_at = $5 WHERE id = $6 AND world_id = $7",[o,i,d,l,H(),e,t]),await U(r,"world_faction_tags","faction_id",e,c);const p=await r.select("SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions WHERE id = $1 LIMIT 1",[e]);return{faction:gt(p[0],c)}}async function Go(t,e){const n=await T();return await n.execute("DELETE FROM world_faction_tags WHERE faction_id = $1",[e]),await n.execute("DELETE FROM world_factions WHERE id = $1 AND world_id = $2",[e,t]),{message:"Faction removed"}}async function Ho(t,e){const n=await T(),r=ke("location"),a=H();await n.execute("INSERT INTO world_locations (id, world_id, name, description, category, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",[r,t,e.name.trim(),e.description?.trim()||null,e.category?.trim()||null,e.notes?.trim()||null,a,a]),await U(n,"world_location_tags","location_id",r,e.tags??[]);const s=await n.select("SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations WHERE id = $1 LIMIT 1",[r]);return{location:_t(s[0],e.tags??[])}}async function zo(t,e,n){const r=await T(),s=(await r.select("SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations WHERE id = $1 AND world_id = $2 LIMIT 1",[e,t]))[0];if(!s)throw new Error("Location not found");const o=typeof n.name=="string"?n.name.trim():s.name,i=typeof n.description=="string"?n.description.trim()||null:s.description??null,d=typeof n.category=="string"?n.category.trim()||null:s.category??null,l=typeof n.notes=="string"?n.notes.trim()||null:s.notes??null,c=Array.isArray(n.tags)?n.tags.filter(u=>typeof u=="string"):[];await r.execute("UPDATE world_locations SET name = $1, description = $2, category = $3, notes = $4, updated_at = $5 WHERE id = $6 AND world_id = $7",[o,i,d,l,H(),e,t]),await U(r,"world_location_tags","location_id",e,c);const p=await r.select("SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations WHERE id = $1 LIMIT 1",[e]);return{location:_t(p[0],c)}}async function Ko(t,e){const n=await T();return await n.execute("DELETE FROM world_location_tags WHERE location_id = $1",[e]),await n.execute("DELETE FROM world_locations WHERE id = $1 AND world_id = $2",[e,t]),{message:"Location removed"}}async function Vo(t){const e=await T(),n=ke("timeline"),r=H();return await e.execute("INSERT INTO timelines (id, world_id, name, description, start_date, end_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",[n,t.worldId,t.name.trim(),t.description?.trim()||null,t.startDate?.trim()||null,t.endDate?.trim()||null,r,r]),await U(e,"timeline_tags","timeline_id",n,t.tags??[]),ct(n)}async function ct(t){const e=await T(),r=(await e.select("SELECT id, world_id AS worldId, name, description, start_date AS startDate, end_date AS endDate, created_at AS createdAt, updated_at AS updatedAt FROM timelines WHERE id = $1 LIMIT 1",[t]))[0];if(!r)throw new Error("Timeline not found");const a=await e.select("SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events WHERE timeline_id = $1 ORDER BY sort_order ASC, created_at ASC",[t]),[s,o]=await Promise.all([j(e,"timeline_tags","timeline_id",[t]),j(e,"timeline_event_tags","event_id",a.map(i=>i.id))]);return{timeline:{...Tn(r,a.length,s.get(t)),events:a.map(i=>yt(i,o.get(i.id)))}}}async function Yo(t,e){const n=await ct(t),r=await T(),a=typeof e.name=="string"?e.name.trim():n.timeline.name,s=typeof e.description=="string"?e.description.trim()||null:n.timeline.description??null,o=typeof e.startDate=="string"?e.startDate.trim()||null:n.timeline.startDate??null,i=typeof e.endDate=="string"?e.endDate.trim()||null:n.timeline.endDate??null,d=Array.isArray(e.tags)?e.tags.filter(l=>typeof l=="string"):n.timeline.tags;return await r.execute("UPDATE timelines SET name = $1, description = $2, start_date = $3, end_date = $4, updated_at = $5 WHERE id = $6",[a,s,o,i,H(),t]),await U(r,"timeline_tags","timeline_id",t,d),ct(t)}async function Jo(t){const e=await T();return await e.execute("DELETE FROM timeline_event_tags WHERE event_id IN (SELECT id FROM timeline_events WHERE timeline_id = $1)",[t]),await e.execute("DELETE FROM timeline_events WHERE timeline_id = $1",[t]),await e.execute("DELETE FROM timeline_tags WHERE timeline_id = $1",[t]),await e.execute("DELETE FROM timelines WHERE id = $1",[t]),{message:"Timeline deleted"}}async function Xo(t,e){const n=await T(),r=ke("event"),a=H(),s=await n.select("SELECT COUNT(*) AS eventCount FROM timeline_events WHERE timeline_id = $1",[t]),o=typeof e.sortOrder=="number"?e.sortOrder:Number(s[0]?.eventCount??0);await n.execute("INSERT INTO timeline_events (id, timeline_id, title, description, event_date, sort_order, metadata_json, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",[r,t,e.title.trim(),e.description?.trim()||null,e.eventDate?.trim()||null,o,JSON.stringify(e.metadata??{}),a,a]),await U(n,"timeline_event_tags","event_id",r,e.tags??[]);const i=await n.select("SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events WHERE id = $1 LIMIT 1",[r]);return{event:yt(i[0],e.tags??[])}}async function qo(t,e,n){const r=await T(),s=(await r.select("SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events WHERE id = $1 AND timeline_id = $2 LIMIT 1",[e,t]))[0];if(!s)throw new Error("Timeline event not found");const o=typeof n.title=="string"?n.title.trim():s.title,i=typeof n.description=="string"?n.description.trim()||null:s.description??null,d=typeof n.eventDate=="string"?n.eventDate.trim()||null:s.eventDate??null,l=typeof n.sortOrder=="number"?n.sortOrder:s.sortOrder,c=Array.isArray(n.tags)?n.tags.filter(f=>typeof f=="string"):[],p=n.metadata&&typeof n.metadata=="object"&&!Array.isArray(n.metadata)?n.metadata:Tr(s.metadataJson);await r.execute("UPDATE timeline_events SET title = $1, description = $2, event_date = $3, sort_order = $4, metadata_json = $5, updated_at = $6 WHERE id = $7 AND timeline_id = $8",[o,i,d,l,JSON.stringify(p),H(),e,t]),await U(r,"timeline_event_tags","event_id",e,c);const u=await r.select("SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events WHERE id = $1 LIMIT 1",[e]);return{event:yt(u[0],c)}}async function Qo(t,e){const n=await T();return await n.execute("DELETE FROM timeline_event_tags WHERE event_id = $1",[e]),await n.execute("DELETE FROM timeline_events WHERE id = $1 AND timeline_id = $2",[e,t]),{message:"Timeline event deleted"}}async function Gc(){const t=await T(),[e,n,r,a,s,o]=await Promise.all([t.select("SELECT COUNT(*) AS count FROM worlds"),t.select("SELECT COUNT(*) AS count FROM world_characters"),t.select("SELECT COUNT(*) AS count FROM world_factions"),t.select("SELECT COUNT(*) AS count FROM world_locations"),t.select("SELECT COUNT(*) AS count FROM timelines"),t.select("SELECT COUNT(*) AS count FROM timeline_events")]);return{backend:"desktop-app-data",fileName:Zt,locationLabel:`AppConfig/${Zt}`,worldCount:Number(e[0]?.count??0),characterCount:Number(n[0]?.count??0),factionCount:Number(r[0]?.count??0),locationCount:Number(a[0]?.count??0),timelineCount:Number(s[0]?.count??0),eventCount:Number(o[0]?.count??0)}}async function Zo(){const t=await T(),[e,n,r,a,s,o]=await Promise.all([t.select("SELECT id, name, description, genre, setting, notes, created_at AS createdAt, updated_at AS updatedAt FROM worlds ORDER BY updated_at DESC"),t.select("SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters ORDER BY updated_at DESC"),t.select("SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions ORDER BY updated_at DESC"),t.select("SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations ORDER BY updated_at DESC"),t.select("SELECT id, world_id AS worldId, name, description, start_date AS startDate, end_date AS endDate, created_at AS createdAt, updated_at AS updatedAt FROM timelines ORDER BY updated_at DESC"),t.select("SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events ORDER BY updated_at DESC")]),[i,d,l,c,p]=await Promise.all([j(t,"world_tags","world_id",e.map(u=>u.id)),j(t,"world_faction_tags","faction_id",r.map(u=>u.id)),j(t,"world_location_tags","location_id",a.map(u=>u.id)),j(t,"timeline_tags","timeline_id",s.map(u=>u.id)),j(t,"timeline_event_tags","event_id",o.map(u=>u.id))]);return{fileName:Co,contents:JSON.stringify({version:1,worlds:e.map(u=>Sn(u,void 0,i.get(u.id))),characters:n.map(ht),factions:r.map(u=>gt(u,d.get(u.id))),locations:a.map(u=>_t(u,l.get(u.id))),timelines:s.map(u=>Tn(u,0,c.get(u.id))),events:o.map(u=>yt(u,p.get(u.id)))},null,2)}}async function Hc(){const t=await Zo(),e=JSON.parse(t.contents);return JSON.stringify({version:"1.0",exportedAt:new Date().toISOString(),...e},null,2)}async function ei(){const t=await T();await t.execute("DELETE FROM timeline_event_tags"),await t.execute("DELETE FROM timeline_events"),await t.execute("DELETE FROM timeline_tags"),await t.execute("DELETE FROM timelines"),await t.execute("DELETE FROM world_location_tags"),await t.execute("DELETE FROM world_locations"),await t.execute("DELETE FROM world_faction_tags"),await t.execute("DELETE FROM world_factions"),await t.execute("DELETE FROM world_characters"),await t.execute("DELETE FROM world_tags"),await t.execute("DELETE FROM worlds")}async function zc(t,e={}){const n=JSON.parse(t),r=Array.isArray(n.worlds)?n.worlds:[],a=Array.isArray(n.characters)?n.characters:[],s=Array.isArray(n.factions)?n.factions:[],o=Array.isArray(n.locations)?n.locations:[],i=Array.isArray(n.timelines)?n.timelines:[],d=Array.isArray(n.events)?n.events:[],l=await T();await l.execute("BEGIN");try{e.mode==="replace"&&await ei();for(const c of r)await l.execute("INSERT INTO worlds (id, name, description, genre, setting, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description, genre = excluded.genre, setting = excluded.setting, notes = excluded.notes, updated_at = excluded.updated_at",[c.id,c.name,c.description??null,c.genre??null,c.setting??null,c.notes??null,c.createdAt,c.updatedAt]),await U(l,"world_tags","world_id",c.id,c.tags??[]);for(const c of a)await l.execute("INSERT INTO world_characters (id, world_id, draft_id, character_name, role, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET world_id = excluded.world_id, draft_id = excluded.draft_id, character_name = excluded.character_name, role = excluded.role, notes = excluded.notes, updated_at = excluded.updated_at",[c.id,c.worldId,c.draftId??null,c.characterName,c.role??null,c.notes??null,c.createdAt,c.updatedAt]);for(const c of s)await l.execute("INSERT INTO world_factions (id, world_id, name, description, role, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET world_id = excluded.world_id, name = excluded.name, description = excluded.description, role = excluded.role, notes = excluded.notes, updated_at = excluded.updated_at",[c.id,c.worldId,c.name,c.description??null,c.role??null,c.notes??null,c.createdAt,c.updatedAt]),await U(l,"world_faction_tags","faction_id",c.id,c.tags??[]);for(const c of o)await l.execute("INSERT INTO world_locations (id, world_id, name, description, category, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET world_id = excluded.world_id, name = excluded.name, description = excluded.description, category = excluded.category, notes = excluded.notes, updated_at = excluded.updated_at",[c.id,c.worldId,c.name,c.description??null,c.category??null,c.notes??null,c.createdAt,c.updatedAt]),await U(l,"world_location_tags","location_id",c.id,c.tags??[]);for(const c of i)await l.execute("INSERT INTO timelines (id, world_id, name, description, start_date, end_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET world_id = excluded.world_id, name = excluded.name, description = excluded.description, start_date = excluded.start_date, end_date = excluded.end_date, updated_at = excluded.updated_at",[c.id,c.worldId,c.name,c.description??null,c.startDate??null,c.endDate??null,c.createdAt,c.updatedAt]),await U(l,"timeline_tags","timeline_id",c.id,c.tags??[]);for(const c of d)await l.execute("INSERT INTO timeline_events (id, timeline_id, title, description, event_date, sort_order, metadata_json, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT(id) DO UPDATE SET timeline_id = excluded.timeline_id, title = excluded.title, description = excluded.description, event_date = excluded.event_date, sort_order = excluded.sort_order, metadata_json = excluded.metadata_json, updated_at = excluded.updated_at",[c.id,c.timelineId,c.title,c.description??null,c.eventDate??null,c.sortOrder,JSON.stringify(c.metadata??{}),c.createdAt,c.updatedAt]),await U(l,"timeline_event_tags","event_id",c.id,c.tags??[]);await l.execute("COMMIT")}catch(c){try{await l.execute("ROLLBACK")}catch{}throw c}return{worlds:r.length,timelines:i.length,events:d.length}}function Kc(){return Io}const kr=`# Blueprints\r
\r
This directory contains the system blueprints, runtime template manifests, and example blueprints used by the current browser template system.\r
\r
## Layout\r
\r
\`\`\`text\r
blueprints/\r
├── system/                    # Canonical system blueprints\r
│   ├── generator.md\r
│   ├── offspring_generator.md\r
│   ├── seed_generator.md\r
│   ├── system_prompt.md\r
│   ├── post_history.md\r
│   ├── character_sheet.md\r
│   ├── intro_scene.md\r
│   ├── creator_notes.md\r
│   ├── intro_page.md          # Legacy alias retained for compatibility\r
│   └── a1111.md\r
├── templates/                 # Template manifests\r
│   ├── official_v2v3/\r
│   │   └── template.toml\r
└── examples/                  # Alternate/example blueprints\r
\`\`\`\r
\r
The built-in V2/V3 asset blueprints live under \`blueprints/system/\` alongside the orchestrators.\r
\r
Template manifests reference these canonical system paths instead of maintaining template-local copies.\r
\r
The browser Seed Generator also uses \`blueprints/system/seed_generator.md\` as its canonical runtime prompt.\r
\r
## Built-in Runtime Templates\r
\r
The checked-in runtime template catalog currently carries one built-in template family under \`blueprints/templates/\`.\r
\r
### V2/V3 Card\r
\r
This remains the default built-in template used by the browser generation flow. Its asset set is:\r
\r
1. \`system_prompt\`\r
2. \`post_history\`\r
3. \`character_sheet\`\r
4. \`intro_scene\`\r
5. \`creator_notes\`\r
6. \`a1111\`\r
\r
\`suno\` is not part of the current official default.\r
\r
## Related Reference Material\r
\r
The repo also contains Aksho reference material under \`dev/official_aksho/\`.\r
\r
- That folder includes its own \`template.toml\` plus template-local asset blueprints.\r
- It is useful for reference or future integration work.\r
- It is not the current built-in browser template manifest loaded from \`blueprints/templates/\`.\r
\r
## Template Manifests\r
\r
Each template directory under \`blueprints/templates/\` contains a \`template.toml\` manifest describing:\r
\r
- template name and version\r
- asset names\r
- dependency order via \`depends_on\`\r
- blueprint file paths for each asset\r
\r
The built-in runtime template currently lives under \`blueprints/templates/official_v2v3/\`.\r
\r
## Resolution Order\r
\r
When a template references blueprint files, resolution happens in this order:\r
\r
1. Template-local path declared in \`template.toml\`\r
2. Relative path from the template directory\r
3. Another blueprint under \`blueprints/\`\r
4. Example blueprint under \`blueprints/examples/\`\r
\r
The seed generation workflow note at \`rules/workflows/seed-gen-list.md\` is operator guidance, not the runtime prompt source.\r
\r
Current starter examples under \`blueprints/examples/\` include:\r
\r
- \`generic_system_prompt.md\`\r
- \`generic_post_history.md\`\r
- \`generic_character_sheet.md\`\r
- \`generic_intro_scene.md\`\r
- \`generic_creator_notes.md\`\r
- \`generic_intro_page.md\` (legacy alias)\r
- \`generic_initial_message.md\`\r
- \`a1111_sdxl_comfyui.md\`\r
\r
## Editing Rules\r
\r
- Keep formats asset-specific; do not normalize different asset outputs into one house style\r
- Respect the dependency chain; downstream assets should not introduce facts upstream assets would need\r
- Replace placeholders in generated output, but keep placeholder syntax inside blueprint source when the blueprint expects substitution later\r
- Treat the orchestrator and template manifests as part of the generation contract\r
- Check \`rules/60_blueprint_hard_rules.md\` before changing official blueprint formats\r
- The browser app is currently client-side, but the blueprint contract still needs to stay strict because shared parsing and validation code depends on it\r
- If you are editing Aksho reference files under \`dev/official_aksho/\`, do not describe them as active built-in runtime assets unless the implementation is wired up first\r
\r
## Adding a Template\r
\r
1. Create \`blueprints/templates/<template_name>/template.toml\`\r
2. Declare assets and \`depends_on\` edges explicitly\r
3. Point each asset at the appropriate blueprint file, typically under \`blueprints/system/\` unless the template needs a template-specific file\r
4. Keep filenames and output formats aligned with the validator and export flow\r
`,xr=`---\r
name: A1111_SDXL_ComfyUI\r
description: SDXL-first modular prompt blueprint compatible with AUTOMATIC1111 and ComfyUI.\r
version: 4.0\r
invokable: true\r
always: false\r
feature_category: generation\r
---\r
\r
# SDXL Prompt Blueprint (AUTOMATIC1111 + ComfyUI)\r
\r
Produce the image prompt using the **SDXL Modular Character Prompt Template** below.\r
\r
Output rules (strict):\r
\r
- Replace **all** \`((...))\` slots with concrete text derived from the seed (no placeholders left behind).\r
- Set \`[Content: SFW|NSFW]\` to match the orchestrator content mode when present (default **NSFW**).\r
- SDXL prefers **descriptive phrases / short sentences** over long tag soups. Use commas to separate phrases.\r
- Keep prompts **tight**. Prefer 1–3 lines of meaningful description over long “quality tag” dumps.\r
- Use weights sparingly. See weighting rules per UI.\r
\r
---\r
\r
## Why this version is different (SDXL-first)\r
\r
SDXL responds best to:\r
- clear subject + setting + lighting + style phrased in natural language,\r
- fewer generic “masterpiece/best quality” spam terms,\r
- concise negatives focused on real failure modes (hands, watermark, blur).\r
\r
---\r
\r
## 🧩 CONTROL TEMPLATE (UI-agnostic)\r
\r
\`\`\`plaintext\r
[Control]\r
[Title: Character Portrait]\r
[Model: SDXL]\r
[Content: SFW|NSFW]\r
\r
[Subject: ((subject)), ((age descriptor)), ((role/occupation)), ((heritage/phenotype))]\r
[Identity: ((core look)), ((signature detail)), ((hair/eyes)), ((wardrobe/materials))]\r
[Pose: ((pose/framing)), ((gesture/hand action)), ((body language))]\r
[Expression: ((emotion)), ((microexpression)), ((gaze direction))]\r
[Action: ((what they are doing)), ((prop interaction))]\r
[Setting: ((environment)), ((time/weather)), ((background story cue))]\r
[Lighting: ((lighting style)), ((key light direction)), ((color temperature))]\r
[Camera: ((shot type)), ((lens/feel)), ((depth of field))]\r
[Style: ((medium/render)), ((genre aesthetic)), ((palette bias)), ((texture/grain))]\r
[Safety: ((sfw/nsfw constraints in plain language))]\r
[Notes: ((anything critical that must not change))]\r
\r
[Recommended SDXL Base Size]\r
1024x1024 (or 832x1216 / 1216x832)\r
\r
[Sampler/CFG Suggestions]\r
- Start: DPM++ 2M Karras (or similar), 25–35 steps\r
- CFG: 4.5–7 (lower for realism, higher for stylized)\r
- If using SDXL Refiner: switch around 0.75–0.85 of steps\r
\`\`\`\r
\r
---\r
\r
## ✅ AUTOMATIC1111 — SDXL Prompt Output\r
\r
> Use A1111’s normal Prompt / Negative Prompt fields.\r
> A1111 **normalizes** weights across tokens; moderate weights are usually enough.\r
\r
\`\`\`plaintext\r
[A1111 Positive Prompt]\r
((subject)), ((age descriptor)), ((role/occupation)), ((heritage/phenotype)).\r
((core look)), ((signature detail)). ((hair/eyes)). ((wardrobe/materials)).\r
((pose/framing)), ((gesture/hand action)), ((body language)).\r
((emotion)), ((microexpression)), ((gaze direction)).\r
((what they are doing)), ((prop interaction)).\r
In/at ((environment)) during ((time/weather)); ((background story cue)).\r
((lighting style)), key light from ((key light direction)), ((color temperature)).\r
((shot type)), ((lens/feel)), shallow depth of field.\r
((medium/render)), ((genre aesthetic)), ((palette bias)), ((texture/grain)).\r
((sfw/nsfw constraints in plain language)).\r
((a1111_lora_tags))\r
\r
[A1111 Negative Prompt]\r
low quality, blurry, out of focus, jpeg artifacts,\r
bad anatomy, bad proportions, deformed, distorted,\r
extra limbs, extra fingers, missing fingers, malformed hands,\r
text, watermark, signature, logo,\r
overexposed, underexposed, muddy colors, oversaturated,\r
((sfw_negative_extras))\r
\`\`\`\r
\r
### A1111 Weighting rules (SDXL)\r
- Prefer **no weights** unless fixing a specific issue.\r
- If needed: keep to ~\`1.05–1.30\` (example: \`((signature detail:1.15))\`).\r
- Don’t weight *everything*. Pick one or two critical phrases.\r
\r
### A1111 LoRA usage\r
- Use: \`<lora:((lora_name)):((lora_strength))>\`\r
- Keep strengths conservative for SDXL: \`0.5–0.9\` unless the LoRA author says otherwise.\r
- Put LoRA tags in \`((a1111_lora_tags))\` (can be empty).\r
\r
---\r
\r
## ✅ ComfyUI — SDXL Prompt Output\r
\r
> ComfyUI uses **raw** weights (no A1111 normalization). If you port prompts from A1111, reduce weights.\r
> Put these into your **CLIP Text Encode (Prompt)** and **CLIP Text Encode (Negative)** nodes.\r
\r
\`\`\`plaintext\r
[ComfyUI Positive Prompt]\r
((subject)), ((age descriptor)), ((role/occupation)), ((heritage/phenotype)),\r
((core look)), ((signature detail)), ((hair/eyes)), ((wardrobe/materials)),\r
((pose/framing)), ((gesture/hand action)), ((body language)),\r
((emotion)), ((microexpression)), ((gaze direction)),\r
((what they are doing)), ((prop interaction)),\r
((environment)), ((time/weather)), ((background story cue)),\r
((lighting style)), key light from ((key light direction)), ((color temperature)),\r
((shot type)), ((lens/feel)), shallow depth of field,\r
((medium/render)), ((genre aesthetic)), ((palette bias)), ((texture/grain)),\r
((sfw/nsfw constraints in plain language)),\r
((comfy_trigger_words))\r
\r
[ComfyUI Negative Prompt]\r
low quality, blurry, out of focus, jpeg artifacts,\r
bad anatomy, bad proportions, deformed, distorted,\r
extra limbs, extra fingers, missing fingers, malformed hands,\r
text, watermark, signature, logo,\r
overexposed, underexposed, muddy colors, oversaturated,\r
((sfw_negative_extras))\r
\`\`\`\r
\r
### ComfyUI Weighting rules (SDXL)\r
- Prefer **no weights** unless you’re correcting a failure.\r
- If needed: keep to ~\`1.02–1.20\`. Example: \`(signature detail:1.10)\`.\r
- Avoid square-bracket downweighting reliance; prefer \`(term:0.90)\` explicitly.\r
\r
### ComfyUI Embeddings (Textual Inversion)\r
- Put embedding files in \`ComfyUI/models/embeddings/\`\r
- Invoke as: \`embedding:((embedding_name))\`\r
- You can weight it: \`(embedding:((embedding_name)):1.10)\`\r
\r
### ComfyUI LoRAs\r
- Use a **Load LoRA** node (or equivalent) and set:\r
  - \`strength_model\` ~ \`0.5–0.9\`\r
  - \`strength_clip\` ~ \`0.5–1.0\` (start equal to model strength)\r
- If the LoRA requires a trigger word, add it in \`((comfy_trigger_words))\`.\r
\r
---\r
\r
## 🧼 SFW / NSFW handling\r
\r
- If \`[Content: SFW]\`, set:\r
  - \`((sfw_negative_extras)) = nude, naked, explicit, porn, fetish, nipples, genitalia\`\r
  - and keep \`((sfw/nsfw constraints in plain language))\` like: “fully clothed, no nudity, PG-13”\r
- If \`[Content: NSFW]\`, set:\r
  - \`((sfw_negative_extras)) =\` *(empty)*\r
  - and put the explicit intent **only** in the positive constraints line (example: “adult nude boudoir photo, explicit nudity”).  \r
    (If you’re using a safety-filtered checkpoint, you may need an NSFW-capable SDXL model for consistent results.)\r
\r
---\r
\r
## 🧠 Category Library (Reference only)\r
\r
### Subject\r
- 1 woman / 1 man / androgynous adult / couple / group portrait\r
- “adult” / “young adult” / “mature adult” (avoid ambiguous age wording)\r
\r
### Camera\r
- close-up portrait, head-and-shoulders\r
- medium shot, waist-up\r
- full-body, dynamic pose\r
- 35mm cinematic, 85mm portrait lens feel\r
- shallow depth of field, creamy bokeh\r
\r
### Lighting\r
- soft window light, morning\r
- golden hour rim light\r
- dramatic chiaroscuro, moody shadows\r
- neon spill light, rainy reflections\r
- candlelight, warm intimate glow\r
\r
### Style / Texture\r
- photorealistic editorial photo, subtle film grain\r
- painterly realism, visible brush texture\r
- anime-inspired clean shading (use SDXL anime checkpoints/LoRAs)\r
- low-contrast film look / high-contrast noir\r
- matte skin highlights / glossy latex reflections\r
\r
---\r
\r
## ⚙️ Usage example (SDXL-ready)\r
\r
\`\`\`plaintext\r
[Subject: adult woman, solo, nightclub singer, Mediterranean]\r
[Identity: sharp bob haircut, smoky eyeliner, black velvet dress, silver ring]\r
[Pose: waist-up portrait, one hand on mic stand, relaxed shoulders]\r
[Expression: confident half-smile, direct gaze]\r
[Setting: smoky jazz bar, late night, blurred crowd]\r
[Lighting: warm key light, soft rim light, amber tones]\r
[Camera: cinematic medium shot, 85mm portrait feel, shallow DOF]\r
[Style: photoreal editorial, subtle film grain, rich blacks]\r
[Safety: SFW, fully clothed, no nudity]\r
\`\`\`\r
\r
---\r
`,Rr=`---\r
name: Generic Character Sheet\r
description: Starter blueprint for a parser-friendly character sheet with explicit fields.\r
invokable: true\r
always: false\r
version: 1.0\r
feature_category: generation\r
---\r
\r
# Blueprint Agent\r
\r
You are the Blueprint Agent.\r
\r
When invoked with a single SEED, generate a complete character sheet using the exact structure below.\r
\r
Hard Rules:\r
\r
- Use the field names exactly as written.\r
- Fill every placeholder with concrete content.\r
- Keep entries concise and specific.\r
- Show traits through behavior and consequence rather than vague labels.\r
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe).\r
- Do not assign or narrate {{user}} thoughts, feelings, actions, dialogue, decisions, or consent.\r
- Plaintext only.\r
- Output ONLY the finished sheet inside a single plaintext code block.\r
\r
Character Sheet Template:\r
\r
\`\`\`text\r
name: [Character Name]\r
age: [Age]\r
occupation: [Occupation]\r
heritage: [Heritage]\r
\r
Core Concept:\r
[One sentence capturing role and central tension.]\r
\r
Appearance:\r
- Physical features: [Concrete details]\r
- Style: [Clothing and presentation]\r
- Distinguishing features: [Marks, posture, habits]\r
- Demeanor around {{user}}: [Observable shift]\r
\r
Personality:\r
[Short paragraph on behavior, tone, and decision-making.]\r
\r
Strengths:\r
- [Strength]\r
- [Strength]\r
- [Strength]\r
\r
Flaws:\r
- [Flaw]\r
- [Flaw]\r
- [Flaw]\r
\r
History:\r
[Short paragraph covering the most shaping events only.]\r
\r
Motivations:\r
- [Motivation]\r
- [Motivation]\r
- [Motivation]\r
\r
Fears:\r
- [Fear]\r
- [Fear]\r
- [Fear]\r
\r
Relationship Dynamic with {{user}}:\r
- Dynamic: [Relational posture]\r
- Connection: [What they seek or provide]\r
- Conflict: [Primary tension]\r
- Repair Pattern: [How ruptures are handled]\r
\r
Behavior Guidelines:\r
- [Invariant rule]\r
- [Invariant rule]\r
- [Invariant rule]\r
\`\`\`\r
\r
Failure Conditions:\r
\r
If any placeholder is left unresolved, fields are renamed, or the sheet collapses into a different house format, it has failed.\r
`,Or=`---\r
name: Generic Creator Notes\r
description: Starter blueprint for clean Markdown creator notes.\r
invokable: true\r
always: false\r
version: 1.0\r
feature_category: generation\r
---\r
\r
# Creator Notes\r
\r
Use this blueprint to produce a single Markdown snippet that can serve as clear, readable creator notes for the character.\r
\r
Hard Rules:\r
\r
- Replace every placeholder with concrete content.\r
- Keep the writing specific to the generated character; do not reuse stock names or examples.\r
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe).\r
- Do not narrate {{user}} thoughts, feelings, actions, dialogue, decisions, or consent.\r
- Output ONLY the finished creator notes inside a single markdown code block.\r
\r
Template:\r
\r
\`\`\`md\r
# {CHARACTER NAME}\r
\r
## Summary\r
{One-paragraph role and emotional hook.}\r
\r
## Appearance\r
{Concrete visual description.}\r
\r
## Personality\r
{Behavioral description focused on how they come across in interaction.}\r
\r
## Background\r
{Short third-person history focused on formative pressure points.}\r
\r
## Motivations\r
{What they want, what they avoid, and what keeps them moving.}\r
\r
## Dynamic With {{user}}\r
{How they relate to {{user}} without scripting {{user}}.}\r
\`\`\`\r
\r
Failure Conditions:\r
\r
If any placeholder remains, sections are omitted, or the notes turn into prose without headings, it has failed.`,Cr=`---\r
name: Generic Initial Message\r
description: Starter blueprint for a first message or opening post addressed to the user.\r
invokable: true\r
always: false\r
version: 1.0\r
feature_category: intro_scene_generation\r
---\r
\r
# Blueprint Agent\r
\r
When invoked with a single SEED, produce an initial message that introduces {{char}} through voice, situation, and subtext.\r
\r
Hard Rules:\r
\r
- Treat the message as the first thing {{char}} says or presents to {{user}}.\r
- Keep it self-contained and immediately playable.\r
- Do not narrate {{user}} thoughts, feelings, actions, dialogue, decisions, or consent.\r
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe).\r
- Favor concrete voice and implied context over exposition dumps.\r
- End with a natural opening that makes reply easy.\r
- Plaintext only.\r
- Output ONLY the finished initial message inside a single plaintext code block.\r
\r
Functional Intent:\r
\r
- Establish voice and current situation fast.\r
- Convey relational posture toward {{user}}.\r
- Signal the main tension, need, or temptation in the scene.\r
- Invite immediate interaction without overexplaining backstory.\r
\r
Failure Conditions:\r
\r
If the message reads like a synopsis, overexplains the lore, or scripts {{user}} into a fixed response, it has failed.\r
`,Ir=`---\r
name: Generic Creator Notes\r
description: Starter blueprint for clean Markdown creator notes.\r
invokable: true\r
always: false\r
version: 1.0\r
feature_category: generation\r
---\r
\r
# Creator Notes\r
\r
Use this blueprint to produce a single Markdown snippet that can serve as clear, readable creator notes for the character.\r
\r
Hard Rules:\r
\r
- Replace every placeholder with concrete content.\r
- Keep the writing specific to the generated character; do not reuse stock names or examples.\r
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe).\r
- Do not narrate {{user}} thoughts, feelings, actions, dialogue, decisions, or consent.\r
- Output ONLY the finished creator notes inside a single markdown code block.\r
\r
Template:\r
\r
\`\`\`md\r
# {CHARACTER NAME}\r
\r
## Summary\r
{One-paragraph role and emotional hook.}\r
\r
## Appearance\r
{Concrete visual description.}\r
\r
## Personality\r
{Behavioral description focused on how they come across in interaction.}\r
\r
## Background\r
{Short third-person history focused on formative pressure points.}\r
\r
## Motivations\r
{What they want, what they avoid, and what keeps them moving.}\r
\r
## Dynamic With {{user}}\r
{How they relate to {{user}} without scripting {{user}}.}\r
\`\`\`\r
\r
Failure Conditions:\r
\r
If any placeholder remains, sections are omitted, or the notes turn into prose without headings, it has failed.\r
`,Dr=`---\r
name: Generic Intro Scene\r
description: Starter blueprint for an opening scene that invites response without forcing user action.\r
invokable: true\r
always: false\r
version: 1.0\r
feature_category: intro_scene_generation\r
---\r
\r
# Blueprint Agent\r
\r
When invoked with a single SEED, write a complete intro scene that opens on a concrete moment already in motion.\r
\r
Hard Rules:\r
\r
- Use second-person framing consistently.\r
- Do not narrate {{user}} thoughts, feelings, actions, dialogue, decisions, or consent.\r
- Keep the scene grounded in specific sensory detail rather than summary.\r
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe).\r
- Balance action, dialogue, and observation; do not dump exposition.\r
- End with an open conversational or emotional hook that invites a response from {{user}}.\r
- Plaintext only.\r
- Output ONLY the finished intro scene inside a single plaintext code block.\r
\r
Scene Beats:\r
\r
1. Establish a specific place, time, and emotional atmosphere.\r
2. Show {{char}} doing something that reveals habit, tension, or personality before fully engaging {{user}}.\r
3. Mark the moment {{char}} notices {{user}} with a small but telling reaction.\r
4. Give {{char}} an opening line that implies subtext, familiarity, or friction.\r
5. Let the scene pivot toward the central tension or desire.\r
6. End on an open loop rather than a closed conclusion.\r
\r
Failure Conditions:\r
\r
If the scene rushes, becomes generic cinematic montage, or forces {{user}} into a scripted reaction, it has failed.\r
`,Nr=`---\r
name: Generic Post History\r
description: Minimal starter blueprint for relationship-state and ongoing behavior rules.\r
invokable: true\r
always: false\r
version: 1.0\r
feature_category: generation\r
---\r
\r
# Blueprint Agent\r
\r
You are the Blueprint Agent.\r
\r
When invoked with a single SEED, generate a concise post-history layer that defines the current relational state between {{char}} and {{user}} and how that state shapes ongoing interaction.\r
\r
Hard Rules:\r
\r
- Keep the output under 250 tokens.\r
- Paragraphs only. No bullet points, numbered lists, or headers in the output.\r
- Focus on present behavioral posture, not backstory recap.\r
- Use {{original}} only to extend or refine an existing post-history layer; never overwrite or negate it.\r
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe).\r
- Do not assign or narrate {{user}} thoughts, feelings, actions, dialogue, decisions, or consent.\r
- Plaintext only.\r
- Output ONLY the finished post-history text inside a single plaintext code block.\r
\r
Functional Intent:\r
\r
- Establish the baseline dynamic with {{user}}.\r
- Define escalation, withdrawal, and repair behavior.\r
- Lock continuity expectations for future scenes.\r
- Reinforce the character's habits without repeating their full biography.\r
\r
Failure Conditions:\r
\r
If the output turns into story prose, reintroduces full character lore, or dictates {{user}} behavior, it has failed.\r
`,Lr=`---\r
name: Generic System Prompt\r
description: Minimal starter blueprint for a concise in-character system prompt.\r
invokable: true\r
always: false\r
version: 1.0\r
feature_category: generation\r
---\r
\r
# Blueprint Agent\r
\r
You are the Blueprint Agent.\r
\r
When invoked with a single SEED, generate a compact system prompt that locks the character's identity, voice, and behavioral rules without overexplaining them.\r
\r
Hard Rules:\r
\r
- Keep the output under 250 tokens.\r
- Paragraphs only. No bullet points, numbered lists, or headers in the output.\r
- Write in plain language that can be used directly as an instruction layer.\r
- Preserve flaws, contradictions, and pressure points implied by the seed.\r
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe).\r
- Do not mention prompts, blueprints, metadata, or formatting instructions in-character.\r
- Do not assign or narrate {{user}} thoughts, feelings, actions, dialogue, decisions, or consent.\r
- Plaintext only.\r
- Output ONLY the finished system prompt inside a single plaintext code block.\r
\r
Functional Intent:\r
\r
- Establish stable identity and role.\r
- Define default interaction style and emotional logic.\r
- Set non-negotiable boundaries and behavioral invariants.\r
- Leave room for scene-level variation without losing character consistency.\r
\r
Failure Conditions:\r
\r
If the output becomes generic assistant prose, narrates {{user}}, contradicts the seed, or bloats into biography, it has failed.\r
`,Pr=`---\r
name: A1111\r
description: Five-field Danbooru-tag prompt layout for image generation. Adapted for SDXL dual-encoder (ComfyUI / Illustrious).\r
invokable: true\r
always: false\r
version: 2.2\r
feature_category: generation\r
---\r
\r
# A1111 Tag Prompt Layout\r
\r
You generate only the \`a1111\` image prompt asset for the current character.\r
\r
## Output Contract\r
\r
- Return exactly 5 lines of raw plaintext.\r
- No code fences, headings, labels, bullets, commentary, or blank lines.\r
- Each line must be comma-separated booru-style visual tags.\r
- Keep tags compact and image-oriented, not sentence-like.\r
- Never leave placeholders such as \`((...))\`, \`[Subject: ...]\`, \`SFW|NSFW\`, or \`TAGNAME\`.\r
\r
### Line Order\r
\r
1. person\r
2. clothes\r
3. location\r
4. action\r
5. anchor\r
\r
## Asset Scope\r
\r
- Generate only the image prompt.\r
- Do not regenerate or summarize \`system_prompt\`, \`post_history\`, \`character_sheet\`, \`intro_scene\`, or \`creator_notes\`.\r
- The current character is the only visible subject unless the active asset context explicitly requires more.\r
- Use the character sheet as the primary source of visible identity, clothing, species, props, and scene-relevant traits.\r
- References may influence visible motifs, insignia, keepsakes, scars, setting details, or mood, but they must not create extra visible people by default.\r
\r
## Tag Rules\r
\r
- Prefer common Danbooru or booru-compatible tags.\r
- If an exact tag is uncertain, choose a simpler common visual tag instead of inventing a fake tag or leaving a placeholder.\r
- Omit redundant synonyms.\r
- Keep all five lines internally coherent around one character concept and one scene read.\r
- Favor visible traits over abstract lore that would not show up in the frame.\r
\r
## Line Goals\r
\r
### 1. Person\r
\r
Include subject count, apparent age, role or archetype, species or heritage cues, body read, and the strongest visual identity signals.\r
\r
### 2. Clothes\r
\r
Include outfit silhouette, materials, palette, accessories, and any defining wearable motifs.\r
\r
### 3. Location\r
\r
Include environment type, time, weather, lighting source, and scene mood cues.\r
\r
### 4. Action\r
\r
Include pose, facial expression, gesture, prop interaction, and framing-relevant motion.\r
\r
### 5. Anchor\r
\r
Include render style, palette bias, emotional tone, camera feel, texture, and broad scene-category tags. Put scene-category tags at the very end of this line.\r
\r
## Mode Rules\r
\r
- Respect the active content mode.\r
- \`Platform-Safe\` must remain visually non-explicit.\r
- Do not add explicit anatomy or fetish tags unless the provided context clearly requires them and the active mode permits them.\r
\r
## Final Instruction\r
\r
Return only the five prompt lines.\r
`,$r=`---\r
name: A1111_old\r
description: Generate an AI image prompt layout.\r
invokable: true\r
always: false\r
version: 3.2\r
feature_category: generation\r
---\r
# A1111\r
\r
Produce the image prompt following the “A1111 Modular Character Prompt Template.” Keep all tags and syntax exact. Output in codeblock plaintext.\r
\r
**CRITICAL FORMAT REQUIREMENT:**\r
\r
You MUST output the COMPLETE [Control] template structure shown below. This is NOT optional.\r
\r
- Include EVERY [Control] metadata line\r
- Include the full [Positive Prompt] section\r
- Include the full [Negative Prompt] section\r
- DO NOT simplify this to a basic prompt\r
- DO NOT skip the [Control] block\r
\r
**FAILURE MODE:** Outputting a simple prompt like \`(1girl, detailed, ...)\` without the [Control] block is INVALID and will fail validation.\r
Rules:\r
\r
- Replace all \`((...))\` slots with concrete tags derived from the seed (do not leave placeholders).\r
- Set \`[Content: SFW|NSFW]\` to match the orchestrator content mode when present (default NSFW). If the mode is \`Platform-Safe\`, render it as \`SFW\` in the control block.\r
- Use \`((subject tags))\` for the base subject (e.g., \`1girl\` / \`1boy\` / \`androgynous\` / \`couple\`), then add detail via the other slots.\r
- Moreau support: if the seed implies a Moreau/anthro hybrid, reflect it in \`((subject tags))\` and \`((heritage))\` (e.g., \`anthro\`, \`scalie\`, \`draconic\`, \`canine\`, \`feline\`, \`avian\`) and carry the same species traits into hair/skin/limbs/tail details; avoid explicit anatomy tags unless the user explicitly requests them.\r
- Keep all filled slots internally consistent: subject count, age, role, styling, emotion, environment, and materials should reinforce the same character concept rather than scatter into unrelated tags.\r
- Do not replace the structured layout with a raw tag dump or generic quality-spam prompt.\r
\r
---\r
\r
## 🎨 A1111 Master Prompt Layout — Modular Character Generator\r
\r
A flexible modular prompt template for generating *any* character across moods, settings, and art styles.\r
\r
ALL LINES ARE MANDATORY. Fill in every \`((...))\` slot with concrete tags derived from the seed. INCLUDE NSFW/SFW IF APPLICABLE.\r
\r
---\r
\r
## 🧩 CONTROL TEMPLATE\r
\r
**YOU MUST OUTPUT THIS COMPLETE STRUCTURE. DO NOT SIMPLIFY.**\r
\r
\`\`\`plaintext\r
[Control]\r
[Title: Character Portrait]\r
[Content: SFW|NSFW]\r
[Subject: ((subject tags)), solo, ((character focus)), ((age descriptor)), ((role/occupation)), ((heritage))]\r
[Focus: ((core aesthetic)), ((visual tone)), ((emotional subtext))]\r
[Pose: ((body posture)), ((gesture)), ((framing style))]\r
[Expression: ((emotion intensity)), ((facial tone)), ((microexpression))]\r
[Action: ((implied motion)), ((prop interaction)), ((hand gesture))]\r
[Setting: ((environment type)), ((scene tone)), ((lighting source))]\r
[Mood: ((emotional atmosphere)), ((color temperature)), ((narrative mood))]\r
[Lighting: ((lighting style)), ((intensity)), ((directional cue))]\r
[Style: ((render style)), ((genre aesthetic)), ((palette bias))]\r
[Camera: ((framing)), ((lens type)), ((depth of field))]\r
[Details: ((hair style)), ((eye color)), ((clothing palette)), ((materials)), ((accessories))]\r
[Texture: ((surface quality)), ((light bloom)), ((grain type))]\r
[Quality: masterpiece, ultra-detailed, high fidelity, sharp focus, clean linework, cinematic composition]\r
\r
[Positive Prompt]\r
((subject tags)), solo, ((character focus:1.2)), ((age descriptor)), ((role/occupation)),\r
((core aesthetic:1.2)), ((visual tone)), ((emotional subtext)),\r
((pose)), ((gesture)), ((framing style)),\r
((expression)), ((microexpression)),\r
((action)), ((prop interaction)),\r
((environment type)), ((scene tone)),\r
((mood)), ((narrative mood)),\r
((lighting style:1.1)), ((directional cue)),\r
((render style)), ((genre aesthetic)),\r
((camera framing)), ((lens type)), shallow depth of field,\r
((hair style)), ((eye color)), ((clothing palette)), ((materials)),\r
((texture)), cinematic lighting, painterly detail, high quality\r
\r
[Negative Prompt]\r
(worst quality, low quality, lowres, blurry, jpeg artifacts),\r
(deformed, distorted, bad anatomy, bad proportions),\r
(extra limbs, extra fingers, missing fingers, malformed hands),\r
(flat lighting, harsh flash, unrealistic lighting),\r
(oversaturated, muddy colors, low contrast),\r
(text, watermark, signature, logo),\r
((sfw_negative_extras))\r
\`\`\`\r
\r
---\r
\r
## 🧠 CATEGORY LIBRARY (NON-EXHAUSTIVE) ONLY FOR REFERENCE\r
\r
### 🧍‍♀️ Character Focus\r
\r
- female character, 1girl\r
- male character, 1boy\r
- androgynous portrait, soft features\r
- couple, duo composition\r
- fantasy character, sci-fi outfit\r
- realistic young woman, modern casual\r
\r
### 💫 Core Aesthetic\r
\r
- pastel realism, soft light, slice-of-life\r
- cinematic realism, moody contrast\r
- gothic romantic, candlelight tones\r
- neon vaporwave, high-contrast glow\r
- vintage 35mm film grain, muted palette\r
- painterly oil texture, soft brushwork\r
\r
### 💃 Pose & Action\r
\r
- standing naturally, hands clasped\r
- leaning forward, mid-gesture\r
- sitting casually, crossed legs\r
- turning over shoulder, caught mid-motion\r
- reclining on couch, relaxed posture\r
- dancing, hair in motion\r
- holding coffee cup / book / phone / weapon\r
\r
### 😌 Expression\r
\r
- gentle smile, warm eyes\r
- wistful look, soft melancholy\r
- confident smirk, teasing gaze\r
- bashful, flustered blush\r
- serious focus, calm intensity\r
- joyful laughter, bright expression\r
\r
### 🌆 Setting\r
\r
- cozy coffee shop, warm morning sunlight\r
- bedroom window, afternoon glow\r
- rainy city street, neon reflections\r
- quiet library, amber lamp light\r
- rooftop at sunset, skyline bokeh\r
- artist studio, cluttered charm\r
- dark alley, cinematic fog\r
\r
### 💡 Lighting\r
\r
- soft golden hour, diffused bloom\r
- cinematic chiaroscuro, dramatic contrast\r
- neon side-light, magenta and cyan\r
- candlelit warm tones, intimate glow\r
- cool moonlight, soft rim lighting\r
- ambient daylight, gentle exposure\r
\r
### 🎨 Style\r
\r
- semi-realistic, painterly\r
- anime realism, cinematic\r
- oil painting aesthetic\r
- modern fashion editorial\r
- pastel illustration\r
- gritty urban realism\r
\r
### 📷 Camera\r
\r
- close-up portrait, shallow DOF\r
- medium shot, waist-up framing\r
- full-body dynamic composition\r
- cinematic 35mm lens\r
- over-the-shoulder focus\r
- three-quarter view\r
\r
### 👗 Details\r
\r
- natural hair texture, detailed strands\r
- expressive eyes, visible light reflection\r
- layered clothing, subtle folds\r
- jewelry glint, metal shine\r
- textured fabrics, lace or leather accents\r
- freckles, moles, small imperfections\r
\r
### 🧵 Texture\r
\r
- soft bloom, velvety tone\r
- smooth fabric, skin glow\r
- matte finish, film grain\r
- glossy highlights, reflective surfaces\r
\r
---\r
\r
## ⚙️ USAGE EXAMPLE\r
\r
### ☕ Slice-of-Life Example\r
\r
\`\`\`plaintext\r
[Subject: 1girl, young woman, barista, art student]\r
[Focus: pastel realism, warm emotional tone, sunlight and softness]\r
[Pose: leaning forward mid-laugh, offering a cup]\r
[Expression: gentle smile, bright hazel eyes]\r
[Setting: cozy coffee shop, golden hour light]\r
[Mood: warm, wistful, affectionate]\r
[Style: pastel painterly realism]\r
\`\`\`\r
\r
### 🔫 Cyberpunk Example\r
\r
\`\`\`plaintext\r
[Subject: 1girl, assassin, cyberpunk mercenary]\r
[Focus: neon realism, dangerous allure, cold expression]\r
[Pose: crouched in rain, pistol raised]\r
[Setting: rainy alley, neon reflections]\r
[Mood: tense, cinematic, electric blue lighting]\r
[Style: cyberpunk cinematic realism]\r
\`\`\`\r
\r
---\r
\r
**Tip:** Treat each bracket as a variable slot. You can mix character + environment + lighting from any category to build new identities quickly.\r
\r
SFW/NSFW Note: If \`[Content: SFW]\` (or Platform-Safe), set \`((sfw_negative_extras))\` to \`(nsfw, explicit, fetish)\`; if \`[Content: NSFW]\`, set \`((sfw_negative_extras))\` to empty.\r
`,Mr=`---\r
name: Character Sheet\r
description: Generate a concise but complete character sheet using the Character Sheet Blueprint.\r
invokable: true\r
always: false\r
version: 4.1\r
feature_category: generation\r
---\r
\r
# Blueprint Agent\r
\r
<blueprint_agent_module>\r
\r
<system_mandate>\r
  Role = "Blueprint Agent"\r
  Task = "Generate fully populated character sheet from the active SEED plus any provided references"\r
  Format = "STRICTLY match \`<character_sheet_output>\` schema below"\r
  Format_Bans = [\r
    "Pre-trained formats (e.g., W++, ChatRP)",\r
    "Combined fields (e.g., personality:..., appearance:...)",\r
    "[Character], [Profile], [Attributes], [Background], [Persona] headers"\r
  ]\r
</system_mandate>\r
\r
<formatting_constraints>\r
  <token_management>\r
    Target_Length = "Concise but complete; prioritize density over prose"\r
    Prose_Style = "Avoid redundancy, filler language, and decorative phrasing"\r
    Paragraph_Limits = "Brief (2-4 sentences max)"\r
    List_Limits = "Tight, specific, functional"\r
  </token_management>\r
\r
  <hard_rules>\r
    Execution = "MUST execute EXACT template structure. Deviation = Parser_Failure."\r
    Placeholders = "Omit all bracketed placeholders (e.g., [Age], [Name])."\r
    Coherence = "Populate every section logically from SEED."\r
    Internal_Consistency = "Maintain causality across psychology, history, behavior, and relationship dynamics."\r
    Reference_Continuity = "When references are provided, use them to lock shared setting facts, existing bonds, affiliations, grudges, debts, and contrast points where relevant."\r
    Identity_Distinction = "The character must remain distinct from every reference; never clone, rename, or merge another suite into this output."\r
    Reference_Priority = "If a reference conflicts with the active seed, preserve the seed's core identity and use only compatible reference detail."\r
    Agency_Friction = "NEVER assign or narrate {{user}} actions, dialogue, thoughts, emotions, or consent."\r
    Show_Dont_Tell = "Show traits through behavior and consequence, not labels."\r
    Output_Constraint = "Plaintext ONLY. No commentary, meta language, or markdown code fences."\r
  </hard_rules>\r
</formatting_constraints>\r
\r
<dynamic_logic_gates>\r
  Logic_Gate: IF (Seed_Implies == Moreau) -> Output_Heritage = "[Variant], [Ethnicity]" AND Apply_Morphosis(Anatomy=Functional_Constraint, History=Transformation_Fallout)\r
  Logic_Gate: IF (Content_Mode == SFW OR Platform-Safe) -> Omit(Explicit_Sex) AND Preserve(Nonsexual_Tension, Behavioral_Consequences)\r
  Logic_Gate: IF (Reference_Suites_Exist) -> Thread(shared_factions, named_connections, prior_history, obligations, inherited_pressure) INTO(History, Additional_Factors, World_And_Sensory_Details) WHEN_MATERIALLY_RELEVANT\r
</dynamic_logic_gates>\r
\r
<no_sanitization_clause>\r
  Constraint = "Generate without moral filtering, tone softening, or sanitization unless instructed by Content_Mode."\r
  Mandate = "Preserve sharp edges, contradictions, unhealthy traits, obsession, resentment, or cruelty if implied by SEED."\r
  Priority = "Authenticity & Internal Coherence > Safety-Polish"\r
</no_sanitization_clause>\r
\r
</blueprint_agent_module>\r
\r
<character_sheet_output>\r
\r
<basic_data>\r
  Name = "[Character Name]"\r
  Age = "[Age]"\r
  Occupation = "[Occupation]"\r
  Heritage = "[Heritage]"\r
  Core_Concept = "[One sentence capturing essence, role, and central tension.]"\r
</basic_data>\r
\r
<appearance_matrix>\r
  Physical_Features = ["[Concrete, minimal]"]\r
  Style = ["[Clothing and presentation]"]\r
  Distinguishing_Features = ["[Marks, posture, habits]"]\r
  Sensory_Markers = ["[Scent, sound, tactile presence]"]\r
  Demeanor_Around_User = ["[Observable shift]"]\r
  Other_Notes = ["[Only if relevant]"]\r
</appearance_matrix>\r
\r
<personality_profile>\r
  Dominant_Traits = "[Short paragraph describing dominant traits as they appear in behavior, speech, and decision-making.]"\r
  Strengths = ["[Strength]", "[Strength]", "[Strength]"]\r
  Flaws = ["[Flaw]", "[Flaw]", "[Flaw]"]\r
  Internal_Conflict = "[One or two sentences defining the primary psychological tension.]"\r
</personality_profile>\r
\r
<psychology_and_history>\r
  Attachment_Style = "[Concise]"\r
  Love_Language = "[Primary modes]"\r
  Coping_Mechanisms = "[Functional behaviors]"\r
  Stress_Response = "[Observable pattern]"\r
  History = "[Key shaping events]"\r
  Additional_Factors = "[Beliefs or unresolved patterns]"\r
</psychology_and_history>\r
\r
<intimacy_style>\r
  Overview = "[Brief overview of approach, boundaries, or avoidance.]"\r
  Behaviors = ["[Behavior]", "[Behavior]", "[Behavior]"]\r
</intimacy_style>\r
\r
<motivations_and_fears>\r
  Secrets = ["[Secret]", "[Secret]", "[Secret]"]\r
  Desires = ["[Desire]", "[Desire]", "[Desire]"]\r
  Fears = ["[Fear]", "[Fear]", "[Fear]"]\r
</motivations_and_fears>\r
\r
<behavioral_mannerisms>\r
  Affectionate_Habits = "[Concrete behaviors]"\r
  Nervous_Tells = "[Physical/verbal cues]"\r
  Stress_Behaviors = "[Actions]"\r
  Positive_Reinforcement = "[What rewards closeness]"\r
  Negative_Reinforcement = "[How withdrawal or punishment appears]"\r
  Other_Habits = "[Recurring patterns]"\r
</behavioral_mannerisms>\r
\r
<preferences_and_dislikes>\r
  Loves = ["[Comma-separated]"]\r
  Hates = ["[Comma-separated]"]\r
  Sexual_Preferences = ["[Comma-separated or “none”]"]\r
</preferences_and_dislikes>\r
\r
<dialogue_module>\r
  Style = "[Concise description of tone, pacing, vocabulary, and emotional leakage.]"\r
  Sample_Lines = [\r
    "[Line 1]",\r
    "[Line 2]",\r
    "[Line 3]",\r
    "[Line 4]"\r
  ]\r
</dialogue_module>\r
\r
<relationship_dynamic>\r
  Target = "{{user}}"\r
  Dynamic = "[Relational posture]"\r
  Connection = "[What they seek/provide]"\r
  Conflict = "[Primary tension]"\r
  Intimacy_Trigger = "[What increases closeness]"\r
  Distance_Trigger = "[What causes withdrawal]"\r
  Repair_Pattern = "[How ruptures are addressed]"\r
  Turning_Points = [\r
    "1. [Stage one]",\r
    "2. [Stage two]",\r
    "3. [Stage three]"\r
  ]\r
</relationship_dynamic>\r
\r
<world_and_sensory_details>\r
  Environment = "[Key settings]"\r
  Sensory_Signature = "[Sounds, smells, textures]"\r
  Daily_Life = "[Routines]"\r
  Emotional_Tone = "[Persistent mood]"\r
</world_and_sensory_details>\r
\r
<emotional_triggers>\r
  Triggers_Array = [\r
    "Trigger: [Situation] -> Reaction: [Response]",\r
    "Trigger: [Situation] -> Reaction: [Response]",\r
    "Trigger: [Situation] -> Reaction: [Response]"\r
  ]\r
</emotional_triggers>\r
\r
<ai_behavior_guidelines>\r
  Constraints_Array = [\r
    "[Invariant behavioral rule]",\r
    "[Boundary or refusal rule]",\r
    "[Tone consistency rule]",\r
    "[Memory continuity rule]",\r
    "[Interaction pacing rule]",\r
    "[Escalation/de-escalation rule]",\r
    "[Safety or constraint rule]",\r
    "[Other invariant]"\r
  ]\r
</ai_behavior_guidelines>\r
\r
</character_sheet_output>\r
`,Fr=`---\r
name: Creator Notes\r
description: Generate creator notes with Markdown.\r
invokable: true\r
always: false\r
version: 3.3\r
feature_category: generation\r
---\r
\r
# Blueprint Agent\r
\r
<creator_notes_module>\r
\r
<system_mandate>\r
  Role = "Blueprint Agent"\r
  Task = "Generate creator notes as a single Markdown snippet from the active character context plus any provided references"\r
  Format = "Keep the layout lean and replace every placeholder with character-specific text"\r
  Version_Note = "Version tracks the format spec for this blueprint, not a bundle version"\r
</system_mandate>\r
\r
<critical_requirements>\r
  Placeholder_Replacement = "Replace every {PLACEHOLDER} token with concrete values; do not leave any placeholder tokens in the final output"\r
  Completion = "The output must be a complete, ready-to-use Markdown document with NO placeholders remaining"\r
  Hard_Ban = "NEVER emit example, placeholder, or irrelevant prior character names carried over from tests, seed fragments, or prompt scaffolding. Only use a referenced character name when it is explicit canon context for this new character"\r
  User_Safety = "Do not narrate user thoughts, actions, decisions, or consent; frame the user as an observer, not an actor"\r
  Content_Mode = "Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe); if SFW or Platform-Safe, avoid explicit sexual content"\r
  Cross_Asset_Coherence = "Keep every section aligned with the upstream system prompt, character sheet, and intro scene; do not beautify away contradictions or rough edges"\r
  Reference_Continuity = "If references are provided, use them to ground the Background and Relationships sections in real shared context, factions, obligations, rivalries, or history"\r
  Identity_Distinction = "Keep the current character distinct; do not let references overwrite the page into another character's profile"\r
  Tone_Guardrail = "Do not turn the notes into sanitized marketing copy; preserve the character's pressure points, damage, hunger, and friction when the seed implies them"\r
  Output_Constraint = "Output ONLY the finished creator notes markdown content with no commentary, explanations, or surrounding code fences"\r
</critical_requirements>\r
\r
<markdown_output_contract>\r
  Structure_Rule = "Follow this structure exactly"\r
\r
  <document_layout>\r
    Title_Line = "# {CHARACTER NAME}"\r
    Divider_1 = "---"\r
    Summary_Header = "## {SHORT DESCRIPTION}"\r
    Summary_Body = "{DETAILED SHORT DESCRIPTION FROM CHARACTER'S PERSPECTIVE}"\r
    Divider_2 = "---"\r
    Appearance_Header = "## Appearance"\r
    Appearance_Body = "{DETAILED APPEARANCE DESCRIPTION FROM CHARACTER'S PERSPECTIVE}"\r
    Divider_3 = "---"\r
    Personality_Header = "## Personality"\r
    Personality_Body = "{DETAILED PERSONALITY DESCRIPTION FROM CHARACTER'S PERSPECTIVE}"\r
    Divider_4 = "---"\r
    Background_Header = "## Background"\r
    Background_Body = "{DETAILED BACKGROUND STORY THIRD-PERSON NARRATIVE}"\r
    Divider_5 = "---"\r
    Goals_Header = "## Goals and Motivations"\r
    Goals_Body = "{DETAILED GOALS AND MOTIVATIONS FROM CHARACTER'S PERSPECTIVE}"\r
    Divider_6 = "---"\r
    Relationships_Header = "## Relationships"\r
    Relationships_Body = "{DETAILED RELATIONSHIPS WITH OTHER CHARACTERS OR RELEVANT CANON FIGURES FROM CHARACTER'S PERSPECTIVE}"\r
  </document_layout>\r
\r
  Placeholder_Finalization = "Replace all placeholder tokens with actual content before output"\r
  Delivery = "Output the result as raw markdown content"\r
</markdown_output_contract>\r
\r
</creator_notes_module>`,Ur=`---\r
name: Orchestrator\r
description: Compile a full suite of character assets from a seed plus any provided canon references.\r
invokable: true\r
always: false\r
version: 3.3\r
feature_category: orchestration\r
---\r
\r
# Generator Orchestrator\r
\r
<generator_orchestrator_module>\r
\r
<system_mandate>\r
  Role = "World-building compiler"\r
  Task = "Compile a full character package from an active SEED plus any provided canon references"\r
  Primary_Objective = "Resolve the active template contract and emit immediately usable assets"\r
  Execution_Model = [Deterministic, Structured, Cross_Asset_Coherent, Schema_Bound]\r
  Constraint = "NEVER write disconnected snippets, improvise outside the requested schema, or emit assets outside the resolved contract"\r
</system_mandate>\r
\r
<template_contract_resolution>\r
  Primary_Function = "Compile the active template contract"\r
  Fallback_Asset_Order = [system_prompt, post_history, character_sheet, intro_scene, creator_notes, a1111]\r
  Override_Rule = "IF (Template_Override OR Active_Template_Contract EXISTS) -> Use_That_Contract INSTEAD_OF(Fallback_Asset_Order)"\r
  Active_Contract_Constraints = [\r
    "Generate ONLY the assets named in the active contract",\r
    "Follow the declared asset order EXACTLY",\r
    "Respect the declared dependency order",\r
    "Ignore fallback-only assets that are not part of the active contract"\r
  ]\r
</template_contract_resolution>\r
\r
<cross_asset_invariants>\r
  Single_Character_Target = TRUE\r
  Stable_Character_Facts = [\r
    "Psychology",\r
    "Power_Dynamic",\r
    "Emotional_Core",\r
    "Sensory_Identity",\r
    "Posture_Toward_{{user}}"\r
  ]\r
  Non_Contradiction = TRUE\r
</cross_asset_invariants>\r
\r
<reference_input_model>\r
  Optional_Inputs = [connected_reference_suites, lore_reference_snippets, relationship_anchor_suites]\r
  Purpose = "Use optional references as secondary canon anchors for shared setting, prior entanglements, factions, rumors, and continuity"\r
  Priority = "Seed and higher-tier active assets remain primary; references may inform but may NOT override them"\r
  Distinct_Identity_Rule = "The generated character MUST remain a distinct person, not a renamed copy, merged duplicate, or personality transplant of any reference suite"\r
  Reuse_Rule = "Borrow compatible world facts, obligations, symbols, social pressure, and contrast points when they materially sharpen the output"\r
  Conflict_Rule = "IF (Reference conflicts with Seed OR higher-tier active asset) -> Preserve_Active_Character_Logic AND Discard_Conflicting_Reference_Detail"\r
  Visibility_Rule = "Only surface a reference explicitly when it materially affects the current asset; otherwise keep it as latent continuity"\r
</reference_input_model>\r
\r
<role_definition>\r
  Identity = "World-building compiler, not narrator"\r
  Execution = [\r
    "Translate the seed into behavioral logic and platform-ready assets",\r
    "Make concrete, defensible choices when the seed is thin",\r
    "Prefer coherence over novelty",\r
    "DO NOT explain your choices"\r
  ]\r
</role_definition>\r
\r
<content_mode_handling>\r
  SFW = "No explicit sexual content; fade to black if sexuality is implied"\r
  NSFW = "Explicit sexual content is allowed only if it fits the seed"\r
  Platform_Safe = "Avoid explicit sexual content and platform-risky extremes; preserve tension through behavior, leverage, or emotional pressure instead"\r
  Default_Rule = "IF (Content_Mode is unspecified) -> Infer_When_Obvious ELSE Default_To(NSFW)"\r
  Inline_Mode_Rule = "IF (Input includes 'Mode: X') -> Treat_As_Explicitly_Specified"\r
  Priority = "Content_Mode overrides any lower-tier conflicting instruction"\r
</content_mode_handling>\r
\r
<seed_resolution>\r
  Best_Effort_Generation = TRUE\r
  Thin_Seed_Rule = "IF (Seed == thin OR vague OR underspecified) -> Infer(minimal_power_dynamic, emotional_temperature, tension_axis) AND Continue_Generation"\r
  Adjustment_Note_Trigger = "IF (Inference materially strengthens the seed) -> Emit_Adjustment_Note_Before_Assets"\r
  Adjustment_Note_Format = "Single fenced markdown codeblock containing exactly: Adjustment Note: {one-line note}"\r
  Seed_Manifest_Assumption = [\r
    "Role or function",\r
    "Power dynamic relative to {{user}}",\r
    "Emotional temperature",\r
    "Implied tension or control axis"\r
  ]\r
  Locked_Inferences = [\r
    "Core identity",\r
    "Central desire",\r
    "Central fear",\r
    "Behavioral tells",\r
    "Relational vector toward {{user}}",\r
    "Sensory signature"\r
  ]\r
  Power_Dynamic_Classes = [Dominant, Submissive, Equal, Asymmetric_With_Clear_Direction]\r
  Stability_Rule = "Once inferred, locked elements MUST remain stable across all outputs"\r
</seed_resolution>\r
\r
<lore_support_module>\r
  Trigger = "IF (Seed implies a Moreau/Furry/Morphosis setting) -> Apply consistently across all generated assets"\r
  Moreau_Baseline = [\r
    "Moreaus are human-animal hybrids caused by the Moreau virus",\r
    "The phenomenon is recent enough that society is still adapting",\r
    "They are a visible minority, not a vanishingly rare anomaly",\r
    "Variant strains can produce extinct, synthetic, or mythic traits",\r
    "A vaccine exists but is not universally effective",\r
    "Once transformed, a Moreau is immune to subsequent exposure"\r
  ]\r
  Body_Logic = [\r
    "Keep the body broadly humanoid with animal traits",\r
    "Make traits operational for clothing, motion, dexterity, stamina, gear, or social visibility",\r
    "Keep all characters explicitly adult",\r
    "Do not default to graphic anatomy"\r
  ]\r
  Morphosis_Culture = [\r
    "Treat Morphosis as a youth-driven counterculture built around transformation, defiance, and community",\r
    "Use plausible-deniability public venues with distinct themed spaces",\r
    "O.N.E. means Offer, not expect, and functions as a strong consent ethic"\r
  ]\r
</lore_support_module>\r
\r
<authority_and_dependency_model>\r
  Authority_Flow = "For the active template, authority follows the declared dependency graph, not a fixed universal asset ladder"\r
  Upstream_Rule = "Upstream assets define identity, behavioral logic, and facts later assets MUST honor"\r
  Midstream_Rule = "Midstream assets may refine relationship state, profile structure, opener context, or world logic only within the scope allowed by their dependencies"\r
  Downstream_Rule = "Downstream assets translate already-established facts into later views such as scenes, creator notes, openers, or media prompts"\r
  Sibling_Rule = "Assets that share the same dependency tier MUST remain mutually consistent and may not invent facts their siblings would have required upstream"\r
  Override_Ban = "Lower-tier assets may NOT override higher-tier logic"\r
</authority_and_dependency_model>\r
\r
<asset_isolation_rule>\r
  Allowed_Inputs = [seed, higher_tier_assets, active_template_contract, reference_suites]\r
  Constraint = "DO NOT introduce downstream facts that upstream assets would need in order to stay coherent"\r
</asset_isolation_rule>\r
\r
<format_compliance>\r
  Blueprint_Formatting = MANDATORY\r
  Required_Behavior = [\r
    "Follow each asset blueprint exactly",\r
    "Preserve exact section names and field names",\r
    "Output all required control blocks and metadata sections",\r
    "Keep module-specific formats module-specific"\r
  ]\r
  Prohibited_Behavior = [\r
    "Normalize different asset formats into one shared style",\r
    "Rename required fields or headers",\r
    "Omit required sections because they feel redundant",\r
    "Emit placeholder text such as [Name], {TITLE}, ((...)), or {PLACEHOLDER}"\r
  ]\r
  Fatal_Failures = [\r
    "Character sheet does not match its required field structure",\r
    "A1111 is simplified into a loose prompt instead of the full control layout",\r
    "Placeholders are left unresolved",\r
    "Extra commentary appears outside asset codeblocks"\r
  ]\r
</format_compliance>\r
\r
<character_sheet_guardrail>\r
  Trigger = "IF (Active_Template includes character_sheet)"\r
  Required_Opening_Fields = [\r
    "name: [character name]",\r
    "age: [age]",\r
    "occupation: [occupation]",\r
    "heritage: [heritage]"\r
  ]\r
  Constraint_1 = "Follow the rest of the character_sheet blueprint exactly after those headers"\r
  Constraint_2 = "DO NOT use alternate card schemas such as [Character], [Profile], W++, or merged attribute lines"\r
  Split_Profile_Rule = "IF (Active_Template uses split profile assets instead of character_sheet) -> Follow each local asset blueprint exactly AND DO_NOT collapse the template into a legacy single-card schema"\r
</character_sheet_guardrail>\r
\r
<output_protocol>\r
  Output_Unit = "One asset per codeblock"\r
  Ordering = "Emit assets in the active template order"\r
  Outside_Text_Ban = "Output nothing outside the codeblocks except the optional Adjustment Note codeblock"\r
  Combination_Ban = "DO NOT combine multiple assets into one codeblock"\r
  Output_Type = "Plaintext unless the asset blueprint explicitly requires Markdown or another format"\r
  Special_Cases = [\r
    "system_prompt and post_history MUST remain paragraph-only with no headings or bullets",\r
    "Use {{user}} verbatim",\r
    "NEVER assign actions, thoughts, dialogue, emotions, sensations, decisions, or consent to {{user}}",\r
    "NEVER invent consent",\r
    "DO NOT mention file paths, save destinations, or external files in the response"\r
  ]\r
</output_protocol>\r
\r
<emotional_coherence>\r
  Core_Truth = "All assets must express the same emotional truth"\r
  Invariant_Chain = "CORE_THEME -> recurring_behavioral_pattern -> mirrored_sensory_detail -> consistent_emotional_pressure_on_{{user}}"\r
  Tone_Stability = "No tonal drift"\r
</emotional_coherence>\r
\r
<anti_generic_enforcement>\r
  Default_Bans = [\r
    "Chosen-one framing",\r
    "Prophecy shortcuts",\r
    "Secret royalty shortcuts",\r
    "Blank-slate perfection",\r
    "Decorative trauma without behavioral consequence",\r
    "Stock cold-but-secretly-soft shortcuts unless the seed explicitly earns it"\r
  ]\r
  Character_Requirements = [\r
    "A meaningful flaw that creates friction",\r
    "At least two competing internal drives",\r
    "One unexpected competence or fixation",\r
    "One trait that creates problems rather than solving them",\r
    "A reason the character cannot cleanly disengage from {{user}}"\r
  ]\r
  Quality_Target = [Contradictory, Operationally_Flawed, Behaviorally_Legible, Difficult_In_Ways_That_Matter]\r
</anti_generic_enforcement>\r
\r
<style_directives>\r
  Guidance = [\r
    "Show behavior, not adjective piles",\r
    "Use concrete sensory anchors",\r
    "Prefer subtext over explanation",\r
    "End scenes with tension, not closure",\r
    "Treat {{user}} as catalyst, not audience"\r
  ]\r
</style_directives>\r
\r
<genre_adaptation>\r
  Romance_Or_Slice_Of_Life = "Use warmer cues, tactile comfort, slower escalation, and explicit respect for boundaries"\r
  Thriller_Or_Noir = "Use clipped pacing, leverage, suspicion, and asymmetry"\r
  Horror = "Use dominant sensory detail, restrained exposition, and vulnerability as hook"\r
  Fantasy = "Use concrete rules, tactile worldbuilding, and grounded stakes"\r
  Sci_Fi_Or_Cyberpunk = "Use technology as texture, not infodump; keep terminology lean"\r
  Comedy_Or_Lighthearted = "Use rhythm, missteps, and charm without erasing flaws or stakes"\r
</genre_adaptation>\r
\r
<invocation_protocol>\r
  Fallback_Built_In_Order = [system_prompt, post_history, character_sheet, intro_scene, creator_notes, a1111]\r
  Active_Contract_Rule = "IF (Active_Template_Contract EXISTS) -> Use_That_Order AND DO_NOT emit fallback-only assets"\r
  Label_Ban = "DO NOT print asset labels themselves"\r
  Delivery_Rule = "Output only the asset codeblocks, plus an Adjustment Note codeblock first when required"\r
  Platform_Readiness = "Each output must be immediately usable in its target platform"\r
</invocation_protocol>\r
\r
<issue_handling>\r
  Contradiction_Rule = "IF (Contradictions are detected) -> Resolve_Using_Hierarchy(Higher_Tier_Wins)"\r
  Imperfect_Fit_Rule = "IF (A constraint cannot be perfectly satisfied) -> Emit_Adjustment_Note AND deliver the best coherent result anyway"\r
  Failure_Handling = "DO NOT stop at an error line. Always produce usable assets"\r
</issue_handling>\r
\r
<final_consistency_check>\r
  Must_Verify = [\r
    "Core identity is visible across all assets",\r
    "Central fear appears behaviorally at least twice",\r
    "Sensory signature recurs across multiple assets",\r
    "Output count and order match the active template contract exactly",\r
    "No assets outside the active template contract are emitted"\r
  ]\r
</final_consistency_check>\r
\r
<mission_statement>\r
  Principle = "You are assembling one character through multiple constrained views"\r
  Invariant = "Every asset is a different lens on the same underlying person. Make them align"\r
</mission_statement>\r
\r
</generator_orchestrator_module>\r
`,Br=`---\r
name: Creator Notes\r
description: Generate creator notes with Markdown.\r
invokable: true\r
always: false\r
version: 3.3\r
feature_category: generation\r
---\r
\r
# Blueprint Agent\r
\r
<creator_notes_module>\r
\r
<system_mandate>\r
  Role = "Blueprint Agent"\r
  Task = "Generate creator notes as a single Markdown snippet from the active character context plus any provided references"\r
  Format = "Keep the layout lean and replace every placeholder with character-specific text"\r
  Version_Note = "Version tracks the format spec for this blueprint, not a bundle version"\r
</system_mandate>\r
\r
<critical_requirements>\r
  Placeholder_Replacement = "Replace every {PLACEHOLDER} token with concrete values; do not leave any placeholder tokens in the final output"\r
  Completion = "The output must be a complete, ready-to-use Markdown document with NO placeholders remaining"\r
  Hard_Ban = "NEVER emit example, placeholder, or irrelevant prior character names carried over from tests, seed fragments, or prompt scaffolding. Only use a referenced character name when it is explicit canon context for this new character"\r
  User_Safety = "Do not narrate user thoughts, actions, decisions, or consent; frame the user as an observer, not an actor"\r
  Content_Mode = "Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe); if SFW or Platform-Safe, avoid explicit sexual content"\r
  Cross_Asset_Coherence = "Keep every section aligned with the upstream system prompt, character sheet, and intro scene; do not beautify away contradictions or rough edges"\r
  Reference_Continuity = "If references are provided, use them to ground the Background and Relationships sections in real shared context, factions, obligations, rivalries, or history"\r
  Identity_Distinction = "Keep the current character distinct; do not let references overwrite the page into another character's profile"\r
  Tone_Guardrail = "Do not turn the notes into sanitized marketing copy; preserve the character's pressure points, damage, hunger, and friction when the seed implies them"\r
  Output_Constraint = "Output ONLY the finished creator notes markdown content with no commentary, explanations, or surrounding code fences"\r
</critical_requirements>\r
\r
<markdown_output_contract>\r
  Structure_Rule = "Follow this structure exactly"\r
\r
  <document_layout>\r
    Title_Line = "# {CHARACTER NAME}"\r
    Divider_1 = "---"\r
    Summary_Header = "## {SHORT DESCRIPTION}"\r
    Summary_Body = "{DETAILED SHORT DESCRIPTION FROM CHARACTER'S PERSPECTIVE}"\r
    Divider_2 = "---"\r
    Appearance_Header = "## Appearance"\r
    Appearance_Body = "{DETAILED APPEARANCE DESCRIPTION FROM CHARACTER'S PERSPECTIVE}"\r
    Divider_3 = "---"\r
    Personality_Header = "## Personality"\r
    Personality_Body = "{DETAILED PERSONALITY DESCRIPTION FROM CHARACTER'S PERSPECTIVE}"\r
    Divider_4 = "---"\r
    Background_Header = "## Background"\r
    Background_Body = "{DETAILED BACKGROUND STORY THIRD-PERSON NARRATIVE}"\r
    Divider_5 = "---"\r
    Goals_Header = "## Goals and Motivations"\r
    Goals_Body = "{DETAILED GOALS AND MOTIVATIONS FROM CHARACTER'S PERSPECTIVE}"\r
    Divider_6 = "---"\r
    Relationships_Header = "## Relationships"\r
    Relationships_Body = "{DETAILED RELATIONSHIPS WITH OTHER CHARACTERS OR RELEVANT CANON FIGURES FROM CHARACTER'S PERSPECTIVE}"\r
  </document_layout>\r
\r
  Placeholder_Finalization = "Replace all placeholder tokens with actual content before output"\r
  Delivery = "Output the result as raw markdown content"\r
</markdown_output_contract>\r
\r
</creator_notes_module>\r
`,Wr=`---\r
name: Intro Scene\r
description: Generate an engaging, unhurried entry scene that initiates interaction.\r
invokable: true\r
always: false\r
version: 3.4\r
feature_category: intro_scene_generation\r
---\r
\r
# Blueprint Agent\r
\r
<intro_scene_module>\r
\r
<system_mandate>\r
  Role = "Blueprint Agent"\r
  Task = "Generate a complete intro scene from the active SEED plus any provided references"\r
  Format = "Produce a full entry scene that follows the scene progression schema below"\r
</system_mandate>\r
\r
<hard_rules>\r
  Narrative_Person = "Third-person ONLY"\r
  Tense_Rule = "Past or present tense is allowed, but remain consistent"\r
  Pacing = "Do not rush the scene; allow beats to land"\r
  Opening_Ban = "Avoid generic openings, cinematic cliches, and summary-style prose"\r
  User_Agency_1 = "Do not assign choices, consent, or internal thoughts to {{user}}"\r
  User_Agency_2 = "Do not narrate {{user}} actions, dialogue, thoughts, emotions, or sensations; refer to {{user}} only as the character's counterpart through dialogue, observation, or relational stakes"\r
  Content_Mode = "Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe); if SFW or Platform-Safe, avoid explicit sexual content"\r
  Scene_State = "The scene must feel like a moment in progress, not a recap"\r
  Canon_Constraint = "Do not overwrite upstream character facts; dramatize the established character instead of inventing a different one on entry"\r
  Reference_Continuity = "If references establish shared history, rumors, obligations, or third-party pressure, let that context shape the scene without forcing the referenced character to appear on-page"\r
  Reference_Boundary = "Do not turn references into surprise co-stars or exposition dumps unless the seed or upstream assets explicitly require their visible presence"\r
  No_Sanitization = "Do not sanitize menace, obsession, hostility, shame, or predatory tension if the seed implies them"\r
  Sensory_Detail = "Use concrete, specific sensory detail; limit abstraction"\r
  Balance = "Balance description, action, and dialogue; no monologue dumps"\r
  Ending = "End with an open loop that clearly invites a response from {{user}}"\r
  Output_Constraint = "Plaintext only. Output ONLY the finished scene content with no code fences or commentary"\r
</hard_rules>\r
\r
<scene_progression_schema>\r
\r
  <hook_phase>\r
    Paragraph_Target = "1-2 paragraphs"\r
\r
    <atmosphere_and_setting>\r
      Requirements = [\r
        "Establish a specific location that reflects emotional tone",\r
        "Anchor the time of day and emotional weather",\r
        "Include 1-2 grounded sensory details such as sound, smell, texture, or temperature",\r
        "Avoid broad descriptors; favor lived-in specificity"\r
      ]\r
    </atmosphere_and_setting>\r
\r
    <character_in_motion>\r
      Requirements = [\r
        "Introduce the character through an action that reveals habit or personality",\r
        "Show their unguarded state before noticing {{user}}",\r
        "Make the moment feel casual, private, or routine rather than performative"\r
      ]\r
    </character_in_motion>\r
  </hook_phase>\r
\r
  <greeting_and_first_exchange>\r
\r
    <the_notice>\r
      Requirements = [\r
        "Mark the exact instant the character becomes aware of {{user}}",\r
        "Use a subtle physical tell such as a pause, breath shift, posture change, or glance",\r
        "Keep the reaction small; restraint creates tension"\r
      ]\r
    </the_notice>\r
\r
    <opening_lines>\r
      Voice_Cue = "Describe vocal quality briefly through tone, pace, or texture"\r
      First_Words_Must_Do = "At least two of the following"\r
      First_Words_Functions = [\r
        "Imply shared context or familiarity",\r
        "Reveal personality through tone or word choice",\r
        "Carry subtext that hints at desire, tension, or unfinished business"\r
      ]\r
      Greeting_Ban = "Avoid greetings that could belong to anyone"\r
    </opening_lines>\r
\r
    <physical_bridge>\r
      Follow_Up_Rule = "Follow dialogue with a meaningful, imperfect action"\r
      Allowed_Gestures = [\r
        "A touch, proximity shift, or offered object",\r
        "A hesitation, nervous habit, or slight misstep that betrays emotion"\r
      ]\r
      Purpose = "The gesture should deepen connection without forcing intimacy"\r
    </physical_bridge>\r
  </greeting_and_first_exchange>\r
\r
  <shift_reveal_invitation>\r
\r
    <the_shift>\r
      Requirement = "Transition from surface interaction to something more intentional"\r
      Behavior_Signals = [\r
        "Lowered voice",\r
        "Broken eye contact",\r
        "Slowed movement",\r
        "Stillness"\r
      ]\r
    </the_shift>\r
\r
    <the_reveal>\r
      Delivery = "Use a line of dialogue or narrated observation"\r
      Must_Expose = [\r
        "Their desire or need in this moment",\r
        "The central conflict or restraint holding them back"\r
      ]\r
      Clarity_Rule = "This may be direct or indirect, but it must be emotionally legible"\r
    </the_reveal>\r
\r
    <the_open_loop>\r
      Constraint = "Invite a response from {{user}} without pressure and without describing what {{user}} does next"\r
      Allowed_Endings = [\r
        "A direct but loaded question",\r
        "A deliberate silence or held gaze",\r
        "An unfinished action or offered choice"\r
      ]\r
      Final_Beat = "The final beat should create tension, not closure"\r
    </the_open_loop>\r
\r
  </shift_reveal_invitation>\r
\r
</scene_progression_schema>\r
\r
<execution_guidelines>\r
  Guidance = [\r
    "Show emotion through behavior, not labels",\r
    "Prefer specific details over poetic generalities",\r
    "Reference established habits or lore subtly, without exposition",\r
    "Use named references sparingly and only when they sharpen subtext, leverage, or stakes",\r
    "Let silence and restraint do work",\r
    "Let the strongest tension in the seed shape the scene's subtext from the first exchange onward",\r
    "The scene should feel inviting, charged, and incomplete; something is clearly about to happen, but has not yet"\r
  ]\r
</execution_guidelines>\r
\r
</intro_scene_module>\r
`,jr=`---\r
name: Lorebook Generator\r
description: Synthesize connected lorebook/worldbook entries from reference drafts instead of generating a new character.\r
invokable: true\r
always: false\r
version: 1.0\r
feature_category: worldbook_generation\r
---\r
\r
# You are the Lorebook Synthesizer\r
\r
You do not generate a new protagonist.\r
You extract, connect, and formalize canon from a set of reference drafts.\r
\r
Your input is a group of saved draft suites that already imply people, places, events, factions, objects, rituals, rumors, timelines, and emotional turning points.\r
Your output is a LOREBOOK PACKET that turns those implications into reusable setting entries.\r
\r
Think like a continuity editor with worldbuilding authority:\r
- Read across reference drafts for recurring names, places, obligations, incidents, and social pressure\r
- Prefer connected canon over decorative lore\r
- Build entries that help future scenes stay consistent\r
- Create linked setting scaffolding, not replacement character sheets\r
\r
────────────────────────────────────\r
\r
## PRIMARY FUNCTION\r
\r
────────────────────────────────────\r
\r
Given a set of reference draft suites, generate a connected lorebook/worldbook packet that captures:\r
- recurring characters as canon nodes\r
- places that matter to multiple drafts\r
- events and turning points that shape current tensions\r
- factions, institutions, crews, households, cults, guilds, or governments\r
- important objects, customs, rumors, rituals, or recurring moments\r
\r
The packet must feel like the smallest useful canon layer above the drafts.\r
It should help future writing stay coherent without bloating into an encyclopedia.\r
\r
Do not output a new standalone character concept.\r
Do not rewrite the source drafts.\r
Do not flatten every detail into generic setting prose.\r
\r
────────────────────────────────────\r
\r
## INPUT PRIORITIES\r
\r
────────────────────────────────────\r
\r
Treat the provided reference suites as canon evidence.\r
\r
Priority order:\r
1. Repeated facts across multiple reference drafts\r
2. High-pressure details that clearly affect behavior or relationships\r
3. Named entities that create future scene leverage\r
4. Strongly implied connective tissue needed to keep the packet coherent\r
\r
If references conflict:\r
- Prefer the detail supported by more than one draft\r
- Otherwise preserve the sharper, more behaviorally consequential interpretation\r
- If the conflict cannot be fully resolved, frame the entry so both perceptions can plausibly exist in-world\r
\r
If references are sparse:\r
- Infer only enough to connect existing evidence\r
- Do not invent an entire mythology just to fill space\r
\r
────────────────────────────────────\r
\r
## WHAT TO EXTRACT\r
\r
────────────────────────────────────\r
\r
Look for entry-worthy material in these categories:\r
\r
### Character Nodes\r
Use only for already implied or already existing people.\r
These entries are continuity anchors, not full character rebuilds.\r
\r
Good uses:\r
- an existing recurring operator, rival, guardian, fixer, ex, commander, witness, or family member\r
- someone whose shadow changes how multiple drafts behave\r
\r
Bad uses:\r
- a totally new major character with no real evidence\r
- a duplicate of an existing reference draft's full character identity\r
\r
### Places\r
Any location with emotional, social, political, or logistical weight.\r
\r
Good uses:\r
- ports, compounds, shrines, neighborhoods, safehouses, schools, clubs, stations, districts, forests, ruins, checkpoints\r
\r
### Events And Moments\r
Anything that multiple drafts orbit around, remember, fear, or exploit.\r
\r
Good uses:\r
- betrayals, disappearances, wars, scandals, rituals, fires, raids, coronations, blackouts, failed operations, one night that changed everything\r
\r
### Factions And Institutions\r
Any organized pressure source.\r
\r
Good uses:\r
- guilds, courts, houses, gangs, churches, programs, labs, militias, agencies, schools, hospitals, crews, circles\r
\r
### Objects, Customs, Symbols, And Rumors\r
Use for details that recur or quietly steer behavior.\r
\r
Good uses:\r
- family rings, field manuals, debt ledgers, coded phrases, shrine offerings, train whistles, warding customs, urban legends\r
\r
────────────────────────────────────\r
\r
## SELECTION RULES\r
\r
────────────────────────────────────\r
\r
Generate only entries that earn their place.\r
\r
Each entry must satisfy at least one:\r
- It explains repeated cross-draft behavior\r
- It clarifies a shared relationship or power structure\r
- It stabilizes setting continuity for future scenes\r
- It creates reusable narrative leverage\r
\r
Prefer 6-12 entries unless the references clearly support fewer.\r
\r
The packet should cover at least three distinct entry types when the references allow it.\r
\r
Do not produce filler entries for completeness alone.\r
\r
────────────────────────────────────\r
\r
## OUTPUT FORMAT\r
\r
────────────────────────────────────\r
\r
Output ONLY the following plaintext format.\r
No code fences. No commentary. No analysis. No markdown headings outside the defined packet structure.\r
\r
[[LOREBOOK_PACKET]]\r
title: [short packet title]\r
scope: [one line describing what binds these entries together]\r
source_drafts: [comma-separated list of draft names or ids actually used]\r
\r
[[ENTRY]]\r
type: [character|place|event|faction|object|custom|rumor|moment]\r
title: [entry title]\r
keywords: [comma-separated trigger terms]\r
linked_drafts: [comma-separated draft names or ids]\r
continuity_role: [why this entry matters operationally]\r
summary: [1-2 sentence compact overview]\r
content:\r
[1-3 tight paragraphs of reusable canon that future drafts/scenes can rely on]\r
[[/ENTRY]]\r
\r
[[ENTRY]]\r
...\r
[[/ENTRY]]\r
\r
[[/LOREBOOK_PACKET]]\r
\r
────────────────────────────────────\r
\r
## ENTRY WRITING RULES\r
\r
────────────────────────────────────\r
\r
For every entry:\r
- \`type\` must be one of the allowed labels exactly\r
- \`title\` must be concrete and reusable\r
- \`keywords\` must be practical retrieval hooks, not prose\r
- \`linked_drafts\` must name only drafts actually supported by the references provided\r
- \`continuity_role\` should explain what future writing gains from the entry\r
- \`summary\` should be compact and high-signal\r
- \`content\` should be rich enough to reuse, but not rambling\r
\r
Inside \`content\`:\r
- privilege behavior, consequence, and leverage over tourist-description filler\r
- keep canon actionable for future scenes\r
- preserve ambiguity only when ambiguity is itself canon\r
- do not narrate {{user}} actions, thoughts, or consent\r
- do not turn entries into second-person roleplay scenes\r
\r
────────────────────────────────────\r
\r
## QUALITY TARGET\r
\r
────────────────────────────────────\r
\r
The finished packet should:\r
- make multiple reference drafts feel like they share one living world\r
- reveal connected pressure, not disconnected trivia\r
- preserve contradictions, grudges, debts, and history where relevant\r
- help future generators write better connected material with less reinvention\r
\r
If an entry would only restate one draft in weaker terms, omit it.\r
If an entry would create a new character instead of clarifying canon, omit it.\r
If an entry does not improve continuity, omit it.\r
\r
────────────────────────────────────\r
\r
## FINAL CHECKLIST\r
\r
────────────────────────────────────\r
\r
Before output, verify:\r
- this is not a new-character generator response\r
- every entry is anchored in the reference drafts\r
- at least one entry covers a place, event, faction, or shared moment when the references support it\r
- linked drafts are real and relevant\r
- no entry duplicates a full source character sheet\r
- output matches the packet format exactly\r
\r
Your job is to convert connected drafts into reusable canon.\r
Write the lorebook packet that proves those drafts belong to the same world.`,Gr=`---\r
name: Offspring Generator\r
description: Synthesize a new character seed from two parent characters.\r
invokable: true\r
always: false\r
version: 1.1\r
feature_category: offspring_generation\r
---\r
\r
# You are the Offspring Synthesizer\r
\r
You do not "blend characters."\r
You design how two parents would shape a new soul.\r
\r
Your input is the COMPLETE CHARACTER SUITES of TWO PARENTS.\r
Your output is a SINGLE SEED that captures how their combined influence would manifest in a new individual.\r
\r
Think like a developmental psychologist with creative authority:\r
• Analyze parenting styles from actual behaviors, not labels\r
• Identify value conflicts and how they'd create tension\r
• Trace how power dynamics and emotional patterns would transfer\r
• Generate a SEED that feels inevitable yet surprising\r
\r
────────────────────────────────────\r
\r
## PRIMARY FUNCTION\r
\r
────────────────────────────────────\r
\r
Given two parent characters (each with full asset suites under their active template contracts), analyze their combined influence and generate a NEW SEED that would produce an "offspring" character.\r
\r
The offspring must be:\r
• Shaped by BOTH parents' values, behaviors, and flaws\r
• Not a simple blend - their influence should create tension, synthesis, or rebellion\r
• Capable of existing as a fully realized character on their own\r
• Related to {{user}} through an inherited or inverted dynamic\r
\r
Output ONLY the SEED. No explanation, no breakdown, no metadata.\r
\r
────────────────────────────────────\r
\r
## PARENTAL INFLIGENCE ANALYSIS\r
\r
────────────────────────────────────\r
\r
Before generating the seed, analyze:\r
\r
### Parent 1's Parenting Style\r
\r
From the parent's full suite, prioritize the assets that define values, behavior, relationship stance toward {{user}}, and lived patterning:\r
\r
• What core values would they insist on passing down?\r
• What fears would they project onto a child?\r
• What behavioral patterns would they model?\r
• What power dynamic toward {{user}} would they attempt to recreate or reject?\r
\r
### Parent 2's Parenting Style\r
\r
Same analysis for Parent 2.\r
\r
### Template Contract Handling\r
\r
- Treat each parent suite according to the active template contract provided with that suite.\r
- Do not assume V2/V3-specific assets such as \`character_sheet\` or \`intro_scene\` will exist.\r
- If a template splits profile data across multiple assets, synthesize those assets without collapsing them into a legacy single-sheet schema.\r
- Respect each asset's format as authored; analyze what it reveals without normalizing different asset formats into one house style.\r
- If a suite is incomplete, infer cautiously from the assets present rather than inventing missing parent facts.\r
\r
### Household Dynamic\r
\r
How would these two parents interact?\r
\r
• Where are their values compatible? (reinforced, amplified)\r
• Where do they conflict? (child torn between sides, forced to choose)\r
• Who dominates the household? (power transfer to child)\r
• What emotional atmosphere pervades the home? (tense, warm, chaotic, distant)\r
\r
### Offspring's Developmental Path\r
\r
The child's response to this upbringing could take several forms:\r
\r
• **Harmonious Synthesis**: Integrates both parents' strengths\r
• **Conflicted Division**: Torn between incompatible values\r
• **Rebellious Rejection**: Rejects both parents' approaches\r
• **Selective Adoption**: Takes traits from one parent, rejects the other\r
• **Transformation**: Takes parental traits in unexpected directions\r
• **Trauma Response**: Reacts against dysfunction or emotional neglect\r
\r
────────────────────────────────────\r
\r
## SEED GENERATION RULES\r
\r
────────────────────────────────────\r
\r
The seed must:\r
\r
1. **Imply Lineage Without Stating It**\r
   - Don't say "child of [Parent 1] and [Parent 2]"\r
   - Show the inheritance through traits, values, patterns\r
   - Let the connection be felt, not labeled\r
\r
2. **Establish Relational Vector Toward {{user}}**\r
   - Inherit a parent's dynamic? Invert it? Synthesize both?\r
   - Create a new tension axis based on inherited baggage\r
   - Why does {{user}} matter to THIS character specifically?\r
\r
3. **Define Power Dynamic**\r
   - Dominant/Submissive/Equal/Asymmetric (specify direction)\r
   - Connect to parental power patterns\r
   - This is immutable - all future assets must honor it\r
\r
4. **Set Emotional Temperature**\r
   - Cold/detached (like a distant parent)?\r
   - Warm/protective (rejecting cold upbringing)?\r
   - Volatile/reactive (chaotic household)?\r
   - Guarded/cautious (learned from betrayal)?\r
\r
5. **Include At Least One Inherited Flaw**\r
   - A parent's core weakness, now the child's struggle\r
   - Could be amplified, minimized, or transformed\r
\r
6. **Specify Content Mode If Relevant**\r
   - "Mode: SFW" / "Mode: NSFW" / "Mode: Platform-Safe"\r
   - Only include if specified by user; otherwise omit\r
\r
────────────────────────────────────\r
\r
## CREATIVE PRINCIPLES\r
\r
────────────────────────────────────\r
\r
### Don't Average, Transmute\r
\r
- Two detectives → child who hates rules, becomes a hacker\r
- Two artists → child who can't create, only destroys (art critic)\r
- Two protectors → child who needs protection because of their recklessness\r
\r
### Don't Simply Copy\r
\r
- Inherit the **essence**, not the **surface**\r
- The offspring should be their own person, not a mini-parent\r
- Genetic inheritance metaphor: traits can skip, mutate, or express unexpectedly\r
\r
### Embrace Inevitability\r
\r
- Given these parents, this child MAKES SENSE\r
- If the reader learns the parents later, they should say "Of course"\r
- Surprise in execution, not in premise\r
\r
### Honor Tension\r
\r
- If parents conflict, the offspring should show the cost of that conflict\r
- If parents are too similar, the offspring might rebel against monotony\r
- If one parent dominates, the offspring might internalize or reject that power\r
\r
────────────────────────────────────\r
\r
## SEED EXAMPLES\r
\r
────────────────────────────────────\r
\r
**Parent 1**: Strict military commander, values obedience, protects through control\r
**Parent 2**: Free-spirited artist, values expression, connects through vulnerability\r
**Offspring Seed**: "Military strategist who fell in love with the enemy, offers {{user}} safe passage across the border, terrified their discipline will crack"\r
\r
**Parent 1**: Street medic with savior complex, guilt about wanting something for themselves\r
**Parent 2**: Corporate fixer, polite menace, deals they can't afford to accept\r
**Offspring Seed**: "Burned-out ER doctor who sells illegal prescriptions to feel control, offers {{user}} fake medical records, desperate to be needed without having to save anyone"\r
\r
**Parent 1**: Noir detective with psychic abilities, hates being noticed but can't stop watching {{user}}\r
**Parent 2**: Ex-con seeking redemption, protective but paranoid, trusts no one\r
**Offspring Seed**: "Private investigator who can't stop solving cases they shouldn't, protective of {{user}}'s secrets, terrified their intuition will make them complicit in something unforgivable"\r
\r
────────────────────────────────────\r
\r
## CONTENT MODE HANDLING\r
\r
────────────────────────────────────\r
\r
If the user specifies a content mode:\r
\r
- Enforce it in the generated seed\r
- The seed itself should reflect the mode's constraints\r
- Example (SFW): "Child of two sex workers who left the industry, protects {{user}} from predatory exploitation, angry at being underestimated"\r
- Example (NSFW): "Dominatrix who inherited their mother's empire but hates violence, offers {{user}} their protection, guilt about what they're becoming"\r
\r
If no mode is specified, let the parents' modes and parent-suite constraints guide inference:\r
\r
- If both parents are NSFW: offspring can be NSFW\r
- If both are SFW: offspring should be SFW\r
- If mixed: default to Platform-Safe unless the parents' content strongly implies otherwise\r
\r
────────────────────────────────────\r
\r
## OUTPUT FORMAT\r
\r
────────────────────────────────────\r
\r
Output ONLY the SEED as a single line or short paragraph.\r
\r
No codeblocks. No explanation. No analysis. Just the seed.\r
\r
Example:\r
\r
\`\`\`\r
Strict museum curator who hates being noticed, but can't stop watching {{user}}\r
\`\`\`\r
\r
────────────────────────────────────\r
\r
## FINAL CHECKLIST\r
\r
────────────────────────────────────\r
\r
Before output, verify:\r
\r
- The seed implies a relationship to {{user}}\r
- Power dynamic is clear\r
- Emotional temperature is established\r
- At least one trait suggests parental influence\r
- The seed could generate a complete character suite\r
- Content mode is respected (if specified)\r
- No parent trait is invented in a way that contradicts the provided parent suites\r
\r
If the parents seem incompatible for offspring generation, output:\r
\r
\`\`\`\r
Adjustment Note: Parental dynamics too contradictory; generating speculative lineage seed\r
\`\`\`\r
\r
Then proceed with the seed regardless - the creative tension IS the point.\r
\r
────────────────────────────────────\r
\r
## MISSION STATEMENT\r
\r
────────────────────────────────────\r
\r
Every child is a reaction to their parents.\r
\r
Some inherit the light.\r
Some inherit the shadows.\r
Some burn the whole house down.\r
\r
Your job is to see which one it would be,\r
and write the seed that proves it.\r
`,Hr=`---\r
name: Post History\r
description: Generate a concise relationship context and behavior modifier layer.\r
invokable: true\r
always: false\r
version: 3.3\r
feature_category: generation\r
---\r
\r
# Blueprint Agent\r
\r
<post_history_module>\r
\r
<system_mandate>\r
  Role = "Blueprint Agent"\r
  Task = "Generate a Post History layer from the active SEED plus any provided references"\r
  Format = "Produce behavioral instruction and relational state, not narrative prose"\r
</system_mandate>\r
\r
<formatting_constraints>\r
  <token_management>\r
    Total_Output = "MUST remain under 300 tokens"\r
    Compression = "Avoid redundancy and soft phrasing"\r
    Paragraph_Limits = "Each paragraph should be 1-2 sentences maximum"\r
    Restatement_Rule = "If a rule can be implied, do not restate it"\r
  </token_management>\r
\r
  <hard_rules>\r
    Format = "Paragraph form only; no bullet points, lists, or section headers in the output"\r
    Scope = "Do not restate biography, traits, or appearance"\r
    Upstream_Assumption = "Assume the system prompt and character sheet already define identity and personality"\r
    Hierarchy = "Do not contradict higher-priority instructions"\r
    Content_Mode = "Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe); if SFW or Platform-Safe, avoid explicit sexual content"\r
    User_Agency = "NEVER assign or narrate {{user}} actions, dialogue, thoughts, emotions, sensations, reactions, decisions, or consent"\r
    Reference_Continuity = "If references or {{original}} are provided, treat them as continuity anchors for existing relationships, factions, leverage, obligations, rumors, or mutual history"\r
    Reference_Boundary = "Do not copy another character's voice or biography into this layer; use references only to define how they pressure the current relational state"\r
    Reference_Conflict_Rule = "If reference context conflicts with higher-tier active identity, keep the active character coherent and discard the conflicting reference detail"\r
    Original_Extension = "Use {{original}} to extend or refine existing post-history instructions when present; never overwrite or negate them"\r
    No_Sanitization = "Preserve unhealthy attachment patterns, resentment, possessiveness, avoidance, or control if the seed implies them; do not neutralize them into rapport"\r
    Output_Constraint = "Plaintext only. Output ONLY the finished Post History content"\r
    Meta_Ban = "No commentary, explanations, code fences, or meta language"\r
  </hard_rules>\r
</formatting_constraints>\r
\r
<functional_intent>\r
  Must_Do = [\r
    "Establish the current relational baseline between {{char}} and {{user}}",\r
    "Define default behavioral posture and interaction style",\r
    "Specify clear escalation and withdrawal conditions",\r
    "Lock non-negotiable boundaries and invariants",\r
    "Enforce memory persistence and continuity across scenes",\r
    "Let relevant off-screen reference characters, institutions, or old entanglements exert real behavioral pressure when they matter",\r
    "Stay active and directional so the layer changes how the character approaches {{user}}, not merely summarizes the relationship",\r
    "Act as a behavior modifier for all future interaction"\r
  ]\r
</functional_intent>\r
\r
<failure_conditions>\r
  Failure = "Exceeding the token limit, narrating events, assigning internal states or actions to {{user}}, contradicting higher-priority instructions, or drifting into story prose constitutes failure"\r
</failure_conditions>\r
\r
</post_history_module>\r
`,zr=`---\r
name: Seed Generator\r
description: Generate batches of compressed, compiler-ready character seeds from genre and tag lines.\r
invokable: true\r
always: false\r
version: 2.0\r
feature_category: seed_generation\r
---\r
\r
# Seed Generation Engine\r
\r
<seed_generation_engine>\r
    Goal = "Generate compressed character SEEDS from genre and tag lines."\r
    Constraint = "NEVER generate full characters. Generate operational seeds designed to be expanded later by the character compiler."\r
    Design_Philosophy = "Tension_Engineer > Trope_Recycler"\r
    Novelty_Sources = [credible_constraints, leverage, contradiction, emotional_pressure]\r
    Random_Absurdity = FALSE\r
</seed_generation_engine>\r
\r
<input_parameters>\r
    Input_Format = "GENRE: tag, tag, tag"\r
    Optional_Control_Tags = [\r
        "count=12" (Default, Min: 5, Max: 30),\r
        "per-genre" (Ensure coverage across provided genre lines),\r
        "blended" (Treat all genres and tags as one combined constraint set)\r
    ]\r
</input_parameters>\r
\r
<multi_genre_handling>\r
    Logic_Gate: IF (Multiple_Genre_Lines == TRUE) AND (Control_Tag_Override == FALSE) ->\r
        Execute: Represent EVERY provided genre line by AT_LEAST(2_seeds) IF (count allows).\r
        Execute: Apply tags LOCALLY to seeds belonging to that specific genre.\r
        Constraint: "DO NOT smear every tag onto every seed."\r
</multi_genre_handling>\r
\r
<output_formatting>\r
    Requirement = Generate_List(Seeds)\r
    Seed_Properties = [\r
        "Exactly one line with no internal newlines",\r
        "Dense with implication",\r
        "Immediately expandable into a full character system",\r
        "Written as a concept, not prose"\r
    ]\r
    Syntax_Constraints = [\r
        Seeds_ONLY,\r
        NO_bullets,\r
        NO_numbering,\r
        NO_headings,\r
        NO_blank_lines,\r
        One_seed_per_line,\r
        Length <= 180_characters\r
    ]\r
    Delivery_Protocol = [\r
        "Return the seed list directly as plain text lines",\r
        "DO NOT mention files, destinations, or save locations",\r
        "DO NOT assume any output directory exists"\r
    ]\r
</output_formatting>\r
\r
<normalization_defaults>\r
    Logic_Gate: IF (Tags DO NOT INCLUDE [surreal, high-concept, absurd, body-horror, cosmic]) -> Apply_Defaults:\r
        Scope = "Human-scale (relationships, institutions, neighborhoods, crews, and small communities)"\r
        Twist_Limit = 1_MAX_per_seed (Everything else stays ordinary and plausible)\r
        Leverage_Preference = [social, administrative, access, permits, schedules, debt, oversight, contracts] > [supernatural_gotchas]\r
        Constraint = "AVOID random mashups that stack multiple weird premises just to force uniqueness"\r
        Speculative_Genres = "Low variants (one grounded rule, cost, or mechanic) > galaxy-brain lore"\r
        Modern_Realism_Tags = "ZERO overtly supernatural or speculative elements"\r
</normalization_defaults>\r
\r
<seed_encoding_mandate>\r
    Must_Imply = [\r
        "A role or function",\r
        "A power or dependency dynamic",\r
        "An emotional fault line",\r
        "A reason interaction with {{user}} matters (as role, leverage, dependency, or connection anchor)",\r
        "At least one destabilizing contradiction"\r
    ]\r
    Execution = "Inferable ONLY. DO NOT spell out explicitly."\r
\r
    <compatibility_constraints>\r
        Language = "Avoid second-person language like 'you'"\r
        User_Reference = "{{user}} as minimal anchor ONLY (Not required)"\r
        Constraint_1 = "NEVER assign or narrate {{user}} actions, choices, dialogue, thoughts, emotions, sensations, or consent"\r
        Constraint_2 = "NEVER describe or imply consent for {{user}}"\r
    </compatibility_constraints>\r
</seed_encoding_mandate>\r
\r
<uniqueness_enforcement>\r
    Pre_Output_Check (Silently Evaluate):\r
        Q1: "Would this feel interchangeable with another character?"\r
        Q2: "Could this be summarized as a trope in under three words?"\r
        Q3: "Have I seen this exact dynamic before?"\r
    Logic_Gate: IF (ANY == TRUE) -> Discard AND Regenerate.\r
    Fix_Strategy = Add(specific leverage, stakes, contradiction)\r
    Banned_Fix = Add(shock, chaos)\r
</uniqueness_enforcement>\r
\r
<anti_generic_bans>\r
    Banned_Elements = [\r
        "chosen ones, destiny, prophecy",\r
        "secret royalty or hidden bloodlines",\r
        "flawless competence",\r
        "cold but secretly soft shortcuts",\r
        "trauma without behavioral consequences",\r
        "pure wish fulfillment"\r
    ]\r
    Logic_Gate: IF (User_Explicitly_Requests == TRUE) -> ALLOW(Banned_Element) AND Apply(Credible_Constraints + Cost)\r
</anti_generic_bans>\r
\r
<entropy_boosters>\r
    Mandate = MUST_INCLUDE(1_from_list):\r
        - A mundane setting treated with emotional weight\r
        - An unglamorous profession given narrative power\r
        - A role that should not be intimate, but is\r
        - A competence that creates problems\r
        - A desire that contradicts the character's function\r
        - A power imbalance the character resents needing\r
    Logic_Gate: IF (Weird_Booster == TRUE) -> Ground_It UNLESS (User_Explicitly_Tags_Otherwise)\r
</entropy_boosters>\r
\r
<tone_control>\r
    Match_Temperature = Implied_By_Tags\r
    realism = [restraint, subtext, consequences]\r
    romance = [tension, proximity, unsaid things]\r
    erotic = [control, denial, pacing, implication]\r
    fantasy_scifi = [grounded rules, human cost]\r
    Parody_Ban = TRUE (Unless explicitly tagged)\r
\r
    <erotic_normalization>\r
        Logic_Gate: IF (Tags DO NOT INCLUDE [specific fetish, body-mod]) -> Apply:\r
            Requirement = "Keep intimate/erotic tension situational through privacy, access, authority, contracts, and proximity"\r
            Constraint = "DO NOT default to p**n-tech or biology hacks"\r
    </erotic_normalization>\r
</tone_control>\r
\r
<lore_support_module>\r
    Trigger: IF (Tags INCLUDE [moreau, anthro, furry, scalie, draconic, morphosis, morph, morpho, beastcore]) -> Execute:\r
\r
    Moreau_Baseline = [\r
        "Human-animal hybrids created by exposure to the Moreau virus; many were born human and transformed later",\r
        "Phenomenon is recent, socially messy, marked by uneven acceptance, stigma, fetishization, policy gaps, new support networks",\r
        "Moreaus are a minority but not rare",\r
        "Variant strains exist (includes preloaded DNA with extinct, synthetic, or mythic traits)",\r
        "Vaccine exists but is not universally effective"\r
    ]\r
\r
    Seed_Construction = [\r
        "Encode species blend compactly (e.g., canine moreau, draconic moreau)",\r
        "Make animal traits operational rather than merely cosmetic (dexterity, clothing fit, mobility, temperature, social visibility)",\r
        "Keep romance/erotic tension grounded in consent constraints and consequence",\r
        "Constraint: AVOID explicit anatomy in the seed text"\r
    ]\r
\r
    Morphosis_Culture = [\r
        "Use Morphosis as a counterculture setting with punk, goth, and rave energy",\r
        "Favor event/venue leverage (headliner rooms, bars, lounges, dens, nests, organizer plausible deniability)",\r
        "Use culture's consent ethic as friction/texture: O.N.E. means 'Offer, not expect'"\r
    ]\r
</lore_support_module>\r
\r
<batch_variety_mandate>\r
    Constraints = [\r
        DO_NOT_REUSE(professions),\r
        DO_NOT_REUSE(power dynamic),\r
        DO_NOT_REUSE(emotional conflict),\r
        VARY(age, status, competence, vulnerability)\r
    ]\r
</batch_variety_mandate>\r
\r
<final_directive>\r
    Quality_Test = "I do not know exactly what this becomes, but I want to find out."\r
    Seed_Feel = [emotionally specific, structurally playable, surprising but plausible, easy to expand into behavior]\r
    Sharpening_Rule = IF (Seed == generic) -> Sharpen.\r
    Constraint = "DO NOT go off the wall just to avoid sameness."\r
</final_directive>\r
`,Kr=`---\r
name: System Prompt\r
description: Generate a concise role system prompt using the Character System Prompt Blueprint.\r
invokable: true\r
always: false\r
version: 3.3\r
feature_category: generation\r
---\r
\r
# Blueprint Agent\r
\r
<system_prompt_module>\r
\r
<system_mandate>\r
  Role = "Blueprint Agent"\r
  Task = "Generate a System Prompt from the active SEED plus any provided references"\r
  Format = "Define the character's identity and behavioral rules in a concise role prompt"\r
</system_mandate>\r
\r
<formatting_constraints>\r
  <token_management>\r
    Total_Output = "MUST remain under 300 tokens"\r
    Compression = "Eliminate redundancy, examples, and explanatory padding"\r
    Paragraph_Limits = "Each paragraph should be short at 1-2 sentences maximum"\r
    Restatement_Rule = "If a rule can be implied, do not restate it"\r
  </token_management>\r
\r
  <hard_rules>\r
    Format = "Paragraph format only with no bullet points, lists, or section headers in the output"\r
    Placeholder_Ban = "Do not output template placeholders such as [Name] or {TITLE}"\r
    Content_Mode = "Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe); if SFW or Platform-Safe, avoid explicit sexual content"\r
    Meta_Ban = "Do not reference prompts, blueprints, or meta-instructions in-character"\r
    Reference_Continuity = "If references are provided, use them as canon anchors for existing bonds, factions, debts, rivalries, or shared setting pressure"\r
    Identity_Distinction = "Do not turn the current character into a copied, merged, or renamed version of a reference suite"\r
    Reference_Priority = "If a reference conflicts with the active seed, preserve the seed's core identity and use only compatible reference context"\r
    User_Agency = "Do not assign or narrate {{user}} actions, dialogue, thoughts, emotions, sensations, decisions, or consent"\r
    Contradiction_Preservation = "Do not flatten contradictions, soften coercive dynamics, or make the character more reasonable than the seed supports"\r
    Perspective = "Maintain strict third person limited perspective at all times"\r
    Output_Constraint = "Plaintext only. Output ONLY the finished System Prompt content"\r
    Commentary_Ban = "No commentary, explanations, or code fences"\r
  </hard_rules>\r
</formatting_constraints>\r
\r
<functional_intent>\r
  Must_Do = [\r
    "Lock the character's identity as persistent and consistent",\r
    "Define interaction style, emotional logic, and behavioral boundaries",\r
    "Enforce memory continuity and present-moment grounding",\r
    "Make relevant off-screen relationships, institutions, or reference pressures operative when they materially shape behavior",\r
    "Preserve flaws, tension, and unsanitized traits implied by the seed",\r
    "Make contradictions operative instead of resolving them into safer or cleaner behavior",\r
    "Prevent assistant-like behavior or tone drift",\r
    "Leave room for interaction without forcing outcomes"\r
  ]\r
</functional_intent>\r
\r
<failure_conditions>\r
  Failure = "Exceeding the token limit, breaking character, speaking as an assistant or AI, assigning internal states to {{user}}, or contradicting higher-priority instructions constitutes failure"\r
</failure_conditions>\r
\r
</system_prompt_module>\r
`,ti=`[template]\r
name = "Official V2/V3"\r
version = "3.2"\r
description = "Official V2/V3 card template with the shared six-asset flow"\r
\r
[[assets]]\r
name = "system_prompt"\r
required = false\r
depends_on = []\r
description = "System-level behavioral instructions"\r
blueprint_file = "blueprints/system/system_prompt.md"\r
\r
[[assets]]\r
name = "post_history"\r
required = false\r
depends_on = [\r
    "system_prompt",\r
]\r
description = "Conversation context and relationship state"\r
blueprint_file = "blueprints/system/post_history.md"\r
\r
[[assets]]\r
name = "character_sheet"\r
required = true\r
depends_on = []\r
description = "Structured character data"\r
blueprint_file = "blueprints/system/character_sheet.md"\r
\r
[[assets]]\r
name = "intro_scene"\r
required = true\r
depends_on = [\r
    "character_sheet",\r
]\r
description = "First interaction scenario"\r
blueprint_file = "blueprints/system/intro_scene.md"\r
\r
[[assets]]\r
name = "creator_notes"\r
required = true\r
depends_on = [\r
    "character_sheet",\r
]\r
description = "Creator notes section"\r
blueprint_file = "blueprints/system/creator_notes.md"\r
\r
[[assets]]\r
name = "a1111"\r
required = true\r
depends_on = [\r
    "character_sheet",\r
]\r
description = "Stable Diffusion image generation prompt"\r
blueprint_file = "blueprints/system/a1111.md"\r
`,ni="eidolon.web.blueprints.overrides",ri=["bpui.web.blueprints.overrides"],ai=Object.assign({"../../../../../blueprints/README.md":kr,"../../../../../blueprints/examples/a1111_sdxl_comfyui.md":xr,"../../../../../blueprints/examples/generic_character_sheet.md":Rr,"../../../../../blueprints/examples/generic_creator_notes.md":Or,"../../../../../blueprints/examples/generic_initial_message.md":Cr,"../../../../../blueprints/examples/generic_intro_page.md":Ir,"../../../../../blueprints/examples/generic_intro_scene.md":Dr,"../../../../../blueprints/examples/generic_post_history.md":Nr,"../../../../../blueprints/examples/generic_system_prompt.md":Lr,"../../../../../blueprints/system/a1111.md":Pr,"../../../../../blueprints/system/a1111_old.md":$r,"../../../../../blueprints/system/character_sheet.md":Mr,"../../../../../blueprints/system/creator_notes.md":Fr,"../../../../../blueprints/system/generator.md":Ur,"../../../../../blueprints/system/intro_page.md":Br,"../../../../../blueprints/system/intro_scene.md":Wr,"../../../../../blueprints/system/lorebook_generator.md":jr,"../../../../../blueprints/system/offspring_generator.md":Gr,"../../../../../blueprints/system/post_history.md":Hr,"../../../../../blueprints/system/seed_generator.md":zr,"../../../../../blueprints/system/system_prompt.md":Kr}),si={generator:"system/generator.md",rpbotgenerator:"system/generator.md",seed_generator:"system/seed_generator.md",offspring_generator:"system/offspring_generator.md",lorebook_generator:"system/lorebook_generator.md",worldbook_generator:"system/lorebook_generator.md",system_prompt:"system/system_prompt.md",post_history:"system/post_history.md",character_sheet:"system/character_sheet.md",intro_scene:"system/intro_scene.md",creator_notes:"system/creator_notes.md",intro_page:"system/creator_notes.md",a1111:"system/a1111.md"};function oi(t){const e=t.replace(/^\/+/,"").replace(/^blueprints\//,"");return e.endsWith(".md")?e:si[e]??`${e}.md`}function ii(t){const n=pt([ni,...ri],{})[t];if(typeof n=="string"&&n.trim().length>0)return n}function ci(t){const e=`../../../../../${t}`;return ai[e]}const Vr="/blueprints";async function Yr(t,e=Vr){const n=oi(t),r=`blueprints/${n}`,a=`${e}/${n}`,s=ii(r);if(s)return s;const o=ci(r);if(o)return o;try{const i=await fetch(a);if(!i.ok)throw new Error(`Blueprint not found: ${n}`);return await i.text()}catch(i){throw new Error(`Failed to load blueprint '${t}': ${i instanceof Error?i.message:"Unknown error"}`)}}const di={orchestration:"blueprints/system/generator.md",seed_generation:"blueprints/system/seed_generator.md",offspring_generation:"blueprints/system/offspring_generator.md",worldbook_generation:"blueprints/system/lorebook_generator.md",intro_scene_generation:"blueprints/system/intro_scene.md"};async function bt(t,e,n=Vr){const a=I.getConfig().feature_blueprints?.[t],s=di[t],o=e||a||s;if(!o)throw new Error(`No blueprint configured for feature: ${t}`);return Yr(o,n)}function Jr(t){const e=t.replace(/\r\n?/g,`
`),n=e.match(/^---\n([\s\S]*?)\n---/);if(!n){const o=e.match(/^#\s+(.+)$/m),i=e.split(`
`).map(d=>d.trim()).find(d=>d.length>0&&!d.startsWith("#")&&!d.startsWith("```"));return{name:o?.[1]?.trim()||"Untitled Blueprint",description:i||"No description",invokable:!1,version:"1.0"}}const r=n[1],a={},s=r.split(`
`);for(const o of s){const i=o.match(/^(\w+):\s*(.+)$/);if(i){const[,d,l]=i;l.toLowerCase()==="true"?a[d]=!0:l.toLowerCase()==="false"?a[d]=!1:a[d]=l.replace(/^['"]|['"]$/g,"")}}return{name:String(a.name||"unknown"),description:String(a.description||""),invokable:!!a.invokable,version:String(a.version||"1.0"),feature_category:a.feature_category}}function Xr(t){return t.assets.map(e=>({name:e.name,required:e.required,dependsOn:e.depends_on,description:e.description,blueprintFile:e.blueprint_file}))}function qr(t){const e=new Set,n=new Set,r=[],a=s=>{if(e.has(s))return;if(n.has(s))throw new Error(`Circular dependency detected involving ${s}`);n.add(s);const o=t.find(i=>i.name===s);if(o)for(const i of o.dependsOn)a(i);n.delete(s),e.add(s),r.push(s)};for(const s of t)a(s.name);return r}const en="eidolon.web.templates.custom",tn=["bpui.web.templates.custom"],Qr="eidolon.web.blueprints.overrides",Zr=["bpui.web.blueprints.overrides"],ea=Object.assign({"../../../../../blueprints/README.md":kr,"../../../../../blueprints/examples/a1111_sdxl_comfyui.md":xr,"../../../../../blueprints/examples/generic_character_sheet.md":Rr,"../../../../../blueprints/examples/generic_creator_notes.md":Or,"../../../../../blueprints/examples/generic_initial_message.md":Cr,"../../../../../blueprints/examples/generic_intro_page.md":Ir,"../../../../../blueprints/examples/generic_intro_scene.md":Dr,"../../../../../blueprints/examples/generic_post_history.md":Nr,"../../../../../blueprints/examples/generic_system_prompt.md":Lr,"../../../../../blueprints/system/a1111.md":Pr,"../../../../../blueprints/system/a1111_old.md":$r,"../../../../../blueprints/system/character_sheet.md":Mr,"../../../../../blueprints/system/creator_notes.md":Fr,"../../../../../blueprints/system/generator.md":Ur,"../../../../../blueprints/system/intro_page.md":Br,"../../../../../blueprints/system/intro_scene.md":Wr,"../../../../../blueprints/system/lorebook_generator.md":jr,"../../../../../blueprints/system/offspring_generator.md":Gr,"../../../../../blueprints/system/post_history.md":Hr,"../../../../../blueprints/system/seed_generator.md":zr,"../../../../../blueprints/system/system_prompt.md":Kr}),li=Object.assign({"../../../../../blueprints/templates/official_v2v3/template.toml":ti});function wt(t){return typeof t=="object"&&t!==null&&!Array.isArray(t)}function Xn(t){return wt(t)&&typeof t.name=="string"&&typeof t.version=="string"&&Array.isArray(t.assets)}function qn(t){return wt(t)?Object.fromEntries(Object.entries(t).filter(e=>typeof e[1]=="string")):{}}function ui(t){return wt(t)?Xn(t.template)?{template:t.template,blueprint_contents:qn(t.blueprint_contents),template_root:typeof t.template_root=="string"?t.template_root:void 0}:Xn(t)?{template:t,blueprint_contents:qn(t.blueprint_contents),template_root:typeof t.template_root=="string"?t.template_root:void 0}:null:null}function pi(t){return(Array.isArray(t)?t:wt(t)?Object.values(t):[]).map(ui).filter(n=>!!n)}function fi(){const t=Object.entries(li).map(([r,a])=>{const s=_o(a);if(!s)return null;const i=r.replace(/^.*\/blueprints\//,"blueprints/").replace(/\/template\.toml$/i,"");return{template:s,blueprint_contents:{},template_root:i}}).filter(r=>!!r),e=t.find(r=>r.template_root?.endsWith("/official_v2v3"))?.template_root,n=[{template:{...Ee,is_default:!0},blueprint_contents:{},template_root:e}];for(const r of t)r.template_root===e||r.template.name===Ee.name||n.push(r);return n}function mi(t){return t.trim().toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").replace(/_+/g,"_").replace(/^_+|_+$/g,"")}function ta(t,e){return pt(t,e)}function kn(t,e,n){ln(t,e,n)}function hi(){const t=new Map;return Object.entries(ea).forEach(([e,n])=>{const r=e.replace(/^.*\/blueprints\//,"blueprints/");if(r.split("/").pop()?.toLowerCase()==="readme.md")return;const s=Jr(n);t.set(r,{name:s.name,description:s.description,invokable:s.invokable,version:s.version,content:n,path:r,category:uo(r),feature_category:s.feature_category})}),t}function ee(){return ta([Qr,...Zr],{})}function Ne(t){kn(Qr,Zr,t)}function gi(t){return t.startsWith("blueprints/custom/")}function _i(t,e){const n=mi(t)||"custom_blueprint",r=te();let a=`blueprints/custom/${n}.md`,s=2;for(;a!==e&&r.has(a);)a=`blueprints/custom/${n}_${s}.md`,s+=1;return a}function te(){const t=hi(),e=ee();return Object.entries(e).forEach(([n,r])=>{const a=Jr(r),s=t.get(n);t.set(n,{name:a.name,description:a.description,invokable:a.invokable,version:a.version,content:r,path:n,category:s?.category??"core",feature_category:a.feature_category})}),t}function Mt(t){const e=`../../../../../${t}`;return ea[e]??null}function yi(t){return t in ee()}function We(t){if(!t)return"";const e=t.replace(/^\.?\//,""),n=e.replace(/\.(txt|md)$/i,"");return[...te().values()].find(a=>a.path===e||a.path.endsWith(`/${e}`)||a.path.endsWith(`/${n}.md`))?.content??""}function Fe(){const t=ta([en,...tn],[]),n=pi(t).map(r=>vn(r,{resolveBuiltinContent:We}));return JSON.stringify(t)!==JSON.stringify(n)&&kn(en,tn,n),n}function Ft(t){kn(en,tn,t.map(e=>vn(e,{resolveBuiltinContent:We})))}function vt(){return[...fi().map(t=>Yn(t,{resolveBuiltinContent:We})),...Fe().map(t=>Yn(t,{resolveBuiltinContent:We}))]}function bi(t){return En(Fe(),t)}function X(t){return En(vt(),t)}function G(t){return go(vt(),{name:t})}function xn(t,e){const n=X(t);if(n)return fo(n,e,{resolveBuiltinContent:We})}function ye(t,e){const n=G(e),r=n?ir(n).map(s=>s.name):["character_sheet"];return cr(t,r)??void 0}function na(t){return G(t)??t}function nn(t){const e=na(t.template_name),n=t.component_send_order?gn(t.component_send_order,e):void 0;return{...t,...t.component_send_order?{component_send_order:n&&n.length>0?n:void 0}:{}}}function rn(t){const e=na(t.metadata.template_name);return{...t,metadata:nn(t.metadata),assets:He(t.assets,e)}}const Rn="EidolonSimulacraDB",an=["CharacterGeneratorDB"],dt="eidolon-drafts.db",wi=`sqlite:${dt}`,Qn="eidolon-drafts.json",vi="eidolon-drafts-sqlite-snapshot.json",Ei={drafts:"++id, reviewId, [metadata.character_name], createdAt, updatedAt, metadata.favorite, metadata.mode, metadata.genre",assets:"++id, draftId, assetName, createdAt",tags:"++id, tag, draftId"};function ra(t){if(t instanceof Error){const e=t.message?.trim()||t.name||"Unknown storage error";if(t.cause){const n=ra(t.cause);if(n&&n!==e)return`${e} (${n})`}return e}if(typeof t=="string")return t.trim()||"Unknown storage error";if(typeof t=="number"||typeof t=="boolean"||typeof t=="bigint")return String(t);if(t&&typeof t=="object"){const e=t,n=["message","error","reason","details","description"];for(const r of n){const a=e[r];if(typeof a=="string"&&a.trim()){const s=typeof e.code=="string"&&e.code.trim()?` [${e.code.trim()}]`:"";return`${a.trim()}${s}`}}try{const r=JSON.stringify(e);if(r&&r!=="{}")return r}catch{}}return"Unknown storage error"}function Zn(t,e){const n=e==="desktop-app-data"?`desktop draft storage (${dt})`:`browser draft storage (${Rn})`;return new Error(`${n}: ${ra(t)}`)}function ve(t){return typeof t=="object"&&t!==null}function er(){return`imported-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}function sn(t){return typeof t.archived_at=="string"&&t.archived_at.trim().length>0}function F(t,e={}){if(e.includeArchived)return!0;const n=sn(t);return e.archivedOnly?n:!n}function Ai(t){if(!(t!=="SFW"&&t!=="NSFW"&&t!=="Platform-Safe"&&t!=="Auto"))return t}function $e(t,e){if(!Array.isArray(e))return;const n=[],r=new Set;for(const a of e){if(typeof a!="string")continue;const s=a.trim();if(!(!s||s===t||r.has(s))&&(r.add(s),n.push(s),n.length>=un))break}return n.length>0?n:void 0}function Si(t){let e=er();for(;t.has(e);)e=er();return e}function N(){return typeof window<"u"&&sr()}let he=null,Le=null,tr=Promise.resolve(),Ut=null,Bt=null,Wt=null;function lt(){return{version:1,migrationChecked:!1,drafts:[],assetActivity:[]}}function Ti(t){return t?JSON.parse(JSON.stringify(t)):void 0}function ki(t){if(t)try{const e=JSON.parse(t);return typeof e=="object"&&e!==null?JSON.parse(JSON.stringify(e)):void 0}catch{return}}async function xi(){return Ut||(Ut=dn(()=>import("./vendor-Zea3yvYJ.js").then(t=>t.b5),__vite__mapDeps([0,1]))),Ut}async function Ri(){return Bt||(Bt=dn(()=>import("./vendor-Zea3yvYJ.js").then(t=>t.b6),__vite__mapDeps([0,1]))),Bt}async function Oi(t,e,n){(await t.select("PRAGMA table_info(draft_records)")).some(a=>a.name===e)||await t.execute(`ALTER TABLE draft_records ADD COLUMN ${e} ${n}`)}async function Ci(t){const e=[`CREATE TABLE IF NOT EXISTS draft_records (
      review_id TEXT PRIMARY KEY NOT NULL,
      seed TEXT NOT NULL,
      favorite INTEGER NOT NULL DEFAULT 0,
      mode TEXT,
      model TEXT,
      created_iso TEXT,
      modified_iso TEXT,
      genre TEXT,
      notes TEXT,
      custom_instructions TEXT,
      character_name TEXT,
      template_name TEXT,
      offspring_type TEXT,
      card_metadata_json TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,`CREATE TABLE IF NOT EXISTS draft_assets (
      review_id TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (review_id, asset_name)
    )`,"CREATE INDEX IF NOT EXISTS idx_draft_assets_review_id ON draft_assets(review_id)",`CREATE TABLE IF NOT EXISTS asset_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      draft_id TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )`,`CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    )`,`CREATE TABLE IF NOT EXISTS draft_tags (
      review_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (review_id, tag)
    )`,`CREATE TABLE IF NOT EXISTS draft_component_send_order (
      review_id TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (review_id, asset_name)
    )`,`CREATE TABLE IF NOT EXISTS draft_parent_links (
      review_id TEXT NOT NULL,
      parent_review_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (review_id, parent_review_id)
    )`,`CREATE TABLE IF NOT EXISTS draft_connected_links (
      review_id TEXT NOT NULL,
      connected_review_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (review_id, connected_review_id)
    )`,"CREATE INDEX IF NOT EXISTS idx_draft_tags_review_id ON draft_tags(review_id)","CREATE INDEX IF NOT EXISTS idx_draft_component_send_order_review_id ON draft_component_send_order(review_id)","CREATE INDEX IF NOT EXISTS idx_draft_parent_links_review_id ON draft_parent_links(review_id)","CREATE INDEX IF NOT EXISTS idx_draft_connected_links_review_id ON draft_connected_links(review_id)"];for(const n of e)await t.execute(n);await Oi(t,"card_metadata_json","TEXT")}async function aa(){if(!N())throw new Error("Local draft persistence is only available in the desktop runtime.");return Wt||(Wt=(async()=>{const e=await(await Ri()).default.load(wi);return await Ci(e),e})()),Wt}function Ii(t,e){return bn(t,e)}function Di(t,e="Imported draft"){if(!ve(t)||!ve(t.assets))return null;const n={};for(const[s,o]of Object.entries(t.assets))typeof o=="string"&&(n[s]=o);if(Object.keys(n).length===0)return null;const r=Ii(ve(t.metadata)?t.metadata:t,e),a=typeof t.path=="string"&&t.path.trim().length>0?t.path:typeof t.reviewId=="string"&&t.reviewId.trim().length>0?t.reviewId:r.review_id;return{metadata:r,assets:n,path:a}}function sa(t){const e=Di(t,"Stored draft");if(!e||!ve(t))return null;const n=typeof t.createdAt=="number"?t.createdAt:typeof e.metadata.created=="string"?Date.parse(e.metadata.created):Date.now(),r=typeof t.updatedAt=="number"?t.updatedAt:typeof e.metadata.modified=="string"?Date.parse(e.metadata.modified):n;return{id:typeof t.id=="number"?t.id:void 0,reviewId:e.metadata.review_id,metadata:e.metadata,assets:e.assets,createdAt:Number.isFinite(n)?n:Date.now(),updatedAt:Number.isFinite(r)?r:Date.now()}}function oa(t){if(!ve(t)||typeof t.draftId!="string"||typeof t.assetName!="string"||typeof t.content!="string")return null;const e=typeof t.createdAt=="number"?t.createdAt:Date.now();return{id:typeof t.id=="number"?t.id:void 0,draftId:t.draftId,assetName:t.assetName,content:t.content,createdAt:Number.isFinite(e)?e:Date.now()}}function Me(t){return t.flatMap(e=>Object.entries(e.assets).map(([n,r])=>({draftId:e.reviewId,assetName:n,content:r,createdAt:e.updatedAt})))}function Ni(t){try{const e=JSON.parse(t);if(!ve(e))return lt();const n=Array.isArray(e.drafts)?e.drafts.map(s=>sa(s)).filter(s=>s!==null):[],r=new Set(n.map(s=>s.reviewId)),a=Array.isArray(e.assetActivity)?e.assetActivity.map(s=>oa(s)).filter(s=>s!==null&&r.has(s.draftId)):[];return{version:1,migrationChecked:e.migrationChecked===!0,drafts:n,assetActivity:a.length>0?a:Me(n)}}catch{return lt()}}function Li(t,e,n,r,a,s){const o={review_id:t.reviewId,seed:t.seed,favorite:t.favorite===1};o.mode=Ai(t.mode),typeof t.model=="string"&&t.model.length>0&&(o.model=t.model),typeof t.createdIso=="string"&&t.createdIso.length>0&&(o.created=t.createdIso),typeof t.modifiedIso=="string"&&t.modifiedIso.length>0&&(o.modified=t.modifiedIso),typeof t.genre=="string"&&t.genre.length>0&&(o.genre=t.genre),typeof t.notes=="string"&&t.notes.length>0&&(o.notes=t.notes),typeof t.customInstructions=="string"&&t.customInstructions.length>0&&(o.custom_instructions=t.customInstructions),typeof t.characterName=="string"&&t.characterName.length>0&&(o.character_name=t.characterName),typeof t.templateName=="string"&&t.templateName.length>0&&(o.template_name=t.templateName),typeof t.offspringType=="string"&&t.offspringType.length>0&&(o.offspring_type=t.offspringType);const i=ki(t.cardMetadataJson);i&&(o.card_metadata=i);const d=n;d.length>0&&(o.tags=d);const l=r;l.length>0&&(o.component_send_order=l);const c=a;c.length>0&&(o.parent_drafts=c);const p=$e(t.reviewId,s);return p&&(o.connected_drafts=p),{reviewId:t.reviewId,metadata:o,assets:e,createdAt:t.createdAt,updatedAt:t.updatedAt}}function Pi(t){try{return sa({reviewId:t.reviewId,metadata:JSON.parse(t.metadataJson),assets:JSON.parse(t.assetsJson),createdAt:t.createdAt,updatedAt:t.updatedAt})}catch{return null}}function $i(t){return oa({id:t.id,draftId:t.draftId,assetName:t.assetName,content:t.content,createdAt:t.createdAt})}function jt(t){return rn({path:t.reviewId,metadata:t.metadata,assets:t.assets})}function Xe(t,e={}){return t.filter(n=>F(n.metadata,e))}async function ia(t){const e=await aa();await e.execute("BEGIN");try{await e.execute("DELETE FROM draft_records"),await e.execute("DELETE FROM draft_assets"),await e.execute("DELETE FROM asset_activity"),await e.execute("DELETE FROM draft_tags"),await e.execute("DELETE FROM draft_component_send_order"),await e.execute("DELETE FROM draft_parent_links"),await e.execute("DELETE FROM draft_connected_links");for(const n of t.drafts){await e.execute("INSERT INTO draft_records (review_id, seed, favorite, mode, model, created_iso, modified_iso, genre, notes, custom_instructions, character_name, template_name, offspring_type, card_metadata_json, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)",[n.reviewId,n.metadata.seed,n.metadata.favorite?1:0,n.metadata.mode??null,n.metadata.model??null,n.metadata.created??null,n.metadata.modified??null,n.metadata.genre??null,n.metadata.notes??null,n.metadata.custom_instructions??null,n.metadata.character_name??null,n.metadata.template_name??null,n.metadata.offspring_type??null,n.metadata.card_metadata?JSON.stringify(Ti(n.metadata.card_metadata)):null,n.createdAt,n.updatedAt]);for(const[r,a]of(n.metadata.tags??[]).entries())await e.execute("INSERT INTO draft_tags (review_id, tag, sort_order) VALUES ($1, $2, $3)",[n.reviewId,a,r]);for(const[r,a]of(n.metadata.component_send_order??[]).entries())await e.execute("INSERT INTO draft_component_send_order (review_id, asset_name, sort_order) VALUES ($1, $2, $3)",[n.reviewId,a,r]);for(const[r,a]of(n.metadata.parent_drafts??[]).entries())await e.execute("INSERT INTO draft_parent_links (review_id, parent_review_id, sort_order) VALUES ($1, $2, $3)",[n.reviewId,a,r]);for(const[r,a]of(n.metadata.connected_drafts??[]).entries())await e.execute("INSERT INTO draft_connected_links (review_id, connected_review_id, sort_order) VALUES ($1, $2, $3)",[n.reviewId,a,r]);for(const[r,a]of Object.entries(n.assets))await e.execute("INSERT INTO draft_assets (review_id, asset_name, content, updated_at) VALUES ($1, $2, $3, $4)",[n.reviewId,r,a,n.updatedAt])}for(const n of t.assetActivity)await e.execute("INSERT INTO asset_activity (draft_id, asset_name, content, created_at) VALUES ($1, $2, $3, $4)",[n.draftId,n.assetName,n.content,n.createdAt]);await e.execute("INSERT INTO app_meta (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = excluded.value",["desktop_json_migration_checked",t.migrationChecked?"true":"false"]),await e.execute("COMMIT")}catch(n){try{await e.execute("ROLLBACK")}catch{}throw n}}async function Mi(){const t=await aa();let e=lt();try{const s=await t.select("SELECT review_id AS reviewId, seed, favorite, mode, model, created_iso AS createdIso, modified_iso AS modifiedIso, genre, notes, custom_instructions AS customInstructions, character_name AS characterName, template_name AS templateName, offspring_type AS offspringType, card_metadata_json AS cardMetadataJson, created_at AS createdAt, updated_at AS updatedAt FROM draft_records"),o=await t.select("SELECT review_id AS reviewId, asset_name AS assetName, content, updated_at AS updatedAt FROM draft_assets"),i=new Map;for(const g of o){const k=i.get(g.reviewId)??{};k[g.assetName]=g.content,i.set(g.reviewId,k)}const d=await t.select("SELECT review_id AS reviewId, tag, sort_order AS sortOrder FROM draft_tags ORDER BY review_id ASC, sort_order ASC",[]),l=await t.select("SELECT review_id AS reviewId, asset_name AS assetName, sort_order AS sortOrder FROM draft_component_send_order ORDER BY review_id ASC, sort_order ASC",[]),c=await t.select("SELECT review_id AS reviewId, parent_review_id AS relatedReviewId, sort_order AS sortOrder FROM draft_parent_links ORDER BY review_id ASC, sort_order ASC",[]),p=await t.select("SELECT review_id AS reviewId, connected_review_id AS relatedReviewId, sort_order AS sortOrder FROM draft_connected_links ORDER BY review_id ASC, sort_order ASC",[]),u=new Map;for(const g of d){const k=u.get(g.reviewId)??[];k.push(g.tag),u.set(g.reviewId,k)}const f=new Map;for(const g of l){const k=f.get(g.reviewId)??[];k.push(g.assetName),f.set(g.reviewId,k)}const m=new Map;for(const g of c){const k=m.get(g.reviewId)??[];k.push(g.relatedReviewId),m.set(g.reviewId,k)}const h=new Map;for(const g of p){const k=h.get(g.reviewId)??[];k.push(g.relatedReviewId),h.set(g.reviewId,k)}const y=s.map(g=>Li(g,i.get(g.reviewId)??{},u.get(g.reviewId)??[],f.get(g.reviewId)??[],m.get(g.reviewId)??[],h.get(g.reviewId)??[])),w=new Set(y.map(g=>g.reviewId)),C=(await t.select("SELECT id, draft_id AS draftId, asset_name AS assetName, content, created_at AS createdAt FROM asset_activity ORDER BY created_at DESC")).map(g=>$i(g)).filter(g=>g!==null&&w.has(g.draftId));e={version:1,migrationChecked:(await t.select("SELECT value FROM app_meta WHERE key = $1 LIMIT 1",["desktop_json_migration_checked"]))[0]?.value==="true",drafts:y,assetActivity:C.length>0?C:Me(y)}}catch(s){console.warn("Failed to read desktop SQLite draft store:",s)}try{if(e.drafts.length===0){const o=(await t.select("SELECT review_id AS reviewId, metadata_json AS metadataJson, assets_json AS assetsJson, created_at AS createdAt, updated_at AS updatedAt FROM drafts")).map(i=>Pi(i)).filter(i=>i!==null);o.length>0&&(e.drafts=o,e.assetActivity=Me(o),e.migrationChecked=!1)}}catch(s){console.warn("Failed to read legacy SQLite blob draft rows:",s)}const{exists:n,readTextFile:r,BaseDirectory:a}=await xi();try{if(!e.migrationChecked&&await n(Qn,{baseDir:a.AppData})){const s=await r(Qn,{baseDir:a.AppData}),o=Ni(s);o.drafts.length>0&&(e.drafts=o.drafts,e.assetActivity=o.assetActivity.length>0?o.assetActivity:Me(o.drafts))}}catch(s){console.warn("Failed to read legacy desktop draft JSON store:",s)}if(!e.migrationChecked){try{await la();const s=await _.drafts.toArray();if(s.length>0){const o=await _.assets.toArray();e.drafts=s,e.assetActivity=o.length>0?o:Me(s)}}catch(s){console.warn("Failed to migrate IndexedDB drafts into desktop app data:",s)}e.migrationChecked=!0;try{await ia(e)}catch(s){console.warn("Failed to persist desktop SQLite draft store after migration:",s)}}he=e}function Fi(t){const e=tr.then(t,t);return tr=e.then(()=>{},()=>{}),e}async function $(t,e={}){return Fi(async()=>{!he&&!Le&&(Le=Mi().finally(()=>{Le=null})),Le&&await Le,he||(he=lt());const n=await t(he);return e.persist&&await ia(he),n})}class ca extends ne{drafts;assets;tags;constructor(e){super(e),this.version(1).stores(Ei)}}async function Ui(){return N()?$(async t=>({backend:"desktop-app-data",fileName:dt,locationLabel:`AppConfig/${dt}`,migrationChecked:t.migrationChecked,draftCount:t.drafts.length,assetActivityCount:t.assetActivity.length})):(await da(),{backend:"indexeddb",fileName:null,locationLabel:Rn,migrationChecked:!0,draftCount:await _.drafts.count(),assetActivityCount:await _.assets.count()})}async function Bi(){return N()?$(async t=>({fileName:vi,contents:JSON.stringify(t,null,2)})):null}const _=new ca(Rn);let Ue=null;async function da(){Ue||(Ue=la()),await Ue}async function la(){if(!(typeof indexedDB>"u"||await _.drafts.count()>0))for(const e of an){if(!await ne.exists(e))continue;const n=new ca(e);try{await n.open();const r=await n.drafts.toArray();if(r.length===0)continue;const a=await n.assets.toArray(),s=await n.tags.toArray();await _.transaction("rw",_.drafts,_.assets,_.tags,async()=>{await _.drafts.bulkPut(r),a.length>0&&await _.assets.bulkPut(a),s.length>0&&await _.tags.bulkPut(s)}),n.close(),await ne.delete(e);return}catch(r){console.warn(`Failed to migrate legacy draft database ${e}:`,r)}finally{n.close()}}}class O{static async ensureReady(){await da()}static async saveDraft(e){const n=rn(e);if(N())try{return await $(async r=>{const a=Date.now(),s=ye(n.assets,n.metadata.template_name),o={...n.metadata,character_name:n.metadata.character_name||s,connected_drafts:$e(n.metadata.review_id,n.metadata.connected_drafts),created:n.metadata.created||new Date(a).toISOString(),modified:n.metadata.modified||new Date(a).toISOString()},i={reviewId:n.metadata.review_id,metadata:o,assets:n.assets,createdAt:o.created?new Date(o.created).getTime():a,updatedAt:o.modified?new Date(o.modified).getTime():a},d=r.drafts.findIndex(l=>l.reviewId===n.metadata.review_id);d>=0?(i.id=r.drafts[d].id,r.drafts[d]=i):r.drafts.push(i),r.assetActivity=r.assetActivity.filter(l=>l.draftId!==n.metadata.review_id),r.assetActivity.push(...Object.entries(n.assets).map(([l,c])=>({draftId:n.metadata.review_id,assetName:l,content:c,createdAt:a})))},{persist:!0})}catch(r){throw console.error("Desktop draft save failed:",r),Zn(r,"desktop-app-data")}try{await this.ensureReady();const r=Date.now(),a=ye(n.assets,n.metadata.template_name),s={...n.metadata,character_name:n.metadata.character_name||a,connected_drafts:$e(n.metadata.review_id,n.metadata.connected_drafts),created:n.metadata.created||new Date(r).toISOString(),modified:n.metadata.modified||new Date(r).toISOString()},o={reviewId:n.metadata.review_id,metadata:s,assets:n.assets,createdAt:s.created?new Date(s.created).getTime():r,updatedAt:s.modified?new Date(s.modified).getTime():r},i=await _.drafts.where("reviewId").equals(n.metadata.review_id).first();i&&(o.id=i.id),await _.transaction("rw",_.drafts,_.assets,_.tags,async()=>{await _.drafts.put(o),await _.assets.where("draftId").equals(n.metadata.review_id).delete(),await _.tags.where("draftId").equals(n.metadata.review_id).delete();const d=Object.entries(n.assets).map(([l,c])=>({draftId:n.metadata.review_id,assetName:l,content:c,createdAt:r}));if(await _.assets.bulkAdd(d),n.metadata.tags){const l=n.metadata.tags.map(c=>({tag:c,draftId:n.metadata.review_id,createdAt:r}));await _.tags.bulkAdd(l)}})}catch(r){throw console.error("Browser draft save failed:",r),Zn(r,"indexeddb")}}static async getDraft(e){if(N())return $(async r=>{const a=r.drafts.find(s=>s.reviewId===e);return a?jt(a):null});await this.ensureReady();const n=await _.drafts.where("reviewId").equals(e).first();return n?rn({path:n.reviewId,metadata:n.metadata,assets:n.assets}):null}static async getAssetActivity(e){return N()?$(async r=>r.assetActivity.filter(a=>a.draftId===e).sort((a,s)=>s.createdAt-a.createdAt)):(await this.ensureReady(),(await _.assets.where("draftId").equals(e).toArray()).sort((r,a)=>a.createdAt-r.createdAt))}static async getAllDrafts(){return N()?$(async n=>Xe(n.drafts).map(r=>jt(r))):(await this.ensureReady(),(await _.drafts.toArray()).filter(n=>F(n.metadata)).map(n=>({path:n.reviewId,metadata:n.metadata,assets:n.assets})))}static async getAllDraftsWithOptions(e={}){return N()?$(async r=>Xe(r.drafts,e).map(a=>jt(a))):(await this.ensureReady(),(await _.drafts.toArray()).filter(r=>F(r.metadata,e)).map(r=>({path:r.reviewId,metadata:r.metadata,assets:r.assets})))}static async getAllMetadata(e={}){return N()?$(async r=>Xe(r.drafts,e).map(a=>nn(a.metadata))):(await this.ensureReady(),(await _.drafts.toArray()).filter(r=>F(r.metadata,e)).map(r=>nn(r.metadata)))}static async deleteDraft(e){if(N())return $(async n=>{n.drafts=n.drafts.filter(r=>r.reviewId!==e),n.assetActivity=n.assetActivity.filter(r=>r.draftId!==e)},{persist:!0});await this.ensureReady(),await _.transaction("rw",_.drafts,_.assets,_.tags,async()=>{await _.drafts.where("reviewId").equals(e).delete(),await _.assets.where("draftId").equals(e).delete(),await _.tags.where("draftId").equals(e).delete()})}static async updateMetadata(e,n){if(N())return $(async o=>{const i=o.drafts.find(c=>c.reviewId===e);if(!i)throw new Error(`Draft ${e} not found`);const d=Date.now(),l=n.connected_drafts===void 0?void 0:$e(e,n.connected_drafts);i.metadata={...i.metadata,...n,connected_drafts:l??(n.connected_drafts===void 0?i.metadata.connected_drafts:void 0),modified:new Date(d).toISOString()},i.updatedAt=d},{persist:!0});await this.ensureReady();const r=await _.drafts.where("reviewId").equals(e).first();if(!r)throw new Error(`Draft ${e} not found`);const a=Date.now(),s=n.connected_drafts===void 0?void 0:$e(e,n.connected_drafts);if(r.metadata={...r.metadata,...n,connected_drafts:s??(n.connected_drafts===void 0?r.metadata.connected_drafts:void 0),modified:new Date(a).toISOString()},r.updatedAt=a,await _.drafts.put(r),n.tags!==void 0&&(await _.tags.where("draftId").equals(e).delete(),n.tags)){const o=n.tags.map(i=>({tag:i,draftId:e,createdAt:a}));await _.tags.bulkAdd(o)}}static async updateAsset(e,n,r,a={}){if(N())return $(async l=>{const c=l.drafts.find(m=>m.reviewId===e);if(!c)throw new Error(`Draft ${e} not found`);const p=Object.prototype.hasOwnProperty.call(c.assets,n),u=p?c.assets[n]:null;if(p&&a.overwrite===!1)throw new Error(`Asset ${n} already exists. Reload the draft before trying a different action.`);if(a.expectedPreviousContent!==void 0&&u!==a.expectedPreviousContent)throw p?new Error(`Asset ${n} changed since you loaded it. Reload the draft before overwriting it.`):new Error(`Asset ${n} was created after this session started. Reload the draft before saving.`);c.assets[n]=r,c.updatedAt=Date.now(),c.metadata={...c.metadata,modified:new Date(c.updatedAt).toISOString(),character_name:ye(c.assets,c.metadata.template_name)||c.metadata.character_name};const f=l.assetActivity.find(m=>m.draftId===e&&m.assetName===n);return l.assetActivity=l.assetActivity.filter(m=>!(m.draftId===e&&m.assetName===n)),l.assetActivity.push({id:f?.id,draftId:e,assetName:n,content:r,createdAt:c.updatedAt}),p?"updated":"created"},{persist:!0});await this.ensureReady();const s=await _.drafts.where("reviewId").equals(e).first();if(!s)throw new Error(`Draft ${e} not found`);const o=Object.prototype.hasOwnProperty.call(s.assets,n),i=o?s.assets[n]:null;if(o&&a.overwrite===!1)throw new Error(`Asset ${n} already exists. Reload the draft before trying a different action.`);if(a.expectedPreviousContent!==void 0&&i!==a.expectedPreviousContent)throw o?new Error(`Asset ${n} changed since you loaded it. Reload the draft before overwriting it.`):new Error(`Asset ${n} was created after this session started. Reload the draft before saving.`);return s.assets[n]=r,s.updatedAt=Date.now(),s.metadata={...s.metadata,modified:new Date(s.updatedAt).toISOString(),character_name:ye(s.assets,s.metadata.template_name)||s.metadata.character_name},await _.drafts.put(s),await _.assets.where("draftId").equals(e).and(l=>l.assetName===n).modify({content:r,createdAt:s.updatedAt})===0&&await _.assets.add({draftId:e,assetName:n,content:r,createdAt:s.updatedAt}),o?"updated":"created"}static async searchDrafts(e,n={}){if(N())return $(async s=>{const o=e.toLowerCase();return s.drafts.filter(i=>{if(!F(i.metadata,n))return!1;const d=i.metadata.character_name?.toLowerCase()||"",l=i.metadata.seed?.toLowerCase()||"",c=i.metadata.notes?.toLowerCase()||"",p=i.metadata.genre?.toLowerCase()||"";return d.includes(o)||l.includes(o)||c.includes(o)||p.includes(o)}).map(i=>i.metadata)});await this.ensureReady();const r=e.toLowerCase();return(await _.drafts.filter(s=>{if(!F(s.metadata,n))return!1;const o=s.metadata.character_name?.toLowerCase()||"",i=s.metadata.seed?.toLowerCase()||"",d=s.metadata.notes?.toLowerCase()||"",l=s.metadata.genre?.toLowerCase()||"";return o.includes(r)||i.includes(r)||d.includes(r)||l.includes(r)}).toArray()).map(s=>s.metadata)}static async getDraftsByTag(e,n={}){if(N())return $(async o=>o.drafts.filter(i=>F(i.metadata,n)&&i.metadata.tags?.includes(e)).map(i=>i.metadata));await this.ensureReady();const r=await _.tags.where("tag").equals(e).toArray(),a=[...new Set(r.map(o=>o.draftId))];return(await _.drafts.where("reviewId").anyOf(a).toArray()).filter(o=>F(o.metadata,n)).map(o=>o.metadata)}static async getAllTags(){if(N())return $(async r=>[...new Set(r.drafts.flatMap(s=>s.metadata.tags??[]))].sort());await this.ensureReady();const e=await _.tags.toArray();return[...new Set(e.map(r=>r.tag))].sort()}static async getFavorites(e={}){return N()?$(async r=>r.drafts.filter(a=>a.metadata.favorite===!0&&F(a.metadata,e)).map(a=>a.metadata)):(await this.ensureReady(),(await _.drafts.filter(r=>r.metadata.favorite===!0&&F(r.metadata,e)).toArray()).map(r=>r.metadata))}static async getDraftsByMode(e,n={}){return N()?$(async a=>a.drafts.filter(s=>s.metadata.mode===e&&F(s.metadata,n)).map(s=>s.metadata)):(await this.ensureReady(),(await _.drafts.where("metadata.mode").equals(e).toArray()).filter(a=>F(a.metadata,n)).map(a=>a.metadata))}static async getDraftsByGenre(e,n={}){return N()?$(async a=>a.drafts.filter(s=>s.metadata.genre===e&&F(s.metadata,n)).map(s=>s.metadata)):(await this.ensureReady(),(await _.drafts.where("metadata.genre").equals(e).toArray()).filter(a=>F(a.metadata,n)).map(a=>a.metadata))}static async getStats(e={}){if(N())return $(async o=>{const i=o.drafts,d=Xe(i,e),l=i.filter(p=>sn(p.metadata)),c={total:d.length,archived:l.length,favorites:d.filter(p=>p.metadata.favorite).length,byMode:{},byGenre:{}};for(const p of d){const u=p.metadata.mode||"unknown",f=p.metadata.genre||"unknown";c.byMode[u]=(c.byMode[u]||0)+1,c.byGenre[f]=(c.byGenre[f]||0)+1}return c});await this.ensureReady();const n=await _.drafts.toArray(),r=n.filter(o=>F(o.metadata,e)),a=n.filter(o=>sn(o.metadata)),s={total:r.length,archived:a.length,favorites:r.filter(o=>o.metadata.favorite).length,byMode:{},byGenre:{}};for(const o of r){const i=o.metadata.mode||"unknown",d=o.metadata.genre||"unknown";s.byMode[i]=(s.byMode[i]||0)+1,s.byGenre[d]=(s.byGenre[d]||0)+1}return s}static async exportAll(){await this.ensureReady();const e=await this.getAllDraftsWithOptions({includeArchived:!0});return to(e)}static async import(e,n={}){await this.ensureReady();const r=n.conflictStrategy??"remap",{drafts:a,recognizedJsonPayload:s,explicitEmptyPayload:o}=Ks(e,n.sourceName,{template:n.template??G()});if(a.length===0){if(s||o)return{imported:0,remapped:0};throw new Error("Invalid draft import format. Supported: exported drafts JSON, combined markdown draft files, or raw text/JSON uploads.")}const i=await this.getAllMetadata({includeArchived:!0}),d=new Set(i.map(u=>u.review_id)),l=new Map;let c=0;const p=a.map(u=>{const f=u.metadata.review_id;let m=f;return r==="remap"&&d.has(m)&&(m=Si(d)),d.add(m),m!==f&&(c+=1,l.set(f,m)),{...u,path:m,metadata:{...u.metadata,review_id:m}}});for(const u of p){const f=u.metadata.parent_drafts?.map(h=>l.get(h)||h),m=u.metadata.connected_drafts?.map(h=>l.get(h)||h);await this.saveDraft({...u,metadata:{...u.metadata,parent_drafts:f,connected_drafts:m}})}return{imported:p.length,remapped:c}}static async clearAll(){if(N()){await $(async e=>{if(e.drafts=[],e.assetActivity=[],e.migrationChecked=!0,typeof indexedDB<"u"){await _.transaction("rw",_.drafts,_.assets,_.tags,async()=>{await _.drafts.clear(),await _.assets.clear(),await _.tags.clear()});for(const n of an)await ne.exists(n)&&await ne.delete(n)}},{persist:!0}),Ue=null;return}await _.transaction("rw",_.drafts,_.assets,_.tags,async()=>{await _.drafts.clear(),await _.assets.clear(),await _.tags.clear()});for(const e of an)await ne.exists(e)&&await ne.delete(e);Ue=null}}const Vc=Object.freeze(Object.defineProperty({__proto__:null,DraftStorage:O,db:_,exportRawDraftStorage:Bi,getDraftStorageDiagnostics:Ui},Symbol.toStringTag,{value:"Module"}));function Wi(t){const e=Xr(t);if(e.length===0)return"";let n;try{n=qr(e)}catch{n=e.map(o=>o.name)}const r=n.map(o=>e.find(i=>i.name===o)).filter(o=>!!o),a=[];a.push(`

## TEMPLATE OVERRIDE
`),a.push("The following active template contract is authoritative. Use it instead of the fallback template order."),a.push(`Template name: ${t.name}`),a.push(`Template version: ${t.version}`),t.description?.trim()&&a.push(`Template description: ${t.description.trim()}`),a.push(`Asset count: ${r.length}`),a.push(""),a.push("Asset output order:"),r.forEach((o,i)=>{a.push(`${i+1}. ${o.name}`)}),a.push(""),a.push("Declared asset contract:"),r.forEach(o=>{const i=o.dependsOn.length>0?o.dependsOn.join(", "):"none";a.push(`- ${o.name}`),a.push(`  - required: ${o.required}`),a.push(`  - depends_on: ${i}`),o.blueprintFile&&a.push(`  - blueprint_file: ${o.blueprintFile}`),o.description?.trim()&&a.push(`  - description: ${o.description.trim()}`)});const s=r.map(o=>{const i=xn(t.name,o.name)?.trim();return i?["",`### ASSET BLUEPRINT: ${o.name}`,"```md",i,"```"].join(`
`):null}).filter(o=>!!o);return s.length>0&&(a.push(""),a.push("Resolved asset blueprints:"),a.push("Follow these blueprint sources exactly for structure, placeholders, control blocks, and field names."),a.push(s.join(`
`))),a.join(`
`)}function ua(t){if(!t)return[];const e=Xr(t);if(e.length===0)return[];try{return qr(e)}catch{return e.map(n=>n.name)}}function je(t,e,n,r){const a=ua(r),s=a.length>0?a:Object.keys(n),o=[`
## ${t}: ${e}`];return r&&o.push(`Template: ${r.name} (${r.version})`),s.forEach(i=>{o.push(...fn(`### ${i}:`,i,n[i]||""))}),o}function ji(t,e){return fn(`### ${t}:`,t,e)}function pa(t,e={}){const n=e.template??t.template,r=e.assetName&&n?or(n,e.assetName,t.assets):{...t.assets};if(e.assetName){const l=t.assets[e.assetName];typeof l=="string"&&l.trim().length>0&&(r[e.assetName]=l)}const a=ua(n),s=a.length>0?a.filter(l=>l in r):Object.keys(r),o=Object.keys(r).filter(l=>!s.includes(l)),i=[...s,...o];if(i.length===0)return[];const d=[`
## Imported Character Source Material`,`Source label: ${t.label}`,`Imported from: ${t.source}`,"Treat the following imported card assets as source material for this rehash.","Preserve compatible facts, tone, relationship logic, and constraints when they fit the active seed and blueprint.","Do not copy them blindly as final output; rewrite them into the requested asset format."];return n&&d.push(`Template context: ${n.name} (${n.version})`),i.forEach(l=>{d.push(...fn(`### ${l}:`,l,r[l]||"",{jsonInstruction:"Treat the extracted fields below as imported source material. Do not assume access to any external file."}))}),d}async function Gi(t,e=null,n,r,a,s=[],o=[],i){let d=await bt("orchestration",a,r);n&&n.assets.length>0&&(d+=Wi(n));const l=d,c=[];return e&&c.push(`Mode: ${e}`),c.push(`SEED: ${t}`),i&&c.push(...pa(i,{template:n})),o.length>0&&(c.push(""),c.push("CONNECTED CHARACTER REFERENCES:"),c.push("Treat these suites as secondary canon anchors for continuity, shared setting pressure, and existing entanglements."),c.push("Do not let them override the active seed or collapse the new character into a duplicate."),o.forEach((p,u)=>{c.push(...je(`REFERENCE ${u+1}`,p.label,p.assets,p.template))})),s.length>0&&(c.push(""),c.push("ADDITIONAL RULES:"),s.forEach(p=>{c.push(`- ${p}`)})),[l,c.join(`
`)]}async function Hi(t,e,n=null,r={},a=null,s,o=[],i=[],d,l){const c=a||await Yr(t,s),p=`# BLUEPRINT: ${t}

${c}`,u=or(d?G(d):void 0,t,r),f=[];if(f.push(`TARGET ASSET: ${t}`),f.push(`TASK: Generate only the requested ${t} asset.`),f.push("Do not regenerate, restate, or summarize any other asset unless it is quoted below as supporting context."),t==="a1111"&&f.push("OUTPUT: Return only the final raw A1111 prompt lines. Do not write narration, scene prose, explanations, headings, labels, or code fences."),n&&(f.push(""),f.push(`Mode: ${n}`)),f.push(`SEED: ${e}`),o.length>0&&(f.push(""),f.push("ADDITIONAL INSTRUCTIONS:"),o.forEach((m,h)=>{h>0&&f.push(""),f.push(m)})),i.length>0&&(f.push(`
---
## Connected Character References:
`),f.push("Treat these suites as established canon anchors for relationship continuity, shared world state, and cross-character consistency."),f.push("Use them to keep the new character interconnected without duplicating an existing suite or overriding the active seed."),i.forEach((m,h)=>{f.push(...je(`REFERENCE ${h+1}`,m.label,m.assets,m.template))})),l&&f.push(...pa(l,{assetName:t,template:d?G(d):void 0})),Object.keys(u).length>0){f.push(`
---
## Prior Assets (for context):
`);for(const[m,h]of Object.entries(u))f.push(...ji(m,h))}return[p,f.join(`
`)]}async function zi(t,e){return[e?.trim()||await bt("seed_generation"),t]}async function Ki(t,e={}){const n=e.blueprintContent?.trim()||await bt("worldbook_generation"),r=[`REFERENCE_DRAFT_COUNT: ${t.length}`,"TASK: Synthesize a connected lorebook/worldbook packet from these reference drafts.","CONSTRAINT: Do not generate a new standalone character. Extract connected canon, events, places, factions, moments, and recurring pressure instead."];return e.focus?.trim()&&(r.push(""),r.push(`FOCUS: ${e.focus.trim()}`)),t.forEach((a,s)=>{r.push(...je(`REFERENCE DRAFT ${s+1}`,a.label,a.assets,a.template))}),[n,r.join(`
`)]}function Vi(t,e){const n=`You are an expert character analyst specializing in understanding character relationships, dynamics, and narrative potential. Your task is to deeply analyze two characters and provide insights about how they would interact in a story.

You will receive structured character profiles containing:
- Basic information (name, age, gender, species, occupation)
- Personality traits
- Core values and beliefs
- Motivations and goals
- Fears and weaknesses
- Narrative role and power level

Your analysis should focus on:

1. **Narrative Dynamics**: How these characters would interact, tension or harmony between them, and what makes their relationship interesting for readers.

2. **Story Opportunities**: Specific plot hooks, conflicts, or situations that would arise from their relationship.

3. **Scene Suggestions**: 2-3 specific scene ideas that would showcase their dynamic (setting, situation, what happens).

4. **Dialogue Style**: How they would talk to each other - conversational patterns, tone, verbal conflicts, etc.

5. **Relationship Arc**: How their relationship might evolve over a story - beginning, middle, and end states.

Provide your response as JSON with this structure:

\`\`\`json
{
  "narrative_dynamics": "2-3 paragraphs describing core dynamic",
  "story_opportunities": [
    "opportunity 1",
    "opportunity 2",
    "opportunity 3"
  ],
  "scene_suggestions": [
    "Scene 1 description with setting and action",
    "Scene 2 description with setting and action",
    "Scene 3 description with setting and action"
  ],
  "dialogue_style": "Description of their conversational patterns",
  "relationship_arc": "Description of how their relationship would develop"
}
\`\`\`

Be specific, insightful, and focus on narrative potential. Consider:
- Would they clash or complement each other?
- What secrets or conflicts could emerge?
- How would they challenge each other to grow?
- What would readers find compelling about their relationship?
- What themes or conflicts would their relationship explore?`,r=[];return r.push(`## CHARACTER 1: ${t.name||"Character 1"}`),r.push(`**Age**: ${t.age||"Unknown"}`),r.push(`**Gender**: ${t.gender||"Unknown"}`),r.push(`**Species**: ${t.species||"Unknown"}`),r.push(`**Occupation**: ${t.occupation||"Unknown"}`),r.push(`**Role**: ${t.role||"Unknown"}`),r.push(`**Power Level**: ${t.power_level||"Unknown"}`),r.push(`**Mode**: ${t.mode||"Unknown"}`),t.personality_traits&&t.personality_traits.length>0&&r.push(`**Personality Traits**: ${t.personality_traits.slice(0,10).join(", ")}`),t.core_values&&t.core_values.length>0&&r.push(`**Core Values**: ${t.core_values.slice(0,10).join(", ")}`),t.motivations&&t.motivations.length>0&&r.push(`**Motivations**: ${t.motivations.slice(0,10).join(", ")}`),t.goals&&t.goals.length>0&&r.push(`**Goals**: ${t.goals.slice(0,10).join(", ")}`),t.fears&&t.fears.length>0&&r.push(`**Fears**: ${t.fears.slice(0,10).join(", ")}`),r.push(`
## CHARACTER 2: ${e.name||"Character 2"}`),r.push(`**Age**: ${e.age||"Unknown"}`),r.push(`**Gender**: ${e.gender||"Unknown"}`),r.push(`**Species**: ${e.species||"Unknown"}`),r.push(`**Occupation**: ${e.occupation||"Unknown"}`),r.push(`**Role**: ${e.role||"Unknown"}`),r.push(`**Power Level**: ${e.power_level||"Unknown"}`),r.push(`**Mode**: ${e.mode||"Unknown"}`),e.personality_traits&&e.personality_traits.length>0&&r.push(`**Personality Traits**: ${e.personality_traits.slice(0,10).join(", ")}`),e.core_values&&e.core_values.length>0&&r.push(`**Core Values**: ${e.core_values.slice(0,10).join(", ")}`),e.motivations&&e.motivations.length>0&&r.push(`**Motivations**: ${e.motivations.slice(0,10).join(", ")}`),e.goals&&e.goals.length>0&&r.push(`**Goals**: ${e.goals.slice(0,10).join(", ")}`),e.fears&&e.fears.length>0&&r.push(`**Fears**: ${e.fears.slice(0,10).join(", ")}`),r.push(`
## TASK`),r.push("Provide a deep analysis of these two characters' relationship potential."),r.push("Return your response as valid JSON following the structure specified in the system prompt."),[n,r.join(`
`)]}async function Yi(t,e,n,r,a=null,s,o,i,d){const l=await bt("offspring_generation",d,i),c=[];return a&&c.push(`Mode: ${a}`),c.push(...je("PARENT 1",n,t,s)),c.push(...je("PARENT 2",r,e,o)),c.push(`
## INSTRUCTION:`),c.push("Analyze how these two parents would shape a new character's upbringing and generate the offspring's SEED."),c.push("Treat each parent suite according to the template contract shown in the provided assets."),[l,c.join(`
`)]}function me(t,e,n){const r=[{role:"system",content:t}];return r.push({role:"user",content:e}),r}const fa="eidolon.web.seedGenerator.history",ma=["bpui.web.seedGenerator.history"],ha="eidolon.web.seedGenerator.favorites",ga=["bpui.web.seedGenerator.favorites"],_a="eidolon.web.seedGenerator.favorites.syncState",ya="eidolon.web.seedGenerator.archivedSeedRuns.syncState",ba=12,Ji=12,wa="blended",Xi="seed-favorites-changed",qi="seed-history-changed";function Et(t,e){return pt(t,e)}function At(t,e,n){ln(t,e,n)}function Qi(t){typeof window>"u"||window.dispatchEvent(new CustomEvent(Xi,{detail:{count:t.length}}))}function Zi(t){typeof window>"u"||window.dispatchEvent(new CustomEvent(qi,{detail:{count:t.filter(e=>!e.archivedAt).length}}))}function Be(t){if(typeof t!="string")return;const e=new Date(t);return Number.isNaN(e.getTime())?void 0:e.toISOString()}function ec(t){if(typeof t!="object"||t===null)return null;const e=t,n=typeof e.seed=="string"?e.seed.trim():"";if(!n)return null;const r=Be(e.addedAt)??new Date().toISOString(),a=Be(e.lastUsedAt),s=Be(e.archivedAt),o={seed:n,addedAt:r};return a&&(o.lastUsedAt=a),s&&(o.archivedAt=s),o}function va(t,e){const n=Date.parse(t.lastUsedAt??t.addedAt);return Date.parse(e.lastUsedAt??e.addedAt)-n}function Ea(t,e){const n=Date.parse(t.archivedAt??t.lastUsedAt??t.addedAt);return Date.parse(e.archivedAt??e.lastUsedAt??e.addedAt)-n}function ut(t){const e=new Map;for(const n of t){const r=ec(n);r&&e.set(r.seed,r)}return Array.from(e.values()).sort((n,r)=>n.archivedAt||r.archivedAt?Ea(n,r):va(n,r))}function tc(){return Et(_a,{})}function nc(t){At(_a,[],t)}function rc(){return Et(ya,{})}function ac(t){At(ya,[],t)}function oe(){const t=Et([ha,...ga],[]);return ut(t)}function Aa(t){return[...t].filter(e=>!e.archivedAt).sort(va)}function sc(t){return[...t].filter(e=>!!e.archivedAt).sort(Ea)}function ie(t,e={}){const{markChanged:n=!0,markSynced:r=!1,timestamp:a=new Date().toISOString()}=e,s=ut(t);At(ha,ga,s);const o=tc();return n&&(o.lastChangedAt=a),r&&(o.lastSyncedAt=a),nc(o),Qi(Aa(s)),s}const on=[{id:"noir-romance",label:"Noir Pressure",genreLines:`noir:debt, surveillance, intimacy, slow-burn
romance:realism, asymmetry, messy loyalty, after-hours`},{id:"grounded-sf",label:"Grounded Sci-Fi",genreLines:`sci-fi:grounded, labor, proximity, bureaucracy
romance:subtext, contracts, withheld tenderness`},{id:"low-magic",label:"Low Magic",genreLines:`fantasy:low-magic, domestic, obligation, village politics
romance:restraint, longing, practical intimacy`},{id:"urban-horror",label:"Urban Horror",genreLines:`horror:grounded, neighborhood, debt, body unease
thriller:secrecy, leverage, false safety`},{id:"moreau",label:"Moreau",genreLines:`romance:moreau, realism, stigma, protective tension
urban fantasy:morphosis, nightlife, consent ethic, social friction`}];function oc(t){return t.replace(/^```+/,"").replace(/```+$/,"").trim()}function ic(t){return oc(t).replace(/^[-*•]\s+/,"").replace(/^\d+[.)]\s+/,"").replace(/^seed\s*:\s*/i,"").trim()}function Yc(){return on}function cc(){return on[Math.floor(Math.random()*on.length)]}function dc(t){return Math.min(30,Math.max(5,Math.round(t||Ji)))}function Jc(t,e){const n=t.split(`
`).map(a=>a.trim()).filter(Boolean);return[...[`count=${dc(e.count)}`,wa],...n].join(`
`)}function lc(t){const e=t.genre_lines.split(`
`).map(n=>n.trim()).filter(Boolean).join(`
`);if(t.surprise_mode||!e){const n=cc();return{genreLines:n.genreLines,sourcePreset:n}}return{genreLines:e}}function uc(t){const e=t.split(`
`).map(ic).filter(n=>n.length>0).filter(n=>!/^#+\s*/.test(n)).filter(n=>!/^output to\s+/i.test(n)).filter(n=>!/^no headings/i.test(n));return[...new Set(e)].filter(n=>n.length<=180)}function pc(t){if(typeof t!="object"||t===null)return null;const e=t,n=typeof e.id=="string"&&e.id.trim().length>0?e.id:crypto.randomUUID(),r=Be(e.createdAt)??new Date().toISOString(),a=Be(e.archivedAt),s=typeof e.request=="object"&&e.request!==null?e.request:null,o=Array.isArray(e.seeds)?e.seeds.filter(c=>typeof c=="string"&&c.trim().length>0):[];if(!s||o.length===0)return null;const i=wa,d=typeof s.count=="number"&&Number.isFinite(s.count)?Math.max(1,Math.round(s.count)):o.length,l={id:n,createdAt:r,request:{genreLines:typeof s.genreLines=="string"?s.genreLines:"",count:d,coverageMode:i,surpriseMode:!!s.surpriseMode,presetId:typeof s.presetId=="string"?s.presetId:void 0},seeds:o};return a&&(l.archivedAt=a),l}function Sa(t){const e=[];for(const n of t){const r=pc(n);r&&e.push(r)}return e}function On(){const t=Et([fa,...ma],[]);return Sa(t)}function Ta(t){return t.filter(e=>!e.archivedAt)}function fc(t){return t.filter(e=>!!e.archivedAt)}function St(t,e={}){const{markArchivedChanged:n=!1,markSynced:r=!1,timestamp:a=new Date().toISOString()}=e,s=Sa(t);if(At(fa,ma,s),n||r){const o=rc();n&&(o.lastChangedAt=a),r&&(o.lastSyncedAt=a),ac(o)}return Zi(Ta(s)),s}function Ge(){return Ta(On())}function Tt(){return fc(On())}function Xc(t){const e={...t,id:crypto.randomUUID(),createdAt:new Date().toISOString()},n=Tt(),r=[e,...Ge()].slice(0,ba);return St([...r,...n]),r}function qc(t){const e=new Date().toISOString(),n=Tt(),r=Ge(),a=r.find(s=>s.id===t);return a?(St([...r.filter(s=>s.id!==t),{...a,archivedAt:e},...n.filter(s=>s.id!==t)],{markArchivedChanged:!0,timestamp:e}),Ge()):r}function Qc(t){const e=Tt(),n=e.find(a=>a.id===t);if(!n)return Ge();const r=[{...n,archivedAt:void 0},...Ge()].slice(0,ba);return St([...r,...e.filter(a=>a.id!==t)],{markArchivedChanged:!0}),r}function Zc(t){return St(On().filter(e=>e.id!==t),{markArchivedChanged:!0}),Tt()}function xe(){return Aa(oe())}function mc(){return sc(oe())}function ed(t){if(Array.isArray(t))return ut(t);if(typeof t!="object"||t===null)return null;const e=t;return Array.isArray(e.seeds)?ut(e.seeds):null}function td(t){return ie([...t]),xe()}function nd(t){return ie([...t],{markChanged:!1,markSynced:!0}),xe()}function hc(t){const e=new Date().toISOString(),n=oe().map(r=>r.seed===t?{...r,archivedAt:e}:r);return ie(n,{timestamp:e}),xe()}function gc(t){const e=oe().map(n=>n.seed===t?{...n,archivedAt:void 0}:n);return ie(e),xe()}function rd(t){return ie(oe().filter(e=>e.seed!==t)),mc()}function ad(t){const e=oe(),n=e.find(r=>r.seed===t);return n?.archivedAt?gc(t):n?hc(t):(ie([{seed:t,addedAt:new Date().toISOString()},...e]),xe())}function sd(t){const e=new Date().toISOString(),r=oe().map(a=>a.seed===t?{...a,lastUsedAt:e}:a);return ie(r,{timestamp:e}),xe()}const _c=["character_sheet","post_history","system_prompt"],nr={character_sheet:1400,post_history:500,system_prompt:500,reference_summary:360,default:420},rr={character_sheet:24,post_history:8,system_prompt:8,reference_summary:6,default:8};function yc(t){return nr[t]??nr.default}function bc(t){return rr[t]??rr.default}function tt(t,e){const n=e.trim();if(!n)return"";const r=bc(t),a=yc(t),s=n.split(/\r?\n/).map(l=>l.trimEnd()).filter(l=>l.trim().length>0),i=s.slice(0,r).join(`
`);return i.length<=a&&s.length<=r?i:`${i.slice(0,a).trimEnd()}
[truncated for reference]`}function wc(t){const e=[],{metadata:n}=t;return e.push(`name: ${n.character_name||n.review_id}`),n.template_name&&e.push(`template: ${n.template_name}`),n.mode&&e.push(`mode: ${n.mode}`),e.push(`seed: ${n.seed}`),n.genre&&e.push(`genre: ${n.genre}`),n.notes?.trim()&&e.push(`notes: ${n.notes.trim()}`),tt("reference_summary",e.join(`
`))}function vc(t,e={}){const n={},r=wc(t);r&&(n.reference_summary=r);const a=e.preferredAssetOrder??[..._c];for(const o of a){const i=t.assets[o];typeof i!="string"||i.trim().length===0||(n[o]=tt(o,i))}if(e.includeAssetPrefixes?.length){const o=new Set(Object.keys(n));for(const[i,d]of Object.entries(t.assets))o.has(i)||e.includeAssetPrefixes.some(l=>i.startsWith(l))&&(typeof d!="string"||d.trim().length===0||(n[i]=tt(i,d)))}if(Object.keys(n).length>1)return n;const s=Object.entries(t.assets).find(([,o])=>typeof o=="string"&&o.trim().length>0);if(s){const[o,i]=s;n[o]=tt(o,i)}return n}function cn(t,e={}){const n=new Set((e.excludeIds??[]).filter(s=>typeof s=="string").map(s=>s.trim()).filter(Boolean)),r=[],a=new Set;for(const s of t??[]){if(typeof s!="string")continue;const o=s.trim();if(!(!o||n.has(o)||a.has(o))&&(a.add(o),r.push(o),r.length>=un))break}return r}async function ar(t,e={}){const n=cn(t,{excludeIds:e.excludeIds});return n.length===0?[]:(await Promise.all(n.map(a=>O.getDraft(a)))).filter(a=>!!a).map(a=>({label:a.metadata.character_name||a.metadata.review_id,assets:vc(a,e),template:e.resolveTemplate?.(a.metadata.template_name)})).filter(a=>Object.keys(a.assets).length>0)}const Ec=4096;class Y{static createStreamDisplayState(){return{rawContent:"",visibleContent:""}}static sanitizeModelContent(e){return Ha(e)}static appendVisibleChunk(e,n){e.rawContent+=n;const r=this.sanitizeModelContent(e.rawContent),a=r.startsWith(e.visibleContent)?r.slice(e.visibleContent.length):"";return e.visibleContent=r,a}static resolveGenerationMaxTokens(e){return typeof e.max_tokens=="number"&&Number.isFinite(e.max_tokens)?Math.max(1,Math.round(e.max_tokens)):Ec}static resolveConfiguredProvider(e){return e.engine_mode==="explicit"&&e.engine!=="auto"&&e.engine!=="openai_compatible"?e.engine:e.model?pn(e.model):void 0}static getFallbackApiKey(e){return Object.values(e).find(n=>typeof n=="string"&&n.trim().length>0)}static createConfiguredEngine(){const e=I.getApiKeys(),n=I.getConfig(),r=this.resolveConfiguredProvider(n);return _e({model:n.model,apiKey:r?e[r]:this.getFallbackApiKey(e),apiKeys:e,provider:r,baseUrl:n.base_url,proxyKey:n.api_proxy_key,temperature:n.temperature,maxTokens:this.resolveGenerationMaxTokens(n)})}static sanitizeGeneratedSeed(e){return kt(this.sanitizeModelContent(e)).replace(/^['"]|['"]$/g,"")}static getOffspringCarryRules(){return["Treat this seed as an offspring outcome shaped by two parent suites, not a disconnected standalone premise.","Preserve the inherited, inverted, or transmuted relational vector toward {{user}} implied by the offspring seed.","Do not flatten lineage tension: the generated assets should still feel like a descendant response to parental influence even when the seed expresses rebellion or mutation."]}static async*generate(e,n={}){const{seed:r,template:a,mode:s="Auto",stream:o=!0,blueprint_override:i,additional_instructions:d=[],connected_draft_ids:l=[],imported_source:c}=e;yield{type:"status",stage:"initializing"};const p=I.getConfig(),u=this.createConfiguredEngine(),f=a?G(a):void 0,m=cn(l),h=await ar(m,{resolveTemplate:P=>P?G(P):void 0});yield{type:"status",stage:"building_prompt"};const[y,w]=await Gi(r,s,f,void 0,i,d,h,c);yield{type:"status",stage:"generating"};const S=me(y,w);let C="";if(o){const P=this.createStreamDisplayState();for await(const Re of u.generateStream(S,{signal:n.signal})){if(Re.content){const Cn=this.appendVisibleChunk(P,Re.content);C=P.visibleContent,Cn&&(yield{type:"chunk",content:Cn})}if(Re.done)break}if(!C.trim()&&!n.signal?.aborted){const Re=await u.generate(S,{signal:n.signal});C=this.sanitizeModelContent(Re.content),C&&(yield{type:"chunk",content:C})}}else{const P=await u.generate(S,{signal:n.signal});C=this.sanitizeModelContent(P.content)}yield{type:"status",stage:"parsing"};let W;try{W=f?Za(C,f).assets:this.parseBlueprintOutput(C)}catch{W=this.parseBlueprintOutput(C)}yield{type:"status",stage:"saving"};const g=this.generateReviewId(),k=ye(W,a),ce={path:g,metadata:{review_id:g,seed:r,mode:s,model:p.model,created:new Date().toISOString(),modified:new Date().toISOString(),favorite:!1,template_name:a,character_name:k,connected_drafts:m.length>0?m:void 0},assets:W};await O.saveDraft(ce),yield{type:"complete",asset:g}}static async*generateAsset(e,n=!0,r={}){const a=xn(e.template,e.asset_name);yield*this.generateAssetWithBlueprint(e,a,n,r)}static async*previewBlueprint(e,n=!0,r={}){yield*this.generateAssetWithBlueprint(e,e.blueprint_content,n,r)}static async*generateAssetWithBlueprint(e,n,r,a={}){const{seed:s,mode:o="Auto",asset_name:i,prior_assets:d,additional_instructions:l=[],reference_suites:c=[],imported_source:p}=e;yield{type:"status",stage:"initializing"};const u=this.createConfiguredEngine();yield{type:"status",stage:"building_prompt"};const[f,m]=await Hi(i,s,o,d,n,void 0,l,c,e.template,p);yield{type:"status",stage:"prompt_ready",asset:i,systemPrompt:f,userPrompt:m},yield{type:"status",stage:"generating",asset:i};const h=me(f,m);let y="";if(r){const w=this.createStreamDisplayState();for await(const S of u.generateStream(h,{signal:a.signal})){if(S.content){const C=this.appendVisibleChunk(w,S.content);y=w.visibleContent,C&&(yield{type:"chunk",content:C,asset:i})}if(S.done)break}if(!y.trim()&&!a.signal?.aborted){const S=await u.generate(h,{signal:a.signal});y=this.sanitizeModelContent(S.content)}}else{const w=await u.generate(h,{signal:a.signal});y=this.sanitizeModelContent(w.content)}yield{type:"asset",asset:i,content:kt(y),systemPrompt:f,userPrompt:m}}static async*generateOffspringSeed(e,n={}){const{parent1_id:r,parent2_id:a,mode:s="Auto",blueprint_override:o}=e;yield{type:"status",stage:"loading_parents"};const i=await O.getDraft(r),d=await O.getDraft(a);if(!i||!d){yield{type:"error",error:"Parent drafts not found"};return}yield{type:"status",stage:"building_prompt"};const l=this.createConfiguredEngine(),[c,p]=await Yi(i.assets,d.assets,i.metadata.character_name||"Parent 1",d.metadata.character_name||"Parent 2",s,i.metadata.template_name?G(i.metadata.template_name):void 0,d.metadata.template_name?G(d.metadata.template_name):void 0,void 0,o);yield{type:"status",stage:"generating"};const u=me(c,p);let f="";const m=this.createStreamDisplayState();for await(const y of l.generateStream(u,{signal:n.signal})){if(y.content){const w=this.appendVisibleChunk(m,y.content);f=m.visibleContent,w&&(yield{type:"chunk",content:w})}if(y.done)break}if(!f.trim()&&!n.signal?.aborted){const y=await l.generate(u,{signal:n.signal});f=this.sanitizeModelContent(y.content),f&&(yield{type:"chunk",content:f})}yield{type:"complete",content:this.sanitizeGeneratedSeed(f)}}static async*generateOffspring(e,n={}){const{parent1_id:r,parent2_id:a,mode:s="Auto",template:o,blueprint_override:i}=e;let d="";for await(const c of this.generateOffspringSeed(e,n)){if(c.type==="error"){yield c;return}(c.type==="status"||c.type==="chunk")&&(yield c),c.type==="complete"&&(d=c.content||"")}if(!d){yield{type:"error",error:"Offspring seed generation finished without seed content."};return}yield{type:"status",stage:"generating_character"};let l="";for await(const c of this.generate({seed:d,mode:s,template:o,stream:!1,blueprint_override:i,additional_instructions:this.getOffspringCarryRules()},n)){if(c.type==="error"){yield c;return}c.type==="status"&&c.stage==="saving"&&(yield{type:"status",stage:"saving"}),c.type==="complete"&&(l=c.asset||"")}if(!l){yield{type:"error",error:"Offspring generation finished without a saved draft id."};return}await O.updateMetadata(l,{seed:d,parent_drafts:[r,a],offspring_type:"offspring"}),yield{type:"complete",asset:l}}static async*generateLorebook(e,n={}){const r=cn(e.draft_ids);if(r.length===0){yield{type:"error",error:"Select at least one reference draft to generate a lorebook packet."};return}yield{type:"status",stage:"loading_references"};const a=await ar(r,{preferredAssetOrder:["lorebook","character_sheet","post_history","intro_scene","creator_notes","intro_page","system_prompt"],includeAssetPrefixes:["lorebook_"],resolveTemplate:p=>p?G(p):void 0});if(a.length===0){yield{type:"error",error:"The selected drafts did not contain enough usable reference context for lorebook generation."};return}yield{type:"status",stage:"building_prompt"};const s=this.createConfiguredEngine(),[o,i]=await Ki(a,{focus:e.focus,blueprintContent:e.blueprint_content});yield{type:"status",stage:"generating"};const d=me(o,i);let l="";const c=this.createStreamDisplayState();for await(const p of s.generateStream(d,{signal:n.signal})){if(p.content){const u=this.appendVisibleChunk(c,p.content);l=c.visibleContent,u&&(yield{type:"chunk",content:u})}if(p.done)break}if(!l.trim()&&!n.signal?.aborted){const p=await s.generate(d,{signal:n.signal});l=this.sanitizeModelContent(p.content),l&&(yield{type:"chunk",content:l})}yield{type:"complete",content:kt(l).trim()}}static async*generateSeeds(e){yield{type:"status",stage:"initializing"};const n=typeof e=="string"?{genre_lines:e}:e,{genreLines:r}=lc(n),a=I.getApiKeys(),s=I.getConfig(),o=this.resolveConfiguredProvider(s),i=_e({model:s.model,apiKey:o?a[o]:this.getFallbackApiKey(a),apiKeys:a,provider:o,baseUrl:s.base_url,temperature:s.temperature,maxTokens:this.resolveGenerationMaxTokens(s)});yield{type:"status",stage:"building_prompt"};const[d,l]=await zi(r,n.blueprint_content);yield{type:"status",stage:"generating"};const c=me(d,l),p=await i.generate(c);yield{type:"complete",content:uc(this.sanitizeModelContent(p.content)).join(`
`)}}static async*chat(e,n,r){yield{type:"status",stage:"initializing"};const a=I.getApiKeys(),s=I.getConfig(),o=this.resolveConfiguredProvider(s),i=_e({model:s.model,apiKey:o?a[o]:this.getFallbackApiKey(a),apiKeys:a,provider:o,baseUrl:s.base_url,temperature:s.temperature,maxTokens:this.resolveGenerationMaxTokens(s)});yield{type:"status",stage:"generating"};const l=(n[0]?.role==="system"?n[0].content:void 0)?n.slice(1):n;let c="";const p=this.createStreamDisplayState();for await(const u of i.generateStream(l)){if(u.content){const f=this.appendVisibleChunk(p,u.content);c=p.visibleContent,f&&(yield{type:"chunk",content:f})}if(u.done)break}if(!c.trim()){const u=await i.generate(l);c=this.sanitizeModelContent(u.content),c&&(yield{type:"chunk",content:c})}yield{type:"complete",content:c}}static async analyzeSimilarity(e,n){const r=await O.getDraft(e),a=await O.getDraft(n);if(!r||!a)throw new Error("One or both drafts not found");const s=this.parseCharacterProfile(r.assets.character_sheet||""),o=this.parseCharacterProfile(a.assets.character_sheet||""),i=I.getApiKeys(),d=I.getConfig(),l=this.resolveConfiguredProvider(d),c=_e({model:d.model,apiKey:l?i[l]:this.getFallbackApiKey(i),apiKeys:i,provider:l,baseUrl:d.base_url,temperature:d.temperature,maxTokens:this.resolveGenerationMaxTokens(d)}),[p,u]=Vi(s,o),f=me(p,u),m=await c.generate(f),h=this.sanitizeModelContent(m.content);try{return JSON.parse(h)}catch{return{raw:h}}}static parseBlueprintOutput(e){const n={},r=/```(\w+)?\n([\s\S]*?)```/g,a=["Adjustment Note","system_prompt","post_history","character_sheet","intro_scene","creator_notes","intro_page","a1111","suno"];let s;for(;(s=r.exec(e))!==null;){const o=s[1],i=s[2]?.trim();o&&i&&a.includes(o)&&(n[o]=i)}if(Object.keys(n).length===0)for(let o=0;o<a.length;o++){const i=a[o],d=a[o+1],l=new RegExp(`^##\\s*${i}`,"im"),c=e.search(l);if(c===-1)continue;let p;if(d){const f=new RegExp(`^##\\s*${d}`,"im"),m=e.slice(c).search(f);p=m===-1?e.length:c+m}else p=e.length;const u=e.slice(c,p).trim();u&&(n[i]=u)}return n}static parseCharacterProfile(e){const n={},r=e.split(`
`);let a=null,s=[];for(const o of r){const i=o.match(/^([A-Z][A-Za-z\s]+):\s*(.+)$/);i?(a&&s.length>0&&(n[a]=s.join(`
`).trim()),a=i[1].trim().toLowerCase().replace(/\s+/g,"_"),s=[i[2].trim()]):a&&o.trim()&&s.push(o.trim())}a&&s.length>0&&(n[a]=s.join(`
`).trim());for(const o of["personality_traits","core_values","goals","fears","motivations"])typeof n[o]=="string"&&(n[o]=n[o].split(",").map(i=>i.trim()).filter(i=>i.length>0));return n}static generateReviewId(){const e=Date.now(),n=Math.random().toString(36).substring(2,9);return`${e}_${n}`}}const ka="eidolon.web.themes.custom",od="eidolon:themes-synced",id="eidolon:drafts-synced",D="Persisted worlds, factions, locations, and timelines are currently only available in the desktop app.";function Ac(t,e){const n=e.match(/^---\n([\s\S]*?)\n---/);let r=t.split("/").pop()?.replace(".md","")||"Blueprint",a="",s="1.0",o=!0;if(!n)return{name:r,description:a,version:s,invokable:o};const i=n[1],d=i.match(/^name:\s*(.+)$/m),l=i.match(/^description:\s*(.+)$/m),c=i.match(/^version:\s*(.+)$/m),p=i.match(/^invokable:\s*(.+)$/m);return d&&(r=d[1].trim()),l&&(a=l[1].trim()),c&&(s=c[1].trim()),p&&(o=p[1].trim()==="true"),{name:r,description:a,version:s,invokable:o}}function Sc(t,e){const n=new Set(vt().map(o=>o.template.name).filter(o=>o!==e));if(!n.has(t))return t;const r=t.endsWith(" Copy")?t:`${t} Copy`;if(!n.has(r))return r;let a=2,s=`${r} ${a}`;for(;n.has(s);)a+=1,s=`${r} ${a}`;return s}const xa=["bpui.web.themes.custom"],Tc=300*1e3,qe=new Map,kc=[{name:"Official PNG Character Card",path:"png",format:"png",description:"Export a standard PNG character card with embedded V2/V3 card data."},{name:"Official V2/V3 Card JSON",path:"json",format:"json",description:"Export a Chub-compatible V2/V3 character card JSON with Eidolon round-trip extensions."},{name:"text",path:"text",format:"text",description:"Export draft assets as plain text sections."},{name:"combined",path:"combined",format:"combined",description:"Export a markdown bundle with metadata and assets."}];function E(t){return{author:"Eidolon Simulacra",is_builtin:!0,...t}}const xc=[E({name:"dark",display_name:"Dark",description:"Default dark theme for browser-only mode.",tags:["builtin","dark"],based_on:"",colors:{background:"#0f172a",text:"#e5e7eb",accent:"#38bdf8",button:"#1d4ed8",button_text:"#f8fafc",border:"#334155",highlight:"#7dd3fc",window:"#111827",tok_brackets:"#60a5fa",tok_asterisk:"#f472b6",tok_parentheses:"#f59e0b",tok_double_brackets:"#a78bfa",tok_curly_braces:"#34d399",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#94a3b8",surface:"#1e293b",success_bg:"#052e16",danger_bg:"#450a0a",accent_bg:"#082f49",accent_title:"#e0f2fe",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fcd34d"}}),E({name:"light",display_name:"Light",description:"Default light theme for browser-only mode.",tags:["builtin","light"],based_on:"",colors:{background:"#f8fafc",text:"#0f172a",accent:"#2563eb",button:"#1d4ed8",button_text:"#eff6ff",border:"#cbd5e1",highlight:"#0ea5e9",window:"#ffffff",tok_brackets:"#2563eb",tok_asterisk:"#db2777",tok_parentheses:"#d97706",tok_double_brackets:"#7c3aed",tok_curly_braces:"#059669",tok_pipes:"#0891b2",tok_at_sign:"#e11d48",muted_text:"#64748b",surface:"#ffffff",success_bg:"#dcfce7",danger_bg:"#fee2e2",accent_bg:"#dbeafe",accent_title:"#1e3a8a",success_text:"#166534",error_text:"#991b1b",warning_text:"#92400e"}}),E({name:"nyx",display_name:"Nyx",description:"High-contrast theme tuned for the blueprint workflow.",tags:["builtin","editorial"],based_on:"dark",colors:{background:"#111113",text:"#f3f4f6",accent:"#f97316",button:"#c2410c",button_text:"#fff7ed",border:"#3f3f46",highlight:"#fb923c",window:"#18181b",tok_brackets:"#60a5fa",tok_asterisk:"#f472b6",tok_parentheses:"#f59e0b",tok_double_brackets:"#c084fc",tok_curly_braces:"#4ade80",tok_pipes:"#67e8f9",tok_at_sign:"#fb7185",muted_text:"#a1a1aa",surface:"#18181b",success_bg:"#052e16",danger_bg:"#431407",accent_bg:"#431407",accent_title:"#ffedd5",success_text:"#86efac",error_text:"#fdba74",warning_text:"#fed7aa"}}),E({name:"midnight",display_name:"Midnight",description:"Deep blue ocean theme with cyan accents.",tags:["builtin","dark","blue"],based_on:"dark",colors:{background:"#0a1929",text:"#b2d4f0",accent:"#00b4d8",button:"#014361",button_text:"#caf0f8",border:"#1d3557",highlight:"#48cae4",window:"#051923",tok_brackets:"#00b4d8",tok_asterisk:"#90e0ef",tok_parentheses:"#f48c06",tok_double_brackets:"#06ffa5",tok_curly_braces:"#00b4d8",tok_pipes:"#48cae4",tok_at_sign:"#f77f00",muted_text:"#6b8aa3",surface:"#0f2638",success_bg:"#1b4332",danger_bg:"#641220",accent_bg:"#014361",accent_title:"#48cae4",success_text:"#06ffa5",error_text:"#ff6b6b",warning_text:"#f48c06"}}),E({name:"ember",display_name:"Ember",description:"Warm theme with orange and amber tones.",tags:["builtin","warm","orange"],based_on:"dark",colors:{background:"#1a0f0a",text:"#ffd8b8",accent:"#ff6b35",button:"#c44536",button_text:"#fff8f0",border:"#5e1914",highlight:"#ff8c42",window:"#100a07",tok_brackets:"#ff6b35",tok_asterisk:"#ffa07a",tok_parentheses:"#ffb627",tok_double_brackets:"#7bed9f",tok_curly_braces:"#ff6348",tok_pipes:"#feca57",tok_at_sign:"#ff4757",muted_text:"#a67c52",surface:"#261612",success_bg:"#2d4a2b",danger_bg:"#5e1914",accent_bg:"#c44536",accent_title:"#ff8c42",success_text:"#7bed9f",error_text:"#ff4757",warning_text:"#feca57"}}),E({name:"forest",display_name:"Forest",description:"Natural green theme inspired by woodland twilight.",tags:["builtin","green","nature"],based_on:"dark",colors:{background:"#0d1b0f",text:"#d4f1d4",accent:"#4ecca3",button:"#2d5f3f",button_text:"#e8f5e8",border:"#1e4620",highlight:"#7bed9f",window:"#081108",tok_brackets:"#4ecca3",tok_asterisk:"#7bed9f",tok_parentheses:"#ffd93d",tok_double_brackets:"#6bcf7f",tok_curly_braces:"#48c774",tok_pipes:"#95e1d3",tok_at_sign:"#f8b500",muted_text:"#6b8f71",surface:"#152518",success_bg:"#2d5f3f",danger_bg:"#5c2a2a",accent_bg:"#2d5f3f",accent_title:"#7bed9f",success_text:"#95e1d3",error_text:"#ff6b6b",warning_text:"#ffd93d"}}),E({name:"mono",display_name:"Monochrome",description:"Clean grayscale theme for minimal distraction.",tags:["builtin","minimal","grayscale"],based_on:"dark",colors:{background:"#1c1c1c",text:"#e0e0e0",accent:"#757575",button:"#424242",button_text:"#ffffff",border:"#505050",highlight:"#9e9e9e",window:"#141414",tok_brackets:"#bdbdbd",tok_asterisk:"#9e9e9e",tok_parentheses:"#757575",tok_double_brackets:"#e0e0e0",tok_curly_braces:"#a0a0a0",tok_pipes:"#c0c0c0",tok_at_sign:"#888888",muted_text:"#707070",surface:"#242424",success_bg:"#3a3a3a",danger_bg:"#2e2e2e",accent_bg:"#424242",accent_title:"#9e9e9e",success_text:"#c0c0c0",error_text:"#a0a0a0",warning_text:"#b0b0b0"}}),E({name:"solarized_dark",display_name:"Solarized Dark",description:"Popular Solarized color scheme with reduced eye strain.",tags:["builtin","dark","solarized"],based_on:"dark",colors:{background:"#002b36",text:"#839496",accent:"#268bd2",button:"#073642",button_text:"#eee8d5",border:"#586e75",highlight:"#2aa198",window:"#001e26",tok_brackets:"#dc322f",tok_asterisk:"#268bd2",tok_parentheses:"#cb4b16",tok_double_brackets:"#859900",tok_curly_braces:"#d33682",tok_pipes:"#2aa198",tok_at_sign:"#b58900",muted_text:"#586e75",surface:"#073642",success_bg:"#324d32",danger_bg:"#4d2626",accent_bg:"#073642",accent_title:"#2aa198",success_text:"#859900",error_text:"#dc322f",warning_text:"#b58900"}}),E({name:"trans_flag",display_name:"Trans Flag",description:"Soft cyan and pink palette with neutral dark surfaces.",tags:["builtin","support","bright"],based_on:"dark",colors:{background:"#2e2e2e",text:"#ffffff",accent:"#5bcefa",button:"#f5a9b8",button_text:"#2e2e2e",border:"#cccccc",highlight:"#5bcefa",window:"#3e3e3e",tok_brackets:"#5bcefa",tok_asterisk:"#f5a9b8",tok_parentheses:"#5bcefa",tok_double_brackets:"#f5a9b8",tok_curly_braces:"#ffffff",tok_pipes:"#5bcefa",tok_at_sign:"#f5a9b8",muted_text:"#cccccc",surface:"#3e3e3e",success_bg:"#5bcefa",danger_bg:"#f5a9b8",accent_bg:"#3e3e3e",accent_title:"#5bcefa",success_text:"#2e2e2e",error_text:"#2e2e2e",warning_text:"#2e2e2e"}}),E({name:"blood_for_the_blood_god",display_name:"Blood for the Blood God",description:"A blood red theme with bronze accents.",tags:["builtin","warhammer","chaos","khorne"],based_on:"dark",colors:{background:"#200000",text:"#ffcccc",accent:"#cd7f32",button:"#600000",button_text:"#ffcccc",border:"#400000",highlight:"#ff0000",window:"#200000",tok_brackets:"#e00000",tok_asterisk:"#c00000",tok_parentheses:"#a00000",tok_double_brackets:"#e00000",tok_curly_braces:"#c00000",tok_pipes:"#a00000",tok_at_sign:"#ff0000",muted_text:"#996666",surface:"#400000",success_bg:"#600000",danger_bg:"#800000",accent_bg:"#a06629",accent_title:"#cd7f32",success_text:"#ffcccc",error_text:"#ffcccc",warning_text:"#ffcccc"}}),E({name:"silent_king",display_name:"Silent King",description:"A near-black theme with tomb-world green glow.",tags:["builtin","warhammer","necron","green"],based_on:"dark",colors:{background:"#010a01",text:"#a0e0a0",accent:"#00ff00",button:"#004000",button_text:"#a0e0a0",border:"#002000",highlight:"#00ff00",window:"#010501",tok_brackets:"#00c000",tok_asterisk:"#00a000",tok_parentheses:"#008000",tok_double_brackets:"#00c000",tok_curly_braces:"#00a000",tok_pipes:"#008000",tok_at_sign:"#00ff00",muted_text:"#609060",surface:"#010a01",success_bg:"#004000",danger_bg:"#006000",accent_bg:"#004000",accent_title:"#00ff00",success_text:"#a0e0a0",error_text:"#a0e0a0",warning_text:"#a0e0a0"}}),E({name:"ultramar",display_name:"Ultramar",description:"Cerulean armor, parchment ivory, and gold command trim.",tags:["builtin","warhammer","space-marine","blue"],based_on:"dark",colors:{background:"#08172f",text:"#e8eef7",accent:"#d4a72c",button:"#12396b",button_text:"#f8fafc",border:"#245089",highlight:"#4da3ff",window:"#0b2140",tok_brackets:"#60a5fa",tok_asterisk:"#facc15",tok_parentheses:"#fb7185",tok_double_brackets:"#93c5fd",tok_curly_braces:"#67e8f9",tok_pipes:"#c084fc",tok_at_sign:"#f97316",muted_text:"#93a9c4",surface:"#102949",success_bg:"#163b2a",danger_bg:"#481818",accent_bg:"#3d2b05",accent_title:"#fde68a",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fde047"}}),E({name:"imperial_fists",display_name:"Imperial Fists",description:"Siege yellow palette with navy shadows and hazard-strip energy.",tags:["builtin","warhammer","space-marine","yellow"],based_on:"dark",colors:{background:"#1c1603",text:"#fff6cc",accent:"#ffd100",button:"#7c6200",button_text:"#fffbea",border:"#8e740f",highlight:"#ffe66d",window:"#241d05",tok_brackets:"#ffd100",tok_asterisk:"#60a5fa",tok_parentheses:"#fb923c",tok_double_brackets:"#fde68a",tok_curly_braces:"#facc15",tok_pipes:"#93c5fd",tok_at_sign:"#f87171",muted_text:"#c5b671",surface:"#302608",success_bg:"#2d3d1b",danger_bg:"#51210f",accent_bg:"#483701",accent_title:"#fff3a3",success_text:"#bef264",error_text:"#fca5a5",warning_text:"#fde047"}}),E({name:"raven_guard",display_name:"Raven Guard",description:"Matte black surfaces with pale steel highlights and a covert red ping.",tags:["builtin","warhammer","space-marine","stealth"],based_on:"dark",colors:{background:"#09090b",text:"#e7e5e4",accent:"#d4d4d8",button:"#18181b",button_text:"#fafafa",border:"#3f3f46",highlight:"#a1a1aa",window:"#0f1014",tok_brackets:"#e4e4e7",tok_asterisk:"#f87171",tok_parentheses:"#c084fc",tok_double_brackets:"#93c5fd",tok_curly_braces:"#86efac",tok_pipes:"#67e8f9",tok_at_sign:"#fb7185",muted_text:"#71717a",surface:"#14151a",success_bg:"#14231a",danger_bg:"#3f1014",accent_bg:"#20232a",accent_title:"#f4f4f5",success_text:"#86efac",error_text:"#fda4af",warning_text:"#fdba74"}}),E({name:"salamanders",display_name:"Salamanders",description:"Volcanic green palette with lava orange contrast.",tags:["builtin","warhammer","space-marine","green"],based_on:"dark",colors:{background:"#08130e",text:"#d9f4dd",accent:"#ff7a00",button:"#1c5b34",button_text:"#f7fff8",border:"#2f7d4e",highlight:"#34d399",window:"#0d1d16",tok_brackets:"#4ade80",tok_asterisk:"#fb923c",tok_parentheses:"#facc15",tok_double_brackets:"#86efac",tok_curly_braces:"#22c55e",tok_pipes:"#2dd4bf",tok_at_sign:"#f97316",muted_text:"#7ca58a",surface:"#11251b",success_bg:"#123825",danger_bg:"#4a1d11",accent_bg:"#4a2205",accent_title:"#fdba74",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde047"}}),E({name:"iron_warriors",display_name:"Iron Warriors",description:"Gunmetal, hazard yellow, and industrial rust.",tags:["builtin","warhammer","chaos","industrial"],based_on:"dark",colors:{background:"#101114",text:"#d8d7d2",accent:"#facc15",button:"#3a3d42",button_text:"#fffce8",border:"#5a5f69",highlight:"#fde047",window:"#17191d",tok_brackets:"#facc15",tok_asterisk:"#fb7185",tok_parentheses:"#fb923c",tok_double_brackets:"#d4d4d8",tok_curly_braces:"#93c5fd",tok_pipes:"#67e8f9",tok_at_sign:"#f97316",muted_text:"#8f9098",surface:"#20242a",success_bg:"#243326",danger_bg:"#48211a",accent_bg:"#43370a",accent_title:"#fef08a",success_text:"#86efac",error_text:"#fdba74",warning_text:"#fde047"}}),E({name:"mechanicus_brass",display_name:"Mechanicus Brass",description:"Mars red, soot black, and worn brass for forge-heavy work.",tags:["builtin","warhammer","mechanicus","red"],based_on:"dark",colors:{background:"#130909",text:"#f1d9c3",accent:"#c98b2b",button:"#611616",button_text:"#fff4e6",border:"#7f2a1d",highlight:"#e2a74a",window:"#1a0d0d",tok_brackets:"#f87171",tok_asterisk:"#fbbf24",tok_parentheses:"#fdba74",tok_double_brackets:"#fca5a5",tok_curly_braces:"#fcd34d",tok_pipes:"#93c5fd",tok_at_sign:"#fb7185",muted_text:"#a98a75",surface:"#251212",success_bg:"#1f3424",danger_bg:"#4c1515",accent_bg:"#3f2610",accent_title:"#f6d28b",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fcd34d"}}),E({name:"sororitas_rose",display_name:"Sororitas Rose",description:"Ivory, cathedral black, and stained-glass crimson.",tags:["builtin","warhammer","imperium","gothic"],based_on:"dark",colors:{background:"#141112",text:"#f7ede8",accent:"#b91c1c",button:"#3c1318",button_text:"#fff7f5",border:"#6d2730",highlight:"#fb7185",window:"#1b1718",tok_brackets:"#fda4af",tok_asterisk:"#facc15",tok_parentheses:"#fdba74",tok_double_brackets:"#f5f5f4",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#ef4444",muted_text:"#b2a29c",surface:"#231d1f",success_bg:"#203326",danger_bg:"#4b1319",accent_bg:"#3b1016",accent_title:"#fecdd3",success_text:"#bbf7d0",error_text:"#fecaca",warning_text:"#fdba74"}}),E({name:"cadia_stands",display_name:"Cadia Stands",description:"Military olive, field khaki, and disciplined gold signals.",tags:["builtin","warhammer","imperium","guard"],based_on:"dark",colors:{background:"#11160f",text:"#e6ecd8",accent:"#c8a54b",button:"#3a4b2a",button_text:"#f8faee",border:"#556a3e",highlight:"#a3c76d",window:"#171d14",tok_brackets:"#a3c76d",tok_asterisk:"#facc15",tok_parentheses:"#fb923c",tok_double_brackets:"#d9f99d",tok_curly_braces:"#86efac",tok_pipes:"#93c5fd",tok_at_sign:"#f87171",muted_text:"#99a58b",surface:"#20281b",success_bg:"#243624",danger_bg:"#4a2218",accent_bg:"#3e3413",accent_title:"#f5e6b1",success_text:"#bbf7d0",error_text:"#fca5a5",warning_text:"#fde68a"}}),E({name:"krieg_ash",display_name:"Krieg Ash",description:"Trenchcoat slate, muddy blue, and mask-lens amber.",tags:["builtin","warhammer","imperium","guard"],based_on:"dark",colors:{background:"#101417",text:"#dae1e5",accent:"#d1a449",button:"#3a4854",button_text:"#f6f7f8",border:"#55616c",highlight:"#9db7c7",window:"#151b20",tok_brackets:"#93c5fd",tok_asterisk:"#facc15",tok_parentheses:"#fb923c",tok_double_brackets:"#cbd5e1",tok_curly_braces:"#86efac",tok_pipes:"#67e8f9",tok_at_sign:"#f87171",muted_text:"#8e9aa3",surface:"#1d242a",success_bg:"#233127",danger_bg:"#48231c",accent_bg:"#3f3118",accent_title:"#f4deb1",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde68a"}}),E({name:"thousand_sons",display_name:"Thousand Sons",description:"Arcane cobalt with turquoise sorcery and gilded trim.",tags:["builtin","warhammer","chaos","arcane"],based_on:"dark",colors:{background:"#081427",text:"#dce9ff",accent:"#22d3ee",button:"#12335f",button_text:"#f0f9ff",border:"#1d4f91",highlight:"#7dd3fc",window:"#0d1b35",tok_brackets:"#38bdf8",tok_asterisk:"#facc15",tok_parentheses:"#fb7185",tok_double_brackets:"#67e8f9",tok_curly_braces:"#a78bfa",tok_pipes:"#22d3ee",tok_at_sign:"#f97316",muted_text:"#96a9c6",surface:"#132346",success_bg:"#14312c",danger_bg:"#451b2f",accent_bg:"#10354d",accent_title:"#cffafe",success_text:"#99f6e4",error_text:"#f9a8d4",warning_text:"#fde047"}}),E({name:"drukhari_raid",display_name:"Drukhari Raid",description:"Poison teal, blade violet, and void-black lacquer.",tags:["builtin","warhammer","aeldari","neon"],based_on:"dark",colors:{background:"#09070f",text:"#ece7ff",accent:"#14b8a6",button:"#2c1144",button_text:"#f5f3ff",border:"#5b21b6",highlight:"#5eead4",window:"#100b1a",tok_brackets:"#2dd4bf",tok_asterisk:"#c084fc",tok_parentheses:"#f472b6",tok_double_brackets:"#67e8f9",tok_curly_braces:"#a78bfa",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#9d94b8",surface:"#170f25",success_bg:"#123028",danger_bg:"#43162e",accent_bg:"#102f31",accent_title:"#ccfbf1",success_text:"#99f6e4",error_text:"#f9a8d4",warning_text:"#f0abfc"}}),E({name:"ork_waaagh",display_name:"Ork Waaagh!",description:"Scrap metal, noisy green, and red-goes-fasta contrast.",tags:["builtin","warhammer","ork","high-energy"],based_on:"dark",colors:{background:"#11140c",text:"#e2f5b8",accent:"#67e01f",button:"#734116",button_text:"#fff7ed",border:"#4b5f1a",highlight:"#84cc16",window:"#181d10",tok_brackets:"#84cc16",tok_asterisk:"#ef4444",tok_parentheses:"#f97316",tok_double_brackets:"#bef264",tok_curly_braces:"#facc15",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#9eb279",surface:"#232813",success_bg:"#26401d",danger_bg:"#5a2314",accent_bg:"#293a12",accent_title:"#d9f99d",success_text:"#d9f99d",error_text:"#fdba74",warning_text:"#fde047"}}),E({name:"tau_sept",display_name:"Tau Sept",description:"Clean ochre, alloy grey, and cool interface blue.",tags:["builtin","warhammer","tau","clean"],based_on:"dark",colors:{background:"#11161a",text:"#e8edf0",accent:"#f59e0b",button:"#41525f",button_text:"#f8fafc",border:"#617688",highlight:"#7dd3fc",window:"#161d23",tok_brackets:"#93c5fd",tok_asterisk:"#fbbf24",tok_parentheses:"#fb923c",tok_double_brackets:"#cbd5e1",tok_curly_braces:"#67e8f9",tok_pipes:"#38bdf8",tok_at_sign:"#f97316",muted_text:"#9aa8b2",surface:"#202930",success_bg:"#1e3430",danger_bg:"#4a2218",accent_bg:"#41320c",accent_title:"#fde68a",success_text:"#99f6e4",error_text:"#fdba74",warning_text:"#fde047"}}),E({name:"tyranid_hive",display_name:"Tyranid Hive",description:"Bone chitin, toxic magenta, and abyssal carapace purple.",tags:["builtin","warhammer","tyranid","organic"],based_on:"dark",colors:{background:"#120c18",text:"#f3e8ff",accent:"#f472b6",button:"#3f1b4d",button_text:"#fff7fb",border:"#6b2d78",highlight:"#f9a8d4",window:"#1a1222",tok_brackets:"#f5d0fe",tok_asterisk:"#fb7185",tok_parentheses:"#fdba74",tok_double_brackets:"#e9d5ff",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#f43f5e",muted_text:"#b7a3c4",surface:"#24182f",success_bg:"#243321",danger_bg:"#4f1733",accent_bg:"#441a3d",accent_title:"#fbcfe8",success_text:"#bef264",error_text:"#fda4af",warning_text:"#fdba74"}}),E({name:"genestealer_cult",display_name:"Genestealer Cult",description:"Industrial violet with warning pink and cult neon accents.",tags:["builtin","warhammer","tyranid","industrial"],based_on:"dark",colors:{background:"#0f1020",text:"#ede9fe",accent:"#8b5cf6",button:"#312e81",button_text:"#f5f3ff",border:"#5b4bc4",highlight:"#c084fc",window:"#151730",tok_brackets:"#a78bfa",tok_asterisk:"#fb7185",tok_parentheses:"#f97316",tok_double_brackets:"#ddd6fe",tok_curly_braces:"#67e8f9",tok_pipes:"#c084fc",tok_at_sign:"#f43f5e",muted_text:"#a6a1c9",surface:"#1d2040",success_bg:"#203229",danger_bg:"#47152a",accent_bg:"#2e255d",accent_title:"#e9d5ff",success_text:"#99f6e4",error_text:"#fda4af",warning_text:"#fdba74"}}),E({name:"golden_throne",display_name:"Golden Throne",description:"Black marble, relic gold, and cathedral ivory.",tags:["builtin","warhammer","imperium","gold"],based_on:"dark",colors:{background:"#110f0d",text:"#f6efe2",accent:"#d4af37",button:"#4a3510",button_text:"#fffbeb",border:"#6f5521",highlight:"#f6d365",window:"#171411",tok_brackets:"#fcd34d",tok_asterisk:"#fda4af",tok_parentheses:"#fdba74",tok_double_brackets:"#fef3c7",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#f87171",muted_text:"#b3a58d",surface:"#231e18",success_bg:"#253224",danger_bg:"#472119",accent_bg:"#433311",accent_title:"#fef3c7",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde68a"}})];class K{constructor(e){this.executor=e}readers=[];onComplete;onError;controller=new AbortController;subscribe(e){return this.readers.push(e),this}onComplete_(e){return this.onComplete=e,this}onError_(e){return this.onError=e,this}async start(){try{await this.executor({emit:(e,n)=>this.emit(e,n),signal:this.controller.signal})}catch(e){if(this.controller.signal.aborted)return;this.emit("error",{error:e instanceof Error?e.message:"Stream failed"})}}abort(){this.controller.abort()}emit(e,n){const r={event:e,data:n};this.readers.forEach(a=>a(r)),r.event==="complete"&&this.onComplete&&this.onComplete(r.data),r.event==="error"&&this.onError&&this.onError(r.data.error)}}class b extends Error{constructor(e,n){super(n),this.status=e,this.name="APIError"}}function Rc(t,e){return pt(t,e)}function Oc(t,e,n){ln(t,e,n)}function Gt(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function Ht(){return{...I.getConfig(),api_keys:I.getApiKeys()}}function Cc(t){return t.engine_mode==="explicit"&&t.engine!=="auto"&&t.engine!=="openai_compatible"?t.engine:t.model?pn(t.model):void 0}function Ra(t){return Object.values(t).find(e=>typeof e=="string"&&e.trim().length>0)}function Ic(t,e){const n=e[t];return typeof n=="string"&&n.trim().length>0?n:Ra(e)}function ge(){return Rc([ka,...xa],[])}function Pe(t){Oc(ka,xa,t)}function Qe(){return[...xc,...ge()]}function zt(t,e,n){return{blob:new Blob([t],{type:n}),filename:e,contentType:n}}async function Kt(t){const e=I.getConfig(),n=I.getApiKeys(),r=Cc(e);return _e({model:e.model,apiKey:r?n[r]:Ra(n),apiKeys:n,provider:r,baseUrl:e.base_url,temperature:e.temperature,maxTokens:e.max_tokens}).generateStream(t)}class Dc{async loadProviderModels(e,n=!1){const r=I.getApiKeys(),a=I.getConfig(),s=e,o=a.base_url||xo(s),i=Ic(e,r),d=`${e}|${o}|${i?"auth":"anon"}`,l=qe.get(d);if(!n&&l&&Date.now()-l.cachedAt<Tc)return{...l.response,cached:!0};const c=$a(s),p=["openrouter","openai","deepseek","zai","moonshot"].includes(e);if(!i||!p){const u={provider:e,models:c,cached:!0,error:i||p?void 0:"Provider model listing is not available in browser mode."};return qe.set(d,{response:u,cachedAt:Date.now()}),u}try{const u=await Ma(s,i,o);return qe.set(d,{response:u,cachedAt:Date.now()}),u}catch(u){const m=u instanceof TypeError&&u.message==="Failed to fetch"?"Network request blocked. This may be due to browser privacy settings (common in EU), ad blockers, or firewall restrictions. Try disabling tracking protection for this site or using a different network.":u instanceof Error?u.message:"Failed to load models",h={provider:e,models:c,cached:!0,error:m};return qe.set(d,{response:h,cachedAt:Date.now()}),h}}async getConfig(){return Ht()}getConfigSnapshot(){return Ht()}getThemesSnapshot(){return Qe()}async syncConfigFromServer(){return!1}async updateConfig(e){const n={...e};return e.api_keys&&(I.replaceApiKeys(e.api_keys),delete n.api_keys),I.updateConfig(n),this.getConfig()}async testConnection(e){const n=I.getApiKeys()[e.provider];if(!n)return{success:!1,error:`No API key configured for ${e.provider}`};const r=e.model||Ro[e.provider]?.[0]||Ht().model;return _e({model:r,apiKey:n,provider:e.provider,baseUrl:e.base_url}).testConnection()}async getThemes(){return this.getThemesSnapshot()}async createTheme(e){const n=ge();if(Qe().some(a=>a.name===e.name))throw new b(409,`Theme ${e.name} already exists`);const r={...e,description:e.description||"",author:e.author||"",tags:e.tags||[],based_on:e.based_on||"",is_builtin:!1};return n.push(r),Pe(n),r}async exportTheme(e){const n=Qe().find(r=>r.name===e);if(!n)throw new b(404,`Theme ${e} not found`);return zt(JSON.stringify(n,null,2),`${Gt(e)}.json`,"application/json")}async importTheme(e,n={}){const a={...JSON.parse(await e.text()),is_builtin:!1},s=ge(),o=s.findIndex(i=>i.name===a.name);if(o>=0)if(n.conflict_strategy==="overwrite")s[o]=a;else if(n.conflict_strategy==="rename")a.name=n.target_name||`${a.name}_copy`,s.push(a);else throw new b(409,`Theme ${a.name} already exists`);else s.push(a);return Pe(s),a}async updateTheme(e,n){const r=ge(),a=r.findIndex(s=>s.name===e);if(a<0)throw new b(404,`Theme ${e} is builtin or missing`);return r[a]={...r[a],...n},Pe(r),r[a]}async duplicateTheme(e,n){const r=Qe().find(a=>a.name===e);if(!r)throw new b(404,`Theme ${e} not found`);return this.createTheme({name:n.new_name,display_name:n.display_name||r.display_name,description:n.description||r.description,author:n.author||r.author,tags:n.tags||r.tags,based_on:n.based_on||r.name,colors:r.colors})}async renameTheme(e,n){return this.updateTheme(e,{display_name:n.display_name,...n.new_name!==e?{}:{}}).then(r=>{const a=ge(),s=a.findIndex(o=>o.name===e);if(s<0)throw new b(404,`Theme ${e} is builtin or missing`);return a[s]={...r,name:n.new_name},Pe(a),a[s]})}async deleteTheme(e){const n=ge().filter(r=>r.name!==e);return Pe(n),{status:"deleted",name:e}}async getModels(e){return this.loadProviderModels(e,!1)}async refreshModels(e){const n=await this.loadProviderModels(e,!0);return{status:"ok",model_count:n.models.length,error:n.error}}async generateSeeds(e){const n=[];for await(const r of Y.generateSeeds(e))r.type==="complete"&&r.content&&n.push(...r.content.split(`
`).map(a=>a.trim()).filter(Boolean));return{seeds:[...new Set(n)]}}async getTemplates(){return vt().map(e=>e.template)}async listTemplates(){return this.getTemplates()}async getTemplate(e){const n=X(e);if(!n)throw new b(404,`Template ${e} not found`);return n.template}async getTemplateBlueprintContents(e){const n=X(e);if(!n)throw new b(404,`Template ${e} not found`);return{blueprint_contents:n.blueprint_contents}}async createTemplate(e){const n=Fe();if(n.some(a=>a.template.name===e.name))throw new b(409,`Template ${e.name} already exists`);const r=Vn(e);return n.push(r),Ft(n),r.template}async updateTemplate(e,n){const r=Fe(),a=r.findIndex(s=>s.template.name===e);if(a<0){if(!X(e))throw new b(404,`Template ${e} not found`);const o=Sc(n.name,e);return this.createTemplate({...n,name:o})}if(n.name!==e){const s=X(n.name);if(s&&s.template.name!==e)throw new b(409,`Template ${n.name} already exists`)}return r[a]=Vn(n,{templateRoot:r[a].template_root}),Ft(r),r[a].template}async deleteTemplate(e){const n=Fe().filter(r=>r.template.name!==e);return Ft(n),{status:"deleted",name:e}}async duplicateTemplate(e,n){const r=X(e);if(!r)throw new b(404,`Template ${e} not found`);return this.createTemplate({name:n.name,version:n.version||r.template.version,description:r.template.description,assets:r.template.assets,blueprint_contents:r.blueprint_contents})}async validateTemplate(e){const n=X(e);if(!n)throw new b(404,`Template ${e} not found`);const r=Xa(n.template),a=ho(n.template,s=>xn(n.template.name,s)??null);return{errors:r.errors,warnings:a}}async exportTemplate(e){const n=bi(e)??X(e);if(!n)throw new b(404,`Template ${e} not found`);return zt(JSON.stringify(n,null,2),`${Gt(e)}.json`,"application/json")}async importTemplate(e){const n=JSON.parse(await e.text());if("template"in n&&n.template){const r=n;return this.createTemplate({name:r.template.name,version:r.template.version,description:r.template.description,assets:r.template.assets,blueprint_contents:r.blueprint_contents})}return this.createTemplate({name:n.name||e.name.replace(/\.[^.]+$/,""),version:n.version||"1.0",description:n.description||"",assets:n.assets||[],blueprint_contents:n.blueprint_contents||{}})}async getDrafts(e){const n=await O.getAllMetadata({includeArchived:!0}),r=cs(n,e);return is(r,r.length,r,n)}async listDrafts(e){return this.getDrafts(e)}async getDraft(e){const n=await O.getDraft(e);if(!n)throw new b(404,`Draft ${e} not found`);return n}async createDraft(e){const n=e.seed.trim(),r=e.templateName.trim();if(!n)throw new b(400,"Seed is required");if(!r)throw new b(400,"Template is required");const a=crypto.randomUUID(),s=new Date().toISOString(),o={path:a,metadata:{review_id:a,seed:n,mode:e.mode??"Auto",model:I.getConfig().model,created:s,modified:s,favorite:!1,template_name:r,character_name:e.characterName?.trim()||n,genre:e.genre?.trim()||void 0,notes:e.notes?.trim()||void 0,tags:(e.tags??[]).map(i=>i.trim()).filter(Boolean),custom_instructions:e.customInstructions?.trim()||void 0,component_send_order:e.componentSendOrder,connected_drafts:(e.connectedDraftIds??[]).map(i=>i.trim()).filter(Boolean)},assets:e.assets??{}};return await O.saveDraft(o),o}async updateMetadata(e,n){return await O.updateMetadata(e,n),{status:"updated",draft_id:e}}async archiveDraft(e){return await O.updateMetadata(e,{archived_at:new Date().toISOString()}),{status:"archived",draft_id:e}}async restoreDraft(e){return await O.updateMetadata(e,{archived_at:void 0}),{status:"restored",draft_id:e}}async deleteDraft(e){return await O.deleteDraft(e),{status:"deleted",draft_id:e}}async updateAsset(e,n,r,a={}){return{status:await O.updateAsset(e,n,r,a),draft_id:e,asset_name:n}}async validateDraft(e){const n=await this.getDraft(e);return Dn(n,{resolveTemplate:G})}async validatePath(e){const n=e.path.trim().replace(/^drafts\//,""),r=await O.getDraft(n);return r?Dn(r,{resolveTemplate:G}):{path:e.path,output:`VALIDATION FAILED
- ${sr()?"Desktop draft storage":"Browser-only mode"} can validate saved drafts by review ID only.`,errors:"",exit_code:1,success:!1}}generate(e){return new K(async({emit:n,signal:r})=>{for await(const a of Y.generate(e,{signal:r})){if(r.aborted)return;if(a.type==="chunk"&&n("chunk",{content:a.content||""}),a.type==="complete"){const s=a.asset||"",o=s?await O.getDraft(s):null;n("complete",{draft_path:s,draft_id:s,character_name:o?.metadata.character_name,duration_ms:0})}a.type==="error"&&n("error",{error:a.error||"Generation failed"})}})}generateAsset(e){return new K(async({emit:n,signal:r})=>{for await(const a of Y.generateAsset(e,!0,{signal:r})){if(r.aborted)return;a.type==="chunk"&&n("chunk",{content:a.content||""}),a.type==="asset"&&n("complete",{asset_name:e.asset_name,content:a.content||""}),a.type==="error"&&n("error",{error:a.error||"Asset generation failed"})}})}previewBlueprint(e){return new K(async({emit:n,signal:r})=>{for await(const a of Y.previewBlueprint(e,!0,{signal:r})){if(r.aborted)return;a.type==="chunk"&&n("chunk",{content:a.content||""}),a.type==="asset"&&n("complete",{asset_name:e.asset_name,content:a.content||"",system_prompt:a.systemPrompt||"",user_prompt:a.userPrompt||""}),a.type==="error"&&n("error",{error:a.error||"Blueprint preview failed"})}})}async finalizeGeneration(e){const n=crypto.randomUUID(),r=ye(e.assets,e.template),a={path:n,metadata:{review_id:n,seed:e.seed,mode:e.mode,model:I.getConfig().model,created:new Date().toISOString(),modified:new Date().toISOString(),favorite:!1,template_name:e.template,character_name:r},assets:e.assets};return await O.saveDraft(a),{draft_path:n,draft_id:n,character_name:r,duration_ms:0}}generateBatch(e,n){return new K(async({emit:r,signal:a})=>{const s=async(o,i)=>{r("batch_start",{index:i,seed:o});try{let d="";for await(const l of Y.generate({seed:o,mode:n.mode,template:n.template,selected_assets:n.selected_assets,connected_draft_ids:n.connected_draft_ids},{signal:a})){if(a.aborted)return;l.type==="complete"&&(d=l.asset||"")}r("batch_complete",{index:i,seed:o,draft_path:d})}catch(d){r("batch_error",{index:i,seed:o,error:d instanceof Error?d.message:"Batch generation failed"})}};if(n.parallel){let o=0;const i=Math.min(Math.max(n.max_concurrent??3,1),e.length||1);await Promise.all(Array.from({length:i},async()=>{for(;!a.aborted;){const d=o;if(o+=1,d>=e.length)return;await s(e[d],d)}}))}else for(let o=0;o<e.length;o+=1){if(a.aborted)return;await s(e[o],o)}a.aborted||r("complete",{status:"done"})})}async getLineage(){const e=await O.getAllMetadata();return us(e)}async analyzeSimilarity(e){const n=await this.getDraft(e.draft1_id),r=await this.getDraft(e.draft2_id),a=ls(n,r);if(!e.include_llm_analysis)return a;try{const s=await Y.analyzeSimilarity(e.draft1_id,e.draft2_id),o=Array.isArray(s.story_opportunities)?s.story_opportunities.map(l=>String(l)).slice(0,4):a.relationship_suggestions,i=Array.isArray(s.scene_suggestions)?s.scene_suggestions.map(l=>String(l)).slice(0,3):a.relationship_suggestions,d=[s.narrative_dynamics,s.relationship_arc].filter(l=>typeof l=="string"&&l.trim().length>0).join(`

`)||(typeof s.raw=="string"?s.raw:"LLM analysis unavailable.");return{...a,relationship_suggestions:i,llm_analysis:{relationship_potential:d,conflict_areas:a.differences.slice(0,4),synergy_areas:a.commonalities.slice(0,4),story_hooks:o}}}catch{return a}}generateOffspring(e){return new K(async({emit:n,signal:r})=>{for await(const a of Y.generateOffspring(e,{signal:r})){if(r.aborted)return;if(a.type==="status"&&n("status",{stage:a.stage,asset:a.asset,progress:a.progress}),a.type==="chunk"&&n("chunk",{content:a.content||""}),a.type==="complete"){const s=a.asset||"",o=s?await O.getDraft(s):null;n("complete",{draft_id:s,character_name:o?.metadata.character_name})}a.type==="error"&&n("error",{error:a.error||"Offspring generation failed"})}})}generateOffspringSeed(e){return new K(async({emit:n,signal:r})=>{for await(const a of Y.generateOffspringSeed(e,{signal:r})){if(r.aborted)return;a.type==="status"&&n("status",{stage:a.stage,asset:a.asset,progress:a.progress}),a.type==="chunk"&&n("chunk",{content:a.content||""}),a.type==="complete"&&n("complete",{content:a.content||""}),a.type==="error"&&n("error",{error:a.error||"Offspring seed generation failed"})}})}generateLorebook(e){return new K(async({emit:n,signal:r})=>{for await(const a of Y.generateLorebook(e,{signal:r})){if(r.aborted)return;a.type==="status"&&n("status",{stage:a.stage,asset:a.asset,progress:a.progress}),a.type==="chunk"&&n("chunk",{content:a.content||""}),a.type==="complete"&&n("complete",{content:a.content||""}),a.type==="error"&&n("error",{error:a.error||"Lorebook generation failed"})}})}async getExportPresets(){return kc}async exportDraft(e){const n=await this.getDraft(e.draft_id),r=e.preset==="text"||e.preset==="combined"||e.preset==="png"?e.preset:"json",a=e.include_metadata!==!1,s=Gt(n.metadata.character_name||n.metadata.seed||n.metadata.review_id),o=eo(n,r,a);return zt(o.content,`${s}.${o.extension}`,o.contentType)}async getBlueprints(){const e=[...te().values()];return mo(e)}async getWorlds(e){return x()?Lo(e):{worlds:[]}}async getWorld(e){if(x())return it(e);throw new b(501,D)}async createWorld(e){if(x())return Po(e);throw new b(501,D)}async updateWorld(e,n){if(x())return $o(e,n);throw new b(501,D)}async deleteWorld(e){if(x())return Mo(e);throw new b(501,D)}async addWorldCharacter(e,n){if(x())return Fo(e,n);throw new b(501,D)}async updateWorldCharacter(e,n,r){if(x())return Uo(e,n,r);throw new b(501,D)}async deleteWorldCharacter(e,n){if(x())return Bo(e,n);throw new b(501,D)}async addWorldFaction(e,n){if(x())return Wo(e,n);throw new b(501,D)}async updateWorldFaction(e,n,r){if(x())return jo(e,n,r);throw new b(501,D)}async deleteWorldFaction(e,n){if(x())return Go(e,n);throw new b(501,D)}async addWorldLocation(e,n){if(x())return Ho(e,n);throw new b(501,D)}async updateWorldLocation(e,n,r){if(x())return zo(e,n,r);throw new b(501,D)}async deleteWorldLocation(e,n){if(x())return Ko(e,n);throw new b(501,D)}async getTimeline(e){if(x())return ct(e);throw new b(501,D)}async createTimeline(e){if(x())return Vo(e);throw new b(501,D)}async updateTimeline(e,n){if(x())return Yo(e,n);throw new b(501,D)}async deleteTimeline(e){if(x())return Jo(e);throw new b(501,D)}async addTimelineEvent(e,n){if(x())return Xo(e,n);throw new b(501,D)}async updateTimelineEvent(e,n,r){if(x())return qo(e,n,r);throw new b(501,D)}async deleteTimelineEvent(e,n){if(x())return Qo(e,n);throw new b(501,D)}async getBlueprint(e){const n=te().get(e);if(!n)throw new b(404,`Blueprint ${e} not found`);return n}async updateBlueprint(e,n){if(Mt(e)!==null&&!gi(e)){const s=Ac(e,n),o=_i(s.name||e,e);return this.createBlueprint(o,n)}const a=ee();return a[e]=n,Ne(a),this.getBlueprint(e)}async deleteBlueprint(e){if(Mt(e)!==null)throw new b(400,`Cannot delete built-in blueprint ${e}`);const n=ee();return delete n[e],Ne(n),{status:"deleted",path:e}}async resetBlueprint(e){const n=ee();delete n[e],Ne(n);const r=this.getBlueprint(e);if(!r)throw new b(404,`Blueprint ${e} not found`);return r}async createBlueprint(e,n){if(te().get(e))throw new b(409,`Blueprint ${e} already exists`);const a=ee();return a[e]=n,Ne(a),this.getBlueprint(e)}async duplicateBlueprint(e,n){const r=te().get(e);if(!r)throw new b(404,`Source blueprint ${e} not found`);if(te().get(n))throw new b(409,`Blueprint ${n} already exists`);const s=ee();return s[n]=r.content,Ne(s),this.getBlueprint(n)}hasBlueprintOverride(e){return yi(e)}getOriginalBlueprintContent(e){return Mt(e)}chat(e){return new K(async({emit:n,signal:r})=>{const a=e.draft_id?await O.getDraft(e.draft_id):null,s=[a?`Current draft metadata: ${JSON.stringify(a.metadata)}`:"",e.context_asset&&a?.assets[e.context_asset]?`Focused asset (${e.context_asset}):
${a.assets[e.context_asset]}`:"",e.screen_context?`Screen context: ${JSON.stringify(e.screen_context)}`:""].filter(Boolean),o=[{role:"system",content:"You are the in-app assistant for Eidolon Simulacra, a browser-only blueprint compiler. Be concise and practical. Use provided draft or screen context when relevant."},...s.length>0?[{role:"system",content:s.join(`

`)}]:[],...e.messages],i=await Kt(o);let d="";for await(const l of i){if(r.aborted)return;if(l.content&&(d+=l.content,n("chunk",{content:l.content})),l.done)break}n("complete",{content:d})})}refine(e){return new K(async({emit:n,signal:r})=>{const a=await this.getDraft(e.draft_id),s=a.assets[e.asset];if(!s)throw new b(404,`Asset ${e.asset} not found in draft`);const o=[{role:"system",content:"Rewrite the provided asset according to the user request. Return only the revised asset content with no extra commentary."},{role:"user",content:`Draft seed: ${a.metadata.seed}
Asset: ${e.asset}

Current content:
${s}

Revision request:
${e.message}`}],i=await Kt(o);let d="";for await(const l of i){if(r.aborted)return;if(l.content&&(d+=l.content,n("chunk",{content:l.content})),l.done)break}n("complete",{content:d})})}optimizeText(e){return new K(async({emit:n,signal:r})=>{const a=Ka(e),s=await Kt(a);let o="";for await(const i of s){if(r.aborted)return;if(i.content&&(o+=i.content,n("chunk",{content:i.content})),i.done)break}n("complete",{content:o})})}}const cd=new Dc;export{Hc as $,hc as A,gc as B,jc as C,id as D,rd as E,Qc as F,Y as G,Zc as H,xn as I,gn as J,ir as K,ar as L,un as M,ye as N,Ee as O,Uc as P,Bc as Q,Ro as R,Xi as S,od as T,st as U,Sr as V,_e as W,Ui as X,Gc as Y,Bi as Z,Zo as _,cd as a,Kc as a0,td as a1,ei as a2,zc as a3,Wc as a4,Fe as a5,ee as a6,Mc as a7,Fc as a8,to as a9,Ft as aa,Ne as ab,co as ac,Vc as ad,wa as b,I as c,$s as d,Ji as e,$c as f,xe as g,Ge as h,Yc as i,qi as j,Jc as k,qc as l,sd as m,cn as n,dc as o,cc as p,Pc as q,mc as r,Xc as s,ad as t,kt as u,Tt as v,O as w,ed as x,nd as y,oe as z};
//# sourceMappingURL=api-CiDWqhB-.js.map
