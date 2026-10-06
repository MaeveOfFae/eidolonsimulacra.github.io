import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink, Loader2, UploadCloud } from 'lucide-react';
import {
  buildChubCharacterCreate,
  chubActiveToken,
  chubCharacterUrl,
  chubPreflightHasErrors,
  createDefaultChubConfig,
  defaultChubPublishForm,
  normalizeChubPublishRecord,
  runChubPreflight,
  type ChubPublishForm,
  type Draft,
} from '@char-gen/shared';
import { api } from '@/lib/api';
import { configManager } from '@/lib/config';
import { runChubPublish, type ChubPublishOutcome } from '@/lib/chub/publish';
import { describeChubError } from '@/lib/chub/transport';

/**
 * Review → Publish to Chub: preflight-checked create/update of the draft as a
 * chub.ai character. Gated on the character sheet's approval decision — the same
 * "only approved content flows downstream" contract the Comfy render panel keeps.
 * On success the record lands in `metadata.chub_publish`, which turns later
 * presses into updates of the same character instead of duplicates. The panel
 * pulls the draft id from the route and talks to the API directly so the
 * (line-budgeted) review screen stays untouched.
 */
export interface ChubPublishPanelProps {
  approved: boolean;
}

type PublishState =
  | { phase: 'idle' }
  | { phase: 'publishing' }
  | { phase: 'done'; outcome: ChubPublishOutcome }
  | { phase: 'error'; message: string };

const fieldClass =
  'w-full min-w-0 rounded-lg border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const labelClass = 'mb-1 block text-xs font-medium text-muted-foreground';

export default function ChubPublishPanel({ approved }: ChubPublishPanelProps) {
  const { id: reviewId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ChubPublishForm | null>(null);
  const [state, setState] = useState<PublishState>({ phase: 'idle' });

  const draftQuery = useQuery({
    queryKey: ['draft', reviewId],
    queryFn: () => api.getDraft(reviewId!),
    enabled: Boolean(reviewId),
  });
  const draft: Draft | undefined = draftQuery.data;

  // Seed the form once per draft load; later refetches must not clobber edits.
  useEffect(() => {
    if (draft && form === null) {
      setForm(defaultChubPublishForm(draft.metadata));
    }
  }, [draft, form]);

  const config = configManager.getConfig().chub ?? createDefaultChubConfig();
  const connected = chubActiveToken(config).length > 0 && config.username.trim().length > 0;
  const hasToken = chubActiveToken(config).length > 0;

  const existing = useMemo(() => (draft ? normalizeChubPublishRecord(draft.metadata.chub_publish) : null), [draft]);
  const payload = useMemo(
    () =>
      draft && form
        ? buildChubCharacterCreate({ assets: draft.assets, characterName: draft.metadata.character_name }, form)
        : null,
    [draft, form],
  );
  const issues = useMemo(() => (payload ? runChubPreflight(payload) : []), [payload]);
  const blocked = chubPreflightHasErrors(issues);

  const update = (patch: Partial<ChubPublishForm>) => {
    setForm((previous) => (previous ? { ...previous, ...patch } : previous));
  };

  const handlePublish = async () => {
    if (!draft || !form || !reviewId || state.phase === 'publishing') {
      return;
    }
    setState({ phase: 'publishing' });
    try {
      const outcome = await runChubPublish({ config, draft, form });
      if (outcome.record) {
        await api.updateMetadata(reviewId, { chub_publish: outcome.record });
        await queryClient.invalidateQueries({ queryKey: ['draft', reviewId] });
      }
      setState({ phase: 'done', outcome });
    } catch (error) {
      setState({ phase: 'error', message: describeChubError(error) });
    }
  };

  const publishLabel = existing?.character_id ? 'Update on Chub' : 'Publish to Chub';

  return (
    <section className="rounded-lg border border-border/60 bg-background/60 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <UploadCloud className="h-4 w-4 text-info" />
        <h4 className="text-sm font-semibold">Publish to Chub</h4>
        {existing && (
          <a
            href={chubCharacterUrl(existing.full_path)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-info hover:underline"
          >
            {existing.full_path}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {!hasToken && (
        <p className="text-xs text-muted-foreground">
          Connect your chub.ai account first —{' '}
          <Link to="/settings?section=chub" className="text-info hover:underline">
            Settings → Chub
          </Link>
          .
        </p>
      )}

      {hasToken && !connected && (
        <p className="text-xs text-destructive">
          The token is stored but not verified yet — run Test in{' '}
          <Link to="/settings?section=chub" className="underline">
            Settings → Chub
          </Link>{' '}
          so publishing knows your username.
        </p>
      )}

      {connected && form && payload && (
        <div className="space-y-2.5">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="chub-name">
                Name
              </label>
              <input
                id="chub-name"
                className={fieldClass}
                value={form.name}
                onChange={(event) => update({ name: event.target.value })}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="chub-tagline">
                Tagline
              </label>
              <input
                id="chub-tagline"
                className={fieldClass}
                value={form.tagline}
                onChange={(event) => update({ tagline: event.target.value })}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="chub-tags">
                Tags (comma-separated, 3+ for listed characters)
              </label>
              <input
                id="chub-tags"
                className={fieldClass}
                value={form.tags.join(', ')}
                onChange={(event) => update({ tags: event.target.value.split(',') })}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="chub-scenario">
                Scenario
              </label>
              <input
                id="chub-scenario"
                className={fieldClass}
                value={form.scenario}
                onChange={(event) => update({ scenario: event.target.value })}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="chub-rating">
                Rating
              </label>
              <select
                id="chub-rating"
                className={fieldClass}
                value={form.rating}
                onChange={(event) => update({ rating: event.target.value as ChubPublishForm['rating'] })}
              >
                <option value="SFW">SFW</option>
                <option value="NSFW">NSFW</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="chub-visibility">
                Visibility
              </label>
              <select
                id="chub-visibility"
                className={fieldClass}
                value={form.visibility}
                onChange={(event) => update({ visibility: event.target.value as ChubPublishForm['visibility'] })}
              >
                <option value="public">Listed (searchable)</option>
                <option value="unlisted">Unlisted (link-only)</option>
              </select>
            </div>
          </div>

          {issues.length > 0 && (
            <ul className="space-y-1">
              {issues.map((issue) => (
                <li
                  key={issue.code}
                  className={`text-xs ${issue.severity === 'error' ? 'text-destructive' : 'text-warning'}`}
                >
                  • {issue.message}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handlePublish()}
              disabled={!approved || blocked || state.phase === 'publishing'}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {state.phase === 'publishing' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
              {publishLabel}
            </button>
            {!approved && (
              <span className="text-xs text-muted-foreground">Approve the character sheet to enable publishing.</span>
            )}
          </div>

          {state.phase === 'error' && <p className="text-xs text-destructive">{state.message}</p>}
          {state.phase === 'done' && (
            <p className={`text-xs ${state.outcome.record ? 'text-success' : 'text-warning'}`}>
              {state.outcome.message}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
