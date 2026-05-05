import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Загрузка...</div>; // Или спиннер
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    return children;
};

export default ProtectedRoute;