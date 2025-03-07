import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import AdminInterface from './components/AdminInterface';
import BaseInterface from './components/BaseInterface';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredType="admin">
                <AdminInterface />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/base/:baseId" 
            element={
              <ProtectedRoute requiredType="base">
                <BaseInterface />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;