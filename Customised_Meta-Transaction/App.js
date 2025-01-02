import "./App.css";
// import PermitComponent from "./PermitComponent";
import MetaTransactionComponent from "./MetaTransactionComponent";
import CustomizedPermit from "./CustomizedPermit";
import SellPermitComponent from "./SellPermitComponent";
import AllInOne from "./AllInOne";

function App() {
  return (
    <div className="App">
      {/* <PermitComponent /> */}
      <AllInOne />
      <MetaTransactionComponent />
      <SellPermitComponent />
      <CustomizedPermit />
    </div>
  );
}

export default App;
