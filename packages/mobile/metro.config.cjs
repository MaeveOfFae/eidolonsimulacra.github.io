const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const gestureHandlerSpecShims = new Map([
  ['../specs/RNGestureHandlerRootViewNativeComponent', path.resolve(projectRoot, 'src/shims/rngh/RNGestureHandlerRootViewNativeComponent.ts')],
  ['../specs/RNGestureHandlerButtonNativeComponent', path.resolve(projectRoot, 'src/shims/rngh/RNGestureHandlerButtonNativeComponent.ts')],
  ['./specs/NativeRNGestureHandlerModule', path.resolve(projectRoot, 'src/shims/rngh/NativeRNGestureHandlerModule.ts')],
  ['./specs/NativeSafeAreaContext', path.resolve(projectRoot, 'src/shims/safe-area/NativeSafeAreaContext.ts')],
  ['./specs/NativeSafeAreaProvider', path.resolve(projectRoot, 'src/shims/safe-area/NativeSafeAreaProvider.ts')],
  ['./specs/NativeSafeAreaView', path.resolve(projectRoot, 'src/shims/safe-area/NativeSafeAreaView.ts')],
]);

const config = getDefaultConfig(projectRoot);

config.watchFolders = Array.from(new Set([...(config.watchFolders ?? []), workspaceRoot]));
config.resolver.nodeModulesPaths = Array.from(
  new Set([
    ...(config.resolver.nodeModulesPaths ?? []),
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
  ])
);
config.resolver.disableHierarchicalLookup = true;
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    context.originModulePath.includes('react-native-gesture-handler') ||
    context.originModulePath.includes('react-native-safe-area-context')
  ) {
    const shimPath = gestureHandlerSpecShims.get(moduleName);
    if (shimPath) {
      return {
        filePath: shimPath,
        type: 'sourceFile',
      };
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;