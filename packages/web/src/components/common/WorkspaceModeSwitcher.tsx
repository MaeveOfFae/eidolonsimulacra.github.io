import { Gauge } from 'lucide-react';
import { cn } from '@/utils/cn';
import { WORKSPACE_MODES, type WorkspaceModeId } from '@/lib/navigation/workspace-modes';

interface WorkspaceModeSwitcherProps {
  /** The stored choice, or null when the mode follows whatever screen you are on. */
  explicitModeId: WorkspaceModeId | null;
  /** The mode actually in effect: the explicit choice, else the inferred one. */
  activeModeId: WorkspaceModeId | null;
  onSelect: (modeId: WorkspaceModeId | null) => void;
}

/**
 * Workspace mode control. Selecting a mode reorders the sidebar and the
 * quick-actions palette; it never hides a screen, so there is no way to switch
 * into a mode and lose access to something.
 */
export default function WorkspaceModeSwitcher({ explicitModeId, activeModeId, onSelect }: WorkspaceModeSwitcherProps) {
  const activeMode = WORKSPACE_MODES.find((mode) => mode.id === activeModeId) ?? null;

  const buttonClass = (isSelected: boolean) =>
    cn(
      'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
      isSelected
        ? 'bg-primary/15 text-foreground'
        : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
    );

  return (
    <div className="mb-2 rounded-lg border border-border/60 bg-background/30 p-1.5">
      <p className="px-1.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Workspace mode
      </p>
      <div className="grid gap-1">
        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-pressed={explicitModeId === null}
          title="Follow whichever screen you are on"
          className={buttonClass(explicitModeId === null)}
        >
          <Gauge className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">Auto</span>
        </button>
        {WORKSPACE_MODES.map((mode) => {
          const ModeIcon = mode.icon;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelect(mode.id)}
              aria-pressed={explicitModeId === mode.id}
              title={mode.description}
              className={buttonClass(explicitModeId === mode.id)}
            >
              <ModeIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{mode.label}</span>
            </button>
          );
        })}
      </div>
      {explicitModeId === null && activeMode ? (
        <p className="px-1.5 pt-1.5 text-[11px] leading-4 text-muted-foreground">
          Following this screen: {activeMode.label}
        </p>
      ) : null}
    </div>
  );
}
