import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Palette } from 'lucide-react';
import { api } from '@/lib/api';
import { TOKENIZER_THEME_FIELDS } from '../../theme/theme';
import ThemeSelection from './ThemeSelection';

export default function TokenizerThemeStudio() {
  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: () => api.getConfig(),
  });
  const { data: themes = [] } = useQuery({
    queryKey: ['themes'],
    queryFn: () => api.getThemes(),
  });

  const activeTheme = themes.find((theme) => theme.name === config?.theme_name) ?? themes[0];

  return (
    <div className="app-page space-y-8 pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Tokenizer runtime</p>
            <h1 className="app-page-title">Tune syntax highlighting separately</h1>
            <p className="app-page-summary">
              Keep tokenizer colors on their own route so prompt and review highlighting can evolve without crowding the
              main app theme workflow.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/themes"
                className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/55 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/35 hover:text-primary"
              >
                Back to themes
              </Link>
              <Link
                to="/drafts"
                className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/55 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/35 hover:text-primary"
              >
                Open review surfaces
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Tokenizer state</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Active preset</p>
                <div className="app-page-metric-value text-xl">{activeTheme?.display_name ?? 'Loading'}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Token fields</p>
                <div className="app-page-metric-value text-2xl">{TOKENIZER_THEME_FIELDS.length}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Focus</p>
                <div className="app-page-metric-value text-xl">Review syntax</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="app-panel p-5">
          <ThemeSelection sectionFilter="tokenizer" />
        </div>

        <aside className="space-y-4">
          <div className="app-panel p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">What changes here</h2>
                <p className="text-sm text-muted-foreground">
                  Tokenizer colors affect syntax-highlighted review and prompt-editing surfaces.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>
                Use this route for bracket, pipe, asterisk, and annotation colors instead of mixing them into the main
                app palette workflow.
              </p>
              <p>
                After saving, reopen draft review or blueprint-editing surfaces if you want to inspect the live syntax
                result immediately.
              </p>
            </div>
          </div>

          <div className="app-note p-4 text-sm text-muted-foreground">
            The preset itself stays shared. Changing tokenizer colors here still updates the active theme override
            stored in runtime config.
          </div>
        </aside>
      </section>
    </div>
  );
}
