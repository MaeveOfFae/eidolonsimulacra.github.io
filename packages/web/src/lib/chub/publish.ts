/**
 * Chub publish orchestration for the web runtime: connection testing (identity
 * verify + optional scoped-token mint) and the draft → create/update flow that
 * the publish panel drives. The gateway client itself lives in
 * `@char-gen/shared/chub`; this module only wires it to app config and drafts.
 */
import {
  ChubApiError,
  buildChubCharacterCreate,
  buildChubCharacterUpdate,
  chubActiveToken,
  chubCreateCharacter,
  chubGetCharacter,
  chubMintProjectsToken,
  chubPreflightHasErrors,
  chubResolvePublished,
  chubUpdateCharacter,
  chubVerifyIdentity,
  normalizeChubBaseUrl,
  normalizeChubPublishRecord,
  recordChubPublish,
  runChubPreflight,
  type ChubConfig,
  type ChubFetch,
  type ChubIdentity,
  type ChubPublishForm,
  type ChubPublishRecord,
  type ChubPublishedRef,
  type Draft,
} from '@char-gen/shared';
import { describeChubError, getChubFetch } from './transport';

export interface ChubConnectionTest {
  ok: boolean;
  message: string;
  identity?: ChubIdentity;
  /** Scoped projects-CRUD token minted when none is stored yet. */
  publishToken?: string;
}

/**
 * Verify the pasted token against `GET /oauth/userinfo` and (when the account has
 * no scoped token yet) mint one via `POST /account/tokens/projects`. Verification
 * always uses the pasted token — the minted one is never proof of identity.
 */
export async function testChubConnection(
  config: ChubConfig,
  fetchFn: ChubFetch = getChubFetch(),
): Promise<ChubConnectionTest> {
  const token = (config.api_token ?? '').trim();
  if (token.length === 0) {
    return { ok: false, message: 'Paste a Chub token first — see the help text below the field.' };
  }
  const options = { baseUrl: normalizeChubBaseUrl(config.base_url), token, fetchFn };
  let identity: ChubIdentity;
  try {
    identity = await chubVerifyIdentity(options);
  } catch (error) {
    return { ok: false, message: describeChubError(error) };
  }
  let publishToken: string | undefined;
  if ((config.publish_token ?? '').trim().length === 0) {
    try {
      publishToken = (await chubMintProjectsToken(options)) ?? undefined;
    } catch {
      // Minting is a convenience; publishing falls back to the pasted token.
    }
  }
  const tier = identity.subscription && identity.subscription !== 'None' ? ` · ${identity.subscription}` : '';
  const credits = typeof identity.credits === 'number' ? ` · ${identity.credits} credits` : '';
  return {
    ok: true,
    message: `Connected as ${identity.username}${tier}${credits}`,
    identity,
    ...(publishToken ? { publishToken } : {}),
  };
}

export interface ChubPublishOutcome {
  status: 'created' | 'updated';
  /** Null when a create succeeded but the new character could not be located yet. */
  record: ChubPublishRecord | null;
  message: string;
}

export interface ChubPublishOptions {
  config: ChubConfig;
  draft: Draft;
  form: ChubPublishForm;
  fetchFn?: ChubFetch;
  /** Injectable for tests; defaults to now. */
  now?: string;
}

/**
 * Publish the draft to Chub: create via `POST /api/core/characters`, or update the
 * character recorded in `metadata.chub_publish` when one exists. Throws with a
 * readable message on config/preflight/API failures; a create that succeeds but
 * cannot be resolved returns a non-throwing outcome so the user never double-posts.
 */
export async function runChubPublish(options: ChubPublishOptions): Promise<ChubPublishOutcome> {
  const { config, draft, form } = options;
  const fetchFn = options.fetchFn ?? getChubFetch();
  const now = options.now ?? new Date().toISOString();

  const username = (config.username ?? '').trim();
  const token = chubActiveToken(config);
  if (token.length === 0) {
    throw new Error('Connect your Chub account in Settings → Chub before publishing.');
  }
  if (username.length === 0) {
    throw new Error('Verify the Chub connection in Settings → Chub first — publishing needs your username.');
  }

  const source = { assets: draft.assets, characterName: draft.metadata.character_name };
  const payload = buildChubCharacterCreate(source, form);
  const issues = runChubPreflight(payload);
  if (chubPreflightHasErrors(issues)) {
    throw new Error(issues.filter((issue) => issue.severity === 'error').map((issue) => issue.message).join(' '));
  }

  const client = { baseUrl: normalizeChubBaseUrl(config.base_url), token, fetchFn };
  const existing = normalizeChubPublishRecord(draft.metadata.chub_publish);

  if (existing && typeof existing.character_id === 'number') {
    await chubUpdateCharacter(
      client,
      existing.username,
      existing.pathname,
      buildChubCharacterUpdate(source, form, existing.character_id),
    );
    const record = recordChubPublish(existing, {
      character_id: existing.character_id,
      username: existing.username,
      pathname: existing.pathname,
      full_path: existing.full_path,
      name: payload.name,
      updated_at: now,
      version: payload.version ?? '1.0',
    });
    return { status: 'updated', record, message: `Updated ${record.full_path} on Chub.` };
  }

  const result = await chubCreateCharacter(client, payload);
  let ref: ChubPublishedRef | null = null;
  try {
    ref = await chubResolvePublished(client, username, payload.name, result);
  } catch {
    ref = null;
  }
  if (!ref) {
    return {
      status: 'created',
      record: null,
      message:
        'Published to Chub, but the new character could not be located yet — search indexing can lag. Check your chub.ai profile; do not publish again in the meantime.',
    };
  }
  if (typeof ref.characterId !== 'number') {
    // The update endpoint requires the numeric id; read it from the detail page
    // when neither the create response nor the search node carried one.
    try {
      const detail = await chubGetCharacter(client, ref.full_path);
      if (typeof detail?.node.id === 'number') {
        ref = { ...ref, characterId: detail.node.id };
      }
    } catch {
      // Fall through: the record still links; republish may need a manual fix.
    }
  }
  const record = recordChubPublish(draft.metadata.chub_publish, {
    character_id: ref.characterId,
    username: ref.username,
    pathname: ref.pathname,
    full_path: ref.full_path,
    name: ref.name,
    updated_at: now,
    version: payload.version ?? '1.0',
  });
  return { status: 'created', record, message: `Published ${record.full_path} to Chub.` };
}

/** Re-export for the panel so lookup failures read like the rest of the Chub errors. */
export { ChubApiError };
