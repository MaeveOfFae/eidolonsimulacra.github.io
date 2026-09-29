import { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type ChatMessage } from '@char-gen/shared';
import type { ThemeColors } from '@char-gen/shared';
import { api } from '../config/api';
import { ArrowLeftIcon, ChatBubbleIcon, PaperAirplaneIcon } from '../components/Icons';
import { useTheme } from '../theme/ThemeProvider';
import type { ChatRouteProp, DraftsStackNavigationProp } from '../types/navigation';

export default function ChatScreen() {
  const navigation = useNavigation<DraftsStackNavigationProp<'Chat'>>();
  const route = useRoute<ChatRouteProp>();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const { draftId, asset } = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { data: draft, isLoading } = useQuery({
    queryKey: ['draft', draftId],
    queryFn: () => api.getDraft(decodeURIComponent(draftId)),
    enabled: !!draftId,
  });

  useEffect(() => {
    if (draft) {
      // Initialize with a system context
      const contextMessage: ChatMessage = {
        role: 'system',
        content: `You are helping refine the character "${draft.metadata.character_name || draftId}". ${asset ? `Focus on the "${asset}" aspect.` : 'You can help with any aspect of the character.'}`,
      };
      setMessages([contextMessage]);
    }
  }, [draft, asset, draftId]);

  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputText.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsGenerating(true);

    try {
      const stream = api.chat({
        draft_id: draftId,
        messages: newMessages,
        context_asset: asset,
      });

      let assistantContent = '';
      stream.subscribe((event) => {
        if (event.event === 'chunk' && 'content' in event.data) {
          const data = event.data as { content: string };
          assistantContent += data.content;

          // Update the assistant message in place
          setMessages((prev) => {
            const updated = [...prev];
            // Check if last message is assistant, update it
            if (updated[updated.length - 1]?.role === 'assistant') {
              updated[updated.length - 1] = {
                role: 'assistant',
                content: assistantContent,
              };
            } else {
              // Add new assistant message
              updated.push({
                role: 'assistant',
                content: assistantContent,
              });
            }
            return updated;
          });
        }
      });

      stream.onError_((error) => {
        console.error('Chat error:', error);
        const message = assistantContent ? `Response interrupted: ${error}` : error;
        Alert.alert('Error', message);
        setIsGenerating(false);
      });

      stream.onComplete_(() => {
        setIsGenerating(false);
        // Refresh draft in case it was updated
        queryClient.invalidateQueries({ queryKey: ['draft', draftId] });
      });

      await stream.start();
    } catch (error) {
      console.error('Chat error:', error);
      Alert.alert('Error', 'Failed to send message');
      setIsGenerating(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    if (item.role === 'system') return null;

    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>{item.content}</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const visibleMessages = messages.filter((m) => m.role !== 'system');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color={colors.muted_text} size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ChatBubbleIcon color={colors.accent} size={20} />
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={1}>
              {draft?.metadata.character_name || 'Chat'}
            </Text>
            {asset && <Text style={styles.subtitle}>Refining: {asset.replace(/_/g, ' ')}</Text>}
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={visibleMessages}
        keyExtractor={(item, index) => `${item.role}-${index}`}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ChatBubbleIcon color={colors.muted_text} size={48} />
            <Text style={styles.emptyTitle}>Start a conversation</Text>
            <Text style={styles.emptyText}>Ask for changes, additions, or refinements to your character</Text>
          </View>
        }
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask for changes..."
          placeholderTextColor={colors.muted_text}
          multiline
          maxLength={1000}
          editable={!isGenerating}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isGenerating) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color={colors.button_text} />
          ) : (
            <PaperAirplaneIcon color={colors.button_text} size={20} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function buildStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 12,
    },
    headerContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    subtitle: {
      fontSize: 12,
      color: colors.muted_text,
    },
    messagesList: {
      padding: 16,
      paddingBottom: 8,
    },
    messageBubble: {
      maxWidth: '85%',
      padding: 12,
      borderRadius: 16,
      marginBottom: 12,
    },
    userBubble: {
      backgroundColor: colors.button,
      alignSelf: 'flex-end',
      borderBottomRightRadius: 4,
    },
    assistantBubble: {
      backgroundColor: colors.surface,
      alignSelf: 'flex-start',
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    messageText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
    },
    userMessageText: {
      color: colors.button_text,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      color: colors.muted_text,
      fontSize: 14,
      textAlign: 'center',
      paddingHorizontal: 32,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 12,
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    input: {
      flex: 1,
      backgroundColor: colors.window,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      color: colors.text,
      fontSize: 14,
      maxHeight: 100,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sendButton: {
      backgroundColor: colors.button,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: colors.border,
    },
  });
}
