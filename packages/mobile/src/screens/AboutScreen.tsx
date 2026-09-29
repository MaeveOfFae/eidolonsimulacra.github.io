import { useMemo } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  aboutCrossLinks,
  aboutInfoCards,
  aboutWhatItDoes,
  buildAboutQuickFacts,
  buildAboutSummary,
  contactGuidance,
  getInfoPage,
  PROJECT_SUPPORT_URL,
  supportGuidance,
  type ThemeColors,
} from '@char-gen/shared';
import CollapsibleTray from '../components/CollapsibleTray';
import { BookOpenIcon, EnvelopeIcon, SparklesIcon } from '../components/Icons';
import { MOBILE_APP_VERSION } from '../lib/app-version';
import { mapWebRouteToMobileDestination, navigateToMobileDestination } from '../lib/route-targets';
import { useTheme } from '../theme/ThemeProvider';
import type { HomeStackNavigationProp } from '../types/navigation';

export default function AboutScreen() {
  const navigation = useNavigation<HomeStackNavigationProp<'About'>>();
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);

  const page = getInfoPage('about');
  const quickFacts = buildAboutQuickFacts({ scope: 'mobile', version: MOBILE_APP_VERSION });

  const navigateTo = (to: string) => {
    const destination = mapWebRouteToMobileDestination(to);
    if (destination) {
      navigateToMobileDestination(navigation, destination);
    }
  };

  const openExternal = (url: string) => {
    void Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <SparklesIcon color={colors.accent} size={28} />
        <Text style={styles.title}>{page.title}</Text>
      </View>
      <Text style={styles.summary}>{buildAboutSummary('mobile')}</Text>

      <CollapsibleTray title={aboutWhatItDoes.title} subtitle={aboutWhatItDoes.subtitle} initiallyExpanded>
        <View style={styles.paragraphList}>
          {aboutWhatItDoes.paragraphs.map((paragraph) => (
            <Text key={paragraph} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
      </CollapsibleTray>

      <CollapsibleTray title="Quick Facts" subtitle="Surface, workflow, storage, and version">
        <View style={styles.factList}>
          {quickFacts.map((fact) => (
            <View key={fact.label} style={styles.factRow}>
              <Text style={styles.factLabel}>{fact.label}</Text>
              <Text style={styles.factValue}>{fact.value}</Text>
            </View>
          ))}
        </View>
      </CollapsibleTray>

      <View style={styles.sectionHeader}>
        <BookOpenIcon color={colors.accent} size={20} />
        <Text style={styles.sectionTitle}>Info and Legal</Text>
      </View>

      <View style={styles.cardGrid}>
        {aboutInfoCards.map((card) => {
          const reachable = mapWebRouteToMobileDestination(card.to) !== null;

          return (
            <TouchableOpacity
              key={card.to}
              style={[styles.card, !reachable && styles.cardInactive]}
              onPress={() => navigateTo(card.to)}
              disabled={!reachable}
            >
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDescription}>{card.description}</Text>
              {!reachable ? <Text style={styles.cardNote}>Browser only ({card.to})</Text> : null}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.linkRow}>
        {aboutCrossLinks.map((link) => (
          <TouchableOpacity key={link.to} onPress={() => navigateTo(link.to)}>
            <Text style={styles.linkText}>{link.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <CollapsibleTray title="Contact" subtitle={contactGuidance.intro}>
        <Text style={styles.paragraph}>{contactGuidance.bugLine}</Text>
        <Text style={styles.paragraph}>{contactGuidance.securityLine}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => openExternal(contactGuidance.actionHref)}>
          <EnvelopeIcon color={colors.accent_title} size={18} />
          <Text style={styles.primaryButtonText}>{contactGuidance.actionLabel}</Text>
        </TouchableOpacity>
      </CollapsibleTray>

      <CollapsibleTray title="Support the Project" subtitle="Ko-fi backs blueprint and release upkeep">
        <View style={styles.paragraphList}>
          {supportGuidance.map((paragraph) => (
            <Text key={paragraph} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => openExternal(PROJECT_SUPPORT_URL)}>
          <Text style={styles.secondaryButtonText}>Open Ko-fi</Text>
        </TouchableOpacity>
      </CollapsibleTray>

      <Text style={styles.footerNote}>
        About, license, terms, privacy, security, and conduct content comes from the same shared source the browser app
        renders.
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
      paragraphList: {
        gap: 10,
      },
      paragraph: {
        color: colors.muted_text,
        fontSize: 13,
        lineHeight: 19,
      },
      factList: {
        gap: 12,
      },
      factRow: {
        gap: 3,
      },
      factLabel: {
        color: colors.text,
        fontSize: 13,
        fontWeight: '700',
      },
      factValue: {
        color: colors.muted_text,
        fontSize: 13,
        lineHeight: 19,
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
      cardGrid: {
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
      cardInactive: {
        opacity: 0.6,
      },
      cardTitle: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '700',
      },
      cardDescription: {
        color: colors.muted_text,
        fontSize: 13,
        lineHeight: 19,
      },
      cardNote: {
        color: colors.muted_text,
        fontSize: 11,
        fontStyle: 'italic',
      },
      linkRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
      },
      linkText: {
        color: colors.accent_title,
        fontSize: 13,
        fontWeight: '600',
      },
      primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.accent,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 11,
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
        paddingVertical: 11,
        alignItems: 'center',
      },
      secondaryButtonText: {
        color: colors.text,
        fontSize: 13,
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
