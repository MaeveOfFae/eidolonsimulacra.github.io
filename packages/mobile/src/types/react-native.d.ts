// React 19 + React Native type compatibility fix
// See: https://github.com/facebook/react-native/issues/49217

import 'react';

declare module 'react' {
  // Override to allow the older refs property that React Native types expect
  interface Component<P = {}, S = {}, SS = any> {
    refs: {
      [key: string]: React.ReactInstance;
    };
  }
}
