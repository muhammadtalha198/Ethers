import "./App.css";
// import PermitComponent from "./PermitComponent";
import MetaTransactionComponent from "./MetaTransactionComponent";
import CustomizedPermit from "./CustomizedPermit";
import BothTransaction from "./BothTransaction";

function App() {
  return (
    <div className="App">
      {/* <PermitComponent /> */}
      <MetaTransactionComponent />
      <CustomizedPermit />
    </div>
  );
}

export default App;
