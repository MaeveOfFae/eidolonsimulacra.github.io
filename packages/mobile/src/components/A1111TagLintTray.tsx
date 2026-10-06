import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ThemeColors } from '@char-gen/shared';
import { useTheme } from '../theme/ThemeProvider';
import { SparklesIcon } from './Icons';
import { applyA1111AssetFixes, lintA1111AssetForMobile, type A1111LintSummary } from '../lib/a1111-tag-lint';

/**
 * The Danbooru tag-lint section inside the a1111 asset tray. Loading and summarizing
 * live in `lib/a1111-tag-lint` (testable without React Native); this component owns
 * only the load-on-mount state and the render. Fixes are applied through the parent's
 * save handler so snapshots and approval fingerprints see the corrected content, same
 * as the web panel.
 */
type A1111TagLintTrayProps = {
  content: string;
  disabled?: boolean;
  onApplyFixes: (nextContent: string) => void | Promise<void>;
};

const MAX_VISIBLE_ISSUES = 5;

function buildStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 8,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerText: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    issue: {
      borderRadius: 10,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    issueError: {
      borderColor: colors.danger_bg,
      backgroundColor: colors.danger_bg,
    },
    issueWarning: {
      borderColor: colors.warning_text,
      backgroundColor: colors.surface,
    },
    issueTextError: {
      color: colors.error_text,
      fontSize: 12,
      lineHeight: 17,
    },
    issueTextWarning: {
      color: colors.warning_text,
      fontSize: 12,
      lineHeight: 17,
    },
    moreText: {
      color: colors.muted_text,
      fontSize: 12,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: colors.accent_bg,
      paddingVertical: 9,
    },
    actionDisabled: {
      opacity: 0.5,
    },
    actionText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '600',
    },
    loadingText: {
      color: colors.muted_text,
      fontSize: 12,
    },
  });
}

export default function A1111TagLintTray({ content, disabled = false, onApplyFixes }: A1111TagLintTrayProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const [summary, setSummary] = useState<A1111LintSummary | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSummary(null);
    lintA1111AssetForMobile(content)
      .then((result) => {
        if (!cancelled) {
          setSummary(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSummary(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [content]);

  const handleApply = async () => {
    if (!summary) {
      return;
    }
    setIsApplying(true);
    try {
      await onApplyFixes(applyA1111AssetFixes(content, summary.issues));
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <View style={styles.container} accessibilityLabel="Danbooru tag lint">
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>
          {summary ? summary.headline : 'Checking tags against the Danbooru index…'}
        </Text>
        {summary === null ? <ActivityIndicator size="small" color={colors.accent} /> : null}
      </View>

      {summary && summary.issues.length > 0
        ? summary.issues.slice(0, MAX_VISIBLE_ISSUES).map((issue, index) => (
            <View
              key={`${issue.code}-${issue.line}-${issue.column ?? 0}-${index}`}
              style={[styles.issue, issue.severity === 'error' ? styles.issueError : styles.issueWarning]}
            >
              <Text style={issue.severity === 'error' ? styles.issueTextError : styles.issueTextWarning}>
                {issue.line > 0 ? `L${issue.line} · ` : ''}
                {issue.message}
              </Text>
            </View>
          ))
        : null}

      {summary && summary.issues.length > MAX_VISIBLE_ISSUES ? (
        <Text style={styles.moreText}>+ {summary.issues.length - MAX_VISIBLE_ISSUES} more findings</Text>
      ) : null}

      {summary && summary.fixCount > 0 ? (
        <TouchableOpacity
          style={[styles.action, (disabled || isApplying) && styles.actionDisabled]}
          disabled={disabled || isApplying}
          activeOpacity={0.85}
          onPress={() => void handleApply()}
          accessibilityRole="button"
          accessibilityLabel={`Apply ${summary.fixCount} tag fixes`}
          accessibilityState={{ disabled: disabled || isApplying }}
        >
          {isApplying ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <SparklesIcon color={colors.accent} size={14} />
          )}
          <Text style={styles.actionText}>
            {isApplying ? 'Applying…' : `Apply ${summary.fixCount} fix${summary.fixCount === 1 ? '' : 'es'}`}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
