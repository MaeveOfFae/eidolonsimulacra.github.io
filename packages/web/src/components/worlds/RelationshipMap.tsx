import { useMemo } from 'react';
import type { WorldCharacterRecord, WorldRelationshipRecord } from '@char-gen/shared';
import { buildRelationshipMapLayout } from '@/lib/worlds/relationship-map';

/**
 * Relationship map: draws a world's characters as a ring of nodes with each
 * relationship as a labelled edge. Replaces the old staged placeholder.
 *
 * The layout is computed by `buildRelationshipMapLayout` (pure, tested); this
 * component only renders it. Relationships whose characters are missing are
 * counted rather than drawn, so an orphaned record never becomes a stray line.
 */

interface RelationshipMapProps {
  characters: WorldCharacterRecord[];
  relationships: WorldRelationshipRecord[];
}

const NODE_RADIUS = 20;

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default function RelationshipMap({ characters, relationships }: RelationshipMapProps) {
  const layout = useMemo(() => buildRelationshipMapLayout(characters, relationships), [characters, relationships]);
  const nodeById = useMemo(() => new Map(layout.nodes.map((node) => [node.id, node])), [layout.nodes]);

  if (layout.isEmpty) {
    return (
      <div className="app-note p-4 text-sm text-muted-foreground">
        Add characters to this world to see them mapped here.
      </div>
    );
  }

  const label = `Relationship map: ${pluralize(layout.nodes.length, 'character', 'characters')} and ${pluralize(
    layout.edges.length,
    'relationship',
    'relationships',
  )}`;

  return (
    <div className="space-y-2">
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="h-auto w-full rounded-lg border border-border/60 bg-background/40"
      >
        {layout.edges.map((edge) => {
          const source = nodeById.get(edge.sourceId);
          const target = nodeById.get(edge.targetId);
          if (!source || !target) {
            return null;
          }

          return (
            <g key={edge.id}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                className="stroke-border"
                strokeWidth={1.5}
              />
              <text x={edge.labelX} y={edge.labelY} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                {edge.label}
              </text>
            </g>
          );
        })}

        {layout.nodes.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r={NODE_RADIUS} className="fill-card stroke-border" strokeWidth={1.5} />
            <text
              x={node.x}
              y={node.y + NODE_RADIUS + 14}
              textAnchor="middle"
              className="fill-foreground text-[11px] font-medium"
            >
              {node.name}
            </text>
          </g>
        ))}
      </svg>

      <p className="text-xs text-muted-foreground">
        {pluralize(layout.nodes.length, 'character', 'characters')},{' '}
        {pluralize(layout.edges.length, 'relationship', 'relationships')} mapped.
        {layout.danglingRelationshipIds.length > 0 &&
          ` ${pluralize(layout.danglingRelationshipIds.length, 'relationship references', 'relationships reference')} a character that no longer exists.`}
        {layout.selfRelationshipIds.length > 0 &&
          ` ${pluralize(layout.selfRelationshipIds.length, 'self-referential relationship is', 'self-referential relationships are')} not drawn.`}
      </p>
    </div>
  );
}
