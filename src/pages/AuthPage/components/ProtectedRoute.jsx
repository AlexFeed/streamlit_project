import { Navigate } from 'react-router-dom';
import { getAuthToken } from '../../api/authStorage';

const ProtectedRoute = ({ children }) => {
    const token = getAuthToken();

    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    return children;
};

export default ProtectedRoute;