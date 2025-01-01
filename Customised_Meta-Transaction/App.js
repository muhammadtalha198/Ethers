import "./App.css";
// import PermitComponent from "./PermitComponent";
import MetaTransactionComponent from "./MetaTransactionComponent";
import CustomizedPermit from "./CustomizedPermit";
import SellPermitComponent from "./SellPermitComponent";

function App() {
  return (
    <div className="App">
      {/* <PermitComponent /> */}
      <MetaTransactionComponent />
      <SellPermitComponent />
      <CustomizedPermit />
    </div>
  );
}

export default App;
