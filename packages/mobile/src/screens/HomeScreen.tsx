import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';
import CollapsibleTray from '../components/CollapsibleTray';
import {
  SparklesIcon,
  FolderIcon,
  StarIcon,
  DocumentTextIcon,
  GitCompareIcon,
  Cog6ToothIcon,
  BookOpenIcon,
} from '../components/Icons';
import { DEFAULT_HELP_STATE, getStoredDeviceConfig, updateStoredDeviceConfig } from '../storage/device-config';
import type { HomeScreenNavigationProp } from '../types/navigation';

type MobileGuideDestination = 'Generate' | 'Drafts' | 'Settings' | 'Templates';

interface MobileGettingStartedStep {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  destination: MobileGuideDestination;
}

const PROVIDER_GUIDE_STEP_ID = 'mobile-getting-started:provider';
const TEMPLATE_GUIDE_STEP_ID = 'mobile-getting-started:template';
const GENERATE_GUIDE_STEP_ID = 'mobile-getting-started:generate';
const REVIEW_GUIDE_STEP_ID = 'mobile-getting-started:review';

const MOBILE_GETTING_STARTED_STEPS: MobileGettingStartedStep[] = [
  {
    id: PROVIDER_GUIDE_STEP_ID,
    title: 'Set up provider access',
    description: 'Open Settings and save at least one provider key before you try the mobile generation flow.',
    actionLabel: 'Open Settings',
    destination: 'Settings',
  },
  {
    id: TEMPLATE_GUIDE_STEP_ID,
    title: 'Review the active template',
    description: 'Use Templates to confirm which assets the mobile app will generate and reopen later.',
    actionLabel: 'Open Templates',
    destination: 'Templates',
  },
  {
    id: GENERATE_GUIDE_STEP_ID,
    title: 'Generate a first draft',
    description: 'Create one saved draft so the review, export, and comparison flows have real data to work with.',
    actionLabel: 'Open Generate',
    destination: 'Generate',
  },
  {
    id: REVIEW_GUIDE_STEP_ID,
    title: 'Reopen a saved draft',
    description: 'Use Drafts to make sure you can find, reopen, and continue editing the work you want to keep.',
    actionLabel: 'Open Drafts',
    destination: 'Drafts',
  },
];

const MOBILE_GETTING_STARTED_STEP_ID_SET = new Set(MOBILE_GETTING_STARTED_STEPS.map((step) => step.id));

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const queryClient = useQueryClient();

  const { data: statsData } = useQuery({
    queryKey: ['drafts', 'stats'],
    queryFn: () => api.getDrafts(),
  });

  const { data: config = getStoredDeviceConfig() } = useQuery({
    queryKey: ['device-config'],
    queryFn: async () => getStoredDeviceConfig(),
  });

  const helpState = config.help ?? DEFAULT_HELP_STATE;
  const savedKeyCount = Object.values(config.api_keys ?? {}).filter(Boolean).length;
  const draftCount = statsData?.stats?.total_drafts ?? 0;
  const manualGuideIds = new Set(helpState.completed_guides ?? []);
  const completedGuideIds = new Set(manualGuideIds);

  if (savedKeyCount > 0) {
    completedGuideIds.add(PROVIDER_GUIDE_STEP_ID);
  }

  if (draftCount > 0) {
    completedGuideIds.add(GENERATE_GUIDE_STEP_ID);
  }

  const guideSteps = MOBILE_GETTING_STARTED_STEPS.map((step) => ({
    ...step,
    completed: completedGuideIds.has(step.id),
  }));
  const completedGuideStepCount = guideSteps.filter((step) => step.completed).length;
  const gettingStartedComplete = completedGuideStepCount === guideSteps.length;
  const nextIncompleteGuideStep = guideSteps.find((step) => !step.completed) ?? null;

  useEffect(() => {
    if (!gettingStartedComplete || helpState.first_run_completed) {
      return;
    }

    const nextConfig = updateStoredDeviceConfig({
      help: {
        ...helpState,
        first_run_completed: true,
      },
    });
    queryClient.setQueryData(['device-config'], nextConfig);
  }, [gettingStartedComplete, helpState, queryClient]);

  const persistGuideState = (nextGuideIds: string[], options?: { firstRunCompleted?: boolean }) => {
    const nextConfig = updateStoredDeviceConfig({
      help: {
        ...helpState,
        completed_guides: nextGuideIds,
        ...(options?.firstRunCompleted !== undefined ? { first_run_completed: options.firstRunCompleted } : {}),
      },
    });
    queryClient.setQueryData(['device-config'], nextConfig);
  };

  const handleMarkGuideStepDone = (stepId: string) => {
    const nextGuideIds = Array.from(new Set([...(helpState.completed_guides ?? []), stepId]));
    persistGuideState(nextGuideIds);
  };

  const handleResetGuide = () => {
    const nextGuideIds = (helpState.completed_guides ?? []).filter(
      (entry) => !MOBILE_GETTING_STARTED_STEP_ID_SET.has(entry),
    );
    persistGuideState(nextGuideIds, { firstRunCompleted: false });
  };

  const handleOpenGuideDestination = (destination: MobileGuideDestination) => {
    switch (destination) {
      case 'Generate':
        navigation.navigate('Generate');
        return;
      case 'Drafts':
        navigation.navigate('Drafts');
        return;
      case 'Settings':
        navigation.navigate('Settings');
        return;
      case 'Templates':
        navigation.navigate('Templates');
        return;
    }
  };

  const handleOpenPcLink = () => {
    navigation.navigate('Settings', {
      focusSection: 'pc-link',
      focusNonce: `${Date.now()}`,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Eidolon Simulacra</Text>
        <Text style={styles.subtitle}>Generate, refine, and manage drafts.</Text>
      </View>

      <CollapsibleTray
        title="Start Here"
        subtitle="A safe first-run path for mobile setup, generation, and review."
        initiallyExpanded={!helpState.first_run_completed}
        preview={
          <Text style={styles.trayPreviewText}>
            {nextIncompleteGuideStep
              ? `${completedGuideStepCount}/${guideSteps.length} complete • Next: ${nextIncompleteGuideStep.title}`
              : 'Guide complete • Revisit setup, templates, and drafts at any time'}
          </Text>
        }
        meta={
          <View style={styles.guideMetaChip}>
            <Text style={styles.guideMetaText}>
              {completedGuideStepCount}/{guideSteps.length}
            </Text>
          </View>
        }
      >
        <View style={styles.guideSummaryCard}>
          <Text style={styles.guideSummaryTitle}>
            {gettingStartedComplete ? 'First-run guide complete' : 'Finish the mobile basics before you go deeper'}
          </Text>
          <Text style={styles.guideSummaryBody}>
            {gettingStartedComplete
              ? 'You can rerun the checklist whenever you want a quick pass across setup, templates, generation, and review.'
              : 'This stays on-device and tracks the shortest path from provider setup to a saved draft you can reopen later.'}
          </Text>
          <TouchableOpacity style={styles.guideResetButton} onPress={handleResetGuide}>
            <Text style={styles.guideResetButtonText}>Reset guide</Text>
          </TouchableOpacity>
        </View>

        {guideSteps.map((step, index) => (
          <View key={step.id} style={[styles.guideStepCard, step.completed && styles.guideStepCardCompleted]}>
            <View style={styles.guideStepHeader}>
              <View style={styles.guideStepCopy}>
                <Text style={styles.guideStepEyebrow}>Step {index + 1}</Text>
                <Text style={styles.guideStepTitle}>{step.title}</Text>
                <Text style={styles.guideStepDescription}>{step.description}</Text>
              </View>
              <View
                style={[
                  styles.guideStatusBadge,
                  step.completed ? styles.guideStatusBadgeDone : styles.guideStatusBadgeOpen,
                ]}
              >
                <Text
                  style={[
                    styles.guideStatusBadgeText,
                    step.completed ? styles.guideStatusBadgeTextDone : styles.guideStatusBadgeTextOpen,
                  ]}
                >
                  {step.completed ? 'Done' : 'Open'}
                </Text>
              </View>
            </View>

            <View style={styles.guideStepActions}>
              <TouchableOpacity
                style={styles.guidePrimaryButton}
                onPress={() => handleOpenGuideDestination(step.destination)}
              >
                <Text style={styles.guidePrimaryButtonText}>{step.actionLabel}</Text>
              </TouchableOpacity>

              {!step.completed && (
                <TouchableOpacity style={styles.guideSecondaryButton} onPress={() => handleMarkGuideStepDone(step.id)}>
                  <Text style={styles.guideSecondaryButtonText}>Mark done</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </CollapsibleTray>

      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Generate')}>
          <SparklesIcon color="#7c3aed" size={32} />
          <Text style={styles.actionTitle}>Generate</Text>
          <Text style={styles.actionDesc}>New character</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Drafts')}>
          <FolderIcon color="#7c3aed" size={32} />
          <Text style={styles.actionTitle}>Drafts</Text>
          <Text style={styles.actionDesc}>Saved work</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.quickLinkCard} onPress={handleOpenPcLink}>
        <View style={styles.quickLinkIconWrap}>
          <Cog6ToothIcon color="#c4b5fd" size={24} />
        </View>
        <View style={styles.quickLinkCopy}>
          <Text style={styles.quickLinkTitle}>Open PC Link</Text>
          <Text style={styles.quickLinkDescription}>
            Jump straight into the live desktop pairing and manual transfer tray in Settings.
          </Text>
        </View>
        <Text style={styles.quickLinkAction}>Open</Text>
      </TouchableOpacity>

      <CollapsibleTray
        title="Tools"
        subtitle="Secondary generation flows"
        preview={<Text style={styles.trayPreviewText}>Seeds • Lorebook • Optimize • Batch • Validation</Text>}
      >
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('SeedGenerator')}>
            <SparklesIcon color="#7c3aed" size={32} />
            <Text style={styles.actionTitle}>Seed Generator</Text>
            <Text style={styles.actionDesc}>Spin concepts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Validation')}>
            <DocumentTextIcon color="#7c3aed" size={32} />
            <Text style={styles.actionTitle}>Validation</Text>
            <Text style={styles.actionDesc}>Check packs</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('TokenOptimization')}>
            <DocumentTextIcon color="#7c3aed" size={32} />
            <Text style={styles.actionTitle}>Token Optimization</Text>
            <Text style={styles.actionDesc}>Tighten wording</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Lineage')}>
            <GitCompareIcon color="#7c3aed" size={32} />
            <Text style={styles.actionTitle}>Lineage</Text>
            <Text style={styles.actionDesc}>Family tree</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Blueprints')}>
            <DocumentTextIcon color="#7c3aed" size={32} />
            <Text style={styles.actionTitle}>Blueprints</Text>
            <Text style={styles.actionDesc}>Templates</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('BatchGenerate')}>
            <FolderIcon color="#7c3aed" size={32} />
            <Text style={styles.actionTitle}>Batch Generate</Text>
            <Text style={styles.actionDesc}>Multiple seeds</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('LorebookGenerator')}>
            <BookOpenIcon color="#7c3aed" size={32} />
            <Text style={styles.actionTitle}>Lorebook</Text>
            <Text style={styles.actionDesc}>Shared canon</Text>
          </TouchableOpacity>
        </View>
      </CollapsibleTray>

      <CollapsibleTray
        title="Stats"
        subtitle="Current library snapshot"
        preview={
          <Text style={styles.trayPreviewText}>
            {statsData?.stats?.total_drafts ?? '--'} drafts • {statsData?.stats?.favorites ?? '--'} favorites
          </Text>
        }
      >
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statsData?.stats?.total_drafts ?? '--'}</Text>
            <Text style={styles.statLabel}>Simulacra</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statsData?.stats?.favorites ?? '--'}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {statsData?.stats?.by_genre ? Object.keys(statsData.stats.by_genre).length : '--'}
            </Text>
            <Text style={styles.statLabel}>Genres</Text>
          </View>
        </View>
      </CollapsibleTray>

      {statsData?.drafts && statsData.drafts.length > 0 && (
        <CollapsibleTray
          title="Recent"
          subtitle="Jump back into your latest drafts"
          initiallyExpanded
          preview={
            <Text style={styles.trayPreviewText}>
              {statsData.drafts[0]?.character_name || statsData.drafts[0]?.seed}
            </Text>
          }
        >
          {statsData.drafts.slice(0, 5).map((draft) => (
            <TouchableOpacity
              key={draft.review_id}
              style={styles.recentItem}
              onPress={() =>
                navigation.navigate('Drafts', {
                  screen: 'DraftDetail',
                  params: { draftId: draft.review_id },
                })
              }
            >
              <View style={styles.recentInfo}>
                <Text style={styles.recentName}>{draft.character_name || draft.seed}</Text>
                <Text style={styles.recentMeta}>
                  {draft.mode} • {draft.template_name || 'Default'}
                </Text>
              </View>
              {draft.favorite && <StarIcon color="#eab308" size={20} />}
            </TouchableOpacity>
          ))}
        </CollapsibleTray>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  trayPreviewText: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
  },
  guideMetaChip: {
    minWidth: 42,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#5b21b6',
    backgroundColor: '#2e1065',
    alignItems: 'center',
  },
  guideMetaText: {
    color: '#ddd6fe',
    fontSize: 11,
    fontWeight: '700',
  },
  guideSummaryCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#312e81',
    padding: 14,
    gap: 10,
  },
  guideSummaryTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  guideSummaryBody: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
  },
  guideResetButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#0f172a',
  },
  guideResetButtonText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
  },
  guideStepCard: {
    backgroundColor: '#171717',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2f2f2f',
    padding: 14,
    gap: 12,
  },
  guideStepCardCompleted: {
    borderColor: '#14532d',
    backgroundColor: '#111a14',
  },
  guideStepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  guideStepCopy: {
    flex: 1,
    gap: 4,
  },
  guideStepEyebrow: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  guideStepTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  guideStepDescription: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 20,
  },
  guideStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  guideStatusBadgeOpen: {
    borderColor: '#4b5563',
    backgroundColor: '#111827',
  },
  guideStatusBadgeDone: {
    borderColor: '#166534',
    backgroundColor: '#052e16',
  },
  guideStatusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  guideStatusBadgeTextOpen: {
    color: '#cbd5e1',
  },
  guideStatusBadgeTextDone: {
    color: '#bbf7d0',
  },
  guideStepActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  guidePrimaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#7c3aed',
  },
  guidePrimaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  guideSecondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: '#1f1f1f',
  },
  guideSecondaryButtonText: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '600',
  },
  toolsContainer: {
    marginBottom: 8,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  actionCardPlaceholder: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  quickLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#312e81',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  quickLinkIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#4c1d95',
  },
  quickLinkCopy: {
    flex: 1,
    gap: 4,
  },
  quickLinkTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  quickLinkDescription: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  quickLinkAction: {
    color: '#ddd6fe',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  recentContainer: {
    marginBottom: 24,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  recentMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
});
