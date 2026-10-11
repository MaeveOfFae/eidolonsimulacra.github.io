import { render, screen } from '@testing-library/react';
import type { WorldCharacterRecord, WorldRelationshipRecord } from '@char-gen/shared';
import RelationshipMap from './RelationshipMap';

function character(id: string, name: string): WorldCharacterRecord {
  return { id, worldId: 'w1', characterName: name, createdAt: '', updatedAt: '' };
}

function relationship(id: string, source: string, target: string, label: string): WorldRelationshipRecord {
  return {
    id,
    worldId: 'w1',
    sourceCharacterId: source,
    targetCharacterId: target,
    label,
    createdAt: '',
    updatedAt: '',
  };
}

describe('RelationshipMap', () => {
  it('invites the user to add characters when there are none', () => {
    render(<RelationshipMap characters={[]} relationships={[]} />);

    expect(screen.getByText('Add characters to this world to see them mapped here.')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('draws a node per character and a labelled edge per relationship', () => {
    const { container } = render(
      <RelationshipMap
        characters={[character('a', 'Alice'), character('b', 'Bob')]}
        relationships={[relationship('r1', 'a', 'b', 'ally')]}
      />,
    );

    expect(screen.getByRole('img', { name: 'Relationship map: 2 characters and 1 relationship' })).toBeInTheDocument();
    expect(container.querySelectorAll('circle')).toHaveLength(2);
    expect(container.querySelectorAll('line')).toHaveLength(1);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('ally')).toBeInTheDocument();
    expect(screen.getByText(/2 characters, 1 relationship mapped\./)).toBeInTheDocument();
  });

  it('counts relationships that reference a missing character', () => {
    render(
      <RelationshipMap
        characters={[character('a', 'Alice')]}
        relationships={[relationship('r1', 'a', 'ghost', 'haunts')]}
      />,
    );

    expect(screen.getByText(/1 relationship references a character that no longer exists\./)).toBeInTheDocument();
  });
});
