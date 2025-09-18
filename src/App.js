import logo from './logo.svg';
import './App.sass';
import { Provider } from 'react-redux';
import { store } from './store/store';
import AuthPage from './pages/AuthPage/AuthPage';
import { Routes, Route, Navigate } from "react-router-dom";
import CalendarPage from './pages/CalendarPage/CalendarPage';
import ProtectedRoute from './ProtectedRoute';
import Layout from './Layout';


function App() {
  return (
    <Provider store={store}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/appointment" element={<CalendarPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Provider>
  );
}

export default App;
