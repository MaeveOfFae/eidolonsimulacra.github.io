import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import type { ThemePreset } from '@char-gen/shared';
import { useTheme } from '../theme/ThemeProvider';
import { buildThemeSwatches } from '../theme/theme';
import { SwatchIcon } from '../components/Icons';

export default function ThemePickerScreen() {
  const { preset, colors, themes, themeName, setThemeName } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <SwatchIcon color={colors.accent} size={28} />
        <Text style={[styles.title, { color: colors.text }]}>Themes</Text>
      </View>
      <Text style={[styles.subtitle, { color: colors.muted_text }]}>
        Pick a builtin theme. The app chrome retints immediately and the choice is stored on this device.
      </Text>

      <View style={[styles.currentCard, { backgroundColor: colors.accent_bg, borderColor: colors.accent }]}>
        <Text style={[styles.currentLabel, { color: colors.muted_text }]}>ACTIVE THEME</Text>
        <Text style={[styles.currentName, { color: colors.accent_title }]}>{preset.display_name}</Text>
        <Text style={[styles.currentDescription, { color: colors.muted_text }]}>{preset.description}</Text>
      </View>

      <View style={styles.themeList}>
        {themes.map((theme) => (
          <ThemeCard
            key={theme.name}
            theme={theme}
            isActive={theme.name === themeName}
            onSelect={() => setThemeName(theme.name)}
            accent={colors.accent}
            surface={colors.surface}
            border={colors.border}
            text={colors.text}
            mutedText={colors.muted_text}
            successText={colors.success_text}
            buttonText={colors.button_text}
          />
        ))}
      </View>

      <Text style={[styles.footerNote, { color: colors.muted_text }]}>
        Builtin themes are shared with the web and desktop apps. Creating and editing custom themes stays on the web
        Theme Studio.
      </Text>
    </ScrollView>
  );
}

function ThemeCard({
  theme,
  isActive,
  onSelect,
  accent,
  surface,
  border,
  text,
  mutedText,
  successText,
  buttonText,
}: {
  theme: ThemePreset;
  isActive: boolean;
  onSelect: () => void;
  accent: string;
  surface: string;
  border: string;
  text: string;
  mutedText: string;
  successText: string;
  buttonText: string;
}) {
  const swatches = buildThemeSwatches(theme.colors);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: surface, borderColor: isActive ? accent : border }]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <View style={styles.swatchStrip}>
          {swatches.map((swatch) => (
            <View key={swatch.label} style={[styles.swatch, { backgroundColor: swatch.color, borderColor: border }]} />
          ))}
        </View>
        {isActive ? (
          <View style={[styles.activeBadge, { backgroundColor: accent }]}>
            <Text style={[styles.activeBadgeText, { color: buttonText }]}>ACTIVE</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.cardTitle, { color: text }]}>{theme.display_name}</Text>
      <Text style={[styles.cardMeta, { color: mutedText }]}>
        {theme.name} • {theme.tags.join(', ')}
      </Text>
      <Text style={[styles.cardDescription, { color: mutedText }]} numberOfLines={2}>
        {theme.description}
      </Text>

      {isActive ? <Text style={[styles.activeHint, { color: successText }]}>Currently applied</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  currentCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  currentLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  currentName: {
    fontSize: 18,
    fontWeight: '700',
  },
  currentDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  themeList: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  swatchStrip: {
    flexDirection: 'row',
    gap: 6,
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
  },
  activeBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardMeta: {
    fontSize: 12,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  activeHint: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
