import { Navigate } from "react-router-dom";
import { isTokenExpired } from "./utils/helper";

export default function ProtectedRoute({ children }) {
  const isLoggedIn = !isTokenExpired(); 
  console.log("isLoggedIn", isLoggedIn);
  

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
