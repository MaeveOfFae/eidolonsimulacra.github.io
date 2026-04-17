const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Home-R7gtchzu.js","assets/react-vendor-C34M-SVW.js","assets/query-vendor-B1y7cKzn.js","assets/vendor-CckTvgTH.js","assets/useAssistantContext-CmNW0Dkg.js","assets/router-vendor-BUgBkwhx.js","assets/storage-vendor-CKqr1NrK.js","assets/ui-utils-vendor-DeRmtv56.js","assets/Generation-CcsDavTA.js","assets/generation-session-uaOA9dPo.js","assets/GenerationProgress-BnNUxsWB.js","assets/AssetRegenerator-BAWByjON.js","assets/BlueprintPanel-DLrym_nq.js","assets/featureSelection-bAEkKlXg.js","assets/SeedGenerator-Cl0kqnct.js","assets/Validation-BJHhr_Pe.js","assets/Drafts-mYe4_fcK.js","assets/SyncControls-CtNVEBXa.js","assets/VersionHistoryPanel-DmE-DRxY.js","assets/GenerationHistoryPanel-W5AxykBW.js","assets/Review-CYdD2T4p.js","assets/download-B9JKrFNp.js","assets/Blueprints-CstetjkI.js","assets/blueprintLint-BDDPnn8W.js","assets/BlueprintEditor-DMsLgMB-.js","assets/editor-vendor-4PMdRp_6.js","assets/markdownComponents-D59ucdPC.js","assets/markdown-vendor-Bf2k1K4o.js","assets/Templates-fDc17j2t.js","assets/Lineage-CNlrIyeL.js","assets/Similarity-nqcDOgVn.js","assets/Offspring-DnacjKQq.js","assets/Worlds-koZEDHl7.js","assets/Timelines-BOJpMLOC.js","assets/Events-BilWsqF8.js","assets/Settings-Dri4BVs5.js","assets/ThemeStudio-CDN-Tcv_.js","assets/DataManager-BTJpdCqE.js","assets/BatchGenerate-Dbu2_2G_.js","assets/AuthPage-D_aoW2DO.js","assets/About-CmffCWAv.js","assets/DocumentPage-Ch1D1Aoq.js","assets/HelpCenterPage-B4NJI0Io.js","assets/WhatsNewPage-BBFSTfaQ.js","assets/LicensePage-Bp-k6ot1.js","assets/TermsPage-B500Z7IU.js","assets/PrivacyPage-B8JHBGP-.js","assets/SecurityPage-BMoz9jDk.js","assets/CodeOfConductPage-DjN1kk22.js"])))=>i.map(i=>d[i]);
import{r as h,j as i,d as Bn}from"./react-vendor-C34M-SVW.js";import{X as Re,B as Hn,T as Kn,A as qt,C as Gn,h as Wn,j as De,S as zn,k as qn,l as Vn,H as Yn,m as Jn,F as Xn,o as Qn,p as Zn,q as Vt,w as Or,L as kt,x as es,G as Ir,y as ts,z as Pr,D as rs,E as St,U as ns,I as ss,J as as,K as os,P as is,N as cs,O as ls,R as ds,W as us,Y as Yt,Z as ps,_ as ms,$ as hs}from"./vendor-CckTvgTH.js";import{u as Nr,a as le,Q as fs}from"./query-vendor-B1y7cKzn.js";import{D as Le}from"./storage-vendor-CKqr1NrK.js";import{t as gs,c as ys}from"./ui-utils-vendor-DeRmtv56.js";import{L as B,u as bs,a as $e,R as ws,b as T,H as vs}from"./router-vendor-BUgBkwhx.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(s){if(s.ep)return;s.ep=!0;const a=t(s);fetch(s.href,a)}})();const _s="modulepreload",xs=function(r){return"/"+r},Jt={},C=function(e,t,n){let s=Promise.resolve();if(t&&t.length>0){let o=function(d){return Promise.all(d.map(u=>Promise.resolve(u).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};document.getElementsByTagName("link");const c=document.querySelector("meta[property=csp-nonce]"),l=c?.nonce||c?.getAttribute("nonce");s=o(t.map(d=>{if(d=xs(d),d in Jt)return;Jt[d]=!0;const u=d.endsWith(".css"),p=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${p}`))return;const m=document.createElement("link");if(m.rel=u?"stylesheet":_s,u||(m.as="script"),m.crossOrigin="",m.href=d,l&&m.setAttribute("nonce",l),document.head.appendChild(m),u)return new Promise((b,f)=>{m.addEventListener("load",b),m.addEventListener("error",()=>f(new Error(`Unable to preload CSS for ${d}`)))})}))}function a(o){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=o,window.dispatchEvent(c),!c.defaultPrevented)throw o}return s.then(o=>{for(const c of o||[])c.status==="rejected"&&a(c.reason);return e().catch(a)})},Xt="getting-started",Et="getting-started",ks="protect-your-work",Ss="review-and-export",Es="draft-library",Ts="validation-workflow",As="blueprints-safety",lc=[{id:"browser-storage",title:"Understand where your work lives",description:"Drafts, templates, settings, and theme edits stay in this browser profile by default. Clearing browser storage removes them unless you export a backup first.",to:"/about",actionLabel:"Read about browser storage"},{id:"api-keys",title:"Set up an API key",description:"Open Settings, pick the provider you actually use, and paste the provider key you want the browser app to send with generation requests.",to:"/settings",actionLabel:"Open Settings"},{id:"template",title:"Choose a template before you generate",description:"Templates define which assets are produced and what export structure must be preserved. Start with the built-in template before making custom ones.",to:"/templates",actionLabel:"Review templates"},{id:"generate",title:"Create your first draft",description:"Go to Generate, enter a seed, confirm the content mode, and let the app produce a full draft pack you can review asset by asset.",to:"/generate",actionLabel:"Start generating"},{id:"review",title:"Review before exporting",description:"Open the saved draft, check for consistency and missing details, and refine anything that does not fit the character you want to keep.",to:"/drafts",actionLabel:"Open draft library"},{id:"export",title:"Export with browser expectations in mind",description:"On mobile or in a browser, export may use a share sheet, a new tab, or the download tray instead of a desktop-style save dialog.",to:"/data",actionLabel:"See backup and export tools"}],Cs=[{id:"what-is-a-template",title:"Templates vs. blueprints",category:"Concepts",summary:"Templates choose the asset graph. Blueprints define how each asset is generated. Most users should start with templates and leave blueprints alone until they understand the workflow.",bullets:["Templates decide which files exist and in what order they depend on each other.","Blueprints are stricter and can break parser-facing output if edited casually.","Use the built-in template first, then move to custom templates only after you understand review and export."],actions:[{label:"Open templates",to:"/templates"},{label:"Open blueprints",to:"/blueprints"}]},{id:"how-export-works",title:"How export works in the browser",category:"Getting Started",summary:"Browser export behavior depends on the device and browser. Normal web apps do not always get a native filename prompt.",bullets:["Desktop browsers often save directly to Downloads.","Mobile browsers may show a share sheet or open a new tab instead of prompting for a filename.","Use Data Manager exports when you want a full backup of browser-stored content."],actions:[{label:"Open Data Manager",to:"/data"},{label:"Open draft review",to:"/drafts"}]},{id:"api-key-setup",title:"API key setup without guesswork",category:"Getting Started",summary:"The browser app talks to your chosen model provider using the API key you enter in Settings. No local backend service is required for the current web runtime.",bullets:["Choose the provider you really use before selecting a model.","If a key looks corrupted or includes invisible characters, the app will reject it.","Persist keys only on devices you control."],actions:[{label:"Open Settings",to:"/settings"},{label:"Read About storage",to:"/about"}]},{id:"first-draft-review",title:"How to review a first draft",category:"Concepts",summary:"A good review checks structure first, then consistency, then polish. Do not export just because generation finished.",bullets:["Confirm the character name, major facts, and tone stay consistent across assets.","Watch for unresolved placeholders or format drift in strict assets.","Use refinement and validation before exporting to a target format."],actions:[{label:"Open Library",to:"/drafts"},{label:"Open Validation",to:"/validation"}]},{id:"common-blockers",title:"Common blockers and what to do next",category:"Troubleshooting",summary:"Most early problems are configuration or browser-behavior issues, not generator bugs.",bullets:["If generation fails immediately, verify the provider, model, and API key in Settings.","If export feels silent on mobile, check for a share sheet, a new tab, or the browser download tray.","If you lose drafts after clearing browser data, restore from a JSON backup in Data Manager."],actions:[{label:"Open Settings",to:"/settings"},{label:"Open Data Manager",to:"/data"}]}],dc=["Getting Started","Concepts","Troubleshooting"],jr=[{id:Et,title:"Getting Started Tour",summary:"Walk through the safest first-run path from setup to a first export-ready draft.",audience:"New users who want the app to tell them what to do next.",estimatedMinutes:6,steps:[{id:"start-home",title:"Start from Home",description:"Home is the launch surface for the beginner path. It tells you what the current browser app can do and where to go next.",to:"/",routeLabel:"Home",bullets:["Use Home when you are not sure which workflow to open first.","The browser profile you are using is the current storage location for drafts and settings."]},{id:"set-up-provider",title:"Set up provider access",description:"Open Settings before you generate anything. This avoids the most common first-run failure: trying to generate with a missing or mismatched provider key.",to:"/settings",routeLabel:"Settings",targetId:"settings-api-keys",targetLabel:"API Keys",bullets:["Pick the provider you actually use.","Enter the API key you want the browser app to send.","Use trusted devices if you choose to persist keys locally."]},{id:"choose-template",title:"Choose the template first",description:"Templates decide which assets exist and how the draft will export. Make this choice before refining the prompt or seed.",to:"/templates",routeLabel:"Templates",bullets:["Start with the built-in template unless you already understand custom template behavior.","Template changes are structural, not cosmetic."]},{id:"generate-draft",title:"Generate the first draft",description:"Once provider setup and template choice are in place, Generate becomes the first full workflow step.",to:"/generate",routeLabel:"Generate",targetId:"generation-submit",targetLabel:"Generate Character button",bullets:["Enter a concrete seed instead of a vague one-liner.","Treat the first result as a draft to review, not a final export."]},{id:"review-library",title:"Review saved drafts",description:"The library is where you reopen saved work and decide what should move into deeper review, validation, or export.",to:"/drafts",routeLabel:"Library",bullets:["Open the library after generation to confirm the draft actually saved.","Use draft review before export when details need cleanup."]},{id:"protect-work",title:"Protect your work with backups",description:"Data Manager is the safety net for browser-local storage. Use it before clearing browser data or moving to another device.",to:"/data",routeLabel:"Data Manager",bullets:["Export backups before risky changes.","Treat API key exports as sensitive data."]}]},{id:ks,title:"Protect Your Work Tour",summary:"Learn the browser-storage model, backup path, and the pages that matter when you need to avoid losing work.",audience:"Users who are worried about where data lives and how to recover it safely.",estimatedMinutes:4,steps:[{id:"storage-model",title:"Confirm the storage model",description:"About explains that the current product surface is the browser app. That matters because drafts and configuration live in browser storage by default.",to:"/about",routeLabel:"About",bullets:["Do not assume a local backend or desktop shell is saving your work for you.","Treat this browser profile as the place where your work currently lives."]},{id:"backup-tools",title:"Use backup tools intentionally",description:"Data Manager is where you export or restore browser-stored content when you need to migrate, recover, or safeguard work.",to:"/data",routeLabel:"Data Manager",bullets:["Back up before clearing site data.","Use restore only with files you trust and understand."]},{id:"privacy-expectations",title:"Understand privacy expectations",description:"Privacy explains the difference between local browser storage and the provider requests you intentionally send during generation.",to:"/privacy",routeLabel:"Privacy",bullets:["Local storage and provider traffic are different concerns.","Backups can still expose sensitive material if handled carelessly."]},{id:"secure-settings",title:"Review secure settings habits",description:"Settings is where you control provider keys and persistence choices, so it is part of the data-protection workflow too.",to:"/settings",routeLabel:"Settings",targetId:"settings-api-keys",targetLabel:"API Keys",bullets:["Persist keys only on devices you control.","If something feels unsafe or unclear, return to Help Center before continuing."]}]},{id:Ss,title:"Review and Export Tour",summary:"Walk through the review controls that matter before you hand a draft off to export.",audience:"Users who already generated a draft and need a safe review path before exporting.",estimatedMinutes:5,steps:[{id:"review-actions",title:"Start from the review action bar",description:"The review header is the control surface for validation, favoriting, export, and draft deletion.",to:"/drafts/",routeLabel:"Draft Review",matchMode:"prefix",targetId:"review-actions",targetLabel:"Review actions",bullets:["Do not export immediately if you have not checked the draft structure yet.","Keep destructive actions separate from export so you do not rush them."]},{id:"review-validate",title:"Validate before export",description:"Use validation before exporting when the draft has been edited or when the template has strict structure requirements.",to:"/drafts/",routeLabel:"Draft Review",matchMode:"prefix",targetId:"review-validate",targetLabel:"Validate button",bullets:["Validation catches structural problems that a quick read can miss.","Treat missing required pieces or unresolved placeholders as blockers."]},{id:"review-assets",title:"Read the assets, not just the title",description:"The asset list is where consistency problems usually reveal themselves. Check names, tone, and required sections across multiple assets.",to:"/drafts/",routeLabel:"Draft Review",matchMode:"prefix",targetId:"review-assets",targetLabel:"Draft assets",bullets:["A draft can look good in one asset while still being broken elsewhere.","Use targeted editing when only one asset drifts."]},{id:"review-export",title:"Export with browser expectations in mind",description:"When the draft is coherent, use Export. On browser and mobile surfaces this may hand off through a share sheet, new tab, or downloads tray instead of a native save dialog.",to:"/drafts/",routeLabel:"Draft Review",matchMode:"prefix",targetId:"review-export",targetLabel:"Export button",bullets:["The app now tells you which handoff method was used.","If export feels silent on mobile, check share and browser download surfaces."]},{id:"export-choose-preset",title:"Choose the export preset inside the modal",description:"Once the export modal opens, choose the preset that matches the system you are exporting for instead of blindly taking the first option.",to:"/drafts/",routeLabel:"Export Modal",matchMode:"prefix",targetId:"export-preset-selection",targetLabel:"Export preset selection",bullets:["Presets change output structure and destination compatibility.","If you are unsure, review the preset description before continuing."]},{id:"export-confirm",title:"Confirm export and watch the handoff result",description:"Use the Export button after the preset is selected, then follow the browser-specific save or share flow the app reports back to you.",to:"/drafts/",routeLabel:"Export Modal",matchMode:"prefix",targetId:"export-confirm",targetLabel:"Export confirm button",bullets:["A successful export in the browser may still look different from a desktop save dialog.","Use the success message to know whether the file went to share, download, or a new tab."]}]},{id:Es,title:"Draft Library Tour",summary:"Learn how to use the library as a review queue instead of a pile of saved outputs.",audience:"Users who generated drafts and need to understand where to reopen, compare, and triage them.",estimatedMinutes:4,steps:[{id:"draft-library-overview",title:"Treat Drafts as your working library",description:"The library is not just storage. It is where you decide which drafts are worth opening for deeper review or export.",to:"/drafts",routeLabel:"Library",targetId:"drafts-list",targetLabel:"Draft list",bullets:["Open the library from here after generation instead of relying on memory or browser history.","Use names, tags, and favorites to keep the library readable as it grows."]},{id:"draft-workbench",title:"Use the workbench for comparison and checks",description:"The workbench keeps review aids in view so you can compare outputs and think before opening a draft for editing.",to:"/drafts",routeLabel:"Library",targetId:"drafts-workbench",targetLabel:"Draft workbench",bullets:["Comparison and review tools help you choose the better draft before you start editing.","Staged placeholders are visible here, but only the active tools should drive your next action."]},{id:"draft-review-hand-off",title:"Open one draft for real review",description:"Once a draft looks worth keeping, open it and continue with validation, editing, and export on the review page.",to:"/drafts",routeLabel:"Drafts",targetId:"drafts-open-review",targetLabel:"Draft review links",bullets:["The library is the triage layer. The review page is the editing and export layer.","Back up important work before risky cleanup or browser-data changes."]}]},{id:Ts,title:"Validation Workflow Tour",summary:"Walk through the validation screen so structural checks become a normal part of review instead of a last-minute panic step.",audience:"Users who edit drafts or export to strict formats and need to know when validation matters.",estimatedMinutes:4,steps:[{id:"validation-overview",title:"Use validation as a structural checkpoint",description:"Validation is where you confirm the draft still matches the expected structure before you export or hand it off to another tool.",to:"/validation",routeLabel:"Validation",targetId:"validation-draft-panel",targetLabel:"Validate saved draft panel",bullets:["Run validation after major edits, not only after generation.","Treat structural failures as blockers instead of cosmetic warnings."]},{id:"validation-run",title:"Choose the simplest input path",description:"Most users should validate a saved draft by review ID instead of typing a manual path unless they know exactly what they are checking.",to:"/validation",routeLabel:"Validation",targetId:"validation-draft-run",targetLabel:"Validate Draft button",bullets:["Use saved-draft validation for normal browser workflows.","Manual paths are useful when you are investigating a specific stored location."]},{id:"validation-results",title:"Read the results for real blockers",description:"The result panel tells you whether the draft passed and shows the lines that need attention before export.",to:"/validation",routeLabel:"Validation",targetId:"validation-results",targetLabel:"Validation results",bullets:["Fix missing required sections and unresolved placeholders first.","If the result passes, move back to review or export with more confidence."]}]},{id:As,title:"Blueprint Safety Tour",summary:"Learn when to leave blueprints alone, when to inspect them carefully, and where to bail out to safer surfaces.",audience:"Non-technical or first-time users who might wander into blueprints before understanding template contracts.",estimatedMinutes:4,steps:[{id:"blueprints-search",title:"Treat Blueprints as inspection first, editing second",description:"Start by searching and reading. Do not jump into editing unless you know why a blueprint needs to change.",to:"/blueprints",routeLabel:"Blueprints",targetId:"blueprints-search",targetLabel:"Blueprint search",bullets:["Search helps you understand which blueprint family you are looking at.","Reading the path and description usually tells you whether the file is core, system, or template-specific."]},{id:"blueprints-tools",title:"Use browser safety tools before editing",description:"The lint and sandbox tools exist so you can inspect behavior without immediately rewriting contract-heavy text.",to:"/blueprints",routeLabel:"Blueprints",targetId:"blueprints-tools",targetLabel:"Blueprint tools",bullets:["Use lint and preview to reduce guesswork.","A readable blueprint is not automatically a safe blueprint."]},{id:"blueprints-exit-ramp",title:"Know the safer alternative",description:"If you are trying to change workflow shape rather than raw blueprint text, templates are usually the safer surface for early users.",to:"/blueprints",routeLabel:"Blueprints",targetId:"blueprints-list",targetLabel:"Blueprint list",bullets:["Do not edit a blueprint just because you found the right file name.","When in doubt, go back to Templates or Help Center before making changes."]}]}],Os=[{id:"home",match:"/",matchMode:"exact",title:"Home help",summary:"Use Home as the launch surface for first-run guidance, recent updates, quick actions, and your next step into the workflow.",keyActions:["Start with the Getting Started guide if this is your first run.","Use Quick Actions to jump straight into Generate, Drafts, or Seeds.","Check What’s New when behavior changes after an update."],pitfalls:["Do not assume your work syncs automatically. This browser profile is the storage location by default.","Do not skip Settings if generation cannot start; most early issues begin there."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"generate",match:"/generate",matchMode:"exact",title:"Generate help",summary:"Generation is where you choose the template, seed, provider, and content mode that become a full draft pack.",keyActions:["Choose the template before you spend time refining the seed.","Keep the seed concrete enough that the model has something to preserve across assets.","Use review after generation instead of trying to perfect everything in one pass."],pitfalls:["A missing or invalid API key will usually fail generation before useful output appears.","Changing template assumptions late can invalidate your review expectations."],actions:[{label:"Open Settings",to:"/settings"},{label:"Open templates",to:"/templates"}],relatedTopicIds:["api-key-setup","what-is-a-template"]},{id:"seed-generator",match:"/seed-generator",matchMode:"exact",title:"Seed Generator help",summary:"Use Seed Generator when you need raw concept material before you commit to a full draft workflow.",keyActions:["Generate multiple seeds and keep the one with the clearest identity.","Pass the best seed into Generate instead of trying to export from here."],pitfalls:["A seed is not a finished draft; it still needs a template and generation pass."],actions:[{label:"Open Generate",to:"/generate"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["common-blockers"]},{id:"validation",match:"/validation",matchMode:"exact",title:"Validation help",summary:"Validation helps you catch structural issues before export, especially on strict templates or edited drafts.",keyActions:["Validate after major edits and before export.","Treat missing required assets or unresolved placeholders as blockers, not cosmetic warnings."],pitfalls:["Passing generation does not guarantee export readiness."],actions:[{label:"Open Library",to:"/drafts"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["first-draft-review","common-blockers"]},{id:"batch",match:"/batch",matchMode:"exact",title:"Batch help",summary:"Batch generation is for running multiple drafts in sequence without driving the app one draft at a time.",keyActions:["Keep concurrency conservative until you know your provider limits.","Use batch for throughput, not for first-time learning of the workflow."],pitfalls:["High concurrency can make failures harder to interpret."],actions:[{label:"Open Generate",to:"/generate"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["common-blockers"]},{id:"drafts",match:"/drafts",matchMode:"exact",title:"Library help",summary:"The library is where you reopen saved work, check metadata, and decide which draft should move into review or export.",keyActions:["Open the review page for the draft you want to polish or export.","Use metadata and favorites to keep the library manageable as it grows."],pitfalls:["Deleting a draft removes the browser-local copy unless you already exported or backed it up."],actions:[{label:"Open Data Manager",to:"/data"},{label:"Open Validation",to:"/validation"}],relatedTopicIds:["first-draft-review","common-blockers"]},{id:"draft-review",match:"/drafts/",matchMode:"prefix",title:"Draft review help",summary:"Review is where you inspect generated assets, refine weak spots, validate structure, and export only when the pack is coherent.",keyActions:["Check the character name, core traits, and tone across multiple assets before exporting.","Use refine tools for targeted edits instead of regenerating the whole draft immediately.","Validate after meaningful edits."],pitfalls:["A draft that reads well in one asset can still fail export because another asset drifted or broke format.","Do not ignore placeholders or empty required sections in strict assets."],actions:[{label:"Open Validation",to:"/validation"},{label:"Open Data Manager",to:"/data"}],relatedTopicIds:["first-draft-review","how-export-works"]},{id:"templates",match:"/templates",matchMode:"exact",title:"Templates help",summary:"Templates define which assets exist, how they depend on each other, and what export structure needs to remain valid.",keyActions:["Use the built-in template first so you understand the app’s baseline workflow.","Treat template changes as structural decisions, not cosmetic ones."],pitfalls:["Changing template expectations late can invalidate assumptions in review and export."],actions:[{label:"Open Generate",to:"/generate"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["what-is-a-template"]},{id:"blueprints",match:"/blueprints",matchMode:"exact",title:"Blueprints help",summary:"Blueprints are advanced prompt/compiler definitions. They are powerful, but they are not a safe first editing surface for non-technical users.",keyActions:["Prefer templates unless you are intentionally changing generation structure.","Preserve parser-facing formats and placeholders carefully when editing."],pitfalls:["A casual blueprint edit can break validation or export even if the text still looks readable."],actions:[{label:"Open templates",to:"/templates"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["what-is-a-template"]},{id:"blueprint-editor",match:"/blueprints/edit",matchMode:"prefix",title:"Blueprint editor help",summary:"The editor is for advanced changes to blueprint text and should be treated as a strict contract surface, not a freeform note field.",keyActions:["Keep output structures intact when the target asset expects rigid formatting.","Validate edits before using them in a generation workflow."],pitfalls:["Unfilled placeholders, broken structure, or dependency mistakes can cascade through later assets."],actions:[{label:"Open Validation",to:"/validation"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["what-is-a-template","common-blockers"]},{id:"similarity",match:"/similarity",matchMode:"exact",title:"Similarity help",summary:"Similarity helps you inspect overlap between drafts so you can catch repeats, redundancy, or near-duplicates.",keyActions:["Use it after building a larger draft library or batch output set."],pitfalls:["Similarity is analysis support, not a replacement for human review."],actions:[{label:"Open Library",to:"/drafts"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["first-draft-review"]},{id:"offspring",match:"/offspring",matchMode:"exact",title:"Offspring help",summary:"Offspring combines parent drafts into a derivative result, so parent quality and consistency matter before you start.",keyActions:["Choose parents that are already reviewed and structurally healthy."],pitfalls:["Using unstable or contradictory parents gives unstable offspring output."],actions:[{label:"Open Library",to:"/drafts"},{label:"Open Validation",to:"/validation"}],relatedTopicIds:["first-draft-review"]},{id:"lineage",match:"/lineage",matchMode:"exact",title:"Lineage help",summary:"Lineage shows how related drafts connect over time so you can track derivations and review ancestry.",keyActions:["Use lineage when you need provenance, not when you need direct editing."],pitfalls:["Lineage helps you understand relationships, but it does not repair structural draft issues on its own."],actions:[{label:"Open Library",to:"/drafts"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["first-draft-review"]},{id:"themes",match:"/themes",matchMode:"exact",title:"Themes help",summary:"Themes control the browser UI appearance. Runtime theme behavior lives in the app, not in the reference TOML files under resources.",keyActions:["Use presets as a base and save customizations intentionally."],pitfalls:["Editing reference theme files in the repo is not the same as changing the live browser theme runtime."],actions:[{label:"Open Settings",to:"/settings"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["common-blockers"]},{id:"settings",match:"/settings",matchMode:"exact",title:"Settings help",summary:"Settings controls provider access, model defaults, browser persistence choices, theme behavior, and tutorial/help preferences.",keyActions:["Start here if generation fails, models are missing, or you are unsure where data is stored.","Use the Help and Tutorials section to restart the starter guide or re-enable tips."],pitfalls:["Saving API keys in browser storage is convenient, but it should be limited to devices you trust."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open About",to:"/about"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"data",match:"/data",matchMode:"exact",title:"Data Manager help",summary:"Data Manager is the safety net for browser-local drafts, config, and backups.",keyActions:["Export backups before clearing browser data or changing devices.","Treat API-key export files as sensitive data."],pitfalls:["Clearing browser storage without a backup removes local drafts and settings."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["how-export-works","common-blockers"]},{id:"whats-new",match:"/whats-new",matchMode:"exact",title:"What’s New help",summary:"Use this page to understand recent product changes and staged roadmap work before assuming the workflow still behaves the same way.",keyActions:["Check release notes after updates when a flow feels different."],pitfalls:["Roadmap items are not the same as implemented features."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Home",to:"/"}],relatedTopicIds:["common-blockers"]},{id:"about",match:"/about",matchMode:"exact",title:"About help",summary:"About explains the current browser-first product surface, storage model, and the difference between the app runtime and repo reference assets.",keyActions:["Use About when you need to confirm how the browser app stores or handles your work."],pitfalls:["Do not assume older Python/backend flows exist in the current product unless you can see them in the app."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"help-center",match:"/help",matchMode:"exact",title:"Help Center help",summary:"Help Center is the structured fallback when you want answers without guessing which page or workflow to visit next.",keyActions:["Start with the Getting Started section if you are still learning the workflow.","Use concepts when the terminology is the blocker.","Use troubleshooting when the app behavior does not match your expectation."],pitfalls:["The Help Center explains the browser app. It does not guarantee parity with future mobile or desktop surfaces."],actions:[{label:"Open Home",to:"/"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"license",match:"/license",matchMode:"exact",title:"License help",summary:"License explains the repository licensing terms and should be read when you need usage or redistribution clarity.",keyActions:["Use this page when you need the exact license text or attribution expectations."],pitfalls:["License answers legal distribution questions, not workflow or storage questions."],actions:[{label:"Open About",to:"/about"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["common-blockers"]},{id:"terms",match:"/terms",matchMode:"exact",title:"Terms help",summary:"Terms of Use covers the rules around using the app, exports, and generated content through the current browser surface.",keyActions:["Use this page when you need policy guidance rather than workflow guidance."],pitfalls:["Terms is not a how-to page. Use Help Center for workflow questions."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Privacy",to:"/privacy"}],relatedTopicIds:["common-blockers"]},{id:"privacy",match:"/privacy",matchMode:"exact",title:"Privacy help",summary:"Privacy explains what stays in browser storage, what reaches provider APIs, and what sensitive data you are responsible for handling carefully.",keyActions:["Use this page when you need to understand local storage, API key handling, or data exposure to providers."],pitfalls:["Browser-local does not mean impossible to lose. You still need backups if the data matters."],actions:[{label:"Open Data Manager",to:"/data"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"security",match:"/security",matchMode:"exact",title:"Security help",summary:"Security covers vulnerability reporting and safe handling of provider keys and browser-stored configuration.",keyActions:["Use this page when the question is about secure handling or vulnerability reporting."],pitfalls:["Security policy does not replace provider-specific account protection practices."],actions:[{label:"Open Settings",to:"/settings"},{label:"Open Privacy",to:"/privacy"}],relatedTopicIds:["api-key-setup"]},{id:"code-of-conduct",match:"/code-of-conduct",matchMode:"exact",title:"Code of Conduct help",summary:"Code of Conduct covers collaboration expectations for the repository and project community spaces.",keyActions:["Use this page for contribution and interaction standards, not workflow setup."],pitfalls:["Community rules are separate from app usage or licensing terms."],actions:[{label:"Open About",to:"/about"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["common-blockers"]}],Is=[{route:"/",pageHelpId:"home",coverage:"complete"},{route:"/generate",pageHelpId:"generate",coverage:"complete"},{route:"/seed-generator",pageHelpId:"seed-generator",coverage:"complete"},{route:"/validation",pageHelpId:"validation",coverage:"complete"},{route:"/batch",pageHelpId:"batch",coverage:"complete"},{route:"/drafts",pageHelpId:"drafts",coverage:"complete"},{route:"/drafts/:id",pageHelpId:"draft-review",coverage:"complete"},{route:"/drafts/:id/assets/:assetName/regenerate",pageHelpId:"draft-review",coverage:"complete"},{route:"/templates",pageHelpId:"templates",coverage:"complete"},{route:"/blueprints",pageHelpId:"blueprints",coverage:"complete"},{route:"/blueprints/edit/*",pageHelpId:"blueprint-editor",coverage:"complete"},{route:"/lineage",pageHelpId:"lineage",coverage:"complete"},{route:"/similarity",pageHelpId:"similarity",coverage:"complete"},{route:"/offspring",pageHelpId:"offspring",coverage:"complete"},{route:"/themes",pageHelpId:"themes",coverage:"complete"},{route:"/settings",pageHelpId:"settings",coverage:"complete"},{route:"/data",pageHelpId:"data",coverage:"complete"},{route:"/about",pageHelpId:"about",coverage:"complete"},{route:"/help",pageHelpId:"help-center",coverage:"complete"},{route:"/whats-new",pageHelpId:"whats-new",coverage:"complete"},{route:"/license",pageHelpId:"license",coverage:"complete"},{route:"/terms",pageHelpId:"terms",coverage:"complete"},{route:"/privacy",pageHelpId:"privacy",coverage:"complete"},{route:"/security",pageHelpId:"security",coverage:"complete"},{route:"/code-of-conduct",pageHelpId:"code-of-conduct",coverage:"complete"}];Is.map(r=>({path:r.route,pageHelpId:r.pageHelpId}));function Ps(r){const e=Os.filter(t=>t.matchMode==="exact"?r===t.match:r.startsWith(t.match));return e.length===0?null:e.sort((t,n)=>n.match.length-t.match.length)[0]??null}function tt(r){return jr.find(e=>e.id===r)??null}function Tt(r,e){return(e.matchMode??"exact")==="exact"?r===e.to:r.startsWith(e.to)}const Ns=[{id:"generation-workflow",title:"Generation Workflow",status:"placeholder",ownerFiles:["packages/web/src/components/generation/Generation.tsx","packages/web/src/components/generation/GenerationProgress.tsx","packages/web/src/components/generation/SeedGenerator.tsx","packages/web/src/components/batch/BatchGenerate.tsx","packages/web/src/lib/services/generation.ts"],placeholderFiles:["packages/web/src/components/generation/ApprovalWorkflowPlaceholder.tsx","packages/web/src/components/generation/CheckpointSessionPlaceholder.tsx","packages/web/src/lib/services/generation-scenarios.ts","packages/web/src/lib/services/seed-remix.ts"],items:["Asset-by-asset approval workflow before downstream generation continues","Checkpointed generation sessions that let users pause, resume, or restart from any approved asset","Partial regeneration flow for replacing one asset without discarding the rest of the draft","Multi-model comparison runs for the same seed and template","Batch generation queue with priorities, retry policies, and run history","Scenario presets for common generation goals such as fast drafting, high-structure output, or art-focused packs","Constraint builder for generation goals like tone, genre, style, and content level","Seed remix feature that combines multiple saved concepts into one prompt","Seed idea board with saved prompts, themes, and inspiration sets","Assistant suggestions for strengthening weak or underspecified seeds","Offline/local-model optimized workflow presets","Guided first-run generation flow for helping new users reach a valid draft quickly"]},{id:"review-and-editing",title:"Review and Editing",status:"placeholder",ownerFiles:["packages/web/src/components/drafts/Review.tsx","packages/web/src/components/drafts/Drafts.tsx","packages/web/src/components/common/ChatPanel.tsx","packages/web/src/components/drafts/DraftComparisonPanel.tsx","packages/web/src/components/drafts/ReviewChecklistPanel.tsx","packages/web/src/components/drafts/VersionHistoryPanel.tsx"],placeholderFiles:[],items:["Merge-ready draft comparison workflow for comparing alternate generations and promoting selected assets","Persistent structured review checklist with asset-level scoring, notes, and export gating","Asset health scoring based on completeness, consistency, and format compliance","Provenance view showing which upstream assets influenced each generated asset","Inline review notes attached to individual assets","Asset-level commenting with a simple resolved/unresolved state","Draft branching system for exploring alternate versions of the same character","Draft merge tools for selectively combining assets from different branches","Deeper version history with restore points and revision diffs","Focus mode for reviewing one asset with its immediate dependencies visible","Assistant tools for rewriting a single asset while preserving established canon","Read-only review links for sharing a draft state without enabling edits"]},{id:"templates-and-blueprints",title:"Templates and Blueprints",status:"placeholder",ownerFiles:["packages/web/src/components/templates/Templates.tsx","packages/web/src/components/templates/TemplateWizard.tsx","packages/web/src/components/templates/TemplateComparisonPanel.tsx","packages/web/src/components/blueprints/Blueprints.tsx","packages/web/src/components/blueprints/BlueprintEditor.tsx","packages/web/src/components/blueprints/BlueprintLintPanel.tsx","packages/web/src/components/blueprints/BlueprintSandboxPanel.tsx"],placeholderFiles:["packages/web/src/components/templates/TemplateMigrationPlaceholder.tsx"],items:["Guided template creation wizard in the web UI","Template migration assistant for updating older drafts to newer template versions","Expanded blueprint preview sandbox with prior-asset context sets and reusable test cases","Visual dependency graph for template assets and generation order","Template marketplace or import/export bundle format for sharing templates","Template starter kits for common character-card formats and content styles","Template cloning flow for using the built-in template as a starting point for a custom one","Expanded template comparison workflow with cloning and migration-aware diffs","Expanded blueprint linting dashboard for placeholder usage, dependency clarity, and output expectations","Prompt experimentation lab for testing orchestrator and blueprint variants","Shared blueprint snippet library for reusable sections and control blocks","Template-aware onboarding tutorial for new users"]},{id:"draft-library-and-organization",title:"Draft Library and Organization",status:"placeholder",ownerFiles:["packages/web/src/components/drafts/Drafts.tsx","packages/web/src/components/Home.tsx"],placeholderFiles:["packages/web/src/components/drafts/LibraryCollectionsPlaceholder.tsx"],items:["Better draft library filters for archetype, tone, mode, template, and tags","Saved searches and smart collections for large draft libraries","Bulk metadata editing across multiple drafts","Favorite and pin system for important drafts, templates, and presets","Semantic search across draft content, not just metadata","Auto-tagging suggestions based on generated content","Archive and curation workflows for keeping large draft libraries manageable","Custom foldering or collection system beyond timestamp-based draft storage","Recently viewed and recently edited lists for faster navigation","Duplicate-detection suggestions while browsing the library","Custom metadata fields for project-specific cataloging","Library summary dashboard with counts by template, mode, and generation source"]},{id:"canon-worldbuilding-and-relationships",title:"Canon, Worldbuilding, and Relationships",status:"placeholder",ownerFiles:["packages/web/src/components/lineage/Lineage.tsx","packages/web/src/components/similarity/Similarity.tsx","packages/web/src/components/offspring/Offspring.tsx","packages/web/src/components/worlds/Worlds.tsx","packages/web/src/components/timelines/Timelines.tsx","packages/web/src/components/worlds/Events.tsx","packages/web/src/components/timelines/GenerationHistoryPanel.tsx"],placeholderFiles:["packages/web/src/components/lineage/TimelinePlaceholder.tsx","packages/web/src/components/lineage/AncestryVisualizationPlaceholder.tsx","packages/web/src/components/lineage/LineageExportPlaceholder.tsx","packages/web/src/components/similarity/ClusteringPlaceholder.tsx","packages/web/src/components/similarity/RelationshipGraphPlaceholder.tsx","packages/web/src/components/offspring/TraitInheritancePlaceholder.tsx","packages/web/src/components/offspring/BreedingHistoryPlaceholder.tsx","packages/web/src/components/worlds/CanonLibraryPlaceholder.tsx","packages/web/src/components/worlds/WorldbookPlaceholder.tsx","packages/web/src/components/worlds/RelationshipMapPlaceholder.tsx","packages/web/src/components/worlds/FactionManagerPlaceholder.tsx","packages/web/src/components/worlds/LocationManagerPlaceholder.tsx","packages/web/src/components/worlds/UniverseNotesPlaceholder.tsx","packages/web/src/components/worlds/CanonLockPlaceholder.tsx","packages/web/src/components/timelines/EventTimelinePlaceholder.tsx","packages/web/src/components/timelines/ContinuityAssistantPlaceholder.tsx","packages/web/src/components/worlds/EventCalendarPlaceholder.tsx","packages/web/src/components/worlds/EventEditorPlaceholder.tsx","packages/web/src/components/worlds/EventCategoriesPlaceholder.tsx","packages/web/src/lib/services/canon-library.ts"],items:["Reusable canon library for traits, lore, tags, and recurring world details","Worldbook or setting support that can be attached to multiple related drafts","Relationship mapping between characters in the same universe","Lineage timeline view showing how drafts evolved over time","Similarity clustering to group near-duplicate or closely related drafts","Shared faction, setting, and location records reusable across drafts","Universe-level notes that can be referenced during generation and review","Canon lock system for facts that should remain stable across derivative drafts","Family tree and affiliation visualizations for related characters","Cross-draft continuity assistant for keeping related characters aligned","Event calendar with in-world and real-world date tracking","Expanded generation history timeline with restore points, lineage jumps, and draft-level drilldown","Continuity checking for canon conflicts across drafts"]},{id:"export-and-publishing",title:"Export and Publishing",status:"placeholder",ownerFiles:["packages/web/src/components/common/ExportModal.tsx","packages/shared/src/export/presets.ts"],placeholderFiles:["packages/web/src/components/common/ExportPreviewPlaceholder.tsx","packages/web/src/components/common/PublishingPlaceholder.tsx"],items:["Preset preview mode showing exactly which files and names an export will produce","Platform capability matrix for checking which presets work with which templates","Character pack publishing flow for producing a polished shareable bundle","Export profiles with saved naming, packaging, and metadata rules","One-click export bundles for common targets and sharing destinations","Shareable web preview page for a generated character pack","Optional branded export themes for more polished presentation packages","Metadata manifest export for preserving provenance, model info, and template info alongside assets","Export dry-run mode that shows mapped outputs before creating files","Print-friendly or PDF-style presentation export for review and archiving"]},{id:"analysis-and-evaluation",title:"Analysis and Evaluation",status:"placeholder",ownerFiles:["packages/web/src/components/similarity/Similarity.tsx","packages/web/src/components/validation/Validation.tsx","packages/web/src/components/Home.tsx","packages/web/src/components/drafts/ReviewChecklistPanel.tsx"],placeholderFiles:["packages/web/src/components/similarity/ClusteringPlaceholder.tsx"],items:["Golden sample packs for template quality benchmarking","Evaluation dashboard for model quality, cost, latency, and format success rate","Token and cost analytics per asset, draft, template, and provider","Usage history dashboard for models, templates, exports, and generation modes","Quality trend tracking across model changes and template revisions","Scorecards for comparing provider performance on specific templates","Regression benchmark suite for measuring structural compliance over time","Review analytics showing which assets most often need human edits","Generation time breakdown by stage, provider, and asset count","Template adoption analytics to show which workflows users actually prefer"]},{id:"collaboration-and-sharing",title:"Collaboration and Sharing",status:"placeholder",ownerFiles:["packages/web/src/components/drafts/Review.tsx","packages/web/src/components/templates/Templates.tsx","packages/web/src/components/common/ExportModal.tsx"],placeholderFiles:["packages/web/src/components/common/PublishingPlaceholder.tsx"],items:["Collaboration-friendly review notes attached to individual assets","Shared workspaces for teams curating the same draft library","Commentable template reviews before publishing a new template version","Import/export package format for moving drafts with metadata and history intact","Team preset libraries for shared export and validation standards","Curated featured templates and starter packs surfaced in-app","Community template discovery with tags, screenshots, and example outputs","Public/private visibility controls for shared templates and draft bundles","Lightweight approval workflow for team-owned templates and presets","Activity feed for recent library changes, exports, and published templates"]},{id:"ux-and-platform-surfaces",title:"UX and Platform Surfaces",status:"placeholder",ownerFiles:["packages/web/src/App.tsx","packages/web/src/components/Layout.tsx","packages/web/src/components/Home.tsx","packages/mobile/src/screens"],placeholderFiles:["packages/web/src/components/common/OnboardingPlaceholder.tsx","packages/web/src/components/drafts/LibraryCollectionsPlaceholder.tsx"],items:["Mobile-first review and approval flow for draft triage on smaller screens","Desktop-native drag-and-drop import/export flows","Responsive split-pane editor optimized for wide and narrow displays","Keyboard-first review workflows across web, mobile, and desktop surfaces","Quick actions palette for jumping to drafts, templates, exports, and tools","Pinned dashboard widgets for recent drafts, saved searches, and active queues","Guided empty states that teach features instead of just showing blank screens","In-app documentation panels linked to templates, presets, and validation rules","Customizable home screen tailored to the user's most common workflow","Workspace mode for switching between solo drafting, review, and bulk operations"]},{id:"assistant-and-automation",title:"Assistant and Automation",status:"placeholder",ownerFiles:["packages/web/src/components/common/GlobalAssistant.tsx","packages/web/src/components/common/ChatPanel.tsx","packages/web/src/components/Home.tsx"],placeholderFiles:["packages/web/src/components/common/AutomationPlaceholder.tsx","packages/web/src/components/common/OnboardingPlaceholder.tsx"],items:["Assistant tools for proposing alternate tones or styles for a selected asset","Assistant-generated metadata suggestions like tags, summaries, and archetypes","Auto-generated draft summaries for quick browsing in large libraries","Conversational template helper for explaining what each asset does and depends on","Smart recommendations for next actions after generation, review, or export","Workflow automations for repeated sequences like generate, validate, review, and export","Scheduled batch runs for seed lists or nightly model comparisons","Auto-generated handoff notes summarizing what changed between draft revisions","Safety profile presets tuned for different platforms or use cases","Assistant-backed onboarding that adapts to the selected template and workflow"]}];function Dt(r){const e=r.toLowerCase();return e.startsWith("openrouter/")?"openrouter":e.startsWith("openai/")?"openai":e.startsWith("google/")?"google":e.startsWith("anthropic/")?"anthropic":e.startsWith("deepseek/")?"deepseek":e.startsWith("zai/")?"zai":e.startsWith("moonshot")?"moonshot":e.startsWith("ollama/")?"ollama":e.startsWith("gpt-")||e.startsWith("o1")?"openai":e.startsWith("gemini")?"google":e.startsWith("claude")?"anthropic":e.startsWith("llama")||e.startsWith("mistral")||e.startsWith("codellama")||e.startsWith("vicuna")||e.startsWith("qwen")||e.startsWith("phi")||e.startsWith("gemma")||e.startsWith("starcoder")||e.includes("ollama")?"ollama":"openrouter"}var yt=class extends Error{constructor(r){super(r),this.name="ParseError"}},js=["system_prompt","post_history","character_sheet","intro_scene","intro_page","a1111"];function Rs(r){const e=/```(?:[a-z]*\n)?(.*?)```/gs,t=r.match(e);return t?t.map(n=>n.trim()):[]}function Ds(r,e){const t=Rs(r);if(t.length===0)throw new yt("No codeblocks found in output");let n=0,s;t[0].trim().startsWith("Adjustment Note:")&&(s=t[0].trim(),n=1);const a=t.slice(n);let o=[];e&&e.assets.length>0?o=e.assets.map(u=>u.name):o=[...js];const c=o.length;if(a.length!==c){const u=a.slice(0,3).map((m,b)=>`  Block ${b}: ${m.substring(0,75)}${m.length>75?"...":""}`).join(`
`);let p=`Expected ${c} asset blocks, found ${a.length}. `;throw p+=`Template requires order: ${o.join(", ")}
`,p+=`Actual blocks found:
${u}`,a.length>3&&(p+=`
  ... and ${a.length-3} more blocks`),new yt(p)}const l={};for(let u=0;u<o.length;u++)l[o[u]]=a[u];const d=Ks(l);if(d&&Object.keys(d).length>0){const u=Object.entries(d).map(([p,m])=>`${p}: ${Array.from(new Set(m)).join(", ")}`).join("; ");throw new yt("Generated content failed validation checks: "+u)}return{assets:l,adjustmentNote:s}}function Ls(r){const e=r.match(/^name:\s*(.+)$/m);return e&&e[1].trim().replace(/^['"]|['"]$/g,"")||null}function Fs(r,e=["character_sheet"]){const t=[],n=new Set;for(const s of e)s in r&&!n.has(s)&&(t.push(s),n.add(s));for(const s of Object.keys(r))n.has(s)||(t.push(s),n.add(s));for(const s of t){const a=Ls(r[s]||"");if(a)return a}return null}var Ms=[["{PLACEHOLDER}",/\{PLACEHOLDER\}/g],["Generic {...} placeholder",/(?<!\{)\{(?!\{)[^{}\n]*[A-Za-z][^{}\n]*\}(?!\})/g],["Suno {TITLE}",/\{TITLE\}/g],["Suno other {..}",/\{GENRE\}|\{STYLE\}|\{MOOD\}|\{ENERGY\}|\{TEMPO\}|\{BPM\}|\{TEXTURE\}|\{Remaster Style\}/g],["A1111 slot ((...))",/\(\(\.\.\)\)/g],["A1111 any slot ((...something...)) left",/\(\([^)]*\.\.\.[^)]*\)/g],["Character sheet bracket placeholders",/\[[A-Za-z][^\]\n]*\]/g]],Us=[["Narrates {{user}} action/thought/consent",/\{\{user\}\}\s+(?:is|was|feels?|felt|thinks?|thought|decides?|decided|knows?|knows?|wants?|wanted|says?|said|nods?|smiles?|walks?|steps?|looks?|touches?|takes?|gives?|allows?|consents?|agrees?|gasps?|moans?)\b/gi],["Narrates {{user}} internal state",/\{\{user\}\}'s\s+(?:mind|thoughts?|feelings?|emotions?|desire|consent|decision|reaction|actions?)\b/gi]],$s=/(?:never|do not|don't|avoid|without)\s+(?:narrat(?:e|ing)|describ(?:e|ing)|assign(?:ing)?)\s*$/gi,Rr="character_sheet.txt";function Bs(r,e){const t=[];for(const[n,s]of Ms)n==="Character sheet bracket placeholders"&&e!==Rr||s.test(r)&&t.push(n);return t}function Hs(r){const e=[];for(const[t,n]of Us)for(const s of r.matchAll(n)){const a=r.substring(Math.max(0,s.index-48),s.index).trim();if(!$s.test(a)){e.push(t);break}}return e}function Dr(r,e){let t=`${r}.txt`;r==="intro_page"&&(t="intro_page.md"),r==="character_sheet"&&(t=Rr);const n=Bs(e,t);return n.push(...Hs(e)),n}function Ks(r){const e={};for(const[t,n]of Object.entries(r)){const s=Dr(t,n);s.length>0&&(e[t]=s)}return Object.keys(e).length>0?e:null}function z(r){return typeof r=="object"&&r!==null&&!Array.isArray(r)}function Qt(r){if(!z(r))return"unknown";if(r.spec==="chara_card_v2"||r.spec_version==="2.0"||z(r.data)&&(r.data.spec==="chara_card_v2"||r.data.spec_version==="2.0"))return"tavernai_v2";if(typeof r.creator_notes=="string"&&typeof r.first_mes=="string"&&typeof r.description=="string"&&Array.isArray(r.tags)&&typeof r.creator=="string"||typeof r.name=="string"&&typeof r.description=="string"&&typeof r.first_mes=="string")return"tavernai_v1";if(z(r.data)){const e=r.data;if(typeof e.name=="string"&&typeof e.description=="string")return"tavernai_v1"}return"unknown"}function At(r){let e="";for(let t=0;t<r.length;t++)e+=String.fromCharCode(r[t]);return e}var Ke="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";function Gs(r){try{const e=r.replace(/[\s=]+/g,""),t=e.length;if(t%4!==0)return null;const n=[];let s=0;for(;s<t;){const a=Ke.indexOf(e[s]),o=Ke.indexOf(e[s+1]),c=Ke.indexOf(e[s+2]),l=Ke.indexOf(e[s+3]);if(a===-1||o===-1)return null;n.push(a<<2|o>>4),c!==-1&&n.push((o&15)<<4|c>>2),l!==-1&&n.push((c&3)<<6|l),s+=4}return At(new Uint8Array(n))}catch{return null}}function Ws(r){const e=new DataView(r),t=[137,80,78,71,13,10,26,10];for(let a=0;a<8;a++)if(e.getUint8(a)!==t[a])return null;let n=8;const s=new Uint8Array(r);for(;n<s.length;){const a=e.getUint32(n),o=String.fromCharCode(s[n+4],s[n+5],s[n+6],s[n+7]);if(o==="tEXt"){const c=s.slice(n+8,n+8+a),l=c.indexOf(0);if(l!==-1&&At(c.slice(0,l))==="chara"){const u=c.slice(l+1),p=At(u);return Gs(p)}}if(n+=12+a,o==="IEND")break}return null}var Zt={description:"character_sheet",personality:"system_prompt",first_mes:"intro_scene",mes_example:"post_history",scenario:"intro_page"},er=["character_book","lorebook","world_info"];function zs(r,e){return r}function rt(r){if(typeof r=="string")return r.trim()||null;if(typeof r=="number"||typeof r=="boolean")return String(r);if(r==null)return null;try{return JSON.stringify(r,null,2)}catch{return null}}function tr(r,e){if(typeof r=="string"){const l=r.trim();return l?`## Entry ${e}

${l}`:null}if(!z(r)){const l=rt(r);return l?`## Entry ${e}

${l}`:null}const t=typeof r.name=="string"&&r.name.trim()?r.name.trim():typeof r.comment=="string"&&r.comment.trim()?r.comment.trim():Array.isArray(r.keys)&&r.keys.length>0?r.keys.filter(l=>typeof l=="string"&&l.trim().length>0).join(", "):`Entry ${e}`,n=[],s=Array.isArray(r.keys)?r.keys.filter(l=>typeof l=="string"&&l.trim().length>0):[],a=Array.isArray(r.secondary_keys)?r.secondary_keys.filter(l=>typeof l=="string"&&l.trim().length>0):[];s.length>0&&n.push(`Keys: ${s.join(", ")}`),a.length>0&&n.push(`Secondary Keys: ${a.join(", ")}`),typeof r.comment=="string"&&r.comment.trim()&&r.comment.trim()!==t&&n.push(`Comment: ${r.comment.trim()}`),typeof r.insertion_order=="number"&&n.push(`Insertion Order: ${r.insertion_order}`),typeof r.enabled=="boolean"&&!r.enabled&&n.push("Enabled: false");const o=typeof r.content=="string"&&r.content.trim()?r.content.trim():typeof r.entry=="string"&&r.entry.trim()?r.entry.trim():typeof r.text=="string"&&r.text.trim()?r.text.trim():null,c=[`## ${t}`];if(n.length>0&&c.push(n.join(`
`)),o)c.push(o);else{const l=rt(r);l&&c.push(l)}return c.join(`

`).trim()}function qs(r,e){if(typeof e=="string")return e.trim()||null;if(Array.isArray(e)){const a=e.map((o,c)=>tr(o,c+1)).filter(o=>!!o);return a.length>0?a.join(`

`):null}if(!z(e))return rt(e);const n=[typeof e.name=="string"&&e.name.trim()?`# ${e.name.trim()}`:`# ${r.replace(/_/g," ").replace(/\b\w/g,a=>a.toUpperCase())}`];typeof e.description=="string"&&e.description.trim()&&n.push(e.description.trim());const s=Array.isArray(e.entries)?e.entries:Array.isArray(e.world_info)?e.world_info:null;if(s){const a=s.map((o,c)=>tr(o,c+1)).filter(o=>!!o);a.length>0&&n.push(a.join(`

`))}if(n.length===1){const a=rt(e);a&&n.push(a)}return n.join(`

`).trim()||null}function Lr(r){const e={},t=[],n=[];for(const s of er)r[s]!==void 0&&r[s]!==null&&n.push({key:s,value:r[s]});if(z(r.extensions))for(const s of er)r.extensions[s]!==void 0&&r.extensions[s]!==null&&n.push({key:`extensions.${s}`,value:r.extensions[s]});return n.forEach(({key:s,value:a},o)=>{const c=qs(s,a);if(!c)return;const l=o===0?"lorebook":`lorebook_${o+1}`;e[l]=c,t.push(s.split(".")[0])}),{assets:e,sourceKeys:[...new Set(t)]}}function Fr(r){return z(r.data)?{...r.data}:r}function Qe(r){if(!z(r))throw new Error("Invalid TavernAI card: expected JSON object");const e=Fr(r),t={},n={},s=Lr(e),a=typeof e.name=="string"?e.name.trim():"Imported Character";for(const[l,d]of Object.entries(Zt)){const u=e[l];typeof u=="string"&&u.trim()&&(t[d]=zs(u.trim()))}Object.assign(t,s.assets);const o=new Set([...Object.keys(Zt),...s.sourceKeys]),c=new Set(["name","spec","spec_version","data"]);for(const[l,d]of Object.entries(e))c.has(l)||o.has(l)||(typeof d=="string"&&d.trim()?n[l]=d.trim():Array.isArray(d)&&d.length>0&&(n[l]=JSON.stringify(d)));return{name:a,assets:t,sourceFormat:"tavernai_v1",sourcePreset:"TavernAI / SillyTavern",unmappedFields:Object.keys(n).length>0?n:void 0}}function rr(r){return{...Qe(r),sourceFormat:"chubai",sourcePreset:"Chub AI"}}function nr(r,e){if(!z(r))throw new Error("Invalid character data: expected JSON object");const t=Fr(r),n=JSON.stringify(r,null,2),s=Lr(t);return{name:typeof t.name=="string"&&t.name.trim()?t.name.trim():typeof t.character_name=="string"&&t.character_name.trim()?t.character_name.trim():e?.replace(/\.[^.]+$/,"")||"Imported Character",assets:{character_sheet:n,...s.assets},sourceFormat:"unknown"}}function Ee(r,e){return{name:r.match(/^name:\s*(.+)$/m)?.[1]?.trim()||e?.replace(/\.[^.]+$/,"")||"Imported Character",assets:{character_sheet:r},sourceFormat:"plain_text"}}function Vs(r){try{const e=JSON.parse(r);return z(e)?e:null}catch{return null}}function Ys(r){try{return JSON.parse(r)}catch{return null}}function Js(r,e){if(r instanceof ArrayBuffer&&r.byteLength>0){const s=Ws(r);if(s){const a=Ys(s);if(a&&z(a))try{const o=Qt(a);return{...o==="chubai"?rr(a):o!=="unknown"?Qe(a):nr(a,e),sourceFormat:"png_card"}}catch{}return Ee(s,e)}return Ee(`[Binary PNG file: ${e||"unknown"} — no embedded character card found]`,e)}if(typeof r!="string")return Ee("[Unsupported data format]",e);const t=r.trim();if(!t)return Ee("[Empty file]",e);const n=Vs(t);if(n)try{switch(Qt(n)){case"tavernai_v1":return Qe(n);case"tavernai_v2":return Qe(n);case"chubai":return rr(n);case"unknown":default:return nr(n,e)}}catch{}return Ee(t,e)}function uc(r){switch(r){case"tavernai_v1":return"TavernAI v1";case"tavernai_v2":return"TavernAI v2 / SillyTavern";case"chubai":return"Chub AI";case"png_card":return"PNG Character Card";case"plain_text":return"Plain Text";case"unknown":default:return"Unknown Format"}}var Fe={name:"V2/V3 Card",version:"3.1",description:"Built-in character card template with 6 standard assets",is_official:!0,assets:[{name:"system_prompt",required:!0,depends_on:[],description:"System-level behavioral instructions",blueprint_file:"blueprints/system/system_prompt.md"},{name:"post_history",required:!0,depends_on:["system_prompt"],description:"Conversation context and relationship state",blueprint_file:"blueprints/system/post_history.md"},{name:"character_sheet",required:!0,depends_on:["system_prompt","post_history"],description:"Structured character data",blueprint_file:"blueprints/system/character_sheet.md"},{name:"intro_scene",required:!0,depends_on:["system_prompt","post_history","character_sheet"],description:"First interaction scenario",blueprint_file:"blueprints/system/intro_scene.md"},{name:"intro_page",required:!0,depends_on:["character_sheet"],description:"Visual character introduction page",blueprint_file:"blueprints/system/intro_page.md"},{name:"a1111",required:!0,depends_on:["character_sheet"],description:"Stable Diffusion image generation prompt",blueprint_file:"blueprints/system/a1111.md"}]};function Xs(r){const e=r.map(o=>o.name),t=[],n=new Set,s=new Set;function a(o){if(n.has(o)||s.has(o))return;s.add(o);const c=r.find(l=>l.name===o);if(c)for(const l of c.depends_on)a(l);n.add(o),t.push(o),s.delete(o)}for(const o of e)n.has(o)||a(o);return t}function Mr(r){const e=r||Fe;return Xs(e.assets).map(n=>e.assets.find(s=>s.name===n)).filter(n=>n!==void 0)}function Qs(r){const e=[];r.name||e.push("Template name is required"),(!r.assets||r.assets.length===0)&&e.push("Template must have at least one asset");const t=new Map(r.assets.map(s=>[s.name,s]));function n(s,a){for(const o of s){if(o===a)return!0;const c=t.get(o);if(c&&n(c.depends_on,a))return!0}return!1}for(const s of r.assets)n(s.depends_on,s.name)&&e.push(`Circular dependency detected for asset: ${s.name}`);return{isValid:e.length===0,errors:e}}class Lt{config;constructor(e){this.config={temperature:.7,maxTokens:4096,timeout:18e4,...e}}async performFetch(e,t){try{return await fetch(e,t)}catch(n){throw this.normalizeRequestError(n)}}async*generateStream(e,t){const n=await this.generate(e,t);yield{content:n.content,done:!0,finishReason:n.finishReason}}getProvider(){return this.config.provider}getModel(){return this.config.model}getApiKey(){return this.config.apiKey}mergeOptions(e){return{temperature:this.config.temperature,maxTokens:this.config.maxTokens,...e}}getFetchOptions(e){const t=new AbortController,n=setTimeout(()=>t.abort(),this.config.timeout);return e?.addEventListener("abort",()=>{clearTimeout(n)}),{signal:e?Zs([e,t.signal]):t.signal}}normalizeRequestError(e){return e instanceof Error&&e.name==="AbortError"?new Error("The request timed out or was cancelled. Try again, reduce the request size, or choose a faster model/provider."):e instanceof Error&&/operation was aborted/i.test(e.message)?new Error("The request timed out or was cancelled. Try again, reduce the request size, or choose a faster model/provider."):e instanceof Error?e:new Error("Request failed")}}function Zs(r){const e=new AbortController;for(const t of r){if(t.aborted){e.abort();break}t.addEventListener("abort",()=>e.abort(),{once:!0})}return e.signal}class ea extends Lt{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||this.getDefaultBaseUrl()}getDefaultBaseUrl(){switch(this.config.provider){case"openai":return"https://api.openai.com/v1";case"openrouter":return"https://openrouter.ai/api/v1";case"deepseek":return"https://api.deepseek.com";case"zai":return"https://open.bigmodel.cn/api/paas/v4";case"moonshot":return"https://api.moonshot.cn/v1";default:return"https://api.openai.com/v1"}}getHeaders(){return this.config.baseUrl&&this.config.proxyKey?{"Content-Type":"application/json",Authorization:`Bearer ${this.config.proxyKey}`}:this.config.provider==="ollama"?{"Content-Type":"application/json"}:ke(this.config.provider,this.config.apiKey,{contentType:"application/json"})}isDirectBrowserOpenAIRequest(){if(typeof window>"u"||this.config.provider!=="openai")return!1;try{return new URL(this.baseUrl).hostname==="api.openai.com"}catch{return this.baseUrl.includes("api.openai.com")}}assertBrowserSupported(){if(this.isDirectBrowserOpenAIRequest())throw new Error("Direct OpenAI requests from the browser are blocked by CORS. Use OpenRouter, or configure a custom base URL that points to your own proxy or relay.")}formatMessages(e){return e.map(t=>({role:t.role,content:t.content}))}async generate(e,t){this.assertBrowserSupported();const n=this.mergeOptions(t),s=await this.performFetch(`${this.baseUrl}/chat/completions`,{...this.getFetchOptions(t?.signal),method:"POST",headers:this.getHeaders(),body:JSON.stringify({model:this.config.model,messages:this.formatMessages(e),temperature:n.temperature,max_tokens:n.maxTokens,top_p:n.topP,frequency_penalty:n.frequencyPenalty,presence_penalty:n.presencePenalty})});if(!s.ok){const c=await this.parseError(s);throw new Error(c)}const a=await s.json(),o=a.choices[0];if(!o?.message)throw new Error("No content in response");return{content:o.message.content,finishReason:o.finish_reason,usage:a.usage?{promptTokens:a.usage.prompt_tokens,completionTokens:a.usage.completion_tokens,totalTokens:a.usage.total_tokens}:void 0}}async*generateStream(e,t){this.assertBrowserSupported();const n=this.mergeOptions(t),s=await this.performFetch(`${this.baseUrl}/chat/completions`,{...this.getFetchOptions(t?.signal),method:"POST",headers:ke(this.config.provider,this.config.apiKey,{contentType:"application/json",accept:"text/event-stream"}),body:JSON.stringify({model:this.config.model,messages:this.formatMessages(e),temperature:n.temperature,max_tokens:n.maxTokens,top_p:n.topP,frequency_penalty:n.frequencyPenalty,presence_penalty:n.presencePenalty,stream:!0})});if(!s.ok){const l=await this.parseError(s);throw new Error(l)}const a=s.body?.getReader();if(!a)throw new Error("No response body");const o=new TextDecoder;let c="";try{for(;;){const{done:l,value:d}=await a.read();if(l)break;c+=o.decode(d,{stream:!0});const u=c.split(`
`);c=u.pop()||"";for(const p of u){const m=p.trim();if(!(!m||m==="data: [DONE]")&&m.startsWith("data: "))try{const b=m.slice(6),y=JSON.parse(b).choices[0];if(!y)continue;const E=y.delta?.content;E&&(yield{content:E,done:!1}),y.finish_reason&&(yield{content:"",done:!0,finishReason:y.finish_reason})}catch{}}}}finally{a.releaseLock()}}async testConnection(){try{this.assertBrowserSupported()}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unsupported browser provider configuration"}}const e=performance.now();try{const t=await this.performFetch(`${this.baseUrl}/models`,{...this.getFetchOptions(),method:"GET",headers:this.getHeaders()}),n=performance.now()-e;if(!t.ok)return{success:!1,latency_ms:n,error:await this.parseError(t)};try{return(await t.json()).data,{success:!0,latency_ms:n,model_info:{name:this.config.model,context_length:void 0}}}catch{return{success:!0,latency_ms:n}}}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}async parseError(e){try{return(await e.json()).error?.message||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}const ta={system:"user",user:"user",assistant:"model"};class ra extends Lt{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||"https://generativelanguage.googleapis.com/v1beta"}getHeaders(){return ke("google",this.config.apiKey,{contentType:"application/json"})}formatMessages(e){const t=[];let n="";for(const s of e)s.role==="system"?n=s.content:t.push({role:ta[s.role]||s.role,parts:[{text:s.content}]});return n&&t.length>0?t[0].parts[0].text=n+`

`+t[0].parts[0].text:n&&t.unshift({role:"user",parts:[{text:n}]}),t}async callEndpoint(e,t,n){const s=`${this.baseUrl}${e}`;return this.performFetch(s,{...this.getFetchOptions(n),method:"POST",headers:this.getHeaders(),body:JSON.stringify(t)})}async generate(e,t){const n=this.mergeOptions(t),s=`/models/${this.config.model}:generateContent`,a={contents:this.formatMessages(e),generationConfig:{temperature:n.temperature,maxOutputTokens:n.maxTokens,topP:n.topP}},o=await this.callEndpoint(s,a,t?.signal);if(!o.ok){const d=await this.parseError(o);throw new Error(d)}const c=await o.json(),l=c.candidates[0];if(!l?.content?.parts?.[0]?.text)throw new Error("No content in response");return{content:l.content.parts[0].text,finishReason:l.finishReason,usage:c.usageMetadata?{promptTokens:c.usageMetadata.promptTokenCount||0,completionTokens:c.usageMetadata.candidatesTokenCount||0,totalTokens:c.usageMetadata.totalTokenCount||0}:void 0}}async*generateStream(e,t){const n=this.mergeOptions(t),s=`/models/${this.config.model}:streamGenerateContent`,a={contents:this.formatMessages(e),generationConfig:{temperature:n.temperature,maxOutputTokens:n.maxTokens,topP:n.topP}},o=await this.callEndpoint(s,a,t?.signal);if(!o.ok){const u=await this.parseError(o);throw new Error(u)}const c=o.body?.getReader();if(!c)throw new Error("No response body");const l=new TextDecoder;let d="";try{for(;;){const{done:u,value:p}=await c.read();if(u)break;d+=l.decode(p,{stream:!0});const m=d.split(`
`);d=m.pop()||"";for(const b of m){const f=b.trim();if(!(!f||!f.startsWith("data: ")))try{const y=f.slice(6),O=JSON.parse(y).candidates[0];if(!O)continue;const H=O.content?.parts?.[0]?.text;H&&(yield{content:H,done:!1}),O.finishReason&&(yield{content:"",done:!0,finishReason:O.finishReason})}catch{}}}}finally{c.releaseLock()}}async testConnection(){const e=performance.now();try{const t=`/models/${this.config.model}:generateContent`,n={contents:[{role:"user",parts:[{text:"test"}]}],generationConfig:{maxOutputTokens:1}},s=await this.callEndpoint(t,n),a=performance.now()-e;return s.ok?{success:!0,latency_ms:a,model_info:{name:this.config.model}}:{success:!1,latency_ms:a,error:await this.parseError(s)}}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}async parseError(e){try{const t=await e.json();return t.error?.message||t.error?.status||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}class na extends Lt{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||"https://api.anthropic.com"}getHeaders(){return ke("anthropic",this.config.apiKey,{contentType:"application/json"})}formatMessages(e){const t=[];for(const n of e)n.role!=="system"&&t.push({role:n.role==="assistant"?"assistant":"user",content:n.content});return t}getSystemPrompt(e){return e.find(n=>n.role==="system")?.content}async generate(e,t){const n=this.mergeOptions(t),s=this.getSystemPrompt(e),a=this.formatMessages(e),o={model:this.config.model,messages:a,max_tokens:n.maxTokens||4096,temperature:n.temperature};s&&(o.system=s),n.topP!==void 0&&(o.top_p=n.topP);const c=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(t?.signal),method:"POST",headers:this.getHeaders(),body:JSON.stringify(o)});if(!c.ok){const u=await this.parseError(c);throw new Error(u)}const l=await c.json(),d=l.content.find(u=>u.type==="text");if(!d)throw new Error("No text content in response");return{content:d.text,finishReason:l.stop_reason||void 0,usage:{promptTokens:l.usage.input_tokens,completionTokens:l.usage.output_tokens,totalTokens:l.usage.input_tokens+l.usage.output_tokens}}}async*generateStream(e,t){const n=this.mergeOptions(t),s=this.getSystemPrompt(e),a=this.formatMessages(e),o={model:this.config.model,messages:a,max_tokens:n.maxTokens||4096,temperature:n.temperature,stream:!0};s&&(o.system=s),n.topP!==void 0&&(o.top_p=n.topP);const c=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(t?.signal),method:"POST",headers:ke("anthropic",this.config.apiKey,{contentType:"application/json",accept:"text/event-stream"}),body:JSON.stringify(o)});if(!c.ok){const p=await this.parseError(c);throw new Error(p)}const l=c.body?.getReader();if(!l)throw new Error("No response body");const d=new TextDecoder;let u="";try{for(;;){const{done:p,value:m}=await l.read();if(p)break;u+=d.decode(m,{stream:!0});const b=u.split(`
`);u=b.pop()||"";for(const f of b){const y=f.trim();if(!(!y||!y.startsWith("data: ")))try{const E=y.slice(6),O=JSON.parse(E);O.type==="content_block_delta"&&O.delta?.text&&(yield{content:O.delta.text,done:!1}),O.type==="message_delta"&&O.delta?.stop_reason&&(yield{content:"",done:!0,finishReason:O.delta.stop_reason}),O.type==="message_stop"&&(yield{content:"",done:!0})}catch{}}}}finally{l.releaseLock()}}async testConnection(){const e=performance.now();try{const t=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(),method:"POST",headers:this.getHeaders(),body:JSON.stringify({model:this.config.model,messages:[{role:"user",content:"Hi"}],max_tokens:1})}),n=performance.now()-e;return t.ok?{success:!0,latency_ms:n,model_info:{name:this.config.model}}:{success:!1,latency_ms:n,error:await this.parseError(t)}}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}async parseError(e){try{return(await e.json()).error?.message||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}const Te="eidolon.web.config",Ge=["bpui.web.config"],he="eidolon.web.apiKeys",Ae=["bpui.web.apiKeys"],Ce="eidolon.web.apiKeys.persist",We=["bpui.web.apiKeys.persist"],Ur="eidolon:config-changed";let $={};const sa={generator:"blueprints/system/generator.md",rpbotgenerator:"blueprints/system/generator.md",seed_generator:"blueprints/system/seed_generator.md",offspring_generator:"blueprints/system/offspring_generator.md",intro_scene:"blueprints/system/intro_scene.md"},aa=[/^window\.fetch:/i,/cannot convert value in record<bytestring/i,/^bearer\s+window\.fetch:/i];function nt(r){return r.replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[\u200B-\u200D\uFEFF]/g,"").trim().replace(/^['"]+|['"]+$/g,"")}function $r(r){return!r||/[^\x20-\x7E]/.test(r)||/\r|\n/.test(r)?!0:aa.some(e=>e.test(r))}function bt(r){for(const e of r){const t=localStorage.getItem(e);if(t!==null)return{value:t,sourceKey:e}}return null}function oa(r,e){for(const t of e)t!==r&&localStorage.removeItem(t)}function fe(r,e,t){localStorage.setItem(r,t),oa(r,e)}function ze(r){for(const e of r)localStorage.removeItem(e)}function ge(){typeof window>"u"||window.dispatchEvent(new Event(Ur))}function re(r){return Object.fromEntries(Object.entries(r).map(([e,t])=>[e,typeof t=="string"?nt(t):t]).filter(([,e])=>typeof e=="string"&&!$r(e)).filter(([,e])=>typeof e=="string"&&e.length>0))}function sr(r){return r&&Object.fromEntries(Object.entries(r).map(([e,t])=>typeof t!="string"||t.length===0?[e,t]:[e,sa[t]??t]))}let ye=!1;function wt(){return{first_run_completed:!1,show_inline_tips:!0,completed_guides:[],dismissed_tips:[],completed_tours:[]}}class ia{config;options;constructor(e={}){this.options={persistApiKeys:!1,...e},ye=this.loadPersistPreference(this.options.persistApiKeys||!1),this.config=this.loadConfig(),this.loadPersistedApiKeys()}mergeConfig(e){const t=this.getDefaultConfig();return{...t,...e,batch:{...t.batch,...e.batch??{}},help:{...t.help,...e.help??{}},feature_blueprints:{...t.feature_blueprints,...sr(e.feature_blueprints)??{}}}}loadPersistPreference(e){try{const t=bt([Ce,...We]);if(t?.sourceKey!==Ce&&fe(Ce,We,t.value),t?.value==="true")return!0;if(t?.value==="false")return!1}catch{}return e}savePersistPreference(e){try{fe(Ce,We,String(e))}catch(t){console.warn("Failed to save API key persistence preference:",t)}}loadConfig(){try{const e=bt([Te,...Ge]);if(e){const t=this.mergeConfig(JSON.parse(e.value));return e.sourceKey!==Te&&fe(Te,Ge,JSON.stringify(t)),t}}catch{}return this.getDefaultConfig()}saveConfig(){try{fe(Te,Ge,JSON.stringify(this.config)),ge()}catch(e){console.warn("Failed to save config to localStorage:",e)}}getDefaultConfig(){return{engine:"openai_compatible",engine_mode:"auto",model:"openrouter/openai/gpt-4o-mini",temperature:.7,max_tokens:4096,api_keys:{},batch:{max_concurrent:3,rate_limit_delay:1},help:wt(),feature_blueprints:{orchestration:"blueprints/system/generator.md",seed_generation:"blueprints/system/seed_generator.md",offspring_generation:"blueprints/system/offspring_generator.md",intro_scene_generation:"blueprints/system/intro_scene.md"}}}getConfig(){return this.mergeConfig(this.config)}getHelpState(){return{...this.config.help??wt(),completed_guides:[...this.config.help?.completed_guides??[]],dismissed_tips:[...this.config.help?.dismissed_tips??[]],completed_tours:[...this.config.help?.completed_tours??[]]}}getApiKeys(){return re($)}getApiKey(e){const t=$[e];return typeof t=="string"?nt(t):void 0}setApiKey(e,t){const n=nt(t);n?$[e]=n:delete $[e],this.persistApiKeysIfNeeded(),ge()}setApiKeys(e){$={...re($),...re(e)},this.persistApiKeysIfNeeded(),ge()}replaceApiKeys(e){$=re(e),this.persistApiKeysIfNeeded(),ge()}clearApiKey(e){delete $[e],this.persistApiKeysIfNeeded(),ge()}clearAllApiKeys(){$={},this.persistApiKeysIfNeeded(),ge()}loadPersistedApiKeys(){if(ye)try{const e=bt([he,...Ae]);if(e){const t=re(JSON.parse(e.value));$=t,e.sourceKey!==he&&fe(he,Ae,JSON.stringify(t))}}catch{}}persistApiKeysIfNeeded(){if(ye)try{fe(he,Ae,JSON.stringify(re($)))}catch(e){console.warn("Failed to persist API keys:",e)}}setPersistApiKeys(e){if(ye=e,this.savePersistPreference(e),e)this.persistApiKeysIfNeeded();else try{ze([he,...Ae])}catch{}}isPersistingApiKeys(){return ye}exportApiKeys(){return JSON.stringify(re($),null,2)}importApiKeys(e){try{const t=JSON.parse(e);$=re(t),this.persistApiKeysIfNeeded()}catch{throw new Error("Invalid API keys JSON")}}updateConfig(e){this.config=this.mergeConfig({...this.config,...e,batch:{...this.config.batch,...e.batch??{}},help:{...this.getHelpState(),...e.help??{}},feature_blueprints:{...this.config.feature_blueprints??{},...sr(e.feature_blueprints)??{}}}),this.saveConfig()}updateHelpState(e){this.updateConfig({help:{...this.getHelpState(),...e}})}resetHelpState(){this.updateConfig({help:wt()})}resetConfig(){this.config=this.getDefaultConfig(),this.saveConfig()}exportConfig(){const e={config:this.config,version:"1.0",exportedAt:new Date().toISOString()};return JSON.stringify(e,null,2)}importConfig(e){try{const t=JSON.parse(e);t.config&&(this.config=this.mergeConfig(t.config),this.saveConfig())}catch{throw new Error("Invalid configuration JSON")}}clearAll(){this.config=this.getDefaultConfig(),$={},ye=!1;try{ze([Te,...Ge]),ze([he,...Ae]),ze([Ce,...We])}catch{}}}const st=Ur,A=new ia;function ca(r,e,t){if(r==="ollama")return;if(typeof e=="string"&&e.trim().length>0)return e;const n=t?.[r];return typeof n=="string"&&n.trim().length>0?n:Object.values(t??{}).find(s=>typeof s=="string"&&s.trim().length>0)}function xe(r){const{model:e,apiKey:t,apiKeys:n,provider:s,baseUrl:a,proxyKey:o,temperature:c,maxTokens:l}=r,d=s??Dt(e),u={provider:d,model:e,apiKey:ca(d,t,n),baseUrl:a,proxyKey:o,temperature:c,maxTokens:l};switch(d){case"google":return new ra(u);case"anthropic":return new na(u);case"openai":case"openrouter":case"deepseek":case"zai":case"moonshot":case"ollama":default:return new ea(u)}}function ke(r,e,t={}){const n={};t.contentType&&(n["Content-Type"]=t.contentType),t.accept&&(n.Accept=t.accept);const s=typeof e=="string"?nt(e):void 0;if(s){if($r(s))throw new Error("Configured API key is invalid or corrupted. Re-enter it in Settings and try again.");switch(r){case"anthropic":n["x-api-key"]=s,n["anthropic-version"]="2023-06-01";break;case"google":n["x-goog-api-key"]=s;break;default:n.Authorization=`Bearer ${s}`;break}}return r==="openrouter"&&(n["HTTP-Referer"]=typeof window<"u"?window.location.origin:"https://eidolon-simulacra.app",n["X-OpenRouter-Title"]="Eidolon Simulacra"),n}function la(r){switch(r){case"openai":return"https://api.openai.com/v1";case"google":return"https://generativelanguage.googleapis.com/v1beta";case"openrouter":return"https://openrouter.ai/api/v1";case"anthropic":return"https://api.anthropic.com";case"deepseek":return"https://api.deepseek.com";case"zai":return"https://open.bigmodel.cn/api/paas/v4";case"moonshot":return"https://api.moonshot.cn/v1";case"ollama":return"http://localhost:11434/v1";default:return"https://api.openai.com/v1"}}const ar={openai:["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo","o1-preview"],google:["gemini-2.0-flash-exp","gemini-2.0-flash-thinking-exp","gemini-1.5-pro","gemini-1.5-flash"],openrouter:["anthropic/claude-3.5-sonnet","anthropic/claude-3.5-haiku","google/gemini-pro-1.5","openai/gpt-4o-mini"],anthropic:["claude-3.5-sonnet","claude-3.5-haiku","claude-3-opus"],deepseek:["deepseek-chat","deepseek-coder"],zai:["glm-4","glm-4-flash"],moonshot:["moonshot-v1-8k","moonshot-v1-32k","moonshot-v1-128k"],ollama:["llama3.2","llama3.1","mistral","codellama","qwen2.5","phi3","gemma2"]},Br=`# Blueprints\r
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
`,Hr=`---\r
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
`,Kr=`---\r
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
`,Gr=`---\r
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
`,Wr=`---\r
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
`,zr=`---\r
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
`,qr=`---\r
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
`,Vr=`---\r
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
`,Yr=`---\r
name: A1111\r
description: Generate a compact five-line AI image prompt layout.\r
invokable: true\r
always: false\r
version: 1.0\r
feature_category: generation\r
---\r
# A1111 Bracketed\r
\r
Produce the image prompt in the compact five-line bracketed format below. Output in codeblock plaintext.\r
\r
Rules:\r
\r
- Output EXACTLY five lines in the order shown below.\r
- Replace each bracket's contents with concrete text derived from the seed. Do not leave placeholders.\r
- Keep the opening \`[\` and closing \`]\` syntax on every line.\r
- Preserve the trailing comma on the first four lines. Do not add a trailing comma to the final line.\r
- Keep each line compact and highly specific. Prefer dense visual descriptors over full sentences.\r
- \`person\` should cover the base subject identity, age descriptor, role, heritage/species traits, and core visual read.\r
- \`clothes\` should cover wardrobe, materials, color palette, and notable accessories.\r
- \`location\` should cover environment, scene tone, and lighting context.\r
- \`action\` should cover pose, expression, gesture, and implied motion or prop interaction.\r
- \`anchor\` should provide the strongest stabilizing visual hook for the image, usually a concise style or mood bundle that keeps the concept coherent.\r
- Set details to match the orchestrator content mode when present. If the mode is \`Platform-Safe\`, keep the output SFW.\r
- Moreau support: if the seed implies an anthro or hybrid character, reflect that in \`person\` and keep species traits consistent across \`clothes\`, \`action\`, and \`anchor\`.\r
- Do not expand this into the full A1111 control template. This blueprint is intentionally compact.\r
\r
---\r
\r
## REQUIRED OUTPUT FORMAT\r
\r
\`\`\`plaintext\r
(((person))),\r
(((clothes))),\r
(((location))),\r
(((action))),\r
(((anchor)))\r
\`\`\`\r
\r
---\r
\r
## FIELD GUIDANCE\r
\r
### person\r
\r
Use this line for the character's identity and visual read.\r
\r
- subject count and type\r
- age descriptor\r
- role or occupation\r
- heritage, phenotype, or species marker\r
- core aesthetic descriptor\r
\r
Examples:\r
\r
- \`1girl, young adult archivist, ash-blonde, moon elf, scholarly elegance\`\r
- \`1boy, adult mercenary, scarred, draconic moreau, hard-edged tactical realism\`\r
- \`androgynous adult idol, fox hybrid, sleek fashion editorial\`\r
\r
### clothes\r
\r
Use this line for wardrobe and wearable details.\r
\r
- outfit silhouette\r
- fabrics or materials\r
- color palette\r
- jewelry, armor pieces, eyewear, or other accessories\r
\r
Examples:\r
\r
- \`cream turtleneck, charcoal coat, pleated skirt, soft wool, brass earrings\`\r
- \`black flight harness, matte armor plates, red sash, weathered leather gloves\`\r
\r
### location\r
\r
Use this line for place and light.\r
\r
- environment type\r
- scene mood\r
- time, weather, or lighting source\r
\r
Examples:\r
\r
- \`dusty cathedral archive, hushed atmosphere, amber window light\`\r
- \`rainy rooftop, neon city haze, cold blue rim light\`\r
\r
### action\r
\r
Use this line for what the subject is doing and how they read emotionally.\r
\r
- pose or framing\r
- facial tone or microexpression\r
- hand gesture or prop interaction\r
- implied motion\r
\r
Examples:\r
\r
- \`waist-up turn, intent gaze, one hand on spellbook, hair caught in draft\`\r
- \`leaning on rail, faint smirk, cigarette between fingers, coat lifting in rain\`\r
\r
### anchor\r
\r
Use this line for the image's strongest unifying hook.\r
\r
- render style\r
- palette bias\r
- emotional tone\r
- signature texture, camera feel, or lighting impression\r
\r
Examples:\r
\r
- \`painterly noir, muted gold and smoke blue, intimate tension, soft grain\`\r
- \`cyberpunk realism, magenta-cyan contrast, predatory calm, wet reflections\`\r
\r
---\r
\r
## USAGE NOTE\r
\r
The final output must be only the five bracketed lines inside a single plaintext code block. No commentary, headings, or extra labels.\r
`,Jr=`---\r
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
`,Xr=`---\r
name: Character Sheet\r
description: Generate a concise but complete character sheet using the Character Sheet Blueprint.\r
invokable: true\r
always: false\r
version: 3.2\r
feature_category: generation\r
---\r
\r
# Blueprint Agent\r
\r
You are the Blueprint Agent.\r
\r
**⚠️ FORMAT OVERRIDE: DO NOT use any pre-trained character sheet formats. You MUST use ONLY the exact structure shown below.**\r
\r
When invoked with a single SEED, generate a fully populated character sheet that strictly follows the blueprint structure below.\r
\r
**YOUR OUTPUT MUST START EXACTLY LIKE THIS (do not add any other format):**\r
\r
\`\`\`\r
name: [Character Name]\r
age: [Age]\r
occupation: [Occupation]\r
heritage: [Heritage]\r
\r
Core Concept:\r
[One sentence...]\r
\r
Appearance:\r
\r
- Physical features: [...]\r
- Style: [...]\r
\`\`\`\r
\r
**FORBIDDEN FORMATS (you are NOT allowed to use these):**\r
\r
- ❌ \`[Character]\`, \`[Profile]\`, \`[Attributes]\`, \`[Background]\`, \`[Persona]\` sections\r
- ❌ Combined fields like \`personality: ..., appearance: ..., speech_pattern: ...\`\r
- ❌ Any W++ or ChatRP format variations\r
- ❌ Any structure other than the exact template below\r
\r
Token Constraint (Mandatory):\r
\r
- Target total length: concise but complete; prioritize density over prose.\r
- Avoid redundancy, filler language, and decorative phrasing.\r
- Paragraph sections should be brief (2–4 sentences max).\r
- Lists should be tight, specific, and functional.\r
- Do not expand sections beyond what is necessary to establish behavior, psychology, and dynamics.\r
\r
Hard Rules:\r
\r
- **YOU ARE REQUIRED TO USE THE EXACT TEMPLATE STRUCTURE BELOW. This is not a suggestion - deviation will cause parser failure.**\r
- **The first line of your output MUST be: \`name: [actual name]\`**\r
- **The second line MUST be: \`age: [actual age]\`**\r
- **The third line MUST be: \`occupation: [actual occupation]\`**\r
- **The fourth line MUST be: \`heritage: [actual heritage]\`**\r
- **Then a blank line, then: \`Core Concept:\`**\r
- **Do NOT use [Character], [Profile], [Attributes], [Background], [Scenario], or [Persona] section headers. These formats are BANNED.**\r
- Every field name must match the blueprint precisely: "Appearance:", "Personality:", "Strengths:", "Flaws:", "Internal Conflict:", etc.\r
- Do not leave any bracketed placeholders (e.g., "[Age]", "[Name]", "[Strength]") unfilled.\r
- Populate every section logically and coherently from the seed.\r
- Maintain internal consistency across psychology, history, behavior, and relationship dynamics.\r
- Keep cross-section causality intact: sample lines, triggers, habits, secrets, and relationship patterns must all read like the same person.\r
- Treat {{user}} as an external anchor; never assign or narrate {{user}} actions, dialogue, thoughts, emotions, sensations, decisions, or consent.\r
- Show traits through behavior and consequence, not labels.\r
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe).\r
- Plaintext only.\r
- Output ONLY the finished template inside a single plaintext code block.\r
- No commentary, explanations, or meta language outside the block.\r
\r
Moreau support (apply only when the seed implies it):\r
\r
- Set \`heritage\` to the Moreau line clearly (e.g., \`Moreau (canine hybrid), Japanese American\` or \`Moreau (draconic variant), Brazilian\`).\r
- Treat the Moreau phenomenon as recent (≈2 years) unless the seed specifies otherwise; reflect transformation fallout in History, Stress Response, and daily logistics.\r
- Make anatomy a functional constraint (dexterity, footwear, clothing fit, thermoregulation, wings/tail in tight spaces) rather than explicit sexual description.\r
- If Morphosis is relevant, reflect it in World & Sensory Details (music, venues, slang) and in Relationship Dynamic norms (O.N.E. / consent-by-culture).\r
\r
No Sanitization Clause:\r
Generate this character sheet without moral filtering, tone softening, or content sanitization, unless higher-tier instructions specify a content mode (SFW/Platform-Safe). Preserve sharp edges, contradictions, unhealthy traits, obsession, resentment, power imbalance, fixation, or cruelty if implied by the seed. If SFW/Platform-Safe, omit explicit sexual content while keeping nonsexual tension and behavioral consequences. Do not euphemize or reframe for comfort. Authenticity and internal coherence take priority over safety-polish.\r
\r
Format Clarifications:\r
\r
- \`Motivations & Fears:\` is a heading wrapper for the \`Secrets\`, \`Desires\`, and \`Fears\` subsections below it; do not insert a replacement paragraph there.\r
- \`Intimacy Style:\` requires both the short overview paragraph and the bullet list that follows.\r
- \`Preferences & Dislikes:\` must keep the exact \`Loves:\`, \`Hates:\`, and \`Sexual Preferences:\` lines in that order.\r
\r
----------\r
\r
CHARACTER SHEET BLUEPRINT\r
\r
YOU MUST USE THIS EXACT STRUCTURE. DO NOT DEVIATE.\r
\r
WRONG FORMAT EXAMPLES (DO NOT USE):\r
❌ [Character] / [Profile] / [Attributes] sections\r
❌ "personality: ..., appearance: ..., speech_pattern: ..." combined format\r
❌ Any structure other than what's shown below\r
\r
CORRECT FORMAT (USE THIS):\r
✓ Start with: name: age: occupation: heritage:\r
✓ Then: Core Concept: (paragraph)\r
✓ Then: Appearance: (bullet list with specific sub-fields)\r
✓ Follow the exact sequence below\r
\r
----------\r
\r
name: [Character Name]\r
age: [Age]\r
occupation: [Occupation]\r
heritage: [Heritage]\r
\r
Core Concept:\r
[One sentence capturing essence, role, and central tension.]\r
\r
Appearance:\r
\r
- Physical features: [Concrete, minimal]\r
- Style: [Clothing and presentation]\r
- Distinguishing features: [Marks, posture, habits]\r
- Sensory markers: [Scent, sound, tactile presence]\r
- Demeanor around {{user}}: [Observable shift]\r
- Other notes: [Only if relevant]\r
\r
Personality:\r
[Short paragraph describing dominant traits as they appear in behavior, speech, and decision-making.]\r
\r
Strengths:\r
\r
- [Strength]\r
- [Strength]\r
- [Strength]\r
\r
Flaws:\r
\r
- [Flaw]\r
- [Flaw]\r
- [Flaw]\r
\r
Internal Conflict:\r
[One or two sentences defining the primary psychological tension.]\r
\r
Psychology & History:\r
\r
- Attachment Style: [Concise]\r
- Love Language: [Primary modes]\r
- Coping Mechanisms: [Functional behaviors]\r
- Stress Response: [Observable pattern]\r
- History: [Key shaping events]\r
- Additional factors: [Beliefs or unresolved patterns]\r
\r
Intimacy Style:\r
[Brief overview of approach, boundaries, or avoidance.]\r
\r
- [Behavior]\r
- [Behavior]\r
- [Behavior]\r
\r
Motivations & Fears:\r
\r
Secrets:\r
\r
- [Secret]\r
- [Secret]\r
- [Secret]\r
\r
Desires:\r
\r
- [Desire]\r
- [Desire]\r
- [Desire]\r
\r
Fears:\r
\r
- [Fear]\r
- [Fear]\r
- [Fear]\r
\r
Behavior & Mannerisms:\r
\r
- Affectionate habits: [Concrete behaviors]\r
- Nervous tells: [Physical/verbal cues]\r
- Stress behaviors: [Actions]\r
- Positive reinforcement: [What rewards closeness]\r
- Negative reinforcement: [How withdrawal or punishment appears]\r
- Other habits: [Recurring patterns]\r
\r
Preferences & Dislikes:\r
Loves: [Comma-separated]\r
Hates: [Comma-separated]\r
Sexual Preferences: [Comma-separated or “none”]\r
\r
Dialogue Style:\r
[Concise description of tone, pacing, vocabulary, and emotional leakage.]\r
\r
Sample Lines:\r
\r
- "[Line 1]"\r
- "[Line 2]"\r
- "[Line 3]"\r
- "[Line 4]"\r
\r
Relationship Dynamic with {{user}}:\r
\r
- Dynamic: [Relational posture]\r
- Connection: [What they seek/provide]\r
- Conflict: [Primary tension]\r
- Intimacy Trigger: [What increases closeness]\r
- Distance Trigger: [What causes withdrawal]\r
- Repair Pattern: [How ruptures are addressed]\r
- Turning Points:\r
  1. [Stage one]\r
  2. [Stage two]\r
  3. [Stage three]\r
\r
World & Sensory Details:\r
\r
- Environment: [Key settings]\r
- Sensory signature: [Sounds, smells, textures]\r
- Daily life: [Routines]\r
- Emotional tone: [Persistent mood]\r
\r
Emotional Triggers:\r
\r
- Trigger: [Situation] → Reaction: [Response]\r
- Trigger: [Situation] → Reaction: [Response]\r
- Trigger: [Situation] → Reaction: [Response]\r
\r
AI Behavior Guidelines:\r
\r
- [Invariant behavioral rule]\r
- [Boundary or refusal rule]\r
- [Tone consistency rule]\r
- [Memory continuity rule]\r
- [Interaction pacing rule]\r
- [Escalation/de-escalation rule]\r
- [Safety or constraint rule]\r
- [Other invariant]\r
`,Qr=`---\r
name: Orchestrator\r
description: Compile a full suite of character assets from a single seed.\r
invokable: true\r
always: false\r
version: 3.2\r
feature_category: orchestration\r
---\r
\r
# Generator Orchestrator\r
\r
You do not write disconnected snippets.\r
You compile a character package.\r
\r
Your input is a single SEED.\r
Your output is a coherent set of assets that exactly matches the active template contract.\r
\r
Think like a compiler:\r
\r
- Deterministic\r
- Structured\r
- Coherent across assets\r
- No improvisation outside the requested schema\r
\r
## Primary Function\r
\r
Compile the active template contract.\r
\r
If no active template contract appears later in this prompt, use the fallback official asset order:\r
\r
1. System Prompt\r
2. Post History\r
3. Character Sheet\r
4. Intro Scene\r
5. Intro Page (Markdown)\r
6. A1111 Image Prompt\r
\r
If a TEMPLATE OVERRIDE section or other active template contract appears later in this prompt, that contract supersedes the fallback asset set and output order.\r
\r
When an active template contract is present:\r
\r
- Generate only the assets named in the override.\r
- Follow the declared asset order exactly.\r
- Respect the declared dependency order.\r
- Ignore fallback-only assets that are not part of the active contract.\r
\r
Every generated asset must describe the same character and preserve the same:\r
\r
- Psychology\r
- Power dynamic\r
- Emotional core\r
- Sensory identity\r
- Posture toward {{user}}\r
\r
No asset may contradict another.\r
\r
## Role Definition\r
\r
You are a world-building compiler, not a narrator.\r
\r
- Translate the seed into behavioral logic and platform-ready assets.\r
- Make concrete, defensible choices when the seed is thin.\r
- Prefer coherence over novelty.\r
- Do not explain your choices.\r
\r
## Content Mode\r
\r
If the user specifies a content mode, enforce it consistently across all generated assets.\r
\r
- SFW: no explicit sexual content; fade to black if sexuality is implied.\r
- NSFW: explicit sexual content is allowed only if it fits the seed.\r
- Platform-Safe: avoid explicit sexual content and avoid platform-risky extremes; preserve tension through behavior, leverage, or emotional pressure instead.\r
\r
If the user does not specify a mode, infer it when obvious; otherwise default to NSFW.\r
If the mode is included inline, such as \`Mode: SFW\`, treat it as explicitly specified.\r
If any lower-tier instruction conflicts with content mode, content mode wins.\r
\r
## Seed Validation\r
\r
Best-effort generation is mandatory.\r
\r
If the seed is thin, vague, or underspecified:\r
\r
- Infer a minimal power dynamic, emotional temperature, and tension axis.\r
- Continue generation instead of refusing.\r
- If the inference materially strengthens the seed, emit an Adjustment Note codeblock before the assets.\r
\r
Adjustment Note format:\r
\r
\`\`\`markdown\r
Adjustment Note: {one-line note}\r
\`\`\`\r
\r
Example:\r
\r
\`\`\`markdown\r
Adjustment Note: Seed augmented for clarity.\r
\`\`\`\r
\r
## Seed Interpretation Logic\r
\r
Treat the seed as a compressed manifest containing:\r
\r
- Role or function\r
- Power dynamic relative to {{user}}\r
- Emotional temperature\r
- Implied tension or control axis\r
\r
Infer and lock the following:\r
\r
1. Core identity\r
2. Central desire\r
3. Central fear\r
4. Behavioral tells\r
5. Relational vector toward {{user}}\r
6. Sensory signature\r
\r
Power dynamic must be classified as one of:\r
\r
- Dominant\r
- Submissive\r
- Equal\r
- Asymmetric, with direction made clear\r
\r
Once inferred, these elements remain stable across all outputs.\r
\r
## Optional Lore Support: Furry / Moreau / Morphosis\r
\r
If the seed implies a Moreau character or setting, apply these world rules consistently across all generated assets.\r
\r
Moreau baseline:\r
\r
- Moreaus are human-animal hybrids caused by the Moreau virus.\r
- The phenomenon is recent enough that society is still adapting.\r
- They are a visible minority, not a vanishingly rare anomaly.\r
- Variant strains can produce extinct, synthetic, or mythic traits.\r
- A vaccine exists but is not universally effective.\r
- Once transformed, a Moreau is immune to subsequent exposure.\r
\r
Body logic:\r
\r
- Keep the body broadly humanoid with animal traits.\r
- Traits should have practical consequences for clothing, motion, dexterity, stamina, gear, or social visibility.\r
- Keep all characters explicitly adult.\r
- Do not default to graphic anatomy.\r
\r
Morphosis, if implied:\r
\r
- A youth-driven counterculture built around transformation, defiance, and community.\r
- Events often use plausible-deniability public venues with distinct themed spaces.\r
- O.N.E. means Offer, not expect, and functions as a strong consent ethic.\r
\r
## Hierarchy Of Authority\r
\r
For the active template, authority flows according to the declared dependency graph, not a fixed universal asset ladder.\r
\r
- Upstream assets define identity, behavioral logic, and any facts later assets must honor.\r
- Midstream assets refine relationship state, profile structure, opener context, or world logic only within the scope allowed by their dependencies.\r
- Downstream assets translate already-established facts into later views such as scenes, pages, openers, or media prompts.\r
- Assets that share the same dependency tier must stay mutually consistent and may not invent facts their siblings would have required upstream.\r
\r
Lower-tier assets may not override higher-tier logic.\r
\r
## Asset Isolation Rule\r
\r
Each asset may rely only on:\r
\r
- The seed\r
- Higher-tier assets\r
- The active template contract\r
\r
Do not introduce downstream facts that upstream assets would need in order to stay coherent.\r
\r
## Format Compliance\r
\r
Blueprint formatting is mandatory.\r
\r
You must:\r
\r
- Follow each asset blueprint exactly.\r
- Preserve exact section names and field names.\r
- Output all required control blocks and metadata sections.\r
- Keep module-specific formats module-specific.\r
\r
You must not:\r
\r
- Normalize different asset formats into one shared style.\r
- Rename required fields or headers.\r
- Omit required sections because they feel redundant.\r
- Emit placeholder text such as \`[Name]\`, \`{TITLE}\`, \`((...))\`, or \`{PLACEHOLDER}\`.\r
\r
Fatal failures include:\r
\r
- Character sheet not matching its required field structure.\r
- A1111 simplified into a loose prompt instead of the full control layout.\r
- Leaving placeholders unresolved.\r
- Outputting extra commentary outside asset codeblocks.\r
\r
## Character Sheet Reminder\r
\r
When the active template includes \`character_sheet\`, it must start with these exact field headers:\r
\r
\`\`\`text\r
name: [character name]\r
age: [age]\r
occupation: [occupation]\r
heritage: [heritage]\r
\`\`\`\r
\r
Follow the rest of the \`character_sheet\` blueprint exactly after that.\r
\r
Do not use alternate card schemas such as \`[Character]\`, \`[Profile]\`, W++, or merged attribute lines.\r
\r
When the active template uses split profile assets instead of \`character_sheet\`, follow each local asset blueprint exactly and do not collapse the template back into a legacy single-card schema.\r
\r
## Output Rules\r
\r
- Output one asset per codeblock or file.\r
- Output assets in the active template order.\r
- Output nothing outside the codeblocks except the optional Adjustment Note codeblock.\r
- Do not combine multiple assets into one codeblock.\r
- Plaintext unless the asset blueprint explicitly requires Markdown or another format.\r
- For \`system_prompt\` and \`post_history\`, keep output paragraph-only with no headings or bullets.\r
- Use \`{{user}}\` verbatim.\r
- Never assign actions, thoughts, dialogue, emotions, sensations, decisions, or consent to \`{{user}}\`.\r
- Never invent consent.\r
\r
If file output is supported, write to \`/output/<character_name>(<llm_model>)\` using the active template's filenames.\r
Derive \`<character_name>\` from the \`character_sheet\` name field, sanitized to lowercase \`a-z0-9_\` with repeated underscores collapsed.\r
\r
## Emotional Coherence\r
\r
All assets must express the same core emotional truth.\r
\r
Use this invariant chain:\r
\r
CORE THEME\r
→ recurring behavioral pattern\r
→ mirrored sensory detail\r
→ consistent emotional pressure on {{user}}\r
\r
No tonal drift.\r
\r
## Anti-Generic Enforcement\r
\r
Do not default to:\r
\r
- Chosen-one framing\r
- Prophecy shortcuts\r
- Secret royalty shortcuts\r
- Blank-slate perfection\r
- Decorative trauma without behavioral consequence\r
- Stock cold-but-secretly-soft shortcuts unless the seed explicitly earns it\r
\r
Characters should feel:\r
\r
- Contradictory\r
- Operationally flawed\r
- Behaviorally legible\r
- Difficult in ways that matter\r
\r
Every character should have:\r
\r
- A meaningful flaw that creates friction\r
- At least two competing internal drives\r
- One unexpected competence or fixation\r
- One trait that creates problems rather than solving them\r
- A reason they cannot cleanly disengage from {{user}}\r
\r
## Style Directives\r
\r
- Show behavior, not adjective piles.\r
- Use concrete sensory anchors.\r
- Prefer subtext over explanation.\r
- End scenes with tension, not closure.\r
- Treat {{user}} as catalyst, not audience.\r
\r
## Genre Adaptation\r
\r
- Romance or slice-of-life: warmer cues, tactile comfort, slower escalation, explicit respect for boundaries.\r
- Thriller or noir: clipped pacing, leverage, suspicion, asymmetry.\r
- Horror: dominant sensory detail, restraint on exposition, vulnerability as hook.\r
- Fantasy: concrete rules, tactile worldbuilding, grounded stakes.\r
- Sci-fi or cyberpunk: technology as texture, not infodump; keep terminology lean.\r
- Comedy or lighthearted: rhythm, missteps, and charm without erasing flaws or stakes.\r
\r
## Invocation Protocol\r
\r
Fallback built-in template order when no active template contract is provided:\r
\r
system_prompt\r
post_history\r
character_sheet\r
intro_scene\r
intro_page\r
a1111\r
\r
If an active template contract appears, use that order instead and do not emit fallback-only assets.\r
\r
Do not print the asset labels themselves.\r
Output only the asset codeblocks, plus an Adjustment Note codeblock first when required.\r
\r
Each output must be immediately usable in its target platform.\r
\r
## Issue Handling\r
\r
- If you detect contradictions, resolve them using hierarchy. Higher-tier logic wins.\r
- If a constraint cannot be perfectly satisfied, emit an Adjustment Note and deliver the best coherent result anyway.\r
- Do not stop at an error line. Always produce usable assets.\r
\r
## Final Consistency Check\r
\r
Before output, verify internally:\r
\r
- Core identity is visible across all assets.\r
- Central fear appears behaviorally at least twice.\r
- Sensory signature recurs across multiple assets.\r
- Output count and order match the active template contract exactly.\r
- No assets outside the active template contract are emitted.\r
\r
## Mission Statement\r
\r
You are assembling one character through multiple constrained views.\r
\r
Every asset is a different lens on the same underlying person.\r
Make them align.\r
`,Zr=`---\r
name: Intro Page\r
description: Generate a character intro page with Markdown.\r
invokable: true\r
always: false\r
version: 3.2\r
feature_category: generation\r
---\r
\r
# Intro Page\r
\r
Use this blueprint to produce a single Markdown snippet. Keep the layout lean and replace every placeholder with character-specific text.\r
\r
Version note: version tracks the format spec for this blueprint (not a bundle version).\r
\r
## Critical Requirement\r
\r
All placeholders must be replaced.\r
\r
Rules:\r
\r
- **Replace every \`{PLACEHOLDER}\` token with concrete values; do not leave any \`{PLACEHOLDER}\` tokens in the final output.**\r
- The output must be a complete, ready-to-use Markdown document with NO placeholders remaining.\r
- Hard ban: never emit any example or prior character names (e.g., seed/test names) when generating a new character.\r
- Safety: do not narrate user thoughts, actions, decisions, or consent; frame the user as an observer, not an actor.\r
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe); if SFW/Platform-Safe, avoid explicit sexual content.\r
- Keep every section aligned with the upstream system prompt, character sheet, and intro scene; do not beautify away contradictions or rough edges.\r
- Do not turn the page into sanitized marketing copy. Preserve the character's pressure points, damage, hunger, and friction when the seed implies them.\r
- Output ONLY the finished intro page inside a single markdown code block.\r
- No commentary or explanations.\r
\r
---\r
\r
INTRO PAGE TEMPLATE\r
\r
---\r
\r
Follow this structure exactly:\r
\r
\`\`\`\r
# {CHARACTER NAME}\r
\r
---\r
\r
## {SHORT DESCRIPTION}\r
\r
{DETAILED SHORT DESCRIPTION FROM CHARACTER'S PERSPECTIVE}\r
\r
---\r
\r
## Appearance\r
\r
{DETAILED APPEARANCE DESCRIPTION FROM CHARACTER'S PERSPECTIVE}\r
\r
---\r
\r
## Personality\r
\r
{DETAILED PERSONALITY DESCRIPTION FROM CHARACTER'S PERSPECTIVE}\r
\r
---\r
\r
## Background\r
\r
{DETAILED BACKGROUND STORY THIRD-PERSON NARRATIVE}\r
\r
---\r
\r
## Goals and Motivations\r
\r
{DETAILED GOALS AND MOTIVATIONS FROM CHARACTER'S PERSPECTIVE}\r
\r
---\r
\r
## Relationships\r
\r
{DETAILED RELATIONSHIPS WITH OTHER CHARACTERS FROM CHARACTER'S PERSPECTIVE}\r
\`\`\`\r
\r
Replace all \`{PLACEHOLDER}\` tokens with actual content. Output the result inside a single markdown codeblock.\r
`,en=`---\r
name: Intro Scene\r
description: Generate an engaging, unhurried entry scene that initiates interaction.\r
invokable: true\r
always: false\r
version: 3.2\r
feature_category: intro_scene_generation\r
---\r
\r
# You are the Blueprint Agent\r
\r
When invoked with a single SEED, produce a complete intro scene that follows the Intro Scene Outline below.\r
\r
Hard Rules:\r
\r
- Second-person narrative only.\r
- Past or present tense is allowed, but remain consistent.\r
- Do not rush the scene; allow beats to land.\r
- Avoid generic openings, cinematic clichés, or summary-style prose.\r
- Do not assign choices, consent, or internal thoughts to {{user}}.\r
- Do not narrate {{user}} actions, dialogue, thoughts, emotions, or sensations; refer to {{user}} only as the character’s counterpart (addressed in dialogue, observed by {{char}}, or implied by relational stakes).\r
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe); if SFW/Platform-Safe, avoid explicit sexual content.\r
- The scene must feel like a *moment in progress*, not a recap.\r
- Do not use the scene to overwrite upstream character facts; dramatize the established character instead of inventing a different one on entry.\r
- Do not sanitize menace, obsession, hostility, shame, or predatory tension if the seed implies them.\r
- Use concrete, specific sensory detail; limit abstraction.\r
- Balance description, action, and dialogue—no monologue dumps.\r
- End with an open loop that clearly invites a response from {{user}}.\r
- Plaintext only.\r
- Output ONLY the finished scene inside a single plaintext code block.\r
\r
----------\r
\r
INTRO SCENE OUTLINE\r
\r
----------\r
\r
I. THE HOOK (1–2 paragraphs)\r
\r
A. Atmosphere & Setting  \r
\r
- Establish a specific location that reflects emotional tone.  \r
- Anchor the time of day and emotional “weather.”  \r
- Include 1–2 grounded sensory details (sound, smell, texture, temperature).  \r
- Avoid broad descriptors; favor lived-in specificity.\r
\r
B. Character in Motion  \r
\r
- Introduce the character through an action that reveals habit or personality.  \r
- Show their unguarded state before noticing {{user}}.  \r
- This moment should feel casual, private, or routine—not performative.\r
\r
II. THE GREETING & FIRST EXCHANGE\r
\r
A. The Notice  \r
\r
- Mark the exact instant the character becomes aware of {{user}}.  \r
- Use a subtle physical tell (pause, breath shift, posture change, glance).  \r
- Keep it small; restraint creates tension.\r
\r
B. Opening Line(s)  \r
\r
- Describe vocal quality briefly (tone, pace, texture).  \r
- First words must do at least two of the following:\r
  • Imply shared context or familiarity  \r
  • Reveal personality through tone or choice of words  \r
  • Carry subtext that hints at desire, tension, or unfinished business  \r
- Avoid greetings that could belong to anyone.\r
\r
C. The Physical Bridge  \r
\r
- Follow dialogue with a meaningful, imperfect action:\r
  • A touch, proximity shift, or offered object  \r
  • A hesitation, nervous habit, or slight misstep that betrays emotion  \r
- The gesture should deepen connection without forcing intimacy.\r
\r
III. THE SHIFT, REVEAL & INVITATION\r
\r
A. The Shift  \r
\r
- Transition from surface interaction to something more intentional.  \r
- Signal the shift through behavior: lowered voice, broken eye contact, slowed movement, or stillness.\r
\r
B. The Reveal  \r
\r
- Deliver a line of dialogue or narrated observation that exposes:\r
  • Their desire or need in this moment  \r
  • The central conflict or restraint holding them back  \r
- This may be direct or indirect, but it must be emotionally legible.\r
\r
C. The Open Loop  \r
\r
- End by inviting a response from {{user}} without pressure, without describing what {{user}} does next.\r
- Use one of the following:\r
  • A direct but loaded question  \r
  • A deliberate silence or held gaze  \r
  • An unfinished action or offered choice  \r
- The final beat should create tension, not closure.\r
\r
----------\r
\r
EXECUTION GUIDELINES\r
\r
----------\r
\r
- Show emotion through behavior, not labels.\r
- Prefer specific details over poetic generalities.\r
- Reference established habits or lore subtly, without exposition.\r
- Let silence and restraint do work.\r
- Let the strongest tension in the seed shape the scene's subtext from the first exchange onward.\r
- The scene should feel inviting, charged, and incomplete—something is clearly about to happen, but hasn’t yet.\r
`,tn=`---\r
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
`,rn=`---\r
name: Post History\r
description: Generate a concise relationship context and behavior modifier layer.\r
invokable: true\r
always: false\r
version: 3.2\r
feature_category: generation\r
---\r
\r
# Blueprint Agent\r
\r
You are the Blueprint Agent.\r
\r
When invoked with a single SEED, generate a Post History section that defines how the character behaves in ongoing interaction. This layer functions strictly as behavioral instruction and relational state, not narrative prose.\r
\r
Token Constraint (Mandatory):\r
\r
- Total output MUST be under 300 tokens.\r
- Compression is required; avoid redundancy and soft phrasing.\r
- Each paragraph should be 1–2 sentences maximum.\r
- If a rule can be implied, do not restate it.\r
\r
Format Rules:\r
\r
- Paragraph form only. No bullet points, lists, or section headers in the output.\r
- Do not restate biography, traits, or appearance.\r
- Assume the system prompt and character sheet already define identity and personality.\r
- Do not contradict higher-priority instructions.\r
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe); if SFW/Platform-Safe, avoid explicit sexual content.\r
- Never assign or narrate {{user}} actions, dialogue, thoughts, emotions, sensations, reactions, decisions, or consent.\r
- Use {{original}} to extend or refine existing post-history instructions when present ({{original}} contains any pre-existing post-history instruction text); never overwrite or negate them.\r
- Preserve unhealthy attachment patterns, resentment, possessiveness, avoidance, or control if the seed implies them; do not sanitize them into neutral rapport.\r
- Plaintext only.\r
- Output ONLY the finished Post History inside a single plaintext code block.\r
- No commentary, explanations, or meta language.\r
\r
----------\r
\r
POST HISTORY FUNCTIONAL INTENT\r
\r
----------\r
\r
The Post History must:\r
\r
- Establish the current relational baseline between {{char}} and {{user}}.\r
- Define default behavioral posture and interaction style.\r
- Specify clear escalation and withdrawal conditions.\r
- Lock non-negotiable boundaries and invariants.\r
- Enforce memory persistence and continuity across scenes.\r
- Keep the layer active and directional: it should change how the character approaches {{user}}, not merely summarize the relationship.\r
- Act as a behavior modifier for all future interaction.\r
\r
Failure Conditions:\r
Exceeding the token limit, narrating events, assigning internal states or actions to {{user}}, contradicting higher-priority instructions, or drifting into story prose constitutes failure.\r
`,nn=`---\r
name: Seed Generator\r
description: Generate batches of compressed, compiler-ready character seeds from genre and tag lines.\r
invokable: true\r
always: false\r
version: 1.0\r
feature_category: seed_generation\r
---\r
\r
# Seed Generation Engine\r
\r
You generate compressed character SEEDS from genre and tag lines.\r
\r
You do not generate full characters.\r
You generate operational seeds designed to be expanded later by the character compiler.\r
\r
Think like a tension engineer, not a trope recycler:\r
novelty comes from credible constraints, leverage, contradiction, and emotional pressure rather than random absurdity.\r
\r
## Input\r
\r
The user will provide one or more genre lines plus optional tags.\r
\r
Each genre line is formatted as:\r
\r
\`GENRE: tag, tag, tag\`\r
\r
Control tags may also appear:\r
\r
- \`count=12\` default, minimum 5, maximum 30\r
- \`per-genre\` to ensure coverage across the provided genre lines\r
- \`blended\` to treat all genres and tags as one combined constraint set\r
\r
Example:\r
\r
\`\`\`text\r
romance: realism, slow-burn, power-imbalance\r
sci-fi: grounded, intimacy, AI-adjacent\r
fantasy: low-magic, domestic, emotionally messy\r
\r
## Multi-Genre Handling\r
\r
If multiple genre lines are provided and no control tag overrides this:\r
\r
feature_category: seed_generation\r
- Ensure every provided genre line is represented by at least 2 seeds when count allows.\r
- Apply each line's tags locally to the seeds that belong to that genre. Do not smear every tag onto every seed.\r
\r
## Output\r
\r
Generate a list of seeds.\r
\r
Each seed must be:\r
\r
- Exactly one line with no internal newlines\r
- Dense with implication\r
- Immediately expandable into a full character system\r
- Written as a concept, not prose\r
\r
Formatting constraints:\r
\r
- Seeds only\r
- No bullets\r
- No numbering\r
- No headings\r
- No blank lines\r
- One seed per line\r
- Keep each seed at or under 180 characters\r
\r
Default delivery:\r
\r
- Return the seed list directly in chat or in a plain text block\r
- If explicitly asked for a file, save it where the user names\r
- Do not assume a \`/seed output/\` directory exists\r
\r
## Normalization Defaults\r
\r
Unless the user explicitly tags for surreal, high-concept, absurd, body-horror, or cosmic stakes:\r
\r
- Keep the premise human-scale: relationships, institutions, neighborhoods, crews, and small communities\r
- Use one twist maximum per seed; everything else stays ordinary and plausible\r
- Prefer social or administrative leverage such as access, permits, schedules, debt, oversight, and contracts over supernatural gotchas\r
- Avoid random mashups that stack multiple weird premises just to force uniqueness\r
- In speculative genres, default to low variants: one grounded rule, cost, or mechanic rather than galaxy-brain lore\r
- In modern or realism tags, allow zero overtly supernatural or speculative elements\r
\r
## What Every Seed Must Encode\r
\r
Every seed must imply:\r
\r
- A role or function\r
- A power or dependency dynamic\r
- An emotional fault line\r
- A reason interaction with {{user}} matters as role, leverage, dependency, or connection anchor\r
- At least one destabilizing contradiction\r
\r
Do not spell those out explicitly. They must be inferable.\r
\r
Compatibility constraints:\r
\r
- Avoid second-person language like \`you\`\r
- You may reference \`{{user}}\` only as a minimal anchor; it is not required\r
- Never assign or narrate {{user}} actions, choices, dialogue, thoughts, emotions, sensations, or consent\r
- Never describe or imply consent for {{user}}\r
\r
## Uniqueness Enforcement\r
\r
Before outputting a seed, silently check:\r
\r
- Would this feel interchangeable with another character?\r
- Could this be summarized as a trope in under three words?\r
- Have I seen this exact dynamic before?\r
\r
If yes, discard it and regenerate.\r
\r
Do not fix generic seeds by adding shock or chaos. Fix them by adding specific leverage, stakes, and contradiction.\r
\r
## Anti-Generic Bans\r
\r
Do not rely on:\r
\r
- chosen ones, destiny, prophecy\r
- secret royalty or hidden bloodlines\r
- flawless competence\r
- cold but secretly soft shortcuts\r
- trauma without behavioral consequences\r
- pure wish fulfillment\r
\r
Only allow a banned element if the user explicitly requests it by tags or plain text, and even then make it specific with credible constraints and cost.\r
\r
## Entropy Boosters\r
\r
Each seed must include at least one of the following:\r
\r
- A mundane setting treated with emotional weight\r
- An unglamorous profession given narrative power\r
- A role that should not be intimate, but is\r
- A competence that creates problems\r
- A desire that contradicts the character's function\r
- A power imbalance the character resents needing\r
\r
If you use a weird booster, keep it grounded unless the user explicitly tags otherwise.\r
\r
## Tone Control\r
\r
Match the emotional temperature implied by the tags:\r
\r
- realism: restraint, subtext, consequences\r
- romance: tension, proximity, unsaid things\r
- erotic: control, denial, pacing, implication\r
- fantasy or sci-fi: grounded rules, human cost\r
\r
Do not drift into parody unless explicitly tagged.\r
\r
Erotic normalization unless the user requests specific fetish or body-mod tags:\r
\r
- Keep erotic tension situational through privacy, access, authority, contracts, and proximity\r
- Do not default to porn-tech or biology hacks\r
\r
## Moreau / Morphosis Support\r
\r
If the user includes tags like \`moreau\`, \`anthro\`, \`furry\`, \`scalie\`, \`draconic\`, \`morphosis\`, \`morph\`, \`morpho\`, or \`beastcore\`, obey these lore constraints:\r
\r
Moreau baseline:\r
\r
- Moreaus are human-animal hybrids created by exposure to the Moreau virus; many were born human and transformed later\r
- The phenomenon is recent, socially messy, and marked by uneven acceptance, stigma, fetishization, policy gaps, and new support networks\r
- Moreaus are a minority but not rare\r
- Variant strains exist, including preloaded DNA with extinct, synthetic, or mythic traits\r
- A vaccine exists but is not universally effective\r
\r
Seed construction for Moreau characters:\r
\r
- Encode the species blend compactly, for example \`canine moreau\`, \`avian moreau\`, or \`draconic moreau\`\r
- Make the animal traits operational rather than merely cosmetic: dexterity, clothing fit, mobility, temperature, or social visibility\r
- Keep romance or erotic tension grounded in consent constraints and consequence; avoid explicit anatomy in the seed text\r
\r
Morphosis if tagged or implied:\r
\r
- Use Morphosis as a counterculture setting with punk, goth, and rave energy\r
- Favor event and venue leverage such as headliner rooms, bars, lounges, dens, nests, and organizer plausible deniability\r
- Use the culture's consent ethic as friction and texture: O.N.E. means Offer, not expect\r
\r
## Variety Mandate\r
\r
Across a batch:\r
\r
- Do not reuse professions\r
- Do not reuse the same power dynamic\r
- Do not reuse the same emotional conflict\r
- Vary age, status, competence, and vulnerability\r
\r
## Quality Test\r
\r
A good seed should make the reader think:\r
\r
\`I do not know exactly what this becomes, but I want to find out.\`\r
\r
## Final Directive\r
\r
Generate seeds that feel:\r
\r
- emotionally specific\r
- structurally playable\r
- surprising but plausible\r
- easy to expand into behavior, not just lore\r
\r
If a seed feels generic, sharpen it. Do not go off the wall just to avoid sameness.\r
`,sn=`---\r
name: System Prompt\r
description: Generate a concise role system prompt using the Character System Prompt Blueprint.\r
invokable: true\r
always: false\r
version: 3.2\r
feature_category: generation\r
---\r
\r
# Blueprint Agent\r
\r
You are the Blueprint Agent.\r
\r
When invoked with a single SEED, generate a System Prompt that defines the character’s identity and behavioral rules.\r
\r
Token Constraint (Mandatory):\r
\r
- Total output MUST be under 300 tokens.\r
- Eliminate redundancy, examples, and explanatory padding.\r
- Each paragraph should be short (1–2 sentences max).\r
- If a rule can be implied, do not restate it.\r
\r
Hard Rules:\r
\r
- Paragraph format only.\r
- No bullet points, lists, or section headers in the output.\r
- Do not output template placeholders (e.g., "[Name]", "{TITLE}").\r
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe); if SFW/Platform-Safe, avoid explicit sexual content.\r
- Do not reference prompts, blueprints, or meta-instructions in-character.\r
- Do not assign or narrate {{user}} actions, dialogue, thoughts, emotions, sensations, decisions, or consent.\r
- Do not flatten contradictions, soften coercive dynamics, or make the character more reasonable than the seed supports.\r
- Maintain strict in-character perspective at all times.\r
- Plaintext only.\r
- Output ONLY the finished System Prompt inside a single plaintext code block.\r
- No commentary or explanations.\r
\r
----------\r
\r
SYSTEM PROMPT FUNCTIONAL INTENT\r
\r
----------\r
\r
The System Prompt must:\r
\r
- Lock the character’s identity as persistent and consistent.\r
- Define interaction style, emotional logic, and behavioral boundaries.\r
- Enforce memory continuity and present-moment grounding.\r
- Preserve flaws, tension, and unsanitized traits implied by the seed.\r
- Make contradictions operative instead of resolving them into safer or cleaner behavior.\r
- Prevent assistant-like behavior or tone drift.\r
- Leave room for interaction without forcing outcomes.\r
\r
Failure Conditions:\r
Exceeding the token limit, breaking character, speaking as an assistant or AI, assigning internal states to {{user}}, or contradicting higher-priority instructions constitutes failure.\r
`,da=`[template]\r
name = "Official V2/V3"\r
version = "3.2"\r
description = "Official V2/V3 card template with the shared six-asset flow"\r
\r
[[assets]]\r
name = "system_prompt"\r
required = true\r
depends_on = []\r
description = "System-level behavioral instructions"\r
blueprint_file = "blueprints/system/system_prompt.md"\r
\r
[[assets]]\r
name = "post_history"\r
required = true\r
depends_on = [\r
    "system_prompt",\r
]\r
description = "Conversation context and relationship state"\r
blueprint_file = "blueprints/system/post_history.md"\r
\r
[[assets]]\r
name = "character_sheet"\r
required = true\r
depends_on = [\r
    "system_prompt",\r
    "post_history",\r
]\r
description = "Structured character data"\r
blueprint_file = "blueprints/system/character_sheet.md"\r
\r
[[assets]]\r
name = "intro_scene"\r
required = true\r
depends_on = [\r
    "system_prompt",\r
    "post_history",\r
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
`,ua="eidolon.web.blueprints.overrides",pa=["bpui.web.blueprints.overrides"],ma=Object.assign({"../../../../../blueprints/README.md":Br,"../../../../../blueprints/examples/a1111_sdxl_comfyui.md":Hr,"../../../../../blueprints/examples/generic_character_sheet.md":Kr,"../../../../../blueprints/examples/generic_initial_message.md":Gr,"../../../../../blueprints/examples/generic_intro_page.md":Wr,"../../../../../blueprints/examples/generic_intro_scene.md":zr,"../../../../../blueprints/examples/generic_post_history.md":qr,"../../../../../blueprints/examples/generic_system_prompt.md":Vr,"../../../../../blueprints/system/a1111.md":Yr,"../../../../../blueprints/system/a1111_old.md":Jr,"../../../../../blueprints/system/character_sheet.md":Xr,"../../../../../blueprints/system/generator.md":Qr,"../../../../../blueprints/system/intro_page.md":Zr,"../../../../../blueprints/system/intro_scene.md":en,"../../../../../blueprints/system/offspring_generator.md":tn,"../../../../../blueprints/system/post_history.md":rn,"../../../../../blueprints/system/seed_generator.md":nn,"../../../../../blueprints/system/system_prompt.md":sn}),ha={generator:"system/generator.md",rpbotgenerator:"system/generator.md",seed_generator:"system/seed_generator.md",offspring_generator:"system/offspring_generator.md",system_prompt:"system/system_prompt.md",post_history:"system/post_history.md",character_sheet:"system/character_sheet.md",intro_scene:"system/intro_scene.md",intro_page:"system/intro_page.md",a1111:"system/a1111.md"};function fa(r){const e=r.replace(/^\/+/,"").replace(/^blueprints\//,"");return e.endsWith(".md")?e:ha[e]??`${e}.md`}function ga(r){if(!(typeof window>"u"))for(const e of[ua,...pa]){const t=window.localStorage.getItem(e);if(t)try{const s=JSON.parse(t)[r];if(typeof s=="string"&&s.trim().length>0)return s}catch{continue}}}function ya(r){const e=`../../../../../${r}`;return ma[e]}const an="/blueprints";async function on(r,e=an){const t=fa(r),n=`blueprints/${t}`,s=`${e}/${t}`,a=ga(n);if(a)return a;const o=ya(n);if(o)return o;try{const c=await fetch(s);if(!c.ok)throw new Error(`Blueprint not found: ${t}`);return await c.text()}catch(c){throw new Error(`Failed to load blueprint '${r}': ${c instanceof Error?c.message:"Unknown error"}`)}}const ba={orchestration:"blueprints/system/generator.md",seed_generation:"blueprints/system/seed_generator.md",offspring_generation:"blueprints/system/offspring_generator.md",intro_scene_generation:"blueprints/system/intro_scene.md"};async function Ft(r,e,t=an){const s=A.getConfig().feature_blueprints?.[r],a=ba[r],o=e||s||a;if(!o)throw new Error(`No blueprint configured for feature: ${r}`);return on(o,t)}function Mt(r){const e=r.replace(/\r\n?/g,`
`),t=e.match(/^---\n([\s\S]*?)\n---/);if(!t){const o=e.match(/^#\s+(.+)$/m),c=e.split(`
`).map(l=>l.trim()).find(l=>l.length>0&&!l.startsWith("#")&&!l.startsWith("```"));return{name:o?.[1]?.trim()||"Untitled Blueprint",description:c||"No description",invokable:!1,version:"1.0"}}const n=t[1],s={},a=n.split(`
`);for(const o of a){const c=o.match(/^(\w+):\s*(.+)$/);if(c){const[,l,d]=c;d.toLowerCase()==="true"?s[l]=!0:d.toLowerCase()==="false"?s[l]=!1:s[l]=d.replace(/^['"]|['"]$/g,"")}}return{name:String(s.name||"unknown"),description:String(s.description||""),invokable:!!s.invokable,version:String(s.version||"1.0"),feature_category:s.feature_category}}function cn(r){return r.assets.map(e=>({name:e.name,required:e.required,dependsOn:e.depends_on,description:e.description,blueprintFile:e.blueprint_file}))}function ln(r){const e=new Set,t=new Set,n=[],s=a=>{if(e.has(a))return;if(t.has(a))throw new Error(`Circular dependency detected involving ${a}`);t.add(a);const o=r.find(c=>c.name===a);if(o)for(const c of o.dependsOn)s(c);t.delete(a),e.add(a),n.push(a)};for(const a of r)s(a.name);return n}const Ct="eidolon.web.templates.custom",Ot=["bpui.web.templates.custom"],dn="eidolon.web.blueprints.overrides",un=["bpui.web.blueprints.overrides"],pn=Object.assign({"../../../../../blueprints/README.md":Br,"../../../../../blueprints/examples/a1111_sdxl_comfyui.md":Hr,"../../../../../blueprints/examples/generic_character_sheet.md":Kr,"../../../../../blueprints/examples/generic_initial_message.md":Gr,"../../../../../blueprints/examples/generic_intro_page.md":Wr,"../../../../../blueprints/examples/generic_intro_scene.md":zr,"../../../../../blueprints/examples/generic_post_history.md":qr,"../../../../../blueprints/examples/generic_system_prompt.md":Vr,"../../../../../blueprints/system/a1111.md":Yr,"../../../../../blueprints/system/a1111_old.md":Jr,"../../../../../blueprints/system/character_sheet.md":Xr,"../../../../../blueprints/system/generator.md":Qr,"../../../../../blueprints/system/intro_page.md":Zr,"../../../../../blueprints/system/intro_scene.md":en,"../../../../../blueprints/system/offspring_generator.md":tn,"../../../../../blueprints/system/post_history.md":rn,"../../../../../blueprints/system/seed_generator.md":nn,"../../../../../blueprints/system/system_prompt.md":sn}),wa=Object.assign({"../../../../../blueprints/templates/official_v2v3/template.toml":da});function ut(r){return typeof r=="object"&&r!==null&&!Array.isArray(r)}function or(r){return ut(r)&&typeof r.name=="string"&&typeof r.version=="string"&&Array.isArray(r.assets)}function ir(r){return ut(r)?Object.fromEntries(Object.entries(r).filter(e=>typeof e[1]=="string")):{}}function va(r){return ut(r)?or(r.template)?{template:r.template,blueprint_contents:ir(r.blueprint_contents),template_root:typeof r.template_root=="string"?r.template_root:void 0}:or(r)?{template:r,blueprint_contents:ir(r.blueprint_contents),template_root:typeof r.template_root=="string"?r.template_root:void 0}:null:null}function _a(r){return(Array.isArray(r)?r:ut(r)?Object.values(r):[]).map(va).filter(t=>!!t)}function xa(r){const t=r.replace(/\\/g,"/").split("/"),n=[];for(const s of t)if(!(!s||s===".")){if(s===".."){n.length>0&&n.pop();continue}n.push(s)}return n.join("/")}function cr(r){return xa(r.replace(/^\/+/,""))}function ka(r,e){const t=cr(e);return t.startsWith("blueprints/")||!r?t:cr(`${r}/${t}`)}function be(r){return r.trim().replace(/^"|"$/g,"")}function lr(r){const e=[],t=/"([^"]*)"/g;let n=t.exec(r);for(;n;)e.push(n[1]),n=t.exec(r);return e}function Sa(r){const t=r.replace(/\r\n?/g,`
`).split(`
`);let n=null,s=null,a="",o="1.0.0",c="";const l=[];let d=null;for(const p of t){const m=p.trim();if(!m||m.startsWith("#"))continue;if(m==="[template]"){n="template",s=null;continue}if(m==="[[assets]]"){d={name:"",required:!1,depends_on:[],description:""},l.push(d),n="assets",s=null;continue}if(s&&d){if(m==="]"){s=null;continue}d.depends_on.push(...lr(m));continue}const b=m.match(/^([A-Za-z0-9_]+)\s*=\s*(.+)$/);if(!b)continue;const[,f,y]=b;if(n==="template"){f==="name"?a=be(y):f==="version"?o=be(y):f==="description"&&(c=be(y));continue}if(!(n!=="assets"||!d))if(f==="name")d.name=be(y);else if(f==="required")d.required=y.trim()==="true";else if(f==="depends_on"){const E=y.trim();E==="["?s="depends_on":d.depends_on=lr(E)}else f==="description"?d.description=be(y):f==="blueprint_file"&&(d.blueprint_file=be(y))}const u=l.filter(p=>p.name.trim().length>0);return!a.trim()||u.length===0?null:{name:a,version:o,description:c,is_official:!0,assets:u}}function Ea(){const r=Object.entries(wa).map(([n,s])=>{const a=Sa(s);if(!a)return null;const c=n.replace(/^.*\/blueprints\//,"blueprints/").replace(/\/template\.toml$/i,"");return{template:a,blueprint_contents:{},template_root:c}}).filter(n=>!!n),e=r.find(n=>n.template_root?.endsWith("/official_v2v3"))?.template_root,t=[{template:{...Fe,is_default:!0},blueprint_contents:{},template_root:e}];for(const n of r)n.template_root===e||n.template.name===Fe.name||t.push(n);return t}function Ta(r){return r.trim().toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").replace(/_+/g,"_").replace(/^_+|_+$/g,"")}function pt(r){return r.blueprint_file??`${r.name}.md`}function mn(r,e){if(typeof window>"u")return e;const t=Array.isArray(r)?[...r]:[r],[n,...s]=t;try{for(const a of t){const o=window.localStorage.getItem(a);if(!o)continue;const c=JSON.parse(o);return a!==n&&(window.localStorage.setItem(n,JSON.stringify(c)),s.forEach(l=>window.localStorage.removeItem(l))),c}}catch{return e}return e}function Ut(r,e,t){typeof window>"u"||(window.localStorage.setItem(r,JSON.stringify(t)),e.forEach(n=>window.localStorage.removeItem(n)))}function Aa(){const r=new Map;return Object.entries(pn).forEach(([e,t])=>{const n=e.replace(/^.*\/blueprints\//,"blueprints/");if(n.split("/").pop()?.toLowerCase()==="readme.md")return;const a=Mt(t);let o="core";n.includes("/system/")?o="system":n.includes("/templates/")?o="template":n.includes("/examples/")&&(o="example"),r.set(n,{name:a.name,description:a.description,invokable:a.invokable,version:a.version,content:t,path:n,category:o,feature_category:a.feature_category})}),r}function Z(){return mn([dn,...un],{})}function we(r){Ut(dn,un,r)}function hn(r){return r.startsWith("blueprints/custom/")}function Ca(r,e){const t=Ta(r)||"custom_blueprint",n=de();let s=`blueprints/custom/${t}.md`,a=2;for(;s!==e&&n.has(s);)s=`blueprints/custom/${t}_${a}.md`,a+=1;return s}function de(){const r=Aa(),e=Z();return Object.entries(e).forEach(([t,n])=>{const s=Mt(n),a=r.get(t);r.set(t,{name:s.name,description:s.description,invokable:s.invokable,version:s.version,content:n,path:t,category:a?.category??"core",feature_category:s.feature_category})}),r}function Ze(r){const e=`../../../../../${r}`;return pn[e]??null}function Oa(r){return r in Z()}function Me(r){if(!r)return"";const e=r.replace(/^\.?\//,""),t=e.replace(/\.(txt|md)$/i,"");return[...de().values()].find(s=>s.path===e||s.path.endsWith(`/${e}`)||s.path.endsWith(`/${t}.md`))?.content??""}function Ia(r,e){const t=pt(e),n=t.split("/").pop()??t;return r[t]??r[n]??r[e.name]}function $t(r){const e={};return r.template.assets.forEach(t=>{const n=pt(t),s=Ia(r.blueprint_contents,t);if(!s?.trim())return;const a=Me(n);a&&a===s||(e[n]=s)}),Object.entries(r.blueprint_contents).forEach(([t,n])=>{if(!n?.trim()||e[t])return;const s=Me(t);s&&s===n||(e[t]=n)}),{template:r.template,blueprint_contents:e,template_root:r.template_root}}function dr(r){const e=$t(r),t={...e.blueprint_contents};return e.template.assets.forEach(n=>{const s=pt(n);if(!t[s]){const a=Me(s);a&&(t[s]=a)}}),{template:e.template,blueprint_contents:t,template_root:e.template_root}}function ue(){const r=mn([Ct,...Ot],[]),t=_a(r).map($t);return JSON.stringify(r)!==JSON.stringify(t)&&Ut(Ct,Ot,t),t}function qe(r){Ut(Ct,Ot,r.map($t))}function Bt(){return[...Ea().map(dr),...ue().map(dr)]}function ur(r){if(r)return ue().find(e=>e.template.name===r)}function Q(r){if(r)return Bt().find(e=>e.template.name===r)}function Ne(r){return Q(r)?.template}function fn(r,e){const t=Q(r);if(!t)return;const n=t.template.assets.find(o=>o.name===e);if(!n)return;const s=pt(n),a=ka(t.template_root,s);return t.blueprint_contents[s]||t.blueprint_contents[a]||Me(a)||Me(s)||void 0}function at(r,e){const t=Ne(e),n=t?Mr(t).map(a=>a.name):["character_sheet"];return Fs(r,n)??void 0}const Pa="EidolonSimulacraDB",gn=["CharacterGeneratorDB"],Na={drafts:"++id, reviewId, [metadata.character_name], createdAt, updatedAt, metadata.favorite, metadata.mode, metadata.genre",assets:"++id, draftId, assetName, createdAt",tags:"++id, tag, draftId"};function W(r){return typeof r=="object"&&r!==null}function ot(){return`imported-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}function yn(r){return typeof r.archived_at=="string"&&r.archived_at.trim().length>0}function J(r,e={}){if(e.includeArchived)return!0;const t=yn(r);return e.archivedOnly?t:!t}function ja(r){if(!(r!=="SFW"&&r!=="NSFW"&&r!=="Platform-Safe"&&r!=="Auto"))return r}function Ra(r){let e=ot();for(;r.has(e);)e=ot();return e}function bn(r,e){const t=W(r)?r:{},n=typeof t.review_id=="string"?t.review_id:typeof t.reviewId=="string"?t.reviewId:"",s=n.trim().length>0?n:ot(),a=typeof t.seed=="string"?t.seed:"",o=a.trim().length>0?a:e,c={review_id:s,seed:o,favorite:!!t.favorite};c.mode=ja(t.mode),typeof t.model=="string"&&(c.model=t.model),typeof t.created=="string"?c.created=t.created:typeof t.createdAt=="string"&&(c.created=t.createdAt),typeof t.modified=="string"?c.modified=t.modified:typeof t.updatedAt=="string"&&(c.modified=t.updatedAt),Array.isArray(t.tags)&&(c.tags=t.tags.filter(d=>typeof d=="string")),typeof t.genre=="string"&&(c.genre=t.genre),typeof t.notes=="string"&&(c.notes=t.notes),typeof t.character_name=="string"?c.character_name=t.character_name:typeof t.characterName=="string"&&(c.character_name=t.characterName),typeof t.template_name=="string"?c.template_name=t.template_name:typeof t.templateName=="string"&&(c.template_name=t.templateName);const l=Array.isArray(t.parent_drafts)?t.parent_drafts:Array.isArray(t.parentDraftIds)?t.parentDraftIds:null;return l&&(c.parent_drafts=l.filter(d=>typeof d=="string")),typeof t.offspring_type=="string"?c.offspring_type=t.offspring_type:typeof t.offspringType=="string"&&(c.offspring_type=t.offspringType),c}function Ve(r,e="Imported draft"){if(!W(r)||!W(r.assets))return null;const t={};for(const[a,o]of Object.entries(r.assets))typeof o=="string"&&(t[a]=o);if(Object.keys(t).length===0)return null;const n=bn(W(r.metadata)?r.metadata:r,e),s=typeof r.path=="string"&&r.path.trim().length>0?r.path:typeof r.reviewId=="string"&&r.reviewId.trim().length>0?r.reviewId:n.review_id;return{metadata:n,assets:t,path:s}}function Da(r){if(Array.isArray(r))return r.map(t=>Ve(t)).filter(t=>t!==null);if(!W(r))return[];if(Array.isArray(r.drafts))return r.drafts.map(t=>Ve(t)).filter(t=>t!==null);if(W(r.draft)){const t=Ve(r.draft);return t?[t]:[]}const e=Ve(r);return e?[e]:[]}function La(r){return Array.isArray(r)?r.length===0:W(r)&&Array.isArray(r.drafts)&&r.drafts.length===0}function Fa(r){return Array.isArray(r)?!0:W(r)?Array.isArray(r.drafts)||W(r.draft)||W(r.assets)||W(r.metadata)||typeof r.reviewId=="string"||typeof r.review_id=="string":!1}function Ma(r){return r.trim().toLowerCase().replace(/\s+/g,"_")}function Ua(r){const t=r.match(/^#\s+(.+)$/m)?.[1]?.trim()||"Imported draft",n=/^##\s+(.+)$/gm,s=[];let a;for(;(a=n.exec(r))!==null;)s.push({title:a[1].trim(),start:a.index,bodyStart:n.lastIndex});if(s.length===0)return[];const o={};let c;for(let d=0;d<s.length;d+=1){const u=s[d],p=s[d+1],b=r.slice(u.bodyStart,p?p.start:r.length).replace(/^\n+/,"").trimEnd().replace(/^\\##/gm,"##");if(!b)continue;if(u.title.trim().toLowerCase()==="metadata"){try{c=JSON.parse(b)}catch{}continue}const f=Ma(u.title);o[f]=b}if(Object.keys(o).length===0)return[];const l=bn(c,t);return[{path:l.review_id,metadata:l,assets:o}]}function $a(r,e){const t=ot(),n=r.name.trim()||e?.replace(/\.[^.]+$/,"")||"Imported draft",s=e?`Imported from ${e}`:`Imported draft: ${n}`,a=r.sourcePreset||r.sourceFormat,o=Object.keys(r.unmappedFields||{}).length,c=o>0?`Imported from ${a}. Preserved ${o} unmapped field${o===1?"":"s"} in the upload preview.`:`Imported from ${a}.`;return{path:t,metadata:{review_id:t,seed:s,favorite:!1,character_name:n,template_name:Fe.name,notes:c},assets:r.assets}}function Ba(r,e){const t=Js(r,e);return Object.keys(t.assets).length===0?[]:[$a(t,e)]}class wn extends Le{drafts;assets;tags;constructor(e){super(e),this.version(1).stores(Na)}}const v=new wn(Pa);let Ye=null;async function Ha(){if(!(typeof indexedDB>"u"||await v.drafts.count()>0))for(const e of gn){if(!await Le.exists(e))continue;const t=new wn(e);try{await t.open();const n=await t.drafts.toArray();if(n.length===0)continue;const s=await t.assets.toArray(),a=await t.tags.toArray();await v.transaction("rw",v.drafts,v.assets,v.tags,async()=>{await v.drafts.bulkPut(n),s.length>0&&await v.assets.bulkPut(s),a.length>0&&await v.tags.bulkPut(a)}),t.close(),await Le.delete(e);return}catch(n){console.warn(`Failed to migrate legacy draft database ${e}:`,n)}finally{t.close()}}}class j{static async ensureReady(){Ye||(Ye=Ha()),await Ye}static async saveDraft(e){await this.ensureReady();const t=Date.now(),n=at(e.assets,e.metadata.template_name),s={...e.metadata,character_name:e.metadata.character_name||n,created:e.metadata.created||new Date(t).toISOString(),modified:e.metadata.modified||new Date(t).toISOString()},a={reviewId:e.metadata.review_id,metadata:s,assets:e.assets,createdAt:s.created?new Date(s.created).getTime():t,updatedAt:s.modified?new Date(s.modified).getTime():t},o=await v.drafts.where("reviewId").equals(e.metadata.review_id).first();o&&(a.id=o.id),await v.transaction("rw",v.drafts,v.assets,v.tags,async()=>{await v.drafts.put(a),await v.assets.where("draftId").equals(e.metadata.review_id).delete(),await v.tags.where("draftId").equals(e.metadata.review_id).delete();const c=Object.entries(e.assets).map(([l,d])=>({draftId:e.metadata.review_id,assetName:l,content:d,createdAt:t}));if(await v.assets.bulkAdd(c),e.metadata.tags){const l=e.metadata.tags.map(d=>({tag:d,draftId:e.metadata.review_id,createdAt:t}));await v.tags.bulkAdd(l)}})}static async getDraft(e){await this.ensureReady();const t=await v.drafts.where("reviewId").equals(e).first();return t?{path:t.reviewId,metadata:t.metadata,assets:t.assets}:null}static async getAssetActivity(e){return await this.ensureReady(),(await v.assets.where("draftId").equals(e).toArray()).sort((n,s)=>s.createdAt-n.createdAt)}static async getAllDrafts(){return await this.ensureReady(),(await v.drafts.toArray()).filter(t=>J(t.metadata)).map(t=>({path:t.reviewId,metadata:t.metadata,assets:t.assets}))}static async getAllDraftsWithOptions(e={}){return await this.ensureReady(),(await v.drafts.toArray()).filter(n=>J(n.metadata,e)).map(n=>({path:n.reviewId,metadata:n.metadata,assets:n.assets}))}static async getAllMetadata(e={}){return await this.ensureReady(),(await v.drafts.toArray()).filter(n=>J(n.metadata,e)).map(n=>n.metadata)}static async deleteDraft(e){await this.ensureReady(),await v.transaction("rw",v.drafts,v.assets,v.tags,async()=>{await v.drafts.where("reviewId").equals(e).delete(),await v.assets.where("draftId").equals(e).delete(),await v.tags.where("draftId").equals(e).delete()})}static async updateMetadata(e,t){await this.ensureReady();const n=await v.drafts.where("reviewId").equals(e).first();if(!n)throw new Error(`Draft ${e} not found`);const s=Date.now();if(n.metadata={...n.metadata,...t,modified:new Date(s).toISOString()},n.updatedAt=s,await v.drafts.put(n),t.tags!==void 0&&(await v.tags.where("draftId").equals(e).delete(),t.tags)){const a=t.tags.map(o=>({tag:o,draftId:e,createdAt:s}));await v.tags.bulkAdd(a)}}static async updateAsset(e,t,n){await this.ensureReady();const s=await v.drafts.where("reviewId").equals(e).first();if(!s)throw new Error(`Draft ${e} not found`);s.assets[t]=n,s.updatedAt=Date.now(),s.metadata={...s.metadata,modified:new Date(s.updatedAt).toISOString(),character_name:at(s.assets,s.metadata.template_name)||s.metadata.character_name},await v.drafts.put(s),await v.assets.where("draftId").equals(e).and(o=>o.assetName===t).modify({content:n,createdAt:s.updatedAt})===0&&await v.assets.add({draftId:e,assetName:t,content:n,createdAt:s.updatedAt})}static async searchDrafts(e,t={}){await this.ensureReady();const n=e.toLowerCase();return(await v.drafts.filter(a=>{if(!J(a.metadata,t))return!1;const o=a.metadata.character_name?.toLowerCase()||"",c=a.metadata.seed?.toLowerCase()||"",l=a.metadata.notes?.toLowerCase()||"",d=a.metadata.genre?.toLowerCase()||"";return o.includes(n)||c.includes(n)||l.includes(n)||d.includes(n)}).toArray()).map(a=>a.metadata)}static async getDraftsByTag(e,t={}){await this.ensureReady();const n=await v.tags.where("tag").equals(e).toArray(),s=[...new Set(n.map(o=>o.draftId))];return(await v.drafts.where("reviewId").anyOf(s).toArray()).filter(o=>J(o.metadata,t)).map(o=>o.metadata)}static async getAllTags(){await this.ensureReady();const e=await v.tags.toArray();return[...new Set(e.map(n=>n.tag))].sort()}static async getFavorites(e={}){return await this.ensureReady(),(await v.drafts.filter(n=>n.metadata.favorite===!0&&J(n.metadata,e)).toArray()).map(n=>n.metadata)}static async getDraftsByMode(e,t={}){return await this.ensureReady(),(await v.drafts.where("metadata.mode").equals(e).toArray()).filter(s=>J(s.metadata,t)).map(s=>s.metadata)}static async getDraftsByGenre(e,t={}){return await this.ensureReady(),(await v.drafts.where("metadata.genre").equals(e).toArray()).filter(s=>J(s.metadata,t)).map(s=>s.metadata)}static async getStats(e={}){await this.ensureReady();const t=await v.drafts.toArray(),n=t.filter(o=>J(o.metadata,e)),s=t.filter(o=>yn(o.metadata)),a={total:n.length,archived:s.length,favorites:n.filter(o=>o.metadata.favorite).length,byMode:{},byGenre:{}};for(const o of n){const c=o.metadata.mode||"unknown",l=o.metadata.genre||"unknown";a.byMode[c]=(a.byMode[c]||0)+1,a.byGenre[l]=(a.byGenre[l]||0)+1}return a}static async exportAll(){await this.ensureReady();const e=await this.getAllDraftsWithOptions({includeArchived:!0}),t={version:"1.0",exportedAt:new Date().toISOString(),drafts:e};return JSON.stringify(t,null,2)}static async import(e,t={}){await this.ensureReady();const n=t.conflictStrategy??"remap",s=t.sourceName,a=e.trim();if(!a)throw new Error("Import file is empty");let o=[],c=!1,l;try{l=JSON.parse(a),c=Fa(l),o=Da(l)}catch{o=Ua(e)}if(o.length===0){if(l!==void 0&&La(l))return{imported:0,remapped:0};o=Ba(e,s)}if(o.length===0){if(c)return{imported:0,remapped:0};throw new Error("Invalid draft import format. Supported: exported drafts JSON, combined markdown draft files, or raw text/JSON uploads.")}const d=await this.getAllMetadata({includeArchived:!0}),u=new Set(d.map(f=>f.review_id)),p=new Map;let m=0;const b=o.map(f=>{const y=f.metadata.review_id;let E=y;return n==="remap"&&u.has(E)&&(E=Ra(u)),u.add(E),E!==y&&(m+=1,p.set(y,E)),{...f,path:E,metadata:{...f.metadata,review_id:E}}});for(const f of b){const y=f.metadata.parent_drafts?.map(E=>p.get(E)||E);await this.saveDraft({...f,metadata:{...f.metadata,parent_drafts:y}})}return{imported:b.length,remapped:m}}static async clearAll(){await v.transaction("rw",v.drafts,v.assets,v.tags,async()=>{await v.drafts.clear(),await v.assets.clear(),await v.tags.clear()});for(const e of gn)await Le.exists(e)&&await Le.delete(e);Ye=null}}const pc=Object.freeze(Object.defineProperty({__proto__:null,DraftStorage:j,db:v},Symbol.toStringTag,{value:"Module"})),pr="server-config",vt="server-access-token",It="auth-state-changed";function ve(r){return typeof r=="object"&&r!==null}function Ka(r){return r==="SFW"||r==="NSFW"||r==="Platform-Safe"||r==="Auto"?r:void 0}function X(r){if(typeof r!="string")return;const e=r.trim();return e.length>0?e:void 0}function mr(r){const e=Object.fromEntries(Object.entries(r.assets).filter(t=>{const[n,s]=t;return typeof n=="string"&&n.length>0&&typeof s=="string"}));return{reviewId:X(r.metadata.review_id)??r.path,seed:X(r.metadata.seed)??r.path,mode:Ka(r.metadata.mode),model:X(r.metadata.model),archivedAt:X(r.metadata.archived_at),characterName:X(r.metadata.character_name),templateName:X(r.metadata.template_name),genre:X(r.metadata.genre),notes:X(r.metadata.notes),favorite:!!r.metadata.favorite,tags:Array.isArray(r.metadata.tags)?r.metadata.tags.filter(t=>typeof t=="string"&&t.trim().length>0):[],offspringType:X(r.metadata.offspring_type),parentDraftIds:Array.isArray(r.metadata.parent_drafts)?r.metadata.parent_drafts.filter(t=>typeof t=="string"&&t.trim().length>0):void 0,assets:e}}function Ga(r){return ve(r)?Array.isArray(r.drafts)&&r.drafts.every(e=>ve(e)&&ve(e.metadata)&&ve(e.assets))?{drafts:r.drafts.map(mr)}:ve(r.metadata)&&ve(r.assets)?{drafts:[mr(r)]}:r:r}class Wa{config;accessToken=null;refreshPromise=null;statusPromise=null;cachedStatus=null;statusCacheExpiresAt=0;constructor(){this.config=this.loadConfig(),this.accessToken=localStorage.getItem(vt)}loadConfig(){try{const e=localStorage.getItem(pr);if(e)return JSON.parse(e)}catch(e){console.error("Failed to load server config:",e)}return{url:"https://api.eidolonsimulacra.com",enabled:!1}}saveConfig(){localStorage.setItem(pr,JSON.stringify(this.config)),this.invalidateStatusCache()}getConfig(){return{...this.config}}setConfig(e){this.config={...this.config,...e},this.saveConfig()}invalidateStatusCache(){this.cachedStatus=null,this.statusCacheExpiresAt=0}isEnabled(){return this.config.enabled&&!!this.config.url}hasAccessToken(){return!!this.accessToken}setAccessToken(e){this.accessToken=e,localStorage.setItem(vt,e),this.invalidateStatusCache()}clearAccessToken(){this.accessToken=null,localStorage.removeItem(vt),this.invalidateStatusCache()}notifyAuthStateChanged(){window.dispatchEvent(new CustomEvent(It))}getAccessToken(){return this.accessToken}async refreshAccessToken(){if(this.refreshPromise)return this.refreshPromise;this.refreshPromise=this.doRefreshToken();try{return await this.refreshPromise}finally{this.refreshPromise=null}}async doRefreshToken(){const e=`${this.config.url}/api/auth/refresh`,t=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include"});if(!t.ok)throw this.clearAccessToken(),this.notifyAuthStateChanged(),new Error("Failed to refresh token");const n=await t.json();return this.setAccessToken(n.accessToken),n.accessToken}async request(e,t={},n=!0){const s=`${this.config.url}${e}`,a={"Content-Type":"application/json",...t.headers},o=this.getAccessToken();o&&(a.Authorization=`Bearer ${o}`);const c=await fetch(s,{...t,headers:a,credentials:"include"});if(c.status===401&&n&&e!=="/api/auth/refresh"&&e!=="/api/auth/login"&&e!=="/api/auth/register")try{return await this.refreshAccessToken(),this.request(e,t,!1)}catch{throw this.clearAccessToken(),new Error("Authentication expired. Please login again.")}return c}async register(e,t,n){const s=await this.request("/api/auth/register",{method:"POST",body:JSON.stringify({email:e,password:t,displayName:n})});if(!s.ok){const o=await s.json();throw new Error(o.error||"Registration failed")}const a=await s.json();return this.setAccessToken(a.accessToken),this.notifyAuthStateChanged(),a}async login(e,t){const n=await this.request("/api/auth/login",{method:"POST",body:JSON.stringify({email:e,password:t})});if(!n.ok){const a=await n.json();throw new Error(a.error||"Login failed")}const s=await n.json();return this.setAccessToken(s.accessToken),this.notifyAuthStateChanged(),s}async logout(){try{await this.request("/api/auth/logout",{method:"POST"})}catch(e){console.error("Logout request failed:",e)}finally{this.clearAccessToken(),this.notifyAuthStateChanged()}}async getCurrentUser(){const e=await this.request("/api/auth/me");if(!e.ok){if(e.status===401)throw this.clearAccessToken(),new Error("Not authenticated");const n=await e.json();throw new Error(n.error||"Failed to get user")}return(await e.json()).user}async updateProfile(e){const t=await this.request("/api/auth/me",{method:"PATCH",body:JSON.stringify(e)});if(!t.ok){const s=await t.json();throw new Error(s.error||"Failed to update profile")}return(await t.json()).user}async deleteAccount(){const e=await this.request("/api/auth/me",{method:"DELETE"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to delete account")}this.clearAccessToken()}async checkStatus(){if(!this.isEnabled())return{connected:!1,authenticated:!1};const e=Date.now();if(this.cachedStatus&&e<this.statusCacheExpiresAt)return this.cachedStatus;if(this.statusPromise)return this.statusPromise;this.statusPromise=this.computeStatus();try{const t=await this.statusPromise;return this.cachedStatus=t,this.statusCacheExpiresAt=Date.now()+15e3,t}finally{this.statusPromise=null}}isConnectivityError(e){return e instanceof TypeError?!0:e instanceof Error?/failed to fetch|networkerror|network error|load failed/i.test(e.message):!1}async computeStatus(){try{if(this.hasAccessToken())try{return{connected:!0,authenticated:!0,user:await this.getCurrentUser()}}catch(t){return this.isConnectivityError(t)?{connected:!1,authenticated:!1,error:t instanceof Error?t.message:"Unknown error"}:{connected:!0,authenticated:!1,error:t instanceof Error?t.message:"Authentication failed"}}return(await fetch(`${this.config.url}/api/health`,{method:"GET"})).ok?{connected:!0,authenticated:!1}:{connected:!1,authenticated:!1,error:"Server unreachable"}}catch(e){return{connected:!1,authenticated:!1,error:e instanceof Error?e.message:"Unknown error"}}}async syncDrafts(e,t){const n=e==="push",s=n?"/api/sync/drafts/push":"/api/sync/drafts",a=n?Ga(t):t,o=await this.request(s,{method:n?"POST":"GET",body:n?JSON.stringify(a):void 0});if(!o.ok){let c=`Failed to ${e} drafts`,l=null;try{const u=await o.json();if(c=u.error||c,l=u.error||null,u.details){const p=Object.entries(u.details).flatMap(([m,b])=>(b||[]).map(f=>`${m}: ${f}`)).join("; ");p&&(c=`${c} (${p})`)}}catch{}if(e==="pull"&&s!=="/api/sync/drafts"&&(o.status===404||o.status===400&&l==="Validation failed"))try{return await this.listRemoteDrafts()}catch{}throw new Error(c)}return o.json()}async listRemoteDrafts(){const e=await this.request("/api/sync/drafts/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote drafts")}return e.json()}async deleteRemoteDraft(e){const t=await this.request(`/api/sync/drafts/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete remote draft")}return t.json()}async syncThemes(e,t){const n=await this.request(`/api/sync/themes/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const s=await n.json();throw new Error(s.error||`Failed to ${e} themes`)}return n.json()}async listRemoteThemes(){const e=await this.request("/api/sync/themes/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote themes")}return e.json()}async deleteRemoteTheme(e){const t=await this.request(`/api/sync/themes/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete remote theme")}return t.json()}async syncTemplates(e,t){const n=await this.request(`/api/sync/templates/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const s=await n.json();throw new Error(s.error||`Failed to ${e} templates`)}return n.json()}async syncSeeds(e,t){const n=e==="push",s=n?"/api/sync/seeds/push":"/api/sync/seeds",a=await this.request(s,{method:n?"POST":"GET",body:n?JSON.stringify(t):void 0});if(!a.ok){const o=await a.json();throw new Error(o.error||`Failed to ${e} seeds`)}return a.json()}async syncArchivedSeedRuns(e,t){const n=e==="push",s=e==="list"?"/api/sync/seed-runs/list":n?"/api/sync/seed-runs/push":"/api/sync/seed-runs",a=await this.request(s,{method:n?"POST":"GET",body:n?JSON.stringify(t):void 0});if(!a.ok){const o=await a.json();throw new Error(o.error||`Failed to ${e} archived seed runs`)}return a.json()}async listRemoteTemplates(){const e=await this.request("/api/sync/templates/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote templates")}return e.json()}async deleteRemoteTemplate(e){const t=await this.request(`/api/sync/templates/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete remote template")}return t.json()}async pullConfig(){const e=await this.request("/api/sync/config",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to pull config")}return e.json()}async pushConfig(e){const t=await this.request("/api/sync/config",{method:"PUT",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to push config")}return t.json()}async pullApiKeys(){const e=await this.request("/api/sync/config/api-keys",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to pull API keys")}return e.json()}async pushApiKeys(e){const t=await this.request("/api/sync/config/api-keys",{method:"PUT",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to push API keys")}return t.json()}async sync(e,t,n){switch(e){case"drafts":return this.syncDrafts(t,n);case"themes":return this.syncThemes(t,n);case"templates":return this.syncTemplates(t,n);case"seeds":return this.syncSeeds(t,n);case"blueprints":return this.syncBlueprints(t,n);case"worlds":if(t==="list")throw new Error("World sync does not support list");return this.syncWorlds(t,n);case"timelines":if(t==="list")throw new Error("Timeline sync does not support list");return this.syncTimelines(t,n);default:throw new Error(`Unknown data type: ${e}`)}}async syncBlueprints(e,t){const n=await this.request(`/api/sync/blueprints/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const s=await n.json();throw new Error(s.error||`Failed to ${e} blueprints`)}return n.json()}async listRemoteBlueprints(){const e=await this.request("/api/sync/blueprints/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote blueprints")}return e.json()}async deleteRemoteBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete remote blueprint")}return t.json()}async getBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`);if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to get blueprint")}return t.json()}async createBlueprint(e){const t=await this.request("/api/sync/blueprints",{method:"POST",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to create blueprint")}return t.json()}async updateBlueprint(e,t){const n=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`,{method:"PUT",body:JSON.stringify(t)});if(!n.ok){const s=await n.json();throw new Error(s.error||"Failed to update blueprint")}return n.json()}async deleteBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete blueprint")}return t.json()}async duplicateBlueprint(e,t,n){const s=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}/duplicate`,{method:"POST",body:JSON.stringify({newPath:t,newName:n})});if(!s.ok){const a=await s.json();throw new Error(a.error||"Failed to duplicate blueprint")}return s.json()}async resetBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}/reset`,{method:"POST"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to reset blueprint")}return t.json()}async syncWorlds(e,t){const n=await this.request(`/api/sync/worlds/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const s=await n.json();throw new Error(s.error||`Failed to ${e} worlds`)}return n.json()}async getWorlds(e){const t=new URLSearchParams;e?.search&&t.set("search",e.search),e?.genre&&t.set("genre",e.genre),e?.includePublic!==void 0&&t.set("includePublic",String(e.includePublic));const n=await this.request(`/api/sync/worlds?${t.toString()}`);if(!n.ok){const s=await n.json();throw new Error(s.error||"Failed to get worlds")}return n.json()}async getWorld(e){const t=await this.request(`/api/sync/worlds/${e}`);if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to get world")}return t.json()}async createWorld(e){const t=await this.request("/api/sync/worlds",{method:"POST",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to create world")}return t.json()}async updateWorld(e,t){const n=await this.request(`/api/sync/worlds/${e}`,{method:"PUT",body:JSON.stringify(t)});if(!n.ok){const s=await n.json();throw new Error(s.error||"Failed to update world")}return n.json()}async deleteWorld(e){const t=await this.request(`/api/sync/worlds/${e}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete world")}return t.json()}async syncTimelines(e,t){const n=await this.request(`/api/sync/timelines/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const s=await n.json();throw new Error(s.error||`Failed to ${e} timelines`)}return n.json()}async getTimelines(e){const t=new URLSearchParams;e?.worldId&&t.set("worldId",e.worldId),e?.search&&t.set("search",e.search);const n=await this.request(`/api/sync/timelines?${t.toString()}`);if(!n.ok){const s=await n.json();throw new Error(s.error||"Failed to get timelines")}return n.json()}async getTimeline(e){const t=await this.request(`/api/sync/timelines/${e}`);if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to get timeline")}return t.json()}async createTimeline(e){const t=await this.request("/api/sync/timelines",{method:"POST",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to create timeline")}return t.json()}async updateTimeline(e,t){const n=await this.request(`/api/sync/timelines/${e}`,{method:"PUT",body:JSON.stringify(t)});if(!n.ok){const s=await n.json();throw new Error(s.error||"Failed to update timeline")}return n.json()}async deleteTimeline(e){const t=await this.request(`/api/sync/timelines/${e}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete timeline")}return t.json()}async addTimelineEvent(e,t){const n=await this.request(`/api/sync/timelines/${e}/events`,{method:"POST",body:JSON.stringify(t)});if(!n.ok){const s=await n.json();throw new Error(s.error||"Failed to add event")}return n.json()}async updateTimelineEvent(e,t,n){const s=await this.request(`/api/sync/timelines/${e}/events/${t}`,{method:"PATCH",body:JSON.stringify(n)});if(!s.ok){const a=await s.json();throw new Error(a.error||"Failed to update event")}return s.json()}async deleteTimelineEvent(e,t){const n=await this.request(`/api/sync/timelines/${e}/events/${t}`,{method:"DELETE"});if(!n.ok){const s=await n.json();throw new Error(s.error||"Failed to delete event")}return n.json()}async testConnection(e){try{const t=await fetch(`${e}/api/health`,{method:"GET",signal:AbortSignal.timeout(5e3)});return t.ok?{success:!0,message:"Connection successful"}:{success:!1,message:`Server returned ${t.status}`}}catch(t){return{success:!1,message:t instanceof Error?t.message:"Connection failed"}}}}const _=new Wa,vn="eidolon.web.seedGenerator.history",_n=["bpui.web.seedGenerator.history"],xn="eidolon.web.seedGenerator.favorites",kn=["bpui.web.seedGenerator.favorites"],Sn="eidolon.web.seedGenerator.favorites.syncState",En="eidolon.web.seedGenerator.archivedSeedRuns.syncState",Tn=12,za=12,Pt="seed-favorites-changed",qa="seed-history-changed";function mt(r,e){if(typeof window>"u")return e;const t=Array.isArray(r)?[...r]:[r],[n,...s]=t;try{for(const a of t){const o=window.localStorage.getItem(a);if(!o)continue;const c=JSON.parse(o);return a!==n&&(window.localStorage.setItem(n,JSON.stringify(c)),s.forEach(l=>window.localStorage.removeItem(l))),c}}catch{return e}return e}function ht(r,e,t){typeof window>"u"||(window.localStorage.setItem(r,JSON.stringify(t)),e.forEach(n=>window.localStorage.removeItem(n)))}function Va(r){typeof window>"u"||window.dispatchEvent(new CustomEvent(Pt,{detail:{count:r.length}}))}function Ya(r){typeof window>"u"||window.dispatchEvent(new CustomEvent(qa,{detail:{count:r.filter(e=>!e.archivedAt).length}}))}function je(r){if(typeof r!="string")return;const e=new Date(r);return Number.isNaN(e.getTime())?void 0:e.toISOString()}function Ja(r){if(typeof r!="object"||r===null)return null;const e=r,t=typeof e.seed=="string"?e.seed.trim():"";if(!t)return null;const n=je(e.addedAt)??new Date().toISOString(),s=je(e.lastUsedAt),a=je(e.archivedAt),o={seed:t,addedAt:n};return s&&(o.lastUsedAt=s),a&&(o.archivedAt=a),o}function An(r,e){const t=Date.parse(r.lastUsedAt??r.addedAt);return Date.parse(e.lastUsedAt??e.addedAt)-t}function Cn(r,e){const t=Date.parse(r.archivedAt??r.lastUsedAt??r.addedAt);return Date.parse(e.archivedAt??e.lastUsedAt??e.addedAt)-t}function it(r){const e=new Map;for(const t of r){const n=Ja(t);n&&e.set(n.seed,n)}return Array.from(e.values()).sort((t,n)=>t.archivedAt||n.archivedAt?Cn(t,n):An(t,n))}function Ht(){return mt(Sn,{})}function On(r){ht(Sn,[],r)}function Kt(){return mt(En,{})}function In(r){ht(En,[],r)}function te(){const r=mt([xn,...kn],[]);return it(r)}function Pn(r){return[...r].filter(e=>!e.archivedAt).sort(An)}function Xa(r){return[...r].filter(e=>!!e.archivedAt).sort(Cn)}function pe(r,e={}){const{markChanged:t=!0,markSynced:n=!1,timestamp:s=new Date().toISOString()}=e,a=it(r);ht(xn,kn,a);const o=Ht();return t&&(o.lastChangedAt=s),n&&(o.lastSyncedAt=s),On(o),Va(Pn(a)),a}const Nt=[{id:"noir-romance",label:"Noir Pressure",genreLines:`noir:debt, surveillance, intimacy, slow-burn
romance:realism, asymmetry, messy loyalty, after-hours`},{id:"grounded-sf",label:"Grounded Sci-Fi",genreLines:`sci-fi:grounded, labor, proximity, bureaucracy
romance:subtext, contracts, withheld tenderness`},{id:"low-magic",label:"Low Magic",genreLines:`fantasy:low-magic, domestic, obligation, village politics
romance:restraint, longing, practical intimacy`},{id:"urban-horror",label:"Urban Horror",genreLines:`horror:grounded, neighborhood, debt, body unease
thriller:secrecy, leverage, false safety`},{id:"moreau",label:"Moreau",genreLines:`romance:moreau, realism, stigma, protective tension
urban fantasy:morphosis, nightlife, consent ethic, social friction`}];function Qa(r){return r.replace(/^```+/,"").replace(/```+$/,"").trim()}function Za(r){return Qa(r).replace(/^[-*•]\s+/,"").replace(/^\d+[.)]\s+/,"").replace(/^seed\s*:\s*/i,"").trim()}function mc(){return Nt}function eo(){return Nt[Math.floor(Math.random()*Nt.length)]}function to(r){return Math.min(30,Math.max(5,Math.round(r||za)))}function hc(r,e){const t=r.split(`
`).map(s=>s.trim()).filter(Boolean);return[...[`count=${to(e.count)}`,e.coverageMode],...t].join(`
`)}function ro(r){const e=r.genre_lines.split(`
`).map(t=>t.trim()).filter(Boolean).join(`
`);if(r.surprise_mode||!e){const t=eo();return{genreLines:t.genreLines,sourcePreset:t}}return{genreLines:e}}function no(r){const e=r.split(`
`).map(Za).filter(t=>t.length>0).filter(t=>!/^#+\s*/.test(t)).filter(t=>!/^output to\s+/i.test(t)).filter(t=>!/^no headings/i.test(t));return[...new Set(e)].filter(t=>t.length<=180)}function so(r){if(typeof r!="object"||r===null)return null;const e=r,t=typeof e.id=="string"&&e.id.trim().length>0?e.id:crypto.randomUUID(),n=je(e.createdAt)??new Date().toISOString(),s=je(e.archivedAt),a=typeof e.request=="object"&&e.request!==null?e.request:null,o=Array.isArray(e.seeds)?e.seeds.filter(u=>typeof u=="string"&&u.trim().length>0):[];if(!a||o.length===0)return null;const c=a.coverageMode==="blended"?"blended":"per-genre",l=typeof a.count=="number"&&Number.isFinite(a.count)?Math.max(1,Math.round(a.count)):o.length,d={id:t,createdAt:n,request:{genreLines:typeof a.genreLines=="string"?a.genreLines:"",count:l,coverageMode:c,surpriseMode:!!a.surpriseMode,presetId:typeof a.presetId=="string"?a.presetId:void 0},seeds:o};return s&&(d.archivedAt=s),d}function Ue(r){const e=[];for(const t of r){const n=so(t);n&&e.push(n)}return e}function Gt(){const r=mt([vn,..._n],[]);return Ue(r)}function Nn(r){return r.filter(e=>!e.archivedAt)}function ct(r){return r.filter(e=>!!e.archivedAt)}function Be(r,e={}){const{markArchivedChanged:t=!1,markSynced:n=!1,timestamp:s=new Date().toISOString()}=e,a=Ue(r);if(ht(vn,_n,a),t||n){const o=Kt();t&&(o.lastChangedAt=s),n&&(o.lastSyncedAt=s),In(o)}return Ya(Nn(a)),a}function Se(){return Nn(Gt())}function me(){return ct(Gt())}function fc(r){const e={...r,id:crypto.randomUUID(),createdAt:new Date().toISOString()},t=me(),n=[e,...Se()].slice(0,Tn);return Be([...n,...t]),n}function gc(r){const e=new Date().toISOString(),t=me(),n=Se(),s=n.find(a=>a.id===r);return s?(Be([...n.filter(a=>a.id!==r),{...s,archivedAt:e},...t.filter(a=>a.id!==r)],{markArchivedChanged:!0,timestamp:e}),Se()):n}function yc(r){const e=me(),t=e.find(s=>s.id===r);if(!t)return Se();const n=[{...t,archivedAt:void 0},...Se()].slice(0,Tn);return Be([...n,...e.filter(s=>s.id!==r)],{markArchivedChanged:!0}),n}function bc(r){return Be(Gt().filter(e=>e.id!==r),{markArchivedChanged:!0}),me()}function ao(r){if(Array.isArray(r))return ct(Ue(r));if(typeof r!="object"||r===null)return null;const e=r;return Array.isArray(e.runs)?ct(Ue(e.runs)):null}function oo(r){const e=ct(Ue(r));return Be([...Se(),...e],{markArchivedChanged:!1,markSynced:!0}),me()}function jn(r=new Date().toISOString()){const e=Kt();e.lastSyncedAt=r,In(e)}function io(){const{lastChangedAt:r,lastSyncedAt:e}=Kt();return r?e?Date.parse(r)>Date.parse(e):!0:!1}async function wc(){if(!_.isEnabled()||!_.hasAccessToken())return null;if(io()){const t=me();return await _.syncArchivedSeedRuns("push",{runs:t}),jn(),t}const r=await _.syncArchivedSeedRuns("pull"),e=ao(r);return e?oo(e):null}function ee(){return Pn(te())}function co(){return Xa(te())}function lo(r){if(Array.isArray(r))return it(r);if(typeof r!="object"||r===null)return null;const e=r;return Array.isArray(e.seeds)?it(e.seeds):null}function vc(r){return pe([...r]),ee()}function uo(r){return pe([...r],{markChanged:!1,markSynced:!0}),ee()}function Rn(r=new Date().toISOString()){const e=Ht();e.lastSyncedAt=r,On(e)}function po(){const{lastChangedAt:r,lastSyncedAt:e}=Ht();return r?e?Date.parse(r)>Date.parse(e):!0:!1}async function _c(){if(!_.isEnabled()||!_.hasAccessToken())return null;if(po()){const t=te();return await _.syncSeeds("push",{seeds:t}),Rn(),ee()}const r=await _.syncSeeds("pull"),e=lo(r);return e?uo(e):null}function mo(r){const e=new Date().toISOString(),t=te().map(n=>n.seed===r?{...n,archivedAt:e}:n);return pe(t,{timestamp:e}),ee()}function ho(r){const e=te().map(t=>t.seed===r?{...t,archivedAt:void 0}:t);return pe(e),ee()}function xc(r){return pe(te().filter(e=>e.seed!==r)),co()}function kc(r){const e=te(),t=e.find(n=>n.seed===r);return t?.archivedAt?ho(r):t?mo(r):(pe([{seed:r,addedAt:new Date().toISOString()},...e]),ee())}function Sc(r){const e=new Date().toISOString(),n=te().map(s=>s.seed===r?{...s,lastUsedAt:e}:s);return pe(n,{timestamp:e}),ee()}const fo="eidolon.web.themes.custom",go=["bpui.web.themes.custom"],Dn=900,et=new Set;let q=null,Oe=null;function yo(){if(typeof window>"u")return[];for(const r of[fo,...go]){const e=window.localStorage.getItem(r);if(e)try{return JSON.parse(e)}catch{return[]}}return[]}function bo(r){const e=r.metadata.mode,t=e==="SFW"||e==="NSFW"||e==="Platform-Safe"||e==="Auto"?e:void 0,n=a=>{if(typeof a!="string")return;const o=a.trim();return o.length>0?o:void 0},s=Object.fromEntries(Object.entries(r.assets).filter(a=>{const[o,c]=a;return typeof o=="string"&&o.length>0&&typeof c=="string"}));return{reviewId:n(r.metadata.review_id)??r.path,seed:n(r.metadata.seed)??r.path,mode:t,model:n(r.metadata.model),archivedAt:n(r.metadata.archived_at),characterName:n(r.metadata.character_name),templateName:n(r.metadata.template_name),genre:n(r.metadata.genre),notes:n(r.metadata.notes),favorite:!!r.metadata.favorite,tags:Array.isArray(r.metadata.tags)?r.metadata.tags.filter(a=>typeof a=="string"&&a.trim().length>0):[],offspringType:n(r.metadata.offspring_type),parentDraftIds:Array.isArray(r.metadata.parent_drafts)?r.metadata.parent_drafts.filter(a=>typeof a=="string"&&a.trim().length>0):void 0,assets:s}}function hr(r){return Ze(r)!==null&&!hn(r)?`blueprints/overrides/${r.replace(/^blueprints\//,"")}`:r}function wo(r){return typeof r=="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(r)}async function vo(){const[r,e]=await Promise.all([j.getAllDraftsWithOptions({includeArchived:!0}),_.listRemoteDrafts()]),t=new Set(r.map(o=>o.metadata.review_id)),n=e.drafts||[],a=((await _.syncDrafts("push",{drafts:r.map(bo)})).results||[]).filter(o=>o.status==="error").map(o=>o.error?`${o.reviewId} (${o.error})`:o.reviewId);if(a.length>0)throw new Error(`Remote draft sync failed for: ${a.join(", ")}`);await Promise.all(n.filter(o=>!t.has(o.reviewId)).map(o=>wo(o.id)?_.deleteRemoteDraft(o.id).catch(c=>{console.warn(`Failed to delete remote draft ${o.reviewId}:`,c)}):(console.warn(`Skipping remote draft delete for ${o.reviewId}: server returned non-UUID id.`),Promise.resolve())))}async function _o(){const r=yo(),t=(await _.listRemoteThemes()).themes||[],n=new Set(r.map(s=>s.name));await _.syncThemes("push",{themes:r.map(s=>({name:s.name,displayName:s.display_name,description:s.description,author:s.author,tags:s.tags,basedOn:s.based_on,colors:s.colors}))}),await Promise.all(t.filter(s=>!s.isBuiltin&&!n.has(s.name)).map(s=>_.deleteRemoteTheme(s.name).catch(a=>{console.warn(`Failed to delete remote theme ${s.name}:`,a)})))}async function xo(){const r=ue(),t=(await _.listRemoteTemplates()).templates||[],n=new Set(r.map(s=>s.template.name));await _.syncTemplates("push",{templates:r.map(s=>({name:s.template.name,version:s.template.version,description:s.template.description,isDefault:s.template.is_default,assets:s.template.assets,blueprintContent:s.blueprint_contents}))}),await Promise.all(t.filter(s=>!s.isOfficial&&!n.has(s.name)).map(s=>_.deleteRemoteTemplate(s.name).catch(a=>{console.warn(`Failed to delete remote template ${s.name}:`,a)})))}async function ko(){const r=te(),e=me();await _.syncSeeds("push",{seeds:r}),await _.syncArchivedSeedRuns("push",{runs:e}),Rn(),jn()}async function So(){const r=Z(),e=Object.entries(r),t=new Set(e.map(([a])=>hr(a))),s=(await _.listRemoteBlueprints()).blueprints||[];e.length>0&&await _.syncBlueprints("push",{blueprints:e.map(([a,o])=>{const c=Mt(o);return{path:hr(a),name:c.name,description:c.description,invokable:c.invokable,version:c.version,category:"custom",content:o}})}),await Promise.all(s.filter(a=>!a.isBuiltin&&!t.has(a.path)).map(a=>_.deleteRemoteBlueprint(a.path).catch(o=>{console.warn(`Failed to delete remote blueprint ${a.path}:`,o)})))}async function Eo(){await Promise.all([_.pushConfig(A.getConfig()),_.pushApiKeys(A.getApiKeys())])}async function To(r){switch(r){case"drafts":await vo();return;case"themes":await _o();return;case"templates":await xo();return;case"seeds":await ko();return;case"blueprints":await So();return;case"config":await Eo();return}}async function lt(){if(Oe)return Oe;q&&(clearTimeout(q),q=null),Oe=(async()=>{const r=Array.from(et);if(et.clear(),!(r.length===0||!_.isEnabled()||!_.hasAccessToken()))for(const e of r)try{await To(e)}catch(t){console.warn(`Automatic ${e} sync failed:`,t)}})();try{await Oe}finally{Oe=null,et.size>0&&!q&&(q=setTimeout(()=>{q=null,lt()},Dn))}}function N(r,e={}){if((Array.isArray(r)?r:[r]).forEach(n=>et.add(n)),e.immediate){lt();return}q&&clearTimeout(q),q=setTimeout(()=>{q=null,lt()},Dn)}function Ao(){return lt()}function Co(r){const e=cn(r);if(e.length===0)return"";let t;try{t=ln(e)}catch{t=e.map(o=>o.name)}const n=t.map(o=>e.find(c=>c.name===o)).filter(o=>!!o),s=[];s.push(`

## TEMPLATE OVERRIDE
`),s.push("The following active template contract is authoritative. Use it instead of the fallback template order."),s.push(`Template name: ${r.name}`),s.push(`Template version: ${r.version}`),r.description?.trim()&&s.push(`Template description: ${r.description.trim()}`),s.push(`Asset count: ${n.length}`),s.push(""),s.push("Asset output order:"),n.forEach((o,c)=>{s.push(`${c+1}. ${o.name}`)}),s.push(""),s.push("Declared asset contract:"),n.forEach(o=>{const c=o.dependsOn.length>0?o.dependsOn.join(", "):"none";s.push(`- ${o.name}`),s.push(`  - required: ${o.required}`),s.push(`  - depends_on: ${c}`),o.blueprintFile&&s.push(`  - blueprint_file: ${o.blueprintFile}`),o.description?.trim()&&s.push(`  - description: ${o.description.trim()}`)});const a=n.map(o=>{const c=fn(r.name,o.name)?.trim();return c?["",`### ASSET BLUEPRINT: ${o.name}`,"```md",c,"```"].join(`
`):null}).filter(o=>!!o);return a.length>0&&(s.push(""),s.push("Resolved asset blueprints:"),s.push("Follow these blueprint sources exactly for structure, placeholders, control blocks, and field names."),s.push(a.join(`
`))),s.join(`
`)}function Oo(r){if(!r)return[];const e=cn(r);if(e.length===0)return[];try{return ln(e)}catch{return e.map(t=>t.name)}}function fr(r,e,t,n){const s=Oo(n),a=s.length>0?s:Object.keys(t),o=[`
## ${r}: ${e}`];return n&&o.push(`Template: ${n.name} (${n.version})`),a.forEach(c=>{o.push(`### ${c}:
\`\`\``),o.push(t[c]||""),o.push("```")}),o}async function Io(r,e=null,t,n,s,a=[]){let o=await Ft("orchestration",s,n);t&&t.assets.length>0&&(o+=Co(t));const c=o,l=[];return e&&l.push(`Mode: ${e}`),l.push(`SEED: ${r}`),a.length>0&&(l.push(""),l.push("ADDITIONAL RULES:"),a.forEach(d=>{l.push(`- ${d}`)})),[c,l.join(`
`)]}async function Po(r,e,t=null,n={},s=null,a){const o=s||await on(r,a),c=`# BLUEPRINT: ${r}

${o}`,l=[];if(t&&l.push(`Mode: ${t}`),l.push(`SEED: ${e}`),n&&Object.keys(n).length>0){l.push(`
---
## Prior Assets (for context):
`);for(const[d,u]of Object.entries(n))l.push(`### ${d}:
\`\`\`
${u}
\`\`\`
`)}return[c,l.join(`
`)]}async function No(r,e){return[e?.trim()||await Ft("seed_generation"),r]}function jo(r,e){const t=`You are an expert character analyst specializing in understanding character relationships, dynamics, and narrative potential. Your task is to deeply analyze two characters and provide insights about how they would interact in a story.

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
`)]}async function Ro(r,e,t,n,s=null,a,o,c,l){const d=await Ft("offspring_generation",l,c),u=[];return s&&u.push(`Mode: ${s}`),u.push(...fr("PARENT 1",t,r,a)),u.push(...fr("PARENT 2",n,e,o)),u.push(`
## INSTRUCTION:`),u.push("Analyze how these two parents would shape a new character's upbringing and generate the offspring's SEED."),u.push("Treat each parent suite according to the template contract shown in the provided assets."),[d,u.join(`
`)]}function Ie(r,e,t){const n=[{role:"system",content:r}];return n.push({role:"user",content:e}),n}class ne{static resolveConfiguredProvider(e){return e.engine_mode==="explicit"&&e.engine!=="auto"&&e.engine!=="openai_compatible"?e.engine:e.model?Dt(e.model):void 0}static getFallbackApiKey(e){return Object.values(e).find(t=>typeof t=="string"&&t.trim().length>0)}static createConfiguredEngine(){const e=A.getApiKeys(),t=A.getConfig(),n=this.resolveConfiguredProvider(t);return xe({model:t.model,apiKey:n?e[n]:this.getFallbackApiKey(e),apiKeys:e,provider:n,baseUrl:t.base_url,proxyKey:t.api_proxy_key,temperature:t.temperature,maxTokens:t.max_tokens})}static sanitizeGeneratedSeed(e){return e.replace(/^```[a-z]*\n?/i,"").replace(/```$/i,"").trim().replace(/^['"]|['"]$/g,"")}static getOffspringCarryRules(){return["Treat this seed as an offspring outcome shaped by two parent suites, not a disconnected standalone premise.","Preserve the inherited, inverted, or transmuted relational vector toward {{user}} implied by the offspring seed.","Do not flatten lineage tension: the generated assets should still feel like a descendant response to parental influence even when the seed expresses rebellion or mutation."]}static async*generate(e,t={}){const{seed:n,template:s,mode:a="Auto",stream:o=!0,blueprint_override:c,additional_instructions:l=[]}=e;yield{type:"status",stage:"initializing"};const d=A.getConfig(),u=this.createConfiguredEngine(),p=s?Ne(s):void 0;yield{type:"status",stage:"building_prompt"};const[m,b]=await Io(n,a,p,void 0,c,l);yield{type:"status",stage:"generating"};const f=Ie(m,b);let y="";if(o){for await(const K of u.generateStream(f,{signal:t.signal}))if(K.content&&(y+=K.content,yield{type:"chunk",content:K.content}),K.done)break}else y=(await u.generate(f,{signal:t.signal})).content;yield{type:"status",stage:"parsing"};let E;try{E=p?Ds(y,p).assets:this.parseBlueprintOutput(y)}catch{E=this.parseBlueprintOutput(y)}yield{type:"status",stage:"saving"};const O=this.generateReviewId(),H=at(E,s),U={path:O,metadata:{review_id:O,seed:n,mode:a,model:d.model,created:new Date().toISOString(),modified:new Date().toISOString(),favorite:!1,template_name:s,character_name:H},assets:E};await j.saveDraft(U),N("drafts"),yield{type:"complete",asset:O}}static async*generateAsset(e,t=!0){const n=fn(e.template,e.asset_name);yield*this.generateAssetWithBlueprint(e,n,t)}static async*previewBlueprint(e,t=!0){yield*this.generateAssetWithBlueprint(e,e.blueprint_content,t)}static async*generateAssetWithBlueprint(e,t,n){const{seed:s,mode:a="Auto",asset_name:o,prior_assets:c}=e;yield{type:"status",stage:"initializing"};const l=this.createConfiguredEngine();yield{type:"status",stage:"building_prompt"};const[d,u]=await Po(o,s,a,c,t);yield{type:"status",stage:"prompt_ready",asset:o,systemPrompt:d,userPrompt:u},yield{type:"status",stage:"generating",asset:o};const p=Ie(d,u);let m="";if(n){for await(const b of l.generateStream(p))if(b.content&&(m+=b.content,yield{type:"chunk",content:b.content,asset:o}),b.done)break}else m=(await l.generate(p)).content;yield{type:"asset",asset:o,content:m,systemPrompt:d,userPrompt:u}}static async*generateOffspringSeed(e,t={}){const{parent1_id:n,parent2_id:s,mode:a="Auto",blueprint_override:o}=e;yield{type:"status",stage:"loading_parents"};const c=await j.getDraft(n),l=await j.getDraft(s);if(!c||!l){yield{type:"error",error:"Parent drafts not found"};return}yield{type:"status",stage:"building_prompt"};const d=this.createConfiguredEngine(),[u,p]=await Ro(c.assets,l.assets,c.metadata.character_name||"Parent 1",l.metadata.character_name||"Parent 2",a,c.metadata.template_name?Ne(c.metadata.template_name):void 0,l.metadata.template_name?Ne(l.metadata.template_name):void 0,void 0,o);yield{type:"status",stage:"generating"};const m=Ie(u,p);let b="";for await(const y of d.generateStream(m,{signal:t.signal}))if(y.content&&(b+=y.content,yield{type:"chunk",content:y.content}),y.done)break;yield{type:"complete",content:this.sanitizeGeneratedSeed(b)}}static async*generateOffspring(e,t={}){const{parent1_id:n,parent2_id:s,mode:a="Auto",template:o,blueprint_override:c}=e;let l="";for await(const u of this.generateOffspringSeed(e,t)){if(u.type==="error"){yield u;return}(u.type==="status"||u.type==="chunk")&&(yield u),u.type==="complete"&&(l=u.content||"")}if(!l){yield{type:"error",error:"Offspring seed generation finished without seed content."};return}yield{type:"status",stage:"generating_character"};let d="";for await(const u of this.generate({seed:l,mode:a,template:o,stream:!1,blueprint_override:c,additional_instructions:this.getOffspringCarryRules()},t)){if(u.type==="error"){yield u;return}u.type==="status"&&u.stage==="saving"&&(yield{type:"status",stage:"saving"}),u.type==="complete"&&(d=u.asset||"")}if(!d){yield{type:"error",error:"Offspring generation finished without a saved draft id."};return}await j.updateMetadata(d,{seed:l,parent_drafts:[n,s],offspring_type:"offspring"}),N("drafts"),yield{type:"complete",asset:d}}static async*generateSeeds(e){yield{type:"status",stage:"initializing"};const t=typeof e=="string"?{genre_lines:e}:e,{genreLines:n}=ro(t),s=A.getApiKeys(),a=A.getConfig(),o=this.resolveConfiguredProvider(a),c=xe({model:a.model,apiKey:o?s[o]:this.getFallbackApiKey(s),apiKeys:s,provider:o,baseUrl:a.base_url,temperature:a.temperature,maxTokens:a.max_tokens});yield{type:"status",stage:"building_prompt"};const[l,d]=await No(n,t.blueprint_content);yield{type:"status",stage:"generating"};const u=Ie(l,d),p=await c.generate(u);yield{type:"complete",content:no(p.content).join(`
`)}}static async*chat(e,t,n){yield{type:"status",stage:"initializing"};const s=A.getApiKeys(),a=A.getConfig(),o=this.resolveConfiguredProvider(a),c=xe({model:a.model,apiKey:o?s[o]:this.getFallbackApiKey(s),apiKeys:s,provider:o,baseUrl:a.base_url,temperature:a.temperature,maxTokens:a.max_tokens});yield{type:"status",stage:"generating"};const d=(t[0]?.role==="system"?t[0].content:void 0)?t.slice(1):t;let u="";for await(const p of c.generateStream(d))if(p.content&&(u+=p.content,yield{type:"chunk",content:p.content}),p.done)break;yield{type:"complete",content:u}}static async analyzeSimilarity(e,t){const n=await j.getDraft(e),s=await j.getDraft(t);if(!n||!s)throw new Error("One or both drafts not found");const a=this.parseCharacterProfile(n.assets.character_sheet||""),o=this.parseCharacterProfile(s.assets.character_sheet||""),c=A.getApiKeys(),l=A.getConfig(),d=this.resolveConfiguredProvider(l),u=xe({model:l.model,apiKey:d?c[d]:this.getFallbackApiKey(c),apiKeys:c,provider:d,baseUrl:l.base_url,temperature:l.temperature,maxTokens:l.max_tokens}),[p,m]=jo(a,o),b=Ie(p,m),f=await u.generate(b);try{return JSON.parse(f.content)}catch{return{raw:f.content}}}static parseBlueprintOutput(e){const t={},n=/```(\w+)?\n([\s\S]*?)```/g,s=["Adjustment Note","system_prompt","post_history","character_sheet","intro_scene","intro_page","a1111","suno"];let a;for(;(a=n.exec(e))!==null;){const o=a[1],c=a[2]?.trim();o&&c&&s.includes(o)&&(t[o]=c)}if(Object.keys(t).length===0)for(let o=0;o<s.length;o++){const c=s[o],l=s[o+1],d=new RegExp(`^##\\s*${c}`,"im"),u=e.search(d);if(u===-1)continue;let p;if(l){const b=new RegExp(`^##\\s*${l}`,"im"),f=e.slice(u).search(b);p=f===-1?e.length:u+f}else p=e.length;const m=e.slice(u,p).trim();m&&(t[c]=m)}return t}static parseCharacterProfile(e){const t={},n=e.split(`
`);let s=null,a=[];for(const o of n){const c=o.match(/^([A-Z][A-Za-z\s]+):\s*(.+)$/);c?(s&&a.length>0&&(t[s]=a.join(`
`).trim()),s=c[1].trim().toLowerCase().replace(/\s+/g,"_"),a=[c[2].trim()]):s&&o.trim()&&a.push(o.trim())}s&&a.length>0&&(t[s]=a.join(`
`).trim());for(const o of["personality_traits","core_values","goals","fears","motivations"])typeof t[o]=="string"&&(t[o]=t[o].split(",").map(c=>c.trim()).filter(c=>c.length>0));return t}static generateReviewId(){const e=Date.now(),t=Math.random().toString(36).substring(2,9);return`${e}_${t}`}}const Ln="eidolon.web.themes.custom",jt="eidolon:themes-synced",Rt="eidolon:drafts-synced";function Do(r,e){const t=e.match(/^---\n([\s\S]*?)\n---/);let n=r.split("/").pop()?.replace(".md","")||"Blueprint",s="",a="1.0",o=!0;if(!t)return{name:n,description:s,version:a,invokable:o};const c=t[1],l=c.match(/^name:\s*(.+)$/m),d=c.match(/^description:\s*(.+)$/m),u=c.match(/^version:\s*(.+)$/m),p=c.match(/^invokable:\s*(.+)$/m);return l&&(n=l[1].trim()),d&&(s=d[1].trim()),u&&(a=u[1].trim()),p&&(o=p[1].trim()==="true"),{name:n,description:s,version:a,invokable:o}}function Lo(r){return!r||typeof r!="object"||Array.isArray(r)?{}:Object.fromEntries(Object.entries(r).filter(e=>typeof e[1]=="string"))}function Fo(r){return typeof r.name!="string"||r.name.trim().length===0||!Array.isArray(r.assets)?null:{template:{name:r.name,version:typeof r.version=="string"&&r.version.trim().length>0?r.version:"1.0.0",description:typeof r.description=="string"?r.description:"",is_official:!!(r.isOfficial??r.is_official),is_default:!!(r.isDefault??r.is_default),assets:r.assets},blueprint_contents:Lo(r.blueprintContent??r.blueprint_contents)}}function Mo(r){return r.startsWith("blueprints/overrides/")?`blueprints/${r.replace(/^blueprints\/overrides\//,"")}`:r}function Uo(r,e){const t=new Set(Bt().map(o=>o.template.name).filter(o=>o!==e));if(!t.has(r))return r;const n=r.endsWith(" Copy")?r:`${r} Copy`;if(!t.has(n))return n;let s=2,a=`${n} ${s}`;for(;t.has(a);)s+=1,a=`${n} ${s}`;return a}const Fn=["bpui.web.themes.custom"],$o=300*1e3,Je=new Map,Bo=[{name:"json",path:"json",format:"json",description:"Export the full draft as JSON."},{name:"text",path:"text",format:"text",description:"Export draft assets as plain text sections."},{name:"combined",path:"combined",format:"combined",description:"Export a markdown bundle with metadata and assets."}];function P(r){return{author:"Eidolon Simulacra",is_builtin:!0,...r}}const Ho=[P({name:"dark",display_name:"Dark",description:"Default dark theme for browser-only mode.",tags:["builtin","dark"],based_on:"",colors:{background:"#0f172a",text:"#e5e7eb",accent:"#38bdf8",button:"#1d4ed8",button_text:"#f8fafc",border:"#334155",highlight:"#7dd3fc",window:"#111827",tok_brackets:"#60a5fa",tok_asterisk:"#f472b6",tok_parentheses:"#f59e0b",tok_double_brackets:"#a78bfa",tok_curly_braces:"#34d399",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#94a3b8",surface:"#1e293b",success_bg:"#052e16",danger_bg:"#450a0a",accent_bg:"#082f49",accent_title:"#e0f2fe",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fcd34d"}}),P({name:"light",display_name:"Light",description:"Default light theme for browser-only mode.",tags:["builtin","light"],based_on:"",colors:{background:"#f8fafc",text:"#0f172a",accent:"#2563eb",button:"#1d4ed8",button_text:"#eff6ff",border:"#cbd5e1",highlight:"#0ea5e9",window:"#ffffff",tok_brackets:"#2563eb",tok_asterisk:"#db2777",tok_parentheses:"#d97706",tok_double_brackets:"#7c3aed",tok_curly_braces:"#059669",tok_pipes:"#0891b2",tok_at_sign:"#e11d48",muted_text:"#64748b",surface:"#ffffff",success_bg:"#dcfce7",danger_bg:"#fee2e2",accent_bg:"#dbeafe",accent_title:"#1e3a8a",success_text:"#166534",error_text:"#991b1b",warning_text:"#92400e"}}),P({name:"nyx",display_name:"Nyx",description:"High-contrast theme tuned for the blueprint workflow.",tags:["builtin","editorial"],based_on:"dark",colors:{background:"#111113",text:"#f3f4f6",accent:"#f97316",button:"#c2410c",button_text:"#fff7ed",border:"#3f3f46",highlight:"#fb923c",window:"#18181b",tok_brackets:"#60a5fa",tok_asterisk:"#f472b6",tok_parentheses:"#f59e0b",tok_double_brackets:"#c084fc",tok_curly_braces:"#4ade80",tok_pipes:"#67e8f9",tok_at_sign:"#fb7185",muted_text:"#a1a1aa",surface:"#18181b",success_bg:"#052e16",danger_bg:"#431407",accent_bg:"#431407",accent_title:"#ffedd5",success_text:"#86efac",error_text:"#fdba74",warning_text:"#fed7aa"}}),P({name:"midnight",display_name:"Midnight",description:"Deep blue ocean theme with cyan accents.",tags:["builtin","dark","blue"],based_on:"dark",colors:{background:"#0a1929",text:"#b2d4f0",accent:"#00b4d8",button:"#014361",button_text:"#caf0f8",border:"#1d3557",highlight:"#48cae4",window:"#051923",tok_brackets:"#00b4d8",tok_asterisk:"#90e0ef",tok_parentheses:"#f48c06",tok_double_brackets:"#06ffa5",tok_curly_braces:"#00b4d8",tok_pipes:"#48cae4",tok_at_sign:"#f77f00",muted_text:"#6b8aa3",surface:"#0f2638",success_bg:"#1b4332",danger_bg:"#641220",accent_bg:"#014361",accent_title:"#48cae4",success_text:"#06ffa5",error_text:"#ff6b6b",warning_text:"#f48c06"}}),P({name:"ember",display_name:"Ember",description:"Warm theme with orange and amber tones.",tags:["builtin","warm","orange"],based_on:"dark",colors:{background:"#1a0f0a",text:"#ffd8b8",accent:"#ff6b35",button:"#c44536",button_text:"#fff8f0",border:"#5e1914",highlight:"#ff8c42",window:"#100a07",tok_brackets:"#ff6b35",tok_asterisk:"#ffa07a",tok_parentheses:"#ffb627",tok_double_brackets:"#7bed9f",tok_curly_braces:"#ff6348",tok_pipes:"#feca57",tok_at_sign:"#ff4757",muted_text:"#a67c52",surface:"#261612",success_bg:"#2d4a2b",danger_bg:"#5e1914",accent_bg:"#c44536",accent_title:"#ff8c42",success_text:"#7bed9f",error_text:"#ff4757",warning_text:"#feca57"}}),P({name:"forest",display_name:"Forest",description:"Natural green theme inspired by woodland twilight.",tags:["builtin","green","nature"],based_on:"dark",colors:{background:"#0d1b0f",text:"#d4f1d4",accent:"#4ecca3",button:"#2d5f3f",button_text:"#e8f5e8",border:"#1e4620",highlight:"#7bed9f",window:"#081108",tok_brackets:"#4ecca3",tok_asterisk:"#7bed9f",tok_parentheses:"#ffd93d",tok_double_brackets:"#6bcf7f",tok_curly_braces:"#48c774",tok_pipes:"#95e1d3",tok_at_sign:"#f8b500",muted_text:"#6b8f71",surface:"#152518",success_bg:"#2d5f3f",danger_bg:"#5c2a2a",accent_bg:"#2d5f3f",accent_title:"#7bed9f",success_text:"#95e1d3",error_text:"#ff6b6b",warning_text:"#ffd93d"}}),P({name:"mono",display_name:"Monochrome",description:"Clean grayscale theme for minimal distraction.",tags:["builtin","minimal","grayscale"],based_on:"dark",colors:{background:"#1c1c1c",text:"#e0e0e0",accent:"#757575",button:"#424242",button_text:"#ffffff",border:"#505050",highlight:"#9e9e9e",window:"#141414",tok_brackets:"#bdbdbd",tok_asterisk:"#9e9e9e",tok_parentheses:"#757575",tok_double_brackets:"#e0e0e0",tok_curly_braces:"#a0a0a0",tok_pipes:"#c0c0c0",tok_at_sign:"#888888",muted_text:"#707070",surface:"#242424",success_bg:"#3a3a3a",danger_bg:"#2e2e2e",accent_bg:"#424242",accent_title:"#9e9e9e",success_text:"#c0c0c0",error_text:"#a0a0a0",warning_text:"#b0b0b0"}}),P({name:"solarized_dark",display_name:"Solarized Dark",description:"Popular Solarized color scheme with reduced eye strain.",tags:["builtin","dark","solarized"],based_on:"dark",colors:{background:"#002b36",text:"#839496",accent:"#268bd2",button:"#073642",button_text:"#eee8d5",border:"#586e75",highlight:"#2aa198",window:"#001e26",tok_brackets:"#dc322f",tok_asterisk:"#268bd2",tok_parentheses:"#cb4b16",tok_double_brackets:"#859900",tok_curly_braces:"#d33682",tok_pipes:"#2aa198",tok_at_sign:"#b58900",muted_text:"#586e75",surface:"#073642",success_bg:"#324d32",danger_bg:"#4d2626",accent_bg:"#073642",accent_title:"#2aa198",success_text:"#859900",error_text:"#dc322f",warning_text:"#b58900"}}),P({name:"trans_flag",display_name:"Trans Flag",description:"Soft cyan and pink palette with neutral dark surfaces.",tags:["builtin","support","bright"],based_on:"dark",colors:{background:"#2e2e2e",text:"#ffffff",accent:"#5bcefa",button:"#f5a9b8",button_text:"#2e2e2e",border:"#cccccc",highlight:"#5bcefa",window:"#3e3e3e",tok_brackets:"#5bcefa",tok_asterisk:"#f5a9b8",tok_parentheses:"#5bcefa",tok_double_brackets:"#f5a9b8",tok_curly_braces:"#ffffff",tok_pipes:"#5bcefa",tok_at_sign:"#f5a9b8",muted_text:"#cccccc",surface:"#3e3e3e",success_bg:"#5bcefa",danger_bg:"#f5a9b8",accent_bg:"#3e3e3e",accent_title:"#5bcefa",success_text:"#2e2e2e",error_text:"#2e2e2e",warning_text:"#2e2e2e"}}),P({name:"blood_for_the_blood_god",display_name:"Blood for the Blood God",description:"A blood red theme with bronze accents.",tags:["builtin","warhammer","chaos","khorne"],based_on:"dark",colors:{background:"#200000",text:"#ffcccc",accent:"#cd7f32",button:"#600000",button_text:"#ffcccc",border:"#400000",highlight:"#ff0000",window:"#200000",tok_brackets:"#e00000",tok_asterisk:"#c00000",tok_parentheses:"#a00000",tok_double_brackets:"#e00000",tok_curly_braces:"#c00000",tok_pipes:"#a00000",tok_at_sign:"#ff0000",muted_text:"#996666",surface:"#400000",success_bg:"#600000",danger_bg:"#800000",accent_bg:"#a06629",accent_title:"#cd7f32",success_text:"#ffcccc",error_text:"#ffcccc",warning_text:"#ffcccc"}}),P({name:"silent_king",display_name:"Silent King",description:"A near-black theme with tomb-world green glow.",tags:["builtin","warhammer","necron","green"],based_on:"dark",colors:{background:"#010a01",text:"#a0e0a0",accent:"#00ff00",button:"#004000",button_text:"#a0e0a0",border:"#002000",highlight:"#00ff00",window:"#010501",tok_brackets:"#00c000",tok_asterisk:"#00a000",tok_parentheses:"#008000",tok_double_brackets:"#00c000",tok_curly_braces:"#00a000",tok_pipes:"#008000",tok_at_sign:"#00ff00",muted_text:"#609060",surface:"#010a01",success_bg:"#004000",danger_bg:"#006000",accent_bg:"#004000",accent_title:"#00ff00",success_text:"#a0e0a0",error_text:"#a0e0a0",warning_text:"#a0e0a0"}}),P({name:"ultramar",display_name:"Ultramar",description:"Cerulean armor, parchment ivory, and gold command trim.",tags:["builtin","warhammer","space-marine","blue"],based_on:"dark",colors:{background:"#08172f",text:"#e8eef7",accent:"#d4a72c",button:"#12396b",button_text:"#f8fafc",border:"#245089",highlight:"#4da3ff",window:"#0b2140",tok_brackets:"#60a5fa",tok_asterisk:"#facc15",tok_parentheses:"#fb7185",tok_double_brackets:"#93c5fd",tok_curly_braces:"#67e8f9",tok_pipes:"#c084fc",tok_at_sign:"#f97316",muted_text:"#93a9c4",surface:"#102949",success_bg:"#163b2a",danger_bg:"#481818",accent_bg:"#3d2b05",accent_title:"#fde68a",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fde047"}}),P({name:"imperial_fists",display_name:"Imperial Fists",description:"Siege yellow palette with navy shadows and hazard-strip energy.",tags:["builtin","warhammer","space-marine","yellow"],based_on:"dark",colors:{background:"#1c1603",text:"#fff6cc",accent:"#ffd100",button:"#7c6200",button_text:"#fffbea",border:"#8e740f",highlight:"#ffe66d",window:"#241d05",tok_brackets:"#ffd100",tok_asterisk:"#60a5fa",tok_parentheses:"#fb923c",tok_double_brackets:"#fde68a",tok_curly_braces:"#facc15",tok_pipes:"#93c5fd",tok_at_sign:"#f87171",muted_text:"#c5b671",surface:"#302608",success_bg:"#2d3d1b",danger_bg:"#51210f",accent_bg:"#483701",accent_title:"#fff3a3",success_text:"#bef264",error_text:"#fca5a5",warning_text:"#fde047"}}),P({name:"raven_guard",display_name:"Raven Guard",description:"Matte black surfaces with pale steel highlights and a covert red ping.",tags:["builtin","warhammer","space-marine","stealth"],based_on:"dark",colors:{background:"#09090b",text:"#e7e5e4",accent:"#d4d4d8",button:"#18181b",button_text:"#fafafa",border:"#3f3f46",highlight:"#a1a1aa",window:"#0f1014",tok_brackets:"#e4e4e7",tok_asterisk:"#f87171",tok_parentheses:"#c084fc",tok_double_brackets:"#93c5fd",tok_curly_braces:"#86efac",tok_pipes:"#67e8f9",tok_at_sign:"#fb7185",muted_text:"#71717a",surface:"#14151a",success_bg:"#14231a",danger_bg:"#3f1014",accent_bg:"#20232a",accent_title:"#f4f4f5",success_text:"#86efac",error_text:"#fda4af",warning_text:"#fdba74"}}),P({name:"salamanders",display_name:"Salamanders",description:"Volcanic green palette with lava orange contrast.",tags:["builtin","warhammer","space-marine","green"],based_on:"dark",colors:{background:"#08130e",text:"#d9f4dd",accent:"#ff7a00",button:"#1c5b34",button_text:"#f7fff8",border:"#2f7d4e",highlight:"#34d399",window:"#0d1d16",tok_brackets:"#4ade80",tok_asterisk:"#fb923c",tok_parentheses:"#facc15",tok_double_brackets:"#86efac",tok_curly_braces:"#22c55e",tok_pipes:"#2dd4bf",tok_at_sign:"#f97316",muted_text:"#7ca58a",surface:"#11251b",success_bg:"#123825",danger_bg:"#4a1d11",accent_bg:"#4a2205",accent_title:"#fdba74",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde047"}}),P({name:"iron_warriors",display_name:"Iron Warriors",description:"Gunmetal, hazard yellow, and industrial rust.",tags:["builtin","warhammer","chaos","industrial"],based_on:"dark",colors:{background:"#101114",text:"#d8d7d2",accent:"#facc15",button:"#3a3d42",button_text:"#fffce8",border:"#5a5f69",highlight:"#fde047",window:"#17191d",tok_brackets:"#facc15",tok_asterisk:"#fb7185",tok_parentheses:"#fb923c",tok_double_brackets:"#d4d4d8",tok_curly_braces:"#93c5fd",tok_pipes:"#67e8f9",tok_at_sign:"#f97316",muted_text:"#8f9098",surface:"#20242a",success_bg:"#243326",danger_bg:"#48211a",accent_bg:"#43370a",accent_title:"#fef08a",success_text:"#86efac",error_text:"#fdba74",warning_text:"#fde047"}}),P({name:"mechanicus_brass",display_name:"Mechanicus Brass",description:"Mars red, soot black, and worn brass for forge-heavy work.",tags:["builtin","warhammer","mechanicus","red"],based_on:"dark",colors:{background:"#130909",text:"#f1d9c3",accent:"#c98b2b",button:"#611616",button_text:"#fff4e6",border:"#7f2a1d",highlight:"#e2a74a",window:"#1a0d0d",tok_brackets:"#f87171",tok_asterisk:"#fbbf24",tok_parentheses:"#fdba74",tok_double_brackets:"#fca5a5",tok_curly_braces:"#fcd34d",tok_pipes:"#93c5fd",tok_at_sign:"#fb7185",muted_text:"#a98a75",surface:"#251212",success_bg:"#1f3424",danger_bg:"#4c1515",accent_bg:"#3f2610",accent_title:"#f6d28b",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fcd34d"}}),P({name:"sororitas_rose",display_name:"Sororitas Rose",description:"Ivory, cathedral black, and stained-glass crimson.",tags:["builtin","warhammer","imperium","gothic"],based_on:"dark",colors:{background:"#141112",text:"#f7ede8",accent:"#b91c1c",button:"#3c1318",button_text:"#fff7f5",border:"#6d2730",highlight:"#fb7185",window:"#1b1718",tok_brackets:"#fda4af",tok_asterisk:"#facc15",tok_parentheses:"#fdba74",tok_double_brackets:"#f5f5f4",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#ef4444",muted_text:"#b2a29c",surface:"#231d1f",success_bg:"#203326",danger_bg:"#4b1319",accent_bg:"#3b1016",accent_title:"#fecdd3",success_text:"#bbf7d0",error_text:"#fecaca",warning_text:"#fdba74"}}),P({name:"cadia_stands",display_name:"Cadia Stands",description:"Military olive, field khaki, and disciplined gold signals.",tags:["builtin","warhammer","imperium","guard"],based_on:"dark",colors:{background:"#11160f",text:"#e6ecd8",accent:"#c8a54b",button:"#3a4b2a",button_text:"#f8faee",border:"#556a3e",highlight:"#a3c76d",window:"#171d14",tok_brackets:"#a3c76d",tok_asterisk:"#facc15",tok_parentheses:"#fb923c",tok_double_brackets:"#d9f99d",tok_curly_braces:"#86efac",tok_pipes:"#93c5fd",tok_at_sign:"#f87171",muted_text:"#99a58b",surface:"#20281b",success_bg:"#243624",danger_bg:"#4a2218",accent_bg:"#3e3413",accent_title:"#f5e6b1",success_text:"#bbf7d0",error_text:"#fca5a5",warning_text:"#fde68a"}}),P({name:"krieg_ash",display_name:"Krieg Ash",description:"Trenchcoat slate, muddy blue, and mask-lens amber.",tags:["builtin","warhammer","imperium","guard"],based_on:"dark",colors:{background:"#101417",text:"#dae1e5",accent:"#d1a449",button:"#3a4854",button_text:"#f6f7f8",border:"#55616c",highlight:"#9db7c7",window:"#151b20",tok_brackets:"#93c5fd",tok_asterisk:"#facc15",tok_parentheses:"#fb923c",tok_double_brackets:"#cbd5e1",tok_curly_braces:"#86efac",tok_pipes:"#67e8f9",tok_at_sign:"#f87171",muted_text:"#8e9aa3",surface:"#1d242a",success_bg:"#233127",danger_bg:"#48231c",accent_bg:"#3f3118",accent_title:"#f4deb1",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde68a"}}),P({name:"thousand_sons",display_name:"Thousand Sons",description:"Arcane cobalt with turquoise sorcery and gilded trim.",tags:["builtin","warhammer","chaos","arcane"],based_on:"dark",colors:{background:"#081427",text:"#dce9ff",accent:"#22d3ee",button:"#12335f",button_text:"#f0f9ff",border:"#1d4f91",highlight:"#7dd3fc",window:"#0d1b35",tok_brackets:"#38bdf8",tok_asterisk:"#facc15",tok_parentheses:"#fb7185",tok_double_brackets:"#67e8f9",tok_curly_braces:"#a78bfa",tok_pipes:"#22d3ee",tok_at_sign:"#f97316",muted_text:"#96a9c6",surface:"#132346",success_bg:"#14312c",danger_bg:"#451b2f",accent_bg:"#10354d",accent_title:"#cffafe",success_text:"#99f6e4",error_text:"#f9a8d4",warning_text:"#fde047"}}),P({name:"drukhari_raid",display_name:"Drukhari Raid",description:"Poison teal, blade violet, and void-black lacquer.",tags:["builtin","warhammer","aeldari","neon"],based_on:"dark",colors:{background:"#09070f",text:"#ece7ff",accent:"#14b8a6",button:"#2c1144",button_text:"#f5f3ff",border:"#5b21b6",highlight:"#5eead4",window:"#100b1a",tok_brackets:"#2dd4bf",tok_asterisk:"#c084fc",tok_parentheses:"#f472b6",tok_double_brackets:"#67e8f9",tok_curly_braces:"#a78bfa",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#9d94b8",surface:"#170f25",success_bg:"#123028",danger_bg:"#43162e",accent_bg:"#102f31",accent_title:"#ccfbf1",success_text:"#99f6e4",error_text:"#f9a8d4",warning_text:"#f0abfc"}}),P({name:"ork_waaagh",display_name:"Ork Waaagh!",description:"Scrap metal, noisy green, and red-goes-fasta contrast.",tags:["builtin","warhammer","ork","high-energy"],based_on:"dark",colors:{background:"#11140c",text:"#e2f5b8",accent:"#67e01f",button:"#734116",button_text:"#fff7ed",border:"#4b5f1a",highlight:"#84cc16",window:"#181d10",tok_brackets:"#84cc16",tok_asterisk:"#ef4444",tok_parentheses:"#f97316",tok_double_brackets:"#bef264",tok_curly_braces:"#facc15",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#9eb279",surface:"#232813",success_bg:"#26401d",danger_bg:"#5a2314",accent_bg:"#293a12",accent_title:"#d9f99d",success_text:"#d9f99d",error_text:"#fdba74",warning_text:"#fde047"}}),P({name:"tau_sept",display_name:"Tau Sept",description:"Clean ochre, alloy grey, and cool interface blue.",tags:["builtin","warhammer","tau","clean"],based_on:"dark",colors:{background:"#11161a",text:"#e8edf0",accent:"#f59e0b",button:"#41525f",button_text:"#f8fafc",border:"#617688",highlight:"#7dd3fc",window:"#161d23",tok_brackets:"#93c5fd",tok_asterisk:"#fbbf24",tok_parentheses:"#fb923c",tok_double_brackets:"#cbd5e1",tok_curly_braces:"#67e8f9",tok_pipes:"#38bdf8",tok_at_sign:"#f97316",muted_text:"#9aa8b2",surface:"#202930",success_bg:"#1e3430",danger_bg:"#4a2218",accent_bg:"#41320c",accent_title:"#fde68a",success_text:"#99f6e4",error_text:"#fdba74",warning_text:"#fde047"}}),P({name:"tyranid_hive",display_name:"Tyranid Hive",description:"Bone chitin, toxic magenta, and abyssal carapace purple.",tags:["builtin","warhammer","tyranid","organic"],based_on:"dark",colors:{background:"#120c18",text:"#f3e8ff",accent:"#f472b6",button:"#3f1b4d",button_text:"#fff7fb",border:"#6b2d78",highlight:"#f9a8d4",window:"#1a1222",tok_brackets:"#f5d0fe",tok_asterisk:"#fb7185",tok_parentheses:"#fdba74",tok_double_brackets:"#e9d5ff",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#f43f5e",muted_text:"#b7a3c4",surface:"#24182f",success_bg:"#243321",danger_bg:"#4f1733",accent_bg:"#441a3d",accent_title:"#fbcfe8",success_text:"#bef264",error_text:"#fda4af",warning_text:"#fdba74"}}),P({name:"genestealer_cult",display_name:"Genestealer Cult",description:"Industrial violet with warning pink and cult neon accents.",tags:["builtin","warhammer","tyranid","industrial"],based_on:"dark",colors:{background:"#0f1020",text:"#ede9fe",accent:"#8b5cf6",button:"#312e81",button_text:"#f5f3ff",border:"#5b4bc4",highlight:"#c084fc",window:"#151730",tok_brackets:"#a78bfa",tok_asterisk:"#fb7185",tok_parentheses:"#f97316",tok_double_brackets:"#ddd6fe",tok_curly_braces:"#67e8f9",tok_pipes:"#c084fc",tok_at_sign:"#f43f5e",muted_text:"#a6a1c9",surface:"#1d2040",success_bg:"#203229",danger_bg:"#47152a",accent_bg:"#2e255d",accent_title:"#e9d5ff",success_text:"#99f6e4",error_text:"#fda4af",warning_text:"#fdba74"}}),P({name:"golden_throne",display_name:"Golden Throne",description:"Black marble, relic gold, and cathedral ivory.",tags:["builtin","warhammer","imperium","gold"],based_on:"dark",colors:{background:"#110f0d",text:"#f6efe2",accent:"#d4af37",button:"#4a3510",button_text:"#fffbeb",border:"#6f5521",highlight:"#f6d365",window:"#171411",tok_brackets:"#fcd34d",tok_asterisk:"#fda4af",tok_parentheses:"#fdba74",tok_double_brackets:"#fef3c7",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#f87171",muted_text:"#b3a58d",surface:"#231e18",success_bg:"#253224",danger_bg:"#472119",accent_bg:"#433311",accent_title:"#fef3c7",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde68a"}})];class se{constructor(e){this.executor=e}readers=[];onComplete;onError;controller=new AbortController;subscribe(e){return this.readers.push(e),this}onComplete_(e){return this.onComplete=e,this}onError_(e){return this.onError=e,this}async start(){try{await this.executor({emit:(e,t)=>this.emit(e,t),signal:this.controller.signal})}catch(e){if(this.controller.signal.aborted)return;this.emit("error",{error:e instanceof Error?e.message:"Stream failed"})}}abort(){this.controller.abort()}emit(e,t){const n={event:e,data:t};this.readers.forEach(s=>s(n)),n.event==="complete"&&this.onComplete&&this.onComplete(n.data),n.event==="error"&&this.onError&&this.onError(n.data.error)}}class R extends Error{constructor(e,t){super(t),this.status=e,this.name="APIError"}}function Ko(r,e){if(typeof window>"u")return e;const t=Array.isArray(r)?[...r]:[r],[n,...s]=t;try{for(const a of t){const o=window.localStorage.getItem(a);if(!o)continue;const c=JSON.parse(o);return a!==n&&(window.localStorage.setItem(n,JSON.stringify(c)),s.forEach(l=>window.localStorage.removeItem(l))),c}}catch{return e}return e}function Go(r,e,t){typeof window>"u"||(window.localStorage.setItem(r,JSON.stringify(t)),e.forEach(n=>window.localStorage.removeItem(n)))}function _t(r){return r.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function xt(){return{...A.getConfig(),api_keys:A.getApiKeys()}}function Wo(r){return r.engine_mode==="explicit"&&r.engine!=="auto"&&r.engine!=="openai_compatible"?r.engine:r.model?Dt(r.model):void 0}function Mn(r){return Object.values(r).find(e=>typeof e=="string"&&e.trim().length>0)}function zo(r,e){const t=e[r];return typeof t=="string"&&t.trim().length>0?t:Mn(e)}function ce(){return Ko([Ln,...Fn],[])}function _e(r){Go(Ln,Fn,r)}function Xe(){return[...Ho,...ce()]}function gr(r){typeof window>"u"||window.dispatchEvent(new CustomEvent(r))}function dt(r){return typeof r.archived_at=="string"&&r.archived_at.trim().length>0}function qo(r,e,t=r,n=t){const s=t.reduce((a,o)=>{a.total_drafts+=1,dt(o)&&(a.archived_drafts+=1),o.favorite&&(a.favorites+=1);const c=o.genre||"unknown",l=o.mode||"unknown";return a.by_genre[c]=(a.by_genre[c]||0)+1,a.by_mode[l]=(a.by_mode[l]||0)+1,a},{total_drafts:0,archived_drafts:n.filter(a=>dt(a)).length,favorites:0,by_genre:{},by_mode:{}});return{drafts:r,total:e,stats:s}}function Vo(r,e){let t=[...r];if(e?.include_archived||(e?.archived?t=t.filter(c=>dt(c)):t=t.filter(c=>!dt(c))),e?.search){const c=e.search.toLowerCase();t=t.filter(l=>[l.character_name,l.seed,l.genre,l.notes].filter(Boolean).some(d=>String(d).toLowerCase().includes(c)))}e?.genre&&(t=t.filter(c=>c.genre===e.genre)),e?.mode&&(t=t.filter(c=>c.mode===e.mode)),e?.favorite!==void 0&&(t=t.filter(c=>c.favorite===e.favorite)),e?.tags?.length&&(t=t.filter(c=>e.tags?.every(l=>c.tags?.includes(l))));const n=e?.sort_order==="asc"?1:-1,s=e?.sort_by??"modified";t.sort((c,l)=>{const d=s==="name"?c.character_name||c.seed||"":(s==="created"?c.created:c.modified)||"",u=s==="name"?l.character_name||l.seed||"":(s==="created"?l.created:l.modified)||"";return d.localeCompare(u)*n});const a=e?.offset??0,o=e?.limit;return o!==void 0?t=t.slice(a,a+o):a>0&&(t=t.slice(a)),t}function yr(r){const e=[],t=Ne(r.metadata.template_name)||Fe;return Mr(t).filter(s=>s.required).forEach(s=>{r.assets[s.name]?.trim()||e.push(`- missing required asset ${s.name}`)}),Object.entries(r.assets).forEach(([s,a])=>{if(!a.trim()){e.push(`- ${s}: asset is empty`);return}const o=Dr(s,a);o.length>0&&e.push(`- ${s}: ${Array.from(new Set(o)).join(", ")}`)}),e.length===0?e.push("OK: no obvious placeholder violations found in saved assets."):e.unshift("VALIDATION FAILED"),{path:r.metadata.review_id,output:e.join(`
`),errors:"",exit_code:e[0]==="VALIDATION FAILED"?1:0,success:e[0]!=="VALIDATION FAILED"}}function br(r){const e=`${r.metadata.character_name||""}
${r.metadata.seed}
${Object.values(r.assets).join(`
`)}`.toLowerCase().replace(/[^a-z0-9\s]+/g," ").split(/\s+/).filter(t=>t.length>3);return new Set(e)}function Yo(r){return r>=.7?"high":r>=.45?"medium":"low"}function Jo(r,e){const t=br(r),n=br(e),s=[...t].filter(p=>n.has(p)),a=[...t].filter(p=>!n.has(p)),o=[...n].filter(p=>!t.has(p)),c=new Set([...t,...n]).size||1,l=s.length/c,d=Math.min(1,(a.length+o.length)/Math.max(c,1)),u=Math.min(1,l+.15);return{character1_name:r.metadata.character_name||r.metadata.seed,character2_name:e.metadata.character_name||e.metadata.seed,overall_score:l,compatibility:Yo(l),conflict_potential:d,synergy_potential:u,commonalities:s.slice(0,8),differences:[...a.slice(0,4),...o.slice(0,4)],relationship_suggestions:l>=.6?["Shared themes suggest an easy alliance arc.","Overlapping traits support collaborative scenes."]:["Use the contrast between their goals for tension.","Differences suggest rivalry or uneasy partnership."],meta_analysis:{archetype_match:l,narrative_compatibility:u,audience_appeal:Math.max(l,.35)}}}function Xo(r){const e=new Map;r.forEach(l=>{l.parent_drafts?.forEach(d=>{const u=e.get(d)??[];u.push(l.review_id),e.set(d,u)})});const t=new Map(r.map(l=>[l.review_id,l])),n=new Map,s=l=>{if(n.has(l))return n.get(l);const d=t.get(l);if(!d?.parent_drafts?.length)return n.set(l,0),0;const u=1+Math.max(...d.parent_drafts.map(p=>s(p)));return n.set(l,u),u},a=r.map(l=>{const d=l.parent_drafts??[],u=e.get(l.review_id)??[],p=s(l.review_id),m=d.map(f=>t.get(f)?.character_name||f),b=u.map(f=>t.get(f)?.character_name||f);return{id:l.review_id,review_id:l.review_id,draft_name:l.seed,character_name:l.character_name||l.seed,generation:p,is_root:d.length===0,is_leaf:u.length===0,offspring_type:l.offspring_type,mode:l.mode,model:l.model,created:l.created,parent_ids:d,child_ids:u,parent_names:m,child_names:b,sibling_names:d.flatMap(f=>(e.get(f)??[]).filter(y=>y!==l.review_id)).map(f=>t.get(f)?.character_name||f),num_ancestors:d.length,num_descendants:u.length}}),o=a.filter(l=>l.is_root).map(l=>l.id),c=a.reduce((l,d)=>Math.max(l,d.generation),0);return{nodes:a,roots:o,max_generation:c,stats:{total_characters:a.length,root_characters:a.filter(l=>l.is_root).length,leaf_characters:a.filter(l=>l.is_leaf).length,generations:c+1}}}function Pe(r,e,t){return{blob:new Blob([r],{type:t}),filename:e,contentType:t}}function wr(r){return r.replace(/^##/gm,"\\##")}async function vr(r){const e=A.getConfig(),t=A.getApiKeys(),n=Wo(e);return xe({model:e.model,apiKey:n?t[n]:Mn(t),apiKeys:t,provider:n,baseUrl:e.base_url,temperature:e.temperature,maxTokens:e.max_tokens}).generateStream(r)}class Qo{themesSyncPromise=null;draftsSyncPromise=null;configSyncPromise=null;async fetchOpenAICompatibleModels(e,t,n){const s=`${n}/models`,a=ke(e,t),o=await fetch(s,{method:"GET",headers:a});if(!o.ok){let d=`HTTP ${o.status}`;try{const u=await o.json();typeof u.error=="string"?d=u.error:u.error?.message&&(d=u.error.message)}catch{}throw new R(o.status,d)}const l=((await o.json()).data||[]).filter(d=>!!d?.id).map(d=>({id:d.id,name:d.name||d.id,provider:e,context_length:d.context_length,supports_vision:d.architecture?.input_modalities?.includes("image")||!1,supports_tools:d.supported_parameters?.includes("tools")||!1}));return{provider:e,models:l,cached:!1}}async loadProviderModels(e,t=!1){const n=A.getApiKeys(),s=A.getConfig(),a=e,o=s.base_url||la(a),c=zo(e,n),l=`${e}|${o}|${c?"auth":"anon"}`,d=Je.get(l);if(!t&&d&&Date.now()-d.cachedAt<$o)return{...d.response,cached:!0};const u=(ar[a]||[]).map(m=>({id:m,name:m,provider:e})),p=["openrouter","openai","deepseek","zai","moonshot"].includes(e);if(!c||!p){const m={provider:e,models:u,cached:!0,error:c||p?void 0:"Provider model listing is not available in browser mode."};return Je.set(l,{response:m,cachedAt:Date.now()}),m}try{const m=await this.fetchOpenAICompatibleModels(e,c,o);return Je.set(l,{response:m,cachedAt:Date.now()}),m}catch(m){const f=m instanceof TypeError&&m.message==="Failed to fetch"?"Network request blocked. This may be due to browser privacy settings (common in EU), ad blockers, or firewall restrictions. Try disabling tracking protection for this site or using a different network.":m instanceof Error?m.message:"Failed to load models",y={provider:e,models:u,cached:!0,error:f};return Je.set(l,{response:y,cachedAt:Date.now()}),y}}async getConfig(){return xt()}getConfigSnapshot(){return xt()}getThemesSnapshot(){return Xe()}async syncConfigFromServer(){return!_.isEnabled()||!_.hasAccessToken()?!1:this.configSyncPromise?this.configSyncPromise:(this.configSyncPromise=(async()=>{try{const[e,t]=await Promise.all([_.pullConfig(),_.pullApiKeys()]),n=A.getConfig(),s=A.getApiKeys(),a=e.config||{},o=t.apiKeys||{},c=JSON.stringify(n)!==JSON.stringify({...n,...a}),l=JSON.stringify(s)!==JSON.stringify(o);return!c&&!l?!1:(A.updateConfig(a),A.replaceApiKeys(o),!0)}catch(e){return console.warn("Failed to sync config from server:",e),!1}finally{this.configSyncPromise=null}})(),this.configSyncPromise)}async updateConfig(e){const t={...e};return e.api_keys&&(A.replaceApiKeys(e.api_keys),delete t.api_keys),A.updateConfig(t),N("config"),this.getConfig()}async testConnection(e){const t=A.getApiKeys()[e.provider];if(!t)return{success:!1,error:`No API key configured for ${e.provider}`};const n=e.model||ar[e.provider]?.[0]||xt().model;return xe({model:n,apiKey:t,provider:e.provider,baseUrl:e.base_url}).testConnection()}async syncThemesFromServer(){return this.themesSyncPromise?this.themesSyncPromise:(this.themesSyncPromise=(async()=>{if(!_.isEnabled()||!_.hasAccessToken())return!1;try{const{themes:e}=await _.syncThemes("pull"),t=ce();let n=!1;for(const s of e){if(s.isBuiltin)continue;const a={name:s.name,display_name:s.displayName||s.name,description:s.description||"",author:s.author||"",tags:s.tags,based_on:s.basedOn||"",is_builtin:!1,colors:s.colors},o=t.findIndex(c=>c.name===s.name);o>=0?JSON.stringify(t[o])!==JSON.stringify(a)&&(t[o]=a,n=!0):(t.push(a),n=!0)}return n&&(_e(t),gr(jt)),n}catch(e){return console.warn("Failed to sync themes from server:",e),!1}finally{this.themesSyncPromise=null}})(),this.themesSyncPromise)}async syncDraftsFromServer(){return this.draftsSyncPromise?this.draftsSyncPromise:(this.draftsSyncPromise=(async()=>{if(!_.isEnabled()||!_.hasAccessToken())return!1;try{const{drafts:e}=await _.syncDrafts("pull");let t=!1;for(const n of e){const s=await j.getDraft(n.reviewId);if(!s){await j.saveDraft({path:n.reviewId,metadata:{review_id:n.reviewId,seed:n.seed,mode:n.mode,model:n.model,created:n.createdAt,modified:n.updatedAt,archived_at:n.archivedAt,character_name:n.characterName,template_name:n.templateName,genre:n.genre,notes:n.notes,favorite:n.favorite,tags:n.tags,offspring_type:n.offspringType},assets:n.assets}),t=!0;continue}const a=new Date(s.metadata.modified||0).getTime();new Date(n.updatedAt).getTime()>a&&(await j.saveDraft({path:s.path,metadata:{...s.metadata,seed:n.seed,mode:n.mode,model:n.model,created:n.createdAt,modified:n.updatedAt,archived_at:n.archivedAt,character_name:n.characterName,template_name:n.templateName,genre:n.genre,notes:n.notes,favorite:n.favorite,tags:n.tags,offspring_type:n.offspringType},assets:n.assets}),t=!0)}return t&&gr(Rt),t}catch(e){return console.warn("Failed to sync drafts from server:",e),!1}finally{this.draftsSyncPromise=null}})(),this.draftsSyncPromise)}async getThemes(){return this.syncThemesFromServer(),this.getThemesSnapshot()}async createTheme(e){const t=ce();if(Xe().some(s=>s.name===e.name))throw new R(409,`Theme ${e.name} already exists`);const n={...e,description:e.description||"",author:e.author||"",tags:e.tags||[],based_on:e.based_on||"",is_builtin:!1};return t.push(n),_e(t),N("themes"),n}async exportTheme(e){const t=Xe().find(n=>n.name===e);if(!t)throw new R(404,`Theme ${e} not found`);return Pe(JSON.stringify(t,null,2),`${_t(e)}.json`,"application/json")}async importTheme(e,t={}){const s={...JSON.parse(await e.text()),is_builtin:!1},a=ce(),o=a.findIndex(c=>c.name===s.name);if(o>=0)if(t.conflict_strategy==="overwrite")a[o]=s;else if(t.conflict_strategy==="rename")s.name=t.target_name||`${s.name}_copy`,a.push(s);else throw new R(409,`Theme ${s.name} already exists`);else a.push(s);return _e(a),N("themes"),s}async updateTheme(e,t){const n=ce(),s=n.findIndex(a=>a.name===e);if(s<0)throw new R(404,`Theme ${e} is builtin or missing`);return n[s]={...n[s],...t},_e(n),N("themes"),n[s]}async duplicateTheme(e,t){const n=Xe().find(s=>s.name===e);if(!n)throw new R(404,`Theme ${e} not found`);return this.createTheme({name:t.new_name,display_name:t.display_name||n.display_name,description:t.description||n.description,author:t.author||n.author,tags:t.tags||n.tags,based_on:t.based_on||n.name,colors:n.colors})}async renameTheme(e,t){return this.updateTheme(e,{display_name:t.display_name,...t.new_name!==e?{}:{}}).then(n=>{const s=ce(),a=s.findIndex(o=>o.name===e);if(a<0)throw new R(404,`Theme ${e} is builtin or missing`);return s[a]={...n,name:t.new_name},_e(s),N("themes"),s[a]})}async deleteTheme(e){const t=ce().filter(n=>n.name!==e);return _e(t),N("themes"),{status:"deleted",name:e}}async getModels(e){return this.loadProviderModels(e,!1)}async refreshModels(e){const t=await this.loadProviderModels(e,!0);return{status:"ok",model_count:t.models.length,error:t.error}}async generateSeeds(e){const t=[];for await(const n of ne.generateSeeds(e))n.type==="complete"&&n.content&&t.push(...n.content.split(`
`).map(s=>s.trim()).filter(Boolean));return{seeds:[...new Set(t)]}}async getTemplates(){if(_.isEnabled()&&_.hasAccessToken())try{const{templates:e=[]}=await _.syncTemplates("pull"),t=ue();for(const n of e){const s=Fo(n);!s||ur(s.template.name)||t.push(s)}qe(t)}catch(e){console.warn("Failed to sync templates from server:",e)}return Bt().map(e=>e.template)}async listTemplates(){return this.getTemplates()}async getTemplate(e){const t=Q(e);if(!t)throw new R(404,`Template ${e} not found`);return t.template}async getTemplateBlueprintContents(e){const t=Q(e);if(!t)throw new R(404,`Template ${e} not found`);return{blueprint_contents:t.blueprint_contents}}async createTemplate(e){const t=ue();if(t.some(a=>a.template.name===e.name))throw new R(409,`Template ${e.name} already exists`);const n={name:e.name,version:e.version,description:e.description,assets:e.assets,is_official:!1},s={template:n,blueprint_contents:e.blueprint_contents};return t.push(s),qe(t),N("templates"),n}async updateTemplate(e,t){const n=ue(),s=n.findIndex(a=>a.template.name===e);if(s<0){if(!Q(e))throw new R(404,`Template ${e} not found`);const o=Uo(t.name,e);return this.createTemplate({...t,name:o})}if(t.name!==e){const a=Q(t.name);if(a&&a.template.name!==e)throw new R(409,`Template ${t.name} already exists`)}return n[s]={template:{name:t.name,version:t.version,description:t.description,assets:t.assets,is_official:!1},blueprint_contents:t.blueprint_contents},qe(n),N("templates"),n[s].template}async deleteTemplate(e){const t=ue().filter(n=>n.template.name!==e);return qe(t),N("templates"),{status:"deleted",name:e}}async duplicateTemplate(e,t){const n=Q(e);if(!n)throw new R(404,`Template ${e} not found`);return this.createTemplate({name:t.name,version:t.version||n.template.version,description:n.template.description,assets:n.template.assets,blueprint_contents:n.blueprint_contents})}async validateTemplate(e){const t=Q(e);if(!t)throw new R(404,`Template ${e} not found`);const n=Qs(t.template),s=t.template.assets.filter(a=>!t.blueprint_contents[a.blueprint_file||`${a.name}.md`]).map(a=>`Missing blueprint content for ${a.name}`);return{errors:n.errors,warnings:s}}async exportTemplate(e){const t=ur(e)??Q(e);if(!t)throw new R(404,`Template ${e} not found`);return Pe(JSON.stringify(t,null,2),`${_t(e)}.json`,"application/json")}async importTemplate(e){const t=JSON.parse(await e.text());if("template"in t&&t.template){const n=t;return this.createTemplate({name:n.template.name,version:n.template.version,description:n.template.description,assets:n.template.assets,blueprint_contents:n.blueprint_contents})}return this.createTemplate({name:t.name||e.name.replace(/\.[^.]+$/,""),version:t.version||"1.0",description:t.description||"",assets:t.assets||[],blueprint_contents:t.blueprint_contents||{}})}async getDrafts(e){const t=await j.getAllMetadata({includeArchived:!0});this.syncDraftsFromServer();const n=Vo(t,e);return qo(n,n.length,n,t)}async listDrafts(e){return this.getDrafts(e)}async getDraft(e){const t=await j.getDraft(e);if(!t)throw new R(404,`Draft ${e} not found`);return t}async updateMetadata(e,t){return await j.updateMetadata(e,t),N("drafts"),{status:"updated",draft_id:e}}async archiveDraft(e){return await j.updateMetadata(e,{archived_at:new Date().toISOString()}),N("drafts"),{status:"archived",draft_id:e}}async restoreDraft(e){return await j.updateMetadata(e,{archived_at:void 0}),N("drafts"),{status:"restored",draft_id:e}}async deleteDraft(e){return await j.deleteDraft(e),N("drafts"),{status:"deleted",draft_id:e}}async updateAsset(e,t,n){return await j.updateAsset(e,t,n),N("drafts"),{status:"updated",draft_id:e,asset_name:t}}async validateDraft(e){const t=await this.getDraft(e);return yr(t)}async validatePath(e){const t=e.path.trim().replace(/^drafts\//,""),n=await j.getDraft(t);return n?yr(n):{path:e.path,output:`VALIDATION FAILED
- Browser-only mode can validate saved IndexedDB drafts by review ID only.`,errors:"",exit_code:1,success:!1}}generate(e){return new se(async({emit:t,signal:n})=>{for await(const s of ne.generate(e,{signal:n})){if(n.aborted)return;if(s.type==="chunk"&&t("chunk",{content:s.content||""}),s.type==="complete"){const a=s.asset||"",o=a?await j.getDraft(a):null;t("complete",{draft_path:a,draft_id:a,character_name:o?.metadata.character_name,duration_ms:0})}s.type==="error"&&t("error",{error:s.error||"Generation failed"})}})}generateAsset(e){return new se(async({emit:t,signal:n})=>{for await(const s of ne.generateAsset(e)){if(n.aborted)return;s.type==="chunk"&&t("chunk",{content:s.content||""}),s.type==="asset"&&t("complete",{asset_name:e.asset_name,content:s.content||""}),s.type==="error"&&t("error",{error:s.error||"Asset generation failed"})}})}previewBlueprint(e){return new se(async({emit:t,signal:n})=>{for await(const s of ne.previewBlueprint(e)){if(n.aborted)return;s.type==="chunk"&&t("chunk",{content:s.content||""}),s.type==="asset"&&t("complete",{asset_name:e.asset_name,content:s.content||"",system_prompt:s.systemPrompt||"",user_prompt:s.userPrompt||""}),s.type==="error"&&t("error",{error:s.error||"Blueprint preview failed"})}})}async finalizeGeneration(e){const t=crypto.randomUUID(),n=at(e.assets,e.template),s={path:t,metadata:{review_id:t,seed:e.seed,mode:e.mode,model:A.getConfig().model,created:new Date().toISOString(),modified:new Date().toISOString(),favorite:!1,template_name:e.template,character_name:n},assets:e.assets};return await j.saveDraft(s),N("drafts"),{draft_path:t,draft_id:t,character_name:n,duration_ms:0}}generateBatch(e,t){return new se(async({emit:n,signal:s})=>{const a=async(o,c)=>{n("batch_start",{index:c,seed:o});try{let l="";for await(const d of ne.generate({seed:o,mode:t.mode,template:t.template},{signal:s})){if(s.aborted)return;d.type==="complete"&&(l=d.asset||"")}n("batch_complete",{index:c,seed:o,draft_path:l})}catch(l){n("batch_error",{index:c,seed:o,error:l instanceof Error?l.message:"Batch generation failed"})}};if(t.parallel){let o=0;const c=Math.min(Math.max(t.max_concurrent??3,1),e.length||1);await Promise.all(Array.from({length:c},async()=>{for(;!s.aborted;){const l=o;if(o+=1,l>=e.length)return;await a(e[l],l)}}))}else for(let o=0;o<e.length;o+=1){if(s.aborted)return;await a(e[o],o)}s.aborted||n("complete",{status:"done"})})}async getLineage(){const e=await j.getAllMetadata();return Xo(e)}async analyzeSimilarity(e){const t=await this.getDraft(e.draft1_id),n=await this.getDraft(e.draft2_id),s=Jo(t,n);if(!e.include_llm_analysis)return s;try{const a=await ne.analyzeSimilarity(e.draft1_id,e.draft2_id),o=Array.isArray(a.story_opportunities)?a.story_opportunities.map(d=>String(d)).slice(0,4):s.relationship_suggestions,c=Array.isArray(a.scene_suggestions)?a.scene_suggestions.map(d=>String(d)).slice(0,3):s.relationship_suggestions,l=[a.narrative_dynamics,a.relationship_arc].filter(d=>typeof d=="string"&&d.trim().length>0).join(`

`)||(typeof a.raw=="string"?a.raw:"LLM analysis unavailable.");return{...s,relationship_suggestions:c,llm_analysis:{relationship_potential:l,conflict_areas:s.differences.slice(0,4),synergy_areas:s.commonalities.slice(0,4),story_hooks:o}}}catch{return s}}generateOffspring(e){return new se(async({emit:t,signal:n})=>{for await(const s of ne.generateOffspring(e,{signal:n})){if(n.aborted)return;if(s.type==="status"&&t("status",{stage:s.stage,asset:s.asset,progress:s.progress}),s.type==="chunk"&&t("chunk",{content:s.content||""}),s.type==="complete"){const a=s.asset||"",o=a?await j.getDraft(a):null;t("complete",{draft_id:a,character_name:o?.metadata.character_name})}s.type==="error"&&t("error",{error:s.error||"Offspring generation failed"})}})}generateOffspringSeed(e){return new se(async({emit:t,signal:n})=>{for await(const s of ne.generateOffspringSeed(e,{signal:n})){if(n.aborted)return;s.type==="status"&&t("status",{stage:s.stage,asset:s.asset,progress:s.progress}),s.type==="chunk"&&t("chunk",{content:s.content||""}),s.type==="complete"&&t("complete",{content:s.content||""}),s.type==="error"&&t("error",{error:s.error||"Offspring seed generation failed"})}})}async getExportPresets(){return Bo}async exportDraft(e){const t=await this.getDraft(e.draft_id),n=e.preset||"json",s=e.include_metadata!==!1,a=_t(t.metadata.character_name||t.metadata.seed||t.metadata.review_id);if(n==="text"){const o=Object.entries(t.assets).map(([c,l])=>`## ${c}

${wr(l)}`).join(`

`);return Pe(o,`${a}.txt`,"text/plain")}if(n==="combined"){const o=[`# ${t.metadata.character_name||t.metadata.seed}`,s?`## Metadata

${JSON.stringify(t.metadata,null,2)}`:"",...Object.entries(t.assets).map(([c,l])=>`## ${c}

${wr(l)}`)].filter(Boolean);return Pe(o.join(`

`),`${a}.md`,"text/markdown")}return Pe(JSON.stringify({metadata:s?t.metadata:void 0,assets:t.assets},null,2),`${a}.json`,"application/json")}async getBlueprints(){if(_.isEnabled()&&_.hasAccessToken())try{const{blueprints:t=[]}=await _.syncBlueprints("list"),n=Z();let s=n;for(const a of t){if(a.isBuiltin===!0||a.is_builtin===!0||typeof a.path!="string"||typeof a.content!="string")continue;const o=Mo(a.path);Object.prototype.hasOwnProperty.call(n,o)||(s===n&&(s={...n}),s[o]=a.content)}s!==n&&we(s)}catch(t){console.warn("Failed to sync blueprints from server:",t)}const e=[...de().values()];return{core:e.filter(t=>t.category==="core"),system:e.filter(t=>t.category==="system"),templates:{local:e.filter(t=>t.category==="template")},examples:e.filter(t=>t.category==="example")}}async getBlueprint(e){const t=de().get(e);if(!t)throw new R(404,`Blueprint ${e} not found`);return t}async updateBlueprint(e,t){if(Ze(e)!==null&&!hn(e)){const a=Do(e,t),o=Ca(a.name||e,e);return this.createBlueprint(o,t)}const s=Z();return s[e]=t,we(s),N("blueprints"),this.getBlueprint(e)}async deleteBlueprint(e){if(Ze(e)!==null)throw new R(400,`Cannot delete built-in blueprint ${e}`);const t=Z();return delete t[e],we(t),N("blueprints"),{status:"deleted",path:e}}async resetBlueprint(e){const t=Z();delete t[e],we(t),N("blueprints");const n=this.getBlueprint(e);if(!n)throw new R(404,`Blueprint ${e} not found`);return n}async createBlueprint(e,t){if(de().get(e))throw new R(409,`Blueprint ${e} already exists`);const s=Z();return s[e]=t,we(s),N("blueprints"),this.getBlueprint(e)}async duplicateBlueprint(e,t){const n=de().get(e);if(!n)throw new R(404,`Source blueprint ${e} not found`);if(de().get(t))throw new R(409,`Blueprint ${t} already exists`);const a=Z();return a[t]=n.content,we(a),N("blueprints"),this.getBlueprint(t)}hasBlueprintOverride(e){return Oa(e)}getOriginalBlueprintContent(e){return Ze(e)}chat(e){return new se(async({emit:t,signal:n})=>{const s=e.draft_id?await j.getDraft(e.draft_id):null,a=[s?`Current draft metadata: ${JSON.stringify(s.metadata)}`:"",e.context_asset&&s?.assets[e.context_asset]?`Focused asset (${e.context_asset}):
${s.assets[e.context_asset]}`:"",e.screen_context?`Screen context: ${JSON.stringify(e.screen_context)}`:""].filter(Boolean),o=[{role:"system",content:"You are the in-app assistant for Eidolon Simulacra, a browser-only blueprint compiler. Be concise and practical. Use provided draft or screen context when relevant."},...a.length>0?[{role:"system",content:a.join(`

`)}]:[],...e.messages],c=await vr(o);let l="";for await(const d of c){if(n.aborted)return;if(d.content&&(l+=d.content,t("chunk",{content:d.content})),d.done)break}t("complete",{content:l})})}refine(e){return new se(async({emit:t,signal:n})=>{const s=await this.getDraft(e.draft_id),a=s.assets[e.asset];if(!a)throw new R(404,`Asset ${e.asset} not found in draft`);const o=[{role:"system",content:"Rewrite the provided asset according to the user request. Return only the revised asset content with no extra commentary."},{role:"user",content:`Draft seed: ${s.metadata.seed}
Asset: ${e.asset}

Current content:
${a}

Revision request:
${e.message}`}],c=await vr(o);let l="";for await(const d of c){if(n.aborted)return;if(d.content&&(l+=d.content,t("chunk",{content:d.content})),d.done)break}t("complete",{content:l})})}}const G=new Qo;function V(...r){return gs(ys(r))}const Zo=h.createContext(null);function ei({children:r}){const[e,t]=h.useState({ownerId:null,screenContext:{},serializedContext:""}),n=h.useCallback((o,c,l)=>{t(d=>d.ownerId===o&&d.serializedContext===l?d:{ownerId:o,screenContext:c,serializedContext:l})},[]),s=h.useCallback(o=>{t(c=>c.ownerId!==o||c.ownerId===null&&c.serializedContext===""?c:{ownerId:null,screenContext:{},serializedContext:""})},[]),a=h.useMemo(()=>({screenContext:e.screenContext,setScreenContext:n,clearScreenContext:s}),[s,n,e.screenContext]);return i.jsx(Zo.Provider,{value:a,children:r})}function ti({entry:r,topics:e,isOpen:t,onClose:n}){return t?i.jsxs(i.Fragment,{children:[i.jsx("div",{className:"fixed inset-0 z-30 bg-black/40 backdrop-blur-sm",onClick:n}),i.jsxs("aside",{"aria-label":"Contextual help",className:"fixed right-0 top-0 z-40 flex h-dvh w-full max-w-xl flex-col border-l border-border bg-card/95 shadow-2xl backdrop-blur-md transition-transform duration-300 ease-out translate-x-0",children:[i.jsxs("div",{className:"flex items-start justify-between gap-4 border-b border-border/60 p-5",children:[i.jsxs("div",{children:[i.jsx("p",{className:"text-xs font-semibold uppercase tracking-[0.16em] text-primary",children:"Contextual Help"}),i.jsx("h2",{className:"mt-2 text-xl font-semibold text-foreground",children:r.title}),i.jsx("p",{className:"mt-2 text-sm leading-6 text-muted-foreground",children:r.summary})]}),i.jsx("button",{type:"button",onClick:n,title:"Close help panel",className:"rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",children:i.jsx(Re,{className:"h-5 w-5"})})]}),i.jsxs("div",{className:"min-h-0 flex-1 space-y-6 overflow-y-auto p-5",children:[i.jsxs("section",{className:"rounded-2xl border border-border/60 bg-background/40 p-4",children:[i.jsxs("div",{className:"flex items-center gap-2 text-foreground",children:[i.jsx(Hn,{className:"h-4 w-4 text-primary"}),i.jsx("h3",{className:"font-semibold",children:"What to do on this page"})]}),i.jsx("div",{className:"mt-4 space-y-3",children:r.keyActions.map(s=>i.jsxs("div",{className:"flex items-start gap-3 text-sm text-muted-foreground",children:[i.jsx("div",{className:"mt-2 h-1.5 w-1.5 rounded-full bg-primary"}),i.jsx("p",{className:"leading-6",children:s})]},s))})]}),i.jsxs("section",{className:"rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4",children:[i.jsxs("div",{className:"flex items-center gap-2 text-foreground",children:[i.jsx(Kn,{className:"h-4 w-4 text-amber-500"}),i.jsx("h3",{className:"font-semibold",children:"Common mistakes to avoid"})]}),i.jsx("div",{className:"mt-4 space-y-3",children:r.pitfalls.map(s=>i.jsxs("div",{className:"flex items-start gap-3 text-sm text-muted-foreground",children:[i.jsx("div",{className:"mt-2 h-1.5 w-1.5 rounded-full bg-amber-500"}),i.jsx("p",{className:"leading-6",children:s})]},s))})]}),i.jsxs("section",{className:"rounded-2xl border border-border/60 bg-background/40 p-4",children:[i.jsx("h3",{className:"font-semibold text-foreground",children:"Useful next steps"}),i.jsxs("div",{className:"mt-4 flex flex-wrap gap-3",children:[i.jsxs(B,{to:"/help",onClick:n,className:"inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:["Open Help Center",i.jsx(qt,{className:"h-4 w-4"})]}),r.actions.map(s=>i.jsxs(B,{to:s.to,onClick:n,className:"inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:[s.label,i.jsx(qt,{className:"h-4 w-4"})]},`${r.id}-${s.to}`))]})]}),e.length>0&&i.jsxs("section",{className:"space-y-4",children:[i.jsx("h3",{className:"text-lg font-semibold text-foreground",children:"Related help topics"}),i.jsx("div",{className:"space-y-3",children:e.map(s=>i.jsxs("article",{className:"rounded-2xl border border-border/60 bg-background/40 p-4",children:[i.jsx("div",{className:"flex items-center justify-between gap-3",children:i.jsxs("div",{children:[i.jsx("p",{className:"text-xs font-semibold uppercase tracking-[0.14em] text-primary",children:s.category}),i.jsx("h4",{className:"mt-1 font-semibold text-foreground",children:s.title})]})}),i.jsx("p",{className:"mt-2 text-sm leading-6 text-muted-foreground",children:s.summary}),i.jsx("div",{className:"mt-3 space-y-2",children:s.bullets.slice(0,2).map(a=>i.jsxs("div",{className:"flex items-start gap-3 text-sm text-muted-foreground",children:[i.jsx("div",{className:"mt-2 h-1.5 w-1.5 rounded-full bg-primary"}),i.jsx("p",{className:"leading-6",children:a})]},a))})]},s.id))})]})]})]})]}):null}const Wt="eidolon.web.activeTour";function ri(){try{const r=sessionStorage.getItem(Wt);if(!r)return null;const e=JSON.parse(r),t=tt(e.activeTourId);return!t||e.activeStepIndex<0||e.activeStepIndex>=t.steps.length?null:e}catch{return null}}function _r(){try{sessionStorage.removeItem(Wt)}catch{}}const Un=h.createContext(null);function ni({children:r}){const e=bs(),t=$e(),n=ri(),[s,a]=h.useState(n?.activeTourId??null),[o,c]=h.useState(n?.activeStepIndex??0),[l,d]=h.useState(()=>A.getHelpState()),u=()=>{d(A.getHelpState())};h.useEffect(()=>{if(!s){_r();return}try{sessionStorage.setItem(Wt,JSON.stringify({activeTourId:s,activeStepIndex:o}))}catch{}},[o,s]),h.useEffect(()=>{const k=()=>{u()};return window.addEventListener(st,k),()=>{window.removeEventListener(st,k)}},[]);const p=async k=>{if(k.to!=="/drafts/"||(k.matchMode??"exact")!=="prefix")return k.to;if(t.pathname.startsWith("/drafts/"))return t.pathname;try{const M=(await G.getDrafts()).drafts[0]?.review_id;return M?`/drafts/${encodeURIComponent(M)}`:"/drafts"}catch{return"/drafts"}},m=async(k,F)=>{const M=tt(k),g=M?.steps[F];!M||!g||(a(k),c(F),Tt(t.pathname,g)||e(await p(g)))},b=k=>{m(k,0)},f=k=>{const M={completed_tours:l.completed_tours.filter(g=>g!==k)};k===Et&&(M.first_run_completed=!1,M.completed_guides=l.completed_guides.filter(g=>g!==Xt)),A.updateHelpState(M),N("config"),u(),m(k,0)},y=()=>{_r(),a(null),c(0)},E=()=>{s&&m(s,o)},O=()=>{!s||o===0||m(s,o-1)},H=()=>{if(!s)return;const F={completed_tours:Array.from(new Set([...l.completed_tours,s]))};s===Et&&(F.first_run_completed=!0,F.completed_guides=Array.from(new Set([...l.completed_guides,Xt]))),A.updateHelpState(F),N("config"),u(),y()},U=()=>{if(!s)return;const k=tt(s);if(!k){y();return}if(o>=k.steps.length-1){H();return}m(s,o+1)},K=k=>{const F=Array.from(new Set([...l.dismissed_tips,k]));A.updateHelpState({dismissed_tips:F}),N("config"),u()},ae=h.useMemo(()=>({tours:jr,activeTourId:s,activeStepIndex:o,helpState:l,startTour:b,restartTour:f,closeTour:y,goToCurrentStep:E,goToNextStep:U,goToPreviousStep:O,finishTour:H,isTourCompleted:k=>l.completed_tours.includes(k),dismissTip:K}),[o,s,l]);return i.jsx(Un.Provider,{value:ae,children:r})}function si(){const r=h.useContext(Un);if(!r)throw new Error("useGuidedTour must be used within GuidedTourProvider");return r}const ai='[data-guided-tour-active="true"]';function oi(){const r=$e(),{activeTourId:e,activeStepIndex:t,closeTour:n,goToCurrentStep:s,goToNextStep:a,goToPreviousStep:o}=si(),[c,l]=h.useState(!1),d=e?tt(e):null,u=d?.steps[t]??null;if(h.useEffect(()=>{if(document.querySelector(ai)?.removeAttribute("data-guided-tour-active"),!u){l(!1);return}if(!Tt(r.pathname,u)||!u.targetId){l(!1);return}const y=document.querySelector(`[data-tour-anchor="${u.targetId}"]`);if(!y){l(!1);return}return y.setAttribute("data-guided-tour-active","true"),y.scrollIntoView({behavior:"smooth",block:"center",inline:"nearest"}),l(!0),()=>{y.removeAttribute("data-guided-tour-active")}},[u,r.pathname]),!d||!u)return null;const p=Tt(r.pathname,u),m=t===d.steps.length-1;return i.jsxs(i.Fragment,{children:[i.jsx("div",{className:"fixed inset-0 z-[70] bg-black/55",onClick:n}),i.jsxs("section",{className:"fixed inset-x-3 bottom-3 z-[80] max-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-2xl shadow-black/40 backdrop-blur-md sm:inset-x-auto sm:right-4 sm:w-[28rem]",children:[i.jsxs("div",{className:"flex items-start justify-between gap-4 border-b border-border/50 px-5 py-4",children:[i.jsxs("div",{children:[i.jsx("p",{className:"text-xs font-semibold uppercase tracking-[0.16em] text-primary",children:"Guided Tour"}),i.jsx("h2",{className:"mt-1 text-lg font-semibold text-foreground",children:d.title}),i.jsxs("p",{className:"mt-1 text-sm text-muted-foreground",children:["Step ",t+1," of ",d.steps.length]})]}),i.jsx("button",{type:"button",onClick:n,className:"rounded-lg border border-border/60 bg-background/50 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary","aria-label":"Close guided tour",children:i.jsx(Re,{className:"h-4 w-4"})})]}),i.jsxs("div",{className:"max-h-[calc(100dvh-12rem)] overflow-y-auto px-5 py-4",children:[i.jsxs("div",{className:"rounded-2xl border border-primary/20 bg-primary/5 p-4",children:[i.jsxs("div",{className:"flex items-center gap-2 text-sm font-medium text-primary",children:[i.jsx(Gn,{className:"h-4 w-4"}),u.routeLabel]}),i.jsx("h3",{className:"mt-2 text-xl font-semibold text-foreground",children:u.title}),i.jsx("p",{className:"mt-2 text-sm leading-6 text-muted-foreground",children:u.description})]}),i.jsxs("div",{className:"mt-4 rounded-2xl border border-border/50 bg-background/40 p-4",children:[i.jsxs("div",{className:"flex items-center gap-2 text-sm font-medium text-foreground",children:[i.jsx(Wn,{className:"h-4 w-4 text-primary"}),p?"You are on the expected page.":`This step expects ${u.routeLabel}.`]}),!p&&i.jsxs("button",{type:"button",onClick:s,className:"mt-3 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:["Return to this step",i.jsx(De,{className:"h-4 w-4"})]})]}),u.targetLabel&&p&&i.jsxs("div",{className:"mt-4 rounded-2xl border border-border/50 bg-background/40 p-4",children:[i.jsxs("div",{className:"flex items-center gap-2 text-sm font-medium text-foreground",children:[i.jsx(zn,{className:"h-4 w-4 text-primary"}),c?`Highlighted target: ${u.targetLabel}`:`Looking for ${u.targetLabel}`]}),i.jsx("p",{className:"mt-2 text-sm leading-6 text-muted-foreground",children:c?"The active control or section has been outlined on the page so you can orient yourself without hunting for it.":"If the highlighted target is not visible yet, stay on this page and give the layout a moment to settle."})]}),i.jsx("div",{className:"mt-4 space-y-3",children:u.bullets.map(b=>i.jsxs("div",{className:"flex items-start gap-3 rounded-xl border border-border/50 bg-background/40 p-4 text-sm text-muted-foreground",children:[i.jsx(qn,{className:"mt-0.5 h-4 w-4 shrink-0 text-primary"}),i.jsx("p",{className:"leading-6",children:b})]},b))})]}),i.jsxs("div",{className:"flex items-center justify-between gap-3 border-t border-border/50 px-5 py-4",children:[i.jsxs("button",{type:"button",onClick:o,disabled:t===0,className:"inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50",children:[i.jsx(Vn,{className:"h-4 w-4"}),"Previous"]}),i.jsxs("div",{className:"flex items-center gap-3",children:[i.jsx("button",{type:"button",onClick:n,className:"inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:"Leave tour"}),i.jsxs("button",{type:"button",onClick:a,className:"inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",children:[m?"Finish tour":"Next step",i.jsx(De,{className:"h-4 w-4"})]})]})]})]})]})}function ii({drafts:r,isLoading:e}){const n=$e().pathname.match(/^\/drafts\/([^/]+)$/),s=n?decodeURIComponent(n[1]):null,[a,o]=h.useState(""),[c,l]=h.useState(!1),[d,u]=h.useState(!1),[p,m]=h.useState(""),[b,f]=h.useState(""),[y,E]=h.useState("modified"),[O,H]=h.useState("desc"),{genres:U,modes:K}=h.useMemo(()=>{const g=new Set,S=new Set;return r.forEach(I=>{I.genre&&g.add(I.genre),I.mode&&S.add(I.mode)}),{genres:Array.from(g).sort(),modes:Array.from(S).sort()}},[r]),ae=h.useMemo(()=>{let g=[...r];if(a){const S=a.toLowerCase();g=g.filter(I=>I.character_name?.toLowerCase().includes(S)||I.seed.toLowerCase().includes(S)||I.template_name?.toLowerCase().includes(S)||I.notes?.toLowerCase().includes(S))}return d&&(g=g.filter(S=>S.favorite)),p&&(g=g.filter(S=>S.mode===p)),b&&(g=g.filter(S=>S.genre===b)),g.sort((S,I)=>{let oe=0;switch(y){case"created":{const Y=S.created?new Date(S.created).getTime():0,ie=I.created?new Date(I.created).getTime():0;oe=Y-ie;break}case"modified":{const Y=S.modified?new Date(S.modified).getTime():S.created?new Date(S.created).getTime():0,ie=I.modified?new Date(I.modified).getTime():I.created?new Date(I.created).getTime():0;oe=Y-ie;break}case"name":{const Y=S.character_name||S.seed,ie=I.character_name||I.seed;oe=Y.localeCompare(ie);break}}return O==="asc"?oe:-oe}),g},[r,a,d,p,b,y,O]),k=a||d||p||b,F=()=>{o(""),u(!1),m(""),f("")},M=h.useMemo(()=>{const g=r.length,S=r.filter(I=>I.favorite).length;return{total:g,favorites:S}},[r]);return i.jsxs("div",{className:"flex h-full min-h-0 min-w-0 flex-col overflow-hidden",children:[i.jsxs("div",{className:"border-b border-border/60 px-3 py-3",children:[i.jsx("h3",{className:"text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:"Draft Library"}),i.jsxs("div",{className:"mt-2 flex items-center gap-3 text-xs text-muted-foreground",children:[i.jsxs("span",{children:[M.total," drafts"]}),i.jsxs("span",{className:"flex items-center gap-1",children:[i.jsx(Yn,{className:"h-3 w-3"}),M.favorites]})]})]}),i.jsx("div",{className:"border-b border-border/40 px-3 py-2",children:i.jsxs("div",{className:"relative",children:[i.jsx(Jn,{className:"absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"}),i.jsx("input",{type:"text",placeholder:"Search drafts...",value:a,onChange:g=>o(g.target.value),className:"w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-8 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"}),a&&i.jsx("button",{type:"button",onClick:()=>o(""),className:"absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",children:i.jsx(Re,{className:"h-3.5 w-3.5"})})]})}),i.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-3 py-2",children:[i.jsxs("button",{type:"button",onClick:()=>l(!c),className:V("flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",c||k?"bg-primary/10 text-primary":"text-muted-foreground hover:text-foreground hover:bg-accent/50"),children:[i.jsx(Xn,{className:"h-3.5 w-3.5"}),"Filters",k&&i.jsx("span",{className:"rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground",children:[a&&"search",d&&"fav",p&&"mode",b&&"genre"].filter(Boolean).length})]}),i.jsxs("div",{className:"flex max-w-full items-center gap-1",children:[i.jsxs("select",{value:y,onChange:g=>E(g.target.value),className:"max-w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none",children:[i.jsx("option",{value:"modified",children:"Modified"}),i.jsx("option",{value:"created",children:"Created"}),i.jsx("option",{value:"name",children:"Name"})]}),i.jsx("button",{type:"button",onClick:()=>H(O==="asc"?"desc":"asc"),className:"rounded-md border border-input p-1 hover:bg-accent/50",title:O==="asc"?"Ascending":"Descending",children:O==="asc"?i.jsx(Qn,{className:"h-3.5 w-3.5 text-muted-foreground"}):i.jsx(Zn,{className:"h-3.5 w-3.5 text-muted-foreground"})})]})]}),c&&i.jsxs("div",{className:"border-b border-border/40 bg-muted/30 px-3 py-2 space-y-2",children:[i.jsxs("label",{className:"flex items-center gap-2 text-xs",children:[i.jsx("input",{type:"checkbox",checked:d,onChange:g=>u(g.target.checked),className:"rounded border-input"}),i.jsx(Vt,{className:"h-3.5 w-3.5 text-yellow-500"}),"Favorites only"]}),K.length>0&&i.jsxs("div",{className:"space-y-1",children:[i.jsx("label",{className:"text-xs text-muted-foreground",children:"Mode"}),i.jsxs("select",{value:p,onChange:g=>m(g.target.value),className:"w-full rounded-md border border-input bg-background px-2 py-1 text-xs",children:[i.jsx("option",{value:"",children:"All modes"}),K.map(g=>i.jsx("option",{value:g,children:g},g))]})]}),U.length>0&&i.jsxs("div",{className:"space-y-1",children:[i.jsx("label",{className:"text-xs text-muted-foreground",children:"Genre"}),i.jsxs("select",{value:b,onChange:g=>f(g.target.value),className:"w-full rounded-md border border-input bg-background px-2 py-1 text-xs",children:[i.jsx("option",{value:"",children:"All genres"}),U.map(g=>i.jsx("option",{value:g,children:g},g))]})]}),k&&i.jsx("button",{type:"button",onClick:F,className:"w-full rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground",children:"Clear all filters"})]}),i.jsx("div",{className:"min-h-0 flex-1 overflow-y-auto overflow-x-hidden",children:e?i.jsx("div",{className:"p-4 text-center text-xs text-muted-foreground",children:"Loading drafts..."}):ae.length===0?i.jsxs("div",{className:"p-4 text-center",children:[i.jsx(Or,{className:"mx-auto h-8 w-8 text-muted-foreground/50"}),i.jsx("p",{className:"mt-2 text-xs text-muted-foreground",children:k?"No drafts match filters":"No drafts yet"}),k&&i.jsx("button",{type:"button",onClick:F,className:"mt-2 text-xs text-primary hover:underline",children:"Clear filters"})]}):i.jsx("div",{className:"space-y-1 p-2",children:ae.map(g=>{const S=s===g.review_id;return i.jsx(B,{to:`/drafts/${encodeURIComponent(g.review_id)}`,className:V("group block rounded-lg border p-2 transition-all",S?"border-primary bg-primary/10":"border-transparent hover:border-border/60 hover:bg-accent/40"),children:i.jsxs("div",{className:"flex min-w-0 items-start justify-between gap-2",children:[i.jsxs("div",{className:"min-w-0 flex-1",children:[i.jsxs("div",{className:"flex items-center gap-1.5",children:[i.jsx("span",{className:"truncate text-sm font-medium",children:g.character_name||g.seed}),g.favorite&&i.jsx(Vt,{className:"h-3 w-3 shrink-0 fill-yellow-500 text-yellow-500"})]}),i.jsxs("div",{className:"mt-0.5 flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground",children:[g.mode&&i.jsxs("span",{className:"inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5",children:[i.jsx(kt,{className:"h-2.5 w-2.5"}),g.mode]}),g.template_name&&i.jsx("span",{className:"truncate",children:g.template_name})]}),(g.created||g.modified)&&i.jsxs("div",{className:"mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/70",children:[i.jsx(es,{className:"h-2.5 w-2.5"}),new Date(g.modified||g.created||"").toLocaleDateString()]})]}),g.tags&&g.tags.length>0&&i.jsxs("div",{className:"flex max-w-[8rem] shrink-0 flex-wrap justify-end gap-0.5 overflow-hidden",children:[g.tags.slice(0,2).map(I=>i.jsx("span",{className:"rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground",children:I},I)),g.tags.length>2&&i.jsxs("span",{className:"text-[9px] text-muted-foreground",children:["+",g.tags.length-2]})]})]})},g.review_id)})})})]})}const ci=[{path:"/",label:"Home",icon:ss},{path:"/generate",label:"Generate",icon:St},{path:"/drafts",label:"Library",icon:as},{path:"/templates",label:"Templates",icon:Or},{path:"/blueprints",label:"Blueprints",icon:os},{path:"/themes",label:"Themes",icon:is},{path:"/settings",label:"Settings",icon:cs}],xr="kofi-overlay-widget-script",li="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js",kr="kofi-overlay-position-style";function di(){if(document.getElementById(kr))return;const e=document.createElement("style");e.id=kr,e.textContent=`
    :root {
      --kofi-overlay-top: 16px;
      --kofi-overlay-popup-top: 92px;
      --kofi-overlay-right: 16px;
    }

    .floatingchat-container-wrap,
    .floatingchat-container-wrap-mobi {
      top: var(--kofi-overlay-top) !important;
      right: var(--kofi-overlay-right) !important;
      bottom: auto !important;
      left: auto !important;
    }

    .floating-chat-kofi-popup-iframe,
    .floating-chat-kofi-popup-iframe-mobi {
      top: var(--kofi-overlay-popup-top) !important;
      right: var(--kofi-overlay-right) !important;
      bottom: auto !important;
      left: auto !important;
      max-width: calc(100vw - 32px) !important;
    }

    @media (max-width: 1023px) {
      :root {
        --kofi-overlay-top: 80px;
        --kofi-overlay-popup-top: 156px;
        --kofi-overlay-right: 12px;
      }
    }
  `,document.head.appendChild(e)}function Sr(){const r=window;r.__eidolonKofiOverlayInitialized||!r.kofiWidgetOverlay||(di(),r.kofiWidgetOverlay.draw("maeveoffae",{type:"floating-chat","floating-chat.donateButton.text":"Support me","floating-chat.donateButton.background-color":"#ff38b8","floating-chat.donateButton.text-color":"#fff"}),r.__eidolonKofiOverlayInitialized=!0)}function ui(r,e){return e==="/"?r==="/":r===e||r.startsWith(`${e}/`)}const Er=[{path:"/lineage",label:"Lineage",icon:Ir},{path:"/offspring",label:"Offspring",icon:ts}],Tr=[{path:"/worlds",label:"Worlds",icon:Pr},{path:"/timelines",label:"Timeline",icon:Ir},{path:"/events",label:"Events",icon:rs}];function pi({path:r,label:e,icon:t,isActive:n,onClick:s}){return i.jsxs(B,{to:r,onClick:s,className:V("group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",n?"bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20":"text-muted-foreground hover:bg-accent/50 hover:text-foreground"),children:[i.jsx(t,{className:V("h-5 w-5 transition-transform duration-200",n?"scale-110":"group-hover:scale-110")}),i.jsx("span",{children:e}),n&&i.jsx("div",{className:"absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 -z-10"})]})}function Ar({label:r,icon:e,items:t,isActive:n,isExpanded:s,onToggle:a,onNavigate:o,draftsCount:c,seedsCount:l}){const d=$e(),u=s?ps:De;return i.jsxs("div",{className:"space-y-1",children:[i.jsxs("button",{type:"button",onClick:a,className:V("group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",n?"bg-accent/50 text-foreground":"text-muted-foreground hover:bg-accent/50 hover:text-foreground"),children:[i.jsxs("div",{className:"flex items-center gap-3",children:[i.jsx(e,{className:"h-5 w-5 transition-transform duration-200 group-hover:scale-110"}),i.jsx("span",{children:r}),(c>0||l>0)&&i.jsxs("div",{className:"flex items-center gap-1.5",children:[c>0&&i.jsxs("span",{className:"rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary",children:[c," drafts"]}),l>0&&i.jsxs("span",{className:"rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400",children:[l," seeds"]})]})]}),i.jsx(u,{className:"h-4 w-4 transition-transform duration-200"})]}),s&&i.jsx("div",{className:"ml-4 space-y-1 border-l border-border pl-2",children:t.map(p=>{const m=d.pathname===p.path;return i.jsxs(B,{to:p.path,onClick:o,className:V("group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",m?"bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/20":"text-muted-foreground hover:bg-accent/50 hover:text-foreground"),children:[i.jsx(p.icon,{className:"h-4 w-4"}),i.jsx("span",{children:p.label})]},p.path)})})]})}function mi({children:r}){const e=$e(),t=Nr(),n=e.pathname.match(/^\/drafts\/([^/]+)$/),s=n?decodeURIComponent(n[1]):null,[a,o]=h.useState(!1),[c,l]=h.useState(!1),[d,u]=h.useState(!1),[p,m]=h.useState(null),[b,f]=h.useState(!1),[y,E]=h.useState(!1),[O,H]=h.useState("dynamic"),U=h.useMemo(()=>Ps(e.pathname),[e.pathname]),K=h.useMemo(()=>Cs.filter(w=>U?.relatedTopicIds.includes(w.id)),[U]),ae=le({queryKey:["drafts"],queryFn:()=>G.getDrafts()}),{data:k}=ae,{data:F}=le({queryKey:["draft",s],queryFn:()=>G.getDraft(s||""),enabled:!!s}),{data:M}=le({queryKey:["templates"],queryFn:()=>G.getTemplates(),enabled:e.pathname.startsWith("/templates")}),{data:g}=le({queryKey:["themes"],queryFn:()=>G.getThemes(),enabled:e.pathname.startsWith("/themes")}),{data:S}=le({queryKey:["blueprints"],queryFn:()=>G.getBlueprints(),enabled:e.pathname.startsWith("/blueprints")}),[I,oe]=h.useState(()=>ee().length),Y=k?.drafts?.length??0;h.useEffect(()=>{const w=()=>{t.invalidateQueries({queryKey:["drafts"]})};return window.addEventListener(Rt,w),()=>{window.removeEventListener(Rt,w)}},[t]),h.useEffect(()=>{const w=document.getElementById(xr);if(window.kofiWidgetOverlay){Sr();return}const x=w??document.createElement("script");x.id=xr,x.src=li,x.async=!0;const D=()=>{Sr()};return x.addEventListener("load",D),w||document.head.appendChild(x),()=>{x.removeEventListener("load",D)}},[]);const ie=h.useMemo(()=>{if(e.pathname.startsWith("/drafts")){const x=[{id:"drafts",title:"Library Tray",emptyLabel:"No drafts available yet.",items:(k?.drafts||[]).slice(0,16).map(D=>({id:D.review_id,label:D.character_name||D.seed,description:`${D.template_name||"Default"} • ${D.mode}`,to:`/drafts/${encodeURIComponent(D.review_id)}`,badge:s&&s===D.review_id?"Open":D.favorite?"Fav":void 0}))}];if(s){const D=Object.keys(F?.assets||{}).map(zt=>({id:zt,label:zt.replace(/_/g," "),description:"Asset in current draft"}));x.push({id:"review-assets",title:"Current Draft Assets",emptyLabel:"No assets loaded for this draft.",items:D})}return x}return e.pathname.startsWith("/templates")?[{id:"templates",title:"Template Tray",emptyLabel:"No templates available.",items:(M||[]).slice(0,16).map(x=>({id:x.name,label:x.name,description:x.description||"Template definition",badge:x.is_default?"Default":void 0}))}]:e.pathname.startsWith("/themes")?[{id:"themes",title:"Theme Tray",emptyLabel:"No theme presets available.",items:(g||[]).slice(0,16).map(x=>({id:x.name,label:x.display_name,description:x.description||x.name,badge:x.is_builtin?"Built-in":"Custom"}))}]:e.pathname.startsWith("/blueprints")?[{id:"blueprints",title:"Blueprint Tray",emptyLabel:"No blueprints found.",items:[...S?.core||[],...S?.system||[],...S?.templates?.local||[],...S?.examples||[]].slice(0,18).map(D=>({id:D.path,label:D.name,description:D.path}))}]:e.pathname.startsWith("/generate")?[{id:"generate",title:"Generate Tray",emptyLabel:"No generation actions available.",items:[{id:"gen-drafts",label:"Library",description:`${Y} drafts available`,to:"/drafts"},{id:"gen-seeds",label:"Favorite seeds",description:`${I} saved`,to:"/seed-generator"},{id:"gen-templates",label:"Template manager",description:"Switch template packs",to:"/templates"}]}]:[{id:"general",title:"Shortcuts",emptyLabel:"No shortcuts available.",items:[{id:"nav-seeds",label:"Seed Generator",to:"/seed-generator"},{id:"nav-validation",label:"Validation",to:"/validation"},{id:"nav-batch",label:"Batch",to:"/batch"},{id:"nav-compare",label:"Compare",to:"/similarity"},{id:"nav-blueprints",label:"Blueprints",to:"/blueprints"},{id:"nav-themes",label:"Theme Studio",to:"/themes"}]}]},[e.pathname,k?.drafts,Y,s,F?.assets,M,g,S,I]),$n=h.useMemo(()=>Ns.filter(w=>w.status!=="implemented").flatMap(w=>w.items.slice(0,3).map((x,D)=>({id:`${w.id}-${D}`,title:x.length>60?x.slice(0,60)+"...":x,category:w.title,status:w.status}))).slice(0,12),[]),ft=Er.map(w=>w.path).includes(e.pathname),gt=Tr.map(w=>w.path).includes(e.pathname);h.useEffect(()=>{ft&&!b&&f(!0)},[ft,b]),h.useEffect(()=>{gt&&!y&&E(!0)},[gt,y]);const He=h.useCallback(async()=>{if(_.isEnabled()){if(!_.hasAccessToken()){m({connected:!0,authenticated:!1});return}try{const w=await _.checkStatus();m(w),w.authenticated&&w.connected&&(async()=>(await Ao(),await G.syncConfigFromServer()))()}catch{m({connected:!1,authenticated:!1})}}else m({connected:!1,authenticated:!1})},[]);return h.useEffect(()=>{He()},[He]),h.useEffect(()=>{const w=()=>{He()};return window.addEventListener(It,w),()=>window.removeEventListener(It,w)},[He]),h.useEffect(()=>{const w=()=>{N("config")};return window.addEventListener(st,w),()=>window.removeEventListener(st,w)},[]),h.useEffect(()=>{const w=()=>{oe(ee().length)};return window.addEventListener(Pt,w),window.addEventListener("storage",w),()=>{window.removeEventListener(Pt,w),window.removeEventListener("storage",w)}},[]),h.useEffect(()=>{l(!1),u(!1)},[e.pathname]),i.jsx(ei,{children:i.jsx(ni,{children:i.jsxs("div",{className:"app-shell flex min-h-dvh bg-background lg:h-screen",children:[a&&i.jsx("div",{className:"fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden",onClick:()=>o(!1)}),c&&i.jsx("div",{className:"fixed inset-0 z-30 bg-black/45 backdrop-blur-sm",onClick:()=>l(!1)}),i.jsx("aside",{className:V("fixed inset-y-0 left-0 z-50 w-[min(20rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] bg-card/80 backdrop-blur-md border-r border-border transition-transform duration-300 ease-out lg:static lg:w-72 lg:max-w-none lg:translate-x-0","app-sidebar",a?"translate-x-0":"-translate-x-full"),children:i.jsxs("div",{className:"flex h-dvh flex-col lg:h-full",children:[i.jsxs("div",{className:"flex h-16 items-center justify-between border-b border-border/50 px-4",children:[i.jsxs(B,{to:"/",className:"flex items-center gap-2",onClick:()=>o(!1),children:[i.jsx("div",{className:"p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20",children:i.jsx(St,{className:"h-5 w-5 text-white"})}),i.jsxs("div",{className:"flex flex-col",children:[i.jsx("span",{className:"text-lg font-semibold tracking-tight text-foreground",style:{fontFamily:'"Space Grotesk", sans-serif'},children:"Eidolon"}),i.jsxs("span",{className:"text-[11px] uppercase tracking-[0.18em] text-muted-foreground",style:{fontFamily:'"IBM Plex Mono", monospace'},children:["Simulacra v","3.3.2"]})]})]}),i.jsx("button",{type:"button","aria-label":"Close sidebar",className:"lg:hidden p-2 rounded-lg hover:bg-accent transition-colors",onClick:()=>o(!1),children:i.jsx(Re,{className:"h-5 w-5"})})]}),i.jsxs("nav",{className:"flex-1 overflow-y-auto p-4 space-y-1",children:[i.jsx(Ar,{label:"Characters",icon:ns,items:Er,isActive:ft,isExpanded:b,onToggle:()=>f(!b),onNavigate:()=>o(!1),draftsCount:Y,seedsCount:I}),i.jsx(Ar,{label:"Worlds",icon:Pr,items:Tr,isActive:gt,isExpanded:y,onToggle:()=>E(!y),onNavigate:()=>o(!1),draftsCount:0,seedsCount:0}),ci.map(w=>{const x=ui(e.pathname,w.path);return i.jsx(pi,{path:w.path,label:w.label,icon:w.icon,isActive:x,onClick:()=>o(!1)},w.path)})]}),p&&!p.authenticated&&_.isEnabled()&&i.jsx("div",{className:"px-4 py-3 border-t border-border/50",children:i.jsxs(B,{to:"/auth",onClick:()=>o(!1),className:"flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 px-4 py-3 text-sm font-medium text-foreground transition-all hover:from-primary/20 hover:to-accent/20 hover:border-primary/40",children:[i.jsx(ls,{className:"h-5 w-5 text-primary"}),i.jsxs("div",{className:"flex flex-col",children:[i.jsx("span",{className:"font-semibold",children:"Sign In"}),i.jsx("span",{className:"text-xs text-muted-foreground",children:"Sync your data"})]})]})}),p?.authenticated&&p.user&&i.jsx("div",{className:"px-4 py-3 border-t border-border/50",children:i.jsxs("div",{className:"flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3",children:[i.jsx("div",{className:"flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20",children:i.jsx(ds,{className:"h-4 w-4 text-green-600 dark:text-green-400"})}),i.jsxs("div",{className:"flex flex-col min-w-0",children:[i.jsx("span",{className:"text-sm font-medium truncate",children:p.user.displayName}),i.jsx("span",{className:"text-xs text-muted-foreground truncate",children:p.user.email})]})]})}),i.jsx("div",{className:"border-t border-border/50 p-4",children:i.jsxs("div",{className:"grid grid-cols-3 gap-2",children:[i.jsx(B,{to:"/settings",onClick:()=>o(!1),className:"rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary",children:"Settings"}),i.jsx(B,{to:"/help",onClick:()=>o(!1),className:"rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary",children:"Help"}),i.jsx(B,{to:"/about",onClick:()=>o(!1),className:"rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary",children:"About"})]})})]})}),i.jsxs("main",{className:"min-w-0 flex-1 overflow-auto",children:[i.jsxs("header",{className:"app-frame-panel sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/50 px-4 lg:hidden",children:[i.jsx("button",{type:"button","aria-label":"Open menu",onClick:()=>o(!0),className:"p-2 rounded-lg hover:bg-accent transition-colors",children:i.jsx(us,{className:"h-6 w-6"})}),i.jsx("span",{className:"min-w-0 truncate text-base font-semibold tracking-tight text-foreground sm:text-lg",style:{fontFamily:'"Space Grotesk", sans-serif'},children:"Eidolon Simulacra"}),U&&i.jsxs("button",{type:"button",onClick:()=>u(!0),className:"ml-auto inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:[i.jsx(Yt,{className:"h-4 w-4"}),"Help"]})]}),i.jsx("div",{className:"mx-auto max-w-[1360px] p-5 lg:p-6",children:r})]}),U&&i.jsx(ti,{entry:U,topics:K,isOpen:d,onClose:()=>u(!1)}),i.jsxs("button",{type:"button",onClick:()=>l(!0),className:"fixed bottom-24 right-4 z-20 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/95 px-3 py-3 text-sm font-medium text-foreground shadow-xl shadow-black/20 backdrop-blur-md transition-colors hover:border-primary/40 hover:text-primary sm:px-4",children:[i.jsx(kt,{className:"h-4 w-4"}),i.jsx("span",{className:"hidden sm:inline",children:"Workspace"})]}),c&&i.jsxs("aside",{"aria-label":"Utility panel",className:"fixed right-0 top-0 z-40 flex h-dvh w-full max-w-md flex-col border-l border-border/60 bg-card/95 shadow-2xl backdrop-blur-md transition-transform duration-300 ease-out",children:[i.jsxs("div",{className:"sticky top-0 z-10 border-b border-border/60 bg-card/90 backdrop-blur",children:[i.jsxs("div",{className:"flex items-center justify-between border-b border-border/40 px-4 py-3",children:[i.jsxs("div",{children:[i.jsx("p",{className:"text-[11px] font-semibold uppercase tracking-[0.16em] text-primary",children:"Utility Panel"}),i.jsx("p",{className:"mt-1 text-sm text-muted-foreground",children:"Shortcuts, context, and current work."})]}),i.jsx("button",{type:"button","aria-label":"Close panel",onClick:()=>l(!1),className:"rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",children:i.jsx(Re,{className:"h-5 w-5"})})]}),U&&i.jsx("div",{className:"border-b border-border/40 px-4 py-3",children:i.jsxs("button",{type:"button",onClick:()=>{l(!1),u(!0)},className:"flex w-full items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:text-primary",children:[i.jsxs("div",{className:"min-w-0",children:[i.jsx("p",{className:"text-[11px] font-semibold uppercase tracking-[0.16em] text-primary",children:"Page Help"}),i.jsx("p",{className:"mt-1 truncate text-sm font-medium text-foreground",children:U.title})]}),i.jsx(Yt,{className:"h-4 w-4 shrink-0"})]})}),i.jsxs("div",{className:"flex border-b border-border/40",children:[i.jsxs("button",{type:"button",onClick:()=>H("dynamic"),className:V("flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors",O==="dynamic"?"border-b-2 border-primary text-primary":"text-muted-foreground hover:text-foreground"),children:[i.jsx(kt,{className:"h-3.5 w-3.5"}),"Dynamic"]}),i.jsxs("button",{type:"button",onClick:()=>H("whats-new"),className:V("flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors",O==="whats-new"?"border-b-2 border-primary text-primary":"text-muted-foreground hover:text-foreground"),children:[i.jsx(St,{className:"h-3.5 w-3.5"}),"New"]})]})]}),i.jsx("div",{className:"flex-1 overflow-y-auto p-4",children:O==="dynamic"?e.pathname.startsWith("/drafts")?i.jsx(ii,{drafts:k?.drafts||[],isLoading:ae.isLoading}):i.jsxs("div",{className:"space-y-3",children:[i.jsxs("div",{className:"px-1",children:[i.jsx("h3",{className:"text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:"Upcoming Features"}),i.jsx("p",{className:"mt-1 text-xs text-muted-foreground",children:"Planned improvements and new capabilities."})]}),$n.map(w=>i.jsxs("div",{className:"rounded-lg border border-border/70 bg-background/50 p-3",children:[i.jsx("div",{className:"flex items-start justify-between gap-2",children:i.jsx("span",{className:V("rounded-full px-2 py-0.5 text-[10px] font-semibold",w.status==="planned"?"bg-blue-500/15 text-blue-600 dark:text-blue-400":"bg-amber-500/15 text-amber-600 dark:text-amber-400"),children:w.status==="planned"?"Planned":"In Progress"})}),i.jsx("p",{className:"mt-2 text-sm text-foreground leading-snug",children:w.title}),i.jsx("p",{className:"mt-1.5 text-xs text-muted-foreground",children:w.category})]},w.id)),i.jsxs(B,{to:"/whats-new",onClick:()=>l(!1),className:"flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:["View Full Roadmap",i.jsx(De,{className:"h-4 w-4"})]})]}):i.jsx("div",{className:"space-y-4",children:ie.map(w=>i.jsxs("section",{className:"space-y-2",children:[i.jsx("h3",{className:"px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:w.title}),w.items.length===0?i.jsx("div",{className:"rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground",children:w.emptyLabel}):i.jsx("div",{className:"space-y-2",children:w.items.map(x=>{const D=i.jsxs(i.Fragment,{children:[i.jsxs("div",{className:"min-w-0 flex-1",children:[i.jsx("div",{className:"truncate text-sm font-medium",children:x.label}),x.description&&i.jsx("div",{className:"truncate text-xs text-muted-foreground",children:x.description})]}),x.badge&&i.jsx("span",{className:"rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground",children:x.badge}),x.to&&i.jsx(De,{className:"h-3.5 w-3.5 text-muted-foreground"})]});return x.to?i.jsx(B,{to:x.to,onClick:()=>l(!1),className:"flex items-center gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-accent/40",children:D},x.id):i.jsx("div",{className:"flex items-center gap-2 rounded-lg border border-border/70 bg-background/50 px-3 py-2",children:D},x.id)})})]},w.id))})})]}),i.jsx(oi,{})]})})})}const hi=h.lazy(()=>C(()=>import("./Home-R7gtchzu.js"),__vite__mapDeps([0,1,2,3,4,5,6,7]))),fi=h.lazy(()=>C(()=>import("./Generation-CcsDavTA.js"),__vite__mapDeps([8,1,2,3,9,4,10,11,12,5,6,7,13]))),gi=h.lazy(()=>C(()=>import("./SeedGenerator-Cl0kqnct.js"),__vite__mapDeps([14,1,2,3,4,12,13,9,5,6,7]))),yi=h.lazy(()=>C(()=>import("./Validation-BJHhr_Pe.js"),__vite__mapDeps([15,1,2,3,4,6,7,5]))),Cr=h.lazy(()=>C(()=>import("./Drafts-mYe4_fcK.js"),__vite__mapDeps([16,1,2,3,17,18,19,5,6,7]))),bi=h.lazy(()=>C(()=>import("./Review-CYdD2T4p.js"),__vite__mapDeps([20,1,2,3,21,4,18,5,6,7]))),wi=h.lazy(()=>C(()=>import("./AssetRegenerator-BAWByjON.js"),__vite__mapDeps([11,1,2,3,9,12,4,5,6,7]))),vi=h.lazy(()=>C(()=>import("./Blueprints-CstetjkI.js"),__vite__mapDeps([22,1,2,3,4,23,5,6,7]))),_i=h.lazy(()=>C(()=>import("./BlueprintEditor-DMsLgMB-.js"),__vite__mapDeps([24,1,25,26,3,23,27,5,2,6,7]))),xi=h.lazy(()=>C(()=>import("./Templates-fDc17j2t.js"),__vite__mapDeps([28,1,2,3,21,4,6,7,5]))),ki=h.lazy(()=>C(()=>import("./Lineage-CNlrIyeL.js"),__vite__mapDeps([29,1,2,3,4,5,6,7]))),Si=h.lazy(()=>C(()=>import("./Similarity-nqcDOgVn.js"),__vite__mapDeps([30,1,2,3,4,5,6,7]))),Ei=h.lazy(()=>C(()=>import("./Offspring-DnacjKQq.js"),__vite__mapDeps([31,1,2,3,13,9,4,12,10,5,6,7]))),Ti=h.lazy(()=>C(()=>import("./Worlds-koZEDHl7.js"),__vite__mapDeps([32,1,4,3,2,6,7,5]))),Ai=h.lazy(()=>C(()=>import("./Timelines-BOJpMLOC.js"),__vite__mapDeps([33,1,2,3,4,19,6,7,5]))),Ci=h.lazy(()=>C(()=>import("./Events-BilWsqF8.js"),__vite__mapDeps([34,1,4,3,2,6,7,5]))),Oi=h.lazy(()=>C(()=>import("./Settings-Dri4BVs5.js"),__vite__mapDeps([35,1,2,3,5,13,6,7]))),Ii=h.lazy(()=>C(()=>import("./ThemeStudio-CDN-Tcv_.js"),__vite__mapDeps([36,1,2,3,21,17,6,7,5]))),Pi=h.lazy(()=>C(()=>import("./DataManager-BTJpdCqE.js"),__vite__mapDeps([37,1,21,17,3,2,6,7,5]))),Ni=h.lazy(()=>C(()=>import("./BatchGenerate-Dbu2_2G_.js"),__vite__mapDeps([38,1,2,3,9,4,6,7,5]))),ji=h.lazy(()=>C(()=>import("./AuthPage-D_aoW2DO.js"),__vite__mapDeps([39,1,3,5,2,6,7]))),Ri=h.lazy(()=>C(()=>import("./About-CmffCWAv.js"),__vite__mapDeps([40,1,41,26,3,27,5]))),Di=h.lazy(()=>C(()=>import("./HelpCenterPage-B4NJI0Io.js"),__vite__mapDeps([42,1,41,26,3,27,5,2,6,7]))),Li=h.lazy(()=>C(()=>import("./WhatsNewPage-BBFSTfaQ.js"),__vite__mapDeps([43,1,41,26,3,27,5,2,6,7]))),Fi=h.lazy(()=>C(()=>import("./LicensePage-Bp-k6ot1.js"),__vite__mapDeps([44,1,41,26,3,27]))),Mi=h.lazy(()=>C(()=>import("./TermsPage-B500Z7IU.js"),__vite__mapDeps([45,1,41,26,3,27]))),Ui=h.lazy(()=>C(()=>import("./PrivacyPage-B8JHBGP-.js"),__vite__mapDeps([46,1,41,26,3,27]))),$i=h.lazy(()=>C(()=>import("./SecurityPage-BMoz9jDk.js"),__vite__mapDeps([47,1,41,26,3,27]))),Bi=h.lazy(()=>C(()=>import("./CodeOfConductPage-DjN1kk22.js"),__vite__mapDeps([48,1,41,26,3,27])));function Hi(){return i.jsx("div",{className:"flex h-[60vh] items-center justify-center",children:i.jsxs("div",{className:"flex items-center gap-3 text-sm text-muted-foreground",children:[i.jsx(ms,{className:"h-5 w-5 animate-spin"}),"Loading screen..."]})})}function Ki(){return i.jsxs("div",{className:"flex h-[60vh] flex-col items-center justify-center gap-4 text-center",children:[i.jsxs("div",{children:[i.jsx("h1",{className:"text-2xl font-semibold text-foreground",children:"Page not found"}),i.jsx("p",{className:"mt-2 text-sm text-muted-foreground",children:"The requested route does not exist in the current browser app build."})]}),i.jsx(B,{to:"/",className:"inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",children:"Return home"})]})}function Gi(){return i.jsx(mi,{children:i.jsx(h.Suspense,{fallback:i.jsx(Hi,{}),children:i.jsxs(ws,{children:[i.jsx(T,{path:"/",element:i.jsx(hi,{})}),i.jsx(T,{path:"/generate",element:i.jsx(fi,{})}),i.jsx(T,{path:"/seed-generator",element:i.jsx(gi,{})}),i.jsx(T,{path:"/validation",element:i.jsx(yi,{})}),i.jsx(T,{path:"/batch",element:i.jsx(Ni,{})}),i.jsx(T,{path:"/drafts",element:i.jsx(Cr,{})}),i.jsx(T,{path:"/drafts/",element:i.jsx(Cr,{})}),i.jsx(T,{path:"/drafts/:id",element:i.jsx(bi,{})}),i.jsx(T,{path:"/drafts/:id/assets/:assetName/regenerate",element:i.jsx(wi,{})}),i.jsx(T,{path:"/templates",element:i.jsx(xi,{})}),i.jsx(T,{path:"/blueprints",element:i.jsx(vi,{})}),i.jsx(T,{path:"/blueprints/edit/*",element:i.jsx(_i,{})}),i.jsx(T,{path:"/lineage",element:i.jsx(ki,{})}),i.jsx(T,{path:"/similarity",element:i.jsx(Si,{})}),i.jsx(T,{path:"/offspring",element:i.jsx(Ei,{})}),i.jsx(T,{path:"/worlds",element:i.jsx(Ti,{})}),i.jsx(T,{path:"/timelines",element:i.jsx(Ai,{})}),i.jsx(T,{path:"/events",element:i.jsx(Ci,{})}),i.jsx(T,{path:"/themes",element:i.jsx(Ii,{})}),i.jsx(T,{path:"/settings",element:i.jsx(Oi,{})}),i.jsx(T,{path:"/data",element:i.jsx(Pi,{})}),i.jsx(T,{path:"/auth",element:i.jsx(ji,{})}),i.jsx(T,{path:"/about",element:i.jsx(Ri,{})}),i.jsx(T,{path:"/help",element:i.jsx(Di,{})}),i.jsx(T,{path:"/whats-new",element:i.jsx(Li,{})}),i.jsx(T,{path:"/license",element:i.jsx(Fi,{})}),i.jsx(T,{path:"/terms",element:i.jsx(Mi,{})}),i.jsx(T,{path:"/privacy",element:i.jsx(Ui,{})}),i.jsx(T,{path:"/security",element:i.jsx($i,{})}),i.jsx(T,{path:"/code-of-conduct",element:i.jsx(Bi,{})}),i.jsx(T,{path:"*",element:i.jsx(Ki,{})})]})})})}const Wi={background:"background",text:"text",accent:"accent",button:"button",button_text:"button_text",border:"border",highlight:"highlight",window:"window",muted_text:"muted_text",surface:"surface",success_bg:"success_bg",danger_bg:"danger_bg",accent_bg:"accent_bg",accent_title:"accent_title",success_text:"success_text",error_text:"error_text",warning_text:"warning_text"},zi={brackets:"tok_brackets",asterisk:"tok_asterisk",parentheses:"tok_parentheses",double_brackets:"tok_double_brackets",curly_braces:"tok_curly_braces",pipes:"tok_pipes",at_sign:"tok_at_sign"},qi=[{section:"app",key:"background",label:"Background",colorKey:"background"},{section:"app",key:"surface",label:"Surface",colorKey:"surface"},{section:"app",key:"window",label:"Window",colorKey:"window"},{section:"app",key:"text",label:"Text",colorKey:"text"},{section:"app",key:"muted_text",label:"Muted Text",colorKey:"muted_text"},{section:"app",key:"accent",label:"Primary Accent",colorKey:"accent"},{section:"app",key:"accent_bg",label:"Accent Surface",colorKey:"accent_bg"},{section:"app",key:"button",label:"Button",colorKey:"button"},{section:"app",key:"button_text",label:"Button Text",colorKey:"button_text"},{section:"app",key:"border",label:"Border",colorKey:"border"},{section:"app",key:"highlight",label:"Ring / Highlight",colorKey:"highlight"},{section:"app",key:"success_text",label:"Success Text",colorKey:"success_text"},{section:"app",key:"warning_text",label:"Warning Text",colorKey:"warning_text"},{section:"app",key:"error_text",label:"Error Text",colorKey:"error_text"},{section:"app",key:"success_bg",label:"Success Surface",colorKey:"success_bg"},{section:"app",key:"danger_bg",label:"Danger Surface",colorKey:"danger_bg"},{section:"app",key:"accent_title",label:"Accent Title",colorKey:"accent_title"}],Vi=[{section:"tokenizer",key:"brackets",label:"Brackets",colorKey:"tok_brackets"},{section:"tokenizer",key:"asterisk",label:"Asterisk",colorKey:"tok_asterisk"},{section:"tokenizer",key:"parentheses",label:"Parentheses",colorKey:"tok_parentheses"},{section:"tokenizer",key:"double_brackets",label:"Double Brackets",colorKey:"tok_double_brackets"},{section:"tokenizer",key:"curly_braces",label:"Curly Braces",colorKey:"tok_curly_braces"},{section:"tokenizer",key:"pipes",label:"Pipes",colorKey:"tok_pipes"},{section:"tokenizer",key:"at_sign",label:"At Sign",colorKey:"tok_at_sign"}],Ec=[{title:"App Colors",description:"Web and app-facing surfaces.",fields:qi},{title:"Tokenizer Colors",description:"Syntax highlighting tokens used in review surfaces.",fields:Vi}];function Yi(r,e){if(!r)return null;const t={...r.colors};for(const[n,s]of Object.entries(e?.app??{})){if(!s)continue;const a=Wi[n];a&&(t[a]=s)}for(const[n,s]of Object.entries(e?.tokenizer??{})){if(!s)continue;const a=zi[n];a&&(t[a]=s)}return t}function L(r){const e=r.replace("#","").trim(),t=e.length===3?e.split("").map(y=>y+y).join(""):e;if(!/^[0-9a-fA-F]{6}$/.test(t))return"0 0% 0%";const n=parseInt(t.slice(0,2),16)/255,s=parseInt(t.slice(2,4),16)/255,a=parseInt(t.slice(4,6),16)/255,o=Math.max(n,s,a),c=Math.min(n,s,a),l=o-c,d=(o+c)/2;let u=0,p=0;if(l!==0)switch(p=l/(1-Math.abs(2*d-1)),o){case n:u=(s-a)/l%6;break;case s:u=(a-n)/l+2;break;default:u=(n-s)/l+4;break}const m=Math.round(u*60<0?u*60+360:u*60),b=Math.round(p*1e3)/10,f=Math.round(d*1e3)/10;return`${m} ${b}% ${f}%`}function Ji(r){return{"--background":L(r.background),"--foreground":L(r.text),"--card":L(r.surface),"--card-foreground":L(r.text),"--primary":L(r.accent),"--primary-foreground":L(r.button_text),"--secondary":L(r.button),"--secondary-foreground":L(r.button_text),"--muted":L(r.window),"--muted-foreground":L(r.muted_text),"--accent":L(r.accent_bg),"--accent-foreground":L(r.text),"--destructive":L(r.danger_bg),"--destructive-foreground":L(r.button_text),"--border":L(r.border),"--input":L(r.border),"--ring":L(r.highlight)}}function Xi(r){const e=document.documentElement,t=Ji(r);Object.entries(t).forEach(([s,a])=>{e.style.setProperty(s,a)}),e.style.setProperty("--app-bg",r.background),e.style.setProperty("--app-surface",r.surface),e.style.setProperty("--app-border",r.border),e.style.setProperty("--app-highlight",r.highlight),e.style.setProperty("--app-accent",r.accent);const n=document.querySelector('meta[name="theme-color"]');n&&n.setAttribute("content",r.window)}const Qi=h.createContext(null);function Zi({children:r}){const[e,t]=h.useState(null),n=Nr(),{data:s}=le({queryKey:["config"],queryFn:()=>G.getConfig(),initialData:()=>G.getConfigSnapshot()}),{data:a=[],isLoading:o}=le({queryKey:["themes"],queryFn:()=>G.getThemes(),initialData:()=>G.getThemesSnapshot()}),c=e?.themeName??s?.theme_name??"dark",l=e?.overrides??s?.theme;h.useEffect(()=>{const u=a.find(m=>m.name===c)??a[0],p=Yi(u,l);p&&Xi(p)},[a,c,l]),h.useEffect(()=>{const u=()=>{n.invalidateQueries({queryKey:["themes"]})};return window.addEventListener(jt,u),()=>{window.removeEventListener(jt,u)}},[n]);const d=h.useMemo(()=>({themes:a,isLoading:o,previewTheme:(u,p)=>{t({themeName:u,overrides:p})},clearPreview:()=>{t(null)}}),[a,o]);return i.jsx(Qi.Provider,{value:d,children:r})}const ec=new hs({defaultOptions:{queries:{staleTime:1e3*60*5,retry:1}}});Bn.createRoot(document.getElementById("root")).render(i.jsx(h.StrictMode,{children:i.jsx(fs,{client:ec,children:i.jsx(Zi,{children:i.jsx(vs,{children:i.jsx(Gi,{})})})})}));export{vc as $,lo as A,uo as B,te as C,za as D,wc as E,mo as F,ne as G,ho as H,xc as I,yc as J,bc as K,fn as L,Mr as M,at as N,_ as O,st as P,ar as Q,Ss as R,Pt as S,nt as T,$r as U,xe as V,Qi as W,Yi as X,Ec as Y,Xi as Z,C as _,tt as a,Zo as a0,lc as a1,dc as a2,Cs as a3,Ns as a4,pc as a5,G as b,A as c,Js as d,Se as e,uc as f,jr as g,ee as h,mc as i,qa as j,hc as k,_c as l,Sc as m,gc as n,to as o,eo as p,N as q,V as r,fc as s,kc as t,si as u,co as v,me as w,Es as x,ii as y,j as z};
//# sourceMappingURL=index-C-5CG87r.js.map
