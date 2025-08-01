import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lecturas from "./pages/Lecturas";
import Usuarios from "./pages/Usuarios";
import ConsumoTable from "./components/ConsumoTable";
import Navbar from "./pages/Navbar";
import HistorialLecturas from "./pages/HistorialLecturas";

function App() {
  return (
      <BrowserRouter>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/lecturas" element={<Lecturas />} />
            <Route path="/Historial Lecturas" element={<HistorialLecturas />}></Route>
            <Route path="/" element={<ConsumoTable />} />
          </Routes>
        </div>
      </BrowserRouter>
  );
}

export default App;
