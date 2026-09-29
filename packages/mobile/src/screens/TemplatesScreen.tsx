import { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ThemeColors } from '@char-gen/shared';
import { api } from '../config/api';
import CollapsibleTray from '../components/CollapsibleTray';
import { StarIcon, DocumentTextIcon } from '../components/Icons';
import { useTheme } from '../theme/ThemeProvider';
import { getErrorMessage } from '../utils/errors';
import { pickTextFile, saveDownload } from '../utils/file-transfer';

export default function TemplatesScreen() {
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);

  const {
    data: templates,
    isLoading,
    error,
  } = useQuery({
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
    Alert.alert('Delete Template', `Delete "${name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(name),
      },
    ]);
  };

  const handleImport = async () => {
    try {
      const file = await pickTextFile(['application/json', 'text/plain']);
      if (!file) {
        return;
      }

      const template = await api.importTemplateFromText(file.contents, file.name);
      await queryClient.invalidateQueries({ queryKey: ['templates'] });
      Alert.alert('Template imported', `Imported template ${template.name} from ${file.name}.`);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to import template'));
    }
  };

  const handleExport = async (name: string) => {
    try {
      const download = await api.exportTemplate(name);
      const result = await saveDownload(download, `${name}.json`);
      if (!result.saved) {
        return;
      }

      Alert.alert('Template exported', `Prepared ${name} as a JSON file. Save it from the system share sheet.`);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to export template'));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
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

  const renderTemplate = ({ item }: { item: (typeof templates)[0] }) => {
    const assetCount = item.assets.length;
    const assetPreview = item.assets
      .slice(0, 3)
      .map((asset) => asset.name.replace(/_/g, ' '))
      .join(' • ');

    return (
      <CollapsibleTray
        title={item.name}
        subtitle={item.description || 'No description'}
        initiallyExpanded={item.is_default}
        preview={
          <Text style={styles.templatePreview} numberOfLines={1}>
            {assetCount} asset{assetCount !== 1 ? 's' : ''}
            {assetPreview ? ` • ${assetPreview}` : ''}
            {assetCount > 3 ? ` • +${assetCount - 3} more` : ''}
          </Text>
        }
        meta={
          item.is_default ? (
            <View style={styles.defaultBadge}>
              <StarIcon color={colors.warning_text} size={14} />
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          ) : undefined
        }
        style={styles.templateCard}
        contentStyle={styles.templateContent}
      >
        <Text style={styles.assetsTitle}>Assets</Text>
        <View style={styles.assetList}>
          {item.assets.map((asset) => (
            <View key={asset.name} style={styles.assetItem}>
              <View style={styles.assetDot} />
              <Text style={styles.assetName}>{asset.name.replace(/_/g, ' ')}</Text>
            </View>
          ))}
        </View>
        <View style={styles.templateActions}>
          <TouchableOpacity onPress={() => void handleExport(item.name)} style={styles.exportButton}>
            <Text style={styles.exportButtonText}>Export Template</Text>
          </TouchableOpacity>
          {!item.is_default && (
            <TouchableOpacity onPress={() => handleDelete(item.name)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete Template</Text>
            </TouchableOpacity>
          )}
        </View>
      </CollapsibleTray>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Templates</Text>
        <Text style={styles.subtitle}>Asset sets and generation structure.</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionSecondary} onPress={() => void handleImport()}>
            <Text style={styles.headerActionSecondaryText}>Import template</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={templates}
        keyExtractor={(item) => item.name}
        renderItem={renderTemplate}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <DocumentTextIcon color={colors.muted_text} size={48} />
            <Text style={styles.emptyTitle}>No templates found</Text>
            <Text style={styles.emptyText}>Templates added on this device will appear here.</Text>
          </View>
        }
      />
    </View>
  );
}

function buildStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted_text,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    headerActionSecondary: {
      alignSelf: 'flex-start',
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    headerActionSecondaryText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    listContent: {
      padding: 16,
    },
    templateCard: {
      marginBottom: 12,
    },
    templatePreview: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 18,
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
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    defaultBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.window,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
    },
    defaultBadgeText: {
      color: colors.warning_text,
      fontSize: 11,
      fontWeight: '500',
    },
    templateMeta: {
      color: colors.muted_text,
      fontSize: 12,
      marginTop: 4,
    },
    expandIcon: {
      color: colors.muted_text,
      fontSize: 20,
      fontWeight: '600',
    },
    templateContent: {
      gap: 12,
    },
    assetsTitle: {
      color: colors.muted_text,
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
      backgroundColor: colors.button,
    },
    assetName: {
      color: colors.text,
      fontSize: 14,
      textTransform: 'capitalize',
    },
    templateActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    exportButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: colors.accent_bg,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    exportButtonText: {
      color: colors.accent_title,
      fontSize: 14,
      fontWeight: '500',
    },
    deleteButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: colors.danger_bg,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    deleteButtonText: {
      color: colors.error_text,
      fontSize: 14,
      fontWeight: '500',
    },
    errorText: {
      color: colors.error_text,
      fontSize: 16,
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: colors.button,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryText: {
      color: colors.button_text,
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
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      color: colors.muted_text,
      fontSize: 14,
      textAlign: 'center',
      paddingHorizontal: 32,
    },
  });
}
