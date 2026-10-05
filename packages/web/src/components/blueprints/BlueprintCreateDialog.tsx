import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import ModalOverlay from '../common/ModalOverlay';

interface BlueprintCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (path: string) => void;
}

export default function BlueprintCreateDialog({ open, onClose, onSuccess }: BlueprintCreateDialogProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const sanitizedName = name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      const path = `blueprints/custom/${sanitizedName}.md`;

      const content = `---
name: ${name.trim()}
description: ${description.trim() || 'Custom blueprint'}
invokable: true
version: 1.0
---

# ${name.trim()}

${description.trim() || 'Describe this blueprint...'}

## Instructions

Add your blueprint instructions here.

## Output Format

\`\`\`
Expected output structure
\`\`\`
`;

      await api.createBlueprint(path, content);

      if (onSuccess) {
        onSuccess(path);
      } else {
        navigate(`/blueprints/edit/${encodeURIComponent(path)}`);
      }

      onClose();
      setName('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create blueprint');
    } finally {
      setIsCreating(false);
    }
  };

  if (!open) return null;

  return (
    <ModalOverlay
      onClose={onClose}
      label="Create blueprint"
      className="z-50 flex items-center justify-center"
      dismissible={!isCreating}
    >
      <div className="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Create New Blueprint</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="blueprint-name" className="block text-sm font-medium mb-1.5">
              Name *
            </label>
            <input
              type="text"
              id="blueprint-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="my_custom_blueprint"
            />
          </div>

          <div>
            <label htmlFor="blueprint-description" className="block text-sm font-medium mb-1.5">
              Description
            </label>
            <textarea
              id="blueprint-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Brief description of this blueprint..."
            />
          </div>

          <p className="text-xs text-muted-foreground">
            The blueprint will be saved to{' '}
            <code className="bg-muted px-1 rounded">
              blueprints/custom/{name.trim().toLowerCase().replace(/\s+/g, '_') || 'name'}.md
            </code>
          </p>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <button onClick={onClose} disabled={isCreating} className="app-button app-button-secondary">
            Cancel
          </button>
          <button
            onClick={() => void handleCreate()}
            disabled={isCreating || !name.trim()}
            className="app-button app-button-primary"
          >
            {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
            {isCreating ? 'Creating...' : 'Create Blueprint'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
