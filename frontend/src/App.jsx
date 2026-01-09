import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { OddsCalculator } from './pages/OddsCalculator';
import { Settlement } from './pages/Settlement';
import { SessionTracker } from './pages/SessionTracker';
import { SessionHistory } from './pages/SessionHistory';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/odds" element={<OddsCalculator />} />
          <Route path="/settle" element={<Settlement />} />
          <Route path="/session" element={<SessionTracker />} />
          <Route path="/history" element={<SessionHistory />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
