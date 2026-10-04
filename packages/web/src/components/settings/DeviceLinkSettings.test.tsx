import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DeviceLinkSettings from './DeviceLinkSettings';
import {
  getDesktopCompanionStatus,
  peekIncomingWorkspaceBundleFromDesktopCompanion,
  type DesktopCompanionStatus,
} from '../../lib/desktop-companion.js';
import { previewDesktopCompanionSyncStateText, type DesktopCompanionSyncPreview } from '../../lib/device-link.js';
import { saveRememberedMobileCompanion } from '../../lib/desktop-companion-settings.js';

// The screen is desktop-gated, so pretend we are inside the Tauri shell while keeping
// the rest of the runtime helpers real.
vi.mock('../../lib/runtime.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/runtime.js')>()),
  isDesktopRuntime: () => true,
}));

// Only the Tauri-facing companion calls are mocked; `desktop-companion-settings` stays
// real because it is localStorage-backed and works in jsdom.
vi.mock('../../lib/desktop-companion.js', () => ({
  getDesktopCompanionStatus: vi.fn(),
  peekIncomingWorkspaceBundleFromDesktopCompanion: vi.fn(),
  publishWorkspaceBundleToDesktopCompanion: vi.fn(),
  rotateDesktopCompanionPairCode: vi.fn(),
  takeIncomingWorkspaceBundleFromDesktopCompanion: vi.fn(),
  buildDesktopCompanionPairingText: vi.fn(() => 'pairing text'),
  buildDesktopCompanionPairingQrText: vi.fn(() => 'eidolon://pair?code=12345678'),
}));

vi.mock('../../lib/device-link.js', () => ({
  previewDesktopCompanionSyncStateText: vi.fn(),
  exportDesktopCompanionSyncStateText: vi.fn(async () => '{"bundle":true}'),
  exportWorkspaceBundleText: vi.fn(async () => '{"bundle":true}'),
  importDesktopCompanionSyncStateText: vi.fn(async () => ({ ok: true })),
  importWorkspaceBundleText: vi.fn(async () => ({ ok: true })),
}));

vi.mock('../../utils/download', () => ({
  pickFile: vi.fn(),
  saveBlobDownload: vi.fn(),
}));

vi.mock('qrcode', () => ({
  default: { toDataURL: vi.fn(async () => 'data:image/png;base64,AAA') },
}));

const PREVIEW: DesktopCompanionSyncPreview = {
  exportedAt: '2026-01-01T00:00:00.000Z',
  source: { deviceId: 'mobile-1', name: 'Mobile A', platform: 'mobile', runtime: 'tauri' },
  domains: {
    drafts: {
      incomingCount: 3,
      matchingReviewIds: 0,
      identicalReviewIds: 2,
      conflictingReviewIds: 1,
      newReviewIds: 4,
      conflictingDrafts: [{ reviewId: 'rev-1', incomingName: 'Draft B', currentName: 'Draft A' }],
      newDrafts: [{ reviewId: 'rev-2', incomingName: 'Draft C' }],
    },
    templates: {
      incomingCount: 1,
      matchingNames: 0,
      identicalNames: 0,
      conflictingNames: 0,
      newNames: 1,
      conflictingTemplates: [],
      newTemplateNames: ['New Template'],
    },
    blueprints: {
      incomingCount: 0,
      matchingPaths: 0,
      identicalPaths: 0,
      conflictingPaths: 0,
      overridingPaths: 0,
      newPaths: 0,
      conflictingBlueprints: [],
      overridingBlueprintPaths: [],
      newBlueprintPaths: [],
    },
    config: {
      hasConfig: true,
      hasApiKeys: false,
      incomingModel: 'openai/gpt-4o-mini',
      currentModel: 'openrouter/openai/gpt-4o-mini',
      modelWillChange: true,
      importedSettingFields: 2,
      importedApiKeys: 0,
    },
  },
};

function mockCompanion({ incomingBundleAvailable }: { incomingBundleAvailable: boolean }) {
  vi.mocked(getDesktopCompanionStatus).mockResolvedValue({
    running: true,
    localUrl: 'http://127.0.0.1:47821',
    pairCode: '12345678',
    incomingBundleAvailable,
    outgoingBundleAvailable: false,
    outgoingBundlePublishedAtMs: null,
    lastError: null,
  } as unknown as DesktopCompanionStatus);

  vi.mocked(peekIncomingWorkspaceBundleFromDesktopCompanion).mockResolvedValue(
    incomingBundleAvailable ? ('pending' as never) : null,
  );
  vi.mocked(previewDesktopCompanionSyncStateText).mockResolvedValue(PREVIEW);
}

function renderDeviceLink() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <DeviceLinkSettings />
    </QueryClientProvider>,
  );
}

describe('DeviceLinkSettings incoming preview', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockCompanion({ incomingBundleAvailable: true });
  });

  it('summarizes an incoming bundle from an untrusted sender', async () => {
    renderDeviceLink();

    expect(await screen.findByText('Incoming Sync Preview')).toBeInTheDocument();
    expect(screen.getByText(/Incoming from Mobile A \(mobile\/tauri\)/)).toBeInTheDocument();
    expect(screen.getByText(/• untrusted sender\./)).toBeInTheDocument();
    // The banner bullet separates the two states; the policy card mentions
    // "untrusted" as well, so match the banner wording exactly.
    expect(screen.queryByText(/• trusted sender\./)).not.toBeInTheDocument();

    expect(screen.getByText('3 incoming')).toBeInTheDocument();
    expect(screen.getByText(/1 conflicts · 2 same · 4 new/)).toBeInTheDocument();
    expect(screen.getByText('Included')).toBeInTheDocument();
    expect(screen.getByText(/2 fields would merge · 0 API keys would fill/)).toBeInTheDocument();

    const modelImpact = /incoming openai\/gpt-4o-mini → current openrouter\/openai\/gpt-4o-mini \(will change\)\./;
    expect(await screen.findByText(modelImpact)).toBeInTheDocument();

    expect(screen.getByText('Conflicting Drafts')).toBeInTheDocument();
    // The conflict line interleaves spans with text nodes, so assert on its parts.
    expect(screen.getByText('Draft B')).toBeInTheDocument();
    expect(screen.getByText('Draft A')).toBeInTheDocument();
    expect(
      screen.getAllByText((_, node) => node?.textContent?.includes('will preserve as a copy') === true).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('New drafts')).toBeInTheDocument();
    // New template names render inside a "New: a, b" list.
    expect(screen.getByText(/New Template/)).toBeInTheDocument();
  });

  it('recognizes a remembered mobile as a trusted sender', async () => {
    saveRememberedMobileCompanion({
      deviceId: 'mobile-1',
      name: 'Mobile A',
      platform: 'mobile',
      runtime: 'tauri',
      trusted: true,
    });

    renderDeviceLink();

    expect(await screen.findByText(/• trusted sender\./)).toBeInTheDocument();
    expect(screen.queryByText(/• untrusted sender\./)).not.toBeInTheDocument();
  });

  it('shows no preview when the companion has nothing incoming', async () => {
    mockCompanion({ incomingBundleAvailable: false });

    renderDeviceLink();

    expect((await screen.findAllByRole('heading', { name: 'Live PC Link' })).length).toBeGreaterThan(0);
    expect(screen.queryByText('Incoming Sync Preview')).not.toBeInTheDocument();
  });

  it('lists remembered senders and can untrust one from the card', async () => {
    saveRememberedMobileCompanion({
      deviceId: 'mobile-1',
      name: 'Mobile A',
      platform: 'mobile',
      runtime: 'tauri',
      trusted: true,
    });

    renderDeviceLink();

    expect(await screen.findByText('Recent Mobile Senders')).toBeInTheDocument();
    expect(screen.getByText('Mobile A')).toBeInTheDocument();
    expect(screen.getByText('Trusted')).toBeInTheDocument();
    expect(screen.getByText('mobile/tauri')).toBeInTheDocument();
    expect(screen.getByText(/Last seen /)).toBeInTheDocument();

    // Untrusting from the card flips the incoming banner for the same sender.
    fireEvent.click(screen.getByRole('button', { name: 'Untrust' }));

    expect(await screen.findByText(/• untrusted sender\./)).toBeInTheDocument();
    expect(screen.getByText('Untrusted')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trust' })).toBeInTheDocument();
  });
});
