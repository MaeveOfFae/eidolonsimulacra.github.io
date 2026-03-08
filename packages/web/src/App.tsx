import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Generation from './components/generation/Generation';
import Drafts from './components/drafts/Drafts';
import Review from './components/drafts/Review';
import Templates from './components/templates/Templates';
import Similarity from './components/similarity/Similarity';
import Offspring from './components/offspring/Offspring';
import Settings from './components/settings/Settings';
import BatchGenerate from './components/batch/BatchGenerate';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generate" element={<Generation />} />
        <Route path="/batch" element={<BatchGenerate />} />
        <Route path="/drafts" element={<Drafts />} />
        <Route path="/drafts/:id" element={<Review />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/similarity" element={<Similarity />} />
        <Route path="/offspring" element={<Offspring />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}
