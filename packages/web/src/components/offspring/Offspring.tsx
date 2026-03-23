import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Baby, Loader2, Users, CheckCircle } from 'lucide-react';
import type { ContentMode } from '@char-gen/shared';
import { api } from '@/lib/api';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import TraitInheritancePlaceholder from './TraitInheritancePlaceholder';
import BreedingHistoryPlaceholder from './BreedingHistoryPlaceholder';

export default function Offspring() {
  const [parent1, setParent1] = useState<string>('');
  const [parent2, setParent2] = useState<string>('');
  const [mode, setMode] = useState<ContentMode>('SFW');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [result, setResult] = useState<{ draftId: string; characterName: string } | null>(null);

  // Fetch drafts for parent selection
  const { data: draftsData, isLoading } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });

  const getParentName = (draftId: string) => {
    const draft = draftsData?.drafts.find((d) => d.review_id === draftId);
    return draft?.character_name || draftId;
  };

  useAssistantScreenContext({
    parent1_id: parent1 || null,
    parent2_id: parent2 || null,
    parent1_name: parent1 ? getParentName(parent1) : null,
    parent2_name: parent2 ? getParentName(parent2) : null,
    mode,
    is_generating: isGenerating,
    has_result: Boolean(result),
    result_character: result?.characterName ?? null,
    output_length: output.length,
    available_drafts: draftsData?.drafts.length ?? 0,
  });

  const handleGenerate = async () => {
    if (!parent1 || !parent2) return;

    setIsGenerating(true);
    setOutput('');
    setResult(null);

    try {
      const stream = api.generateOffspring({
        parent1_id: parent1,
        parent2_id: parent2,
        mode,
      });

      stream.subscribe((event) => {
        if (event.event === 'chunk' && 'content' in event.data) {
          const data = event.data as { content: string };
          setOutput((prev) => prev + data.content);
        }
        if (event.event === 'complete' && 'draft_id' in event.data) {
          const data = event.data as { draft_id?: string; character_name?: string };
          setResult({
            draftId: data.draft_id || '',
            characterName: data.character_name || 'Unknown',
          });
          setIsGenerating(false);
        }
      });

      stream.onError_((error) => {
        console.error('Offspring generation error:', error);
        setIsGenerating(false);
      });
      await stream.start();
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const modes: ContentMode[] = ['SFW', 'NSFW', 'Platform-Safe', 'Auto'];

  return (
    <div className="app-page max-w-5xl space-y-6 pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Offspring synthesis</p>
            <h1 className="app-page-title">Combine two reviewed drafts into a descendant character with inherited cues.</h1>
            <p className="app-page-summary">
              Offspring generation uses two parent drafts as source material, then streams a new character draft through the browser workflow so you can inspect lineage, review output, and continue iteration.
            </p>
          </div>

          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Generation state</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Drafts</p>
                <div className="app-page-metric-value text-2xl">{draftsData?.drafts.length ?? 0}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Mode</p>
                <div className="app-page-metric-value text-2xl">{mode}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Result</p>
                <div className="app-page-metric-value text-2xl">{result ? 'Ready' : 'Pending'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="app-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Parent 1</h2>
          </div>
          <select
            value={parent1}
            onChange={(e) => setParent1(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select parent 1...</option>
            {draftsData?.drafts
              .filter((d) => d.review_id !== parent2)
              .map((draft) => (
                <option key={draft.review_id} value={draft.review_id}>
                  {draft.character_name || draft.review_id}
                </option>
              ))}
          </select>
          {parent1 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Selected: {getParentName(parent1)}
            </p>
          )}
        </div>

        <div className="app-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-semibold">Parent 2</h2>
          </div>
          <select
            value={parent2}
            onChange={(e) => setParent2(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select parent 2...</option>
            {draftsData?.drafts
              .filter((d) => d.review_id !== parent1)
              .map((draft) => (
                <option key={draft.review_id} value={draft.review_id}>
                  {draft.character_name || draft.review_id}
                </option>
              ))}
          </select>
          {parent2 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Selected: {getParentName(parent2)}
            </p>
          )}
        </div>
      </div>

      <div className="app-panel space-y-4 p-6">
        <h2 className="text-lg font-semibold">Options</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Content Mode</label>
          <div className="flex flex-wrap gap-2">
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === m
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!parent1 || !parent2 || isGenerating}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating Offspring...
            </>
          ) : (
            <>
              <Baby className="h-5 w-5" />
              Generate Offspring
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="app-note border-green-500/50 bg-green-500/10 p-6 text-green-700 dark:text-green-400">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold text-green-500">Offspring Created!</h2>
          </div>
          <p className="text-sm mb-2">
            <strong>Character:</strong> {result.characterName}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Parents:</strong> {getParentName(parent1)} + {getParentName(parent2)}
          </p>
          <Link
            to={`/drafts/${encodeURIComponent(result.draftId)}`}
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            View Character
          </Link>
        </div>
      )}

      {output && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Generation Output</h2>
          <div className="app-panel max-h-96 overflow-auto p-4">
            <pre className="whitespace-pre-wrap text-sm">{output}</pre>
          </div>
        </div>
      )}

      {!parent1 && !parent2 && !isGenerating && (
        <div className="app-panel p-8 text-center">
          <Baby className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Select Two Parents</h3>
          <p className="text-muted-foreground">
            Choose two characters to combine their traits into a new character
          </p>
        </div>
      )}

      <section className="app-panel border-dashed p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Planned Offspring Tooling</h2>
            <p className="text-sm text-muted-foreground">
              These placeholders mark where trait inheritance and breeding chain features will attach.
            </p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Planned
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <TraitInheritancePlaceholder
            parent1Name={parent1 ? getParentName(parent1) : undefined}
            parent2Name={parent2 ? getParentName(parent2) : undefined}
          />
          <BreedingHistoryPlaceholder
            offspringId={result?.draftId}
            generation={result ? 1 : undefined}
          />
        </div>
      </section>
    </div>
  );
}
