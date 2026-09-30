import { describe, expect, it } from 'vitest';
import {
  aboutCrossLinks,
  aboutInfoCards,
  aboutWhatItDoes,
  buildAboutQuickFacts,
  buildAboutSummary,
  buildPrivacyMarkdown,
  buildPrivacySummary,
  codeOfConductDocumentText,
  communityInternalLinks,
  getInfoPage,
  getInfoPageByPath,
  getInfoPageMarkdown,
  getInfoPageSummary,
  infoPages,
  licenseDocumentText,
  securityDocumentText,
  termsMarkdown,
  type InfoPageId,
  type InfoRuntimeScope,
} from './index';
import {
  communityGuidance,
  communityResources,
  contactGuidance,
  PROJECT_CONTACT_EMAIL,
  PROJECT_ISSUES_URL,
  PROJECT_REPOSITORY_URL,
  PROJECT_SUPPORT_URL,
  supportGuidance,
} from './project-links';

const SCOPES: InfoRuntimeScope[] = ['browser', 'desktop', 'mobile'];

describe('info page metadata', () => {
  it('declares every page exactly once with a leading-slash web path', () => {
    const ids = infoPages.map((page) => page.id);
    const paths = infoPages.map((page) => page.webPath);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(paths).size).toBe(paths.length);

    infoPages.forEach((page) => {
      expect(page.webPath.startsWith('/')).toBe(true);
      expect(page.eyebrow.trim().length).toBeGreaterThan(0);
      expect(page.title.trim().length).toBeGreaterThan(0);
    });
  });

  it('covers every browser info route, including the download page', () => {
    const paths = infoPages.map((page) => page.webPath).sort();

    expect(paths).toEqual([
      '/about',
      '/code-of-conduct',
      '/community',
      '/download',
      '/license',
      '/privacy',
      '/security',
      '/terms',
    ]);
  });

  it('looks pages up by id and by path, and rejects neither silently', () => {
    expect(getInfoPage('privacy').webPath).toBe('/privacy');
    expect(getInfoPageByPath('/privacy')?.id).toBe('privacy');
    expect(getInfoPageByPath(' /SECURITY ')).toMatchObject({ id: 'security' });
    expect(getInfoPageByPath('/nope')).toBeNull();
    expect(() => getInfoPage('nope' as InfoPageId)).toThrow(/Unknown info page/);
  });
});

describe('info page summaries', () => {
  it('gives every page a non-empty summary in every runtime scope', () => {
    infoPages.forEach((page) => {
      SCOPES.forEach((scope) => {
        const summary = getInfoPageSummary(page.id, scope);
        expect(summary.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('describes the surface the summary is rendered on', () => {
    expect(buildAboutSummary('mobile')).toContain('companion mobile workspace');
    expect(buildAboutSummary('browser')).toContain('browser-first');
    expect(buildPrivacySummary('mobile')).toContain('mobile app');
    expect(buildPrivacySummary('desktop')).toContain('desktop runtime');
  });
});

describe('info documents', () => {
  it('renders a document for markdown pages only', () => {
    infoPages.forEach((page) => {
      const markdown = getInfoPageMarkdown(page.id, 'browser');

      if (page.kind === 'markdown') {
        expect(markdown).toBeTypeOf('string');
        expect(markdown?.trim().length).toBeGreaterThan(0);
        expect(markdown).toContain('\n\n');
      } else {
        expect(markdown).toBeNull();
      }
    });
  });

  it('ships heading structure for every authored markdown page', () => {
    // `LICENSE` is plain text with no markdown headings, so it is excluded:
    // asserting a heading on it would be asserting something untrue.
    (['terms', 'privacy', 'security', 'code-of-conduct'] as InfoPageId[]).forEach((id) => {
      expect(getInfoPageMarkdown(id, 'browser')).toContain('## ');
    });
  });

  it('embeds the repository documents from the generated module', () => {
    expect(licenseDocumentText).toContain('Eidolon Simulacra Personal Use License');
    expect(securityDocumentText).toContain('# Security Policy');
    expect(codeOfConductDocumentText).toContain('# Contributor Covenant Code of Conduct');

    expect(getInfoPageMarkdown('license', 'browser')).toBe(licenseDocumentText);
    expect(getInfoPageMarkdown('security', 'mobile')).toBe(securityDocumentText);
    expect(getInfoPageMarkdown('code-of-conduct', 'desktop')).toBe(codeOfConductDocumentText);
  });

  it('keeps the generated documents free of carriage returns', () => {
    // The generator normalises line endings so the generated file is identical
    // on every platform; this is what makes `pnpm info:docs:check` stable in CI.
    [licenseDocumentText, securityDocumentText, codeOfConductDocumentText, termsMarkdown].forEach((document) => {
      expect(document.includes('\r')).toBe(false);
    });
  });

  it('keeps the browser privacy wording byte-identical to the previous page', () => {
    const browser = buildPrivacyMarkdown('browser');

    expect(browser).toContain('are stored locally on your device in your browser.');
    expect(browser).toContain(
      'If you enable persistence, keys are stored in local browser storage on the current device.',
    );
    expect(browser).toContain(
      'You can remove browser-stored data through the in-app Data Manager or by clearing site storage in your browser.',
    );
  });

  it('keeps the desktop privacy wording byte-identical to the previous page', () => {
    const desktop = buildPrivacyMarkdown('desktop');

    expect(desktop).toContain('are stored locally on your device in desktop app data.');
    expect(desktop).toContain('If you enable persistence, keys are stored in desktop app data on the current device.');
    expect(desktop).toContain(
      'You can remove device-stored data through the in-app Data Manager or by clearing the desktop app data for this installation.',
    );
  });

  it('never lets mobile claim browser or desktop storage', () => {
    const mobile = buildPrivacyMarkdown('mobile');

    expect(mobile).toContain('are stored locally on your device in this app on your device.');
    expect(mobile).not.toContain('in your browser');
    expect(mobile).not.toContain('desktop app data');
    expect(mobile).not.toContain('IndexedDB');
  });
});

describe('about page content', () => {
  it('keeps the shared feature copy non-empty', () => {
    expect(aboutWhatItDoes.title.trim().length).toBeGreaterThan(0);
    expect(aboutWhatItDoes.subtitle.trim().length).toBeGreaterThan(0);
    expect(aboutWhatItDoes.paragraphs.length).toBeGreaterThan(0);
    aboutWhatItDoes.paragraphs.forEach((paragraph) => expect(paragraph.trim().length).toBeGreaterThan(0));
  });

  it('reports the caller-supplied version instead of a hardcoded one', () => {
    const facts = buildAboutQuickFacts({ scope: 'mobile', version: '1.2.3' });
    const versionFact = facts.find((fact) => fact.label === 'Version line');

    expect(versionFact?.value).toBe('v1.2.3 mobile companion build.');
    expect(versionFact?.value).not.toContain('browser generation stack');
  });

  it('gives every scope four labelled quick facts', () => {
    SCOPES.forEach((scope) => {
      const facts = buildAboutQuickFacts({ scope, version: '9.9.9' });

      expect(facts).toHaveLength(4);
      facts.forEach((fact) => {
        expect(fact.label.trim().length).toBeGreaterThan(0);
        expect(fact.value.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('points every info card at a real info page or a known in-app route', () => {
    const infoPaths = new Set(infoPages.map((page) => page.webPath));
    const knownAppPaths = new Set(['/whats-new', '/settings', '/help']);

    aboutInfoCards.forEach((card) => {
      expect(infoPaths.has(card.to) || knownAppPaths.has(card.to)).toBe(true);
      expect(card.title.trim().length).toBeGreaterThan(0);
      expect(card.description.trim().length).toBeGreaterThan(0);
    });
  });

  it('keeps the cross-link lists free of duplicates and valid paths', () => {
    [...aboutCrossLinks, ...communityInternalLinks].forEach((link) => {
      expect(link.to.startsWith('/')).toBe(true);
      expect(link.title.trim().length).toBeGreaterThan(0);
    });

    const aboutPaths = aboutCrossLinks.map((link) => link.to);
    const communityPaths = communityInternalLinks.map((link) => link.to);
    expect(new Set(aboutPaths).size).toBe(aboutPaths.length);
    expect(new Set(communityPaths).size).toBe(communityPaths.length);
  });
});

describe('project links', () => {
  it('exposes the canonical project URLs', () => {
    expect(PROJECT_REPOSITORY_URL.startsWith('https://github.com/')).toBe(true);
    expect(PROJECT_ISSUES_URL).toBe(`${PROJECT_REPOSITORY_URL}/issues`);
    expect(PROJECT_SUPPORT_URL.startsWith('https://ko-fi.com/')).toBe(true);
    expect(PROJECT_CONTACT_EMAIL).toContain('@');
  });

  it('describes every community resource with a usable link', () => {
    expect(communityResources).toHaveLength(4);

    const ids = communityResources.map((resource) => resource.id);
    expect(new Set(ids).size).toBe(ids.length);

    communityResources.forEach((resource) => {
      expect(resource.title.trim().length).toBeGreaterThan(0);
      expect(resource.description.trim().length).toBeGreaterThan(0);
      expect(resource.href).toMatch(/^(https:\/\/|mailto:)/);
      expect(resource.external).toBe(true);
    });
  });

  it('builds encoded mailto links', () => {
    const contact = communityResources.find((resource) => resource.id === 'contact');
    expect(contact?.href).toBe(`mailto:${PROJECT_CONTACT_EMAIL}?subject=Eidolon%20Simulacra%20Community`);
    expect(contactGuidance.actionHref).toContain(encodeURIComponent('Bug Report or Security Issue'));
  });

  it('keeps the guidance copy non-empty', () => {
    [...communityGuidance, ...supportGuidance].forEach((paragraph) => {
      expect(paragraph.trim().length).toBeGreaterThan(0);
    });

    expect(contactGuidance.intro.trim().length).toBeGreaterThan(0);
    expect(contactGuidance.bugLine.trim().length).toBeGreaterThan(0);
    expect(contactGuidance.securityLine.trim().length).toBeGreaterThan(0);
    expect(contactGuidance.actionLabel.trim().length).toBeGreaterThan(0);
  });
});
