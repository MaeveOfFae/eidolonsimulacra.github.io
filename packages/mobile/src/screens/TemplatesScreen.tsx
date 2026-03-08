import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';
import { StarIcon, DocumentTextIcon } from '../components/Icons';

export default function TemplatesScreen() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
  });

  const deleteMutation = useMutation({
    mutationFn: (name: string) => api.deleteTemplate(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const handleDelete = (name: string) => {
    Alert.alert(
      'Delete Template',
      `Delete "${name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(name),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (error || !templates) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading templates</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => queryClient.invalidateQueries({ queryKey: ['templates'] })}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTemplate = ({ item }: { item: typeof templates[0] }) => {
    const isExpanded = expandedId === item.name;
    const assetCount = Object.keys(item.assets || {}).length;

    return (
      <View style={styles.templateCard}>
        <TouchableOpacity
          onPress={() => setExpandedId(isExpanded ? null : item.name)}
          style={styles.templateHeader}
        >
          <View style={styles.templateInfo}>
            <View style={styles.templateNameRow}>
              <DocumentTextIcon color="#7c3aed" size={20} />
              <Text style={styles.templateName}>{item.name}</Text>
              {item.is_default && (
                <View style={styles.defaultBadge}>
                  <StarIcon color="#eab308" size={14} />
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </View>
            <Text style={styles.templateMeta}>
              {assetCount} asset{assetCount !== 1 ? 's' : ''}
              {item.description ? ` • ${item.description}` : ''}
            </Text>
          </View>
          <Text style={styles.expandIcon}>
            {isExpanded ? '−' : '+'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.templateContent}>
            <Text style={styles.assetsTitle}>Assets</Text>
            <View style={styles.assetList}>
              {Object.keys(item.assets || {}).map((assetName) => (
                <View key={assetName} style={styles.assetItem}>
                  <View style={styles.assetDot} />
                  <Text style={styles.assetName}>
                    {assetName.replace(/_/g, ' ')}
                  </Text>
                </View>
              ))}
            </View>
            {!item.is_default && (
              <TouchableOpacity
                onPress={() => handleDelete(item.name)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Delete Template</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Templates</Text>
        <Text style={styles.subtitle}>
          Character templates define the assets and structure for generation
        </Text>
      </View>

      <FlatList
        data={templates}
        keyExtractor={(item) => item.name}
        renderItem={renderTemplate}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <DocumentTextIcon color="#6b7280" size={48} />
            <Text style={styles.emptyTitle}>No templates found</Text>
            <Text style={styles.emptyText}>
              Templates will appear here once created through the web interface
            </Text>
          </View>
        }
      />
    </View>
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
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  listContent: {
    padding: 16,
  },
  templateCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2f2f2f',
    overflow: 'hidden',
  },
  templateHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateInfo: {
    flex: 1,
  },
  templateNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  templateName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#422006',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultBadgeText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '500',
  },
  templateMeta: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  expandIcon: {
    color: '#6b7280',
    fontSize: 20,
    fontWeight: '600',
  },
  templateContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#2f2f2f',
  },
  assetsTitle: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 12,
  },
  assetList: {
    gap: 8,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assetDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7c3aed',
  },
  assetName: {
    color: '#d1d5db',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  deleteButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#7f1d1d',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#fca5a5',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
