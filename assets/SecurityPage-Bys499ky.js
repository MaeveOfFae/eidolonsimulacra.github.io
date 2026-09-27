import{j as r}from"./react-vendor-C34M-SVW.js";import{D as e}from"./DocumentPage-CQq7AB7Y.js";import"./markdownComponents-f3jSwT-j.js";import"./vendor-l6Rz9rZC.js";import"./markdown-vendor-C0n2nbDm.js";const n=`# Security Policy\r
\r
## Supported Versions\r
\r
| Version | Supported |\r
| ------- | --------- |\r
| 3.1.x   | ✅ Yes    |\r
| < 3.1   | ❌ No     |\r
\r
## Reporting a Vulnerability\r
\r
**Do not open public GitHub issues for security vulnerabilities.**\r
\r
Please report security issues by email:\r
\r
- **Email:** <support@kindleloom.com>\r
\r
Include the following in your report:\r
\r
- A clear description of the vulnerability\r
- Steps to reproduce (proof-of-concept if available)\r
- Potential impact\r
- Suggested mitigation (if known)\r
\r
We will acknowledge receipt within 48 hours and provide a timeline for remediation after initial triage.\r
\r
## Security Best Practices\r
\r
### API Keys\r
\r
- Do **not** commit API keys or secrets to source control\r
- Prefer browser-local configuration for normal use, and use environment variables only for development or deployment workflows that actually consume them\r
- Rotate keys periodically\r
\r
### Dependencies\r
\r
- Keep dependencies up to date\r
- Review Dependabot PRs promptly\r
\r
### Input Handling\r
\r
- Treat LLM outputs as untrusted input\r
- Validate and sanitize exported files before publishing\r
\r
---\r
\r
Thank you for helping keep Eidolon Simulacra secure.\r
`;function l(){return r.jsx(e,{eyebrow:"Security",title:"Security",summary:"Security guidance, supported versions, and vulnerability reporting information.",markdown:n})}export{l as default};
//# sourceMappingURL=SecurityPage-Bys499ky.js.map
