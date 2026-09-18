// React 19 + React Native type compatibility fix
// See: https://github.com/facebook/react-native/issues/49217

import 'react';

declare module 'react' {
  // Keep legacy refs compatible with older React Native component instance types
  // without forcing every host component instance to define the property.
  interface Component {
    refs?: Record<string, React.ReactInstance>;
  }
}
