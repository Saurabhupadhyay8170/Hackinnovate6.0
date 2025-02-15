import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Components/Layout/Layout.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Home from "./Pages/Home.jsx";
import Login from "./Pages/Login.jsx";
import TextEditor from "./Components/TextEditor/TextEditor.jsx";
import Room from "./Components/Room.jsx";
import Template from "./Pages/Template.jsx";
import NotFound from "./Pages/NotFound.jsx";
import ProtectedRoute from './middleware/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
        <Route path="/room/:roomId" element={<Room />} />
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
          <Route path="/template" element={<Template />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
