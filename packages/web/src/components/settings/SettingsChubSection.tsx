import { useState } from 'react';
import { CheckCircle2, Loader2, PlugZap, XCircle } from 'lucide-react';
import { createDefaultChubConfig, parseChubTokenExpiry, type ChubConfig } from '@char-gen/shared';
import { testChubConnection, type ChubConnectionTest } from '@/lib/chub/publish';

/**
 * Settings → Chub: the account connection for publishing. Verification talks to
 * the live gateway through the runtime fetch (CORS is open), reports the account
 * it found, and — on first success — stores the minted projects-CRUD token that
 * publish calls prefer.
 */
export interface SettingsChubSectionProps {
  chub: ChubConfig | undefined;
  onChange: (updates: Partial<ChubConfig>) => void;
}

const inputClass =
  'w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function SettingsChubSection({ chub, onChange }: SettingsChubSectionProps) {
  const config = chub ?? createDefaultChubConfig();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<ChubConnectionTest | null>(null);

  const handleTest = async () => {
    setTesting(true);
    const outcome = await testChubConnection(config);
    setResult(outcome);
    if (outcome.ok && outcome.identity) {
      onChange({
        username: outcome.identity.username,
        subscription: outcome.identity.subscription ?? '',
        verified_at: new Date().toISOString(),
        ...(outcome.publishToken ? { publish_token: outcome.publishToken } : {}),
      });
    }
    setTesting(false);
  };

  const handleDisconnect = () => {
    setResult(null);
    onChange({ api_token: '', publish_token: '', username: '', subscription: '', verified_at: '' });
  };

  const verifiedAt = config.verified_at ? config.verified_at.slice(0, 10) : '';
  const tokenExpiry = parseChubTokenExpiry(config.api_token);

  return (
    <section className="app-panel p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-sky-600 to-indigo-600 p-2">
          <PlugZap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Chub</h2>
          <p className="text-sm text-muted-foreground">
            Connect your chub.ai account and publish approved drafts as characters.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="chub-token" className="mb-1 block text-sm font-medium">
            Chub token
          </label>
          <div className="flex gap-2">
            <input
              id="chub-token"
              type="password"
              autoComplete="off"
              className={inputClass}
              value={config.api_token}
              placeholder="Session token or API key"
              onChange={(event) => onChange({ api_token: event.target.value })}
            />
            <button
              type="button"
              onClick={() => void handleTest()}
              disabled={testing}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}
              Test
            </button>
            {config.username && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
              >
                Disconnect
              </button>
            )}
          </div>
          {tokenExpiry && (
            <p className={`mt-1 text-xs ${tokenExpiry.expired ? 'text-destructive' : 'text-muted-foreground'}`}>
              {tokenExpiry.expired
                ? `Session token expired ${tokenExpiry.expiresAt.toLocaleString()} — paste a fresh URQL_TOKEN from chub.ai.`
                : `Session token expires ${tokenExpiry.expiresAt.toLocaleString()}.`}
            </p>
          )}
          {result && (
            <p className={`mt-1 flex items-center gap-1 text-xs ${result.ok ? 'text-success' : 'text-destructive'}`}>
              {result.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              {result.message}
            </p>
          )}
          {config.username && !result && (
            <p className="mt-1 text-xs text-muted-foreground">
              Connected as <span className="font-medium text-foreground">{config.username}</span>
              {config.subscription ? ` · ${config.subscription}` : ''}
              {verifiedAt ? ` · verified ${verifiedAt}` : ''}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            While logged in at chub.ai, open DevTools (F12) → Application → Local Storage → <code>chub.ai</code> and
            copy the <code>URQL_TOKEN</code> value. That value is chub.ai&apos;s session token — it expires on its own
            schedule (the card above says when), so copy a fresh one whenever it does and press Test. Publishing keeps
            working in between: Test stores a scoped token the publish calls prefer, re-minted automatically if it ever
            expires. Publishing follows Chub&apos;s content rules (accurate SFW/NSFW rating; at least 3 tags for listed
            characters) and Chub&apos;s terms of service.
          </p>
        </div>

        <div>
          <label htmlFor="chub-base-url" className="mb-1 block text-sm font-medium">
            Gateway base URL
          </label>
          <input
            id="chub-base-url"
            className={inputClass}
            value={config.base_url}
            placeholder="https://gateway.chub.ai"
            onChange={(event) => onChange({ base_url: event.target.value })}
          />
        </div>
      </div>
    </section>
  );
}
