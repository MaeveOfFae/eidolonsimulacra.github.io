import appConfig from '../../app.json';

/**
 * The mobile build version, read from `app.json` so the About screen reports
 * what actually shipped instead of a hand-copied string. Web reports its own
 * `__APP_VERSION__` build constant through the same shared quick-facts builder.
 */
export const MOBILE_APP_VERSION: string = appConfig.expo.version;
