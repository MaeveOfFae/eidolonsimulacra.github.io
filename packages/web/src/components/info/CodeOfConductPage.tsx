import { getInfoPage, getInfoPageDocument, getInfoPageSummary } from '@char-gen/shared';
import { resolveInfoRuntimeScope } from '../../lib/info.js';
import DocumentPage from './DocumentPage';

export default function CodeOfConductPage() {
  const scope = resolveInfoRuntimeScope();
  const meta = getInfoPage('code-of-conduct');

  return (
    <DocumentPage
      eyebrow={meta.eyebrow}
      title={meta.title}
      summary={getInfoPageSummary('code-of-conduct', scope)}
      markdown={getInfoPageDocument('code-of-conduct', scope)}
    />
  );
}
