import { Link } from 'react-router-dom';
import { BookOpen, RotateCcw } from 'lucide-react';

/**
 * Help and tutorial preferences panel for the settings screen.
 *
 * Extracted from `Settings` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). The help-state mutations
 * stay in the parent, which owns the config draft and the `configManager` calls.
 * Behavior is pinned by `SettingsHelp.test.tsx` through the parent.
 */

interface SettingsHelpSectionProps {
  showInlineTips: boolean;
  onShowInlineTipsChange: (enabled: boolean) => void;
  onRestartGettingStarted: () => void;
  onResetHelpPreferences: () => void;
}

export default function SettingsHelpSection({
  showInlineTips,
  onShowInlineTipsChange,
  onRestartGettingStarted,
  onResetHelpPreferences,
}: SettingsHelpSectionProps) {
  return (
    <section data-tour-anchor="settings-help-tutorials" className="app-panel p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 p-2">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Help and Tutorials</h2>
          <p className="text-sm text-muted-foreground">Guide and help preferences.</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-xl border border-border/50 bg-background/40 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium text-foreground">Hover help popups</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Keep contextual help available behind compact hover popups on high-friction screens like generation,
                review, export, templates, blueprints, and settings.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={showInlineTips}
                onChange={(event) => onShowInlineTipsChange(event.target.checked)}
                className="rounded border-input"
              />
              Show popups
            </label>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-border/50 bg-background/40 p-4">
            <h3 className="font-medium text-foreground">Getting Started guide</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Reopen or reset the home-screen starter guide if you want to walk through setup, generation, review, and
              export again.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/help"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <BookOpen className="h-4 w-4" />
                Open Help Center
              </Link>
              <button
                type="button"
                onClick={onRestartGettingStarted}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <RotateCcw className="h-4 w-4" />
                Restart Getting Started
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-background/40 p-4">
            <h3 className="font-medium text-foreground">Reset help state</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Restore default tutorial settings and turn first-run guidance back on for this browser profile.
            </p>
            <button
              type="button"
              onClick={onResetHelpPreferences}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Help Preferences
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
