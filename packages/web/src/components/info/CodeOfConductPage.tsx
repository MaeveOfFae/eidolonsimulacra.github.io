import conductText from '../../../../../CODE_OF_CONDUCT.md?raw';
import DocumentPage from './DocumentPage';

export default function CodeOfConductPage() {
  return (
    <DocumentPage
      eyebrow="Community"
      title="Code of Conduct"
      summary="Community participation standards and enforcement guidance for contributors and maintainers."
      markdown={conductText}
    />
  );
}