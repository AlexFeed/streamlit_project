import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { Toaster } from 'sonner';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage.jsx';
import AuthPage from './pages/AuthPage';
import EditorPage from "./pages/EditorPage/EditorPage.jsx";
import ExtensionsPage from './pages/ExtensionsPage/ExtensionsPage.jsx';
import ProtectedRoute from "./pages/AuthPage/components/ProtectedRoute.jsx";
import { ThemeProvider } from './shared/theme/ThemeContext.jsx';
import { I18nProvider } from './shared/translation/I18nContext.jsx';
import useTheme from './shared/useTheme.js';

function AppContent() {
    const { theme } = useTheme();

    return (
        <BrowserRouter>
            <Toaster theme={theme} position="bottom-right" richColors closeButton />
            <Routes>
                <Route path="/auth" element={<AuthPage/>}/>

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <ProjectsPage/>
                        </ProtectedRoute>
                    }
                />

                {/* New project route */}
                <Route
                    path="/editor"
                    element={
                        <ProtectedRoute>
                            <EditorPage/>
                        </ProtectedRoute>
                    }
                />
                {/* Saved project opened from the projects page */}
                <Route
                    path="/editor/:projectId"
                    element={
                        <ProtectedRoute>
                            <EditorPage/>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/extensions"
                    element={
                        <ProtectedRoute>
                            <ExtensionsPage/>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

function App() {
    return (
        <ThemeProvider>
            <I18nProvider>
                <AppContent />
            </I18nProvider>
        </ThemeProvider>
    );
}

export default App;