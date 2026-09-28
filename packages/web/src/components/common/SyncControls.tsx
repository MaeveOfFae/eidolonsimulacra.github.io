/**
 * Sync Controls Component
 * Reusable UI for pointing users at the local device-link bundle flow.
 */

import { Cloud, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isDesktopRuntime } from '@/lib/runtime';

interface SyncControlsProps {
  dataType: 'drafts' | 'themes' | 'templates' | 'seeds' | 'config';
  onGetLocalData?: () => Promise<unknown> | unknown;
  onApplyData?: (data: unknown) => Promise<void> | void;
  label?: string;
  compact?: boolean;
}

export default function SyncControls({ dataType, label, compact = false }: SyncControlsProps) {
  const desktopRuntime = isDesktopRuntime();
  const targetPath = desktopRuntime ? '/settings?section=sync' : '/data';
  const targetLabel = desktopRuntime ? 'Device Link' : 'Data Manager';

  if (compact) {
    return (
      <Link
        to={targetPath}
        className="inline-flex items-center gap-1 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent"
        title={`Open ${targetLabel.toLowerCase()} tools for ${label || dataType}`}
      >
        <Cloud className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border/70 bg-background/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              <span className="font-medium">Device Link</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {desktopRuntime
                ? `${label || dataType} can move through Live PC Link or manual workspace bundle files. Open Device Link when you want direct LAN pairing, preview, publish, pull, or apply flows.`
                : `${label || dataType} now moves through the workspace bundle flow. Export or import the bundle from Data Manager when you want to mirror the PC workspace to mobile or another local install.`}
            </p>
          </div>
          <Link
            to={targetPath}
            className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {desktopRuntime ? 'Open Device Link' : 'Open Data Manager'}
          </Link>
        </div>
      </div>
    </div>
  );
}
