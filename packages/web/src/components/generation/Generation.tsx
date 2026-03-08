import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { api, type ContentMode } from '@char-gen/shared';

export default function Generation() {
  const [seed, setSeed] = useState('');
  const [mode, setMode] = useState<ContentMode>('SFW');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');

  const handleGenerate = async () => {
    if (!seed.trim()) return;

    setIsGenerating(true);
    setOutput('');

    const stream = api.generate({ seed, mode, stream: true });

    stream.subscribe((event) => {
      if (event.event === 'chunk' && 'content' in event.data) {
        const data = event.data as { content: string };
        setOutput((prev) => prev + data.content);
      }
    });

    stream.onError_((error) => {
      console.error('Generation error:', error);
      setIsGenerating(false);
    });

    stream.onComplete_(() => {
      setIsGenerating(false);
    });

    await stream.start();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Generate Character</h1>
        <p className="text-muted-foreground">
          Enter a seed concept to generate a complete character profile
        </p>
      </div>

      {/* Input Section */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div>
          <label className="text-sm font-medium">Seed Concept</label>
          <textarea
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="e.g., a lonely space pirate searching for redemption"
            className="mt-1.5 h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Content Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as ContentMode)}
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="SFW">SFW (Safe For Work)</option>
            <option value="NSFW">NSFW</option>
            <option value="Platform-Safe">Platform Safe</option>
            <option value="Auto">Auto</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !seed.trim()}
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {/* Output Section */}
      {output && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Output</h2>
          <div className="rounded-lg border border-border bg-card p-4">
            <pre className="whitespace-pre-wrap text-sm">{output}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
