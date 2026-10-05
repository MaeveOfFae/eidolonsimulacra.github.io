import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Search,
  X,
  FolderOpen,
  FileJson,
  BookOpen,
  Lightbulb,
  Package,
  Check,
} from 'lucide-react';
import type { Blueprint } from '@char-gen/shared';
import { api } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '../common/markdownComponents';
import { cn } from '../../utils/cn';
import ModalOverlay from '../common/ModalOverlay';

interface BlueprintBrowserDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (blueprint: Blueprint) => void;
  existingAssets?: string[];
}

interface TreeNode {
  id: string;
  name: string;
  type: 'category' | 'blueprint';
  children?: TreeNode[];
  blueprint?: Blueprint;
  expanded?: boolean;
}

const categoryIcons = {
  core: <BookOpen className="h-4 w-4" />,
  system: <FileJson className="h-4 w-4" />,
  template: <Package className="h-4 w-4" />,
  example: <Lightbulb className="h-4 w-4" />,
};

export default function BlueprintBrowserDialog({
  open,
  onClose,
  onSelect,
  existingAssets = [],
}: BlueprintBrowserDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['core', 'system', 'template', 'example']));
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  const { data: blueprints, isLoading } = useQuery({
    queryKey: ['blueprints'],
    queryFn: () => api.getBlueprints(),
    enabled: open,
  });

  // Build tree structure from blueprints
  useEffect(() => {
    if (!blueprints) return;

    const categories = [
      { id: 'core', name: '📋 Core Blueprints', blueprints: blueprints.core || [] },
      { id: 'system', name: '🔧 System Blueprints', blueprints: blueprints.system || [] },
      { id: 'template', name: '📦 Template Blueprints', blueprints: Object.values(blueprints.templates || {}).flat() },
      { id: 'example', name: '💡 Example Blueprints', blueprints: blueprints.examples || [] },
    ];

    const nodes: TreeNode[] = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      type: 'category',
      children: cat.blueprints.map((bp: Blueprint) => ({
        id: `${cat.id}/${bp.path}`,
        name: bp.name,
        type: 'blueprint',
        blueprint: bp,
      })),
    }));

    setTreeData(nodes);
  }, [blueprints]);

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleSelect = (blueprint: Blueprint) => {
    setSelectedBlueprint(blueprint);
  };

  const handleConfirm = () => {
    if (selectedBlueprint) {
      onSelect(selectedBlueprint);
      onClose();
      setSelectedBlueprint(null);
      setSearchQuery('');
    }
  };

  const isExistingAsset = (blueprint: Blueprint) => {
    return existingAssets.some((assetName) => assetName === blueprint.name);
  };

  const filterTree = (nodes: TreeNode[]): TreeNode[] => {
    if (!searchQuery) return nodes;

    const query = searchQuery.toLowerCase();
    return nodes.reduce((acc: TreeNode[], node) => {
      if (node.type === 'blueprint' && node.blueprint) {
        if (node.name.toLowerCase().includes(query) || node.blueprint.description.toLowerCase().includes(query)) {
          acc.push(node);
        }
      } else if (node.type === 'category' && node.children) {
        const filteredChildren = filterTree(node.children);
        if (filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
      }
      return acc;
    }, []);
  };

  const filteredTree = filterTree(treeData);

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);

    if (node.type === 'blueprint' && node.blueprint) {
      const isSelected = selectedBlueprint?.path === node.blueprint.path;
      const isExisting = isExistingAsset(node.blueprint);

      return (
        <button
          key={node.id}
          type="button"
          onClick={() => handleSelect(node.blueprint!)}
          onDoubleClick={() => {
            if (!isExisting) {
              handleSelect(node.blueprint!);
              handleConfirm();
            }
          }}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent/50',
            isSelected && 'bg-primary/20 text-primary',
            isExisting && 'cursor-not-allowed opacity-50',
          )}
          style={{ paddingLeft: `${(depth + 1) * 1.15}rem` }}
          title={isExisting ? 'This blueprint is already in use' : node.blueprint.description}
        >
          {isExisting ? (
            <X className="h-3 w-3 text-muted-foreground" />
          ) : isSelected ? (
            <Check className="h-3 w-3 text-primary" />
          ) : (
            <FileText className="h-3 w-3 text-muted-foreground" />
          )}
          <span className={cn('truncate', isExisting && 'line-through')}>{node.name}</span>
        </button>
      );
    }

    return (
      <div key={node.id}>
        <button
          type="button"
          onClick={() => toggleExpand(node.id)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-accent/50"
          style={{ paddingLeft: `${depth * 1.15 + 0.5}rem` }}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          {categoryIcons[node.id as keyof typeof categoryIcons]}
          <span>{node.name}</span>
        </button>
        {isExpanded && node.children && <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>}
      </div>
    );
  };

  if (!open) return null;

  return (
    <ModalOverlay
      onClose={onClose}
      label="Browse blueprints"
      className="z-50 flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative flex h-[min(88dvh,56rem)] w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-border bg-card/95 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border/70 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold sm:text-lg">Browse Blueprints</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Search, preview, and double-click to apply without leaving the dialog.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-border/70 px-4 py-3 sm:px-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blueprints by name or description..."
              aria-label="Search blueprints"
              className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* Content */}
        <div className="grid flex-1 min-h-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
          {/* Tree */}
          <div className="flex min-h-0 flex-col border-b border-border/70 lg:border-b-0 lg:border-r">
            <div className="border-b border-border/50 px-4 py-3 sm:px-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Blueprint tree
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
              {isLoading ? (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  Loading blueprints...
                </div>
              ) : filteredTree.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center text-sm text-muted-foreground">
                  <Search className="mb-2 h-8 w-8" />
                  <p>No blueprints found</p>
                </div>
              ) : (
                <div className="space-y-1">{filteredTree.map((node) => renderNode(node))}</div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="flex min-h-0 flex-col bg-muted/20">
            {selectedBlueprint ? (
              <>
                <div className="border-b border-border/60 px-4 py-3 sm:px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold">{selectedBlueprint.name}</h3>
                      <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">
                        {selectedBlueprint.category} / {selectedBlueprint.path}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <span className="app-pill app-pill-muted !px-2 !py-1 !text-[11px]">
                        v{selectedBlueprint.version}
                      </span>
                      {selectedBlueprint.invokable && (
                        <span className="app-pill app-pill-emerald !px-2 !py-1 !text-[11px]">Invokable</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Description
                      </label>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {selectedBlueprint.description || 'No description'}
                      </p>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Preview
                      </label>
                      <div className="rounded-lg border border-border bg-card/80 p-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {selectedBlueprint.content || '*No content*'}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    {isExistingAsset(selectedBlueprint) && (
                      <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-300">
                        This blueprint is already in use. Please select a different one.
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-sm text-muted-foreground">
                <FileText className="mb-2 h-12 w-12 opacity-50" />
                <p>Select a blueprint to preview</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-3 sm:px-5">
          <p className="text-xs text-muted-foreground">Double-click to select quickly</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="app-button app-button-secondary">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedBlueprint || isExistingAsset(selectedBlueprint)}
              className="app-button app-button-primary"
            >
              <Check className="h-4 w-4" />
              Select Blueprint
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
