/**
 * Re-export shim over `@char-gen/shared`'s builtin themes module.
 *
 * The 27 builtin theme presets now live in shared so the mobile app reads the
 * same definitions instead of forking them. Theme authoring (Theme Studio /
 * Tokenizer) and custom-theme storage stay web-only by design.
 */

export { builtinTheme, builtinThemes } from '@char-gen/shared';
