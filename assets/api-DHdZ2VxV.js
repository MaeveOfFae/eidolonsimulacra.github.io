const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-D-vAdFmu.js","assets/react-vendor-C34M-SVW.js"])))=>i.map(i=>d[i]);
import{r as er,w as tr,b as Ue,a as x,_ as pr,c as Je,d as fr,i as un}from"./index-DbDr8Nxd.js";import{D as se}from"./storage-vendor-CKqr1NrK.js";var mr=10;function hr(r){const e=r.toLowerCase();return e.startsWith("openrouter/")?"openrouter":e.startsWith("openai/")?"openai":e.startsWith("google/")?"google":e.startsWith("anthropic/")?"anthropic":e.startsWith("deepseek/")?"deepseek":e.startsWith("zai/")?"zai":e.startsWith("moonshot")?"moonshot":e.startsWith("ollama/")?"ollama":e.startsWith("gpt-")||e.startsWith("o1")?"openai":e.startsWith("gemini")?"google":e.startsWith("claude")?"anthropic":e.startsWith("llama")||e.startsWith("mistral")||e.startsWith("codellama")||e.startsWith("vicuna")||e.startsWith("qwen")||e.startsWith("phi")||e.startsWith("gemma")||e.startsWith("starcoder")||e.includes("ollama")?"ollama":"openrouter"}function La(r){return r.replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[\u200B-\u200D\uFEFF]/g,"").trim().replace(/^['"]+|['"]+$/g,"")}function Pa(r){return!r||/[^\x20-\x7E]/.test(r)||/\r|\n/.test(r)?!0:[/^window\.fetch:/i,/cannot convert value in record<bytestring/i,/^bearer\s+window\.fetch:/i].some(e=>e.test(r))}function $a(r,e,t={}){const n={};t.contentType&&(n["Content-Type"]=t.contentType),t.accept&&(n.Accept=t.accept);const a=typeof e=="string"?La(e):void 0;if(a){if(Pa(a))throw new Error("Configured API key is invalid or corrupted. Re-enter it in Settings and try again.");switch(r){case"anthropic":n["x-api-key"]=a,n["anthropic-version"]="2023-06-01";break;case"google":n["x-goog-api-key"]=a;break;default:n.Authorization=`Bearer ${a}`;break}}return r==="openrouter"&&(n["HTTP-Referer"]=typeof window<"u"?window.location.origin:"https://eidolon-simulacra.app",n["X-OpenRouter-Title"]="Eidolon Simulacra"),n}var Fa={openai:["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo","o1-preview"],google:["gemini-2.0-flash-exp","gemini-2.0-flash-thinking-exp","gemini-1.5-pro","gemini-1.5-flash"],openrouter:["anthropic/claude-3.5-sonnet","anthropic/claude-3.5-haiku","google/gemini-pro-1.5","openai/gpt-4o-mini"],anthropic:["claude-3.5-sonnet","claude-3.5-haiku","claude-3-opus"],deepseek:["deepseek-chat","deepseek-coder"],zai:["glm-4","glm-4-flash"],moonshot:["moonshot-v1-8k","moonshot-v1-32k","moonshot-v1-128k"],ollama:["llama3.2","llama3.1","mistral","codellama","qwen2.5","phi3","gemma2"]};function Ma(r){return(Fa[r]||[]).map(e=>({id:e,name:e,provider:r}))}async function ja(r,e,t,n={}){const a=$a(r,e,n.includeContentTypeHeader?{contentType:"application/json"}:void 0),s=await fetch(`${t}/models`,{method:"GET",headers:a});if(!s.ok){let c=`HTTP ${s.status}`;try{const l=await s.json();typeof l.error=="string"?c=l.error:l.error?.message&&(c=l.error.message)}catch{}throw new Error(c)}const i=((await s.json()).data||[]).filter(c=>!!c?.id).map(c=>({id:c.id,name:c.name||c.id,provider:r,context_length:c.context_length,supports_vision:c.architecture?.input_modalities?.includes("image")||!1,supports_tools:c.supported_parameters?.includes("tools")||!1}));return{provider:r,models:i,cached:!1}}var Ua=/<(think|thinking|reasoning|analysis)\b[^>]*>[\s\S]*?<\/\1>/gi,Ba=/<(think|thinking|reasoning|analysis)\b[^>]*>[\s\S]*$/i,Wa=/<\/?(think|thinking|reasoning|analysis)\b[^>]*>/gi,Ga=/<[^>\n]*$/;function Nr(r){if(r===null)return null;if(typeof r=="string"){const e=r.replace(/\s+/g," ").trim();return e?e.length>240?`${e.slice(0,237)}...`:e:null}return String(r)}function za(r){return typeof r=="object"&&r!==null&&!Array.isArray(r)}function rr(r,e,t,n=0){if(t.length>=60||n>4)return;if(Array.isArray(r)){if(r.length===0)return;const s=r.map(o=>o===null||typeof o=="boolean"||typeof o=="number"||typeof o=="string"?Nr(o):null).filter(o=>!!o);if(s.length===r.length){t.push(`- ${e}: ${s.slice(0,8).join(", ")}`),r.length>8&&t.push(`- ${e}: (${r.length-8} more values omitted)`);return}r.slice(0,3).forEach((o,i)=>{rr(o,`${e}[${i}]`,t,n+1)}),r.length>3&&t.push(`- ${e}: (${r.length-3} more items omitted)`);return}if(za(r)){const s=Object.entries(r);s.slice(0,15).forEach(([o,i])=>{const c=e?`${e}.${o}`:o;rr(i,c,t,n+1)}),s.length>15&&t.length<60&&t.push(`- ${e||"root"}: (${s.length-15} more fields omitted)`);return}const a=Nr(r);a&&t.push(`- ${e}: ${a}`)}function Ha(r,e){const t=r.trim();if(!t)return"";const n=e.rawTextLineLimit,a=e.rawTextCharLimit;if(!n&&!a)return r;const s=t.split(/\r?\n/).map(l=>l.trimEnd()).filter(l=>l.trim().length>0),i=(typeof n=="number"?s.slice(0,n):s).join(`
`);return typeof a!="number"||i.length<=a&&(!n||s.length<=n)?i:`${i.slice(0,a).trimEnd()}
[truncated for context]`}function Lt(r){const e=r.trim(),t=e.match(/^```[^\r\n]*\r?\n([\s\S]*?)\r?\n```$/);return t?t[1]?.trim()??"":e}function Ka(r){return r.replace(Ua,"").replace(Ba,"").replace(Wa,"").replace(Ga,"")}function gr(r,e,t,n={}){const a=r.endsWith(":")?r.slice(0,-1):r,s=t.trim();if(!s)return[r,"```","","```",""];if(s.startsWith("{")||s.startsWith("["))try{const i=JSON.parse(s),c=[];if(rr(i,"",c),c.length>0)return[`${a} (structured JSON context):`,n.jsonInstruction||"Use the extracted fields below. Do not assume access to any external file.",...c,""]}catch{}const o=Ha(t,n);return[r,"```",o,"```",""]}function pn(r,e,t){if(!r||Object.keys(t).length===0)return t;const n=r.assets.find(i=>i.name===e);if(!n||n.depends_on.length===0)return{};const a=new Map(r.assets.map(i=>[i.name,i])),s=new Set,o=i=>{s.has(i)||(s.add(i),a.get(i)?.depends_on.forEach(o))};return n.depends_on.forEach(o),Object.fromEntries(Object.entries(t).filter(([i])=>s.has(i)))}function Jc(r){const e=typeof r=="string"?r:"",t=e.trim(),n=t.length===0?0:t.split(/\s+/).length;return{characters:e.length,words:n,estimatedTokens:Va(e)}}function Va(r){const t=(typeof r=="string"?r:"").trim();return t?Math.max(1,Math.ceil(t.length/4)):0}function Ya(r){const e=r.preserve_format!==!1,t=Number.isFinite(r.target_reduction)?Math.min(Math.max(Math.round(r.target_reduction),5),80):25,n=["You optimize text for lower token usage without removing relevant information.","Your job is compression by shortening, tightening, deduplicating, and removing bloat only.","Do not delete relevant facts, requirements, constraints, names, relationships, instructions, or semantic content.","Do not summarize away meaning.","Do not add new information.",e?"Preserve the original structure and formatting style as closely as possible unless shorter phrasing requires minimal cleanup.":"You may lightly normalize formatting when it helps shorten the text.","Prefer shorter wording, denser sentences, fewer repeated qualifiers, and less throat-clearing language.","If a phrase can be made shorter without losing meaning, shorten it.","Return only the optimized text with no commentary, labels, bullets about what changed, or code fences."].join(" "),a=[`Target reduction: about ${t}% fewer tokens if achievable without losing relevant data.`,e?"Preserve formatting where practical.":"Formatting may be normalized if needed.","","Text to optimize:",r.text].join(`
`);return[{role:"system",content:n},{role:"user",content:a}]}var Pt=class extends Error{constructor(r){super(r),this.name="ParseError"}},Ja=["system_prompt","post_history","character_sheet","intro_scene","intro_page","a1111"];function qa(r){const e=/```(?:[a-z]*\n)?(.*?)```/gs,t=r.match(e);return t?t.map(n=>n.trim()):[]}function Xa(r,e){const t=qa(r);if(t.length===0)throw new Pt("No codeblocks found in output");let n=0,a;t[0].trim().startsWith("Adjustment Note:")&&(a=t[0].trim(),n=1);const s=t.slice(n);let o=[];e&&e.assets.length>0?o=e.assets.map(d=>d.name):o=[...Ja];const i=o.length;if(s.length!==i){const d=s.slice(0,3).map((u,f)=>`  Block ${f}: ${u.substring(0,75)}${u.length>75?"...":""}`).join(`
`);let p=`Expected ${i} asset blocks, found ${s.length}. `;throw p+=`Template requires order: ${o.join(", ")}
`,p+=`Actual blocks found:
${d}`,s.length>3&&(p+=`
  ... and ${s.length-3} more blocks`),new Pt(p)}const c={};for(let d=0;d<o.length;d++)c[o[d]]=s[d];const l=as(c);if(l&&Object.keys(l).length>0){const d=Object.entries(l).map(([p,u])=>`${p}: ${Array.from(new Set(u)).join(", ")}`).join("; ");throw new Pt("Generated content failed validation checks: "+d)}return{assets:c,adjustmentNote:a}}function Qa(r){const e=r.match(/^name:\s*(.+)$/m);return e&&e[1].trim().replace(/^['"]|['"]$/g,"")||null}function fn(r,e=["character_sheet"]){const t=[],n=new Set;for(const a of e)a in r&&!n.has(a)&&(t.push(a),n.add(a));for(const a of Object.keys(r))n.has(a)||(t.push(a),n.add(a));for(const a of t){const s=Qa(r[a]||"");if(s)return s}return null}var Za=[["{PLACEHOLDER}",/\{PLACEHOLDER\}/g],["Generic {...} placeholder",/(?<!\{)\{(?!\{)[^{}\n]*[A-Za-z][^{}\n]*\}(?!\})/g],["Suno {TITLE}",/\{TITLE\}/g],["Suno other {..}",/\{GENRE\}|\{STYLE\}|\{MOOD\}|\{ENERGY\}|\{TEMPO\}|\{BPM\}|\{TEXTURE\}|\{Remaster Style\}/g],["A1111 slot ((...))",/\(\(\.\.\)\)/g],["A1111 any slot ((...something...)) left",/\(\([^)]*\.\.\.[^)]*\)/g],["Character sheet bracket placeholders",/\[[A-Za-z][^\]\n]*\]/g]],es=[["Narrates {{user}} action/thought/consent",/\{\{user\}\}\s+(?:is|was|feels?|felt|thinks?|thought|decides?|decided|knows?|knows?|wants?|wanted|says?|said|nods?|smiles?|walks?|steps?|looks?|touches?|takes?|gives?|allows?|consents?|agrees?|gasps?|moans?)\b/gi],["Narrates {{user}} internal state",/\{\{user\}\}'s\s+(?:mind|thoughts?|feelings?|emotions?|desire|consent|decision|reaction|actions?)\b/gi]],ts=/(?:never|do not|don't|avoid|without)\s+(?:narrat(?:e|ing)|describ(?:e|ing)|assign(?:ing)?)\s*$/gi,mn="character_sheet.txt";function rs(r,e){const t=[];for(const[n,a]of Za)n==="Character sheet bracket placeholders"&&e!==mn||a.test(r)&&t.push(n);return t}function ns(r){const e=[];for(const[t,n]of es)for(const a of r.matchAll(n)){const s=r.substring(Math.max(0,a.index-48),a.index).trim();if(!ts.test(s)){e.push(t);break}}return e}function hn(r,e){let t=`${r}.txt`;r==="intro_page"&&(t="intro_page.md"),r==="character_sheet"&&(t=mn);const n=rs(e,t);return n.push(...ns(e)),n}function as(r){const e={};for(const[t,n]of Object.entries(r)){const a=hn(t,n);a.length>0&&(e[t]=a)}return Object.keys(e).length>0?e:null}var He={name:"V2/V3 Card",version:"3.1",description:"Built-in character card template with 6 standard assets",is_official:!0,assets:[{name:"system_prompt",required:!1,depends_on:[],description:"System-level behavioral instructions",blueprint_file:"blueprints/system/system_prompt.md"},{name:"post_history",required:!1,depends_on:["system_prompt"],description:"Conversation context and relationship state",blueprint_file:"blueprints/system/post_history.md"},{name:"character_sheet",required:!0,depends_on:[],description:"Structured character data",blueprint_file:"blueprints/system/character_sheet.md"},{name:"intro_scene",required:!0,depends_on:["character_sheet"],description:"First interaction scenario",blueprint_file:"blueprints/system/intro_scene.md"},{name:"intro_page",required:!0,depends_on:["character_sheet"],description:"Visual character introduction page",blueprint_file:"blueprints/system/intro_page.md"},{name:"a1111",required:!0,depends_on:["character_sheet"],description:"Stable Diffusion image generation prompt",blueprint_file:"blueprints/system/a1111.md"}]};function ss(r){const e=r.map(o=>o.name),t=[],n=new Set,a=new Set;function s(o){if(n.has(o)||a.has(o))return;a.add(o);const i=r.find(c=>c.name===o);if(i)for(const c of i.depends_on)s(c);n.add(o),t.push(o),a.delete(o)}for(const o of e)n.has(o)||s(o);return t}function gn(r){const e=r||He;return ss(e.assets).map(n=>e.assets.find(a=>a.name===n)).filter(n=>n!==void 0)}function os(r){const e=[];r.name||e.push("Template name is required"),(!r.assets||r.assets.length===0)&&e.push("Template must have at least one asset");const t=new Map(r.assets.map(a=>[a.name,a]));function n(a,s){for(const o of a){if(o===s)return!0;const i=t.get(o);if(i&&n(i.depends_on,s))return!0}return!1}for(const a of r.assets)n(a.depends_on,a.name)&&e.push(`Circular dependency detected for asset: ${a.name}`);return{isValid:e.length===0,errors:e}}function ut(r){return typeof r.archived_at=="string"&&r.archived_at.trim().length>0}function is(r,e,t=r,n=t){const a=t.reduce((s,o)=>{s.total_drafts+=1,ut(o)&&(s.archived_drafts+=1),o.favorite&&(s.favorites+=1);const i=o.genre||"unknown",c=o.mode||"unknown";return s.by_genre[i]=(s.by_genre[i]||0)+1,s.by_mode[c]=(s.by_mode[c]||0)+1,s},{total_drafts:0,archived_drafts:n.filter(s=>ut(s)).length,favorites:0,by_genre:{},by_mode:{}});return{drafts:r,total:e,stats:a}}function cs(r,e){let t=[...r];if(e?.include_archived||(e?.archived?t=t.filter(i=>ut(i)):t=t.filter(i=>!ut(i))),e?.search){const i=e.search.toLowerCase();t=t.filter(c=>[c.character_name,c.seed,c.genre,c.notes].filter(Boolean).some(l=>String(l).toLowerCase().includes(i)))}e?.genre&&(t=t.filter(i=>i.genre===e.genre)),e?.mode&&(t=t.filter(i=>i.mode===e.mode)),e?.favorite!==void 0&&(t=t.filter(i=>i.favorite===e.favorite)),e?.tags?.length&&(t=t.filter(i=>e.tags?.every(c=>i.tags?.includes(c))));const n=e?.sort_order==="asc"?1:-1,a=e?.sort_by??"modified";t.sort((i,c)=>{const l=a==="name"?i.character_name||i.seed||"":(a==="created"?i.created:i.modified)||"",d=a==="name"?c.character_name||c.seed||"":(a==="created"?c.created:c.modified)||"";return l.localeCompare(d)*n});const s=e?.offset??0,o=e?.limit;return o!==void 0?t=t.slice(s,s+o):s>0&&(t=t.slice(s)),t}function Lr(r,e={}){const t=[],n=e.resolveTemplate?.(r.metadata.template_name)||e.fallbackTemplate||He;return gn(n).filter(s=>s.required).forEach(s=>{r.assets[s.name]?.trim()||t.push(`- missing required asset ${s.name}`)}),Object.entries(r.assets).forEach(([s,o])=>{if(!o.trim()){t.push(`- ${s}: asset is empty`);return}const i=hn(s,o);i.length>0&&t.push(`- ${s}: ${Array.from(new Set(i)).join(", ")}`)}),t.length===0?t.push("OK: no obvious placeholder violations found in saved assets."):t.unshift("VALIDATION FAILED"),{path:r.metadata.review_id,output:t.join(`
`),errors:"",exit_code:t[0]==="VALIDATION FAILED"?1:0,success:t[0]!=="VALIDATION FAILED"}}function Pr(r){const e=`${r.metadata.character_name||""}
${r.metadata.seed}
${Object.values(r.assets).join(`
`)}`.toLowerCase().replace(/[^a-z0-9\s]+/g," ").split(/\s+/).filter(t=>t.length>3);return new Set(e)}function ds(r){return r>=.7?"high":r>=.45?"medium":"low"}function ls(r,e){const t=Pr(r),n=Pr(e),a=[...t].filter(p=>n.has(p)),s=[...t].filter(p=>!n.has(p)),o=[...n].filter(p=>!t.has(p)),i=new Set([...t,...n]).size||1,c=a.length/i,l=Math.min(1,(s.length+o.length)/Math.max(i,1)),d=Math.min(1,c+.15);return{character1_name:r.metadata.character_name||r.metadata.seed,character2_name:e.metadata.character_name||e.metadata.seed,overall_score:c,compatibility:ds(c),conflict_potential:l,synergy_potential:d,commonalities:a.slice(0,8),differences:[...s.slice(0,4),...o.slice(0,4)],relationship_suggestions:c>=.6?["Shared themes suggest an easy alliance arc.","Overlapping traits support collaborative scenes."]:["Use the contrast between their goals for tension.","Differences suggest rivalry or uneasy partnership."],meta_analysis:{archetype_match:c,narrative_compatibility:d,audience_appeal:Math.max(c,.35)}}}function us(r){const e=new Map;r.forEach(c=>{c.parent_drafts?.forEach(l=>{const d=e.get(l)??[];d.push(c.review_id),e.set(l,d)})});const t=new Map(r.map(c=>[c.review_id,c])),n=new Map,a=c=>{if(n.has(c))return n.get(c);const l=t.get(c);if(!l?.parent_drafts?.length)return n.set(c,0),0;const d=1+Math.max(...l.parent_drafts.map(p=>a(p)));return n.set(c,d),d},s=r.map(c=>{const l=c.parent_drafts??[],d=e.get(c.review_id)??[],p=a(c.review_id),u=l.map(m=>t.get(m)?.character_name||m),f=d.map(m=>t.get(m)?.character_name||m);return{id:c.review_id,review_id:c.review_id,draft_name:c.seed,character_name:c.character_name||c.seed,generation:p,is_root:l.length===0,is_leaf:d.length===0,offspring_type:c.offspring_type,mode:c.mode,model:c.model,created:c.created,parent_ids:l,child_ids:d,parent_names:u,child_names:f,sibling_names:l.flatMap(m=>(e.get(m)??[]).filter(h=>h!==c.review_id)).map(m=>t.get(m)?.character_name||m),num_ancestors:l.length,num_descendants:d.length}}),o=s.filter(c=>c.is_root).map(c=>c.id),i=s.reduce((c,l)=>Math.max(c,l.generation),0);return{nodes:s,roots:o,max_generation:i,stats:{total_characters:s.length,root_characters:s.filter(c=>c.is_root).length,leaf_characters:s.filter(c=>c.is_leaf).length,generations:i+1}}}var ce=new Uint8Array([137,80,78,71,13,10,26,10]),re="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";function oe(r){if(typeof TextDecoder<"u")return new TextDecoder("utf-8").decode(r);let e="";for(let t=0;t<r.length;t+=1)e+=String.fromCharCode(r[t]??0);return e}function ot(r){if(typeof TextEncoder<"u")return new TextEncoder().encode(r);const e=new Uint8Array(r.length);for(let t=0;t<r.length;t+=1)e[t]=r.charCodeAt(t)&255;return e}function pt(r){const e=r.reduce((a,s)=>a+s.length,0),t=new Uint8Array(e);let n=0;for(const a of r)t.set(a,n),n+=a.length;return t}function ps(){const r=new Uint32Array(256);for(let e=0;e<256;e+=1){let t=e;for(let n=0;n<8;n+=1)t=(t&1)===1?3988292384^t>>>1:t>>>1;r[e]=t>>>0}return r}var fs=ps();function ms(r){let e=4294967295;for(let t=0;t<r.length;t+=1)e=fs[(e^r[t])&255]^e>>>8;return(e^4294967295)>>>0}function _n(r){let e="";for(let t=0;t<r.length;t+=3){const n=r[t],a=t+1<r.length?r[t+1]:0,s=t+2<r.length?r[t+2]:0,o=n<<16|a<<8|s;e+=re[o>>18&63],e+=re[o>>12&63],e+=t+1<r.length?re[o>>6&63]:"=",e+=t+2<r.length?re[o&63]:"="}return e}function nr(r){try{const e=r.replace(/\s+/g,""),t=Math.ceil(e.length/4)*4,n=e.padEnd(t,"="),a=[];for(let s=0;s<n.length;s+=4){const o=n[s],i=n[s+1],c=n[s+2],l=n[s+3],d=re.indexOf(o),p=re.indexOf(i),u=c==="="?-1:re.indexOf(c),f=l==="="?-1:re.indexOf(l);if(d===-1||p===-1)return null;a.push(d<<2|p>>4),u!==-1&&a.push((p&15)<<4|u>>2),u!==-1&&f!==-1&&a.push((u&3)<<6|f)}return Uint8Array.from(a)}catch{return null}}function hs(r,e){const t=ot(r);if(t.length!==4)throw new Error(`Invalid PNG chunk type: ${r}`);const n=new Uint8Array(12+e.length),a=new DataView(n.buffer);return a.setUint32(0,e.length),n.set(t,4),n.set(e,8),a.setUint32(8+e.length,ms(pt([t,e]))),n}function gs(r){if(!Ce(r))throw new Error("Invalid PNG signature");const e=new DataView(r.buffer,r.byteOffset,r.byteLength);let t=ce.length;for(;t+12<=r.length;){const n=e.getUint32(t);if(oe(r.slice(t+4,t+8))==="IEND")return t;t+=12+n}throw new Error("PNG file is missing an IEND chunk")}function _s(r){if(!Ce(r))throw new Error("Invalid PNG signature");const e=new DataView(r.buffer,r.byteOffset,r.byteLength),t=[r.slice(0,ce.length)];let n=ce.length;for(;n+12<=r.length;){const a=e.getUint32(n),s=oe(r.slice(n+4,n+8)),o=n+12+a,i=r.slice(n,o);let c=!0;if(s==="tEXt"){const l=r.slice(n+8,n+8+a),d=l.indexOf(0);d!==-1&&oe(l.slice(0,d))==="chara"&&(c=!1)}if(c&&t.push(i),n=o,s==="IEND")break}return pt(t)}function Ce(r){if(r.length<ce.length)return!1;for(let e=0;e<ce.length;e+=1)if(r[e]!==ce[e])return!1;return!0}function ys(r){const e=new Uint8Array(r);if(!Ce(e))return null;const t=new DataView(r);let n=ce.length;for(;n+12<=e.length;){const a=t.getUint32(n),s=oe(e.slice(n+4,n+8));if(s==="tEXt"){const o=e.slice(n+8,n+8+a),i=o.indexOf(0);if(i!==-1&&oe(o.slice(0,i))==="chara"){const l=o.slice(i+1),d=nr(oe(l));return d?oe(d):null}}if(n+=12+a,s==="IEND")break}return null}function ws(r){return`data:image/png;base64,${_n(r)}`}function yn(r){if(typeof r!="string")return null;const e=r.trim();if(!e)return null;const t=e.match(/^data:image\/png;base64,(.+)$/i);if(t?.[1]){const a=nr(t[1]);return a&&Ce(a)?a:null}const n=nr(e);return n&&Ce(n)?n:null}function bs(r,e){if(!Ce(r))throw new Error("Draft image must be a valid PNG file");const t=_s(r),n=_n(ot(e)),a=hs("tEXt",pt([ot("chara"),new Uint8Array([0]),ot(n)])),s=gs(t);return pt([t.slice(0,s),a,t.slice(s)])}function k(r){return typeof r=="object"&&r!==null&&!Array.isArray(r)}var vs=["eidolon","eidolon_simulacra","eidolonsimulacra"];function E(r){if(typeof r!="string")return null;const e=r.trim();return e.length>0?e:null}function ke(r){return Array.isArray(r)?r.filter(e=>typeof e=="string").map(e=>e.trim()).filter(e=>e.length>0):[]}function $t(r){return typeof r=="number"&&Number.isFinite(r)?r:void 0}function ee(r){return JSON.parse(JSON.stringify(r))}function Es(r,e){if(!r&&!e)return;const t={},n=r?ee(r):void 0,a=e?ee(e):void 0,s=a?.avatar??n?.avatar;s&&(t.avatar=s);const o=a?.creator??n?.creator;o&&(t.creator=o);const i=a?.character_version??n?.character_version;i&&(t.character_version=i);const c=a?.depth_prompt??n?.depth_prompt;c&&(t.depth_prompt=ee(c));const l=n?.chub,d=a?.chub;return(l||d)&&(t.chub={...l?ee(l):{},...d?ee(d):{}}),Object.keys(t).length>0?t:void 0}function $r(r){if(!k(r))return;const e={},t=E(r.avatar);t&&(e.avatar=t);const n=E(r.creator);n&&(e.creator=n);const a=E(r.character_version);if(a&&(e.character_version=a),k(r.depth_prompt)){const s=$t(r.depth_prompt.depth),o=E(r.depth_prompt.prompt)??"";s!==void 0&&(e.depth_prompt={depth:s,prompt:o})}if(k(r.chub)){const s={},o=$t(r.chub.id);o!==void 0&&(s.id=o),(r.chub.preset===null||typeof r.chub.preset=="string")&&(s.preset=r.chub.preset===null?null:r.chub.preset.trim()||null);const i=E(r.chub.full_path);i&&(s.full_path=i),(r.chub.custom_css===null||typeof r.chub.custom_css=="string")&&(s.custom_css=r.chub.custom_css===null?null:r.chub.custom_css.trim()||null);const c=E(r.chub.background_image);c&&(s.background_image=c),Array.isArray(r.chub.extensions)&&(s.extensions=ee(r.chub.extensions)),r.chub.expressions!==void 0&&(s.expressions=ee(r.chub.expressions)),k(r.chub.alt_expressions)&&(s.alt_expressions=ee(r.chub.alt_expressions)),Array.isArray(r.chub.related_lorebooks)&&(s.related_lorebooks=r.chub.related_lorebooks.filter(l=>k(l)).map(l=>{const d={},p=$t(l.id);p!==void 0&&(d.id=p),(l.book===null||typeof l.book=="string")&&(d.book=l.book===null?null:l.book);const u=E(l.path);u&&(d.path=u);const f=E(l.version);f&&(d.version=f);const m=E(l.commit_ref);return m&&(d.commit_ref=m),d}).filter(l=>Object.keys(l).length>0)),Object.keys(s).length>0&&(e.chub=s)}return Object.keys(e).length>0?e:void 0}function Ss(r){return k(r.data)?[r,r.data]:[r]}function As(r){const e=E(r.spec),t=E(r.spec_version)??E(r.specVersion);return e==="chara_card_v2"?!0:t?t==="2"||t==="2.0"||t==="3"||t==="3.0"||t.startsWith("2.")||t.startsWith("3."):!1}function _r(r){if(!k(r.extensions))return null;for(const e of vs)if(k(r.extensions[e]))return r.extensions[e];return null}function Ft(r){return Array.isArray(r.tags)||typeof r.creator=="string"||typeof r.creator_notes=="string"||typeof r.system_prompt=="string"||typeof r.post_history_instructions=="string"||Array.isArray(r.alternate_greetings)||_r(r)!==null}function Ts(r){const e=_r(r);return!e||!k(e.assets)?{}:Object.fromEntries(Object.entries(e.assets).filter(t=>typeof t[1]=="string"&&t[1].trim().length>0).map(([t,n])=>[t,n.trim()]))}function ks(r,e){const t=_r(r),n=t&&k(t.metadata)?t.metadata:null,a={},s=(l,...d)=>{for(const p of d){const u=E(p);if(u){a[l]=u;return}}};if(n){const l=$r(n.card_metadata??n.cardMetadata);l&&(a.card_metadata=l),s("seed",n.seed),s("model",n.model),s("created",n.created,n.createdAt),s("modified",n.modified,n.updatedAt),s("genre",n.genre),s("notes",n.notes),s("character_name",n.character_name,n.characterName),s("template_name",n.template_name,n.templateName),s("custom_instructions",n.custom_instructions,n.customInstructions),s("offspring_type",n.offspring_type,n.offspringType),(n.mode==="SFW"||n.mode==="NSFW"||n.mode==="Platform-Safe"||n.mode==="Auto")&&(a.mode=n.mode),typeof n.favorite=="boolean"&&(a.favorite=n.favorite);const d=ke(n.component_send_order??n.componentSendOrder);d.length>0&&(a.component_send_order=d);const p=ke(n.tags);p.length>0&&(a.tags=p)}const o=$r({avatar:r.avatar,creator:r.creator,character_version:r.character_version,depth_prompt:k(r.extensions)?r.extensions.depth_prompt:void 0,chub:k(r.extensions)?r.extensions.chub:void 0}),i=Es(a.card_metadata,o);i&&(a.card_metadata=i);const c=ke(r.tags);if(c.length>0&&(a.tags=Array.from(new Set([...a.tags??[],...c]))),!a.notes){const l=E(r.creator_notes);l&&(a.notes=l)}return a.character_name=a.character_name??e,Object.keys(a).length>0?a:void 0}function xs(r){const e=E(r.description),t=E(r.personality),n=E(r.creator_notes);return e||t||n}function Os(r){const e=E(r.mes_example),t=E(r.post_history_instructions),n=e?ft(e):null,a=t?ft(t):null;return n&&a&&a!==n?["Example Dialogue","",n,"","Post-History Instructions","",a].join(`
`):n??a}function Cs(r){const e=E(r.first_mes);return e||(ke(r.alternate_greetings)[0]??null)}function Fr(r){if(!k(r))return"unknown";const e=Ss(r),t=e.some(a=>Ft(a));for(const a of e)if(As(a))return Ft(a)||t?"chubai":"tavernai_v2";const n=k(r.data)?r.data:r;return typeof n.description=="string"&&typeof n.first_mes=="string"&&Ft(n)?"chubai":typeof n.name=="string"&&typeof n.description=="string"&&typeof n.first_mes=="string"?"tavernai_v1":"unknown"}var Rs={description:"character_sheet",personality:"system_prompt",first_mes:"intro_scene",mes_example:"post_history",scenario:"intro_page"},Mr=["character_book","lorebook","world_info"];function ft(r,e){return r.replace(/^\{\{original\}\}\s*/i,"").replace(/^<START>\s*/i,"").trim()}function de(r){if(typeof r=="string")return r.trim()||null;if(typeof r=="number"||typeof r=="boolean")return String(r);if(r==null)return null;try{return JSON.stringify(r,null,2)}catch{return null}}function jr(r,e){if(typeof r=="string"){const c=r.trim();return c?`## Entry ${e}

${c}`:null}if(!k(r)){const c=de(r);return c?`## Entry ${e}

${c}`:null}const t=typeof r.name=="string"&&r.name.trim()?r.name.trim():typeof r.comment=="string"&&r.comment.trim()?r.comment.trim():Array.isArray(r.keys)&&r.keys.length>0?r.keys.filter(c=>typeof c=="string"&&c.trim().length>0).join(", "):`Entry ${e}`,n=[],a=Array.isArray(r.keys)?r.keys.filter(c=>typeof c=="string"&&c.trim().length>0):[],s=Array.isArray(r.secondary_keys)?r.secondary_keys.filter(c=>typeof c=="string"&&c.trim().length>0):[];a.length>0&&n.push(`Keys: ${a.join(", ")}`),s.length>0&&n.push(`Secondary Keys: ${s.join(", ")}`),typeof r.comment=="string"&&r.comment.trim()&&r.comment.trim()!==t&&n.push(`Comment: ${r.comment.trim()}`),typeof r.insertion_order=="number"&&n.push(`Insertion Order: ${r.insertion_order}`),typeof r.enabled=="boolean"&&!r.enabled&&n.push("Enabled: false");const o=typeof r.content=="string"&&r.content.trim()?r.content.trim():typeof r.entry=="string"&&r.entry.trim()?r.entry.trim():typeof r.text=="string"&&r.text.trim()?r.text.trim():null,i=[`## ${t}`];if(n.length>0&&i.push(n.join(`
`)),o)i.push(o);else{const c=de(r);c&&i.push(c)}return i.join(`

`).trim()}function wn(r,e){if(typeof e=="string")return e.trim()||null;if(Array.isArray(e)){const s=e.map((o,i)=>jr(o,i+1)).filter(o=>!!o);return s.length>0?s.join(`

`):null}if(!k(e))return de(e);const n=[typeof e.name=="string"&&e.name.trim()?`# ${e.name.trim()}`:`# ${r.replace(/_/g," ").replace(/\b\w/g,s=>s.toUpperCase())}`];typeof e.description=="string"&&e.description.trim()&&n.push(e.description.trim());const a=Array.isArray(e.entries)?e.entries:Array.isArray(e.world_info)?e.world_info:null;if(a){const s=a.map((o,i)=>jr(o,i+1)).filter(o=>!!o);s.length>0&&n.push(s.join(`

`))}if(n.length===1){const s=de(e);s&&n.push(s)}return n.join(`

`).trim()||null}function yr(r){const e={},t=[],n=[];for(const a of Mr)r[a]!==void 0&&r[a]!==null&&n.push({key:a,value:r[a]});if(k(r.extensions))for(const a of Mr)r.extensions[a]!==void 0&&r.extensions[a]!==null&&n.push({key:`extensions.${a}`,value:r.extensions[a]});return n.forEach(({key:a,value:s},o)=>{const i=wn(a,s);if(!i)return;const c=o===0?"lorebook":`lorebook_${o+1}`;e[c]=i,t.push(a.split(".")[0])}),{assets:e,sourceKeys:[...new Set(t)]}}function bn(r){return k(r.data)?{...r.data}:r}function Ds(r,e){const t=e.trim();if(!t)return;const n=r[t];if(n!==void 0)return n;const a=t.split(".").filter(Boolean);if(a.length===0)return;let s=r;for(const o of a){if(!k(s)||!(o in s))return;s=s[o]}return s}function Is(r,e){const t=r.trim().toLowerCase();if(t==="character_book"||t==="lorebook"||t==="world_info")return wn(t,e);if(t==="mes_example"||t==="system_prompt"||t==="post_history_instructions"){const n=E(e);return n?ft(n):null}if(t==="alternate_greetings"&&Array.isArray(e)){const n=ke(e);return n.length>0?JSON.stringify(n,null,2):null}return de(e)}function Ns(r,e){switch(r.trim().toLowerCase()){case"description":return["character_sheet"];case"system_prompt":case"personality":return["system_prompt","personality"];case"first_mes":return["intro_scene"];case"mes_example":case"post_history_instructions":return["post_history"];case"scenario":return["intro_page"];case"creator_notes":return["creator_notes"];case"avatar":return["avatar"];case"creator":return["creator"];case"character_version":return["character_version"];case"alternate_greetings":return["alternate_greetings"];case"character_book":case"lorebook":case"world_info":{const n=yr(e).assets;return Object.keys(n).length>0?Object.keys(n):["character_book"]}case"extensions.chub":return["chub_extension"];case"extensions.depth_prompt":return["depth_prompt"];default:return[]}}function vn(r,e,t){const n=t?.template?.assets??[];if(n.length===0)return r;const a={...r.assets},s=r.unmappedFields?{...r.unmappedFields}:void 0,o=new Set(n.map(c=>c.name)),i=new Set;for(const c of n){const l=(c.import_aliases??[]).map(d=>d.trim()).filter(d=>d.length>0);if(l.length!==0)for(const d of l){const p=Ds(e,d),u=Is(d,p);if(!u)continue;a[c.name]=u;const f=Ns(d,e);for(const m of f)m!==c.name&&!o.has(m)&&i.add(m);if(s){delete s[d];const m=d.split(".")[0];delete s[m]}break}}for(const c of i)delete a[c];return{...r,assets:a,unmappedFields:s&&Object.keys(s).length>0?s:void 0}}function it(r,e="tavernai_v1",t){if(!k(r))throw new Error("Invalid TavernAI card: expected JSON object");const n=bn(r),a=Ts(n),s={},o=yr(n),i=ks(n,typeof n.name=="string"?n.name.trim():"Imported Character"),c=typeof n.name=="string"?n.name.trim():"Imported Character";if(!a.character_sheet){const y=xs(n);y&&(a.character_sheet=y)}if(!a.system_prompt){const y=E(n.system_prompt)?ft(E(n.system_prompt)):E(n.personality);y&&(a.system_prompt=y)}const l=E(n.personality);if(l&&l!==a.system_prompt&&!a.personality&&(a.personality=l),!a.post_history){const y=Os(n);y&&(a.post_history=y)}if(!a.intro_scene){const y=Cs(n);y&&(a.intro_scene=y)}if(!a.intro_page){const y=E(n.scenario);y&&(a.intro_page=y)}const d=E(n.creator_notes);d&&!a.creator_notes&&(a.creator_notes=d);const p=E(n.avatar);p&&!a.avatar&&(a.avatar=p),p&&!a.card_image&&yn(p)&&(a.card_image=p);const u=E(n.creator);u&&!a.creator&&(a.creator=u);const f=E(n.character_version);if(f&&!a.character_version&&(a.character_version=f),n.character_book!==void 0&&!a.character_book){const y=de(n.character_book);y&&(a.character_book=y)}const m=k(n.extensions)?n.extensions:null;m&&k(m.chub)&&!a.chub_extension&&(a.chub_extension=JSON.stringify(m.chub,null,2)),m&&k(m.depth_prompt)&&!a.depth_prompt&&(a.depth_prompt=JSON.stringify(m.depth_prompt,null,2));const h=ke(n.alternate_greetings);h.length>0&&!a.alternate_greetings&&(a.alternate_greetings=JSON.stringify(h,null,2));for(const[y,R]of Object.entries(o.assets))a[y]||(a[y]=R);const w=new Set([...Object.keys(Rs),...o.sourceKeys,"system_prompt","post_history_instructions","creator_notes","alternate_greetings","avatar","creator","character_version","tags","extensions"]),v=new Set(["name","spec","spec_version","specVersion","data"]);for(const[y,R]of Object.entries(n)){if(v.has(y)||w.has(y))continue;const W=de(R);W&&(s[y]=W)}return vn({name:c,assets:a,sourceFormat:e,sourcePreset:e==="tavernai_v2"?"TavernAI / SillyTavern V2/V3":"TavernAI / SillyTavern",unmappedFields:Object.keys(s).length>0?s:void 0,metadata:i},n,t)}function Ur(r,e){return{...it(r,"tavernai_v2",e),sourceFormat:"chubai",sourcePreset:"Chub AI"}}function Br(r,e,t){if(!k(r))throw new Error("Invalid character data: expected JSON object");const n=bn(r),a=JSON.stringify(r,null,2),s=yr(n),o=typeof n.name=="string"&&n.name.trim()?n.name.trim():typeof n.character_name=="string"&&n.character_name.trim()?n.character_name.trim():e?.replace(/\.[^.]+$/,"")||"Imported Character";return vn({name:o,assets:{character_sheet:a,...s.assets},sourceFormat:"unknown",metadata:{character_name:o}},n,t)}function Le(r,e){const n=r.match(/^name:\s*(.+)$/m)?.[1]?.trim()||e?.replace(/\.[^.]+$/,"")||"Imported Character";return{name:n,assets:{character_sheet:r},sourceFormat:"plain_text",metadata:{character_name:n}}}function Ls(r){try{const e=JSON.parse(r);return k(e)?e:null}catch{return null}}function Ps(r){try{return JSON.parse(r)}catch{return null}}function $s(r,e,t){if(r instanceof ArrayBuffer&&r.byteLength>0){const s=ys(r);if(s){const o=Ps(s);if(o&&k(o))try{const i=Fr(o),c=i==="chubai"?Ur(o,t):i!=="unknown"?it(o,i==="tavernai_v2"?"tavernai_v2":"tavernai_v1",t):Br(o,e,t),l={...c.assets};return l.card_image||(l.card_image=ws(new Uint8Array(r))),{...c,assets:l,sourceFormat:"png_card"}}catch{}return Le(s,e)}return Le(`[Binary PNG file: ${e||"unknown"} — no embedded character card found]`,e)}if(typeof r!="string")return Le("[Unsupported data format]",e);const n=r.trim();if(!n)return Le("[Empty file]",e);const a=Ls(n);if(a)try{switch(Fr(a)){case"tavernai_v1":return it(a,"tavernai_v1",t);case"tavernai_v2":return it(a,"tavernai_v2",t);case"chubai":return Ur(a,t);case"unknown":default:return Br(a,e,t)}}catch{}return Le(n,e)}function qc(r){switch(r){case"tavernai_v1":return"TavernAI v1";case"tavernai_v2":return"TavernAI v2 / SillyTavern";case"chubai":return"Chub AI";case"png_card":return"PNG Character Card";case"plain_text":return"Plain Text";case"unknown":default:return"Unknown Format"}}function M(r){return typeof r=="object"&&r!==null}function En(r){if(!(r!=="SFW"&&r!=="NSFW"&&r!=="Platform-Safe"&&r!=="Auto"))return r}function ar(r){if(!Array.isArray(r))return;const e=r.filter(t=>typeof t=="string").map(t=>t.trim()).filter(t=>t.length>0);return e.length>0?e:void 0}function Fs(r,e){if(!Array.isArray(e))return;const t=[],n=new Set;for(const a of e){if(typeof a!="string")continue;const s=a.trim();if(!(!s||s===r||n.has(s))&&(n.add(s),t.push(s),t.length>=mr))break}return t.length>0?t:void 0}function L(r){if(typeof r!="string")return;const e=r.trim();return e.length>0?e:void 0}function Wr(r){return ar(r)}function Ms(r,e){return r?r.includes(e)?r:`${r}

${e}`:e}function te(r){return JSON.parse(JSON.stringify(r))}function Mt(r){return typeof r=="number"&&Number.isFinite(r)?r:void 0}function jt(r){return r===null?null:L(r)}function Re(r){if(!M(r))return;const e={},t=L(r.avatar);t&&(e.avatar=t);const n=L(r.creator);n&&(e.creator=n);const a=L(r.character_version);if(a&&(e.character_version=a),M(r.depth_prompt)){const s=Mt(r.depth_prompt.depth),o=L(r.depth_prompt.prompt)??"";s!==void 0&&(e.depth_prompt={depth:s,prompt:o})}if(M(r.chub)){const s={},o=Mt(r.chub.id);o!==void 0&&(s.id=o);const i=jt(r.chub.preset);i!==void 0&&(s.preset=i);const c=L(r.chub.full_path);c&&(s.full_path=c);const l=jt(r.chub.custom_css);l!==void 0&&(s.custom_css=l);const d=L(r.chub.background_image);if(d&&(s.background_image=d),Array.isArray(r.chub.extensions)&&(s.extensions=te(r.chub.extensions)),r.chub.expressions!==void 0&&(s.expressions=te(r.chub.expressions)),M(r.chub.alt_expressions)&&(s.alt_expressions=te(r.chub.alt_expressions)),Array.isArray(r.chub.related_lorebooks)){const p=r.chub.related_lorebooks.filter(u=>M(u)).map(u=>{const f={},m=Mt(u.id);m!==void 0&&(f.id=m);const h=jt(u.book);h!==void 0&&(f.book=h);const w=L(u.path);w&&(f.path=w);const v=L(u.version);v&&(f.version=v);const y=L(u.commit_ref);return y&&(f.commit_ref=y),f}).filter(u=>Object.keys(u).length>0);p.length>0&&(s.related_lorebooks=p)}Object.keys(s).length>0&&(e.chub=s)}return Object.keys(e).length>0?e:void 0}function Sn(r,e){if(!r&&!e)return;const t={},n=r?te(r):void 0,a=e?te(e):void 0,s=a?.avatar??n?.avatar;s&&(t.avatar=s);const o=a?.creator??n?.creator;o&&(t.creator=o);const i=a?.character_version??n?.character_version;i&&(t.character_version=i);const c=a?.depth_prompt??n?.depth_prompt;c&&(t.depth_prompt=te(c));const l=n?.chub,d=a?.chub;return(l||d)&&(t.chub={...l?te(l):{},...d?te(d):{}}),Object.keys(t).length>0?t:void 0}function Gr(r){return r.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"character"}function An(){return`imported-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}function wr(r,e){const t=M(r)?r:{},n=typeof t.review_id=="string"?t.review_id:typeof t.reviewId=="string"?t.reviewId:"",a=n.trim().length>0?n:An(),s=typeof t.seed=="string"?t.seed:"",o=s.trim().length>0?s:e,i={review_id:a,seed:o,favorite:!!t.favorite};i.mode=En(t.mode),typeof t.model=="string"&&(i.model=t.model),typeof t.created=="string"?i.created=t.created:typeof t.createdAt=="string"&&(i.created=t.createdAt),typeof t.modified=="string"?i.modified=t.modified:typeof t.updatedAt=="string"&&(i.modified=t.updatedAt),Array.isArray(t.tags)&&(i.tags=t.tags.filter(f=>typeof f=="string")),typeof t.genre=="string"&&(i.genre=t.genre),typeof t.notes=="string"&&(i.notes=t.notes),typeof t.custom_instructions=="string"?i.custom_instructions=t.custom_instructions:typeof t.customInstructions=="string"&&(i.custom_instructions=t.customInstructions);const c=ar(t.component_send_order)??ar(t.componentSendOrder);c&&(i.component_send_order=c),typeof t.character_name=="string"?i.character_name=t.character_name:typeof t.characterName=="string"&&(i.character_name=t.characterName),typeof t.template_name=="string"?i.template_name=t.template_name:typeof t.templateName=="string"&&(i.template_name=t.templateName);const l=Array.isArray(t.parent_drafts)?t.parent_drafts:Array.isArray(t.parentDraftIds)?t.parentDraftIds:null;l&&(i.parent_drafts=l.filter(f=>typeof f=="string"));const d=Array.isArray(t.connected_drafts)?t.connected_drafts:Array.isArray(t.connectedDraftIds)?t.connectedDraftIds:null,p=Fs(a,d);p&&(i.connected_drafts=p),typeof t.offspring_type=="string"?i.offspring_type=t.offspring_type:typeof t.offspringType=="string"&&(i.offspring_type=t.offspringType);const u=Re(t.card_metadata??t.cardMetadata);return u&&(i.card_metadata=u),i}function Xe(r,e="Imported draft"){if(!M(r)||!M(r.assets))return null;const t={};for(const[s,o]of Object.entries(r.assets))typeof o=="string"&&(t[s]=o);if(Object.keys(t).length===0)return null;const n=wr(M(r.metadata)?r.metadata:r,e),a=typeof r.path=="string"&&r.path.trim().length>0?r.path:typeof r.reviewId=="string"&&r.reviewId.trim().length>0?r.reviewId:n.review_id;return{metadata:n,assets:t,path:a}}function js(r){if(Array.isArray(r))return r.map(t=>Xe(t)).filter(t=>t!==null);if(!M(r))return[];if(Array.isArray(r.drafts))return r.drafts.map(t=>Xe(t)).filter(t=>t!==null);if(M(r.draft)){const t=Xe(r.draft);return t?[t]:[]}const e=Xe(r);return e?[e]:[]}function Us(r){return Array.isArray(r)?r.length===0:M(r)&&Array.isArray(r.drafts)&&r.drafts.length===0}function Bs(r){return Array.isArray(r)?!0:M(r)?Array.isArray(r.drafts)||M(r.draft)||M(r.assets)||M(r.metadata)||typeof r.reviewId=="string"||typeof r.review_id=="string":!1}function Ws(r){return r.trim().toLowerCase().replace(/\s+/g,"_")}function Gs(r){const t=r.match(/^#\s+(.+)$/m)?.[1]?.trim()||"Imported draft",n=/^##\s+(.+)$/gm,a=[];let s;for(;(s=n.exec(r))!==null;)a.push({title:s[1].trim(),start:s.index,bodyStart:n.lastIndex});if(a.length===0)return[];const o={};let i;for(let l=0;l<a.length;l+=1){const d=a[l],p=a[l+1],f=r.slice(d.bodyStart,p?p.start:r.length).replace(/^\n+/,"").trimEnd().replace(/^\\##/gm,"##");if(!f)continue;if(d.title.trim().toLowerCase()==="metadata"){try{i=JSON.parse(f)}catch{}continue}const m=Ws(d.title);o[m]=f}if(Object.keys(o).length===0)return[];const c=wr(i,t);return[{path:c.review_id,metadata:c,assets:o}]}function zs(r,e,t){const n=An(),a=r.name.trim()||e?.replace(/\.[^.]+$/,"")||"Imported draft",s=e?`Imported from ${e}`:`Imported draft: ${a}`,o=r.sourcePreset||r.sourceFormat,i=Object.keys(r.unmappedFields||{}).length,c=i>0?`Imported from ${o}. Preserved ${i} unmapped field${i===1?"":"s"} in the upload preview.`:`Imported from ${o}.`,l=r.metadata??{},d={review_id:n,seed:L(l.seed)??s,favorite:l.favorite===!0,character_name:L(l.character_name)??a,template_name:L(l.template_name)??t?.name??He.name,notes:Ms(L(l.notes),c)},p=En(l.mode);p&&(d.mode=p);const u=L(l.model);u&&(d.model=u);const f=L(l.created);f&&(d.created=f);const m=L(l.modified);m&&(d.modified=m);const h=Wr(l.tags);h&&(d.tags=h);const w=L(l.genre);w&&(d.genre=w);const v=L(l.custom_instructions);v&&(d.custom_instructions=v);const y=L(l.offspring_type);y&&(d.offspring_type=y);const R=Wr(l.component_send_order);R&&(d.component_send_order=R);const W=Re(l.card_metadata);return W&&(d.card_metadata=W),{path:n,metadata:d,assets:r.assets}}function Hs(r,e,t){const n=$s(r,e,t);return Object.keys(n.assets).length===0?[]:[zs(n,e,t?.template)]}function Ks(r,e,t){const n=r.trim();if(!n)throw new Error("Import file is empty");let a=[],s=!1,o=!1,i;try{i=JSON.parse(n),s=Bs(i),o=Us(i),a=js(i)}catch{a=Gs(r)}return a.length===0&&!o&&(a=Hs(r,e,t)),{drafts:a,recognizedJsonPayload:s,explicitEmptyPayload:o}}function zr(r){return r.replace(/^##/gm,"\\##")}function I(r){if(typeof r!="string")return;const e=r.trim();return e.length>0?e:void 0}function Vs(r){const e=I(r);if(e)return e.startsWith("<START>")?e:`<START>
${e}`}function xe(r){const e=I(r);if(e)try{const t=JSON.parse(e);if(t&&typeof t=="object"&&!Array.isArray(t))return t}catch{}}function Hr(r){const e=I(r);return e?e.startsWith("{{original}}")?e:`{{original}}
${e}`:""}function Ys(r){const e=I(r);if(!e)return[];try{const t=JSON.parse(e);if(Array.isArray(t))return t.filter(n=>typeof n=="string").map(n=>n.trim()).filter(n=>n.length>0)}catch{}return[e]}function Js(r){return Object.fromEntries(Object.entries(r.assets).filter(([e,t])=>e!=="card_image"&&t.trim().length>0))}function qs(r,e){const t=[I(r.assets.card_image),I(e?.avatar),I(r.assets.avatar)];for(const n of t){const a=yn(n);if(a)return a}return null}function Xs(r,e){const t=n=>{const a=n.match(/^lorebook(?:_(\d+))?$/);return a?.[1]?Number(a[1]):1};return t(r)-t(e)}function Qs(r){const e=r.trim();if(!e)return{entries:[]};const t=e.split(`
`);let n,a=0;t[0]?.startsWith("# ")&&(n=t[0].slice(2).trim()||void 0,a=1);const s=t.slice(a).join(`
`).trim(),o=/^##\s+(.+)$/gm,i=[];let c;for(;(c=o.exec(s))!==null;)i.push({title:c[1].trim(),start:c.index,bodyStart:o.lastIndex});const l=i.length>0&&s.slice(0,i[0].start).trim()||void 0;if(i.length===0)return{bookName:n,description:l,entries:[{name:n||"Entry 1",keys:[],secondary_keys:[],content:s,enabled:!0,insertion_order:10,case_sensitive:!1,priority:10,id:1,comment:"",selective:!1,constant:!1,position:"",extensions:{},probability:100,selectiveLogic:0}]};const d=i.map((p,u)=>{const f=i[u+1],h=s.slice(p.bodyStart,f?f.start:s.length).trim().split(`
`),w=h.find(P=>P.startsWith("Keys: ")),v=h.find(P=>P.startsWith("Secondary Keys: ")),y=h.find(P=>P.startsWith("Comment: ")),W=h.filter(P=>!/^Keys: |^Secondary Keys: |^Comment: /i.test(P)).join(`
`).trim(),b=w?w.slice(6).split(",").map(P=>P.trim()).filter(Boolean):[],F=v?v.slice(16).split(",").map(P=>P.trim()).filter(Boolean):[],Nt=y?y.slice(9).trim():"";return{name:p.title||`Entry ${u+1}`,keys:b,secondary_keys:F,content:W,enabled:!0,insertion_order:(u+1)*10,case_sensitive:!1,priority:10,id:u+1,comment:Nt,selective:!1,constant:!1,position:"",extensions:{},probability:100,selectiveLogic:0}}).filter(p=>typeof p.content=="string"&&p.content.trim().length>0);return{bookName:n,description:l,entries:d}}function Zs(r,e){const t=I(r.assets.character_book);if(t){const i=xe(t);if(i)return i}const n=Object.keys(r.assets).filter(i=>/^lorebook(?:_\d+)?$/i.test(i)).sort(Xs);if(n.length===0)return;let a=`${e} lorebook`,s="";const o=[];return n.forEach(i=>{const c=Qs(r.assets[i]);c.bookName&&o.length===0&&(a=c.bookName),c.description&&!s&&(s=c.description),c.entries.forEach(l=>{o.push({...l,id:o.length+1,insertion_order:(o.length+1)*10})})}),{name:a,description:s,scan_depth:2,token_budget:512,recursive_scanning:!1,extensions:{},entries:o}}function Kr(r,e){const t=Re({avatar:r.assets.avatar,creator:r.assets.creator,character_version:r.assets.character_version,depth_prompt:xe(r.assets.depth_prompt),chub:xe(r.assets.chub_extension)}),n=Sn(t,Re(r.metadata.card_metadata)),a=I(r.assets.card_image),s=Js(r),o=I(r.metadata.character_name)??fn(r.assets)??I(r.metadata.seed)??r.metadata.review_id,i=Ys(r.assets.alternate_greetings),c=Zs(r,o),l=n?.creator??I(r.assets.creator)??"Eidolon Simulacra",d=n?.character_version??I(r.assets.character_version)??I(r.metadata.modified)??I(r.metadata.created)??"1.0",p=n?.depth_prompt??xe(r.assets.depth_prompt)??{depth:0,prompt:""},u=c?[{id:-1,book:null,path:"embedded",version:d,commit_ref:d}]:[],f={id:n?.chub?.id??-1,preset:n?.chub?.preset??null,full_path:n?.chub?.full_path??`${Gr(l)}/${Gr(o)}`,custom_css:n?.chub?.custom_css??null,extensions:n?.chub?.extensions??[],expressions:n?.chub?.expressions??null,alt_expressions:n?.chub?.alt_expressions??{},background_image:n?.chub?.background_image??"",related_lorebooks:n?.chub?.related_lorebooks??u},m={format:"eidolon-simulacra/v1",exported_at:new Date().toISOString(),asset_order:Object.keys(s),assets:s};e&&(m.metadata=r.metadata);const h={name:o,description:I(r.assets.character_sheet)??"",personality:I(r.assets.personality)??"",scenario:I(r.assets.scenario)??"",first_mes:I(r.assets.intro_scene)??"",avatar:n?.avatar??a??I(r.assets.avatar)??"",mes_example:Vs(r.assets.mes_example)??"",creator_notes:I(r.assets.creator_notes)??I(r.assets.intro_page)??(e?I(r.metadata.notes)??"":""),system_prompt:Hr(r.assets.system_prompt),post_history_instructions:Hr(r.assets.post_history),alternate_greetings:i,tags:e?r.metadata.tags??[]:[],creator:l,character_version:d,extensions:{chub:f,depth_prompt:p,eidolon:m}};return c&&(h.character_book=c),{spec:"chara_card_v2",spec_version:"2.0",data:h}}function eo(r,e,t=!0){if(e==="text")return{content:Object.entries(r.assets).map(([a,s])=>`## ${a}

${zr(s)}`).join(`

`),contentType:"text/plain",extension:"txt"};if(e==="combined")return{content:[`# ${r.metadata.character_name||r.metadata.seed}`,t?`## Metadata

${JSON.stringify(r.metadata,null,2)}`:"",...Object.entries(r.assets).map(([a,s])=>`## ${a}

${zr(s)}`)].filter(Boolean).join(`

`),contentType:"text/markdown",extension:"md"};if(e==="png"){const n=Re({avatar:r.assets.avatar,creator:r.assets.creator,character_version:r.assets.character_version,depth_prompt:xe(r.assets.depth_prompt),chub:xe(r.assets.chub_extension)}),a=Sn(n,Re(r.metadata.card_metadata)),s=qs(r,a);if(!s)throw new Error("PNG export requires a draft card image. Attach or import a PNG image for this draft first.");return{content:bs(s,JSON.stringify(Kr(r,t))),contentType:"image/png",extension:"png"}}return{content:JSON.stringify(Kr(r,t),null,2),contentType:"application/json",extension:"json"}}function to(r){return JSON.stringify({version:"1.0",exportedAt:new Date().toISOString(),drafts:r},null,2)}function ro(r){const t=r.replace(/\\/g,"/").split("/"),n=[];for(const a of t)if(!(!a||a===".")){if(a===".."){n.length>0&&n.pop();continue}n.push(a)}return n.join("/")}function Vr(r){return ro(r.replace(/^\/+/,""))}function Tn(r,e){const t=Vr(e);return t.startsWith("blueprints/")||!r?t:Vr(`${r}/${t}`)}function no(r){return r.startsWith("blueprints/system/")?"system":r.startsWith("blueprints/examples/")?"example":r.startsWith("blueprints/templates/")?"template":"core"}function fe(r){return r.trim().replace(/^"|"$/g,"")}function Ut(r){const e=[],t=/"([^"]*)"/g;let n=t.exec(r);for(;n;)e.push(n[1]),n=t.exec(r);return e}function St(r){return r.blueprint_file??`${r.name}.md`}function Yr(r,e={}){const t={name:r.name,version:r.version,description:r.description,assets:r.assets.map(n=>({...n,depends_on:[...n.depends_on??[]]})),is_official:e.isOfficial??!1};return e.isDefault!==void 0&&(t.is_default=e.isDefault),{template:t,blueprint_contents:{...r.blueprint_contents},...e.templateRoot===void 0?{}:{template_root:e.templateRoot}}}function ao(r){return{...r,template:{...r.template,assets:r.template.assets.map(e=>({...e,depends_on:[...e.depends_on??[]]}))},blueprint_contents:{...r.blueprint_contents}}}function kn(r,e){const t=St(e),n=t.split("/").pop()??t;return r[t]??r[n]??r[e.name]}function br(r,e={}){const t=ao(r),n={};return t.template.assets.forEach(a=>{const s=St(a),o=kn(t.blueprint_contents,a);if(!o?.trim())return;const i=e.resolveBuiltinContent?.(s);typeof i=="string"&&i===o||(n[s]=o)}),Object.entries(t.blueprint_contents).forEach(([a,s])=>{if(!s?.trim()||n[a])return;const o=e.resolveBuiltinContent?.(a);typeof o=="string"&&o===s||(n[a]=s)}),t.blueprint_contents=n,t}function Jr(r,e={}){const t=br(r,e);return t.template.assets.forEach(n=>{const a=St(n),s=Tn(t.template_root,a);if((t.blueprint_contents[a]??t.blueprint_contents[s])?.trim())return;const i=e.resolveBuiltinContent?.(s)??e.resolveBuiltinContent?.(a);i?.trim()&&(t.blueprint_contents[a]=i)}),t}function so(r,e,t={}){const n=r.template.assets.find(i=>i.name===e);if(!n)return;const a=St(n),s=Tn(r.template_root,a),o=r.blueprint_contents[a]??r.blueprint_contents[s]??kn(r.blueprint_contents,n);return o?.trim()?o:t.resolveBuiltinContent?.(s)??t.resolveBuiltinContent?.(a)??void 0}function oo(r){return{core:r.filter(e=>e.category==="core"),system:r.filter(e=>e.category==="system"),templates:{local:r.filter(e=>e.category==="template")},examples:r.filter(e=>e.category==="example")}}function io(r,e){return r.assets.filter(t=>!e(t.name)).map(t=>`Missing blueprint content for ${t.name}`)}function vr(r,e){if(e)return r.find(t=>t.template.name===e)}function co(r,e={}){if(e.name)return vr(r,e.name)?.template;if(e.fallbackToDefault)return r.find(t=>t.template.is_default)?.template??r[0]?.template}function lo(r){const t=r.replace(/\r\n?/g,`
`).split(`
`);let n=null,a=null,s="",o="1.0.0",i="";const c=[];let l=null;for(const p of t){const u=p.trim();if(!u||u.startsWith("#"))continue;if(u==="[template]"){n="template",a=null;continue}if(u==="[[assets]]"){l={name:"",required:!1,depends_on:[],description:""},c.push(l),n="assets",a=null;continue}if(a&&l){if(u==="]"){a=null;continue}const w=Ut(u);a==="depends_on"?l.depends_on.push(...w):l.import_aliases=[...l.import_aliases??[],...w];continue}const f=u.match(/^([A-Za-z0-9_]+)\s*=\s*(.+)$/);if(!f)continue;const[,m,h]=f;if(n==="template"){m==="name"?s=fe(h):m==="version"?o=fe(h):m==="description"&&(i=fe(h));continue}if(!(n!=="assets"||!l))if(m==="name")l.name=fe(h);else if(m==="required")l.required=h.trim()==="true";else if(m==="depends_on"){const w=h.trim();w==="["?a="depends_on":l.depends_on=Ut(w)}else if(m==="import_aliases"){const w=h.trim();w==="["?a="import_aliases":l.import_aliases=Ut(w)}else m==="description"?l.description=fe(h):m==="blueprint_file"&&(l.blueprint_file=fe(h))}const d=c.filter(p=>p.name.trim().length>0);return!s.trim()||d.length===0?null:{name:s,version:o,description:i,is_official:!0,assets:d}}class Er{config;constructor(e){this.config={temperature:.7,maxTokens:4096,timeout:18e4,...e}}async performFetch(e,t){try{return await fetch(e,t)}catch(n){throw this.normalizeRequestError(n)}}async*generateStream(e,t){const n=await this.generate(e,t);yield{content:n.content,done:!0,finishReason:n.finishReason}}getProvider(){return this.config.provider}getModel(){return this.config.model}getApiKey(){return this.config.apiKey}mergeOptions(e){return{temperature:this.config.temperature,maxTokens:this.config.maxTokens,...e}}getFetchOptions(e){const t=new AbortController,n=setTimeout(()=>t.abort(),this.config.timeout);return e?.addEventListener("abort",()=>{clearTimeout(n)}),{signal:e?uo([e,t.signal]):t.signal}}normalizeRequestError(e){return e instanceof Error&&e.name==="AbortError"?new Error("The request timed out or was cancelled. Try again, reduce the request size, or choose a faster model/provider."):e instanceof Error&&/operation was aborted/i.test(e.message)?new Error("The request timed out or was cancelled. Try again, reduce the request size, or choose a faster model/provider."):e instanceof Error?e:new Error("Request failed")}}function uo(r){const e=new AbortController;for(const t of r){if(t.aborted){e.abort();break}t.addEventListener("abort",()=>e.abort(),{once:!0})}return e.signal}class po extends Er{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||this.getDefaultBaseUrl()}getDefaultBaseUrl(){switch(this.config.provider){case"openai":return"https://api.openai.com/v1";case"openrouter":return"https://openrouter.ai/api/v1";case"deepseek":return"https://api.deepseek.com";case"zai":return"https://open.bigmodel.cn/api/paas/v4";case"moonshot":return"https://api.moonshot.cn/v1";default:return"https://api.openai.com/v1"}}getHeaders(){return this.config.baseUrl&&this.config.proxyKey?{"Content-Type":"application/json",Authorization:`Bearer ${this.config.proxyKey}`}:this.config.provider==="ollama"?{"Content-Type":"application/json"}:ht(this.config.provider,this.config.apiKey,{contentType:"application/json"})}getStreamingHeaders(){return{...this.getHeaders(),Accept:"text/event-stream"}}isDisplayContentRecord(e){const t=typeof e.type=="string"?e.type:void 0;return t?t==="text"||t==="text_delta"||t==="output_text"||t==="output_text_delta":!0}extractTextValue(e){if(typeof e=="string")return e;if(Array.isArray(e))return e.map(t=>this.extractTextValue(t)).join("");if(e&&typeof e=="object"){const t=e;if(!this.isDisplayContentRecord(t))return"";if(typeof t.text=="string")return t.text;if(t.text&&typeof t.text=="object"){const n=t.text;if(typeof n.value=="string")return n.value}if(typeof t.value=="string")return t.value;if(Array.isArray(t.parts))return this.extractTextValue(t.parts);if(typeof t.output_text=="string")return t.output_text;if(Array.isArray(t.output_text))return this.extractTextValue(t.output_text);if(typeof t.content=="string")return t.content;if(Array.isArray(t.content))return this.extractTextValue(t.content);if(typeof t.output=="string")return t.output;if(Array.isArray(t.output))return this.extractTextValue(t.output)}return""}extractChoiceMessageContent(e,t){return this.extractTextValue(e?.message?.content??e?.message?.output_text??e?.message?.parts??e?.text??t?.output_text)}extractChoiceDeltaContent(e){return this.extractTextValue(e?.delta?.content??e?.delta?.output_text??e?.delta?.parts??e?.text)}buildNoContentError(e,t){const n=t?.error;if(typeof n=="string"&&n.trim())return n;if(n&&typeof n=="object"&&typeof n.message=="string"&&n.message.trim())return n.message;const a=e?.error;if(typeof a=="string"&&a.trim())return a;if(a&&typeof a=="object"&&typeof a.message=="string"&&a.message.trim())return a.message;const s=this.extractTextValue(e?.message?.refusal??e?.delta?.refusal);if(s.trim())return s.trim();if([...Array.isArray(e?.message?.tool_calls)?e.message.tool_calls:[],...Array.isArray(e?.delta?.tool_calls)?e.delta.tool_calls:[]].length>0)return"Model returned tool calls instead of displayable text. Choose a different model or provider for plain-text responses.";switch(e?.finish_reason){case"length":return"Model exhausted its output budget before producing visible text. Increase max tokens or choose a different model.";case"content_filter":return"Provider blocked the response with content filtering.";case"error":return"Provider returned an error before producing visible text.";default:return"Provider returned no displayable text. Try a different model or increase max tokens."}}isDirectBrowserOpenAIRequest(){if(typeof window>"u"||this.config.provider!=="openai")return!1;try{return new URL(this.baseUrl).hostname==="api.openai.com"}catch{return this.baseUrl.includes("api.openai.com")}}assertBrowserSupported(){if(this.isDirectBrowserOpenAIRequest())throw new Error("Direct OpenAI requests from the browser are blocked by CORS. Use OpenRouter, or configure a custom base URL that points to your own proxy or relay.")}formatMessages(e){return e.map(t=>({role:t.role,content:t.content}))}async generate(e,t){this.assertBrowserSupported();const n=this.mergeOptions(t),a=await this.performFetch(`${this.baseUrl}/chat/completions`,{...this.getFetchOptions(t?.signal),method:"POST",headers:this.getHeaders(),body:JSON.stringify({model:this.config.model,messages:this.formatMessages(e),temperature:n.temperature,max_tokens:n.maxTokens,top_p:n.topP,frequency_penalty:n.frequencyPenalty,presence_penalty:n.presencePenalty})});if(!a.ok){const c=await this.parseError(a);throw new Error(c)}const s=await a.json(),o=s.choices[0],i=this.extractChoiceMessageContent(o,s).trim();if(!i)throw new Error(this.buildNoContentError(o,s));return{content:i,finishReason:o.finish_reason,usage:s.usage?{promptTokens:s.usage.prompt_tokens,completionTokens:s.usage.completion_tokens,totalTokens:s.usage.total_tokens}:void 0}}async*generateStream(e,t){this.assertBrowserSupported();const n=this.mergeOptions(t),a=await this.performFetch(`${this.baseUrl}/chat/completions`,{...this.getFetchOptions(t?.signal),method:"POST",headers:this.getStreamingHeaders(),body:JSON.stringify({model:this.config.model,messages:this.formatMessages(e),temperature:n.temperature,max_tokens:n.maxTokens,top_p:n.topP,frequency_penalty:n.frequencyPenalty,presence_penalty:n.presencePenalty,stream:!0})});if(!a.ok){const c=await this.parseError(a);throw new Error(c)}const s=a.body?.getReader();if(!s)throw new Error("No response body");const o=new TextDecoder;let i="";try{for(;;){const{done:c,value:l}=await s.read();if(c)break;i+=o.decode(l,{stream:!0});const d=i.split(`
`);i=d.pop()||"";for(const p of d){const u=p.trim();if(!(!u||u==="data: [DONE]")&&u.startsWith("data: "))try{const f=u.slice(6),h=JSON.parse(f).choices[0];if(!h)continue;const w=this.extractChoiceDeltaContent(h);w&&(yield{content:w,done:!1}),h.finish_reason&&(yield{content:"",done:!0,finishReason:h.finish_reason})}catch{}}}}finally{s.releaseLock()}}async testConnection(){try{this.assertBrowserSupported()}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unsupported browser provider configuration"}}const e=performance.now();try{const t=await this.performFetch(`${this.baseUrl}/models`,{...this.getFetchOptions(),method:"GET",headers:this.getHeaders()}),n=performance.now()-e;if(!t.ok)return{success:!1,latency_ms:n,error:await this.parseError(t)};try{return(await t.json()).data,{success:!0,latency_ms:n,model_info:{name:this.config.model,context_length:void 0}}}catch{return{success:!0,latency_ms:n}}}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}async parseError(e){try{return(await e.json()).error?.message||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}const fo={system:"user",user:"user",assistant:"model"};class mo extends Er{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||"https://generativelanguage.googleapis.com/v1beta"}getHeaders(){return ht("google",this.config.apiKey,{contentType:"application/json"})}formatMessages(e){const t=[];let n="";for(const a of e)a.role==="system"?n=a.content:t.push({role:fo[a.role]||a.role,parts:[{text:a.content}]});return n&&t.length>0?t[0].parts[0].text=n+`

`+t[0].parts[0].text:n&&t.unshift({role:"user",parts:[{text:n}]}),t}extractCandidateText(e){return e?.content?.parts?e.content.parts.filter(t=>t.thought!==!0).map(t=>t.text||"").join(""):""}buildNoContentError(e,t){const n=e.promptFeedback?.blockReason?.trim(),a=e.promptFeedback?.blockReasonMessage?.trim();if(n)return a?`Gemini blocked the prompt (${n}): ${a}`:`Gemini blocked the prompt (${n}).`;switch(t?.finishReason){case"MAX_TOKENS":return"Gemini exhausted its output budget before producing visible text. Increase max tokens or choose a different model.";case"SAFETY":return"Gemini blocked the response with safety filters.";case"RECITATION":return"Gemini blocked the response because it appears too close to copyrighted material.";case"LANGUAGE":return"Gemini rejected the response because of an unsupported language.";case"UNEXPECTED_TOOL_CALL":case"TOO_MANY_TOOL_CALLS":case"MALFORMED_FUNCTION_CALL":return"Gemini returned tool or function-call output instead of plain text.";case"MALFORMED_RESPONSE":return"Gemini returned a malformed response.";default:return t?.finishMessage?.trim()?`Gemini returned no displayable text: ${t.finishMessage.trim()}`:"Gemini returned no displayable text. Try a different model or increase max tokens."}}async callEndpoint(e,t,n){const a=`${this.baseUrl}${e}`;return this.performFetch(a,{...this.getFetchOptions(n),method:"POST",headers:this.getHeaders(),body:JSON.stringify(t)})}async generate(e,t){const n=this.mergeOptions(t),a=`/models/${this.config.model}:generateContent`,s={contents:this.formatMessages(e),generationConfig:{temperature:n.temperature,maxOutputTokens:n.maxTokens,topP:n.topP}},o=await this.callEndpoint(a,s,t?.signal);if(!o.ok){const d=await this.parseError(o);throw new Error(d)}const i=await o.json(),c=i.candidates?.[0],l=this.extractCandidateText(c).trim();if(!l)throw new Error(this.buildNoContentError(i,c));return{content:l,finishReason:c?.finishReason,usage:i.usageMetadata?{promptTokens:i.usageMetadata.promptTokenCount||0,completionTokens:i.usageMetadata.candidatesTokenCount||0,totalTokens:i.usageMetadata.totalTokenCount||0}:void 0}}async*generateStream(e,t){const n=this.mergeOptions(t),a=`/models/${this.config.model}:streamGenerateContent`,s={contents:this.formatMessages(e),generationConfig:{temperature:n.temperature,maxOutputTokens:n.maxTokens,topP:n.topP}},o=await this.callEndpoint(a,s,t?.signal);if(!o.ok){const d=await this.parseError(o);throw new Error(d)}const i=o.body?.getReader();if(!i)throw new Error("No response body");const c=new TextDecoder;let l="";try{for(;;){const{done:d,value:p}=await i.read();if(d)break;l+=c.decode(p,{stream:!0});const u=l.split(`
`);l=u.pop()||"";for(const f of u){const m=f.trim();if(!(!m||!m.startsWith("data: ")))try{const h=m.slice(6),v=JSON.parse(h).candidates?.[0];if(!v)continue;const y=this.extractCandidateText(v);y&&(yield{content:y,done:!1}),v.finishReason&&(yield{content:"",done:!0,finishReason:v.finishReason})}catch{}}}}finally{i.releaseLock()}}async testConnection(){const e=performance.now();try{const t=`/models/${this.config.model}:generateContent`,n={contents:[{role:"user",parts:[{text:"test"}]}],generationConfig:{maxOutputTokens:1}},a=await this.callEndpoint(t,n),s=performance.now()-e;return a.ok?{success:!0,latency_ms:s,model_info:{name:this.config.model}}:{success:!1,latency_ms:s,error:await this.parseError(a)}}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}async parseError(e){try{const t=await e.json();return t.error?.message||t.error?.status||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}class ho extends Er{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||"https://api.anthropic.com"}getHeaders(){return ht("anthropic",this.config.apiKey,{contentType:"application/json"})}formatMessages(e){const t=[];for(const n of e)n.role!=="system"&&t.push({role:n.role==="assistant"?"assistant":"user",content:n.content});return t}getSystemPrompt(e){return e.find(n=>n.role==="system")?.content}extractResponseText(e){return e.filter(t=>t.type==="text"&&typeof t.text=="string").map(t=>t.text).join("")}async generate(e,t){const n=this.mergeOptions(t),a=this.getSystemPrompt(e),s=this.formatMessages(e),o={model:this.config.model,messages:s,max_tokens:n.maxTokens||4096,temperature:n.temperature};a&&(o.system=a),n.topP!==void 0&&(o.top_p=n.topP);const i=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(t?.signal),method:"POST",headers:this.getHeaders(),body:JSON.stringify(o)});if(!i.ok){const d=await this.parseError(i);throw new Error(d)}const c=await i.json(),l=this.extractResponseText(c.content);if(!l)throw new Error("No text content in response");return{content:l,finishReason:c.stop_reason||void 0,usage:{promptTokens:c.usage.input_tokens,completionTokens:c.usage.output_tokens,totalTokens:c.usage.input_tokens+c.usage.output_tokens}}}async*generateStream(e,t){const n=this.mergeOptions(t),a=this.getSystemPrompt(e),s=this.formatMessages(e),o={model:this.config.model,messages:s,max_tokens:n.maxTokens||4096,temperature:n.temperature,stream:!0};a&&(o.system=a),n.topP!==void 0&&(o.top_p=n.topP);const i=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(t?.signal),method:"POST",headers:ht("anthropic",this.config.apiKey,{contentType:"application/json",accept:"text/event-stream"}),body:JSON.stringify(o)});if(!i.ok){const p=await this.parseError(i);throw new Error(p)}const c=i.body?.getReader();if(!c)throw new Error("No response body");const l=new TextDecoder;let d="";try{for(;;){const{done:p,value:u}=await c.read();if(p)break;d+=l.decode(u,{stream:!0});const f=d.split(`
`);d=f.pop()||"";for(const m of f){const h=m.trim();if(!(!h||!h.startsWith("data: ")))try{const w=h.slice(6),v=JSON.parse(w);v.type==="content_block_delta"&&v.delta?.type==="text_delta"&&v.delta?.text&&(yield{content:v.delta.text,done:!1}),v.type==="message_delta"&&v.delta?.stop_reason&&(yield{content:"",done:!0,finishReason:v.delta.stop_reason}),v.type==="message_stop"&&(yield{content:"",done:!0})}catch{}}}}finally{c.releaseLock()}}async testConnection(){const e=performance.now();try{const t=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(),method:"POST",headers:this.getHeaders(),body:JSON.stringify({model:this.config.model,messages:[{role:"user",content:"Hi"}],max_tokens:1})}),n=performance.now()-e;return t.ok?{success:!0,latency_ms:n,model_info:{name:this.config.model}}:{success:!1,latency_ms:n,error:await this.parseError(t)}}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}async parseError(e){try{return(await e.json()).error?.message||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}const Pe="eidolon.web.config",Qe=["bpui.web.config"],me="eidolon.web.apiKeys",$e=["bpui.web.apiKeys"],Fe="eidolon.web.apiKeys.persist",Ze=["bpui.web.apiKeys.persist"],xn="eidolon:config-changed";let B={};const go={generator:"blueprints/system/generator.md",rpbotgenerator:"blueprints/system/generator.md",seed_generator:"blueprints/system/seed_generator.md",offspring_generator:"blueprints/system/offspring_generator.md",lorebook_generator:"blueprints/system/lorebook_generator.md",worldbook_generator:"blueprints/system/lorebook_generator.md",intro_scene:"blueprints/system/intro_scene.md"},_o=[/^window\.fetch:/i,/cannot convert value in record<bytestring/i,/^bearer\s+window\.fetch:/i];function mt(r){return r.replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[\u200B-\u200D\uFEFF]/g,"").trim().replace(/^['"]+|['"]+$/g,"")}function On(r){return!r||/[^\x20-\x7E]/.test(r)||/\r|\n/.test(r)?!0:_o.some(e=>e.test(r))}function Bt(r){return er(r)}function he(r,e,t){tr(r,e,t)}function et(r){Ue(r)}function ge(){typeof window>"u"||window.dispatchEvent(new Event(xn))}function Q(r){return Object.fromEntries(Object.entries(r).map(([e,t])=>[e,typeof t=="string"?mt(t):t]).filter(([,e])=>typeof e=="string"&&!On(e)).filter(([,e])=>typeof e=="string"&&e.length>0))}function qr(r){return r&&Object.fromEntries(Object.entries(r).map(([e,t])=>typeof t!="string"||t.length===0?[e,t]:[e,go[t]??t]))}let _e=!1;function Wt(){return{first_run_completed:!1,show_inline_tips:!0,completed_guides:[],dismissed_tips:[],completed_tours:[]}}class yo{config;options;constructor(e={}){this.options={persistApiKeys:!1,...e},_e=this.loadPersistPreference(this.options.persistApiKeys||!1),this.config=this.loadConfig(),this.loadPersistedApiKeys()}mergeConfig(e){const t=this.getDefaultConfig();return{...t,...e,batch:{...t.batch,...e.batch??{}},help:e.help?{...t.help,...e.help}:t.help,feature_blueprints:{...t.feature_blueprints,...qr(e.feature_blueprints)??{}}}}loadPersistPreference(e){try{const t=Bt([Fe,...Ze]);if(t&&t.sourceKey!==Fe&&he(Fe,Ze,t.value),t?.value==="true")return!0;if(t?.value==="false")return!1}catch{}return e}savePersistPreference(e){try{he(Fe,Ze,String(e))}catch(t){console.warn("Failed to save API key persistence preference:",t)}}loadConfig(){try{const e=Bt([Pe,...Qe]);if(e){const t=this.mergeConfig(JSON.parse(e.value));return e.sourceKey!==Pe&&he(Pe,Qe,JSON.stringify(t)),t}}catch{}return this.getDefaultConfig()}saveConfig(){try{he(Pe,Qe,JSON.stringify(this.config)),ge()}catch(e){console.warn("Failed to save config to device storage:",e)}}getDefaultConfig(){return{engine:"openai_compatible",engine_mode:"auto",model:"openrouter/openai/gpt-4o-mini",temperature:.7,max_tokens:4096,api_keys:{},batch:{max_concurrent:3,rate_limit_delay:1},help:Wt(),feature_blueprints:{orchestration:"blueprints/system/generator.md",seed_generation:"blueprints/system/seed_generator.md",offspring_generation:"blueprints/system/offspring_generator.md",worldbook_generation:"blueprints/system/lorebook_generator.md",intro_scene_generation:"blueprints/system/intro_scene.md"}}}getConfig(){return this.mergeConfig(this.config)}getHelpState(){return{...this.config.help??Wt(),completed_guides:[...this.config.help?.completed_guides??[]],dismissed_tips:[...this.config.help?.dismissed_tips??[]],completed_tours:[...this.config.help?.completed_tours??[]]}}getApiKeys(){return Q(B)}getApiKey(e){const t=B[e];return typeof t=="string"?mt(t):void 0}setApiKey(e,t){const n=mt(t);n?B[e]=n:delete B[e],this.persistApiKeysIfNeeded(),ge()}setApiKeys(e){B={...Q(B),...Q(e)},this.persistApiKeysIfNeeded(),ge()}replaceApiKeys(e){B=Q(e),this.persistApiKeysIfNeeded(),ge()}clearApiKey(e){delete B[e],this.persistApiKeysIfNeeded(),ge()}clearAllApiKeys(){B={},this.persistApiKeysIfNeeded(),ge()}loadPersistedApiKeys(){if(_e)try{const e=Bt([me,...$e]);if(e){const t=Q(JSON.parse(e.value));B=t,e.sourceKey!==me&&he(me,$e,JSON.stringify(t))}}catch{}}persistApiKeysIfNeeded(){if(_e)try{he(me,$e,JSON.stringify(Q(B)))}catch(e){console.warn("Failed to persist API keys:",e)}}setPersistApiKeys(e){if(_e=e,this.savePersistPreference(e),e)this.persistApiKeysIfNeeded();else try{et([me,...$e])}catch{}}isPersistingApiKeys(){return _e}exportApiKeys(){return JSON.stringify(Q(B),null,2)}importApiKeys(e){try{const t=JSON.parse(e);B=Q(t),this.persistApiKeysIfNeeded()}catch{throw new Error("Invalid API keys JSON")}}updateConfig(e){this.config=this.mergeConfig({...this.config,...e,batch:{...this.config.batch,...e.batch??{}},help:{...this.getHelpState(),...e.help??{}},feature_blueprints:{...this.config.feature_blueprints??{},...qr(e.feature_blueprints)??{}}}),this.saveConfig()}updateHelpState(e){this.updateConfig({help:{...this.getHelpState(),...e}})}resetHelpState(){this.updateConfig({help:Wt()})}resetConfig(){this.config=this.getDefaultConfig(),this.saveConfig()}exportConfig(){const e={config:this.config,version:"1.0",exportedAt:new Date().toISOString()};return JSON.stringify(e,null,2)}importConfig(e){try{const t=JSON.parse(e);t.config&&(this.config=this.mergeConfig(t.config),this.saveConfig())}catch{throw new Error("Invalid configuration JSON")}}clearAll(){this.config=this.getDefaultConfig(),B={},_e=!1;try{et([Pe,...Qe]),et([me,...$e]),et([Fe,...Ze])}catch{}}}const Xc=xn,A=new yo;function wo(r,e,t){if(r==="ollama")return;if(typeof e=="string"&&e.trim().length>0)return e;const n=t?.[r];return typeof n=="string"&&n.trim().length>0?n:Object.values(t??{}).find(a=>typeof a=="string"&&a.trim().length>0)}function Ae(r){const{model:e,apiKey:t,apiKeys:n,provider:a,baseUrl:s,proxyKey:o,temperature:i,maxTokens:c}=r,l=a??hr(e),d={provider:l,model:e,apiKey:wo(l,t,n),baseUrl:s,proxyKey:o,temperature:i,maxTokens:c};switch(l){case"google":return new mo(d);case"anthropic":return new ho(d);case"openai":case"openrouter":case"deepseek":case"zai":case"moonshot":case"ollama":default:return new po(d)}}function ht(r,e,t={}){const n={};t.contentType&&(n["Content-Type"]=t.contentType),t.accept&&(n.Accept=t.accept);const a=typeof e=="string"?mt(e):void 0;if(a){if(On(a))throw new Error("Configured API key is invalid or corrupted. Re-enter it in Settings and try again.");switch(r){case"anthropic":n["x-api-key"]=a,n["anthropic-version"]="2023-06-01";break;case"google":n["x-goog-api-key"]=a;break;default:n.Authorization=`Bearer ${a}`;break}}return r==="openrouter"&&(n["HTTP-Referer"]=typeof window<"u"?window.location.origin:"https://eidolon-simulacra.app",n["X-OpenRouter-Title"]="Eidolon Simulacra"),n}function bo(r){switch(r){case"openai":return"https://api.openai.com/v1";case"google":return"https://generativelanguage.googleapis.com/v1beta";case"openrouter":return"https://openrouter.ai/api/v1";case"anthropic":return"https://api.anthropic.com";case"deepseek":return"https://api.deepseek.com";case"zai":return"https://open.bigmodel.cn/api/paas/v4";case"moonshot":return"https://api.moonshot.cn/v1";case"ollama":return"http://localhost:11434/v1";default:return"https://api.openai.com/v1"}}const vo={openai:["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo","o1-preview"],google:["gemini-2.0-flash-exp","gemini-2.0-flash-thinking-exp","gemini-1.5-pro","gemini-1.5-flash"],openrouter:["anthropic/claude-3.5-sonnet","anthropic/claude-3.5-haiku","google/gemini-pro-1.5","openai/gpt-4o-mini"],anthropic:["claude-3.5-sonnet","claude-3.5-haiku","claude-3-opus"],deepseek:["deepseek-chat","deepseek-coder"],zai:["glm-4","glm-4-flash"],moonshot:["moonshot-v1-8k","moonshot-v1-32k","moonshot-v1-128k"],ollama:["llama3.2","llama3.1","mistral","codellama","qwen2.5","phi3","gemma2"]},sr="eidolon-lore.db",Eo=`sqlite:${sr}`,So="eidolon-lore-sqlite-snapshot.json",Ao="eidolon-simulacra-lore.json";let Gt=null,zt=null;function To(){if(!x())throw new Error("Local lore persistence is only available in the self-contained desktop runtime.")}function Ie(r){return`${r}-${Date.now()}-${Math.random().toString(36).slice(2,10)}`}function z(){return new Date().toISOString()}function Cn(r){if(!r)return{};try{const e=JSON.parse(r);return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}catch{return{}}}async function ko(){return Gt||(Gt=pr(()=>import("./vendor-D-vAdFmu.js").then(r=>r.ba),__vite__mapDeps([0,1]))),Gt}async function O(){return To(),zt||(zt=(async()=>(await ko()).default.load(Eo))()),zt}async function G(r,e,t,n){const a=new Map;if(n.length===0)return a;const s=n.map((i,c)=>`$${c+1}`).join(", "),o=await r.select(`SELECT ${t} AS ownerId, tag, sort_order AS sortOrder FROM ${e} WHERE ${t} IN (${s}) ORDER BY ${t} ASC, sort_order ASC`,n);for(const i of o){const c=a.get(i.ownerId)??[];c.push(i.tag),a.set(i.ownerId,c)}return a}async function U(r,e,t,n,a){await r.execute(`DELETE FROM ${e} WHERE ${t} = $1`,[n]);for(const[s,o]of a.entries())await r.execute(`INSERT INTO ${e} (${t}, tag, sort_order) VALUES ($1, $2, $3)`,[n,o,s])}function Sr(r,e,t){return{id:r.id,userId:"local-desktop",name:r.name,description:r.description||void 0,genre:r.genre||void 0,setting:r.setting||void 0,notes:r.notes||void 0,tags:t??[],isPublic:!1,createdAt:r.createdAt,updatedAt:r.updatedAt,_count:e}}function At(r){return{id:r.id,worldId:r.worldId,draftId:r.draftId||void 0,characterName:r.characterName,role:r.role||void 0,notes:r.notes||void 0,createdAt:r.createdAt,updatedAt:r.updatedAt}}function Tt(r,e){return{id:r.id,worldId:r.worldId,name:r.name,description:r.description||void 0,role:r.role||void 0,notes:r.notes||void 0,tags:e??[],createdAt:r.createdAt,updatedAt:r.updatedAt}}function kt(r,e){return{id:r.id,worldId:r.worldId,name:r.name,description:r.description||void 0,category:r.category||void 0,notes:r.notes||void 0,tags:e??[],createdAt:r.createdAt,updatedAt:r.updatedAt}}function Ar(r,e=0,t){return{id:r.id,worldId:r.worldId,userId:"local-desktop",name:r.name,description:r.description||void 0,startDate:r.startDate||void 0,endDate:r.endDate||void 0,tags:t??[],createdAt:r.createdAt,updatedAt:r.updatedAt,_count:{events:e}}}function xt(r,e){return{id:r.id,timelineId:r.timelineId,title:r.title,description:r.description||void 0,eventDate:r.eventDate||void 0,sortOrder:r.sortOrder,tags:e??[],metadata:Cn(r.metadataJson),createdAt:r.createdAt,updatedAt:r.updatedAt}}async function xo(r){const e=await O(),t=[],n=[];r?.search?.trim()&&(t.push("(name LIKE $1 OR description LIKE $1 OR notes LIKE $1)"),n.push(`%${r.search.trim()}%`)),r?.genre?.trim()&&(t.push(`genre = $${n.length+1}`),n.push(r.genre.trim()));const a=`
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
    ${t.length>0?`WHERE ${t.join(" AND ")}`:""}
    ORDER BY worlds.updated_at DESC
  `,s=await e.select(a,n),o=await G(e,"world_tags","world_id",s.map(i=>i.id));return{worlds:s.map(i=>Sr(i,{characters:Number(i.characterCount??0),timelines:Number(i.timelineCount??0),factions:Number(i.factionCount??0),locations:Number(i.locationCount??0)},o.get(i.id)))}}async function gt(r){const e=await O(),n=(await e.select("SELECT id, name, description, genre, setting, notes, created_at AS createdAt, updated_at AS updatedAt FROM worlds WHERE id = $1 LIMIT 1",[r]))[0];if(!n)throw new Error("World not found");const[a,s,o,i]=await Promise.all([e.select("SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters WHERE world_id = $1 ORDER BY updated_at DESC",[r]),e.select("SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions WHERE world_id = $1 ORDER BY updated_at DESC",[r]),e.select("SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations WHERE world_id = $1 ORDER BY updated_at DESC",[r]),e.select("SELECT id, world_id AS worldId, name, description, start_date AS startDate, end_date AS endDate, created_at AS createdAt, updated_at AS updatedAt FROM timelines WHERE world_id = $1 ORDER BY updated_at DESC",[r])]),[c,l,d,p]=await Promise.all([G(e,"world_tags","world_id",[r]),G(e,"world_faction_tags","faction_id",s.map(f=>f.id)),G(e,"world_location_tags","location_id",o.map(f=>f.id)),G(e,"timeline_tags","timeline_id",i.map(f=>f.id))]),u=new Map;if(i.length>0){const f=i.map((h,w)=>`$${w+1}`).join(", ");(await e.select(`SELECT timeline_id AS timelineId, COUNT(*) AS eventCount FROM timeline_events WHERE timeline_id IN (${f}) GROUP BY timeline_id`,i.map(h=>h.id))).forEach(h=>u.set(h.timelineId,Number(h.eventCount??0)))}return{world:{...Sr(n,{characters:a.length,timelines:i.length,factions:s.length,locations:o.length},c.get(r)),characters:a.map(At),factions:s.map(f=>Tt(f,l.get(f.id))),locations:o.map(f=>kt(f,d.get(f.id))),timelines:i.map(f=>Ar(f,u.get(f.id)??0,p.get(f.id)))}}}async function Oo(r){const e=await O(),t=Ie("world"),n=z();return await e.execute("INSERT INTO worlds (id, name, description, genre, setting, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",[t,r.name.trim(),r.description?.trim()||null,r.genre?.trim()||null,r.setting?.trim()||null,r.notes?.trim()||null,n,n]),await U(e,"world_tags","world_id",t,r.tags??[]),gt(t)}async function Co(r,e){const t=await gt(r),n=typeof e.name=="string"?e.name.trim():t.world.name,a=typeof e.description=="string"?e.description.trim()||null:t.world.description??null,s=typeof e.genre=="string"?e.genre.trim()||null:t.world.genre??null,o=typeof e.setting=="string"?e.setting.trim()||null:t.world.setting??null,i=typeof e.notes=="string"?e.notes.trim()||null:t.world.notes??null,c=Array.isArray(e.tags)?e.tags.filter(d=>typeof d=="string"):t.world.tags,l=await O();return await l.execute("UPDATE worlds SET name = $1, description = $2, genre = $3, setting = $4, notes = $5, updated_at = $6 WHERE id = $7",[n,a,s,o,i,z(),r]),await U(l,"world_tags","world_id",r,c),gt(r)}async function Ro(r){const e=await O(),t=await e.select("SELECT id FROM timelines WHERE world_id = $1",[r]);for(const n of t)await e.execute("DELETE FROM timeline_events WHERE timeline_id = $1",[n.id]);return await e.execute("DELETE FROM timelines WHERE world_id = $1",[r]),await e.execute("DELETE FROM world_characters WHERE world_id = $1",[r]),await e.execute("DELETE FROM world_faction_tags WHERE faction_id IN (SELECT id FROM world_factions WHERE world_id = $1)",[r]),await e.execute("DELETE FROM world_factions WHERE world_id = $1",[r]),await e.execute("DELETE FROM world_location_tags WHERE location_id IN (SELECT id FROM world_locations WHERE world_id = $1)",[r]),await e.execute("DELETE FROM world_locations WHERE world_id = $1",[r]),await e.execute("DELETE FROM world_tags WHERE world_id = $1",[r]),await e.execute("DELETE FROM worlds WHERE id = $1",[r]),{message:"World deleted"}}async function Do(r,e){const t=await O(),n=Ie("char"),a=z();await t.execute("INSERT INTO world_characters (id, world_id, draft_id, character_name, role, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",[n,r,e.draftId??null,e.characterName.trim(),e.role?.trim()||null,e.notes?.trim()||null,a,a]);const s=await t.select("SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters WHERE id = $1 LIMIT 1",[n]);return{character:At(s[0])}}async function Io(r,e,t){const n=await O(),s=(await n.select("SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters WHERE id = $1 AND world_id = $2 LIMIT 1",[e,r]))[0];if(!s)throw new Error("Character not found");const o=typeof t.characterName=="string"?t.characterName.trim():s.characterName,i=typeof t.role=="string"?t.role.trim()||null:s.role??null,c=typeof t.notes=="string"?t.notes.trim()||null:s.notes??null,l=typeof t.draftId=="string"?t.draftId.trim()||null:s.draftId??null;await n.execute("UPDATE world_characters SET draft_id = $1, character_name = $2, role = $3, notes = $4, updated_at = $5 WHERE id = $6 AND world_id = $7",[l,o,i,c,z(),e,r]);const d=await n.select("SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters WHERE id = $1 LIMIT 1",[e]);return{character:At(d[0])}}async function No(r,e){return await(await O()).execute("DELETE FROM world_characters WHERE id = $1 AND world_id = $2",[e,r]),{message:"Character removed"}}async function Lo(r,e){const t=await O(),n=Ie("faction"),a=z();await t.execute("INSERT INTO world_factions (id, world_id, name, description, role, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",[n,r,e.name.trim(),e.description?.trim()||null,e.role?.trim()||null,e.notes?.trim()||null,a,a]),await U(t,"world_faction_tags","faction_id",n,e.tags??[]);const s=await t.select("SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions WHERE id = $1 LIMIT 1",[n]);return{faction:Tt(s[0],e.tags??[])}}async function Po(r,e,t){const n=await O(),s=(await n.select("SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions WHERE id = $1 AND world_id = $2 LIMIT 1",[e,r]))[0];if(!s)throw new Error("Faction not found");const o=typeof t.name=="string"?t.name.trim():s.name,i=typeof t.description=="string"?t.description.trim()||null:s.description??null,c=typeof t.role=="string"?t.role.trim()||null:s.role??null,l=typeof t.notes=="string"?t.notes.trim()||null:s.notes??null,d=Array.isArray(t.tags)?t.tags.filter(u=>typeof u=="string"):[];await n.execute("UPDATE world_factions SET name = $1, description = $2, role = $3, notes = $4, updated_at = $5 WHERE id = $6 AND world_id = $7",[o,i,c,l,z(),e,r]),await U(n,"world_faction_tags","faction_id",e,d);const p=await n.select("SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions WHERE id = $1 LIMIT 1",[e]);return{faction:Tt(p[0],d)}}async function $o(r,e){const t=await O();return await t.execute("DELETE FROM world_faction_tags WHERE faction_id = $1",[e]),await t.execute("DELETE FROM world_factions WHERE id = $1 AND world_id = $2",[e,r]),{message:"Faction removed"}}async function Fo(r,e){const t=await O(),n=Ie("location"),a=z();await t.execute("INSERT INTO world_locations (id, world_id, name, description, category, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",[n,r,e.name.trim(),e.description?.trim()||null,e.category?.trim()||null,e.notes?.trim()||null,a,a]),await U(t,"world_location_tags","location_id",n,e.tags??[]);const s=await t.select("SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations WHERE id = $1 LIMIT 1",[n]);return{location:kt(s[0],e.tags??[])}}async function Mo(r,e,t){const n=await O(),s=(await n.select("SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations WHERE id = $1 AND world_id = $2 LIMIT 1",[e,r]))[0];if(!s)throw new Error("Location not found");const o=typeof t.name=="string"?t.name.trim():s.name,i=typeof t.description=="string"?t.description.trim()||null:s.description??null,c=typeof t.category=="string"?t.category.trim()||null:s.category??null,l=typeof t.notes=="string"?t.notes.trim()||null:s.notes??null,d=Array.isArray(t.tags)?t.tags.filter(u=>typeof u=="string"):[];await n.execute("UPDATE world_locations SET name = $1, description = $2, category = $3, notes = $4, updated_at = $5 WHERE id = $6 AND world_id = $7",[o,i,c,l,z(),e,r]),await U(n,"world_location_tags","location_id",e,d);const p=await n.select("SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations WHERE id = $1 LIMIT 1",[e]);return{location:kt(p[0],d)}}async function jo(r,e){const t=await O();return await t.execute("DELETE FROM world_location_tags WHERE location_id = $1",[e]),await t.execute("DELETE FROM world_locations WHERE id = $1 AND world_id = $2",[e,r]),{message:"Location removed"}}async function Uo(r){const e=await O(),t=Ie("timeline"),n=z();return await e.execute("INSERT INTO timelines (id, world_id, name, description, start_date, end_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",[t,r.worldId,r.name.trim(),r.description?.trim()||null,r.startDate?.trim()||null,r.endDate?.trim()||null,n,n]),await U(e,"timeline_tags","timeline_id",t,r.tags??[]),_t(t)}async function _t(r){const e=await O(),n=(await e.select("SELECT id, world_id AS worldId, name, description, start_date AS startDate, end_date AS endDate, created_at AS createdAt, updated_at AS updatedAt FROM timelines WHERE id = $1 LIMIT 1",[r]))[0];if(!n)throw new Error("Timeline not found");const a=await e.select("SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events WHERE timeline_id = $1 ORDER BY sort_order ASC, created_at ASC",[r]),[s,o]=await Promise.all([G(e,"timeline_tags","timeline_id",[r]),G(e,"timeline_event_tags","event_id",a.map(i=>i.id))]);return{timeline:{...Ar(n,a.length,s.get(r)),events:a.map(i=>xt(i,o.get(i.id)))}}}async function Bo(r,e){const t=await _t(r),n=await O(),a=typeof e.name=="string"?e.name.trim():t.timeline.name,s=typeof e.description=="string"?e.description.trim()||null:t.timeline.description??null,o=typeof e.startDate=="string"?e.startDate.trim()||null:t.timeline.startDate??null,i=typeof e.endDate=="string"?e.endDate.trim()||null:t.timeline.endDate??null,c=Array.isArray(e.tags)?e.tags.filter(l=>typeof l=="string"):t.timeline.tags;return await n.execute("UPDATE timelines SET name = $1, description = $2, start_date = $3, end_date = $4, updated_at = $5 WHERE id = $6",[a,s,o,i,z(),r]),await U(n,"timeline_tags","timeline_id",r,c),_t(r)}async function Wo(r){const e=await O();return await e.execute("DELETE FROM timeline_event_tags WHERE event_id IN (SELECT id FROM timeline_events WHERE timeline_id = $1)",[r]),await e.execute("DELETE FROM timeline_events WHERE timeline_id = $1",[r]),await e.execute("DELETE FROM timeline_tags WHERE timeline_id = $1",[r]),await e.execute("DELETE FROM timelines WHERE id = $1",[r]),{message:"Timeline deleted"}}async function Go(r,e){const t=await O(),n=Ie("event"),a=z(),s=await t.select("SELECT COUNT(*) AS eventCount FROM timeline_events WHERE timeline_id = $1",[r]),o=typeof e.sortOrder=="number"?e.sortOrder:Number(s[0]?.eventCount??0);await t.execute("INSERT INTO timeline_events (id, timeline_id, title, description, event_date, sort_order, metadata_json, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",[n,r,e.title.trim(),e.description?.trim()||null,e.eventDate?.trim()||null,o,JSON.stringify(e.metadata??{}),a,a]),await U(t,"timeline_event_tags","event_id",n,e.tags??[]);const i=await t.select("SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events WHERE id = $1 LIMIT 1",[n]);return{event:xt(i[0],e.tags??[])}}async function zo(r,e,t){const n=await O(),s=(await n.select("SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events WHERE id = $1 AND timeline_id = $2 LIMIT 1",[e,r]))[0];if(!s)throw new Error("Timeline event not found");const o=typeof t.title=="string"?t.title.trim():s.title,i=typeof t.description=="string"?t.description.trim()||null:s.description??null,c=typeof t.eventDate=="string"?t.eventDate.trim()||null:s.eventDate??null,l=typeof t.sortOrder=="number"?t.sortOrder:s.sortOrder,d=Array.isArray(t.tags)?t.tags.filter(f=>typeof f=="string"):[],p=t.metadata&&typeof t.metadata=="object"&&!Array.isArray(t.metadata)?t.metadata:Cn(s.metadataJson);await n.execute("UPDATE timeline_events SET title = $1, description = $2, event_date = $3, sort_order = $4, metadata_json = $5, updated_at = $6 WHERE id = $7 AND timeline_id = $8",[o,i,c,l,JSON.stringify(p),z(),e,r]),await U(n,"timeline_event_tags","event_id",e,d);const u=await n.select("SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events WHERE id = $1 LIMIT 1",[e]);return{event:xt(u[0],d)}}async function Ho(r,e){const t=await O();return await t.execute("DELETE FROM timeline_event_tags WHERE event_id = $1",[e]),await t.execute("DELETE FROM timeline_events WHERE id = $1 AND timeline_id = $2",[e,r]),{message:"Timeline event deleted"}}async function Qc(){const r=await O(),[e,t,n,a,s,o]=await Promise.all([r.select("SELECT COUNT(*) AS count FROM worlds"),r.select("SELECT COUNT(*) AS count FROM world_characters"),r.select("SELECT COUNT(*) AS count FROM world_factions"),r.select("SELECT COUNT(*) AS count FROM world_locations"),r.select("SELECT COUNT(*) AS count FROM timelines"),r.select("SELECT COUNT(*) AS count FROM timeline_events")]);return{backend:"desktop-app-data",fileName:sr,locationLabel:`AppConfig/${sr}`,worldCount:Number(e[0]?.count??0),characterCount:Number(t[0]?.count??0),factionCount:Number(n[0]?.count??0),locationCount:Number(a[0]?.count??0),timelineCount:Number(s[0]?.count??0),eventCount:Number(o[0]?.count??0)}}async function Ko(){const r=await O(),[e,t,n,a,s,o]=await Promise.all([r.select("SELECT id, name, description, genre, setting, notes, created_at AS createdAt, updated_at AS updatedAt FROM worlds ORDER BY updated_at DESC"),r.select("SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters ORDER BY updated_at DESC"),r.select("SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions ORDER BY updated_at DESC"),r.select("SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations ORDER BY updated_at DESC"),r.select("SELECT id, world_id AS worldId, name, description, start_date AS startDate, end_date AS endDate, created_at AS createdAt, updated_at AS updatedAt FROM timelines ORDER BY updated_at DESC"),r.select("SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events ORDER BY updated_at DESC")]),[i,c,l,d,p]=await Promise.all([G(r,"world_tags","world_id",e.map(u=>u.id)),G(r,"world_faction_tags","faction_id",n.map(u=>u.id)),G(r,"world_location_tags","location_id",a.map(u=>u.id)),G(r,"timeline_tags","timeline_id",s.map(u=>u.id)),G(r,"timeline_event_tags","event_id",o.map(u=>u.id))]);return{fileName:So,contents:JSON.stringify({version:1,worlds:e.map(u=>Sr(u,void 0,i.get(u.id))),characters:t.map(At),factions:n.map(u=>Tt(u,c.get(u.id))),locations:a.map(u=>kt(u,l.get(u.id))),timelines:s.map(u=>Ar(u,0,d.get(u.id))),events:o.map(u=>xt(u,p.get(u.id)))},null,2)}}async function Zc(){const r=await Ko(),e=JSON.parse(r.contents);return JSON.stringify({version:"1.0",exportedAt:new Date().toISOString(),...e},null,2)}async function Vo(){const r=await O();await r.execute("DELETE FROM timeline_event_tags"),await r.execute("DELETE FROM timeline_events"),await r.execute("DELETE FROM timeline_tags"),await r.execute("DELETE FROM timelines"),await r.execute("DELETE FROM world_location_tags"),await r.execute("DELETE FROM world_locations"),await r.execute("DELETE FROM world_faction_tags"),await r.execute("DELETE FROM world_factions"),await r.execute("DELETE FROM world_characters"),await r.execute("DELETE FROM world_tags"),await r.execute("DELETE FROM worlds")}async function ed(r,e={}){const t=JSON.parse(r),n=Array.isArray(t.worlds)?t.worlds:[],a=Array.isArray(t.characters)?t.characters:[],s=Array.isArray(t.factions)?t.factions:[],o=Array.isArray(t.locations)?t.locations:[],i=Array.isArray(t.timelines)?t.timelines:[],c=Array.isArray(t.events)?t.events:[],l=await O();await l.execute("BEGIN");try{e.mode==="replace"&&await Vo();for(const d of n)await l.execute("INSERT INTO worlds (id, name, description, genre, setting, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description, genre = excluded.genre, setting = excluded.setting, notes = excluded.notes, updated_at = excluded.updated_at",[d.id,d.name,d.description??null,d.genre??null,d.setting??null,d.notes??null,d.createdAt,d.updatedAt]),await U(l,"world_tags","world_id",d.id,d.tags??[]);for(const d of a)await l.execute("INSERT INTO world_characters (id, world_id, draft_id, character_name, role, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET world_id = excluded.world_id, draft_id = excluded.draft_id, character_name = excluded.character_name, role = excluded.role, notes = excluded.notes, updated_at = excluded.updated_at",[d.id,d.worldId,d.draftId??null,d.characterName,d.role??null,d.notes??null,d.createdAt,d.updatedAt]);for(const d of s)await l.execute("INSERT INTO world_factions (id, world_id, name, description, role, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET world_id = excluded.world_id, name = excluded.name, description = excluded.description, role = excluded.role, notes = excluded.notes, updated_at = excluded.updated_at",[d.id,d.worldId,d.name,d.description??null,d.role??null,d.notes??null,d.createdAt,d.updatedAt]),await U(l,"world_faction_tags","faction_id",d.id,d.tags??[]);for(const d of o)await l.execute("INSERT INTO world_locations (id, world_id, name, description, category, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET world_id = excluded.world_id, name = excluded.name, description = excluded.description, category = excluded.category, notes = excluded.notes, updated_at = excluded.updated_at",[d.id,d.worldId,d.name,d.description??null,d.category??null,d.notes??null,d.createdAt,d.updatedAt]),await U(l,"world_location_tags","location_id",d.id,d.tags??[]);for(const d of i)await l.execute("INSERT INTO timelines (id, world_id, name, description, start_date, end_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET world_id = excluded.world_id, name = excluded.name, description = excluded.description, start_date = excluded.start_date, end_date = excluded.end_date, updated_at = excluded.updated_at",[d.id,d.worldId,d.name,d.description??null,d.startDate??null,d.endDate??null,d.createdAt,d.updatedAt]),await U(l,"timeline_tags","timeline_id",d.id,d.tags??[]);for(const d of c)await l.execute("INSERT INTO timeline_events (id, timeline_id, title, description, event_date, sort_order, metadata_json, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT(id) DO UPDATE SET timeline_id = excluded.timeline_id, title = excluded.title, description = excluded.description, event_date = excluded.event_date, sort_order = excluded.sort_order, metadata_json = excluded.metadata_json, updated_at = excluded.updated_at",[d.id,d.timelineId,d.title,d.description??null,d.eventDate??null,d.sortOrder,JSON.stringify(d.metadata??{}),d.createdAt,d.updatedAt]),await U(l,"timeline_event_tags","event_id",d.id,d.tags??[]);await l.execute("COMMIT")}catch(d){try{await l.execute("ROLLBACK")}catch{}throw d}return{worlds:n.length,timelines:i.length,events:c.length}}function td(){return Ao}const Rn=`# Blueprints\r
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
│   ├── intro_page.md\r
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
5. \`intro_page\`\r
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
- \`generic_intro_page.md\`\r
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
`,Dn=`---\r
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
`,In=`---\r
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
`,Nn=`---\r
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
`,Ln=`---\r
name: Generic Intro Page\r
description: Starter blueprint for a clean Markdown character intro page.\r
invokable: true\r
always: false\r
version: 1.0\r
feature_category: generation\r
---\r
\r
# Intro Page\r
\r
Use this blueprint to produce a single Markdown snippet that can serve as a clean, readable character overview.\r
\r
Hard Rules:\r
\r
- Replace every placeholder with concrete content.\r
- Keep the writing specific to the generated character; do not reuse stock names or examples.\r
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe).\r
- Do not narrate {{user}} thoughts, feelings, actions, dialogue, decisions, or consent.\r
- Output ONLY the finished intro page inside a single markdown code block.\r
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
If any placeholder remains, sections are omitted, or the page turns into prose without headings, it has failed.\r
`,Pn=`---\r
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
`,$n=`---\r
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
`,Fn=`---\r
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
`,Mn=`---\r
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
- Do not regenerate or summarize \`system_prompt\`, \`post_history\`, \`character_sheet\`, \`intro_scene\`, or \`intro_page\`.\r
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
`,jn=`---\r
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
`,Un=`---\r
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
`,Bn=`---\r
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
  Fallback_Asset_Order = [system_prompt, post_history, character_sheet, intro_scene, intro_page, a1111]\r
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
  Downstream_Rule = "Downstream assets translate already-established facts into later views such as scenes, pages, openers, or media prompts"\r
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
  Fallback_Built_In_Order = [system_prompt, post_history, character_sheet, intro_scene, intro_page, a1111]\r
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
`,Wn=`---\r
name: Intro Page\r
description: Generate a character intro page with Markdown.\r
invokable: true\r
always: false\r
version: 3.3\r
feature_category: generation\r
---\r
\r
# Blueprint Agent\r
\r
<intro_page_module>\r
\r
<system_mandate>\r
  Role = "Blueprint Agent"\r
  Task = "Generate a character intro page as a single Markdown snippet from the active character context plus any provided references"\r
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
  Tone_Guardrail = "Do not turn the page into sanitized marketing copy; preserve the character's pressure points, damage, hunger, and friction when the seed implies them"\r
  Output_Constraint = "Output ONLY the finished intro page markdown content with no commentary, explanations, or surrounding code fences"\r
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
</intro_page_module>\r
`,Gn=`---\r
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
`,zn=`---\r
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
Write the lorebook packet that proves those drafts belong to the same world.`,Hn=`---\r
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
`,Kn=`---\r
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
`,Vn=`---\r
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
`,Yn=`---\r
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
`,Yo=`[template]\r
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
name = "intro_page"\r
required = true\r
depends_on = [\r
    "character_sheet",\r
]\r
description = "Visual character introduction page"\r
blueprint_file = "blueprints/system/intro_page.md"\r
\r
[[assets]]\r
name = "a1111"\r
required = true\r
depends_on = [\r
    "character_sheet",\r
]\r
description = "Stable Diffusion image generation prompt"\r
blueprint_file = "blueprints/system/a1111.md"\r
`,Jo="eidolon.web.blueprints.overrides",qo=["bpui.web.blueprints.overrides"],Xo=Object.assign({"../../../../../blueprints/README.md":Rn,"../../../../../blueprints/examples/a1111_sdxl_comfyui.md":Dn,"../../../../../blueprints/examples/generic_character_sheet.md":In,"../../../../../blueprints/examples/generic_initial_message.md":Nn,"../../../../../blueprints/examples/generic_intro_page.md":Ln,"../../../../../blueprints/examples/generic_intro_scene.md":Pn,"../../../../../blueprints/examples/generic_post_history.md":$n,"../../../../../blueprints/examples/generic_system_prompt.md":Fn,"../../../../../blueprints/system/a1111.md":Mn,"../../../../../blueprints/system/a1111_old.md":jn,"../../../../../blueprints/system/character_sheet.md":Un,"../../../../../blueprints/system/generator.md":Bn,"../../../../../blueprints/system/intro_page.md":Wn,"../../../../../blueprints/system/intro_scene.md":Gn,"../../../../../blueprints/system/lorebook_generator.md":zn,"../../../../../blueprints/system/offspring_generator.md":Hn,"../../../../../blueprints/system/post_history.md":Kn,"../../../../../blueprints/system/seed_generator.md":Vn,"../../../../../blueprints/system/system_prompt.md":Yn}),Qo={generator:"system/generator.md",rpbotgenerator:"system/generator.md",seed_generator:"system/seed_generator.md",offspring_generator:"system/offspring_generator.md",lorebook_generator:"system/lorebook_generator.md",worldbook_generator:"system/lorebook_generator.md",system_prompt:"system/system_prompt.md",post_history:"system/post_history.md",character_sheet:"system/character_sheet.md",intro_scene:"system/intro_scene.md",intro_page:"system/intro_page.md",a1111:"system/a1111.md"};function Zo(r){const e=r.replace(/^\/+/,"").replace(/^blueprints\//,"");return e.endsWith(".md")?e:Qo[e]??`${e}.md`}function ei(r){const t=Je([Jo,...qo],{})[r];if(typeof t=="string"&&t.trim().length>0)return t}function ti(r){const e=`../../../../../${r}`;return Xo[e]}const Jn="/blueprints";async function qn(r,e=Jn){const t=Zo(r),n=`blueprints/${t}`,a=`${e}/${t}`,s=ei(n);if(s)return s;const o=ti(n);if(o)return o;try{const i=await fetch(a);if(!i.ok)throw new Error(`Blueprint not found: ${t}`);return await i.text()}catch(i){throw new Error(`Failed to load blueprint '${r}': ${i instanceof Error?i.message:"Unknown error"}`)}}const ri={orchestration:"blueprints/system/generator.md",seed_generation:"blueprints/system/seed_generator.md",offspring_generation:"blueprints/system/offspring_generator.md",worldbook_generation:"blueprints/system/lorebook_generator.md",intro_scene_generation:"blueprints/system/intro_scene.md"};async function Ot(r,e,t=Jn){const a=A.getConfig().feature_blueprints?.[r],s=ri[r],o=e||a||s;if(!o)throw new Error(`No blueprint configured for feature: ${r}`);return qn(o,t)}function Tr(r){const e=r.replace(/\r\n?/g,`
`),t=e.match(/^---\n([\s\S]*?)\n---/);if(!t){const o=e.match(/^#\s+(.+)$/m),i=e.split(`
`).map(c=>c.trim()).find(c=>c.length>0&&!c.startsWith("#")&&!c.startsWith("```"));return{name:o?.[1]?.trim()||"Untitled Blueprint",description:i||"No description",invokable:!1,version:"1.0"}}const n=t[1],a={},s=n.split(`
`);for(const o of s){const i=o.match(/^(\w+):\s*(.+)$/);if(i){const[,c,l]=i;l.toLowerCase()==="true"?a[c]=!0:l.toLowerCase()==="false"?a[c]=!1:a[c]=l.replace(/^['"]|['"]$/g,"")}}return{name:String(a.name||"unknown"),description:String(a.description||""),invokable:!!a.invokable,version:String(a.version||"1.0"),feature_category:a.feature_category}}function Xn(r){return r.assets.map(e=>({name:e.name,required:e.required,dependsOn:e.depends_on,description:e.description,blueprintFile:e.blueprint_file}))}function Qn(r){const e=new Set,t=new Set,n=[],a=s=>{if(e.has(s))return;if(t.has(s))throw new Error(`Circular dependency detected involving ${s}`);t.add(s);const o=r.find(i=>i.name===s);if(o)for(const i of o.dependsOn)a(i);t.delete(s),e.add(s),n.push(s)};for(const s of r)a(s.name);return n}const or="eidolon.web.templates.custom",ir=["bpui.web.templates.custom"],Zn="eidolon.web.blueprints.overrides",ea=["bpui.web.blueprints.overrides"],ta=Object.assign({"../../../../../blueprints/README.md":Rn,"../../../../../blueprints/examples/a1111_sdxl_comfyui.md":Dn,"../../../../../blueprints/examples/generic_character_sheet.md":In,"../../../../../blueprints/examples/generic_initial_message.md":Nn,"../../../../../blueprints/examples/generic_intro_page.md":Ln,"../../../../../blueprints/examples/generic_intro_scene.md":Pn,"../../../../../blueprints/examples/generic_post_history.md":$n,"../../../../../blueprints/examples/generic_system_prompt.md":Fn,"../../../../../blueprints/system/a1111.md":Mn,"../../../../../blueprints/system/a1111_old.md":jn,"../../../../../blueprints/system/character_sheet.md":Un,"../../../../../blueprints/system/generator.md":Bn,"../../../../../blueprints/system/intro_page.md":Wn,"../../../../../blueprints/system/intro_scene.md":Gn,"../../../../../blueprints/system/lorebook_generator.md":zn,"../../../../../blueprints/system/offspring_generator.md":Hn,"../../../../../blueprints/system/post_history.md":Kn,"../../../../../blueprints/system/seed_generator.md":Vn,"../../../../../blueprints/system/system_prompt.md":Yn}),ni=Object.assign({"../../../../../blueprints/templates/official_v2v3/template.toml":Yo});function Ct(r){return typeof r=="object"&&r!==null&&!Array.isArray(r)}function Xr(r){return Ct(r)&&typeof r.name=="string"&&typeof r.version=="string"&&Array.isArray(r.assets)}function Qr(r){return Ct(r)?Object.fromEntries(Object.entries(r).filter(e=>typeof e[1]=="string")):{}}function ai(r){return Ct(r)?Xr(r.template)?{template:r.template,blueprint_contents:Qr(r.blueprint_contents),template_root:typeof r.template_root=="string"?r.template_root:void 0}:Xr(r)?{template:r,blueprint_contents:Qr(r.blueprint_contents),template_root:typeof r.template_root=="string"?r.template_root:void 0}:null:null}function si(r){return(Array.isArray(r)?r:Ct(r)?Object.values(r):[]).map(ai).filter(t=>!!t)}function oi(){const r=Object.entries(ni).map(([n,a])=>{const s=lo(a);if(!s)return null;const i=n.replace(/^.*\/blueprints\//,"blueprints/").replace(/\/template\.toml$/i,"");return{template:s,blueprint_contents:{},template_root:i}}).filter(n=>!!n),e=r.find(n=>n.template_root?.endsWith("/official_v2v3"))?.template_root,t=[{template:{...He,is_default:!0},blueprint_contents:{},template_root:e}];for(const n of r)n.template_root===e||n.template.name===He.name||t.push(n);return t}function ii(r){return r.trim().toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").replace(/_+/g,"_").replace(/^_+|_+$/g,"")}function ra(r,e){return Je(r,e)}function kr(r,e,t){fr(r,e,t)}function ci(){const r=new Map;return Object.entries(ta).forEach(([e,t])=>{const n=e.replace(/^.*\/blueprints\//,"blueprints/");if(n.split("/").pop()?.toLowerCase()==="readme.md")return;const s=Tr(t);r.set(n,{name:s.name,description:s.description,invokable:s.invokable,version:s.version,content:t,path:n,category:no(n),feature_category:s.feature_category})}),r}function q(){return ra([Zn,...ea],{})}function ye(r){kr(Zn,ea,r)}function na(r){return r.startsWith("blueprints/custom/")}function di(r,e){const t=ii(r)||"custom_blueprint",n=ae();let a=`blueprints/custom/${t}.md`,s=2;for(;a!==e&&n.has(a);)a=`blueprints/custom/${t}_${s}.md`,s+=1;return a}function ae(){const r=ci(),e=q();return Object.entries(e).forEach(([t,n])=>{const a=Tr(n),s=r.get(t);r.set(t,{name:a.name,description:a.description,invokable:a.invokable,version:a.version,content:n,path:t,category:s?.category??"core",feature_category:a.feature_category})}),r}function ct(r){const e=`../../../../../${r}`;return ta[e]??null}function li(r){return r in q()}function Ke(r){if(!r)return"";const e=r.replace(/^\.?\//,""),t=e.replace(/\.(txt|md)$/i,"");return[...ae().values()].find(a=>a.path===e||a.path.endsWith(`/${e}`)||a.path.endsWith(`/${t}.md`))?.content??""}function ie(){const r=ra([or,...ir],[]),t=si(r).map(n=>br(n,{resolveBuiltinContent:Ke}));return JSON.stringify(r)!==JSON.stringify(t)&&kr(or,ir,t),t}function tt(r){kr(or,ir,r.map(e=>br(e,{resolveBuiltinContent:Ke})))}function Rt(){return[...oi().map(r=>Jr(r,{resolveBuiltinContent:Ke})),...ie().map(r=>Jr(r,{resolveBuiltinContent:Ke}))]}function Zr(r){return vr(ie(),r)}function Z(r){return vr(Rt(),r)}function H(r){return co(Rt(),{name:r})}function xr(r,e){const t=Z(r);if(t)return so(t,e,{resolveBuiltinContent:Ke})}function Te(r,e){const t=H(e),n=t?gn(t).map(s=>s.name):["character_sheet"];return fn(r,n)??void 0}const Or="EidolonSimulacraDB",cr=["CharacterGeneratorDB"],yt="eidolon-drafts.db",ui=`sqlite:${yt}`,en="eidolon-drafts.json",pi="eidolon-drafts-sqlite-snapshot.json",fi={drafts:"++id, reviewId, [metadata.character_name], createdAt, updatedAt, metadata.favorite, metadata.mode, metadata.genre",assets:"++id, draftId, assetName, createdAt",tags:"++id, tag, draftId"};function aa(r){if(r instanceof Error){const e=r.message?.trim()||r.name||"Unknown storage error";if(r.cause){const t=aa(r.cause);if(t&&t!==e)return`${e} (${t})`}return e}if(typeof r=="string")return r.trim()||"Unknown storage error";if(typeof r=="number"||typeof r=="boolean"||typeof r=="bigint")return String(r);if(r&&typeof r=="object"){const e=r,t=["message","error","reason","details","description"];for(const n of t){const a=e[n];if(typeof a=="string"&&a.trim()){const s=typeof e.code=="string"&&e.code.trim()?` [${e.code.trim()}]`:"";return`${a.trim()}${s}`}}try{const n=JSON.stringify(e);if(n&&n!=="{}")return n}catch{}}return"Unknown storage error"}function tn(r,e){const t=e==="desktop-app-data"?`desktop draft storage (${yt})`:`browser draft storage (${Or})`;return new Error(`${t}: ${aa(r)}`)}function Oe(r){return typeof r=="object"&&r!==null}function rn(){return`imported-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}function dr(r){return typeof r.archived_at=="string"&&r.archived_at.trim().length>0}function j(r,e={}){if(e.includeArchived)return!0;const t=dr(r);return e.archivedOnly?t:!t}function mi(r){if(!(r!=="SFW"&&r!=="NSFW"&&r!=="Platform-Safe"&&r!=="Auto"))return r}function Be(r,e){if(!Array.isArray(e))return;const t=[],n=new Set;for(const a of e){if(typeof a!="string")continue;const s=a.trim();if(!(!s||s===r||n.has(s))&&(n.add(s),t.push(s),t.length>=mr))break}return t.length>0?t:void 0}function hi(r){let e=rn();for(;r.has(e);)e=rn();return e}function N(){return typeof window<"u"&&un()}let Se=null,Me=null,nn=Promise.resolve(),Ht=null,Kt=null,Vt=null;function wt(){return{version:1,migrationChecked:!1,drafts:[],assetActivity:[]}}function gi(r){return r?JSON.parse(JSON.stringify(r)):void 0}function _i(r){if(r)try{const e=JSON.parse(r);return typeof e=="object"&&e!==null?JSON.parse(JSON.stringify(e)):void 0}catch{return}}async function yi(){return Ht||(Ht=pr(()=>import("./vendor-D-vAdFmu.js").then(r=>r.b9),__vite__mapDeps([0,1]))),Ht}async function wi(){return Kt||(Kt=pr(()=>import("./vendor-D-vAdFmu.js").then(r=>r.ba),__vite__mapDeps([0,1]))),Kt}async function bi(r,e,t){(await r.select("PRAGMA table_info(draft_records)")).some(a=>a.name===e)||await r.execute(`ALTER TABLE draft_records ADD COLUMN ${e} ${t}`)}async function vi(r){const e=[`CREATE TABLE IF NOT EXISTS draft_records (
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
    )`,"CREATE INDEX IF NOT EXISTS idx_draft_tags_review_id ON draft_tags(review_id)","CREATE INDEX IF NOT EXISTS idx_draft_component_send_order_review_id ON draft_component_send_order(review_id)","CREATE INDEX IF NOT EXISTS idx_draft_parent_links_review_id ON draft_parent_links(review_id)","CREATE INDEX IF NOT EXISTS idx_draft_connected_links_review_id ON draft_connected_links(review_id)"];for(const t of e)await r.execute(t);await bi(r,"card_metadata_json","TEXT")}async function sa(){if(!N())throw new Error("Local draft persistence is only available in the desktop runtime.");return Vt||(Vt=(async()=>{const e=await(await wi()).default.load(ui);return await vi(e),e})()),Vt}function Ei(r,e){return wr(r,e)}function Si(r,e="Imported draft"){if(!Oe(r)||!Oe(r.assets))return null;const t={};for(const[s,o]of Object.entries(r.assets))typeof o=="string"&&(t[s]=o);if(Object.keys(t).length===0)return null;const n=Ei(Oe(r.metadata)?r.metadata:r,e),a=typeof r.path=="string"&&r.path.trim().length>0?r.path:typeof r.reviewId=="string"&&r.reviewId.trim().length>0?r.reviewId:n.review_id;return{metadata:n,assets:t,path:a}}function oa(r){const e=Si(r,"Stored draft");if(!e||!Oe(r))return null;const t=typeof r.createdAt=="number"?r.createdAt:typeof e.metadata.created=="string"?Date.parse(e.metadata.created):Date.now(),n=typeof r.updatedAt=="number"?r.updatedAt:typeof e.metadata.modified=="string"?Date.parse(e.metadata.modified):t;return{id:typeof r.id=="number"?r.id:void 0,reviewId:e.metadata.review_id,metadata:e.metadata,assets:e.assets,createdAt:Number.isFinite(t)?t:Date.now(),updatedAt:Number.isFinite(n)?n:Date.now()}}function ia(r){if(!Oe(r)||typeof r.draftId!="string"||typeof r.assetName!="string"||typeof r.content!="string")return null;const e=typeof r.createdAt=="number"?r.createdAt:Date.now();return{id:typeof r.id=="number"?r.id:void 0,draftId:r.draftId,assetName:r.assetName,content:r.content,createdAt:Number.isFinite(e)?e:Date.now()}}function We(r){return r.flatMap(e=>Object.entries(e.assets).map(([t,n])=>({draftId:e.reviewId,assetName:t,content:n,createdAt:e.updatedAt})))}function Ai(r){try{const e=JSON.parse(r);if(!Oe(e))return wt();const t=Array.isArray(e.drafts)?e.drafts.map(s=>oa(s)).filter(s=>s!==null):[],n=new Set(t.map(s=>s.reviewId)),a=Array.isArray(e.assetActivity)?e.assetActivity.map(s=>ia(s)).filter(s=>s!==null&&n.has(s.draftId)):[];return{version:1,migrationChecked:e.migrationChecked===!0,drafts:t,assetActivity:a.length>0?a:We(t)}}catch{return wt()}}function Ti(r,e,t,n,a,s){const o={review_id:r.reviewId,seed:r.seed,favorite:r.favorite===1};o.mode=mi(r.mode),typeof r.model=="string"&&r.model.length>0&&(o.model=r.model),typeof r.createdIso=="string"&&r.createdIso.length>0&&(o.created=r.createdIso),typeof r.modifiedIso=="string"&&r.modifiedIso.length>0&&(o.modified=r.modifiedIso),typeof r.genre=="string"&&r.genre.length>0&&(o.genre=r.genre),typeof r.notes=="string"&&r.notes.length>0&&(o.notes=r.notes),typeof r.customInstructions=="string"&&r.customInstructions.length>0&&(o.custom_instructions=r.customInstructions),typeof r.characterName=="string"&&r.characterName.length>0&&(o.character_name=r.characterName),typeof r.templateName=="string"&&r.templateName.length>0&&(o.template_name=r.templateName),typeof r.offspringType=="string"&&r.offspringType.length>0&&(o.offspring_type=r.offspringType);const i=_i(r.cardMetadataJson);i&&(o.card_metadata=i);const c=t;c.length>0&&(o.tags=c);const l=n;l.length>0&&(o.component_send_order=l);const d=a;d.length>0&&(o.parent_drafts=d);const p=Be(r.reviewId,s);return p&&(o.connected_drafts=p),{reviewId:r.reviewId,metadata:o,assets:e,createdAt:r.createdAt,updatedAt:r.updatedAt}}function ki(r){try{return oa({reviewId:r.reviewId,metadata:JSON.parse(r.metadataJson),assets:JSON.parse(r.assetsJson),createdAt:r.createdAt,updatedAt:r.updatedAt})}catch{return null}}function xi(r){return ia({id:r.id,draftId:r.draftId,assetName:r.assetName,content:r.content,createdAt:r.createdAt})}function Yt(r){return{path:r.reviewId,metadata:r.metadata,assets:r.assets}}function rt(r,e={}){return r.filter(t=>j(t.metadata,e))}async function ca(r){const e=await sa();await e.execute("BEGIN");try{await e.execute("DELETE FROM draft_records"),await e.execute("DELETE FROM draft_assets"),await e.execute("DELETE FROM asset_activity"),await e.execute("DELETE FROM draft_tags"),await e.execute("DELETE FROM draft_component_send_order"),await e.execute("DELETE FROM draft_parent_links"),await e.execute("DELETE FROM draft_connected_links");for(const t of r.drafts){await e.execute("INSERT INTO draft_records (review_id, seed, favorite, mode, model, created_iso, modified_iso, genre, notes, custom_instructions, character_name, template_name, offspring_type, card_metadata_json, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)",[t.reviewId,t.metadata.seed,t.metadata.favorite?1:0,t.metadata.mode??null,t.metadata.model??null,t.metadata.created??null,t.metadata.modified??null,t.metadata.genre??null,t.metadata.notes??null,t.metadata.custom_instructions??null,t.metadata.character_name??null,t.metadata.template_name??null,t.metadata.offspring_type??null,t.metadata.card_metadata?JSON.stringify(gi(t.metadata.card_metadata)):null,t.createdAt,t.updatedAt]);for(const[n,a]of(t.metadata.tags??[]).entries())await e.execute("INSERT INTO draft_tags (review_id, tag, sort_order) VALUES ($1, $2, $3)",[t.reviewId,a,n]);for(const[n,a]of(t.metadata.component_send_order??[]).entries())await e.execute("INSERT INTO draft_component_send_order (review_id, asset_name, sort_order) VALUES ($1, $2, $3)",[t.reviewId,a,n]);for(const[n,a]of(t.metadata.parent_drafts??[]).entries())await e.execute("INSERT INTO draft_parent_links (review_id, parent_review_id, sort_order) VALUES ($1, $2, $3)",[t.reviewId,a,n]);for(const[n,a]of(t.metadata.connected_drafts??[]).entries())await e.execute("INSERT INTO draft_connected_links (review_id, connected_review_id, sort_order) VALUES ($1, $2, $3)",[t.reviewId,a,n]);for(const[n,a]of Object.entries(t.assets))await e.execute("INSERT INTO draft_assets (review_id, asset_name, content, updated_at) VALUES ($1, $2, $3, $4)",[t.reviewId,n,a,t.updatedAt])}for(const t of r.assetActivity)await e.execute("INSERT INTO asset_activity (draft_id, asset_name, content, created_at) VALUES ($1, $2, $3, $4)",[t.draftId,t.assetName,t.content,t.createdAt]);await e.execute("INSERT INTO app_meta (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = excluded.value",["desktop_json_migration_checked",r.migrationChecked?"true":"false"]),await e.execute("COMMIT")}catch(t){try{await e.execute("ROLLBACK")}catch{}throw t}}async function Oi(){const r=await sa();let e=wt();try{const s=await r.select("SELECT review_id AS reviewId, seed, favorite, mode, model, created_iso AS createdIso, modified_iso AS modifiedIso, genre, notes, custom_instructions AS customInstructions, character_name AS characterName, template_name AS templateName, offspring_type AS offspringType, card_metadata_json AS cardMetadataJson, created_at AS createdAt, updated_at AS updatedAt FROM draft_records"),o=await r.select("SELECT review_id AS reviewId, asset_name AS assetName, content, updated_at AS updatedAt FROM draft_assets"),i=new Map;for(const b of o){const F=i.get(b.reviewId)??{};F[b.assetName]=b.content,i.set(b.reviewId,F)}const c=await r.select("SELECT review_id AS reviewId, tag, sort_order AS sortOrder FROM draft_tags ORDER BY review_id ASC, sort_order ASC",[]),l=await r.select("SELECT review_id AS reviewId, asset_name AS assetName, sort_order AS sortOrder FROM draft_component_send_order ORDER BY review_id ASC, sort_order ASC",[]),d=await r.select("SELECT review_id AS reviewId, parent_review_id AS relatedReviewId, sort_order AS sortOrder FROM draft_parent_links ORDER BY review_id ASC, sort_order ASC",[]),p=await r.select("SELECT review_id AS reviewId, connected_review_id AS relatedReviewId, sort_order AS sortOrder FROM draft_connected_links ORDER BY review_id ASC, sort_order ASC",[]),u=new Map;for(const b of c){const F=u.get(b.reviewId)??[];F.push(b.tag),u.set(b.reviewId,F)}const f=new Map;for(const b of l){const F=f.get(b.reviewId)??[];F.push(b.assetName),f.set(b.reviewId,F)}const m=new Map;for(const b of d){const F=m.get(b.reviewId)??[];F.push(b.relatedReviewId),m.set(b.reviewId,F)}const h=new Map;for(const b of p){const F=h.get(b.reviewId)??[];F.push(b.relatedReviewId),h.set(b.reviewId,F)}const w=s.map(b=>Ti(b,i.get(b.reviewId)??{},u.get(b.reviewId)??[],f.get(b.reviewId)??[],m.get(b.reviewId)??[],h.get(b.reviewId)??[])),v=new Set(w.map(b=>b.reviewId)),R=(await r.select("SELECT id, draft_id AS draftId, asset_name AS assetName, content, created_at AS createdAt FROM asset_activity ORDER BY created_at DESC")).map(b=>xi(b)).filter(b=>b!==null&&v.has(b.draftId));e={version:1,migrationChecked:(await r.select("SELECT value FROM app_meta WHERE key = $1 LIMIT 1",["desktop_json_migration_checked"]))[0]?.value==="true",drafts:w,assetActivity:R.length>0?R:We(w)}}catch(s){console.warn("Failed to read desktop SQLite draft store:",s)}try{if(e.drafts.length===0){const o=(await r.select("SELECT review_id AS reviewId, metadata_json AS metadataJson, assets_json AS assetsJson, created_at AS createdAt, updated_at AS updatedAt FROM drafts")).map(i=>ki(i)).filter(i=>i!==null);o.length>0&&(e.drafts=o,e.assetActivity=We(o),e.migrationChecked=!1)}}catch(s){console.warn("Failed to read legacy SQLite blob draft rows:",s)}const{exists:t,readTextFile:n,BaseDirectory:a}=await yi();try{if(!e.migrationChecked&&await t(en,{baseDir:a.AppData})){const s=await n(en,{baseDir:a.AppData}),o=Ai(s);o.drafts.length>0&&(e.drafts=o.drafts,e.assetActivity=o.assetActivity.length>0?o.assetActivity:We(o.drafts))}}catch(s){console.warn("Failed to read legacy desktop draft JSON store:",s)}if(!e.migrationChecked){try{await ua();const s=await g.drafts.toArray();if(s.length>0){const o=await g.assets.toArray();e.drafts=s,e.assetActivity=o.length>0?o:We(s)}}catch(s){console.warn("Failed to migrate IndexedDB drafts into desktop app data:",s)}e.migrationChecked=!0;try{await ca(e)}catch(s){console.warn("Failed to persist desktop SQLite draft store after migration:",s)}}Se=e}function Ci(r){const e=nn.then(r,r);return nn=e.then(()=>{},()=>{}),e}async function $(r,e={}){return Ci(async()=>{!Se&&!Me&&(Me=Oi().finally(()=>{Me=null})),Me&&await Me,Se||(Se=wt());const t=await r(Se);return e.persist&&await ca(Se),t})}class da extends se{drafts;assets;tags;constructor(e){super(e),this.version(1).stores(fi)}}async function Ri(){return N()?$(async r=>({backend:"desktop-app-data",fileName:yt,locationLabel:`AppConfig/${yt}`,migrationChecked:r.migrationChecked,draftCount:r.drafts.length,assetActivityCount:r.assetActivity.length})):(await la(),{backend:"indexeddb",fileName:null,locationLabel:Or,migrationChecked:!0,draftCount:await g.drafts.count(),assetActivityCount:await g.assets.count()})}async function Di(){return N()?$(async r=>({fileName:pi,contents:JSON.stringify(r,null,2)})):null}const g=new da(Or);let Ge=null;async function la(){Ge||(Ge=ua()),await Ge}async function ua(){if(!(typeof indexedDB>"u"||await g.drafts.count()>0))for(const e of cr){if(!await se.exists(e))continue;const t=new da(e);try{await t.open();const n=await t.drafts.toArray();if(n.length===0)continue;const a=await t.assets.toArray(),s=await t.tags.toArray();await g.transaction("rw",g.drafts,g.assets,g.tags,async()=>{await g.drafts.bulkPut(n),a.length>0&&await g.assets.bulkPut(a),s.length>0&&await g.tags.bulkPut(s)}),t.close(),await se.delete(e);return}catch(n){console.warn(`Failed to migrate legacy draft database ${e}:`,n)}finally{t.close()}}}class T{static async ensureReady(){await la()}static async saveDraft(e){if(N())try{return await $(async t=>{const n=Date.now(),a=Te(e.assets,e.metadata.template_name),s={...e.metadata,character_name:e.metadata.character_name||a,connected_drafts:Be(e.metadata.review_id,e.metadata.connected_drafts),created:e.metadata.created||new Date(n).toISOString(),modified:e.metadata.modified||new Date(n).toISOString()},o={reviewId:e.metadata.review_id,metadata:s,assets:e.assets,createdAt:s.created?new Date(s.created).getTime():n,updatedAt:s.modified?new Date(s.modified).getTime():n},i=t.drafts.findIndex(c=>c.reviewId===e.metadata.review_id);i>=0?(o.id=t.drafts[i].id,t.drafts[i]=o):t.drafts.push(o),t.assetActivity=t.assetActivity.filter(c=>c.draftId!==e.metadata.review_id),t.assetActivity.push(...Object.entries(e.assets).map(([c,l])=>({draftId:e.metadata.review_id,assetName:c,content:l,createdAt:n})))},{persist:!0})}catch(t){throw console.error("Desktop draft save failed:",t),tn(t,"desktop-app-data")}try{await this.ensureReady();const t=Date.now(),n=Te(e.assets,e.metadata.template_name),a={...e.metadata,character_name:e.metadata.character_name||n,connected_drafts:Be(e.metadata.review_id,e.metadata.connected_drafts),created:e.metadata.created||new Date(t).toISOString(),modified:e.metadata.modified||new Date(t).toISOString()},s={reviewId:e.metadata.review_id,metadata:a,assets:e.assets,createdAt:a.created?new Date(a.created).getTime():t,updatedAt:a.modified?new Date(a.modified).getTime():t},o=await g.drafts.where("reviewId").equals(e.metadata.review_id).first();o&&(s.id=o.id),await g.transaction("rw",g.drafts,g.assets,g.tags,async()=>{await g.drafts.put(s),await g.assets.where("draftId").equals(e.metadata.review_id).delete(),await g.tags.where("draftId").equals(e.metadata.review_id).delete();const i=Object.entries(e.assets).map(([c,l])=>({draftId:e.metadata.review_id,assetName:c,content:l,createdAt:t}));if(await g.assets.bulkAdd(i),e.metadata.tags){const c=e.metadata.tags.map(l=>({tag:l,draftId:e.metadata.review_id,createdAt:t}));await g.tags.bulkAdd(c)}})}catch(t){throw console.error("Browser draft save failed:",t),tn(t,"indexeddb")}}static async getDraft(e){if(N())return $(async n=>{const a=n.drafts.find(s=>s.reviewId===e);return a?Yt(a):null});await this.ensureReady();const t=await g.drafts.where("reviewId").equals(e).first();return t?{path:t.reviewId,metadata:t.metadata,assets:t.assets}:null}static async getAssetActivity(e){return N()?$(async n=>n.assetActivity.filter(a=>a.draftId===e).sort((a,s)=>s.createdAt-a.createdAt)):(await this.ensureReady(),(await g.assets.where("draftId").equals(e).toArray()).sort((n,a)=>a.createdAt-n.createdAt))}static async getAllDrafts(){return N()?$(async t=>rt(t.drafts).map(n=>Yt(n))):(await this.ensureReady(),(await g.drafts.toArray()).filter(t=>j(t.metadata)).map(t=>({path:t.reviewId,metadata:t.metadata,assets:t.assets})))}static async getAllDraftsWithOptions(e={}){return N()?$(async n=>rt(n.drafts,e).map(a=>Yt(a))):(await this.ensureReady(),(await g.drafts.toArray()).filter(n=>j(n.metadata,e)).map(n=>({path:n.reviewId,metadata:n.metadata,assets:n.assets})))}static async getAllMetadata(e={}){return N()?$(async n=>rt(n.drafts,e).map(a=>a.metadata)):(await this.ensureReady(),(await g.drafts.toArray()).filter(n=>j(n.metadata,e)).map(n=>n.metadata))}static async deleteDraft(e){if(N())return $(async t=>{t.drafts=t.drafts.filter(n=>n.reviewId!==e),t.assetActivity=t.assetActivity.filter(n=>n.draftId!==e)},{persist:!0});await this.ensureReady(),await g.transaction("rw",g.drafts,g.assets,g.tags,async()=>{await g.drafts.where("reviewId").equals(e).delete(),await g.assets.where("draftId").equals(e).delete(),await g.tags.where("draftId").equals(e).delete()})}static async updateMetadata(e,t){if(N())return $(async o=>{const i=o.drafts.find(d=>d.reviewId===e);if(!i)throw new Error(`Draft ${e} not found`);const c=Date.now(),l=t.connected_drafts===void 0?void 0:Be(e,t.connected_drafts);i.metadata={...i.metadata,...t,connected_drafts:l??(t.connected_drafts===void 0?i.metadata.connected_drafts:void 0),modified:new Date(c).toISOString()},i.updatedAt=c},{persist:!0});await this.ensureReady();const n=await g.drafts.where("reviewId").equals(e).first();if(!n)throw new Error(`Draft ${e} not found`);const a=Date.now(),s=t.connected_drafts===void 0?void 0:Be(e,t.connected_drafts);if(n.metadata={...n.metadata,...t,connected_drafts:s??(t.connected_drafts===void 0?n.metadata.connected_drafts:void 0),modified:new Date(a).toISOString()},n.updatedAt=a,await g.drafts.put(n),t.tags!==void 0&&(await g.tags.where("draftId").equals(e).delete(),t.tags)){const o=t.tags.map(i=>({tag:i,draftId:e,createdAt:a}));await g.tags.bulkAdd(o)}}static async updateAsset(e,t,n,a={}){if(N())return $(async l=>{const d=l.drafts.find(m=>m.reviewId===e);if(!d)throw new Error(`Draft ${e} not found`);const p=Object.prototype.hasOwnProperty.call(d.assets,t),u=p?d.assets[t]:null;if(p&&a.overwrite===!1)throw new Error(`Asset ${t} already exists. Reload the draft before trying a different action.`);if(a.expectedPreviousContent!==void 0&&u!==a.expectedPreviousContent)throw p?new Error(`Asset ${t} changed since you loaded it. Reload the draft before overwriting it.`):new Error(`Asset ${t} was created after this session started. Reload the draft before saving.`);d.assets[t]=n,d.updatedAt=Date.now(),d.metadata={...d.metadata,modified:new Date(d.updatedAt).toISOString(),character_name:Te(d.assets,d.metadata.template_name)||d.metadata.character_name};const f=l.assetActivity.find(m=>m.draftId===e&&m.assetName===t);return l.assetActivity=l.assetActivity.filter(m=>!(m.draftId===e&&m.assetName===t)),l.assetActivity.push({id:f?.id,draftId:e,assetName:t,content:n,createdAt:d.updatedAt}),p?"updated":"created"},{persist:!0});await this.ensureReady();const s=await g.drafts.where("reviewId").equals(e).first();if(!s)throw new Error(`Draft ${e} not found`);const o=Object.prototype.hasOwnProperty.call(s.assets,t),i=o?s.assets[t]:null;if(o&&a.overwrite===!1)throw new Error(`Asset ${t} already exists. Reload the draft before trying a different action.`);if(a.expectedPreviousContent!==void 0&&i!==a.expectedPreviousContent)throw o?new Error(`Asset ${t} changed since you loaded it. Reload the draft before overwriting it.`):new Error(`Asset ${t} was created after this session started. Reload the draft before saving.`);return s.assets[t]=n,s.updatedAt=Date.now(),s.metadata={...s.metadata,modified:new Date(s.updatedAt).toISOString(),character_name:Te(s.assets,s.metadata.template_name)||s.metadata.character_name},await g.drafts.put(s),await g.assets.where("draftId").equals(e).and(l=>l.assetName===t).modify({content:n,createdAt:s.updatedAt})===0&&await g.assets.add({draftId:e,assetName:t,content:n,createdAt:s.updatedAt}),o?"updated":"created"}static async searchDrafts(e,t={}){if(N())return $(async s=>{const o=e.toLowerCase();return s.drafts.filter(i=>{if(!j(i.metadata,t))return!1;const c=i.metadata.character_name?.toLowerCase()||"",l=i.metadata.seed?.toLowerCase()||"",d=i.metadata.notes?.toLowerCase()||"",p=i.metadata.genre?.toLowerCase()||"";return c.includes(o)||l.includes(o)||d.includes(o)||p.includes(o)}).map(i=>i.metadata)});await this.ensureReady();const n=e.toLowerCase();return(await g.drafts.filter(s=>{if(!j(s.metadata,t))return!1;const o=s.metadata.character_name?.toLowerCase()||"",i=s.metadata.seed?.toLowerCase()||"",c=s.metadata.notes?.toLowerCase()||"",l=s.metadata.genre?.toLowerCase()||"";return o.includes(n)||i.includes(n)||c.includes(n)||l.includes(n)}).toArray()).map(s=>s.metadata)}static async getDraftsByTag(e,t={}){if(N())return $(async o=>o.drafts.filter(i=>j(i.metadata,t)&&i.metadata.tags?.includes(e)).map(i=>i.metadata));await this.ensureReady();const n=await g.tags.where("tag").equals(e).toArray(),a=[...new Set(n.map(o=>o.draftId))];return(await g.drafts.where("reviewId").anyOf(a).toArray()).filter(o=>j(o.metadata,t)).map(o=>o.metadata)}static async getAllTags(){if(N())return $(async n=>[...new Set(n.drafts.flatMap(s=>s.metadata.tags??[]))].sort());await this.ensureReady();const e=await g.tags.toArray();return[...new Set(e.map(n=>n.tag))].sort()}static async getFavorites(e={}){return N()?$(async n=>n.drafts.filter(a=>a.metadata.favorite===!0&&j(a.metadata,e)).map(a=>a.metadata)):(await this.ensureReady(),(await g.drafts.filter(n=>n.metadata.favorite===!0&&j(n.metadata,e)).toArray()).map(n=>n.metadata))}static async getDraftsByMode(e,t={}){return N()?$(async a=>a.drafts.filter(s=>s.metadata.mode===e&&j(s.metadata,t)).map(s=>s.metadata)):(await this.ensureReady(),(await g.drafts.where("metadata.mode").equals(e).toArray()).filter(a=>j(a.metadata,t)).map(a=>a.metadata))}static async getDraftsByGenre(e,t={}){return N()?$(async a=>a.drafts.filter(s=>s.metadata.genre===e&&j(s.metadata,t)).map(s=>s.metadata)):(await this.ensureReady(),(await g.drafts.where("metadata.genre").equals(e).toArray()).filter(a=>j(a.metadata,t)).map(a=>a.metadata))}static async getStats(e={}){if(N())return $(async o=>{const i=o.drafts,c=rt(i,e),l=i.filter(p=>dr(p.metadata)),d={total:c.length,archived:l.length,favorites:c.filter(p=>p.metadata.favorite).length,byMode:{},byGenre:{}};for(const p of c){const u=p.metadata.mode||"unknown",f=p.metadata.genre||"unknown";d.byMode[u]=(d.byMode[u]||0)+1,d.byGenre[f]=(d.byGenre[f]||0)+1}return d});await this.ensureReady();const t=await g.drafts.toArray(),n=t.filter(o=>j(o.metadata,e)),a=t.filter(o=>dr(o.metadata)),s={total:n.length,archived:a.length,favorites:n.filter(o=>o.metadata.favorite).length,byMode:{},byGenre:{}};for(const o of n){const i=o.metadata.mode||"unknown",c=o.metadata.genre||"unknown";s.byMode[i]=(s.byMode[i]||0)+1,s.byGenre[c]=(s.byGenre[c]||0)+1}return s}static async exportAll(){await this.ensureReady();const e=await this.getAllDraftsWithOptions({includeArchived:!0});return to(e)}static async import(e,t={}){await this.ensureReady();const n=t.conflictStrategy??"remap",{drafts:a,recognizedJsonPayload:s,explicitEmptyPayload:o}=Ks(e,t.sourceName,{template:t.template??H()});if(a.length===0){if(s||o)return{imported:0,remapped:0};throw new Error("Invalid draft import format. Supported: exported drafts JSON, combined markdown draft files, or raw text/JSON uploads.")}const i=await this.getAllMetadata({includeArchived:!0}),c=new Set(i.map(u=>u.review_id)),l=new Map;let d=0;const p=a.map(u=>{const f=u.metadata.review_id;let m=f;return n==="remap"&&c.has(m)&&(m=hi(c)),c.add(m),m!==f&&(d+=1,l.set(f,m)),{...u,path:m,metadata:{...u.metadata,review_id:m}}});for(const u of p){const f=u.metadata.parent_drafts?.map(h=>l.get(h)||h),m=u.metadata.connected_drafts?.map(h=>l.get(h)||h);await this.saveDraft({...u,metadata:{...u.metadata,parent_drafts:f,connected_drafts:m}})}return{imported:p.length,remapped:d}}static async clearAll(){if(N()){await $(async e=>{if(e.drafts=[],e.assetActivity=[],e.migrationChecked=!0,typeof indexedDB<"u"){await g.transaction("rw",g.drafts,g.assets,g.tags,async()=>{await g.drafts.clear(),await g.assets.clear(),await g.tags.clear()});for(const t of cr)await se.exists(t)&&await se.delete(t)}},{persist:!0}),Ge=null;return}await g.transaction("rw",g.drafts,g.assets,g.tags,async()=>{await g.drafts.clear(),await g.assets.clear(),await g.tags.clear()});for(const e of cr)await se.exists(e)&&await se.delete(e);Ge=null}}const rd=Object.freeze(Object.defineProperty({__proto__:null,DraftStorage:T,db:g,exportRawDraftStorage:Di,getDraftStorageDiagnostics:Ri},Symbol.toStringTag,{value:"Module"})),nt="server-config",we="server-access-token",Jt="Desktop runtime is self-contained. Server sync is unavailable.",Ii="auth-state-changed";function be(r){return typeof r=="object"&&r!==null}function Ni(r){return r==="SFW"||r==="NSFW"||r==="Platform-Safe"||r==="Auto"?r:void 0}function K(r){if(typeof r!="string")return;const e=r.trim();return e.length>0?e:void 0}function Li(r){if(!Array.isArray(r))return;const e=r.filter(t=>typeof t=="string").map(t=>t.trim()).filter(t=>t.length>0);return e.length>0?e:void 0}function an(r){const e=Object.fromEntries(Object.entries(r.assets).filter(t=>{const[n,a]=t;return typeof n=="string"&&n.length>0&&typeof a=="string"}));return{reviewId:K(r.metadata.review_id)??r.path,seed:K(r.metadata.seed)??r.path,mode:Ni(r.metadata.mode),model:K(r.metadata.model),archivedAt:K(r.metadata.archived_at),characterName:K(r.metadata.character_name),templateName:K(r.metadata.template_name),genre:K(r.metadata.genre),notes:K(r.metadata.notes),favorite:!!r.metadata.favorite,tags:Array.isArray(r.metadata.tags)?r.metadata.tags.filter(t=>typeof t=="string"&&t.trim().length>0):[],offspringType:K(r.metadata.offspring_type),customInstructions:K(r.metadata.custom_instructions),componentSendOrder:Li(r.metadata.component_send_order),parentDraftIds:Array.isArray(r.metadata.parent_drafts)?r.metadata.parent_drafts.filter(t=>typeof t=="string"&&t.trim().length>0):void 0,connectedDraftIds:Array.isArray(r.metadata.connected_drafts)?r.metadata.connected_drafts.filter(t=>typeof t=="string"&&t.trim().length>0):void 0,cardMetadata:r.metadata.card_metadata?JSON.parse(JSON.stringify(r.metadata.card_metadata)):void 0,assets:e}}function Pi(r){return be(r)?Array.isArray(r.drafts)&&r.drafts.every(e=>be(e)&&be(e.metadata)&&be(e.assets))?{drafts:r.drafts.map(an)}:be(r.metadata)&&be(r.assets)?{drafts:[an(r)]}:r:r}class $i{config;accessToken=null;refreshPromise=null;statusPromise=null;cachedStatus=null;statusCacheExpiresAt=0;constructor(){if(this.isSelfContained()){this.config={url:"",enabled:!1},this.accessToken=null,Ue([nt,we]);return}this.config=this.loadConfig(),this.accessToken=er(we)?.value??null}isSelfContained(){return x()}ensureRemoteSyncAvailable(){if(this.isSelfContained())throw new Error(Jt)}loadConfig(){if(this.isSelfContained())return{url:"",enabled:!1};try{const e=er(nt)?.value;if(e)return JSON.parse(e)}catch(e){console.error("Failed to load server config:",e)}return{url:"https://api.eidolonsimulacra.com",enabled:!1}}saveConfig(){this.isSelfContained()||(tr(nt,[],JSON.stringify(this.config)),this.invalidateStatusCache())}getConfig(){return this.isSelfContained()?{url:"",enabled:!1}:{...this.config}}setConfig(e){if(this.isSelfContained()){this.config={url:"",enabled:!1},Ue([nt,we]),this.invalidateStatusCache();return}this.config={...this.config,...e},this.saveConfig()}invalidateStatusCache(){this.cachedStatus=null,this.statusCacheExpiresAt=0}isEnabled(){return this.isSelfContained()?!1:this.config.enabled&&!!this.config.url}hasAccessToken(){return this.isSelfContained()?!1:!!this.accessToken}setAccessToken(e){this.isSelfContained()||(this.accessToken=e,tr(we,[],e),this.invalidateStatusCache())}clearAccessToken(){if(this.isSelfContained()){this.accessToken=null,Ue([we]),this.invalidateStatusCache();return}this.accessToken=null,Ue([we]),this.invalidateStatusCache()}notifyAuthStateChanged(){window.dispatchEvent(new CustomEvent(Ii))}getAccessToken(){return this.accessToken}async refreshAccessToken(){if(this.refreshPromise)return this.refreshPromise;this.refreshPromise=this.doRefreshToken();try{return await this.refreshPromise}finally{this.refreshPromise=null}}async doRefreshToken(){const e=`${this.config.url}/api/auth/refresh`,t=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include"});if(!t.ok)throw this.clearAccessToken(),this.notifyAuthStateChanged(),new Error("Failed to refresh token");const n=await t.json();return this.setAccessToken(n.accessToken),n.accessToken}async request(e,t={},n=!0){this.ensureRemoteSyncAvailable();const a=`${this.config.url}${e}`,s={"Content-Type":"application/json",...t.headers},o=this.getAccessToken();o&&(s.Authorization=`Bearer ${o}`);const i=await fetch(a,{...t,headers:s,credentials:"include"});if(i.status===401&&n&&e!=="/api/auth/refresh"&&e!=="/api/auth/login"&&e!=="/api/auth/register")try{return await this.refreshAccessToken(),this.request(e,t,!1)}catch{throw this.clearAccessToken(),new Error("Authentication expired. Please login again.")}return i}async register(e,t,n){const a=await this.request("/api/auth/register",{method:"POST",body:JSON.stringify({email:e,password:t,displayName:n})});if(!a.ok){const o=await a.json();throw new Error(o.error||"Registration failed")}const s=await a.json();return this.setAccessToken(s.accessToken),this.notifyAuthStateChanged(),s}async login(e,t){const n=await this.request("/api/auth/login",{method:"POST",body:JSON.stringify({email:e,password:t})});if(!n.ok){const s=await n.json();throw new Error(s.error||"Login failed")}const a=await n.json();return this.setAccessToken(a.accessToken),this.notifyAuthStateChanged(),a}async logout(){try{await this.request("/api/auth/logout",{method:"POST"})}catch(e){console.error("Logout request failed:",e)}finally{this.clearAccessToken(),this.notifyAuthStateChanged()}}async getCurrentUser(){const e=await this.request("/api/auth/me");if(!e.ok){if(e.status===401)throw this.clearAccessToken(),new Error("Not authenticated");const n=await e.json();throw new Error(n.error||"Failed to get user")}return(await e.json()).user}async updateProfile(e){const t=await this.request("/api/auth/me",{method:"PATCH",body:JSON.stringify(e)});if(!t.ok){const a=await t.json();throw new Error(a.error||"Failed to update profile")}return(await t.json()).user}async deleteAccount(){const e=await this.request("/api/auth/me",{method:"DELETE"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to delete account")}this.clearAccessToken()}async checkStatus(){if(this.isSelfContained())return{connected:!1,authenticated:!1,error:Jt};if(!this.isEnabled())return{connected:!1,authenticated:!1};const e=Date.now();if(this.cachedStatus&&e<this.statusCacheExpiresAt)return this.cachedStatus;if(this.statusPromise)return this.statusPromise;this.statusPromise=this.computeStatus();try{const t=await this.statusPromise;return this.cachedStatus=t,this.statusCacheExpiresAt=Date.now()+15e3,t}finally{this.statusPromise=null}}isConnectivityError(e){return e instanceof TypeError?!0:e instanceof Error?/failed to fetch|networkerror|network error|load failed/i.test(e.message):!1}async computeStatus(){try{if(this.hasAccessToken())try{return{connected:!0,authenticated:!0,user:await this.getCurrentUser()}}catch(t){return this.isConnectivityError(t)?{connected:!1,authenticated:!1,error:t instanceof Error?t.message:"Unknown error"}:{connected:!0,authenticated:!1,error:t instanceof Error?t.message:"Authentication failed"}}return(await fetch(`${this.config.url}/api/health`,{method:"GET"})).ok?{connected:!0,authenticated:!1}:{connected:!1,authenticated:!1,error:"Server unreachable"}}catch(e){return{connected:!1,authenticated:!1,error:e instanceof Error?e.message:"Unknown error"}}}async syncDrafts(e,t){const n=e==="push",a=n?"/api/sync/drafts/push":"/api/sync/drafts",s=n?Pi(t):t,o=await this.request(a,{method:n?"POST":"GET",body:n?JSON.stringify(s):void 0});if(!o.ok){let i=`Failed to ${e} drafts`,c=null;try{const d=await o.json();if(i=d.error||i,c=d.error||null,d.details){const p=Object.entries(d.details).flatMap(([u,f])=>(f||[]).map(m=>`${u}: ${m}`)).join("; ");p&&(i=`${i} (${p})`)}}catch{}if(e==="pull"&&a!=="/api/sync/drafts"&&(o.status===404||o.status===400&&c==="Validation failed"))try{return await this.listRemoteDrafts()}catch{}throw new Error(i)}return o.json()}async listRemoteDrafts(){const e=await this.request("/api/sync/drafts/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote drafts")}return e.json()}async deleteRemoteDraft(e){const t=await this.request(`/api/sync/drafts/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete remote draft")}return t.json()}async syncThemes(e,t){const n=await this.request(`/api/sync/themes/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const a=await n.json();throw new Error(a.error||`Failed to ${e} themes`)}return n.json()}async listRemoteThemes(){const e=await this.request("/api/sync/themes/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote themes")}return e.json()}async deleteRemoteTheme(e){const t=await this.request(`/api/sync/themes/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete remote theme")}return t.json()}async syncTemplates(e,t){const n=await this.request(`/api/sync/templates/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const a=await n.json();throw new Error(a.error||`Failed to ${e} templates`)}return n.json()}async syncSeeds(e,t){const n=e==="push",a=n?"/api/sync/seeds/push":"/api/sync/seeds",s=await this.request(a,{method:n?"POST":"GET",body:n?JSON.stringify(t):void 0});if(!s.ok){const o=await s.json();throw new Error(o.error||`Failed to ${e} seeds`)}return s.json()}async syncArchivedSeedRuns(e,t){const n=e==="push",a=e==="list"?"/api/sync/seed-runs/list":n?"/api/sync/seed-runs/push":"/api/sync/seed-runs",s=await this.request(a,{method:n?"POST":"GET",body:n?JSON.stringify(t):void 0});if(!s.ok){const o=await s.json();throw new Error(o.error||`Failed to ${e} archived seed runs`)}return s.json()}async listRemoteTemplates(){const e=await this.request("/api/sync/templates/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote templates")}return e.json()}async deleteRemoteTemplate(e){const t=await this.request(`/api/sync/templates/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete remote template")}return t.json()}async pullConfig(){const e=await this.request("/api/sync/config",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to pull config")}return e.json()}async pushConfig(e){const t=await this.request("/api/sync/config",{method:"PUT",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to push config")}return t.json()}async pullApiKeys(){const e=await this.request("/api/sync/config/api-keys",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to pull API keys")}return e.json()}async pushApiKeys(e){const t=await this.request("/api/sync/config/api-keys",{method:"PUT",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to push API keys")}return t.json()}async sync(e,t,n){switch(e){case"drafts":return this.syncDrafts(t,n);case"themes":return this.syncThemes(t,n);case"templates":return this.syncTemplates(t,n);case"seeds":return this.syncSeeds(t,n);case"blueprints":return this.syncBlueprints(t,n);case"worlds":if(t==="list")throw new Error("World sync does not support list");return this.syncWorlds(t,n);case"timelines":if(t==="list")throw new Error("Timeline sync does not support list");return this.syncTimelines(t,n);default:throw new Error(`Unknown data type: ${e}`)}}async syncBlueprints(e,t){const n=await this.request(`/api/sync/blueprints/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const a=await n.json();throw new Error(a.error||`Failed to ${e} blueprints`)}return n.json()}async listRemoteBlueprints(){const e=await this.request("/api/sync/blueprints/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote blueprints")}return e.json()}async deleteRemoteBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete remote blueprint")}return t.json()}async getBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`);if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to get blueprint")}return t.json()}async createBlueprint(e){const t=await this.request("/api/sync/blueprints",{method:"POST",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to create blueprint")}return t.json()}async updateBlueprint(e,t){const n=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`,{method:"PUT",body:JSON.stringify(t)});if(!n.ok){const a=await n.json();throw new Error(a.error||"Failed to update blueprint")}return n.json()}async deleteBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete blueprint")}return t.json()}async duplicateBlueprint(e,t,n){const a=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}/duplicate`,{method:"POST",body:JSON.stringify({newPath:t,newName:n})});if(!a.ok){const s=await a.json();throw new Error(s.error||"Failed to duplicate blueprint")}return a.json()}async resetBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}/reset`,{method:"POST"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to reset blueprint")}return t.json()}async syncWorlds(e,t){const n=await this.request(`/api/sync/worlds/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const a=await n.json();throw new Error(a.error||`Failed to ${e} worlds`)}return n.json()}async getWorlds(e){const t=new URLSearchParams;e?.search&&t.set("search",e.search),e?.genre&&t.set("genre",e.genre),e?.includePublic!==void 0&&t.set("includePublic",String(e.includePublic));const n=await this.request(`/api/sync/worlds?${t.toString()}`);if(!n.ok){const a=await n.json();throw new Error(a.error||"Failed to get worlds")}return n.json()}async getWorld(e){const t=await this.request(`/api/sync/worlds/${e}`);if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to get world")}return t.json()}async createWorld(e){const t=await this.request("/api/sync/worlds",{method:"POST",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to create world")}return t.json()}async updateWorld(e,t){const n=await this.request(`/api/sync/worlds/${e}`,{method:"PUT",body:JSON.stringify(t)});if(!n.ok){const a=await n.json();throw new Error(a.error||"Failed to update world")}return n.json()}async deleteWorld(e){const t=await this.request(`/api/sync/worlds/${e}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete world")}return t.json()}async getWorldCharacters(e){const t=await this.request(`/api/sync/worlds/${e}/characters`);if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to get world characters")}return t.json()}async addWorldCharacter(e,t){const n=await this.request(`/api/sync/worlds/${e}/characters`,{method:"POST",body:JSON.stringify(t)});if(!n.ok){const a=await n.json();throw new Error(a.error||"Failed to add world character")}return n.json()}async updateWorldCharacter(e,t,n){const a=await this.request(`/api/sync/worlds/${e}/characters/${t}`,{method:"PATCH",body:JSON.stringify(n)});if(!a.ok){const s=await a.json();throw new Error(s.error||"Failed to update world character")}return a.json()}async deleteWorldCharacter(e,t){const n=await this.request(`/api/sync/worlds/${e}/characters/${t}`,{method:"DELETE"});if(!n.ok){const a=await n.json();throw new Error(a.error||"Failed to delete world character")}return n.json()}async getWorldFactions(e){const t=await this.request(`/api/sync/worlds/${e}/factions`);if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to get world factions")}return t.json()}async addWorldFaction(e,t){const n=await this.request(`/api/sync/worlds/${e}/factions`,{method:"POST",body:JSON.stringify(t)});if(!n.ok){const a=await n.json();throw new Error(a.error||"Failed to add world faction")}return n.json()}async updateWorldFaction(e,t,n){const a=await this.request(`/api/sync/worlds/${e}/factions/${t}`,{method:"PATCH",body:JSON.stringify(n)});if(!a.ok){const s=await a.json();throw new Error(s.error||"Failed to update world faction")}return a.json()}async deleteWorldFaction(e,t){const n=await this.request(`/api/sync/worlds/${e}/factions/${t}`,{method:"DELETE"});if(!n.ok){const a=await n.json();throw new Error(a.error||"Failed to delete world faction")}return n.json()}async getWorldLocations(e){const t=await this.request(`/api/sync/worlds/${e}/locations`);if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to get world locations")}return t.json()}async addWorldLocation(e,t){const n=await this.request(`/api/sync/worlds/${e}/locations`,{method:"POST",body:JSON.stringify(t)});if(!n.ok){const a=await n.json();throw new Error(a.error||"Failed to add world location")}return n.json()}async updateWorldLocation(e,t,n){const a=await this.request(`/api/sync/worlds/${e}/locations/${t}`,{method:"PATCH",body:JSON.stringify(n)});if(!a.ok){const s=await a.json();throw new Error(s.error||"Failed to update world location")}return a.json()}async deleteWorldLocation(e,t){const n=await this.request(`/api/sync/worlds/${e}/locations/${t}`,{method:"DELETE"});if(!n.ok){const a=await n.json();throw new Error(a.error||"Failed to delete world location")}return n.json()}async syncTimelines(e,t){const n=await this.request(`/api/sync/timelines/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const a=await n.json();throw new Error(a.error||`Failed to ${e} timelines`)}return n.json()}async getTimelines(e){const t=new URLSearchParams;e?.worldId&&t.set("worldId",e.worldId),e?.search&&t.set("search",e.search);const n=await this.request(`/api/sync/timelines?${t.toString()}`);if(!n.ok){const a=await n.json();throw new Error(a.error||"Failed to get timelines")}return n.json()}async getTimeline(e){const t=await this.request(`/api/sync/timelines/${e}`);if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to get timeline")}return t.json()}async createTimeline(e){const t=await this.request("/api/sync/timelines",{method:"POST",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to create timeline")}return t.json()}async updateTimeline(e,t){const n=await this.request(`/api/sync/timelines/${e}`,{method:"PUT",body:JSON.stringify(t)});if(!n.ok){const a=await n.json();throw new Error(a.error||"Failed to update timeline")}return n.json()}async deleteTimeline(e){const t=await this.request(`/api/sync/timelines/${e}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete timeline")}return t.json()}async addTimelineEvent(e,t){const n=await this.request(`/api/sync/timelines/${e}/events`,{method:"POST",body:JSON.stringify(t)});if(!n.ok){const a=await n.json();throw new Error(a.error||"Failed to add event")}return n.json()}async updateTimelineEvent(e,t,n){const a=await this.request(`/api/sync/timelines/${e}/events/${t}`,{method:"PATCH",body:JSON.stringify(n)});if(!a.ok){const s=await a.json();throw new Error(s.error||"Failed to update event")}return a.json()}async deleteTimelineEvent(e,t){const n=await this.request(`/api/sync/timelines/${e}/events/${t}`,{method:"DELETE"});if(!n.ok){const a=await n.json();throw new Error(a.error||"Failed to delete event")}return n.json()}async testConnection(e){if(this.isSelfContained())return{success:!1,message:Jt};try{const t=await fetch(`${e}/api/health`,{method:"GET",signal:AbortSignal.timeout(5e3)});return t.ok?{success:!0,message:"Connection successful"}:{success:!1,message:`Server returned ${t.status}`}}catch(t){return{success:!1,message:t instanceof Error?t.message:"Connection failed"}}}}const _=new $i,pa="eidolon.web.seedGenerator.history",fa=["bpui.web.seedGenerator.history"],ma="eidolon.web.seedGenerator.favorites",ha=["bpui.web.seedGenerator.favorites"],ga="eidolon.web.seedGenerator.favorites.syncState",_a="eidolon.web.seedGenerator.archivedSeedRuns.syncState",ya=12,Fi=12,wa="blended",Mi="seed-favorites-changed",ji="seed-history-changed";function Dt(r,e){return Je(r,e)}function It(r,e,t){fr(r,e,t)}function Ui(r){typeof window>"u"||window.dispatchEvent(new CustomEvent(Mi,{detail:{count:r.length}}))}function Bi(r){typeof window>"u"||window.dispatchEvent(new CustomEvent(ji,{detail:{count:r.filter(e=>!e.archivedAt).length}}))}function ze(r){if(typeof r!="string")return;const e=new Date(r);return Number.isNaN(e.getTime())?void 0:e.toISOString()}function Wi(r){if(typeof r!="object"||r===null)return null;const e=r,t=typeof e.seed=="string"?e.seed.trim():"";if(!t)return null;const n=ze(e.addedAt)??new Date().toISOString(),a=ze(e.lastUsedAt),s=ze(e.archivedAt),o={seed:t,addedAt:n};return a&&(o.lastUsedAt=a),s&&(o.archivedAt=s),o}function ba(r,e){const t=Date.parse(r.lastUsedAt??r.addedAt);return Date.parse(e.lastUsedAt??e.addedAt)-t}function va(r,e){const t=Date.parse(r.archivedAt??r.lastUsedAt??r.addedAt);return Date.parse(e.archivedAt??e.lastUsedAt??e.addedAt)-t}function bt(r){const e=new Map;for(const t of r){const n=Wi(t);n&&e.set(n.seed,n)}return Array.from(e.values()).sort((t,n)=>t.archivedAt||n.archivedAt?va(t,n):ba(t,n))}function Cr(){return Dt(ga,{})}function Ea(r){It(ga,[],r)}function Rr(){return Dt(_a,{})}function Sa(r){It(_a,[],r)}function X(){const r=Dt([ma,...ha],[]);return bt(r)}function Aa(r){return[...r].filter(e=>!e.archivedAt).sort(ba)}function Gi(r){return[...r].filter(e=>!!e.archivedAt).sort(va)}function le(r,e={}){const{markChanged:t=!0,markSynced:n=!1,timestamp:a=new Date().toISOString()}=e,s=bt(r);It(ma,ha,s);const o=Cr();return t&&(o.lastChangedAt=a),n&&(o.lastSyncedAt=a),Ea(o),Ui(Aa(s)),s}const lr=[{id:"noir-romance",label:"Noir Pressure",genreLines:`noir:debt, surveillance, intimacy, slow-burn
romance:realism, asymmetry, messy loyalty, after-hours`},{id:"grounded-sf",label:"Grounded Sci-Fi",genreLines:`sci-fi:grounded, labor, proximity, bureaucracy
romance:subtext, contracts, withheld tenderness`},{id:"low-magic",label:"Low Magic",genreLines:`fantasy:low-magic, domestic, obligation, village politics
romance:restraint, longing, practical intimacy`},{id:"urban-horror",label:"Urban Horror",genreLines:`horror:grounded, neighborhood, debt, body unease
thriller:secrecy, leverage, false safety`},{id:"moreau",label:"Moreau",genreLines:`romance:moreau, realism, stigma, protective tension
urban fantasy:morphosis, nightlife, consent ethic, social friction`}];function zi(r){return r.replace(/^```+/,"").replace(/```+$/,"").trim()}function Hi(r){return zi(r).replace(/^[-*•]\s+/,"").replace(/^\d+[.)]\s+/,"").replace(/^seed\s*:\s*/i,"").trim()}function nd(){return lr}function Ki(){return lr[Math.floor(Math.random()*lr.length)]}function Vi(r){return Math.min(30,Math.max(5,Math.round(r||Fi)))}function ad(r,e){const t=r.split(`
`).map(a=>a.trim()).filter(Boolean);return[...[`count=${Vi(e.count)}`,wa],...t].join(`
`)}function Yi(r){const e=r.genre_lines.split(`
`).map(t=>t.trim()).filter(Boolean).join(`
`);if(r.surprise_mode||!e){const t=Ki();return{genreLines:t.genreLines,sourcePreset:t}}return{genreLines:e}}function Ji(r){const e=r.split(`
`).map(Hi).filter(t=>t.length>0).filter(t=>!/^#+\s*/.test(t)).filter(t=>!/^output to\s+/i.test(t)).filter(t=>!/^no headings/i.test(t));return[...new Set(e)].filter(t=>t.length<=180)}function qi(r){if(typeof r!="object"||r===null)return null;const e=r,t=typeof e.id=="string"&&e.id.trim().length>0?e.id:crypto.randomUUID(),n=ze(e.createdAt)??new Date().toISOString(),a=ze(e.archivedAt),s=typeof e.request=="object"&&e.request!==null?e.request:null,o=Array.isArray(e.seeds)?e.seeds.filter(d=>typeof d=="string"&&d.trim().length>0):[];if(!s||o.length===0)return null;const i=wa,c=typeof s.count=="number"&&Number.isFinite(s.count)?Math.max(1,Math.round(s.count)):o.length,l={id:t,createdAt:n,request:{genreLines:typeof s.genreLines=="string"?s.genreLines:"",count:c,coverageMode:i,surpriseMode:!!s.surpriseMode,presetId:typeof s.presetId=="string"?s.presetId:void 0},seeds:o};return a&&(l.archivedAt=a),l}function Ve(r){const e=[];for(const t of r){const n=qi(t);n&&e.push(n)}return e}function Dr(){const r=Dt([pa,...fa],[]);return Ve(r)}function Ta(r){return r.filter(e=>!e.archivedAt)}function vt(r){return r.filter(e=>!!e.archivedAt)}function qe(r,e={}){const{markArchivedChanged:t=!1,markSynced:n=!1,timestamp:a=new Date().toISOString()}=e,s=Ve(r);if(It(pa,fa,s),t||n){const o=Rr();t&&(o.lastChangedAt=a),n&&(o.lastSyncedAt=a),Sa(o)}return Bi(Ta(s)),s}function De(){return Ta(Dr())}function ue(){return vt(Dr())}function sd(r){const e={...r,id:crypto.randomUUID(),createdAt:new Date().toISOString()},t=ue(),n=[e,...De()].slice(0,ya);return qe([...n,...t]),n}function od(r){const e=new Date().toISOString(),t=ue(),n=De(),a=n.find(s=>s.id===r);return a?(qe([...n.filter(s=>s.id!==r),{...a,archivedAt:e},...t.filter(s=>s.id!==r)],{markArchivedChanged:!0,timestamp:e}),De()):n}function id(r){const e=ue(),t=e.find(a=>a.id===r);if(!t)return De();const n=[{...t,archivedAt:void 0},...De()].slice(0,ya);return qe([...n,...e.filter(a=>a.id!==r)],{markArchivedChanged:!0}),n}function cd(r){return qe(Dr().filter(e=>e.id!==r),{markArchivedChanged:!0}),ue()}function Xi(r){if(Array.isArray(r))return vt(Ve(r));if(typeof r!="object"||r===null)return null;const e=r;return Array.isArray(e.runs)?vt(Ve(e.runs)):null}function Qi(r){const e=vt(Ve(r));return qe([...De(),...e],{markArchivedChanged:!1,markSynced:!0}),ue()}function ka(r=new Date().toISOString()){const e=Rr();e.lastSyncedAt=r,Sa(e)}function Zi(){const{lastChangedAt:r,lastSyncedAt:e}=Rr();return r?e?Date.parse(r)>Date.parse(e):!0:!1}async function dd(){if(!_.isEnabled()||!_.hasAccessToken())return null;if(Zi()){const t=ue();return await _.syncArchivedSeedRuns("push",{runs:t}),ka(),t}const r=await _.syncArchivedSeedRuns("pull"),e=Xi(r);return e?Qi(e):null}function pe(){return Aa(X())}function ec(){return Gi(X())}function tc(r){if(Array.isArray(r))return bt(r);if(typeof r!="object"||r===null)return null;const e=r;return Array.isArray(e.seeds)?bt(e.seeds):null}function ld(r){return le([...r]),pe()}function rc(r){return le([...r],{markChanged:!1,markSynced:!0}),pe()}function xa(r=new Date().toISOString()){const e=Cr();e.lastSyncedAt=r,Ea(e)}function nc(){const{lastChangedAt:r,lastSyncedAt:e}=Cr();return r?e?Date.parse(r)>Date.parse(e):!0:!1}async function ud(){if(!_.isEnabled()||!_.hasAccessToken())return null;if(nc()){const t=X();return await _.syncSeeds("push",{seeds:t}),xa(),pe()}const r=await _.syncSeeds("pull"),e=tc(r);return e?rc(e):null}function ac(r){const e=new Date().toISOString(),t=X().map(n=>n.seed===r?{...n,archivedAt:e}:n);return le(t,{timestamp:e}),pe()}function sc(r){const e=X().map(t=>t.seed===r?{...t,archivedAt:void 0}:t);return le(e),pe()}function pd(r){return le(X().filter(e=>e.seed!==r)),ec()}function fd(r){const e=X(),t=e.find(n=>n.seed===r);return t?.archivedAt?sc(r):t?ac(r):(le([{seed:r,addedAt:new Date().toISOString()},...e]),pe())}function md(r){const e=new Date().toISOString(),n=X().map(a=>a.seed===r?{...a,lastUsedAt:e}:a);return le(n,{timestamp:e}),pe()}const oc="eidolon.web.themes.custom",ic=["bpui.web.themes.custom"],Oa=900,dt=new Set;let Y=null,je=null;function cc(){return Je([oc,...ic],[])}function dc(r){const e=r.metadata.mode,t=e==="SFW"||e==="NSFW"||e==="Platform-Safe"||e==="Auto"?e:void 0,n=o=>{if(typeof o!="string")return;const i=o.trim();return i.length>0?i:void 0},a=Object.fromEntries(Object.entries(r.assets).filter(o=>{const[i,c]=o;return typeof i=="string"&&i.length>0&&typeof c=="string"})),s=Array.isArray(r.metadata.component_send_order)?r.metadata.component_send_order.filter(o=>typeof o=="string").map(o=>o.trim()).filter(o=>o.length>0):void 0;return{reviewId:n(r.metadata.review_id)??r.path,seed:n(r.metadata.seed)??r.path,mode:t,model:n(r.metadata.model),archivedAt:n(r.metadata.archived_at),characterName:n(r.metadata.character_name),templateName:n(r.metadata.template_name),genre:n(r.metadata.genre),notes:n(r.metadata.notes),favorite:!!r.metadata.favorite,tags:Array.isArray(r.metadata.tags)?r.metadata.tags.filter(o=>typeof o=="string"&&o.trim().length>0):[],offspringType:n(r.metadata.offspring_type),customInstructions:n(r.metadata.custom_instructions),componentSendOrder:s&&s.length>0?s:void 0,parentDraftIds:Array.isArray(r.metadata.parent_drafts)?r.metadata.parent_drafts.filter(o=>typeof o=="string"&&o.trim().length>0):void 0,connectedDraftIds:Array.isArray(r.metadata.connected_drafts)?r.metadata.connected_drafts.filter(o=>typeof o=="string"&&o.trim().length>0):void 0,assets:a}}function sn(r){return ct(r)!==null&&!na(r)?`blueprints/overrides/${r.replace(/^blueprints\//,"")}`:r}function lc(r){return typeof r=="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(r)}async function uc(){const[r,e]=await Promise.all([T.getAllDraftsWithOptions({includeArchived:!0}),_.listRemoteDrafts()]),t=new Set(r.map(o=>o.metadata.review_id)),n=e.drafts||[],s=((await _.syncDrafts("push",{drafts:r.map(dc)})).results||[]).filter(o=>o.status==="error").map(o=>o.error?`${o.reviewId} (${o.error})`:o.reviewId);if(s.length>0)throw new Error(`Remote draft sync failed for: ${s.join(", ")}`);await Promise.all(n.filter(o=>!t.has(o.reviewId)).map(o=>lc(o.id)?_.deleteRemoteDraft(o.id).catch(i=>{console.warn(`Failed to delete remote draft ${o.reviewId}:`,i)}):(console.warn(`Skipping remote draft delete for ${o.reviewId}: server returned non-UUID id.`),Promise.resolve())))}async function pc(){const r=cc(),t=(await _.listRemoteThemes()).themes||[],n=new Set(r.map(a=>a.name));await _.syncThemes("push",{themes:r.map(a=>({name:a.name,displayName:a.display_name,description:a.description,author:a.author,tags:a.tags,basedOn:a.based_on,colors:a.colors}))}),await Promise.all(t.filter(a=>!a.isBuiltin&&!n.has(a.name)).map(a=>_.deleteRemoteTheme(a.name).catch(s=>{console.warn(`Failed to delete remote theme ${a.name}:`,s)})))}async function fc(){const r=ie(),t=(await _.listRemoteTemplates()).templates||[],n=new Set(r.map(a=>a.template.name));await _.syncTemplates("push",{templates:r.map(a=>({name:a.template.name,version:a.template.version,description:a.template.description,isDefault:a.template.is_default,assets:a.template.assets,blueprintContent:a.blueprint_contents}))}),await Promise.all(t.filter(a=>!a.isOfficial&&!n.has(a.name)).map(a=>_.deleteRemoteTemplate(a.name).catch(s=>{console.warn(`Failed to delete remote template ${a.name}:`,s)})))}async function mc(){const r=X(),e=ue();await _.syncSeeds("push",{seeds:r}),await _.syncArchivedSeedRuns("push",{runs:e}),xa(),ka()}async function hc(){const r=q(),e=Object.entries(r),t=new Set(e.map(([s])=>sn(s))),a=(await _.listRemoteBlueprints()).blueprints||[];e.length>0&&await _.syncBlueprints("push",{blueprints:e.map(([s,o])=>{const i=Tr(o);return{path:sn(s),name:i.name,description:i.description,invokable:i.invokable,version:i.version,category:"custom",content:o}})}),await Promise.all(a.filter(s=>!s.isBuiltin&&!t.has(s.path)).map(s=>_.deleteRemoteBlueprint(s.path).catch(o=>{console.warn(`Failed to delete remote blueprint ${s.path}:`,o)})))}async function gc(){await Promise.all([_.pushConfig(A.getConfig()),_.pushApiKeys(Object.fromEntries(Object.entries(A.getApiKeys()).filter(r=>r[1]!==void 0)))])}async function _c(r){switch(r){case"drafts":await uc();return;case"themes":await pc();return;case"templates":await fc();return;case"seeds":await mc();return;case"blueprints":await hc();return;case"config":await gc();return}}async function Et(){if(je)return je;Y&&(clearTimeout(Y),Y=null),je=(async()=>{const r=Array.from(dt);if(dt.clear(),!(r.length===0||!_.isEnabled()||!_.hasAccessToken()))for(const e of r)try{await _c(e)}catch(t){console.warn(`Automatic ${e} sync failed:`,t)}})();try{await je}finally{je=null,dt.size>0&&!Y&&(Y=setTimeout(()=>{Y=null,Et()},Oa))}}function D(r,e={}){if(x())return;if((Array.isArray(r)?r:[r]).forEach(n=>dt.add(n)),e.immediate){Et();return}Y&&clearTimeout(Y),Y=setTimeout(()=>{Y=null,Et()},Oa)}function hd(){return x()?Promise.resolve():Et()}function yc(r){const e=Xn(r);if(e.length===0)return"";let t;try{t=Qn(e)}catch{t=e.map(o=>o.name)}const n=t.map(o=>e.find(i=>i.name===o)).filter(o=>!!o),a=[];a.push(`

## TEMPLATE OVERRIDE
`),a.push("The following active template contract is authoritative. Use it instead of the fallback template order."),a.push(`Template name: ${r.name}`),a.push(`Template version: ${r.version}`),r.description?.trim()&&a.push(`Template description: ${r.description.trim()}`),a.push(`Asset count: ${n.length}`),a.push(""),a.push("Asset output order:"),n.forEach((o,i)=>{a.push(`${i+1}. ${o.name}`)}),a.push(""),a.push("Declared asset contract:"),n.forEach(o=>{const i=o.dependsOn.length>0?o.dependsOn.join(", "):"none";a.push(`- ${o.name}`),a.push(`  - required: ${o.required}`),a.push(`  - depends_on: ${i}`),o.blueprintFile&&a.push(`  - blueprint_file: ${o.blueprintFile}`),o.description?.trim()&&a.push(`  - description: ${o.description.trim()}`)});const s=n.map(o=>{const i=xr(r.name,o.name)?.trim();return i?["",`### ASSET BLUEPRINT: ${o.name}`,"```md",i,"```"].join(`
`):null}).filter(o=>!!o);return s.length>0&&(a.push(""),a.push("Resolved asset blueprints:"),a.push("Follow these blueprint sources exactly for structure, placeholders, control blocks, and field names."),a.push(s.join(`
`))),a.join(`
`)}function Ca(r){if(!r)return[];const e=Xn(r);if(e.length===0)return[];try{return Qn(e)}catch{return e.map(t=>t.name)}}function Ye(r,e,t,n){const a=Ca(n),s=a.length>0?a:Object.keys(t),o=[`
## ${r}: ${e}`];return n&&o.push(`Template: ${n.name} (${n.version})`),s.forEach(i=>{o.push(...gr(`### ${i}:`,i,t[i]||""))}),o}function wc(r,e){return gr(`### ${r}:`,r,e)}function Ra(r,e={}){const t=e.template??r.template,n=e.assetName&&t?pn(t,e.assetName,r.assets):{...r.assets};if(e.assetName){const l=r.assets[e.assetName];typeof l=="string"&&l.trim().length>0&&(n[e.assetName]=l)}const a=Ca(t),s=a.length>0?a.filter(l=>l in n):Object.keys(n),o=Object.keys(n).filter(l=>!s.includes(l)),i=[...s,...o];if(i.length===0)return[];const c=[`
## Imported Character Source Material`,`Source label: ${r.label}`,`Imported from: ${r.source}`,"Treat the following imported card assets as source material for this rehash.","Preserve compatible facts, tone, relationship logic, and constraints when they fit the active seed and blueprint.","Do not copy them blindly as final output; rewrite them into the requested asset format."];return t&&c.push(`Template context: ${t.name} (${t.version})`),i.forEach(l=>{c.push(...gr(`### ${l}:`,l,n[l]||"",{jsonInstruction:"Treat the extracted fields below as imported source material. Do not assume access to any external file."}))}),c}async function bc(r,e=null,t,n,a,s=[],o=[],i){let c=await Ot("orchestration",a,n);t&&t.assets.length>0&&(c+=yc(t));const l=c,d=[];return e&&d.push(`Mode: ${e}`),d.push(`SEED: ${r}`),i&&d.push(...Ra(i,{template:t})),o.length>0&&(d.push(""),d.push("CONNECTED CHARACTER REFERENCES:"),d.push("Treat these suites as secondary canon anchors for continuity, shared setting pressure, and existing entanglements."),d.push("Do not let them override the active seed or collapse the new character into a duplicate."),o.forEach((p,u)=>{d.push(...Ye(`REFERENCE ${u+1}`,p.label,p.assets,p.template))})),s.length>0&&(d.push(""),d.push("ADDITIONAL RULES:"),s.forEach(p=>{d.push(`- ${p}`)})),[l,d.join(`
`)]}async function vc(r,e,t=null,n={},a=null,s,o=[],i=[],c,l){const d=a||await qn(r,s),p=`# BLUEPRINT: ${r}

${d}`,u=pn(c?H(c):void 0,r,n),f=[];if(f.push(`TARGET ASSET: ${r}`),f.push(`TASK: Generate only the requested ${r} asset.`),f.push("Do not regenerate, restate, or summarize any other asset unless it is quoted below as supporting context."),r==="a1111"&&f.push("OUTPUT: Return only the final raw A1111 prompt lines. Do not write narration, scene prose, explanations, headings, labels, or code fences."),t&&(f.push(""),f.push(`Mode: ${t}`)),f.push(`SEED: ${e}`),o.length>0&&(f.push(""),f.push("ADDITIONAL INSTRUCTIONS:"),o.forEach((m,h)=>{h>0&&f.push(""),f.push(m)})),i.length>0&&(f.push(`
---
## Connected Character References:
`),f.push("Treat these suites as established canon anchors for relationship continuity, shared world state, and cross-character consistency."),f.push("Use them to keep the new character interconnected without duplicating an existing suite or overriding the active seed."),i.forEach((m,h)=>{f.push(...Ye(`REFERENCE ${h+1}`,m.label,m.assets,m.template))})),l&&f.push(...Ra(l,{assetName:r,template:c?H(c):void 0})),Object.keys(u).length>0){f.push(`
---
## Prior Assets (for context):
`);for(const[m,h]of Object.entries(u))f.push(...wc(m,h))}return[p,f.join(`
`)]}async function Ec(r,e){return[e?.trim()||await Ot("seed_generation"),r]}async function Sc(r,e={}){const t=e.blueprintContent?.trim()||await Ot("worldbook_generation"),n=[`REFERENCE_DRAFT_COUNT: ${r.length}`,"TASK: Synthesize a connected lorebook/worldbook packet from these reference drafts.","CONSTRAINT: Do not generate a new standalone character. Extract connected canon, events, places, factions, moments, and recurring pressure instead."];return e.focus?.trim()&&(n.push(""),n.push(`FOCUS: ${e.focus.trim()}`)),r.forEach((a,s)=>{n.push(...Ye(`REFERENCE DRAFT ${s+1}`,a.label,a.assets,a.template))}),[t,n.join(`
`)]}function Ac(r,e){const t=`You are an expert character analyst specializing in understanding character relationships, dynamics, and narrative potential. Your task is to deeply analyze two characters and provide insights about how they would interact in a story.

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
- What themes or conflicts would their relationship explore?`,n=[];return n.push(`## CHARACTER 1: ${r.name||"Character 1"}`),n.push(`**Age**: ${r.age||"Unknown"}`),n.push(`**Gender**: ${r.gender||"Unknown"}`),n.push(`**Species**: ${r.species||"Unknown"}`),n.push(`**Occupation**: ${r.occupation||"Unknown"}`),n.push(`**Role**: ${r.role||"Unknown"}`),n.push(`**Power Level**: ${r.power_level||"Unknown"}`),n.push(`**Mode**: ${r.mode||"Unknown"}`),r.personality_traits&&r.personality_traits.length>0&&n.push(`**Personality Traits**: ${r.personality_traits.slice(0,10).join(", ")}`),r.core_values&&r.core_values.length>0&&n.push(`**Core Values**: ${r.core_values.slice(0,10).join(", ")}`),r.motivations&&r.motivations.length>0&&n.push(`**Motivations**: ${r.motivations.slice(0,10).join(", ")}`),r.goals&&r.goals.length>0&&n.push(`**Goals**: ${r.goals.slice(0,10).join(", ")}`),r.fears&&r.fears.length>0&&n.push(`**Fears**: ${r.fears.slice(0,10).join(", ")}`),n.push(`
## CHARACTER 2: ${e.name||"Character 2"}`),n.push(`**Age**: ${e.age||"Unknown"}`),n.push(`**Gender**: ${e.gender||"Unknown"}`),n.push(`**Species**: ${e.species||"Unknown"}`),n.push(`**Occupation**: ${e.occupation||"Unknown"}`),n.push(`**Role**: ${e.role||"Unknown"}`),n.push(`**Power Level**: ${e.power_level||"Unknown"}`),n.push(`**Mode**: ${e.mode||"Unknown"}`),e.personality_traits&&e.personality_traits.length>0&&n.push(`**Personality Traits**: ${e.personality_traits.slice(0,10).join(", ")}`),e.core_values&&e.core_values.length>0&&n.push(`**Core Values**: ${e.core_values.slice(0,10).join(", ")}`),e.motivations&&e.motivations.length>0&&n.push(`**Motivations**: ${e.motivations.slice(0,10).join(", ")}`),e.goals&&e.goals.length>0&&n.push(`**Goals**: ${e.goals.slice(0,10).join(", ")}`),e.fears&&e.fears.length>0&&n.push(`**Fears**: ${e.fears.slice(0,10).join(", ")}`),n.push(`
## TASK`),n.push("Provide a deep analysis of these two characters' relationship potential."),n.push("Return your response as valid JSON following the structure specified in the system prompt."),[t,n.join(`
`)]}async function Tc(r,e,t,n,a=null,s,o,i,c){const l=await Ot("offspring_generation",c,i),d=[];return a&&d.push(`Mode: ${a}`),d.push(...Ye("PARENT 1",t,r,s)),d.push(...Ye("PARENT 2",n,e,o)),d.push(`
## INSTRUCTION:`),d.push("Analyze how these two parents would shape a new character's upbringing and generate the offspring's SEED."),d.push("Treat each parent suite according to the template contract shown in the provided assets."),[l,d.join(`
`)]}function ve(r,e,t){const n=[{role:"system",content:r}];return n.push({role:"user",content:e}),n}const kc=["character_sheet","post_history","system_prompt"],on={character_sheet:1400,post_history:500,system_prompt:500,reference_summary:360,default:420},cn={character_sheet:24,post_history:8,system_prompt:8,reference_summary:6,default:8};function xc(r){return on[r]??on.default}function Oc(r){return cn[r]??cn.default}function lt(r,e){const t=e.trim();if(!t)return"";const n=Oc(r),a=xc(r),s=t.split(/\r?\n/).map(l=>l.trimEnd()).filter(l=>l.trim().length>0),i=s.slice(0,n).join(`
`);return i.length<=a&&s.length<=n?i:`${i.slice(0,a).trimEnd()}
[truncated for reference]`}function Cc(r){const e=[],{metadata:t}=r;return e.push(`name: ${t.character_name||t.review_id}`),t.template_name&&e.push(`template: ${t.template_name}`),t.mode&&e.push(`mode: ${t.mode}`),e.push(`seed: ${t.seed}`),t.genre&&e.push(`genre: ${t.genre}`),t.notes?.trim()&&e.push(`notes: ${t.notes.trim()}`),lt("reference_summary",e.join(`
`))}function Rc(r,e={}){const t={},n=Cc(r);n&&(t.reference_summary=n);const a=e.preferredAssetOrder??[...kc];for(const o of a){const i=r.assets[o];typeof i!="string"||i.trim().length===0||(t[o]=lt(o,i))}if(e.includeAssetPrefixes?.length){const o=new Set(Object.keys(t));for(const[i,c]of Object.entries(r.assets))o.has(i)||e.includeAssetPrefixes.some(l=>i.startsWith(l))&&(typeof c!="string"||c.trim().length===0||(t[i]=lt(i,c)))}if(Object.keys(t).length>1)return t;const s=Object.entries(r.assets).find(([,o])=>typeof o=="string"&&o.trim().length>0);if(s){const[o,i]=s;t[o]=lt(o,i)}return t}function ur(r,e={}){const t=new Set((e.excludeIds??[]).filter(s=>typeof s=="string").map(s=>s.trim()).filter(Boolean)),n=[],a=new Set;for(const s of r??[]){if(typeof s!="string")continue;const o=s.trim();if(!(!o||t.has(o)||a.has(o))&&(a.add(o),n.push(o),n.length>=mr))break}return n}async function dn(r,e={}){const t=ur(r,{excludeIds:e.excludeIds});return t.length===0?[]:(await Promise.all(t.map(a=>T.getDraft(a)))).filter(a=>!!a).map(a=>({label:a.metadata.character_name||a.metadata.review_id,assets:Rc(a,e),template:e.resolveTemplate?.(a.metadata.template_name)})).filter(a=>Object.keys(a.assets).length>0)}const Dc=4096;class J{static createStreamDisplayState(){return{rawContent:"",visibleContent:""}}static sanitizeModelContent(e){return Ka(e)}static appendVisibleChunk(e,t){e.rawContent+=t;const n=this.sanitizeModelContent(e.rawContent),a=n.startsWith(e.visibleContent)?n.slice(e.visibleContent.length):"";return e.visibleContent=n,a}static resolveGenerationMaxTokens(e){return typeof e.max_tokens=="number"&&Number.isFinite(e.max_tokens)?Math.max(1,Math.round(e.max_tokens)):Dc}static resolveConfiguredProvider(e){return e.engine_mode==="explicit"&&e.engine!=="auto"&&e.engine!=="openai_compatible"?e.engine:e.model?hr(e.model):void 0}static getFallbackApiKey(e){return Object.values(e).find(t=>typeof t=="string"&&t.trim().length>0)}static createConfiguredEngine(){const e=A.getApiKeys(),t=A.getConfig(),n=this.resolveConfiguredProvider(t);return Ae({model:t.model,apiKey:n?e[n]:this.getFallbackApiKey(e),apiKeys:e,provider:n,baseUrl:t.base_url,proxyKey:t.api_proxy_key,temperature:t.temperature,maxTokens:this.resolveGenerationMaxTokens(t)})}static sanitizeGeneratedSeed(e){return Lt(this.sanitizeModelContent(e)).replace(/^['"]|['"]$/g,"")}static getOffspringCarryRules(){return["Treat this seed as an offspring outcome shaped by two parent suites, not a disconnected standalone premise.","Preserve the inherited, inverted, or transmuted relational vector toward {{user}} implied by the offspring seed.","Do not flatten lineage tension: the generated assets should still feel like a descendant response to parental influence even when the seed expresses rebellion or mutation."]}static async*generate(e,t={}){const{seed:n,template:a,mode:s="Auto",stream:o=!0,blueprint_override:i,additional_instructions:c=[],connected_draft_ids:l=[],imported_source:d}=e;yield{type:"status",stage:"initializing"};const p=A.getConfig(),u=this.createConfiguredEngine(),f=a?H(a):void 0,m=ur(l),h=await dn(m,{resolveTemplate:P=>P?H(P):void 0});yield{type:"status",stage:"building_prompt"};const[w,v]=await bc(n,s,f,void 0,i,c,h,d);yield{type:"status",stage:"generating"};const y=ve(w,v);let R="";if(o){const P=this.createStreamDisplayState();for await(const Ne of u.generateStream(y,{signal:t.signal})){if(Ne.content){const Ir=this.appendVisibleChunk(P,Ne.content);R=P.visibleContent,Ir&&(yield{type:"chunk",content:Ir})}if(Ne.done)break}if(!R.trim()&&!t.signal?.aborted){const Ne=await u.generate(y,{signal:t.signal});R=this.sanitizeModelContent(Ne.content),R&&(yield{type:"chunk",content:R})}}else{const P=await u.generate(y,{signal:t.signal});R=this.sanitizeModelContent(P.content)}yield{type:"status",stage:"parsing"};let W;try{W=f?Xa(R,f).assets:this.parseBlueprintOutput(R)}catch{W=this.parseBlueprintOutput(R)}yield{type:"status",stage:"saving"};const b=this.generateReviewId(),F=Te(W,a),Nt={path:b,metadata:{review_id:b,seed:n,mode:s,model:p.model,created:new Date().toISOString(),modified:new Date().toISOString(),favorite:!1,template_name:a,character_name:F,connected_drafts:m.length>0?m:void 0},assets:W};await T.saveDraft(Nt),D("drafts"),yield{type:"complete",asset:b}}static async*generateAsset(e,t=!0,n={}){const a=xr(e.template,e.asset_name);yield*this.generateAssetWithBlueprint(e,a,t,n)}static async*previewBlueprint(e,t=!0,n={}){yield*this.generateAssetWithBlueprint(e,e.blueprint_content,t,n)}static async*generateAssetWithBlueprint(e,t,n,a={}){const{seed:s,mode:o="Auto",asset_name:i,prior_assets:c,additional_instructions:l=[],reference_suites:d=[],imported_source:p}=e;yield{type:"status",stage:"initializing"};const u=this.createConfiguredEngine();yield{type:"status",stage:"building_prompt"};const[f,m]=await vc(i,s,o,c,t,void 0,l,d,e.template,p);yield{type:"status",stage:"prompt_ready",asset:i,systemPrompt:f,userPrompt:m},yield{type:"status",stage:"generating",asset:i};const h=ve(f,m);let w="";if(n){const v=this.createStreamDisplayState();for await(const y of u.generateStream(h,{signal:a.signal})){if(y.content){const R=this.appendVisibleChunk(v,y.content);w=v.visibleContent,R&&(yield{type:"chunk",content:R,asset:i})}if(y.done)break}if(!w.trim()&&!a.signal?.aborted){const y=await u.generate(h,{signal:a.signal});w=this.sanitizeModelContent(y.content)}}else{const v=await u.generate(h,{signal:a.signal});w=this.sanitizeModelContent(v.content)}yield{type:"asset",asset:i,content:Lt(w),systemPrompt:f,userPrompt:m}}static async*generateOffspringSeed(e,t={}){const{parent1_id:n,parent2_id:a,mode:s="Auto",blueprint_override:o}=e;yield{type:"status",stage:"loading_parents"};const i=await T.getDraft(n),c=await T.getDraft(a);if(!i||!c){yield{type:"error",error:"Parent drafts not found"};return}yield{type:"status",stage:"building_prompt"};const l=this.createConfiguredEngine(),[d,p]=await Tc(i.assets,c.assets,i.metadata.character_name||"Parent 1",c.metadata.character_name||"Parent 2",s,i.metadata.template_name?H(i.metadata.template_name):void 0,c.metadata.template_name?H(c.metadata.template_name):void 0,void 0,o);yield{type:"status",stage:"generating"};const u=ve(d,p);let f="";const m=this.createStreamDisplayState();for await(const w of l.generateStream(u,{signal:t.signal})){if(w.content){const v=this.appendVisibleChunk(m,w.content);f=m.visibleContent,v&&(yield{type:"chunk",content:v})}if(w.done)break}if(!f.trim()&&!t.signal?.aborted){const w=await l.generate(u,{signal:t.signal});f=this.sanitizeModelContent(w.content),f&&(yield{type:"chunk",content:f})}yield{type:"complete",content:this.sanitizeGeneratedSeed(f)}}static async*generateOffspring(e,t={}){const{parent1_id:n,parent2_id:a,mode:s="Auto",template:o,blueprint_override:i}=e;let c="";for await(const d of this.generateOffspringSeed(e,t)){if(d.type==="error"){yield d;return}(d.type==="status"||d.type==="chunk")&&(yield d),d.type==="complete"&&(c=d.content||"")}if(!c){yield{type:"error",error:"Offspring seed generation finished without seed content."};return}yield{type:"status",stage:"generating_character"};let l="";for await(const d of this.generate({seed:c,mode:s,template:o,stream:!1,blueprint_override:i,additional_instructions:this.getOffspringCarryRules()},t)){if(d.type==="error"){yield d;return}d.type==="status"&&d.stage==="saving"&&(yield{type:"status",stage:"saving"}),d.type==="complete"&&(l=d.asset||"")}if(!l){yield{type:"error",error:"Offspring generation finished without a saved draft id."};return}await T.updateMetadata(l,{seed:c,parent_drafts:[n,a],offspring_type:"offspring"}),D("drafts"),yield{type:"complete",asset:l}}static async*generateLorebook(e,t={}){const n=ur(e.draft_ids);if(n.length===0){yield{type:"error",error:"Select at least one reference draft to generate a lorebook packet."};return}yield{type:"status",stage:"loading_references"};const a=await dn(n,{preferredAssetOrder:["lorebook","character_sheet","post_history","intro_scene","intro_page","system_prompt"],includeAssetPrefixes:["lorebook_"],resolveTemplate:p=>p?H(p):void 0});if(a.length===0){yield{type:"error",error:"The selected drafts did not contain enough usable reference context for lorebook generation."};return}yield{type:"status",stage:"building_prompt"};const s=this.createConfiguredEngine(),[o,i]=await Sc(a,{focus:e.focus,blueprintContent:e.blueprint_content});yield{type:"status",stage:"generating"};const c=ve(o,i);let l="";const d=this.createStreamDisplayState();for await(const p of s.generateStream(c,{signal:t.signal})){if(p.content){const u=this.appendVisibleChunk(d,p.content);l=d.visibleContent,u&&(yield{type:"chunk",content:u})}if(p.done)break}if(!l.trim()&&!t.signal?.aborted){const p=await s.generate(c,{signal:t.signal});l=this.sanitizeModelContent(p.content),l&&(yield{type:"chunk",content:l})}yield{type:"complete",content:Lt(l).trim()}}static async*generateSeeds(e){yield{type:"status",stage:"initializing"};const t=typeof e=="string"?{genre_lines:e}:e,{genreLines:n}=Yi(t),a=A.getApiKeys(),s=A.getConfig(),o=this.resolveConfiguredProvider(s),i=Ae({model:s.model,apiKey:o?a[o]:this.getFallbackApiKey(a),apiKeys:a,provider:o,baseUrl:s.base_url,temperature:s.temperature,maxTokens:this.resolveGenerationMaxTokens(s)});yield{type:"status",stage:"building_prompt"};const[c,l]=await Ec(n,t.blueprint_content);yield{type:"status",stage:"generating"};const d=ve(c,l),p=await i.generate(d);yield{type:"complete",content:Ji(this.sanitizeModelContent(p.content)).join(`
`)}}static async*chat(e,t,n){yield{type:"status",stage:"initializing"};const a=A.getApiKeys(),s=A.getConfig(),o=this.resolveConfiguredProvider(s),i=Ae({model:s.model,apiKey:o?a[o]:this.getFallbackApiKey(a),apiKeys:a,provider:o,baseUrl:s.base_url,temperature:s.temperature,maxTokens:this.resolveGenerationMaxTokens(s)});yield{type:"status",stage:"generating"};const l=(t[0]?.role==="system"?t[0].content:void 0)?t.slice(1):t;let d="";const p=this.createStreamDisplayState();for await(const u of i.generateStream(l)){if(u.content){const f=this.appendVisibleChunk(p,u.content);d=p.visibleContent,f&&(yield{type:"chunk",content:f})}if(u.done)break}if(!d.trim()){const u=await i.generate(l);d=this.sanitizeModelContent(u.content),d&&(yield{type:"chunk",content:d})}yield{type:"complete",content:d}}static async analyzeSimilarity(e,t){const n=await T.getDraft(e),a=await T.getDraft(t);if(!n||!a)throw new Error("One or both drafts not found");const s=this.parseCharacterProfile(n.assets.character_sheet||""),o=this.parseCharacterProfile(a.assets.character_sheet||""),i=A.getApiKeys(),c=A.getConfig(),l=this.resolveConfiguredProvider(c),d=Ae({model:c.model,apiKey:l?i[l]:this.getFallbackApiKey(i),apiKeys:i,provider:l,baseUrl:c.base_url,temperature:c.temperature,maxTokens:this.resolveGenerationMaxTokens(c)}),[p,u]=Ac(s,o),f=ve(p,u),m=await d.generate(f),h=this.sanitizeModelContent(m.content);try{return JSON.parse(h)}catch{return{raw:h}}}static parseBlueprintOutput(e){const t={},n=/```(\w+)?\n([\s\S]*?)```/g,a=["Adjustment Note","system_prompt","post_history","character_sheet","intro_scene","intro_page","a1111","suno"];let s;for(;(s=n.exec(e))!==null;){const o=s[1],i=s[2]?.trim();o&&i&&a.includes(o)&&(t[o]=i)}if(Object.keys(t).length===0)for(let o=0;o<a.length;o++){const i=a[o],c=a[o+1],l=new RegExp(`^##\\s*${i}`,"im"),d=e.search(l);if(d===-1)continue;let p;if(c){const f=new RegExp(`^##\\s*${c}`,"im"),m=e.slice(d).search(f);p=m===-1?e.length:d+m}else p=e.length;const u=e.slice(d,p).trim();u&&(t[i]=u)}return t}static parseCharacterProfile(e){const t={},n=e.split(`
`);let a=null,s=[];for(const o of n){const i=o.match(/^([A-Z][A-Za-z\s]+):\s*(.+)$/);i?(a&&s.length>0&&(t[a]=s.join(`
`).trim()),a=i[1].trim().toLowerCase().replace(/\s+/g,"_"),s=[i[2].trim()]):a&&o.trim()&&s.push(o.trim())}a&&s.length>0&&(t[a]=s.join(`
`).trim());for(const o of["personality_traits","core_values","goals","fears","motivations"])typeof t[o]=="string"&&(t[o]=t[o].split(",").map(i=>i.trim()).filter(i=>i.length>0));return t}static generateReviewId(){const e=Date.now(),t=Math.random().toString(36).substring(2,9);return`${e}_${t}`}}const Da="eidolon.web.themes.custom",Ic="eidolon:themes-synced",Nc="eidolon:drafts-synced";function Lc(r,e){const t=e.match(/^---\n([\s\S]*?)\n---/);let n=r.split("/").pop()?.replace(".md","")||"Blueprint",a="",s="1.0",o=!0;if(!t)return{name:n,description:a,version:s,invokable:o};const i=t[1],c=i.match(/^name:\s*(.+)$/m),l=i.match(/^description:\s*(.+)$/m),d=i.match(/^version:\s*(.+)$/m),p=i.match(/^invokable:\s*(.+)$/m);return c&&(n=c[1].trim()),l&&(a=l[1].trim()),d&&(s=d[1].trim()),p&&(o=p[1].trim()==="true"),{name:n,description:a,version:s,invokable:o}}function Pc(r){return!r||typeof r!="object"||Array.isArray(r)?{}:Object.fromEntries(Object.entries(r).filter(e=>typeof e[1]=="string"))}function $c(r){return typeof r.name!="string"||r.name.trim().length===0||!Array.isArray(r.assets)?null:{template:{name:r.name,version:typeof r.version=="string"&&r.version.trim().length>0?r.version:"1.0.0",description:typeof r.description=="string"?r.description:"",is_official:!!(r.isOfficial??r.is_official),is_default:!!(r.isDefault??r.is_default),assets:r.assets},blueprint_contents:Pc(r.blueprintContent??r.blueprint_contents)}}function Fc(r){return r.startsWith("blueprints/overrides/")?`blueprints/${r.replace(/^blueprints\/overrides\//,"")}`:r}function Mc(r,e){const t=new Set(Rt().map(o=>o.template.name).filter(o=>o!==e));if(!t.has(r))return r;const n=r.endsWith(" Copy")?r:`${r} Copy`;if(!t.has(n))return n;let a=2,s=`${n} ${a}`;for(;t.has(s);)a+=1,s=`${n} ${a}`;return s}const Ia=["bpui.web.themes.custom"],jc=300*1e3,at=new Map,Uc=[{name:"Official PNG Character Card",path:"png",format:"png",description:"Export a standard PNG character card with embedded V2/V3 card data."},{name:"Official V2/V3 Card JSON",path:"json",format:"json",description:"Export a Chub-compatible V2/V3 character card JSON with Eidolon round-trip extensions."},{name:"text",path:"text",format:"text",description:"Export draft assets as plain text sections."},{name:"combined",path:"combined",format:"combined",description:"Export a markdown bundle with metadata and assets."}];function S(r){return{author:"Eidolon Simulacra",is_builtin:!0,...r}}const Bc=[S({name:"dark",display_name:"Dark",description:"Default dark theme for browser-only mode.",tags:["builtin","dark"],based_on:"",colors:{background:"#0f172a",text:"#e5e7eb",accent:"#38bdf8",button:"#1d4ed8",button_text:"#f8fafc",border:"#334155",highlight:"#7dd3fc",window:"#111827",tok_brackets:"#60a5fa",tok_asterisk:"#f472b6",tok_parentheses:"#f59e0b",tok_double_brackets:"#a78bfa",tok_curly_braces:"#34d399",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#94a3b8",surface:"#1e293b",success_bg:"#052e16",danger_bg:"#450a0a",accent_bg:"#082f49",accent_title:"#e0f2fe",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fcd34d"}}),S({name:"light",display_name:"Light",description:"Default light theme for browser-only mode.",tags:["builtin","light"],based_on:"",colors:{background:"#f8fafc",text:"#0f172a",accent:"#2563eb",button:"#1d4ed8",button_text:"#eff6ff",border:"#cbd5e1",highlight:"#0ea5e9",window:"#ffffff",tok_brackets:"#2563eb",tok_asterisk:"#db2777",tok_parentheses:"#d97706",tok_double_brackets:"#7c3aed",tok_curly_braces:"#059669",tok_pipes:"#0891b2",tok_at_sign:"#e11d48",muted_text:"#64748b",surface:"#ffffff",success_bg:"#dcfce7",danger_bg:"#fee2e2",accent_bg:"#dbeafe",accent_title:"#1e3a8a",success_text:"#166534",error_text:"#991b1b",warning_text:"#92400e"}}),S({name:"nyx",display_name:"Nyx",description:"High-contrast theme tuned for the blueprint workflow.",tags:["builtin","editorial"],based_on:"dark",colors:{background:"#111113",text:"#f3f4f6",accent:"#f97316",button:"#c2410c",button_text:"#fff7ed",border:"#3f3f46",highlight:"#fb923c",window:"#18181b",tok_brackets:"#60a5fa",tok_asterisk:"#f472b6",tok_parentheses:"#f59e0b",tok_double_brackets:"#c084fc",tok_curly_braces:"#4ade80",tok_pipes:"#67e8f9",tok_at_sign:"#fb7185",muted_text:"#a1a1aa",surface:"#18181b",success_bg:"#052e16",danger_bg:"#431407",accent_bg:"#431407",accent_title:"#ffedd5",success_text:"#86efac",error_text:"#fdba74",warning_text:"#fed7aa"}}),S({name:"midnight",display_name:"Midnight",description:"Deep blue ocean theme with cyan accents.",tags:["builtin","dark","blue"],based_on:"dark",colors:{background:"#0a1929",text:"#b2d4f0",accent:"#00b4d8",button:"#014361",button_text:"#caf0f8",border:"#1d3557",highlight:"#48cae4",window:"#051923",tok_brackets:"#00b4d8",tok_asterisk:"#90e0ef",tok_parentheses:"#f48c06",tok_double_brackets:"#06ffa5",tok_curly_braces:"#00b4d8",tok_pipes:"#48cae4",tok_at_sign:"#f77f00",muted_text:"#6b8aa3",surface:"#0f2638",success_bg:"#1b4332",danger_bg:"#641220",accent_bg:"#014361",accent_title:"#48cae4",success_text:"#06ffa5",error_text:"#ff6b6b",warning_text:"#f48c06"}}),S({name:"ember",display_name:"Ember",description:"Warm theme with orange and amber tones.",tags:["builtin","warm","orange"],based_on:"dark",colors:{background:"#1a0f0a",text:"#ffd8b8",accent:"#ff6b35",button:"#c44536",button_text:"#fff8f0",border:"#5e1914",highlight:"#ff8c42",window:"#100a07",tok_brackets:"#ff6b35",tok_asterisk:"#ffa07a",tok_parentheses:"#ffb627",tok_double_brackets:"#7bed9f",tok_curly_braces:"#ff6348",tok_pipes:"#feca57",tok_at_sign:"#ff4757",muted_text:"#a67c52",surface:"#261612",success_bg:"#2d4a2b",danger_bg:"#5e1914",accent_bg:"#c44536",accent_title:"#ff8c42",success_text:"#7bed9f",error_text:"#ff4757",warning_text:"#feca57"}}),S({name:"forest",display_name:"Forest",description:"Natural green theme inspired by woodland twilight.",tags:["builtin","green","nature"],based_on:"dark",colors:{background:"#0d1b0f",text:"#d4f1d4",accent:"#4ecca3",button:"#2d5f3f",button_text:"#e8f5e8",border:"#1e4620",highlight:"#7bed9f",window:"#081108",tok_brackets:"#4ecca3",tok_asterisk:"#7bed9f",tok_parentheses:"#ffd93d",tok_double_brackets:"#6bcf7f",tok_curly_braces:"#48c774",tok_pipes:"#95e1d3",tok_at_sign:"#f8b500",muted_text:"#6b8f71",surface:"#152518",success_bg:"#2d5f3f",danger_bg:"#5c2a2a",accent_bg:"#2d5f3f",accent_title:"#7bed9f",success_text:"#95e1d3",error_text:"#ff6b6b",warning_text:"#ffd93d"}}),S({name:"mono",display_name:"Monochrome",description:"Clean grayscale theme for minimal distraction.",tags:["builtin","minimal","grayscale"],based_on:"dark",colors:{background:"#1c1c1c",text:"#e0e0e0",accent:"#757575",button:"#424242",button_text:"#ffffff",border:"#505050",highlight:"#9e9e9e",window:"#141414",tok_brackets:"#bdbdbd",tok_asterisk:"#9e9e9e",tok_parentheses:"#757575",tok_double_brackets:"#e0e0e0",tok_curly_braces:"#a0a0a0",tok_pipes:"#c0c0c0",tok_at_sign:"#888888",muted_text:"#707070",surface:"#242424",success_bg:"#3a3a3a",danger_bg:"#2e2e2e",accent_bg:"#424242",accent_title:"#9e9e9e",success_text:"#c0c0c0",error_text:"#a0a0a0",warning_text:"#b0b0b0"}}),S({name:"solarized_dark",display_name:"Solarized Dark",description:"Popular Solarized color scheme with reduced eye strain.",tags:["builtin","dark","solarized"],based_on:"dark",colors:{background:"#002b36",text:"#839496",accent:"#268bd2",button:"#073642",button_text:"#eee8d5",border:"#586e75",highlight:"#2aa198",window:"#001e26",tok_brackets:"#dc322f",tok_asterisk:"#268bd2",tok_parentheses:"#cb4b16",tok_double_brackets:"#859900",tok_curly_braces:"#d33682",tok_pipes:"#2aa198",tok_at_sign:"#b58900",muted_text:"#586e75",surface:"#073642",success_bg:"#324d32",danger_bg:"#4d2626",accent_bg:"#073642",accent_title:"#2aa198",success_text:"#859900",error_text:"#dc322f",warning_text:"#b58900"}}),S({name:"trans_flag",display_name:"Trans Flag",description:"Soft cyan and pink palette with neutral dark surfaces.",tags:["builtin","support","bright"],based_on:"dark",colors:{background:"#2e2e2e",text:"#ffffff",accent:"#5bcefa",button:"#f5a9b8",button_text:"#2e2e2e",border:"#cccccc",highlight:"#5bcefa",window:"#3e3e3e",tok_brackets:"#5bcefa",tok_asterisk:"#f5a9b8",tok_parentheses:"#5bcefa",tok_double_brackets:"#f5a9b8",tok_curly_braces:"#ffffff",tok_pipes:"#5bcefa",tok_at_sign:"#f5a9b8",muted_text:"#cccccc",surface:"#3e3e3e",success_bg:"#5bcefa",danger_bg:"#f5a9b8",accent_bg:"#3e3e3e",accent_title:"#5bcefa",success_text:"#2e2e2e",error_text:"#2e2e2e",warning_text:"#2e2e2e"}}),S({name:"blood_for_the_blood_god",display_name:"Blood for the Blood God",description:"A blood red theme with bronze accents.",tags:["builtin","warhammer","chaos","khorne"],based_on:"dark",colors:{background:"#200000",text:"#ffcccc",accent:"#cd7f32",button:"#600000",button_text:"#ffcccc",border:"#400000",highlight:"#ff0000",window:"#200000",tok_brackets:"#e00000",tok_asterisk:"#c00000",tok_parentheses:"#a00000",tok_double_brackets:"#e00000",tok_curly_braces:"#c00000",tok_pipes:"#a00000",tok_at_sign:"#ff0000",muted_text:"#996666",surface:"#400000",success_bg:"#600000",danger_bg:"#800000",accent_bg:"#a06629",accent_title:"#cd7f32",success_text:"#ffcccc",error_text:"#ffcccc",warning_text:"#ffcccc"}}),S({name:"silent_king",display_name:"Silent King",description:"A near-black theme with tomb-world green glow.",tags:["builtin","warhammer","necron","green"],based_on:"dark",colors:{background:"#010a01",text:"#a0e0a0",accent:"#00ff00",button:"#004000",button_text:"#a0e0a0",border:"#002000",highlight:"#00ff00",window:"#010501",tok_brackets:"#00c000",tok_asterisk:"#00a000",tok_parentheses:"#008000",tok_double_brackets:"#00c000",tok_curly_braces:"#00a000",tok_pipes:"#008000",tok_at_sign:"#00ff00",muted_text:"#609060",surface:"#010a01",success_bg:"#004000",danger_bg:"#006000",accent_bg:"#004000",accent_title:"#00ff00",success_text:"#a0e0a0",error_text:"#a0e0a0",warning_text:"#a0e0a0"}}),S({name:"ultramar",display_name:"Ultramar",description:"Cerulean armor, parchment ivory, and gold command trim.",tags:["builtin","warhammer","space-marine","blue"],based_on:"dark",colors:{background:"#08172f",text:"#e8eef7",accent:"#d4a72c",button:"#12396b",button_text:"#f8fafc",border:"#245089",highlight:"#4da3ff",window:"#0b2140",tok_brackets:"#60a5fa",tok_asterisk:"#facc15",tok_parentheses:"#fb7185",tok_double_brackets:"#93c5fd",tok_curly_braces:"#67e8f9",tok_pipes:"#c084fc",tok_at_sign:"#f97316",muted_text:"#93a9c4",surface:"#102949",success_bg:"#163b2a",danger_bg:"#481818",accent_bg:"#3d2b05",accent_title:"#fde68a",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fde047"}}),S({name:"imperial_fists",display_name:"Imperial Fists",description:"Siege yellow palette with navy shadows and hazard-strip energy.",tags:["builtin","warhammer","space-marine","yellow"],based_on:"dark",colors:{background:"#1c1603",text:"#fff6cc",accent:"#ffd100",button:"#7c6200",button_text:"#fffbea",border:"#8e740f",highlight:"#ffe66d",window:"#241d05",tok_brackets:"#ffd100",tok_asterisk:"#60a5fa",tok_parentheses:"#fb923c",tok_double_brackets:"#fde68a",tok_curly_braces:"#facc15",tok_pipes:"#93c5fd",tok_at_sign:"#f87171",muted_text:"#c5b671",surface:"#302608",success_bg:"#2d3d1b",danger_bg:"#51210f",accent_bg:"#483701",accent_title:"#fff3a3",success_text:"#bef264",error_text:"#fca5a5",warning_text:"#fde047"}}),S({name:"raven_guard",display_name:"Raven Guard",description:"Matte black surfaces with pale steel highlights and a covert red ping.",tags:["builtin","warhammer","space-marine","stealth"],based_on:"dark",colors:{background:"#09090b",text:"#e7e5e4",accent:"#d4d4d8",button:"#18181b",button_text:"#fafafa",border:"#3f3f46",highlight:"#a1a1aa",window:"#0f1014",tok_brackets:"#e4e4e7",tok_asterisk:"#f87171",tok_parentheses:"#c084fc",tok_double_brackets:"#93c5fd",tok_curly_braces:"#86efac",tok_pipes:"#67e8f9",tok_at_sign:"#fb7185",muted_text:"#71717a",surface:"#14151a",success_bg:"#14231a",danger_bg:"#3f1014",accent_bg:"#20232a",accent_title:"#f4f4f5",success_text:"#86efac",error_text:"#fda4af",warning_text:"#fdba74"}}),S({name:"salamanders",display_name:"Salamanders",description:"Volcanic green palette with lava orange contrast.",tags:["builtin","warhammer","space-marine","green"],based_on:"dark",colors:{background:"#08130e",text:"#d9f4dd",accent:"#ff7a00",button:"#1c5b34",button_text:"#f7fff8",border:"#2f7d4e",highlight:"#34d399",window:"#0d1d16",tok_brackets:"#4ade80",tok_asterisk:"#fb923c",tok_parentheses:"#facc15",tok_double_brackets:"#86efac",tok_curly_braces:"#22c55e",tok_pipes:"#2dd4bf",tok_at_sign:"#f97316",muted_text:"#7ca58a",surface:"#11251b",success_bg:"#123825",danger_bg:"#4a1d11",accent_bg:"#4a2205",accent_title:"#fdba74",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde047"}}),S({name:"iron_warriors",display_name:"Iron Warriors",description:"Gunmetal, hazard yellow, and industrial rust.",tags:["builtin","warhammer","chaos","industrial"],based_on:"dark",colors:{background:"#101114",text:"#d8d7d2",accent:"#facc15",button:"#3a3d42",button_text:"#fffce8",border:"#5a5f69",highlight:"#fde047",window:"#17191d",tok_brackets:"#facc15",tok_asterisk:"#fb7185",tok_parentheses:"#fb923c",tok_double_brackets:"#d4d4d8",tok_curly_braces:"#93c5fd",tok_pipes:"#67e8f9",tok_at_sign:"#f97316",muted_text:"#8f9098",surface:"#20242a",success_bg:"#243326",danger_bg:"#48211a",accent_bg:"#43370a",accent_title:"#fef08a",success_text:"#86efac",error_text:"#fdba74",warning_text:"#fde047"}}),S({name:"mechanicus_brass",display_name:"Mechanicus Brass",description:"Mars red, soot black, and worn brass for forge-heavy work.",tags:["builtin","warhammer","mechanicus","red"],based_on:"dark",colors:{background:"#130909",text:"#f1d9c3",accent:"#c98b2b",button:"#611616",button_text:"#fff4e6",border:"#7f2a1d",highlight:"#e2a74a",window:"#1a0d0d",tok_brackets:"#f87171",tok_asterisk:"#fbbf24",tok_parentheses:"#fdba74",tok_double_brackets:"#fca5a5",tok_curly_braces:"#fcd34d",tok_pipes:"#93c5fd",tok_at_sign:"#fb7185",muted_text:"#a98a75",surface:"#251212",success_bg:"#1f3424",danger_bg:"#4c1515",accent_bg:"#3f2610",accent_title:"#f6d28b",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fcd34d"}}),S({name:"sororitas_rose",display_name:"Sororitas Rose",description:"Ivory, cathedral black, and stained-glass crimson.",tags:["builtin","warhammer","imperium","gothic"],based_on:"dark",colors:{background:"#141112",text:"#f7ede8",accent:"#b91c1c",button:"#3c1318",button_text:"#fff7f5",border:"#6d2730",highlight:"#fb7185",window:"#1b1718",tok_brackets:"#fda4af",tok_asterisk:"#facc15",tok_parentheses:"#fdba74",tok_double_brackets:"#f5f5f4",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#ef4444",muted_text:"#b2a29c",surface:"#231d1f",success_bg:"#203326",danger_bg:"#4b1319",accent_bg:"#3b1016",accent_title:"#fecdd3",success_text:"#bbf7d0",error_text:"#fecaca",warning_text:"#fdba74"}}),S({name:"cadia_stands",display_name:"Cadia Stands",description:"Military olive, field khaki, and disciplined gold signals.",tags:["builtin","warhammer","imperium","guard"],based_on:"dark",colors:{background:"#11160f",text:"#e6ecd8",accent:"#c8a54b",button:"#3a4b2a",button_text:"#f8faee",border:"#556a3e",highlight:"#a3c76d",window:"#171d14",tok_brackets:"#a3c76d",tok_asterisk:"#facc15",tok_parentheses:"#fb923c",tok_double_brackets:"#d9f99d",tok_curly_braces:"#86efac",tok_pipes:"#93c5fd",tok_at_sign:"#f87171",muted_text:"#99a58b",surface:"#20281b",success_bg:"#243624",danger_bg:"#4a2218",accent_bg:"#3e3413",accent_title:"#f5e6b1",success_text:"#bbf7d0",error_text:"#fca5a5",warning_text:"#fde68a"}}),S({name:"krieg_ash",display_name:"Krieg Ash",description:"Trenchcoat slate, muddy blue, and mask-lens amber.",tags:["builtin","warhammer","imperium","guard"],based_on:"dark",colors:{background:"#101417",text:"#dae1e5",accent:"#d1a449",button:"#3a4854",button_text:"#f6f7f8",border:"#55616c",highlight:"#9db7c7",window:"#151b20",tok_brackets:"#93c5fd",tok_asterisk:"#facc15",tok_parentheses:"#fb923c",tok_double_brackets:"#cbd5e1",tok_curly_braces:"#86efac",tok_pipes:"#67e8f9",tok_at_sign:"#f87171",muted_text:"#8e9aa3",surface:"#1d242a",success_bg:"#233127",danger_bg:"#48231c",accent_bg:"#3f3118",accent_title:"#f4deb1",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde68a"}}),S({name:"thousand_sons",display_name:"Thousand Sons",description:"Arcane cobalt with turquoise sorcery and gilded trim.",tags:["builtin","warhammer","chaos","arcane"],based_on:"dark",colors:{background:"#081427",text:"#dce9ff",accent:"#22d3ee",button:"#12335f",button_text:"#f0f9ff",border:"#1d4f91",highlight:"#7dd3fc",window:"#0d1b35",tok_brackets:"#38bdf8",tok_asterisk:"#facc15",tok_parentheses:"#fb7185",tok_double_brackets:"#67e8f9",tok_curly_braces:"#a78bfa",tok_pipes:"#22d3ee",tok_at_sign:"#f97316",muted_text:"#96a9c6",surface:"#132346",success_bg:"#14312c",danger_bg:"#451b2f",accent_bg:"#10354d",accent_title:"#cffafe",success_text:"#99f6e4",error_text:"#f9a8d4",warning_text:"#fde047"}}),S({name:"drukhari_raid",display_name:"Drukhari Raid",description:"Poison teal, blade violet, and void-black lacquer.",tags:["builtin","warhammer","aeldari","neon"],based_on:"dark",colors:{background:"#09070f",text:"#ece7ff",accent:"#14b8a6",button:"#2c1144",button_text:"#f5f3ff",border:"#5b21b6",highlight:"#5eead4",window:"#100b1a",tok_brackets:"#2dd4bf",tok_asterisk:"#c084fc",tok_parentheses:"#f472b6",tok_double_brackets:"#67e8f9",tok_curly_braces:"#a78bfa",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#9d94b8",surface:"#170f25",success_bg:"#123028",danger_bg:"#43162e",accent_bg:"#102f31",accent_title:"#ccfbf1",success_text:"#99f6e4",error_text:"#f9a8d4",warning_text:"#f0abfc"}}),S({name:"ork_waaagh",display_name:"Ork Waaagh!",description:"Scrap metal, noisy green, and red-goes-fasta contrast.",tags:["builtin","warhammer","ork","high-energy"],based_on:"dark",colors:{background:"#11140c",text:"#e2f5b8",accent:"#67e01f",button:"#734116",button_text:"#fff7ed",border:"#4b5f1a",highlight:"#84cc16",window:"#181d10",tok_brackets:"#84cc16",tok_asterisk:"#ef4444",tok_parentheses:"#f97316",tok_double_brackets:"#bef264",tok_curly_braces:"#facc15",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#9eb279",surface:"#232813",success_bg:"#26401d",danger_bg:"#5a2314",accent_bg:"#293a12",accent_title:"#d9f99d",success_text:"#d9f99d",error_text:"#fdba74",warning_text:"#fde047"}}),S({name:"tau_sept",display_name:"Tau Sept",description:"Clean ochre, alloy grey, and cool interface blue.",tags:["builtin","warhammer","tau","clean"],based_on:"dark",colors:{background:"#11161a",text:"#e8edf0",accent:"#f59e0b",button:"#41525f",button_text:"#f8fafc",border:"#617688",highlight:"#7dd3fc",window:"#161d23",tok_brackets:"#93c5fd",tok_asterisk:"#fbbf24",tok_parentheses:"#fb923c",tok_double_brackets:"#cbd5e1",tok_curly_braces:"#67e8f9",tok_pipes:"#38bdf8",tok_at_sign:"#f97316",muted_text:"#9aa8b2",surface:"#202930",success_bg:"#1e3430",danger_bg:"#4a2218",accent_bg:"#41320c",accent_title:"#fde68a",success_text:"#99f6e4",error_text:"#fdba74",warning_text:"#fde047"}}),S({name:"tyranid_hive",display_name:"Tyranid Hive",description:"Bone chitin, toxic magenta, and abyssal carapace purple.",tags:["builtin","warhammer","tyranid","organic"],based_on:"dark",colors:{background:"#120c18",text:"#f3e8ff",accent:"#f472b6",button:"#3f1b4d",button_text:"#fff7fb",border:"#6b2d78",highlight:"#f9a8d4",window:"#1a1222",tok_brackets:"#f5d0fe",tok_asterisk:"#fb7185",tok_parentheses:"#fdba74",tok_double_brackets:"#e9d5ff",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#f43f5e",muted_text:"#b7a3c4",surface:"#24182f",success_bg:"#243321",danger_bg:"#4f1733",accent_bg:"#441a3d",accent_title:"#fbcfe8",success_text:"#bef264",error_text:"#fda4af",warning_text:"#fdba74"}}),S({name:"genestealer_cult",display_name:"Genestealer Cult",description:"Industrial violet with warning pink and cult neon accents.",tags:["builtin","warhammer","tyranid","industrial"],based_on:"dark",colors:{background:"#0f1020",text:"#ede9fe",accent:"#8b5cf6",button:"#312e81",button_text:"#f5f3ff",border:"#5b4bc4",highlight:"#c084fc",window:"#151730",tok_brackets:"#a78bfa",tok_asterisk:"#fb7185",tok_parentheses:"#f97316",tok_double_brackets:"#ddd6fe",tok_curly_braces:"#67e8f9",tok_pipes:"#c084fc",tok_at_sign:"#f43f5e",muted_text:"#a6a1c9",surface:"#1d2040",success_bg:"#203229",danger_bg:"#47152a",accent_bg:"#2e255d",accent_title:"#e9d5ff",success_text:"#99f6e4",error_text:"#fda4af",warning_text:"#fdba74"}}),S({name:"golden_throne",display_name:"Golden Throne",description:"Black marble, relic gold, and cathedral ivory.",tags:["builtin","warhammer","imperium","gold"],based_on:"dark",colors:{background:"#110f0d",text:"#f6efe2",accent:"#d4af37",button:"#4a3510",button_text:"#fffbeb",border:"#6f5521",highlight:"#f6d365",window:"#171411",tok_brackets:"#fcd34d",tok_asterisk:"#fda4af",tok_parentheses:"#fdba74",tok_double_brackets:"#fef3c7",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#f87171",muted_text:"#b3a58d",surface:"#231e18",success_bg:"#253224",danger_bg:"#472119",accent_bg:"#433311",accent_title:"#fef3c7",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde68a"}})];class V{constructor(e){this.executor=e}readers=[];onComplete;onError;controller=new AbortController;subscribe(e){return this.readers.push(e),this}onComplete_(e){return this.onComplete=e,this}onError_(e){return this.onError=e,this}async start(){try{await this.executor({emit:(e,t)=>this.emit(e,t),signal:this.controller.signal})}catch(e){if(this.controller.signal.aborted)return;this.emit("error",{error:e instanceof Error?e.message:"Stream failed"})}}abort(){this.controller.abort()}emit(e,t){const n={event:e,data:t};this.readers.forEach(a=>a(n)),n.event==="complete"&&this.onComplete&&this.onComplete(n.data),n.event==="error"&&this.onError&&this.onError(n.data.error)}}class C extends Error{constructor(e,t){super(t),this.status=e,this.name="APIError"}}function Wc(r,e){return Je(r,e)}function Gc(r,e,t){fr(r,e,t)}function qt(r){return r.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function Xt(){return{...A.getConfig(),api_keys:A.getApiKeys()}}function zc(r){return r.engine_mode==="explicit"&&r.engine!=="auto"&&r.engine!=="openai_compatible"?r.engine:r.model?hr(r.model):void 0}function Na(r){return Object.values(r).find(e=>typeof e=="string"&&e.trim().length>0)}function Hc(r,e){const t=e[r];return typeof t=="string"&&t.trim().length>0?t:Na(e)}function ne(){return Wc([Da,...Ia],[])}function Ee(r){Gc(Da,Ia,r)}function st(){return[...Bc,...ne()]}function ln(r){typeof window>"u"||window.dispatchEvent(new CustomEvent(r))}function Qt(r,e,t){return{blob:new Blob([r],{type:t}),filename:e,contentType:t}}async function Zt(r){const e=A.getConfig(),t=A.getApiKeys(),n=zc(e);return Ae({model:e.model,apiKey:n?t[n]:Na(t),apiKeys:t,provider:n,baseUrl:e.base_url,temperature:e.temperature,maxTokens:e.max_tokens}).generateStream(r)}class Kc{themesSyncPromise=null;draftsSyncPromise=null;configSyncPromise=null;async loadProviderModels(e,t=!1){const n=A.getApiKeys(),a=A.getConfig(),s=e,o=a.base_url||bo(s),i=Hc(e,n),c=`${e}|${o}|${i?"auth":"anon"}`,l=at.get(c);if(!t&&l&&Date.now()-l.cachedAt<jc)return{...l.response,cached:!0};const d=Ma(s),p=["openrouter","openai","deepseek","zai","moonshot"].includes(e);if(!i||!p){const u={provider:e,models:d,cached:!0,error:i||p?void 0:"Provider model listing is not available in browser mode."};return at.set(c,{response:u,cachedAt:Date.now()}),u}try{const u=await ja(s,i,o);return at.set(c,{response:u,cachedAt:Date.now()}),u}catch(u){const m=u instanceof TypeError&&u.message==="Failed to fetch"?"Network request blocked. This may be due to browser privacy settings (common in EU), ad blockers, or firewall restrictions. Try disabling tracking protection for this site or using a different network.":u instanceof Error?u.message:"Failed to load models",h={provider:e,models:d,cached:!0,error:m};return at.set(c,{response:h,cachedAt:Date.now()}),h}}async getConfig(){return Xt()}getConfigSnapshot(){return Xt()}getThemesSnapshot(){return st()}async syncConfigFromServer(){return!_.isEnabled()||!_.hasAccessToken()?!1:this.configSyncPromise?this.configSyncPromise:(this.configSyncPromise=(async()=>{try{const[e,t]=await Promise.all([_.pullConfig(),_.pullApiKeys()]),n=A.getConfig(),a=A.getApiKeys(),s=e.config||{},o=t.apiKeys||{},i=JSON.stringify(n)!==JSON.stringify({...n,...s}),c=JSON.stringify(a)!==JSON.stringify(o);return!i&&!c?!1:(A.updateConfig(s),A.replaceApiKeys(o),!0)}catch(e){return console.warn("Failed to sync config from server:",e),!1}finally{this.configSyncPromise=null}})(),this.configSyncPromise)}async updateConfig(e){const t={...e};return e.api_keys&&(A.replaceApiKeys(e.api_keys),delete t.api_keys),A.updateConfig(t),D("config"),this.getConfig()}async testConnection(e){const t=A.getApiKeys()[e.provider];if(!t)return{success:!1,error:`No API key configured for ${e.provider}`};const n=e.model||vo[e.provider]?.[0]||Xt().model;return Ae({model:n,apiKey:t,provider:e.provider,baseUrl:e.base_url}).testConnection()}async syncThemesFromServer(){return this.themesSyncPromise?this.themesSyncPromise:(this.themesSyncPromise=(async()=>{if(!_.isEnabled()||!_.hasAccessToken())return!1;try{const{themes:e}=await _.syncThemes("pull"),t=ne();let n=!1;for(const a of e){if(a.isBuiltin)continue;const s={name:a.name,display_name:a.displayName||a.name,description:a.description||"",author:a.author||"",tags:a.tags,based_on:a.basedOn||"",is_builtin:!1,colors:a.colors},o=t.findIndex(i=>i.name===a.name);o>=0?JSON.stringify(t[o])!==JSON.stringify(s)&&(t[o]=s,n=!0):(t.push(s),n=!0)}return n&&(Ee(t),ln(Ic)),n}catch(e){return console.warn("Failed to sync themes from server:",e),!1}finally{this.themesSyncPromise=null}})(),this.themesSyncPromise)}async syncDraftsFromServer(){return this.draftsSyncPromise?this.draftsSyncPromise:(this.draftsSyncPromise=(async()=>{if(!_.isEnabled()||!_.hasAccessToken())return!1;try{const{drafts:e}=await _.syncDrafts("pull");let t=!1;for(const n of e){const a=await T.getDraft(n.reviewId);if(!a){await T.saveDraft({path:n.reviewId,metadata:{review_id:n.reviewId,seed:n.seed,mode:n.mode,model:n.model,created:n.createdAt,modified:n.updatedAt,archived_at:n.archivedAt,character_name:n.characterName,template_name:n.templateName,genre:n.genre,notes:n.notes,favorite:n.favorite,tags:n.tags,offspring_type:n.offspringType,custom_instructions:n.customInstructions,component_send_order:n.componentSendOrder,connected_drafts:n.connectedDraftIds,card_metadata:n.cardMetadata},assets:n.assets}),t=!0;continue}const s=new Date(a.metadata.modified||0).getTime();new Date(n.updatedAt).getTime()>s&&(await T.saveDraft({path:a.path,metadata:{...a.metadata,seed:n.seed,mode:n.mode,model:n.model,created:n.createdAt,modified:n.updatedAt,archived_at:n.archivedAt,character_name:n.characterName,template_name:n.templateName,genre:n.genre,notes:n.notes,favorite:n.favorite,tags:n.tags,offspring_type:n.offspringType,custom_instructions:n.customInstructions,component_send_order:n.componentSendOrder,connected_drafts:n.connectedDraftIds,card_metadata:n.cardMetadata},assets:n.assets}),t=!0)}return t&&ln(Nc),t}catch(e){return console.warn("Failed to sync drafts from server:",e),!1}finally{this.draftsSyncPromise=null}})(),this.draftsSyncPromise)}async getThemes(){return this.syncThemesFromServer(),this.getThemesSnapshot()}async createTheme(e){const t=ne();if(st().some(a=>a.name===e.name))throw new C(409,`Theme ${e.name} already exists`);const n={...e,description:e.description||"",author:e.author||"",tags:e.tags||[],based_on:e.based_on||"",is_builtin:!1};return t.push(n),Ee(t),D("themes"),n}async exportTheme(e){const t=st().find(n=>n.name===e);if(!t)throw new C(404,`Theme ${e} not found`);return Qt(JSON.stringify(t,null,2),`${qt(e)}.json`,"application/json")}async importTheme(e,t={}){const a={...JSON.parse(await e.text()),is_builtin:!1},s=ne(),o=s.findIndex(i=>i.name===a.name);if(o>=0)if(t.conflict_strategy==="overwrite")s[o]=a;else if(t.conflict_strategy==="rename")a.name=t.target_name||`${a.name}_copy`,s.push(a);else throw new C(409,`Theme ${a.name} already exists`);else s.push(a);return Ee(s),D("themes"),a}async updateTheme(e,t){const n=ne(),a=n.findIndex(s=>s.name===e);if(a<0)throw new C(404,`Theme ${e} is builtin or missing`);return n[a]={...n[a],...t},Ee(n),D("themes"),n[a]}async duplicateTheme(e,t){const n=st().find(a=>a.name===e);if(!n)throw new C(404,`Theme ${e} not found`);return this.createTheme({name:t.new_name,display_name:t.display_name||n.display_name,description:t.description||n.description,author:t.author||n.author,tags:t.tags||n.tags,based_on:t.based_on||n.name,colors:n.colors})}async renameTheme(e,t){return this.updateTheme(e,{display_name:t.display_name,...t.new_name!==e?{}:{}}).then(n=>{const a=ne(),s=a.findIndex(o=>o.name===e);if(s<0)throw new C(404,`Theme ${e} is builtin or missing`);return a[s]={...n,name:t.new_name},Ee(a),D("themes"),a[s]})}async deleteTheme(e){const t=ne().filter(n=>n.name!==e);return Ee(t),D("themes"),{status:"deleted",name:e}}async getModels(e){return this.loadProviderModels(e,!1)}async refreshModels(e){const t=await this.loadProviderModels(e,!0);return{status:"ok",model_count:t.models.length,error:t.error}}async generateSeeds(e){const t=[];for await(const n of J.generateSeeds(e))n.type==="complete"&&n.content&&t.push(...n.content.split(`
`).map(a=>a.trim()).filter(Boolean));return{seeds:[...new Set(t)]}}async getTemplates(){if(_.isEnabled()&&_.hasAccessToken())try{const{templates:e=[]}=await _.syncTemplates("pull"),t=ie();for(const n of e){const a=$c(n);!a||Zr(a.template.name)||t.push(a)}tt(t)}catch(e){console.warn("Failed to sync templates from server:",e)}return Rt().map(e=>e.template)}async listTemplates(){return this.getTemplates()}async getTemplate(e){const t=Z(e);if(!t)throw new C(404,`Template ${e} not found`);return t.template}async getTemplateBlueprintContents(e){const t=Z(e);if(!t)throw new C(404,`Template ${e} not found`);return{blueprint_contents:t.blueprint_contents}}async createTemplate(e){const t=ie();if(t.some(a=>a.template.name===e.name))throw new C(409,`Template ${e.name} already exists`);const n=Yr(e);return t.push(n),tt(t),D("templates"),n.template}async updateTemplate(e,t){const n=ie(),a=n.findIndex(s=>s.template.name===e);if(a<0){if(!Z(e))throw new C(404,`Template ${e} not found`);const o=Mc(t.name,e);return this.createTemplate({...t,name:o})}if(t.name!==e){const s=Z(t.name);if(s&&s.template.name!==e)throw new C(409,`Template ${t.name} already exists`)}return n[a]=Yr(t,{templateRoot:n[a].template_root}),tt(n),D("templates"),n[a].template}async deleteTemplate(e){const t=ie().filter(n=>n.template.name!==e);return tt(t),D("templates"),{status:"deleted",name:e}}async duplicateTemplate(e,t){const n=Z(e);if(!n)throw new C(404,`Template ${e} not found`);return this.createTemplate({name:t.name,version:t.version||n.template.version,description:n.template.description,assets:n.template.assets,blueprint_contents:n.blueprint_contents})}async validateTemplate(e){const t=Z(e);if(!t)throw new C(404,`Template ${e} not found`);const n=os(t.template),a=io(t.template,s=>xr(t.template.name,s)??null);return{errors:n.errors,warnings:a}}async exportTemplate(e){const t=Zr(e)??Z(e);if(!t)throw new C(404,`Template ${e} not found`);return Qt(JSON.stringify(t,null,2),`${qt(e)}.json`,"application/json")}async importTemplate(e){const t=JSON.parse(await e.text());if("template"in t&&t.template){const n=t;return this.createTemplate({name:n.template.name,version:n.template.version,description:n.template.description,assets:n.template.assets,blueprint_contents:n.blueprint_contents})}return this.createTemplate({name:t.name||e.name.replace(/\.[^.]+$/,""),version:t.version||"1.0",description:t.description||"",assets:t.assets||[],blueprint_contents:t.blueprint_contents||{}})}async getDrafts(e){const t=await T.getAllMetadata({includeArchived:!0});this.syncDraftsFromServer();const n=cs(t,e);return is(n,n.length,n,t)}async listDrafts(e){return this.getDrafts(e)}async getDraft(e){const t=await T.getDraft(e);if(!t)throw new C(404,`Draft ${e} not found`);return t}async createDraft(e){const t=e.seed.trim(),n=e.templateName.trim();if(!t)throw new C(400,"Seed is required");if(!n)throw new C(400,"Template is required");const a=crypto.randomUUID(),s=new Date().toISOString(),o={path:a,metadata:{review_id:a,seed:t,mode:e.mode??"Auto",model:A.getConfig().model,created:s,modified:s,favorite:!1,template_name:n,character_name:e.characterName?.trim()||t,genre:e.genre?.trim()||void 0,notes:e.notes?.trim()||void 0,tags:(e.tags??[]).map(i=>i.trim()).filter(Boolean),custom_instructions:e.customInstructions?.trim()||void 0,component_send_order:e.componentSendOrder,connected_drafts:(e.connectedDraftIds??[]).map(i=>i.trim()).filter(Boolean)},assets:e.assets??{}};return await T.saveDraft(o),D("drafts"),o}async updateMetadata(e,t){return await T.updateMetadata(e,t),D("drafts"),{status:"updated",draft_id:e}}async archiveDraft(e){return await T.updateMetadata(e,{archived_at:new Date().toISOString()}),D("drafts"),{status:"archived",draft_id:e}}async restoreDraft(e){return await T.updateMetadata(e,{archived_at:void 0}),D("drafts"),{status:"restored",draft_id:e}}async deleteDraft(e){return await T.deleteDraft(e),D("drafts"),{status:"deleted",draft_id:e}}async updateAsset(e,t,n,a={}){const s=await T.updateAsset(e,t,n,a);return D("drafts"),{status:s,draft_id:e,asset_name:t}}async validateDraft(e){const t=await this.getDraft(e);return Lr(t,{resolveTemplate:H})}async validatePath(e){const t=e.path.trim().replace(/^drafts\//,""),n=await T.getDraft(t);return n?Lr(n,{resolveTemplate:H}):{path:e.path,output:`VALIDATION FAILED
- ${un()?"Desktop draft storage":"Browser-only mode"} can validate saved drafts by review ID only.`,errors:"",exit_code:1,success:!1}}generate(e){return new V(async({emit:t,signal:n})=>{for await(const a of J.generate(e,{signal:n})){if(n.aborted)return;if(a.type==="chunk"&&t("chunk",{content:a.content||""}),a.type==="complete"){const s=a.asset||"",o=s?await T.getDraft(s):null;t("complete",{draft_path:s,draft_id:s,character_name:o?.metadata.character_name,duration_ms:0})}a.type==="error"&&t("error",{error:a.error||"Generation failed"})}})}generateAsset(e){return new V(async({emit:t,signal:n})=>{for await(const a of J.generateAsset(e,!0,{signal:n})){if(n.aborted)return;a.type==="chunk"&&t("chunk",{content:a.content||""}),a.type==="asset"&&t("complete",{asset_name:e.asset_name,content:a.content||""}),a.type==="error"&&t("error",{error:a.error||"Asset generation failed"})}})}previewBlueprint(e){return new V(async({emit:t,signal:n})=>{for await(const a of J.previewBlueprint(e,!0,{signal:n})){if(n.aborted)return;a.type==="chunk"&&t("chunk",{content:a.content||""}),a.type==="asset"&&t("complete",{asset_name:e.asset_name,content:a.content||"",system_prompt:a.systemPrompt||"",user_prompt:a.userPrompt||""}),a.type==="error"&&t("error",{error:a.error||"Blueprint preview failed"})}})}async finalizeGeneration(e){const t=crypto.randomUUID(),n=Te(e.assets,e.template),a={path:t,metadata:{review_id:t,seed:e.seed,mode:e.mode,model:A.getConfig().model,created:new Date().toISOString(),modified:new Date().toISOString(),favorite:!1,template_name:e.template,character_name:n},assets:e.assets};return await T.saveDraft(a),D("drafts"),{draft_path:t,draft_id:t,character_name:n,duration_ms:0}}generateBatch(e,t){return new V(async({emit:n,signal:a})=>{const s=async(o,i)=>{n("batch_start",{index:i,seed:o});try{let c="";for await(const l of J.generate({seed:o,mode:t.mode,template:t.template,selected_assets:t.selected_assets,connected_draft_ids:t.connected_draft_ids},{signal:a})){if(a.aborted)return;l.type==="complete"&&(c=l.asset||"")}n("batch_complete",{index:i,seed:o,draft_path:c})}catch(c){n("batch_error",{index:i,seed:o,error:c instanceof Error?c.message:"Batch generation failed"})}};if(t.parallel){let o=0;const i=Math.min(Math.max(t.max_concurrent??3,1),e.length||1);await Promise.all(Array.from({length:i},async()=>{for(;!a.aborted;){const c=o;if(o+=1,c>=e.length)return;await s(e[c],c)}}))}else for(let o=0;o<e.length;o+=1){if(a.aborted)return;await s(e[o],o)}a.aborted||n("complete",{status:"done"})})}async getLineage(){const e=await T.getAllMetadata();return us(e)}async analyzeSimilarity(e){const t=await this.getDraft(e.draft1_id),n=await this.getDraft(e.draft2_id),a=ls(t,n);if(!e.include_llm_analysis)return a;try{const s=await J.analyzeSimilarity(e.draft1_id,e.draft2_id),o=Array.isArray(s.story_opportunities)?s.story_opportunities.map(l=>String(l)).slice(0,4):a.relationship_suggestions,i=Array.isArray(s.scene_suggestions)?s.scene_suggestions.map(l=>String(l)).slice(0,3):a.relationship_suggestions,c=[s.narrative_dynamics,s.relationship_arc].filter(l=>typeof l=="string"&&l.trim().length>0).join(`

`)||(typeof s.raw=="string"?s.raw:"LLM analysis unavailable.");return{...a,relationship_suggestions:i,llm_analysis:{relationship_potential:c,conflict_areas:a.differences.slice(0,4),synergy_areas:a.commonalities.slice(0,4),story_hooks:o}}}catch{return a}}generateOffspring(e){return new V(async({emit:t,signal:n})=>{for await(const a of J.generateOffspring(e,{signal:n})){if(n.aborted)return;if(a.type==="status"&&t("status",{stage:a.stage,asset:a.asset,progress:a.progress}),a.type==="chunk"&&t("chunk",{content:a.content||""}),a.type==="complete"){const s=a.asset||"",o=s?await T.getDraft(s):null;t("complete",{draft_id:s,character_name:o?.metadata.character_name})}a.type==="error"&&t("error",{error:a.error||"Offspring generation failed"})}})}generateOffspringSeed(e){return new V(async({emit:t,signal:n})=>{for await(const a of J.generateOffspringSeed(e,{signal:n})){if(n.aborted)return;a.type==="status"&&t("status",{stage:a.stage,asset:a.asset,progress:a.progress}),a.type==="chunk"&&t("chunk",{content:a.content||""}),a.type==="complete"&&t("complete",{content:a.content||""}),a.type==="error"&&t("error",{error:a.error||"Offspring seed generation failed"})}})}generateLorebook(e){return new V(async({emit:t,signal:n})=>{for await(const a of J.generateLorebook(e,{signal:n})){if(n.aborted)return;a.type==="status"&&t("status",{stage:a.stage,asset:a.asset,progress:a.progress}),a.type==="chunk"&&t("chunk",{content:a.content||""}),a.type==="complete"&&t("complete",{content:a.content||""}),a.type==="error"&&t("error",{error:a.error||"Lorebook generation failed"})}})}async getExportPresets(){return Uc}async exportDraft(e){const t=await this.getDraft(e.draft_id),n=e.preset==="text"||e.preset==="combined"||e.preset==="png"?e.preset:"json",a=e.include_metadata!==!1,s=qt(t.metadata.character_name||t.metadata.seed||t.metadata.review_id),o=eo(t,n,a);return Qt(o.content,`${s}.${o.extension}`,o.contentType)}async getBlueprints(){if(_.isEnabled()&&_.hasAccessToken())try{const{blueprints:t=[]}=await _.syncBlueprints("list"),n=q();let a=n;for(const s of t){if(s.isBuiltin===!0||s.is_builtin===!0||typeof s.path!="string"||typeof s.content!="string")continue;const o=Fc(s.path);Object.prototype.hasOwnProperty.call(n,o)||(a===n&&(a={...n}),a[o]=s.content)}a!==n&&ye(a)}catch(t){console.warn("Failed to sync blueprints from server:",t)}const e=[...ae().values()];return oo(e)}async getWorlds(e){return x()?xo(e):!_.isEnabled()||!_.hasAccessToken()?{worlds:[]}:_.getWorlds(e)}async getWorld(e){return x()?gt(e):_.getWorld(e)}async createWorld(e){return x()?Oo(e):_.createWorld(e)}async updateWorld(e,t){return x()?Co(e,t):_.updateWorld(e,t)}async deleteWorld(e){return x()?Ro(e):_.deleteWorld(e)}async addWorldCharacter(e,t){return x()?Do(e,t):_.addWorldCharacter(e,t)}async updateWorldCharacter(e,t,n){return x()?Io(e,t,n):_.updateWorldCharacter(e,t,n)}async deleteWorldCharacter(e,t){return x()?No(e,t):_.deleteWorldCharacter(e,t)}async addWorldFaction(e,t){return x()?Lo(e,t):_.addWorldFaction(e,t)}async updateWorldFaction(e,t,n){return x()?Po(e,t,n):_.updateWorldFaction(e,t,n)}async deleteWorldFaction(e,t){return x()?$o(e,t):_.deleteWorldFaction(e,t)}async addWorldLocation(e,t){return x()?Fo(e,t):_.addWorldLocation(e,t)}async updateWorldLocation(e,t,n){return x()?Mo(e,t,n):_.updateWorldLocation(e,t,n)}async deleteWorldLocation(e,t){return x()?jo(e,t):_.deleteWorldLocation(e,t)}async getTimeline(e){return x()?_t(e):_.getTimeline(e)}async createTimeline(e){return x()?Uo(e):_.createTimeline(e)}async updateTimeline(e,t){return x()?Bo(e,t):_.updateTimeline(e,t)}async deleteTimeline(e){return x()?Wo(e):_.deleteTimeline(e)}async addTimelineEvent(e,t){return x()?Go(e,t):_.addTimelineEvent(e,t)}async updateTimelineEvent(e,t,n){return x()?zo(e,t,n):_.updateTimelineEvent(e,t,n)}async deleteTimelineEvent(e,t){return x()?Ho(e,t):_.deleteTimelineEvent(e,t)}async getBlueprint(e){const t=ae().get(e);if(!t)throw new C(404,`Blueprint ${e} not found`);return t}async updateBlueprint(e,t){if(ct(e)!==null&&!na(e)){const s=Lc(e,t),o=di(s.name||e,e);return this.createBlueprint(o,t)}const a=q();return a[e]=t,ye(a),D("blueprints"),this.getBlueprint(e)}async deleteBlueprint(e){if(ct(e)!==null)throw new C(400,`Cannot delete built-in blueprint ${e}`);const t=q();return delete t[e],ye(t),D("blueprints"),{status:"deleted",path:e}}async resetBlueprint(e){const t=q();delete t[e],ye(t),D("blueprints");const n=this.getBlueprint(e);if(!n)throw new C(404,`Blueprint ${e} not found`);return n}async createBlueprint(e,t){if(ae().get(e))throw new C(409,`Blueprint ${e} already exists`);const a=q();return a[e]=t,ye(a),D("blueprints"),this.getBlueprint(e)}async duplicateBlueprint(e,t){const n=ae().get(e);if(!n)throw new C(404,`Source blueprint ${e} not found`);if(ae().get(t))throw new C(409,`Blueprint ${t} already exists`);const s=q();return s[t]=n.content,ye(s),D("blueprints"),this.getBlueprint(t)}hasBlueprintOverride(e){return li(e)}getOriginalBlueprintContent(e){return ct(e)}chat(e){return new V(async({emit:t,signal:n})=>{const a=e.draft_id?await T.getDraft(e.draft_id):null,s=[a?`Current draft metadata: ${JSON.stringify(a.metadata)}`:"",e.context_asset&&a?.assets[e.context_asset]?`Focused asset (${e.context_asset}):
${a.assets[e.context_asset]}`:"",e.screen_context?`Screen context: ${JSON.stringify(e.screen_context)}`:""].filter(Boolean),o=[{role:"system",content:"You are the in-app assistant for Eidolon Simulacra, a browser-only blueprint compiler. Be concise and practical. Use provided draft or screen context when relevant."},...s.length>0?[{role:"system",content:s.join(`

`)}]:[],...e.messages],i=await Zt(o);let c="";for await(const l of i){if(n.aborted)return;if(l.content&&(c+=l.content,t("chunk",{content:l.content})),l.done)break}t("complete",{content:c})})}refine(e){return new V(async({emit:t,signal:n})=>{const a=await this.getDraft(e.draft_id),s=a.assets[e.asset];if(!s)throw new C(404,`Asset ${e.asset} not found in draft`);const o=[{role:"system",content:"Rewrite the provided asset according to the user request. Return only the revised asset content with no extra commentary."},{role:"user",content:`Draft seed: ${a.metadata.seed}
Asset: ${e.asset}

Current content:
${s}

Revision request:
${e.message}`}],i=await Zt(o);let c="";for await(const l of i){if(n.aborted)return;if(l.content&&(c+=l.content,t("chunk",{content:l.content})),l.done)break}t("complete",{content:c})})}optimizeText(e){return new V(async({emit:t,signal:n})=>{const a=Ya(e),s=await Zt(a);let o="";for await(const i of s){if(n.aborted)return;if(i.content&&(o+=i.content,t("chunk",{content:i.content})),i.done)break}t("complete",{content:o})})}}const gd=new Kc;export{Qc as $,Ii as A,T as B,Xc as C,Nc as D,tc as E,rc as F,J as G,X as H,dd as I,ac as J,sc as K,pd as L,mr as M,id as N,cd as O,xr as P,He as Q,gn as R,Mi as S,Ic as T,dn as U,Te as V,vo as W,mt as X,On as Y,Ae as Z,Ri as _,gd as a,Di as a0,Ko as a1,Zc as a2,td as a3,ld as a4,Vo as a5,ed as a6,rd as a7,wa as b,A as c,$s as d,Fi as e,qc as f,pe as g,De as h,nd as i,ji as j,ad as k,sd as l,ud as m,ur as n,md as o,Ki as p,D as q,fd as r,_ as s,hd as t,Lt as u,od as v,Vi as w,Jc as x,ec as y,ue as z};
//# sourceMappingURL=api-DHdZ2VxV.js.map
