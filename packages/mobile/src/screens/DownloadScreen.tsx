import { useMemo } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  downloadChannels,
  downloadRepositoryUrl,
  formatArtifactFilename,
  getInfoPage,
  getInfoPageSummary,
  isAnyDownloadPublished,
  toAbsoluteDownloadUrl,
  unpublishedDownloadNotice,
  type DownloadChannel,
  type ThemeColors,
} from '@char-gen/shared';
import CollapsibleTray from '../components/CollapsibleTray';
import { SquareArrowDownIcon } from '../components/Icons';
import { MOBILE_APP_VERSION } from '../lib/app-version';
import { DOWNLOAD_SITE_ORIGIN } from '../lib/download-site';
import { useTheme } from '../theme/ThemeProvider';

export default function DownloadScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const page = getInfoPage('download');
  const anyPublished = isAnyDownloadPublished();

  const openExternal = (url: string) => {
    void Linking.openURL(url);
  };

  // Site-relative download paths mean nothing to a phone, so they are resolved
  // against the published site origin before handing them to the browser.
  const openDownload = (url: string) => {
    openExternal(toAbsoluteDownloadUrl(url, DOWNLOAD_SITE_ORIGIN));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <SquareArrowDownIcon color={colors.accent} size={28} />
        <Text style={styles.title}>{page.title}</Text>
      </View>
      <Text style={styles.summary}>{getInfoPageSummary('download', 'mobile')}</Text>

      {anyPublished ? null : <Text style={styles.notice}>{unpublishedDownloadNotice}</Text>}

      <Text style={styles.deviceNote}>
        This device is running the mobile build (v{MOBILE_APP_VERSION}). The channels below cover the other surfaces and
        the options for reinstalling.
      </Text>

      {downloadChannels.map((channel) => (
        <CollapsibleTray
          key={channel.id}
          title={channel.name}
          subtitle={channel.summary}
          meta={<Text style={styles.trayMetaText}>{channel.downloadUrl ? 'Available' : 'Not available yet'}</Text>}
          preview={<Text style={styles.trayPreviewText}>{channel.downloadUrl ? 'Available' : 'Coming soon'}</Text>}
        >
          <ChannelBody channel={channel} styles={styles} onOpenDownload={openDownload} />
        </CollapsibleTray>
      ))}

      <TouchableOpacity style={styles.secondaryButton} onPress={() => openExternal(downloadRepositoryUrl)}>
        <Text style={styles.secondaryButtonText}>Open the repository</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        Build details come from the same shared module the browser download page renders, so the two surfaces cannot
        describe the builds differently.
      </Text>
    </ScrollView>
  );
}

function ChannelBody({
  channel,
  styles,
  onOpenDownload,
}: {
  channel: DownloadChannel;
  styles: ReturnType<typeof buildStyles>;
  onOpenDownload: (url: string) => void;
}) {
  return (
    <>
      {channel.artifacts.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Artifacts</Text>
          {channel.artifacts.map((artifact) => (
            <View key={artifact.filename} style={styles.artifactRow}>
              <Text style={styles.artifactLabel}>{artifact.label}</Text>
              <Text style={styles.artifactFilename}>
                {formatArtifactFilename(artifact.filename, MOBILE_APP_VERSION)}
              </Text>
              <Text style={styles.artifactSize}>{artifact.approxSize}</Text>
              {artifact.downloadUrl ? (
                <TouchableOpacity onPress={() => onOpenDownload(artifact.downloadUrl as string)}>
                  <Text style={styles.artifactLink}>Download</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {channel.requirements.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Needs</Text>
          {channel.requirements.map((requirement) => (
            <View key={requirement} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{requirement}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {channel.notes.length > 0 ? (
        <View style={styles.block}>
          {channel.notes.map((note) => (
            <Text key={note} style={styles.noteText}>
              {note}
            </Text>
          ))}
        </View>
      ) : null}

      {channel.downloadUrl === null ? <Text style={styles.notice}>{unpublishedDownloadNotice}</Text> : null}

      {channel.downloadUrl ? (
        <TouchableOpacity style={styles.primaryButton} onPress={() => onOpenDownload(channel.downloadUrl as string)}>
          <Text style={styles.primaryButtonText}>Download {channel.name}</Text>
        </TouchableOpacity>
      ) : null}
    </>
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
    summary: {
      color: colors.muted_text,
      fontSize: 13,
      lineHeight: 19,
    },
    notice: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 19,
      backgroundColor: colors.accent_bg,
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: 12,
      padding: 12,
    },
    deviceNote: {
      color: colors.muted_text,
      fontSize: 12,
      lineHeight: 18,
    },
    trayMetaText: {
      color: colors.muted_text,
      fontSize: 11,
      fontWeight: '600',
    },
    trayPreviewText: {
      color: colors.muted_text,
      fontSize: 12,
    },
    block: {
      gap: 8,
    },
    blockTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    artifactRow: {
      gap: 2,
    },
    artifactLabel: {
      color: colors.text,
      fontSize: 13,
    },
    artifactFilename: {
      color: colors.accent_title,
      fontFamily: 'monospace',
      fontSize: 11,
    },
    artifactSize: {
      color: colors.muted_text,
      fontSize: 11,
    },
    artifactLink: {
      color: colors.accent_title,
      fontSize: 12,
      fontWeight: '700',
      marginTop: 2,
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
    noteText: {
      color: colors.muted_text,
      fontSize: 11,
      lineHeight: 17,
      fontStyle: 'italic',
    },
    primaryButton: {
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 11,
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
