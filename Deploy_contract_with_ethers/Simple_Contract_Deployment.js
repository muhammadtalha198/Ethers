


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



async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum); // get the connected node of any connected network
        const signer = provider.getSigner(); //this is going to get the connected account.

        const balance = await signer.getBalance();
        const convertIntoEth = 1e18;
        console.log("accounts balance will be: ", balance.toString()/convertIntoEth);
    }else {
        document.getElementById("getBalance").innerHTML ="Please install MetaMask";
    }

}



async function deployeeContract(){
    if (typeof window.ethereum !== "undefined") {
        
        const contractABI = [
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "senderAddress",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "MyEvent",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "deposit",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "emityEvent",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getBalance",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "incrementNumber",
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
        const contractByteCode = "6080604052600160005534801561001557600080fd5b5061023e806100256000396000f3fe60806040526004361061004a5760003560e01c806312065fe01461004f578063273ea3e31461007a5780633fa6d1ac146100915780638381f58a146100a8578063d0e30db0146100d3575b600080fd5b34801561005b57600080fd5b506100646100dd565b604051610071919061015e565b60405180910390f35b34801561008657600080fd5b5061008f6100e5565b005b34801561009d57600080fd5b506100a6610100565b005b3480156100b457600080fd5b506100bd610147565b6040516100ca919061015e565b60405180910390f35b6100db61014d565b005b600047905090565b60016000808282546100f79190610179565b92505081905550565b60633373ffffffffffffffffffffffffffffffffffffffff167fdf50c7bb3b25f812aedef81bc334454040e7b27e27de95a79451d663013b7e1760405160405180910390a3565b60005481565b565b610158816101cf565b82525050565b6000602082019050610173600083018461014f565b92915050565b6000610184826101cf565b915061018f836101cf565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff038211156101c4576101c36101d9565b5b828201905092915050565b6000819050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fdfea2646970667358221220eccc78974aba7d2d324c71cb57b05f2e22622f909b7ed3b60d58d010165be26f64736f6c63430008000033";

        const provider = new ethers.providers.Web3Provider(window.ethereum); // get the connected node of any connected network
        const signer = provider.getSigner(); //this is going to get the connected account.
        
        const factory = new ethers.ContractFactory(contractABI, contractByteCode, signer);
        const numberContract = await factory.deploy();

        const transactionReceipt = await numberContract.deployTransaction.wait();

        console.log("The transaction Receipt will be: ",transactionReceipt);


    }else {
        
        document.getElementById("getBalance").innerHTML ="Please install MetaMask";
    }
}

    const contractAddress = "0xB0227f57701E5274Bb0671894D313253B195A53D";

    const contractAbi = [
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "senderAddress",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "MyEvent",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "deposit",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "emityEvent",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getBalance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "incrementNumber",
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

    const provider = new ethers.providers.Web3Provider(window.ethereum); // get the connected node of any connected network
    const signer = provider.getSigner(); //this is going to get the connected account.
    const contract = new ethers.Contract(contractAddress, contractAbi, signer);
    
    
    async function getNumber(){
        if (typeof window.ethereum !== "undefined") {
           
            const number = await contract.number();
            console.log("the number is: ", number.toString());
        }else {
            
            document.getElementById("getBalance").innerHTML ="Please install MetaMask";
        }
    }
    
    async function incrementNumber(){
        if (typeof window.ethereum !== "undefined") {
            
            const txResponse = await contract.incrementNumber();
            await txResponse.wait();
        }else {
            
            document.getElementById("getBalance").innerHTML ="Please install MetaMask";
        }
    }

    async function emitEvent(){
        if (typeof window.ethereum !== "undefined") {
            
            const txResponse = await contract.emityEvent();
            const txRecepit = await txResponse.wait();
            console.log("The transaction Receipt will be: ", txRecepit);
            console.log("The event info is: ", txRecepit.events[0]);

        }else {
            
            document.getElementById("getBalance").innerHTML ="Please install MetaMask";
        }
    }
    
    async function listenEvent(){
        if (typeof window.ethereum !== "undefined") {
            
            const txResponse = await contract.emityEvent();
            const txRecepit = await txResponse.wait();
            console.log("The transaction Receipt will be: ", txRecepit);
            console.log("The event info is: ", txRecepit.events[0]);

        }else {
            
            document.getElementById("getBalance").innerHTML ="Please install MetaMask";
        }
    }

    

