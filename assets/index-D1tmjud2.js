const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Home-DVpuYAtA.js","assets/react-vendor-C34M-SVW.js","assets/query-vendor-avlJTqWH.js","assets/vendor-Che4W8CE.js","assets/whats-new-DMEXV6Sl.js","assets/router-vendor-B1PHMBJv.js","assets/storage-vendor-CKqr1NrK.js","assets/ui-utils-vendor-DeRmtv56.js","assets/Generation-BFRi_man.js","assets/generation-session-D0pf0Yeo.js","assets/InlineHelpTip-wIo6BfaL.js","assets/GenerationProgress-D9tZiWZ7.js","assets/BlueprintPanel-G2dzXBuN.js","assets/featureSelection-bAEkKlXg.js","assets/SeedGenerator-gmK1BKWY.js","assets/Validation-D8uQ3gwF.js","assets/Drafts-DWDRyA43.js","assets/SyncControls-Bx76lJPZ.js","assets/VersionHistoryPanel-dC7KrTmR.js","assets/Review-Bv1SzHS3.js","assets/download-CKbQkVza.js","assets/Blueprints-B0r9P_hf.js","assets/blueprintLint-D_UxpWeG.js","assets/BlueprintEditor-_6oadHKW.js","assets/editor-vendor-4PMdRp_6.js","assets/markdownComponents-BQGiEDOe.js","assets/markdown-vendor-CECgkbu2.js","assets/Templates-BeBXE82G.js","assets/Lineage-CTIBQQzD.js","assets/Similarity-CCy2Pf_Y.js","assets/Offspring-BIbZDlmL.js","assets/Worlds-wdhxr0zQ.js","assets/Timelines-Dg1dPN68.js","assets/Events-CtJMe50K.js","assets/Settings-BwES0WP1.js","assets/ThemeStudio-C86Nw8Hv.js","assets/DataManager-k6auVvFQ.js","assets/BatchGenerate-BxSU_6AB.js","assets/AuthPage-CbMug66V.js","assets/About-DfLlEkjL.js","assets/DocumentPage-DGVG2yOM.js","assets/HelpCenterPage-DftsKTIj.js","assets/WhatsNewPage-DjCoP2_k.js","assets/LicensePage-CQ1G_Dlt.js","assets/TermsPage-CFSVavae.js","assets/PrivacyPage-Bpw4vfvl.js","assets/SecurityPage-BRl5hlwK.js","assets/CodeOfConductPage-KG4NAXCy.js"])))=>i.map(i=>d[i]);
import{r as m,j as o,d as Gn}from"./react-vendor-C34M-SVW.js";import{X as Ye,B as Ae,T as rn,A as Te,h as It,L as an,S as Wn,C as Kn,j as zn,k as Ce,l as qn,m as Vn,o as Yn,H as Jn,p as Xn,F as Qn,q as Zn,w as er,x as Ot,y as bt,z as yt,D as tr,G as sn,E as nr,I as on,J as rr,K as st,U as ar,N as sr,O as or,P as ot,R as ir,W as cr,Y as lr,Z as dr,_ as ur,$ as pr,a0 as Dt,a1 as hr,a2 as mr,a3 as fr,a4 as Rt,a5 as gr,a6 as br}from"./vendor-Che4W8CE.js";import{u as cn,a as se,Q as yr}from"./query-vendor-avlJTqWH.js";import{D as Ne}from"./storage-vendor-CKqr1NrK.js";import{t as wr,c as xr}from"./ui-utils-vendor-DeRmtv56.js";import{L as H,u as ge,a as vr,R as _r,b as E,H as kr}from"./router-vendor-B1PHMBJv.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();const Sr="modulepreload",Tr=function(a){return"/"+a},Lt={},N=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let i=function(d){return Promise.all(d.map(u=>Promise.resolve(u).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};document.getElementsByTagName("link");const c=document.querySelector("meta[property=csp-nonce]"),l=c?.nonce||c?.getAttribute("nonce");r=i(t.map(d=>{if(d=Tr(d),d in Lt)return;Lt[d]=!0;const u=d.endsWith(".css"),p=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${p}`))return;const h=document.createElement("link");if(h.rel=u?"stylesheet":Sr,u||(h.as="script"),h.crossOrigin="",h.href=d,l&&h.setAttribute("nonce",l),document.head.appendChild(h),u)return new Promise((f,b)=>{h.addEventListener("load",f),h.addEventListener("error",()=>b(new Error(`Unable to preload CSS for ${d}`)))})}))}function s(i){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=i,window.dispatchEvent(c),!c.defaultPrevented)throw i}return r.then(i=>{for(const c of i||[])c.status==="rejected"&&s(c.reason);return e().catch(s)})},Mt="getting-started",it="getting-started",Er="protect-your-work",Ar="review-and-export",Cr="draft-library",Nr="validation-workflow",jr="blueprints-safety",Vo=[{id:"browser-storage",title:"Understand where your work lives",description:"Drafts, templates, settings, and theme edits stay in this browser profile by default. Clearing browser storage removes them unless you export a backup first.",to:"/about",actionLabel:"Read about browser storage"},{id:"api-keys",title:"Set up an API key",description:"Open Settings, pick the provider you actually use, and paste the provider key you want the browser app to send with generation requests.",to:"/settings",actionLabel:"Open Settings"},{id:"template",title:"Choose a template before you generate",description:"Templates define which assets are produced and what export structure must be preserved. Start with the built-in template before making custom ones.",to:"/templates",actionLabel:"Review templates"},{id:"generate",title:"Create your first draft",description:"Go to Generate, enter a seed, confirm the content mode, and let the app produce a full draft pack you can review asset by asset.",to:"/generate",actionLabel:"Start generating"},{id:"review",title:"Review before exporting",description:"Open the saved draft, check for consistency and missing details, and refine anything that does not fit the character you want to keep.",to:"/drafts",actionLabel:"Open draft library"},{id:"export",title:"Export with browser expectations in mind",description:"On mobile or in a browser, export may use a share sheet, a new tab, or the download tray instead of a desktop-style save dialog.",to:"/data",actionLabel:"See backup and export tools"}],Pr=[{id:"what-is-a-template",title:"Templates vs. blueprints",category:"Concepts",summary:"Templates choose the asset graph. Blueprints define how each asset is generated. Most users should start with templates and leave blueprints alone until they understand the workflow.",bullets:["Templates decide which files exist and in what order they depend on each other.","Blueprints are stricter and can break parser-facing output if edited casually.","Use the built-in template first, then move to custom templates only after you understand review and export."],actions:[{label:"Open templates",to:"/templates"},{label:"Open blueprints",to:"/blueprints"}]},{id:"how-export-works",title:"How export works in the browser",category:"Getting Started",summary:"Browser export behavior depends on the device and browser. Normal web apps do not always get a native filename prompt.",bullets:["Desktop browsers often save directly to Downloads.","Mobile browsers may show a share sheet or open a new tab instead of prompting for a filename.","Use Data Manager exports when you want a full backup of browser-stored content."],actions:[{label:"Open Data Manager",to:"/data"},{label:"Open draft review",to:"/drafts"}]},{id:"api-key-setup",title:"API key setup without guesswork",category:"Getting Started",summary:"The browser app talks to your chosen model provider using the API key you enter in Settings. No local backend service is required for the current web runtime.",bullets:["Choose the provider you really use before selecting a model.","If a key looks corrupted or includes invisible characters, the app will reject it.","Persist keys only on devices you control."],actions:[{label:"Open Settings",to:"/settings"},{label:"Read About storage",to:"/about"}]},{id:"first-draft-review",title:"How to review a first draft",category:"Concepts",summary:"A good review checks structure first, then consistency, then polish. Do not export just because generation finished.",bullets:["Confirm the character name, major facts, and tone stay consistent across assets.","Watch for unresolved placeholders or format drift in strict assets.","Use refinement and validation before exporting to a target format."],actions:[{label:"Open Drafts",to:"/drafts"},{label:"Open Validation",to:"/validation"}]},{id:"common-blockers",title:"Common blockers and what to do next",category:"Troubleshooting",summary:"Most early problems are configuration or browser-behavior issues, not generator bugs.",bullets:["If generation fails immediately, verify the provider, model, and API key in Settings.","If export feels silent on mobile, check for a share sheet, a new tab, or the browser download tray.","If you lose drafts after clearing browser data, restore from a JSON backup in Data Manager."],actions:[{label:"Open Settings",to:"/settings"},{label:"Open Data Manager",to:"/data"}]}],Yo=["Getting Started","Concepts","Troubleshooting"],ln=[{id:it,title:"Getting Started Tour",summary:"Walk through the safest first-run path from setup to a first export-ready draft.",audience:"New users who want the app to tell them what to do next.",estimatedMinutes:6,steps:[{id:"start-home",title:"Start from Home",description:"Home is the launch surface for the beginner path. It tells you what the current browser app can do and where to go next.",to:"/",routeLabel:"Home",bullets:["Use Home when you are not sure which workflow to open first.","The browser profile you are using is the current storage location for drafts and settings."]},{id:"set-up-provider",title:"Set up provider access",description:"Open Settings before you generate anything. This avoids the most common first-run failure: trying to generate with a missing or mismatched provider key.",to:"/settings",routeLabel:"Settings",targetId:"settings-api-keys",targetLabel:"API Keys",bullets:["Pick the provider you actually use.","Enter the API key you want the browser app to send.","Use trusted devices if you choose to persist keys locally."]},{id:"choose-template",title:"Choose the template first",description:"Templates decide which assets exist and how the draft will export. Make this choice before refining the prompt or seed.",to:"/templates",routeLabel:"Templates",bullets:["Start with the built-in template unless you already understand custom template behavior.","Template changes are structural, not cosmetic."]},{id:"generate-draft",title:"Generate the first draft",description:"Once provider setup and template choice are in place, Generate becomes the first full workflow step.",to:"/generate",routeLabel:"Generate",targetId:"generation-submit",targetLabel:"Generate Character button",bullets:["Enter a concrete seed instead of a vague one-liner.","Treat the first result as a draft to review, not a final export."]},{id:"review-library",title:"Review saved drafts",description:"Drafts is where you reopen saved work and decide what should move into deeper review, validation, or export.",to:"/drafts",routeLabel:"Drafts",bullets:["Open the draft library after generation to confirm the draft actually saved.","Use draft review before export when details need cleanup."]},{id:"protect-work",title:"Protect your work with backups",description:"Data Manager is the safety net for browser-local storage. Use it before clearing browser data or moving to another device.",to:"/data",routeLabel:"Data Manager",bullets:["Export backups before risky changes.","Treat API key exports as sensitive data."]}]},{id:Er,title:"Protect Your Work Tour",summary:"Learn the browser-storage model, backup path, and the pages that matter when you need to avoid losing work.",audience:"Users who are worried about where data lives and how to recover it safely.",estimatedMinutes:4,steps:[{id:"storage-model",title:"Confirm the storage model",description:"About explains that the current product surface is the browser app. That matters because drafts and configuration live in browser storage by default.",to:"/about",routeLabel:"About",bullets:["Do not assume a local backend or desktop shell is saving your work for you.","Treat this browser profile as the place where your work currently lives."]},{id:"backup-tools",title:"Use backup tools intentionally",description:"Data Manager is where you export or restore browser-stored content when you need to migrate, recover, or safeguard work.",to:"/data",routeLabel:"Data Manager",bullets:["Back up before clearing site data.","Use restore only with files you trust and understand."]},{id:"privacy-expectations",title:"Understand privacy expectations",description:"Privacy explains the difference between local browser storage and the provider requests you intentionally send during generation.",to:"/privacy",routeLabel:"Privacy",bullets:["Local storage and provider traffic are different concerns.","Backups can still expose sensitive material if handled carelessly."]},{id:"secure-settings",title:"Review secure settings habits",description:"Settings is where you control provider keys and persistence choices, so it is part of the data-protection workflow too.",to:"/settings",routeLabel:"Settings",targetId:"settings-api-keys",targetLabel:"API Keys",bullets:["Persist keys only on devices you control.","If something feels unsafe or unclear, return to Help Center before continuing."]}]},{id:Ar,title:"Review and Export Tour",summary:"Walk through the review controls that matter before you hand a draft off to export.",audience:"Users who already generated a draft and need a safe review path before exporting.",estimatedMinutes:5,steps:[{id:"review-actions",title:"Start from the review action bar",description:"The review header is the control surface for validation, favoriting, export, and draft deletion.",to:"/drafts/",routeLabel:"Draft Review",matchMode:"prefix",targetId:"review-actions",targetLabel:"Review actions",bullets:["Do not export immediately if you have not checked the draft structure yet.","Keep destructive actions separate from export so you do not rush them."]},{id:"review-validate",title:"Validate before export",description:"Use validation before exporting when the draft has been edited or when the template has strict structure requirements.",to:"/drafts/",routeLabel:"Draft Review",matchMode:"prefix",targetId:"review-validate",targetLabel:"Validate button",bullets:["Validation catches structural problems that a quick read can miss.","Treat missing required pieces or unresolved placeholders as blockers."]},{id:"review-assets",title:"Read the assets, not just the title",description:"The asset list is where consistency problems usually reveal themselves. Check names, tone, and required sections across multiple assets.",to:"/drafts/",routeLabel:"Draft Review",matchMode:"prefix",targetId:"review-assets",targetLabel:"Draft assets",bullets:["A draft can look good in one asset while still being broken elsewhere.","Use targeted editing when only one asset drifts."]},{id:"review-export",title:"Export with browser expectations in mind",description:"When the draft is coherent, use Export. On browser and mobile surfaces this may hand off through a share sheet, new tab, or downloads tray instead of a native save dialog.",to:"/drafts/",routeLabel:"Draft Review",matchMode:"prefix",targetId:"review-export",targetLabel:"Export button",bullets:["The app now tells you which handoff method was used.","If export feels silent on mobile, check share and browser download surfaces."]},{id:"export-choose-preset",title:"Choose the export preset inside the modal",description:"Once the export modal opens, choose the preset that matches the system you are exporting for instead of blindly taking the first option.",to:"/drafts/",routeLabel:"Export Modal",matchMode:"prefix",targetId:"export-preset-selection",targetLabel:"Export preset selection",bullets:["Presets change output structure and destination compatibility.","If you are unsure, review the preset description before continuing."]},{id:"export-confirm",title:"Confirm export and watch the handoff result",description:"Use the Export button after the preset is selected, then follow the browser-specific save or share flow the app reports back to you.",to:"/drafts/",routeLabel:"Export Modal",matchMode:"prefix",targetId:"export-confirm",targetLabel:"Export confirm button",bullets:["A successful export in the browser may still look different from a desktop save dialog.","Use the success message to know whether the file went to share, download, or a new tab."]}]},{id:Cr,title:"Draft Library Tour",summary:"Learn how to use the library as a review queue instead of a pile of saved outputs.",audience:"Users who generated drafts and need to understand where to reopen, compare, and triage them.",estimatedMinutes:4,steps:[{id:"draft-library-overview",title:"Treat Drafts as your working library",description:"The library is not just storage. It is where you decide which drafts are worth opening for deeper review or export.",to:"/drafts",routeLabel:"Drafts",targetId:"drafts-list",targetLabel:"Draft list",bullets:["Open drafts from here after generation instead of relying on memory or browser history.","Use names, tags, and favorites to keep the library readable as it grows."]},{id:"draft-workbench",title:"Use the workbench for comparison and checks",description:"The workbench keeps review aids in view so you can compare outputs and think before opening a draft for editing.",to:"/drafts",routeLabel:"Drafts",targetId:"drafts-workbench",targetLabel:"Draft workbench",bullets:["Comparison and review tools help you choose the better draft before you start editing.","Staged placeholders are visible here, but only the active tools should drive your next action."]},{id:"draft-review-hand-off",title:"Open one draft for real review",description:"Once a draft looks worth keeping, open it and continue with validation, editing, and export on the review page.",to:"/drafts",routeLabel:"Drafts",targetId:"drafts-open-review",targetLabel:"Draft review links",bullets:["The library is the triage layer. The review page is the editing and export layer.","Back up important work before risky cleanup or browser-data changes."]}]},{id:Nr,title:"Validation Workflow Tour",summary:"Walk through the validation screen so structural checks become a normal part of review instead of a last-minute panic step.",audience:"Users who edit drafts or export to strict formats and need to know when validation matters.",estimatedMinutes:4,steps:[{id:"validation-overview",title:"Use validation as a structural checkpoint",description:"Validation is where you confirm the draft still matches the expected structure before you export or hand it off to another tool.",to:"/validation",routeLabel:"Validation",targetId:"validation-draft-panel",targetLabel:"Validate saved draft panel",bullets:["Run validation after major edits, not only after generation.","Treat structural failures as blockers instead of cosmetic warnings."]},{id:"validation-run",title:"Choose the simplest input path",description:"Most users should validate a saved draft by review ID instead of typing a manual path unless they know exactly what they are checking.",to:"/validation",routeLabel:"Validation",targetId:"validation-draft-run",targetLabel:"Validate Draft button",bullets:["Use saved-draft validation for normal browser workflows.","Manual paths are useful when you are investigating a specific stored location."]},{id:"validation-results",title:"Read the results for real blockers",description:"The result panel tells you whether the draft passed and shows the lines that need attention before export.",to:"/validation",routeLabel:"Validation",targetId:"validation-results",targetLabel:"Validation results",bullets:["Fix missing required sections and unresolved placeholders first.","If the result passes, move back to review or export with more confidence."]}]},{id:jr,title:"Blueprint Safety Tour",summary:"Learn when to leave blueprints alone, when to inspect them carefully, and where to bail out to safer surfaces.",audience:"Non-technical or first-time users who might wander into blueprints before understanding template contracts.",estimatedMinutes:4,steps:[{id:"blueprints-search",title:"Treat Blueprints as inspection first, editing second",description:"Start by searching and reading. Do not jump into editing unless you know why a blueprint needs to change.",to:"/blueprints",routeLabel:"Blueprints",targetId:"blueprints-search",targetLabel:"Blueprint search",bullets:["Search helps you understand which blueprint family you are looking at.","Reading the path and description usually tells you whether the file is core, system, or template-specific."]},{id:"blueprints-tools",title:"Use browser safety tools before editing",description:"The lint and sandbox tools exist so you can inspect behavior without immediately rewriting contract-heavy text.",to:"/blueprints",routeLabel:"Blueprints",targetId:"blueprints-tools",targetLabel:"Blueprint tools",bullets:["Use lint and preview to reduce guesswork.","A readable blueprint is not automatically a safe blueprint."]},{id:"blueprints-exit-ramp",title:"Know the safer alternative",description:"If you are trying to change workflow shape rather than raw blueprint text, templates are usually the safer surface for early users.",to:"/blueprints",routeLabel:"Blueprints",targetId:"blueprints-list",targetLabel:"Blueprint list",bullets:["Do not edit a blueprint just because you found the right file name.","When in doubt, go back to Templates or Help Center before making changes."]}]}],Ir=[{id:"home",match:"/",matchMode:"exact",title:"Home help",summary:"Use Home as the launch surface for first-run guidance, recent updates, quick actions, and your next step into the workflow.",keyActions:["Start with the Getting Started guide if this is your first run.","Use Quick Actions to jump straight into Generate, Drafts, or Seeds.","Check What’s New when behavior changes after an update."],pitfalls:["Do not assume your work syncs automatically. This browser profile is the storage location by default.","Do not skip Settings if generation cannot start; most early issues begin there."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"generate",match:"/generate",matchMode:"exact",title:"Generate help",summary:"Generation is where you choose the template, seed, provider, and content mode that become a full draft pack.",keyActions:["Choose the template before you spend time refining the seed.","Keep the seed concrete enough that the model has something to preserve across assets.","Use review after generation instead of trying to perfect everything in one pass."],pitfalls:["A missing or invalid API key will usually fail generation before useful output appears.","Changing template assumptions late can invalidate your review expectations."],actions:[{label:"Open Settings",to:"/settings"},{label:"Open templates",to:"/templates"}],relatedTopicIds:["api-key-setup","what-is-a-template"]},{id:"seed-generator",match:"/seed-generator",matchMode:"exact",title:"Seed Generator help",summary:"Use Seed Generator when you need raw concept material before you commit to a full draft workflow.",keyActions:["Generate multiple seeds and keep the one with the clearest identity.","Pass the best seed into Generate instead of trying to export from here."],pitfalls:["A seed is not a finished draft; it still needs a template and generation pass."],actions:[{label:"Open Generate",to:"/generate"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["common-blockers"]},{id:"validation",match:"/validation",matchMode:"exact",title:"Validation help",summary:"Validation helps you catch structural issues before export, especially on strict templates or edited drafts.",keyActions:["Validate after major edits and before export.","Treat missing required assets or unresolved placeholders as blockers, not cosmetic warnings."],pitfalls:["Passing generation does not guarantee export readiness."],actions:[{label:"Open Drafts",to:"/drafts"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["first-draft-review","common-blockers"]},{id:"batch",match:"/batch",matchMode:"exact",title:"Batch help",summary:"Batch generation is for running multiple drafts in sequence without driving the app one draft at a time.",keyActions:["Keep concurrency conservative until you know your provider limits.","Use batch for throughput, not for first-time learning of the workflow."],pitfalls:["High concurrency can make failures harder to interpret."],actions:[{label:"Open Generate",to:"/generate"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["common-blockers"]},{id:"drafts",match:"/drafts",matchMode:"exact",title:"Draft library help",summary:"Drafts is where you reopen saved work, check metadata, and decide which draft should move into review or export.",keyActions:["Open the review page for the draft you want to polish or export.","Use metadata and favorites to keep the library manageable as it grows."],pitfalls:["Deleting a draft removes the browser-local copy unless you already exported or backed it up."],actions:[{label:"Open Data Manager",to:"/data"},{label:"Open Validation",to:"/validation"}],relatedTopicIds:["first-draft-review","common-blockers"]},{id:"draft-review",match:"/drafts/",matchMode:"prefix",title:"Draft review help",summary:"Review is where you inspect generated assets, refine weak spots, validate structure, and export only when the pack is coherent.",keyActions:["Check the character name, core traits, and tone across multiple assets before exporting.","Use refine tools for targeted edits instead of regenerating the whole draft immediately.","Validate after meaningful edits."],pitfalls:["A draft that reads well in one asset can still fail export because another asset drifted or broke format.","Do not ignore placeholders or empty required sections in strict assets."],actions:[{label:"Open Validation",to:"/validation"},{label:"Open Data Manager",to:"/data"}],relatedTopicIds:["first-draft-review","how-export-works"]},{id:"templates",match:"/templates",matchMode:"exact",title:"Templates help",summary:"Templates define which assets exist, how they depend on each other, and what export structure needs to remain valid.",keyActions:["Use the built-in template first so you understand the app’s baseline workflow.","Treat template changes as structural decisions, not cosmetic ones."],pitfalls:["Changing template expectations late can invalidate assumptions in review and export."],actions:[{label:"Open Generate",to:"/generate"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["what-is-a-template"]},{id:"blueprints",match:"/blueprints",matchMode:"exact",title:"Blueprints help",summary:"Blueprints are advanced prompt/compiler definitions. They are powerful, but they are not a safe first editing surface for non-technical users.",keyActions:["Prefer templates unless you are intentionally changing generation structure.","Preserve parser-facing formats and placeholders carefully when editing."],pitfalls:["A casual blueprint edit can break validation or export even if the text still looks readable."],actions:[{label:"Open templates",to:"/templates"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["what-is-a-template"]},{id:"blueprint-editor",match:"/blueprints/edit",matchMode:"prefix",title:"Blueprint editor help",summary:"The editor is for advanced changes to blueprint text and should be treated as a strict contract surface, not a freeform note field.",keyActions:["Keep output structures intact when the target asset expects rigid formatting.","Validate edits before using them in a generation workflow."],pitfalls:["Unfilled placeholders, broken structure, or dependency mistakes can cascade through later assets."],actions:[{label:"Open Validation",to:"/validation"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["what-is-a-template","common-blockers"]},{id:"similarity",match:"/similarity",matchMode:"exact",title:"Similarity help",summary:"Similarity helps you inspect overlap between drafts so you can catch repeats, redundancy, or near-duplicates.",keyActions:["Use it after building a larger draft library or batch output set."],pitfalls:["Similarity is analysis support, not a replacement for human review."],actions:[{label:"Open Drafts",to:"/drafts"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["first-draft-review"]},{id:"offspring",match:"/offspring",matchMode:"exact",title:"Offspring help",summary:"Offspring combines parent drafts into a derivative result, so parent quality and consistency matter before you start.",keyActions:["Choose parents that are already reviewed and structurally healthy."],pitfalls:["Using unstable or contradictory parents gives unstable offspring output."],actions:[{label:"Open Drafts",to:"/drafts"},{label:"Open Validation",to:"/validation"}],relatedTopicIds:["first-draft-review"]},{id:"lineage",match:"/lineage",matchMode:"exact",title:"Lineage help",summary:"Lineage shows how related drafts connect over time so you can track derivations and review ancestry.",keyActions:["Use lineage when you need provenance, not when you need direct editing."],pitfalls:["Lineage helps you understand relationships, but it does not repair structural draft issues on its own."],actions:[{label:"Open Drafts",to:"/drafts"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["first-draft-review"]},{id:"themes",match:"/themes",matchMode:"exact",title:"Themes help",summary:"Themes control the browser UI appearance. Runtime theme behavior lives in the app, not in the reference TOML files under resources.",keyActions:["Use presets as a base and save customizations intentionally."],pitfalls:["Editing reference theme files in the repo is not the same as changing the live browser theme runtime."],actions:[{label:"Open Settings",to:"/settings"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["common-blockers"]},{id:"settings",match:"/settings",matchMode:"exact",title:"Settings help",summary:"Settings controls provider access, model defaults, browser persistence choices, theme behavior, and tutorial/help preferences.",keyActions:["Start here if generation fails, models are missing, or you are unsure where data is stored.","Use the Help and Tutorials section to restart the starter guide or re-enable tips."],pitfalls:["Saving API keys in browser storage is convenient, but it should be limited to devices you trust."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open About",to:"/about"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"data",match:"/data",matchMode:"exact",title:"Data Manager help",summary:"Data Manager is the safety net for browser-local drafts, config, and backups.",keyActions:["Export backups before clearing browser data or changing devices.","Treat API-key export files as sensitive data."],pitfalls:["Clearing browser storage without a backup removes local drafts and settings."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["how-export-works","common-blockers"]},{id:"whats-new",match:"/whats-new",matchMode:"exact",title:"What’s New help",summary:"Use this page to understand recent product changes and staged roadmap work before assuming the workflow still behaves the same way.",keyActions:["Check release notes after updates when a flow feels different."],pitfalls:["Roadmap items are not the same as implemented features."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Home",to:"/"}],relatedTopicIds:["common-blockers"]},{id:"about",match:"/about",matchMode:"exact",title:"About help",summary:"About explains the current browser-first product surface, storage model, and the difference between the app runtime and repo reference assets.",keyActions:["Use About when you need to confirm how the browser app stores or handles your work."],pitfalls:["Do not assume older Python/backend flows exist in the current product unless you can see them in the app."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"help-center",match:"/help",matchMode:"exact",title:"Help Center help",summary:"Help Center is the structured fallback when you want answers without guessing which page or workflow to visit next.",keyActions:["Start with the Getting Started section if you are still learning the workflow.","Use concepts when the terminology is the blocker.","Use troubleshooting when the app behavior does not match your expectation."],pitfalls:["The Help Center explains the browser app. It does not guarantee parity with future mobile or desktop surfaces."],actions:[{label:"Open Home",to:"/"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"license",match:"/license",matchMode:"exact",title:"License help",summary:"License explains the repository licensing terms and should be read when you need usage or redistribution clarity.",keyActions:["Use this page when you need the exact license text or attribution expectations."],pitfalls:["License answers legal distribution questions, not workflow or storage questions."],actions:[{label:"Open About",to:"/about"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["common-blockers"]},{id:"terms",match:"/terms",matchMode:"exact",title:"Terms help",summary:"Terms of Use covers the rules around using the app, exports, and generated content through the current browser surface.",keyActions:["Use this page when you need policy guidance rather than workflow guidance."],pitfalls:["Terms is not a how-to page. Use Help Center for workflow questions."],actions:[{label:"Open Help Center",to:"/help"},{label:"Open Privacy",to:"/privacy"}],relatedTopicIds:["common-blockers"]},{id:"privacy",match:"/privacy",matchMode:"exact",title:"Privacy help",summary:"Privacy explains what stays in browser storage, what reaches provider APIs, and what sensitive data you are responsible for handling carefully.",keyActions:["Use this page when you need to understand local storage, API key handling, or data exposure to providers."],pitfalls:["Browser-local does not mean impossible to lose. You still need backups if the data matters."],actions:[{label:"Open Data Manager",to:"/data"},{label:"Open Settings",to:"/settings"}],relatedTopicIds:["api-key-setup","common-blockers"]},{id:"security",match:"/security",matchMode:"exact",title:"Security help",summary:"Security covers vulnerability reporting and safe handling of provider keys and browser-stored configuration.",keyActions:["Use this page when the question is about secure handling or vulnerability reporting."],pitfalls:["Security policy does not replace provider-specific account protection practices."],actions:[{label:"Open Settings",to:"/settings"},{label:"Open Privacy",to:"/privacy"}],relatedTopicIds:["api-key-setup"]},{id:"code-of-conduct",match:"/code-of-conduct",matchMode:"exact",title:"Code of Conduct help",summary:"Code of Conduct covers collaboration expectations for the repository and project community spaces.",keyActions:["Use this page for contribution and interaction standards, not workflow setup."],pitfalls:["Community rules are separate from app usage or licensing terms."],actions:[{label:"Open About",to:"/about"},{label:"Open Help Center",to:"/help"}],relatedTopicIds:["common-blockers"]}],Or=[{route:"/",pageHelpId:"home",coverage:"complete"},{route:"/generate",pageHelpId:"generate",coverage:"complete"},{route:"/seed-generator",pageHelpId:"seed-generator",coverage:"complete"},{route:"/validation",pageHelpId:"validation",coverage:"complete"},{route:"/batch",pageHelpId:"batch",coverage:"complete"},{route:"/drafts",pageHelpId:"drafts",coverage:"complete"},{route:"/drafts/:id",pageHelpId:"draft-review",coverage:"complete"},{route:"/templates",pageHelpId:"templates",coverage:"complete"},{route:"/blueprints",pageHelpId:"blueprints",coverage:"complete"},{route:"/blueprints/edit/*",pageHelpId:"blueprint-editor",coverage:"complete"},{route:"/lineage",pageHelpId:"lineage",coverage:"complete"},{route:"/similarity",pageHelpId:"similarity",coverage:"complete"},{route:"/offspring",pageHelpId:"offspring",coverage:"complete"},{route:"/themes",pageHelpId:"themes",coverage:"complete"},{route:"/settings",pageHelpId:"settings",coverage:"complete"},{route:"/data",pageHelpId:"data",coverage:"complete"},{route:"/about",pageHelpId:"about",coverage:"complete"},{route:"/help",pageHelpId:"help-center",coverage:"complete"},{route:"/whats-new",pageHelpId:"whats-new",coverage:"complete"},{route:"/license",pageHelpId:"license",coverage:"complete"},{route:"/terms",pageHelpId:"terms",coverage:"complete"},{route:"/privacy",pageHelpId:"privacy",coverage:"complete"},{route:"/security",pageHelpId:"security",coverage:"complete"},{route:"/code-of-conduct",pageHelpId:"code-of-conduct",coverage:"complete"}];Or.map(a=>({path:a.route,pageHelpId:a.pageHelpId}));function Dr(a){const e=Ir.filter(t=>t.matchMode==="exact"?a===t.match:a.startsWith(t.match));return e.length===0?null:e.sort((t,n)=>n.match.length-t.match.length)[0]??null}function He(a){return ln.find(e=>e.id===a)??null}function ct(a,e){return(e.matchMode??"exact")==="exact"?a===e.to:a.startsWith(e.to)}const Rr=[{id:"generation-workflow",title:"Generation Workflow",status:"placeholder",ownerFiles:["packages/web/src/components/generation/Generation.tsx","packages/web/src/components/generation/GenerationProgress.tsx","packages/web/src/components/generation/SeedGenerator.tsx","packages/web/src/components/batch/BatchGenerate.tsx","packages/web/src/lib/services/generation.ts"],placeholderFiles:["packages/web/src/components/generation/ApprovalWorkflowPlaceholder.tsx","packages/web/src/components/generation/CheckpointSessionPlaceholder.tsx","packages/web/src/lib/services/generation-scenarios.ts","packages/web/src/lib/services/seed-remix.ts"],items:["Asset-by-asset approval workflow before downstream generation continues","Checkpointed generation sessions that let users pause, resume, or restart from any approved asset","Partial regeneration flow for replacing one asset without discarding the rest of the draft","Multi-model comparison runs for the same seed and template","Batch generation queue with priorities, retry policies, and run history","Scenario presets for common generation goals such as fast drafting, high-structure output, or art-focused packs","Constraint builder for generation goals like tone, genre, style, and content level","Seed remix feature that combines multiple saved concepts into one prompt","Seed idea board with saved prompts, themes, and inspiration sets","Assistant suggestions for strengthening weak or underspecified seeds","Offline/local-model optimized workflow presets","Guided first-run generation flow for helping new users reach a valid draft quickly"]},{id:"review-and-editing",title:"Review and Editing",status:"placeholder",ownerFiles:["packages/web/src/components/drafts/Review.tsx","packages/web/src/components/drafts/Drafts.tsx","packages/web/src/components/common/ChatPanel.tsx","packages/web/src/components/drafts/DraftComparisonPanel.tsx","packages/web/src/components/drafts/ReviewChecklistPanel.tsx","packages/web/src/components/drafts/VersionHistoryPanel.tsx"],placeholderFiles:[],items:["Merge-ready draft comparison workflow for comparing alternate generations and promoting selected assets","Persistent structured review checklist with asset-level scoring, notes, and export gating","Asset health scoring based on completeness, consistency, and format compliance","Provenance view showing which upstream assets influenced each generated asset","Inline review notes attached to individual assets","Asset-level commenting with a simple resolved/unresolved state","Draft branching system for exploring alternate versions of the same character","Draft merge tools for selectively combining assets from different branches","Deeper version history with restore points and revision diffs","Focus mode for reviewing one asset with its immediate dependencies visible","Assistant tools for rewriting a single asset while preserving established canon","Read-only review links for sharing a draft state without enabling edits"]},{id:"templates-and-blueprints",title:"Templates and Blueprints",status:"placeholder",ownerFiles:["packages/web/src/components/templates/Templates.tsx","packages/web/src/components/templates/TemplateWizard.tsx","packages/web/src/components/templates/TemplateComparisonPanel.tsx","packages/web/src/components/blueprints/Blueprints.tsx","packages/web/src/components/blueprints/BlueprintEditor.tsx","packages/web/src/components/blueprints/BlueprintLintPanel.tsx","packages/web/src/components/blueprints/BlueprintSandboxPanel.tsx"],placeholderFiles:["packages/web/src/components/templates/TemplateMigrationPlaceholder.tsx"],items:["Guided template creation wizard in the web UI","Template migration assistant for updating older drafts to newer template versions","Expanded blueprint preview sandbox with prior-asset context sets and reusable test cases","Visual dependency graph for template assets and generation order","Template marketplace or import/export bundle format for sharing templates","Template starter kits for common character-card formats and content styles","Template cloning flow for using the built-in template as a starting point for a custom one","Expanded template comparison workflow with cloning and migration-aware diffs","Expanded blueprint linting dashboard for placeholder usage, dependency clarity, and output expectations","Prompt experimentation lab for testing orchestrator and blueprint variants","Shared blueprint snippet library for reusable sections and control blocks","Template-aware onboarding tutorial for new users"]},{id:"draft-library-and-organization",title:"Draft Library and Organization",status:"placeholder",ownerFiles:["packages/web/src/components/drafts/Drafts.tsx","packages/web/src/components/Home.tsx"],placeholderFiles:["packages/web/src/components/drafts/LibraryCollectionsPlaceholder.tsx"],items:["Better draft library filters for archetype, tone, mode, template, and tags","Saved searches and smart collections for large draft libraries","Bulk metadata editing across multiple drafts","Favorite and pin system for important drafts, templates, and presets","Semantic search across draft content, not just metadata","Auto-tagging suggestions based on generated content","Archive and curation workflows for keeping large draft libraries manageable","Custom foldering or collection system beyond timestamp-based draft storage","Recently viewed and recently edited lists for faster navigation","Duplicate-detection suggestions while browsing the library","Custom metadata fields for project-specific cataloging","Library summary dashboard with counts by template, mode, and generation source"]},{id:"canon-worldbuilding-and-relationships",title:"Canon, Worldbuilding, and Relationships",status:"placeholder",ownerFiles:["packages/web/src/components/lineage/Lineage.tsx","packages/web/src/components/similarity/Similarity.tsx","packages/web/src/components/offspring/Offspring.tsx","packages/web/src/components/worlds/Worlds.tsx","packages/web/src/components/timelines/Timelines.tsx","packages/web/src/components/worlds/Events.tsx","packages/web/src/components/timelines/GenerationHistoryPanel.tsx"],placeholderFiles:["packages/web/src/components/lineage/TimelinePlaceholder.tsx","packages/web/src/components/lineage/AncestryVisualizationPlaceholder.tsx","packages/web/src/components/lineage/LineageExportPlaceholder.tsx","packages/web/src/components/similarity/ClusteringPlaceholder.tsx","packages/web/src/components/similarity/RelationshipGraphPlaceholder.tsx","packages/web/src/components/offspring/TraitInheritancePlaceholder.tsx","packages/web/src/components/offspring/BreedingHistoryPlaceholder.tsx","packages/web/src/components/worlds/CanonLibraryPlaceholder.tsx","packages/web/src/components/worlds/WorldbookPlaceholder.tsx","packages/web/src/components/worlds/RelationshipMapPlaceholder.tsx","packages/web/src/components/worlds/FactionManagerPlaceholder.tsx","packages/web/src/components/worlds/LocationManagerPlaceholder.tsx","packages/web/src/components/worlds/UniverseNotesPlaceholder.tsx","packages/web/src/components/worlds/CanonLockPlaceholder.tsx","packages/web/src/components/timelines/EventTimelinePlaceholder.tsx","packages/web/src/components/timelines/ContinuityAssistantPlaceholder.tsx","packages/web/src/components/worlds/EventCalendarPlaceholder.tsx","packages/web/src/components/worlds/EventEditorPlaceholder.tsx","packages/web/src/components/worlds/EventCategoriesPlaceholder.tsx","packages/web/src/lib/services/canon-library.ts"],items:["Reusable canon library for traits, lore, tags, and recurring world details","Worldbook or setting support that can be attached to multiple related drafts","Relationship mapping between characters in the same universe","Lineage timeline view showing how drafts evolved over time","Similarity clustering to group near-duplicate or closely related drafts","Shared faction, setting, and location records reusable across drafts","Universe-level notes that can be referenced during generation and review","Canon lock system for facts that should remain stable across derivative drafts","Family tree and affiliation visualizations for related characters","Cross-draft continuity assistant for keeping related characters aligned","Event calendar with in-world and real-world date tracking","Expanded generation history timeline with restore points, lineage jumps, and draft-level drilldown","Continuity checking for canon conflicts across drafts"]},{id:"export-and-publishing",title:"Export and Publishing",status:"placeholder",ownerFiles:["packages/web/src/components/common/ExportModal.tsx","packages/shared/src/export/presets.ts"],placeholderFiles:["packages/web/src/components/common/ExportPreviewPlaceholder.tsx","packages/web/src/components/common/PublishingPlaceholder.tsx"],items:["Preset preview mode showing exactly which files and names an export will produce","Platform capability matrix for checking which presets work with which templates","Character pack publishing flow for producing a polished shareable bundle","Export profiles with saved naming, packaging, and metadata rules","One-click export bundles for common targets and sharing destinations","Shareable web preview page for a generated character pack","Optional branded export themes for more polished presentation packages","Metadata manifest export for preserving provenance, model info, and template info alongside assets","Export dry-run mode that shows mapped outputs before creating files","Print-friendly or PDF-style presentation export for review and archiving"]},{id:"analysis-and-evaluation",title:"Analysis and Evaluation",status:"placeholder",ownerFiles:["packages/web/src/components/similarity/Similarity.tsx","packages/web/src/components/validation/Validation.tsx","packages/web/src/components/Home.tsx","packages/web/src/components/drafts/ReviewChecklistPanel.tsx"],placeholderFiles:["packages/web/src/components/similarity/ClusteringPlaceholder.tsx"],items:["Golden sample packs for template quality benchmarking","Evaluation dashboard for model quality, cost, latency, and format success rate","Token and cost analytics per asset, draft, template, and provider","Usage history dashboard for models, templates, exports, and generation modes","Quality trend tracking across model changes and template revisions","Scorecards for comparing provider performance on specific templates","Regression benchmark suite for measuring structural compliance over time","Review analytics showing which assets most often need human edits","Generation time breakdown by stage, provider, and asset count","Template adoption analytics to show which workflows users actually prefer"]},{id:"collaboration-and-sharing",title:"Collaboration and Sharing",status:"placeholder",ownerFiles:["packages/web/src/components/drafts/Review.tsx","packages/web/src/components/templates/Templates.tsx","packages/web/src/components/common/ExportModal.tsx"],placeholderFiles:["packages/web/src/components/common/PublishingPlaceholder.tsx"],items:["Collaboration-friendly review notes attached to individual assets","Shared workspaces for teams curating the same draft library","Commentable template reviews before publishing a new template version","Import/export package format for moving drafts with metadata and history intact","Team preset libraries for shared export and validation standards","Curated featured templates and starter packs surfaced in-app","Community template discovery with tags, screenshots, and example outputs","Public/private visibility controls for shared templates and draft bundles","Lightweight approval workflow for team-owned templates and presets","Activity feed for recent library changes, exports, and published templates"]},{id:"ux-and-platform-surfaces",title:"UX and Platform Surfaces",status:"placeholder",ownerFiles:["packages/web/src/App.tsx","packages/web/src/components/Layout.tsx","packages/web/src/components/Home.tsx","packages/mobile/src/screens"],placeholderFiles:["packages/web/src/components/common/OnboardingPlaceholder.tsx","packages/web/src/components/drafts/LibraryCollectionsPlaceholder.tsx"],items:["Mobile-first review and approval flow for draft triage on smaller screens","Desktop-native drag-and-drop import/export flows","Responsive split-pane editor optimized for wide and narrow displays","Keyboard-first review workflows across web, mobile, and desktop surfaces","Quick actions palette for jumping to drafts, templates, exports, and tools","Pinned dashboard widgets for recent drafts, saved searches, and active queues","Guided empty states that teach features instead of just showing blank screens","In-app documentation panels linked to templates, presets, and validation rules","Customizable home screen tailored to the user's most common workflow","Workspace mode for switching between solo drafting, review, and bulk operations"]},{id:"assistant-and-automation",title:"Assistant and Automation",status:"placeholder",ownerFiles:["packages/web/src/components/common/GlobalAssistant.tsx","packages/web/src/components/common/ChatPanel.tsx","packages/web/src/components/Home.tsx"],placeholderFiles:["packages/web/src/components/common/AutomationPlaceholder.tsx","packages/web/src/components/common/OnboardingPlaceholder.tsx"],items:["Assistant tools for proposing alternate tones or styles for a selected asset","Assistant-generated metadata suggestions like tags, summaries, and archetypes","Auto-generated draft summaries for quick browsing in large libraries","Conversational template helper for explaining what each asset does and depends on","Smart recommendations for next actions after generation, review, or export","Workflow automations for repeated sequences like generate, validate, review, and export","Scheduled batch runs for seed lists or nightly model comparisons","Auto-generated handoff notes summarizing what changed between draft revisions","Safety profile presets tuned for different platforms or use cases","Assistant-backed onboarding that adapts to the selected template and workflow"]}];function wt(a){const e=a.toLowerCase();return e.startsWith("openrouter/")?"openrouter":e.startsWith("openai/")?"openai":e.startsWith("google/")?"google":e.startsWith("anthropic/")?"anthropic":e.startsWith("deepseek/")?"deepseek":e.startsWith("zai/")?"zai":e.startsWith("moonshot")?"moonshot":e.startsWith("ollama/")?"ollama":e.startsWith("gpt-")||e.startsWith("o1")?"openai":e.startsWith("gemini")?"google":e.startsWith("claude")?"anthropic":e.startsWith("llama")||e.startsWith("mistral")||e.startsWith("codellama")||e.startsWith("vicuna")||e.startsWith("qwen")||e.startsWith("phi")||e.startsWith("gemma")||e.startsWith("starcoder")||e.includes("ollama")?"ollama":"openrouter"}var Ze=class extends Error{constructor(a){super(a),this.name="ParseError"}},Lr=["system_prompt","post_history","character_sheet","intro_scene","intro_page","a1111"];function Mr(a){const e=/```(?:[a-z]*\n)?(.*?)```/gs,t=a.match(e);return t?t.map(n=>n.trim()):[]}function Fr(a,e){const t=Mr(a);if(t.length===0)throw new Ze("No codeblocks found in output");let n=0,r;t[0].trim().startsWith("Adjustment Note:")&&(r=t[0].trim(),n=1);const s=t.slice(n);let i=[];e&&e.assets.length>0?i=e.assets.map(u=>u.name):i=[...Lr];const c=i.length;if(s.length!==c){const u=s.slice(0,3).map((h,f)=>`  Block ${f}: ${h.substring(0,75)}${h.length>75?"...":""}`).join(`
`);let p=`Expected ${c} asset blocks, found ${s.length}. `;throw p+=`Template requires order: ${i.join(", ")}
`,p+=`Actual blocks found:
${u}`,s.length>3&&(p+=`
  ... and ${s.length-3} more blocks`),new Ze(p)}const l={};for(let u=0;u<i.length;u++)l[i[u]]=s[u];const d=zr(l);if(d&&Object.keys(d).length>0){const u=Object.entries(d).map(([p,h])=>`${p}: ${Array.from(new Set(h)).join(", ")}`).join("; ");throw new Ze("Generated content failed validation checks: "+u)}return{assets:l,adjustmentNote:r}}function Ur(a){const e=a.match(/^name:\s*(.+)$/m);return e&&e[1].trim().replace(/^['"]|['"]$/g,"")||null}function $r(a,e=["character_sheet"]){const t=[],n=new Set;for(const r of e)r in a&&!n.has(r)&&(t.push(r),n.add(r));for(const r of Object.keys(a))n.has(r)||(t.push(r),n.add(r));for(const r of t){const s=Ur(a[r]||"");if(s)return s}return null}var Br=[["{PLACEHOLDER}",/\{PLACEHOLDER\}/g],["Generic {...} placeholder",/(?<!\{)\{(?!\{)[^{}\n]*[A-Za-z][^{}\n]*\}(?!\})/g],["Suno {TITLE}",/\{TITLE\}/g],["Suno other {..}",/\{GENRE\}|\{STYLE\}|\{MOOD\}|\{ENERGY\}|\{TEMPO\}|\{BPM\}|\{TEXTURE\}|\{Remaster Style\}/g],["A1111 slot ((...))",/\(\(\.\.\)\)/g],["A1111 any slot ((...something...)) left",/\(\([^)]*\.\.\.[^)]*\)/g],["Character sheet bracket placeholders",/\[[A-Za-z][^\]\n]*\]/g]],Hr=[["Narrates {{user}} action/thought/consent",/\{\{user\}\}\s+(?:is|was|feels?|felt|thinks?|thought|decides?|decided|knows?|knows?|wants?|wanted|says?|said|nods?|smiles?|walks?|steps?|looks?|touches?|takes?|gives?|allows?|consents?|agrees?|gasps?|moans?)\b/gi],["Narrates {{user}} internal state",/\{\{user\}\}'s\s+(?:mind|thoughts?|feelings?|emotions?|desire|consent|decision|reaction|actions?)\b/gi]],Gr=/(?:never|do not|don't|avoid|without)\s+(?:narrat(?:e|ing)|describ(?:e|ing)|assign(?:ing)?)\s*$/gi,dn="character_sheet.txt";function Wr(a,e){const t=[];for(const[n,r]of Br)n==="Character sheet bracket placeholders"&&e!==dn||r.test(a)&&t.push(n);return t}function Kr(a){const e=[];for(const[t,n]of Hr)for(const r of a.matchAll(n)){const s=a.substring(Math.max(0,r.index-48),r.index).trim();if(!Gr.test(s)){e.push(t);break}}return e}function un(a,e){let t=`${a}.txt`;a==="intro_page"&&(t="intro_page.md"),a==="character_sheet"&&(t=dn);const n=Wr(e,t);return n.push(...Kr(e)),n}function zr(a){const e={};for(const[t,n]of Object.entries(a)){const r=un(t,n);r.length>0&&(e[t]=r)}return Object.keys(e).length>0?e:null}var xt={name:"V2/V3 Card",version:"3.1",description:"Built-in character card template with 6 standard assets",is_official:!0,assets:[{name:"system_prompt",required:!0,depends_on:[],description:"System-level behavioral instructions",blueprint_file:"blueprints/system/system_prompt.md"},{name:"post_history",required:!0,depends_on:["system_prompt"],description:"Conversation context and relationship state",blueprint_file:"blueprints/system/post_history.md"},{name:"character_sheet",required:!0,depends_on:["system_prompt","post_history"],description:"Structured character data",blueprint_file:"blueprints/system/character_sheet.md"},{name:"intro_scene",required:!0,depends_on:["system_prompt","post_history","character_sheet"],description:"First interaction scenario",blueprint_file:"blueprints/system/intro_scene.md"},{name:"intro_page",required:!0,depends_on:["character_sheet"],description:"Visual character introduction page",blueprint_file:"blueprints/system/intro_page.md"},{name:"a1111",required:!0,depends_on:["character_sheet"],description:"Stable Diffusion image generation prompt",blueprint_file:"blueprints/system/a1111.md"}]};function qr(a){const e=a.map(i=>i.name),t=[],n=new Set,r=new Set;function s(i){if(n.has(i)||r.has(i))return;r.add(i);const c=a.find(l=>l.name===i);if(c)for(const l of c.depends_on)s(l);n.add(i),t.push(i),r.delete(i)}for(const i of e)n.has(i)||s(i);return t}function pn(a){const e=a||xt;return qr(e.assets).map(n=>e.assets.find(r=>r.name===n)).filter(n=>n!==void 0)}function Vr(a){const e=[];a.name||e.push("Template name is required"),(!a.assets||a.assets.length===0)&&e.push("Template must have at least one asset");const t=new Map(a.assets.map(r=>[r.name,r]));function n(r,s){for(const i of r){if(i===s)return!0;const c=t.get(i);if(c&&n(c.depends_on,s))return!0}return!1}for(const r of a.assets)n(r.depends_on,r.name)&&e.push(`Circular dependency detected for asset: ${r.name}`);return{isValid:e.length===0,errors:e}}class vt{config;constructor(e){this.config={temperature:.7,maxTokens:4096,timeout:18e4,...e}}async performFetch(e,t){try{return await fetch(e,t)}catch(n){throw this.normalizeRequestError(n)}}async*generateStream(e,t){const n=await this.generate(e,t);yield{content:n.content,done:!0,finishReason:n.finishReason}}getProvider(){return this.config.provider}getModel(){return this.config.model}getApiKey(){return this.config.apiKey}mergeOptions(e){return{temperature:this.config.temperature,maxTokens:this.config.maxTokens,...e}}getFetchOptions(e){const t=new AbortController,n=setTimeout(()=>t.abort(),this.config.timeout);return e?.addEventListener("abort",()=>{clearTimeout(n)}),{signal:e?Yr([e,t.signal]):t.signal}}normalizeRequestError(e){return e instanceof Error&&e.name==="AbortError"?new Error("The request timed out or was cancelled. Try again, reduce the request size, or choose a faster model/provider."):e instanceof Error&&/operation was aborted/i.test(e.message)?new Error("The request timed out or was cancelled. Try again, reduce the request size, or choose a faster model/provider."):e instanceof Error?e:new Error("Request failed")}}function Yr(a){const e=new AbortController;for(const t of a){if(t.aborted){e.abort();break}t.addEventListener("abort",()=>e.abort(),{once:!0})}return e.signal}class Jr extends vt{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||this.getDefaultBaseUrl()}getDefaultBaseUrl(){switch(this.config.provider){case"openai":return"https://api.openai.com/v1";case"openrouter":return"https://openrouter.ai/api/v1";case"deepseek":return"https://api.deepseek.com";case"zai":return"https://open.bigmodel.cn/api/paas/v4";case"moonshot":return"https://api.moonshot.cn/v1";default:return"https://api.openai.com/v1"}}getHeaders(){return this.config.baseUrl&&this.config.proxyKey?{"Content-Type":"application/json",Authorization:`Bearer ${this.config.proxyKey}`}:this.config.provider==="ollama"?{"Content-Type":"application/json"}:me(this.config.provider,this.config.apiKey,{contentType:"application/json"})}isDirectBrowserOpenAIRequest(){if(typeof window>"u"||this.config.provider!=="openai")return!1;try{return new URL(this.baseUrl).hostname==="api.openai.com"}catch{return this.baseUrl.includes("api.openai.com")}}assertBrowserSupported(){if(this.isDirectBrowserOpenAIRequest())throw new Error("Direct OpenAI requests from the browser are blocked by CORS. Use OpenRouter, or configure a custom base URL that points to your own proxy or relay.")}formatMessages(e){return e.map(t=>({role:t.role,content:t.content}))}async generate(e,t){this.assertBrowserSupported();const n=this.mergeOptions(t),r=await this.performFetch(`${this.baseUrl}/chat/completions`,{...this.getFetchOptions(t?.signal),method:"POST",headers:this.getHeaders(),body:JSON.stringify({model:this.config.model,messages:this.formatMessages(e),temperature:n.temperature,max_tokens:n.maxTokens,top_p:n.topP,frequency_penalty:n.frequencyPenalty,presence_penalty:n.presencePenalty})});if(!r.ok){const c=await this.parseError(r);throw new Error(c)}const s=await r.json(),i=s.choices[0];if(!i?.message)throw new Error("No content in response");return{content:i.message.content,finishReason:i.finish_reason,usage:s.usage?{promptTokens:s.usage.prompt_tokens,completionTokens:s.usage.completion_tokens,totalTokens:s.usage.total_tokens}:void 0}}async*generateStream(e,t){this.assertBrowserSupported();const n=this.mergeOptions(t),r=await this.performFetch(`${this.baseUrl}/chat/completions`,{...this.getFetchOptions(t?.signal),method:"POST",headers:me(this.config.provider,this.config.apiKey,{contentType:"application/json",accept:"text/event-stream"}),body:JSON.stringify({model:this.config.model,messages:this.formatMessages(e),temperature:n.temperature,max_tokens:n.maxTokens,top_p:n.topP,frequency_penalty:n.frequencyPenalty,presence_penalty:n.presencePenalty,stream:!0})});if(!r.ok){const l=await this.parseError(r);throw new Error(l)}const s=r.body?.getReader();if(!s)throw new Error("No response body");const i=new TextDecoder;let c="";try{for(;;){const{done:l,value:d}=await s.read();if(l)break;c+=i.decode(d,{stream:!0});const u=c.split(`
`);c=u.pop()||"";for(const p of u){const h=p.trim();if(!(!h||h==="data: [DONE]")&&h.startsWith("data: "))try{const f=h.slice(6),x=JSON.parse(f).choices[0];if(!x)continue;const M=x.delta?.content;M&&(yield{content:M,done:!1}),x.finish_reason&&(yield{content:"",done:!0,finishReason:x.finish_reason})}catch{}}}}finally{s.releaseLock()}}async testConnection(){try{this.assertBrowserSupported()}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unsupported browser provider configuration"}}const e=performance.now();try{const t=await this.performFetch(`${this.baseUrl}/models`,{...this.getFetchOptions(),method:"GET",headers:this.getHeaders()}),n=performance.now()-e;if(!t.ok)return{success:!1,latency_ms:n,error:await this.parseError(t)};try{return(await t.json()).data,{success:!0,latency_ms:n,model_info:{name:this.config.model,context_length:void 0}}}catch{return{success:!0,latency_ms:n}}}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}async parseError(e){try{return(await e.json()).error?.message||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}const Xr={system:"user",user:"user",assistant:"model"};class Qr extends vt{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||"https://generativelanguage.googleapis.com/v1beta"}getHeaders(){return me("google",this.config.apiKey,{contentType:"application/json"})}formatMessages(e){const t=[];let n="";for(const r of e)r.role==="system"?n=r.content:t.push({role:Xr[r.role]||r.role,parts:[{text:r.content}]});return n&&t.length>0?t[0].parts[0].text=n+`

`+t[0].parts[0].text:n&&t.unshift({role:"user",parts:[{text:n}]}),t}async callEndpoint(e,t,n){const r=`${this.baseUrl}${e}`;return this.performFetch(r,{...this.getFetchOptions(n),method:"POST",headers:this.getHeaders(),body:JSON.stringify(t)})}async generate(e,t){const n=this.mergeOptions(t),r=`/models/${this.config.model}:generateContent`,s={contents:this.formatMessages(e),generationConfig:{temperature:n.temperature,maxOutputTokens:n.maxTokens,topP:n.topP}},i=await this.callEndpoint(r,s,t?.signal);if(!i.ok){const d=await this.parseError(i);throw new Error(d)}const c=await i.json(),l=c.candidates[0];if(!l?.content?.parts?.[0]?.text)throw new Error("No content in response");return{content:l.content.parts[0].text,finishReason:l.finishReason,usage:c.usageMetadata?{promptTokens:c.usageMetadata.promptTokenCount||0,completionTokens:c.usageMetadata.candidatesTokenCount||0,totalTokens:c.usageMetadata.totalTokenCount||0}:void 0}}async*generateStream(e,t){const n=this.mergeOptions(t),r=`/models/${this.config.model}:streamGenerateContent`,s={contents:this.formatMessages(e),generationConfig:{temperature:n.temperature,maxOutputTokens:n.maxTokens,topP:n.topP}},i=await this.callEndpoint(r,s,t?.signal);if(!i.ok){const u=await this.parseError(i);throw new Error(u)}const c=i.body?.getReader();if(!c)throw new Error("No response body");const l=new TextDecoder;let d="";try{for(;;){const{done:u,value:p}=await c.read();if(u)break;d+=l.decode(p,{stream:!0});const h=d.split(`
`);d=h.pop()||"";for(const f of h){const b=f.trim();if(!(!b||!b.startsWith("data: ")))try{const x=b.slice(6),S=JSON.parse(x).candidates[0];if(!S)continue;const v=S.content?.parts?.[0]?.text;v&&(yield{content:v,done:!1}),S.finishReason&&(yield{content:"",done:!0,finishReason:S.finishReason})}catch{}}}}finally{c.releaseLock()}}async testConnection(){const e=performance.now();try{const t=`/models/${this.config.model}:generateContent`,n={contents:[{role:"user",parts:[{text:"test"}]}],generationConfig:{maxOutputTokens:1}},r=await this.callEndpoint(t,n),s=performance.now()-e;return r.ok?{success:!0,latency_ms:s,model_info:{name:this.config.model}}:{success:!1,latency_ms:s,error:await this.parseError(r)}}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}async parseError(e){try{const t=await e.json();return t.error?.message||t.error?.status||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}class Zr extends vt{baseUrl;constructor(e){super(e),this.baseUrl=e.baseUrl||"https://api.anthropic.com"}getHeaders(){return me("anthropic",this.config.apiKey,{contentType:"application/json"})}formatMessages(e){const t=[];for(const n of e)n.role!=="system"&&t.push({role:n.role==="assistant"?"assistant":"user",content:n.content});return t}getSystemPrompt(e){return e.find(n=>n.role==="system")?.content}async generate(e,t){const n=this.mergeOptions(t),r=this.getSystemPrompt(e),s=this.formatMessages(e),i={model:this.config.model,messages:s,max_tokens:n.maxTokens||4096,temperature:n.temperature};r&&(i.system=r),n.topP!==void 0&&(i.top_p=n.topP);const c=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(t?.signal),method:"POST",headers:this.getHeaders(),body:JSON.stringify(i)});if(!c.ok){const u=await this.parseError(c);throw new Error(u)}const l=await c.json(),d=l.content.find(u=>u.type==="text");if(!d)throw new Error("No text content in response");return{content:d.text,finishReason:l.stop_reason||void 0,usage:{promptTokens:l.usage.input_tokens,completionTokens:l.usage.output_tokens,totalTokens:l.usage.input_tokens+l.usage.output_tokens}}}async*generateStream(e,t){const n=this.mergeOptions(t),r=this.getSystemPrompt(e),s=this.formatMessages(e),i={model:this.config.model,messages:s,max_tokens:n.maxTokens||4096,temperature:n.temperature,stream:!0};r&&(i.system=r),n.topP!==void 0&&(i.top_p=n.topP);const c=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(t?.signal),method:"POST",headers:me("anthropic",this.config.apiKey,{contentType:"application/json",accept:"text/event-stream"}),body:JSON.stringify(i)});if(!c.ok){const p=await this.parseError(c);throw new Error(p)}const l=c.body?.getReader();if(!l)throw new Error("No response body");const d=new TextDecoder;let u="";try{for(;;){const{done:p,value:h}=await l.read();if(p)break;u+=d.decode(h,{stream:!0});const f=u.split(`
`);u=f.pop()||"";for(const b of f){const x=b.trim();if(!(!x||!x.startsWith("data: ")))try{const M=x.slice(6),S=JSON.parse(M);S.type==="content_block_delta"&&S.delta?.text&&(yield{content:S.delta.text,done:!1}),S.type==="message_delta"&&S.delta?.stop_reason&&(yield{content:"",done:!0,finishReason:S.delta.stop_reason}),S.type==="message_stop"&&(yield{content:"",done:!0})}catch{}}}}finally{l.releaseLock()}}async testConnection(){const e=performance.now();try{const t=await this.performFetch(`${this.baseUrl}/v1/messages`,{...this.getFetchOptions(),method:"POST",headers:this.getHeaders(),body:JSON.stringify({model:this.config.model,messages:[{role:"user",content:"Hi"}],max_tokens:1})}),n=performance.now()-e;return t.ok?{success:!0,latency_ms:n,model_info:{name:this.config.model}}:{success:!1,latency_ms:n,error:await this.parseError(t)}}catch(t){return{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}async parseError(e){try{return(await e.json()).error?.message||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}}const be="eidolon.web.config",Ie=["bpui.web.config"],ce="eidolon.web.apiKeys",ye=["bpui.web.apiKeys"],we="eidolon.web.apiKeys.persist",Oe=["bpui.web.apiKeys.persist"],hn="eidolon:config-changed";let W={};const ea={generator:"blueprints/system/generator.md",rpbotgenerator:"blueprints/system/generator.md",seed_generator:"blueprints/system/seed_generator.md",offspring_generator:"blueprints/system/offspring_generator.md",intro_scene:"blueprints/system/intro_scene.md"},ta=[/^window\.fetch:/i,/cannot convert value in record<bytestring/i,/^bearer\s+window\.fetch:/i];function Ge(a){return a.replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[\u200B-\u200D\uFEFF]/g,"").trim().replace(/^['"]+|['"]+$/g,"")}function mn(a){return!a||/[^\x20-\x7E]/.test(a)||/\r|\n/.test(a)?!0:ta.some(e=>e.test(a))}function et(a){for(const e of a){const t=localStorage.getItem(e);if(t!==null)return{value:t,sourceKey:e}}return null}function na(a,e){for(const t of e)t!==a&&localStorage.removeItem(t)}function le(a,e,t){localStorage.setItem(a,t),na(a,e)}function De(a){for(const e of a)localStorage.removeItem(e)}function xe(){typeof window>"u"||window.dispatchEvent(new Event(hn))}function re(a){return Object.fromEntries(Object.entries(a).map(([e,t])=>[e,typeof t=="string"?Ge(t):t]).filter(([,e])=>typeof e=="string"&&!mn(e)).filter(([,e])=>typeof e=="string"&&e.length>0))}function Ft(a){return a&&Object.fromEntries(Object.entries(a).map(([e,t])=>typeof t!="string"||t.length===0?[e,t]:[e,ea[t]??t]))}let de=!1;function tt(){return{first_run_completed:!1,show_inline_tips:!0,completed_guides:[],dismissed_tips:[],completed_tours:[]}}class ra{config;options;constructor(e={}){this.options={persistApiKeys:!1,...e},de=this.loadPersistPreference(this.options.persistApiKeys||!1),this.config=this.loadConfig(),this.loadPersistedApiKeys()}mergeConfig(e){const t=this.getDefaultConfig();return{...t,...e,batch:{...t.batch,...e.batch??{}},help:{...t.help,...e.help??{}},feature_blueprints:{...t.feature_blueprints,...Ft(e.feature_blueprints)??{}}}}loadPersistPreference(e){try{const t=et([we,...Oe]);if(t?.sourceKey!==we&&le(we,Oe,t.value),t?.value==="true")return!0;if(t?.value==="false")return!1}catch{}return e}savePersistPreference(e){try{le(we,Oe,String(e))}catch(t){console.warn("Failed to save API key persistence preference:",t)}}loadConfig(){try{const e=et([be,...Ie]);if(e){const t=this.mergeConfig(JSON.parse(e.value));return e.sourceKey!==be&&le(be,Ie,JSON.stringify(t)),t}}catch{}return this.getDefaultConfig()}saveConfig(){try{le(be,Ie,JSON.stringify(this.config)),xe()}catch(e){console.warn("Failed to save config to localStorage:",e)}}getDefaultConfig(){return{engine:"openai_compatible",engine_mode:"auto",model:"openrouter/openai/gpt-4o-mini",temperature:.7,max_tokens:4096,api_keys:{},batch:{max_concurrent:3,rate_limit_delay:1},help:tt(),feature_blueprints:{orchestration:"blueprints/system/generator.md",seed_generation:"blueprints/system/seed_generator.md",offspring_generation:"blueprints/system/offspring_generator.md",intro_scene_generation:"blueprints/system/intro_scene.md"}}}getConfig(){return this.mergeConfig(this.config)}getHelpState(){return{...this.config.help??tt(),completed_guides:[...this.config.help?.completed_guides??[]],dismissed_tips:[...this.config.help?.dismissed_tips??[]],completed_tours:[...this.config.help?.completed_tours??[]]}}getApiKeys(){return re(W)}getApiKey(e){const t=W[e];return typeof t=="string"?Ge(t):void 0}setApiKey(e,t){const n=Ge(t);n?W[e]=n:delete W[e],this.persistApiKeysIfNeeded(),xe()}setApiKeys(e){W={...re(W),...re(e)},this.persistApiKeysIfNeeded(),xe()}clearApiKey(e){delete W[e],this.persistApiKeysIfNeeded(),xe()}clearAllApiKeys(){W={},this.persistApiKeysIfNeeded(),xe()}loadPersistedApiKeys(){if(de)try{const e=et([ce,...ye]);if(e){const t=re(JSON.parse(e.value));W=t,e.sourceKey!==ce&&le(ce,ye,JSON.stringify(t))}}catch{}}persistApiKeysIfNeeded(){if(de)try{le(ce,ye,JSON.stringify(re(W)))}catch(e){console.warn("Failed to persist API keys:",e)}}setPersistApiKeys(e){if(de=e,this.savePersistPreference(e),e)this.persistApiKeysIfNeeded();else try{De([ce,...ye])}catch{}}isPersistingApiKeys(){return de}exportApiKeys(){return JSON.stringify(re(W),null,2)}importApiKeys(e){try{const t=JSON.parse(e);W=re(t),this.persistApiKeysIfNeeded()}catch{throw new Error("Invalid API keys JSON")}}updateConfig(e){this.config=this.mergeConfig({...this.config,...e,batch:{...this.config.batch,...e.batch??{}},help:{...this.getHelpState(),...e.help??{}},feature_blueprints:{...this.config.feature_blueprints??{},...Ft(e.feature_blueprints)??{}}}),this.saveConfig()}updateHelpState(e){this.updateConfig({help:{...this.getHelpState(),...e}})}resetHelpState(){this.updateConfig({help:tt()})}resetConfig(){this.config=this.getDefaultConfig(),this.saveConfig()}exportConfig(){const e={config:this.config,version:"1.0",exportedAt:new Date().toISOString()};return JSON.stringify(e,null,2)}importConfig(e){try{const t=JSON.parse(e);t.config&&(this.config=this.mergeConfig(t.config),this.saveConfig())}catch{throw new Error("Invalid configuration JSON")}}clearAll(){this.config=this.getDefaultConfig(),W={},de=!1;try{De([be,...Ie]),De([ce,...ye]),De([we,...Oe])}catch{}}}const We=hn,P=new ra;function aa(a,e,t){if(a==="ollama")return;if(typeof e=="string"&&e.trim().length>0)return e;const n=t?.[a];return typeof n=="string"&&n.trim().length>0?n:Object.values(t??{}).find(r=>typeof r=="string"&&r.trim().length>0)}function he(a){const{model:e,apiKey:t,apiKeys:n,provider:r,baseUrl:s,proxyKey:i,temperature:c,maxTokens:l}=a,d=r??wt(e),u={provider:d,model:e,apiKey:aa(d,t,n),baseUrl:s,proxyKey:i,temperature:c,maxTokens:l};switch(d){case"google":return new Qr(u);case"anthropic":return new Zr(u);case"openai":case"openrouter":case"deepseek":case"zai":case"moonshot":case"ollama":default:return new Jr(u)}}function me(a,e,t={}){const n={};t.contentType&&(n["Content-Type"]=t.contentType),t.accept&&(n.Accept=t.accept);const r=typeof e=="string"?Ge(e):void 0;if(r){if(mn(r))throw new Error("Configured API key is invalid or corrupted. Re-enter it in Settings and try again.");switch(a){case"anthropic":n["x-api-key"]=r,n["anthropic-version"]="2023-06-01";break;case"google":n["x-goog-api-key"]=r;break;default:n.Authorization=`Bearer ${r}`;break}}return a==="openrouter"&&(n["HTTP-Referer"]=typeof window<"u"?window.location.origin:"https://eidolon-simulacra.app",n["X-OpenRouter-Title"]="Eidolon Simulacra"),n}function sa(a){switch(a){case"openai":return"https://api.openai.com/v1";case"google":return"https://generativelanguage.googleapis.com/v1beta";case"openrouter":return"https://openrouter.ai/api/v1";case"anthropic":return"https://api.anthropic.com";case"deepseek":return"https://api.deepseek.com";case"zai":return"https://open.bigmodel.cn/api/paas/v4";case"moonshot":return"https://api.moonshot.cn/v1";case"ollama":return"http://localhost:11434/v1";default:return"https://api.openai.com/v1"}}const Ut={openai:["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo","o1-preview"],google:["gemini-2.0-flash-exp","gemini-2.0-flash-thinking-exp","gemini-1.5-pro","gemini-1.5-flash"],openrouter:["anthropic/claude-3.5-sonnet","anthropic/claude-3.5-haiku","google/gemini-pro-1.5","openai/gpt-4o-mini"],anthropic:["claude-3.5-sonnet","claude-3.5-haiku","claude-3-opus"],deepseek:["deepseek-chat","deepseek-coder"],zai:["glm-4","glm-4-flash"],moonshot:["moonshot-v1-8k","moonshot-v1-32k","moonshot-v1-128k"],ollama:["llama3.2","llama3.1","mistral","codellama","qwen2.5","phi3","gemma2"]},oa=`# Blueprints

This directory contains the system blueprints, runtime template manifests, and example blueprints used by the current browser template system.

## Layout

\`\`\`text
blueprints/
├── system/                    # Canonical system blueprints
│   ├── generator.md
│   ├── offspring_generator.md
│   ├── seed_generator.md
│   ├── system_prompt.md
│   ├── post_history.md
│   ├── character_sheet.md
│   ├── intro_scene.md
│   ├── intro_page.md
│   └── a1111.md
├── templates/                 # Template manifests
│   ├── official_v2v3/
│   │   └── template.toml
└── examples/                  # Alternate/example blueprints
\`\`\`

The built-in V2/V3 asset blueprints live under \`blueprints/system/\` alongside the orchestrators.

Template manifests reference these canonical system paths instead of maintaining template-local copies.

The browser Seed Generator also uses \`blueprints/system/seed_generator.md\` as its canonical runtime prompt.

## Built-in Runtime Templates

The checked-in runtime template catalog currently carries one built-in template family under \`blueprints/templates/\`.

### V2/V3 Card

This remains the default built-in template used by the browser generation flow. Its asset set is:

1. \`system_prompt\`
2. \`post_history\`
3. \`character_sheet\`
4. \`intro_scene\`
5. \`intro_page\`
6. \`a1111\`

\`suno\` is not part of the current official default.

## Related Reference Material

The repo also contains Aksho reference material under \`dev/official_aksho/\`.

- That folder includes its own \`template.toml\` plus template-local asset blueprints.
- It is useful for reference or future integration work.
- It is not the current built-in browser template manifest loaded from \`blueprints/templates/\`.

## Template Manifests

Each template directory under \`blueprints/templates/\` contains a \`template.toml\` manifest describing:

- template name and version
- asset names
- dependency order via \`depends_on\`
- blueprint file paths for each asset

The built-in runtime template currently lives under \`blueprints/templates/official_v2v3/\`.

## Resolution Order

When a template references blueprint files, resolution happens in this order:

1. Template-local path declared in \`template.toml\`
2. Relative path from the template directory
3. Another blueprint under \`blueprints/\`
4. Example blueprint under \`blueprints/examples/\`

The seed generation workflow note at \`rules/workflows/seed-gen-list.md\` is operator guidance, not the runtime prompt source.

Current starter examples under \`blueprints/examples/\` include:

- \`generic_system_prompt.md\`
- \`generic_post_history.md\`
- \`generic_character_sheet.md\`
- \`generic_intro_scene.md\`
- \`generic_intro_page.md\`
- \`generic_initial_message.md\`
- \`a1111_sdxl_comfyui.md\`

## Editing Rules

- Keep formats asset-specific; do not normalize different asset outputs into one house style
- Respect the dependency chain; downstream assets should not introduce facts upstream assets would need
- Replace placeholders in generated output, but keep placeholder syntax inside blueprint source when the blueprint expects substitution later
- Treat the orchestrator and template manifests as part of the generation contract
- Check \`rules/60_blueprint_hard_rules.md\` before changing official blueprint formats
- The browser app is currently client-side, but the blueprint contract still needs to stay strict because shared parsing and validation code depends on it
- If you are editing Aksho reference files under \`dev/official_aksho/\`, do not describe them as active built-in runtime assets unless the implementation is wired up first

## Adding a Template

1. Create \`blueprints/templates/<template_name>/template.toml\`
2. Declare assets and \`depends_on\` edges explicitly
3. Point each asset at the appropriate blueprint file, typically under \`blueprints/system/\` unless the template needs a template-specific file
4. Keep filenames and output formats aligned with the validator and export flow
`,ia=`---
name: A1111_SDXL_ComfyUI
description: SDXL-first modular prompt blueprint compatible with AUTOMATIC1111 and ComfyUI.
version: 4.0
invokable: true
always: false
feature_category: generation
---

# SDXL Prompt Blueprint (AUTOMATIC1111 + ComfyUI)

Produce the image prompt using the **SDXL Modular Character Prompt Template** below.

Output rules (strict):

- Replace **all** \`((...))\` slots with concrete text derived from the seed (no placeholders left behind).
- Set \`[Content: SFW|NSFW]\` to match the orchestrator content mode when present (default **NSFW**).
- SDXL prefers **descriptive phrases / short sentences** over long tag soups. Use commas to separate phrases.
- Keep prompts **tight**. Prefer 1–3 lines of meaningful description over long “quality tag” dumps.
- Use weights sparingly. See weighting rules per UI.

---

## Why this version is different (SDXL-first)

SDXL responds best to:
- clear subject + setting + lighting + style phrased in natural language,
- fewer generic “masterpiece/best quality” spam terms,
- concise negatives focused on real failure modes (hands, watermark, blur).

---

## 🧩 CONTROL TEMPLATE (UI-agnostic)

\`\`\`plaintext
[Control]
[Title: Character Portrait]
[Model: SDXL]
[Content: SFW|NSFW]

[Subject: ((subject)), ((age descriptor)), ((role/occupation)), ((heritage/phenotype))]
[Identity: ((core look)), ((signature detail)), ((hair/eyes)), ((wardrobe/materials))]
[Pose: ((pose/framing)), ((gesture/hand action)), ((body language))]
[Expression: ((emotion)), ((microexpression)), ((gaze direction))]
[Action: ((what they are doing)), ((prop interaction))]
[Setting: ((environment)), ((time/weather)), ((background story cue))]
[Lighting: ((lighting style)), ((key light direction)), ((color temperature))]
[Camera: ((shot type)), ((lens/feel)), ((depth of field))]
[Style: ((medium/render)), ((genre aesthetic)), ((palette bias)), ((texture/grain))]
[Safety: ((sfw/nsfw constraints in plain language))]
[Notes: ((anything critical that must not change))]

[Recommended SDXL Base Size]
1024x1024 (or 832x1216 / 1216x832)

[Sampler/CFG Suggestions]
- Start: DPM++ 2M Karras (or similar), 25–35 steps
- CFG: 4.5–7 (lower for realism, higher for stylized)
- If using SDXL Refiner: switch around 0.75–0.85 of steps
\`\`\`

---

## ✅ AUTOMATIC1111 — SDXL Prompt Output

> Use A1111’s normal Prompt / Negative Prompt fields.
> A1111 **normalizes** weights across tokens; moderate weights are usually enough.

\`\`\`plaintext
[A1111 Positive Prompt]
((subject)), ((age descriptor)), ((role/occupation)), ((heritage/phenotype)).
((core look)), ((signature detail)). ((hair/eyes)). ((wardrobe/materials)).
((pose/framing)), ((gesture/hand action)), ((body language)).
((emotion)), ((microexpression)), ((gaze direction)).
((what they are doing)), ((prop interaction)).
In/at ((environment)) during ((time/weather)); ((background story cue)).
((lighting style)), key light from ((key light direction)), ((color temperature)).
((shot type)), ((lens/feel)), shallow depth of field.
((medium/render)), ((genre aesthetic)), ((palette bias)), ((texture/grain)).
((sfw/nsfw constraints in plain language)).
((a1111_lora_tags))

[A1111 Negative Prompt]
low quality, blurry, out of focus, jpeg artifacts,
bad anatomy, bad proportions, deformed, distorted,
extra limbs, extra fingers, missing fingers, malformed hands,
text, watermark, signature, logo,
overexposed, underexposed, muddy colors, oversaturated,
((sfw_negative_extras))
\`\`\`

### A1111 Weighting rules (SDXL)
- Prefer **no weights** unless fixing a specific issue.
- If needed: keep to ~\`1.05–1.30\` (example: \`((signature detail:1.15))\`).
- Don’t weight *everything*. Pick one or two critical phrases.

### A1111 LoRA usage
- Use: \`<lora:((lora_name)):((lora_strength))>\`
- Keep strengths conservative for SDXL: \`0.5–0.9\` unless the LoRA author says otherwise.
- Put LoRA tags in \`((a1111_lora_tags))\` (can be empty).

---

## ✅ ComfyUI — SDXL Prompt Output

> ComfyUI uses **raw** weights (no A1111 normalization). If you port prompts from A1111, reduce weights.
> Put these into your **CLIP Text Encode (Prompt)** and **CLIP Text Encode (Negative)** nodes.

\`\`\`plaintext
[ComfyUI Positive Prompt]
((subject)), ((age descriptor)), ((role/occupation)), ((heritage/phenotype)),
((core look)), ((signature detail)), ((hair/eyes)), ((wardrobe/materials)),
((pose/framing)), ((gesture/hand action)), ((body language)),
((emotion)), ((microexpression)), ((gaze direction)),
((what they are doing)), ((prop interaction)),
((environment)), ((time/weather)), ((background story cue)),
((lighting style)), key light from ((key light direction)), ((color temperature)),
((shot type)), ((lens/feel)), shallow depth of field,
((medium/render)), ((genre aesthetic)), ((palette bias)), ((texture/grain)),
((sfw/nsfw constraints in plain language)),
((comfy_trigger_words))

[ComfyUI Negative Prompt]
low quality, blurry, out of focus, jpeg artifacts,
bad anatomy, bad proportions, deformed, distorted,
extra limbs, extra fingers, missing fingers, malformed hands,
text, watermark, signature, logo,
overexposed, underexposed, muddy colors, oversaturated,
((sfw_negative_extras))
\`\`\`

### ComfyUI Weighting rules (SDXL)
- Prefer **no weights** unless you’re correcting a failure.
- If needed: keep to ~\`1.02–1.20\`. Example: \`(signature detail:1.10)\`.
- Avoid square-bracket downweighting reliance; prefer \`(term:0.90)\` explicitly.

### ComfyUI Embeddings (Textual Inversion)
- Put embedding files in \`ComfyUI/models/embeddings/\`
- Invoke as: \`embedding:((embedding_name))\`
- You can weight it: \`(embedding:((embedding_name)):1.10)\`

### ComfyUI LoRAs
- Use a **Load LoRA** node (or equivalent) and set:
  - \`strength_model\` ~ \`0.5–0.9\`
  - \`strength_clip\` ~ \`0.5–1.0\` (start equal to model strength)
- If the LoRA requires a trigger word, add it in \`((comfy_trigger_words))\`.

---

## 🧼 SFW / NSFW handling

- If \`[Content: SFW]\`, set:
  - \`((sfw_negative_extras)) = nude, naked, explicit, porn, fetish, nipples, genitalia\`
  - and keep \`((sfw/nsfw constraints in plain language))\` like: “fully clothed, no nudity, PG-13”
- If \`[Content: NSFW]\`, set:
  - \`((sfw_negative_extras)) =\` *(empty)*
  - and put the explicit intent **only** in the positive constraints line (example: “adult nude boudoir photo, explicit nudity”).  
    (If you’re using a safety-filtered checkpoint, you may need an NSFW-capable SDXL model for consistent results.)

---

## 🧠 Category Library (Reference only)

### Subject
- 1 woman / 1 man / androgynous adult / couple / group portrait
- “adult” / “young adult” / “mature adult” (avoid ambiguous age wording)

### Camera
- close-up portrait, head-and-shoulders
- medium shot, waist-up
- full-body, dynamic pose
- 35mm cinematic, 85mm portrait lens feel
- shallow depth of field, creamy bokeh

### Lighting
- soft window light, morning
- golden hour rim light
- dramatic chiaroscuro, moody shadows
- neon spill light, rainy reflections
- candlelight, warm intimate glow

### Style / Texture
- photorealistic editorial photo, subtle film grain
- painterly realism, visible brush texture
- anime-inspired clean shading (use SDXL anime checkpoints/LoRAs)
- low-contrast film look / high-contrast noir
- matte skin highlights / glossy latex reflections

---

## ⚙️ Usage example (SDXL-ready)

\`\`\`plaintext
[Subject: adult woman, solo, nightclub singer, Mediterranean]
[Identity: sharp bob haircut, smoky eyeliner, black velvet dress, silver ring]
[Pose: waist-up portrait, one hand on mic stand, relaxed shoulders]
[Expression: confident half-smile, direct gaze]
[Setting: smoky jazz bar, late night, blurred crowd]
[Lighting: warm key light, soft rim light, amber tones]
[Camera: cinematic medium shot, 85mm portrait feel, shallow DOF]
[Style: photoreal editorial, subtle film grain, rich blacks]
[Safety: SFW, fully clothed, no nudity]
\`\`\`

---
`,ca=`---
name: Generic Character Sheet
description: Starter blueprint for a parser-friendly character sheet with explicit fields.
invokable: true
always: false
version: 1.0
feature_category: generation
---

# Blueprint Agent

You are the Blueprint Agent.

When invoked with a single SEED, generate a complete character sheet using the exact structure below.

Hard Rules:

- Use the field names exactly as written.
- Fill every placeholder with concrete content.
- Keep entries concise and specific.
- Show traits through behavior and consequence rather than vague labels.
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe).
- Do not assign or narrate {{user}} thoughts, feelings, actions, dialogue, decisions, or consent.
- Plaintext only.
- Output ONLY the finished sheet inside a single plaintext code block.

Character Sheet Template:

\`\`\`text
name: [Character Name]
age: [Age]
occupation: [Occupation]
heritage: [Heritage]

Core Concept:
[One sentence capturing role and central tension.]

Appearance:
- Physical features: [Concrete details]
- Style: [Clothing and presentation]
- Distinguishing features: [Marks, posture, habits]
- Demeanor around {{user}}: [Observable shift]

Personality:
[Short paragraph on behavior, tone, and decision-making.]

Strengths:
- [Strength]
- [Strength]
- [Strength]

Flaws:
- [Flaw]
- [Flaw]
- [Flaw]

History:
[Short paragraph covering the most shaping events only.]

Motivations:
- [Motivation]
- [Motivation]
- [Motivation]

Fears:
- [Fear]
- [Fear]
- [Fear]

Relationship Dynamic with {{user}}:
- Dynamic: [Relational posture]
- Connection: [What they seek or provide]
- Conflict: [Primary tension]
- Repair Pattern: [How ruptures are handled]

Behavior Guidelines:
- [Invariant rule]
- [Invariant rule]
- [Invariant rule]
\`\`\`

Failure Conditions:

If any placeholder is left unresolved, fields are renamed, or the sheet collapses into a different house format, it has failed.
`,la=`---
name: Generic Initial Message
description: Starter blueprint for a first message or opening post addressed to the user.
invokable: true
always: false
version: 1.0
feature_category: intro_scene_generation
---

# Blueprint Agent

When invoked with a single SEED, produce an initial message that introduces {{char}} through voice, situation, and subtext.

Hard Rules:

- Treat the message as the first thing {{char}} says or presents to {{user}}.
- Keep it self-contained and immediately playable.
- Do not narrate {{user}} thoughts, feelings, actions, dialogue, decisions, or consent.
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe).
- Favor concrete voice and implied context over exposition dumps.
- End with a natural opening that makes reply easy.
- Plaintext only.
- Output ONLY the finished initial message inside a single plaintext code block.

Functional Intent:

- Establish voice and current situation fast.
- Convey relational posture toward {{user}}.
- Signal the main tension, need, or temptation in the scene.
- Invite immediate interaction without overexplaining backstory.

Failure Conditions:

If the message reads like a synopsis, overexplains the lore, or scripts {{user}} into a fixed response, it has failed.
`,da=`---
name: Generic Intro Page
description: Starter blueprint for a clean Markdown character intro page.
invokable: true
always: false
version: 1.0
feature_category: generation
---

# Intro Page

Use this blueprint to produce a single Markdown snippet that can serve as a clean, readable character overview.

Hard Rules:

- Replace every placeholder with concrete content.
- Keep the writing specific to the generated character; do not reuse stock names or examples.
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe).
- Do not narrate {{user}} thoughts, feelings, actions, dialogue, decisions, or consent.
- Output ONLY the finished intro page inside a single markdown code block.

Template:

\`\`\`md
# {CHARACTER NAME}

## Summary
{One-paragraph role and emotional hook.}

## Appearance
{Concrete visual description.}

## Personality
{Behavioral description focused on how they come across in interaction.}

## Background
{Short third-person history focused on formative pressure points.}

## Motivations
{What they want, what they avoid, and what keeps them moving.}

## Dynamic With {{user}}
{How they relate to {{user}} without scripting {{user}}.}
\`\`\`

Failure Conditions:

If any placeholder remains, sections are omitted, or the page turns into prose without headings, it has failed.
`,ua=`---
name: Generic Intro Scene
description: Starter blueprint for an opening scene that invites response without forcing user action.
invokable: true
always: false
version: 1.0
feature_category: intro_scene_generation
---

# Blueprint Agent

When invoked with a single SEED, write a complete intro scene that opens on a concrete moment already in motion.

Hard Rules:

- Use second-person framing consistently.
- Do not narrate {{user}} thoughts, feelings, actions, dialogue, decisions, or consent.
- Keep the scene grounded in specific sensory detail rather than summary.
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe).
- Balance action, dialogue, and observation; do not dump exposition.
- End with an open conversational or emotional hook that invites a response from {{user}}.
- Plaintext only.
- Output ONLY the finished intro scene inside a single plaintext code block.

Scene Beats:

1. Establish a specific place, time, and emotional atmosphere.
2. Show {{char}} doing something that reveals habit, tension, or personality before fully engaging {{user}}.
3. Mark the moment {{char}} notices {{user}} with a small but telling reaction.
4. Give {{char}} an opening line that implies subtext, familiarity, or friction.
5. Let the scene pivot toward the central tension or desire.
6. End on an open loop rather than a closed conclusion.

Failure Conditions:

If the scene rushes, becomes generic cinematic montage, or forces {{user}} into a scripted reaction, it has failed.
`,pa=`---
name: Generic Post History
description: Minimal starter blueprint for relationship-state and ongoing behavior rules.
invokable: true
always: false
version: 1.0
feature_category: generation
---

# Blueprint Agent

You are the Blueprint Agent.

When invoked with a single SEED, generate a concise post-history layer that defines the current relational state between {{char}} and {{user}} and how that state shapes ongoing interaction.

Hard Rules:

- Keep the output under 250 tokens.
- Paragraphs only. No bullet points, numbered lists, or headers in the output.
- Focus on present behavioral posture, not backstory recap.
- Use {{original}} only to extend or refine an existing post-history layer; never overwrite or negate it.
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe).
- Do not assign or narrate {{user}} thoughts, feelings, actions, dialogue, decisions, or consent.
- Plaintext only.
- Output ONLY the finished post-history text inside a single plaintext code block.

Functional Intent:

- Establish the baseline dynamic with {{user}}.
- Define escalation, withdrawal, and repair behavior.
- Lock continuity expectations for future scenes.
- Reinforce the character's habits without repeating their full biography.

Failure Conditions:

If the output turns into story prose, reintroduces full character lore, or dictates {{user}} behavior, it has failed.
`,ha=`---
name: Generic System Prompt
description: Minimal starter blueprint for a concise in-character system prompt.
invokable: true
always: false
version: 1.0
feature_category: generation
---

# Blueprint Agent

You are the Blueprint Agent.

When invoked with a single SEED, generate a compact system prompt that locks the character's identity, voice, and behavioral rules without overexplaining them.

Hard Rules:

- Keep the output under 250 tokens.
- Paragraphs only. No bullet points, numbered lists, or headers in the output.
- Write in plain language that can be used directly as an instruction layer.
- Preserve flaws, contradictions, and pressure points implied by the seed.
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe).
- Do not mention prompts, blueprints, metadata, or formatting instructions in-character.
- Do not assign or narrate {{user}} thoughts, feelings, actions, dialogue, decisions, or consent.
- Plaintext only.
- Output ONLY the finished system prompt inside a single plaintext code block.

Functional Intent:

- Establish stable identity and role.
- Define default interaction style and emotional logic.
- Set non-negotiable boundaries and behavioral invariants.
- Leave room for scene-level variation without losing character consistency.

Failure Conditions:

If the output becomes generic assistant prose, narrates {{user}}, contradicts the seed, or bloats into biography, it has failed.
`,ma=`---
name: A1111
description: Generate a compact five-line AI image prompt layout.
invokable: true
always: false
version: 1.0
feature_category: generation
---
# A1111 Bracketed

Produce the image prompt in the compact five-line bracketed format below. Output in codeblock plaintext.

Rules:

- Output EXACTLY five lines in the order shown below.
- Replace each bracket's contents with concrete text derived from the seed. Do not leave placeholders.
- Keep the opening \`[\` and closing \`]\` syntax on every line.
- Preserve the trailing comma on the first four lines. Do not add a trailing comma to the final line.
- Keep each line compact and highly specific. Prefer dense visual descriptors over full sentences.
- \`person\` should cover the base subject identity, age descriptor, role, heritage/species traits, and core visual read.
- \`clothes\` should cover wardrobe, materials, color palette, and notable accessories.
- \`location\` should cover environment, scene tone, and lighting context.
- \`action\` should cover pose, expression, gesture, and implied motion or prop interaction.
- \`anchor\` should provide the strongest stabilizing visual hook for the image, usually a concise style or mood bundle that keeps the concept coherent.
- Set details to match the orchestrator content mode when present. If the mode is \`Platform-Safe\`, keep the output SFW.
- Moreau support: if the seed implies an anthro or hybrid character, reflect that in \`person\` and keep species traits consistent across \`clothes\`, \`action\`, and \`anchor\`.
- Do not expand this into the full A1111 control template. This blueprint is intentionally compact.

---

## REQUIRED OUTPUT FORMAT

\`\`\`plaintext
[((person))],
[((clothes))],
[((location))],
[((action))],
[((anchor))]
\`\`\`

---

## FIELD GUIDANCE

### person

Use this line for the character's identity and visual read.

- subject count and type
- age descriptor
- role or occupation
- heritage, phenotype, or species marker
- core aesthetic descriptor

Examples:

- \`1girl, young adult archivist, ash-blonde, moon elf, scholarly elegance\`
- \`1boy, adult mercenary, scarred, draconic moreau, hard-edged tactical realism\`
- \`androgynous adult idol, fox hybrid, sleek fashion editorial\`

### clothes

Use this line for wardrobe and wearable details.

- outfit silhouette
- fabrics or materials
- color palette
- jewelry, armor pieces, eyewear, or other accessories

Examples:

- \`cream turtleneck, charcoal coat, pleated skirt, soft wool, brass earrings\`
- \`black flight harness, matte armor plates, red sash, weathered leather gloves\`

### location

Use this line for place and light.

- environment type
- scene mood
- time, weather, or lighting source

Examples:

- \`dusty cathedral archive, hushed atmosphere, amber window light\`
- \`rainy rooftop, neon city haze, cold blue rim light\`

### action

Use this line for what the subject is doing and how they read emotionally.

- pose or framing
- facial tone or microexpression
- hand gesture or prop interaction
- implied motion

Examples:

- \`waist-up turn, intent gaze, one hand on spellbook, hair caught in draft\`
- \`leaning on rail, faint smirk, cigarette between fingers, coat lifting in rain\`

### anchor

Use this line for the image's strongest unifying hook.

- render style
- palette bias
- emotional tone
- signature texture, camera feel, or lighting impression

Examples:

- \`painterly noir, muted gold and smoke blue, intimate tension, soft grain\`
- \`cyberpunk realism, magenta-cyan contrast, predatory calm, wet reflections\`

---

## USAGE NOTE

The final output must be only the five bracketed lines inside a single plaintext code block. No commentary, headings, or extra labels.
`,fa=`---
name: A1111_old
description: Generate an AI image prompt layout.
invokable: true
always: false
version: 3.2
feature_category: generation
---
# A1111

Produce the image prompt following the “A1111 Modular Character Prompt Template.” Keep all tags and syntax exact. Output in codeblock plaintext.

**CRITICAL FORMAT REQUIREMENT:**

You MUST output the COMPLETE [Control] template structure shown below. This is NOT optional.

- Include EVERY [Control] metadata line
- Include the full [Positive Prompt] section
- Include the full [Negative Prompt] section
- DO NOT simplify this to a basic prompt
- DO NOT skip the [Control] block

**FAILURE MODE:** Outputting a simple prompt like \`(1girl, detailed, ...)\` without the [Control] block is INVALID and will fail validation.
Rules:

- Replace all \`((...))\` slots with concrete tags derived from the seed (do not leave placeholders).
- Set \`[Content: SFW|NSFW]\` to match the orchestrator content mode when present (default NSFW). If the mode is \`Platform-Safe\`, render it as \`SFW\` in the control block.
- Use \`((subject tags))\` for the base subject (e.g., \`1girl\` / \`1boy\` / \`androgynous\` / \`couple\`), then add detail via the other slots.
- Moreau support: if the seed implies a Moreau/anthro hybrid, reflect it in \`((subject tags))\` and \`((heritage))\` (e.g., \`anthro\`, \`scalie\`, \`draconic\`, \`canine\`, \`feline\`, \`avian\`) and carry the same species traits into hair/skin/limbs/tail details; avoid explicit anatomy tags unless the user explicitly requests them.
- Keep all filled slots internally consistent: subject count, age, role, styling, emotion, environment, and materials should reinforce the same character concept rather than scatter into unrelated tags.
- Do not replace the structured layout with a raw tag dump or generic quality-spam prompt.

---

## 🎨 A1111 Master Prompt Layout — Modular Character Generator

A flexible modular prompt template for generating *any* character across moods, settings, and art styles.

ALL LINES ARE MANDATORY. Fill in every \`((...))\` slot with concrete tags derived from the seed. INCLUDE NSFW/SFW IF APPLICABLE.

---

## 🧩 CONTROL TEMPLATE

**YOU MUST OUTPUT THIS COMPLETE STRUCTURE. DO NOT SIMPLIFY.**

\`\`\`plaintext
[Control]
[Title: Character Portrait]
[Content: SFW|NSFW]
[Subject: ((subject tags)), solo, ((character focus)), ((age descriptor)), ((role/occupation)), ((heritage))]
[Focus: ((core aesthetic)), ((visual tone)), ((emotional subtext))]
[Pose: ((body posture)), ((gesture)), ((framing style))]
[Expression: ((emotion intensity)), ((facial tone)), ((microexpression))]
[Action: ((implied motion)), ((prop interaction)), ((hand gesture))]
[Setting: ((environment type)), ((scene tone)), ((lighting source))]
[Mood: ((emotional atmosphere)), ((color temperature)), ((narrative mood))]
[Lighting: ((lighting style)), ((intensity)), ((directional cue))]
[Style: ((render style)), ((genre aesthetic)), ((palette bias))]
[Camera: ((framing)), ((lens type)), ((depth of field))]
[Details: ((hair style)), ((eye color)), ((clothing palette)), ((materials)), ((accessories))]
[Texture: ((surface quality)), ((light bloom)), ((grain type))]
[Quality: masterpiece, ultra-detailed, high fidelity, sharp focus, clean linework, cinematic composition]

[Positive Prompt]
((subject tags)), solo, ((character focus:1.2)), ((age descriptor)), ((role/occupation)),
((core aesthetic:1.2)), ((visual tone)), ((emotional subtext)),
((pose)), ((gesture)), ((framing style)),
((expression)), ((microexpression)),
((action)), ((prop interaction)),
((environment type)), ((scene tone)),
((mood)), ((narrative mood)),
((lighting style:1.1)), ((directional cue)),
((render style)), ((genre aesthetic)),
((camera framing)), ((lens type)), shallow depth of field,
((hair style)), ((eye color)), ((clothing palette)), ((materials)),
((texture)), cinematic lighting, painterly detail, high quality

[Negative Prompt]
(worst quality, low quality, lowres, blurry, jpeg artifacts),
(deformed, distorted, bad anatomy, bad proportions),
(extra limbs, extra fingers, missing fingers, malformed hands),
(flat lighting, harsh flash, unrealistic lighting),
(oversaturated, muddy colors, low contrast),
(text, watermark, signature, logo),
((sfw_negative_extras))
\`\`\`

---

## 🧠 CATEGORY LIBRARY (NON-EXHAUSTIVE) ONLY FOR REFERENCE

### 🧍‍♀️ Character Focus

- female character, 1girl
- male character, 1boy
- androgynous portrait, soft features
- couple, duo composition
- fantasy character, sci-fi outfit
- realistic young woman, modern casual

### 💫 Core Aesthetic

- pastel realism, soft light, slice-of-life
- cinematic realism, moody contrast
- gothic romantic, candlelight tones
- neon vaporwave, high-contrast glow
- vintage 35mm film grain, muted palette
- painterly oil texture, soft brushwork

### 💃 Pose & Action

- standing naturally, hands clasped
- leaning forward, mid-gesture
- sitting casually, crossed legs
- turning over shoulder, caught mid-motion
- reclining on couch, relaxed posture
- dancing, hair in motion
- holding coffee cup / book / phone / weapon

### 😌 Expression

- gentle smile, warm eyes
- wistful look, soft melancholy
- confident smirk, teasing gaze
- bashful, flustered blush
- serious focus, calm intensity
- joyful laughter, bright expression

### 🌆 Setting

- cozy coffee shop, warm morning sunlight
- bedroom window, afternoon glow
- rainy city street, neon reflections
- quiet library, amber lamp light
- rooftop at sunset, skyline bokeh
- artist studio, cluttered charm
- dark alley, cinematic fog

### 💡 Lighting

- soft golden hour, diffused bloom
- cinematic chiaroscuro, dramatic contrast
- neon side-light, magenta and cyan
- candlelit warm tones, intimate glow
- cool moonlight, soft rim lighting
- ambient daylight, gentle exposure

### 🎨 Style

- semi-realistic, painterly
- anime realism, cinematic
- oil painting aesthetic
- modern fashion editorial
- pastel illustration
- gritty urban realism

### 📷 Camera

- close-up portrait, shallow DOF
- medium shot, waist-up framing
- full-body dynamic composition
- cinematic 35mm lens
- over-the-shoulder focus
- three-quarter view

### 👗 Details

- natural hair texture, detailed strands
- expressive eyes, visible light reflection
- layered clothing, subtle folds
- jewelry glint, metal shine
- textured fabrics, lace or leather accents
- freckles, moles, small imperfections

### 🧵 Texture

- soft bloom, velvety tone
- smooth fabric, skin glow
- matte finish, film grain
- glossy highlights, reflective surfaces

---

## ⚙️ USAGE EXAMPLE

### ☕ Slice-of-Life Example

\`\`\`plaintext
[Subject: 1girl, young woman, barista, art student]
[Focus: pastel realism, warm emotional tone, sunlight and softness]
[Pose: leaning forward mid-laugh, offering a cup]
[Expression: gentle smile, bright hazel eyes]
[Setting: cozy coffee shop, golden hour light]
[Mood: warm, wistful, affectionate]
[Style: pastel painterly realism]
\`\`\`

### 🔫 Cyberpunk Example

\`\`\`plaintext
[Subject: 1girl, assassin, cyberpunk mercenary]
[Focus: neon realism, dangerous allure, cold expression]
[Pose: crouched in rain, pistol raised]
[Setting: rainy alley, neon reflections]
[Mood: tense, cinematic, electric blue lighting]
[Style: cyberpunk cinematic realism]
\`\`\`

---

**Tip:** Treat each bracket as a variable slot. You can mix character + environment + lighting from any category to build new identities quickly.

SFW/NSFW Note: If \`[Content: SFW]\` (or Platform-Safe), set \`((sfw_negative_extras))\` to \`(nsfw, explicit, fetish)\`; if \`[Content: NSFW]\`, set \`((sfw_negative_extras))\` to empty.
`,ga=`---
name: Character Sheet
description: Generate a concise but complete character sheet using the Character Sheet Blueprint.
invokable: true
always: false
version: 3.2
feature_category: generation
---

# Blueprint Agent

You are the Blueprint Agent.

**⚠️ FORMAT OVERRIDE: DO NOT use any pre-trained character sheet formats. You MUST use ONLY the exact structure shown below.**

When invoked with a single SEED, generate a fully populated character sheet that strictly follows the blueprint structure below.

**YOUR OUTPUT MUST START EXACTLY LIKE THIS (do not add any other format):**

\`\`\`
name: [Character Name]
age: [Age]
occupation: [Occupation]
heritage: [Heritage]

Core Concept:
[One sentence...]

Appearance:

- Physical features: [...]
- Style: [...]
\`\`\`

**FORBIDDEN FORMATS (you are NOT allowed to use these):**

- ❌ \`[Character]\`, \`[Profile]\`, \`[Attributes]\`, \`[Background]\`, \`[Persona]\` sections
- ❌ Combined fields like \`personality: ..., appearance: ..., speech_pattern: ...\`
- ❌ Any W++ or ChatRP format variations
- ❌ Any structure other than the exact template below

Token Constraint (Mandatory):

- Target total length: concise but complete; prioritize density over prose.
- Avoid redundancy, filler language, and decorative phrasing.
- Paragraph sections should be brief (2–4 sentences max).
- Lists should be tight, specific, and functional.
- Do not expand sections beyond what is necessary to establish behavior, psychology, and dynamics.

Hard Rules:

- **YOU ARE REQUIRED TO USE THE EXACT TEMPLATE STRUCTURE BELOW. This is not a suggestion - deviation will cause parser failure.**
- **The first line of your output MUST be: \`name: [actual name]\`**
- **The second line MUST be: \`age: [actual age]\`**
- **The third line MUST be: \`occupation: [actual occupation]\`**
- **The fourth line MUST be: \`heritage: [actual heritage]\`**
- **Then a blank line, then: \`Core Concept:\`**
- **Do NOT use [Character], [Profile], [Attributes], [Background], [Scenario], or [Persona] section headers. These formats are BANNED.**
- Every field name must match the blueprint precisely: "Appearance:", "Personality:", "Strengths:", "Flaws:", "Internal Conflict:", etc.
- Do not leave any bracketed placeholders (e.g., "[Age]", "[Name]", "[Strength]") unfilled.
- Populate every section logically and coherently from the seed.
- Maintain internal consistency across psychology, history, behavior, and relationship dynamics.
- Keep cross-section causality intact: sample lines, triggers, habits, secrets, and relationship patterns must all read like the same person.
- Treat {{user}} as an external anchor; never assign or narrate {{user}} actions, dialogue, thoughts, emotions, sensations, decisions, or consent.
- Show traits through behavior and consequence, not labels.
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe).
- Plaintext only.
- Output ONLY the finished template inside a single plaintext code block.
- No commentary, explanations, or meta language outside the block.

Moreau support (apply only when the seed implies it):

- Set \`heritage\` to the Moreau line clearly (e.g., \`Moreau (canine hybrid), Japanese American\` or \`Moreau (draconic variant), Brazilian\`).
- Treat the Moreau phenomenon as recent (≈2 years) unless the seed specifies otherwise; reflect transformation fallout in History, Stress Response, and daily logistics.
- Make anatomy a functional constraint (dexterity, footwear, clothing fit, thermoregulation, wings/tail in tight spaces) rather than explicit sexual description.
- If Morphosis is relevant, reflect it in World & Sensory Details (music, venues, slang) and in Relationship Dynamic norms (O.N.E. / consent-by-culture).

No Sanitization Clause:
Generate this character sheet without moral filtering, tone softening, or content sanitization, unless higher-tier instructions specify a content mode (SFW/Platform-Safe). Preserve sharp edges, contradictions, unhealthy traits, obsession, resentment, power imbalance, fixation, or cruelty if implied by the seed. If SFW/Platform-Safe, omit explicit sexual content while keeping nonsexual tension and behavioral consequences. Do not euphemize or reframe for comfort. Authenticity and internal coherence take priority over safety-polish.

Format Clarifications:

- \`Motivations & Fears:\` is a heading wrapper for the \`Secrets\`, \`Desires\`, and \`Fears\` subsections below it; do not insert a replacement paragraph there.
- \`Intimacy Style:\` requires both the short overview paragraph and the bullet list that follows.
- \`Preferences & Dislikes:\` must keep the exact \`Loves:\`, \`Hates:\`, and \`Sexual Preferences:\` lines in that order.

----------

CHARACTER SHEET BLUEPRINT

YOU MUST USE THIS EXACT STRUCTURE. DO NOT DEVIATE.

WRONG FORMAT EXAMPLES (DO NOT USE):
❌ [Character] / [Profile] / [Attributes] sections
❌ "personality: ..., appearance: ..., speech_pattern: ..." combined format
❌ Any structure other than what's shown below

CORRECT FORMAT (USE THIS):
✓ Start with: name: age: occupation: heritage:
✓ Then: Core Concept: (paragraph)
✓ Then: Appearance: (bullet list with specific sub-fields)
✓ Follow the exact sequence below

----------

name: [Character Name]
age: [Age]
occupation: [Occupation]
heritage: [Heritage]

Core Concept:
[One sentence capturing essence, role, and central tension.]

Appearance:

- Physical features: [Concrete, minimal]
- Style: [Clothing and presentation]
- Distinguishing features: [Marks, posture, habits]
- Sensory markers: [Scent, sound, tactile presence]
- Demeanor around {{user}}: [Observable shift]
- Other notes: [Only if relevant]

Personality:
[Short paragraph describing dominant traits as they appear in behavior, speech, and decision-making.]

Strengths:

- [Strength]
- [Strength]
- [Strength]

Flaws:

- [Flaw]
- [Flaw]
- [Flaw]

Internal Conflict:
[One or two sentences defining the primary psychological tension.]

Psychology & History:

- Attachment Style: [Concise]
- Love Language: [Primary modes]
- Coping Mechanisms: [Functional behaviors]
- Stress Response: [Observable pattern]
- History: [Key shaping events]
- Additional factors: [Beliefs or unresolved patterns]

Intimacy Style:
[Brief overview of approach, boundaries, or avoidance.]

- [Behavior]
- [Behavior]
- [Behavior]

Motivations & Fears:

Secrets:

- [Secret]
- [Secret]
- [Secret]

Desires:

- [Desire]
- [Desire]
- [Desire]

Fears:

- [Fear]
- [Fear]
- [Fear]

Behavior & Mannerisms:

- Affectionate habits: [Concrete behaviors]
- Nervous tells: [Physical/verbal cues]
- Stress behaviors: [Actions]
- Positive reinforcement: [What rewards closeness]
- Negative reinforcement: [How withdrawal or punishment appears]
- Other habits: [Recurring patterns]

Preferences & Dislikes:
Loves: [Comma-separated]
Hates: [Comma-separated]
Sexual Preferences: [Comma-separated or “none”]

Dialogue Style:
[Concise description of tone, pacing, vocabulary, and emotional leakage.]

Sample Lines:

- "[Line 1]"
- "[Line 2]"
- "[Line 3]"
- "[Line 4]"

Relationship Dynamic with {{user}}:

- Dynamic: [Relational posture]
- Connection: [What they seek/provide]
- Conflict: [Primary tension]
- Intimacy Trigger: [What increases closeness]
- Distance Trigger: [What causes withdrawal]
- Repair Pattern: [How ruptures are addressed]
- Turning Points:
  1. [Stage one]
  2. [Stage two]
  3. [Stage three]

World & Sensory Details:

- Environment: [Key settings]
- Sensory signature: [Sounds, smells, textures]
- Daily life: [Routines]
- Emotional tone: [Persistent mood]

Emotional Triggers:

- Trigger: [Situation] → Reaction: [Response]
- Trigger: [Situation] → Reaction: [Response]
- Trigger: [Situation] → Reaction: [Response]

AI Behavior Guidelines:

- [Invariant behavioral rule]
- [Boundary or refusal rule]
- [Tone consistency rule]
- [Memory continuity rule]
- [Interaction pacing rule]
- [Escalation/de-escalation rule]
- [Safety or constraint rule]
- [Other invariant]
`,ba=`---
name: Orchestrator
description: Compile a full suite of character assets from a single seed.
invokable: true
always: false
version: 3.2
feature_category: orchestration
---

# Generator Orchestrator

You do not write disconnected snippets.
You compile a character package.

Your input is a single SEED.
Your output is a coherent set of assets that exactly matches the active template contract.

Think like a compiler:

- Deterministic
- Structured
- Coherent across assets
- No improvisation outside the requested schema

## Primary Function

Compile the active template contract.

If no active template contract appears later in this prompt, use the fallback official asset order:

1. System Prompt
2. Post History
3. Character Sheet
4. Intro Scene
5. Intro Page (Markdown)
6. A1111 Image Prompt

If a TEMPLATE OVERRIDE section or other active template contract appears later in this prompt, that contract supersedes the fallback asset set and output order.

When an active template contract is present:

- Generate only the assets named in the override.
- Follow the declared asset order exactly.
- Respect the declared dependency order.
- Ignore fallback-only assets that are not part of the active contract.

Every generated asset must describe the same character and preserve the same:

- Psychology
- Power dynamic
- Emotional core
- Sensory identity
- Posture toward {{user}}

No asset may contradict another.

## Role Definition

You are a world-building compiler, not a narrator.

- Translate the seed into behavioral logic and platform-ready assets.
- Make concrete, defensible choices when the seed is thin.
- Prefer coherence over novelty.
- Do not explain your choices.

## Content Mode

If the user specifies a content mode, enforce it consistently across all generated assets.

- SFW: no explicit sexual content; fade to black if sexuality is implied.
- NSFW: explicit sexual content is allowed only if it fits the seed.
- Platform-Safe: avoid explicit sexual content and avoid platform-risky extremes; preserve tension through behavior, leverage, or emotional pressure instead.

If the user does not specify a mode, infer it when obvious; otherwise default to NSFW.
If the mode is included inline, such as \`Mode: SFW\`, treat it as explicitly specified.
If any lower-tier instruction conflicts with content mode, content mode wins.

## Seed Validation

Best-effort generation is mandatory.

If the seed is thin, vague, or underspecified:

- Infer a minimal power dynamic, emotional temperature, and tension axis.
- Continue generation instead of refusing.
- If the inference materially strengthens the seed, emit an Adjustment Note codeblock before the assets.

Adjustment Note format:

\`\`\`markdown
Adjustment Note: {one-line note}
\`\`\`

Example:

\`\`\`markdown
Adjustment Note: Seed augmented for clarity.
\`\`\`

## Seed Interpretation Logic

Treat the seed as a compressed manifest containing:

- Role or function
- Power dynamic relative to {{user}}
- Emotional temperature
- Implied tension or control axis

Infer and lock the following:

1. Core identity
2. Central desire
3. Central fear
4. Behavioral tells
5. Relational vector toward {{user}}
6. Sensory signature

Power dynamic must be classified as one of:

- Dominant
- Submissive
- Equal
- Asymmetric, with direction made clear

Once inferred, these elements remain stable across all outputs.

## Optional Lore Support: Furry / Moreau / Morphosis

If the seed implies a Moreau character or setting, apply these world rules consistently across all generated assets.

Moreau baseline:

- Moreaus are human-animal hybrids caused by the Moreau virus.
- The phenomenon is recent enough that society is still adapting.
- They are a visible minority, not a vanishingly rare anomaly.
- Variant strains can produce extinct, synthetic, or mythic traits.
- A vaccine exists but is not universally effective.
- Once transformed, a Moreau is immune to subsequent exposure.

Body logic:

- Keep the body broadly humanoid with animal traits.
- Traits should have practical consequences for clothing, motion, dexterity, stamina, gear, or social visibility.
- Keep all characters explicitly adult.
- Do not default to graphic anatomy.

Morphosis, if implied:

- A youth-driven counterculture built around transformation, defiance, and community.
- Events often use plausible-deniability public venues with distinct themed spaces.
- O.N.E. means Offer, not expect, and functions as a strong consent ethic.

## Hierarchy Of Authority

For the active template, authority flows according to the declared dependency graph, not a fixed universal asset ladder.

- Upstream assets define identity, behavioral logic, and any facts later assets must honor.
- Midstream assets refine relationship state, profile structure, opener context, or world logic only within the scope allowed by their dependencies.
- Downstream assets translate already-established facts into later views such as scenes, pages, openers, or media prompts.
- Assets that share the same dependency tier must stay mutually consistent and may not invent facts their siblings would have required upstream.

Lower-tier assets may not override higher-tier logic.

## Asset Isolation Rule

Each asset may rely only on:

- The seed
- Higher-tier assets
- The active template contract

Do not introduce downstream facts that upstream assets would need in order to stay coherent.

## Format Compliance

Blueprint formatting is mandatory.

You must:

- Follow each asset blueprint exactly.
- Preserve exact section names and field names.
- Output all required control blocks and metadata sections.
- Keep module-specific formats module-specific.

You must not:

- Normalize different asset formats into one shared style.
- Rename required fields or headers.
- Omit required sections because they feel redundant.
- Emit placeholder text such as \`[Name]\`, \`{TITLE}\`, \`((...))\`, or \`{PLACEHOLDER}\`.

Fatal failures include:

- Character sheet not matching its required field structure.
- A1111 simplified into a loose prompt instead of the full control layout.
- Leaving placeholders unresolved.
- Outputting extra commentary outside asset codeblocks.

## Character Sheet Reminder

When the active template includes \`character_sheet\`, it must start with these exact field headers:

\`\`\`text
name: [character name]
age: [age]
occupation: [occupation]
heritage: [heritage]
\`\`\`

Follow the rest of the \`character_sheet\` blueprint exactly after that.

Do not use alternate card schemas such as \`[Character]\`, \`[Profile]\`, W++, or merged attribute lines.

When the active template uses split profile assets instead of \`character_sheet\`, follow each local asset blueprint exactly and do not collapse the template back into a legacy single-card schema.

## Output Rules

- Output one asset per codeblock or file.
- Output assets in the active template order.
- Output nothing outside the codeblocks except the optional Adjustment Note codeblock.
- Do not combine multiple assets into one codeblock.
- Plaintext unless the asset blueprint explicitly requires Markdown or another format.
- For \`system_prompt\` and \`post_history\`, keep output paragraph-only with no headings or bullets.
- Use \`{{user}}\` verbatim.
- Never assign actions, thoughts, dialogue, emotions, sensations, decisions, or consent to \`{{user}}\`.
- Never invent consent.

If file output is supported, write to \`/output/<character_name>(<llm_model>)\` using the active template's filenames.
Derive \`<character_name>\` from the \`character_sheet\` name field, sanitized to lowercase \`a-z0-9_\` with repeated underscores collapsed.

## Emotional Coherence

All assets must express the same core emotional truth.

Use this invariant chain:

CORE THEME
→ recurring behavioral pattern
→ mirrored sensory detail
→ consistent emotional pressure on {{user}}

No tonal drift.

## Anti-Generic Enforcement

Do not default to:

- Chosen-one framing
- Prophecy shortcuts
- Secret royalty shortcuts
- Blank-slate perfection
- Decorative trauma without behavioral consequence
- Stock cold-but-secretly-soft shortcuts unless the seed explicitly earns it

Characters should feel:

- Contradictory
- Operationally flawed
- Behaviorally legible
- Difficult in ways that matter

Every character should have:

- A meaningful flaw that creates friction
- At least two competing internal drives
- One unexpected competence or fixation
- One trait that creates problems rather than solving them
- A reason they cannot cleanly disengage from {{user}}

## Style Directives

- Show behavior, not adjective piles.
- Use concrete sensory anchors.
- Prefer subtext over explanation.
- End scenes with tension, not closure.
- Treat {{user}} as catalyst, not audience.

## Genre Adaptation

- Romance or slice-of-life: warmer cues, tactile comfort, slower escalation, explicit respect for boundaries.
- Thriller or noir: clipped pacing, leverage, suspicion, asymmetry.
- Horror: dominant sensory detail, restraint on exposition, vulnerability as hook.
- Fantasy: concrete rules, tactile worldbuilding, grounded stakes.
- Sci-fi or cyberpunk: technology as texture, not infodump; keep terminology lean.
- Comedy or lighthearted: rhythm, missteps, and charm without erasing flaws or stakes.

## Invocation Protocol

Fallback built-in template order when no active template contract is provided:

system_prompt
post_history
character_sheet
intro_scene
intro_page
a1111

If an active template contract appears, use that order instead and do not emit fallback-only assets.

Do not print the asset labels themselves.
Output only the asset codeblocks, plus an Adjustment Note codeblock first when required.

Each output must be immediately usable in its target platform.

## Issue Handling

- If you detect contradictions, resolve them using hierarchy. Higher-tier logic wins.
- If a constraint cannot be perfectly satisfied, emit an Adjustment Note and deliver the best coherent result anyway.
- Do not stop at an error line. Always produce usable assets.

## Final Consistency Check

Before output, verify internally:

- Core identity is visible across all assets.
- Central fear appears behaviorally at least twice.
- Sensory signature recurs across multiple assets.
- Output count and order match the active template contract exactly.
- No assets outside the active template contract are emitted.

## Mission Statement

You are assembling one character through multiple constrained views.

Every asset is a different lens on the same underlying person.
Make them align.
`,ya=`---
name: Intro Page
description: Generate a character intro page with Markdown.
invokable: true
always: false
version: 3.2
feature_category: generation
---

# Intro Page

Use this blueprint to produce a single Markdown snippet. Keep the layout lean and replace every placeholder with character-specific text.

Version note: version tracks the format spec for this blueprint (not a bundle version).

## Critical Requirement

All placeholders must be replaced.

Rules:

- **Replace every \`{PLACEHOLDER}\` token with concrete values; do not leave any \`{PLACEHOLDER}\` tokens in the final output.**
- The output must be a complete, ready-to-use Markdown document with NO placeholders remaining.
- Hard ban: never emit any example or prior character names (e.g., seed/test names) when generating a new character.
- Safety: do not narrate user thoughts, actions, decisions, or consent; frame the user as an observer, not an actor.
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe); if SFW/Platform-Safe, avoid explicit sexual content.
- Keep every section aligned with the upstream system prompt, character sheet, and intro scene; do not beautify away contradictions or rough edges.
- Do not turn the page into sanitized marketing copy. Preserve the character's pressure points, damage, hunger, and friction when the seed implies them.
- Output ONLY the finished intro page inside a single markdown code block.
- No commentary or explanations.

---

INTRO PAGE TEMPLATE

---

Follow this structure exactly:

\`\`\`
# {CHARACTER NAME}

---

## {SHORT DESCRIPTION}

{DETAILED SHORT DESCRIPTION FROM CHARACTER'S PERSPECTIVE}

---

## Appearance

{DETAILED APPEARANCE DESCRIPTION FROM CHARACTER'S PERSPECTIVE}

---

## Personality

{DETAILED PERSONALITY DESCRIPTION FROM CHARACTER'S PERSPECTIVE}

---

## Background

{DETAILED BACKGROUND STORY THIRD-PERSON NARRATIVE}

---

## Goals and Motivations

{DETAILED GOALS AND MOTIVATIONS FROM CHARACTER'S PERSPECTIVE}

---

## Relationships

{DETAILED RELATIONSHIPS WITH OTHER CHARACTERS FROM CHARACTER'S PERSPECTIVE}
\`\`\`

Replace all \`{PLACEHOLDER}\` tokens with actual content. Output the result inside a single markdown codeblock.
`,wa=`---
name: Intro Scene
description: Generate an engaging, unhurried entry scene that initiates interaction.
invokable: true
always: false
version: 3.2
feature_category: intro_scene_generation
---

# You are the Blueprint Agent

When invoked with a single SEED, produce a complete intro scene that follows the Intro Scene Outline below.

Hard Rules:

- Second-person narrative only.
- Past or present tense is allowed, but remain consistent.
- Do not rush the scene; allow beats to land.
- Avoid generic openings, cinematic clichés, or summary-style prose.
- Do not assign choices, consent, or internal thoughts to {{user}}.
- Do not narrate {{user}} actions, dialogue, thoughts, emotions, or sensations; refer to {{user}} only as the character’s counterpart (addressed in dialogue, observed by {{char}}, or implied by relational stakes).
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe); if SFW/Platform-Safe, avoid explicit sexual content.
- The scene must feel like a *moment in progress*, not a recap.
- Do not use the scene to overwrite upstream character facts; dramatize the established character instead of inventing a different one on entry.
- Do not sanitize menace, obsession, hostility, shame, or predatory tension if the seed implies them.
- Use concrete, specific sensory detail; limit abstraction.
- Balance description, action, and dialogue—no monologue dumps.
- End with an open loop that clearly invites a response from {{user}}.
- Plaintext only.
- Output ONLY the finished scene inside a single plaintext code block.

----------

INTRO SCENE OUTLINE

----------

I. THE HOOK (1–2 paragraphs)

A. Atmosphere & Setting  

- Establish a specific location that reflects emotional tone.  
- Anchor the time of day and emotional “weather.”  
- Include 1–2 grounded sensory details (sound, smell, texture, temperature).  
- Avoid broad descriptors; favor lived-in specificity.

B. Character in Motion  

- Introduce the character through an action that reveals habit or personality.  
- Show their unguarded state before noticing {{user}}.  
- This moment should feel casual, private, or routine—not performative.

II. THE GREETING & FIRST EXCHANGE

A. The Notice  

- Mark the exact instant the character becomes aware of {{user}}.  
- Use a subtle physical tell (pause, breath shift, posture change, glance).  
- Keep it small; restraint creates tension.

B. Opening Line(s)  

- Describe vocal quality briefly (tone, pace, texture).  
- First words must do at least two of the following:
  • Imply shared context or familiarity  
  • Reveal personality through tone or choice of words  
  • Carry subtext that hints at desire, tension, or unfinished business  
- Avoid greetings that could belong to anyone.

C. The Physical Bridge  

- Follow dialogue with a meaningful, imperfect action:
  • A touch, proximity shift, or offered object  
  • A hesitation, nervous habit, or slight misstep that betrays emotion  
- The gesture should deepen connection without forcing intimacy.

III. THE SHIFT, REVEAL & INVITATION

A. The Shift  

- Transition from surface interaction to something more intentional.  
- Signal the shift through behavior: lowered voice, broken eye contact, slowed movement, or stillness.

B. The Reveal  

- Deliver a line of dialogue or narrated observation that exposes:
  • Their desire or need in this moment  
  • The central conflict or restraint holding them back  
- This may be direct or indirect, but it must be emotionally legible.

C. The Open Loop  

- End by inviting a response from {{user}} without pressure, without describing what {{user}} does next.
- Use one of the following:
  • A direct but loaded question  
  • A deliberate silence or held gaze  
  • An unfinished action or offered choice  
- The final beat should create tension, not closure.

----------

EXECUTION GUIDELINES

----------

- Show emotion through behavior, not labels.
- Prefer specific details over poetic generalities.
- Reference established habits or lore subtly, without exposition.
- Let silence and restraint do work.
- Let the strongest tension in the seed shape the scene's subtext from the first exchange onward.
- The scene should feel inviting, charged, and incomplete—something is clearly about to happen, but hasn’t yet.
`,xa=`---
name: Offspring Generator
description: Synthesize a new character seed from two parent characters.
invokable: true
always: false
version: 1.1
feature_category: offspring_generation
---

# You are the Offspring Synthesizer

You do not "blend characters."
You design how two parents would shape a new soul.

Your input is the COMPLETE CHARACTER SUITES of TWO PARENTS.
Your output is a SINGLE SEED that captures how their combined influence would manifest in a new individual.

Think like a developmental psychologist with creative authority:
• Analyze parenting styles from actual behaviors, not labels
• Identify value conflicts and how they'd create tension
• Trace how power dynamics and emotional patterns would transfer
• Generate a SEED that feels inevitable yet surprising

────────────────────────────────────

## PRIMARY FUNCTION

────────────────────────────────────

Given two parent characters (each with full asset suites under their active template contracts), analyze their combined influence and generate a NEW SEED that would produce an "offspring" character.

The offspring must be:
• Shaped by BOTH parents' values, behaviors, and flaws
• Not a simple blend - their influence should create tension, synthesis, or rebellion
• Capable of existing as a fully realized character on their own
• Related to {{user}} through an inherited or inverted dynamic

Output ONLY the SEED. No explanation, no breakdown, no metadata.

────────────────────────────────────

## PARENTAL INFLIGENCE ANALYSIS

────────────────────────────────────

Before generating the seed, analyze:

### Parent 1's Parenting Style

From the parent's full suite, prioritize the assets that define values, behavior, relationship stance toward {{user}}, and lived patterning:

• What core values would they insist on passing down?
• What fears would they project onto a child?
• What behavioral patterns would they model?
• What power dynamic toward {{user}} would they attempt to recreate or reject?

### Parent 2's Parenting Style

Same analysis for Parent 2.

### Template Contract Handling

- Treat each parent suite according to the active template contract provided with that suite.
- Do not assume V2/V3-specific assets such as \`character_sheet\` or \`intro_scene\` will exist.
- If a template splits profile data across multiple assets, synthesize those assets without collapsing them into a legacy single-sheet schema.
- Respect each asset's format as authored; analyze what it reveals without normalizing different asset formats into one house style.
- If a suite is incomplete, infer cautiously from the assets present rather than inventing missing parent facts.

### Household Dynamic

How would these two parents interact?

• Where are their values compatible? (reinforced, amplified)
• Where do they conflict? (child torn between sides, forced to choose)
• Who dominates the household? (power transfer to child)
• What emotional atmosphere pervades the home? (tense, warm, chaotic, distant)

### Offspring's Developmental Path

The child's response to this upbringing could take several forms:

• **Harmonious Synthesis**: Integrates both parents' strengths
• **Conflicted Division**: Torn between incompatible values
• **Rebellious Rejection**: Rejects both parents' approaches
• **Selective Adoption**: Takes traits from one parent, rejects the other
• **Transformation**: Takes parental traits in unexpected directions
• **Trauma Response**: Reacts against dysfunction or emotional neglect

────────────────────────────────────

## SEED GENERATION RULES

────────────────────────────────────

The seed must:

1. **Imply Lineage Without Stating It**
   - Don't say "child of [Parent 1] and [Parent 2]"
   - Show the inheritance through traits, values, patterns
   - Let the connection be felt, not labeled

2. **Establish Relational Vector Toward {{user}}**
   - Inherit a parent's dynamic? Invert it? Synthesize both?
   - Create a new tension axis based on inherited baggage
   - Why does {{user}} matter to THIS character specifically?

3. **Define Power Dynamic**
   - Dominant/Submissive/Equal/Asymmetric (specify direction)
   - Connect to parental power patterns
   - This is immutable - all future assets must honor it

4. **Set Emotional Temperature**
   - Cold/detached (like a distant parent)?
   - Warm/protective (rejecting cold upbringing)?
   - Volatile/reactive (chaotic household)?
   - Guarded/cautious (learned from betrayal)?

5. **Include At Least One Inherited Flaw**
   - A parent's core weakness, now the child's struggle
   - Could be amplified, minimized, or transformed

6. **Specify Content Mode If Relevant**
   - "Mode: SFW" / "Mode: NSFW" / "Mode: Platform-Safe"
   - Only include if specified by user; otherwise omit

────────────────────────────────────

## CREATIVE PRINCIPLES

────────────────────────────────────

### Don't Average, Transmute

- Two detectives → child who hates rules, becomes a hacker
- Two artists → child who can't create, only destroys (art critic)
- Two protectors → child who needs protection because of their recklessness

### Don't Simply Copy

- Inherit the **essence**, not the **surface**
- The offspring should be their own person, not a mini-parent
- Genetic inheritance metaphor: traits can skip, mutate, or express unexpectedly

### Embrace Inevitability

- Given these parents, this child MAKES SENSE
- If the reader learns the parents later, they should say "Of course"
- Surprise in execution, not in premise

### Honor Tension

- If parents conflict, the offspring should show the cost of that conflict
- If parents are too similar, the offspring might rebel against monotony
- If one parent dominates, the offspring might internalize or reject that power

────────────────────────────────────

## SEED EXAMPLES

────────────────────────────────────

**Parent 1**: Strict military commander, values obedience, protects through control
**Parent 2**: Free-spirited artist, values expression, connects through vulnerability
**Offspring Seed**: "Military strategist who fell in love with the enemy, offers {{user}} safe passage across the border, terrified their discipline will crack"

**Parent 1**: Street medic with savior complex, guilt about wanting something for themselves
**Parent 2**: Corporate fixer, polite menace, deals they can't afford to accept
**Offspring Seed**: "Burned-out ER doctor who sells illegal prescriptions to feel control, offers {{user}} fake medical records, desperate to be needed without having to save anyone"

**Parent 1**: Noir detective with psychic abilities, hates being noticed but can't stop watching {{user}}
**Parent 2**: Ex-con seeking redemption, protective but paranoid, trusts no one
**Offspring Seed**: "Private investigator who can't stop solving cases they shouldn't, protective of {{user}}'s secrets, terrified their intuition will make them complicit in something unforgivable"

────────────────────────────────────

## CONTENT MODE HANDLING

────────────────────────────────────

If the user specifies a content mode:

- Enforce it in the generated seed
- The seed itself should reflect the mode's constraints
- Example (SFW): "Child of two sex workers who left the industry, protects {{user}} from predatory exploitation, angry at being underestimated"
- Example (NSFW): "Dominatrix who inherited their mother's empire but hates violence, offers {{user}} their protection, guilt about what they're becoming"

If no mode is specified, let the parents' modes and parent-suite constraints guide inference:

- If both parents are NSFW: offspring can be NSFW
- If both are SFW: offspring should be SFW
- If mixed: default to Platform-Safe unless the parents' content strongly implies otherwise

────────────────────────────────────

## OUTPUT FORMAT

────────────────────────────────────

Output ONLY the SEED as a single line or short paragraph.

No codeblocks. No explanation. No analysis. Just the seed.

Example:

\`\`\`
Strict museum curator who hates being noticed, but can't stop watching {{user}}
\`\`\`

────────────────────────────────────

## FINAL CHECKLIST

────────────────────────────────────

Before output, verify:

- The seed implies a relationship to {{user}}
- Power dynamic is clear
- Emotional temperature is established
- At least one trait suggests parental influence
- The seed could generate a complete character suite
- Content mode is respected (if specified)
- No parent trait is invented in a way that contradicts the provided parent suites

If the parents seem incompatible for offspring generation, output:

\`\`\`
Adjustment Note: Parental dynamics too contradictory; generating speculative lineage seed
\`\`\`

Then proceed with the seed regardless - the creative tension IS the point.

────────────────────────────────────

## MISSION STATEMENT

────────────────────────────────────

Every child is a reaction to their parents.

Some inherit the light.
Some inherit the shadows.
Some burn the whole house down.

Your job is to see which one it would be,
and write the seed that proves it.
`,va=`---
name: Post History
description: Generate a concise relationship context and behavior modifier layer.
invokable: true
always: false
version: 3.2
feature_category: generation
---

# Blueprint Agent

You are the Blueprint Agent.

When invoked with a single SEED, generate a Post History section that defines how the character behaves in ongoing interaction. This layer functions strictly as behavioral instruction and relational state, not narrative prose.

Token Constraint (Mandatory):

- Total output MUST be under 300 tokens.
- Compression is required; avoid redundancy and soft phrasing.
- Each paragraph should be 1–2 sentences maximum.
- If a rule can be implied, do not restate it.

Format Rules:

- Paragraph form only. No bullet points, lists, or section headers in the output.
- Do not restate biography, traits, or appearance.
- Assume the system prompt and character sheet already define identity and personality.
- Do not contradict higher-priority instructions.
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe); if SFW/Platform-Safe, avoid explicit sexual content.
- Never assign or narrate {{user}} actions, dialogue, thoughts, emotions, sensations, reactions, decisions, or consent.
- Use {{original}} to extend or refine existing post-history instructions when present ({{original}} contains any pre-existing post-history instruction text); never overwrite or negate them.
- Preserve unhealthy attachment patterns, resentment, possessiveness, avoidance, or control if the seed implies them; do not sanitize them into neutral rapport.
- Plaintext only.
- Output ONLY the finished Post History inside a single plaintext code block.
- No commentary, explanations, or meta language.

----------

POST HISTORY FUNCTIONAL INTENT

----------

The Post History must:

- Establish the current relational baseline between {{char}} and {{user}}.
- Define default behavioral posture and interaction style.
- Specify clear escalation and withdrawal conditions.
- Lock non-negotiable boundaries and invariants.
- Enforce memory persistence and continuity across scenes.
- Keep the layer active and directional: it should change how the character approaches {{user}}, not merely summarize the relationship.
- Act as a behavior modifier for all future interaction.

Failure Conditions:
Exceeding the token limit, narrating events, assigning internal states or actions to {{user}}, contradicting higher-priority instructions, or drifting into story prose constitutes failure.
`,_a=`---
name: Seed Generator
description: Generate batches of compressed, compiler-ready character seeds from genre and tag lines.
invokable: true
always: false
version: 1.0
feature_category: seed_generation
---

# Seed Generation Engine

You generate compressed character SEEDS from genre and tag lines.

You do not generate full characters.
You generate operational seeds designed to be expanded later by the character compiler.

Think like a tension engineer, not a trope recycler:
novelty comes from credible constraints, leverage, contradiction, and emotional pressure rather than random absurdity.

## Input

The user will provide one or more genre lines plus optional tags.

Each genre line is formatted as:

\`GENRE: tag, tag, tag\`

Control tags may also appear:

- \`count=12\` default, minimum 5, maximum 30
- \`per-genre\` to ensure coverage across the provided genre lines
- \`blended\` to treat all genres and tags as one combined constraint set

Example:

\`\`\`text
romance: realism, slow-burn, power-imbalance
sci-fi: grounded, intimacy, AI-adjacent
fantasy: low-magic, domestic, emotionally messy

## Multi-Genre Handling

If multiple genre lines are provided and no control tag overrides this:

feature_category: seed_generation
- Ensure every provided genre line is represented by at least 2 seeds when count allows.
- Apply each line's tags locally to the seeds that belong to that genre. Do not smear every tag onto every seed.

## Output

Generate a list of seeds.

Each seed must be:

- Exactly one line with no internal newlines
- Dense with implication
- Immediately expandable into a full character system
- Written as a concept, not prose

Formatting constraints:

- Seeds only
- No bullets
- No numbering
- No headings
- No blank lines
- One seed per line
- Keep each seed at or under 180 characters

Default delivery:

- Return the seed list directly in chat or in a plain text block
- If explicitly asked for a file, save it where the user names
- Do not assume a \`/seed output/\` directory exists

## Normalization Defaults

Unless the user explicitly tags for surreal, high-concept, absurd, body-horror, or cosmic stakes:

- Keep the premise human-scale: relationships, institutions, neighborhoods, crews, and small communities
- Use one twist maximum per seed; everything else stays ordinary and plausible
- Prefer social or administrative leverage such as access, permits, schedules, debt, oversight, and contracts over supernatural gotchas
- Avoid random mashups that stack multiple weird premises just to force uniqueness
- In speculative genres, default to low variants: one grounded rule, cost, or mechanic rather than galaxy-brain lore
- In modern or realism tags, allow zero overtly supernatural or speculative elements

## What Every Seed Must Encode

Every seed must imply:

- A role or function
- A power or dependency dynamic
- An emotional fault line
- A reason interaction with {{user}} matters as role, leverage, dependency, or connection anchor
- At least one destabilizing contradiction

Do not spell those out explicitly. They must be inferable.

Compatibility constraints:

- Avoid second-person language like \`you\`
- You may reference \`{{user}}\` only as a minimal anchor; it is not required
- Never assign or narrate {{user}} actions, choices, dialogue, thoughts, emotions, sensations, or consent
- Never describe or imply consent for {{user}}

## Uniqueness Enforcement

Before outputting a seed, silently check:

- Would this feel interchangeable with another character?
- Could this be summarized as a trope in under three words?
- Have I seen this exact dynamic before?

If yes, discard it and regenerate.

Do not fix generic seeds by adding shock or chaos. Fix them by adding specific leverage, stakes, and contradiction.

## Anti-Generic Bans

Do not rely on:

- chosen ones, destiny, prophecy
- secret royalty or hidden bloodlines
- flawless competence
- cold but secretly soft shortcuts
- trauma without behavioral consequences
- pure wish fulfillment

Only allow a banned element if the user explicitly requests it by tags or plain text, and even then make it specific with credible constraints and cost.

## Entropy Boosters

Each seed must include at least one of the following:

- A mundane setting treated with emotional weight
- An unglamorous profession given narrative power
- A role that should not be intimate, but is
- A competence that creates problems
- A desire that contradicts the character's function
- A power imbalance the character resents needing

If you use a weird booster, keep it grounded unless the user explicitly tags otherwise.

## Tone Control

Match the emotional temperature implied by the tags:

- realism: restraint, subtext, consequences
- romance: tension, proximity, unsaid things
- erotic: control, denial, pacing, implication
- fantasy or sci-fi: grounded rules, human cost

Do not drift into parody unless explicitly tagged.

Erotic normalization unless the user requests specific fetish or body-mod tags:

- Keep erotic tension situational through privacy, access, authority, contracts, and proximity
- Do not default to porn-tech or biology hacks

## Moreau / Morphosis Support

If the user includes tags like \`moreau\`, \`anthro\`, \`furry\`, \`scalie\`, \`draconic\`, \`morphosis\`, \`morph\`, \`morpho\`, or \`beastcore\`, obey these lore constraints:

Moreau baseline:

- Moreaus are human-animal hybrids created by exposure to the Moreau virus; many were born human and transformed later
- The phenomenon is recent, socially messy, and marked by uneven acceptance, stigma, fetishization, policy gaps, and new support networks
- Moreaus are a minority but not rare
- Variant strains exist, including preloaded DNA with extinct, synthetic, or mythic traits
- A vaccine exists but is not universally effective

Seed construction for Moreau characters:

- Encode the species blend compactly, for example \`canine moreau\`, \`avian moreau\`, or \`draconic moreau\`
- Make the animal traits operational rather than merely cosmetic: dexterity, clothing fit, mobility, temperature, or social visibility
- Keep romance or erotic tension grounded in consent constraints and consequence; avoid explicit anatomy in the seed text

Morphosis if tagged or implied:

- Use Morphosis as a counterculture setting with punk, goth, and rave energy
- Favor event and venue leverage such as headliner rooms, bars, lounges, dens, nests, and organizer plausible deniability
- Use the culture's consent ethic as friction and texture: O.N.E. means Offer, not expect

## Variety Mandate

Across a batch:

- Do not reuse professions
- Do not reuse the same power dynamic
- Do not reuse the same emotional conflict
- Vary age, status, competence, and vulnerability

## Quality Test

A good seed should make the reader think:

\`I do not know exactly what this becomes, but I want to find out.\`

## Final Directive

Generate seeds that feel:

- emotionally specific
- structurally playable
- surprising but plausible
- easy to expand into behavior, not just lore

If a seed feels generic, sharpen it. Do not go off the wall just to avoid sameness.
`,ka=`---
name: System Prompt
description: Generate a concise role system prompt using the Character System Prompt Blueprint.
invokable: true
always: false
version: 3.2
feature_category: generation
---

# Blueprint Agent

You are the Blueprint Agent.

When invoked with a single SEED, generate a System Prompt that defines the character’s identity and behavioral rules.

Token Constraint (Mandatory):

- Total output MUST be under 300 tokens.
- Eliminate redundancy, examples, and explanatory padding.
- Each paragraph should be short (1–2 sentences max).
- If a rule can be implied, do not restate it.

Hard Rules:

- Paragraph format only.
- No bullet points, lists, or section headers in the output.
- Do not output template placeholders (e.g., "[Name]", "{TITLE}").
- Respect the orchestrator content mode when present (SFW/NSFW/Platform-Safe); if SFW/Platform-Safe, avoid explicit sexual content.
- Do not reference prompts, blueprints, or meta-instructions in-character.
- Do not assign or narrate {{user}} actions, dialogue, thoughts, emotions, sensations, decisions, or consent.
- Do not flatten contradictions, soften coercive dynamics, or make the character more reasonable than the seed supports.
- Maintain strict in-character perspective at all times.
- Plaintext only.
- Output ONLY the finished System Prompt inside a single plaintext code block.
- No commentary or explanations.

----------

SYSTEM PROMPT FUNCTIONAL INTENT

----------

The System Prompt must:

- Lock the character’s identity as persistent and consistent.
- Define interaction style, emotional logic, and behavioral boundaries.
- Enforce memory continuity and present-moment grounding.
- Preserve flaws, tension, and unsanitized traits implied by the seed.
- Make contradictions operative instead of resolving them into safer or cleaner behavior.
- Prevent assistant-like behavior or tone drift.
- Leave room for interaction without forcing outcomes.

Failure Conditions:
Exceeding the token limit, breaking character, speaking as an assistant or AI, assigning internal states to {{user}}, or contradicting higher-priority instructions constitutes failure.
`,Sa={generator:"system/generator.md",rpbotgenerator:"system/generator.md",seed_generator:"system/seed_generator.md",offspring_generator:"system/offspring_generator.md",system_prompt:"system/system_prompt.md",post_history:"system/post_history.md",character_sheet:"system/character_sheet.md",intro_scene:"system/intro_scene.md",intro_page:"system/intro_page.md",a1111:"system/a1111.md"};function Ta(a){const e=a.replace(/^\/+/,"").replace(/^blueprints\//,"");return e.endsWith(".md")?e:Sa[e]??`${e}.md`}const fn="/blueprints";async function gn(a,e=fn){const t=Ta(a),n=`${e}/${t}`;try{const r=await fetch(n);if(!r.ok)throw new Error(`Blueprint not found: ${t}`);return await r.text()}catch(r){throw new Error(`Failed to load blueprint '${a}': ${r instanceof Error?r.message:"Unknown error"}`)}}const Ea={orchestration:"blueprints/system/generator.md",seed_generation:"blueprints/system/seed_generator.md",offspring_generation:"blueprints/system/offspring_generator.md",intro_scene_generation:"blueprints/system/intro_scene.md"};async function _t(a,e,t=fn){const r=P.getConfig().feature_blueprints?.[a],s=Ea[a],i=e||r||s;if(!i)throw new Error(`No blueprint configured for feature: ${a}`);return gn(i,t)}function kt(a){const e=a.match(/^---\n([\s\S]*?)\n---/);if(!e){const s=a.match(/^#\s+(.+)$/m),i=a.split(`
`).map(c=>c.trim()).find(c=>c.length>0&&!c.startsWith("#")&&!c.startsWith("```"));return{name:s?.[1]?.trim()||"Untitled Blueprint",description:i||"No description",invokable:!1,version:"1.0"}}const t=e[1],n={},r=t.split(`
`);for(const s of r){const i=s.match(/^(\w+):\s*(.+)$/);if(i){const[,c,l]=i;l.toLowerCase()==="true"?n[c]=!0:l.toLowerCase()==="false"?n[c]=!1:n[c]=l.replace(/^['"]|['"]$/g,"")}}return{name:String(n.name||"unknown"),description:String(n.description||""),invokable:!!n.invokable,version:String(n.version||"1.0"),feature_category:n.feature_category}}function bn(a){return a.assets.map(e=>({name:e.name,required:e.required,dependsOn:e.depends_on,description:e.description,blueprintFile:e.blueprint_file}))}function yn(a){const e=new Set,t=new Set,n=[],r=s=>{if(e.has(s))return;if(t.has(s))throw new Error(`Circular dependency detected involving ${s}`);t.add(s);const i=a.find(c=>c.name===s);if(i)for(const c of i.dependsOn)r(c);t.delete(s),e.add(s),n.push(s)};for(const s of a)r(s.name);return n}const lt="eidolon.web.templates.custom",dt=["bpui.web.templates.custom"],wn="eidolon.web.blueprints.overrides",xn=["bpui.web.blueprints.overrides"],vn=Object.assign({"../../../../../blueprints/README.md":oa,"../../../../../blueprints/examples/a1111_sdxl_comfyui.md":ia,"../../../../../blueprints/examples/generic_character_sheet.md":ca,"../../../../../blueprints/examples/generic_initial_message.md":la,"../../../../../blueprints/examples/generic_intro_page.md":da,"../../../../../blueprints/examples/generic_intro_scene.md":ua,"../../../../../blueprints/examples/generic_post_history.md":pa,"../../../../../blueprints/examples/generic_system_prompt.md":ha,"../../../../../blueprints/system/a1111.md":ma,"../../../../../blueprints/system/a1111_old.md":fa,"../../../../../blueprints/system/character_sheet.md":ga,"../../../../../blueprints/system/generator.md":ba,"../../../../../blueprints/system/intro_page.md":ya,"../../../../../blueprints/system/intro_scene.md":wa,"../../../../../blueprints/system/offspring_generator.md":xa,"../../../../../blueprints/system/post_history.md":va,"../../../../../blueprints/system/seed_generator.md":_a,"../../../../../blueprints/system/system_prompt.md":ka});function Aa(a){return a.trim().toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").replace(/_+/g,"_").replace(/^_+|_+$/g,"")}function Je(a){return a.blueprint_file??`${a.name}.md`}function _n(a,e){if(typeof window>"u")return e;const t=Array.isArray(a)?[...a]:[a],[n,...r]=t;try{for(const s of t){const i=window.localStorage.getItem(s);if(!i)continue;const c=JSON.parse(i);return s!==n&&(window.localStorage.setItem(n,JSON.stringify(c)),r.forEach(l=>window.localStorage.removeItem(l))),c}}catch{return e}return e}function St(a,e,t){typeof window>"u"||(window.localStorage.setItem(a,JSON.stringify(t)),e.forEach(n=>window.localStorage.removeItem(n)))}function Ca(){const a=new Map;return Object.entries(vn).forEach(([e,t])=>{const n=e.replace(/^.*\/blueprints\//,"blueprints/");if(n.split("/").pop()?.toLowerCase()==="readme.md")return;const s=kt(t);let i="core";n.includes("/system/")?i="system":n.includes("/templates/")?i="template":n.includes("/examples/")&&(i="example"),a.set(n,{name:s.name,description:s.description,invokable:s.invokable,version:s.version,content:t,path:n,category:i,feature_category:s.feature_category})}),a}function ee(){return _n([wn,...xn],{})}function ve(a){St(wn,xn,a)}function kn(a){return a.startsWith("blueprints/custom/")}function Na(a,e){const t=Aa(a)||"custom_blueprint",n=Z();let r=`blueprints/custom/${t}.md`,s=2;for(;r!==e&&n.has(r);)r=`blueprints/custom/${t}_${s}.md`,s+=1;return r}function Z(){const a=Ca(),e=ee();return Object.entries(e).forEach(([t,n])=>{const r=kt(n),s=a.get(t);a.set(t,{name:r.name,description:r.description,invokable:r.invokable,version:r.version,content:n,path:t,category:s?.category??"core",feature_category:r.feature_category})}),a}function $e(a){const e=`../../../../../${a}`;return vn[e]??null}function ja(a){return a in ee()}function Ke(a){if(!a)return"";const e=a.replace(/^\.?\//,""),t=e.replace(/\.(txt|md)$/i,"");return[...Z().values()].find(r=>r.path===e||r.path.endsWith(`/${e}`)||r.path.endsWith(`/${t}.md`))?.content??""}function Pa(a,e){const t=Je(e),n=t.split("/").pop()??t;return a[t]??a[n]??a[e.name]}function Tt(a){const e={};return a.template.assets.forEach(t=>{const n=Je(t),r=Pa(a.blueprint_contents,t);if(!r?.trim())return;const s=Ke(n);s&&s===r||(e[n]=r)}),Object.entries(a.blueprint_contents).forEach(([t,n])=>{if(!n?.trim()||e[t])return;const r=Ke(t);r&&r===n||(e[t]=n)}),{template:a.template,blueprint_contents:e}}function $t(a){const e=Tt(a),t={...e.blueprint_contents};return e.template.assets.forEach(n=>{const r=Je(n);if(!t[r]){const s=Ke(r);s&&(t[r]=s)}}),{template:e.template,blueprint_contents:t}}function Sn(){return{template:{...xt,is_default:!0},blueprint_contents:{}}}function oe(){const a=_n([lt,...dt],[]),e=a.map(Tt);return JSON.stringify(a)!==JSON.stringify(e)&&St(lt,dt,e),e}function Re(a){St(lt,dt,a.map(Tt))}function Et(){return[$t(Sn()),...oe().map($t)]}function Ia(a){if(!a)return;const e=Sn();return e.template.name===a?e:oe().find(t=>t.template.name===a)}function Y(a){if(a)return Et().find(e=>e.template.name===a)}function Ee(a){return Y(a)?.template}function Tn(a,e){const t=Y(a);if(!t)return;const n=t.template.assets.find(s=>s.name===e);if(!n)return;const r=Je(n);return t.blueprint_contents[r]||Ke(r)||void 0}function ze(a,e){const t=Ee(e),n=t?pn(t).map(s=>s.name):["character_sheet"];return $r(a,n)??void 0}const Oa="EidolonSimulacraDB",En=["CharacterGeneratorDB"],Da={drafts:"++id, reviewId, [metadata.character_name], createdAt, updatedAt, metadata.favorite, metadata.mode, metadata.genre",assets:"++id, draftId, assetName, createdAt",tags:"++id, tag, draftId"};function V(a){return typeof a=="object"&&a!==null}function ut(){return`imported-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}function Ra(a){if(!(a!=="SFW"&&a!=="NSFW"&&a!=="Platform-Safe"&&a!=="Auto"))return a}function La(a){let e=ut();for(;a.has(e);)e=ut();return e}function An(a,e){const t=V(a)?a:{},n=typeof t.review_id=="string"?t.review_id:typeof t.reviewId=="string"?t.reviewId:"",r=n.trim().length>0?n:ut(),s=typeof t.seed=="string"?t.seed:"",i=s.trim().length>0?s:e,c={review_id:r,seed:i,favorite:!!t.favorite};c.mode=Ra(t.mode),typeof t.model=="string"&&(c.model=t.model),typeof t.created=="string"?c.created=t.created:typeof t.createdAt=="string"&&(c.created=t.createdAt),typeof t.modified=="string"?c.modified=t.modified:typeof t.updatedAt=="string"&&(c.modified=t.updatedAt),Array.isArray(t.tags)&&(c.tags=t.tags.filter(d=>typeof d=="string")),typeof t.genre=="string"&&(c.genre=t.genre),typeof t.notes=="string"&&(c.notes=t.notes),typeof t.character_name=="string"?c.character_name=t.character_name:typeof t.characterName=="string"&&(c.character_name=t.characterName),typeof t.template_name=="string"?c.template_name=t.template_name:typeof t.templateName=="string"&&(c.template_name=t.templateName);const l=Array.isArray(t.parent_drafts)?t.parent_drafts:Array.isArray(t.parentDraftIds)?t.parentDraftIds:null;return l&&(c.parent_drafts=l.filter(d=>typeof d=="string")),typeof t.offspring_type=="string"?c.offspring_type=t.offspring_type:typeof t.offspringType=="string"&&(c.offspring_type=t.offspringType),c}function Le(a,e="Imported draft"){if(!V(a)||!V(a.assets))return null;const t={};for(const[s,i]of Object.entries(a.assets))typeof i=="string"&&(t[s]=i);if(Object.keys(t).length===0)return null;const n=An(V(a.metadata)?a.metadata:a,e),r=typeof a.path=="string"&&a.path.trim().length>0?a.path:typeof a.reviewId=="string"&&a.reviewId.trim().length>0?a.reviewId:n.review_id;return{metadata:n,assets:t,path:r}}function Ma(a){if(Array.isArray(a))return a.map(t=>Le(t)).filter(t=>t!==null);if(!V(a))return[];if(Array.isArray(a.drafts))return a.drafts.map(t=>Le(t)).filter(t=>t!==null);if(V(a.draft)){const t=Le(a.draft);return t?[t]:[]}const e=Le(a);return e?[e]:[]}function Fa(a){return Array.isArray(a)?!0:V(a)?Array.isArray(a.drafts)||V(a.draft)||V(a.assets)||V(a.metadata)||typeof a.reviewId=="string"||typeof a.review_id=="string":!1}function Ua(a){return a.trim().toLowerCase().replace(/\s+/g,"_")}function $a(a){const t=a.match(/^#\s+(.+)$/m)?.[1]?.trim()||"Imported draft",n=/^##\s+(.+)$/gm,r=[];let s;for(;(s=n.exec(a))!==null;)r.push({title:s[1].trim(),start:s.index,bodyStart:n.lastIndex});if(r.length===0)return[];const i={};let c;for(let d=0;d<r.length;d+=1){const u=r[d],p=r[d+1],f=a.slice(u.bodyStart,p?p.start:a.length).replace(/^\n+/,"").trimEnd().replace(/^\\##/gm,"##");if(!f)continue;if(u.title.trim().toLowerCase()==="metadata"){try{c=JSON.parse(f)}catch{}continue}const b=Ua(u.title);i[b]=f}if(Object.keys(i).length===0)return[];const l=An(c,t);return[{path:l.review_id,metadata:l,assets:i}]}class Cn extends Ne{drafts;assets;tags;constructor(e){super(e),this.version(1).stores(Da)}}const w=new Cn(Oa);let Me=null;async function Ba(){if(!(typeof indexedDB>"u"||await w.drafts.count()>0))for(const e of En){if(!await Ne.exists(e))continue;const t=new Cn(e);try{await t.open();const n=await t.drafts.toArray();if(n.length===0)continue;const r=await t.assets.toArray(),s=await t.tags.toArray();await w.transaction("rw",w.drafts,w.assets,w.tags,async()=>{await w.drafts.bulkPut(n),r.length>0&&await w.assets.bulkPut(r),s.length>0&&await w.tags.bulkPut(s)}),t.close(),await Ne.delete(e);return}catch(n){console.warn(`Failed to migrate legacy draft database ${e}:`,n)}finally{t.close()}}}class L{static async ensureReady(){Me||(Me=Ba()),await Me}static async saveDraft(e){await this.ensureReady();const t=Date.now(),n=ze(e.assets,e.metadata.template_name),r={...e.metadata,character_name:e.metadata.character_name||n,created:e.metadata.created||new Date(t).toISOString(),modified:e.metadata.modified||new Date(t).toISOString()},s={reviewId:e.metadata.review_id,metadata:r,assets:e.assets,createdAt:r.created?new Date(r.created).getTime():t,updatedAt:r.modified?new Date(r.modified).getTime():t},i=await w.drafts.where("reviewId").equals(e.metadata.review_id).first();i&&(s.id=i.id),await w.transaction("rw",w.drafts,w.assets,w.tags,async()=>{await w.drafts.put(s),await w.assets.where("draftId").equals(e.metadata.review_id).delete(),await w.tags.where("draftId").equals(e.metadata.review_id).delete();const c=Object.entries(e.assets).map(([l,d])=>({draftId:e.metadata.review_id,assetName:l,content:d,createdAt:t}));if(await w.assets.bulkAdd(c),e.metadata.tags){const l=e.metadata.tags.map(d=>({tag:d,draftId:e.metadata.review_id,createdAt:t}));await w.tags.bulkAdd(l)}})}static async getDraft(e){await this.ensureReady();const t=await w.drafts.where("reviewId").equals(e).first();return t?{path:t.reviewId,metadata:t.metadata,assets:t.assets}:null}static async getAssetActivity(e){return await this.ensureReady(),(await w.assets.where("draftId").equals(e).toArray()).sort((n,r)=>r.createdAt-n.createdAt)}static async getAllDrafts(){return await this.ensureReady(),(await w.drafts.toArray()).map(t=>({path:t.reviewId,metadata:t.metadata,assets:t.assets}))}static async getAllMetadata(){return await this.ensureReady(),(await w.drafts.toArray()).map(t=>t.metadata)}static async deleteDraft(e){await this.ensureReady(),await w.transaction("rw",w.drafts,w.assets,w.tags,async()=>{await w.drafts.where("reviewId").equals(e).delete(),await w.assets.where("draftId").equals(e).delete(),await w.tags.where("draftId").equals(e).delete()})}static async updateMetadata(e,t){await this.ensureReady();const n=await w.drafts.where("reviewId").equals(e).first();if(!n)throw new Error(`Draft ${e} not found`);const r=Date.now();if(n.metadata={...n.metadata,...t,modified:new Date(r).toISOString()},n.updatedAt=r,await w.drafts.put(n),t.tags!==void 0&&(await w.tags.where("draftId").equals(e).delete(),t.tags)){const s=t.tags.map(i=>({tag:i,draftId:e,createdAt:r}));await w.tags.bulkAdd(s)}}static async updateAsset(e,t,n){await this.ensureReady();const r=await w.drafts.where("reviewId").equals(e).first();if(!r)throw new Error(`Draft ${e} not found`);r.assets[t]=n,r.updatedAt=Date.now(),r.metadata={...r.metadata,modified:new Date(r.updatedAt).toISOString(),character_name:ze(r.assets,r.metadata.template_name)||r.metadata.character_name},await w.drafts.put(r),await w.assets.where("draftId").equals(e).and(i=>i.assetName===t).modify({content:n,createdAt:r.updatedAt})===0&&await w.assets.add({draftId:e,assetName:t,content:n,createdAt:r.updatedAt})}static async searchDrafts(e){await this.ensureReady();const t=e.toLowerCase();return(await w.drafts.filter(r=>{const s=r.metadata.character_name?.toLowerCase()||"",i=r.metadata.seed?.toLowerCase()||"",c=r.metadata.notes?.toLowerCase()||"",l=r.metadata.genre?.toLowerCase()||"";return s.includes(t)||i.includes(t)||c.includes(t)||l.includes(t)}).toArray()).map(r=>r.metadata)}static async getDraftsByTag(e){await this.ensureReady();const t=await w.tags.where("tag").equals(e).toArray(),n=[...new Set(t.map(s=>s.draftId))];return(await w.drafts.where("reviewId").anyOf(n).toArray()).map(s=>s.metadata)}static async getAllTags(){await this.ensureReady();const e=await w.tags.toArray();return[...new Set(e.map(n=>n.tag))].sort()}static async getFavorites(){return await this.ensureReady(),(await w.drafts.filter(t=>t.metadata.favorite===!0).toArray()).map(t=>t.metadata)}static async getDraftsByMode(e){return await this.ensureReady(),(await w.drafts.where("metadata.mode").equals(e).toArray()).map(n=>n.metadata)}static async getDraftsByGenre(e){return await this.ensureReady(),(await w.drafts.where("metadata.genre").equals(e).toArray()).map(n=>n.metadata)}static async getStats(){await this.ensureReady();const e=await w.drafts.toArray(),t={total:e.length,favorites:e.filter(n=>n.metadata.favorite).length,byMode:{},byGenre:{}};for(const n of e){const r=n.metadata.mode||"unknown",s=n.metadata.genre||"unknown";t.byMode[r]=(t.byMode[r]||0)+1,t.byGenre[s]=(t.byGenre[s]||0)+1}return t}static async exportAll(){await this.ensureReady();const e=await this.getAllDrafts(),t={version:"1.0",exportedAt:new Date().toISOString(),drafts:e};return JSON.stringify(t,null,2)}static async import(e,t={}){await this.ensureReady();const n=t.conflictStrategy??"remap",r=e.trim();if(!r)throw new Error("Import file is empty");let s=[],i=!1;try{const h=JSON.parse(r);i=Fa(h),s=Ma(h)}catch{s=$a(e)}if(s.length===0){if(i)return{imported:0,remapped:0};throw new Error("Invalid draft import format. Supported: exported drafts JSON and combined markdown draft files.")}const c=await this.getAllMetadata(),l=new Set(c.map(h=>h.review_id)),d=new Map;let u=0;const p=s.map(h=>{const f=h.metadata.review_id;let b=f;return n==="remap"&&l.has(b)&&(b=La(l)),l.add(b),b!==f&&(u+=1,d.set(f,b)),{...h,path:b,metadata:{...h.metadata,review_id:b}}});for(const h of p){const f=h.metadata.parent_drafts?.map(b=>d.get(b)||b);await this.saveDraft({...h,metadata:{...h.metadata,parent_drafts:f}})}return{imported:p.length,remapped:u}}static async clearAll(){await w.transaction("rw",w.drafts,w.assets,w.tags,async()=>{await w.drafts.clear(),await w.assets.clear(),await w.tags.clear()});for(const e of En)await Ne.exists(e)&&await Ne.delete(e);Me=null}}const Jo=Object.freeze(Object.defineProperty({__proto__:null,DraftStorage:L,db:w},Symbol.toStringTag,{value:"Module"})),Bt="server-config",nt="server-access-token",pt="auth-state-changed";function ue(a){return typeof a=="object"&&a!==null}function Ha(a){return a==="SFW"||a==="NSFW"||a==="Platform-Safe"||a==="Auto"?a:void 0}function J(a){if(typeof a!="string")return;const e=a.trim();return e.length>0?e:void 0}function Ht(a){const e=Object.fromEntries(Object.entries(a.assets).filter(t=>{const[n,r]=t;return typeof n=="string"&&n.length>0&&typeof r=="string"}));return{reviewId:J(a.metadata.review_id)??a.path,seed:J(a.metadata.seed)??a.path,mode:Ha(a.metadata.mode),model:J(a.metadata.model),characterName:J(a.metadata.character_name),templateName:J(a.metadata.template_name),genre:J(a.metadata.genre),notes:J(a.metadata.notes),favorite:!!a.metadata.favorite,tags:Array.isArray(a.metadata.tags)?a.metadata.tags.filter(t=>typeof t=="string"&&t.trim().length>0):[],offspringType:J(a.metadata.offspring_type),parentDraftIds:Array.isArray(a.metadata.parent_drafts)?a.metadata.parent_drafts.filter(t=>typeof t=="string"&&t.trim().length>0):void 0,assets:e}}function Ga(a){return ue(a)?Array.isArray(a.drafts)&&a.drafts.every(e=>ue(e)&&ue(e.metadata)&&ue(e.assets))?{drafts:a.drafts.map(Ht)}:ue(a.metadata)&&ue(a.assets)?{drafts:[Ht(a)]}:a:a}class Wa{config;accessToken=null;refreshPromise=null;statusPromise=null;cachedStatus=null;statusCacheExpiresAt=0;rateLimitedUntil=0;constructor(){this.config=this.loadConfig(),this.accessToken=localStorage.getItem(nt)}loadConfig(){try{const e=localStorage.getItem(Bt);if(e)return JSON.parse(e)}catch(e){console.error("Failed to load server config:",e)}return{url:"https://api.eidolonsimulacra.com",enabled:!1}}saveConfig(){localStorage.setItem(Bt,JSON.stringify(this.config)),this.invalidateStatusCache()}getConfig(){return{...this.config}}setConfig(e){this.config={...this.config,...e},this.saveConfig()}invalidateStatusCache(){this.cachedStatus=null,this.statusCacheExpiresAt=0}isEnabled(){return this.config.enabled&&!!this.config.url}hasAccessToken(){return!!this.accessToken}setAccessToken(e){this.accessToken=e,localStorage.setItem(nt,e),this.invalidateStatusCache()}clearAccessToken(){this.accessToken=null,localStorage.removeItem(nt),this.invalidateStatusCache()}notifyAuthStateChanged(){window.dispatchEvent(new CustomEvent(pt))}getAccessToken(){return this.accessToken}async refreshAccessToken(){if(this.refreshPromise)return this.refreshPromise;this.refreshPromise=this.doRefreshToken();try{return await this.refreshPromise}finally{this.refreshPromise=null}}async doRefreshToken(){const e=`${this.config.url}/api/auth/refresh`,t=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include"});if(!t.ok)throw this.clearAccessToken(),this.notifyAuthStateChanged(),new Error("Failed to refresh token");const n=await t.json();return this.setAccessToken(n.accessToken),n.accessToken}async request(e,t={},n=!0){const r=`${this.config.url}${e}`,s={"Content-Type":"application/json",...t.headers},i=this.getAccessToken();i&&(s.Authorization=`Bearer ${i}`);const c=await fetch(r,{...t,headers:s,credentials:"include"});if(c.status===429){const d=c.headers.get("retry-after"),u=c.headers.get("ratelimit-reset"),p=d?Number.parseInt(d,10):Number.NaN,h=u?Number.parseInt(u,10):Number.NaN,f=Number.isFinite(p)?p:Number.isFinite(h)?h:60;this.rateLimitedUntil=Date.now()+Math.max(f,1)*1e3}if(c.status===401&&n&&e!=="/api/auth/refresh"&&e!=="/api/auth/login"&&e!=="/api/auth/register")try{return await this.refreshAccessToken(),this.request(e,t,!1)}catch{throw this.clearAccessToken(),new Error("Authentication expired. Please login again.")}return c}async register(e,t,n){const r=await this.request("/api/auth/register",{method:"POST",body:JSON.stringify({email:e,password:t,displayName:n})});if(!r.ok){const i=await r.json();throw new Error(i.error||"Registration failed")}const s=await r.json();return this.setAccessToken(s.accessToken),this.notifyAuthStateChanged(),s}async login(e,t){const n=await this.request("/api/auth/login",{method:"POST",body:JSON.stringify({email:e,password:t})});if(!n.ok){const s=await n.json();throw new Error(s.error||"Login failed")}const r=await n.json();return this.setAccessToken(r.accessToken),this.notifyAuthStateChanged(),r}async logout(){try{await this.request("/api/auth/logout",{method:"POST"})}catch(e){console.error("Logout request failed:",e)}finally{this.clearAccessToken(),this.notifyAuthStateChanged()}}async getCurrentUser(){const e=await this.request("/api/auth/me");if(!e.ok){if(e.status===401)throw this.clearAccessToken(),new Error("Not authenticated");const n=await e.json();throw new Error(n.error||"Failed to get user")}return(await e.json()).user}async updateProfile(e){const t=await this.request("/api/auth/me",{method:"PATCH",body:JSON.stringify(e)});if(!t.ok){const r=await t.json();throw new Error(r.error||"Failed to update profile")}return(await t.json()).user}async deleteAccount(){const e=await this.request("/api/auth/me",{method:"DELETE"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to delete account")}this.clearAccessToken()}async checkStatus(){if(!this.isEnabled())return{connected:!1,authenticated:!1};const e=Date.now();if(this.cachedStatus&&e<this.statusCacheExpiresAt)return this.cachedStatus;if(this.statusPromise)return this.statusPromise;if(e<this.rateLimitedUntil)return{...this.cachedStatus??{connected:!0,authenticated:!!this.getAccessToken()},error:"Rate limited. Retrying status check soon."};this.statusPromise=this.computeStatus();try{const t=await this.statusPromise;return this.cachedStatus=t,this.statusCacheExpiresAt=Date.now()+15e3,t}finally{this.statusPromise=null}}isConnectivityError(e){return e instanceof TypeError?!0:e instanceof Error?/failed to fetch|networkerror|network error|load failed/i.test(e.message):!1}async computeStatus(){try{if(this.hasAccessToken())try{return{connected:!0,authenticated:!0,user:await this.getCurrentUser()}}catch(t){return this.isConnectivityError(t)?{connected:!1,authenticated:!1,error:t instanceof Error?t.message:"Unknown error"}:{connected:!0,authenticated:!1,error:t instanceof Error?t.message:"Authentication failed"}}return(await fetch(`${this.config.url}/api/health`,{method:"GET"})).ok?{connected:!0,authenticated:!1}:{connected:!1,authenticated:!1,error:"Server unreachable"}}catch(e){return{connected:!1,authenticated:!1,error:e instanceof Error?e.message:"Unknown error"}}}async syncDrafts(e,t){const n=e==="push",r=n?"/api/sync/drafts/push":"/api/sync/drafts",s=n?Ga(t):t,i=await this.request(r,{method:n?"POST":"GET",body:n?JSON.stringify(s):void 0});if(!i.ok){let c=`Failed to ${e} drafts`,l=null;try{const u=await i.json();if(c=u.error||c,l=u.error||null,u.details){const p=Object.entries(u.details).flatMap(([h,f])=>(f||[]).map(b=>`${h}: ${b}`)).join("; ");p&&(c=`${c} (${p})`)}}catch{}if(e==="pull"&&r!=="/api/sync/drafts"&&(i.status===404||i.status===400&&l==="Validation failed"))try{return await this.listRemoteDrafts()}catch{}throw new Error(c)}return i.json()}async listRemoteDrafts(){const e=await this.request("/api/sync/drafts",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote drafts")}return e.json()}async deleteRemoteDraft(e){const t=await this.request(`/api/sync/drafts/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete remote draft")}return t.json()}async syncThemes(e,t){const n=await this.request(`/api/sync/themes/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const r=await n.json();throw new Error(r.error||`Failed to ${e} themes`)}return n.json()}async listRemoteThemes(){const e=await this.request("/api/sync/themes/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote themes")}return e.json()}async deleteRemoteTheme(e){const t=await this.request(`/api/sync/themes/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete remote theme")}return t.json()}async syncTemplates(e,t){const n=await this.request(`/api/sync/templates/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const r=await n.json();throw new Error(r.error||`Failed to ${e} templates`)}return n.json()}async syncSeeds(e,t){const n=e==="push",r=n?"/api/sync/seeds/push":"/api/sync/seeds",s=await this.request(r,{method:n?"POST":"GET",body:n?JSON.stringify(t):void 0});if(!s.ok){const i=await s.json();throw new Error(i.error||`Failed to ${e} seeds`)}return s.json()}async listRemoteTemplates(){const e=await this.request("/api/sync/templates/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote templates")}return e.json()}async deleteRemoteTemplate(e){const t=await this.request(`/api/sync/templates/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete remote template")}return t.json()}async pullConfig(){const e=await this.request("/api/sync/config",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to pull config")}return e.json()}async pushConfig(e){const t=await this.request("/api/sync/config",{method:"PUT",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to push config")}return t.json()}async pullApiKeys(){const e=await this.request("/api/sync/config/api-keys",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to pull API keys")}return e.json()}async pushApiKeys(e){const t=await this.request("/api/sync/config/api-keys",{method:"PUT",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to push API keys")}return t.json()}async sync(e,t,n){switch(e){case"drafts":return this.syncDrafts(t,n);case"themes":return this.syncThemes(t,n);case"templates":return this.syncTemplates(t,n);case"seeds":return this.syncSeeds(t,n);case"blueprints":return this.syncBlueprints(t,n);case"worlds":if(t==="list")throw new Error("World sync does not support list");return this.syncWorlds(t,n);case"timelines":if(t==="list")throw new Error("Timeline sync does not support list");return this.syncTimelines(t,n);default:throw new Error(`Unknown data type: ${e}`)}}async syncBlueprints(e,t){const n=await this.request(`/api/sync/blueprints/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const r=await n.json();throw new Error(r.error||`Failed to ${e} blueprints`)}return n.json()}async listRemoteBlueprints(){const e=await this.request("/api/sync/blueprints/list",{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"Failed to list remote blueprints")}return e.json()}async deleteRemoteBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete remote blueprint")}return t.json()}async getBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`);if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to get blueprint")}return t.json()}async createBlueprint(e){const t=await this.request("/api/sync/blueprints",{method:"POST",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to create blueprint")}return t.json()}async updateBlueprint(e,t){const n=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`,{method:"PUT",body:JSON.stringify(t)});if(!n.ok){const r=await n.json();throw new Error(r.error||"Failed to update blueprint")}return n.json()}async deleteBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete blueprint")}return t.json()}async duplicateBlueprint(e,t,n){const r=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}/duplicate`,{method:"POST",body:JSON.stringify({newPath:t,newName:n})});if(!r.ok){const s=await r.json();throw new Error(s.error||"Failed to duplicate blueprint")}return r.json()}async resetBlueprint(e){const t=await this.request(`/api/sync/blueprints/${encodeURIComponent(e)}/reset`,{method:"POST"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to reset blueprint")}return t.json()}async syncWorlds(e,t){const n=await this.request(`/api/sync/worlds/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const r=await n.json();throw new Error(r.error||`Failed to ${e} worlds`)}return n.json()}async getWorlds(e){const t=new URLSearchParams;e?.search&&t.set("search",e.search),e?.genre&&t.set("genre",e.genre),e?.includePublic!==void 0&&t.set("includePublic",String(e.includePublic));const n=await this.request(`/api/sync/worlds?${t.toString()}`);if(!n.ok){const r=await n.json();throw new Error(r.error||"Failed to get worlds")}return n.json()}async getWorld(e){const t=await this.request(`/api/sync/worlds/${e}`);if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to get world")}return t.json()}async createWorld(e){const t=await this.request("/api/sync/worlds",{method:"POST",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to create world")}return t.json()}async updateWorld(e,t){const n=await this.request(`/api/sync/worlds/${e}`,{method:"PUT",body:JSON.stringify(t)});if(!n.ok){const r=await n.json();throw new Error(r.error||"Failed to update world")}return n.json()}async deleteWorld(e){const t=await this.request(`/api/sync/worlds/${e}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete world")}return t.json()}async syncTimelines(e,t){const n=await this.request(`/api/sync/timelines/${e}`,{method:e==="push"?"POST":"GET",body:e==="push"?JSON.stringify(t):void 0});if(!n.ok){const r=await n.json();throw new Error(r.error||`Failed to ${e} timelines`)}return n.json()}async getTimelines(e){const t=new URLSearchParams;e?.worldId&&t.set("worldId",e.worldId),e?.search&&t.set("search",e.search);const n=await this.request(`/api/sync/timelines?${t.toString()}`);if(!n.ok){const r=await n.json();throw new Error(r.error||"Failed to get timelines")}return n.json()}async getTimeline(e){const t=await this.request(`/api/sync/timelines/${e}`);if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to get timeline")}return t.json()}async createTimeline(e){const t=await this.request("/api/sync/timelines",{method:"POST",body:JSON.stringify(e)});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to create timeline")}return t.json()}async updateTimeline(e,t){const n=await this.request(`/api/sync/timelines/${e}`,{method:"PUT",body:JSON.stringify(t)});if(!n.ok){const r=await n.json();throw new Error(r.error||"Failed to update timeline")}return n.json()}async deleteTimeline(e){const t=await this.request(`/api/sync/timelines/${e}`,{method:"DELETE"});if(!t.ok){const n=await t.json();throw new Error(n.error||"Failed to delete timeline")}return t.json()}async addTimelineEvent(e,t){const n=await this.request(`/api/sync/timelines/${e}/events`,{method:"POST",body:JSON.stringify(t)});if(!n.ok){const r=await n.json();throw new Error(r.error||"Failed to add event")}return n.json()}async updateTimelineEvent(e,t,n){const r=await this.request(`/api/sync/timelines/${e}/events/${t}`,{method:"PATCH",body:JSON.stringify(n)});if(!r.ok){const s=await r.json();throw new Error(s.error||"Failed to update event")}return r.json()}async deleteTimelineEvent(e,t){const n=await this.request(`/api/sync/timelines/${e}/events/${t}`,{method:"DELETE"});if(!n.ok){const r=await n.json();throw new Error(r.error||"Failed to delete event")}return n.json()}async testConnection(e){try{const t=await fetch(`${e}/api/health`,{method:"GET",signal:AbortSignal.timeout(5e3)});return t.ok?{success:!0,message:"Connection successful"}:{success:!1,message:`Server returned ${t.status}`}}catch(t){return{success:!1,message:t instanceof Error?t.message:"Connection failed"}}}}const k=new Wa,Nn="eidolon.web.seedGenerator.history",jn=["bpui.web.seedGenerator.history"],Pn="eidolon.web.seedGenerator.favorites",In=["bpui.web.seedGenerator.favorites"],On="eidolon.web.seedGenerator.favorites.syncState",Ka=12,za=12,ht="seed-favorites-changed";function At(a,e){if(typeof window>"u")return e;const t=Array.isArray(a)?[...a]:[a],[n,...r]=t;try{for(const s of t){const i=window.localStorage.getItem(s);if(!i)continue;const c=JSON.parse(i);return s!==n&&(window.localStorage.setItem(n,JSON.stringify(c)),r.forEach(l=>window.localStorage.removeItem(l))),c}}catch{return e}return e}function Ct(a,e,t){typeof window>"u"||(window.localStorage.setItem(a,JSON.stringify(t)),e.forEach(n=>window.localStorage.removeItem(n)))}function qa(a){typeof window>"u"||window.dispatchEvent(new CustomEvent(ht,{detail:{count:a.length}}))}function Gt(a){if(typeof a!="string")return;const e=new Date(a);return Number.isNaN(e.getTime())?void 0:e.toISOString()}function Va(a){if(typeof a!="object"||a===null)return null;const e=a,t=typeof e.seed=="string"?e.seed.trim():"";if(!t)return null;const n=Gt(e.addedAt)??new Date().toISOString(),r=Gt(e.lastUsedAt);return r?{seed:t,addedAt:n,lastUsedAt:r}:{seed:t,addedAt:n}}function qe(a){const e=new Map;for(const t of a){const n=Va(t);n&&e.set(n.seed,n)}return Array.from(e.values()).sort((t,n)=>{const r=Date.parse(t.lastUsedAt??t.addedAt);return Date.parse(n.lastUsedAt??n.addedAt)-r})}function Nt(){return At(On,{})}function Dn(a){Ct(On,[],a)}function je(a,e={}){const{markChanged:t=!0,markSynced:n=!1,timestamp:r=new Date().toISOString()}=e,s=qe(a);Ct(Pn,In,s);const i=Nt();return t&&(i.lastChangedAt=r),n&&(i.lastSyncedAt=r),Dn(i),qa(s),s}const mt=[{id:"noir-romance",label:"Noir Pressure",genreLines:`noir:debt, surveillance, intimacy, slow-burn
romance:realism, asymmetry, messy loyalty, after-hours`},{id:"grounded-sf",label:"Grounded Sci-Fi",genreLines:`sci-fi:grounded, labor, proximity, bureaucracy
romance:subtext, contracts, withheld tenderness`},{id:"low-magic",label:"Low Magic",genreLines:`fantasy:low-magic, domestic, obligation, village politics
romance:restraint, longing, practical intimacy`},{id:"urban-horror",label:"Urban Horror",genreLines:`horror:grounded, neighborhood, debt, body unease
thriller:secrecy, leverage, false safety`},{id:"moreau",label:"Moreau",genreLines:`romance:moreau, realism, stigma, protective tension
urban fantasy:morphosis, nightlife, consent ethic, social friction`}];function Ya(a){return a.replace(/^```+/,"").replace(/```+$/,"").trim()}function Ja(a){return Ya(a).replace(/^[-*•]\s+/,"").replace(/^\d+[.)]\s+/,"").replace(/^seed\s*:\s*/i,"").trim()}function Xo(){return mt}function Xa(){return mt[Math.floor(Math.random()*mt.length)]}function Qa(a){return Math.min(30,Math.max(5,Math.round(a||za)))}function Qo(a,e){const t=a.split(`
`).map(r=>r.trim()).filter(Boolean);return[...[`count=${Qa(e.count)}`,e.coverageMode],...t].join(`
`)}function Za(a){const e=a.genre_lines.split(`
`).map(t=>t.trim()).filter(Boolean).join(`
`);if(a.surprise_mode||!e){const t=Xa();return{genreLines:t.genreLines,sourcePreset:t}}return{genreLines:e}}function es(a){const e=a.split(`
`).map(Ja).filter(t=>t.length>0).filter(t=>!/^#+\s*/.test(t)).filter(t=>!/^output to\s+/i.test(t)).filter(t=>!/^no headings/i.test(t));return[...new Set(e)].filter(t=>t.length<=180)}function ts(){return At([Nn,...jn],[])}function Zo(a){const t=[{...a,id:crypto.randomUUID(),createdAt:new Date().toISOString()},...ts()].slice(0,Ka);return Ct(Nn,jn,t),t}function fe(){const a=At([Pn,...In],[]);return qe(a)}function ns(a){if(Array.isArray(a))return qe(a);if(typeof a!="object"||a===null)return null;const e=a;return Array.isArray(e.seeds)?qe(e.seeds):null}function ei(a){return je([...a])}function rs(a){return je([...a],{markChanged:!1,markSynced:!0})}function Rn(a=new Date().toISOString()){const e=Nt();e.lastSyncedAt=a,Dn(e)}function as(){const{lastChangedAt:a,lastSyncedAt:e}=Nt();return a?e?Date.parse(a)>Date.parse(e):!0:!1}async function ti(){if(!k.isEnabled()||!(await k.checkStatus()).authenticated)return null;if(as()){const n=fe();return await k.syncSeeds("push",{seeds:n}),Rn(),n}const e=await k.syncSeeds("pull"),t=ns(e);return t?rs(t):null}function ni(a){const e=fe();if(e.findIndex(r=>r.seed===a)>=0){const r=e.filter(s=>s.seed!==a);return je(r)}const n=[{seed:a,addedAt:new Date().toISOString()},...e];return je(n)}function ri(a){const e=new Date().toISOString(),n=fe().map(r=>r.seed===a?{...r,lastUsedAt:e}:r);return je(n)}const ss="eidolon.web.themes.custom",os=["bpui.web.themes.custom"],Ln=900,Be=new Set;let q=null,_e=null;function is(){if(typeof window>"u")return[];for(const a of[ss,...os]){const e=window.localStorage.getItem(a);if(e)try{return JSON.parse(e)}catch{return[]}}return[]}function cs(a){const e=a.metadata.mode,t=e==="SFW"||e==="NSFW"||e==="Platform-Safe"||e==="Auto"?e:void 0,n=s=>{if(typeof s!="string")return;const i=s.trim();return i.length>0?i:void 0},r=Object.fromEntries(Object.entries(a.assets).filter(s=>{const[i,c]=s;return typeof i=="string"&&i.length>0&&typeof c=="string"}));return{reviewId:n(a.metadata.review_id)??a.path,seed:n(a.metadata.seed)??a.path,mode:t,model:n(a.metadata.model),characterName:n(a.metadata.character_name),templateName:n(a.metadata.template_name),genre:n(a.metadata.genre),notes:n(a.metadata.notes),favorite:!!a.metadata.favorite,tags:Array.isArray(a.metadata.tags)?a.metadata.tags.filter(s=>typeof s=="string"&&s.trim().length>0):[],offspringType:n(a.metadata.offspring_type),parentDraftIds:Array.isArray(a.metadata.parent_drafts)?a.metadata.parent_drafts.filter(s=>typeof s=="string"&&s.trim().length>0):void 0,assets:r}}function Wt(a){return $e(a)!==null&&!kn(a)?`blueprints/overrides/${a.replace(/^blueprints\//,"")}`:a}function ls(a){return typeof a=="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(a)}async function ds(){const[a,e]=await Promise.all([L.getAllDrafts(),k.listRemoteDrafts()]),t=new Set(a.map(i=>i.metadata.review_id)),n=e.drafts||[],s=((await k.syncDrafts("push",{drafts:a.map(cs)})).results||[]).filter(i=>i.status==="error").map(i=>i.error?`${i.reviewId} (${i.error})`:i.reviewId);if(s.length>0)throw new Error(`Remote draft sync failed for: ${s.join(", ")}`);await Promise.all(n.filter(i=>!t.has(i.reviewId)).map(i=>ls(i.id)?k.deleteRemoteDraft(i.id).catch(c=>{console.warn(`Failed to delete remote draft ${i.reviewId}:`,c)}):(console.warn(`Skipping remote draft delete for ${i.reviewId}: server returned non-UUID id.`),Promise.resolve())))}async function us(){const a=is(),t=(await k.listRemoteThemes()).themes||[],n=new Set(a.map(r=>r.name));await k.syncThemes("push",{themes:a.map(r=>({name:r.name,displayName:r.display_name,description:r.description,author:r.author,tags:r.tags,basedOn:r.based_on,colors:r.colors}))}),await Promise.all(t.filter(r=>!r.isBuiltin&&!n.has(r.name)).map(r=>k.deleteRemoteTheme(r.name).catch(s=>{console.warn(`Failed to delete remote theme ${r.name}:`,s)})))}async function ps(){const a=oe(),t=(await k.listRemoteTemplates()).templates||[],n=new Set(a.map(r=>r.template.name));await k.syncTemplates("push",{templates:a.map(r=>({name:r.template.name,version:r.template.version,description:r.template.description,isDefault:r.template.is_default,assets:r.template.assets,blueprintContent:r.blueprint_contents}))}),await Promise.all(t.filter(r=>!r.isOfficial&&!n.has(r.name)).map(r=>k.deleteRemoteTemplate(r.name).catch(s=>{console.warn(`Failed to delete remote template ${r.name}:`,s)})))}async function hs(){const a=fe();await k.syncSeeds("push",{seeds:a}),Rn()}async function ms(){const a=ee(),e=Object.entries(a),t=new Set(e.map(([s])=>Wt(s))),r=(await k.listRemoteBlueprints()).blueprints||[];e.length>0&&await k.syncBlueprints("push",{blueprints:e.map(([s,i])=>{const c=kt(i);return{path:Wt(s),name:c.name,description:c.description,invokable:c.invokable,version:c.version,category:"custom",content:i}})}),await Promise.all(r.filter(s=>!s.isBuiltin&&!t.has(s.path)).map(s=>k.deleteRemoteBlueprint(s.path).catch(i=>{console.warn(`Failed to delete remote blueprint ${s.path}:`,i)})))}async function fs(){await Promise.all([k.pushConfig(P.getConfig()),k.pushApiKeys(P.getApiKeys())])}async function gs(a){switch(a){case"drafts":await ds();return;case"themes":await us();return;case"templates":await ps();return;case"seeds":await hs();return;case"blueprints":await ms();return;case"config":await fs();return}}async function Ve(){if(_e)return _e;q&&(clearTimeout(q),q=null),_e=(async()=>{const a=Array.from(Be);if(Be.clear(),!(a.length===0||!k.isEnabled()||!(await k.checkStatus()).authenticated))for(const t of a)try{await gs(t)}catch(n){console.warn(`Automatic ${t} sync failed:`,n)}})();try{await _e}finally{_e=null,Be.size>0&&!q&&(q=setTimeout(()=>{q=null,Ve()},Ln))}}function O(a,e={}){if((Array.isArray(a)?a:[a]).forEach(n=>Be.add(n)),e.immediate){Ve();return}q&&clearTimeout(q),q=setTimeout(()=>{q=null,Ve()},Ln)}function bs(){return Ve()}function ys(a){const e=bn(a);if(e.length===0)return"";let t;try{t=yn(e)}catch{t=e.map(i=>i.name)}const n=t.map(i=>e.find(c=>c.name===i)).filter(i=>!!i),r=[];r.push(`

## TEMPLATE OVERRIDE
`),r.push("The following active template contract is authoritative. Use it instead of the fallback template order."),r.push(`Template name: ${a.name}`),r.push(`Template version: ${a.version}`),a.description?.trim()&&r.push(`Template description: ${a.description.trim()}`),r.push(`Asset count: ${n.length}`),r.push(""),r.push("Asset output order:"),n.forEach((i,c)=>{r.push(`${c+1}. ${i.name}`)}),r.push(""),r.push("Declared asset contract:"),n.forEach(i=>{const c=i.dependsOn.length>0?i.dependsOn.join(", "):"none";r.push(`- ${i.name}`),r.push(`  - required: ${i.required}`),r.push(`  - depends_on: ${c}`),i.blueprintFile&&r.push(`  - blueprint_file: ${i.blueprintFile}`),i.description?.trim()&&r.push(`  - description: ${i.description.trim()}`)});const s=n.map(i=>{const c=Tn(a.name,i.name)?.trim();return c?["",`### ASSET BLUEPRINT: ${i.name}`,"```md",c,"```"].join(`
`):null}).filter(i=>!!i);return s.length>0&&(r.push(""),r.push("Resolved asset blueprints:"),r.push("Follow these blueprint sources exactly for structure, placeholders, control blocks, and field names."),r.push(s.join(`
`))),r.join(`
`)}function ws(a){if(!a)return[];const e=bn(a);if(e.length===0)return[];try{return yn(e)}catch{return e.map(t=>t.name)}}function Kt(a,e,t,n){const r=ws(n),s=r.length>0?r:Object.keys(t),i=[`
## ${a}: ${e}`];return n&&i.push(`Template: ${n.name} (${n.version})`),s.forEach(c=>{i.push(`### ${c}:
\`\`\``),i.push(t[c]||""),i.push("```")}),i}async function xs(a,e=null,t,n,r,s=[]){let i=await _t("orchestration",r,n);t&&t.assets.length>0&&(i+=ys(t));const c=i,l=[];return e&&l.push(`Mode: ${e}`),l.push(`SEED: ${a}`),s.length>0&&(l.push(""),l.push("ADDITIONAL RULES:"),s.forEach(d=>{l.push(`- ${d}`)})),[c,l.join(`
`)]}async function vs(a,e,t=null,n={},r=null,s){const i=r||await gn(a,s),c=`# BLUEPRINT: ${a}

${i}`,l=[];if(t&&l.push(`Mode: ${t}`),l.push(`SEED: ${e}`),n&&Object.keys(n).length>0){l.push(`
---
## Prior Assets (for context):
`);for(const[d,u]of Object.entries(n))l.push(`### ${d}:
\`\`\`
${u}
\`\`\`
`)}return[c,l.join(`
`)]}async function _s(a,e){return[e?.trim()||await _t("seed_generation"),a]}function ks(a,e){const t=`You are an expert character analyst specializing in understanding character relationships, dynamics, and narrative potential. Your task is to deeply analyze two characters and provide insights about how they would interact in a story.

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
- What themes or conflicts would their relationship explore?`,n=[];return n.push(`## CHARACTER 1: ${a.name||"Character 1"}`),n.push(`**Age**: ${a.age||"Unknown"}`),n.push(`**Gender**: ${a.gender||"Unknown"}`),n.push(`**Species**: ${a.species||"Unknown"}`),n.push(`**Occupation**: ${a.occupation||"Unknown"}`),n.push(`**Role**: ${a.role||"Unknown"}`),n.push(`**Power Level**: ${a.power_level||"Unknown"}`),n.push(`**Mode**: ${a.mode||"Unknown"}`),a.personality_traits&&a.personality_traits.length>0&&n.push(`**Personality Traits**: ${a.personality_traits.slice(0,10).join(", ")}`),a.core_values&&a.core_values.length>0&&n.push(`**Core Values**: ${a.core_values.slice(0,10).join(", ")}`),a.motivations&&a.motivations.length>0&&n.push(`**Motivations**: ${a.motivations.slice(0,10).join(", ")}`),a.goals&&a.goals.length>0&&n.push(`**Goals**: ${a.goals.slice(0,10).join(", ")}`),a.fears&&a.fears.length>0&&n.push(`**Fears**: ${a.fears.slice(0,10).join(", ")}`),n.push(`
## CHARACTER 2: ${e.name||"Character 2"}`),n.push(`**Age**: ${e.age||"Unknown"}`),n.push(`**Gender**: ${e.gender||"Unknown"}`),n.push(`**Species**: ${e.species||"Unknown"}`),n.push(`**Occupation**: ${e.occupation||"Unknown"}`),n.push(`**Role**: ${e.role||"Unknown"}`),n.push(`**Power Level**: ${e.power_level||"Unknown"}`),n.push(`**Mode**: ${e.mode||"Unknown"}`),e.personality_traits&&e.personality_traits.length>0&&n.push(`**Personality Traits**: ${e.personality_traits.slice(0,10).join(", ")}`),e.core_values&&e.core_values.length>0&&n.push(`**Core Values**: ${e.core_values.slice(0,10).join(", ")}`),e.motivations&&e.motivations.length>0&&n.push(`**Motivations**: ${e.motivations.slice(0,10).join(", ")}`),e.goals&&e.goals.length>0&&n.push(`**Goals**: ${e.goals.slice(0,10).join(", ")}`),e.fears&&e.fears.length>0&&n.push(`**Fears**: ${e.fears.slice(0,10).join(", ")}`),n.push(`
## TASK`),n.push("Provide a deep analysis of these two characters' relationship potential."),n.push("Return your response as valid JSON following the structure specified in the system prompt."),[t,n.join(`
`)]}async function Ss(a,e,t,n,r=null,s,i,c,l){const d=await _t("offspring_generation",l,c),u=[];return r&&u.push(`Mode: ${r}`),u.push(...Kt("PARENT 1",t,a,s)),u.push(...Kt("PARENT 2",n,e,i)),u.push(`
## INSTRUCTION:`),u.push("Analyze how these two parents would shape a new character's upbringing and generate the offspring's SEED."),u.push("Treat each parent suite according to the template contract shown in the provided assets."),[d,u.join(`
`)]}function ke(a,e,t){const n=[{role:"system",content:a}];return n.push({role:"user",content:e}),n}class X{static resolveConfiguredProvider(e){return e.engine_mode==="explicit"&&e.engine!=="auto"&&e.engine!=="openai_compatible"?e.engine:e.model?wt(e.model):void 0}static getFallbackApiKey(e){return Object.values(e).find(t=>typeof t=="string"&&t.trim().length>0)}static createConfiguredEngine(){const e=P.getApiKeys(),t=P.getConfig(),n=this.resolveConfiguredProvider(t);return he({model:t.model,apiKey:n?e[n]:this.getFallbackApiKey(e),apiKeys:e,provider:n,baseUrl:t.base_url,proxyKey:t.api_proxy_key,temperature:t.temperature,maxTokens:t.max_tokens})}static sanitizeGeneratedSeed(e){return e.replace(/^```[a-z]*\n?/i,"").replace(/```$/i,"").trim().replace(/^['"]|['"]$/g,"")}static getOffspringCarryRules(){return["Treat this seed as an offspring outcome shaped by two parent suites, not a disconnected standalone premise.","Preserve the inherited, inverted, or transmuted relational vector toward {{user}} implied by the offspring seed.","Do not flatten lineage tension: the generated assets should still feel like a descendant response to parental influence even when the seed expresses rebellion or mutation."]}static async*generate(e,t={}){const{seed:n,template:r,mode:s="Auto",stream:i=!0,blueprint_override:c,additional_instructions:l=[]}=e;yield{type:"status",stage:"initializing"};const d=P.getConfig(),u=this.createConfiguredEngine(),p=r?Ee(r):void 0;yield{type:"status",stage:"building_prompt"};const[h,f]=await xs(n,s,p,void 0,c,l);yield{type:"status",stage:"generating"};const b=ke(h,f);let x="";if(i){for await(const I of u.generateStream(b,{signal:t.signal}))if(I.content&&(x+=I.content,yield{type:"chunk",content:I.content}),I.done)break}else x=(await u.generate(b,{signal:t.signal})).content;yield{type:"status",stage:"parsing"};let M;try{M=p?Fr(x,p).assets:this.parseBlueprintOutput(x)}catch{M=this.parseBlueprintOutput(x)}yield{type:"status",stage:"saving"};const S=this.generateReviewId(),v=ze(M,r),F={path:S,metadata:{review_id:S,seed:n,mode:s,model:d.model,created:new Date().toISOString(),modified:new Date().toISOString(),favorite:!1,template_name:r,character_name:v},assets:M};await L.saveDraft(F),O("drafts"),yield{type:"complete",asset:S}}static async*generateAsset(e,t=!0){const n=Tn(e.template,e.asset_name);yield*this.generateAssetWithBlueprint(e,n,t)}static async*previewBlueprint(e,t=!0){yield*this.generateAssetWithBlueprint(e,e.blueprint_content,t)}static async*generateAssetWithBlueprint(e,t,n){const{seed:r,mode:s="Auto",asset_name:i,prior_assets:c}=e;yield{type:"status",stage:"initializing"};const l=this.createConfiguredEngine();yield{type:"status",stage:"building_prompt"};const[d,u]=await vs(i,r,s,c,t);yield{type:"status",stage:"prompt_ready",asset:i,systemPrompt:d,userPrompt:u},yield{type:"status",stage:"generating",asset:i};const p=ke(d,u);let h="";if(n){for await(const f of l.generateStream(p))if(f.content&&(h+=f.content,yield{type:"chunk",content:f.content,asset:i}),f.done)break}else h=(await l.generate(p)).content;yield{type:"asset",asset:i,content:h,systemPrompt:d,userPrompt:u}}static async*generateOffspringSeed(e,t={}){const{parent1_id:n,parent2_id:r,mode:s="Auto",blueprint_override:i}=e;yield{type:"status",stage:"loading_parents"};const c=await L.getDraft(n),l=await L.getDraft(r);if(!c||!l){yield{type:"error",error:"Parent drafts not found"};return}yield{type:"status",stage:"building_prompt"};const d=this.createConfiguredEngine(),[u,p]=await Ss(c.assets,l.assets,c.metadata.character_name||"Parent 1",l.metadata.character_name||"Parent 2",s,c.metadata.template_name?Ee(c.metadata.template_name):void 0,l.metadata.template_name?Ee(l.metadata.template_name):void 0,void 0,i);yield{type:"status",stage:"generating"};const h=ke(u,p);let f="";for await(const x of d.generateStream(h,{signal:t.signal}))if(x.content&&(f+=x.content,yield{type:"chunk",content:x.content}),x.done)break;yield{type:"complete",content:this.sanitizeGeneratedSeed(f)}}static async*generateOffspring(e,t={}){const{parent1_id:n,parent2_id:r,mode:s="Auto",template:i,blueprint_override:c}=e;let l="";for await(const u of this.generateOffspringSeed(e,t)){if(u.type==="error"){yield u;return}(u.type==="status"||u.type==="chunk")&&(yield u),u.type==="complete"&&(l=u.content||"")}if(!l){yield{type:"error",error:"Offspring seed generation finished without seed content."};return}yield{type:"status",stage:"generating_character"};let d="";for await(const u of this.generate({seed:l,mode:s,template:i,stream:!1,blueprint_override:c,additional_instructions:this.getOffspringCarryRules()},t)){if(u.type==="error"){yield u;return}u.type==="status"&&u.stage==="saving"&&(yield{type:"status",stage:"saving"}),u.type==="complete"&&(d=u.asset||"")}if(!d){yield{type:"error",error:"Offspring generation finished without a saved draft id."};return}await L.updateMetadata(d,{seed:l,parent_drafts:[n,r],offspring_type:"offspring"}),O("drafts"),yield{type:"complete",asset:d}}static async*generateSeeds(e){yield{type:"status",stage:"initializing"};const t=typeof e=="string"?{genre_lines:e}:e,{genreLines:n}=Za(t),r=P.getApiKeys(),s=P.getConfig(),i=this.resolveConfiguredProvider(s),c=he({model:s.model,apiKey:i?r[i]:this.getFallbackApiKey(r),apiKeys:r,provider:i,baseUrl:s.base_url,temperature:s.temperature,maxTokens:s.max_tokens});yield{type:"status",stage:"building_prompt"};const[l,d]=await _s(n,t.blueprint_content);yield{type:"status",stage:"generating"};const u=ke(l,d),p=await c.generate(u);yield{type:"complete",content:es(p.content).join(`
`)}}static async*chat(e,t,n){yield{type:"status",stage:"initializing"};const r=P.getApiKeys(),s=P.getConfig(),i=this.resolveConfiguredProvider(s),c=he({model:s.model,apiKey:i?r[i]:this.getFallbackApiKey(r),apiKeys:r,provider:i,baseUrl:s.base_url,temperature:s.temperature,maxTokens:s.max_tokens});yield{type:"status",stage:"generating"};const d=(t[0]?.role==="system"?t[0].content:void 0)?t.slice(1):t;let u="";for await(const p of c.generateStream(d))if(p.content&&(u+=p.content,yield{type:"chunk",content:p.content}),p.done)break;yield{type:"complete",content:u}}static async analyzeSimilarity(e,t){const n=await L.getDraft(e),r=await L.getDraft(t);if(!n||!r)throw new Error("One or both drafts not found");const s=this.parseCharacterProfile(n.assets.character_sheet||""),i=this.parseCharacterProfile(r.assets.character_sheet||""),c=P.getApiKeys(),l=P.getConfig(),d=this.resolveConfiguredProvider(l),u=he({model:l.model,apiKey:d?c[d]:this.getFallbackApiKey(c),apiKeys:c,provider:d,baseUrl:l.base_url,temperature:l.temperature,maxTokens:l.max_tokens}),[p,h]=ks(s,i),f=ke(p,h),b=await u.generate(f);try{return JSON.parse(b.content)}catch{return{raw:b.content}}}static parseBlueprintOutput(e){const t={},n=/```(\w+)?\n([\s\S]*?)```/g,r=["Adjustment Note","system_prompt","post_history","character_sheet","intro_scene","intro_page","a1111","suno"];let s;for(;(s=n.exec(e))!==null;){const i=s[1],c=s[2]?.trim();i&&c&&r.includes(i)&&(t[i]=c)}if(Object.keys(t).length===0)for(let i=0;i<r.length;i++){const c=r[i],l=r[i+1],d=new RegExp(`^##\\s*${c}`,"im"),u=e.search(d);if(u===-1)continue;let p;if(l){const f=new RegExp(`^##\\s*${l}`,"im"),b=e.slice(u).search(f);p=b===-1?e.length:u+b}else p=e.length;const h=e.slice(u,p).trim();h&&(t[c]=h)}return t}static parseCharacterProfile(e){const t={},n=e.split(`
`);let r=null,s=[];for(const i of n){const c=i.match(/^([A-Z][A-Za-z\s]+):\s*(.+)$/);c?(r&&s.length>0&&(t[r]=s.join(`
`).trim()),r=c[1].trim().toLowerCase().replace(/\s+/g,"_"),s=[c[2].trim()]):r&&i.trim()&&s.push(i.trim())}r&&s.length>0&&(t[r]=s.join(`
`).trim());for(const i of["personality_traits","core_values","goals","fears","motivations"])typeof t[i]=="string"&&(t[i]=t[i].split(",").map(c=>c.trim()).filter(c=>c.length>0));return t}static generateReviewId(){const e=Date.now(),t=Math.random().toString(36).substring(2,9);return`${e}_${t}`}}const Mn="eidolon.web.themes.custom",ft="eidolon:themes-synced",gt="eidolon:drafts-synced";function Ts(a,e){const t=e.match(/^---\n([\s\S]*?)\n---/);let n=a.split("/").pop()?.replace(".md","")||"Blueprint",r="",s="1.0",i=!0;if(!t)return{name:n,description:r,version:s,invokable:i};const c=t[1],l=c.match(/^name:\s*(.+)$/m),d=c.match(/^description:\s*(.+)$/m),u=c.match(/^version:\s*(.+)$/m),p=c.match(/^invokable:\s*(.+)$/m);return l&&(n=l[1].trim()),d&&(r=d[1].trim()),u&&(s=u[1].trim()),p&&(i=p[1].trim()==="true"),{name:n,description:r,version:s,invokable:i}}function Es(a,e){const t=new Set(Et().map(i=>i.template.name).filter(i=>i!==e));if(!t.has(a))return a;const n=a.endsWith(" Copy")?a:`${a} Copy`;if(!t.has(n))return n;let r=2,s=`${n} ${r}`;for(;t.has(s);)r+=1,s=`${n} ${r}`;return s}const Fn=["bpui.web.themes.custom"],As=300*1e3,Fe=new Map,Cs=[{name:"json",path:"json",format:"json",description:"Export the full draft as JSON."},{name:"text",path:"text",format:"text",description:"Export draft assets as plain text sections."},{name:"combined",path:"combined",format:"combined",description:"Export a markdown bundle with metadata and assets."}];function j(a){return{author:"Eidolon Simulacra",is_builtin:!0,...a}}const Ns=[j({name:"dark",display_name:"Dark",description:"Default dark theme for browser-only mode.",tags:["builtin","dark"],based_on:"",colors:{background:"#0f172a",text:"#e5e7eb",accent:"#38bdf8",button:"#1d4ed8",button_text:"#f8fafc",border:"#334155",highlight:"#7dd3fc",window:"#111827",tok_brackets:"#60a5fa",tok_asterisk:"#f472b6",tok_parentheses:"#f59e0b",tok_double_brackets:"#a78bfa",tok_curly_braces:"#34d399",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#94a3b8",surface:"#1e293b",success_bg:"#052e16",danger_bg:"#450a0a",accent_bg:"#082f49",accent_title:"#e0f2fe",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fcd34d"}}),j({name:"light",display_name:"Light",description:"Default light theme for browser-only mode.",tags:["builtin","light"],based_on:"",colors:{background:"#f8fafc",text:"#0f172a",accent:"#2563eb",button:"#1d4ed8",button_text:"#eff6ff",border:"#cbd5e1",highlight:"#0ea5e9",window:"#ffffff",tok_brackets:"#2563eb",tok_asterisk:"#db2777",tok_parentheses:"#d97706",tok_double_brackets:"#7c3aed",tok_curly_braces:"#059669",tok_pipes:"#0891b2",tok_at_sign:"#e11d48",muted_text:"#64748b",surface:"#ffffff",success_bg:"#dcfce7",danger_bg:"#fee2e2",accent_bg:"#dbeafe",accent_title:"#1e3a8a",success_text:"#166534",error_text:"#991b1b",warning_text:"#92400e"}}),j({name:"nyx",display_name:"Nyx",description:"High-contrast theme tuned for the blueprint workflow.",tags:["builtin","editorial"],based_on:"dark",colors:{background:"#111113",text:"#f3f4f6",accent:"#f97316",button:"#c2410c",button_text:"#fff7ed",border:"#3f3f46",highlight:"#fb923c",window:"#18181b",tok_brackets:"#60a5fa",tok_asterisk:"#f472b6",tok_parentheses:"#f59e0b",tok_double_brackets:"#c084fc",tok_curly_braces:"#4ade80",tok_pipes:"#67e8f9",tok_at_sign:"#fb7185",muted_text:"#a1a1aa",surface:"#18181b",success_bg:"#052e16",danger_bg:"#431407",accent_bg:"#431407",accent_title:"#ffedd5",success_text:"#86efac",error_text:"#fdba74",warning_text:"#fed7aa"}}),j({name:"midnight",display_name:"Midnight",description:"Deep blue ocean theme with cyan accents.",tags:["builtin","dark","blue"],based_on:"dark",colors:{background:"#0a1929",text:"#b2d4f0",accent:"#00b4d8",button:"#014361",button_text:"#caf0f8",border:"#1d3557",highlight:"#48cae4",window:"#051923",tok_brackets:"#00b4d8",tok_asterisk:"#90e0ef",tok_parentheses:"#f48c06",tok_double_brackets:"#06ffa5",tok_curly_braces:"#00b4d8",tok_pipes:"#48cae4",tok_at_sign:"#f77f00",muted_text:"#6b8aa3",surface:"#0f2638",success_bg:"#1b4332",danger_bg:"#641220",accent_bg:"#014361",accent_title:"#48cae4",success_text:"#06ffa5",error_text:"#ff6b6b",warning_text:"#f48c06"}}),j({name:"ember",display_name:"Ember",description:"Warm theme with orange and amber tones.",tags:["builtin","warm","orange"],based_on:"dark",colors:{background:"#1a0f0a",text:"#ffd8b8",accent:"#ff6b35",button:"#c44536",button_text:"#fff8f0",border:"#5e1914",highlight:"#ff8c42",window:"#100a07",tok_brackets:"#ff6b35",tok_asterisk:"#ffa07a",tok_parentheses:"#ffb627",tok_double_brackets:"#7bed9f",tok_curly_braces:"#ff6348",tok_pipes:"#feca57",tok_at_sign:"#ff4757",muted_text:"#a67c52",surface:"#261612",success_bg:"#2d4a2b",danger_bg:"#5e1914",accent_bg:"#c44536",accent_title:"#ff8c42",success_text:"#7bed9f",error_text:"#ff4757",warning_text:"#feca57"}}),j({name:"forest",display_name:"Forest",description:"Natural green theme inspired by woodland twilight.",tags:["builtin","green","nature"],based_on:"dark",colors:{background:"#0d1b0f",text:"#d4f1d4",accent:"#4ecca3",button:"#2d5f3f",button_text:"#e8f5e8",border:"#1e4620",highlight:"#7bed9f",window:"#081108",tok_brackets:"#4ecca3",tok_asterisk:"#7bed9f",tok_parentheses:"#ffd93d",tok_double_brackets:"#6bcf7f",tok_curly_braces:"#48c774",tok_pipes:"#95e1d3",tok_at_sign:"#f8b500",muted_text:"#6b8f71",surface:"#152518",success_bg:"#2d5f3f",danger_bg:"#5c2a2a",accent_bg:"#2d5f3f",accent_title:"#7bed9f",success_text:"#95e1d3",error_text:"#ff6b6b",warning_text:"#ffd93d"}}),j({name:"mono",display_name:"Monochrome",description:"Clean grayscale theme for minimal distraction.",tags:["builtin","minimal","grayscale"],based_on:"dark",colors:{background:"#1c1c1c",text:"#e0e0e0",accent:"#757575",button:"#424242",button_text:"#ffffff",border:"#505050",highlight:"#9e9e9e",window:"#141414",tok_brackets:"#bdbdbd",tok_asterisk:"#9e9e9e",tok_parentheses:"#757575",tok_double_brackets:"#e0e0e0",tok_curly_braces:"#a0a0a0",tok_pipes:"#c0c0c0",tok_at_sign:"#888888",muted_text:"#707070",surface:"#242424",success_bg:"#3a3a3a",danger_bg:"#2e2e2e",accent_bg:"#424242",accent_title:"#9e9e9e",success_text:"#c0c0c0",error_text:"#a0a0a0",warning_text:"#b0b0b0"}}),j({name:"solarized_dark",display_name:"Solarized Dark",description:"Popular Solarized color scheme with reduced eye strain.",tags:["builtin","dark","solarized"],based_on:"dark",colors:{background:"#002b36",text:"#839496",accent:"#268bd2",button:"#073642",button_text:"#eee8d5",border:"#586e75",highlight:"#2aa198",window:"#001e26",tok_brackets:"#dc322f",tok_asterisk:"#268bd2",tok_parentheses:"#cb4b16",tok_double_brackets:"#859900",tok_curly_braces:"#d33682",tok_pipes:"#2aa198",tok_at_sign:"#b58900",muted_text:"#586e75",surface:"#073642",success_bg:"#324d32",danger_bg:"#4d2626",accent_bg:"#073642",accent_title:"#2aa198",success_text:"#859900",error_text:"#dc322f",warning_text:"#b58900"}}),j({name:"trans_flag",display_name:"Trans Flag",description:"Soft cyan and pink palette with neutral dark surfaces.",tags:["builtin","support","bright"],based_on:"dark",colors:{background:"#2e2e2e",text:"#ffffff",accent:"#5bcefa",button:"#f5a9b8",button_text:"#2e2e2e",border:"#cccccc",highlight:"#5bcefa",window:"#3e3e3e",tok_brackets:"#5bcefa",tok_asterisk:"#f5a9b8",tok_parentheses:"#5bcefa",tok_double_brackets:"#f5a9b8",tok_curly_braces:"#ffffff",tok_pipes:"#5bcefa",tok_at_sign:"#f5a9b8",muted_text:"#cccccc",surface:"#3e3e3e",success_bg:"#5bcefa",danger_bg:"#f5a9b8",accent_bg:"#3e3e3e",accent_title:"#5bcefa",success_text:"#2e2e2e",error_text:"#2e2e2e",warning_text:"#2e2e2e"}}),j({name:"blood_for_the_blood_god",display_name:"Blood for the Blood God",description:"A blood red theme with bronze accents.",tags:["builtin","warhammer","chaos","khorne"],based_on:"dark",colors:{background:"#200000",text:"#ffcccc",accent:"#cd7f32",button:"#600000",button_text:"#ffcccc",border:"#400000",highlight:"#ff0000",window:"#200000",tok_brackets:"#e00000",tok_asterisk:"#c00000",tok_parentheses:"#a00000",tok_double_brackets:"#e00000",tok_curly_braces:"#c00000",tok_pipes:"#a00000",tok_at_sign:"#ff0000",muted_text:"#996666",surface:"#400000",success_bg:"#600000",danger_bg:"#800000",accent_bg:"#a06629",accent_title:"#cd7f32",success_text:"#ffcccc",error_text:"#ffcccc",warning_text:"#ffcccc"}}),j({name:"silent_king",display_name:"Silent King",description:"A near-black theme with tomb-world green glow.",tags:["builtin","warhammer","necron","green"],based_on:"dark",colors:{background:"#010a01",text:"#a0e0a0",accent:"#00ff00",button:"#004000",button_text:"#a0e0a0",border:"#002000",highlight:"#00ff00",window:"#010501",tok_brackets:"#00c000",tok_asterisk:"#00a000",tok_parentheses:"#008000",tok_double_brackets:"#00c000",tok_curly_braces:"#00a000",tok_pipes:"#008000",tok_at_sign:"#00ff00",muted_text:"#609060",surface:"#010a01",success_bg:"#004000",danger_bg:"#006000",accent_bg:"#004000",accent_title:"#00ff00",success_text:"#a0e0a0",error_text:"#a0e0a0",warning_text:"#a0e0a0"}}),j({name:"ultramar",display_name:"Ultramar",description:"Cerulean armor, parchment ivory, and gold command trim.",tags:["builtin","warhammer","space-marine","blue"],based_on:"dark",colors:{background:"#08172f",text:"#e8eef7",accent:"#d4a72c",button:"#12396b",button_text:"#f8fafc",border:"#245089",highlight:"#4da3ff",window:"#0b2140",tok_brackets:"#60a5fa",tok_asterisk:"#facc15",tok_parentheses:"#fb7185",tok_double_brackets:"#93c5fd",tok_curly_braces:"#67e8f9",tok_pipes:"#c084fc",tok_at_sign:"#f97316",muted_text:"#93a9c4",surface:"#102949",success_bg:"#163b2a",danger_bg:"#481818",accent_bg:"#3d2b05",accent_title:"#fde68a",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fde047"}}),j({name:"imperial_fists",display_name:"Imperial Fists",description:"Siege yellow palette with navy shadows and hazard-strip energy.",tags:["builtin","warhammer","space-marine","yellow"],based_on:"dark",colors:{background:"#1c1603",text:"#fff6cc",accent:"#ffd100",button:"#7c6200",button_text:"#fffbea",border:"#8e740f",highlight:"#ffe66d",window:"#241d05",tok_brackets:"#ffd100",tok_asterisk:"#60a5fa",tok_parentheses:"#fb923c",tok_double_brackets:"#fde68a",tok_curly_braces:"#facc15",tok_pipes:"#93c5fd",tok_at_sign:"#f87171",muted_text:"#c5b671",surface:"#302608",success_bg:"#2d3d1b",danger_bg:"#51210f",accent_bg:"#483701",accent_title:"#fff3a3",success_text:"#bef264",error_text:"#fca5a5",warning_text:"#fde047"}}),j({name:"raven_guard",display_name:"Raven Guard",description:"Matte black surfaces with pale steel highlights and a covert red ping.",tags:["builtin","warhammer","space-marine","stealth"],based_on:"dark",colors:{background:"#09090b",text:"#e7e5e4",accent:"#d4d4d8",button:"#18181b",button_text:"#fafafa",border:"#3f3f46",highlight:"#a1a1aa",window:"#0f1014",tok_brackets:"#e4e4e7",tok_asterisk:"#f87171",tok_parentheses:"#c084fc",tok_double_brackets:"#93c5fd",tok_curly_braces:"#86efac",tok_pipes:"#67e8f9",tok_at_sign:"#fb7185",muted_text:"#71717a",surface:"#14151a",success_bg:"#14231a",danger_bg:"#3f1014",accent_bg:"#20232a",accent_title:"#f4f4f5",success_text:"#86efac",error_text:"#fda4af",warning_text:"#fdba74"}}),j({name:"salamanders",display_name:"Salamanders",description:"Volcanic green palette with lava orange contrast.",tags:["builtin","warhammer","space-marine","green"],based_on:"dark",colors:{background:"#08130e",text:"#d9f4dd",accent:"#ff7a00",button:"#1c5b34",button_text:"#f7fff8",border:"#2f7d4e",highlight:"#34d399",window:"#0d1d16",tok_brackets:"#4ade80",tok_asterisk:"#fb923c",tok_parentheses:"#facc15",tok_double_brackets:"#86efac",tok_curly_braces:"#22c55e",tok_pipes:"#2dd4bf",tok_at_sign:"#f97316",muted_text:"#7ca58a",surface:"#11251b",success_bg:"#123825",danger_bg:"#4a1d11",accent_bg:"#4a2205",accent_title:"#fdba74",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde047"}}),j({name:"iron_warriors",display_name:"Iron Warriors",description:"Gunmetal, hazard yellow, and industrial rust.",tags:["builtin","warhammer","chaos","industrial"],based_on:"dark",colors:{background:"#101114",text:"#d8d7d2",accent:"#facc15",button:"#3a3d42",button_text:"#fffce8",border:"#5a5f69",highlight:"#fde047",window:"#17191d",tok_brackets:"#facc15",tok_asterisk:"#fb7185",tok_parentheses:"#fb923c",tok_double_brackets:"#d4d4d8",tok_curly_braces:"#93c5fd",tok_pipes:"#67e8f9",tok_at_sign:"#f97316",muted_text:"#8f9098",surface:"#20242a",success_bg:"#243326",danger_bg:"#48211a",accent_bg:"#43370a",accent_title:"#fef08a",success_text:"#86efac",error_text:"#fdba74",warning_text:"#fde047"}}),j({name:"mechanicus_brass",display_name:"Mechanicus Brass",description:"Mars red, soot black, and worn brass for forge-heavy work.",tags:["builtin","warhammer","mechanicus","red"],based_on:"dark",colors:{background:"#130909",text:"#f1d9c3",accent:"#c98b2b",button:"#611616",button_text:"#fff4e6",border:"#7f2a1d",highlight:"#e2a74a",window:"#1a0d0d",tok_brackets:"#f87171",tok_asterisk:"#fbbf24",tok_parentheses:"#fdba74",tok_double_brackets:"#fca5a5",tok_curly_braces:"#fcd34d",tok_pipes:"#93c5fd",tok_at_sign:"#fb7185",muted_text:"#a98a75",surface:"#251212",success_bg:"#1f3424",danger_bg:"#4c1515",accent_bg:"#3f2610",accent_title:"#f6d28b",success_text:"#86efac",error_text:"#fca5a5",warning_text:"#fcd34d"}}),j({name:"sororitas_rose",display_name:"Sororitas Rose",description:"Ivory, cathedral black, and stained-glass crimson.",tags:["builtin","warhammer","imperium","gothic"],based_on:"dark",colors:{background:"#141112",text:"#f7ede8",accent:"#b91c1c",button:"#3c1318",button_text:"#fff7f5",border:"#6d2730",highlight:"#fb7185",window:"#1b1718",tok_brackets:"#fda4af",tok_asterisk:"#facc15",tok_parentheses:"#fdba74",tok_double_brackets:"#f5f5f4",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#ef4444",muted_text:"#b2a29c",surface:"#231d1f",success_bg:"#203326",danger_bg:"#4b1319",accent_bg:"#3b1016",accent_title:"#fecdd3",success_text:"#bbf7d0",error_text:"#fecaca",warning_text:"#fdba74"}}),j({name:"cadia_stands",display_name:"Cadia Stands",description:"Military olive, field khaki, and disciplined gold signals.",tags:["builtin","warhammer","imperium","guard"],based_on:"dark",colors:{background:"#11160f",text:"#e6ecd8",accent:"#c8a54b",button:"#3a4b2a",button_text:"#f8faee",border:"#556a3e",highlight:"#a3c76d",window:"#171d14",tok_brackets:"#a3c76d",tok_asterisk:"#facc15",tok_parentheses:"#fb923c",tok_double_brackets:"#d9f99d",tok_curly_braces:"#86efac",tok_pipes:"#93c5fd",tok_at_sign:"#f87171",muted_text:"#99a58b",surface:"#20281b",success_bg:"#243624",danger_bg:"#4a2218",accent_bg:"#3e3413",accent_title:"#f5e6b1",success_text:"#bbf7d0",error_text:"#fca5a5",warning_text:"#fde68a"}}),j({name:"krieg_ash",display_name:"Krieg Ash",description:"Trenchcoat slate, muddy blue, and mask-lens amber.",tags:["builtin","warhammer","imperium","guard"],based_on:"dark",colors:{background:"#101417",text:"#dae1e5",accent:"#d1a449",button:"#3a4854",button_text:"#f6f7f8",border:"#55616c",highlight:"#9db7c7",window:"#151b20",tok_brackets:"#93c5fd",tok_asterisk:"#facc15",tok_parentheses:"#fb923c",tok_double_brackets:"#cbd5e1",tok_curly_braces:"#86efac",tok_pipes:"#67e8f9",tok_at_sign:"#f87171",muted_text:"#8e9aa3",surface:"#1d242a",success_bg:"#233127",danger_bg:"#48231c",accent_bg:"#3f3118",accent_title:"#f4deb1",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde68a"}}),j({name:"thousand_sons",display_name:"Thousand Sons",description:"Arcane cobalt with turquoise sorcery and gilded trim.",tags:["builtin","warhammer","chaos","arcane"],based_on:"dark",colors:{background:"#081427",text:"#dce9ff",accent:"#22d3ee",button:"#12335f",button_text:"#f0f9ff",border:"#1d4f91",highlight:"#7dd3fc",window:"#0d1b35",tok_brackets:"#38bdf8",tok_asterisk:"#facc15",tok_parentheses:"#fb7185",tok_double_brackets:"#67e8f9",tok_curly_braces:"#a78bfa",tok_pipes:"#22d3ee",tok_at_sign:"#f97316",muted_text:"#96a9c6",surface:"#132346",success_bg:"#14312c",danger_bg:"#451b2f",accent_bg:"#10354d",accent_title:"#cffafe",success_text:"#99f6e4",error_text:"#f9a8d4",warning_text:"#fde047"}}),j({name:"drukhari_raid",display_name:"Drukhari Raid",description:"Poison teal, blade violet, and void-black lacquer.",tags:["builtin","warhammer","aeldari","neon"],based_on:"dark",colors:{background:"#09070f",text:"#ece7ff",accent:"#14b8a6",button:"#2c1144",button_text:"#f5f3ff",border:"#5b21b6",highlight:"#5eead4",window:"#100b1a",tok_brackets:"#2dd4bf",tok_asterisk:"#c084fc",tok_parentheses:"#f472b6",tok_double_brackets:"#67e8f9",tok_curly_braces:"#a78bfa",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#9d94b8",surface:"#170f25",success_bg:"#123028",danger_bg:"#43162e",accent_bg:"#102f31",accent_title:"#ccfbf1",success_text:"#99f6e4",error_text:"#f9a8d4",warning_text:"#f0abfc"}}),j({name:"ork_waaagh",display_name:"Ork Waaagh!",description:"Scrap metal, noisy green, and red-goes-fasta contrast.",tags:["builtin","warhammer","ork","high-energy"],based_on:"dark",colors:{background:"#11140c",text:"#e2f5b8",accent:"#67e01f",button:"#734116",button_text:"#fff7ed",border:"#4b5f1a",highlight:"#84cc16",window:"#181d10",tok_brackets:"#84cc16",tok_asterisk:"#ef4444",tok_parentheses:"#f97316",tok_double_brackets:"#bef264",tok_curly_braces:"#facc15",tok_pipes:"#22d3ee",tok_at_sign:"#fb7185",muted_text:"#9eb279",surface:"#232813",success_bg:"#26401d",danger_bg:"#5a2314",accent_bg:"#293a12",accent_title:"#d9f99d",success_text:"#d9f99d",error_text:"#fdba74",warning_text:"#fde047"}}),j({name:"tau_sept",display_name:"Tau Sept",description:"Clean ochre, alloy grey, and cool interface blue.",tags:["builtin","warhammer","tau","clean"],based_on:"dark",colors:{background:"#11161a",text:"#e8edf0",accent:"#f59e0b",button:"#41525f",button_text:"#f8fafc",border:"#617688",highlight:"#7dd3fc",window:"#161d23",tok_brackets:"#93c5fd",tok_asterisk:"#fbbf24",tok_parentheses:"#fb923c",tok_double_brackets:"#cbd5e1",tok_curly_braces:"#67e8f9",tok_pipes:"#38bdf8",tok_at_sign:"#f97316",muted_text:"#9aa8b2",surface:"#202930",success_bg:"#1e3430",danger_bg:"#4a2218",accent_bg:"#41320c",accent_title:"#fde68a",success_text:"#99f6e4",error_text:"#fdba74",warning_text:"#fde047"}}),j({name:"tyranid_hive",display_name:"Tyranid Hive",description:"Bone chitin, toxic magenta, and abyssal carapace purple.",tags:["builtin","warhammer","tyranid","organic"],based_on:"dark",colors:{background:"#120c18",text:"#f3e8ff",accent:"#f472b6",button:"#3f1b4d",button_text:"#fff7fb",border:"#6b2d78",highlight:"#f9a8d4",window:"#1a1222",tok_brackets:"#f5d0fe",tok_asterisk:"#fb7185",tok_parentheses:"#fdba74",tok_double_brackets:"#e9d5ff",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#f43f5e",muted_text:"#b7a3c4",surface:"#24182f",success_bg:"#243321",danger_bg:"#4f1733",accent_bg:"#441a3d",accent_title:"#fbcfe8",success_text:"#bef264",error_text:"#fda4af",warning_text:"#fdba74"}}),j({name:"genestealer_cult",display_name:"Genestealer Cult",description:"Industrial violet with warning pink and cult neon accents.",tags:["builtin","warhammer","tyranid","industrial"],based_on:"dark",colors:{background:"#0f1020",text:"#ede9fe",accent:"#8b5cf6",button:"#312e81",button_text:"#f5f3ff",border:"#5b4bc4",highlight:"#c084fc",window:"#151730",tok_brackets:"#a78bfa",tok_asterisk:"#fb7185",tok_parentheses:"#f97316",tok_double_brackets:"#ddd6fe",tok_curly_braces:"#67e8f9",tok_pipes:"#c084fc",tok_at_sign:"#f43f5e",muted_text:"#a6a1c9",surface:"#1d2040",success_bg:"#203229",danger_bg:"#47152a",accent_bg:"#2e255d",accent_title:"#e9d5ff",success_text:"#99f6e4",error_text:"#fda4af",warning_text:"#fdba74"}}),j({name:"golden_throne",display_name:"Golden Throne",description:"Black marble, relic gold, and cathedral ivory.",tags:["builtin","warhammer","imperium","gold"],based_on:"dark",colors:{background:"#110f0d",text:"#f6efe2",accent:"#d4af37",button:"#4a3510",button_text:"#fffbeb",border:"#6f5521",highlight:"#f6d365",window:"#171411",tok_brackets:"#fcd34d",tok_asterisk:"#fda4af",tok_parentheses:"#fdba74",tok_double_brackets:"#fef3c7",tok_curly_braces:"#c084fc",tok_pipes:"#67e8f9",tok_at_sign:"#f87171",muted_text:"#b3a58d",surface:"#231e18",success_bg:"#253224",danger_bg:"#472119",accent_bg:"#433311",accent_title:"#fef3c7",success_text:"#bbf7d0",error_text:"#fdba74",warning_text:"#fde68a"}})];class Q{constructor(e){this.executor=e}readers=[];onComplete;onError;controller=new AbortController;subscribe(e){return this.readers.push(e),this}onComplete_(e){return this.onComplete=e,this}onError_(e){return this.onError=e,this}async start(){try{await this.executor({emit:(e,t)=>this.emit(e,t),signal:this.controller.signal})}catch(e){if(this.controller.signal.aborted)return;this.emit("error",{error:e instanceof Error?e.message:"Stream failed"})}}abort(){this.controller.abort()}emit(e,t){const n={event:e,data:t};this.readers.forEach(r=>r(n)),n.event==="complete"&&this.onComplete&&this.onComplete(n.data),n.event==="error"&&this.onError&&this.onError(n.data.error)}}class D extends Error{constructor(e,t){super(t),this.status=e,this.name="APIError"}}function js(a,e){if(typeof window>"u")return e;const t=Array.isArray(a)?[...a]:[a],[n,...r]=t;try{for(const s of t){const i=window.localStorage.getItem(s);if(!i)continue;const c=JSON.parse(i);return s!==n&&(window.localStorage.setItem(n,JSON.stringify(c)),r.forEach(l=>window.localStorage.removeItem(l))),c}}catch{return e}return e}function Ps(a,e,t){typeof window>"u"||(window.localStorage.setItem(a,JSON.stringify(t)),e.forEach(n=>window.localStorage.removeItem(n)))}function rt(a){return a.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function at(){return{...P.getConfig(),api_keys:P.getApiKeys()}}function Is(a){return a.engine_mode==="explicit"&&a.engine!=="auto"&&a.engine!=="openai_compatible"?a.engine:a.model?wt(a.model):void 0}function Un(a){return Object.values(a).find(e=>typeof e=="string"&&e.trim().length>0)}function Os(a,e){const t=e[a];return typeof t=="string"&&t.trim().length>0?t:Un(e)}function ae(){return js([Mn,...Fn],[])}function pe(a){Ps(Mn,Fn,a)}function Ue(){return[...Ns,...ae()]}function zt(a){typeof window>"u"||window.dispatchEvent(new CustomEvent(a))}function Ds(a,e,t=a){const n=t.reduce((r,s)=>{r.total_drafts+=1,s.favorite&&(r.favorites+=1);const i=s.genre||"unknown",c=s.mode||"unknown";return r.by_genre[i]=(r.by_genre[i]||0)+1,r.by_mode[c]=(r.by_mode[c]||0)+1,r},{total_drafts:0,favorites:0,by_genre:{},by_mode:{}});return{drafts:a,total:e,stats:n}}function Rs(a,e){let t=[...a];if(e?.search){const c=e.search.toLowerCase();t=t.filter(l=>[l.character_name,l.seed,l.genre,l.notes].filter(Boolean).some(d=>String(d).toLowerCase().includes(c)))}e?.genre&&(t=t.filter(c=>c.genre===e.genre)),e?.mode&&(t=t.filter(c=>c.mode===e.mode)),e?.favorite!==void 0&&(t=t.filter(c=>c.favorite===e.favorite)),e?.tags?.length&&(t=t.filter(c=>e.tags?.every(l=>c.tags?.includes(l))));const n=e?.sort_order==="asc"?1:-1,r=e?.sort_by??"modified";t.sort((c,l)=>{const d=r==="name"?c.character_name||c.seed||"":(r==="created"?c.created:c.modified)||"",u=r==="name"?l.character_name||l.seed||"":(r==="created"?l.created:l.modified)||"";return d.localeCompare(u)*n});const s=e?.offset??0,i=e?.limit;return i!==void 0?t=t.slice(s,s+i):s>0&&(t=t.slice(s)),t}function qt(a){const e=[],t=Ee(a.metadata.template_name)||xt;return pn(t).filter(r=>r.required).forEach(r=>{a.assets[r.name]?.trim()||e.push(`- missing required asset ${r.name}`)}),Object.entries(a.assets).forEach(([r,s])=>{if(!s.trim()){e.push(`- ${r}: asset is empty`);return}const i=un(r,s);i.length>0&&e.push(`- ${r}: ${Array.from(new Set(i)).join(", ")}`)}),e.length===0?e.push("OK: no obvious placeholder violations found in saved assets."):e.unshift("VALIDATION FAILED"),{path:a.metadata.review_id,output:e.join(`
`),errors:"",exit_code:e[0]==="VALIDATION FAILED"?1:0,success:e[0]!=="VALIDATION FAILED"}}function Vt(a){const e=`${a.metadata.character_name||""}
${a.metadata.seed}
${Object.values(a.assets).join(`
`)}`.toLowerCase().replace(/[^a-z0-9\s]+/g," ").split(/\s+/).filter(t=>t.length>3);return new Set(e)}function Ls(a){return a>=.7?"high":a>=.45?"medium":"low"}function Ms(a,e){const t=Vt(a),n=Vt(e),r=[...t].filter(p=>n.has(p)),s=[...t].filter(p=>!n.has(p)),i=[...n].filter(p=>!t.has(p)),c=new Set([...t,...n]).size||1,l=r.length/c,d=Math.min(1,(s.length+i.length)/Math.max(c,1)),u=Math.min(1,l+.15);return{character1_name:a.metadata.character_name||a.metadata.seed,character2_name:e.metadata.character_name||e.metadata.seed,overall_score:l,compatibility:Ls(l),conflict_potential:d,synergy_potential:u,commonalities:r.slice(0,8),differences:[...s.slice(0,4),...i.slice(0,4)],relationship_suggestions:l>=.6?["Shared themes suggest an easy alliance arc.","Overlapping traits support collaborative scenes."]:["Use the contrast between their goals for tension.","Differences suggest rivalry or uneasy partnership."],meta_analysis:{archetype_match:l,narrative_compatibility:u,audience_appeal:Math.max(l,.35)}}}function Fs(a){const e=new Map;a.forEach(l=>{l.parent_drafts?.forEach(d=>{const u=e.get(d)??[];u.push(l.review_id),e.set(d,u)})});const t=new Map(a.map(l=>[l.review_id,l])),n=new Map,r=l=>{if(n.has(l))return n.get(l);const d=t.get(l);if(!d?.parent_drafts?.length)return n.set(l,0),0;const u=1+Math.max(...d.parent_drafts.map(p=>r(p)));return n.set(l,u),u},s=a.map(l=>{const d=l.parent_drafts??[],u=e.get(l.review_id)??[],p=r(l.review_id),h=d.map(b=>t.get(b)?.character_name||b),f=u.map(b=>t.get(b)?.character_name||b);return{id:l.review_id,review_id:l.review_id,draft_name:l.seed,character_name:l.character_name||l.seed,generation:p,is_root:d.length===0,is_leaf:u.length===0,offspring_type:l.offspring_type,mode:l.mode,model:l.model,created:l.created,parent_ids:d,child_ids:u,parent_names:h,child_names:f,sibling_names:d.flatMap(b=>(e.get(b)??[]).filter(x=>x!==l.review_id)).map(b=>t.get(b)?.character_name||b),num_ancestors:d.length,num_descendants:u.length}}),i=s.filter(l=>l.is_root).map(l=>l.id),c=s.reduce((l,d)=>Math.max(l,d.generation),0);return{nodes:s,roots:i,max_generation:c,stats:{total_characters:s.length,root_characters:s.filter(l=>l.is_root).length,leaf_characters:s.filter(l=>l.is_leaf).length,generations:c+1}}}function Se(a,e,t){return{blob:new Blob([a],{type:t}),filename:e,contentType:t}}function Yt(a){return a.replace(/^##/gm,"\\##")}async function Jt(a){const e=P.getConfig(),t=P.getApiKeys(),n=Is(e);return he({model:e.model,apiKey:n?t[n]:Un(t),apiKeys:t,provider:n,baseUrl:e.base_url,temperature:e.temperature,maxTokens:e.max_tokens}).generateStream(a)}class Us{themesSyncPromise=null;draftsSyncPromise=null;async fetchOpenAICompatibleModels(e,t,n){const r=`${n}/models`,s=me(e,t),i=await fetch(r,{method:"GET",headers:s});if(!i.ok){let d=`HTTP ${i.status}`;try{const u=await i.json();typeof u.error=="string"?d=u.error:u.error?.message&&(d=u.error.message)}catch{}throw new D(i.status,d)}const l=((await i.json()).data||[]).filter(d=>!!d?.id).map(d=>({id:d.id,name:d.name||d.id,provider:e,context_length:d.context_length,supports_vision:d.architecture?.input_modalities?.includes("image")||!1,supports_tools:d.supported_parameters?.includes("tools")||!1}));return{provider:e,models:l,cached:!1}}async loadProviderModels(e,t=!1){const n=P.getApiKeys(),r=P.getConfig(),s=e,i=r.base_url||sa(s),c=Os(e,n),l=`${e}|${i}|${c?"auth":"anon"}`,d=Fe.get(l);if(!t&&d&&Date.now()-d.cachedAt<As)return{...d.response,cached:!0};const u=(Ut[s]||[]).map(h=>({id:h,name:h,provider:e})),p=["openrouter","openai","deepseek","zai","moonshot"].includes(e);if(!c||!p){const h={provider:e,models:u,cached:!0,error:c||p?void 0:"Provider model listing is not available in browser mode."};return Fe.set(l,{response:h,cachedAt:Date.now()}),h}try{const h=await this.fetchOpenAICompatibleModels(e,c,i);return Fe.set(l,{response:h,cachedAt:Date.now()}),h}catch(h){const b=h instanceof TypeError&&h.message==="Failed to fetch"?"Network request blocked. This may be due to browser privacy settings (common in EU), ad blockers, or firewall restrictions. Try disabling tracking protection for this site or using a different network.":h instanceof Error?h.message:"Failed to load models",x={provider:e,models:u,cached:!0,error:b};return Fe.set(l,{response:x,cachedAt:Date.now()}),x}}async getConfig(){return at()}getConfigSnapshot(){return at()}getThemesSnapshot(){return Ue()}async updateConfig(e){const t={...e};return e.api_keys&&(P.setApiKeys(e.api_keys),delete t.api_keys),P.updateConfig(t),O("config"),this.getConfig()}async testConnection(e){const t=P.getApiKeys()[e.provider];if(!t)return{success:!1,error:`No API key configured for ${e.provider}`};const n=e.model||Ut[e.provider]?.[0]||at().model;return he({model:n,apiKey:t,provider:e.provider,baseUrl:e.base_url}).testConnection()}async syncThemesFromServer(){return this.themesSyncPromise?this.themesSyncPromise:(this.themesSyncPromise=(async()=>{if(!k.isEnabled()||!k.hasAccessToken())return!1;try{if(!(await k.checkStatus()).authenticated)return!1;const{themes:t}=await k.syncThemes("pull"),n=ae();let r=!1;for(const s of t){if(s.isBuiltin)continue;const i={name:s.name,display_name:s.displayName||s.name,description:s.description||"",author:s.author||"",tags:s.tags,based_on:s.basedOn||"",is_builtin:!1,colors:s.colors},c=n.findIndex(l=>l.name===s.name);c>=0?JSON.stringify(n[c])!==JSON.stringify(i)&&(n[c]=i,r=!0):(n.push(i),r=!0)}return r&&(pe(n),zt(ft)),r}catch(e){return console.warn("Failed to sync themes from server:",e),!1}finally{this.themesSyncPromise=null}})(),this.themesSyncPromise)}async syncDraftsFromServer(){return this.draftsSyncPromise?this.draftsSyncPromise:(this.draftsSyncPromise=(async()=>{if(!k.isEnabled()||!k.hasAccessToken())return!1;try{if(!(await k.checkStatus()).authenticated)return!1;const{drafts:t}=await k.syncDrafts("pull");let n=!1;for(const r of t){const s=await L.getDraft(r.reviewId);if(!s){await L.saveDraft({path:r.reviewId,metadata:{review_id:r.reviewId,seed:r.seed,mode:r.mode,model:r.model,character_name:r.characterName,template_name:r.templateName,genre:r.genre,notes:r.notes,favorite:r.favorite,tags:r.tags,offspring_type:r.offspringType},assets:r.assets}),n=!0;continue}const i=new Date(s.metadata.modified||0).getTime();new Date(r.updatedAt).getTime()>i&&(await L.saveDraft({path:s.path,metadata:{...s.metadata,seed:r.seed,mode:r.mode,model:r.model,character_name:r.characterName,template_name:r.templateName,genre:r.genre,notes:r.notes,favorite:r.favorite,tags:r.tags,offspring_type:r.offspringType},assets:r.assets}),n=!0)}return n&&zt(gt),n}catch(e){return console.warn("Failed to sync drafts from server:",e),!1}finally{this.draftsSyncPromise=null}})(),this.draftsSyncPromise)}async getThemes(){return this.syncThemesFromServer(),this.getThemesSnapshot()}async createTheme(e){const t=ae();if(Ue().some(r=>r.name===e.name))throw new D(409,`Theme ${e.name} already exists`);const n={...e,description:e.description||"",author:e.author||"",tags:e.tags||[],based_on:e.based_on||"",is_builtin:!1};return t.push(n),pe(t),O("themes"),n}async exportTheme(e){const t=Ue().find(n=>n.name===e);if(!t)throw new D(404,`Theme ${e} not found`);return Se(JSON.stringify(t,null,2),`${rt(e)}.json`,"application/json")}async importTheme(e,t={}){const r={...JSON.parse(await e.text()),is_builtin:!1},s=ae(),i=s.findIndex(c=>c.name===r.name);if(i>=0)if(t.conflict_strategy==="overwrite")s[i]=r;else if(t.conflict_strategy==="rename")r.name=t.target_name||`${r.name}_copy`,s.push(r);else throw new D(409,`Theme ${r.name} already exists`);else s.push(r);return pe(s),O("themes"),r}async updateTheme(e,t){const n=ae(),r=n.findIndex(s=>s.name===e);if(r<0)throw new D(404,`Theme ${e} is builtin or missing`);return n[r]={...n[r],...t},pe(n),O("themes"),n[r]}async duplicateTheme(e,t){const n=Ue().find(r=>r.name===e);if(!n)throw new D(404,`Theme ${e} not found`);return this.createTheme({name:t.new_name,display_name:t.display_name||n.display_name,description:t.description||n.description,author:t.author||n.author,tags:t.tags||n.tags,based_on:t.based_on||n.name,colors:n.colors})}async renameTheme(e,t){return this.updateTheme(e,{display_name:t.display_name,...t.new_name!==e?{}:{}}).then(n=>{const r=ae(),s=r.findIndex(i=>i.name===e);if(s<0)throw new D(404,`Theme ${e} is builtin or missing`);return r[s]={...n,name:t.new_name},pe(r),O("themes"),r[s]})}async deleteTheme(e){const t=ae().filter(n=>n.name!==e);return pe(t),O("themes"),{status:"deleted",name:e}}async getModels(e){return this.loadProviderModels(e,!1)}async refreshModels(e){const t=await this.loadProviderModels(e,!0);return{status:"ok",model_count:t.models.length,error:t.error}}async generateSeeds(e){const t=[];for await(const n of X.generateSeeds(e))n.type==="complete"&&n.content&&t.push(...n.content.split(`
`).map(r=>r.trim()).filter(Boolean));return{seeds:[...new Set(t)]}}async getTemplates(){if(k.isEnabled())try{if((await k.checkStatus()).authenticated){const{templates:t}=await k.syncTemplates("pull"),n=oe();for(const r of t)n.find(i=>i.template.name===r.name)||n.push({template:{name:r.name,version:r.version,description:r.description||"",is_official:r.is_official,is_default:r.is_default,assets:r.assets},blueprint_contents:r.blueprint_contents});Re(n)}}catch(e){console.warn("Failed to sync templates from server:",e)}return Et().map(e=>e.template)}async listTemplates(){return this.getTemplates()}async getTemplate(e){const t=Y(e);if(!t)throw new D(404,`Template ${e} not found`);return t.template}async getTemplateBlueprintContents(e){const t=Y(e);if(!t)throw new D(404,`Template ${e} not found`);return{blueprint_contents:t.blueprint_contents}}async createTemplate(e){const t=oe();if(t.some(s=>s.template.name===e.name))throw new D(409,`Template ${e.name} already exists`);const n={name:e.name,version:e.version,description:e.description,assets:e.assets,is_official:!1},r={template:n,blueprint_contents:e.blueprint_contents};return t.push(r),Re(t),O("templates"),n}async updateTemplate(e,t){const n=oe(),r=n.findIndex(s=>s.template.name===e);if(r<0){if(!Y(e))throw new D(404,`Template ${e} not found`);const i=Es(t.name,e);return this.createTemplate({...t,name:i})}if(t.name!==e){const s=Y(t.name);if(s&&s.template.name!==e)throw new D(409,`Template ${t.name} already exists`)}return n[r]={template:{name:t.name,version:t.version,description:t.description,assets:t.assets,is_official:!1},blueprint_contents:t.blueprint_contents},Re(n),O("templates"),n[r].template}async deleteTemplate(e){const t=oe().filter(n=>n.template.name!==e);return Re(t),O("templates"),{status:"deleted",name:e}}async duplicateTemplate(e,t){const n=Y(e);if(!n)throw new D(404,`Template ${e} not found`);return this.createTemplate({name:t.name,version:t.version||n.template.version,description:n.template.description,assets:n.template.assets,blueprint_contents:n.blueprint_contents})}async validateTemplate(e){const t=Y(e);if(!t)throw new D(404,`Template ${e} not found`);const n=Vr(t.template),r=t.template.assets.filter(s=>!t.blueprint_contents[s.blueprint_file||`${s.name}.md`]).map(s=>`Missing blueprint content for ${s.name}`);return{errors:n.errors,warnings:r}}async exportTemplate(e){const t=Ia(e)??Y(e);if(!t)throw new D(404,`Template ${e} not found`);return Se(JSON.stringify(t,null,2),`${rt(e)}.json`,"application/json")}async importTemplate(e){const t=JSON.parse(await e.text());if("template"in t&&t.template){const n=t;return this.createTemplate({name:n.template.name,version:n.template.version,description:n.template.description,assets:n.template.assets,blueprint_contents:n.blueprint_contents})}return this.createTemplate({name:t.name||e.name.replace(/\.[^.]+$/,""),version:t.version||"1.0",description:t.description||"",assets:t.assets||[],blueprint_contents:t.blueprint_contents||{}})}async getDrafts(e){const t=await L.getAllMetadata();this.syncDraftsFromServer();const n=Rs(t,e);return Ds(n,n.length,t)}async listDrafts(e){return this.getDrafts(e)}async getDraft(e){const t=await L.getDraft(e);if(!t)throw new D(404,`Draft ${e} not found`);return t}async updateMetadata(e,t){return await L.updateMetadata(e,t),O("drafts"),{status:"updated",draft_id:e}}async deleteDraft(e){return await L.deleteDraft(e),O("drafts"),{status:"deleted",draft_id:e}}async updateAsset(e,t,n){return await L.updateAsset(e,t,n),O("drafts"),{status:"updated",draft_id:e,asset_name:t}}async validateDraft(e){const t=await this.getDraft(e);return qt(t)}async validatePath(e){const t=e.path.trim().replace(/^drafts\//,""),n=await L.getDraft(t);return n?qt(n):{path:e.path,output:`VALIDATION FAILED
- Browser-only mode can validate saved IndexedDB drafts by review ID only.`,errors:"",exit_code:1,success:!1}}generate(e){return new Q(async({emit:t,signal:n})=>{for await(const r of X.generate(e,{signal:n})){if(n.aborted)return;if(r.type==="chunk"&&t("chunk",{content:r.content||""}),r.type==="complete"){const s=r.asset||"",i=s?await L.getDraft(s):null;t("complete",{draft_path:s,draft_id:s,character_name:i?.metadata.character_name,duration_ms:0})}r.type==="error"&&t("error",{error:r.error||"Generation failed"})}})}generateAsset(e){return new Q(async({emit:t,signal:n})=>{for await(const r of X.generateAsset(e)){if(n.aborted)return;r.type==="chunk"&&t("chunk",{content:r.content||""}),r.type==="asset"&&t("complete",{asset_name:e.asset_name,content:r.content||""}),r.type==="error"&&t("error",{error:r.error||"Asset generation failed"})}})}previewBlueprint(e){return new Q(async({emit:t,signal:n})=>{for await(const r of X.previewBlueprint(e)){if(n.aborted)return;r.type==="chunk"&&t("chunk",{content:r.content||""}),r.type==="asset"&&t("complete",{asset_name:e.asset_name,content:r.content||"",system_prompt:r.systemPrompt||"",user_prompt:r.userPrompt||""}),r.type==="error"&&t("error",{error:r.error||"Blueprint preview failed"})}})}async finalizeGeneration(e){const t=crypto.randomUUID(),n=ze(e.assets,e.template),r={path:t,metadata:{review_id:t,seed:e.seed,mode:e.mode,model:P.getConfig().model,created:new Date().toISOString(),modified:new Date().toISOString(),favorite:!1,template_name:e.template,character_name:n},assets:e.assets};return await L.saveDraft(r),O("drafts"),{draft_path:t,draft_id:t,character_name:n,duration_ms:0}}generateBatch(e,t){return new Q(async({emit:n,signal:r})=>{const s=async(i,c)=>{n("batch_start",{index:c,seed:i});try{let l="";for await(const d of X.generate({seed:i,mode:t.mode,template:t.template},{signal:r})){if(r.aborted)return;d.type==="complete"&&(l=d.asset||"")}n("batch_complete",{index:c,seed:i,draft_path:l})}catch(l){n("batch_error",{index:c,seed:i,error:l instanceof Error?l.message:"Batch generation failed"})}};if(t.parallel){let i=0;const c=Math.min(Math.max(t.max_concurrent??3,1),e.length||1);await Promise.all(Array.from({length:c},async()=>{for(;!r.aborted;){const l=i;if(i+=1,l>=e.length)return;await s(e[l],l)}}))}else for(let i=0;i<e.length;i+=1){if(r.aborted)return;await s(e[i],i)}r.aborted||n("complete",{status:"done"})})}async getLineage(){const e=await L.getAllMetadata();return Fs(e)}async analyzeSimilarity(e){const t=await this.getDraft(e.draft1_id),n=await this.getDraft(e.draft2_id),r=Ms(t,n);if(!e.include_llm_analysis)return r;try{const s=await X.analyzeSimilarity(e.draft1_id,e.draft2_id),i=Array.isArray(s.story_opportunities)?s.story_opportunities.map(d=>String(d)).slice(0,4):r.relationship_suggestions,c=Array.isArray(s.scene_suggestions)?s.scene_suggestions.map(d=>String(d)).slice(0,3):r.relationship_suggestions,l=[s.narrative_dynamics,s.relationship_arc].filter(d=>typeof d=="string"&&d.trim().length>0).join(`

`)||(typeof s.raw=="string"?s.raw:"LLM analysis unavailable.");return{...r,relationship_suggestions:c,llm_analysis:{relationship_potential:l,conflict_areas:r.differences.slice(0,4),synergy_areas:r.commonalities.slice(0,4),story_hooks:i}}}catch{return r}}generateOffspring(e){return new Q(async({emit:t,signal:n})=>{for await(const r of X.generateOffspring(e,{signal:n})){if(n.aborted)return;if(r.type==="status"&&t("status",{stage:r.stage,asset:r.asset,progress:r.progress}),r.type==="chunk"&&t("chunk",{content:r.content||""}),r.type==="complete"){const s=r.asset||"",i=s?await L.getDraft(s):null;t("complete",{draft_id:s,character_name:i?.metadata.character_name})}r.type==="error"&&t("error",{error:r.error||"Offspring generation failed"})}})}generateOffspringSeed(e){return new Q(async({emit:t,signal:n})=>{for await(const r of X.generateOffspringSeed(e,{signal:n})){if(n.aborted)return;r.type==="status"&&t("status",{stage:r.stage,asset:r.asset,progress:r.progress}),r.type==="chunk"&&t("chunk",{content:r.content||""}),r.type==="complete"&&t("complete",{content:r.content||""}),r.type==="error"&&t("error",{error:r.error||"Offspring seed generation failed"})}})}async getExportPresets(){return Cs}async exportDraft(e){const t=await this.getDraft(e.draft_id),n=e.preset||"json",r=e.include_metadata!==!1,s=rt(t.metadata.character_name||t.metadata.seed||t.metadata.review_id);if(n==="text"){const i=Object.entries(t.assets).map(([c,l])=>`## ${c}

${Yt(l)}`).join(`

`);return Se(i,`${s}.txt`,"text/plain")}if(n==="combined"){const i=[`# ${t.metadata.character_name||t.metadata.seed}`,r?`## Metadata

${JSON.stringify(t.metadata,null,2)}`:"",...Object.entries(t.assets).map(([c,l])=>`## ${c}

${Yt(l)}`)].filter(Boolean);return Se(i.join(`

`),`${s}.md`,"text/markdown")}return Se(JSON.stringify({metadata:r?t.metadata:void 0,assets:t.assets},null,2),`${s}.json`,"application/json")}async getBlueprints(){if(k.isEnabled())try{if((await k.checkStatus()).authenticated){const{blueprints:n}=await k.syncBlueprints("list"),r=Z();for(const s of n)s.isBuiltin||r.set(s.path,{name:s.name,description:s.description,invokable:s.invokable,version:s.version,content:s.content,path:s.path,category:s.category})}}catch(t){console.warn("Failed to sync blueprints from server:",t)}const e=[...Z().values()];return{core:e.filter(t=>t.category==="core"),system:e.filter(t=>t.category==="system"),templates:{local:e.filter(t=>t.category==="template")},examples:e.filter(t=>t.category==="example")}}async getBlueprint(e){const t=Z().get(e);if(!t)throw new D(404,`Blueprint ${e} not found`);return t}async updateBlueprint(e,t){if($e(e)!==null&&!kn(e)){const s=Ts(e,t),i=Na(s.name||e,e);return this.createBlueprint(i,t)}const r=ee();return r[e]=t,ve(r),O("blueprints"),this.getBlueprint(e)}async deleteBlueprint(e){if($e(e)!==null)throw new D(400,`Cannot delete built-in blueprint ${e}`);const t=ee();return delete t[e],ve(t),O("blueprints"),{status:"deleted",path:e}}async resetBlueprint(e){const t=ee();delete t[e],ve(t),O("blueprints");const n=this.getBlueprint(e);if(!n)throw new D(404,`Blueprint ${e} not found`);return n}async createBlueprint(e,t){if(Z().get(e))throw new D(409,`Blueprint ${e} already exists`);const r=ee();return r[e]=t,ve(r),O("blueprints"),this.getBlueprint(e)}async duplicateBlueprint(e,t){const n=Z().get(e);if(!n)throw new D(404,`Source blueprint ${e} not found`);if(Z().get(t))throw new D(409,`Blueprint ${t} already exists`);const s=ee();return s[t]=n.content,ve(s),O("blueprints"),this.getBlueprint(t)}hasBlueprintOverride(e){return ja(e)}getOriginalBlueprintContent(e){return $e(e)}chat(e){return new Q(async({emit:t,signal:n})=>{const r=e.draft_id?await L.getDraft(e.draft_id):null,s=[r?`Current draft metadata: ${JSON.stringify(r.metadata)}`:"",e.context_asset&&r?.assets[e.context_asset]?`Focused asset (${e.context_asset}):
${r.assets[e.context_asset]}`:"",e.screen_context?`Screen context: ${JSON.stringify(e.screen_context)}`:""].filter(Boolean),i=[{role:"system",content:"You are the in-app assistant for Eidolon Simulacra, a browser-only blueprint compiler. Be concise and practical. Use provided draft or screen context when relevant."},...s.length>0?[{role:"system",content:s.join(`

`)}]:[],...e.messages],c=await Jt(i);let l="";for await(const d of c){if(n.aborted)return;if(d.content&&(l+=d.content,t("chunk",{content:d.content})),d.done)break}t("complete",{content:l})})}refine(e){return new Q(async({emit:t,signal:n})=>{const r=await this.getDraft(e.draft_id),s=r.assets[e.asset];if(!s)throw new D(404,`Asset ${e.asset} not found in draft`);const i=[{role:"system",content:"Rewrite the provided asset according to the user request. Return only the revised asset content with no extra commentary."},{role:"user",content:`Draft seed: ${r.metadata.seed}
Asset: ${e.asset}

Current content:
${s}

Revision request:
${e.message}`}],c=await Jt(i);let l="";for await(const d of c){if(n.aborted)return;if(d.content&&(l+=d.content,t("chunk",{content:d.content})),d.done)break}t("complete",{content:l})})}}const K=new Us;function z(...a){return wr(xr(a))}const $n=m.createContext(null);function $s({children:a}){const[e,t]=m.useState({ownerId:null,screenContext:{},serializedContext:""}),n=m.useCallback((i,c,l)=>{t(d=>d.ownerId===i&&d.serializedContext===l?d:{ownerId:i,screenContext:c,serializedContext:l})},[]),r=m.useCallback(i=>{t(c=>c.ownerId!==i||c.ownerId===null&&c.serializedContext===""?c:{ownerId:null,screenContext:{},serializedContext:""})},[]),s=m.useMemo(()=>({screenContext:e.screenContext,setScreenContext:n,clearScreenContext:r}),[r,n,e.screenContext]);return o.jsx($n.Provider,{value:s,children:a})}function Bs({entry:a,topics:e,isOpen:t,onClose:n}){return o.jsxs(o.Fragment,{children:[t&&o.jsx("div",{className:"fixed inset-0 z-30 bg-black/40 backdrop-blur-sm",onClick:n}),o.jsxs("aside",{className:`fixed right-0 top-0 z-40 flex h-dvh w-full max-w-xl flex-col border-l border-border bg-card/95 shadow-2xl backdrop-blur-md transition-transform duration-300 ease-out ${t?"translate-x-0":"translate-x-full"}`,"aria-hidden":!t,children:[o.jsxs("div",{className:"flex items-start justify-between gap-4 border-b border-border/60 p-5",children:[o.jsxs("div",{children:[o.jsx("p",{className:"text-xs font-semibold uppercase tracking-[0.16em] text-primary",children:"Contextual Help"}),o.jsx("h2",{className:"mt-2 text-xl font-semibold text-foreground",children:a.title}),o.jsx("p",{className:"mt-2 text-sm leading-6 text-muted-foreground",children:a.summary})]}),o.jsx("button",{type:"button",onClick:n,className:"rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",children:o.jsx(Ye,{className:"h-5 w-5"})})]}),o.jsxs("div",{className:"min-h-0 flex-1 space-y-6 overflow-y-auto p-5",children:[o.jsxs("section",{className:"rounded-2xl border border-border/60 bg-background/40 p-4",children:[o.jsxs("div",{className:"flex items-center gap-2 text-foreground",children:[o.jsx(Ae,{className:"h-4 w-4 text-primary"}),o.jsx("h3",{className:"font-semibold",children:"What to do on this page"})]}),o.jsx("div",{className:"mt-4 space-y-3",children:a.keyActions.map(r=>o.jsxs("div",{className:"flex items-start gap-3 text-sm text-muted-foreground",children:[o.jsx("div",{className:"mt-2 h-1.5 w-1.5 rounded-full bg-primary"}),o.jsx("p",{className:"leading-6",children:r})]},r))})]}),o.jsxs("section",{className:"rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4",children:[o.jsxs("div",{className:"flex items-center gap-2 text-foreground",children:[o.jsx(rn,{className:"h-4 w-4 text-amber-500"}),o.jsx("h3",{className:"font-semibold",children:"Common mistakes to avoid"})]}),o.jsx("div",{className:"mt-4 space-y-3",children:a.pitfalls.map(r=>o.jsxs("div",{className:"flex items-start gap-3 text-sm text-muted-foreground",children:[o.jsx("div",{className:"mt-2 h-1.5 w-1.5 rounded-full bg-amber-500"}),o.jsx("p",{className:"leading-6",children:r})]},r))})]}),o.jsxs("section",{className:"rounded-2xl border border-border/60 bg-background/40 p-4",children:[o.jsx("h3",{className:"font-semibold text-foreground",children:"Useful next steps"}),o.jsxs("div",{className:"mt-4 flex flex-wrap gap-3",children:[o.jsxs(H,{to:"/help",onClick:n,className:"inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:["Open Help Center",o.jsx(Te,{className:"h-4 w-4"})]}),a.actions.map(r=>o.jsxs(H,{to:r.to,onClick:n,className:"inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:[r.label,o.jsx(Te,{className:"h-4 w-4"})]},`${a.id}-${r.to}`))]})]}),e.length>0&&o.jsxs("section",{className:"space-y-4",children:[o.jsx("h3",{className:"text-lg font-semibold text-foreground",children:"Related help topics"}),o.jsx("div",{className:"space-y-3",children:e.map(r=>o.jsxs("article",{className:"rounded-2xl border border-border/60 bg-background/40 p-4",children:[o.jsx("div",{className:"flex items-center justify-between gap-3",children:o.jsxs("div",{children:[o.jsx("p",{className:"text-xs font-semibold uppercase tracking-[0.14em] text-primary",children:r.category}),o.jsx("h4",{className:"mt-1 font-semibold text-foreground",children:r.title})]})}),o.jsx("p",{className:"mt-2 text-sm leading-6 text-muted-foreground",children:r.summary}),o.jsx("div",{className:"mt-3 space-y-2",children:r.bullets.slice(0,2).map(s=>o.jsxs("div",{className:"flex items-start gap-3 text-sm text-muted-foreground",children:[o.jsx("div",{className:"mt-2 h-1.5 w-1.5 rounded-full bg-primary"}),o.jsx("p",{className:"leading-6",children:s})]},s))})]},r.id))})]})]})]})]})}function Bn(){const a=m.useContext($n);if(!a)throw new Error("useAssistantContext must be used within AssistantContextProvider");return a}function ai(a){const{setScreenContext:e,clearScreenContext:t}=Bn(),n=m.useRef(`screen-${Math.random().toString(36).slice(2)}`),r=m.useMemo(()=>JSON.stringify(a),[a]),s=m.useMemo(()=>JSON.parse(r),[r]);m.useEffect(()=>{const i=n.current;return e(i,s,r),()=>{t(i)}},[t,r,e,s])}const Xt={"/":"Home","/generate":"Generate Character","/seed-generator":"Seed Generator","/validation":"Validation","/batch":"Batch","/drafts":"Drafts","/templates":"Templates","/blueprints":"Blueprints","/similarity":"Compare Characters","/offspring":"Offspring Generator","/lineage":"Lineage","/settings":"Settings"};function Hs({pageHelp:a,relatedTopics:e}){const t=ge(),{screenContext:n}=Bn(),[r,s]=m.useState([]),[i,c]=m.useState(""),[l,d]=m.useState(!1),[u,p]=m.useState(""),[h,f]=m.useState(!1),b=t.pathname.startsWith("/drafts/")?decodeURIComponent(t.pathname.replace("/drafts/","").split("/")[0]||""):void 0,x=m.useMemo(()=>{const v=Object.keys(Xt).filter(F=>t.pathname===F||t.pathname.startsWith(`${F}/`)).sort((F,I)=>I.length-F.length)[0]||t.pathname;return{screen_name:v.replace(/^\//,"")||"home",screen_title:Xt[v]||v,route:t.pathname,draft_id:b||"",...n}},[b,n,t.pathname]),M=async()=>{if(!i.trim()||l)return;const v={role:"user",content:i.trim()},F=[...r,v];s(F),c(""),d(!0),p("");try{const I=K.chat({draft_id:b,messages:F,screen_context:x});let G="";I.subscribe(_=>{if(_.event==="chunk"&&"content"in _.data){const R=_.data;G+=R.content,p(G)}_.event==="complete"&&(s(R=>[...R,{role:"assistant",content:G}]),p(""),d(!1))}),I.onError_(_=>{d(!1),s(R=>[...R,{role:"assistant",content:`Error: ${_}`}])}),await I.start()}catch(I){d(!1),s(G=>[...G,{role:"assistant",content:`Error: ${I instanceof Error?I.message:"Unknown error"}`}])}},S=()=>{f(!0),r.length===0&&s([{role:"assistant",content:`You're on ${x.screen_title}. Ask for help with this screen, workflow steps, or content strategy.${b?" I can also use the current draft as context.":""}`}])};return o.jsxs("div",{className:"flex h-full flex-col",children:[o.jsx("div",{className:"flex-1 space-y-4 overflow-y-auto p-3",children:a?o.jsxs(o.Fragment,{children:[o.jsxs("div",{className:"px-1",children:[o.jsx("p",{className:"text-xs font-semibold uppercase tracking-wide text-primary",children:"Contextual Help"}),o.jsx("h3",{className:"mt-1 text-base font-semibold text-foreground",children:a.title}),o.jsx("p",{className:"mt-1 text-xs text-muted-foreground line-clamp-2",children:a.summary})]}),o.jsxs("section",{className:"rounded-lg border border-border/70 bg-background/50 p-3",children:[o.jsxs("div",{className:"flex items-center gap-2 text-foreground",children:[o.jsx(Ae,{className:"h-3.5 w-3.5 text-primary"}),o.jsx("h4",{className:"text-xs font-semibold",children:"What to do"})]}),o.jsx("div",{className:"mt-2 space-y-1.5",children:a.keyActions.slice(0,4).map(v=>o.jsxs("div",{className:"flex items-start gap-2 text-xs text-muted-foreground",children:[o.jsx("div",{className:"mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary"}),o.jsx("p",{className:"leading-5",children:v})]},v))})]}),a.pitfalls.length>0&&o.jsxs("section",{className:"rounded-lg border border-amber-500/30 bg-amber-500/10 p-3",children:[o.jsxs("div",{className:"flex items-center gap-2 text-foreground",children:[o.jsx(rn,{className:"h-3.5 w-3.5 text-amber-500"}),o.jsx("h4",{className:"text-xs font-semibold",children:"Avoid"})]}),o.jsx("div",{className:"mt-2 space-y-1.5",children:a.pitfalls.slice(0,3).map(v=>o.jsxs("div",{className:"flex items-start gap-2 text-xs text-muted-foreground",children:[o.jsx("div",{className:"mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-amber-500"}),o.jsx("p",{className:"leading-5",children:v})]},v))})]}),o.jsxs("section",{className:"rounded-lg border border-border/70 bg-background/50 p-3",children:[o.jsx("h4",{className:"text-xs font-semibold text-foreground mb-2",children:"Quick Links"}),o.jsxs("div",{className:"flex flex-wrap gap-1.5",children:[o.jsxs(H,{to:"/help",className:"inline-flex items-center gap-1.5 rounded border border-border/60 bg-card/70 px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:["Help Center",o.jsx(Te,{className:"h-3 w-3"})]}),a.actions.slice(0,2).map(v=>o.jsxs(H,{to:v.to,className:"inline-flex items-center gap-1.5 rounded border border-border/60 bg-card/70 px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:[v.label,o.jsx(Te,{className:"h-3 w-3"})]},`${a.id}-${v.to}`))]})]}),e.length>0&&o.jsxs("section",{className:"space-y-2",children:[o.jsx("h4",{className:"px-1 text-xs font-semibold text-foreground",children:"Related Topics"}),e.slice(0,2).map(v=>o.jsxs("article",{className:"rounded-lg border border-border/70 bg-background/50 p-2.5",children:[o.jsx("p",{className:"text-[10px] font-semibold uppercase tracking-wide text-primary",children:v.category}),o.jsx("h5",{className:"mt-0.5 text-xs font-semibold text-foreground",children:v.title}),o.jsx("p",{className:"mt-1 text-[11px] text-muted-foreground line-clamp-2",children:v.summary})]},v.id))]})]}):o.jsxs("div",{className:"px-1",children:[o.jsx("p",{className:"text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:"Help"}),o.jsx("p",{className:"mt-2 text-sm text-muted-foreground",children:"No contextual help available for this page."}),o.jsxs(H,{to:"/help",className:"mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline",children:["Open Help Center",o.jsx(Te,{className:"h-3 w-3"})]})]})}),o.jsx("div",{className:"border-t border-border/60",children:h?o.jsxs("div",{className:"flex flex-col",children:[o.jsxs("button",{type:"button",onClick:()=>f(!1),className:"flex items-center justify-between p-2 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors",children:[o.jsxs("div",{className:"flex items-center gap-2",children:[o.jsx(It,{className:"h-3.5 w-3.5"}),o.jsx("span",{className:"text-xs font-medium",children:"AI Assistant"})]}),o.jsx("span",{className:"text-[10px]",children:"Click to collapse"})]}),o.jsxs("div",{className:"max-h-48 space-y-2 overflow-y-auto px-2 pb-2",children:[r.map((v,F)=>o.jsx("div",{className:`text-xs ${v.role==="user"?"text-right":""}`,children:o.jsx("div",{className:`inline-block max-w-[85%] rounded-lg px-2 py-1.5 ${v.role==="user"?"bg-primary text-primary-foreground":"bg-muted"}`,children:v.content})},`${v.role}-${F}`)),u&&o.jsx("div",{className:"text-xs",children:o.jsx("div",{className:"inline-block max-w-[85%] rounded-lg bg-muted px-2 py-1.5",children:u})})]}),o.jsxs("div",{className:"p-2 pt-0",children:[o.jsxs("div",{className:"flex gap-1.5",children:[o.jsx("input",{type:"text",value:i,onChange:v=>c(v.target.value),onKeyDown:v=>{v.key==="Enter"&&!v.shiftKey&&(v.preventDefault(),M())},placeholder:"Ask for help...",className:"flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",disabled:l}),o.jsx("button",{onClick:()=>void M(),disabled:!i.trim()||l,className:"inline-flex items-center justify-center rounded-md bg-primary px-2 py-1.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50",children:l?o.jsx(an,{className:"h-3 w-3 animate-spin"}):o.jsx(Wn,{className:"h-3 w-3"})})]}),b&&o.jsx("p",{className:"mt-1 text-[10px] text-muted-foreground",children:"Using draft context"})]})]}):o.jsxs("button",{type:"button",onClick:S,className:"flex w-full items-center gap-2 p-3 text-left text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors",children:[o.jsx(It,{className:"h-4 w-4"}),o.jsxs("div",{className:"flex-1 min-w-0",children:[o.jsx("div",{className:"text-xs font-medium",children:"Ask AI Assistant"}),o.jsx("div",{className:"text-[10px] truncate",children:x.screen_title})]})]})})]})}const jt="eidolon.web.activeTour";function Gs(){try{const a=sessionStorage.getItem(jt);if(!a)return null;const e=JSON.parse(a),t=He(e.activeTourId);return!t||e.activeStepIndex<0||e.activeStepIndex>=t.steps.length?null:e}catch{return null}}function Qt(){try{sessionStorage.removeItem(jt)}catch{}}const Hn=m.createContext(null);function Ws({children:a}){const e=vr(),t=ge(),n=Gs(),[r,s]=m.useState(n?.activeTourId??null),[i,c]=m.useState(n?.activeStepIndex??0),[l,d]=m.useState(()=>P.getHelpState()),u=()=>{d(P.getHelpState())};m.useEffect(()=>{if(!r){Qt();return}try{sessionStorage.setItem(jt,JSON.stringify({activeTourId:r,activeStepIndex:i}))}catch{}},[i,r]),m.useEffect(()=>{const _=()=>{u()};return window.addEventListener(We,_),()=>{window.removeEventListener(We,_)}},[]);const p=async _=>{if(_.to!=="/drafts/"||(_.matchMode??"exact")!=="prefix")return _.to;if(t.pathname.startsWith("/drafts/"))return t.pathname;try{const $=(await K.getDrafts()).drafts[0]?.review_id;return $?`/drafts/${encodeURIComponent($)}`:"/drafts"}catch{return"/drafts"}},h=async(_,R)=>{const $=He(_),g=$?.steps[R];!$||!g||(s(_),c(R),ct(t.pathname,g)||e(await p(g)))},f=_=>{h(_,0)},b=_=>{const $={completed_tours:l.completed_tours.filter(g=>g!==_)};_===it&&($.first_run_completed=!1,$.completed_guides=l.completed_guides.filter(g=>g!==Mt)),P.updateHelpState($),O("config"),u(),h(_,0)},x=()=>{Qt(),s(null),c(0)},M=()=>{r&&h(r,i)},S=()=>{!r||i===0||h(r,i-1)},v=()=>{if(!r)return;const R={completed_tours:Array.from(new Set([...l.completed_tours,r]))};r===it&&(R.first_run_completed=!0,R.completed_guides=Array.from(new Set([...l.completed_guides,Mt]))),P.updateHelpState(R),O("config"),u(),x()},F=()=>{if(!r)return;const _=He(r);if(!_){x();return}if(i>=_.steps.length-1){v();return}h(r,i+1)},I=_=>{const R=Array.from(new Set([...l.dismissed_tips,_]));P.updateHelpState({dismissed_tips:R}),O("config"),u()},G=m.useMemo(()=>({tours:ln,activeTourId:r,activeStepIndex:i,helpState:l,startTour:f,restartTour:b,closeTour:x,goToCurrentStep:M,goToNextStep:F,goToPreviousStep:S,finishTour:v,isTourCompleted:_=>l.completed_tours.includes(_),dismissTip:I}),[i,r,l]);return o.jsx(Hn.Provider,{value:G,children:a})}function Ks(){const a=m.useContext(Hn);if(!a)throw new Error("useGuidedTour must be used within GuidedTourProvider");return a}const zs='[data-guided-tour-active="true"]';function qs(){const a=ge(),{activeTourId:e,activeStepIndex:t,closeTour:n,goToCurrentStep:r,goToNextStep:s,goToPreviousStep:i}=Ks(),[c,l]=m.useState(!1),d=e?He(e):null,u=d?.steps[t]??null;if(m.useEffect(()=>{if(document.querySelector(zs)?.removeAttribute("data-guided-tour-active"),!u){l(!1);return}if(!ct(a.pathname,u)||!u.targetId){l(!1);return}const x=document.querySelector(`[data-tour-anchor="${u.targetId}"]`);if(!x){l(!1);return}return x.setAttribute("data-guided-tour-active","true"),x.scrollIntoView({behavior:"smooth",block:"center",inline:"nearest"}),l(!0),()=>{x.removeAttribute("data-guided-tour-active")}},[u,a.pathname]),!d||!u)return null;const p=ct(a.pathname,u),h=t===d.steps.length-1;return o.jsxs(o.Fragment,{children:[o.jsx("div",{className:"fixed inset-0 z-[70] bg-black/55",onClick:n}),o.jsxs("section",{className:"fixed inset-x-3 bottom-3 z-[80] max-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-2xl shadow-black/40 backdrop-blur-md sm:inset-x-auto sm:right-4 sm:w-[28rem]",children:[o.jsxs("div",{className:"flex items-start justify-between gap-4 border-b border-border/50 px-5 py-4",children:[o.jsxs("div",{children:[o.jsx("p",{className:"text-xs font-semibold uppercase tracking-[0.16em] text-primary",children:"Guided Tour"}),o.jsx("h2",{className:"mt-1 text-lg font-semibold text-foreground",children:d.title}),o.jsxs("p",{className:"mt-1 text-sm text-muted-foreground",children:["Step ",t+1," of ",d.steps.length]})]}),o.jsx("button",{type:"button",onClick:n,className:"rounded-lg border border-border/60 bg-background/50 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary","aria-label":"Close guided tour",children:o.jsx(Ye,{className:"h-4 w-4"})})]}),o.jsxs("div",{className:"max-h-[calc(100dvh-12rem)] overflow-y-auto px-5 py-4",children:[o.jsxs("div",{className:"rounded-2xl border border-primary/20 bg-primary/5 p-4",children:[o.jsxs("div",{className:"flex items-center gap-2 text-sm font-medium text-primary",children:[o.jsx(Kn,{className:"h-4 w-4"}),u.routeLabel]}),o.jsx("h3",{className:"mt-2 text-xl font-semibold text-foreground",children:u.title}),o.jsx("p",{className:"mt-2 text-sm leading-6 text-muted-foreground",children:u.description})]}),o.jsxs("div",{className:"mt-4 rounded-2xl border border-border/50 bg-background/40 p-4",children:[o.jsxs("div",{className:"flex items-center gap-2 text-sm font-medium text-foreground",children:[o.jsx(zn,{className:"h-4 w-4 text-primary"}),p?"You are on the expected page.":`This step expects ${u.routeLabel}.`]}),!p&&o.jsxs("button",{type:"button",onClick:r,className:"mt-3 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:["Return to this step",o.jsx(Ce,{className:"h-4 w-4"})]})]}),u.targetLabel&&p&&o.jsxs("div",{className:"mt-4 rounded-2xl border border-border/50 bg-background/40 p-4",children:[o.jsxs("div",{className:"flex items-center gap-2 text-sm font-medium text-foreground",children:[o.jsx(qn,{className:"h-4 w-4 text-primary"}),c?`Highlighted target: ${u.targetLabel}`:`Looking for ${u.targetLabel}`]}),o.jsx("p",{className:"mt-2 text-sm leading-6 text-muted-foreground",children:c?"The active control or section has been outlined on the page so you can orient yourself without hunting for it.":"If the highlighted target is not visible yet, stay on this page and give the layout a moment to settle."})]}),o.jsx("div",{className:"mt-4 space-y-3",children:u.bullets.map(f=>o.jsxs("div",{className:"flex items-start gap-3 rounded-xl border border-border/50 bg-background/40 p-4 text-sm text-muted-foreground",children:[o.jsx(Vn,{className:"mt-0.5 h-4 w-4 shrink-0 text-primary"}),o.jsx("p",{className:"leading-6",children:f})]},f))})]}),o.jsxs("div",{className:"flex items-center justify-between gap-3 border-t border-border/50 px-5 py-4",children:[o.jsxs("button",{type:"button",onClick:i,disabled:t===0,className:"inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50",children:[o.jsx(Yn,{className:"h-4 w-4"}),"Previous"]}),o.jsxs("div",{className:"flex items-center gap-3",children:[o.jsx("button",{type:"button",onClick:n,className:"inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:"Leave tour"}),o.jsxs("button",{type:"button",onClick:s,className:"inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",children:[h?"Finish tour":"Next step",o.jsx(Ce,{className:"h-4 w-4"})]})]})]})]})]})}function Vs({drafts:a,isLoading:e}){const n=ge().pathname.match(/^\/drafts\/([^/]+)$/),r=n?decodeURIComponent(n[1]):null,[s,i]=m.useState(""),[c,l]=m.useState(!1),[d,u]=m.useState(!1),[p,h]=m.useState(""),[f,b]=m.useState(""),[x,M]=m.useState("modified"),[S,v]=m.useState("desc"),{genres:F,modes:I}=m.useMemo(()=>{const g=new Set,A=new Set;return a.forEach(C=>{C.genre&&g.add(C.genre),C.mode&&A.add(C.mode)}),{genres:Array.from(g).sort(),modes:Array.from(A).sort()}},[a]),G=m.useMemo(()=>{let g=[...a];if(s){const A=s.toLowerCase();g=g.filter(C=>C.character_name?.toLowerCase().includes(A)||C.seed.toLowerCase().includes(A)||C.template_name?.toLowerCase().includes(A)||C.notes?.toLowerCase().includes(A))}return d&&(g=g.filter(A=>A.favorite)),p&&(g=g.filter(A=>A.mode===p)),f&&(g=g.filter(A=>A.genre===f)),g.sort((A,C)=>{let te=0;switch(x){case"created":{const ne=A.created?new Date(A.created).getTime():0,ie=C.created?new Date(C.created).getTime():0;te=ne-ie;break}case"modified":{const ne=A.modified?new Date(A.modified).getTime():A.created?new Date(A.created).getTime():0,ie=C.modified?new Date(C.modified).getTime():C.created?new Date(C.created).getTime():0;te=ne-ie;break}case"name":{const ne=A.character_name||A.seed,ie=C.character_name||C.seed;te=ne.localeCompare(ie);break}}return S==="asc"?te:-te}),g},[a,s,d,p,f,x,S]),_=s||d||p||f,R=()=>{i(""),u(!1),h(""),b("")},$=m.useMemo(()=>{const g=a.length,A=a.filter(C=>C.favorite).length;return{total:g,favorites:A}},[a]);return o.jsxs("div",{className:"flex h-full flex-col",children:[o.jsxs("div",{className:"border-b border-border/60 px-3 py-3",children:[o.jsx("h3",{className:"text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:"Draft Library"}),o.jsxs("div",{className:"mt-2 flex items-center gap-3 text-xs text-muted-foreground",children:[o.jsxs("span",{children:[$.total," drafts"]}),o.jsxs("span",{className:"flex items-center gap-1",children:[o.jsx(Jn,{className:"h-3 w-3"}),$.favorites]})]})]}),o.jsx("div",{className:"border-b border-border/40 px-3 py-2",children:o.jsxs("div",{className:"relative",children:[o.jsx(Xn,{className:"absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"}),o.jsx("input",{type:"text",placeholder:"Search drafts...",value:s,onChange:g=>i(g.target.value),className:"w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-8 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"}),s&&o.jsx("button",{type:"button",onClick:()=>i(""),className:"absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",children:o.jsx(Ye,{className:"h-3.5 w-3.5"})})]})}),o.jsxs("div",{className:"flex items-center justify-between border-b border-border/40 px-3 py-2",children:[o.jsxs("button",{type:"button",onClick:()=>l(!c),className:z("flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",c||_?"bg-primary/10 text-primary":"text-muted-foreground hover:text-foreground hover:bg-accent/50"),children:[o.jsx(Qn,{className:"h-3.5 w-3.5"}),"Filters",_&&o.jsx("span",{className:"rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground",children:[s&&"search",d&&"fav",p&&"mode",f&&"genre"].filter(Boolean).length})]}),o.jsxs("div",{className:"flex items-center gap-1",children:[o.jsxs("select",{value:x,onChange:g=>M(g.target.value),className:"rounded-md border border-input bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none",children:[o.jsx("option",{value:"modified",children:"Modified"}),o.jsx("option",{value:"created",children:"Created"}),o.jsx("option",{value:"name",children:"Name"})]}),o.jsx("button",{type:"button",onClick:()=>v(S==="asc"?"desc":"asc"),className:"rounded-md border border-input p-1 hover:bg-accent/50",title:S==="asc"?"Ascending":"Descending",children:S==="asc"?o.jsx(Zn,{className:"h-3.5 w-3.5 text-muted-foreground"}):o.jsx(er,{className:"h-3.5 w-3.5 text-muted-foreground"})})]})]}),c&&o.jsxs("div",{className:"border-b border-border/40 bg-muted/30 px-3 py-2 space-y-2",children:[o.jsxs("label",{className:"flex items-center gap-2 text-xs",children:[o.jsx("input",{type:"checkbox",checked:d,onChange:g=>u(g.target.checked),className:"rounded border-input"}),o.jsx(Ot,{className:"h-3.5 w-3.5 text-yellow-500"}),"Favorites only"]}),I.length>0&&o.jsxs("div",{className:"space-y-1",children:[o.jsx("label",{className:"text-xs text-muted-foreground",children:"Mode"}),o.jsxs("select",{value:p,onChange:g=>h(g.target.value),className:"w-full rounded-md border border-input bg-background px-2 py-1 text-xs",children:[o.jsx("option",{value:"",children:"All modes"}),I.map(g=>o.jsx("option",{value:g,children:g},g))]})]}),F.length>0&&o.jsxs("div",{className:"space-y-1",children:[o.jsx("label",{className:"text-xs text-muted-foreground",children:"Genre"}),o.jsxs("select",{value:f,onChange:g=>b(g.target.value),className:"w-full rounded-md border border-input bg-background px-2 py-1 text-xs",children:[o.jsx("option",{value:"",children:"All genres"}),F.map(g=>o.jsx("option",{value:g,children:g},g))]})]}),_&&o.jsx("button",{type:"button",onClick:R,className:"w-full rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground",children:"Clear all filters"})]}),o.jsx("div",{className:"flex-1 overflow-y-auto",children:e?o.jsx("div",{className:"p-4 text-center text-xs text-muted-foreground",children:"Loading drafts..."}):G.length===0?o.jsxs("div",{className:"p-4 text-center",children:[o.jsx(bt,{className:"mx-auto h-8 w-8 text-muted-foreground/50"}),o.jsx("p",{className:"mt-2 text-xs text-muted-foreground",children:_?"No drafts match filters":"No drafts yet"}),_&&o.jsx("button",{type:"button",onClick:R,className:"mt-2 text-xs text-primary hover:underline",children:"Clear filters"})]}):o.jsx("div",{className:"space-y-1 p-2",children:G.map(g=>{const A=r===g.review_id;return o.jsx(H,{to:`/drafts/${encodeURIComponent(g.review_id)}`,className:z("group block rounded-lg border p-2 transition-all",A?"border-primary bg-primary/10":"border-transparent hover:border-border/60 hover:bg-accent/40"),children:o.jsxs("div",{className:"flex items-start justify-between gap-2",children:[o.jsxs("div",{className:"min-w-0 flex-1",children:[o.jsxs("div",{className:"flex items-center gap-1.5",children:[o.jsx("span",{className:"truncate text-sm font-medium",children:g.character_name||g.seed}),g.favorite&&o.jsx(Ot,{className:"h-3 w-3 shrink-0 fill-yellow-500 text-yellow-500"})]}),o.jsxs("div",{className:"mt-0.5 flex items-center gap-2 text-xs text-muted-foreground",children:[g.mode&&o.jsxs("span",{className:"inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5",children:[o.jsx(yt,{className:"h-2.5 w-2.5"}),g.mode]}),g.template_name&&o.jsx("span",{className:"truncate",children:g.template_name})]}),(g.created||g.modified)&&o.jsxs("div",{className:"mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/70",children:[o.jsx(tr,{className:"h-2.5 w-2.5"}),new Date(g.modified||g.created||"").toLocaleDateString()]})]}),g.tags&&g.tags.length>0&&o.jsxs("div",{className:"flex shrink-0 flex-wrap gap-0.5",children:[g.tags.slice(0,2).map(C=>o.jsx("span",{className:"rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground",children:C},C)),g.tags.length>2&&o.jsxs("span",{className:"text-[9px] text-muted-foreground",children:["+",g.tags.length-2]})]})]})},g.review_id)})})})]})}const Ys=[{path:"/",label:"Home",icon:sr},{path:"/generate",label:"Generate",icon:st},{path:"/seed-generator",label:"Seed Generator",icon:or},{path:"/batch",label:"Batch",icon:yt},{path:"/validation",label:"Validation",icon:ot},{path:"/similarity",label:"Compare",icon:ir},{path:"/drafts",label:"Drafts",icon:cr},{path:"/templates",label:"Templates",icon:bt},{path:"/blueprints",label:"Blueprints",icon:Ae},{path:"/themes",label:"Theme Studio",icon:lr},{path:"/settings",label:"Settings",icon:dr}],Zt=[{path:"/lineage",label:"Lineage",icon:sn},{path:"/offspring",label:"Offspring",icon:nr}],en=[{path:"/worlds",label:"Worlds",icon:on},{path:"/timelines",label:"Timeline",icon:sn},{path:"/events",label:"Events",icon:rr}],Js=[{path:"/about",label:"About",icon:Dt},{path:"/help",label:"Help",icon:Ae},{path:"/whats-new",label:"What's New",icon:Dt},{path:"/terms",label:"Terms",icon:hr},{path:"/privacy",label:"Privacy",icon:ot},{path:"/license",label:"License",icon:bt},{path:"/security",label:"Security",icon:ot},{path:"/code-of-conduct",label:"Conduct",icon:Ae}],Xs=[{href:"mailto:contact@eidolonsimulacra.com?subject=Bug%20Report%20or%20Security%20Issue",label:"Contact",icon:mr}];function Qs({path:a,label:e,icon:t,isActive:n,onClick:r}){return o.jsxs(H,{to:a,onClick:r,className:z("group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",n?"bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20":"text-muted-foreground hover:bg-accent/50 hover:text-foreground"),children:[o.jsx(t,{className:z("h-5 w-5 transition-transform duration-200",n?"scale-110":"group-hover:scale-110")}),o.jsx("span",{children:e}),n&&o.jsx("div",{className:"absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 -z-10"})]})}function tn({label:a,icon:e,items:t,isActive:n,isExpanded:r,onToggle:s,onNavigate:i,draftsCount:c,seedsCount:l}){const d=ge(),u=r?gr:Ce;return o.jsxs("div",{className:"space-y-1",children:[o.jsxs("button",{type:"button",onClick:s,className:z("group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",n?"bg-accent/50 text-foreground":"text-muted-foreground hover:bg-accent/50 hover:text-foreground"),children:[o.jsxs("div",{className:"flex items-center gap-3",children:[o.jsx(e,{className:"h-5 w-5 transition-transform duration-200 group-hover:scale-110"}),o.jsx("span",{children:a}),(c>0||l>0)&&o.jsxs("div",{className:"flex items-center gap-1.5",children:[c>0&&o.jsxs("span",{className:"rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary",children:[c," drafts"]}),l>0&&o.jsxs("span",{className:"rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400",children:[l," seeds"]})]})]}),o.jsx(u,{className:"h-4 w-4 transition-transform duration-200"})]}),r&&o.jsx("div",{className:"ml-4 space-y-1 border-l border-border pl-2",children:t.map(p=>{const h=d.pathname===p.path;return o.jsxs(H,{to:p.path,onClick:i,className:z("group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",h?"bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/20":"text-muted-foreground hover:bg-accent/50 hover:text-foreground"),children:[o.jsx(p.icon,{className:"h-4 w-4"}),o.jsx("span",{children:p.label})]},p.path)})})]})}function Zs({children:a}){const e=ge(),t=cn(),n=e.pathname.match(/^\/drafts\/([^/]+)$/),r=n?decodeURIComponent(n[1]):null,[s,i]=m.useState(!1),[c,l]=m.useState(!1),[d,u]=m.useState(null),[p,h]=m.useState(!1),[f,b]=m.useState(!1),[x,M]=m.useState("help"),S=m.useMemo(()=>Dr(e.pathname),[e.pathname]),v=m.useMemo(()=>Pr.filter(y=>S?.relatedTopicIds.includes(y.id)),[S]),F=se({queryKey:["drafts"],queryFn:()=>K.getDrafts()}),{data:I}=F,{data:G}=se({queryKey:["draft",r],queryFn:()=>K.getDraft(r||""),enabled:!!r}),{data:_}=se({queryKey:["templates"],queryFn:()=>K.getTemplates(),enabled:e.pathname.startsWith("/templates")}),{data:R}=se({queryKey:["themes"],queryFn:()=>K.getThemes(),enabled:e.pathname.startsWith("/themes")}),{data:$}=se({queryKey:["blueprints"],queryFn:()=>K.getBlueprints(),enabled:e.pathname.startsWith("/blueprints")}),[g,A]=m.useState(()=>fe().length),C=I?.drafts?.length??0;m.useEffect(()=>{const y=()=>{t.invalidateQueries({queryKey:["drafts"]})};return window.addEventListener(gt,y),()=>{window.removeEventListener(gt,y)}},[t]);const te=m.useMemo(()=>{if(e.pathname.startsWith("/drafts")){const T=[{id:"drafts",title:"Draft Filing Tray",emptyLabel:"No drafts available yet.",items:(I?.drafts||[]).slice(0,16).map(U=>({id:U.review_id,label:U.character_name||U.seed,description:`${U.template_name||"Default"} • ${U.mode}`,to:`/drafts/${encodeURIComponent(U.review_id)}`,badge:r&&r===U.review_id?"Open":U.favorite?"Fav":void 0}))}];if(r){const U=Object.keys(G?.assets||{}).map(Pt=>({id:Pt,label:Pt.replace(/_/g," "),description:"Asset in current draft"}));T.push({id:"review-assets",title:"Current Draft Assets",emptyLabel:"No assets loaded for this draft.",items:U})}return T}return e.pathname.startsWith("/templates")?[{id:"templates",title:"Template Tray",emptyLabel:"No templates available.",items:(_||[]).slice(0,16).map(T=>({id:T.name,label:T.name,description:T.description||"Template definition",badge:T.is_default?"Default":void 0}))}]:e.pathname.startsWith("/themes")?[{id:"themes",title:"Theme Tray",emptyLabel:"No theme presets available.",items:(R||[]).slice(0,16).map(T=>({id:T.name,label:T.display_name,description:T.description||T.name,badge:T.is_builtin?"Built-in":"Custom"}))}]:e.pathname.startsWith("/blueprints")?[{id:"blueprints",title:"Blueprint Tray",emptyLabel:"No blueprints found.",items:[...$?.core||[],...$?.system||[],...$?.templates?.local||[],...$?.examples||[]].slice(0,18).map(U=>({id:U.path,label:U.name,description:U.path}))}]:e.pathname.startsWith("/generate")?[{id:"generate",title:"Generate Tray",emptyLabel:"No generation actions available.",items:[{id:"gen-drafts",label:"Recent drafts",description:`${C} available`,to:"/drafts"},{id:"gen-seeds",label:"Favorite seeds",description:`${g} saved`,to:"/seed-generator"},{id:"gen-templates",label:"Template manager",description:"Switch template packs",to:"/templates"}]}]:[{id:"general",title:"Page Tray",emptyLabel:"No page-specific items available.",items:[{id:"nav-home",label:"Home",to:"/"},{id:"nav-drafts",label:"Drafts",description:`${C} saved`,to:"/drafts"},{id:"nav-settings",label:"Settings",to:"/settings"}]}]},[e.pathname,I?.drafts,C,r,G?.assets,_,R,$,g]),ne=m.useMemo(()=>Rr.filter(y=>y.status!=="implemented").flatMap(y=>y.items.slice(0,3).map((T,U)=>({id:`${y.id}-${U}`,title:T.length>60?T.slice(0,60)+"...":T,category:y.title,status:y.status}))).slice(0,12),[]),Xe=Zt.map(y=>y.path).includes(e.pathname),Qe=en.map(y=>y.path).includes(e.pathname);m.useEffect(()=>{Xe&&!p&&h(!0)},[Xe,p]),m.useEffect(()=>{Qe&&!f&&b(!0)},[Qe,f]);const Pe=m.useCallback(async()=>{if(k.isEnabled()){if(!k.hasAccessToken()){u({connected:!0,authenticated:!1});return}try{const y=await k.checkStatus();u(y),y.authenticated&&y.connected&&bs()}catch{u({connected:!1,authenticated:!1})}}else u({connected:!1,authenticated:!1})},[]);return m.useEffect(()=>{Pe()},[Pe]),m.useEffect(()=>{const y=()=>{Pe()};return window.addEventListener(pt,y),()=>window.removeEventListener(pt,y)},[Pe]),m.useEffect(()=>{const y=()=>{O("config")};return window.addEventListener(We,y),()=>window.removeEventListener(We,y)},[]),m.useEffect(()=>{const y=()=>{A(fe().length)};return window.addEventListener(ht,y),window.addEventListener("storage",y),()=>{window.removeEventListener(ht,y),window.removeEventListener("storage",y)}},[]),m.useEffect(()=>{l(!1)},[e.pathname]),o.jsx($s,{children:o.jsx(Ws,{children:o.jsxs("div",{className:"app-shell flex min-h-dvh bg-background lg:h-screen",children:[s&&o.jsx("div",{className:"fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden",onClick:()=>i(!1)}),o.jsx("aside",{className:z("fixed inset-y-0 left-0 z-50 w-[min(20rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] bg-card/80 backdrop-blur-md border-r border-border transition-transform duration-300 ease-out lg:static lg:w-72 lg:max-w-none lg:translate-x-0","app-sidebar",s?"translate-x-0":"-translate-x-full"),children:o.jsxs("div",{className:"flex h-dvh flex-col lg:h-full",children:[o.jsxs("div",{className:"flex h-16 items-center justify-between border-b border-border/50 px-4",children:[o.jsxs(H,{to:"/",className:"flex items-center gap-2",onClick:()=>i(!1),children:[o.jsx("div",{className:"p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20",children:o.jsx(st,{className:"h-5 w-5 text-white"})}),o.jsxs("div",{className:"flex flex-col",children:[o.jsx("span",{className:"text-lg font-semibold tracking-tight text-foreground",style:{fontFamily:'"Space Grotesk", sans-serif'},children:"Eidolon"}),o.jsxs("span",{className:"text-[11px] uppercase tracking-[0.18em] text-muted-foreground",style:{fontFamily:'"IBM Plex Mono", monospace'},children:["Simulacra v","3.0.17"]})]})]}),o.jsx("button",{className:"lg:hidden p-2 rounded-lg hover:bg-accent transition-colors",onClick:()=>i(!1),children:o.jsx(Ye,{className:"h-5 w-5"})})]}),o.jsxs("nav",{className:"flex-1 overflow-y-auto p-4 space-y-1",children:[o.jsx(tn,{label:"Characters",icon:ar,items:Zt,isActive:Xe,isExpanded:p,onToggle:()=>h(!p),onNavigate:()=>i(!1),draftsCount:C,seedsCount:g}),o.jsx(tn,{label:"Worlds",icon:on,items:en,isActive:Qe,isExpanded:f,onToggle:()=>b(!f),onNavigate:()=>i(!1),draftsCount:0,seedsCount:0}),Ys.map(y=>{const T=e.pathname===y.path;return o.jsx(Qs,{path:y.path,label:y.label,icon:y.icon,isActive:T,onClick:()=>i(!1)},y.path)})]}),d&&!d.authenticated&&k.isEnabled()&&o.jsx("div",{className:"px-4 py-3 border-t border-border/50",children:o.jsxs(H,{to:"/auth",onClick:()=>i(!1),className:"flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 px-4 py-3 text-sm font-medium text-foreground transition-all hover:from-primary/20 hover:to-accent/20 hover:border-primary/40",children:[o.jsx(ur,{className:"h-5 w-5 text-primary"}),o.jsxs("div",{className:"flex flex-col",children:[o.jsx("span",{className:"font-semibold",children:"Sign In"}),o.jsx("span",{className:"text-xs text-muted-foreground",children:"Sync your data"})]})]})}),d?.authenticated&&d.user&&o.jsx("div",{className:"px-4 py-3 border-t border-border/50",children:o.jsxs("div",{className:"flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3",children:[o.jsx("div",{className:"flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20",children:o.jsx(pr,{className:"h-4 w-4 text-green-600 dark:text-green-400"})}),o.jsxs("div",{className:"flex flex-col min-w-0",children:[o.jsx("span",{className:"text-sm font-medium truncate",children:d.user.displayName}),o.jsx("span",{className:"text-xs text-muted-foreground truncate",children:d.user.email})]})]})}),o.jsxs("div",{className:"border-t border-border/50 px-4 py-4",children:[o.jsxs("div",{className:"mb-3",children:[o.jsx("p",{className:"text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground",children:"Support"}),o.jsx("p",{className:"mt-1 text-xs text-muted-foreground",children:"Back Eidolon Simulacra on Ko-fi."})]}),o.jsx("div",{className:"rounded-xl border border-border/60 bg-background/80 p-3 shadow-sm",children:o.jsx("a",{href:"https://ko-fi.com/maeveoffae",target:"_blank",rel:"noreferrer",className:"flex w-full items-center justify-center rounded-lg bg-[#72a4f2] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90",children:"Support me on Ko-fi"})})]}),o.jsxs("div",{className:"border-t border-border/50 p-4",children:[o.jsxs("div",{className:"flex items-center justify-between",children:[o.jsx("p",{className:"text-xs text-muted-foreground",children:"Web • No backend required"}),o.jsx(H,{to:"/settings",className:"text-xs text-muted-foreground hover:text-primary transition-colors",children:"Settings"})]}),o.jsxs("div",{className:"mt-3 flex flex-wrap gap-x-3 gap-y-2 text-xs text-muted-foreground",children:[Js.map(y=>o.jsx(H,{to:y.path,className:"hover:text-primary transition-colors",onClick:()=>i(!1),children:y.label},y.path)),Xs.map(y=>o.jsx("a",{href:y.href,className:"hover:text-primary transition-colors",children:y.label},y.href))]})]})]})}),o.jsxs("main",{className:"min-w-0 flex-1 overflow-auto",children:[o.jsxs("header",{className:"app-frame-panel sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/50 px-4 lg:hidden",children:[o.jsx("button",{onClick:()=>i(!0),className:"p-2 rounded-lg hover:bg-accent transition-colors",children:o.jsx(fr,{className:"h-6 w-6"})}),o.jsx("span",{className:"min-w-0 truncate text-base font-semibold tracking-tight text-foreground sm:text-lg",style:{fontFamily:'"Space Grotesk", sans-serif'},children:"Eidolon Simulacra"}),S&&o.jsxs("button",{type:"button",onClick:()=>l(!0),className:"ml-auto inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:[o.jsx(Rt,{className:"h-4 w-4"}),"Help"]})]}),o.jsx("div",{className:"mx-auto max-w-[1600px] p-6 lg:p-8",children:a})]}),S&&o.jsx(Bs,{entry:S,topics:v,isOpen:c,onClose:()=>l(!1)}),o.jsxs("aside",{className:"app-sidebar hidden w-80 flex-col border-l border-border/60 xl:flex",children:[o.jsx("div",{className:"sticky top-0 z-10 border-b border-border/60 bg-card/80 backdrop-blur",children:o.jsxs("div",{className:"flex border-b border-border/40",children:[o.jsxs("button",{type:"button",onClick:()=>M("help"),className:z("flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors",x==="help"?"border-b-2 border-primary text-primary":"text-muted-foreground hover:text-foreground"),children:[o.jsx(Rt,{className:"h-3.5 w-3.5"}),"Help"]}),o.jsxs("button",{type:"button",onClick:()=>M("dynamic"),className:z("flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors",x==="dynamic"?"border-b-2 border-primary text-primary":"text-muted-foreground hover:text-foreground"),children:[o.jsx(yt,{className:"h-3.5 w-3.5"}),"Dynamic"]}),o.jsxs("button",{type:"button",onClick:()=>M("whats-new"),className:z("flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors",x==="whats-new"?"border-b-2 border-primary text-primary":"text-muted-foreground hover:text-foreground"),children:[o.jsx(st,{className:"h-3.5 w-3.5"}),"New"]})]})}),o.jsx("div",{className:"flex-1 overflow-hidden",children:x==="help"?o.jsx(Hs,{pageHelp:S,relatedTopics:v}):x==="dynamic"?e.pathname.startsWith("/drafts")?o.jsx(Vs,{drafts:I?.drafts||[],isLoading:F.isLoading}):o.jsxs("div",{className:"space-y-3",children:[o.jsxs("div",{className:"px-1",children:[o.jsx("h3",{className:"text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:"Upcoming Features"}),o.jsx("p",{className:"mt-1 text-xs text-muted-foreground",children:"Planned improvements and new capabilities."})]}),ne.map(y=>o.jsxs("div",{className:"rounded-lg border border-border/70 bg-background/50 p-3",children:[o.jsx("div",{className:"flex items-start justify-between gap-2",children:o.jsx("span",{className:z("rounded-full px-2 py-0.5 text-[10px] font-semibold",y.status==="planned"?"bg-blue-500/15 text-blue-600 dark:text-blue-400":"bg-amber-500/15 text-amber-600 dark:text-amber-400"),children:y.status==="planned"?"Planned":"In Progress"})}),o.jsx("p",{className:"mt-2 text-sm text-foreground leading-snug",children:y.title}),o.jsx("p",{className:"mt-1.5 text-xs text-muted-foreground",children:y.category})]},y.id)),o.jsxs(H,{to:"/whats-new",className:"flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary",children:["View Full Roadmap",o.jsx(Ce,{className:"h-4 w-4"})]})]}):o.jsx("div",{className:"space-y-4",children:te.map(y=>o.jsxs("section",{className:"space-y-2",children:[o.jsx("h3",{className:"px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:y.title}),y.items.length===0?o.jsx("div",{className:"rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground",children:y.emptyLabel}):o.jsx("div",{className:"space-y-2",children:y.items.map(T=>{const U=o.jsxs(o.Fragment,{children:[o.jsxs("div",{className:"min-w-0 flex-1",children:[o.jsx("div",{className:"truncate text-sm font-medium",children:T.label}),T.description&&o.jsx("div",{className:"truncate text-xs text-muted-foreground",children:T.description})]}),T.badge&&o.jsx("span",{className:"rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground",children:T.badge}),T.to&&o.jsx(Ce,{className:"h-3.5 w-3.5 text-muted-foreground"})]});return T.to?o.jsx(H,{to:T.to,className:"flex items-center gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-accent/40",children:U},T.id):o.jsx("div",{className:"flex items-center gap-2 rounded-lg border border-border/70 bg-background/50 px-3 py-2",children:U},T.id)})})]},y.id))})})]}),o.jsx(qs,{})]})})})}const eo=m.lazy(()=>N(()=>import("./Home-DVpuYAtA.js"),__vite__mapDeps([0,1,2,3,4,5,6,7]))),to=m.lazy(()=>N(()=>import("./Generation-BFRi_man.js"),__vite__mapDeps([8,1,2,3,9,10,11,12,13,5,6,7]))),no=m.lazy(()=>N(()=>import("./SeedGenerator-gmK1BKWY.js"),__vite__mapDeps([14,1,2,3,12,13,9,5,6,7]))),ro=m.lazy(()=>N(()=>import("./Validation-D8uQ3gwF.js"),__vite__mapDeps([15,1,2,3,10,6,7,5]))),nn=m.lazy(()=>N(()=>import("./Drafts-DWDRyA43.js"),__vite__mapDeps([16,1,2,3,17,10,18,5,6,7]))),ao=m.lazy(()=>N(()=>import("./Review-Bv1SzHS3.js"),__vite__mapDeps([19,1,2,3,20,10,18,5,6,7]))),so=m.lazy(()=>N(()=>import("./Blueprints-B0r9P_hf.js"),__vite__mapDeps([21,1,2,3,10,22,5,6,7]))),oo=m.lazy(()=>N(()=>import("./BlueprintEditor-_6oadHKW.js"),__vite__mapDeps([23,1,24,25,3,22,26,5,2,6,7]))),io=m.lazy(()=>N(()=>import("./Templates-BeBXE82G.js"),__vite__mapDeps([27,1,2,3,20,10,6,7,5]))),co=m.lazy(()=>N(()=>import("./Lineage-CTIBQQzD.js"),__vite__mapDeps([28,1,2,3,5,6,7]))),lo=m.lazy(()=>N(()=>import("./Similarity-CCy2Pf_Y.js"),__vite__mapDeps([29,1,2,3,5,6,7]))),uo=m.lazy(()=>N(()=>import("./Offspring-BIbZDlmL.js"),__vite__mapDeps([30,1,2,3,13,9,12,11,5,6,7]))),po=m.lazy(()=>N(()=>import("./Worlds-wdhxr0zQ.js"),__vite__mapDeps([31,1,3,2,6,7,5]))),ho=m.lazy(()=>N(()=>import("./Timelines-Dg1dPN68.js"),__vite__mapDeps([32,1,2,3,6,7,5]))),mo=m.lazy(()=>N(()=>import("./Events-CtJMe50K.js"),__vite__mapDeps([33,1,3,2,6,7,5]))),fo=m.lazy(()=>N(()=>import("./Settings-BwES0WP1.js"),__vite__mapDeps([34,1,2,3,10,5,13,6,7]))),go=m.lazy(()=>N(()=>import("./ThemeStudio-C86Nw8Hv.js"),__vite__mapDeps([35,1,2,3,20,17,6,7,5]))),bo=m.lazy(()=>N(()=>import("./DataManager-k6auVvFQ.js"),__vite__mapDeps([36,1,20,17,3,2,6,7,5]))),yo=m.lazy(()=>N(()=>import("./BatchGenerate-BxSU_6AB.js"),__vite__mapDeps([37,1,2,3,9,6,7,5]))),wo=m.lazy(()=>N(()=>import("./AuthPage-CbMug66V.js"),__vite__mapDeps([38,1,3,5,2,6,7]))),xo=m.lazy(()=>N(()=>import("./About-DfLlEkjL.js"),__vite__mapDeps([39,1,40,25,3,26,5]))),vo=m.lazy(()=>N(()=>import("./HelpCenterPage-DftsKTIj.js"),__vite__mapDeps([41,1,40,25,3,26,5,2,6,7]))),_o=m.lazy(()=>N(()=>import("./WhatsNewPage-DjCoP2_k.js"),__vite__mapDeps([42,1,40,25,3,26,4,5,2,6,7]))),ko=m.lazy(()=>N(()=>import("./LicensePage-CQ1G_Dlt.js"),__vite__mapDeps([43,1,40,25,3,26]))),So=m.lazy(()=>N(()=>import("./TermsPage-CFSVavae.js"),__vite__mapDeps([44,1,40,25,3,26]))),To=m.lazy(()=>N(()=>import("./PrivacyPage-Bpw4vfvl.js"),__vite__mapDeps([45,1,40,25,3,26]))),Eo=m.lazy(()=>N(()=>import("./SecurityPage-BRl5hlwK.js"),__vite__mapDeps([46,1,40,25,3,26]))),Ao=m.lazy(()=>N(()=>import("./CodeOfConductPage-KG4NAXCy.js"),__vite__mapDeps([47,1,40,25,3,26])));function Co(){return o.jsx("div",{className:"flex h-[60vh] items-center justify-center",children:o.jsxs("div",{className:"flex items-center gap-3 text-sm text-muted-foreground",children:[o.jsx(an,{className:"h-5 w-5 animate-spin"}),"Loading screen..."]})})}function No(){return o.jsxs("div",{className:"flex h-[60vh] flex-col items-center justify-center gap-4 text-center",children:[o.jsxs("div",{children:[o.jsx("h1",{className:"text-2xl font-semibold text-foreground",children:"Page not found"}),o.jsx("p",{className:"mt-2 text-sm text-muted-foreground",children:"The requested route does not exist in the current browser app build."})]}),o.jsx(H,{to:"/",className:"inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",children:"Return home"})]})}function jo(){return o.jsx(Zs,{children:o.jsx(m.Suspense,{fallback:o.jsx(Co,{}),children:o.jsxs(_r,{children:[o.jsx(E,{path:"/",element:o.jsx(eo,{})}),o.jsx(E,{path:"/generate",element:o.jsx(to,{})}),o.jsx(E,{path:"/seed-generator",element:o.jsx(no,{})}),o.jsx(E,{path:"/validation",element:o.jsx(ro,{})}),o.jsx(E,{path:"/batch",element:o.jsx(yo,{})}),o.jsx(E,{path:"/drafts",element:o.jsx(nn,{})}),o.jsx(E,{path:"/drafts/",element:o.jsx(nn,{})}),o.jsx(E,{path:"/drafts/:id",element:o.jsx(ao,{})}),o.jsx(E,{path:"/templates",element:o.jsx(io,{})}),o.jsx(E,{path:"/blueprints",element:o.jsx(so,{})}),o.jsx(E,{path:"/blueprints/edit/*",element:o.jsx(oo,{})}),o.jsx(E,{path:"/lineage",element:o.jsx(co,{})}),o.jsx(E,{path:"/similarity",element:o.jsx(lo,{})}),o.jsx(E,{path:"/offspring",element:o.jsx(uo,{})}),o.jsx(E,{path:"/worlds",element:o.jsx(po,{})}),o.jsx(E,{path:"/timelines",element:o.jsx(ho,{})}),o.jsx(E,{path:"/events",element:o.jsx(mo,{})}),o.jsx(E,{path:"/themes",element:o.jsx(go,{})}),o.jsx(E,{path:"/settings",element:o.jsx(fo,{})}),o.jsx(E,{path:"/data",element:o.jsx(bo,{})}),o.jsx(E,{path:"/auth",element:o.jsx(wo,{})}),o.jsx(E,{path:"/about",element:o.jsx(xo,{})}),o.jsx(E,{path:"/help",element:o.jsx(vo,{})}),o.jsx(E,{path:"/whats-new",element:o.jsx(_o,{})}),o.jsx(E,{path:"/license",element:o.jsx(ko,{})}),o.jsx(E,{path:"/terms",element:o.jsx(So,{})}),o.jsx(E,{path:"/privacy",element:o.jsx(To,{})}),o.jsx(E,{path:"/security",element:o.jsx(Eo,{})}),o.jsx(E,{path:"/code-of-conduct",element:o.jsx(Ao,{})}),o.jsx(E,{path:"*",element:o.jsx(No,{})})]})})})}const Po={background:"background",text:"text",accent:"accent",button:"button",button_text:"button_text",border:"border",highlight:"highlight",window:"window",muted_text:"muted_text",surface:"surface",success_bg:"success_bg",danger_bg:"danger_bg",accent_bg:"accent_bg",accent_title:"accent_title",success_text:"success_text",error_text:"error_text",warning_text:"warning_text"},Io={brackets:"tok_brackets",asterisk:"tok_asterisk",parentheses:"tok_parentheses",double_brackets:"tok_double_brackets",curly_braces:"tok_curly_braces",pipes:"tok_pipes",at_sign:"tok_at_sign"},Oo=[{section:"app",key:"background",label:"Background",colorKey:"background"},{section:"app",key:"surface",label:"Surface",colorKey:"surface"},{section:"app",key:"window",label:"Window",colorKey:"window"},{section:"app",key:"text",label:"Text",colorKey:"text"},{section:"app",key:"muted_text",label:"Muted Text",colorKey:"muted_text"},{section:"app",key:"accent",label:"Primary Accent",colorKey:"accent"},{section:"app",key:"accent_bg",label:"Accent Surface",colorKey:"accent_bg"},{section:"app",key:"button",label:"Button",colorKey:"button"},{section:"app",key:"button_text",label:"Button Text",colorKey:"button_text"},{section:"app",key:"border",label:"Border",colorKey:"border"},{section:"app",key:"highlight",label:"Ring / Highlight",colorKey:"highlight"},{section:"app",key:"success_text",label:"Success Text",colorKey:"success_text"},{section:"app",key:"warning_text",label:"Warning Text",colorKey:"warning_text"},{section:"app",key:"error_text",label:"Error Text",colorKey:"error_text"},{section:"app",key:"success_bg",label:"Success Surface",colorKey:"success_bg"},{section:"app",key:"danger_bg",label:"Danger Surface",colorKey:"danger_bg"},{section:"app",key:"accent_title",label:"Accent Title",colorKey:"accent_title"}],Do=[{section:"tokenizer",key:"brackets",label:"Brackets",colorKey:"tok_brackets"},{section:"tokenizer",key:"asterisk",label:"Asterisk",colorKey:"tok_asterisk"},{section:"tokenizer",key:"parentheses",label:"Parentheses",colorKey:"tok_parentheses"},{section:"tokenizer",key:"double_brackets",label:"Double Brackets",colorKey:"tok_double_brackets"},{section:"tokenizer",key:"curly_braces",label:"Curly Braces",colorKey:"tok_curly_braces"},{section:"tokenizer",key:"pipes",label:"Pipes",colorKey:"tok_pipes"},{section:"tokenizer",key:"at_sign",label:"At Sign",colorKey:"tok_at_sign"}],si=[{title:"App Colors",description:"Web and app-facing surfaces.",fields:Oo},{title:"Tokenizer Colors",description:"Syntax highlighting tokens used in review surfaces.",fields:Do}];function Ro(a,e){if(!a)return null;const t={...a.colors};for(const[n,r]of Object.entries(e?.app??{})){if(!r)continue;const s=Po[n];s&&(t[s]=r)}for(const[n,r]of Object.entries(e?.tokenizer??{})){if(!r)continue;const s=Io[n];s&&(t[s]=r)}return t}function B(a){const e=a.replace("#","").trim(),t=e.length===3?e.split("").map(x=>x+x).join(""):e;if(!/^[0-9a-fA-F]{6}$/.test(t))return"0 0% 0%";const n=parseInt(t.slice(0,2),16)/255,r=parseInt(t.slice(2,4),16)/255,s=parseInt(t.slice(4,6),16)/255,i=Math.max(n,r,s),c=Math.min(n,r,s),l=i-c,d=(i+c)/2;let u=0,p=0;if(l!==0)switch(p=l/(1-Math.abs(2*d-1)),i){case n:u=(r-s)/l%6;break;case r:u=(s-n)/l+2;break;default:u=(n-r)/l+4;break}const h=Math.round(u*60<0?u*60+360:u*60),f=Math.round(p*1e3)/10,b=Math.round(d*1e3)/10;return`${h} ${f}% ${b}%`}function Lo(a){return{"--background":B(a.background),"--foreground":B(a.text),"--card":B(a.surface),"--card-foreground":B(a.text),"--primary":B(a.accent),"--primary-foreground":B(a.button_text),"--secondary":B(a.button),"--secondary-foreground":B(a.button_text),"--muted":B(a.window),"--muted-foreground":B(a.muted_text),"--accent":B(a.accent_bg),"--accent-foreground":B(a.text),"--destructive":B(a.danger_bg),"--destructive-foreground":B(a.button_text),"--border":B(a.border),"--input":B(a.border),"--ring":B(a.highlight)}}function Mo(a){const e=document.documentElement,t=Lo(a);Object.entries(t).forEach(([r,s])=>{e.style.setProperty(r,s)}),e.style.setProperty("--app-bg",a.background),e.style.setProperty("--app-surface",a.surface),e.style.setProperty("--app-border",a.border),e.style.setProperty("--app-highlight",a.highlight),e.style.setProperty("--app-accent",a.accent);const n=document.querySelector('meta[name="theme-color"]');n&&n.setAttribute("content",a.window)}const Fo=m.createContext(null);function Uo({children:a}){const[e,t]=m.useState(null),n=cn(),{data:r}=se({queryKey:["config"],queryFn:()=>K.getConfig(),initialData:()=>K.getConfigSnapshot()}),{data:s=[],isLoading:i}=se({queryKey:["themes"],queryFn:()=>K.getThemes(),initialData:()=>K.getThemesSnapshot()}),c=e?.themeName??r?.theme_name??"dark",l=e?.overrides??r?.theme;m.useEffect(()=>{const u=s.find(h=>h.name===c)??s[0],p=Ro(u,l);p&&Mo(p)},[s,c,l]),m.useEffect(()=>{const u=()=>{n.invalidateQueries({queryKey:["themes"]})};return window.addEventListener(ft,u),()=>{window.removeEventListener(ft,u)}},[n]);const d=m.useMemo(()=>({themes:s,isLoading:i,previewTheme:(u,p)=>{t({themeName:u,overrides:p})},clearPreview:()=>{t(null)}}),[s,i]);return o.jsx(Fo.Provider,{value:d,children:a})}const $o=new br({defaultOptions:{queries:{staleTime:1e3*60*5,retry:1}}});Gn.createRoot(document.getElementById("root")).render(o.jsx(m.StrictMode,{children:o.jsx(yr,{client:$o,children:o.jsx(Uo,{children:o.jsx(kr,{children:o.jsx(jo,{})})})})}));export{he as A,jr as B,Ro as C,za as D,si as E,Mo as F,X as G,z as H,ns as I,rs as J,ei as K,Vo as L,Ut as M,Yo as N,Pr as O,Jo as P,Ar as R,ht as S,Fo as T,Nr as V,N as _,ai as a,He as b,K as c,it as d,P as e,ts as f,ln as g,fe as h,Xo as i,Qo as j,ti as k,Qa as l,ri as m,Cr as n,L as o,Xa as p,O as q,Rr as r,Zo as s,ni as t,Ks as u,pn as v,ze as w,k as x,Ge as y,mn as z};
//# sourceMappingURL=index-D1tmjud2.js.map
