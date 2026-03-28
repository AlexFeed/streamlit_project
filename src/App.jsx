import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProjectsPage from './pages/ProjectsPage';
import AuthPage from './pages/AuthPage';
import DemoPage from './DemoPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/demo" element={<DemoPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;