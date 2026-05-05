import {BrowserRouter, Routes, Route} from 'react-router-dom';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage.jsx';
import AuthPage from './pages/AuthPage';
import EditorPage from "./pages/EditorPage/EditorPage.jsx";
import ExtensionsPage from './pages/ExtensionsPage/ExtensionsPage.jsx';
import ProtectedRoute from "./pages/AuthPage/components/ProtectedRoute.jsx";
import { AuthProvider } from './contexts/AuthContext';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
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

                    {/*  Новый проект */}
                    <Route
                        path="/editor"
                        element={
                            <ProtectedRoute>
                                <EditorPage/>
                            </ProtectedRoute>
                        }
                    />
                    {/* Сохранённый проект из главной страницы */}
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
        </AuthProvider>
    );
}

export default App;