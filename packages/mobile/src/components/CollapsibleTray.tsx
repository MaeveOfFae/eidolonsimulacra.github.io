import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  View,
  type ViewStyle,
  Text,
} from 'react-native';
import { ChevronDownIcon, ChevronUpIcon } from './Icons';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemeColors } from '@char-gen/shared';

type CollapsibleTrayProps = {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  preview?: ReactNode;
  children: ReactNode;
  initiallyExpanded?: boolean;
  expandedSignal?: string | number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

let layoutAnimationsEnabled = false;

function enableLayoutAnimations() {
  if (layoutAnimationsEnabled) {
    return;
  }

  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  layoutAnimationsEnabled = true;
}

function buildStyles(colors: ThemeColors) {
  return StyleSheet.create({
    tray: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 18,
      elevation: 3,
    },
    trayExpanded: {
      borderColor: colors.accent,
      backgroundColor: colors.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 14,
      paddingHorizontal: 16,
      paddingVertical: 15,
    },
    headerExpanded: {
      backgroundColor: colors.window,
    },
    headerText: {
      flex: 1,
      gap: 4,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 18,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    preview: {
      marginTop: 4,
    },
    chevronWrap: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.window,
      marginTop: 1,
    },
    chevronWrapExpanded: {
      borderColor: colors.accent,
      backgroundColor: colors.accent_bg,
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      gap: 12,
    },
    contentExpanded: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });
}

export default function CollapsibleTray({
  title,
  subtitle,
  meta,
  preview,
  children,
  initiallyExpanded = false,
  expandedSignal,
  style,
  contentStyle,
}: CollapsibleTrayProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(initiallyExpanded);

  useEffect(() => {
    enableLayoutAnimations();
  }, []);

  useEffect(() => {
    if (expandedSignal === undefined) {
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(true);
  }, [expandedSignal]);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((current) => !current);
  };

  return (
    <View style={[styles.tray, expanded && styles.trayExpanded, style]}>
      <TouchableOpacity
        style={[styles.header, expanded && styles.headerExpanded]}
        onPress={toggleExpanded}
        activeOpacity={0.88}
      >
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {meta ? <View style={styles.meta}>{meta}</View> : null}
          </View>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={expanded ? 2 : 1}>
              {subtitle}
            </Text>
          ) : null}
          {!expanded && preview ? <View style={styles.preview}>{preview}</View> : null}
        </View>
        <View style={[styles.chevronWrap, expanded && styles.chevronWrapExpanded]}>
          {expanded ? (
            <ChevronUpIcon color={colors.muted_text} size={18} />
          ) : (
            <ChevronDownIcon color={colors.muted_text} size={18} />
          )}
        </View>
      </TouchableOpacity>

      {expanded ? (
        <View style={[styles.content, expanded && styles.contentExpanded, contentStyle]}>{children}</View>
      ) : null}
    </View>
  );
}
