import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import App from "./utils/script/Index.tsx";
// import Insta from "./utils/script/subfile/insta.tsx";
import "./utils/styles/index.css";
import App from './route.tsx'

// Function to update scaling factor
const updateScaling = () => {
  const baseWidth = 390;
  const baseHeight = 844;
  const scaleFactor = Math.min(window.innerWidth / baseWidth, window.innerHeight / baseHeight);
  
  document.documentElement.style.setProperty('--scale-factor', scaleFactor.toString());
};

// Initialize scaling and add resize listener
updateScaling();
window.addEventListener('resize', updateScaling);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </React.StrictMode>
);
