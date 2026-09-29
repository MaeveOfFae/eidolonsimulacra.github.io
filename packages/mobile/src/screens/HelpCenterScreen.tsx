import { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  guidedTours,
  helpTopics,
  type GuidedTour,
  type HelpActionLink,
  type HelpGuideStep,
  type HelpTopic,
  type ThemeColors,
} from '@char-gen/shared';
import CollapsibleTray from '../components/CollapsibleTray';
import { BookOpenIcon, ClockIcon, QuestionMarkCircleIcon } from '../components/Icons';
import {
  addCompletedTour,
  buildHelpCenterSummary,
  buildMobileGettingStartedSteps,
  buildTourMetaLabel,
  buildTourStepLabel,
  buildTourStepPreview,
  getNextIncompleteTour,
  getNextTourStepIndex,
  getPreviousTourStepIndex,
  groupHelpTopicsByCategory,
  isTourCompleted,
  mapHelpTarget,
} from '../lib/help';
import { navigateToMobileDestination, type MobileDestination } from '../lib/route-targets';
import { DEFAULT_HELP_STATE, getStoredDeviceConfig, updateStoredDeviceConfig } from '../storage/device-config';
import { useTheme } from '../theme/ThemeProvider';
import type { HomeStackNavigationProp } from '../types/navigation';

type CategoryFilter = 'All' | HelpTopic['category'];

export default function HelpCenterScreen() {
  const navigation = useNavigation<HomeStackNavigationProp<'HelpCenter'>>();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [activeTour, setActiveTour] = useState<GuidedTour | null>(null);
  const [activeTourStepIndex, setActiveTourStepIndex] = useState(0);

  const { data: config = getStoredDeviceConfig() } = useQuery({
    queryKey: ['device-config'],
    queryFn: async () => getStoredDeviceConfig(),
  });

  const helpState = config.help ?? DEFAULT_HELP_STATE;
  const completedTourIds = helpState.completed_tours ?? [];
  const completedTourCount = guidedTours.filter((tour) => isTourCompleted(tour.id, completedTourIds)).length;
  const nextIncompleteTour = getNextIncompleteTour(completedTourIds);
  const topicGroups = useMemo(() => groupHelpTopicsByCategory(helpTopics), []);
  const visibleTopicGroups = useMemo(
    () => (categoryFilter === 'All' ? topicGroups : topicGroups.filter((group) => group.category === categoryFilter)),
    [categoryFilter, topicGroups],
  );
  const guideSteps = useMemo(() => buildMobileGettingStartedSteps(), []);

  const handleOpenTarget = (to: string) => {
    const destination = mapHelpTarget(to);
    if (destination) {
      navigateToMobileDestination(navigation, destination);
    }
  };

  const handleStartTour = (tour: GuidedTour) => {
    setActiveTour(tour);
    setActiveTourStepIndex(0);
  };

  const handleCloseTour = () => {
    setActiveTour(null);
    setActiveTourStepIndex(0);
  };

  const handleCompleteTour = (tour: GuidedTour) => {
    const nextConfig = updateStoredDeviceConfig({
      help: {
        ...helpState,
        completed_tours: addCompletedTour(completedTourIds, tour.id),
      },
    });
    queryClient.setQueryData(['device-config'], nextConfig);
    handleCloseTour();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <QuestionMarkCircleIcon color={colors.accent} size={28} />
        <Text style={styles.title}>Help Center</Text>
      </View>
      <Text style={styles.subtitle}>
        The same guide, topics, and guided tours the web app shows, rendered from the shared help configuration.
      </Text>

      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>{buildHelpCenterSummary(completedTourIds)}</Text>
        <Text style={styles.progressText}>
          {nextIncompleteTour ? `Next up: ${nextIncompleteTour.title}` : 'Every current guided tour is complete.'}
        </Text>
        <Text style={styles.progressMeta}>
          {helpState.first_run_completed ? 'First-run checklist finished.' : 'First-run checklist still open on Home.'}
        </Text>
      </View>

      <CollapsibleTray
        title="Getting started"
        subtitle={`${guideSteps.length} steps from the shared starter guide`}
        preview={<Text style={styles.trayPreviewText}>Setup, templates, generation, review, export</Text>}
      >
        {guideSteps.map(({ step, destination }) => (
          <GuideStepCard
            key={step.id}
            step={step}
            destination={destination}
            onOpenTarget={handleOpenTarget}
            styles={styles}
          />
        ))}
      </CollapsibleTray>

      <View style={styles.sectionHeader}>
        <BookOpenIcon color={colors.accent} size={20} />
        <Text style={styles.sectionTitle}>Topics</Text>
        <Text style={styles.sectionMeta}>{`${helpTopics.length} topics`}</Text>
      </View>

      <View style={styles.filterRow}>
        {(['All', ...topicGroups.map((group) => group.category)] as CategoryFilter[]).map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.filterChip, categoryFilter === category && styles.filterChipActive]}
            onPress={() => setCategoryFilter(category)}
          >
            <Text style={[styles.filterChipText, categoryFilter === category && styles.filterChipTextActive]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {visibleTopicGroups.length === 0 ? (
        <Text style={styles.emptyText}>No topics match this category yet.</Text>
      ) : (
        visibleTopicGroups.map((group) => (
          <View key={group.category} style={styles.topicGroup}>
            <Text style={styles.topicGroupLabel}>{group.category}</Text>
            {group.topics.map((topic) => (
              <CollapsibleTray
                key={topic.id}
                title={topic.title}
                subtitle={topic.summary}
                preview={<Text style={styles.trayPreviewText}>{`${topic.bullets.length} points`}</Text>}
              >
                <View style={styles.bulletList}>
                  {topic.bullets.map((bullet) => (
                    <View key={bullet} style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
                <ActionLinkList actions={topic.actions} onOpenTarget={handleOpenTarget} styles={styles} />
              </CollapsibleTray>
            ))}
          </View>
        ))
      )}

      <View style={styles.sectionHeader}>
        <ClockIcon color={colors.accent} size={20} />
        <Text style={styles.sectionTitle}>Guided tours</Text>
        <Text style={styles.sectionMeta}>{`${completedTourCount}/${guidedTours.length} done`}</Text>
      </View>

      {guidedTours.map((tour) => {
        const completed = isTourCompleted(tour.id, completedTourIds);

        return (
          <CollapsibleTray
            key={tour.id}
            title={tour.title}
            subtitle={tour.summary}
            meta={
              <View style={[styles.tourBadge, completed && styles.tourBadgeCompleted]}>
                <Text style={[styles.tourBadgeText, completed && styles.tourBadgeTextCompleted]}>
                  {completed ? 'Done' : 'New'}
                </Text>
              </View>
            }
            preview={
              <Text style={styles.trayPreviewText}>
                {buildTourMetaLabel(tour)}
                {completed ? ' • completed' : ''}
              </Text>
            }
          >
            <Text style={styles.tourAudience}>{tour.audience}</Text>
            <Text style={styles.tourMeta}>{buildTourMetaLabel(tour)}</Text>
            <View style={styles.stepPreviewList}>
              {tour.steps.map((step, index) => (
                <Text key={step.id} style={styles.stepPreviewText}>
                  {buildTourStepPreview(index, step)}
                </Text>
              ))}
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={() => handleStartTour(tour)}>
              <Text style={styles.primaryButtonText}>{completed ? 'Restart tour' : 'Start tour'}</Text>
            </TouchableOpacity>
          </CollapsibleTray>
        );
      })}

      <Text style={styles.footerNote}>
        Link targets that only exist in the browser app are shown as plain text here, because mobile does not ship those
        pages yet.
      </Text>

      {activeTour ? (
        <TourRunnerModal
          tour={activeTour}
          stepIndex={activeTourStepIndex}
          styles={styles}
          colors={colors}
          onStepIndexChange={setActiveTourStepIndex}
          onOpenTarget={handleOpenTarget}
          onComplete={handleCompleteTour}
          onClose={handleCloseTour}
        />
      ) : null}
    </ScrollView>
  );
}

function GuideStepCard({
  step,
  destination,
  onOpenTarget,
  styles,
}: {
  step: HelpGuideStep;
  destination: MobileDestination | null;
  onOpenTarget: (to: string) => void;
  styles: ReturnType<typeof buildStyles>;
}) {
  return (
    <View style={styles.guideStepCard}>
      <Text style={styles.guideStepTitle}>{step.title}</Text>
      <Text style={styles.guideStepDescription}>{step.description}</Text>
      {destination ? (
        <TouchableOpacity style={styles.secondaryButton} onPress={() => onOpenTarget(step.to)}>
          <Text style={styles.secondaryButtonText}>{step.actionLabel}</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.inertActionText}>
          {step.actionLabel} — browser only ({step.to})
        </Text>
      )}
    </View>
  );
}

function ActionLinkList({
  actions,
  onOpenTarget,
  styles,
}: {
  actions: readonly HelpActionLink[];
  onOpenTarget: (to: string) => void;
  styles: ReturnType<typeof buildStyles>;
}) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <View style={styles.linkList}>
      {actions.map((action) => {
        const reachable = mapHelpTarget(action.to) !== null;

        return reachable ? (
          <TouchableOpacity
            key={`${action.label}:${action.to}`}
            style={styles.linkButton}
            onPress={() => onOpenTarget(action.to)}
          >
            <Text style={styles.linkText}>{action.label}</Text>
            <Text style={styles.linkTarget}>Open</Text>
          </TouchableOpacity>
        ) : (
          <View key={`${action.label}:${action.to}`} style={[styles.linkButton, styles.linkButtonInactive]}>
            <Text style={styles.linkTextInactive}>{action.label}</Text>
            <Text style={styles.linkTarget}>{action.to}</Text>
          </View>
        );
      })}
    </View>
  );
}

function TourRunnerModal({
  tour,
  stepIndex,
  styles,
  colors,
  onStepIndexChange,
  onOpenTarget,
  onComplete,
  onClose,
}: {
  tour: GuidedTour;
  stepIndex: number;
  styles: ReturnType<typeof buildStyles>;
  colors: ThemeColors;
  onStepIndexChange: (index: number) => void;
  onOpenTarget: (to: string) => void;
  onComplete: (tour: GuidedTour) => void;
  onClose: () => void;
}) {
  const step = tour.steps[stepIndex];
  const nextIndex = getNextTourStepIndex(stepIndex, tour);
  const previousIndex = getPreviousTourStepIndex(stepIndex);
  const stepDestination = step ? mapHelpTarget(step.to) : null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{tour.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.modalProgress}>{buildTourStepLabel(stepIndex, tour)}</Text>
          <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
            {step ? (
              <>
                <Text style={styles.modalStepTitle}>{step.title}</Text>
                <Text style={styles.modalRouteLabel}>{step.routeLabel}</Text>
                <Text style={styles.modalDescription}>{step.description}</Text>
                <View style={styles.bulletList}>
                  {step.bullets.map((bullet) => (
                    <View key={bullet} style={styles.bulletRow}>
                      <View style={[styles.bulletDot, { backgroundColor: colors.accent }]} />
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
                {stepDestination ? (
                  <TouchableOpacity style={styles.secondaryButton} onPress={() => onOpenTarget(step.to)}>
                    <Text style={styles.secondaryButtonText}>{`Open ${step.routeLabel}`}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.inertActionText}>
                    {step.routeLabel} lives in the browser app ({step.to}).
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.modalDescription}>This tour has no steps to walk through.</Text>
            )}
          </ScrollView>
          <View style={styles.modalFooter}>
            {previousIndex !== null ? (
              <TouchableOpacity style={styles.secondaryButton} onPress={() => onStepIndexChange(previousIndex)}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.buttonSpacer} />
            )}
            {nextIndex !== null ? (
              <TouchableOpacity style={styles.primaryButton} onPress={() => onStepIndexChange(nextIndex)}>
                <Text style={styles.primaryButtonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={() => onComplete(tour)}>
                <Text style={styles.primaryButtonText}>Mark tour complete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function buildStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      gap: 14,
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 19,
    },
    progressCard: {
      backgroundColor: colors.accent_bg,
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: 18,
      padding: 16,
      gap: 6,
    },
    progressLabel: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '700',
    },
    progressText: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 19,
    },
    progressMeta: {
      color: colors.muted_text,
      fontSize: 12,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 6,
    },
    sectionTitle: {
      flex: 1,
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    sectionMeta: {
      color: colors.muted_text,
      fontSize: 12,
      fontWeight: '600',
    },
    filterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    filterChip: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    filterChipActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accent_bg,
    },
    filterChipText: {
      color: colors.muted_text,
      fontSize: 12,
      fontWeight: '600',
    },
    filterChipTextActive: {
      color: colors.text,
    },
    topicGroup: {
      gap: 10,
    },
    topicGroupLabel: {
      color: colors.muted_text,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1.1,
      textTransform: 'uppercase',
    },
    trayPreviewText: {
      color: colors.muted_text,
      fontSize: 12,
    },
    guideStepCard: {
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      gap: 8,
    },
    guideStepTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    guideStepDescription: {
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 19,
    },
    bulletList: {
      gap: 8,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    bulletDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.accent,
      marginTop: 7,
    },
    bulletText: {
      flex: 1,
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 19,
    },
    linkList: {
      gap: 8,
    },
    linkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    linkButtonInactive: {
      opacity: 0.6,
    },
    linkText: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    linkTextInactive: {
      flex: 1,
      color: colors.muted_text,
      fontSize: 13,
      fontWeight: '600',
    },
    linkTarget: {
      color: colors.accent_title,
      fontSize: 11,
      fontWeight: '600',
    },
    inertActionText: {
      color: colors.muted_text,
      fontSize: 12,
      fontStyle: 'italic',
      lineHeight: 18,
    },
    tourBadge: {
      backgroundColor: colors.accent_bg,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    tourBadgeCompleted: {
      backgroundColor: colors.window,
    },
    tourBadgeText: {
      color: colors.accent_title,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    tourBadgeTextCompleted: {
      color: colors.muted_text,
    },
    tourAudience: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 19,
    },
    tourMeta: {
      color: colors.muted_text,
      fontSize: 12,
    },
    stepPreviewList: {
      gap: 4,
    },
    stepPreviewText: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 18,
    },
    primaryButton: {
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: colors.accent_title,
      fontSize: 13,
      fontWeight: '700',
    },
    secondaryButton: {
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: colors.window,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    buttonSpacer: {
      flex: 1,
    },
    emptyText: {
      color: colors.muted_text,
      fontSize: 13,
      textAlign: 'center',
    },
    footerNote: {
      color: colors.muted_text,
      fontSize: 12,
      textAlign: 'center',
      lineHeight: 18,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      justifyContent: 'center',
      padding: 18,
    },
    modalCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 10,
      maxHeight: '85%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    modalTitle: {
      flex: 1,
      color: colors.text,
      fontSize: 17,
      fontWeight: '700',
    },
    modalClose: {
      color: colors.accent_title,
      fontSize: 13,
      fontWeight: '600',
    },
    modalProgress: {
      color: colors.muted_text,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.6,
    },
    modalBody: {
      flexGrow: 0,
    },
    modalBodyContent: {
      gap: 10,
      paddingBottom: 4,
    },
    modalStepTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    modalRouteLabel: {
      color: colors.accent_title,
      fontSize: 12,
      fontWeight: '600',
    },
    modalDescription: {
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 19,
    },
    modalFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
  });
}
