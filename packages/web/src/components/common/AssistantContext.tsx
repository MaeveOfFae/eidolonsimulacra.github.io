import { useCallback, useMemo, useState, type ReactNode } from 'react';

import {
  AssistantContext,
  type AssistantContextValue,
  type AssistantScreenContext,
} from './AssistantContext.shared';


interface AssistantContextState {
  ownerId: string | null;
  screenContext: AssistantScreenContext;
  serializedContext: string;
}

export function AssistantContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AssistantContextState>({
    ownerId: null,
    screenContext: {},
    serializedContext: '',
  });

  const setScreenContext = useCallback((ownerId: string, context: AssistantScreenContext, serializedContext: string) => {
    setState((previous) => {
      if (previous.ownerId === ownerId && previous.serializedContext === serializedContext) {
        return previous;
      }

      return {
        ownerId,
        screenContext: context,
        serializedContext,
      };
    });
  }, []);

  const clearScreenContext = useCallback((ownerId: string) => {
    setState((previous) => {
      if (previous.ownerId !== ownerId) {
        return previous;
      }

      if (previous.ownerId === null && previous.serializedContext === '') {
        return previous;
      }

      return {
        ownerId: null,
        screenContext: {},
        serializedContext: '',
      };
    });
  }, []);

  const value = useMemo<AssistantContextValue>(
    () => ({
      screenContext: state.screenContext,
      setScreenContext,
      clearScreenContext,
    }),
    [clearScreenContext, setScreenContext, state.screenContext]
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}