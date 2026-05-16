import { Navigate, Outlet } from "react-router-dom";

const GuestRoute = () => {
  const token = localStorage.getItem("userToken");
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

export default GuestRoute;
