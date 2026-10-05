/** Config for splitting `shared/src/help.ts` (1,298 lines). */
import { split } from '../../tools/generation/split-source.mjs';

const result = split({
  source: 'packages/shared/src/help.ts',
  dir: 'packages/shared/src/help',
  barrelDoc: `/**
 * Help content and the lookups over it: the getting-started guide, the topics, the
 * guided tours, the per-page entries and the route-coverage manifests.
 *
 * This module is now a barrel: the content lives in \`./help/\`, split into the types,
 * the guide and topic content, the tours, the per-page entries, and the lookups and
 * validators. The export list is pinned by \`help.test.ts\`, because twenty-one modules
 * import this path through the package root.
 */
`,
  modules: [
    {
      file: 'types.ts',
      from: 1,
      to: 79,
      doc: 'The vocabulary of the help system: the tour and guide ids, and the record shapes the content and the lookups use.',
    },
    {
      file: 'guides.ts',
      from: 80,
      to: 214,
      doc: 'The getting-started steps, the help topics, and the category order the help centre renders.',
    },
    {
      file: 'tours.ts',
      from: 215,
      to: 611,
      doc: 'The guided tours: for each one, its steps, the route it belongs to, and its target catalog.',
    },
    {
      file: 'pages.ts',
      from: 612,
      to: 1197,
      doc: 'Per-page help and the route-coverage manifests, plus the guided-tour target catalog.',
    },
    {
      file: 'lookup.ts',
      from: 1198,
      to: 1298,
      doc: 'The lookups and validators over the content: page help for a path, a tour by id, whether a step is active, and the coverage and configuration checks.',
    },
  ],
});

console.log(`help.ts: ${result.exports} exports`);
for (const file of result.files) {
  console.log(`  ${file}`);
}
