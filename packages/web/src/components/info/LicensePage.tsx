import { getInfoPage, getInfoPageDocument, getInfoPageSummary } from '@char-gen/shared';
import { resolveInfoRuntimeScope } from '../../lib/info.js';
import DocumentPage from './DocumentPage';

export default function LicensePage() {
  const scope = resolveInfoRuntimeScope();
  const meta = getInfoPage('license');

  return (
    <DocumentPage
      eyebrow={meta.eyebrow}
      title={meta.title}
      summary={getInfoPageSummary('license', scope)}
      markdown={getInfoPageDocument('license', scope)}
    />
  );
}
