import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import TextSummarizer from './pages/TextSummarizer';
import UrlSummarizer from './pages/UrlSummarizer';
import PdfSummarizer from './pages/PdfSummarizer';
import History from './pages/History';
import SemanticSearch from './pages/SemanticSearch';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/text" element={<TextSummarizer />} />
        <Route path="/url" element={<UrlSummarizer />} />
        <Route path="/pdf" element={<PdfSummarizer />} />
        <Route path="/history" element={<History />} />
        <Route path="/search" element={<SemanticSearch />} />
      </Routes>
    </Layout>
  );
}
