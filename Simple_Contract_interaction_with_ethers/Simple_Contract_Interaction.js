


async function connectMetaMask (){

    if(typeof window.ethereum !== "undefined"){
        try
        {
            await ethereum.request({ method: "eth_requestAccounts" });
        }
        catch (error) {
            console.log(error);
        }
       
        document.getElementById("connectButton").innerHTML = "Connected";
        
        const accounts = await ethereum.request({ method: "eth_accounts" });
        console.log(accounts);
    }
    else {
        document.getElementById("connectButton").innerHTML ="Please install MetaMask";
      }
}



const contractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "updateNumber",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "number",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const contractAddress = "0x4E2d5c411A2B50e9D6477D6F1b90D85988D94f71";

async function callContract() {
    const provider = new ethers.providers.Web3Provider(window.ethereum); // get the connected node of any connected network
    const signer = provider.getSigner(); //this is going to get the connected account.
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    try 
        {        
            const num = await contract.number();
            console.log("The number before updation: ",num.toString());
        } 
        catch (error) {
            console.log("error will be: ",error);
        }

    try 
        {        
            await contract.updateNumber(5);
        } 
        catch (error) {
            console.log("error will be: ",error);
        }

        try 
        {        
            const num = await contract.number();
            console.log("The number after updation: ", num.toString());
        } 
        catch (error) {
            console.log("error will be: ",error);
        }
}

