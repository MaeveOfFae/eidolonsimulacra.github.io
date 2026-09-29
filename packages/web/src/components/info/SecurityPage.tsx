import { getInfoPage, getInfoPageDocument, getInfoPageSummary } from '@char-gen/shared';
import { resolveInfoRuntimeScope } from '../../lib/info.js';
import DocumentPage from './DocumentPage';

export default function SecurityPage() {
  const scope = resolveInfoRuntimeScope();
  const meta = getInfoPage('security');

  return (
    <DocumentPage
      eyebrow={meta.eyebrow}
      title={meta.title}
      summary={getInfoPageSummary('security', scope)}
      markdown={getInfoPageDocument('security', scope)}
    />
  );
}
