import { getInfoPage, getInfoPageDocument, getInfoPageSummary } from '@char-gen/shared';
import { resolveInfoRuntimeScope } from '../../lib/info.js';
import DocumentPage from './DocumentPage';

export default function TermsPage() {
  const scope = resolveInfoRuntimeScope();
  const meta = getInfoPage('terms');

  return (
    <DocumentPage
      eyebrow={meta.eyebrow}
      title={meta.title}
      summary={getInfoPageSummary('terms', scope)}
      markdown={getInfoPageDocument('terms', scope)}
    />
  );
}
