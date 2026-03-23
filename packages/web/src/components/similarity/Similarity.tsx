import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { GitCompare, Loader2, Users, AlertCircle, CheckCircle } from 'lucide-react';
import type { SimilarityResult } from '@char-gen/shared';
import { api } from '@/lib/api';
import { useAssistantScreenContext } from '../common/useAssistantContext';
import ClusteringPlaceholder from './ClusteringPlaceholder';
import RelationshipGraphPlaceholder from './RelationshipGraphPlaceholder';

export default function Similarity() {
  const [searchParams] = useSearchParams();
  const [character1, setCharacter1] = useState<string>('');
  const [character2, setCharacter2] = useState<string>('');
  const [includeLLM, setIncludeLLM] = useState(false);
  const [result, setResult] = useState<SimilarityResult | null>(null);

  // Fetch drafts for selection
  const { data: draftsData, isLoading } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });

  useEffect(() => {
    const nextCharacter1 = searchParams.get('character1');
    const nextCharacter2 = searchParams.get('character2');

    if (nextCharacter1) {
      setCharacter1(nextCharacter1);
    }
    if (nextCharacter2) {
      setCharacter2(nextCharacter2);
    }
  }, [searchParams]);

  // Compare mutation
  const compareMutation = useMutation({
    mutationFn: () => api.analyzeSimilarity({
      draft1_id: character1,
      draft2_id: character2,
      include_llm_analysis: includeLLM,
    }),
    onSuccess: (data) => {
      setResult(data);
    },
  });

  useAssistantScreenContext({
    character1_id: character1 || null,
    character2_id: character2 || null,
    include_llm: includeLLM,
    is_comparing: compareMutation.isPending,
    has_result: Boolean(result),
    overall_score: result?.overall_score ?? null,
    compatibility: result?.compatibility ?? null,
    commonality_count: result?.commonalities.length ?? 0,
    difference_count: result?.differences.length ?? 0,
  });

  const handleCompare = () => {
    if (!character1 || !character2) return;
    setResult(null);
    compareMutation.mutate();
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.75) return 'text-green-500';
    if (score >= 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getCompatibilityColor = (compat: string) => {
    switch (compat) {
      case 'high': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-orange-500/20 text-orange-400';
      case 'conflict': return 'bg-red-500/20 text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="app-page space-y-6 pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Comparative analysis</p>
            <h1 className="app-page-title">Measure how two reviewed drafts align, clash, or reinforce each other.</h1>
            <p className="app-page-summary">
              Similarity analysis compares structural and thematic overlap between two characters, then optionally adds an LLM-assisted relationship read for story hooks, conflict areas, and synergy.
            </p>
          </div>

          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Comparison state</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Drafts</p>
                <div className="app-page-metric-value text-2xl">{draftsData?.drafts.length ?? 0}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">LLM Read</p>
                <div className="app-page-metric-value text-2xl">{includeLLM ? 'On' : 'Off'}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Result</p>
                <div className="app-page-metric-value text-2xl">{result ? `${(result.overall_score * 100).toFixed(0)}%` : 'None'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="app-panel space-y-6 p-6">
        <div className="grid gap-6 md:grid-cols-2">
        {/* Character 1 */}
          <div className="space-y-2">
          <label className="text-sm font-medium">Character 1</label>
          <select
            value={character1}
            onChange={(e) => setCharacter1(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select a character...</option>
            {draftsData?.drafts.map((draft) => (
              <option key={draft.review_id} value={draft.review_id}>
                {draft.character_name || draft.seed}
              </option>
            ))}
          </select>
        </div>

        {/* Character 2 */}
          <div className="space-y-2">
          <label className="text-sm font-medium">Character 2</label>
          <select
            value={character2}
            onChange={(e) => setCharacter2(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select a character...</option>
            {draftsData?.drafts.map((draft) => (
              <option key={draft.review_id} value={draft.review_id}>
                {draft.character_name || draft.seed}
              </option>
            ))}
          </select>
        </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeLLM}
              onChange={(e) => setIncludeLLM(e.target.checked)}
              className="rounded border-input"
            />
            Include LLM-powered deep analysis
          </label>

          <button
            onClick={handleCompare}
            disabled={!character1 || !character2 || compareMutation.isPending}
            className="ml-auto flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {compareMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GitCompare className="h-4 w-4" />
            )}
            Compare
          </button>
        </div>
      </div>

      {compareMutation.isError && (
        <div className="app-note flex items-center gap-2 border-destructive bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          {compareMutation.error?.message || 'Failed to compare characters'}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="app-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {result.character1_name} vs {result.character2_name}
              </h2>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${getCompatibilityColor(result.compatibility)}`}>
                {result.compatibility} compatibility
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(result.overall_score)}`}>
                  {(result.overall_score * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Similarity</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(1 - result.conflict_potential)}`}>
                  {(result.conflict_potential * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Conflict Potential</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(result.synergy_potential)}`}>
                  {(result.synergy_potential * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Synergy Potential</div>
              </div>
            </div>
          </div>

          {/* Commonalities & Differences */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="app-panel p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Commonalities
              </h3>
              {result.commonalities.length > 0 ? (
                <ul className="space-y-2">
                  {result.commonalities.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No significant commonalities found</p>
              )}
            </div>

            <div className="app-panel p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Differences
              </h3>
              {result.differences.length > 0 ? (
                <ul className="space-y-2">
                  {result.differences.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No significant differences found</p>
              )}
            </div>
          </div>

          {/* Relationship Suggestions */}
          {result.relationship_suggestions.length > 0 && (
            <div className="app-panel p-6">
              <h3 className="font-semibold mb-4">Relationship Suggestions</h3>
              <ul className="space-y-2">
                {result.relationship_suggestions.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </div>
          )}

          {result.llm_analysis && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="app-panel p-6">
                <h3 className="font-semibold mb-4">LLM Relationship Read</h3>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {result.llm_analysis.relationship_potential}
                </p>
              </div>

              <div className="app-panel space-y-4 p-6">
                <div>
                  <h3 className="font-semibold mb-2">Story Hooks</h3>
                  <ul className="space-y-2">
                    {result.llm_analysis.story_hooks.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Conflict Areas</h4>
                    <ul className="space-y-1">
                      {result.llm_analysis.conflict_areas.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Synergy Areas</h4>
                    <ul className="space-y-1">
                      {result.llm_analysis.synergy_areas.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!result && !compareMutation.isPending && (
        <div className="app-panel p-8 text-center">
          <GitCompare className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Select Two Characters</h3>
          <p className="text-muted-foreground">
            Choose two characters from your drafts to analyze their similarities and potential relationships
          </p>
        </div>
      )}

      <section className="app-panel border-dashed p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Planned Similarity Tooling</h2>
            <p className="text-sm text-muted-foreground">
              These placeholders mark where clustering and relationship graph features will attach.
            </p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Planned
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ClusteringPlaceholder
            draftIds={draftsData?.drafts.map(d => d.review_id) ?? []}
          />
          <RelationshipGraphPlaceholder
            characterCount={draftsData?.drafts.length ?? 0}
            relationshipCount={result ? 1 : 0}
          />
        </div>
      </section>
    </div>
  );
}
