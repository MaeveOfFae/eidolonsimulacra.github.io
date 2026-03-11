import securityText from '../../../../../SECURITY.md?raw';
import DocumentPage from './DocumentPage';

export default function SecurityPage() {
  return (
    <DocumentPage
      eyebrow="Security"
      title="Security"
      summary="Security guidance, supported versions, and vulnerability reporting information."
      markdown={securityText}
    />
  );
}