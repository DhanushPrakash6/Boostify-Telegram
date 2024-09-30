import { Route, Routes } from "react-router-dom";
import Index from "./utils/pages/Index.tsx";
import Insta from "./utils/script/subfile/insta.tsx";

function App() {
  return (
    <Routes>
      <Route element={<Index />} path="/" />
      <Route element={<Insta />} path="/subfile/instagram" />
    </Routes>
  );
} 

export default App;
