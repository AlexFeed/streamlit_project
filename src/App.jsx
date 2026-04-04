import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage.jsx';
import AuthPage from './pages/AuthPage';
import DemoPage from './DemoPage';
import EditorPage from "./pages/EditorPage/EditorPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/demo" element={<DemoPage />} />
          <Route path="/editor" element={<EditorPage/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;