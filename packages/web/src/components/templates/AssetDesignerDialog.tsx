import { useState, useEffect } from 'react';
import { X, Check, FolderOpen, Edit3, Plus } from 'lucide-react';
import { type AssetDefinition, type Blueprint } from '@char-gen/shared';
import BlueprintBrowserDialog from '../blueprints/BlueprintBrowserDialog';
import ModalOverlay from '../common/ModalOverlay';
import { cn } from '../../utils/cn';

interface AssetDesignerDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (asset: AssetDefinition, blueprintContent: string) => void;
  asset?: AssetDefinition;
  blueprintContent?: string;
  existingAssets?: string[];
}

const IMPORT_ALIAS_GROUPS = [
  {
    title: 'Core card fields',
    aliases: ['description', 'first_mes', 'mes_example', 'system_prompt', 'personality', 'scenario', 'creator_notes'],
  },
  {
    title: 'Card metadata',
    aliases: ['avatar', 'creator', 'character_version', 'alternate_greetings', 'character_book'],
  },
  {
    title: 'Nested extension paths',
    aliases: ['extensions.chub', 'extensions.chub.full_path', 'extensions.depth_prompt', 'lorebook', 'world_info'],
  },
] as const;

function parseImportAliases(value: string): string[] {
  return value
    .split(',')
    .map((alias) => alias.trim())
    .filter((alias) => alias.length > 0);
}

export default function AssetDesignerDialog({
  open,
  onClose,
  onSave,
  asset,
  blueprintContent,
  existingAssets = [],
}: AssetDesignerDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [required, setRequired] = useState(true);
  const [blueprintSource, setBlueprintSource] = useState<'browse' | 'custom' | 'new'>('browse');
  const [customBlueprint, setCustomBlueprint] = useState('');
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [showBlueprintBrowser, setShowBlueprintBrowser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dependsOn, setDependsOn] = useState<string[]>([]);
  const [importAliases, setImportAliases] = useState('');
  const [blueprintContentValue, setBlueprintContentValue] = useState('');

  // Initialize with existing asset data
  useEffect(() => {
    if (asset) {
      setName(asset.name);
      setDescription(asset.description);
      setRequired(asset.required);
      setDependsOn(asset.depends_on || []);
      setImportAliases((asset.import_aliases ?? []).join(', '));
      setBlueprintContentValue(blueprintContent || '');
      if (asset.blueprint_file) {
        setCustomBlueprint(asset.blueprint_file);
        setBlueprintSource('custom');
      }
    } else {
      // Reset for new asset
      setName('');
      setDescription('');
      setRequired(true);
      setBlueprintSource('browse');
      setCustomBlueprint('');
      setSelectedBlueprint(null);
      setDependsOn([]);
      setImportAliases('');
      setBlueprintContentValue('');
    }
  }, [asset, blueprintContent, open]);

  const validateName = (value: string): string | null => {
    if (!value.trim()) return 'Asset name is required';
    if (!/^[a-z_][a-z0-9_]*$/i.test(value)) {
      return 'Name must start with letter or underscore and contain only letters, numbers, and underscores';
    }
    if (existingAssets.includes(value) && (!asset || asset.name !== value)) {
      return 'An asset with this name already exists';
    }
    return null;
  };

  const getBlueprintPath = (): string | undefined => {
    switch (blueprintSource) {
      case 'browse':
        return selectedBlueprint?.path;
      case 'custom':
        return customBlueprint || undefined;
      case 'new':
        return undefined;
    }
  };

  const handleSave = () => {
    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    setError(null);

    const newAsset: AssetDefinition = {
      name: name.trim(),
      description: description.trim(),
      required,
      depends_on: dependsOn,
      blueprint_file: getBlueprintPath(),
      import_aliases: importAliases
        .split(',')
        .map((alias) => alias.trim())
        .filter((alias) => alias.length > 0),
    };

    onSave(newAsset, blueprintContentValue);

    // Reset form for next use
    if (!asset) {
      setName('');
      setDescription('');
      setRequired(true);
      setBlueprintSource('browse');
      setCustomBlueprint('');
      setSelectedBlueprint(null);
      setDependsOn([]);
      setImportAliases('');
      setBlueprintContentValue('');
    }
  };

  const handleBlueprintSelected = (blueprint: Blueprint) => {
    setSelectedBlueprint(blueprint);
    setBlueprintContentValue(blueprint.content || '');
    setShowBlueprintBrowser(false);
  };

  const toggleDependency = (dep: string) => {
    setDependsOn((prev) => (prev.includes(dep) ? prev.filter((d) => d !== dep) : [...prev, dep]));
  };

  const currentImportAliases = parseImportAliases(importAliases);

  const addImportAlias = (alias: string) => {
    const normalizedAliases = parseImportAliases(importAliases);
    if (normalizedAliases.includes(alias)) {
      return;
    }

    setImportAliases([...normalizedAliases, alias].join(', '));
  };

  if (!open) return null;

  return (
    <>
      <BlueprintBrowserDialog
        open={showBlueprintBrowser}
        onClose={() => setShowBlueprintBrowser(false)}
        onSelect={handleBlueprintSelected}
        existingAssets={[]}
      />

      <ModalOverlay
        onClose={onClose}
        label={asset ? 'Edit asset' : 'Add asset'}
        className="z-50 flex items-center justify-center"
      >
        <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">{asset ? 'Edit Asset' : 'Add Asset'}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Asset Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Asset Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="e.g., character_background"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">Use lowercase with underscores (snake_case)</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this asset"
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Required */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className="rounded border-input"
              />
              This asset is required for the template
            </label>

            {/* Blueprint Source */}
            <div>
              <label className="block text-sm font-medium mb-2">Blueprint Source</label>
              <div className="space-y-2">
                {/* Browse Option */}
                <button
                  onClick={() => {
                    setBlueprintSource('browse');
                    setShowBlueprintBrowser(true);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left',
                    blueprintSource === 'browse' ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent',
                  )}
                >
                  <FolderOpen className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">Browse Blueprints</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedBlueprint ? `Selected: ${selectedBlueprint.name}` : 'Select from available blueprints'}
                    </div>
                  </div>
                  <span className="app-button app-button-secondary !px-3 !py-1.5 !text-xs">Browse</span>
                </button>

                {/* Custom Option */}
                <button
                  onClick={() => setBlueprintSource('custom')}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left',
                    blueprintSource === 'custom' ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent',
                  )}
                >
                  <Edit3 className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">Custom Blueprint</div>
                    <div className="text-xs text-muted-foreground">Enter blueprint filename manually</div>
                  </div>
                </button>

                {blueprintSource === 'custom' && (
                  <input
                    type="text"
                    value={customBlueprint}
                    onChange={(e) => setCustomBlueprint(e.target.value)}
                    placeholder="e.g., assets/character_sheet.md"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-2"
                  />
                )}

                {/* New Option */}
                <button
                  onClick={() => setBlueprintSource('new')}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left opacity-75',
                    blueprintSource === 'new' ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent',
                  )}
                >
                  <Plus className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">Create New Blueprint</div>
                    <div className="text-xs text-muted-foreground">
                      Create a new blueprint from scratch (coming soon)
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Dependencies */}
            {existingAssets.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Dependencies (assets that must be generated first)
                </label>
                <div className="space-y-1">
                  {existingAssets
                    .filter((a) => a !== asset?.name && a !== name)
                    .map((assetName) => (
                      <label key={assetName} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={dependsOn.includes(assetName)}
                          onChange={() => toggleDependency(assetName)}
                          className="rounded border-input"
                        />
                        <span className="capitalize">{assetName.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">Import Aliases</label>
              <input
                type="text"
                value={importAliases}
                onChange={(e) => setImportAliases(e.target.value)}
                placeholder="e.g., creator_notes, character_book, extensions.chub.full_path"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional external field names to map into this asset when importing character cards for this template.
              </p>

              <div className="mt-3 rounded-lg border border-border/60 bg-background/40 p-3 space-y-3">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Common Import Fields
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Click a field to add it. Aliases are matched in order, and dot paths let you target nested Chub
                    metadata.
                  </p>
                </div>

                {IMPORT_ALIAS_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-2">
                    <div className="text-xs font-medium text-foreground">{group.title}</div>
                    <div className="flex flex-wrap gap-2">
                      {group.aliases.map((alias) => {
                        const selected = currentImportAliases.includes(alias);

                        return (
                          <button
                            key={alias}
                            type="button"
                            onClick={() => addImportAlias(alias)}
                            disabled={selected}
                            className={cn(
                              'rounded-full border px-2.5 py-1 text-[11px] font-mono transition-colors',
                              selected
                                ? 'border-primary/40 bg-primary/10 text-primary'
                                : 'border-border bg-background text-muted-foreground hover:border-primary/35 hover:text-foreground',
                            )}
                            title={selected ? 'Already added' : `Add ${alias}`}
                          >
                            {alias}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Blueprint Content</label>
              <textarea
                value={blueprintContentValue}
                onChange={(e) => setBlueprintContentValue(e.target.value)}
                placeholder="Paste or edit the blueprint content that should be saved with this template asset"
                rows={12}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This content is saved into the template's assets directory and used by the template editor flow.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t border-border">
            <button onClick={onClose} className="app-button app-button-secondary">
              Cancel
            </button>
            <button onClick={handleSave} disabled={!name.trim()} className="app-button app-button-primary">
              <Check className="h-4 w-4" />
              {asset ? 'Update' : 'Add'} Asset
            </button>
          </div>
        </div>
      </ModalOverlay>
    </>
  );
}
