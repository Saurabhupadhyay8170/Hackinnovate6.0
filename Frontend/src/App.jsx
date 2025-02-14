import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./Components/Layout/Layout.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Home from "./Pages/Home.jsx";
import Login from "./Pages/Login.jsx";

function App() {
  return (
    <div>
  
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="timeline" element={<Timeline />} />
          <Route path="about" element={<About />} />
          <Route path="events" element={<Event />} />
          <Route path="contact" element={<Contact />} />
          <Route path="eventdetails/:id" element={<EventDetails />} /> */}
        </Route>
      </Routes>
    </div>
  );
}

export default App;
