import { useState } from "react";

import "./App.css";
import Dashboard from "./Pages/Dashboard";
import YourDashboard from "./Pages/YourDashboarrd";
import ProtocolMatrices from "./Pages/ProtocolMatrices";

function App() {
  const [currentPage, setCurrentPage] = useState("main");

  return (
    <div className="App">
      {currentPage === "main" && <Dashboard setCurrentPage={setCurrentPage} />}
      {currentPage === "your" && (
        <YourDashboard setCurrentPage={setCurrentPage} />
      )}
      {currentPage === "protocol" && (
        <ProtocolMatrices setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}

export default App;
