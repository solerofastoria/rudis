import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // спиннер
  }

  return user ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;
