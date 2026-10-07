import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createDefaultChubConfig, type ChubConfig } from '@char-gen/shared';
import SettingsChubSection from './SettingsChubSection';
import { configManager } from '@/lib/config';
import { testChubConnection } from '@/lib/chub/publish';

vi.mock('@/lib/chub/publish', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/chub/publish')>()),
  testChubConnection: vi.fn(),
}));

const mockedTest = vi.mocked(testChubConnection);

function renderSection(config: ChubConfig = createDefaultChubConfig()) {
  const onChange = vi.fn();
  const view = render(<SettingsChubSection chub={config} onChange={onChange} />);
  return { onChange, ...view };
}

const connectedConfig = (): ChubConfig => ({
  ...createDefaultChubConfig(),
  api_token: 'sess-token',
  username: 'maeve',
  subscription: 'Full',
  verified_at: '2026-10-06T00:00:00.000Z',
});

beforeEach(() => {
  mockedTest.mockReset();
  configManager.clearAll();
});

describe('SettingsChubSection', () => {
  it('edits the token through the change callback', () => {
    const { onChange } = renderSection();
    fireEvent.change(screen.getByLabelText('Chub token'), { target: { value: 'abc' } });
    expect(onChange).toHaveBeenCalledWith({ api_token: 'abc' });
  });

  it('flags an expired session token right under the input', () => {
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const expiredJwt = `${encode({ alg: 'none' })}.${encode({ exp: Math.floor(Date.now() / 1000) - 60 })}.sig`;

    renderSection({ ...createDefaultChubConfig(), api_token: expiredJwt });

    expect(screen.getByText(/Session token expired .*paste a fresh URQL_TOKEN/i)).toBeInTheDocument();
  });

  it('shows a calm expiry notice for a still-valid session token', () => {
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const validJwt = `${encode({ alg: 'none' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;

    renderSection({ ...createDefaultChubConfig(), api_token: validJwt });

    expect(screen.getByText(/Session token expires /)).toBeInTheDocument();
    expect(screen.queryByText(/Session token expired /)).not.toBeInTheDocument();
  });

  it('runs the connection test, reports the account, and stores the identity', async () => {
    mockedTest.mockResolvedValue({
      ok: true,
      message: 'Connected as maeve · Full · 42 credits',
      identity: {
        identity: 'oid-1',
        username: 'maeve',
        scopes: [],
        credits: 42,
        subscription: 'Full',
      },
      publishToken: 'proj_abc',
    });
    const { onChange } = renderSection();

    fireEvent.click(screen.getByRole('button', { name: /^test$/i }));

    await waitFor(() => expect(screen.getByText(/Connected as maeve/)).toBeInTheDocument());
    expect(mockedTest).toHaveBeenCalledTimes(1);
    const update = onChange.mock.calls.at(-1)![0] as Partial<ChubConfig>;
    expect(update.username).toBe('maeve');
    expect(update.subscription).toBe('Full');
    expect(update.publish_token).toBe('proj_abc');
    expect(update.verified_at).toBeTruthy();
    // Verification lands in the persisted config immediately — the publish
    // panel reads configManager, not the unsaved Settings draft, so a
    // successful Test must count even without Save All Settings.
    const chub = configManager.getConfig().chub;
    expect(chub?.username).toBe('maeve');
    expect(chub?.publish_token).toBe('proj_abc');
    expect(chub?.verified_at).toBeTruthy();
  });

  it('reports a failed test without storing anything', async () => {
    mockedTest.mockResolvedValue({ ok: false, message: 'Chub rejected the token (HTTP 401).' });
    const { onChange } = renderSection();

    fireEvent.click(screen.getByRole('button', { name: /^test$/i }));

    await waitFor(() => expect(screen.getByText(/HTTP 401/)).toBeInTheDocument());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the connected summary and disconnects on demand', () => {
    configManager.updateChubConfig({ username: 'maeve', publish_token: 'proj_stored', api_token: 'sess-token' });
    const { onChange } = renderSection(connectedConfig());
    expect(screen.getByText(/Connected as/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /disconnect/i }));
    expect(onChange).toHaveBeenCalledWith({
      api_token: '',
      publish_token: '',
      username: '',
      subscription: '',
      verified_at: '',
    });
    // Disconnect persists too — otherwise the publish panel stays connected
    // until Save All Settings.
    expect(configManager.getConfig().chub?.username).toBe('');
    expect(configManager.getConfig().chub?.publish_token).toBe('');
    expect(configManager.getConfig().chub?.api_token).toBe('');
  });
});
