import { fireEvent } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { installExternalLinkHandler, isExternalHref } from './external-links';
import { openUrl } from '@tauri-apps/plugin-opener';

vi.mock('@tauri-apps/plugin-opener', () => ({
  openUrl: vi.fn(async () => {}),
}));

vi.mock('./runtime', () => ({
  isDesktopRuntime: () => true,
}));

const openUrlMock = vi.mocked(openUrl);

function anchorInBody(href: string): HTMLAnchorElement {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.textContent = 'link';
  document.body.appendChild(anchor);
  return anchor;
}

beforeAll(() => {
  // Desktop runtime is mocked true, so this attaches the document listener.
  installExternalLinkHandler();
});

afterEach(() => {
  openUrlMock.mockClear();
  document.body.replaceChildren();
});

describe('isExternalHref', () => {
  it('accepts http(s) and mailto, rejects in-app routes', () => {
    expect(isExternalHref('https://chub.ai/characters/x')).toBe(true);
    expect(isExternalHref('http://localhost:5173/docs')).toBe(true);
    expect(isExternalHref('mailto:lore@chub.ai')).toBe(true);
    expect(isExternalHref('#/settings?section=chub')).toBe(false);
    expect(isExternalHref('/drafts/abc')).toBe(false);
    expect(isExternalHref('javascript:alert(1)')).toBe(false);
    expect(isExternalHref(null)).toBe(false);
    expect(isExternalHref(undefined)).toBe(false);
  });
});

describe('external link handler', () => {
  it('routes an external anchor click to the opener and cancels navigation', () => {
    const anchor = anchorInBody('https://chub.ai/characters/maeve/alice');
    anchor.target = '_blank';

    const notPrevented = fireEvent.click(anchor);

    expect(notPrevented).toBe(false);
    expect(openUrlMock).toHaveBeenCalledWith('https://chub.ai/characters/maeve/alice');
  });

  it('intercepts clicks inside nested elements of the anchor', () => {
    const anchor = anchorInBody('https://docs.ollama.com/api/introduction');
    const icon = document.createElement('span');
    anchor.appendChild(icon);

    const notPrevented = fireEvent.click(icon);

    expect(notPrevented).toBe(false);
    expect(openUrlMock).toHaveBeenCalledWith('https://docs.ollama.com/api/introduction');
  });

  it('leaves internal hash links and non-anchor clicks alone', () => {
    const route = anchorInBody('#/settings?section=chub');
    expect(fireEvent.click(route)).toBe(true);

    const plain = document.createElement('button');
    plain.textContent = 'button';
    document.body.appendChild(plain);
    expect(fireEvent.click(plain)).toBe(true);

    expect(openUrlMock).not.toHaveBeenCalled();
  });

  it('installs exactly once so a click opens one browser tab', () => {
    installExternalLinkHandler();

    const anchor = anchorInBody('https://eidolon-simulacra.app/');
    expect(fireEvent.click(anchor)).toBe(false);

    expect(openUrlMock).toHaveBeenCalledTimes(1);
  });
});
