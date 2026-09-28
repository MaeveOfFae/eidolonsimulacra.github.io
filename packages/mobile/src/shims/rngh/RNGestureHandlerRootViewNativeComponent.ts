import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NativeProps extends ViewProps {}

export default codegenNativeComponent<NativeProps>('RNGestureHandlerRootView');
