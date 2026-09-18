import { useEffect, useMemo, useState } from 'react';
import { GitCompare } from 'lucide-react';
import { getOrderedAssets, type Template } from '@char-gen/shared';
import CollapsibleSection from '../common/CollapsibleSection';

export interface TemplateComparisonPanelProps {
  templates: Template[];
  leftTemplate?: string;
  rightTemplate?: string;
}

function assetSignature(template: Template): Map<string, { required: boolean; dependsOn: string[]; blueprintFile?: string }> {
  return new Map(
    template.assets.map((asset) => [
      asset.name,
      {
        required: asset.required,
        dependsOn: asset.depends_on,
        blueprintFile: asset.blueprint_file,
      },
    ])
  );
}

export function TemplateComparisonPanel({
  templates,
  leftTemplate,
  rightTemplate,
}: TemplateComparisonPanelProps) {
  const [selectedLeft, setSelectedLeft] = useState(leftTemplate || '');
  const [selectedRight, setSelectedRight] = useState(rightTemplate || '');

  useEffect(() => {
    setSelectedLeft(leftTemplate || '');
  }, [leftTemplate]);

  useEffect(() => {
    setSelectedRight(rightTemplate || '');
  }, [rightTemplate]);

  const left = useMemo(() => templates.find((template) => template.name === selectedLeft) ?? null, [templates, selectedLeft]);
  const right = useMemo(() => templates.find((template) => template.name === selectedRight) ?? null, [templates, selectedRight]);

  const comparison = useMemo(() => {
    if (!left || !right) {
      return null;
    }

    const leftMap = assetSignature(left);
    const rightMap = assetSignature(right);
    const leftAssets = new Set(left.assets.map((asset) => asset.name));
    const rightAssets = new Set(right.assets.map((asset) => asset.name));
    const shared = [...leftAssets].filter((asset) => rightAssets.has(asset)).sort();
    const leftOnly = [...leftAssets].filter((asset) => !rightAssets.has(asset)).sort();
    const rightOnly = [...rightAssets].filter((asset) => !leftAssets.has(asset)).sort();
    const changedShared = shared.filter((asset) => {
      const leftEntry = leftMap.get(asset);
      const rightEntry = rightMap.get(asset);
      return JSON.stringify(leftEntry) !== JSON.stringify(rightEntry);
    });

    return {
      leftOrder: getOrderedAssets(left).map((asset) => asset.name),
      rightOrder: getOrderedAssets(right).map((asset) => asset.name),
      shared,
      leftOnly,
      rightOnly,
      changedShared,
      leftMap,
      rightMap,
    };
  }, [left, right]);

  return (
    <CollapsibleSection
      title="Template comparison"
      subtitle="Compare asset sets, dependency contracts, and blueprint paths"
      preview={`Left: ${selectedLeft || 'unset'} · Right: ${selectedRight || 'unset'}`}
      meta={<GitCompare className="h-4 w-4 text-primary" />}
      defaultExpanded={Boolean(selectedLeft && selectedRight)}
      className="text-sm text-muted-foreground"
      bodyClassName="space-y-4"
    >

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Left template</span>
          <select
            value={selectedLeft}
            onChange={(event) => setSelectedLeft(event.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select a template...</option>
            {templates.map((template) => (
              <option key={template.name} value={template.name}>{template.name}</option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Right template</span>
          <select
            value={selectedRight}
            onChange={(event) => setSelectedRight(event.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select a template...</option>
            {templates.map((template) => (
              <option key={template.name} value={template.name}>{template.name}</option>
            ))}
          </select>
        </label>
      </div>

      {!comparison ? (
        <div className="rounded-md border border-border p-3">
          Select two templates to compare their structure.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 grid-cols-2 xl:grid-cols-4 text-xs">
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Shared assets</div>
              <div className="mt-1">{comparison.shared.length}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Left-only assets</div>
              <div className="mt-1">{comparison.leftOnly.length}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Right-only assets</div>
              <div className="mt-1">{comparison.rightOnly.length}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Changed shared contracts</div>
              <div className="mt-1">{comparison.changedShared.length}</div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Generation order</div>
              <ol className="mt-2 space-y-1 text-xs">
                {comparison.leftOrder.map((assetName, index) => (
                  <li key={`left-${assetName}`}>{index + 1}. {assetName}</li>
                ))}
              </ol>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Generation order</div>
              <ol className="mt-2 space-y-1 text-xs">
                {comparison.rightOrder.map((assetName, index) => (
                  <li key={`right-${assetName}`}>{index + 1}. {assetName}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Left only</div>
              <div className="mt-2 break-words space-y-1 text-xs">
                {comparison.leftOnly.length === 0 ? 'None' : comparison.leftOnly.join(', ')}
              </div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Right only</div>
              <div className="mt-2 break-words space-y-1 text-xs">
                {comparison.rightOnly.length === 0 ? 'None' : comparison.rightOnly.join(', ')}
              </div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Changed shared assets</div>
              <div className="mt-2 break-words space-y-1 text-xs">
                {comparison.changedShared.length === 0 ? 'None' : comparison.changedShared.join(', ')}
              </div>
            </div>
          </div>

          {comparison.changedShared.length > 0 && (
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Shared asset contract deltas</div>
              <div className="mt-3 space-y-3 text-xs">
                {comparison.changedShared.map((assetName) => {
                  const leftEntry = comparison.leftMap.get(assetName);
                  const rightEntry = comparison.rightMap.get(assetName);
                  return (
                    <div key={assetName} className="grid gap-3 lg:grid-cols-2">
                      <div className="rounded-md border border-border bg-background/60 p-3">
                        <div className="font-medium text-foreground">{assetName} · {left?.name}</div>
                        <div className="mt-1">required: {String(leftEntry?.required ?? false)}</div>
                        <div className="mt-1">depends on: {(leftEntry?.dependsOn.length ?? 0) > 0 ? leftEntry?.dependsOn.join(', ') : 'none'}</div>
                        <div className="mt-1">blueprint: {leftEntry?.blueprintFile || 'unset'}</div>
                      </div>
                      <div className="rounded-md border border-border bg-background/60 p-3">
                        <div className="font-medium text-foreground">{assetName} · {right?.name}</div>
                        <div className="mt-1">required: {String(rightEntry?.required ?? false)}</div>
                        <div className="mt-1">depends on: {(rightEntry?.dependsOn.length ?? 0) > 0 ? rightEntry?.dependsOn.join(', ') : 'none'}</div>
                        <div className="mt-1">blueprint: {rightEntry?.blueprintFile || 'unset'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </CollapsibleSection>
  );
}

export default TemplateComparisonPanel;