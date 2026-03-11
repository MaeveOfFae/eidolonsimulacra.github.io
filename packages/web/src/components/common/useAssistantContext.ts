import { useContext, useEffect, useMemo, useRef } from 'react';

import { AssistantContext, type AssistantScreenContext } from './AssistantContext.shared';

export function useAssistantContext() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistantContext must be used within AssistantContextProvider');
  }
  return context;
}

export function useAssistantScreenContext(context: AssistantScreenContext) {
  const { setScreenContext, clearScreenContext } = useAssistantContext();
  const ownerIdRef = useRef(`screen-${Math.random().toString(36).slice(2)}`);
  const serializedContext = useMemo(() => JSON.stringify(context), [context]);
  const stableContext = useMemo<AssistantScreenContext>(
    () => JSON.parse(serializedContext) as AssistantScreenContext,
    [serializedContext]
  );

  useEffect(() => {
    const ownerId = ownerIdRef.current;
    setScreenContext(ownerId, stableContext, serializedContext);

    return () => {
      clearScreenContext(ownerId);
    };
  }, [clearScreenContext, serializedContext, setScreenContext, stableContext]);
}