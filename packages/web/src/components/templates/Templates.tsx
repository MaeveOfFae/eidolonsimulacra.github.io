import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Star, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@char-gen/shared';

export default function Templates() {
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
  });

  const deleteMutation = useMutation({
    mutationFn: (name: string) => api.deleteTemplate(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const toggleExpand = (name: string) => {
    setExpandedTemplate(expandedTemplate === name ? null : name);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading templates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        Error loading templates: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Manage character generation templates
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Create Template
        </button>
      </div>

      {/* Template List */}
      <div className="space-y-3">
        {templates?.map((template) => (
          <div
            key={template.name}
            className="rounded-lg border border-border bg-card overflow-hidden"
          >
            {/* Header */}
            <button
              onClick={() => toggleExpand(template.name)}
              className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{template.name}</span>
                    {template.is_official && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {template.description || `${template.assets.length} assets`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">v{template.version}</span>
                {expandedTemplate === template.name ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Expanded Content */}
            {expandedTemplate === template.name && (
              <div className="border-t border-border p-4 space-y-4">
                {/* Assets */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Assets ({template.assets.length})</h3>
                  <div className="space-y-2">
                    {template.assets.map((asset) => (
                      <div
                        key={asset.name}
                        className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className={asset.required ? 'text-primary' : 'text-muted-foreground'}>
                            {asset.name}
                          </span>
                          {asset.depends_on.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              (depends: {asset.depends_on.join(', ')})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {asset.required && (
                            <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                              required
                            </span>
                          )}
                          {asset.blueprint_file && (
                            <span className="text-xs text-muted-foreground">
                              {asset.blueprint_file}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {!template.is_official && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (confirm(`Delete template "${template.name}"?`)) {
                          deleteMutation.mutate(template.name);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="inline-flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Template
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {templates?.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No templates yet</h3>
          <p className="text-muted-foreground">
            Create your first template to customize character generation
          </p>
        </div>
      )}
    </div>
  );
}
