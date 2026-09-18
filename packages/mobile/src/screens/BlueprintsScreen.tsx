import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import type { Blueprint } from '@char-gen/shared';
import { api } from '../config/api';
import CollapsibleTray from '../components/CollapsibleTray';
import type { HomeStackNavigationProp } from '../types/navigation';

type Section = {
  title: string;
  blueprints: Blueprint[];
};

function summarizeText(content: string, maxLength = 420): string {
  const trimmed = content.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 3).trimEnd()}...`;
}

export default function BlueprintsScreen() {
  const navigation = useNavigation<HomeStackNavigationProp<'Blueprints'>>();
  const [query, setQuery] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['blueprints'],
    queryFn: () => api.getBlueprints(),
  });

  const sections = useMemo<Section[]>(() => {
    if (!data) {
      return [];
    }

    return [
      { title: 'Core Blueprints', blueprints: data.core },
      { title: 'System Blueprints', blueprints: data.system },
      { title: 'Template Blueprints', blueprints: Object.values(data.templates).flat() },
      { title: 'Example Blueprints', blueprints: data.examples },
    ];
  }, [data]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredSections = sections
    .map((section) => ({
      ...section,
      blueprints: section.blueprints.filter((blueprint) => {
        if (!normalizedQuery) {
          return true;
        }

        return (
          blueprint.name.toLowerCase().includes(normalizedQuery) ||
          blueprint.description.toLowerCase().includes(normalizedQuery) ||
          blueprint.path.toLowerCase().includes(normalizedQuery)
        );
      }),
    }))
    .filter((section) => section.blueprints.length > 0);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.statusText}>Loading blueprints...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error instanceof Error ? error.message : 'Failed to load blueprints'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Blueprints</Text>
      <Text style={styles.subtitle}>Browse generation building blocks.</Text>

      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
        placeholder="Search by name, description, or path"
        placeholderTextColor="#6b7280"
        autoCapitalize="none"
      />

      {filteredSections.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No blueprints match the current search.</Text>
        </View>
      ) : (
        filteredSections.map((section) => (
          <CollapsibleTray
            key={section.title}
            title={section.title}
            subtitle={`${section.blueprints.length} blueprint${section.blueprints.length === 1 ? '' : 's'}`}
            initiallyExpanded={Boolean(normalizedQuery || section.title === filteredSections[0]?.title)}
            preview={
              <Text style={styles.trayPreviewText} numberOfLines={1}>
                {section.blueprints.slice(0, 2).map((blueprint) => blueprint.name).join(' • ')}
                {section.blueprints.length > 2 ? ` • +${section.blueprints.length - 2} more` : ''}
              </Text>
            }
            meta={
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{section.blueprints.length}</Text>
              </View>
            }
            style={styles.sectionTray}
          >
            <View style={styles.blueprintList}>
              {section.blueprints.map((blueprint) => {
                const preview = summarizeText(blueprint.content);

                return (
                  <CollapsibleTray
                    key={blueprint.path}
                    title={blueprint.name}
                    subtitle={blueprint.description || 'No description'}
                    initiallyExpanded={Boolean(normalizedQuery)}
                    preview={
                      <View style={styles.blueprintPreviewMeta}>
                        <Text style={styles.metaText} numberOfLines={1}>{blueprint.path}</Text>
                        <Text style={styles.metaText}>v{blueprint.version}</Text>
                      </View>
                    }
                    style={styles.blueprintCard}
                  >
                    <View style={styles.previewCard}>
                      <Text style={styles.previewText}>{preview}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => navigation.navigate('BlueprintEditor', { path: blueprint.path })}
                    >
                      <Text style={styles.editButtonText}>Open Editor</Text>
                    </TouchableOpacity>
                  </CollapsibleTray>
                );
              })}
            </View>
          </CollapsibleTray>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    padding: 16,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#2f2f2f',
    borderRadius: 10,
    color: '#fff',
    padding: 12,
    fontSize: 14,
  },
  emptyCard: {
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: '#2f2f2f',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
  },
  trayPreviewText: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
  },
  section: {
    gap: 10,
  },
  sectionTray: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: '#27272a',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  countText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  blueprintList: {
    gap: 10,
  },
  blueprintCard: {
    marginBottom: 0,
  },
  blueprintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  blueprintHeaderText: {
    flex: 1,
  },
  blueprintName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  blueprintDescription: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 19,
  },
  expandText: {
    color: '#c4b5fd',
    fontSize: 12,
    fontWeight: '600',
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  blueprintPreviewMeta: {
    gap: 2,
  },
  metaText: {
    color: '#6b7280',
    fontSize: 11,
    flexShrink: 1,
  },
  previewCard: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#2f2f2f',
    borderRadius: 10,
    padding: 12,
  },
  previewText: {
    color: '#d1d5db',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  editButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  statusText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    textAlign: 'center',
  },
});