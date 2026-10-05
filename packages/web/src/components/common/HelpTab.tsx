import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, BookOpen, TriangleAlert, Loader2, MessageCircle, Send } from 'lucide-react';
import type { ChatMessage } from '@char-gen/shared';
import { api } from '@/lib/api';
import type { HelpTopic, PageHelpEntry } from '@/lib/help';
import { useAssistantContext } from './useAssistantContext';

interface HelpTabProps {
  pageHelp: PageHelpEntry | null;
  relatedTopics: HelpTopic[];
}

const screenTitles: Record<string, string> = {
  '/': 'Home',
  '/generate': 'Generate Character',
  '/seed-generator': 'Seed Generator',
  '/validation': 'Validation',
  '/optimize': 'Token Optimization',
  '/batch': 'Batch',
  '/drafts': 'Drafts',
  '/templates': 'Templates',
  '/blueprints': 'Blueprints',
  '/similarity': 'Compare Characters',
  '/offspring': 'Offspring Generator',
  '/lineage': 'Lineage',
  '/settings': 'Settings',
};

export default function HelpTab({ pageHelp, relatedTopics }: HelpTabProps) {
  const location = useLocation();
  const { screenContext: liveScreenContext } = useAssistantContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);

  const draftId = location.pathname.startsWith('/drafts/')
    ? decodeURIComponent(location.pathname.replace('/drafts/', '').split('/')[0] || '')
    : undefined;

  const screenContext = useMemo(() => {
    const matchedPath =
      Object.keys(screenTitles)
        .filter((path) => location.pathname === path || location.pathname.startsWith(`${path}/`))
        .sort((left, right) => right.length - left.length)[0] || location.pathname;

    return {
      screen_name: matchedPath.replace(/^\//, '') || 'home',
      screen_title: screenTitles[matchedPath] || matchedPath,
      route: location.pathname,
      draft_id: draftId || '',
      ...liveScreenContext,
    };
  }, [draftId, liveScreenContext, location.pathname]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const stream = api.chat({
        draft_id: draftId,
        messages: nextMessages,
        screen_context: screenContext,
      });

      let fullContent = '';
      stream.subscribe((event) => {
        if (event.event === 'chunk' && 'content' in event.data) {
          const data = event.data as { content: string };
          fullContent += data.content;
          setStreamingContent(fullContent);
        }
        if (event.event === 'complete') {
          setMessages((previous) => [...previous, { role: 'assistant', content: fullContent }]);
          setStreamingContent('');
          setIsStreaming(false);
        }
      });

      stream.onError_((error) => {
        setIsStreaming(false);
        setMessages((previous) => [...previous, { role: 'assistant', content: `Error: ${error}` }]);
      });

      await stream.start();
    } catch (error) {
      setIsStreaming(false);
      setMessages((previous) => [
        ...previous,
        { role: 'assistant', content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      ]);
    }
  };

  const handleStartAssistant = () => {
    setShowAssistant(true);
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `You're on ${screenContext.screen_title}. Ask for help with this screen, workflow steps, or content strategy.${draftId ? ' I can also use the current draft as context.' : ''}`,
        },
      ]);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable help content */}
      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {pageHelp ? (
          <>
            {/* Page Help Header */}
            <div className="px-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Contextual Help</p>
              <h3 className="mt-1 text-base font-semibold text-foreground">{pageHelp.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{pageHelp.summary}</p>
            </div>

            {/* Key Actions */}
            <section className="rounded-lg border border-border/70 bg-background/50 p-3">
              <div className="flex items-center gap-2 text-foreground">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <h4 className="text-xs font-semibold">What to do</h4>
              </div>
              <div className="mt-2 space-y-1.5">
                {pageHelp.keyActions.slice(0, 4).map((action) => (
                  <div key={action} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <div className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                    <p className="leading-5">{action}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Pitfalls */}
            {pageHelp.pitfalls.length > 0 && (
              <section className="rounded-lg border border-warning/30 bg-warning/10 p-3">
                <div className="flex items-center gap-2 text-foreground">
                  <TriangleAlert className="h-3.5 w-3.5 text-warning" />
                  <h4 className="text-xs font-semibold">Avoid</h4>
                </div>
                <div className="mt-2 space-y-1.5">
                  {pageHelp.pitfalls.slice(0, 3).map((pitfall) => (
                    <div key={pitfall} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <div className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-warning" />
                      <p className="leading-5">{pitfall}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Quick Links */}
            <section className="rounded-lg border border-border/70 bg-background/50 p-3">
              <h4 className="text-xs font-semibold text-foreground mb-2">Quick Links</h4>
              <div className="flex flex-wrap gap-1.5">
                <Link
                  to="/help"
                  className="inline-flex items-center gap-1.5 rounded border border-border/60 bg-card/70 px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  Help Center
                  <ArrowRight className="h-3 w-3" />
                </Link>
                {pageHelp.actions.slice(0, 2).map((action) => (
                  <Link
                    key={`${pageHelp.id}-${action.to}`}
                    to={action.to}
                    className="inline-flex items-center gap-1.5 rounded border border-border/60 bg-card/70 px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {action.label}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            </section>

            {/* Related Topics */}
            {relatedTopics.length > 0 && (
              <section className="space-y-2">
                <h4 className="px-1 text-xs font-semibold text-foreground">Related Topics</h4>
                {relatedTopics.slice(0, 2).map((topic) => (
                  <article key={topic.id} className="rounded-lg border border-border/70 bg-background/50 p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">{topic.category}</p>
                    <h5 className="mt-0.5 text-xs font-semibold text-foreground">{topic.title}</h5>
                    <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{topic.summary}</p>
                  </article>
                ))}
              </section>
            )}
          </>
        ) : (
          <div className="px-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Help</p>
            <p className="mt-2 text-sm text-muted-foreground">No contextual help available for this page.</p>
            <Link to="/help" className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
              Open Help Center
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {/* AI Assistant Section */}
      <div className="border-t border-border/60">
        {showAssistant ? (
          <div className="flex flex-col">
            {/* Assistant Header */}
            <button
              type="button"
              onClick={() => setShowAssistant(false)}
              className="flex items-center justify-between p-2 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">AI Assistant</span>
              </div>
              <span className="text-[10px]">Click to collapse</span>
            </button>

            {/* Messages */}
            <div className="max-h-48 space-y-2 overflow-y-auto px-2 pb-2">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`text-xs ${message.role === 'user' ? 'text-right' : ''}`}
                >
                  <div
                    className={`inline-block max-w-[85%] rounded-lg px-2 py-1.5 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {streamingContent && (
                <div className="text-xs">
                  <div className="inline-block max-w-[85%] rounded-lg bg-muted px-2 py-1.5">{streamingContent}</div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-2 pt-0">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="Ask for help..."
                  aria-label="Question"
                  className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={isStreaming}
                />
                <button
                  onClick={() => void handleSend()}
                  disabled={!input.trim() || isStreaming}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-2 py-1.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isStreaming ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                </button>
              </div>
              {draftId && <p className="mt-1 text-[10px] text-muted-foreground">Using draft context</p>}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartAssistant}
            className="flex w-full items-center gap-2 p-3 text-left text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium">Ask AI Assistant</div>
              <div className="text-[10px] truncate">{screenContext.screen_title}</div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
