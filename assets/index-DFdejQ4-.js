const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Home-CzBvUkUD.js","assets/react-vendor-C34M-SVW.js","assets/query-vendor-BLVpIK_p.js","assets/vendor-2cuNAvYw.js","assets/useAssistantContext-DVHLAkM7.js","assets/router-vendor-BUgBkwhx.js","assets/storage-vendor-CKqr1NrK.js","assets/ui-utils-vendor-DeRmtv56.js","assets/Generation-De_ysABZ.js","assets/generation-session-uaOA9dPo.js","assets/GenerationProgress-C3NSBwJO.js","assets/AssetRegenerator-D_kbvEmF.js","assets/BlueprintPanel-B56h3I0y.js","assets/featureSelection-bAEkKlXg.js","assets/SeedGenerator-DAS3oev8.js","assets/Validation-YjR5fAw5.js","assets/Drafts-D6eGx1Ud.js","assets/SyncControls-BBPSO2ma.js","assets/VersionHistoryPanel-DviVhZs8.js","assets/GenerationHistoryPanel-Mch6Kzer.js","assets/Review-DNXu5BoO.js","assets/download-DlHePDd1.js","assets/Blueprints-P4OvPA0N.js","assets/blueprintLint-D_UxpWeG.js","assets/BlueprintEditor--O0H0qrF.js","assets/editor-vendor-4PMdRp_6.js","assets/markdownComponents-D2Y5ZE6J.js","assets/markdown-vendor-Bu8le4s-.js","assets/Templates-DiFeUJiM.js","assets/Lineage-Cos9POgz.js","assets/Similarity-ZWGz1ery.js","assets/Offspring-DD_OszUl.js","assets/Worlds-BCXHR5cz.js","assets/Timelines-34SXDoTI.js","assets/Events-CLmgv_Hv.js","assets/Settings-B-0iaw-r.js","assets/ThemeStudio-auO3INhD.js","assets/DataManager-_gRduEPb.js","assets/BatchGenerate-gorzXdjq.js","assets/AuthPage-BpFZUuig.js","assets/About-BwNYwOO1.js","assets/DocumentPage-C1kNXb8z.js","assets/HelpCenterPage-gD45-dUK.js","assets/WhatsNewPage-BZ5T8GDT.js","assets/LicensePage-64XuK5FC.js","assets/TermsPage-B0q0-kk6.js","assets/PrivacyPage-Bhw0snQq.js","assets/SecurityPage-Bdlg6GW3.js","assets/CodeOfConductPage-DdIoJbFU.js"])))=>i.map(i=>d[i]);
import{r as m,j as o,d as Dr}from"./react-vendor-C34M-SVW.js";import{X as Te,B as Rr,T as Lr,A as Ct,C as Mr,h as Fr,j as Ee,S as Ur,k as $r,l as Br,H as Hr,m as Gr,F as Wr,o as Kr,p as zr,q as Nt,w as Xt,L as nt,x as qr,G as Qt,y as Vr,z as Zt,D as Yr,E as at,U as Jr,I as Xr,J as Qr,P as Zr,K as en,N as tn,O as rn,R as nn,W as Pt,Y as an,Z as sn,_ as on}from"./vendor-2cuNAvYw.js";import{u as er,a as oe,Q as cn}from"./query-vendor-BLVpIK_p.js";import{D as Ae}from"./storage-vendor-CKqr1NrK.js";import{t as ln,c as dn}from"./ui-utils-vendor-DeRmtv56.js";import{L as B,u as un,a as Ne,R as pn,b as T,H as hn}from"./router-vendor-BUgBkwhx.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function t(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(n){if(n.ep)return;n.ep=!0;const s=t(n);fetch(n.href,s)}})();const mn="modulepreload",fn=function(a){return"/"+a},It={},E=function(e,t,r){let n=Promise.resolve();if(t&&t.length>0){let i=function(u){return Promise.all(u.map(d=>Promise.resolve(d).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};document.getElementsByTagName("link");const c=document.querySelector("meta[property=csp-nonce]"),l=c?.nonce||c?.getAttribute("nonce");n=i(t.map(u=>{if(u=fn(u),u in It)return;It[u]=!0;const d=u.endsWith(".css"),p=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${p}`))return;const h=document.createElement("link");if(h.rel=d?"stylesheet":mn,d||(h.as="script"),h.crossOrigin="",h.href=u,l&&h.setAttribute("nonce",l),document.head.appendChild(h),d)return new Promise((g,y)=>{h.addEventListener("load",g),h.addEventListener("error",()=>y(new Error(`Unable to preload CSS for ${u}`)))})}))}function s(i){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=i,window.dispatchEvent(c),!c.defaultPrevented)throw i}return n.then(i=>{for(const c of i||[])c.status==="rejected"&&s(c.reason);return e().catch(s)})},Ot="getting-started",st="getting-started",gn="protect-your-work",yn="review-and-export",bn="draft-library",wn="validation-workflow",xn="blueprints-safety",Fo=[{id:"browser-storage",title:"Understand where your work lives",description:"Drafts, templates, settings, and theme edits stay in this browser profile by default. Clearing browser storage removes them unless you export a backup first.",to:"/about",actionLabel:"Read about browser storage"},{id:"api-keys",title:"Set up an API key",description:"Open Settings, pick the provider you actually use, and paste the provider key you want the browser app to send with generation requests.",to:"/settings",actionLabel:"Open Settings"},{id:"template",title:"Choose a template before you generate",description:"Templates define which assets are produced and what export structure must be preserved. Start with the built-in template before making custom ones.",to:"/templates",actionLabel:"Review templates"},{id:"generate",title:"Create your first draft",description:"Go to Generate, enter a seed, confirm the content mode, and let the app produce a full draft pack you can review asset by asset.",to:"/generate",actionLabel:"Start generating"},{id:"review",title:"Review before exporting",description:"Open the saved draft, check for consistency and missing details, and refine anything that does not fit the character you want to keep.",to:"/drafts",actionLabel:"Open draft library"},{id:"export",title:"Export with browser expectations in mind",description:"On mobile or in a browser, export may use a share sheet, a new tab, or the download tray instead of a desktop-style save dialog.",to:"/data",actionLabel:"See backup and export tools"}],vn=[{id:"what-is-a-template",title:"Templates vs. blueprints",category:"Concepts",summary:"Templates choose the asset graph. Blueprints define how each asset is generated. Most users should start with templates and leave blueprints alone until they understand the workflow.",bullets:["Templates decide which files exist and in what order they depend on each other.","Blueprints are stricter and can break parser-facing output if edited casually.","Use the built-in template first, then move to custom templates only after you understand review and export."],actions:[{label:"Open templates",to:"/templates"},{label:"Open blueprints",to:"/blueprints"}]},{id:"how-export-works",title:"How export works in the browser",category:"Getting Started",summary:"Browser export behavior depends on the device and browser. Normal web apps do not always get a native filename prompt.",bullets:["Desktop browsers often save directly to Downloads.","Mobile browsers may show a share sheet or open a new tab instead of prompting for a filename.","Use Data Manager exports when you want a full backup of browser-stored content."],actions:[{label:"Open Data Manager",to:"/data"},{label:"Open draft review",to:"/drafts"}]},{id:"api-key-setup",title:"API key setup without guesswork",category:"Getting Started",summary:"The browser app talks to your chosen model provider using the API key you enter in Settings. No local backend service is required for the current web runtime.",bullets:["Choose the provider you really use before selecting a model.","If a key looks corrupted or includes invisible characters, the app will reject it.","Persist keys only on devices you control."],actions:[{label:"Open Settings",to:"/settings"},{label:"Read About storage",to:"/about"}]},{id:"first-draft-review",title:"How to review a first draft",category:"Concepts",summary:"A good review checks structure first, then consistency, then polish. Do not export just because generation finished.",bullets:["Confirm the character name, major facts, and tone stay consistent across assets.","Watch for unresolved placeholders or format drift in strict assets.","Use refinement and validation before exporting to a target format."],actions:[{label:"Open Library",to:"/drafts"},{label:"Open Validation",to:"/validation"}]},{id:"common-blockers",title:"Common blockers and what to do next",category:"Troubleshooting",summary:"Most early problems are configuration or browser-behavior issues, not generator bugs.",bullets:["If generation fails immediately, verify the provider, model, and API key in Settings.","If export feels silent on mobile, check for a share sheet, a new tab, or the browser download tray.","If you lose drafts after clearing browser data, restore from a JSON backup in Data Manager."],actions:[{label:"Open Settings",to:"/settings"},{label:"Open Data Manager",to:"/data"}]}],Uo=["Getting Started","Concepts","Troubleshooting"],tr=[{id:st,title:"Getting Started Tour",summary:"Walk through the safest first-run path from setup to a first export-ready draft.",audience:"New users who want the app to tell them what to do next.",estimatedMinutes:6,steps:[{id:"start-home",title:"Start from Home",description:"Home is the launch surface for the beginner path. It tells you what the current browser app can do and where to go next.",to:"/",routeLabel:"Home",bullets:["Use Home when you are not sure which workflow to open first.","The browser profile you are using is the current storage location for drafts and settings."]},{id:"set-up-provider",title:"Set up provider access",description:"Open Settings before you generate anything. This avoids the most common first-run failure: trying to generate with a missing or mismatched provider key.",to:"/settings",routeLabel:"Settings",targetId:"settings-api-keys",targetLabel:"API Keys",bullets:["Pick the provider you actually use.","Enter the API key you want the browser app to send.","Use trusted devices if you choose to persist keys locally."]},{id:"choose-template",title:"Choose the template first",description:"Templates decide which assets exist and how the draft will export. Make this choice before refining the prompt or seed.",to:"/templates",routeLabel:"Templates",bullets:["Start with the built-in template unless you already understand custom template behavior.","Template changes are structural, not cosmetic."]},{id:"generate-draft",title:"Generate the first draft",description:"Once provider setup and template choice are in place, Generate becomes the first full workflow step.",to:"/generate",routeLabel:"Generate",targetId:"generation-submit",targetLabel:"Generate Character button",bullets:["Enter a concrete seed instead of a vague one-liner.","Treat the first result as a draft to review, not a final export."]},{id:"review-library",title:"Review saved drafts",description:"The library is where you reopen saved work and decide what should move into deeper review, validation, or export.",to:"/drafts",routeLabel:"Library",bullets:["Open the library after generation to confirm the draft actually saved.","Use draft review before export when details need cleanup."]},{id:"protect-work",title:"Protect your work with backups",description:"Data Manager is the safety net for browser-local storage. Use it before clearing browser data or moving to another device.",to:"/data",routeLabel:"Data Manager",bullets:["Export backups before risky changes.","Treat API key exports as sensitive data."]}]},{id:gn,title:"Protect Your Work Tour",summary:"Learn the browser-storage model, backup path, and the pages that matter when you need to avoid losing work.",audience:"Users who are worried about where data lives and how to recover it safely.",estimatedMinutes:4,steps:[{id:"storage-model",title:"Confirm the storage model",description:"About explains that the current product surface is the browser app. That matters because drafts and configuration live in browser storage by default.",to:"/about",routeLabel:"About",bullets:["Do not assume a local backend or desktop shell is saving your work for you.","Treat this browser profile as the place where your work currently lives."]},{id:"backup-tools",title:"Use backup tools intentionally",description:"Data Manager is where you export or restore browser-stored content when you need to migrate, recover, or safeguard work.",to:"/data",routeLabel:"Data Manager",bullets:["Back up before clearing site data.","Use restore only with files you trust and understand."]},{id:"privacy-expectations",title:"Understand privacy expectations",description:"Privacy explains the difference between local browser storage and the provider requests you intentionally send during generation.",to:"/privacy",routeLabel:"Privacy",bullets:["Local storage and provider traffic are different concerns.","Backups can still expose sensitive material if handled carelessly."]},{id:"secure-settings",title:"Review secure settings habits",description:"Settings is where you control provider keys and persistence choices, so it is part of the data-protection workflow too.",to:"/settings",routeLabel:"Settings",targetId:"settings-api-keys",targetLabel:"API Keys",bullets:["Persist keys only on devices you control.","If something feels unsafe or unclear, return to Help Center before continuing."]}]},{id:yn,title:"Review and Export Tour",summary:"Walk through the review controls that matter before you hand a draft off to export.",audience:"Users who already generated a draft and need a safe review path before exporting.",estimatedMinutes:5,steps:[{id:"review-actions",title:"Start from the review action bar",description:"The review header is the control surface for validation, favoriting, export, and draft deletion.",to:"/drafts/",routeLabel:"Draft Review",matchMode:"prefix",targetId:"review-actions",targetLabel:"Review actions",bullets:["Do not export immediately if you have not checked the draft structure yet.","Keep destructive actions separate from export so you do not rush them."]},{id:"review-validate",title:"Validate before export",description:"Use validation before exporting when the draft has been edited or when the template has strict structure requirements.",to:"/drafts/",routeLabel:"Draft Review",matchMode:"prefix",targetId:"review-validate",targetLabel:"Validate button",bullets:["Validation catches structural problems that a quick read can miss.","Treat missing required pieces or unresolved placeholders as blockers."]},{id:"review-assets",title:"Read the assets, not just the title",description:"The asset list is where consistency problems usually reveal themselves. Check names, tone, and required sections across multiple assets.",to:"/drafts/",routeLabel:"Draft Review",matchMode:"prefix",targetId:"review-assets",targetLabel:"Draft assets",bullets:["A draft can look good in one asset while still being broken elsewhere.","Use targeted editing when only one asset drifts."]},{id:"review-export",title:"Export with browser expectations in mind",description:"When the draft is coherent, use Export. On browser and mobile surfaces this may hand off through a share sheet, new tab, or downloads tray instead of a native save dialog.",to:"/drafts/",routeLabel:"Draft Review",matchMode:"prefix",targetId:"review-export",targetLabel:"Export button",bullets:["The app now tells you which handoff method was used.","If export feels silent on mobile, check share and browser download surfaces."]},{id:"export-choose-preset",title:"Choose the export preset inside the modal",description:"Once the export modal opens, choose the preset that matches the system you are exporting for instead of blindly taking the first option.",to:"/drafts/",routeLabel:"Export Modal",matchMode:"prefix",targetId:"export-preset-selection",targetLabel:"Export preset selection",bullets:["Presets change output structure and destination compatibility.","If you are unsure, review the preset description before continuing."]},{id:"export-confirm",title:"Confirm export and watch the handoff result",description:"Use the Export button after the preset is selected, then follow the browser-specific save or share flow the app reports back to you.",to:"/drafts/",routeLabel:"Export Modal",matchMode:"prefix",targetId:"export-confirm",targetLabel:"Export confirm button",bullets:["A successful export in the browser may still look different from a desktop save dialog.","Use the success message to know whether the file went to share, download, or a new tab."]}]},{id:bn,title:"Draft Library Tour",summary:"Learn how to use the library as a review queue instead of a pile of saved outputs.",audience:"Users who generated drafts and need to understand where to reopen, compare, and triage them.",estimatedMinutes:4,steps:[{id:"draft-library-overview",title:"Treat Drafts as your working library",description:"The library is not just storage. It is where you decide which drafts are worth opening for deeper review or export.",to:"/drafts",routeLabel:"Library",targetId:"drafts-list",targetLabel:"Draft list",bullets:["Open the library from here after generation instead of relying on memory or browser history.","Use names, tags, and favorites to keep the library readable as it grows."]},{id:"draft-workbench",title:"Use the workbench for comparison and checks",description:"The workbench keeps review aids in view so you can compare outputs and think before opening a draft for editing.",to:"/drafts",routeLabel:"Library",targetId:"drafts-workbench",targetLabel:"Draft workbench",bullets:["Comparison and review tools help you choose the better draft before you start editing.","Staged placeholders are visible here, but only the active tools should drive your next action."]},{id:"draft-review-hand-off",title:"Open one draft for real review",description:"Once a draft looks worth keeping, open it and continue with validation, editing, and export on the review page.",to:"/drafts",routeLabel:"Drafts",targetId:"drafts-open-review",targetLabel:"Draft review links",bullets:["The library is the triage layer. The review page is the editing and export layer.","Back up important work before risky cleanup or browser-data changes."]}]},{id:wn,title:"Validation Workflow Tour",summary:"Walk through the validation screen so structural checks become a normal part of review instead of a last-minute panic step.",audience:"Users who edit drafts or export to strict formats and need to know when validation matters.",estimatedMinutes:4,steps:[{id:"validation-overview",title:"Use validation as a structural checkpoint",description:"Validation is where you confirm the draft still matches the expected structure before you export or hand it off to another tool.",to:"/validation",routeLabel:"Validation",targetId:"validation-draft-panel",targetLabel:"Validate saved draft panel",bullets:["Run validation after major edits, not only after generation.","Treat structural failures as blockers instead of cosmetic warnings."]},{id:"validation-run",title:"Choose the simplest input path",description:"Most users should validate a saved draft by review ID instead of typing a manual path unless they know exactly what they are checking.",to:"/validation",routeLabel:"Validation",targetId:"validation-draft-run",targetLabel:"Validate Draft button",bullets:["Use saved-draft validation for normal browser workflows.","Manual paths are useful when you are investigating a specific stored location."]},{id:"validation-results",title:"Read the results for real blockers",description:"The result panel tells you whether the draft passed and shows the lines that need attention before export.",to:"/validation",routeLabel:"Validation",targetId:"validation-results",targetLabel:"Validation results",bullets:["Fix missing required sections and unresolved placeholders first.","If the result passes, move back to review or export with more confidence."]}]},{id:xn,title:"Blueprint Safety Tour",summary:"Learn when to leave blueprints alone, when to inspect them carefully, and where to bail out to safer surfaces.",audience:"Non-technical or first-time users who might wander into blueprints before understanding template contracts.",estimatedMinutes:4,steps:[{id:"blueprints-search",title:"Treat Blueprints as inspection first, editing second",description:"Start by searching and reading. Do not jump into editing unless you know why a blueprint needs to change.",to:"/blueprints",routeLabel:"Blueprints",targetId:"blueprints-search",targetLabel:"Blueprint search",bullets:["Search helps you understand which blueprint family you are looking at.","Reading the path and description usually tells you whether the file is core, system, or template-specific."]},{id:"blueprints-tools",title:"Use browser safety tools before editing",description:"The lint and sandbox tools exist so you can inspect behavior without immediately rewriting contract-heavy text.",to:"/blueprints",routeLabel:"Blueprints",targetId:"blueprints-tools",targetLabel:"Blueprint tools",bullets:["Use lint and preview to reduce guesswork.","A readable blueprint is not automatically a safe blueprint."]},{id:"blueprints-exit-ramp",title:"Know the safer alternative",description:"If you are trying to change workflow shape rather than raw blueprint text, templates are usually the safer surface for early users.",to:"/blueprints",routeLabel:"Blueprints",targetId:"blueprints-list",targetLabel:"Blueprint list",bullets:["Do not edit a blueprint just because you found the right file name.","When in doubt, go back to Templates or Help Center before making changes."]}]}],_n=[{id:"home",match:"/",matchMode:"exact",title:"Home help",summary:"Use Home as the launch surface for first-run guidance, recent updates, quick actions, and your next step into the workflow.",keyActions:["Start with the Getting Started guide if this is your first run.","Use Quick Actions to jump straight into Generate, Drafts, or Seeds.","Check What’s New when behavior changes after an update."],pitfalls:["Do not assume your work syncs automatically. This browser profile is the storage location by default.","Do not skip Settings if generation cannot start; most early issues begin there."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"generate",match:"/generate",matchMode:"exact",title:"Generate help",summary:"Generation is where you choose the template, seed, provider, and content mode that become a full draft pack.",keyActions:["Choose the template before you spend time refining the seed.","Keep the seed concrete enough that the model has something to preserve across assets.","Use review after generation instead of trying to perfect everything in one pass."],pitfalls:["A missing or invalid API key will usually fail generation before useful output appears.","Changing template assumptions late can invalidate your review expectations."],actions:[{label:"Open Settings",to:"/settings"},{label:"Open templates",to:"/templates"}],relatedTopicIds:["api-key-setup","what-is-a-template"]},{id:"seed-generator",match:"/seed-generator",matchMode:"exact",title:"Seed Generator help",summary:"Use Seed Generator when you need raw concept material before you commit to a full draft workflow.",keyActions:["Generate multiple seeds and keep the one with the clearest identity.","Pass the best seed into Generate instead of trying to export from here."],pitfalls:["A seed is not a finished draft; it still needs a template and generation pass."],actions:[{label:"Open Generate",to:"/generate"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["common-blockers"]},{id:"validation",match:"/validation",matchMode:"exact",title:"Validation help",summary:"Validation helps you catch structural issues before export, especially on strict templates or edited drafts.",keyActions:["Validate after major edits and before export.","Treat missing required assets or unresolved placeholders as blockers, not cosmetic warnings."],pitfalls:["Passing generation does not guarantee export readiness."],actions:[{label:"Open Library",to:"/drafts"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["first-draft-review","common-blockers"]},{id:"batch",match:"/batch",matchMode:"exact",title:"Batch help",summary:"Batch generation is for running multiple drafts in sequence without driving the app one draft at a time.",keyActions:["Keep concurrency conservative until you know your provider limits.","Use batch for throughput, not for first-time learning of the workflow."],pitfalls:["High concurrency can make failures harder to interpret."],actions:[{label:"Open Generate",to:"/generate"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["common-blockers"]},{id:"drafts",match:"/drafts",matchMode:"exact",title:"Library help",summary:"The library is where you reopen saved work, check metadata, and decide which draft should move into review or export.",keyActions:["Open the review page for the draft you want to polish or export.","Use metadata and favorites to keep the library manageable as it grows."],pitfalls:["Deleting a draft removes the browser-local copy unless you already exported or backed it up."],actions:[{label:"Open Data Manager",to:"/data"},{label:"Open Validation",to:"/validation"}],relatedTopicIds:["first-draft-review","common-blockers"]},{id:"draft-review",match:"/drafts/",matchMode:"prefix",title:"Draft review help",summary:"Review is where you inspect generated assets, refine weak spots, validate structure, and export only when the pack is coherent.",keyActions:["Check the character name, core traits, and tone across multiple assets before exporting.","Use refine tools for targeted edits instead of regenerating the whole draft immediately.","Validate after meaningful edits."],pitfalls:["A draft that reads well in one asset can still fail export because another asset drifted or broke format.","Do not ignore placeholders or empty required sections in strict assets."],actions:[{label:"Open Validation",to:"/validation"},{label:"Open Data Manager",to:"/data"}],relatedTopicIds:["first-draft-review","how-export-works"]},{id:"templates",match:"/templates",matchMode:"exact",title:"Templates help",summary:"Templates define which assets exist, how they depend on each other, and what export structure needs to remain valid.",keyActions:["Use the built-in template first so you understand the app’s baseline workflow.","Treat template changes as structural decisions, not cosmetic ones."],pitfalls:["Changing template expectations late can invalidate assumptions in review and export."],actions:[{label:"Open Generate",to:"/generate"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["what-is-a-template"]},{id:"blueprints",match:"/blueprints",matchMode:"exact",title:"Blueprints help",summary:"Blueprints are advanced prompt/compiler definitions. They are powerful, but they are not a safe first editing surface for non-technical users.",keyActions:["Prefer templates unless you are intentionally changing generation structure.","Preserve parser-facing formats and placeholders carefully when editing."],pitfalls:["A casual blueprint edit can break validation or export even if the text still looks readable."],actions:[{label:"Open templates",to:"/templates"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["what-is-a-template"]},{id:"blueprint-editor",match:"/blueprints/edit",matchMode:"prefix",title:"Blueprint editor help",summary:"The editor is for advanced changes to blueprint text and should be treated as a strict contract surface, not a freeform note field.",keyActions:["Keep output structures intact when the target asset expects rigid formatting.","Validate edits before using them in a generation workflow."],pitfalls:["Unfilled placeholders, broken structure, or dependency mistakes can cascade through later assets."],actions:[{label:"Open Validation",to:"/validation"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["what-is-a-template","common-blockers"]},{id:"similarity",match:"/similarity",matchMode:"exact",title:"Similarity help",summary:"Similarity helps you inspect overlap between drafts so you can catch repeats, redundancy, or near-duplicates.",keyActions:["Use it after building a larger draft library or batch output set."],pitfalls:["Similarity is analysis support, not a replacement for human review."],actions:[{label:"Open Library",to:"/drafts"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["first-draft-review"]},{id:"offspring",match:"/offspring",matchMode:"exact",title:"Offspring help",summary:"Offspring combines parent drafts into a derivative result, so parent quality and consistency matter before you start.",keyActions:["Choose parents that are already reviewed and structurally healthy."],pitfalls:["Using unstable or contradictory parents gives unstable offspring output."],actions:[{label:"Open Library",to:"/drafts"},{label:"Open Validation",to:"/validation"}],relatedTopicIds:["first-draft-review"]},{id:"lineage",match:"/lineage",matchMode:"exact",title:"Lineage help",summary:"Lineage shows how related drafts connect over time so you can track derivations and review ancestry.",keyActions:["Use lineage when you need provenance, not when you need direct editing."],pitfalls:["Lineage helps you understand relationships, but it does not repair structural draft issues on its own."],actions:[{label:"Open Library",to:"/drafts"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["first-draft-review"]},{id:"themes",match:"/themes",matchMode:"exact",title:"Themes help",summary:"Themes control the browser UI appearance. Runtime theme behavior lives in the app, not in the reference TOML files under resources.",keyActions:["Use presets as a base and save customizations intentionally."],pitfalls:["Editing reference theme files in the repo is not the same as changing the live browser theme runtime."],actions:[{label:"Open Settings",to:"/settings"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["common-blockers"]},{id:"settings",match:"/settings",matchMode:"exact",title:"Settings help",summary:"Settings controls provider access, model defaults, browser persistence choices, theme behavior, and tutorial/help preferences.",keyActions:["Start here if generation fails, models are missing, or you are unsure where data is stored.","Use the Help and Tutorials section to restart the starter guide or re-enable tips."],pitfalls:["Saving API keys in browser storage is convenient, but it should be limited to devices you trust."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open About",to:"/about"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"data",match:"/data",matchMode:"exact",title:"Data Manager help",summary:"Data Manager is the safety net for browser-local drafts, config, and backups.",keyActions:["Export backups before clearing browser data or changing devices.","Treat API-key export files as sensitive data."],pitfalls:["Clearing browser storage without a backup removes local drafts and settings."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["how-export-works","common-blockers"]},{id:"whats-new",match:"/whats-new",matchMode:"exact",title:"What’s New help",summary:"Use this page to understand recent product changes and staged roadmap work before assuming the workflow still behaves the same way.",keyActions:["Check release notes after updates when a flow feels different."],pitfalls:["Roadmap items are not the same as implemented features."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Home",to:"/"}],relatedTopicIds:["common-blockers"]},{id:"about",match:"/about",matchMode:"exact",title:"About help",summary:"About explains the current browser-first product surface, storage model, and the difference between the app runtime and repo reference assets.",keyActions:["Use About when you need to confirm how the browser app stores or handles your work."],pitfalls:["Do not assume older Python/backend flows exist in the current product unless you can see them in the app."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"help-center",match:"/help",matchMode:"exact",title:"Help Center help",summary:"Help Center is the structured fallback when you want answers without guessing which page or workflow to visit next.",keyActions:["Start with the Getting Started section if you are still learning the workflow.","Use concepts when the terminology is the blocker.","Use troubleshooting when the app behavior does not match your expectation."],pitfalls:["The Help Center explains the browser app. It does not guarantee parity with future mobile or desktop surfaces."],actions:[{label:"Open Home",to:"/"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"license",match:"/license",matchMode:"exact",title:"License help",summary:"License explains the repository licensing terms and should be read when you need usage or redistribution clarity.",keyActions:["Use this page when you need the exact license text or attribution expectations."],pitfalls:["License answers legal distribution questions, not workflow or storage questions."],actions:[{label:"Open About",to:"/about"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["common-blockers"]},{id:"terms",match:"/terms",matchMode:"exact",title:"Terms help",summary:"Terms of Use covers the rules around using the app, exports, and generated content through the current browser surface.",keyActions:["Use this page when you need policy guidance rather than workflow guidance."],pitfalls:["Terms is not a how-to page. Use Help Center for workflow questions."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Privacy",to:"/privacy"}],relatedTopicIds:["common-blockers"]},{id:"privacy",match:"/privacy",matchMode:"exact",title:"Privacy help",summary:"Privacy explains what stays in browser storage, what reaches provider APIs, and what sensitive data you are responsible for handling carefully.",keyActions:["Use this page when you need to understand local storage, API key handling, or data exposure to providers."],pitfalls:["Browser-local does not mean impossible to lose. You still need backups if the data matters."],actions:[{label:"Open Data Manager",to:"/data"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"security",match:"/security",matchMode:"exact",title:"Security help",summary:"Security covers vulnerability reporting and safe handling of provider keys and browser-stored configuration.",keyActions:["Use this page when the question is about secure handling or vulnerability reporting."],pitfalls:["Security policy does not replace provider-specific account protection practices."],actions:[{label:"Open Settings",to:"/settings"},{label:"Open Privacy",to:"/privacy"}],relatedTopicIds:["api-key-setup"]},{id:"code-of-conduct",match:"/code-of-conduct",matchMode:"exact",title:"Code of Conduct help",summary:"Code of Conduct covers collaboration expectations for the repository and project community spaces.",keyActions:["Use this page for contribution and interaction standards, not workflow setup."],pitfalls:["Community rules are separate from app usage or licensing terms."],actions:[{label:"Open About",to:"/about"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["common-blockers"]}],kn=[{route:"/",pageHelpId:"home",coverage:"complete"},{route:"/generate",pageHelpId:"generate",coverage:"complete"},{route:"/seed-generator",pageHelpId:"seed-generator",coverage:"complete"},{route:"/validation",pageHelpId:"validation",coverage:"complete"},{route:"/batch",pageHelpId:"batch",coverage:"complete"},{route:"/drafts",pageHelpId:"drafts",coverage:"complete"},{route:"/drafts/:id",pageHelpId:"draft-review",coverage:"complete"},{route:"/drafts/:id/assets/:assetName/regenerate",pageHelpId:"draft-review",coverage:"complete"},{route:"/templates",pageHelpId:"templates",coverage:"complete"},{route:"/blueprints",pageHelpId:"blueprints",coverage:"complete"},{route:"/blueprints/edit/*",pageHelpId:"blueprint-editor",coverage:"complete"},{route:"/lineage",pageHelpId:"lineage",coverage:"complete"},{route:"/similarity",pageHelpId:"similarity",coverage:"complete"},{route:"/offspring",pageHelpId:"offspring",coverage:"complete"},{route:"/themes",pageHelpId:"themes",coverage:"complete"},{route:"/settings",pageHelpId:"settings",coverage:"complete"},{route:"/data",pageHelpId:"data",coverage:"complete"},{route:"/about",pageHelpId:"about",coverage:"complete"},{route:"/help",pageHelpId:"help-center",coverage:"complete"},{route:"/whats-new",pageHelpId:"whats-new",coverage:"complete"},{route:"/license",pageHelpId:"license",coverage:"complete"},{route:"/terms",pageHelpId:"terms",coverage:"complete"},{route:"/privacy",pageHelpId:"privacy",coverage:"complete"},{route:"/security",pageHelpId:"security",coverage:"complete"},{route:"/code-of-conduct",pageHelpId:"code-of-conduct",coverage:"complete"}];kn.map(a=>({path:a.route,pageHelpId:a.pageHelpId}));function Sn(a){const e=_n.filter(t=>t.matchMode==="exact"?a===t.match:a.startsWith(t.match));return e.length===0?null:e.sort((t,r)=>r.match.length-t.match.length)[0]??null}function Be(a){return tr.find(e=>e.id===a)??null}function ot(a,e){return(e.matchMode??"exact")==="exact"?a===e.to:a.startsWith(e.to)}const Tn=[{id:"generation-workflow",title:"Generation Workflow",status:"placeholder",ownerFiles:["packages/web/src/components/generation/Generation.tsx","packages/web/src/components/generation/GenerationProgress.tsx","packages/web/src/components/generation/SeedGenerator.tsx","packages/web/src/components/batch/BatchGenerate.tsx","packages/web/src/lib/services/generation.ts"],placeholderFiles:["packages/web/src/components/generation/ApprovalWorkflowPlaceholder.tsx","packages/web/src/components/generation/CheckpointSessionPlaceholder.tsx","packages/web/src/lib/services/generation-scenarios.ts","packages/web/src/lib/services/seed-remix.ts"],items:["Asset-by-asset approval workflow before downstream generation continues","Checkpointed generation sessions that let users pause, resume, or restart from any approved asset","Partial regeneration flow for replacing one asset without discarding the rest of the draft","Multi-model comparison runs for the same seed and template","Batch generation queue with priorities, retry policies, and run history","Scenario presets for common generation goals such as fast drafting, high-structure output, or art-focused packs","Constraint builder for generation goals like tone, genre, style, and content level","Seed remix feature that combines multiple saved concepts into one prompt","Seed idea board with saved prompts, themes, and inspiration sets","Assistant suggestions for strengthening weak or underspecified seeds","Offline/local-model optimized workflow presets","Guided first-run generation flow for helping new users reach a valid draft quickly"]},{id:"review-and-editing",title:"Review and Editing",status:"placeholder",ownerFiles:["packages/web/src/components/drafts/Review.tsx","packages/web/src/components/drafts/Drafts.tsx","packages/web/src/components/common/ChatPanel.tsx","packages/web/src/components/drafts/DraftComparisonPanel.tsx","packages/web/src/components/drafts/ReviewChecklistPanel.tsx","packages/web/src/components/drafts/VersionHistoryPanel.tsx"],placeholderFiles:[],items:["Merge-ready draft comparison workflow for comparing alternate generations and promoting selected assets","Persistent structured review checklist with asset-level scoring, notes, and export gating","Asset health scoring based on completeness, consistency, and format compliance","Provenance view showing which upstream assets influenced each generated asset","Inline review notes attached to individual assets","Asset-level commenting with a simple resolved/unresolved state","Draft branching system for exploring alternate versions of the same character","Draft merge tools for selectively combining assets from different branches","Deeper version history with restore points and revision diffs","Focus mode for reviewing one asset with its immediate dependencies visible","Assistant tools for rewriting a single asset while preserving established canon","Read-only review links for sharing a draft state without enabling edits"]},{id:"templates-and-blueprints",title:"Templates and Blueprints",status:"placeholder",ownerFiles:["packages/web/src/components/templates/Templates.tsx","packages/web/src/components/templates/TemplateWizard.tsx","packages/web/src/components/templates/TemplateComparisonPanel.tsx","packages/web/src/components/blueprints/Blueprints.tsx","packages/web/src/components/blueprints/BlueprintEditor.tsx","packages/web/src/components/blueprints/BlueprintLintPanel.tsx","packages/web/src/components/blueprints/BlueprintSandboxPanel.tsx"],placeholderFiles:["packages/web/src/components/templates/TemplateMigrationPlaceholder.tsx"],items:["Guided template creation wizard in the web UI","Template migration assistant for updating older drafts to newer template versions","Expanded blueprint preview sandbox with prior-asset context sets and reusable test cases","Visual dependency graph for template assets and generation order","Template marketplace or import/export bundle format for sharing templates","Template starter kits for common character-card formats and content styles","Template cloning flow for using the built-in template as a starting point for a custom one","Expanded template comparison workflow with cloning and migration-aware diffs","Expanded blueprint linting dashboard for placeholder usage, dependency clarity, and output expectations","Prompt experimentation lab for testing orchestrator and blueprint variants","Shared blueprint snippet library for reusable sections and control blocks","Template-aware onboarding tutorial for new users"]},{id:"draft-library-and-organization",title:"Draft Library and Organization",status:"placeholder",ownerFiles:["packages/web/src/components/drafts/Drafts.tsx","packages/web/src/components/Home.tsx"],placeholderFiles:["packages/web/src/components/drafts/LibraryCollectionsPlaceholder.tsx"],items:["Better draft library filters for archetype, tone, mode, template, and tags","Saved searches and smart collections for large draft libraries","Bulk metadata editing across multiple drafts","Favorite and pin system for important drafts, templates, and presets","Semantic search across draft content, not just metadata","Auto-tagging suggestions based on generated content","Archive and curation workflows for keeping large draft libraries manageable","Custom foldering or collection system beyond timestamp-based draft storage","Recently viewed and recently edited lists for faster navigation","Duplicate-detection suggestions while browsing the library","Custom metadata fields for project-specific cataloging","Library summary dashboard with counts by template, mode, and generation source"]},{id:"canon-worldbuilding-and-relationships",title:"Canon, Worldbuilding, and Relationships",status:"placeholder",ownerFiles:["packages/web/src/components/lineage/Lineage.tsx","packages/web/src/components/similarity/Similarity.tsx","packages/web/src/components/offspring/Offspring.tsx","packages/web/src/components/worlds/Worlds.tsx","packages/web/src/components/timelines/Timelines.tsx","packages/web/src/components/worlds/Events.tsx","packages/web/src/components/timelines/GenerationHistoryPanel.tsx"],placeholderFiles:["packages/web/src/components/lineage/TimelinePlaceholder.tsx","packages/web/src/components/lineage/AncestryVisualizationPlaceholder.tsx","packages/web/src/components/lineage/LineageExportPlaceholder.tsx","packages/web/src/components/similarity/ClusteringPlaceholder.tsx","packages/web/src/components/similarity/RelationshipGraphPlaceholder.tsx","packages/web/src/components/offspring/TraitInheritancePlaceholder.tsx","packages/web/src/components/offspring/BreedingHistoryPlaceholder.tsx","packages/web/src/components/worlds/CanonLibraryPlaceholder.tsx","packages/web/src/components/worlds/WorldbookPlaceholder.tsx","packages/web/src/components/worlds/RelationshipMapPlaceholder.tsx","packages/web/src/components/worlds/FactionManagerPlaceholder.tsx","packages/web/src/components/worlds/LocationManagerPlaceholder.tsx","packages/web/src/components/worlds/UniverseNotesPlaceholder.tsx","packages/web/src/components/worlds/CanonLockPlaceholder.tsx","packages/web/src/components/timelines/EventTimelinePlaceholder.tsx","packages/web/src/components/timelines/ContinuityAssistantPlaceholder.tsx","packages/web/src/components/worlds/EventCalendarPlaceholder.tsx","packages/web/src/components/worlds/EventEditorPlaceholder.tsx","packages/web/src/components/worlds/EventCategoriesPlaceholder.tsx","packages/web/src/lib/services/canon-library.ts"],items:["Reusable canon library for traits, lore, tags, and recurring world details","Worldbook or setting support that can be attached to multiple related drafts","Relationship mapping between characters in the same universe","Lineage timeline view showing how drafts evolved over time","Similarity clustering to group near-duplicate or closely related drafts","Shared faction, setting, and location records reusable across drafts","Universe-level notes that can be referenced during generation and review","Canon lock system for facts that should remain stable across derivative drafts","Family tree and affiliation visualizations for related characters","Cross-draft continuity assistant for keeping related characters aligned","Event calendar with in-world and real-world date tracking","Expanded generation history timeline with restore points, lineage jumps, and draft-level drilldown","Continuity checking for canon conflicts across drafts"]},{id:"export-and-publishing",title:"Export and Publishing",status:"placeholder",ownerFiles:["packages/web/src/components/common/ExportModal.tsx","packages/shared/src/export/presets.ts"],placeholderFiles:["packages/web/src/components/common/ExportPreviewPlaceholder.tsx","packages/web/src/components/common/PublishingPlaceholder.tsx"],items:["Preset preview mode showing exactly which files and names an export will produce","Platform capability matrix for checking which presets work with which templates","Character pack publishing flow for producing a polished shareable bundle","Export profiles with saved naming, packaging, and metadata rules","One-click export bundles for common targets and sharing destinations","Shareable web preview page for a generated character pack","Optional branded export themes for more polished presentation packages","Metadata manifest export for preserving provenance, model info, and template info alongside assets","Export dry-run mode that shows mapped outputs before creating files","Print-friendly or PDF-style presentation export for review and archiving"]},{id:"analysis-and-evaluation",title:"Analysis and Evaluation",status:"placeholder",ownerFiles:["packages/web/src/components/similarity/Similarity.tsx","packages/web/src/components/validation/Validation.tsx","packages/web/src/components/Home.tsx","packages/web/src/components/drafts/ReviewChecklistPanel.tsx"],placeholderFiles:["packages/web/src/components/similarity/ClusteringPlaceholder.tsx"],items:["Golden sample packs for template quality benchmarking","Evaluation dashboard for model quality, cost, latency, and format success rate","Token and cost analytics per asset, draft, template, and provider","Usage history dashboard for models, templates, exports, and generation modes","Quality trend tracking across model changes and template revisions","Scorecards for comparing provider performance on specific templates","Regression benchmark suite for measuring structural compliance over time","Review analytics showing which assets most often need human edits","Generation time breakdown by stage, provider, and asset count","Template adoption analytics to show which workflows users actually prefer"]},{id:"collaboration-and-sharing",title:"Collaboration and Sharing",status:"placeholder",ownerFiles:["packages/web/src/components/drafts/Review.tsx","packages/web/src/components/templates/Templates.tsx","packages/web/src/components/common/ExportModal.tsx"],placeholderFiles:["packages/web/src/components/common/PublishingPlaceholder.tsx"],items:["Collaboration-friendly review notes attached to individual assets","Shared workspaces for teams curating the same draft library","Commentable template reviews before publishing a new template version","Import/export package format for moving drafts with metadata and history intact","Team preset libraries for shared export and validation standards","Curated featured templates and starter packs surfaced in-app","Community template discovery with tags, screenshots, and example outputs","Public/private visibility controls for shared templates and draft bundles","Lightweight approval workflow for team-owned templates and presets","Activity feed for recent library changes, exports, and published templates"]},{id:"ux-and-platform-surfaces",title:"UX and Platform Surfaces",status:"placeholder",ownerFiles:["packages/web/src/App.tsx","packages/web/src/components/Layout.tsx","packages/web/src/components/Home.tsx","packages/mobile/src/screens"],placeholderFiles:["packages/web/src/components/common/OnboardingPlaceholder.tsx","packages/web/src/components/drafts/LibraryCollectionsPlaceholder.tsx"],items:["Mobile-first review and approval flow for draft triage on smaller screens","Desktop-native drag-and-drop import/export flows","Responsive split-pane editor optimized for wide and narrow displays","Keyboard-first review workflows across web, mobile, and desktop surfaces","Quick actions palette for jumping to drafts, templates, exports, and tools","Pinned dashboard widgets for recent drafts, saved searches, and active queues","Guided empty states that teach features instead of just showing blank screens","In-app documentation panels linked to templates, presets, and validation rules","Customizable home screen tailored to the user's most common workflow","Workspace mode for switching between solo drafting, review, and bulk operations"]},{id:"assistant-and-automation",title:"Assistant and Automation",status:"placeholder",ownerFiles:["packages/web/src/components/common/GlobalAssistant.tsx","packages/web/src/components/common/ChatPanel.tsx","packages/web/src/components/Home.tsx"],placeholderFiles:["packages/web/src/components/common/AutomationPlaceholder.tsx","packages/web/src/components/common/OnboardingPlaceholder.tsx"],items:["Assistant tools for proposing alternate tones or styles for a selected asset","Assistant-generated metadata suggestions like tags, summaries, and archetypes","Auto-generated draft summaries for quick browsing in large libraries","Conversational template helper for explaining what each asset does and depends on","Smart recommendations for next actions after generation, review, or export","Workflow automations for repeated sequences like generate, validate, review, and export","Scheduled batch runs for seed lists or nightly model comparisons","Auto-generated handoff notes summarizing what changed between draft revisions","Safety profile presets tuned for different platforms or use cases","Assistant-backed onboarding that adapts to the selected template and workflow"]}];function ft(a){const e=a.toLowerCase();return e.startsWith("openrouter/")?"openrouter":e.startsWith("openai/")?"openai":e.startsWith("google/")?"google":e.startsWith("anthropic/")?"anthropic":e.startsWith("deepseek/")?"deepseek":e.startsWith("zai/")?"zai":e.startsWith("moonshot")?"moonshot":e.startsWith("ollama/")?"ollama":e.startsWith("gpt-")||e.startsWith("o1")?"openai":e.startsWith("gemini")?"google":e.startsWith("claude")?"anthropic":e.startsWith("llama")||e.startsWith("mistral")||e.startsWith("codellama")||e.startsWith("vicuna")||e.startsWith("qwen")||e.startsWith("phi")||e.startsWith("gemma")||e.startsWith("starcoder")||e.includes("ollama")?"ollama":"openrouter"}var Xe=class extends Error{constructor(a){super(a),this.name="ParseError"}},En=["system_prompt","post_history","character_sheet","intro_scene","intro_page","a1111"];function An(a){const e=/```(?:[a-z]*\n)?(.*?)```/gs,t=a.match(e);return t?t.map(r=>r.trim()):[]}function Cn(a,e){const t=An(a);if(t.length===0)throw new Xe("No codeblocks found in output");let r=0,n;t[0].trim().startsWith("Adjustment Note:")&&(n=t[0].trim(),r=1);const s=t.slice(r);let i=[];e&&e.assets.length>0?i=e.assets.map(d=>d.name):i=[...En];const c=i.length;if(s.length!==c){const d=s.slice(0,3).map((h,g)=>`  Block ${g}: ${h.substring(0,75)}${h.length>75?"...":""}`).join(`
`);let p=`Expected ${c} asset blocks, found ${s.length}. `;throw p+=`Template requires order: ${i.join(", ")}
`,p+=`Actual blocks found:
${d}`,s.length>3&&(p+=`
  ... and ${s.length-3} more blocks`),new Xe(p)}const l={};for(let d=0;d<i.length;d++)l[i[d]]=s[d];const u=Ln(l);if(u&&Object.keys(u).length>0){const d=Object.entries(u).map(([p,h])=>`${p}: ${Array.from(new Set(h)).join(", ")}`).join("; ");throw new Xe("Generated content failed validation checks: "+d)}return{assets:l,adjustmentNote:n}}function Nn(a){const e=a.match(/^name:\s*(.+)$/m);return e&&e[1].trim().replace(/^['"]|['"]$/g,"")||null}function Pn(a,e=["character_sheet"]){const t=[],r=new Set;for(const n of e)n in a&&!r.has(n)&&(t.push(n),r.add(n));for(const n of Object.keys(a))r.has(n)||(t.push(n),r.add(n));for(const n of t){const s=Nn(a[n]||"");if(s)return s}return null}var In=[["{PLACEHOLDER}",/\{PLACEHOLDER\}/g],["Generic {...} placeholder",/(?<!\{)\{(?!\{)[^{}\n]*[A-Za-z][^{}\n]*\}(?!\})/g],["Suno {TITLE}",/\{TITLE\}/g],["Suno other {..}",/\{GENRE\}|\{STYLE\}|\{MOOD\}|\{ENERGY\}|\{TEMPO\}|\{BPM\}|\{TEXTURE\}|\{Remaster Style\}/g],["A1111 slot ((...))",/\(\(\.\.\)\)/g],["A1111 any slot ((...something...)) left",/\(\([^)]*\.\.\.[^)]*\)/g],["Character sheet bracket placeholders",/\[[A-Za-z][^\]\n]*\]/g]],On=[["Narrates {{user}} action/thought/consent",/\{\{user\}\}\s+(?:is|was|feels?|felt|thinks?|thought|decides?|decided|knows?|knows?|wants?|wanted|says?|said|nods?|smiles?|walks?|steps?|looks?|touches?|takes?|gives?|allows?|consents?|agrees?|gasps?|moans?)\b/gi],["Narrates {{user}} internal state",/\{\{user\}\}'s\s+(?:mind|thoughts?|feelings?|emotions?|desire|consent|decision|reaction|actions?)\b/gi]],jn=/(?:never|do not|don't|avoid|without)\s+(?:narrat(?:e|ing)|describ(?:e|ing)|assign(?:ing)?)\s*$/gi,rr="character_sheet.txt";function Dn(a,e){const t=[];for(const[r,n]of In)r==="Character sheet bracket placeholders"&&e!==rr||n.test(a)&&t.push(r);return t}function Rn(a){const e=[];for(const[t,r]of On)for(const n of a.matchAll(r)){const s=a.substring(Math.max(0,n.index-48),n.index).trim();if(!jn.test(s)){e.push(t);break}}return e}function nr(a,e){let t=`${a}.txt`;a==="intro_page"&&(t="intro_page.md"),a==="character_sheet"&&(t=rr);const r=Dn(e,t);return r.push(...Rn(e)),r}function Ln(a){const e={};for(const[t,r]of Object.entries(a)){const n=nr(t,r);n.length>0&&(e[t]=n)}return Object.keys(e).length>0?e:null}var gt={name:"V2/V3 Card",version:"3.1",description:"Built-in character card template with 6 standard assets",is_official:!0,assets:[{name:"system_prompt",required:!0,depends_on:[],description:"System-level behavioral instructions",blueprint_file:"blueprints/system/system_prompt.md"},{name:"post_history",required:!0,depends_on:["system_prompt"],description:"Conversation context and relationship state",blueprint_file:"blueprints/system/post_history.md"},{name:"character_sheet",required:!0,depends_on:["system_prompt","post_history"],description:"Structured character data",blueprint_file:"blueprints/system/character_sheet.md"},{name:"intro_scene",required:!0,depends_on:["system_prompt","post_history","character_sheet"],description:"First interaction scenario",blueprint_file:"blueprints/system/intro_scene.md"},{name:"intro_page",required:!0,depends_on:["character_sheet"],description:"Visual character introduction page",blueprint_file:"blueprints/system/intro_page.md"},{name:"a1111",required:!0,depends_on:["character_sheet"],description:"Stable Diffusion image generation prompt",blueprint_file:"blueprints/system/a1111.md"}]};function Mn(a){const e=a.map(i=>i.name),t=[],r=new Set,n=new Set;function s(i){if(r.has(i)||n.has(i))return;n.add(i);const c=a.find(l=>l.name===i);if(c)for(const l of c.depends_on)s(l);r.add(i),t.push(i),n.delete(i)}for(const i of e)r.has(i)||s(i);return t}function ar(a){const e=a||gt;return Mn(e.assets).map(r=>e.assets.find(n=>n.name===r)).filter(r=>r!==void 0)}function Fn(a){const e=[];a.name||e.push("Template name is required"),(!a.assets||a.assets.length===0)&&e.push("Template must have at least one asset");const t=new Map(a.assets.map(n=>[n.name,n]));function r(n,s){for(const i of n){if(i===s)return!0;const c=t.get(i);if(c&&r(c.depends_on,s))return!0}return!1}for(const n of a.assets)r(n.depends_on,n.name)&&e.push(`Circular dependency detected for asset: ${n.name}`);return{isValid:e.length===0,errors:e}}class yt{config;constructor(e){this.config={temperature:.7,maxTokens:4096,timeout:18e4,...e}}async performFetch(e,t){try{return await fetch(e,t)}catch(r){throw this.normalizeRequestError(r)}}async*generateStream(e,t){const r=await this.generate(e,t);yield{content:r.content,done:!0,finishReason:r.finishReason}}getProvider(){return this.config.provider}getModel(){return this.config.model}getApiKey(){return this.config.apiKey}mergeOptions(e){return{temperature:this.config.temperature,maxTokens:this.config.maxTokens,...e}}getFetchOptions(e){const t=new AbortController,r=setTimeout(()=>t.abort(),this.config.timeout);return e?.addEventListener("abort",()=>{clearTimeout(r)}),{signal:e?Un([e,t.signal]):t.signal}}normalizeRequestError(e){return e instanceof Error&&e.name==="AbortError"?new Error("The request timed out or was cancelled. Try again, reduce the request size, or choose a faster model/provider."):e instanceof Error&&/operation was aborted/i.test(e.message)?new Error("The request timed out or was cancelled. Try again, reduce the request size, or choose a faster model/provider."):e instanceof Error?e:new Error("Request failed")}}function Un(a){const e=new AbortController;for(const t of a){if(t.aborted){e.abort();break}t.addEventListener("abort",()=>e.abort(),{once:!0})}return e.signal}class $n extends yt{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||this.getDefaultBaseUrl()}getDefaultBaseUrl(){switch(this.config.provider){case"openai":return"https://api.openai.com/v1";case"openrouter":return"https://openrouter.ai/api/v1";case"deepseek":return"https://api.deepseek.com";case"zai":return"https://open.bigmodel.cn/api/paas/v4";case"moonshot":return"https://api.moonshot.cn/v1";default:return"https://api.openai.com/v1"}}getHeaders(){return this.config.baseUrl&&this.config.proxyKey?{"Content-Type":"application/json",Authorization:`Bearer ${this.config.proxyKey}`}:this.config.provider==="ollama"?{"Content-Type":"application/json"}:me(this.config.provider,this.config.apiKey,{contentType:"application/json"})}isDirectBrowserOpenAIRequest(){if(typeof window>"u"||this.config.provider!=="openai")return!1;try{return new URL(this.baseUrl).hostname==="api.openai.com"}catch{return this.baseUrl.includes("api.openai.com")}}assertBrowserSupported(){if(this.isDirectBrowserOpenAIRequest())throw new Error("Direct OpenAI requests from the browser are blocked by CORS. Use OpenRouter, or configure a custom base URL that points to your own proxy or relay.")}formatMessages(e){return e.map(t=>({role:t.role,content:t.content}))}async generate(e,t){this.assertBrowserSupported();const r=this.mergeOptions(t),n=await this.performFetch(`${this.baseUrl}/chat/completions`,{...this.getFetchOptions(t?.signal),method:"POST",headers:this.getHeaders(),body:JSON.stringify({model:this.config.model,messages:this.formatMessages(e),temperature:r.temperature,max_tokens:r.maxTokens,top_p:r.topP,frequency_penalty:r.frequencyPenalty,presence_penalty:r.presencePenalty})});if(!n.ok){const c=await this.parseError(n);throw new Error(c)}const s=await n.json(),i=s.choices[0];if(!i?.message)throw new Error("No content in response");return{content:i.message.content,finishReason:i.finish_reason,usage:s.usage?{promptTokens:s.usage.prompt_tokens,completionTokens:s.usage.completion_tokens,totalTokens:s.usage.total_tokens}:void 0}}async*generateStream(e,t){this.assertBrowserSupported();const r=this.mergeOptions(t),n=await this.performFetch(`${this.baseUrl}/chat/completions`,{...this.getFetchOptions(t?.signal),method:"POST",headers:me(this.config.provider,this.config.apiKey,{contentType:"application/json",accept:"text/event-stream"}),body:JSON.stringify({model:this.config.model,messages:this.formatMessages(e),temperature:r.temperature,max_tokens:r.maxTokens,top_p:r.topP,frequency_penalty:r.frequencyPenalty,presence_penalty:r.presencePenalty,stream:!0})});if(!n.ok){const l=await this.parseError(n);throw new Error(l)}const s=n.body?.getReader();if(!s)throw new Error("No response body");const i=new TextDecoder;let c="";try{for(;;){const{done:l,value:u}=await s.read();if(l)break;c+=i.decode(u,{stream:!0});const d=c.split(`
`);c=d.pop()||"";for(const p of d){const h=p.trim();if(!(!h||h==="data: [DONE]")&&h.startsWith("data: "))try{const g=h.slice(6),x=JSON.parse(g).choices[0];if(!x)continue;const R=x.delta?.content;R&&(yield{content:R,done:!1}),x.finish_reason&&(yield{content:"",done:!0,finishReason:x.finish_reason})}catch{}}}}finally{s.releaseLock()}}async testConnection(){try{this.assertBrowserSupported()}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unsupported browser provider configuration"}}const e=performance.now();try{const t=await this.performFetch(`${this.baseUrl}/models`,{...this.getFetchOptions(),method:"GET",headers:this.getHeaders()}),r=performance.now()-e;if(!t.ok)return{success:!1,latency_ms:r,error:await this.parseError(t)};try{return(await t.json()).data,{success:!0,latency_ms:r,model_info:{name:this.config.model,context_length:void 0}}}catch{return{success:!0,latency_ms:r}}}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}async parseError(e){try{return(await e.json()).error?.message||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}const Bn={system:"user",user:"user",assistant:"model"};class Hn extends yt{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||"https://generativelanguage.googleapis.com/v1beta"}getHeaders(){return me("google",this.config.apiKey,{contentType:"application/json"})}formatMessages(e){const t=[];let r="";for(const n of e)n.role==="system"?r=n.content:t.push({role:Bn[n.role]||n.role,parts:[{text:n.content}]});return r&&t.length>0?t[0].parts[0].text=r+`

`+t[0].parts[0].text:r&&t.unshift({role:"user",parts:[{text:r}]}),t}async callEndpoint(e,t,r){const n=`${this.baseUrl}${e}`;return this.performFetch(n,{...this.getFetchOptions(r),method:"POST",headers:this.getHeaders(),body:JSON.stringify(t)})}async generate(e,t){const r=this.mergeOptions(t),n=`/models/${this.config.model}:generateContent`,s={contents:this.formatMessages(e),generationConfig:{temperature:r.temperature,maxOutputTokens:r.maxTokens,topP:r.topP}},i=await this.callEndpoint(n,s,t?.signal);if(!i.ok){const u=await this.parseError(i);throw new Error(u)}const c=await i.json(),l=c.candidates[0];if(!l?.content?.parts?.[0]?.text)throw new Error("No content in response");return{content:l.content.parts[0].text,finishReason:l.finishReason,usage:c.usageMetadata?{promptTokens:c.usageMetadata.promptTokenCount||0,completionTokens:c.usageMetadata.candidatesTokenCount||0,totalTokens:c.usageMetadata.totalTokenCount||0}:void 0}}async*generateStream(e,t){const r=this.mergeOptions(t),n=`/models/${this.config.model}:streamGenerateContent`,s={contents:this.formatMessages(e),generationConfig:{temperature:r.temperature,maxOutputTokens:r.maxTokens,topP:r.topP}},i=await this.callEndpoint(n,s,t?.signal);if(!i.ok){const d=await this.parseError(i);throw new Error(d)}const c=i.body?.getReader();if(!c)throw new Error("No response body");const l=new TextDecoder;let u="";try{for(;;){const{done:d,value:p}=await c.read();if(d)break;u+=l.decode(p,{stream:!0});const h=u.split(`
`);u=h.pop()||"";for(const g of h){const y=g.trim();if(!(!y||!y.startsWith("data: ")))try{const x=y.slice(6),A=JSON.parse(x).candidates[0];if(!A)continue;const H=A.content?.parts?.[0]?.text;H&&(yield{content:H,done:!1}),A.finishReason&&(yield{content:"",done:!0,finishReason:A.finishReason})}catch{}}}}finally{c.releaseLock()}}async testConnection(){const e=performance.now();try{const t=`/models/${this.config.model}:generateContent`,r={contents:[{role:"user",parts:[{text:"test"}]}],generationConfig:{maxOutputTokens:1}},n=await this.callEndpoint(t,r),s=performance.now()-e;return n.ok?{success:!0,latency_ms:s,model_info:{name:this.config.model}}:{success:!1,latency_ms:s,error:await this.parseError(n)}}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}async parseError(e){try{const t=await e.json();return t.error?.message||t.error?.status||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}class Gn extends yt{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||"https://api.anthropic.com"}getHeaders(){return me("anthropic",this.config.apiKey,{contentType:"application/json"})}formatMessages(e){const t=[];for(const r of e)r.role!=="system"&&t.push({role:r.role==="assistant"?"assistant":"user",content:r.content});return t}getSystemPrompt(e){return e.find(r=>r.role==="system")?.content}async generate(e,t){const r=this.mergeOptions(t),n=this.getSystemPrompt(e),s=this.formatMessages(e),i={model:this.config.model,messages:s,max_tokens:r.maxTokens||4096,temperature:r.temperature};n&&(i.system=n),r.topP!==void 0&&(i.top_p=r.topP);const c=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(t?.signal),method:"POST",headers:this.getHeaders(),body:JSON.stringify(i)});if(!c.ok){const d=await this.parseError(c);throw new Error(d)}const l=await c.json(),u=l.content.find(d=>d.type==="text");if(!u)throw new Error("No text content in response");return{content:u.text,finishReason:l.stop_reason||void 0,usage:{promptTokens:l.usage.input_tokens,completionTokens:l.usage.output_tokens,totalTokens:l.usage.input_tokens+l.usage.output_tokens}}}async*generateStream(e,t){const r=this.mergeOptions(t),n=this.getSystemPrompt(e),s=this.formatMessages(e),i={model:this.config.model,messages:s,max_tokens:r.maxTokens||4096,temperature:r.temperature,stream:!0};n&&(i.system=n),r.topP!==void 0&&(i.top_p=r.topP);const c=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(t?.signal),method:"POST",headers:me("anthropic",this.config.apiKey,{contentType:"application/json",accept:"text/event-stream"}),body:JSON.stringify(i)});if(!c.ok){const p=await this.parseError(c);throw new Error(p)}const l=c.body?.getReader();if(!l)throw new Error("No response body");const u=new TextDecoder;let d="";try{for(;;){const{done:p,value:h}=await l.read();if(p)break;d+=u.decode(h,{stream:!0});const g=d.split(`
`);d=g.pop()||"";for(const y of g){const x=y.trim();if(!(!x||!x.startsWith("data: ")))try{const R=x.slice(6),A=JSON.parse(R);A.type==="content_block_delta"&&A.delta?.text&&(yield{content:A.delta.text,done:!1}),A.type==="message_delta"&&A.delta?.stop_reason&&(yield{content:"",done:!0,finishReason:A.delta.stop_reason}),A.type==="message_stop"&&(yield{content:"",done:!0})}catch{}}}}finally{l.releaseLock()}}async testConnection(){const e=performance.now();try{const t=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(),method:"POST",headers:this.getHeaders(),body:JSON.stringify({model:this.config.model,messages:[{role:"user",content:"Hi"}],max_tokens:1})}),r=performance.now()-e;return t.ok?{success:!0,latency_ms:r,model_info:{name:this.config.model}}:{success:!1,latency_ms:r,error:await this.parseError(t)}}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}async parseError(e){try{return(await e.json()).error?.message||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}const ge="eidolon.web.config",Ie=["bpui.web.config"],ce="eidolon.web.apiKeys",ye=["bpui.web.apiKeys"],be="eidolon.web.apiKeys.persist",Oe=["bpui.web.apiKeys.persist"],sr="eidolon:config-changed";let $={};const Wn={generator:"blueprints/system/generator.md",rpbotgenerator:"blueprints/system/generator.md",seed_generator:"blueprints/system/seed_generator.md",offspring_generator:"blueprints/system/offspring_generator.md",intro_scene:"blueprints/system/intro_scene.md"},Kn=[/^window\.fetch:/i,/cannot convert value in record<bytestring/i,/^bearer\s+window\.fetch:/i];function He(a){return a.replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[\u200B-\u200D\uFEFF]/g,"").trim().replace(/^['"]+|['"]+$/g,"")}function or(a){return!a||/[^\x20-\x7E]/.test(a)||/\r|\n/.test(a)?!0:Kn.some(e=>e.test(a))}function Qe(a){for(const e of a){const t=localStorage.getItem(e);if(t!==null)return{value:t,sourceKey:e}}return null}function zn(a,e){for(const t of e)t!==a&&localStorage.removeItem(t)}function le(a,e,t){localStorage.setItem(a,t),zn(a,e)}function je(a){for(const e of a)localStorage.removeItem(e)}function we(){typeof window>"u"||window.dispatchEvent(new Event(sr))}function ae(a){return Object.fromEntries(Object.entries(a).map(([e,t])=>[e,typeof t=="string"?He(t):t]).filter(([,e])=>typeof e=="string"&&!or(e)).filter(([,e])=>typeof e=="string"&&e.length>0))}function jt(a){return a&&Object.fromEntries(Object.entries(a).map(([e,t])=>typeof t!="string"||t.length===0?[e,t]:[e,Wn[t]??t]))}let de=!1;function Ze(){return{first_run_completed:!1,show_inline_tips:!0,completed_guides:[],dismissed_tips:[],completed_tours:[]}}class qn{config;options;constructor(e={}){this.options={persistApiKeys:!1,...e},de=this.loadPersistPreference(this.options.persistApiKeys||!1),this.config=this.loadConfig(),this.loadPersistedApiKeys()}mergeConfig(e){const t=this.getDefaultConfig();return{...t,...e,batch:{...t.batch,...e.batch??{}},help:{...t.help,...e.help??{}},feature_blueprints:{...t.feature_blueprints,...jt(e.feature_blueprints)??{}}}}loadPersistPreference(e){try{const t=Qe([be,...Oe]);if(t?.sourceKey!==be&&le(be,Oe,t.value),t?.value==="true")return!0;if(t?.value==="false")return!1}catch{}return e}savePersistPreference(e){try{le(be,Oe,String(e))}catch(t){console.warn("Failed to save API key persistence preference:",t)}}loadConfig(){try{const e=Qe([ge,...Ie]);if(e){const t=this.mergeConfig(JSON.parse(e.value));return e.sourceKey!==ge&&le(ge,Ie,JSON.stringify(t)),t}}catch{}return this.getDefaultConfig()}saveConfig(){try{le(ge,Ie,JSON.stringify(this.config)),we()}catch(e){console.warn("Failed to save config to localStorage:",e)}}getDefaultConfig(){return{engine:"openai_compatible",engine_mode:"auto",model:"openrouter/openai/gpt-4o-mini",temperature:.7,max_tokens:4096,api_keys:{},batch:{max_concurrent:3,rate_limit_delay:1},help:Ze(),feature_blueprints:{orchestration:"blueprints/system/generator.md",seed_generation:"blueprints/system/seed_generator.md",offspring_generation:"blueprints/system/offspring_generator.md",intro_scene_generation:"blueprints/system/intro_scene.md"}}}getConfig(){return this.mergeConfig(this.config)}getHelpState(){return{...this.config.help??Ze(),completed_guides:[...this.config.help?.completed_guides??[]],dismissed_tips:[...this.config.help?.dismissed_tips??[]],completed_tours:[...this.config.help?.completed_tours??[]]}}getApiKeys(){return ae($)}getApiKey(e){const t=$[e];return typeof t=="string"?He(t):void 0}setApiKey(e,t){const r=He(t);r?$[e]=r:delete $[e],this.persistApiKeysIfNeeded(),we()}setApiKeys(e){$={...ae($),...ae(e)},this.persistApiKeysIfNeeded(),we()}clearApiKey(e){delete $[e],this.persistApiKeysIfNeeded(),we()}clearAllApiKeys(){$={},this.persistApiKeysIfNeeded(),we()}loadPersistedApiKeys(){if(de)try{const e=Qe([ce,...ye]);if(e){const t=ae(JSON.parse(e.value));$=t,e.sourceKey!==ce&&le(ce,ye,JSON.stringify(t))}}catch{}}persistApiKeysIfNeeded(){if(de)try{le(ce,ye,JSON.stringify(ae($)))}catch(e){console.warn("Failed to persist API keys:",e)}}setPersistApiKeys(e){if(de=e,this.savePersistPreference(e),e)this.persistApiKeysIfNeeded();else try{je([ce,...ye])}catch{}}isPersistingApiKeys(){return de}exportApiKeys(){return JSON.stringify(ae($),null,2)}importApiKeys(e){try{const t=JSON.parse(e);$=ae(t),this.persistApiKeysIfNeeded()}catch{throw new Error("Invalid API keys JSON")}}updateConfig(e){this.config=this.mergeConfig({...this.config,...e,batch:{...this.config.batch,...e.batch??{}},help:{...this.getHelpState(),...e.help??{}},feature_blueprints:{...this.config.feature_blueprints??{},...jt(e.feature_blueprints)??{}}}),this.saveConfig()}updateHelpState(e){this.updateConfig({help:{...this.getHelpState(),...e}})}resetHelpState(){this.updateConfig({help:Ze()})}resetConfig(){this.config=this.getDefaultConfig(),this.saveConfig()}exportConfig(){const e={config:this.config,version:"1.0",exportedAt:new Date().toISOString()};return JSON.stringify(e,null,2)}importConfig(e){try{const t=JSON.parse(e);t.config&&(this.config=this.mergeConfig(t.config),this.saveConfig())}catch{throw new Error("Invalid configuration JSON")}}clearAll(){this.config=this.getDefaultConfig(),$={},de=!1;try{je([ge,...Ie]),je([ce,...ye]),je([be,...Oe])}catch{}}}const Ge=sr,P=new qn;function Vn(a,e,t){if(a==="ollama")return;if(typeof e=="string"&&e.trim().length>0)return e;const r=t?.[a];return typeof r=="string"&&r.trim().length>0?r:Object.values(t??{}).find(n=>typeof n=="string"&&n.trim().length>0)}function he(a){const{model:e,apiKey:t,apiKeys:r,provider:n,baseUrl:s,proxyKey:i,temperature:c,maxTokens:l}=a,u=n??ft(e),d={provider:u,model:e,apiKey:Vn(u,t,r),baseUrl:s,proxyKey:i,temperature:c,maxTokens:l};switch(u){case"google":return new Hn(d);case"anthropic":return new Gn(d);case"openai":case"openrouter":case"deepseek":case"zai":case"moonshot":case"ollama":default:return new $n(d)}}function me(a,e,t={}){const r={};t.contentType&&(r["Content-Type"]=t.contentType),t.accept&&(r.Accept=t.accept);const n=typeof e=="string"?He(e):void 0;if(n){if(or(n))throw new Error("Configured API key is invalid or corrupted. Re-enter it in Settings and try again.");switch(a){case"anthropic":r["x-api-key"]=n,r["anthropic-version"]="2023-06-01";break;case"google":r["x-goog-api-key"]=n;break;default:r.Authorization=`Bearer ${n}`;break}}return a==="openrouter"&&(r["HTTP-Referer"]=typeof window<"u"?window.location.origin:"https://eidolon-simulacra.app",r["X-OpenRouter-Title"]="Eidolon Simulacra"),r}function Yn(a){switch(a){case"openai":return"https://api.openai.com/v1";case"google":return"https://generativelanguage.googleapis.com/v1beta";case"openrouter":return"https://openrouter.ai/api/v1";case"anthropic":return"https://api.anthropic.com";case"deepseek":return"https://api.deepseek.com";case"zai":return"https://open.bigmodel.cn/api/paas/v4";case"moonshot":return"https://api.moonshot.cn/v1";case"ollama":return"http://localhost:11434/v1";default:return"https://api.openai.com/v1"}}const Dt={openai:["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo","o1-preview"],google:["gemini-2.0-flash-exp","gemini-2.0-flash-thinking-exp","gemini-1.5-pro","gemini-1.5-flash"],openrouter:["anthropic/claude-3.5-sonnet","anthropic/claude-3.5-haiku","google/gemini-pro-1.5","openai/gpt-4o-mini"],anthropic:["claude-3.5-sonnet","claude-3.5-haiku","claude-3-opus"],deepseek:["deepseek-chat","deepseek-coder"],zai:["glm-4","glm-4-flash"],moonshot:["moonshot-v1-8k","moonshot-v1-32k","moonshot-v1-128k"],ollama:["llama3.2","llama3.1","mistral","codellama","qwen2.5","phi3","gemma2"]},Jn=`# Blueprints\r
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
`,Xn=`---\r
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
`,Qn=`---\r
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
`,Zn=`---\r
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
`,ea=`---\r
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
`,ta=`---\r
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
`,ra=`---\r
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
`,na=`---\r
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
`,aa=`---\r
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
[((person))],\r
[((clothes))],\r
[((location))],\r
[((action))],\r
[((anchor))]\r
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
`,sa=`---\r
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
`,oa=`---\r
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
`,ia=`---\r
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
`,ca=`---\r
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
`,la=`---\r
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
`,da=`---\r
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
`,ua=`---\r
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
`,pa=`---\r
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
`,ha=`---\r
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
`,ma={generator:"system/generator.md",rpbotgenerator:"system/generator.md",seed_generator:"system/seed_generator.md",offspring_generator:"system/offspring_generator.md",system_prompt:"system/system_prompt.md",post_history:"system/post_history.md",character_sheet:"system/character_sheet.md",intro_scene:"system/intro_scene.md",intro_page:"system/intro_page.md",a1111:"system/a1111.md"};function fa(a){const e=a.replace(/^\/+/,"").replace(/^blueprints\//,"");return e.endsWith(".md")?e:ma[e]??`${e}.md`}const ir="/blueprints";async function cr(a,e=ir){const t=fa(a),r=`${e}/${t}`;try{const n=await fetch(r);if(!n.ok)throw new Error(`Blueprint not found: ${t}`);return await n.text()}catch(n){throw new Error(`Failed to load blueprint '${a}': ${n instanceof Error?n.message:"Unknown error"}`)}}const ga={orchestration:"blueprints/system/generator.md",seed_generation:"blueprints/system/seed_generator.md",offspring_generation:"blueprints/system/offspring_generator.md",intro_scene_generation:"blueprints/system/intro_scene.md"};async function bt(a,e,t=ir){const n=P.getConfig().feature_blueprints?.[a],s=ga[a],i=e||n||s;if(!i)throw new Error(`No blueprint configured for feature: ${a}`);return cr(i,t)}function wt(a){const e=a.match(/^---\n([\s\S]*?)\n---/);if(!e){const s=a.match(/^#\s+(.+)$/m),i=a.split(`
`).map(c=>c.trim()).find(c=>c.length>0&&!c.startsWith("#")&&!c.startsWith("```"));return{name:s?.[1]?.trim()||"Untitled Blueprint",description:i||"No description",invokable:!1,version:"1.0"}}const t=e[1],r={},n=t.split(`
`);for(const s of n){const i=s.match(/^(\w+):\s*(.+)$/);if(i){const[,c,l]=i;l.toLowerCase()==="true"?r[c]=!0:l.toLowerCase()==="false"?r[c]=!1:r[c]=l.replace(/^['"]|['"]$/g,"")}}return{name:String(r.name||"unknown"),description:String(r.description||""),invokable:!!r.invokable,version:String(r.version||"1.0"),feature_category:r.feature_category}}function lr(a){return a.assets.map(e=>({name:e.name,required:e.required,dependsOn:e.depends_on,description:e.description,blueprintFile:e.blueprint_file}))}function dr(a){const e=new Set,t=new Set,r=[],n=s=>{if(e.has(s))return;if(t.has(s))throw new Error(`Circular dependency detected involving ${s}`);t.add(s);const i=a.find(c=>c.name===s);if(i)for(const c of i.dependsOn)n(c);t.delete(s),e.add(s),r.push(s)};for(const s of a)n(s.name);return r}const it="eidolon.web.templates.custom",ct=["bpui.web.templates.custom"],ur="eidolon.web.blueprints.overrides",pr=["bpui.web.blueprints.overrides"],hr=Object.assign({"../../../../../blueprints/README.md":Jn,"../../../../../blueprints/examples/a1111_sdxl_comfyui.md":Xn,"../../../../../blueprints/examples/generic_character_sheet.md":Qn,"../../../../../blueprints/examples/generic_initial_message.md":Zn,"../../../../../blueprints/examples/generic_intro_page.md":ea,"../../../../../blueprints/examples/generic_intro_scene.md":ta,"../../../../../blueprints/examples/generic_post_history.md":ra,"../../../../../blueprints/examples/generic_system_prompt.md":na,"../../../../../blueprints/system/a1111.md":aa,"../../../../../blueprints/system/a1111_old.md":sa,"../../../../../blueprints/system/character_sheet.md":oa,"../../../../../blueprints/system/generator.md":ia,"../../../../../blueprints/system/intro_page.md":ca,"../../../../../blueprints/system/intro_scene.md":la,"../../../../../blueprints/system/offspring_generator.md":da,"../../../../../blueprints/system/post_history.md":ua,"../../../../../blueprints/system/seed_generator.md":pa,"../../../../../blueprints/system/system_prompt.md":ha});function ya(a){return a.trim().toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").replace(/_+/g,"_").replace(/^_+|_+$/g,"")}function Ve(a){return a.blueprint_file??`${a.name}.md`}function mr(a,e){if(typeof window>"u")return e;const t=Array.isArray(a)?[...a]:[a],[r,...n]=t;try{for(const s of t){const i=window.localStorage.getItem(s);if(!i)continue;const c=JSON.parse(i);return s!==r&&(window.localStorage.setItem(r,JSON.stringify(c)),n.forEach(l=>window.localStorage.removeItem(l))),c}}catch{return e}return e}function xt(a,e,t){typeof window>"u"||(window.localStorage.setItem(a,JSON.stringify(t)),e.forEach(r=>window.localStorage.removeItem(r)))}function ba(){const a=new Map;return Object.entries(hr).forEach(([e,t])=>{const r=e.replace(/^.*\/blueprints\//,"blueprints/");if(r.split("/").pop()?.toLowerCase()==="readme.md")return;const s=wt(t);let i="core";r.includes("/system/")?i="system":r.includes("/templates/")?i="template":r.includes("/examples/")&&(i="example"),a.set(r,{name:s.name,description:s.description,invokable:s.invokable,version:s.version,content:t,path:r,category:i,feature_category:s.feature_category})}),a}function ee(){return mr([ur,...pr],{})}function xe(a){xt(ur,pr,a)}function fr(a){return a.startsWith("blueprints/custom/")}function wa(a,e){const t=ya(a)||"custom_blueprint",r=Z();let n=`blueprints/custom/${t}.md`,s=2;for(;n!==e&&r.has(n);)n=`blueprints/custom/${t}_${s}.md`,s+=1;return n}function Z(){const a=ba(),e=ee();return Object.entries(e).forEach(([t,r])=>{const n=wt(r),s=a.get(t);a.set(t,{name:n.name,description:n.description,invokable:n.invokable,version:n.version,content:r,path:t,category:s?.category??"core",feature_category:n.feature_category})}),a}function Ue(a){const e=`../../../../../${a}`;return hr[e]??null}function xa(a){return a in ee()}function We(a){if(!a)return"";const e=a.replace(/^\.?\//,""),t=e.replace(/\.(txt|md)$/i,"");return[...Z().values()].find(n=>n.path===e||n.path.endsWith(`/${e}`)||n.path.endsWith(`/${t}.md`))?.content??""}function va(a,e){const t=Ve(e),r=t.split("/").pop()??t;return a[t]??a[r]??a[e.name]}function vt(a){const e={};return a.template.assets.forEach(t=>{const r=Ve(t),n=va(a.blueprint_contents,t);if(!n?.trim())return;const s=We(r);s&&s===n||(e[r]=n)}),Object.entries(a.blueprint_contents).forEach(([t,r])=>{if(!r?.trim()||e[t])return;const n=We(t);n&&n===r||(e[t]=r)}),{template:a.template,blueprint_contents:e}}function Rt(a){const e=vt(a),t={...e.blueprint_contents};return e.template.assets.forEach(r=>{const n=Ve(r);if(!t[n]){const s=We(n);s&&(t[n]=s)}}),{template:e.template,blueprint_contents:t}}function gr(){return{template:{...gt,is_default:!0},blueprint_contents:{}}}function ie(){const a=mr([it,...ct],[]),e=a.map(vt);return JSON.stringify(a)!==JSON.stringify(e)&&xt(it,ct,e),e}function De(a){xt(it,ct,a.map(vt))}function _t(){return[Rt(gr()),...ie().map(Rt)]}function _a(a){if(!a)return;const e=gr();return e.template.name===a?e:ie().find(t=>t.template.name===a)}function Y(a){if(a)return _t().find(e=>e.template.name===a)}function Se(a){return Y(a)?.template}function yr(a,e){const t=Y(a);if(!t)return;const r=t.template.assets.find(s=>s.name===e);if(!r)return;const n=Ve(r);return t.blueprint_contents[n]||We(n)||void 0}function Ke(a,e){const t=Se(e),r=t?ar(t).map(s=>s.name):["character_sheet"];return Pn(a,r)??void 0}const ka="EidolonSimulacraDB",br=["CharacterGeneratorDB"],Sa={drafts:"++id, reviewId, [metadata.character_name], createdAt, updatedAt, metadata.favorite, metadata.mode, metadata.genre",assets:"++id, draftId, assetName, createdAt",tags:"++id, tag, draftId"};function q(a){return typeof a=="object"&&a!==null}function lt(){return`imported-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}function Ta(a){if(!(a!=="SFW"&&a!=="NSFW"&&a!=="Platform-Safe"&&a!=="Auto"))return a}function Ea(a){let e=lt();for(;a.has(e);)e=lt();return e}function wr(a,e){const t=q(a)?a:{},r=typeof t.review_id=="string"?t.review_id:typeof t.reviewId=="string"?t.reviewId:"",n=r.trim().length>0?r:lt(),s=typeof t.seed=="string"?t.seed:"",i=s.trim().length>0?s:e,c={review_id:n,seed:i,favorite:!!t.favorite};c.mode=Ta(t.mode),typeof t.model=="string"&&(c.model=t.model),typeof t.created=="string"?c.created=t.created:typeof t.createdAt=="string"&&(c.created=t.createdAt),typeof t.modified=="string"?c.modified=t.modified:typeof t.updatedAt=="string"&&(c.modified=t.updatedAt),Array.isArray(t.tags)&&(c.tags=t.tags.filter(u=>typeof u=="string")),typeof t.genre=="string"&&(c.genre=t.genre),typeof t.notes=="string"&&(c.notes=t.notes),typeof t.character_name=="string"?c.character_name=t.character_name:typeof t.characterName=="string"&&(c.character_name=t.characterName),typeof t.template_name=="string"?c.template_name=t.template_name:typeof t.templateName=="string"&&(c.template_name=t.templateName);const l=Array.isArray(t.parent_drafts)?t.parent_drafts:Array.isArray(t.parentDraftIds)?t.parentDraftIds:null;return l&&(c.parent_drafts=l.filter(u=>typeof u=="string")),typeof t.offspring_type=="string"?c.offspring_type=t.offspring_type:typeof t.offspringType=="string"&&(c.offspring_type=t.offspringType),c}function Re(a,e="Imported draft"){if(!q(a)||!q(a.assets))return null;const t={};for(const[s,i]of Object.entries(a.assets))typeof i=="string"&&(t[s]=i);if(Object.keys(t).length===0)return null;const r=wr(q(a.metadata)?a.metadata:a,e),n=typeof a.path=="string"&&a.path.trim().length>0?a.path:typeof a.reviewId=="string"&&a.reviewId.trim().length>0?a.reviewId:r.review_id;return{metadata:r,assets:t,path:n}}function Aa(a){if(Array.isArray(a))return a.map(t=>Re(t)).filter(t=>t!==null);if(!q(a))return[];if(Array.isArray(a.drafts))return a.drafts.map(t=>Re(t)).filter(t=>t!==null);if(q(a.draft)){const t=Re(a.draft);return t?[t]:[]}const e=Re(a);return e?[e]:[]}function Ca(a){return Array.isArray(a)?!0:q(a)?Array.isArray(a.drafts)||q(a.draft)||q(a.assets)||q(a.metadata)||typeof a.reviewId=="string"||typeof a.review_id=="string":!1}function Na(a){return a.trim().toLowerCase().replace(/\s+/g,"_")}function Pa(a){const t=a.match(/^#\s+(.+)$/m)?.[1]?.trim()||"Imported draft",r=/^##\s+(.+)$/gm,n=[];let s;for(;(s=r.exec(a))!==null;)n.push({title:s[1].trim(),start:s.index,bodyStart:r.lastIndex});if(n.length===0)return[];const i={};let c;for(let u=0;u<n.length;u+=1){const d=n[u],p=n[u+1],g=a.slice(d.bodyStart,p?p.start:a.length).replace(/^\n+/,"").trimEnd().replace(/^\\##/gm,"##");if(!g)continue;if(d.title.trim().toLowerCase()==="metadata"){try{c=JSON.parse(g)}catch{}continue}const y=Na(d.title);i[y]=g}if(Object.keys(i).length===0)return[];const l=wr(c,t);return[{path:l.review_id,metadata:l,assets:i}]}class xr extends Ae{drafts;assets;tags;constructor(e){super(e),this.version(1).stores(Sa)}}const b=new xr(ka);let Le=null;async function Ia(){if(!(typeof indexedDB>"u"||await b.drafts.count()>0))for(const e of br){if(!await Ae.exists(e))continue;const t=new xr(e);try{await t.open();const r=await t.drafts.toArray();if(r.length===0)continue;const n=await t.assets.toArray(),s=await t.tags.toArray();await b.transaction("rw",b.drafts,b.assets,b.tags,async()=>{await b.drafts.bulkPut(r),n.length>0&&await b.assets.bulkPut(n),s.length>0&&await b.tags.bulkPut(s)}),t.close(),await Ae.delete(e);return}catch(r){console.warn(`Failed to migrate legacy draft database ${e}:`,r)}finally{t.close()}}}class j{static async ensureReady(){Le||(Le=Ia()),await Le}static async saveDraft(e){await this.ensureReady();const t=Date.now(),r=Ke(e.assets,e.metadata.template_name),n={...e.metadata,character_name:e.metadata.character_name||r,created:e.metadata.created||new Date(t).toISOString(),modified:e.metadata.modified||new Date(t).toISOString()},s={reviewId:e.metadata.review_id,metadata:n,assets:e.assets,createdAt:n.created?new Date(n.created).getTime():t,updatedAt:n.modified?new Date(n.modified).getTime():t},i=await b.drafts.where("reviewId").equals(e.metadata.review_id).first();i&&(s.id=i.id),await b.transaction("rw",b.drafts,b.assets,b.tags,async()=>{await b.drafts.put(s),await b.assets.where("draftId").equals(e.metadata.review_id).delete(),await b.tags.where("draftId").equals(e.metadata.review_id).delete();const c=Object.entries(e.assets).map(([l,u])=>({draftId:e.metadata.review_id,assetName:l,content:u,createdAt:t}));if(await b.assets.bulkAdd(c),e.metadata.tags){const l=e.metadata.tags.map(u=>({tag:u,draftId:e.metadata.review_id,createdAt:t}));await b.tags.bulkAdd(l)}})}static async getDraft(e){await this.ensureReady();const t=await b.drafts.where("reviewId").equals(e).first();return t?{path:t.reviewId,metadata:t.metadata,assets:t.assets}:null}static async getAssetActivity(e){return await this.ensureReady(),(await b.assets.where("draftId").equals(e).toArray()).sort((r,n)=>n.createdAt-r.createdAt)}static async getAllDrafts(){return await this.ensureReady(),(await b.drafts.toArray()).map(t=>({path:t.reviewId,metadata:t.metadata,assets:t.assets}))}static async getAllMetadata(){return await this.ensureReady(),(await b.drafts.toArray()).map(t=>t.metadata)}static async deleteDraft(e){await this.ensureReady(),await b.transaction("rw",b.drafts,b.assets,b.tags,async()=>{await b.drafts.where("reviewId").equals(e).delete(),await b.assets.where("draftId").equals(e).delete(),await b.tags.where("draftId").equals(e).delete()})}static async updateMetadata(e,t){await this.ensureReady();const r=await b.drafts.where("reviewId").equals(e).first();if(!r)throw new Error(`Draft ${e} not found`);const n=Date.now();if(r.metadata={...r.metadata,...t,modified:new Date(n).toISOString()},r.updatedAt=n,await b.drafts.put(r),t.tags!==void 0&&(await b.tags.where("draftId").equals(e).delete(),t.tags)){const s=t.tags.map(i=>({tag:i,draftId:e,createdAt:n}));await b.tags.bulkAdd(s)}}static async updateAsset(e,t,r){await this.ensureReady();const n=await b.drafts.where("reviewId").equals(e).first();if(!n)throw new Error(`Draft ${e} not found`);n.assets[t]=r,n.updatedAt=Date.now(),n.metadata={...n.metadata,modified:new Date(n.updatedAt).toISOString(),character_name:Ke(n.assets,n.metadata.template_name)||n.metadata.character_name},await b.drafts.put(n),await b.assets.where("draftId").equals(e).and(i=>i.assetName===t).modify({content:r,createdAt:n.updatedAt})===0&&await b.assets.add({draftId:e,assetName:t,content:r,createdAt:n.updatedAt})}static async searchDrafts(e){await this.ensureReady();const t=e.toLowerCase();return(await b.drafts.filter(n=>{const s=n.metadata.character_name?.toLowerCase()||"",i=n.metadata.seed?.toLowerCase()||"",c=n.metadata.notes?.toLowerCase()||"",l=n.metadata.genre?.toLowerCase()||"";return s.includes(t)||i.includes(t)||c.includes(t)||l.includes(t)}).toArray()).map(n=>n.metadata)}static async getDraftsByTag(e){await this.ensureReady();const t=await b.tags.where("tag").equals(e).toArray(),r=[...new Set(t.map(s=>s.draftId))];return(await b.drafts.where("reviewId").anyOf(r).toArray()).map(s=>s.metadata)}static async getAllTags(){await this.ensureReady();const e=await b.tags.toArray();return[...new Set(e.map(r=>r.tag))].sort()}static async getFavorites(){return await this.ensureReady(),(await b.drafts.filter(t=>t.metadata.favorite===!0).toArray()).map(t=>t.metadata)}static async getDraftsByMode(e){return await this.ensureReady(),(await b.drafts.where("metadata.mode").equals(e).toArray()).map(r=>r.metadata)}static async getDraftsByGenre(e){return await this.ensureReady(),(await b.drafts.where("metadata.genre").equals(e).toArray()).map(r=>r.metadata)}static async getStats(){await this.ensureReady();const e=await b.drafts.toArray(),t={total:e.length,favorites:e.filter(r=>r.metadata.favorite).length,byMode:{},byGenre:{}};for(const r of e){const n=r.metadata.mode||"unknown",s=r.metadata.genre||"unknown";t.byMode[n]=(t.byMode[n]||0)+1,t.byGenre[s]=(t.byGenre[s]||0)+1}return t}static async exportAll(){await this.ensureReady();const e=await this.getAllDrafts(),t={version:"1.0",exportedAt:new Date().toISOString(),drafts:e};return JSON.stringify(t,null,2)}static async import(e,t={}){await this.ensureReady();const r=t.conflictStrategy??"remap",n=e.trim();if(!n)throw new Error("Import file is empty");let s=[],i=!1;try{const h=JSON.parse(n);i=Ca(h),s=Aa(h)}catch{s=Pa(e)}if(s.length===0){if(i)return{imported:0,remapped:0};throw new Error("Invalid draft import format. Supported: exported drafts JSON and combined markdown draft files.")}const c=await this.getAllMetadata(),l=new Set(c.map(h=>h.review_id)),u=new Map;let d=0;const p=s.map(h=>{const g=h.metadata.review_id;let y=g;return r==="remap"&&l.has(y)&&(y=Ea(l)),l.add(y),y!==g&&(d+=1,u.set(g,y)),{...h,path:y,metadata:{...h.metadata,review_id:y}}});for(const h of p){const g=h.metadata.parent_drafts?.map(y=>u.get(y)||y);await this.saveDraft({...h,metadata:{...h.metadata,parent_drafts:g}})}return{imported:p.length,remapped:d}}static async clearAll(){await b.transaction("rw",b.drafts,b.assets,b.tags,async()=>{await b.drafts.clear(),await b.assets.clear(),await b.tags.clear()});for(const e of br)await Ae.exists(e)&&await Ae.delete(e);Le=null}}const $o=Object.freeze(Object.defineProperty({__proto__:null,DraftStorage:j,db:b},Symbol.toStringTag,{value:"Module"})),Lt="server-config",et="server-access-token",dt="auth-state-changed";function ue(a){return typeof a=="object"&&a!==null}function Oa(a){return a==="SFW"||a==="NSFW"||a==="Platform-Safe"||a==="Auto"?a:void 0}function J(a){if(typeof a!="string")return;const e=a.trim();return e.length>0?e:void 0}function Mt(a){const e=Object.fromEntries(Object.entries(a.assets).filter(t=>{const[r,n]=t;return typeof r=="string"&&r.length>0&&typeof n=="string"}));return{reviewId:J(a.metadata.review_id)??a.path,seed:J(a.metadata.seed)??a.path,mode:Oa(a.metadata.mode),model:J(a.metadata.model),characterName:J(a.metadata.character_name),templateName:J(a.metadata.template_name),genre:J(a.metadata.genre),notes:J(a.metadata.notes),favorite:!!a.metadata.favorite,tags:Array.isArray(a.metadata.tags)?a.metadata.tags.filter(t=>typeof t=="string"&&t.trim().length>0):[],offspringType:J(a.metadata.offspring_type),parentDraftIds:Array.isArray(a.metadata.parent_drafts)?a.metadata.parent_drafts.filter(t=>typeof t=="string"&&t.trim().length>0):void 0,assets:e}}function ja(a){return ue(a)?Array.isArray(a.drafts)&&a.drafts.every(e=>ue(e)&&ue(e.metadata)&&ue(e.assets))?{drafts:a.drafts.map(Mt)}:ue(a.metadata)&&ue(a.assets)?{drafts:[Mt(a)]}:a:a}class Da{config;accessToken=null;refreshPromise=null;statusPromise=null;cachedStatus=null;statusCacheExpiresAt=0;constructor(){this.config=this.loadConfig(),this.accessToken=localStorage.getItem(et)}loadConfig(){try{const e=localStorage.getItem(Lt);if(e)return JSON.parse(e)}catch(e){console.error("Failed to load server config:",e)}return{url:"https://api.eidolonsimulacra.com",enabled:!1}}saveConfig(){localStorage.setItem(Lt,JSON.stringify(this.config)),this.invalidateStatusCache()}getConfig(){return{...this.config}}setConfig(e){this.config={...this.config,...e},this.saveConfig()}invalidateStatusCache(){this.cachedStatus=null,this.statusCacheExpiresAt=0}isEnabled(){return this.config.enabled&&!!this.config.url}hasAccessToken(){return!!this.accessToken}setAccessToken(e){this.accessToken=e,localStorage.setItem(et,e),this.invalidateStatusCache()}clearAccessToken(){this.accessToken=null,localStorage.removeItem(et),this.invalidateStatusCache()}notifyAuthStateChanged(){window.dispatchEvent(new CustomEvent(dt))}getAccessToken(){return this.accessToken}async refreshAccessToken(){if(this.refreshPromise)return this.refreshPromise;this.refreshPromise=this.doRefreshToken();try{return await this.refreshPromise}finally{this.refreshPromise=null}}async doRefreshToken(){const e=`${this.config.url}/api/auth/refresh`,t=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include"});if(!t.ok)throw this.clearAccessToken(),this.notifyAuthStateChanged(),new Error("Failed to refresh token");const r=await t.json();return this.setAccessToken(r.accessToken),r.accessToken}async request(e,t={},r=!0){const n=`${this.config.url}${e}`,s={"Content-Type":"application/json",...t.headers},i=this.getAccessToken();i&&(s.Authorization=`Bearer ${i}`);const c=await fetch(n,{...t,headers:s,credentials:"include"});if(c.status===401&&r&&e!=="/api/auth/refresh"&&e!=="/api/auth/login"&&e!=="/api/auth/register")try{return await this.refreshAccessToken(),this.request(e,t,!1)}catch{throw this.clearAccessToken(),new Error("Authentication expired. Please login again.")}return c}async register(e,t,r){const n=await this.request("/api/auth/register",{method:"POST",body:JSON.stringify({email:e,password:t,displayName:r})});if(!n.ok){const i=await n.json();throw new Error(i.error||"Registration failed")}const s=await n.json();return this.setAccessToken(s.accessToken),this.notifyAuthStateChanged(),s}async login(e,t){const r=await this.request("/api/auth/login",{method:"POST",body:JSON.stringify({email:e,password:t})});if(!r.ok){const s=await r.json();throw new Error(s.error||"Login failed")}const n=await r.json();return this.setAccessToken(n.accessToken),this.notifyAuthStateChanged(),n}async logout(){try{await this.request("/api/auth/logout",{method:"POST"})}catch(e){console.error("Logout request failed:",e)}finally{this.clearAccessToken(),this.notifyAuthStateChanged()}}async getCurrentUser(){const e=await this.request("/api/auth/me");if(!e.ok){if(e.status===401)throw this.clearAccessToken(),new Error("Not authenticated");const r=await e.json();throw new Error(r.error||"Failed to get user")}return(await e.json()).user}async updateProfile(e){const t=await this.request("/api/auth/me",{method:"PATCH",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to update profile")}return(await t.json()).user}async deleteAccount(){const e=await this.request("/api/auth/me",{method:"DELETE"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to delete account")}this.clearAccessToken()}async checkStatus(){if(!this.isEnabled())return{connected:!1,authenticated:!1};const e=Date.now();if(this.cachedStatus&&e<this.statusCacheExpiresAt)return this.cachedStatus;if(this.statusPromise)return this.statusPromise;this.statusPromise=this.computeStatus();try{const t=await this.statusPromise;return this.cachedStatus=t,this.statusCacheExpiresAt=Date.now()+15e3,t}finally{this.statusPromise=null}}isConnectivityError(e){return e instanceof TypeError?!0:e instanceof Error?/failed to fetch|networkerror|network error|load failed/i.test(e.message):!1}async computeStatus(){try{if(this.hasAccessToken())try{return{connected:!0,authenticated:!0,user:await this.getCurrentUser()}}catch(t){return this.isConnectivityError(t)?{connected:!1,authenticated:!1,error:t instanceof Error?t.message:"Unknown error"}:{connected:!0,authenticated:!1,error:t instanceof Error?t.message:"Authentication failed"}}return(await fetch(`${this.config.url}/api/health`,{method:"GET"})).ok?{connected:!0,authenticated:!1}:{connected:!1,authenticated:!1,error:"Server unreachable"}}catch(e){return{connected:!1,authenticated:!1,error:e instanceof Error?e.message:"Unknown error"}}}async syncDrafts(e,t){const r=e==="push",n=r?"/api/sync/drafts/push":"/api/sync/drafts",s=r?ja(t):t,i=await this.request(n,{method:r?"POST":"GET",body:r?JSON.stringify(s):void 0});if(!i.ok){let c=`Failed to ${e} drafts`,l=null;try{const d=await i.json();if(c=d.error||c,l=d.error||null,d.details){const p=Object.entries(d.details).flatMap(([h,g])=>(g||[]).map(y=>`${h}: ${y}`)).join("; ");p&&(c=`${c} (${p})`)}}catch{}if(e==="pull"&&n!=="/api/sync/drafts"&&(i.status===404||i.status===400&&l==="Validation failed"))try{return await this.listRemoteDrafts()}catch{}throw new Error(c)}return i.json()}async listRemoteDrafts(){const e=await this.request("/api/sync/drafts",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote drafts")}return e.json()}async deleteRemoteDraft(e){const t=await this.request(`/api/sync/drafts/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const r=await t.json();throw new Error(r.error||"Failed to delete remote draft")}return t.json()}async syncThemes(e,t){const r=await this.request(`/api/sync/themes/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!r.ok){const n=await r.json();throw new Error(n.error||`Failed to ${e} themes`)}return r.json()}async listRemoteThemes(){const e=await this.request("/api/sync/themes/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote themes")}return e.json()}async deleteRemoteTheme(e){const t=await this.request(`/api/sync/themes/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const r=await t.json();throw new Error(r.error||"Failed to delete remote theme")}return t.json()}async syncTemplates(e,t){const r=await this.request(`/api/sync/templates/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!r.ok){const n=await r.json();throw new Error(n.error||`Failed to ${e} templates`)}return r.json()}async syncSeeds(e,t){const r=e==="push",n=r?"/api/sync/seeds/push":"/api/sync/seeds",s=await this.request(n,{method:r?"POST":"GET",body:r?JSON.stringify(t):void 0});if(!s.ok){const i=await s.json();throw new Error(i.error||`Failed to ${e} seeds`)}return s.json()}async listRemoteTemplates(){const e=await this.request("/api/sync/templates/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote templates")}return e.json()}async deleteRemoteTemplate(e){const t=await this.request(`/api/sync/templates/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const r=await t.json();throw new Error(r.error||"Failed to delete remote template")}return t.json()}async pullConfig(){const e=await this.request("/api/sync/config",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to pull config")}return e.json()}async pushConfig(e){const t=await this.request("/api/sync/config",{method:"PUT",body:JSON.stringify(e)});if(!t.ok){const r=await t.json();throw new Error(r.error||"Failed to push config")}return t.json()}async pullApiKeys(){const e=await this.request("/api/sync/config/api-keys",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to pull API keys")}return e.json()}async pushApiKeys(e){const t=await this.request("/api/sync/config/api-keys",{method:"PUT",body:JSON.stringify(e)});if(!t.ok){const r=await t.json();throw new Error(r.error||"Failed to push API keys")}return t.json()}async sync(e,t,r){switch(e){case"drafts":return this.syncDrafts(t,r);case"themes":return this.syncThemes(t,r);case"templates":return this.syncTemplates(t,r);case"seeds":return this.syncSeeds(t,r);case"blueprints":return this.syncBlueprints(t,r);case"worlds":if(t==="list")throw new Error("World sync does not support list");return this.syncWorlds(t,r);case"timelines":if(t==="list")throw new Error("Timeline sync does not support list");return this.syncTimelines(t,r);default:throw new Error(`Unknown data type: ${e}`)}}async syncBlueprints(e,t){const r=await this.request(`/api/sync/blueprints/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!r.ok){const n=await r.json();throw new Error(n.error||`Failed to ${e} blueprints`)}return r.json()}async listRemoteBlueprints(){const e=await this.request("/api/sync/blueprints/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote blueprints")}return e.json()}async deleteRemoteBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const r=await t.json();throw new Error(r.error||"Failed to delete remote blueprint")}return t.json()}async getBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`);if(!t.ok){const r=await t.json();throw new Error(r.error||"Failed to get blueprint")}return t.json()}async createBlueprint(e){const t=await this.request("/api/sync/blueprints",{method:"POST",body:JSON.stringify(e)});if(!t.ok){const r=await t.json();throw new Error(r.error||"Failed to create blueprint")}return t.json()}async updateBlueprint(e,t){const r=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`,{method:"PUT",body:JSON.stringify(t)});if(!r.ok){const n=await r.json();throw new Error(n.error||"Failed to update blueprint")}return r.json()}async deleteBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const r=await t.json();throw new Error(r.error||"Failed to delete blueprint")}return t.json()}async duplicateBlueprint(e,t,r){const n=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}/duplicate`,{method:"POST",body:JSON.stringify({newPath:t,newName:r})});if(!n.ok){const s=await n.json();throw new Error(s.error||"Failed to duplicate blueprint")}return n.json()}async resetBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}/reset`,{method:"POST"});if(!t.ok){const r=await t.json();throw new Error(r.error||"Failed to reset blueprint")}return t.json()}async syncWorlds(e,t){const r=await this.request(`/api/sync/worlds/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!r.ok){const n=await r.json();throw new Error(n.error||`Failed to ${e} worlds`)}return r.json()}async getWorlds(e){const t=new URLSearchParams;e?.search&&t.set("search",e.search),e?.genre&&t.set("genre",e.genre),e?.includePublic!==void 0&&t.set("includePublic",String(e.includePublic));const r=await this.request(`/api/sync/worlds?${t.toString()}`);if(!r.ok){const n=await r.json();throw new Error(n.error||"Failed to get worlds")}return r.json()}async getWorld(e){const t=await this.request(`/api/sync/worlds/${e}`);if(!t.ok){const r=await t.json();throw new Error(r.error||"Failed to get world")}return t.json()}async createWorld(e){const t=await this.request("/api/sync/worlds",{method:"POST",body:JSON.stringify(e)});if(!t.ok){const r=await t.json();throw new Error(r.error||"Failed to create world")}return t.json()}async updateWorld(e,t){const r=await this.request(`/api/sync/worlds/${e}`,{method:"PUT",body:JSON.stringify(t)});if(!r.ok){const n=await r.json();throw new Error(n.error||"Failed to update world")}return r.json()}async deleteWorld(e){const t=await this.request(`/api/sync/worlds/${e}`,{method:"DELETE"});if(!t.ok){const r=await t.json();throw new Error(r.error||"Failed to delete world")}return t.json()}async syncTimelines(e,t){const r=await this.request(`/api/sync/timelines/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!r.ok){const n=await r.json();throw new Error(n.error||`Failed to ${e} timelines`)}return r.json()}async getTimelines(e){const t=new URLSearchParams;e?.worldId&&t.set("worldId",e.worldId),e?.search&&t.set("search",e.search);const r=await this.request(`/api/sync/timelines?${t.toString()}`);if(!r.ok){const n=await r.json();throw new Error(n.error||"Failed to get timelines")}return r.json()}async getTimeline(e){const t=await this.request(`/api/sync/timelines/${e}`);if(!t.ok){const r=await t.json();throw new Error(r.error||"Failed to get timeline")}return t.json()}async createTimeline(e){const t=await this.request("/api/sync/timelines",{method:"POST",body:JSON.stringify(e)});if(!t.ok){const r=await t.json();throw new Error(r.error||"Failed to create timeline")}return t.json()}async updateTimeline(e,t){const r=await this.request(`/api/sync/timelines/${e}`,{method:"PUT",body:JSON.stringify(t)});if(!r.ok){const n=await r.json();throw new Error(n.error||"Failed to update timeline")}return r.json()}async deleteTimeline(e){const t=await this.request(`/api/sync/timelines/${e}`,{method:"DELETE"});if(!t.ok){const r=await t.json();throw new Error(r.error||"Failed to delete timeline")}return t.json()}async addTimelineEvent(e,t){const r=await this.request(`/api/sync/timelines/${e}/events`,{method:"POST",body:JSON.stringify(t)});if(!r.ok){const n=await r.json();throw new Error(n.error||"Failed to add event")}return r.json()}async updateTimelineEvent(e,t,r){const n=await this.request(`/api/sync/timelines/${e}/events/${t}`,{method:"PATCH",body:JSON.stringify(r)});if(!n.ok){const s=await n.json();throw new Error(s.error||"Failed to update event")}return n.json()}async deleteTimelineEvent(e,t){const r=await this.request(`/api/sync/timelines/${e}/events/${t}`,{method:"DELETE"});if(!r.ok){const n=await r.json();throw new Error(n.error||"Failed to delete event")}return r.json()}async testConnection(e){try{const t=await fetch(`${e}/api/health`,{method:"GET",signal:AbortSignal.timeout(5e3)});return t.ok?{success:!0,message:"Connection successful"}:{success:!1,message:`Server returned ${t.status}`}}catch(t){return{success:!1,message:t instanceof Error?t.message:"Connection failed"}}}}const v=new Da,vr="eidolon.web.seedGenerator.history",_r=["bpui.web.seedGenerator.history"],kr="eidolon.web.seedGenerator.favorites",Sr=["bpui.web.seedGenerator.favorites"],Tr="eidolon.web.seedGenerator.favorites.syncState",Ra=12,La=12,ut="seed-favorites-changed";function kt(a,e){if(typeof window>"u")return e;const t=Array.isArray(a)?[...a]:[a],[r,...n]=t;try{for(const s of t){const i=window.localStorage.getItem(s);if(!i)continue;const c=JSON.parse(i);return s!==r&&(window.localStorage.setItem(r,JSON.stringify(c)),n.forEach(l=>window.localStorage.removeItem(l))),c}}catch{return e}return e}function St(a,e,t){typeof window>"u"||(window.localStorage.setItem(a,JSON.stringify(t)),e.forEach(r=>window.localStorage.removeItem(r)))}function Ma(a){typeof window>"u"||window.dispatchEvent(new CustomEvent(ut,{detail:{count:a.length}}))}function Ft(a){if(typeof a!="string")return;const e=new Date(a);return Number.isNaN(e.getTime())?void 0:e.toISOString()}function Fa(a){if(typeof a!="object"||a===null)return null;const e=a,t=typeof e.seed=="string"?e.seed.trim():"";if(!t)return null;const r=Ft(e.addedAt)??new Date().toISOString(),n=Ft(e.lastUsedAt);return n?{seed:t,addedAt:r,lastUsedAt:n}:{seed:t,addedAt:r}}function ze(a){const e=new Map;for(const t of a){const r=Fa(t);r&&e.set(r.seed,r)}return Array.from(e.values()).sort((t,r)=>{const n=Date.parse(t.lastUsedAt??t.addedAt);return Date.parse(r.lastUsedAt??r.addedAt)-n})}function Tt(){return kt(Tr,{})}function Er(a){St(Tr,[],a)}function Ce(a,e={}){const{markChanged:t=!0,markSynced:r=!1,timestamp:n=new Date().toISOString()}=e,s=ze(a);St(kr,Sr,s);const i=Tt();return t&&(i.lastChangedAt=n),r&&(i.lastSyncedAt=n),Er(i),Ma(s),s}const pt=[{id:"noir-romance",label:"Noir Pressure",genreLines:`noir:debt, surveillance, intimacy, slow-burn
romance:realism, asymmetry, messy loyalty, after-hours`},{id:"grounded-sf",label:"Grounded Sci-Fi",genreLines:`sci-fi:grounded, labor, proximity, bureaucracy
romance:subtext, contracts, withheld tenderness`},{id:"low-magic",label:"Low Magic",genreLines:`fantasy:low-magic, domestic, obligation, village politics
romance:restraint, longing, practical intimacy`},{id:"urban-horror",label:"Urban Horror",genreLines:`horror:grounded, neighborhood, debt, body unease
thriller:secrecy, leverage, false safety`},{id:"moreau",label:"Moreau",genreLines:`romance:moreau, realism, stigma, protective tension
urban fantasy:morphosis, nightlife, consent ethic, social friction`}];function Ua(a){return a.replace(/^```+/,"").replace(/```+$/,"").trim()}function $a(a){return Ua(a).replace(/^[-*•]\s+/,"").replace(/^\d+[.)]\s+/,"").replace(/^seed\s*:\s*/i,"").trim()}function Bo(){return pt}function Ba(){return pt[Math.floor(Math.random()*pt.length)]}function Ha(a){return Math.min(30,Math.max(5,Math.round(a||La)))}function Ho(a,e){const t=a.split(`
`).map(n=>n.trim()).filter(Boolean);return[...[`count=${Ha(e.count)}`,e.coverageMode],...t].join(`
`)}function Ga(a){const e=a.genre_lines.split(`
`).map(t=>t.trim()).filter(Boolean).join(`
`);if(a.surprise_mode||!e){const t=Ba();return{genreLines:t.genreLines,sourcePreset:t}}return{genreLines:e}}function Wa(a){const e=a.split(`
`).map($a).filter(t=>t.length>0).filter(t=>!/^#+\s*/.test(t)).filter(t=>!/^output to\s+/i.test(t)).filter(t=>!/^no headings/i.test(t));return[...new Set(e)].filter(t=>t.length<=180)}function Ka(){return kt([vr,..._r],[])}function Go(a){const t=[{...a,id:crypto.randomUUID(),createdAt:new Date().toISOString()},...Ka()].slice(0,Ra);return St(vr,_r,t),t}function fe(){const a=kt([kr,...Sr],[]);return ze(a)}function za(a){if(Array.isArray(a))return ze(a);if(typeof a!="object"||a===null)return null;const e=a;return Array.isArray(e.seeds)?ze(e.seeds):null}function Wo(a){return Ce([...a])}function qa(a){return Ce([...a],{markChanged:!1,markSynced:!0})}function Ar(a=new Date().toISOString()){const e=Tt();e.lastSyncedAt=a,Er(e)}function Va(){const{lastChangedAt:a,lastSyncedAt:e}=Tt();return a?e?Date.parse(a)>Date.parse(e):!0:!1}async function Ko(){if(!v.isEnabled()||!v.hasAccessToken())return null;if(Va()){const t=fe();return await v.syncSeeds("push",{seeds:t}),Ar(),t}const a=await v.syncSeeds("pull"),e=za(a);return e?qa(e):null}function zo(a){const e=fe();if(e.findIndex(n=>n.seed===a)>=0){const n=e.filter(s=>s.seed!==a);return Ce(n)}const r=[{seed:a,addedAt:new Date().toISOString()},...e];return Ce(r)}function qo(a){const e=new Date().toISOString(),r=fe().map(n=>n.seed===a?{...n,lastUsedAt:e}:n);return Ce(r)}const Ya="eidolon.web.themes.custom",Ja=["bpui.web.themes.custom"],Cr=900,$e=new Set;let K=null,ve=null;function Xa(){if(typeof window>"u")return[];for(const a of[Ya,...Ja]){const e=window.localStorage.getItem(a);if(e)try{return JSON.parse(e)}catch{return[]}}return[]}function Qa(a){const e=a.metadata.mode,t=e==="SFW"||e==="NSFW"||e==="Platform-Safe"||e==="Auto"?e:void 0,r=s=>{if(typeof s!="string")return;const i=s.trim();return i.length>0?i:void 0},n=Object.fromEntries(Object.entries(a.assets).filter(s=>{const[i,c]=s;return typeof i=="string"&&i.length>0&&typeof c=="string"}));return{reviewId:r(a.metadata.review_id)??a.path,seed:r(a.metadata.seed)??a.path,mode:t,model:r(a.metadata.model),characterName:r(a.metadata.character_name),templateName:r(a.metadata.template_name),genre:r(a.metadata.genre),notes:r(a.metadata.notes),favorite:!!a.metadata.favorite,tags:Array.isArray(a.metadata.tags)?a.metadata.tags.filter(s=>typeof s=="string"&&s.trim().length>0):[],offspringType:r(a.metadata.offspring_type),parentDraftIds:Array.isArray(a.metadata.parent_drafts)?a.metadata.parent_drafts.filter(s=>typeof s=="string"&&s.trim().length>0):void 0,assets:n}}function Ut(a){return Ue(a)!==null&&!fr(a)?`blueprints/overrides/${a.replace(/^blueprints\//,"")}`:a}function Za(a){return typeof a=="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(a)}async function es(){const[a,e]=await Promise.all([j.getAllDrafts(),v.listRemoteDrafts()]),t=new Set(a.map(i=>i.metadata.review_id)),r=e.drafts||[],s=((await v.syncDrafts("push",{drafts:a.map(Qa)})).results||[]).filter(i=>i.status==="error").map(i=>i.error?`${i.reviewId} (${i.error})`:i.reviewId);if(s.length>0)throw new Error(`Remote draft sync failed for: ${s.join(", ")}`);await Promise.all(r.filter(i=>!t.has(i.reviewId)).map(i=>Za(i.id)?v.deleteRemoteDraft(i.id).catch(c=>{console.warn(`Failed to delete remote draft ${i.reviewId}:`,c)}):(console.warn(`Skipping remote draft delete for ${i.reviewId}: server returned non-UUID id.`),Promise.resolve())))}async function ts(){const a=Xa(),t=(await v.listRemoteThemes()).themes||[],r=new Set(a.map(n=>n.name));await v.syncThemes("push",{themes:a.map(n=>({name:n.name,displayName:n.display_name,description:n.description,author:n.author,tags:n.tags,basedOn:n.based_on,colors:n.colors}))}),await Promise.all(t.filter(n=>!n.isBuiltin&&!r.has(n.name)).map(n=>v.deleteRemoteTheme(n.name).catch(s=>{console.warn(`Failed to delete remote theme ${n.name}:`,s)})))}async function rs(){const a=ie(),t=(await v.listRemoteTemplates()).templates||[],r=new Set(a.map(n=>n.template.name));await v.syncTemplates("push",{templates:a.map(n=>({name:n.template.name,version:n.template.version,description:n.template.description,isDefault:n.template.is_default,assets:n.template.assets,blueprintContent:n.blueprint_contents}))}),await Promise.all(t.filter(n=>!n.isOfficial&&!r.has(n.name)).map(n=>v.deleteRemoteTemplate(n.name).catch(s=>{console.warn(`Failed to delete remote template ${n.name}:`,s)})))}async function ns(){const a=fe();await v.syncSeeds("push",{seeds:a}),Ar()}async function as(){const a=ee(),e=Object.entries(a),t=new Set(e.map(([s])=>Ut(s))),n=(await v.listRemoteBlueprints()).blueprints||[];e.length>0&&await v.syncBlueprints("push",{blueprints:e.map(([s,i])=>{const c=wt(i);return{path:Ut(s),name:c.name,description:c.description,invokable:c.invokable,version:c.version,category:"custom",content:i}})}),await Promise.all(n.filter(s=>!s.isBuiltin&&!t.has(s.path)).map(s=>v.deleteRemoteBlueprint(s.path).catch(i=>{console.warn(`Failed to delete remote blueprint ${s.path}:`,i)})))}async function ss(){await Promise.all([v.pushConfig(P.getConfig()),v.pushApiKeys(P.getApiKeys())])}async function os(a){switch(a){case"drafts":await es();return;case"themes":await ts();return;case"templates":await rs();return;case"seeds":await ns();return;case"blueprints":await as();return;case"config":await ss();return}}async function qe(){if(ve)return ve;K&&(clearTimeout(K),K=null),ve=(async()=>{const a=Array.from($e);if($e.clear(),!(a.length===0||!v.isEnabled()||!v.hasAccessToken()))for(const e of a)try{await os(e)}catch(t){console.warn(`Automatic ${e} sync failed:`,t)}})();try{await ve}finally{ve=null,$e.size>0&&!K&&(K=setTimeout(()=>{K=null,qe()},Cr))}}function I(a,e={}){if((Array.isArray(a)?a:[a]).forEach(r=>$e.add(r)),e.immediate){qe();return}K&&clearTimeout(K),K=setTimeout(()=>{K=null,qe()},Cr)}function is(){return qe()}function cs(a){const e=lr(a);if(e.length===0)return"";let t;try{t=dr(e)}catch{t=e.map(i=>i.name)}const r=t.map(i=>e.find(c=>c.name===i)).filter(i=>!!i),n=[];n.push(`

## TEMPLATE OVERRIDE
`),n.push("The following active template contract is authoritative. Use it instead of the fallback template order."),n.push(`Template name: ${a.name}`),n.push(`Template version: ${a.version}`),a.description?.trim()&&n.push(`Template description: ${a.description.trim()}`),n.push(`Asset count: ${r.length}`),n.push(""),n.push("Asset output order:"),r.forEach((i,c)=>{n.push(`${c+1}. ${i.name}`)}),n.push(""),n.push("Declared asset contract:"),r.forEach(i=>{const c=i.dependsOn.length>0?i.dependsOn.join(", "):"none";n.push(`- ${i.name}`),n.push(`  - required: ${i.required}`),n.push(`  - depends_on: ${c}`),i.blueprintFile&&n.push(`  - blueprint_file: ${i.blueprintFile}`),i.description?.trim()&&n.push(`  - description: ${i.description.trim()}`)});const s=r.map(i=>{const c=yr(a.name,i.name)?.trim();return c?["",`### ASSET BLUEPRINT: ${i.name}`,"```md",c,"```"].join(`
`):null}).filter(i=>!!i);return s.length>0&&(n.push(""),n.push("Resolved asset blueprints:"),n.push("Follow these blueprint sources exactly for structure, placeholders, control blocks, and field names."),n.push(s.join(`
`))),n.join(`
`)}function ls(a){if(!a)return[];const e=lr(a);if(e.length===0)return[];try{return dr(e)}catch{return e.map(t=>t.name)}}function $t(a,e,t,r){const n=ls(r),s=n.length>0?n:Object.keys(t),i=[`
## ${a}: ${e}`];return r&&i.push(`Template: ${r.name} (${r.version})`),s.forEach(c=>{i.push(`### ${c}:
\`\`\``),i.push(t[c]||""),i.push("```")}),i}async function ds(a,e=null,t,r,n,s=[]){let i=await bt("orchestration",n,r);t&&t.assets.length>0&&(i+=cs(t));const c=i,l=[];return e&&l.push(`Mode: ${e}`),l.push(`SEED: ${a}`),s.length>0&&(l.push(""),l.push("ADDITIONAL RULES:"),s.forEach(u=>{l.push(`- ${u}`)})),[c,l.join(`
`)]}async function us(a,e,t=null,r={},n=null,s){const i=n||await cr(a,s),c=`# BLUEPRINT: ${a}

${i}`,l=[];if(t&&l.push(`Mode: ${t}`),l.push(`SEED: ${e}`),r&&Object.keys(r).length>0){l.push(`
---
## Prior Assets (for context):
`);for(const[u,d]of Object.entries(r))l.push(`### ${u}:
\`\`\`
${d}
\`\`\`
`)}return[c,l.join(`
`)]}async function ps(a,e){return[e?.trim()||await bt("seed_generation"),a]}function hs(a,e){const t=`You are an expert character analyst specializing in understanding character relationships, dynamics, and narrative potential. Your task is to deeply analyze two characters and provide insights about how they would interact in a story.

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
- What themes or conflicts would their relationship explore?`,r=[];return r.push(`## CHARACTER 1: ${a.name||"Character 1"}`),r.push(`**Age**: ${a.age||"Unknown"}`),r.push(`**Gender**: ${a.gender||"Unknown"}`),r.push(`**Species**: ${a.species||"Unknown"}`),r.push(`**Occupation**: ${a.occupation||"Unknown"}`),r.push(`**Role**: ${a.role||"Unknown"}`),r.push(`**Power Level**: ${a.power_level||"Unknown"}`),r.push(`**Mode**: ${a.mode||"Unknown"}`),a.personality_traits&&a.personality_traits.length>0&&r.push(`**Personality Traits**: ${a.personality_traits.slice(0,10).join(", ")}`),a.core_values&&a.core_values.length>0&&r.push(`**Core Values**: ${a.core_values.slice(0,10).join(", ")}`),a.motivations&&a.motivations.length>0&&r.push(`**Motivations**: ${a.motivations.slice(0,10).join(", ")}`),a.goals&&a.goals.length>0&&r.push(`**Goals**: ${a.goals.slice(0,10).join(", ")}`),a.fears&&a.fears.length>0&&r.push(`**Fears**: ${a.fears.slice(0,10).join(", ")}`),r.push(`
## CHARACTER 2: ${e.name||"Character 2"}`),r.push(`**Age**: ${e.age||"Unknown"}`),r.push(`**Gender**: ${e.gender||"Unknown"}`),r.push(`**Species**: ${e.species||"Unknown"}`),r.push(`**Occupation**: ${e.occupation||"Unknown"}`),r.push(`**Role**: ${e.role||"Unknown"}`),r.push(`**Power Level**: ${e.power_level||"Unknown"}`),r.push(`**Mode**: ${e.mode||"Unknown"}`),e.personality_traits&&e.personality_traits.length>0&&r.push(`**Personality Traits**: ${e.personality_traits.slice(0,10).join(", ")}`),e.core_values&&e.core_values.length>0&&r.push(`**Core Values**: ${e.core_values.slice(0,10).join(", ")}`),e.motivations&&e.motivations.length>0&&r.push(`**Motivations**: ${e.motivations.slice(0,10).join(", ")}`),e.goals&&e.goals.length>0&&r.push(`**Goals**: ${e.goals.slice(0,10).join(", ")}`),e.fears&&e.fears.length>0&&r.push(`**Fears**: ${e.fears.slice(0,10).join(", ")}`),r.push(`
## TASK`),r.push("Provide a deep analysis of these two characters' relationship potential."),r.push("Return your response as valid JSON following the structure specified in the system prompt."),[t,r.join(`
`)]}async function ms(a,e,t,r,n=null,s,i,c,l){const u=await bt("offspring_generation",l,c),d=[];return n&&d.push(`Mode: ${n}`),d.push(...$t("PARENT 1",t,a,s)),d.push(...$t("PARENT 2",r,e,i)),d.push(`
## INSTRUCTION:`),d.push("Analyze how these two parents would shape a new character's upbringing and generate the offspring's SEED."),d.push("Treat each parent suite according to the template contract shown in the provided assets."),[u,d.join(`
`)]}function _e(a,e,t){const r=[{role:"system",content:a}];return r.push({role:"user",content:e}),r}class X{static resolveConfiguredProvider(e){return e.engine_mode==="explicit"&&e.engine!=="auto"&&e.engine!=="openai_compatible"?e.engine:e.model?ft(e.model):void 0}static getFallbackApiKey(e){return Object.values(e).find(t=>typeof t=="string"&&t.trim().length>0)}static createConfiguredEngine(){const e=P.getApiKeys(),t=P.getConfig(),r=this.resolveConfiguredProvider(t);return he({model:t.model,apiKey:r?e[r]:this.getFallbackApiKey(e),apiKeys:e,provider:r,baseUrl:t.base_url,proxyKey:t.api_proxy_key,temperature:t.temperature,maxTokens:t.max_tokens})}static sanitizeGeneratedSeed(e){return e.replace(/^```[a-z]*\n?/i,"").replace(/```$/i,"").trim().replace(/^['"]|['"]$/g,"")}static getOffspringCarryRules(){return["Treat this seed as an offspring outcome shaped by two parent suites, not a disconnected standalone premise.","Preserve the inherited, inverted, or transmuted relational vector toward {{user}} implied by the offspring seed.","Do not flatten lineage tension: the generated assets should still feel like a descendant response to parental influence even when the seed expresses rebellion or mutation."]}static async*generate(e,t={}){const{seed:r,template:n,mode:s="Auto",stream:i=!0,blueprint_override:c,additional_instructions:l=[]}=e;yield{type:"status",stage:"initializing"};const u=P.getConfig(),d=this.createConfiguredEngine(),p=n?Se(n):void 0;yield{type:"status",stage:"building_prompt"};const[h,g]=await ds(r,s,p,void 0,c,l);yield{type:"status",stage:"generating"};const y=_e(h,g);let x="";if(i){for await(const G of d.generateStream(y,{signal:t.signal}))if(G.content&&(x+=G.content,yield{type:"chunk",content:G.content}),G.done)break}else x=(await d.generate(y,{signal:t.signal})).content;yield{type:"status",stage:"parsing"};let R;try{R=p?Cn(x,p).assets:this.parseBlueprintOutput(x)}catch{R=this.parseBlueprintOutput(x)}yield{type:"status",stage:"saving"};const A=this.generateReviewId(),H=Ke(R,n),U={path:A,metadata:{review_id:A,seed:r,mode:s,model:u.model,created:new Date().toISOString(),modified:new Date().toISOString(),favorite:!1,template_name:n,character_name:H},assets:R};await j.saveDraft(U),I("drafts"),yield{type:"complete",asset:A}}static async*generateAsset(e,t=!0){const r=yr(e.template,e.asset_name);yield*this.generateAssetWithBlueprint(e,r,t)}static async*previewBlueprint(e,t=!0){yield*this.generateAssetWithBlueprint(e,e.blueprint_content,t)}static async*generateAssetWithBlueprint(e,t,r){const{seed:n,mode:s="Auto",asset_name:i,prior_assets:c}=e;yield{type:"status",stage:"initializing"};const l=this.createConfiguredEngine();yield{type:"status",stage:"building_prompt"};const[u,d]=await us(i,n,s,c,t);yield{type:"status",stage:"prompt_ready",asset:i,systemPrompt:u,userPrompt:d},yield{type:"status",stage:"generating",asset:i};const p=_e(u,d);let h="";if(r){for await(const g of l.generateStream(p))if(g.content&&(h+=g.content,yield{type:"chunk",content:g.content,asset:i}),g.done)break}else h=(await l.generate(p)).content;yield{type:"asset",asset:i,content:h,systemPrompt:u,userPrompt:d}}static async*generateOffspringSeed(e,t={}){const{parent1_id:r,parent2_id:n,mode:s="Auto",blueprint_override:i}=e;yield{type:"status",stage:"loading_parents"};const c=await j.getDraft(r),l=await j.getDraft(n);if(!c||!l){yield{type:"error",error:"Parent drafts not found"};return}yield{type:"status",stage:"building_prompt"};const u=this.createConfiguredEngine(),[d,p]=await ms(c.assets,l.assets,c.metadata.character_name||"Parent 1",l.metadata.character_name||"Parent 2",s,c.metadata.template_name?Se(c.metadata.template_name):void 0,l.metadata.template_name?Se(l.metadata.template_name):void 0,void 0,i);yield{type:"status",stage:"generating"};const h=_e(d,p);let g="";for await(const x of u.generateStream(h,{signal:t.signal}))if(x.content&&(g+=x.content,yield{type:"chunk",content:x.content}),x.done)break;yield{type:"complete",content:this.sanitizeGeneratedSeed(g)}}static async*generateOffspring(e,t={}){const{parent1_id:r,parent2_id:n,mode:s="Auto",template:i,blueprint_override:c}=e;let l="";for await(const d of this.generateOffspringSeed(e,t)){if(d.type==="error"){yield d;return}(d.type==="status"||d.type==="chunk")&&(yield d),d.type==="complete"&&(l=d.content||"")}if(!l){yield{type:"error",error:"Offspring seed generation finished without seed content."};return}yield{type:"status",stage:"generating_character"};let u="";for await(const d of this.generate({seed:l,mode:s,template:i,stream:!1,blueprint_override:c,additional_instructions:this.getOffspringCarryRules()},t)){if(d.type==="error"){yield d;return}d.type==="status"&&d.stage==="saving"&&(yield{type:"status",stage:"saving"}),d.type==="complete"&&(u=d.asset||"")}if(!u){yield{type:"error",error:"Offspring generation finished without a saved draft id."};return}await j.updateMetadata(u,{seed:l,parent_drafts:[r,n],offspring_type:"offspring"}),I("drafts"),yield{type:"complete",asset:u}}static async*generateSeeds(e){yield{type:"status",stage:"initializing"};const t=typeof e=="string"?{genre_lines:e}:e,{genreLines:r}=Ga(t),n=P.getApiKeys(),s=P.getConfig(),i=this.resolveConfiguredProvider(s),c=he({model:s.model,apiKey:i?n[i]:this.getFallbackApiKey(n),apiKeys:n,provider:i,baseUrl:s.base_url,temperature:s.temperature,maxTokens:s.max_tokens});yield{type:"status",stage:"building_prompt"};const[l,u]=await ps(r,t.blueprint_content);yield{type:"status",stage:"generating"};const d=_e(l,u),p=await c.generate(d);yield{type:"complete",content:Wa(p.content).join(`
`)}}static async*chat(e,t,r){yield{type:"status",stage:"initializing"};const n=P.getApiKeys(),s=P.getConfig(),i=this.resolveConfiguredProvider(s),c=he({model:s.model,apiKey:i?n[i]:this.getFallbackApiKey(n),apiKeys:n,provider:i,baseUrl:s.base_url,temperature:s.temperature,maxTokens:s.max_tokens});yield{type:"status",stage:"generating"};const u=(t[0]?.role==="system"?t[0].content:void 0)?t.slice(1):t;let d="";for await(const p of c.generateStream(u))if(p.content&&(d+=p.content,yield{type:"chunk",content:p.content}),p.done)break;yield{type:"complete",content:d}}static async analyzeSimilarity(e,t){const r=await j.getDraft(e),n=await j.getDraft(t);if(!r||!n)throw new Error("One or both drafts not found");const s=this.parseCharacterProfile(r.assets.character_sheet||""),i=this.parseCharacterProfile(n.assets.character_sheet||""),c=P.getApiKeys(),l=P.getConfig(),u=this.resolveConfiguredProvider(l),d=he({model:l.model,apiKey:u?c[u]:this.getFallbackApiKey(c),apiKeys:c,provider:u,baseUrl:l.base_url,temperature:l.temperature,maxTokens:l.max_tokens}),[p,h]=hs(s,i),g=_e(p,h),y=await d.generate(g);try{return JSON.parse(y.content)}catch{return{raw:y.content}}}static parseBlueprintOutput(e){const t={},r=/```(\w+)?\n([\s\S]*?)```/g,n=["Adjustment Note","system_prompt","post_history","character_sheet","intro_scene","intro_page","a1111","suno"];let s;for(;(s=r.exec(e))!==null;){const i=s[1],c=s[2]?.trim();i&&c&&n.includes(i)&&(t[i]=c)}if(Object.keys(t).length===0)for(let i=0;i<n.length;i++){const c=n[i],l=n[i+1],u=new RegExp(`^##\\s*${c}`,"im"),d=e.search(u);if(d===-1)continue;let p;if(l){const g=new RegExp(`^##\\s*${l}`,"im"),y=e.slice(d).search(g);p=y===-1?e.length:d+y}else p=e.length;const h=e.slice(d,p).trim();h&&(t[c]=h)}return t}static parseCharacterProfile(e){const t={},r=e.split(`
`);let n=null,s=[];for(const i of r){const c=i.match(/^([A-Z][A-Za-z\s]+):\s*(.+)$/);c?(n&&s.length>0&&(t[n]=s.join(`
`).trim()),n=c[1].trim().toLowerCase().replace(/\s+/g,"_"),s=[c[2].trim()]):n&&i.trim()&&s.push(i.trim())}n&&s.length>0&&(t[n]=s.join(`
`).trim());for(const i of["personality_traits","core_values","goals","fears","motivations"])typeof t[i]=="string"&&(t[i]=t[i].split(",").map(c=>c.trim()).filter(c=>c.length>0));return t}static generateReviewId(){const e=Date.now(),t=Math.random().toString(36).substring(2,9);return`${e}_${t}`}}const Nr="eidolon.web.themes.custom",ht="eidolon:themes-synced",mt="eidolon:drafts-synced";function fs(a,e){const t=e.match(/^---\n([\s\S]*?)\n---/);let r=a.split("/").pop()?.replace(".md","")||"Blueprint",n="",s="1.0",i=!0;if(!t)return{name:r,description:n,version:s,invokable:i};const c=t[1],l=c.match(/^name:\s*(.+)$/m),u=c.match(/^description:\s*(.+)$/m),d=c.match(/^version:\s*(.+)$/m),p=c.match(/^invokable:\s*(.+)$/m);return l&&(r=l[1].trim()),u&&(n=u[1].trim()),d&&(s=d[1].trim()),p&&(i=p[1].trim()==="true"),{name:r,description:n,version:s,invokable:i}}function gs(a,e){const t=new Set(_t().map(i=>i.template.name).filter(i=>i!==e));if(!t.has(a))return a;const r=a.endsWith(" Copy")?a:`${a} Copy`;if(!t.has(r))return r;let n=2,s=`${r} ${n}`;for(;t.has(s);)n+=1,s=`${r} ${n}`;return s}const Pr=["bpui.web.themes.custom"],ys=300*1e3,Me=new Map,bs=[{name:"json",path:"json",format:"json",description:"Export the full draft as JSON."},{name:"text",path:"text",format:"text",description:"Export draft assets as plain text sections."},{name:"combined",path:"combined",format:"combined",description:"Export a markdown bundle with metadata and assets."}];function N(a){return{author:"Eidolon Simulacra",is_builtin:!0,...a}}const ws=[N({name:"dark",display_name:"Dark",description:"Default dark theme for browser-only mode.",tags:["builtin","dark"],based_on:"",colors:{background:"#0f172a",text:"#e5e7eb",accent:"#38bdf8",button:"#1d4ed8",button_text:"#f8fafc",border:"#334155",highlight:"#7dd3fc",window:"#111827",tok_brackets:"#60a5fa",tok_asterisk:"#f472b6",tok_parentheses:"#f59e0b",tok_double_brackets:"#a78bfa",tok_curly_braces:"#34d399",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#94a3b8",surface:"#1e293b",success_bg:"#052e16",danger_bg:"#450a0a",accent_bg:"#082f49",accent_title:"#e0f2fe",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fcd34d"}}),N({name:"light",display_name:"Light",description:"Default light theme for browser-only mode.",tags:["builtin","light"],based_on:"",colors:{background:"#f8fafc",text:"#0f172a",accent:"#2563eb",button:"#1d4ed8",button_text:"#eff6ff",border:"#cbd5e1",highlight:"#0ea5e9",window:"#ffffff",tok_brackets:"#2563eb",tok_asterisk:"#db2777",tok_parentheses:"#d97706",tok_double_brackets:"#7c3aed",tok_curly_braces:"#059669",tok_pipes:"#0891b2",tok_at_sign:"#e11d48",muted_text:"#64748b",surface:"#ffffff",success_bg:"#dcfce7",danger_bg:"#fee2e2",accent_bg:"#dbeafe",accent_title:"#1e3a8a",success_text:"#166534",error_text:"#991b1b",warning_text:"#92400e"}}),N({name:"nyx",display_name:"Nyx",description:"High-contrast theme tuned for the blueprint workflow.",tags:["builtin","editorial"],based_on:"dark",colors:{background:"#111113",text:"#f3f4f6",accent:"#f97316",button:"#c2410c",button_text:"#fff7ed",border:"#3f3f46",highlight:"#fb923c",window:"#18181b",tok_brackets:"#60a5fa",tok_asterisk:"#f472b6",tok_parentheses:"#f59e0b",tok_double_brackets:"#c084fc",tok_curly_braces:"#4ade80",tok_pipes:"#67e8f9",tok_at_sign:"#fb7185",muted_text:"#a1a1aa",surface:"#18181b",success_bg:"#052e16",danger_bg:"#431407",accent_bg:"#431407",accent_title:"#ffedd5",success_text:"#86efac",error_text:"#fdba74",warning_text:"#fed7aa"}}),N({name:"midnight",display_name:"Midnight",description:"Deep blue ocean theme with cyan accents.",tags:["builtin","dark","blue"],based_on:"dark",colors:{background:"#0a1929",text:"#b2d4f0",accent:"#00b4d8",button:"#014361",button_text:"#caf0f8",border:"#1d3557",highlight:"#48cae4",window:"#051923",tok_brackets:"#00b4d8",tok_asterisk:"#90e0ef",tok_parentheses:"#f48c06",tok_double_brackets:"#06ffa5",tok_curly_braces:"#00b4d8",tok_pipes:"#48cae4",tok_at_sign:"#f77f00",muted_text:"#6b8aa3",surface:"#0f2638",success_bg:"#1b4332",danger_bg:"#641220",accent_bg:"#014361",accent_title:"#48cae4",success_text:"#06ffa5",error_text:"#ff6b6b",warning_text:"#f48c06"}}),N({name:"ember",display_name:"Ember",description:"Warm theme with orange and amber tones.",tags:["builtin","warm","orange"],based_on:"dark",colors:{background:"#1a0f0a",text:"#ffd8b8",accent:"#ff6b35",button:"#c44536",button_text:"#fff8f0",border:"#5e1914",highlight:"#ff8c42",window:"#100a07",tok_brackets:"#ff6b35",tok_asterisk:"#ffa07a",tok_parentheses:"#ffb627",tok_double_brackets:"#7bed9f",tok_curly_braces:"#ff6348",tok_pipes:"#feca57",tok_at_sign:"#ff4757",muted_text:"#a67c52",surface:"#261612",success_bg:"#2d4a2b",danger_bg:"#5e1914",accent_bg:"#c44536",accent_title:"#ff8c42",success_text:"#7bed9f",error_text:"#ff4757",warning_text:"#feca57"}}),N({name:"forest",display_name:"Forest",description:"Natural green theme inspired by woodland twilight.",tags:["builtin","green","nature"],based_on:"dark",colors:{background:"#0d1b0f",text:"#d4f1d4",accent:"#4ecca3",button:"#2d5f3f",button_text:"#e8f5e8",border:"#1e4620",highlight:"#7bed9f",window:"#081108",tok_brackets:"#4ecca3",tok_asterisk:"#7bed9f",tok_parentheses:"#ffd93d",tok_double_brackets:"#6bcf7f",tok_curly_braces:"#48c774",tok_pipes:"#95e1d3",tok_at_sign:"#f8b500",muted_text:"#6b8f71",surface:"#152518",success_bg:"#2d5f3f",danger_bg:"#5c2a2a",accent_bg:"#2d5f3f",accent_title:"#7bed9f",success_text:"#95e1d3",error_text:"#ff6b6b",warning_text:"#ffd93d"}}),N({name:"mono",display_name:"Monochrome",description:"Clean grayscale theme for minimal distraction.",tags:["builtin","minimal","grayscale"],based_on:"dark",colors:{background:"#1c1c1c",text:"#e0e0e0",accent:"#757575",button:"#424242",button_text:"#ffffff",border:"#505050",highlight:"#9e9e9e",window:"#141414",tok_brackets:"#bdbdbd",tok_asterisk:"#9e9e9e",tok_parentheses:"#757575",tok_double_brackets:"#e0e0e0",tok_curly_braces:"#a0a0a0",tok_pipes:"#c0c0c0",tok_at_sign:"#888888",muted_text:"#707070",surface:"#242424",success_bg:"#3a3a3a",danger_bg:"#2e2e2e",accent_bg:"#424242",accent_title:"#9e9e9e",success_text:"#c0c0c0",error_text:"#a0a0a0",warning_text:"#b0b0b0"}}),N({name:"solarized_dark",display_name:"Solarized Dark",description:"Popular Solarized color scheme with reduced eye strain.",tags:["builtin","dark","solarized"],based_on:"dark",colors:{background:"#002b36",text:"#839496",accent:"#268bd2",button:"#073642",button_text:"#eee8d5",border:"#586e75",highlight:"#2aa198",window:"#001e26",tok_brackets:"#dc322f",tok_asterisk:"#268bd2",tok_parentheses:"#cb4b16",tok_double_brackets:"#859900",tok_curly_braces:"#d33682",tok_pipes:"#2aa198",tok_at_sign:"#b58900",muted_text:"#586e75",surface:"#073642",success_bg:"#324d32",danger_bg:"#4d2626",accent_bg:"#073642",accent_title:"#2aa198",success_text:"#859900",error_text:"#dc322f",warning_text:"#b58900"}}),N({name:"trans_flag",display_name:"Trans Flag",description:"Soft cyan and pink palette with neutral dark surfaces.",tags:["builtin","support","bright"],based_on:"dark",colors:{background:"#2e2e2e",text:"#ffffff",accent:"#5bcefa",button:"#f5a9b8",button_text:"#2e2e2e",border:"#cccccc",highlight:"#5bcefa",window:"#3e3e3e",tok_brackets:"#5bcefa",tok_asterisk:"#f5a9b8",tok_parentheses:"#5bcefa",tok_double_brackets:"#f5a9b8",tok_curly_braces:"#ffffff",tok_pipes:"#5bcefa",tok_at_sign:"#f5a9b8",muted_text:"#cccccc",surface:"#3e3e3e",success_bg:"#5bcefa",danger_bg:"#f5a9b8",accent_bg:"#3e3e3e",accent_title:"#5bcefa",success_text:"#2e2e2e",error_text:"#2e2e2e",warning_text:"#2e2e2e"}}),N({name:"blood_for_the_blood_god",display_name:"Blood for the Blood God",description:"A blood red theme with bronze accents.",tags:["builtin","warhammer","chaos","khorne"],based_on:"dark",colors:{background:"#200000",text:"#ffcccc",accent:"#cd7f32",button:"#600000",button_text:"#ffcccc",border:"#400000",highlight:"#ff0000",window:"#200000",tok_brackets:"#e00000",tok_asterisk:"#c00000",tok_parentheses:"#a00000",tok_double_brackets:"#e00000",tok_curly_braces:"#c00000",tok_pipes:"#a00000",tok_at_sign:"#ff0000",muted_text:"#996666",surface:"#400000",success_bg:"#600000",danger_bg:"#800000",accent_bg:"#a06629",accent_title:"#cd7f32",success_text:"#ffcccc",error_text:"#ffcccc",warning_text:"#ffcccc"}}),N({name:"silent_king",display_name:"Silent King",description:"A near-black theme with tomb-world green glow.",tags:["builtin","warhammer","necron","green"],based_on:"dark",colors:{background:"#010a01",text:"#a0e0a0",accent:"#00ff00",button:"#004000",button_text:"#a0e0a0",border:"#002000",highlight:"#00ff00",window:"#010501",tok_brackets:"#00c000",tok_asterisk:"#00a000",tok_parentheses:"#008000",tok_double_brackets:"#00c000",tok_curly_braces:"#00a000",tok_pipes:"#008000",tok_at_sign:"#00ff00",muted_text:"#609060",surface:"#010a01",success_bg:"#004000",danger_bg:"#006000",accent_bg:"#004000",accent_title:"#00ff00",success_text:"#a0e0a0",error_text:"#a0e0a0",warning_text:"#a0e0a0"}}),N({name:"ultramar",display_name:"Ultramar",description:"Cerulean armor, parchment ivory, and gold command trim.",tags:["builtin","warhammer","space-marine","blue"],based_on:"dark",colors:{background:"#08172f",text:"#e8eef7",accent:"#d4a72c",button:"#12396b",button_text:"#f8fafc",border:"#245089",highlight:"#4da3ff",window:"#0b2140",tok_brackets:"#60a5fa",tok_asterisk:"#facc15",tok_parentheses:"#fb7185",tok_double_brackets:"#93c5fd",tok_curly_braces:"#67e8f9",tok_pipes:"#c084fc",tok_at_sign:"#f97316",muted_text:"#93a9c4",surface:"#102949",success_bg:"#163b2a",danger_bg:"#481818",accent_bg:"#3d2b05",accent_title:"#fde68a",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fde047"}}),N({name:"imperial_fists",display_name:"Imperial Fists",description:"Siege yellow palette with navy shadows and hazard-strip energy.",tags:["builtin","warhammer","space-marine","yellow"],based_on:"dark",colors:{background:"#1c1603",text:"#fff6cc",accent:"#ffd100",button:"#7c6200",button_text:"#fffbea",border:"#8e740f",highlight:"#ffe66d",window:"#241d05",tok_brackets:"#ffd100",tok_asterisk:"#60a5fa",tok_parentheses:"#fb923c",tok_double_brackets:"#fde68a",tok_curly_braces:"#facc15",tok_pipes:"#93c5fd",tok_at_sign:"#f87171",muted_text:"#c5b671",surface:"#302608",success_bg:"#2d3d1b",danger_bg:"#51210f",accent_bg:"#483701",accent_title:"#fff3a3",success_text:"#bef264",error_text:"#fca5a5",warning_text:"#fde047"}}),N({name:"raven_guard",display_name:"Raven Guard",description:"Matte black surfaces with pale steel highlights and a covert red ping.",tags:["builtin","warhammer","space-marine","stealth"],based_on:"dark",colors:{background:"#09090b",text:"#e7e5e4",accent:"#d4d4d8",button:"#18181b",button_text:"#fafafa",border:"#3f3f46",highlight:"#a1a1aa",window:"#0f1014",tok_brackets:"#e4e4e7",tok_asterisk:"#f87171",tok_parentheses:"#c084fc",tok_double_brackets:"#93c5fd",tok_curly_braces:"#86efac",tok_pipes:"#67e8f9",tok_at_sign:"#fb7185",muted_text:"#71717a",surface:"#14151a",success_bg:"#14231a",danger_bg:"#3f1014",accent_bg:"#20232a",accent_title:"#f4f4f5",success_text:"#86efac",error_text:"#fda4af",warning_text:"#fdba74"}}),N({name:"salamanders",display_name:"Salamanders",description:"Volcanic green palette with lava orange contrast.",tags:["builtin","warhammer","space-marine","green"],based_on:"dark",colors:{background:"#08130e",text:"#d9f4dd",accent:"#ff7a00",button:"#1c5b34",button_text:"#f7fff8",border:"#2f7d4e",highlight:"#34d399",window:"#0d1d16",tok_brackets:"#4ade80",tok_asterisk:"#fb923c",tok_parentheses:"#facc15",tok_double_brackets:"#86efac",tok_curly_braces:"#22c55e",tok_pipes:"#2dd4bf",tok_at_sign:"#f97316",muted_text:"#7ca58a",surface:"#11251b",success_bg:"#123825",danger_bg:"#4a1d11",accent_bg:"#4a2205",accent_title:"#fdba74",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde047"}}),N({name:"iron_warriors",display_name:"Iron Warriors",description:"Gunmetal, hazard yellow, and industrial rust.",tags:["builtin","warhammer","chaos","industrial"],based_on:"dark",colors:{background:"#101114",text:"#d8d7d2",accent:"#facc15",button:"#3a3d42",button_text:"#fffce8",border:"#5a5f69",highlight:"#fde047",window:"#17191d",tok_brackets:"#facc15",tok_asterisk:"#fb7185",tok_parentheses:"#fb923c",tok_double_brackets:"#d4d4d8",tok_curly_braces:"#93c5fd",tok_pipes:"#67e8f9",tok_at_sign:"#f97316",muted_text:"#8f9098",surface:"#20242a",success_bg:"#243326",danger_bg:"#48211a",accent_bg:"#43370a",accent_title:"#fef08a",success_text:"#86efac",error_text:"#fdba74",warning_text:"#fde047"}}),N({name:"mechanicus_brass",display_name:"Mechanicus Brass",description:"Mars red, soot black, and worn brass for forge-heavy work.",tags:["builtin","warhammer","mechanicus","red"],based_on:"dark",colors:{background:"#130909",text:"#f1d9c3",accent:"#c98b2b",button:"#611616",button_text:"#fff4e6",border:"#7f2a1d",highlight:"#e2a74a",window:"#1a0d0d",tok_brackets:"#f87171",tok_asterisk:"#fbbf24",tok_parentheses:"#fdba74",tok_double_brackets:"#fca5a5",tok_curly_braces:"#fcd34d",tok_pipes:"#93c5fd",tok_at_sign:"#fb7185",muted_text:"#a98a75",surface:"#251212",success_bg:"#1f3424",danger_bg:"#4c1515",accent_bg:"#3f2610",accent_title:"#f6d28b",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fcd34d"}}),N({name:"sororitas_rose",display_name:"Sororitas Rose",description:"Ivory, cathedral black, and stained-glass crimson.",tags:["builtin","warhammer","imperium","gothic"],based_on:"dark",colors:{background:"#141112",text:"#f7ede8",accent:"#b91c1c",button:"#3c1318",button_text:"#fff7f5",border:"#6d2730",highlight:"#fb7185",window:"#1b1718",tok_brackets:"#fda4af",tok_asterisk:"#facc15",tok_parentheses:"#fdba74",tok_double_brackets:"#f5f5f4",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#ef4444",muted_text:"#b2a29c",surface:"#231d1f",success_bg:"#203326",danger_bg:"#4b1319",accent_bg:"#3b1016",accent_title:"#fecdd3",success_text:"#bbf7d0",error_text:"#fecaca",warning_text:"#fdba74"}}),N({name:"cadia_stands",display_name:"Cadia Stands",description:"Military olive, field khaki, and disciplined gold signals.",tags:["builtin","warhammer","imperium","guard"],based_on:"dark",colors:{background:"#11160f",text:"#e6ecd8",accent:"#c8a54b",button:"#3a4b2a",button_text:"#f8faee",border:"#556a3e",highlight:"#a3c76d",window:"#171d14",tok_brackets:"#a3c76d",tok_asterisk:"#facc15",tok_parentheses:"#fb923c",tok_double_brackets:"#d9f99d",tok_curly_braces:"#86efac",tok_pipes:"#93c5fd",tok_at_sign:"#f87171",muted_text:"#99a58b",surface:"#20281b",success_bg:"#243624",danger_bg:"#4a2218",accent_bg:"#3e3413",accent_title:"#f5e6b1",success_text:"#bbf7d0",error_text:"#fca5a5",warning_text:"#fde68a"}}),N({name:"krieg_ash",display_name:"Krieg Ash",description:"Trenchcoat slate, muddy blue, and mask-lens amber.",tags:["builtin","warhammer","imperium","guard"],based_on:"dark",colors:{background:"#101417",text:"#dae1e5",accent:"#d1a449",button:"#3a4854",button_text:"#f6f7f8",border:"#55616c",highlight:"#9db7c7",window:"#151b20",tok_brackets:"#93c5fd",tok_asterisk:"#facc15",tok_parentheses:"#fb923c",tok_double_brackets:"#cbd5e1",tok_curly_braces:"#86efac",tok_pipes:"#67e8f9",tok_at_sign:"#f87171",muted_text:"#8e9aa3",surface:"#1d242a",success_bg:"#233127",danger_bg:"#48231c",accent_bg:"#3f3118",accent_title:"#f4deb1",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde68a"}}),N({name:"thousand_sons",display_name:"Thousand Sons",description:"Arcane cobalt with turquoise sorcery and gilded trim.",tags:["builtin","warhammer","chaos","arcane"],based_on:"dark",colors:{background:"#081427",text:"#dce9ff",accent:"#22d3ee",button:"#12335f",button_text:"#f0f9ff",border:"#1d4f91",highlight:"#7dd3fc",window:"#0d1b35",tok_brackets:"#38bdf8",tok_asterisk:"#facc15",tok_parentheses:"#fb7185",tok_double_brackets:"#67e8f9",tok_curly_braces:"#a78bfa",tok_pipes:"#22d3ee",tok_at_sign:"#f97316",muted_text:"#96a9c6",surface:"#132346",success_bg:"#14312c",danger_bg:"#451b2f",accent_bg:"#10354d",accent_title:"#cffafe",success_text:"#99f6e4",error_text:"#f9a8d4",warning_text:"#fde047"}}),N({name:"drukhari_raid",display_name:"Drukhari Raid",description:"Poison teal, blade violet, and void-black lacquer.",tags:["builtin","warhammer","aeldari","neon"],based_on:"dark",colors:{background:"#09070f",text:"#ece7ff",accent:"#14b8a6",button:"#2c1144",button_text:"#f5f3ff",border:"#5b21b6",highlight:"#5eead4",window:"#100b1a",tok_brackets:"#2dd4bf",tok_asterisk:"#c084fc",tok_parentheses:"#f472b6",tok_double_brackets:"#67e8f9",tok_curly_braces:"#a78bfa",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#9d94b8",surface:"#170f25",success_bg:"#123028",danger_bg:"#43162e",accent_bg:"#102f31",accent_title:"#ccfbf1",success_text:"#99f6e4",error_text:"#f9a8d4",warning_text:"#f0abfc"}}),N({name:"ork_waaagh",display_name:"Ork Waaagh!",description:"Scrap metal, noisy green, and red-goes-fasta contrast.",tags:["builtin","warhammer","ork","high-energy"],based_on:"dark",colors:{background:"#11140c",text:"#e2f5b8",accent:"#67e01f",button:"#734116",button_text:"#fff7ed",border:"#4b5f1a",highlight:"#84cc16",window:"#181d10",tok_brackets:"#84cc16",tok_asterisk:"#ef4444",tok_parentheses:"#f97316",tok_double_brackets:"#bef264",tok_curly_braces:"#facc15",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#9eb279",surface:"#232813",success_bg:"#26401d",danger_bg:"#5a2314",accent_bg:"#293a12",accent_title:"#d9f99d",success_text:"#d9f99d",error_text:"#fdba74",warning_text:"#fde047"}}),N({name:"tau_sept",display_name:"Tau Sept",description:"Clean ochre, alloy grey, and cool interface blue.",tags:["builtin","warhammer","tau","clean"],based_on:"dark",colors:{background:"#11161a",text:"#e8edf0",accent:"#f59e0b",button:"#41525f",button_text:"#f8fafc",border:"#617688",highlight:"#7dd3fc",window:"#161d23",tok_brackets:"#93c5fd",tok_asterisk:"#fbbf24",tok_parentheses:"#fb923c",tok_double_brackets:"#cbd5e1",tok_curly_braces:"#67e8f9",tok_pipes:"#38bdf8",tok_at_sign:"#f97316",muted_text:"#9aa8b2",surface:"#202930",success_bg:"#1e3430",danger_bg:"#4a2218",accent_bg:"#41320c",accent_title:"#fde68a",success_text:"#99f6e4",error_text:"#fdba74",warning_text:"#fde047"}}),N({name:"tyranid_hive",display_name:"Tyranid Hive",description:"Bone chitin, toxic magenta, and abyssal carapace purple.",tags:["builtin","warhammer","tyranid","organic"],based_on:"dark",colors:{background:"#120c18",text:"#f3e8ff",accent:"#f472b6",button:"#3f1b4d",button_text:"#fff7fb",border:"#6b2d78",highlight:"#f9a8d4",window:"#1a1222",tok_brackets:"#f5d0fe",tok_asterisk:"#fb7185",tok_parentheses:"#fdba74",tok_double_brackets:"#e9d5ff",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#f43f5e",muted_text:"#b7a3c4",surface:"#24182f",success_bg:"#243321",danger_bg:"#4f1733",accent_bg:"#441a3d",accent_title:"#fbcfe8",success_text:"#bef264",error_text:"#fda4af",warning_text:"#fdba74"}}),N({name:"genestealer_cult",display_name:"Genestealer Cult",description:"Industrial violet with warning pink and cult neon accents.",tags:["builtin","warhammer","tyranid","industrial"],based_on:"dark",colors:{background:"#0f1020",text:"#ede9fe",accent:"#8b5cf6",button:"#312e81",button_text:"#f5f3ff",border:"#5b4bc4",highlight:"#c084fc",window:"#151730",tok_brackets:"#a78bfa",tok_asterisk:"#fb7185",tok_parentheses:"#f97316",tok_double_brackets:"#ddd6fe",tok_curly_braces:"#67e8f9",tok_pipes:"#c084fc",tok_at_sign:"#f43f5e",muted_text:"#a6a1c9",surface:"#1d2040",success_bg:"#203229",danger_bg:"#47152a",accent_bg:"#2e255d",accent_title:"#e9d5ff",success_text:"#99f6e4",error_text:"#fda4af",warning_text:"#fdba74"}}),N({name:"golden_throne",display_name:"Golden Throne",description:"Black marble, relic gold, and cathedral ivory.",tags:["builtin","warhammer","imperium","gold"],based_on:"dark",colors:{background:"#110f0d",text:"#f6efe2",accent:"#d4af37",button:"#4a3510",button_text:"#fffbeb",border:"#6f5521",highlight:"#f6d365",window:"#171411",tok_brackets:"#fcd34d",tok_asterisk:"#fda4af",tok_parentheses:"#fdba74",tok_double_brackets:"#fef3c7",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#f87171",muted_text:"#b3a58d",surface:"#231e18",success_bg:"#253224",danger_bg:"#472119",accent_bg:"#433311",accent_title:"#fef3c7",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde68a"}})];class Q{constructor(e){this.executor=e}readers=[];onComplete;onError;controller=new AbortController;subscribe(e){return this.readers.push(e),this}onComplete_(e){return this.onComplete=e,this}onError_(e){return this.onError=e,this}async start(){try{await this.executor({emit:(e,t)=>this.emit(e,t),signal:this.controller.signal})}catch(e){if(this.controller.signal.aborted)return;this.emit("error",{error:e instanceof Error?e.message:"Stream failed"})}}abort(){this.controller.abort()}emit(e,t){const r={event:e,data:t};this.readers.forEach(n=>n(r)),r.event==="complete"&&this.onComplete&&this.onComplete(r.data),r.event==="error"&&this.onError&&this.onError(r.data.error)}}class O extends Error{constructor(e,t){super(t),this.status=e,this.name="APIError"}}function xs(a,e){if(typeof window>"u")return e;const t=Array.isArray(a)?[...a]:[a],[r,...n]=t;try{for(const s of t){const i=window.localStorage.getItem(s);if(!i)continue;const c=JSON.parse(i);return s!==r&&(window.localStorage.setItem(r,JSON.stringify(c)),n.forEach(l=>window.localStorage.removeItem(l))),c}}catch{return e}return e}function vs(a,e,t){typeof window>"u"||(window.localStorage.setItem(a,JSON.stringify(t)),e.forEach(r=>window.localStorage.removeItem(r)))}function tt(a){return a.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function rt(){return{...P.getConfig(),api_keys:P.getApiKeys()}}function _s(a){return a.engine_mode==="explicit"&&a.engine!=="auto"&&a.engine!=="openai_compatible"?a.engine:a.model?ft(a.model):void 0}function Ir(a){return Object.values(a).find(e=>typeof e=="string"&&e.trim().length>0)}function ks(a,e){const t=e[a];return typeof t=="string"&&t.trim().length>0?t:Ir(e)}function se(){return xs([Nr,...Pr],[])}function pe(a){vs(Nr,Pr,a)}function Fe(){return[...ws,...se()]}function Bt(a){typeof window>"u"||window.dispatchEvent(new CustomEvent(a))}function Ss(a,e,t=a){const r=t.reduce((n,s)=>{n.total_drafts+=1,s.favorite&&(n.favorites+=1);const i=s.genre||"unknown",c=s.mode||"unknown";return n.by_genre[i]=(n.by_genre[i]||0)+1,n.by_mode[c]=(n.by_mode[c]||0)+1,n},{total_drafts:0,favorites:0,by_genre:{},by_mode:{}});return{drafts:a,total:e,stats:r}}function Ts(a,e){let t=[...a];if(e?.search){const c=e.search.toLowerCase();t=t.filter(l=>[l.character_name,l.seed,l.genre,l.notes].filter(Boolean).some(u=>String(u).toLowerCase().includes(c)))}e?.genre&&(t=t.filter(c=>c.genre===e.genre)),e?.mode&&(t=t.filter(c=>c.mode===e.mode)),e?.favorite!==void 0&&(t=t.filter(c=>c.favorite===e.favorite)),e?.tags?.length&&(t=t.filter(c=>e.tags?.every(l=>c.tags?.includes(l))));const r=e?.sort_order==="asc"?1:-1,n=e?.sort_by??"modified";t.sort((c,l)=>{const u=n==="name"?c.character_name||c.seed||"":(n==="created"?c.created:c.modified)||"",d=n==="name"?l.character_name||l.seed||"":(n==="created"?l.created:l.modified)||"";return u.localeCompare(d)*r});const s=e?.offset??0,i=e?.limit;return i!==void 0?t=t.slice(s,s+i):s>0&&(t=t.slice(s)),t}function Ht(a){const e=[],t=Se(a.metadata.template_name)||gt;return ar(t).filter(n=>n.required).forEach(n=>{a.assets[n.name]?.trim()||e.push(`- missing required asset ${n.name}`)}),Object.entries(a.assets).forEach(([n,s])=>{if(!s.trim()){e.push(`- ${n}: asset is empty`);return}const i=nr(n,s);i.length>0&&e.push(`- ${n}: ${Array.from(new Set(i)).join(", ")}`)}),e.length===0?e.push("OK: no obvious placeholder violations found in saved assets."):e.unshift("VALIDATION FAILED"),{path:a.metadata.review_id,output:e.join(`
`),errors:"",exit_code:e[0]==="VALIDATION FAILED"?1:0,success:e[0]!=="VALIDATION FAILED"}}function Gt(a){const e=`${a.metadata.character_name||""}
${a.metadata.seed}
${Object.values(a.assets).join(`
`)}`.toLowerCase().replace(/[^a-z0-9\s]+/g," ").split(/\s+/).filter(t=>t.length>3);return new Set(e)}function Es(a){return a>=.7?"high":a>=.45?"medium":"low"}function As(a,e){const t=Gt(a),r=Gt(e),n=[...t].filter(p=>r.has(p)),s=[...t].filter(p=>!r.has(p)),i=[...r].filter(p=>!t.has(p)),c=new Set([...t,...r]).size||1,l=n.length/c,u=Math.min(1,(s.length+i.length)/Math.max(c,1)),d=Math.min(1,l+.15);return{character1_name:a.metadata.character_name||a.metadata.seed,character2_name:e.metadata.character_name||e.metadata.seed,overall_score:l,compatibility:Es(l),conflict_potential:u,synergy_potential:d,commonalities:n.slice(0,8),differences:[...s.slice(0,4),...i.slice(0,4)],relationship_suggestions:l>=.6?["Shared themes suggest an easy alliance arc.","Overlapping traits support collaborative scenes."]:["Use the contrast between their goals for tension.","Differences suggest rivalry or uneasy partnership."],meta_analysis:{archetype_match:l,narrative_compatibility:d,audience_appeal:Math.max(l,.35)}}}function Cs(a){const e=new Map;a.forEach(l=>{l.parent_drafts?.forEach(u=>{const d=e.get(u)??[];d.push(l.review_id),e.set(u,d)})});const t=new Map(a.map(l=>[l.review_id,l])),r=new Map,n=l=>{if(r.has(l))return r.get(l);const u=t.get(l);if(!u?.parent_drafts?.length)return r.set(l,0),0;const d=1+Math.max(...u.parent_drafts.map(p=>n(p)));return r.set(l,d),d},s=a.map(l=>{const u=l.parent_drafts??[],d=e.get(l.review_id)??[],p=n(l.review_id),h=u.map(y=>t.get(y)?.character_name||y),g=d.map(y=>t.get(y)?.character_name||y);return{id:l.review_id,review_id:l.review_id,draft_name:l.seed,character_name:l.character_name||l.seed,generation:p,is_root:u.length===0,is_leaf:d.length===0,offspring_type:l.offspring_type,mode:l.mode,model:l.model,created:l.created,parent_ids:u,child_ids:d,parent_names:h,child_names:g,sibling_names:u.flatMap(y=>(e.get(y)??[]).filter(x=>x!==l.review_id)).map(y=>t.get(y)?.character_name||y),num_ancestors:u.length,num_descendants:d.length}}),i=s.filter(l=>l.is_root).map(l=>l.id),c=s.reduce((l,u)=>Math.max(l,u.generation),0);return{nodes:s,roots:i,max_generation:c,stats:{total_characters:s.length,root_characters:s.filter(l=>l.is_root).length,leaf_characters:s.filter(l=>l.is_leaf).length,generations:c+1}}}function ke(a,e,t){return{blob:new Blob([a],{type:t}),filename:e,contentType:t}}function Wt(a){return a.replace(/^##/gm,"\\##")}async function Kt(a){const e=P.getConfig(),t=P.getApiKeys(),r=_s(e);return he({model:e.model,apiKey:r?t[r]:Ir(t),apiKeys:t,provider:r,baseUrl:e.base_url,temperature:e.temperature,maxTokens:e.max_tokens}).generateStream(a)}class Ns{themesSyncPromise=null;draftsSyncPromise=null;async fetchOpenAICompatibleModels(e,t,r){const n=`${r}/models`,s=me(e,t),i=await fetch(n,{method:"GET",headers:s});if(!i.ok){let u=`HTTP ${i.status}`;try{const d=await i.json();typeof d.error=="string"?u=d.error:d.error?.message&&(u=d.error.message)}catch{}throw new O(i.status,u)}const l=((await i.json()).data||[]).filter(u=>!!u?.id).map(u=>({id:u.id,name:u.name||u.id,provider:e,context_length:u.context_length,supports_vision:u.architecture?.input_modalities?.includes("image")||!1,supports_tools:u.supported_parameters?.includes("tools")||!1}));return{provider:e,models:l,cached:!1}}async loadProviderModels(e,t=!1){const r=P.getApiKeys(),n=P.getConfig(),s=e,i=n.base_url||Yn(s),c=ks(e,r),l=`${e}|${i}|${c?"auth":"anon"}`,u=Me.get(l);if(!t&&u&&Date.now()-u.cachedAt<ys)return{...u.response,cached:!0};const d=(Dt[s]||[]).map(h=>({id:h,name:h,provider:e})),p=["openrouter","openai","deepseek","zai","moonshot"].includes(e);if(!c||!p){const h={provider:e,models:d,cached:!0,error:c||p?void 0:"Provider model listing is not available in browser mode."};return Me.set(l,{response:h,cachedAt:Date.now()}),h}try{const h=await this.fetchOpenAICompatibleModels(e,c,i);return Me.set(l,{response:h,cachedAt:Date.now()}),h}catch(h){const y=h instanceof TypeError&&h.message==="Failed to fetch"?"Network request blocked. This may be due to browser privacy settings (common in EU), ad blockers, or firewall restrictions. Try disabling tracking protection for this site or using a different network.":h instanceof Error?h.message:"Failed to load models",x={provider:e,models:d,cached:!0,error:y};return Me.set(l,{response:x,cachedAt:Date.now()}),x}}async getConfig(){return rt()}getConfigSnapshot(){return rt()}getThemesSnapshot(){return Fe()}async updateConfig(e){const t={...e};return e.api_keys&&(P.setApiKeys(e.api_keys),delete t.api_keys),P.updateConfig(t),I("config"),this.getConfig()}async testConnection(e){const t=P.getApiKeys()[e.provider];if(!t)return{success:!1,error:`No API key configured for ${e.provider}`};const r=e.model||Dt[e.provider]?.[0]||rt().model;return he({model:r,apiKey:t,provider:e.provider,baseUrl:e.base_url}).testConnection()}async syncThemesFromServer(){return this.themesSyncPromise?this.themesSyncPromise:(this.themesSyncPromise=(async()=>{if(!v.isEnabled()||!v.hasAccessToken())return!1;try{const{themes:e}=await v.syncThemes("pull"),t=se();let r=!1;for(const n of e){if(n.isBuiltin)continue;const s={name:n.name,display_name:n.displayName||n.name,description:n.description||"",author:n.author||"",tags:n.tags,based_on:n.basedOn||"",is_builtin:!1,colors:n.colors},i=t.findIndex(c=>c.name===n.name);i>=0?JSON.stringify(t[i])!==JSON.stringify(s)&&(t[i]=s,r=!0):(t.push(s),r=!0)}return r&&(pe(t),Bt(ht)),r}catch(e){return console.warn("Failed to sync themes from server:",e),!1}finally{this.themesSyncPromise=null}})(),this.themesSyncPromise)}async syncDraftsFromServer(){return this.draftsSyncPromise?this.draftsSyncPromise:(this.draftsSyncPromise=(async()=>{if(!v.isEnabled()||!v.hasAccessToken())return!1;try{const{drafts:e}=await v.syncDrafts("pull");let t=!1;for(const r of e){const n=await j.getDraft(r.reviewId);if(!n){await j.saveDraft({path:r.reviewId,metadata:{review_id:r.reviewId,seed:r.seed,mode:r.mode,model:r.model,character_name:r.characterName,template_name:r.templateName,genre:r.genre,notes:r.notes,favorite:r.favorite,tags:r.tags,offspring_type:r.offspringType},assets:r.assets}),t=!0;continue}const s=new Date(n.metadata.modified||0).getTime();new Date(r.updatedAt).getTime()>s&&(await j.saveDraft({path:n.path,metadata:{...n.metadata,seed:r.seed,mode:r.mode,model:r.model,character_name:r.characterName,template_name:r.templateName,genre:r.genre,notes:r.notes,favorite:r.favorite,tags:r.tags,offspring_type:r.offspringType},assets:r.assets}),t=!0)}return t&&Bt(mt),t}catch(e){return console.warn("Failed to sync drafts from server:",e),!1}finally{this.draftsSyncPromise=null}})(),this.draftsSyncPromise)}async getThemes(){return this.syncThemesFromServer(),this.getThemesSnapshot()}async createTheme(e){const t=se();if(Fe().some(n=>n.name===e.name))throw new O(409,`Theme ${e.name} already exists`);const r={...e,description:e.description||"",author:e.author||"",tags:e.tags||[],based_on:e.based_on||"",is_builtin:!1};return t.push(r),pe(t),I("themes"),r}async exportTheme(e){const t=Fe().find(r=>r.name===e);if(!t)throw new O(404,`Theme ${e} not found`);return ke(JSON.stringify(t,null,2),`${tt(e)}.json`,"application/json")}async importTheme(e,t={}){const n={...JSON.parse(await e.text()),is_builtin:!1},s=se(),i=s.findIndex(c=>c.name===n.name);if(i>=0)if(t.conflict_strategy==="overwrite")s[i]=n;else if(t.conflict_strategy==="rename")n.name=t.target_name||`${n.name}_copy`,s.push(n);else throw new O(409,`Theme ${n.name} already exists`);else s.push(n);return pe(s),I("themes"),n}async updateTheme(e,t){const r=se(),n=r.findIndex(s=>s.name===e);if(n<0)throw new O(404,`Theme ${e} is builtin or missing`);return r[n]={...r[n],...t},pe(r),I("themes"),r[n]}async duplicateTheme(e,t){const r=Fe().find(n=>n.name===e);if(!r)throw new O(404,`Theme ${e} not found`);return this.createTheme({name:t.new_name,display_name:t.display_name||r.display_name,description:t.description||r.description,author:t.author||r.author,tags:t.tags||r.tags,based_on:t.based_on||r.name,colors:r.colors})}async renameTheme(e,t){return this.updateTheme(e,{display_name:t.display_name,...t.new_name!==e?{}:{}}).then(r=>{const n=se(),s=n.findIndex(i=>i.name===e);if(s<0)throw new O(404,`Theme ${e} is builtin or missing`);return n[s]={...r,name:t.new_name},pe(n),I("themes"),n[s]})}async deleteTheme(e){const t=se().filter(r=>r.name!==e);return pe(t),I("themes"),{status:"deleted",name:e}}async getModels(e){return this.loadProviderModels(e,!1)}async refreshModels(e){const t=await this.loadProviderModels(e,!0);return{status:"ok",model_count:t.models.length,error:t.error}}async generateSeeds(e){const t=[];for await(const r of X.generateSeeds(e))r.type==="complete"&&r.content&&t.push(...r.content.split(`
`).map(n=>n.trim()).filter(Boolean));return{seeds:[...new Set(t)]}}async getTemplates(){if(v.isEnabled()&&v.hasAccessToken())try{const{templates:e}=await v.syncTemplates("pull"),t=ie();for(const r of e)t.find(s=>s.template.name===r.name)||t.push({template:{name:r.name,version:r.version,description:r.description||"",is_official:r.is_official,is_default:r.is_default,assets:r.assets},blueprint_contents:r.blueprint_contents});De(t)}catch(e){console.warn("Failed to sync templates from server:",e)}return _t().map(e=>e.template)}async listTemplates(){return this.getTemplates()}async getTemplate(e){const t=Y(e);if(!t)throw new O(404,`Template ${e} not found`);return t.template}async getTemplateBlueprintContents(e){const t=Y(e);if(!t)throw new O(404,`Template ${e} not found`);return{blueprint_contents:t.blueprint_contents}}async createTemplate(e){const t=ie();if(t.some(s=>s.template.name===e.name))throw new O(409,`Template ${e.name} already exists`);const r={name:e.name,version:e.version,description:e.description,assets:e.assets,is_official:!1},n={template:r,blueprint_contents:e.blueprint_contents};return t.push(n),De(t),I("templates"),r}async updateTemplate(e,t){const r=ie(),n=r.findIndex(s=>s.template.name===e);if(n<0){if(!Y(e))throw new O(404,`Template ${e} not found`);const i=gs(t.name,e);return this.createTemplate({...t,name:i})}if(t.name!==e){const s=Y(t.name);if(s&&s.template.name!==e)throw new O(409,`Template ${t.name} already exists`)}return r[n]={template:{name:t.name,version:t.version,description:t.description,assets:t.assets,is_official:!1},blueprint_contents:t.blueprint_contents},De(r),I("templates"),r[n].template}async deleteTemplate(e){const t=ie().filter(r=>r.template.name!==e);return De(t),I("templates"),{status:"deleted",name:e}}async duplicateTemplate(e,t){const r=Y(e);if(!r)throw new O(404,`Template ${e} not found`);return this.createTemplate({name:t.name,version:t.version||r.template.version,description:r.template.description,assets:r.template.assets,blueprint_contents:r.blueprint_contents})}async validateTemplate(e){const t=Y(e);if(!t)throw new O(404,`Template ${e} not found`);const r=Fn(t.template),n=t.template.assets.filter(s=>!t.blueprint_contents[s.blueprint_file||`${s.name}.md`]).map(s=>`Missing blueprint content for ${s.name}`);return{errors:r.errors,warnings:n}}async exportTemplate(e){const t=_a(e)??Y(e);if(!t)throw new O(404,`Template ${e} not found`);return ke(JSON.stringify(t,null,2),`${tt(e)}.json`,"application/json")}async importTemplate(e){const t=JSON.parse(await e.text());if("template"in t&&t.template){const r=t;return this.createTemplate({name:r.template.name,version:r.template.version,description:r.template.description,assets:r.template.assets,blueprint_contents:r.blueprint_contents})}return this.createTemplate({name:t.name||e.name.replace(/\.[^.]+$/,""),version:t.version||"1.0",description:t.description||"",assets:t.assets||[],blueprint_contents:t.blueprint_contents||{}})}async getDrafts(e){const t=await j.getAllMetadata();this.syncDraftsFromServer();const r=Ts(t,e);return Ss(r,r.length,t)}async listDrafts(e){return this.getDrafts(e)}async getDraft(e){const t=await j.getDraft(e);if(!t)throw new O(404,`Draft ${e} not found`);return t}async updateMetadata(e,t){return await j.updateMetadata(e,t),I("drafts"),{status:"updated",draft_id:e}}async deleteDraft(e){return await j.deleteDraft(e),I("drafts"),{status:"deleted",draft_id:e}}async updateAsset(e,t,r){return await j.updateAsset(e,t,r),I("drafts"),{status:"updated",draft_id:e,asset_name:t}}async validateDraft(e){const t=await this.getDraft(e);return Ht(t)}async validatePath(e){const t=e.path.trim().replace(/^drafts\//,""),r=await j.getDraft(t);return r?Ht(r):{path:e.path,output:`VALIDATION FAILED
- Browser-only mode can validate saved IndexedDB drafts by review ID only.`,errors:"",exit_code:1,success:!1}}generate(e){return new Q(async({emit:t,signal:r})=>{for await(const n of X.generate(e,{signal:r})){if(r.aborted)return;if(n.type==="chunk"&&t("chunk",{content:n.content||""}),n.type==="complete"){const s=n.asset||"",i=s?await j.getDraft(s):null;t("complete",{draft_path:s,draft_id:s,character_name:i?.metadata.character_name,duration_ms:0})}n.type==="error"&&t("error",{error:n.error||"Generation failed"})}})}generateAsset(e){return new Q(async({emit:t,signal:r})=>{for await(const n of X.generateAsset(e)){if(r.aborted)return;n.type==="chunk"&&t("chunk",{content:n.content||""}),n.type==="asset"&&t("complete",{asset_name:e.asset_name,content:n.content||""}),n.type==="error"&&t("error",{error:n.error||"Asset generation failed"})}})}previewBlueprint(e){return new Q(async({emit:t,signal:r})=>{for await(const n of X.previewBlueprint(e)){if(r.aborted)return;n.type==="chunk"&&t("chunk",{content:n.content||""}),n.type==="asset"&&t("complete",{asset_name:e.asset_name,content:n.content||"",system_prompt:n.systemPrompt||"",user_prompt:n.userPrompt||""}),n.type==="error"&&t("error",{error:n.error||"Blueprint preview failed"})}})}async finalizeGeneration(e){const t=crypto.randomUUID(),r=Ke(e.assets,e.template),n={path:t,metadata:{review_id:t,seed:e.seed,mode:e.mode,model:P.getConfig().model,created:new Date().toISOString(),modified:new Date().toISOString(),favorite:!1,template_name:e.template,character_name:r},assets:e.assets};return await j.saveDraft(n),I("drafts"),{draft_path:t,draft_id:t,character_name:r,duration_ms:0}}generateBatch(e,t){return new Q(async({emit:r,signal:n})=>{const s=async(i,c)=>{r("batch_start",{index:c,seed:i});try{let l="";for await(const u of X.generate({seed:i,mode:t.mode,template:t.template},{signal:n})){if(n.aborted)return;u.type==="complete"&&(l=u.asset||"")}r("batch_complete",{index:c,seed:i,draft_path:l})}catch(l){r("batch_error",{index:c,seed:i,error:l instanceof Error?l.message:"Batch generation failed"})}};if(t.parallel){let i=0;const c=Math.min(Math.max(t.max_concurrent??3,1),e.length||1);await Promise.all(Array.from({length:c},async()=>{for(;!n.aborted;){const l=i;if(i+=1,l>=e.length)return;await s(e[l],l)}}))}else for(let i=0;i<e.length;i+=1){if(n.aborted)return;await s(e[i],i)}n.aborted||r("complete",{status:"done"})})}async getLineage(){const e=await j.getAllMetadata();return Cs(e)}async analyzeSimilarity(e){const t=await this.getDraft(e.draft1_id),r=await this.getDraft(e.draft2_id),n=As(t,r);if(!e.include_llm_analysis)return n;try{const s=await X.analyzeSimilarity(e.draft1_id,e.draft2_id),i=Array.isArray(s.story_opportunities)?s.story_opportunities.map(u=>String(u)).slice(0,4):n.relationship_suggestions,c=Array.isArray(s.scene_suggestions)?s.scene_suggestions.map(u=>String(u)).slice(0,3):n.relationship_suggestions,l=[s.narrative_dynamics,s.relationship_arc].filter(u=>typeof u=="string"&&u.trim().length>0).join(`

`)||(typeof s.raw=="string"?s.raw:"LLM analysis unavailable.");return{...n,relationship_suggestions:c,llm_analysis:{relationship_potential:l,conflict_areas:n.differences.slice(0,4),synergy_areas:n.commonalities.slice(0,4),story_hooks:i}}}catch{return n}}generateOffspring(e){return new Q(async({emit:t,signal:r})=>{for await(const n of X.generateOffspring(e,{signal:r})){if(r.aborted)return;if(n.type==="status"&&t("status",{stage:n.stage,asset:n.asset,progress:n.progress}),n.type==="chunk"&&t("chunk",{content:n.content||""}),n.type==="complete"){const s=n.asset||"",i=s?await j.getDraft(s):null;t("complete",{draft_id:s,character_name:i?.metadata.character_name})}n.type==="error"&&t("error",{error:n.error||"Offspring generation failed"})}})}generateOffspringSeed(e){return new Q(async({emit:t,signal:r})=>{for await(const n of X.generateOffspringSeed(e,{signal:r})){if(r.aborted)return;n.type==="status"&&t("status",{stage:n.stage,asset:n.asset,progress:n.progress}),n.type==="chunk"&&t("chunk",{content:n.content||""}),n.type==="complete"&&t("complete",{content:n.content||""}),n.type==="error"&&t("error",{error:n.error||"Offspring seed generation failed"})}})}async getExportPresets(){return bs}async exportDraft(e){const t=await this.getDraft(e.draft_id),r=e.preset||"json",n=e.include_metadata!==!1,s=tt(t.metadata.character_name||t.metadata.seed||t.metadata.review_id);if(r==="text"){const i=Object.entries(t.assets).map(([c,l])=>`## ${c}

${Wt(l)}`).join(`

`);return ke(i,`${s}.txt`,"text/plain")}if(r==="combined"){const i=[`# ${t.metadata.character_name||t.metadata.seed}`,n?`## Metadata

${JSON.stringify(t.metadata,null,2)}`:"",...Object.entries(t.assets).map(([c,l])=>`## ${c}

${Wt(l)}`)].filter(Boolean);return ke(i.join(`

`),`${s}.md`,"text/markdown")}return ke(JSON.stringify({metadata:n?t.metadata:void 0,assets:t.assets},null,2),`${s}.json`,"application/json")}async getBlueprints(){if(v.isEnabled()&&v.hasAccessToken())try{const{blueprints:t}=await v.syncBlueprints("list"),r=Z();for(const n of t)n.isBuiltin||r.set(n.path,{name:n.name,description:n.description,invokable:n.invokable,version:n.version,content:n.content,path:n.path,category:n.category})}catch(t){console.warn("Failed to sync blueprints from server:",t)}const e=[...Z().values()];return{core:e.filter(t=>t.category==="core"),system:e.filter(t=>t.category==="system"),templates:{local:e.filter(t=>t.category==="template")},examples:e.filter(t=>t.category==="example")}}async getBlueprint(e){const t=Z().get(e);if(!t)throw new O(404,`Blueprint ${e} not found`);return t}async updateBlueprint(e,t){if(Ue(e)!==null&&!fr(e)){const s=fs(e,t),i=wa(s.name||e,e);return this.createBlueprint(i,t)}const n=ee();return n[e]=t,xe(n),I("blueprints"),this.getBlueprint(e)}async deleteBlueprint(e){if(Ue(e)!==null)throw new O(400,`Cannot delete built-in blueprint ${e}`);const t=ee();return delete t[e],xe(t),I("blueprints"),{status:"deleted",path:e}}async resetBlueprint(e){const t=ee();delete t[e],xe(t),I("blueprints");const r=this.getBlueprint(e);if(!r)throw new O(404,`Blueprint ${e} not found`);return r}async createBlueprint(e,t){if(Z().get(e))throw new O(409,`Blueprint ${e} already exists`);const n=ee();return n[e]=t,xe(n),I("blueprints"),this.getBlueprint(e)}async duplicateBlueprint(e,t){const r=Z().get(e);if(!r)throw new O(404,`Source blueprint ${e} not found`);if(Z().get(t))throw new O(409,`Blueprint ${t} already exists`);const s=ee();return s[t]=r.content,xe(s),I("blueprints"),this.getBlueprint(t)}hasBlueprintOverride(e){return xa(e)}getOriginalBlueprintContent(e){return Ue(e)}chat(e){return new Q(async({emit:t,signal:r})=>{const n=e.draft_id?await j.getDraft(e.draft_id):null,s=[n?`Current draft metadata: ${JSON.stringify(n.metadata)}`:"",e.context_asset&&n?.assets[e.context_asset]?`Focused asset (${e.context_asset}):
${n.assets[e.context_asset]}`:"",e.screen_context?`Screen context: ${JSON.stringify(e.screen_context)}`:""].filter(Boolean),i=[{role:"system",content:"You are the in-app assistant for Eidolon Simulacra, a browser-only blueprint compiler. Be concise and practical. Use provided draft or screen context when relevant."},...s.length>0?[{role:"system",content:s.join(`

`)}]:[],...e.messages],c=await Kt(i);let l="";for await(const u of c){if(r.aborted)return;if(u.content&&(l+=u.content,t("chunk",{content:u.content})),u.done)break}t("complete",{content:l})})}refine(e){return new Q(async({emit:t,signal:r})=>{const n=await this.getDraft(e.draft_id),s=n.assets[e.asset];if(!s)throw new O(404,`Asset ${e.asset} not found in draft`);const i=[{role:"system",content:"Rewrite the provided asset according to the user request. Return only the revised asset content with no extra commentary."},{role:"user",content:`Draft seed: ${n.metadata.seed}
Asset: ${e.asset}

Current content:
${s}

Revision request:
${e.message}`}],c=await Kt(i);let l="";for await(const u of c){if(r.aborted)return;if(u.content&&(l+=u.content,t("chunk",{content:u.content})),u.done)break}t("complete",{content:l})})}}const z=new Ns;function W(...a){return ln(dn(a))}const Ps=m.createContext(null);function Is({children:a}){const[e,t]=m.useState({ownerId:null,screenContext:{},serializedContext:""}),r=m.useCallback((i,c,l)=>{t(u=>u.ownerId===i&&u.serializedContext===l?u:{ownerId:i,screenContext:c,serializedContext:l})},[]),n=m.useCallback(i=>{t(c=>c.ownerId!==i||c.ownerId===null&&c.serializedContext===""?c:{ownerId:null,screenContext:{},serializedContext:""})},[]),s=m.useMemo(()=>({screenContext:e.screenContext,setScreenContext:r,clearScreenContext:n}),[n,r,e.screenContext]);return o.jsx(Ps.Provider,{value:s,children:a})}function Os({entry:a,topics:e,isOpen:t,onClose:r}){return o.jsxs(o.Fragment,{children:[t&&o.jsx("div",{className:"fixed inset-0 z-30 bg-black/40 backdrop-blur-sm",onClick:r}),o.jsxs("aside",{className:`fixed right-0 top-0 z-40 flex h-dvh w-full max-w-xl flex-col border-l border-border bg-card/95 shadow-2xl backdrop-blur-md transition-transform duration-300 ease-out ${t?"translate-x-0":"translate-x-full"}`,"aria-hidden":!t,children:[o.jsxs("div",{className:"flex items-start justify-between gap-4 border-b border-border/60 p-5",children:[o.jsxs("div",{children:[o.jsx("p",{className:"text-xs font-semibold uppercase tracking-[0.16em] text-primary",children:"Contextual Help"}),o.jsx("h2",{className:"mt-2 text-xl font-semibold text-foreground",children:a.title}),o.jsx("p",{className:"mt-2 text-sm leading-6 text-muted-foreground",children:a.summary})]}),o.jsx("button",{type:"button",onClick:r,className:"rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",children:o.jsx(Te,{className:"h-5 w-5"})})]}),o.jsxs("div",{className:"min-h-0 flex-1 space-y-6 overflow-y-auto p-5",children:[o.jsxs("section",{className:"rounded-2xl border border-border/60 bg-background/40 p-4",children:[o.jsxs("div",{className:"flex items-center gap-2 text-foreground",children:[o.jsx(Rr,{className:"h-4 w-4 text-primary"}),o.jsx("h3",{className:"font-semibold",children:"What to do on this page"})]}),o.jsx("div",{className:"mt-4 space-y-3",children:a.keyActions.map(n=>o.jsxs("div",{className:"flex items-start gap-3 text-sm text-muted-foreground",children:[o.jsx("div",{className:"mt-2 h-1.5 w-1.5 rounded-full bg-primary"}),o.jsx("p",{className:"leading-6",children:n})]},n))})]}),o.jsxs("section",{className:"rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4",children:[o.jsxs("div",{className:"flex items-center gap-2 text-foreground",children:[o.jsx(Lr,{className:"h-4 w-4 text-amber-500"}),o.jsx("h3",{className:"font-semibold",children:"Common mistakes to avoid"})]}),o.jsx("div",{className:"mt-4 space-y-3",children:a.pitfalls.map(n=>o.jsxs("div",{className:"flex items-start gap-3 text-sm text-muted-foreground",children:[o.jsx("div",{className:"mt-2 h-1.5 w-1.5 rounded-full bg-amber-500"}),o.jsx("p",{className:"leading-6",children:n})]},n))})]}),o.jsxs("section",{className:"rounded-2xl border border-border/60 bg-background/40 p-4",children:[o.jsx("h3",{className:"font-semibold text-foreground",children:"Useful next steps"}),o.jsxs("div",{className:"mt-4 flex flex-wrap gap-3",children:[o.jsxs(B,{to:"/help",onClick:r,className:"inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:["Open Help Center",o.jsx(Ct,{className:"h-4 w-4"})]}),a.actions.map(n=>o.jsxs(B,{to:n.to,onClick:r,className:"inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:[n.label,o.jsx(Ct,{className:"h-4 w-4"})]},`${a.id}-${n.to}`))]})]}),e.length>0&&o.jsxs("section",{className:"space-y-4",children:[o.jsx("h3",{className:"text-lg font-semibold text-foreground",children:"Related help topics"}),o.jsx("div",{className:"space-y-3",children:e.map(n=>o.jsxs("article",{className:"rounded-2xl border border-border/60 bg-background/40 p-4",children:[o.jsx("div",{className:"flex items-center justify-between gap-3",children:o.jsxs("div",{children:[o.jsx("p",{className:"text-xs font-semibold uppercase tracking-[0.14em] text-primary",children:n.category}),o.jsx("h4",{className:"mt-1 font-semibold text-foreground",children:n.title})]})}),o.jsx("p",{className:"mt-2 text-sm leading-6 text-muted-foreground",children:n.summary}),o.jsx("div",{className:"mt-3 space-y-2",children:n.bullets.slice(0,2).map(s=>o.jsxs("div",{className:"flex items-start gap-3 text-sm text-muted-foreground",children:[o.jsx("div",{className:"mt-2 h-1.5 w-1.5 rounded-full bg-primary"}),o.jsx("p",{className:"leading-6",children:s})]},s))})]},n.id))})]})]})]})]})}const Et="eidolon.web.activeTour";function js(){try{const a=sessionStorage.getItem(Et);if(!a)return null;const e=JSON.parse(a),t=Be(e.activeTourId);return!t||e.activeStepIndex<0||e.activeStepIndex>=t.steps.length?null:e}catch{return null}}function zt(){try{sessionStorage.removeItem(Et)}catch{}}const Or=m.createContext(null);function Ds({children:a}){const e=un(),t=Ne(),r=js(),[n,s]=m.useState(r?.activeTourId??null),[i,c]=m.useState(r?.activeStepIndex??0),[l,u]=m.useState(()=>P.getHelpState()),d=()=>{u(P.getHelpState())};m.useEffect(()=>{if(!n){zt();return}try{sessionStorage.setItem(Et,JSON.stringify({activeTourId:n,activeStepIndex:i}))}catch{}},[i,n]),m.useEffect(()=>{const _=()=>{d()};return window.addEventListener(Ge,_),()=>{window.removeEventListener(Ge,_)}},[]);const p=async _=>{if(_.to!=="/drafts/"||(_.matchMode??"exact")!=="prefix")return _.to;if(t.pathname.startsWith("/drafts/"))return t.pathname;try{const F=(await z.getDrafts()).drafts[0]?.review_id;return F?`/drafts/${encodeURIComponent(F)}`:"/drafts"}catch{return"/drafts"}},h=async(_,M)=>{const F=Be(_),f=F?.steps[M];!F||!f||(s(_),c(M),ot(t.pathname,f)||e(await p(f)))},g=_=>{h(_,0)},y=_=>{const F={completed_tours:l.completed_tours.filter(f=>f!==_)};_===st&&(F.first_run_completed=!1,F.completed_guides=l.completed_guides.filter(f=>f!==Ot)),P.updateHelpState(F),I("config"),d(),h(_,0)},x=()=>{zt(),s(null),c(0)},R=()=>{n&&h(n,i)},A=()=>{!n||i===0||h(n,i-1)},H=()=>{if(!n)return;const M={completed_tours:Array.from(new Set([...l.completed_tours,n]))};n===st&&(M.first_run_completed=!0,M.completed_guides=Array.from(new Set([...l.completed_guides,Ot]))),P.updateHelpState(M),I("config"),d(),x()},U=()=>{if(!n)return;const _=Be(n);if(!_){x();return}if(i>=_.steps.length-1){H();return}h(n,i+1)},G=_=>{const M=Array.from(new Set([...l.dismissed_tips,_]));P.updateHelpState({dismissed_tips:M}),I("config"),d()},te=m.useMemo(()=>({tours:tr,activeTourId:n,activeStepIndex:i,helpState:l,startTour:g,restartTour:y,closeTour:x,goToCurrentStep:R,goToNextStep:U,goToPreviousStep:A,finishTour:H,isTourCompleted:_=>l.completed_tours.includes(_),dismissTip:G}),[i,n,l]);return o.jsx(Or.Provider,{value:te,children:a})}function Rs(){const a=m.useContext(Or);if(!a)throw new Error("useGuidedTour must be used within GuidedTourProvider");return a}const Ls='[data-guided-tour-active="true"]';function Ms(){const a=Ne(),{activeTourId:e,activeStepIndex:t,closeTour:r,goToCurrentStep:n,goToNextStep:s,goToPreviousStep:i}=Rs(),[c,l]=m.useState(!1),u=e?Be(e):null,d=u?.steps[t]??null;if(m.useEffect(()=>{if(document.querySelector(Ls)?.removeAttribute("data-guided-tour-active"),!d){l(!1);return}if(!ot(a.pathname,d)||!d.targetId){l(!1);return}const x=document.querySelector(`[data-tour-anchor="${d.targetId}"]`);if(!x){l(!1);return}return x.setAttribute("data-guided-tour-active","true"),x.scrollIntoView({behavior:"smooth",block:"center",inline:"nearest"}),l(!0),()=>{x.removeAttribute("data-guided-tour-active")}},[d,a.pathname]),!u||!d)return null;const p=ot(a.pathname,d),h=t===u.steps.length-1;return o.jsxs(o.Fragment,{children:[o.jsx("div",{className:"fixed inset-0 z-[70] bg-black/55",onClick:r}),o.jsxs("section",{className:"fixed inset-x-3 bottom-3 z-[80] max-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-2xl shadow-black/40 backdrop-blur-md sm:inset-x-auto sm:right-4 sm:w-[28rem]",children:[o.jsxs("div",{className:"flex items-start justify-between gap-4 border-b border-border/50 px-5 py-4",children:[o.jsxs("div",{children:[o.jsx("p",{className:"text-xs font-semibold uppercase tracking-[0.16em] text-primary",children:"Guided Tour"}),o.jsx("h2",{className:"mt-1 text-lg font-semibold text-foreground",children:u.title}),o.jsxs("p",{className:"mt-1 text-sm text-muted-foreground",children:["Step ",t+1," of ",u.steps.length]})]}),o.jsx("button",{type:"button",onClick:r,className:"rounded-lg border border-border/60 bg-background/50 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary","aria-label":"Close guided tour",children:o.jsx(Te,{className:"h-4 w-4"})})]}),o.jsxs("div",{className:"max-h-[calc(100dvh-12rem)] overflow-y-auto px-5 py-4",children:[o.jsxs("div",{className:"rounded-2xl border border-primary/20 bg-primary/5 p-4",children:[o.jsxs("div",{className:"flex items-center gap-2 text-sm font-medium text-primary",children:[o.jsx(Mr,{className:"h-4 w-4"}),d.routeLabel]}),o.jsx("h3",{className:"mt-2 text-xl font-semibold text-foreground",children:d.title}),o.jsx("p",{className:"mt-2 text-sm leading-6 text-muted-foreground",children:d.description})]}),o.jsxs("div",{className:"mt-4 rounded-2xl border border-border/50 bg-background/40 p-4",children:[o.jsxs("div",{className:"flex items-center gap-2 text-sm font-medium text-foreground",children:[o.jsx(Fr,{className:"h-4 w-4 text-primary"}),p?"You are on the expected page.":`This step expects ${d.routeLabel}.`]}),!p&&o.jsxs("button",{type:"button",onClick:n,className:"mt-3 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:["Return to this step",o.jsx(Ee,{className:"h-4 w-4"})]})]}),d.targetLabel&&p&&o.jsxs("div",{className:"mt-4 rounded-2xl border border-border/50 bg-background/40 p-4",children:[o.jsxs("div",{className:"flex items-center gap-2 text-sm font-medium text-foreground",children:[o.jsx(Ur,{className:"h-4 w-4 text-primary"}),c?`Highlighted target: ${d.targetLabel}`:`Looking for ${d.targetLabel}`]}),o.jsx("p",{className:"mt-2 text-sm leading-6 text-muted-foreground",children:c?"The active control or section has been outlined on the page so you can orient yourself without hunting for it.":"If the highlighted target is not visible yet, stay on this page and give the layout a moment to settle."})]}),o.jsx("div",{className:"mt-4 space-y-3",children:d.bullets.map(g=>o.jsxs("div",{className:"flex items-start gap-3 rounded-xl border border-border/50 bg-background/40 p-4 text-sm text-muted-foreground",children:[o.jsx($r,{className:"mt-0.5 h-4 w-4 shrink-0 text-primary"}),o.jsx("p",{className:"leading-6",children:g})]},g))})]}),o.jsxs("div",{className:"flex items-center justify-between gap-3 border-t border-border/50 px-5 py-4",children:[o.jsxs("button",{type:"button",onClick:i,disabled:t===0,className:"inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50",children:[o.jsx(Br,{className:"h-4 w-4"}),"Previous"]}),o.jsxs("div",{className:"flex items-center gap-3",children:[o.jsx("button",{type:"button",onClick:r,className:"inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:"Leave tour"}),o.jsxs("button",{type:"button",onClick:s,className:"inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",children:[h?"Finish tour":"Next step",o.jsx(Ee,{className:"h-4 w-4"})]})]})]})]})]})}function Fs({drafts:a,isLoading:e}){const r=Ne().pathname.match(/^\/drafts\/([^/]+)$/),n=r?decodeURIComponent(r[1]):null,[s,i]=m.useState(""),[c,l]=m.useState(!1),[u,d]=m.useState(!1),[p,h]=m.useState(""),[g,y]=m.useState(""),[x,R]=m.useState("modified"),[A,H]=m.useState("desc"),{genres:U,modes:G}=m.useMemo(()=>{const f=new Set,k=new Set;return a.forEach(C=>{C.genre&&f.add(C.genre),C.mode&&k.add(C.mode)}),{genres:Array.from(f).sort(),modes:Array.from(k).sort()}},[a]),te=m.useMemo(()=>{let f=[...a];if(s){const k=s.toLowerCase();f=f.filter(C=>C.character_name?.toLowerCase().includes(k)||C.seed.toLowerCase().includes(k)||C.template_name?.toLowerCase().includes(k)||C.notes?.toLowerCase().includes(k))}return u&&(f=f.filter(k=>k.favorite)),p&&(f=f.filter(k=>k.mode===p)),g&&(f=f.filter(k=>k.genre===g)),f.sort((k,C)=>{let re=0;switch(x){case"created":{const V=k.created?new Date(k.created).getTime():0,ne=C.created?new Date(C.created).getTime():0;re=V-ne;break}case"modified":{const V=k.modified?new Date(k.modified).getTime():k.created?new Date(k.created).getTime():0,ne=C.modified?new Date(C.modified).getTime():C.created?new Date(C.created).getTime():0;re=V-ne;break}case"name":{const V=k.character_name||k.seed,ne=C.character_name||C.seed;re=V.localeCompare(ne);break}}return A==="asc"?re:-re}),f},[a,s,u,p,g,x,A]),_=s||u||p||g,M=()=>{i(""),d(!1),h(""),y("")},F=m.useMemo(()=>{const f=a.length,k=a.filter(C=>C.favorite).length;return{total:f,favorites:k}},[a]);return o.jsxs("div",{className:"flex h-full min-h-0 min-w-0 flex-col overflow-hidden",children:[o.jsxs("div",{className:"border-b border-border/60 px-3 py-3",children:[o.jsx("h3",{className:"text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:"Draft Library"}),o.jsxs("div",{className:"mt-2 flex items-center gap-3 text-xs text-muted-foreground",children:[o.jsxs("span",{children:[F.total," drafts"]}),o.jsxs("span",{className:"flex items-center gap-1",children:[o.jsx(Hr,{className:"h-3 w-3"}),F.favorites]})]})]}),o.jsx("div",{className:"border-b border-border/40 px-3 py-2",children:o.jsxs("div",{className:"relative",children:[o.jsx(Gr,{className:"absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"}),o.jsx("input",{type:"text",placeholder:"Search drafts...",value:s,onChange:f=>i(f.target.value),className:"w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-8 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"}),s&&o.jsx("button",{type:"button",onClick:()=>i(""),className:"absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",children:o.jsx(Te,{className:"h-3.5 w-3.5"})})]})}),o.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-3 py-2",children:[o.jsxs("button",{type:"button",onClick:()=>l(!c),className:W("flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",c||_?"bg-primary/10 text-primary":"text-muted-foreground hover:text-foreground hover:bg-accent/50"),children:[o.jsx(Wr,{className:"h-3.5 w-3.5"}),"Filters",_&&o.jsx("span",{className:"rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground",children:[s&&"search",u&&"fav",p&&"mode",g&&"genre"].filter(Boolean).length})]}),o.jsxs("div",{className:"flex max-w-full items-center gap-1",children:[o.jsxs("select",{value:x,onChange:f=>R(f.target.value),className:"max-w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none",children:[o.jsx("option",{value:"modified",children:"Modified"}),o.jsx("option",{value:"created",children:"Created"}),o.jsx("option",{value:"name",children:"Name"})]}),o.jsx("button",{type:"button",onClick:()=>H(A==="asc"?"desc":"asc"),className:"rounded-md border border-input p-1 hover:bg-accent/50",title:A==="asc"?"Ascending":"Descending",children:A==="asc"?o.jsx(Kr,{className:"h-3.5 w-3.5 text-muted-foreground"}):o.jsx(zr,{className:"h-3.5 w-3.5 text-muted-foreground"})})]})]}),c&&o.jsxs("div",{className:"border-b border-border/40 bg-muted/30 px-3 py-2 space-y-2",children:[o.jsxs("label",{className:"flex items-center gap-2 text-xs",children:[o.jsx("input",{type:"checkbox",checked:u,onChange:f=>d(f.target.checked),className:"rounded border-input"}),o.jsx(Nt,{className:"h-3.5 w-3.5 text-yellow-500"}),"Favorites only"]}),G.length>0&&o.jsxs("div",{className:"space-y-1",children:[o.jsx("label",{className:"text-xs text-muted-foreground",children:"Mode"}),o.jsxs("select",{value:p,onChange:f=>h(f.target.value),className:"w-full rounded-md border border-input bg-background px-2 py-1 text-xs",children:[o.jsx("option",{value:"",children:"All modes"}),G.map(f=>o.jsx("option",{value:f,children:f},f))]})]}),U.length>0&&o.jsxs("div",{className:"space-y-1",children:[o.jsx("label",{className:"text-xs text-muted-foreground",children:"Genre"}),o.jsxs("select",{value:g,onChange:f=>y(f.target.value),className:"w-full rounded-md border border-input bg-background px-2 py-1 text-xs",children:[o.jsx("option",{value:"",children:"All genres"}),U.map(f=>o.jsx("option",{value:f,children:f},f))]})]}),_&&o.jsx("button",{type:"button",onClick:M,className:"w-full rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground",children:"Clear all filters"})]}),o.jsx("div",{className:"min-h-0 flex-1 overflow-y-auto overflow-x-hidden",children:e?o.jsx("div",{className:"p-4 text-center text-xs text-muted-foreground",children:"Loading drafts..."}):te.length===0?o.jsxs("div",{className:"p-4 text-center",children:[o.jsx(Xt,{className:"mx-auto h-8 w-8 text-muted-foreground/50"}),o.jsx("p",{className:"mt-2 text-xs text-muted-foreground",children:_?"No drafts match filters":"No drafts yet"}),_&&o.jsx("button",{type:"button",onClick:M,className:"mt-2 text-xs text-primary hover:underline",children:"Clear filters"})]}):o.jsx("div",{className:"space-y-1 p-2",children:te.map(f=>{const k=n===f.review_id;return o.jsx(B,{to:`/drafts/${encodeURIComponent(f.review_id)}`,className:W("group block rounded-lg border p-2 transition-all",k?"border-primary bg-primary/10":"border-transparent hover:border-border/60 hover:bg-accent/40"),children:o.jsxs("div",{className:"flex min-w-0 items-start justify-between gap-2",children:[o.jsxs("div",{className:"min-w-0 flex-1",children:[o.jsxs("div",{className:"flex items-center gap-1.5",children:[o.jsx("span",{className:"truncate text-sm font-medium",children:f.character_name||f.seed}),f.favorite&&o.jsx(Nt,{className:"h-3 w-3 shrink-0 fill-yellow-500 text-yellow-500"})]}),o.jsxs("div",{className:"mt-0.5 flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground",children:[f.mode&&o.jsxs("span",{className:"inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5",children:[o.jsx(nt,{className:"h-2.5 w-2.5"}),f.mode]}),f.template_name&&o.jsx("span",{className:"truncate",children:f.template_name})]}),(f.created||f.modified)&&o.jsxs("div",{className:"mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/70",children:[o.jsx(qr,{className:"h-2.5 w-2.5"}),new Date(f.modified||f.created||"").toLocaleDateString()]})]}),f.tags&&f.tags.length>0&&o.jsxs("div",{className:"flex max-w-[8rem] shrink-0 flex-wrap justify-end gap-0.5 overflow-hidden",children:[f.tags.slice(0,2).map(C=>o.jsx("span",{className:"rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground",children:C},C)),f.tags.length>2&&o.jsxs("span",{className:"text-[9px] text-muted-foreground",children:["+",f.tags.length-2]})]})]})},f.review_id)})})})]})}const Us=[{path:"/",label:"Home",icon:Xr},{path:"/generate",label:"Generate",icon:at},{path:"/drafts",label:"Library",icon:Qr},{path:"/templates",label:"Templates",icon:Xt},{path:"/themes",label:"Themes",icon:Zr},{path:"/settings",label:"Settings",icon:en}],qt=[{path:"/lineage",label:"Lineage",icon:Qt},{path:"/offspring",label:"Offspring",icon:Vr}],Vt=[{path:"/worlds",label:"Worlds",icon:Zt},{path:"/timelines",label:"Timeline",icon:Qt},{path:"/events",label:"Events",icon:Yr}];function $s({path:a,label:e,icon:t,isActive:r,onClick:n}){return o.jsxs(B,{to:a,onClick:n,className:W("group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",r?"bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20":"text-muted-foreground hover:bg-accent/50 hover:text-foreground"),children:[o.jsx(t,{className:W("h-5 w-5 transition-transform duration-200",r?"scale-110":"group-hover:scale-110")}),o.jsx("span",{children:e}),r&&o.jsx("div",{className:"absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 -z-10"})]})}function Yt({label:a,icon:e,items:t,isActive:r,isExpanded:n,onToggle:s,onNavigate:i,draftsCount:c,seedsCount:l}){const u=Ne(),d=n?an:Ee;return o.jsxs("div",{className:"space-y-1",children:[o.jsxs("button",{type:"button",onClick:s,className:W("group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",r?"bg-accent/50 text-foreground":"text-muted-foreground hover:bg-accent/50 hover:text-foreground"),children:[o.jsxs("div",{className:"flex items-center gap-3",children:[o.jsx(e,{className:"h-5 w-5 transition-transform duration-200 group-hover:scale-110"}),o.jsx("span",{children:a}),(c>0||l>0)&&o.jsxs("div",{className:"flex items-center gap-1.5",children:[c>0&&o.jsxs("span",{className:"rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary",children:[c," drafts"]}),l>0&&o.jsxs("span",{className:"rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400",children:[l," seeds"]})]})]}),o.jsx(d,{className:"h-4 w-4 transition-transform duration-200"})]}),n&&o.jsx("div",{className:"ml-4 space-y-1 border-l border-border pl-2",children:t.map(p=>{const h=u.pathname===p.path;return o.jsxs(B,{to:p.path,onClick:i,className:W("group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",h?"bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/20":"text-muted-foreground hover:bg-accent/50 hover:text-foreground"),children:[o.jsx(p.icon,{className:"h-4 w-4"}),o.jsx("span",{children:p.label})]},p.path)})})]})}function Bs({children:a}){const e=Ne(),t=er(),r=e.pathname.match(/^\/drafts\/([^/]+)$/),n=r?decodeURIComponent(r[1]):null,[s,i]=m.useState(!1),[c,l]=m.useState(!1),[u,d]=m.useState(!1),[p,h]=m.useState(null),[g,y]=m.useState(!1),[x,R]=m.useState(!1),[A,H]=m.useState("dynamic"),U=m.useMemo(()=>Sn(e.pathname),[e.pathname]),G=m.useMemo(()=>vn.filter(w=>U?.relatedTopicIds.includes(w.id)),[U]),te=oe({queryKey:["drafts"],queryFn:()=>z.getDrafts()}),{data:_}=te,{data:M}=oe({queryKey:["draft",n],queryFn:()=>z.getDraft(n||""),enabled:!!n}),{data:F}=oe({queryKey:["templates"],queryFn:()=>z.getTemplates(),enabled:e.pathname.startsWith("/templates")}),{data:f}=oe({queryKey:["themes"],queryFn:()=>z.getThemes(),enabled:e.pathname.startsWith("/themes")}),{data:k}=oe({queryKey:["blueprints"],queryFn:()=>z.getBlueprints(),enabled:e.pathname.startsWith("/blueprints")}),[C,re]=m.useState(()=>fe().length),V=_?.drafts?.length??0;m.useEffect(()=>{const w=()=>{t.invalidateQueries({queryKey:["drafts"]})};return window.addEventListener(mt,w),()=>{window.removeEventListener(mt,w)}},[t]);const ne=m.useMemo(()=>{if(e.pathname.startsWith("/drafts")){const S=[{id:"drafts",title:"Library Tray",emptyLabel:"No drafts available yet.",items:(_?.drafts||[]).slice(0,16).map(D=>({id:D.review_id,label:D.character_name||D.seed,description:`${D.template_name||"Default"} • ${D.mode}`,to:`/drafts/${encodeURIComponent(D.review_id)}`,badge:n&&n===D.review_id?"Open":D.favorite?"Fav":void 0}))}];if(n){const D=Object.keys(M?.assets||{}).map(At=>({id:At,label:At.replace(/_/g," "),description:"Asset in current draft"}));S.push({id:"review-assets",title:"Current Draft Assets",emptyLabel:"No assets loaded for this draft.",items:D})}return S}return e.pathname.startsWith("/templates")?[{id:"templates",title:"Template Tray",emptyLabel:"No templates available.",items:(F||[]).slice(0,16).map(S=>({id:S.name,label:S.name,description:S.description||"Template definition",badge:S.is_default?"Default":void 0}))}]:e.pathname.startsWith("/themes")?[{id:"themes",title:"Theme Tray",emptyLabel:"No theme presets available.",items:(f||[]).slice(0,16).map(S=>({id:S.name,label:S.display_name,description:S.description||S.name,badge:S.is_builtin?"Built-in":"Custom"}))}]:e.pathname.startsWith("/blueprints")?[{id:"blueprints",title:"Blueprint Tray",emptyLabel:"No blueprints found.",items:[...k?.core||[],...k?.system||[],...k?.templates?.local||[],...k?.examples||[]].slice(0,18).map(D=>({id:D.path,label:D.name,description:D.path}))}]:e.pathname.startsWith("/generate")?[{id:"generate",title:"Generate Tray",emptyLabel:"No generation actions available.",items:[{id:"gen-drafts",label:"Library",description:`${V} drafts available`,to:"/drafts"},{id:"gen-seeds",label:"Favorite seeds",description:`${C} saved`,to:"/seed-generator"},{id:"gen-templates",label:"Template manager",description:"Switch template packs",to:"/templates"}]}]:[{id:"general",title:"Shortcuts",emptyLabel:"No shortcuts available.",items:[{id:"nav-seeds",label:"Seed Generator",to:"/seed-generator"},{id:"nav-validation",label:"Validation",to:"/validation"},{id:"nav-batch",label:"Batch",to:"/batch"},{id:"nav-compare",label:"Compare",to:"/similarity"},{id:"nav-blueprints",label:"Blueprints",to:"/blueprints"},{id:"nav-themes",label:"Theme Studio",to:"/themes"}]}]},[e.pathname,_?.drafts,V,n,M?.assets,F,f,k,C]),jr=m.useMemo(()=>Tn.filter(w=>w.status!=="implemented").flatMap(w=>w.items.slice(0,3).map((S,D)=>({id:`${w.id}-${D}`,title:S.length>60?S.slice(0,60)+"...":S,category:w.title,status:w.status}))).slice(0,12),[]),Ye=qt.map(w=>w.path).includes(e.pathname),Je=Vt.map(w=>w.path).includes(e.pathname);m.useEffect(()=>{Ye&&!g&&y(!0)},[Ye,g]),m.useEffect(()=>{Je&&!x&&R(!0)},[Je,x]);const Pe=m.useCallback(async()=>{if(v.isEnabled()){if(!v.hasAccessToken()){h({connected:!0,authenticated:!1});return}try{const w=await v.checkStatus();h(w),w.authenticated&&w.connected&&is()}catch{h({connected:!1,authenticated:!1})}}else h({connected:!1,authenticated:!1})},[]);return m.useEffect(()=>{Pe()},[Pe]),m.useEffect(()=>{const w=()=>{Pe()};return window.addEventListener(dt,w),()=>window.removeEventListener(dt,w)},[Pe]),m.useEffect(()=>{const w=()=>{I("config")};return window.addEventListener(Ge,w),()=>window.removeEventListener(Ge,w)},[]),m.useEffect(()=>{const w=()=>{re(fe().length)};return window.addEventListener(ut,w),window.addEventListener("storage",w),()=>{window.removeEventListener(ut,w),window.removeEventListener("storage",w)}},[]),m.useEffect(()=>{l(!1),d(!1)},[e.pathname]),o.jsx(Is,{children:o.jsx(Ds,{children:o.jsxs("div",{className:"app-shell flex min-h-dvh bg-background lg:h-screen",children:[s&&o.jsx("div",{className:"fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden",onClick:()=>i(!1)}),c&&o.jsx("div",{className:"fixed inset-0 z-30 bg-black/45 backdrop-blur-sm",onClick:()=>l(!1)}),o.jsx("aside",{className:W("fixed inset-y-0 left-0 z-50 w-[min(20rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] bg-card/80 backdrop-blur-md border-r border-border transition-transform duration-300 ease-out lg:static lg:w-72 lg:max-w-none lg:translate-x-0","app-sidebar",s?"translate-x-0":"-translate-x-full"),children:o.jsxs("div",{className:"flex h-dvh flex-col lg:h-full",children:[o.jsxs("div",{className:"flex h-16 items-center justify-between border-b border-border/50 px-4",children:[o.jsxs(B,{to:"/",className:"flex items-center gap-2",onClick:()=>i(!1),children:[o.jsx("div",{className:"p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20",children:o.jsx(at,{className:"h-5 w-5 text-white"})}),o.jsxs("div",{className:"flex flex-col",children:[o.jsx("span",{className:"text-lg font-semibold tracking-tight text-foreground",style:{fontFamily:'"Space Grotesk", sans-serif'},children:"Eidolon"}),o.jsxs("span",{className:"text-[11px] uppercase tracking-[0.18em] text-muted-foreground",style:{fontFamily:'"IBM Plex Mono", monospace'},children:["Simulacra v","3.1.2"]})]})]}),o.jsx("button",{className:"lg:hidden p-2 rounded-lg hover:bg-accent transition-colors",onClick:()=>i(!1),children:o.jsx(Te,{className:"h-5 w-5"})})]}),o.jsxs("nav",{className:"flex-1 overflow-y-auto p-4 space-y-1",children:[o.jsx(Yt,{label:"Characters",icon:Jr,items:qt,isActive:Ye,isExpanded:g,onToggle:()=>y(!g),onNavigate:()=>i(!1),draftsCount:V,seedsCount:C}),o.jsx(Yt,{label:"Worlds",icon:Zt,items:Vt,isActive:Je,isExpanded:x,onToggle:()=>R(!x),onNavigate:()=>i(!1),draftsCount:0,seedsCount:0}),Us.map(w=>{const S=e.pathname===w.path;return o.jsx($s,{path:w.path,label:w.label,icon:w.icon,isActive:S,onClick:()=>i(!1)},w.path)})]}),p&&!p.authenticated&&v.isEnabled()&&o.jsx("div",{className:"px-4 py-3 border-t border-border/50",children:o.jsxs(B,{to:"/auth",onClick:()=>i(!1),className:"flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 px-4 py-3 text-sm font-medium text-foreground transition-all hover:from-primary/20 hover:to-accent/20 hover:border-primary/40",children:[o.jsx(tn,{className:"h-5 w-5 text-primary"}),o.jsxs("div",{className:"flex flex-col",children:[o.jsx("span",{className:"font-semibold",children:"Sign In"}),o.jsx("span",{className:"text-xs text-muted-foreground",children:"Sync your data"})]})]})}),p?.authenticated&&p.user&&o.jsx("div",{className:"px-4 py-3 border-t border-border/50",children:o.jsxs("div",{className:"flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3",children:[o.jsx("div",{className:"flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20",children:o.jsx(rn,{className:"h-4 w-4 text-green-600 dark:text-green-400"})}),o.jsxs("div",{className:"flex flex-col min-w-0",children:[o.jsx("span",{className:"text-sm font-medium truncate",children:p.user.displayName}),o.jsx("span",{className:"text-xs text-muted-foreground truncate",children:p.user.email})]})]})}),o.jsx("div",{className:"border-t border-border/50 p-4",children:o.jsxs("div",{className:"grid grid-cols-3 gap-2",children:[o.jsx(B,{to:"/settings",onClick:()=>i(!1),className:"rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary",children:"Settings"}),o.jsx(B,{to:"/help",onClick:()=>i(!1),className:"rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary",children:"Help"}),o.jsx(B,{to:"/about",onClick:()=>i(!1),className:"rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary",children:"About"})]})})]})}),o.jsxs("main",{className:"min-w-0 flex-1 overflow-auto",children:[o.jsxs("header",{className:"app-frame-panel sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/50 px-4 lg:hidden",children:[o.jsx("button",{onClick:()=>i(!0),className:"p-2 rounded-lg hover:bg-accent transition-colors",children:o.jsx(nn,{className:"h-6 w-6"})}),o.jsx("span",{className:"min-w-0 truncate text-base font-semibold tracking-tight text-foreground sm:text-lg",style:{fontFamily:'"Space Grotesk", sans-serif'},children:"Eidolon Simulacra"}),U&&o.jsxs("button",{type:"button",onClick:()=>d(!0),className:"ml-auto inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:[o.jsx(Pt,{className:"h-4 w-4"}),"Help"]})]}),o.jsx("div",{className:"mx-auto max-w-[1360px] p-5 lg:p-6",children:a})]}),U&&o.jsx(Os,{entry:U,topics:G,isOpen:u,onClose:()=>d(!1)}),o.jsxs("button",{type:"button",onClick:()=>l(!0),className:"fixed bottom-24 right-4 z-20 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/95 px-3 py-3 text-sm font-medium text-foreground shadow-xl shadow-black/20 backdrop-blur-md transition-colors hover:border-primary/40 hover:text-primary sm:px-4",children:[o.jsx(nt,{className:"h-4 w-4"}),o.jsx("span",{className:"hidden sm:inline",children:"Workspace"})]}),o.jsxs("aside",{className:W("fixed right-0 top-0 z-40 flex h-dvh w-full max-w-md flex-col border-l border-border/60 bg-card/95 shadow-2xl backdrop-blur-md transition-transform duration-300 ease-out",c?"translate-x-0":"translate-x-full"),"aria-hidden":!c,children:[o.jsxs("div",{className:"sticky top-0 z-10 border-b border-border/60 bg-card/90 backdrop-blur",children:[o.jsxs("div",{className:"flex items-center justify-between border-b border-border/40 px-4 py-3",children:[o.jsxs("div",{children:[o.jsx("p",{className:"text-[11px] font-semibold uppercase tracking-[0.16em] text-primary",children:"Utility Panel"}),o.jsx("p",{className:"mt-1 text-sm text-muted-foreground",children:"Shortcuts, context, and current work."})]}),o.jsx("button",{type:"button",onClick:()=>l(!1),className:"rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",children:o.jsx(Te,{className:"h-5 w-5"})})]}),U&&o.jsx("div",{className:"border-b border-border/40 px-4 py-3",children:o.jsxs("button",{type:"button",onClick:()=>{l(!1),d(!0)},className:"flex w-full items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:text-primary",children:[o.jsxs("div",{className:"min-w-0",children:[o.jsx("p",{className:"text-[11px] font-semibold uppercase tracking-[0.16em] text-primary",children:"Page Help"}),o.jsx("p",{className:"mt-1 truncate text-sm font-medium text-foreground",children:U.title})]}),o.jsx(Pt,{className:"h-4 w-4 shrink-0"})]})}),o.jsxs("div",{className:"flex border-b border-border/40",children:[o.jsxs("button",{type:"button",onClick:()=>H("dynamic"),className:W("flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors",A==="dynamic"?"border-b-2 border-primary text-primary":"text-muted-foreground hover:text-foreground"),children:[o.jsx(nt,{className:"h-3.5 w-3.5"}),"Dynamic"]}),o.jsxs("button",{type:"button",onClick:()=>H("whats-new"),className:W("flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors",A==="whats-new"?"border-b-2 border-primary text-primary":"text-muted-foreground hover:text-foreground"),children:[o.jsx(at,{className:"h-3.5 w-3.5"}),"New"]})]})]}),o.jsx("div",{className:"flex-1 overflow-y-auto p-4",children:A==="dynamic"?e.pathname.startsWith("/drafts")?o.jsx(Fs,{drafts:_?.drafts||[],isLoading:te.isLoading}):o.jsxs("div",{className:"space-y-3",children:[o.jsxs("div",{className:"px-1",children:[o.jsx("h3",{className:"text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:"Upcoming Features"}),o.jsx("p",{className:"mt-1 text-xs text-muted-foreground",children:"Planned improvements and new capabilities."})]}),jr.map(w=>o.jsxs("div",{className:"rounded-lg border border-border/70 bg-background/50 p-3",children:[o.jsx("div",{className:"flex items-start justify-between gap-2",children:o.jsx("span",{className:W("rounded-full px-2 py-0.5 text-[10px] font-semibold",w.status==="planned"?"bg-blue-500/15 text-blue-600 dark:text-blue-400":"bg-amber-500/15 text-amber-600 dark:text-amber-400"),children:w.status==="planned"?"Planned":"In Progress"})}),o.jsx("p",{className:"mt-2 text-sm text-foreground leading-snug",children:w.title}),o.jsx("p",{className:"mt-1.5 text-xs text-muted-foreground",children:w.category})]},w.id)),o.jsxs(B,{to:"/whats-new",onClick:()=>l(!1),className:"flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:["View Full Roadmap",o.jsx(Ee,{className:"h-4 w-4"})]})]}):o.jsx("div",{className:"space-y-4",children:ne.map(w=>o.jsxs("section",{className:"space-y-2",children:[o.jsx("h3",{className:"px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:w.title}),w.items.length===0?o.jsx("div",{className:"rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground",children:w.emptyLabel}):o.jsx("div",{className:"space-y-2",children:w.items.map(S=>{const D=o.jsxs(o.Fragment,{children:[o.jsxs("div",{className:"min-w-0 flex-1",children:[o.jsx("div",{className:"truncate text-sm font-medium",children:S.label}),S.description&&o.jsx("div",{className:"truncate text-xs text-muted-foreground",children:S.description})]}),S.badge&&o.jsx("span",{className:"rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground",children:S.badge}),S.to&&o.jsx(Ee,{className:"h-3.5 w-3.5 text-muted-foreground"})]});return S.to?o.jsx(B,{to:S.to,onClick:()=>l(!1),className:"flex items-center gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-accent/40",children:D},S.id):o.jsx("div",{className:"flex items-center gap-2 rounded-lg border border-border/70 bg-background/50 px-3 py-2",children:D},S.id)})})]},w.id))})})]}),o.jsx(Ms,{})]})})})}const Hs=m.lazy(()=>E(()=>import("./Home-CzBvUkUD.js"),__vite__mapDeps([0,1,2,3,4,5,6,7]))),Gs=m.lazy(()=>E(()=>import("./Generation-De_ysABZ.js"),__vite__mapDeps([8,1,2,3,9,4,10,11,12,5,6,7,13]))),Ws=m.lazy(()=>E(()=>import("./SeedGenerator-DAS3oev8.js"),__vite__mapDeps([14,1,2,3,4,12,13,9,5,6,7]))),Ks=m.lazy(()=>E(()=>import("./Validation-YjR5fAw5.js"),__vite__mapDeps([15,1,2,3,4,6,7,5]))),Jt=m.lazy(()=>E(()=>import("./Drafts-D6eGx1Ud.js"),__vite__mapDeps([16,1,2,3,17,18,19,5,6,7]))),zs=m.lazy(()=>E(()=>import("./Review-DNXu5BoO.js"),__vite__mapDeps([20,1,2,3,21,4,18,5,6,7]))),qs=m.lazy(()=>E(()=>import("./AssetRegenerator-D_kbvEmF.js"),__vite__mapDeps([11,1,2,3,9,12,4,5,6,7]))),Vs=m.lazy(()=>E(()=>import("./Blueprints-P4OvPA0N.js"),__vite__mapDeps([22,1,2,3,4,23,5,6,7]))),Ys=m.lazy(()=>E(()=>import("./BlueprintEditor--O0H0qrF.js"),__vite__mapDeps([24,1,25,26,3,23,27,5,2,6,7]))),Js=m.lazy(()=>E(()=>import("./Templates-DiFeUJiM.js"),__vite__mapDeps([28,1,2,3,21,4,6,7,5]))),Xs=m.lazy(()=>E(()=>import("./Lineage-Cos9POgz.js"),__vite__mapDeps([29,1,2,3,4,5,6,7]))),Qs=m.lazy(()=>E(()=>import("./Similarity-ZWGz1ery.js"),__vite__mapDeps([30,1,2,3,4,5,6,7]))),Zs=m.lazy(()=>E(()=>import("./Offspring-DD_OszUl.js"),__vite__mapDeps([31,1,2,3,13,9,4,12,10,5,6,7]))),eo=m.lazy(()=>E(()=>import("./Worlds-BCXHR5cz.js"),__vite__mapDeps([32,1,4,3,2,6,7,5]))),to=m.lazy(()=>E(()=>import("./Timelines-34SXDoTI.js"),__vite__mapDeps([33,1,2,3,4,19,6,7,5]))),ro=m.lazy(()=>E(()=>import("./Events-CLmgv_Hv.js"),__vite__mapDeps([34,1,4,3,2,6,7,5]))),no=m.lazy(()=>E(()=>import("./Settings-B-0iaw-r.js"),__vite__mapDeps([35,1,2,3,5,13,6,7]))),ao=m.lazy(()=>E(()=>import("./ThemeStudio-auO3INhD.js"),__vite__mapDeps([36,1,2,3,21,17,6,7,5]))),so=m.lazy(()=>E(()=>import("./DataManager-_gRduEPb.js"),__vite__mapDeps([37,1,21,17,3,2,6,7,5]))),oo=m.lazy(()=>E(()=>import("./BatchGenerate-gorzXdjq.js"),__vite__mapDeps([38,1,2,3,9,4,6,7,5]))),io=m.lazy(()=>E(()=>import("./AuthPage-BpFZUuig.js"),__vite__mapDeps([39,1,3,5,2,6,7]))),co=m.lazy(()=>E(()=>import("./About-BwNYwOO1.js"),__vite__mapDeps([40,1,41,26,3,27,5]))),lo=m.lazy(()=>E(()=>import("./HelpCenterPage-gD45-dUK.js"),__vite__mapDeps([42,1,41,26,3,27,5,2,6,7]))),uo=m.lazy(()=>E(()=>import("./WhatsNewPage-BZ5T8GDT.js"),__vite__mapDeps([43,1,41,26,3,27,5,2,6,7]))),po=m.lazy(()=>E(()=>import("./LicensePage-64XuK5FC.js"),__vite__mapDeps([44,1,41,26,3,27]))),ho=m.lazy(()=>E(()=>import("./TermsPage-B0q0-kk6.js"),__vite__mapDeps([45,1,41,26,3,27]))),mo=m.lazy(()=>E(()=>import("./PrivacyPage-Bhw0snQq.js"),__vite__mapDeps([46,1,41,26,3,27]))),fo=m.lazy(()=>E(()=>import("./SecurityPage-Bdlg6GW3.js"),__vite__mapDeps([47,1,41,26,3,27]))),go=m.lazy(()=>E(()=>import("./CodeOfConductPage-DdIoJbFU.js"),__vite__mapDeps([48,1,41,26,3,27])));function yo(){return o.jsx("div",{className:"flex h-[60vh] items-center justify-center",children:o.jsxs("div",{className:"flex items-center gap-3 text-sm text-muted-foreground",children:[o.jsx(sn,{className:"h-5 w-5 animate-spin"}),"Loading screen..."]})})}function bo(){return o.jsxs("div",{className:"flex h-[60vh] flex-col items-center justify-center gap-4 text-center",children:[o.jsxs("div",{children:[o.jsx("h1",{className:"text-2xl font-semibold text-foreground",children:"Page not found"}),o.jsx("p",{className:"mt-2 text-sm text-muted-foreground",children:"The requested route does not exist in the current browser app build."})]}),o.jsx(B,{to:"/",className:"inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",children:"Return home"})]})}function wo(){return o.jsx(Bs,{children:o.jsx(m.Suspense,{fallback:o.jsx(yo,{}),children:o.jsxs(pn,{children:[o.jsx(T,{path:"/",element:o.jsx(Hs,{})}),o.jsx(T,{path:"/generate",element:o.jsx(Gs,{})}),o.jsx(T,{path:"/seed-generator",element:o.jsx(Ws,{})}),o.jsx(T,{path:"/validation",element:o.jsx(Ks,{})}),o.jsx(T,{path:"/batch",element:o.jsx(oo,{})}),o.jsx(T,{path:"/drafts",element:o.jsx(Jt,{})}),o.jsx(T,{path:"/drafts/",element:o.jsx(Jt,{})}),o.jsx(T,{path:"/drafts/:id",element:o.jsx(zs,{})}),o.jsx(T,{path:"/drafts/:id/assets/:assetName/regenerate",element:o.jsx(qs,{})}),o.jsx(T,{path:"/templates",element:o.jsx(Js,{})}),o.jsx(T,{path:"/blueprints",element:o.jsx(Vs,{})}),o.jsx(T,{path:"/blueprints/edit/*",element:o.jsx(Ys,{})}),o.jsx(T,{path:"/lineage",element:o.jsx(Xs,{})}),o.jsx(T,{path:"/similarity",element:o.jsx(Qs,{})}),o.jsx(T,{path:"/offspring",element:o.jsx(Zs,{})}),o.jsx(T,{path:"/worlds",element:o.jsx(eo,{})}),o.jsx(T,{path:"/timelines",element:o.jsx(to,{})}),o.jsx(T,{path:"/events",element:o.jsx(ro,{})}),o.jsx(T,{path:"/themes",element:o.jsx(ao,{})}),o.jsx(T,{path:"/settings",element:o.jsx(no,{})}),o.jsx(T,{path:"/data",element:o.jsx(so,{})}),o.jsx(T,{path:"/auth",element:o.jsx(io,{})}),o.jsx(T,{path:"/about",element:o.jsx(co,{})}),o.jsx(T,{path:"/help",element:o.jsx(lo,{})}),o.jsx(T,{path:"/whats-new",element:o.jsx(uo,{})}),o.jsx(T,{path:"/license",element:o.jsx(po,{})}),o.jsx(T,{path:"/terms",element:o.jsx(ho,{})}),o.jsx(T,{path:"/privacy",element:o.jsx(mo,{})}),o.jsx(T,{path:"/security",element:o.jsx(fo,{})}),o.jsx(T,{path:"/code-of-conduct",element:o.jsx(go,{})}),o.jsx(T,{path:"*",element:o.jsx(bo,{})})]})})})}const xo={background:"background",text:"text",accent:"accent",button:"button",button_text:"button_text",border:"border",highlight:"highlight",window:"window",muted_text:"muted_text",surface:"surface",success_bg:"success_bg",danger_bg:"danger_bg",accent_bg:"accent_bg",accent_title:"accent_title",success_text:"success_text",error_text:"error_text",warning_text:"warning_text"},vo={brackets:"tok_brackets",asterisk:"tok_asterisk",parentheses:"tok_parentheses",double_brackets:"tok_double_brackets",curly_braces:"tok_curly_braces",pipes:"tok_pipes",at_sign:"tok_at_sign"},_o=[{section:"app",key:"background",label:"Background",colorKey:"background"},{section:"app",key:"surface",label:"Surface",colorKey:"surface"},{section:"app",key:"window",label:"Window",colorKey:"window"},{section:"app",key:"text",label:"Text",colorKey:"text"},{section:"app",key:"muted_text",label:"Muted Text",colorKey:"muted_text"},{section:"app",key:"accent",label:"Primary Accent",colorKey:"accent"},{section:"app",key:"accent_bg",label:"Accent Surface",colorKey:"accent_bg"},{section:"app",key:"button",label:"Button",colorKey:"button"},{section:"app",key:"button_text",label:"Button Text",colorKey:"button_text"},{section:"app",key:"border",label:"Border",colorKey:"border"},{section:"app",key:"highlight",label:"Ring / Highlight",colorKey:"highlight"},{section:"app",key:"success_text",label:"Success Text",colorKey:"success_text"},{section:"app",key:"warning_text",label:"Warning Text",colorKey:"warning_text"},{section:"app",key:"error_text",label:"Error Text",colorKey:"error_text"},{section:"app",key:"success_bg",label:"Success Surface",colorKey:"success_bg"},{section:"app",key:"danger_bg",label:"Danger Surface",colorKey:"danger_bg"},{section:"app",key:"accent_title",label:"Accent Title",colorKey:"accent_title"}],ko=[{section:"tokenizer",key:"brackets",label:"Brackets",colorKey:"tok_brackets"},{section:"tokenizer",key:"asterisk",label:"Asterisk",colorKey:"tok_asterisk"},{section:"tokenizer",key:"parentheses",label:"Parentheses",colorKey:"tok_parentheses"},{section:"tokenizer",key:"double_brackets",label:"Double Brackets",colorKey:"tok_double_brackets"},{section:"tokenizer",key:"curly_braces",label:"Curly Braces",colorKey:"tok_curly_braces"},{section:"tokenizer",key:"pipes",label:"Pipes",colorKey:"tok_pipes"},{section:"tokenizer",key:"at_sign",label:"At Sign",colorKey:"tok_at_sign"}],Vo=[{title:"App Colors",description:"Web and app-facing surfaces.",fields:_o},{title:"Tokenizer Colors",description:"Syntax highlighting tokens used in review surfaces.",fields:ko}];function So(a,e){if(!a)return null;const t={...a.colors};for(const[r,n]of Object.entries(e?.app??{})){if(!n)continue;const s=xo[r];s&&(t[s]=n)}for(const[r,n]of Object.entries(e?.tokenizer??{})){if(!n)continue;const s=vo[r];s&&(t[s]=n)}return t}function L(a){const e=a.replace("#","").trim(),t=e.length===3?e.split("").map(x=>x+x).join(""):e;if(!/^[0-9a-fA-F]{6}$/.test(t))return"0 0% 0%";const r=parseInt(t.slice(0,2),16)/255,n=parseInt(t.slice(2,4),16)/255,s=parseInt(t.slice(4,6),16)/255,i=Math.max(r,n,s),c=Math.min(r,n,s),l=i-c,u=(i+c)/2;let d=0,p=0;if(l!==0)switch(p=l/(1-Math.abs(2*u-1)),i){case r:d=(n-s)/l%6;break;case n:d=(s-r)/l+2;break;default:d=(r-n)/l+4;break}const h=Math.round(d*60<0?d*60+360:d*60),g=Math.round(p*1e3)/10,y=Math.round(u*1e3)/10;return`${h} ${g}% ${y}%`}function To(a){return{"--background":L(a.background),"--foreground":L(a.text),"--card":L(a.surface),"--card-foreground":L(a.text),"--primary":L(a.accent),"--primary-foreground":L(a.button_text),"--secondary":L(a.button),"--secondary-foreground":L(a.button_text),"--muted":L(a.window),"--muted-foreground":L(a.muted_text),"--accent":L(a.accent_bg),"--accent-foreground":L(a.text),"--destructive":L(a.danger_bg),"--destructive-foreground":L(a.button_text),"--border":L(a.border),"--input":L(a.border),"--ring":L(a.highlight)}}function Eo(a){const e=document.documentElement,t=To(a);Object.entries(t).forEach(([n,s])=>{e.style.setProperty(n,s)}),e.style.setProperty("--app-bg",a.background),e.style.setProperty("--app-surface",a.surface),e.style.setProperty("--app-border",a.border),e.style.setProperty("--app-highlight",a.highlight),e.style.setProperty("--app-accent",a.accent);const r=document.querySelector('meta[name="theme-color"]');r&&r.setAttribute("content",a.window)}const Ao=m.createContext(null);function Co({children:a}){const[e,t]=m.useState(null),r=er(),{data:n}=oe({queryKey:["config"],queryFn:()=>z.getConfig(),initialData:()=>z.getConfigSnapshot()}),{data:s=[],isLoading:i}=oe({queryKey:["themes"],queryFn:()=>z.getThemes(),initialData:()=>z.getThemesSnapshot()}),c=e?.themeName??n?.theme_name??"dark",l=e?.overrides??n?.theme;m.useEffect(()=>{const d=s.find(h=>h.name===c)??s[0],p=So(d,l);p&&Eo(p)},[s,c,l]),m.useEffect(()=>{const d=()=>{r.invalidateQueries({queryKey:["themes"]})};return window.addEventListener(ht,d),()=>{window.removeEventListener(ht,d)}},[r]);const u=m.useMemo(()=>({themes:s,isLoading:i,previewTheme:(d,p)=>{t({themeName:d,overrides:p})},clearPreview:()=>{t(null)}}),[s,i]);return o.jsx(Ao.Provider,{value:u,children:a})}const No=new on({defaultOptions:{queries:{staleTime:1e3*60*5,retry:1}}});Dr.createRoot(document.getElementById("root")).render(o.jsx(m.StrictMode,{children:o.jsx(cn,{client:No,children:o.jsx(Co,{children:o.jsx(hn,{children:o.jsx(wo,{})})})})}));export{He as A,or as B,he as C,La as D,So as E,Vo as F,X as G,Eo as H,Wo as I,Ps as J,Fo as K,Uo as L,Dt as M,vn as N,Tn as O,$o as P,yn as R,ut as S,Ao as T,E as _,Be as a,z as b,P as c,Ka as d,fe as e,Bo as f,tr as g,Ho as h,Ko as i,Ha as j,W as k,bn as l,qo as m,Fs as n,j as o,Ba as p,I as q,za as r,Go as s,zo as t,Rs as u,qa as v,yr as w,ar as x,Ke as y,v as z};
//# sourceMappingURL=index-DFdejQ4-.js.map
