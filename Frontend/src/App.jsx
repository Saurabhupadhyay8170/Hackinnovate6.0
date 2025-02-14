import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./Components/Layout/Layout.jsx";
// import { Home } from "./Pages/Home.jsx";

function App() {
  return (
    <div>
  
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* <Route index element={<Home />} /> */}
          {/* <Route path="timeline" element={<Timeline />} />
          <Route path="texteditor" element={<TextEditor />} />
          <Route path="events" element={<Event />} />
          <Route path="contact" element={<Contact />} />
          <Route path="eventdetails/:id" element={<EventDetails />} /> */}
        </Route>
      </Routes>
    </div>
  );
}

export default App;
