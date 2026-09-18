import { type ReactNode, useEffect, useState } from 'react';
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

type CollapsibleTrayProps = {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  preview?: ReactNode;
  children: ReactNode;
  initiallyExpanded?: boolean;
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

export default function CollapsibleTray({
  title,
  subtitle,
  meta,
  preview,
  children,
  initiallyExpanded = false,
  style,
  contentStyle,
}: CollapsibleTrayProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  useEffect(() => {
    enableLayoutAnimations();
  }, []);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((current) => !current);
  };

  return (
    <View style={[styles.tray, expanded && styles.trayExpanded, style]}>
      <TouchableOpacity style={[styles.header, expanded && styles.headerExpanded]} onPress={toggleExpanded} activeOpacity={0.88}>
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
          {expanded ? <ChevronUpIcon color="#9ca3af" size={18} /> : <ChevronDownIcon color="#9ca3af" size={18} />}
        </View>
      </TouchableOpacity>

      {expanded ? <View style={[styles.content, expanded && styles.contentExpanded, contentStyle]}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    backgroundColor: '#141414',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3,
  },
  trayExpanded: {
    borderColor: '#4c1d95',
    backgroundColor: '#17161b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  headerExpanded: {
    backgroundColor: '#111217',
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
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    color: '#98a2b3',
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
    borderColor: '#2f2f2f',
    backgroundColor: '#1b1b1b',
    marginTop: 1,
  },
  chevronWrapExpanded: {
    borderColor: '#4c1d95',
    backgroundColor: '#241536',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  contentExpanded: {
    borderTopWidth: 1,
    borderTopColor: '#23252b',
  },
});