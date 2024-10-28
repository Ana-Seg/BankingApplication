import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import UserContext from '../context/UserContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useContext(UserContext);

    // Check if the user is logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If allowedRoles is provided, check if the user's role matches
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />; // Redirect to home or a safe route if unauthorized
    }

    return children; // Render the protected component if all checks pass
};

export default ProtectedRoute;




