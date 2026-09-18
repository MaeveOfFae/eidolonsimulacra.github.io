import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { ArrowRightLeft, Copy, Loader2, ScissorsLineDashed } from 'lucide-react';
import { estimateTextStats, type OptimizeTextRequest } from '@char-gen/shared';
import { api } from '@/lib/api';
import CollapsibleSection from '../common/CollapsibleSection';
import { useAssistantScreenContext } from '../common/useAssistantContext';

export default function TokenOptimization() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [targetReduction, setTargetReduction] = useState(25);
  const [preserveFormat, setPreserveFormat] = useState(true);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState<'input' | 'output' | null>(null);
  const [applyNotice, setApplyNotice] = useState<string | null>(null);

  const sourceDraftId = searchParams.get('draft');
  const sourceAssetName = searchParams.get('asset');

  const optimizeMutation = useMutation({
    mutationFn: (request: OptimizeTextRequest) => new Promise<string>((resolve, reject) => {
      const stream = api.optimizeText(request);
      let fullContent = '';

      stream.subscribe((event) => {
        if (event.event === 'chunk' && 'content' in event.data) {
          const data = event.data as { content: string };
          fullContent += data.content;
          setOutput(fullContent);
        }

        if (event.event === 'complete' && 'content' in event.data) {
          const data = event.data as { content: string };
          const finalContent = data.content || fullContent;
          setOutput(finalContent);
          resolve(finalContent);
        }
      });

      stream.onError_((error) => reject(new Error(error)));

      void stream.start().catch(reject);
    }),
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!sourceDraftId || !sourceAssetName || !output.trim()) {
        throw new Error('No draft asset target available.');
      }

      await api.updateAsset(sourceDraftId, sourceAssetName, output.trim());
    },
    onSuccess: () => {
      setApplyNotice(`Applied optimized text to ${sourceAssetName}.`);
    },
  });

  useEffect(() => {
    const initialText = searchParams.get('text');
    if (!initialText || input.length > 0) {
      return;
    }

    setInput(initialText);
  }, [input.length, searchParams]);

  const inputStats = useMemo(() => estimateTextStats(input), [input]);
  const outputStats = useMemo(() => estimateTextStats(output), [output]);
  const tokenDelta = inputStats.estimatedTokens - outputStats.estimatedTokens;
  const tokenReductionPercent = inputStats.estimatedTokens > 0
    ? Math.round((tokenDelta / inputStats.estimatedTokens) * 100)
    : 0;

  useAssistantScreenContext({
    input_length: input.length,
    output_length: output.length,
    target_reduction: targetReduction,
    preserve_format: preserveFormat,
    is_optimizing: optimizeMutation.isPending,
    estimated_input_tokens: inputStats.estimatedTokens,
    estimated_output_tokens: outputStats.estimatedTokens,
    source_draft_id: sourceDraftId,
    source_asset_name: sourceAssetName,
  });

  const handleOptimize = () => {
    if (!input.trim() || optimizeMutation.isPending) {
      return;
    }

    setOutput('');
    optimizeMutation.mutate({
      text: input,
      target_reduction: targetReduction,
      preserve_format: preserveFormat,
    });
  };

  const handleCopy = async (value: string, source: 'input' | 'output') => {
    if (!value.trim()) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopied(source);
    window.setTimeout(() => {
      setCopied((current) => current === source ? null : current);
    }, 1500);
  };

  const handleReplaceInput = () => {
    if (!output.trim()) {
      return;
    }

    setInput(output);
    setOutput('');
    setApplyNotice(null);
  };

  const handleApplyToAsset = () => {
    if (!sourceDraftId || !sourceAssetName || !output.trim() || applyMutation.isPending) {
      return;
    }

    setApplyNotice(null);
    applyMutation.mutate();
  };

  return (
    <div className="app-page space-y-6 pb-10">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-3">
            <p className="app-page-eyebrow">Optimization</p>
            <h1 className="app-page-title">Token optimization</h1>
            <p className="app-page-summary">Shorten text aggressively without removing relevant data.</p>
          </div>

          <div className="app-panel-muted p-3.5">
            <p className="app-page-eyebrow">Estimated savings</p>
            <div className="mt-3 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Input</p>
                <div className="app-page-metric-value text-2xl">{inputStats.estimatedTokens}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Output</p>
                <div className="app-page-metric-value text-2xl">{outputStats.estimatedTokens}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Saved</p>
                <div className="app-page-metric-value text-2xl">{Math.max(0, tokenDelta)}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Reduction</p>
                <div className="app-page-metric-value text-2xl">{output ? `${Math.max(0, tokenReductionPercent)}%` : '--'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <CollapsibleSection
            title="Input"
            subtitle="Paste the text you want to compress"
            preview={input.trim() ? `${input.trim().slice(0, 120)}${input.trim().length > 120 ? '...' : ''}` : 'No text yet'}
            defaultExpanded
            className="app-panel"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>{inputStats.characters} chars • {inputStats.words} words • ~{inputStats.estimatedTokens} tokens</span>
                <button
                  type="button"
                  onClick={() => void handleCopy(input, 'input')}
                  className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                  disabled={!input.trim()}
                >
                  <Copy className="h-4 w-4" />
                  {copied === 'input' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Paste prompt, blueprint, asset text, or other content you want tightened without losing relevant information."
                className="min-h-[320px] w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Optimized output"
            subtitle="Shorter wording with relevant data preserved"
            preview={output.trim() ? `${output.trim().slice(0, 120)}${output.trim().length > 120 ? '...' : ''}` : 'No optimized output yet'}
            defaultExpanded={Boolean(output)}
            className="app-panel"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>{outputStats.characters} chars • {outputStats.words} words • ~{outputStats.estimatedTokens} tokens</span>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleReplaceInput}
                    className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                    disabled={!output.trim()}
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    Replace input
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCopy(output, 'output')}
                    className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                    disabled={!output.trim()}
                  >
                    <Copy className="h-4 w-4" />
                    {copied === 'output' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <textarea
                value={output}
                onChange={(event) => setOutput(event.target.value)}
                placeholder="Optimized text will appear here."
                className="min-h-[320px] w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </CollapsibleSection>
        </div>

        <aside className="space-y-4">
          <CollapsibleSection
            title="Controls"
            subtitle="Compression target and format handling"
            preview={`${targetReduction}% target • ${preserveFormat ? 'preserve format' : 'light reformat'}`}
            defaultExpanded
            className="app-panel"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="token-optimization-target" className="text-sm font-medium">Target reduction</label>
                <input
                  id="token-optimization-target"
                  type="range"
                  min="5"
                  max="80"
                  step="5"
                  value={targetReduction}
                  onChange={(event) => setTargetReduction(Number(event.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground">Aim for about {targetReduction}% fewer tokens if meaning can be preserved.</div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={preserveFormat}
                  onChange={(event) => setPreserveFormat(event.target.checked)}
                  className="rounded border-input"
                />
                Preserve original formatting as much as possible
              </label>

              <button
                type="button"
                onClick={handleOptimize}
                disabled={optimizeMutation.isPending || !input.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {optimizeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScissorsLineDashed className="h-4 w-4" />}
                {optimizeMutation.isPending ? 'Optimizing...' : 'Optimize text'}
              </button>

              {sourceDraftId && sourceAssetName && (
                <button
                  type="button"
                  onClick={handleApplyToAsset}
                  disabled={applyMutation.isPending || !output.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-3 text-sm font-semibold hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {applyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRightLeft className="h-4 w-4" />}
                  {applyMutation.isPending ? 'Applying...' : `Apply to ${sourceAssetName}`}
                </button>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Rules"
            subtitle="What this tool is supposed to preserve"
            preview="Shorten only"
            className="app-panel-muted"
          >
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Relevant information should stay intact.</p>
              <p>Compression should come from shorter phrasing, deduplication, and removing filler or repetition.</p>
              <p>It should not summarize away requirements, names, constraints, or other meaningful details.</p>
              <div className="rounded-lg border border-border/60 bg-background/50 px-3 py-2.5 text-xs">
                Use this for prompts, blueprints, scene text, rules, or notes when the goal is lower token usage without meaning loss.
              </div>
            </div>
          </CollapsibleSection>

          {optimizeMutation.error && (
            <div className="app-note border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {optimizeMutation.error instanceof Error ? optimizeMutation.error.message : 'Optimization failed'}
            </div>
          )}

          {applyMutation.error && (
            <div className="app-note border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {applyMutation.error instanceof Error ? applyMutation.error.message : 'Failed to apply optimized text'}
            </div>
          )}

          {applyNotice && (
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-foreground">
              {applyNotice}
            </div>
          )}

          {output && (
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-foreground">
              <div className="flex items-start gap-2">
                <ArrowRightLeft className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <div className="font-medium">Compression snapshot</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {Math.max(0, inputStats.estimatedTokens - outputStats.estimatedTokens)} estimated tokens saved.
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
