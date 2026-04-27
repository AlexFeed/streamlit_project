import {BrowserRouter, Routes, Route} from 'react-router-dom';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage.jsx';
import AuthPage from './pages/AuthPage';
import DemoPage from './DemoPage';
import EditorPage from "./pages/EditorPage/EditorPage.jsx";
import ExtensionsPage from './pages/ExtensionsPage/ExtensionsPage.jsx';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<ProjectsPage/>}/>
                <Route path="/auth" element={<AuthPage/>}/>

                {/*  Новый проект */}
                <Route path="/editor" element={<EditorPage/>}/>
                {/* Сохранённый проект из главной страницы */}
                <Route path="/editor/:projectId" element={<EditorPage/>}/>

                <Route path="/extensions" element={<ExtensionsPage/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;