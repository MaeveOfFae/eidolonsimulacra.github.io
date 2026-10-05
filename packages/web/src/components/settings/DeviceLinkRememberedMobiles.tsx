import type { RememberedMobileCompanion } from '../../lib/desktop-companion-settings.js';

/**
 * "Recent Mobile Senders" card for the device-link settings screen.
 *
 * Extracted from `DeviceLinkSettings` (5.0 workspace-release work stream: decompose the
 * giant screens into focused, individually testable sections). Lists the mobiles the
 * desktop has seen, each with its trust badge, platform/runtime, last-seen stamp, and the
 * trust/rename/forget actions. The store writes stay in the parent, so this section takes
 * the list plus three callbacks. Behavior is pinned by `DeviceLinkSettings.test.tsx`.
 */

interface DeviceLinkRememberedMobilesProps {
  mobiles: RememberedMobileCompanion[];
  onToggleTrust: (mobile: RememberedMobileCompanion, trusted: boolean) => void;
  onRename: (mobile: RememberedMobileCompanion) => void;
  onForget: (mobile: RememberedMobileCompanion) => void;
}

export default function DeviceLinkRememberedMobiles({
  mobiles,
  onToggleTrust,
  onRename,
  onForget,
}: DeviceLinkRememberedMobilesProps) {
  return (
    <div className="rounded-md border border-border bg-background/40 p-4 text-sm text-muted-foreground">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Recent Mobile Senders</div>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {mobiles.map((mobile) => (
          <div key={mobile.deviceId} className="rounded-md border border-border/60 bg-background/70 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-foreground">{mobile.name}</div>
                <div
                  className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${mobile.trusted ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}
                >
                  {mobile.trusted ? 'Trusted' : 'Untrusted'}
                </div>
              </div>
            </div>
            <div className="mt-1 text-xs">
              {mobile.platform}/{mobile.runtime}
            </div>
            <div className="mt-1 text-xs">Last seen {new Date(mobile.lastSeenAt).toLocaleString()}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onToggleTrust(mobile, !mobile.trusted)}
                className="rounded-md border border-input px-2.5 py-1 text-xs hover:bg-accent"
              >
                {mobile.trusted ? 'Untrust' : 'Trust'}
              </button>
              <button
                type="button"
                onClick={() => onRename(mobile)}
                className="rounded-md border border-input px-2.5 py-1 text-xs hover:bg-accent"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={() => onForget(mobile)}
                className="rounded-md border border-destructive/40 px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10"
              >
                Forget
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
