/** Config for splitting `mobile/src/local/api.ts` (1,665 lines). */
import { split } from '../../tools/generation/split-source.mjs';

const result = split({
  source: 'packages/mobile/src/local/api.ts',
  dir: 'packages/mobile/src/local/api',
  extension: '',
  keep: { from: 872, to: 1665 },
  modules: [
    {
      file: 'stream-types.ts',
      from: 97,
      to: 121,
      doc: 'The shape of a streamed event and the reader callback the client hands to the stream helpers.',
    },
    {
      file: 'config.ts',
      from: 122,
      to: 254,
      doc: 'Model-cache and provider configuration: the cache and its TTL, the export presets, the prompt-size limits, and resolution of the configured provider, key, base URL and engine.',
    },
    {
      file: 'prompts.ts',
      from: 255,
      to: 571,
      doc: 'Prompt assembly: reference context, prior assets, imported source, and the per-asset, seed, similarity, offspring and chat message builders.',
    },
    {
      file: 'streaming.ts',
      from: 572,
      to: 871,
      doc: 'Running a completion on the device: the timeout, the streaming-unsupported fallback, content collection, the generation runner, and the LocalStream reader.',
    },
  ],
});

console.log(`local/api.ts: ${result.exports} exports, ${result.kept}`);
for (const file of result.files) {
  console.log(`  ${file}`);
}
