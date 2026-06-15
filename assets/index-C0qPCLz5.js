const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Home-7BdcI0m6.js","assets/react-vendor-C34M-SVW.js","assets/query-vendor-a-KbK2Pt.js","assets/vendor-SQydnVtd.js","assets/useAssistantContext-jpU1pIRu.js","assets/router-vendor-BUgBkwhx.js","assets/storage-vendor-CKqr1NrK.js","assets/ui-utils-vendor-DeRmtv56.js","assets/Generation-DgXDcXRu.js","assets/generation-session-BMaFVkxf.js","assets/GenerationProgress-CbsGgwWB.js","assets/DraftSendConfigPanel-CZKb9of4.js","assets/AssetRegenerator-kIOzs7LL.js","assets/BlueprintPanel-CPl5WAu7.js","assets/featureSelection-bAEkKlXg.js","assets/SeedGenerator-VpqJo30u.js","assets/Validation-B93t7pIA.js","assets/Drafts-BZ34bN8d.js","assets/SyncControls-BQnm96vs.js","assets/VersionHistoryPanel-BfSSgBjj.js","assets/GenerationHistoryPanel-CljIfb1A.js","assets/Review-D-XBReOA.js","assets/download-BRkUB9Us.js","assets/Blueprints-BCtvyYu4.js","assets/blueprintLint-7sH-DCvb.js","assets/BlueprintEditor-GrhXgjVZ.js","assets/editor-vendor-4PMdRp_6.js","assets/markdownComponents-CRFtuIT0.js","assets/markdown-vendor-8bvHJvgX.js","assets/Templates-j8UmzAPf.js","assets/Lineage-DU1qET2K.js","assets/Similarity-DoQgoGMs.js","assets/Offspring-DA0eZOqZ.js","assets/Worlds-BvfbmK5h.js","assets/Timelines-B22bcOvK.js","assets/Events-DkyBT5-K.js","assets/Settings-CytIHUgP.js","assets/ThemeStudio-YA3xVMwQ.js","assets/DataManager-CimvnXs6.js","assets/BatchGenerate-B5P7cZn6.js","assets/AuthPage-Ca5hvZf7.js","assets/About-BV50K2g5.js","assets/DocumentPage-D2DKuFU6.js","assets/HelpCenterPage-B2Urz62O.js","assets/WhatsNewPage-D_nbPoPv.js","assets/LicensePage-C4l2wosM.js","assets/TermsPage-kzGnrTME.js","assets/PrivacyPage-DHUECVTk.js","assets/SecurityPage-BFjW-Stv.js","assets/CodeOfConductPage-L1M7cqPs.js"])))=>i.map(i=>d[i]);
import{r as h,j as i,d as es}from"./react-vendor-C34M-SVW.js";import{X as Le,B as ts,T as rs,A as Zt,C as ns,h as ss,j as Te,S as as,k as os,l as is,H as cs,m as ls,F as ds,o as us,p as ps,q as er,w as Br,L as Ur,x as ms,G as $r,y as hs,z as Gr,D as fs,E as Ct,U as gs,I as ys,J as bs,K as _s,P as ws,N as vs,O as xs,R as ks,W as Ss,Y as tr,Z as Es,_ as Ts,$ as As}from"./vendor-SQydnVtd.js";import{u as Hr,a as de,Q as Cs}from"./query-vendor-a-KbK2Pt.js";import{D as Fe}from"./storage-vendor-CKqr1NrK.js";import{t as Os,c as Is}from"./ui-utils-vendor-DeRmtv56.js";import{L as K,u as Ns,a as Ge,R as Rs,b as E,H as Ps}from"./router-vendor-BUgBkwhx.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(s){if(s.ep)return;s.ep=!0;const a=t(s);fetch(s.href,a)}})();const js="modulepreload",Ds=function(r){return"/"+r},rr={},C=function(e,t,n){let s=Promise.resolve();if(t&&t.length>0){let o=function(d){return Promise.all(d.map(u=>Promise.resolve(u).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};document.getElementsByTagName("link");const c=document.querySelector("meta[property=csp-nonce]"),l=c?.nonce||c?.getAttribute("nonce");s=o(t.map(d=>{if(d=Ds(d),d in rr)return;rr[d]=!0;const u=d.endsWith(".css"),p=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${p}`))return;const m=document.createElement("link");if(m.rel=u?"stylesheet":js,u||(m.as="script"),m.crossOrigin="",m.href=d,l&&m.setAttribute("nonce",l),document.head.appendChild(m),u)return new Promise((y,f)=>{m.addEventListener("load",y),m.addEventListener("error",()=>f(new Error(`Unable to preload CSS for ${d}`)))})}))}function a(o){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=o,window.dispatchEvent(c),!c.defaultPrevented)throw o}return s.then(o=>{for(const c of o||[])c.status==="rejected"&&a(c.reason);return e().catch(a)})},nr="getting-started",Ot="getting-started",Ls="protect-your-work",Fs="review-and-export",Ms="draft-library",Bs="validation-workflow",Us="blueprints-safety",Nc=[{id:"browser-storage",title:"Understand where your work lives",description:"Drafts, templates, settings, and theme edits stay in this browser profile by default. Clearing browser storage removes them unless you export a backup first.",to:"/about",actionLabel:"Read about browser storage"},{id:"api-keys",title:"Set up an API key",description:"Open Settings, pick the provider you actually use, and paste the provider key you want the browser app to send with generation requests.",to:"/settings",actionLabel:"Open Settings"},{id:"template",title:"Choose a template before you generate",description:"Templates define which assets are produced and what export structure must be preserved. Start with the built-in template before making custom ones.",to:"/templates",actionLabel:"Review templates"},{id:"generate",title:"Create your first draft",description:"Go to Generate, enter a seed, confirm the content mode, and let the app produce a full draft pack you can review asset by asset.",to:"/generate",actionLabel:"Start generating"},{id:"review",title:"Review before exporting",description:"Open the saved draft, check for consistency and missing details, and refine anything that does not fit the character you want to keep.",to:"/drafts",actionLabel:"Open draft library"},{id:"export",title:"Export with browser expectations in mind",description:"On mobile or in a browser, export may use a share sheet, a new tab, or the download tray instead of a desktop-style save dialog.",to:"/data",actionLabel:"See backup and export tools"}],$s=[{id:"what-is-a-template",title:"Templates vs. blueprints",category:"Concepts",summary:"Templates choose the asset graph. Blueprints define how each asset is generated. Most users should start with templates and leave blueprints alone until they understand the workflow.",bullets:["Templates decide which files exist and in what order they depend on each other.","Blueprints are stricter and can break parser-facing output if edited casually.","Use the built-in template first, then move to custom templates only after you understand review and export."],actions:[{label:"Open templates",to:"/templates"},{label:"Open blueprints",to:"/blueprints"}]},{id:"how-export-works",title:"How export works in the browser",category:"Getting Started",summary:"Browser export behavior depends on the device and browser. Normal web apps do not always get a native filename prompt.",bullets:["Desktop browsers often save directly to Downloads.","Mobile browsers may show a share sheet or open a new tab instead of prompting for a filename.","Use Data Manager exports when you want a full backup of browser-stored content."],actions:[{label:"Open Data Manager",to:"/data"},{label:"Open draft review",to:"/drafts"}]},{id:"api-key-setup",title:"API key setup without guesswork",category:"Getting Started",summary:"The browser app talks to your chosen model provider using the API key you enter in Settings. No local backend service is required for the current web runtime.",bullets:["Choose the provider you really use before selecting a model.","If a key looks corrupted or includes invisible characters, the app will reject it.","Persist keys only on devices you control."],actions:[{label:"Open Settings",to:"/settings"},{label:"Read About storage",to:"/about"}]},{id:"first-draft-review",title:"How to review a first draft",category:"Concepts",summary:"A good review checks structure first, then consistency, then polish. Do not export just because generation finished.",bullets:["Confirm the character name, major facts, and tone stay consistent across assets.","Watch for unresolved placeholders or format drift in strict assets.","Use refinement and validation before exporting to a target format."],actions:[{label:"Open Library",to:"/drafts"},{label:"Open Validation",to:"/validation"}]},{id:"common-blockers",title:"Common blockers and what to do next",category:"Troubleshooting",summary:"Most early problems are configuration or browser-behavior issues, not generator bugs.",bullets:["If generation fails immediately, verify the provider, model, and API key in Settings.","If export feels silent on mobile, check for a share sheet, a new tab, or the browser download tray.","If you lose drafts after clearing browser data, restore from a JSON backup in Data Manager."],actions:[{label:"Open Settings",to:"/settings"},{label:"Open Data Manager",to:"/data"}]}],Rc=["Getting Started","Concepts","Troubleshooting"],Kr=[{id:Ot,title:"Getting Started Tour",summary:"Walk through the safest first-run path from setup to a first export-ready draft.",audience:"New users who want the app to tell them what to do next.",estimatedMinutes:6,steps:[{id:"start-home",title:"Start from Home",description:"Home is the launch surface for the beginner path. It tells you what the current browser app can do and where to go next.",to:"/",routeLabel:"Home",bullets:["Use Home when you are not sure which workflow to open first.","The browser profile you are using is the current storage location for drafts and settings."]},{id:"set-up-provider",title:"Set up provider access",description:"Open Settings before you generate anything. This avoids the most common first-run failure: trying to generate with a missing or mismatched provider key.",to:"/settings",routeLabel:"Settings",targetId:"settings-api-keys",targetLabel:"API Keys",bullets:["Pick the provider you actually use.","Enter the API key you want the browser app to send.","Use trusted devices if you choose to persist keys locally."]},{id:"choose-template",title:"Choose the template first",description:"Templates decide which assets exist and how the draft will export. Make this choice before refining the prompt or seed.",to:"/templates",routeLabel:"Templates",bullets:["Start with the built-in template unless you already understand custom template behavior.","Template changes are structural, not cosmetic."]},{id:"generate-draft",title:"Generate the first draft",description:"Once provider setup and template choice are in place, Generate becomes the first full workflow step.",to:"/generate",routeLabel:"Generate",targetId:"generation-submit",targetLabel:"Generate Character button",bullets:["Enter a concrete seed instead of a vague one-liner.","Treat the first result as a draft to review, not a final export."]},{id:"review-library",title:"Review saved drafts",description:"The library is where you reopen saved work and decide what should move into deeper review, validation, or export.",to:"/drafts",routeLabel:"Library",bullets:["Open the library after generation to confirm the draft actually saved.","Use draft review before export when details need cleanup."]},{id:"protect-work",title:"Protect your work with backups",description:"Data Manager is the safety net for browser-local storage. Use it before clearing browser data or moving to another device.",to:"/data",routeLabel:"Data Manager",bullets:["Export backups before risky changes.","Treat API key exports as sensitive data."]}]},{id:Ls,title:"Protect Your Work Tour",summary:"Learn the browser-storage model, backup path, and the pages that matter when you need to avoid losing work.",audience:"Users who are worried about where data lives and how to recover it safely.",estimatedMinutes:4,steps:[{id:"storage-model",title:"Confirm the storage model",description:"About explains that the current product surface is the browser app. That matters because drafts and configuration live in browser storage by default.",to:"/about",routeLabel:"About",bullets:["Do not assume a local backend or desktop shell is saving your work for you.","Treat this browser profile as the place where your work currently lives."]},{id:"backup-tools",title:"Use backup tools intentionally",description:"Data Manager is where you export or restore browser-stored content when you need to migrate, recover, or safeguard work.",to:"/data",routeLabel:"Data Manager",bullets:["Back up before clearing site data.","Use restore only with files you trust and understand."]},{id:"privacy-expectations",title:"Understand privacy expectations",description:"Privacy explains the difference between local browser storage and the provider requests you intentionally send during generation.",to:"/privacy",routeLabel:"Privacy",bullets:["Local storage and provider traffic are different concerns.","Backups can still expose sensitive material if handled carelessly."]},{id:"secure-settings",title:"Review secure settings habits",description:"Settings is where you control provider keys and persistence choices, so it is part of the data-protection workflow too.",to:"/settings",routeLabel:"Settings",targetId:"settings-api-keys",targetLabel:"API Keys",bullets:["Persist keys only on devices you control.","If something feels unsafe or unclear, return to Help Center before continuing."]}]},{id:Fs,title:"Review and Export Tour",summary:"Walk through the review controls that matter before you hand a draft off to export.",audience:"Users who already generated a draft and need a safe review path before exporting.",estimatedMinutes:5,steps:[{id:"review-actions",title:"Start from the review action bar",description:"The review header is the control surface for validation, favoriting, export, and draft deletion.",to:"/drafts/",routeLabel:"Draft Review",matchMode:"prefix",targetId:"review-actions",targetLabel:"Review actions",bullets:["Do not export immediately if you have not checked the draft structure yet.","Keep destructive actions separate from export so you do not rush them."]},{id:"review-validate",title:"Validate before export",description:"Use validation before exporting when the draft has been edited or when the template has strict structure requirements.",to:"/drafts/",routeLabel:"Draft Review",matchMode:"prefix",targetId:"review-validate",targetLabel:"Validate button",bullets:["Validation catches structural problems that a quick read can miss.","Treat missing required pieces or unresolved placeholders as blockers."]},{id:"review-assets",title:"Read the assets, not just the title",description:"The asset list is where consistency problems usually reveal themselves. Check names, tone, and required sections across multiple assets.",to:"/drafts/",routeLabel:"Draft Review",matchMode:"prefix",targetId:"review-assets",targetLabel:"Draft assets",bullets:["A draft can look good in one asset while still being broken elsewhere.","Use targeted editing when only one asset drifts."]},{id:"review-export",title:"Export with browser expectations in mind",description:"When the draft is coherent, use Export. On browser and mobile surfaces this may hand off through a share sheet, new tab, or downloads tray instead of a native save dialog.",to:"/drafts/",routeLabel:"Draft Review",matchMode:"prefix",targetId:"review-export",targetLabel:"Export button",bullets:["The app now tells you which handoff method was used.","If export feels silent on mobile, check share and browser download surfaces."]},{id:"export-choose-preset",title:"Choose the export preset inside the modal",description:"Once the export modal opens, choose the preset that matches the system you are exporting for instead of blindly taking the first option.",to:"/drafts/",routeLabel:"Export Modal",matchMode:"prefix",targetId:"export-preset-selection",targetLabel:"Export preset selection",bullets:["Presets change output structure and destination compatibility.","If you are unsure, review the preset description before continuing."]},{id:"export-confirm",title:"Confirm export and watch the handoff result",description:"Use the Export button after the preset is selected, then follow the browser-specific save or share flow the app reports back to you.",to:"/drafts/",routeLabel:"Export Modal",matchMode:"prefix",targetId:"export-confirm",targetLabel:"Export confirm button",bullets:["A successful export in the browser may still look different from a desktop save dialog.","Use the success message to know whether the file went to share, download, or a new tab."]}]},{id:Ms,title:"Draft Library Tour",summary:"Learn how to use the library as a review queue instead of a pile of saved outputs.",audience:"Users who generated drafts and need to understand where to reopen, compare, and triage them.",estimatedMinutes:4,steps:[{id:"draft-library-overview",title:"Treat Drafts as your working library",description:"The library is not just storage. It is where you decide which drafts are worth opening for deeper review or export.",to:"/drafts",routeLabel:"Library",targetId:"drafts-list",targetLabel:"Draft list",bullets:["Open the library from here after generation instead of relying on memory or browser history.","Use names, tags, and favorites to keep the library readable as it grows."]},{id:"draft-workbench",title:"Use the workbench for comparison and checks",description:"The workbench keeps review aids in view so you can compare outputs and think before opening a draft for editing.",to:"/drafts",routeLabel:"Library",targetId:"drafts-workbench",targetLabel:"Draft workbench",bullets:["Comparison and review tools help you choose the better draft before you start editing.","Staged placeholders are visible here, but only the active tools should drive your next action."]},{id:"draft-review-hand-off",title:"Open one draft for real review",description:"Once a draft looks worth keeping, open it and continue with validation, editing, and export on the review page.",to:"/drafts",routeLabel:"Drafts",targetId:"drafts-open-review",targetLabel:"Draft review links",bullets:["The library is the triage layer. The review page is the editing and export layer.","Back up important work before risky cleanup or browser-data changes."]}]},{id:Bs,title:"Validation Workflow Tour",summary:"Walk through the validation screen so structural checks become a normal part of review instead of a last-minute panic step.",audience:"Users who edit drafts or export to strict formats and need to know when validation matters.",estimatedMinutes:4,steps:[{id:"validation-overview",title:"Use validation as a structural checkpoint",description:"Validation is where you confirm the draft still matches the expected structure before you export or hand it off to another tool.",to:"/validation",routeLabel:"Validation",targetId:"validation-draft-panel",targetLabel:"Validate saved draft panel",bullets:["Run validation after major edits, not only after generation.","Treat structural failures as blockers instead of cosmetic warnings."]},{id:"validation-run",title:"Choose the simplest input path",description:"Most users should validate a saved draft by review ID instead of typing a manual path unless they know exactly what they are checking.",to:"/validation",routeLabel:"Validation",targetId:"validation-draft-run",targetLabel:"Validate Draft button",bullets:["Use saved-draft validation for normal browser workflows.","Manual paths are useful when you are investigating a specific stored location."]},{id:"validation-results",title:"Read the results for real blockers",description:"The result panel tells you whether the draft passed and shows the lines that need attention before export.",to:"/validation",routeLabel:"Validation",targetId:"validation-results",targetLabel:"Validation results",bullets:["Fix missing required sections and unresolved placeholders first.","If the result passes, move back to review or export with more confidence."]}]},{id:Us,title:"Blueprint Safety Tour",summary:"Learn when to leave blueprints alone, when to inspect them carefully, and where to bail out to safer surfaces.",audience:"Non-technical or first-time users who might wander into blueprints before understanding template contracts.",estimatedMinutes:4,steps:[{id:"blueprints-search",title:"Treat Blueprints as inspection first, editing second",description:"Start by searching and reading. Do not jump into editing unless you know why a blueprint needs to change.",to:"/blueprints",routeLabel:"Blueprints",targetId:"blueprints-search",targetLabel:"Blueprint search",bullets:["Search helps you understand which blueprint family you are looking at.","Reading the path and description usually tells you whether the file is core, system, or template-specific."]},{id:"blueprints-tools",title:"Use browser safety tools before editing",description:"The lint and sandbox tools exist so you can inspect behavior without immediately rewriting contract-heavy text.",to:"/blueprints",routeLabel:"Blueprints",targetId:"blueprints-tools",targetLabel:"Blueprint tools",bullets:["Use lint and preview to reduce guesswork.","A readable blueprint is not automatically a safe blueprint."]},{id:"blueprints-exit-ramp",title:"Know the safer alternative",description:"If you are trying to change workflow shape rather than raw blueprint text, templates are usually the safer surface for early users.",to:"/blueprints",routeLabel:"Blueprints",targetId:"blueprints-list",targetLabel:"Blueprint list",bullets:["Do not edit a blueprint just because you found the right file name.","When in doubt, go back to Templates or Help Center before making changes."]}]}],Gs=[{id:"home",match:"/",matchMode:"exact",title:"Home help",summary:"Use Home as the launch surface for first-run guidance, recent updates, quick actions, and your next step into the workflow.",keyActions:["Start with the Getting Started guide if this is your first run.","Use Quick Actions to jump straight into Generate, Drafts, or Seeds.","Check What’s New when behavior changes after an update."],pitfalls:["Do not assume your work syncs automatically. This browser profile is the storage location by default.","Do not skip Settings if generation cannot start; most early issues begin there."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"generate",match:"/generate",matchMode:"exact",title:"Generate help",summary:"Generation is where you choose the template, seed, provider, and content mode that become a full draft pack.",keyActions:["Choose the template before you spend time refining the seed.","Keep the seed concrete enough that the model has something to preserve across assets.","Use review after generation instead of trying to perfect everything in one pass."],pitfalls:["A missing or invalid API key will usually fail generation before useful output appears.","Changing template assumptions late can invalidate your review expectations."],actions:[{label:"Open Settings",to:"/settings"},{label:"Open templates",to:"/templates"}],relatedTopicIds:["api-key-setup","what-is-a-template"]},{id:"seed-generator",match:"/seed-generator",matchMode:"exact",title:"Seed Generator help",summary:"Use Seed Generator when you need raw concept material before you commit to a full draft workflow.",keyActions:["Generate multiple seeds and keep the one with the clearest identity.","Pass the best seed into Generate instead of trying to export from here."],pitfalls:["A seed is not a finished draft; it still needs a template and generation pass."],actions:[{label:"Open Generate",to:"/generate"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["common-blockers"]},{id:"validation",match:"/validation",matchMode:"exact",title:"Validation help",summary:"Validation helps you catch structural issues before export, especially on strict templates or edited drafts.",keyActions:["Validate after major edits and before export.","Treat missing required assets or unresolved placeholders as blockers, not cosmetic warnings."],pitfalls:["Passing generation does not guarantee export readiness."],actions:[{label:"Open Library",to:"/drafts"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["first-draft-review","common-blockers"]},{id:"batch",match:"/batch",matchMode:"exact",title:"Batch help",summary:"Batch generation is for running multiple drafts in sequence without driving the app one draft at a time.",keyActions:["Keep concurrency conservative until you know your provider limits.","Use batch for throughput, not for first-time learning of the workflow."],pitfalls:["High concurrency can make failures harder to interpret."],actions:[{label:"Open Generate",to:"/generate"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["common-blockers"]},{id:"drafts",match:"/drafts",matchMode:"exact",title:"Library help",summary:"The library is where you reopen saved work, check metadata, and decide which draft should move into review or export.",keyActions:["Open the review page for the draft you want to polish or export.","Use metadata and favorites to keep the library manageable as it grows."],pitfalls:["Deleting a draft removes the browser-local copy unless you already exported or backed it up."],actions:[{label:"Open Data Manager",to:"/data"},{label:"Open Validation",to:"/validation"}],relatedTopicIds:["first-draft-review","common-blockers"]},{id:"draft-review",match:"/drafts/",matchMode:"prefix",title:"Draft review help",summary:"Review is where you inspect generated assets, refine weak spots, validate structure, and export only when the pack is coherent.",keyActions:["Check the character name, core traits, and tone across multiple assets before exporting.","Use refine tools for targeted edits instead of regenerating the whole draft immediately.","Validate after meaningful edits."],pitfalls:["A draft that reads well in one asset can still fail export because another asset drifted or broke format.","Do not ignore placeholders or empty required sections in strict assets."],actions:[{label:"Open Validation",to:"/validation"},{label:"Open Data Manager",to:"/data"}],relatedTopicIds:["first-draft-review","how-export-works"]},{id:"templates",match:"/templates",matchMode:"exact",title:"Templates help",summary:"Templates define which assets exist, how they depend on each other, and what export structure needs to remain valid.",keyActions:["Use the built-in template first so you understand the app’s baseline workflow.","Treat template changes as structural decisions, not cosmetic ones."],pitfalls:["Changing template expectations late can invalidate assumptions in review and export."],actions:[{label:"Open Generate",to:"/generate"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["what-is-a-template"]},{id:"blueprints",match:"/blueprints",matchMode:"exact",title:"Blueprints help",summary:"Blueprints are advanced prompt/compiler definitions. They are powerful, but they are not a safe first editing surface for non-technical users.",keyActions:["Prefer templates unless you are intentionally changing generation structure.","Preserve parser-facing formats and placeholders carefully when editing."],pitfalls:["A casual blueprint edit can break validation or export even if the text still looks readable."],actions:[{label:"Open templates",to:"/templates"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["what-is-a-template"]},{id:"blueprint-editor",match:"/blueprints/edit",matchMode:"prefix",title:"Blueprint editor help",summary:"The editor is for advanced changes to blueprint text and should be treated as a strict contract surface, not a freeform note field.",keyActions:["Keep output structures intact when the target asset expects rigid formatting.","Validate edits before using them in a generation workflow."],pitfalls:["Unfilled placeholders, broken structure, or dependency mistakes can cascade through later assets."],actions:[{label:"Open Validation",to:"/validation"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["what-is-a-template","common-blockers"]},{id:"similarity",match:"/similarity",matchMode:"exact",title:"Similarity help",summary:"Similarity helps you inspect overlap between drafts so you can catch repeats, redundancy, or near-duplicates.",keyActions:["Use it after building a larger draft library or batch output set."],pitfalls:["Similarity is analysis support, not a replacement for human review."],actions:[{label:"Open Library",to:"/drafts"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["first-draft-review"]},{id:"offspring",match:"/offspring",matchMode:"exact",title:"Offspring help",summary:"Offspring combines parent drafts into a derivative result, so parent quality and consistency matter before you start.",keyActions:["Choose parents that are already reviewed and structurally healthy."],pitfalls:["Using unstable or contradictory parents gives unstable offspring output."],actions:[{label:"Open Library",to:"/drafts"},{label:"Open Validation",to:"/validation"}],relatedTopicIds:["first-draft-review"]},{id:"lineage",match:"/lineage",matchMode:"exact",title:"Lineage help",summary:"Lineage shows how related drafts connect over time so you can track derivations and review ancestry.",keyActions:["Use lineage when you need provenance, not when you need direct editing."],pitfalls:["Lineage helps you understand relationships, but it does not repair structural draft issues on its own."],actions:[{label:"Open Library",to:"/drafts"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["first-draft-review"]},{id:"themes",match:"/themes",matchMode:"exact",title:"Themes help",summary:"Themes control the browser UI appearance. Runtime theme behavior lives in the app, not in the reference TOML files under resources.",keyActions:["Use presets as a base and save customizations intentionally."],pitfalls:["Editing reference theme files in the repo is not the same as changing the live browser theme runtime."],actions:[{label:"Open Settings",to:"/settings"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["common-blockers"]},{id:"settings",match:"/settings",matchMode:"exact",title:"Settings help",summary:"Settings controls provider access, model defaults, browser persistence choices, theme behavior, and tutorial/help preferences.",keyActions:["Start here if generation fails, models are missing, or you are unsure where data is stored.","Use the Help and Tutorials section to restart the starter guide or re-enable tips."],pitfalls:["Saving API keys in browser storage is convenient, but it should be limited to devices you trust."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open About",to:"/about"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"data",match:"/data",matchMode:"exact",title:"Data Manager help",summary:"Data Manager is the safety net for browser-local drafts, config, and backups.",keyActions:["Export backups before clearing browser data or changing devices.","Treat API-key export files as sensitive data."],pitfalls:["Clearing browser storage without a backup removes local drafts and settings."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["how-export-works","common-blockers"]},{id:"whats-new",match:"/whats-new",matchMode:"exact",title:"What’s New help",summary:"Use this page to understand recent product changes and staged roadmap work before assuming the workflow still behaves the same way.",keyActions:["Check release notes after updates when a flow feels different."],pitfalls:["Roadmap items are not the same as implemented features."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Home",to:"/"}],relatedTopicIds:["common-blockers"]},{id:"about",match:"/about",matchMode:"exact",title:"About help",summary:"About explains the current browser-first product surface, storage model, and the difference between the app runtime and repo reference assets.",keyActions:["Use About when you need to confirm how the browser app stores or handles your work."],pitfalls:["Do not assume older Python/backend flows exist in the current product unless you can see them in the app."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"help-center",match:"/help",matchMode:"exact",title:"Help Center help",summary:"Help Center is the structured fallback when you want answers without guessing which page or workflow to visit next.",keyActions:["Start with the Getting Started section if you are still learning the workflow.","Use concepts when the terminology is the blocker.","Use troubleshooting when the app behavior does not match your expectation."],pitfalls:["The Help Center explains the browser app. It does not guarantee parity with future mobile or desktop surfaces."],actions:[{label:"Open Home",to:"/"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"license",match:"/license",matchMode:"exact",title:"License help",summary:"License explains the repository licensing terms and should be read when you need usage or redistribution clarity.",keyActions:["Use this page when you need the exact license text or attribution expectations."],pitfalls:["License answers legal distribution questions, not workflow or storage questions."],actions:[{label:"Open About",to:"/about"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["common-blockers"]},{id:"terms",match:"/terms",matchMode:"exact",title:"Terms help",summary:"Terms of Use covers the rules around using the app, exports, and generated content through the current browser surface.",keyActions:["Use this page when you need policy guidance rather than workflow guidance."],pitfalls:["Terms is not a how-to page. Use Help Center for workflow questions."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Privacy",to:"/privacy"}],relatedTopicIds:["common-blockers"]},{id:"privacy",match:"/privacy",matchMode:"exact",title:"Privacy help",summary:"Privacy explains what stays in browser storage, what reaches provider APIs, and what sensitive data you are responsible for handling carefully.",keyActions:["Use this page when you need to understand local storage, API key handling, or data exposure to providers."],pitfalls:["Browser-local does not mean impossible to lose. You still need backups if the data matters."],actions:[{label:"Open Data Manager",to:"/data"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"security",match:"/security",matchMode:"exact",title:"Security help",summary:"Security covers vulnerability reporting and safe handling of provider keys and browser-stored configuration.",keyActions:["Use this page when the question is about secure handling or vulnerability reporting."],pitfalls:["Security policy does not replace provider-specific account protection practices."],actions:[{label:"Open Settings",to:"/settings"},{label:"Open Privacy",to:"/privacy"}],relatedTopicIds:["api-key-setup"]},{id:"code-of-conduct",match:"/code-of-conduct",matchMode:"exact",title:"Code of Conduct help",summary:"Code of Conduct covers collaboration expectations for the repository and project community spaces.",keyActions:["Use this page for contribution and interaction standards, not workflow setup."],pitfalls:["Community rules are separate from app usage or licensing terms."],actions:[{label:"Open About",to:"/about"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["common-blockers"]}],Hs=[{route:"/",pageHelpId:"home",coverage:"complete"},{route:"/generate",pageHelpId:"generate",coverage:"complete"},{route:"/seed-generator",pageHelpId:"seed-generator",coverage:"complete"},{route:"/validation",pageHelpId:"validation",coverage:"complete"},{route:"/batch",pageHelpId:"batch",coverage:"complete"},{route:"/drafts",pageHelpId:"drafts",coverage:"complete"},{route:"/drafts/:id",pageHelpId:"draft-review",coverage:"complete"},{route:"/drafts/:id/assets/:assetName/regenerate",pageHelpId:"draft-review",coverage:"complete"},{route:"/templates",pageHelpId:"templates",coverage:"complete"},{route:"/blueprints",pageHelpId:"blueprints",coverage:"complete"},{route:"/blueprints/edit/*",pageHelpId:"blueprint-editor",coverage:"complete"},{route:"/lineage",pageHelpId:"lineage",coverage:"complete"},{route:"/similarity",pageHelpId:"similarity",coverage:"complete"},{route:"/offspring",pageHelpId:"offspring",coverage:"complete"},{route:"/themes",pageHelpId:"themes",coverage:"complete"},{route:"/settings",pageHelpId:"settings",coverage:"complete"},{route:"/data",pageHelpId:"data",coverage:"complete"},{route:"/about",pageHelpId:"about",coverage:"complete"},{route:"/help",pageHelpId:"help-center",coverage:"complete"},{route:"/whats-new",pageHelpId:"whats-new",coverage:"complete"},{route:"/license",pageHelpId:"license",coverage:"complete"},{route:"/terms",pageHelpId:"terms",coverage:"complete"},{route:"/privacy",pageHelpId:"privacy",coverage:"complete"},{route:"/security",pageHelpId:"security",coverage:"complete"},{route:"/code-of-conduct",pageHelpId:"code-of-conduct",coverage:"complete"}];Hs.map(r=>({path:r.route,pageHelpId:r.pageHelpId}));function Ks(r){const e=Gs.filter(t=>t.matchMode==="exact"?r===t.match:r.startsWith(t.match));return e.length===0?null:e.sort((t,n)=>n.match.length-t.match.length)[0]??null}function st(r){return Kr.find(e=>e.id===r)??null}function It(r,e){return(e.matchMode??"exact")==="exact"?r===e.to:r.startsWith(e.to)}const zs=[{id:"generation-workflow",title:"Generation Workflow",status:"placeholder",ownerFiles:["packages/web/src/components/generation/Generation.tsx","packages/web/src/components/generation/GenerationProgress.tsx","packages/web/src/components/generation/SeedGenerator.tsx","packages/web/src/components/batch/BatchGenerate.tsx","packages/web/src/lib/services/generation.ts"],placeholderFiles:["packages/web/src/components/generation/ApprovalWorkflowPlaceholder.tsx","packages/web/src/components/generation/CheckpointSessionPlaceholder.tsx","packages/web/src/lib/services/generation-scenarios.ts","packages/web/src/lib/services/seed-remix.ts"],items:["Asset-by-asset approval workflow before downstream generation continues","Checkpointed generation sessions that let users pause, resume, or restart from any approved asset","Partial regeneration flow for replacing one asset without discarding the rest of the draft","Multi-model comparison runs for the same seed and template","Batch generation queue with priorities, retry policies, and run history","Scenario presets for common generation goals such as fast drafting, high-structure output, or art-focused packs","Constraint builder for generation goals like tone, genre, style, and content level","Seed remix feature that combines multiple saved concepts into one prompt","Seed idea board with saved prompts, themes, and inspiration sets","Assistant suggestions for strengthening weak or underspecified seeds","Offline/local-model optimized workflow presets","Guided first-run generation flow for helping new users reach a valid draft quickly"]},{id:"review-and-editing",title:"Review and Editing",status:"placeholder",ownerFiles:["packages/web/src/components/drafts/Review.tsx","packages/web/src/components/drafts/Drafts.tsx","packages/web/src/components/common/ChatPanel.tsx","packages/web/src/components/drafts/DraftComparisonPanel.tsx","packages/web/src/components/drafts/ReviewChecklistPanel.tsx","packages/web/src/components/drafts/VersionHistoryPanel.tsx"],placeholderFiles:[],items:["Merge-ready draft comparison workflow for comparing alternate generations and promoting selected assets","Persistent structured review checklist with asset-level scoring, notes, and export gating","Asset health scoring based on completeness, consistency, and format compliance","Provenance view showing which upstream assets influenced each generated asset","Inline review notes attached to individual assets","Asset-level commenting with a simple resolved/unresolved state","Draft branching system for exploring alternate versions of the same character","Draft merge tools for selectively combining assets from different branches","Deeper version history with restore points and revision diffs","Focus mode for reviewing one asset with its immediate dependencies visible","Assistant tools for rewriting a single asset while preserving established canon","Read-only review links for sharing a draft state without enabling edits"]},{id:"templates-and-blueprints",title:"Templates and Blueprints",status:"placeholder",ownerFiles:["packages/web/src/components/templates/Templates.tsx","packages/web/src/components/templates/TemplateWizard.tsx","packages/web/src/components/templates/TemplateComparisonPanel.tsx","packages/web/src/components/blueprints/Blueprints.tsx","packages/web/src/components/blueprints/BlueprintEditor.tsx","packages/web/src/components/blueprints/BlueprintLintPanel.tsx","packages/web/src/components/blueprints/BlueprintSandboxPanel.tsx"],placeholderFiles:["packages/web/src/components/templates/TemplateMigrationPlaceholder.tsx"],items:["Guided template creation wizard in the web UI","Template migration assistant for updating older drafts to newer template versions","Expanded blueprint preview sandbox with prior-asset context sets and reusable test cases","Visual dependency graph for template assets and generation order","Template marketplace or import/export bundle format for sharing templates","Template starter kits for common character-card formats and content styles","Template cloning flow for using the built-in template as a starting point for a custom one","Expanded template comparison workflow with cloning and migration-aware diffs","Expanded blueprint linting dashboard for placeholder usage, dependency clarity, and output expectations","Prompt experimentation lab for testing orchestrator and blueprint variants","Shared blueprint snippet library for reusable sections and control blocks","Template-aware onboarding tutorial for new users"]},{id:"draft-library-and-organization",title:"Draft Library and Organization",status:"placeholder",ownerFiles:["packages/web/src/components/drafts/Drafts.tsx","packages/web/src/components/Home.tsx"],placeholderFiles:["packages/web/src/components/drafts/LibraryCollectionsPlaceholder.tsx"],items:["Better draft library filters for archetype, tone, mode, template, and tags","Saved searches and smart collections for large draft libraries","Bulk metadata editing across multiple drafts","Favorite and pin system for important drafts, templates, and presets","Semantic search across draft content, not just metadata","Auto-tagging suggestions based on generated content","Archive and curation workflows for keeping large draft libraries manageable","Custom foldering or collection system beyond timestamp-based draft storage","Recently viewed and recently edited lists for faster navigation","Duplicate-detection suggestions while browsing the library","Custom metadata fields for project-specific cataloging","Library summary dashboard with counts by template, mode, and generation source"]},{id:"canon-worldbuilding-and-relationships",title:"Canon, Worldbuilding, and Relationships",status:"placeholder",ownerFiles:["packages/web/src/components/lineage/Lineage.tsx","packages/web/src/components/similarity/Similarity.tsx","packages/web/src/components/offspring/Offspring.tsx","packages/web/src/components/worlds/Worlds.tsx","packages/web/src/components/timelines/Timelines.tsx","packages/web/src/components/worlds/Events.tsx","packages/web/src/components/timelines/GenerationHistoryPanel.tsx"],placeholderFiles:["packages/web/src/components/lineage/TimelinePlaceholder.tsx","packages/web/src/components/lineage/AncestryVisualizationPlaceholder.tsx","packages/web/src/components/lineage/LineageExportPlaceholder.tsx","packages/web/src/components/similarity/ClusteringPlaceholder.tsx","packages/web/src/components/similarity/RelationshipGraphPlaceholder.tsx","packages/web/src/components/offspring/TraitInheritancePlaceholder.tsx","packages/web/src/components/offspring/BreedingHistoryPlaceholder.tsx","packages/web/src/components/worlds/CanonLibraryPlaceholder.tsx","packages/web/src/components/worlds/WorldbookPlaceholder.tsx","packages/web/src/components/worlds/RelationshipMapPlaceholder.tsx","packages/web/src/components/worlds/FactionManagerPlaceholder.tsx","packages/web/src/components/worlds/LocationManagerPlaceholder.tsx","packages/web/src/components/worlds/UniverseNotesPlaceholder.tsx","packages/web/src/components/worlds/CanonLockPlaceholder.tsx","packages/web/src/components/timelines/EventTimelinePlaceholder.tsx","packages/web/src/components/timelines/ContinuityAssistantPlaceholder.tsx","packages/web/src/components/worlds/EventCalendarPlaceholder.tsx","packages/web/src/components/worlds/EventEditorPlaceholder.tsx","packages/web/src/components/worlds/EventCategoriesPlaceholder.tsx","packages/web/src/lib/services/canon-library.ts"],items:["Reusable canon library for traits, lore, tags, and recurring world details","Worldbook or setting support that can be attached to multiple related drafts","Relationship mapping between characters in the same universe","Lineage timeline view showing how drafts evolved over time","Similarity clustering to group near-duplicate or closely related drafts","Shared faction, setting, and location records reusable across drafts","Universe-level notes that can be referenced during generation and review","Canon lock system for facts that should remain stable across derivative drafts","Family tree and affiliation visualizations for related characters","Cross-draft continuity assistant for keeping related characters aligned","Event calendar with in-world and real-world date tracking","Expanded generation history timeline with restore points, lineage jumps, and draft-level drilldown","Continuity checking for canon conflicts across drafts"]},{id:"export-and-publishing",title:"Export and Publishing",status:"placeholder",ownerFiles:["packages/web/src/components/common/ExportModal.tsx","packages/shared/src/export/presets.ts"],placeholderFiles:["packages/web/src/components/common/ExportPreviewPlaceholder.tsx","packages/web/src/components/common/PublishingPlaceholder.tsx"],items:["Preset preview mode showing exactly which files and names an export will produce","Platform capability matrix for checking which presets work with which templates","Character pack publishing flow for producing a polished shareable bundle","Export profiles with saved naming, packaging, and metadata rules","One-click export bundles for common targets and sharing destinations","Shareable web preview page for a generated character pack","Optional branded export themes for more polished presentation packages","Metadata manifest export for preserving provenance, model info, and template info alongside assets","Export dry-run mode that shows mapped outputs before creating files","Print-friendly or PDF-style presentation export for review and archiving"]},{id:"analysis-and-evaluation",title:"Analysis and Evaluation",status:"placeholder",ownerFiles:["packages/web/src/components/similarity/Similarity.tsx","packages/web/src/components/validation/Validation.tsx","packages/web/src/components/Home.tsx","packages/web/src/components/drafts/ReviewChecklistPanel.tsx"],placeholderFiles:["packages/web/src/components/similarity/ClusteringPlaceholder.tsx"],items:["Golden sample packs for template quality benchmarking","Evaluation dashboard for model quality, cost, latency, and format success rate","Token and cost analytics per asset, draft, template, and provider","Usage history dashboard for models, templates, exports, and generation modes","Quality trend tracking across model changes and template revisions","Scorecards for comparing provider performance on specific templates","Regression benchmark suite for measuring structural compliance over time","Review analytics showing which assets most often need human edits","Generation time breakdown by stage, provider, and asset count","Template adoption analytics to show which workflows users actually prefer"]},{id:"collaboration-and-sharing",title:"Collaboration and Sharing",status:"placeholder",ownerFiles:["packages/web/src/components/drafts/Review.tsx","packages/web/src/components/templates/Templates.tsx","packages/web/src/components/common/ExportModal.tsx"],placeholderFiles:["packages/web/src/components/common/PublishingPlaceholder.tsx"],items:["Collaboration-friendly review notes attached to individual assets","Shared workspaces for teams curating the same draft library","Commentable template reviews before publishing a new template version","Import/export package format for moving drafts with metadata and history intact","Team preset libraries for shared export and validation standards","Curated featured templates and starter packs surfaced in-app","Community template discovery with tags, screenshots, and example outputs","Public/private visibility controls for shared templates and draft bundles","Lightweight approval workflow for team-owned templates and presets","Activity feed for recent library changes, exports, and published templates"]},{id:"ux-and-platform-surfaces",title:"UX and Platform Surfaces",status:"placeholder",ownerFiles:["packages/web/src/App.tsx","packages/web/src/components/Layout.tsx","packages/web/src/components/Home.tsx","packages/mobile/src/screens"],placeholderFiles:["packages/web/src/components/common/OnboardingPlaceholder.tsx","packages/web/src/components/drafts/LibraryCollectionsPlaceholder.tsx"],items:["Mobile-first review and approval flow for draft triage on smaller screens","Desktop-native drag-and-drop import/export flows","Responsive split-pane editor optimized for wide and narrow displays","Keyboard-first review workflows across web, mobile, and desktop surfaces","Quick actions palette for jumping to drafts, templates, exports, and tools","Pinned dashboard widgets for recent drafts, saved searches, and active queues","Guided empty states that teach features instead of just showing blank screens","In-app documentation panels linked to templates, presets, and validation rules","Customizable home screen tailored to the user's most common workflow","Workspace mode for switching between solo drafting, review, and bulk operations"]},{id:"assistant-and-automation",title:"Assistant and Automation",status:"placeholder",ownerFiles:["packages/web/src/components/common/GlobalAssistant.tsx","packages/web/src/components/common/ChatPanel.tsx","packages/web/src/components/Home.tsx"],placeholderFiles:["packages/web/src/components/common/AutomationPlaceholder.tsx","packages/web/src/components/common/OnboardingPlaceholder.tsx"],items:["Assistant tools for proposing alternate tones or styles for a selected asset","Assistant-generated metadata suggestions like tags, summaries, and archetypes","Auto-generated draft summaries for quick browsing in large libraries","Conversational template helper for explaining what each asset does and depends on","Smart recommendations for next actions after generation, review, or export","Workflow automations for repeated sequences like generate, validate, review, and export","Scheduled batch runs for seed lists or nightly model comparisons","Auto-generated handoff notes summarizing what changed between draft revisions","Safety profile presets tuned for different platforms or use cases","Assistant-backed onboarding that adapts to the selected template and workflow"]}];var zr=10;function Gt(r){const e=r.toLowerCase();return e.startsWith("openrouter/")?"openrouter":e.startsWith("openai/")?"openai":e.startsWith("google/")?"google":e.startsWith("anthropic/")?"anthropic":e.startsWith("deepseek/")?"deepseek":e.startsWith("zai/")?"zai":e.startsWith("moonshot")?"moonshot":e.startsWith("ollama/")?"ollama":e.startsWith("gpt-")||e.startsWith("o1")?"openai":e.startsWith("gemini")?"google":e.startsWith("claude")?"anthropic":e.startsWith("llama")||e.startsWith("mistral")||e.startsWith("codellama")||e.startsWith("vicuna")||e.startsWith("qwen")||e.startsWith("phi")||e.startsWith("gemma")||e.startsWith("starcoder")||e.includes("ollama")?"ollama":"openrouter"}var vt=class extends Error{constructor(r){super(r),this.name="ParseError"}},Ws=["system_prompt","post_history","character_sheet","intro_scene","intro_page","a1111"];function qs(r){const e=/```(?:[a-z]*\n)?(.*?)```/gs,t=r.match(e);return t?t.map(n=>n.trim()):[]}function Vs(r,e){const t=qs(r);if(t.length===0)throw new vt("No codeblocks found in output");let n=0,s;t[0].trim().startsWith("Adjustment Note:")&&(s=t[0].trim(),n=1);const a=t.slice(n);let o=[];e&&e.assets.length>0?o=e.assets.map(u=>u.name):o=[...Ws];const c=o.length;if(a.length!==c){const u=a.slice(0,3).map((m,y)=>`  Block ${y}: ${m.substring(0,75)}${m.length>75?"...":""}`).join(`
`);let p=`Expected ${c} asset blocks, found ${a.length}. `;throw p+=`Template requires order: ${o.join(", ")}
`,p+=`Actual blocks found:
${u}`,a.length>3&&(p+=`
  ... and ${a.length-3} more blocks`),new vt(p)}const l={};for(let u=0;u<o.length;u++)l[o[u]]=a[u];const d=ra(l);if(d&&Object.keys(d).length>0){const u=Object.entries(d).map(([p,m])=>`${p}: ${Array.from(new Set(m)).join(", ")}`).join("; ");throw new vt("Generated content failed validation checks: "+u)}return{assets:l,adjustmentNote:s}}function Ys(r){const e=r.match(/^name:\s*(.+)$/m);return e&&e[1].trim().replace(/^['"]|['"]$/g,"")||null}function Js(r,e=["character_sheet"]){const t=[],n=new Set;for(const s of e)s in r&&!n.has(s)&&(t.push(s),n.add(s));for(const s of Object.keys(r))n.has(s)||(t.push(s),n.add(s));for(const s of t){const a=Ys(r[s]||"");if(a)return a}return null}var Xs=[["{PLACEHOLDER}",/\{PLACEHOLDER\}/g],["Generic {...} placeholder",/(?<!\{)\{(?!\{)[^{}\n]*[A-Za-z][^{}\n]*\}(?!\})/g],["Suno {TITLE}",/\{TITLE\}/g],["Suno other {..}",/\{GENRE\}|\{STYLE\}|\{MOOD\}|\{ENERGY\}|\{TEMPO\}|\{BPM\}|\{TEXTURE\}|\{Remaster Style\}/g],["A1111 slot ((...))",/\(\(\.\.\)\)/g],["A1111 any slot ((...something...)) left",/\(\([^)]*\.\.\.[^)]*\)/g],["Character sheet bracket placeholders",/\[[A-Za-z][^\]\n]*\]/g]],Qs=[["Narrates {{user}} action/thought/consent",/\{\{user\}\}\s+(?:is|was|feels?|felt|thinks?|thought|decides?|decided|knows?|knows?|wants?|wanted|says?|said|nods?|smiles?|walks?|steps?|looks?|touches?|takes?|gives?|allows?|consents?|agrees?|gasps?|moans?)\b/gi],["Narrates {{user}} internal state",/\{\{user\}\}'s\s+(?:mind|thoughts?|feelings?|emotions?|desire|consent|decision|reaction|actions?)\b/gi]],Zs=/(?:never|do not|don't|avoid|without)\s+(?:narrat(?:e|ing)|describ(?:e|ing)|assign(?:ing)?)\s*$/gi,Wr="character_sheet.txt";function ea(r,e){const t=[];for(const[n,s]of Xs)n==="Character sheet bracket placeholders"&&e!==Wr||s.test(r)&&t.push(n);return t}function ta(r){const e=[];for(const[t,n]of Qs)for(const s of r.matchAll(n)){const a=r.substring(Math.max(0,s.index-48),s.index).trim();if(!Zs.test(a)){e.push(t);break}}return e}function qr(r,e){let t=`${r}.txt`;r==="intro_page"&&(t="intro_page.md"),r==="character_sheet"&&(t=Wr);const n=ea(e,t);return n.push(...ta(e)),n}function ra(r){const e={};for(const[t,n]of Object.entries(r)){const s=qr(t,n);s.length>0&&(e[t]=s)}return Object.keys(e).length>0?e:null}function q(r){return typeof r=="object"&&r!==null&&!Array.isArray(r)}function sr(r){if(!q(r))return"unknown";if(r.spec==="chara_card_v2"||r.spec_version==="2.0"||q(r.data)&&(r.data.spec==="chara_card_v2"||r.data.spec_version==="2.0"))return"tavernai_v2";if(typeof r.creator_notes=="string"&&typeof r.first_mes=="string"&&typeof r.description=="string"&&Array.isArray(r.tags)&&typeof r.creator=="string"||typeof r.name=="string"&&typeof r.description=="string"&&typeof r.first_mes=="string")return"tavernai_v1";if(q(r.data)){const e=r.data;if(typeof e.name=="string"&&typeof e.description=="string")return"tavernai_v1"}return"unknown"}function Nt(r){let e="";for(let t=0;t<r.length;t++)e+=String.fromCharCode(r[t]);return e}var ze="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";function na(r){try{const e=r.replace(/[\s=]+/g,""),t=e.length;if(t%4!==0)return null;const n=[];let s=0;for(;s<t;){const a=ze.indexOf(e[s]),o=ze.indexOf(e[s+1]),c=ze.indexOf(e[s+2]),l=ze.indexOf(e[s+3]);if(a===-1||o===-1)return null;n.push(a<<2|o>>4),c!==-1&&n.push((o&15)<<4|c>>2),l!==-1&&n.push((c&3)<<6|l),s+=4}return Nt(new Uint8Array(n))}catch{return null}}function sa(r){const e=new DataView(r),t=[137,80,78,71,13,10,26,10];for(let a=0;a<8;a++)if(e.getUint8(a)!==t[a])return null;let n=8;const s=new Uint8Array(r);for(;n<s.length;){const a=e.getUint32(n),o=String.fromCharCode(s[n+4],s[n+5],s[n+6],s[n+7]);if(o==="tEXt"){const c=s.slice(n+8,n+8+a),l=c.indexOf(0);if(l!==-1&&Nt(c.slice(0,l))==="chara"){const u=c.slice(l+1),p=Nt(u);return na(p)}}if(n+=12+a,o==="IEND")break}return null}var ar={description:"character_sheet",personality:"system_prompt",first_mes:"intro_scene",mes_example:"post_history",scenario:"intro_page"},or=["character_book","lorebook","world_info"];function aa(r,e){return r}function at(r){if(typeof r=="string")return r.trim()||null;if(typeof r=="number"||typeof r=="boolean")return String(r);if(r==null)return null;try{return JSON.stringify(r,null,2)}catch{return null}}function ir(r,e){if(typeof r=="string"){const l=r.trim();return l?`## Entry ${e}

${l}`:null}if(!q(r)){const l=at(r);return l?`## Entry ${e}

${l}`:null}const t=typeof r.name=="string"&&r.name.trim()?r.name.trim():typeof r.comment=="string"&&r.comment.trim()?r.comment.trim():Array.isArray(r.keys)&&r.keys.length>0?r.keys.filter(l=>typeof l=="string"&&l.trim().length>0).join(", "):`Entry ${e}`,n=[],s=Array.isArray(r.keys)?r.keys.filter(l=>typeof l=="string"&&l.trim().length>0):[],a=Array.isArray(r.secondary_keys)?r.secondary_keys.filter(l=>typeof l=="string"&&l.trim().length>0):[];s.length>0&&n.push(`Keys: ${s.join(", ")}`),a.length>0&&n.push(`Secondary Keys: ${a.join(", ")}`),typeof r.comment=="string"&&r.comment.trim()&&r.comment.trim()!==t&&n.push(`Comment: ${r.comment.trim()}`),typeof r.insertion_order=="number"&&n.push(`Insertion Order: ${r.insertion_order}`),typeof r.enabled=="boolean"&&!r.enabled&&n.push("Enabled: false");const o=typeof r.content=="string"&&r.content.trim()?r.content.trim():typeof r.entry=="string"&&r.entry.trim()?r.entry.trim():typeof r.text=="string"&&r.text.trim()?r.text.trim():null,c=[`## ${t}`];if(n.length>0&&c.push(n.join(`
`)),o)c.push(o);else{const l=at(r);l&&c.push(l)}return c.join(`

`).trim()}function oa(r,e){if(typeof e=="string")return e.trim()||null;if(Array.isArray(e)){const a=e.map((o,c)=>ir(o,c+1)).filter(o=>!!o);return a.length>0?a.join(`

`):null}if(!q(e))return at(e);const n=[typeof e.name=="string"&&e.name.trim()?`# ${e.name.trim()}`:`# ${r.replace(/_/g," ").replace(/\b\w/g,a=>a.toUpperCase())}`];typeof e.description=="string"&&e.description.trim()&&n.push(e.description.trim());const s=Array.isArray(e.entries)?e.entries:Array.isArray(e.world_info)?e.world_info:null;if(s){const a=s.map((o,c)=>ir(o,c+1)).filter(o=>!!o);a.length>0&&n.push(a.join(`

`))}if(n.length===1){const a=at(e);a&&n.push(a)}return n.join(`

`).trim()||null}function Vr(r){const e={},t=[],n=[];for(const s of or)r[s]!==void 0&&r[s]!==null&&n.push({key:s,value:r[s]});if(q(r.extensions))for(const s of or)r.extensions[s]!==void 0&&r.extensions[s]!==null&&n.push({key:`extensions.${s}`,value:r.extensions[s]});return n.forEach(({key:s,value:a},o)=>{const c=oa(s,a);if(!c)return;const l=o===0?"lorebook":`lorebook_${o+1}`;e[l]=c,t.push(s.split(".")[0])}),{assets:e,sourceKeys:[...new Set(t)]}}function Yr(r){return q(r.data)?{...r.data}:r}function et(r){if(!q(r))throw new Error("Invalid TavernAI card: expected JSON object");const e=Yr(r),t={},n={},s=Vr(e),a=typeof e.name=="string"?e.name.trim():"Imported Character";for(const[l,d]of Object.entries(ar)){const u=e[l];typeof u=="string"&&u.trim()&&(t[d]=aa(u.trim()))}Object.assign(t,s.assets);const o=new Set([...Object.keys(ar),...s.sourceKeys]),c=new Set(["name","spec","spec_version","data"]);for(const[l,d]of Object.entries(e))c.has(l)||o.has(l)||(typeof d=="string"&&d.trim()?n[l]=d.trim():Array.isArray(d)&&d.length>0&&(n[l]=JSON.stringify(d)));return{name:a,assets:t,sourceFormat:"tavernai_v1",sourcePreset:"TavernAI / SillyTavern",unmappedFields:Object.keys(n).length>0?n:void 0}}function cr(r){return{...et(r),sourceFormat:"chubai",sourcePreset:"Chub AI"}}function lr(r,e){if(!q(r))throw new Error("Invalid character data: expected JSON object");const t=Yr(r),n=JSON.stringify(r,null,2),s=Vr(t);return{name:typeof t.name=="string"&&t.name.trim()?t.name.trim():typeof t.character_name=="string"&&t.character_name.trim()?t.character_name.trim():e?.replace(/\.[^.]+$/,"")||"Imported Character",assets:{character_sheet:n,...s.assets},sourceFormat:"unknown"}}function Oe(r,e){return{name:r.match(/^name:\s*(.+)$/m)?.[1]?.trim()||e?.replace(/\.[^.]+$/,"")||"Imported Character",assets:{character_sheet:r},sourceFormat:"plain_text"}}function ia(r){try{const e=JSON.parse(r);return q(e)?e:null}catch{return null}}function ca(r){try{return JSON.parse(r)}catch{return null}}function la(r,e){if(r instanceof ArrayBuffer&&r.byteLength>0){const s=sa(r);if(s){const a=ca(s);if(a&&q(a))try{const o=sr(a);return{...o==="chubai"?cr(a):o!=="unknown"?et(a):lr(a,e),sourceFormat:"png_card"}}catch{}return Oe(s,e)}return Oe(`[Binary PNG file: ${e||"unknown"} — no embedded character card found]`,e)}if(typeof r!="string")return Oe("[Unsupported data format]",e);const t=r.trim();if(!t)return Oe("[Empty file]",e);const n=ia(t);if(n)try{switch(sr(n)){case"tavernai_v1":return et(n);case"tavernai_v2":return et(n);case"chubai":return cr(n);case"unknown":default:return lr(n,e)}}catch{}return Oe(t,e)}function Pc(r){switch(r){case"tavernai_v1":return"TavernAI v1";case"tavernai_v2":return"TavernAI v2 / SillyTavern";case"chubai":return"Chub AI";case"png_card":return"PNG Character Card";case"plain_text":return"Plain Text";case"unknown":default:return"Unknown Format"}}var Me={name:"V2/V3 Card",version:"3.1",description:"Built-in character card template with 6 standard assets",is_official:!0,assets:[{name:"system_prompt",required:!0,depends_on:[],description:"System-level behavioral instructions",blueprint_file:"blueprints/system/system_prompt.md"},{name:"post_history",required:!0,depends_on:["system_prompt"],description:"Conversation context and relationship state",blueprint_file:"blueprints/system/post_history.md"},{name:"character_sheet",required:!0,depends_on:["system_prompt","post_history"],description:"Structured character data",blueprint_file:"blueprints/system/character_sheet.md"},{name:"intro_scene",required:!0,depends_on:["system_prompt","post_history","character_sheet"],description:"First interaction scenario",blueprint_file:"blueprints/system/intro_scene.md"},{name:"intro_page",required:!0,depends_on:["character_sheet"],description:"Visual character introduction page",blueprint_file:"blueprints/system/intro_page.md"},{name:"a1111",required:!0,depends_on:["character_sheet"],description:"Stable Diffusion image generation prompt",blueprint_file:"blueprints/system/a1111.md"}]};function da(r){const e=r.map(o=>o.name),t=[],n=new Set,s=new Set;function a(o){if(n.has(o)||s.has(o))return;s.add(o);const c=r.find(l=>l.name===o);if(c)for(const l of c.depends_on)a(l);n.add(o),t.push(o),s.delete(o)}for(const o of e)n.has(o)||a(o);return t}function Jr(r){const e=r||Me;return da(e.assets).map(n=>e.assets.find(s=>s.name===n)).filter(n=>n!==void 0)}function ua(r){const e=[];r.name||e.push("Template name is required"),(!r.assets||r.assets.length===0)&&e.push("Template must have at least one asset");const t=new Map(r.assets.map(s=>[s.name,s]));function n(s,a){for(const o of s){if(o===a)return!0;const c=t.get(o);if(c&&n(c.depends_on,a))return!0}return!1}for(const s of r.assets)n(s.depends_on,s.name)&&e.push(`Circular dependency detected for asset: ${s.name}`);return{isValid:e.length===0,errors:e}}class Ht{config;constructor(e){this.config={temperature:.7,maxTokens:4096,timeout:18e4,...e}}async performFetch(e,t){try{return await fetch(e,t)}catch(n){throw this.normalizeRequestError(n)}}async*generateStream(e,t){const n=await this.generate(e,t);yield{content:n.content,done:!0,finishReason:n.finishReason}}getProvider(){return this.config.provider}getModel(){return this.config.model}getApiKey(){return this.config.apiKey}mergeOptions(e){return{temperature:this.config.temperature,maxTokens:this.config.maxTokens,...e}}getFetchOptions(e){const t=new AbortController,n=setTimeout(()=>t.abort(),this.config.timeout);return e?.addEventListener("abort",()=>{clearTimeout(n)}),{signal:e?pa([e,t.signal]):t.signal}}normalizeRequestError(e){return e instanceof Error&&e.name==="AbortError"?new Error("The request timed out or was cancelled. Try again, reduce the request size, or choose a faster model/provider."):e instanceof Error&&/operation was aborted/i.test(e.message)?new Error("The request timed out or was cancelled. Try again, reduce the request size, or choose a faster model/provider."):e instanceof Error?e:new Error("Request failed")}}function pa(r){const e=new AbortController;for(const t of r){if(t.aborted){e.abort();break}t.addEventListener("abort",()=>e.abort(),{once:!0})}return e.signal}class ma extends Ht{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||this.getDefaultBaseUrl()}getDefaultBaseUrl(){switch(this.config.provider){case"openai":return"https://api.openai.com/v1";case"openrouter":return"https://openrouter.ai/api/v1";case"deepseek":return"https://api.deepseek.com";case"zai":return"https://open.bigmodel.cn/api/paas/v4";case"moonshot":return"https://api.moonshot.cn/v1";default:return"https://api.openai.com/v1"}}getHeaders(){return this.config.baseUrl&&this.config.proxyKey?{"Content-Type":"application/json",Authorization:`Bearer ${this.config.proxyKey}`}:this.config.provider==="ollama"?{"Content-Type":"application/json"}:Ae(this.config.provider,this.config.apiKey,{contentType:"application/json"})}isDirectBrowserOpenAIRequest(){if(typeof window>"u"||this.config.provider!=="openai")return!1;try{return new URL(this.baseUrl).hostname==="api.openai.com"}catch{return this.baseUrl.includes("api.openai.com")}}assertBrowserSupported(){if(this.isDirectBrowserOpenAIRequest())throw new Error("Direct OpenAI requests from the browser are blocked by CORS. Use OpenRouter, or configure a custom base URL that points to your own proxy or relay.")}formatMessages(e){return e.map(t=>({role:t.role,content:t.content}))}async generate(e,t){this.assertBrowserSupported();const n=this.mergeOptions(t),s=await this.performFetch(`${this.baseUrl}/chat/completions`,{...this.getFetchOptions(t?.signal),method:"POST",headers:this.getHeaders(),body:JSON.stringify({model:this.config.model,messages:this.formatMessages(e),temperature:n.temperature,max_tokens:n.maxTokens,top_p:n.topP,frequency_penalty:n.frequencyPenalty,presence_penalty:n.presencePenalty})});if(!s.ok){const c=await this.parseError(s);throw new Error(c)}const a=await s.json(),o=a.choices[0];if(!o?.message)throw new Error("No content in response");return{content:o.message.content,finishReason:o.finish_reason,usage:a.usage?{promptTokens:a.usage.prompt_tokens,completionTokens:a.usage.completion_tokens,totalTokens:a.usage.total_tokens}:void 0}}async*generateStream(e,t){this.assertBrowserSupported();const n=this.mergeOptions(t),s=await this.performFetch(`${this.baseUrl}/chat/completions`,{...this.getFetchOptions(t?.signal),method:"POST",headers:Ae(this.config.provider,this.config.apiKey,{contentType:"application/json",accept:"text/event-stream"}),body:JSON.stringify({model:this.config.model,messages:this.formatMessages(e),temperature:n.temperature,max_tokens:n.maxTokens,top_p:n.topP,frequency_penalty:n.frequencyPenalty,presence_penalty:n.presencePenalty,stream:!0})});if(!s.ok){const l=await this.parseError(s);throw new Error(l)}const a=s.body?.getReader();if(!a)throw new Error("No response body");const o=new TextDecoder;let c="";try{for(;;){const{done:l,value:d}=await a.read();if(l)break;c+=o.decode(d,{stream:!0});const u=c.split(`
`);c=u.pop()||"";for(const p of u){const m=p.trim();if(!(!m||m==="data: [DONE]")&&m.startsWith("data: "))try{const y=m.slice(6),g=JSON.parse(y).choices[0];if(!g)continue;const O=g.delta?.content;O&&(yield{content:O,done:!1}),g.finish_reason&&(yield{content:"",done:!0,finishReason:g.finish_reason})}catch{}}}}finally{a.releaseLock()}}async testConnection(){try{this.assertBrowserSupported()}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unsupported browser provider configuration"}}const e=performance.now();try{const t=await this.performFetch(`${this.baseUrl}/models`,{...this.getFetchOptions(),method:"GET",headers:this.getHeaders()}),n=performance.now()-e;if(!t.ok)return{success:!1,latency_ms:n,error:await this.parseError(t)};try{return(await t.json()).data,{success:!0,latency_ms:n,model_info:{name:this.config.model,context_length:void 0}}}catch{return{success:!0,latency_ms:n}}}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}async parseError(e){try{return(await e.json()).error?.message||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}const ha={system:"user",user:"user",assistant:"model"};class fa extends Ht{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||"https://generativelanguage.googleapis.com/v1beta"}getHeaders(){return Ae("google",this.config.apiKey,{contentType:"application/json"})}formatMessages(e){const t=[];let n="";for(const s of e)s.role==="system"?n=s.content:t.push({role:ha[s.role]||s.role,parts:[{text:s.content}]});return n&&t.length>0?t[0].parts[0].text=n+`

`+t[0].parts[0].text:n&&t.unshift({role:"user",parts:[{text:n}]}),t}async callEndpoint(e,t,n){const s=`${this.baseUrl}${e}`;return this.performFetch(s,{...this.getFetchOptions(n),method:"POST",headers:this.getHeaders(),body:JSON.stringify(t)})}async generate(e,t){const n=this.mergeOptions(t),s=`/models/${this.config.model}:generateContent`,a={contents:this.formatMessages(e),generationConfig:{temperature:n.temperature,maxOutputTokens:n.maxTokens,topP:n.topP}},o=await this.callEndpoint(s,a,t?.signal);if(!o.ok){const d=await this.parseError(o);throw new Error(d)}const c=await o.json(),l=c.candidates[0];if(!l?.content?.parts?.[0]?.text)throw new Error("No content in response");return{content:l.content.parts[0].text,finishReason:l.finishReason,usage:c.usageMetadata?{promptTokens:c.usageMetadata.promptTokenCount||0,completionTokens:c.usageMetadata.candidatesTokenCount||0,totalTokens:c.usageMetadata.totalTokenCount||0}:void 0}}async*generateStream(e,t){const n=this.mergeOptions(t),s=`/models/${this.config.model}:streamGenerateContent`,a={contents:this.formatMessages(e),generationConfig:{temperature:n.temperature,maxOutputTokens:n.maxTokens,topP:n.topP}},o=await this.callEndpoint(s,a,t?.signal);if(!o.ok){const u=await this.parseError(o);throw new Error(u)}const c=o.body?.getReader();if(!c)throw new Error("No response body");const l=new TextDecoder;let d="";try{for(;;){const{done:u,value:p}=await c.read();if(u)break;d+=l.decode(p,{stream:!0});const m=d.split(`
`);d=m.pop()||"";for(const y of m){const f=y.trim();if(!(!f||!f.startsWith("data: ")))try{const g=f.slice(6),S=JSON.parse(g).candidates[0];if(!S)continue;const B=S.content?.parts?.[0]?.text;B&&(yield{content:B,done:!1}),S.finishReason&&(yield{content:"",done:!0,finishReason:S.finishReason})}catch{}}}}finally{c.releaseLock()}}async testConnection(){const e=performance.now();try{const t=`/models/${this.config.model}:generateContent`,n={contents:[{role:"user",parts:[{text:"test"}]}],generationConfig:{maxOutputTokens:1}},s=await this.callEndpoint(t,n),a=performance.now()-e;return s.ok?{success:!0,latency_ms:a,model_info:{name:this.config.model}}:{success:!1,latency_ms:a,error:await this.parseError(s)}}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}async parseError(e){try{const t=await e.json();return t.error?.message||t.error?.status||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}class ga extends Ht{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||"https://api.anthropic.com"}getHeaders(){return Ae("anthropic",this.config.apiKey,{contentType:"application/json"})}formatMessages(e){const t=[];for(const n of e)n.role!=="system"&&t.push({role:n.role==="assistant"?"assistant":"user",content:n.content});return t}getSystemPrompt(e){return e.find(n=>n.role==="system")?.content}async generate(e,t){const n=this.mergeOptions(t),s=this.getSystemPrompt(e),a=this.formatMessages(e),o={model:this.config.model,messages:a,max_tokens:n.maxTokens||4096,temperature:n.temperature};s&&(o.system=s),n.topP!==void 0&&(o.top_p=n.topP);const c=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(t?.signal),method:"POST",headers:this.getHeaders(),body:JSON.stringify(o)});if(!c.ok){const u=await this.parseError(c);throw new Error(u)}const l=await c.json(),d=l.content.find(u=>u.type==="text");if(!d)throw new Error("No text content in response");return{content:d.text,finishReason:l.stop_reason||void 0,usage:{promptTokens:l.usage.input_tokens,completionTokens:l.usage.output_tokens,totalTokens:l.usage.input_tokens+l.usage.output_tokens}}}async*generateStream(e,t){const n=this.mergeOptions(t),s=this.getSystemPrompt(e),a=this.formatMessages(e),o={model:this.config.model,messages:a,max_tokens:n.maxTokens||4096,temperature:n.temperature,stream:!0};s&&(o.system=s),n.topP!==void 0&&(o.top_p=n.topP);const c=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(t?.signal),method:"POST",headers:Ae("anthropic",this.config.apiKey,{contentType:"application/json",accept:"text/event-stream"}),body:JSON.stringify(o)});if(!c.ok){const p=await this.parseError(c);throw new Error(p)}const l=c.body?.getReader();if(!l)throw new Error("No response body");const d=new TextDecoder;let u="";try{for(;;){const{done:p,value:m}=await l.read();if(p)break;u+=d.decode(m,{stream:!0});const y=u.split(`
`);u=y.pop()||"";for(const f of y){const g=f.trim();if(!(!g||!g.startsWith("data: ")))try{const O=g.slice(6),S=JSON.parse(O);S.type==="content_block_delta"&&S.delta?.text&&(yield{content:S.delta.text,done:!1}),S.type==="message_delta"&&S.delta?.stop_reason&&(yield{content:"",done:!0,finishReason:S.delta.stop_reason}),S.type==="message_stop"&&(yield{content:"",done:!0})}catch{}}}}finally{l.releaseLock()}}async testConnection(){const e=performance.now();try{const t=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(),method:"POST",headers:this.getHeaders(),body:JSON.stringify({model:this.config.model,messages:[{role:"user",content:"Hi"}],max_tokens:1})}),n=performance.now()-e;return t.ok?{success:!0,latency_ms:n,model_info:{name:this.config.model}}:{success:!1,latency_ms:n,error:await this.parseError(t)}}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}async parseError(e){try{return(await e.json()).error?.message||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}const Ie="eidolon.web.config",We=["bpui.web.config"],ge="eidolon.web.apiKeys",Ne=["bpui.web.apiKeys"],Re="eidolon.web.apiKeys.persist",qe=["bpui.web.apiKeys.persist"],Xr="eidolon:config-changed";let $={};const ya={generator:"blueprints/system/generator.md",rpbotgenerator:"blueprints/system/generator.md",seed_generator:"blueprints/system/seed_generator.md",offspring_generator:"blueprints/system/offspring_generator.md",lorebook_generator:"blueprints/system/lorebook_generator.md",worldbook_generator:"blueprints/system/lorebook_generator.md",intro_scene:"blueprints/system/intro_scene.md"},ba=[/^window\.fetch:/i,/cannot convert value in record<bytestring/i,/^bearer\s+window\.fetch:/i];function ot(r){return r.replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[\u200B-\u200D\uFEFF]/g,"").trim().replace(/^['"]+|['"]+$/g,"")}function Qr(r){return!r||/[^\x20-\x7E]/.test(r)||/\r|\n/.test(r)?!0:ba.some(e=>e.test(r))}function xt(r){for(const e of r){const t=localStorage.getItem(e);if(t!==null)return{value:t,sourceKey:e}}return null}function _a(r,e){for(const t of e)t!==r&&localStorage.removeItem(t)}function ye(r,e,t){localStorage.setItem(r,t),_a(r,e)}function Ve(r){for(const e of r)localStorage.removeItem(e)}function be(){typeof window>"u"||window.dispatchEvent(new Event(Xr))}function oe(r){return Object.fromEntries(Object.entries(r).map(([e,t])=>[e,typeof t=="string"?ot(t):t]).filter(([,e])=>typeof e=="string"&&!Qr(e)).filter(([,e])=>typeof e=="string"&&e.length>0))}function dr(r){return r&&Object.fromEntries(Object.entries(r).map(([e,t])=>typeof t!="string"||t.length===0?[e,t]:[e,ya[t]??t]))}let _e=!1;function kt(){return{first_run_completed:!1,show_inline_tips:!0,completed_guides:[],dismissed_tips:[],completed_tours:[]}}class wa{config;options;constructor(e={}){this.options={persistApiKeys:!1,...e},_e=this.loadPersistPreference(this.options.persistApiKeys||!1),this.config=this.loadConfig(),this.loadPersistedApiKeys()}mergeConfig(e){const t=this.getDefaultConfig();return{...t,...e,batch:{...t.batch,...e.batch??{}},help:e.help?{...t.help,...e.help}:t.help,feature_blueprints:{...t.feature_blueprints,...dr(e.feature_blueprints)??{}}}}loadPersistPreference(e){try{const t=xt([Re,...qe]);if(t&&t.sourceKey!==Re&&ye(Re,qe,t.value),t?.value==="true")return!0;if(t?.value==="false")return!1}catch{}return e}savePersistPreference(e){try{ye(Re,qe,String(e))}catch(t){console.warn("Failed to save API key persistence preference:",t)}}loadConfig(){try{const e=xt([Ie,...We]);if(e){const t=this.mergeConfig(JSON.parse(e.value));return e.sourceKey!==Ie&&ye(Ie,We,JSON.stringify(t)),t}}catch{}return this.getDefaultConfig()}saveConfig(){try{ye(Ie,We,JSON.stringify(this.config)),be()}catch(e){console.warn("Failed to save config to localStorage:",e)}}getDefaultConfig(){return{engine:"openai_compatible",engine_mode:"auto",model:"openrouter/openai/gpt-4o-mini",temperature:.7,max_tokens:4096,api_keys:{},batch:{max_concurrent:3,rate_limit_delay:1},help:kt(),feature_blueprints:{orchestration:"blueprints/system/generator.md",seed_generation:"blueprints/system/seed_generator.md",offspring_generation:"blueprints/system/offspring_generator.md",worldbook_generation:"blueprints/system/lorebook_generator.md",intro_scene_generation:"blueprints/system/intro_scene.md"}}}getConfig(){return this.mergeConfig(this.config)}getHelpState(){return{...this.config.help??kt(),completed_guides:[...this.config.help?.completed_guides??[]],dismissed_tips:[...this.config.help?.dismissed_tips??[]],completed_tours:[...this.config.help?.completed_tours??[]]}}getApiKeys(){return oe($)}getApiKey(e){const t=$[e];return typeof t=="string"?ot(t):void 0}setApiKey(e,t){const n=ot(t);n?$[e]=n:delete $[e],this.persistApiKeysIfNeeded(),be()}setApiKeys(e){$={...oe($),...oe(e)},this.persistApiKeysIfNeeded(),be()}replaceApiKeys(e){$=oe(e),this.persistApiKeysIfNeeded(),be()}clearApiKey(e){delete $[e],this.persistApiKeysIfNeeded(),be()}clearAllApiKeys(){$={},this.persistApiKeysIfNeeded(),be()}loadPersistedApiKeys(){if(_e)try{const e=xt([ge,...Ne]);if(e){const t=oe(JSON.parse(e.value));$=t,e.sourceKey!==ge&&ye(ge,Ne,JSON.stringify(t))}}catch{}}persistApiKeysIfNeeded(){if(_e)try{ye(ge,Ne,JSON.stringify(oe($)))}catch(e){console.warn("Failed to persist API keys:",e)}}setPersistApiKeys(e){if(_e=e,this.savePersistPreference(e),e)this.persistApiKeysIfNeeded();else try{Ve([ge,...Ne])}catch{}}isPersistingApiKeys(){return _e}exportApiKeys(){return JSON.stringify(oe($),null,2)}importApiKeys(e){try{const t=JSON.parse(e);$=oe(t),this.persistApiKeysIfNeeded()}catch{throw new Error("Invalid API keys JSON")}}updateConfig(e){this.config=this.mergeConfig({...this.config,...e,batch:{...this.config.batch,...e.batch??{}},help:{...this.getHelpState(),...e.help??{}},feature_blueprints:{...this.config.feature_blueprints??{},...dr(e.feature_blueprints)??{}}}),this.saveConfig()}updateHelpState(e){this.updateConfig({help:{...this.getHelpState(),...e}})}resetHelpState(){this.updateConfig({help:kt()})}resetConfig(){this.config=this.getDefaultConfig(),this.saveConfig()}exportConfig(){const e={config:this.config,version:"1.0",exportedAt:new Date().toISOString()};return JSON.stringify(e,null,2)}importConfig(e){try{const t=JSON.parse(e);t.config&&(this.config=this.mergeConfig(t.config),this.saveConfig())}catch{throw new Error("Invalid configuration JSON")}}clearAll(){this.config=this.getDefaultConfig(),$={},_e=!1;try{Ve([Ie,...We]),Ve([ge,...Ne]),Ve([Re,...qe])}catch{}}}const it=Xr,T=new wa;function va(r,e,t){if(r==="ollama")return;if(typeof e=="string"&&e.trim().length>0)return e;const n=t?.[r];return typeof n=="string"&&n.trim().length>0?n:Object.values(t??{}).find(s=>typeof s=="string"&&s.trim().length>0)}function Ee(r){const{model:e,apiKey:t,apiKeys:n,provider:s,baseUrl:a,proxyKey:o,temperature:c,maxTokens:l}=r,d=s??Gt(e),u={provider:d,model:e,apiKey:va(d,t,n),baseUrl:a,proxyKey:o,temperature:c,maxTokens:l};switch(d){case"google":return new fa(u);case"anthropic":return new ga(u);case"openai":case"openrouter":case"deepseek":case"zai":case"moonshot":case"ollama":default:return new ma(u)}}function Ae(r,e,t={}){const n={};t.contentType&&(n["Content-Type"]=t.contentType),t.accept&&(n.Accept=t.accept);const s=typeof e=="string"?ot(e):void 0;if(s){if(Qr(s))throw new Error("Configured API key is invalid or corrupted. Re-enter it in Settings and try again.");switch(r){case"anthropic":n["x-api-key"]=s,n["anthropic-version"]="2023-06-01";break;case"google":n["x-goog-api-key"]=s;break;default:n.Authorization=`Bearer ${s}`;break}}return r==="openrouter"&&(n["HTTP-Referer"]=typeof window<"u"?window.location.origin:"https://eidolon-simulacra.app",n["X-OpenRouter-Title"]="Eidolon Simulacra"),n}function xa(r){switch(r){case"openai":return"https://api.openai.com/v1";case"google":return"https://generativelanguage.googleapis.com/v1beta";case"openrouter":return"https://openrouter.ai/api/v1";case"anthropic":return"https://api.anthropic.com";case"deepseek":return"https://api.deepseek.com";case"zai":return"https://open.bigmodel.cn/api/paas/v4";case"moonshot":return"https://api.moonshot.cn/v1";case"ollama":return"http://localhost:11434/v1";default:return"https://api.openai.com/v1"}}const ur={openai:["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo","o1-preview"],google:["gemini-2.0-flash-exp","gemini-2.0-flash-thinking-exp","gemini-1.5-pro","gemini-1.5-flash"],openrouter:["anthropic/claude-3.5-sonnet","anthropic/claude-3.5-haiku","google/gemini-pro-1.5","openai/gpt-4o-mini"],anthropic:["claude-3.5-sonnet","claude-3.5-haiku","claude-3-opus"],deepseek:["deepseek-chat","deepseek-coder"],zai:["glm-4","glm-4-flash"],moonshot:["moonshot-v1-8k","moonshot-v1-32k","moonshot-v1-128k"],ollama:["llama3.2","llama3.1","mistral","codellama","qwen2.5","phi3","gemma2"]},Zr=`# Blueprints\r
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
`,en=`---\r
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
`,tn=`---\r
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
`,rn=`---\r
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
`,nn=`---\r
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
`,sn=`---\r
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
`,an=`---\r
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
`,on=`---\r
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
`,cn=`---\r
name: A1111\r
description: Five-field Danbooru-tag prompt layout for image generation. Adapted for SDXL dual-encoder (ComfyUI / Illustrious).\r
invokable: true\r
always: false\r
version: 2.1\r
feature_category: generation\r
---\r
\r
# A1111 Tag Prompt Layout\r
\r
<a1111_generation_protocol>\r
\r
<core_execution>\r
Output_Type = "Raw_Plaintext_ONLY"\r
Markdown_Bypass = TRUE -> STRICTLY_PROHIBITED: (Code_Fences, Headings, Bullet_Points, Conversational_Text)\r
Line_Count = EXACTLY_5\r
Line_Order = [1_person, 2_clothes, 3_location, 4_action, 5_anchor]\r
Syntax_Rules = [Comma_Separated, NO_Trailing_Commas, One_Tag_Per_Concept, Compact_Density_Over_Sentences]\r
</core_execution>\r
\r
<tag_lexicon_mandate>\r
Allowed_Lexicon = REAL_DANBOORU_TAGS_ONLY\r
Banned_Formats = [Pseudo_Tags, Natural_Language, Sentences, Invented_Descriptors, Synonym_Piles, Full_Control_Template_Expansion]\r
Logic_Gate: IF (Tag == Redundant) -> OMIT_DUPLICATE (e.g., KEEP small_breasts, OMIT flat_chest)\r
Quality_Bias = [Warm_Bright_Lighting(Default_Unless_Dim_Tagged), High_Visibility_Details]\r
Verification_Rule: IF (Danbooru_API_post_count == 0) -> DISCARD_TAG(Dead_Tag)\r
</tag_lexicon_mandate>\r
\r
<field_mapping>\r
Person_Matrix = [Subject_Count, Age_Descriptor, Role, Heritage/Species, Body_Type, Core_Visual_Read]\r
Clothes_Matrix = [Outfit_Silhouette, Fabrics/Materials, Color_Palette, Accessories]\r
Location_Matrix = [Environment_Type, Scene_Mood, Time/Weather/Lighting_Source]\r
Action_Matrix = [Pose/Framing, Facial_Expression, Hand/Body_Gesture, Prop_Interaction]\r
Anchor_Matrix = [Render_Style, Palette_Bias, Emotional_Tone, Camera_Feel/Texture, Scene_Category_Tags]\r
Anchor_Constraint = MUST_PLACE(Scene_Category_Tags -> VERY_END_OF_ANCHOR_LINE)\r
</field_mapping>\r
\r
<dual_encoder_sync>\r
Target = SDXL_Architecture (ComfyUI/Illustrious)\r
Sync_Requirement = TRUE\r
Execution = MUST_DUPLICATE_STRINGS(person_encoder == anchor_encoder)\r
Constraint = "Both Person (227) and Anchor (231) nodes MUST receive the same text. All 5 lines form ONE continuous prompt. Copy 'person' line for the positive prompt, copy 'anchor' line for the second encoder input."\r
</dual_encoder_sync>\r
\r
<reference_handling>\r
Reference_Inputs = OPTIONAL\r
Purpose = "Use provided references only as continuity anchors for visible props, insignia, environment, emotional tone, or off-screen affiliations"\r
Subject_Count_Lock = "Do NOT add extra visible people, pairings, or group-scene tags just because references exist"\r
Identity_Distinction = "The current character remains the sole visual subject unless the active asset context explicitly demands otherwise"\r
Reuse_Rule = "Reference details may inform clothing motifs, faction symbols, keepsakes, setting tags, scars, letters, gifts, or mood when they would actually be visible in-frame"\r
Conflict_Rule = "IF (Reference detail clutters the image OR contradicts the active character sheet) -> Omit_That_Detail"\r
</reference_handling>\r
\r
</a1111_generation_protocol>\r
\r
---\r
\r
## USAGE NOTE\r
\r
The final output must be only the five tag lines. No commentary, headings, extra labels, or code fences. \`person\` and \`anchor\` lines (including all five lines' content) must be passed to both CLIP encoders in the SDXL dual-encoder setup.\r
\r
---\r
\r
## TAG VERIFICATION\r
\r
Before using any tag, verify it's real via the Danbooru API:\r
\r
\`\`\`bash\r
curl -s "https://danbooru.donmai.us/tags.json?search[name]=TAGNAME&limit=1"\r
# post_count = 0 → dead tag, don't use it\r
\`\`\`\r
\r
**Canonical reference:** \`creative/comfyui\` skill → \`references/danbooru-tag-reference.md\` — 200+ mappings with post counts, pseudo-tag corrections, and two-character composition patterns.\r
`,ln=`---\r
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
`,dn=`---\r
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
`,un=`---\r
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
`,pn=`---\r
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
`,mn=`---\r
name: Intro Scene\r
description: Generate an engaging, unhurried entry scene that initiates interaction.\r
invokable: true\r
always: false\r
version: 3.3\r
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
  Narrative_Person = "Second-person ONLY"\r
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
`,hn=`---\r
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
Write the lorebook packet that proves those drafts belong to the same world.`,fn=`---\r
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
`,gn=`---\r
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
`,yn=`---\r
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
`,bn=`---\r
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
    Perspective = "Maintain strict in-character perspective at all times"\r
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
`,ka=`[template]\r
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
`,Sa="eidolon.web.blueprints.overrides",Ea=["bpui.web.blueprints.overrides"],Ta=Object.assign({"../../../../../blueprints/README.md":Zr,"../../../../../blueprints/examples/a1111_sdxl_comfyui.md":en,"../../../../../blueprints/examples/generic_character_sheet.md":tn,"../../../../../blueprints/examples/generic_initial_message.md":rn,"../../../../../blueprints/examples/generic_intro_page.md":nn,"../../../../../blueprints/examples/generic_intro_scene.md":sn,"../../../../../blueprints/examples/generic_post_history.md":an,"../../../../../blueprints/examples/generic_system_prompt.md":on,"../../../../../blueprints/system/a1111.md":cn,"../../../../../blueprints/system/a1111_old.md":ln,"../../../../../blueprints/system/character_sheet.md":dn,"../../../../../blueprints/system/generator.md":un,"../../../../../blueprints/system/intro_page.md":pn,"../../../../../blueprints/system/intro_scene.md":mn,"../../../../../blueprints/system/lorebook_generator.md":hn,"../../../../../blueprints/system/offspring_generator.md":fn,"../../../../../blueprints/system/post_history.md":gn,"../../../../../blueprints/system/seed_generator.md":yn,"../../../../../blueprints/system/system_prompt.md":bn}),Aa={generator:"system/generator.md",rpbotgenerator:"system/generator.md",seed_generator:"system/seed_generator.md",offspring_generator:"system/offspring_generator.md",lorebook_generator:"system/lorebook_generator.md",worldbook_generator:"system/lorebook_generator.md",system_prompt:"system/system_prompt.md",post_history:"system/post_history.md",character_sheet:"system/character_sheet.md",intro_scene:"system/intro_scene.md",intro_page:"system/intro_page.md",a1111:"system/a1111.md"};function Ca(r){const e=r.replace(/^\/+/,"").replace(/^blueprints\//,"");return e.endsWith(".md")?e:Aa[e]??`${e}.md`}function Oa(r){if(!(typeof window>"u"))for(const e of[Sa,...Ea]){const t=window.localStorage.getItem(e);if(t)try{const s=JSON.parse(t)[r];if(typeof s=="string"&&s.trim().length>0)return s}catch{continue}}}function Ia(r){const e=`../../../../../${r}`;return Ta[e]}const _n="/blueprints";async function wn(r,e=_n){const t=Ca(r),n=`blueprints/${t}`,s=`${e}/${t}`,a=Oa(n);if(a)return a;const o=Ia(n);if(o)return o;try{const c=await fetch(s);if(!c.ok)throw new Error(`Blueprint not found: ${t}`);return await c.text()}catch(c){throw new Error(`Failed to load blueprint '${r}': ${c instanceof Error?c.message:"Unknown error"}`)}}const Na={orchestration:"blueprints/system/generator.md",seed_generation:"blueprints/system/seed_generator.md",offspring_generation:"blueprints/system/offspring_generator.md",worldbook_generation:"blueprints/system/lorebook_generator.md",intro_scene_generation:"blueprints/system/intro_scene.md"};async function ht(r,e,t=_n){const s=T.getConfig().feature_blueprints?.[r],a=Na[r],o=e||s||a;if(!o)throw new Error(`No blueprint configured for feature: ${r}`);return wn(o,t)}function Kt(r){const e=r.replace(/\r\n?/g,`
`),t=e.match(/^---\n([\s\S]*?)\n---/);if(!t){const o=e.match(/^#\s+(.+)$/m),c=e.split(`
`).map(l=>l.trim()).find(l=>l.length>0&&!l.startsWith("#")&&!l.startsWith("```"));return{name:o?.[1]?.trim()||"Untitled Blueprint",description:c||"No description",invokable:!1,version:"1.0"}}const n=t[1],s={},a=n.split(`
`);for(const o of a){const c=o.match(/^(\w+):\s*(.+)$/);if(c){const[,l,d]=c;d.toLowerCase()==="true"?s[l]=!0:d.toLowerCase()==="false"?s[l]=!1:s[l]=d.replace(/^['"]|['"]$/g,"")}}return{name:String(s.name||"unknown"),description:String(s.description||""),invokable:!!s.invokable,version:String(s.version||"1.0"),feature_category:s.feature_category}}function vn(r){return r.assets.map(e=>({name:e.name,required:e.required,dependsOn:e.depends_on,description:e.description,blueprintFile:e.blueprint_file}))}function xn(r){const e=new Set,t=new Set,n=[],s=a=>{if(e.has(a))return;if(t.has(a))throw new Error(`Circular dependency detected involving ${a}`);t.add(a);const o=r.find(c=>c.name===a);if(o)for(const c of o.dependsOn)s(c);t.delete(a),e.add(a),n.push(a)};for(const a of r)s(a.name);return n}const Rt="eidolon.web.templates.custom",Pt=["bpui.web.templates.custom"],kn="eidolon.web.blueprints.overrides",Sn=["bpui.web.blueprints.overrides"],En=Object.assign({"../../../../../blueprints/README.md":Zr,"../../../../../blueprints/examples/a1111_sdxl_comfyui.md":en,"../../../../../blueprints/examples/generic_character_sheet.md":tn,"../../../../../blueprints/examples/generic_initial_message.md":rn,"../../../../../blueprints/examples/generic_intro_page.md":nn,"../../../../../blueprints/examples/generic_intro_scene.md":sn,"../../../../../blueprints/examples/generic_post_history.md":an,"../../../../../blueprints/examples/generic_system_prompt.md":on,"../../../../../blueprints/system/a1111.md":cn,"../../../../../blueprints/system/a1111_old.md":ln,"../../../../../blueprints/system/character_sheet.md":dn,"../../../../../blueprints/system/generator.md":un,"../../../../../blueprints/system/intro_page.md":pn,"../../../../../blueprints/system/intro_scene.md":mn,"../../../../../blueprints/system/lorebook_generator.md":hn,"../../../../../blueprints/system/offspring_generator.md":fn,"../../../../../blueprints/system/post_history.md":gn,"../../../../../blueprints/system/seed_generator.md":yn,"../../../../../blueprints/system/system_prompt.md":bn}),Ra=Object.assign({"../../../../../blueprints/templates/official_v2v3/template.toml":ka});function ft(r){return typeof r=="object"&&r!==null&&!Array.isArray(r)}function pr(r){return ft(r)&&typeof r.name=="string"&&typeof r.version=="string"&&Array.isArray(r.assets)}function mr(r){return ft(r)?Object.fromEntries(Object.entries(r).filter(e=>typeof e[1]=="string")):{}}function Pa(r){return ft(r)?pr(r.template)?{template:r.template,blueprint_contents:mr(r.blueprint_contents),template_root:typeof r.template_root=="string"?r.template_root:void 0}:pr(r)?{template:r,blueprint_contents:mr(r.blueprint_contents),template_root:typeof r.template_root=="string"?r.template_root:void 0}:null:null}function ja(r){return(Array.isArray(r)?r:ft(r)?Object.values(r):[]).map(Pa).filter(t=>!!t)}function Da(r){const t=r.replace(/\\/g,"/").split("/"),n=[];for(const s of t)if(!(!s||s===".")){if(s===".."){n.length>0&&n.pop();continue}n.push(s)}return n.join("/")}function hr(r){return Da(r.replace(/^\/+/,""))}function La(r,e){const t=hr(e);return t.startsWith("blueprints/")||!r?t:hr(`${r}/${t}`)}function we(r){return r.trim().replace(/^"|"$/g,"")}function fr(r){const e=[],t=/"([^"]*)"/g;let n=t.exec(r);for(;n;)e.push(n[1]),n=t.exec(r);return e}function Fa(r){const t=r.replace(/\r\n?/g,`
`).split(`
`);let n=null,s=null,a="",o="1.0.0",c="";const l=[];let d=null;for(const p of t){const m=p.trim();if(!m||m.startsWith("#"))continue;if(m==="[template]"){n="template",s=null;continue}if(m==="[[assets]]"){d={name:"",required:!1,depends_on:[],description:""},l.push(d),n="assets",s=null;continue}if(s&&d){if(m==="]"){s=null;continue}d.depends_on.push(...fr(m));continue}const y=m.match(/^([A-Za-z0-9_]+)\s*=\s*(.+)$/);if(!y)continue;const[,f,g]=y;if(n==="template"){f==="name"?a=we(g):f==="version"?o=we(g):f==="description"&&(c=we(g));continue}if(!(n!=="assets"||!d))if(f==="name")d.name=we(g);else if(f==="required")d.required=g.trim()==="true";else if(f==="depends_on"){const O=g.trim();O==="["?s="depends_on":d.depends_on=fr(O)}else f==="description"?d.description=we(g):f==="blueprint_file"&&(d.blueprint_file=we(g))}const u=l.filter(p=>p.name.trim().length>0);return!a.trim()||u.length===0?null:{name:a,version:o,description:c,is_official:!0,assets:u}}function Ma(){const r=Object.entries(Ra).map(([n,s])=>{const a=Fa(s);if(!a)return null;const c=n.replace(/^.*\/blueprints\//,"blueprints/").replace(/\/template\.toml$/i,"");return{template:a,blueprint_contents:{},template_root:c}}).filter(n=>!!n),e=r.find(n=>n.template_root?.endsWith("/official_v2v3"))?.template_root,t=[{template:{...Me,is_default:!0},blueprint_contents:{},template_root:e}];for(const n of r)n.template_root===e||n.template.name===Me.name||t.push(n);return t}function Ba(r){return r.trim().toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").replace(/_+/g,"_").replace(/^_+|_+$/g,"")}function gt(r){return r.blueprint_file??`${r.name}.md`}function Tn(r,e){if(typeof window>"u")return e;const t=Array.isArray(r)?[...r]:[r],[n,...s]=t;try{for(const a of t){const o=window.localStorage.getItem(a);if(!o)continue;const c=JSON.parse(o);return a!==n&&(window.localStorage.setItem(n,JSON.stringify(c)),s.forEach(l=>window.localStorage.removeItem(l))),c}}catch{return e}return e}function zt(r,e,t){typeof window>"u"||(window.localStorage.setItem(r,JSON.stringify(t)),e.forEach(n=>window.localStorage.removeItem(n)))}function Ua(){const r=new Map;return Object.entries(En).forEach(([e,t])=>{const n=e.replace(/^.*\/blueprints\//,"blueprints/");if(n.split("/").pop()?.toLowerCase()==="readme.md")return;const a=Kt(t);let o="core";n.includes("/system/")?o="system":n.includes("/templates/")?o="template":n.includes("/examples/")&&(o="example"),r.set(n,{name:a.name,description:a.description,invokable:a.invokable,version:a.version,content:t,path:n,category:o,feature_category:a.feature_category})}),r}function ne(){return Tn([kn,...Sn],{})}function ve(r){zt(kn,Sn,r)}function An(r){return r.startsWith("blueprints/custom/")}function $a(r,e){const t=Ba(r)||"custom_blueprint",n=ue();let s=`blueprints/custom/${t}.md`,a=2;for(;s!==e&&n.has(s);)s=`blueprints/custom/${t}_${a}.md`,a+=1;return s}function ue(){const r=Ua(),e=ne();return Object.entries(e).forEach(([t,n])=>{const s=Kt(n),a=r.get(t);r.set(t,{name:s.name,description:s.description,invokable:s.invokable,version:s.version,content:n,path:t,category:a?.category??"core",feature_category:s.feature_category})}),r}function tt(r){const e=`../../../../../${r}`;return En[e]??null}function Ga(r){return r in ne()}function Be(r){if(!r)return"";const e=r.replace(/^\.?\//,""),t=e.replace(/\.(txt|md)$/i,"");return[...ue().values()].find(s=>s.path===e||s.path.endsWith(`/${e}`)||s.path.endsWith(`/${t}.md`))?.content??""}function Ha(r,e){const t=gt(e),n=t.split("/").pop()??t;return r[t]??r[n]??r[e.name]}function Wt(r){const e={};return r.template.assets.forEach(t=>{const n=gt(t),s=Ha(r.blueprint_contents,t);if(!s?.trim())return;const a=Be(n);a&&a===s||(e[n]=s)}),Object.entries(r.blueprint_contents).forEach(([t,n])=>{if(!n?.trim()||e[t])return;const s=Be(t);s&&s===n||(e[t]=n)}),{template:r.template,blueprint_contents:e,template_root:r.template_root}}function gr(r){const e=Wt(r),t={...e.blueprint_contents};return e.template.assets.forEach(n=>{const s=gt(n);if(!t[s]){const a=Be(s);a&&(t[s]=a)}}),{template:e.template,blueprint_contents:t,template_root:e.template_root}}function me(){const r=Tn([Rt,...Pt],[]),t=ja(r).map(Wt);return JSON.stringify(r)!==JSON.stringify(t)&&zt(Rt,Pt,t),t}function Ye(r){zt(Rt,Pt,r.map(Wt))}function qt(){return[...Ma().map(gr),...me().map(gr)]}function yr(r){if(r)return me().find(e=>e.template.name===r)}function re(r){if(r)return qt().find(e=>e.template.name===r)}function pe(r){return re(r)?.template}function Cn(r,e){const t=re(r);if(!t)return;const n=t.template.assets.find(o=>o.name===e);if(!n)return;const s=gt(n),a=La(t.template_root,s);return t.blueprint_contents[s]||t.blueprint_contents[a]||Be(a)||Be(s)||void 0}function ct(r,e){const t=pe(e),n=t?Jr(t).map(a=>a.name):["character_sheet"];return Js(r,n)??void 0}const Ka="EidolonSimulacraDB",On=["CharacterGeneratorDB"],za={drafts:"++id, reviewId, [metadata.character_name], createdAt, updatedAt, metadata.favorite, metadata.mode, metadata.genre",assets:"++id, draftId, assetName, createdAt",tags:"++id, tag, draftId"};function W(r){return typeof r=="object"&&r!==null}function lt(){return`imported-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}function In(r){return typeof r.archived_at=="string"&&r.archived_at.trim().length>0}function Z(r,e={}){if(e.includeArchived)return!0;const t=In(r);return e.archivedOnly?t:!t}function Wa(r){if(!(r!=="SFW"&&r!=="NSFW"&&r!=="Platform-Safe"&&r!=="Auto"))return r}function br(r){if(!Array.isArray(r))return;const e=r.filter(t=>typeof t=="string").map(t=>t.trim()).filter(t=>t.length>0);return e.length>0?e:void 0}function jt(r,e){if(!Array.isArray(e))return;const t=[],n=new Set;for(const s of e){if(typeof s!="string")continue;const a=s.trim();if(!(!a||a===r||n.has(a))&&(n.add(a),t.push(a),t.length>=zr))break}return t.length>0?t:void 0}function qa(r){let e=lt();for(;r.has(e);)e=lt();return e}function Nn(r,e){const t=W(r)?r:{},n=typeof t.review_id=="string"?t.review_id:typeof t.reviewId=="string"?t.reviewId:"",s=n.trim().length>0?n:lt(),a=typeof t.seed=="string"?t.seed:"",o=a.trim().length>0?a:e,c={review_id:s,seed:o,favorite:!!t.favorite};c.mode=Wa(t.mode),typeof t.model=="string"&&(c.model=t.model),typeof t.created=="string"?c.created=t.created:typeof t.createdAt=="string"&&(c.created=t.createdAt),typeof t.modified=="string"?c.modified=t.modified:typeof t.updatedAt=="string"&&(c.modified=t.updatedAt),Array.isArray(t.tags)&&(c.tags=t.tags.filter(m=>typeof m=="string")),typeof t.genre=="string"&&(c.genre=t.genre),typeof t.notes=="string"&&(c.notes=t.notes),typeof t.custom_instructions=="string"?c.custom_instructions=t.custom_instructions:typeof t.customInstructions=="string"&&(c.custom_instructions=t.customInstructions);const l=br(t.component_send_order)??br(t.componentSendOrder);l&&(c.component_send_order=l),typeof t.character_name=="string"?c.character_name=t.character_name:typeof t.characterName=="string"&&(c.character_name=t.characterName),typeof t.template_name=="string"?c.template_name=t.template_name:typeof t.templateName=="string"&&(c.template_name=t.templateName);const d=Array.isArray(t.parent_drafts)?t.parent_drafts:Array.isArray(t.parentDraftIds)?t.parentDraftIds:null;d&&(c.parent_drafts=d.filter(m=>typeof m=="string"));const u=Array.isArray(t.connected_drafts)?t.connected_drafts:Array.isArray(t.connectedDraftIds)?t.connectedDraftIds:null,p=jt(s,u);return p&&(c.connected_drafts=p),typeof t.offspring_type=="string"?c.offspring_type=t.offspring_type:typeof t.offspringType=="string"&&(c.offspring_type=t.offspringType),c}function Je(r,e="Imported draft"){if(!W(r)||!W(r.assets))return null;const t={};for(const[a,o]of Object.entries(r.assets))typeof o=="string"&&(t[a]=o);if(Object.keys(t).length===0)return null;const n=Nn(W(r.metadata)?r.metadata:r,e),s=typeof r.path=="string"&&r.path.trim().length>0?r.path:typeof r.reviewId=="string"&&r.reviewId.trim().length>0?r.reviewId:n.review_id;return{metadata:n,assets:t,path:s}}function Va(r){if(Array.isArray(r))return r.map(t=>Je(t)).filter(t=>t!==null);if(!W(r))return[];if(Array.isArray(r.drafts))return r.drafts.map(t=>Je(t)).filter(t=>t!==null);if(W(r.draft)){const t=Je(r.draft);return t?[t]:[]}const e=Je(r);return e?[e]:[]}function Ya(r){return Array.isArray(r)?r.length===0:W(r)&&Array.isArray(r.drafts)&&r.drafts.length===0}function Ja(r){return Array.isArray(r)?!0:W(r)?Array.isArray(r.drafts)||W(r.draft)||W(r.assets)||W(r.metadata)||typeof r.reviewId=="string"||typeof r.review_id=="string":!1}function Xa(r){return r.trim().toLowerCase().replace(/\s+/g,"_")}function Qa(r){const t=r.match(/^#\s+(.+)$/m)?.[1]?.trim()||"Imported draft",n=/^##\s+(.+)$/gm,s=[];let a;for(;(a=n.exec(r))!==null;)s.push({title:a[1].trim(),start:a.index,bodyStart:n.lastIndex});if(s.length===0)return[];const o={};let c;for(let d=0;d<s.length;d+=1){const u=s[d],p=s[d+1],y=r.slice(u.bodyStart,p?p.start:r.length).replace(/^\n+/,"").trimEnd().replace(/^\\##/gm,"##");if(!y)continue;if(u.title.trim().toLowerCase()==="metadata"){try{c=JSON.parse(y)}catch{}continue}const f=Xa(u.title);o[f]=y}if(Object.keys(o).length===0)return[];const l=Nn(c,t);return[{path:l.review_id,metadata:l,assets:o}]}function Za(r,e){const t=lt(),n=r.name.trim()||e?.replace(/\.[^.]+$/,"")||"Imported draft",s=e?`Imported from ${e}`:`Imported draft: ${n}`,a=r.sourcePreset||r.sourceFormat,o=Object.keys(r.unmappedFields||{}).length,c=o>0?`Imported from ${a}. Preserved ${o} unmapped field${o===1?"":"s"} in the upload preview.`:`Imported from ${a}.`;return{path:t,metadata:{review_id:t,seed:s,favorite:!1,character_name:n,template_name:Me.name,notes:c},assets:r.assets}}function eo(r,e){const t=la(r,e);return Object.keys(t.assets).length===0?[]:[Za(t,e)]}class Rn extends Fe{drafts;assets;tags;constructor(e){super(e),this.version(1).stores(za)}}const w=new Rn(Ka);let Xe=null;async function to(){if(!(typeof indexedDB>"u"||await w.drafts.count()>0))for(const e of On){if(!await Fe.exists(e))continue;const t=new Rn(e);try{await t.open();const n=await t.drafts.toArray();if(n.length===0)continue;const s=await t.assets.toArray(),a=await t.tags.toArray();await w.transaction("rw",w.drafts,w.assets,w.tags,async()=>{await w.drafts.bulkPut(n),s.length>0&&await w.assets.bulkPut(s),a.length>0&&await w.tags.bulkPut(a)}),t.close(),await Fe.delete(e);return}catch(n){console.warn(`Failed to migrate legacy draft database ${e}:`,n)}finally{t.close()}}}class P{static async ensureReady(){Xe||(Xe=to()),await Xe}static async saveDraft(e){await this.ensureReady();const t=Date.now(),n=ct(e.assets,e.metadata.template_name),s={...e.metadata,character_name:e.metadata.character_name||n,connected_drafts:jt(e.metadata.review_id,e.metadata.connected_drafts),created:e.metadata.created||new Date(t).toISOString(),modified:e.metadata.modified||new Date(t).toISOString()},a={reviewId:e.metadata.review_id,metadata:s,assets:e.assets,createdAt:s.created?new Date(s.created).getTime():t,updatedAt:s.modified?new Date(s.modified).getTime():t},o=await w.drafts.where("reviewId").equals(e.metadata.review_id).first();o&&(a.id=o.id),await w.transaction("rw",w.drafts,w.assets,w.tags,async()=>{await w.drafts.put(a),await w.assets.where("draftId").equals(e.metadata.review_id).delete(),await w.tags.where("draftId").equals(e.metadata.review_id).delete();const c=Object.entries(e.assets).map(([l,d])=>({draftId:e.metadata.review_id,assetName:l,content:d,createdAt:t}));if(await w.assets.bulkAdd(c),e.metadata.tags){const l=e.metadata.tags.map(d=>({tag:d,draftId:e.metadata.review_id,createdAt:t}));await w.tags.bulkAdd(l)}})}static async getDraft(e){await this.ensureReady();const t=await w.drafts.where("reviewId").equals(e).first();return t?{path:t.reviewId,metadata:t.metadata,assets:t.assets}:null}static async getAssetActivity(e){return await this.ensureReady(),(await w.assets.where("draftId").equals(e).toArray()).sort((n,s)=>s.createdAt-n.createdAt)}static async getAllDrafts(){return await this.ensureReady(),(await w.drafts.toArray()).filter(t=>Z(t.metadata)).map(t=>({path:t.reviewId,metadata:t.metadata,assets:t.assets}))}static async getAllDraftsWithOptions(e={}){return await this.ensureReady(),(await w.drafts.toArray()).filter(n=>Z(n.metadata,e)).map(n=>({path:n.reviewId,metadata:n.metadata,assets:n.assets}))}static async getAllMetadata(e={}){return await this.ensureReady(),(await w.drafts.toArray()).filter(n=>Z(n.metadata,e)).map(n=>n.metadata)}static async deleteDraft(e){await this.ensureReady(),await w.transaction("rw",w.drafts,w.assets,w.tags,async()=>{await w.drafts.where("reviewId").equals(e).delete(),await w.assets.where("draftId").equals(e).delete(),await w.tags.where("draftId").equals(e).delete()})}static async updateMetadata(e,t){await this.ensureReady();const n=await w.drafts.where("reviewId").equals(e).first();if(!n)throw new Error(`Draft ${e} not found`);const s=Date.now(),a=t.connected_drafts===void 0?void 0:jt(e,t.connected_drafts);if(n.metadata={...n.metadata,...t,connected_drafts:a??(t.connected_drafts===void 0?n.metadata.connected_drafts:void 0),modified:new Date(s).toISOString()},n.updatedAt=s,await w.drafts.put(n),t.tags!==void 0&&(await w.tags.where("draftId").equals(e).delete(),t.tags)){const o=t.tags.map(c=>({tag:c,draftId:e,createdAt:s}));await w.tags.bulkAdd(o)}}static async updateAsset(e,t,n,s={}){await this.ensureReady();const a=await w.drafts.where("reviewId").equals(e).first();if(!a)throw new Error(`Draft ${e} not found`);const o=Object.prototype.hasOwnProperty.call(a.assets,t),c=o?a.assets[t]:null;if(o&&s.overwrite===!1)throw new Error(`Asset ${t} already exists. Reload the draft before trying a different action.`);if(s.expectedPreviousContent!==void 0&&c!==s.expectedPreviousContent)throw o?new Error(`Asset ${t} changed since you loaded it. Reload the draft before overwriting it.`):new Error(`Asset ${t} was created after this session started. Reload the draft before saving.`);return a.assets[t]=n,a.updatedAt=Date.now(),a.metadata={...a.metadata,modified:new Date(a.updatedAt).toISOString(),character_name:ct(a.assets,a.metadata.template_name)||a.metadata.character_name},await w.drafts.put(a),await w.assets.where("draftId").equals(e).and(d=>d.assetName===t).modify({content:n,createdAt:a.updatedAt})===0&&await w.assets.add({draftId:e,assetName:t,content:n,createdAt:a.updatedAt}),o?"updated":"created"}static async searchDrafts(e,t={}){await this.ensureReady();const n=e.toLowerCase();return(await w.drafts.filter(a=>{if(!Z(a.metadata,t))return!1;const o=a.metadata.character_name?.toLowerCase()||"",c=a.metadata.seed?.toLowerCase()||"",l=a.metadata.notes?.toLowerCase()||"",d=a.metadata.genre?.toLowerCase()||"";return o.includes(n)||c.includes(n)||l.includes(n)||d.includes(n)}).toArray()).map(a=>a.metadata)}static async getDraftsByTag(e,t={}){await this.ensureReady();const n=await w.tags.where("tag").equals(e).toArray(),s=[...new Set(n.map(o=>o.draftId))];return(await w.drafts.where("reviewId").anyOf(s).toArray()).filter(o=>Z(o.metadata,t)).map(o=>o.metadata)}static async getAllTags(){await this.ensureReady();const e=await w.tags.toArray();return[...new Set(e.map(n=>n.tag))].sort()}static async getFavorites(e={}){return await this.ensureReady(),(await w.drafts.filter(n=>n.metadata.favorite===!0&&Z(n.metadata,e)).toArray()).map(n=>n.metadata)}static async getDraftsByMode(e,t={}){return await this.ensureReady(),(await w.drafts.where("metadata.mode").equals(e).toArray()).filter(s=>Z(s.metadata,t)).map(s=>s.metadata)}static async getDraftsByGenre(e,t={}){return await this.ensureReady(),(await w.drafts.where("metadata.genre").equals(e).toArray()).filter(s=>Z(s.metadata,t)).map(s=>s.metadata)}static async getStats(e={}){await this.ensureReady();const t=await w.drafts.toArray(),n=t.filter(o=>Z(o.metadata,e)),s=t.filter(o=>In(o.metadata)),a={total:n.length,archived:s.length,favorites:n.filter(o=>o.metadata.favorite).length,byMode:{},byGenre:{}};for(const o of n){const c=o.metadata.mode||"unknown",l=o.metadata.genre||"unknown";a.byMode[c]=(a.byMode[c]||0)+1,a.byGenre[l]=(a.byGenre[l]||0)+1}return a}static async exportAll(){await this.ensureReady();const e=await this.getAllDraftsWithOptions({includeArchived:!0}),t={version:"1.0",exportedAt:new Date().toISOString(),drafts:e};return JSON.stringify(t,null,2)}static async import(e,t={}){await this.ensureReady();const n=t.conflictStrategy??"remap",s=t.sourceName,a=e.trim();if(!a)throw new Error("Import file is empty");let o=[],c=!1,l;try{l=JSON.parse(a),c=Ja(l),o=Va(l)}catch{o=Qa(e)}if(o.length===0){if(l!==void 0&&Ya(l))return{imported:0,remapped:0};o=eo(e,s)}if(o.length===0){if(c)return{imported:0,remapped:0};throw new Error("Invalid draft import format. Supported: exported drafts JSON, combined markdown draft files, or raw text/JSON uploads.")}const d=await this.getAllMetadata({includeArchived:!0}),u=new Set(d.map(f=>f.review_id)),p=new Map;let m=0;const y=o.map(f=>{const g=f.metadata.review_id;let O=g;return n==="remap"&&u.has(O)&&(O=qa(u)),u.add(O),O!==g&&(m+=1,p.set(g,O)),{...f,path:O,metadata:{...f.metadata,review_id:O}}});for(const f of y){const g=f.metadata.parent_drafts?.map(S=>p.get(S)||S),O=f.metadata.connected_drafts?.map(S=>p.get(S)||S);await this.saveDraft({...f,metadata:{...f.metadata,parent_drafts:g,connected_drafts:O}})}return{imported:y.length,remapped:m}}static async clearAll(){await w.transaction("rw",w.drafts,w.assets,w.tags,async()=>{await w.drafts.clear(),await w.assets.clear(),await w.tags.clear()});for(const e of On)await Fe.exists(e)&&await Fe.delete(e);Xe=null}}const jc=Object.freeze(Object.defineProperty({__proto__:null,DraftStorage:P,db:w},Symbol.toStringTag,{value:"Module"}));function St(r){const e=r.trim(),t=e.match(/^```[^\r\n]*\r?\n([\s\S]*?)\r?\n```$/);return t?t[1]?.trim()??"":e}const _r="server-config",Et="server-access-token",Dt="auth-state-changed";function xe(r){return typeof r=="object"&&r!==null}function ro(r){return r==="SFW"||r==="NSFW"||r==="Platform-Safe"||r==="Auto"?r:void 0}function Y(r){if(typeof r!="string")return;const e=r.trim();return e.length>0?e:void 0}function no(r){if(!Array.isArray(r))return;const e=r.filter(t=>typeof t=="string").map(t=>t.trim()).filter(t=>t.length>0);return e.length>0?e:void 0}function wr(r){const e=Object.fromEntries(Object.entries(r.assets).filter(t=>{const[n,s]=t;return typeof n=="string"&&n.length>0&&typeof s=="string"}));return{reviewId:Y(r.metadata.review_id)??r.path,seed:Y(r.metadata.seed)??r.path,mode:ro(r.metadata.mode),model:Y(r.metadata.model),archivedAt:Y(r.metadata.archived_at),characterName:Y(r.metadata.character_name),templateName:Y(r.metadata.template_name),genre:Y(r.metadata.genre),notes:Y(r.metadata.notes),favorite:!!r.metadata.favorite,tags:Array.isArray(r.metadata.tags)?r.metadata.tags.filter(t=>typeof t=="string"&&t.trim().length>0):[],offspringType:Y(r.metadata.offspring_type),customInstructions:Y(r.metadata.custom_instructions),componentSendOrder:no(r.metadata.component_send_order),parentDraftIds:Array.isArray(r.metadata.parent_drafts)?r.metadata.parent_drafts.filter(t=>typeof t=="string"&&t.trim().length>0):void 0,connectedDraftIds:Array.isArray(r.metadata.connected_drafts)?r.metadata.connected_drafts.filter(t=>typeof t=="string"&&t.trim().length>0):void 0,assets:e}}function so(r){return xe(r)?Array.isArray(r.drafts)&&r.drafts.every(e=>xe(e)&&xe(e.metadata)&&xe(e.assets))?{drafts:r.drafts.map(wr)}:xe(r.metadata)&&xe(r.assets)?{drafts:[wr(r)]}:r:r}class ao{config;accessToken=null;refreshPromise=null;statusPromise=null;cachedStatus=null;statusCacheExpiresAt=0;constructor(){this.config=this.loadConfig(),this.accessToken=localStorage.getItem(Et)}loadConfig(){try{const e=localStorage.getItem(_r);if(e)return JSON.parse(e)}catch(e){console.error("Failed to load server config:",e)}return{url:"https://api.eidolonsimulacra.com",enabled:!1}}saveConfig(){localStorage.setItem(_r,JSON.stringify(this.config)),this.invalidateStatusCache()}getConfig(){return{...this.config}}setConfig(e){this.config={...this.config,...e},this.saveConfig()}invalidateStatusCache(){this.cachedStatus=null,this.statusCacheExpiresAt=0}isEnabled(){return this.config.enabled&&!!this.config.url}hasAccessToken(){return!!this.accessToken}setAccessToken(e){this.accessToken=e,localStorage.setItem(Et,e),this.invalidateStatusCache()}clearAccessToken(){this.accessToken=null,localStorage.removeItem(Et),this.invalidateStatusCache()}notifyAuthStateChanged(){window.dispatchEvent(new CustomEvent(Dt))}getAccessToken(){return this.accessToken}async refreshAccessToken(){if(this.refreshPromise)return this.refreshPromise;this.refreshPromise=this.doRefreshToken();try{return await this.refreshPromise}finally{this.refreshPromise=null}}async doRefreshToken(){const e=`${this.config.url}/api/auth/refresh`,t=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include"});if(!t.ok)throw this.clearAccessToken(),this.notifyAuthStateChanged(),new Error("Failed to refresh token");const n=await t.json();return this.setAccessToken(n.accessToken),n.accessToken}async request(e,t={},n=!0){const s=`${this.config.url}${e}`,a={"Content-Type":"application/json",...t.headers},o=this.getAccessToken();o&&(a.Authorization=`Bearer ${o}`);const c=await fetch(s,{...t,headers:a,credentials:"include"});if(c.status===401&&n&&e!=="/api/auth/refresh"&&e!=="/api/auth/login"&&e!=="/api/auth/register")try{return await this.refreshAccessToken(),this.request(e,t,!1)}catch{throw this.clearAccessToken(),new Error("Authentication expired. Please login again.")}return c}async register(e,t,n){const s=await this.request("/api/auth/register",{method:"POST",body:JSON.stringify({email:e,password:t,displayName:n})});if(!s.ok){const o=await s.json();throw new Error(o.error||"Registration failed")}const a=await s.json();return this.setAccessToken(a.accessToken),this.notifyAuthStateChanged(),a}async login(e,t){const n=await this.request("/api/auth/login",{method:"POST",body:JSON.stringify({email:e,password:t})});if(!n.ok){const a=await n.json();throw new Error(a.error||"Login failed")}const s=await n.json();return this.setAccessToken(s.accessToken),this.notifyAuthStateChanged(),s}async logout(){try{await this.request("/api/auth/logout",{method:"POST"})}catch(e){console.error("Logout request failed:",e)}finally{this.clearAccessToken(),this.notifyAuthStateChanged()}}async getCurrentUser(){const e=await this.request("/api/auth/me");if(!e.ok){if(e.status===401)throw this.clearAccessToken(),new Error("Not authenticated");const n=await e.json();throw new Error(n.error||"Failed to get user")}return(await e.json()).user}async updateProfile(e){const t=await this.request("/api/auth/me",{method:"PATCH",body:JSON.stringify(e)});if(!t.ok){const s=await t.json();throw new Error(s.error||"Failed to update profile")}return(await t.json()).user}async deleteAccount(){const e=await this.request("/api/auth/me",{method:"DELETE"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to delete account")}this.clearAccessToken()}async checkStatus(){if(!this.isEnabled())return{connected:!1,authenticated:!1};const e=Date.now();if(this.cachedStatus&&e<this.statusCacheExpiresAt)return this.cachedStatus;if(this.statusPromise)return this.statusPromise;this.statusPromise=this.computeStatus();try{const t=await this.statusPromise;return this.cachedStatus=t,this.statusCacheExpiresAt=Date.now()+15e3,t}finally{this.statusPromise=null}}isConnectivityError(e){return e instanceof TypeError?!0:e instanceof Error?/failed to fetch|networkerror|network error|load failed/i.test(e.message):!1}async computeStatus(){try{if(this.hasAccessToken())try{return{connected:!0,authenticated:!0,user:await this.getCurrentUser()}}catch(t){return this.isConnectivityError(t)?{connected:!1,authenticated:!1,error:t instanceof Error?t.message:"Unknown error"}:{connected:!0,authenticated:!1,error:t instanceof Error?t.message:"Authentication failed"}}return(await fetch(`${this.config.url}/api/health`,{method:"GET"})).ok?{connected:!0,authenticated:!1}:{connected:!1,authenticated:!1,error:"Server unreachable"}}catch(e){return{connected:!1,authenticated:!1,error:e instanceof Error?e.message:"Unknown error"}}}async syncDrafts(e,t){const n=e==="push",s=n?"/api/sync/drafts/push":"/api/sync/drafts",a=n?so(t):t,o=await this.request(s,{method:n?"POST":"GET",body:n?JSON.stringify(a):void 0});if(!o.ok){let c=`Failed to ${e} drafts`,l=null;try{const u=await o.json();if(c=u.error||c,l=u.error||null,u.details){const p=Object.entries(u.details).flatMap(([m,y])=>(y||[]).map(f=>`${m}: ${f}`)).join("; ");p&&(c=`${c} (${p})`)}}catch{}if(e==="pull"&&s!=="/api/sync/drafts"&&(o.status===404||o.status===400&&l==="Validation failed"))try{return await this.listRemoteDrafts()}catch{}throw new Error(c)}return o.json()}async listRemoteDrafts(){const e=await this.request("/api/sync/drafts/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote drafts")}return e.json()}async deleteRemoteDraft(e){const t=await this.request(`/api/sync/drafts/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete remote draft")}return t.json()}async syncThemes(e,t){const n=await this.request(`/api/sync/themes/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const s=await n.json();throw new Error(s.error||`Failed to ${e} themes`)}return n.json()}async listRemoteThemes(){const e=await this.request("/api/sync/themes/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote themes")}return e.json()}async deleteRemoteTheme(e){const t=await this.request(`/api/sync/themes/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete remote theme")}return t.json()}async syncTemplates(e,t){const n=await this.request(`/api/sync/templates/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const s=await n.json();throw new Error(s.error||`Failed to ${e} templates`)}return n.json()}async syncSeeds(e,t){const n=e==="push",s=n?"/api/sync/seeds/push":"/api/sync/seeds",a=await this.request(s,{method:n?"POST":"GET",body:n?JSON.stringify(t):void 0});if(!a.ok){const o=await a.json();throw new Error(o.error||`Failed to ${e} seeds`)}return a.json()}async syncArchivedSeedRuns(e,t){const n=e==="push",s=e==="list"?"/api/sync/seed-runs/list":n?"/api/sync/seed-runs/push":"/api/sync/seed-runs",a=await this.request(s,{method:n?"POST":"GET",body:n?JSON.stringify(t):void 0});if(!a.ok){const o=await a.json();throw new Error(o.error||`Failed to ${e} archived seed runs`)}return a.json()}async listRemoteTemplates(){const e=await this.request("/api/sync/templates/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote templates")}return e.json()}async deleteRemoteTemplate(e){const t=await this.request(`/api/sync/templates/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete remote template")}return t.json()}async pullConfig(){const e=await this.request("/api/sync/config",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to pull config")}return e.json()}async pushConfig(e){const t=await this.request("/api/sync/config",{method:"PUT",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to push config")}return t.json()}async pullApiKeys(){const e=await this.request("/api/sync/config/api-keys",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to pull API keys")}return e.json()}async pushApiKeys(e){const t=await this.request("/api/sync/config/api-keys",{method:"PUT",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to push API keys")}return t.json()}async sync(e,t,n){switch(e){case"drafts":return this.syncDrafts(t,n);case"themes":return this.syncThemes(t,n);case"templates":return this.syncTemplates(t,n);case"seeds":return this.syncSeeds(t,n);case"blueprints":return this.syncBlueprints(t,n);case"worlds":if(t==="list")throw new Error("World sync does not support list");return this.syncWorlds(t,n);case"timelines":if(t==="list")throw new Error("Timeline sync does not support list");return this.syncTimelines(t,n);default:throw new Error(`Unknown data type: ${e}`)}}async syncBlueprints(e,t){const n=await this.request(`/api/sync/blueprints/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const s=await n.json();throw new Error(s.error||`Failed to ${e} blueprints`)}return n.json()}async listRemoteBlueprints(){const e=await this.request("/api/sync/blueprints/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote blueprints")}return e.json()}async deleteRemoteBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete remote blueprint")}return t.json()}async getBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`);if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to get blueprint")}return t.json()}async createBlueprint(e){const t=await this.request("/api/sync/blueprints",{method:"POST",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to create blueprint")}return t.json()}async updateBlueprint(e,t){const n=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`,{method:"PUT",body:JSON.stringify(t)});if(!n.ok){const s=await n.json();throw new Error(s.error||"Failed to update blueprint")}return n.json()}async deleteBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete blueprint")}return t.json()}async duplicateBlueprint(e,t,n){const s=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}/duplicate`,{method:"POST",body:JSON.stringify({newPath:t,newName:n})});if(!s.ok){const a=await s.json();throw new Error(a.error||"Failed to duplicate blueprint")}return s.json()}async resetBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}/reset`,{method:"POST"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to reset blueprint")}return t.json()}async syncWorlds(e,t){const n=await this.request(`/api/sync/worlds/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const s=await n.json();throw new Error(s.error||`Failed to ${e} worlds`)}return n.json()}async getWorlds(e){const t=new URLSearchParams;e?.search&&t.set("search",e.search),e?.genre&&t.set("genre",e.genre),e?.includePublic!==void 0&&t.set("includePublic",String(e.includePublic));const n=await this.request(`/api/sync/worlds?${t.toString()}`);if(!n.ok){const s=await n.json();throw new Error(s.error||"Failed to get worlds")}return n.json()}async getWorld(e){const t=await this.request(`/api/sync/worlds/${e}`);if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to get world")}return t.json()}async createWorld(e){const t=await this.request("/api/sync/worlds",{method:"POST",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to create world")}return t.json()}async updateWorld(e,t){const n=await this.request(`/api/sync/worlds/${e}`,{method:"PUT",body:JSON.stringify(t)});if(!n.ok){const s=await n.json();throw new Error(s.error||"Failed to update world")}return n.json()}async deleteWorld(e){const t=await this.request(`/api/sync/worlds/${e}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete world")}return t.json()}async syncTimelines(e,t){const n=await this.request(`/api/sync/timelines/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const s=await n.json();throw new Error(s.error||`Failed to ${e} timelines`)}return n.json()}async getTimelines(e){const t=new URLSearchParams;e?.worldId&&t.set("worldId",e.worldId),e?.search&&t.set("search",e.search);const n=await this.request(`/api/sync/timelines?${t.toString()}`);if(!n.ok){const s=await n.json();throw new Error(s.error||"Failed to get timelines")}return n.json()}async getTimeline(e){const t=await this.request(`/api/sync/timelines/${e}`);if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to get timeline")}return t.json()}async createTimeline(e){const t=await this.request("/api/sync/timelines",{method:"POST",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to create timeline")}return t.json()}async updateTimeline(e,t){const n=await this.request(`/api/sync/timelines/${e}`,{method:"PUT",body:JSON.stringify(t)});if(!n.ok){const s=await n.json();throw new Error(s.error||"Failed to update timeline")}return n.json()}async deleteTimeline(e){const t=await this.request(`/api/sync/timelines/${e}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete timeline")}return t.json()}async addTimelineEvent(e,t){const n=await this.request(`/api/sync/timelines/${e}/events`,{method:"POST",body:JSON.stringify(t)});if(!n.ok){const s=await n.json();throw new Error(s.error||"Failed to add event")}return n.json()}async updateTimelineEvent(e,t,n){const s=await this.request(`/api/sync/timelines/${e}/events/${t}`,{method:"PATCH",body:JSON.stringify(n)});if(!s.ok){const a=await s.json();throw new Error(a.error||"Failed to update event")}return s.json()}async deleteTimelineEvent(e,t){const n=await this.request(`/api/sync/timelines/${e}/events/${t}`,{method:"DELETE"});if(!n.ok){const s=await n.json();throw new Error(s.error||"Failed to delete event")}return n.json()}async testConnection(e){try{const t=await fetch(`${e}/api/health`,{method:"GET",signal:AbortSignal.timeout(5e3)});return t.ok?{success:!0,message:"Connection successful"}:{success:!1,message:`Server returned ${t.status}`}}catch(t){return{success:!1,message:t instanceof Error?t.message:"Connection failed"}}}}const v=new ao,Pn="eidolon.web.seedGenerator.history",jn=["bpui.web.seedGenerator.history"],Dn="eidolon.web.seedGenerator.favorites",Ln=["bpui.web.seedGenerator.favorites"],Fn="eidolon.web.seedGenerator.favorites.syncState",Mn="eidolon.web.seedGenerator.archivedSeedRuns.syncState",Bn=12,oo=12,Lt="seed-favorites-changed",io="seed-history-changed";function yt(r,e){if(typeof window>"u")return e;const t=Array.isArray(r)?[...r]:[r],[n,...s]=t;try{for(const a of t){const o=window.localStorage.getItem(a);if(!o)continue;const c=JSON.parse(o);return a!==n&&(window.localStorage.setItem(n,JSON.stringify(c)),s.forEach(l=>window.localStorage.removeItem(l))),c}}catch{return e}return e}function bt(r,e,t){typeof window>"u"||(window.localStorage.setItem(r,JSON.stringify(t)),e.forEach(n=>window.localStorage.removeItem(n)))}function co(r){typeof window>"u"||window.dispatchEvent(new CustomEvent(Lt,{detail:{count:r.length}}))}function lo(r){typeof window>"u"||window.dispatchEvent(new CustomEvent(io,{detail:{count:r.filter(e=>!e.archivedAt).length}}))}function De(r){if(typeof r!="string")return;const e=new Date(r);return Number.isNaN(e.getTime())?void 0:e.toISOString()}function uo(r){if(typeof r!="object"||r===null)return null;const e=r,t=typeof e.seed=="string"?e.seed.trim():"";if(!t)return null;const n=De(e.addedAt)??new Date().toISOString(),s=De(e.lastUsedAt),a=De(e.archivedAt),o={seed:t,addedAt:n};return s&&(o.lastUsedAt=s),a&&(o.archivedAt=a),o}function Un(r,e){const t=Date.parse(r.lastUsedAt??r.addedAt);return Date.parse(e.lastUsedAt??e.addedAt)-t}function $n(r,e){const t=Date.parse(r.archivedAt??r.lastUsedAt??r.addedAt);return Date.parse(e.archivedAt??e.lastUsedAt??e.addedAt)-t}function dt(r){const e=new Map;for(const t of r){const n=uo(t);n&&e.set(n.seed,n)}return Array.from(e.values()).sort((t,n)=>t.archivedAt||n.archivedAt?$n(t,n):Un(t,n))}function Vt(){return yt(Fn,{})}function Gn(r){bt(Fn,[],r)}function Yt(){return yt(Mn,{})}function Hn(r){bt(Mn,[],r)}function ae(){const r=yt([Dn,...Ln],[]);return dt(r)}function Kn(r){return[...r].filter(e=>!e.archivedAt).sort(Un)}function po(r){return[...r].filter(e=>!!e.archivedAt).sort($n)}function he(r,e={}){const{markChanged:t=!0,markSynced:n=!1,timestamp:s=new Date().toISOString()}=e,a=dt(r);bt(Dn,Ln,a);const o=Vt();return t&&(o.lastChangedAt=s),n&&(o.lastSyncedAt=s),Gn(o),co(Kn(a)),a}const Ft=[{id:"noir-romance",label:"Noir Pressure",genreLines:`noir:debt, surveillance, intimacy, slow-burn
romance:realism, asymmetry, messy loyalty, after-hours`},{id:"grounded-sf",label:"Grounded Sci-Fi",genreLines:`sci-fi:grounded, labor, proximity, bureaucracy
romance:subtext, contracts, withheld tenderness`},{id:"low-magic",label:"Low Magic",genreLines:`fantasy:low-magic, domestic, obligation, village politics
romance:restraint, longing, practical intimacy`},{id:"urban-horror",label:"Urban Horror",genreLines:`horror:grounded, neighborhood, debt, body unease
thriller:secrecy, leverage, false safety`},{id:"moreau",label:"Moreau",genreLines:`romance:moreau, realism, stigma, protective tension
urban fantasy:morphosis, nightlife, consent ethic, social friction`}];function mo(r){return r.replace(/^```+/,"").replace(/```+$/,"").trim()}function ho(r){return mo(r).replace(/^[-*•]\s+/,"").replace(/^\d+[.)]\s+/,"").replace(/^seed\s*:\s*/i,"").trim()}function Dc(){return Ft}function fo(){return Ft[Math.floor(Math.random()*Ft.length)]}function go(r){return Math.min(30,Math.max(5,Math.round(r||oo)))}function Lc(r,e){const t=r.split(`
`).map(s=>s.trim()).filter(Boolean);return[...[`count=${go(e.count)}`,e.coverageMode],...t].join(`
`)}function yo(r){const e=r.genre_lines.split(`
`).map(t=>t.trim()).filter(Boolean).join(`
`);if(r.surprise_mode||!e){const t=fo();return{genreLines:t.genreLines,sourcePreset:t}}return{genreLines:e}}function bo(r){const e=r.split(`
`).map(ho).filter(t=>t.length>0).filter(t=>!/^#+\s*/.test(t)).filter(t=>!/^output to\s+/i.test(t)).filter(t=>!/^no headings/i.test(t));return[...new Set(e)].filter(t=>t.length<=180)}function _o(r){if(typeof r!="object"||r===null)return null;const e=r,t=typeof e.id=="string"&&e.id.trim().length>0?e.id:crypto.randomUUID(),n=De(e.createdAt)??new Date().toISOString(),s=De(e.archivedAt),a=typeof e.request=="object"&&e.request!==null?e.request:null,o=Array.isArray(e.seeds)?e.seeds.filter(u=>typeof u=="string"&&u.trim().length>0):[];if(!a||o.length===0)return null;const c=a.coverageMode==="blended"?"blended":"per-genre",l=typeof a.count=="number"&&Number.isFinite(a.count)?Math.max(1,Math.round(a.count)):o.length,d={id:t,createdAt:n,request:{genreLines:typeof a.genreLines=="string"?a.genreLines:"",count:l,coverageMode:c,surpriseMode:!!a.surpriseMode,presetId:typeof a.presetId=="string"?a.presetId:void 0},seeds:o};return s&&(d.archivedAt=s),d}function Ue(r){const e=[];for(const t of r){const n=_o(t);n&&e.push(n)}return e}function Jt(){const r=yt([Pn,...jn],[]);return Ue(r)}function zn(r){return r.filter(e=>!e.archivedAt)}function ut(r){return r.filter(e=>!!e.archivedAt)}function He(r,e={}){const{markArchivedChanged:t=!1,markSynced:n=!1,timestamp:s=new Date().toISOString()}=e,a=Ue(r);if(bt(Pn,jn,a),t||n){const o=Yt();t&&(o.lastChangedAt=s),n&&(o.lastSyncedAt=s),Hn(o)}return lo(zn(a)),a}function Ce(){return zn(Jt())}function fe(){return ut(Jt())}function Fc(r){const e={...r,id:crypto.randomUUID(),createdAt:new Date().toISOString()},t=fe(),n=[e,...Ce()].slice(0,Bn);return He([...n,...t]),n}function Mc(r){const e=new Date().toISOString(),t=fe(),n=Ce(),s=n.find(a=>a.id===r);return s?(He([...n.filter(a=>a.id!==r),{...s,archivedAt:e},...t.filter(a=>a.id!==r)],{markArchivedChanged:!0,timestamp:e}),Ce()):n}function Bc(r){const e=fe(),t=e.find(s=>s.id===r);if(!t)return Ce();const n=[{...t,archivedAt:void 0},...Ce()].slice(0,Bn);return He([...n,...e.filter(s=>s.id!==r)],{markArchivedChanged:!0}),n}function Uc(r){return He(Jt().filter(e=>e.id!==r),{markArchivedChanged:!0}),fe()}function wo(r){if(Array.isArray(r))return ut(Ue(r));if(typeof r!="object"||r===null)return null;const e=r;return Array.isArray(e.runs)?ut(Ue(e.runs)):null}function vo(r){const e=ut(Ue(r));return He([...Ce(),...e],{markArchivedChanged:!1,markSynced:!0}),fe()}function Wn(r=new Date().toISOString()){const e=Yt();e.lastSyncedAt=r,Hn(e)}function xo(){const{lastChangedAt:r,lastSyncedAt:e}=Yt();return r?e?Date.parse(r)>Date.parse(e):!0:!1}async function $c(){if(!v.isEnabled()||!v.hasAccessToken())return null;if(xo()){const t=fe();return await v.syncArchivedSeedRuns("push",{runs:t}),Wn(),t}const r=await v.syncArchivedSeedRuns("pull"),e=wo(r);return e?vo(e):null}function se(){return Kn(ae())}function ko(){return po(ae())}function So(r){if(Array.isArray(r))return dt(r);if(typeof r!="object"||r===null)return null;const e=r;return Array.isArray(e.seeds)?dt(e.seeds):null}function Gc(r){return he([...r]),se()}function Eo(r){return he([...r],{markChanged:!1,markSynced:!0}),se()}function qn(r=new Date().toISOString()){const e=Vt();e.lastSyncedAt=r,Gn(e)}function To(){const{lastChangedAt:r,lastSyncedAt:e}=Vt();return r?e?Date.parse(r)>Date.parse(e):!0:!1}async function Hc(){if(!v.isEnabled()||!v.hasAccessToken())return null;if(To()){const t=ae();return await v.syncSeeds("push",{seeds:t}),qn(),se()}const r=await v.syncSeeds("pull"),e=So(r);return e?Eo(e):null}function Ao(r){const e=new Date().toISOString(),t=ae().map(n=>n.seed===r?{...n,archivedAt:e}:n);return he(t,{timestamp:e}),se()}function Co(r){const e=ae().map(t=>t.seed===r?{...t,archivedAt:void 0}:t);return he(e),se()}function Kc(r){return he(ae().filter(e=>e.seed!==r)),ko()}function zc(r){const e=ae(),t=e.find(n=>n.seed===r);return t?.archivedAt?Co(r):t?Ao(r):(he([{seed:r,addedAt:new Date().toISOString()},...e]),se())}function Wc(r){const e=new Date().toISOString(),n=ae().map(s=>s.seed===r?{...s,lastUsedAt:e}:s);return he(n,{timestamp:e}),se()}const Oo="eidolon.web.themes.custom",Io=["bpui.web.themes.custom"],Vn=900,rt=new Set;let J=null,Pe=null;function No(){if(typeof window>"u")return[];for(const r of[Oo,...Io]){const e=window.localStorage.getItem(r);if(e)try{return JSON.parse(e)}catch{return[]}}return[]}function Ro(r){const e=r.metadata.mode,t=e==="SFW"||e==="NSFW"||e==="Platform-Safe"||e==="Auto"?e:void 0,n=o=>{if(typeof o!="string")return;const c=o.trim();return c.length>0?c:void 0},s=Object.fromEntries(Object.entries(r.assets).filter(o=>{const[c,l]=o;return typeof c=="string"&&c.length>0&&typeof l=="string"})),a=Array.isArray(r.metadata.component_send_order)?r.metadata.component_send_order.filter(o=>typeof o=="string").map(o=>o.trim()).filter(o=>o.length>0):void 0;return{reviewId:n(r.metadata.review_id)??r.path,seed:n(r.metadata.seed)??r.path,mode:t,model:n(r.metadata.model),archivedAt:n(r.metadata.archived_at),characterName:n(r.metadata.character_name),templateName:n(r.metadata.template_name),genre:n(r.metadata.genre),notes:n(r.metadata.notes),favorite:!!r.metadata.favorite,tags:Array.isArray(r.metadata.tags)?r.metadata.tags.filter(o=>typeof o=="string"&&o.trim().length>0):[],offspringType:n(r.metadata.offspring_type),customInstructions:n(r.metadata.custom_instructions),componentSendOrder:a&&a.length>0?a:void 0,parentDraftIds:Array.isArray(r.metadata.parent_drafts)?r.metadata.parent_drafts.filter(o=>typeof o=="string"&&o.trim().length>0):void 0,connectedDraftIds:Array.isArray(r.metadata.connected_drafts)?r.metadata.connected_drafts.filter(o=>typeof o=="string"&&o.trim().length>0):void 0,assets:s}}function vr(r){return tt(r)!==null&&!An(r)?`blueprints/overrides/${r.replace(/^blueprints\//,"")}`:r}function Po(r){return typeof r=="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(r)}async function jo(){const[r,e]=await Promise.all([P.getAllDraftsWithOptions({includeArchived:!0}),v.listRemoteDrafts()]),t=new Set(r.map(o=>o.metadata.review_id)),n=e.drafts||[],a=((await v.syncDrafts("push",{drafts:r.map(Ro)})).results||[]).filter(o=>o.status==="error").map(o=>o.error?`${o.reviewId} (${o.error})`:o.reviewId);if(a.length>0)throw new Error(`Remote draft sync failed for: ${a.join(", ")}`);await Promise.all(n.filter(o=>!t.has(o.reviewId)).map(o=>Po(o.id)?v.deleteRemoteDraft(o.id).catch(c=>{console.warn(`Failed to delete remote draft ${o.reviewId}:`,c)}):(console.warn(`Skipping remote draft delete for ${o.reviewId}: server returned non-UUID id.`),Promise.resolve())))}async function Do(){const r=No(),t=(await v.listRemoteThemes()).themes||[],n=new Set(r.map(s=>s.name));await v.syncThemes("push",{themes:r.map(s=>({name:s.name,displayName:s.display_name,description:s.description,author:s.author,tags:s.tags,basedOn:s.based_on,colors:s.colors}))}),await Promise.all(t.filter(s=>!s.isBuiltin&&!n.has(s.name)).map(s=>v.deleteRemoteTheme(s.name).catch(a=>{console.warn(`Failed to delete remote theme ${s.name}:`,a)})))}async function Lo(){const r=me(),t=(await v.listRemoteTemplates()).templates||[],n=new Set(r.map(s=>s.template.name));await v.syncTemplates("push",{templates:r.map(s=>({name:s.template.name,version:s.template.version,description:s.template.description,isDefault:s.template.is_default,assets:s.template.assets,blueprintContent:s.blueprint_contents}))}),await Promise.all(t.filter(s=>!s.isOfficial&&!n.has(s.name)).map(s=>v.deleteRemoteTemplate(s.name).catch(a=>{console.warn(`Failed to delete remote template ${s.name}:`,a)})))}async function Fo(){const r=ae(),e=fe();await v.syncSeeds("push",{seeds:r}),await v.syncArchivedSeedRuns("push",{runs:e}),qn(),Wn()}async function Mo(){const r=ne(),e=Object.entries(r),t=new Set(e.map(([a])=>vr(a))),s=(await v.listRemoteBlueprints()).blueprints||[];e.length>0&&await v.syncBlueprints("push",{blueprints:e.map(([a,o])=>{const c=Kt(o);return{path:vr(a),name:c.name,description:c.description,invokable:c.invokable,version:c.version,category:"custom",content:o}})}),await Promise.all(s.filter(a=>!a.isBuiltin&&!t.has(a.path)).map(a=>v.deleteRemoteBlueprint(a.path).catch(o=>{console.warn(`Failed to delete remote blueprint ${a.path}:`,o)})))}async function Bo(){await Promise.all([v.pushConfig(T.getConfig()),v.pushApiKeys(Object.fromEntries(Object.entries(T.getApiKeys()).filter(r=>r[1]!==void 0)))])}async function Uo(r){switch(r){case"drafts":await jo();return;case"themes":await Do();return;case"templates":await Lo();return;case"seeds":await Fo();return;case"blueprints":await Mo();return;case"config":await Bo();return}}async function pt(){if(Pe)return Pe;J&&(clearTimeout(J),J=null),Pe=(async()=>{const r=Array.from(rt);if(rt.clear(),!(r.length===0||!v.isEnabled()||!v.hasAccessToken()))for(const e of r)try{await Uo(e)}catch(t){console.warn(`Automatic ${e} sync failed:`,t)}})();try{await Pe}finally{Pe=null,rt.size>0&&!J&&(J=setTimeout(()=>{J=null,pt()},Vn))}}function N(r,e={}){if((Array.isArray(r)?r:[r]).forEach(n=>rt.add(n)),e.immediate){pt();return}J&&clearTimeout(J),J=setTimeout(()=>{J=null,pt()},Vn)}function $o(){return pt()}function Go(r){const e=vn(r);if(e.length===0)return"";let t;try{t=xn(e)}catch{t=e.map(o=>o.name)}const n=t.map(o=>e.find(c=>c.name===o)).filter(o=>!!o),s=[];s.push(`

## TEMPLATE OVERRIDE
`),s.push("The following active template contract is authoritative. Use it instead of the fallback template order."),s.push(`Template name: ${r.name}`),s.push(`Template version: ${r.version}`),r.description?.trim()&&s.push(`Template description: ${r.description.trim()}`),s.push(`Asset count: ${n.length}`),s.push(""),s.push("Asset output order:"),n.forEach((o,c)=>{s.push(`${c+1}. ${o.name}`)}),s.push(""),s.push("Declared asset contract:"),n.forEach(o=>{const c=o.dependsOn.length>0?o.dependsOn.join(", "):"none";s.push(`- ${o.name}`),s.push(`  - required: ${o.required}`),s.push(`  - depends_on: ${c}`),o.blueprintFile&&s.push(`  - blueprint_file: ${o.blueprintFile}`),o.description?.trim()&&s.push(`  - description: ${o.description.trim()}`)});const a=n.map(o=>{const c=Cn(r.name,o.name)?.trim();return c?["",`### ASSET BLUEPRINT: ${o.name}`,"```md",c,"```"].join(`
`):null}).filter(o=>!!o);return a.length>0&&(s.push(""),s.push("Resolved asset blueprints:"),s.push("Follow these blueprint sources exactly for structure, placeholders, control blocks, and field names."),s.push(a.join(`
`))),s.join(`
`)}function Ho(r){if(!r)return[];const e=vn(r);if(e.length===0)return[];try{return xn(e)}catch{return e.map(t=>t.name)}}function $e(r,e,t,n){const s=Ho(n),a=s.length>0?s:Object.keys(t),o=[`
## ${r}: ${e}`];return n&&o.push(`Template: ${n.name} (${n.version})`),a.forEach(c=>{o.push(...Yn(`### ${c}:`,c,t[c]||""))}),o}function Ko(r){return typeof r=="object"&&r!==null&&!Array.isArray(r)}function xr(r){if(r===null)return null;if(typeof r=="string"){const e=r.replace(/\s+/g," ").trim();return e?e.length>240?`${e.slice(0,237)}...`:e:null}return String(r)}function Mt(r,e,t,n=0){if(t.length>=60||n>4)return;if(Array.isArray(r)){if(r.length===0)return;const a=r.map(o=>o===null||typeof o=="boolean"||typeof o=="number"||typeof o=="string"?xr(o):null).filter(o=>!!o);if(a.length===r.length){t.push(`- ${e}: ${a.slice(0,8).join(", ")}`),r.length>8&&t.push(`- ${e}: (${r.length-8} more values omitted)`);return}r.slice(0,3).forEach((o,c)=>{Mt(o,`${e}[${c}]`,t,n+1)}),r.length>3&&t.push(`- ${e}: (${r.length-3} more items omitted)`);return}if(Ko(r)){const a=Object.entries(r);a.slice(0,15).forEach(([o,c])=>{const l=e?`${e}.${o}`:o;Mt(c,l,t,n+1)}),a.length>15&&t.length<60&&t.push(`- ${e||"root"}: (${a.length-15} more fields omitted)`);return}const s=xr(r);s&&t.push(`- ${e}: ${s}`)}function Yn(r,e,t,n="Use the extracted fields below. Do not assume access to any external file."){const s=r.endsWith(":")?r.slice(0,-1):r,a=t.trim();if(!a)return[r,"```","","```",""];if(a.startsWith("{")||a.startsWith("["))try{const o=JSON.parse(a),c=[];if(Mt(o,"",c),c.length>0)return[`${s} (structured JSON context):`,n,...c,""]}catch{}return[r,"```",t,"```",""]}function zo(r,e){return Yn(`### ${r}:`,r,e)}async function Wo(r,e=null,t,n,s,a=[],o=[]){let c=await ht("orchestration",s,n);t&&t.assets.length>0&&(c+=Go(t));const l=c,d=[];return e&&d.push(`Mode: ${e}`),d.push(`SEED: ${r}`),o.length>0&&(d.push(""),d.push("CONNECTED CHARACTER REFERENCES:"),d.push("Treat these suites as secondary canon anchors for continuity, shared setting pressure, and existing entanglements."),d.push("Do not let them override the active seed or collapse the new character into a duplicate."),o.forEach((u,p)=>{d.push(...$e(`REFERENCE ${p+1}`,u.label,u.assets,u.template))})),a.length>0&&(d.push(""),d.push("ADDITIONAL RULES:"),a.forEach(u=>{d.push(`- ${u}`)})),[l,d.join(`
`)]}async function qo(r,e,t=null,n={},s=null,a,o=[],c=[]){const l=s||await wn(r,a),d=`# BLUEPRINT: ${r}

${l}`,u=[];if(t&&u.push(`Mode: ${t}`),u.push(`SEED: ${e}`),o.length>0&&(u.push(""),u.push("ADDITIONAL INSTRUCTIONS:"),o.forEach((p,m)=>{m>0&&u.push(""),u.push(p)})),c.length>0&&(u.push(`
---
## Connected Character References:
`),u.push("Treat these suites as established canon anchors for relationship continuity, shared world state, and cross-character consistency."),u.push("Use them to keep the new character interconnected without duplicating an existing suite or overriding the active seed."),c.forEach((p,m)=>{u.push(...$e(`REFERENCE ${m+1}`,p.label,p.assets,p.template))})),n&&Object.keys(n).length>0){u.push(`
---
## Prior Assets (for context):
`);for(const[p,m]of Object.entries(n))u.push(...zo(p,m))}return[d,u.join(`
`)]}async function Vo(r,e){return[e?.trim()||await ht("seed_generation"),r]}async function Yo(r,e={}){const t=e.blueprintContent?.trim()||await ht("worldbook_generation"),n=[`REFERENCE_DRAFT_COUNT: ${r.length}`,"TASK: Synthesize a connected lorebook/worldbook packet from these reference drafts.","CONSTRAINT: Do not generate a new standalone character. Extract connected canon, events, places, factions, moments, and recurring pressure instead."];return e.focus?.trim()&&(n.push(""),n.push(`FOCUS: ${e.focus.trim()}`)),r.forEach((s,a)=>{n.push(...$e(`REFERENCE DRAFT ${a+1}`,s.label,s.assets,s.template))}),[t,n.join(`
`)]}function Jo(r,e){const t=`You are an expert character analyst specializing in understanding character relationships, dynamics, and narrative potential. Your task is to deeply analyze two characters and provide insights about how they would interact in a story.

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
`)]}async function Xo(r,e,t,n,s=null,a,o,c,l){const d=await ht("offspring_generation",l,c),u=[];return s&&u.push(`Mode: ${s}`),u.push(...$e("PARENT 1",t,r,a)),u.push(...$e("PARENT 2",n,e,o)),u.push(`
## INSTRUCTION:`),u.push("Analyze how these two parents would shape a new character's upbringing and generate the offspring's SEED."),u.push("Treat each parent suite according to the template contract shown in the provided assets."),[d,u.join(`
`)]}function ke(r,e,t){const n=[{role:"system",content:r}];return n.push({role:"user",content:e}),n}const Qo=["character_sheet","post_history","system_prompt"],kr={character_sheet:1400,post_history:500,system_prompt:500,reference_summary:360,default:420},Sr={character_sheet:24,post_history:8,system_prompt:8,reference_summary:6,default:8};function Zo(r){return kr[r]??kr.default}function ei(r){return Sr[r]??Sr.default}function nt(r,e){const t=e.trim();if(!t)return"";const n=ei(r),s=Zo(r),a=t.split(/\r?\n/).map(d=>d.trimEnd()).filter(d=>d.trim().length>0),c=a.slice(0,n).join(`
`);return c.length<=s&&a.length<=n?c:`${c.slice(0,s).trimEnd()}
[truncated for reference]`}function ti(r){const e=[],{metadata:t}=r;return e.push(`name: ${t.character_name||t.review_id}`),t.template_name&&e.push(`template: ${t.template_name}`),t.mode&&e.push(`mode: ${t.mode}`),e.push(`seed: ${t.seed}`),t.genre&&e.push(`genre: ${t.genre}`),t.notes?.trim()&&e.push(`notes: ${t.notes.trim()}`),nt("reference_summary",e.join(`
`))}function ri(r,e={}){const t={},n=ti(r);n&&(t.reference_summary=n);const s=e.preferredAssetOrder??[...Qo];for(const o of s){const c=r.assets[o];typeof c!="string"||c.trim().length===0||(t[o]=nt(o,c))}if(e.includeAssetPrefixes?.length){const o=new Set(Object.keys(t));for(const[c,l]of Object.entries(r.assets))o.has(c)||e.includeAssetPrefixes.some(d=>c.startsWith(d))&&(typeof l!="string"||l.trim().length===0||(t[c]=nt(c,l)))}if(Object.keys(t).length>1)return t;const a=Object.entries(r.assets).find(([,o])=>typeof o=="string"&&o.trim().length>0);if(a){const[o,c]=a;t[o]=nt(o,c)}return t}function Bt(r,e={}){const t=new Set((e.excludeIds??[]).filter(a=>typeof a=="string").map(a=>a.trim()).filter(Boolean)),n=[],s=new Set;for(const a of r??[]){if(typeof a!="string")continue;const o=a.trim();if(!(!o||t.has(o)||s.has(o))&&(s.add(o),n.push(o),n.length>=zr))break}return n}async function Er(r,e={}){const t=Bt(r,{excludeIds:e.excludeIds});return t.length===0?[]:(await Promise.all(t.map(s=>P.getDraft(s)))).filter(s=>!!s).map(s=>({label:s.metadata.character_name||s.metadata.review_id,assets:ri(s,e),template:e.resolveTemplate?.(s.metadata.template_name)})).filter(s=>Object.keys(s.assets).length>0)}class ee{static resolveConfiguredProvider(e){return e.engine_mode==="explicit"&&e.engine!=="auto"&&e.engine!=="openai_compatible"?e.engine:e.model?Gt(e.model):void 0}static getFallbackApiKey(e){return Object.values(e).find(t=>typeof t=="string"&&t.trim().length>0)}static createConfiguredEngine(){const e=T.getApiKeys(),t=T.getConfig(),n=this.resolveConfiguredProvider(t);return Ee({model:t.model,apiKey:n?e[n]:this.getFallbackApiKey(e),apiKeys:e,provider:n,baseUrl:t.base_url,proxyKey:t.api_proxy_key,temperature:t.temperature,maxTokens:t.max_tokens})}static sanitizeGeneratedSeed(e){return St(e).replace(/^['"]|['"]$/g,"")}static getOffspringCarryRules(){return["Treat this seed as an offspring outcome shaped by two parent suites, not a disconnected standalone premise.","Preserve the inherited, inverted, or transmuted relational vector toward {{user}} implied by the offspring seed.","Do not flatten lineage tension: the generated assets should still feel like a descendant response to parental influence even when the seed expresses rebellion or mutation."]}static async*generate(e,t={}){const{seed:n,template:s,mode:a="Auto",stream:o=!0,blueprint_override:c,additional_instructions:l=[],connected_draft_ids:d=[]}=e;yield{type:"status",stage:"initializing"};const u=T.getConfig(),p=this.createConfiguredEngine(),m=s?pe(s):void 0,y=Bt(d),f=await Er(y,{resolveTemplate:j=>j?pe(j):void 0});yield{type:"status",stage:"building_prompt"};const[g,O]=await Wo(n,a,m,void 0,c,l,f);yield{type:"status",stage:"generating"};const S=ke(g,O);let B="";if(o){for await(const j of p.generateStream(S,{signal:t.signal}))if(j.content&&(B+=j.content,yield{type:"chunk",content:j.content}),j.done)break}else B=(await p.generate(S,{signal:t.signal})).content;yield{type:"status",stage:"parsing"};let F;try{F=m?Vs(B,m).assets:this.parseBlueprintOutput(B)}catch{F=this.parseBlueprintOutput(B)}yield{type:"status",stage:"saving"};const V=this.generateReviewId(),X=ct(F,s),k={path:V,metadata:{review_id:V,seed:n,mode:a,model:u.model,created:new Date().toISOString(),modified:new Date().toISOString(),favorite:!1,template_name:s,character_name:X,connected_drafts:y.length>0?y:void 0},assets:F};await P.saveDraft(k),N("drafts"),yield{type:"complete",asset:V}}static async*generateAsset(e,t=!0){const n=Cn(e.template,e.asset_name);yield*this.generateAssetWithBlueprint(e,n,t)}static async*previewBlueprint(e,t=!0){yield*this.generateAssetWithBlueprint(e,e.blueprint_content,t)}static async*generateAssetWithBlueprint(e,t,n){const{seed:s,mode:a="Auto",asset_name:o,prior_assets:c,additional_instructions:l=[],reference_suites:d=[]}=e;yield{type:"status",stage:"initializing"};const u=this.createConfiguredEngine();yield{type:"status",stage:"building_prompt"};const[p,m]=await qo(o,s,a,c,t,void 0,l,d);yield{type:"status",stage:"prompt_ready",asset:o,systemPrompt:p,userPrompt:m},yield{type:"status",stage:"generating",asset:o};const y=ke(p,m);let f="";if(n){for await(const g of u.generateStream(y))if(g.content&&(f+=g.content,yield{type:"chunk",content:g.content,asset:o}),g.done)break}else f=(await u.generate(y)).content;yield{type:"asset",asset:o,content:St(f),systemPrompt:p,userPrompt:m}}static async*generateOffspringSeed(e,t={}){const{parent1_id:n,parent2_id:s,mode:a="Auto",blueprint_override:o}=e;yield{type:"status",stage:"loading_parents"};const c=await P.getDraft(n),l=await P.getDraft(s);if(!c||!l){yield{type:"error",error:"Parent drafts not found"};return}yield{type:"status",stage:"building_prompt"};const d=this.createConfiguredEngine(),[u,p]=await Xo(c.assets,l.assets,c.metadata.character_name||"Parent 1",l.metadata.character_name||"Parent 2",a,c.metadata.template_name?pe(c.metadata.template_name):void 0,l.metadata.template_name?pe(l.metadata.template_name):void 0,void 0,o);yield{type:"status",stage:"generating"};const m=ke(u,p);let y="";for await(const g of d.generateStream(m,{signal:t.signal}))if(g.content&&(y+=g.content,yield{type:"chunk",content:g.content}),g.done)break;yield{type:"complete",content:this.sanitizeGeneratedSeed(y)}}static async*generateOffspring(e,t={}){const{parent1_id:n,parent2_id:s,mode:a="Auto",template:o,blueprint_override:c}=e;let l="";for await(const u of this.generateOffspringSeed(e,t)){if(u.type==="error"){yield u;return}(u.type==="status"||u.type==="chunk")&&(yield u),u.type==="complete"&&(l=u.content||"")}if(!l){yield{type:"error",error:"Offspring seed generation finished without seed content."};return}yield{type:"status",stage:"generating_character"};let d="";for await(const u of this.generate({seed:l,mode:a,template:o,stream:!1,blueprint_override:c,additional_instructions:this.getOffspringCarryRules()},t)){if(u.type==="error"){yield u;return}u.type==="status"&&u.stage==="saving"&&(yield{type:"status",stage:"saving"}),u.type==="complete"&&(d=u.asset||"")}if(!d){yield{type:"error",error:"Offspring generation finished without a saved draft id."};return}await P.updateMetadata(d,{seed:l,parent_drafts:[n,s],offspring_type:"offspring"}),N("drafts"),yield{type:"complete",asset:d}}static async*generateLorebook(e,t={}){const n=Bt(e.draft_ids);if(n.length===0){yield{type:"error",error:"Select at least one reference draft to generate a lorebook packet."};return}yield{type:"status",stage:"loading_references"};const s=await Er(n,{preferredAssetOrder:["lorebook","character_sheet","post_history","intro_scene","intro_page","system_prompt"],includeAssetPrefixes:["lorebook_"],resolveTemplate:u=>u?pe(u):void 0});if(s.length===0){yield{type:"error",error:"The selected drafts did not contain enough usable reference context for lorebook generation."};return}yield{type:"status",stage:"building_prompt"};const a=this.createConfiguredEngine(),[o,c]=await Yo(s,{focus:e.focus,blueprintContent:e.blueprint_content});yield{type:"status",stage:"generating"};const l=ke(o,c);let d="";for await(const u of a.generateStream(l,{signal:t.signal}))if(u.content&&(d+=u.content,yield{type:"chunk",content:u.content}),u.done)break;yield{type:"complete",content:St(d).trim()}}static async*generateSeeds(e){yield{type:"status",stage:"initializing"};const t=typeof e=="string"?{genre_lines:e}:e,{genreLines:n}=yo(t),s=T.getApiKeys(),a=T.getConfig(),o=this.resolveConfiguredProvider(a),c=Ee({model:a.model,apiKey:o?s[o]:this.getFallbackApiKey(s),apiKeys:s,provider:o,baseUrl:a.base_url,temperature:a.temperature,maxTokens:a.max_tokens});yield{type:"status",stage:"building_prompt"};const[l,d]=await Vo(n,t.blueprint_content);yield{type:"status",stage:"generating"};const u=ke(l,d),p=await c.generate(u);yield{type:"complete",content:bo(p.content).join(`
`)}}static async*chat(e,t,n){yield{type:"status",stage:"initializing"};const s=T.getApiKeys(),a=T.getConfig(),o=this.resolveConfiguredProvider(a),c=Ee({model:a.model,apiKey:o?s[o]:this.getFallbackApiKey(s),apiKeys:s,provider:o,baseUrl:a.base_url,temperature:a.temperature,maxTokens:a.max_tokens});yield{type:"status",stage:"generating"};const d=(t[0]?.role==="system"?t[0].content:void 0)?t.slice(1):t;let u="";for await(const p of c.generateStream(d))if(p.content&&(u+=p.content,yield{type:"chunk",content:p.content}),p.done)break;yield{type:"complete",content:u}}static async analyzeSimilarity(e,t){const n=await P.getDraft(e),s=await P.getDraft(t);if(!n||!s)throw new Error("One or both drafts not found");const a=this.parseCharacterProfile(n.assets.character_sheet||""),o=this.parseCharacterProfile(s.assets.character_sheet||""),c=T.getApiKeys(),l=T.getConfig(),d=this.resolveConfiguredProvider(l),u=Ee({model:l.model,apiKey:d?c[d]:this.getFallbackApiKey(c),apiKeys:c,provider:d,baseUrl:l.base_url,temperature:l.temperature,maxTokens:l.max_tokens}),[p,m]=Jo(a,o),y=ke(p,m),f=await u.generate(y);try{return JSON.parse(f.content)}catch{return{raw:f.content}}}static parseBlueprintOutput(e){const t={},n=/```(\w+)?\n([\s\S]*?)```/g,s=["Adjustment Note","system_prompt","post_history","character_sheet","intro_scene","intro_page","a1111","suno"];let a;for(;(a=n.exec(e))!==null;){const o=a[1],c=a[2]?.trim();o&&c&&s.includes(o)&&(t[o]=c)}if(Object.keys(t).length===0)for(let o=0;o<s.length;o++){const c=s[o],l=s[o+1],d=new RegExp(`^##\\s*${c}`,"im"),u=e.search(d);if(u===-1)continue;let p;if(l){const y=new RegExp(`^##\\s*${l}`,"im"),f=e.slice(u).search(y);p=f===-1?e.length:u+f}else p=e.length;const m=e.slice(u,p).trim();m&&(t[c]=m)}return t}static parseCharacterProfile(e){const t={},n=e.split(`
`);let s=null,a=[];for(const o of n){const c=o.match(/^([A-Z][A-Za-z\s]+):\s*(.+)$/);c?(s&&a.length>0&&(t[s]=a.join(`
`).trim()),s=c[1].trim().toLowerCase().replace(/\s+/g,"_"),a=[c[2].trim()]):s&&o.trim()&&a.push(o.trim())}s&&a.length>0&&(t[s]=a.join(`
`).trim());for(const o of["personality_traits","core_values","goals","fears","motivations"])typeof t[o]=="string"&&(t[o]=t[o].split(",").map(c=>c.trim()).filter(c=>c.length>0));return t}static generateReviewId(){const e=Date.now(),t=Math.random().toString(36).substring(2,9);return`${e}_${t}`}}const Jn="eidolon.web.themes.custom",Ut="eidolon:themes-synced",$t="eidolon:drafts-synced";function ni(r,e){const t=e.match(/^---\n([\s\S]*?)\n---/);let n=r.split("/").pop()?.replace(".md","")||"Blueprint",s="",a="1.0",o=!0;if(!t)return{name:n,description:s,version:a,invokable:o};const c=t[1],l=c.match(/^name:\s*(.+)$/m),d=c.match(/^description:\s*(.+)$/m),u=c.match(/^version:\s*(.+)$/m),p=c.match(/^invokable:\s*(.+)$/m);return l&&(n=l[1].trim()),d&&(s=d[1].trim()),u&&(a=u[1].trim()),p&&(o=p[1].trim()==="true"),{name:n,description:s,version:a,invokable:o}}function si(r){return!r||typeof r!="object"||Array.isArray(r)?{}:Object.fromEntries(Object.entries(r).filter(e=>typeof e[1]=="string"))}function ai(r){return typeof r.name!="string"||r.name.trim().length===0||!Array.isArray(r.assets)?null:{template:{name:r.name,version:typeof r.version=="string"&&r.version.trim().length>0?r.version:"1.0.0",description:typeof r.description=="string"?r.description:"",is_official:!!(r.isOfficial??r.is_official),is_default:!!(r.isDefault??r.is_default),assets:r.assets},blueprint_contents:si(r.blueprintContent??r.blueprint_contents)}}function oi(r){return r.startsWith("blueprints/overrides/")?`blueprints/${r.replace(/^blueprints\/overrides\//,"")}`:r}function ii(r,e){const t=new Set(qt().map(o=>o.template.name).filter(o=>o!==e));if(!t.has(r))return r;const n=r.endsWith(" Copy")?r:`${r} Copy`;if(!t.has(n))return n;let s=2,a=`${n} ${s}`;for(;t.has(a);)s+=1,a=`${n} ${s}`;return a}const Xn=["bpui.web.themes.custom"],ci=300*1e3,Qe=new Map,li=[{name:"json",path:"json",format:"json",description:"Export the full draft as JSON."},{name:"text",path:"text",format:"text",description:"Export draft assets as plain text sections."},{name:"combined",path:"combined",format:"combined",description:"Export a markdown bundle with metadata and assets."}];function I(r){return{author:"Eidolon Simulacra",is_builtin:!0,...r}}const di=[I({name:"dark",display_name:"Dark",description:"Default dark theme for browser-only mode.",tags:["builtin","dark"],based_on:"",colors:{background:"#0f172a",text:"#e5e7eb",accent:"#38bdf8",button:"#1d4ed8",button_text:"#f8fafc",border:"#334155",highlight:"#7dd3fc",window:"#111827",tok_brackets:"#60a5fa",tok_asterisk:"#f472b6",tok_parentheses:"#f59e0b",tok_double_brackets:"#a78bfa",tok_curly_braces:"#34d399",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#94a3b8",surface:"#1e293b",success_bg:"#052e16",danger_bg:"#450a0a",accent_bg:"#082f49",accent_title:"#e0f2fe",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fcd34d"}}),I({name:"light",display_name:"Light",description:"Default light theme for browser-only mode.",tags:["builtin","light"],based_on:"",colors:{background:"#f8fafc",text:"#0f172a",accent:"#2563eb",button:"#1d4ed8",button_text:"#eff6ff",border:"#cbd5e1",highlight:"#0ea5e9",window:"#ffffff",tok_brackets:"#2563eb",tok_asterisk:"#db2777",tok_parentheses:"#d97706",tok_double_brackets:"#7c3aed",tok_curly_braces:"#059669",tok_pipes:"#0891b2",tok_at_sign:"#e11d48",muted_text:"#64748b",surface:"#ffffff",success_bg:"#dcfce7",danger_bg:"#fee2e2",accent_bg:"#dbeafe",accent_title:"#1e3a8a",success_text:"#166534",error_text:"#991b1b",warning_text:"#92400e"}}),I({name:"nyx",display_name:"Nyx",description:"High-contrast theme tuned for the blueprint workflow.",tags:["builtin","editorial"],based_on:"dark",colors:{background:"#111113",text:"#f3f4f6",accent:"#f97316",button:"#c2410c",button_text:"#fff7ed",border:"#3f3f46",highlight:"#fb923c",window:"#18181b",tok_brackets:"#60a5fa",tok_asterisk:"#f472b6",tok_parentheses:"#f59e0b",tok_double_brackets:"#c084fc",tok_curly_braces:"#4ade80",tok_pipes:"#67e8f9",tok_at_sign:"#fb7185",muted_text:"#a1a1aa",surface:"#18181b",success_bg:"#052e16",danger_bg:"#431407",accent_bg:"#431407",accent_title:"#ffedd5",success_text:"#86efac",error_text:"#fdba74",warning_text:"#fed7aa"}}),I({name:"midnight",display_name:"Midnight",description:"Deep blue ocean theme with cyan accents.",tags:["builtin","dark","blue"],based_on:"dark",colors:{background:"#0a1929",text:"#b2d4f0",accent:"#00b4d8",button:"#014361",button_text:"#caf0f8",border:"#1d3557",highlight:"#48cae4",window:"#051923",tok_brackets:"#00b4d8",tok_asterisk:"#90e0ef",tok_parentheses:"#f48c06",tok_double_brackets:"#06ffa5",tok_curly_braces:"#00b4d8",tok_pipes:"#48cae4",tok_at_sign:"#f77f00",muted_text:"#6b8aa3",surface:"#0f2638",success_bg:"#1b4332",danger_bg:"#641220",accent_bg:"#014361",accent_title:"#48cae4",success_text:"#06ffa5",error_text:"#ff6b6b",warning_text:"#f48c06"}}),I({name:"ember",display_name:"Ember",description:"Warm theme with orange and amber tones.",tags:["builtin","warm","orange"],based_on:"dark",colors:{background:"#1a0f0a",text:"#ffd8b8",accent:"#ff6b35",button:"#c44536",button_text:"#fff8f0",border:"#5e1914",highlight:"#ff8c42",window:"#100a07",tok_brackets:"#ff6b35",tok_asterisk:"#ffa07a",tok_parentheses:"#ffb627",tok_double_brackets:"#7bed9f",tok_curly_braces:"#ff6348",tok_pipes:"#feca57",tok_at_sign:"#ff4757",muted_text:"#a67c52",surface:"#261612",success_bg:"#2d4a2b",danger_bg:"#5e1914",accent_bg:"#c44536",accent_title:"#ff8c42",success_text:"#7bed9f",error_text:"#ff4757",warning_text:"#feca57"}}),I({name:"forest",display_name:"Forest",description:"Natural green theme inspired by woodland twilight.",tags:["builtin","green","nature"],based_on:"dark",colors:{background:"#0d1b0f",text:"#d4f1d4",accent:"#4ecca3",button:"#2d5f3f",button_text:"#e8f5e8",border:"#1e4620",highlight:"#7bed9f",window:"#081108",tok_brackets:"#4ecca3",tok_asterisk:"#7bed9f",tok_parentheses:"#ffd93d",tok_double_brackets:"#6bcf7f",tok_curly_braces:"#48c774",tok_pipes:"#95e1d3",tok_at_sign:"#f8b500",muted_text:"#6b8f71",surface:"#152518",success_bg:"#2d5f3f",danger_bg:"#5c2a2a",accent_bg:"#2d5f3f",accent_title:"#7bed9f",success_text:"#95e1d3",error_text:"#ff6b6b",warning_text:"#ffd93d"}}),I({name:"mono",display_name:"Monochrome",description:"Clean grayscale theme for minimal distraction.",tags:["builtin","minimal","grayscale"],based_on:"dark",colors:{background:"#1c1c1c",text:"#e0e0e0",accent:"#757575",button:"#424242",button_text:"#ffffff",border:"#505050",highlight:"#9e9e9e",window:"#141414",tok_brackets:"#bdbdbd",tok_asterisk:"#9e9e9e",tok_parentheses:"#757575",tok_double_brackets:"#e0e0e0",tok_curly_braces:"#a0a0a0",tok_pipes:"#c0c0c0",tok_at_sign:"#888888",muted_text:"#707070",surface:"#242424",success_bg:"#3a3a3a",danger_bg:"#2e2e2e",accent_bg:"#424242",accent_title:"#9e9e9e",success_text:"#c0c0c0",error_text:"#a0a0a0",warning_text:"#b0b0b0"}}),I({name:"solarized_dark",display_name:"Solarized Dark",description:"Popular Solarized color scheme with reduced eye strain.",tags:["builtin","dark","solarized"],based_on:"dark",colors:{background:"#002b36",text:"#839496",accent:"#268bd2",button:"#073642",button_text:"#eee8d5",border:"#586e75",highlight:"#2aa198",window:"#001e26",tok_brackets:"#dc322f",tok_asterisk:"#268bd2",tok_parentheses:"#cb4b16",tok_double_brackets:"#859900",tok_curly_braces:"#d33682",tok_pipes:"#2aa198",tok_at_sign:"#b58900",muted_text:"#586e75",surface:"#073642",success_bg:"#324d32",danger_bg:"#4d2626",accent_bg:"#073642",accent_title:"#2aa198",success_text:"#859900",error_text:"#dc322f",warning_text:"#b58900"}}),I({name:"trans_flag",display_name:"Trans Flag",description:"Soft cyan and pink palette with neutral dark surfaces.",tags:["builtin","support","bright"],based_on:"dark",colors:{background:"#2e2e2e",text:"#ffffff",accent:"#5bcefa",button:"#f5a9b8",button_text:"#2e2e2e",border:"#cccccc",highlight:"#5bcefa",window:"#3e3e3e",tok_brackets:"#5bcefa",tok_asterisk:"#f5a9b8",tok_parentheses:"#5bcefa",tok_double_brackets:"#f5a9b8",tok_curly_braces:"#ffffff",tok_pipes:"#5bcefa",tok_at_sign:"#f5a9b8",muted_text:"#cccccc",surface:"#3e3e3e",success_bg:"#5bcefa",danger_bg:"#f5a9b8",accent_bg:"#3e3e3e",accent_title:"#5bcefa",success_text:"#2e2e2e",error_text:"#2e2e2e",warning_text:"#2e2e2e"}}),I({name:"blood_for_the_blood_god",display_name:"Blood for the Blood God",description:"A blood red theme with bronze accents.",tags:["builtin","warhammer","chaos","khorne"],based_on:"dark",colors:{background:"#200000",text:"#ffcccc",accent:"#cd7f32",button:"#600000",button_text:"#ffcccc",border:"#400000",highlight:"#ff0000",window:"#200000",tok_brackets:"#e00000",tok_asterisk:"#c00000",tok_parentheses:"#a00000",tok_double_brackets:"#e00000",tok_curly_braces:"#c00000",tok_pipes:"#a00000",tok_at_sign:"#ff0000",muted_text:"#996666",surface:"#400000",success_bg:"#600000",danger_bg:"#800000",accent_bg:"#a06629",accent_title:"#cd7f32",success_text:"#ffcccc",error_text:"#ffcccc",warning_text:"#ffcccc"}}),I({name:"silent_king",display_name:"Silent King",description:"A near-black theme with tomb-world green glow.",tags:["builtin","warhammer","necron","green"],based_on:"dark",colors:{background:"#010a01",text:"#a0e0a0",accent:"#00ff00",button:"#004000",button_text:"#a0e0a0",border:"#002000",highlight:"#00ff00",window:"#010501",tok_brackets:"#00c000",tok_asterisk:"#00a000",tok_parentheses:"#008000",tok_double_brackets:"#00c000",tok_curly_braces:"#00a000",tok_pipes:"#008000",tok_at_sign:"#00ff00",muted_text:"#609060",surface:"#010a01",success_bg:"#004000",danger_bg:"#006000",accent_bg:"#004000",accent_title:"#00ff00",success_text:"#a0e0a0",error_text:"#a0e0a0",warning_text:"#a0e0a0"}}),I({name:"ultramar",display_name:"Ultramar",description:"Cerulean armor, parchment ivory, and gold command trim.",tags:["builtin","warhammer","space-marine","blue"],based_on:"dark",colors:{background:"#08172f",text:"#e8eef7",accent:"#d4a72c",button:"#12396b",button_text:"#f8fafc",border:"#245089",highlight:"#4da3ff",window:"#0b2140",tok_brackets:"#60a5fa",tok_asterisk:"#facc15",tok_parentheses:"#fb7185",tok_double_brackets:"#93c5fd",tok_curly_braces:"#67e8f9",tok_pipes:"#c084fc",tok_at_sign:"#f97316",muted_text:"#93a9c4",surface:"#102949",success_bg:"#163b2a",danger_bg:"#481818",accent_bg:"#3d2b05",accent_title:"#fde68a",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fde047"}}),I({name:"imperial_fists",display_name:"Imperial Fists",description:"Siege yellow palette with navy shadows and hazard-strip energy.",tags:["builtin","warhammer","space-marine","yellow"],based_on:"dark",colors:{background:"#1c1603",text:"#fff6cc",accent:"#ffd100",button:"#7c6200",button_text:"#fffbea",border:"#8e740f",highlight:"#ffe66d",window:"#241d05",tok_brackets:"#ffd100",tok_asterisk:"#60a5fa",tok_parentheses:"#fb923c",tok_double_brackets:"#fde68a",tok_curly_braces:"#facc15",tok_pipes:"#93c5fd",tok_at_sign:"#f87171",muted_text:"#c5b671",surface:"#302608",success_bg:"#2d3d1b",danger_bg:"#51210f",accent_bg:"#483701",accent_title:"#fff3a3",success_text:"#bef264",error_text:"#fca5a5",warning_text:"#fde047"}}),I({name:"raven_guard",display_name:"Raven Guard",description:"Matte black surfaces with pale steel highlights and a covert red ping.",tags:["builtin","warhammer","space-marine","stealth"],based_on:"dark",colors:{background:"#09090b",text:"#e7e5e4",accent:"#d4d4d8",button:"#18181b",button_text:"#fafafa",border:"#3f3f46",highlight:"#a1a1aa",window:"#0f1014",tok_brackets:"#e4e4e7",tok_asterisk:"#f87171",tok_parentheses:"#c084fc",tok_double_brackets:"#93c5fd",tok_curly_braces:"#86efac",tok_pipes:"#67e8f9",tok_at_sign:"#fb7185",muted_text:"#71717a",surface:"#14151a",success_bg:"#14231a",danger_bg:"#3f1014",accent_bg:"#20232a",accent_title:"#f4f4f5",success_text:"#86efac",error_text:"#fda4af",warning_text:"#fdba74"}}),I({name:"salamanders",display_name:"Salamanders",description:"Volcanic green palette with lava orange contrast.",tags:["builtin","warhammer","space-marine","green"],based_on:"dark",colors:{background:"#08130e",text:"#d9f4dd",accent:"#ff7a00",button:"#1c5b34",button_text:"#f7fff8",border:"#2f7d4e",highlight:"#34d399",window:"#0d1d16",tok_brackets:"#4ade80",tok_asterisk:"#fb923c",tok_parentheses:"#facc15",tok_double_brackets:"#86efac",tok_curly_braces:"#22c55e",tok_pipes:"#2dd4bf",tok_at_sign:"#f97316",muted_text:"#7ca58a",surface:"#11251b",success_bg:"#123825",danger_bg:"#4a1d11",accent_bg:"#4a2205",accent_title:"#fdba74",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde047"}}),I({name:"iron_warriors",display_name:"Iron Warriors",description:"Gunmetal, hazard yellow, and industrial rust.",tags:["builtin","warhammer","chaos","industrial"],based_on:"dark",colors:{background:"#101114",text:"#d8d7d2",accent:"#facc15",button:"#3a3d42",button_text:"#fffce8",border:"#5a5f69",highlight:"#fde047",window:"#17191d",tok_brackets:"#facc15",tok_asterisk:"#fb7185",tok_parentheses:"#fb923c",tok_double_brackets:"#d4d4d8",tok_curly_braces:"#93c5fd",tok_pipes:"#67e8f9",tok_at_sign:"#f97316",muted_text:"#8f9098",surface:"#20242a",success_bg:"#243326",danger_bg:"#48211a",accent_bg:"#43370a",accent_title:"#fef08a",success_text:"#86efac",error_text:"#fdba74",warning_text:"#fde047"}}),I({name:"mechanicus_brass",display_name:"Mechanicus Brass",description:"Mars red, soot black, and worn brass for forge-heavy work.",tags:["builtin","warhammer","mechanicus","red"],based_on:"dark",colors:{background:"#130909",text:"#f1d9c3",accent:"#c98b2b",button:"#611616",button_text:"#fff4e6",border:"#7f2a1d",highlight:"#e2a74a",window:"#1a0d0d",tok_brackets:"#f87171",tok_asterisk:"#fbbf24",tok_parentheses:"#fdba74",tok_double_brackets:"#fca5a5",tok_curly_braces:"#fcd34d",tok_pipes:"#93c5fd",tok_at_sign:"#fb7185",muted_text:"#a98a75",surface:"#251212",success_bg:"#1f3424",danger_bg:"#4c1515",accent_bg:"#3f2610",accent_title:"#f6d28b",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fcd34d"}}),I({name:"sororitas_rose",display_name:"Sororitas Rose",description:"Ivory, cathedral black, and stained-glass crimson.",tags:["builtin","warhammer","imperium","gothic"],based_on:"dark",colors:{background:"#141112",text:"#f7ede8",accent:"#b91c1c",button:"#3c1318",button_text:"#fff7f5",border:"#6d2730",highlight:"#fb7185",window:"#1b1718",tok_brackets:"#fda4af",tok_asterisk:"#facc15",tok_parentheses:"#fdba74",tok_double_brackets:"#f5f5f4",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#ef4444",muted_text:"#b2a29c",surface:"#231d1f",success_bg:"#203326",danger_bg:"#4b1319",accent_bg:"#3b1016",accent_title:"#fecdd3",success_text:"#bbf7d0",error_text:"#fecaca",warning_text:"#fdba74"}}),I({name:"cadia_stands",display_name:"Cadia Stands",description:"Military olive, field khaki, and disciplined gold signals.",tags:["builtin","warhammer","imperium","guard"],based_on:"dark",colors:{background:"#11160f",text:"#e6ecd8",accent:"#c8a54b",button:"#3a4b2a",button_text:"#f8faee",border:"#556a3e",highlight:"#a3c76d",window:"#171d14",tok_brackets:"#a3c76d",tok_asterisk:"#facc15",tok_parentheses:"#fb923c",tok_double_brackets:"#d9f99d",tok_curly_braces:"#86efac",tok_pipes:"#93c5fd",tok_at_sign:"#f87171",muted_text:"#99a58b",surface:"#20281b",success_bg:"#243624",danger_bg:"#4a2218",accent_bg:"#3e3413",accent_title:"#f5e6b1",success_text:"#bbf7d0",error_text:"#fca5a5",warning_text:"#fde68a"}}),I({name:"krieg_ash",display_name:"Krieg Ash",description:"Trenchcoat slate, muddy blue, and mask-lens amber.",tags:["builtin","warhammer","imperium","guard"],based_on:"dark",colors:{background:"#101417",text:"#dae1e5",accent:"#d1a449",button:"#3a4854",button_text:"#f6f7f8",border:"#55616c",highlight:"#9db7c7",window:"#151b20",tok_brackets:"#93c5fd",tok_asterisk:"#facc15",tok_parentheses:"#fb923c",tok_double_brackets:"#cbd5e1",tok_curly_braces:"#86efac",tok_pipes:"#67e8f9",tok_at_sign:"#f87171",muted_text:"#8e9aa3",surface:"#1d242a",success_bg:"#233127",danger_bg:"#48231c",accent_bg:"#3f3118",accent_title:"#f4deb1",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde68a"}}),I({name:"thousand_sons",display_name:"Thousand Sons",description:"Arcane cobalt with turquoise sorcery and gilded trim.",tags:["builtin","warhammer","chaos","arcane"],based_on:"dark",colors:{background:"#081427",text:"#dce9ff",accent:"#22d3ee",button:"#12335f",button_text:"#f0f9ff",border:"#1d4f91",highlight:"#7dd3fc",window:"#0d1b35",tok_brackets:"#38bdf8",tok_asterisk:"#facc15",tok_parentheses:"#fb7185",tok_double_brackets:"#67e8f9",tok_curly_braces:"#a78bfa",tok_pipes:"#22d3ee",tok_at_sign:"#f97316",muted_text:"#96a9c6",surface:"#132346",success_bg:"#14312c",danger_bg:"#451b2f",accent_bg:"#10354d",accent_title:"#cffafe",success_text:"#99f6e4",error_text:"#f9a8d4",warning_text:"#fde047"}}),I({name:"drukhari_raid",display_name:"Drukhari Raid",description:"Poison teal, blade violet, and void-black lacquer.",tags:["builtin","warhammer","aeldari","neon"],based_on:"dark",colors:{background:"#09070f",text:"#ece7ff",accent:"#14b8a6",button:"#2c1144",button_text:"#f5f3ff",border:"#5b21b6",highlight:"#5eead4",window:"#100b1a",tok_brackets:"#2dd4bf",tok_asterisk:"#c084fc",tok_parentheses:"#f472b6",tok_double_brackets:"#67e8f9",tok_curly_braces:"#a78bfa",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#9d94b8",surface:"#170f25",success_bg:"#123028",danger_bg:"#43162e",accent_bg:"#102f31",accent_title:"#ccfbf1",success_text:"#99f6e4",error_text:"#f9a8d4",warning_text:"#f0abfc"}}),I({name:"ork_waaagh",display_name:"Ork Waaagh!",description:"Scrap metal, noisy green, and red-goes-fasta contrast.",tags:["builtin","warhammer","ork","high-energy"],based_on:"dark",colors:{background:"#11140c",text:"#e2f5b8",accent:"#67e01f",button:"#734116",button_text:"#fff7ed",border:"#4b5f1a",highlight:"#84cc16",window:"#181d10",tok_brackets:"#84cc16",tok_asterisk:"#ef4444",tok_parentheses:"#f97316",tok_double_brackets:"#bef264",tok_curly_braces:"#facc15",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#9eb279",surface:"#232813",success_bg:"#26401d",danger_bg:"#5a2314",accent_bg:"#293a12",accent_title:"#d9f99d",success_text:"#d9f99d",error_text:"#fdba74",warning_text:"#fde047"}}),I({name:"tau_sept",display_name:"Tau Sept",description:"Clean ochre, alloy grey, and cool interface blue.",tags:["builtin","warhammer","tau","clean"],based_on:"dark",colors:{background:"#11161a",text:"#e8edf0",accent:"#f59e0b",button:"#41525f",button_text:"#f8fafc",border:"#617688",highlight:"#7dd3fc",window:"#161d23",tok_brackets:"#93c5fd",tok_asterisk:"#fbbf24",tok_parentheses:"#fb923c",tok_double_brackets:"#cbd5e1",tok_curly_braces:"#67e8f9",tok_pipes:"#38bdf8",tok_at_sign:"#f97316",muted_text:"#9aa8b2",surface:"#202930",success_bg:"#1e3430",danger_bg:"#4a2218",accent_bg:"#41320c",accent_title:"#fde68a",success_text:"#99f6e4",error_text:"#fdba74",warning_text:"#fde047"}}),I({name:"tyranid_hive",display_name:"Tyranid Hive",description:"Bone chitin, toxic magenta, and abyssal carapace purple.",tags:["builtin","warhammer","tyranid","organic"],based_on:"dark",colors:{background:"#120c18",text:"#f3e8ff",accent:"#f472b6",button:"#3f1b4d",button_text:"#fff7fb",border:"#6b2d78",highlight:"#f9a8d4",window:"#1a1222",tok_brackets:"#f5d0fe",tok_asterisk:"#fb7185",tok_parentheses:"#fdba74",tok_double_brackets:"#e9d5ff",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#f43f5e",muted_text:"#b7a3c4",surface:"#24182f",success_bg:"#243321",danger_bg:"#4f1733",accent_bg:"#441a3d",accent_title:"#fbcfe8",success_text:"#bef264",error_text:"#fda4af",warning_text:"#fdba74"}}),I({name:"genestealer_cult",display_name:"Genestealer Cult",description:"Industrial violet with warning pink and cult neon accents.",tags:["builtin","warhammer","tyranid","industrial"],based_on:"dark",colors:{background:"#0f1020",text:"#ede9fe",accent:"#8b5cf6",button:"#312e81",button_text:"#f5f3ff",border:"#5b4bc4",highlight:"#c084fc",window:"#151730",tok_brackets:"#a78bfa",tok_asterisk:"#fb7185",tok_parentheses:"#f97316",tok_double_brackets:"#ddd6fe",tok_curly_braces:"#67e8f9",tok_pipes:"#c084fc",tok_at_sign:"#f43f5e",muted_text:"#a6a1c9",surface:"#1d2040",success_bg:"#203229",danger_bg:"#47152a",accent_bg:"#2e255d",accent_title:"#e9d5ff",success_text:"#99f6e4",error_text:"#fda4af",warning_text:"#fdba74"}}),I({name:"golden_throne",display_name:"Golden Throne",description:"Black marble, relic gold, and cathedral ivory.",tags:["builtin","warhammer","imperium","gold"],based_on:"dark",colors:{background:"#110f0d",text:"#f6efe2",accent:"#d4af37",button:"#4a3510",button_text:"#fffbeb",border:"#6f5521",highlight:"#f6d365",window:"#171411",tok_brackets:"#fcd34d",tok_asterisk:"#fda4af",tok_parentheses:"#fdba74",tok_double_brackets:"#fef3c7",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#f87171",muted_text:"#b3a58d",surface:"#231e18",success_bg:"#253224",danger_bg:"#472119",accent_bg:"#433311",accent_title:"#fef3c7",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde68a"}})];class te{constructor(e){this.executor=e}readers=[];onComplete;onError;controller=new AbortController;subscribe(e){return this.readers.push(e),this}onComplete_(e){return this.onComplete=e,this}onError_(e){return this.onError=e,this}async start(){try{await this.executor({emit:(e,t)=>this.emit(e,t),signal:this.controller.signal})}catch(e){if(this.controller.signal.aborted)return;this.emit("error",{error:e instanceof Error?e.message:"Stream failed"})}}abort(){this.controller.abort()}emit(e,t){const n={event:e,data:t};this.readers.forEach(s=>s(n)),n.event==="complete"&&this.onComplete&&this.onComplete(n.data),n.event==="error"&&this.onError&&this.onError(n.data.error)}}class D extends Error{constructor(e,t){super(t),this.status=e,this.name="APIError"}}function ui(r,e){if(typeof window>"u")return e;const t=Array.isArray(r)?[...r]:[r],[n,...s]=t;try{for(const a of t){const o=window.localStorage.getItem(a);if(!o)continue;const c=JSON.parse(o);return a!==n&&(window.localStorage.setItem(n,JSON.stringify(c)),s.forEach(l=>window.localStorage.removeItem(l))),c}}catch{return e}return e}function pi(r,e,t){typeof window>"u"||(window.localStorage.setItem(r,JSON.stringify(t)),e.forEach(n=>window.localStorage.removeItem(n)))}function Tt(r){return r.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function At(){return{...T.getConfig(),api_keys:T.getApiKeys()}}function mi(r){return r.engine_mode==="explicit"&&r.engine!=="auto"&&r.engine!=="openai_compatible"?r.engine:r.model?Gt(r.model):void 0}function Qn(r){return Object.values(r).find(e=>typeof e=="string"&&e.trim().length>0)}function hi(r,e){const t=e[r];return typeof t=="string"&&t.trim().length>0?t:Qn(e)}function le(){return ui([Jn,...Xn],[])}function Se(r){pi(Jn,Xn,r)}function Ze(){return[...di,...le()]}function Tr(r){typeof window>"u"||window.dispatchEvent(new CustomEvent(r))}function mt(r){return typeof r.archived_at=="string"&&r.archived_at.trim().length>0}function fi(r,e,t=r,n=t){const s=t.reduce((a,o)=>{a.total_drafts+=1,mt(o)&&(a.archived_drafts+=1),o.favorite&&(a.favorites+=1);const c=o.genre||"unknown",l=o.mode||"unknown";return a.by_genre[c]=(a.by_genre[c]||0)+1,a.by_mode[l]=(a.by_mode[l]||0)+1,a},{total_drafts:0,archived_drafts:n.filter(a=>mt(a)).length,favorites:0,by_genre:{},by_mode:{}});return{drafts:r,total:e,stats:s}}function gi(r,e){let t=[...r];if(e?.include_archived||(e?.archived?t=t.filter(c=>mt(c)):t=t.filter(c=>!mt(c))),e?.search){const c=e.search.toLowerCase();t=t.filter(l=>[l.character_name,l.seed,l.genre,l.notes].filter(Boolean).some(d=>String(d).toLowerCase().includes(c)))}e?.genre&&(t=t.filter(c=>c.genre===e.genre)),e?.mode&&(t=t.filter(c=>c.mode===e.mode)),e?.favorite!==void 0&&(t=t.filter(c=>c.favorite===e.favorite)),e?.tags?.length&&(t=t.filter(c=>e.tags?.every(l=>c.tags?.includes(l))));const n=e?.sort_order==="asc"?1:-1,s=e?.sort_by??"modified";t.sort((c,l)=>{const d=s==="name"?c.character_name||c.seed||"":(s==="created"?c.created:c.modified)||"",u=s==="name"?l.character_name||l.seed||"":(s==="created"?l.created:l.modified)||"";return d.localeCompare(u)*n});const a=e?.offset??0,o=e?.limit;return o!==void 0?t=t.slice(a,a+o):a>0&&(t=t.slice(a)),t}function Ar(r){const e=[],t=pe(r.metadata.template_name)||Me;return Jr(t).filter(s=>s.required).forEach(s=>{r.assets[s.name]?.trim()||e.push(`- missing required asset ${s.name}`)}),Object.entries(r.assets).forEach(([s,a])=>{if(!a.trim()){e.push(`- ${s}: asset is empty`);return}const o=qr(s,a);o.length>0&&e.push(`- ${s}: ${Array.from(new Set(o)).join(", ")}`)}),e.length===0?e.push("OK: no obvious placeholder violations found in saved assets."):e.unshift("VALIDATION FAILED"),{path:r.metadata.review_id,output:e.join(`
`),errors:"",exit_code:e[0]==="VALIDATION FAILED"?1:0,success:e[0]!=="VALIDATION FAILED"}}function Cr(r){const e=`${r.metadata.character_name||""}
${r.metadata.seed}
${Object.values(r.assets).join(`
`)}`.toLowerCase().replace(/[^a-z0-9\s]+/g," ").split(/\s+/).filter(t=>t.length>3);return new Set(e)}function yi(r){return r>=.7?"high":r>=.45?"medium":"low"}function bi(r,e){const t=Cr(r),n=Cr(e),s=[...t].filter(p=>n.has(p)),a=[...t].filter(p=>!n.has(p)),o=[...n].filter(p=>!t.has(p)),c=new Set([...t,...n]).size||1,l=s.length/c,d=Math.min(1,(a.length+o.length)/Math.max(c,1)),u=Math.min(1,l+.15);return{character1_name:r.metadata.character_name||r.metadata.seed,character2_name:e.metadata.character_name||e.metadata.seed,overall_score:l,compatibility:yi(l),conflict_potential:d,synergy_potential:u,commonalities:s.slice(0,8),differences:[...a.slice(0,4),...o.slice(0,4)],relationship_suggestions:l>=.6?["Shared themes suggest an easy alliance arc.","Overlapping traits support collaborative scenes."]:["Use the contrast between their goals for tension.","Differences suggest rivalry or uneasy partnership."],meta_analysis:{archetype_match:l,narrative_compatibility:u,audience_appeal:Math.max(l,.35)}}}function _i(r){const e=new Map;r.forEach(l=>{l.parent_drafts?.forEach(d=>{const u=e.get(d)??[];u.push(l.review_id),e.set(d,u)})});const t=new Map(r.map(l=>[l.review_id,l])),n=new Map,s=l=>{if(n.has(l))return n.get(l);const d=t.get(l);if(!d?.parent_drafts?.length)return n.set(l,0),0;const u=1+Math.max(...d.parent_drafts.map(p=>s(p)));return n.set(l,u),u},a=r.map(l=>{const d=l.parent_drafts??[],u=e.get(l.review_id)??[],p=s(l.review_id),m=d.map(f=>t.get(f)?.character_name||f),y=u.map(f=>t.get(f)?.character_name||f);return{id:l.review_id,review_id:l.review_id,draft_name:l.seed,character_name:l.character_name||l.seed,generation:p,is_root:d.length===0,is_leaf:u.length===0,offspring_type:l.offspring_type,mode:l.mode,model:l.model,created:l.created,parent_ids:d,child_ids:u,parent_names:m,child_names:y,sibling_names:d.flatMap(f=>(e.get(f)??[]).filter(g=>g!==l.review_id)).map(f=>t.get(f)?.character_name||f),num_ancestors:d.length,num_descendants:u.length}}),o=a.filter(l=>l.is_root).map(l=>l.id),c=a.reduce((l,d)=>Math.max(l,d.generation),0);return{nodes:a,roots:o,max_generation:c,stats:{total_characters:a.length,root_characters:a.filter(l=>l.is_root).length,leaf_characters:a.filter(l=>l.is_leaf).length,generations:c+1}}}function je(r,e,t){return{blob:new Blob([r],{type:t}),filename:e,contentType:t}}function Or(r){return r.replace(/^##/gm,"\\##")}async function Ir(r){const e=T.getConfig(),t=T.getApiKeys(),n=mi(e);return Ee({model:e.model,apiKey:n?t[n]:Qn(t),apiKeys:t,provider:n,baseUrl:e.base_url,temperature:e.temperature,maxTokens:e.max_tokens}).generateStream(r)}class wi{themesSyncPromise=null;draftsSyncPromise=null;configSyncPromise=null;async fetchOpenAICompatibleModels(e,t,n){const s=`${n}/models`,a=Ae(e,t),o=await fetch(s,{method:"GET",headers:a});if(!o.ok){let d=`HTTP ${o.status}`;try{const u=await o.json();typeof u.error=="string"?d=u.error:u.error?.message&&(d=u.error.message)}catch{}throw new D(o.status,d)}const l=((await o.json()).data||[]).filter(d=>!!d?.id).map(d=>({id:d.id,name:d.name||d.id,provider:e,context_length:d.context_length,supports_vision:d.architecture?.input_modalities?.includes("image")||!1,supports_tools:d.supported_parameters?.includes("tools")||!1}));return{provider:e,models:l,cached:!1}}async loadProviderModels(e,t=!1){const n=T.getApiKeys(),s=T.getConfig(),a=e,o=s.base_url||xa(a),c=hi(e,n),l=`${e}|${o}|${c?"auth":"anon"}`,d=Qe.get(l);if(!t&&d&&Date.now()-d.cachedAt<ci)return{...d.response,cached:!0};const u=(ur[a]||[]).map(m=>({id:m,name:m,provider:e})),p=["openrouter","openai","deepseek","zai","moonshot"].includes(e);if(!c||!p){const m={provider:e,models:u,cached:!0,error:c||p?void 0:"Provider model listing is not available in browser mode."};return Qe.set(l,{response:m,cachedAt:Date.now()}),m}try{const m=await this.fetchOpenAICompatibleModels(e,c,o);return Qe.set(l,{response:m,cachedAt:Date.now()}),m}catch(m){const f=m instanceof TypeError&&m.message==="Failed to fetch"?"Network request blocked. This may be due to browser privacy settings (common in EU), ad blockers, or firewall restrictions. Try disabling tracking protection for this site or using a different network.":m instanceof Error?m.message:"Failed to load models",g={provider:e,models:u,cached:!0,error:f};return Qe.set(l,{response:g,cachedAt:Date.now()}),g}}async getConfig(){return At()}getConfigSnapshot(){return At()}getThemesSnapshot(){return Ze()}async syncConfigFromServer(){return!v.isEnabled()||!v.hasAccessToken()?!1:this.configSyncPromise?this.configSyncPromise:(this.configSyncPromise=(async()=>{try{const[e,t]=await Promise.all([v.pullConfig(),v.pullApiKeys()]),n=T.getConfig(),s=T.getApiKeys(),a=e.config||{},o=t.apiKeys||{},c=JSON.stringify(n)!==JSON.stringify({...n,...a}),l=JSON.stringify(s)!==JSON.stringify(o);return!c&&!l?!1:(T.updateConfig(a),T.replaceApiKeys(o),!0)}catch(e){return console.warn("Failed to sync config from server:",e),!1}finally{this.configSyncPromise=null}})(),this.configSyncPromise)}async updateConfig(e){const t={...e};return e.api_keys&&(T.replaceApiKeys(e.api_keys),delete t.api_keys),T.updateConfig(t),N("config"),this.getConfig()}async testConnection(e){const t=T.getApiKeys()[e.provider];if(!t)return{success:!1,error:`No API key configured for ${e.provider}`};const n=e.model||ur[e.provider]?.[0]||At().model;return Ee({model:n,apiKey:t,provider:e.provider,baseUrl:e.base_url}).testConnection()}async syncThemesFromServer(){return this.themesSyncPromise?this.themesSyncPromise:(this.themesSyncPromise=(async()=>{if(!v.isEnabled()||!v.hasAccessToken())return!1;try{const{themes:e}=await v.syncThemes("pull"),t=le();let n=!1;for(const s of e){if(s.isBuiltin)continue;const a={name:s.name,display_name:s.displayName||s.name,description:s.description||"",author:s.author||"",tags:s.tags,based_on:s.basedOn||"",is_builtin:!1,colors:s.colors},o=t.findIndex(c=>c.name===s.name);o>=0?JSON.stringify(t[o])!==JSON.stringify(a)&&(t[o]=a,n=!0):(t.push(a),n=!0)}return n&&(Se(t),Tr(Ut)),n}catch(e){return console.warn("Failed to sync themes from server:",e),!1}finally{this.themesSyncPromise=null}})(),this.themesSyncPromise)}async syncDraftsFromServer(){return this.draftsSyncPromise?this.draftsSyncPromise:(this.draftsSyncPromise=(async()=>{if(!v.isEnabled()||!v.hasAccessToken())return!1;try{const{drafts:e}=await v.syncDrafts("pull");let t=!1;for(const n of e){const s=await P.getDraft(n.reviewId);if(!s){await P.saveDraft({path:n.reviewId,metadata:{review_id:n.reviewId,seed:n.seed,mode:n.mode,model:n.model,created:n.createdAt,modified:n.updatedAt,archived_at:n.archivedAt,character_name:n.characterName,template_name:n.templateName,genre:n.genre,notes:n.notes,favorite:n.favorite,tags:n.tags,offspring_type:n.offspringType,custom_instructions:n.customInstructions,component_send_order:n.componentSendOrder,connected_drafts:n.connectedDraftIds},assets:n.assets}),t=!0;continue}const a=new Date(s.metadata.modified||0).getTime();new Date(n.updatedAt).getTime()>a&&(await P.saveDraft({path:s.path,metadata:{...s.metadata,seed:n.seed,mode:n.mode,model:n.model,created:n.createdAt,modified:n.updatedAt,archived_at:n.archivedAt,character_name:n.characterName,template_name:n.templateName,genre:n.genre,notes:n.notes,favorite:n.favorite,tags:n.tags,offspring_type:n.offspringType,custom_instructions:n.customInstructions,component_send_order:n.componentSendOrder,connected_drafts:n.connectedDraftIds},assets:n.assets}),t=!0)}return t&&Tr($t),t}catch(e){return console.warn("Failed to sync drafts from server:",e),!1}finally{this.draftsSyncPromise=null}})(),this.draftsSyncPromise)}async getThemes(){return this.syncThemesFromServer(),this.getThemesSnapshot()}async createTheme(e){const t=le();if(Ze().some(s=>s.name===e.name))throw new D(409,`Theme ${e.name} already exists`);const n={...e,description:e.description||"",author:e.author||"",tags:e.tags||[],based_on:e.based_on||"",is_builtin:!1};return t.push(n),Se(t),N("themes"),n}async exportTheme(e){const t=Ze().find(n=>n.name===e);if(!t)throw new D(404,`Theme ${e} not found`);return je(JSON.stringify(t,null,2),`${Tt(e)}.json`,"application/json")}async importTheme(e,t={}){const s={...JSON.parse(await e.text()),is_builtin:!1},a=le(),o=a.findIndex(c=>c.name===s.name);if(o>=0)if(t.conflict_strategy==="overwrite")a[o]=s;else if(t.conflict_strategy==="rename")s.name=t.target_name||`${s.name}_copy`,a.push(s);else throw new D(409,`Theme ${s.name} already exists`);else a.push(s);return Se(a),N("themes"),s}async updateTheme(e,t){const n=le(),s=n.findIndex(a=>a.name===e);if(s<0)throw new D(404,`Theme ${e} is builtin or missing`);return n[s]={...n[s],...t},Se(n),N("themes"),n[s]}async duplicateTheme(e,t){const n=Ze().find(s=>s.name===e);if(!n)throw new D(404,`Theme ${e} not found`);return this.createTheme({name:t.new_name,display_name:t.display_name||n.display_name,description:t.description||n.description,author:t.author||n.author,tags:t.tags||n.tags,based_on:t.based_on||n.name,colors:n.colors})}async renameTheme(e,t){return this.updateTheme(e,{display_name:t.display_name,...t.new_name!==e?{}:{}}).then(n=>{const s=le(),a=s.findIndex(o=>o.name===e);if(a<0)throw new D(404,`Theme ${e} is builtin or missing`);return s[a]={...n,name:t.new_name},Se(s),N("themes"),s[a]})}async deleteTheme(e){const t=le().filter(n=>n.name!==e);return Se(t),N("themes"),{status:"deleted",name:e}}async getModels(e){return this.loadProviderModels(e,!1)}async refreshModels(e){const t=await this.loadProviderModels(e,!0);return{status:"ok",model_count:t.models.length,error:t.error}}async generateSeeds(e){const t=[];for await(const n of ee.generateSeeds(e))n.type==="complete"&&n.content&&t.push(...n.content.split(`
`).map(s=>s.trim()).filter(Boolean));return{seeds:[...new Set(t)]}}async getTemplates(){if(v.isEnabled()&&v.hasAccessToken())try{const{templates:e=[]}=await v.syncTemplates("pull"),t=me();for(const n of e){const s=ai(n);!s||yr(s.template.name)||t.push(s)}Ye(t)}catch(e){console.warn("Failed to sync templates from server:",e)}return qt().map(e=>e.template)}async listTemplates(){return this.getTemplates()}async getTemplate(e){const t=re(e);if(!t)throw new D(404,`Template ${e} not found`);return t.template}async getTemplateBlueprintContents(e){const t=re(e);if(!t)throw new D(404,`Template ${e} not found`);return{blueprint_contents:t.blueprint_contents}}async createTemplate(e){const t=me();if(t.some(a=>a.template.name===e.name))throw new D(409,`Template ${e.name} already exists`);const n={name:e.name,version:e.version,description:e.description,assets:e.assets,is_official:!1},s={template:n,blueprint_contents:e.blueprint_contents};return t.push(s),Ye(t),N("templates"),n}async updateTemplate(e,t){const n=me(),s=n.findIndex(a=>a.template.name===e);if(s<0){if(!re(e))throw new D(404,`Template ${e} not found`);const o=ii(t.name,e);return this.createTemplate({...t,name:o})}if(t.name!==e){const a=re(t.name);if(a&&a.template.name!==e)throw new D(409,`Template ${t.name} already exists`)}return n[s]={template:{name:t.name,version:t.version,description:t.description,assets:t.assets,is_official:!1},blueprint_contents:t.blueprint_contents},Ye(n),N("templates"),n[s].template}async deleteTemplate(e){const t=me().filter(n=>n.template.name!==e);return Ye(t),N("templates"),{status:"deleted",name:e}}async duplicateTemplate(e,t){const n=re(e);if(!n)throw new D(404,`Template ${e} not found`);return this.createTemplate({name:t.name,version:t.version||n.template.version,description:n.template.description,assets:n.template.assets,blueprint_contents:n.blueprint_contents})}async validateTemplate(e){const t=re(e);if(!t)throw new D(404,`Template ${e} not found`);const n=ua(t.template),s=t.template.assets.filter(a=>!t.blueprint_contents[a.blueprint_file||`${a.name}.md`]).map(a=>`Missing blueprint content for ${a.name}`);return{errors:n.errors,warnings:s}}async exportTemplate(e){const t=yr(e)??re(e);if(!t)throw new D(404,`Template ${e} not found`);return je(JSON.stringify(t,null,2),`${Tt(e)}.json`,"application/json")}async importTemplate(e){const t=JSON.parse(await e.text());if("template"in t&&t.template){const n=t;return this.createTemplate({name:n.template.name,version:n.template.version,description:n.template.description,assets:n.template.assets,blueprint_contents:n.blueprint_contents})}return this.createTemplate({name:t.name||e.name.replace(/\.[^.]+$/,""),version:t.version||"1.0",description:t.description||"",assets:t.assets||[],blueprint_contents:t.blueprint_contents||{}})}async getDrafts(e){const t=await P.getAllMetadata({includeArchived:!0});this.syncDraftsFromServer();const n=gi(t,e);return fi(n,n.length,n,t)}async listDrafts(e){return this.getDrafts(e)}async getDraft(e){const t=await P.getDraft(e);if(!t)throw new D(404,`Draft ${e} not found`);return t}async updateMetadata(e,t){return await P.updateMetadata(e,t),N("drafts"),{status:"updated",draft_id:e}}async archiveDraft(e){return await P.updateMetadata(e,{archived_at:new Date().toISOString()}),N("drafts"),{status:"archived",draft_id:e}}async restoreDraft(e){return await P.updateMetadata(e,{archived_at:void 0}),N("drafts"),{status:"restored",draft_id:e}}async deleteDraft(e){return await P.deleteDraft(e),N("drafts"),{status:"deleted",draft_id:e}}async updateAsset(e,t,n,s={}){const a=await P.updateAsset(e,t,n,s);return N("drafts"),{status:a,draft_id:e,asset_name:t}}async validateDraft(e){const t=await this.getDraft(e);return Ar(t)}async validatePath(e){const t=e.path.trim().replace(/^drafts\//,""),n=await P.getDraft(t);return n?Ar(n):{path:e.path,output:`VALIDATION FAILED
- Browser-only mode can validate saved IndexedDB drafts by review ID only.`,errors:"",exit_code:1,success:!1}}generate(e){return new te(async({emit:t,signal:n})=>{for await(const s of ee.generate(e,{signal:n})){if(n.aborted)return;if(s.type==="chunk"&&t("chunk",{content:s.content||""}),s.type==="complete"){const a=s.asset||"",o=a?await P.getDraft(a):null;t("complete",{draft_path:a,draft_id:a,character_name:o?.metadata.character_name,duration_ms:0})}s.type==="error"&&t("error",{error:s.error||"Generation failed"})}})}generateAsset(e){return new te(async({emit:t,signal:n})=>{for await(const s of ee.generateAsset(e)){if(n.aborted)return;s.type==="chunk"&&t("chunk",{content:s.content||""}),s.type==="asset"&&t("complete",{asset_name:e.asset_name,content:s.content||""}),s.type==="error"&&t("error",{error:s.error||"Asset generation failed"})}})}previewBlueprint(e){return new te(async({emit:t,signal:n})=>{for await(const s of ee.previewBlueprint(e)){if(n.aborted)return;s.type==="chunk"&&t("chunk",{content:s.content||""}),s.type==="asset"&&t("complete",{asset_name:e.asset_name,content:s.content||"",system_prompt:s.systemPrompt||"",user_prompt:s.userPrompt||""}),s.type==="error"&&t("error",{error:s.error||"Blueprint preview failed"})}})}async finalizeGeneration(e){const t=crypto.randomUUID(),n=ct(e.assets,e.template),s={path:t,metadata:{review_id:t,seed:e.seed,mode:e.mode,model:T.getConfig().model,created:new Date().toISOString(),modified:new Date().toISOString(),favorite:!1,template_name:e.template,character_name:n},assets:e.assets};return await P.saveDraft(s),N("drafts"),{draft_path:t,draft_id:t,character_name:n,duration_ms:0}}generateBatch(e,t){return new te(async({emit:n,signal:s})=>{const a=async(o,c)=>{n("batch_start",{index:c,seed:o});try{let l="";for await(const d of ee.generate({seed:o,mode:t.mode,template:t.template,connected_draft_ids:t.connected_draft_ids},{signal:s})){if(s.aborted)return;d.type==="complete"&&(l=d.asset||"")}n("batch_complete",{index:c,seed:o,draft_path:l})}catch(l){n("batch_error",{index:c,seed:o,error:l instanceof Error?l.message:"Batch generation failed"})}};if(t.parallel){let o=0;const c=Math.min(Math.max(t.max_concurrent??3,1),e.length||1);await Promise.all(Array.from({length:c},async()=>{for(;!s.aborted;){const l=o;if(o+=1,l>=e.length)return;await a(e[l],l)}}))}else for(let o=0;o<e.length;o+=1){if(s.aborted)return;await a(e[o],o)}s.aborted||n("complete",{status:"done"})})}async getLineage(){const e=await P.getAllMetadata();return _i(e)}async analyzeSimilarity(e){const t=await this.getDraft(e.draft1_id),n=await this.getDraft(e.draft2_id),s=bi(t,n);if(!e.include_llm_analysis)return s;try{const a=await ee.analyzeSimilarity(e.draft1_id,e.draft2_id),o=Array.isArray(a.story_opportunities)?a.story_opportunities.map(d=>String(d)).slice(0,4):s.relationship_suggestions,c=Array.isArray(a.scene_suggestions)?a.scene_suggestions.map(d=>String(d)).slice(0,3):s.relationship_suggestions,l=[a.narrative_dynamics,a.relationship_arc].filter(d=>typeof d=="string"&&d.trim().length>0).join(`

`)||(typeof a.raw=="string"?a.raw:"LLM analysis unavailable.");return{...s,relationship_suggestions:c,llm_analysis:{relationship_potential:l,conflict_areas:s.differences.slice(0,4),synergy_areas:s.commonalities.slice(0,4),story_hooks:o}}}catch{return s}}generateOffspring(e){return new te(async({emit:t,signal:n})=>{for await(const s of ee.generateOffspring(e,{signal:n})){if(n.aborted)return;if(s.type==="status"&&t("status",{stage:s.stage,asset:s.asset,progress:s.progress}),s.type==="chunk"&&t("chunk",{content:s.content||""}),s.type==="complete"){const a=s.asset||"",o=a?await P.getDraft(a):null;t("complete",{draft_id:a,character_name:o?.metadata.character_name})}s.type==="error"&&t("error",{error:s.error||"Offspring generation failed"})}})}generateOffspringSeed(e){return new te(async({emit:t,signal:n})=>{for await(const s of ee.generateOffspringSeed(e,{signal:n})){if(n.aborted)return;s.type==="status"&&t("status",{stage:s.stage,asset:s.asset,progress:s.progress}),s.type==="chunk"&&t("chunk",{content:s.content||""}),s.type==="complete"&&t("complete",{content:s.content||""}),s.type==="error"&&t("error",{error:s.error||"Offspring seed generation failed"})}})}generateLorebook(e){return new te(async({emit:t,signal:n})=>{for await(const s of ee.generateLorebook(e,{signal:n})){if(n.aborted)return;s.type==="status"&&t("status",{stage:s.stage,asset:s.asset,progress:s.progress}),s.type==="chunk"&&t("chunk",{content:s.content||""}),s.type==="complete"&&t("complete",{content:s.content||""}),s.type==="error"&&t("error",{error:s.error||"Lorebook generation failed"})}})}async getExportPresets(){return li}async exportDraft(e){const t=await this.getDraft(e.draft_id),n=e.preset||"json",s=e.include_metadata!==!1,a=Tt(t.metadata.character_name||t.metadata.seed||t.metadata.review_id);if(n==="text"){const o=Object.entries(t.assets).map(([c,l])=>`## ${c}

${Or(l)}`).join(`

`);return je(o,`${a}.txt`,"text/plain")}if(n==="combined"){const o=[`# ${t.metadata.character_name||t.metadata.seed}`,s?`## Metadata

${JSON.stringify(t.metadata,null,2)}`:"",...Object.entries(t.assets).map(([c,l])=>`## ${c}

${Or(l)}`)].filter(Boolean);return je(o.join(`

`),`${a}.md`,"text/markdown")}return je(JSON.stringify({metadata:s?t.metadata:void 0,assets:t.assets},null,2),`${a}.json`,"application/json")}async getBlueprints(){if(v.isEnabled()&&v.hasAccessToken())try{const{blueprints:t=[]}=await v.syncBlueprints("list"),n=ne();let s=n;for(const a of t){if(a.isBuiltin===!0||a.is_builtin===!0||typeof a.path!="string"||typeof a.content!="string")continue;const o=oi(a.path);Object.prototype.hasOwnProperty.call(n,o)||(s===n&&(s={...n}),s[o]=a.content)}s!==n&&ve(s)}catch(t){console.warn("Failed to sync blueprints from server:",t)}const e=[...ue().values()];return{core:e.filter(t=>t.category==="core"),system:e.filter(t=>t.category==="system"),templates:{local:e.filter(t=>t.category==="template")},examples:e.filter(t=>t.category==="example")}}async getBlueprint(e){const t=ue().get(e);if(!t)throw new D(404,`Blueprint ${e} not found`);return t}async updateBlueprint(e,t){if(tt(e)!==null&&!An(e)){const a=ni(e,t),o=$a(a.name||e,e);return this.createBlueprint(o,t)}const s=ne();return s[e]=t,ve(s),N("blueprints"),this.getBlueprint(e)}async deleteBlueprint(e){if(tt(e)!==null)throw new D(400,`Cannot delete built-in blueprint ${e}`);const t=ne();return delete t[e],ve(t),N("blueprints"),{status:"deleted",path:e}}async resetBlueprint(e){const t=ne();delete t[e],ve(t),N("blueprints");const n=this.getBlueprint(e);if(!n)throw new D(404,`Blueprint ${e} not found`);return n}async createBlueprint(e,t){if(ue().get(e))throw new D(409,`Blueprint ${e} already exists`);const s=ne();return s[e]=t,ve(s),N("blueprints"),this.getBlueprint(e)}async duplicateBlueprint(e,t){const n=ue().get(e);if(!n)throw new D(404,`Source blueprint ${e} not found`);if(ue().get(t))throw new D(409,`Blueprint ${t} already exists`);const a=ne();return a[t]=n.content,ve(a),N("blueprints"),this.getBlueprint(t)}hasBlueprintOverride(e){return Ga(e)}getOriginalBlueprintContent(e){return tt(e)}chat(e){return new te(async({emit:t,signal:n})=>{const s=e.draft_id?await P.getDraft(e.draft_id):null,a=[s?`Current draft metadata: ${JSON.stringify(s.metadata)}`:"",e.context_asset&&s?.assets[e.context_asset]?`Focused asset (${e.context_asset}):
${s.assets[e.context_asset]}`:"",e.screen_context?`Screen context: ${JSON.stringify(e.screen_context)}`:""].filter(Boolean),o=[{role:"system",content:"You are the in-app assistant for Eidolon Simulacra, a browser-only blueprint compiler. Be concise and practical. Use provided draft or screen context when relevant."},...a.length>0?[{role:"system",content:a.join(`

`)}]:[],...e.messages],c=await Ir(o);let l="";for await(const d of c){if(n.aborted)return;if(d.content&&(l+=d.content,t("chunk",{content:d.content})),d.done)break}t("complete",{content:l})})}refine(e){return new te(async({emit:t,signal:n})=>{const s=await this.getDraft(e.draft_id),a=s.assets[e.asset];if(!a)throw new D(404,`Asset ${e.asset} not found in draft`);const o=[{role:"system",content:"Rewrite the provided asset according to the user request. Return only the revised asset content with no extra commentary."},{role:"user",content:`Draft seed: ${s.metadata.seed}
Asset: ${e.asset}

Current content:
${a}

Revision request:
${e.message}`}],c=await Ir(o);let l="";for await(const d of c){if(n.aborted)return;if(d.content&&(l+=d.content,t("chunk",{content:d.content})),d.done)break}t("complete",{content:l})})}}const z=new wi;function G(...r){return Os(Is(r))}const vi=h.createContext(null);function xi({children:r}){const[e,t]=h.useState({ownerId:null,screenContext:{},serializedContext:""}),n=h.useCallback((o,c,l)=>{t(d=>d.ownerId===o&&d.serializedContext===l?d:{ownerId:o,screenContext:c,serializedContext:l})},[]),s=h.useCallback(o=>{t(c=>c.ownerId!==o||c.ownerId===null&&c.serializedContext===""?c:{ownerId:null,screenContext:{},serializedContext:""})},[]),a=h.useMemo(()=>({screenContext:e.screenContext,setScreenContext:n,clearScreenContext:s}),[s,n,e.screenContext]);return i.jsx(vi.Provider,{value:a,children:r})}function ki({entry:r,topics:e,isOpen:t,onClose:n}){return t?i.jsxs(i.Fragment,{children:[i.jsx("div",{className:"fixed inset-0 z-30 bg-black/40 backdrop-blur-sm",onClick:n}),i.jsxs("aside",{"aria-label":"Contextual help",className:"fixed right-0 top-0 z-40 flex h-dvh w-full max-w-[24rem] flex-col border-l border-border bg-card/96 shadow-2xl backdrop-blur-md transition-transform duration-300 ease-out translate-x-0",children:[i.jsxs("div",{className:"flex items-start justify-between gap-4 border-b border-border/60 p-4",children:[i.jsxs("div",{children:[i.jsx("p",{className:"text-xs font-semibold uppercase tracking-[0.16em] text-primary",children:"Contextual Help"}),i.jsx("h2",{className:"mt-2 text-lg font-semibold text-foreground",children:r.title}),i.jsx("p",{className:"mt-2 text-sm leading-6 text-muted-foreground",children:r.summary})]}),i.jsx("button",{type:"button",onClick:n,title:"Close help panel",className:"rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",children:i.jsx(Le,{className:"h-4 w-4"})})]}),i.jsxs("div",{className:"min-h-0 flex-1 space-y-5 overflow-y-auto p-4",children:[i.jsxs("section",{className:"rounded-lg border border-border/60 bg-background/40 p-3.5",children:[i.jsxs("div",{className:"flex items-center gap-2 text-foreground",children:[i.jsx(ts,{className:"h-4 w-4 text-primary"}),i.jsx("h3",{className:"font-semibold",children:"What to do on this page"})]}),i.jsx("div",{className:"mt-3 space-y-3",children:r.keyActions.map(s=>i.jsxs("div",{className:"flex items-start gap-3 text-sm text-muted-foreground",children:[i.jsx("div",{className:"mt-2 h-1.5 w-1.5 rounded-full bg-primary"}),i.jsx("p",{className:"leading-6",children:s})]},s))})]}),i.jsxs("section",{className:"rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5",children:[i.jsxs("div",{className:"flex items-center gap-2 text-foreground",children:[i.jsx(rs,{className:"h-4 w-4 text-amber-500"}),i.jsx("h3",{className:"font-semibold",children:"Common mistakes to avoid"})]}),i.jsx("div",{className:"mt-3 space-y-3",children:r.pitfalls.map(s=>i.jsxs("div",{className:"flex items-start gap-3 text-sm text-muted-foreground",children:[i.jsx("div",{className:"mt-2 h-1.5 w-1.5 rounded-full bg-amber-500"}),i.jsx("p",{className:"leading-6",children:s})]},s))})]}),i.jsxs("section",{className:"rounded-lg border border-border/60 bg-background/40 p-3.5",children:[i.jsx("h3",{className:"font-semibold text-foreground",children:"Useful next steps"}),i.jsxs("div",{className:"mt-3 flex flex-wrap gap-2.5",children:[i.jsxs(K,{to:"/help",onClick:n,className:"inline-flex items-center gap-2 rounded-md border border-border/60 bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:["Open Help Center",i.jsx(Zt,{className:"h-4 w-4"})]}),r.actions.map(s=>i.jsxs(K,{to:s.to,onClick:n,className:"inline-flex items-center gap-2 rounded-md border border-border/60 bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:[s.label,i.jsx(Zt,{className:"h-4 w-4"})]},`${r.id}-${s.to}`))]})]}),e.length>0&&i.jsxs("section",{className:"space-y-3",children:[i.jsx("h3",{className:"text-base font-semibold text-foreground",children:"Related help topics"}),i.jsx("div",{className:"space-y-3",children:e.map(s=>i.jsxs("article",{className:"rounded-lg border border-border/60 bg-background/40 p-3.5",children:[i.jsx("div",{className:"flex items-center justify-between gap-3",children:i.jsxs("div",{children:[i.jsx("p",{className:"text-xs font-semibold uppercase tracking-[0.14em] text-primary",children:s.category}),i.jsx("h4",{className:"mt-1 font-semibold text-foreground",children:s.title})]})}),i.jsx("p",{className:"mt-2 text-sm leading-6 text-muted-foreground",children:s.summary}),i.jsx("div",{className:"mt-3 space-y-2",children:s.bullets.slice(0,2).map(a=>i.jsxs("div",{className:"flex items-start gap-3 text-sm text-muted-foreground",children:[i.jsx("div",{className:"mt-2 h-1.5 w-1.5 rounded-full bg-primary"}),i.jsx("p",{className:"leading-6",children:a})]},a))})]},s.id))})]})]})]})]}):null}const Xt="eidolon.web.activeTour";function Si(){try{const r=sessionStorage.getItem(Xt);if(!r)return null;const e=JSON.parse(r),t=st(e.activeTourId);return!t||e.activeStepIndex<0||e.activeStepIndex>=t.steps.length?null:e}catch{return null}}function Nr(){try{sessionStorage.removeItem(Xt)}catch{}}const Zn=h.createContext(null);function Ei({children:r}){const e=Ns(),t=Ge(),n=Si(),[s,a]=h.useState(n?.activeTourId??null),[o,c]=h.useState(n?.activeStepIndex??0),[l,d]=h.useState(()=>T.getHelpState()),u=()=>{d(T.getHelpState())};h.useEffect(()=>{if(!s){Nr();return}try{sessionStorage.setItem(Xt,JSON.stringify({activeTourId:s,activeStepIndex:o}))}catch{}},[o,s]),h.useEffect(()=>{const k=()=>{u()};return window.addEventListener(it,k),()=>{window.removeEventListener(it,k)}},[]);const p=async k=>{if(k.to!=="/drafts/"||(k.matchMode??"exact")!=="prefix")return k.to;if(t.pathname.startsWith("/drafts/"))return t.pathname;try{const U=(await z.getDrafts()).drafts[0]?.review_id;return U?`/drafts/${encodeURIComponent(U)}`:"/drafts"}catch{return"/drafts"}},m=async(k,j)=>{const U=st(k),H=U?.steps[j];!U||!H||(a(k),c(j),It(t.pathname,H)||e(await p(H)))},y=k=>{m(k,0)},f=k=>{const U={completed_tours:l.completed_tours.filter(H=>H!==k)};k===Ot&&(U.first_run_completed=!1,U.completed_guides=l.completed_guides.filter(H=>H!==nr)),T.updateHelpState(U),N("config"),u(),m(k,0)},g=()=>{Nr(),a(null),c(0)},O=()=>{s&&m(s,o)},S=()=>{!s||o===0||m(s,o-1)},B=()=>{if(!s)return;const j={completed_tours:Array.from(new Set([...l.completed_tours,s]))};s===Ot&&(j.first_run_completed=!0,j.completed_guides=Array.from(new Set([...l.completed_guides,nr]))),T.updateHelpState(j),N("config"),u(),g()},F=()=>{if(!s)return;const k=st(s);if(!k){g();return}if(o>=k.steps.length-1){B();return}m(s,o+1)},V=k=>{const j=Array.from(new Set([...l.dismissed_tips,k]));T.updateHelpState({dismissed_tips:j}),N("config"),u()},X=h.useMemo(()=>({tours:Kr,activeTourId:s,activeStepIndex:o,helpState:l,startTour:y,restartTour:f,closeTour:g,goToCurrentStep:O,goToNextStep:F,goToPreviousStep:S,finishTour:B,isTourCompleted:k=>l.completed_tours.includes(k),dismissTip:V}),[o,s,l]);return i.jsx(Zn.Provider,{value:X,children:r})}function Ti(){const r=h.useContext(Zn);if(!r)throw new Error("useGuidedTour must be used within GuidedTourProvider");return r}const Ai='[data-guided-tour-active="true"]';function Ci(){const r=Ge(),{activeTourId:e,activeStepIndex:t,closeTour:n,goToCurrentStep:s,goToNextStep:a,goToPreviousStep:o}=Ti(),[c,l]=h.useState(!1),d=e?st(e):null,u=d?.steps[t]??null;if(h.useEffect(()=>{if(document.querySelector(Ai)?.removeAttribute("data-guided-tour-active"),!u){l(!1);return}if(!It(r.pathname,u)||!u.targetId){l(!1);return}const g=document.querySelector(`[data-tour-anchor="${u.targetId}"]`);if(!g){l(!1);return}return g.setAttribute("data-guided-tour-active","true"),g.scrollIntoView({behavior:"smooth",block:"center",inline:"nearest"}),l(!0),()=>{g.removeAttribute("data-guided-tour-active")}},[u,r.pathname]),!d||!u)return null;const p=It(r.pathname,u),m=t===d.steps.length-1;return i.jsxs(i.Fragment,{children:[i.jsx("div",{className:"fixed inset-0 z-[70] bg-black/55",onClick:n}),i.jsxs("section",{className:"fixed inset-x-3 bottom-3 z-[80] max-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-2xl shadow-black/40 backdrop-blur-md sm:inset-x-auto sm:right-4 sm:w-[28rem]",children:[i.jsxs("div",{className:"flex items-start justify-between gap-4 border-b border-border/50 px-5 py-4",children:[i.jsxs("div",{children:[i.jsx("p",{className:"text-xs font-semibold uppercase tracking-[0.16em] text-primary",children:"Guided Tour"}),i.jsx("h2",{className:"mt-1 text-lg font-semibold text-foreground",children:d.title}),i.jsxs("p",{className:"mt-1 text-sm text-muted-foreground",children:["Step ",t+1," of ",d.steps.length]})]}),i.jsx("button",{type:"button",onClick:n,className:"rounded-lg border border-border/60 bg-background/50 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary","aria-label":"Close guided tour",children:i.jsx(Le,{className:"h-4 w-4"})})]}),i.jsxs("div",{className:"max-h-[calc(100dvh-12rem)] overflow-y-auto px-5 py-4",children:[i.jsxs("div",{className:"rounded-2xl border border-primary/20 bg-primary/5 p-4",children:[i.jsxs("div",{className:"flex items-center gap-2 text-sm font-medium text-primary",children:[i.jsx(ns,{className:"h-4 w-4"}),u.routeLabel]}),i.jsx("h3",{className:"mt-2 text-xl font-semibold text-foreground",children:u.title}),i.jsx("p",{className:"mt-2 text-sm leading-6 text-muted-foreground",children:u.description})]}),i.jsxs("div",{className:"mt-4 rounded-2xl border border-border/50 bg-background/40 p-4",children:[i.jsxs("div",{className:"flex items-center gap-2 text-sm font-medium text-foreground",children:[i.jsx(ss,{className:"h-4 w-4 text-primary"}),p?"You are on the expected page.":`This step expects ${u.routeLabel}.`]}),!p&&i.jsxs("button",{type:"button",onClick:s,className:"mt-3 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:["Return to this step",i.jsx(Te,{className:"h-4 w-4"})]})]}),u.targetLabel&&p&&i.jsxs("div",{className:"mt-4 rounded-2xl border border-border/50 bg-background/40 p-4",children:[i.jsxs("div",{className:"flex items-center gap-2 text-sm font-medium text-foreground",children:[i.jsx(as,{className:"h-4 w-4 text-primary"}),c?`Highlighted target: ${u.targetLabel}`:`Looking for ${u.targetLabel}`]}),i.jsx("p",{className:"mt-2 text-sm leading-6 text-muted-foreground",children:c?"The active control or section has been outlined on the page so you can orient yourself without hunting for it.":"If the highlighted target is not visible yet, stay on this page and give the layout a moment to settle."})]}),i.jsx("div",{className:"mt-4 space-y-3",children:u.bullets.map(y=>i.jsxs("div",{className:"flex items-start gap-3 rounded-xl border border-border/50 bg-background/40 p-4 text-sm text-muted-foreground",children:[i.jsx(os,{className:"mt-0.5 h-4 w-4 shrink-0 text-primary"}),i.jsx("p",{className:"leading-6",children:y})]},y))})]}),i.jsxs("div",{className:"flex items-center justify-between gap-3 border-t border-border/50 px-5 py-4",children:[i.jsxs("button",{type:"button",onClick:o,disabled:t===0,className:"inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50",children:[i.jsx(is,{className:"h-4 w-4"}),"Previous"]}),i.jsxs("div",{className:"flex items-center gap-3",children:[i.jsx("button",{type:"button",onClick:n,className:"inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:"Leave tour"}),i.jsxs("button",{type:"button",onClick:a,className:"inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",children:[m?"Finish tour":"Next step",i.jsx(Te,{className:"h-4 w-4"})]})]})]})]})]})}function Oi({drafts:r,isLoading:e}){const n=Ge().pathname.match(/^\/drafts\/([^/]+)$/),s=n?decodeURIComponent(n[1]):null,[a,o]=h.useState(""),[c,l]=h.useState(!1),[d,u]=h.useState(!1),[p,m]=h.useState(""),[y,f]=h.useState(""),[g,O]=h.useState("modified"),[S,B]=h.useState("desc"),{genres:F,modes:V}=h.useMemo(()=>{const b=new Set,A=new Set;return r.forEach(R=>{R.genre&&b.add(R.genre),R.mode&&A.add(R.mode)}),{genres:Array.from(b).sort(),modes:Array.from(A).sort()}},[r]),X=h.useMemo(()=>{let b=[...r];if(a){const A=a.toLowerCase();b=b.filter(R=>R.character_name?.toLowerCase().includes(A)||R.seed.toLowerCase().includes(A)||R.template_name?.toLowerCase().includes(A)||R.notes?.toLowerCase().includes(A))}return d&&(b=b.filter(A=>A.favorite)),p&&(b=b.filter(A=>A.mode===p)),y&&(b=b.filter(A=>A.genre===y)),b.sort((A,R)=>{let Q=0;switch(g){case"created":{const ie=A.created?new Date(A.created).getTime():0,ce=R.created?new Date(R.created).getTime():0;Q=ie-ce;break}case"modified":{const ie=A.modified?new Date(A.modified).getTime():A.created?new Date(A.created).getTime():0,ce=R.modified?new Date(R.modified).getTime():R.created?new Date(R.created).getTime():0;Q=ie-ce;break}case"name":{const ie=A.character_name||A.seed,ce=R.character_name||R.seed;Q=ie.localeCompare(ce);break}}return S==="asc"?Q:-Q}),b},[r,a,d,p,y,g,S]),k=a||d||p||y,j=+!!a+Number(d)+ +!!p+ +!!y,U=()=>{o(""),u(!1),m(""),f("")},H=h.useMemo(()=>{const b=r.length,A=r.filter(R=>R.favorite).length;return{total:b,favorites:A}},[r]);return i.jsxs("div",{className:"flex h-full min-h-0 min-w-0 flex-col overflow-hidden",children:[i.jsxs("div",{className:"border-b border-border/60 px-3 py-2.5",children:[i.jsx("h3",{className:"text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",children:"Draft Library"}),i.jsxs("div",{className:"mt-1.5 flex items-center gap-3 text-xs text-muted-foreground",children:[i.jsxs("span",{children:[H.total," drafts"]}),i.jsxs("span",{className:"flex items-center gap-1",children:[i.jsx(cs,{className:"h-3 w-3"}),H.favorites]})]})]}),i.jsx("div",{className:"border-b border-border/40 px-3 py-2",children:i.jsxs("div",{className:"relative",children:[i.jsx(ls,{className:"absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"}),i.jsx("input",{type:"text",placeholder:"Search drafts...",value:a,onChange:b=>o(b.target.value),className:"w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-8 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"}),a&&i.jsx("button",{type:"button",onClick:()=>o(""),className:"absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground","aria-label":"Clear search",children:i.jsx(Le,{className:"h-3.5 w-3.5"})})]})}),i.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-3 py-2",children:[i.jsxs("div",{className:"flex items-center gap-2",children:[i.jsxs("button",{type:"button",onClick:()=>l(!c),className:G("flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",c||k?"bg-primary/10 text-primary":"text-muted-foreground hover:bg-accent/50 hover:text-foreground"),children:[i.jsx(ds,{className:"h-3.5 w-3.5"}),"Filters",k&&i.jsx("span",{className:"rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground",children:j})]}),k&&i.jsx("button",{type:"button",onClick:U,className:"text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground",children:"Clear"})]}),i.jsxs("div",{className:"flex max-w-full items-center gap-1",children:[i.jsxs("select",{value:g,onChange:b=>O(b.target.value),title:"Sort by",className:"max-w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none",children:[i.jsx("option",{value:"modified",children:"Modified"}),i.jsx("option",{value:"created",children:"Created"}),i.jsx("option",{value:"name",children:"Name"})]}),i.jsx("button",{type:"button",onClick:()=>B(S==="asc"?"desc":"asc"),className:"rounded-md border border-input p-1 hover:bg-accent/50",title:S==="asc"?"Ascending":"Descending",children:S==="asc"?i.jsx(us,{className:"h-3.5 w-3.5 text-muted-foreground"}):i.jsx(ps,{className:"h-3.5 w-3.5 text-muted-foreground"})})]})]}),c&&i.jsxs("div",{className:"grid gap-2 border-b border-border/40 bg-muted/20 px-3 py-2 sm:grid-cols-2",children:[i.jsxs("label",{className:"flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2.5 py-2 text-xs",children:[i.jsx("input",{type:"checkbox",checked:d,onChange:b=>u(b.target.checked),className:"rounded border-input"}),i.jsx(er,{className:"h-3.5 w-3.5 text-yellow-500"}),"Favorites only"]}),V.length>0&&i.jsxs("label",{className:"space-y-1 text-xs",children:[i.jsx("span",{className:"text-muted-foreground",children:"Mode"}),i.jsxs("select",{value:p,onChange:b=>m(b.target.value),title:"Filter by mode",className:"w-full rounded-md border border-input bg-background px-2 py-1 text-xs",children:[i.jsx("option",{value:"",children:"All modes"}),V.map(b=>i.jsx("option",{value:b,children:b},b))]})]}),F.length>0&&i.jsxs("label",{className:"space-y-1 text-xs sm:col-span-2",children:[i.jsx("span",{className:"text-muted-foreground",children:"Genre"}),i.jsxs("select",{value:y,onChange:b=>f(b.target.value),title:"Filter by genre",className:"w-full rounded-md border border-input bg-background px-2 py-1 text-xs",children:[i.jsx("option",{value:"",children:"All genres"}),F.map(b=>i.jsx("option",{value:b,children:b},b))]})]}),k&&i.jsx("button",{type:"button",onClick:U,className:"sm:col-span-2 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground",children:"Clear all filters"})]}),i.jsx("div",{className:"min-h-0 flex-1 overflow-y-auto overflow-x-hidden",children:e?i.jsx("div",{className:"p-4 text-center text-xs text-muted-foreground",children:"Loading drafts..."}):X.length===0?i.jsxs("div",{className:"p-4 text-center",children:[i.jsx(Br,{className:"mx-auto h-8 w-8 text-muted-foreground/50"}),i.jsx("p",{className:"mt-2 text-xs text-muted-foreground",children:k?"No drafts match filters":"No drafts yet"}),k&&i.jsx("button",{type:"button",onClick:U,className:"mt-2 text-xs text-primary hover:underline",children:"Clear filters"})]}):i.jsx("div",{className:"space-y-1 p-2",children:X.map(b=>{const A=s===b.review_id;return i.jsx(K,{to:`/drafts/${encodeURIComponent(b.review_id)}`,className:G("group block rounded-lg border p-2 transition-all",A?"border-primary bg-primary/10":"border-transparent hover:border-border/60 hover:bg-accent/40"),children:i.jsxs("div",{className:"flex min-w-0 items-start justify-between gap-2",children:[i.jsxs("div",{className:"min-w-0 flex-1",children:[i.jsxs("div",{className:"flex items-center gap-1.5",children:[i.jsx("span",{className:"truncate text-sm font-medium",children:b.character_name||b.seed}),b.favorite&&i.jsx(er,{className:"h-3 w-3 shrink-0 fill-yellow-500 text-yellow-500"})]}),i.jsxs("div",{className:"mt-0.5 flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground",children:[b.mode&&i.jsxs("span",{className:"inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5",children:[i.jsx(Ur,{className:"h-2.5 w-2.5"}),b.mode]}),b.template_name&&i.jsx("span",{className:"truncate",children:b.template_name})]}),(b.created||b.modified)&&i.jsxs("div",{className:"mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/70",children:[i.jsx(ms,{className:"h-2.5 w-2.5"}),new Date(b.modified||b.created||"").toLocaleDateString()]})]}),b.tags&&b.tags.length>0&&i.jsxs("div",{className:"flex max-w-[8rem] shrink-0 flex-wrap justify-end gap-0.5 overflow-hidden",children:[b.tags.slice(0,2).map(R=>i.jsx("span",{className:"rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground",children:R},R)),b.tags.length>2&&i.jsxs("span",{className:"text-[9px] text-muted-foreground",children:["+",b.tags.length-2]})]})]})},b.review_id)})})})]})}const Ii=[{path:"/",label:"Home",icon:ys},{path:"/generate",label:"Generate",icon:Ct},{path:"/drafts",label:"Library",icon:bs},{path:"/templates",label:"Templates",icon:Br},{path:"/blueprints",label:"Blueprints",icon:_s},{path:"/themes",label:"Themes",icon:ws},{path:"/settings",label:"Settings",icon:vs}],Rr="kofi-overlay-widget-script",Ni="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js",Pr="kofi-overlay-position-style";function Ri(){if(document.getElementById(Pr))return;const e=document.createElement("style");e.id=Pr,e.textContent=`
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
  `,document.head.appendChild(e)}function jr(){const r=window;r.__eidolonKofiOverlayInitialized||!r.kofiWidgetOverlay||(Ri(),r.kofiWidgetOverlay.draw("maeveoffae",{type:"floating-chat","floating-chat.donateButton.text":"Support me","floating-chat.donateButton.background-color":"#ff38b8","floating-chat.donateButton.text-color":"#fff"}),r.__eidolonKofiOverlayInitialized=!0)}function Pi(r,e){return e==="/"?r==="/":r===e||r.startsWith(`${e}/`)}const Dr=[{path:"/lineage",label:"Lineage",icon:$r},{path:"/offspring",label:"Offspring",icon:hs}],Lr=[{path:"/worlds",label:"Worlds",icon:Gr},{path:"/timelines",label:"Timeline",icon:$r},{path:"/events",label:"Events",icon:fs}];function ji({path:r,label:e,icon:t,isActive:n,onClick:s}){return i.jsxs(K,{to:r,onClick:s,className:G("group relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",n?"bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20":"text-muted-foreground hover:bg-accent/50 hover:text-foreground"),children:[i.jsx(t,{className:G("h-5 w-5 transition-transform duration-200",n?"scale-110":"group-hover:scale-110")}),i.jsx("span",{children:e}),n&&i.jsx("div",{className:"absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 -z-10"})]})}function Fr({label:r,icon:e,items:t,isActive:n,isExpanded:s,onToggle:a,onNavigate:o,draftsCount:c,seedsCount:l}){const d=Ge(),u=s?Es:Te;return i.jsxs("div",{className:"space-y-1",children:[i.jsxs("button",{type:"button",onClick:a,className:G("group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",n?"bg-accent/50 text-foreground":"text-muted-foreground hover:bg-accent/50 hover:text-foreground"),children:[i.jsxs("div",{className:"flex items-center gap-2.5",children:[i.jsx(e,{className:"h-5 w-5 transition-transform duration-200 group-hover:scale-110"}),i.jsx("span",{children:r}),(c>0||l>0)&&i.jsxs("div",{className:"flex items-center gap-1.5",children:[c>0&&i.jsxs("span",{className:"rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary",children:[c," drafts"]}),l>0&&i.jsxs("span",{className:"rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400",children:[l," seeds"]})]})]}),i.jsx(u,{className:"h-4 w-4 transition-transform duration-200"})]}),s&&i.jsx("div",{className:"ml-4 space-y-1 border-l border-border pl-2",children:t.map(p=>{const m=d.pathname===p.path;return i.jsxs(K,{to:p.path,onClick:o,className:G("group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",m?"bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/20":"text-muted-foreground hover:bg-accent/50 hover:text-foreground"),children:[i.jsx(p.icon,{className:"h-4 w-4"}),i.jsx("span",{children:p.label})]},p.path)})})]})}function Di({children:r}){const e=Ge(),t=Hr(),n=e.pathname.match(/^\/drafts\/([^/]+)$/),s=n?decodeURIComponent(n[1]):null,[a,o]=h.useState(!1),[c,l]=h.useState(!1),[d,u]=h.useState(!1),[p,m]=h.useState(null),[y,f]=h.useState(!1),[g,O]=h.useState(!1),[S,B]=h.useState("dynamic"),F=h.useMemo(()=>Ks(e.pathname),[e.pathname]),V=h.useMemo(()=>$s.filter(_=>F?.relatedTopicIds.includes(_.id)),[F]),X=de({queryKey:["drafts"],queryFn:()=>z.getDrafts()}),{data:k}=X,{data:j}=de({queryKey:["draft",s],queryFn:()=>z.getDraft(s||""),enabled:!!s}),{data:U}=de({queryKey:["templates"],queryFn:()=>z.getTemplates(),enabled:e.pathname.startsWith("/templates")}),{data:H}=de({queryKey:["themes"],queryFn:()=>z.getThemes(),enabled:e.pathname.startsWith("/themes")}),{data:b}=de({queryKey:["blueprints"],queryFn:()=>z.getBlueprints(),enabled:e.pathname.startsWith("/blueprints")}),[A,R]=h.useState(()=>se().length),Q=k?.drafts?.length??0;h.useEffect(()=>{const _=()=>{t.invalidateQueries({queryKey:["drafts"]})};return window.addEventListener($t,_),()=>{window.removeEventListener($t,_)}},[t]),h.useEffect(()=>{const _=document.getElementById(Rr);if(window.kofiWidgetOverlay){jr();return}const x=_??document.createElement("script");x.id=Rr,x.src=Ni,x.async=!0;const L=()=>{jr()};return x.addEventListener("load",L),_||document.head.appendChild(x),()=>{x.removeEventListener("load",L)}},[]);const ie=h.useMemo(()=>{if(e.pathname.startsWith("/drafts")){const x=[{id:"drafts",title:"Library Tray",emptyLabel:"No drafts available yet.",items:(k?.drafts||[]).slice(0,16).map(L=>({id:L.review_id,label:L.character_name||L.seed,description:`${L.template_name||"Default"} • ${L.mode}`,to:`/drafts/${encodeURIComponent(L.review_id)}`,badge:s&&s===L.review_id?"Open":L.favorite?"Fav":void 0}))}];if(s){const L=Object.keys(j?.assets||{}).map(Qt=>({id:Qt,label:Qt.replace(/_/g," "),description:"Asset in current draft"}));x.push({id:"review-assets",title:"Current Draft Assets",emptyLabel:"No assets loaded for this draft.",items:L})}return x}return e.pathname.startsWith("/templates")?[{id:"templates",title:"Template Tray",emptyLabel:"No templates available.",items:(U||[]).slice(0,16).map(x=>({id:x.name,label:x.name,description:x.description||"Template definition",badge:x.is_default?"Default":void 0}))}]:e.pathname.startsWith("/themes")?[{id:"themes",title:"Theme Tray",emptyLabel:"No theme presets available.",items:(H||[]).slice(0,16).map(x=>({id:x.name,label:x.display_name,description:x.description||x.name,badge:x.is_builtin?"Built-in":"Custom"}))}]:e.pathname.startsWith("/blueprints")?[{id:"blueprints",title:"Blueprint Tray",emptyLabel:"No blueprints found.",items:[...b?.core||[],...b?.system||[],...b?.templates?.local||[],...b?.examples||[]].slice(0,18).map(L=>({id:L.path,label:L.name,description:L.path}))}]:e.pathname.startsWith("/generate")?[{id:"generate",title:"Generate Tray",emptyLabel:"No generation actions available.",items:[{id:"gen-drafts",label:"Library",description:`${Q} drafts available`,to:"/drafts"},{id:"gen-seeds",label:"Favorite seeds",description:`${A} saved`,to:"/seed-generator"},{id:"gen-templates",label:"Template manager",description:"Switch template packs",to:"/templates"}]}]:[{id:"general",title:"Shortcuts",emptyLabel:"No shortcuts available.",items:[{id:"nav-seeds",label:"Seed Generator",to:"/seed-generator"},{id:"nav-validation",label:"Validation",to:"/validation"},{id:"nav-batch",label:"Batch",to:"/batch"},{id:"nav-compare",label:"Compare",to:"/similarity"},{id:"nav-blueprints",label:"Blueprints",to:"/blueprints"},{id:"nav-themes",label:"Theme Studio",to:"/themes"}]}]},[e.pathname,k?.drafts,Q,s,j?.assets,U,H,b,A]),ce=h.useMemo(()=>zs.filter(_=>_.status!=="implemented").flatMap(_=>_.items.slice(0,3).map((x,L)=>({id:`${_.id}-${L}`,title:x.length>60?x.slice(0,60)+"...":x,category:_.title,status:_.status}))).slice(0,12),[]),_t=Dr.map(_=>_.path).includes(e.pathname),wt=Lr.map(_=>_.path).includes(e.pathname);h.useEffect(()=>{_t&&!y&&f(!0)},[_t,y]),h.useEffect(()=>{wt&&!g&&O(!0)},[wt,g]);const Ke=h.useCallback(async()=>{if(v.isEnabled()){if(!v.hasAccessToken()){m({connected:!0,authenticated:!1});return}try{const _=await v.checkStatus();m(_),_.authenticated&&_.connected&&(async()=>(await $o(),await z.syncConfigFromServer()))()}catch{m({connected:!1,authenticated:!1})}}else m({connected:!1,authenticated:!1})},[]);return h.useEffect(()=>{Ke()},[Ke]),h.useEffect(()=>{const _=()=>{Ke()};return window.addEventListener(Dt,_),()=>window.removeEventListener(Dt,_)},[Ke]),h.useEffect(()=>{const _=()=>{N("config")};return window.addEventListener(it,_),()=>window.removeEventListener(it,_)},[]),h.useEffect(()=>{const _=()=>{R(se().length)};return window.addEventListener(Lt,_),window.addEventListener("storage",_),()=>{window.removeEventListener(Lt,_),window.removeEventListener("storage",_)}},[]),h.useEffect(()=>{l(!1),u(!1)},[e.pathname]),i.jsx(xi,{children:i.jsx(Ei,{children:i.jsxs("div",{className:"app-shell flex min-h-dvh bg-background text-foreground lg:h-dvh lg:items-stretch lg:overflow-hidden",children:[a&&i.jsx("div",{className:"fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden",onClick:()=>o(!1)}),i.jsx("aside",{className:G("fixed inset-y-0 left-0 z-50 w-[min(18rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] bg-card/80 backdrop-blur-xl border-r border-border transition-[transform,background-color,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:order-0 lg:static lg:w-[18rem] lg:max-w-none lg:translate-x-0","app-sidebar",a?"translate-x-0":"-translate-x-full"),children:i.jsxs("div",{className:"flex h-dvh flex-col lg:h-full",children:[i.jsxs("div",{className:"flex h-14 items-center justify-between border-b border-border/50 px-3.5",children:[i.jsxs(K,{to:"/",className:"flex items-center gap-2",onClick:()=>o(!1),children:[i.jsx("div",{className:"rounded-md bg-gradient-to-br from-primary to-accent p-2 shadow-lg shadow-primary/20",children:i.jsx(Ct,{className:"h-4 w-4 text-white"})}),i.jsxs("div",{className:"flex flex-col",children:[i.jsx("span",{className:"text-base font-semibold tracking-tight text-foreground",style:{fontFamily:'"Space Grotesk", sans-serif'},children:"Eidolon"}),i.jsxs("span",{className:"text-[11px] uppercase tracking-[0.18em] text-muted-foreground",style:{fontFamily:'"IBM Plex Mono", monospace'},children:["Simulacra v","3.3.5"]})]})]}),i.jsx("button",{type:"button","aria-label":"Close sidebar",className:"rounded-lg p-2 transition-colors hover:bg-accent lg:hidden",onClick:()=>o(!1),children:i.jsx(Le,{className:"h-4 w-4"})})]}),i.jsxs("nav",{className:"flex-1 space-y-0.5 overflow-y-auto p-3",children:[i.jsx(Fr,{label:"Characters",icon:gs,items:Dr,isActive:_t,isExpanded:y,onToggle:()=>f(!y),onNavigate:()=>o(!1),draftsCount:Q,seedsCount:A}),i.jsx(Fr,{label:"Worlds",icon:Gr,items:Lr,isActive:wt,isExpanded:g,onToggle:()=>O(!g),onNavigate:()=>o(!1),draftsCount:0,seedsCount:0}),Ii.map(_=>{const x=Pi(e.pathname,_.path);return i.jsx(ji,{path:_.path,label:_.label,icon:_.icon,isActive:x,onClick:()=>o(!1)},_.path)})]}),p&&!p.authenticated&&v.isEnabled()&&i.jsx("div",{className:"border-t border-border/50 px-3 py-2.5",children:i.jsxs(K,{to:"/auth",onClick:()=>o(!1),className:"flex items-center gap-3 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 px-3.5 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:from-primary/20 hover:to-accent/20",children:[i.jsx(xs,{className:"h-5 w-5 text-primary"}),i.jsxs("div",{className:"flex flex-col",children:[i.jsx("span",{className:"font-semibold",children:"Sign In"}),i.jsx("span",{className:"text-xs text-muted-foreground",children:"Sync your data"})]})]})}),p?.authenticated&&p.user&&i.jsx("div",{className:"border-t border-border/50 px-3 py-2.5",children:i.jsxs("div",{className:"flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 px-3.5 py-2.5",children:[i.jsx("div",{className:"flex h-8 w-8 items-center justify-center rounded-md bg-green-500/20",children:i.jsx(ks,{className:"h-4 w-4 text-green-600 dark:text-green-400"})}),i.jsxs("div",{className:"flex flex-col min-w-0",children:[i.jsx("span",{className:"text-sm font-medium truncate",children:p.user.displayName}),i.jsx("span",{className:"text-xs text-muted-foreground truncate",children:p.user.email})]})]})}),i.jsx("div",{className:"border-t border-border/50 p-3",children:i.jsxs("div",{className:"grid grid-cols-3 gap-2",children:[i.jsx(K,{to:"/settings",onClick:()=>o(!1),className:"rounded-lg border border-border/60 bg-background/60 px-2.5 py-1.5 text-center text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary",children:"Settings"}),i.jsx(K,{to:"/help",onClick:()=>o(!1),className:"rounded-lg border border-border/60 bg-background/60 px-2.5 py-1.5 text-center text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary",children:"Help"}),i.jsx(K,{to:"/about",onClick:()=>o(!1),className:"rounded-lg border border-border/60 bg-background/60 px-2.5 py-1.5 text-center text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary",children:"About"})]})})]})}),i.jsx("main",{className:"min-w-0 flex-1 overflow-hidden lg:order-2",children:i.jsxs("div",{className:"flex h-full min-h-0 flex-col",children:[i.jsxs("header",{className:"app-frame-panel sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 px-3 lg:hidden",children:[i.jsx("button",{type:"button","aria-label":"Open menu",onClick:()=>o(!0),className:"rounded-lg p-2 transition-colors hover:bg-accent",children:i.jsx(Ss,{className:"h-5 w-5"})}),i.jsx("span",{className:"min-w-0 truncate text-sm font-semibold tracking-tight text-foreground sm:text-base",style:{fontFamily:'"Space Grotesk", sans-serif'},children:"Eidolon Simulacra"}),F&&i.jsxs("button",{type:"button",onClick:()=>u(!0),className:"ml-auto inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:[i.jsx(tr,{className:"h-3.5 w-3.5"}),"Help"]})]}),i.jsx("div",{className:"min-h-0 flex-1 overflow-auto px-4 py-4 lg:px-5 lg:py-5",children:i.jsx("div",{className:"app-page mx-auto flex min-h-full w-full max-w-[1680px] flex-col gap-4",children:r})})]})}),F&&i.jsx(ki,{entry:F,topics:V,isOpen:d,onClose:()=>u(!1)}),i.jsxs("aside",{"aria-label":"Utility panel",className:G("fixed inset-y-0 right-0 top-0 z-40 flex h-dvh overflow-visible transition-[width,transform,opacity,background-color,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:order-1 lg:relative lg:inset-auto lg:h-dvh lg:shrink-0 lg:translate-x-0",c?"w-[min(18rem,calc(100vw-1rem))] bg-card/95 shadow-2xl lg:w-[17rem] lg:border-l lg:border-border/60 lg:bg-card/90":"w-0 bg-transparent shadow-none lg:w-0 lg:border-l-0 lg:bg-transparent"),children:[i.jsxs("button",{type:"button","aria-label":c?"Collapse utility panel":"Expand utility panel",onClick:()=>l(_=>!_),className:G("absolute right-0 top-1/2 z-10 flex translate-x-full -translate-y-1/2 items-center gap-1.5 rounded-r-sm rounded-l-none border border-l-0 border-border/70 bg-card/95 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground shadow-lg shadow-black/10 backdrop-blur-sm transition-[color,border-color,background-color,box-shadow,transform] duration-300 hover:border-primary/40 hover:text-primary",c&&"text-foreground"),children:[i.jsx(Te,{className:G("h-3.5 w-3.5 transition-transform duration-300",!c&&"rotate-180")}),i.jsx("span",{children:"Tray"})]}),i.jsxs("div",{className:G("flex h-full min-h-0 w-full flex-col overflow-hidden border-l border-border/60 bg-card/95 transition-[opacity,transform,background-color,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",c?"opacity-100 pointer-events-auto":"pointer-events-none opacity-0"),children:[i.jsxs("div",{className:"sticky top-0 z-10 border-b border-border/60 bg-card/90",children:[i.jsxs("div",{className:"flex items-center justify-between border-b border-border/40 px-3 py-2.5 lg:px-3.5",children:[i.jsxs("div",{children:[i.jsx("p",{className:"text-[11px] font-semibold uppercase tracking-[0.2em] text-primary",children:"Utility Panel"}),i.jsx("p",{className:"mt-1 text-xs text-muted-foreground",children:"Shortcuts, context, and current work."})]}),i.jsx("button",{type:"button","aria-label":"Close panel",onClick:()=>l(!1),className:"rounded-md p-2 text-muted-foreground transition-colors duration-300 hover:bg-accent hover:text-foreground",children:i.jsx(Le,{className:"h-4 w-4"})})]}),F&&i.jsx("div",{className:"border-b border-border/40 px-3 py-2.5 lg:px-3.5",children:i.jsxs("button",{type:"button",onClick:()=>{l(!1),u(!0)},className:"flex w-full items-center justify-between gap-3 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-left transition-all duration-300 hover:border-primary/40 hover:bg-accent/35 hover:text-primary",children:[i.jsxs("div",{className:"min-w-0",children:[i.jsx("p",{className:"text-[11px] font-semibold uppercase tracking-[0.16em] text-primary",children:"Page Help"}),i.jsx("p",{className:"mt-1 truncate text-xs font-medium text-foreground",children:F.title})]}),i.jsx(tr,{className:"h-3.5 w-3.5 shrink-0"})]})}),i.jsxs("div",{className:"flex border-b border-border/40",children:[i.jsxs("button",{type:"button",onClick:()=>B("dynamic"),className:G("flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium transition-all duration-300",S==="dynamic"?"border-b-2 border-primary text-primary":"text-muted-foreground hover:bg-accent/25 hover:text-foreground"),children:[i.jsx(Ur,{className:"h-3.5 w-3.5"}),"Dynamic"]}),i.jsxs("button",{type:"button",onClick:()=>B("whats-new"),className:G("flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium transition-all duration-300",S==="whats-new"?"border-b-2 border-primary text-primary":"text-muted-foreground hover:bg-accent/25 hover:text-foreground"),children:[i.jsx(Ct,{className:"h-3.5 w-3.5"}),"New"]})]})]}),i.jsx("div",{className:"flex-1 overflow-y-auto p-3 lg:p-3.5",children:S==="dynamic"?e.pathname.startsWith("/drafts")?i.jsx(Oi,{drafts:k?.drafts||[],isLoading:X.isLoading}):i.jsxs("div",{className:"space-y-3",children:[i.jsxs("div",{className:"px-1",children:[i.jsx("h3",{className:"text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:"Upcoming Features"}),i.jsx("p",{className:"mt-1 text-xs text-muted-foreground",children:"Planned improvements and new capabilities."})]}),ce.map(_=>i.jsxs("div",{className:"rounded-lg border border-border/70 bg-background/50 p-2.5 transition-colors duration-300 hover:border-border/90 hover:bg-background/70",children:[i.jsx("div",{className:"flex items-start justify-between gap-2",children:i.jsx("span",{className:G("rounded-md px-2 py-0.5 text-[10px] font-semibold",_.status==="planned"?"bg-blue-500/15 text-blue-600 dark:text-blue-400":"bg-amber-500/15 text-amber-600 dark:text-amber-400"),children:_.status==="planned"?"Planned":"In Progress"})}),i.jsx("p",{className:"mt-2 text-sm leading-snug text-foreground",children:_.title}),i.jsx("p",{className:"mt-1.5 text-xs text-muted-foreground",children:_.category})]},_.id)),i.jsxs(K,{to:"/whats-new",onClick:()=>l(!1),className:"flex items-center justify-center gap-2 rounded-md border border-border/60 bg-background/50 px-3 py-2.5 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary/40 hover:bg-accent/25 hover:text-primary",children:["View Full Roadmap",i.jsx(Te,{className:"h-4 w-4"})]})]}):i.jsx("div",{className:"space-y-4",children:ie.map(_=>i.jsxs("section",{className:"space-y-2",children:[i.jsx("h3",{className:"px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:_.title}),_.items.length===0?i.jsx("div",{className:"rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground",children:_.emptyLabel}):i.jsx("div",{className:"space-y-2",children:_.items.map(x=>{const L=i.jsxs(i.Fragment,{children:[i.jsxs("div",{className:"min-w-0 flex-1",children:[i.jsx("div",{className:"truncate text-sm font-medium",children:x.label}),x.description&&i.jsx("div",{className:"truncate text-xs text-muted-foreground",children:x.description})]}),x.badge&&i.jsx("span",{className:"rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground",children:x.badge}),x.to&&i.jsx(Te,{className:"h-3.5 w-3.5 text-muted-foreground"})]});return x.to?i.jsx(K,{to:x.to,onClick:()=>l(!1),className:"flex items-center gap-2 rounded-md border border-border/70 bg-background/70 px-3 py-2 transition-all duration-300 hover:border-primary/40 hover:bg-accent/35",children:L},x.id):i.jsx("div",{className:"flex items-center gap-2 rounded-md border border-border/70 bg-background/50 px-3 py-2",children:L},x.id)})})]},_.id))})})]})]}),i.jsx(Ci,{})]})})})}const Li=h.lazy(()=>C(()=>import("./Home-7BdcI0m6.js"),__vite__mapDeps([0,1,2,3,4,5,6,7]))),Fi=h.lazy(()=>C(()=>import("./Generation-DgXDcXRu.js"),__vite__mapDeps([8,1,2,3,9,4,10,11,12,13,5,6,7,14]))),Mi=h.lazy(()=>C(()=>import("./SeedGenerator-VpqJo30u.js"),__vite__mapDeps([15,1,2,3,4,13,14,9,5,6,7]))),Bi=h.lazy(()=>C(()=>import("./Validation-B93t7pIA.js"),__vite__mapDeps([16,1,2,3,4,6,7,5]))),Mr=h.lazy(()=>C(()=>import("./Drafts-BZ34bN8d.js"),__vite__mapDeps([17,1,2,3,18,19,20,5,6,7]))),Ui=h.lazy(()=>C(()=>import("./Review-D-XBReOA.js"),__vite__mapDeps([21,1,2,3,22,4,11,19,5,6,7]))),$i=h.lazy(()=>C(()=>import("./AssetRegenerator-kIOzs7LL.js"),__vite__mapDeps([12,1,2,3,11,9,13,4,5,6,7]))),Gi=h.lazy(()=>C(()=>import("./Blueprints-BCtvyYu4.js"),__vite__mapDeps([23,1,2,3,4,24,5,6,7]))),Hi=h.lazy(()=>C(()=>import("./BlueprintEditor-GrhXgjVZ.js"),__vite__mapDeps([25,1,26,27,3,24,28,5,2,6,7]))),Ki=h.lazy(()=>C(()=>import("./Templates-j8UmzAPf.js"),__vite__mapDeps([29,1,2,3,22,4,6,7,5]))),zi=h.lazy(()=>C(()=>import("./Lineage-DU1qET2K.js"),__vite__mapDeps([30,1,2,3,4,5,6,7]))),Wi=h.lazy(()=>C(()=>import("./Similarity-DoQgoGMs.js"),__vite__mapDeps([31,1,2,3,4,5,6,7]))),qi=h.lazy(()=>C(()=>import("./Offspring-DA0eZOqZ.js"),__vite__mapDeps([32,1,2,3,14,9,4,13,10,5,6,7]))),Vi=h.lazy(()=>C(()=>import("./Worlds-BvfbmK5h.js"),__vite__mapDeps([33,1,4,2,3,14,22,13,6,7,5]))),Yi=h.lazy(()=>C(()=>import("./Timelines-B22bcOvK.js"),__vite__mapDeps([34,1,2,3,4,20,6,7,5]))),Ji=h.lazy(()=>C(()=>import("./Events-DkyBT5-K.js"),__vite__mapDeps([35,1,4,3,2,6,7,5]))),Xi=h.lazy(()=>C(()=>import("./Settings-CytIHUgP.js"),__vite__mapDeps([36,1,2,3,5,14,6,7]))),Qi=h.lazy(()=>C(()=>import("./ThemeStudio-YA3xVMwQ.js"),__vite__mapDeps([37,1,2,3,22,18,6,7,5]))),Zi=h.lazy(()=>C(()=>import("./DataManager-CimvnXs6.js"),__vite__mapDeps([38,1,22,18,3,2,6,7,5]))),ec=h.lazy(()=>C(()=>import("./BatchGenerate-B5P7cZn6.js"),__vite__mapDeps([39,1,2,3,9,4,6,7,5]))),tc=h.lazy(()=>C(()=>import("./AuthPage-Ca5hvZf7.js"),__vite__mapDeps([40,1,3,5,2,6,7]))),rc=h.lazy(()=>C(()=>import("./About-BV50K2g5.js"),__vite__mapDeps([41,1,42,27,3,28,5]))),nc=h.lazy(()=>C(()=>import("./HelpCenterPage-B2Urz62O.js"),__vite__mapDeps([43,1,42,27,3,28,5,2,6,7]))),sc=h.lazy(()=>C(()=>import("./WhatsNewPage-D_nbPoPv.js"),__vite__mapDeps([44,1,42,27,3,28,5,2,6,7]))),ac=h.lazy(()=>C(()=>import("./LicensePage-C4l2wosM.js"),__vite__mapDeps([45,1,42,27,3,28]))),oc=h.lazy(()=>C(()=>import("./TermsPage-kzGnrTME.js"),__vite__mapDeps([46,1,42,27,3,28]))),ic=h.lazy(()=>C(()=>import("./PrivacyPage-DHUECVTk.js"),__vite__mapDeps([47,1,42,27,3,28]))),cc=h.lazy(()=>C(()=>import("./SecurityPage-BFjW-Stv.js"),__vite__mapDeps([48,1,42,27,3,28]))),lc=h.lazy(()=>C(()=>import("./CodeOfConductPage-L1M7cqPs.js"),__vite__mapDeps([49,1,42,27,3,28])));function dc(){return i.jsx("div",{className:"flex h-[60vh] items-center justify-center",children:i.jsxs("div",{className:"flex items-center gap-3 text-sm text-muted-foreground",children:[i.jsx(Ts,{className:"h-5 w-5 animate-spin"}),"Loading screen..."]})})}function uc(){return i.jsxs("div",{className:"flex h-[60vh] flex-col items-center justify-center gap-4 text-center",children:[i.jsxs("div",{children:[i.jsx("h1",{className:"text-2xl font-semibold text-foreground",children:"Page not found"}),i.jsx("p",{className:"mt-2 text-sm text-muted-foreground",children:"The requested route does not exist in the current browser app build."})]}),i.jsx(K,{to:"/",className:"inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",children:"Return home"})]})}function pc(){return i.jsx(Di,{children:i.jsx(h.Suspense,{fallback:i.jsx(dc,{}),children:i.jsxs(Rs,{children:[i.jsx(E,{path:"/",element:i.jsx(Li,{})}),i.jsx(E,{path:"/generate",element:i.jsx(Fi,{})}),i.jsx(E,{path:"/seed-generator",element:i.jsx(Mi,{})}),i.jsx(E,{path:"/validation",element:i.jsx(Bi,{})}),i.jsx(E,{path:"/batch",element:i.jsx(ec,{})}),i.jsx(E,{path:"/drafts",element:i.jsx(Mr,{})}),i.jsx(E,{path:"/drafts/",element:i.jsx(Mr,{})}),i.jsx(E,{path:"/drafts/:id",element:i.jsx(Ui,{})}),i.jsx(E,{path:"/drafts/:id/assets/:assetName/regenerate",element:i.jsx($i,{})}),i.jsx(E,{path:"/templates",element:i.jsx(Ki,{})}),i.jsx(E,{path:"/blueprints",element:i.jsx(Gi,{})}),i.jsx(E,{path:"/blueprints/edit/*",element:i.jsx(Hi,{})}),i.jsx(E,{path:"/lineage",element:i.jsx(zi,{})}),i.jsx(E,{path:"/similarity",element:i.jsx(Wi,{})}),i.jsx(E,{path:"/offspring",element:i.jsx(qi,{})}),i.jsx(E,{path:"/worlds",element:i.jsx(Vi,{})}),i.jsx(E,{path:"/timelines",element:i.jsx(Yi,{})}),i.jsx(E,{path:"/events",element:i.jsx(Ji,{})}),i.jsx(E,{path:"/themes",element:i.jsx(Qi,{})}),i.jsx(E,{path:"/settings",element:i.jsx(Xi,{})}),i.jsx(E,{path:"/data",element:i.jsx(Zi,{})}),i.jsx(E,{path:"/auth",element:i.jsx(tc,{})}),i.jsx(E,{path:"/about",element:i.jsx(rc,{})}),i.jsx(E,{path:"/help",element:i.jsx(nc,{})}),i.jsx(E,{path:"/whats-new",element:i.jsx(sc,{})}),i.jsx(E,{path:"/license",element:i.jsx(ac,{})}),i.jsx(E,{path:"/terms",element:i.jsx(oc,{})}),i.jsx(E,{path:"/privacy",element:i.jsx(ic,{})}),i.jsx(E,{path:"/security",element:i.jsx(cc,{})}),i.jsx(E,{path:"/code-of-conduct",element:i.jsx(lc,{})}),i.jsx(E,{path:"*",element:i.jsx(uc,{})})]})})})}const mc={background:"background",text:"text",accent:"accent",button:"button",button_text:"button_text",border:"border",highlight:"highlight",window:"window",muted_text:"muted_text",surface:"surface",success_bg:"success_bg",danger_bg:"danger_bg",accent_bg:"accent_bg",accent_title:"accent_title",success_text:"success_text",error_text:"error_text",warning_text:"warning_text"},hc={brackets:"tok_brackets",asterisk:"tok_asterisk",parentheses:"tok_parentheses",double_brackets:"tok_double_brackets",curly_braces:"tok_curly_braces",pipes:"tok_pipes",at_sign:"tok_at_sign"},fc=[{section:"app",key:"background",label:"Background",colorKey:"background"},{section:"app",key:"surface",label:"Surface",colorKey:"surface"},{section:"app",key:"window",label:"Window",colorKey:"window"},{section:"app",key:"text",label:"Text",colorKey:"text"},{section:"app",key:"muted_text",label:"Muted Text",colorKey:"muted_text"},{section:"app",key:"accent",label:"Primary Accent",colorKey:"accent"},{section:"app",key:"accent_bg",label:"Accent Surface",colorKey:"accent_bg"},{section:"app",key:"button",label:"Button",colorKey:"button"},{section:"app",key:"button_text",label:"Button Text",colorKey:"button_text"},{section:"app",key:"border",label:"Border",colorKey:"border"},{section:"app",key:"highlight",label:"Ring / Highlight",colorKey:"highlight"},{section:"app",key:"success_text",label:"Success Text",colorKey:"success_text"},{section:"app",key:"warning_text",label:"Warning Text",colorKey:"warning_text"},{section:"app",key:"error_text",label:"Error Text",colorKey:"error_text"},{section:"app",key:"success_bg",label:"Success Surface",colorKey:"success_bg"},{section:"app",key:"danger_bg",label:"Danger Surface",colorKey:"danger_bg"},{section:"app",key:"accent_title",label:"Accent Title",colorKey:"accent_title"}],gc=[{section:"tokenizer",key:"brackets",label:"Brackets",colorKey:"tok_brackets"},{section:"tokenizer",key:"asterisk",label:"Asterisk",colorKey:"tok_asterisk"},{section:"tokenizer",key:"parentheses",label:"Parentheses",colorKey:"tok_parentheses"},{section:"tokenizer",key:"double_brackets",label:"Double Brackets",colorKey:"tok_double_brackets"},{section:"tokenizer",key:"curly_braces",label:"Curly Braces",colorKey:"tok_curly_braces"},{section:"tokenizer",key:"pipes",label:"Pipes",colorKey:"tok_pipes"},{section:"tokenizer",key:"at_sign",label:"At Sign",colorKey:"tok_at_sign"}],qc=[{title:"App Colors",description:"Web and app-facing surfaces.",fields:fc},{title:"Tokenizer Colors",description:"Syntax highlighting tokens used in review surfaces.",fields:gc}];function yc(r,e){if(!r)return null;const t={...r.colors};for(const[n,s]of Object.entries(e?.app??{})){if(!s)continue;const a=mc[n];a&&(t[a]=s)}for(const[n,s]of Object.entries(e?.tokenizer??{})){if(!s)continue;const a=hc[n];a&&(t[a]=s)}return t}function M(r){const e=r.replace("#","").trim(),t=e.length===3?e.split("").map(g=>g+g).join(""):e;if(!/^[0-9a-fA-F]{6}$/.test(t))return"0 0% 0%";const n=parseInt(t.slice(0,2),16)/255,s=parseInt(t.slice(2,4),16)/255,a=parseInt(t.slice(4,6),16)/255,o=Math.max(n,s,a),c=Math.min(n,s,a),l=o-c,d=(o+c)/2;let u=0,p=0;if(l!==0)switch(p=l/(1-Math.abs(2*d-1)),o){case n:u=(s-a)/l%6;break;case s:u=(a-n)/l+2;break;default:u=(n-s)/l+4;break}const m=Math.round(u*60<0?u*60+360:u*60),y=Math.round(p*1e3)/10,f=Math.round(d*1e3)/10;return`${m} ${y}% ${f}%`}function bc(r){return{"--background":M(r.background),"--foreground":M(r.text),"--card":M(r.surface),"--card-foreground":M(r.text),"--primary":M(r.accent),"--primary-foreground":M(r.button_text),"--secondary":M(r.button),"--secondary-foreground":M(r.button_text),"--muted":M(r.window),"--muted-foreground":M(r.muted_text),"--accent":M(r.accent_bg),"--accent-foreground":M(r.text),"--destructive":M(r.danger_bg),"--destructive-foreground":M(r.button_text),"--border":M(r.border),"--input":M(r.border),"--ring":M(r.highlight)}}function _c(r){const e=document.documentElement,t=bc(r);Object.entries(t).forEach(([s,a])=>{e.style.setProperty(s,a)}),e.style.setProperty("--app-bg",r.background),e.style.setProperty("--app-surface",r.surface),e.style.setProperty("--app-border",r.border),e.style.setProperty("--app-highlight",r.highlight),e.style.setProperty("--app-accent",r.accent);const n=document.querySelector('meta[name="theme-color"]');n&&n.setAttribute("content",r.window)}const wc=h.createContext(null);function vc({children:r}){const[e,t]=h.useState(null),n=Hr(),{data:s}=de({queryKey:["config"],queryFn:()=>z.getConfig(),initialData:()=>z.getConfigSnapshot()}),{data:a=[],isLoading:o}=de({queryKey:["themes"],queryFn:()=>z.getThemes(),initialData:()=>z.getThemesSnapshot()}),c=e?.themeName??s?.theme_name??"dark",l=e?.overrides??s?.theme;h.useEffect(()=>{const u=a.find(m=>m.name===c)??a[0],p=yc(u,l);p&&_c(p)},[a,c,l]),h.useEffect(()=>{const u=()=>{n.invalidateQueries({queryKey:["themes"]})};return window.addEventListener(Ut,u),()=>{window.removeEventListener(Ut,u)}},[n]);const d=h.useMemo(()=>({themes:a,isLoading:o,previewTheme:(u,p)=>{t({themeName:u,overrides:p})},clearPreview:()=>{t(null)}}),[a,o]);return i.jsx(wc.Provider,{value:d,children:r})}const xc=new As({defaultOptions:{queries:{staleTime:1e3*60*5,retry:1}}});es.createRoot(document.getElementById("root")).render(i.jsx(h.StrictMode,{children:i.jsx(Cs,{client:xc,children:i.jsx(vc,{children:i.jsx(Ps,{children:i.jsx(pc,{})})})})}));export{wc as $,Oi as A,P as B,So as C,oo as D,Eo as E,ae as F,ee as G,$c as H,Ao as I,Co as J,Kc as K,Bc as L,zr as M,Uc as N,Cn as O,Jr as P,Er as Q,Fs as R,Lt as S,ct as T,v as U,it as V,ur as W,ot as X,Qr as Y,Ee as Z,C as _,st as a,yc as a0,qc as a1,_c as a2,Gc as a3,vi as a4,Nc as a5,Rc as a6,$s as a7,zs as a8,jc as a9,z as b,St as c,la as d,T as e,Pc as f,Kr as g,Ce as h,se as i,Dc as j,io as k,Lc as l,Hc as m,Bt as n,Wc as o,fo as p,N as q,Mc as r,Fc as s,zc as t,Ti as u,go as v,G as w,ko as x,fe as y,Ms as z};
//# sourceMappingURL=index-C0qPCLz5.js.map
