import{j as t}from"./react-vendor-C34M-SVW.js";import{D as o}from"./DocumentPage-DVyrFT2P.js";import{i as a}from"./index--uuuY7lo.js";import"./markdownComponents-z5VzjD1s.js";import"./vendor-xZl0FfKq.js";import"./markdown-vendor-C1DzP7N6.js";import"./query-vendor-D-czEBwb.js";import"./router-vendor-BUgBkwhx.js";function m(){const e=a(),r=`## Overview

Eidolon Simulacra is designed as a browser-first application, and the desktop build reuses that same client workflow. By default, drafts, templates, blueprint overrides, theme presets, and most configuration state are stored locally on your device${e?" in desktop app data":" in your browser"}.

## What Is Stored Locally

- draft metadata and draft assets
- template definitions and blueprint overrides
- theme presets and theme customizations
- app configuration and model preferences
- optional persisted API keys, if you explicitly enable persistence

## API Keys

API keys are sensitive. The app can keep them in memory for the current session or persist them locally when you opt in.

${e?"If you enable persistence, keys are stored in desktop app data on the current device.":"If you enable persistence, keys are stored in local browser storage on the current device."}

## Third-Party Model Providers

When you generate, refine, compare, or otherwise use model-backed actions, relevant request data may be sent directly to the configured provider. This can include prompts, asset content, draft context, and selected settings.

Provider handling of that data is governed by the provider's own privacy policy and terms.

## Imports and Exports

When you export drafts, config, or keys, files are generated on your device. You are responsible for securing those exports and handling them appropriately.

## Hosted Telemetry

Optional analytics or error tracking may be configured via environment variables in a deployment, but this repository does not require them for core operation.

## Data Deletion

${e?"You can remove device-stored data through the in-app Data Manager or by clearing the desktop app data for this installation.":"You can remove browser-stored data through the in-app Data Manager or by clearing site storage in your browser."}

## Security Reporting

If you discover a vulnerability or sensitive data exposure issue, follow the reporting instructions on the Security page.`;return t.jsx(o,{eyebrow:"Privacy",title:"Privacy",summary:e?"How desktop app data, API keys, provider requests, and exports are handled in the desktop runtime.":"How browser storage, API keys, provider requests, and exports are handled in the current browser-first architecture.",markdown:r})}export{m as default};
//# sourceMappingURL=PrivacyPage-DTuPaSPs.js.map
