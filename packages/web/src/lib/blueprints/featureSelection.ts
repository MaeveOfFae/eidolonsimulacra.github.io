/**
 * Re-export shim over `@char-gen/shared`'s `blueprint-features` module.
 *
 * The selection rules now live in shared so mobile resolves the same feature
 * blueprint without forking the ranking logic a third time.
 */

export {
  flattenBlueprintList,
  getBlueprintsForFeature,
  resolveBlueprintForFeature,
  toBlueprintOptions,
} from '@char-gen/shared';
