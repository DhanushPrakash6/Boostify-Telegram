import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import App from "./utils/script/Index.tsx";
// import Insta from "./utils/script/subfile/insta.tsx";
import "./utils/styles/index.css";
import App from './route.tsx'

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </React.StrictMode>
);
