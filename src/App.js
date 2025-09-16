import logo from './logo.svg';
import './App.css';
import { Provider } from 'react-redux';
import { store } from './store/store';
import AuthPage from './pages/AuthPage/AuthPage';
import { Routes, Route, Navigate } from "react-router-dom";
import CalendarPage from './pages/CalendarPage/CalendarPage';
import ProtectedRoute from './ProtectedRoute';


function App() {
  return (
    <Provider store={store}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
          <Route path="/appointment" element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute> 
            } />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Provider>
  );
}

export default App;
