import { useMemo, type ReactElement } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  communityGuidance,
  communityInternalLinks,
  communityResources,
  getInfoPage,
  getInfoPageSummary,
  type ProjectResourceIcon,
  type ThemeColors,
} from '@char-gen/shared';
import CollapsibleTray from '../components/CollapsibleTray';
import { BookOpenIcon, ChatBubbleIcon, EnvelopeIcon, StarIcon, UsersIcon } from '../components/Icons';
import { mapWebRouteToMobileDestination, navigateToMobileDestination } from '../lib/route-targets';
import { useTheme } from '../theme/ThemeProvider';
import type { HomeStackNavigationProp } from '../types/navigation';

/** The shared resource list carries icon keys; mobile maps them to its own icons. */
const COMMUNITY_ICONS: Record<ProjectResourceIcon, (props: { color: string; size?: number }) => ReactElement> = {
  repository: BookOpenIcon,
  issues: ChatBubbleIcon,
  support: StarIcon,
  contact: EnvelopeIcon,
};

export default function CommunityScreen() {
  const navigation = useNavigation<HomeStackNavigationProp<'Community'>>();
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const page = getInfoPage('community');

  const openExternal = (url: string) => {
    void Linking.openURL(url);
  };

  const navigateTo = (to: string) => {
    const destination = mapWebRouteToMobileDestination(to);
    if (destination) {
      navigateToMobileDestination(navigation, destination);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <UsersIcon color={colors.accent} size={28} />
        <Text style={styles.title}>{page.title}</Text>
      </View>
      <Text style={styles.summary}>{getInfoPageSummary(page.id, 'mobile')}</Text>

      <CollapsibleTray title="What exists right now" subtitle="Confirmed public project spaces" initiallyExpanded>
        <View style={styles.cardList}>
          {communityResources.map((resource) => {
            const Icon = COMMUNITY_ICONS[resource.icon];

            return (
              <TouchableOpacity
                key={resource.id}
                style={styles.card}
                onPress={() => openExternal(resource.href)}
                accessibilityRole="link"
              >
                <View style={styles.cardHeader}>
                  <Icon color={colors.accent} size={20} />
                  <Text style={styles.cardTitle}>{resource.title}</Text>
                </View>
                <Text style={styles.cardDescription}>{resource.description}</Text>
                <Text style={styles.cardHint}>Opens in your browser</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </CollapsibleTray>

      <CollapsibleTray title="How to use those spaces" subtitle="Where each kind of report belongs">
        <View style={styles.paragraphList}>
          {communityGuidance.map((paragraph) => (
            <Text key={paragraph} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
      </CollapsibleTray>

      <CollapsibleTray title="Internal references" subtitle="The same pages the browser links to">
        <View style={styles.linkList}>
          {communityInternalLinks.map((link) => {
            const reachable = mapWebRouteToMobileDestination(link.to) !== null;

            return (
              <TouchableOpacity
                key={link.to}
                style={[styles.linkButton, !reachable && styles.linkButtonInactive]}
                onPress={() => navigateTo(link.to)}
                disabled={!reachable}
              >
                <Text style={[styles.linkText, !reachable && styles.linkTextInactive]}>{link.title}</Text>
                <Text style={styles.linkTarget}>{reachable ? 'Open' : link.to}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </CollapsibleTray>

      <Text style={styles.footerNote}>
        Project links and community copy come from the shared info module, so the mobile and browser pages stay in step.
      </Text>
    </ScrollView>
  );

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
      summary: {
        color: colors.muted_text,
        fontSize: 13,
        lineHeight: 19,
      },
      cardList: {
        gap: 10,
      },
      card: {
        backgroundColor: colors.window,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 14,
        gap: 6,
      },
      cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      },
      cardTitle: {
        flex: 1,
        color: colors.text,
        fontSize: 14,
        fontWeight: '700',
      },
      cardDescription: {
        color: colors.muted_text,
        fontSize: 13,
        lineHeight: 19,
      },
      cardHint: {
        color: colors.accent_title,
        fontSize: 11,
        fontWeight: '600',
      },
      paragraphList: {
        gap: 10,
      },
      paragraph: {
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
      footerNote: {
        color: colors.muted_text,
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
      },
    });
  }
}
