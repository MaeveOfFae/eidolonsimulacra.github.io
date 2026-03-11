import licenseText from '../../../../../LICENSE?raw';
import DocumentPage from './DocumentPage';

export default function LicensePage() {
  return (
    <DocumentPage
      eyebrow="License"
      title="License"
      summary="This page mirrors the repository license shipped with the project."
      markdown={licenseText}
    />
  );
}