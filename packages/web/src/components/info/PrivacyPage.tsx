import { getInfoPage, getInfoPageDocument, getInfoPageSummary } from '@char-gen/shared';
import { resolveInfoRuntimeScope } from '../../lib/info.js';
import DocumentPage from './DocumentPage';

export default function PrivacyPage() {
  const scope = resolveInfoRuntimeScope();
  const meta = getInfoPage('privacy');

  return (
    <DocumentPage
      eyebrow={meta.eyebrow}
      title={meta.title}
      summary={getInfoPageSummary('privacy', scope)}
      markdown={getInfoPageDocument('privacy', scope)}
    />
  );
}
