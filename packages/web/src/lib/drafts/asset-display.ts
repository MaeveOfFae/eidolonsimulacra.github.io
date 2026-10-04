/**
 * Display helpers shared by the review screen and its asset cards.
 *
 * `formatAssetLabel` was a module-local helper in `Review.tsx` used in three
 * places (the merge summary, the pre-edit safeguard snapshot label, and the asset
 * cards), so the cards slice needs it from somewhere both can import — hence this
 * module rather than a copy inside `ReviewAssetCards`.
 */
export function formatAssetLabel(assetName: string): string {
  return assetName.replace(/_/g, ' ');
}
