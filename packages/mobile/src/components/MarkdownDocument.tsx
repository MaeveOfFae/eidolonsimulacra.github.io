import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ThemeColors } from '@char-gen/shared';
import { parseMarkdown, type MarkdownBlock, type MarkdownInline } from '../lib/markdown';
import { useTheme } from '../theme/ThemeProvider';

/**
 * Renders a shared markdown document with the active theme.
 *
 * This is the mobile counterpart of web's `ReactMarkdown` + `markdownComponents`
 * pair: the block parsing lives in `src/lib/markdown.ts` (unit-tested), and this
 * component only maps blocks onto themed React Native primitives.
 */
export default function MarkdownDocument({ markdown }: { markdown: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const blocks = useMemo(() => parseMarkdown(markdown), [markdown]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {blocks.map((block, index) => (
        <MarkdownBlockView key={`${block.kind}-${index}`} block={block} styles={styles} />
      ))}
    </ScrollView>
  );
}

function InlineSpans({
  spans,
  styles,
  baseStyle,
}: {
  spans: readonly MarkdownInline[];
  styles: ReturnType<typeof buildStyles>;
  baseStyle: object;
}) {
  return (
    <Text style={baseStyle}>
      {spans.map((span, index) => {
        if (span.kind === 'strong') {
          return (
            <Text key={`${span.kind}-${index}`} style={styles.strong}>
              {span.text}
            </Text>
          );
        }

        if (span.kind === 'code') {
          return (
            <Text key={`${span.kind}-${index}`} style={styles.inlineCode}>
              {span.text}
            </Text>
          );
        }

        return <Text key={`${span.kind}-${index}`}>{span.text}</Text>;
      })}
    </Text>
  );
}

function MarkdownBlockView({ block, styles }: { block: MarkdownBlock; styles: ReturnType<typeof buildStyles> }) {
  switch (block.kind) {
    case 'heading': {
      const headingStyle = block.level === 1 ? styles.heading1 : block.level === 2 ? styles.heading2 : styles.heading3;
      return <InlineSpans spans={block.spans} styles={styles} baseStyle={headingStyle} />;
    }
    case 'paragraph':
      return <InlineSpans spans={block.spans} styles={styles} baseStyle={styles.paragraph} />;
    case 'quote':
      return (
        <View style={styles.quote}>
          <InlineSpans spans={block.spans} styles={styles} baseStyle={styles.quoteText} />
        </View>
      );
    case 'list':
      return (
        <View style={styles.list}>
          {block.items.map((item, index) => (
            <View key={`item-${index}`} style={styles.listItem}>
              <Text style={styles.listMarker}>{block.ordered ? `${index + 1}.` : '•'}</Text>
              <InlineSpans spans={item.spans} styles={styles} baseStyle={styles.listText} />
            </View>
          ))}
        </View>
      );
    case 'code':
      return (
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>{block.text}</Text>
        </View>
      );
    case 'rule':
      return <View style={styles.rule} />;
    case 'table':
      return (
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            {block.header.map((cell, index) => (
              <Text key={`head-${index}`} style={[styles.tableCell, styles.tableHeaderCell]}>
                {cell}
              </Text>
            ))}
          </View>
          {block.rows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.tableRow}>
              {block.header.map((_, cellIndex) => (
                <Text key={`cell-${rowIndex}-${cellIndex}`} style={styles.tableCell}>
                  {row[cellIndex] ?? ''}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );
    default:
      return null;
  }
}

function buildStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      gap: 12,
      paddingBottom: 40,
    },
    heading1: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '700',
    },
    heading2: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      marginTop: 6,
    },
    heading3: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
      marginTop: 4,
    },
    paragraph: {
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 20,
    },
    strong: {
      color: colors.text,
      fontWeight: '700',
    },
    inlineCode: {
      color: colors.accent_title,
      fontFamily: 'monospace',
      fontSize: 12,
    },
    quote: {
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
      backgroundColor: colors.window,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    quoteText: {
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 20,
      fontStyle: 'italic',
    },
    list: {
      gap: 6,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    listMarker: {
      color: colors.accent,
      fontSize: 13,
      fontWeight: '700',
      minWidth: 16,
    },
    listText: {
      flex: 1,
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 20,
    },
    codeBlock: {
      backgroundColor: colors.window,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
    },
    codeText: {
      color: colors.text,
      fontFamily: 'monospace',
      fontSize: 12,
      lineHeight: 18,
    },
    rule: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    table: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      overflow: 'hidden',
    },
    tableRow: {
      flexDirection: 'row',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    tableHeaderRow: {
      backgroundColor: colors.window,
      borderTopWidth: 0,
    },
    tableCell: {
      flex: 1,
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 18,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    tableHeaderCell: {
      color: colors.text,
      fontWeight: '700',
    },
  });
}
