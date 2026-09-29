import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  getInfoPage,
  getInfoPageDocument,
  getInfoPageSummary,
  type MarkdownInfoPageId,
  type ThemeColors,
} from '@char-gen/shared';
import MarkdownDocument from '../components/MarkdownDocument';
import { useTheme } from '../theme/ThemeProvider';

/** Mobile always describes its own storage model, never the browser's. */
const MOBILE_SCOPE = 'mobile' as const;

export default function InfoDocumentScreen({ kind }: { kind: MarkdownInfoPageId }) {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const page = getInfoPage(kind);
  const summary = getInfoPageSummary(kind, MOBILE_SCOPE);
  const markdown = getInfoPageDocument(kind, MOBILE_SCOPE);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{page.eyebrow.toUpperCase()}</Text>
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.summary}>{summary}</Text>
      </View>
      <MarkdownDocument markdown={markdown} />
    </View>
  );
}

export function LicenseScreen() {
  return <InfoDocumentScreen kind="license" />;
}

export function TermsScreen() {
  return <InfoDocumentScreen kind="terms" />;
}

export function PrivacyScreen() {
  return <InfoDocumentScreen kind="privacy" />;
}

export function SecurityScreen() {
  return <InfoDocumentScreen kind="security" />;
}

export function CodeOfConductScreen() {
  return <InfoDocumentScreen kind="code-of-conduct" />;
}

function buildStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    hero: {
      paddingHorizontal: 16,
      paddingTop: 16,
      gap: 6,
    },
    eyebrow: {
      color: colors.accent_title,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
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
  });
}
