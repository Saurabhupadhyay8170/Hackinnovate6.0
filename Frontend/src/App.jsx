import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Components/Layout/Layout.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Home from "./Pages/Home.jsx";
import Login from "./Pages/Login.jsx";
import TextEditor from "./Components/TextEditor/TextEditor.jsx";
import NotFound from "./Pages/NotFound.jsx";
import ProtectedRoute from './middleware/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route 
            index 
            element={
              localStorage.getItem('user') && localStorage.getItem('token') 
                ? <Navigate to="/dashboard" replace /> 
                : <Home />
            } 
          />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/document/d/:documentId" element={
            <ProtectedRoute>
              <TextEditor />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
