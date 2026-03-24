import{j as e}from"./index-DpfBfet3.js";import{D as n}from"./DocumentPage-CKu2D9m3.js";import"./router-vendor-qnUfEknD.js";import"./markdownComponents-CpZ9AyJ_.js";import"./check-Cv4YZXxE.js";import"./copy-CVfxm62e.js";const o=`# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 3.1.x   | ✅ Yes    |
| < 3.1   | ❌ No     |

## Reporting a Vulnerability

**Do not open public GitHub issues for security vulnerabilities.**

Please report security issues by email:

- **Email:** <support@kindleloom.com>

Include the following in your report:

- A clear description of the vulnerability
- Steps to reproduce (proof-of-concept if available)
- Potential impact
- Suggested mitigation (if known)

We will acknowledge receipt within 48 hours and provide a timeline for remediation after initial triage.

## Security Best Practices

### API Keys

- Do **not** commit API keys or secrets to source control
- Prefer browser-local configuration for normal use, and use environment variables only for development or deployment workflows that actually consume them
- Rotate keys periodically

### Dependencies

- Keep dependencies up to date
- Review Dependabot PRs promptly

### Input Handling

- Treat LLM outputs as untrusted input
- Validate and sanitize exported files before publishing

---

Thank you for helping keep Eidolon Simulacra secure.
`;function u(){return e.jsx(n,{eyebrow:"Security",title:"Security",summary:"Security guidance, supported versions, and vulnerability reporting information.",markdown:o})}export{u as default};
//# sourceMappingURL=SecurityPage-CS2qDW8a.js.map
