import { Navigate } from 'react-router-dom';
import useAuth from '../../../shared/hooks/useAuth.js';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated()) {
        return <Navigate to="/auth" replace />;
    }

    return children;
};

export default ProtectedRoute;