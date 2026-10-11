import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ThemeColors } from '@char-gen/shared';
import { mapHelpTarget, resolveMobileScreenHelp, type MobileHelpScreen } from '../lib/help';
import { navigateToMobileDestination } from '../lib/route-targets';
import { useTheme } from '../theme/ThemeProvider';
import HelpSheet from './HelpSheet';
import { QuestionMarkCircleIcon } from './Icons';

interface HelpTooltipProps {
  /** The screen this trigger describes, from the navigators' own param lists. */
  screen: MobileHelpScreen;
  /** Visible text beside the icon, for callers with room for it. */
  label?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The touch counterpart of the web tooltip: a help trigger that opens this screen's page
 * help as a sheet.
 *
 * Three differences from the web version, all consequences of having no pointer:
 *
 *   - it is a **visible trigger** rather than a hover region, because nothing hovers;
 *   - the one-line summary web shows inside its tooltip travels as `accessibilityHint`
 *     instead, so a screen-reader user has it before opening anything;
 *   - it renders **nothing** on a screen with no help, rather than a button that opens
 *     an empty sheet. Which screens those are is recorded in `mobileScreenHelpIds`.
 *
 * It resolves its own navigation and its own entry, so wiring a screen is one element
 * with one prop rather than a callback plumbed through the screen's own types.
 */
export default function HelpTooltip({ screen, label, style }: HelpTooltipProps) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const [isOpen, setIsOpen] = useState(false);
  const entry = resolveMobileScreenHelp(screen);

  if (!entry) {
    return null;
  }

  const handleOpenTarget = (to: string) => {
    // Unreachable routes are rendered as inert text by the sheet, so nothing arrives
    // here that has no destination.
    const destination = mapHelpTarget(to);
    if (destination) {
      setIsOpen(false);
      navigateToMobileDestination(navigation, destination);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, style]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={label ? `${label} help` : `${entry.title} — open help`}
        accessibilityHint={entry.summary}
      >
        <QuestionMarkCircleIcon color={colors.accent_title} size={16} />
        {label ? <Text style={styles.triggerText}>{label}</Text> : null}
      </TouchableOpacity>

      <HelpSheet entry={entry} visible={isOpen} onClose={() => setIsOpen(false)} onOpenTarget={handleOpenTarget} />
    </>
  );
}

function buildStyles(colors: ThemeColors) {
  return StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
      alignSelf: 'flex-start',
    },
    triggerText: {
      color: colors.accent_title,
      fontSize: 12,
      fontWeight: '600',
    },
  });
}
