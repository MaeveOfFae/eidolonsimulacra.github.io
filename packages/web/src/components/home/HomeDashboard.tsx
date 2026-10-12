import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { DashboardState } from '@char-gen/shared';
import { CONFIG_MANAGER_CHANGED_EVENT, configManager } from '@/lib/config/manager';
import {
  findDashboardPanel,
  isDashboardDefault,
  normalizeDashboard,
  setPanelVisibility,
  swapPanels,
  type DashboardPanelId,
} from '@/lib/dashboard';
import { cn } from '@/utils/cn';

interface HomeDashboardProps {
  /**
   * What each panel renders. A panel with nothing to render (no runs in flight, no saved
   * searches yet) is skipped whatever the stored layout says about its visibility — the
   * preference is about whether a panel belongs on your dashboard, not about whether it
   * has anything to say today.
   */
  panels: Partial<Record<DashboardPanelId, ReactNode>>;
}

const CONTROL_CLASSES =
  'inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40';

const ICON_CONTROL_CLASSES =
  'rounded-md border border-border/60 bg-background/60 p-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40';

/**
 * Home's panels, in the order the user arranged them.
 *
 * The layout lives in config (`Config.dashboard`) and is applied here rather than in Home
 * itself, so the screen keeps composing content while the frame owns order, visibility and
 * the customizer.
 *
 * Two rules this deliberately keeps:
 *
 *   - **Anything with nothing to show is skipped.** A panel that renders `null` — nothing
 *     in flight, no saved searches — leaves no gap, so the dashboard cannot open with two
 *     empty cards.
 *   - **Customizing arranges panels; it never removes a way to reach a screen.** Ordering
 *     and hiding affect these cards only, which is why the hint in customize mode says so
 *     out loud. Nothing in the app is reachable *only* from here.
 */
export default function HomeDashboard({ panels }: HomeDashboardProps) {
  const [dashboard, setDashboard] = useState<DashboardState>(() => configManager.getDashboard());
  const [isCustomizing, setIsCustomizing] = useState(false);

  // The manager owns the layout: each action writes through it, and its change event brings
  // the new order back. One source of truth, and no second copy to keep in step.
  useEffect(() => {
    const handleConfigChange = () => setDashboard(configManager.getDashboard());

    window.addEventListener(CONFIG_MANAGER_CHANGED_EVENT, handleConfigChange);
    return () => window.removeEventListener(CONFIG_MANAGER_CHANGED_EVENT, handleConfigChange);
  }, []);

  const update = useCallback((next: DashboardState) => configManager.updateDashboard(next), []);

  const shown = dashboard.panels.flatMap((panel) => {
    const definition = findDashboardPanel(panel.id);
    const content = definition ? panels[definition.id] : undefined;

    return panel.visible && definition && content ? [{ definition, content }] : [];
  });

  const hidden = dashboard.panels.flatMap((panel) => {
    const definition = findDashboardPanel(panel.id);
    return !panel.visible && definition ? [definition] : [];
  });

  const customized = !isDashboardDefault(dashboard);

  /** Steps a panel past its neighbour, naming both panels to the swap. */
  const move = (index: number, delta: number) => {
    const target = shown[index + delta];
    if (!target) {
      return;
    }

    update(swapPanels(dashboard, shown[index].definition.id, target.definition.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {isCustomizing ? (
          <p className="mr-auto max-w-xl text-xs leading-5 text-muted-foreground">
            Arrange these panels: move one up or down, or hide it. This changes the dashboard only — every screen stays
            reachable from the sidebar, the palette, and the links above.
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => setIsCustomizing((current) => !current)}
          aria-pressed={isCustomizing}
          className={CONTROL_CLASSES}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          {isCustomizing ? 'Done' : 'Customize'}
        </button>

        {customized ? (
          <button type="button" onClick={() => update(normalizeDashboard(undefined))} className={CONTROL_CLASSES}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset layout
          </button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
        {shown.map(({ definition, content }, index) => (
          <div key={definition.id} className={cn(definition.width === 'full' && 'xl:col-span-2')}>
            {isCustomizing ? (
              <div className="mb-2 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border/70 bg-background/40 px-3 py-2">
                <span className="text-xs font-medium text-foreground">{definition.title}</span>
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${definition.title} up`}
                  className={ICON_CONTROL_CLASSES}
                >
                  <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === shown.length - 1}
                  aria-label={`Move ${definition.title} down`}
                  className={ICON_CONTROL_CLASSES}
                >
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => update(setPanelVisibility(dashboard, definition.id, false))}
                  aria-label={`Hide ${definition.title}`}
                  className={ICON_CONTROL_CLASSES}
                >
                  <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : null}

            {content}
          </div>
        ))}
      </div>

      {isCustomizing && hidden.length > 0 ? (
        <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Hidden panels</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {hidden.map((definition) => (
              <button
                key={definition.id}
                type="button"
                onClick={() => update(setPanelVisibility(dashboard, definition.id, true))}
                aria-label={`Show ${definition.title}`}
                className={CONTROL_CLASSES}
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                {definition.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/70 bg-background/40 p-6 text-sm text-muted-foreground">
          There is nothing on the dashboard right now.
        </p>
      ) : null}
    </div>
  );
}
