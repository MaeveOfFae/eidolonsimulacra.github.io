import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, BookOpen, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { isSelfContainedDesktopRuntime } from '@/lib/runtime';
import HoverHelpPopover from '../common/HoverHelpPopover';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import WorldDetailEditorPanel from './WorldDetailEditorPanel';
import LorebookGeneratorPanel from './LorebookGeneratorPanel';

/**
 * Only what is genuinely still missing.
 *
 * This list used to advertise relationships, factions, locations, worldbook
 * generation and universe notes as "planned" — but all of them are live: the
 * editors are in the world editor on this page and the lorebook generator is
 * below it. A stale "planned" list is worse than no list, because it tells users
 * that a feature they can already use does not exist.
 */
const PLANNED_WORLD_MODULES = [
  { label: 'Canon library', icon: BookOpen },
  { label: 'Universe notes', icon: BookOpen },
  { label: 'Canon locks', icon: Lock },
] as const;

export default function Worlds() {
  const selfContainedDesktop = isSelfContainedDesktopRuntime();
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);
  const [showAuditOnly, setShowAuditOnly] = useState(false);

  const { data: worldsData, refetch: refetchWorlds } = useQuery({
    queryKey: ['worlds-list'],
    queryFn: () => api.getWorlds({ includePublic: false }),
    enabled: selfContainedDesktop,
  });
  const { data: draftListData } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
    enabled: selfContainedDesktop,
  });
  const { data: worldCharacterDraftLinksData, refetch: refetchWorldCharacterDraftLinks } = useQuery({
    queryKey: ['world-character-draft-links'],
    queryFn: () => api.getWorldCharacterDraftLinks(),
    enabled: selfContainedDesktop,
  });
  const { data: worldRelationshipAuditData, refetch: refetchWorldRelationshipAuditIssues } = useQuery({
    queryKey: ['world-relationship-audit'],
    queryFn: () => api.getWorldRelationshipAuditIssues(),
    enabled: selfContainedDesktop,
  });

  const worlds = useMemo(() => worldsData?.worlds ?? [], [worldsData?.worlds]);
  const worldCount = worlds.length;
  const totalCharacters = worlds.reduce((sum, world) => sum + (world._count?.characters ?? 0), 0);
  const totalFactions = worlds.reduce((sum, world) => sum + (world._count?.factions ?? 0), 0);
  const totalLocations = worlds.reduce((sum, world) => sum + (world._count?.locations ?? 0), 0);
  const worldCharacterDraftLinks = useMemo(
    () => worldCharacterDraftLinksData?.links ?? [],
    [worldCharacterDraftLinksData?.links],
  );
  const worldRelationshipAuditIssues = useMemo(
    () => worldRelationshipAuditData?.issues ?? [],
    [worldRelationshipAuditData?.issues],
  );
  const draftNameById = useMemo(
    () =>
      new Map(
        (draftListData?.drafts ?? []).map((draft) => [draft.review_id, draft.character_name || draft.seed] as const),
      ),
    [draftListData?.drafts],
  );
  const staleCharacterLinks = useMemo(
    () => worldCharacterDraftLinks.filter((link) => !draftNameById.has(link.draftId)),
    [draftNameById, worldCharacterDraftLinks],
  );
  const duplicateCharacterLinkGroups = useMemo(() => {
    const groupedLinks = new Map<string, typeof worldCharacterDraftLinks>();

    for (const link of worldCharacterDraftLinks) {
      const current = groupedLinks.get(link.draftId) ?? [];
      current.push(link);
      groupedLinks.set(link.draftId, current);
    }

    return [...groupedLinks.entries()]
      .filter(([, links]) => links.length > 1)
      .map(([draftId, links]) => ({
        draftId,
        draftName: draftNameById.get(draftId) ?? draftId,
        links,
      }));
  }, [draftNameById, worldCharacterDraftLinks]);
  const flaggedWorldIds = useMemo(
    () =>
      new Set([
        ...staleCharacterLinks.map((link) => link.worldId),
        ...duplicateCharacterLinkGroups.flatMap((group) => group.links.map((link) => link.worldId)),
        ...worldRelationshipAuditIssues.map((issue) => issue.worldId),
      ]),
    [duplicateCharacterLinkGroups, staleCharacterLinks, worldRelationshipAuditIssues],
  );
  const auditIssueCount =
    duplicateCharacterLinkGroups.length + staleCharacterLinks.length + worldRelationshipAuditIssues.length;
  const visibleWorlds = useMemo(
    () => (showAuditOnly ? worlds.filter((world) => flaggedWorldIds.has(world.id)) : worlds),
    [flaggedWorldIds, showAuditOnly, worlds],
  );
  const selectedWorldRecord = visibleWorlds.find((world) => world.id === selectedWorld) ?? visibleWorlds[0] ?? null;

  useEffect(() => {
    if (showAuditOnly && flaggedWorldIds.size === 0) {
      setShowAuditOnly(false);
    }
  }, [flaggedWorldIds, showAuditOnly]);

  useEffect(() => {
    if (!visibleWorlds.length) {
      return;
    }

    if (!selectedWorld || !visibleWorlds.some((world) => world.id === selectedWorld)) {
      setSelectedWorld(visibleWorlds[0].id);
    }
  }, [selectedWorld, visibleWorlds]);

  const { data: selectedWorldData, refetch: refetchSelectedWorld } = useQuery({
    queryKey: ['world-detail', selectedWorldRecord?.id],
    queryFn: () => api.getWorld(selectedWorldRecord!.id),
    enabled: Boolean(selfContainedDesktop && selectedWorldRecord?.id),
  });

  const selectedWorldDetail = selectedWorldData?.world;

  useAssistantScreenContext({
    selected_world: selectedWorldRecord?.id ?? selectedWorld,
    world_count: worldCount,
    total_characters: totalCharacters,
    total_factions: totalFactions,
    total_locations: totalLocations,
    world_link_audit_issues: auditIssueCount,
    world_link_audit_worlds: flaggedWorldIds.size,
    world_relationship_audit_issues: worldRelationshipAuditIssues.length,
  });

  return (
    <div className="app-page space-y-8 pb-10 sm:space-y-10 sm:pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Worlds</p>
            <h1 className="app-page-title">
              {selfContainedDesktop
                ? 'Worldbuilding is now locally persistent.'
                : 'Worldbuilding persistence is desktop-only.'}
            </h1>
            <p className="app-page-summary">
              {selfContainedDesktop
                ? 'Generate connected lorebook packets from saved drafts, promote them into local worlds, and keep characters, factions, locations, and timelines entirely on-device.'
                : 'Generate connected lorebook packets from existing drafts here, then open the desktop app when you want persisted worlds, factions, locations, and timelines.'}
            </p>
          </div>
          <div className="app-panel-muted p-4 sm:p-5">
            <p className="app-page-eyebrow">Status</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Availability</p>
                <div className="app-page-metric-value text-lg sm:text-2xl">Partial</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Worlds</p>
                <div className="app-page-metric-value text-2xl">{worldCount}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Modules</p>
                <div className="app-page-metric-value text-2xl">{PLANNED_WORLD_MODULES.length}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Canon Nodes</p>
                <div className="app-page-metric-value text-2xl">{totalCharacters + totalFactions + totalLocations}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-start">
        <HoverHelpPopover
          title={selfContainedDesktop ? 'Why worlds are local here' : 'Why this screen is still partial'}
          summary={
            selfContainedDesktop
              ? 'This desktop build keeps world data locally. Promote lorebook packets into worlds, then edit canon nodes and timelines without any sync server.'
              : 'Browser runtime keeps lorebook synthesis available, but persisted world editing is reserved for the desktop app where the local world store already exists.'
          }
          label="Why this screen behaves this way"
        />
      </div>

      <LorebookGeneratorPanel
        canPromote={selfContainedDesktop}
        promotionStatusMessage={
          selfContainedDesktop
            ? null
            : 'Persisted world promotion is currently desktop-only. Export a workspace bundle or open the desktop app when you want to keep world data.'
        }
        onWorldPromoted={(worldId) => {
          setSelectedWorld(worldId);
          void refetchWorlds();
          void refetchSelectedWorld();
        }}
      />

      {selfContainedDesktop && (
        <section className="app-panel p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Canon link audit</h2>
              <p className="text-sm text-muted-foreground">
                Duplicate links mean one draft is attached to multiple world characters. Stale links point at draft IDs
                that no longer exist in the local draft library. Relationship issues flag canon ties whose source or
                target character is missing.
              </p>
            </div>
            {auditIssueCount > 0 ? (
              <button
                type="button"
                onClick={() => setShowAuditOnly((current) => !current)}
                className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  showAuditOnly
                    ? 'border-primary/30 bg-primary/12 text-foreground'
                    : 'border-border/60 bg-background/60 text-muted-foreground hover:border-primary/35 hover:text-primary'
                }`}
              >
                {showAuditOnly ? 'Showing flagged worlds' : 'Show flagged worlds only'}
              </button>
            ) : null}
          </div>

          {auditIssueCount === 0 ? (
            <div className="app-note flex items-start gap-3 border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <span>No duplicate or stale draft-to-world character links or broken relationships found.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Flagged worlds
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-foreground">{flaggedWorldIds.size}</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Duplicate draft links
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-foreground">
                    {duplicateCharacterLinkGroups.length}
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Stale links
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-foreground">{staleCharacterLinks.length}</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Broken relationships
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-foreground">
                    {worldRelationshipAuditIssues.length}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <div className="space-y-3 rounded-xl border border-border/60 bg-background/40 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Duplicate draft links
                  </div>
                  {duplicateCharacterLinkGroups.length > 0 ? (
                    duplicateCharacterLinkGroups.map((group) => (
                      <div
                        key={group.draftId}
                        className="rounded-lg border border-border/50 bg-background/60 p-3 text-sm"
                      >
                        <div className="font-medium text-foreground">{group.draftName}</div>
                        <div className="mt-1 text-xs text-muted-foreground">Draft ID: {group.draftId}</div>
                        <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                          {group.links.map((link) => (
                            <div
                              key={link.characterId}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/50 bg-background/70 px-2.5 py-2"
                            >
                              <div>
                                <div className="text-foreground">{link.worldName}</div>
                                <div>
                                  {link.characterName}
                                  {link.role ? ` · ${link.role}` : ''}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedWorld(link.worldId)}
                                className="text-xs text-primary hover:underline"
                              >
                                Open world
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No duplicate draft links.</p>
                  )}
                </div>

                <div className="space-y-3 rounded-xl border border-border/60 bg-background/40 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Stale character links
                  </div>
                  {staleCharacterLinks.length > 0 ? (
                    staleCharacterLinks.map((link) => (
                      <div
                        key={link.characterId}
                        className="rounded-lg border border-border/50 bg-background/60 p-3 text-sm"
                      >
                        <div className="font-medium text-foreground">{link.worldName}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {link.characterName}
                          {link.role ? ` · ${link.role}` : ''}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">Missing draft ID: {link.draftId}</div>
                        <button
                          type="button"
                          onClick={() => setSelectedWorld(link.worldId)}
                          className="mt-2 text-xs text-primary hover:underline"
                        >
                          Open world
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No stale draft links.</p>
                  )}
                </div>

                <div className="space-y-3 rounded-xl border border-border/60 bg-background/40 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Broken relationships
                  </div>
                  {worldRelationshipAuditIssues.length > 0 ? (
                    worldRelationshipAuditIssues.map((issue) => (
                      <div
                        key={issue.relationshipId}
                        className="rounded-lg border border-border/50 bg-background/60 p-3 text-sm"
                      >
                        <div className="font-medium text-foreground">{issue.worldName}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{issue.label}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {issue.kind === 'missing-both-characters'
                            ? 'Both relationship endpoints are missing.'
                            : issue.kind === 'missing-source-character'
                              ? 'Source character is missing.'
                              : 'Target character is missing.'}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Source: {issue.sourceCharacterName ?? issue.sourceCharacterId}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Target: {issue.targetCharacterName ?? issue.targetCharacterId}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedWorld(issue.worldId)}
                          className="mt-2 text-xs text-primary hover:underline"
                        >
                          Open world
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No broken relationships.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="app-panel p-4 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Persisted worlds</h2>
            <p className="text-sm text-muted-foreground">
              {selfContainedDesktop
                ? 'Persisted world editing is available locally in the desktop app. Promote lorebook packets into worlds to start building canon records.'
                : 'Persisted worlds are not available in the browser runtime. Use the desktop app when you want local canon records and timeline editing.'}
            </p>
          </div>
          <span className="app-pill app-pill-muted">{selfContainedDesktop ? 'Local-only' : 'Desktop-only'}</span>
        </div>

        {!selfContainedDesktop ? (
          <div className="app-note p-4 text-sm text-muted-foreground">
            Persisted worlds are currently desktop-only. Generate or save lorebook packets here, then open the desktop
            app to promote them into local worlds.
          </div>
        ) : worlds.length === 0 ? (
          <div className="app-note p-4 text-sm text-muted-foreground">
            No persisted worlds yet. Promote a generated lorebook packet to create your first local world.
          </div>
        ) : showAuditOnly && visibleWorlds.length === 0 ? (
          <div className="app-note p-4 text-sm text-muted-foreground">
            No flagged worlds match the current audit filter.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-3">
              {visibleWorlds.map((world) => (
                <button
                  key={world.id}
                  type="button"
                  onClick={() => setSelectedWorld(world.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${selectedWorldRecord?.id === world.id ? 'border-primary bg-primary/10' : 'border-border bg-background/40 hover:bg-accent/40'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{world.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{world.description || 'No description yet.'}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{world._count?.characters ?? 0} chars</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {world.genre && <span className="rounded-full bg-muted px-2 py-1">{world.genre}</span>}
                    <span className="rounded-full bg-muted px-2 py-1">{world._count?.factions ?? 0} factions</span>
                    <span className="rounded-full bg-muted px-2 py-1">{world._count?.locations ?? 0} locations</span>
                    {world.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-2 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-background/40 p-4">
              <WorldDetailEditorPanel
                world={selectedWorldDetail ?? null}
                canEdit={selfContainedDesktop}
                onRefresh={async () => {
                  await refetchWorlds();
                  await refetchWorldCharacterDraftLinks();
                  await refetchWorldRelationshipAuditIssues();
                  await refetchSelectedWorld();
                }}
                onDeleted={() => {
                  setSelectedWorld(null);
                  void refetchWorlds();
                }}
              />
            </div>
          </div>
        )}
      </section>

      <section className="app-panel p-4 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Planned modules</h2>
            <p className="text-sm text-muted-foreground">
              What is still missing here, now that the world editor above covers details, characters, factions,
              locations, relationships, timelines, and events.
            </p>
          </div>
          <span className="app-pill app-pill-muted">Not live</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {PLANNED_WORLD_MODULES.map(({ label, icon: Icon }) => (
            <div key={label} className="app-panel-muted flex items-center gap-3 p-3">
              <div className="rounded-lg border border-border/60 bg-background/60 p-2 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-sm font-medium text-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
