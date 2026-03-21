import { Globe, Search, TrendingUp, Clock, Star, Users } from 'lucide-react';

export default function ThemeBrowserPlaceholder() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Theme Browser</h2>
        <p className="text-sm text-muted-foreground">
          Browse and discover themes shared by the community.
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
          <Globe className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Community Theme Browser</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Browse, search, and download themes created by other users.
          Share your own custom themes with the community.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
          <Star className="h-4 w-4" />
          Coming Soon
        </div>
      </div>

      {/* Feature Preview */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Search className="h-5 w-5 text-blue-500" />
            </div>
            <h4 className="font-medium">Search & Filter</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Find themes by name, tags, author, or color palette.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h4 className="font-medium">Trending Themes</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Discover the most popular and highly-rated themes.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <h4 className="font-medium">Recent Uploads</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            See the latest themes added by the community.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <h4 className="font-medium">Share Your Themes</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Publish your custom themes for others to use and enjoy.
          </p>
        </div>
      </div>

      {/* Mock Theme Grid */}
      <div>
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
          Preview Gallery
        </h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card overflow-hidden opacity-60"
            >
              <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted/50 rounded w-1/2" />
                <div className="h-3 bg-muted/30 rounded w-3/4" />
                <div className="flex gap-2 mt-3">
                  <div className="h-5 w-5 rounded-full bg-muted/40" />
                  <div className="h-5 w-5 rounded-full bg-muted/40" />
                  <div className="h-5 w-5 rounded-full bg-muted/40" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
