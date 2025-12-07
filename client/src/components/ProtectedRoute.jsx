import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }) {
    const user = JSON.parse(localStorage.getItem('user'));

    // user na thakle login e redirect kore dite hobe
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // role na thakle dashboard e redirect kore dite hobe
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    // user & role thakle children show korbe
    return children;
}

export default ProtectedRoute;
